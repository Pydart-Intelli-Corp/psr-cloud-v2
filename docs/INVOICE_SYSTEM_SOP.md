# Standard Operating Procedure (SOP): Automatic Invoice Generation System

**Document Version**: 1.0  
**Effective Date**: January 28, 2026  
**Department**: Operations & IT  
**Review Cycle**: Quarterly

---

## Table of Contents

1. [Purpose](#purpose)
2. [Scope](#scope)
3. [Responsibilities](#responsibilities)
4. [Prerequisites](#prerequisites)
5. [System Setup Procedures](#system-setup-procedures)
6. [Daily Operations](#daily-operations)
7. [Troubleshooting Procedures](#troubleshooting-procedures)
8. [Monitoring & Reporting](#monitoring--reporting)
9. [Emergency Contacts](#emergency-contacts)
10. [Revision History](#revision-history)

---

## Purpose

This SOP defines the procedures for operating and maintaining the Automatic Invoice Generation System, which generates and emails PDF invoices to farmers upon milk collection uploads.

**Objective**: Ensure farmers receive accurate, professional invoices immediately after collection uploads with 99%+ success rate.

---

## Scope

**Applies to**:
- System Administrators
- Operations Team
- IT Support Staff
- Quality Assurance Team

**Covers**:
- System setup and configuration
- Daily operations and monitoring
- Troubleshooting common issues
- Maintenance procedures

---

## Responsibilities

### System Administrator
- Initial system setup and configuration
- Environment variable management
- SMTP credentials management
- Logo file deployment
- Security and access control

### Operations Team
- Daily monitoring of invoice generation
- Farmer email address verification
- Collection upload management
- First-level troubleshooting
- Issue escalation

### IT Support
- Technical troubleshooting
- Server maintenance
- Email service monitoring
- System performance optimization
- Backup and recovery

### QA Team
- Regular system testing
- Invoice accuracy verification
- Email delivery testing
- Performance monitoring

---

## Prerequisites

### System Requirements

**Server Environment**:
- Node.js 18+ installed
- PM2 process manager (production)
- MySQL 8.0+ database
- Internet connectivity for email sending

**Email Service**:
- SMTP server access (Gmail/SendGrid/etc.)
- Valid email credentials
- Port 587 or 465 open for SMTP

**Files Required**:
- Company logo: `/public/fulllogo.png`
- Invoice service: `/src/lib/services/invoiceService.ts`
- Modified collection upload route

**Environment Variables**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

---

## System Setup Procedures

### SOP-001: Initial System Setup

**Frequency**: One-time (or after fresh installation)  
**Duration**: 30 minutes  
**Responsibility**: System Administrator

#### Steps:

**1. Verify System Files** (5 min)
```bash
# Navigate to project directory
cd /path/to/psr-cloud-v2

# Check invoice service exists
ls -l src/lib/services/invoiceService.ts

# Check logo file exists
ls -l public/fulllogo.png

# If logo missing, upload it
# Recommended size: 480x160 pixels, PNG format
```

**2. Configure Environment Variables** (10 min)
```bash
# Edit .env.local file
nano .env.local

# Add/verify these variables:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=noreply@yourcompany.com
SMTP_PASSWORD=your-secure-app-password
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com

# Save and exit (Ctrl+X, Y, Enter)
```

**3. Test Email Configuration** (10 min)
```bash
# Create test script
cat > test-email-config.js << 'EOF'
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

console.log('Testing email configuration...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration FAILED:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Email server is ready to send emails');
    process.exit(0);
  }
});
EOF

# Run test
node test-email-config.js

# Expected output: ✅ Email server is ready to send emails
```

**4. Verify Database Schema** (5 min)
```bash
# Check farmers table has email column
mysql -h your-db-host -u your-user -p

USE your_admin_schema;

# Verify email column exists
DESCRIBE farmers;

# Should show 'email' column (VARCHAR 255)
# If missing, add it:
# ALTER TABLE farmers ADD COLUMN email VARCHAR(255) DEFAULT NULL;

# Check sample farmer emails
SELECT farmer_id, name, email FROM farmers LIMIT 5;

EXIT;
```

**5. Restart Application** (2 min)
```bash
# Development
npm run dev

# Production with PM2
pm2 restart psr-cloud-v2
pm2 logs psr-cloud-v2 --lines 50
```

**Verification Checklist**:
- [ ] Invoice service file exists
- [ ] Logo file exists and accessible
- [ ] Environment variables configured
- [ ] Email configuration test passed
- [ ] Database farmers table has email column
- [ ] Application restarted successfully
- [ ] No errors in logs

---

### SOP-002: Logo File Management

**Frequency**: As needed (logo changes)  
**Duration**: 10 minutes  
**Responsibility**: System Administrator

#### Steps:

**1. Prepare Logo File**
- Format: PNG with transparent background
- Recommended dimensions: 480 x 160 pixels (3:1 ratio)
- Max file size: 500 KB
- Color: Company brand colors
- Quality: High resolution for professional appearance

**2. Upload Logo**
```bash
# Backup existing logo
cp public/fulllogo.png public/fulllogo.png.backup.$(date +%Y%m%d)

# Upload new logo (example using SCP)
scp /local/path/newlogo.png user@server:/path/to/psr-cloud-v2/public/fulllogo.png

# Or direct copy on server
cp /path/to/new/logo.png /path/to/psr-cloud-v2/public/fulllogo.png

# Verify file
ls -lh public/fulllogo.png
file public/fulllogo.png  # Should show: PNG image data
```

**3. Test Logo Display**
```bash
# Test logo accessibility
curl -I http://localhost:3000/fulllogo.png
# Should return: HTTP/1.1 200 OK

# Or in browser
# Navigate to: http://your-domain.com/fulllogo.png
```

**4. Generate Test Invoice**
- Upload a test collection
- Check PDF invoice
- Verify logo displays correctly
- Verify logo is not stretched or distorted

**Verification**:
- [ ] Logo file uploaded
- [ ] Correct dimensions and format
- [ ] Accessible via HTTP
- [ ] Displays correctly in test invoice
- [ ] Old logo backed up

---

### SOP-003: Email Credentials Rotation

**Frequency**: Every 90 days (security best practice)  
**Duration**: 15 minutes  
**Responsibility**: System Administrator

#### Steps:

**1. Generate New Email Credentials**
- Log in to email service provider
- Navigate to App Passwords (for Gmail) or API Keys (for SendGrid)
- Generate new password/key
- Save securely in password manager

**2. Update Environment Variables**
```bash
# Edit environment file
nano .env.local

# Update SMTP credentials
SMTP_PASSWORD=new-secure-password

# Save and exit
```

**3. Test New Credentials**
```bash
# Run email configuration test
node test-email-config.js

# Expected: ✅ Email server is ready
```

**4. Restart Application**
```bash
# Production
pm2 restart psr-cloud-v2

# Wait 10 seconds for restart
sleep 10

# Check logs for errors
pm2 logs psr-cloud-v2 --lines 30
```

**5. Send Test Invoice**
- Upload small test collection
- Verify invoice email sent successfully
- Check console logs: "📧 Invoice sent"

**6. Revoke Old Credentials**
- Return to email service provider
- Revoke/delete old password/key
- Document rotation in security log

**Verification**:
- [ ] New credentials generated
- [ ] Environment variables updated
- [ ] Test passed
- [ ] Application restarted
- [ ] Test invoice sent successfully
- [ ] Old credentials revoked

---

## Daily Operations

### SOP-004: Collection Upload with Invoice Generation

**Frequency**: Daily (multiple times)  
**Duration**: 5-30 minutes  
**Responsibility**: Operations Team

#### Steps:

**1. Pre-Upload Verification** (2 min)
```bash
# Check system status
pm2 status psr-cloud-v2
# Should show: status: online

# Check recent logs for errors
pm2 logs psr-cloud-v2 --lines 20 --nostream
```

**2. Upload Collection CSV** (5 min)
- Log in to admin portal
- Navigate to: Reports > Collections > Upload
- Select machine from dropdown
- Choose CSV file from local system
- Click "Upload Collection Data"

**3. Monitor Upload Progress** (2 min)
- Watch upload progress bar
- Review upload summary:
  - Total rows processed
  - New records inserted
  - Duplicates updated
  - Errors encountered

**4. Verify Invoice Generation** (3 min)
```bash
# Check console logs for invoice activity
pm2 logs psr-cloud-v2 --lines 50 | grep -E "Invoice (sent|failed|error)"

# Expected outputs:
# 📧 Invoice sent: Farmer 123 - INV-schema-1234567890
# ⚠️ Invoice failed: Farmer 456 - No email address available
```

**5. Random Sample Verification** (10 min)
- Select 3 random farmers from upload
- Check their email inboxes
- Verify invoice received
- Verify PDF attachment opens
- Verify data accuracy:
  - Farmer ID and name
  - Collection date and shift
  - Quantity, Fat, SNF
  - Total amount

**6. Handle Failures** (Variable)
- Note farmers with missing emails
- Add to "Email Update Required" list
- Contact farmers to collect email addresses
- Update farmer records in database

**Normal Operation Checklist**:
- [ ] System online and healthy
- [ ] CSV uploaded successfully
- [ ] Invoice logs show success messages
- [ ] Sample invoices verified
- [ ] Any failures documented
- [ ] Email update list maintained

---

### SOP-005: Daily Monitoring Routine

**Frequency**: Daily (Start of shift)  
**Duration**: 15 minutes  
**Responsibility**: Operations Team

#### Morning Checklist:

**1. System Health Check** (5 min)
```bash
# Check application status
pm2 status

# Check system resources
pm2 monit
# CPU should be < 80%, Memory < 2GB

# Check error logs from last 24 hours
pm2 logs psr-cloud-v2 --err --lines 100 | grep -i error
```

**2. Invoice Success Rate** (5 min)
```bash
# Count yesterday's invoice activities
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d)

# Successful invoices
pm2 logs psr-cloud-v2 --lines 10000 --nostream | grep "$YESTERDAY" | grep "Invoice sent" | wc -l

# Failed invoices (no email)
pm2 logs psr-cloud-v2 --lines 10000 --nostream | grep "$YESTERDAY" | grep "Invoice failed" | wc -l

# Error invoices
pm2 logs psr-cloud-v2 --lines 10000 --nostream | grep "$YESTERDAY" | grep "Invoice error" | wc -l

# Calculate success rate
# Success Rate = (Sent / (Sent + Failed + Error)) * 100
# Target: > 85%
```

**3. Email Service Health** (3 min)
```bash
# Test email connectivity
node test-email-config.js

# Check email service provider status
# Visit: https://status.gmail.com (for Gmail)
# Or your email provider's status page
```

**4. Database Connection** (2 min)
```bash
# Test database connectivity
mysql -h your-db-host -u your-user -p -e "SELECT 1"

# Check farmers with missing emails
mysql -h your-db-host -u your-user -p << EOF
USE your_admin_schema;
SELECT COUNT(*) as farmers_without_email 
FROM farmers 
WHERE email IS NULL OR email = '';
EOF
```

**Daily Report Template**:
```
Date: [DATE]
System Status: [ONLINE/DEGRADED/OFFLINE]
Invoices Sent: [COUNT]
Invoices Failed (No Email): [COUNT]
Invoices Error: [COUNT]
Success Rate: [PERCENTAGE]%
Farmers Needing Email: [COUNT]
Issues: [NONE / LIST ISSUES]
Actions Taken: [DESCRIPTION]
```

---

### SOP-006: Weekly Maintenance

**Frequency**: Weekly (Sunday 2:00 AM)  
**Duration**: 30 minutes  
**Responsibility**: IT Support

#### Steps:

**1. Log Rotation** (5 min)
```bash
# Archive PM2 logs
pm2 flush  # Clear current logs after archiving
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

**2. Database Cleanup** (10 min)
```bash
# Archive old logs (optional)
mysql -h your-db-host -u your-user -p << EOF
USE your_admin_schema;

-- Check log table sizes
SELECT 
  TABLE_NAME, 
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'your_admin_schema'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
EOF
```

**3. Email Bounce Monitoring** (10 min)
- Check email provider dashboard
- Review bounced emails
- Update farmer email addresses
- Remove invalid emails from database

**4. Performance Review** (5 min)
```bash
# Check average invoice generation time
pm2 logs psr-cloud-v2 --lines 1000 --nostream | grep "Invoice sent" | tail -100

# Review system metrics
pm2 monit
```

**Weekly Report Template**:
```
Week Ending: [DATE]
Total Invoices Sent: [COUNT]
Average Success Rate: [PERCENTAGE]%
Email Bounces: [COUNT]
System Uptime: [PERCENTAGE]%
Performance Issues: [NONE / DESCRIPTION]
Maintenance Actions: [LIST]
Recommendations: [LIST]
```

---

## Troubleshooting Procedures

### SOP-007: Invoice Not Sending (No Email Address)

**Symptom**: Console shows "⚠️ Invoice failed: No email address available"

**Impact**: Low (Collection saved, farmer doesn't receive invoice)

**Resolution Time**: 5 minutes per farmer

#### Steps:

**1. Verify Issue**
```bash
# Check farmer record
mysql -h your-db-host -u your-user -p << EOF
USE your_admin_schema;
SELECT farmer_id, name, email, contact_number 
FROM farmers 
WHERE farmer_id = 'XXXX';
EOF
```

**2. Collect Email Address**
- Call farmer using contact_number
- Request email address
- Verify email address (ask to spell it)
- Confirm with test email if possible

**3. Update Database**
```bash
mysql -h your-db-host -u your-user -p << EOF
USE your_admin_schema;
UPDATE farmers 
SET email = 'farmer@example.com' 
WHERE farmer_id = 'XXXX';

-- Verify update
SELECT farmer_id, name, email FROM farmers WHERE farmer_id = 'XXXX';
EOF
```

**4. Manual Invoice Generation** (Optional)
- If farmer needs immediate invoice:
  - Navigate to Reports > Collections
  - Find specific collection
  - Use "Resend Invoice" button (if implemented)
  - Or manually email collection details

**5. Document Action**
- Log farmer ID and email added
- Update farmer contact list
- Note in daily report

**Prevention**:
- Collect email during farmer registration
- Make email mandatory in registration form
- Periodic email validation campaigns

---

### SOP-008: Email Service Failure

**Symptom**: Console shows "❌ Invoice error: SMTP error"

**Impact**: High (All invoices failing)

**Resolution Time**: 15-30 minutes

#### Steps:

**1. Identify Issue Scope**
```bash
# Check recent errors
pm2 logs psr-cloud-v2 --err --lines 50

# Test email configuration
node test-email-config.js
```

**2. Common Causes & Solutions**

**a) SMTP Authentication Failure**
```bash
# Verify credentials
echo $SMTP_USERNAME
echo $SMTP_PASSWORD  # Check it's set (don't display)

# Test login manually (for Gmail)
# Enable "Less secure app access" or use App Password
```

**Solution**:
```bash
# Update credentials in .env.local
nano .env.local
# Update SMTP_USERNAME and SMTP_PASSWORD
# Restart application
pm2 restart psr-cloud-v2
```

**b) Network/Firewall Issue**
```bash
# Test SMTP port connectivity
telnet smtp.gmail.com 587
# Should connect successfully

# Or using nc
nc -zv smtp.gmail.com 587
```

**Solution**:
- Contact network admin
- Check firewall rules
- Ensure port 587 (or 465) is open

**c) Email Service Provider Issue**
- Check provider status page
- Check account limits (daily send limit)
- Check for service outages

**Solution**:
- Wait for service restoration
- Temporarily switch to backup SMTP (if configured)
- Increase sending limits if exceeded

**3. Emergency Workaround**
```bash
# Temporarily disable invoice emails (if critical)
# Add flag to collection upload route:
# const INVOICE_ENABLED = false;

# Or use backup email service
nano .env.local
# Change SMTP_HOST to backup service
pm2 restart psr-cloud-v2
```

**4. Notify Stakeholders**
- Email operations team
- Post in team chat
- Update status board

**5. Post-Resolution**
```bash
# Test with sample invoice
# Upload small test collection
# Verify invoice sent
# Monitor logs for 30 minutes
```

**6. Document Incident**
- Time started and resolved
- Root cause
- Resolution steps
- Prevention measures

---

### SOP-009: PDF Generation Error

**Symptom**: Console shows "❌ Invoice error: Failed to generate PDF"

**Impact**: Medium (Specific invoices failing)

**Resolution Time**: 10 minutes

#### Steps:

**1. Check Error Details**
```bash
# View full error stack
pm2 logs psr-cloud-v2 --err --lines 100
```

**2. Common Issues**

**a) Logo Loading Failure**
```bash
# Verify logo exists
ls -l public/fulllogo.png

# Test logo access
curl -I http://localhost:3000/fulllogo.png
curl -I $NEXT_PUBLIC_BASE_URL/fulllogo.png
```

**Solution**:
- Restore logo file from backup
- Check file permissions (should be readable)
- Verify NEXT_PUBLIC_BASE_URL is correct

**b) Invalid Collection Data**
- Check for NULL values in required fields
- Verify numeric fields have valid numbers
- Check date format

**Solution**:
```sql
-- Find problematic collection
SELECT * FROM milk_collections 
WHERE farmer_id = 'XXXX' 
ORDER BY created_at DESC 
LIMIT 1;

-- Verify data integrity
-- Update if necessary
```

**c) Memory Issue**
```bash
# Check available memory
pm2 monit
free -h

# If low memory, restart application
pm2 restart psr-cloud-v2
```

**3. Manual Invoice Retry**
- Fix underlying issue
- Re-upload collection (will update existing)
- Or manually email farmer with collection details

---

### SOP-010: Bulk Upload Performance Issues

**Symptom**: Upload takes > 1 minute for 100 collections

**Impact**: Medium (User experience degraded)

**Resolution Time**: 30 minutes

#### Steps:

**1. Identify Bottleneck**
```bash
# Check system resources during upload
pm2 monit  # Monitor CPU and memory

# Check database connection pool
# Review slow query log
```

**2. Optimize Database**
```sql
-- Check for missing indexes
SHOW INDEX FROM milk_collections;

-- Add index if missing
CREATE INDEX idx_farmer_date_shift 
ON milk_collections(farmer_id, collection_date, shift_type);
```

**3. Optimize Email Sending**
- Consider email queue (Redis + Bull)
- Batch email sending
- Increase concurrency limit

**4. Monitor Invoice Generation**
```bash
# Count pending invoices
pm2 logs psr-cloud-v2 | grep "Invoice sent" | wc -l
```

**5. Temporary Mitigation**
- Upload in smaller batches (50 collections)
- Schedule large uploads during off-peak hours

---

## Monitoring & Reporting

### SOP-011: Daily Monitoring Dashboard

**Frequency**: Continuous (real-time)  
**Responsibility**: Operations Team

#### Key Metrics:

**1. Invoice Success Rate**
```
Target: > 85%
Formula: (Invoices Sent / Total Collections) × 100
Alert: If < 75% for 1 hour
```

**2. Email Delivery Rate**
```
Target: > 95%
Check: Email provider dashboard
Alert: If < 90%
```

**3. System Uptime**
```
Target: > 99.5%
Check: pm2 status
Alert: If status != online
```

**4. Average Invoice Generation Time**
```
Target: < 5 seconds
Check: Log timestamps
Alert: If > 10 seconds
```

**5. Farmers Without Email**
```
Target: < 10%
Check: Database query
Alert: If > 20%
```

#### Monitoring Commands:
```bash
# Real-time log monitoring
pm2 logs psr-cloud-v2 --lines 50

# Filter invoice activities
pm2 logs psr-cloud-v2 | grep -E "Invoice (sent|failed|error)"

# Count today's invoices
pm2 logs psr-cloud-v2 --nostream | grep "$(date +%Y-%m-%d)" | grep "Invoice sent" | wc -l
```

---

### SOP-012: Monthly Reporting

**Frequency**: Monthly (1st of month)  
**Duration**: 1 hour  
**Responsibility**: Operations Manager

#### Report Sections:

**1. Executive Summary**
- Total invoices sent
- Overall success rate
- System uptime
- Major incidents

**2. Performance Metrics**
```sql
-- Monthly invoice statistics
SELECT 
  DATE(created_at) as date,
  COUNT(*) as collections,
  COUNT(DISTINCT farmer_id) as unique_farmers
FROM milk_collections
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY DATE(created_at)
ORDER BY date;
```

**3. Email Statistics**
- Emails sent
- Emails bounced
- Emails opened (if tracking enabled)

**4. Issues & Resolutions**
- List of incidents
- Resolution time
- Root causes
- Prevention measures

**5. Farmer Email Coverage**
```sql
-- Farmers with vs without email
SELECT 
  SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as with_email,
  SUM(CASE WHEN email IS NULL OR email = '' THEN 1 ELSE 0 END) as without_email,
  COUNT(*) as total,
  ROUND(SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as coverage_percentage
FROM farmers;
```

**6. Recommendations**
- System improvements
- Process optimizations
- Training needs

---

## Emergency Contacts

### Escalation Matrix

| Issue Level | Contact | Response Time |
|-------------|---------|---------------|
| **Level 1**: Minor (Single invoice failure) | Operations Team | 1 hour |
| **Level 2**: Medium (Multiple failures) | IT Support | 30 minutes |
| **Level 3**: Critical (System down) | System Administrator | 15 minutes |
| **Level 4**: Emergency (Data integrity) | Development Team | Immediate |

### Contact Information

**Operations Team**:
- Email: operations@yourcompany.com
- Phone: +91-XXXX-XXXXXX
- Slack: #operations-team

**IT Support**:
- Email: itsupport@yourcompany.com
- Phone: +91-XXXX-XXXXXX (24/7)
- Slack: #it-support

**System Administrator**:
- Email: sysadmin@yourcompany.com
- Phone: +91-XXXX-XXXXXX
- On-Call: [Rotation Schedule]

**Development Team**:
- Email: dev-team@yourcompany.com
- Emergency: +91-XXXX-XXXXXX
- Slack: #dev-emergency

---

## Appendix

### A. Environment Variables Reference

```bash
# Required Variables
SMTP_HOST=smtp.gmail.com              # Email server hostname
SMTP_PORT=587                         # SMTP port (587 or 465)
SMTP_SECURE=false                     # true for 465, false for 587
SMTP_USERNAME=email@company.com       # Email account username
SMTP_PASSWORD=app-password-here       # Email account password/app password
NEXT_PUBLIC_BASE_URL=https://domain.com  # Application base URL

# Optional Variables
EMAIL_HOST=smtp.gmail.com             # Alternative to SMTP_HOST
EMAIL_PORT=587                        # Alternative to SMTP_PORT
EMAIL_SECURE=false                    # Alternative to SMTP_SECURE
EMAIL_USER=email@company.com          # Alternative to SMTP_USERNAME
EMAIL_PASSWORD=password               # Alternative to SMTP_PASSWORD
```

### B. Common Error Messages

| Error Message | Meaning | Solution SOP |
|--------------|---------|--------------|
| "No email address available" | Farmer has no email | SOP-007 |
| "SMTP authentication failed" | Wrong email credentials | SOP-008 |
| "Could not load logo" | Logo file missing | SOP-009 |
| "Failed to process invoice" | PDF generation error | SOP-009 |
| "Network timeout" | Email server unreachable | SOP-008 |

### C. Quick Reference Commands

```bash
# System Status
pm2 status psr-cloud-v2

# View Logs
pm2 logs psr-cloud-v2 --lines 100

# Restart Application
pm2 restart psr-cloud-v2

# Test Email
node test-email-config.js

# Count Today's Invoices
pm2 logs psr-cloud-v2 --nostream | grep "$(date +%Y-%m-%d)" | grep "Invoice sent" | wc -l

# Check Farmers Without Email
mysql -u user -p -e "USE schema; SELECT COUNT(*) FROM farmers WHERE email IS NULL;"
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-28 | System Admin | Initial SOP creation |
| | | | |

---

**Document Owner**: IT Department  
**Approved By**: Operations Manager  
**Next Review Date**: 2026-04-28  

---

**END OF DOCUMENT**
