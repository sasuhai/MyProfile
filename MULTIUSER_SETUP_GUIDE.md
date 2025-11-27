# 🌐 Multi-User Portfolio Setup Guide

## 📋 Overview

This portfolio system supports **multiple users sharing one Supabase database**, with each deployment showing a specific user's portfolio.

### Architecture
```
┌─────────────────────────────────────────────┐
│         Shared Supabase Database            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  User 1  │  │  User 2  │  │  User 3  │  │
│  │  Data    │  │  Data    │  │  Data    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ Deploy 1│    │ Deploy 2│    │ Deploy 3│
   │john.com │    │jane.com │    │bob.com  │
   └─────────┘    └─────────┘    └─────────┘
```

## 🚀 Setup Process

### Step 1: Set Up Shared Database

1. **Create ONE Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your Project URL and anon key

2. **Run Multi-User Database Setup**
   - Open Supabase SQL Editor
   - Copy and run `DATABASE_SETUP_MULTIUSER.sql`
   - This creates tables with `user_id` linking

3. **Create Storage Buckets**
   - Go to Storage in Supabase
   - Create bucket: `profile-images` (Public)
   - Create bucket: `project-images` (Public)

### Step 2: Add Users

For each portfolio owner:

1. **Create User in Supabase Authentication**
   ```
   Go to: Authentication → Users → Add User
   Email: john.doe@example.com
   Password: [secure password]
   ```

2. **Create Profile Record**
   ```sql
   -- Get the user_id from auth.users first
   SELECT id, email FROM auth.users WHERE email = 'john.doe@example.com';
   
   -- Insert profile (replace user_id with actual UUID)
   INSERT INTO profile_info (user_id, email, full_name, tagline, bio)
   VALUES (
     'uuid-from-auth-users',
     'john.doe@example.com',
     'John Doe',
     'Full Stack Developer',
     'Passionate about creating amazing web applications.'
   );
   ```

3. **Repeat for Each User**
   - User 2: jane.smith@example.com
   - User 3: bob.jones@example.com
   - etc.

### Step 3: Configure Individual Deployments

For each user's deployment:

1. **Clone the Repository**
   ```bash
   git clone your-repo
   cd MyProfile
   npm install
   ```

2. **Configure Portfolio Owner**
   
   Edit `src/config/portfolio.config.js`:
   ```javascript
   export const PORTFOLIO_CONFIG = {
     USER_EMAIL: 'john.doe@example.com', // Change this!
   }
   ```

3. **Set Environment Variables**
   
   Create `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   **Note**: Same Supabase credentials for all deployments!

4. **Test Locally**
   ```bash
   npm run dev
   ```
   
   Visit `http://localhost:5173` - should show John's portfolio

5. **Build and Deploy**
   ```bash
   npm run build
   ```
   
   Deploy to:
   - Netlify: `john-doe.netlify.app` or `johndoe.com`
   - Vercel: `john-doe.vercel.app` or `johndoe.com`

### Step 4: Repeat for Each User

For Jane's deployment:
1. Clone repo again (or create new branch)
2. Change `portfolio.config.js` to `jane.smith@example.com`
3. Deploy to `jane-smith.netlify.app` or `janesmith.com`

For Bob's deployment:
1. Clone repo again
2. Change `portfolio.config.js` to `bob.jones@example.com`
3. Deploy to `bob-jones.netlify.app` or `bobjones.com`

## 📝 Example Workflow

### Adding a New Portfolio Owner

```bash
# 1. Create user in Supabase Auth
# Email: alice.wonder@example.com
# Password: SecurePass123!

# 2. Get their user_id
SELECT id FROM auth.users WHERE email = 'alice.wonder@example.com';
# Result: a1b2c3d4-e5f6-7890-abcd-ef1234567890

# 3. Insert their profile
INSERT INTO profile_info (user_id, email, full_name, tagline, bio)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'alice.wonder@example.com',
  'Alice Wonder',
  'UX Designer',
  'Creating delightful user experiences.'
);

# 4. Clone repo for Alice
git clone your-repo alice-portfolio
cd alice-portfolio

# 5. Configure for Alice
# Edit src/config/portfolio.config.js
USER_EMAIL: 'alice.wonder@example.com'

# 6. Deploy to alice.com
npm run build
netlify deploy --prod
```

## 🔐 How It Works

