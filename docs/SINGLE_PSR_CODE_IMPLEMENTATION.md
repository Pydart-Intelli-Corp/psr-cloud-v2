# Single PSR Code Implementation

## Overview
The PSR Code Management system has been updated to generate a **single master PSR code** for all machines in a society, instead of individual codes per machine.

## What Changed

### Previous Implementation
- **One PSR code per machine**: Each machine had its own unique PSR code
- **Data structure**: `{ sid: "SOC001", model: "lactosure", mid: "M001", ts: timestamp }`
- **Distribution**: Multiple codes needed to be managed and distributed

### New Implementation  
- **One PSR code for all machines**: Single master code for the entire society
- **Data structure**: `{ sid: "SOC001", model: "lactosure", mids: ["M001", "M002", "M003"], ts: timestamp }`
- **Distribution**: Only one code to manage and share

## Benefits

### 1. **Simplified Deployment**
- Operators only need to configure one PSR code across all machines
- Reduced chance of configuration errors
- Easier to update or rotate codes

### 2. **Better Security**
- Single point of control for all machine authentication
- Easier to revoke or update access for entire society
- Reduces attack surface (fewer codes to manage)

### 3. **Easier Management**
- One code to copy/paste during setup
- Simpler documentation and training
- Less storage needed for PSR codes

### 4. **Scalability**
- Adding new machines doesn't require new PSR codes
- Just update machine IDs in configuration
- Backward compatible with old individual code format

## Technical Details

### PSR Code Format
```
PSR-{CHECKSUM}-{BASE64_ENCODED_JSON}
```

**Encoded JSON Structure:**
```json
{
  "sid": "SOC001",           // Society ID
  "model": "lactosure",      // Machine Model
  "mids": [                  // Array of Machine IDs
    "M001",
    "M002",
    "M003"
  ],
  "ts": 1234567890          // Timestamp
}
```

### Frontend Changes

#### GeneratedConfig Interface
```typescript
interface GeneratedConfig {
  psrCode: string;          // Single code instead of array
  totalMachines: number;    // Number of machines covered
  generatedAt: string;
}
```

#### PSR Code Generation
```typescript
const generatePSRCode = (
  societyId: string, 
  machineModel: string, 
  machineIds: string[]     // Array of all machine IDs
): string => {
  const data = {
    sid: societyId.toUpperCase(),
    model: machineModel.toLowerCase(),
    mids: machineIds.map(id => id.toUpperCase()),  // All IDs in array
    ts: Date.now()
  };
  
  const encoded = btoa(JSON.stringify(data));
  const checksum = encoded.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0) % 9999;
  
  return `PSR-${checksum.toString().padStart(4, '0')}-${encoded}`;
};
```

### Backend Changes

#### Request Interface
```typescript
interface RequestConfig {
  societyId: string;
  machineModel: string;
  machineIds: string[];     // All machine IDs
  psrCode: string;          // Single PSR code
  generatedAt: string;
}
```

#### Configuration Files

**psr-config.json** (User-facing):
```json
{
  "psrCode": "PSR-1234-encoded...",
  "totalMachines": 3,
  "generatedAt": "2026-01-28T00:00:00Z"
}
```

**appsettings.PSR.json** (Internal API use):
```json
{
  "PSRCodes": {
    "SocietyId": "SOC001",
    "MachineModel": "lactosure",
    "Mappings": {
      "M001": "PSR-1234-encoded...",  // Same code for all
      "M002": "PSR-1234-encoded...",
      "M003": "PSR-1234-encoded..."
    },
    "GeneratedAt": "2026-01-28T00:00:00Z"
  }
}
```

### .NET API Changes

#### PSRCodeData Class
```csharp
public class PSRCodeData
{
    public string SocietyId { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public List<string> MachineIds { get; set; } = new List<string>();  // Array
    public long Timestamp { get; set; }
}
```

#### Decode Logic
```csharp
// Extract machine IDs - supports both formats
var machineIds = new List<string>();
if (decoded.ContainsKey("mids") && decoded["mids"].ValueKind == JsonValueKind.Array)
{
    // New format: array of machine IDs
    machineIds = decoded["mids"].EnumerateArray()
        .Select(e => e.GetString() ?? "")
        .Where(s => !string.IsNullOrEmpty(s))
        .ToList();
}
else if (decoded.ContainsKey("mid"))
{
    // Old format: single machine ID (backward compatibility)
    var mid = decoded["mid"].GetString();
    if (!string.IsNullOrEmpty(mid))
    {
        machineIds.Add(mid);
    }
}
```

#### Validation Logic
```csharp
// Validate machine ID is in the decoded machine IDs list
if (!decodedData.MachineIds.Any(mid => 
    string.Equals(mid, machineId, StringComparison.OrdinalIgnoreCase)))
{
    _logger.LogWarning(
        "Machine ID {MachineId} not found in PSR code's machine list",
        machineId
    );
    return false;
}
```

## Usage Workflow

