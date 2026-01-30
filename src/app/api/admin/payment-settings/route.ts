import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/admin/payment-settings
 * Get payment settings for the logged-in admin
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
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

    // Check if admin_payment_settings table exists
    const [tableExists] = await sequelize.query(`
      SELECT 1 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_payment_settings'
    `, { replacements: [schemaName] });

    if (!Array.isArray(tableExists) || tableExists.length === 0) {
      return createErrorResponse('Payment settings table not found. Please contact support.', 404);
    }

    // Get payment settings
    const [settings] = await sequelize.query(`
      SELECT 
        id,
        paytm_merchant_id,
        paytm_website,
        paytm_industry_type,
        paytm_channel_id,
        paytm_callback_url,
        paytm_enabled,
        upi_enabled,
        bank_transfer_enabled,
        cash_payment_enabled,
        whatsapp_notifications,
        whatsapp_api_key,
        whatsapp_api_url,
        whatsapp_from_number,
        sms_notifications,
        sms_provider,
        sms_api_key,
        sms_api_secret,
        sms_api_url,
        sms_from_number,
        email_notifications,
        auto_payment_enabled,
        payment_threshold,
        payment_cycle,
        payment_day,
        created_at,
        updated_at
      FROM \`${schemaName}\`.\`admin_payment_settings\`
      LIMIT 1
    `);

    // If no settings exist, create default settings
    if (!Array.isArray(settings) || settings.length === 0) {
      await sequelize.query(`
        INSERT INTO \`${schemaName}\`.\`admin_payment_settings\` 
        (paytm_enabled, upi_enabled, bank_transfer_enabled, cash_payment_enabled,
         whatsapp_notifications, sms_notifications, email_notifications,
         auto_payment_enabled, payment_threshold, payment_cycle, payment_day)
        VALUES ('NO', 'NO', 'YES', 'YES', 'NO', 'NO', 'YES', 'NO', 500.00, 'monthly', 1)
      `);

      // Fetch the newly created settings
      const [newSettings] = await sequelize.query(`
        SELECT 
          id,
          paytm_merchant_id,
          paytm_website,
          paytm_industry_type,
          paytm_channel_id,
          paytm_callback_url,
          paytm_enabled,
          upi_enabled,
          bank_transfer_enabled,
          cash_payment_enabled,
          whatsapp_notifications,
          whatsapp_api_key,
          whatsapp_api_url,
          whatsapp_from_number,
          sms_notifications,
          sms_provider,
          sms_api_key,
          sms_api_secret,
          sms_api_url,
          sms_from_number,
          email_notifications,
          auto_payment_enabled,
          payment_threshold,
          payment_cycle,
          payment_day,
          created_at,
          updated_at
        FROM \`${schemaName}\`.\`admin_payment_settings\`
        LIMIT 1
      `);

      return createSuccessResponse('Default payment settings created', newSettings[0]);
    }

    return createSuccessResponse('Payment settings retrieved successfully', settings[0]);

  } catch (error) {
    console.error('❌ Error fetching payment settings:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch payment settings',
      500
    );
  }
}

/**
 * PUT /api/admin/payment-settings
 * Update payment settings for the logged-in admin
 */
