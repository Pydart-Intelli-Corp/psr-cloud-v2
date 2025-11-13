import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function addSharedChartIdColumn() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!\n');

    // Get all admin schemas - looking for pattern like 'poornasreeequipments_poo5382'
    const [databases] = await connection.query(`
      SHOW DATABASES LIKE '%\\_poo%'
    `);

    console.log(`📊 Found ${databases.length} admin schemas\n`);

    for (const db of databases) {
      const schemaName = Object.values(db)[0];
      console.log(`\n📝 Processing schema: ${schemaName}`);

      // Check if rate_charts table exists
      const [tables] = await connection.query(`
        SHOW TABLES FROM \`${schemaName}\` LIKE 'rate_charts'
      `);

      if (tables.length === 0) {
        console.log(`   ⏭️  Skipping - rate_charts table not found`);
        continue;
      }

      // Check if shared_chart_id column already exists
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM \`${schemaName}\`.\`rate_charts\` LIKE 'shared_chart_id'
      `);

      if (columns.length > 0) {
        console.log(`   ℹ️  Column 'shared_chart_id' already exists`);
        continue;
      }

      // Add shared_chart_id column
      console.log(`   ➕ Adding shared_chart_id column...`);
      await connection.query(`
        ALTER TABLE \`${schemaName}\`.\`rate_charts\`
        ADD COLUMN \`shared_chart_id\` INT NULL COMMENT 'Reference to master rate chart for shared data' AFTER \`id\`,
        ADD INDEX \`idx_shared_chart_id\` (\`shared_chart_id\`)
      `);

      console.log(`   ✅ Column added successfully!`);
    }

    console.log('\n\n🎉 Migration completed successfully!');
    console.log(`✅ Updated ${databases.length} schema(s)`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

addSharedChartIdColumn();
