import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    const { entityType, schemaName, id } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401);
    }

    let entityData = null;

    try {
      switch (entityType) {
        case 'society':
          const [societies] = await sequelize.query(`
            SELECT s.id, s.name, s.society_id, s.email, s.location, s.president_name, 
                   s.contact_phone, s.bmc_id, s.status, s.created_at, s.updated_at,
                   b.name as bmc_name, b.bmc_id as bmc_identifier,
                   d.name as dairy_name, d.dairy_id as dairy_identifier, d.id as dairy_id,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.farmers f WHERE f.society_id = s.id AND f.status = 'active') as active_farmers_count,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.milk_collections mc WHERE mc.society_id = s.id AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as collections_last_30d
            FROM \`${schemaName}\`.societies s
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            LEFT JOIN \`${schemaName}\`.dairies d ON b.dairy_id = d.id
            WHERE s.id = ?
          `, { replacements: [id] });
          entityData = societies[0];
          break;

        case 'farmer':
          const [farmers] = await sequelize.query(`
            SELECT f.id, f.farmer_id, f.name, f.email, f.phone, f.address, f.bank_name,
                   f.bank_account_number, f.ifsc_code, f.society_id, f.status, f.created_at, f.updated_at,
                   s.name as society_name, s.society_id as society_identifier,
                   b.name as bmc_name, b.bmc_id as bmc_identifier,
                   d.name as dairy_name, d.dairy_id as dairy_identifier,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.milk_collections mc WHERE mc.farmer_id = f.id AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as collections_last_30d,
                   (SELECT SUM(mc.quantity) FROM \`${schemaName}\`.milk_collections mc WHERE mc.farmer_id = f.id AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as quantity_last_30d,
                   (SELECT SUM(mc.total_amount) FROM \`${schemaName}\`.milk_collections mc WHERE mc.farmer_id = f.id AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as amount_last_30d
            FROM \`${schemaName}\`.farmers f
            LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            LEFT JOIN \`${schemaName}\`.dairies d ON b.dairy_id = d.id
            WHERE f.id = ?
          `, { replacements: [id] });
          entityData = farmers[0];
          break;

        case 'bmc':
          const [bmcs] = await sequelize.query(`
            SELECT b.id, b.name, b.bmc_id, b.email, b.location, b.contact_phone, 
                   b.dairy_id, b.status, b.created_at, b.updated_at,
                   d.name as dairy_name, d.dairy_id as dairy_identifier,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.societies s WHERE s.bmc_id = b.id AND s.status = 'active') as active_societies_count,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.farmers f JOIN \`${schemaName}\`.societies s ON f.society_id = s.id WHERE s.bmc_id = b.id AND f.status = 'active') as active_farmers_count
            FROM \`${schemaName}\`.bmcs b
            LEFT JOIN \`${schemaName}\`.dairies d ON b.dairy_id = d.id
            WHERE b.id = ?
          `, { replacements: [id] });
          entityData = bmcs[0];
          break;

        case 'dairy':
          const [dairies] = await sequelize.query(`
            SELECT d.id, d.name, d.dairy_id, d.email, d.location, d.contact_phone, 
                   d.president_name, d.status, d.created_at, d.updated_at,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.bmcs b WHERE b.dairy_id = d.id AND b.status = 'active') as active_bmcs_count,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.societies s JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id WHERE b.dairy_id = d.id AND s.status = 'active') as active_societies_count,
                   (SELECT COUNT(*) FROM \`${schemaName}\`.farmers f JOIN \`${schemaName}\`.societies s ON f.society_id = s.id JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id WHERE b.dairy_id = d.id AND f.status = 'active') as active_farmers_count
            FROM \`${schemaName}\`.dairies d
            WHERE d.id = ?
          `, { replacements: [id] });
          entityData = dairies[0];
          break;

        default:
          return createErrorResponse('Invalid entity type', 400);
      }

      if (!entityData) {
        return createErrorResponse('Entity not found', 404);
      }

      // Get admin information
      const [adminUsers] = await sequelize.query(`
        SELECT id, fullName, email, dbKey 
        FROM users 
        WHERE role = 'admin' AND dbKey IS NOT NULL
      `);
      
      const adminInfo = (adminUsers as any[]).find(admin => {
        const cleanName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const adminSchemaName = `${cleanName}_${admin.dbKey.toLowerCase()}`;
        return adminSchemaName === schemaName;
      });

      const response = {
        type: entityType,
        data: entityData,
        adminInfo: adminInfo ? {
          name: adminInfo.fullName,
          email: adminInfo.email
        } : null,
        schema: schemaName
      };

      const entityName = (entityData as any)?.name || (entityData as any)?.farmer_id || 'Unknown';
      console.log(`✅ Profile fetched for ${entityType}: ${entityName}`);

      return createSuccessResponse('Profile data retrieved successfully', response);

    } catch (queryError) {
      console.error('Database query error:', queryError);
      return createErrorResponse('Failed to fetch profile data', 500);
    }

  } catch (error: unknown) {
    console.error('Error fetching profile:', error);
    return createErrorResponse('Failed to fetch profile', 500);
  }
}