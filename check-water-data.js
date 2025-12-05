const { Sequelize } = require('sequelize');
const config = require('./config/database');

const sequelize = new Sequelize(config.development);

async function checkWaterData() {
  try {
    // Get list of admin schemas
    const [schemas] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME LIKE '%_psr'
      LIMIT 5
    `);
    
    console.log('Found schemas:', schemas.map(s => s.SCHEMA_NAME).join(', '));
    
    // Check first schema for water data
    if (schemas.length > 0) {
      const schema = schemas[0].SCHEMA_NAME;
      console.log(`\nChecking schema: ${schema}`);
      
      // Check if milk_collections table exists
      const [tables] = await sequelize.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = '${schema}' 
        AND TABLE_NAME = 'milk_collections'
      `);
      
      if (tables.length === 0) {
        console.log('milk_collections table does not exist in this schema');
        return;
      }
      
      // Check water_percentage column
      const [columns] = await sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = '${schema}'
        AND TABLE_NAME = 'milk_collections'
        AND COLUMN_NAME = 'water_percentage'
      `);
      
      console.log('\nwater_percentage column:', columns);
      
      // Get sample data
      const [collections] = await sequelize.query(`
        SELECT 
          id,
          society_id,
          water_percentage,
          quantity,
          collection_date
        FROM ${schema}.milk_collections
        ORDER BY collection_date DESC
        LIMIT 10
      `);
      
      console.log('\nSample collections:');
      console.log(JSON.stringify(collections, null, 2));
      
      // Get statistics
      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_records,
          SUM(CASE WHEN water_percentage IS NOT NULL AND water_percentage > 0 THEN 1 ELSE 0 END) as records_with_water,
          AVG(CASE WHEN water_percentage IS NOT NULL AND water_percentage > 0 THEN water_percentage ELSE NULL END) as avg_water,
          MIN(water_percentage) as min_water,
          MAX(water_percentage) as max_water
        FROM ${schema}.milk_collections
        WHERE collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `);
      
      console.log('\n30-day Statistics:');
      console.log(JSON.stringify(stats, null, 2));
      
      // Get weighted average by society
      const [societyStats] = await sequelize.query(`
        SELECT 
          s.id,
          s.name,
          COUNT(mc.id) as collection_count,
          SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END) as valid_quantity,
          SUM(mc.quantity) as total_quantity,
          COALESCE(
            CASE 
              WHEN SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END) > 0 
              THEN ROUND(
                SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.water_percentage * mc.quantity ELSE 0 END) / 
                SUM(CASE WHEN mc.water_percentage IS NOT NULL THEN mc.quantity ELSE 0 END), 
                2
              )
              ELSE 0 
            END, 0
          ) as weighted_water_30d
        FROM ${schema}.societies s
        LEFT JOIN ${schema}.milk_collections mc 
          ON s.id = mc.society_id 
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY s.id, s.name
        HAVING collection_count > 0
        ORDER BY weighted_water_30d DESC
        LIMIT 5
      `);
      
      console.log('\nTop 5 societies by water percentage:');
      console.log(JSON.stringify(societyStats, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkWaterData();
