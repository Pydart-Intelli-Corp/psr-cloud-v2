# MachineAPI Documentation

## Overview
Complete API documentation for ESP32-compatible machine data collection system with role-based access control and farmer management.

## Base URL
```
http://localhost:5000/api
```

## Authentication & Machine ID Normalization
- **Method**: PSR Code Authorization (embedded in input strings)
- **Validation**: SessionManager with society-machine binding
- **Security**: Cross-society access prevention
- **Machine ID Normalization**: ESP32 machine IDs are automatically normalized (MM15 → M15, MM8 → M8) for consistent database storage and lookup

---

## 1. Cloud Test API

### Cloud Connectivity Test
**Endpoint**: `GET/POST /api/Machine/CloudTest`

**Content-Type**: None required

**Purpose**: Simple connectivity test endpoint for external systems to verify API availability.

**Input Parameters**: None

**Example Requests**:
```bash
# GET request
curl -X GET "http://localhost:5000/api/Machine/CloudTest"

# POST request
curl -X POST "http://localhost:5000/api/Machine/CloudTest"
```

**Success Response**:
```
Content-Type: text/plain
Status: 200 OK

"Cloud test OK"
```

**Error Response**:
```
Content-Type: text/plain
Status: 500 Internal Server Error

"Cloud test failed"
```

---

## 2. Machine Statistics API

### Save Machine Statistics
**Endpoint**: `POST /MachineStatistics/SaveMachineStatisticsFromMachine`

**Content-Type**: `application/x-www-form-urlencoded`

**Input Format** (11 parts separated by `|`):
```
societyId|machineType|version|machineId|T|D|W|S|G|autoChannel|datetime
```

**Input Parameters**:
- `societyId`: Society identifier (e.g., "S1", "S2")
- `machineType`: Type of machine (e.g., "LSE-SVPWTBQ-12AH")
- `version`: Machine version (e.g., "LE3.36")
- `machineId`: Machine identifier (e.g., "MM15") - **Note**: Automatically normalized to "M15" in database
- `T`: Total tests count (e.g., "T450")
- `D`: Daily cleaning count (e.g., "D6")
- `W`: Weekly cleaning count (e.g., "W6")
- `S`: Cleaning skip count (e.g., "S80")
- `G`: Gain value (e.g., "G6")
- `autoChannel`: Auto channel setting ("ENABLE"/"DISABLE")
- `datetime`: DateTime in format "D2026-12-27_09:00:00"

**Example Request**:
```bash
curl -X GET "http://localhost:5000/api/MachineStatistics/SaveMachineStatisticsFromMachine?InputString=S1|LSE-SVPWTBQ-12AH|LE3.36|MM13|T450|D6|W6|S80|G6|DISABLE|D2026-12-27_09:00:00"
```

**Machine ID Processing**:
- ESP32 sends: `MM13`
- Database stores: `M13` (normalized)
- All lookups use normalized ID for consistency

**Success Response**:
```
Content-Type: text/plain
Status: 200 OK

"Machine statistics saved successfully"
```

**Error Response**:
```
Content-Type: text/plain
Status: 400 Bad Request

"Error: [error message]"
```

---

## 3. Collections API

### Save Collection Details
**Endpoint**: `POST /Collections/SaveCollectionDetails`

**Content-Type**: `application/x-www-form-urlencoded`

**Input Format** (21 parts separated by `|`):
```
societyId|machineType|version|machineId|session|extra|channel|F{fat}|S{snf}|C{clr}|P{protein}|L{lactose}|s{salt}|W{water}|T{temp}|I{farmerId}|Q{quantity}|R{totalAmount}|r{rate}|i{bonus}|D{datetime}
```

**Input Parameters**:
- `societyId`: Society identifier
- `machineType`: Machine type
- `version`: Machine version
- `machineId`: Machine identifier
- `session`: Collection session
- `extra`: Extra parameter
- `channel`: Channel number
- `F{fat}`: Fat percentage (e.g., "F4.5")
- `S{snf}`: SNF percentage (e.g., "S8.2")
- `C{clr}`: Color value (e.g., "C25")
- `P{protein}`: Protein percentage (e.g., "P3.1")
- `L{lactose}`: Lactose percentage (e.g., "L4.8")
- `s{salt}`: Salt percentage (e.g., "s0.7")
- `W{water}`: Water percentage (e.g., "W87.5")
- `T{temp}`: Temperature (e.g., "T25.5")
- `I{farmerId}`: Farmer ID (e.g., "I123")
- `Q{quantity}`: Quantity in liters (e.g., "Q10.5")
- `R{totalAmount}`: Total amount (e.g., "R525.50")
- `r{rate}`: Rate per liter (e.g., "r50.00")
- `i{bonus}`: Bonus amount (e.g., "i25.50")
- `D{datetime}`: DateTime (e.g., "D29/01/2026 10:30:00")

