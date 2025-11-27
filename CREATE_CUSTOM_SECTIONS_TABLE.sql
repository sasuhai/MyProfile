-- Create custom_resume_sections table
-- Run this SQL in Supabase SQL Editor

-- 1. Create the table
CREATE TABLE IF NOT EXISTS custom_resume_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add comments
COMMENT ON TABLE custom_resume_sections IS 'Custom sections for user resumes (Achievements, Core Competencies, etc.)';
COMMENT ON COLUMN custom_resume_sections.title IS 'Section title (e.g., Achievements, Core Competencies)';
COMMENT ON COLUMN custom_resume_sections.content IS 'Section content/description';
COMMENT ON COLUMN custom_resume_sections.display_order IS 'Order to display sections (lower = first)';

-- 3. Enable RLS
ALTER TABLE custom_resume_sections ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
CREATE POLICY "Users can view own custom sections"
ON custom_resume_sections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom sections"
ON custom_resume_sections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom sections"
ON custom_resume_sections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom sections"
ON custom_resume_sections FOR DELETE
USING (auth.uid() = user_id);

-- 5. Create indexes
CREATE INDEX idx_custom_sections_user_id ON custom_resume_sections(user_id);
CREATE INDEX idx_custom_sections_order ON custom_resume_sections(user_id, display_order);

-- 6. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_custom_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_sections_updated_at
BEFORE UPDATE ON custom_resume_sections
FOR EACH ROW
EXECUTE FUNCTION update_custom_sections_updated_at();

-- 7. Verify table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'custom_resume_sections'
ORDER BY ordinal_position;
