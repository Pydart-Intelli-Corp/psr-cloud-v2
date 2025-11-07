# External API Pattern Usage Guide

## Overview

This guide demonstrates how to use the generalized external API pattern to create new InputString-based endpoints efficiently and consistently.

## Quick Start

### 1. Create a New External API Endpoint

```typescript
// /src/app/api/[db-key]/YourEndpoint/GetLatestYourData/route.ts
import { 
  BaseExternalAPI, 
  InputValidator, 
  QueryBuilder, 
  ResponseFormatter,
  type ValidationResult,
  type BaseInputParts
} from '@/lib/external-api';

// Define your input interface
interface YourDataInput extends BaseInputParts {
  yourSpecificField?: string; // Add endpoint-specific fields
}

// Define your result interface
interface YourDataResult {
  id: number;
  // Add your data fields
}

class YourDataAPI extends BaseExternalAPI<YourDataInput, YourDataResult[]> {
  constructor() {
    super({
      endpointName: 'YourData',
      expectedPartCounts: [4, 5], // Adjust based on your InputString format
      filterLineEndings: false, // Set to true if needed
      standardErrorMessage: 'Your data not found.'
    });
  }

  parseInput(inputString: string): YourDataInput | null {
    // Implement your InputString parsing logic
  }

  async validateInput(input: YourDataInput, dbKey: string): Promise<ValidationResult> {
    // Implement your validation logic using InputValidator utilities
  }

  async executeBusinessLogic(
    input: YourDataInput, 
    schemaName: string, 
    sequelize: unknown
  ): Promise<YourDataResult[]> {
    // Implement your database query logic using QueryBuilder utilities
  }

  formatResponse(result: YourDataResult[]): string {
    // Implement your response formatting using ResponseFormatter utilities
  }
}

// Export the endpoint handlers
const yourAPI = new YourDataAPI();
export const GET = yourAPI.handleRequest.bind(yourAPI);
export const POST = yourAPI.handleRequest.bind(yourAPI);
export const OPTIONS = yourAPI.handleOptions.bind(yourAPI);
```

### 2. Using Utility Classes

#### InputValidator

```typescript
// Validate society ID (handles S- prefix)
const societyValidation = InputValidator.validateSocietyId(input.societyId);
if (!societyValidation.isValid) {
  return { isValid: false, error: societyValidation.error };
}

// Validate machine ID (handles M prefix and numeric parsing)
const machineValidation = InputValidator.validateMachineId(input.machineId);
if (!machineValidation.isValid) {
  return { isValid: false, error: machineValidation.error };
}

// Validate password type (for password endpoints)
const passwordValidation = InputValidator.validatePasswordType(input.passwordType);
```

#### QueryBuilder

```typescript
// Build society filter for database queries
const societyFilter = QueryBuilder.buildSocietyFilter(
  societyValidation.id,
  societyValidation.fallback,
  societyValidation.numericId
);

// Build machine filter for database queries
const machineFilter = QueryBuilder.buildMachineFilter(
  input.machineId,
  machineValidation.numericId!,
  machineValidation.withoutPrefix!,
  machineValidation.strippedId!
);

// Build complete query with pagination
const { query, replacements } = QueryBuilder.buildFarmerQuery(
  schemaName,
  societyFilter,
  machineFilter,
  pagination
);
```

#### ResponseFormatter

```typescript
// Format CSV response
const csvData = ResponseFormatter.formatFarmerCSV(farmers);
return ResponseFormatter.createSuccessResponse(csvData, 'text/csv');

// Format machine password response
const passwordResponse = ResponseFormatter.formatMachinePassword(
  { isUser: true, isSupervisor: false },
  password
);

// Create error response
return ResponseFormatter.createErrorResponse('Your error message');
```

## Detailed Examples

### Example 1: Simple Data Retrieval Endpoint

