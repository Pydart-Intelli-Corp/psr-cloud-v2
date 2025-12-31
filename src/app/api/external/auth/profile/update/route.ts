import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401, undefined, corsHeaders);
    }

    const payload = verifyToken(token);
    if (!payload || !payload.entityType) {
      return createErrorResponse('Invalid authentication token', 401, undefined, corsHeaders);
    }

    const body = await request.json();
    const { entityType, schemaName, id } = payload;

    if (!schemaName) {
      return createErrorResponse('Invalid token: missing schema information', 401, undefined, corsHeaders);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize } = getModels();

    // Build update query based on entity type
    let updateQuery = '';
    let updateParams: any[] = [];
    let selectQuery = '';

    try {
      switch (entityType) {
        case 'society':
          // Allowed fields: name, location, president_name, contact_phone
          // Email is NOT allowed to be changed
          const { name, location, president_name, contact_phone } = body;
          
          if (!name || name.trim() === '') {
            return createErrorResponse('Society name is required', 400, undefined, corsHeaders);
          }

          updateQuery = `
            UPDATE \`${schemaName}\`.societies 
            SET name = ?, location = ?, president_name = ?, contact_phone = ?, updated_at = NOW()
            WHERE id = ?
          `;
          updateParams = [
            name?.trim() || null,
            location?.trim() || null,
            president_name?.trim() || null,
            contact_phone?.trim() || null,
            id
          ];

          selectQuery = `
            SELECT s.id, s.name, s.society_id, s.email, s.location, s.president_name, 
                   s.contact_phone, s.bmc_id, s.status, s.created_at, s.updated_at,
                   b.name as bmc_name, b.bmc_id as bmc_identifier,
                   d.name as dairy_name, d.dairy_id as dairy_identifier, d.id as dairy_id
            FROM \`${schemaName}\`.societies s
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            LEFT JOIN \`${schemaName}\`.dairy_farms d ON b.dairy_farm_id = d.id
            WHERE s.id = ?
          `;
          break;

        case 'farmer':
          // Allowed fields: name, phone, address, bank_name, bank_account_number, ifsc_code
          // Email is NOT allowed to be changed
          const { 
            name: farmerName, 
            phone, 
            address, 
            bank_name, 
            bank_account_number, 
            ifsc_code 
          } = body;
          
          if (!farmerName || farmerName.trim() === '') {
            return createErrorResponse('Farmer name is required', 400, undefined, corsHeaders);
          }

          updateQuery = `
            UPDATE \`${schemaName}\`.farmers 
            SET name = ?, phone = ?, address = ?, bank_name = ?, bank_account_number = ?, ifsc_code = ?, updated_at = NOW()
            WHERE id = ?
          `;
          updateParams = [
            farmerName?.trim() || null,
            phone?.trim() || null,
            address?.trim() || null,
            bank_name?.trim() || null,
            bank_account_number?.trim() || null,
            ifsc_code?.trim() || null,
            id
          ];

          selectQuery = `
            SELECT f.id, f.farmer_id, f.name, f.email, f.phone, f.address, f.bank_name,
                   f.bank_account_number, f.ifsc_code, f.society_id, f.status, f.created_at, f.updated_at,
                   s.name as society_name, s.society_id as society_identifier,
                   b.name as bmc_name, b.bmc_id as bmc_identifier,
                   d.name as dairy_name, d.dairy_id as dairy_identifier
            FROM \`${schemaName}\`.farmers f
            LEFT JOIN \`${schemaName}\`.societies s ON f.society_id = s.id
            LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
            LEFT JOIN \`${schemaName}\`.dairy_farms d ON b.dairy_farm_id = d.id
            WHERE f.id = ?
          `;
          break;

        case 'bmc':
          // Allowed fields: name, location, contact_phone
          // Email is NOT allowed to be changed
          const { name: bmcName, location: bmcLocation, contact_phone: bmcPhone } = body;
          
          if (!bmcName || bmcName.trim() === '') {
            return createErrorResponse('BMC name is required', 400, undefined, corsHeaders);
          }

          updateQuery = `
            UPDATE \`${schemaName}\`.bmcs 
            SET name = ?, location = ?, contact_phone = ?, updated_at = NOW()
            WHERE id = ?
          `;
          updateParams = [
            bmcName?.trim() || null,
            bmcLocation?.trim() || null,
            bmcPhone?.trim() || null,
            id
          ];

          selectQuery = `
            SELECT b.id, b.name, b.bmc_id, b.email, b.location, b.contact_phone, 
                   b.dairy_farm_id, b.status, b.created_at, b.updated_at,
                   d.name as dairy_name, d.dairy_id as dairy_identifier
            FROM \`${schemaName}\`.bmcs b
            LEFT JOIN \`${schemaName}\`.dairy_farms d ON b.dairy_farm_id = d.id
            WHERE b.id = ?
          `;
          break;

        case 'dairy':
          // Allowed fields: name, location, contact_phone, president_name
          // Email is NOT allowed to be changed
          const { 
            name: dairyName, 
            location: dairyLocation, 
            contact_phone: dairyPhone,
            president_name: dairyPresident 
          } = body;
          
          if (!dairyName || dairyName.trim() === '') {
            return createErrorResponse('Dairy name is required', 400, undefined, corsHeaders);
          }

          updateQuery = `
            UPDATE \`${schemaName}\`.dairy_farms 
            SET name = ?, location = ?, contact_phone = ?, president_name = ?, updated_at = NOW()
            WHERE id = ?
          `;
          updateParams = [
            dairyName?.trim() || null,
            dairyLocation?.trim() || null,
            dairyPhone?.trim() || null,
            dairyPresident?.trim() || null,
            id
          ];

          selectQuery = `
            SELECT d.id, d.name, d.dairy_id, d.email, d.location, d.contact_phone, 
                   d.president_name, d.status, d.created_at, d.updated_at
            FROM \`${schemaName}\`.dairy_farms d
            WHERE d.id = ?
          `;
          break;

        default:
          return createErrorResponse('Invalid entity type', 400, undefined, corsHeaders);
      }

      // Execute update
      await sequelize.query(updateQuery, { replacements: updateParams });

      // Fetch updated data
      const [updatedData] = await sequelize.query(selectQuery, { replacements: [id] });
      const entityData = (updatedData as any[])[0];

      if (!entityData) {
        return createErrorResponse('Entity not found after update', 404, undefined, corsHeaders);
      }

      console.log(`✅ Profile updated for ${entityType}: ID ${id}`);

      return createSuccessResponse('Profile updated successfully', {
        type: entityType,
        data: entityData
      }, 200, corsHeaders);

    } catch (queryError) {
      console.error('Database query error:', queryError);
      return createErrorResponse('Failed to update profile', 500, undefined, corsHeaders);
    }

  } catch (error: unknown) {
    console.error('Error updating profile:', error);
    return createErrorResponse('Failed to update profile', 500, undefined, corsHeaders);
  }
}
