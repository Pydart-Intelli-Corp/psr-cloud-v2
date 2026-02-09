# PSR Cloud V2 - Manual Server Setup Guide

Complete manual setup instructions for deploying PSR Cloud V2 on a fresh Ubuntu VPS.

---

## 📋 Prerequisites

- Fresh Ubuntu 20.04 or 22.04 VPS
- Root SSH access
- Minimum 2GB RAM, 20GB disk space
- IP: 168.231.121.19

---

## PART 1: SERVER INFRASTRUCTURE SETUP

### Option A: Automated Infrastructure Setup (Recommended)

```powershell
# From Windows PowerShell
cd P:\psr-cloud-v2

# Upload infrastructure script
scp deploy\setup-server.sh root@168.231.121.19:/root/

# Connect and run
ssh root@168.231.121.19
chmod +x /root/setup-server.sh
bash /root/setup-server.sh
```

⏱️ **Time: ~5 minutes**

### Option B: Manual Infrastructure Setup

Connect to your server:

```powershell
ssh root@168.231.121.19
```

Then follow these steps:

#### 1. Update System

```bash
apt update -y
apt upgrade -y
apt install -y curl wget git build-essential software-properties-common
```

#### 2. Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

#### 3. Install MySQL 8.0

```bash
apt install -y mysql-server

# Start and enable MySQL
systemctl start mysql
systemctl enable mysql

# Check status
systemctl status mysql
```

#### 4. Install PM2 Process Manager

```bash
npm install -g pm2

# Verify
pm2 --version
```

#### 5. Install Nginx Web Server

```bash
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

#### 6. Configure Firewall

```bash
ufw --force enable
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 3000/tcp   # Node.js

# Check status
ufw status
```

#### 7. Create Application Directory

```bash
mkdir -p /var/www/psr-v4
mkdir -p /var/www/psr-v4/logs
mkdir -p /root/backups
```

---

## PART 2: MYSQL DATABASE CONFIGURATION

### 1. Secure MySQL Installation (Recommended)

```bash
mysql_secure_installation
```

Follow prompts:
- Set root password: **Yes** (choose a strong password)
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### 2. Create Database and User

Connect to MySQL:

```bash
mysql -u root -p
```

Run these SQL commands:

```sql
-- Create main database
CREATE DATABASE psr_v4_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database user
CREATE USER 'psr_admin'@'localhost' IDENTIFIED BY 'PsrAdmin@2025!';

-- Grant privileges on main database
GRANT ALL PRIVILEGES ON psr_v4_main.* TO 'psr_admin'@'localhost';

-- Grant privileges to create admin schemas (databases with any name)
GRANT ALL PRIVILEGES ON `%`.* TO 'psr_admin'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user='psr_admin';

-- Exit
EXIT;
```

### 3. Test Database Connection

```bash
mysql -u psr_admin -p psr_v4_main
```

Enter password: `PsrAdmin@2025!`

If successful, you'll see MySQL prompt. Type `EXIT;` to exit.

### 4. Configure MySQL for Production (Optional)

Edit MySQL configuration:

```bash
nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add/modify these settings:

```ini
[mysqld]
# Connection settings
max_connections = 200
connect_timeout = 10
wait_timeout = 600

# Buffer settings
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# SQL mode
sql_mode = STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION
```

Restart MySQL:

```bash
systemctl restart mysql
```

---

## PART 3: GITHUB SSH SETUP (OPTIONAL)

### Why Setup SSH?

SSH keys allow secure, password-free access to GitHub for:
- Cloning private repositories
- Pushing code changes
- Pulling updates without entering credentials

### 1. Generate SSH Key on Server

Connect to your server:

```bash
ssh root@168.231.121.19
```

Generate SSH key:

```bash
# Generate SSH key (press Enter for all prompts)
ssh-keygen -t ed25519 -C "info.pydart@gmail.com"

# Or use RSA if ed25519 not supported
# ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

**Press Enter** for all prompts to accept defaults:
- File location: `/root/.ssh/id_ed25519`
- Passphrase: Leave empty (just press Enter twice)

### 2. Display Your SSH Public Key

```bash
# Display public key
cat ~/.ssh/id_ed25519.pub

# Or copy to clipboard (if you have xclip)
# apt install xclip -y
# cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
```

**Copy the entire output** - it will look like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGt... your-email@example.com
```

### 3. Add SSH Key to GitHub

1. Go to **GitHub.com** and login
2. Click your profile picture → **Settings**
3. Click **SSH and GPG keys** (left sidebar)
4. Click **New SSH key** button
5. Fill in:
   - **Title**: `PSR VPS Server - 168.231.121.19`
   - **Key**: Paste the public key you copied
