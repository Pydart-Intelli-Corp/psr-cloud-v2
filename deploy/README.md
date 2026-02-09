# PSR Cloud V2 - Deployment Scripts

Complete automated deployment solution for PSR Cloud V2 on Ubuntu VPS.

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `deploy.sh` | Main deployment script (run on server) |
| `setup-server.sh` | Server infrastructure setup only (MySQL, Node.js, etc) |
| `setup-github-ssh.sh` | GitHub SSH key configuration (interactive) |
| `update.sh` | Update existing installation (run on server) |
| `backup.sh` | Database backup script (run on server) |
| `deploy-from-windows.ps1` | Windows PowerShell deployment (run locally) |
| `quick-commands.ps1` | Quick management commands (run locally) |
| `DEPLOYMENT_GUIDE.md` | Complete deployment documentation |
| `MANUAL_SETUP_GUIDE.md` | Step-by-step manual setup guide |
| `GITHUB_SSH_SETUP.md` | GitHub SSH configuration guide |

## 🚀 Quick Start (Recommended)

### Option 1: Automated Deployment from Windows

**One command deployment:**

```powershell
cd P:\psr-cloud-v2\deploy
.\deploy-from-windows.ps1
```

This will:
1. Test SSH connection
2. Upload deployment script
3. Run full deployment
4. Show results

⏱️ **Time: ~15 minutes**

### Option 2: Setup GitHub SSH First (Recommended)

For easier Git operations, setup SSH access to GitHub:

```powershell
# Upload and run SSH setup script
scp P:\psr-cloud-v2\deploy\setup-github-ssh.sh root@168.231.121.19:/root/
ssh root@168.231.121.19 "chmod +x /root/setup-github-ssh.sh && bash /root/setup-github-ssh.sh"
```

Follow the interactive prompts. See [GITHUB_SSH_SETUP.md](GITHUB_SSH_SETUP.md) for details.

### Option 3: Manual Deployment

**Step 1:** Upload script

```powershell
scp P:\psr-cloud-v2\deploy\deploy.sh root@168.231.121.19:/root/
```

**Step 2:** Connect and run

```powershell
ssh root@168.231.121.19
chmod +x /root/deploy.sh
bash /root/deploy.sh
```

## 🔄 Updating Application

### Quick Update (from Windows)

```powershell
cd P:\psr-cloud-v2\deploy
. .\quick-commands.ps1
Deploy-Update
```

### Manual Update

```powershell
scp P:\psr-cloud-v2\deploy\update.sh root@168.231.121.19:/var/www/psr-v4/
ssh root@168.231.121.19 "cd /var/www/psr-v4 && bash update.sh"
```

## 🛠️ Quick Commands

Load quick commands in PowerShell:

```powershell
cd P:\psr-cloud-v2\deploy
. .\quick-commands.ps1
```

Then use:

```powershell
Deploy-Full           # Full deployment
Deploy-Update         # Update existing
Show-Logs             # View application logs
Show-Status           # Check PM2 & Nginx status
Restart-App           # Restart application
Backup-Database       # Create database backup
Connect-Server        # SSH to server
Edit-Config           # Edit .env file
```

## 📋 What Gets Installed

The deployment script installs:

- ✅ Node.js 20.x
- ✅ MySQL Server 8.0
- ✅ PM2 Process Manager
- ✅ Nginx Web Server
- ✅ UFW Firewall
- ✅ Build tools & Git
- ✅ Application dependencies
- ✅ Database migrations
- ✅ Application build

## ⚙️ Post-Deployment Configuration

### 1. Update Environment Variables

```bash
ssh root@168.231.121.19
nano /var/www/psr-v4/.env
```

**Required changes:**

```env
# Update email credentials
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Generate new JWT secrets
JWT_SECRET=your-random-secret-here
JWT_REFRESH_SECRET=your-random-refresh-secret-here

# Update application URLs (if using domain)
NEXT_PUBLIC_APP_URL=http://yourdomain.com
CLIENT_URL=http://yourdomain.com
```

### 2. Restart Application

