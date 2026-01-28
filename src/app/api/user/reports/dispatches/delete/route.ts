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

// POST method for password verification only
export async function POST(request: NextRequest) {
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
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { User } = getModels();

    // Get admin user and verify password
    const admin = await User.findByPk(decoded.id);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password verified successfully' 
    });

  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    );
  }
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
    const { recordId, password, verifyOnly } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
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

    // If verifyOnly, return success without deleting
    if (verifyOnly) {
      return NextResponse.json({ 
        success: true, 
        message: 'Password verified successfully' 
      });
    }

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID required' }, { status: 400 });
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Delete the record
    const deleteQuery = `
      DELETE FROM \`${schemaName}\`.milk_dispatches
      WHERE id = ?
    `;

    await sequelize.query(deleteQuery, {
      replacements: [recordId]
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Dispatch record deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting dispatch record:', error);
    return NextResponse.json(
      { error: 'Failed to delete dispatch record' },
      { status: 500 }
    );
  }
}
