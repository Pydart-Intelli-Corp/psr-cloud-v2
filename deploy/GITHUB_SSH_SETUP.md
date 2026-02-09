# GitHub SSH Setup - Quick Guide

Quick reference for setting up SSH access to GitHub on your VPS.

## 🚀 Quick Setup (Automated)

### Upload and run the setup script:

```powershell
# From Windows
scp P:\psr-cloud-v2\deploy\setup-github-ssh.sh root@168.231.121.19:/root/
ssh root@168.231.121.19 "chmod +x /root/setup-github-ssh.sh && bash /root/setup-github-ssh.sh"
```

Follow the prompts!

---

## ⌨️ Manual Setup

### 1. Connect to Server

```powershell
ssh root@168.231.121.19
```

### 2. Generate SSH Key

```bash
ssh-keygen -t ed25519 -C "your-email@gmail.com"
```

Press **Enter** 3 times (accept defaults, no passphrase)

### 3. Display Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output**

### 4. Add to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `PSR VPS Server`
4. Paste the key
5. Click **"Add SSH key"**

### 5. Test Connection

```bash
ssh -T git@github.com
```

Should see: `Hi YourUsername! You've successfully authenticated...`

### 6. Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@gmail.com"
```

---

## ✅ Now You Can Use SSH URLs

### Clone with SSH:

```bash
cd /var/www/psr-v4
git clone git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git .
```

### Clone with HTTPS (fallback):

```bash
cd /var/www/psr-v4
git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git .
```

### Pull updates:

```bash
cd /var/www/psr-v4
git pull origin main
```

### Push changes (if you have write access):

```bash
cd /var/www/psr-v4
git add .
git commit -m "Your message"
git push origin main
```

---

## 🐛 Troubleshooting

### Permission denied (publickey)

```bash
# Start SSH agent and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Test again
ssh -T git@github.com
```

### Wrong key or multiple keys

```bash
# List all keys
ls -la ~/.ssh/

# Remove old keys (backup first)
mv ~/.ssh/id_rsa ~/.ssh/id_rsa.backup
mv ~/.ssh/id_rsa.pub ~/.ssh/id_rsa.pub.backup

# Generate new
ssh-keygen -t ed25519 -C "your-email@gmail.com"
```

### Already have HTTPS clone?

```bash
# Switch to SSH
cd /var/www/psr-v4
git remote set-url origin git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git

# Verify
git remote -v
```

---

## 📝 Quick Commands

```bash
# View your public key
cat ~/.ssh/id_ed25519.pub

# Test GitHub connection
ssh -T git@github.com

# Check Git config
git config --list

# View remote URL
cd /var/www/psr-v4
git remote -v
```

---

**Done!** You can now use Git without passwords 🎉
