# PSR-v4 Scripts Directory

This directory contains essential utility and deployment scripts for the PSR-v4 application.

## 📁 Current Scripts

### Windows PowerShell Scripts

#### `setup-remote-db.ps1`
**Purpose**: Initial database setup from Windows to VPS MySQL  
**Usage**: 
```powershell
.\scripts\setup-remote-db.ps1
```
**What it does**:
- Connects to VPS MySQL (168.231.121.19:3306)
- Creates `psr_v4_main` database
- Creates initial tables (Users, AdminSchemas, AuditLogs, OTPs)
- Generates `.env.production` file with VPS credentials
- Seeds super admin user

**When to use**: First-time database setup on VPS from Windows development machine

---

#### `reset-database.ps1`
**Purpose**: Drop and recreate the database for a clean slate  
**Usage**:
```powershell
.\scripts\reset-database.ps1
```
**What it does**:
- Drops `psr_v4_main` database (WARNING: DELETES ALL DATA)
- Recreates empty database with UTF8MB4 charset
- Does NOT run migrations (run `npx sequelize-cli db:migrate` after)

**When to use**: 
- Development: When you need to completely reset the database
- NEVER use on production without backup

---

### Linux Bash Scripts (VPS Deployment)

#### `vps-setup-mysql.sh`
**Purpose**: Install and configure MySQL 8.0 on Ubuntu VPS  
**Usage**:
```bash
bash scripts/vps-setup-mysql.sh
```
**What it does**:
- Installs MySQL 8.0 server on Ubuntu
- Configures MySQL for production use
- Creates `psr_admin` user with remote access
- Sets up firewall rules (UFW) for MySQL port
- Enables MySQL service to start on boot

**When to use**: First-time VPS setup before installing the application

---

#### `vps-database-setup.sh`
**Purpose**: Database setup and migration runner on VPS  
**Usage**:
```bash
cd /var/www/psr-v4
bash scripts/vps-database-setup.sh
```
**What it does**:
- Creates `psr_v4_main` database on VPS
- Runs all Sequelize migrations
- Creates all tables (Users, AdminSchemas, AuditLogs, OTPs, MachineType)
- Optionally runs seeders to create super admin

**When to use**: 
- After uploading application to VPS
- After pulling new migrations from git
- When setting up production database

---

#### `initial-vps-setup.sh`
**Purpose**: Complete VPS environment setup for first-time deployment  
**Usage**:
```bash
scp scripts/initial-vps-setup.sh root@168.231.121.19:/root/
ssh root@168.231.121.19
bash /root/initial-vps-setup.sh
```
**What it does**:
- Updates system packages
- Installs Node.js 21.x
- Installs PM2 (process manager)
- Installs Git and Nginx
- Configures Nginx reverse proxy
- Sets up PM2 auto-startup
- Creates application directory structure

**When to use**: 
- First-time VPS deployment
- Setting up a fresh Ubuntu server
- Before running GitHub Actions deployment

---

### Node.js Utility Scripts

#### `list-admin-schemas.mjs`
**Purpose**: List all admin-specific database schemas  
**Usage**:
```bash
node scripts/list-admin-schemas.mjs
```
**What it does**:
- Connects to database
- Lists all schemas matching pattern `{adminname}_{dbkey}`
- Shows schema size and table count
- Useful for debugging and monitoring

**When to use**: 
- Check how many admin databases exist
- Debug admin schema creation issues
- Monitor database growth

---

## 🗑️ Removed Scripts (Outdated)

The following scripts were removed as they are no longer needed:

### Debugging Scripts (One-time use)
- `accurate-farmer-check.js` - Specific farmer count debugging
- `debug-farmer-api.js` - Farmer API debugging
- `check-farmers-structure.js` - Table structure verification
- `check-adminschemas.mjs` - Admin schema checking
- `check-database.mjs` - Database connection testing
- `check-machine-status-enum.mjs` - ENUM validation

### Migration Helper Scripts (Incorporated into migrations)
- `add-corrections-to-existing-schemas.mjs`
- `add-machine-corrections-table.mjs`
- `add-machine-suspended-status.mjs`
- `apply-machine-corrections-migration.mjs`
- `create-machine-corrections-for-schema.mjs`
- `update-all-admin-schemas.mjs`
- `update-all-status-enums.mjs`
- `fix-all-machine-enums.mjs`

### One-time SQL Fixes (Applied and no longer needed)
- `cleanup-failed-approval.sql` - Cleaned up failed admin approval
- `rename-tables.sql` - Renamed tables to lowercase
- `update-status-enum.sql` - Added 'pending' to status ENUM
- `create-machinetype-table.sql` - Now in migration file
- `fix-farmers-columns.sql` - Now in admin schema generation

### Old Setup Scripts (Replaced)
- `setup-database-local.ps1` - Replaced by `setup-remote-db.ps1`
- `setup-db-local-simple.ps1` - Empty/unused file
- `list-schemas.mjs` - Replaced by `list-admin-schemas.mjs`
- `migrate.mjs` - Now use `npx sequelize-cli` directly

---

## 📋 Common Workflows

### Fresh VPS Deployment
```bash
# 1. Install MySQL on VPS
bash scripts/vps-setup-mysql.sh

# 2. Upload application files
scp -r ./* root@168.231.121.19:/var/www/psr-v4/

# 3. Setup database and run migrations
cd /var/www/psr-v4
bash scripts/vps-database-setup.sh
```

### Development Database Reset
```powershell
# 1. Reset database
.\scripts\reset-database.ps1

# 2. Run migrations
npx sequelize-cli db:migrate

# 3. Seed super admin
npx sequelize-cli db:seed:all
```

### Remote Database Setup from Windows
```powershell
# One command to setup everything
.\scripts\setup-remote-db.ps1
```

---

## ⚠️ Important Notes

1. **Database Credentials**: 
   - VPS: `psr_admin` / `PsrAdmin@20252!`
   - Database: `psr_v4_main`
   - Host: `168.231.121.19:3306`

2. **Backup Before Reset**:
   Always backup production database before running `reset-database.ps1`

3. **Environment Files**:
   - `.env.local` - Development (VPS connection)
   - `.env.production` - Production (generated by setup-remote-db.ps1)

4. **Migration Order**:
   Migrations must be run in order. Use `npx sequelize-cli db:migrate` to ensure proper sequence.

---

Last Updated: November 7, 2025
