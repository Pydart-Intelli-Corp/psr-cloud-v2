const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigration() {
  let connection;
  
  try {
    console.log('🔗 Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST || '168.231.121.19'}`);
    console.log(`Database: ${process.env.DB_NAME || 'psr_v4_main'}`);
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '168.231.121.19',
      user: process.env.DB_USER || 'psr_admin',
      password: process.env.DB_PASSWORD || 'PsrAdmin@20252!',
      database: process.env.DB_NAME || 'psr_v4_main',
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: process.env.DB_HOST?.includes('azure') ? {
        rejectUnauthorized: false
      } : undefined
    });

    console.log('✅ Connected to database successfully\n');

    // Check if column already exists
    console.log('🔍 Checking if image_url column exists...');
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM `machinetype` LIKE 'image_url'"
    );

    if (columns.length > 0) {
      console.log('⚠️  Column image_url already exists. Skipping migration.');
      return;
    }

    console.log('📝 Column does not exist. Adding image_url column...\n');

    // Add the column
    await connection.query(`
      ALTER TABLE \`machinetype\` 
      ADD COLUMN \`image_url\` VARCHAR(500) NULL 
      COMMENT 'URL path to machine image' 
      AFTER \`is_active\`
    `);

    console.log('✅ Successfully added image_url column\n');

    // Verify the column was added
    console.log('🔍 Verifying column was added...');
    const [verify] = await connection.query('DESCRIBE `machinetype`');
    
    console.log('\n📊 Current machinetype table structure:');
    console.table(verify);

    // Check if column exists in verification
    const imageUrlColumn = verify.find(col => col.Field === 'image_url');
    if (imageUrlColumn) {
      console.log('\n✅ Migration completed successfully!');
      console.log('✅ image_url column added to machinetype table');
      console.log(`   Type: ${imageUrlColumn.Type}`);
      console.log(`   Null: ${imageUrlColumn.Null}`);
      console.log(`   Default: ${imageUrlColumn.Default}`);
    } else {
      console.log('\n❌ Migration failed - column not found after creation');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run migration
console.log('🚀 Starting database migration: Add image_url to machinetype\n');
console.log('=' .repeat(60));
runMigration()
  .then(() => {
    console.log('=' .repeat(60));
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
