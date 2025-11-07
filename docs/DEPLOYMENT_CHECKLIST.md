# VPS Deployment Checklist

Use this checklist to ensure successful automated VPS deployment.

## Pre-Deployment Checklist

### 1. GitHub Repository Setup
- [ ] Repository accessible: `Pydart-Intelli-Corp/psr-cloud-v2`
- [ ] You have admin access to repository
- [ ] Master branch is protected (recommended)
- [ ] Actions are enabled in repository settings

### 2. VPS Requirements
- [ ] VPS is running Ubuntu 20.04+ or Debian 11+
- [ ] VPS has at least 2GB RAM
- [ ] VPS has at least 20GB disk space
- [ ] VPS IP address is known (e.g., 168.231.121.19)
- [ ] SSH access works: `ssh root@YOUR_VPS_IP`
- [ ] Root or sudo access available

### 3. Database Setup
- [ ] MySQL 8.0+ is installed on VPS
- [ ] Database `psr_v4_main` exists
- [ ] MySQL user `psr_admin` created
- [ ] Password is set: `PsrAdmin@20252!` (or custom)
- [ ] User has full privileges on database
- [ ] MySQL accessible from localhost

### 4. Email Configuration
- [ ] Gmail account available for sending emails
- [ ] 2-Step Verification enabled on Gmail
- [ ] App password generated for Gmail
- [ ] Test email sending works

### 5. Domain & SSL (Optional)
- [ ] Domain purchased and owned
- [ ] DNS A record points to VPS IP
- [ ] DNS propagation complete (check with `nslookup`)
- [ ] Email address available for SSL registration

## GitHub Secrets Setup

Navigate to: `https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/secrets/actions`

### Required Secrets (5)
- [ ] `VPS_HOST` = `168.231.121.19` (your VPS IP)
- [ ] `VPS_USERNAME` = `root` (or your SSH user)
- [ ] `VPS_PASSWORD` = Your VPS SSH password
- [ ] `EMAIL_USER` = Your Gmail address
- [ ] `EMAIL_PASSWORD` = Your Gmail app password

### Verify Secrets
- [ ] All 5 secrets show in repository secrets list
- [ ] Secret names are EXACTLY as specified (case-sensitive)
- [ ] No extra spaces in secret values

## Initial Setup Workflow

### Run Setup Workflow
- [ ] Go to repository → Actions tab
- [ ] Select "Setup VPS Environment" workflow
- [ ] Click "Run workflow" dropdown button

### Workflow Inputs
**Without SSL (IP-only access):**
- [ ] Domain: Leave empty
- [ ] Email: Leave empty

**With SSL (Domain access):**
- [ ] Domain: Enter your domain (e.g., `poornasreeequipments.com`)
- [ ] Email: Enter your email (e.g., `admin@poornasreeequipments.com`)

### Start Deployment
- [ ] Click green "Run workflow" button
- [ ] Workflow appears in workflow runs list
- [ ] Watch progress (should take 5-10 minutes)

## Post-Deployment Verification

### Check Workflow Status
- [ ] Workflow completed successfully (green checkmark)
- [ ] No failed steps in workflow
- [ ] All 10+ steps show success
- [ ] No error messages in logs

### Test SSH Access
```bash
ssh root@168.231.121.19
```
- [ ] SSH connection successful
- [ ] No authentication errors

### Verify Services Running
```bash
# Check PM2 status
pm2 status
```
- [ ] App "psr-v4" is online
- [ ] Status shows "online" (not "errored" or "stopped")
- [ ] Uptime is recent
- [ ] Memory usage is reasonable

```bash
# Check Nginx status
systemctl status nginx
```
- [ ] Nginx is active (running)
- [ ] No error messages

```bash
# Check firewall
ufw status verbose
```
- [ ] UFW is active
- [ ] Ports 22, 80, 443 are allowed
- [ ] Default policy: deny (incoming)

### Test Application Access

**HTTP Access (Always):**
```bash
curl http://168.231.121.19/health
```
- [ ] Returns: `healthy`
- [ ] Status code: 200
- [ ] Response time under 1 second

**Browser Access:**
- [ ] Open `http://168.231.121.19` in browser
- [ ] Page loads without errors
- [ ] Login page displays correctly
- [ ] No console errors in browser

