# GetLatestMachineCorrection External API

**Last Updated**: November 5, 2025

## Endpoint
```
GET/POST /api/[db-key]/MachineCorrection/GetLatestMachineCorrection?InputString=...
```

## Purpose
Retrieve the latest active machine correction data for external dairy collection machines. Supports both **numeric** (`M00001`) and **alphanumeric** (`M0000df`) machine IDs with flexible variant matching.

## Input Format

### URL Structure
```
http://lactosure.azurewebsites.net/api/MAN5678/MachineCorrection/GetLatestMachineCorrection?InputString=S-s12|ECOD|LE3.34|M00001
```

### InputString Format
```
societyId|machineType|version|machineId
```

### Parameters
| Parameter | Description | Example | Notes |
|-----------|-------------|---------|-------|
| `db-key` | Admin's database key (uppercase) | `MAN5678` | In URL path |
| `societyId` | Society ID (with or without S- prefix) | `111`, `S-s12` | Required |
| `machineType` | Machine type identifier | `DPST-G`, `ECOD` | Logged but not filtered |
| `version` | Machine firmware version | `LE3.34`, `LE2.00` | Logged but not filtered |
| `machineId` | Machine ID with M prefix | `M00001`, `M0000df` | Supports alphanumeric |

### Machine ID Format
- **Numeric**: `M00001`, `M00123` - Parsed as integer, backward compatible
- **Alphanumeric**: `M0000df`, `Mabc123` - Creates variants for flexible matching
- **Variant Matching**: `M0000df` matches both `0000df` and `df` in database
- **Validation**: Must start with `M`, followed by letters/numbers only

## Output Format

### Success Response
```
"23-07-2025 12:52:08 PM||1|1.00|9.00|67.00|9.00|8.00|0.00||2|0.00|0.00|3.00|0.00|0.00|0.00||3|0.00|0.00|0.00|0.00|4.00|0.00"
```

### Response Structure
```
"DD-MM-YYYY HH:mm:ss AM/PM||CHANNEL||VALUES||CHANNEL||VALUES||CHANNEL||VALUES"
```

### Field Breakdown (CORRECTED)
```
23-07-2025 12:52:08 PM    - Created datetime
||                         - Separator
1                          - Channel 1 identifier
|1.00                      - Channel 1 FAT
|9.00                      - Channel 1 SNF
|67.00                     - Channel 1 CLR (Corrected Lactometer Reading)
|9.00                      - Channel 1 TEMP (Temperature)
|8.00                      - Channel 1 WATER
|0.00                      - Channel 1 PROTEIN
||                         - Separator
2                          - Channel 2 identifier
|0.00                      - Channel 2 FAT
|0.00                      - Channel 2 SNF
|3.00                      - Channel 2 CLR
|0.00                      - Channel 2 TEMP
|0.00                      - Channel 2 WATER
|0.00                      - Channel 2 PROTEIN
||                         - Separator
3                          - Channel 3 identifier
|0.00                      - Channel 3 FAT
|0.00                      - Channel 3 SNF
|0.00                      - Channel 3 CLR
|0.00                      - Channel 3 TEMP
|4.00                      - Channel 3 WATER
|0.00                      - Channel 3 PROTEIN
```

### Database Column Mapping
| Field Position | Database Column | Description |
|---------------|----------------|-------------|
| 1 | `channel1_fat` | Fat content correction |
| 2 | `channel1_snf` | Solids-Not-Fat correction |
| 3 | `channel1_clr` | Corrected Lactometer Reading |
| 4 | `channel1_temp` | Temperature correction |
| 5 | `channel1_water` | Water content correction |
| 6 | `channel1_protein` | Protein correction |

### Error Responses
| Error | Response | Status | When |
|-------|----------|--------|------|
| Invalid DB Key | `"Machine correction not found."` | 200 | Admin not found |
| Missing InputString | `"Machine correction not found."` | 200 | No InputString parameter |
| Invalid Society | `"Failed to get correction. Invalid token."` | 400 | Society validation failed |
| Invalid Machine ID | `"Failed to get correction. Invalid machine details."` | 400 | Machine ID format invalid |
| No Correction Found | `"Machine correction not found."` | 200 | No active correction (status=1) |

## Request Examples

### GET Request (Numeric Machine ID)
```bash
curl "http://lactosure.azurewebsites.net/api/MAN5678/MachineCorrection/GetLatestMachineCorrection?InputString=S-s12|ECOD|LE3.34|M00001"
```

### GET Request (Alphanumeric Machine ID)
```bash
curl "http://lactosure.azurewebsites.net/api/MAN5678/MachineCorrection/GetLatestMachineCorrection?InputString=S-s12|ECOD|LE3.34|M0000df"
```

### POST Request (JSON)
```bash
curl -X POST "http://lactosure.azurewebsites.net/api/MAN5678/MachineCorrection/GetLatestMachineCorrection" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-s12|ECOD|LE3.34|M00001"}'
```

