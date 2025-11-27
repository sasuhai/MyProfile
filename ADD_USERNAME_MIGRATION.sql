-- Add Username for Path-Based Multi-Tenancy
-- This allows users to be accessed via yourportfolio.com/username

-- ============================================
-- STEP 1: Add username column
-- ============================================

-- Add username column to profile_info
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS username TEXT;

-- ============================================
-- STEP 2: Set username for existing user
-- ============================================

-- Set your username (change if you want a different username)
UPDATE profile_info 
SET username = 'sasuhai'
WHERE email = 'sasuhai0@gmail.com';

-- ============================================
-- STEP 3: Add constraints
-- ============================================

-- Make username unique
ALTER TABLE profile_info 
ADD CONSTRAINT username_unique UNIQUE (username);

-- Ensure username is URL-safe (lowercase letters, numbers, hyphens only)
ALTER TABLE profile_info 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9-]+$');

-- Make username required (after setting existing values)
ALTER TABLE profile_info 
ALTER COLUMN username SET NOT NULL;

-- ============================================
-- STEP 4: Add index for fast lookups
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profile_info_username ON profile_info(username);

-- ============================================
-- STEP 5: Create helper functions
-- ============================================

-- Function to get user by username
CREATE OR REPLACE FUNCTION get_user_by_username(user_name TEXT)
RETURNS TABLE (
  id BIGINT,
  user_id UUID,
  email TEXT,
  username TEXT,
  full_name TEXT,
  tagline TEXT,
  bio TEXT,
  about TEXT,
  role TEXT,
  location TEXT,
  languages TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
  SELECT 
    id, user_id, email, username, full_name, tagline, bio, about, role,
    location, languages, github_url, linkedin_url, twitter_url, 
    profile_image_url, created_at, updated_at
  FROM profile_info 
  WHERE profile_info.username = user_name 
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to check if username exists
CREATE OR REPLACE FUNCTION username_exists(user_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profile_info WHERE username = user_name
  );
$$ LANGUAGE SQL STABLE;

-- ============================================
-- STEP 6: Update RLS policies for username access
-- ============================================

-- Allow public to view profiles by username
DROP POLICY IF EXISTS "Public can view profiles by username" ON profile_info;
CREATE POLICY "Public can view profiles by username" ON profile_info
  FOR SELECT USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check your username
SELECT username, email, full_name FROM profile_info WHERE email = 'sasuhai0@gmail.com';
-- Should show: sasuhai | sasuhai0@gmail.com | Your Name

-- Test helper function
SELECT * FROM get_user_by_username('sasuhai');
-- Should return your profile

-- Test username check
SELECT username_exists('sasuhai');
-- Should return: true

SELECT username_exists('nonexistent');
-- Should return: false

-- ============================================
-- USERNAME MIGRATION COMPLETE!
-- ============================================

-- Summary:
-- ✅ Added username column
-- ✅ Set username for existing user (sasuhai)
-- ✅ Added unique constraint
-- ✅ Added URL-safe format validation
-- ✅ Created index for fast lookups
-- ✅ Created helper functions
-- ✅ Updated RLS policies

-- Your portfolio will be accessible at:
-- yourportfolio.com/sasuhai

-- When adding new users, set their username:
-- UPDATE profile_info SET username = 'john' WHERE email = 'john@example.com';
