import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';

interface MachinePasswordResult {
  id: number;
  machine_id: string;
  user_password: string | null;
  supervisor_password: string | null;
  statusU: number;
  statusS: number;
  society_string_id?: string;
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    let inputString: string | null = null;
    
    // Handle both GET and POST requests
    if (request.method === 'GET') {
      // Extract from query parameters for GET requests
      const { searchParams } = new URL(request.url);
      inputString = searchParams.get('InputString');
    } else if (request.method === 'POST') {
      // Extract from request body for POST requests
      try {
        const body = await request.json();
        inputString = body.InputString || null;
      } catch (error) {
        // If JSON parsing fails, try form data
        try {
          const formData = await request.formData();
          inputString = formData.get('InputString') as string || null;
        } catch {
          console.log(`❌ Failed to parse POST body:`, error);
        }
      }
    }
    
    // Await the params Promise in Next.js 15
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'] || resolvedParams.dbKey || resolvedParams['dbkey'];

    console.log(`🔍 External Machine Password API Request - Full URL: ${request.url}`);
    console.log(`🔍 Resolved Params:`, resolvedParams);
    console.log(`🔍 DB Key: "${dbKey}", InputString: "${inputString}"`);
    console.log(`🔍 DB Key type: ${typeof dbKey}, length: ${dbKey?.length}`);

