import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: number;
  userId: number;
  email: string;
  role: string;
  dbKey?: string;
}

export async function DELETE(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get request body
    const body = await request.json();
    const { recordId, password } = body;

    if (!recordId || !password) {
      return NextResponse.json({ error: 'Record ID and password required' }, { status: 400 });
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin user and verify password
    const admin = await User.findByPk(decoded.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Delete the record
    const deleteQuery = `
      DELETE FROM \`${schemaName}\`.milk_sales
      WHERE id = ?
    `;

    await sequelize.query(deleteQuery, {
      replacements: [recordId]
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Sales record deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting sales record:', error);
    return NextResponse.json(
      { error: 'Failed to delete sales record' },
      { status: 500 }
    );
  }
}
