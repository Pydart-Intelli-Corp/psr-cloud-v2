# PSR Cloud V2 - Database Scripts Reference Guide

**Date**: January 13, 2026  
**Purpose**: Complete documentation of all database management scripts

---

## Quick Reference

### Most Commonly Used Scripts

```bash
# Check database state BEFORE any operation
node scripts/check-database-state.js

# Create complete backup (CRITICAL before reset)
node scripts/backup-database.js

# Reset entire database (DESTRUCTIVE - use with caution)
node scripts/reset-database.js

# After creating admin user, add farmeruid support
node scripts/add-farmeruid-column.js

# Verify farmeruid was added successfully
node scripts/check-farmeruid-status.js

# Add performance indexes (after admin creation)
node scripts/add-admin-schema-indexes.js
```

---

## 1. reset-database.js

### ✅ Purpose
Complete, irreversible database reset to fresh state

### ⚠️ WARNING
- **DESTRUCTIVE**: Deletes ALL data
- **PERMANENT**: Cannot be undone (need backup to restore)
- **10-Second Countdown**: Provides cancel opportunity

### Execution Flow
```
1. Drop all admin schemas ({name}_db_{key} pattern)
2. Clear all main database tables
3. Drop admin infrastructure (admin_schemas, section_pulse, etc)
4. Create super admin user
5. Seed 3 default machine types
6. Verify reset completion
```

### Usage
```bash
node scripts/reset-database.js
```

### What Gets Reset
```
DELETED:
  ❌ All admin schemas and their 17+ tables each
  ❌ All farmers, societies, BMCs, machines
  ❌ All milk collections and dispatches
  ❌ All user accounts (except super admin)
  ❌ All audit logs and OTPs
  ❌ Admin infrastructure tables

CREATED FRESH:
  ✅ Super admin: admin@poornasreeequipments.com / psr@2025
  ✅ 3 machine types (Analyzer Pro, Ultrasonic, Portable)
  ✅ Empty audit_logs table
  ✅ Empty otps table
```

### Output
```
✅ System is now in fresh state with all admin infrastructure removed
📧 Email: admin@poornasreeequipments.com
🔑 Password: psr@2025
```

### When to Use
- ✅ Fresh deployments
- ✅ Development/testing reset
- ✅ After complete data cleanup
- ❌ Never: In production (without explicit backup+approval)

---

## 2. check-database-state.js

### ✅ Purpose
Analyze current database state and identify potential issues

### Non-Destructive
- ✅ Read-only operation
- ✅ Safe to run anytime
- ✅ Can run multiple times

### Execution Flow
```
1. List main database tables and record counts
2. List all admin schemas with sizes
3. Check user distribution (roles)
4. Verify super admin exists
5. Identify orphaned records
6. Estimate backup size
7. Generate impact summary
```

### Usage
```bash
node scripts/check-database-state.js
```

### Output Details
```
Main Database Tables:
  ℹ️  users: [count]
  ℹ️  admin_schemas: [count]
  ℹ️  machine_types: [count]
  ℹ️  audit_logs: [count]
  etc.

User Statistics:
  ℹ️  super_admin: [count]
  ℹ️  admin: [count]
  etc.

Admin Schemas:
  ℹ️  Total: [count]
  ℹ️  Each schema:
    - Name: {firstname}{lastname}_{key}
    - Tables: [count]
    - Farmers: [count]
    - Collections: [count]
    - Size: [MB]

Data Summary:
  ℹ️  Total farmers: [count]
  ℹ️  Total societies: [count]
  ℹ️  Total collections: [count]
  ℹ️  Estimated backup size: [MB]

⚠️  IMPORTANT: These will be PERMANENTLY DELETED in a reset
```

### When to Use
- ✅ Before any reset operation
- ✅ Regular health checks
- ✅ Capacity planning
- ✅ Identifying data issues

---

## 3. backup-database.js

### ✅ Purpose
Create complete, restorable backup of all databases

### Backup Coverage
- ✅ Main database (psr_v4_main)
- ✅ All admin schemas (each {name}_db_{key})
- ✅ All table structures
- ✅ All data
- ✅ All indexes
- ✅ All constraints

