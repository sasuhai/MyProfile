# Firebase Migration Guide

## Overview

This guide will help you migrate your portfolio application from Supabase (SQL) to Firebase Firestore (NoSQL).

## Why Firebase?

- **No database pausing**: Firebase free tier doesn't pause your database due to inactivity
- **Better free tier**: More generous limits for small-scale applications
- **Easier scaling**: NoSQL structure scales better for portfolio use cases
- **Integrated services**: Auth, Storage, and Database all in one ecosystem

## Migration Process

### Step 1: Firebase Setup

1. **Create Firebase Project** (if not already done)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Your project is already created: `portfolio-4c304`

2. **Enable Required Services**
   - ✅ **Authentication**: Enable Email/Password authentication
   - ✅ **Firestore Database**: Create database in production mode
   - ✅ **Storage**: Enable Cloud Storage for profile images

3. **Configure Firestore Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/profile_info/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Profile Info - Public read, authenticated write
    match /profile_info/{profileId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Skills - Public read, authenticated write
    match /skills/{skillId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Education - Public read, authenticated write
    match /education/{eduId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Work Experience - Public read, authenticated write
    match /work_experience/{workId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Certifications - Public read, authenticated write
    match /certifications/{certId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Projects - Public read published, authenticated write all
    match /projects/{projectId} {
      allow read: if resource.data.published == true || isAuthenticated();
      allow write: if isAuthenticated();
    }
    
    // Contact Messages - Anyone can create, authenticated can read
    match /contact_messages/{messageId} {
      allow create: if true;
      allow read: if isAuthenticated();
    }
    
    // Custom Resume Sections - Public read, authenticated write
    match /custom_resume_sections/{sectionId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // About Features - Public read, authenticated write
    match /about_features/{featureId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

4. **Configure Storage Security Rules**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images - Public read, authenticated write
    match /profile-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Project images - Public read, authenticated write
    match /project-images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 2: Environment Variables

Your `.env` file has been updated with Firebase credentials. **IMPORTANT**: These credentials are already configured but ensure they remain secret.

```bash
# Firebase Configuration (Already added)
VITE_FIREBASE_API_KEY=AIzaSyAP5L-5SF2XfxcAqw9Cgl25knDbLzcDVEo
VITE_FIREBASE_AUTH_DOMAIN=portfolio-4c304.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=portfolio-4c304
VITE_FIREBASE_STORAGE_BUCKET=portfolio-4c304.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1028976493778
VITE_FIREBASE_APP_ID=1:1028976493778:web:6dc637ba861b68b984990b
```

**Security Note**: 
- ✅ `.env` file is already in `.gitignore`
- ✅ API keys are protected and won't be exposed to GitHub
- ✅ Firebase API keys are safe for client-side use (protected by security rules)

### Step 3: Data Migration

1. **Install Dependencies** (Already done)
   ```bash
   npm install firebase dotenv
   ```

2. **Run Migration Script**
   ```bash
   node migrate-to-firebase.js
   ```

3. **Verify Data**
   - Go to [Firebase Console](https://console.firebase.google.com/project/portfolio-4c304/firestore)
   - Check that all collections have been created
   - Verify data integrity

### Step 4: Update Application Code

All components currently import from `src/lib/supabase.js`. We need to update them to use `src/lib/firebase.js`.

**Files to update** (will be done automatically):
- All files in `src/pages/`
- All files in `src/components/`
- `src/lib/supabaseAdmin.js` (needs Firebase equivalent or deletion)

### Step 5: Testing

1. **Test Authentication**
   - Try logging in with admin credentials
   - Test password reset functionality

2. **Test Data Operations**
   - View profile data
   - Edit skills, education, work experience
   - Upload/delete projects
   - Test contact form

3. **Test File Uploads**
   - Upload profile image
   - Upload project images
   - Verify images are accessible

### Step 6: Deploy

After successful testing:

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Your Platform**
   ```bash
   # If using GitHub Pages
   npm run deploy
   
   # If using Netlify (already configured)
   # Netlify will auto-deploy on git push
   ```

## Data Model Mapping

### Supabase SQL → Firebase Firestore

| Supabase Table | Firestore Collection | Changes |
|---------------|---------------------|---------|
| `profile_info` | `profile_info` | Same structure |
| `skills` | `skills` | Same structure |
| `education` | `education` | Dates converted to timestamps |
| `work_experience` | `work_experience` | Dates converted to timestamps |
| `certifications` | `certifications` | Dates converted to timestamps |
| `projects` | `projects` | Same structure |
| `contact_messages` | `contact_messages` | Same structure |
| `custom_resume_sections` | `custom_resume_sections` | Same structure |
| `about_features` | `about_features` | Same structure |

### Key Differences

1. **Auto-incrementing IDs → Document IDs**
   - Supabase: `id: 1, 2, 3...`
   - Firebase: Document IDs (can preserve SQL IDs during migration)

2. **Timestamps**
   - Supabase: `TIMESTAMPTZ`
   - Firebase: `Timestamp` objects

3. **Arrays**
   - Both support arrays natively

4. **NULL values**
   - Supabase: `NULL`
   - Firebase: `null` or omit field

## Troubleshooting

### Migration Script Fails

1. **Check credentials** in `.env` file
2. **Ensure Firestore is enabled** in Firebase Console
3. **Check Firestore security rules** allow writes
4. **Review error messages** for specific issues

### Authentication Not Working

1. **Enable Email/Password** in Firebase Console → Authentication
2. **Check security rules** allow the operations
3. **Verify environment variables** are loaded correctly

### Images Not Loading

1. **Enable Cloud Storage** in Firebase Console
2. **Apply storage security rules** (see above)
3. **Check bucket name** matches configuration

## Rollback Plan

If you need to rollback to Supabase:

1. Keep Supabase credentials in `.env`
2. Change imports back from `firebase.js` to `supabase.js`
3. Rebuild and redeploy

## Post-Migration Cleanup

After successful migration and testing:

1. **Remove Supabase dependencies**
   ```bash
   npm uninstall @supabase/supabase-js supabase
   ```

2. **Remove Supabase files**
   - Delete `src/lib/supabase.js`
   - Delete `src/lib/supabaseAdmin.js`
   - Delete `supabase/` directory
   - Delete all `.sql` migration files (keep for backup)

3. **Remove Supabase env variables** from `.env`

4. **Update documentation** to reflect Firebase usage

## Support

If you encounter issues:

1. Check Firebase Console for error messages
2. Review Firebase documentation: https://firebase.google.com/docs
3. Check browser console for client-side errors
4. Review migration script output for data issues

## Security Best Practices

✅ **Done**:
- API keys protected in `.env` file
- `.env` excluded from git
- Firebase security rules configured

🔒 **Recommended**:
- Enable Firebase App Check for additional security
- Set up budget alerts in Google Cloud Console
- Regularly review Firebase usage metrics
- Enable 2FA for Firebase Console access
- Rotate API keys periodically

## Next Steps

1. ✅ Firebase library created (`src/lib/firebase.js`)
2. ✅ Environment variables configured
3. ✅ Migration script ready (`migrate-to-firebase.js`)
4. ⏳ Run data migration
5. ⏳ Update component imports
6. ⏳ Test application thoroughly
7. ⏳ Deploy to production
8. ⏳ Clean up Supabase dependencies

---

**Good luck with your migration! 🚀**
