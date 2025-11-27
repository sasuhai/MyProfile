# 🌐 Single Domain Multi-User Architecture

## 🎯 New Approach: Path-Based Multi-Tenancy

Instead of deploying to multiple domains, deploy ONCE and use URL paths to differentiate users.

### **Before (Multiple Domains):**
```
johndoe.com          → John's portfolio
janesmith.com        → Jane's portfolio
bobjones.com         → Bob's portfolio
```

### **After (Single Domain with Paths):**
```
yourportfolio.com/john     → John's portfolio
yourportfolio.com/jane     → Jane's portfolio
yourportfolio.com/bob      → Bob's portfolio
```

---

## ✅ Benefits

### **Deployment:**
- ✅ Deploy ONCE instead of multiple times
- ✅ One domain to manage
- ✅ Easier updates (update once, affects all)
- ✅ Lower hosting costs

### **User Management:**
- ✅ Add users without redeploying
- ✅ Users just get a unique username
- ✅ Centralized management
- ✅ Easier to maintain

### **Features:**
- ✅ Password reset works automatically
- ✅ No Supabase URL configuration needed
- ✅ Simpler architecture
- ✅ Better for scaling

---

## 🏗️ Architecture Changes Needed

### **1. Add Username to Profile**

```sql
-- Add username column
ALTER TABLE profile_info 
ADD COLUMN username TEXT UNIQUE;

-- Add index for fast lookups
CREATE INDEX idx_profile_info_username ON profile_info(username);

-- Update existing users
UPDATE profile_info SET username = 'john' WHERE email = 'john@example.com';
UPDATE profile_info SET username = 'jane' WHERE email = 'jane@example.com';
UPDATE profile_info SET username = 'bob' WHERE email = 'bob@example.com';
```

### **2. Update Routes**

**Current:**
```
/                    → Portfolio (from config)
/about              → About page
/admin/login        → Admin login
```

**New:**
```
/                    → Landing page (list of users or redirect)
/:username          → User's portfolio home
/:username/about    → User's about page
/:username/resume   → User's resume
/:username/portfolio → User's projects
/:username/contact  → User's contact
/admin/login        → Admin login
/admin/dashboard    → Admin dashboard
```

### **3. Remove Config File**

No more `portfolio.config.js`! Username comes from URL instead.

---

## 🔧 Implementation

### **Step 1: Database Migration**

Create file: `ADD_USERNAME_COLUMN.sql`

```sql
-- Add username column to profile_info
ALTER TABLE profile_info 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add constraint to ensure username is URL-safe
ALTER TABLE profile_info 
ADD CONSTRAINT username_format CHECK (username ~ '^[a-z0-9-]+$');

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profile_info_username ON profile_info(username);

-- Make username required
ALTER TABLE profile_info 
ALTER COLUMN username SET NOT NULL;

-- Add helper function to get user by username
CREATE OR REPLACE FUNCTION get_user_by_username(user_name TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT
) AS $$
  SELECT user_id, email, full_name, role 
  FROM profile_info 
  WHERE username = user_name 
  LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

### **Step 2: Update Supabase Helper**

Update `src/lib/supabase.js`:

```javascript
// Get profile by username (from URL)
export const getProfileByUsername = async (username) => {
  const { data, error } = await supabase
    .from('profile_info')
    .select('*')
    .eq('username', username)
    .single()
  return { data, error }
}

// Get user's content by username
export const getSkillsByUsername = async (username) => {
  // First get user_id from username
  const { data: profile } = await getProfileByUsername(username)
  if (!profile) return { data: [], error: new Error('User not found') }

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', profile.user_id)
    .order('category', { ascending: true })
  return { data, error }
}

// Similar functions for education, work, projects, etc.
```

### **Step 3: Update Routes**

Update `src/App.jsx`:

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserPortfolio from './pages/UserPortfolio'
import LandingPage from './pages/LandingPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* User portfolio routes */}
            <Route path="/:username/*" element={<UserPortfolio />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}
```

### **Step 4: Create UserPortfolio Component**

Create `src/pages/UserPortfolio.jsx`:

