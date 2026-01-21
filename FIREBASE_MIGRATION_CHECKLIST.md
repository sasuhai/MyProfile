# Firebase Migration Checklist

## Pre-Migration Checklist

### Setup Complete ✅
- [x] Firebase package installed
- [x] Firebase configuration file created (`src/lib/firebase.js`)
- [x] Environment variables added to `.env`
- [x] Environment variables protected (in `.gitignore`)
- [x] Migration script created (`migrate-to-firebase.js`)
- [x] Import update script created (`update-imports.js`)
- [x] Migration guide documentation created

## Firebase Console Setup

### 1. Firestore Database Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com/project/portfolio-4c304)
- [ ] Navigate to **Firestore Database**
- [ ] Click **Create Database**
- [ ] Choose **Production mode**
- [ ] Select your preferred region (closest to your users)
- [ ] Click **Enable**

### 2. Authentication Setup
- [ ] Navigate to **Authentication**
- [ ] Click **Get Started**
- [ ] Click **Email/Password** under Sign-in providers
- [ ] Enable **Email/Password**
- [ ] Click **Save**

### 3. Storage Setup
- [ ] Navigate to **Storage**
- [ ] Click **Get Started**
- [ ] Start in **Production mode**
- [ ] Click **Done**

### 4. Security Rules - Firestore

