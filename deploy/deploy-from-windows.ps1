# PSR Cloud V2 - Windows Deployment Script
# Run this from PowerShell on Windows to deploy to VPS

$SERVER = "168.231.121.19"
$USER = "root"
$PROJECT_DIR = "P:\psr-cloud-v2"

Write-Host "=============================================="
Write-Host "  PSR Cloud V2 - Windows Deployment Tool"
Write-Host "=============================================="
Write-Host ""

# Test SSH connection
Write-Host "[1/5] Testing SSH connection..." -ForegroundColor Yellow
ssh -o ConnectTimeout=5 ${USER}@${SERVER} "echo 'Connection successful'" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to server. Check SSH connection." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Connected to server" -ForegroundColor Green

# Upload deployment script
Write-Host ""
Write-Host "[2/5] Uploading deployment script..." -ForegroundColor Yellow
scp "${PROJECT_DIR}\deploy\deploy.sh" ${USER}@${SERVER}:/root/
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment script uploaded" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to upload script" -ForegroundColor Red
    exit 1
}

# Upload helper scripts
Write-Host ""
Write-Host "[3/5] Uploading helper scripts..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "mkdir -p /root/psr-scripts"
scp "${PROJECT_DIR}\deploy\update.sh" ${USER}@${SERVER}:/root/psr-scripts/
scp "${PROJECT_DIR}\deploy\backup.sh" ${USER}@${SERVER}:/root/psr-scripts/

# Make scripts executable
Write-Host ""
Write-Host "[4/5] Making scripts executable..." -ForegroundColor Yellow
ssh ${USER}@${SERVER} "chmod +x /root/deploy.sh /root/psr-scripts/*.sh"
Write-Host "✅ Scripts are executable" -ForegroundColor Green

# Run deployment
Write-Host ""
Write-Host "[5/5] Starting deployment on server..." -ForegroundColor Yellow
Write-Host "This will take 10-15 minutes. Please wait..." -ForegroundColor Cyan
Write-Host ""

ssh ${USER}@${SERVER} "bash /root/deploy.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=============================================="
    Write-Host "  ✅ Deployment Successful!"
    Write-Host "=============================================="
    Write-Host ""
    Write-Host "Access your application at:" -ForegroundColor Green
    Write-Host "http://${SERVER}" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update .env file: ssh ${USER}@${SERVER} 'nano /var/www/psr-v4/.env'"
    Write-Host "2. Configure email settings"
    Write-Host "3. Restart: ssh ${USER}@${SERVER} 'pm2 restart all'"
    Write-Host ""
    Write-Host "Default login:" -ForegroundColor Yellow
    Write-Host "Username: admin"
    Write-Host "Password: psr@2025"
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the logs above." -ForegroundColor Red
    Write-Host "To debug, connect to server and check logs:" -ForegroundColor Yellow
    Write-Host "ssh ${USER}@${SERVER}"
}
