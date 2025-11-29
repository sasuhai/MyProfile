# 🔧 Fix: Database Error Creating New User

## ❌ Error Message
```
Auth error: Database error creating new user
```

---

## 🎯 Root Cause

The database trigger that automatically creates a profile when a new user is created is either:
1. Missing
2. Failing due to a constraint violation
3. Not properly configured

---

## ✅ Quick Fix

### **Step 1: Run the Fix Script**

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Copy and paste the contents of `FIX_USER_CREATION_TRIGGER.sql`
4. Click **Run**

This will:
- ✅ Recreate the trigger function with better error handling
- ✅ Drop and recreate the trigger
- ✅ Grant necessary permissions
- ✅ Check for orphaned users

---

### **Step 2: Verify the Fix**

After running the script, try creating a user again from the Access Requests Manager.

---

## 🔍 Common Causes

### **1. Missing Trigger**
The `on_auth_user_created` trigger might have been accidentally deleted.

**Solution:** Run the fix script to recreate it.

### **2. Username Conflict**
The trigger tries to create a username from the email, but it might conflict with an existing username.

**Solution:** The updated trigger handles this with better error handling.

### **3. Permission Issues**
The trigger function might not have permission to insert into `profile_info`.

**Solution:** The fix script grants all necessary permissions.

---

## 🧪 Manual Test

After fixing, test user creation:

```sql
-- Test creating a user manually
SELECT handle_new_user();
```

---

## 📊 Check for Orphaned Users

Run this query to find users without profiles:

```sql
SELECT 
    u.id,
    u.email,
    u.created_at
FROM auth.users u
LEFT JOIN public.profile_info p ON u.id = p.user_id
WHERE p.user_id IS NULL;
```

If you find any, the fix script includes a query to create profiles for them.

---

## 🔄 Alternative: Manual Profile Creation

If the trigger still doesn't work, you can create profiles manually in the `createUserWithProfile` function.

Update `src/lib/supabaseAdmin.js`:

```javascript
// After creating auth user, manually create profile
const { data: profileData, error: profileError } = await supabaseAdmin
    .from('profile_info')
    .insert({
        user_id: authData.user.id,
        email: email,
        full_name: fullName,
        username: username,
        role: role,
        must_change_password: true
    })
    .select()
    .single()

if (profileError) {
    // Delete auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    throw new Error(`Profile creation failed: ${profileError.message}`)
}
```

---

## ✅ Expected Result

After fixing:
1. ✅ User created in `auth.users`
2. ✅ Profile automatically created in `profile_info`
3. ✅ No errors
4. ✅ Access request approved successfully

---

## 🆘 Still Not Working?

If the issue persists:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Database
   - Look for trigger errors

2. **Check RLS Policies:**
   - Make sure service role can insert into `profile_info`

3. **Check Database Constraints:**
   - Verify `profile_info` table structure
   - Check for any unique constraints that might be violated

4. **Contact Support:**
   - Share the error from Supabase logs
   - Mention you're using the trigger approach

---

## 📝 Prevention

To prevent this in the future:

1. ✅ Always test user creation after database changes
2. ✅ Keep a backup of your trigger functions
3. ✅ Monitor Supabase logs for trigger errors
4. ✅ Add error handling to triggers

---

**Run the fix script now and try creating a user again!** 🚀
