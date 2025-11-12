import { 
  BaseExternalAPI, 
  InputValidator, 
  QueryBuilder, 
  type ValidationResult,
  type BaseInputParts
} from '@/lib/external-api';

/**
 * Input interface for UpdateMachinePasswordStatus
 */
interface UpdateMachinePasswordStatusInput extends BaseInputParts {
  passwordType: string; // 'U' for User, 'S' for Supervisor
}

/**
 * Result interface for machine update operations
 */
interface MachineUpdateResult {
  id: number;
  machine_id: string;
  statusU: number;
  statusS: number;
  updated: boolean;
}

/**
 * Enhanced UpdateMachinePasswordStatus API using the generalized pattern
 */
export class UpdateMachinePasswordStatusAPI extends BaseExternalAPI<UpdateMachinePasswordStatusInput, MachineUpdateResult> {
  constructor() {
    super({
      endpointName: 'UpdateMachinePasswordStatus',
      expectedPartCounts: [5], // Exactly 5 parts required
      filterLineEndings: true, // Filter $0D, $0A line endings
      standardErrorMessage: 'Status update failed.'
    });
  }

  /**
   * Parse InputString into UpdateMachinePasswordStatusInput
   * Format: societyId|machineType|version|machineId|passwordType
   */
  parseInput(inputString: string): UpdateMachinePasswordStatusInput | null {
    const parts = inputString.split('|');
    
    if (parts.length !== 5) {
      return null;
    }

    const [societyId, machineType, version, machineId, passwordType] = parts;

    return {
      societyId,
      machineType,
      version,
      machineId,
      passwordType
    };
  }

  /**
   * Validate parsed input
   */
  async validateInput(input: UpdateMachinePasswordStatusInput, dbKey: string): Promise<ValidationResult> {
    // Validate DB Key
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      return {
        isValid: false,
        error: dbKeyValidation.error
      };
    }

    // Validate Society ID
    const societyValidation = InputValidator.validateSocietyId(input.societyId);
    if (!societyValidation.isValid) {
      return {
        isValid: false,
        error: societyValidation.error
      };
    }

    // Validate Machine ID
    const machineValidation = InputValidator.validateMachineId(input.machineId);
    if (!machineValidation.isValid) {
      return {
        isValid: false,
        error: machineValidation.error
      };
    }

    // Validate Password Type (specific to update operation)
    const passwordValidation = InputValidator.validatePasswordType(input.passwordType);
    if (!passwordValidation.isValid) {
      return {
        isValid: false,
        error: passwordValidation.error
      };
    }

    // Validate Machine Model (warning only)
    const modelValidation = InputValidator.validateMachineModel(input.version);
    if (modelValidation.warning) {
      console.log(`⚠️ UpdateMachinePasswordStatus: ${modelValidation.warning}`);
    }

    return {
      isValid: true,
      parsedSocietyId: societyValidation.id,
      parsedMachineId: machineValidation.numericId
    };
  }

  /**
   * Execute machine password status update business logic
   */
  async executeBusinessLogic(
    input: UpdateMachinePasswordStatusInput, 
    schemaName: string, 
    sequelize: unknown
  ): Promise<MachineUpdateResult> {
    // Cast sequelize to the type we need
    const seq = sequelize as { query: (query: string, options: { replacements: (string | number)[] }) => Promise<[unknown[], unknown]> };

    // Parse society and machine info
    const societyValidation = InputValidator.validateSocietyId(input.societyId);
    const machineValidation = InputValidator.validateMachineId(input.machineId);
    const passwordValidation = InputValidator.validatePasswordType(input.passwordType);

    if (!societyValidation.isValid || !machineValidation.isValid || !passwordValidation.isValid) {
      throw new Error('Invalid input validation');
    }

    // Build query filters
    const societyFilter = QueryBuilder.buildSocietyFilter(
      societyValidation.id,
      societyValidation.fallback,
      societyValidation.numericId
    );

    const machineFilter = QueryBuilder.buildMachineFilter(machineValidation);

    // Find the machine to update
    const { query: findQuery, replacements: findReplacements } = QueryBuilder.buildMachinePasswordQuery(
      schemaName,
      societyFilter,
      machineFilter
    );

    console.log(`🔍 UpdateMachinePasswordStatus: Finding machine with query:`, findReplacements);

    const [findResults] = await seq.query(findQuery, { replacements: findReplacements });
    const machines = findResults as MachineUpdateResult[];

    console.log(`✅ UpdateMachinePasswordStatus: Found ${machines.length} machines in schema: ${schemaName}`);

    if (machines.length === 0) {
      throw new Error('Machine not found');
    }

    const machine = machines[0];

    // Log machine details before update
    console.log(`🔍 UpdateMachinePasswordStatus: Machine before update:`, {
      id: machine.id,
      machine_id: machine.machine_id,
      statusU: machine.statusU,
      statusS: machine.statusS
    });

    // Determine which status to update
    const isUserPassword = passwordValidation.isUser;
    const statusField = isUserPassword ? 'statusU' : 'statusS';
    const currentStatus = isUserPassword ? machine.statusU : machine.statusS;

    console.log(`🔄 UpdateMachinePasswordStatus: Updating ${statusField} from ${currentStatus} to 0 for machine ID: ${machine.id}`);

    // Build update query
    const updateQuery = `
      UPDATE \`${schemaName}\`.machines 
      SET ${statusField} = 0 
      WHERE id = ?
    `;

    // Execute the update
    await seq.query(updateQuery, { replacements: [machine.id] });

    // Verify the update
    const verifyQuery = `
      SELECT id, machine_id, statusU, statusS 
      FROM \`${schemaName}\`.machines 
      WHERE id = ?
    `;

    const [verifyResults] = await seq.query(verifyQuery, { replacements: [machine.id] });
    const updatedMachine = verifyResults[0] as MachineUpdateResult;

    console.log(`✅ UpdateMachinePasswordStatus: Update completed:`, {
      id: updatedMachine.id,
      machine_id: updatedMachine.machine_id,
      statusU: updatedMachine.statusU,
      statusS: updatedMachine.statusS,
      updated: true
    });

    return {
      ...updatedMachine,
      updated: true
    };
  }

  /**
   * Format success response
   */
  formatResponse(result: MachineUpdateResult): string {
    const response = 'Machine password status updated successfully.';
    
    console.log(`📤 UpdateMachinePasswordStatus: Returning success response for machine ${result.machine_id}`);
    return response;
  }
}

/**
 * Usage example for the UpdateMachinePasswordStatus endpoint
 */
export function createUpdateMachinePasswordStatusEndpoint() {
  const updateAPI = new UpdateMachinePasswordStatusAPI();

  return {
    GET: updateAPI.handleRequest.bind(updateAPI),
    POST: updateAPI.handleRequest.bind(updateAPI),
    OPTIONS: updateAPI.handleOptions.bind(updateAPI)
  };
}