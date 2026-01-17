-- ============================================
-- ENSURE ALL TABLES EXIST MIGRATION
-- ============================================
-- This migration ensures all required tables exist
-- and have proper structure. Safe to run multiple times.
-- ============================================

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  mode TEXT DEFAULT 'wizard',
  workflow_data JSONB,
  thumbnail_url TEXT,
  industry_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_created ON assets(created_at DESC);
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. GENERATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  tool TEXT,
  model TEXT,
  input JSONB NOT NULL,
  output JSONB,
  credits_used INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',
  fal_request_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at DESC);
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. USER_CREDITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 10,
  lifetime_used INTEGER DEFAULT 0,
  lifetime_purchased INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREDIT_TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON credit_transactions(created_at DESC);
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. STORYBOARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Untitled Storyboard',
  property_data JSONB DEFAULT '{}',
  scenes JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{"aspectRatio": "16:9", "musicVolume": 50, "transitionDuration": 500, "includeIntro": true, "includeOutro": true, "watermark": false, "outputQuality": "1080p"}',
  total_duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  output_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storyboards_user ON storyboards(user_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_project ON storyboards(project_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_status ON storyboards(status);
ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES (READ-ONLY FOR FRONTEND)
-- ============================================
-- Drop existing policies first to avoid conflicts
DO $$ BEGIN
  -- Projects
  DROP POLICY IF EXISTS "Users can view own projects" ON projects;
  DROP POLICY IF EXISTS "Users can view own projects (read-only)" ON projects;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  -- Assets
  DROP POLICY IF EXISTS "Users can view own assets" ON assets;
  DROP POLICY IF EXISTS "Users can view own assets (read-only)" ON assets;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  -- Generations
  DROP POLICY IF EXISTS "Users can view own generations" ON generations;
  DROP POLICY IF EXISTS "Users can view own generations (read-only)" ON generations;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  -- User Credits
  DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
  DROP POLICY IF EXISTS "Users can view own credits (read-only)" ON user_credits;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  -- Credit Transactions
  DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
  DROP POLICY IF EXISTS "Users can view own transactions (read-only)" ON credit_transactions;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  -- Storyboards
  DROP POLICY IF EXISTS "Users can view own storyboards" ON storyboards;
  DROP POLICY IF EXISTS "Users can view own storyboards (read-only)" ON storyboards;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Create read-only policies (writes go through Edge Functions)
CREATE POLICY "Users can view own projects (read-only)" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assets (read-only)" ON assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generations (read-only)" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own credits (read-only)" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions (read-only)" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own storyboards (read-only)" ON storyboards
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 8. TRIGGER FOR AUTO-CREATING USER CREDITS
-- ============================================
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime_used, lifetime_purchased)
  VALUES (NEW.id, 10, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_credits();

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================
-- Deduct credits atomically
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
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  UPDATE user_credits
  SET
    balance = balance - p_amount,
    lifetime_used = lifetime_used + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  INSERT INTO credit_transactions (user_id, amount, type, generation_id, description)
  VALUES (p_user_id, -p_amount, 'generation', p_generation_id, p_tool || ' generation');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits (for purchases)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime_purchased)
  VALUES (p_user_id, p_amount, CASE WHEN p_type = 'purchase' THEN p_amount ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE
  SET
    balance = user_credits.balance + p_amount,
    lifetime_purchased = user_credits.lifetime_purchased + CASE WHEN p_type = 'purchase' THEN p_amount ELSE 0 END,
    updated_at = NOW();

  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type, COALESCE(p_description, p_type || ' - ' || p_amount || ' credits'));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE
-- ============================================
