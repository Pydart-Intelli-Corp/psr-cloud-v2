import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { createPaytmService, PaytmService } from '@/lib/services/paytm';
import { getNotificationService } from '@/lib/services/notifications';

/**
 * POST /api/admin/payment-transactions/process
 * Process payment to a farmer using configured payment method
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { farmer_id, amount, payment_method } = body;

    // Validate input
    if (!farmer_id || !amount || !payment_method) {
      return createErrorResponse('Missing required fields: farmer_id, amount, payment_method', 400);
    }

    if (amount <= 0) {
      return createErrorResponse('Amount must be greater than 0', 400);
    }

    await connectDB();
    const { sequelize, User } = await import('@/models').then(m => m.getModels());

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    const schemaName = `${admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${admin.dbKey.toLowerCase()}`;

    // Get payment settings
    const [settings] = await sequelize.query(`
      SELECT * FROM \`${schemaName}\`.\`admin_payment_settings\` LIMIT 1
    `);

    if (!Array.isArray(settings) || settings.length === 0) {
      return createErrorResponse('Payment settings not configured', 404);
    }

    const paymentSettings = settings[0] as any;

    // Get farmer details
    const [farmers] = await sequelize.query(`
      SELECT 
        f.id, f.farmer_id, f.farmeruid, f.name, 
        f.paytm_phone, f.upi_id, f.bank_account_number, f.ifsc_code,
        f.preferred_payment_mode,
        s.id as society_id, s.name as society_name
      FROM \`${schemaName}\`.\`farmers\` f
      LEFT JOIN \`${schemaName}\`.\`societies\` s ON f.society_id = s.id
      WHERE f.farmer_id = ?
      LIMIT 1
    `, { replacements: [farmer_id] });

    if (!Array.isArray(farmers) || farmers.length === 0) {
      return createErrorResponse('Farmer not found', 404);
    }

    const farmer = farmers[0] as any;

    // Generate unique transaction ID
    const transactionId = PaytmService.generateOrderId('PSR');

    // Process based on payment method
    let paymentResult: any = null;
    let paymentStatus = 'pending';
    let referenceNumber = null;

    if (payment_method === 'paytm') {
      // Check if Paytm is enabled
      if (paymentSettings.paytm_enabled !== 'YES') {
        return createErrorResponse('Paytm payments are not enabled', 400);
      }

      // Check if farmer has Paytm phone
      if (!farmer.paytm_phone) {
        return createErrorResponse('Farmer does not have Paytm phone number configured', 400);
      }

      // Create Paytm service
      const paytmService = createPaytmService(paymentSettings);
      if (!paytmService) {
        return createErrorResponse('Paytm service not configured properly', 500);
      }

      // Validate phone number
      if (!paytmService.validateBeneficiaryAccount(farmer.paytm_phone)) {
        return createErrorResponse('Invalid Paytm phone number', 400);
      }

      // Initiate payout
      paymentResult = await paytmService.initiatePayout({
        orderId: transactionId,
        amount: parseFloat(amount),
        beneficiaryAccount: farmer.paytm_phone,
        purpose: 'Milk payment',
        remarks: `Payment to ${farmer.name} (${farmer.farmeruid})`
      });

      paymentStatus = paymentResult.status;
      referenceNumber = paymentResult.transactionId || null;

    } else if (payment_method === 'upi') {
      // Check if UPI is enabled
      if (paymentSettings.upi_enabled !== 'YES') {
        return createErrorResponse('UPI payments are not enabled', 400);
      }

      if (!farmer.upi_id) {
        return createErrorResponse('Farmer does not have UPI ID configured', 400);
      }

      // For now, mark as pending - actual UPI integration would go here
      paymentStatus = 'pending';
      referenceNumber = `UPI_${transactionId}`;

    } else if (payment_method === 'bank_transfer') {
      // Check if bank transfer is enabled
      if (paymentSettings.bank_transfer_enabled !== 'YES') {
        return createErrorResponse('Bank transfer payments are not enabled', 400);
      }

      if (!farmer.bank_account_number || !farmer.ifsc_code) {
        return createErrorResponse('Farmer does not have bank details configured', 400);
      }

      // For now, mark as pending - actual bank transfer integration would go here
      paymentStatus = 'pending';
      referenceNumber = `BANK_${transactionId}`;

    } else if (payment_method === 'cash') {
      // Check if cash is enabled
      if (paymentSettings.cash_payment_enabled !== 'YES') {
        return createErrorResponse('Cash payments are not enabled', 400);
      }

      // Cash payments are immediately marked as success
      paymentStatus = 'success';
      referenceNumber = `CASH_${transactionId}`;

    } else {
      return createErrorResponse('Invalid payment method', 400);
    }

    // Create transaction record
    await sequelize.query(`
      INSERT INTO \`${schemaName}\`.\`payment_transactions\`
      (farmer_id, society_id, transaction_id, payment_method, amount, status, 
       payment_date, reference_number, notes, paytm_order_id, paytm_response)
      VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)
    `, {
      replacements: [
        farmer.id,
        farmer.society_id,
        transactionId,
        payment_method,
        amount,
        paymentStatus,
        referenceNumber,
        `Processed via ${payment_method}`,
        paymentResult?.orderId || null,
        paymentResult ? JSON.stringify(paymentResult.gatewayResponse) : null
      ]
    });

    // If payment is successful, update farmer's last payment
    if (paymentStatus === 'success') {
      await sequelize.query(`
        UPDATE \`${schemaName}\`.\`farmers\`
        SET last_payment_date = CURDATE(),
            last_payment_amount = ?,
            total_amount_paid = COALESCE(total_amount_paid, 0) + ?
        WHERE id = ?
      `, { replacements: [amount, amount, farmer.id] });
    }

    // Send notifications if enabled
    try {
      const notificationService = getNotificationService(paymentSettings);
      const notificationSettings = {
        whatsapp_enabled: paymentSettings.whatsapp_notifications === 'YES',
        sms_enabled: paymentSettings.sms_notifications === 'YES',
        email_enabled: paymentSettings.email_notifications === 'YES'
      };

      await notificationService.sendPaymentNotification(
        notificationSettings,
        {
          name: farmer.name,
          phone: farmer.phone || farmer.paytm_phone,
          email: farmer.email
        },
        {
          amount: parseFloat(amount),
          transactionId: transactionId,
          date: new Date().toISOString(),
          status: paymentStatus as 'success' | 'pending' | 'failed'
        }
      );
    } catch (notifError) {
      // Don't fail the payment if notifications fail
      console.error('⚠️ Notification error (non-critical):', notifError);
    }

    // Get the created transaction
    const [newTransaction] = await sequelize.query(`
      SELECT 
        pt.*,
        f.name as farmer_name,
        f.farmeruid as farmer_uid,
        s.name as society_name
      FROM \`${schemaName}\`.\`payment_transactions\` pt
      LEFT JOIN \`${schemaName}\`.\`farmers\` f ON pt.farmer_id = f.id
      LEFT JOIN \`${schemaName}\`.\`societies\` s ON pt.society_id = s.id
      WHERE pt.transaction_id = ?
      LIMIT 1
    `, { replacements: [transactionId] });

    return createSuccessResponse(
      `Payment ${paymentStatus === 'success' ? 'completed' : 'initiated'} successfully`,
      {
        transaction: newTransaction[0],
        paymentResult: paymentResult
      }
    );

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to process payment',
      500
    );
  }
}
