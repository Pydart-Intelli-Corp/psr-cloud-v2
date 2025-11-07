import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';

interface MachinePasswordUpdateResult {
  id: number;
  machine_id: string;
  statusU: number;
  statusS: number;
}

interface SocietyLookupResult {
  id: number;
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

    console.log(`🔍 UpdateMachinePasswordStatus API Request - Full URL: ${request.url}`);
    console.log(`🔍 Resolved Params:`, resolvedParams);
    console.log(`🔍 DB Key: "${dbKey}", InputString: "${inputString}"`);
    console.log(`🔍 DB Key type: ${typeof dbKey}, length: ${dbKey?.length}`);

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return new Response('"DB Key is required"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    if (!inputString) {
      console.log(`❌ InputString is required`);
      return new Response('"InputString parameter is required"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Filter line ending characters from InputString
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
      console.log(`🧹 UpdateMachinePasswordStatus: Filtered line endings: "${originalInputString}" -> "${inputString}"`);
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
      return new Response('"Invalid DB Key"', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Parse input string format: societyId|machineType|version|machineId|passwordType
    // Example: S-s12|ECOD|LE3.34|M00001|U or S-s12|ECOD|LE3.34|M00001|S
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 5) {
      console.log(`❌ Invalid InputString format. Expected 5 parts, got ${inputParts.length}`);
      return new Response('"Invalid InputString format. Expected: societyId|machineType|version|machineId|passwordType"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const [societyIdStr, machineType, machineModel, machineId, passwordType] = inputParts;
    
    console.log(`🔍 Parsed InputString parts:`, { societyIdStr, machineType, machineModel, machineId, passwordType });
    
    // PRIORITY 2: Validate Society ID and find actual database ID
    // Generate admin-specific schema name for society lookup
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    // Look up society by society_id field to get the actual database ID
    const societyQuery = `
      SELECT id FROM \`${schemaName}\`.societies 
      WHERE society_id = ? OR society_id = ?
      LIMIT 1
    `;
    
    // Try both with and without S- prefix
    const societyLookupParams = societyIdStr.startsWith('S-') 
      ? [societyIdStr, societyIdStr.substring(2)]
      : [`S-${societyIdStr}`, societyIdStr];
    
    const [societyResults] = await sequelize.query(societyQuery, { replacements: societyLookupParams });
    
    if (!Array.isArray(societyResults) || societyResults.length === 0) {
      console.log(`❌ No society found for society_id: "${societyIdStr}"`);
      return new Response('"Invalid society ID"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    const actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
    console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);

    // PRIORITY 3: Validate Machine ID and create variants for flexible matching
    let parsedMachineId: number | null = null;
    const machineIdVariants: string[] = [];
    
    if (machineId && machineId.trim()) {
      let machineIdStr = machineId;
      
      // Validate machine ID format (must start with M)
      if (!machineIdStr.startsWith('M') || machineIdStr.length < 2) {
        console.log(`❌ Invalid machine ID format: "${machineId}"`);
        return new Response('"Invalid machine ID format"', { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Remove 'M' prefix
      machineIdStr = machineIdStr.substring(1);
      
      // Check if it's purely numeric or alphanumeric
      const isNumeric = /^\d+$/.test(machineIdStr);
      
      if (isNumeric) {
        // Numeric machine ID - parse as number and keep as is for backward compatibility
        const machineIdNum = parseInt(machineIdStr);
        if (isNaN(machineIdNum) || machineIdNum <= 0) {
          console.log(`❌ Invalid machine ID: "${machineId}" - must be a positive number`);
          return new Response('"Invalid machine ID"', { 
            status: 400,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        parsedMachineId = machineIdNum;
        console.log(`🔍 Numeric Machine ID parsing: "${machineId}" -> ${parsedMachineId}`);
      } else {
        // Alphanumeric machine ID - create variants for flexible matching
        // Validate alphanumeric format (letters and numbers)
        if (!/^[a-zA-Z0-9]+$/.test(machineIdStr)) {
          console.log(`❌ Invalid machine ID format: "${machineId}" - contains invalid characters`);
          return new Response('"Invalid machine ID format"', { 
            status: 400,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        // Create variants: with leading zeros and without
        machineIdVariants.push(machineIdStr); // Original (e.g., "0000df")
        
        // Create stripped version (remove leading zeros)
        const strippedMachineId = machineIdStr.replace(/^0+/, ''); // "0000df" -> "df"
        if (strippedMachineId && strippedMachineId !== machineIdStr) {
          machineIdVariants.push(strippedMachineId);
        }
        
        console.log(`🔍 Alphanumeric Machine ID: "${machineId}" -> variants: [${machineIdVariants.join(', ')}]`);
      }
    } else {
      console.log(`❌ Machine ID is required but not provided`);
      return new Response('"Machine ID is required"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // PRIORITY 4: Validate Password Type
    if (!passwordType || (passwordType !== 'U' && passwordType !== 'S')) {
      console.log(`❌ Invalid password type: "${passwordType}". Must be 'U' for User or 'S' for Supervisor`);
      return new Response('"Invalid password type. Must be U or S"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    const isUserPassword = passwordType === 'U';
    
    console.log(`🔍 Password type: ${passwordType} (${isUserPassword ? 'User' : 'Supervisor'} password)`);

    console.log(`🔍 Using schema: ${schemaName} for society: ${actualSocietyId}, machine: ${machineId}`);

    // PRIORITY 5: Find the machine to update
    let findMachineQuery: string;
    let queryReplacements: (string | number)[];
    
    if (parsedMachineId !== null) {
      // Numeric machine ID - use direct matching by id
      findMachineQuery = `
        SELECT 
          id, machine_id, statusU, statusS
        FROM \`${schemaName}\`.machines 
        WHERE society_id = ? AND id = ?
        LIMIT 1
      `;
      queryReplacements = [actualSocietyId, parsedMachineId];
    } else {
      // Alphanumeric machine ID - use variant matching by machine_id string
      const placeholders = machineIdVariants.map(() => '?').join(', ');
      findMachineQuery = `
        SELECT 
          id, machine_id, statusU, statusS
        FROM \`${schemaName}\`.machines 
        WHERE society_id = ? AND machine_id IN (${placeholders})
        LIMIT 1
      `;
      queryReplacements = [actualSocietyId, ...machineIdVariants];
    }

    const [machineResults] = await sequelize.query(findMachineQuery, { 
      replacements: queryReplacements
    });

    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ No machine found for society ${actualSocietyId}, machine ID ${parsedMachineId}`);
      return new Response('"Machine not found"', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const machine = machineResults[0] as MachinePasswordUpdateResult;
    console.log(`✅ Found machine: ID ${machine.id}, machine_id: ${machine.machine_id}`);
    console.log(`🔍 Current status - User: ${machine.statusU}, Supervisor: ${machine.statusS}`);

    // PRIORITY 6: Update the appropriate password status
    let updateQuery: string;
    let statusField: string;
    let currentStatus: number;

    if (isUserPassword) {
      updateQuery = `
        UPDATE \`${schemaName}\`.machines 
        SET statusU = 0 
        WHERE id = ?
      `;
      statusField = 'statusU';
      currentStatus = machine.statusU;
    } else {
      updateQuery = `
        UPDATE \`${schemaName}\`.machines 
        SET statusS = 0 
        WHERE id = ?
      `;
      statusField = 'statusS';
      currentStatus = machine.statusS;
    }

    console.log(`🔄 Updating ${statusField} from ${currentStatus} to 0 for machine ID: ${machine.id}`);

    // Execute the update
    await sequelize.query(updateQuery, { replacements: [machine.id] });

    console.log(`✅ Successfully updated ${statusField} to 0 for machine ${machine.machine_id} in schema: ${schemaName}`);

    // PRIORITY 7: Verify the update
    const verifyQuery = `
      SELECT statusU, statusS 
      FROM \`${schemaName}\`.machines 
      WHERE id = ?
    `;

    const [verifyResults] = await sequelize.query(verifyQuery, { replacements: [machine.id] });
    const updatedMachine = verifyResults[0] as { statusU: number, statusS: number };

    console.log(`🔍 Verification - Updated status - User: ${updatedMachine.statusU}, Supervisor: ${updatedMachine.statusS}`);

    // Return success response
    const successMessage = isUserPassword 
      ? `User password status updated to 0 for machine ${machine.machine_id}`
      : `Supervisor password status updated to 0 for machine ${machine.machine_id}`;

    console.log(`📤 ${successMessage}`);

    return new Response('"Machine password status updated successfully."', {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('❌ Error in UpdateMachinePasswordStatus API:', error);
    
    // Return consistent error message for external API
    return new Response('"Status update failed"', { 
      status: 500,
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