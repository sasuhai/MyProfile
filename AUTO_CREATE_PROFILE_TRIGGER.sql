-- Auto-Create Profile Trigger
-- This automatically creates a profile_info record when a new user is created in auth.users

-- ============================================
-- STEP 1: Create function to auto-create profile
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 2: Create trigger on auth.users
-- ============================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 3: Grant necessary permissions
-- ============================================

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================

-- Test by creating a user in Supabase Auth
-- The profile should be automatically created!

-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- HOW IT WORKS
-- ============================================

/*
When you create a new user in Supabase Auth:

1. User is created in auth.users table
2. Trigger fires automatically
3. Function reads user data:
   - user_id (from auth.users.id)
   - email (from auth.users.email)
   - full_name (from metadata or defaults to 'New User')
   - role (from metadata or defaults to 'user')
4. Profile is created in profile_info table
5. User can immediately login and use the system!

METADATA FORMAT:
When creating user via Supabase Dashboard or API, you can pass metadata:
{
  "full_name": "John Doe",
  "tagline": "Software Engineer",
  "bio": "Passionate developer",
  "role": "user"  // or "admin"
}
*/

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Now when you create a user in Supabase Auth:
-- 1. Go to Authentication → Users → Add User
-- 2. Fill in email and password
-- 3. (Optional) Add user metadata in JSON format
-- 4. Profile is automatically created!

-- Example metadata JSON:
-- {
--   "full_name": "Jane Smith",
--   "role": "user"
-- }
