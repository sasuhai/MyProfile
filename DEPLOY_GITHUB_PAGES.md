# Deploy to GitHub Pages

## 🚀 Quick Deploy

### Step 1: Update Vite Config

Add base path for GitHub Pages:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/MyProfile/', // Replace with your repo name
})
```

### Step 2: Add GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Configure GitHub Repository

1. **Go to your GitHub repo → Settings → Pages**
2. **Source:** Select "GitHub Actions"
3. **Go to Settings → Secrets and variables → Actions**
4. **Add secrets:**
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

### Step 4: Deploy

```bash
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

---

## 🔒 Security Notes

### ✅ Safe (Anon Key)
The Supabase **anon key** is designed to be public. It's safe to expose because:
- Row Level Security (RLS) protects your data
- It can only do what RLS policies allow
- It's meant for client-side apps

### ⚠️ Never Expose
- **Service Role Key** - Has admin access
- **Database password** - Direct database access
- **API secrets** - Any other sensitive keys

### 🛡️ Ensure RLS is Enabled
Check all your tables have RLS enabled:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Enable RLS if needed
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

---

## 📝 Alternative: Netlify (Recommended)

Netlify has better environment variable support:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

3. **Set environment variables in Netlify dashboard**

---

## 🧪 Test Locally First

```bash
# Build
npm run build

# Preview
npm run preview
```

Visit `http://localhost:4173` to test the production build.

---

## 🔗 Access Your Site

After deployment, your site will be at:
```
https://yourusername.github.io/MyProfile/
```

---

## ⚠️ Important Notes

1. **Don't commit `.env` file** - Add to `.gitignore`
2. **Use GitHub Secrets** for environment variables
3. **Verify RLS policies** before deploying
4. **Test thoroughly** in preview mode

---

## 🐛 Troubleshooting

### Blank page after deploy?
- Check browser console for errors
- Verify `base` in `vite.config.js` matches repo name
- Check GitHub Actions logs

### 404 on refresh?
- GitHub Pages doesn't support client-side routing by default
- Add a `404.html` that redirects to `index.html`

### Environment variables not working?
- Verify secrets are set in GitHub repo settings
- Check they're prefixed with `VITE_`
- Rebuild and redeploy

---

**Ready to deploy?** Follow the steps above! 🚀
