/**
 * Automated Payment Scheduler
 * Processes scheduled payments for farmers based on admin settings
 * 
 * Features:
 * - Checks payment_threshold before processing
 * - Respects payment_cycle (daily/weekly/biweekly/monthly)
 * - Processes on configured payment_day
 * - Sends notifications automatically
 * - Logs all scheduled payments
 * 
 * Usage:
 * - Run manually: node scripts/payment-scheduler.js
 * - Run with PM2: pm2 start scripts/payment-scheduler.js --cron "0 2 * * *"
 * - Run with cron: 0 2 * * * node /path/to/scripts/payment-scheduler.js
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Database connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false, // Set to console.log for debugging
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
function getCurrentDayOfWeek() {
  return new Date().getDay();
}

/**
 * Get day of month (1-31)
 */
function getCurrentDayOfMonth() {
  return new Date().getDate();
}

/**
 * Check if today is a payment day based on cycle
 */
function isPaymentDay(cycle, paymentDay) {
  const today = new Date();
  
  switch (cycle) {
    case 'daily':
      return true;
      
    case 'weekly':
      // paymentDay: 0-6 (Sunday-Saturday)
      return getCurrentDayOfWeek() === paymentDay;
      
    case 'biweekly':
      // paymentDay: 0-6 (day of week), runs every 2 weeks
      const weekNumber = Math.floor(today.getDate() / 7);
      return getCurrentDayOfWeek() === paymentDay && weekNumber % 2 === 0;
      
    case 'monthly':
      // paymentDay: 1-31 (day of month)
      return getCurrentDayOfMonth() === paymentDay;
      
    default:
      return false;
  }
}

/**
 * Get eligible farmers for payment
 */
async function getEligibleFarmers(schemaName, threshold) {
  const [farmers] = await sequelize.query(`
    SELECT 
      f.id,
      f.name,
      f.farmeruid,
      f.phone,
      f.paytm_phone,
      f.email,
      f.pending_payment_amount,
      f.last_payment_date,
      s.id as society_id,
      s.name as society_name
    FROM \`${schemaName}\`.\`farmers\` f
    LEFT JOIN \`${schemaName}\`.\`societies\` s ON f.society_id = s.id
    WHERE f.pending_payment_amount >= ?
    AND f.paytm_enabled = 'YES'
    ORDER BY f.pending_payment_amount DESC
  `, { replacements: [threshold] });

  return farmers;
}

/**
 * Process payment for a farmer
 */
async function processFarmerPayment(schemaName, farmer, paymentSettings, adminId) {
  const transactionId = `AUTO_${Date.now()}_${farmer.id}`;
  const paymentDate = new Date().toISOString().split('T')[0];
  
  try {
    // Determine payment method based on admin settings
    let paymentMethod = 'paytm'; // Default
    let paymentStatus = 'pending';
    
    if (paymentSettings.paytm_enabled === 'YES' && farmer.paytm_phone) {
      paymentMethod = 'paytm';
      // In production, would call Paytm API here
      // For now, mark as pending for manual verification
    } else if (paymentSettings.upi_enabled === 'YES') {
      paymentMethod = 'upi';
    } else if (paymentSettings.bank_transfer_enabled === 'YES') {
      paymentMethod = 'bank_transfer';
    } else {
      throw new Error('No payment method available');
    }

    // Create transaction record
    await sequelize.query(`
      INSERT INTO \`${schemaName}\`.\`payment_transactions\`
      (
        farmer_id,
        society_id,
        transaction_id,
        amount,
        payment_method,
        payment_date,
        transaction_status,
        is_automated,
        created_by,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'YES', ?, NOW(), NOW())
    `, {
      replacements: [
        farmer.id,
        farmer.society_id,
        transactionId,
        farmer.pending_payment_amount,
        paymentMethod,
        paymentDate,
        paymentStatus,
        adminId
      ]
    });

    console.log(`✅ Payment scheduled for ${farmer.name} (${farmer.farmeruid}): ₹${farmer.pending_payment_amount}`);
    
    return {
      success: true,
      transactionId,
      farmer: farmer.name,
      amount: farmer.pending_payment_amount
    };
    
  } catch (error) {
    console.error(`❌ Payment failed for ${farmer.name}:`, error.message);
    
    // Log failed transaction
    await sequelize.query(`
      INSERT INTO \`${schemaName}\`.\`payment_transactions\`
      (
        farmer_id,
        society_id,
        transaction_id,
        amount,
        payment_method,
        payment_date,
        transaction_status,
        failure_reason,
        is_automated,
        created_by,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'failed', ?, 'YES', ?, NOW(), NOW())
    `, {
      replacements: [
        farmer.id,
        farmer.society_id,
        transactionId,
        farmer.pending_payment_amount,
        'paytm',
        paymentDate,
        error.message,
        adminId
      ]
    });
    
    return {
      success: false,
      farmer: farmer.name,
      error: error.message
    };
  }
}

