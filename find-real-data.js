const { Sequelize } = require('sequelize');
const config = require('./config/database');

const sequelize = new Sequelize(config.development);

async function findRealData() {
  try {
    // Get all schemas
    const [schemas] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME LIKE '%psr%' OR SCHEMA_NAME LIKE '%bab%'
    `);
    
    console.log('All PSR-related schemas:');
    schemas.forEach(s => console.log('  -', s.SCHEMA_NAME));
    
    // Check each schema for milk_collections data
    console.log('\nChecking for milk collection data in each schema:\n');
    
    for (const schema of schemas) {
      const schemaName = schema.SCHEMA_NAME;
      
      try {
        // Check if milk_collections table exists
        const [tables] = await sequelize.query(`
          SELECT TABLE_NAME 
          FROM information_schema.TABLES 
          WHERE TABLE_SCHEMA = '${schemaName}' 
          AND TABLE_NAME = 'milk_collections'
        `);
        
        if (tables.length > 0) {
          const [count] = await sequelize.query(`
            SELECT COUNT(*) as count FROM \`${schemaName}\`.milk_collections
          `);
          
          if (count[0].count > 0) {
            console.log(`${schemaName}: ${count[0].count} collections found!`);
            
            // Get sample
            const [sample] = await sequelize.query(`
              SELECT 
                id, farmer_id, society_id, machine_id, 
                collection_date, water_percentage, quantity
              FROM \`${schemaName}\`.milk_collections
              ORDER BY id DESC
              LIMIT 3
            `);
            
            console.log('Sample data:');
            console.log(JSON.stringify(sample, null, 2));
            console.log('');
          } else {
            console.log(`${schemaName}: 0 collections`);
          }
        }
      } catch (err) {
        // Skip if table doesn't exist
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

findRealData();
