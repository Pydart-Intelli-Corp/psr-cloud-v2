import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

/**
 * GET /api/admin/payment-transactions
 * Get payment transaction history for the logged-in admin
 * Query params:
 *   - farmer_id: Filter by farmer (optional)
 *   - society_id: Filter by society (optional)
 *   - payment_method: Filter by payment method (optional)
 *   - transaction_status: Filter by status (optional)
 *   - start_date: Start date filter (optional)
 *   - end_date: End date filter (optional)
 *   - limit: Number of records (default: 50)
 *   - offset: Pagination offset (default: 0)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmer_id');
    const societyId = searchParams.get('society_id');
    const paymentMethod = searchParams.get('payment_method');
    const transactionStatus = searchParams.get('transaction_status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build WHERE clause
    const conditions: string[] = [];
    const replacements: any[] = [];

    if (farmerId) {
      conditions.push('pt.farmer_id = ?');
      replacements.push(farmerId);
    }
    if (societyId) {
      conditions.push('pt.society_id = ?');
      replacements.push(societyId);
    }
    if (paymentMethod) {
      conditions.push('pt.payment_method = ?');
      replacements.push(paymentMethod);
    }
    if (transactionStatus) {
      conditions.push('pt.transaction_status = ?');
      replacements.push(transactionStatus);
    }
    if (startDate) {
      conditions.push('pt.payment_date >= ?');
      replacements.push(startDate);
    }
    if (endDate) {
      conditions.push('pt.payment_date <= ?');
      replacements.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get transactions with farmer and society details
    const [transactions] = await sequelize.query(`
      SELECT 
        pt.*,
        f.name as farmer_name,
        f.farmer_id as farmer_code,
        f.phone as farmer_phone,
        s.name as society_name,
        s.society_id as society_code
      FROM \`${schemaName}\`.\`payment_transactions\` pt
      LEFT JOIN \`${schemaName}\`.\`farmers\` f ON pt.farmer_id = f.id
      LEFT JOIN \`${schemaName}\`.\`societies\` s ON pt.society_id = s.id
      ${whereClause}
      ORDER BY pt.payment_date DESC
      LIMIT ? OFFSET ?
    `, { replacements: [...replacements, limit, offset] });

    // Get total count
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM \`${schemaName}\`.\`payment_transactions\` pt
      ${whereClause}
    `, { replacements });

    const total = (countResult[0] as any).total;

    return createSuccessResponse(
      'Payment transactions retrieved successfully',
      {
        transactions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    );

  } catch (error) {
    console.error('❌ Error fetching payment transactions:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch payment transactions',
      500
    );
  }
}

/**
 * POST /api/admin/payment-transactions
 * Create a new payment transaction (manual payment initiation)
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

    // Validate required fields
    const {
      farmer_id,
      payment_method,
      amount,
      society_id,
      payment_description,
      beneficiary_account,
      beneficiary_ifsc,
      beneficiary_upi
    } = body;

    if (!farmer_id || !payment_method || !amount) {
      return createErrorResponse('farmer_id, payment_method, and amount are required', 400);
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

    // Get admin's schema name
    const schemaName = `${admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${admin.dbKey.toLowerCase()}`;

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Verify farmer exists
    const [farmer] = await sequelize.query(`
      SELECT id, name, bank_account_number, ifsc_code, upi_id, preferred_payment_mode
      FROM \`${schemaName}\`.\`farmers\`
      WHERE id = ?
    `, { replacements: [farmer_id] });

    if (!Array.isArray(farmer) || farmer.length === 0) {
      return createErrorResponse('Farmer not found', 404);
    }

    const farmerData = farmer[0] as any;

    // Insert payment transaction
    await sequelize.query(`
      INSERT INTO \`${schemaName}\`.\`payment_transactions\`
      (transaction_id, farmer_id, society_id, payment_method, amount, 
       transaction_status, payment_description, beneficiary_account, 
       beneficiary_ifsc, beneficiary_upi, created_by, is_automated)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 'NO')
    `, {
      replacements: [
        transactionId,
        farmer_id,
        society_id || null,
        payment_method,
        amount,
        payment_description || `Payment to ${farmerData.name}`,
        beneficiary_account || farmerData.bank_account_number,
        beneficiary_ifsc || farmerData.ifsc_code,
        beneficiary_upi || farmerData.upi_id,
        payload.id
      ]
    });

    // Get the created transaction
    const [newTransaction] = await sequelize.query(`
      SELECT 
        pt.*,
        f.name as farmer_name,
        f.farmer_id as farmer_code,
        f.phone as farmer_phone
      FROM \`${schemaName}\`.\`payment_transactions\` pt
      LEFT JOIN \`${schemaName}\`.\`farmers\` f ON pt.farmer_id = f.id
      WHERE pt.transaction_id = ?
    `, { replacements: [transactionId] });

    return createSuccessResponse(
      'Payment transaction created successfully',
      newTransaction[0],
      201
    );

  } catch (error) {
    console.error('❌ Error creating payment transaction:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create payment transaction',
      500
    );
  }
}