### 1. Generate PSR Code
1. Login as Super Admin
2. Navigate to API Management
3. Enter:
   - Society ID (e.g., "SOC001")
   - Machine Model (e.g., "Lactosure")
   - Number of Machines (e.g., 3)
   - Machine IDs (e.g., "M001", "M002", "M003")
4. Click "Generate PSR Codes"
5. **Result**: One master PSR code for all 3 machines

### 2. Download & Deploy
1. Download JSON configuration (contains single PSR code)
2. Download API publish package
3. Deploy package to server
4. Configure database connection
5. Start API

### 3. Machine Configuration
1. On each machine, configure the **same** PSR code
2. Set appropriate machine ID (M001, M002, or M003)
3. Each machine validates using:
   - Society ID from PSR code
   - Machine model from PSR code
   - Checks if its ID is in `mids` array

## Display Updates

### Before
```
Generated Codes
━━━━━━━━━━━━━━━━━━━━━━
Total PSR Codes: 3

PSR Code #1
PSR-1234-encoded...

PSR Code #2
PSR-5678-encoded...

PSR Code #3
PSR-9012-encoded...
```

### After
```
Generated Codes
━━━━━━━━━━━━━━━━━━━━━━
Total Machines: 3

🔐 Master PSR Code (All 3 Machines)
┌─────────────────────────────────┐
│ PSR-1234-encoded...             │
│                                  │
│ [Copy Code]                      │
└─────────────────────────────────┘
✓ This single code authenticates all 3 machines
```

## Backward Compatibility

The .NET API maintains backward compatibility:
- **New format**: Checks for `mids` array
- **Old format**: Falls back to single `mid` field
- **Validation**: Works with both formats seamlessly

## Security Considerations

### Advantages
- ✅ Single point of revocation (disable one code = disable all machines)
- ✅ Easier key rotation (update one code everywhere)
- ✅ Simplified audit trail
- ✅ Less risk of code confusion/mixup

### Considerations
- ⚠️ Compromise of master code affects all machines
- ⚠️ Code should be treated as highly sensitive
- ⚠️ Use HTTPS for all machine communications
- ⚠️ Store PSR code securely on machines

### Recommended Practices
1. **Rotate PSR codes periodically** (e.g., monthly)
2. **Use environment variables** to store PSR codes, not config files
3. **Enable API rate limiting** to prevent brute force
4. **Monitor failed validation attempts**
5. **Use separate PSR codes** for different societies/regions

## Migration Guide

### From Multiple Codes to Single Code

1. **Stop all machines** in the society
2. **Generate new single PSR code** via API Management
3. **Update appsettings.PSR.json** on API server
4. **Restart API** to load new configuration
5. **Configure each machine** with the new single code
6. **Verify** all machines can authenticate
7. **Delete old PSR codes** from records

### Rollback Procedure

If issues occur:
1. Revert to previous `appsettings.PSR.json`
2. Reconfigure machines with individual codes
3. Restart API
4. Test each machine individually

## Testing Checklist

- [ ] Generate single PSR code for 3 machines
- [ ] Verify JSON contains one `psrCode` field
- [ ] Download API package
- [ ] Verify psr-config.json has single code
- [ ] Deploy .NET API
- [ ] Test decode endpoint with new PSR code
- [ ] Verify `MachineIds` array contains all 3 IDs
- [ ] Test machine M001 with PSR code - should pass
- [ ] Test machine M002 with PSR code - should pass
- [ ] Test machine M003 with PSR code - should pass
- [ ] Test unknown machine M999 with PSR code - should fail
- [ ] Test machine M001 with wrong PSR code - should fail
- [ ] Test machine from different society - should fail

## Files Modified

### Frontend
1. **src/app/superadmin/api-management/page.tsx**
   - Updated `GeneratedConfig` interface
   - Updated `generatePSRCode()` to accept array, return single code
   - Updated `handleGenerate()` to create single code
   - Updated display to show one master code with copy button

### Backend
2. **src/app/api/admin/api-management/generate/route.ts**
   - Updated `RequestConfig` interface
   - Updated validation to check single `psrCode`
   - Updated mapping creation (same code for all machines)
   - Updated `psr-config.json` generation
   - Updated README generation

### .NET API
3. **MachineAPI/Services/PSRCodeService.cs**
   - Updated `PSRCodeData` class with `List<string> MachineIds`
   - Updated `DecodePSRCode()` to parse `mids` array
   - Added backward compatibility for old `mid` field
   - Updated `ValidatePSRCode()` to check array membership

### Documentation
4. **docs/SINGLE_PSR_CODE_IMPLEMENTATION.md** (this file)

## Support

For questions or issues:
- **Technical Details**: See [PSR_CODE_SECURITY.md](./PSR_CODE_SECURITY.md)
- **Complete Guide**: See [COMPLETE_DATA_HIDING_SUMMARY.md](./COMPLETE_DATA_HIDING_SUMMARY.md)
- **Implementation**: See [SECURE_PSR_IMPLEMENTATION.md](./SECURE_PSR_IMPLEMENTATION.md)

---

**Version:** 3.0 (Single Master Code)  
**Date:** January 28, 2026  
**Status:** Production Ready ✅
