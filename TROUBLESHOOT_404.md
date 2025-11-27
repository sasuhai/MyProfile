# 🐛 Troubleshooting GitHub Pages 404 Error

## Issue: `main.jsx:1 Failed to load resource: 404`

This error means the JavaScript files aren't loading correctly. Here's how to fix it:

---

## ✅ **Solution 1: Check GitHub Pages Settings**

1. **Go to GitHub Repository → Settings → Pages**
2. **Verify:**
   - Source: **GitHub Actions** ✅
   - Branch: Should show deployment from Actions
3. **Check Actions tab:**
   - Go to **Actions** tab in your repo
   - Look for "Deploy to GitHub Pages" workflow
   - Check if it completed successfully (green checkmark)

---

## ✅ **Solution 2: Verify Environment Variables**

1. **Go to Settings → Secrets and variables → Actions**
2. **Add these secrets if missing:**
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

---

## ✅ **Solution 3: Rebuild and Deploy**

The workflow file was just created. You need to trigger a new deployment:

```bash
# Make a small change to trigger deployment
echo "# Deployment trigger" >> README.md

# Commit and push
git add .
git commit -m "Trigger GitHub Pages deployment"
git push origin main
```

Then:
1. Go to **Actions** tab in GitHub
2. Watch the deployment progress
3. Wait 2-3 minutes for completion
4. Visit: `https://yourusername.github.io/MyProfile/`

---

## ✅ **Solution 4: Test Locally First**

Before deploying, test the production build:

```bash
# Build for production
npm run build

# Preview the build
npm run preview
```

Visit `http://localhost:4173/MyProfile/` to test.

**If it works locally but not on GitHub Pages:**
- The issue is with GitHub Pages configuration
- Check the Actions logs for errors

---

## 🔍 **Common Issues**

### **Issue: Base path mismatch**
**Fix:** Verify `vite.config.js` has:
```js
base: '/MyProfile/', // Must match your repo name
```

### **Issue: Workflow not running**
**Fix:** 
- Check `.github/workflows/deploy.yml` exists
- Push a new commit to trigger it
- Check Actions tab for errors

### **Issue: Secrets not set**
**Fix:**
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in GitHub Secrets
- Rebuild and deploy

### **Issue: 404 on page refresh**
**Fix:**
- This is normal for SPAs on GitHub Pages
- The `404.html` file helps with this
- Users can navigate via the app

---

## 📊 **Check Deployment Status**

1. **GitHub Actions Tab:**
   - Should show "Deploy to GitHub Pages" workflow
   - Status should be green (✓)

2. **GitHub Pages Settings:**
   - Should show: "Your site is live at https://..."
   - May take 2-3 minutes after Actions complete

3. **Browser Console:**
   - If you see 404 errors, check the file paths
   - Should load from `/MyProfile/assets/...`

---

## 🚀 **Quick Fix: Trigger Deployment**

Run these commands:

```bash
# Add 404.html to public folder (already done)
git add public/404.html

# Commit
git commit -m "Add 404 page for SPA routing"

# Push to trigger deployment
git push origin main
```

Wait 2-3 minutes, then check:
- **Actions tab** - Deployment should be running
- **Your site** - Should load after deployment completes

---

## 🆘 **Still Not Working?**

**Check these:**

1. **Is the workflow running?**
   - Go to Actions tab
   - Should see "Deploy to GitHub Pages" running or completed

2. **Are there errors in Actions logs?**
   - Click on the workflow run
   - Check each step for errors
   - Common: Missing secrets, build errors

3. **Is GitHub Pages enabled?**
   - Settings → Pages
   - Source must be "GitHub Actions"

4. **Is the base path correct?**
   - `vite.config.js` → `base: '/MyProfile/'`
   - Must match your repository name exactly

---

## 📝 **Next Steps**

1. **Commit the 404.html file:**
   ```bash
   git add public/404.html
   git commit -m "Add 404 page"
   git push origin main
   ```

2. **Watch the deployment:**
   - Go to Actions tab
   - Wait for green checkmark

3. **Test your site:**
   - Visit `https://yourusername.github.io/MyProfile/`
   - Should load without 404 errors

---

**The 404.html file has been created. Commit and push it to trigger a new deployment!** 🚀
