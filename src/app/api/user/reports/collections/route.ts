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

    // Fetch all collection records with joined data including dairy farm info and farmer UID
    const query = `
      SELECT 
        mc.id,
        mc.farmer_id,
        COALESCE(f.name, 'No Name') as farmer_name,
        f.farmeruid as farmer_uid,
        s.society_id,
        s.name as society_name,
        s.bmc_id,
        b.name as bmc_name,
        b.dairy_farm_id as dairy_id,
        df.name as dairy_name,
        m.machine_id,
        mc.collection_date,
        mc.collection_time,
        mc.shift_type,
        mc.channel,
        mc.fat_percentage,
        mc.snf_percentage,
        mc.clr_value,
        mc.protein_percentage,
        mc.lactose_percentage,
        mc.salt_percentage,
        mc.water_percentage,
        mc.temperature,
        mc.quantity,
        mc.rate_per_liter,
        mc.total_amount,
        mc.bonus,
        mc.machine_type,
        mc.machine_version,
        mc.created_at
      FROM \`${schemaName}\`.milk_collections mc
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      LEFT JOIN \`${schemaName}\`.machines m ON mc.machine_id = m.id
      LEFT JOIN \`${schemaName}\`.farmers f ON f.farmer_id = mc.farmer_id AND f.society_id = mc.society_id
      WHERE mc.society_id IS NOT NULL
      ORDER BY mc.collection_date DESC, mc.collection_time DESC
      LIMIT 1000
    `;

    const [results] = await sequelize.query(query);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching collection data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection data' },
      { status: 500 }
    );
  }
}
