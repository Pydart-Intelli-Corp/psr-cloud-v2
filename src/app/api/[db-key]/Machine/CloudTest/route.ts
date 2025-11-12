import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { ESP32ResponseHelper, InputValidator } from '@/lib/external-api';

/**
 * CloudTest API Endpoint
 * 
 * Purpose: Simple connectivity test endpoint for external systems
 * Returns: "Cloud test OK" to confirm API connectivity
 * 
 * Endpoint: GET/POST /api/[db-key]/Machine/CloudTest
 */

async function handleRequest(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    // Await the params Promise in Next.js 15
    const resolvedParams = await params;
    const dbKey = resolvedParams['db-key'] || resolvedParams.dbKey || resolvedParams['dbkey'];

    // Log request with ESP32ResponseHelper
    ESP32ResponseHelper.logRequest(request, dbKey, null);

    // Validate DB Key using InputValidator
    const dbKeyValidation = InputValidator.validateDbKey(dbKey);
    if (!dbKeyValidation.isValid) {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return ESP32ResponseHelper.createErrorResponse(dbKeyValidation.error || 'DB Key is required');
    }

    // Connect to database and validate DB Key
    await connectDB();
    const { getModels } = await import('@/models');
    const { User } = getModels();

    // Find admin by dbKey to validate it exists
    const admin = await User.findOne({ 
      where: { dbKey: dbKey.toUpperCase() } 
    });

    if (!admin || !admin.dbKey) {
      console.log(`❌ Admin not found or missing DB Key for: ${dbKey}`);
      return ESP32ResponseHelper.createErrorResponse('Invalid DB Key');
    }

    console.log(`✅ CloudTest successful for admin: ${admin.fullName} (${admin.dbKey})`);

    // Return success response using ESP32ResponseHelper
    return ESP32ResponseHelper.createResponse('Cloud test OK');

  } catch (error) {
    console.error('❌ CloudTest API Error:', error);
    return ESP32ResponseHelper.createErrorResponse('Cloud test failed');
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

export async function OPTIONS() {
  return ESP32ResponseHelper.createCORSResponse();
}
