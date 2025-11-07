# Deployment Troubleshooting Guide

## Common Deployment Issues

### 1. Database Migration Fails with "Access Denied"

**Error Message:**
```
ERROR: Access denied for user ''@'localhost' (using password: NO)
```

**Cause:**
The `.env.production` file was overwritten during `git reset --hard`, losing database credentials.

**Solution:**
This has been fixed in the latest deployment workflow. The workflow now:
1. Backs up `.env.production` before pulling code
2. Restores it after `git reset --hard`

**Manual Fix (if needed):**
```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Navigate to app directory
cd /var/www/psr-v4

# Recreate .env.production
cat > .env.production << 'EOF'
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

# JWT Secrets (generate new ones)
JWT_SECRET=$(openssl rand -hex 64)
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@poornasreeequipments.com

# Application URLs
NEXT_PUBLIC_API_URL=http://YOUR_VPS_IP
NEXT_PUBLIC_APP_URL=http://YOUR_VPS_IP
EOF

# Run migrations
npx sequelize-cli db:migrate --env production

# Restart app
pm2 restart psr-v4
```

---

### 2. Git Authentication Fails

**Error Message:**
```
fatal: could not read Username for 'https://github.com': No such device or address
```

**Cause:**
VPS trying to pull from GitHub without credentials.

**Solution:**
The workflow now automatically configures Git authentication using GitHub tokens.

**Verification:**
1. Check that deployment workflow passes `GITHUB_TOKEN` environment variable
2. The token is used in the Git remote URL: `https://x-access-token:TOKEN@github.com/REPO.git`

**If Still Failing:**
Create a Personal Access Token (PAT) and add it as `GH_PAT` secret.
See: [`docs/GITHUB_TOKEN_SETUP.md`](./GITHUB_TOKEN_SETUP.md)

---

### 3. Directory Not Found Error

**Error Message:**
```
❌ ERROR: VPS has not been set up yet!
The directory /var/www/psr-v4 does not exist.
```

**Cause:**
The initial VPS setup workflow has not been run yet.

**Solution:**
1. Go to: `https://github.com/YOUR_ORG/YOUR_REPO/actions`
2. Select "Setup VPS Environment" workflow
3. Click "Run workflow"
4. Wait ~10 minutes for completion
5. Deployment will work automatically after setup

---

### 4. Git Clone Fails - "Not Empty Directory"

**Error Message:**
```
fatal: destination path '.' already exists and is not an empty directory.
```

**Cause:**
Directory exists with files but no `.git` folder.

**Solution:**
The workflow now:
1. Checks if `.git` exists
2. Initializes git repository if missing
3. Adds remote and fetches code

**Manual Fix (if needed):**
```bash
cd /var/www/psr-v4
rm -rf .git
git init
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
git fetch origin
git reset --hard origin/master
```

---

### 5. Build Fails - TypeScript Not Found

**Error Message:**
```
⚠ Installing TypeScript as it was not found while loading "next.config.ts"
```

**Cause:**
Using `npm ci --production` which skips devDependencies, but Next.js build needs TypeScript.

**Solution:**
The workflow handles this automatically - Next.js installs TypeScript when needed.

**What Happens:**
1. `npm ci --production` installs production dependencies
2. Next.js detects missing TypeScript
3. Automatically installs it as devDependency
4. Build proceeds normally

This is expected behavior and not an error.

---

### 6. PM2 Process Not Found

**Error Message:**
```
[PM2] Process psr-v4 not found
```

**Cause:**
First deployment - PM2 process doesn't exist yet.

**Solution:**
The workflow handles this with fallback:
```bash
pm2 restart psr-v4 || pm2 start npm --name "psr-v4" -- start
```

**What This Does:**
- **First**: Tries to restart existing process
- **Fallback**: Starts new process if not found

---

### 7. Nginx Reload Fails

**Error Message:**
```
nginx: [error] ...
```

**Cause:**
Nginx configuration syntax error or Nginx not installed.

**Solution:**
The workflow includes error handling:
```bash
nginx -t && systemctl reload nginx || echo "Nginx reload skipped"
```

**Manual Check:**
```bash
# Test Nginx configuration
nginx -t

# Check Nginx status
systemctl status nginx

# View Nginx error log
tail -f /var/log/nginx/error.log
```

---

### 8. Port 3000 Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:**
Old process still running on port 3000.

**Solution:**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or restart PM2
pm2 restart psr-v4
```

---

### 9. Database Connection Fails

**Error Message:**
```
SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:3306
```

**Cause:**
MySQL not running or wrong credentials.

**Solutions:**

**Check MySQL Status:**
```bash
systemctl status mysql
```

**Start MySQL:**
```bash
systemctl start mysql
```

**Verify Database Exists:**
```bash
mysql -u psr_admin -p
# Password: PsrAdmin@20252!

