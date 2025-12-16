import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/database';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/response';

interface BMCData {
  name: string;
  password: string;
  bmcId: string;
  dairyFarmId?: number;
  location?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  monthlyTarget?: number;
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
    const { name, password, bmcId, dairyFarmId, location, contactPerson, phone, email, capacity, status, monthlyTarget }: BMCData = body;

    if (!name || !password || !bmcId) {
      return createErrorResponse('Name, password, and BMC ID are required', 400);
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

    // Insert BMC data into admin's schema with all fields
    const insertQuery = `
      INSERT INTO \`${schemaName}\`.\`bmcs\` 
      (name, bmc_id, password, dairy_farm_id, location, contactPerson, phone, email, capacity, status, monthly_target) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await sequelize.query(insertQuery, {
      replacements: [
        name, 
        bmcId, 
        password, 
        dairyFarmId || null,
        location || null, 
        contactPerson || null, 
        phone || null, 
        email || null,
        capacity || 2000,
        status || 'active',
        monthlyTarget || 2000
      ]
    });

    console.log(`✅ BMC added successfully to schema: ${schemaName}`);

    return createSuccessResponse('BMC added successfully', {
      bmcId,
      name,
      dairyFarmId,
      location,
      contactPerson,
      capacity: capacity || 2000,
      status: status || 'active',
      monthlyTarget: monthlyTarget || 2000
    });

  } catch (error: unknown) {
    console.error('Error adding BMC:', error);
    
    if (error instanceof Error && error.name === 'SequelizeUniqueConstraintError') {
      return createErrorResponse('BMC ID already exists', 409);
    }
    
    return createErrorResponse('Failed to add BMC', 500);
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

    // Get all BMCs from admin's schema with enhanced data and 30-day statistics
    // Using independent subqueries to avoid JOIN duplication issues
    const [bmcs] = await sequelize.query(`
      SELECT 
        b.id, 
        b.name, 
        b.bmc_id as bmcId,
        b.dairy_farm_id as dairyFarmId,
        d.name as dairyFarmName,
        b.location, 
        b.contactPerson, 
        b.phone, 
        b.email,
        b.capacity,
        b.status,
        b.monthly_target as monthlyTarget,
        b.created_at as createdAt, 
        b.updated_at as updatedAt,
        
        -- Society count
        (SELECT COUNT(*) FROM \`${schemaName}\`.\`societies\` WHERE bmc_id = b.id) as societyCount,
        
        -- Farmer count (across all societies in this BMC)
        (SELECT COUNT(*) FROM \`${schemaName}\`.\`farmers\` f 
         INNER JOIN \`${schemaName}\`.\`societies\` s ON f.society_id = s.id 
         WHERE s.bmc_id = b.id) as farmerCount,
        
        -- Total collections (30 days)
        (SELECT COUNT(*) FROM \`${schemaName}\`.\`milk_collections\` mc
         INNER JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalCollections30d,
        
        -- Total quantity (30 days)
        (SELECT COALESCE(SUM(mc.quantity), 0) FROM \`${schemaName}\`.\`milk_collections\` mc
         INNER JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalQuantity30d,
        
        -- Total amount/revenue (30 days)
        (SELECT COALESCE(SUM(mc.total_amount), 0) FROM \`${schemaName}\`.\`milk_collections\` mc
         INNER JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalAmount30d,
        
        -- Weighted Fat (30 days)
        (SELECT COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0)
         FROM \`${schemaName}\`.\`milk_collections\` mc
         INNER JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as weightedFat30d,
        
        -- Weighted SNF (30 days)
        (SELECT COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0)
         FROM \`${schemaName}\`.\`milk_collections\` mc
         INNER JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as weightedSnf30d,
        
        -- Weighted CLR (30 days)
        (SELECT COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.clr_value * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0)
         FROM \`${schemaName}\`.\`milk_collections\` mc
         INNER JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as weightedClr30d,
        
        -- Weighted Water (30 days)
        (SELECT COALESCE(
          CASE 
            WHEN SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END) > 0 
            THEN ROUND(
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.water_percentage * mc.quantity ELSE 0 END) / 
              SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END), 
              2
            )
            ELSE 0 
          END, 0)
         FROM \`${schemaName}\`.\`milk_collections\` mc
         INNER JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as weightedWater30d,
        
        -- Dispatch metrics (30 days)
        (SELECT COUNT(*) FROM \`${schemaName}\`.\`milk_dispatches\` md
         INNER JOIN \`${schemaName}\`.\`societies\` s ON md.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND md.dispatch_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalDispatches30d,
        
        (SELECT COALESCE(SUM(md.quantity), 0) FROM \`${schemaName}\`.\`milk_dispatches\` md
         INNER JOIN \`${schemaName}\`.\`societies\` s ON md.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND md.dispatch_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as dispatchedQuantity30d,
        
        -- Sales metrics (30 days)
        (SELECT COUNT(*) FROM \`${schemaName}\`.\`milk_sales\` ms
         INNER JOIN \`${schemaName}\`.\`societies\` s ON ms.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND ms.sales_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as totalSales30d,
        
        (SELECT COALESCE(SUM(ms.total_amount), 0) FROM \`${schemaName}\`.\`milk_sales\` ms
         INNER JOIN \`${schemaName}\`.\`societies\` s ON ms.society_id = s.id
         WHERE s.bmc_id = b.id 
         AND ms.sales_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as salesAmount30d
        
      FROM \`${schemaName}\`.\`bmcs\` b
      LEFT JOIN \`${schemaName}\`.\`dairy_farms\` d ON d.id = b.dairy_farm_id
      ORDER BY b.created_at DESC
    `);

    return createSuccessResponse('BMCs retrieved successfully', bmcs);

  } catch (error: unknown) {
    console.error('Error retrieving BMCs:', error);
    return createErrorResponse('Failed to retrieve BMCs', 500);
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

    const body = await request.json();
    const { id, newBmcId, deleteAll, otp } = body;

    if (!id) {
      return createErrorResponse('BMC ID is required', 400);
    }

    // OTP verification required for all BMC deletion operations (transfer or delete-all)
    if (!otp) {
      return createErrorResponse('OTP verification required for BMC deletion', 400, {
        requiresOTP: true
      });
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

    // Check if BMC exists
    const [existingBMC] = await sequelize.query(`
      SELECT id, name FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
    `, { replacements: [id] });

    if (!existingBMC || existingBMC.length === 0) {
      return createErrorResponse('BMC not found', 404);
    }

    // Check if there are societies under this BMC
    const [societies] = await sequelize.query(`
      SELECT COUNT(*) as count FROM \`${schemaName}\`.\`societies\` WHERE bmc_id = ?
    `, { replacements: [id] });

    const societyCount = (societies as any)[0]?.count || 0;

    // If societies exist and no action specified, return error with society info
    if (societyCount > 0 && !newBmcId && !deleteAll) {
      return createErrorResponse('Cannot delete BMC with active societies. Transfer societies or use delete all option.', 400, {
        hasSocieties: true,
        societyCount
      });
    }

    // Handle delete all - cascade delete everything
    if (deleteAll && societyCount > 0) {
      // Verify OTP before proceeding
      const { verifyDeleteOTP } = await import('./send-delete-otp/route');
      const isOtpValid = verifyDeleteOTP(payload.id, id, otp);
      
      if (!isOtpValid) {
        return createErrorResponse('Invalid or expired OTP. Please request a new one.', 400);
      }

      console.log(`⚠️  OTP verified! Cascade deleting all data under BMC ${id}...`);
      
      // Get all society IDs under this BMC
      const [bmcSocieties] = await sequelize.query(`
        SELECT id FROM \`${schemaName}\`.\`societies\` WHERE bmc_id = ?
      `, { replacements: [id] });

      const societyIds = (bmcSocieties as any[]).map((s: any) => s.id);

      if (societyIds.length > 0) {
        // Delete milk collections (farmer data)
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`milk_collections\` 
          WHERE farmer_id IN (
            SELECT id FROM \`${schemaName}\`.\`farmers\` WHERE society_id IN (?)
          )
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted milk collections`);

        // Delete milk sales (society data)
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`milk_sales\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted milk sales`);

        // Delete milk dispatches (society data)
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`milk_dispatches\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted milk dispatches`);

        // Delete section pulse data
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`section_pulse\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted section pulse data`);

