import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';

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

    console.log(`🔍 CloudTest API Request - Full URL: ${request.url}`);
    console.log(`🔍 Method: ${request.method}`);
    console.log(`🔍 DB Key: "${dbKey}"`);

    // Validate DB Key is provided
    if (!dbKey || dbKey.trim() === '') {
      console.log(`❌ DB Key validation failed - dbKey: "${dbKey}"`);
      return new Response('"DB Key is required"', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
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
      return new Response('"Invalid DB Key"', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    console.log(`✅ CloudTest successful for admin: ${admin.fullName} (${admin.dbKey})`);

    // Return success response
    return new Response('"Cloud test OK"', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error('❌ CloudTest API Error:', error);
    return new Response('"Cloud test failed"', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
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
