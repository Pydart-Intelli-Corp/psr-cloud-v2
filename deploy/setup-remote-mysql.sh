#!/bin/bash

# Setup Remote MySQL Access
# Allows remote connections to MySQL database

set -e

echo "=========================================="
echo "Setup Remote MySQL Access"
echo "=========================================="
echo ""

DB_USER="psr_admin"
DB_PASSWORD="PsrAdmin@2025!"

# Get client IP (optional - for more secure connection)
echo "Step 1: Determine connection settings..."
echo ""
echo "Choose access level:"
echo "  1) Allow from ANY IP (less secure, more flexible)"
echo "  2) Allow from specific IP only (more secure)"
echo ""
read -p "Enter choice (1 or 2): " ACCESS_CHOICE

if [ "$ACCESS_CHOICE" == "2" ]; then
    read -p "Enter your IP address to allow (e.g., 192.168.1.100): " CLIENT_IP
    HOST_PATTERN="$CLIENT_IP"
    echo "Will allow connections from: $CLIENT_IP"
else
    HOST_PATTERN="%"
    echo "Will allow connections from: ANY IP"
fi
echo ""

# Update MySQL to allow remote connections
echo "Step 2: Configuring MySQL for remote connections..."

# Backup MySQL config
cp /etc/mysql/mysql.conf.d/mysqld.cnf /etc/mysql/mysql.conf.d/mysqld.cnf.backup.$(date +%Y%m%d_%H%M%S)

# Update bind-address to allow remote connections
if grep -q "^bind-address" /etc/mysql/mysql.conf.d/mysqld.cnf; then
    sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
    echo "✅ Updated bind-address to 0.0.0.0"
else
    echo "bind-address = 0.0.0.0" >> /etc/mysql/mysql.conf.d/mysqld.cnf
    echo "✅ Added bind-address = 0.0.0.0"
fi

# Also check for mysqlx-bind-address
if grep -q "^mysqlx-bind-address" /etc/mysql/mysql.conf.d/mysqld.cnf; then
    sed -i 's/^mysqlx-bind-address.*/mysqlx-bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
fi

echo "✅ MySQL configuration updated"
echo ""

# Restart MySQL
echo "Step 3: Restarting MySQL service..."
systemctl restart mysql
sleep 3

if systemctl is-active --quiet mysql; then
    echo "✅ MySQL restarted successfully"
else
    echo "❌ MySQL failed to restart"
    echo "Check logs: journalctl -xeu mysql"
    exit 1
fi
echo ""

# Create/Update MySQL user for remote access
echo "Step 4: Setting up remote database user..."

mysql -u root -p <<MYSQL_SCRIPT
-- Create remote user if doesn't exist
CREATE USER IF NOT EXISTS '${DB_USER}'@'${HOST_PATTERN}' IDENTIFIED BY '${DB_PASSWORD}';

-- Grant privileges on main database
GRANT ALL PRIVILEGES ON psr_v4_main.* TO '${DB_USER}'@'${HOST_PATTERN}';

-- Grant privileges to create admin schemas (multi-tenant)
GRANT ALL PRIVILEGES ON \`%\`.* TO '${DB_USER}'@'${HOST_PATTERN}';

-- Grant global privileges needed
GRANT CREATE, ALTER, DROP, INDEX, REFERENCES ON *.* TO '${DB_USER}'@'${HOST_PATTERN}';

-- Apply changes
FLUSH PRIVILEGES;

-- Show created users
SELECT user, host FROM mysql.user WHERE user='${DB_USER}';

MYSQL_SCRIPT

echo "✅ Remote database user configured"
echo ""

# Configure firewall
echo "Step 5: Configuring firewall..."

# Allow MySQL port from specific IP or all
if [ "$HOST_PATTERN" == "%" ]; then
    ufw allow 3306/tcp
    echo "✅ Opened port 3306 for all IPs"
else
    ufw allow from ${CLIENT_IP} to any port 3306
    echo "✅ Opened port 3306 for ${CLIENT_IP}"
fi

ufw reload
echo "✅ Firewall updated"
echo ""

# Test connection
echo "Step 6: Testing MySQL remote access..."
echo ""

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "Test connection from your local machine:"
echo ""
echo "  mysql -h ${SERVER_IP} -P 3306 -u ${DB_USER} -p${DB_PASSWORD} psr_v4_main"
echo ""
echo "Or using a MySQL client:"
echo "  Host: ${SERVER_IP}"
echo "  Port: 3306"
echo "  User: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo "  Database: psr_v4_main"
echo ""

# Show current MySQL users
echo "Current MySQL users:"
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user='${DB_USER}';"
echo ""

# Show firewall status
echo "Firewall status:"
ufw status | grep 3306
echo ""

echo "=========================================="
echo "✅ Remote MySQL Access Configured!"
echo "=========================================="
echo ""
echo "Connection Details:"
echo "  Host: ${SERVER_IP}"
echo "  Port: 3306"
echo "  User: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo "  Database: psr_v4_main"
echo ""
echo "Access Level: ${HOST_PATTERN}"
echo ""
echo "Update your .env.local file:"
echo "  DB_HOST=${SERVER_IP}"
echo "  DB_PORT=3306"
echo "  DB_USER=${DB_USER}"
echo "  DB_PASSWORD=${DB_PASSWORD}"
echo "  DB_NAME=psr_v4_main"
echo ""
echo "Security Notes:"
if [ "$HOST_PATTERN" == "%" ]; then
    echo "  ⚠️  WARNING: MySQL accepts connections from ANY IP"
    echo "  Consider restricting to specific IPs for production"
else
    echo "  ✅ MySQL only accepts connections from: ${CLIENT_IP}"
fi
echo ""
echo "To remove remote access later:"
echo "  mysql -u root -p -e \"DROP USER '${DB_USER}'@'${HOST_PATTERN}';\""
echo "  ufw delete allow 3306/tcp"
echo ""
