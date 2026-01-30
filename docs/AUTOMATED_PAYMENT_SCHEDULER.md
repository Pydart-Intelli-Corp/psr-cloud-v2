# Automated Payment Scheduler

## Overview
The automated payment scheduler processes scheduled payments for farmers based on admin-configured settings. It runs as a separate process and can be scheduled via PM2, cron, or manually triggered.

## Features

### Smart Scheduling
- **Payment Cycles:**
  - Daily: Runs every day
  - Weekly: Runs on specific day of week (Sunday-Saturday)
  - Biweekly: Runs every 2 weeks on specific day
  - Monthly: Runs on specific day of month (1-31)

- **Threshold-Based:**
  - Only processes farmers with `pending_payment_amount >= payment_threshold`
  - Prevents small/unnecessary payments

- **Multi-Tenant:**
  - Each admin's settings are independent
  - Respects per-admin payment configurations

### Payment Processing
- **Automatic Method Selection:**
  - Prioritizes Paytm if enabled and farmer has Paytm phone
  - Falls back to UPI if enabled
  - Falls back to Bank Transfer if enabled
  
- **Transaction Logging:**
  - All payments logged to `payment_transactions` table
  - `is_automated` flag set to 'YES' for scheduled payments
  - Failed payments logged with `failure_reason`

- **Safety Features:**
  - Non-blocking: One admin's failure doesn't affect others
  - Rate limiting: 500ms delay between farmer payments
  - Comprehensive error logging

## Configuration

### Admin Settings (via UI)
Admins configure automation via **Payment Settings** page:

```
Auto Payment Settings:
├── Enable Automated Payments: [✓]
├── Payment Threshold: ₹1000
├── Payment Cycle: Monthly
└── Payment Day: 1 (1st of each month)
```

### Database Fields
Settings stored in `admin_payment_settings` table:
- `auto_payment_enabled` (YES/NO)
- `payment_threshold` (DECIMAL)
- `payment_cycle` (daily/weekly/biweekly/monthly)
- `payment_day` (0-31, depends on cycle)

## Deployment Options

### Option 1: PM2 Cron (Recommended)

**Setup:**
```bash
# Install PM2 globally
npm install -g pm2

# Start with ecosystem config (includes cron)
pm2 start ecosystem.config.js

# Verify scheduler is running
pm2 list

# View scheduler logs
pm2 logs payment-scheduler

# Monitor execution
pm2 monit
```

**Configuration in `ecosystem.config.js`:**
```javascript
{
  name: 'payment-scheduler',
  script: 'scripts/payment-scheduler.js',
  instances: 1,
  exec_mode: 'fork',
  cron_restart: '0 2 * * *', // Daily at 2 AM
  autorestart: false
}
```

**Advantages:**
- Integrated with PM2 process management
- Auto-restart if script crashes
- Centralized logging with PM2
- Easy monitoring via `pm2 monit`

---

### Option 2: System Cron

**Setup:**
```bash
# Edit crontab
crontab -e

# Add cron job (daily at 2 AM)
0 2 * * * cd /path/to/psr-cloud-v2 && node scripts/payment-scheduler.js >> logs/scheduler.log 2>&1

# Different schedules:
# Every 6 hours: 0 */6 * * *
# Twice daily (2 AM, 2 PM): 0 2,14 * * *
# Every Monday at 3 AM: 0 3 * * 1
```

**Advantages:**
- Native system scheduling
- No additional dependencies
- Runs independently of application

---

### Option 3: Manual Execution

**Run Once:**
```bash
node scripts/payment-scheduler.js
```

**Output Example:**
```
╔════════════════════════════════════════════════════════╗
║     AUTOMATED PAYMENT SCHEDULER                        ║
╚════════════════════════════════════════════════════════╝
⏰ Started at: 2026-01-28T02:00:00.000Z
📅 Date: 1/28/2026
🕐 Time: 2:00:00 AM

✅ Database connection established

👥 Found 2 admin(s) to process

📦 Processing payments for: Tishnu Thankappan (tishnuthankappan_tis4782)
✅ Payment day matched! Cycle: monthly, Threshold: ₹1000
📊 Found 15 eligible farmers
✅ Payment scheduled for Ramesh Kumar (FAR001): ₹1250.50
✅ Payment scheduled for Suresh Patel (FAR002): ₹1100.00
...

📈 Summary for Tishnu Thankappan:
   ✅ Successful: 15
   ❌ Failed: 0
   📊 Total: 15

╔════════════════════════════════════════════════════════╗
║     SCHEDULER COMPLETED                                ║
╚════════════════════════════════════════════════════════╝
⏱️  Duration: 12.34s
👥 Admins processed: 2
📊 Total payments: 30
✅ Successful: 28
❌ Failed: 2
⏰ Completed at: 2026-01-28T02:00:12.340Z
```

**Advantages:**
- Testing and debugging
- One-off execution
- Manual control

---

## Payment Day Configuration

### Daily Cycle
- `payment_day`: Ignored (runs every day)
- Example: Process payments daily at 2 AM

### Weekly Cycle
- `payment_day`: 0-6 (0=Sunday, 6=Saturday)
- Example: `payment_day=1` → Every Monday

### Biweekly Cycle
- `payment_day`: 0-6 (day of week)
- Runs every 2 weeks on that day
- Example: `payment_day=5` → Every other Friday

### Monthly Cycle
- `payment_day`: 1-31 (day of month)
- Example: `payment_day=1` → 1st of every month
- **Note:** Days 29-31 may be skipped in short months

## Eligibility Criteria

