#!/bin/bash
set -eo pipefail

if [ -z "$1" ]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
DB_CONTAINER="lms_database"
DB_USER="${DB_USER:-lms_user}"
DB_NAME="${DB_NAME:-lms_prod}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file $BACKUP_FILE does not exist."
    exit 1
fi

echo "WARNING: This will overwrite the existing database '${DB_NAME}'."
read -p "Are you sure you want to proceed? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore aborted."
    exit 1
fi

echo "Starting database restore from $BACKUP_FILE..."

# Error handling
trap 'echo "Error occurred during restore at line $LINENO. Restore failed." >&2' ERR

# Drop and recreate database (requires postgres admin user or specific permissions)
# Assuming db_user has permissions, or we connect to default db 'postgres' to recreate
echo "Recreating database..."
docker exec -t $DB_CONTAINER psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
docker exec -t $DB_CONTAINER psql -U $DB_USER -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

echo "Restoring data..."
gunzip -c "$BACKUP_FILE" | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME

echo "Restore successfully completed."
