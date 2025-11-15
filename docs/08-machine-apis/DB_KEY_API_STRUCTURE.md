# [db-key] API Structure Documentation

## Overview

The `[db-key]` dynamic route segment contains machine-to-cloud synchronization APIs that enable physical dairy collection machines (AMCS - Automatic Milk Collection Systems) to communicate with the cloud database. These endpoints are separate from the `/api/user` admin APIs and are specifically designed for embedded systems (ESP32/Quectel modules) running at dairy societies.

## API Architecture

### Dynamic Route Pattern
```
/api/[db-key]/{Category}/{Endpoint}
```

- `[db-key]`: Admin's unique database identifier (e.g., "PSR", "ADMIN1")
- `{Category}`: API category (FarmerInfo, Machine, MachineCorrection, etc.)
- `{Endpoint}`: Specific operation endpoint

### Database Schema Resolution
All endpoints follow this pattern:
1. Extract `dbKey` from URL params (`[db-key]`)
2. Look up admin in `users` table by `dbKey`
3. Generate schema name: `{cleanedFullName}_{dbKey_lowercase}`
4. Execute queries against admin-specific schema

### Common Request Format

**InputString Parameter** (Query or POST body):
```
societyId|machineType|version|machineId|[optional]
```

Example:
```
S-333|ECOD|LE2.00|M00001
```

**Validation Priority**:
1. DB Key validation (admin exists)
2. Society ID validation (society exists in schema)
3. Machine ID validation (alphanumeric support)
4. Additional parameters (pagination, password type, etc.)

## API Categories

### 1. FarmerInfo

#### **GetLatestFarmerInfo**

**Purpose**: Sync farmer data from cloud to machine

**Purpose**: Sync farmer data from cloud to machine

**Endpoint**: `GET/POST /api/[db-key]/FarmerInfo/GetLatestFarmerInfo`

**InputString Formats**:
- **Pagination**: `societyId|machineType|version|machineId|C00001` (page 1)
- **CSV Download**: `societyId|machineType|version|machineId|D` (all data)

**Examples**:
```bash
# Paginated request (5 farmers per page)
InputString=333|ECOD|LE2.00|M00001|C00001

# CSV download (all farmers)
InputString=333|ECOD|LE2.00|M00001|D
```

**Paginated Response Format**:
```
"farmerId|rfId|name|phone|smsEnabled|bonus||farmerId|rfId|name|phone|smsEnabled|bonus"
```

Example:
```
"F001|RF12345|John Doe|9876543210|ON|5.00||F002|RF12346|Jane Smith|9876543211|OFF|3.50"
```

**CSV Response Format**:
```csv
ID,RF-ID,NAME,MOBILE,SMS,BONUS
F001,RF12345,John Doe,9876543210,ON,5
F002,RF12346,Jane Smith,9876543211,OFF,3
```

**Key Features**:
- Supports both numeric (`M00001`) and alphanumeric (`Mm00001`) machine IDs
- Pagination: 5 farmers per request (C00001 = page 1, C00002 = page 2)
- CSV download: Single request for all active farmers
- Null handling: Defaults to '0' for missing values
- Bonus formatting: Integer in CSV, 2 decimals in paginated

**Database Query**:
```sql
SELECT f.rf_id, f.farmer_id, f.name, f.phone, f.sms_enabled, f.bonus
FROM farmers f
LEFT JOIN societies s ON f.society_id = s.id
LEFT JOIN machines m ON f.machine_id = m.id
WHERE f.society_id = ? AND f.status = 'active'
  AND (f.machine_id = ? OR m.machine_id IN (?))
ORDER BY f.farmer_id
LIMIT 5 OFFSET ?
```

---

### 2. Machine

#### **CloudTest**

**Purpose**: Connectivity test endpoint for machines to verify cloud access

**Endpoint**: `GET/POST /api/[db-key]/Machine/CloudTest`

**InputString**: Any valid format (typically empty or basic identifier)

