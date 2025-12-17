-- ============================================
-- FIX: Enable RLS on contact_messages table
-- ============================================
-- This fixes the Supabase linter errors:
-- - policy_exists_rls_disabled
-- - rls_disabled_in_public
--
-- Run this in your Supabase SQL Editor to enable RLS
-- ============================================

-- Enable Row Level Security on contact_messages table
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify RLS is now enabled
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE oid = 'public.contact_messages'::regclass;
    
    IF rls_enabled THEN
        RAISE NOTICE '✅ SUCCESS: RLS is now ENABLED on contact_messages table';
    ELSE
        RAISE WARNING '❌ ERROR: RLS is still DISABLED on contact_messages table';
    END IF;
END $$;

-- Show existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'contact_messages'
ORDER BY policyname;
