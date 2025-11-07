# External API Quick Reference

## 🎯 Overview
External APIs for milk testing machine integration with Poornasree Equipments Cloud.

**Base URL**: `http://168.231.121.19/api/[db-key]`

---

## 📡 Available Endpoints

### 1. Farmer Info API
**Endpoint**: `/api/[db-key]/FarmerInfo/GetLatestFarmerInfo`

#### Request
```
GET /api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333|ECOD|LE2.00|M00000001
POST /api/BAB1568/FarmerInfo/GetLatestFarmerInfo
Body: {"InputString": "333|ECOD|LE2.00|M00000001"}
```

#### InputString Format
```
societyId|machineType|version|machineId[|pageNumber]
```

**Examples:**
- CSV Download: `333|ECOD|LE2.00|M00000001`
- Page 1: `333|ECOD|LE2.00|M00000001|C00001`
- Page 2: `333|ECOD|LE2.00|M00000001|C00002`

#### Response (CSV)
```csv
RF-ID,ID,NAME,MOBILE,SMS,BONUS
1234567890,F001,John Doe,+919876543210,ON,5
0987654321,F002,Jane Smith,+919876543211,OFF,3
```

#### Response (Paginated)
```
"F001|1234567890|John Doe|+919876543210|ON|5.00||F002|0987654321|Jane Smith|+919876543211|OFF|3.00"
```

---

### 2. Machine Password API
**Endpoint**: `/api/[db-key]/MachinePassword/GetMachinePassword`

#### Request
```
GET /api/BAB1568/MachinePassword/GetMachinePassword?InputString=333|ECOD|LE2.00|M00000001|ADMIN
POST /api/BAB1568/MachinePassword/GetMachinePassword
Body: {"InputString": "333|ECOD|LE2.00|M00000001|ADMIN"}
```

#### InputString Format
```
societyId|machineType|version|machineId|passwordType
```

**Password Types:**
- `ADMIN`: Administrative password
- `SUPERVISOR`: Supervisor password
- `USER`: User password

#### Response
```
"password123"
```

---

### 3. Update Machine Password Status API
**Endpoint**: `/api/[db-key]/MachinePassword/UpdateMachinePasswordStatus`

#### Request
```
POST /api/BAB1568/MachinePassword/UpdateMachinePasswordStatus
Body: {"InputString": "333|ECOD|LE2.00|M00000001|ADMIN|CHANGED"}
```

#### InputString Format
```
societyId|machineType|version|machineId|passwordType|status
```

**Status Values:**
- `CHANGED`: Password has been changed
- `RESET`: Password has been reset
- `PENDING`: Password change pending

#### Response
```
"Password status updated successfully"
```

---

### 4. Machine Correction API
**Endpoint**: `/api/[db-key]/MachineCorrection/[action]`

#### Get Pending Corrections
```
GET /api/BAB1568/MachineCorrection/GetPendingCorrections?InputString=333|ECOD|LE2.00|M00000001
```

#### Response
```
"correctionId1|field1|oldValue1|newValue1||correctionId2|field2|oldValue2|newValue2"
```

#### Submit Correction
```
POST /api/BAB1568/MachineCorrection/SubmitCorrection
Body: {"InputString": "333|ECOD|LE2.00|M00000001|farmer_id|F001|F002"}
```

Format: `societyId|machineType|version|machineId|field|oldValue|newValue`

---

## 🔑 DB Keys

Current active DB Keys:
- `BAB1568` - Babumon Gopi

To get your DB Key:
1. Login to admin panel
2. Check profile settings
3. DB Key displayed on dashboard

---

## 🧪 Testing

### Using cURL
```bash
# Get farmer info (CSV)
curl "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333|ECOD|LE2.00|M00000001"

# Get farmer info (Page 1)
curl "http://168.231.121.19/api/BAB1568/FarmerInfo/GetLatestFarmerInfo?InputString=333|ECOD|LE2.00|M00000001|C00001"

# Get machine password
curl "http://168.231.121.19/api/BAB1568/MachinePassword/GetMachinePassword?InputString=333|ECOD|LE2.00|M00000001|ADMIN"
```

