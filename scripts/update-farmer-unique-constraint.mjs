import { Sequelize } from 'sequelize';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Create Sequelize instance like in the main app
const sequelize = new Sequelize(
  process.env.DB_NAME || 'psr_v4_c',
  process.env.DB_USER || 'psrcloud',
  process.env.DB_PASSWORD || 'Access@LRC2404',
  {
    host: process.env.DB_HOST || 'psrazuredb.mysql.database.azure.com',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectModule: mysql2,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        ca: process.env.DB_SSL_CA ? path.join(process.cwd(), process.env.DB_SSL_CA) : undefined,
      },
      connectTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30') * 1000,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30') * 1000,
      idle: parseInt(process.env.DB_POOL_IDLE || '10') * 1000,
    },
    logging: false, // Disable SQL logging for cleaner output
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  }
);

async function updateFarmerUniqueConstraints() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Connected to MySQL database');

    // Get all admin users to find their schemas
    const [admins] = await sequelize.query(`
      SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    console.log(`🔍 Found ${admins.length} admin users with schemas`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`\n🔧 Updating farmer table in schema: ${schemaName}`);

      try {
        // Check if the farmers table exists
        const [tables] = await sequelize.query(`
          SELECT TABLE_NAME FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers'
        `, { replacements: [schemaName] });

        if (tables.length === 0) {
          console.log(`⚠️  No farmers table found in schema: ${schemaName}`);
          continue;
        }

        // Check current table structure
        const [columns] = await sequelize.query(`
          SHOW INDEX FROM \`${schemaName}\`.\`farmers\` WHERE Key_name = 'farmer_id'
        `);

        let hasOldUniqueConstraint = false;
        for (const column of columns) {
          if (column.Non_unique === 0) { // Unique constraint
            hasOldUniqueConstraint = true;
            break;
          }
        }

        if (hasOldUniqueConstraint) {
          console.log(`🔄 Removing old unique constraint on farmer_id...`);
          
          // Drop the unique constraint on farmer_id
          try {
            await sequelize.query(`ALTER TABLE \`${schemaName}\`.\`farmers\` DROP INDEX \`farmer_id\``);
          } catch (error) {
            console.log(`⚠️  Could not drop farmer_id index (may not exist): ${error.message}`);
          }
        }

        // Check if the new composite unique constraint already exists
        const [existingConstraints] = await sequelize.query(`
          SHOW INDEX FROM \`${schemaName}\`.\`farmers\` WHERE Key_name = 'unique_farmer_per_society'
        `);

        if (existingConstraints.length === 0) {
          console.log(`➕ Adding new composite unique constraint (farmer_id, society_id)...`);
          
          // Add the new composite unique constraint
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`farmers\` 
            ADD CONSTRAINT \`unique_farmer_per_society\` UNIQUE (\`farmer_id\`, \`society_id\`)
          `);
          
          console.log(`✅ Successfully updated farmer table in schema: ${schemaName}`);
        } else {
          console.log(`✅ Composite unique constraint already exists in schema: ${schemaName}`);
        }

        // Ensure farmer_id is NOT NULL if it's currently nullable
        const [farmerIdColumn] = await sequelize.query(`
          SELECT IS_NULLABLE FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'farmers' AND COLUMN_NAME = 'farmer_id'
        `, { replacements: [schemaName] });

        if (farmerIdColumn.length > 0 && farmerIdColumn[0].IS_NULLABLE === 'YES') {
          console.log(`🔧 Making farmer_id NOT NULL...`);
          await sequelize.query(`
            ALTER TABLE \`${schemaName}\`.\`farmers\` 
            MODIFY COLUMN \`farmer_id\` VARCHAR(50) NOT NULL
          `);
        }

        // Ensure rf_id can be NULL (remove unique constraint if it exists and allow duplicates)
        try {
          const [rfIdConstraints] = await sequelize.query(`
            SHOW INDEX FROM \`${schemaName}\`.\`farmers\` WHERE Key_name = 'rf_id' AND Non_unique = 0
          `);
          
          if (rfIdConstraints.length > 0) {
            console.log(`🔧 Updating rf_id constraint to allow duplicates...`);
            await sequelize.query(`ALTER TABLE \`${schemaName}\`.\`farmers\` DROP INDEX \`rf_id\``);
            await sequelize.query(`
              ALTER TABLE \`${schemaName}\`.\`farmers\` 
              ADD UNIQUE KEY \`unique_rf_id\` (\`rf_id\`)
            `);
          }
        } catch (error) {
          console.log(`⚠️  RF-ID constraint update warning: ${error.message}`);
        }

      } catch (error) {
        console.error(`❌ Error updating schema ${schemaName}:`, error.message);
      }
    }

    console.log('\n🎉 Farmer table unique constraint update completed!');
    console.log('📋 Changes made:');
    console.log('   • Removed global unique constraint on farmer_id');
    console.log('   • Added composite unique constraint on (farmer_id, society_id)');
    console.log('   • Same farmer_id can now exist in different societies');
    console.log('   • RF-ID remains globally unique across all farmers');

  } catch (error) {
    console.error('💥 Database connection error:', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the migration
updateFarmerUniqueConstraints().catch(console.error);