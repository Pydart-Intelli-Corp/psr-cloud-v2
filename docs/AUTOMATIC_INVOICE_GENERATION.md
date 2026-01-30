# Automatic Invoice Generation for Milk Collections

## Overview
The PSR Cloud V2 system automatically generates and emails PDF invoices to farmers when their milk collections are uploaded from machines. This feature provides farmers with immediate receipts for their collections, improving transparency and record-keeping.

## Features

### 1. **Automatic Invoice Generation**
- PDF invoices generated automatically when new collections are uploaded
- Uses professional design matching existing report management PDFs
- Company logo and branding included
- Non-blocking process - doesn't affect collection upload speed

### 2. **Professional PDF Design**
Invoice includes:
- **Header Section**: Company logo, invoice title, invoice number, date
- **Farmer Information**: ID, name, society, email
- **Collection Details**: Date, shift, time, machine ID, machine type
- **Milk Quality & Pricing**: Quantity, fat %, SNF %, rate per liter
- **Total Amount**: Prominently displayed in highlighted box
- **Footer**: Generation timestamp, company name, confidentiality notice

### 3. **Email Delivery**
- Automatic email sent to farmer's registered email address
- PDF invoice attached to email
- Email includes collection summary in HTML format
- Professional email template with company branding

### 4. **Design Consistency**
- Uses same color scheme as report management PDFs
- Professional blue color palette (#2980b9, #34495e)
- Centered layout with modern card-based design
- Responsive font sizing and spacing

## Technical Implementation

### Invoice Service
**File**: `src/lib/services/invoiceService.ts`

#### Main Functions

1. **`generateCollectionInvoice(collectionData, options)`**
   - Generates PDF invoice using jsPDF
   - Parameters:
     - `collectionData`: Collection and farmer details
     - `options`: Admin schema, invoice number
   - Returns: PDF buffer

2. **`sendCollectionInvoiceEmail(collectionData, pdfBuffer, options)`**
   - Sends email with PDF attachment
   - Uses nodemailer with SMTP configuration
   - Professional HTML email template
   - Includes collection summary table

3. **`processCollectionInvoice(collectionData, options)`**
   - Main orchestration function
   - Validates farmer email
   - Generates invoice PDF
   - Sends email
   - Returns: Success status and invoice number

### Collection Upload Integration
**File**: `src/app/api/user/reports/collections/upload/route.ts`

#### Changes Made

1. **Import Invoice Service**
   ```typescript
   import { processCollectionInvoice } from '@/lib/services/invoiceService';
   ```

2. **Fetch Farmer Email**
   - Modified farmer query to include email field
   - Stores farmer name and email for invoice generation

3. **Non-Blocking Invoice Generation**
   - Triggered only for NEW collections (not duplicates)
   - Runs asynchronously after collection save
   - Doesn't block upload response
   - Logs success/failure for monitoring

## Usage

### For Admins

When uploading milk collection data:

1. **Upload CSV File**: Use the standard collection upload interface
2. **Automatic Processing**: System processes each collection
3. **Invoice Generation**: For each NEW collection:
   - Checks if farmer has email address
   - Generates professional PDF invoice
   - Sends email with PDF attachment
   - Logs result to console

### For Farmers

Farmers receive:

1. **Email Notification**: Sent to their registered email address
2. **Collection Summary**: HTML table in email with key details
3. **PDF Attachment**: Professional invoice for record-keeping
4. **File Name**: `Invoice_[FarmerID]_[Date]_[Shift].pdf`

## Email Template

### Subject Line
```
Milk Collection Invoice - [Date in DD Month YYYY format]
```

### Email Content
- Personalized greeting with farmer name
- Collection summary table:
  - Invoice Number
  - Collection Date
  - Shift
  - Quantity (Liters)
  - Fat %
  - SNF %
  - Total Amount (highlighted)
- Professional footer with company branding
- Automated email disclaimer

## PDF Invoice Structure

### Page Layout
- **Orientation**: Portrait
- **Size**: A4 (595 x 842 points)
- **Margins**: 50pt on all sides

### Color Scheme
```typescript
Primary: RGB(41, 128, 185)   // Professional blue
Secondary: RGB(52, 73, 94)    // Dark blue-gray
Accent: RGB(231, 76, 60)      // Red accent
Light: RGB(236, 240, 241)     // Light gray
Text: RGB(44, 62, 80)         // Dark text
Border: RGB(189, 195, 199)    // Light border
```

### Sections

1. **Header (180pt)**
   - Light gray background
   - Blue accent bar (8pt)
   - Company logo (120x40pt)
   - Centered title and subtitle
   - Invoice number and date

2. **Farmer Information Card (140pt)**
   - Blue header with white text
   - Light gray background
   - 4 rows: Farmer ID, Name, Society, Email

3. **Collection Details Card (200pt)**
   - Blue header
   - 5 rows: Date, Shift, Time, Machine ID, Machine Type

4. **Milk Quality & Pricing Card (180pt)**
   - Blue header
   - Quality parameters with values
   - Quantity highlighted in primary blue

5. **Total Amount Box (50pt)**
   - Red accent background
   - Large white text
   - Prominently displayed total

6. **Footer (90pt)**
   - Light gray background
   - Blue accent line
   - Thank you message
   - Generation timestamp
   - Company name
   - Confidentiality notice

## Configuration

### Environment Variables Required

```bash
# Email (SMTP) Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Base URL (for logo fetching in server-side PDF generation)
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Local
NEXT_PUBLIC_BASE_URL=https://your-domain.com  # Production
```

### Logo Requirements

- **File**: `/public/fulllogo.png`
- **Recommended Size**: 480x160 pixels (3:1 aspect ratio)
- **Display Size in PDF**: 120x40 points
- **Format**: PNG with transparency

## Error Handling

### Non-Blocking Design
- Invoice generation runs asynchronously
- Collection upload succeeds even if invoice fails
- Errors logged to console without affecting user experience

### Common Scenarios

1. **No Email Address**
   ```
   Warning: No email found for Farmer X, skipping invoice
   Result: Collection saved, no invoice sent
   ```

2. **Logo Fetch Failure**
   ```
   Warning: Could not load logo
   Result: Invoice generated without logo
   ```

3. **Email Send Failure**
   ```
   Error: Invoice error: Farmer X - SMTP error
   Result: Collection saved, invoice not sent
   ```

4. **PDF Generation Error**
   ```
   Error: Failed to process invoice
   Result: Collection saved, no invoice sent
   ```

## Monitoring

### Console Logs

**Successful Invoice**:
```
📧 Invoice sent: Farmer 123 - INV-adminschema-1234567890
```

**Failed Invoice (No Email)**:
```
⚠️ Invoice failed: Farmer 123 - No email address available for farmer
```

**Failed Invoice (Error)**:
```
❌ Invoice error: Farmer 123 - Error details
```

## Invoice Numbering

Format: `INV-[AdminSchema]-[Timestamp]`

Example: `INV-myona_myo1862-1706789234567`

- Unique per collection
- Includes admin schema for multi-tenant isolation
- Timestamp ensures uniqueness

## Testing

### Test Checklist

1. **Upload Collection with Email**
   - ✅ Collection saved successfully
   - ✅ Invoice generated with correct details
   - ✅ Email sent with PDF attachment
   - ✅ PDF opens correctly with all sections
   - ✅ Logo displays properly

2. **Upload Collection without Email**
   - ✅ Collection saved successfully
   - ✅ Warning logged (no invoice sent)
   - ✅ Upload process completes normally

3. **Duplicate Collection Upload**
   - ✅ Collection updated
   - ✅ No invoice sent (only for new collections)

4. **Email Content Validation**
   - ✅ Correct farmer name
   - ✅ Accurate collection details
   - ✅ Correct amounts and calculations
   - ✅ PDF attachment present

5. **PDF Content Validation**
   - ✅ Company logo visible
   - ✅ All farmer information correct
   - ✅ Collection details accurate
   - ✅ Quality parameters displayed
   - ✅ Total amount matches calculation
   - ✅ Footer information present

## Future Enhancements

### Potential Improvements

1. **Invoice Storage**
   - Store invoice PDFs in database or file system
   - Add invoice history view in farmer portal
   - Track invoice delivery status

2. **Customization Options**
   - Admin-configurable email templates
   - Custom invoice branding per admin
   - Multiple language support

3. **Batch Invoice Generation**
   - Generate monthly summary invoices
   - Consolidated statements for multiple collections
   - Downloadable invoice archives

4. **Delivery Options**
   - SMS notification with invoice link
   - WhatsApp delivery integration
   - Farmer portal download option

5. **Analytics**
   - Track invoice generation success rate
   - Monitor email delivery rates
   - Invoice view/download tracking

## Troubleshooting

### Issue: Invoices Not Being Sent

**Check**:
1. Farmer has valid email address in database
2. SMTP configuration is correct
3. Collection is NEW (not duplicate)
4. Check console logs for error messages

**Solution**:
```bash
# Verify email configuration
echo $SMTP_HOST
echo $SMTP_USERNAME

# Check farmer email in database
SELECT farmer_id, name, email FROM farmers WHERE farmer_id = 'X';
```

### Issue: PDF Logo Not Displaying

**Check**:
1. Logo file exists at `/public/fulllogo.png`
2. NEXT_PUBLIC_BASE_URL is set correctly
3. Logo file is accessible via HTTP

**Solution**:
```bash
# Verify logo exists
ls public/fulllogo.png

# Check base URL
echo $NEXT_PUBLIC_BASE_URL

# Test logo access
curl http://localhost:3000/fulllogo.png
```

### Issue: Email Delivery Slow

**Note**: Invoice generation is non-blocking and runs asynchronously. Collection uploads complete immediately; invoices are sent in the background.

**If delays persist**:
1. Check SMTP server performance
2. Consider using email queue (Redis/Bull)
3. Monitor email service provider limits

## Best Practices

### For Admins

1. **Ensure Farmer Emails**: Collect and maintain accurate farmer email addresses
2. **Logo Setup**: Use high-quality logo image for professional appearance
3. **Monitor Logs**: Regularly check console for invoice generation issues
4. **Test Regularly**: Periodically upload test collections to verify system

### For Developers

1. **Non-Blocking**: Keep invoice generation asynchronous
2. **Error Handling**: Don't let invoice failures affect collection uploads
3. **Logging**: Log all invoice generation attempts for debugging
4. **Testing**: Test with various edge cases (no email, invalid data, etc.)

## Related Documentation

- [Database Management](./DATABASE_MANAGEMENT.md)
- [CSV Upload Formats](./CSV_UPLOAD_FORMATS.md)
- [Payment System Overview](./PAYMENT_SYSTEM_OVERVIEW.md)
- [Email Service Configuration](./EMAIL_CONFIGURATION.md)

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify environment variables are set
3. Test email configuration with simple send
4. Review farmer email addresses in database
5. Check logo file accessibility

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: PSR Cloud Development Team
