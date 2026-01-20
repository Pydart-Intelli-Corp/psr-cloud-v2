import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        email: decoded.email, 
        role: decoded.role 
      },
      JWT_SECRET,
      { 
        expiresIn: '6h',
        issuer: 'poornasree-equipments-cloud',
        audience: 'psr-client'
      }
    );

    return NextResponse.json({ token: newToken });
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