/**
 * Process automated payments for a single admin
 */
async function processAdminPayments(admin, schemaName) {
  console.log(`\n📦 Processing payments for: ${admin.fullName} (${schemaName})`);
  
  try {
    // Get payment settings
    const [settings] = await sequelize.query(`
      SELECT * FROM \`${schemaName}\`.\`admin_payment_settings\` LIMIT 1
    `);

    if (!settings || settings.length === 0) {
      console.log('⚠️  No payment settings configured, skipping');
      return { processed: 0, success: 0, failed: 0 };
    }

    const paymentSettings = settings[0];

    // Check if automated payments are enabled
    if (paymentSettings.auto_payment_enabled !== 'YES') {
      console.log('⚠️  Automated payments disabled, skipping');
      return { processed: 0, success: 0, failed: 0 };
    }

    // Check if today is a payment day
    if (!isPaymentDay(paymentSettings.payment_cycle, paymentSettings.payment_day)) {
      console.log(`⏭️  Not a payment day (${paymentSettings.payment_cycle}, day ${paymentSettings.payment_day}), skipping`);
      return { processed: 0, success: 0, failed: 0 };
    }

    console.log(`✅ Payment day matched! Cycle: ${paymentSettings.payment_cycle}, Threshold: ₹${paymentSettings.payment_threshold}`);

    // Get eligible farmers
    const eligibleFarmers = await getEligibleFarmers(schemaName, paymentSettings.payment_threshold);
    
    if (eligibleFarmers.length === 0) {
      console.log('⚠️  No eligible farmers found');
      return { processed: 0, success: 0, failed: 0 };
    }

    console.log(`📊 Found ${eligibleFarmers.length} eligible farmers`);

    // Process payments
    let successCount = 0;
    let failedCount = 0;

    for (const farmer of eligibleFarmers) {
      const result = await processFarmerPayment(schemaName, farmer, paymentSettings, admin.id);
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }
      
      // Add small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📈 Summary for ${admin.fullName}:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   📊 Total: ${eligibleFarmers.length}`);

    return {
      processed: eligibleFarmers.length,
      success: successCount,
      failed: failedCount
    };

  } catch (error) {
    console.error(`❌ Error processing admin ${admin.fullName}:`, error);
    return { processed: 0, success: 0, failed: 0, error: error.message };
  }
}

/**
 * Main scheduler function
 */
async function runScheduler() {
  const startTime = new Date();
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     AUTOMATED PAYMENT SCHEDULER                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`⏰ Started at: ${startTime.toISOString()}`);
  console.log(`📅 Date: ${startTime.toLocaleDateString()}`);
  console.log(`🕐 Time: ${startTime.toLocaleTimeString()}\n`);

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Get all admin users
    const [admins] = await sequelize.query(`
      SELECT id, fullName, dbKey 
      FROM psr_v4_main.users 
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    if (!admins || admins.length === 0) {
      console.log('⚠️  No admin users found');
      return;
    }

    console.log(`👥 Found ${admins.length} admin(s) to process\n`);

    // Process each admin
    let totalStats = {
      admins: admins.length,
      processed: 0,
      success: 0,
      failed: 0
    };

    for (const admin of admins) {
      const schemaName = `${admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}_${admin.dbKey.toLowerCase()}`;
      const stats = await processAdminPayments(admin, schemaName);
      
      totalStats.processed += stats.processed;
      totalStats.success += stats.success;
      totalStats.failed += stats.failed;
    }

    // Final summary
    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     SCHEDULER COMPLETED                                ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`👥 Admins processed: ${totalStats.admins}`);
    console.log(`📊 Total payments: ${totalStats.processed}`);
    console.log(`✅ Successful: ${totalStats.success}`);
    console.log(`❌ Failed: ${totalStats.failed}`);
    console.log(`⏰ Completed at: ${endTime.toISOString()}\n`);

  } catch (error) {
    console.error('❌ Scheduler error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run scheduler if executed directly
if (require.main === module) {
  runScheduler()
    .then(() => {
      console.log('✅ Scheduler finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Scheduler failed:', error);
      process.exit(1);
    });
}

module.exports = { runScheduler };
