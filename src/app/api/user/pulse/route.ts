import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { SectionPulseTracker } from '@/lib/sectionPulseTracker';
import { createErrorResponse, createSuccessResponse } from '@/middleware/auth';

/**
 * Get Section Pulse Status API
 * 
 * GET /api/user/pulse - Get pulse status for all societies (current date)
 * GET /api/user/pulse?date=YYYY-MM-DD - Get pulse status for specific date
 * GET /api/user/pulse?societyId=123 - Get pulse status for specific society
 * GET /api/user/pulse?societyId=123&date=YYYY-MM-DD - Specific society and date
 * 
 * Returns pulse status with indicators:
 * - not_started: Section has not started (no collections yet today)
 * - active: Section is currently active (collections happening)
 * - ended: Section has ended (60+ minutes since last collection)
 * - inactive: No pulse for multiple days
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get user from session/token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const user = await User.findByPk(parseInt(userId));
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Get admin's schema name
    let dbKey: string;
    let adminUser;

    if (user.role === 'admin') {
      dbKey = user.dbKey || '';
      adminUser = user;
    } else {
      // Get admin user for non-admin users
      adminUser = await User.findByPk(user.parentId || 0);
      if (!adminUser || !adminUser.dbKey) {
        return createErrorResponse('Admin user not found', 404);
      }
      dbKey = adminUser.dbKey;
    }

    const cleanAdminName = adminUser.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${dbKey.toLowerCase()}`;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const societyIdParam = searchParams.get('societyId');
    const dateParam = searchParams.get('date');

    // Validate date format if provided
    if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }

    let pulseData;

    if (societyIdParam) {
      // Get pulse status for specific society
      const societyId = parseInt(societyIdParam);
      if (isNaN(societyId)) {
        return createErrorResponse('Invalid society ID', 400);
      }

      pulseData = await SectionPulseTracker.getPulseStatus(
        sequelize,
        schemaName,
        societyId,
        dateParam || undefined
      );

      if (!pulseData) {
        return createErrorResponse('Pulse status not found', 404);
      }

      // Get society name
      const [societies] = await sequelize.query(`
        SELECT name, society_id FROM \`${schemaName}\`.societies WHERE id = ?
      `, { replacements: [societyId] }) as unknown as [{
        name: string;
        society_id: string;
      }[]];

      const society = societies && societies[0];

      return createSuccessResponse({
        pulse: {
          ...pulseData,
          societyName: society?.name,
          societyCode: society?.society_id,
          statusMessage: getPulseStatusMessage(pulseData)
        }
      }, 'Pulse status retrieved successfully');
    } else {
      // Get pulse status for all societies
      pulseData = await SectionPulseTracker.getAllPulseStatuses(
        sequelize,
        schemaName,
        dateParam || undefined
      );

      // Add status messages
      const pulseWithMessages = pulseData.map(pulse => ({
        ...pulse,
        statusMessage: getPulseStatusMessage(pulse)
      }));

      return createSuccessResponse({
        date: dateParam || new Date().toISOString().split('T')[0],
        totalSocieties: pulseData.length,
        active: pulseData.filter(p => p.pulseStatus === 'active').length,
        ended: pulseData.filter(p => p.pulseStatus === 'ended').length,
        notStarted: pulseData.filter(p => p.pulseStatus === 'not_started').length,
        inactive: pulseData.filter(p => p.pulseStatus === 'inactive').length,
        pulses: pulseWithMessages
      }, 'Pulse statuses retrieved successfully');
    }

  } catch (error) {
    console.error('❌ Error getting pulse status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return createErrorResponse('Failed to get pulse status', 500);
  }
}

/**
 * Helper function to generate human-readable pulse status message
 */
function getPulseStatusMessage(pulse: {
  pulseStatus: 'not_started' | 'active' | 'ended' | 'inactive' | 'paused';
  firstCollectionTime: Date | null;
  lastCollectionTime: Date | null;
  sectionEndTime: Date | null;
  totalCollections: number;
  inactiveDays: number;
}): string {
  switch (pulse.pulseStatus) {
    case 'not_started':
      return 'Section not started';
    
    case 'active':
      if (pulse.lastCollectionTime) {
        const minutesAgo = Math.floor((Date.now() - new Date(pulse.lastCollectionTime).getTime()) / 60000);
        return `Active - Last collection ${minutesAgo} min ago`;
      }
      return 'Active';
    
    case 'paused':
      return 'Section paused';
    
    case 'ended':
      if (pulse.sectionEndTime) {
        const endTime = new Date(pulse.sectionEndTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
        return `Section ended at ${endTime}`;
      }
      return 'Section ended';
    
    case 'inactive':
      if (pulse.inactiveDays === 1) {
        return 'No pulse for 1 day';
      } else if (pulse.inactiveDays > 1) {
        return `No pulse for ${pulse.inactiveDays} days`;
      }
      return 'Inactive';
    
    default:
      return 'Unknown status';
  }
}

/**
 * Manual pulse check endpoint
 * Triggers check for section end and inactivity
 * 
 * POST /api/user/pulse/check
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get user from session/token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return createErrorResponse('Unauthorized', 401);
    }

    const user = await User.findByPk(parseInt(userId));
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Only allow admin to manually trigger pulse checks
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return createErrorResponse('Insufficient permissions', 403);
    }

    // Get admin's schema name
    let dbKey: string;
    let adminUser;

    if (user.role === 'admin') {
      dbKey = user.dbKey || '';
      adminUser = user;
    } else {
      adminUser = await User.findByPk(user.parentId || 0);
      if (!adminUser || !adminUser.dbKey) {
        return createErrorResponse('Admin user not found', 404);
      }
      dbKey = adminUser.dbKey;
    }

    const cleanAdminName = adminUser.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${dbKey.toLowerCase()}`;

    // Run pulse checks
    console.log('🔍 Running manual pulse checks...');
    
    await SectionPulseTracker.checkSectionEnd(sequelize, schemaName);
    console.log('✅ Section end check completed');
    
    await SectionPulseTracker.checkInactivity(sequelize, schemaName);
    console.log('✅ Inactivity check completed');

    // Get updated pulse statuses
    const pulseData = await SectionPulseTracker.getAllPulseStatuses(
      sequelize,
      schemaName
    );

    return createSuccessResponse({
      checksRun: ['section_end', 'inactivity'],
      totalSocieties: pulseData.length,
      active: pulseData.filter(p => p.pulseStatus === 'active').length,
      ended: pulseData.filter(p => p.pulseStatus === 'ended').length,
      notStarted: pulseData.filter(p => p.pulseStatus === 'not_started').length,
      inactive: pulseData.filter(p => p.pulseStatus === 'inactive').length
    }, 'Pulse checks completed successfully');

  } catch (error) {
    console.error('❌ Error running pulse checks:', error);
    return createErrorResponse('Failed to run pulse checks', 500);
  }
}
