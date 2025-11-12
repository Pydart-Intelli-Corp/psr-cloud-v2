import { 
  BaseExternalAPI, 
  InputValidator, 
  QueryBuilder, 
  ResponseFormatter,
  type ValidationResult,
  type FarmerInfoInput,
  type FarmerResult
} from '../index';

/**
 * Example implementation of FarmerInfo API using the generalized pattern
 */
export class FarmerInfoAPI extends BaseExternalAPI<FarmerInfoInput, FarmerResult[]> {
  constructor() {
    super({
      endpointName: 'FarmerInfo',
      expectedPartCounts: [4, 5], // 4 parts for CSV, 5 parts for pagination
      filterLineEndings: false,
      standardErrorMessage: 'Farmer info not found.'
    });
  }

  /**
   * Parse InputString into FarmerInfoInput
   * Format: societyId|machineType|version|machineId|pageNumber (optional)
   */
  parseInput(inputString: string): FarmerInfoInput | null {
    const parts = inputString.split('|');
    
    if (parts.length !== 4 && parts.length !== 5) {
      return null;
    }

    const [societyId, machineType, version, machineId, pageNumber] = parts;

    return {
      societyId,
      machineType,
      version,
      machineId,
      pageNumber
    };
  }

  /**
   * Validate parsed input
   */
  async validateInput(input: FarmerInfoInput, dbKey: string): Promise<ValidationResult> {
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

    // Validate Machine Model (warning only)
    const modelValidation = InputValidator.validateMachineModel(input.version);
    if (modelValidation.warning) {
      console.log(`⚠️ FarmerInfo: ${modelValidation.warning}`);
    }

    return {
      isValid: true,
      parsedSocietyId: societyValidation.id,
      parsedMachineId: machineValidation.numericId
    };
  }

  /**
   * Execute farmer info business logic
   */
  async executeBusinessLogic(
    input: FarmerInfoInput, 
    schemaName: string, 
    sequelize: unknown
  ): Promise<FarmerResult[]> {
    // Cast sequelize to the type we need
    const seq = sequelize as { query: (query: string, options: { replacements: (string | number)[] }) => Promise<[unknown[], unknown]> };

    // Parse society and machine info
    const societyValidation = InputValidator.validateSocietyId(input.societyId);
    const machineValidation = InputValidator.validateMachineId(input.machineId);

    if (!societyValidation.isValid || !machineValidation.isValid) {
      throw new Error('Invalid input validation');
    }

    // Build query filters
    const societyFilter = QueryBuilder.buildSocietyFilter(
      societyValidation.id,
      societyValidation.fallback,
      societyValidation.numericId
    );

    const machineFilter = QueryBuilder.buildMachineFilter(machineValidation);

    // Handle pagination
    let pagination: { limit: number; offset: number } | undefined;
    if (input.pageNumber) {
      const pageNumber = QueryBuilder.parsePageNumber(input.pageNumber);
      pagination = QueryBuilder.buildPagination(pageNumber, 5);
    }

    // Build and execute query
    const { query, replacements } = QueryBuilder.buildFarmerQuery(
      schemaName,
      societyFilter,
      machineFilter,
      pagination
    );

    console.log(`🔍 FarmerInfo: Executing query with replacements:`, replacements);

    const [results] = await seq.query(query, { replacements });
    const farmers = results as FarmerResult[];

    console.log(`✅ FarmerInfo: Found ${farmers.length} farmers in schema: ${schemaName}${pagination ? ` (Page ${pagination.offset / 5 + 1})` : ' (CSV Download)'}`);

    return farmers;
  }

  /**
   * Format response based on request type (CSV or pagination)
   */
  formatResponse(farmers: FarmerResult[]): string {
    if (farmers.length === 0) {
      return 'Farmer info not found.';
    }

    // Determine response format based on whether we have pagination
    // This is a simplified check - in practice you'd pass this info through the input
    const isCSVDownload = true; // You'd determine this from the input parsing

    if (isCSVDownload) {
      const csvData = ResponseFormatter.formatFarmerCSV(farmers);
      ResponseFormatter.logCSVResponse('FarmerInfo', farmers.length, csvData.length);
      return csvData;
    } else {
      const paginationData = ResponseFormatter.formatFarmerPagination(farmers);
      ResponseFormatter.logResponse('FarmerInfo', 'farmer data', farmers.length, paginationData);
      return paginationData;
    }
  }
}

/**
 * Usage example for the FarmerInfo endpoint
 */
export function createFarmerInfoEndpoint() {
  const farmerAPI = new FarmerInfoAPI();

  return {
    GET: farmerAPI.handleRequest.bind(farmerAPI),
    POST: farmerAPI.handleRequest.bind(farmerAPI),
    OPTIONS: farmerAPI.handleOptions.bind(farmerAPI)
  };
}