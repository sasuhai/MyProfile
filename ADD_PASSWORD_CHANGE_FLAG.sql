-- Add must_change_password flag to profile_info table
-- This flag will be set to true when admin creates a new user
-- and will be cleared after the user changes their password

-- Add the column
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Update existing users to not require password change
UPDATE profile_info 
SET must_change_password = false 
WHERE must_change_password IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_must_change_password 
ON profile_info(must_change_password) 
WHERE must_change_password = true;

-- Add comment for documentation
COMMENT ON COLUMN profile_info.must_change_password IS 
'Flag to force password change on first login. Set to true when admin creates user with temporary password.';
