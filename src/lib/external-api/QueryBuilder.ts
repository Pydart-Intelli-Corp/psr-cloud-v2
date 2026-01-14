/**
 * Utility class for building database queries for external APIs
 */
export class QueryBuilder {
  /**
   * Build society filter conditions for WHERE clause
   */
  static buildSocietyFilter(
    societyId: string, 
    fallbackId: string, 
    numericId?: number
  ): {
    condition: string;
    replacements: (string | number)[];
  } {
    // Support multiple society ID formats:
    // 1. String matching (s.society_id = 'S-s12')
    // 2. Fallback string matching (s.society_id = 's12') 
    // 3. Numeric matching (m.society_id = 12)
    
    const condition = '(s.society_id = ? OR s.society_id = ? OR m.society_id = ?)';
    const societyIdNumeric = numericId || fallbackId;
    
    return {
      condition,
      replacements: [societyId, fallbackId, societyIdNumeric]
    };
  }

  /**
   * Build machine filter conditions for WHERE clause
   * Supports both numeric and alphanumeric machine IDs
   * 
   * @param machineValidation - Result from InputValidator.validateMachineId()
   * @param useNumericId - Whether to use numeric ID (m.id) or string ID (m.machine_id)
   */
  static buildMachineFilter(
    machineValidation: {
      numericId?: number;
      alphanumericId?: string;
      variants?: (string | number)[];
      isNumeric?: boolean;
    },
    useNumericId: boolean = true
  ): {
    condition: string;
    replacements: (string | number)[];
  } {
    // For numeric machine IDs (backward compatibility)
    if (machineValidation.isNumeric && machineValidation.numericId && useNumericId) {
      // Direct numeric ID matching: m.id = 1
      return {
        condition: 'm.id = ?',
        replacements: [machineValidation.numericId]
      };
    }
    
    // For alphanumeric machine IDs or string-based matching
    if (machineValidation.variants && machineValidation.variants.length > 0) {
      // Use IN clause with all variants
      const placeholders = machineValidation.variants.map(() => '?').join(', ');
      
      return {
        condition: `m.machine_id IN (${placeholders})`,
        replacements: machineValidation.variants
      };
    }

    // Fallback to direct alphanumeric matching
    if (machineValidation.alphanumericId) {
      return {
        condition: 'm.machine_id = ?',
        replacements: [machineValidation.alphanumericId]
      };
    }

    // Final fallback - should not reach here if validation passed
    throw new Error('Invalid machine validation result for query building');
  }

  /**
   * Build base query with schema, table, and joins
   */
  static buildBaseQuery(schemaName: string, tableName: string): string {
    const escapedSchema = QueryBuilder.escapeIdentifier(schemaName);
    
    if (tableName === 'farmers') {
      return `
        FROM ${escapedSchema}.farmers f
        LEFT JOIN ${escapedSchema}.societies s ON f.society_id = s.id
        LEFT JOIN ${escapedSchema}.machines m ON f.machine_id = m.id
      `;
    } else if (tableName === 'machines') {
      return `
        FROM ${escapedSchema}.machines m
        LEFT JOIN ${escapedSchema}.societies s ON m.society_id = s.id
        LEFT JOIN ${escapedSchema}.bmcs b ON m.bmc_id = b.id
      `;
    } else {
      throw new Error(`Unsupported table name: ${tableName}`);
    }
  }

  /**
   * Build complete SELECT query for farmer info
   */
  static buildFarmerQuery(
    schemaName: string,
    societyFilter: ReturnType<typeof QueryBuilder.buildSocietyFilter>,
    machineFilter: ReturnType<typeof QueryBuilder.buildMachineFilter>,
    pagination?: { limit: number; offset: number }
  ): {
    query: string;
    replacements: (string | number)[];
  } {
    const baseQuery = QueryBuilder.buildBaseQuery(schemaName, 'farmers');
    
    let query = `
      SELECT 
        f.id, 
        f.farmer_id,
        f.rf_id, 
        f.name, 
        f.phone, 
        f.sms_enabled, 
        f.bonus
      ${baseQuery}
      WHERE ${societyFilter.condition}
        AND f.status = 'active'
        AND ${machineFilter.condition}
      ORDER BY f.farmer_id
    `;

    let replacements = [
      ...societyFilter.replacements,
      ...machineFilter.replacements
    ];

    if (pagination) {
      query += ' LIMIT ? OFFSET ?';
      replacements = [...replacements, pagination.limit, pagination.offset];
    }

    return { query, replacements };
  }

