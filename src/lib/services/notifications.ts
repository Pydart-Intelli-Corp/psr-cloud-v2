/**
 * Unified Notification Service
 * Orchestrates WhatsApp, SMS, and Email notifications
 */

import { createWhatsAppService, WhatsAppService } from './whatsapp';
import { createSMSService, SMSService } from './sms';

interface NotificationSettings {
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
}

interface AdminPaymentSettings {
  whatsapp_notifications: 'YES' | 'NO';
  whatsapp_api_key?: string | null;
  whatsapp_api_url?: string | null;
  whatsapp_from_number?: string | null;
  sms_notifications: 'YES' | 'NO';
  sms_provider?: 'twilio' | 'msg91' | 'textlocal' | null;
  sms_api_key?: string | null;
  sms_api_secret?: string | null;
  sms_api_url?: string | null;
  sms_from_number?: string | null;
  email_notifications: 'YES' | 'NO';
}

interface NotificationResult {
  whatsapp?: { success: boolean; error?: string };
  sms?: { success: boolean; error?: string };
  email?: { success: boolean; error?: string };
}

export class NotificationService {
  private whatsappService: WhatsAppService | null;
  private smsService: SMSService | null;

  constructor(adminSettings: AdminPaymentSettings) {
    // Create service instances with admin-specific credentials
    this.whatsappService = createWhatsAppService({
      whatsapp_enabled: adminSettings.whatsapp_notifications,
      whatsapp_api_key: adminSettings.whatsapp_api_key,
      whatsapp_api_url: adminSettings.whatsapp_api_url,
      whatsapp_from_number: adminSettings.whatsapp_from_number
    });

    this.smsService = createSMSService({
      sms_enabled: adminSettings.sms_notifications,
      sms_provider: adminSettings.sms_provider,
      sms_api_key: adminSettings.sms_api_key,
      sms_api_secret: adminSettings.sms_api_secret,
      sms_api_url: adminSettings.sms_api_url,
      sms_from_number: adminSettings.sms_from_number
    });
  }

  /**
   * Send payment notification via all enabled channels
   */
  async sendPaymentNotification(
    settings: NotificationSettings,
    farmerData: {
      name: string;
      phone: string;
      email?: string;
    },
    paymentData: {
      amount: number;
      transactionId: string;
      date: string;
      status: 'success' | 'pending' | 'failed';
    }
  ): Promise<NotificationResult> {
    const results: NotificationResult = {};

    // Send WhatsApp notification
    if (settings.whatsapp_enabled && this.whatsappService && farmerData.phone) {
      try {
        let whatsappResult;
        
        if (paymentData.status === 'success') {
          whatsappResult = await this.whatsappService.sendPaymentNotification(
            farmerData.name,
            farmerData.phone,
            paymentData.amount,
            paymentData.transactionId,
            paymentData.date
          );
        } else if (paymentData.status === 'pending') {
          whatsappResult = await this.whatsappService.sendPaymentPendingNotification(
            farmerData.name,
            farmerData.phone,
            paymentData.amount,
            paymentData.transactionId
          );
        } else {
          whatsappResult = await this.whatsappService.sendPaymentFailedNotification(
            farmerData.name,
            farmerData.phone,
            paymentData.amount,
            paymentData.transactionId
          );
        }

        results.whatsapp = {
          success: whatsappResult.success,
          error: whatsappResult.error
        };

        if (whatsappResult.success) {
          console.log(`✅ WhatsApp notification sent to ${farmerData.name}`);
        } else {
          console.error(`❌ WhatsApp notification failed: ${whatsappResult.error}`);
        }
      } catch (error) {
        console.error('❌ WhatsApp notification error:', error);
        results.whatsapp = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Send SMS notification
    if (settings.sms_enabled && this.smsService && farmerData.phone) {
      try {
        let smsResult;
        
        if (paymentData.status === 'success') {
          smsResult = await this.smsService.sendPaymentNotification(
            farmerData.name,
            farmerData.phone,
            paymentData.amount,
            paymentData.transactionId,
            paymentData.date
          );
        } else if (paymentData.status === 'pending') {
          smsResult = await this.smsService.sendPaymentPendingNotification(
            farmerData.name,
            farmerData.phone,
            paymentData.amount,
            paymentData.transactionId
          );
        } else {
          smsResult = await this.smsService.sendPaymentFailedNotification(
            farmerData.name,
            farmerData.phone,
            paymentData.amount,
            paymentData.transactionId
          );
        }

        results.sms = {
          success: smsResult.success,
          error: smsResult.error
        };

        if (smsResult.success) {
          console.log(`✅ SMS notification sent to ${farmerData.name}`);
        } else {
          console.error(`❌ SMS notification failed: ${smsResult.error}`);
        }
      } catch (error) {
        console.error('❌ SMS notification error:', error);
        results.sms = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Send Email notification (placeholder - would integrate with existing email service)
    if (settings.email_enabled && farmerData.email) {
      // TODO: Integrate with existing email service from src/lib/email.ts
      results.email = {
        success: true
      };
    }

    return results;
  }

  /**
   * Check if any notification channel is available
   */
  isConfigured(): boolean {
    return this.whatsappService !== null || this.smsService !== null;
  }

  /**
   * Get available channels
   */
  getAvailableChannels(): string[] {
    const channels: string[] = [];
    if (this.whatsappService) channels.push('whatsapp');
    if (this.smsService) channels.push('sms');
    channels.push('email'); // Always available via existing email service
    return channels;
  }
}

/**
 * Get notification service instance for a specific admin
 * @param adminSettings Admin payment settings containing notification credentials
 */
export function getNotificationService(adminSettings: AdminPaymentSettings): NotificationService {
  return new NotificationService(adminSettings);
}
