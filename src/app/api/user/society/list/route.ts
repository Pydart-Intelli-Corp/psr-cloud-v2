import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * Lightweight API endpoint for fetching society list without statistics
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

    // Get all societies - FAST QUERY without aggregations
    const [societies] = await sequelize.query(`
      SELECT 
        s.id, 
        s.name, 
        s.society_id as societyId, 
        s.location, 
        s.president_name as presidentName, 
        s.contact_phone as contactPhone, 
        s.email, 
        s.bmc_id as bmcId, 
        s.status,
        s.created_at as createdAt,
        b.name as bmcName
      FROM \`${schemaName}\`.\`societies\` s
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
      ORDER BY s.name ASC
    `);

    return createSuccessResponse('Societies retrieved successfully', societies);

  } catch (error: unknown) {
    console.error('Error fetching societies:', error);
    
    if (error instanceof Error && error.message.includes('Unknown database')) {
      return createErrorResponse('Admin schema not found', 404);
    }
    
    return createErrorResponse('Failed to fetch societies', 500);
  }
}
