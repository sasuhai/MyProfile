-- Migration Script: Single-User to Multi-User
-- This script safely upgrades your existing database to support multiple users
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Add user_id columns to existing tables
-- ============================================

-- Add user_id to profile_info
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add email column if not exists
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add user_id to skills
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to education
ALTER TABLE education 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to work_experience
ALTER TABLE work_experience 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to certifications
ALTER TABLE certifications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Rename column in messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS portfolio_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- STEP 2: Create your first user in Supabase Auth
-- ============================================

-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: sasuhai0@gmail.com
-- Password: [your secure password]
-- Then come back and continue with Step 3

-- ============================================
-- STEP 3: Link existing data to your user
-- ============================================

-- First, get your user_id from auth.users
-- Run this query and note the UUID:
SELECT id, email FROM auth.users WHERE email = 'sasuhai0@gmail.com';

-- IMPORTANT: Replace 'YOUR-USER-ID-HERE' below with the actual UUID from above query

-- Update profile_info with your user_id and email
UPDATE profile_info 
SET 
  user_id = 'f98603f8-01eb-42f0-bf95-d6aa09522ab4',
  email = 'sasuhai0@gmail.com'
WHERE id = 1;

-- Update all skills with your user_id
UPDATE skills 
SET user_id = 'f98603f8-01eb-42f0-bf95-d6aa09522ab4'
WHERE user_id IS NULL;

-- Update all education with your user_id
UPDATE education 
SET user_id = 'f98603f8-01eb-42f0-bf95-d6aa09522ab4'
WHERE user_id IS NULL;

-- Update all work_experience with your user_id
UPDATE work_experience 
SET user_id = 'f98603f8-01eb-42f0-bf95-d6aa09522ab4'
WHERE user_id IS NULL;

-- Update all certifications with your user_id
UPDATE certifications 
SET user_id = 'f98603f8-01eb-42f0-bf95-d6aa09522ab4'
WHERE user_id IS NULL;

-- Update all projects with your user_id
UPDATE projects 
SET user_id = 'f98603f8-01eb-42f0-bf95-d6aa09522ab4'
WHERE user_id IS NULL;

-- Update all messages with your user_id
UPDATE messages 
SET portfolio_owner_id = 'f98603f8-01eb-42f0-bf95-d6aa09522ab4'
WHERE portfolio_owner_id IS NULL;

-- ============================================
-- STEP 4: Make user_id required (NOT NULL)
-- ============================================

-- Now that all data has user_id, make it required
ALTER TABLE profile_info ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE skills ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE education ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE work_experience ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE certifications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE messages ALTER COLUMN portfolio_owner_id SET NOT NULL;

-- Make email required and unique in profile_info
ALTER TABLE profile_info ALTER COLUMN email SET NOT NULL;
ALTER TABLE profile_info ADD CONSTRAINT profile_info_email_unique UNIQUE (email);
ALTER TABLE profile_info ADD CONSTRAINT profile_info_user_id_unique UNIQUE (user_id);

-- ============================================
-- STEP 5: Update RLS Policies
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Public can view profile" ON profile_info;
DROP POLICY IF EXISTS "Authenticated users can update profile" ON profile_info;
DROP POLICY IF EXISTS "Public can view skills" ON skills;
DROP POLICY IF EXISTS "Authenticated users can manage skills" ON skills;
DROP POLICY IF EXISTS "Public can view education" ON education;
DROP POLICY IF EXISTS "Authenticated users can manage education" ON education;
DROP POLICY IF EXISTS "Public can view work experience" ON work_experience;
DROP POLICY IF EXISTS "Authenticated users can manage work experience" ON work_experience;
DROP POLICY IF EXISTS "Public can view certifications" ON certifications;
DROP POLICY IF EXISTS "Authenticated users can manage certifications" ON certifications;
DROP POLICY IF EXISTS "Public can view published projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can manage projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON messages;

-- Create new multi-user policies

-- Profile Info Policies
CREATE POLICY "Public can view all profiles" ON profile_info
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profile_info
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profile_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Skills Policies
CREATE POLICY "Public can view all skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own skills" ON skills
  FOR ALL USING (auth.uid() = user_id);

-- Education Policies
CREATE POLICY "Public can view all education" ON education
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own education" ON education
  FOR ALL USING (auth.uid() = user_id);

-- Work Experience Policies
CREATE POLICY "Public can view all work experience" ON work_experience
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own work experience" ON work_experience
  FOR ALL USING (auth.uid() = user_id);

-- Certifications Policies
CREATE POLICY "Public can view all certifications" ON certifications
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own certifications" ON certifications
  FOR ALL USING (auth.uid() = user_id);

-- Projects Policies
CREATE POLICY "Public can view all published projects" ON projects
  FOR SELECT USING (published = true);

CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = portfolio_owner_id);

CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 6: Create Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profile_info_user_id ON profile_info(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_info_email ON profile_info(email);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_portfolio_owner_id ON messages(portfolio_owner_id);

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================

-- Verify migration:
SELECT 
  'profile_info' as table_name, 
  COUNT(*) as rows, 
  COUNT(DISTINCT user_id) as unique_users 
FROM profile_info
UNION ALL
SELECT 'skills', COUNT(*), COUNT(DISTINCT user_id) FROM skills
UNION ALL
SELECT 'projects', COUNT(*), COUNT(DISTINCT user_id) FROM projects;

-- You should see your data with user_id populated!
