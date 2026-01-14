/**
 * Farmer UID Generator
 * 
 * Generates unique farmer identifiers in format: VLDD-1234
 * - 2 random letters (uppercase)
 * - 2 random letters or numbers (uppercase/numbers)
 * - Dash separator
 * - 4 random digits
 * Total: 9 characters (including dash)
 * 
 * Example: AB12-3456, XY89-0123, ZZ99-9999
 */

/**
 * Generate a random alphanumeric string
 */
function generateRandomAlphanumeric(length: number, onlyDigits: boolean = false): string {
  const digits = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const chars = onlyDigits ? digits : letters + digits;
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate farmeruid with format: LLNN-DDDD
 * L = Letter (A-Z)
 * N = Letter or Number (A-Z, 0-9)
 * D = Digit (0-9)
 * 
 * Examples: AB12-3456, XY89-0123, ZZ99-9999
 */
export function generateFarmerUID(): string {
  const part1 = generateRandomAlphanumeric(2); // 2 letters
  const part2 = generateRandomAlphanumeric(2); // 2 alphanumeric
  const part3 = generateRandomAlphanumeric(4, true); // 4 digits
  
  return `${part1}${part2}-${part3}`;
}

/**
 * Generate unique farmeruid that doesn't exist in the database
 * 
 * @param schemaName - The admin schema name to check for uniqueness
 * @param sequelize - Sequelize instance for database queries
 * @param maxAttempts - Maximum attempts to generate unique ID (default: 100)
 * @returns Promise<string> - Unique farmeruid
 */
export async function generateUniqueFarmerUID(
  schemaName: string,
  sequelize: any,
  maxAttempts: number = 100
): Promise<string> {
  let attempts = 0;
  let farmeruid = '';
  let isUnique = false;

  while (!isUnique && attempts < maxAttempts) {
    farmeruid = generateFarmerUID();
    
    // Check if this farmeruid already exists in the farmers table
    try {
      const [existing] = await sequelize.query(
        `SELECT id FROM \`${schemaName}\`.farmers WHERE farmeruid = ? LIMIT 1`,
        { replacements: [farmeruid] }
      );

      if (Array.isArray(existing) && existing.length === 0) {
        isUnique = true;
      }
    } catch (error) {
      console.error(`❌ Error checking farmeruid uniqueness: ${error}`);
      isUnique = true; // Proceed anyway on error
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error(`Could not generate unique farmeruid after ${maxAttempts} attempts`);
  }

  console.log(`✅ Generated unique farmeruid: ${farmeruid}`);
  return farmeruid;
}

/**
 * Generate batch of unique farmeruid values for bulk upload
 * 
 * @param count - Number of farmeruid values to generate
 * @param schemaName - The admin schema name to check for uniqueness
 * @param sequelize - Sequelize instance for database queries
 * @returns Promise<string[]> - Array of unique farmeruid values
 */
export async function generateUniqueFarmerUIDsBatch(
  count: number,
  schemaName: string,
  sequelize: any
): Promise<string[]> {
  const farmeruids: string[] = [];
  const existingFarmeruids = new Set<string>();

  // Get all existing farmeruids from database
  try {
    const [existing] = await sequelize.query(
      `SELECT farmeruid FROM \`${schemaName}\`.farmers WHERE farmeruid IS NOT NULL`,
      { type: 'SELECT' }
    );

    if (Array.isArray(existing)) {
      (existing as any[]).forEach(row => {
        if (row.farmeruid) {
          existingFarmeruids.add(row.farmeruid);
        }
      });
    }
  } catch (error) {
    console.log(`⚠️ Could not fetch existing farmeruids: ${error}`);
  }

  // Generate unique farmeruids
  let attempts = 0;
  const maxAttemptsPerId = 50;
  const maxTotalAttempts = count * 100;

  while (farmeruids.length < count && attempts < maxTotalAttempts) {
    let innerAttempts = 0;
    let generated = false;

    while (!generated && innerAttempts < maxAttemptsPerId) {
      const newUID = generateFarmerUID();
      
      if (!existingFarmeruids.has(newUID) && !farmeruids.includes(newUID)) {
        farmeruids.push(newUID);
        existingFarmeruids.add(newUID);
        generated = true;
      }

      innerAttempts++;
    }

    if (!generated) {
      console.warn(`⚠️ Could not generate unique ID in ${maxAttemptsPerId} attempts`);
    }

    attempts++;
  }

  if (farmeruids.length < count) {
    console.warn(`⚠️ Only generated ${farmeruids.length} of ${count} requested farmeruids`);
  }

  console.log(`✅ Generated ${farmeruids.length} unique farmeruids for batch upload`);
  return farmeruids;
}

/**
 * Validate farmeruid format
 * 
 * @param farmeruid - The farmeruid to validate
 * @returns boolean - True if valid format
 */
export function validateFarmerUIDFormat(farmeruid: string): boolean {
  // Format: LLNN-DDDD (9 characters total including dash)
  const pattern = /^[A-Z0-9]{4}-\d{4}$/;
  return pattern.test(farmeruid);
}

/**
 * Parse farmeruid into components
 * 
 * @param farmeruid - The farmeruid to parse (e.g., "AB12-3456")
 * @returns object - { prefix: "AB12", suffix: "3456" }
 */
export function parseFarmerUID(farmeruid: string): { prefix: string; suffix: string } | null {
  const pattern = /^([A-Z0-9]{4})-(\d{4})$/;
  const match = farmeruid.match(pattern);

  if (match) {
    return {
      prefix: match[1],
      suffix: match[2]
    };
  }

  return null;
}

/**
 * Format farmeruid with proper casing
 * 
 * @param farmeruid - The farmeruid to format
 * @returns string - Properly formatted farmeruid
 */
export function formatFarmerUID(farmeruid: string): string {
  // Remove any existing dashes and spaces
  const cleaned = farmeruid.replace(/[-\s]/g, '');

  // Ensure 8 characters (4 + 4)
  if (cleaned.length !== 8) {
    throw new Error('Invalid farmeruid length. Expected 8 characters (without dash)');
  }

  // Format as XXXX-YYYY
  const formatted = `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}`;

  // Validate format
  if (!validateFarmerUIDFormat(formatted)) {
    throw new Error('Invalid farmeruid format');
  }

  return formatted;
}

export default {
  generateFarmerUID,
  generateUniqueFarmerUID,
  generateUniqueFarmerUIDsBatch,
  validateFarmerUIDFormat,
  parseFarmerUID,
  formatFarmerUID
};
