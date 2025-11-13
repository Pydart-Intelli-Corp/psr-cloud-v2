/**
 * ESP32-Friendly Response Helper
 * 
 * Utilities for creating responses compatible with ESP32 WiFi modules
 * 
 * Key Requirements:
 * - Always return HTTP 200 status (even for errors)
 * - No quotes around response text for simple messages
 * - Specific headers: charset=utf-8, Content-Length, Connection: close
 * - Cache-Control: no-cache for fresh data
 */

export class ESP32ResponseHelper {
  /**
   * Create ESP32-friendly success response
   * @param data - Response data (will be quoted by default)
   * @param options - Additional options
   */
  static createResponse(
    data: string, 
    options?: {
      contentType?: string;
      addQuotes?: boolean;
      additionalHeaders?: Record<string, string>;
    }
  ): Response {
    const { 
      contentType = 'text/plain; charset=utf-8',
      addQuotes = true, // Changed default to true
      additionalHeaders = {}
    } = options || {};

    // Wrap response in double quotes by default for ESP32 compatibility
    const responseBody = addQuotes ? `"${data}"` : data;
    const contentLength = Buffer.byteLength(responseBody, 'utf8');

    return new Response(responseBody, {
      status: 200, // Always 200 for ESP32 compatibility
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength.toString(),
        'Connection': 'close',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        ...additionalHeaders
      }
    });
  }

  /**
   * Create ESP32-friendly error response (still returns 200 status)
   */
  static createErrorResponse(errorMessage: string): Response {
    return ESP32ResponseHelper.createResponse(errorMessage);
  }

  /**
   * Create success response with structured data (pipe-delimited format)
   */
  static createDataResponse(data: string): Response {
    return ESP32ResponseHelper.createResponse(data, {
      additionalHeaders: {
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  /**
   * Create CSV response with proper headers
   */
  static createCSVResponse(csvData: string, filename: string = 'data.csv'): Response {
    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(csvData, 'utf8').toString(),
        'Connection': 'close',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  /**
   * Create CORS preflight response
   */
  static createCORSResponse(): Response {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  /**
   * Extract InputString from request (handles malformed URLs from ESP32)
   */
  static async extractInputString(request: Request): Promise<string | null> {
    let inputString: string | null = null;

    if (request.method === 'GET') {
      const { searchParams } = new URL(request.url);
      inputString = searchParams.get('InputString');

      // Handle malformed URLs from ESP32 (e.g., "?,InputString=...")
      if (!inputString) {
        // Check if any param key contains "InputString" (handles ",InputString" case)
        for (const [key, value] of searchParams.entries()) {
          if (key.includes('InputString')) {
            inputString = value;
            console.log(`   ✅ ESP32: Found InputString in malformed param key: "${key}"`);
            break;
          }
        }
      }
    } else if (request.method === 'POST') {
      try {
        const body = await request.json();
        inputString = body.InputString || null;
      } catch {
        try {
          const formData = await request.formData();
          inputString = formData.get('InputString') as string || null;
        } catch (error) {
          console.log(`❌ ESP32: Failed to parse POST body:`, error);
        }
      }
    }

    return inputString;
  }

  /**
   * Filter line ending characters from InputString
   * ESP32 sends $0D, $0A, $0D$0A patterns
   */
  static filterLineEndings(inputString: string): string {
    if (!inputString) return inputString;

    const original = inputString;
    
    // Remove common line ending patterns
    const filtered = inputString
      .replace(/\$0D\$0A/g, '')  // CRLF
      .replace(/\$0D/g, '')      // CR
      .replace(/\$0A/g, '')      // LF
      .replace(/\r\n/g, '')      // Actual CRLF
      .replace(/\r/g, '')        // Actual CR
      .replace(/\n/g, '');       // Actual LF
    
    if (original !== filtered) {
      console.log(`🧹 ESP32: Filtered line endings: "${original}" -> "${filtered}"`);
    }

    return filtered;
  }

  /**
   * Log ESP32 request details for debugging
   */
  static logRequest(request: Request, dbKey: string, inputString: string | null): void {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📡 ESP32 External API Request:`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log(`   Method: ${request.method}`);
    console.log(`   Full URL: ${request.url}`);
    console.log(`   DB Key: "${dbKey}"`);
    console.log(`   InputString: "${inputString}"`);
    console.log(`   Headers:`, {
      'user-agent': request.headers.get('user-agent'),
      'content-type': request.headers.get('content-type'),
      'connection': request.headers.get('connection'),
      'host': request.headers.get('host')
    });
    console.log(`${'='.repeat(80)}\n`);
  }
}
