import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';

interface MachineCorrectionResult {
  id: number;
  machine_id: number;
  channel1_fat: number;
  channel1_snf: number;
  channel1_clr: number;
  channel1_temp: number;
  channel1_water: number;
  channel1_protein: number;
  channel2_fat: number;
  channel2_snf: number;
  channel2_clr: number;
  channel2_temp: number;
  channel2_water: number;
  channel2_protein: number;
  channel3_fat: number;
  channel3_snf: number;
  channel3_clr: number;
  channel3_temp: number;
  channel3_water: number;
  channel3_protein: number;
  status: number;
  created_at: Date;
  updated_at: Date;
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

    console.log(`🔍 External Machine Correction API Request - Full URL: ${request.url}`);
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
    // Example: 111|DPST-G|LE3.36|M00001
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
      
      // Remove 'M' prefix to get the actual machine ID
      machineIdStr = machineIdStr.substring(1);
      
      // Validate that remaining part is alphanumeric
      if (!/^[a-zA-Z0-9]+$/.test(machineIdStr)) {
        console.log(`❌ Invalid machine ID format: "${machineId}" - contains invalid characters`);
        return new Response('"Machine correction not found."', { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Store the machine ID as-is (M0000df -> 0000df)
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

    // Build query to fetch active machine correction with multiple machine ID variants
    // Use IN clause to match any of the machine ID variants (e.g., "0000df" or "df")
    const placeholders = machineIdVariants.map(() => '?').join(', ');
    const query = `
      SELECT 
        mc.id,
        mc.machine_id,
        mc.channel1_fat,
        mc.channel1_snf,
        mc.channel1_clr,
        mc.channel1_temp,
        mc.channel1_water,
        mc.channel1_protein,
        mc.channel2_fat,
        mc.channel2_snf,
        mc.channel2_clr,
        mc.channel2_temp,
        mc.channel2_water,
        mc.channel2_protein,
        mc.channel3_fat,
        mc.channel3_snf,
        mc.channel3_clr,
        mc.channel3_temp,
        mc.channel3_water,
        mc.channel3_protein,
        mc.status,
        mc.created_at,
        mc.updated_at
      FROM \`${schemaName}\`.machine_corrections mc
      INNER JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      WHERE m.society_id = ? 
        AND m.machine_id IN (${placeholders})
        AND mc.status = 1
        AND m.status = 'active'
      ORDER BY mc.created_at DESC
      LIMIT 1
    `;

    const replacements: (string | number)[] = [actualSocietyId, ...machineIdVariants];

    console.log(`🔍 Executing query with replacements:`, replacements);

    const [results] = await sequelize.query(query, { replacements });
    const corrections = results as MachineCorrectionResult[];

    console.log(`✅ Found ${corrections.length} active correction records in schema: ${schemaName}`);

    if (corrections.length === 0) {
      console.log(`ℹ️ No active correction found for machine ${parsedMachineId} in schema ${schemaName}`);
      return new Response('"Machine correction not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const correction = corrections[0];
    
    // Format date as DD-MM-YYYY HH:mm:ss AM/PM
    const formatDateTime = (date: Date): string => {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      const hoursStr = String(hours).padStart(2, '0');
      
      return `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    };

    // Format numbers with 2 decimal places
    const formatNumber = (value: number | null | undefined): string => {
      if (value === null || value === undefined) {
        return '0.00';
      }
      return Number(value).toFixed(2);
    };

    // Build response format:
    // "DD-MM-YYYY HH:mm:ss AM/PM||1|fat|snf|clr|temp|water|protein||2|fat|snf|clr|temp|water|protein||3|fat|snf|clr|temp|water|protein"
    const dateTimeStr = formatDateTime(correction.created_at);
    
    const response = [
      dateTimeStr,
      '',  // Empty field after datetime (double pipe)
      '1',  // Channel 1
      formatNumber(correction.channel1_fat),
      formatNumber(correction.channel1_snf),
      formatNumber(correction.channel1_clr),
      formatNumber(correction.channel1_temp),
      formatNumber(correction.channel1_water),
      formatNumber(correction.channel1_protein),
      '',  // Empty field before next channel (double pipe)
      '2',  // Channel 2
      formatNumber(correction.channel2_fat),
      formatNumber(correction.channel2_snf),
      formatNumber(correction.channel2_clr),
      formatNumber(correction.channel2_temp),
      formatNumber(correction.channel2_water),
      formatNumber(correction.channel2_protein),
      '',  // Empty field before next channel (double pipe)
      '3',  // Channel 3
      formatNumber(correction.channel3_fat),
      formatNumber(correction.channel3_snf),
      formatNumber(correction.channel3_clr),
      formatNumber(correction.channel3_temp),
      formatNumber(correction.channel3_water),
      formatNumber(correction.channel3_protein)
    ].join('|');

    console.log(`📤 Returning correction data for machine ${machineId}: ${response.substring(0, 100)}...`);

    // Wrap the entire response in double quotes
    const quotedResponse = `"${response}"`;

    return new Response(quotedResponse, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error('❌ Error in GetLatestMachineCorrection API:', error);
    
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
