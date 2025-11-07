import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

// PUT - Update machine status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Authorization header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('🔍 Extracted token:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return createErrorResponse('Status is required', 400);
    }

    if (!['active', 'inactive', 'maintenance', 'suspended'].includes(status)) {
      return createErrorResponse('Invalid status. Must be: active, inactive, maintenance, or suspended', 400);
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

    // Update machine status in admin's schema
    const updateQuery = `
      UPDATE \`${schemaName}\`.machines 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await sequelize.query(updateQuery, { replacements: [status, id] });

    console.log(`✅ Machine status updated successfully in schema: ${schemaName}`);

    return createSuccessResponse(
      'Machine status updated successfully',
      { status }
    );

  } catch (error) {
    console.error('Error updating machine status:', error);
    return createErrorResponse('Failed to update machine status', 500);
  }
}