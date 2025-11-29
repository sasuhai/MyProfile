# 🚀 Quick Setup: Forced Password Change Feature

## What This Does

This feature automatically prompts users to change their password when they login for the first time with a temporary password set by an admin.

---

## ⚡ Quick Setup (3 Steps)

### **Step 1: Apply Database Migration**

Run this SQL in your Supabase SQL Editor:

```sql
-- Add must_change_password flag to profile_info table
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Update existing users to not require password change
UPDATE profile_info 
SET must_change_password = false 
WHERE must_change_password IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_must_change_password 
ON profile_info(must_change_password) 
WHERE must_change_password = true;
```

**Or** run the migration file:
```bash
# Copy the contents of ADD_PASSWORD_CHANGE_FLAG.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

---

### **Step 2: Verify Installation**

Check that all files are in place:

```bash
# Check if files exist
ls -la src/components/admin/ChangePasswordModal.jsx
ls -la src/pages/admin/AdminLogin.jsx
ls -la src/lib/supabaseAdmin.js
ls -la ADD_PASSWORD_CHANGE_FLAG.sql
ls -la FORCED_PASSWORD_CHANGE_GUIDE.md
```

All files should exist ✅

---

### **Step 3: Test the Feature**

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Login as admin** and go to User Management

3. **Create a test user:**
   - Email: `test@example.com`
   - Password: `TempPass123`
   - Username: `testuser`
   - Role: Regular User

4. **Logout** and login as the test user

5. **Password change modal should appear!** 🎉

6. **Change password** to something like `NewSecure123`

7. **You should be redirected to dashboard**

8. **Logout and login again** - should go straight to dashboard (no modal)

---

## ✅ That's It!

Your forced password change feature is now active.

**What happens now:**
- ✅ When admin creates a new user → `must_change_password = true`
- ✅ When user logs in first time → Password change modal appears
- ✅ User must change password → Cannot skip or close modal
- ✅ After password change → `must_change_password = false`
- ✅ Future logins → Go straight to dashboard

---

## 📖 Full Documentation

For detailed information, see: **FORCED_PASSWORD_CHANGE_GUIDE.md**

---

## 🐛 Quick Troubleshooting

**Modal doesn't appear?**
```sql
-- Check if column exists
SELECT must_change_password FROM profile_info LIMIT 1;

-- Manually set flag for testing
UPDATE profile_info 
SET must_change_password = true 
WHERE email = 'test@example.com';
```

**Password change fails?**
- Check browser console for errors
- Ensure password meets requirements (8+ chars, uppercase, lowercase, number)
- Verify user is authenticated

---

**Feature ready to use!** 🚀