```javascript
import { useParams, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getProfileByUsername } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from './Home'
import About from './About'
import Resume from './Resume'
import Portfolio from './Portfolio'
import Contact from './Contact'

const UserPortfolio = () => {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    const { data, error } = await getProfileByUsername(username)
    if (error) {
      setError('User not found')
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="spinner w-12 h-12"></div>
    </div>
  }

  if (error || !profile) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl">User not found</p>
        <a href="/" className="btn btn-primary mt-4">Go Home</a>
      </div>
    </div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar username={username} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home username={username} />} />
          <Route path="/about" element={<About username={username} />} />
          <Route path="/resume" element={<Resume username={username} />} />
          <Route path="/portfolio" element={<Portfolio username={username} />} />
          <Route path="/contact" element={<Contact username={username} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default UserPortfolio
```

### **Step 5: Create Landing Page**

Create `src/pages/LandingPage.jsx`:

```javascript
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Users, ArrowRight } from 'lucide-react'

const LandingPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profile_info')
      .select('username, full_name, tagline, profile_image_url')
      .order('created_at', { ascending: false })
    
    setUsers(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white dark:from-dark-950 dark:to-dark-900">
      <div className="container-custom py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-5xl font-bold mb-4">
            Portfolio <span className="gradient-text">Showcase</span>
          </h1>
          <p className="text-xl text-dark-600 dark:text-dark-400">
            Discover amazing portfolios from talented professionals
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {users.map((user, index) => (
              <motion.a
                key={user.username}
                href={`/${user.username}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  {user.profile_image_url ? (
                    <img
                      src={user.profile_image_url}
                      alt={user.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{user.full_name}</h3>
                    <p className="text-sm text-dark-500 dark:text-dark-400">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <p className="text-dark-600 dark:text-dark-400 mb-4">
                  {user.tagline}
                </p>
                <div className="flex items-center text-primary-600 dark:text-primary-400 group-hover:translate-x-2 transition-transform">
                  <span className="text-sm font-medium">View Portfolio</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPage
```

---

## 📊 URL Structure

### **Public URLs:**
```
yourportfolio.com/              → Landing page (all users)
yourportfolio.com/john          → John's home
yourportfolio.com/john/about    → John's about
yourportfolio.com/john/resume   → John's resume
yourportfolio.com/john/portfolio → John's projects
yourportfolio.com/john/contact  → John's contact

yourportfolio.com/jane          → Jane's home
yourportfolio.com/jane/about    → Jane's about
...
```

### **Admin URLs:**
```
yourportfolio.com/admin/login      → Admin login
yourportfolio.com/admin/dashboard  → Admin dashboard
yourportfolio.com/reset-password   → Password reset
```

---

## 🔐 Admin Dashboard Updates

Update admin to set username when creating users:

```javascript
// In UserManagement.jsx
const [newUser, setNewUser] = useState({
  email: '',
  password: '',
  fullName: '',
  username: '',  // ← Add this
  role: 'user'
})

// Validation
const validateUsername = (username) => {
  return /^[a-z0-9-]+$/.test(username)
}
```

---

## ✅ Benefits Summary

### **Deployment:**
- ✅ Deploy once to `yourportfolio.com`
- ✅ All users accessible immediately
- ✅ No per-user deployment needed

### **User Management:**
- ✅ Add user → They get `yourportfolio.com/username`
- ✅ No domain configuration
- ✅ No DNS setup
- ✅ Instant activation

### **Maintenance:**
- ✅ Update code once
- ✅ All users get updates
- ✅ Easier to manage
- ✅ Lower costs

### **Features:**
- ✅ Landing page shows all users
- ✅ Each user has clean URLs
- ✅ Password reset works automatically
- ✅ Better SEO (one domain)

---

## 🎯 Migration Path

If you want to switch to this approach:

1. ✅ Run username migration SQL
2. ✅ Update routes in App.jsx
3. ✅ Create UserPortfolio component
4. ✅ Create LandingPage component
5. ✅ Update all page components to accept username
6. ✅ Deploy to single domain
7. ✅ Done!

---

## 💡 Best of Both Worlds

You can even support BOTH approaches:

- **Path-based**: `yourportfolio.com/john`
- **Custom domain**: `johndoe.com` (points to same deployment, shows John's portfolio)

Using custom domain detection or subdomain routing!

---

Would you like me to implement this path-based multi-tenancy approach? It's much cleaner and easier to manage! 🚀
