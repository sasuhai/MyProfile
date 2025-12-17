#!/bin/bash

# Database Connection Diagnostic Script
# =====================================

echo "🔍 Diagnosing Database Connection..."
echo "===================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if .env file exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "❌ ERROR: .env file not found"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)

echo "1️⃣ Checking Supabase URL..."
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "   ❌ VITE_SUPABASE_URL not found in .env"
    exit 1
else
    echo "   ✅ VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
fi

echo ""
echo "2️⃣ Extracting project reference..."
PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')
if [ -z "$PROJECT_REF" ]; then
    echo "   ❌ Could not extract project reference"
    exit 1
else
    echo "   ✅ Project Reference: $PROJECT_REF"
fi

echo ""
echo "3️⃣ Constructed database host..."
DB_HOST="db.${PROJECT_REF}.supabase.co"
echo "   Database Host: $DB_HOST"

echo ""
echo "4️⃣ Testing DNS resolution..."
if host "$DB_HOST" > /dev/null 2>&1; then
    echo "   ✅ DNS resolution successful"
    host "$DB_HOST"
else
    echo "   ❌ DNS resolution failed - Host not found"
    echo ""
    echo "   📋 Possible reasons:"
    echo "   - Supabase project is paused (free tier)"
    echo "   - Project doesn't exist or was deleted"
    echo "   - Network connectivity issue"
    echo ""
    echo "   🔧 Solutions:"
    echo "   1. Go to https://supabase.com/dashboard"
    echo "   2. Check if your project is paused - Click 'Restore' if needed"
    echo "   3. Verify the project reference matches your Supabase project"
fi

echo ""
echo "5️⃣ Testing network connectivity to Supabase..."
if ping -c 1 supabase.com > /dev/null 2>&1; then
    echo "   ✅ Can reach supabase.com"
else
    echo "   ❌ Cannot reach supabase.com - Check your internet connection"
fi

echo ""
echo "6️⃣ Checking PostgreSQL tools..."
if command -v pg_dump &> /dev/null; then
    PG_VERSION=$(pg_dump --version)
    echo "   ✅ pg_dump installed: $PG_VERSION"
else
    echo "   ❌ pg_dump not found"
fi

echo ""
echo "7️⃣ Checking database password..."
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "   ⚠️  SUPABASE_DB_PASSWORD not set in .env"
    echo "   Add it to .env: SUPABASE_DB_PASSWORD=your_password"
else
    echo "   ✅ SUPABASE_DB_PASSWORD is set (length: ${#SUPABASE_DB_PASSWORD} characters)"
fi

echo ""
echo "===================================="
echo "📊 Diagnostic Summary"
echo "===================================="
echo ""
echo "Supabase Project URL: $VITE_SUPABASE_URL"
echo "Database Host: $DB_HOST"
echo ""
echo "Next Steps:"
echo "1. Check Supabase dashboard: https://supabase.com/dashboard"
echo "2. Ensure your project is active (not paused)"
echo "3. Verify database password is correct"
echo "4. Try the connection test below:"
echo ""
echo "🔧 Manual Connection Test:"
echo "psql -h $DB_HOST -p 5432 -U postgres -d postgres"
echo "(You'll be prompted for your database password)"
echo ""
