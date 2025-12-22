import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth';
import { UserRole } from '@/models/User';

// Types for authentication middleware

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Authentication middleware
export const authenticateToken = (req: NextRequest): { 
  success: boolean; 
  user?: JWTPayload; 
  error?: string 
} => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return { success: false, error: 'Access token required' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return { success: false, error: 'Invalid or expired token' };
    }

    return { success: true, user: decoded };
  } catch {
    return { success: false, error: 'Authentication failed' };
  }
};

// Role-based authorization middleware
export const authorizeRole = (requiredRoles: UserRole[]) => {
  return (user: JWTPayload): { success: boolean; error?: string } => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!requiredRoles.includes(user.role as UserRole)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    return { success: true };
  };
};

// Super Admin authorization
export const requireSuperAdmin = (user: JWTPayload): { success: boolean; error?: string } => {
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  if (user.role !== UserRole.SUPER_ADMIN && user.email !== (process.env.SUPER_ADMIN_USERNAME || 'admin')) {
    return { success: false, error: 'Super Admin access required' };
  }

  return { success: true };
};

// Admin or higher authorization
export const requireAdmin = (user: JWTPayload): { success: boolean; error?: string } => {
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
  if (!adminRoles.includes(user.role as UserRole)) {
    return { success: false, error: 'Admin access required' };
  }

  return { success: true };
};

// Hierarchy-based authorization
export const requireHierarchyAccess = (targetUserId: number, currentUser: JWTPayload): {
  success: boolean; 
  error?: string 
} => {
  // Super admin can access everything
  if (currentUser.role === UserRole.SUPER_ADMIN) {
    return { success: true };
  }

  // Admin can access users in their schema
  if (currentUser.role === UserRole.ADMIN && currentUser.dbKey) {
    // Additional logic would be needed to check if targetUser belongs to admin's schema
    return { success: true };
  }

  // For other roles, implement specific hierarchy checks
  // This would require database queries to verify parent-child relationships
  
  return { success: false, error: 'Access denied' };
};

// Response helpers
export const createErrorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    { 
      success: false, 
      error: { message, code: status.toString() },
      timestamp: new Date().toISOString()
    },
    { status }
  );
};

export const createSuccessResponse = (data: unknown, message: string = 'Success', status: number = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    },
    { status }
  );
};

// Validation helper
export const validateRequiredFields = (
  body: Record<string, unknown>, 
  requiredFields: string[]
): { success: boolean; missing?: string[] } => {
  const missing = requiredFields.filter(field => 
    !body[field] || (typeof body[field] === 'string' && body[field].trim() === '')
  );

  if (missing.length > 0) {
    return { success: false, missing };
  }

  return { success: true };
};

// Rate limiting (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { success: boolean; resetTime?: number } => {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (record.count >= maxRequests) {
    return { success: false, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true };
};

// CORS headers
export const setCorsHeaders = (response: NextResponse) => {
  response.headers.set('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
};

const middleware = {
  authenticateToken,
  authorizeRole,
  requireSuperAdmin,
  requireAdmin,
  requireHierarchyAccess,
  createErrorResponse,
  createSuccessResponse,
  validateRequiredFields,
  checkRateLimit,
  setCorsHeaders
};

export default middleware;