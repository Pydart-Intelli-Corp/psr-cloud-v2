# VPS Database Setup - Quick Guide

## 📋 Prerequisites

Make sure you've completed:
- ✅ MySQL installed
- ✅ MySQL user `psr_admin` created
- ✅ Node.js installed

---

## 🚀 Option 1: Automated Setup (Recommended)

### From your VPS server:

```bash
# Navigate to application directory
cd /var/www/psr-v4

# Upload the setup script (if not already uploaded)
# From your local Windows machine:
# scp d:\psr-v4\scripts\vps-database-setup.sh root@168.231.121.19:/var/www/psr-v4/scripts/

# Make script executable
chmod +x scripts/vps-database-setup.sh

# Run the setup script
bash scripts/vps-database-setup.sh
```

**The script will:**
1. Create the database `psr_v4_main`
2. Create all main tables (users, admin_schemas, audit_logs, otps)
3. Generate `.env.production` with secure JWT secrets
4. Run Sequelize migrations
5. Verify the setup

---

## 🔧 Option 2: Manual Setup

### Step 1: Create .env.production

```bash
cd /var/www/psr-v4
nano .env.production
```

**Paste this configuration:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@20252!
DB_NAME=psr_v4_main
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://168.231.121.19:3000

# JWT Secrets (generate your own!)
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Settings
SUPER_ADMIN_EMAIL=admin@psrcloud.com
COMPANY_NAME=Poornasree Equipments
FRONTEND_URL=http://168.231.121.19
```

**Generate secure JWT secrets:**
```bash
openssl rand -base64 32  # Copy for JWT_SECRET
openssl rand -base64 32  # Copy for JWT_REFRESH_SECRET
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 2: Install Dependencies

```bash
cd /var/www/psr-v4
npm install
```

### Step 3: Run Migrations

```bash
# This will create all tables using your migration files
npx sequelize-cli db:migrate --env production

# Check migration status
npx sequelize-cli db:migrate:status --env production
```

### Step 4: Verify Tables Created

```bash
mysql -u psr_admin -p'PsrAdmin@20252!' psr_v4_main -e "SHOW TABLES;"
```

**Expected tables:**
- users
- admin_schemas
- audit_logs
- otps
- sequelize_meta (migration tracking)

---

## 📊 Verify Database Setup

### Check All Tables:
```bash
mysql -u psr_admin -p'PsrAdmin@20252!' psr_v4_main <<EOF
SHOW TABLES;
DESCRIBE users;
DESCRIBE admin_schemas;
SELECT COUNT(*) as user_count FROM users;
EOF
```

### Test Database Connection:
```bash
cd /var/www/psr-v4
node -e "
const config = require('./config/database.js');
console.log('Production DB Config:', {
  host: config.production.host,
  database: config.production.database,
  user: config.production.username
});
"
```

---

## 🔄 Run Migrations (Detailed)

### View Available Migrations:
```bash
ls -la database/migrations/
```

### Run All Migrations:
```bash
npx sequelize-cli db:migrate --env production
```

### Check Migration Status:
```bash
npx sequelize-cli db:migrate:status --env production
```

### Rollback Last Migration (if needed):
```bash
npx sequelize-cli db:migrate:undo --env production
```

### Rollback All Migrations:
```bash
npx sequelize-cli db:migrate:undo:all --env production
```

---

## 🌱 Seed Database (Optional)

### Run Seeders:
```bash
# Seed super admin user
npx sequelize-cli db:seed:all --env production

# Or run specific seeder
npx sequelize-cli db:seed --seed 20241022000001-super-admin-user.js --env production
```

---

## 📝 Database Credentials

**Production Database:**
- Host: `localhost`
- Port: `3306`
- Database: `psr_v4_main`
- User: `psr_admin`
- Password: `PsrAdmin@20252!`

**Remote Access:**
- Host: `168.231.121.19`
- Port: `3306`
- User: `psr_admin`
- Password: `PsrAdmin@20252!`

---

## ✅ Verification Checklist

- [ ] .env.production file created
- [ ] Database `psr_v4_main` created
- [ ] All tables created (users, admin_schemas, audit_logs, otps)
- [ ] Migrations completed successfully
- [ ] JWT secrets generated
- [ ] Database connection tested

---

## 🐛 Troubleshooting

### Migration Error: "Table already exists"
```bash
# Check which migrations have run
npx sequelize-cli db:migrate:status --env production

# If needed, mark migrations as executed manually
mysql -u psr_admin -p psr_v4_main
INSERT INTO sequelize_meta (name) VALUES ('20241022000001-create-users.js');
```

### Database Connection Error
```bash
# Test MySQL connection
mysql -u psr_admin -p'PsrAdmin@20252!' psr_v4_main

# Check .env.production file
cat .env.production | grep DB_

# Verify database.js config
cat config/database.js
```

### SSL Certificate Error
```bash
# For local MySQL, disable SSL in .env.production
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false
```

---

## 🚀 Next Steps

After database setup:

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save

# Check logs
pm2 logs psr-v4
```

---

**Setup Guide Version**: 1.0  
**Date**: November 7, 2025  
**For**: PSR-v4 VPS Production Deployment
