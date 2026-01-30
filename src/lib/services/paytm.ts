/**
 * Paytm Integration Service
 * Handles Paytm Payout API integration for farmer payments
 * Each admin has their own Paytm merchant credentials
 */

import crypto from 'crypto';

interface PaytmConfig {
  merchantId: string;
  merchantKey: string;
  website: string;
  industryType: string;
  channelId: string;
  callbackUrl: string | null;
}

interface PayoutRequest {
  orderId: string;
  amount: number;
  beneficiaryAccount: string; // Phone number for Paytm wallet
  beneficiaryIFSC?: string; // For bank transfers
  purpose: string;
  remarks?: string;
}

interface PayoutResponse {
  success: boolean;
  transactionId?: string;
  orderId: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  message: string;
  responseCode?: string;
  gatewayResponse?: any;
}

export class PaytmService {
  private config: PaytmConfig;
  private baseUrl: string;

  constructor(config: PaytmConfig) {
    this.config = config;
    // Use production URL if website is DEFAULT, otherwise staging
    this.baseUrl = config.website === 'DEFAULT' 
      ? 'https://securegw.paytm.in'
      : 'https://securegw-stage.paytm.in';
  }

  /**
   * Generate checksum for Paytm API requests
   * @param params Request parameters
   * @returns Checksum string
   */
  private generateChecksum(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    const paramString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const checksum = crypto
      .createHmac('sha256', this.config.merchantKey)
      .update(paramString)
      .digest('hex');

    return checksum;
  }

  /**
   * Verify checksum from Paytm callback
   * @param params Response parameters
   * @param receivedChecksum Checksum from Paytm
   * @returns Boolean indicating if checksum is valid
   */
  private verifyChecksum(params: Record<string, any>, receivedChecksum: string): boolean {
    const calculatedChecksum = this.generateChecksum(params);
    return calculatedChecksum === receivedChecksum;
  }

