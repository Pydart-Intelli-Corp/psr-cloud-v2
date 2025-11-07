/**
 * Response formatting utilities for external APIs
 */
export class ResponseFormatter {
  /**
   * Format farmer data for CSV download
   */
  static formatFarmerCSV(farmers: Array<{
    id: number;
    farmer_id: string;
    name: string;
    phone: string | null;
    sms_enabled: 'ON' | 'OFF' | null;
    bonus: number | null;
  }>): string {
    const csvHeader = 'ID,RF-ID,NAME,MOBILE,SMS,BONUS\n';
    
    const csvData = farmers.map(farmer => {
      const phone = farmer.phone || '';
      const smsEnabled = farmer.sms_enabled || 'OFF';
      
      // Convert bonus to number and format without decimal places (matching sample format)
      let bonus = '0';
      if (farmer.bonus !== null && farmer.bonus !== undefined) {
        const bonusNum = Number(farmer.bonus);
        bonus = isNaN(bonusNum) ? '0' : Math.round(bonusNum).toString();
      }
      
      // Escape CSV values that contain commas or quotes
      const escapeCsv = (value: string) => {
        if (value.includes(',') || value.includes('"')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };
      
      return `${farmer.id},${escapeCsv(farmer.farmer_id)},${escapeCsv(farmer.name)},${escapeCsv(phone)},${smsEnabled},${bonus}`;
    }).join('\n');

    return csvHeader + csvData;
  }

  /**
   * Format farmer data for pagination response (pipe-delimited)
   */
  static formatFarmerPagination(farmers: Array<{
    id: number;
    farmer_id: string;
    name: string;
    phone: string | null;
    sms_enabled: 'ON' | 'OFF' | null;
    bonus: number | null;
  }>): string {
    // Format: id|farmer_id|name|phone|sms_enabled|bonus||
    // Each farmer separated by ||, fields separated by |
    const responseData = farmers.map(farmer => {
      const phone = farmer.phone || '';
      const smsEnabled = farmer.sms_enabled || 'OFF';
      
      // Convert bonus to number and format with 2 decimal places
      let bonus = '0.00';
      if (farmer.bonus !== null && farmer.bonus !== undefined) {
        const bonusNum = Number(farmer.bonus);
        bonus = isNaN(bonusNum) ? '0.00' : bonusNum.toFixed(2);
      }
      
      return `${farmer.id}|${farmer.farmer_id}|${farmer.name}|${phone}|${smsEnabled}|${bonus}`;
    }).join('||');

    return responseData;
  }

  /**
   * Format machine password response
   */
  static formatMachinePassword(
    passwordType: { isUser: boolean; isSupervisor: boolean },
    password: string
  ): string {
    if (passwordType.isUser) {
      return `PU|${password}`;
    } else if (passwordType.isSupervisor) {
      return `PS|${password}`;
    }
    
    throw new Error('Invalid password type for formatting');
  }

  /**
   * Create standard success response with proper headers
   */
  static createSuccessResponse(
    data: string, 
    contentType: 'text/plain' | 'text/csv' = 'text/plain',
    additionalHeaders?: Record<string, string>
  ): Response {
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...additionalHeaders
    };

    // Add CSV-specific headers
    if (contentType === 'text/csv') {
      headers['Content-Disposition'] = 'attachment; filename="FarmerDetails.csv"';
    }

    return new Response(`"${data}"`, {
      status: 200,
      headers
    });
  }

  /**
   * Create standard error response
   */
  static createErrorResponse(errorMessage: string): Response {
    return new Response(`"${errorMessage}"`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
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
   * Wrap response data in quotes (external API standard)
   */
  static wrapInQuotes(data: string): string {
    return `"${data}"`;
  }

  /**
   * Log response details for debugging
   */
  static logResponse(
    endpointName: string,
    dataType: string,
    itemCount: number,
    responsePreview?: string
  ): void {
    console.log(`📤 ${endpointName}: Returning ${dataType} for ${itemCount} items`);
    
    if (responsePreview) {
      const preview = responsePreview.length > 100 
        ? `${responsePreview.substring(0, 100)}...` 
        : responsePreview;
      console.log(`📤 Response preview: ${preview}`);
    }
  }

  /**
   * Log CSV response details
   */
  static logCSVResponse(endpointName: string, itemCount: number, csvSize: number): void {
    console.log(`📁 ${endpointName}: Returning CSV data for ${itemCount} items`);
    console.log(`📁 CSV size: ${csvSize} characters`);
  }
}