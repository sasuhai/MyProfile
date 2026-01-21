#!/bin/bash

# Firebase Migration Quick Start Script
# This script guides you through the Firebase migration process

set -e  # Exit on error

echo "🚀 Firebase Migration Quick Start"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file from .env.example first"
    exit 1
fi

# Check if Firebase credentials are set
if ! grep -q "VITE_FIREBASE_API_KEY" .env; then
    echo -e "${RED}❌ Error: Firebase credentials not found in .env${NC}"
    echo "Please add Firebase credentials to .env file"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Step 1: Firebase Console Setup
echo "📋 Step 1: Firebase Console Setup"
echo "=================================="
echo ""
echo "Before running the migration, you need to set up Firebase:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/portfolio-4c304"
echo "2. Enable Firestore Database (Production mode)"
echo "3. Enable Authentication (Email/Password)"
echo "4. Enable Cloud Storage"
echo "5. Apply security rules (see FIREBASE_MIGRATION_CHECKLIST.md)"
echo ""
read -p "Have you completed the Firebase Console setup? (yes/no): " firebase_setup

if [ "$firebase_setup" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Please complete Firebase setup first${NC}"
    echo "See FIREBASE_MIGRATION_CHECKLIST.md for detailed instructions"
    exit 0
fi

echo -e "${GREEN}✅ Firebase Console setup confirmed${NC}"
echo ""

# Step 2: Create Admin User
echo "📋 Step 2: Create Admin User in Firebase"
echo "========================================"
echo ""
echo "You need to create an admin user in Firebase Authentication:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/portfolio-4c304/authentication/users"
echo "2. Click 'Add User'"
echo "3. Enter admin email and password"
echo "4. After creating, note down the User UID"
echo ""
read -p "Have you created an admin user? (yes/no): " admin_created

if [ "$admin_created" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Please create an admin user first${NC}"
    exit 0
fi

read -p "Enter the admin User UID: " admin_uid
echo "Admin UID: $admin_uid"
echo ""

# Step 3: Run Data Migration
echo "📋 Step 3: Running Data Migration"
echo "================================="
echo ""
echo "This will migrate all data from Supabase to Firebase..."
echo ""
read -p "Continue with data migration? (yes/no): " continue_migration

if [ "$continue_migration" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Migration cancelled${NC}"
    exit 0
fi

echo "🔄 Starting data migration..."
echo ""

# Run migration script
if node migrate-to-firebase.js; then
    echo ""
    echo -e "${GREEN}✅ Data migration completed${NC}"
else
    echo ""
    echo -e "${RED}❌ Data migration failed${NC}"
    echo "Check the error messages above and fix any issues"
    exit 1
fi

echo ""

# Step 4: Create Admin Profile
echo "📋 Step 4: Create Admin Profile in Firestore"
echo "==========================================="
echo ""
echo "You need to manually create a profile for the admin user:"
echo ""
echo "1. Go to: https://console.firebase.google.com/project/portfolio-4c304/firestore"
echo "2. Navigate to 'profile_info' collection"
echo "3. Click 'Add Document'"
echo "4. Add the following fields:"
echo "   - user_id: $admin_uid"
echo "   - email: [your admin email]"
echo "   - username: [your username]"
echo "   - full_name: [your name]"
echo "   - role: admin"
echo "   - tagline: [your tagline]"
echo "   - bio: [your bio]"
echo "   - created_at: [timestamp]"
echo "   - updated_at: [timestamp]"
echo ""
read -p "Have you created the admin profile? (yes/no): " profile_created

if [ "$profile_created" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Please create the admin profile before continuing${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Admin profile created${NC}"
echo ""

# Step 5: Update Code Imports
echo "📋 Step 5: Updating Code Imports"
echo "================================"
echo ""
echo "This will automatically update all imports from Supabase to Firebase..."
echo ""
read -p "Continue with code update? (yes/no): " continue_update

if [ "$continue_update" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Code update skipped${NC}"
    echo "You can run this later with: node update-imports.js"
    exit 0
fi

echo "🔄 Updating imports..."
echo ""

if node update-imports.js; then
    echo ""
    echo -e "${GREEN}✅ Code imports updated${NC}"
else
    echo ""
    echo -e "${RED}❌ Code update failed${NC}"
    exit 1
fi

echo ""

# Step 6: Test Application
echo "📋 Step 6: Testing Application"
echo "=============================="
echo ""
echo "Now you should test the application locally:"
echo ""
echo "Run: npm run dev"
echo ""
echo "Test the following:"
echo "- Login with admin credentials"
echo "- View portfolio pages"
echo "- Edit data in admin dashboard"
echo "- Upload images"
echo "- Contact form submission"
echo ""
echo "See FIREBASE_MIGRATION_CHECKLIST.md for complete testing checklist"
echo ""

# Summary
echo ""
echo "=================================="
echo "🎉 Migration Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Test the application: npm run dev"
echo "2. Fix any issues found during testing"
echo "3. Build for production: npm run build"
echo "4. Deploy to production"
echo "5. Monitor Firebase Console for errors"
echo ""
echo "📚 Documentation:"
echo "- FIREBASE_MIGRATION_GUIDE.md - Complete migration guide"
echo "- FIREBASE_MIGRATION_CHECKLIST.md - Detailed checklist"
echo ""
echo -e "${GREEN}Good luck! 🚀${NC}"
