-- ============================================
-- ADD ADMIN ROLE SUPPORT
-- ============================================
-- Adds is_admin flag to profiles and updates
-- credit functions to bypass for admins
-- ============================================

-- ============================================
-- 1. ADD is_admin COLUMN TO PROFILES
-- ============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. UPDATE deduct_credits TO BYPASS FOR ADMINS
-- ============================================
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_tool TEXT,
  p_generation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  user_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT is_admin INTO user_is_admin
  FROM profiles
  WHERE id = p_user_id;

  -- If admin, skip deduction but still log
  IF user_is_admin = TRUE THEN
    -- Record transaction with 0 cost (admin bypass)
    INSERT INTO credit_transactions (user_id, amount, type, generation_id, description)
    VALUES (p_user_id, 0, 'generation', p_generation_id, p_tool || ' generation (admin - free)');
    RETURN TRUE;
  END IF;

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

-- ============================================
-- 3. FUNCTION TO CHECK IF USER IS ADMIN
-- ============================================
CREATE OR REPLACE FUNCTION is_user_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_status BOOLEAN;
BEGIN
  SELECT is_admin INTO admin_status
  FROM profiles
  WHERE id = p_user_id;

  RETURN COALESCE(admin_status, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. FUNCTION TO SET USER AS ADMIN (by email)
-- ============================================
CREATE OR REPLACE FUNCTION set_user_admin(p_email TEXT, p_is_admin BOOLEAN DEFAULT TRUE)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = p_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', p_email;
  END IF;

  -- Update admin status
  UPDATE profiles
  SET is_admin = p_is_admin, updated_at = NOW()
  WHERE id = target_user_id;

  -- Give admin unlimited credits (set to 999999)
  IF p_is_admin THEN
    UPDATE user_credits
    SET balance = 999999, updated_at = NOW()
    WHERE user_id = target_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. SET cenkkarakuz@gmail.com AS ADMIN
-- ============================================
SELECT set_user_admin('cenkkarakuz@gmail.com', TRUE);

-- ============================================
-- DONE
-- ============================================
