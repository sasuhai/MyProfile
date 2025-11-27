#!/bin/bash

# GitHub Pages Deployment Setup Script
# Run this to configure your repository for deployment

echo "🚀 Setting up GitHub Pages deployment..."
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository. Initialize git first:"
    echo "   git init"
    echo "   git remote add origin https://github.com/yourusername/MyProfile.git"
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Create .env with your Supabase credentials:"
    echo "   VITE_SUPABASE_URL=your_url"
    echo "   VITE_SUPABASE_ANON_KEY=your_key"
    echo ""
fi

# Check if .env is in .gitignore
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo "⚠️  Warning: .env not in .gitignore!"
    echo "   Adding .env to .gitignore..."
    echo ".env" >> .gitignore
fi

echo "✅ Configuration complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Go to GitHub → Your repo → Settings → Pages"
echo "   - Source: GitHub Actions"
echo ""
echo "2. Go to Settings → Secrets and variables → Actions"
echo "   - Add secret: VITE_SUPABASE_URL"
echo "   - Add secret: VITE_SUPABASE_ANON_KEY"
echo ""
echo "3. Push to GitHub:"
echo "   git add ."
echo "   git commit -m 'Setup GitHub Pages deployment'"
echo "   git push origin main"
echo ""
echo "4. Your site will be live at:"
echo "   https://yourusername.github.io/MyProfile/"
echo ""
echo "📚 See DEPLOY_GITHUB_PAGES.md for detailed instructions"
