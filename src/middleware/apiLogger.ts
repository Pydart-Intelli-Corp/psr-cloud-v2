import { NextRequest, NextResponse } from 'next/server';
import { requestLogger, categorizeEndpoint, extractRequestMetadata } from '@/lib/monitoring/requestLogger';

/**
 * Middleware to log all API requests
 */
export async function logAPIRequest(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Execute the handler
    const response = await handler();
    const endTime = Date.now();
    
    // Extract metadata
    const metadata = extractRequestMetadata(request.url, await getRequestBody(request));
    
    // Log the request
    requestLogger.log({
      method: request.method,
      path: new URL(request.url).pathname,
      endpoint: getEndpointName(request.url),
      dbKey: metadata.dbKey,
      societyId: metadata.societyId,
      machineId: metadata.machineId,
      inputString: metadata.inputString,
      statusCode: response.status,
      responseTime: endTime - startTime,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: getClientIP(request),
      category: categorizeEndpoint(new URL(request.url).pathname),
    });
    
    return response;
  } catch (error) {
    const endTime = Date.now();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log the error
    requestLogger.log({
      method: request.method,
      path: new URL(request.url).pathname,
      endpoint: getEndpointName(request.url),
      statusCode: 500,
      responseTime: endTime - startTime,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: getClientIP(request),
      error: errorMessage,
      category: categorizeEndpoint(new URL(request.url).pathname),
    });
    
    throw error;
  }
}

/**
 * Get request body safely
 */
async function getRequestBody(request: NextRequest): Promise<unknown> {
  try {
    // Clone the request to avoid consuming the body
    const cloned = request.clone();
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return await cloned.json();
    }
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await cloned.formData();
      return Object.fromEntries(formData.entries());
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Get human-readable endpoint name
 */
function getEndpointName(url: string): string {
  const pathname = new URL(url).pathname;
  
  // Remove /api/ prefix
  let endpoint = pathname.replace(/^\/api\//, '');
  
  // Replace DB keys with placeholder
  endpoint = endpoint.replace(/^[A-Z0-9]+\//, '[db-key]/');
  
  // Shorten common patterns
  endpoint = endpoint
    .replace('/FarmerInfo/GetLatestFarmerInfo', '/FarmerInfo')
    .replace('/user/farmer/upload', '/farmer/upload')
    .replace('/user/farmer', '/farmer')
    .replace('/user/machine', '/machine')
    .replace('/superadmin/auth/login', '/auth/login')
    .replace('/admin/auth/login', '/auth/login');
  
  return endpoint || 'root';
}
