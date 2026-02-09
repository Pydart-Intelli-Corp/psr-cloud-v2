#!/bin/bash

# Fix Machine Type Image URLs
# Updates application to use full domain URLs for images

set -e

APP_DIR="/var/www/psr-v4"
EXPECTED_URL="https://v4.poornasreecloud.com"

echo "=========================================="
echo "Fix Machine Type Image URLs"
echo "=========================================="
echo ""

# Check if we're in the right directory
cd $APP_DIR

# Pull latest changes
echo "Step 1: Pulling latest changes from GitHub..."
git pull origin master
echo "✅ Code updated"
echo ""

# Check .env configuration
echo "Step 2: Checking environment configuration..."
if grep -q "NEXT_PUBLIC_APP_URL=$EXPECTED_URL" .env; then
    echo "✅ NEXT_PUBLIC_APP_URL is correctly set to $EXPECTED_URL"
elif grep -q "NEXT_PUBLIC_APP_URL=" .env; then
    CURRENT_URL=$(grep "NEXT_PUBLIC_APP_URL=" .env | cut -d'=' -f2)
    echo "⚠️  WARNING: NEXT_PUBLIC_APP_URL is set to: $CURRENT_URL"
    echo "   Expected: $EXPECTED_URL"
    read -p "Update to $EXPECTED_URL? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$EXPECTED_URL|g" .env
        echo "✅ Updated NEXT_PUBLIC_APP_URL to $EXPECTED_URL"
    fi
else
    echo "⚠️  NEXT_PUBLIC_APP_URL not found in .env, adding it..."
    echo "" >> .env
    echo "# Application URL for image uploads and links" >> .env
    echo "NEXT_PUBLIC_APP_URL=$EXPECTED_URL" >> .env
    echo "✅ Added NEXT_PUBLIC_APP_URL=$EXPECTED_URL"
fi
echo ""

# Install any new dependencies
echo "Step 3: Installing dependencies..."
npm ci --production=false
echo "✅ Dependencies installed"
echo ""

# Fix existing image URLs in database
echo "Step 4: Fixing existing image URLs in database..."
node scripts/fix-image-urls.js
echo ""

# Rebuild application
echo "Step 5: Rebuilding application..."
npm run build
echo "✅ Application rebuilt"
echo ""

# Restart PM2
echo "Step 6: Restarting application..."
pm2 restart psr-v4
pm2 save
echo "✅ Application restarted"
echo ""

# Test the application
echo "Step 7: Testing application..."
sleep 3
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Application is responding"
else
    echo "⚠️  WARNING: Application may not be responding correctly"
    echo "Check logs with: pm2 logs psr-v4"
fi
echo ""

echo "=========================================="
echo "✅ Image URL Fix Complete!"
echo "=========================================="
echo ""
echo "What was fixed:"
echo "  • Upload API now uses full domain URLs"
echo "  • Existing images updated in database"
echo "  • Application rebuilt with new configuration"
echo ""
echo "Next steps:"
echo "  1. Login to Super Admin panel"
echo "  2. Go to Machine Management"
echo "  3. Upload a new machine type image"
echo "  4. Verify image displays correctly"
echo ""
echo "Application URL: $EXPECTED_URL"
echo "Check status: pm2 status"
echo "View logs: pm2 logs psr-v4"
echo ""
