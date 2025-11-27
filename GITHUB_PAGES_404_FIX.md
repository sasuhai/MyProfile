# 🐛 GitHub Pages 404 Error - Troubleshooting

## Error: `GET https://sasuhai.github.io/src/main.jsx 404 (Not Found)`

This error means GitHub Pages is trying to load the source file instead of the built bundle.

---

## ✅ **Quick Fixes**

### **1. Check GitHub Actions Status**

1. Go to: `https://github.com/sasuhai/MyProfile/actions`
2. Look for "Deploy to GitHub Pages" workflow
3. Check if it's:
   - ✅ **Green checkmark** - Deployment succeeded
   - 🟡 **Yellow dot** - Still running (wait 2-3 minutes)
   - ❌ **Red X** - Failed (check logs)

**If failed, check the error logs!**

---

### **2. Verify GitHub Pages Settings**

1. Go to: `https://github.com/sasuhai/MyProfile/settings/pages`
2. Verify:
   - **Source:** GitHub Actions ✅
   - **Branch:** Should show deployment from Actions
   - **Custom domain:** Leave empty (unless you have one)

---

### **3. Add GitHub Secrets**

**IMPORTANT:** The build needs environment variables!

1. Go to: `https://github.com/sasuhai/MyProfile/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add these secrets:

**Secret 1:**
- Name: `VITE_SUPABASE_URL`
- Value: Your Supabase project URL (e.g., `https://xxx.supabase.co`)

**Secret 2:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: Your Supabase anon key

**After adding secrets:**
- Go to Actions tab
- Click on the latest workflow
- Click "Re-run all jobs"
- Wait for completion

---

### **4. Clear Browser Cache**

GitHub Pages can be cached aggressively:

1. **Hard refresh:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Or open in incognito/private mode**

3. **Or clear cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Clear data

---

### **5. Wait for Propagation**

GitHub Pages can take 5-10 minutes to fully deploy:

1. Wait 5-10 minutes after Actions complete
2. Try accessing the site again
3. Check: `https://sasuhai.github.io/MyProfile/`

---

## 🔍 **Debugging Steps**

### **Check if deployment succeeded:**

```bash
# Check the latest commit
git log -1

# Should show your latest commit with the fixes
```

### **Check Actions logs:**

1. Go to Actions tab
2. Click on latest "Deploy to GitHub Pages" run
3. Click on "build" job
4. Check each step for errors

**Common errors:**
- Missing secrets → Add them
- Build failed → Check error message
- Upload failed → Re-run workflow

---

### **Verify build locally:**

```bash
# Build
npm run build

# Check dist/index.html
cat dist/index.html | grep "script"

# Should show:
# <script type="module" crossorigin src="/MyProfile/assets/index-XXX.js"></script>
```

---

## 🚀 **Force Redeploy**

If nothing works, force a new deployment:

```bash
# Make a small change
echo "# Force deploy" >> README.md

# Commit and push
git add README.md
git commit -m "Force redeploy"
git push origin main

# Wait for Actions to complete (2-3 minutes)
# Then check your site
```

---

## 📊 **Expected URLs**

After successful deployment:

**Your site:**
```
https://sasuhai.github.io/MyProfile/
```

**Assets should load from:**
```
https://sasuhai.github.io/MyProfile/assets/index-XXX.js
https://sasuhai.github.io/MyProfile/assets/index-XXX.css
```

**NOT from:**
```
❌ https://sasuhai.github.io/src/main.jsx
❌ https://sasuhai.github.io/MyProfile/src/main.jsx
```

---

## ⚠️ **Common Issues**

### **Issue 1: Secrets not set**
**Symptom:** Build succeeds but site is blank
**Fix:** Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets

### **Issue 2: Wrong base path**
**Symptom:** Assets load from wrong URL
**Fix:** Verify `vite.config.js` has `base: '/MyProfile/'` in production mode

### **Issue 3: Cached old version**
**Symptom:** Site shows old version
**Fix:** Hard refresh (Ctrl+Shift+R) or clear cache

### **Issue 4: Workflow not running**
**Symptom:** No deployment in Actions tab
**Fix:** Push a new commit to trigger workflow

---

## ✅ **Checklist**

Before asking for help, verify:

- [ ] GitHub Actions workflow completed successfully (green checkmark)
- [ ] GitHub Secrets are set (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- [ ] GitHub Pages source is set to "GitHub Actions"
- [ ] Waited at least 5 minutes after deployment
- [ ] Tried hard refresh or incognito mode
- [ ] Checked Actions logs for errors
- [ ] `vite.config.js` has correct base path

---

## 🆘 **Still Not Working?**

**Check these:**

1. **Actions Tab:**
   - Is the workflow green? ✅
   - Any error messages? ❌

2. **Secrets:**
   - Are both secrets added? ✅
   - Are the values correct? ✅

3. **Browser:**
   - Tried incognito mode? ✅
   - Cleared cache? ✅

4. **Timing:**
   - Waited 5-10 minutes? ✅

---

## 📝 **Next Steps**

1. **Check Actions tab** - Verify deployment succeeded
2. **Add secrets** - If not already added
3. **Wait 5 minutes** - For propagation
4. **Hard refresh** - Clear cache
5. **Try again** - Visit your site

---

**Most likely issue:** Missing GitHub Secrets or deployment still in progress!

**Check:** `https://github.com/sasuhai/MyProfile/actions`
