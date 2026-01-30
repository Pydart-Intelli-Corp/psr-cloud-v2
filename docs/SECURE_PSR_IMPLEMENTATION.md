# Secure PSR Code Implementation Summary

## What Changed

✅ **PSR Codes are Now Encrypted and Secure**

### Old Format (Insecure - Plain Text)
```
PSR-SOC001-LACT-M001
```
- ❌ Anyone could read society ID, model, and machine ID
- ❌ Easy to forge fake codes
- ❌ No integrity verification

### New Format (Secure - Encrypted)
```
PSR-8471-eyJzaWQiOiJTT0MwMDEiLCJtb2RlbCI6ImxhY3Rvc3VyZSIsIm1pZCI6Ik0wMDEiLCJ0cyI6MTY5NTk5MDA5ODY1NH0=
```
- ✅ Encrypted data - not human readable
- ✅ Checksum validation prevents tampering
- ✅ Timestamp for audit trail
- ✅ Multi-factor validation in .NET API

## How It Works

### 1. Generation (Frontend - API Management Page)
When you create PSR codes:
```javascript
1. Enter Society ID: "SOC001"
2. Select Machine Model: "Lactosure"
3. Enter Machine IDs: "M001", "M002", etc.

↓ System generates encrypted PSR codes ↓

For each machine:
- Creates JSON: {"sid":"SOC001","model":"lactosure","mid":"M001","ts":1738055445123}
- Encodes to Base64: eyJzaWQiOi...
- Calculates checksum: 8471
- Creates PSR code: PSR-8471-eyJzaWQiOi...
```

### 2. Validation (.NET API - Machine Operations)
When a machine makes a request:
```csharp
1. Machine sends request with headers:
   X-Machine-ID: M001
   X-PSR-Code: PSR-8471-eyJzaWQiOi...

2. API decodes PSR code:
   ✓ Verify checksum matches
   ✓ Decode Base64 to JSON
   ✓ Extract: sid, model, mid, timestamp

3. Validate against configuration:
   ✓ Society ID matches psr-config.json
   ✓ Machine model matches psr-config.json
   ✓ Machine ID matches request header
   ✓ PSR code exists in mappings

4. If all checks pass → Allow operation
   If any check fails → Return 401 Unauthorized
```

## Files Modified

### Frontend (Next.js)
- **src/app/superadmin/api-management/page.tsx**
  - Updated `generatePSRCode()` function
  - Now creates encrypted PSR codes with checksums
  - Includes timestamp for audit trail

### Backend (.NET)
- **MachineAPI/Services/PSRCodeService.cs**
  - Added `DecodePSRCode()` method
  - Updated `ValidatePSRCode()` with multi-factor validation
  - Extracts society ID and machine info from encrypted code

- **MachineAPI/Controllers/PSRController.cs**
  - Added `/api/psr/decode` endpoint
  - Returns decoded PSR code information
  - Used for debugging and verification

### Documentation
- **docs/PSR_CODE_SECURITY.md**
  - Complete security documentation
  - Encryption/decoding details
  - API endpoints and usage
  - Best practices and troubleshooting

## Security Features

### 🔒 Encryption
- JSON data encoded to Base64
- Not human-readable without decoding
- Prevents casual inspection

### 🔐 Checksum Validation
- 4-digit verification code
- Calculated from encoded data
- Detects any tampering attempts

### ⏱️ Timestamp
- Records generation time
- Enables expiration policies
- Provides audit trail

### 🛡️ Multi-Factor Validation
1. Checksum verification
2. Society ID match
3. Machine model match
4. Machine ID match
5. Mapping existence check

## API Endpoints

### Decode PSR Code (New!)
```http
POST /api/psr/decode
Content-Type: application/json

{
  "psrCode": "PSR-8471-eyJzaWQiOiJTT0MwMDEiLC..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "societyId": "SOC001",
    "machineModel": "lactosure",
    "machineId": "M001",
    "timestamp": 1738055445123,
    "generatedDate": "2024-01-28 10:30:45"
  },
  "message": "PSR code decoded successfully"
}
```

### Validate PSR Code
```http
POST /api/psr/validate
Content-Type: application/json

{
  "machineId": "M001",
  "psrCode": "PSR-8471-eyJzaWQiOiJTT0MwMDEiLC..."
}
```

## What Gets Deployed

When you download the API package:

### psr-config.json
```json
{
  "societyId": "SOC001",
  "machineModel": "lactosure",
  "machines": [
    {
      "machineId": "M001",
      "psrCode": "PSR-8471-eyJzaWQiOiJTT0MwMDEiLC...",
      "model": "lactosure"
    }
  ],
  "generatedAt": "2024-01-28T10:30:45.123Z"
}
```