    // Filter out line ending characters from InputString if present
    if (inputString) {
      const originalInputString = inputString;
      // Remove common line ending patterns: $0D (CR), $0A (LF), $0D$0A (CRLF)
      inputString = inputString
        .replace(/\$0D\$0A/g, '')  // Remove $0D$0A (CRLF)
        .replace(/\$0D/g, '')      // Remove $0D (CR) 
        .replace(/\$0A/g, '')      // Remove $0A (LF)
        .replace(/\r\n/g, '')      // Remove actual CRLF characters
        .replace(/\r/g, '')        // Remove actual CR characters
        .replace(/\n/g, '');       // Remove actual LF characters
      
      if (originalInputString !== inputString) {
        console.log(`🧹 Filtered line endings from InputString: "${originalInputString}" -> "${inputString}"`);
      }
    }

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return new Response('"Machine password not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    if (!inputString) {
      return new Response('"Machine password not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // PRIORITY 1: Connect to database and validate DB Key first
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Find admin by dbKey to get schema name
    const admin = await User.findOne({ 
      where: { dbKey: dbKey.toUpperCase() } 
    });

    if (!admin || !admin.dbKey) {
      console.log(`❌ Admin not found or missing DB Key for: ${dbKey}`);
      return new Response('"Machine password not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Parse input string format: 333|ECOD|LE3.34|M00001|U$0D or 333|ECOD|LE3.34|M00001|S$0D
    const inputParts = inputString.split('|');
    
    // Check if it's the correct format (5 parts)
    if (inputParts.length !== 5) {
      return new Response('"Machine password not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const [societyIdStr, machineType, machineModel, machineId, passwordType] = inputParts;
    
    console.log(`🔍 Parsed InputString parts:`, { societyIdStr, machineType, machineModel, machineId, passwordType });
    
    // PRIORITY 2: Validate Society ID (preserve original format for database lookup)
    const societyId = societyIdStr;
    
    // Also try extracting just the ID part for fallback numeric matching
    let societyIdFallback = societyIdStr;
    if (societyIdStr.startsWith('S-')) {
      societyIdFallback = societyIdStr.substring(2);
    }
    
    // Validate that society ID is not empty
    if (!societyId || (typeof societyId === 'string' && societyId.trim() === '')) {
      console.log(`❌ Invalid society ID: "${societyIdStr}" - empty or invalid`);
      return new Response('"Failed to get password. Invalid token."', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    console.log(`✅ Parsed society ID: "${societyIdStr}" -> primary: "${societyId}", fallback: "${societyIdFallback}"`);

    // PRIORITY 3: Validate Machine ID
    let parsedMachineId: number | null = null;
    let machineIdVariants: (string | number)[] = [];
    
    if (machineId && machineId.trim()) {
      let machineIdStr = machineId;
      
      // Validate machine ID format (must start with M)
      if (!machineIdStr.startsWith('M') || machineIdStr.length < 2) {
        console.log(`❌ Invalid machine ID format: "${machineId}"`);
        return new Response('"Failed to get password. Invalid machine details."', { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Remove 'M' prefix
      machineIdStr = machineIdStr.substring(1);
      
      // Validate that remaining part is alphanumeric
      if (!/^[a-zA-Z0-9]+$/.test(machineIdStr)) {
        console.log(`❌ Invalid machine ID format: "${machineId}" - contains invalid characters`);
        return new Response('"Machine password not found."', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Try to parse as number for numeric IDs
      const machineIdNum = parseInt(machineIdStr);
      if (!isNaN(machineIdNum) && machineIdNum > 0) {
        // Numeric machine ID
        parsedMachineId = machineIdNum;
        // Add both numeric and string variants
        machineIdVariants = [machineIdNum, machineId, machineIdStr, String(machineIdNum)];
      } else {
        // Alphanumeric machine ID
        parsedMachineId = null;
        machineIdVariants = [machineIdStr, machineId];
        // Add trimmed version without leading zeros
        const trimmedMachineId = machineIdStr.replace(/^0+/, '');
        if (trimmedMachineId && trimmedMachineId !== machineIdStr) {
          machineIdVariants.push(trimmedMachineId);
        }
      }
    } else {
      // Machine ID is required
      console.log(`❌ Machine ID is required but not provided`);
      return new Response('"Machine password not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    console.log(`🔍 Machine ID parsing: "${machineId}" -> Variants: ${JSON.stringify(machineIdVariants)}`);

    // PRIORITY 4: Validate Password Type (accept both full and short formats)
    if (!passwordType || (!passwordType.startsWith('U') && !passwordType.startsWith('S'))) {
      console.log(`❌ Invalid password type: "${passwordType}"`);
      return new Response('"Machine password not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Accept both full formats (U$0D, S$0D) and short formats (U, S)
    const isUserPassword = passwordType.startsWith('U');
    const isSupervisorPassword = passwordType.startsWith('S');
    
    console.log(`🔍 Password type: ${isUserPassword ? 'User' : 'Supervisor'} (${passwordType})`);

    // PRIORITY 5: Validate Machine Model (if needed for future validations)
    if (!machineModel || machineModel.trim() === '') {
      console.log(`⚠️ Machine model is empty: "${machineModel}"`);
      // Currently not blocking execution for machine model, but logging for future use
    }
    
    console.log(`🔍 Machine model: "${machineModel}"`);

    // Generate admin-specific schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`🔍 Using schema: ${schemaName} for society: ${societyId}, machine: ${machineId}`);

    // Build query to fetch machine password - join with societies table for string society_id matching
    let query: string;
    let replacements: (string | number)[];

    // Try to parse fallback as number for numeric society ID matching
    const numericSocietyId = parseInt(societyIdFallback);
    const societyIdNumeric = !isNaN(numericSocietyId) ? numericSocietyId : societyIdFallback;

    if (parsedMachineId !== null) {
      // Numeric machine ID - use direct matching
      console.log(`🔍 Using numeric machine ID: ${parsedMachineId}`);
      
      query = `
        SELECT 
          m.id, 
          m.machine_id, 
          m.user_password, 
          m.supervisor_password, 
          m.statusU, 
          m.statusS,
          s.society_id as society_string_id
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE (s.society_id = ? OR s.society_id = ? OR m.society_id = ?)
          AND m.id = ?
          AND m.status = 'active'
      `;

      replacements = [societyId, societyIdFallback, societyIdNumeric, parsedMachineId];
    } else {
      // Alphanumeric machine ID - use variant matching
      console.log(`🔍 Using alphanumeric machine ID variants:`, machineIdVariants);
      
      const placeholders = machineIdVariants.map(() => '?').join(', ');
      
      query = `
        SELECT 
          m.id, 
          m.machine_id, 
          m.user_password, 
          m.supervisor_password, 
          m.statusU, 
          m.statusS,
          s.society_id as society_string_id
        FROM \`${schemaName}\`.machines m
        LEFT JOIN \`${schemaName}\`.societies s ON m.society_id = s.id
        WHERE (s.society_id = ? OR s.society_id = ? OR m.society_id = ?)
          AND m.machine_id IN (${placeholders})
          AND m.status = 'active'
      `;

      replacements = [societyId, societyIdFallback, societyIdNumeric, ...machineIdVariants];
    }

    console.log(`🔍 Executing query with replacements:`, replacements);

    const [results] = await sequelize.query(query, { replacements });
    const machines = results as MachinePasswordResult[];

    console.log(`✅ Found ${machines.length} machines in schema: ${schemaName}`);
    if (machines.length > 0) {
      console.log(`🔍 First machine result:`, {
        id: machines[0].id,
        machine_id: machines[0].machine_id,
        society_string_id: machines[0].society_string_id,
        statusU: machines[0].statusU,
        statusS: machines[0].statusS,
        user_password: machines[0].user_password ? '***' : null,
        supervisor_password: machines[0].supervisor_password ? '***' : null
      });
    }

    if (machines.length === 0) {
      console.log(`ℹ️ No active machine found for society ${societyId}, machine ${machineId} in schema ${schemaName}`);
      return new Response('"Machine password not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const machine = machines[0];
    
    // Check password status and return appropriate response
    if (isUserPassword) {
      // Check if user password is set (statusU = 1)
      if (machine.statusU !== 1) {
        console.log(`ℹ️ User password not set for machine ${machineId} (statusU: ${machine.statusU})`);
        return new Response('"Machine password not found."', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Return user password in format PU|password
      const password = machine.user_password || '';
      const response = `PU|${password}`;
      
      console.log(`📤 Returning user password for machine ${machineId}: PU|${password}`);
      
      return new Response(`"${response}"`, {
        status: 200,
        headers: { 
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else if (isSupervisorPassword) {
      // Check if supervisor password is set (statusS = 1)
      if (machine.statusS !== 1) {
        console.log(`ℹ️ Supervisor password not set for machine ${machineId} (statusS: ${machine.statusS})`);
        return new Response('"Machine password not found."', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Return supervisor password in format PS|password
      const password = machine.supervisor_password || '';
      const response = `PS|${password}`;
      
      console.log(`📤 Returning supervisor password for machine ${machineId}: PS|${password}`);
      
      return new Response(`"${response}"`, {
        status: 200,
        headers: { 
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Should never reach here due to earlier validation, but just in case
    return new Response('"Machine password not found."', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('❌ Error in GetLatestMachinePassword API:', error);
    
    // Return consistent error message for external API
    return new Response('"Machine password not found."', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Export GET handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}

// Export POST handler
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}