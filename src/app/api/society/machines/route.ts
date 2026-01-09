import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/society/machines
 * Get machines assigned to the society
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'society') {
      return createErrorResponse('Society access required', 403);
    }

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Get parameters from query string
    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get('societyId');
    const schemaName = searchParams.get('schemaName');

    if (!societyId || !schemaName) {
      return createErrorResponse('Society ID and schemaName are required', 400);
    }

    // Verify this society matches the authenticated user
    if (payload.uid !== societyId) {
      return createErrorResponse('Unauthorized access to society data', 403);
    }

    console.log(`🔧 Fetching machines for society ${societyId} in schema ${schemaName}`);

    // Query machines assigned to this society
    const [machines] = await sequelize.query(`
      SELECT 
        m.id,
        m.machine_id as machineId,
        m.machine_name as machineName,
        m.model,
        m.status,
        m.last_sync as lastSync,
        CASE 
          WHEN TIMESTAMPDIFF(MINUTE, m.last_sync, NOW()) < 15 THEN true 
          ELSE false 
        END as isOnline
      FROM \`${schemaName}\`.machines m
      WHERE m.society_id = ?
      ORDER BY m.machine_name ASC
    `, { 
      replacements: [societyId],
      type: 'SELECT'
    });

    console.log(`✅ Retrieved ${(machines as any[]).length} machines for society ${societyId}`);

    return NextResponse.json({
      success: true,
      message: 'Machines retrieved successfully',
      data: machines
    });

  } catch (error) {
    console.error('❌ Error fetching society machines:', error);
    return createErrorResponse('Failed to fetch machines', 500);
  }
}
