-- ============================================
-- UPDATE TRIAL CREDITS TO 10
-- ============================================
-- Change default credits from 100 to 10 for new users

-- Update the trigger function to give 10 credits
CREATE OR REPLACE FUNCTION create_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance)
  VALUES (NEW.id, 10)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the default value on the table (for manual inserts)
ALTER TABLE user_credits ALTER COLUMN balance SET DEFAULT 10;
