#!/bin/bash
set -eo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/lms}"
DB_CONTAINER="lms_database"
DB_USER="${DB_USER:-lms_user}"
DB_NAME="${DB_NAME:-lms_prod}"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup for ${DB_NAME}..."

# Error handling
trap 'echo "Error occurred during backup at line $LINENO. Backup failed." >&2' ERR

# Run pg_dump in the container and gzip the output
docker exec -t $DB_CONTAINER pg_dump -U $DB_USER -F p $DB_NAME | gzip > "$BACKUP_FILE"

# Verify backup was created and has size > 0
if [ -s "$BACKUP_FILE" ]; then
    echo "Backup successfully completed: $BACKUP_FILE"
    echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "Backup file is empty or missing: $BACKUP_FILE"
    rm -f "$BACKUP_FILE"
    exit 1
fi