**Response**:
```
Cloud test OK
```

**Use Case**:
- Machines ping this endpoint on startup
- Verifies network connectivity
- Confirms DB Key validity
- Tests authentication

**Key Features**:
- Simplest endpoint (no complex validation)
- Fast response for connectivity checks
- Logs admin name and DB Key on success

---

### 3. MachineCorrection

#### **GetLatestMachineCorrection**

**Purpose**: Retrieve active correction values for milk analyzer calibration

**Endpoint**: `GET/POST /api/[db-key]/MachineCorrection/GetLatestMachineCorrection`

**InputString Format**:
```
societyId|machineType|version|machineId
```

Example:
```
S-333|ECOD|LE2.00|M00001
```

**Response Format**:
```
"DD-MM-YYYY HH:mm:ss AM/PM||1|fat|snf|clr|temp|water|protein||2|fat|snf|clr|temp|water|protein||3|fat|snf|clr|temp|water|protein"
```

Example:
```
"12-01-2025 03:45:30 PM||1|0.05|0.03|0.02|0.00|0.01|0.04||2|0.06|0.04|0.03|0.00|0.02|0.05||3|0.04|0.02|0.01|0.00|0.01|0.03"
```

**Channel Correction Values**:
- **Channel 1**: COW milk correction factors
- **Channel 2**: BUFFALO milk correction factors
- **Channel 3**: MIXED milk correction factors

**Correction Parameters** (each channel):
- `fat`: Fat percentage correction
- `snf`: Solid-Not-Fat correction
- `clr`: CLR (Corrected Lactometer Reading)
- `temp`: Temperature correction
- `water`: Water content correction
- `protein`: Protein percentage correction

**Database Query**:
```sql
SELECT mc.* 
FROM machine_corrections mc
INNER JOIN machines m ON mc.machine_id = m.id
WHERE m.society_id = ? 
  AND m.machine_id IN (?)
  AND mc.status = 1
  AND m.status = 'active'
ORDER BY mc.created_at DESC
LIMIT 1
```

**Key Features**:
- Returns most recent active correction (status = 1)
- All values formatted to 2 decimal places
- Supports alphanumeric machine IDs with variants
- Datetime formatted: `DD-MM-YYYY HH:mm:ss AM/PM`

---

#### **SaveMachineCorrectionUpdationHistory**

**Purpose**: Mark correction as downloaded (set status = 0) after machine retrieves it

**Endpoint**: `GET/POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionUpdationHistory`

**InputString Format**:
```
societyId|machineType|version|machineId
```

**Response**:
```
"Machine correction status updated successfully."
```

**Database Operation**:
```sql
UPDATE machine_corrections 
SET status = 0, updated_at = NOW()
WHERE machine_id = ? AND status = 1
```

**Workflow**:
1. Machine calls `GetLatestMachineCorrection` → Gets correction data
2. Machine applies corrections locally
3. Machine calls `SaveMachineCorrectionUpdationHistory` → Marks as downloaded
4. Future calls to `GetLatestMachineCorrection` won't return this correction again

**Key Features**:
- Status 1 = Active (not yet downloaded)
- Status 0 = Downloaded/Applied
- Prevents duplicate downloads
- History tracking via `updated_at`

---

### 4. MachinePassword

#### **GetLatestMachinePassword**

**Purpose**: Retrieve user or supervisor password for machine authentication

**Endpoint**: `GET/POST /api/[db-key]/MachinePassword/GetLatestMachinePassword`

**InputString Format**:
```
societyId|machineType|version|machineId|passwordType
```

**Password Types**:
- `U`: User password
- `S`: Supervisor password

**Examples**:
```bash
# Get user password
InputString=333|ECOD|LE3.34|M00001|U

# Get supervisor password
InputString=S-s12|DPST-G|LE2.00|Mm00005|S
```

**Response Format**:
```
"PU|{password}"  # User password
"PS|{password}"  # Supervisor password
```