### Execution Flow
```
1. Create backups/ directory (if missing)
2. Generate timestamp for filenames
3. Backup main database to SQL file
4. Backup each admin schema to SQL file
5. Create backup summary document
6. Create restore instructions guide
7. Verify all files created
```

### Usage
```bash
node scripts/backup-database.js
```

### Output Files
```
backups/
├── psr_v4_main_2026-01-13_06-23-14.sql
├── {schema1}_2026-01-13_06-23-14.sql
├── {schema2}_2026-01-13_06-23-14.sql
├── ... (one per admin schema)
├── backup_summary_2026-01-13_06-23-14.txt
└── restore_instructions_2026-01-13_06-23-14.md
```

### Restore Process
```bash
# 1. Drop current database
# 2. Create new database
# 3. Import main database backup
mysql -u psr_admin -p < psr_v4_main_[timestamp].sql

# 4. Create and import each admin schema
mysql -u psr_admin -p < [schema]_[timestamp].sql

# 5. Verify restoration
node scripts/check-database-state.js
```

### File Sizes Estimate
- Main DB: 1-5 MB (depending on users/configs)
- Admin Schema: 10-50 MB each (depending on data)
- Total: ~[num_schemas] × 25 MB average

### When to Use
- ✅ BEFORE any reset (CRITICAL!)
- ✅ Regular backup schedule (daily/weekly)
- ✅ Before major schema changes
- ✅ Before software upgrades

### Pro Tips
1. **Compression**: Compress backups/ folder for archive
2. **Offsite**: Copy backups to secure location
3. **Automation**: Add to cron/task scheduler
4. **Retention**: Keep 30 days of backups
5. **Testing**: Periodically test restore process

---

## 4. add-farmeruid-column.js ⭐ NEW

### ✅ Purpose
Add `farmeruid` column to existing farmer tables

### Safety Features
- ✅ Checks if column already exists (idempotent)
- ✅ Safe to run multiple times
- ✅ Creates UNIQUE constraint
- ✅ Creates performance index
- ✅ Detailed logging

### Column Definition
```sql
farmeruid VARCHAR(100) UNIQUE NULL
├── Type: VARCHAR 100 characters
├── Constraint: UNIQUE (no duplicates)
├── Nullable: YES (NULL allowed initially)
├── Index: idx_farmeruid
└── Purpose: Unique farmer identifier
```

### Execution Flow
```
1. Connect to database
2. Get all admin schemas
3. For each schema:
   a. Check if farmers table exists
   b. Check if farmeruid column exists
   c. If not exists:
      - ALTER TABLE ADD COLUMN
      - CREATE UNIQUE INDEX
   d. Log status
4. Generate summary report
```

### Usage
```bash
node scripts/add-farmeruid-column.js
```

### Output
```
✅ Connected to database
🔍 Fetching all admin schemas
📊 Found [count] admin schemas
✅ Processing schema: [name]
   ├─ Checking farmers table...
   ├─ farmeruid column: [EXISTS/ADDING]
   ├─ Creating index: idx_farmeruid
   └─ ✅ Schema complete

✨ Migration completed successfully!
   ├─ Schemas processed: [count]
   ├─ Columns added: [count]
   └─ Errors: [count]
```

### When to Use
- ✅ After updating schema definition
- ✅ To add farmeruid to existing schemas
- ✅ Safe to run anytime (checks before modifying)
- ✅ Can run multiple times (idempotent)

### Notes
- Auto-runs on new schema creation
- Manually needed for existing pre-update schemas
- Takes ~30 seconds per admin schema
- No data loss

---

## 5. check-farmeruid-status.js ⭐ NEW

### ✅ Purpose
Verify `farmeruid` column exists in all farmer tables

### Verification Details
- ✅ Column exists (Y/N)
- ✅ Column type (VARCHAR 100)
- ✅ Nullable status
- ✅ Unique constraint
- ✅ NULL value count
- ✅ Performance index present

### Execution Flow
```
1. Connect to database
2. Get all admin schemas
3. For each schema:
   a. Check if farmers table exists
   b. Get column properties
   c. Check for NULL values
   d. Verify indexes
4. Generate detailed report
```

### Usage
```bash
node scripts/check-farmeruid-status.js
```

