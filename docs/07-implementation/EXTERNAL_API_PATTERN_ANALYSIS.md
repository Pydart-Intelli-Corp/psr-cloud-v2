# External API Pattern Analysis

## Overview
Analysis of existing external API endpoints to identify common patterns and create a generalized structure for future InputString-based endpoints.

## Existing Endpoints Analysis

### 1. FarmerInfo/GetLatestFarmerInfo
- **URL Pattern**: `/api/[db-key]/FarmerInfo/GetLatestFarmerInfo`
- **InputString Format**: `societyId|machineType|version|machineId|pageNumber` or `societyId|machineType|version|machineId`
- **Response Formats**:
  - CSV: `ID,RF-ID,NAME,MOBILE,SMS,BONUS\n{data}`
  - Pagination: `"id|farmer_id|name|phone|sms_enabled|bonus||..."`
- **Business Logic**: Retrieves farmer information with pagination or CSV download

### 2. MachinePassword/GetLatestMachinePassword
- **URL Pattern**: `/api/[db-key]/MachinePassword/GetLatestMachinePassword`
- **InputString Format**: `societyId|machineType|version|machineId|passwordType`
- **Response Formats**:
  - User Password: `"PU|123456"`
  - Supervisor Password: `"PS|789012"`
  - Error: `"Machine password not found."`
- **Business Logic**: Retrieves machine passwords based on type

## Common Patterns Identified

### 1. Request Handling Structure
```typescript
async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    // 1. Extract InputString from GET/POST
    // 2. Resolve dynamic params
    // 3. Validate DB Key
    // 4. Parse InputString
    // 5. Validate parsed components
    // 6. Connect to database
    // 7. Execute business logic
    // 8. Return formatted response
  } catch (error) {
    // Standard error handling
  }
}
```

### 2. InputString Processing
Both endpoints follow this pattern:
- Extract `InputString` from query params (GET) or body (POST)
- Split by `|` delimiter
- Validate part count
- Parse individual components with validation
- Handle line endings and special characters

### 3. Database Connection Pattern
```typescript
// Connect to database
await connectDB();
const { getModels } = await import('@/models');
const { sequelize, User } = getModels();

// Find admin and generate schema
const admin = await User.findOne({ where: { dbKey: dbKey.toUpperCase() } });
const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
```

### 4. Response Format Standards
- All responses wrapped in double quotes: `"response"`
- Consistent CORS headers
- Plain text content type
- Status 200 for both success and business logic errors
- Standard error messages for external APIs

## Generalized Pattern

### Core Structure
```typescript
interface ExternalAPIConfig<TInputParts, TResult> {
  endpointName: string;
  inputParser: (inputString: string) => TInputParts | null;
  validator: (parts: TInputParts, dbKey: string) => Promise<ValidationResult>;
  businessLogic: (parts: TInputParts, schemaName: string, sequelize: any) => Promise<TResult>;
  responseFormatter: (result: TResult) => string;
  errorMessage: string;
}
```

### Input String Parser
```typescript
interface BaseInputParts {
  societyId: string;
  machineType: string;
  version: string;
  machineId: string;
}

interface FarmerInfoInput extends BaseInputParts {
  pageNumber?: string; // Optional 5th part
}

interface MachinePasswordInput extends BaseInputParts {
  passwordType: string; // Required 5th part
}
```

### Validation Pattern
```typescript
class InputValidator {
  static validateSocietyId(societyIdStr: string): { id: string, fallback: string } {
    // Handle S- prefix format
    // Return both string and numeric variants
  }
  
  static validateMachineId(machineId: string): number | null {
    // Validate M prefix format
    // Extract numeric part
    // Handle leading zeros
  }
  
  static validateDbKey(dbKey: string): boolean {
    // Standard DB key validation
  }
}
```

### Database Query Pattern
```typescript
interface QueryBuilder {
  buildSocietyFilter(societyId: string, fallback: string): string;
  buildMachineFilter(machineId: number): string;
  buildBaseQuery(schemaName: string, tableName: string): string;
}
```

### Response Formatter
```typescript
class ResponseFormatter {
  static success(data: string, headers?: Record<string, string>): Response {
    return new Response(`"${data}"`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...headers
      }
    });
  }
  
  static error(message: string): Response {
    return new Response(`"${message}"`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
```

## Differences Between Endpoints

