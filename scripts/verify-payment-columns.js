const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

async function verifyPaymentColumns() {
  const sequelize = new Sequelize(
    dbConfig.development.database,
    dbConfig.development.username,
    dbConfig.development.password,
    {
      host: dbConfig.development.host,
      port: dbConfig.development.port,
      dialect: dbConfig.development.dialect,
      logging: false
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Get all admin schemas
    const [schemas] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME NOT IN ('psr_v4_main', 'information_schema', 'mysql', 'performance_schema', 'sys')
      AND SCHEMA_NAME LIKE '%_%'
    `);

    console.log(`📊 Checking ${schemas.length} admin schemas for payment columns:\n`);

    for (const { SCHEMA_NAME: schemaName } of schemas) {
      console.log(`\n📦 Schema: ${schemaName}`);

      // Check farmers table columns
      const [farmerColumns] = await sequelize.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = '${schemaName}' 
        AND TABLE_NAME = 'farmers'
        AND COLUMN_NAME IN ('upi_id', 'upi_enabled', 'paytm_phone', 'paytm_enabled', 
                            'preferred_payment_mode', 'whatsapp_billing_enabled', 
                            'automated_payment_enabled', 'last_payment_date', 
                            'last_payment_amount', 'pending_payment_amount')
        ORDER BY COLUMN_NAME
      `);

      const paymentColumns = [
        'upi_id', 'upi_enabled', 'paytm_phone', 'paytm_enabled',
        'preferred_payment_mode', 'whatsapp_billing_enabled',
        'automated_payment_enabled', 'last_payment_date',
        'last_payment_amount', 'pending_payment_amount'
      ];

      const existingCols = farmerColumns.map(c => c.COLUMN_NAME);
      const missingCols = paymentColumns.filter(col => !existingCols.includes(col));

      if (missingCols.length === 0) {
        console.log('  ✅ All 10 payment columns present in farmers table');
      } else {
        console.log(`  ⚠️  Missing ${missingCols.length} columns in farmers table:`);
        missingCols.forEach(col => console.log(`     - ${col}`));
      }

      // Check for payment_transactions table
      const [txnTable] = await sequelize.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = '${schemaName}' 
        AND TABLE_NAME = 'payment_transactions'
      `);

      if (txnTable.length > 0) {
        console.log('  ✅ payment_transactions table exists');
      } else {
        console.log('  ❌ payment_transactions table missing');
      }

      // Check for admin_payment_settings table
      const [settingsTable] = await sequelize.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = '${schemaName}' 
        AND TABLE_NAME = 'admin_payment_settings'
      `);

      if (settingsTable.length > 0) {
        console.log('  ✅ admin_payment_settings table exists');
        
        // Check if default settings were inserted
        const [settingsCount] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM \`${schemaName}\`.\`admin_payment_settings\`
        `);
        
        if (settingsCount[0].count > 0) {
          console.log(`  ✅ Default payment settings configured (${settingsCount[0].count} record(s))`);
        } else {
          console.log('  ⚠️  admin_payment_settings table empty');
        }
      } else {
        console.log('  ❌ admin_payment_settings table missing');
      }
    }

    console.log('\n\n✅ Verification complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyPaymentColumns();