📋 Copy and paste this to Firestore Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /profile_info/{profileId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /skills/{skillId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /education/{eduId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /work_experience/{workId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /certifications/{certId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /projects/{projectId} {
      allow read: if resource.data.published == true || isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    match /contact_messages/{messageId} {
      allow create: if true;
      allow read: if isAuthenticated();
    }
    
    match /custom_resume_sections/{sectionId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /about_features/{featureId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

- [ ] Go to **Firestore Database** → **Rules**
- [ ] Replace existing rules with above
- [ ] Click **Publish**

### 5. Security Rules - Storage

📋 Copy and paste this to Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /project-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

- [ ] Go to **Storage** → **Rules**
- [ ] Replace existing rules with above
- [ ] Click **Publish**

### 6. Create Admin User in Firebase
- [ ] Go to **Authentication** → **Users**
- [ ] Click **Add User**
- [ ] Enter your admin email
- [ ] Enter a temporary password
- [ ] Click **Add User**
- [ ] **Important**: Remember the email and password for later

## Data Migration

### Step 1: Backup Current Supabase Data
- [ ] Go to Supabase Dashboard
- [ ] Export all tables as CSV (optional, for safety)
- [ ] Save backups to `backup/firebase-migration-backup-[date]/`

### Step 2: Run Migration Script
```bash
node migrate-to-firebase.js
```

- [ ] Run the migration script
- [ ] Monitor console output for errors
- [ ] Take note of migration summary

### Step 3: Verify Migrated Data
- [ ] Open [Firebase Console](https://console.firebase.google.com/project/portfolio-4c304/firestore)
- [ ] Check each collection exists:
  - [ ] `profile_info`
  - [ ] `skills`
  - [ ] `education`
  - [ ] `work_experience`
  - [ ] `certifications`
  - [ ] `projects`
  - [ ] `contact_messages`
  - [ ] `custom_resume_sections`
  - [ ] `about_features`
- [ ] Verify record counts match Supabase
- [ ] Spot-check a few records for data accuracy

### Step 4: Create Profile for Admin User
The migration script copies data but doesn't create auth users. You need to manually create a profile for your admin user.

- [ ] In Firebase Console → Firestore
- [ ] Go to `profile_info` collection
- [ ] Click **Add Document**
- [ ] Use Auto-ID or custom ID
- [ ] Add these fields:
  ```
  user_id: [copy from Authentication → Users → UID]
  email: [your admin email]
  username: [your username]
  full_name: [your name]
  role: admin
  tagline: [your tagline]
  bio: [your bio]
  created_at: [timestamp - use Firebase server timestamp]
  updated_at: [timestamp - use Firebase server timestamp]
  ```
- [ ] Click **Save**

## Code Migration

### Step 1: Update Imports Automatically
```bash
node update-imports.js
```

- [ ] Run the import update script
- [ ] Review the output summary
- [ ] Note which files were updated

### Step 2: Manual Code Review

Review these critical files manually:

- [ ] `src/pages/admin/AdminLogin.jsx`
  - [ ] Update auth state change listeners
  - [ ] Update session handling
  
- [ ] `src/pages/admin/AdminDashboard.jsx`
  - [ ] Verify all database queries work
  - [ ] Check user management functions
  
- [ ] `src/pages/ResetPassword.jsx`
  - [ ] Update password reset flow
  - [ ] Check auth state handling

- [ ] `src/components/Footer.jsx`
  - [ ] Update "Made with" text from Supabase to Firebase

### Step 3: Delete/Archive Old Files

**Option A: Archive (Recommended)**
```bash
mkdir -p backup/supabase-files
mv src/lib/supabase.js backup/supabase-files/
mv src/lib/supabaseAdmin.js backup/supabase-files/
```

**Option B: Delete**
- [ ] Delete `src/lib/supabase.js`
- [ ] Delete `src/lib/supabaseAdmin.js`

## Testing Phase

### Local Testing

Start development server:
```bash
npm run dev
```

### Test Authentication
- [ ] Login with admin credentials
- [ ] Logout successfully
- [ ] Password reset flow works
- [ ] Session persistence works

### Test Public Pages
- [ ] Landing page loads
- [ ] Profile pages load correctly  
- [ ] Portfolio/projects display
- [ ] About page displays
- [ ] Contact form submits

### Test Admin Features
- [ ] Admin dashboard loads
- [ ] Can view all data tables
- [ ] Can edit profile
- [ ] Can add/edit/delete:
  - [ ] Skills
  - [ ] Education
  - [ ] Work Experience
  - [ ] Certifications
  - [ ] Projects
  - [ ] Custom sections
  - [ ] About features

### Test File Uploads
- [ ] Profile image upload
- [ ] Project image upload
- [ ] Images display correctly
- [ ] Image deletion works

### Test Multi-User Features
- [ ] Can create new users
- [ ] User role management works
- [ ] Path-based routing works

## Build & Deploy

### Build Application
```bash
npm run build
```

- [ ] Build completes without errors
- [ ] Check build output for warnings
- [ ] Verify bundle size is reasonable

### Deploy to Production
```bash
# Your deployment command
npm run deploy  # or git push (if using Netlify/Vercel)
```

- [ ] Deployment successful
- [ ] Test production URL
- [ ] Verify all features work in production

## Post-Migration

### Verification
- [ ] All features working in production
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Images loading correctly

### Cleanup
- [ ] Monitor Firebase usage for a few days
- [ ] Check Firebase Console for error logs
- [ ] Verify no unexpected charges

### Optional: Remove Supabase

**Only after confirming everything works!**

```bash
# Remove Supabase packages
npm uninstall @supabase/supabase-js supabase

# Remove Supabase environment variables from .env
# Delete these lines:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_SUPABASE_SERVICE_ROLE_KEY=...
# SUPABASE_DB_PASSWORD=...
```

- [ ] Uninstall Supabase packages
- [ ] Remove Supabase env variables
- [ ] Delete `.sql` migration files (keep backups!)
- [ ] Delete `supabase/` directory
- [ ] Update README.md to reflect Firebase usage
- [ ] Commit and push changes

### Update Documentation
- [ ] Update README.md
- [ ] Update setup instructions
- [ ] Update environment variable documentation
- [ ] Add Firebase Console links

## Rollback Plan (If Needed)

If something goes wrong:

1. **Restore imports**
   ```bash
   git checkout src/
   ```

2. **Keep Supabase credentials** in `.env`

3. **Reinstall Supabase**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Rebuild and redeploy**

## Security Final Check

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys in source code
- [ ] Firebase security rules are applied
- [ ] Firebase storage rules are applied
- [ ] Admin user password is strong
- [ ] 2FA enabled on Firebase Console (recommended)

## Success Criteria

✅ All checklist items completed
✅ Application works without errors
✅ All features tested and working
✅ Production deployment successful
✅ No Supabase dependencies remaining
✅ Firebase Console shows active usage

---

## Quick Reference

**Firebase Console**: https://console.firebase.google.com/project/portfolio-4c304

**Key Collections**:
- `profile_info` - User profiles
- `skills` - Skills data
- `education` - Education history
- `work_experience` - Work history
- `certifications` - Certifications
- `projects` - Portfolio projects
- `contact_messages` - Contact form submissions
- `custom_resume_sections` - Custom resume sections
- `about_features` - About page features

**Storage Buckets**:
- `profile-images/` - Profile pictures
- `project-images/` - Project screenshots

---

**Last Updated**: 2026-01-21
**Migration Status**: Ready to begin
