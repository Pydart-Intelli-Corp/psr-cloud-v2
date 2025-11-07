# Database Table Name Case Sensitivity Fix

## Issue
MySQL on Linux is **case-sensitive** for table names, causing deployment failures when table names didn't match between migrations and seeders.

### Error
```
ERROR: Table 'psr_v4_main.Users' doesn't exist
```

## Root Cause
- Migration created tables with capital letters: `Users`, `AdminSchemas`, `AuditLogs`, `OTPs`, `MachineType`
- Seeders and queries referenced tables inconsistently
- MySQL on Linux treats `Users` and `users` as different tables

## Solution
Changed all table names to **lowercase with underscores** to follow MySQL best practices.

## Files Modified

### 1. `database/migrations/20251107073654-create-all-tables.js`

**Changed Table Names:**
- `Users` → `users` ✅
- `AdminSchemas` → `admin_schemas` ✅
- `AuditLogs` → `audit_logs` ✅
- `OTPs` → `otps` ✅
- `MachineType` → `machine_type` ✅

**Changed Foreign Key References:**
```javascript
// Old
references: { model: 'Users', key: 'id' }

// New
references: { model: 'users', key: 'id' }
```

**Changed Indexes:**
```javascript
// Old
await queryInterface.addIndex('Users', ['email'], ...)
await queryInterface.addIndex('AdminSchemas', ['adminId'], ...)

// New
await queryInterface.addIndex('users', ['email'], ...)
await queryInterface.addIndex('admin_schemas', ['adminId'], ...)
```

**Changed Bulk Insert:**
```javascript
// Old
await queryInterface.bulkInsert('MachineType', [...])

// New
await queryInterface.bulkInsert('machine_type', [...])
```

**Changed Drop Statements:**
```javascript
// Old
await queryInterface.dropTable('Users');
await queryInterface.dropTable('AdminSchemas');

// New
await queryInterface.dropTable('users');
await queryInterface.dropTable('admin_schemas');
```

### 2. `database/seeders/20241022000001-super-admin-user.js`

**Changed Table References:**
```javascript
// Old
await queryInterface.bulkInsert('Users', [...])
await queryInterface.bulkDelete('Users', {...})

// New
await queryInterface.bulkInsert('users', [...])
await queryInterface.bulkDelete('users', {...})
```

### 3. `database/seeders/20241027000001-seed-machine-types.js`

**Changed Table References:**
```javascript
// Old
await queryInterface.bulkInsert('machinetype', [...])
await queryInterface.bulkDelete('machinetype', ...)

// New
await queryInterface.bulkInsert('machine_type', [...])
await queryInterface.bulkDelete('machine_type', ...)
```

### 4. `.github/workflows/deploy-vps.yml`

**Changed Super Admin Existence Check:**
```bash
# Old
SELECT COUNT(*) FROM Users WHERE role = 'super_admin' ...

# New
SELECT COUNT(*) FROM users WHERE role = 'super_admin' ...
```

## Database Schema

### Final Table Structure (Lowercase)
1. **`users`** - User accounts and authentication
2. **`admin_schemas`** - Admin-specific database schemas
3. **`audit_logs`** - System audit trail
4. **`otps`** - OTP verification codes
5. **`machine_type`** - Machine type definitions
6. **`sequelize_meta`** - Migration tracking (auto-created)

### Relationships
```
users (parent) ─┬─ users.parentId (self-referencing)
                ├─ admin_schemas.adminId
                └─ audit_logs.userId
```

## Next Steps to Apply Changes

### Step 1: Reset Database (VPS)
```bash
ssh root@168.231.121.19
mysql -u psr_admin -p

# Enter password: PsrAdmin@20252!

DROP DATABASE psr_v4_main;
CREATE DATABASE psr_v4_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### Step 2: Commit Changes
```bash
git add database/migrations/20251107073654-create-all-tables.js
git add database/seeders/20241022000001-super-admin-user.js
git add database/seeders/20241027000001-seed-machine-types.js
git add .github/workflows/deploy-vps.yml
git add DATABASE_TABLE_NAME_FIX.md
git commit -m "fix: Change all database table names to lowercase for MySQL case-sensitivity

- Update migration: Users → users, AdminSchemas → admin_schemas, etc.
- Update super admin seeder to use lowercase table names
- Update machine types seeder: machinetype → machine_type
- Update deployment workflow super admin check
- Fixes: ERROR Table 'psr_v4_main.Users' doesn't exist"
git push origin master
```

### Step 3: Watch Deployment
The GitHub Actions workflow will automatically:
1. Build the application ✅
2. Deploy to VPS ✅
3. Run migrations (with lowercase table names) ✅
4. Create super admin user ✅

### Step 4: Verify Super Admin Created
```bash
ssh root@168.231.121.19
mysql -u psr_admin -p psr_v4_main -e "SELECT uid, email, role, status FROM users WHERE role = 'super_admin';"
```

**Expected Output:**
```
+------------------+-----------------------------------+--------------+--------+
| uid              | email                             | role         | status |
+------------------+-----------------------------------+--------------+--------+
| PSR_SUPER_[...]  | admin@poornasreeequipments.com    | super_admin  | active |
+------------------+-----------------------------------+--------------+--------+
```

### Step 5: Test Login
1. Navigate to: http://168.231.121.19/superadmin
2. Login with:
   - **Email:** admin@poornasreeequipments.com
   - **Password:** psr@2025
3. Verify dashboard loads successfully

## Prevention

### MySQL Naming Best Practices
✅ **Do:**
- Use lowercase table names: `users`, `admin_schemas`
- Use underscores for multi-word names: `audit_logs`, `machine_type`
- Be consistent across migrations, seeders, and models

❌ **Don't:**
- Mix cases: `Users`, `AdminSchemas`
- Use camelCase for table names: `adminSchemas`, `auditLogs`
- Rely on case-insensitive behavior (Windows/macOS)

### Future Model Definitions
When creating Sequelize models, always specify lowercase `tableName`:

```javascript
class User extends Model {
  static init(sequelize) {
    return super.init({
      // ... fields
    }, {
      sequelize,
      tableName: 'users',  // ✅ Lowercase
      modelName: 'User'    // PascalCase OK for model
    });
  }
}
```

## References
- MySQL Documentation: [Identifier Case Sensitivity](https://dev.mysql.com/doc/refman/8.0/en/identifier-case-sensitivity.html)
- Sequelize: [Model Basics - Table Name](https://sequelize.org/docs/v6/core-concepts/model-basics/#table-name-inference)
- Super Admin Credentials: See `CREDENTIALS.md`
