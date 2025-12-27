# PSR Cloud V2 Database Restore Instructions

## Backup Information
- **Date Created**: 27/12/2025, 3:52:03 pm
- **Main Database**: psr_v4_main_2025-12-27_10-22-02.sql
- **Admin Schemas**: 0 schemas backed up

## Prerequisites
- MySQL server running
- Database user with appropriate privileges
- Access to backup files

## Restore Steps

### 1. Restore Main Database
```bash
# Create the main database if it doesn't exist
mysql -h 168.231.121.19 -P 3306 -u psr_admin -p -e "CREATE DATABASE IF NOT EXISTS psr_v4_main;"

# Restore the main database
mysql -h 168.231.121.19 -P 3306 -u psr_admin -p psr_v4_main < "psr_v4_main_2025-12-27_10-22-02.sql"
```

### Alternative: Direct SQL file execution
```bash
# If you have mysql client installed, use the above commands
# If not, you can import the SQL file using your preferred MySQL client or phpMyAdmin
```

### 2. Restore Admin Schemas


### 3. Verify Restore
```bash
# Check if main database is restored
mysql -h 168.231.121.19 -P 3306 -u psr_admin -p -e "USE psr_v4_main; SHOW TABLES;"

# Check admin schemas
mysql -h 168.231.121.19 -P 3306 -u psr_admin -p -e "SHOW DATABASES LIKE '%_db_%';"
```

## Backup Files
- **Main Database**: `psr_v4_main_2025-12-27_10-22-02.sql`


## Important Notes
1. **MySQL Client**: These backups are created using pure Node.js and don't require mysqldump
2. **Import Methods**: You can import using mysql command line, phpMyAdmin, or any MySQL client
3. **File Format**: Standard SQL format compatible with all MySQL tools
4. **Windows Compatibility**: This backup method works on all operating systems
5. **Large Files**: For large databases, consider importing in chunks or using specialized tools
6. **Permissions**: Ensure the target MySQL server has the same or newer version
7. **Schema Recreation**: Admin schemas will be recreated exactly as they were
8. **Data Integrity**: All foreign key relationships are preserved

## Support
For any issues with restoration, contact the development team.
