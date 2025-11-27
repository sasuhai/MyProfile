-- Update Auto-Create Profile Trigger to Include Username
-- This updates the trigger to handle the username field

-- ============================================
-- STEP 1: Update function to include username
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile for the user
  INSERT INTO public.profile_info (
    user_id,
    email,
    username,
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
    COALESCE(NEW.raw_user_meta_data->>'username', LOWER(SPLIT_PART(NEW.email, '@', 1))),
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
-- VERIFICATION
-- ============================================

-- Check if function was updated
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- ============================================
-- NOTES
-- ============================================

/*
The trigger now handles username in two ways:

1. If username is provided in metadata:
   Uses: NEW.raw_user_meta_data->>'username'
   
2. If username is NOT provided:
   Auto-generates from email: LOWER(SPLIT_PART(NEW.email, '@', 1))
   Example: john@example.com → username: john

METADATA FORMAT:
{
  "full_name": "John Doe",
  "username": "john",
  "role": "user"
}

If you don't provide username, it will use the part before @ in email.
*/

-- ============================================
-- UPDATE COMPLETE!
-- ============================================
