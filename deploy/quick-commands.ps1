# PSR Cloud V2 - Quick Commands
# Save this for easy reference

$SERVER = "root@168.231.121.19"

function Deploy-Full {
    Write-Host "🚀 Running full deployment..." -ForegroundColor Cyan
    scp P:\psr-cloud-v2\deploy\deploy.sh ${SERVER}:/root/
    ssh ${SERVER} "chmod +x /root/deploy.sh && bash /root/deploy.sh"
}

function Deploy-Update {
    Write-Host "🔄 Updating application..." -ForegroundColor Cyan
    scp P:\psr-cloud-v2\deploy\update.sh ${SERVER}:/var/www/psr-v4/
    ssh ${SERVER} "cd /var/www/psr-v4 && chmod +x update.sh && bash update.sh"
}

function Show-Logs {
    Write-Host "📊 Showing application logs..." -ForegroundColor Cyan
    ssh ${SERVER} "pm2 logs psr-v4 --lines 50"
}

function Show-Status {
    Write-Host "📊 Checking status..." -ForegroundColor Cyan
    ssh ${SERVER} "pm2 status && systemctl status nginx --no-pager"
}

function Restart-App {
    Write-Host "🔄 Restarting application..." -ForegroundColor Cyan
    ssh ${SERVER} "pm2 restart all"
}

function Backup-Database {
    Write-Host "💾 Creating database backup..." -ForegroundColor Cyan
    ssh ${SERVER} "cd /var/www/psr-v4 && npm run db:backup"
}

function Connect-Server {
    Write-Host "🔌 Connecting to server..." -ForegroundColor Cyan
    ssh ${SERVER}
}

function Edit-Config {
    Write-Host "⚙️ Opening configuration file..." -ForegroundColor Cyan
    ssh ${SERVER} "nano /var/www/psr-v4/.env"
}

# Display menu
Write-Host "=============================================="
Write-Host "  PSR Cloud V2 - Quick Commands"
Write-Host "=============================================="
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  Deploy-Full          - Full deployment"
Write-Host "  Deploy-Update        - Update existing"
Write-Host "  Show-Logs            - View logs"
Write-Host "  Show-Status          - Check status"
Write-Host "  Restart-App          - Restart application"
Write-Host "  Backup-Database      - Backup database"
Write-Host "  Connect-Server       - SSH to server"
Write-Host "  Edit-Config          - Edit .env file"
Write-Host ""
Write-Host "Example: Deploy-Full" -ForegroundColor Green
Write-Host ""
