-- Add missing columns to profile_info table
-- Run this SQL in Supabase SQL Editor

-- 1. Add status column
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- Add validation for status
ALTER TABLE profile_info 
ADD CONSTRAINT status_check 
CHECK (status IN ('available', 'not_available', 'open_to_opportunities'));

-- 2. Add theme_color column
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3b82f6';

-- Add validation for theme_color (hex format)
ALTER TABLE profile_info 
ADD CONSTRAINT theme_color_format 
CHECK (theme_color IS NULL OR theme_color ~ '^#[0-9A-Fa-f]{6}$');

-- 3. Update existing rows to have default values
UPDATE profile_info 
SET status = 'available' 
WHERE status IS NULL;

UPDATE profile_info 
SET theme_color = '#3b82f6' 
WHERE theme_color IS NULL;

-- 4. Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profile_info' 
AND column_name IN ('status', 'theme_color')
ORDER BY column_name;