**HTTPS Access (If Domain Configured):**
```bash
curl https://yourdomain.com/health
```
- [ ] Returns: `healthy`
- [ ] SSL certificate valid
- [ ] No certificate warnings

```bash
# Check SSL certificate
ssh root@168.231.121.19
certbot certificates
```
- [ ] Certificate exists for your domain
- [ ] Expiry date is ~90 days away
- [ ] Auto-renewal is enabled

### Test Application Features

**Login Test:**
- [ ] Navigate to login page
- [ ] Enter: `admin@poornasreeequipments.com`
- [ ] Password: `psr@2025`
- [ ] Login successful
- [ ] Dashboard loads

**Database Test:**
- [ ] Can view entities (if any exist)
- [ ] Can navigate between pages
- [ ] No database connection errors

**Email Test (Optional):**
- [ ] Register a test user
- [ ] OTP email received
- [ ] Email formatting is correct

## Continuous Deployment Test

### Test Auto-Deployment
```bash
# On local machine
echo "# Test deployment" >> README.md
git add README.md
git commit -m "Test automated deployment"
git push origin master
```

- [ ] Push successful
- [ ] GitHub Actions workflow triggered
- [ ] Workflow "Deploy to VPS" starts automatically
- [ ] Workflow completes successfully
- [ ] Application still accessible
- [ ] No downtime experienced

### Verify Deployment
```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
git log -1
```
- [ ] Latest commit shows in git log
- [ ] Application restarted successfully
- [ ] PM2 shows recent restart time

## Security Verification

### Firewall Check
```bash
ssh root@168.231.121.19
ufw status verbose
```
- [ ] Only ports 22, 80, 443 allowed from outside
- [ ] MySQL (3306) not exposed publicly
- [ ] Default deny policy active

### SSL/TLS Check (If Configured)
```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```
- [ ] Connection successful
- [ ] Certificate chain valid
- [ ] TLS version is 1.2 or higher
- [ ] Strong cipher suite used

### Security Headers Check
```bash
curl -I https://yourdomain.com/
```
- [ ] `X-Frame-Options` present
- [ ] `X-Content-Type-Options` present
- [ ] `X-XSS-Protection` present
- [ ] `Referrer-Policy` present

### Application Security
- [ ] `.env.production` file exists and has correct values
- [ ] JWT secrets are unique (not defaults)
- [ ] Database password is strong
- [ ] No sensitive data in git repository
- [ ] `.gitignore` excludes `.env*` files

## Performance Verification

### Response Time Test
```bash
curl -w "\nTime: %{time_total}s\n" http://168.231.121.19/health
```
- [ ] Response time under 1 second
- [ ] Consistent across multiple requests

### Load Test (Optional)
```bash
# Install Apache Bench
apt-get install apache2-utils

# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 http://168.231.121.19/health
```
- [ ] No failed requests
- [ ] Average response time acceptable
- [ ] Application remains stable

### Resource Usage
```bash
ssh root@168.231.121.19
pm2 monit
```
- [ ] Memory usage under 80%
- [ ] CPU usage reasonable
- [ ] No memory leaks visible

```bash
df -h
```
- [ ] Disk usage under 80%
- [ ] Sufficient space for logs and uploads

## Monitoring Setup

### PM2 Monitoring
- [ ] PM2 logs accessible: `pm2 logs psr-v4`
- [ ] Error logs show no critical issues
- [ ] Output logs show normal operation
- [ ] Log rotation working (logs not growing indefinitely)

### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```
- [ ] Access logs show normal traffic
- [ ] Error logs show no critical errors
- [ ] Log format is readable

### System Logs
```bash
journalctl -u nginx -f
journalctl -u pm2-root -f
```
- [ ] Services logging correctly
- [ ] No critical system errors
- [ ] Startup scripts working

## Documentation Review

- [ ] Read `QUICKSTART.md` - Quick reference
- [ ] Read `docs/VPS_AUTO_SETUP.md` - Complete guide
- [ ] Read `docs/DEPLOYMENT.md` - Deployment details
- [ ] Bookmark monitoring commands
- [ ] Save troubleshooting steps

