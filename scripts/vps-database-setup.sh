#!/bin/bash

###############################################################################
# PSR-v4 VPS Database Setup Script
# Creates database and runs all migrations
# 
# Usage: bash vps-database-setup.sh
# Run from: /var/www/psr-v4
###############################################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}PSR-v4 Database Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Database credentials
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="psr_admin"
DB_NAME="psr_v4_main"

# Prompt for password
read -sp "Enter MySQL password for user '$DB_USER': " DB_PASSWORD
echo

echo -e "\n${BLUE}Step 1: Creating database if not exists...${NC}"
mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DB_NAME;
SELECT 'Database created/verified successfully' as Status;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create database${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 2: Creating main tables...${NC}"
mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" <<'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin', 'dairy', 'bmc', 'society', 'farmer') NOT NULL,
  db_key VARCHAR(20),
  company_name VARCHAR(255),
  company_pincode VARCHAR(10),
  company_city VARCHAR(100),
  company_state VARCHAR(100),
  status ENUM('active', 'inactive', 'pending_approval', 'rejected') DEFAULT 'pending_approval',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_uid (uid),
  INDEX idx_role (role),
  INDEX idx_status (status)
);

-- Create admin_schemas table
CREATE TABLE IF NOT EXISTS admin_schemas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  db_key VARCHAR(20) UNIQUE NOT NULL,
  schema_name VARCHAR(100) UNIQUE NOT NULL,
  company_name VARCHAR(255),
  company_pincode VARCHAR(10),
  company_city VARCHAR(100),
  company_state VARCHAR(100),
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_db_key (db_key),
  INDEX idx_admin_id (admin_id)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Create otps table
CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);

SELECT 'Main tables created successfully' as Status;
SHOW TABLES;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Main tables created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create main tables${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 3: Updating .env.production file...${NC}"
cat > .env.production <<EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://168.231.121.19:3000

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Email Configuration (UPDATE THESE!)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Application Settings
SUPER_ADMIN_EMAIL=admin@psrcloud.com
COMPANY_NAME=Poornasree Equipments
FRONTEND_URL=http://168.231.121.19
EOF

echo -e "${GREEN}✓ .env.production file created${NC}"

echo -e "\n${BLUE}Step 4: Running Sequelize migrations...${NC}"
if [ -d "node_modules" ]; then
    npx sequelize-cli db:migrate --env production
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migrations completed successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Migrations failed or already applied${NC}"
    fi
else
    echo -e "${YELLOW}⚠ node_modules not found. Run 'npm install' first${NC}"
fi

echo -e "\n${BLUE}Step 5: Verifying database setup...${NC}"
mysql -u "$DB_USER" -p"$DB_PASSWORD" -h "$DB_HOST" "$DB_NAME" -e "SHOW TABLES;"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Database Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}Database Information:${NC}"
echo -e "  Host: $DB_HOST"
echo -e "  Port: $DB_PORT"
echo -e "  Database: $DB_NAME"
echo -e "  User: $DB_USER"
echo -e "  Password: ******** (saved in .env.production)"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Update SMTP settings in .env.production"
echo -e "  2. Run: npm install"
echo -e "  3. Run: npm run build"
echo -e "  4. Run: pm2 start ecosystem.config.js"

echo -e "\n${GREEN}Setup completed at: $(date)${NC}\n"
