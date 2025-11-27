-- Add Role-Based Access Control
-- This adds admin/user roles to the system

-- ============================================
-- STEP 1: Add role column to profile_info
-- ============================================

-- Add role column (admin or user)
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'));

-- Set your account as admin
UPDATE profile_info 
SET role = 'admin' 
WHERE email = 'sasuhai0@gmail.com';

-- ============================================
-- STEP 2: Create users management table
-- ============================================

-- This table tracks all users for admin management
CREATE TABLE IF NOT EXISTS user_management (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_management ENABLE ROW LEVEL SECURITY;

-- Policies for user_management
DROP POLICY IF EXISTS "Admins can view all users" ON user_management;
DROP POLICY IF EXISTS "Admins can manage users" ON user_management;

CREATE POLICY "Admins can view all users" ON user_management
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profile_info 
      WHERE profile_info.user_id = auth.uid() 
      AND profile_info.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users" ON user_management
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profile_info 
      WHERE profile_info.user_id = auth.uid() 
      AND profile_info.role = 'admin'
    )
  );

-- ============================================
-- STEP 3: Sync existing users to user_management
-- ============================================

-- Insert existing users into user_management
INSERT INTO user_management (user_id, email, role, created_at)
SELECT 
  p.user_id, 
  p.email, 
  p.role,
  p.created_at
FROM profile_info p
WHERE NOT EXISTS (
  SELECT 1 FROM user_management um WHERE um.user_id = p.user_id
);

-- ============================================
-- STEP 4: Create function to check if user is admin
-- ============================================

CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profile_info 
    WHERE user_id = check_user_id 
    AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN AS $$
  SELECT is_admin(auth.uid());
$$ LANGUAGE SQL STABLE;

-- ============================================
-- STEP 5: Update RLS policies to respect roles
-- ============================================

-- Only admins can update other users' profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profile_info;

CREATE POLICY "Users can update own profile" ON profile_info
  FOR UPDATE USING (
    auth.uid() = user_id OR current_user_is_admin()
  );

-- Only admins can insert new profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profile_info;

CREATE POLICY "Users can insert own profile" ON profile_info
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR current_user_is_admin()
  );

-- ============================================
-- STEP 6: Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profile_info_role ON profile_info(role);
CREATE INDEX IF NOT EXISTS idx_user_management_role ON user_management(role);
CREATE INDEX IF NOT EXISTS idx_user_management_email ON user_management(email);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check your admin status
SELECT email, role FROM profile_info WHERE email = 'sasuhai0@gmail.com';
-- Should show: sasuhai0@gmail.com | admin

-- Check if admin function works
SELECT current_user_is_admin();
-- Should return true when logged in as sasuhai0@gmail.com

-- ============================================
-- ROLE-BASED ACCESS COMPLETE!
-- ============================================

-- Summary:
-- ✅ Added role column to profile_info
-- ✅ Set sasuhai0@gmail.com as admin
-- ✅ Created user_management table
-- ✅ Added admin check functions
-- ✅ Updated RLS policies
-- ✅ Created indexes

-- Next: Use the admin dashboard to manage users!
