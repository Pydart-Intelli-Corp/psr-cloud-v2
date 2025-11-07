# VPS Deployment Guide - PSR-v4

**Server**: 168.231.121.19  
**OS**: Ubuntu/Debian (assumed)  
**User**: root  
**Date**: November 6, 2025  
**Status**: Initial Setup

---

## 📋 Table of Contents

1. [Server Access](#server-access)
2. [Initial Server Setup](#initial-server-setup)
3. [MySQL Installation & Configuration](#mysql-installation--configuration)
4. [Node.js & PM2 Setup](#nodejs--pm2-setup)
5. [Application Deployment](#application-deployment)
6. [Nginx Reverse Proxy](#nginx-reverse-proxy)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Environment Configuration](#environment-configuration)
9. [Database Migration](#database-migration)
10. [Troubleshooting](#troubleshooting)

---

## 🔐 Server Access

### SSH Connection

```bash
# Connect to VPS
ssh -i ~/.ssh/id_ed25519 root@168.231.121.19

# Or from Windows
ssh -i /C/Users/tishn/.ssh/id_ed25519 root@168.231.121.19
```

### First-Time Security Setup

```bash
# Update system
apt update && apt upgrade -y

# Create non-root user (recommended)
adduser psr-admin
usermod -aG sudo psr-admin

# Copy SSH key to new user
mkdir -p /home/psr-admin/.ssh
cp ~/.ssh/authorized_keys /home/psr-admin/.ssh/
chown -R psr-admin:psr-admin /home/psr-admin/.ssh
chmod 700 /home/psr-admin/.ssh
chmod 600 /home/psr-admin/.ssh/authorized_keys

# Configure firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp  # Next.js dev port (temporary)
ufw enable
```

---

## 🛠️ Initial Server Setup

### Install Essential Packages

```bash
# Install required packages
apt install -y curl wget git build-essential software-properties-common

# Install net-tools (for netstat, ifconfig)
apt install -y net-tools

# Install vim or nano (editor)
apt install -y vim nano

# Set timezone
timedatectl set-timezone Asia/Kolkata  # Adjust to your timezone
```

---

## 🗄️ MySQL Installation & Configuration

### 1. Install MySQL 8.0

```bash
# Install MySQL server
apt install -y mysql-server

# Check MySQL status
systemctl status mysql

# Enable MySQL to start on boot
systemctl enable mysql
```

### 2. Secure MySQL Installation

```bash
# Run security script
mysql_secure_installation

# Follow prompts:
# - Set root password: Choose a strong password
# - Remove anonymous users: Y
# - Disallow root login remotely: Y (we'll create specific user)
# - Remove test database: Y
# - Reload privilege tables: Y
```

### 3. Configure MySQL for Remote Access (Optional)

```bash
# Edit MySQL config
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find and modify:
# bind-address = 127.0.0.1
# Change to:
# bind-address = 0.0.0.0  # Or your specific IP

# Restart MySQL
systemctl restart mysql
```

### 4. Create PSR-v4 Database and User

```bash
# Login to MySQL
mysql -u root -p

# In MySQL console:
```

```sql
-- Create main database
CREATE DATABASE psr_v4_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database user
CREATE USER 'psr_admin'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON psr_v4_main.* TO 'psr_admin'@'localhost';

-- Grant permissions to create schemas (for multi-tenant architecture)
GRANT CREATE ON *.* TO 'psr_admin'@'localhost';
GRANT ALL PRIVILEGES ON `%`.* TO 'psr_admin'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Create main tables
USE psr_v4_main;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'dairy', 'bmc', 'society', 'farmer') NOT NULL,
  db_key VARCHAR(20),
  company_name VARCHAR(255),
  company_pincode VARCHAR(10),
  company_city VARCHAR(100),
  company_state VARCHAR(100),
  status ENUM('active', 'inactive', 'pending_approval', 'rejected') DEFAULT 'pending_approval',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_uid (uid),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Admin schemas table
CREATE TABLE admin_schemas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  db_key VARCHAR(20) UNIQUE NOT NULL,
  schema_name VARCHAR(100) UNIQUE NOT NULL,
  company_name VARCHAR(255),
  company_pincode VARCHAR(10),
  company_city VARCHAR(100),
  company_state VARCHAR(100),
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_db_key (db_key),
  INDEX idx_admin_id (admin_id)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- OTP table
CREATE TABLE otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);

-- Create super admin user (default credentials)
INSERT INTO users (uid, full_name, email, password, role, status) 
VALUES (
  'PSR_SUPERADMIN_001', 
  'Super Admin', 
  'admin@psrcloud.com',
  -- Password: admin123 (bcrypt hash)
  '$2a$10$YourBcryptHashHere',
  'superadmin',
  'active'
);

-- Exit MySQL
EXIT;
```

### 5. Test Database Connection

```bash
# Test connection
mysql -u psr_admin -p -e "SHOW DATABASES;"

# Should see psr_v4_main database
```

---

## 🟢 Node.js & PM2 Setup

### 1. Install Node.js 20.x (LTS)

```bash
# Install Node.js from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2. Install PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Verify PM2
pm2 --version

# Enable PM2 startup script
pm2 startup systemd
# Run the command it outputs

# Save PM2 configuration
pm2 save
```

---

## 🚀 Application Deployment

### 1. Clone Repository

```bash
# Navigate to application directory
cd /var/www

# Clone your repository
git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git psr-v4
cd psr-v4

# Or if using SSH key
git clone git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git psr-v4
```

### 2. Upload Files via SCP (Alternative)

```bash
# From your local machine (Windows)
scp -i /C/Users/tishn/.ssh/id_ed25519 -r d:/psr-v4/* root@168.231.121.19:/var/www/psr-v4/

# Or use WinSCP for GUI-based upload
```

### 3. Install Dependencies

```bash
cd /var/www/psr-v4

# Install production dependencies
npm ci --production

# Or install all dependencies (including dev)
npm install
```

### 4. Create Environment File

```bash
# Create .env.production
nano .env.production
```

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=YourStrongPassword123!
DB_NAME=psr_v4_main

# SSL Configuration (optional for local MySQL)
DB_SSL_CA=/path/to/ca-cert.pem
DB_REJECT_UNAUTHORIZED=false

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://168.231.121.19:3000

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-minimum-32-characters

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Application Settings
SUPER_ADMIN_EMAIL=admin@psrcloud.com
COMPANY_NAME=Poornasree Equipments
FRONTEND_URL=http://168.231.121.19
```

### 5. Build Application

```bash
# Build Next.js application
npm run build

# This creates optimized production build in .next directory
```

### 6. Run Database Migrations

```bash
# Run Sequelize migrations
npx sequelize-cli db:migrate --env production

# Or use custom migration script
npm run migrate
```

---

## 🔄 PM2 Process Management

### 1. Start Application with PM2

```bash
# Start Next.js application
pm2 start npm --name "psr-v4" -- start

# Or use ecosystem file (recommended)
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'psr-v4',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Start using ecosystem file
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### 2. PM2 Management Commands

```bash
# List all processes
pm2 list

# Monitor processes
pm2 monit

# View logs
pm2 logs psr-v4

# Restart application
pm2 restart psr-v4

# Stop application
pm2 stop psr-v4

# Delete process
pm2 delete psr-v4

# View process details
pm2 show psr-v4
```

---

## 🌐 Nginx Reverse Proxy

### 1. Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

### 2. Configure Nginx for PSR-v4

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/psr-v4
```

```nginx
server {
    listen 80;
    server_name 168.231.121.19;  # Or your domain name

    # Client max body size (for file uploads)
    client_max_body_size 50M;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (if served by Nginx)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/psr-v4 /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 🔒 SSL Certificate Setup (Optional - with Domain)

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (requires domain name)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is set up automatically
# Test renewal
certbot renew --dry-run

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

---

## ⚙️ Environment Configuration

### 1. Update .env.production for Domain

```env
# If using domain
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Database (same as before)
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=YourStrongPassword123!
DB_NAME=psr_v4_main
```

### 2. Restart Application

```bash
# Restart PM2 process to load new environment
pm2 restart psr-v4

# Or reload without downtime
pm2 reload psr-v4
```

---

## 🗃️ Database Migration

### 1. Run Migrations

```bash
cd /var/www/psr-v4

# Run all pending migrations
npx sequelize-cli db:migrate --env production

# Check migration status
npx sequelize-cli db:migrate:status --env production

# Rollback last migration (if needed)
npx sequelize-cli db:migrate:undo --env production
```

### 2. Create Super Admin User

```bash
# Access MySQL
mysql -u psr_admin -p psr_v4_main

# Create super admin with hashed password
```

```sql
-- Generate bcrypt hash for password "psr@2025"
-- Use online bcrypt generator or Node.js script

-- Insert super admin
INSERT INTO users (uid, full_name, email, password, role, status) 
VALUES (
  'PSR_SA_001', 
  'Super Admin', 
  'admin@psrcloud.com',
  '$2a$10$YourGeneratedBcryptHashHere',
  'superadmin',
  'active'
);

-- Verify
SELECT id, uid, full_name, email, role, status FROM users;
```

---

## 🔍 Troubleshooting

### Check Application Logs

```bash
# PM2 logs
pm2 logs psr-v4

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

### Common Issues

**1. Port 3000 already in use**
```bash
# Find process using port 3000
lsof -i :3000
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
```

**2. MySQL connection refused**
```bash
# Check MySQL status
systemctl status mysql

# Restart MySQL
systemctl restart mysql

# Check MySQL port
netstat -tulpn | grep 3306
```

**3. Next.js build errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**4. Permission issues**
```bash
# Fix ownership
chown -R www-data:www-data /var/www/psr-v4

# Fix permissions
chmod -R 755 /var/www/psr-v4
```

---

## 📊 Monitoring & Maintenance

### 1. Set up Log Rotation

```bash
# Create logrotate config
nano /etc/logrotate.d/psr-v4
```

```
/var/www/psr-v4/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### 2. Database Backups

```bash
# Create backup script
nano /root/backup-mysql.sh
```

```bash
#!/bin/bash
# MySQL Backup Script

BACKUP_DIR="/root/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup main database
mysqldump -u psr_admin -p'YourStrongPassword123!' psr_v4_main > $BACKUP_DIR/psr_v4_main_$DATE.sql

# Backup all admin schemas
mysql -u psr_admin -p'YourStrongPassword123!' -e "SHOW DATABASES LIKE '%_%'" | grep -v Database | while read dbname; do
    mysqldump -u psr_admin -p'YourStrongPassword123!' $dbname > $BACKUP_DIR/${dbname}_$DATE.sql
done

# Compress backups
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*.sql
rm $BACKUP_DIR/*.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /root/backup-mysql.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /root/backup-mysql.sh >> /root/backup.log 2>&1
```

### 3. Monitoring Commands

```bash
# System resources
htop

# Disk usage
df -h

# Memory usage
free -h

# PM2 monitoring
pm2 monit

# Check open connections
netstat -an | grep ESTABLISHED | wc -l
```

---

## 🚀 Quick Start Commands

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519 root@168.231.121.19

# Check application status
pm2 status

# View logs
pm2 logs psr-v4

# Restart application
pm2 restart psr-v4

# Check database
mysql -u psr_admin -p psr_v4_main

# Check Nginx
systemctl status nginx

# Reload Nginx (after config changes)
nginx -t && systemctl reload nginx
```

---

## 📝 Next Steps

1. ✅ Set up MySQL database
2. ✅ Install Node.js and PM2
3. ✅ Deploy application
4. ✅ Configure Nginx reverse proxy
5. ⏳ Obtain domain name (optional)
6. ⏳ Set up SSL certificate (after domain)
7. ⏳ Configure automated backups
8. ⏳ Set up monitoring (optional: Grafana/Prometheus)

---

**Deployment Guide Version**: 1.0  
**Last Updated**: November 6, 2025  
**Maintained By**: PSR-v4 Development Team
