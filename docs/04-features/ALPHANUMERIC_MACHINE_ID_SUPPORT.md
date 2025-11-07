# Alphanumeric Machine ID Support for External APIs

## Overview
All external API endpoints now support both **numeric** (e.g., `M00001`) and **alphanumeric** (e.g., `M0000df`, `Mabc123`) machine IDs with flexible variant matching.

## Updated Endpoints

### 1. Machine Correction APIs
- **GetLatestMachineCorrection** - `/api/[db-key]/MachineCorrection/GetLatestMachineCorrection`
- **SaveMachineCorrectionUpdationHistory** - `/api/[db-key]/MachineCorrection/SaveMachineCorrectionUpdationHistory`

### 2. Farmer Info API
- **GetLatestFarmerInfo** - `/api/[db-key]/FarmerInfo/GetLatestFarmerInfo`

### 3. Machine Password APIs
- **GetLatestMachinePassword** - `/api/[db-key]/MachinePassword/GetLatestMachinePassword`
- **UpdateMachinePasswordStatus** - `/api/[db-key]/MachinePassword/UpdateMachinePasswordStatus`

## Machine ID Format

### Valid Formats
1. **Numeric**: `M00001`, `M00123`, `M99999`
   - Must start with `M` followed by digits only
   - Leading zeros are preserved in database matching
   - Parsed as integer for backward compatibility

2. **Alphanumeric**: `M0000df`, `Mabc123`, `Mxyz789`
   - Must start with `M` followed by letters and numbers
   - Case-sensitive matching
   - Creates variants for flexible database matching

### Invalid Formats
- Missing `M` prefix: `00001` ❌
- Special characters: `M@001`, `M-abc` ❌
- Empty after M: `M` ❌
- Spaces: `M 001` ❌

## Variant Matching Logic

### Numeric Machine IDs
**Input**: `M00001`
- Strips `M` prefix → `00001`
- Parses as integer → `1`
- Database query uses `id = 1` (direct numeric match)

### Alphanumeric Machine IDs
**Input**: `M0000df`
- Strips `M` prefix → `0000df`
- Creates variants:
  1. Original with leading zeros: `0000df`
  2. Stripped version: `df` (removes leading zeros)
- Database query uses `machine_id IN ('0000df', 'df')`

**Input**: `Mabc123`
- Strips `M` prefix → `abc123`
- No leading zeros to strip
- Creates single variant: `abc123`
- Database query uses `machine_id IN ('abc123')`

## Implementation Details

### Validation Code Pattern
```typescript
// Remove M prefix
let machineIdStr = machineId.substring(1);

// Check if numeric or alphanumeric
const isNumeric = /^\d+$/.test(machineIdStr);

if (isNumeric) {
  // Numeric: parse as integer
  parsedMachineId = parseInt(machineIdStr);
} else {
  // Alphanumeric: create variants
  if (!/^[a-zA-Z0-9]+$/.test(machineIdStr)) {
    return error; // Invalid characters
  }
  
  machineIdVariants.push(machineIdStr); // Original
  
  const stripped = machineIdStr.replace(/^0+/, '');
  if (stripped && stripped !== machineIdStr) {
    machineIdVariants.push(stripped); // Without leading zeros
  }
}
```

### Query Code Pattern
```typescript
if (parsedMachineId !== null) {
  // Numeric machine ID - direct match
  query = `SELECT ... WHERE id = ?`;
  replacements = [parsedMachineId];
} else {
  // Alphanumeric machine ID - variant match
  const placeholders = machineIdVariants.map(() => '?').join(', ');
  query = `SELECT ... WHERE machine_id IN (${placeholders})`;
  replacements = [...machineIdVariants];
}
```

## Backward Compatibility

### Numeric IDs (Existing Behavior)
- **Before**: `M00001` → parsed as integer `1` → matched by `id = 1`
- **After**: Same behavior maintained
- ✅ No breaking changes for existing numeric machine IDs

