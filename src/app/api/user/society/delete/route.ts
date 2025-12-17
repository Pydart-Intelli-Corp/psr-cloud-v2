import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  id: number;
  email: string;
  role: string;
}

export async function DELETE(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const otp = searchParams.get('otp');

    if (!id || !otp) {
      return NextResponse.json({ 
        success: false,
        error: 'Society ID and OTP are required' 
      }, { status: 400 });
    }

    console.log(`🔐 Verifying OTP for society ${id}, admin ${decoded.id}, OTP: ${otp}`);

    // Verify OTP
    const { verifyDeleteOTP } = await import('../send-delete-otp/route');
    const isValidOTP = verifyDeleteOTP(decoded.id, parseInt(id), otp);
    
    if (!isValidOTP) {
      console.log(`❌ OTP verification failed for society ${id}`);
      return NextResponse.json({ 
        success: false,
        error: 'Invalid or expired OTP. Please request a new OTP and try again.' 
      }, { status: 401 });
    }

    console.log(`✅ OTP verified successfully for society ${id}`);

    await connectDB();
    const { getModels } = await import('@/models');
    const { sequelize, User } = getModels();

    // Get admin user
    const admin = await User.findByPk(decoded.id);
    if (!admin || !admin.dbKey) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Generate schema name
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

    console.log(`🗑️ Deleting society ${id} and all related data from schema: ${schemaName}`);

    // Use transaction for safe deletion
    const transaction = await sequelize.transaction();

    try {
      // Disable foreign key checks temporarily to prevent ON DELETE SET NULL from triggering
      await sequelize.query(`SET FOREIGN_KEY_CHECKS = 0`, { transaction });
      console.log(`⚙️ Disabled foreign key checks`);

      // Step 1: Get all machine IDs in this society (needed for rate chart deletion)
      const [machines] = await sequelize.query(`
        SELECT id, machine_id FROM \`${schemaName}\`.machines WHERE society_id = ?
      `, { replacements: [id], transaction });

      const machineIds = (machines as Array<{ id: number; machine_id: string }>).map(m => m.id);
      const machineIdStrings = (machines as Array<{ id: number; machine_id: string }>).map(m => m.machine_id);

      console.log(`Found ${machineIds.length} machines to cascade delete:`, machineIdStrings);

      // Step 2: Delete milk collections for this society
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.milk_collections WHERE society_id = ?
      `, { replacements: [id], transaction });
      console.log(`✓ Deleted milk collections for society ${id}`);

      // Step 3: Delete milk dispatches for this society
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.milk_dispatches WHERE society_id = ?
      `, { replacements: [id], transaction });
      console.log(`✓ Deleted milk dispatches for society ${id}`);

      // Step 4: Delete milk sales for this society
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.milk_sales WHERE society_id = ?
      `, { replacements: [id], transaction });
      console.log(`✓ Deleted milk sales for society ${id}`);

      // Step 5: Delete rate charts for this society (rate_charts use society_id, not machine_id)
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.rate_charts WHERE society_id = ?
      `, { replacements: [id], transaction });
      console.log(`✓ Deleted rate charts for society ${id}`);

      // Step 6: Delete rate chart download history for this society and its machines
      if (machineIds.length > 0) {
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.rate_chart_download_history WHERE machine_id IN (?)
        `, { replacements: [machineIds], transaction });
        console.log(`✓ Deleted rate chart download history for ${machineIds.length} machines`);

        // Step 7: Delete machine statistics
        try {
          await sequelize.query(`
            DELETE FROM \`${schemaName}\`.machine_statistics WHERE machine_id IN (?)
          `, { replacements: [machineIds], transaction });
          console.log(`✓ Deleted machine statistics for ${machineIds.length} machines`);
        } catch (err) {
          console.log('⚠️ Machine statistics table may not exist, skipping');
        }

        // Step 8: Delete ESP32 machine corrections
        try {
          await sequelize.query(`
            DELETE FROM \`${schemaName}\`.esp32_machine_corrections WHERE machine_id IN (?)
          `, { replacements: [machineIds], transaction });
          console.log(`✓ Deleted ESP32 corrections`);
        } catch (err) {
          console.log('⚠️ ESP32 corrections table may not exist, skipping');
        }
      }

      // Step 9: Delete machines in this society (explicitly by ID to avoid FK constraints)
      if (machineIds.length > 0) {
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.machines WHERE id IN (?)
        `, { replacements: [machineIds], transaction });
        console.log(`✓ Deleted ${machineIds.length} machines`);
      } else {
        console.log(`ℹ️ No machines to delete`);
      }

      // Step 10: Delete farmers in this society
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.farmers WHERE society_id = ?
      `, { replacements: [id], transaction });
      console.log(`✓ Deleted farmers for society ${id}`);

      // Step 11: Delete section pulse data for this society
      try {
        await sequelize.query(`
          DELETE FROM \`${schemaName}\`.section_pulse WHERE society_id = ?
        `, { replacements: [id], transaction });
        console.log(`✓ Deleted section pulse data`);
      } catch (err) {
        console.log('⚠️ Section pulse table may not exist, skipping');
      }

      // Step 12: Finally, delete the society itself
      await sequelize.query(`
        DELETE FROM \`${schemaName}\`.societies WHERE id = ?
      `, { replacements: [id], transaction });
      console.log(`✓ Deleted society ${id}`);

      // Re-enable foreign key checks
      await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`, { transaction });
      console.log(`⚙️ Re-enabled foreign key checks`);

      // Commit transaction
      await transaction.commit();
      console.log(`✅ Successfully deleted society ${id} and all related data`);

      return NextResponse.json({ 
        success: true, 
        message: 'Society and all related data deleted successfully' 
      });

    } catch (deleteError) {
      // Re-enable foreign key checks even on error
      try {
        await sequelize.query(`SET FOREIGN_KEY_CHECKS = 1`, { transaction });
      } catch (fkError) {
        console.error('Failed to re-enable foreign key checks:', fkError);
      }
      // Rollback transaction on error
      await transaction.rollback();
      console.error('❌ Error during cascade deletion, transaction rolled back:', deleteError);
      
      // Return proper error response
      const errorMessage = deleteError instanceof Error 
        ? deleteError.message 
        : 'Failed to delete society and related data';
      
      return NextResponse.json({ 
        success: false,
        error: errorMessage 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Delete society error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid token' 
      }, { status: 401 });
    }
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to delete society';
      
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 });
  }
}
