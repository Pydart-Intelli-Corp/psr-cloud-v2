#!/bin/bash

###############################################################################
# PSR-v4 Initial VPS Deployment Script
# Run this script on the VPS server for first-time setup
# 
# Usage: bash initial-vps-setup.sh
###############################################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PSR-v4 Initial VPS Deployment${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

# 1. Update system
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# 2. Install Node.js 21.x
echo -e "${YELLOW}Step 2: Installing Node.js 21.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_21.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js already installed${NC}"
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Install PM2
echo -e "${YELLOW}Step 3: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

echo "PM2 version: $(pm2 -v)"

# 4. Install Git
echo -e "${YELLOW}Step 4: Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    apt-get install -y git
else
    echo -e "${GREEN}Git already installed${NC}"
fi

# 5. Install Nginx
echo -e "${YELLOW}Step 5: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

# 6. Install MySQL (if not already installed)
echo -e "${YELLOW}Step 6: Checking MySQL installation...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL not found. Please run vps-setup-mysql.sh first${NC}"
else
    echo -e "${GREEN}MySQL already installed${NC}"
    mysql --version
fi

# 7. Create application directory
echo -e "${YELLOW}Step 7: Creating application directory...${NC}"
mkdir -p /var/www/psr-v4
mkdir -p /var/www/psr-v4/logs
cd /var/www/psr-v4

# 8. Clone repository (if not exists)
echo -e "${YELLOW}Step 8: Checking repository...${NC}"
if [ ! -d "/var/www/psr-v4/.git" ]; then
    echo -e "${YELLOW}Please clone your repository manually:${NC}"
    echo "cd /var/www/psr-v4"
    echo "git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git ."
else
    echo -e "${GREEN}Repository already cloned${NC}"
fi

# 9. Setup PM2 startup
echo -e "${YELLOW}Step 9: Setting up PM2 startup...${NC}"
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root

# 10. Configure Nginx
echo -e "${YELLOW}Step 10: Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/psr-v4 << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name 168.231.121.19;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/psr-v4 /etc/nginx/sites-enabled/psr-v4
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
systemctl enable nginx

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Initial VPS Setup Completed!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Next Steps:${NC}"
echo -e "1. Clone your repository (if not done):"
echo -e "   ${YELLOW}cd /var/www/psr-v4${NC}"
echo -e "   ${YELLOW}git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git .${NC}"
echo -e ""
echo -e "2. Create .env.production file with your credentials"
echo -e ""
echo -e "3. Install dependencies and build:"
echo -e "   ${YELLOW}npm ci${NC}"
echo -e "   ${YELLOW}npm run build${NC}"
echo -e ""
echo -e "4. Run database migrations:"
echo -e "   ${YELLOW}npx sequelize-cli db:migrate --env production${NC}"
echo -e ""
echo -e "5. Start application with PM2:"
echo -e "   ${YELLOW}pm2 start ecosystem.config.js --env production${NC}"
echo -e "   ${YELLOW}pm2 save${NC}"
echo -e ""
echo -e "6. Configure GitHub Actions secrets:"
echo -e "   VPS_HOST=168.231.121.19"
echo -e "   VPS_USERNAME=root"
echo -e "   VPS_PASSWORD=<your-password>"
echo -e ""
echo -e "${GREEN}Application will be available at: http://168.231.121.19${NC}"
echo -e ""
