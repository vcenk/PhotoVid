-- ============================================
-- SECURE RLS POLICIES MIGRATION
-- ============================================
-- Following backend-first security architecture:
-- - Frontend can only READ data (SELECT)
-- - All writes go through Edge Functions (service role)
-- - No permissive policies (USING true)
-- ============================================

-- ============================================
-- 1. USER_CREDITS TABLE - LOCK DOWN WRITES
-- ============================================

-- Drop ALL existing policies on user_credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Service can update credits" ON user_credits;
DROP POLICY IF EXISTS "Service can insert credits" ON user_credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;

-- Enable RLS (should already be enabled, but ensure it is)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Only allow SELECT for authenticated users (their own data only)
-- NO INSERT/UPDATE/DELETE policies = frontend cannot write
CREATE POLICY "Users can view own credits (read-only)"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Service role (used by Edge Functions) bypasses RLS entirely
-- So Edge Functions can still INSERT/UPDATE/DELETE

-- ============================================
-- 2. CREDIT_TRANSACTIONS TABLE - LOCK DOWN WRITES
-- ============================================

DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Service can insert transactions" ON credit_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Only SELECT allowed from frontend
CREATE POLICY "Users can view own transactions (read-only)"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 3. PROJECTS TABLE - LOCK DOWN WRITES
-- ============================================

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Only SELECT allowed from frontend
CREATE POLICY "Users can view own projects (read-only)"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 4. ASSETS TABLE - LOCK DOWN WRITES
-- ============================================

DROP POLICY IF EXISTS "Users can view own assets" ON assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON assets;
DROP POLICY IF EXISTS "Users can update own assets" ON assets;

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Only SELECT allowed from frontend
CREATE POLICY "Users can view own assets (read-only)"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 5. STORYBOARDS TABLE - LOCK DOWN WRITES
-- ============================================

DROP POLICY IF EXISTS "Users can view own storyboards" ON storyboards;
DROP POLICY IF EXISTS "Users can insert own storyboards" ON storyboards;
DROP POLICY IF EXISTS "Users can update own storyboards" ON storyboards;
DROP POLICY IF EXISTS "Users can delete own storyboards" ON storyboards;

ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;

-- Only SELECT allowed from frontend
CREATE POLICY "Users can view own storyboards (read-only)"
  ON storyboards FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 6. GENERATIONS TABLE - ALREADY SECURE
-- ============================================
-- Generations are already created via Edge Functions
-- Just ensure RLS is enabled with read-only access

DROP POLICY IF EXISTS "Users can view own generations" ON generations;
DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
DROP POLICY IF EXISTS "Users can update own generations" ON generations;

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Only SELECT allowed from frontend
CREATE POLICY "Users can view own generations (read-only)"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- SUMMARY
-- ============================================
-- After this migration:
--
-- | Table              | Frontend Can | Edge Functions Can |
-- |--------------------|--------------|-------------------|
-- | user_credits       | SELECT only  | ALL (service role)|
-- | credit_transactions| SELECT only  | ALL (service role)|
-- | projects           | SELECT only  | ALL (service role)|
-- | assets             | SELECT only  | ALL (service role)|
-- | storyboards        | SELECT only  | ALL (service role)|
-- | generations        | SELECT only  | ALL (service role)|
--
-- This follows the security principle:
-- "Never let frontend directly write to database"
-- ============================================