| Aspect | FarmerInfo | MachinePassword |
|--------|------------|-----------------|
| **Input Parts** | 4 or 5 parts | Exactly 5 parts |
| **5th Parameter** | Page number (C00001) | Password type (U/S) |
| **Response Format** | CSV or Pipe-delimited | Password format (PU\|PS) |
| **Pagination** | Yes (5th param) | No |
| **CSV Support** | Yes (4 params) | No |
| **Error Messages** | Business specific | Generic "not found" |
| **Line Ending Filter** | No | Yes ($0D, $0A removal) |
| **Status Validation** | Active status | Status flags (statusU/S) |

## Recommended Generalization Strategy

### 1. Create Base External API Class
```typescript
abstract class BaseExternalAPI<TInput, TResult> {
  abstract parseInput(inputString: string): TInput | null;
  abstract validateInput(input: TInput, dbKey: string): Promise<boolean>;
  abstract executeBusinessLogic(input: TInput, schema: string): Promise<TResult>;
  abstract formatResponse(result: TResult): string;
  abstract getErrorMessage(): string;
  
  // Common request handling logic
  async handleRequest(request: NextRequest, params: any): Promise<Response> {
    // Standard flow implementation
  }
}
```

### 2. Specific Implementations
```typescript
class FarmerInfoAPI extends BaseExternalAPI<FarmerInfoInput, FarmerResult[]> {
  // Specific implementations for farmer info logic
}

class MachinePasswordAPI extends BaseExternalAPI<MachinePasswordInput, PasswordResult> {
  // Specific implementations for password logic
}
```

### 3. Utility Classes
```typescript
// Input string processing utilities
class InputStringProcessor {
  static filterLineEndings(input: string): string;
  static splitAndValidate(input: string, expectedParts: number | number[]): string[] | null;
}

// Database utilities
class DatabaseHelper {
  static async getAdminSchema(dbKey: string): Promise<string>;
  static buildSocietyMachineQuery(schema: string, table: string): string;
}

// Response utilities
class ExternalResponseHelper {
  static wrapInQuotes(data: string): string;
  static standardHeaders(): Record<string, string>;
  static corsHeaders(): Record<string, string>;
}
```

## Implementation Benefits

### 1. Code Reusability
- Common request/response handling
- Shared validation logic
- Standardized error handling
- Consistent CORS implementation

### 2. Maintainability
- Centralized pattern changes
- Easier debugging and logging
- Consistent behavior across endpoints
- Type safety with TypeScript

### 3. Scalability
- Easy to add new external endpoints
- Consistent API contract
- Reduced code duplication
- Standardized testing approach

### 4. Future-Proofing
- Plugin architecture for new endpoint types
- Configurable input parsing
- Flexible response formatting
- Extensible validation system

## Implementation Status

✅ **Base classes created** in `/src/lib/external-api/`
- `BaseExternalAPI.ts` - Abstract base class for all external endpoints
- `InputValidator.ts` - Utility class for validating InputString components
- `QueryBuilder.ts` - Utility class for building database queries
- `ResponseFormatter.ts` - Utility class for formatting responses
- `index.ts` - Main exports and common interfaces

✅ **Example implementations** in `/src/lib/external-api/examples/`
- `FarmerInfoAPI.ts` - Example implementation for farmer data endpoint
- `MachinePasswordAPI.ts` - Example implementation for password endpoint

✅ **Comprehensive documentation** in `/src/lib/external-api/README.md`
- Usage guide with detailed examples
- Best practices and testing strategies
- Step-by-step instructions for creating new endpoints

## Next Steps

1. **Refactor existing endpoints** to use the new pattern (optional - current endpoints work fine)
2. **Use the pattern for new endpoints** - significantly faster development
3. **Add comprehensive testing** for the generalized system
4. **Extend pattern** as new requirements emerge

## Example New Endpoint Structure

```typescript
// /src/app/api/[db-key]/SensorData/GetLatestSensorData/route.ts
class SensorDataAPI extends BaseExternalAPI<SensorInput, SensorResult> {
  parseInput(inputString: string): SensorInput | null {
    // Implementation specific to sensor data format
  }
  
  // Other required method implementations...
}

const sensorAPI = new SensorDataAPI();
export const GET = sensorAPI.handleRequest.bind(sensorAPI);
export const POST = sensorAPI.handleRequest.bind(sensorAPI);
export const OPTIONS = sensorAPI.handleOptions.bind(sensorAPI);
```

This approach will make adding new external endpoints much faster and more consistent.