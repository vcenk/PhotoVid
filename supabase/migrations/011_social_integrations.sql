-- ============================================
-- SOCIAL MEDIA INTEGRATIONS
-- Facebook Pages & Instagram Business Accounts
-- ============================================

-- Social Integrations Table: Stores connected accounts
CREATE TABLE IF NOT EXISTS social_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Platform identification
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  platform_user_id TEXT NOT NULL, -- Facebook/Instagram user ID

  -- User token storage (encrypted at rest by Supabase)
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ, -- NULL for non-expiring page tokens

  -- Facebook Page details
  page_id TEXT, -- Facebook Page ID
  page_name TEXT,
  page_access_token TEXT, -- Long-lived page token (doesn't expire)
  page_picture_url TEXT,

  -- Instagram Business Account details (connected via Facebook Page)
  instagram_account_id TEXT,
  instagram_username TEXT,
  instagram_profile_picture_url TEXT,

  -- Account status & metadata
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  scopes TEXT[], -- Array of granted permissions
  last_used_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  error_message TEXT, -- Last error if status is 'error'

  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate platform+page combinations per user
  UNIQUE(user_id, platform, page_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_social_integrations_user_id ON social_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_social_integrations_status ON social_integrations(status);
CREATE INDEX IF NOT EXISTS idx_social_integrations_platform ON social_integrations(platform);
CREATE INDEX IF NOT EXISTS idx_social_integrations_expires ON social_integrations(token_expires_at)
  WHERE token_expires_at IS NOT NULL;

-- ============================================
-- SOCIAL POSTS TABLE (Audit Trail + Scheduling)
-- ============================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  integration_id UUID REFERENCES social_integrations(id) ON DELETE SET NULL,

  -- Post details
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  post_type TEXT NOT NULL CHECK (post_type IN ('image', 'video', 'carousel', 'text')),
  platform_post_id TEXT, -- Facebook/Instagram post ID after publishing
  media_url TEXT, -- URL of media to post
  caption TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'publishing', 'published', 'failed')),
  error_message TEXT,

  -- Scheduling
  scheduled_for TIMESTAMPTZ, -- NULL = immediate, otherwise scheduled time

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for social_posts
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled ON social_posts(scheduled_for)
  WHERE status = 'scheduled' AND scheduled_for IS NOT NULL;

-- ============================================
-- OAUTH STATE TABLE (CSRF Protection)
-- ============================================
CREATE TABLE IF NOT EXISTS social_oauth_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
);

-- Index for quick state lookup
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON social_oauth_states(state);

-- Auto-cleanup expired states
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM social_oauth_states WHERE expires_at < NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to cleanup on insert (piggyback cleanup)
DROP TRIGGER IF EXISTS cleanup_oauth_states_trigger ON social_oauth_states;
CREATE TRIGGER cleanup_oauth_states_trigger
  AFTER INSERT ON social_oauth_states
  EXECUTE FUNCTION cleanup_expired_oauth_states();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE social_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_oauth_states ENABLE ROW LEVEL SECURITY;

-- Users can only SELECT their own integrations (read-only from frontend)
CREATE POLICY "Users can view own integrations"
  ON social_integrations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only SELECT their own posts
CREATE POLICY "Users can view own posts"
  ON social_posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only SELECT their own oauth states
CREATE POLICY "Users can view own oauth states"
  ON social_oauth_states FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (via Edge Functions)
-- Note: Service role bypasses RLS by default

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user has any active integrations
CREATE OR REPLACE FUNCTION has_active_social_integration(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM social_integrations
    WHERE user_id = p_user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get integrations needing token refresh (within 7 days of expiry)
CREATE OR REPLACE FUNCTION get_expiring_integrations()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  platform TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT si.id, si.user_id, si.platform, si.access_token, si.token_expires_at
  FROM social_integrations si
  WHERE si.status = 'active'
    AND si.token_expires_at IS NOT NULL
    AND si.token_expires_at <= NOW() + INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get scheduled posts ready to publish
CREATE OR REPLACE FUNCTION get_posts_to_publish()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  integration_id UUID,
  platform TEXT,
  post_type TEXT,
  media_url TEXT,
  caption TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT sp.id, sp.user_id, sp.integration_id, sp.platform, sp.post_type, sp.media_url, sp.caption
  FROM social_posts sp
  WHERE sp.status = 'scheduled'
    AND sp.scheduled_for IS NOT NULL
    AND sp.scheduled_for <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_social_integration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS social_integrations_updated_at ON social_integrations;
CREATE TRIGGER social_integrations_updated_at
  BEFORE UPDATE ON social_integrations
  FOR EACH ROW EXECUTE FUNCTION update_social_integration_timestamp();
