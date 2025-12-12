import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface SocietyData {
  name: string;
  password: string;
  societyId: string;
  location?: string;
  presidentName?: string;
  contactPhone?: string;
  bmcId?: number;
}

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
    const { name, password, societyId, location, presidentName, contactPhone, bmcId }: SocietyData = body;

    if (!name || !password || !societyId) {
      return createErrorResponse('Name, password, and society ID are required', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Insert society data into admin's schema
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.\`societies\` 
      (name, society_id, password, location, president_name, contact_phone, bmc_id, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `;

    await sequelize.query(insertQuery, {
      replacements: [name, societyId, password, location || null, presidentName || null, contactPhone || null, bmcId || null]
    });

    console.log(`✅ Society added successfully to schema: ${schemaName}`);

    return createSuccessResponse('Society added successfully', {
      societyId,
      name,
      location,
      presidentName
    });

  } catch (error: unknown) {
    console.error('Error adding society:', error);
    
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return createErrorResponse('Society ID already exists', 409);
    }
    
    return createErrorResponse('Failed to add society', 500);
  }
}

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
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Get all societies from admin's schema with BMC names and 30-day statistics
    const [societies] = await sequelize.query(`
      SELECT 
        s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, s.bmc_id, s.status,
        b.name as bmc_name, s.created_at, s.updated_at,
        COALESCE(COUNT(DISTINCT mc.id), 0) as total_collections_30d,
        COALESCE(SUM(mc.quantity), 0) as total_quantity_30d,
        COALESCE(SUM(mc.total_amount), 0) as total_amount_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_fat_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_snf_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.clr_value * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_clr_30d,
        COALESCE(
          CASE 
            WHEN SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END) > 0 
            THEN ROUND(
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.water_percentage * mc.quantity ELSE 0 END) / 
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END), 
              2
            )
            ELSE 0 
          END, 0
        ) as weighted_water_30d
      FROM \`${schemaName}\`.\`societies\` s
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc 
        ON mc.society_id = s.id 
        AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, 
               s.bmc_id, s.status, b.name, s.created_at, s.updated_at
      ORDER BY s.created_at DESC
    `);

    return createSuccessResponse('Societies retrieved successfully', societies);

  } catch (error: unknown) {
    console.error('Error retrieving societies:', error);
    return createErrorResponse('Failed to retrieve societies', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return createErrorResponse('Authentication required', 401);
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get('id');
    const otp = searchParams.get('otp');

    if (!societyId || !otp) {
      return createErrorResponse('Society ID and OTP are required', 400);
    }

    // Verify OTP
    const { verifyDeleteOTP } = await import('./send-delete-otp/route');
    const isValidOTP = verifyDeleteOTP(payload.id, parseInt(societyId), otp);
    
    if (!isValidOTP) {
      return createErrorResponse('Invalid or expired OTP', 401);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Check if society exists
    const [society] = await sequelize.query(`
      SELECT id, name FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [societyId]
    });

    if (!Array.isArray(society) || society.length === 0) {
      return createErrorResponse('Society not found', 404);
    }

    const societyData = society[0] as { id: number; name: string };
    console.log(`🗑️ Starting cascade delete for Society ID ${societyId}: ${societyData.name}`);

    // Get all farmers under this society
    const [farmers] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });

    const farmerIds = Array.isArray(farmers) ? (farmers as Array<{ id: number }>).map(f => f.id) : [];

    // Get rate chart IDs for this society
    const [rateCharts] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`rate_charts\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });

    const rateChartIds = Array.isArray(rateCharts) ? (rateCharts as Array<{ id: number }>).map(rc => rc.id) : [];

    // Start cascade delete (13 steps)
    
    // Step 1: Delete milk collections for farmers
    if (farmerIds.length > 0) {
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`milk_collections\` 
        WHERE farmer_id IN (?)
      `, {
        replacements: [farmerIds]
      });
      console.log(`✅ Step 1: Deleted milk collections for farmers`);
    }

    // Step 2: Delete milk sales records
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`milk_sales\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 2: Deleted milk sales records`);

    // Step 3: Delete milk dispatches
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`milk_dispatches\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 3: Deleted milk dispatches`);

    // Step 4: Delete section pulse data
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`section_pulse\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 4: Deleted section pulse data`);

    // Step 5: Delete rate chart download history
    if (rateChartIds.length > 0) {
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`rate_chart_download_history\` 
        WHERE rate_chart_id IN (?)
      `, {
        replacements: [rateChartIds]
      });
      console.log(`✅ Step 5: Deleted rate chart download history`);
    }

    // Step 6: Delete rate chart data
    if (rateChartIds.length > 0) {
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.\`rate_chart_data\` 
        WHERE rate_chart_id IN (?)
      `, {
        replacements: [rateChartIds]
      });
      console.log(`✅ Step 6: Deleted rate chart data`);
    }

    // Step 7: Delete rate charts
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`rate_charts\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 7: Deleted rate charts`);

    // Step 8: Delete machine statistics
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_statistics\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 8: Deleted machine statistics`);

    // Step 9: Delete machine corrections (admin saved)
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_corrections\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 9: Deleted machine corrections (admin saved)`);

    // Step 10: Delete machine corrections from machine (device saved)
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`machine_corrections_from_machine\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 10: Deleted machine corrections (device saved)`);

    // Step 11: Delete farmers
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`farmers\` WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 11: Deleted farmers`);

    // Step 12: Delete machines (society_id will be set to NULL)
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`machines\` SET society_id = NULL WHERE society_id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 12: Unlinked machines from society`);

    // Step 13: Finally delete the society
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [societyId]
    });
    console.log(`✅ Step 13: Deleted society "${societyData.name}"`);

    console.log(`🎉 Cascade delete completed successfully for Society ID ${societyId}`);

    return createSuccessResponse('Society and all related data deleted successfully', {
      societyId: parseInt(societyId),
      societyName: societyData.name,
      deletedItems: {
        farmers: farmerIds.length,
        rateCharts: rateChartIds.length
      }
    });

  } catch (error: unknown) {
    console.error('Error deleting society:', error);
    return createErrorResponse('Failed to delete society', 500);
  }
}

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
    const { id, name, location, presidentName, contactPhone, bmcId, status, password } = body;

    if (!id || !name) {
      return createErrorResponse('Society ID and name are required', 400);
    }

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin's dbKey
    const admin = await User.findByPk(payload.id);
    if (!admin || !admin.dbKey) {
      return createErrorResponse('Admin schema not found', 404);
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    // Check if society exists
    const [existingSociety] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`societies\` WHERE id = ?
    `, {
      replacements: [id]
    });

    if (!Array.isArray(existingSociety) || existingSociety.length === 0) {
      return createErrorResponse('Society not found', 404);
    }

    // Build update query dynamically
    const updateFields = ['name = ?'];
    const replacements = [name];

    if (location !== undefined) {
      updateFields.push('location = ?');
      replacements.push(location);
    }

    if (presidentName !== undefined) {
      updateFields.push('president_name = ?');
      replacements.push(presidentName);
    }

    if (contactPhone !== undefined) {
      updateFields.push('contact_phone = ?');
      replacements.push(contactPhone);
    }

    if (bmcId !== undefined) {
      updateFields.push('bmc_id = ?');
      replacements.push(bmcId);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      replacements.push(status);
    }

    if (password) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      replacements.push(hashedPassword);
    }

    updateFields.push('updated_at = NOW()');
    replacements.push(id);

    // Update the society
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`societies\` 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, {
      replacements: replacements
    });

    return createSuccessResponse('Society updated successfully', { id });

  } catch (error: unknown) {
    console.error('Error updating society:', error);
    return createErrorResponse('Failed to update society', 500);
  }
}