# 🚀 Quick Deployment Reference

## GitHub Secrets Required

Add these in GitHub Repository → Settings → Secrets and variables → Actions:

```
VPS_HOST=168.231.121.19
VPS_USERNAME=root
VPS_PASSWORD=,8n1IlYWf?-hz@Ti9LtN
```

## Initial VPS Setup (One-Time)

```bash
# Upload and run setup script
scp scripts/initial-vps-setup.sh root@168.231.121.19:/root/
ssh root@168.231.121.19
bash /root/initial-vps-setup.sh

# Clone repository
cd /var/www/psr-v4
git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git .

# Create .env.production (see DEPLOYMENT.md)
nano .env.production

# Build and start
npm ci
npm run build
npx sequelize-cli db:migrate --env production
npx sequelize-cli db:seed:all --env production
pm2 start ecosystem.config.js --env production
pm2 save
```

## Deployment Workflow

### Automatic (Recommended)
```bash
# On your local machine
git add .
git commit -m "Your changes"
git push origin master
# GitHub Actions will automatically deploy!
```

### Manual Trigger
1. Go to GitHub → Actions tab
2. Click "Deploy to VPS"
3. Click "Run workflow" → Run workflow

### SSH Manual Deploy
```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
git pull origin master
npm ci
npm run build
npx sequelize-cli db:migrate --env production
pm2 restart psr-v4
```

## Quick Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs psr-v4

# Restart app
pm2 restart psr-v4

# Stop app
pm2 stop psr-v4

# Check Nginx
systemctl status nginx
nginx -t

# Check MySQL
systemctl status mysql
mysql -u psr_admin -p'PsrAdmin@20252!' psr_v4_main
```

## URLs

- **Application**: http://168.231.121.19
- **API**: http://168.231.121.19:3000/api
- **GitHub Repo**: https://github.com/Pydart-Intelli-Corp/psr-cloud-v2

## Default Credentials

- **Super Admin**: admin@poornasreeequipments.com / psr@2025
- **Database**: psr_admin / PsrAdmin@20252!
- **VPS SSH**: root / ,8n1IlYWf?-hz@Ti9LtN

## Troubleshooting

```bash
# App won't start
pm2 delete psr-v4
pm2 start ecosystem.config.js --env production
pm2 save

# Build failed
rm -rf .next node_modules
npm ci
npm run build

# Database issues
mysql -u psr_admin -p'PsrAdmin@20252!' psr_v4_main
SHOW TABLES;

# Nginx issues
nginx -t
systemctl restart nginx
tail -f /var/log/nginx/error.log
```

## Important Files

```
/var/www/psr-v4/                    # Application root
/var/www/psr-v4/.env.production     # Environment variables
/var/www/psr-v4/ecosystem.config.js # PM2 configuration
/var/www/psr-v4/logs/               # Application logs
/etc/nginx/sites-available/psr-v4   # Nginx config
```

---
📖 **Full Guide**: See `docs/DEPLOYMENT.md`
