# PSR Cloud V2 - Complete Server Setup Guide

## 📋 Prerequisites

- Fresh Ubuntu 20.04 or 22.04 VPS
- Root access to the server
- GitHub repository access
- Email credentials (Gmail recommended)

## 🚀 Quick Deployment

### Step 1: Upload Deployment Script

From your **local machine** (Windows PowerShell):

```powershell
# Navigate to project directory
cd P:\psr-cloud-v2

# Upload deployment script to server
scp deploy\deploy.sh root@168.231.121.19:/root/
```

### Step 2: Connect to Server

```powershell
ssh root@168.231.121.19
```

### Step 3: Run Deployment Script

```bash
# Make script executable
chmod +x /root/deploy.sh

# Run deployment
bash /root/deploy.sh
```

The script will automatically:
- ✅ Update system packages
- ✅ Install Node.js 20.x
- ✅ Install MySQL Server
- ✅ Install PM2 & Nginx
- ✅ Clone repository
- ✅ Install dependencies
- ✅ Create .env file
- ✅ Setup database
- ✅ Build application
- ✅ Configure Nginx
- ✅ Start with PM2
- ✅ Setup firewall

⏱️ **Total time: ~10-15 minutes**

### Step 4: Configure Environment

After deployment, edit the configuration:

```bash
nano /var/www/psr-v4/.env
```

**Update these values:**

```env
# Email Configuration
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# JWT Secrets (generate random strings)
JWT_SECRET=your-random-secret-key-here
JWT_REFRESH_SECRET=your-random-refresh-key-here

# Application URL (update with your domain)
NEXT_PUBLIC_APP_URL=http://your-domain.com
CLIENT_URL=http://your-domain.com
```

Save (Ctrl+X, Y, Enter)

### Step 5: Restart Application

```bash
pm2 restart all
```

### Step 6: Verify Installation

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs psr-v4 --lines 50

# Check if app is responding
curl http://localhost:3000

# Check from browser
# Open: http://168.231.121.19
```

## 🔄 Updating Existing Installation

From your **local machine**:

```powershell
# Upload update script
scp deploy\update.sh root@168.231.121.19:/var/www/psr-v4/

# Run update
ssh root@168.231.121.19 "cd /var/www/psr-v4 && chmod +x update.sh && bash update.sh"
```

## 💾 Database Backup

```bash
# Manual backup
cd /var/www/psr-v4
npm run db:backup

# Or use backup script
bash /var/www/psr-v4/deploy/backup.sh
```

## 📊 Useful Commands

### PM2 Commands

```bash
pm2 list              # List all processes
pm2 logs psr-v4       # View logs
pm2 restart psr-v4    # Restart app
pm2 stop psr-v4       # Stop app
pm2 monit             # Monitor resources
pm2 flush             # Clear logs
```

### Nginx Commands

```bash
systemctl status nginx    # Check status
systemctl restart nginx   # Restart
nginx -t                  # Test configuration
tail -f /var/log/nginx/error.log  # View errors
```

### MySQL Commands

```bash
mysql -u psr_admin -p psr_v4_main  # Connect to DB
mysqladmin -u psr_admin -p status  # Check status
mysqldump -u psr_admin -p psr_v4_main > backup.sql  # Backup
```

### System Commands

```bash
htop                  # Monitor resources
df -h                 # Disk space
free -h               # Memory usage
netstat -tulpn        # Active ports
ufw status            # Firewall status
```

## 🐛 Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs psr-v4 --lines 100

# Check if port is in use
netstat -tulpn | grep :3000

# Restart everything
pm2 restart all
systemctl restart nginx
```

### Database connection issues

```bash
# Test MySQL connection
mysql -u psr_admin -p

# Check MySQL status
systemctl status mysql

# Restart MySQL
systemctl restart mysql
```

### Build fails

```bash
cd /var/www/psr-v4

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port 3000 already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port in .env
echo "PORT=3001" >> .env
pm2 restart all
```

## 🔒 SSL Certificate Setup (Optional)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

## 📱 Default Credentials

**Super Admin:**
- Username: `admin`
- Password: `psr@2025`

**Change after first login!**

## 🌐 Access Points

- **Web Interface**: http://168.231.121.19
- **API**: http://168.231.121.19/api
- **Health Check**: http://168.231.121.19/status

## 📞 Support

For issues:
1. Check PM2 logs: `pm2 logs psr-v4`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Check system logs: `journalctl -xe`

---

**Last Updated**: February 2026
**Version**: 2.1.0