        // Get rate chart IDs for these societies
        const [rateCharts] = await sequelize.query(`
          SELECT id FROM \`${schemaName}\`.\`rate_charts\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        const rateChartIds = (rateCharts as any[]).map((rc: any) => rc.id);

        if (rateChartIds.length > 0) {
          // Delete rate chart download history
          await sequelize.query(`
            DELETE FROM \`${schemaName}\`.\`rate_chart_download_history\` WHERE rate_chart_id IN (?)
          `, { replacements: [rateChartIds] });
          console.log(`✅ Deleted rate chart download history`);

          // Delete rate chart data
          await sequelize.query(`
            DELETE FROM \`${schemaName}\`.\`rate_chart_data\` WHERE rate_chart_id IN (?)
          `, { replacements: [rateChartIds] });
          console.log(`✅ Deleted rate chart data`);

          // Delete rate charts
          await sequelize.query(`
            DELETE FROM \`${schemaName}\`.\`rate_charts\` WHERE id IN (?)
          `, { replacements: [rateChartIds] });
          console.log(`✅ Deleted rate charts`);
        }

        // Delete machine statistics (has both machine_id and society_id foreign keys)
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`machine_statistics\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted machine statistics`);

        // Delete machine corrections (admin-saved corrections)
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`machine_corrections\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted machine corrections`);

        // Delete machine corrections from machine (device-saved corrections)
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`machine_corrections_from_machine\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted machine corrections from device`);

        // Delete farmers
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`farmers\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted farmers`);

        // Delete machines
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`machines\` WHERE society_id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted machines`);

        // Delete societies
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.\`societies\` WHERE id IN (?)
        `, { replacements: [societyIds] });
        console.log(`✅ Deleted societies`);

        console.log(`✅ Cascade deleted all data: ${societyIds.length} societies and all related data`);
      }
    }

    // If newBmcId provided, transfer all societies
    if (newBmcId && societyCount > 0 && !deleteAll) {
      // Verify OTP before transfer
      const { verifyDeleteOTP } = await import('./send-delete-otp/route');
      const isOtpValid = verifyDeleteOTP(payload.id, id, otp);
      
      if (!isOtpValid) {
        return createErrorResponse('Invalid or expired OTP. Please request a new one.', 400);
      }

      console.log(`✅ OTP verified for BMC ${id} transfer operation`);

      // Verify new BMC exists
      const [newBMC] = await sequelize.query(`
        SELECT id, name FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
      `, { replacements: [newBmcId] });

      if (!newBMC || newBMC.length === 0) {
        return createErrorResponse('Target BMC not found', 404);
      }

      // Transfer all societies to new BMC
      await sequelize.query(`
        UPDATE \`${schemaName}\`.\`societies\` SET bmc_id = ? WHERE bmc_id = ?
      `, { replacements: [newBmcId, id] });

      console.log(`✅ Transferred ${societyCount} societies from BMC ${id} to BMC ${newBmcId}`);
    }

    // Verify OTP before deleting BMC (for direct deletion without societies)
    if (!deleteAll && !newBmcId && otp) {
      const { verifyDeleteOTP } = await import('./send-delete-otp/route');
      const isOtpValid = verifyDeleteOTP(payload.id, id, otp);
      
      if (!isOtpValid) {
        return createErrorResponse('Invalid or expired OTP. Please request a new one.', 400);
      }

      console.log(`✅ OTP verified for BMC ${id} deletion`);
    }

    // Delete BMC from admin's schema
    await sequelize.query(`
      DELETE FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
    `, { replacements: [id] });

    console.log(`✅ BMC deleted successfully from schema: ${schemaName}`);

    return createSuccessResponse('BMC deleted successfully', {
      transferredSocieties: deleteAll ? 0 : societyCount,
      deletedAll: deleteAll || false
    });

  } catch (error: unknown) {
    console.error('Error deleting BMC:', error);
    return createErrorResponse('Failed to delete BMC', 500);
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
    const { id, name, password, dairyFarmId, location, contactPerson, phone, email, capacity, status, monthlyTarget } = body;

    if (!id) {
      return createErrorResponse('BMC ID is required', 400);
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

    // Check if BMC exists
    const [existingBMC] = await sequelize.query(`
      SELECT id FROM \`${schemaName}\`.\`bmcs\` WHERE id = ?
    `, { replacements: [id] });

    if (!existingBMC || existingBMC.length === 0) {
      return createErrorResponse('BMC not found', 404);
    }

    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: (string | number | null)[] = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (dairyFarmId !== undefined) {
      updateFields.push('dairy_farm_id = ?');
      updateValues.push(dairyFarmId || null);
    }

    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location || null);
    }

    if (contactPerson !== undefined) {
      updateFields.push('contactPerson = ?');
      updateValues.push(contactPerson || null);
    }

    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email || null);
    }

    if (capacity !== undefined) {
      updateFields.push('capacity = ?');
      updateValues.push(capacity || null);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (monthlyTarget !== undefined) {
      updateFields.push('monthly_target = ?');
      updateValues.push(monthlyTarget || null);
    }

    if (password !== undefined && password !== '') {
      updateFields.push('password = ?');
      updateValues.push(password);
    }

    if (updateFields.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = NOW()');

    // Add ID to values array for WHERE clause
    updateValues.push(id);

    // Execute update query
    await sequelize.query(`
      UPDATE \`${schemaName}\`.\`bmcs\`
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, { replacements: updateValues });

    console.log(`✅ BMC updated successfully in schema: ${schemaName}`);

    return createSuccessResponse('BMC updated successfully');

  } catch (error: unknown) {
    console.error('Error updating BMC:', error);
    return createErrorResponse('Failed to update BMC', 500);
  }
}