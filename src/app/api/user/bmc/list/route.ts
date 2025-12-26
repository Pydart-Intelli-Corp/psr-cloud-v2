import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * Lightweight API endpoint for fetching BMC list without statistics
 * Use this for dropdowns and lists where statistics are not needed
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Get all BMCs - FAST QUERY without aggregations
    const [bmcs] = await sequelize.query(`
      SELECT 
        b.id, 
        b.name, 
        b.bmc_id as bmcId, 
        b.location, 
        b.dairy_farm_id as dairyFarmId,
        b.status,
        b.created_at as createdAt,
        d.name as dairyFarmName
      FROM \`${schemaName}\`.\`bmcs\` b
      LEFT JOIN \`${schemaName}\`.\`dairy_farms\` d ON b.dairy_farm_id = d.id
      ORDER BY b.name ASC
    `);

    return createSuccessResponse('BMCs retrieved successfully', bmcs);

  } catch (error: unknown) {
    console.error('Error fetching BMCs:', error);
    
    if (error instanceof Error && error.message.includes('Unknown database')) {
      return createErrorResponse('Admin schema not found', 404);
    }
    
    return createErrorResponse('Failed to fetch BMCs', 500);
  }
}
