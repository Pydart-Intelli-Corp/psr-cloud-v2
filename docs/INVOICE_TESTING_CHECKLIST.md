# Invoice System Testing Checklist

## Pre-Testing Setup

### Environment Variables
```bash
# Verify these are set in .env.local
✅ SMTP_HOST
✅ SMTP_PORT
✅ SMTP_SECURE
✅ SMTP_USERNAME
✅ SMTP_PASSWORD
✅ NEXT_PUBLIC_BASE_URL
```

### Database Setup
```sql
-- Verify farmers table has email column
SELECT farmer_id, name, email FROM farmers LIMIT 5;

-- Add test farmer with email if needed
UPDATE farmers SET email = 'test@example.com' WHERE farmer_id = '1';
```

### Files to Verify
```
✅ /public/fulllogo.png exists
✅ src/lib/services/invoiceService.ts created
✅ Collection upload route updated
```

## Test Cases

### 1. New Collection with Valid Email

**Setup**:
- Farmer ID: 1
- Email: valid-email@example.com
- Collection: New (not duplicate)

**Steps**:
1. Upload collection CSV with Farmer 1 data
2. Wait for upload completion
3. Check console logs
4. Check farmer's email inbox

**Expected Results**:
```
✅ Collection uploaded successfully
✅ Console shows: "📧 Invoice sent: Farmer 1 - INV-[schema]-[timestamp]"
✅ Email received with subject: "Milk Collection Invoice - [Date]"
✅ PDF attachment present in email
✅ PDF opens without errors
✅ All details correct in PDF
```

**Verify PDF Content**:
- [ ] Company logo displays
- [ ] Farmer ID: 1
- [ ] Farmer name matches database
- [ ] Society name correct
- [ ] Collection date correct
- [ ] Shift (MORNING/EVENING) correct
- [ ] Quantity matches CSV
- [ ] Fat % matches CSV
- [ ] SNF % matches CSV
- [ ] Rate matches CSV
- [ ] Total amount calculated correctly
- [ ] Invoice number unique
- [ ] Footer information present

**Verify Email Content**:
- [ ] Subject line correct
- [ ] Greeting with farmer name
- [ ] Collection summary table present
- [ ] All values match PDF
- [ ] PDF attachment filename correct format
- [ ] Professional design maintained

---

### 2. New Collection without Email

**Setup**:
- Farmer ID: 2
- Email: NULL or empty
- Collection: New

**Steps**:
1. Ensure Farmer 2 has no email in database
2. Upload collection CSV with Farmer 2 data
3. Check console logs

**Expected Results**:
```
✅ Collection uploaded successfully
✅ Console shows: "⚠️ Invoice failed: Farmer 2 - No email address available"
✅ No email sent
✅ Upload completes normally
```

---

### 3. Duplicate Collection Upload

**Setup**:
- Farmer ID: 1
- Email: valid-email@example.com
- Collection: Same date and shift as previous

**Steps**:
1. Upload same collection data twice
2. Check console logs

**Expected Results**:
```
✅ First upload: Collection inserted, invoice sent
✅ Second upload: Collection updated, NO invoice sent
✅ Console shows duplicate update message
```

---

### 4. Bulk Upload with Mixed Cases

**Setup**:
- CSV with 10 farmers
- 5 with emails, 5 without emails
- All new collections

**Steps**:
1. Upload CSV with 10 collections
2. Monitor console logs
3. Check email inboxes for 5 farmers

**Expected Results**:
```
✅ All 10 collections saved
✅ 5 invoices sent successfully
✅ 5 warnings for missing emails
✅ Console shows individual results
✅ Upload completes in reasonable time
```

---

### 5. Email Service Failure

**Setup**:
- Temporarily set wrong SMTP password
- Farmer with valid email

**Steps**:
1. Change SMTP_PASSWORD to incorrect value
2. Upload collection
3. Check console logs
4. Restore correct SMTP_PASSWORD

**Expected Results**:
```
✅ Collection saved successfully
✅ Console shows: "❌ Invoice error: Farmer X - SMTP error"
✅ Upload completes (non-blocking)
✅ User sees success message for collection
```

---

### 6. Logo Loading Failure

**Setup**:
- Temporarily rename /public/fulllogo.png
- Farmer with valid email

**Steps**:
1. Rename logo file
2. Upload collection
3. Check email and PDF
4. Restore logo file

**Expected Results**:
```
✅ Collection saved
✅ Invoice email sent
✅ Console shows: "Could not load logo"
✅ PDF generated without logo
✅ All other content present
```

---

### 7. PDF Content Validation

**Setup**:
- Collection with specific values
- Farmer with email

**Test Data**:
```
Farmer ID: 123
Name: Test Farmer
Society: Test Society
Date: 2025-01-28
Shift: MORNING
Quantity: 10.50
Fat: 4.2
SNF: 8.5
Rate: 50.00
Amount: 525.00
```

**Steps**:
1. Upload collection with above data
2. Download PDF from email
3. Verify all values

**Expected PDF Content**:
- [ ] Invoice Number: INV-[schema]-[timestamp]
- [ ] Farmer ID: 123
- [ ] Farmer Name: Test Farmer
- [ ] Society: Test Society
- [ ] Collection Date: 28/01/2025
- [ ] Shift: MORNING
- [ ] Quantity: 10.50 L
- [ ] Fat: 4.20%
- [ ] SNF: 8.50%
- [ ] Rate: ₹50.00
- [ ] Total: ₹525.00
- [ ] All calculations correct

---

### 8. Email Formatting Test

**Setup**:
- Farmer with email
- New collection

**Steps**:
1. Upload collection
2. Open email in different clients:
   - Gmail web
   - Outlook web
   - Mobile email app
   - Desktop email client

