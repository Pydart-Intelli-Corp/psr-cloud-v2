/**
 * Utility class for validating and parsing InputString components
 */
export class InputValidator {
  /**
   * Validate and parse society ID (handles S- prefix format)
   */
  static validateSocietyId(societyIdStr: string): { 
    isValid: boolean; 
    id: string; 
    fallback: string; 
    numericId?: number;
    error?: string;
  } {
    if (!societyIdStr || (typeof societyIdStr === 'string' && societyIdStr.trim() === '')) {
      return {
        isValid: false,
        id: societyIdStr,
        fallback: societyIdStr,
        error: 'Society ID cannot be empty'
      };
    }

    // Preserve original format for database lookup
    const id = societyIdStr;
    
    // Extract fallback ID (remove S- prefix if present)
    let fallback = societyIdStr;
    if (societyIdStr.startsWith('S-')) {
      fallback = societyIdStr.substring(2);
    }

    // Try to parse numeric ID for fallback matching
    let numericId: number | undefined;
    const numericPart = parseInt(fallback);
    if (!isNaN(numericPart)) {
      numericId = numericPart;
    }

    return {
      isValid: true,
      id,
      fallback,
      numericId
    };
  }

  /**
   * Validate and parse machine ID (handles M prefix format)
   */
  static validateMachineId(machineId: string): {
    isValid: boolean;
    numericId?: number;
    withoutPrefix?: string;
    strippedId?: string;
    error?: string;
  } {
    if (!machineId || machineId.trim() === '') {
      return {
        isValid: false,
        error: 'Machine ID is required but not provided'
      };
    }

    // Validate machine ID format (must start with M followed by digits)
    if (!machineId.startsWith('M') || machineId.length < 2) {
      return {
        isValid: false,
        error: `Invalid machine ID format: "${machineId}"`
      };
    }

    // Remove 'M' prefix
    const withoutPrefix = machineId.substring(1);
    
    // Extract numeric part and remove leading zeros
    const machineNumericMatch = withoutPrefix.match(/\d+/);
    let numericId: number;
    
    if (machineNumericMatch) {
      numericId = parseInt(machineNumericMatch[0]);
    } else {
      // Fallback to original parsing if no numeric match
      numericId = parseInt(withoutPrefix);
    }
    
    if (isNaN(numericId) || numericId <= 0) {
      return {
        isValid: false,
        error: `Invalid machine ID: "${machineId}" - must be a positive number`
      };
    }

    const strippedId = numericId.toString();

    return {
      isValid: true,
      numericId,
      withoutPrefix,
      strippedId
    };
  }

  /**
   * Validate DB Key format
   */
  static validateDbKey(dbKey: string): { isValid: boolean; error?: string } {
    if (!dbKey || dbKey.trim() === '') {
      return {
        isValid: false,
        error: 'DB Key is required'
      };
    }

    // Add additional DB key format validation if needed
    if (dbKey.length < 2) {
      return {
        isValid: false,
        error: 'DB Key must be at least 2 characters'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate machine model/type (basic validation)
   */
  static validateMachineModel(machineModel: string): { 
    isValid: boolean; 
    warning?: string; 
  } {
    if (!machineModel || machineModel.trim() === '') {
      return {
        isValid: true, // Not blocking for now
        warning: `Machine model is empty: "${machineModel}"`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate password type for machine password endpoints
   */
  static validatePasswordType(passwordType: string): {
    isValid: boolean;
    isUser: boolean;
    isSupervisor: boolean;
    error?: string;
  } {
    if (!passwordType) {
      return {
        isValid: false,
        isUser: false,
        isSupervisor: false,
        error: 'Password type is required'
      };
    }

    // Accept both full formats (U$0D, S$0D) and short formats (U, S)
    const isUser = passwordType.startsWith('U');
    const isSupervisor = passwordType.startsWith('S');

    if (!isUser && !isSupervisor) {
      return {
        isValid: false,
        isUser: false,
        isSupervisor: false,
        error: `Invalid password type: "${passwordType}"`
      };
    }

    return {
      isValid: true,
      isUser,
      isSupervisor
    };
  }
}