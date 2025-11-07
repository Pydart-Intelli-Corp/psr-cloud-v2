# Machine Correction API - TypeScript Fixes

## Issues Fixed

### 1. ❌ Import Error - `getUserFromToken`
**Problem**: The function `getUserFromToken` doesn't exist in `@/lib/auth`

**Solution**: Changed to use `verifyToken` directly with Authorization header pattern
```typescript
// Before
import { getUserFromToken } from '@/lib/auth';
const user = await getUserFromToken(request);

// After
import { verifyToken } from '@/lib/auth';
const token = request.headers.get('authorization')?.replace('Bearer ', '');
const user = verifyToken(token);
```

### 2. ❌ Role Comparison Type Mismatch
**Problem**: Comparing `UserRole` enum with string literal `'Admin'`

**Solution**: Use the proper enum value `UserRole.ADMIN`
```typescript
// Before
if (user.role !== 'Admin') {

// After
import { UserRole } from '@/models/User';
if (user.role !== UserRole.ADMIN) {
```

### 3. ❌ TypeScript `any` Type
**Problem**: Using `any` type in error handling

**Solution**: Use type guard with `Error` instance check
```typescript
// Before
} catch (error: any) {
  error.message || 'Failed...'
}

// After
} catch (error) {
  error instanceof Error ? error.message : 'Failed...'
}
```

### 4. ✅ Database Column Names Fixed
**Fixed**: All column names to match snake_case database schema:
- `machineId` → `machine_id`
- `societyId` → `society_id`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

### 5. ✅ Table Name Fixed
**Fixed**: Schema table name from `admin_schemas` → `adminschemas`

### 6. ✅ Backtick Escaping
**Fixed**: Added proper MySQL backticks for table/schema names:
```sql
-- Before
UPDATE ${schemaName}.machine_corrections

-- After
UPDATE \`${schemaName}\`.\`machine_corrections\`
```

## API Endpoints

### POST `/api/user/machine-correction`
- **Auth**: Bearer token (Admin only)
- **Body**: All 18 channel fields + machineId + societyId
- **Logic**: 
  - Sets all old corrections to `status=0`
  - Inserts new correction with `status=1`
  - Uses transaction for data integrity

### GET `/api/user/machine-correction?machineId=123`
- **Auth**: Bearer token (Admin only)
- **Returns**: Last 50 correction records for the machine
- **Order**: Most recent first (`created_at DESC`)

## Database Schema

Table: `machine_corrections` (in each admin schema)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | INT | AUTO_INCREMENT | Primary key |
| machine_id | INT | - | Reference to machines table |
| society_id | INT | - | Reference to societies table |
| channel1_fat | DECIMAL(5,2) | 0.00 | Channel 1 Fat |
| channel1_snf | DECIMAL(5,2) | 0.00 | Channel 1 SNF |
| channel1_clr | DECIMAL(5,2) | 0.00 | Channel 1 CLR |
| channel1_temp | DECIMAL(5,2) | 0.00 | Channel 1 Temperature |
| channel1_water | DECIMAL(5,2) | 0.00 | Channel 1 Water |
| channel1_protein | DECIMAL(5,2) | 0.00 | Channel 1 Protein |
| channel2_* | DECIMAL(5,2) | 0.00 | Channel 2 fields (same 6 fields) |
| channel3_* | DECIMAL(5,2) | 0.00 | Channel 3 fields (same 6 fields) |
| status | TINYINT(1) | 1 | 1=Active, 0=Inactive |
| created_at | TIMESTAMP | CURRENT_TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | CURRENT_TIMESTAMP | Update time |

**Indexes**:
- `idx_machine_id` on `machine_id`
- `idx_society_id` on `society_id`
- `idx_status` on `status`
- `idx_created_at` on `created_at`

## Status Code Summary

| Code | Meaning |
|------|---------|
| 200 | Success |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (not an admin) |
| 404 | Schema not found |
| 500 | Server error |

## Testing

```bash
# POST - Add correction data
curl -X POST http://localhost:3000/api/user/machine-correction \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "machineId": 1,
    "societyId": 1,
    "channel1_fat": 4.50,
    "channel1_snf": 8.75,
    ...
  }'

# GET - Fetch correction history
curl http://localhost:3000/api/user/machine-correction?machineId=1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✅ All TypeScript Errors Resolved
- No compilation errors
- Proper type safety
- Follows project patterns
- Database naming conventions aligned
