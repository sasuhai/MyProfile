# 🚀 Quick Deployment Reference

## For Each New Portfolio Owner

### 1️⃣ Create User in Supabase
```
Authentication → Users → Add User
Email: user@example.com
Password: [secure password]
```

### 2️⃣ Add Profile to Database
```sql
-- Get user_id
SELECT id FROM auth.users WHERE email = 'user@example.com';

-- Insert profile (replace UUID)
INSERT INTO profile_info (user_id, email, full_name, tagline, bio)
VALUES (
  'user-uuid-here',
  'user@example.com',
  'User Name',
  'Job Title',
  'Short bio here.'
);
```

### 3️⃣ Configure Deployment
```bash
# Clone repo
git clone your-repo user-portfolio
cd user-portfolio
npm install

# Edit src/config/portfolio.config.js
USER_EMAIL: 'user@example.com'

# Create .env (same for all users)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ Deploy
```bash
# Test locally
npm run dev

# Build
npm run build

# Deploy to Netlify
netlify deploy --prod

# Or deploy to Vercel
vercel --prod
```

### 5️⃣ Done! ✅
- Portfolio live at: `user.com`
- Admin login: `user.com/admin/login`
- User can manage their content

---

## File to Change Per User

**ONLY ONE FILE needs to change:**

📝 `src/config/portfolio.config.js`
```javascript
export const PORTFOLIO_CONFIG = {
  USER_EMAIL: 'change-this@example.com', // ← CHANGE THIS!
}
```

Everything else stays the same!

---

## Quick Checklist

- [ ] User created in Supabase Auth
- [ ] Profile inserted in database
- [ ] `portfolio.config.js` updated
- [ ] `.env` configured
- [ ] Tested locally
- [ ] Built successfully
- [ ] Deployed to domain
- [ ] Admin login works
- [ ] User can add content

---

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod

# Deploy to Vercel
vercel --prod
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Portfolio owner not found" | Check USER_EMAIL in config |
| Can't login | Verify user exists in Supabase Auth |
| Wrong data showing | Check config has correct email |
| Build fails | Run `npm install` again |

---

## Support

See detailed guides:
- `MULTIUSER_SETUP_GUIDE.md` - Complete setup
- `DEPLOYMENT_GUIDE.md` - Deployment details
- `README.md` - General documentation
