# Deployment Workflow Order

This document shows the correct order of operations for first-time deployment.

## 📊 Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRST TIME SETUP                          │
└─────────────────────────────────────────────────────────────┘

Step 1: Add GitHub Secrets (Required)
┌─────────────────────────────────────┐
│  Settings → Secrets → Actions       │
│                                     │
│  Add 5 secrets:                     │
│  ✓ VPS_HOST                        │
│  ✓ VPS_USERNAME                    │
│  ✓ VPS_PASSWORD                    │
│  ✓ EMAIL_USER                      │
│  ✓ EMAIL_PASSWORD                  │
└─────────────────────────────────────┘
           ↓
Step 2: Verify Secrets (Optional but Recommended)
┌─────────────────────────────────────┐
│  Actions → Verify GitHub Secrets    │
│                                     │
│  Click "Run workflow"               │
│  ✓ Checks all 5 secrets            │
│  ✓ Tests VPS connectivity          │
└─────────────────────────────────────┘
           ↓
Step 3: Initial VPS Setup (One-time, ~10 min)
┌─────────────────────────────────────┐
│  Actions → Setup VPS Environment    │
│                                     │
│  Click "Run workflow"               │
│  Enter domain (optional)            │
│  Enter email (if domain provided)   │
│                                     │
│  Installs & Configures:             │
│  ✓ Node.js, PM2, Nginx             │
│  ✓ Firewall (ports 80/443)         │
│  ✓ SSL certificate (optional)      │
│  ✓ Application deployment          │
│  ✓ Database migrations             │
└─────────────────────────────────────┘
           ↓
Step 4: Access Application
┌─────────────────────────────────────┐
│  Open browser:                      │
│  http://YOUR_VPS_IP                 │
│  or                                 │
│  https://YOUR_DOMAIN (if SSL)       │
│                                     │
│  Login:                             │
│  admin@poornasreeequipments.com     │
│  psr@2025                           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────────────┐
│              AUTOMATIC DEPLOYMENTS (FROM NOW ON)             │
└─────────────────────────────────────────────────────────────┘

Every Push to Master:
┌─────────────────────────────────────┐
│  git push origin master             │
└─────────────────────────────────────┘
           ↓
Automatic Deployment Workflow:
┌─────────────────────────────────────┐
│  GitHub Actions automatically:      │
│  1. Verifies secrets                │
│  2. Checks out code                 │
│  3. Builds application              │
│  4. Deploys to VPS via SSH          │
│  5. Pulls latest code on VPS        │
│  6. Installs dependencies           │
│  7. Rebuilds on VPS                 │
│  8. Runs migrations                 │
│  9. Reloads Nginx                   │
│  10. Restarts app (PM2)             │
│                                     │
│  ✓ Zero manual intervention         │
│  ✓ Zero downtime                    │
└─────────────────────────────────────┘
```

## 🚫 Common Mistakes

### ❌ WRONG: Pushing Before Setup
```
git push origin master
   ↓
❌ Deployment fails (no secrets configured)
❌ Error: "dial tcp: lookup ***: no such host"
```

### ✅ CORRECT: Setup First, Then Push
```
1. Add GitHub Secrets
   ↓
2. Run "Setup VPS Environment" workflow
   ↓
3. Wait for completion (~10 min)
   ↓
4. Now push to master
   ↓
✅ Automatic deployment succeeds!
```

## 📋 Checklist Format

Use this checklist for first-time setup:

```
First Time Setup:
├─ [ ] Read SETUP_FIRST.md
├─ [ ] Add VPS_HOST secret
├─ [ ] Add VPS_USERNAME secret
├─ [ ] Add VPS_PASSWORD secret
├─ [ ] Add EMAIL_USER secret
├─ [ ] Add EMAIL_PASSWORD secret
├─ [ ] (Optional) Run "Verify GitHub Secrets" workflow
├─ [ ] Run "Setup VPS Environment" workflow
├─ [ ] Wait for workflow completion
├─ [ ] Access application in browser
└─ [ ] Verify login works

Ready for Auto-Deploy:
├─ [ ] Make code changes
├─ [ ] Commit changes
├─ [ ] Push to master
├─ [ ] GitHub Actions auto-deploys
└─ [ ] Verify deployment succeeded
```

## 🔄 Workflow Files

### Available Workflows

1. **verify-secrets.yml** (Optional, recommended first)
   - Purpose: Check if secrets are configured
   - When: Before running setup
   - Trigger: Manual only
   - Duration: ~10 seconds

2. **setup-vps.yml** (Required once)
   - Purpose: Initial VPS configuration
   - When: After adding secrets
   - Trigger: Manual only
   - Duration: ~10 minutes
   - Required: All 5 secrets must be added first

3. **deploy-vps.yml** (Automatic after setup)
   - Purpose: Deploy application updates
   - When: Every push to master
   - Trigger: Automatic on push, or manual
   - Duration: ~3 minutes
   - Required: Initial setup must be complete

## 📖 Documentation Order

Read documentation in this order:

1. **SETUP_FIRST.md** ← Start here if deployment fails
2. **QUICKSTART.md** ← Quick 3-step guide
3. **docs/GITHUB_SECRETS_SETUP.md** ← Detailed secrets help
4. **docs/VPS_AUTO_SETUP.md** ← Complete reference
5. **docs/DEPLOYMENT_CHECKLIST.md** ← Verification checklist

## 🆘 Troubleshooting Decision Tree

```
Is deployment failing?
├─ YES → Are GitHub secrets configured?
│        ├─ NO → Read SETUP_FIRST.md, add secrets
│        └─ YES → Has initial setup workflow completed?
│                 ├─ NO → Run "Setup VPS Environment" workflow
│                 └─ YES → Check workflow logs for specific error
└─ NO → Everything working! ✅
```

## 🎯 Quick Reference

| Situation | Action | Documentation |
|-----------|--------|---------------|
| First time deploying | Read SETUP_FIRST.md | [SETUP_FIRST.md](SETUP_FIRST.md) |
| Adding secrets | Step-by-step guide | [docs/GITHUB_SECRETS_SETUP.md](docs/GITHUB_SECRETS_SETUP.md) |
| Quick deployment | 3-step process | [QUICKSTART.md](QUICKSTART.md) |
| Checking secrets | Run verify workflow | Actions → Verify GitHub Secrets |
| Initial VPS setup | Run setup workflow | Actions → Setup VPS Environment |
| Deployment failing | Check secrets first | [SETUP_FIRST.md](SETUP_FIRST.md) |
| Everything working | Just push to master | Auto-deployment active ✅ |

---

**Remember**: Setup is one-time. After initial setup completes, just push to master and everything deploys automatically! 🚀
