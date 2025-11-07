# Automated VPS Setup Guide

This guide explains how to automatically configure your VPS for hosting on ports 80 (HTTP) and 443 (HTTPS) using GitHub Actions.

## 📋 Prerequisites

1. **VPS Requirements**:
   - Ubuntu 20.04+ or Debian 11+
   - Root or sudo access
   - At least 2GB RAM
   - 20GB+ disk space

2. **GitHub Secrets** (Required):
   Navigate to: `Repository → Settings → Secrets → Actions`
   
   Add these secrets:
   - `VPS_HOST`: Your VPS IP address (e.g., 168.231.121.19)
   - `VPS_USERNAME`: SSH username (e.g., root)
   - `VPS_PASSWORD`: SSH password
   - `EMAIL_USER`: Gmail address for sending emails
   - `EMAIL_PASSWORD`: Gmail app password

3. **Optional - For SSL/HTTPS**:
   - Domain name pointing to your VPS IP
   - Email address for SSL certificate

## 🚀 Automated Setup Process

### Step 1: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret` and add:

```
Name: VPS_HOST
Value: 168.231.121.19
```

```
Name: VPS_USERNAME
Value: root
```

```
Name: VPS_PASSWORD
Value: your-vps-password
```

```
Name: EMAIL_USER
Value: your-email@gmail.com
```

```
Name: EMAIL_PASSWORD
Value: your-gmail-app-password
```

### Step 2: Run Initial VPS Setup

1. Go to `Actions` tab in your repository
2. Select `Setup VPS Environment` workflow
3. Click `Run workflow`
4. Fill in optional fields:
   - **Domain**: Leave empty for IP-only access, or enter your domain (e.g., `poornasreeequipments.com`)
   - **Email**: Required if domain provided (for SSL certificate)
5. Click `Run workflow`

**This will automatically:**
- ✅ Update system packages
- ✅ Install Node.js 21.x
- ✅ Install PM2 process manager
- ✅ Install and configure Nginx
- ✅ Configure firewall (UFW)
- ✅ Clone your repository
- ✅ Create production environment file
- ✅ Install dependencies and build
- ✅ Run database migrations
- ✅ Start application with PM2
- ✅ Setup SSL certificate (if domain provided)

### Step 3: Verify Deployment

After the workflow completes (5-10 minutes):

**Without SSL (IP only):**
```bash
curl http://168.231.121.19/health
```

**With SSL (Domain):**
```bash
curl https://yourdomain.com/health
```

You should see: `healthy`

### Step 4: Access Application

**Without SSL:**
- URL: `http://168.231.121.19`
- Login: `admin@poornasreeequipments.com` / `psr@2025`

**With SSL:**
- URL: `https://yourdomain.com`
- Login: `admin@poornasreeequipments.com` / `psr@2025`

## 🔄 Continuous Deployment

After initial setup, every push to `master` branch automatically:
1. Pulls latest code
2. Installs dependencies
3. Builds application
4. Runs migrations
5. Restarts app with PM2

No manual intervention required!

## 🔒 What Gets Configured

### Nginx Configuration

**HTTP (Port 80):**
- Reverse proxy to Next.js app on port 3000
- Gzip compression enabled
- Rate limiting (API: 10 req/s, General: 30 req/s)
- Client upload size: 100MB
- Static file caching (1 year for Next.js assets)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)

**HTTPS (Port 443) - If Domain Provided:**
- Automatic SSL certificate from Let's Encrypt
- HTTP to HTTPS redirect
- Auto-renewal enabled
- Modern TLS configuration

### Firewall (UFW)

Configured to allow:
- Port 22: SSH (CRITICAL - always allowed)
- Port 80: HTTP
- Port 443: HTTPS
- Port 3306: MySQL (localhost only)

Default policies:
- Incoming: DENY
- Outgoing: ALLOW

### PM2 Process Manager

- Application name: `psr-v4`
- Auto-restart on crash
- Startup on server reboot
- Log rotation enabled
- Memory limit: 1GB

### Directory Structure

```
/var/www/psr-v4/
├── .next/              # Next.js build output
├── logs/               # Application logs
│   ├── combined.log
│   ├── error.log
│   └── output.log
├── node_modules/
├── src/
├── .env.production     # Auto-generated with secrets
└── ecosystem.config.js # PM2 configuration
```

## 📊 Monitoring & Management

### View Application Status

```bash
ssh root@168.231.121.19
pm2 status
```

### View Live Logs

```bash
ssh root@168.231.121.19
pm2 logs psr-v4
```

### Restart Application