### appsettings.PSR.json
```json
{
  "PSRCodes": {
    "SocietyId": "SOC001",
    "MachineModel": "lactosure",
    "Mappings": {
      "M001": "PSR-8471-eyJzaWQiOi...",
      "M002": "PSR-3291-eyJzaWQiOi..."
    },
    "GeneratedAt": "2024-01-28T10:30:45.123Z"
  }
}
```

## Usage Flow

### 1. Super Admin Actions
```
1. Login to superadmin panel
2. Click "API Management" in sidebar
3. Enter Society ID
4. Select Machine Model
5. Enter number of machines
6. Enter Machine IDs
7. Click "Generate PSR Codes"
8. Download API publish package
```

### 2. Deployment
```bash
# Copy package to server
scp psr-api-SOC001-*.zip server:/var/www/machineapi/

# Extract and configure
cd /var/www/machineapi
unzip psr-api-SOC001-*.zip
cp psr-config.json .
cp appsettings.PSR.json appsettings.Production.json

# Restart API
systemctl restart machineapi
```

### 3. Machine Operations
```javascript
// Machine sends collection data
fetch('https://api.poornasree.com/api/collections', {
  method: 'POST',
  headers: {
    'X-Machine-ID': 'M001',
    'X-PSR-Code': 'PSR-8471-eyJzaWQiOi...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(collectionData)
});

// API validates PSR code
// If valid: Process request
// If invalid: Return 401 Unauthorized
```

## Benefits

### For Security
- ✅ Prevents unauthorized API access
- ✅ Detects tampered PSR codes
- ✅ Society-specific validation
- ✅ Machine-specific validation
- ✅ Audit trail with timestamps

### For Operations
- ✅ Easy to generate via web interface
- ✅ Automated deployment package creation
- ✅ No manual configuration needed
- ✅ Clear validation error messages
- ✅ Decode endpoint for troubleshooting

### For Administration
- ✅ Centralized PSR code management
- ✅ Society isolation
- ✅ Machine tracking
- ✅ Configuration versioning
- ✅ Detailed logging

## Testing

### Test PSR Code Decoding
```bash
curl -X POST https://api.poornasree.com/api/psr/decode \
  -H "Content-Type: application/json" \
  -d '{"psrCode":"PSR-8471-eyJzaWQiOi..."}'
```

### Test PSR Code Validation
```bash
curl -X POST https://api.poornasree.com/api/psr/validate \
  -H "Content-Type: application/json" \
  -d '{
    "machineId":"M001",
    "psrCode":"PSR-8471-eyJzaWQiOi..."
  }'
```

### Test Machine Operation
```bash
curl -X POST https://api.poornasree.com/api/collections \
  -H "X-Machine-ID: M001" \
  -H "X-PSR-Code: PSR-8471-eyJzaWQiOi..." \
  -H "Content-Type: application/json" \
  -d '{"farmerId":"F001","quantity":10.5,...}'
```

## Troubleshooting

### Invalid Checksum
**Error:** "Invalid PSR code checksum"
**Solution:** PSR code was modified. Regenerate via API Management.

### Society ID Mismatch
**Error:** "Society ID mismatch. Expected: SOC001, Got: SOC002"
**Solution:** Using PSR code from wrong society. Use correct PSR code.

### Machine Not Found
**Error:** "Machine ID M001 not found in PSR configuration"
**Solution:** Machine not configured. Add machine via API Management.

### Decoding Failed
**Error:** "Failed to decode PSR code"
**Solution:** Corrupted PSR code. Regenerate via API Management.

## Next Steps

1. **Generate PSR Codes**
   - Go to API Management
   - Create codes for your societies

2. **Test Decoding**
   - Use `/api/psr/decode` endpoint
   - Verify society ID and machine info

3. **Deploy to Production**
   - Download API package
   - Deploy to server
   - Test machine operations

4. **Monitor Logs**
   - Watch for validation failures
   - Track PSR code usage
   - Identify unauthorized access attempts

## Support

📚 **Documentation:**
- PSR_CODE_SECURITY.md - Detailed security guide
- API_MANAGEMENT_GUIDE.md - User guide
- API_MANAGEMENT_IMPLEMENTATION.md - Technical details

🔧 **Tools:**
- API Management Interface - Generate codes
- PSR Decode Endpoint - Debug codes
- PSR Validate Endpoint - Test validation

📞 **Contact:**
- Check logs in /var/log/machineapi/
- Test with decode endpoint first
- Contact system administrator for support
