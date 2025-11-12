import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';

/**
 * MachineNewupdate FromMachine API Endpoint
 * 
 * Purpose: Check for machine firmware/software updates
 * Returns: Update availability status with timestamp
 * 
 * Endpoint: GET/POST /api/[db-key]/MachineNewupdate/FromMachine
 * 
 * Input Format: S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09$0D$0A
 * - Part 1: Society ID (e.g., S-1)
 * - Part 2: Machine Type (e.g., LSE-SVPWTBQ-12AH)
 * - Part 3: Machine Model/Version (e.g., LE3.36)
 * - Part 4: Machine ID (e.g., Mm00001)
 * - Part 5: DateTime stamp (e.g., D2025-11-12_10:59:09)
 * 
 * Response Format: "DD-MM-YYYY HH:MM:SS AM/PM|Status"
 * Example: "06-11-2025 05:41:18 AM|No update"
 */

interface SocietyLookupResult {
  id: number;
}

interface MachineResult {
  id: number;
  machine_id: string;
  society_id: number;
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    let inputString: string | null = null;
    
    // Log request details for debugging
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📡 MachineNewupdate FromMachine API Request:`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   Method: ${request.method}`);
    console.log(`   Full URL: ${request.url}`);
    console.log(`   Headers:`, {
      'user-agent': request.headers.get('user-agent'),
      'content-type': request.headers.get('content-type'),
      'connection': request.headers.get('connection'),
      'host': request.headers.get('host')
    });
    
    // Handle both GET and POST requests
    if (request.method === 'GET') {
      // Extract from query parameters for GET requests
      const { searchParams } = new URL(request.url);
      inputString = searchParams.get('InputString');
      console.log(`   GET Query Params:`, Object.fromEntries(searchParams.entries()));
      
      // Fallback: If InputString is null, try parsing from raw URL (handles malformed URLs from ESP32)
      if (!inputString) {
        const url = request.url;
        console.log(`   🔍 Attempting to extract InputString from raw URL...`);
        
        // First, check if searchParams has a key that includes "InputString" (e.g., ",InputString")
        for (const [key, value] of searchParams.entries()) {
          if (key.includes('InputString')) {
            inputString = value;
            console.log(`   ✅ Found InputString in malformed param key: "${key}" = "${inputString}"`);
            break;
          }
        }
        
        // If still not found, try regex patterns
        if (!inputString) {
          // Handle various malformed URL formats from ESP32:
          // ?%2CInputString= (URL-encoded comma)
          // ?,InputString= (comma before param)
          // ?InputString= (correct format)
          const inputStringMatch = url.match(/\?(?:%2C|,)?InputString=([^&]*)/i);
          if (inputStringMatch) {
            inputString = decodeURIComponent(inputStringMatch[1]);
            console.log(`   ✅ Extracted InputString from malformed URL: "${inputString}"`);
          } else {
            console.log(`   ❌ Could not extract InputString from URL`);
          }
        }
      }
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
    console.log(`   DB Key: "${dbKey}"`);
    console.log(`   InputString (raw): "${inputString}"`);

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
        console.log(`🧹 Filtered line endings: "${originalInputString}" -> "${inputString}"`);
      }
    }

    // Validate required parameters
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed`);
      return new Response('"DB Key is required"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    if (!inputString) {
      return new Response('"InputString parameter is required"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Connect to database and validate DB Key
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Find admin by dbKey to get schema name
    const admin = await User.findOne({ 
      where: { dbKey: dbKey.toUpperCase() } 
    });

    if (!admin || !admin.dbKey) {
      console.log(`❌ Admin not found for DB Key: ${dbKey}`);
      return new Response('"Invalid DB Key"', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Parse input string format: S-1|LSE-SVPWTBQ-12AH|LE3.36|Mm00001|D2025-11-12_10:59:09
    const inputParts = inputString.split('|');
    
    if (inputParts.length !== 5) {
      console.log(`❌ Invalid InputString format. Expected 5 parts, got ${inputParts.length}`);
      return new Response('"Invalid InputString format. Expected: societyId|machineType|version|machineId|datetime"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const [societyIdStr, machineType, machineModel, machineId, datetime] = inputParts;
    
    console.log(`🔍 Parsed InputString:`, { 
      societyIdStr, 
      machineType, 
      machineModel, 
      machineId, 
      datetime 
    });
    
    // Validate Society ID and find actual database ID
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
      console.log(`❌ Society not found: "${societyIdStr}"`);
      return new Response('"Invalid society ID"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    const actualSocietyId = (societyResults[0] as SocietyLookupResult).id;
    console.log(`✅ Found society: "${societyIdStr}" -> database ID: ${actualSocietyId}`);

    // Validate Machine ID
    if (!machineId || !machineId.startsWith('M')) {
      console.log(`❌ Invalid machine ID format: "${machineId}"`);
      return new Response('"Invalid machine ID format"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Remove first capital 'M' prefix and extract the actual machine ID
    // Format: M + optional_letter + numbers
    // Examples: Mm00001 -> m1, M00001 -> 1, Ma00005 -> a5
    const machineIdWithoutPrefix = machineId.substring(1); // Remove first 'M'
    
    // Check if the first character after M is a letter or number
    let machineIdCleaned: string;
    if (/^[a-zA-Z]/.test(machineIdWithoutPrefix)) {
      // Has a letter (e.g., m00001, a00005)
      const letter = machineIdWithoutPrefix.charAt(0).toLowerCase();
      const numberPart = machineIdWithoutPrefix.substring(1);
      const cleanedNumber = numberPart.replace(/^0+/, '') || '0';
      machineIdCleaned = letter + cleanedNumber;
    } else {
      // No letter, just numbers (e.g., 00001)
      machineIdCleaned = machineIdWithoutPrefix.replace(/^0+/, '') || '0';
    }
    
    console.log(`🔄 Machine ID conversion: "${machineId}" -> "${machineIdWithoutPrefix}" -> "${machineIdCleaned}"`);
    
    // Validate that remaining part is alphanumeric
    if (!/^[a-zA-Z0-9]+$/.test(machineIdCleaned)) {
      console.log(`❌ Invalid machine ID: "${machineId}" - contains invalid characters`);
      return new Response('"Invalid machine ID format"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Try to find the machine in the database (case-insensitive)
    const machineQuery = `
      SELECT id, machine_id, society_id 
      FROM \`${schemaName}\`.machines 
      WHERE LOWER(machine_id) = LOWER(?) AND society_id = ?
      LIMIT 1
    `;
    
    const [machineResults] = await sequelize.query(machineQuery, { 
      replacements: [machineIdCleaned, actualSocietyId] 
    });
    
    if (!Array.isArray(machineResults) || machineResults.length === 0) {
      console.log(`❌ Machine not found: "${machineId}" for society ${actualSocietyId}`);
      // Still return a valid response format but with "No update" message
    }
    
    const machineData = machineResults.length > 0 ? machineResults[0] as MachineResult : null;
    if (machineData) {
      console.log(`✅ Found machine: "${machineId}" -> database ID: ${machineData.id}`);
    }

    // Parse datetime from input (format: D2025-11-12_10:59:09)
    // Extract date-time part after 'D' prefix
    let requestTimestamp = new Date();
    if (datetime && datetime.startsWith('D')) {
      try {
        const dateTimeStr = datetime.substring(1); // Remove 'D' prefix
        const [datePart, timePart] = dateTimeStr.split('_');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        
        requestTimestamp = new Date(
          parseInt(year), 
          parseInt(month) - 1, 
          parseInt(day), 
          parseInt(hour), 
          parseInt(minute), 
          parseInt(second)
        );
        
        console.log(`📅 Parsed request timestamp: ${requestTimestamp.toISOString()}`);
      } catch {
        console.log(`⚠️ Failed to parse datetime: "${datetime}", using current time`);
      }
    }

    // Generate current timestamp in the required format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const hoursStr = String(hours).padStart(2, '0');
    
    const formattedTimestamp = `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;

    // TODO: Implement actual update check logic
    // For now, always return "No update"
    // In future, check database for pending updates based on:
    // - machineType
    // - machineModel (firmware version)
    // - machineId
    
    const updateStatus = "No update";
    const responseText = `${formattedTimestamp}|${updateStatus}`;

    console.log(`✅ Response: "${responseText}"`);

    return new Response(responseText, { 
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': String(responseText.length),
        'Connection': 'close',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('❌ MachineNewupdate FromMachine API Error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.log(`${'='.repeat(80)}\n`);
    
    // Return error in the expected format with current timestamp
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hoursStr = String(hours).padStart(2, '0');
    
    const formattedTimestamp = `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
    const errorResponse = `${formattedTimestamp}|Error`;
    
    return new Response(errorResponse, { 
      status: 200, // Always return 200 so ESP32 can parse response
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': String(errorResponse.length),
        'Connection': 'close'
      }
    });
  }
}

// Export both GET and POST methods
export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  return handleRequest(request, context);
}
