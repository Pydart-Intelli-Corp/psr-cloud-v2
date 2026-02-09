#!/bin/bash

###############################################################################
# PSR Cloud V2 - Update/Redeploy Script
# Use this to update an existing installation
###############################################################################

set -e

echo "=============================================="
echo "  PSR Cloud V2 - Update Script"
echo "=============================================="

APP_DIR="/var/www/psr-v4"

if [ ! -d "$APP_DIR" ]; then
    echo "Error: Application not found at $APP_DIR"
    echo "Please run deploy.sh first"
    exit 1
fi

cd "$APP_DIR"

echo "[1/8] Stopping application..."
pm2 stop all

echo "[2/8] Backing up .env file..."
cp .env .env.backup

echo "[3/8] Pulling latest changes from GitHub..."
git pull origin main || git pull origin master

echo "[4/8] Installing dependencies..."
npm ci --production=false

echo "[5/8] Running database migrations..."
npx sequelize-cli db:migrate --env production

echo "[6/8] Building application..."
npm run build

echo "[7/8] Restarting application..."
pm2 restart all
pm2 save

echo "[8/8] Checking status..."
pm2 status

echo ""
echo "✅ Update completed successfully!"
echo "View logs: pm2 logs psr-v4"
