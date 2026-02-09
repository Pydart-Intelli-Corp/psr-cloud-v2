# Test Remote MySQL Connection
# Tests connection to VPS MySQL database

$Host = "168.231.121.19"
$Port = 3306
$User = "psr_admin"
$Password = "PsrAdmin@2025!"
$Database = "psr_v4_main"

Write-Host "=========================================="
Write-Host "Testing Remote MySQL Connection"
Write-Host "=========================================="
Write-Host ""

Write-Host "Step 1: Testing network connectivity..."
Write-Host "Host: $Host"
Write-Host "Port: $Port"
Write-Host ""

# Test if port is open
try {
    $tcpTest = Test-NetConnection -ComputerName $Host -Port $Port -WarningAction SilentlyContinue
    
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "✅ Port $Port is OPEN" -ForegroundColor Green
        Write-Host "   Ping: $($tcpTest.PingSucceeded)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "❌ Port $Port is CLOSED or unreachable" -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  • MySQL remote access not configured"
        Write-Host "  • Firewall blocking port 3306"
        Write-Host "  • MySQL not running on server"
        Write-Host ""
        Write-Host "Run setup script on server:" -ForegroundColor Cyan
        Write-Host "  bash /root/setup-remote-mysql.sh"
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host "❌ Network test failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: Testing MySQL authentication..."
Write-Host ""

# Check if MySQL client is installed
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if ($mysqlPath) {
    Write-Host "MySQL client found: $($mysqlPath.Source)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Attempting connection..." -ForegroundColor Yellow
    Write-Host "(You may need to enter password if prompted)"
    Write-Host ""
    
    # Test connection with mysql client
    $env:MYSQL_PWD = $Password
    $testQuery = "SELECT VERSION() as version, DATABASE() as db, USER() as user;"
    
    try {
        $result = & mysql -h $Host -P $Port -u $User $Database -e $testQuery 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MySQL connection successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Connection Details:" -ForegroundColor Cyan
            Write-Host $result
            Write-Host ""
        } else {
            Write-Host "❌ MySQL authentication failed" -ForegroundColor Red
            Write-Host $result -ForegroundColor Yellow
            Write-Host ""
        }
    } catch {
        Write-Host "⚠️  Error executing MySQL command: $_" -ForegroundColor Yellow
        Write-Host ""
    } finally {
        Remove-Item Env:MYSQL_PWD
    }
} else {
    Write-Host "⚠️  MySQL client not installed on this machine" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Port is open, but cannot test authentication without MySQL client." -ForegroundColor Gray
    Write-Host ""
    Write-Host "To install MySQL client:" -ForegroundColor Cyan
    Write-Host "  Download from: https://dev.mysql.com/downloads/mysql/"
    Write-Host ""
    Write-Host "Or test with your application:" -ForegroundColor Cyan
    Write-Host "  cd P:\psr-cloud-v2"
    Write-Host "  npm run dev"
    Write-Host ""
}

Write-Host "Step 3: Connection string for .env.local..."
Write-Host ""

$envConfig = @"
# Database Configuration (VPS MySQL - Remote)
DB_HOST=$Host
DB_PORT=$Port
DB_USER=$User
DB_PASSWORD=$Password
DB_NAME=$Database
DB_SSL_MODE=
DB_SSL_CA=
DB_REJECT_UNAUTHORIZED=false
"@

Write-Host $envConfig -ForegroundColor Cyan
Write-Host ""

Write-Host "=========================================="
Write-Host "Test Complete!"
Write-Host "=========================================="
Write-Host ""

if ($tcpTest.TcpTestSucceeded) {
    Write-Host "✅ Network: Connected" -ForegroundColor Green
    
    if ($mysqlPath -and $LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL: Authenticated" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now use remote database in your application!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MySQL: Authentication unknown" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Update P:\psr-cloud-v2\.env.local with connection details above" -ForegroundColor Cyan
        Write-Host "Then test with: npm run dev" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Connection failed" -ForegroundColor Red
    Write-Host "Setup remote MySQL access first" -ForegroundColor Yellow
}

Write-Host ""
