# Reset Database Script - Clears all tables and migrations

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PSR-v4 Database Reset Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database credentials
$dbHost = "168.231.121.19"
$dbUser = "psr_admin"
$dbPass = "PsrAdmin@20252!"
$dbName = "psr_v4_main"

# MySQL executable path
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (-not (Test-Path $mysqlPath)) {
    Write-Host "[FAIL] MySQL client not found at: $mysqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] MySQL client found" -ForegroundColor Green
Write-Host ""

# Step 1: Drop the entire database
Write-Host "Step 1: Dropping database '$dbName'..." -ForegroundColor Yellow
$dropDbQuery = "DROP DATABASE IF EXISTS ``$dbName``;"
$dropDbQuery | & $mysqlPath -h $dbHost -u $dbUser -p"$dbPass" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database dropped" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to drop database" -ForegroundColor Red
    exit 1
}

# Step 2: Create fresh database
Write-Host "Step 2: Creating fresh database '$dbName'..." -ForegroundColor Yellow
$createDbQuery = @"
CREATE DATABASE ``$dbName`` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
"@

$createDbQuery | & $mysqlPath -h $dbHost -u $dbUser -p"$dbPass" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database created" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to create database" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database reset complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npx sequelize-cli db:migrate" -ForegroundColor White
Write-Host "  2. Run: npx sequelize-cli db:seed:all" -ForegroundColor White
Write-Host ""
