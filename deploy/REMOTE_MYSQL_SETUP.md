# Setup Remote MySQL Access Guide

Enable remote MySQL connections for development and database management.

---

## 🚀 Quick Setup (Automated)

### From Windows PowerShell:

```powershell
# Upload script
scp P:\psr-cloud-v2\deploy\setup-remote-mysql.sh root@168.231.121.19:/root/

# Connect to server
ssh root@168.231.121.19

# Make executable and run
chmod +x /root/setup-remote-mysql.sh
bash /root/setup-remote-mysql.sh
```

**You will be prompted for:**
1. Access level (ANY IP or specific IP only)
2. Your local IP address (if specific IP chosen)
3. MySQL root password

⏱️ **Takes ~2 minutes**

---

## 🔧 Manual Setup

If you prefer manual configuration:

### Step 1: Configure MySQL for Remote Connections

```bash
# Connect to server
ssh root@168.231.121.19

# Edit MySQL configuration
nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Find and change:
```ini
# FROM:
bind-address = 127.0.0.1

# TO:
bind-address = 0.0.0.0
```

Save and restart MySQL:
```bash
systemctl restart mysql
```

### Step 2: Create Remote MySQL User

Connect to MySQL:
```bash
mysql -u root -p
```

Run these SQL commands:

**Option A: Allow from ANY IP (less secure)**
```sql
-- Create remote user
CREATE USER IF NOT EXISTS 'psr_admin'@'%' IDENTIFIED BY 'PsrAdmin@2025!';

-- Grant privileges
GRANT ALL PRIVILEGES ON psr_v4_main.* TO 'psr_admin'@'%';
GRANT ALL PRIVILEGES ON `%`.* TO 'psr_admin'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SELECT user, host FROM mysql.user WHERE user='psr_admin';
EXIT;
```

**Option B: Allow from specific IP (more secure)**
```sql
-- Replace YOUR_IP with your actual IP
CREATE USER IF NOT EXISTS 'psr_admin'@'YOUR_IP' IDENTIFIED BY 'PsrAdmin@2025!';

GRANT ALL PRIVILEGES ON psr_v4_main.* TO 'psr_admin'@'YOUR_IP';
GRANT ALL PRIVILEGES ON `%`.* TO 'psr_admin'@'YOUR_IP';

FLUSH PRIVILEGES;

SELECT user, host FROM mysql.user WHERE user='psr_admin';
EXIT;
```

### Step 3: Configure Firewall

**Allow from ANY IP:**
```bash
ufw allow 3306/tcp
ufw reload
```

**Allow from specific IP only:**
```bash
ufw allow from YOUR_IP to any port 3306
ufw reload
```

Verify:
```bash
ufw status | grep 3306
```

---

## ✅ Test Connection

### From Windows PowerShell:

**Test with MySQL client:**
```powershell
# If you have MySQL installed
mysql -h 168.231.121.19 -P 3306 -u psr_admin -p
# Enter password: PsrAdmin@2025!
```

**Test with telnet:**
```powershell
# Test if port is open
Test-NetConnection -ComputerName 168.231.121.19 -Port 3306
```

### Update your .env.local

```dotenv
# Database Configuration (VPS MySQL - Remote)
DB_HOST=168.231.121.19
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@2025!
DB_NAME=psr_v4_main
```

### Test your Next.js app

```powershell
cd P:\psr-cloud-v2
npm run dev
```

Your local dev server should now connect to the VPS database!

---

## 🔒 Security Best Practices

### For Development:
- ✅ Allow from your specific IP only
- ✅ Use strong passwords
- ✅ Close port 3306 when not needed

### For Production:
- ❌ Never expose MySQL to public internet
- ✅ Use SSH tunneling instead
- ✅ Implement IP whitelisting
- ✅ Use SSL/TLS for connections

---

## 🔐 SSH Tunnel (More Secure Alternative)

Instead of opening port 3306, use SSH tunnel:

### Create SSH Tunnel:
```powershell
# From Windows PowerShell
ssh -L 3306:localhost:3306 root@168.231.121.19
# Keep this terminal open
```

### Then connect to localhost:
```dotenv
# .env.local - Connect through SSH tunnel
DB_HOST=localhost
DB_PORT=3306
DB_USER=psr_admin
DB_PASSWORD=PsrAdmin@2025!
DB_NAME=psr_v4_main
```

This is **more secure** because:
- ✅ MySQL port not exposed to internet
- ✅ All traffic encrypted through SSH
- ✅ No firewall changes needed

---

## 🐛 Troubleshooting

### Cannot Connect Remotely

**Check MySQL is listening:**
```bash
ss -tulpn | grep 3306
# Should show: 0.0.0.0:3306
```

**Check firewall:**
```bash
ufw status
# Should show: 3306 ALLOW
```

**Check MySQL user:**
```bash
mysql -u root -p -e "SELECT user, host FROM mysql.user WHERE user='psr_admin';"
```

### Connection Times Out

- Check your local firewall isn't blocking outbound port 3306
- Verify server firewall allows your IP
- Check if ISP blocks port 3306

### Access Denied Error

```bash
# Verify user exists and has correct permissions
mysql -u root -p
```

```sql
SELECT user, host FROM mysql.user WHERE user='psr_admin';
SHOW GRANTS FOR 'psr_admin'@'%';
```

---

## 📊 Useful MySQL Commands

### View All Users:
```sql
SELECT user, host FROM mysql.user;
```

### View User Permissions:
```sql
SHOW GRANTS FOR 'psr_admin'@'%';
```

### Remove Remote Access:
```sql
DROP USER 'psr_admin'@'%';
FLUSH PRIVILEGES;
```

### View Active Connections:
```sql
SHOW PROCESSLIST;
```

---

## 🔄 Manage Remote Access

### Disable Remote MySQL (when not needed):
```bash
# Close firewall port
ufw delete allow 3306/tcp
ufw reload

# Change bind-address back to localhost
sudo sed -i 's/bind-address = 0.0.0.0/bind-address = 127.0.0.1/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo systemctl restart mysql
```

### Re-enable Later:
```bash
# Open firewall
ufw allow 3306/tcp

# Update bind-address
sudo sed -i 's/bind-address = 127.0.0.1/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
sudo systemctl restart mysql
```

---

## 📞 Quick Reference

**Server:** 168.231.121.19  
**Port:** 3306  
**User:** psr_admin  
**Password:** PsrAdmin@2025!  
**Database:** psr_v4_main  

**Connection String:**
```
mysql://psr_admin:PsrAdmin@2025!@168.231.121.19:3306/psr_v4_main
```

**GUI Tools (Free):**
- MySQL Workbench: https://dev.mysql.com/downloads/workbench/
- DBeaver: https://dbeaver.io/
- HeidiSQL: https://www.heidisql.com/

---

## ⚠️ Important Notes

1. **Security Risk:** Opening port 3306 exposes your database to the internet
2. **Best Practice:** Use SSH tunneling for remote access
3. **Production:** Never expose MySQL directly in production
4. **Monitoring:** Check MySQL logs regularly for suspicious activity
5. **Backup:** Always maintain regular database backups

**MySQL Logs:**
```bash
tail -f /var/log/mysql/error.log
```

---

**Setup Complete!** 🎉

You can now connect to your VPS MySQL database remotely.
