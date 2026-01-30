/**
 * WhatsApp Notification Service
 * Sends payment notifications via WhatsApp Business API
 * Uses Twilio WhatsApp API or similar provider
 */

interface WhatsAppConfig {
  apiKey: string;
  apiUrl: string;
  fromNumber: string;
}

interface WhatsAppMessage {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;

  constructor(config: WhatsAppConfig) {
    this.config = config;
  }

  /**
   * Send WhatsApp message
   * @param message Message details
   * @returns Response with status
   */
  async sendMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      // Format phone number for WhatsApp (remove spaces, add country code if needed)
      const formattedPhone = this.formatPhoneNumber(message.to);

      // Prepare request payload
      const payload = {
        from: this.config.fromNumber,
        to: formattedPhone,
        body: message.message
      };

      // Send request to WhatsApp API
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.sid) {
        return {
          success: true,
          messageId: data.sid
        };
      }

      return {
        success: false,
        error: data.message || 'Failed to send WhatsApp message'
      };
    } catch (error) {
      console.error('❌ WhatsApp send error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send payment success notification
   * @param farmerName Farmer's name
   * @param phoneNumber Farmer's phone number
   * @param amount Payment amount
   * @param transactionId Transaction ID
   * @param date Payment date
   * @returns Response status
   */
  async sendPaymentNotification(
    farmerName: string,
    phoneNumber: string,
    amount: number,
    transactionId: string,
    date: string
  ): Promise<WhatsAppResponse> {
    const message = `🎉 Payment Received!

Dear ${farmerName},

Your payment has been processed successfully.

💰 Amount: ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
📝 Transaction ID: ${transactionId}
📅 Date: ${new Date(date).toLocaleDateString('en-IN')}

Thank you for your continued partnership with Poornasree Equipments.

For support, contact your dairy administrator.`;

    return this.sendMessage({
      to: phoneNumber,
      message: message
    });
  }

  /**
   * Send payment pending notification
   * @param farmerName Farmer's name
   * @param phoneNumber Farmer's phone number
   * @param amount Payment amount
   * @param transactionId Transaction ID
   * @returns Response status
   */
  async sendPaymentPendingNotification(
    farmerName: string,
    phoneNumber: string,
    amount: number,
    transactionId: string
  ): Promise<WhatsAppResponse> {
    const message = `⏳ Payment Processing

Dear ${farmerName},

Your payment is being processed.

💰 Amount: ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
📝 Transaction ID: ${transactionId}

You will receive a confirmation once the payment is completed.

- Poornasree Equipments`;

    return this.sendMessage({
      to: phoneNumber,
      message: message
    });
  }

  /**
   * Send payment failed notification
   * @param farmerName Farmer's name
   * @param phoneNumber Farmer's phone number
   * @param amount Payment amount
   * @param transactionId Transaction ID
   * @returns Response status
   */
  async sendPaymentFailedNotification(
    farmerName: string,
    phoneNumber: string,
    amount: number,
    transactionId: string
  ): Promise<WhatsAppResponse> {
    const message = `❌ Payment Failed

Dear ${farmerName},

We regret to inform you that your payment could not be processed.

💰 Amount: ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
📝 Transaction ID: ${transactionId}

Please contact your dairy administrator for assistance.

- Poornasree Equipments`;

    return this.sendMessage({
      to: phoneNumber,
      message: message
    });
  }

  /**
   * Format phone number for WhatsApp
   * @param phone Phone number
   * @returns Formatted phone number with country code
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // Add India country code if not present
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    return `whatsapp:+${cleaned}`;
  }

  /**
   * Validate phone number
   * @param phone Phone number
   * @returns Boolean indicating if valid
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleaned = phone.replace(/\D/g, '');
    return phoneRegex.test(cleaned) || phoneRegex.test(cleaned.slice(-10));
  }
}

/**
 * Create WhatsApp service instance from admin settings
 * @param settings Admin payment settings containing WhatsApp credentials
 */
export function createWhatsAppService(settings: {
  whatsapp_enabled?: 'YES' | 'NO';
  whatsapp_api_key?: string | null;
  whatsapp_api_url?: string | null;
  whatsapp_from_number?: string | null;
}): WhatsAppService | null {
  // Check if WhatsApp is enabled
  if (settings.whatsapp_enabled !== 'YES') {
    return null;
  }

  const apiKey = settings.whatsapp_api_key;
  const apiUrl = settings.whatsapp_api_url || 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json';
  const fromNumber = settings.whatsapp_from_number || 'whatsapp:+14155238886';

  if (!apiKey) {
    console.warn('⚠️ WhatsApp API key not configured for admin');
    return null;
  }

  return new WhatsAppService({
    apiKey,
    apiUrl,
    fromNumber
  });
}
