/**
 * Request Logger - Tracks all API requests for live monitoring
 */

export interface APIRequest {
  id: string;
  timestamp: Date;
  method: string;
  path: string;
  endpoint: string;
  dbKey?: string;
  societyId?: string;
  machineId?: string;
  inputString?: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  error?: string;
  category: 'external' | 'admin' | 'farmer' | 'machine' | 'auth' | 'other';
}

// Use global scope to persist across Next.js hot reloads in dev mode
declare global {
  var __requestLog: APIRequest[] | undefined;
  var __requestListeners: Set<(request: APIRequest) => void> | undefined;
}

// In-memory store for recent requests (last 1000)
const requestLog: APIRequest[] = globalThis.__requestLog ?? [];
const MAX_LOG_SIZE = 1000;

// Listeners for real-time updates
const listeners: Set<(request: APIRequest) => void> = globalThis.__requestListeners ?? new Set();

// Persist in global scope to survive hot reloads
globalThis.__requestLog = requestLog;
globalThis.__requestListeners = listeners;

export const requestLogger = {
  /**
   * Log a new API request
   */
  log(request: Omit<APIRequest, 'id' | 'timestamp'>): APIRequest {
    const logEntry: APIRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };

    // Add to log
    requestLog.unshift(logEntry);
    
    // Trim to max size
    if (requestLog.length > MAX_LOG_SIZE) {
      requestLog.splice(MAX_LOG_SIZE);
    }

    console.log(`📊 Request logged - Total: ${requestLog.length}, Listeners: ${listeners.size}`);
    console.log(`   ID: ${logEntry.id}, Endpoint: ${logEntry.endpoint}, Status: ${logEntry.statusCode}`);

    // Notify listeners
    listeners.forEach(listener => {
      try {
        console.log('   📤 Notifying listener...');
        listener(logEntry);
      } catch (error) {
        console.error('Error notifying listener:', error);
      }
    });

    return logEntry;
  },

  /**
   * Get recent requests with optional filters
   */
  getRecent(filters?: {
    category?: string;
    dbKey?: string;
    societyId?: string;
    limit?: number;
    since?: Date;
  }): APIRequest[] {
    let filtered = [...requestLog];

    if (filters?.category) {
      filtered = filtered.filter(r => r.category === filters.category);
    }

    if (filters?.dbKey) {
      filtered = filtered.filter(r => r.dbKey === filters.dbKey);
    }

    if (filters?.societyId) {
      filtered = filtered.filter(r => r.societyId === filters.societyId);
    }

    if (filters?.since) {
      filtered = filtered.filter(r => r.timestamp >= filters.since!);
    }

    const limit = filters?.limit || 100;
    return filtered.slice(0, limit);
  },

  /**
   * Get statistics
   */
  getStats(filters?: { since?: Date; category?: string }): {
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byEndpoint: Record<string, number>;
    bySociety: Record<string, number>;
    byDbKey: Record<string, number>;
    avgResponseTime: number;
    errorRate: number;
  } {
    let requests = [...requestLog];

    if (filters?.since) {
      requests = requests.filter(r => r.timestamp >= filters.since!);
    }

    if (filters?.category) {
      requests = requests.filter(r => r.category === filters.category);
    }

    const stats = {
      total: requests.length,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byEndpoint: {} as Record<string, number>,
      bySociety: {} as Record<string, number>,
      byDbKey: {} as Record<string, number>,
      avgResponseTime: 0,
      errorRate: 0,
    };

    let totalResponseTime = 0;
    let errorCount = 0;

    requests.forEach(req => {
      // By category
      stats.byCategory[req.category] = (stats.byCategory[req.category] || 0) + 1;

      // By status
      const statusGroup = `${Math.floor(req.statusCode / 100)}xx`;
      stats.byStatus[statusGroup] = (stats.byStatus[statusGroup] || 0) + 1;

      // By endpoint
      stats.byEndpoint[req.endpoint] = (stats.byEndpoint[req.endpoint] || 0) + 1;

      // By society
      if (req.societyId) {
        stats.bySociety[req.societyId] = (stats.bySociety[req.societyId] || 0) + 1;
      }

      // By DB Key
      if (req.dbKey) {
        stats.byDbKey[req.dbKey] = (stats.byDbKey[req.dbKey] || 0) + 1;
      }

      // Response time
      totalResponseTime += req.responseTime;

      // Errors
      if (req.statusCode >= 400) {
        errorCount++;
      }
    });

    stats.avgResponseTime = requests.length > 0 ? totalResponseTime / requests.length : 0;
    stats.errorRate = requests.length > 0 ? (errorCount / requests.length) * 100 : 0;

    return stats;
  },

  /**
   * Subscribe to real-time updates
   */
  subscribe(listener: (request: APIRequest) => void): () => void {
    listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Clear all logs
   */
  clear(): void {
    requestLog.length = 0;
  },

  /**
   * Get active listeners count
   */
  getListenersCount(): number {
    return listeners.size;
  }
};

/**
 * Helper to categorize endpoints
 */
export function categorizeEndpoint(path: string): APIRequest['category'] {
  if (path.includes('/api/superadmin') || path.includes('/api/admin/auth')) {
    return 'auth';
  }
  if (path.match(/\/api\/[A-Z0-9]+\//)) {
    return 'external';
  }
  if (path.includes('/api/user/farmer')) {
    return 'farmer';
  }
  if (path.includes('/api/user/machine') || path.includes('/api/admin/machine')) {
    return 'machine';
  }
  if (path.includes('/api/admin')) {
    return 'admin';
  }
  return 'other';
}

/**
 * Helper to extract metadata from request
 */
export function extractRequestMetadata(url: string, body?: unknown): {
  dbKey?: string;
  societyId?: string;
  machineId?: string;
  inputString?: string;
} {
  const metadata: ReturnType<typeof extractRequestMetadata> = {};

  // Extract DB Key from URL path like /api/BAB1568/...
  const dbKeyMatch = url.match(/\/api\/([A-Z0-9]+)\//);
  if (dbKeyMatch) {
    metadata.dbKey = dbKeyMatch[1];
  }

  // Extract from query params
  const urlObj = new URL(url, 'http://dummy.com');
  const inputString = urlObj.searchParams.get('InputString');
  
  if (inputString) {
    metadata.inputString = inputString;
    
    // Parse InputString: societyId|machineType|version|machineId[|pageNumber]
    const parts = inputString.split('|');
    if (parts.length >= 4) {
      metadata.societyId = parts[0].replace(/^S-/, '');
      metadata.machineId = parts[3];
    }
  }

  // Extract from body
  if (body && typeof body === 'object') {
    const bodyObj = body as Record<string, unknown>;
    if (bodyObj.InputString && typeof bodyObj.InputString === 'string') {
      metadata.inputString = bodyObj.InputString;
      const parts = bodyObj.InputString.split('|');
      if (parts.length >= 4) {
        metadata.societyId = parts[0].replace(/^S-/, '');
        metadata.machineId = parts[3];
      }
    }

    if (bodyObj.societyId) {
      metadata.societyId = String(bodyObj.societyId);
    }

    if (bodyObj.machineId) {
      metadata.machineId = String(bodyObj.machineId);
    }
  }

  return metadata;
}
