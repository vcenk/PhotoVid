-- User Credits table: Track credit balances
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  balance INTEGER DEFAULT 100,           -- Starting credits
  lifetime_used INTEGER DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit Transactions table: Track all credit changes
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL,               -- Positive: add, Negative: deduct
  type TEXT NOT NULL,                    -- 'purchase', 'generation', 'refund', 'bonus', 'subscription'
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON credit_transactions(created_at DESC);

-- Auto-create credits for new users via trigger
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (NEW.id, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_credits();

-- Row Level Security for user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can update (for credit purchases/deductions via edge functions)
CREATE POLICY "Service can update credits" ON user_credits
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Service can insert credits" ON user_credits
  FOR INSERT WITH CHECK (true);

-- Row Level Security for credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own transactions
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can insert transactions
CREATE POLICY "Service can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (true);

-- Function to deduct credits atomically
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_tool TEXT,
  p_generation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance with lock
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Check if enough credits
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE user_credits
  SET
    balance = balance - p_amount,
    lifetime_used = lifetime_used + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, generation_id, description)
  VALUES (p_user_id, -p_amount, 'generation', p_generation_id, p_tool || ' generation');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits (for purchases)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update or insert credits
  INSERT INTO user_credits (user_id, balance, lifetime_purchased)
  VALUES (p_user_id, p_amount, CASE WHEN p_type = 'purchase' THEN p_amount ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE
  SET
    balance = user_credits.balance + p_amount,
    lifetime_purchased = user_credits.lifetime_purchased + CASE WHEN p_type = 'purchase' THEN p_amount ELSE 0 END,
    updated_at = NOW();

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type, COALESCE(p_description, p_type || ' - ' || p_amount || ' credits'));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