### Output Format
```
Schema Name              Column  Type           Nullable  Unique  NULLs   Status
────────────────────────────────────────────────────────────────────────────────
johndoe_jhd5739         YES     VARCHAR(100)   YES       YES     0       ✅
mariasmith_mrs7821      YES     VARCHAR(100)   YES       YES     15      ⚠️
testadmin_tst1234       NO      -              -         -       -       ❌

Summary:
  ✅ Schemas with farmeruid: [count]
  ⚠️  Schemas with NULL values: [count]
  ❌ Schemas missing farmeruid: [count]
```

### When to Use
- ✅ After running add-farmeruid-column.js
- ✅ Verify migration completion
- ✅ Check data quality
- ✅ Regular health checks
- ✅ Before production deployment

### Fix NULL Values (if needed)
```javascript
// Generate automatic farmeruid for NULL values:
UPDATE `{schema}`.farmers 
SET farmeruid = CONCAT('FARM_', id, '_', LEFT(MD5(RAND()), 6))
WHERE farmeruid IS NULL;
```

---

## 6. add-admin-schema-indexes.js

### ✅ Purpose
Add performance indexes to admin schemas for fast queries

### Indexes Added
```
Farmers Table:
  ✅ idx_farmers_society_id    (for society lookups)
  ✅ idx_farmers_status        (for active/inactive filters)
  ✅ idx_farmeruid             (for unique farmer ID searches)

Milk Collections:
  ✅ idx_milk_collections_date (for historical queries)
  ✅ idx_milk_collections_farmer_id
  ✅ idx_milk_collections_society_date (composite)

Machines:
  ✅ idx_machines_society_id
  ✅ idx_machines_status

Societies:
  ✅ idx_societies_bmc_id
  ✅ idx_societies_status

BMCs & Dairies:
  ✅ idx_bmcs_status
  ✅ idx_dairy_farms_status

[+ 3 more indexes for analytics]
```

### Execution Flow
```
1. Get all admin schemas
2. For each schema:
   a. Check if index already exists
   b. If not, CREATE INDEX
   c. Log status
3. Generate summary
```

### Usage
```bash
node scripts/add-admin-schema-indexes.js
```

### When to Use
- ✅ After creating new admin schemas
- ✅ Performance optimization
- ✅ Before production deployment
- ✅ Safe to run multiple times

### Performance Impact
- **Query Speed**: ⬆️ 10-100x faster (depending on index)
- **Insert Speed**: ⬇️ ~5% slower (index maintenance)
- **Storage**: ~+10% per admin schema (for indexes)
- **Rebuild Time**: ~1-2 minutes per schema

---

## 7. add-farmer-otp-columns.ts

### ✅ Purpose
Add OTP columns to farmers table (+ farmeruid)

### Columns Added
```sql
otp_code VARCHAR(10)         -- 6-digit OTP code
otp_expires DATETIME         -- OTP expiry timestamp
farmeruid VARCHAR(100)       -- Unique farmer ID ⭐
```

### Safety
- ✅ Checks if columns exist before adding
- ✅ Idempotent (safe to run multiple times)
- ✅ Creates indexes for OTP lookups

### Usage
```bash
npx ts-node scripts/add-farmer-otp-columns.ts
```

### When to Use
- ✅ During farmer registration setup
- ✅ Enable OTP-based farmer authentication
- ✅ Add farmeruid support

---

## 8. add-machine-image-column.js

### ✅ Purpose
Add `image_url` column to machines table

### Column Definition
```sql
image_url VARCHAR(500)
├── Type: URL/file path
├── Purpose: Store machine image reference
└── Nullable: YES
```

### Usage
```bash
node scripts/add-machine-image-column.js
```

### When to Use
- ✅ To enable machine image display
- ✅ Extend machine metadata

---

## 9. Verification & Utility Scripts

### find-farmer.js
```bash
node scripts/find-farmer.js [farmerId or farmerName]
# Output: Complete farmer details including farmeruid
```

### add-sample-farmer-collection.js
```bash
node scripts/add-sample-farmer-collection.js
# Creates: Sample farmers, collections, test data
```

