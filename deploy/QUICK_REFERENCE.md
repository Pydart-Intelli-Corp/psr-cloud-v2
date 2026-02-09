# PSR Cloud V2 - Quick Reference Card

## 🔗 Repository URLs

**SSH URL (recommended):**
```
git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git
```

**HTTPS URL (fallback):**
```
https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git
```

---

## 📡 Server Information

**IP Address:** 168.231.121.19  
**SSH Connection:** `ssh root@168.231.121.19`  
**Application Directory:** `/var/www/psr-v4`  
**Application URL:** http://168.231.121.19  

---

## 🔑 Default Credentials

**Super Admin:**
- Username: `admin`
- Password: `psr@2025`

**Database:**
- Database: `psr_v4_main`
- User: `psr_admin`
- Password: `PsrAdmin@2025!`

---

## 🚀 Quick Deployment Commands

### From Windows PowerShell:

```powershell
# Upload and run full deployment
cd P:\psr-cloud-v2
scp deploy\deploy.sh root@168.231.121.19:/root/
ssh root@168.231.121.19 "chmod +x /root/deploy.sh && bash /root/deploy.sh"
```

### Setup GitHub SSH:

```powershell
scp deploy\setup-github-ssh.sh root@168.231.121.19:/root/
ssh root@168.231.121.19 "bash /root/setup-github-ssh.sh"
```

---

## 📦 Clone Repository

### With SSH (password-free):
```bash
cd /var/www/psr-v4
git clone git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git .
```

### With HTTPS:
```bash
cd /var/www/psr-v4
git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git .
```

---

## 🔄 Update Application

```bash
cd /var/www/psr-v4
pm2 stop psr-v4
git pull origin main
npm ci --production=false
npx sequelize-cli db:migrate --env production
npm run build
pm2 restart psr-v4
```

---

## 📊 Common PM2 Commands

```bash
pm2 status                    # Check status
pm2 logs psr-v4               # View logs
pm2 restart psr-v4            # Restart app
pm2 stop psr-v4               # Stop app
pm2 monit                     # Monitor resources
```

---

## 🗄️ Database Commands

```bash
# Connect to database
mysql -u psr_admin -p psr_v4_main

# Show all databases
mysql -u psr_admin -p -e "SHOW DATABASES;"

# Backup database
cd /var/www/psr-v4
npm run db:backup
```

---

## 🌐 Nginx Commands

```bash
systemctl status nginx        # Check status
systemctl restart nginx       # Restart
nginx -t                      # Test config
tail -f /var/log/nginx/error.log    # Error logs
```

---

## 🔑 Generate JWT Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔒 GitHub SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "info.pydart@gmail.com"

# Display public key (copy this to GitHub)
cat ~/.ssh/id_ed25519.pub

# Test connection
ssh -T git@github.com
```

**Add to GitHub:** https://github.com/settings/keys

---

## 🐛 Troubleshooting

### Check if app is running:
```bash
curl http://localhost:3000
pm2 logs psr-v4 --lines 50
```

### Port 3000 in use:
```bash
lsof -i :3000
kill -9 $(lsof -t -i:3000)
```

### Rebuild application:
```bash
cd /var/www/psr-v4
rm -rf .next node_modules
npm install
npm run build
pm2 restart psr-v4
```

### Check Git remote:
```bash
cd /var/www/psr-v4
git remote -v
```

### Switch to SSH from HTTPS:
```bash
cd /var/www/psr-v4
git remote set-url origin git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git
```

---

## 📱 Email Configuration

**Gmail SMTP:**
- Host: `smtp.gmail.com`
- Port: `587`
- Secure: `false`
- App Password: Get from https://myaccount.google.com/apppasswords

---

## 🔄 System Monitoring

```bash
htop                          # CPU & Memory
df -h                         # Disk space
free -h                       # Memory
netstat -tulpn | grep 3000    # Check port
ufw status                    # Firewall
journalctl -xe                # System logs
```

---

## 📞 Quick Help

**Documentation Files:**
- `MANUAL_SETUP_GUIDE.md` - Complete setup guide
- `GITHUB_SSH_SETUP.md` - SSH configuration
- `README.md` - Overview and commands
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

**Scripts:**
- `deploy.sh` - Full deployment
- `setup-server.sh` - Infrastructure only
- `setup-github-ssh.sh` - GitHub SSH setup
- `update.sh` - Update existing installation
- `backup.sh` - Database backup

---

**Last Updated:** February 9, 2026  
**Version:** 2.1.0
