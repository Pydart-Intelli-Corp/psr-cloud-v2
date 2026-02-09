# Database Structure Documentation

## Overview

PSR Cloud V2 uses a **hybrid database approach**:
1. **Main Database** (`psr_v4_main`) - Stores users, machines, admin schemas, audit logs
2. **Admin-Specific Schemas** (dynamic) - Each admin gets their own database for isolation

## Directory Structure

```
database/
├── migrations/          # Sequelize migrations (currently empty)
│   └── .gitkeep        # Keeps folder in git
└── seeders/            # Database seeds
    ├── 20241022000001-super-admin-user.js    # Super admin seeder
    └── 20241027000001-seed-machine-types.js  # Machine types seeder
```

## Database Initialization

### Method 1: Using Init Script (Recommended)

```bash
# Creates all tables and runs seeders
node scripts/init-database.js
```

**Creates:**
- ✅ `users` - All users (super_admin, admin, dairy, bmc, society, farmer)
- ✅ `admin_schemas` - Tracks admin-specific databases
- ✅ `audit_logs` - Activity logs
- ✅ `machines` - Machine registry
- ✅ `machinetype` - Machine type definitions
- ✅ `sequelize_meta` - Migration tracking

**Seeds:**
- ✅ Super admin user (admin@poornasreeequipments.com / psr@2025)
- ✅ 33 machine types (ECOD, LSE-V3, LSES-V3, etc.)

### Method 2: Using Sequelize Migrations

```bash
# Run migrations (if migration files exist)
npx sequelize-cli db:migrate --env production

# Run seeders
npx sequelize-cli db:seed:all --env production
```

### Method 3: Auto-Sync (Development Only)

The application uses Sequelize `sync()` in development mode to auto-create tables from models.

## Configuration

Database configuration is in [`config/database.js`](../config/database.js):

```javascript
module.exports = {
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    // ...
  }
};
```

**Environment Variables Required:**
- `DB_HOST` - MySQL host (localhost or IP)
- `DB_PORT` - MySQL port (default: 3306)
- `DB_USER` - Database user (psr_admin)
- `DB_PASSWORD` - Database password
- `DB_NAME` - Main database name (psr_v4_main)

## Multi-Tenant Architecture

### Main Database (`psr_v4_main`)

Stores global data:
- All user accounts (all roles)
- Machine registry
- Admin schema mappings
- Audit logs

### Admin Schemas (Dynamic)

Each admin gets a dedicated database:
- Format: `{adminname}_{dbkey}` (e.g., `poornasree_db_abc123`)
- Stores: farmers, societies, BMCs, dairies, collections, dispatches, sales, rate charts
- Complete data isolation between admins
- Automatically created on admin registration

### Schema Creation

```typescript
// Automatic during admin registration
const dbKey = createAdminSchema('admin@example.com');
// Creates database: db_adm123

// Connection to admin schema
const adminDB = getAdminConnection('db_adm123');
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  fullName VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin', 'dairy', 'bmc', 'society', 'farmer'),
  status ENUM('pending', 'active', 'suspended'),
  dbKey VARCHAR(50),  -- Links admin to their schema
  companyName VARCHAR(255),
  companyAddress TEXT,
  companyPincode VARCHAR(10),
  companyCity VARCHAR(100),
  companyState VARCHAR(100),
  parentId INT,  -- Hierarchical relationships
  isEmailVerified BOOLEAN,
  -- ... auth fields ...
  createdAt DATETIME,
  updatedAt DATETIME
);
```

**Indexes:**
- `email`, `uid` (unique lookups)
- `role`, `dbKey`, `parentId`, `status` (filtering)

### Admin Schemas Table

```sql
CREATE TABLE admin_schemas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  adminId INT NOT NULL,
  dbKey VARCHAR(50) UNIQUE NOT NULL,
  schemaName VARCHAR(100) NOT NULL,
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (adminId) REFERENCES users(id)
);
```

### Machines Table

```sql
CREATE TABLE machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machineId VARCHAR(50) UNIQUE NOT NULL,
  adminId INT NOT NULL,
  machineName VARCHAR(255),
  machineType VARCHAR(100),
  location VARCHAR(255),
  status ENUM('active', 'inactive', 'maintenance'),
  lastSeen DATETIME,
  imageUrl VARCHAR(500),
  isMaster BOOLEAN DEFAULT false,
  bmcId INT,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (adminId) REFERENCES users(id)
);
```

### Machine Types Table

```sql
CREATE TABLE machinetype (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_type VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME,
  updated_at DATETIME
);
```

**Pre-seeded Types:**
- ECOD, LSE-V3, LSES-V3, ECOSV, ECOV, ECO-SVPWTBQ
- LSE-SVPWTBQ, ECOD-G, ECOD-W, LSE-VPWTBQ
- And 23 more...

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entityId VARCHAR(100),
  changes JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## Verification Commands

### Check Database Connection

```bash
mysql -u psr_admin -p psr_v4_main
```

### Show All Tables

```bash
mysql -u psr_admin -p psr_v4_main -e "SHOW TABLES;"
```

### Count Records

```bash
mysql -u psr_admin -p psr_v4_main -e "
  SELECT 'users' as table_name, COUNT(*) as count FROM users
  UNION ALL
  SELECT 'machines', COUNT(*) FROM machines
  UNION ALL
  SELECT 'machinetype', COUNT(*) FROM machinetype
  UNION ALL
  SELECT 'admin_schemas', COUNT(*) FROM admin_schemas;
"
```

### Check Super Admin

```bash
mysql -u psr_admin -p psr_v4_main -e "
  SELECT uid, email, fullName, role, status FROM users WHERE role = 'super_admin';
"
```

## Backup & Restore

### Backup Main Database

```bash
mysqldump -u psr_admin -p psr_v4_main > backup-main-$(date +%Y%m%d).sql
```

### Backup All Databases (Including Admin Schemas)

```bash
mysqldump -u psr_admin -p --all-databases > backup-all-$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u psr_admin -p psr_v4_main < backup-main-20260209.sql
```

## Troubleshooting

### Tables Not Created

```bash
# Re-run initialization
node scripts/init-database.js
```

### Can't Connect to Database

```bash
# Check MySQL is running
systemctl status mysql

# Test connection
mysql -u psr_admin -p

# Check user permissions
mysql -u root -p -e "SHOW GRANTS FOR 'psr_admin'@'localhost';"
```

### Super Admin Not Found

```bash
# Re-seed super admin
npx sequelize-cli db:seed --seed 20241022000001-super-admin-user.js --env production
```

### Admin Schema Creation Fails

```bash
# Check user has CREATE DATABASE privilege
mysql -u root -p -e "GRANT ALL PRIVILEGES ON *.* TO 'psr_admin'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

## Database Maintenance

### Optimize Tables

```bash
mysql -u psr_admin -p psr_v4_main -e "OPTIMIZE TABLE users, machines, admin_schemas, audit_logs;"
```

### Check Table Status

```bash
mysql -u psr_admin -p psr_v4_main -e "SHOW TABLE STATUS;"
```

### Analyze Query Performance

```bash
mysql -u psr_admin -p psr_v4_main -e "EXPLAIN SELECT * FROM users WHERE email = 'admin@example.com';"
```

## References

- [Sequelize Documentation](https://sequelize.org/)
- [MySQL 8.0 Reference](https://dev.mysql.com/doc/refman/8.0/en/)
- [Multi-Tenant Architecture Guide](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)
