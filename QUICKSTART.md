# 🚀 Quick Start: Automated VPS Deployment

Complete VPS setup in 3 steps - ports 80/443 configured automatically!

## Prerequisites

- VPS with Ubuntu 20.04+
- GitHub repository access
- 10 minutes

## Step 1: Add GitHub Secrets (2 minutes)

Go to: `https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/secrets/actions`

Add 5 secrets (required):

| Secret Name | Value | Example |
|------------|-------|---------|
| `VPS_HOST` | Your VPS IP | `168.231.121.19` |
| `VPS_USERNAME` | SSH username | `root` |
| `VPS_PASSWORD` | SSH password | `your-secure-password` |
| `EMAIL_USER` | Gmail address | `noreply@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | `abcd efgh ijkl mnop` |

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App passwords

### Optional: GitHub Personal Access Token

**Usually not needed** - The built-in token works for most cases.

**Add this if deployment fails with authentication errors:**

| Secret Name | Value | When Needed |
|------------|-------|-------------|
| `GH_PAT` | Personal Access Token | Repository in different org, or authentication errors |

See detailed setup: [`docs/GITHUB_TOKEN_SETUP.md`](docs/GITHUB_TOKEN_SETUP.md)

## Step 2: Run Automated Setup (8 minutes)

1. Go to **Actions** tab
2. Select **Setup VPS Environment** workflow
3. Click **Run workflow** dropdown
4. Fill in (optional):
   - **Domain**: `yourdomain.com` (leave empty for IP-only)
   - **Email**: `admin@yourdomain.com` (required if domain provided)
5. Click green **Run workflow** button

⏳ **Wait 5-10 minutes** - Watch the progress in real-time!

### What's Being Installed:
- ✅ Node.js 21.x + npm
- ✅ PM2 process manager
- ✅ Nginx web server
- ✅ UFW firewall (ports 22, 80, 443)
- ✅ SSL certificate (if domain provided)
- ✅ Your application (built & running)

## Step 3: Verify & Access (1 minute)

### Check Status
```bash
ssh root@168.231.121.19
pm2 status
```

### Access Application

**Without Domain (HTTP only):**
```
http://168.231.121.19
```

**With Domain (HTTPS):**
```
https://yourdomain.com
```

### Login Credentials
```
Email: admin@poornasreeequipments.com
Password: psr@2025
```

## 🎉 Done! 

### Automatic Deployments

Every push to `master` branch now automatically:
1. Builds your app
2. Runs migrations
3. Deploys to VPS
4. Restarts with zero downtime

### Common Commands

```bash
# View logs
ssh root@168.231.121.19 'pm2 logs psr-v4'

# Restart app
ssh root@168.231.121.19 'pm2 restart psr-v4'

# Check Nginx
ssh root@168.231.121.19 'systemctl status nginx'

# View firewall
ssh root@168.231.121.19 'ufw status'
```

## 🔧 Troubleshooting

### App Not Accessible?

1. Check PM2 status:
   ```bash
   ssh root@168.231.121.19 'pm2 status'
   ```

2. Check logs:
   ```bash
   ssh root@168.231.121.19 'pm2 logs psr-v4 --lines 50'
   ```

3. Restart:
   ```bash
   ssh root@168.231.121.19 'pm2 restart psr-v4'
   ```

### SSL Not Working?

```bash
ssh root@168.231.121.19
certbot certificates
certbot renew --dry-run
```

### Need to Re-run Setup?

Just run the **Setup VPS Environment** workflow again - it's idempotent!

## 📚 Full Documentation

- **Complete Guide**: `docs/VPS_AUTO_SETUP.md`
- **Deployment Workflow**: `docs/DEPLOYMENT.md`
- **GitHub Secrets**: `docs/GITHUB_SECRETS_SETUP.md`

---

**Total Time: ~10 minutes**  
**Manual Steps: 0** (after initial setup)  
**Ports Configured: 22, 80, 443**  
**SSL: Automatic** (with domain)  
**Auto-Deploy: Enabled** ✅
