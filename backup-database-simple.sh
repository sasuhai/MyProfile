#!/bin/bash

# =============================================================================
# Simple Database Backup Script (No Docker Required)
# =============================================================================
# This script backs up the Supabase database using direct pg_dump via connection string
# Uses Supabase connection pooler which should work even when direct connection fails
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuration
BACKUP_DIR="$SCRIPT_DIR/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="database_backup_${TIMESTAMP}.sql"
LATEST_BACKUP="database_backup_latest.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +"%Y-%m-%d %H:%M:%S")]${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +"%Y-%m-%d %H:%M:%S")] ERROR:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $1" >> "$LOG_FILE"
}

mkdir -p "$BACKUP_DIR"

log "🚀 Starting database backup..."

# Load .env file
if [ ! -f ".env" ]; then
    log_error ".env file not found!"
    log_error "Please create .env with SUPABASE_DB_PASSWORD"
    exit 1
fi

export $(grep -v '^#' .env | xargs)

# Check for required variables
if [ -z "$VITE_SUPABASE_URL" ]; then
    log_error "VITE_SUPABASE_URL not found in .env"
    exit 1
fi

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    log_error "SUPABASE_DB_PASSWORD not found in .env"
    log_error ""
    log_error "Please get your database password from:"
    log_error "1. Go to https://supabase.com/dashboard"
    log_error "2. Select your project"
    log_error "3. Settings → Database → Connection string"
    log_error "4. Copy the password from the URI"
    log_error "5. Add to .env: SUPABASE_DB_PASSWORD=your_password"
    exit 1
fi

# Extract project reference
PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')

if [ -z "$PROJECT_REF" ]; then
    log_error "Could not extract project reference from VITE_SUPABASE_URL"
    exit 1
fi

log "✅ Project: $PROJECT_REF"

# Try connection pooler first (port 6543), fallback to direct (5432)
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_USER="postgres"
DB_NAME="postgres"

log "📦 Creating backup: $BACKUP_FILE"

export PGPASSWORD="$SUPABASE_DB_PASSWORD"

# Try port 6543 (connection pooler) first
log "Attempting backup via connection pooler (port 6543)..."
if pg_dump -h "$DB_HOST" -p 6543 -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    -f "$BACKUP_DIR/$BACKUP_FILE" 2>&1 | tee -a "$LOG_FILE"; then
    
    log "✅ Backup successful using connection pooler"
else
    log_error "Connection pooler failed, trying direct connection (port 5432)..."
    
    if pg_dump -h "$DB_HOST" -p 5432 -U "$DB_USER" -d "$DB_NAME" \
        --no-owner --no-acl --clean --if-exists \
        -f "$BACKUP_DIR/$BACKUP_FILE" 2>&1 | tee -a "$LOG_FILE"; then
        
        log "✅ Backup successful using direct connection"
    else
        log_error "Both connection methods failed!"
        log_error ""
        log_error "Please check:"
        log_error "1. Database password is correct"
        log_error "2. Project is not paused: https://supabase.com/dashboard"
        log_error "3. Network allows connections to Supabase"
        unset PGPASSWORD
        exit 1
    fi
fi

unset PGPASSWORD

# Verify backup file
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    log_error "Backup file was not created!"
    exit 1
fi

BACKUP_FILE_SIZE=$(stat -f%z "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null || echo "0")
if [ "$BACKUP_FILE_SIZE" -lt 100 ]; then
    log_error "Backup file is too small ($BACKUP_FILE_SIZE bytes)"
    exit 1
fi

# Create latest backup link
cp "$BACKUP_DIR/$BACKUP_FILE" "$BACKUP_DIR/$LATEST_BACKUP"
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)

log "✅ Backup completed successfully!"
log "📊 Size: $BACKUP_SIZE"
log "📁 File: $BACKUP_FILE"

# Cleanup old backups (keep last 7)
cd "$BACKUP_DIR"
ls -t database_backup_*.sql | grep -v "latest" | tail -n +8 | xargs -r rm -f 2>/dev/null || true
BACKUP_COUNT=$(ls -1 database_backup_*.sql 2>/dev/null | grep -v "latest" | wc -l | tr -d ' ')

log "🧹 Keeping $BACKUP_COUNT backups"

# Git operations
cd "$SCRIPT_DIR"
if [ -d ".git" ]; then
    git add backup/
    
    if ! git diff --cached --quiet; then
        log "💾 Committing to git..."
        git commit -m "Automated database backup - $(date +"%Y-%m-%d %H:%M:%S")"
        
        log "⬆️  Pushing to GitHub..."
        if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
            log "✅ Pushed to GitHub"
        else
            log_error "Failed to push to GitHub (you may need to push manually)"
        fi
    else
        log "ℹ️  No changes to commit"
    fi
fi

# Create summary
cat > "$BACKUP_DIR/backup_summary.txt" << EOF
Last Backup Summary
===================
Date: $(date +"%Y-%m-%d %H:%M:%S")
Method: pg_dump
Backup File: $BACKUP_FILE
Backup Size: $BACKUP_SIZE
Total Backups: $BACKUP_COUNT
Project: $PROJECT_REF
Status: Success
EOF

log "🎉 All done!"

echo ""
echo "══════════════════════════════════"
cat "$BACKUP_DIR/backup_summary.txt"
echo "══════════════════════════════════"
