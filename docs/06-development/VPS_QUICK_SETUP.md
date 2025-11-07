# PSR-v4 VPS Quick Setup Commands

## 🚀 Quick Start Guide

### Step 1: Connect to VPS

```bash
# From your local Windows machine
ssh -i /C/Users/tishn/.ssh/id_ed25519 root@168.231.121.19
```

---

### Step 2: Initial Server Setup (First Time Only)

```bash
# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git build-essential net-tools vim nano ufw

# Configure firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable

# Set timezone (adjust as needed)
timedatectl set-timezone Asia/Kolkata
```

---

### Step 3: Install MySQL

**Option A: Automated Setup (Recommended)**

```bash
# Download and run the setup script
cd /root
wget https://raw.githubusercontent.com/your-repo/psr-v4/master/scripts/vps-setup-mysql.sh
chmod +x vps-setup-mysql.sh
bash vps-setup-mysql.sh

# Follow the prompts to:
# 1. Set MySQL root password
# 2. Set PSR database user password
# 3. Automatically create database and tables
```

**Option B: Manual Setup**

```bash
# Install MySQL
apt install -y mysql-server

# Start MySQL
systemctl start mysql
systemctl enable mysql

# Secure installation
mysql_secure_installation
# Follow prompts:
# - Set root password
# - Remove anonymous users: Y
# - Disallow root login remotely: Y
# - Remove test database: Y
# - Reload privilege tables: Y

# Create database and user
mysql -u root -p
```

```sql
-- In MySQL console
CREATE DATABASE psr_v4_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'psr_admin'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON psr_v4_main.* TO 'psr_admin'@'localhost';
GRANT CREATE ON *.* TO 'psr_admin'@'localhost';
GRANT ALL PRIVILEGES ON `%`.* TO 'psr_admin'@'localhost';
FLUSH PRIVILEGES;

-- Create main tables
USE psr_v4_main;

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

CREATE TABLE otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);

-- Verify tables
SHOW TABLES;
EXIT;
```

---

### Step 4: Install Node.js 20.x

```bash
# Install Node.js from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

---

### Step 5: Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Enable PM2 startup script
pm2 startup systemd
# Run the command it outputs

# Save PM2 configuration
pm2 save
```

---

### Step 6: Deploy Application

**Option A: Clone from GitHub**

```bash
# Navigate to web directory
mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git psr-v4
cd psr-v4
```

**Option B: Upload via SCP (from your Windows machine)**

```bash
# From local Windows PowerShell
scp -i /C/Users/tishn/.ssh/id_ed25519 -r d:/psr-v4/* root@168.231.121.19:/var/www/psr-v4/
```

---

### Step 7: Configure Environment

```bash
cd /var/www/psr-v4

# Create production environment file
nano .env.production
```

**Paste this configuration:**

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=YourStrongPassword123!
DB_NAME=psr_v4_main
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://168.231.121.19:3000

# JWT Secrets (generate your own!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-abc123xyz
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long-xyz789abc

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Application Settings
SUPER_ADMIN_EMAIL=admin@psrcloud.com
COMPANY_NAME=Poornasree Equipments
FRONTEND_URL=http://168.231.121.19
```

**Generate secure JWT secrets:**

```bash
# Generate random JWT secrets
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for JWT_REFRESH_SECRET
```

---

### Step 8: Install Dependencies and Build

```bash
cd /var/www/psr-v4

# Install dependencies
npm ci --production

# Or install all (including dev dependencies for build)
npm install

# Build Next.js application
npm run build
```

---

### Step 9: Run Migrations

```bash
# Run database migrations
npx sequelize-cli db:migrate --env production

# Or use custom migration script
npm run migrate
```

---

### Step 10: Start Application with PM2

```bash
cd /var/www/psr-v4

# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Paste this configuration:**

```javascript
module.exports = {
  apps: [{
    name: 'psr-v4',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/psr-v4',
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
    time: true,
    autorestart: true
  }]
};
```

**Start the application:**

```bash
# Create logs directory
mkdir -p /var/www/psr-v4/logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs psr-v4
```

