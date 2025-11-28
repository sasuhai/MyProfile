-- Add show_photo_frame column to profile_info table
-- This controls whether to show the glass frame around the profile photo

ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS show_photo_frame BOOLEAN DEFAULT true;

-- Update existing records to show frame by default
UPDATE profile_info 
SET show_photo_frame = true 
WHERE show_photo_frame IS NULL;
