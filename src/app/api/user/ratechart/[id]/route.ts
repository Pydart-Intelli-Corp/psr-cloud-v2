import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return createErrorResponse('Invalid token', 401);
    }

    if (decoded.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { id } = await context.params;

    const sequelize = await connectDB();
    if (!sequelize) {
      return createErrorResponse('Database connection failed', 500);
    }

    const { User } = await import('@/models').then(m => m.getModels());
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Delete rate chart data first
      await sequelize.query(`
        DELETE FROM ${schemaName}.rate_chart_data
        WHERE rate_chart_id = :id
      `, {
        replacements: { id },
        transaction
      });

      // Delete rate chart record
      await sequelize.query(`
        DELETE FROM ${schemaName}.rate_charts
        WHERE id = :id
      `, {
        replacements: { id },
        transaction
      });

      await transaction.commit();

      console.log(`🗑️  Rate chart ${id} deleted successfully`);

      return createSuccessResponse('Rate chart deleted successfully', null);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error deleting rate chart:', error);
    return createErrorResponse('Failed to delete rate chart', 500);
  }
}