**Example Request**:
```bash
curl -X POST "http://localhost:5000/api/Collections/SaveCollectionDetails" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "input=S1|MM|1.0|MM15|M|extra|1|F4.5|S8.2|C25|P3.1|L4.8|s0.7|W87.5|T25.5|I123|Q10.5|R525.50|r50.00|i25.50|D29/01/2026 10:30:00"
```

**Success Response**:
```
Content-Type: text/plain
Status: 200 OK

"Collection details saved successfully"
```

---

## 4. Dispatches API

### Save Dispatch Details
**Endpoint**: `POST /Dispatches/SaveDispatchDetails`

**Content-Type**: `application/x-www-form-urlencoded`

**Input Format** (15 parts separated by `|`):
```
societyId|machineType|version|machineId|dispatchId|extra|channel|F{fat}|S{snf}|C{clr}|Q{quantity}|R{totalAmount}|r{rate}|D{datetime}|shift
```

**Input Parameters**:
- `societyId`: Society identifier
- `machineType`: Machine type
- `version`: Machine version
- `machineId`: Machine identifier
- `dispatchId`: Dispatch identifier
- `extra`: Extra parameter
- `channel`: Channel number
- `F{fat}`: Fat percentage
- `S{snf}`: SNF percentage  
- `C{clr}`: Color value
- `Q{quantity}`: Quantity in liters
- `R{totalAmount}`: Total amount
- `r{rate}`: Rate per liter
- `D{datetime}`: DateTime
- `shift`: Shift identifier

**Example Request**:
```bash
curl -X POST "http://localhost:5000/api/Dispatches/SaveDispatchDetails" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "input=S1|MM|1.0|MM15|DISP001|extra|1|F4.2|S8.5|C28|Q50.0|R2500.00|r50.00|D29/01/2026 14:30:00|E"
```

**Success Response**:
```
Content-Type: text/plain
Status: 200 OK

"Dispatch details saved successfully"
```

---

## 5. Sales API

### Save Sales Details
**Endpoint**: `POST /Sales/SaveSalesDetails`

**Content-Type**: `application/x-www-form-urlencoded`

**Input Format** (10 or 11 parts separated by `|`):

**Format 1 (10 parts)**:
```
societyId|machineType|version|machineId|session|extra|channel|Q{quantity}|R{totalAmount}|D{datetime}:
```

**Format 2 (11 parts)**:
```
societyId|machineType|version|machineId|session|extra|channel|Q{quantity}|R{totalAmount}|D{datetime}:|shiftType
```

**Input Parameters**:
- `societyId`: Society identifier
- `machineType`: Machine type
- `version`: Machine version
- `machineId`: Machine identifier
- `session`: Sales session
- `extra`: Extra parameter
- `channel`: Channel number
- `Q{quantity}`: Quantity sold
- `R{totalAmount}`: Total sales amount
- `D{datetime}:`: DateTime with trailing colon
- `shiftType`: Shift type (optional)

**Example Requests**:

10-part format:
```bash
curl -X POST "http://localhost:5000/api/Sales/SaveSalesDetails" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "input=S1|MM|1.0|MM15|S|extra|1|Q25.0|R1250.00|D29/01/2026 16:30:00:"
```

11-part format:
```bash
curl -X POST "http://localhost:5000/api/Sales/SaveSalesDetails" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "input=S1|MM|1.0|MM15|S|extra|1|Q25.0|R1250.00|D29/01/2026 16:30:00:|EVENING"
```

**Success Response**:
```
Content-Type: text/plain
Status: 200 OK

"Sales details saved successfully"
```

---

## 6. Farmer Information API

### 6.1 Get Latest Farmer Info

**Endpoint**: `POST /FarmerInfo/GetLatestFarmerInfo`

**Content-Type**: `application/x-www-form-urlencoded`

**Input Format**:
```
societyId|machineType|version|machineId|requestType
```

**Request Types**:
- `C00001`: Pagination mode (returns first 100 farmers with pagination info)
- `CSV`: CSV download mode (returns all farmers as CSV)

**Example Request (Pagination)**:
```bash
curl -X POST "http://localhost:5000/api/FarmerInfo/GetLatestFarmerInfo" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "input=S1|MM|1.0|MM15|C00001"
```

