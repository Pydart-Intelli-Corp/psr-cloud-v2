# External API Utilities - Complete Usage Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Utility Classes](#utility-classes)
4. [Common Patterns](#common-patterns)
5. [Example Implementations](#example-implementations)
6. [ESP32 Integration](#esp32-integration)

---

## Overview

This library provides reusable utilities for building external API endpoints that follow the `InputString` pattern. All endpoints share common functionality for:

- **Input Validation** - Society ID, Machine ID, DB Key validation
- **Query Building** - Flexible database queries with multiple ID variants
- **Response Formatting** - ESP32-compatible responses
- **Error Handling** - Consistent error messages and logging

---

## Quick Start

### 1. Basic Endpoint Structure

```typescript
import { 
  ESP32ResponseHelper, 
  InputValidator, 
  QueryBuilder 
} from '@/lib/external-api';

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    // 1. Extract InputString
    let inputString = await ESP32ResponseHelper.extractInputString(request);
    
    // 2. Get DB Key
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'];
    
    // 3. Filter line endings
    if (inputString) {
      inputString = ESP32ResponseHelper.filterLineEndings(inputString);
    }
    
    // 4. Validate inputs
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse(dbKeyValidation.error!);
    }
    
    // 5. Parse InputString
    const parts = inputString.split('|');
    const [societyId, machineType, version, machineId] = parts;
    
    // 6. Validate components
    const societyValidation = InputValidator.validateSocietyId(societyId);
    const machineValidation = InputValidator.validateMachineId(machineId);
    
    if (!societyValidation.isValid || !machineValidation.isValid) {
      return ESP32ResponseHelper.createErrorResponse('Invalid input');
    }
    
    // 7. Connect to database
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();
    
    // 8. Get schema name
    const admin = await User.findOne({ where: { dbKey: dbKey.toUpperCase() } });
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    // 9. Build query
    const societyFilter = QueryBuilder.buildSocietyFilter(
      societyValidation.id,
      societyValidation.fallback,
      societyValidation.numericId
    );
    
    const machineFilter = QueryBuilder.buildMachineFilter(machineValidation);
    
    // 10. Execute business logic
    // ... your endpoint-specific logic here ...
    
    // 11. Return response
    return ESP32ResponseHelper.createDataResponse(resultData);
    
  } catch (error) {
    console.error('API Error:', error);
    return ESP32ResponseHelper.createErrorResponse('Internal server error');
  }
}

export async function GET(request: NextRequest, context: any) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return handleRequest(request, context);
}

export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
```

---

## Utility Classes

### 🔍 InputValidator

Validates and parses input components.

#### Methods

##### `validateDbKey(dbKey: string)`

```typescript
const result = InputValidator.validateDbKey(dbKey);
// Returns: { isValid: boolean, error?: string }
```

##### `validateSocietyId(societyId: string)`

Handles multiple society ID formats:
- `S-s12` → `{ id: 'S-s12', fallback: 's12', numericId: 12 }`
- `333` → `{ id: '333', fallback: '333', numericId: 333 }`

```typescript
const result = InputValidator.validateSocietyId(societyId);
// Returns: {
//   isValid: boolean,
//   id: string,              // Original format
//   fallback: string,        // Without S- prefix
//   numericId?: number,      // Parsed numeric ID
//   error?: string
// }
```

##### `validateMachineId(machineId: string)`

Handles multiple machine ID formats:
- `M00001` → numeric ID `1`
- `Mm00001` → alphanumeric ID `m1`
- `Ma00005` → alphanumeric ID `a5`
- `M0000df` → alphanumeric ID `df`

```typescript
const result = InputValidator.validateMachineId(machineId);
// Returns: {
//   isValid: boolean,
//   numericId?: number,          // For numeric IDs: 1, 5
//   alphanumericId?: string,     // For alphanumeric: m1, df
//   withoutPrefix?: string,      // Without M: 00001, m00001
//   strippedId?: string,         // Cleaned: 1, m1, df
//   variants?: (string|number)[], // All matching variants
//   isNumeric?: boolean,         // True if purely numeric
//   error?: string
// }
```

##### `validatePasswordType(passwordType: string)`

```typescript
const result = InputValidator.validatePasswordType(passwordType);
// Returns: {
//   isValid: boolean,
//   isUser: boolean,         // True if 'U' or 'U$0D'
//   isSupervisor: boolean,   // True if 'S' or 'S$0D'
//   error?: string
// }
```

---

### 🔨 QueryBuilder

Builds database queries with flexible matching.

#### Methods

##### `buildSocietyFilter(id, fallback, numericId?)`

Creates WHERE clause for society matching:

```typescript
const filter = QueryBuilder.buildSocietyFilter('S-s12', 's12', 12);
// Returns: {
//   condition: '(s.society_id = ? OR s.society_id = ? OR m.society_id = ?)',
//   replacements: ['S-s12', 's12', 12]
// }
```

##### `buildMachineFilter(machineValidation, useNumericId?)`

Creates WHERE clause for machine matching:

```typescript
const machineValidation = InputValidator.validateMachineId('M00001');
const filter = QueryBuilder.buildMachineFilter(machineValidation);
// Returns: {
//   condition: 'm.id = ?',  // Or 'm.machine_id IN (?, ?, ?)' for alphanumeric
//   replacements: [1]       // Or ['m1', 'm00001', '1'] for alphanumeric
// }
```

##### `buildSocietyLookupQuery(schemaName, societyIdStr)`

Queries society table to get database ID:

```typescript
const { query, replacements } = QueryBuilder.buildSocietyLookupQuery(
  'admin_abc1234',
  'S-s12'
);
// Returns:
// query: "SELECT id FROM `admin_abc1234`.societies WHERE society_id = ? OR society_id = ? LIMIT 1"
// replacements: ['S-s12', 's12']
```

##### `buildFarmerQuery(schemaName, societyFilter, machineFilter, pagination?)`

Complete farmer info query:

```typescript
const { query, replacements } = QueryBuilder.buildFarmerQuery(
  schemaName,
  societyFilter,
  machineFilter,
  { limit: 5, offset: 0 }
);
```

##### `buildMachinePasswordQuery(schemaName, societyFilter, machineFilter)`

Complete machine password query.

---

### 📡 ESP32ResponseHelper

Creates ESP32-compatible responses.

#### Key Features

- Always returns HTTP 200 (even for errors)
- No quotes for simple messages
- Proper headers: `charset=utf-8`, `Content-Length`, `Connection: close`

#### Methods

##### `createResponse(data, options?)`

```typescript
const response = ESP32ResponseHelper.createResponse('Cloud test OK');
// Returns Response with:
// - status: 200
// - body: "Cloud test OK" (no quotes)
// - headers: Content-Type, Content-Length, Connection, Cache-Control
```

##### `createErrorResponse(errorMessage)`

```typescript
const response = ESP32ResponseHelper.createErrorResponse('Invalid DB Key');
// Always returns 200 status for ESP32 compatibility
```

##### `createDataResponse(data)`

For structured data (pipe-delimited):

```typescript
const response = ESP32ResponseHelper.createDataResponse('12-11-2025 10:30:00 AM|No update');
```

##### `createCSVResponse(csvData, filename?)`

```typescript
const csv = 'ID,NAME\n1,John\n2,Jane';
const response = ESP32ResponseHelper.createCSVResponse(csv, 'farmers.csv');
```

##### `extractInputString(request)`

Handles malformed URLs from ESP32:

```typescript
const inputString = await ESP32ResponseHelper.extractInputString(request);
// Extracts from:
// - ?InputString=value
// - ?,InputString=value (malformed)
// - POST body
```

##### `filterLineEndings(inputString)`

Removes ESP32 line ending markers:

```typescript
const cleaned = ESP32ResponseHelper.filterLineEndings('M00001|U$0D$0A');
// Returns: 'M00001|U'
```

---

## Common Patterns

### Pattern 1: Simple Data Retrieval

```typescript
// Endpoint: /api/[db-key]/Data/GetInfo
// InputString: societyId|machineType|version|machineId

async function handleRequest(request, { params }) {
  // Extract & validate
  const inputString = await ESP32ResponseHelper.extractInputString(request);
  const resolvedParams = await params;
  const dbKey = resolvedParams['db-key'];
  
  // Validate DB Key
  const dbKeyValidation = InputValidator.validateDbKey(dbKey);
  if (!dbKeyValidation.isValid) {
    return ESP32ResponseHelper.createErrorResponse(dbKeyValidation.error);
  }
  
  // Parse InputString
  const [societyId, machineType, version, machineId] = inputString.split('|');
  
  // Validate components
  const societyValidation = InputValidator.validateSocietyId(societyId);
  const machineValidation = InputValidator.validateMachineId(machineId);
  
  if (!societyValidation.isValid || !machineValidation.isValid) {
    return ESP32ResponseHelper.createErrorResponse('Invalid input');
  }
  
  // Database operations
  await connectDB();
  const { sequelize, User } = (await import('@/models')).getModels();
  
  // Get admin & schema
  const admin = await User.findOne({ where: { dbKey: dbKey.toUpperCase() } });
  if (!admin) {
    return ESP32ResponseHelper.createErrorResponse('Invalid DB Key');
  }
  
  const schemaName = `${admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${admin.dbKey.toLowerCase()}`;
  
  // Build query
  const societyFilter = QueryBuilder.buildSocietyFilter(
    societyValidation.id,
    societyValidation.fallback,
    societyValidation.numericId
  );
  
  const machineFilter = QueryBuilder.buildMachineFilter(machineValidation);
  
  // Execute query
  const query = `
    SELECT * FROM \`${schemaName}\`.your_table
    WHERE ${societyFilter.condition} AND ${machineFilter.condition}
  `;
  
  const [results] = await sequelize.query(query, {
    replacements: [...societyFilter.replacements, ...machineFilter.replacements]
  });
  
  if (results.length === 0) {
    return ESP32ResponseHelper.createErrorResponse('Data not found');
  }
  
  // Format response
  const responseData = formatYourData(results[0]);
  return ESP32ResponseHelper.createDataResponse(responseData);
}
```

### Pattern 2: Update Operation

```typescript
// Endpoint: /api/[db-key]/Data/Update
// InputString: societyId|machineType|version|machineId|status

async function handleRequest(request, { params }) {
  // ... validation steps same as Pattern 1 ...
  
  // Parse additional parameter
  const [societyId, machineType, version, machineId, status] = inputString.split('|');
  
  // Validate status
  if (!['U', 'S'].includes(status)) {
    return ESP32ResponseHelper.createErrorResponse('Invalid status');
  }
  
  // ... database connection ...
  
  // Execute UPDATE
  const updateQuery = `
    UPDATE \`${schemaName}\`.your_table
    SET status = 0
    WHERE ${machineFilter.condition}
  `;
  
  await sequelize.query(updateQuery, {
    replacements: machineFilter.replacements
  });
  
  return ESP32ResponseHelper.createResponse('Update successful');
}
```

---

## Example Implementations

### Example 1: CloudTest Endpoint

Simple connectivity test:

```typescript
// src/app/api/[db-key]/Machine/CloudTest/route.ts
import { ESP32ResponseHelper, InputValidator } from '@/lib/external-api';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';

async function handleRequest(request: NextRequest, { params }) {
  try {
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'];
    
    // Validate DB Key
    const validation = InputValidator.validateDbKey(dbKey);
    if (!validation.isValid) {
      return ESP32ResponseHelper.createErrorResponse(validation.error!);
    }
    
    // Verify admin exists
    await connectDB();
    const { User } = (await import('@/models')).getModels();
    const admin = await User.findOne({ where: { dbKey: dbKey.toUpperCase() } });
    
    if (!admin) {
      return ESP32ResponseHelper.createErrorResponse('Invalid DB Key');
    }
    
    return ESP32ResponseHelper.createResponse('Cloud test OK');
    
  } catch (error) {
    return ESP32ResponseHelper.createErrorResponse('Cloud test failed');
  }
}

export async function GET(request: NextRequest, context: any) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return handleRequest(request, context);
}

export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
```

### Example 2: MachinePassword Endpoint

With password type validation:

```typescript
// Parse InputString (5 parts)
const [societyId, machineType, version, machineId, passwordType] = inputString.split('|');

// Validate password type
const passwordValidation = InputValidator.validatePasswordType(passwordType);
if (!passwordValidation.isValid) {
  return ESP32ResponseHelper.createErrorResponse(passwordValidation.error!);
}

// ... query database ...

// Format response
if (passwordValidation.isUser) {
  return ESP32ResponseHelper.createDataResponse(`PU|${machine.user_password}`);
} else {
  return ESP32ResponseHelper.createDataResponse(`PS|${machine.supervisor_password}`);
}
```

---

## ESP32 Integration

### ESP32 Request Handling

The ESP32 WiFi module may send malformed URLs:

**Normal URL:**
```
GET /api/ABC1234/Machine/CloudTest?InputString=S-1|ECOD|LE3.36|M00001
```

**Malformed URL (comma after ?):**
```
GET /api/ABC1234/Machine/CloudTest?,InputString=S-1|ECOD|LE3.36|M00001
```

**Line endings:**
```
InputString=S-1|ECOD|LE3.36|M00001$0D$0A
```

### Solution

Use `ESP32ResponseHelper`:

```typescript
// Extracts InputString from both normal and malformed URLs
const inputString = await ESP32ResponseHelper.extractInputString(request);

// Filters line endings ($0D, $0A, $0D$0A)
const cleaned = ESP32ResponseHelper.filterLineEndings(inputString);
```

### ESP32 Response Requirements

✅ **DO:**
- Always return HTTP 200 (even for errors)
- Include `Content-Length` header
- Include `Connection: close` header
- Use `charset=utf-8`

❌ **DON'T:**
- Return 400, 404, 500 status codes (ESP32 ignores them)
- Add quotes around simple messages
- Use chunked encoding

**Correct:**
```typescript
return ESP32ResponseHelper.createResponse('Cloud test OK');
// Status: 200
// Body: Cloud test OK (no quotes)
// Headers: Content-Type, Content-Length, Connection: close
```

**Incorrect:**
```typescript
return new Response('"Error"', { status: 400 });
// ESP32 will show "ERROR" because status !== 200
```

---

## Summary

### Benefits of Using These Utilities

1. **✅ Consistency** - All endpoints follow the same pattern
2. **✅ Maintainability** - Changes in one place affect all endpoints
3. **✅ ESP32 Compatible** - Built-in handling for ESP32 quirks
4. **✅ Flexible Matching** - Supports numeric and alphanumeric machine IDs
5. **✅ Comprehensive Validation** - Validates all input components
6. **✅ Reusable Queries** - Pre-built query builders for common operations

### Creating New Endpoints

1. Copy Pattern 1 or Pattern 2 above
2. Modify InputString parsing for your format
3. Add endpoint-specific validation
4. Implement your business logic
5. Use ESP32ResponseHelper for responses

### Testing

Test with various InputString formats:
- `S-s12|ECOD|LE3.36|M00001`
- `333|DPST-G|LE2.00|Mm00005` (alphanumeric machine ID)
- `S-1|LSE|LE3.36|M0000df` (fully alphanumeric)

---

**Need Help?** Check existing endpoints in:
- `/src/app/api/[db-key]/Machine/CloudTest/route.ts`
- `/src/app/api/[db-key]/MachinePassword/GetLatestMachinePassword/route.ts`
- `/src/app/api/[db-key]/FarmerInfo/GetLatestFarmerInfo/route.ts`