Examples:
```
"PU|1234"
"PS|9876"
```

**Status Validation**:
- User password: Requires `statusU = 1`
- Supervisor password: Requires `statusS = 1`
- If status = 0, returns: `"Machine password not found."`

**Database Query**:
```sql
SELECT id, machine_id, user_password, supervisor_password, statusU, statusS
FROM machines
WHERE society_id = ? AND machine_id IN (?)
  AND status = 'active'
LIMIT 1
```

**Key Features**:
- Separate status flags for user/supervisor passwords
- Status 1 = Password set and ready to download
- Status 0 = Password already downloaded or not set
- Alphanumeric machine ID support with variants

---

#### **UpdateMachinePasswordStatus**

**Purpose**: Mark password as downloaded (set status = 0) after machine retrieves it

**Endpoint**: `GET/POST /api/[db-key]/MachinePassword/UpdateMachinePasswordStatus`

**InputString Format**:
```
societyId|machineType|version|machineId|passwordType
```

**Password Types**:
- `U`: Update user password status
- `S`: Update supervisor password status

**Response**:
```
"Machine password status updated successfully."
```

**Database Operations**:
```sql
-- User password
UPDATE machines SET statusU = 0 WHERE id = ?

-- Supervisor password
UPDATE machines SET statusS = 0 WHERE id = ?
```

**Workflow**:
1. Admin sets new password in dashboard → Status = 1
2. Machine calls `GetLatestMachinePassword` → Gets password
3. Machine stores password locally
4. Machine calls `UpdateMachinePasswordStatus` → Status = 0
5. Future calls to `GetLatestMachinePassword` return "not found" until admin sets new password

**Key Features**:
- Prevents duplicate password downloads
- Tracks whether machine has latest password
- Admin can see password sync status in dashboard
- Supports both user and supervisor workflows

---

### 5. PriceChartUpdation

#### **GetLatestPriceChart**

**Purpose**: Retrieve rate chart (price chart) data for milk rate calculation with pagination

**Endpoint**: `GET/POST /api/[db-key]/PriceChartUpdation/GetLatestPriceChart`

**InputString Format**:
```
societyId|machineType|version|machineId|channel|pageNumber
```

**Channel Types**:
- `COW`: Cow milk rate chart
- `BUF`: Buffalo milk rate chart
- `MIX`: Mixed milk rate chart

**Page Parameter Format**:
- `C00001`: Page 1 (records 1-10)
- `C00002`: Page 2 (records 11-20)
- `C00003`: Page 3 (records 21-30)
- etc.

**Examples**:
```bash
# Get page 1 of COW channel rate chart
InputString=bmc_301|DPST-W|LE2.00|Mm401|COW|C00001

# Get page 2 of COW channel rate chart
InputString=bmc_301|DPST-W|LE2.00|Mm401|COW|C00002

# Get BUFFALO channel rate chart
InputString=bmc_301|DPST-W|LE2.00|Mm401|BUF|C00001
```

**Response Format**:
```
"DD-MM-YYYY HH:mm:ss AM/PM||CHANNEL|fat|snf|clr|rate||CHANNEL|fat|snf|clr|rate||..."
```

**Example Response (Page 1)**:
```
"15-11-2025 04:27:50 AM||COW|03.00|03.00|07.00|15.00||COW|03.00|03.10|08.00|15.25||COW|03.00|03.20|08.00|15.50||COW|03.00|03.30|08.00|15.75||COW|03.00|03.40|09.00|16.00||COW|03.00|03.50|09.00|16.25||COW|03.00|03.60|10.00|16.50||COW|03.00|03.70|10.00|16.75||COW|03.00|03.80|10.00|17.00||COW|03.00|03.90|11.00|17.25"
```

