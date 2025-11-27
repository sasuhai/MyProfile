-- ============================================
-- FIX CERTIFICATIONS TABLE STRUCTURE
-- ============================================

-- The current table has:
-- - id (bigint) - should be uuid
-- - name, issuer, issue_date, expiry_date, credential_url
-- - MISSING: user_id column!

-- Option 1: Add user_id column to existing table
-- ============================================
ALTER TABLE certifications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Make user_id NOT NULL after adding it
-- First, you need to update existing rows with a user_id
-- UPDATE certifications SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- Then:
-- ALTER TABLE certifications ALTER COLUMN user_id SET NOT NULL;

-- Add credential_id column if missing
ALTER TABLE certifications 
ADD COLUMN IF NOT EXISTS credential_id TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);

-- ============================================
-- FIX EDUCATION TABLE STRUCTURE
-- ============================================

-- Check if education table has user_id
-- If not, add it:
ALTER TABLE education 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add other missing columns if needed
ALTER TABLE education 
ADD COLUMN IF NOT EXISTS degree TEXT;

ALTER TABLE education 
ADD COLUMN IF NOT EXISTS institution TEXT;

ALTER TABLE education 
ADD COLUMN IF NOT EXISTS field_of_study TEXT;

ALTER TABLE education 
ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE education 
ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE education 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE education 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Create index
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);

-- ============================================
-- VERIFY CHANGES
-- ============================================

-- Check certifications structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'certifications'
ORDER BY ordinal_position;

-- Check education structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'education'
ORDER BY ordinal_position;

-- ============================================
-- AFTER RUNNING THIS
-- ============================================
-- 1. Update existing rows to have user_id
-- 2. Make user_id NOT NULL
-- 3. Test adding education/certifications
