# 🔧 Fix Password Reset Link - Supabase Configuration

## 🐛 Problem

The password reset link from Supabase is pointing to a blank page because Supabase doesn't know about your local development URL.

---

## ✅ Solution

You need to configure the redirect URL in Supabase settings.

### **Step 1: Configure Supabase Redirect URLs**

1. **Go to Supabase Dashboard**
   - Open your project: https://supabase.com/dashboard

2. **Navigate to Authentication Settings**
   - Click **Authentication** in sidebar
   - Click **URL Configuration**

3. **Add Redirect URLs**
   
   Add these URLs to **"Redirect URLs"** section:
   
   **For Local Development:**
   ```
   http://localhost:5173/reset-password
   http://localhost:5174/reset-password
   http://localhost:5175/reset-password
   http://localhost:5176/reset-password
   http://localhost:3000/reset-password
   ```
   
   **For Production (when deployed):**
   ```
   https://yourdomain.com/reset-password
   https://yourdomain.netlify.app/reset-password
   https://yourdomain.vercel.app/reset-password
   ```

4. **Set Site URL**
   
   In **"Site URL"** field, set:
   
   **For Development:**
   ```
   http://localhost:5176
   ```
   
   **For Production:**
   ```
   https://yourdomain.com
   ```

5. **Save Changes**
   - Click **Save** button
   - Wait a few seconds for changes to apply

---

## 🧪 Test the Fix

### **Step 1: Request Password Reset**

1. Go to login page: `http://localhost:5176/admin/login`
2. Click **"Forgot password?"**
3. Enter your email: `sasuhai0@gmail.com`
4. Click **"Send Reset Link"**
5. Success modal appears ✅

### **Step 2: Check Email**

1. Open your email inbox
2. Find email from Supabase
3. Subject: **"Reset your password"**
4. Click the reset link

### **Step 3: Verify Redirect**

The link should now open:
```
http://localhost:5176/reset-password#access_token=...
```

**NOT a blank page!** ✅

---

## 📧 Email Link Format

Supabase sends a link like this:
```
http://localhost:5176/reset-password#access_token=eyJhbGc...&type=recovery
```

The page:
1. ✅ Checks the token
2. ✅ Shows password reset form
3. ✅ Allows user to set new password

---

## 🔍 Troubleshooting

### **Still Getting Blank Page?**

**Check 1: Verify URL Configuration**
```
Supabase Dashboard → Authentication → URL Configuration
- Site URL: http://localhost:5176
- Redirect URLs: http://localhost:5176/reset-password
```

**Check 2: Clear Browser Cache**
```
1. Close all browser tabs
2. Clear cache (Ctrl+Shift+Delete)
3. Restart browser
4. Try again
```

**Check 3: Check Dev Server Port**
```bash
# Check which port your dev server is running on
npm run dev

# Look for:
# ➜  Local:   http://localhost:5176/
```

**Check 4: Update Redirect URL in Code**

The redirect URL is set when calling `resetUserPassword`. Let me check if we need to update it:

---

## 🔧 Alternative: Update Code to Specify Redirect

If Supabase settings don't work, we can specify the redirect URL in code.

Update `src/lib/supabase.js`:

```javascript
// Reset user password (admin only)
export const resetUserPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:5176/reset-password',  // Specify exact URL
  })

  return { data, error }
}
```

**For Production**, use environment variable:

```javascript
export const resetUserPassword = async (email) => {
  const redirectUrl = import.meta.env.PROD 
    ? 'https://yourdomain.com/reset-password'
    : 'http://localhost:5176/reset-password'
    
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  return { data, error }
}
```

---

## 📝 Quick Fix Checklist

- [ ] Go to Supabase Dashboard
- [ ] Authentication → URL Configuration
- [ ] Add redirect URLs (all localhost ports)
- [ ] Set Site URL to http://localhost:5176
- [ ] Save changes
- [ ] Clear browser cache
- [ ] Test password reset
- [ ] Click email link
- [ ] Should open reset page (not blank!)

---

## 🎯 Expected Result

After configuration:

1. **Request reset** → Success modal ✅
2. **Check email** → Email received ✅
3. **Click link** → Opens reset page ✅
4. **See form** → Password reset form ✅
5. **Enter password** → Can reset ✅
6. **Redirect to login** → Can login ✅

---

## 🚀 Production Deployment

When you deploy to production:

1. **Update Supabase Settings**
   ```
   Site URL: https://yourdomain.com
   Redirect URLs: https://yourdomain.com/reset-password
   ```

2. **Update Environment Variables**
   ```
   VITE_APP_URL=https://yourdomain.com
   ```

3. **Code will auto-detect** production vs development

---

## 📞 Still Not Working?

If the issue persists:

1. **Check Supabase Email Templates**
   - Go to: Authentication → Email Templates
   - Look at "Reset Password" template
   - Verify it uses `{{ .ConfirmationURL }}`

2. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors
   - Check Network tab

3. **Verify Route Exists**
   - Check `src/App.jsx` has:
   ```jsx
   <Route path="/reset-password" element={<ResetPassword />} />
   ```

---

## ✅ Summary

**The fix:**
1. Configure Supabase redirect URLs
2. Add all localhost ports
3. Set correct Site URL
4. Save and test

**Should work after:**
- Supabase settings updated
- Browser cache cleared
- New reset email requested

---

**Follow these steps and the reset link will work!** 🎉
