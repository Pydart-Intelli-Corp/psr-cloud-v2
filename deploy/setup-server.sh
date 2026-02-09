#!/bin/bash

###############################################################################
# PSR Cloud V2 - Server Infrastructure Setup
# Run this FIRST to prepare the server
# This only installs required software (MySQL, Node.js, PM2, Nginx)
###############################################################################

set -e

echo "=============================================="
echo "  PSR Cloud V2 - Server Setup"
echo "  Step 1: Infrastructure Installation"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root"
    exit 1
fi

###############################################################################
# 1. System Update
###############################################################################
print_message "Step 1/7: Updating system packages..."
apt update -y
apt upgrade -y
apt install -y curl wget git build-essential software-properties-common
print_message "System updated"

###############################################################################
# 2. Install Node.js 20.x
###############################################################################
print_message "Step 2/7: Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
print_message "Node.js installed: $(node --version)"
print_message "NPM installed: $(npm --version)"

###############################################################################
# 3. Install MySQL 8.0
###############################################################################
print_message "Step 3/7: Installing MySQL Server..."
apt install -y mysql-server

# Start MySQL
systemctl start mysql
systemctl enable mysql

print_message "MySQL installed"
print_message "MySQL status:"
systemctl status mysql --no-pager -l | head -5

###############################################################################
# 4. Install PM2
###############################################################################
print_message "Step 4/7: Installing PM2 Process Manager..."
npm install -g pm2
pm2 update
print_message "PM2 installed: $(pm2 --version)"

###############################################################################
# 5. Install Nginx
###############################################################################
print_message "Step 5/7: Installing Nginx..."
apt install -y nginx

# Start Nginx
systemctl start nginx
systemctl enable nginx

print_message "Nginx installed"
print_message "Nginx status:"
systemctl status nginx --no-pager -l | head -5

###############################################################################
# 6. Configure Firewall
###############################################################################
print_message "Step 6/7: Configuring UFW firewall..."
ufw --force enable
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 3000/tcp   # Node.js (optional)
ufw allow 3306/tcp   # MySQL (optional, for remote access)

print_message "Firewall configured"
ufw status | head -10

###############################################################################
# 7. Create Application Directory
###############################################################################
print_message "Step 7/7: Creating application directory..."
mkdir -p /var/www/psr-v4
mkdir -p /var/www/psr-v4/logs
mkdir -p /root/backups

print_message "Directories created"

###############################################################################
# Summary
###############################################################################
echo ""
echo "=============================================="
echo "  ✅ Server Infrastructure Ready!"
echo "=============================================="
echo ""
echo "Installed components:"
echo "  ✓ Ubuntu $(lsb_release -rs)"
echo "  ✓ Node.js $(node --version)"
echo "  ✓ NPM $(npm --version)"
echo "  ✓ MySQL $(mysql --version | awk '{print $5}')"
echo "  ✓ PM2 $(pm2 --version)"
echo "  ✓ Nginx $(nginx -v 2>&1 | awk '{print $3}')"
echo ""
echo "Next Steps:"
echo "  1. Configure MySQL database and user"
echo "  2. Clone application repository"
echo "  3. Configure environment variables"
echo "  4. Build and deploy application"
echo ""
echo "See MANUAL_SETUP_GUIDE.md for detailed instructions"
echo ""