```typescript
// /src/app/api/[db-key]/SensorData/GetLatestSensorData/route.ts
import { 
  BaseExternalAPI, 
  InputValidator, 
  QueryBuilder, 
  ResponseFormatter,
  type ValidationResult,
  type BaseInputParts
} from '@/lib/external-api';

interface SensorDataInput extends BaseInputParts {
  sensorType: string; // 5th parameter for sensor type
}

interface SensorDataResult {
  id: number;
  sensor_id: string;
  temperature: number;
  humidity: number;
  timestamp: Date;
}

class SensorDataAPI extends BaseExternalAPI<SensorDataInput, SensorDataResult[]> {
  constructor() {
    super({
      endpointName: 'SensorData',
      expectedPartCounts: [5], // societyId|machineType|version|machineId|sensorType
      filterLineEndings: false,
      standardErrorMessage: 'Sensor data not found.'
    });
  }

  parseInput(inputString: string): SensorDataInput | null {
    const parts = inputString.split('|');
    if (parts.length !== 5) return null;

    const [societyId, machineType, version, machineId, sensorType] = parts;
    return { societyId, machineType, version, machineId, sensorType };
  }

  async validateInput(input: SensorDataInput, dbKey: string): Promise<ValidationResult> {
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      return { isValid: false, error: dbKeyValidation.error };
    }

    const societyValidation = InputValidator.validateSocietyId(input.societyId);
    if (!societyValidation.isValid) {
      return { isValid: false, error: societyValidation.error };
    }

    const machineValidation = InputValidator.validateMachineId(input.machineId);
    if (!machineValidation.isValid) {
      return { isValid: false, error: machineValidation.error };
    }

    // Custom validation for sensor type
    if (!input.sensorType || !['TEMP', 'HUMID', 'ALL'].includes(input.sensorType)) {
      return { 
        isValid: false, 
        error: `Invalid sensor type: ${input.sensorType}` 
      };
    }

    return { isValid: true };
  }

  async executeBusinessLogic(
    input: SensorDataInput, 
    schemaName: string, 
    sequelize: unknown
  ): Promise<SensorDataResult[]> {
    const seq = sequelize as { query: (query: string, options: { replacements: (string | number)[] }) => Promise<[unknown[], unknown]> };

    const societyValidation = InputValidator.validateSocietyId(input.societyId);
    const machineValidation = InputValidator.validateMachineId(input.machineId);

    const escapedSchema = QueryBuilder.escapeIdentifier(schemaName);
    
    let query = `
      SELECT 
        s.id, 
        s.sensor_id, 
        s.temperature, 
        s.humidity, 
        s.timestamp
      FROM ${escapedSchema}.sensor_data s
      LEFT JOIN ${escapedSchema}.machines m ON s.machine_id = m.id
      WHERE m.society_id = ?
        AND m.id = ?
        AND s.status = 'active'
    `;

    const replacements = [societyValidation.numericId, machineValidation.numericId];

    if (input.sensorType !== 'ALL') {
      query += ` AND s.sensor_type = ?`;
      replacements.push(input.sensorType);
    }

    query += ` ORDER BY s.timestamp DESC LIMIT 100`;

    const [results] = await seq.query(query, { replacements });
    return results as SensorDataResult[];
  }

  formatResponse(results: SensorDataResult[]): string {
    if (results.length === 0) {
      return 'Sensor data not found.';
    }

    // Format as pipe-delimited data
    const responseData = results.map(sensor => 
      `${sensor.id}|${sensor.sensor_id}|${sensor.temperature}|${sensor.humidity}|${sensor.timestamp.toISOString()}`
    ).join('||');

    ResponseFormatter.logResponse('SensorData', 'sensor readings', results.length, responseData);
    return responseData;
  }
}

const sensorAPI = new SensorDataAPI();
export const GET = sensorAPI.handleRequest.bind(sensorAPI);
export const POST = sensorAPI.handleRequest.bind(sensorAPI);
export const OPTIONS = sensorAPI.handleOptions.bind(sensorAPI);
```

### Example 2: Command Execution Endpoint