**Expected Results**:
```
✅ Email displays correctly in all clients
✅ HTML table renders properly
✅ Colors and formatting preserved
✅ PDF attachment accessible
```

---

### 9. Multiple Collections Same Farmer Same Day

**Setup**:
- Farmer with email
- Two collections: MORNING and EVENING

**Steps**:
1. Upload MORNING collection
2. Upload EVENING collection
3. Check email inbox

**Expected Results**:
```
✅ 2 emails received
✅ Each with different shift
✅ Different invoice numbers
✅ Different PDF filenames
```

---

### 10. Performance Test

**Setup**:
- CSV with 100 collections
- All farmers with emails

**Steps**:
1. Upload CSV with 100 collections
2. Time the upload process
3. Monitor console logs

**Expected Results**:
```
✅ Upload completes in < 30 seconds
✅ API responds immediately (non-blocking invoices)
✅ All 100 invoices queued for sending
✅ Console shows progress
✅ No timeout errors
```

---

## Test Execution Log

### Test Session: [Date]

| Test Case | Status | Notes | Issues |
|-----------|--------|-------|--------|
| 1. Valid Email | ⬜ | | |
| 2. No Email | ⬜ | | |
| 3. Duplicate | ⬜ | | |
| 4. Bulk Upload | ⬜ | | |
| 5. Email Failure | ⬜ | | |
| 6. Logo Failure | ⬜ | | |
| 7. Content Validation | ⬜ | | |
| 8. Email Formatting | ⬜ | | |
| 9. Multiple Collections | ⬜ | | |
| 10. Performance | ⬜ | | |

Legend: ✅ Pass | ❌ Fail | ⬜ Not Tested | ⚠️ Pass with Issues

---

## Debugging Commands

### Check Console Logs
```bash
# Production (PM2)
pm2 logs psr-cloud-v2 --lines 100

# Development
npm run dev
# Watch console output
```

### Database Queries

```sql
-- Check farmer emails
SELECT farmer_id, name, email 
FROM farmers 
WHERE email IS NOT NULL 
LIMIT 10;

-- Check recent collections
SELECT * FROM milk_collections 
ORDER BY created_at DESC 
LIMIT 10;

-- Update farmer email for testing
UPDATE farmers 
SET email = 'your-test-email@example.com' 
WHERE farmer_id = '1';
```

### Test Email Configuration

```javascript
// Test file: test-email.js
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

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email config error:', error);
  } else {
    console.log('✅ Email server ready');
  }
});
```

---

## Common Issues & Solutions

### Issue: Invoices not sending

**Check**:
1. Farmer has email: `SELECT email FROM farmers WHERE farmer_id = 'X'`
2. SMTP config: Test with simple email send
3. Console errors: Look for error messages
4. Network: Ensure SMTP port not blocked

**Solution**:
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check environment variables
echo $SMTP_USERNAME
echo $SMTP_HOST
```

---

### Issue: PDF logo not showing

**Check**:
1. Logo file exists: `ls public/fulllogo.png`
2. Base URL set: `echo $NEXT_PUBLIC_BASE_URL`
3. Logo accessible: `curl http://localhost:3000/fulllogo.png`

**Solution**:
```bash
# Ensure logo exists
cp /path/to/logo.png public/fulllogo.png

# Set base URL
export NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

### Issue: Wrong amounts in invoice

**Check**:
1. CSV data: Verify rate and quantity
2. Calculation: `amount = quantity * rate`
3. Database values: Check saved collection

**Solution**:
```sql
-- Verify collection data
SELECT farmer_id, quantity, rate_per_liter, total_amount,
       (quantity * rate_per_liter) as calculated
FROM milk_collections
WHERE farmer_id = 'X'
ORDER BY created_at DESC
LIMIT 1;
```

---

### Issue: Slow invoice sending

**Note**: This is expected behavior. Invoices send asynchronously.

**If genuinely slow**:
1. Check SMTP server response time
2. Consider email queue system
3. Monitor network latency

---

## Success Criteria

All tests must pass:
- ✅ Valid email: Invoice sent successfully
- ✅ No email: Warning logged, upload succeeds
- ✅ Duplicate: No invoice, upload succeeds
- ✅ Bulk upload: All emails sent
- ✅ Email failure: Collection saved, error logged
- ✅ Logo failure: Invoice sent without logo
- ✅ Content: All data accurate
- ✅ Formatting: Displays correctly
- ✅ Multiple: Separate invoices
- ✅ Performance: < 30 seconds for 100 records

---

## Post-Testing

### Cleanup
```sql
-- Remove test farmer emails if needed
UPDATE farmers SET email = NULL WHERE farmer_id IN ('test1', 'test2');

-- Delete test collections
DELETE FROM milk_collections WHERE farmer_id = 'test1';
```

### Documentation
- [ ] Update test results
- [ ] Document any issues found
- [ ] Update known limitations
- [ ] Update troubleshooting guide

### Deployment Checklist
- [ ] All tests passed
- [ ] No compilation errors
- [ ] Environment variables set in production
- [ ] Logo file deployed
- [ ] SMTP credentials verified
- [ ] Monitoring in place

---

## Continuous Monitoring

### Daily Checks
```bash
# Check invoice success rate
pm2 logs | grep "Invoice sent"
pm2 logs | grep "Invoice failed"
pm2 logs | grep "Invoice error"

# Count today's invoices
pm2 logs | grep "Invoice sent" | grep "$(date +%Y-%m-%d)" | wc -l
```

### Weekly Review
- Invoice success rate
- Common failure reasons
- Email delivery issues
- Farmer email update needs

---

**Test Owner**: [Your Name]  
**Last Test Date**: [Date]  
**Next Test Date**: [Date]  
**Status**: ⬜ Pending | ✅ Passed | ❌ Failed
