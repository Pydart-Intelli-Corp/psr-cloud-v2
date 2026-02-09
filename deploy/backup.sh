#!/bin/bash

###############################################################################
# PSR Cloud V2 - Database Backup Script
###############################################################################

APP_DIR="/var/www/psr-v4"
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."

# Source environment variables
source "$APP_DIR/.env"

# Backup database
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/psr_v4_main_$DATE.sql"

# Get all admin schemas
mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES LIKE '%\_%';" | grep -v "Database" | while read db; do
    if [[ $db != *"performance_schema"* ]] && [[ $db != *"information_schema"* ]] && [[ $db != *"mysql"* ]]; then
        echo "Backing up schema: $db"
        mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$db" > "$BACKUP_DIR/${db}_$DATE.sql"
    fi
done

# Compress backups
cd "$BACKUP_DIR"
tar -czf "psr_v4_backup_$DATE.tar.gz" *_$DATE.sql
rm -f *_$DATE.sql

echo "✅ Backup completed: $BACKUP_DIR/psr_v4_backup_$DATE.tar.gz"
