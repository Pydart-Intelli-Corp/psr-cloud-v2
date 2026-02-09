# Domain Configuration Guide - v4.poornasreecloud.com

Complete guide to configure your custom domain for PSR Cloud V2.

---

## 📋 Prerequisites

- Domain: v4.poornasreecloud.com
- DNS A record pointing to: 168.231.121.19
- Server access: root@168.231.121.19
- Application running on port 3000

---

## 🚀 Quick Setup (Automated)

### From Windows PowerShell:

```powershell
# Upload domain configuration script
scp P:\psr-cloud-v2\deploy\configure-domain.sh root@168.231.121.19:/root/

# Connect to server
ssh root@168.231.121.19

# Make script executable
chmod +x /root/configure-domain.sh

# Run the script
bash /root/configure-domain.sh
```

**The script will:**

1. ✅ Check DNS configuration
2. ✅ Update Nginx to accept domain name
3. ✅ Update environment variables with domain URLs
4. ✅ Install Let's Encrypt SSL certificate
5. ✅ Enable HTTPS with auto-redirect
6. ✅ Rebuild and restart application
7. ✅ Setup SSL auto-renewal

**You will be prompted for:**
- Email address for SSL certificate notifications (use: info.pydart@gmail.com)

⏱️ **Total Time: ~5 minutes**

---

## 🔧 Manual Setup (Step by Step)

If you prefer manual configuration:

### Step 1: Verify DNS

Check if domain points to your server:

```bash
host v4.poornasreecloud.com
# Should return: v4.poornasreecloud.com has address 168.231.121.19
```

If not working, add DNS A record:
- **Type:** A
- **Name:** v4
- **Value:** 168.231.121.19
- **TTL:** 3600

### Step 2: Update Nginx Configuration

```bash
nano /etc/nginx/sites-available/psr-v4
```

Update server_name line:

```nginx
server {
    listen 80;
    server_name v4.poornasreecloud.com 168.231.121.19;
    # ... rest of config
}
```

Test and reload:

```bash
nginx -t
systemctl reload nginx
```

### Step 3: Update Environment Variables

```bash
cd /var/www/psr-v4
nano .env
```

Update these lines:

```env
NEXT_PUBLIC_APP_URL=http://v4.poornasreecloud.com
CLIENT_URL=http://v4.poornasreecloud.com
```

### Step 4: Install SSL Certificate

```bash
# Install Certbot
apt update -y
apt install -y certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d v4.poornasreecloud.com --email info.pydart@gmail.com --agree-tos --redirect
```

Certbot will:
- Obtain SSL certificate from Let's Encrypt
- Update Nginx configuration automatically
- Setup auto-redirect from HTTP to HTTPS

Update .env with HTTPS:

```bash
cd /var/www/psr-v4
nano .env
```

Change:

```env
NEXT_PUBLIC_APP_URL=https://v4.poornasreecloud.com
CLIENT_URL=https://v4.poornasreecloud.com
```

### Step 5: Rebuild and Restart

```bash
cd /var/www/psr-v4

# Rebuild application
npm run build

# Restart PM2
pm2 restart psr-v4
pm2 save
```

---

## ✅ Verification

### Test HTTP (if SSL not yet configured)

```bash
curl -I http://v4.poornasreecloud.com
```

### Test HTTPS (after SSL configured)

```bash
curl -I https://v4.poornasreecloud.com
```

### Test in Browser

Open: **https://v4.poornasreecloud.com**

You should see:
- ✅ PSR Cloud V2 login page
- ✅ Green padlock (SSL secure)
- ✅ No certificate warnings

### Login

**Super Admin Credentials:**
- Username: `admin`
- Password: `psr@2025`

---

## 🔄 SSL Certificate Auto-Renewal

Certbot automatically configures renewal. Check status:

```bash
# Check certificates
certbot certificates

# Test renewal process
certbot renew --dry-run

# Check renewal timer
systemctl status certbot.timer
```

Certificates auto-renew every 60 days.

---

## 🐛 Troubleshooting

### Domain Not Resolving

```bash
# Check DNS
host v4.poornasreecloud.com
nslookup v4.poornasreecloud.com

# If not resolving:
# 1. Verify A record in domain registrar
# 2. Wait for DNS propagation (up to 24 hours)
# 3. Try from different location/network
```

### SSL Certificate Failed

```bash
# Check if port 80 is accessible
curl -I http://v4.poornasreecloud.com

# Check firewall
ufw status

# Ensure port 80 is open
ufw allow 80/tcp

# Try again
certbot --nginx -d v4.poornasreecloud.com --email info.pydart@gmail.com --agree-tos --redirect
```

### Application Not Loading

```bash
# Check PM2
pm2 status
pm2 logs psr-v4

# Check Nginx
nginx -t
systemctl status nginx

# Check if port 3000 is running
curl http://localhost:3000

# Restart everything
pm2 restart psr-v4
systemctl restart nginx
```

### Mixed Content Warnings

If you see warnings about HTTP content on HTTPS page:

1. Check .env has HTTPS URLs:
   ```bash
   grep "APP_URL" /var/www/psr-v4/.env
   ```

2. Rebuild:
   ```bash
   cd /var/www/psr-v4
   npm run build
   pm2 restart psr-v4
   ```

---

## 📝 DNS Configuration Details

### For Domain Registrar (Hostinger/GoDaddy/Namecheap)

Add these DNS records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | v4 | 168.231.121.19 | 3600 |

Optional: Add www subdomain redirect
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | v4.poornasreecloud.com | 3600 |

---

## 🔒 Security Best Practices

After domain configuration:

- ✅ SSL certificate with HTTPS
- ✅ Auto-redirect HTTP to HTTPS
- ✅ Strong SSL configuration (A+ rating)
- ✅ HSTS headers enabled by Certbot
- ✅ Certificate auto-renewal configured

### Check SSL Rating

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=v4.poornasreecloud.com

Expected rating: **A or A+**

---

## 📞 Quick Reference

**Domain:** v4.poornasreecloud.com  
**Server IP:** 168.231.121.19  
**HTTPS URL:** https://v4.poornasreecloud.com  
**HTTP URL:** http://v4.poornasreecloud.com  
**Super Admin:** admin / psr@2025  

**SSL Email:** info.pydart@gmail.com  
**Certificate:** Let's Encrypt (90-day validity, auto-renews)  
**Renewal Check:** `certbot renew --dry-run`  

---

## 🌐 Multiple Domain Support

If you want to add more domains (e.g., app.poornasreecloud.com):

```bash
# Update Nginx
nano /etc/nginx/sites-available/psr-v4
# Add to server_name: v4.poornasreecloud.com app.poornasreecloud.com

# Add SSL for new domain
certbot --nginx -d app.poornasreecloud.com --email info.pydart@gmail.com --agree-tos

# Reload
nginx -t && systemctl reload nginx
```

---

**Setup Complete!** 🎉

Your application is now accessible at: **https://v4.poornasreecloud.com**