### Using Postman
1. Create new request
2. Method: GET or POST
3. URL: `http://168.231.121.19/api/[db-key]/[endpoint]`
4. For GET: Add `InputString` query parameter
5. For POST: Add JSON body with `InputString` field

### Using Python
```python
import requests

def get_farmer_info(db_key, society_id, machine_type, version, machine_id):
    input_string = f"{society_id}|{machine_type}|{version}|{machine_id}"
    url = f"http://168.231.121.19/api/{db_key}/FarmerInfo/GetLatestFarmerInfo"
    
    response = requests.get(url, params={"InputString": input_string})
    return response.text

# Usage
csv_data = get_farmer_info("BAB1568", "333", "ECOD", "LE2.00", "M00000001")
print(csv_data)
```

---

## ⚠️ Error Responses

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `"Invalid DB Key"` | DB Key not found | Verify DB Key is correct |
| `"Failed to download farmer. Invalid token."` | Society not found | Check society ID |
| `"Failed to download farmer. Invalid machine details."` | Machine ID invalid | Must start with 'M' |
| `"Farmer info not found."` | No active farmers | Check filters |
| `"InputString parameter is required"` | Missing parameter | Add InputString |

---

## 📊 InputString Component Guide

### Society ID
- **With prefix**: `S-333`
- **Without prefix**: `333`
- **Both accepted**: System handles both formats

### Machine Type
- **Examples**: `ECOD`, `LSE-V3`, `ECOSV`
- **Format**: Alphanumeric, can include hyphens

### Version
- **Examples**: `LE2.00`, `LE3.00`, `V1.0`
- **Format**: Alphanumeric with dots

### Machine ID
- **Must start with**: `M`
- **Numeric**: `M00000001` → extracts `1`
- **Alphanumeric**: `MABC123` → uses `ABC123`
- **Zero-padding**: Handled automatically

### Page Number (Optional)
- **Format**: `C00001` (page 1), `C00002` (page 2)
- **Extraction**: Removes leading zeros: `C00001` → `1`
- **Page size**: Fixed at 5 farmers per page

---

## 🔐 Security

### No Authentication
- External APIs don't require JWT tokens
- Uses DB Key validation instead
- DB Key must exist in system

### Rate Limiting
- Not currently implemented
- Planned for future release

### CORS
- Enabled for all origins: `*`
- Methods allowed: `GET, POST`
- Headers allowed: `Content-Type`

---

## 📈 Performance

### Response Times
- CSV Download: ~200-500ms (depends on farmer count)
- Paginated Request: ~100-200ms
- Password Retrieval: ~50-100ms

### Limits
- Max farmers per CSV: No limit
- Farmers per page: 5 (fixed)
- Max InputString length: 500 characters

---

## 🐛 Debugging

### Enable Debug Logs
Check server logs:
```bash
ssh root@168.231.121.19
pm2 logs psr-v4 --lines 100
```

### Common Issues

**Issue**: "Farmer info not found"
- **Check**: Society ID exists
- **Check**: Machine ID is correct
- **Check**: Farmers have `status='active'`

**Issue**: "Invalid machine details"
- **Check**: Machine ID starts with 'M'
- **Check**: Format is correct: M00000001

**Issue**: Empty CSV response
- **Check**: Society has active farmers
- **Check**: Machine is associated with farmers

---

## 📞 Support

**Technical Support**:
- Email: support@poornasreeequipments.com
- Phone: +91-XXX-XXX-XXXX

**Documentation**:
- Full Docs: `/docs/FARMER_MANAGEMENT_SYSTEM.md`
- API Docs: `/docs/API_REFERENCE.md`

**Server Status**:
- Health Check: `http://168.231.121.19/api/health`
- Server: 168.231.121.19

---

**Last Updated**: November 7, 2025
**API Version**: 1.0.0
