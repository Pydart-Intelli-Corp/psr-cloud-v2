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
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    const admin = await User.findByPk(decoded.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json({ error: 'Admin schema not found' }, { status: 404 });
    }

    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    const query = `
      SELECT 
        ms.id,
        ms.count,
        b.bmc_id,
        b.name as bmc_name,
        b.dairy_farm_id as dairy_id,
        df.name as dairy_name,
        m.machine_id,
        ms.sales_date,
        ms.sales_time,
        ms.shift_type,
        ms.channel,
        ms.quantity,
        ms.rate_per_liter,
        ms.total_amount,
        ms.machine_type,
        ms.machine_version,
        ms.created_at
      FROM \`${schemaName}\`.milk_sales ms
      LEFT JOIN \`${schemaName}\`.machines m ON ms.machine_id = m.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON m.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.dairy_farms df ON b.dairy_farm_id = df.id
      WHERE m.bmc_id IS NOT NULL
      ORDER BY ms.sales_date DESC, ms.sales_time DESC
      LIMIT 1000
    `;

    const [results] = await sequelize.query(query);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Error fetching BMC sales data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BMC sales data' },
      { status: 500 }
    );
  }
}
