'use client';

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface UserData {
  id: number;
  uid: string;
  email: string;
  role: string;
  fullName: string;
}

/**
 * Verify if the current user session is valid by checking with the server
 */
export async function verifyUserSession(): Promise<{ isValid: boolean; user?: UserData }> {
  try {
    // Check for both regular and admin tokens
    let token = localStorage.getItem('authToken');
    let userData = localStorage.getItem('userData');
    
    // Fallback to admin token if regular token not found
    if (!token) {
      token = localStorage.getItem('adminToken');
      userData = localStorage.getItem('adminUser');
    }
    
    if (!token) {
      console.log('🔍 verifyUserSession: No token found');
      return { isValid: false };
    }

    console.log('🔍 verifyUserSession: Token found, making API call');
    const response = await fetch('/api/auth/verify-session', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 verifyUserSession: API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔍 verifyUserSession: API response data:', data);
      
      if (data.success && data.data && data.data.user) {
        // Update localStorage with fresh user data
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        // Also update admin storage if this is an admin user
        if (data.data.user.role === 'super_admin' || data.data.user.role === 'admin') {
          localStorage.setItem('adminUser', JSON.stringify(data.data.user));
        }
        console.log('✅ verifyUserSession: Session valid, user:', data.data.user);
        return { isValid: true, user: data.data.user };
      }
    }

    // If verification fails, clear stored data
    console.log('❌ verifyUserSession: Session invalid, clearing storage');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userRole');
    return { isValid: false };
  } catch (error) {
    console.error('❌ verifyUserSession: Session verification failed:', error);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('userRole');
    return { isValid: false };
  }
}

/**
 * Get the appropriate dashboard route for a user role
 */
export function getDashboardRoute(role: string): string {
  switch (role) {
    case 'super_admin':
      return '/superadmin/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'dairy':
      return '/dairy/dashboard';
    case 'bmc':
      return '/bmc/dashboard';
    case 'society':
      return '/society/dashboard';
    case 'farmer':
      return '/farmer/dashboard';
    default:
      console.warn(`Unknown role: ${role}, redirecting to login`);
      return '/login';
  }
}

/**
 * Check if user has valid session and redirect appropriately
 */
export async function checkAuthAndRedirect(router: AppRouterInstance): Promise<boolean> {
  console.log('🔍 checkAuthAndRedirect: Starting authentication check');
  const { isValid, user } = await verifyUserSession();
  
  console.log('🔍 checkAuthAndRedirect: Session check result:', { isValid, user });
  
  if (isValid && user) {
    const dashboardRoute = getDashboardRoute(user.role);
    console.log('✅ checkAuthAndRedirect: Redirecting to:', dashboardRoute);
    router.push(dashboardRoute);
    return true;
  }
  
  console.log('ℹ️ checkAuthAndRedirect: No valid session, staying on current page');
  return false;
}