**Example Response (Page 2)**:
```
"15-11-2025 04:27:50 AM||COW|03.00|04.00|11.00|17.50||COW|03.00|04.10|12.00|17.75||COW|03.00|04.20|12.00|18.00||COW|03.00|04.30|12.00|18.25||COW|03.00|04.40|13.00|18.50||COW|03.00|04.50|13.00|18.75||"Price chart not found.""
```

**End of Chart Indicator**:
When the response ends with `"Price chart not found."`, it indicates:
- No more data available for the next page
- Machine should stop pagination and use downloaded data

**Rate Chart Data Fields**:
- **fat**: Fat percentage (2 decimal places)
- **snf**: Solid-Not-Fat percentage (2 decimal places)
- **clr**: Corrected Lactometer Reading (2 decimal places)
- **rate**: Price per liter in rupees (2 decimal places)

**Pagination Details**:
- Records per page: 10
- Ordered by: FAT (ascending), then SNF (ascending)
- Total records typically: 50-100 per channel (5-10 pages)

**Database Query**:
```sql
-- Find active rate chart for society and channel
SELECT rc.* 
FROM rate_charts rc
WHERE rc.society_id = ? AND rc.channel = ?
ORDER BY rc.created_at DESC
LIMIT 1

-- Get rate chart data (from master or shared chart)
SELECT fat, snf, clr, rate
FROM rate_chart_data
WHERE rate_chart_id = ?
ORDER BY CAST(fat AS DECIMAL(10,2)) ASC, CAST(snf AS DECIMAL(10,2)) ASC
LIMIT 10 OFFSET ?
```

**Shared Chart Handling**:
- If `shared_chart_id` exists, query master chart data
- Master chart stores actual rate data
- Shared charts reference master via `shared_chart_id`
- Prevents data duplication across societies

**Key Features**:
- Pagination support (10 records per page)
- Channel-specific rate charts (COW/BUF/MIX)
- Shared chart architecture (data deduplication)
- Sorted by FAT and SNF for lookup efficiency
- Datetime stamp from chart upload time
- End-of-chart detection via error message

**Machine Workflow**:
1. Machine requests page 1: `C00001`
2. Stores 10 rate chart records locally
3. Requests page 2: `C00002`
4. Stores next 10 records
5. Continues until receives `"Price chart not found."`
6. Uses complete rate chart for milk rate calculation

**Use Case**:
- Machine downloads rate chart on startup or when updated
- Calculates milk price: FAT + SNF → lookup CLR → find rate
- Example: FAT=3.0, SNF=3.5 → CLR=9.0 → Rate=₹16.25/liter
- Quantity × Rate = Total payment to farmer

---

### 6. MachineNewupdate

#### **FromMachine**

**Purpose**: Check for firmware/software updates available for machine

**Endpoint**: `GET/POST /api/[db-key]/MachineNewupdate/FromMachine`

**InputString Format**:
```
societyId|machineType|version|machineId|datetime
```

**Datetime Format**: `D2025-11-12_10:59:09`
- Prefix: `D`
- Date: `YYYY-MM-DD`
- Time: `HH:mm:ss`
- Separator: `_`

**Example**:
```
InputString=S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09
```

**Response Format**:
```
"DD-MM-YYYY HH:MM:SS AM/PM|Status"
```

**Status Values**:
- `No update`: Machine is on latest version
- `Update available`: Firmware update pending
- `Error`: Request failed

**Example Response**:
```
"06-11-2025 05:41:18 AM|No update"
```

**Current Implementation**:
```typescript
// TODO: Implement actual update check logic
// For now, always return "No update"
const updateStatus = "No update";
```

**Future Enhancement Plan**:
- Database table: `machine_updates`
  - `machine_type`: Machine model identifier
  - `firmware_version`: Available firmware version
  - `update_url`: Download URL for firmware
  - `release_date`: Update release timestamp
  - `mandatory`: Boolean flag for critical updates

**Planned Workflow**:
1. Machine sends current version (`LE3.36`) + datetime
2. API checks if newer version exists for machine type
3. If available, return: `"DD-MM-YYYY HH:MM:SS AM/PM|Update available"`
4. Machine prompts supervisor to download update
5. Machine downloads firmware via separate endpoint