SHOW DATABASES;
USE psr_v4_main;
SHOW TABLES;
```

**Check .env.production:**
```bash
cd /var/www/psr-v4
cat .env.production | grep DB_
```

---

### 10. SSL Certificate Failed

**Error Message:**
```
Certbot failed to authenticate...
```

**Cause:**
- Domain not pointing to VPS IP
- Port 80 blocked
- DNS not propagated

**Solutions:**

**Verify DNS:**
```bash
nslookup yourdomain.com
# Should return your VPS IP
```

**Check Port 80:**
```bash
nc -zv YOUR_VPS_IP 80
```

**Try Manual Certificate:**
```bash
certbot --nginx -d yourdomain.com
```

**Or Run Without SSL:**
- Leave domain blank when running setup
- Access via HTTP: `http://YOUR_VPS_IP`

---

## Environment File Management

### Why .env.production is Critical

The `.env.production` file contains:
- Database credentials
- JWT secrets (randomly generated during setup)
- Email configuration
- API URLs

**IMPORTANT:**
- ✅ Created once during initial VPS setup
- ✅ Never committed to Git (in `.gitignore`)
- ✅ Automatically backed up during deployment
- ✅ Restored after pulling code
- ❌ Never manually delete
- ❌ Never commit to repository

### Backup .env.production

**Automatic (Handled by Workflow):**
```bash
# Before git pull
cp .env.production /tmp/.env.production.backup

# After git pull
cp /tmp/.env.production.backup .env.production
```

**Manual Backup:**
```bash
cd /var/www/psr-v4
cp .env.production ~/.env.production.backup
# or
cp .env.production /root/.env.production.backup
```

### Verify .env.production

```bash
cd /var/www/psr-v4

# Check if file exists
ls -la .env.production

# View contents (be careful - contains secrets!)
cat .env.production

# Check specific variables
grep DB_ .env.production
grep JWT_ .env.production
grep EMAIL_ .env.production
```

---

## Deployment Workflow Steps

### Normal Deployment Flow

1. **Push to Master** → Triggers deployment
2. **Verify Secrets** → Checks GitHub Secrets configured
3. **Checkout Code** → Gets latest code
4. **Build Locally** → npm install + npm build
5. **Deploy to VPS:**
   - Check directory exists
   - Navigate to app directory
   - **Backup .env.production** 💾
   - Initialize Git if needed
   - Pull latest code
   - **Restore .env.production** ♻️
   - Install dependencies
   - Build application
   - Run migrations
   - Reload Nginx
   - Restart PM2
   - Save PM2 config
6. **Success!** ✅

### First-Time Setup Flow

1. **Add GitHub Secrets** (5 required)
2. **Run "Setup VPS Environment"** workflow
3. **Workflow Installs:**
   - Node.js 21.x
   - PM2
   - Nginx
   - UFW firewall
4. **Creates .env.production** with secrets
5. **Builds and starts app**
6. **Future pushes auto-deploy**

---

## Verification Commands

### Check Application Status

```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs psr-v4

# Application URL
curl http://localhost:3000
```

### Check Web Server

```bash
# Nginx status
systemctl status nginx

# Nginx configuration test
nginx -t

# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log
```

### Check Database

```bash
# MySQL status
systemctl status mysql

# Connect to database
mysql -u psr_admin -p psr_v4_main

# Check migrations
mysql -u psr_admin -p -e "USE psr_v4_main; SHOW TABLES;"
```

### Check Firewall

```bash
# UFW status
ufw status verbose

# Check open ports
netstat -tulpn | grep LISTEN
```

### Check Environment

```bash
# Verify .env.production exists
ls -la /var/www/psr-v4/.env.production

# Check database variables
cd /var/www/psr-v4
grep DB_ .env.production
```

---

## Quick Fixes

### Restart Everything

```bash
# Restart application
pm2 restart psr-v4

# Restart Nginx
systemctl restart nginx

# Restart MySQL
systemctl restart mysql
```

### View All Logs

```bash
# Application logs
pm2 logs psr-v4

# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log

# MySQL error log
tail -f /var/log/mysql/error.log
```

### Clean Rebuild

```bash
cd /var/www/psr-v4

# Clean build artifacts
rm -rf .next
rm -rf node_modules

# Reinstall and rebuild
npm ci
npm run build

# Restart
pm2 restart psr-v4
```

---

## Getting Help

### Check Workflow Logs

1. Go to GitHub repository
2. Click "Actions" tab
3. Click latest deployment run
4. Expand failed step
5. Read error message

### Enable Debug Mode

In `.github/workflows/deploy-vps.yml`:
```yaml
env:
  DEBUG: true  # Add this line
```

### Contact Support

Include this information:
1. Error message (full text)
2. Workflow run URL
3. VPS IP address
4. What you were trying to do
5. Steps to reproduce

---

## Related Documentation

- [Quick Start Guide](../QUICKSTART.md)
- [GitHub Token Setup](./GITHUB_TOKEN_SETUP.md)
- [VPS Auto Setup](./VPS_AUTO_SETUP.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
