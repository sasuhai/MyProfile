# Corrected Firestore Security Rules

## Issue Found

The `projects` collection rule was too restrictive. It prevented reading projects when querying by `user_id`.

## ✅ CORRECTED FIRESTORE RULES

Copy and paste these rules into Firebase Console:

**Go to**: https://console.firebase.google.com/project/portfolio-4c304/firestore/rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Profile Info - Public read, auth write
    match /profile_info/{profileId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Skills - Public read, auth write
    match /skills/{skillId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Education - Public read, auth write
    match /education/{eduId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Work Experience - Public read, auth write
    match /work_experience/{workId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Certifications - Public read, auth write
    match /certifications/{certId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Projects - FIXED: Allow reading all projects OR just published ones
    match /projects/{projectId} {
      // Allow reading if:
      // 1. User is authenticated (can see all their projects)
      // 2. OR project is published (public can see published projects)
      allow read: if isAuthenticated() || 
                    (resource != null && resource.data.published == true);
      allow write: if isAuthenticated();
    }
    
    // Contact Messages - Create only for public, read for auth
    match /contact_messages/{messageId} {
      allow create: if true;
      allow read: if isAuthenticated();
      allow update, delete: if isAuthenticated();
    }
    
    // Custom Resume Sections - Public read, auth write
    match /custom_resume_sections/{sectionId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // About Features - Public read, auth write
    match /about_features/{featureId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    // Access Requests - Special rules
    match /access_requests/{requestId} {
      allow create: if true;  // Anyone can create access requests
      allow read, update, delete: if isAuthenticated();  // Only auth users can manage
    }
  }
}
```

## 🔧 What Changed

### Before (BROKEN):
```javascript
match /projects/{projectId} {
  allow read: if resource.data.published == true || isAuthenticated();
  //                ^^^^ This fails when querying with where()
}
```

### After (FIXED):
```javascript
match /projects/{projectId} {
  allow read: if isAuthenticated() || 
                (resource != null && resource.data.published == true);
  // Now checks auth FIRST, then checks published status
  // Added resource != null check for safety
}
```

## Why This Fixes It

The original rule checked `resource.data.published` first, which causes issues when:
1. Querying with `where('user_id', '==', userId)` 
2. The query needs to read multiple documents
3. Firestore can't evaluate `resource.data.published` before fetching

The fixed version:
1. Checks authentication FIRST (allows authenticated users to see all their projects)
2. THEN checks if project is published (allows public to see published projects)
3. Adds null check for safety

## 📋 Steps to Apply

1. Go to: https://console.firebase.google.com/project/portfolio-4c304/firestore/rules
2. **Replace** all content with the rules above
3. Click **"Publish"**
4. Wait 10-20 seconds for rules to propagate
5. Test again!

---

**This should fix the "no data shown" issue for projects!** ✅