**Key Features**:
- Validates machine exists in database
- Logs request timestamp from machine
- Returns server timestamp in response
- Machine type + version tracking for update targeting

---

## Common Patterns

### 1. Machine ID Handling

**Supported Formats**:
- Numeric: `M00001`, `M1`, `1`
- Alphanumeric: `Mm00001`, `Mm1`, `00001`, `0000df`, `df`

**Validation Process** (`InputValidator.validateMachineId`):
```typescript
{
  isValid: boolean,
  isNumeric: boolean,
  numericId: number | null,
  alphanumericId: string | null,
  strippedId: string,
  variants: string[]
}
```

**Variants Generation**:
- `M00001` → `["M00001", "00001", "1", 1]`
- `Mm00005` → `["Mm00005", "00005", "5"]`
- `0000df` → `["0000df", "df"]`

**Database Matching**:
```sql
-- Numeric IDs: Match by database ID
WHERE machines.id = ?

-- Alphanumeric IDs: Match by machine_id string
WHERE machines.machine_id IN (?, ?, ?)
```

### 2. Society ID Handling

**Supported Formats**:
- With prefix: `S-333`, `S-s12`
- Without prefix: `333`, `s12`

**Validation Process** (`InputValidator.validateSocietyId`):
```typescript
{
  isValid: boolean,
  id: string,           // Original input
  numericId: number | null,
  fallback: string,     // Without S- prefix
  hasPrefix: boolean
}
```

**Database Lookup**:
```sql
SELECT id FROM societies 
WHERE society_id = ? OR society_id = ?
LIMIT 1
```
- Replacements: `["S-333", "333"]` (tries both formats)

### 3. DB Key Validation

**Process** (`InputValidator.validateDbKey`):
```typescript
{
  isValid: boolean,
  error?: string
}
```

**Validation Rules**:
- Must not be empty or whitespace
- Must exist in `users` table
- Case-insensitive lookup (`dbKey.toUpperCase()`)

**Schema Name Generation**:
```typescript
const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
```

Example:
- Admin Name: "Poornasree Equipments"
- DB Key: "PSR"
- Schema: `poornasreeequipments_psr`

### 4. Response Patterns

**Success Response** (`ESP32ResponseHelper.createDataResponse`):
```typescript
return new Response(`"${data}"`, {
  status: 200,
  headers: { 
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
});
```

**Error Response** (`ESP32ResponseHelper.createErrorResponse`):
```typescript
return new Response(errorMessage, { 
  status: 200,  // Still 200 for ESP32 compatibility
  headers: { 
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(errorMessage, 'utf8').toString(),
    'Connection': 'close',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  }
});
```

**CORS Response** (`ESP32ResponseHelper.createCORSResponse`):
```typescript
return new Response(null, {
  status: 204,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  }
});
```

### 5. Logging Pattern

**Request Logging**:
```typescript
ESP32ResponseHelper.logRequest(request, dbKey, inputString);
```

**Output**:
```
🔍 External API Request:
   Method: GET/POST
   DB Key: "PSR"
   InputString: "333|ECOD|LE2.00|M00001"
```

**Monitoring Integration**:
```typescript
requestLogger.log({
  method: request.method,
  path: new URL(request.url).pathname,
  endpoint: 'FarmerInfo/GetLatest',
  dbKey: metadata.dbKey,
  societyId: metadata.societyId,
  machineId: metadata.machineId,
  inputString: metadata.inputString,
  statusCode: response.status,
  responseTime: endTime - startTime,
  userAgent: request.headers.get('user-agent') || undefined,
  ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown',
  category: 'external',
});
```

---

## Helper Libraries

### 1. ESP32ResponseHelper

**Location**: `d:\psr-v4\src\lib\external-api\ESP32ResponseHelper.ts`