### POST Request (Form Data)
```bash
curl -X POST "http://lactosure.azurewebsites.net/api/MAN5678/MachineCorrection/GetLatestMachineCorrection" \
  -F "InputString=S-s12|ECOD|LE3.34|M00001"
```

## Implementation Details

### Database Query Flow
1. **DB Key Validation**: Looks up admin by `dbKey` in users table
2. **Schema Resolution**: Generates schema name as `{cleanAdminName}_{dbKey}`
3. **Society Lookup**: Converts string `society_id` to database ID
4. **Machine ID Parsing**: 
   - Removes 'M' prefix
   - **Numeric**: `M00001` → parsed as integer `1`
   - **Alphanumeric**: `M0000df` → creates variants `['0000df', 'df']`
5. **Active Correction**: Fetches only records with `status = 1`
6. **Latest Record**: Orders by `created_at DESC` and returns top 1

### SQL Query (Numeric Machine ID)
```sql
SELECT 
  mc.id, mc.machine_id,
  mc.channel1_fat, mc.channel1_snf, mc.channel1_clr, 
  mc.channel1_temp, mc.channel1_water, mc.channel1_protein,
  mc.channel2_fat, mc.channel2_snf, mc.channel2_clr,
  mc.channel2_temp, mc.channel2_water, mc.channel2_protein,
  mc.channel3_fat, mc.channel3_snf, mc.channel3_clr,
  mc.channel3_temp, mc.channel3_water, mc.channel3_protein,
  mc.status, mc.created_at, mc.updated_at
FROM `schema`.machine_corrections mc
INNER JOIN `schema`.machines m ON mc.machine_id = m.id
WHERE m.society_id = ? 
  AND mc.machine_id = ?  -- Direct integer match
  AND mc.status = 1
  AND m.status = 'active'
ORDER BY mc.created_at DESC
LIMIT 1
```

### SQL Query (Alphanumeric Machine ID)
```sql
SELECT 
  mc.id, mc.machine_id,
  mc.channel1_fat, mc.channel1_snf, mc.channel1_clr, 
  mc.channel1_temp, mc.channel1_water, mc.channel1_protein,
  mc.channel2_fat, mc.channel2_snf, mc.channel2_clr,
  mc.channel2_temp, mc.channel2_water, mc.channel2_protein,
  mc.channel3_fat, mc.channel3_snf, mc.channel3_clr,
  mc.channel3_temp, mc.channel3_water, mc.channel3_protein,
  mc.status, mc.created_at, mc.updated_at
FROM `schema`.machine_corrections mc
INNER JOIN `schema`.machines m ON mc.machine_id = m.machine_id
WHERE m.society_id = ? 
  AND m.machine_id IN ('0000df', 'df')  -- Variant matching
  AND mc.machine_id = m.id
  AND mc.status = 1
  AND m.status = 'active'
ORDER BY mc.created_at DESC
LIMIT 1
```

### Machine ID Variant Logic
```typescript
// Input: M0000df
const machineIdStr = machineId.substring(1); // "0000df"

// Check if numeric or alphanumeric
const isNumeric = /^\d+$/.test(machineIdStr);

if (isNumeric) {
  // Numeric: M00001 → parseInt("00001") → 1
  parsedMachineId = parseInt(machineIdStr);
} else {
  // Alphanumeric: Create variants
  machineIdVariants.push(machineIdStr); // "0000df"
  
  const stripped = machineIdStr.replace(/^0+/, ''); // "df"
  if (stripped && stripped !== machineIdStr) {
    machineIdVariants.push(stripped); // "df"
  }
  // Result: ['0000df', 'df']
}
```

### Data Formatting
- **Date**: `DD-MM-YYYY HH:mm:ss AM/PM` format (IST timezone)
- **Numbers**: Fixed 2 decimal places (e.g., `1.00`, `9.50`)
- **Null Values**: Converted to `0.00`
- **Separators**: 
  - Single pipe `|` between values
  - Double pipe `||` between sections (date and channels)

### CORS Support
- **Access-Control-Allow-Origin**: `*`
- **Access-Control-Allow-Methods**: `GET, POST, OPTIONS`
- **Access-Control-Allow-Headers**: `Content-Type`

### Security Features
1. **SQL Injection Protection**: Parameterized queries with replacements
2. **Input Sanitization**: Removes line ending characters (`$0D`, `$0A`, etc.)
3. **Validation**: Strict format checking for all parameters
4. **Generic Errors**: Returns friendly messages without exposing system details
5. **Machine ID Validation**: Alphanumeric regex pattern (`^[a-zA-Z0-9]+$`)

## Integration Flow

