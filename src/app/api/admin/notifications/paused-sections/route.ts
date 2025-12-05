import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { UserRole } from '@/types/user';

interface PausedSectionNotification {
  sectionPulseId: number;
  societyId: number;
  societyName: string;
  societyCode: string;
  bmcId: number;
  bmcName: string;
  dairyFarmId: number;
  dairyName: string;
  pulseDate: string;
  pausedSince: string;
  lastChecked: string;
  inactiveDays: number;
  totalCollections: number;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only ADMIN and SUPER_ADMIN can access notifications
    if (payload.role !== UserRole.ADMIN && payload.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json(
        { error: 'Admin schema not found' },
        { status: 404 }
      );
    }

    // Generate schema name dynamically: cleanName_dbKey
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const adminSchema = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Query to get all paused sections with their hierarchy
    const [pausedSections] = await sequelize.query(`
      SELECT 
        sp.id as sectionPulseId,
        sp.society_id as societyId,
        s.name as societyName,
        s.society_id as societyCode,
        s.bmc_id as bmcId,
        b.name as bmcName,
        b.dairy_farm_id as dairyFarmId,
        df.name as dairyName,
        DATE_FORMAT(sp.pulse_date, '%Y-%m-%d') as pulseDate,
        DATE_FORMAT(sp.last_collection_time, '%Y-%m-%d %H:%i:%s') as pausedSince,
        DATE_FORMAT(sp.last_checked, '%Y-%m-%d %H:%i:%s') as lastChecked,
        sp.inactive_days as inactiveDays,
        sp.total_collections as totalCollections
      FROM \`${adminSchema}\`.\`section_pulse\` sp
      INNER JOIN \`${adminSchema}\`.\`societies\` s ON sp.society_id = s.id
      INNER JOIN \`${adminSchema}\`.\`bmcs\` b ON s.bmc_id = b.id
      INNER JOIN \`${adminSchema}\`.\`dairy_farms\` df ON b.dairy_farm_id = df.id
      WHERE sp.pulse_status = 'paused'
        AND sp.pulse_date >= CURDATE() - INTERVAL 7 DAY
      ORDER BY sp.last_checked DESC
      LIMIT 50
    `);

    return NextResponse.json({
      success: true,
      data: pausedSections as PausedSectionNotification[],
      count: (pausedSections as PausedSectionNotification[]).length
    });

  } catch (error) {
    console.error('Error fetching paused sections:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch notifications',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
