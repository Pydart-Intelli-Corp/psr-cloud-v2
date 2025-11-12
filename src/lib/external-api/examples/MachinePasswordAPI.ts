import { 
  BaseExternalAPI, 
  InputValidator, 
  QueryBuilder, 
  ResponseFormatter,
  type ValidationResult,
  type MachinePasswordInput,
  type MachinePasswordResult
} from '../index';

/**
 * Example implementation of MachinePassword API using the generalized pattern
 */
export class MachinePasswordAPI extends BaseExternalAPI<MachinePasswordInput, MachinePasswordResult> {
  constructor() {
    super({
      endpointName: 'MachinePassword',
      expectedPartCounts: [5], // Exactly 5 parts required
      filterLineEndings: true, // Filter $0D, $0A line endings
      standardErrorMessage: 'Machine password not found.'
    });
  }

  /**
   * Parse InputString into MachinePasswordInput
   * Format: societyId|machineType|version|machineId|passwordType
   */
  parseInput(inputString: string): MachinePasswordInput | null {
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
  async validateInput(input: MachinePasswordInput, dbKey: string): Promise<ValidationResult> {
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

    // Validate Password Type (specific to machine password)
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
      console.log(`⚠️ MachinePassword: ${modelValidation.warning}`);
    }

    return {
      isValid: true,
      parsedSocietyId: societyValidation.id,
      parsedMachineId: machineValidation.numericId
    };
  }

  /**
   * Execute machine password business logic
   */
  async executeBusinessLogic(
    input: MachinePasswordInput, 
    schemaName: string, 
    sequelize: unknown
  ): Promise<MachinePasswordResult> {
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

    // Build and execute query
    const { query, replacements } = QueryBuilder.buildMachinePasswordQuery(
      schemaName,
      societyFilter,
      machineFilter
    );

    console.log(`🔍 MachinePassword: Executing query with replacements:`, replacements);

    const [results] = await seq.query(query, { replacements });
    const machines = results as MachinePasswordResult[];

    console.log(`✅ MachinePassword: Found ${machines.length} machines in schema: ${schemaName}`);

    if (machines.length === 0) {
      throw new Error('No machine found');
    }

    const machine = machines[0];

    // Log machine details (hide passwords)
    console.log(`🔍 MachinePassword: Machine result:`, {
      id: machine.id,
      machine_id: machine.machine_id,
      society_string_id: machine.society_string_id,
      statusU: machine.statusU,
      statusS: machine.statusS,
      user_password: machine.user_password ? '***' : null,
      supervisor_password: machine.supervisor_password ? '***' : null
    });

    // Check password status based on type
    if (passwordValidation.isUser) {
      if (machine.statusU !== 1) {
        console.log(`ℹ️ MachinePassword: User password not set for machine ${input.machineId} (statusU: ${machine.statusU})`);
        throw new Error('User password not available');
      }
    } else if (passwordValidation.isSupervisor) {
      if (machine.statusS !== 1) {
        console.log(`ℹ️ MachinePassword: Supervisor password not set for machine ${input.machineId} (statusS: ${machine.statusS})`);
        throw new Error('Supervisor password not available');
      }
    }

    return machine;
  }

  /**
   * Format password response
   */
  formatResponse(machine: MachinePasswordResult): string {
    // This should be called after validation, so we know the password type from context
    // In a real implementation, you'd pass the password type through the context
    
    // For this example, we'll determine from the machine status
    if (machine.statusU === 1 && machine.user_password) {
      const password = machine.user_password;
      const response = ResponseFormatter.formatMachinePassword(
        { isUser: true, isSupervisor: false },
        password
      );
      
      console.log(`📤 MachinePassword: Returning user password: PU|${password}`);
      return response;
    } else if (machine.statusS === 1 && machine.supervisor_password) {
      const password = machine.supervisor_password;
      const response = ResponseFormatter.formatMachinePassword(
        { isUser: false, isSupervisor: true },
        password
      );
      
      console.log(`📤 MachinePassword: Returning supervisor password: PS|${password}`);
      return response;
    }

    throw new Error('No valid password found');
  }
}

/**
 * Enhanced MachinePassword API that preserves the password type context
 */
export class EnhancedMachinePasswordAPI extends MachinePasswordAPI {
  private passwordTypeContext: { isUser: boolean; isSupervisor: boolean } | null = null;

  async executeBusinessLogic(
    input: MachinePasswordInput, 
    schemaName: string, 
    sequelize: unknown
  ): Promise<MachinePasswordResult> {
    // Store password type context for formatting
    const passwordValidation = InputValidator.validatePasswordType(input.passwordType);
    this.passwordTypeContext = {
      isUser: passwordValidation.isUser,
      isSupervisor: passwordValidation.isSupervisor
    };

    return super.executeBusinessLogic(input, schemaName, sequelize);
  }

  formatResponse(machine: MachinePasswordResult): string {
    if (!this.passwordTypeContext) {
      throw new Error('Password type context not available');
    }

    if (this.passwordTypeContext.isUser) {
      if (machine.statusU !== 1 || !machine.user_password) {
        throw new Error('User password not available');
      }
      
      const response = ResponseFormatter.formatMachinePassword(
        this.passwordTypeContext,
        machine.user_password
      );
      
      console.log(`📤 MachinePassword: Returning user password: ${response}`);
      return response;
    } else if (this.passwordTypeContext.isSupervisor) {
      if (machine.statusS !== 1 || !machine.supervisor_password) {
        throw new Error('Supervisor password not available');
      }
      
      const response = ResponseFormatter.formatMachinePassword(
        this.passwordTypeContext,
        machine.supervisor_password
      );
      
      console.log(`📤 MachinePassword: Returning supervisor password: ${response}`);
      return response;
    }

    throw new Error('Invalid password type context');
  }
}

/**
 * Usage example for the MachinePassword endpoint
 */
export function createMachinePasswordEndpoint() {
  const passwordAPI = new EnhancedMachinePasswordAPI();

  return {
    GET: passwordAPI.handleRequest.bind(passwordAPI),
    POST: passwordAPI.handleRequest.bind(passwordAPI),
    OPTIONS: passwordAPI.handleOptions.bind(passwordAPI)
  };
}