```typescript
// /src/app/api/[db-key]/MachineCommand/ExecuteCommand/route.ts
interface MachineCommandInput extends BaseInputParts {
  command: string; // 5th parameter for command
}

interface CommandResult {
  success: boolean;
  message: string;
  commandId: string;
}

class MachineCommandAPI extends BaseExternalAPI<MachineCommandInput, CommandResult> {
  constructor() {
    super({
      endpointName: 'MachineCommand',
      expectedPartCounts: [5], // societyId|machineType|version|machineId|command
      filterLineEndings: true, // Commands might have line endings
      standardErrorMessage: 'Command execution failed.'
    });
  }

  parseInput(inputString: string): MachineCommandInput | null {
    const parts = inputString.split('|');
    if (parts.length !== 5) return null;

    const [societyId, machineType, version, machineId, command] = parts;
    return { societyId, machineType, version, machineId, command };
  }

  async validateInput(input: MachineCommandInput, dbKey: string): Promise<ValidationResult> {
    // Standard validations
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      return { isValid: false, error: dbKeyValidation.error };
    }

    const societyValidation = InputValidator.validateSocietyId(input.societyId);
    const machineValidation = InputValidator.validateMachineId(input.machineId);

    if (!societyValidation.isValid || !machineValidation.isValid) {
      return { 
        isValid: false, 
        error: societyValidation.error || machineValidation.error 
      };
    }

    // Custom command validation
    const allowedCommands = ['START', 'STOP', 'RESET', 'STATUS'];
    if (!allowedCommands.includes(input.command)) {
      return { 
        isValid: false, 
        error: `Invalid command: ${input.command}` 
      };
    }

    return { isValid: true };
  }

  async executeBusinessLogic(
    input: MachineCommandInput, 
    schemaName: string, 
    sequelize: unknown
  ): Promise<CommandResult> {
    // Execute command logic here
    const commandId = `CMD_${Date.now()}`;
    
    console.log(`🔧 Executing command ${input.command} on machine ${input.machineId}`);
    
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      message: `Command ${input.command} executed successfully`,
      commandId
    };
  }

  formatResponse(result: CommandResult): string {
    if (!result.success) {
      return 'Command execution failed.';
    }

    return `SUCCESS|${result.commandId}|${result.message}`;
  }
}
```

## Best Practices

### 1. Input Validation
- Always validate all input parts using `InputValidator` utilities
- Provide meaningful error messages
- Log validation failures for debugging

### 2. Database Queries
- Use `QueryBuilder` utilities for consistent query building
- Always use parameterized queries to prevent SQL injection
- Handle multiple ID format variations (string vs numeric)

### 3. Response Formatting
- Use `ResponseFormatter` utilities for consistent responses
- Wrap responses in quotes for external API compatibility
- Include proper CORS headers
- Log response details for debugging

### 4. Error Handling
- Return consistent error messages (status 200 with error message)
- Log detailed errors for internal debugging
- Don't expose internal system details in external responses

### 5. Configuration
- Set appropriate `expectedPartCounts` for your InputString format
- Enable `filterLineEndings` if your endpoint receives line ending characters
- Use descriptive `endpointName` for logging and debugging

## Testing Your Endpoint

```typescript
// Create test script: scripts/test-your-endpoint.mjs
const testCases = [
  {
    name: 'Valid request',
    inputString: 'S-s12|ECOD|LE3.34|M00001|DATA',
    expected: 'Should return data'
  },
  {
    name: 'Invalid society ID',
    inputString: '|ECOD|LE3.34|M00001|DATA',
    expected: 'Should return error'
  }
  // Add more test cases
];

// Test your endpoint
for (const testCase of testCases) {
  const url = `http://localhost:3000/api/TIS6517/YourEndpoint/GetLatestYourData?InputString=${encodeURIComponent(testCase.inputString)}`;
  const response = await fetch(url);
  const result = await response.text();
  console.log(`${testCase.name}: ${result}`);
}
```

## Adding New Endpoints

1. **Create the endpoint class** extending `BaseExternalAPI`
2. **Implement the required methods** (parseInput, validateInput, executeBusinessLogic, formatResponse)
3. **Create the route file** in `/src/app/api/[db-key]/YourEndpoint/GetLatestYourData/route.ts`
4. **Export the handlers** (GET, POST, OPTIONS)
5. **Test thoroughly** with various input combinations
6. **Document the endpoint** in your API documentation

This pattern ensures consistency across all external endpoints while maintaining flexibility for specific business logic.