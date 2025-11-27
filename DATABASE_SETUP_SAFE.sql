-- Safe Database Setup Script
-- This script checks if tables exist before creating them
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES (with IF NOT EXISTS)
-- ============================================

-- Profile Info Table
CREATE TABLE IF NOT EXISTS profile_info (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT 'Your Name',
  tagline TEXT NOT NULL DEFAULT 'Aspiring Software Engineer',
  bio TEXT NOT NULL DEFAULT 'Passionate about creating beautiful, functional applications.',
  about TEXT,
  email TEXT NOT NULL DEFAULT 'your.email@example.com',
  location TEXT,
  languages TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education Table
CREATE TABLE IF NOT EXISTS education (
  id BIGSERIAL PRIMARY KEY,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Experience Table
CREATE TABLE IF NOT EXISTS work_experience (
  id BIGSERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  achievements TEXT[],
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  demo_url TEXT,
  github_url TEXT,
  technologies TEXT[],
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INSERT DEFAULT DATA (only if table is empty)
-- ============================================

-- Insert default profile only if no profile exists
INSERT INTO profile_info (full_name, tagline, bio, email)
SELECT 'Your Name', 'Aspiring Software Engineer', 'Passionate about creating beautiful, functional applications.', 'your.email@example.com'
WHERE NOT EXISTS (SELECT 1 FROM profile_info LIMIT 1);

-- Insert sample skills only if no skills exist
INSERT INTO skills (name, category, level)
SELECT * FROM (VALUES
  ('React', 'Frontend', 90),
  ('JavaScript', 'Languages', 85),
  ('TypeScript', 'Languages', 80),
  ('Node.js', 'Backend', 80),
  ('TailwindCSS', 'Frontend', 85),
  ('PostgreSQL', 'Backend', 75),
  ('Git', 'Tools', 90),
  ('HTML/CSS', 'Frontend', 95),
  ('Python', 'Languages', 75),
  ('REST APIs', 'Backend', 85)
) AS v(name, category, level)
WHERE NOT EXISTS (SELECT 1 FROM skills LIMIT 1);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profile_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. DROP EXISTING POLICIES (if any)
-- ============================================

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

-- ============================================
-- 5. CREATE POLICIES
-- ============================================

-- Profile Info Policies
CREATE POLICY "Public can view profile" ON profile_info
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can update profile" ON profile_info
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Skills Policies
CREATE POLICY "Public can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage skills" ON skills
  FOR ALL USING (auth.role() = 'authenticated');

-- Education Policies
CREATE POLICY "Public can view education" ON education
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage education" ON education
  FOR ALL USING (auth.role() = 'authenticated');

-- Work Experience Policies
CREATE POLICY "Public can view work experience" ON work_experience
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage work experience" ON work_experience
  FOR ALL USING (auth.role() = 'authenticated');

-- Certifications Policies
CREATE POLICY "Public can view certifications" ON certifications
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage certifications" ON certifications
  FOR ALL USING (auth.role() = 'authenticated');

-- Projects Policies
CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

-- Messages Policies
CREATE POLICY "Authenticated users can view messages" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_education_end_date ON education(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_work_experience_end_date ON work_experience(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_certifications_issue_date ON certifications(issue_date DESC);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Next steps:
-- 1. Create storage buckets: profile-images and project-images (in Supabase Storage)
-- 2. Create an admin user (in Supabase Authentication)
-- 3. Update your .env file with Supabase credentials
-- 4. Start adding content via the admin dashboard!
