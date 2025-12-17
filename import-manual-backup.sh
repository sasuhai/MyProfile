#!/bin/bash

# =============================================================================
# Helper Script: Import and Commit Manual Backup
# =============================================================================
# Use this after downloading a backup from Supabase Dashboard
# Usage: ./import-manual-backup.sh ~/Downloads/backup-*.sql
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Manual Backup Import Helper         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Check if file was provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo ""
    echo "Usage:"
    echo "  ./import-manual-backup.sh ~/Downloads/backup-*.sql"
    echo ""
    echo "OR drag and drop the backup file here after typing:"
    echo "  ./import-manual-backup.sh "
    exit 1
fi

SOURCE_FILE="$1"

# Check if file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}Error: File not found: $SOURCE_FILE${NC}"
    exit 1
fi

# Check if it's a SQL file
if [[ ! "$SOURCE_FILE" =~ \.sql$ ]]; then
    echo -e "${RED}Error: File must be a .sql file${NC}"
    exit 1
fi

# Create backup directory if needed
mkdir -p "$BACKUP_DIR"

# Generate new filename
NEW_FILENAME="database_backup_${TIMESTAMP}.sql"
DEST_FILE="$BACKUP_DIR/$NEW_FILENAME"
LATEST_FILE="$BACKUP_DIR/database_backup_latest.sql"

# Copy the file
echo -e "${GREEN}📦 Importing backup file...${NC}"
cp "$SOURCE_FILE" "$DEST_FILE"

# Create latest link
cp "$DEST_FILE" "$LATEST_FILE"

# Get file size
FILE_SIZE=$(du -h "$DEST_FILE" | cut -f1)

echo -e "${GREEN}✅ Backup imported successfully!${NC}"
echo ""
echo "  Filename: $NEW_FILENAME"
echo "  Size: $FILE_SIZE"
echo "  Location: $DEST_FILE"
echo ""

# Cleanup old backups (keep last 7)
echo -e "${BLUE}🧹 Cleaning old backups (keeping last 7)...${NC}"
cd "$BACKUP_DIR"
ls -t database_backup_*.sql | grep -v "latest" | tail -n +8 | xargs -r rm -f 2>/dev/null || true
BACKUP_COUNT=$(ls -1 database_backup_*.sql 2>/dev/null | grep -v "latest" | wc -l | tr -d ' ')
echo -e "${GREEN}📁 Current backup count: $BACKUP_COUNT${NC}"
echo ""

# Git operations
cd "$SCRIPT_DIR"
if [ -d ".git" ]; then
    echo -e "${BLUE}💾 Adding to git...${NC}"
    git add backup/
    
    if ! git diff --cached --quiet; then
        git commit -m "Manual database backup - $(date +"%Y-%m-%d %H:%M:%S")"
        echo -e "${GREEN}✅ Committed to git${NC}"
        echo ""
        
        read -p "Push to GitHub now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
            if git push origin main; then
                echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
            else
                echo -e "${RED}❌ Failed to push. You can push manually later with: git push origin main${NC}"
            fi
        else
            echo -e "${BLUE}ℹ️  Skipped push. Run 'git push origin main' when ready.${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  No changes to commit (identical to previous backup)${NC}"
    fi
else
    echo -e "${RED}⚠️  Not a git repository. Skipping git operations.${NC}"
fi

# Create summary
cat > "$BACKUP_DIR/backup_summary.txt" << EOF
Last Backup Summary
===================
Date: $(date +"%Y-%m-%d %H:%M:%S")
Method: Manual (Supabase Dashboard)
Backup File: $NEW_FILENAME
Backup Size: $FILE_SIZE
Total Backups: $BACKUP_COUNT
Status: Success
EOF

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Backup Summary                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
cat "$BACKUP_DIR/backup_summary.txt"
echo ""
echo -e "${BLUE}🎉 All done!${NC}"
