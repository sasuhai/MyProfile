-- Multi-User Portfolio Database Setup
-- This schema supports multiple users sharing one database
-- Each deployment shows one user's portfolio based on configuration

-- ============================================
-- 1. CREATE TABLES WITH USER SUPPORT
-- ============================================

-- Profile Info Table (Multiple Users)
CREATE TABLE IF NOT EXISTS profile_info (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  bio TEXT NOT NULL,
  about TEXT,
  location TEXT,
  languages TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Skills Table (Linked to Users)
CREATE TABLE IF NOT EXISTS skills (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Education Table (Linked to Users)
CREATE TABLE IF NOT EXISTS education (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  achievements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Experience Table (Linked to Users)
CREATE TABLE IF NOT EXISTS work_experience (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Certifications Table (Linked to Users)
CREATE TABLE IF NOT EXISTS certifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table (Linked to Users)
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Messages Table (Linked to Portfolio Owner)
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  portfolio_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE HELPER FUNCTION
-- ============================================

-- Function to get user_id from email
CREATE OR REPLACE FUNCTION get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
  SELECT user_id FROM profile_info WHERE email = user_email LIMIT 1;
$$ LANGUAGE SQL STABLE;

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
-- 4. DROP EXISTING POLICIES
-- ============================================

DROP POLICY IF EXISTS "Public can view all profiles" ON profile_info;
DROP POLICY IF EXISTS "Users can update own profile" ON profile_info;
DROP POLICY IF EXISTS "Users can insert own profile" ON profile_info;

DROP POLICY IF EXISTS "Public can view all skills" ON skills;
DROP POLICY IF EXISTS "Users can manage own skills" ON skills;

DROP POLICY IF EXISTS "Public can view all education" ON education;
DROP POLICY IF EXISTS "Users can manage own education" ON education;

DROP POLICY IF EXISTS "Public can view all work experience" ON work_experience;
DROP POLICY IF EXISTS "Users can manage own work experience" ON work_experience;

DROP POLICY IF EXISTS "Public can view all certifications" ON certifications;
DROP POLICY IF EXISTS "Users can manage own certifications" ON certifications;

DROP POLICY IF EXISTS "Public can view all published projects" ON projects;
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON messages;

-- ============================================
-- 5. CREATE MULTI-USER POLICIES
-- ============================================

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
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profile_info_user_id ON profile_info(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_info_email ON profile_info(email);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_education_end_date ON education(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_end_date ON work_experience(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_issue_date ON certifications(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_messages_portfolio_owner_id ON messages(portfolio_owner_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================
-- 7. INSERT SAMPLE DATA FOR FIRST USER
-- ============================================

-- Note: You need to create users in Supabase Authentication first
-- Then insert their profile data here

-- Example (replace with actual user_id from auth.users):
-- INSERT INTO profile_info (user_id, email, full_name, tagline, bio)
-- VALUES (
--   'your-user-uuid-from-auth',
--   'john.doe@example.com',
--   'John Doe',
--   'Full Stack Developer',
--   'Passionate about creating amazing web applications.'
-- );

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Next steps:
-- 1. Create users in Supabase Authentication (one for each portfolio owner)
-- 2. For each user, insert their profile_info record with their user_id
-- 3. Create storage buckets: profile-images and project-images
-- 4. Configure src/config/portfolio.config.js with the user's email
-- 5. Deploy to individual domains
