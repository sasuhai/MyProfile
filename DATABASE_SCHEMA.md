# 📊 Database Schema & Setup Guide

This document provides the complete database schema for the Personal Profile Portal using Supabase (PostgreSQL).

## 🗄️ Database Tables

### 1. profile_info
Stores personal profile information (single row).

```sql
CREATE TABLE profile_info (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  bio TEXT NOT NULL,
  about TEXT,
  email TEXT NOT NULL,
  location TEXT,
  languages TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default profile
INSERT INTO profile_info (full_name, tagline, bio, email)
VALUES (
  'Your Name',
  'Aspiring Software Engineer',
  'Passionate about creating beautiful, functional applications.',
  'your.email@example.com'
);
```

### 2. skills
Stores technical skills with categories and proficiency levels.

```sql
CREATE TABLE skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data
INSERT INTO skills (name, category, level) VALUES
  ('React', 'Frontend', 90),
  ('JavaScript', 'Languages', 85),
  ('Node.js', 'Backend', 80),
  ('TailwindCSS', 'Frontend', 85),
  ('PostgreSQL', 'Backend', 75),
  ('Git', 'Tools', 90);
```

### 3. education
Stores educational background.

```sql
CREATE TABLE education (
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

-- Sample data
INSERT INTO education (degree, institution, location, start_date, end_date, description)
VALUES (
  'Bachelor of Computer Science',
  'University Name',
  'City, Country',
  '2019-09-01',
  '2023-06-01',
  'Graduated with honors. Focused on software engineering and web development.'
);
```

### 4. work_experience
Stores work history and internships.

```sql
CREATE TABLE work_experience (
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

-- Sample data
INSERT INTO work_experience (position, company, location, start_date, end_date, description, achievements, skills)
VALUES (
  'Software Engineering Intern',
  'Tech Company',
  'City, Country',
  '2022-06-01',
  '2022-08-31',
  'Developed web applications and collaborated with cross-functional teams.',
  ARRAY['Built 3 major features', 'Improved performance by 30%'],
  ARRAY['React', 'Node.js', 'MongoDB']
);
```

### 5. certifications
Stores certifications and awards.

```sql
CREATE TABLE certifications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data
INSERT INTO certifications (name, issuer, issue_date, credential_url)
VALUES (
  'AWS Certified Developer',
  'Amazon Web Services',
  '2023-03-15',
  'https://aws.amazon.com/verification'
);
```

### 6. projects
Stores portfolio projects.

```sql
CREATE TABLE projects (
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

-- Sample data
INSERT INTO projects (title, description, category, technologies, demo_url, github_url)
VALUES (
  'E-Commerce Platform',
  'A full-stack e-commerce platform with payment integration and admin dashboard.',
  'Web App',
  ARRAY['React', 'Node.js', 'MongoDB', 'Stripe'],
  'https://demo.example.com',
  'https://github.com/username/project'
);
```

### 7. messages
Stores contact form submissions.

```sql
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS)

Enable RLS for security:

```sql
-- Enable RLS on all tables
ALTER TABLE profile_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read access for profile_info
CREATE POLICY "Public can view profile" ON profile_info
  FOR SELECT USING (true);

-- Authenticated users can update profile
CREATE POLICY "Authenticated users can update profile" ON profile_info
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Public read access for published content
CREATE POLICY "Public can view skills" ON skills
  FOR SELECT USING (true);

CREATE POLICY "Public can view education" ON education
  FOR SELECT USING (true);

CREATE POLICY "Public can view work experience" ON work_experience
  FOR SELECT USING (true);

CREATE POLICY "Public can view certifications" ON certifications
  FOR SELECT USING (true);

CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT USING (published = true);

-- Authenticated users (admin) can manage all content
CREATE POLICY "Authenticated users can manage skills" ON skills
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage education" ON education
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage work experience" ON work_experience
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage certifications" ON certifications
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view messages" ON messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Anyone can insert messages (contact form)
CREATE POLICY "Anyone can send messages" ON messages
  FOR INSERT WITH CHECK (true);
```

## 📦 Storage Buckets

Create storage buckets for images:

```sql
-- In Supabase Dashboard: Storage → Create Bucket

-- Bucket: profile-images
-- Public: Yes
-- File size limit: 2MB
-- Allowed MIME types: image/*

-- Bucket: project-images
-- Public: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/*
```

### Storage Policies

```sql
-- Allow public read access
CREATE POLICY "Public can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "Public can view project images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete project images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-images' AND
    auth.role() = 'authenticated'
  );
```

## 🔑 Authentication Setup

1. **Enable Email Authentication**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Email provider
   - Configure email templates (optional)

2. **Create Admin User**
   - Go to Authentication → Users
   - Click "Add User"
   - Enter email and password
   - Confirm email (or disable email confirmation for development)

3. **Use Admin Credentials**
   - Use these credentials to log in at `/admin/login`

## 📋 Complete Setup Script

Run this complete script in Supabase SQL Editor:

```sql
-- Create all tables
CREATE TABLE profile_info (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  bio TEXT NOT NULL,
  about TEXT,
  email TEXT NOT NULL,
  location TEXT,
  languages TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skills (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE education (
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

CREATE TABLE work_experience (
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

CREATE TABLE certifications (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
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

CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default profile
INSERT INTO profile_info (full_name, tagline, bio, email)
VALUES (
  'Your Name',
  'Aspiring Software Engineer',
  'Passionate about creating beautiful, functional applications.',
  'your.email@example.com'
);

-- Enable RLS
ALTER TABLE profile_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies (see above for complete policies)
```

## 🔄 Updating Schema

To add new fields or modify existing tables, use migrations:

```sql
-- Example: Add a new field to profile_info
ALTER TABLE profile_info ADD COLUMN resume_url TEXT;

-- Example: Modify a field
ALTER TABLE skills ALTER COLUMN level SET DEFAULT 85;
```

## 📊 Sample Data

See individual table sections above for sample INSERT statements.

## 🛠️ Maintenance

### Backup Database
Use Supabase Dashboard → Database → Backups

### Monitor Usage
Check Supabase Dashboard → Database → Usage

### Optimize Queries
Add indexes for frequently queried fields:

```sql
CREATE INDEX idx_projects_published ON projects(published);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

---

For more information, visit [Supabase Documentation](https://supabase.com/docs)
