# PSR Cloud V2 - Database Management Guide

## Overview

The PSR Cloud V2 system uses a sophisticated database architecture with:

- **Main Database**: `psr_v4_main` - Contains core system tables
- **Admin Schemas**: Dynamic schemas for each admin user (`{adminName}_{dbKey}`)
- **MySQL Azure**: Cloud-hosted database with SSL encryption
- **Role Hierarchy**: Super Admin → Admin → Dairy → BMC → Society → Farmer

## Database Architecture

### Main Database Tables
- `users` - User accounts and authentication
- `admin_schemas` - Admin schema registry
- `machine_types` - Machine type definitions
- `section_pulse` - Real-time monitoring data
- `rate_charts` - Pricing chart management
- `rate_chart_download_history` - Download tracking
- `sequelize_meta` - Migration tracking

### Admin Schema Tables (Per Admin)
- `dairy_farms` - Dairy farm management
- `bmcs` - Bulk Milk Cooling Centers
- `societies` - Milk collection societies
- `farmers` - Farmer registration and management
- `machines` - Machine inventory and status
- `milk_collections` - Daily milk collection data
- `milk_dispatches` - Milk dispatch records
- `milk_sales` - Sales transaction records

## Available Scripts

### Development Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Database Migration Scripts
```bash
# Run all pending migrations
npm run db:migrate

# Undo last migration
npm run db:migrate:undo

# Undo all migrations
npm run db:migrate:undo:all

# Seed database with default data
npm run db:seed

# Undo all seeds
npm run db:seed:undo

# Create new database
npm run db:create

# Drop database
npm run db:drop

# Complete reset (drop, create, migrate, seed)
npm run db:reset
```

### Custom Database Scripts
```bash
# Create complete database backup
npm run db:backup

# Complete database reset (DESTRUCTIVE)
npm run db:reset-all

# Add performance indexes to admin schemas
npm run db:indexes
```

## Database Reset Process

⚠️ **WARNING: The reset process is DESTRUCTIVE and IRREVERSIBLE**

### What Gets Reset

1. **All Admin Schemas** - Completely dropped with all data
2. **Main Database Tables** - All data cleared (structure preserved)
3. **User Accounts** - All users except Super Admin removed
4. **Collection Data** - All milk collection, dispatch, and sales data
5. **Machine Data** - All machine registrations and configurations
6. **Reports** - All generated reports and analytics

### What Gets Preserved

1. **Database Structure** - All table schemas remain intact
2. **Migrations** - Migration history is maintained
3. **Super Admin** - Default super admin account is recreated

### Reset Steps

1. **Backup First** (Recommended):
   ```bash
   npm run db:backup
   ```

2. **Run Reset**:
   ```bash
   npm run db:reset-all
   ```

3. **Verify Reset**:
   - Check login with super admin credentials
   - Verify empty admin schemas list
   - Confirm machine types are seeded

### Post-Reset State

After reset, the system will be in a fresh state with:

- **Super Admin Account**:
  - Email: `admin@poornasreeequipments.com`
  - Password: `psr@2025`
  - Role: `super_admin`
  - Status: `active`

- **Default Machine Types**:
  - Milk Analyzer Pro
  - Ultrasonic Milk Analyzer
  - Portable Milk Tester

- **Empty System**:
  - No admin users
  - No admin schemas
  - No collection data
  - No farmers or societies

## Backup and Restore

### Creating Backups

The backup script creates timestamped backups of:
- Main database structure and data
- All admin schemas and their data
- Restore instructions
- Backup summary

```bash
# Create complete backup
npm run db:backup
```

Backup files are stored in `/backups/` directory:
- `psr_v4_main_YYYY-MM-DD_HH-mm-ss.sql`
- `admin_schema_{schema}_YYYY-MM-DD_HH-mm-ss.sql`
- `restore_instructions_YYYY-MM-DD_HH-mm-ss.md`
- `backup_summary_YYYY-MM-DD_HH-mm-ss.txt`

### Restoring from Backup

1. **Main Database**:
   ```bash
   mysql -h HOST -P PORT -u USER -p DATABASE_NAME < backup_file.sql
   ```

2. **Admin Schemas**:
   ```bash
   mysql -h HOST -P PORT -u USER -p < admin_schema_backup.sql
   ```

3. **Follow restore instructions** provided in backup directory

## Performance Optimization

### Indexes

The system includes comprehensive indexing for optimal performance:

- **Primary Keys**: All tables have auto-incrementing primary keys
- **Foreign Keys**: Indexed for efficient joins
- **Search Columns**: society_id, farmer_id, machine_id
- **Date Columns**: collection_date, created_at
- **Status Columns**: All status fields are indexed
- **Composite Indexes**: society_date for analytics queries

### Query Optimization

- 30-day analytics are pre-aggregated
- Bulk operations use transactions
- Connection pooling for concurrent requests
- SSL encryption for security

## Environment Configuration

### Database Connection
```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=psr_v4_main
DB_SSL_CA=path/to/ssl-cert.pem  # Optional
```

### Pool Settings
```env
DB_POOL_MAX=10
DB_POOL_MIN=0
DB_CONNECTION_TIMEOUT=30
DB_CONNECTION_LIFETIME=300
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**:
   - Check network connectivity
   - Verify SSL certificate path
   - Increase timeout values

2. **Migration Failures**:
   - Check for existing data conflicts
   - Verify user permissions
   - Run migrations individually

3. **Schema Creation Errors**:
   - Ensure admin has valid dbKey
   - Check for name conflicts
   - Verify database permissions

4. **Performance Issues**:
   - Run index optimization script
   - Check query execution plans
   - Monitor connection pool usage

### Error Recovery

1. **Failed Migration**:
   ```bash
   npm run db:migrate:undo
   # Fix migration file
   npm run db:migrate
   ```

2. **Corrupted Admin Schema**:
   ```bash
   # Backup first
   npm run db:backup
   # Drop specific schema manually
   # Recreate admin user
   ```

3. **Complete Recovery**:
   ```bash
   # Restore from backup
   mysql -h HOST -u USER -p < backup_file.sql
   ```

## Development Guidelines

### Adding New Tables

1. Create migration file
2. Update admin schema creation
3. Add appropriate indexes
4. Update backup script if needed

### Schema Changes

1. Always create migrations
2. Test on development environment
3. Update documentation
4. Consider index impacts

### Data Safety

1. Always backup before major changes
2. Test scripts on development database
3. Use transactions for bulk operations
4. Verify data integrity after changes

## Support

For database-related issues:

1. Check application logs
2. Verify database connectivity
3. Review migration status
4. Contact development team

---

**Last Updated**: December 27, 2025
**Version**: PSR Cloud V2.0