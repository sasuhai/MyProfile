#!/bin/bash

# =============================================================================
# Database Backup Script for MyProfile Application
# =============================================================================
# This script backs up the Supabase PostgreSQL database and pushes it to GitHub
# Can be run manually or scheduled as a cron job
#
# Requirements:
# - pg_dump installed (PostgreSQL client tools)
# - Git configured with credentials
# - .env file with database credentials in the same directory
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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if .env file exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    log_error ".env file not found in $SCRIPT_DIR"
    exit 1
fi

# Load environment variables from .env
export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)

# Extract database connection details from Supabase URL
# Supabase URL format: https://[project-ref].supabase.co
# Database host format: db.[project-ref].supabase.co

# Check if VITE_SUPABASE_URL is set
if [ -z "$VITE_SUPABASE_URL" ]; then
    log_error "VITE_SUPABASE_URL not found in .env file"
    exit 1
fi

# Extract project reference from Supabase URL
PROJECT_REF=$(echo "$VITE_SUPABASE_URL" | sed -n 's/.*https:\/\/\([^.]*\).*/\1/p')

if [ -z "$PROJECT_REF" ]; then
    log_error "Could not extract project reference from VITE_SUPABASE_URL"
    exit 1
fi

# Database connection details
# Note: Using port 6543 (Supabase Session Pooler) instead of 5432 (Direct Connection)
# This avoids IPv6 connectivity issues and is the recommended method for external connections
DB_HOST="db.${PROJECT_REF}.supabase.co"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres"

# Check if database password is set
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    log_error "SUPABASE_DB_PASSWORD not found in .env file"
    log_error "Please add your Supabase database password to .env file:"
    log_error "SUPABASE_DB_PASSWORD=your_database_password"
    log_error ""
    log_error "You can find this in your Supabase project settings:"
    log_error "Project Settings > Database > Connection string (URI)"
    exit 1
fi

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    log_error "pg_dump not found. Please install PostgreSQL client tools."
    log_error "On macOS: brew install postgresql"
    log_error "On Ubuntu/Debian: sudo apt-get install postgresql-client"
    exit 1
fi

log "Starting database backup..."
log "Project: $PROJECT_REF"
log "Database Host: $DB_HOST"

# Perform the backup
log "Creating backup file: $BACKUP_FILE"

# Test database connectivity first
log "Testing database connectivity..."
if ! nc -z -w 5 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
    log_error "Cannot connect to database host $DB_HOST:$DB_PORT"
    log_error "Please check:"
    log_error "  1. Supabase project is active (not paused)"
    log_error "  2. Internet connection is working"
    log_error "  3. Run: ./diagnose-connection.sh for detailed diagnostics"
    exit 1
fi
log "Database host is reachable"

# Set the password for pg_dump
export PGPASSWORD="$SUPABASE_DB_PASSWORD"

# Run pg_dump with proper options
# Note: Using PGOPTIONS to prefer IPv4 to avoid IPv6 connectivity issues
export PGOPTIONS="-c client_encoding=UTF8"

log "Running pg_dump..."
if pg_dump -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    --verbose \
    -f "$BACKUP_DIR/$BACKUP_FILE" 2>&1 | tee -a "$LOG_FILE"; then
    
    # Check if the backup file was actually created and has content
    if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        log_error "Backup file was not created!"
        unset PGPASSWORD
        unset PGOPTIONS
        exit 1
    fi
    
    # Check if file has content (at least 100 bytes)
    BACKUP_FILE_SIZE=$(stat -f%z "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null || echo "0")
    if [ "$BACKUP_FILE_SIZE" -lt 100 ]; then
        log_error "Backup file is too small ($BACKUP_FILE_SIZE bytes) - backup may have failed"
        unset PGPASSWORD
        unset PGOPTIONS
        exit 1
    fi
    
    log "Backup created successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Create a copy as "latest" backup
    cp "$BACKUP_DIR/$BACKUP_FILE" "$BACKUP_DIR/$LATEST_BACKUP"
    log "Latest backup updated: $BACKUP_DIR/$LATEST_BACKUP"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    log "Backup size: $BACKUP_SIZE"
else
    log_error "pg_dump command failed!"
    log_error "Check the log above for details"
    unset PGPASSWORD
    unset PGOPTIONS
    exit 1
fi

# Clear environment variables
unset PGOPTIONS

# Clear the password from environment
unset PGPASSWORD

# Keep only last 7 backups (to save space)
log "Cleaning old backups (keeping last 7)..."
cd "$BACKUP_DIR"
ls -t database_backup_*.sql | grep -v "latest" | tail -n +8 | xargs -r rm -f
BACKUP_COUNT=$(ls -1 database_backup_*.sql | grep -v "latest" | wc -l)
log "Current backup count: $BACKUP_COUNT"

# Add backup to git
log "Adding backup to git..."
cd "$SCRIPT_DIR"

# Check if git repository exists
if [ ! -d ".git" ]; then
    log_warning "Not a git repository. Skipping git operations."
else
    # Add backup files to git
    git add backup/
    
    # Check if there are changes to commit
    if git diff --cached --quiet; then
        log "No changes to commit (backup might be identical to previous)"
    else
        # Commit and push to GitHub
        log "Committing backup to git..."
        git commit -m "Automated database backup - $(date +"%Y-%m-%d %H:%M:%S")"
        
        log "Pushing to GitHub..."
        if git push origin main 2>&1 | tee -a "$LOG_FILE"; then
            log "Successfully pushed backup to GitHub"
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
Backup File: $BACKUP_FILE
Backup Size: $BACKUP_SIZE
Total Backups: $BACKUP_COUNT
Database: $DB_HOST
Status: Success
EOF

log "Backup summary saved to: $BACKUP_DIR/backup_summary.txt"
log "Backup process completed successfully!"

# Display backup summary
echo ""
echo "=== Backup Summary ==="
cat "$BACKUP_DIR/backup_summary.txt"
echo "======================"
