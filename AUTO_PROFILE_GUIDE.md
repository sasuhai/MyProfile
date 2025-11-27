# 🤖 Auto-Create Profile Setup Guide

## 📋 Overview

When you add a new user in Supabase, their profile is **automatically created** in the `profile_info` table using a database trigger.

---

## 🚀 Setup Instructions

### Step 1: Run the Trigger Script

1. **Open Supabase SQL Editor**
2. **Copy and run**: `AUTO_CREATE_PROFILE_TRIGGER.sql`
3. This creates:
   - ✅ Function to create profiles
   - ✅ Trigger on `auth.users` table
   - ✅ Automatic profile creation

### Step 2: Verify Trigger is Active

Run this query:
```sql
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

**Expected result:**
```
trigger_name          | event_manipulation | event_object_table
----------------------+--------------------+-------------------
on_auth_user_created  | INSERT             | users
```

✅ Trigger is active!

---

## 🎯 How It Works

### Automatic Profile Creation Flow

```
1. Admin adds user in Supabase Auth
   ↓
2. User is created in auth.users table
   ↓
3. Trigger fires automatically
   ↓
4. Function reads user data:
   - user_id
   - email
   - metadata (full_name, role, etc.)
   ↓
5. Profile is created in profile_info table
   ↓
6. User can immediately login! ✅
```

---

## 📝 Adding a New User

### Via Admin Dashboard

1. **Login as admin** (`sasuhai0@gmail.com`)
2. **Go to User Management** tab
3. **Click "Add New User"**
4. **Fill in details:**
   - Email: `newuser@example.com`
   - Full Name: `New User`
   - Password: `SecurePass123`
   - Role: `user` or `admin`
5. **Click "Show Instructions"**
6. **Metadata is copied to clipboard!**
7. **Follow the instructions shown**

### Via Supabase Dashboard

1. **Go to Supabase Dashboard**
2. **Authentication → Users → Add User**
3. **Fill in:**
   - Email: `newuser@example.com`
   - Password: `SecurePass123`
4. **Click "Show advanced settings"**
5. **Paste metadata** (from clipboard):
   ```json
   {
     "full_name": "New User",
     "role": "user"
   }
   ```
6. **Click "Create User"**
7. **Profile is auto-created!** ✅

---

## 🔧 Metadata Format

The trigger reads metadata from `auth.users.raw_user_meta_data`:

```json
{
  "full_name": "John Doe",
  "tagline": "Software Engineer",
  "bio": "Passionate developer",
  "role": "user"
}
```

### Default Values (if metadata not provided)

| Field | Default Value |
|-------|--------------|
| `full_name` | "New User" |
| `tagline` | "Portfolio Owner" |
| `bio` | "Welcome to my portfolio!" |
| `role` | "user" |

---

## 📊 What Gets Created

When you add a user with metadata:

```json
{
  "full_name": "Jane Smith",
  "role": "admin"
}
```

The trigger creates this profile:

```sql
INSERT INTO profile_info (
  user_id,      -- From auth.users.id
  email,        -- From auth.users.email
  full_name,    -- From metadata: "Jane Smith"
  tagline,      -- Default: "Portfolio Owner"
  bio,          -- Default: "Welcome to my portfolio!"
  role,         -- From metadata: "admin"
  created_at,   -- NOW()
  updated_at    -- NOW()
)
```

---

## ✅ Verification

### Check if Profile Was Created

After adding a user, run:

```sql
-- Check auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'newuser@example.com';

-- Check profile_info
SELECT user_id, email, full_name, role 
FROM profile_info 
WHERE email = 'newuser@example.com';
```

**Expected result:**
- ✅ User exists in `auth.users`
- ✅ Profile exists in `profile_info`
- ✅ `user_id` matches in both tables
- ✅ `role` matches metadata

---

## 🎨 Admin Dashboard Features

### Improved User Creation

The admin dashboard now:
- ✅ Shows detailed instructions
- ✅ **Copies metadata to clipboard automatically**
- ✅ Includes role in metadata
- ✅ Formats instructions clearly
- ✅ Shows expected outcome

### Example Instructions Shown

```
1. Go to Supabase Dashboard
2. Authentication → Users → Add User
3. Email: john@example.com
4. Password: SecurePass123
5. User Metadata (click "Show advanced settings"):
   {
     "full_name": "John Doe",
     "role": "user"
   }
6. Click "Create User"
7. Profile will be auto-created with role: user
```

**Plus:** Metadata is automatically copied to clipboard! 📋

---

## 🔄 Workflow Comparison

### Before (Manual)

```
1. Create user in Supabase Auth
2. Copy user_id
3. Run SQL to insert profile
4. Set role manually
5. User can login
```

### After (Automatic) ✨

```
1. Create user in Supabase Auth
2. Paste metadata (from clipboard)
3. Profile auto-created! ✅
4. User can login immediately
```

**Much faster and easier!** 🚀

---

## 🐛 Troubleshooting

### Profile Not Created

**Problem**: User exists but no profile

**Check:**
```sql
-- Is trigger active?
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check function exists
SELECT * FROM pg_proc 
WHERE proname = 'handle_new_user';
```

**Solution**: Re-run `AUTO_CREATE_PROFILE_TRIGGER.sql`

### Wrong Role Assigned

**Problem**: User has wrong role

**Check metadata:**
```sql
SELECT email, raw_user_meta_data->>'role' as metadata_role
FROM auth.users 
WHERE email = 'user@example.com';
```

**Fix:**
```sql
UPDATE profile_info 
SET role = 'admin'  -- or 'user'
WHERE email = 'user@example.com';
```

### Trigger Not Firing

**Problem**: Trigger doesn't run

**Check:**
```sql
-- Verify trigger is enabled
SELECT tgenabled FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
-- Should return 'O' (enabled)
```

**Solution**: Drop and recreate trigger

---

## 📚 Advanced Usage

### Custom Metadata Fields

You can add more fields to metadata:

```json
{
  "full_name": "John Doe",
  "tagline": "Senior Developer",
  "bio": "10 years of experience",
  "role": "admin",
  "location": "San Francisco",
  "languages": "English, Spanish"
}
```

Update the trigger function to use these fields!

### Modify Trigger Function

To add more fields:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profile_info (
    user_id,
    email,
    full_name,
    tagline,
    bio,
    role,
    location,  -- New field
    languages  -- New field
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'tagline', 'Portfolio Owner'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Welcome!'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'location',  -- New
    NEW.raw_user_meta_data->>'languages'  -- New
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ Quick Reference

### Creating a User

**Required:**
- Email
- Password

**Optional (Metadata):**
- `full_name` - User's name
- `role` - "user" or "admin"
- `tagline` - Job title
- `bio` - Short description

### Metadata Template

```json
{
  "full_name": "User Name",
  "role": "user"
}
```

### SQL to Check

```sql
-- List all users with profiles
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN profile_info p ON u.id = p.user_id
ORDER BY p.created_at DESC;
```

---

## 🎉 Summary

**Auto-profile creation is now active!**

**Benefits:**
- ✅ Faster user creation
- ✅ No manual SQL needed
- ✅ Consistent data
- ✅ Fewer errors
- ✅ Better UX

**How to use:**
1. Run trigger script (one time)
2. Add users via dashboard
3. Paste metadata (auto-copied)
4. Profiles created automatically!

**You're all set!** 🚀
