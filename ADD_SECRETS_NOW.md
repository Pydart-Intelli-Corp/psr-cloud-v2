# 🚨 DEPLOYMENT FAILING? ADD SECRETS NOW! 🚨

## Current Status: ❌ Deployment Failed

**Error**: `dial tcp: lookup ***: no such host`

**Why**: GitHub Secrets are **NOT CONFIGURED** in your repository.

---

## ✅ IMMEDIATE FIX (2 Minutes)

### Step 1: Click This Link NOW

**Direct Link to Add Secrets:**
```
https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/secrets/actions
```

**Or Navigate Manually:**
1. Go to https://github.com/Pydart-Intelli-Corp/psr-cloud-v2
2. Click **"Settings"** tab (top menu)
3. Click **"Secrets and variables"** (left sidebar)
4. Click **"Actions"**
5. Click **"New repository secret"** button

---

### Step 2: Add These 5 Secrets (One by One)

#### Secret 1: VPS_HOST
1. Click **"New repository secret"**
2. Name: `VPS_HOST`
3. Value: `168.231.121.19`
4. Click **"Add secret"**

#### Secret 2: VPS_USERNAME
1. Click **"New repository secret"**
2. Name: `VPS_USERNAME`
3. Value: `root`
4. Click **"Add secret"**

#### Secret 3: VPS_PASSWORD
1. Click **"New repository secret"**
2. Name: `VPS_PASSWORD`
3. Value: `,8n1IlYWf?-hz@Ti9LtN` (your actual VPS password)
4. Click **"Add secret"**

#### Secret 4: EMAIL_USER
1. Click **"New repository secret"**
2. Name: `EMAIL_USER`
3. Value: Your Gmail address (e.g., `noreply@gmail.com`)
4. Click **"Add secret"**

#### Secret 5: EMAIL_PASSWORD
1. Click **"New repository secret"**
2. Name: `EMAIL_PASSWORD`
3. Value: Your Gmail app password (16 chars, no spaces)
4. Click **"Add secret"**

> **Need Gmail App Password?**
> 1. Go to: https://myaccount.google.com/apppasswords
> 2. Select "Mail" and "Other (Custom name)"
> 3. Enter "PSR-V4 Application"
> 4. Click "Generate"
> 5. Copy the 16-character password (remove spaces)

---

### Step 3: Verify Secrets Are Added

After adding all 5 secrets, you should see them listed:

```
Repository secrets for Pydart-Intelli-Corp/psr-cloud-v2

✓ EMAIL_PASSWORD        Updated XX seconds ago
✓ EMAIL_USER            Updated XX seconds ago  
✓ VPS_HOST              Updated XX seconds ago
✓ VPS_PASSWORD          Updated XX seconds ago
✓ VPS_USERNAME          Updated XX seconds ago
```

---

### Step 4: Stop Auto-Deployments (Temporarily)

**IMPORTANT**: The workflow runs automatically on every push to master, but it will keep failing until you complete the initial VPS setup.

**To prevent repeated failures:**

#### Option A: Don't push to master until setup is complete
Just don't commit/push anything until after Step 5 completes.

#### Option B: Temporarily disable the auto-deploy workflow
1. Go to: `.github/workflows/deploy-vps.yml`
2. Comment out the `push:` trigger temporarily:

```yaml
on:
  # push:              # TEMPORARILY DISABLED
  #   branches:        # TEMPORARILY DISABLED  
  #     - master       # TEMPORARILY DISABLED
  workflow_dispatch:   # Manual only for now
```

You can re-enable it after initial setup completes.

---

### Step 5: Run Initial VPS Setup (ONE TIME ONLY)

**After all 5 secrets are added:**

1. Go to **Actions** tab: https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/actions
2. Click **"Setup VPS Environment"** (left sidebar)
3. Click **"Run workflow"** dropdown button (right side)
4. **Domain** (optional): Leave empty for now, or enter your domain
5. **Email** (optional): Required only if domain provided
6. Click green **"Run workflow"** button
7. **Wait ~10 minutes** - Watch the progress

