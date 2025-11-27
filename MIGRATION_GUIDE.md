# 🔄 Migration Guide: Upgrading to Multi-User

## ⚠️ Current Situation

You have:
- ✅ Existing database with single-user schema
- ✅ Some data already in the database
- ❌ No `user_id` columns yet

You need:
- ✅ Add `user_id` columns to all tables
- ✅ Link existing data to your user account
- ✅ Update to multi-user schema

---

## 📝 Step-by-Step Migration

### **Step 1: Create Your User in Supabase Auth**

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**
4. Enter:
   - **Email**: `sasuhai0@gmail.com`
   - **Password**: [Choose a secure password]
5. Click **"Create User"**
6. ✅ User created!

---

### **Step 2: Get Your User ID**

1. Go to **Supabase SQL Editor**
2. Run this query:

```sql
SELECT id, email FROM auth.users WHERE email = 'sasuhai0@gmail.com';
```

3. **Copy the UUID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
4. **Keep this handy** - you'll need it in Step 4

---

### **Step 3: Run Migration Script (Part 1)**

1. Open the file: **`MIGRATION_SINGLE_TO_MULTIUSER.sql`**
2. **Copy lines 1-50** (the ALTER TABLE commands)
3. Go to **Supabase SQL Editor**
4. **Paste and run** the script
5. ✅ This adds `user_id` columns to all tables

---

### **Step 4: Link Your Data to Your User**

1. In **Supabase SQL Editor**, run these commands
2. **IMPORTANT**: Replace `YOUR-USER-ID-HERE` with the UUID from Step 2

```sql
-- Replace YOUR-USER-ID-HERE with your actual UUID!

-- Update profile
UPDATE profile_info 
SET 
  user_id = 'YOUR-USER-ID-HERE',
  email = 'sasuhai0@gmail.com'
WHERE id = 1;

-- Update skills
UPDATE skills 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;

-- Update education
UPDATE education 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;

-- Update work experience
UPDATE work_experience 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;

-- Update certifications
UPDATE certifications 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;

-- Update projects
UPDATE projects 
SET user_id = 'YOUR-USER-ID-HERE'
WHERE user_id IS NULL;

-- Update messages
UPDATE messages 
SET portfolio_owner_id = 'YOUR-USER-ID-HERE'
WHERE portfolio_owner_id IS NULL;
```

3. ✅ Your existing data is now linked to your user!

---

### **Step 5: Run Migration Script (Part 2)**

1. Open **`MIGRATION_SINGLE_TO_MULTIUSER.sql`**
2. **Copy from line 90 to the end** (ALTER COLUMN, policies, indexes)
3. Go to **Supabase SQL Editor**
4. **Paste and run** the script
5. ✅ Schema is now fully migrated!

---

### **Step 6: Verify Migration**

Run this query to verify:

```sql
SELECT 
  'profile_info' as table_name, 
  COUNT(*) as rows, 
  COUNT(DISTINCT user_id) as unique_users 
FROM profile_info
UNION ALL
SELECT 'skills', COUNT(*), COUNT(DISTINCT user_id) FROM skills
UNION ALL
SELECT 'projects', COUNT(*), COUNT(DISTINCT user_id) FROM projects;
```

**Expected result:**
```
table_name    | rows | unique_users
--------------+------+-------------
profile_info  |   1  |      1
skills        |   X  |      1
projects      |   X  |      1
```

✅ All data should have `unique_users = 1` (your user)

---

### **Step 7: Test Your Portfolio**

1. **Restart dev server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Visit your portfolio**:
   - Public: `http://localhost:5173/`
   - Admin: `http://localhost:5173/admin/login`

3. **Login with**:
   - Email: `sasuhai0@gmail.com`
   - Password: [password you set in Step 1]

4. ✅ You should see your existing data!

---

## 🎯 Quick Migration (All Steps Combined)

If you want to do it all at once:

### 1. Create User
```
Supabase → Authentication → Users → Add User
Email: sasuhai0@gmail.com
Password: [your password]
```

### 2. Get User ID
```sql
SELECT id FROM auth.users WHERE email = 'sasuhai0@gmail.com';
-- Copy the UUID
```

### 3. Run Complete Migration
Open `MIGRATION_SINGLE_TO_MULTIUSER.sql`, replace `YOUR-USER-ID-HERE` with your UUID, and run the entire script.

---

## ✅ After Migration

You can now:
- ✅ Add more users to the database
- ✅ Deploy multiple portfolios
- ✅ Each deployment shows different user's data
- ✅ All users share one database

---

## 🔄 Adding More Users Later

After migration, to add a new user:

```sql
-- 1. Create user in Supabase Auth
-- Email: newuser@example.com

-- 2. Get their user_id
SELECT id FROM auth.users WHERE email = 'newuser@example.com';

-- 3. Insert their profile
INSERT INTO profile_info (user_id, email, full_name, tagline, bio)
VALUES (
  'their-user-id',
  'newuser@example.com',
  'New User',
  'Job Title',
  'Bio here.'
);

-- 4. Deploy with their email in portfolio.config.js
```

---

## 🐛 Troubleshooting

### "Column user_id does not exist"
- You're on Step 3 - run the ALTER TABLE commands first

### "Null value in column user_id"
- You're on Step 4 - run the UPDATE commands with your UUID

### "User not found"
- Go back to Step 1 - create user in Supabase Auth first

### Can't login
- Use the email and password from Step 1
- Check user exists in Supabase Auth

---

## 📋 Migration Checklist

- [ ] Step 1: Created user in Supabase Auth
- [ ] Step 2: Got user UUID
- [ ] Step 3: Added user_id columns
- [ ] Step 4: Linked existing data to user
- [ ] Step 5: Updated policies and constraints
- [ ] Step 6: Verified migration
- [ ] Step 7: Tested portfolio
- [ ] ✅ Migration complete!

---

## 🎉 You're Done!

Your database is now multi-user ready! 🚀

**Next**: See `MULTIUSER_SETUP_GUIDE.md` to add more users.
