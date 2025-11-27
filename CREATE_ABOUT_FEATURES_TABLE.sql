-- Create about_features table for editable About page features
-- Run this SQL in Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS about_features (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    icon TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add comments
COMMENT ON TABLE about_features IS 'Features displayed on About page (Clean Code, Fast Learner, etc.)';
COMMENT ON COLUMN about_features.icon IS 'Icon name from lucide-react (e.g., Code2, Zap, Heart, Globe)';
COMMENT ON COLUMN about_features.label IS 'Feature title (e.g., Clean Code, Fast Learner)';
COMMENT ON COLUMN about_features.description IS 'Feature description';
COMMENT ON COLUMN about_features.display_order IS 'Order to display features (lower = first)';

-- 3. Enable RLS
ALTER TABLE about_features ENABLE ROW LEVEL SECURITY;

-- 4. Create policies - Allow public read, authenticated write
CREATE POLICY "Public can view about features"
ON about_features FOR SELECT
USING (true);

CREATE POLICY "Users can insert own about features"
ON about_features FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own about features"
ON about_features FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own about features"
ON about_features FOR DELETE
USING (auth.uid() = user_id);

-- 5. Create indexes
CREATE INDEX idx_about_features_user_id ON about_features(user_id);
CREATE INDEX idx_about_features_order ON about_features(user_id, display_order);

-- 6. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_about_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_about_features_updated_at
BEFORE UPDATE ON about_features
FOR EACH ROW
EXECUTE FUNCTION update_about_features_updated_at();

-- 7. Insert default features (optional - for current user)
-- Replace 'YOUR_USER_ID' with your actual user_id from auth.users
-- Or run this after creating features in the admin panel
/*
INSERT INTO about_features (user_id, icon, label, description, display_order) VALUES
('YOUR_USER_ID', 'Code2', 'Clean Code', 'Writing maintainable and scalable code', 1),
('YOUR_USER_ID', 'Zap', 'Fast Learner', 'Quick to adapt to new technologies', 2),
('YOUR_USER_ID', 'Heart', 'Passionate', 'Love what I do every day', 3),
('YOUR_USER_ID', 'Globe', 'Team Player', 'Collaborative and communicative', 4);
*/

-- 8. Verify table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'about_features'
ORDER BY ordinal_position;
