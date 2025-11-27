# 🌐 Multi-Domain Password Reset Solution

## 🤔 The Problem

**Your Setup:**
- ✅ One shared Supabase database
- ✅ Multiple users (john, jane, bob, etc.)
- ✅ Each user deploys to their own domain:
  - John: `johndoe.com`
  - Jane: `janesmith.com`
  - Bob: `bobjones.com`

**The Issue:**
- Supabase can only have ONE "Site URL" configured
- Password reset emails use that ONE URL
- But users are on DIFFERENT domains!

**Example Problem:**
```
Supabase Site URL: johndoe.com
Jane requests reset at: janesmith.com
Email link goes to: johndoe.com/reset-password ❌
Should go to: janesmith.com/reset-password ✅
```

---

## ✅ Solution Options

### **Option 1: Use Wildcard Redirect URLs (Recommended)**

Supabase allows wildcard patterns in redirect URLs!

**Configuration:**
```
Site URL: http://localhost:5176 (for development)

Redirect URLs:
http://localhost:*/reset-password
https://*.netlify.app/reset-password
https://*.vercel.app/reset-password
https://**/reset-password
```

**Benefits:**
- ✅ Works for all domains
- ✅ Works for all localhost ports
- ✅ Works for all subdomains
- ✅ Simple configuration

**Limitations:**
- ⚠️ Less secure (allows any domain)
- ⚠️ Supabase may restrict wildcards

---

### **Option 2: List All Domains (Most Secure)**

Add each user's domain explicitly.

**Configuration:**
```
Site URL: https://yourdomain.com (your main domain)

Redirect URLs:
http://localhost:5173/reset-password
http://localhost:5174/reset-password
http://localhost:5175/reset-password
http://localhost:5176/reset-password
https://johndoe.com/reset-password
https://janesmith.com/reset-password
https://bobjones.com/reset-password
https://johndoe.netlify.app/reset-password
https://janesmith.netlify.app/reset-password
https://bobjones.netlify.app/reset-password
```

**Benefits:**
- ✅ Most secure
- ✅ Explicit control
- ✅ Works reliably

**Limitations:**
- ⚠️ Must update when adding new users
- ⚠️ Can become long list

---

### **Option 3: Use Custom Email Template with Dynamic URL (Best for Multi-Tenant)**

Modify Supabase email template to use a dynamic redirect.

**How it works:**
1. Store user's domain in their profile
2. Custom email template reads the domain
3. Email link uses user's specific domain

**Implementation:**

**Step 1: Add domain to profile_info**
```sql
ALTER TABLE profile_info 
ADD COLUMN domain TEXT;

-- Update user domains
UPDATE profile_info SET domain = 'johndoe.com' WHERE email = 'john@example.com';
UPDATE profile_info SET domain = 'janesmith.com' WHERE email = 'jane@example.com';
```

**Step 2: Modify Supabase Email Template**

Go to: Supabase Dashboard → Authentication → Email Templates → Reset Password

```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .Token }}">Reset Password</a></p>
```

**Limitation:**
- ⚠️ Supabase templates have limited customization
- ⚠️ May not support dynamic domain lookup

---

### **Option 4: Separate Supabase Projects (Not Recommended)**

Each user gets their own Supabase project.

**Benefits:**
- ✅ Complete isolation
- ✅ Each has own domain

**Limitations:**
- ❌ Defeats purpose of shared database
- ❌ More expensive
- ❌ Harder to manage
- ❌ Not your current architecture

---

## 🎯 Recommended Solution

### **Use Option 1 + Option 2 Combined**

**For Development:**
```
Redirect URLs:
http://localhost:*/reset-password
```

**For Production:**
```
Redirect URLs:
https://johndoe.com/reset-password
https://janesmith.com/reset-password
https://bobjones.com/reset-password
https://*.netlify.app/reset-password
https://*.vercel.app/reset-password
```

**Why this works:**
- ✅ Covers all development scenarios
- ✅ Covers all production domains
- ✅ Easy to add new users
- ✅ Wildcards for hosting platforms

---

## 🔧 Implementation Steps

### **Step 1: Configure Supabase**

1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add redirect URLs:

```
http://localhost:5173/reset-password
http://localhost:5174/reset-password
http://localhost:5175/reset-password
http://localhost:5176/reset-password
https://*.netlify.app/reset-password
https://*.vercel.app/reset-password
```

