import { NextRequest, NextResponse } from 'next/server';
import { requestLogger } from '@/lib/monitoring/requestLogger';

/**
 * GET /api/superadmin/monitoring/stats
 * Get aggregated statistics for monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: {
      since?: Date;
      category?: string;
    } = {};
    
    const since = searchParams.get('since');
    if (since) filters.since = new Date(since);
    
    const category = searchParams.get('category');
    if (category) filters.category = category;

    // Get stats
    const stats = requestLogger.getStats(filters);

    // Get active listeners count
    const activeListeners = requestLogger.getListenersCount();

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        activeListeners,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching monitoring stats:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
