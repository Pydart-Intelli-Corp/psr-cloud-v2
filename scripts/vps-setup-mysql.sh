#!/bin/bash

###############################################################################
# PSR-v4 VPS MySQL Setup Script
# Automates MySQL installation and database configuration for PSR-v4
# 
# Usage: bash vps-setup-mysql.sh
# Run as: root or with sudo
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="psr_v4_main"
DB_USER="psr_admin"
DB_PASSWORD=""  # Will be prompted

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "Please run as root or with sudo"
        exit 1
    fi
    print_success "Running as root"
}

# Update system
update_system() {
    print_header "Updating System Packages"
    apt update && apt upgrade -y
    print_success "System updated successfully"
}

# Install MySQL
install_mysql() {
    print_header "Installing MySQL Server"
    
    # Check if MySQL already installed
    if command -v mysql &> /dev/null; then
        print_warning "MySQL is already installed"
        mysql --version
    else
        apt install -y mysql-server
        print_success "MySQL installed successfully"
    fi
    
    # Start and enable MySQL
    systemctl start mysql
    systemctl enable mysql
    print_success "MySQL service started and enabled"
}

# Configure MySQL
configure_mysql() {
    print_header "Configuring MySQL"
    
    # Get MySQL root password
    read -sp "Enter MySQL root password (will be created if first time): " MYSQL_ROOT_PASSWORD
    echo
    
    # Get PSR database password
    read -sp "Enter password for PSR database user ($DB_USER): " DB_PASSWORD
    echo
    read -sp "Confirm password: " DB_PASSWORD_CONFIRM
    echo
    
    if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
        print_error "Passwords do not match!"
        exit 1
    fi
    
    # Set MySQL root password and secure installation
    print_info "Securing MySQL installation..."
    
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';" 2>/dev/null || \
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1;" &>/dev/null || {
        print_error "Failed to set MySQL root password"
        exit 1
    }
    
    # Remove anonymous users
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DELETE FROM mysql.user WHERE User='';" 2>/dev/null
    
    # Disallow root login remotely
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');" 2>/dev/null
    
    # Remove test database
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS test;" 2>/dev/null
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';" 2>/dev/null
    
    # Flush privileges
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "FLUSH PRIVILEGES;" 2>/dev/null
    
    print_success "MySQL secured successfully"
}

# Create PSR database and user
create_database() {
    print_header "Creating PSR-v4 Database"
    
    # Read MySQL root password again
    read -sp "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
    echo
    
    # Create database
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
-- Create main database
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database user
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges on main database
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';

-- Grant schema creation privileges (for multi-tenant architecture)
GRANT CREATE ON *.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`%\`.* TO '$DB_USER'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use main database
USE $DB_NAME;

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

-- Show created tables
SHOW TABLES;
EOF

    if [ $? -eq 0 ]; then
        print_success "Database and tables created successfully"
    else
        print_error "Failed to create database and tables"
        exit 1
    fi
}

# Test database connection
test_connection() {
    print_header "Testing Database Connection"
    
    mysql -u $DB_USER -p"$DB_PASSWORD" -e "SHOW DATABASES;" &>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Database connection successful!"
        
        # Show databases
        print_info "Available databases:"
        mysql -u $DB_USER -p"$DB_PASSWORD" -e "SHOW DATABASES;"
        
        # Show tables in main database
        print_info "\nTables in $DB_NAME:"
        mysql -u $DB_USER -p"$DB_PASSWORD" $DB_NAME -e "SHOW TABLES;"
    else
        print_error "Database connection failed!"
        exit 1
    fi
}

# Display connection info
display_info() {
    print_header "Database Configuration Summary"
    
    cat <<EOF
${GREEN}MySQL Setup Completed Successfully!${NC}

${BLUE}Database Configuration:${NC}
- Database Name: $DB_NAME
- Database User: $DB_USER
- Database Password: ******** (saved)
- Host: localhost
- Port: 3306

${YELLOW}Next Steps:${NC}
1. Update your .env.production file with these credentials:
   
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=$DB_USER
   DB_PASSWORD=$DB_PASSWORD
   DB_NAME=$DB_NAME

2. Upload your application files to /var/www/psr-v4

3. Run database migrations:
   cd /var/www/psr-v4
   npx sequelize-cli db:migrate --env production

4. Create super admin user (if not using migrations):
   mysql -u $DB_USER -p $DB_NAME
   -- Then run the INSERT query for super admin

${BLUE}MySQL Status:${NC}
EOF
    systemctl status mysql --no-pager | head -5
    
    echo -e "\n${GREEN}Setup completed at: $(date)${NC}"
}

# Create .env template
create_env_template() {
    print_header "Creating Environment Template"
    
    ENV_FILE="/root/psr-v4.env.template"
    
    cat > $ENV_FILE <<EOF
# PSR-v4 Environment Configuration
# Generated on: $(date)

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false

# Application Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:3000

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Application Settings
SUPER_ADMIN_EMAIL=admin@psrcloud.com
COMPANY_NAME=Poornasree Equipments
FRONTEND_URL=http://YOUR_SERVER_IP
EOF

    print_success "Environment template created at: $ENV_FILE"
    print_info "Copy this to /var/www/psr-v4/.env.production and update values"
}

# Main execution
main() {
    print_header "PSR-v4 VPS MySQL Setup Script"
    
    check_root
    update_system
    install_mysql
    configure_mysql
    create_database
    test_connection
    create_env_template
    display_info
    
    print_success "\n🎉 MySQL setup completed successfully!"
}

# Run main function
main
