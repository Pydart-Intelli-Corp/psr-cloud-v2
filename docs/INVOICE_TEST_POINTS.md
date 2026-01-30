# Invoice System Test Points - Quick Reference

**Version**: 1.0  
**Date**: January 28, 2026  
**Purpose**: Quick checklist for testing invoice generation system

---

## Pre-Test Setup Checklist

```
Environment
✅ [ ] SMTP credentials configured in .env.local
✅ [ ] NEXT_PUBLIC_BASE_URL set correctly
✅ [ ] Logo file exists at /public/fulllogo.png
✅ [ ] Application running (pm2 status or npm run dev)
✅ [ ] Database accessible
✅ [ ] Test farmer with email exists in database

Database Setup
✅ [ ] Farmers table has 'email' column
✅ [ ] At least 3 test farmers with valid emails
✅ [ ] At least 1 test farmer without email
✅ [ ] Test collections CSV file ready

Email Setup
✅ [ ] Test email inbox accessible
✅ [ ] Email client can receive PDF attachments
✅ [ ] Email not blocked by spam filters
✅ [ ] SMTP test passes: node test-email-config.js
```

---

## Critical Test Points (Must Pass)

### TP-001: New Collection with Valid Email
**Priority**: P0 - Critical  
**Estimated Time**: 5 minutes

```
Setup:
  • Farmer ID: [Enter test farmer ID]
  • Email: [Valid test email]
  • Collection: New (first time)
  
Steps:
  1. [ ] Upload collection CSV with test farmer data
  2. [ ] Check console: "📧 Invoice sent: Farmer X - INV-xxx"
  3. [ ] Check email inbox within 2 minutes
  4. [ ] Open email from "Poornasree Equipments Cloud"
  5. [ ] Verify email subject contains date
  6. [ ] Download PDF attachment
  7. [ ] Open PDF successfully
  
Verify PDF Content:
  ✅ [ ] Company logo displays at top
  ✅ [ ] Invoice number present (INV-schema-timestamp)
  ✅ [ ] Farmer ID matches upload
  ✅ [ ] Farmer name correct
  ✅ [ ] Collection date matches CSV
  ✅ [ ] Shift (MORNING/EVENING) correct
  ✅ [ ] Quantity (liters) matches CSV
  ✅ [ ] Fat percentage matches CSV
  ✅ [ ] SNF percentage matches CSV
  ✅ [ ] Rate per liter matches CSV
  ✅ [ ] Total amount = Quantity × Rate
  ✅ [ ] No data truncation or overlap
  ✅ [ ] Footer with generation date present
  
Verify Email Content:
  ✅ [ ] Greeting with farmer name
  ✅ [ ] Summary table with all details
  ✅ [ ] Total amount highlighted
  ✅ [ ] PDF attachment filename correct
  ✅ [ ] Professional formatting maintained
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-002: Collection Without Email Address
**Priority**: P0 - Critical  
**Estimated Time**: 3 minutes

```
Setup:
  • Farmer ID: [Farmer without email]
  • Email: NULL or empty
  • Collection: New
  
Steps:
  1. [ ] Verify farmer has no email: SELECT email FROM farmers WHERE farmer_id = 'X'
  2. [ ] Upload collection CSV
  3. [ ] Check console logs
  
Verify:
  ✅ [ ] Collection saved successfully in database
  ✅ [ ] Console shows: "⚠️ Invoice failed: No email address available"
  ✅ [ ] Upload completes normally
  ✅ [ ] No error thrown
  ✅ [ ] Success message shown to user
  ✅ [ ] No email sent
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-003: Duplicate Collection Upload
**Priority**: P0 - Critical  
**Estimated Time**: 4 minutes

```
Setup:
  • Same farmer, date, and shift as TP-001
  • Farmer has email
  
Steps:
  1. [ ] Upload same collection data again
  2. [ ] Check console logs
  3. [ ] Check email inbox
  
Verify:
  ✅ [ ] Collection updated (not duplicated) in database
  ✅ [ ] Console shows: "🔄 Updated" or "Duplicates Updated"
  ✅ [ ] NO new invoice sent
  ✅ [ ] No console message: "📧 Invoice sent"
  ✅ [ ] Only 1 email in inbox (from first upload)
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-004: Upload Performance (Non-Blocking)
**Priority**: P1 - High  
**Estimated Time**: 5 minutes

```
Setup:
  • CSV with 50 collections
  • Mix of farmers (some with, some without emails)
  