6. Click **Add SSH key**
7. Confirm with your GitHub password

### 4. Test SSH Connection

On your server:

```bash
# Test GitHub connection
ssh -T git@github.com
```

**Expected output:**
```
Hi YourUsername! You've successfully authenticated, but GitHub does not provide shell access.
```

If you see this message, SSH is working! ✅

### 5. Configure Git

Set your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Verify configuration
git config --list
```

### 6. Clone Using SSH

Now you can clone using SSH URL:

```bash
cd /var/www/psr-v4

# Clone with SSH (password-free)
git clone git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git .

# Verify remote URL
git remote -v
# Should show: git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git
```

**Repository URLs:**
- SSH: `git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git`
- HTTPS: `https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git`

### Troubleshooting SSH

**Problem: Permission denied (publickey)**

```bash
# Check SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519

# Test again
ssh -T git@github.com
```

**Problem: Wrong SSH key**

```bash
# List SSH keys
ls -la ~/.ssh/

# Make sure id_ed25519.pub exists
# If not, generate again with ssh-keygen
```

**Problem: Repository not accessible**

- Verify you added the SSH key to the correct GitHub account
- Check if you have access to the repository
- Try cloning with HTTPS first to test access

---

## PART 4: APPLICATION DEPLOYMENT

### 1. Clone Repository

```bash
cd /var/www/psr-v4

# Option A: SSH (recommended if you configured SSH in Part 3)
git clone git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git .

# Option B: HTTPS (works without SSH setup, requires GitHub credentials)
# git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git .
```

**Choose SSH if:**
- ✅ You completed Part 3 (GitHub SSH Setup)
- ✅ `ssh -T git@github.com` works

**Choose HTTPS if:**
- ✅ You skipped SSH setup
- ✅ Quick one-time deployment
- ⚠️ You'll need to enter GitHub username and password (or personal access token)

### 2. Install Application Dependencies

```bash
cd /var/www/psr-v4
npm ci --production=false
```

⏱️ **Time: 2-3 minutes**

### 3. Configure Environment Variables

Create `.env` file:

```bash
nano /var/www/psr-v4/.env
```

Paste this configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@2025!
DB_NAME=psr_v4_main

# SSL Configuration (not needed for localhost)
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false

# Database Pool Configuration
DB_POOL_MAX=30
DB_POOL_MIN=2
DB_CONNECTION_TIMEOUT=30
DB_CONNECTION_LIFETIME=300
DB_COMMAND_TIMEOUT=60

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=change-this-to-random-string-32-chars-minimum-length
JWT_REFRESH_SECRET=change-this-to-another-random-string-32-chars-minimum

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_SECURE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_SECURE=false

# Super Admin Credentials
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=psr@2025

# Application URLs
NEXT_PUBLIC_APP_URL=http://168.231.121.19
CLIENT_URL=http://168.231.121.19

# Node Environment
NODE_ENV=production
PORT=3000
BUILDING=false
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Important:** Update these values:
- `JWT_SECRET` - Generate random 32+ character string
- `JWT_REFRESH_SECRET` - Generate another random string
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASSWORD` - Gmail app-specific password

### 4. Generate JWT Secrets

Generate secure random strings:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update `.env` with these values.

### 5. Setup Gmail App Password

1. Go to Google Account settings
2. Enable 2-factor authentication
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Create new app password for "Mail"
5. Copy the 16-character password
6. Update `EMAIL_PASSWORD` in `.env`

### 6. Build Application

```bash
cd /var/www/psr-v4
npm run build
```

⏱️ **Time: 3-5 minutes**

### 7. Initialize Database

```bash
cd /var/www/psr-v4

# Initialize database (creates tables and seeds data)
node scripts/init-database.js

# Verify tables created
mysql -u psr_admin -p psr_v4_main -e "SHOW TABLES;"
```

**Expected output:**
- ✅ 6 tables created (users, admin_schemas, audit_logs, machines, machinetype, sequelize_meta)
- ✅ Super admin user created
- ✅ 33 machine types seeded

---

## PART 5: NGINX CONFIGURATION

### 1. Create Nginx Site Configuration

```bash
nano /etc/nginx/sites-available/psr-v4
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name 168.231.121.19;

    # Increase upload size
    client_max_body_size 100M;

    # Proxy to Node.js application
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
        
        # Increase timeouts
        proxy_connect_timeout 75s;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
}
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 2. Enable Site and Remove Default

```bash
# Enable PSR site
ln -sf /etc/nginx/sites-available/psr-v4 /etc/nginx/sites-enabled/

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

---

## PART 6: START APPLICATION

### 1. Start with PM2