### Alphanumeric IDs (New Behavior)
- **Before**: Rejected as invalid format
- **After**: Accepted and matched using variants
- ✅ New functionality, no impact on existing systems

## Database Schema Support

### `machines` Table
```sql
CREATE TABLE machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id VARCHAR(50),  -- Stores both numeric and alphanumeric IDs
  society_id INT,
  -- other fields...
);
```

### Matching Examples
| Database `machine_id` | Input     | Matched By |
|-----------------------|-----------|------------|
| `1`                   | `M00001`  | `id = 1` (numeric) |
| `df`                  | `M0000df` | `machine_id IN ('0000df', 'df')` |
| `0000df`              | `M0000df` | `machine_id IN ('0000df', 'df')` |
| `abc123`              | `Mabc123` | `machine_id IN ('abc123')` |

## Testing Scenarios

### Test Case 1: Numeric Machine ID
```
Input: machineId=M00001
Expected: Matches database id=1 or machine_id='00001' or '1'
```

### Test Case 2: Alphanumeric with Leading Zeros
```
Input: machineId=M0000df
Expected: Matches database machine_id='0000df' OR machine_id='df'
```

### Test Case 3: Alphanumeric without Leading Zeros
```
Input: machineId=Mabc123
Expected: Matches database machine_id='abc123'
```

### Test Case 4: Invalid Format
```
Input: machineId=M@001
Expected: Error - "Invalid machine ID format"
```

### Test Case 5: Missing M Prefix
```
Input: machineId=00001
Expected: Error - "Invalid machine ID format"
```

## Error Messages

All endpoints return consistent error messages:
- **Invalid Format**: `"Invalid machine ID format"`
- **Not Found**: Endpoint-specific (e.g., `"Machine correction not found."`, `"Machine not found"`)
- **Success**: Endpoint-specific data or success message

## Security Considerations

1. **Validation**: All inputs validated with regex patterns
2. **SQL Injection**: Protected by parameterized queries with placeholders
3. **Error Handling**: Generic error messages to prevent information leakage
4. **Format Consistency**: Strict `M` prefix requirement maintains API contract

## Performance Impact

### Numeric IDs
- **Before**: Single integer comparison `id = 1`
- **After**: Same performance (no change)

### Alphanumeric IDs
- **Query**: `machine_id IN ('0000df', 'df')` (2 variants maximum)
- **Index**: Should use index on `machine_id` column
- **Impact**: Minimal (2 string comparisons vs 1 integer comparison)

## Migration Notes

### For Existing Systems
- ✅ No database schema changes required
- ✅ No code changes in client applications needed
- ✅ Existing numeric machine IDs work identically

### For New Systems
- Can use alphanumeric machine IDs immediately
- Store in `machine_id` column as VARCHAR
- API handles matching automatically

## Future Enhancements

1. **Case-Insensitive Matching**: Add lowercase variants for alphanumeric IDs
2. **Custom Variants**: Support admin-defined machine ID formats
3. **Prefix Configuration**: Allow customizable prefix instead of hardcoded `M`
4. **Validation Rules**: Admin-configurable regex patterns per schema

## Change Log

| Date | Endpoint | Change |
|------|----------|--------|
| 2025-01-XX | GetLatestMachineCorrection | Added alphanumeric support with variant matching |
| 2025-01-XX | SaveMachineCorrectionUpdationHistory | Added alphanumeric support |
| 2025-01-XX | GetLatestFarmerInfo | Added alphanumeric support |
| 2025-01-XX | GetLatestMachinePassword | Added alphanumeric support |
| 2025-01-XX | UpdateMachinePasswordStatus | Added alphanumeric support |

## Related Documentation
- [Machine Correction External API](./MACHINE_CORRECTION_EXTERNAL_API.md)
- [Update Machine Password Status API](../UpdateMachinePasswordStatus_API.md)
- [Project Structure](../02-architecture/PROJECT_STRUCTURE.md)
