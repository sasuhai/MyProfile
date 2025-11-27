-- Fix RLS policy to allow public viewing of custom sections
-- Run this SQL in Supabase SQL Editor

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own custom sections" ON custom_resume_sections;

-- Create new policy that allows public read access
CREATE POLICY "Public can view custom sections"
ON custom_resume_sections FOR SELECT
USING (true);

-- Keep the other policies for insert/update/delete (authenticated only)
-- These should already exist from the original setup

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'custom_resume_sections';