### Public Pages (No Auth Required)
```javascript
// Visitors see Alice's portfolio at alice.com
getProfile() → Filters by email: 'alice.wonder@example.com'
getSkills() → Filters by Alice's user_id
getProjects() → Filters by Alice's user_id
```

### Admin Dashboard (Auth Required)
```javascript
// Alice logs in at alice.com/admin/login
signIn('alice.wonder@example.com', 'password')

// Alice can only edit HER data
updateProfile() → Updates where user_id = Alice's ID
addProject() → Inserts with user_id = Alice's ID
```

### Security (Row Level Security)
- ✅ Public can view all profiles (read-only)
- ✅ Users can only edit their own data
- ✅ Each deployment shows only configured user's data
- ✅ Database enforces user_id matching

## 📊 Database Structure

```
auth.users (Supabase Auth)
├── id: uuid (user_id)
├── email
└── ...

profile_info
├── id
├── user_id → auth.users.id
├── email
├── full_name
└── ...

skills
├── id
├── user_id → auth.users.id
├── name
└── ...

(All tables have user_id foreign key)
```

## 🎯 Key Files Modified

| File | Purpose | Change Per Deployment |
|------|---------|----------------------|
| `src/config/portfolio.config.js` | Specifies which user | ✅ YES - Change USER_EMAIL |
| `src/lib/supabase.js` | Database queries | ❌ NO - Same for all |
| `.env` | Supabase credentials | ❌ NO - Same for all |
| `DATABASE_SETUP_MULTIUSER.sql` | Database schema | ❌ NO - Run once |

## 🚀 Deployment Checklist

For each new portfolio owner:

- [ ] Create user in Supabase Authentication
- [ ] Insert profile_info record with user_id
- [ ] Clone repository
- [ ] Update `portfolio.config.js` with user's email
- [ ] Create `.env` with Supabase credentials
- [ ] Test locally (`npm run dev`)
- [ ] Build (`npm run build`)
- [ ] Deploy to their domain
- [ ] Test admin login
- [ ] Add their content via admin dashboard

## 💡 Best Practices

### 1. **Use Git Branches**
```bash
git checkout -b john-doe
# Configure for John
git commit -m "Configure for John Doe"

git checkout -b jane-smith
# Configure for Jane
git commit -m "Configure for Jane Smith"
```

### 2. **Environment Variables**
- Same `.env` for all deployments
- Store in deployment platform (Netlify/Vercel)
- Never commit `.env` to Git

### 3. **User Management**
- Keep a spreadsheet of users and their deployments
- Document each user's email and domain
- Track deployment URLs

### 4. **Updates**
- Update main codebase
- Merge into each user's branch
- Redeploy each portfolio

## 🔄 Updating All Portfolios

When you update the codebase:

```bash
# 1. Update main branch
git checkout main
# Make changes
git commit -m "Add new feature"

# 2. Update John's deployment
git checkout john-doe
git merge main
# Resolve conflicts if any
npm run build
netlify deploy --prod

# 3. Update Jane's deployment
git checkout jane-smith
git merge main
npm run build
netlify deploy --prod

# Repeat for all users
```

## 📈 Scaling

### Current Setup Supports:
- ✅ Unlimited users in database
- ✅ Each user has separate deployment
- ✅ Shared Supabase project (free tier: 500MB database)
- ✅ Shared storage (free tier: 1GB)

### When to Upgrade:
- **Many users (50+)**: Consider Supabase Pro
- **Large files**: Upgrade storage
- **High traffic**: Use CDN for images

## 🆘 Troubleshooting

### "Portfolio owner not found"
- Check `USER_EMAIL` in `portfolio.config.js`
- Verify email exists in `profile_info` table
- Ensure email matches exactly (case-sensitive)

### "Not authenticated" errors
- User must log in with their own email
- Each user can only edit their own data
- Check user exists in Supabase Auth

### Wrong portfolio showing
- Check `portfolio.config.js` has correct email
- Clear browser cache
- Rebuild and redeploy

## 📚 Summary

✅ **One Database** - All users share Supabase
✅ **Multiple Deployments** - Each user gets their own site
✅ **Simple Configuration** - Just change one email
✅ **Secure** - RLS ensures data isolation
✅ **Scalable** - Add users easily

---

**You now have a multi-user portfolio system!** 🎉

Each user gets:
- Their own domain/subdomain
- Their own admin dashboard
- Their own data (isolated by user_id)
- Professional portfolio website

All powered by one shared database! 🚀
