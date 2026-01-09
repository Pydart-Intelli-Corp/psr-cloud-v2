// Script to add OTP columns to all existing farmers tables
// Run this once to update all admin schemas with OTP support

import { connectDB } from '@/lib/database';

async function addOtpColumnsToFarmers() {
  try {
    await connectDB();
    const { sequelize } = await import('@/models').then(m => m.getModels());

    console.log('🔧 Starting OTP columns migration for farmers tables...\n');

    // Get all admin schemas
    const [schemas] = await sequelize.query(`
      SELECT DISTINCT TABLE_SCHEMA 
      FROM information_schema.TABLES 
      WHERE (TABLE_SCHEMA LIKE '%_%') 
      AND TABLE_NAME = 'farmers'
      ORDER BY TABLE_SCHEMA
    `);

    const adminSchemas = (schemas as Array<{ TABLE_SCHEMA: string }>).map(s => s.TABLE_SCHEMA);
    const uniqueSchemas = [...new Set(adminSchemas)];

    console.log(`📊 Found ${uniqueSchemas.length} admin schemas with farmers table\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const schema of uniqueSchemas) {
      try {
        // Check if columns already exist
        const [columns] = await sequelize.query(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'farmers'
          AND COLUMN_NAME IN ('otp_code', 'otp_expires')
        `, { replacements: [schema] });

        const existingColumns = (columns as Array<{ COLUMN_NAME: string }>).map(c => c.COLUMN_NAME);

        if (existingColumns.length === 2) {
          console.log(`✅ ${schema}: OTP columns already exist - skipping`);
          successCount++;
          continue;
        }

        // Add missing columns
        const alterStatements = [];
        
        if (!existingColumns.includes('otp_code')) {
          alterStatements.push(`ADD COLUMN \`otp_code\` VARCHAR(6) DEFAULT NULL COMMENT 'One-time password for farmer login'`);
        }
        
        if (!existingColumns.includes('otp_expires')) {
          alterStatements.push(`ADD COLUMN \`otp_expires\` DATETIME DEFAULT NULL COMMENT 'OTP expiration timestamp'`);
        }

        if (alterStatements.length > 0) {
          const alterQuery = `ALTER TABLE \`${schema}\`.\`farmers\` ${alterStatements.join(', ')}`;
          await sequelize.query(alterQuery);
          console.log(`✅ ${schema}: Added ${alterStatements.length} OTP column(s)`);
          successCount++;
        }

      } catch (error) {
        console.error(`❌ ${schema}: Failed to add OTP columns - ${error}`);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Success: ${successCount}/${uniqueSchemas.length} schemas`);
    console.log(`   ❌ Errors: ${errorCount}/${uniqueSchemas.length} schemas`);
    console.log('\n🎉 OTP columns migration completed!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  addOtpColumnsToFarmers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

export default addOtpColumnsToFarmers;