```bash
ssh root@168.231.121.19
pm2 restart psr-v4
```

### Check Nginx Status

```bash
ssh root@168.231.121.19
systemctl status nginx
```

### View Nginx Access Logs

```bash
ssh root@168.231.121.19
tail -f /var/log/nginx/access.log
```

### View Nginx Error Logs

```bash
ssh root@168.231.121.19
tail -f /var/log/nginx/error.log
```

### Check Firewall Status

```bash
ssh root@168.231.121.19
ufw status verbose
```

### SSL Certificate Status (if configured)

```bash
ssh root@168.231.121.19
certbot certificates
```

## 🔧 Manual Operations

### Update SSL Certificate Manually

```bash
ssh root@168.231.121.19
certbot renew
```

### Reload Nginx Configuration

```bash
ssh root@168.231.121.19
nginx -t && systemctl reload nginx
```

### View Database Migrations

```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
npx sequelize-cli db:migrate:status --env production
```

### Run Database Seeder

```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
npx sequelize-cli db:seed --seed SEED_NAME --env production
```

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs psr-v4 --lines 100

# Check if port 3000 is in use
netstat -tulpn | grep 3000

# Restart PM2
pm2 restart psr-v4
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

### Database Connection Issues

```bash
# Check MySQL status
systemctl status mysql

# Test connection
mysql -u psr_admin -p psr_v4_main

# Check MySQL logs
tail -f /var/log/mysql/error.log
```

### Firewall Blocking Traffic

```bash
# Check firewall status
ufw status verbose

# Allow HTTP if not allowed
ufw allow 80/tcp

# Allow HTTPS if not allowed
ufw allow 443/tcp

# Reload firewall
ufw reload
```

## 🔐 Security Best Practices

### After Initial Setup

1. **Change Default Passwords**:
   ```bash
   # MySQL root password
   mysql -u root -p
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'NewStrongPassword';
   
   # MySQL app user password
   ALTER USER 'psr_admin'@'localhost' IDENTIFIED BY 'NewStrongPassword';
   ```

2. **Update Environment Variables**:
   ```bash
   ssh root@168.231.121.19
   nano /var/www/psr-v4/.env.production
   # Update DB_PASSWORD and JWT secrets
   pm2 restart psr-v4
   ```

3. **Setup SSH Key Authentication** (Disable password auth):
   ```bash
   # On local machine
   ssh-copy-id root@168.231.121.19
   
   # On VPS
   nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   systemctl restart sshd
   ```

4. **Enable Fail2Ban**:
   ```bash
   apt-get install fail2ban
   systemctl enable fail2ban
   systemctl start fail2ban
   ```

5. **Regular Updates**:
   ```bash
   # Setup automatic security updates
   apt-get install unattended-upgrades
   dpkg-reconfigure --priority=low unattended-upgrades
   ```

## 📈 Performance Optimization

### Enable HTTP/2 (Requires SSL)

Add to Nginx config:
```nginx
listen 443 ssl http2;
```

### Enable Brotli Compression

```bash
apt-get install nginx-module-brotli
# Add to nginx.conf
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

### Increase PM2 Instances (Cluster Mode)

Edit `ecosystem.config.js`:
```javascript
instances: "max",  // Use all CPU cores
exec_mode: "cluster"
```

### Database Optimization

```sql
-- MySQL configuration optimizations in /etc/mysql/mysql.conf.d/mysqld.cnf
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
```

## 🔄 Updating Domain/SSL Later

If you initially setup without SSL and want to add it later:

1. Go to `Actions` → `Setup VPS Environment`
2. Click `Run workflow`
3. Enter your domain and email
4. Click `Run workflow`

This will:
- Update Nginx configuration with your domain
- Obtain SSL certificate
- Setup auto-renewal
- Configure HTTPS redirect

## 📚 Additional Resources

- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [UFW Documentation](https://help.ubuntu.com/community/UFW)

## 🆘 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Check PM2 logs: `pm2 logs psr-v4`
3. Check Nginx logs: `/var/log/nginx/error.log`
4. Check system logs: `journalctl -xe`

## ✅ Verification Checklist

After setup, verify:

- [ ] Application accessible via HTTP (port 80)
- [ ] Application accessible via HTTPS (port 443) if domain configured
- [ ] SSL certificate valid (if domain configured)
- [ ] Super admin login works
- [ ] PM2 shows app running
- [ ] Nginx status is active
- [ ] Firewall configured correctly
- [ ] Database migrations applied
- [ ] Email sending works
- [ ] Automatic deployment works on push

---

**🎉 Your VPS is now fully configured and production-ready!**
