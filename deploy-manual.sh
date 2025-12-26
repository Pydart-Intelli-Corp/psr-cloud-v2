#!/bin/bash
set -e

echo "🚀 Manual Deployment Script"
echo "================================================"

# Configuration
DEPLOY_DIR="/var/www/psr-v4"
BACKUP_DIR="/var/www/psr-v4-backup"
FTP_SOURCE="/home/ftpuser/psr-cloud-v4/deploy.tar.gz"

# Free memory
echo "💾 Freeing memory..."
sync
echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
free -h | head -2

# Stop application
echo "🛑 Stopping application..."
pm2 stop psr-v4 2>/dev/null || true

# Backup current deployment
if [ -d "$DEPLOY_DIR" ]; then
  echo "💾 Backing up current deployment..."
  rm -rf $BACKUP_DIR
  mv $DEPLOY_DIR $BACKUP_DIR
fi

# Create deployment directory
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# Extract
echo "📦 Extracting deployment package..."
tar -xzf $FTP_SOURCE

# Install dependencies
echo "📦 Installing dependencies (this may take 5-10 minutes)..."
export NODE_OPTIONS="--max-old-space-size=512"
npm install --production --prefer-offline --no-audit --no-fund --loglevel=error

# Create environment file (update these values)
echo "⚙️ Creating environment file..."
cat > .env.production << 'EOF'
DB_HOST=168.231.121.19
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@20252!
DB_NAME=psr_v4_main
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
JWT_SECRET=eM7pYNcpO7vuX3ce85MAStpZHMgz9v5Wmq0GbPLcohOuWw9GC0dQghaxQ1MZFd3/LLtS+2XjlKHMPa3xOMOdNQ==
JWT_REFRESH_SECRET=zY3vqKlaDtgrdly5UguYiDw2R5h+OxuH4tPredZExLpHTpJgsSpYACDmBuSsZCLwLfcwBBtoEtsurvf0CT+WVg==
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=psr$20252
SUPER_ADMIN_EMAIL=rndpoornasree@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=online.poornasree@gmail.com
SMTP_PASSWORD=ktbc iqnm jozi jdaq
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=online.poornasree@gmail.com
EMAIL_PASSWORD=ktbc iqnm jozi jdaq
EMAIL_FROM=noreply@poornasreeequipments.com
NEXT_PUBLIC_API_URL=https://v4.poornasreecloud.com
NEXT_PUBLIC_APP_URL=https://v4.poornasreecloud.com
CLIENT_URL=https://v4.poornasreecloud.com
EOF

chmod 600 .env.production

# Start application
echo "🚀 Starting application..."
pm2 start ecosystem.config.js --env production
pm2 save

# Wait and check
echo "⏳ Waiting 20 seconds..."
sleep 20

# Health check
echo "🔍 Health check..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Application is responding!"
else
  echo "⚠️ App may still be starting, checking logs..."
  pm2 logs psr-v4 --lines 30 --nostream
fi

echo ""
pm2 status
echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETED!"
echo "🌍 https://v4.poornasreecloud.com"
echo "================================================"
