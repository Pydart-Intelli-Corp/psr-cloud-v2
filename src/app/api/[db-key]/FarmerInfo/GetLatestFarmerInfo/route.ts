import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { requestLogger, extractRequestMetadata } from '@/lib/monitoring/requestLogger';

interface FarmerInfoResult {
  rf_id: string;
  farmer_id: string;
  name: string;
  phone: string | null;
  sms_enabled: 'ON' | 'OFF';
  bonus: number;
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
    
    // Log request details for debugging Quectel 4G module issues
    console.log(`📡 External API Request Details:`);
    console.log(`   Method: ${request.method}`);
    console.log(`   Full URL: ${request.url}`);
    console.log(`   Headers:`, Object.fromEntries(request.headers.entries()));
    
    // Handle both GET and POST requests
    if (request.method === 'GET') {
      // Extract from query parameters for GET requests
      const { searchParams } = new URL(request.url);
      inputString = searchParams.get('InputString');
      
      // Also try URL-decoded version in case pipes are encoded as %7C
      if (!inputString) {
        const rawInput = searchParams.get('InputString');
        if (rawInput) {
          inputString = decodeURIComponent(rawInput);
        }
      }
      
      console.log(`   GET Query Params:`, Object.fromEntries(searchParams.entries()));
    } else if (request.method === 'POST') {
      // Extract from request body for POST requests
      try {
        const body = await request.json();
        inputString = body.InputString || null;
        console.log(`   POST JSON Body:`, body);
      } catch (error) {
        // If JSON parsing fails, try form data
        try {
          const formData = await request.formData();
          inputString = formData.get('InputString') as string || null;
          console.log(`   POST Form Data:`, Object.fromEntries(formData.entries()));
        } catch {
          console.log(`❌ Failed to parse POST body:`, error);
        }
      }
    }
    
    // Await the params Promise in Next.js 15
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'] || resolvedParams.dbKey || resolvedParams['dbkey'];