## Backup & Recovery

### Create Initial Backup
```bash
ssh root@168.231.121.19
# Backup database
mysqldump -u psr_admin -p psr_v4_main > ~/psr_v4_backup_$(date +%Y%m%d).sql

# Backup application
tar -czf ~/psr_v4_app_backup_$(date +%Y%m%d).tar.gz /var/www/psr-v4
```
- [ ] Database backup created
- [ ] Application backup created
- [ ] Backups stored safely

### Test Backup Restoration (Optional)
- [ ] Create test database
- [ ] Restore backup to test database
- [ ] Verify data integrity

## Production Hardening (Recommended)

### Change Default Credentials
```bash
# SSH to VPS
mysql -u root -p
ALTER USER 'psr_admin'@'localhost' IDENTIFIED BY 'NewStrongPassword123!';
FLUSH PRIVILEGES;
```
- [ ] Database password changed
- [ ] `.env.production` updated with new password
- [ ] Application restarted: `pm2 restart psr-v4`
- [ ] Application still works with new password

### Setup SSH Key Authentication
```bash
# On local machine
ssh-keygen -t ed25519 -C "your_email@example.com"
ssh-copy-id root@168.231.121.19

# On VPS
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```
- [ ] SSH key generated
- [ ] Key copied to VPS
- [ ] Key-based login works
- [ ] Password authentication disabled (after testing!)

### Install Fail2Ban
```bash
ssh root@168.231.121.19
apt-get install fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```
- [ ] Fail2Ban installed
- [ ] Service running
- [ ] SSH jail active

### Setup Automatic Updates
```bash
apt-get install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```
- [ ] Unattended upgrades enabled
- [ ] Security updates automatic

### Regular Maintenance Schedule
- [ ] Weekly: Check logs for errors
- [ ] Weekly: Review PM2 status
- [ ] Monthly: Update system packages
- [ ] Monthly: Review SSL certificate expiry
- [ ] Monthly: Database backup
- [ ] Quarterly: Security audit
- [ ] Quarterly: Performance review

## Troubleshooting Reference

### Common Issues & Solutions

**Issue: App not accessible**
```bash
# Solution 1: Check PM2 status
pm2 status
pm2 restart psr-v4

# Solution 2: Check logs
pm2 logs psr-v4 --lines 100

# Solution 3: Rebuild
cd /var/www/psr-v4
npm run build
pm2 restart psr-v4
```

**Issue: 502 Bad Gateway**
```bash
# Solution: Restart services
systemctl restart nginx
pm2 restart psr-v4
```

**Issue: SSL not working**
```bash
# Solution: Renew certificate
certbot renew --force-renewal
systemctl reload nginx
```

**Issue: Database connection error**
```bash
# Solution: Check MySQL
systemctl status mysql
mysql -u psr_admin -p psr_v4_main
# Verify .env.production has correct credentials
```

**Issue: Firewall blocking**
```bash
# Solution: Check and fix firewall
ufw status verbose
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload
```

## Support Contacts

- **Documentation**: `docs/` directory
- **GitHub Issues**: Repository issues tab
- **Logs Location**: 
  - App: `/var/www/psr-v4/logs/`
  - PM2: `~/.pm2/logs/`
  - Nginx: `/var/log/nginx/`
  - System: `journalctl`

## Final Verification

Before considering deployment complete:

- [ ] All checkboxes in this document are checked
- [ ] Application accessible via HTTP (and HTTPS if configured)
- [ ] Login works with default credentials
- [ ] Auto-deployment tested and working
- [ ] Security measures in place
- [ ] Monitoring setup and understood
- [ ] Backup created
- [ ] Documentation reviewed
- [ ] Emergency contacts noted
- [ ] Recovery procedures understood

---

## Deployment Status

**Deployment Date**: ________________

**Deployed By**: ________________

**VPS IP**: ________________

**Domain** (if applicable): ________________

**SSL Configured**: ☐ Yes  ☐ No

**Auto-Deploy Active**: ☐ Yes  ☐ No

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**✅ Deployment Complete!** 

Your application is now live and production-ready. Remember to:
- Monitor logs regularly
- Keep secrets secure
- Perform regular backups
- Update dependencies
- Review security periodically
