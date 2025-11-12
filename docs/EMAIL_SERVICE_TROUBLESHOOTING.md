# Email Service Troubleshooting Guide

**Last Updated**: November 12, 2025  
**Issue**: OTP emails not sending after deployment to server

---

## 🔍 Root Cause Analysis

### **Environment Variable Naming Mismatch**

The email service was failing on production because of inconsistent environment variable naming between local development and production deployment.

#### **Local Development** (`.env.local`)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=online.poornasree@gmail.com
SMTP_PASSWORD=ktbc iqnm jozi jdaq
SMTP_SECURE=false
```

#### **Production Deployment** (`.env.production`)
```bash
EMAIL_HOST=smtp.gmail.com      # ❌ Mismatch: SMTP_HOST vs EMAIL_HOST
EMAIL_PORT=587                 # ❌ Mismatch: SMTP_PORT vs EMAIL_PORT
EMAIL_USER=***                 # ❌ Mismatch: SMTP_USERNAME vs EMAIL_USER
EMAIL_PASSWORD=***             # ❌ Mismatch: SMTP_PASSWORD vs EMAIL_PASSWORD
```

#### **Email Service Code**
```typescript
const emailConfig = {
  host: process.env.SMTP_HOST,      // ❌ Undefined in production
  port: parseInt(process.env.SMTP_PORT),  // ❌ Undefined in production
  auth: {
    user: process.env.SMTP_USERNAME,      // ❌ Undefined in production
    pass: process.env.SMTP_PASSWORD,      // ❌ Undefined in production
  },
};
```

**Result**: Email transporter configuration had `undefined` values in production, causing all email sends to fail silently.

---

## ✅ Solution Implemented

### **1. Updated Email Service** (`src/lib/emailService.ts`)

Added fallback logic to support both naming conventions:

```typescript
const emailConfig = {
  host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
  secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
  auth: {
    user: process.env.SMTP_USERNAME || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
  },
};
```

**Benefits**:
- ✅ Works in local development (SMTP_* variables)
- ✅ Works in production (EMAIL_* variables)
- ✅ Backward compatible with existing configurations
- ✅ No deployment workflow changes required

### **2. Updated Deployment Workflow** (`.github/workflows/deploy-vps.yml`)

Added both variable sets to `.env.production`:

```bash
# Email Configuration (Support both SMTP_* and EMAIL_* naming)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=${EMAIL_USER}
SMTP_PASSWORD=${EMAIL_PASSWORD}
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=${EMAIL_USER}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
```

**Benefits**:
- ✅ Ensures both naming conventions are available
- ✅ Future-proof for any code that uses either convention
- ✅ Clear documentation in deployment file

---

## 🔧 Verification Steps

### **1. Check Environment Variables on Server**

```bash
# SSH to VPS
ssh root@168.231.121.19

# Check .env.production file
cd /var/www/psr-v4
cat .env.production | grep -E "SMTP_|EMAIL_"
```

**Expected Output**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=online.poornasree@gmail.com
SMTP_PASSWORD=ktbc iqnm jozi jdaq
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=online.poornasree@gmail.com
EMAIL_PASSWORD=ktbc iqnm jozi jdaq
```

### **2. Check Email Service Logs**

```bash
# View PM2 logs
pm2 logs psr-v4 --lines 50

# Look for email configuration debug output
pm2 logs psr-v4 | grep "Email config debug"
```

**Expected Output**:
```
Email config debug: {
  to: 'user@example.com',
  from: 'online.poornasree@gmail.com',
  host: 'smtp.gmail.com',
  port: '587',
  hasPassword: true,
  secure: false
}
```

### **3. Test Email Sending**

```bash
# Test user registration with OTP
curl -X POST http://168.231.121.19/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "farmer",
    "companyName": "Test Company",
    "companyPincode": "560001",
    "companyCity": "Bangalore",
    "companyState": "Karnataka"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code."
}
```

---

## 🚨 Common Email Issues

### **Issue 1: "Authentication Failed" Error**

**Error Message**:
```
535-5.7.8 Username and Password not accepted
```

**Causes**:
1. ❌ Incorrect Gmail credentials
2. ❌ Using regular password instead of App Password
3. ❌ Less secure app access not enabled

**Solutions**:

#### **Create Gmail App Password** (Recommended)
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy 16-character password (no spaces)
6. Update GitHub Secret: `EMAIL_PASSWORD`

#### **Enable Less Secure Apps** (Not Recommended)
1. Go to https://myaccount.google.com/lesssecureapps
2. Turn on "Allow less secure apps"
3. Note: Google is phasing this out

### **Issue 2: Emails Not Sending (No Error)**

**Symptoms**:
- Registration succeeds
- No OTP email received
- No errors in logs

**Diagnosis Steps**:

```bash
# SSH to server
ssh root@168.231.121.19

# Check if SMTP variables are set
cd /var/www/psr-v4
node -e "console.log({
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USERNAME: process.env.SMTP_USERNAME ? 'SET' : 'NOT SET',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'SET' : 'NOT SET'
})"
```

**Solutions**:

1. **Verify GitHub Secrets are set**:
   ```
   - EMAIL_USER = online.poornasree@gmail.com
   - EMAIL_PASSWORD = ktbc iqnm jozi jdaq
   ```

2. **Redeploy to update .env.production**:
   ```bash
   git push origin master
   # Wait for GitHub Actions to complete
   ```

3. **Manually update .env.production**:
   ```bash
   ssh root@168.231.121.19
   cd /var/www/psr-v4
   nano .env.production
   # Add missing SMTP_* variables
   pm2 restart psr-v4
   ```

### **Issue 3: Connection Timeout**

