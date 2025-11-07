import { NextRequest, NextResponse } from 'next/server';
import { requestLogger } from '@/lib/monitoring/requestLogger';

interface RequestFilters {
  category?: string;
  dbKey?: string;
  societyId?: string;
  limit?: number;
  since?: Date;
}

/**
 * GET /api/superadmin/monitoring/requests
 * Get recent API requests with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: RequestFilters = {};
    
    const category = searchParams.get('category');
    if (category) filters.category = category;
    
    const dbKey = searchParams.get('dbKey');
    if (dbKey) filters.dbKey = dbKey;
    
    const societyId = searchParams.get('societyId');
    if (societyId) filters.societyId = societyId;
    
    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit, 10);
    
    const since = searchParams.get('since');
    if (since) filters.since = new Date(since);

    // Get requests
    const requests = requestLogger.getRecent(filters);

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching monitoring requests:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/superadmin/monitoring/requests
 * Clear all request logs
 */
export async function DELETE() {
  try {
    requestLogger.clear();
    
    return NextResponse.json({
      success: true,
      message: 'Request logs cleared',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error clearing request logs:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