Steps:
  1. [ ] Note start time
  2. [ ] Upload 50-collection CSV
  3. [ ] Note end time of upload API response
  4. [ ] Monitor console for invoice messages
  
Verify:
  ✅ [ ] Upload API responds in < 30 seconds
  ✅ [ ] Upload completes before all invoices sent
  ✅ [ ] Console shows invoice messages after upload complete
  ✅ [ ] All collections saved to database
  ✅ [ ] Invoices sent in background (non-blocking)
  ✅ [ ] No timeout errors
  
Metrics:
  Upload Time: _______ seconds
  Total Collections: _______
  Invoices Sent: _______
  Invoices Failed (No Email): _______
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

## Important Test Points (Should Pass)

### TP-005: Email Delivery with Special Characters
**Priority**: P1 - High  
**Estimated Time**: 4 minutes

```
Setup:
  • Farmer name with special chars: "O'Brien & Sons"
  • Collection with decimal values
  
Steps:
  1. [ ] Create farmer with name containing: & ' -
  2. [ ] Upload collection
  3. [ ] Check email and PDF
  
Verify:
  ✅ [ ] Email sent successfully
  ✅ [ ] Special characters display correctly in email
  ✅ [ ] Special characters display correctly in PDF
  ✅ [ ] No encoding issues (?, �, etc.)
  ✅ [ ] Decimal values formatted correctly (2 decimal places)
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-006: Large Quantity Values
**Priority**: P2 - Medium  
**Estimated Time**: 3 minutes

```
Setup:
  • Quantity: 999.99 liters
  • Rate: 999.99
  • Total: 999980.00
  
Steps:
  1. [ ] Upload collection with large values
  2. [ ] Check PDF display
  
Verify:
  ✅ [ ] All numbers display correctly
  ✅ [ ] No truncation in PDF
  ✅ [ ] Total calculation accurate
  ✅ [ ] Currency formatting correct (₹)
  ✅ [ ] No overlapping text
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-007: Multiple Collections Same Day
**Priority**: P2 - Medium  
**Estimated Time**: 5 minutes

```
Setup:
  • Same farmer
  • Same date
  • MORNING and EVENING shifts
  
Steps:
  1. [ ] Upload MORNING collection
  2. [ ] Upload EVENING collection
  3. [ ] Check email inbox
  
Verify:
  ✅ [ ] 2 separate emails received
  ✅ [ ] 2 separate PDFs
  ✅ [ ] Different invoice numbers
  ✅ [ ] Shift correctly shown in each (MORNING/EVENING)
  ✅ [ ] Different PDF filenames
  ✅ [ ] Each PDF has correct shift data
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-008: Logo Display Verification
**Priority**: P1 - High  
**Estimated Time**: 3 minutes

```
Setup:
  • Ensure logo file exists
  • Upload any collection
  
Steps:
  1. [ ] Generate invoice
  2. [ ] Open PDF
  3. [ ] Inspect logo
  
Verify:
  ✅ [ ] Logo displays in top-left corner
  ✅ [ ] Logo not stretched or distorted
  ✅ [ ] Logo aspect ratio maintained (3:1)
  ✅ [ ] Logo quality sharp (not pixelated)
  ✅ [ ] Logo positioned correctly
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

## Error Handling Test Points

### TP-009: SMTP Failure Handling
**Priority**: P1 - High  
**Estimated Time**: 6 minutes

```
Setup:
  • Temporarily set wrong SMTP password
  • Farmer with valid email
  
Steps:
  1. [ ] Edit .env.local: SMTP_PASSWORD=wrong-password
  2. [ ] Restart application: pm2 restart psr-cloud-v2
  3. [ ] Upload collection
  4. [ ] Check console and database
  5. [ ] Restore correct password
  6. [ ] Restart application
  
Verify:
  ✅ [ ] Collection saved to database
  ✅ [ ] Console shows: "❌ Invoice error: SMTP error"
  ✅ [ ] Upload API returns success (collection saved)
  ✅ [ ] No application crash
  ✅ [ ] User sees upload success message
  ✅ [ ] Error logged but not exposed to user
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-010: Logo File Missing
**Priority**: P2 - Medium  
**Estimated Time**: 5 minutes

```
Setup:
  • Rename logo file temporarily
  • Farmer with email
  
