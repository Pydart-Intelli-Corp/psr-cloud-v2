#!/bin/bash

###############################################################################
# PSR Cloud V2 - Complete Server Deployment Script
# For fresh Ubuntu 20.04/22.04 VPS
###############################################################################

set -e  # Exit on any error

echo "=============================================="
echo "  PSR Cloud V2 - Automated Deployment"
echo "  Version: 2.1.0"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use: sudo bash deploy.sh)"
    exit 1
fi

print_message "Starting deployment..."

###############################################################################
# 1. System Update
###############################################################################
print_message "Updating system packages..."
apt update -y
apt upgrade -y
print_message "System updated successfully"

###############################################################################
# 2. Install Required Software
###############################################################################
print_message "Installing required packages..."
apt install -y curl wget git build-essential

###############################################################################
# 3. Install Node.js 20.x
###############################################################################
print_message "Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
else
    print_warning "Node.js already installed"
fi
node --version
npm --version
print_message "Node.js installed successfully"

###############################################################################
# 4. Install MySQL Server
###############################################################################
print_message "Installing MySQL Server..."
if ! command -v mysql &> /dev/null; then
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    print_message "MySQL installed successfully"
else
    print_warning "MySQL already installed"
fi

###############################################################################
# 5. Install PM2
###############################################################################
print_message "Installing PM2 Process Manager..."
npm install -g pm2
pm2 update
print_message "PM2 installed successfully"

###############################################################################
# 6. Install Nginx
###############################################################################
print_message "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_message "Nginx installed successfully"
else
    print_warning "Nginx already installed"
fi

###############################################################################
# 7. Setup Application Directory
###############################################################################
print_message "Setting up application directory..."
APP_DIR="/var/www/psr-v4"

# Backup existing installation if present
if [ -d "$APP_DIR" ]; then
    BACKUP_DIR="/root/psr-v4-backup-$(date +%Y%m%d-%H%M%S)"
    print_warning "Existing installation found. Backing up to $BACKUP_DIR"
    mv "$APP_DIR" "$BACKUP_DIR"
fi

mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/logs"
cd "$APP_DIR"
print_message "Application directory created"

###############################################################################
# 8. Clone Repository
###############################################################################
print_message "Cloning PSR Cloud V2 repository..."
git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git .
print_message "Repository cloned successfully"

###############################################################################
# 9. Install Dependencies
###############################################################################
print_message "Installing Node.js dependencies..."
npm ci --production=false
print_message "Dependencies installed successfully"

###############################################################################
# 10. Environment Configuration
###############################################################################
print_message "Creating environment configuration..."

if [ -f ".env" ]; then
    print_warning ".env file already exists. Skipping..."
else
    cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@2025!
DB_NAME=psr_v4_main

# SSL Configuration
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false

# Pool Configuration
DB_POOL_MAX=30
DB_POOL_MIN=2
DB_CONNECTION_TIMEOUT=30
DB_CONNECTION_LIFETIME=300

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=psr-cloud-v2-jwt-secret-key-change-in-production
JWT_REFRESH_SECRET=psr-cloud-v2-refresh-secret-key-change-in-production

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SECURE=false

# Super Admin
SUPER_ADMIN_USERNAME=admin
SUPER_ADMIN_PASSWORD=psr@2025

# Application URLs
NEXT_PUBLIC_APP_URL=http://168.231.121.19:3000
CLIENT_URL=http://168.231.121.19:3000

# Node Environment
NODE_ENV=production
PORT=3000
EOF
    print_message ".env file created"
    print_warning "IMPORTANT: Edit .env file with your actual credentials!"
    print_warning "Run: nano /var/www/psr-v4/.env"
fi

###############################################################################
# 11. MySQL Database Setup
###############################################################################
print_message "Setting up MySQL database..."

# Create MySQL user and database
mysql -e "CREATE DATABASE IF NOT EXISTS psr_v4_main;" 2>/dev/null || print_warning "Database might already exist"
mysql -e "CREATE USER IF NOT EXISTS 'psr_admin'@'localhost' IDENTIFIED BY 'PsrAdmin@2025!';" 2>/dev/null || print_warning "User might already exist"
mysql -e "GRANT ALL PRIVILEGES ON psr_v4_main.* TO 'psr_admin'@'localhost';" 2>/dev/null
mysql -e "GRANT ALL PRIVILEGES ON \`%\`.* TO 'psr_admin'@'localhost';" 2>/dev/null
mysql -e "FLUSH PRIVILEGES;" 2>/dev/null

print_message "MySQL database configured"

###############################################################################
# 12. Build Application
###############################################################################
print_message "Building Next.js application..."
npm run build
print_message "Application built successfully"

###############################################################################
# 13. Run Database Migrations
###############################################################################
print_message "Running database migrations..."
npx sequelize-cli db:migrate --env production || print_warning "Migration might have issues"
print_message "Migrations completed"

###############################################################################
# 14. Configure Nginx
###############################################################################
print_message "Configuring Nginx..."

cat > /etc/nginx/sites-available/psr-v4 << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/psr-v4 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
print_message "Nginx configured successfully"

###############################################################################
# 15. Start Application with PM2
###############################################################################
print_message "Starting application with PM2..."

# Stop any existing PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -n 1 | bash

print_message "Application started with PM2"

###############################################################################
# 16. Configure Firewall
###############################################################################
print_message "Configuring UFW firewall..."

ufw --force enable
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Node.js (optional, for direct access)

print_message "Firewall configured"

###############################################################################
# 17. Display Status
###############################################################################
echo ""
echo "=============================================="
echo "  Deployment Complete! 🎉"
echo "=============================================="
echo ""
print_message "Server IP: $(curl -s ifconfig.me)"
print_message "Application URL: http://$(curl -s ifconfig.me)"
print_message "Super Admin Login: admin / psr@2025"
echo ""
echo "Next Steps:"
echo "1. Update .env file: nano /var/www/psr-v4/.env"
echo "2. Configure email settings in .env"
echo "3. Update JWT secrets in .env"
echo "4. Restart application: pm2 restart all"
echo ""
echo "Useful Commands:"
echo "  - View logs: pm2 logs psr-v4"
echo "  - Status: pm2 status"
echo "  - Restart: pm2 restart psr-v4"
echo "  - Monitor: pm2 monit"
echo ""
print_message "Deployment script completed successfully!"
