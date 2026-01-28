# CSV Format Error Detection & Feedback System

## Overview

The upload system now automatically detects CSV format and provides detailed error feedback when the format doesn't match the selected machine type.

## How It Works

### 1. Format Detection Algorithm

The system analyzes the CSV file structure to determine its format:

```typescript
detectCSVFormat(lines: string[]) {
  // Check first line
  if (firstLine.includes('station')) → Likely ECOD format
  if (firstLine.includes('machine serial')) → Likely Standard format
  
  // Analyze header columns
  if (has 'Name' + 'Milk' + 'Bonus' + 'Total') → ECOD format
  if (has 'Channel' + 'Incentive' + 'Amount') → Standard format
  
  // Return: { format, confidence, details }
}
```

### 2. Format Validation

After detection, the system compares:
- **Detected Format** (from CSV file analysis)
- **Expected Format** (based on machine type)

If mismatch detected → Return detailed error with suggestions

### 3. Error Response Structure

```json
{
  "error": "Format mismatch: This is an ECOD machine but the CSV appears to be in Standard format.",
  "detectedFormat": "STANDARD",
  "expectedFormat": "ECOD",
  "machineType": "ECOD-2024",
  "details": "Standard format: Machine Serial header, Channel/Qty/Incentive/Amount columns present",
  "help": "Expected ECOD format with:\n- First line: 'Station :'\n- Columns: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total\n\nFound Standard format with:\n- First line: 'Machine Serial:XXX'\n- Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount",
  "suggestion": "Either use an ECOD format CSV file, or select a different machine (CLN/AMR type) for Standard format uploads."
}
```

## Detection Rules

### ECOD Format Detection

**Primary Indicators (100% confidence):**
- First line contains `Station :`
- Headers include: `Name`, `Milk`, `Bonus`, `Total`

**Secondary Indicators (70% confidence):**
- First line contains `Station :` but missing some columns
- OR has Name/Milk/Bonus/Total columns but missing Station header

**Fallback (60% confidence):**
- Has Name, Milk, Bonus, Total columns (even without Station header)

### Standard Format Detection

**Primary Indicators (100% confidence):**
- First line contains `Machine Serial:`
- Headers include: `Channel`, `Qty`, `Incentive`, `Amount`

**Secondary Indicators (70% confidence):**
- First line contains `Machine Serial:` but missing some columns
- OR has Channel/Incentive/Amount columns but missing Machine Serial header

**Fallback (60% confidence):**
- Has Channel, Incentive, Amount columns, no Name column

### Unknown Format

Returned when:
- Confidence < 60%
- Can't find expected columns
- Header line not found
- File too short (< 5 lines)

## Error Messages

### 1. Format Mismatch Error

**Scenario:** ECOD machine + Standard format CSV

```
❌ CSV Format Mismatch

Format mismatch: This is an ECOD machine but the CSV appears to be in Standard format.

🔍 Detected: STANDARD format
✓ Expected: ECOD format
🔧 Machine Type: ECOD-2024

📋 Format Details:
Expected ECOD format with:
- First line: "Station :"
- Columns: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total

Found Standard format with:
- First line: "Machine Serial:XXX"
- Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount

💡 Suggestion: Either use an ECOD format CSV file, or select a different machine (CLN/AMR type) for Standard format uploads.
```

**Scenario:** CLN machine + ECOD format CSV

```
❌ CSV Format Mismatch

Format mismatch: This machine expects Standard format but the CSV appears to be in ECOD format.

🔍 Detected: ECOD format
✓ Expected: STANDARD format
🔧 Machine Type: CLN

📋 Format Details:
Expected Standard format with:
- First line: "Machine Serial:XXX"
- Columns: Date, Time, Shift, ID, Channel, Fat, SNF, CLR, Water, Qty, Rate, Incentive, Amount

Found ECOD format with:
- First line: "Station :"
- Columns: Date, Time, shift, ID, Name, Milk, Fat, SNF, CLR, Water, Rate, Bonus, Qty, Total

💡 Suggestion: Either use a Standard format CSV file, or select an ECOD machine if you have ECOD format data.
```

### 2. Unknown Format Error

```
Unable to detect CSV format

Details: Could not determine format. Headers found: date, time, data1, data2, value

Help: Please ensure your CSV file matches either ECOD or Standard format. See documentation for examples.

Expected Format: STANDARD
Machine Type: CLN
```

### 3. Missing Header Error

```
CSV header not found

The system could not find a header line with Date and Time columns.
Please ensure your CSV has proper column headers.
```

### 4. Column Count Error

```
⚠️ Skipping incomplete row (line 15): 8 columns, expected 13

Row data: 2026-01-19,14:31:03,MR,1,COW,0.00,0.00,0...
```

## User Experience Flow

### Happy Path
1. User selects CLN machine
2. System shows: "Detected Format: Standard (CLN/AMR/Custom)"
3. User uploads Standard format CSV
4. System validates: Format matches ✓
5. Upload proceeds successfully

### Error Path - Format Mismatch
1. User selects CLN machine (expects Standard format)
2. User uploads ECOD format CSV
3. System detects format mismatch
4. Shows detailed error with:
   - What was detected
   - What was expected
   - Column differences
   - Actionable suggestions
