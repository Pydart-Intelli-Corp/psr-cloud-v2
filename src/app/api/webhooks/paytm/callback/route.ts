import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { createPaytmService } from '@/lib/services/paytm';

/**
 * POST /api/webhooks/paytm/callback
 * Handle Paytm payment callback
 * This endpoint is called by Paytm after payment processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ORDERID, MID, ...otherParams } = body;

    if (!ORDERID || !MID) {
      return createErrorResponse('Invalid callback data', 400);
    }

    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    // Find the transaction by order ID across all schemas
    // We need to find which admin's transaction this is
    const [transactions] = await sequelize.query(`
      SELECT 
        pt.id,
        pt.transaction_id,
        pt.farmer_id,
        pt.society_id,
        pt.amount,
        pt.status,
        u.id as admin_id,
        u.fullName,
        u.dbKey
      FROM psr_v4_main.users u
      CROSS JOIN LATERAL (
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = CONCAT(LOWER(REPLACE(u.fullName, ' ', '')), '_', LOWER(u.dbKey))
        AND TABLE_NAME = 'payment_transactions'
        LIMIT 1
      ) tables
      INNER JOIN (
        SELECT id, transaction_id, farmer_id, society_id, amount, status
        FROM payment_transactions
        WHERE paytm_order_id = ?
        LIMIT 1
      ) pt ON 1=1
      WHERE u.role = 'admin'
      LIMIT 1
    `, { replacements: [ORDERID] });

    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.error('❌ Transaction not found for order:', ORDERID);
      return createErrorResponse('Transaction not found', 404);
    }

    const transaction = transactions[0] as any;
    const schemaName = `${transaction.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${transaction.dbKey.toLowerCase()}`;

    // Get admin's payment settings to create Paytm service
    const [settings] = await sequelize.query(`
      SELECT * FROM \`${schemaName}\`.\`admin_payment_settings\` LIMIT 1
    `);

    if (!Array.isArray(settings) || settings.length === 0) {
      return createErrorResponse('Payment settings not found', 404);
    }

    const paymentSettings = settings[0] as any;
    const paytmService = createPaytmService(paymentSettings);

    if (!paytmService) {
      return createErrorResponse('Paytm service not configured', 500);
    }

    // Process callback
    const callbackResult = await paytmService.handleCallback(body);

    // Update transaction status
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`payment_transactions\`
      SET 
        status = ?,
        reference_number = ?,
        paytm_response = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE transaction_id = ?
    `, {
      replacements: [
        callbackResult.status,
        callbackResult.transactionId || null,
        JSON.stringify(callbackResult.gatewayResponse),
        transaction.transaction_id
      ]
    });

    // If payment is successful, update farmer's payment records
    if (callbackResult.status === 'success') {
      await sequelize.query(`
        UPDATE \`${schemaName}\`.\`farmers\`
        SET 
          last_payment_date = CURDATE(),
          last_payment_amount = ?,
          total_amount_paid = COALESCE(total_amount_paid, 0) + ?
        WHERE id = ?
      `, {
        replacements: [
          transaction.amount,
          transaction.amount,
          transaction.farmer_id
        ]
      });

      console.log(`✅ Payment successful for order ${ORDERID}, farmer ID: ${transaction.farmer_id}`);
    } else if (callbackResult.status === 'failed') {
      console.error(`❌ Payment failed for order ${ORDERID}:`, callbackResult.message);
    }

    return createSuccessResponse('Callback processed successfully', {
      orderId: ORDERID,
      status: callbackResult.status,
      message: callbackResult.message
    });

  } catch (error) {
    console.error('❌ Error processing Paytm callback:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to process callback',
      500
    );
  }
}

/**
 * GET /api/webhooks/paytm/callback
 * Handle Paytm redirect (for browser redirects)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('ORDERID');
  const status = searchParams.get('STATUS');

  // Redirect to payment transactions page with status
  const redirectUrl = new URL('/admin/payment-transactions', request.url);
  if (orderId) {
    redirectUrl.searchParams.set('order', orderId);
  }
  if (status) {
    redirectUrl.searchParams.set('status', status);
  }

  return Response.redirect(redirectUrl.toString());
}