  /**
   * Build complete SELECT query for machine password
   */
  static buildMachinePasswordQuery(
    schemaName: string,
    societyFilter: ReturnType<typeof QueryBuilder.buildSocietyFilter>,
    machineFilter: ReturnType<typeof QueryBuilder.buildMachineFilter>
  ): {
    query: string;
    replacements: (string | number)[];
  } {
    const baseQuery = QueryBuilder.buildBaseQuery(schemaName, 'machines');
    
    const query = `
      SELECT 
        m.id, 
        m.machine_id, 
        m.user_password, 
        m.supervisor_password, 
        m.statusU, 
        m.statusS,
        s.society_id as society_string_id
      ${baseQuery}
      WHERE (${societyFilter.condition} OR m.bmc_id IS NOT NULL)
        AND ${machineFilter.condition}
        AND m.status = 'active'
    `;

    const replacements = [
      ...societyFilter.replacements,
      ...machineFilter.replacements
    ];

    return { query, replacements };
  }

  /**
   * Build society lookup query to get database ID from society_id string
   */
  static buildSocietyLookupQuery(
    schemaName: string,
    societyIdStr: string
  ): {
    query: string;
    replacements: string[];
  } {
    const escapedSchema = QueryBuilder.escapeIdentifier(schemaName);
    
    // Try both with and without S- prefix
    const lookupParams = societyIdStr.startsWith('S-') 
      ? [societyIdStr, societyIdStr.substring(2)]
      : [`S-${societyIdStr}`, societyIdStr];
    
    const query = `
      SELECT id FROM ${escapedSchema}.societies 
      WHERE society_id = ? OR society_id = ?
      LIMIT 1
    `;

    return {
      query,
      replacements: lookupParams
    };
  }

  /**
   * Build BMC lookup query to get database ID from bmc_id string
   */
  static buildBmcLookupQuery(
    schemaName: string,
    bmcIdStr: string
  ): {
    query: string;
    replacements: string[];
  } {
    const escapedSchema = QueryBuilder.escapeIdentifier(schemaName);
    
    // Try both with and without B- prefix
    const lookupParams = bmcIdStr.startsWith('B-') 
      ? [bmcIdStr, bmcIdStr.substring(2)]
      : [`B-${bmcIdStr}`, bmcIdStr];
    
    const query = `
      SELECT id FROM ${escapedSchema}.bmcs 
      WHERE bmc_id = ? OR bmc_id = ?
      LIMIT 1
    `;

    return {
      query,
      replacements: lookupParams
    };
  }

  /**
   * Safely escape database identifiers (schema/table names)
   */
  static escapeIdentifier(identifier: string): string {
    // Remove any non-alphanumeric characters except underscores
    const cleaned = identifier.replace(/[^a-zA-Z0-9_]/g, '');
    return `\`${cleaned}\``;
  }

  /**
   * Build pagination parameters
   */
  static buildPagination(pageNumber: number, pageSize: number = 5): {
    limit: number;
    offset: number;
    pageNumber: number;
  } {
    const normalizedPageNumber = Math.max(1, pageNumber);
    const offset = (normalizedPageNumber - 1) * pageSize;
    
    return {
      limit: pageSize,
      offset,
      pageNumber: normalizedPageNumber
    };
  }

  /**
   * Extract page number from C parameter format (C00001 = page 1, C00002 = page 2)
   */
  static parsePageNumber(lengthParam: string): number {
    if (!lengthParam || !lengthParam.startsWith('C')) {
      return 1;
    }
    
    const pageNumber = parseInt(lengthParam.replace(/^C0*/, '')) || 1;
    return Math.max(1, pageNumber);
  }
}