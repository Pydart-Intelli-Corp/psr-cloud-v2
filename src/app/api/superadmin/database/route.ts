import { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';
import { migrationRunner } from '@/lib/migrations';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// Only allow super admin to manage database
async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return false;
  }

  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === 'string') {
    return false;
  }

  return decoded.role === UserRole.SUPER_ADMIN;
}

// Get migration status
export async function GET(request: NextRequest) {
  try {
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return createErrorResponse('Unauthorized. Super admin access required.', 403);
    }

    const status = await migrationRunner.getMigrationStatus();
    return createSuccessResponse(
      'Migration status retrieved successfully',
      JSON.stringify({ status })
    );
  } catch (error: unknown) {
    console.error('Get migration status error:', error);
    return createErrorResponse('Failed to get migration status', 500);
  }
}

// Run database operations
export async function POST(request: NextRequest) {
  try {
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return createErrorResponse('Unauthorized. Super admin access required.', 403);
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'migrate':
        await migrationRunner.runMigrations();
        return createSuccessResponse('Migrations completed successfully', '{}');

      case 'migrate_undo':
        await migrationRunner.undoLastMigration();
        return createSuccessResponse('Last migration undone successfully', '{}');

      case 'seed':
        await migrationRunner.runSeeders();
        return createSuccessResponse('Seeders completed successfully', '{}');

      case 'seed_undo':
        await migrationRunner.undoSeeders();
        return createSuccessResponse('All seeders undone successfully', '{}');

      case 'init':
        await migrationRunner.initializeDatabase();
        return createSuccessResponse('Database initialized successfully', '{}');

      case 'status':
        const status = await migrationRunner.getMigrationStatus();
        return createSuccessResponse(
          'Migration status retrieved successfully',
          JSON.stringify({ status })
        );

      default:
        return createErrorResponse('Invalid action. Valid actions: migrate, migrate_undo, seed, seed_undo, init, status', 400);
    }
  } catch (error: unknown) {
    console.error('Database management error:', error);
    return createErrorResponse(`Database operation failed: ${error}`, 500);
  }
}