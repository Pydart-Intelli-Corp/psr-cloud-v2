# Machine API - Production Deployment Guide

## 🚀 Production Checklist

### 1. Configuration Setup

#### Required Environment Variables
Set these on your production server:

```bash
# Linux/Docker
export ConnectionStrings__DefaultConnection="Server=prod-db;Port=3306;Database=psr_machine_api;User=produser;Password=SECURE_PASSWORD;SslMode=Required;"
export Jwt__Secret="GENERATE_256_BIT_RANDOM_SECRET"
export ASPNETCORE_ENVIRONMENT="Production"

# Windows PowerShell
$env:ConnectionStrings__DefaultConnection="Server=prod-db;Port=3306;..."
$env:Jwt__Secret="GENERATE_256_BIT_RANDOM_SECRET"
$env:ASPNETCORE_ENVIRONMENT="Production"
```

#### Update appsettings.Production.json
Edit the file on your production server:
- Set `ConnectionStrings:DefaultConnection` with your database credentials
- Set `Jwt:Secret` with a secure random key (min 256 bits)
- Update `Cors:AllowedOrigins` with your actual domain(s)

### 2. Security Configuration

#### Generate Secure JWT Secret
```powershell
# PowerShell - Generate 64-character random string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

```bash
# Linux - Generate 64-character random string
openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
```

#### Database User Security
- **Never use root in production**
- Create dedicated database user with minimal privileges:

```sql
CREATE USER 'psr_machine_api'@'%' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON psr_machine_api.* TO 'psr_machine_api'@'%';
FLUSH PRIVILEGES;
```

#### SSL/TLS Configuration
- Enable MySQL SSL: Add `SslMode=Required` to connection string
- Use HTTPS certificates (Let's Encrypt recommended)
- Configure reverse proxy (nginx/Apache) for SSL termination

### 3. Build & Publish

#### Method 1: Publish to Folder
```bash
cd MachineAPI
dotnet publish -c Release -o ./publish
```

Transfer the `publish` folder to your server.

#### Method 2: Self-Contained Deployment
```bash
# For Linux x64
dotnet publish -c Release -r linux-x64 --self-contained true -o ./publish

# For Windows x64
dotnet publish -c Release -r win-x64 --self-contained true -o ./publish
```

### 4. Database Setup

#### Production Database Creation
```sql
CREATE DATABASE psr_machine_api CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Run Migrations (if using EF migrations)
```bash
dotnet ef database update --environment Production
```

**Note**: The API will verify database connectivity on startup but won't auto-create tables in Production mode.

### 5. Running in Production

#### Using Kestrel (Development/Testing)
```bash
cd publish
./MachineAPI  # Linux
MachineAPI.exe  # Windows
```

#### Using systemd (Linux - Recommended)
Create `/etc/systemd/system/machineapi.service`:

```ini
[Unit]
Description=Poornasree Machine API
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/machineapi
ExecStart=/usr/bin/dotnet /var/www/machineapi/MachineAPI.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=machineapi
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false
Environment=ConnectionStrings__DefaultConnection=Server=...

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable machineapi
sudo systemctl start machineapi
sudo systemctl status machineapi
```

#### Using IIS (Windows)
1. Install ASP.NET Core Hosting Bundle
2. Create IIS Application Pool (.NET CLR: No Managed Code)
3. Deploy to IIS folder
4. Configure web.config with environment variables

#### Using Docker
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY publish/ .
EXPOSE 80
EXPOSE 443
ENTRYPOINT ["dotnet", "MachineAPI.dll"]
```

### 6. Reverse Proxy Setup (nginx)

```nginx
server {
    listen 80;
    server_name api.poornasree.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. Monitoring & Logging

#### View Logs
```bash
# systemd
sudo journalctl -u machineapi -f

# Docker
docker logs -f machineapi-container

# File logging (configure in appsettings.Production.json)
tail -f /var/log/machineapi/app.log
```

#### Health Check Endpoint
```bash
curl https://api.poornasree.com/health
curl https://api.poornasree.com/health/ready
```

### 8. Performance Tuning

#### Connection Pooling (Already Configured)
- MinimumPoolSize: 5
- MaximumPoolSize: 100
- Connection timeout: 30s
- Retry on failure: 3 attempts

#### Rate Limiting (Already Configured)
- 100 requests per 60 seconds per IP
- Configurable in appsettings.Production.json

#### Response Compression & Caching
- GZIP compression enabled
- Response caching enabled
- Adjust cache headers in controllers as needed

### 9. Security Best Practices

✅ **Implemented:**
- HTTPS enforcement
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- CORS with whitelist
- Rate limiting
- Connection string encryption
- SQL injection protection (EF Core parameterized queries)
- Server header removal

⚠️ **Additional Recommendations:**
- Enable authentication (JWT) when ready
- Implement API key authentication for machine access
- Set up fail2ban for brute force protection
- Regular security audits
- Keep .NET runtime updated
- Monitor for suspicious activity

### 10. Backup Strategy

#### Database Backups
```bash
# Daily backup script
mysqldump -u backup_user -p psr_machine_api > backup_$(date +%Y%m%d).sql
```

#### Application Backups
- Version control for code
- Backup configuration files
- Document all environment variables

### 11. Troubleshooting

#### API won't start
1. Check logs: `journalctl -u machineapi -n 50`
2. Verify database connection string
3. Ensure database is accessible
4. Check port 5000/5001 availability

#### 500 Internal Server Error
- Check application logs
- Verify all environment variables are set
- Test database connectivity
- Review CORS configuration

#### Database Connection Failed
- Verify MySQL is running
- Check firewall rules
- Confirm credentials are correct
- Test SSL certificate if using SslMode=Required

### 12. Updates & Rollback

#### Deploy New Version
```bash
# Stop service
sudo systemctl stop machineapi

# Backup current version
cp -r /var/www/machineapi /var/www/machineapi.backup

# Deploy new version
cp -r publish/* /var/www/machineapi/

# Start service
sudo systemctl start machineapi
```

#### Rollback
```bash
sudo systemctl stop machineapi
rm -rf /var/www/machineapi
mv /var/www/machineapi.backup /var/www/machineapi
sudo systemctl start machineapi
```

## 📊 Production URLs

- **API Base**: `https://api.poornasree.com`
- **Health Check**: `https://api.poornasree.com/health`
- **Swagger** (Disabled in Production): Use Postman or API client

## 🔐 Security Contacts

Report security issues to: security@poornasree.com

## ✅ Post-Deployment Verification

1. Health check returns 200 OK
2. Test all CRUD endpoints
3. Verify rate limiting works (429 after 100 requests)
4. Check logs for errors
5. Monitor database connections
6. Verify CORS headers
7. Test from production frontend application