**Error Message**:
```
ETIMEDOUT: Connection timeout
```

**Causes**:
- ❌ Firewall blocking port 587
- ❌ SMTP server unreachable
- ❌ Network issues

**Solutions**:

```bash
# Check if port 587 is accessible
telnet smtp.gmail.com 587

# If firewall issue, allow outbound on port 587
ufw allow out 587/tcp comment 'SMTP Gmail'

# Check if DNS resolves
nslookup smtp.gmail.com
```

### **Issue 4: "From" Address Rejected**

**Error Message**:
```
550 5.7.1 Client does not have permissions to send as this sender
```

**Cause**:
- ❌ Using different email in `from` field than authenticated account

**Solution**:

Ensure `from` address matches `SMTP_USERNAME`:

```typescript
// Email service should use authenticated email
from: `"Poornasree Equipments Cloud" <${process.env.SMTP_USERNAME || process.env.EMAIL_USER}>`
```

---

## 📋 Pre-Deployment Checklist

Before deploying, verify:

- [ ] GitHub Secrets are configured:
  - [ ] `EMAIL_USER` = `online.poornasree@gmail.com`
  - [ ] `EMAIL_PASSWORD` = Gmail App Password (16 chars)
- [ ] Gmail account has:
  - [ ] 2-Step Verification enabled
  - [ ] App Password generated for "Mail"
  - [ ] SMTP enabled (default for all Gmail accounts)
- [ ] Email service code uses fallback variables
- [ ] Deployment workflow sets both SMTP_* and EMAIL_* variables

---

## 🔄 Deployment Process

### **1. Update Code**

```bash
git add .
git commit -m "fix: email service environment variables"
git push origin master
```

### **2. GitHub Actions Workflow**

The deployment workflow will:
1. ✅ Build the application
2. ✅ Deploy to VPS
3. ✅ Create `.env.production` with EMAIL variables
4. ✅ Map EMAIL_USER → SMTP_USERNAME
5. ✅ Map EMAIL_PASSWORD → SMTP_PASSWORD
6. ✅ Restart PM2

### **3. Verify Deployment**

```bash
# Check GitHub Actions status
# https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/actions

# SSH to verify
ssh root@168.231.121.19
cd /var/www/psr-v4
pm2 logs psr-v4 --lines 20
```

### **4. Test Email Functionality**

1. Open application: `http://168.231.121.19`
2. Register new user
3. Check email for OTP
4. Verify OTP works

---

## 🛠️ Manual Fix (If Needed)

If deployment doesn't fix the issue, manually update on server:

```bash
# SSH to server
ssh root@168.231.121.19

# Navigate to app directory
cd /var/www/psr-v4

# Backup existing .env.production
cp .env.production .env.production.backup

# Update .env.production
cat >> .env.production << 'EOF'

# Email Configuration (SMTP Variables)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=online.poornasree@gmail.com
SMTP_PASSWORD=ktbc iqnm jozi jdaq
EOF

# Restart application
pm2 restart psr-v4

# Verify
pm2 logs psr-v4 --lines 20
```

---

## 📊 Monitoring Email Service

### **Check Email Sending Success Rate**

```bash
# View logs for email-related messages
pm2 logs psr-v4 | grep -E "Email|OTP|sendMail"

# Count successful email sends
pm2 logs psr-v4 --lines 1000 | grep "✅ OTP email sent successfully" | wc -l

# Count failed email sends
pm2 logs psr-v4 --lines 1000 | grep "⚠️ Email sending failed" | wc -l
```

### **Debug Email Configuration**

Add this endpoint to verify email config (temporary, remove in production):

```typescript
// In src/app/api/debug/email-config/route.ts
export async function GET() {
  return Response.json({
    smtp_host: process.env.SMTP_HOST || process.env.EMAIL_HOST,
    smtp_port: process.env.SMTP_PORT || process.env.EMAIL_PORT,
    smtp_username_set: !!(process.env.SMTP_USERNAME || process.env.EMAIL_USER),
    smtp_password_set: !!(process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD),
    smtp_secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
  });
}
```

---

## 🔐 Security Best Practices

### **1. Never Commit Credentials**

```bash
# Always in .gitignore
.env.local
.env.production
.env*.local
```

### **2. Use GitHub Secrets**

- ✅ Store credentials in GitHub Secrets
- ✅ Reference in workflows: `${{ secrets.EMAIL_USER }}`
- ✅ Never log passwords in scripts

### **3. Rotate Credentials Regularly**

1. Generate new Gmail App Password monthly
2. Update GitHub Secret: `EMAIL_PASSWORD`
3. Redeploy application

### **4. Monitor Email Usage**

- Check Gmail sent folder regularly
- Monitor for unauthorized sends
- Review email logs for suspicious activity

---

## 📞 Support

If email issues persist:

1. **Check Gmail Account**:
   - Verify credentials work: https://mail.google.com
   - Check security alerts: https://myaccount.google.com/security

2. **Review Logs**:
   ```bash
   pm2 logs psr-v4 --lines 100 > email-logs.txt
   ```

3. **Contact Support**:
   - Email: support@poornasreeequipments.com
   - Include: error logs, timestamp, affected email addresses

---

## ✅ Success Criteria

Email service is working correctly when:

- ✅ OTP emails arrive within 1 minute
- ✅ No errors in PM2 logs
- ✅ All email types send successfully:
  - Registration OTP
  - Welcome emails
  - Password reset
  - Admin approval notifications
- ✅ Email config debug shows all values set
- ✅ "From" address is correct Gmail account

---

## 📚 Related Documentation

- [Email Service Implementation](./04-features/EMAIL_VALIDATION_AND_STATUS_SYSTEM.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)
- [Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md)
