# CSV Upload Formats Guide

This document describes the supported CSV formats for uploading collection, dispatch, and sales data from various machine types.

## Collection Data Upload Formats

The system supports **two CSV formats** for collection data uploads:

### 1. Standard Format (CLN, AMR, and other machines)

**File Structure:**
```
Machine Serial:093 
Collection Report - All
Collection Report - All
Date From 19-1-26 To 19-1-26
Channel:0-ALL 

Date,Time,Shift,ID,Channel,Fat,SNF,CLR,Water,Qty,Rate,Incentive,Amount
2026-01-19,14:31:03,MR,1,COW    ,0.00,0.00,0,99,10.00,0.00,0.00,0.00
Avg.Fat=0.00
Avg.SNF=0.00
Avg.CLR=0
Total Liters=10.00
Avg.Rate=0.00
Total Amount=0.00
```

**Column Mapping:**
- **Date** - Collection date (DD-M-YY or DD/M/YY)
- **Time** - Collection time (HH:MM:SS or 12-hour format with AM/PM)
- **Shift** - Shift type (MR/Morning/M → morning, ER/Evening/E → evening)
- **ID** - Farmer ID (leading zeros will be stripped)
- **Channel** - Milk type (COW/CH1, BUFFALO/BUF/CH2, MIXED/MIX/CH3)
- **Fat** - Fat percentage
- **SNF** - Solids Not Fat percentage
- **CLR** - CLR value
- **Water** - Water percentage
- **Qty** - Quantity in liters
- **Rate** - Rate per liter
- **Incentive** - Bonus/incentive amount
- **Amount** - Total amount

**Supported Machines:**
- CLN (Cleaning machines)
- AMR (Automatic Milk Recording)
- Any custom machine types
- Any machine **not** designated as ECOD

---

### 2. ECOD Format

**File Structure:**
```
Station :                   
00000002
19/01/26
Collection Report -Shift Day
Milk-All
Date,Time,shift,ID,Name,Milk,Fat,SNF, CLR,Water,Rate,Bonus,Qty,Total
28/01/26,09:07:14AM,EVE,000001,SRI                                                         ,COW    ,00.30 ,03.60 ,12.00 ,56,010.00 ,00.00,00000.00 ,00000.00,
 
TOTAL:, 
Avg.FAT:,000000.00 
Avg.SNF:,000000.00 
Avg.CLR:,000000.00 
Avg.Rate:,000000.00 
Total Qty:,000000.00 
TotalAmt:,000000.00
```

**Column Mapping:**
- **Date** - Collection date
- **Time** - Collection time (12-hour format with AM/PM)
- **shift** - Shift type
- **ID** - Farmer ID (leading zeros will be stripped)
- **Name** - Farmer name (not stored, display only)
- **Milk** - Milk type/Channel (COW/BUFFALO/MIXED)
- **Fat** - Fat percentage
- **SNF** - SNF percentage
- **CLR** - CLR value
- **Water** - Water percentage
- **Rate** - Rate per liter
- **Bonus** - Bonus/incentive amount
- **Qty** - Quantity in liters
- **Total** - Total amount

**Supported Machines:**
- ECOD (Electronic Collection of Data) machines
- Machines with "ECOD" in their machine_type
- CSV files with "Station :" in the first line

---

## Format Detection

The system automatically detects which format to use based on:

1. **Machine Type**: If the machine's `machine_type` contains "ECOD", it uses ECOD format
2. **CSV Header**: If the first line contains "Station :", it uses ECOD format
3. **Default**: All other machines use Standard format

---

## Data Normalization

### Shift Type Normalization
- **Morning**: MR, MOR, MORNING, MX, or any text starting with 'M'
- **Evening**: ER, ERE, EVENING, EV, EX, or any text starting with 'E'
- Default: Morning if not recognized

### Channel Normalization
- **COW**: COW, CH1, ch1
- **BUFFALO**: BUFFALO, BUF, CH2, ch2
- **MIXED**: MIXED, MIX, CH3, ch3

### Date Formats
Accepted formats:
- DD-M-YY (e.g., 19-1-26)
- DD/M/YY (e.g., 19/1/26)
- DD-MM-YY
- DD/MM/YY

Automatically converts 2-digit years:
- Years < 50 → 20XX (e.g., 26 → 2026)
- Years >= 50 → 19XX (e.g., 95 → 1995)

### Time Formats
Accepted formats:
- 24-hour: HH:MM:SS (e.g., 14:31:03)
- 12-hour: HH:MM:SS AM/PM (e.g., 02:07:14PM)

