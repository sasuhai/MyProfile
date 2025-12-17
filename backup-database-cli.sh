#!/bin/bash

# =============================================================================
# Database Backup Script for MyProfile Application (Using Supabase CLI)
# =============================================================================
# This script backs up the Supabase database using Supabase CLI and pushes to GitHub
# This method works even when direct pg_dump connections are blocked
#
# Requirements:
# - Supabase CLI installed (brew install supabase/tap/supabase)
# - Supabase CLI logged in (supabase login)
# - Project linked (supabase link --project-ref YOUR_REF)
# - Git configured with credentials
# =============================================================================

# Exit on error
set -e

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Configuration
BACKUP_DIR="$SCRIPT_DIR/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="database_backup_${TIMESTAMP}.sql"
LATEST_BACKUP="database_backup_latest.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +"%Y-%m-%d %H:%M:%S")]${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +"%Y-%m-%d %H:%M:%S")] ERROR:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] ERROR: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +"%Y-%m-%d %H:%M:%S")] WARNING:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] WARNING: $1" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date +"%Y-%m-%d %H:%M:%S")] INFO:${NC} $1"
    echo "[$(date +"%Y-%m-%d %H:%M:%S")] INFO: $1" >> "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "🚀 Starting Supabase database backup (using CLI method)..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLI not found!"
    log_error "Please install it with: brew install supabase/tap/supabase"
    log_error "Then run: supabase login"
    exit 1
fi

log "✅ Supabase CLI found: $(supabase --version)"

# Check if .env file exists for project ref
if [ -f "$SCRIPT_DIR/.env" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
    if [ ! -z "$VITE_SUPABASE_URL" ]; then
        PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')
        log_info "Project Reference: $PROJECT_REF"
    fi
fi

# Check if project is linked
if [ ! -f ".git/config" ] || ! grep -q "\[supabase\]" "$SCRIPT_DIR/.git/config" 2>/dev/null; then
    if [ ! -z "$PROJECT_REF" ]; then
        log_warning "Project not linked. Attempting to link..."
        log_info "Running: supabase link --project-ref $PROJECT_REF"
        if supabase link --project-ref "$PROJECT_REF" 2>&1 | tee -a "$LOG_FILE"; then
            log "✅ Project linked successfully"
        else
            log_error "Failed to link project. Please run manually:"
            log_error "  supabase login"
            log_error "  supabase link --project-ref $PROJECT_REF"
            exit 1
        fi
    else
        log_error "Project not linked. Please run:"
        log_error "  supabase login"
        log_error "  supabase link --project-ref YOUR_PROJECT_REF"
        exit 1
    fi
fi

# Perform the backup using Supabase CLI
log "📦 Creating backup file: $BACKUP_FILE"
log_info "This may take a few minutes depending on database size..."

# Run supabase db dump
if supabase db dump --data-only -f "$BACKUP_DIR/$BACKUP_FILE" 2>&1 | tee -a "$LOG_FILE"; then
    
    # Check if the backup file was created and has content
    if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        log_error "Backup file was not created!"
        exit 1
    fi
    
    # Check if file has content (at least 100 bytes)
    BACKUP_FILE_SIZE=$(stat -f%z "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null || echo "0")
    if [ "$BACKUP_FILE_SIZE" -lt 100 ]; then
        log_error "Backup file is too small ($BACKUP_FILE_SIZE bytes) - backup may have failed"
        exit 1
    fi
    
    log "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Create a copy as "latest" backup
    cp "$BACKUP_DIR/$BACKUP_FILE" "$BACKUP_DIR/$LATEST_BACKUP"
    log "✅ Latest backup updated: $BACKUP_DIR/$LATEST_BACKUP"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "📊 Backup size: $BACKUP_SIZE"
else
    log_error "Backup command failed!"
    log_error "Check the log above for details"
    exit 1
fi

# Keep only last 7 backups (to save space)
log "🧹 Cleaning old backups (keeping last 7)..."
cd "$BACKUP_DIR"
ls -t database_backup_*.sql | grep -v "latest" | tail -n +8 | xargs -r rm -f 2>/dev/null || true
BACKUP_COUNT=$(ls -1 database_backup_*.sql 2>/dev/null | grep -v "latest" | wc -l | tr -d ' ')
log "📁 Current backup count: $BACKUP_COUNT"

# Add backup to git
log "📝 Adding backup to git..."
cd "$SCRIPT_DIR"

# Check if git repository exists
if [ ! -d ".git" ]; then
    log_warning "Not a git repository. Skipping git operations."
else
    # Add backup files to git
    git add backup/
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        log_info "No changes to commit (backup might be identical to previous)"
    else
        # Commit and push to GitHub
        log "💾 Committing backup to git..."
        git commit -m "Automated database backup - $(date +"%Y-%m-%d %H:%M:%S")"
        
        log "⬆️  Pushing to GitHub..."
        if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
            log "✅ Successfully pushed backup to GitHub"
        else
            log_warning "Failed to push to GitHub. You may need to push manually."
            log_warning "Run: git push origin main"
        fi
    fi
fi

# Create a backup summary
cat > "$BACKUP_DIR/backup_summary.txt" << EOF
Last Backup Summary
===================
Date: $(date +"%Y-%m-%d %H:%M:%S")
Method: Supabase CLI
Backup File: $BACKUP_FILE
Backup Size: $BACKUP_SIZE
Total Backups: $BACKUP_COUNT
Project: $PROJECT_REF
Status: Success
EOF

log "📋 Backup summary saved to: $BACKUP_DIR/backup_summary.txt"
log "🎉 Backup process completed successfully!"

# Display backup summary
echo ""
echo "╔══════════════════════════════════════╗"
echo "║      Backup Summary                  ║"
echo "╚══════════════════════════════════════╝"
cat "$BACKUP_DIR/backup_summary.txt"
echo "════════════════════════════════════════"
