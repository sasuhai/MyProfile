# 🚀 Deployment Guide

Complete guide for deploying your Personal Profile Portal to production.

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database tables created (see DATABASE_SCHEMA.md)
- [ ] Admin user created in Supabase Auth
- [ ] Storage buckets created (profile-images, project-images)
- [ ] Environment variables ready
- [ ] Content added (profile, skills, projects)
- [ ] Application tested locally

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

#### Step 1: Prepare Your Project

1. **Build the project locally to test:**
```bash
npm run build
```

2. **Test the production build:**
```bash
npm run preview
```

#### Step 2: Deploy to Netlify

**Method A: Netlify CLI**

1. **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Login to Netlify:**
```bash
netlify login
```

3. **Initialize and deploy:**
```bash
netlify init
```

Follow the prompts:
- Create & configure a new site
- Build command: `npm run build`
- Publish directory: `dist`

4. **Deploy:**
```bash
netlify deploy --prod
```

**Method B: Netlify Dashboard**

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

#### Step 3: Configure Environment Variables

1. Go to Site Settings → Environment Variables
2. Add the following variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
3. Click "Save"
4. Trigger a new deploy to apply changes

#### Step 4: Configure Custom Domain (Optional)

1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Follow the instructions to configure DNS

### Option 2: Vercel

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy:**
```bash
vercel
```

Follow the prompts to configure your project.

3. **Deploy to production:**
```bash
vercel --prod
```

#### Step 3: Configure Environment Variables

**Via CLI:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**Via Dashboard:**
1. Go to [vercel.com](https://vercel.com) dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = your-anon-key
   ```
5. Redeploy to apply changes

### Option 3: GitHub Pages

#### Step 1: Configure Vite for GitHub Pages

Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // Replace with your repository name
})
```

#### Step 2: Add Deploy Script

Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### Step 3: Install gh-pages

```bash
npm install -D gh-pages
```

#### Step 4: Deploy

```bash
npm run deploy
```

#### Step 5: Configure GitHub Repository

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `root`
4. Save

**Note:** GitHub Pages doesn't support environment variables. You'll need to use a different approach for sensitive data.

## 🔒 Security Best Practices

### 1. Environment Variables

**Never commit `.env` files to Git!**

Add to `.gitignore`:
```
.env
.env.local
.env.production
```

### 2. Supabase Security

1. **Enable RLS (Row Level Security)**
   - Ensure all tables have RLS enabled
   - See DATABASE_SCHEMA.md for policies

2. **API Keys**
   - Use the `anon` key for client-side
   - Never expose the `service_role` key

3. **Storage Policies**
   - Configure proper access policies
   - Limit file sizes and types

### 3. Admin Access

1. **Strong Passwords**
   - Use strong, unique passwords for admin accounts
   - Enable 2FA if available

2. **Limit Admin Users**
   - Only create necessary admin accounts
   - Regularly audit user access

## 🔧 Post-Deployment Configuration

### 1. Custom Domain Setup

**Netlify:**
1. Site Settings → Domain Management
2. Add custom domain
3. Configure DNS with your domain provider:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

**Vercel:**
1. Project Settings → Domains
2. Add domain
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 2. SSL Certificate

Both Netlify and Vercel automatically provision SSL certificates. No action needed!

### 3. Performance Optimization

1. **Enable Compression**
   - Netlify and Vercel do this automatically

2. **Configure Caching**
   
   Create `netlify.toml`:
   ```toml
   [[headers]]
     for = "/assets/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   
   [[headers]]
     for = "/*.js"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   
   [[headers]]
     for = "/*.css"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

3. **Image Optimization**
   - Use WebP format when possible
   - Compress images before upload
   - Consider using Supabase image transformations

## 📊 Monitoring & Analytics

### 1. Netlify Analytics

Enable in Site Settings → Analytics

### 2. Google Analytics

Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 3. Supabase Monitoring

Check Supabase Dashboard for:
- Database usage
- API requests
- Storage usage

## 🔄 Continuous Deployment

### Automatic Deployments

Both Netlify and Vercel support automatic deployments:

1. **Connect Git Repository**
   - Link your GitHub/GitLab/Bitbucket repo
   - Every push to main branch triggers deployment

2. **Branch Previews**
   - Pull requests get preview URLs
   - Test changes before merging

3. **Build Notifications**
   - Configure Slack/Discord notifications
   - Get alerts on build success/failure

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in deployment platform
2. **Common issues:**
   - Missing environment variables
   - Node version mismatch
   - Dependency errors

**Solution:**
```bash
# Specify Node version in package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Environment Variables Not Working

1. **Ensure variables start with `VITE_`**
2. **Redeploy after adding variables**
3. **Check variable names match exactly**

### 404 Errors on Refresh

**Netlify:** Create `public/_redirects`:
```
/*    /index.html   200
```

**Vercel:** Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Supabase Connection Issues

1. **Verify environment variables**
2. **Check Supabase project status**
3. **Ensure RLS policies are correct**
4. **Check browser console for errors**

## 📱 PWA Configuration (Optional)

To make your portfolio a Progressive Web App:

1. **Install Vite PWA plugin:**
```bash
npm install -D vite-plugin-pwa
```

2. **Configure in `vite.config.js`:**
```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Your Name - Portfolio',
        short_name: 'Portfolio',
        description: 'Personal portfolio and resume',
        theme_color: '#0ea5e9',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

## ✅ Final Checklist

Before going live:

- [ ] All content is accurate and up-to-date
- [ ] Profile photo uploaded
- [ ] Projects showcase your best work
- [ ] Contact form tested and working
- [ ] All links work correctly
- [ ] Responsive design tested on mobile
- [ ] Dark/light mode working
- [ ] SEO meta tags configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics configured
- [ ] Admin login secured

## 🎉 You're Live!

Congratulations! Your portfolio is now live. Share it:

- Update LinkedIn profile
- Add to GitHub profile README
- Share on social media
- Include in job applications

## 🔄 Keeping It Updated

Regular maintenance:

1. **Update content monthly**
   - Add new projects
   - Update skills
   - Refresh experience

2. **Monitor performance**
   - Check analytics
   - Review contact messages
   - Update based on feedback

3. **Keep dependencies updated**
```bash
npm update
npm audit fix
```

---

Need help? Check the main README.md or Supabase documentation.
