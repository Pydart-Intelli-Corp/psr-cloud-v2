'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

export default function AuthChecker({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip auth check for public routes
    if (publicRoutes.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    // Skip for static assets and API routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
      setIsChecking(false);
      return;
    }

    // Check if user has valid token
    const checkAuth = async () => {
      // Check for userData first to see if it's a farmer
      const userDataStr = localStorage.getItem('userData');
      let userData = null;
      
      try {
        if (userDataStr) {
          userData = JSON.parse(userDataStr);
        }
      } catch (e) {
        console.error('Error parsing userData:', e);
      }

      // If this is a farmer, skip server verification (farmers use their own auth)
      if (userData && userData.role === 'farmer') {
        console.log('✅ AuthChecker: Farmer detected, skipping server verification');
        
        // Just check if they have a token
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('🔒 AuthChecker: Farmer has no token, redirecting to login');
          localStorage.clear();
          setIsChecking(false);
          router.push('/login');
          return;
        }
        
        setIsChecking(false);
        return;
      }
      
      // For regular users, check token and verify with server
      let token = localStorage.getItem('authToken');
      if (!token) {
        token = localStorage.getItem('adminToken');
      }
      
      if (!token) {
        console.log('🔒 AuthChecker: No token in localStorage, redirecting to login');
        setIsChecking(false);
        router.push('/login');
        return;
      }

      console.log('🔍 AuthChecker: Token found, verifying with server...');

      // Verify token with server (using credentials to include cookies)
      try {
        const response = await fetch('/api/auth/verify-session', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important: Include cookies
        });

        if (!response.ok) {
          console.log('🔒 AuthChecker: Session invalid, clearing storage and redirecting');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('userRole');
          setIsChecking(false);
          router.push('/login');
        } else {
          console.log('✅ AuthChecker: Session valid, staying on page');
          setIsChecking(false);
        }
      } catch (error) {
        console.error('❌ AuthChecker: Session check failed:', error);
        setIsChecking(false);
        // Don't redirect on network error, let middleware handle it
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Show nothing while checking (prevents flash of content)
  if (isChecking && !publicRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
