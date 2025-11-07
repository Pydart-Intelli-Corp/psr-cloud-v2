import { NextRequest } from 'next/server';
import { requestLogger } from '@/lib/monitoring/requestLogger';

/**
 * GET /api/superadmin/monitoring/stream
 * Server-Sent Events (SSE) stream for real-time monitoring
 */
export async function GET(request: NextRequest) {
  console.log('🎯 SSE endpoint called');
  
  // Set up SSE response
  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      console.log('🎯 SSE stream started');
      
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // Subscribe to request logger
      console.log('🎯 Subscribing to request logger...');
      const unsubscribe = requestLogger.subscribe((apiRequest) => {
        try {
          console.log('🎯 SSE: Received request to broadcast:', apiRequest.id);
          const message = `data: ${JSON.stringify({ type: 'request', data: apiRequest })}\n\n`;
          controller.enqueue(encoder.encode(message));
          console.log('🎯 SSE: Message sent successfully');
        } catch (error) {
          console.error('❌ Error sending SSE message:', error);
        }
      });
      console.log('🎯 Subscribed to request logger, active listeners:', requestLogger.getListenersCount());

      // Send heartbeat every 15 seconds (reduced from 30)
      const heartbeatInterval = setInterval(() => {
        try {
          console.log('💓 Sending heartbeat...');
          const heartbeat = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(encoder.encode(heartbeat));
        } catch (error) {
          console.error('❌ Error sending heartbeat:', error);
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // Store cleanup function
      cleanup = () => {
        console.log('🎯 SSE connection closed, cleaning up...');
        clearInterval(heartbeatInterval);
        unsubscribe();
        console.log('🎯 After cleanup, active listeners:', requestLogger.getListenersCount());
      };

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        if (cleanup) cleanup();
        try {
          controller.close();
        } catch {
          // Controller might already be closed
        }
      });
    },
    cancel() {
      console.log('🎯 Stream cancelled');
      if (cleanup) cleanup();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
