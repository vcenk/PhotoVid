-- ============================================
-- INITIAL SCHEMA MIGRATION
-- ============================================
-- Base tables for Photovid application
-- ============================================

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  mode TEXT DEFAULT 'wizard',            -- 'wizard' | 'canvas'
  workflow_data JSONB,
  thumbnail_url TEXT,
  industry_id TEXT,                      -- 'real-estate', 'auto', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,                    -- 'image' | 'video'
  name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_created ON assets(created_at DESC);

-- Enable RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INITIAL RLS POLICIES (will be tightened in 005)
-- ============================================
-- For now, allow users to manage their own data
-- These will be replaced with read-only policies in 005_secure_rls_policies.sql

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);
