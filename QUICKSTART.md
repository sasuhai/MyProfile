# 🚀 Quick Start Guide

Get your portfolio up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for free

2. **Create a New Project**
   - Click "New Project"
   - Choose organization
   - Enter project name and password
   - Select region (closest to you)
   - Wait for project to be created (~2 minutes)

3. **Get Your API Keys**
   - Go to Project Settings (gear icon)
   - Click "API" in the sidebar
   - Copy:
     - Project URL
     - `anon` `public` key

## Step 3: Configure Environment Variables

1. **Copy the sample env file:**
```bash
cp .env.sample .env
```

2. **Edit `.env` and add your Supabase credentials:**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database

1. **Go to Supabase SQL Editor**
   - In your Supabase dashboard
   - Click "SQL Editor" in sidebar
   - Click "New Query"

2. **Copy and run the complete setup script from `DATABASE_SCHEMA.md`**
   - This creates all tables
   - Sets up Row Level Security
   - Inserts sample data

3. **Create Storage Buckets**
   - Go to Storage in Supabase dashboard
   - Create bucket: `profile-images` (Public)
   - Create bucket: `project-images` (Public)

## Step 5: Create Admin User

1. **Go to Authentication in Supabase**
   - Click "Users" tab
   - Click "Add User"
   - Enter email and password
   - Click "Create User"

2. **Note these credentials** - you'll use them to log in to `/admin/login`

## Step 6: Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Step 7: Access Admin Dashboard

1. Navigate to `http://localhost:5173/admin/login`
2. Sign in with the credentials you created
3. Start adding your content!

## 🎯 What to Do First

### 1. Update Your Profile
- Go to Admin Dashboard → Profile tab
- Add your name, tagline, bio
- Upload profile photo
- Add social links

### 2. Add Skills
- Go to Skills tab
- Add your technical skills
- Organize by category
- Set proficiency levels

### 3. Add Projects
- Go to Projects tab
- Add your best projects
- Upload project images
- Add demo and GitHub links

### 4. Add Resume Items
- Go to Resume tab
- Add education
- Add work experience
- Add certifications

## 📱 View Your Portfolio

Navigate to:
- Home: `http://localhost:5173/`
- About: `http://localhost:5173/about`
- Resume: `http://localhost:5173/resume`
- Portfolio: `http://localhost:5173/portfolio`
- Contact: `http://localhost:5173/contact`

## 🎨 Customization Tips

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color',
    600: '#your-color',
  }
}
```

### Change Fonts
1. Update Google Fonts import in `src/index.css`
2. Update font family in `tailwind.config.js`

### Modify Content
All content is managed through the admin dashboard - no code changes needed!

## 🐛 Common Issues

### "Failed to fetch" error
- Check if Supabase URL and key are correct in `.env`
- Ensure Supabase project is active
- Check browser console for specific errors

### Admin login not working
- Verify you created a user in Supabase Authentication
- Check email and password are correct
- Ensure RLS policies are set up correctly

### Images not uploading
- Check if storage buckets exist
- Verify bucket names match: `profile-images`, `project-images`
- Ensure buckets are set to Public
- Check file size (max 2MB for profile, 5MB for projects)

## 📚 Next Steps

1. **Add More Content**
   - Fill in all sections
   - Add multiple projects
   - Complete your resume

2. **Test Everything**
   - Try the contact form
   - Test dark/light mode
   - Check mobile responsiveness

3. **Deploy to Production**
   - See `DEPLOYMENT_GUIDE.md` for detailed instructions
   - Recommended: Netlify or Vercel

4. **Share Your Portfolio**
   - Add to LinkedIn
   - Update GitHub profile
   - Share on social media

## 🆘 Need Help?

- Check `README.md` for full documentation
- Review `DATABASE_SCHEMA.md` for database details
- See `DEPLOYMENT_GUIDE.md` for deployment help
- Visit [Supabase Docs](https://supabase.com/docs)

## 🎉 You're Ready!

Your portfolio is set up and ready to showcase your work. Good luck! 🚀
