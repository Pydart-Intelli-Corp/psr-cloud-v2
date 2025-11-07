# GitHub Actions Secrets Setup

## 🔐 Required Secrets for Deployment

Before GitHub Actions can deploy to your VPS, you need to add these secrets to your GitHub repository.

---

## Step-by-Step Instructions

### 1. Navigate to Repository Settings

1. Go to your GitHub repository: **https://github.com/Pydart-Intelli-Corp/psr-cloud-v2**
2. Click on **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables**
4. Click **Actions**

### 2. Add Secrets

Click the **New repository secret** button for each of the following:

#### Secret 1: VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: `168.231.121.19`
- Click **Add secret**

#### Secret 2: VPS_USERNAME
- **Name**: `VPS_USERNAME`
- **Value**: `root`
- Click **Add secret**

#### Secret 3: VPS_PASSWORD
- **Name**: `VPS_PASSWORD`
- **Value**: `,8n1IlYWf?-hz@Ti9LtN`
- Click **Add secret**

---

## ✅ Verification

After adding all secrets, you should see:

```
VPS_HOST         •••••••••••••••
VPS_USERNAME     •••••••••••••••
VPS_PASSWORD     •••••••••••••••
```

The values are hidden for security.

---

## 🚀 Testing the Deployment

Once secrets are added:

1. Make any small change to your code
2. Commit and push to master branch:
   ```bash
   git add .
   git commit -m "Test deployment"
   git push origin master
   ```

3. Watch the deployment:
   - Go to **Actions** tab in GitHub
   - Click on the latest workflow run
   - Monitor the deployment progress

---

## 🔒 Security Notes

- ✅ Secrets are encrypted and never exposed in logs
- ✅ Only repository collaborators can view/edit secrets
- ✅ Secrets are only available during workflow execution
- ⚠️ **IMPORTANT**: Never commit secrets to your repository
- ⚠️ **IMPORTANT**: Consider changing the VPS password after setup

---

## 📋 Alternative: Using SSH Keys (More Secure)

Instead of using password authentication, you can use SSH keys:

### 1. Generate SSH Key on GitHub Actions

Add this to your workflow (replace password authentication):

```yaml
- name: Setup SSH Key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_rsa
    ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
```

### 2. Add Public Key to VPS

```bash
ssh root@168.231.121.19
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key here
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. Add Private Key as GitHub Secret

- **Name**: `VPS_SSH_KEY`
- **Value**: (Contents of your private key file)

---

## 🆘 Troubleshooting

### Issue: "Secrets not found" error

**Solution**: Ensure secret names are exactly as shown (case-sensitive)

### Issue: "Authentication failed" error

**Solution**: 
1. Verify VPS_PASSWORD is correct
2. Try SSH manually: `ssh root@168.231.121.19`
3. If password changed, update the secret

### Issue: "Host key verification failed"

**Solution**: This is handled automatically in the workflow, but if issues persist, add:
```yaml
- name: Disable Host Key Checking
  run: |
    mkdir -p ~/.ssh
    echo "StrictHostKeyChecking no" >> ~/.ssh/config
```

---

## ✨ Ready to Deploy!

Once secrets are configured, every push to `master` will:
1. ✅ Automatically deploy to VPS
2. ✅ Run database migrations
3. ✅ Restart the application
4. ✅ Notify you of the deployment status

**Your deployment is now fully automated! 🎉**

---

**Need Help?** See `docs/DEPLOYMENT.md` for the full deployment guide.
