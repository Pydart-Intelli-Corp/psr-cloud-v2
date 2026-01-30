#!/bin/bash
# PSR Machine API Deployment Script

echo "PSR Machine API - Society: s1"
echo "==========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root or with sudo"
  exit 1
fi

# Set deployment directory
DEPLOY_DIR="/var/www/machineapi"

# Create directory if it doesn't exist
mkdir -p $DEPLOY_DIR

# Copy files
echo "Copying files to $DEPLOY_DIR..."
cp -r publish/* $DEPLOY_DIR/

# Set permissions
chown -R www-data:www-data $DEPLOY_DIR
chmod -R 755 $DEPLOY_DIR

echo ""
echo "Deployment complete!"
echo "Next steps:"
echo "1. Configure database connection in appsettings.Production.json"
echo "2. Set JWT secret"
echo "3. Set up systemd service (see DEPLOYMENT.md)"
echo "4. Start the API"