    console.log(`🔍 Parsed Values:`);
    console.log(`   DB Key: "${dbKey}" (type: ${typeof dbKey}, length: ${dbKey?.length})`);
    console.log(`   InputString: "${inputString}"`);

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return new Response('DB Key is required', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    if (!inputString) {
      return new Response('InputString parameter is required', { 
        status: 400,
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
      return new Response('"Invalid DB Key"', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Parse input string format: 333|ECOD|LE2.00|M00000001|C00001 or 333|ECOD|LE2.00|M00000001
    const inputParts = inputString.split('|');
    
    // Check if it's CSV download format (4 parts) or paginated format (5 parts)
    const isCSVDownload = inputParts.length === 4;
    const isPaginatedRequest = inputParts.length === 5;
    
    if (!isCSVDownload && !isPaginatedRequest) {
      return new Response('Invalid InputString format. Expected: societyId|machineType|version|machineId or societyId|machineType|version|machineId|pageNumber', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const [societyIdStr, machineType, machineModel, machineId, lengthParam] = inputParts;
    
    console.log(`🔍 Parsed InputString parts:`, { societyIdStr, machineType, machineModel, machineId, lengthParam });
    
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
      return new Response('"Failed to download farmer. Invalid token."', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    const actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
    console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);

    // PRIORITY 3: Validate Machine ID
    let parsedMachineId: number | null = null;
    let machineIdVariants: (string | number)[] = [];
    
    if (machineId && machineId.trim()) {
      let machineIdStr = machineId;
      
      // Validate machine ID format (must start with M)
      if (!machineIdStr.startsWith('M') || machineIdStr.length < 2) {
        console.log(`❌ Invalid machine ID format: "${machineId}"`);
        return new Response('"Failed to download farmer. Invalid machine details."', { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Remove 'M' prefix
      machineIdStr = machineIdStr.substring(1);
      
      // Validate that remaining part is alphanumeric
      if (!/^[a-zA-Z0-9]+$/.test(machineIdStr)) {
        console.log(`❌ Invalid machine ID format: "${machineId}" - contains invalid characters`);
        return new Response('"Failed to download farmer. Invalid machine details."', { 
          status: 400,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Try to parse as number for numeric IDs
      const machineIdNum = parseInt(machineIdStr);
      if (!isNaN(machineIdNum) && machineIdNum > 0) {
        // Numeric machine ID
        parsedMachineId = machineIdNum;
        machineIdVariants = [machineIdNum];
      } else {
        // Alphanumeric machine ID - use null for parsedMachineId
        parsedMachineId = null;
        // Create variants with and without leading zeros
        machineIdVariants = [machineIdStr];
        const trimmedMachineId = machineIdStr.replace(/^0+/, '');
        if (trimmedMachineId && trimmedMachineId !== machineIdStr) {
          machineIdVariants.push(trimmedMachineId);
        }
      }
    } else {
      // Machine ID is required
      console.log(`❌ Machine ID is required but not provided`);
      return new Response('"Failed to download farmer. Invalid machine details."', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    console.log(`🔍 Machine ID parsing: "${machineId}" -> ${parsedMachineId !== null ? parsedMachineId : JSON.stringify(machineIdVariants)}`);

    // PRIORITY 4: Validate Machine Model (if needed for future validations)
    if (!machineModel || machineModel.trim() === '') {
      console.log(`⚠️ Machine model is empty: "${machineModel}"`);
      // Currently not blocking execution for machine model, but logging for future use
    }
    
    console.log(`🔍 Machine model: "${machineModel}"`);

    // Handle pagination or CSV download
    let pageNumber = 1;
    let pageSize = 5;
    let offset = 0;
    
    if (isPaginatedRequest && lengthParam) {
      // Extract page number from C parameter (C00001 = page 1, C00002 = page 2, etc.)
      pageNumber = parseInt(lengthParam.replace(/^C0*/, '')) || 1;
      pageSize = 5; // Always return 5 farmers per page for pagination
      offset = (pageNumber - 1) * pageSize;
      
      console.log(`🔍 Pagination: Page ${pageNumber}, Size ${pageSize}, Offset ${offset}`);
      
      if (pageNumber < 1) {
        console.log(`⚠️ Invalid page number: ${pageNumber}, using page 1`);
      }
    } else if (isCSVDownload) {
      // For CSV download, get all records (no pagination)
      console.log(`📁 CSV Download requested - fetching all farmers`);
    }

    console.log(`🔍 Using schema: ${schemaName} for society: ${actualSocietyId}, machine variants: ${JSON.stringify(machineIdVariants)}`);

    // Build query to fetch farmers
    let query = `
      SELECT 
        f.rf_id, 
        f.farmer_id, 
        f.name, 
        f.phone, 
        f.sms_enabled, 
        f.bonus
      FROM \`${schemaName}\`.farmers f
      LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
      LEFT JOIN \`${schemaName}\`.machines m ON f.machine_id = m.id
      WHERE f.society_id = ? 
        AND f.status = 'active'
    `;

    const replacements: (string | number)[] = [actualSocietyId];

    // Add machine filter if machine ID variants exist
    if (machineIdVariants.length > 0) {
      if (parsedMachineId !== null) {
        // Numeric machine ID - direct match
        query += ` AND f.machine_id = ?`;
        replacements.push(parsedMachineId);
      } else {
        // Alphanumeric machine ID - use IN clause with variants
        const placeholders = machineIdVariants.map(() => '?').join(', ');
        query += ` AND m.machine_id IN (${placeholders})`;
        replacements.push(...machineIdVariants);
      }
    }

    query += ` ORDER BY f.farmer_id`;

    // Apply pagination only for paginated requests
    if (isPaginatedRequest) {
      query += ` LIMIT ? OFFSET ?`;
      replacements.push(pageSize, offset);
    }

    console.log(`🔍 Executing query with replacements:`, replacements);

    const [results] = await sequelize.query(query, { replacements });
    const farmers = results as FarmerInfoResult[];

    console.log(`✅ Found ${farmers.length} farmers in schema: ${schemaName} ${isPaginatedRequest ? `(Page ${pageNumber}, Offset ${offset})` : '(CSV Download)'}`);

    if (farmers.length === 0) {
      console.log(`ℹ️ No active farmers found for society ${actualSocietyId} in schema ${schemaName}`);
      return new Response('"Farmer info not found."', { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    if (isCSVDownload) {
      // Generate CSV format response with matching header format
      const csvHeader = 'RF-ID,ID,NAME,MOBILE,SMS,BONUS\n';
      const csvData = farmers.map(farmer => {
        // Handle null/missing values - show as '0' for all fields
        const farmerId = farmer.farmer_id || '0';
        const rfId = farmer.rf_id || '0';
        const name = farmer.name || '0';
        const phone = farmer.phone || '0';
        const smsEnabled = farmer.sms_enabled || 'OFF';
        
        // Convert bonus to number and format without decimal places (matching sample format)
        let bonus = '0';
        if (farmer.bonus !== null && farmer.bonus !== undefined) {
          const bonusNum = Number(farmer.bonus);
          bonus = isNaN(bonusNum) ? '0' : Math.round(bonusNum).toString();
        }
        
        // Escape CSV values that contain commas or quotes
        const escapeCsv = (value: string) => {
          if (value.includes(',') || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        };
        
        return `${escapeCsv(farmerId)},${rfId},${escapeCsv(name)},${escapeCsv(phone)},${smsEnabled},${bonus}`;
      }).join('\n');

      const csvResponse = csvHeader + csvData;
      
      console.log(`📁 Returning CSV data for ${farmers.length} farmers`);
      console.log(`📁 CSV size: ${csvResponse.length} characters`);

      return new Response(csvResponse, {
        status: 200,
        headers: { 
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="FarmerDetails.csv"',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else {
      // Format response for pagination: farmer_id|rf_id|name|phone|sms_enabled|bonus||
      // Each farmer record ends with ||, except the last one
      const responseData = farmers.map((farmer, index) => {
        // Handle null/missing values - show as '0' for all fields
        const farmerId = farmer.farmer_id || '0';
        const rfId = farmer.rf_id || '0';
        const name = farmer.name || '0';
        const phone = farmer.phone || '0';
        const smsEnabled = farmer.sms_enabled || 'OFF';
        
        // Convert bonus to number and format with 2 decimal places
        let bonus = '0.00';
        if (farmer.bonus !== null && farmer.bonus !== undefined) {
          const bonusNum = Number(farmer.bonus);
          bonus = isNaN(bonusNum) ? '0.00' : bonusNum.toFixed(2);
        }
        
        // Add || after each record except the last one
        const isLastRecord = index === farmers.length - 1;
        return `${farmerId}|${rfId}|${name}|${phone}|${smsEnabled}|${bonus}${isLastRecord ? '' : '||'}`;
      }).join('');

      console.log(`📤 Returning farmer data for ${farmers.length} farmers`);
      console.log(`📤 Response format: ${responseData.substring(0, 100)}${responseData.length > 100 ? '...' : ''}`);

      // Wrap the entire response in double quotes
      const quotedResponse = `"${responseData}"`;

      return new Response(quotedResponse, {
        status: 200,
        headers: { 
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

  } catch (error) {
    console.error('❌ Error in GetLatestFarmerInfo API:', error);
    
    // Return generic error message for external API
    return new Response('Internal server error', { 
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
  const startTime = Date.now();
  try {
    const response = await handleRequest(request, context);
    const endTime = Date.now();
    
    // Log request
    try {
      const metadata = extractRequestMetadata(request.url);
      console.log('🔔 Logging request to monitoring system:', {
        endpoint: 'FarmerInfo/GetLatest',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        statusCode: response.status,
        responseTime: endTime - startTime
      });
      
      requestLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        endpoint: 'FarmerInfo/GetLatest',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        machineId: metadata.machineId,
        inputString: metadata.inputString,
        statusCode: response.status,
        responseTime: endTime - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        category: 'external',
      });
      
      console.log('✅ Request logged successfully');
    } catch (logError) {
      console.error('❌ Failed to log request:', logError);
    }
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    try {
      const metadata = extractRequestMetadata(request.url);
      requestLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        endpoint: 'FarmerInfo/GetLatest',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        machineId: metadata.machineId,
        inputString: metadata.inputString,
        statusCode: 500,
        responseTime: endTime - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        error: errorMsg,
        category: 'external',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    throw error;
  }
}

// Export POST handler
export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const startTime = Date.now();
  try {
    const response = await handleRequest(request, context);
    const endTime = Date.now();
    
    // Log request
    try {
      const metadata = extractRequestMetadata(request.url);
      requestLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        endpoint: 'FarmerInfo/GetLatest',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        machineId: metadata.machineId,
        inputString: metadata.inputString,
        statusCode: response.status,
        responseTime: endTime - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        category: 'external',
      });
    } catch (logError) {
      console.error('Failed to log request:', logError);
    }
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    try {
      const metadata = extractRequestMetadata(request.url);
      requestLogger.log({
        method: request.method,
        path: new URL(request.url).pathname,
        endpoint: 'FarmerInfo/GetLatest',
        dbKey: metadata.dbKey,
        societyId: metadata.societyId,
        machineId: metadata.machineId,
        inputString: metadata.inputString,
        statusCode: 500,
        responseTime: endTime - startTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown',
        error: errorMsg,
        category: 'external',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    throw error;
  }
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