This workflow will:
- ✅ Install Node.js, PM2, Nginx on VPS
- ✅ Configure firewall (ports 80/443)
- ✅ Setup reverse proxy
- ✅ Clone your repository
- ✅ Build application
- ✅ Run migrations
- ✅ Start with PM2

---

### Step 6: After Setup Completes

**Once the "Setup VPS Environment" workflow shows SUCCESS:**

1. **Re-enable auto-deploy** (if you disabled it in Option B above)
2. **Test deployment**: Make a small change and push to master
3. **Auto-deploy should now work!** ✅

---

## 🔍 How to Check if Secrets Are Configured

### Visual Check (GitHub UI)
Go to: https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/secrets/actions

You should see **5 secrets** listed with green checkmarks.

### Automated Check (Workflow)
1. Go to: https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/actions
2. Select **"Verify GitHub Secrets"** workflow
3. Click **"Run workflow"**
4. Check output - should show 5 ✅ checkmarks

---

## 📋 Complete Checklist

- [ ] **Step 1**: Navigate to repository secrets page
- [ ] **Step 2**: Add `VPS_HOST` = `168.231.121.19`
- [ ] **Step 2**: Add `VPS_USERNAME` = `root`
- [ ] **Step 2**: Add `VPS_PASSWORD` = your VPS password
- [ ] **Step 2**: Add `EMAIL_USER` = your Gmail
- [ ] **Step 2**: Add `EMAIL_PASSWORD` = Gmail app password
- [ ] **Step 3**: Verify all 5 secrets show in list
- [ ] **Step 4**: (Optional) Disable auto-deploy temporarily
- [ ] **Step 5**: Run "Setup VPS Environment" workflow
- [ ] **Step 5**: Wait for completion (~10 minutes)
- [ ] **Step 6**: Re-enable auto-deploy (if disabled)
- [ ] **Step 6**: Test by pushing to master

---

## 🆘 Common Issues

### "I don't see the Settings tab"
**Solution**: You need admin/owner access to the repository. Contact the repository owner.

### "Secrets page is empty"
**Solution**: You're in the right place! Click "New repository secret" to add the first one.

### "Which Gmail should I use?"
**Solution**: Any Gmail account that can send emails. Create a new one if needed (e.g., `noreply.psr@gmail.com`).

### "Where do I get VPS_PASSWORD?"
**Solution**: This is the SSH password for your VPS server. If you don't have it, contact your VPS provider to reset it.

### "Deployment still failing after adding secrets"
**Solution**: You must run "Setup VPS Environment" workflow FIRST (one time). Auto-deploy will fail until initial setup completes.

### "Setup VPS Environment workflow also failed"
**Solution**: 
1. Check that all 5 secrets are actually added (not just attempted)
2. Verify VPS IP is correct (`168.231.121.19`)
3. Verify VPS username is correct (`root`)
4. Verify VPS password is correct (try SSH manually: `ssh root@168.231.121.19`)

---

## 📞 Need Help?

1. **Check workflow logs**: Click on the failed run, then click on each step to see error details
2. **Verify SSH access**: Try `ssh root@168.231.121.19` from your local machine
3. **Double-check secrets**: All 5 must be present with correct values
4. **Read full guide**: [SETUP_FIRST.md](SETUP_FIRST.md)

---

## ⚡ TL;DR (Too Long, Didn't Read)

```
1. Go to: https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/secrets/actions
2. Add 5 secrets (VPS_HOST, VPS_USERNAME, VPS_PASSWORD, EMAIL_USER, EMAIL_PASSWORD)
3. Go to: https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/actions
4. Run "Setup VPS Environment" workflow
5. Wait 10 minutes
6. Done! Auto-deploy now works.
```

---

**🚀 Once you complete these steps, deployments will work automatically on every push!**
