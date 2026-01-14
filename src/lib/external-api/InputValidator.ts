/**
 * Utility class for validating and parsing InputString components
 */
export class InputValidator {
  /**
   * Validate and parse society/BMC ID (handles S- and B- prefix formats)
   */
  static validateSocietyId(societyIdStr: string): { 
    isValid: boolean; 
    id: string; 
    fallback: string; 
    numericId?: number;
    isBmc?: boolean;
    error?: string;
  } {
    if (!societyIdStr || (typeof societyIdStr === 'string' && societyIdStr.trim() === '')) {
      return {
        isValid: false,
        id: societyIdStr,
        fallback: societyIdStr,
        error: 'Society/BMC ID cannot be empty'
      };
    }

    // Check if this is a BMC ID (B- prefix)
    const isBmc = societyIdStr.startsWith('B-');

    // Preserve original format for database lookup
    const id = societyIdStr;
    
    // Extract fallback ID (remove S- or B- prefix if present)
    let fallback = societyIdStr;
    if (societyIdStr.startsWith('S-') || societyIdStr.startsWith('B-')) {
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
      numericId,
      isBmc
    };
  }

  /**
   * Validate and parse machine ID (handles M prefix format with optional letter)
   * 
   * Supports multiple formats:
   * - M00001 -> 1 (numeric)
   * - Mm00001 -> m1 (alphanumeric with letter)
   * - Ma00005 -> a5 (alphanumeric with letter)
   * - M0000df -> df (fully alphanumeric)
   * 
   * @param machineId - Machine ID with M prefix
   * @returns Validation result with parsed IDs and variants
   */
  static validateMachineId(machineId: string): {
    isValid: boolean;
    numericId?: number;
    alphanumericId?: string;
    withoutPrefix?: string;
    strippedId?: string;
    variants?: (string | number)[];
    isNumeric?: boolean;
    error?: string;
  } {
    if (!machineId || machineId.trim() === '') {
      return {
        isValid: false,
        error: 'Machine ID is required but not provided'
      };
    }

    // Validate machine ID format (must start with M)
    if (!machineId.startsWith('M') || machineId.length < 2) {
      return {
        isValid: false,
        error: `Invalid machine ID format: "${machineId}"`
      };
    }

    // Remove first 'M' prefix and extract actual machine ID
    // Format: M + optional_letter + numbers
    // Examples: Mm00001 -> m00001, M00001 -> 00001, Ma00005 -> a00005
    const withoutPrefix = machineId.substring(1);
    
    // Validate that remaining part is alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(withoutPrefix)) {
      return {
        isValid: false,
        error: `Invalid machine ID format: "${machineId}" - contains invalid characters`
      };
    }
    
    let processedId: string;
    let isNumeric = false;
    let numericId: number | undefined;
    let alphanumericId: string | undefined;
    
    // Check if withoutPrefix contains any letters
    const hasLetters = /[a-zA-Z]/.test(withoutPrefix);
    
    if (hasLetters) {
      // Contains letters - treat as alphanumeric
      // Examples: m00001, 000m1, 0000df, abc123
      const strippedId = withoutPrefix.replace(/^0+/, '') || withoutPrefix;
      
      // Check if it starts with a letter after removing zeros
      if (/^[a-zA-Z]/.test(strippedId)) {
        const letter = strippedId.charAt(0).toLowerCase();
        const remainingPart = strippedId.substring(1);
        
        // Check if remaining part is numeric
        if (/^\d+$/.test(remainingPart)) {
          // Letter + numbers: m00001 -> m1, 000m1 -> m1
          const cleanedNumber = remainingPart.replace(/^0+/, '') || '0';
          processedId = letter + cleanedNumber;
          alphanumericId = processedId;
        } else {
          // Mixed alphanumeric: df, abc123
          processedId = strippedId;
          alphanumericId = processedId;
        }
      } else {
        // Starts with number but has letters: should not happen after strip
        processedId = strippedId;
        alphanumericId = processedId;
      }
    } else {
      // No letter, just numbers (e.g., 00001 -> 1)
      processedId = withoutPrefix.replace(/^0+/, '') || '0';
      const parsed = parseInt(processedId);
      
      if (!isNaN(parsed) && parsed > 0) {
        isNumeric = true;
        numericId = parsed;
      } else {
        return {
          isValid: false,
          error: `Invalid machine ID: "${machineId}" - invalid numeric format`
        };
      }
    }

    console.log(`🔄 Machine ID conversion: "${machineId}" -> "${withoutPrefix}" -> "${processedId}"`);

    // Create variants for flexible database matching
    const variants: (string | number)[] = [];
    
    if (isNumeric && numericId) {
      // Numeric ID variants
      variants.push(numericId);           // Numeric: 1
      variants.push(machineId);           // Original: M00001
      variants.push(withoutPrefix);       // Without M: 00001
      variants.push(processedId);         // Stripped: 1
      variants.push(String(numericId));   // String numeric: "1"
    } else if (alphanumericId) {
      // Alphanumeric ID variants
      variants.push(alphanumericId);      // Processed: m1, df
      variants.push(withoutPrefix);       // Without M: m00001, 0000df
      
      // Add stripped version if different
      const strippedVersion = withoutPrefix.replace(/^0+/, '');
      if (strippedVersion && strippedVersion !== alphanumericId && strippedVersion !== withoutPrefix) {
        variants.push(strippedVersion);
      }
    }

    return {
      isValid: true,
      numericId,
      alphanumericId,
      withoutPrefix,
      strippedId: processedId,
      variants,
      isNumeric
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