---

### Step 11: Install and Configure Nginx

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/psr-v4
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name 168.231.121.19;

    client_max_body_size 50M;

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

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }

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

**Enable site and start Nginx:**

```bash
# Enable site
ln -s /etc/nginx/sites-available/psr-v4 /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Reload Nginx
systemctl reload nginx
```

---

## ✅ Verification

### Check All Services

```bash
# MySQL status
systemctl status mysql

# PM2 status
pm2 status

# Nginx status
systemctl status nginx

# View application logs
pm2 logs psr-v4

# Test database connection
mysql -u psr_admin -p psr_v4_main -e "SHOW TABLES;"
```

### Access Application

Open in browser:
- **IP Access**: http://168.231.121.19
- **With Port**: http://168.231.121.19:3000 (direct to Next.js)

---

## 🔧 Common Management Commands

### PM2 Commands

```bash
# List all processes
pm2 list

# Restart application
pm2 restart psr-v4

# Stop application
pm2 stop psr-v4

# View logs (real-time)
pm2 logs psr-v4

# Monitor resources
pm2 monit

# View process details
pm2 show psr-v4

# Reload without downtime
pm2 reload psr-v4

# Delete process
pm2 delete psr-v4
```

### MySQL Commands

```bash
# Connect to database
mysql -u psr_admin -p psr_v4_main

# Backup database
mysqldump -u psr_admin -p psr_v4_main > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u psr_admin -p psr_v4_main < backup_20250106.sql

# Show databases
mysql -u psr_admin -p -e "SHOW DATABASES;"

# Show tables
mysql -u psr_admin -p psr_v4_main -e "SHOW TABLES;"
```

### Nginx Commands

```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log
```

---

## 🔒 Security Best Practices

### Create Non-Root User

```bash
# Create user
adduser psr-admin
usermod -aG sudo psr-admin

# Copy SSH keys
mkdir -p /home/psr-admin/.ssh
cp ~/.ssh/authorized_keys /home/psr-admin/.ssh/
chown -R psr-admin:psr-admin /home/psr-admin/.ssh
chmod 700 /home/psr-admin/.ssh
chmod 600 /home/psr-admin/.ssh/authorized_keys

# Test login from new terminal
ssh -i /C/Users/tishn/.ssh/id_ed25519 psr-admin@168.231.121.19
```

### Change MySQL Passwords

```bash
# Change root password
mysql -u root -p
```

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewStrongPassword123!';
FLUSH PRIVILEGES;
```

### Enable Fail2Ban (Optional)

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 📊 Monitoring Setup

### Database Backup Cron

```bash
# Create backup script
nano /root/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/root/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u psr_admin -p'YourPassword' psr_v4_main > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /root/backup-db.sh >> /root/backup.log 2>&1
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Find process
lsof -i :3000
# or
netstat -tulpn | grep 3000

# Kill process
kill -9 <PID>
```

### Application Won't Start

```bash
# Check logs
pm2 logs psr-v4 --lines 100

# Check Node.js version
node --version

# Rebuild application
cd /var/www/psr-v4
rm -rf .next
npm run build
pm2 restart psr-v4
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u psr_admin -p psr_v4_main

# Check MySQL service
systemctl status mysql

# Restart MySQL
systemctl restart mysql

# Check MySQL logs
tail -f /var/log/mysql/error.log
```

### Nginx Issues

```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

---

## 📝 Quick Reference

| Service | Status Command | Restart Command | Logs |
|---------|---------------|----------------|------|
| MySQL | `systemctl status mysql` | `systemctl restart mysql` | `tail -f /var/log/mysql/error.log` |
| PM2 | `pm2 status` | `pm2 restart psr-v4` | `pm2 logs psr-v4` |
| Nginx | `systemctl status nginx` | `systemctl restart nginx` | `tail -f /var/log/nginx/error.log` |

---

**Setup Guide Version**: 1.0  
**Last Updated**: November 6, 2025  
**For**: PSR-v4 VPS Deployment
