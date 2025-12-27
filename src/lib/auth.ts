import jwt from 'jsonwebtoken';
import { UserRole } from '@/models/User';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key';

// JWT payload interface
export interface JWTPayload {
  id: number;
  uid: string;
  email: string;
  role: UserRole | string; // Allow string for external auth entity types
  dbKey?: string;
  entityType?: 'society' | 'farmer' | 'dairy' | 'bmc' | 'admin'; // For external auth
  schemaName?: string; // For external auth
}

// Generate JWT tokens
export const generateTokens = (user: JWTPayload) => {
  const payload = {
    id: user.id,
    uid: user.uid,
    email: user.email,
    role: user.role,
    dbKey: user.dbKey,
    entityType: user.entityType,
    schemaName: user.schemaName
  };

  const token = jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: '7d',
    issuer: 'poornasree-equipments-cloud',
    audience: 'psr-client'
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET as string, {
    expiresIn: '30d',
    issuer: 'poornasree-equipments-cloud',
    audience: 'psr-client'
  });

  return { token, refreshToken };
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string, {
      issuer: 'poornasree-equipments-cloud',
      audience: 'psr-client'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET as string, {
      issuer: 'poornasree-equipments-cloud',
      audience: 'psr-client'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
};

// Generate random token
export const generateRandomToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Generate OTP
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// Hash token for database storage (simple hash for edge compatibility)
export const hashToken = (token: string): string => {
  // Simple hash function for edge runtime compatibility
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

// Role hierarchy checker
export const canManageRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 0,
    [UserRole.ADMIN]: 1,
    [UserRole.DAIRY]: 2,
    [UserRole.BMC]: 3,
    [UserRole.SOCIETY]: 4,
    [UserRole.FARMER]: 5
  };

  return roleHierarchy[userRole] < roleHierarchy[targetRole];
};

// Get allowed roles for user
export const getAllowedRoles = (userRole: UserRole): UserRole[] => {
  const allRoles = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.DAIRY,
    UserRole.BMC,
    UserRole.SOCIETY,
    UserRole.FARMER
  ];

  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 0,
    [UserRole.ADMIN]: 1,
    [UserRole.DAIRY]: 2,
    [UserRole.BMC]: 3,
    [UserRole.SOCIETY]: 4,
    [UserRole.FARMER]: 5
  };

  const userLevel = roleHierarchy[userRole];
  return allRoles.filter(role => roleHierarchy[role] > userLevel);
};

// Check if user is super admin
export const isSuperAdmin = (user: { email?: string; role?: UserRole }): boolean => {
  const superAdminEmail = process.env.SUPER_ADMIN_USERNAME || 'admin';
  return (
    user.email === superAdminEmail || 
    user.role === UserRole.SUPER_ADMIN
  );
};

// Validate password strength
export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate secure session ID
export const generateSessionId = (): string => {
  return generateRandomToken(64);
};

const authUtils = {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
  generateRandomToken,
  generateOTP,
  hashToken,
  canManageRole,
  getAllowedRoles,
  isSuperAdmin,
  validatePassword,
  generateSessionId
};

export default authUtils;