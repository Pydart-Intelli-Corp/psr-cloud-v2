# GitHub Actions Deployment Guide

## 🚀 Automated Deployment to VPS

This project uses GitHub Actions for automated deployment to your VPS server at **168.231.121.19**.

---

## 📋 Prerequisites

Before setting up automated deployment, ensure:

1. ✅ **VPS Server Ready**
   - Ubuntu 24.04.3 LTS
   - MySQL 8.0 installed and configured
   - Root access available

2. ✅ **GitHub Repository**
   - Code pushed to `master` branch
   - Repository: `Pydart-Intelli-Corp/psr-cloud-v2`

3. ✅ **Local Development**
   - All code tested and working locally
   - Database migrations tested

---

## 🔧 Initial VPS Setup (One-Time)

### Step 1: SSH into VPS

```bash
ssh root@168.231.121.19
# Password: ,8n1IlYWf?-hz@Ti9LtN
```

### Step 2: Run Initial Setup Script

```bash
# Upload setup script to VPS
scp scripts/initial-vps-setup.sh root@168.231.121.19:/root/

# SSH into VPS
ssh root@168.231.121.19

# Run setup script
bash /root/initial-vps-setup.sh
```

This script will:
- ✅ Update system packages
- ✅ Install Node.js 21.x
- ✅ Install PM2 (process manager)
- ✅ Install Git
- ✅ Install Nginx (reverse proxy)
- ✅ Configure Nginx for your app
- ✅ Setup PM2 to start on boot

### Step 3: Clone Repository

```bash
cd /var/www/psr-v4
git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git .
```

### Step 4: Create Environment File

```bash
cd /var/www/psr-v4
nano .env.production
```

Add the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@20252!
DB_NAME=psr_v4_main
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false

# Application
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1

# JWT Secrets (Generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@poornasreeequipments.com

# Application URLs
NEXT_PUBLIC_API_URL=http://168.231.121.19:3000
NEXT_PUBLIC_APP_URL=http://168.231.121.19
```

### Step 5: Install Dependencies and Build

```bash
cd /var/www/psr-v4
npm ci
npm run build
```

### Step 6: Run Database Migrations

```bash
npx sequelize-cli db:migrate --env production
npx sequelize-cli db:seed:all --env production
```

### Step 7: Start Application with PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 8: Verify Nginx

```bash
# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Check status
systemctl status nginx
```

---

## 🔐 Configure GitHub Secrets

### Navigate to GitHub Repository Settings

1. Go to your repository: `https://github.com/Pydart-Intelli-Corp/psr-cloud-v2`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Add the following secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VPS_HOST` | `168.231.121.19` | VPS IP address |
| `VPS_USERNAME` | `root` | SSH username |
| `VPS_PASSWORD` | `,8n1IlYWf?-hz@Ti9LtN` | SSH password |

---

## 🎯 How Deployment Works

### Automatic Deployment

Every time you push to the `master` branch, GitHub Actions will:

1. ✅ Checkout code
2. ✅ Setup Node.js 21.x
3. ✅ Install dependencies
4. ✅ Build the application
5. ✅ Connect to VPS via SSH
6. ✅ Pull latest changes from GitHub
7. ✅ Install production dependencies
8. ✅ Build application on VPS
9. ✅ Run database migrations
10. ✅ Restart application with PM2
11. ✅ Verify deployment status

### Manual Deployment

You can also trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to VPS** workflow
3. Click **Run workflow**
4. Select `master` branch
5. Click **Run workflow**

---

## 📊 Monitoring Deployment

### View Logs in GitHub

1. Go to **Actions** tab
2. Click on the latest workflow run
3. View logs for each step

### View Logs on VPS

```bash
# SSH into VPS
ssh root@168.231.121.19

# View PM2 logs
pm2 logs psr-v4

# View last 100 lines
pm2 logs psr-v4 --lines 100

# View error logs only
pm2 logs psr-v4 --err

# View application logs
tail -f /var/www/psr-v4/logs/out.log
tail -f /var/www/psr-v4/logs/err.log
```

### Check Application Status

```bash
# SSH into VPS
ssh root@168.231.121.19

# Check PM2 status
pm2 status

# Check Nginx status
systemctl status nginx

# Check if app is responding
curl http://localhost:3000
```

---

## 🔄 Post-Deployment Tasks

### After Each Deployment

1. **Verify Application**: Visit `http://168.231.121.19`
2. **Check Logs**: `pm2 logs psr-v4`
3. **Test Critical Features**:
   - User registration
   - Login
   - Admin approval workflow
   - Farmer management

### Database Migrations

Migrations run automatically during deployment. To run manually:

```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
npx sequelize-cli db:migrate --env production
```

---

## 🛠️ Common Issues & Solutions

### Issue: Deployment Fails at Build Step

**Solution:**
```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
rm -rf .next
npm run build
pm2 restart psr-v4
```

### Issue: Application Not Starting

**Solution:**
```bash
ssh root@168.231.121.19
pm2 delete psr-v4
pm2 start ecosystem.config.js --env production
pm2 save
```

### Issue: Database Connection Error

**Solution:**
```bash
# Check MySQL status
systemctl status mysql

# Verify database exists
mysql -u psr_admin -p'PsrAdmin@20252!' -e "SHOW DATABASES;"

# Check .env.production file
cat /var/www/psr-v4/.env.production
```

### Issue: Nginx Not Working

**Solution:**
```bash
# Test configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

---

## 🔒 Security Recommendations

### 1. Change Default Passwords

```bash
# Change root password
passwd

# Change MySQL password
mysql -u root -p
ALTER USER 'psr_admin'@'localhost' IDENTIFIED BY 'NewStrongPassword123!';
FLUSH PRIVILEGES;
```

### 2. Setup Firewall (UFW)

```bash
# Install UFW
apt-get install -y ufw

# Allow SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Allow MySQL only from localhost
ufw allow from 127.0.0.1 to any port 3306

# Enable firewall
ufw enable
```

### 3. Generate Strong JWT Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env.production with generated secrets
```

### 4. Setup SSL Certificate (Optional)

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get certificate (requires domain name)
# certbot --nginx -d yourdomain.com
```

---

## 📝 Manual Deployment Steps

If GitHub Actions fails, you can deploy manually:

```bash
# 1. SSH into VPS
ssh root@168.231.121.19

# 2. Navigate to app directory
cd /var/www/psr-v4

# 3. Pull latest changes
git pull origin master

# 4. Install dependencies
npm ci

# 5. Build application
npm run build

# 6. Run migrations
npx sequelize-cli db:migrate --env production

# 7. Restart application
pm2 restart psr-v4

# 8. Check status
pm2 status
pm2 logs psr-v4 --lines 50
```

---

## 📞 Support

For deployment issues:
1. Check GitHub Actions logs
2. Check VPS logs: `pm2 logs psr-v4`
3. Check Nginx logs: `/var/log/nginx/error.log`
4. Review this guide for common solutions

---

## 🎉 Success Checklist

After successful deployment:

- [ ] Application accessible at `http://168.231.121.19`
- [ ] Super admin can login (admin@poornasreeequipments.com)
- [ ] Database migrations completed
- [ ] PM2 shows application running
- [ ] Nginx reverse proxy working
- [ ] No errors in PM2 logs
- [ ] GitHub Actions deployment completed successfully

---

**Last Updated:** November 7, 2025  
**VPS IP:** 168.231.121.19  
**Application Port:** 3000  
**Nginx Port:** 80