Farmers are eligible for automated payment if:
1. ✅ `pending_payment_amount >= payment_threshold`
2. ✅ `paytm_enabled = 'YES'` (has payment account)
3. ✅ Today matches `payment_cycle` and `payment_day`
4. ✅ Admin has `auto_payment_enabled = 'YES'`

## Transaction Records

### Successful Payment
```sql
INSERT INTO payment_transactions (
  farmer_id,
  society_id,
  transaction_id,
  amount,
  payment_method,
  payment_date,
  transaction_status,
  is_automated,
  created_by,
  created_at
) VALUES (
  123,
  45,
  'AUTO_1706414400000_123',
  1250.50,
  'paytm',
  '2026-01-28',
  'pending',
  'YES',
  1,
  NOW()
);
```

### Failed Payment
```sql
INSERT INTO payment_transactions (
  ...
  transaction_status,
  failure_reason,
  is_automated,
  ...
) VALUES (
  ...
  'failed',
  'No payment method available',
  'YES',
  ...
);
```

## Monitoring & Logging

### PM2 Logs
```bash
# View live logs
pm2 logs payment-scheduler

# View last 100 lines
pm2 logs payment-scheduler --lines 100

# Clear logs
pm2 flush payment-scheduler
```

### Log File (Cron)
```bash
# View today's logs
tail -f logs/scheduler.log

# Search for errors
grep "❌" logs/scheduler.log

# Count successful payments
grep "✅ Payment scheduled" logs/scheduler.log | wc -l
```

### Database Queries

**Check Automated Payments:**
```sql
SELECT 
  pt.*,
  f.name as farmer_name,
  f.farmeruid
FROM payment_transactions pt
JOIN farmers f ON pt.farmer_id = f.id
WHERE pt.is_automated = 'YES'
ORDER BY pt.created_at DESC
LIMIT 20;
```

**Daily Summary:**
```sql
SELECT 
  DATE(created_at) as payment_date,
  COUNT(*) as total_payments,
  SUM(CASE WHEN transaction_status = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN transaction_status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(amount) as total_amount
FROM payment_transactions
WHERE is_automated = 'YES'
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;
```

## Troubleshooting

### Scheduler Not Running

**Check PM2 Status:**
```bash
pm2 list
# Should show 'payment-scheduler' with 'stopped' or 'online'
```

**Check PM2 Logs:**
```bash
pm2 logs payment-scheduler --err
```

**Restart Scheduler:**
```bash
pm2 restart payment-scheduler
```

---

### No Payments Processed

**Verify Settings:**
```sql
SELECT 
  auto_payment_enabled,
  payment_threshold,
  payment_cycle,
  payment_day
FROM admin_payment_settings;
```

**Check Eligible Farmers:**
```sql
SELECT 
  COUNT(*) as eligible_count
FROM farmers
WHERE pending_payment_amount >= 1000  -- Your threshold
AND paytm_enabled = 'YES';
```

**Verify Payment Day:**
- Daily: Should always run
- Weekly: Check day of week matches
- Monthly: Check day of month matches

---

### Payments Failing

**Check Payment Settings:**
```sql
SELECT 
  paytm_enabled,
  upi_enabled,
  bank_transfer_enabled
FROM admin_payment_settings;
```

**Verify Farmer Data:**
```sql
SELECT 
  name,
  paytm_phone,
  paytm_enabled
FROM farmers
WHERE id = ?;
```

**Review Error Logs:**
```bash
pm2 logs payment-scheduler | grep "❌"
```

---

## Production Recommendations

### Timing
- **Run during off-peak hours:** 2-4 AM recommended
- **Avoid business hours:** Prevents conflicts with manual payments
- **Consider time zones:** Schedule appropriately for your region

### Frequency
- **Daily:** High-volume operations, tight cash flow
- **Weekly:** Standard operations, moderate volume
- **Monthly:** Low volume, scheduled payroll style

### Monitoring
- **Set up alerts** for scheduler failures (PM2 webhooks)
- **Monitor logs daily** for unusual patterns
- **Review failed payments** and retry manually if needed

### Testing
```bash
# Test run without actual payments
node scripts/payment-scheduler.js --dry-run  # TODO: Implement flag

# Test specific admin
node scripts/payment-scheduler.js --admin=1  # TODO: Implement flag
```

### Backup Strategy
- **Before scheduler runs:** Backup payment_transactions table
- **Audit logs:** Keep 90 days of scheduler logs
- **Reconciliation:** Daily comparison of automated vs manual payments

## Integration with Notifications

Currently, the scheduler creates payment transactions but **does not trigger notifications**. 

**To enable notifications:**
1. Import notification service in scheduler
2. Fetch admin payment settings (already done)
3. Call notification service after successful payment
4. Handle notification failures gracefully (non-blocking)

**Planned enhancement:**
```javascript
// After successful payment
const { getNotificationService } = require('../src/lib/services/notifications');
const notificationService = getNotificationService(paymentSettings);

await notificationService.sendPaymentNotification({
  whatsapp_enabled: paymentSettings.whatsapp_notifications === 'YES',
  sms_enabled: paymentSettings.sms_notifications === 'YES',
  email_enabled: paymentSettings.email_notifications === 'YES'
}, farmerData, paymentData);
```

## Future Enhancements

- [ ] Dry-run mode for testing
- [ ] Admin-specific execution flag
- [ ] Email summary report after each run
- [ ] Retry failed payments automatically
- [ ] Notification integration
- [ ] Payment batch limits (max N per run)
- [ ] Priority-based processing (urgent farmers first)
- [ ] Webhook notifications to admin dashboard
- [ ] Historical trend analysis
- [ ] Cost tracking and budgeting

---

**Last Updated:** January 28, 2026
**Version:** 1.0
