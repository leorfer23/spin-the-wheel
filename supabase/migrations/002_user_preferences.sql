-- Create user_preferences table for storing user settings and onboarding state
CREATE TABLE IF NOT EXISTS spinawheel.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_current_step INTEGER DEFAULT 0,
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  preferred_language VARCHAR(10) DEFAULT 'es',
  theme_preference VARCHAR(20) DEFAULT 'light',
  notification_preferences JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX idx_user_preferences_user_id ON spinawheel.user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE spinawheel.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own preferences
CREATE POLICY "Users can view own preferences" 
  ON spinawheel.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
  ON spinawheel.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
  ON spinawheel.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create user preferences on signup
CREATE OR REPLACE FUNCTION spinawheel.create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO spinawheel.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION spinawheel.create_user_preferences();

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION spinawheel.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON spinawheel.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION spinawheel.update_updated_at_column();