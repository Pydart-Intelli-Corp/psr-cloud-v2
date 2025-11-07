# PSR-v4 Remote Database Setup Script (PowerShell)
# Connects to VPS MySQL and creates database
# Usage: .\scripts\setup-remote-db.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "PSR-v4 Remote Database Setup" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# Database credentials
$DB_HOST = "168.231.121.19"
$DB_PORT = "3306"
$DB_USER = "psr_admin"
$DB_PASSWORD = "PsrAdmin@20252!"
$DB_NAME = "psr_v4_main"

Write-Host "Connecting to VPS MySQL Server..." -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Cyan
Write-Host "  User: $DB_USER" -ForegroundColor Cyan
Write-Host "  Database: $DB_NAME" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL client is installed
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlPath) {
    Write-Host "[ERROR] MySQL client not found!" -ForegroundColor Red
    Write-Host "Please install MySQL client from: https://dev.mysql.com/downloads/installer/" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] MySQL client found at: $($mysqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Step 1: Test connection
Write-Host "Step 1: Testing connection to VPS MySQL..." -ForegroundColor Blue
$testQuery = "SELECT VERSION() as version, DATABASE() as current_db;"
$testResult = $testQuery | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER --password=$DB_PASSWORD 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Connection successful!" -ForegroundColor Green
    Write-Host $testResult
} else {
    Write-Host "[FAIL] Connection failed!" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Create database
Write-Host "Step 2: Creating database '$DB_NAME'..." -ForegroundColor Blue
$createDbQuery = "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
$createDbQuery | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER --password=$DB_PASSWORD 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database created/verified" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to create database" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Create tables
Write-Host "Step 3: Creating tables..." -ForegroundColor Blue

# Create temporary SQL file
$sqlFile = "d:\psr-v4\temp-remote-setup.sql"
$createTablesSQL = @"
USE $DB_NAME;

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

CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);
"@

$createTablesSQL | Out-File -FilePath $sqlFile -Encoding UTF8

Get-Content $sqlFile | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER --password=$DB_PASSWORD 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Tables created successfully" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to create tables" -ForegroundColor Red
}

# Clean up
Remove-Item $sqlFile -Force -ErrorAction SilentlyContinue

Write-Host ""

# Step 4: Verify tables
Write-Host "Step 4: Verifying tables..." -ForegroundColor Blue
$verifyQuery = "USE $DB_NAME; SHOW TABLES;"
Write-Host ""
$verifyQuery | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER --password=$DB_PASSWORD

Write-Host ""

# Step 5: Create .env.production
Write-Host "Step 5: Creating .env.production file..." -ForegroundColor Blue
$envContent = @"
# Database Configuration - VPS MySQL
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
NEXT_PUBLIC_API_URL=http://$DB_HOST:3000

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=psr-production-jwt-secret-2025-minimum-32-characters-long
JWT_REFRESH_SECRET=psr-production-refresh-secret-2025-minimum-32-chars

# Email Configuration (UPDATE THESE!)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Application Settings
SUPER_ADMIN_EMAIL=admin@psrcloud.com
COMPANY_NAME=Poornasree Equipments
FRONTEND_URL=http://$DB_HOST
"@

$envFilePath = "d:\psr-v4\.env.production"
$envContent | Out-File -FilePath $envFilePath -Encoding UTF8
Write-Host "[OK] .env.production file created" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Remote Database Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Database Information:" -ForegroundColor Cyan
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host "  Password: ******** (saved in .env.production)"

Write-Host ""
Write-Host "Tables Created:" -ForegroundColor Cyan
Write-Host "  - users"
Write-Host "  - admin_schemas"
Write-Host "  - audit_logs"
Write-Host "  - otps"

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Generate secure JWT secrets:"
Write-Host "     - Visit: https://generate-secret.vercel.app/32"
Write-Host "     - Update JWT_SECRET and JWT_REFRESH_SECRET in .env.production"
Write-Host ""
Write-Host "  2. Update SMTP settings in .env.production"
Write-Host ""
Write-Host "  3. Run migrations (if needed):"
Write-Host "     npx sequelize-cli db:migrate --env production"
Write-Host ""
Write-Host "  4. Upload files to VPS and deploy:"
Write-Host "     scp -r d:\psr-v4\* root@$DB_HOST`:/var/www/psr-v4/"
Write-Host ""
Write-Host "  5. On VPS, run:"
Write-Host "     cd /var/www/psr-v4"
Write-Host "     npm install"
Write-Host "     npm run build"
Write-Host "     pm2 start ecosystem.config.js"

Write-Host ""
Write-Host "Setup completed at: $(Get-Date)" -ForegroundColor Green
Write-Host ""
