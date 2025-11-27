-- ============================================
-- CREATE MISSING TABLES
-- ============================================
-- Run this FIRST before the RLS policies

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR CONTACT MESSAGES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can send messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON contact_messages;
DROP POLICY IF EXISTS "Users can update message read status" ON contact_messages;

-- Allow anyone (including anonymous) to insert messages
CREATE POLICY "Anyone can send messages"
ON contact_messages FOR INSERT
TO public
WITH CHECK (true);

-- Only authenticated users can view all messages
CREATE POLICY "Authenticated users can view messages"
ON contact_messages FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can update read status
CREATE POLICY "Users can update message read status"
ON contact_messages FOR UPDATE
TO authenticated
USING (true);

-- ============================================
-- VERIFY TABLES EXIST
-- ============================================

-- Check if all tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'education') THEN
        RAISE NOTICE 'WARNING: education table does not exist!';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'work_experience') THEN
        RAISE NOTICE 'WARNING: work_experience table does not exist!';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'certifications') THEN
        RAISE NOTICE 'WARNING: certifications table does not exist!';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_messages') THEN
        RAISE NOTICE 'WARNING: contact_messages table does not exist!';
    ELSE
        RAISE NOTICE 'SUCCESS: contact_messages table created!';
    END IF;
END $$;

-- ============================================
-- RLS POLICIES FOR EDUCATION
-- ============================================

-- Enable RLS
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own education" ON education;
DROP POLICY IF EXISTS "Users can view their own education" ON education;
DROP POLICY IF EXISTS "Users can update their own education" ON education;
DROP POLICY IF EXISTS "Users can delete their own education" ON education;
DROP POLICY IF EXISTS "Public can view education" ON education;

-- Create policies
CREATE POLICY "Users can insert their own education"
ON education FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own education"
ON education FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
ON education FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
ON education FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view education"
ON education FOR SELECT
TO public
USING (true);

-- ============================================
-- RLS POLICIES FOR WORK EXPERIENCE
-- ============================================

-- Enable RLS
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own work_experience" ON work_experience;
DROP POLICY IF EXISTS "Users can view their own work_experience" ON work_experience;
DROP POLICY IF EXISTS "Users can update their own work_experience" ON work_experience;
DROP POLICY IF EXISTS "Users can delete their own work_experience" ON work_experience;
DROP POLICY IF EXISTS "Public can view work_experience" ON work_experience;

-- Create policies
CREATE POLICY "Users can insert their own work_experience"
ON work_experience FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own work_experience"
ON work_experience FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own work_experience"
ON work_experience FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work_experience"
ON work_experience FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view work_experience"
ON work_experience FOR SELECT
TO public
USING (true);

-- ============================================
-- RLS POLICIES FOR CERTIFICATIONS
-- ============================================

-- Enable RLS
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own certifications" ON certifications;
DROP POLICY IF EXISTS "Users can view their own certifications" ON certifications;
DROP POLICY IF EXISTS "Users can update their own certifications" ON certifications;
DROP POLICY IF EXISTS "Users can delete their own certifications" ON certifications;
DROP POLICY IF EXISTS "Public can view certifications" ON certifications;

-- Create policies
CREATE POLICY "Users can insert their own certifications"
ON certifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own certifications"
ON certifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
ON certifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
ON certifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view certifications"
ON certifications FOR SELECT
TO public
USING (true);

-- ============================================
-- DONE!
-- ============================================

-- Show success message
DO $$
BEGIN
    RAISE NOTICE '✅ All RLS policies have been created successfully!';
    RAISE NOTICE '✅ Next step: Create storage bucket "profile-images" in Storage section';
END $$;
