# UpdateMachinePasswordStatus API Documentation

**Last Updated**: November 5, 2025

## Overview
The UpdateMachinePasswordStatus API allows external systems to reset machine password status flags by setting either `statusU` or `statusS` to 0, effectively marking the password as "acknowledged" or "processed". 

**NEW**: Now supports both **numeric** (`M00001`) and **alphanumeric** (`M0000df`, `Mabc123`) machine IDs with flexible variant matching.

## Endpoint
```
GET/POST /api/[db-key]/MachinePassword/UpdateMachinePasswordStatus
```

## InputString Format
```
societyId|machineType|version|machineId|passwordType
```

### Parameters
| Parameter | Description | Example | Notes |
|-----------|-------------|---------|-------|
| **societyId** | Society identifier | `S-s12`, `333` | With or without `S-` prefix |
| **machineType** | Machine type code | `ECOD`, `DPST-G` | Logged but not filtered |
| **version** | Machine version | `LE3.34`, `LE2.00` | Logged but not filtered |
| **machineId** | Machine identifier | `M00001`, `M0000df` | **NEW**: Supports alphanumeric |
| **passwordType** | Password type to reset | `U` or `S` | Required |

### Machine ID Format
- **Numeric**: `M00001`, `M223223` - Parsed as integer, matched by `id` field
- **Alphanumeric**: `M0000df`, `Mabc123` - Creates variants for flexible matching
- **Variant Matching**: `M0000df` matches both `0000df` and `df` in database
- **Validation**: Must start with `M`, followed by alphanumeric characters only

### Password Type
- **`U`** - Reset User password status (sets `statusU = 0`)
- **`S`** - Reset Supervisor password status (sets `statusS = 0`)

## Request Examples

### HTTP GET (Numeric Machine ID)
```bash
curl "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus?InputString=S-s12|ECOD|LE3.34|M00001|U"
```

### HTTP GET (Alphanumeric Machine ID)
```bash
curl "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus?InputString=S-s12|ECOD|LE3.34|M0000df|U"
```

### HTTP POST (JSON)
```bash
curl -X POST "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-s12|ECOD|LE3.34|M00001|S"}'
```

### HTTP POST (Form Data)
```bash
curl -X POST "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus" \
  -F "InputString=S-s12|ECOD|LE3.34|M00001|U"
```

## Response Format

### Success Responses
```
"User password status updated to 0 for machine M00001"
```
or
```
"Supervisor password status updated to 0 for machine df"
```

### Error Responses
| Error | Response | Status Code |
|-------|----------|-------------|
| Invalid DB Key | `"Invalid DB Key"` | 404 |
| Machine not found | `"Machine not found"` | 404 |
| Invalid machine ID format | `"Invalid machine ID format"` | 400 |
| Invalid society ID | `"Invalid society ID"` | 400 |
| Invalid password type | `"Invalid password type. Must be U or S"` | 400 |

## Usage Examples

### Reset User Password Status (Numeric Machine ID)
```bash
# Sets statusU = 0 for machine M00001 in society S-s12
curl "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus?InputString=S-s12|ECOD|LE3.34|M00001|U"

# Expected Response:
# "User password status updated to 0 for machine M00001"
```

### Reset Supervisor Password Status (Alphanumeric Machine ID)
```bash
# Sets statusS = 0 for machine M0000df in society S-s12
curl "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus?InputString=S-s12|ECOD|LE3.34|M0000df|S"

# Expected Response:
# "Supervisor password status updated to 0 for machine df"
```

### POST Request Example
```bash
curl -X POST "http://localhost:3000/api/MAN5678/MachinePassword/UpdateMachinePasswordStatus" \
  -H "Content-Type: application/json" \
  -d '{"InputString": "S-s12|ECOD|LE3.34|Mabc123|U"}'
```

## Behavior & Implementation

### Validation Priority Order
1. **DB Key Validation**: Validates admin exists for given `db-key` (404 if not found)
2. **InputString Parsing**: Splits into 5 parts (400 if incorrect format)
3. **Society ID Validation**: Validates society exists in admin schema (400 if not found)
4. **Machine ID Validation**: 
   - Checks `M` prefix (400 if missing)
   - Validates alphanumeric format (400 if invalid characters)
   - Creates numeric or variant matching based on format
5. **Password Type Validation**: Must be `U` or `S` (400 if invalid)
6. **Machine Lookup**: Finds machine by society + machine ID (404 if not found)
7. **Status Update**: Updates appropriate status field to 0
8. **Verification**: Confirms update success

### Machine ID Processing

#### Numeric Machine IDs
```typescript
// Input: M00001
machineIdStr = "00001" (remove M)
parsedMachineId = 1 (parse as integer)

// SQL Query
SELECT id, machine_id, statusU, statusS
FROM machines
WHERE society_id = ? AND id = 1
```

#### Alphanumeric Machine IDs
```typescript
// Input: M0000df
machineIdStr = "0000df" (remove M)
machineIdVariants = ['0000df', 'df'] (create variants)

// SQL Query
SELECT id, machine_id, statusU, statusS
FROM machines
WHERE society_id = ? AND machine_id IN ('0000df', 'df')
```

### Database Update Query

**For User Password (U):**
```sql
UPDATE machines 
SET statusU = 0 
WHERE id = ?
```

**For Supervisor Password (S):**
```sql
UPDATE machines 
SET statusS = 0 
WHERE id = ?
```

### Verification Query
```sql
SELECT statusU, statusS 
FROM machines 
WHERE id = ?
```

## Password Status Flags

| Status Value | Meaning | When Set |
|-------------|---------|----------|
| `0` | Password acknowledged/processed | Set by this API |
| `1` | Password needs to be sent | Set when password is created/updated |