### verify-machine-image-migration.js
```bash
node scripts/verify-machine-image-migration.js
# Verifies: image_url column exists in all schemas
```

### check-farmer-society.js
```bash
node scripts/check-farmer-society.js
# Verifies: All farmer-society relationships valid
```

### check-rate-chart-data.js
```bash
node scripts/check-rate-chart-data.js
# Verifies: Rate chart data integrity
```

### fix-duplicate-access-requests.js
```bash
node scripts/fix-duplicate-access-requests.js
# Removes: Duplicate machine access requests
```

### update-access-requests-status.js
```bash
node scripts/update-access-requests-status.js
# Bulk updates: Access request statuses
```

---

## Script Execution Workflow

### Development Setup
```bash
# 1. Fresh start
node scripts/reset-database.js

# 2. Create test admin via UI
# (This auto-creates admin schema)

# 3. Verify structure
node scripts/check-database-state.js

# 4. Add farmeruid support
node scripts/add-farmeruid-column.js

# 5. Verify farmeruid
node scripts/check-farmeruid-status.js

# 6. Add performance indexes
node scripts/add-admin-schema-indexes.js

# 7. Add sample data (optional)
node scripts/add-sample-farmer-collection.js

# 8. Verify everything
node scripts/check-database-state.js
```

### Production Preparation
```bash
# 1. Backup current state
node scripts/backup-database.js

# 2. Check all admins have indexes
node scripts/add-admin-schema-indexes.js

# 3. Verify farmeruid deployment
node scripts/check-farmeruid-status.js

# 4. Check data integrity
node scripts/check-database-state.js
node scripts/check-farmer-society.js
node scripts/check-rate-chart-data.js

# 5. Ready for deployment ✅
```

---

## Error Handling & Troubleshooting

### Common Issues

**Issue**: "Cannot connect to database"
```bash
# Check .env file
cat .env
# Verify: DB_HOST, DB_USER, DB_PASSWORD, DB_PORT
```

**Issue**: "Access denied for user 'psr_admin'"
```bash
# Check credentials
echo $env:DB_PASSWORD
# May need to update credentials
```

**Issue**: "Column already exists"
```bash
# This is OK - scripts handle it
# No harm running add-column scripts multiple times
```

**Issue**: "Foreign key constraint fails"
```bash
# Script automatically disables/re-enables FK checks
# If issues: Check orphaned records with check-database-state.js
```

---

## Best Practices

### 1. Always Backup First
```bash
node scripts/backup-database.js
# Before: reset, major changes, or production updates
```

### 2. Check State Before Operations
```bash
node scripts/check-database-state.js
# Understand current state before making changes
```

### 3. Test on Development
```
✅ Always test scripts on dev first
❌ Never experiment on production
```

### 4. Verify Results
```bash
# After any script execution:
node scripts/check-database-state.js
node scripts/check-farmeruid-status.js
```

### 5. Keep Backups Safe
```
✅ Store in backups/ directory
✅ Rotate backups (keep 30 days)
✅ Archive old backups to external storage
❌ Don't keep backups on same server
```

### 6. Document Changes
```
✅ Record when scripts are run
✅ Keep change logs
✅ Document any manual modifications
```

---

## Summary Table

| Script | Purpose | Destructive | Idempotent | When to Use |
|--------|---------|------------|-----------|------------|
| reset-database.js | Complete reset | ✅ YES | ❌ NO | Fresh start |
| check-database-state.js | Analyze state | ❌ NO | ✅ YES | Always before changes |
| backup-database.js | Create backup | ❌ NO | ✅ YES | Before major ops |
| add-farmeruid-column.js | Add farmeruid | ⚠️ Modify | ✅ YES | Setup/migration |
| check-farmeruid-status.js | Verify farmeruid | ❌ NO | ✅ YES | After migrations |
| add-admin-schema-indexes.js | Add indexes | ⚠️ Modify | ✅ YES | Performance opt |
| add-farmer-otp-columns.ts | Add OTP cols | ⚠️ Modify | ✅ YES | Setup OTP auth |
| Other utilities | Various | Varies | ✅ YES | As needed |

---

**Document Version**: 2.0  
**Last Updated**: January 13, 2026  
**Status**: Complete & Production-Ready
