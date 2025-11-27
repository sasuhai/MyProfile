# 🔐 Role-Based Access Control Guide

## 📋 Overview

Your portfolio system now has **role-based access control** with two roles:
- **Admin**: Full access to all features including user management
- **User**: Can only manage their own portfolio

## 🎯 Key Features

### Admin Capabilities
- ✅ Manage own portfolio
- ✅ View all users in the system
- ✅ Change user roles (promote/demote)
- ✅ Reset user passwords
- ✅ Add new users
- ✅ View user statistics
- ✅ Access User Management tab

### Regular User Capabilities
- ✅ Manage own portfolio only
- ✅ Update profile, skills, projects
- ✅ View own messages
- ❌ Cannot access User Management
- ❌ Cannot see other users' data

---

## 🚀 Setup Instructions

### Step 1: Run the Role Migration

1. **Open Supabase SQL Editor**
2. **Copy and run**: `ADD_ROLES_MIGRATION.sql`
3. This will:
   - Add `role` column to `profile_info`
   - Set `sasuhai0@gmail.com` as admin
   - Create user management table
   - Update RLS policies

### Step 2: Verify Your Admin Status

Run this query:
```sql
SELECT email, role FROM profile_info WHERE email = 'sasuhai0@gmail.com';
```

**Expected result:**
```
email                | role
---------------------+-------
sasuhai0@gmail.com   | admin
```

---

## 👥 User Management (Admin Only)

### Accessing User Management

1. Login as admin (`sasuhai0@gmail.com`)
2. Go to Admin Dashboard
3. Click **"User Management"** tab
4. You'll see:
   - User statistics
   - List of all users
   - Role management controls
   - Password reset options

### Adding a New User

**Method 1: Via Dashboard (Recommended)**

1. Click **"Add New User"** button
2. Fill in:
   - Email
   - Full Name
   - Password
   - Role (User or Admin)
3. Click **"Show Instructions"**
4. Follow the instructions to create user in Supabase

**Method 2: Manual Creation**

```sql
-- 1. Create user in Supabase Auth
-- Go to: Authentication → Users → Add User
-- Email: newuser@example.com
-- Password: [secure password]

-- 2. Get their user_id
SELECT id FROM auth.users WHERE email = 'newuser@example.com';

-- 3. Insert profile with role
INSERT INTO profile_info (user_id, email, full_name, tagline, bio, role)
VALUES (
  'user-uuid-here',
  'newuser@example.com',
  'New User Name',
  'Job Title',
  'Bio here.',
  'user'  -- or 'admin'
);
```

### Changing User Roles

**Via Dashboard:**
1. Go to User Management tab
2. Find the user
3. Use the dropdown to change role
4. Changes apply immediately

**Via SQL:**
```sql
UPDATE profile_info 
SET role = 'admin'  -- or 'user'
WHERE email = 'user@example.com';
```

### Resetting User Passwords

**Via Dashboard:**
1. Go to User Management tab
2. Find the user
3. Click **"Reset Password"** button
4. User receives password reset email

**Via SQL:**
```sql
-- User must reset via Supabase Auth
-- Or use the dashboard function
```

---

## 🔒 Security Features

### Row Level Security (RLS)

**Profile Access:**
```sql
-- Public can view all profiles (read-only)
✅ Anyone can see portfolios

-- Users can only update their own profile
✅ john@example.com can edit John's profile
❌ john@example.com cannot edit Jane's profile

-- Admins can update any profile
✅ admin@example.com can edit anyone's profile
```

**Data Isolation:**
```sql
-- Each user sees only their own data
getSkills() → WHERE user_id = current_user_id

-- Admins can see all data
getAllUsers() → WHERE role = 'admin'
```

### Admin-Only Features

These features check `isCurrentUserAdmin()`:
- User Management tab
- View all users
- Change roles
- Reset passwords
- User statistics

---

## 📊 User Statistics

Admins can see:
- **Total Users**: All users in system
- **Administrators**: Users with admin role
- **Regular Users**: Users with user role

---

## 🎯 Common Scenarios

### Scenario 1: Make Someone Admin

```sql
-- Promote user to admin
UPDATE profile_info 
SET role = 'admin' 
WHERE email = 'promote-me@example.com';
```

### Scenario 2: Demote Admin to User

```sql
-- Demote admin to regular user
UPDATE profile_info 
SET role = 'user' 
WHERE email = 'demote-me@example.com';
```

### Scenario 3: Check Who is Admin

```sql
-- List all admins
SELECT email, full_name, role 
FROM profile_info 
WHERE role = 'admin';
```

### Scenario 4: User Forgot Password

**As Admin:**
1. Go to User Management
2. Find the user
3. Click "Reset Password"
4. User receives email with reset link

---

## 🔄 Workflow Examples

### Adding a Team Member

```bash
# 1. Admin logs in
# 2. Goes to User Management
# 3. Clicks "Add New User"
# 4. Fills in details:
   Email: team@example.com
   Name: Team Member
   Role: user
# 5. Follows instructions to create in Supabase
# 6. Team member can now login and manage their portfolio
```

### Promoting a User to Admin

```bash
# 1. Admin logs in
# 2. Goes to User Management
# 3. Finds the user
# 4. Changes role dropdown from "User" to "Admin"
# 5. User now has admin privileges
```

---

## 🐛 Troubleshooting

### "Access Denied" on User Management

**Problem**: User sees "Access Denied" message

**Solution**:
```sql
-- Check their role
SELECT email, role FROM profile_info WHERE email = 'user@example.com';

-- If role is 'user', they can't access User Management
-- Promote to admin if needed
UPDATE profile_info SET role = 'admin' WHERE email = 'user@example.com';
```

### Role Not Updating

**Problem**: Changed role but user still has old permissions

**Solution**:
1. User must log out and log back in
2. Refresh the page
3. Check database:
```sql
SELECT email, role FROM profile_info WHERE email = 'user@example.com';
```

### Can't See User Management Tab

**Problem**: Admin doesn't see User Management tab

**Solution**:
1. Verify admin status:
```sql
SELECT email, role FROM profile_info WHERE email = 'your@email.com';
```

2. If role is 'user', update it:
```sql
UPDATE profile_info SET role = 'admin' WHERE email = 'your@email.com';
```

3. Log out and log back in

---

## 📝 Database Schema

### profile_info Table

```sql
CREATE TABLE profile_info (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),  -- ← New!
  -- ... other fields
);
```

### Helper Functions

```sql
-- Check if user is admin
SELECT is_admin('user-uuid-here');

-- Check if current user is admin
SELECT current_user_is_admin();
```

---

## ✅ Quick Checklist

After running the migration:

- [ ] Run `ADD_ROLES_MIGRATION.sql`
- [ ] Verify `sasuhai0@gmail.com` is admin
- [ ] Login as admin
- [ ] Access User Management tab
- [ ] See user statistics
- [ ] Test adding a new user
- [ ] Test changing user role
- [ ] Test password reset

---

## 🎉 You're All Set!

Your portfolio now has:
- ✅ Role-based access control
- ✅ Admin and User roles
- ✅ User management for admins
- ✅ Password reset functionality
- ✅ Secure data isolation

**Admin email**: `sasuhai0@gmail.com`
**Role**: Administrator

You can now manage users and their access levels! 🚀