**Methods**:
- `extractInputString(request)`: Parse InputString from query or POST body
- `filterLineEndings(inputString)`: Remove `\r`, `\n`, `$0D`, `$0A`
- `logRequest(request, dbKey, inputString)`: Formatted console logging
- `createResponse(message)`: Plain text success response
- `createDataResponse(data)`: Quoted data response for ESP32
- `createErrorResponse(error)`: Error response (200 status)
- `createCORSResponse()`: OPTIONS handler

### 2. InputValidator

**Location**: `d:\psr-v4\src\lib\external-api\InputValidator.ts`

**Methods**:
- `validateDbKey(dbKey)`: DB key format validation
- `validateSocietyId(societyId)`: Society ID parsing with prefix handling
- `validateMachineId(machineId)`: Machine ID with alphanumeric support
- `validatePasswordType(passwordType)`: User/Supervisor validation

### 3. QueryBuilder

**Location**: `d:\psr-v4\src\lib\external-api\QueryBuilder.ts`

**Methods**:
- `buildSocietyLookupQuery(schemaName, societyId)`: Society lookup with prefix variants
- `buildSocietyFilter(id, fallback, numericId)`: Society filter for complex queries
- `buildMachineFilter(validation)`: Machine filter with variants
- `buildMachinePasswordQuery(schemaName, societyFilter, machineFilter)`: Complete password query

### 4. ResponseFormatter

**Location**: `d:\psr-v4\src\lib\external-api\ResponseFormatter.ts`

**Methods**:
- Date/time formatting helpers
- Number formatting (2 decimal places)
- CSV generation utilities

---

## Error Handling

### Priority-Based Validation

**Priority 1: DB Key**
```typescript
if (!dbKey || dbKey.trim() === '') {
  return ESP32ResponseHelper.createErrorResponse('DB Key is required');
}
```

**Priority 2: Society Validation**
```typescript
const [societyResults] = await sequelize.query(societyQuery, { replacements });
if (societyResults.length === 0) {
  return ESP32ResponseHelper.createErrorResponse('Invalid society ID');
}
```

**Priority 3: Machine Validation**
```typescript
const machineValidation = InputValidator.validateMachineId(machineId);
if (!machineValidation.isValid) {
  return ESP32ResponseHelper.createErrorResponse('Invalid machine ID');
}
```

### Common Error Messages

| Error | Message | Meaning |
|-------|---------|---------|
| Invalid DB Key | `DB Key is required` | Missing or invalid admin identifier |
| Society Not Found | `Invalid society ID` | Society doesn't exist in admin schema |
| Machine Not Found | `Invalid machine ID` | Machine doesn't exist or inactive |
| Farmer Not Found | `Farmer info not found.` | No active farmers for society/machine |
| Password Not Found | `Machine password not found.` | Password not set or already downloaded |
| Correction Not Found | `Machine correction not found.` | No active correction for machine |

---

## Authentication & Security

### 1. DB Key Authentication
- No traditional JWT/session tokens
- DB Key acts as authentication identifier
- Each machine knows its admin's DB Key
- Hardcoded in machine firmware during setup

### 2. Society-Machine Relationship
- Each machine belongs to one society
- Society belongs to one admin (via schema)
- Cross-admin access prevented by schema isolation

### 3. Multi-Tenancy
- Each admin has isolated database schema
- Schema name: `{adminName}_{dbKey}`
- No cross-schema queries possible
- Complete data isolation

### 4. Rate Limiting
- TODO: Implement per-machine rate limiting
- Track request frequency in monitoring logs
- Alert on suspicious patterns (excessive requests)

---

## Integration with Admin Dashboard

### 1. Farmer Management
- **Admin adds farmer** → Machine downloads via `GetLatestFarmerInfo`
- **Admin updates farmer** → Machine re-downloads updated data
- **Admin deletes farmer** → Farmer filtered out (status != 'active')

