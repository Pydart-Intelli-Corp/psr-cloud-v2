import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * Lightweight API endpoint for fetching dairy list without statistics
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

    // Get all dairy farms - FAST QUERY without aggregations
    const [dairyFarms] = await sequelize.query(`
      SELECT 
        id, 
        name, 
        dairy_id as dairyId, 
        location, 
        contact_person as contactPerson, 
        phone, 
        email,
        status,
        created_at as createdAt
      FROM \`${schemaName}\`.\`dairy_farms\`
      ORDER BY name ASC
    `);

    return createSuccessResponse('Dairy farms retrieved successfully', dairyFarms);

  } catch (error: unknown) {
    console.error('Error fetching dairy farms:', error);
    
    if (error instanceof Error && error.message.includes('Unknown database')) {
      return createErrorResponse('Admin schema not found', 404);
    }
    
    return createErrorResponse('Failed to fetch dairy farms', 500);
  }
}
