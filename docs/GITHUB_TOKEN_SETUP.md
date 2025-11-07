# GitHub Token Setup for VPS Deployment

## Overview
The deployment workflow needs to pull code from GitHub to your VPS. By default, it uses the built-in `GITHUB_TOKEN`, which has limited permissions. If you encounter authentication issues, you'll need to create a Personal Access Token (PAT).

## When Do You Need This?
- ✅ **Usually NOT needed** - The built-in `GITHUB_TOKEN` works for most cases
- ⚠️ **You need this if**:
  - Deployment fails with "authentication failed" errors
  - The repository is in a different organization
  - You need access to other private repositories

## Quick Setup (If Needed)

### Step 1: Create Personal Access Token

1. Go to GitHub Settings:
   - Click your profile picture (top-right)
   - Click **Settings**
   - Click **Developer settings** (bottom-left)
   - Click **Personal access tokens**
   - Click **Tokens (classic)**

2. Generate New Token:
   - Click **Generate new token** → **Generate new token (classic)**
   - **Note**: `VPS Deployment for psr-cloud-v2`
   - **Expiration**: Choose duration (90 days or custom)
   - **Select scopes**:
     - ✅ `repo` (Full control of private repositories)
   
3. Generate and Copy:
   - Click **Generate token**
   - ⚠️ **IMPORTANT**: Copy the token immediately (you won't see it again!)
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Token to GitHub Secrets

1. Go to Repository Settings:
   ```
   https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/secrets/actions
   ```

2. Add New Secret:
   - Click **New repository secret**
   - **Name**: `GH_PAT`
   - **Secret**: Paste your token (the `ghp_xxx...` value)
   - Click **Add secret**

### Step 3: Verify

1. The secret should now appear in the list:
   - ✅ `GH_PAT` (updated X seconds ago)

2. Next deployment will use this token automatically

## How It Works

The deployment workflow now:

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GH_PAT || secrets.GITHUB_TOKEN }}
```

This means:
1. **First**: Try to use `GH_PAT` if it exists (your personal token)
2. **Fallback**: Use `GITHUB_TOKEN` (built-in token)

On the VPS, Git operations use this token:
```bash
git remote set-url origin https://x-access-token:${GITHUB_TOKEN}@github.com/Pydart-Intelli-Corp/psr-cloud-v2.git
```

## Troubleshooting

### Error: "authentication failed"
**Solution**: Create and add `GH_PAT` secret (see above)

### Error: "bad credentials"
**Causes**:
- Token has expired
- Token was deleted
- Wrong token copied

**Solution**: 
1. Delete old token in GitHub Settings
2. Create new token
3. Update `GH_PAT` secret with new token

### Error: "Resource not accessible by integration"
**Cause**: `GITHUB_TOKEN` doesn't have sufficient permissions

**Solution**: Must use `GH_PAT` instead (built-in token won't work)

### Token Expired
**What happens**:
- Deployment will start failing with authentication errors
- GitHub will email you before expiration

**Solution**:
1. Create new token (same steps as above)
2. Update `GH_PAT` secret with new token
3. Next deployment will work

## Security Best Practices

### ✅ DO:
- Use token with minimal required permissions (just `repo`)
- Set reasonable expiration (90 days)
- Rotate tokens regularly
- Delete tokens you're not using

### ❌ DON'T:
- Share your token with anyone
- Commit token to code
- Use tokens with unnecessary permissions
- Create tokens that never expire

## Token Scopes Explained

For VPS deployment, you only need:

| Scope | Why Needed | Required |
|-------|-----------|----------|
| `repo` | Full control of private repositories | ✅ YES |
| | - Read code | |
| | - Access commit history | |
| | - Clone/pull repositories | |

**No other scopes needed** - Keep it minimal for security!

## Alternative: Deploy Keys (Advanced)

Instead of a PAT, you can use SSH deploy keys:

### Pros:
- More secure (repository-specific)
- No expiration
- Doesn't count against personal token limits

### Cons:
- More complex setup
- Requires SSH key generation
- Needs VPS SSH configuration

### Setup Steps:
1. On VPS, generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "deploy@psr-v4" -f ~/.ssh/psr_deploy
   ```

2. Add public key to GitHub:
   - Go to: `https://github.com/Pydart-Intelli-Corp/psr-cloud-v2/settings/keys`
   - Click **Add deploy key**
   - Paste contents of `~/.ssh/psr_deploy.pub`
   - ✅ Allow write access (if needed)

3. Update remote URL on VPS:
   ```bash
   cd /var/www/psr-v4
   git remote set-url origin git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git
   ```

4. Test:
   ```bash
   ssh -T git@github.com
   # Should see: "Hi Pydart-Intelli-Corp/psr-cloud-v2! You've successfully authenticated"
   ```

## Summary

**For most users**: Just use the built-in `GITHUB_TOKEN` (no setup needed!)

**If you encounter issues**: Create `GH_PAT` secret (5-minute setup)

**For advanced security**: Use SSH deploy keys (complex but most secure)

---

**Need Help?**
- Check deployment logs in GitHub Actions
- Review error messages carefully
- See main documentation: `QUICKSTART.md`