4. Add specific domains as you deploy:
```
https://johndoe.com/reset-password
https://janesmith.com/reset-password
```

### **Step 2: Update Code to Use Current Domain**

The code already does this! In `src/lib/supabase.js`:

```javascript
export const resetUserPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,  // ← Uses current domain!
  })
  return { data, error }
}
```

**How it works:**
- User at `johndoe.com` requests reset
- `window.location.origin` = `https://johndoe.com`
- Email link goes to: `https://johndoe.com/reset-password` ✅

- User at `janesmith.com` requests reset
- `window.location.origin` = `https://janesmith.com`
- Email link goes to: `https://janesmith.com/reset-password` ✅

### **Step 3: Test**

1. **John's site** (`johndoe.com`):
   - Requests reset
   - Email link: `johndoe.com/reset-password` ✅

2. **Jane's site** (`janesmith.com`):
   - Requests reset
   - Email link: `janesmith.com/reset-password` ✅

---

## 📊 How It Works

### **The Flow:**

```
User at johndoe.com:
1. Clicks "Forgot password?"
2. Enters email
3. Code sends: redirectTo = "https://johndoe.com/reset-password"
4. Supabase checks: Is "https://johndoe.com/reset-password" in allowed list?
5. If YES: Sends email with that link ✅
6. If NO: Error ❌

User at janesmith.com:
1. Clicks "Forgot password?"
2. Enters email
3. Code sends: redirectTo = "https://janesmith.com/reset-password"
4. Supabase checks: Is "https://janesmith.com/reset-password" in allowed list?
5. If YES: Sends email with that link ✅
6. If NO: Error ❌
```

**Key Point:** The code dynamically sets the redirect URL based on where the user is!

---

## 🔐 Security Considerations

### **Wildcard Risks:**
```
https://*.netlify.app/reset-password
```

**Allows:**
- ✅ `johndoe.netlify.app/reset-password`
- ✅ `janesmith.netlify.app/reset-password`
- ⚠️ `malicious.netlify.app/reset-password` (if someone creates it)

**Mitigation:**
- Use wildcards only for trusted platforms (Netlify, Vercel)
- Add specific domains for custom domains
- Monitor for suspicious activity

### **Best Practice:**
```
Redirect URLs:
# Development
http://localhost:*/reset-password

# Trusted platforms
https://*.netlify.app/reset-password
https://*.vercel.app/reset-password

# Specific custom domains
https://johndoe.com/reset-password
https://janesmith.com/reset-password
https://bobjones.com/reset-password
```

---

## 📝 Maintenance Workflow

### **When Adding New User:**

1. **User deploys to new domain** (`alice.com`)
2. **Add to Supabase redirect URLs:**
   ```
   https://alice.com/reset-password
   ```
3. **Test password reset** on their domain
4. **Done!** ✅

### **Automation Option:**

Create a script to auto-update Supabase:

```javascript
// update-supabase-urls.js
const domains = [
  'johndoe.com',
  'janesmith.com',
  'bobjones.com',
  'alice.com'
]

const redirectUrls = domains.map(d => `https://${d}/reset-password`)

// Use Supabase Management API to update
// (Requires service role key)
```

---

## ✅ Summary

**The Solution:**
1. ✅ Code already uses `window.location.origin` (dynamic!)
2. ✅ Add wildcard URLs for hosting platforms
3. ✅ Add specific URLs for custom domains
4. ✅ Update Supabase when adding new users

**Supabase Configuration:**
```
Redirect URLs:
http://localhost:*/reset-password
https://*.netlify.app/reset-password
https://*.vercel.app/reset-password
https://johndoe.com/reset-password
https://janesmith.com/reset-password
https://bobjones.com/reset-password
```

**Result:**
- ✅ Each user gets reset link to THEIR domain
- ✅ Works for all deployments
- ✅ Secure and maintainable
- ✅ Easy to add new users

---

## 🎯 Action Items

1. **Update Supabase redirect URLs** with wildcards
2. **Add each user's domain** as you deploy
3. **Test** password reset on each domain
4. **Document** new domains in a list

---

**Your multi-domain setup will work perfectly!** 🎉

The code is already smart enough - just configure Supabase correctly! 🚀
