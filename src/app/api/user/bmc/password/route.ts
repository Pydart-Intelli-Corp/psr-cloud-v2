import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

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

    const { searchParams } = new URL(request.url);
    const bmcId = searchParams.get('id');

    if (!bmcId) {
      return createErrorResponse('BMC ID is required', 400);
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

    // Get BMC password from admin's schema
    const [result] = await sequelize.query(`
      SELECT password FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
    `, {
      replacements: [bmcId]
    });

    if (!Array.isArray(result) || result.length === 0) {
      return createErrorResponse('BMC not found', 404);
    }

    const bmc = result[0] as { password: string };

    return createSuccessResponse('Password retrieved successfully', {
      password: bmc.password || ''
    });

  } catch (error: unknown) {
    console.error('Error retrieving BMC password:', error);
    return createErrorResponse('Failed to retrieve password', 500);
  }
}
