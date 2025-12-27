import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    const { entityType, schemaName, id } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401);
    }

    let dashboardData = {};

    try {
      switch (entityType) {
        case 'society':
          // Society Dashboard Data
          const [societyStats] = await sequelize.query(`
            SELECT 
              s.id, s.name, s.society_id, s.status,
              COUNT(DISTINCT f.id) as total_farmers,
              COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_farmers,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d,
              COUNT(DISTINCT mc7.id) as collections_last_7d,
              COALESCE(SUM(mc7.quantity), 0) as quantity_last_7d,
              COALESCE(SUM(mc7.total_amount), 0) as amount_last_7d,
              COUNT(DISTINCT mctoday.id) as collections_today,
              COALESCE(SUM(mctoday.quantity), 0) as quantity_today,
              COALESCE(SUM(mctoday.total_amount), 0) as amount_today
            FROM \`${schemaName}\`.societies s
            LEFT JOIN \`${schemaName}\`.farmers f ON s.id = f.society_id
            LEFT JOIN \`${schemaName}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            LEFT JOIN \`${schemaName}\`.milk_collections mc7 ON f.id = mc7.farmer_id AND mc7.collection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            LEFT JOIN \`${schemaName}\`.milk_collections mctoday ON f.id = mctoday.farmer_id AND mctoday.collection_date = CURDATE()
            WHERE s.id = ?
            GROUP BY s.id, s.name, s.society_id, s.status
          `, { replacements: [id] });

          const [recentCollections] = await sequelize.query(`
            SELECT 
              mc.id, mc.collection_date, mc.collection_time, mc.quantity, mc.fat_percentage,
              mc.snf_percentage, mc.total_amount, f.farmer_id, f.name as farmer_name
            FROM \`${schemaName}\`.milk_collections mc
            JOIN \`${schemaName}\`.farmers f ON mc.farmer_id = f.id
            WHERE f.society_id = ?
            ORDER BY mc.collection_date DESC, mc.collection_time DESC
            LIMIT 10
          `, { replacements: [id] });

          dashboardData = {
            type: 'society',
            stats: societyStats[0] || {},
            recentCollections: recentCollections || []
          };
          break;

        case 'farmer':
          // Farmer Dashboard Data
          const [farmerStats] = await sequelize.query(`
            SELECT 
              f.id, f.farmer_id, f.name, f.status,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d,
              COALESCE(AVG(mc30.fat_percentage), 0) as avg_fat_30d,
              COALESCE(AVG(mc30.snf_percentage), 0) as avg_snf_30d,
              COUNT(DISTINCT mc7.id) as collections_last_7d,
              COALESCE(SUM(mc7.quantity), 0) as quantity_last_7d,
              COALESCE(SUM(mc7.total_amount), 0) as amount_last_7d,
              COUNT(DISTINCT mctoday.id) as collections_today,
              COALESCE(SUM(mctoday.quantity), 0) as quantity_today,
              COALESCE(SUM(mctoday.total_amount), 0) as amount_today
            FROM \`${schemaName}\`.farmers f
            LEFT JOIN \`${schemaName}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            LEFT JOIN \`${schemaName}\`.milk_collections mc7 ON f.id = mc7.farmer_id AND mc7.collection_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            LEFT JOIN \`${schemaName}\`.milk_collections mctoday ON f.id = mctoday.farmer_id AND mctoday.collection_date = CURDATE()
            WHERE f.id = ?
            GROUP BY f.id, f.farmer_id, f.name, f.status
          `, { replacements: [id] });

          const [farmerCollections] = await sequelize.query(`
            SELECT 
              mc.id, mc.collection_date, mc.collection_time, mc.quantity, mc.fat_percentage,
              mc.snf_percentage, mc.clr_value, mc.water_percentage, mc.total_amount
            FROM \`${schemaName}\`.milk_collections mc
            WHERE mc.farmer_id = ?
            ORDER BY mc.collection_date DESC, mc.collection_time DESC
            LIMIT 15
          `, { replacements: [id] });

          dashboardData = {
            type: 'farmer',
            stats: farmerStats[0] || {},
            recentCollections: farmerCollections || []
          };
          break;

        case 'bmc':
          // BMC Dashboard Data
          const [bmcStats] = await sequelize.query(`
            SELECT 
              b.id, b.name, b.bmc_id, b.status,
              COUNT(DISTINCT s.id) as total_societies,
              COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_societies,
              COUNT(DISTINCT f.id) as total_farmers,
              COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_farmers,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d
            FROM \`${schemaName}\`.bmcs b
            LEFT JOIN \`${schemaName}\`.societies s ON b.id = s.bmc_id
            LEFT JOIN \`${schemaName}\`.farmers f ON s.id = f.society_id
            LEFT JOIN \`${schemaName}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            WHERE b.id = ?
            GROUP BY b.id, b.name, b.bmc_id, b.status
          `, { replacements: [id] });

          dashboardData = {
            type: 'bmc',
            stats: bmcStats[0] || {}
          };
          break;

        case 'dairy':
          // Dairy Dashboard Data
          const [dairyStats] = await sequelize.query(`
            SELECT 
              d.id, d.name, d.dairy_id, d.status,
              COUNT(DISTINCT b.id) as total_bmcs,
              COUNT(DISTINCT CASE WHEN b.status = 'active' THEN b.id END) as active_bmcs,
              COUNT(DISTINCT s.id) as total_societies,
              COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_societies,
              COUNT(DISTINCT f.id) as total_farmers,
              COUNT(DISTINCT CASE WHEN f.status = 'active' THEN f.id END) as active_farmers,
              COUNT(DISTINCT mc30.id) as collections_last_30d,
              COALESCE(SUM(mc30.quantity), 0) as quantity_last_30d,
              COALESCE(SUM(mc30.total_amount), 0) as amount_last_30d
            FROM \`${schemaName}\`.dairies d
            LEFT JOIN \`${schemaName}\`.bmcs b ON d.id = b.dairy_id
            LEFT JOIN \`${schemaName}\`.societies s ON b.id = s.bmc_id
            LEFT JOIN \`${schemaName}\`.farmers f ON s.id = f.society_id
            LEFT JOIN \`${schemaName}\`.milk_collections mc30 ON f.id = mc30.farmer_id AND mc30.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            WHERE d.id = ?
            GROUP BY d.id, d.name, d.dairy_id, d.status
          `, { replacements: [id] });

          dashboardData = {
            type: 'dairy',
            stats: dairyStats[0] || {}
          };
          break;

        default:
          return createErrorResponse('Invalid entity type', 400);
      }

      console.log(`✅ Dashboard data fetched for ${entityType}: ${payload.uid}`);

      return createSuccessResponse('Dashboard data retrieved successfully', dashboardData, 200, corsHeaders);

    } catch (queryError) {
      console.error('Database query error:', queryError);
      return createErrorResponse('Failed to fetch dashboard data', 500, undefined, corsHeaders);
    }

  } catch (error: unknown) {
    console.error('Error fetching dashboard:', error);
    return createErrorResponse('Failed to fetch dashboard data', 500, undefined, corsHeaders);
  }
}