  /**
   * Initiate payout to beneficiary
   * @param request Payout request details
   * @returns Payout response
   */
  async initiatePayout(request: PayoutRequest): Promise<PayoutResponse> {
    try {
      const params = {
        MID: this.config.merchantId,
        ORDERID: request.orderId,
        TXNAMOUNT: request.amount.toFixed(2),
        BENEFICIARY_ACCOUNT: request.beneficiaryAccount,
        BENEFICIARY_IFSC: request.beneficiaryIFSC || '',
        PURPOSE: request.purpose,
        REMARKS: request.remarks || '',
        WEBSITE: this.config.website,
        INDUSTRY_TYPE_ID: this.config.industryType,
        CHANNEL_ID: this.config.channelId,
        CALLBACK_URL: this.config.callbackUrl || ''
      };

      const checksum = this.generateChecksum(params);

      const response = await fetch(`${this.baseUrl}/order/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...params,
          CHECKSUMHASH: checksum
        })
      });

      const data = await response.json();

      // Parse Paytm response
      if (data.STATUS === 'TXN_SUCCESS' || data.RESPCODE === '01') {
        return {
          success: true,
          transactionId: data.TXNID,
          orderId: request.orderId,
          status: 'success',
          message: 'Payout initiated successfully',
          responseCode: data.RESPCODE,
          gatewayResponse: data
        };
      } else if (data.STATUS === 'PENDING' || data.RESPCODE === '400') {
        return {
          success: true,
          transactionId: data.TXNID,
          orderId: request.orderId,
          status: 'pending',
          message: 'Payout is pending',
          responseCode: data.RESPCODE,
          gatewayResponse: data
        };
      } else {
        return {
          success: false,
          orderId: request.orderId,
          status: 'failed',
          message: data.RESPMSG || 'Payout failed',
          responseCode: data.RESPCODE,
          gatewayResponse: data
        };
      }
    } catch (error) {
      console.error('❌ Paytm payout error:', error);
      return {
        success: false,
        orderId: request.orderId,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Payout request failed'
      };
    }
  }

  /**
   * Check payout status
   * @param orderId Order ID to check
   * @returns Payout status response
   */
  async checkPayoutStatus(orderId: string): Promise<PayoutResponse> {
    try {
      const params = {
        MID: this.config.merchantId,
        ORDERID: orderId
      };

      const checksum = this.generateChecksum(params);

      const response = await fetch(`${this.baseUrl}/order/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...params,
          CHECKSUMHASH: checksum
        })
      });

      const data = await response.json();

      let status: 'pending' | 'processing' | 'success' | 'failed' = 'pending';
      if (data.STATUS === 'TXN_SUCCESS') {
        status = 'success';
      } else if (data.STATUS === 'TXN_FAILURE') {
        status = 'failed';
      } else if (data.STATUS === 'PENDING') {
        status = 'processing';
      }

      return {
        success: data.STATUS === 'TXN_SUCCESS',
        transactionId: data.TXNID,
        orderId: orderId,
        status: status,
        message: data.RESPMSG || 'Status retrieved',
        responseCode: data.RESPCODE,
        gatewayResponse: data
      };
    } catch (error) {
      console.error('❌ Paytm status check error:', error);
      return {
        success: false,
        orderId: orderId,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  /**
   * Handle Paytm callback
   * @param callbackData Data received from Paytm callback
   * @returns Processed callback response
   */
  async handleCallback(callbackData: Record<string, any>): Promise<PayoutResponse> {
    try {
      const { CHECKSUMHASH, ...params } = callbackData;

      // Verify checksum
      if (!this.verifyChecksum(params, CHECKSUMHASH)) {
        return {
          success: false,
          orderId: params.ORDERID,
          status: 'failed',
          message: 'Invalid checksum - possible tampering'
        };
      }

      let status: 'pending' | 'processing' | 'success' | 'failed' = 'pending';
      if (params.STATUS === 'TXN_SUCCESS') {
        status = 'success';
      } else if (params.STATUS === 'TXN_FAILURE') {
        status = 'failed';
      } else if (params.STATUS === 'PENDING') {
        status = 'processing';
      }

      return {
        success: params.STATUS === 'TXN_SUCCESS',
        transactionId: params.TXNID,
        orderId: params.ORDERID,
        status: status,
        message: params.RESPMSG || 'Callback processed',
        responseCode: params.RESPCODE,
        gatewayResponse: params
      };
    } catch (error) {
      console.error('❌ Paytm callback error:', error);
      return {
        success: false,
        orderId: callbackData.ORDERID || 'unknown',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Callback processing failed'
      };
    }
  }

  /**
   * Validate beneficiary account
   * @param phoneNumber Phone number to validate
   * @returns Boolean indicating if valid
   */
  validateBeneficiaryAccount(phoneNumber: string): boolean {
    // Paytm wallet requires 10-digit Indian mobile number
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Generate unique order ID
   * @param prefix Optional prefix
   * @returns Unique order ID
   */
  static generateOrderId(prefix: string = 'PSR'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}_${timestamp}_${random}`;
  }
}

/**
 * Create Paytm service instance from admin settings
 * @param settings Payment settings from database
 * @returns PaytmService instance or null if not configured
 */
export function createPaytmService(settings: {
  paytm_merchant_id: string | null;
  paytm_merchant_key: string | null;
  paytm_website: string;
  paytm_industry_type: string;
  paytm_channel_id: string;
  paytm_callback_url: string | null;
  paytm_enabled: 'YES' | 'NO';
}): PaytmService | null {
  // Check if Paytm is enabled and credentials are available
  if (
    settings.paytm_enabled !== 'YES' ||
    !settings.paytm_merchant_id ||
    !settings.paytm_merchant_key
  ) {
    return null;
  }

  const config: PaytmConfig = {
    merchantId: settings.paytm_merchant_id,
    merchantKey: settings.paytm_merchant_key,
    website: settings.paytm_website,
    industryType: settings.paytm_industry_type,
    channelId: settings.paytm_channel_id,
    callbackUrl: settings.paytm_callback_url
  };

  return new PaytmService(config);
}
