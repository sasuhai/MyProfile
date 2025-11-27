-- Add theme_color column to profile_info table
-- Run this SQL in Supabase SQL Editor

-- Add the column
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3b82f6';

-- Add comment for documentation
COMMENT ON COLUMN profile_info.theme_color IS 'User''s custom theme color in hex format (#RRGGBB)';

-- Optional: Add validation to ensure valid hex color format
ALTER TABLE profile_info 
ADD CONSTRAINT theme_color_format 
CHECK (theme_color IS NULL OR theme_color ~ '^#[0-9A-Fa-f]{6}$');

-- Update existing rows to have default color
UPDATE profile_info 
SET theme_color = '#3b82f6' 
WHERE theme_color IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profile_info' AND column_name = 'theme_color';
