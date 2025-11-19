import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { QueryTypes } from 'sequelize';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15
    const { id } = await params;
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    // Parse request body
    const { userPassword, supervisorPassword } = await request.json();

    // Validate input
    if (!userPassword && !supervisorPassword) {
      return NextResponse.json({ 
        error: 'At least one password must be provided' 
      }, { status: 400 });
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

    // Determine password status based on provided passwords
    // Status 1 = Password set (ready to inject)
    // Status 0 = No password OR password already injected (managed by ESP32)
    // When setting a new password, we set status to 1 so ESP32 knows to download it
    const statusU = userPassword ? 1 : 0;
    const statusS = supervisorPassword ? 1 : 0;

    // Update machine passwords (for external API access)
    const updateQuery = `
      UPDATE \`${schemaName}\`.\`machines\` 
      SET 
        user_password = ?,
        supervisor_password = ?,
        statusU = ?,
        statusS = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [results] = await sequelize.query(updateQuery, {
      replacements: [
        userPassword || null,  // Store for external API access
        supervisorPassword || null,  // Store for external API access
        statusU,
        statusS,
        id
      ],
      type: QueryTypes.UPDATE
    });

    if (results === 0) {
      return createErrorResponse('Machine not found', 404);
    }

    return createSuccessResponse(
      'Machine passwords updated successfully',
      { statusU, statusS }
    );

  } catch (error) {
    console.error('Error updating machine passwords:', error);
    return createErrorResponse('Failed to update machine passwords', 500);
  }
}