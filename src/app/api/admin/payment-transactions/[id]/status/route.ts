import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { getNotificationService } from '@/lib/services/notifications';

/**
 * PUT /api/admin/payment-transactions/[id]/status
 * Update payment transaction status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const body = await request.json();
    const { transaction_status, reference_number, failure_reason, paytm_txn_id, upi_transaction_id, bank_transaction_id } = body;

    if (!transaction_status) {
      return createErrorResponse('transaction_status is required', 400);
    }

    const validStatuses = ['pending', 'processing', 'success', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(transaction_status)) {
      return createErrorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    await connectDB();
    const { sequelize, User } = await import('@/models').then(m => m.getModels());

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Get admin's schema name
    const schemaName = `${admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${admin.dbKey.toLowerCase()}`;

    // Build update query
    const updates: string[] = ['transaction_status = ?'];
    const replacements: any[] = [transaction_status];

    if (reference_number !== undefined) {
      updates.push('reference_number = ?');
      replacements.push(reference_number);
    }
    if (failure_reason !== undefined) {
      updates.push('failure_reason = ?');
      replacements.push(failure_reason);
    }
    if (paytm_txn_id !== undefined) {
      updates.push('paytm_txn_id = ?');
      replacements.push(paytm_txn_id);
    }
    if (upi_transaction_id !== undefined) {
      updates.push('upi_transaction_id = ?');
      replacements.push(upi_transaction_id);
    }
    if (bank_transaction_id !== undefined) {
      updates.push('bank_transaction_id = ?');
      replacements.push(bank_transaction_id);
    }

    // Set completion date if status is success
    if (transaction_status === 'success') {
      updates.push('completion_date = CURRENT_TIMESTAMP');
    }

    replacements.push(id);

    // Update transaction
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`payment_transactions\`
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, { replacements });

    // If successful, update farmer's last payment details
    if (transaction_status === 'success') {
      await sequelize.query(`
        UPDATE \`${schemaName}\`.\`farmers\` f
        JOIN \`${schemaName}\`.\`payment_transactions\` pt ON f.id = pt.farmer_id
        SET 
          f.last_payment_date = CURRENT_DATE,
          f.last_payment_amount = pt.amount,
          f.pending_payment_amount = GREATEST(f.pending_payment_amount - pt.amount, 0)
        WHERE pt.id = ?
      `, { replacements: [id] });
    }

    // Get updated transaction with farmer and settings
    const [updatedTransaction] = await sequelize.query(`
      SELECT 
        pt.*,
        f.name as farmer_name,
        f.farmer_id as farmer_code,
        f.phone as farmer_phone,
        f.email as farmer_email
      FROM \`${schemaName}\`.\`payment_transactions\` pt
      LEFT JOIN \`${schemaName}\`.\`farmers\` f ON pt.farmer_id = f.id
      WHERE pt.id = ?
    `, { replacements: [id] });

    if (!Array.isArray(updatedTransaction) || updatedTransaction.length === 0) {
      return createErrorResponse('Transaction not found', 404);
    }

    const transaction = updatedTransaction[0] as any;

    // Send notification if status changed to success or failed
    if (transaction_status === 'success' || transaction_status === 'failed') {
      try {
        const [settings] = await sequelize.query(`
          SELECT * FROM \`${schemaName}\`.\`admin_payment_settings\` LIMIT 1
        `);

        if (Array.isArray(settings) && settings.length > 0) {
          const paymentSettings = settings[0] as any;
          const notificationService = getNotificationService(paymentSettings);

          await notificationService.sendPaymentNotification(
            {
              whatsapp_enabled: paymentSettings.whatsapp_notifications === 'YES',
              sms_enabled: paymentSettings.sms_notifications === 'YES',
              email_enabled: paymentSettings.email_notifications === 'YES'
            },
            {
              name: transaction.farmer_name,
              phone: transaction.farmer_phone,
              email: transaction.farmer_email
            },
            {
              amount: parseFloat(transaction.amount),
              transactionId: transaction.transaction_id,
              date: transaction.payment_date,
              status: transaction_status as 'success' | 'failed'
            }
          );
        }
      } catch (notifError) {
        console.error('⚠️ Notification error (non-critical):', notifError);
      }
    }

    return createSuccessResponse(
      'Transaction status updated successfully',
      transaction
    );

  } catch (error) {
    console.error('❌ Error updating transaction status:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update transaction status',
      500
    );
  }
}