**Pagination Response**:
```
Content-Type: text/plain
Status: 200 OK

"TOTAL_FARMERS:8
SHOWING:1-8
PAGE:1/1
123|11111|John Doe|9446024632|OFF|0
124|11112|Jane Smith|9446024633|ON|5
..."
```

**Example Request (CSV Download)**:
```bash
curl -X POST "http://localhost:5000/api/FarmerInfo/GetLatestFarmerInfo" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "input=S1|MM|1.0|MM15|CSV"
```

**CSV Response**:
```
Content-Type: text/plain
Status: 200 OK

"ID,RF-ID,NAME,MOBILE,SMS,BONUS
123,11111,John Doe,9446024632,OFF,0
124,11112,Jane Smith,9446024633,ON,5
..."
```

### 6.2 Upload Farmer Details

**Endpoint**: `POST /FarmerInfo/UploadFarmerDetails`

**Content-Type**: `multipart/form-data`

**Form Parameters**:
- `file`: CSV file (multipart file upload)
- `societyId`: Society identifier
- `machineId`: Machine identifier

**CSV Format**:
```csv
ID,RF-ID,NAME,MOBILE,SMS,BONUS
1,11111,John Doe,9446024632,OFF,0
2,11112,Jane Smith,9446024633,ON,5
```

**CSV Fields**:
- `ID`: Farmer ID (required, unique within society)
- `RF-ID`: RF Card ID (optional, defaults to Farmer ID)
- `NAME`: Farmer name (required)
- `MOBILE`: Mobile number (optional)
- `SMS`: SMS preference ("ON" or "OFF", defaults to "OFF")
- `BONUS`: Bonus amount (numeric, defaults to 0)

**Example Request**:
```bash
curl -X POST "http://localhost:5000/api/FarmerInfo/UploadFarmerDetails" \
  -F "file=@farmers.csv" \
  -F "societyId=S1" \
  -F "machineId=MM15"
```

**Success Response**:
```json
Content-Type: application/json
Status: 200 OK

{
  "totalProcessed": 5,
  "successCount": 5,
  "failedCount": 0,
  "failedFarmers": [],
  "message": "Successfully imported 5 out of 5 farmers"
}
```

**Partial Success Response** (with duplicates):
```json
Content-Type: application/json
Status: 200 OK

{
  "totalProcessed": 5,
  "successCount": 3,
  "failedCount": 2,
  "failedFarmers": [
    {
      "row": 3,
      "farmerId": "1",
      "name": "duplicate_farmer",
      "error": "Duplicate entry - Farmer ID '1' already exists in society"
    },
    {
      "row": 5,
      "farmerId": "2", 
      "name": "another_duplicate",
      "error": "Duplicate entry - Farmer ID '2' already exists in society"
    }
  ],
  "message": "Successfully imported 3 out of 5 farmers. 2 farmers failed to import."
}
```

**Error Response**:
```json
Content-Type: application/json
Status: 400 Bad Request

{
  "error": "Error message details"
}
```

---

## Common Response Formats

### Success Responses
- **Machine Data APIs**: Plain text with double quotes: `"Success message"`
- **Farmer Info (Get)**: Plain text with structured data
- **Farmer Info (Upload)**: JSON with processing results

### Error Responses
- **Machine Data APIs**: Plain text with double quotes: `"Error: [message]"`
- **Farmer Info APIs**: JSON with error details

---

## Authentication & Security

### PSR Code Authorization
- Each request includes embedded PSR code in the input string
- PSR codes are validated against registered societies
- Example PSR codes: `PSR-****TDEM`, `PSR-****YPVH`

### Society-Machine Binding
- Machines are bound to specific societies
- Cross-society access is prevented
- Auto-creation of societies and machines when PSR-authorized

### Session Management
- SessionManager validates all requests
- Case-insensitive society lookup
- Automatic society/machine registration for valid PSR codes

---

## 8. Farmer Info API

### Get Latest Farmer Info
**Endpoint**: `GET/POST /FarmerInfo/GetLatestFarmerInfo`

**Purpose**: Retrieve farmer data with proper society-machine verification

**Input Format** (5 parts for pagination, 4 parts for CSV):
```
societyId|machineType|version|machineId|C00001  (Pagination - Page 1)
societyId|machineType|version|machineId|D       (CSV Download - All data)
```

**Machine Verification**:
- ✅ Validates machine exists and belongs to specified society
- ✅ Uses normalized machine IDs (MM8 → M8) for database lookup
- ✅ Returns error if machine not authorized for society

