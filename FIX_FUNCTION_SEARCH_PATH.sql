-- ============================================
-- FIX: Set search_path for all functions
-- ============================================
-- This fixes the Supabase linter warning:
-- "function_search_path_mutable"
--
-- Security: Setting search_path prevents schema injection attacks
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Fix: update_access_requests_updated_at
CREATE OR REPLACE FUNCTION update_access_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. Fix: update_about_features_updated_at
CREATE OR REPLACE FUNCTION update_about_features_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 3. Fix: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO public.profile_info (
    user_id,
    email,
    full_name,
    tagline,
    bio,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'tagline', 'Portfolio Owner'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Welcome to my portfolio!'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- 4. Fix: is_admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_info 
    WHERE user_id = check_user_id 
    AND role = 'admin'
  );
$$;

-- 5. Fix: current_user_is_admin
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_admin(auth.uid());
$$;

-- 6. Fix: get_user_by_username
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
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    id, user_id, email, username, full_name, tagline, bio, about, role,
    location, languages, github_url, linkedin_url, twitter_url, 
    profile_image_url, created_at, updated_at
  FROM public.profile_info 
  WHERE profile_info.username = user_name 
  LIMIT 1;
$$;

-- 7. Fix: username_exists
CREATE OR REPLACE FUNCTION username_exists(user_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_info WHERE username = user_name
  );
$$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check all functions have search_path set
SELECT 
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS arguments,
    CASE 
        WHEN p.proconfig IS NULL THEN '❌ NO search_path'
        ELSE '✅ search_path: ' || array_to_string(p.proconfig, ', ')
    END AS search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'update_access_requests_updated_at',
    'update_about_features_updated_at',
    'handle_new_user',
    'is_admin',
    'current_user_is_admin',
    'get_user_by_username',
    'username_exists'
  )
ORDER BY p.proname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ All 7 functions have been updated with secure search_path settings!';
    RAISE NOTICE '✅ Security Warning: function_search_path_mutable should now be resolved';
END $$;
