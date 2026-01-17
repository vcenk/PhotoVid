-- Storyboards table: Property video storyboard data
CREATE TABLE IF NOT EXISTS storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  name TEXT DEFAULT 'Untitled Storyboard',

  -- Property information
  property_data JSONB DEFAULT '{}',      -- { address, beds, baths, sqft, features, style }

  -- Scene data - array of scene objects
  scenes JSONB DEFAULT '[]',             -- [{ id, order, type, room, imageUrl, videoUrl, duration, motionStyle, prompt, textOverlay, transition, status }]

  -- Video settings
  settings JSONB DEFAULT '{
    "aspectRatio": "16:9",
    "musicVolume": 50,
    "transitionDuration": 500,
    "includeIntro": true,
    "includeOutro": true,
    "watermark": false,
    "outputQuality": "1080p"
  }',

  -- Output
  total_duration INTEGER DEFAULT 0,      -- Calculated total duration in seconds
  status TEXT DEFAULT 'draft',           -- 'draft', 'generating', 'completed', 'failed'
  output_url TEXT,                       -- Final assembled video URL

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_storyboards_user ON storyboards(user_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_project ON storyboards(project_id);
CREATE INDEX IF NOT EXISTS idx_storyboards_status ON storyboards(status);

-- Row Level Security
ALTER TABLE storyboards ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only manage their own storyboards
CREATE POLICY "Users can view own storyboards" ON storyboards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storyboards" ON storyboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storyboards" ON storyboards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storyboards" ON storyboards
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_storyboard_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS storyboard_updated_at ON storyboards;
CREATE TRIGGER storyboard_updated_at
  BEFORE UPDATE ON storyboards
  FOR EACH ROW EXECUTE FUNCTION update_storyboard_timestamp();

-- Function to calculate total duration from scenes
CREATE OR REPLACE FUNCTION calculate_storyboard_duration()
RETURNS TRIGGER AS $$
DECLARE
  total INTEGER := 0;
  scene JSONB;
BEGIN
  FOR scene IN SELECT * FROM jsonb_array_elements(NEW.scenes)
  LOOP
    total := total + COALESCE((scene->>'duration')::INTEGER, 5);
  END LOOP;

  NEW.total_duration = total;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate duration
DROP TRIGGER IF EXISTS storyboard_duration ON storyboards;
CREATE TRIGGER storyboard_duration
  BEFORE INSERT OR UPDATE OF scenes ON storyboards
  FOR EACH ROW EXECUTE FUNCTION calculate_storyboard_duration();