**Example Requests**:
```bash
# Get page 1 (5 farmers) - requires machine verification
curl "http://localhost:5000/api/FarmerInfo/GetLatestFarmerInfo?InputString=S1|LSE-SVPWTBQ-12AH|LE2.00|MM8|C00001"

# Download all as CSV - requires machine verification  
curl "http://localhost:5000/api/FarmerInfo/GetLatestFarmerInfo?InputString=S1|LSE-SVPWTBQ-12AH|LE2.00|MM8|D"
```

**Success Response** (Pagination):
```
Content-Type: text/plain
"1|11111|ab1|9446024632|OFF|0.00||2|11112|ab2|9446024633|OFF|0.00||..."
```

**Success Response** (CSV):
```
Content-Type: text/plain
"ID,RF-ID,NAME,MOBILE,SMS,BONUS
1,11111,ab1,9446024632,OFF,0
2,11112,ab2,9446024633,OFF,0"
```

**Error Response** (Machine not authorized):
```
Content-Type: text/plain
"Failed to download farmer. Machine not authorized for this society."
```

### Upload Farmer Details
**Endpoint**: `POST /FarmerInfo/UploadFarmerDetails`

**Purpose**: Bulk upload farmer data via CSV file with society-machine verification

**Parameters**:
- `societyId`: Society identifier (form field)
- `machineId`: Machine identifier (form field) - normalized automatically
- `file`: CSV file with farmer data

**CSV Format Required**:
```
ID,RF-ID,NAME,MOBILE,SMS,BONUS
1001,12345,John Doe,9876543210,ON,150
1002,12346,Jane Smith,9876543211,OFF,200
```

**Machine Processing**:
- ✅ Normalizes machine IDs: `MM8` → `M8`
- ✅ Creates machine if doesn't exist
- ✅ Validates session authorization
- ✅ Links farmers to verified society-machine combination

**Example Request**:
```bash
curl -X POST "http://localhost:5000/api/FarmerInfo/UploadFarmerDetails" \
  -F "societyId=S1" \
  -F "machineId=MM8" \
  -F "file=@farmers.csv"
```

**Success Response**:
```json
{
  "totalProcessed": 10,
  "successCount": 8,
  "failedCount": 2,
  "message": "Successfully imported 8 out of 10 farmers for Society 'S1' (ID: 1) and Machine 'M8' (ID: 3, Original: MM8)",
  "societyDetails": {
    "societyId": "S1",
    "societyDbId": 1,
    "societyName": "Society S1"
  },
  "machineDetails": {
    "originalMachineId": "MM8",
    "normalizedMachineId": "M8",
    "machineDbId": 3,
    "machineType": "Generic",
    "machineStatus": "active"
  },
  "failedFarmers": [...]
}
```

---

## Rate Limiting
- Policy: "fixed" rate limiting applied to all endpoints
- Configured in program startup

---

## Database Models

### Auto-Created Tables
- **MachineStatistics**: Temperature, density, water, SNF, gravity data
- **MilkCollection**: Collection details with farmer information  
- **MilkDispatch**: Dispatch records with quality parameters
- **MilkSale**: Sales transactions
- **FarmerInfo**: Farmer master data
- **Society**: Society information
- **Machine**: Machine registration

### Column Naming
- Database uses PascalCase column names (CreatedAt, AutoChannel, etc.)
- Models aligned with actual database schema

---

## Testing Examples

### Test Data Files
Located in `p:\psr-cloud-v2\public\sample_datas\`:
- `FARMER (2).CSV`: Sample farmer data (5 farmers)
- `FARMER_DUPLICATES.CSV`: Test file with duplicate farmer IDs
- `FARMER_MIXED.CSV`: Mix of new and duplicate farmers

### Complete Test Flow
1. Start server: `dotnet run --urls="http://localhost:5000"`
2. Test cloud connectivity with CloudTest endpoint
3. Test machine statistics, collections, dispatches, sales
4. Upload farmer data via CSV
5. Retrieve farmer info in pagination or CSV format
6. Test duplicate handling with error responses

---

## Development Notes

### ESP32 Compatibility
- All machine data endpoints return text/plain with double quotes
- Compatible with ESP32 hardware limitations
- Simple string parsing for embedded systems

### Error Handling
- Comprehensive validation at input parsing level
- Society-machine authorization checks
- Duplicate detection with detailed error reporting
- Graceful handling of malformed input data

### Performance Considerations
- Bulk operations for CSV uploads
- Efficient database queries with indexed lookups
- Rate limiting to prevent abuse
- Connection pooling for database operations

This documentation covers all implemented endpoints with complete examples and response formats for ESP32-compatible machine data collection and farmer management system, including connectivity testing.