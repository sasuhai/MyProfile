# 🔧 Fix Password Reset Blank Screen

## ❌ **Problem:**
When clicking the password reset link from email, you get a blank screen.

## ✅ **Solution:**

### **Step 1: Configure Supabase Redirect URLs**

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Select your project**

3. **Go to:** Authentication → URL Configuration

4. **Add Redirect URLs:**
   
   **For Netlify (Production):**
   ```
   https://your-site-name.netlify.app/reset-password
   ```
   
   **For Local Development:**
   ```
   http://localhost:5173/reset-password
   ```

5. **Site URL:**
   Set this to your main site URL:
   ```
   https://your-site-name.netlify.app
   ```

6. **Click "Save"**

---

### **Step 2: Update Email Template (Optional)**

By default, Supabase sends a magic link. You can customize the email template:

1. **Go to:** Authentication → Email Templates
2. **Select:** "Reset Password"
3. **Verify the redirect URL** in the template uses:
   ```
   {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
   ```

---

### **Step 3: Test the Flow**

1. **Request password reset** from login page
2. **Check email**
3. **Click the reset link**
4. **Should redirect to:** `https://your-site.netlify.app/reset-password`
5. **Page should load** with the reset password form

---

## 🔍 **Troubleshooting:**

### **Issue 1: Still Blank Screen**

**Check browser console for errors:**
- Press F12 → Console tab
- Look for errors

**Common causes:**
- Redirect URL not added to Supabase
- Wrong redirect URL format
- Browser blocking the redirect

---

### **Issue 2: "Invalid or expired reset link"**

**Causes:**
- Link was already used
- Link expired (valid for 1 hour)
- Session not properly set

**Fix:**
- Request a new password reset link
- Use the link within 1 hour
- Don't click the link multiple times

---

### **Issue 3: Redirect to Wrong URL**

**Check:**
1. Supabase Site URL is correct
2. Redirect URLs include `/reset-password` path
3. Protocol matches (http vs https)

---

## 📝 **Correct Supabase Configuration:**

### **Authentication → URL Configuration:**

```
Site URL:
https://your-site-name.netlify.app

Redirect URLs:
https://your-site-name.netlify.app/reset-password
http://localhost:5173/reset-password
https://your-site-name.netlify.app/admin/dashboard
```

### **Why these URLs:**

- **Site URL:** Main domain of your app
- **reset-password:** Where users land after clicking email link
- **localhost:** For local testing
- **admin/dashboard:** Where users go after login

---

## 🎯 **Complete Password Reset Flow:**

1. **User clicks "Forgot Password"** on login page
2. **Enters email** and submits
3. **Receives email** from Supabase
4. **Clicks reset link** in email
5. **Redirected to:** `/reset-password` with token in URL
6. **Page loads** with password reset form
7. **User enters new password**
8. **Submits form**
9. **Redirected to:** `/admin/login`
10. **User logs in** with new password

---

## ⚙️ **Netlify Configuration (Already Done)**

Your `netlify.toml` already has the correct redirect rule:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures all routes (including `/reset-password`) work correctly.

---

## 🔐 **Security Notes:**

- Reset links expire after 1 hour
- Links can only be used once
- User must be in your database to reset password
- Password must be at least 6 characters

---

## ✅ **Quick Checklist:**

- [ ] Added redirect URLs to Supabase
- [ ] Site URL is correct
- [ ] Email template uses correct redirect
- [ ] Tested password reset flow
- [ ] Link opens reset password page
- [ ] Can set new password
- [ ] Redirects to login after reset

---

## 🆘 **Still Not Working?**

**Check these:**

1. **Browser Console:**
   - Any JavaScript errors?
   - Network tab shows 404?

2. **Supabase Logs:**
   - Go to Logs in Supabase dashboard
   - Check for authentication errors

3. **Email Link:**
   - Copy the full URL from email
   - Does it include `#access_token=...`?
   - Try pasting it directly in browser

4. **Netlify Deploy:**
   - Is the latest code deployed?
   - Check deploy logs for errors

---

## 📧 **Example Reset Email URL:**

```
https://your-site.netlify.app/reset-password#access_token=eyJhbGc...&expires_in=3600&refresh_token=...&token_type=bearer&type=recovery
```

The `#access_token` part is automatically handled by Supabase Auth.

---

**After configuring Supabase redirect URLs, the password reset should work!** 🎉