Steps:
  1. [ ] Rename: mv public/fulllogo.png public/fulllogo.png.bak
  2. [ ] Upload collection
  3. [ ] Check console and email
  4. [ ] Restore: mv public/fulllogo.png.bak public/fulllogo.png
  
Verify:
  ✅ [ ] Console shows: "Could not load logo"
  ✅ [ ] Invoice still generated
  ✅ [ ] Email sent with PDF
  ✅ [ ] PDF contains all data except logo
  ✅ [ ] No application error
  ✅ [ ] All other content intact
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-011: Invalid Email Address
**Priority**: P2 - Medium  
**Estimated Time**: 4 minutes

```
Setup:
  • Farmer with invalid email: "notanemail"
  • Collection data ready
  
Steps:
  1. [ ] Set farmer email to invalid format
  2. [ ] Upload collection
  3. [ ] Check console logs
  
Verify:
  ✅ [ ] Collection saved
  ✅ [ ] Error logged for invalid email
  ✅ [ ] No application crash
  ✅ [ ] Upload completes successfully
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

## Data Accuracy Test Points

### TP-012: Calculation Accuracy
**Priority**: P0 - Critical  
**Estimated Time**: 5 minutes

```
Test Cases:
  Case 1: Qty=10.50, Rate=50.00, Expected=525.00
  Case 2: Qty=15.75, Rate=48.50, Expected=763.875 → 763.88
  Case 3: Qty=20.00, Rate=55.25, Expected=1105.00
  
Steps:
  1. [ ] Upload each test case
  2. [ ] Check PDF total amount
  
Verify Each Case:
  ✅ [ ] Total = Quantity × Rate
  ✅ [ ] Rounded to 2 decimal places
  ✅ [ ] Displayed with ₹ symbol
  ✅ [ ] No calculation errors
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-013: Date Format Validation
**Priority**: P1 - High  
**Estimated Time**: 4 minutes

```
Test Dates:
  • 2026-01-28 (YYYY-MM-DD format)
  • 28-01-26 (DD-MM-YY format)
  • 28/01/2026 (DD/MM/YYYY format)
  
Steps:
  1. [ ] Upload collection with each date format
  2. [ ] Check PDF display
  
Verify:
  ✅ [ ] Date parsed correctly from all formats
  ✅ [ ] PDF shows: DD/MM/YYYY (Indian format)
  ✅ [ ] Email shows: DD Month YYYY format
  ✅ [ ] No date parsing errors
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-014: Shift Normalization
**Priority**: P1 - High  
**Estimated Time**: 3 minutes

```
Test Shifts:
  • "MR" → Should display "MORNING"
  • "MORNING" → Should display "MORNING"
  • "EV" → Should display "EVENING"
  • "EVENING" → Should display "EVENING"
  
Steps:
  1. [ ] Upload collections with different shift formats
  2. [ ] Check PDF display
  
Verify:
  ✅ [ ] All variations normalized correctly
  ✅ [ ] PDF shows uppercase shift name
  ✅ [ ] Email shows uppercase shift name
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

## Email Client Compatibility

### TP-015: Multi-Client Email Display
**Priority**: P2 - Medium  
**Estimated Time**: 10 minutes

```
Test Clients:
  1. [ ] Gmail Web
  2. [ ] Outlook Web
  3. [ ] Mobile Gmail App (Android/iOS)
  4. [ ] Mobile Outlook App
  5. [ ] Desktop Email Client (Thunderbird/Outlook Desktop)
  
Steps:
  1. [ ] Send test invoice
  2. [ ] Open in each client
  
Verify for Each Client:
  ✅ [ ] Email displays correctly
  ✅ [ ] HTML table renders properly
  ✅ [ ] Colors preserved
  ✅ [ ] Fonts readable
  ✅ [ ] PDF attachment accessible
  ✅ [ ] PDF opens correctly
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

## Security Test Points

### TP-016: Email Privacy
**Priority**: P1 - High  
**Estimated Time**: 3 minutes

```
Setup:
  • Upload for 3 different farmers
  
Steps:
  1. [ ] Generate invoices for 3 farmers
  2. [ ] Check each email
  
