import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';

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
      
      // Handle malformed URLs from ESP32/IoT devices (e.g., "?,InputString=...")
      if (!inputString) {
        // Check if any param key contains "InputString" (handles ",InputString" case)
        for (const [key, value] of searchParams.entries()) {
          if (key.includes('InputString')) {
            inputString = value;
            console.log(`   ✅ Found InputString in malformed param key: "${key}"`);
            break;
          }
        }
      }
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

    console.log(`🔍 SaveMachineCorrectionUpdationHistory API Request - Full URL: ${request.url}`);
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
      return new Response('"Machine correction not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    if (!inputString) {
      return new Response('"Machine correction not found."', { 
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
      return new Response('"Machine correction not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Parse input string format: societyId|machineType|version|machineId
    // Example: S-2|ECOD-G|LE3.36|M0000df
    const inputParts = inputString.split('|');
    
    // Check if it's the correct format (4 parts)
    if (inputParts.length !== 4) {
      return new Response('"Machine correction not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const [societyIdStr, machineType, machineModel, machineId] = inputParts;
    
    console.log(`🔍 Parsed InputString parts:`, { societyIdStr, machineType, machineModel, machineId });
    
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
      return new Response('"Machine correction not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    const actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
    console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);

    // PRIORITY 3: Validate Machine ID
    let parsedMachineId: string | null = null;
    if (machineId && machineId.trim()) {
      let machineIdStr = machineId;
      
      // Validate machine ID format (must start with M)
      if (!machineIdStr.startsWith('M') || machineIdStr.length < 2) {
        console.log(`❌ Invalid machine ID format: "${machineId}"`);
        return new Response('"Machine correction not found."', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Remove first capital 'M' prefix and extract actual machine ID
      // Format: M + optional_letter + numbers
      // Examples: Mm00001 -> m1, M00001 -> 1, Ma00005 -> a5
      const machineIdWithoutPrefix = machineIdStr.substring(1);
      
      // Check if the first character after M is a letter or number
      if (/^[a-zA-Z]/.test(machineIdWithoutPrefix)) {
        // Has a letter (e.g., m00001, a00005)
        const letter = machineIdWithoutPrefix.charAt(0).toLowerCase();
        const numberPart = machineIdWithoutPrefix.substring(1);
        const cleanedNumber = numberPart.replace(/^0+/, '') || '0';
        machineIdStr = letter + cleanedNumber;
      } else {
        // No letter, just numbers (e.g., 00001)
        machineIdStr = machineIdWithoutPrefix.replace(/^0+/, '') || '0';
      }
      
      console.log(`🔄 Machine ID conversion: "${machineId}" -> "${machineIdWithoutPrefix}" -> "${machineIdStr}"`);
      
      // Validate that remaining part is alphanumeric
      if (!/^[a-zA-Z0-9]+$/.test(machineIdStr)) {
        console.log(`❌ Invalid machine ID format: "${machineId}" - contains invalid characters`);
        return new Response('"Machine correction not found."', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Store the machine ID as-is (Mm00001 -> m1)
      parsedMachineId = machineIdStr;
    } else {
      // Machine ID is required
      console.log(`❌ Machine ID is required but not provided`);
      return new Response('"Machine correction not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Create machine ID variants for matching
    // Example: "0000df" -> ["0000df", "df"]
    const machineIdVariants = [parsedMachineId];
    
    // If machine ID starts with zeros followed by alphanumeric, add trimmed version
    const trimmedMachineId = parsedMachineId.replace(/^0+/, '');
    if (trimmedMachineId && trimmedMachineId !== parsedMachineId) {
      machineIdVariants.push(trimmedMachineId);
    }
    
    console.log(`🔍 Machine ID parsing: "${machineId}" -> Variants: ${JSON.stringify(machineIdVariants)}`);

    // PRIORITY 4: Validate Machine Model (if needed for future validations)
    if (!machineModel || machineModel.trim() === '') {
      console.log(`⚠️ Machine model is empty: "${machineModel}"`);
      // Currently not blocking execution for machine model, but logging for future use
    }
    
    console.log(`🔍 Machine model: "${machineModel}"`);

    console.log(`🔍 Using schema: ${schemaName} for machine variants: ${JSON.stringify(machineIdVariants)}`);

    // PRIORITY 5: Find the machine to get its database ID
    const placeholders = machineIdVariants.map(() => '?').join(', ');
    const findMachineQuery = `
      SELECT id, machine_id 
      FROM \`${schemaName}\`.machines 
      WHERE society_id = ? 
        AND machine_id IN (${placeholders})
        AND status = 'active'
      LIMIT 1
    `;

    const [machineResults] = await sequelize.query(findMachineQuery, { 
      replacements: [actualSocietyId, ...machineIdVariants] 
    });

    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ No machine found for society ${actualSocietyId}, machine ID variants: ${JSON.stringify(machineIdVariants)}`);
      return new Response('"Machine correction not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const machine = machineResults[0] as { id: number; machine_id: string };
    console.log(`✅ Found machine: ID ${machine.id}, machine_id: ${machine.machine_id}`);

    // PRIORITY 6: Update the correction status to 0
    const updateQuery = `
      UPDATE \`${schemaName}\`.machine_corrections 
      SET status = 0, updated_at = NOW()
      WHERE machine_id = ? AND status = 1
    `;

    console.log(`🔄 Updating correction status to 0 for machine ID: ${machine.id}`);

    // Execute the update
    await sequelize.query(updateQuery, { replacements: [machine.id] });

    console.log(`✅ Successfully updated correction status to 0 for machine ${machine.machine_id} in schema: ${schemaName}`);

    // Return success response
    const successMessage = `"Machine correction status updated successfully."`;

    console.log(`📤 ${successMessage}`);

    return new Response(successMessage, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('❌ Error in SaveMachineCorrectionUpdationHistory API:', error);
    
    // Return consistent error message for external API
    return new Response('"Machine correction not found."', { 
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
