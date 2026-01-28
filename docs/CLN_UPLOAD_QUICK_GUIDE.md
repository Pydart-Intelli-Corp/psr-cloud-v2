# CLN and Non-ECOD Machine Upload Guide

Quick reference for uploading data from CLN (Cleaning), AMR (Automatic Milk Recording), and other non-ECOD machines.

## ✅ Your CSV Format is Already Supported!

The **PSR_CLN_093.CSV** format is the **Standard Format** that is fully supported by the system.

## CSV Structure

### Header Information (Lines 1-5)
```
Machine Serial:093 
Collection Report - All
Collection Report - All
Date From 19-1-26 To 19-1-26
Channel:0-ALL 
```

### Data Header (Line 6)
```
Date,Time,Shift,ID,Channel,Fat,SNF,CLR,Water,Qty,Rate,Incentive,Amount
```

### Data Rows (Line 7+)
```
2026-01-19,14:31:03,MR,1,COW    ,0.00,0.00,0,99,10.00,0.00,0.00,0.00
```

### Summary Lines (Auto-skipped)
```
Avg.Fat=0.00
Avg.SNF=0.00
Avg.CLR=0
Total Liters=10.00
Avg.Rate=0.00
Total Amount=0.00
```

## Supported Machine Types

✅ **CLN** - Cleaning machines  
✅ **AMR** - Automatic Milk Recording  
✅ **Any custom machine type** (as long as it's NOT "ECOD")

The system automatically detects the format based on your machine's registered type.

## Upload Steps

### 1. Register Your Machine (One-time setup)

1. Go to **Management → Machines**
2. Click "Add Machine"
3. Fill in:
   - **Machine ID**: `093` (or your machine serial)
   - **Machine Type**: `CLN` (or `AMR`, or your custom type)
   - **Society**: Select the society using this machine
4. Click "Save"

⚠️ **Important**: Do NOT use "ECOD" in the machine type unless it's actually an ECOD machine!

### 2. Upload CSV Data

1. Go to **Reports → Collection Reports**
2. Click "Upload" button
3. Enter your admin password
4. In the upload dialog:
   - **Select Dairy** → Choose dairy
   - **Select BMC** → Choose BMC
   - **Select Society** → Choose society
   - **Select Machine** → Choose your CLN/AMR machine
   - **Report Type** → Collection Report
5. You'll see: **"Detected Format: Standard (CLN/AMR/Custom)"**
6. Click "Choose File" and select your CSV
7. System validates the format automatically
8. Click "Upload"

### 3. Verify Upload

After upload, you'll see:
```
Successfully uploaded X of Y records
```

Any errors will be listed with farmer IDs for easy tracking.

## Column Mapping

| CSV Column | Database Field | Notes |
|-----------|---------------|-------|
| Date | collection_date | Auto-converts DD-M-YY to YYYY-MM-DD |
| Time | collection_time | Supports 24-hour format |
| Shift | shift_type | MR/M → morning, ER/E → evening |
| ID | farmer_id | Leading zeros auto-stripped |
| Channel | channel | COW, BUFFALO, or MIXED |
| Fat | fat_percentage | Decimal value |
| SNF | snf_percentage | Decimal value |
| CLR | clr_value | Integer value |
| Water | water_percentage | Decimal value |
| Qty | quantity | Liters |
| Rate | rate_per_liter | Rate per liter |
| Incentive | bonus | Bonus amount |
| Amount | total_amount | Total payment |

## Data Normalization

### Automatic Conversions

**Shifts:**
- `MR`, `MOR`, `MORNING`, `MX` → `morning`
- `ER`, `ERE`, `EVENING`, `EV`, `EX` → `evening`

**Channels:**
- `COW`, `CH1` → `COW`
- `BUFFALO`, `BUF`, `CH2` → `BUFFALO`
- `MIXED`, `MIX`, `CH3` → `MIXED`

**Dates:**
- `19-1-26` → `2026-01-19`
- `19/1/26` → `2026-01-19`
- Years < 50 → 20XX, Years >= 50 → 19XX

**Farmer IDs:**
- `000001` → `1`
- `0001` → `1`
- Leading zeros removed automatically

## Validation Rules

✅ **Auto-passes:**
- CSV has proper header structure
- Minimum 12 columns per data row
- Summary lines (Avg., Total) auto-skipped
- Empty lines ignored

❌ **Common Errors:**

**"Machine serial not found"**
- Solution: Select machine in upload dialog

**"Machine not found. Please register the machine first."**
- Solution: Add machine in Machine Management

**"No valid collection records found in CSV"**
- Solution: Check that data rows have all 13 columns
- Ensure header line exists

## Differences from ECOD Format

| Feature | Standard (CLN/AMR) | ECOD |
|---------|-------------------|------|
| First line | `Machine Serial:093` | `Station :` |
| Header rows | 5 rows before data | 5 rows before data |
| ID column | Direct `ID` | `ID` (4th column) |
| Channel column | 5th column `Channel` | 6th column `Milk` |
| Has Name column | ❌ No | ✅ Yes (5th column) |
| Qty column position | 10th | 13th |
| Bonus column name | `Incentive` | `Bonus` |
| Amount column name | `Amount` | `Total` |

## Testing Your CSV

You can test your CSV format before uploading:

1. Make sure first line has: `Machine Serial:XXX`
2. Check header line (row 6) matches exactly:
   ```
   Date,Time,Shift,ID,Channel,Fat,SNF,CLR,Water,Qty,Rate,Incentive,Amount
   ```
3. Data rows must have at least 13 values
4. Use the upload dialog - it validates immediately when you select the file

## Sample Files

**Working Example:**
```
Machine Serial:093 
Collection Report - All
Collection Report - All
Date From 19-1-26 To 19-1-26
Channel:0-ALL 

Date,Time,Shift,ID,Channel,Fat,SNF,CLR,Water,Qty,Rate,Incentive,Amount
2026-01-19,14:31:03,MR,1,COW    ,0.00,0.00,0,99,10.00,0.00,0.00,0.00
2026-01-19,14:35:22,MR,2,BUFFALO,4.50,8.90,25,0,15.50,45.00,5.00,702.50
2026-01-19,18:15:33,ER,3,COW    ,3.80,8.50,23,0,12.00,42.00,3.00,507.00
Avg.Fat=2.77
Avg.SNF=5.80
Avg.CLR=16
Total Liters=37.50
Avg.Rate=29.00
Total Amount=1209.50
```

## API Endpoint

For programmatic uploads:

```bash
POST /api/user/reports/collections/upload
Content-Type: multipart/form-data

Parameters:
- file: CSV file
- machineId: 093 (or database ID)
```

## Troubleshooting

### Upload fails silently

1. Check browser console for errors
2. Verify machine exists in database
3. Confirm CSV file is UTF-8 encoded
4. Test with sample file first

### Data appears in wrong format

1. Verify machine type does NOT contain "ECOD"
2. Check CSV header matches Standard format
3. Use upload dialog (not direct API) for auto-detection

### Some records fail to upload

1. Check farmer IDs exist in the society
2. Verify all numeric fields are valid numbers
3. Review error messages in upload summary
4. Common: Farmer not registered → Add farmer first

## Need Help?

- Sample file: `public/sample_datas/PSR_CLN_093.CSV`
- Full documentation: `docs/CSV_UPLOAD_FORMATS.md`
- Format comparison: See table above for ECOD vs Standard differences
