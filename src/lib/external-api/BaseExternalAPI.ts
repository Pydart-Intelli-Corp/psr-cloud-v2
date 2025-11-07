import { NextRequest } from 'next/server';

/**
 * Base input structure for all external API endpoints
 */
export interface BaseInputParts {
  societyId: string;
  machineType: string;
  version: string;
  machineId: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  parsedSocietyId?: string;
  parsedMachineId?: number;
}

/**
 * Configuration interface for external API endpoints
 */
export interface ExternalAPIConfig {
  endpointName: string;
  requiresExactPartCount?: boolean;
  expectedPartCounts: number[];
  filterLineEndings: boolean;
  standardErrorMessage: string;
}

/**
 * Abstract base class for external API endpoints following InputString pattern
 */
export abstract class BaseExternalAPI<TInput extends BaseInputParts, TResult> {
  protected config: ExternalAPIConfig;

  constructor(config: ExternalAPIConfig) {
    this.config = config;
  }

  /**
   * Parse InputString into typed input structure
   */
  abstract parseInput(inputString: string): TInput | null;

  /**
   * Validate parsed input parts
   */
  abstract validateInput(input: TInput, dbKey: string): Promise<ValidationResult>;

  /**
   * Execute the main business logic
   */
  abstract executeBusinessLogic(input: TInput, schemaName: string, sequelize: unknown): Promise<TResult>;

  /**
   * Format the result into response string
   */
  abstract formatResponse(result: TResult): string;

  /**
   * Get error message for this endpoint
   */
  getErrorMessage(): string {
    return this.config.standardErrorMessage;
  }

  /**
   * Main request handler - implements common flow
   */
  async handleRequest(
    request: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
  ): Promise<Response> {
    try {
      // Step 1: Extract InputString from GET/POST
      let inputString = await this.extractInputString(request);
      
      // Step 2: Resolve dynamic params
      const resolvedParams = await params;
      const dbKey = resolvedParams['db-key'] || resolvedParams.dbKey || resolvedParams['dbkey'];

      this.logRequest(request, dbKey, inputString);

      // Step 3: Filter line endings if configured
      if (this.config.filterLineEndings && inputString) {
        inputString = this.filterLineEndings(inputString);
      }

      // Step 4: Basic validation
      if (!this.validateBasicInputs(dbKey, inputString)) {
        return this.errorResponse();
      }

      // Step 5: Parse InputString
      const parsedInput = this.parseInput(inputString!);
      if (!parsedInput) {
        console.log(`❌ ${this.config.endpointName}: Failed to parse InputString: "${inputString}"`);
        return this.errorResponse();
      }

      // Step 6: Connect to database and validate
      const { sequelize, schemaName } = await this.connectAndValidate(dbKey);
      if (!sequelize || !schemaName) {
        return this.errorResponse();
      }

      // Step 7: Validate parsed input
      const validation = await this.validateInput(parsedInput, dbKey);
      if (!validation.isValid) {
        console.log(`❌ ${this.config.endpointName}: Input validation failed: ${validation.error}`);
        return this.errorResponse();
      }

      // Step 8: Execute business logic
      const result = await this.executeBusinessLogic(parsedInput, schemaName, sequelize);

      // Step 9: Format and return response
      const formattedResponse = this.formatResponse(result);
      return this.successResponse(formattedResponse);

    } catch (error) {
      console.error(`❌ Error in ${this.config.endpointName} API:`, error);
      return this.errorResponse();
    }
  }

  /**
   * Extract InputString from request (GET query param or POST body)
   */
  private async extractInputString(request: NextRequest): Promise<string | null> {
    let inputString: string | null = null;
    
    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url);
      inputString = searchParams.get('InputString');
    } else if (request.method === 'POST') {
      try {
        const body = await request.json();
        inputString = body.InputString || null;
      } catch (error) {
        try {
          const formData = await request.formData();
          inputString = formData.get('InputString') as string || null;
        } catch {
          console.log(`❌ Failed to parse POST body:`, error);
        }
      }
    }
    
    return inputString;
  }

  /**
   * Filter line ending characters from InputString
   */
  private filterLineEndings(inputString: string): string {
    const originalInputString = inputString;
    
    // Remove common line ending patterns: $0D (CR), $0A (LF), $0D$0A (CRLF)
    const filtered = inputString
      .replace(/\$0D\$0A/g, '')  // Remove $0D$0A (CRLF)
      .replace(/\$0D/g, '')      // Remove $0D (CR) 
      .replace(/\$0A/g, '')      // Remove $0A (LF)
      .replace(/\r\n/g, '')      // Remove actual CRLF characters
      .replace(/\r/g, '')        // Remove actual CR characters
      .replace(/\n/g, '');       // Remove actual LF characters
    
    if (originalInputString !== filtered) {
      console.log(`🧹 ${this.config.endpointName}: Filtered line endings: "${originalInputString}" -> "${filtered}"`);
    }
    
    return filtered;
  }

  /**
   * Basic input validation
   */
  private validateBasicInputs(dbKey: string, inputString: string | null): boolean {
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ ${this.config.endpointName}: DB Key validation failed - dbKey: "${dbKey}"`);
      return false;
    }

    if (!inputString) {
      console.log(`❌ ${this.config.endpointName}: InputString is required`);
      return false;
    }

    // Validate InputString part count
    const parts = inputString.split('|');
    if (!this.config.expectedPartCounts.includes(parts.length)) {
      console.log(`❌ ${this.config.endpointName}: Invalid InputString part count. Expected: ${this.config.expectedPartCounts.join(' or ')}, Got: ${parts.length}`);
      return false;
    }

    return true;
  }

  /**
   * Connect to database and get admin schema
   */
  private async connectAndValidate(dbKey: string): Promise<{ sequelize: unknown, schemaName: string | null }> {
    try {
      const { connectDB } = await import('@/lib/database');
      await connectDB();
      
      const { getModels } = await import('@/models');
      const { sequelize, User } = getModels();

      // Find admin by dbKey to get schema name
      const admin = await User.findOne({ 
        where: { dbKey: dbKey.toUpperCase() } 
      });

      if (!admin || !admin.dbKey) {
        console.log(`❌ ${this.config.endpointName}: Admin not found or missing DB Key for: ${dbKey}`);
        return { sequelize: null, schemaName: null };
      }

      // Generate admin-specific schema name
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`✅ ${this.config.endpointName}: Using schema: ${schemaName}`);
      
      return { sequelize, schemaName };
    } catch (error) {
      console.error(`❌ ${this.config.endpointName}: Database connection failed:`, error);
      return { sequelize: null, schemaName: null };
    }
  }

  /**
   * Log request details
   */
  private logRequest(request: NextRequest, dbKey: string, inputString: string | null): void {
    console.log(`🔍 ${this.config.endpointName} External API Request - Full URL: ${request.url}`);
    console.log(`🔍 DB Key: "${dbKey}", InputString: "${inputString}"`);
    console.log(`🔍 DB Key type: ${typeof dbKey}, length: ${dbKey?.length}`);
  }

  /**
   * Create success response
   */
  protected successResponse(data: string, additionalHeaders?: Record<string, string>): Response {
    return new Response(`"${data}"`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...additionalHeaders
      }
    });
  }

  /**
   * Create error response
   */
  protected errorResponse(): Response {
    return new Response(`"${this.getErrorMessage()}"`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  /**
   * Handle OPTIONS request for CORS
   */
  async handleOptions(): Promise<Response> {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}