### Farmer ID
- Leading zeros are automatically stripped
- "000001" → "1"
- "0001" → "1"
- If all zeros, becomes "0"

---

## Upload Process

### 1. Via Upload Dialog (Recommended)

1. Click "Upload" button in Reports page
2. Enter admin password for verification
3. Select hierarchy:
   - Select Dairy
   - Select BMC
   - Select Society
   - **Select Machine** (CRITICAL - determines format)
4. Choose CSV file
5. Click "Upload"

The system will:
- Verify the machine exists
- Detect the correct CSV format based on machine type
- Parse and validate data
- Insert records into the database
- Display success/error summary

### 2. Via Automatic Detection (Legacy)

If you don't select a machine in the upload dialog, the system will try to extract the machine serial from the CSV:

**Standard Format:**
```
Machine Serial:093
```

**ECOD Format:**
```
Station :
00000002
```

---

## Machine Registration

Before uploading data, ensure the machine is registered:

1. Go to **Management → Machines**
2. Click "Add Machine"
3. Fill in:
   - **Machine ID**: Serial number (e.g., "093")
   - **Machine Type**: Type description (e.g., "CLN", "ECOD", "AMR")
   - **Society**: Link to a society
4. Save

The `Machine Type` field determines which CSV format the system will use:
- If contains "ECOD" → ECOD format
- Otherwise → Standard format

---

## Sample Files

Sample CSV files are available in `/public/sample_datas/`:

### Collection Data
- `PSR_CLN_093.CSV` - CLN machine (Standard format)
- `190126_E_collection.CSV` - ECOD machine (ECOD format)

### Dispatch Data
- `PSR_DES_ID_01001.CSV` - Dispatch records
- `190126_E_Despatch.CSV` - ECOD dispatch

### Sales Data
- `SALES_R.CSV` - Sales records
- `PSR_SALES.CSV` - Alternative sales format

---

## Error Handling

### Common Errors

**"Machine serial not found in CSV or form data"**
- Solution: Select machine in upload dialog, or ensure CSV has proper header

**"Machine not found. Please register the machine first."**
- Solution: Register the machine in Machine Management before uploading

**"No valid collection records found in CSV"**
- Solution: Check CSV format matches expected structure
- Ensure header line contains "Date" and "Time"
- Check that data rows have sufficient columns

**"CSV header not found"**
- Solution: Ensure CSV has proper header line with column names

### Validation Rules

- Minimum 12 columns required per data row
- Farmer ID cannot be empty (will default to "0")
- Quantity, rate, and amount must be numeric (will default to 0 if invalid)
- Date must be parseable
- Summary lines (Avg., Total, etc.) are automatically skipped

---

## API Endpoint

**URL**: `/api/user/reports/collections/upload`  
**Method**: POST  
**Content-Type**: multipart/form-data

**Parameters:**
- `file` (File): CSV file to upload
- `machineId` (optional): Database ID or serial number of machine

**Response:**
```json
{
  "message": "Upload completed",
  "machineSerial": "093",
  "societyName": "ABC Society",
  "totalRows": 50,
  "successCount": 48,
  "errorCount": 2,
  "errors": ["Farmer 999: Farmer not found", ...]
}
```

---

## Best Practices

1. **Always select machine in upload dialog** for reliable format detection
2. **Register machines before uploading** their data
3. **Use consistent date/time formats** across CSV files
4. **Include machine serial in CSV** for legacy compatibility
5. **Review error messages** if upload fails partially
6. **Verify data after upload** by viewing the collection reports

---

## Troubleshooting

### Upload fails for CLN machine

1. Verify machine is registered with correct type (not "ECOD")
2. Check CSV matches Standard format
3. Ensure all required columns are present
4. Verify header line is present

### Data not appearing after upload

1. Check success count in upload response
2. Review error messages
3. Verify farmers exist in the society
4. Check society is correctly linked to machine

### Format detection issues

1. Explicitly select machine in upload dialog (recommended)
2. For ECOD: Ensure machine_type contains "ECOD"
3. For Standard: Ensure machine_type does NOT contain "ECOD"
4. Check first line of CSV for "Station :" (ECOD) or "Machine Serial:" (Standard)

---

## Future Enhancements

- Support for additional machine types (AMC, BMR, etc.)
- Custom column mapping configuration
- Batch upload from multiple machines
- Duplicate detection and merging
- Data validation rules configuration
