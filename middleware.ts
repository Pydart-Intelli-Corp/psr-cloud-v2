import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/verify-email',
  '/status',
  '/splash',
  '/color-system',
  '/diagnostic',
  '/superadmin',
];

// API routes that should be excluded from middleware checks
const apiRouteExclusions = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-otp',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/resend-verification',
  '/api/auth/resend-otp',
  '/api/auth/verify-session',
  '/api/superadmin/auth/login',
  '/api/pincode',
  '/api/external',
  '/api/debug',
  '/api/analytics',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔍 Middleware: Checking path:', pathname);

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    console.log('✅ Middleware: Public route, allowing');
    return NextResponse.next();
  }

  // Allow static files, favicon, images, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/flower') ||
    pathname.startsWith('/fulllogo')
  ) {
    return NextResponse.next();
  }

  // Allow certain API routes without authentication
  if (apiRouteExclusions.some(route => pathname.startsWith(route))) {
    console.log('✅ Middleware: API exclusion, allowing');
    return NextResponse.next();
  }

  // For protected routes, check authentication
  const token = request.cookies.get('authToken')?.value;

  console.log('🔍 Middleware: Token present:', !!token);

  if (!token) {
    // No token found, redirect to login
    console.log('🔒 Middleware: No token, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token validity
  const decoded = verifyToken(token);
  if (!decoded) {
    // Invalid or expired token, redirect to login
    console.log('🔒 Middleware: Invalid token, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  console.log('✅ Middleware: Valid token, allowing request');
  // Token is valid, allow request to continue
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, flower.png, fulllogo.png (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|flower.png|fulllogo.png).*)',
  ],
};
