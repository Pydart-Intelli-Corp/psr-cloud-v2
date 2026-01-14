import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: number;
  userId: number;
  email: string;
  role: string;
  dbKey?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey and fullName
    const admin = await User.findByPk(decoded.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json({ error: 'Admin schema not found' }, { status: 404 });
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Fetch all dispatch records with joined data including dairy farm info
    const query = `
      SELECT 
        md.id,
        md.dispatch_id,
        s.society_id,
        s.name as society_name,
        s.bmc_id,
        b.name as bmc_name,
        b.dairy_farm_id as dairy_id,
        df.name as dairy_name,
        m.machine_id,
        md.dispatch_date,
        md.dispatch_time,
        md.shift_type,
        md.channel,
        md.fat_percentage,
        md.snf_percentage,
        md.clr_value,
        md.quantity,
        md.rate_per_liter,
        md.total_amount,
        md.machine_type,
        md.machine_version,
        md.created_at
      FROM \`${schemaName}\`.milk_dispatches md
      LEFT JOIN \`${schemaName}\`.societies s ON md.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      LEFT JOIN \`${schemaName}\`.machines m ON md.machine_id = m.id
      WHERE md.society_id IS NOT NULL
      ORDER BY md.dispatch_date DESC, md.dispatch_time DESC
      LIMIT 1000
    `;

    const [results] = await sequelize.query(query);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching dispatch data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispatch data' },
      { status: 500 }
    );
  }
}
