# Simple Firestore Rules - Fix Data Display

## Problem
The conditional rules on `projects` are too complex for Firestore queries. We need simpler rules.

## ✅ SIMPLE SOLUTION

Use these simple rules that allow public read access (just like the other collections):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // ALL DATA COLLECTIONS: Public read, authenticated write
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
    
    // PROJECTS: Simple public read (FIXED)
    match /projects/{projectId} {
      allow read: if true;  // Public can read all projects
      allow write: if isAuthenticated();  // Only auth can write
    }
    
    match /contact_messages/{messageId} {
      allow create: if true;
      allow read, update, delete: if isAuthenticated();
    }
    
    match /custom_resume_sections/{sectionId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /about_features/{featureId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /access_requests/{requestId} {
      allow create: if true;
      allow read, update, delete: if isAuthenticated();
    }
  }
}
```

## Why This Works

- **Simple**: All collections allow public read
- **Safe**: Only authenticated users can write
- **No complex conditions**: No `published` checks that break queries
- **Application-level control**: You can filter published/unpublished in your app code

## If You Want Published/Unpublished Control

Control it in your application code instead of Firestore rules:

```javascript
// In your app
const { data: allProjects } = await getProjects()
const publishedProjects = allProjects.filter(p => p.published)
```

## Apply These Rules

1. Go to: https://console.firebase.google.com/project/portfolio-4c304/firestore/rules
2. Replace with the rules above
3. Click "Publish"
4. Test immediately!

---

**This should fix ALL data display issues!** ✅