```bash
cd /var/www/psr-v4

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs
```

### 2. Verify Application is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs psr-v4 --lines 50

# Test locally
curl http://localhost:3000

# Check from external
curl http://168.231.121.19
```

---

## PART 7: VERIFY DEPLOYMENT

### 1. Open in Browser

Navigate to: **http://168.231.121.19**

You should see the PSR Cloud V2 login page.

### 2. Login as Super Admin

**Credentials:**
- Username: `admin`
- Password: `psr@2025`

### 3. Create Test Admin User

1. Click "Register"
2. Fill in details
3. Verify email (check email inbox)
4. Login as Super Admin
5. Go to Super Admin panel
6. Approve the new admin

---

## 🔧 USEFUL COMMANDS

### PM2 Commands

```bash
pm2 status              # Check status
pm2 logs psr-v4         # View logs
pm2 logs psr-v4 --err   # Error logs only
pm2 restart psr-v4      # Restart app
pm2 stop psr-v4         # Stop app
pm2 delete psr-v4       # Remove from PM2
pm2 monit               # Real-time monitoring
pm2 flush               # Clear logs
```

### Nginx Commands

```bash
systemctl status nginx      # Check status
systemctl restart nginx     # Restart
nginx -t                    # Test config
tail -f /var/log/nginx/access.log   # Access logs
tail -f /var/log/nginx/error.log    # Error logs
```

### MySQL Commands

```bash
# Connect to database
mysql -u psr_admin -p psr_v4_main

# Show all databases
mysql -u psr_admin -p -e "SHOW DATABASES;"

# Show tables in main database
mysql -u psr_admin -p psr_v4_main -e "SHOW TABLES;"

# Check MySQL status
systemctl status mysql

# Restart MySQL
systemctl restart mysql
```

### System Monitoring

```bash
htop                    # CPU & Memory
df -h                   # Disk space
free -h                 # Memory details
netstat -tulpn          # Active ports
ufw status              # Firewall status
journalctl -xe          # System logs
```

---

## 🐛 TROUBLESHOOTING

### Application Won't Start

```bash
# Check logs
pm2 logs psr-v4 --lines 100

# Check if port is in use
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Restart
pm2 restart psr-v4
```

### Database Connection Issues

```bash
# Test connection
mysql -u psr_admin -p psr_v4_main

# Check MySQL status
systemctl status mysql

# View MySQL logs
tail -f /var/log/mysql/error.log

# Restart MySQL
systemctl restart mysql
```

### Nginx Issues

```bash
# Test configuration
nginx -t

# View error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### Build Failures

```bash
cd /var/www/psr-v4

# Clear cache
rm -rf .next node_modules package-lock.json

# Reinstall
npm install

# Rebuild
npm run build
```

### Email Not Sending

1. Verify Gmail app password is correct
2. Check 2FA is enabled on Gmail
3. Test email credentials:

```bash
cd /var/www/psr-v4
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.verify((err, success) => {
  if (err) console.error('Error:', err);
  else console.log('Email config OK');
});
"
```

---

## 🔄 UPDATING APPLICATION

### Pull Latest Changes

```bash
cd /var/www/psr-v4

# Stop application
pm2 stop psr-v4

# Pull updates
git pull origin main

# Install new dependencies
npm ci --production=false

# Run migrations
npx sequelize-cli db:migrate --env production

# Rebuild
npm run build

# Restart
pm2 restart psr-v4
```

---

## 💾 BACKUP & RESTORE

### Create Backup

```bash
cd /var/www/psr-v4
npm run db:backup
```

Backups saved to: `/root/backups/`

### Manual Database Backup

```bash
# Backup main database
mysqldump -u psr_admin -p psr_v4_main > /root/backup-$(date +%Y%m%d).sql

# Backup all databases
mysqldump -u psr_admin -p --all-databases > /root/backup-all-$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u psr_admin -p psr_v4_main < /root/backup-20260209.sql
```

---

## 🔒 SECURITY CHECKLIST

- [ ] Changed Super Admin password
- [ ] Generated new JWT secrets
- [ ] Configured Gmail app password
- [ ] Enabled UFW firewall
- [ ] Secured MySQL (ran mysql_secure_installation)
- [ ] Regular backups scheduled
- [ ] SSL certificate installed (optional but recommended)

---

## 📞 QUICK REFERENCE

**Server IP:** 168.231.121.19  
**Application URL:** http://168.231.121.19  
**Super Admin:** admin / psr@2025  
**Database:** psr_v4_main  
**DB User:** psr_admin  
**App Directory:** /var/www/psr-v4  

---

**Setup Complete!** 🎉

Your PSR Cloud V2 application is now running in production mode.
