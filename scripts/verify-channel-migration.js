const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'psr_v4_main',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function verifyMigration() {
  try {
    console.log('🔍 Verifying channel-specific unique key migration...\n');

    // Get all admin users
    const [admins] = await sequelize.query(
      `SELECT id, fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL`
    );

    console.log(`Found ${admins.length} admin schema(s)\n`);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;

      console.log(`📊 Schema: ${schemaName}`);

      // Check if table exists
      const [tables] = await sequelize.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = '${schemaName}' AND TABLE_NAME = 'rate_chart_download_history'
      `);

      if (tables.length === 0) {
        console.log('   ⚠️  Table does not exist\n');
        continue;
      }

      // Check indexes
      const [indexes] = await sequelize.query(`
        SHOW INDEXES FROM \`${schemaName}\`.rate_chart_download_history
        WHERE Key_name LIKE '%unique%'
      `);

      if (indexes.length > 0) {
        const uniqueKeyName = indexes[0].Key_name;
        console.log('   ✅ Unique Key:', uniqueKeyName);
        
        // Get all columns in this unique key
        const uniqueKeyIndexes = indexes.filter(idx => idx.Key_name === uniqueKeyName);
        const columns = uniqueKeyIndexes
          .sort((a, b) => a.Seq_in_index - b.Seq_in_index)
          .map(col => col.Column_name)
          .join(', ');
        
        console.log('   📋 Columns:', columns);
        
        // Verify channel is included
        if (columns.includes('channel')) {
          console.log('   ✅ Channel column is in unique key');
        } else {
          console.log('   ❌ Channel column is NOT in unique key');
        }
      } else {
        console.log('   ❌ No unique key found');
      }
      
      console.log('');
    }

    console.log('✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyMigration();