```bash
pm2 restart all
```

### 3. Test Application

Open in browser: `http://168.231.121.19`

**Default login:**
- Username: `admin`
- Password: `psr@2025`

## 💾 Database Backup

### Automatic Backup

```powershell
cd P:\psr-cloud-v2\deploy
. .\quick-commands.ps1
Backup-Database
```

### Manual Backup

```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
npm run db:backup
```

Backups are stored in `/root/backups/`

## 🐛 Troubleshooting

### Check Logs

```powershell
. .\quick-commands.ps1
Show-Logs
```

Or manually:

```bash
ssh root@168.231.121.19 "pm2 logs psr-v4 --lines 100"
```

### Check Status

```powershell
. .\quick-commands.ps1
Show-Status
```

### Restart Everything

```bash
ssh root@168.231.121.19
pm2 restart all
systemctl restart nginx
systemctl restart mysql
```

### View Error Logs

```bash
# PM2 logs
pm2 logs psr-v4 --err

# Nginx logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -xe
```

## 🔒 Security Notes

### Change Default Passwords

1. **Super Admin Password**
   - Login with `admin` / `psr@2025`
   - Go to Settings → Change Password

2. **MySQL Password**
   ```bash
   mysql -u root
   ALTER USER 'psr_admin'@'localhost' IDENTIFIED BY 'NewPassword123!';
   FLUSH PRIVILEGES;
   ```
   
   Update `.env` file with new password

3. **JWT Secrets**
   - Generate random strings
   - Update in `.env`
   - Restart application

### Enable SSL (Optional)

```bash
ssh root@168.231.121.19
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

## 📊 Monitoring

### Real-time Monitoring

```bash
pm2 monit
```

### Resource Usage

```bash
htop              # CPU & Memory
df -h             # Disk space
free -h           # Memory details
netstat -tulpn    # Network ports
```

### Application Metrics

```bash
pm2 status        # Process status
pm2 info psr-v4   # Detailed info
pm2 describe psr-v4  # Full details
```

## 🔄 Rollback

If deployment fails:

```bash
ssh root@168.231.121.19

# Find backup directory
ls -la /root/ | grep psr-v4-backup

# Restore
cd /var/www
rm -rf psr-v4
mv /root/psr-v4-backup-TIMESTAMP psr-v4
cd psr-v4
pm2 restart all
```

## 📞 Support

For issues:
1. Check deployment logs
2. Check PM2 logs: `pm2 logs psr-v4`
3. Check Nginx logs: `tail -f /var/log/nginx/error.log`
4. Review `DEPLOYMENT_GUIDE.md` for detailed troubleshooting

## 🎯 Common Tasks

### Pull Latest from GitHub

```bash
cd /var/www/psr-v4
git pull origin main
npm install
npm run build
pm2 restart all
```

### Reset Database

```bash
cd /var/www/psr-v4
npm run db:backup  # Backup first!
npm run db:reset   # Reset everything
```

### View Database

```bash
mysql -u psr_admin -p psr_v4_main
SHOW TABLES;
```

### Change Port

Edit `.env`:
```env
PORT=3001
```

Update Nginx config:
```bash
nano /etc/nginx/sites-available/psr-v4
# Change proxy_pass to http://localhost:3001
systemctl restart nginx
pm2 restart all
```

---

## 🔑 GitHub SSH Access

### Quick Setup

```powershell
# From Windows
scp P:\psr-cloud-v2\deploy\setup-github-ssh.sh root@168.231.121.19:/root/
ssh root@168.231.121.19 "bash /root/setup-github-ssh.sh"
```

### Manual Setup

On server:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@gmail.com"

# Display public key
cat ~/.ssh/id_ed25519.pub
```

Copy the output and add to GitHub:
- Go to: https://github.com/settings/keys
- Click "New SSH key"
- Paste key and save

Test connection:

```bash
ssh -T git@github.com
```

See [GITHUB_SSH_SETUP.md](GITHUB_SSH_SETUP.md) for detailed instructions.

---

**Version**: 2.1.0  
**Last Updated**: February 2026
