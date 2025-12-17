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
    const societyId = searchParams.get('id');

    if (!societyId) {
      return createErrorResponse('Society ID is required', 400);
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

    // Get society password from admin's schema
    const [result] = await sequelize.query(`
      SELECT password FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [societyId]
    });

    if (!Array.isArray(result) || result.length === 0) {
      return createErrorResponse('Society not found', 404);
    }

    const society = result[0] as { password: string };

    return createSuccessResponse('Password retrieved successfully', {
      password: society.password || ''
    });

  } catch (error: unknown) {
    console.error('Error retrieving society password:', error);
    return createErrorResponse('Failed to retrieve password', 500);
  }
}
