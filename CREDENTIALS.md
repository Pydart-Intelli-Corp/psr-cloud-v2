# 🔐 Application Credentials

## Super Admin Access

### Login Credentials
- **URL**: `http://168.231.121.19/superadmin`
- **Email**: `admin@poornasreeequipments.com`
- **Password**: `psr@2025`

### Role & Permissions
- **Role**: Super Administrator
- **Full Access To**:
  - All admin approvals
  - Database management
  - Machine management
  - User management
  - System configuration

---

## Database Access

### Production Database (VPS)
- **Host**: `localhost` (from VPS) or `168.231.121.19` (remote)
- **Port**: `3306`
- **Database**: `psr_v4_main`
- **Username**: `psr_admin`
- **Password**: `PsrAdmin@20252!`

### Connect via MySQL CLI (from VPS)
```bash
mysql -u psr_admin -p psr_v4_main
# Password: PsrAdmin@20252!
```

### Connect via MySQL CLI (remote)
```bash
mysql -h 168.231.121.19 -P 3306 -u psr_admin -p psr_v4_main
# Password: PsrAdmin@20252!
```

---

## VPS Access

### SSH Connection
```bash
ssh root@168.231.121.19
# Password: ,8n1IlYWf?-hz@Ti9LtN
```

- **Username**: `root`
- **Password**: `,8n1IlYWf?-hz@Ti9LtN`
- **Application Directory**: `/var/www/psr-v4`

---

## Email Configuration

### SMTP Settings
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- **Secure**: `false` (uses STARTTLS)
- **From**: `noreply@poornasreeequipments.com`

### Gmail Credentials (if configured)
- **Email**: From `EMAIL_USER` GitHub Secret
- **Password**: From `EMAIL_PASSWORD` GitHub Secret (App Password)

---

## User Hierarchy & Default Passwords

### After Registration (Default Status)
All new users start with status: `pending_approval`

### User Roles (Hierarchy)
1. **Super Admin** (Top Level)
   - Email: `admin@poornasreeequipments.com`
   - Password: `psr@2025`
   - Approves Admin users

2. **Admin**
   - Manages their own schema/database
   - Creates Dairy, BMC, Society, Farmer users
   - Status: Must be approved by Super Admin

3. **Dairy**
   - Manages multiple BMCs
   - Status: Must be approved by Admin

4. **BMC**
   - Manages multiple Societies
   - Status: Must be approved by Admin

5. **Society**
   - Manages multiple Farmers
   - Status: Must be approved by Admin

6. **Farmer** (Lowest Level)
   - End user
   - Status: Must be approved by Admin

---

## Application URLs

### Production (VPS)
- **Main App**: `http://168.231.121.19`
- **Super Admin**: `http://168.231.121.19/superadmin`
- **Admin Panel**: `http://168.231.121.19/admin/dashboard`
- **Login**: `http://168.231.121.19/login`
- **Register**: `http://168.231.121.19/register`
- **API**: `http://168.231.121.19/api/*`

### Development (Local)
- **Main App**: `http://localhost:3000`
- **Super Admin**: `http://localhost:3000/superadmin`
- **API**: `http://localhost:3000/api/*`

---

## PM2 Management

### View Application Status
```bash
pm2 status
```

### View Logs
```bash
pm2 logs psr-v4
pm2 logs psr-v4 --lines 100
```

### Restart Application
```bash
pm2 restart psr-v4
```

### Stop Application
```bash
pm2 stop psr-v4
```

### Start Application
```bash
pm2 start psr-v4
```

---

## Quick Commands

### Check Application Health
```bash
# From VPS
curl http://localhost:3000

# From outside
curl http://168.231.121.19
```

### View Application Logs
```bash
pm2 logs psr-v4 --lines 50
```

### Check Database Connection
```bash
mysql -u psr_admin -p -e "SHOW DATABASES;"
# Password: PsrAdmin@20252!
```

### Restart Everything
```bash
pm2 restart psr-v4
systemctl restart nginx
systemctl restart mysql
```

---

## First Time Setup

### 1. Access Super Admin Panel
1. Go to: `http://168.231.121.19/superadmin`
2. Login with: `admin@poornasreeequipments.com` / `psr@2025`
3. Dashboard loads successfully

### 2. Create First Admin User
1. Have someone register at: `http://168.231.121.19/register`
2. They fill in:
   - Full Name
   - Email
   - Password
   - Company Details
   - Select Role: "Admin"
3. Status: `pending_approval`

### 3. Approve Admin User (as Super Admin)
1. Login to Super Admin panel
2. Go to "Approvals" or "User Management"
3. Find pending admin user
4. Click "Approve"
5. System creates dedicated schema for admin
6. Admin can now login and manage their users

### 4. Admin Creates Hierarchy
Admin can now create:
- Dairy users
- BMC users
- Society users
- Farmer users

Each user goes through approval process.

---

## Security Notes

### ⚠️ IMPORTANT - Change These Passwords!

1. **Super Admin Password**
   ```sql
   -- Connect to database
   mysql -u psr_admin -p psr_v4_main
   
   -- Change password (replace 'new-secure-password')
   -- You'll need to hash it with bcrypt first in Node.js
   ```

2. **Database Password**
   - Change `DB_PASSWORD` in GitHub Secrets
   - Update `.env.production` on VPS
   - Restart application

3. **VPS Root Password**
   ```bash
   passwd root
   # Enter new password
   ```

### 🔒 Best Practices

- ✅ Change default super admin password after first login
- ✅ Use strong passwords (min 12 characters, mixed case, numbers, symbols)
- ✅ Enable 2FA for critical accounts (when implemented)
- ✅ Regularly rotate passwords (every 90 days)
- ✅ Never share credentials in plain text
- ✅ Use environment variables for sensitive data
- ✅ Regularly review user access and permissions

---

## Troubleshooting

### Can't Login to Super Admin
**Issue**: Login fails with "Invalid credentials"

**Solutions**:
1. Verify credentials:
   - Email: `admin@poornasreeequipments.com`
   - Password: `psr@2025`

2. Check if super admin exists:
   ```bash
   mysql -u psr_admin -p psr_v4_main -e "SELECT email, role FROM Users WHERE role = 'super_admin';"
   ```

3. Re-run seeder:
   ```bash
   cd /var/www/psr-v4
   npx sequelize-cli db:seed:all --env production
   ```

### Forgot Super Admin Password
**Solution**: Reset via database
```bash
# Generate new password hash (use Node.js)
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('NEW_PASSWORD', 12).then(console.log);"

# Update in database
mysql -u psr_admin -p psr_v4_main
UPDATE Users SET password = 'HASHED_PASSWORD' WHERE email = 'admin@poornasreeequipments.com';
```

### Super Admin Not Created
**Solution**: Run seeder manually
```bash
ssh root@168.231.121.19
cd /var/www/psr-v4
npx sequelize-cli db:seed:all --env production
pm2 restart psr-v4
```

---

## Support & Documentation

- **Quick Start**: See `QUICKSTART.md`
- **Deployment**: See `docs/VPS_AUTO_SETUP.md`
- **Troubleshooting**: See `docs/DEPLOYMENT_TROUBLESHOOTING.md`
- **API Reference**: See `docs/03-api-reference/`
- **GitHub Repository**: `https://github.com/Pydart-Intelli-Corp/psr-cloud-v2`

---

**Last Updated**: November 7, 2025  
**Application Version**: 4.0  
**Environment**: Production (VPS)