5. User either:
   - Changes CSV to Standard format, OR
   - Selects ECOD machine instead

### Error Path - Unknown Format
1. User uploads custom/malformed CSV
2. System can't detect format
3. Shows error with headers found
4. User reviews documentation
5. User fixes CSV structure

## Testing Scenarios

### Test 1: Correct Format
```
Machine Type: CLN
CSV Format: Standard (Machine Serial:093)
Expected: ✓ Success
```

### Test 2: Wrong Format
```
Machine Type: CLN
CSV Format: ECOD (Station :)
Expected: ❌ Format mismatch error
```

### Test 3: Missing Columns
```
Machine Type: CLN
CSV Format: Standard but only 10 columns
Expected: ❌ Unknown format or incomplete row errors
```

### Test 4: Malformed CSV
```
Machine Type: ECOD
CSV Format: Random headers
Expected: ❌ Unable to detect format
```

### Test 5: Auto-detection Fallback
```
Machine Type: CLN (Standard expected)
CSV Format: Has Channel/Incentive/Amount but no "Machine Serial" header
Expected: ✓ Detected as Standard with 60% confidence, proceeds
```

## Implementation Details

### Server-Side (API Route)

**File:** `src/app/api/user/reports/collections/upload/route.ts`

```typescript
// 1. Detect format from CSV
const detectedFormat = detectCSVFormat(lines);

// 2. Determine expected format
const expectedFormat = machine.machine_type?.toLowerCase().includes('ecod') 
  ? 'ecod' 
  : 'standard';

// 3. Validate match
if (detectedFormat.format !== expectedFormat && detectedFormat.confidence >= 60) {
  return NextResponse.json({ 
    error: "Format mismatch...",
    detectedFormat: detectedFormat.format.toUpperCase(),
    expectedFormat: expectedFormat.toUpperCase(),
    details: detectedFormat.details,
    help: "...",
    suggestion: "..."
  }, { status: 400 });
}

// 4. Use detected format for parsing
const isEcodFormat = detectedFormat.format === 'ecod';
```

### Client-Side (React Component)

**File:** `src/components/reports/CollectionReports.tsx`

```typescript
const handleUploadFile = async (file, reportType, machineId) => {
  const response = await fetch(endpoint, { /* ... */ });
  const data = await response.json();

  if (!response.ok) {
    // Build detailed error message
    let errorMsg = data.error;
    
    if (data.detectedFormat && data.expectedFormat) {
      errorMsg = `❌ CSV Format Mismatch\n\n${data.error}\n\n`;
      errorMsg += `🔍 Detected: ${data.detectedFormat} format\n`;
      errorMsg += `✓ Expected: ${data.expectedFormat} format\n`;
      errorMsg += `🔧 Machine Type: ${data.machineType}\n\n`;
      
      if (data.help) {
        errorMsg += `📋 Format Details:\n${data.help}\n\n`;
      }
      
      if (data.suggestion) {
        errorMsg += `💡 Suggestion: ${data.suggestion}`;
      }
    }
    
    throw new Error(errorMsg);
  }
};
```

**File:** `src/components/dialogs/ReportUploadDialog.tsx`

```typescript
// Enhanced error display with multi-line support
{error && (
  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
    <div className="flex items-start">
      <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-red-800 mb-1">Upload Error</h4>
        <div className="text-sm text-red-700 whitespace-pre-wrap font-mono">
          {error}
        </div>
      </div>
    </div>
  </div>
)}
```

## Benefits

✅ **Immediate Feedback** - User knows exactly what's wrong
✅ **Clear Guidance** - Specific suggestions on how to fix
✅ **Format Awareness** - Shows both detected and expected formats
✅ **Column Comparison** - Highlights differences in column structure
✅ **Actionable** - Provides clear next steps
✅ **Prevents Data Loss** - Catches errors before processing
✅ **Better UX** - Reduces trial-and-error uploads

## Future Enhancements

1. **Auto-format Conversion** - Offer to convert between formats
2. **Column Mapping UI** - Let users manually map columns
3. **Format Preview** - Show sample rows before upload
4. **Batch Validation** - Check multiple files at once
5. **Custom Formats** - Allow admin to define custom CSV formats
6. **AI-Assisted Detection** - Use ML for better format recognition

## Debugging

### Enable Detailed Logging

Server logs show:
```
=== CSV Upload Format Validation ===
Machine: 093 | CLN
Society: ABC Society | SOC001
Expected Format: STANDARD
Detected Format: ECOD (70% confidence)
Detection Details: ECOD format: Station header found but some expected columns missing
First Line: Station :
Header Line: Date,Time,shift,ID,Name,Milk,Fat,SNF,CLR,Water,Rate,Bonus,Qty,Total
Format Validation: FAILED - Mismatch detected
```

### Check Browser Console

Client shows:
```javascript
Error uploading file: 
❌ CSV Format Mismatch

Format mismatch: This machine expects Standard format but the CSV appears to be in ECOD format.
...
```

## Support

For issues with format detection:
1. Check server logs for detection details
2. Verify CSV structure matches expected format
3. Ensure header line is within first 10 rows
4. Confirm machine type is correctly set
5. Review sample files in `public/sample_datas/`
