/**
 * SMS Notification Service
 * Sends payment notifications via SMS
 * Uses Twilio SMS API or similar provider
 */

interface SMSConfig {
  apiKey: string;
  apiSecret?: string;
  apiUrl: string;
  fromNumber: string;
  provider: 'twilio' | 'msg91' | 'textlocal';
}

interface SMSMessage {
  to: string;
  message: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SMSService {
  private config: SMSConfig;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  /**
   * Send SMS message
   * @param message Message details
   * @returns Response with status
   */
  async sendMessage(message: SMSMessage): Promise<SMSResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(message.to);

      let response;
      
      if (this.config.provider === 'twilio') {
        response = await this.sendViaTwilio(formattedPhone, message.message);
      } else if (this.config.provider === 'msg91') {
        response = await this.sendViaMsg91(formattedPhone, message.message);
      } else if (this.config.provider === 'textlocal') {
        response = await this.sendViaTextLocal(formattedPhone, message.message);
      } else {
        return {
          success: false,
          error: 'Unsupported SMS provider'
        };
      }

      return response;
    } catch (error) {
      console.error('❌ SMS send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(to: string, message: string): Promise<SMSResponse> {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        From: this.config.fromNumber,
        To: to,
        Body: message
      })
    });

    const data = await response.json();

    if (response.ok && data.sid) {
      return { success: true, messageId: data.sid };
    }

    return { success: false, error: data.message || 'Failed to send SMS' };
  }

  /**
   * Send via MSG91 (popular in India)
   */
  private async sendViaMsg91(to: string, message: string): Promise<SMSResponse> {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': this.config.apiKey
      },
      body: JSON.stringify({
        sender: this.config.fromNumber,
        route: '4',
        country: '91',
        sms: [{
          message: message,
          to: [to]
        }]
      })
    });

    const data = await response.json();

    if (data.type === 'success') {
      return { success: true, messageId: data.request_id };
    }

    return { success: false, error: data.message || 'Failed to send SMS' };
  }

  /**
   * Send via TextLocal (UK/India)
   */
  private async sendViaTextLocal(to: string, message: string): Promise<SMSResponse> {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        apikey: this.config.apiKey,
        sender: this.config.fromNumber,
        numbers: to,
        message: message
      })
    });

    const data = await response.json();

    if (data.status === 'success') {
      return { success: true, messageId: data.message_id };
    }

    return { success: false, error: data.errors?.[0]?.message || 'Failed to send SMS' };
  }

  /**
   * Send payment success notification
   */
  async sendPaymentNotification(
    farmerName: string,
    phoneNumber: string,
    amount: number,
    transactionId: string,
    date: string
  ): Promise<SMSResponse> {
    const message = `Payment Received! Dear ${farmerName}, Your payment of Rs.${amount.toFixed(2)} has been processed. Transaction ID: ${transactionId}. Date: ${new Date(date).toLocaleDateString('en-IN')}. - Poornasree Equipments`;

    return this.sendMessage({
      to: phoneNumber,
      message: message
    });
  }

  /**
   * Send payment pending notification
   */
  async sendPaymentPendingNotification(
    farmerName: string,
    phoneNumber: string,
    amount: number,
    transactionId: string
  ): Promise<SMSResponse> {
    const message = `Payment Processing. Dear ${farmerName}, Your payment of Rs.${amount.toFixed(2)} is being processed. Transaction ID: ${transactionId}. You will receive confirmation soon. - Poornasree Equipments`;

    return this.sendMessage({
      to: phoneNumber,
      message: message
    });
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedNotification(
    farmerName: string,
    phoneNumber: string,
    amount: number,
    transactionId: string
  ): Promise<SMSResponse> {
    const message = `Payment Failed. Dear ${farmerName}, Your payment of Rs.${amount.toFixed(2)} could not be processed. Transaction ID: ${transactionId}. Please contact your dairy administrator. - Poornasree Equipments`;

    return this.sendMessage({
      to: phoneNumber,
      message: message
    });
  }

  /**
   * Format phone number
   */
  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    // Add India country code if not present
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    return '+' + cleaned;
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(cleaned) || phoneRegex.test(cleaned.slice(-10));
  }
}

/**
 * Create SMS service instance
 */
/**
 * Create SMS service instance from admin settings
 * @param settings Admin payment settings containing SMS credentials
 */
export function createSMSService(settings: {
  sms_enabled?: 'YES' | 'NO';
  sms_provider?: 'twilio' | 'msg91' | 'textlocal' | null;
  sms_api_key?: string | null;
  sms_api_secret?: string | null;
  sms_api_url?: string | null;
  sms_from_number?: string | null;
}): SMSService | null {
  // Check if SMS is enabled
  if (settings.sms_enabled !== 'YES') {
    return null;
  }

  const apiKey = settings.sms_api_key;
  const apiSecret = settings.sms_api_secret;
  const provider = settings.sms_provider || 'twilio';
  
  let apiUrl = settings.sms_api_url;
  let fromNumber = settings.sms_from_number;

  // Set defaults based on provider if not provided
  if (!apiUrl) {
    if (provider === 'twilio') {
      apiUrl = 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json';
    } else if (provider === 'msg91') {
      apiUrl = 'https://api.msg91.com/api/v5/flow/';
    } else if (provider === 'textlocal') {
      apiUrl = 'https://api.textlocal.in/send/';
    }
  }

  if (!fromNumber) {
    fromNumber = provider === 'msg91' ? 'PSREQP' : '+1234567890';
  }

  if (!apiKey) {
    console.warn('⚠️ SMS API key not configured for admin');
    return null;
  }

  return new SMSService({
    apiKey,
    apiSecret: apiSecret || undefined,
    apiUrl: apiUrl!,
    fromNumber: fromNumber!,
    provider
  });
}