export async function PUT(request: NextRequest) {
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

    // Validate input
    const {
      paytm_merchant_id,
      paytm_merchant_key,
      paytm_website,
      paytm_industry_type,
      paytm_channel_id,
      paytm_callback_url,
      paytm_enabled,
      upi_enabled,
      bank_transfer_enabled,
      cash_payment_enabled,
      whatsapp_notifications,
      whatsapp_api_key,
      whatsapp_api_url,
      whatsapp_from_number,
      sms_notifications,
      sms_provider,
      sms_api_key,
      sms_api_secret,
      sms_api_url,
      sms_from_number,
      email_notifications,
      auto_payment_enabled,
      payment_threshold,
      payment_cycle,
      payment_day
    } = body;

    await connectDB();
    const { sequelize, User } = await import('@/models').then(m => m.getModels());

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Get admin's schema name
    const schemaName = `${admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${admin.dbKey.toLowerCase()}`;

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const replacements: any[] = [];

    if (paytm_merchant_id !== undefined) {
      updates.push('paytm_merchant_id = ?');
      replacements.push(paytm_merchant_id);
    }
    if (paytm_merchant_key !== undefined) {
      // In production, encrypt this key before storing
      updates.push('paytm_merchant_key = ?');
      replacements.push(paytm_merchant_key);
    }
    if (paytm_website !== undefined) {
      updates.push('paytm_website = ?');
      replacements.push(paytm_website);
    }
    if (paytm_industry_type !== undefined) {
      updates.push('paytm_industry_type = ?');
      replacements.push(paytm_industry_type);
    }
    if (paytm_channel_id !== undefined) {
      updates.push('paytm_channel_id = ?');
      replacements.push(paytm_channel_id);
    }
    if (paytm_callback_url !== undefined) {
      updates.push('paytm_callback_url = ?');
      replacements.push(paytm_callback_url);
    }
    if (paytm_enabled !== undefined) {
      updates.push('paytm_enabled = ?');
      replacements.push(paytm_enabled);
    }
    if (upi_enabled !== undefined) {
      updates.push('upi_enabled = ?');
      replacements.push(upi_enabled);
    }
    if (bank_transfer_enabled !== undefined) {
      updates.push('bank_transfer_enabled = ?');
      replacements.push(bank_transfer_enabled);
    }
    if (cash_payment_enabled !== undefined) {
      updates.push('cash_payment_enabled = ?');
      replacements.push(cash_payment_enabled);
    }
    if (whatsapp_notifications !== undefined) {
      updates.push('whatsapp_notifications = ?');
      replacements.push(whatsapp_notifications);
    }
    if (whatsapp_api_key !== undefined) {
      updates.push('whatsapp_api_key = ?');
      replacements.push(whatsapp_api_key);
    }
    if (whatsapp_api_url !== undefined) {
      updates.push('whatsapp_api_url = ?');
      replacements.push(whatsapp_api_url);
    }
    if (whatsapp_from_number !== undefined) {
      updates.push('whatsapp_from_number = ?');
      replacements.push(whatsapp_from_number);
    }
    if (sms_notifications !== undefined) {
      updates.push('sms_notifications = ?');
      replacements.push(sms_notifications);
    }
    if (sms_provider !== undefined) {
      updates.push('sms_provider = ?');
      replacements.push(sms_provider);
    }
    if (sms_api_key !== undefined) {
      updates.push('sms_api_key = ?');
      replacements.push(sms_api_key);
    }
    if (sms_api_secret !== undefined) {
      updates.push('sms_api_secret = ?');
      replacements.push(sms_api_secret);
    }
    if (sms_api_url !== undefined) {
      updates.push('sms_api_url = ?');
      replacements.push(sms_api_url);
    }
    if (sms_from_number !== undefined) {
      updates.push('sms_from_number = ?');
      replacements.push(sms_from_number);
    }
    if (email_notifications !== undefined) {
      updates.push('email_notifications = ?');
      replacements.push(email_notifications);
    }
    if (auto_payment_enabled !== undefined) {
      updates.push('auto_payment_enabled = ?');
      replacements.push(auto_payment_enabled);
    }
    if (payment_threshold !== undefined) {
      updates.push('payment_threshold = ?');
      replacements.push(payment_threshold);
    }
    if (payment_cycle !== undefined) {
      updates.push('payment_cycle = ?');
      replacements.push(payment_cycle);
    }
    if (payment_day !== undefined) {
      updates.push('payment_day = ?');
      replacements.push(payment_day);
    }

    if (updates.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    // Update settings
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`admin_payment_settings\`
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    `, { replacements });

    // Fetch updated settings
    const [updatedSettings] = await sequelize.query(`
      SELECT 
        id,
        paytm_merchant_id,
        paytm_website,
        paytm_industry_type,
        paytm_channel_id,
        paytm_callback_url,
        paytm_enabled,
        upi_enabled,
        bank_transfer_enabled,
        cash_payment_enabled,
        whatsapp_notifications,
        whatsapp_api_key,
        whatsapp_api_url,
        whatsapp_from_number,
        sms_notifications,
        sms_provider,
        sms_api_key,
        sms_api_secret,
        sms_api_url,
        sms_from_number,
        email_notifications,
        auto_payment_enabled,
        payment_threshold,
        payment_cycle,
        payment_day,
        created_at,
        updated_at
      FROM \`${schemaName}\`.\`admin_payment_settings\`
      LIMIT 1
    `);

    return createSuccessResponse(
      'Payment settings updated successfully',
      updatedSettings[0]
    );

  } catch (error) {
    console.error('❌ Error updating payment settings:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update payment settings',
      500
    );
  }
}