### Status Flow
```
1. Admin creates/updates machine password
   └─→ statusU = 1 or statusS = 1

2. GetLatestMachinePassword API retrieves password
   └─→ External system receives password

3. External system acknowledges receipt
   └─→ UpdateMachinePasswordStatus sets status to 0

4. Admin can see password has been acknowledged
   └─→ statusU = 0 or statusS = 0 in UI
```

## Security & Validation

### Input Sanitization
- Automatic removal of line ending characters:
  - `$0D` (Carriage Return)
  - `$0A` (Line Feed)
  - `$0D$0A` (CRLF)
  - Actual `\r`, `\n`, `\r\n` characters

### SQL Injection Protection
- Parameterized queries with placeholders
- No direct string concatenation in SQL
- Prepared statement replacements

### Machine ID Validation
```typescript
// Validation regex
const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(machineIdStr);

// Valid examples
M00001  ✅  Numeric
M0000df ✅  Alphanumeric
Mabc123 ✅  Alphanumeric

// Invalid examples
M-001   ❌  Contains special character
M @001  ❌  Contains space
M       ❌  Empty after M
001     ❌  Missing M prefix
```

## Backward Compatibility

### Legacy Systems (Numeric IDs Only)
- **Before**: `M00001` → `id = 1` (integer match)
- **After**: Same behavior, no changes
- ✅ **Fully backward compatible**

### New Systems (Alphanumeric Support)
- **Before**: `M0000df` → Error (invalid format)
- **After**: `M0000df` → Matches `df` or `0000df`
- ✅ **New feature, no breaking changes**

## Related Endpoints

### GetLatestMachinePassword
Retrieves machine password before status update:
```bash
curl "http://localhost:3000/api/MAN5678/MachinePassword/GetLatestMachinePassword?InputString=S-s12|ECOD|LE3.34|M00001|U"

# Response:
"123456"
```

### Machine Management (Admin Panel)
Internal APIs for machine password management:
- `POST /api/user/machine` - Create machine with passwords
- `PUT /api/user/machine` - Update machine passwords
- `GET /api/user/machine` - View machine password status

See: [API_DOCUMENTATION.md](./docs/03-api-reference/API_DOCUMENTATION.md) for complete API reference.

## CORS Configuration
```javascript
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

## Error Handling Best Practices

### Client-Side Implementation
```javascript
async function updatePasswordStatus(dbKey, inputString) {
  try {
    const url = `http://localhost:3000/api/${dbKey}/MachinePassword/UpdateMachinePasswordStatus`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ InputString: inputString })
    });

    const text = await response.text();
    const data = text.replace(/^"|"$/g, ''); // Remove quotes

    if (response.status === 404) {
      console.error('Admin or machine not found');
      return { success: false, error: 'NOT_FOUND' };
    }

    if (response.status === 400) {
      console.error('Validation error:', data);
      return { success: false, error: 'VALIDATION_ERROR', message: data };
    }

    if (data.includes('updated to 0')) {
      console.log('Status updated successfully');
      return { success: true, message: data };
    }

    return { success: false, error: 'UNKNOWN', message: data };
  } catch (error) {
    console.error('Network error:', error);
    return { success: false, error: 'NETWORK_ERROR' };
  }
}

// Usage
const result = await updatePasswordStatus('MAN5678', 'S-s12|ECOD|LE3.34|M00001|U');
if (result.success) {
  console.log('Password status updated');
} else {
  console.error('Update failed:', result.error);
}
```

## Notes
- Line ending characters (`$0D`, `$0A`) are automatically filtered from InputString
- Both GET and POST methods are supported for maximum compatibility
- CORS is enabled for cross-origin requests from external devices
- The endpoint supports JSON and form-data POST formats
- Password status `0` = acknowledged/processed, `1` = needs to be sent
- **NEW**: Supports both numeric and alphanumeric machine IDs
- **NEW**: Automatic variant matching for alphanumeric IDs
- Generic error messages prevent system information leakage
- All responses are wrapped in double quotes for consistency

## Testing Examples

### Test Numeric Machine ID
```bash
# Create test
curl "http://localhost:3000/api/TEST001/MachinePassword/UpdateMachinePasswordStatus?InputString=S-1|ECOD|LE3.34|M00001|U"

# Expected: "User password status updated to 0 for machine M00001"
```

### Test Alphanumeric Machine ID
```bash
# Create test
curl "http://localhost:3000/api/TEST001/MachinePassword/UpdateMachinePasswordStatus?InputString=S-1|ECOD|LE3.34|M0000df|U"

# Expected: "User password status updated to 0 for machine df"
```

### Test Error Cases
```bash
# Invalid DB Key
curl "http://localhost:3000/api/INVALID/MachinePassword/UpdateMachinePasswordStatus?InputString=S-1|ECOD|LE3.34|M00001|U"
# Expected: "Invalid DB Key" (404)

# Invalid Machine ID Format
curl "http://localhost:3000/api/TEST001/MachinePassword/UpdateMachinePasswordStatus?InputString=S-1|ECOD|LE3.34|M@001|U"
# Expected: "Invalid machine ID format" (400)

# Invalid Password Type
curl "http://localhost:3000/api/TEST001/MachinePassword/UpdateMachinePasswordStatus?InputString=S-1|ECOD|LE3.34|M00001|X"
# Expected: "Invalid password type. Must be U or S" (400)
```

---

**Document Version**: 2.0  
**Last Updated**: November 5, 2025  
**Changes**:
- Added alphanumeric machine ID support
- Updated response format with actual machine ID
- Added comprehensive validation documentation
- Enhanced error handling examples
- Added backward compatibility notes
- Updated security and best practices sections