Verify:
  ✅ [ ] Each farmer receives only their invoice
  ✅ [ ] No CC/BCC to other farmers
  ✅ [ ] No farmer data leaked to others
  ✅ [ ] Invoice number unique per farmer
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

### TP-017: Data Sanitization
**Priority**: P2 - Medium  
**Estimated Time**: 4 minutes

```
Setup:
  • Farmer name with HTML: "<script>alert('xss')</script>"
  • Society name with quotes: "ABC "Fresh" Milk"
  
Steps:
  1. [ ] Create farmer with malicious input
  2. [ ] Upload collection
  3. [ ] Check email and PDF
  
Verify:
  ✅ [ ] HTML tags not executed
  ✅ [ ] Special characters escaped
  ✅ [ ] No XSS vulnerability
  ✅ [ ] PDF displays sanitized text
  ✅ [ ] Email displays sanitized text
  
Result: ✅ PASS | ❌ FAIL
Notes: _________________________
```

---

## Test Summary Template

```
Test Date: ______________
Tester Name: ______________
Environment: [ ] Development  [ ] Staging  [ ] Production

Critical Tests (Must Pass):
  TP-001: [ ] PASS  [ ] FAIL  ___________________
  TP-002: [ ] PASS  [ ] FAIL  ___________________
  TP-003: [ ] PASS  [ ] FAIL  ___________________
  TP-004: [ ] PASS  [ ] FAIL  ___________________

High Priority Tests:
  TP-005: [ ] PASS  [ ] FAIL  ___________________
  TP-006: [ ] PASS  [ ] FAIL  ___________________
  TP-007: [ ] PASS  [ ] FAIL  ___________________
  TP-008: [ ] PASS  [ ] FAIL  ___________________
  TP-009: [ ] PASS  [ ] FAIL  ___________________

Medium Priority Tests:
  TP-010: [ ] PASS  [ ] FAIL  ___________________
  TP-011: [ ] PASS  [ ] FAIL  ___________________
  TP-012: [ ] PASS  [ ] FAIL  ___________________
  TP-013: [ ] PASS  [ ] FAIL  ___________________
  TP-014: [ ] PASS  [ ] FAIL  ___________________
  TP-015: [ ] PASS  [ ] FAIL  ___________________
  TP-016: [ ] PASS  [ ] FAIL  ___________________
  TP-017: [ ] PASS  [ ] FAIL  ___________________

Overall Result:
  Total Tests: _______
  Passed: _______
  Failed: _______
  Pass Rate: _______%

Ready for Production: [ ] YES  [ ] NO

Critical Issues Found:
_________________________________________________
_________________________________________________

Notes & Recommendations:
_________________________________________________
_________________________________________________

Approver Signature: ___________________
Date: ___________________
```

---

## Quick Test Commands

```bash
# Check system status
pm2 status psr-cloud-v2

# Monitor logs in real-time
pm2 logs psr-cloud-v2 --lines 50

# Test email configuration
node test-email-config.js

# Count today's invoices
pm2 logs psr-cloud-v2 --nostream | grep "$(date +%Y-%m-%d)" | grep "Invoice sent" | wc -l

# Check farmers without email
mysql -u user -p -e "USE schema; SELECT COUNT(*) FROM farmers WHERE email IS NULL;"

# Verify logo exists
ls -lh public/fulllogo.png

# Test logo accessibility
curl -I http://localhost:3000/fulllogo.png

# Clear PM2 logs (before test)
pm2 flush psr-cloud-v2
```

---

## Test Data Setup

```sql
-- Create test farmers
INSERT INTO farmers (farmer_id, name, email, society_id, contact_number)
VALUES 
  ('TEST001', 'Test Farmer One', 'test1@example.com', 1, '9876543210'),
  ('TEST002', 'Test Farmer Two', 'test2@example.com', 1, '9876543211'),
  ('TEST003', 'Test Farmer No Email', NULL, 1, '9876543212');

-- Verify test farmers
SELECT farmer_id, name, email FROM farmers WHERE farmer_id LIKE 'TEST%';

-- Clean up after testing
DELETE FROM farmers WHERE farmer_id LIKE 'TEST%';
DELETE FROM milk_collections WHERE farmer_id LIKE 'TEST%';
```

---

**Last Updated**: January 28, 2026  
**Document Owner**: QA Team  
**Review Before**: Production deployment