### 2. Machine Password Management
- **Admin sets password** → `statusU/statusS = 1`
- **Machine downloads** → Calls `GetLatestMachinePassword`
- **Machine confirms** → Calls `UpdateMachinePasswordStatus` → Status = 0
- **Admin dashboard shows**: "Password Synced" or "Pending Download"

### 3. Machine Corrections
- **Admin configures correction** → Creates record with `status = 1`
- **Machine downloads** → Calls `GetLatestMachineCorrection`
- **Machine applies correction** → Milk analysis uses new factors
- **Machine confirms** → Calls `SaveMachineCorrectionUpdationHistory` → Status = 0

### 4. Rate Charts (Price Charts)
- **Admin uploads rate chart** → Stored in `rate_charts` and `rate_chart_data`
- **Machine downloads** → Calls `GetLatestPriceChart` with pagination
- **Paginated sync** → 10 records per request (C00001, C00002, etc.)
- **Channel-specific** → Separate charts for COW, BUF, MIX
- **Shared chart support** → Master chart data referenced by multiple societies
- **End detection** → "Price chart not found." indicates last page
- **Offline calculation** → Machine uses downloaded chart to calculate milk rates

---

## Future Enhancements

### 1. Rate Chart Sync
```
GET /api/[db-key]/RateChart/GetLatestRateChart
InputString: societyId|machineType|version|machineId|channel
Response: CSV format with FAT/SNF grid and rates
```

### 2. Milk Collection Data Upload
```
POST /api/[db-key]/MilkData/Upload
InputString: societyId|machineType|version|machineId
Body: CSV with farmer_id, shift, fat, snf, quantity, rate, amount
```

### 3. Firmware Update Download
```
GET /api/[db-key]/Firmware/Download
InputString: societyId|machineType|version|machineId
Response: Binary firmware file with version metadata
```

### 4. Machine Status Reporting
```
POST /api/[db-key]/Machine/Status
InputString: societyId|machineType|version|machineId
Body: JSON with battery, temperature, sensor status, errors
```

### 5. Real-time Monitoring
```
WebSocket /api/[db-key]/Machine/Monitor
- Live milk collection events
- Sensor readings
- Error notifications
- Admin dashboard live view
```

---

## Testing & Debugging

### Testing with cURL

**GetLatestFarmerInfo (Paginated)**:
```bash
curl -X POST "http://localhost:3000/api/PSR/FarmerInfo/GetLatestFarmerInfo" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=333|ECOD|LE2.00|M00001|C00001"
```

**GetLatestFarmerInfo (CSV)**:
```bash
curl -X POST "http://localhost:3000/api/PSR/FarmerInfo/GetLatestFarmerInfo" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=333|ECOD|LE2.00|M00001|D"
```

**CloudTest**:
```bash
curl -X GET "http://localhost:3000/api/PSR/Machine/CloudTest"
```

**GetLatestMachineCorrection**:
```bash
curl -X POST "http://localhost:3000/api/PSR/MachineCorrection/GetLatestMachineCorrection" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=333|ECOD|LE2.00|M00001"
```

**GetLatestMachinePassword**:
```bash
curl -X POST "http://localhost:3000/api/PSR/MachinePassword/GetLatestMachinePassword" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=333|ECOD|LE3.34|M00001|U"
```

**UpdateMachinePasswordStatus**:
```bash
curl -X POST "http://localhost:3000/api/PSR/MachinePassword/UpdateMachinePasswordStatus" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=333|ECOD|LE3.34|M00001|U"
```

**GetLatestPriceChart (Rate Chart Page 1)**:
```bash
curl -X POST "http://localhost:3000/api/PSR/PriceChartUpdation/GetLatestPriceChart" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=bmc_301|DPST-W|LE2.00|Mm401|COW|C00001"
```

**GetLatestPriceChart (Rate Chart Page 2)**:
```bash
curl -X POST "http://localhost:3000/api/PSR/PriceChartUpdation/GetLatestPriceChart" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=bmc_301|DPST-W|LE2.00|Mm401|COW|C00002"
```

