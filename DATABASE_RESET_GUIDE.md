# PSR Cloud V2 - Complete Database Reset Guide

## 🚨 CRITICAL WARNING
This process will **PERMANENTLY DELETE ALL DATA** from your PSR Cloud V2 database. This includes:
- All admin users and their schemas
- All farmers, societies, BMCs, and dairy farms
- All milk collection, dispatch, and sales data
- All machine configurations and registrations
- All reports and analytics history

**This action is IRREVERSIBLE!**

## Prerequisites

1. **Node.js** installed (v18+ recommended)
2. **MySQL client** access to the database
3. **Administrative privileges** on the database server
4. **Network access** to the database host

## Step-by-Step Reset Process

### 1. Check Current Database State

Before proceeding, analyze your current database to understand what will be lost:

```bash
npm run db:check
```

This will show you:
- Number of admin schemas
- Total farmers, societies, machines
- Collection data volume
- Estimated backup size
- Data integrity issues

### 2. Create Complete Backup (HIGHLY RECOMMENDED)

```bash
npm run db:backup
```

This creates timestamped backups in the `/backups/` folder:
- Main database backup
- All admin schema backups
- Restore instructions
- Backup summary

**Verify backup completion before proceeding!**

### 3. Run Database State Check

```bash
npm run db:check
```

Review the impact summary carefully. This is your last chance to verify what will be deleted.

### 4. Execute Complete Reset

```bash
npm run db:reset-all
```

⏳ **The script includes a 10-second countdown** - Press `Ctrl+C` to cancel if needed.

The reset process will:
1. Drop all admin schemas
2. Clear all main database tables
3. Recreate Super Admin user
4. Seed default machine types
5. Verify reset completion

### 5. Verify Reset Success

After reset, verify the system state:

- **Login Test**: Use the Super Admin credentials
- **Clean State**: Confirm no admin schemas exist
- **Seeded Data**: Verify machine types are present

## Post-Reset Configuration

### Super Admin Credentials
```
Email: admin@poornasreeequipments.com
Password: psr@2025
Role: super_admin
Status: active
```

### Default Machine Types
- Milk Analyzer Pro
- Ultrasonic Milk Analyzer  
- Portable Milk Tester

### System State
- ✅ Clean database with core structure
- ✅ Super Admin account ready
- ✅ Machine types seeded
- ❌ No admin users (must be recreated)
- ❌ No farmer data
- ❌ No collection history

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run db:check` | Analyze current database state |
| `npm run db:backup` | Create complete database backup |
| `npm run db:reset-all` | **DESTRUCTIVE** - Complete database reset |
| `npm run db:indexes` | Add performance indexes to admin schemas |

## Recovery from Backup

If you need to restore from backup:

1. **Locate backup files** in `/backups/` folder
2. **Follow restore instructions** in the generated markdown file
3. **Use MySQL commands** as specified in backup documentation

Example restore commands:
```bash
# Restore main database
mysql -h HOST -P PORT -u USER -p DATABASE_NAME < psr_v4_main_backup.sql

# Restore admin schemas
mysql -h HOST -P PORT -u USER -p < admin_schema_backup.sql
```

## Troubleshooting

### Connection Issues
- Verify database host and port
- Check SSL certificate configuration
- Confirm network connectivity

### Permission Errors
- Ensure database user has DROP/CREATE privileges
- Verify schema-level permissions
- Check for active connections blocking operations

### Script Failures
- Review error messages carefully
- Check database logs
- Ensure sufficient disk space
- Verify MySQL server version compatibility

### Partial Reset
If reset fails midway:
1. Check database state: `npm run db:check`
2. Restore from backup if needed
3. Fix underlying issue
4. Retry reset process

## Safety Considerations

1. **Always backup first** - No exceptions
2. **Test on development environment** before production
3. **Coordinate with team** - Ensure no active users
4. **Verify backups** before deleting data
5. **Have rollback plan** ready

## Development Team Contacts

For issues during reset process:
- Check application logs first
- Review database server logs
- Contact system administrator
- Escalate to development team if needed

## Environment-Specific Notes

### Development Environment
- Safe to reset frequently
- Use for testing reset procedures
- Minimal data loss impact

### Staging Environment
- Coordinate with testing team
- Backup before major releases
- Document reset reasons

### Production Environment
- **EXTREME CAUTION REQUIRED**
- Business approval mandatory
- Backup verification critical
- Downtime coordination needed
- Post-reset validation essential

---

**Remember**: This reset is designed to give you a completely fresh start. All historical data will be lost forever. Make sure this is exactly what you need before proceeding.