```
1. Machine sends request with society ID and machine ID
   └─→ GET /api/MAN5678/MachineCorrection/GetLatestMachineCorrection?InputString=S-s12|ECOD|LE3.34|M00001

2. API validates DB key and resolves schema
   └─→ Finds admin → generates schema name

3. API validates and parses machine ID
   ├─→ Numeric: M00001 → 1 (integer)
   └─→ Alphanumeric: M0000df → ['0000df', 'df'] (variants)

4. API looks up society and machine
   └─→ Converts society_id to database ID
   └─→ Finds machine using ID or machine_id variants

5. API fetches latest active correction
   └─→ status = 1, ordered by created_at DESC

6. API formats and returns correction data
   └─→ "23-07-2025 12:52:08 PM||1|1.00|9.00|67.00|9.00|8.00|0.00||2|0.00|0.00|3.00|0.00|0.00|0.00||3|0.00|0.00|0.00|0.00|4.00|0.00"

7. Machine applies correction values to channels
   └─→ Channel 1: FAT +1.00, SNF +9.00, CLR +67.00, TEMP +9.00, WATER +8.00, PROTEIN +0.00
   └─→ Channel 2: FAT +0.00, SNF +0.00, CLR +3.00, TEMP +0.00, WATER +0.00, PROTEIN +0.00
   └─→ Channel 3: FAT +0.00, SNF +0.00, CLR +0.00, TEMP +0.00, WATER +4.00, PROTEIN +0.00
```

## Backward Compatibility

### Numeric Machine IDs (Existing Behavior)
- **Before Update**: `M00001` → parsed as integer `1` → matched by `id = 1`
- **After Update**: Same behavior maintained
- ✅ **No breaking changes** for existing numeric machine IDs

### Alphanumeric Machine IDs (New Feature)
- **Before Update**: Rejected with "Invalid machine ID format"
- **After Update**: Accepted and matched using variants
- ✅ **New functionality**, no impact on existing systems

## Related Endpoints

### SaveMachineCorrectionUpdationHistory
Updates the status of a machine correction to 0 (processed):
```
POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionUpdationHistory
InputString: S-s12|ECOD|LE3.34|M00001
Response: "Machine correction status updated successfully."
```

See: [ALPHANUMERIC_MACHINE_ID_SUPPORT.md](./ALPHANUMERIC_MACHINE_ID_SUPPORT.md) for complete details.

## Notes
- Only returns corrections with `status = 1` (active)
- Requires valid admin `dbKey` in URL
- Machine must be `active` status
- Society must exist in database
- Returns most recent correction by `created_at` timestamp
- All numeric values formatted with 2 decimal precision
- Response wrapped in double quotes for compatibility
- **NEW**: Supports both numeric (`M00001`) and alphanumeric (`M0000df`) machine IDs
- **NEW**: Automatic variant matching for alphanumeric IDs (`M0000df` matches `df` or `0000df`)

## Database Schema

### machine_corrections Table
```sql
CREATE TABLE machine_corrections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT NOT NULL,           -- References machines.id
  society_id INT NOT NULL,            -- References societies.id
  
  -- Channel 1 corrections
  channel1_fat DECIMAL(10,2) DEFAULT 0.00,
  channel1_snf DECIMAL(10,2) DEFAULT 0.00,
  channel1_clr DECIMAL(10,2) DEFAULT 0.00,
  channel1_temp DECIMAL(10,2) DEFAULT 0.00,
  channel1_water DECIMAL(10,2) DEFAULT 0.00,
  channel1_protein DECIMAL(10,2) DEFAULT 0.00,
  
  -- Channel 2 corrections
  channel2_fat DECIMAL(10,2) DEFAULT 0.00,
  channel2_snf DECIMAL(10,2) DEFAULT 0.00,
  channel2_clr DECIMAL(10,2) DEFAULT 0.00,
  channel2_temp DECIMAL(10,2) DEFAULT 0.00,
  channel2_water DECIMAL(10,2) DEFAULT 0.00,
  channel2_protein DECIMAL(10,2) DEFAULT 0.00,
  
  -- Channel 3 corrections
  channel3_fat DECIMAL(10,2) DEFAULT 0.00,
  channel3_snf DECIMAL(10,2) DEFAULT 0.00,
  channel3_clr DECIMAL(10,2) DEFAULT 0.00,
  channel3_temp DECIMAL(10,2) DEFAULT 0.00,
  channel3_water DECIMAL(10,2) DEFAULT 0.00,
  channel3_protein DECIMAL(10,2) DEFAULT 0.00,
  
  status TINYINT DEFAULT 1,           -- 1 = active, 0 = processed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_machine_id (machine_id),
  INDEX idx_society_id (society_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### machines Table
```sql
CREATE TABLE machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id VARCHAR(50) NOT NULL,    -- Supports alphanumeric
  society_id INT NOT NULL,
  status ENUM('active', 'inactive', 'suspended', 'maintenance') DEFAULT 'active',
  -- other fields...
  
  INDEX idx_machine_id (machine_id),  -- For alphanumeric matching
  INDEX idx_society_id (society_id)
);
```

---

**Documentation Version**: 2.0  
**Last Updated**: November 5, 2025  
**Changes**:
- Added alphanumeric machine ID support
- Updated column names (clr, temp, protein)
- Added variant matching documentation
- Enhanced security and validation details
