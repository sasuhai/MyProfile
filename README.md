# 🎨 Modern Personal Profile Portal

A complete, modern personal profile/resume web portal with admin dashboard and database integration. Built with React, Vite, TailwindCSS, and Supabase.

## ✨ Features

### Public Portal
- **Home/Hero Section**: Professional introduction with profile photo, tagline, and call-to-action buttons
- **About Me**: Detailed biography, skills summary, personal strengths, and languages
- **Resume**: Education, work experience, certifications with animated timeline
- **Portfolio**: Project showcase with filtering, images, and links
- **Contact**: Contact form with email integration and social links
- **Dark/Light Mode**: Automatic theme switching with user preference
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile

### Admin Dashboard
- **Secure Login**: Protected admin area with authentication
- **Profile Editor**: Update personal information, bio, and profile photo
- **Skills Manager**: Add, edit, delete skills with categories and proficiency levels
- **Projects Manager**: CRUD operations for portfolio projects with image upload
- **Resume Editor**: Manage education, work experience, and certifications
- **Messages Viewer**: View contact form submissions
- **Analytics Overview**: Quick stats and metrics

### Design Features
- Modern, clean, professional UI
- Smooth animations and micro-interactions
- Glass morphism effects
- Gradient accents
- Premium typography (Inter & Outfit fonts)
- Accessible and SEO-optimized

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS + Custom CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for images)
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
MyProfile/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ProfileEditor.jsx
│   │   │   ├── SkillsEditor.jsx
│   │   │   ├── ProjectsEditor.jsx
│   │   │   ├── ResumeEditor.jsx
│   │   │   └── MessagesViewer.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminLogin.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Resume.jsx
│   │   ├── Portfolio.jsx
│   │   └── Contact.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── .env.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works great)

### Installation

1. **Clone and Install Dependencies**
```bash
cd MyProfile
npm install
```

2. **Set Up Supabase**

Create a new project at [supabase.com](https://supabase.com)

3. **Configure Environment Variables**

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Set Up Database**

See `DATABASE_SCHEMA.md` for complete database setup instructions.

5. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 📊 Database Setup

The application requires the following Supabase tables:

1. **profile_info** - Personal profile data
2. **skills** - Skills with categories and levels
3. **education** - Educational background
4. **work_experience** - Work history
5. **certifications** - Certifications and awards
6. **projects** - Portfolio projects
7. **messages** - Contact form submissions

See `DATABASE_SCHEMA.md` for detailed schema and SQL setup scripts.

## 🔐 Admin Access

1. Navigate to `/admin/login`
2. Sign in with your Supabase user credentials
3. Access the dashboard at `/admin/dashboard`

**First-time setup:**
- Create an admin user in Supabase Authentication
- Use those credentials to log in

## 📝 Content Management

### Updating Profile
1. Go to Admin Dashboard → Profile tab
2. Edit your information
3. Upload profile photo
4. Save changes

### Adding Projects
1. Go to Admin Dashboard → Projects tab
2. Fill in project details
3. Upload project image
4. Add technologies (comma-separated)
5. Set published status
6. Save

### Managing Skills
1. Go to Admin Dashboard → Skills tab
2. Add skill name, category, and proficiency level
3. Skills are automatically grouped by category

## 🌐 Deployment

### Deploy to Netlify

1. **Build the project:**
```bash
npm run build
```

2. **Deploy to Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

3. **Set Environment Variables:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel --prod
```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Changing Fonts
Update the Google Fonts import in `src/index.css` and the font family in `tailwind.config.js`

### Modifying Animations
Adjust animation settings in `tailwind.config.js` under `extend.animation`

## 📱 Features Breakdown

### Light/Dark Mode
- Automatic detection of system preference
- Manual toggle in navbar
- Persisted in localStorage
- Smooth transitions

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Hamburger menu on mobile
- Optimized layouts for all screen sizes

### SEO Optimization
- Semantic HTML
- Meta tags ready
- Fast loading times
- Accessible components

## 🔧 Troubleshooting

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure RLS policies are configured (see DATABASE_SCHEMA.md)

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

### Image Upload Issues
- Verify Supabase storage bucket exists
- Check bucket permissions
- Ensure file size is under 2MB

## 📄 License

MIT License - feel free to use this project for your personal portfolio!

## 🤝 Contributing

This is a personal portfolio template. Feel free to fork and customize for your own use!

## 📧 Support

For issues or questions, please check the documentation files:
- `DATABASE_SCHEMA.md` - Database setup
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

---

Built with ❤️ using React, TailwindCSS, and Supabase
