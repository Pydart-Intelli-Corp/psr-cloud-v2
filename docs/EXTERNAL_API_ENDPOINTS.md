# External API Endpoints Documentation

## Overview
External APIs designed for milk analyzer machines, IoT devices, and third-party integrations. All endpoints use database key-based authentication.

**Base Pattern**: `/api/[db-key]/...`
- `db-key`: Admin's company name (validates schema access)
- **Methods**: GET (query params) or POST (JSON/FormData)
- **Authentication**: Database key validation only

---

## Endpoints

### 1. Farmer Information

#### Get Latest Farmer Info
```
GET/POST /api/[db-key]/FarmerInfo/GetLatestFarmerInfo
```

**Purpose**: Retrieve farmer details by RF card ID

**Parameters**:
- `InputString`: RF ID (e.g., "1234567890")

**Response**:
```json
{
  "rf_id": "1234567890",
  "farmer_id": "F001",
  "name": "John Doe",
  "phone": "9876543210",
  "sms_enabled": "ON",
  "bonus": 0.50
}
```

**Use Case**: Milk collection machines scan RF card to identify farmer

---

### 2. Machine Testing

#### Cloud Connectivity Test
```
GET/POST /api/[db-key]/Machine/CloudTest
```

**Purpose**: Simple connectivity test

**Parameters**: None (only db-key required)

**Response**: Plain text `"Cloud test OK"`

**Use Case**: Verify API connectivity from external systems

---

### 3. Machine Updates

#### Check for Machine Updates
```
GET/POST /api/[db-key]/MachineNewupdate/FromMachine
```

**Purpose**: Check if firmware/software updates are available for machine

**Parameters**:
- `InputString`: Machine update check request
  - Format: `S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09$0D$0A`
  - Part 1: Society ID (e.g., S-1)
  - Part 2: Machine Type (e.g., LSE-SVPWTBQ-12AH)
  - Part 3: Machine Model/Version (e.g., LE3.36)
  - Part 4: Machine ID (e.g., Mm00001)
  - Part 5: DateTime stamp (e.g., D2025-11-12_10:59:09)

**Response**: Plain text `"DD-MM-YYYY HH:MM:SS AM/PM|Status"`
```
"06-11-2025 05:41:18 AM|No update"
```

**Use Case**: Machines periodically check for available firmware/software updates

---

### 4. Machine Correction

#### Get Latest Machine Correction
```
GET/POST /api/[db-key]/MachineCorrection/GetLatestMachineCorrection
```

**Purpose**: Download calibration correction values for milk analyzer

**Parameters**:
- `InputString`: Machine ID (numeric or alphanumeric)

**Response**:
```json
{
  "machine_id": 101,
  "channel1_fat": 0.5,
  "channel1_snf": 0.3,
  "channel1_clr": 0.2,
  "channel1_temp": 0.1,
  "channel1_water": 0.0,
  "channel1_protein": 0.4,
  "channel2_fat": 0.5,
  ...
  "status": 1
}
```

**Use Case**: Machine downloads calibration settings for accurate analysis

---

#### Save Machine Correction Update History
```
GET/POST /api/[db-key]/MachineCorrection/SaveMachineCorrectionUpdationHistory
```

**Purpose**: Log successful correction value download

**Parameters**:
- `InputString`: Machine ID

**Response**:
```json
{
  "message": "Correction update history saved successfully"
}
```

**Use Case**: Track machine synchronization history

---

### 5. Machine Password

#### Get Latest Machine Password
```
GET/POST /api/[db-key]/MachinePassword/GetLatestMachinePassword
```

**Purpose**: Retrieve user and supervisor passwords for machine

**Parameters**:
- `InputString`: Machine ID

**Response**:
```json
{
  "machine_id": "101",
  "user_password": "1234",
  "supervisor_password": "5678",
  "statusU": 0,
  "statusS": 0
}
```

**Status Flags**:
- `0`: Pending download
- `1`: Successfully downloaded

**Use Case**: Machine downloads password configuration

---

#### Update Machine Password Status
```
GET/POST /api/[db-key]/MachinePassword/UpdateMachinePasswordStatus
```

**Purpose**: Update password download status after successful retrieval

**Parameters**:
- `InputString`: Machine ID and status updates

**Response**:
```json
{
  "message": "Password status updated successfully",
  "statusU": 1,
  "statusS": 1
}
```

**Use Case**: Confirm password sync completion

---

## Request Examples

### GET Request
```bash
curl "http://yourdomain.com/api/your-company/FarmerInfo/GetLatestFarmerInfo?InputString=1234567890"
```

### POST Request (JSON)
```bash
curl -X POST http://yourdomain.com/api/your-company/FarmerInfo/GetLatestFarmerInfo \
  -H "Content-Type: application/json" \
  -d '{"InputString": "1234567890"}'
```

### POST Request (FormData)
```bash
curl -X POST http://yourdomain.com/api/your-company/FarmerInfo/GetLatestFarmerInfo \
  -F "InputString=1234567890"
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "details": "Additional technical details (development only)"
}
```

**Common Errors**:
- Invalid db-key: `"Invalid database key"`
- Missing InputString: `"InputString parameter is required"`
- Not found: `"Farmer/Machine not found"`
- Database error: `"Database query failed"`

---

## Testing

### Production
```
http://168.231.121.19/api/[db-key]/...
```

### Local Development
```
http://localhost:3001/api/[db-key]/...
```

---

## Integration Notes

1. **Database Key**: Must match admin's company name exactly (case-sensitive)
2. **Flexible Methods**: All endpoints support both GET and POST
3. **Input Formats**: JSON body, FormData, or query parameters
4. **IoT Compatible**: Designed for Quectel 4G modules and embedded systems
5. **No Rate Limiting**: Suitable for high-frequency machine polling
6. **Status Tracking**: Password and correction endpoints track download status

---

## Quick Reference

| Endpoint | Purpose | Input | Output |
|----------|---------|-------|--------|
| `FarmerInfo/GetLatestFarmerInfo` | Get farmer details | RF ID | Farmer data |
| `Machine/CloudTest` | Test connectivity | None | "Cloud test OK" |
| `MachineNewupdate/FromMachine` | Check for updates | Machine info + datetime | Timestamp + status |
| `MachineCorrection/GetLatestMachineCorrection` | Get calibration values | Machine ID | Correction values |
| `MachineCorrection/SaveMachineCorrectionUpdationHistory` | Log correction sync | Machine ID | Success message |
| `MachinePassword/GetLatestMachinePassword` | Get passwords | Machine ID | Password data |
| `MachinePassword/UpdateMachinePasswordStatus` | Update sync status | Machine ID | Success message |

---

**Last Updated**: November 12, 2025  
**Version**: 4.0  
**Contact**: admin@poornasreeequipments.com
