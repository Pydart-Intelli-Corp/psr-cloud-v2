import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface AdminTokenPayload {
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/superadmin')) {
    // Allow access to login page
    if (request.nextUrl.pathname === '/superadmin' || request.nextUrl.pathname === '/superadmin/') {
      return NextResponse.next();
    }

    // For other admin routes, check authentication
    const token = request.cookies.get('adminToken')?.value || 
                 request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminTokenPayload;
      
      // Check if user has admin role
      if (!decoded.role || decoded.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/superadmin', request.url));
      }

      // Add user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-admin-user', JSON.stringify({
        username: decoded.username,
        role: decoded.role
      }));

      return response;
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/superadmin/:path*'
  ]
};