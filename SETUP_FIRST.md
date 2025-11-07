# ⚠️ IMPORTANT: Setup Required Before Deployment

## Current Issue

The deployment workflow failed because **GitHub Secrets are not configured yet**. This is expected on first use.

## Error You're Seeing

```
dial tcp: lookup ***: no such host
```

This means the workflow can't find the VPS host because `VPS_HOST` secret is empty or not set.

## ✅ Solution: Add GitHub Secrets (2 minutes)

### Step 1: Navigate to Secrets Page

Click this link (replace with your repository if different):
```
https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/secrets/actions
```

Or manually:
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add These 5 Secrets

Add each secret one by one by clicking "New repository secret":

#### 1. VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: `168.231.121.19` (your VPS IP address)

#### 2. VPS_USERNAME
- **Name**: `VPS_USERNAME`
- **Value**: `root` (or your SSH username)

#### 3. VPS_PASSWORD
- **Name**: `VPS_PASSWORD`
- **Value**: Your VPS SSH password (e.g., `,8n1IlYWf?-hz@Ti9LtN`)

#### 4. EMAIL_USER
- **Name**: `EMAIL_USER`
- **Value**: Your Gmail address (e.g., `noreply@gmail.com`)

#### 5. EMAIL_PASSWORD
- **Name**: `EMAIL_PASSWORD`
- **Value**: Your Gmail app password (16 characters, no spaces)

> **Gmail App Password**: 
> 1. Go to https://myaccount.google.com/security
> 2. Enable 2-Step Verification
> 3. Go to App passwords
> 4. Generate new app password for "Mail"
> 5. Copy the 16-character password

### Step 3: Verify Secrets (Optional)

Run the "Verify GitHub Secrets" workflow to check if all secrets are configured correctly:

1. Go to **Actions** tab
2. Select **Verify GitHub Secrets**
3. Click **Run workflow**
4. Click green **Run workflow** button

This will tell you which secrets are missing or if everything is ready.

### Step 4: Run Initial Setup

Once all secrets are added:

1. Go to **Actions** tab
2. Select **Setup VPS Environment**
3. Click **Run workflow**
4. (Optional) Enter domain and email for SSL/HTTPS
5. Click green **Run workflow** button
6. Wait ~10 minutes for completion

## ⚠️ DO NOT Push to Master Until Setup Complete

The automatic deployment on push will fail until:
1. ✅ All 5 secrets are added
2. ✅ Initial VPS setup workflow has completed successfully

After initial setup completes, every push to master will automatically deploy.

## 🔍 How to Check if Secrets Are Added

### Method 1: GitHub UI
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. You should see 5 secrets listed:
   - EMAIL_PASSWORD
   - EMAIL_USER
   - VPS_HOST
   - VPS_PASSWORD
   - VPS_USERNAME

### Method 2: Run Verify Workflow
1. Go to **Actions** tab
2. Run **Verify GitHub Secrets** workflow
3. Check the output - should show 5 green checkmarks

## 📋 Checklist

Before running setup:

- [ ] VPS_HOST secret added
- [ ] VPS_USERNAME secret added
- [ ] VPS_PASSWORD secret added
- [ ] EMAIL_USER secret added
- [ ] EMAIL_PASSWORD secret added
- [ ] All 5 secrets visible in repository settings
- [ ] (Optional) Verify Secrets workflow shows all green

Ready to proceed:

- [ ] Go to Actions → Setup VPS Environment
- [ ] Run workflow with optional domain/email
- [ ] Wait for completion (~10 minutes)
- [ ] Access application at http://YOUR_VPS_IP

## 📚 Detailed Documentation

- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Complete Guide**: [docs/VPS_AUTO_SETUP.md](docs/VPS_AUTO_SETUP.md)
- **Secrets Setup**: [docs/GITHUB_SECRETS_SETUP.md](docs/GITHUB_SECRETS_SETUP.md)
- **Checklist**: [docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)

## 🆘 Still Having Issues?

### Deployment workflow keeps failing
- **Cause**: Secrets not configured
- **Fix**: Add all 5 secrets as described above

### "no such host" error
- **Cause**: VPS_HOST is empty or incorrect
- **Fix**: Check VPS_HOST secret has correct IP (e.g., 168.231.121.19)

### "permission denied" error
- **Cause**: Wrong SSH credentials
- **Fix**: Verify VPS_USERNAME and VPS_PASSWORD are correct

### Email sending fails later
- **Cause**: EMAIL_USER or EMAIL_PASSWORD incorrect
- **Fix**: Generate new Gmail app password and update secret

---

**Next Step**: Add the 5 GitHub secrets, then run "Setup VPS Environment" workflow! 🚀
