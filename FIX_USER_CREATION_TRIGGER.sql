-- Fix for "Database error creating new user" issue
-- This script checks and recreates the profile creation trigger

-- Step 1: Check if the trigger exists
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Step 2: Drop and recreate the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profile_info (
        user_id,
        email,
        full_name,
        username,
        role,
        must_change_password
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        false  -- Default to false, will be updated separately if needed
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If profile already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profile_info TO postgres, anon, authenticated, service_role;

-- Step 6: Verify the trigger was created
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Test query: Check if there are any orphaned auth users without profiles
SELECT 
    u.id,
    u.email,
    u.created_at,
    CASE WHEN p.user_id IS NULL THEN 'Missing Profile' ELSE 'Has Profile' END as status
FROM auth.users u
LEFT JOIN public.profile_info p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- If you find orphaned users, you can create profiles for them with:
-- INSERT INTO public.profile_info (user_id, email, full_name, username, role)
-- SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'User'), 
--        COALESCE(raw_user_meta_data->>'username', SPLIT_PART(email, '@', 1)), 
--        COALESCE(raw_user_meta_data->>'role', 'user')
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM public.profile_info);
