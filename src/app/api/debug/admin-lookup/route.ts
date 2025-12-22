import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // Get admin info for each schema
    const [adminUsers] = await sequelize.query(`
      SELECT id, fullName, email, dbKey 
      FROM users 
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);
    
    const adminLookup = (adminUsers as any[]).reduce((acc, admin) => {
      const cleanName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanName}_${admin.dbKey.toLowerCase()}`;
      acc[schemaName] = admin;
      return acc;
    }, {} as Record<string, any>);

    return createSuccessResponse('Admin lookup completed', {
      adminUsers,
      adminLookup,
      testSchema: adminLookup['tester_tes6572']
    });

  } catch (error: unknown) {
    console.error('Error testing admin lookup:', error);
    return createErrorResponse('Failed to test admin lookup', 500);
  }
}