#!/bin/bash

# =============================================================================
# Manual CSV Backup Import Helper
# =============================================================================
# Use this to organize CSV exports from Supabase Table Editor
# Usage: ./import-csv-backup.sh
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CSV_BACKUP_DIR="$BACKUP_DIR/csv_$TIMESTAMP"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  CSV Backup Import Helper             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
echo ""

# Create directories
mkdir -p "$CSV_BACKUP_DIR"

echo -e "${GREEN}📦 CSV backup folder created:${NC}"
echo "  $CSV_BACKUP_DIR"
echo ""

echo -e "${YELLOW}📋 Instructions:${NC}"
echo ""
echo "1. Go to Supabase Dashboard → Table Editor"
echo "   ${BLUE}https://supabase.com/dashboard/project/oqctmbjsepdwgddymgfs/editor${NC}"
echo ""
echo "2. For each table you want to backup:"
echo "   - Click on the table name"
echo "   - Click '•••' (three dots menu)"
echo "   - Select 'Download as CSV'"
echo "   - Save to your Downloads folder"
echo ""
echo "3. Move all CSV files to the backup folder:"
echo "   ${GREEN}mv ~/Downloads/*.csv \"$CSV_BACKUP_DIR/\"${NC}"
echo ""
echo "4. When done, press Enter to continue..."
read -r

# Check for CSV files
CSV_COUNT=$(ls -1 "$CSV_BACKUP_DIR"/*.csv 2>/dev/null | wc -l | tr -d ' ')

if [ "$CSV_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No CSV files found in the backup folder${NC}"
    echo ""
    echo "Please move your exported CSV files to:"
    echo "  $CSV_BACKUP_DIR"
    echo ""
    echo "Then run this script again."
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Found $CSV_COUNT CSV file(s)${NC}"
echo ""

# List the files
echo "Files:"
ls -lh "$CSV_BACKUP_DIR"/*.csv | awk '{print "  - " $9 " (" $5 ")"}'
echo ""

# Create a README for this backup
cat > "$CSV_BACKUP_DIR/README.md" << EOF
# CSV Database Backup

**Date:** $(date +"%Y-%m-%d %H:%M:%S")  
**Tables Exported:** $CSV_COUNT  
**Format:** CSV (exported from Supabase Table Editor)

## Files

$(ls -1 "$CSV_BACKUP_DIR"/*.csv | xargs -I {} basename {} | sed 's/^/- /')

## Restore Instructions

To restore this data:

1. Go to Supabase Dashboard → Table Editor
2. Create tables if they don't exist (use schema from DATABASE_SETUP_MULTIUSER.sql)
3. For each CSV file:
   - Click on the corresponding table
   - Click "Insert" → "Import data from CSV"
   - Select the CSV file
   - Map columns
   - Import

## Note

This is a manual CSV export, not a full SQL dump. Schema and relationships are not included.
For full backups, upgrade to Supabase Pro plan.

---
Exported on: $(date +"%Y-%m-%d %H:%M:%S")
EOF

echo -e "${GREEN}✅ Created README.md in backup folder${NC}"
echo ""

# Calculate total size
TOTAL_SIZE=$(du -sh "$CSV_BACKUP_DIR" | cut -f1)

# Git operations
cd "$SCRIPT_DIR"
if [ -d ".git" ]; then
    echo -e "${BLUE}💾 Adding to git...${NC}"
    git add backup/
    
    if ! git diff --cached --quiet; then
        git commit -m "CSV database backup - $CSV_COUNT tables - $(date +"%Y-%m-%d %H:%M:%S")"
        echo -e "${GREEN}✅ Committed to git${NC}"
        echo ""
        
        read -p "Push to GitHub now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
            if git push origin main; then
                echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
            else
                echo -e "${RED}❌ Failed to push. Run manually: git push origin main${NC}"
            fi
        else
            echo -e "${BLUE}ℹ️  Skipped push. Run 'git push origin main' when ready.${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  No changes to commit${NC}"
    fi
fi

# Create summary
cat > "$BACKUP_DIR/csv_backup_summary.txt" << EOF
Last CSV Backup Summary
========================
Date: $(date +"%Y-%m-%d %H:%M:%S")
Method: Manual CSV Export (Supabase Free Tier)
Tables Exported: $CSV_COUNT
Total Size: $TOTAL_SIZE
Backup Folder: csv_$TIMESTAMP
Status: Success

Files Included:
$(ls -1 "$CSV_BACKUP_DIR"/*.csv | xargs -I {} basename {})
EOF

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Backup Summary                       ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
cat "$BACKUP_DIR/csv_backup_summary.txt"
echo ""
echo -e "${BLUE}🎉 CSV backup complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Note:${NC} This is a data-only backup. Schema and relationships"
echo "   are not included. For full backups, consider upgrading to Pro."
