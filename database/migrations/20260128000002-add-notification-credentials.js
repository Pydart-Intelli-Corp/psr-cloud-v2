/**
 * Migration: Add WhatsApp and SMS credentials to admin_payment_settings
 * Allows each admin to have their own notification service credentials
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

async function migrate() {
  const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Get list of all admin schemas
    const [databases] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME LIKE '%\\_%' 
      AND SCHEMA_NAME NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')
    `);

    console.log(`Found ${databases.length} admin schemas to update`);

    for (const db of databases) {
      const schemaName = db.SCHEMA_NAME;
      console.log(`\n📦 Updating schema: ${schemaName}`);

      try {
        // Check if table exists
        const [tableExists] = await sequelize.query(`
          SELECT 1 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = '${schemaName}' 
          AND TABLE_NAME = 'admin_payment_settings'
        `);

        if (!tableExists || tableExists.length === 0) {
          console.log(`⚠️  Table admin_payment_settings not found in ${schemaName}, skipping`);
          continue;
        }

        // Add WhatsApp credentials columns
        const whatsappColumns = [
          { name: 'whatsapp_api_key', type: 'VARCHAR(500)', nullable: true },
          { name: 'whatsapp_api_url', type: 'VARCHAR(500)', nullable: true, default: 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json' },
          { name: 'whatsapp_from_number', type: 'VARCHAR(50)', nullable: true, default: 'whatsapp:+14155238886' }
        ];

        // Add SMS credentials columns
        const smsColumns = [
          { name: 'sms_provider', type: "ENUM('twilio', 'msg91', 'textlocal')", nullable: true, default: 'twilio' },
          { name: 'sms_api_key', type: 'VARCHAR(500)', nullable: true },
          { name: 'sms_api_secret', type: 'VARCHAR(500)', nullable: true },
          { name: 'sms_api_url', type: 'VARCHAR(500)', nullable: true },
          { name: 'sms_from_number', type: 'VARCHAR(50)', nullable: true }
        ];

        const allColumns = [...whatsappColumns, ...smsColumns];

        for (const column of allColumns) {
          // Check if column already exists
          const [columnExists] = await sequelize.query(`
            SELECT COLUMN_NAME 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = '${schemaName}' 
            AND TABLE_NAME = 'admin_payment_settings' 
            AND COLUMN_NAME = '${column.name}'
          `);

          if (columnExists && columnExists.length > 0) {
            console.log(`   ✓ Column ${column.name} already exists`);
            continue;
          }

          // Add column
          let alterQuery = `
            ALTER TABLE \`${schemaName}\`.\`admin_payment_settings\`
            ADD COLUMN ${column.name} ${column.type}
          `;

          if (column.default) {
            alterQuery += ` DEFAULT ${column.default === 'twilio' ? "'twilio'" : `'${column.default}'`}`;
          }

          if (column.nullable) {
            alterQuery += ` NULL`;
          }

          await sequelize.query(alterQuery);
          console.log(`   ✅ Added column: ${column.name}`);
        }

        console.log(`✅ Updated schema: ${schemaName}`);

      } catch (schemaError) {
        console.error(`❌ Error updating schema ${schemaName}:`, schemaError.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Updated ${databases.length} admin schemas`);
    console.log(`   - Added WhatsApp credentials: api_key, api_url, from_number`);
    console.log(`   - Added SMS credentials: provider, api_key, api_secret, api_url, from_number`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
