/**
 * Fix Empty Rate Charts
 * 
 * This script finds rate charts that have no data and provides options to:
 * 1. List all empty charts
 * 2. Delete empty charts (so they can be re-uploaded)
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const sequelize = new Sequelize(
  process.env.AZURE_MYSQL_DATABASE || '',
  process.env.AZURE_MYSQL_USER || '',
  process.env.AZURE_MYSQL_PASSWORD || '',
  {
    host: process.env.AZURE_MYSQL_HOST || '',
    port: parseInt(process.env.AZURE_MYSQL_PORT || '3306'),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.AZURE_MYSQL_SSL === 'true' ? {
        rejectUnauthorized: true
      } : false
    }
  }
);

async function findEmptyCharts() {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');

    // Get all admin schemas
    const [users] = await sequelize.query(`
      SELECT id, fullName, dbKey 
      FROM users 
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    if (!Array.isArray(users) || users.length === 0) {
      console.log('❌ No admin users found');
      return;
    }

    console.log(`📊 Checking ${users.length} admin schemas...\n`);

    let totalEmptyCharts = 0;
    const emptyChartsBySchema = [];

    for (const user of users) {
      const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

      try {
        // Check if schema exists
        const [schemas] = await sequelize.query(`
          SELECT SCHEMA_NAME 
          FROM INFORMATION_SCHEMA.SCHEMATA 
          WHERE SCHEMA_NAME = ?
        `, { replacements: [schemaName] });

        if (!Array.isArray(schemas) || schemas.length === 0) {
          continue;
        }

        // Find charts with no data
        const [emptyCharts] = await sequelize.query(`
          SELECT 
            rc.id,
            rc.file_name,
            rc.channel,
            rc.society_id,
            s.name as society_name,
            s.society_id as society_identifier,
            rc.uploaded_at,
            rc.uploaded_by,
            rc.shared_chart_id,
            CASE WHEN rc.shared_chart_id IS NULL THEN 'MASTER' ELSE 'SHARED' END as chart_type
          FROM \`${schemaName}\`.rate_charts rc
          LEFT JOIN \`${schemaName}\`.societies s ON rc.society_id = s.id
          LEFT JOIN \`${schemaName}\`.rate_chart_data rcd ON rc.id = rcd.rate_chart_id
          WHERE rcd.id IS NULL AND rc.status = 1
          GROUP BY rc.id
          ORDER BY rc.uploaded_at DESC
        `);

        if (Array.isArray(emptyCharts) && emptyCharts.length > 0) {
          totalEmptyCharts += emptyCharts.length;
          emptyChartsBySchema.push({
            schema: schemaName,
            adminName: user.fullName,
            charts: emptyCharts
          });

          console.log(`\n📋 Schema: ${schemaName}`);
          console.log(`   Admin: ${user.fullName}`);
          console.log(`   Empty Charts: ${emptyCharts.length}\n`);

          emptyCharts.forEach((chart, index) => {
            console.log(`   ${index + 1}. Chart ID: ${chart.id}`);
            console.log(`      File: ${chart.file_name}`);
            console.log(`      Channel: ${chart.channel}`);
            console.log(`      Type: ${chart.chart_type}`);
            console.log(`      Society: ${chart.society_name} (${chart.society_identifier})`);
            console.log(`      Uploaded: ${chart.uploaded_at}`);
            console.log(`      Uploaded By: ${chart.uploaded_by}`);
            
            if (chart.shared_chart_id) {
              console.log(`      References Master: ${chart.shared_chart_id}`);
            }
            console.log('');
          });
        }
      } catch (error) {
        console.error(`⚠️  Error checking schema ${schemaName}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`📊 SUMMARY: Found ${totalEmptyCharts} empty rate charts across ${emptyChartsBySchema.length} schemas`);
    console.log('='.repeat(80));

    if (totalEmptyCharts > 0) {
      console.log('\n⚠️  RECOMMENDATIONS:');
      console.log('1. These charts have no data and will fail when machines try to download them');
      console.log('2. They likely resulted from removing a master society before the data copy fix');
      console.log('3. Options to fix:');
      console.log('   a) Delete these charts from the admin dashboard');
      console.log('   b) Re-upload the CSV files for these societies and channels');
      console.log('   c) Run this script with --delete flag to automatically delete them');
      console.log('\nTo delete empty charts automatically:');
      console.log('   node scripts/fix-empty-charts.mjs --delete');
    }

    return { totalEmptyCharts, emptyChartsBySchema };

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

async function deleteEmptyCharts() {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');

    // Get all admin schemas
    const [users] = await sequelize.query(`
      SELECT id, fullName, dbKey 
      FROM users 
      WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    if (!Array.isArray(users) || users.length === 0) {
      console.log('❌ No admin users found');
      return;
    }

    console.log(`📊 Processing ${users.length} admin schemas...\n`);

    let totalDeleted = 0;

    for (const user of users) {
      const cleanAdminName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${user.dbKey.toLowerCase()}`;

      try {
        // Check if schema exists
        const [schemas] = await sequelize.query(`
          SELECT SCHEMA_NAME 
          FROM INFORMATION_SCHEMA.SCHEMATA 
          WHERE SCHEMA_NAME = ?
        `, { replacements: [schemaName] });

        if (!Array.isArray(schemas) || schemas.length === 0) {
          continue;
        }

        // Find and delete charts with no data
        const [result] = await sequelize.query(`
          DELETE rc FROM \`${schemaName}\`.rate_charts rc
          LEFT JOIN \`${schemaName}\`.rate_chart_data rcd ON rc.id = rcd.rate_chart_id
          WHERE rcd.id IS NULL AND rc.status = 1
        `);

        if (result.affectedRows > 0) {
          totalDeleted += result.affectedRows;
          console.log(`✅ Deleted ${result.affectedRows} empty charts from ${schemaName}`);
        }

      } catch (error) {
        console.error(`⚠️  Error processing schema ${schemaName}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log(`✅ COMPLETED: Deleted ${totalDeleted} empty rate charts`);
    console.log('='.repeat(80));

    if (totalDeleted > 0) {
      console.log('\n📝 Next Steps:');
      console.log('1. Re-upload the CSV files for the affected societies and channels');
      console.log('2. Machines will be able to download the new charts');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Main execution
const args = process.argv.slice(2);
const shouldDelete = args.includes('--delete');

if (shouldDelete) {
  console.log('⚠️  DELETE MODE - This will remove all empty rate charts');
  console.log('Press Ctrl+C within 5 seconds to cancel...\n');
  
  setTimeout(async () => {
    await deleteEmptyCharts();
    process.exit(0);
  }, 5000);
} else {
  findEmptyCharts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
