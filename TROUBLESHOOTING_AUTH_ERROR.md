# 🔧 Troubleshooting: Auth Error When Creating User

## ❌ Error: "Auth error"

This error occurs when the service role key is not configured correctly.

---

## ✅ Quick Fix

### **Step 1: Check Your .env File**

Open `.env` file and verify you have:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Step 2: Get Service Role Key**

1. **Go to Supabase Dashboard**
2. **Your Project → Settings → API**
3. **Scroll to "Project API keys"**
4. **Find "service_role" key** (NOT "anon" key!)
5. **Click "Reveal" to see the key**
6. **Copy the entire key**

### **Step 3: Add to .env**

```bash
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MzY0ODU5NzAsImV4cCI6MTk1MjA2MTk3MH0.xxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Important:** 
- Use the **service_role** key (not anon key)
- Copy the ENTIRE key
- No spaces before or after
- No quotes needed

### **Step 4: Restart Dev Server**

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🔍 How to Verify

### **Check Console**

Open browser console (F12). You should see:

✅ **If configured correctly:**
```
(No error messages about service key)
```

❌ **If NOT configured:**
```
❌ VITE_SUPABASE_SERVICE_ROLE_KEY is not set in .env file
📝 Please add it to your .env file:
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🎯 Common Mistakes

### **1. Using Anon Key Instead of Service Role Key**

❌ **Wrong:**
```bash
# This is the ANON key (public key)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjM2NDg1OTcwLCJleHAiOjE5NTIwNjE5NzB9.xxx
```

✅ **Correct:**
```bash
# This is the SERVICE ROLE key (admin key)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0IiwiYXVkIjoiYXV0aGVudGljYXRlZCIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MzY0ODU5NzAsImV4cCI6MTk1MjA2MTk3MH0.xxx
```

**How to tell the difference:**
- Decode the JWT at https://jwt.io
- Look for `"role"` field
- Should say `"service_role"` (not `"anon"`)

### **2. Missing VITE_ Prefix**

❌ **Wrong:**
```bash
SUPABASE_SERVICE_ROLE_KEY=xxx
```

✅ **Correct:**
```bash
VITE_SUPABASE_SERVICE_ROLE_KEY=xxx
```

Vite requires `VITE_` prefix for environment variables!

### **3. Not Restarting Dev Server**

After changing `.env`, you MUST restart:
```bash
# Stop (Ctrl+C)
npm run dev
```

### **4. Spaces in .env File**

❌ **Wrong:**
```bash
VITE_SUPABASE_SERVICE_ROLE_KEY = xxx
VITE_SUPABASE_SERVICE_ROLE_KEY= xxx
VITE_SUPABASE_SERVICE_ROLE_KEY =xxx
```

✅ **Correct:**
```bash
VITE_SUPABASE_SERVICE_ROLE_KEY=xxx
```

No spaces around `=`

---

## 📝 Complete .env Example

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNjQ4NTk3MCwiZXhwIjoxOTUyMDYxOTcwfQ.xxxxxxxxx

# Admin API (for user creation)
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjM2NDg1OTcwLCJleHAiOjE5NTIwNjE5NzB9.yyyyyyyyy
```

---

## 🧪 Test It

### **Step 1: Check Console**

1. Open browser (F12)
2. Go to Console tab
3. Look for error messages

### **Step 2: Try Creating User**

1. Go to User Management
2. Click "Add New User"
3. Fill in details
4. Click "Create User"

### **Expected Results:**

✅ **Success:**
```
✅ User created successfully! Accessible at /username
```

❌ **Service key not configured:**
```
❌ Service role key not configured. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file.
```

❌ **Wrong key:**
```
❌ Auth error: Invalid API key
```

---

## 🔐 Security Check

### **Is .env in .gitignore?**

Check `.gitignore` file:
```
.env
.env.local
.env.*.local
```

✅ Should be there!

### **Never Commit .env**

```bash
# Check if .env is tracked
git status

# If .env appears, it's NOT ignored!
# Add it to .gitignore immediately
```

---

## 📞 Still Not Working?

### **Check These:**

1. ✅ Service role key is correct
2. ✅ Has `VITE_` prefix
3. ✅ No spaces in .env
4. ✅ Dev server restarted
5. ✅ Browser console checked
6. ✅ Using service_role (not anon)

### **Get More Info:**

Add this to your code temporarily:
```javascript
console.log('Service key configured:', isServiceKeyConfigured())
console.log('Service key length:', import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY?.length)
```

Should show:
```
Service key configured: true
Service key length: 200+ (long string)
```

---

## ✅ Summary

**Most common issue:** Using anon key instead of service role key

**Quick fix:**
1. Get service_role key from Supabase
2. Add to .env with VITE_ prefix
3. Restart dev server
4. Try again

---

**The service role key is essential for automated user creation!** 🔑

Make sure you're using the correct key from Supabase! 🚀
