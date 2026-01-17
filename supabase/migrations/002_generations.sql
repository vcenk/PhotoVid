-- Generations table: Track all AI generations
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Generation details
  type TEXT NOT NULL,                    -- 'text_to_image', 'image_to_image', 'image_to_video'
  tool TEXT,                             -- 'virtual-staging', 'sky-replacement', etc.
  model TEXT,                            -- FAL model ID

  -- Input/Output
  input JSONB NOT NULL,                  -- { imageUrl, prompt, options }
  output JSONB,                          -- { url, metadata }

  -- Tracking
  credits_used INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending',         -- 'pending', 'processing', 'completed', 'failed'
  fal_request_id TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_generations_user ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at DESC);

-- Row Level Security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view/manage their own generations
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations" ON generations
  FOR UPDATE USING (auth.uid() = user_id);
