import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import { verifyToken } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import bcrypt from 'bcryptjs';

export async function POST(
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

    // Parse request body to get admin password
    const { adminPassword } = await request.json();

    if (!adminPassword) {
      return createErrorResponse('Admin password is required', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin user and verify password
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin not found', 404);
    }

    // Verify admin password
    const isPasswordValid = await bcrypt.compare(adminPassword, admin.password);
    if (!isPasswordValid) {
      return createErrorResponse('Invalid admin password', 401);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Get machine passwords
    const query = `
      SELECT user_password, supervisor_password
      FROM \`${schemaName}\`.\`machines\` 
      WHERE id = ?
    `;

    const [results] = await sequelize.query(query, {
      replacements: [id]
    });

    if (!Array.isArray(results) || results.length === 0) {
      return createErrorResponse('Machine not found', 404);
    }

    const machine = results[0] as { user_password: string | null; supervisor_password: string | null };

    return createSuccessResponse(
      'Passwords retrieved successfully',
      {
        userPassword: machine.user_password,
        supervisorPassword: machine.supervisor_password
      }
    );

  } catch (error) {
    console.error('Error retrieving machine passwords:', error);
    return createErrorResponse('Failed to retrieve machine passwords', 500);
  }
}