**FromMachine (Update Check)**:
```bash
curl -X POST "http://localhost:3000/api/PSR/MachineNewupdate/FromMachine" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "InputString=S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09"
```

### Console Log Examples

**Successful Request**:
```
🔍 External API Request:
   Method: POST
   DB Key: "PSR"
   InputString: "333|ECOD|LE2.00|M00001"
✅ Found society: "333" -> database ID: 15
🔍 Machine ID parsing: "M00001" -> 1
✅ Found 5 farmers in schema: poornasreeequipments_psr (Page 1, Offset 0)
📤 Returning farmer data for 5 farmers
```

**Error - Society Not Found**:
```
🔍 External API Request:
   Method: POST
   DB Key: "PSR"
   InputString: "999|ECOD|LE2.00|M00001"
❌ No society found for society_id: "999"
```

**Error - Machine Not Found**:
```
✅ Found society: "333" -> database ID: 15
❌ No active machine found for society 15, machine ID 999
```

---

## Performance Considerations

### 1. Query Optimization
- **Society Lookup**: Indexed on `society_id` column
- **Machine Lookup**: Indexed on `machine_id` string AND `id` numeric
- **Farmer Query**: Indexed on `society_id`, `machine_id`, `status`
- **Correction Query**: Indexed on `machine_id`, `status`, `created_at`

### 2. Response Size Management
- **Pagination**: 5 farmers per request (configurable)
- **CSV Download**: Use streaming for large datasets (future enhancement)
- **Correction Data**: Fixed size (~300 bytes)
- **Password Data**: Minimal (~20 bytes)

### 3. Connection Pooling
- Sequelize connection pool manages concurrent machine requests
- Min: 5 connections
- Max: 20 connections
- Idle timeout: 10 seconds

### 4. Caching Strategy (Future)
- Cache society/machine lookups (5 min TTL)
- Cache correction data until status changes
- Cache rate chart data (10 min TTL)
- Invalidate on admin updates

---

## Related Documentation

- **External API Endpoints**: `docs/EXTERNAL_API_ENDPOINTS.md`
- **ESP32 Integration**: `docs/ESP32_ENDPOINT_UPDATES.md`
- **Quectel Module**: `docs/QUECTEL_MODULE_INTEGRATION.md`
- **Machine Management**: `docs/04-features/MACHINE_MANAGEMENT.md`
- **Rate Charts**: `docs/04-features/RATE_CHART_SYSTEM.md`

---

## Changelog

### Version 1.0 (Current)
- ✅ FarmerInfo/GetLatestFarmerInfo - Paginated + CSV
- ✅ Machine/CloudTest - Connectivity check
- ✅ MachineCorrection/GetLatestMachineCorrection - Active correction download
- ✅ MachineCorrection/SaveMachineCorrectionUpdationHistory - Mark as downloaded
- ✅ MachinePassword/GetLatestMachinePassword - User/Supervisor passwords
- ✅ MachinePassword/UpdateMachinePasswordStatus - Mark password as downloaded
- ✅ PriceChartUpdation/GetLatestPriceChart - Rate chart download (paginated 10/page)
- ✅ MachineNewupdate/FromMachine - Update check (placeholder)
- ✅ Alphanumeric machine ID support
- ✅ Request monitoring and logging
- ✅ Multi-tenant schema isolation
- ✅ Shared rate chart architecture

### Version 1.1 (Planned)
- 🔜 PriceChartUpdation/SavePriceChartUpdationHistory - Mark rate chart as downloaded
- 🔜 MilkData/Upload - Milk collection data upload
- 🔜 Firmware/Download - OTA firmware updates
- 🔜 Machine/Status - Health monitoring
- 🔜 Real-time WebSocket monitoring
- 🔜 Response caching layer
- 🔜 Rate limiting per machine

---

**Last Updated**: January 2025  
**Maintained By**: PSR-v4 Development Team
