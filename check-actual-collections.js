const { Sequelize } = require('sequelize');
const config = require('./config/database');

const sequelize = new Sequelize(config.development);

async function checkActualCollections() {
  try {
    const schemaName = 'babumongopi_bab1568';
    
    // Check for ANY collections
    const [allCollections] = await sequelize.query(`
      SELECT COUNT(*) as count FROM \`${schemaName}\`.milk_collections
    `);
    console.log('Total collections in milk_collections table:', allCollections[0].count);
    
    // Get sample data from milk_collections
    const [sampleData] = await sequelize.query(`
      SELECT 
        id,
        farmer_id,
        society_id,
        machine_id,
        collection_date,
        water_percentage,
        quantity,
        total_amount
      FROM \`${schemaName}\`.milk_collections
      ORDER BY id DESC
      LIMIT 10
    `);
    
    console.log('\nSample milk_collections data:');
    console.log(JSON.stringify(sampleData, null, 2));
    
    // Check the exact query from collections report API
    const [reportData] = await sequelize.query(`
      SELECT 
        mc.id,
        mc.farmer_id,
        COALESCE(f.name, 'No Name') as farmer_name,
        s.society_id,
        s.name as society_name,
        s.bmc_id,
        b.name as bmc_name,
        mc.collection_date,
        mc.water_percentage,
        mc.quantity,
        mc.total_amount
      FROM \`${schemaName}\`.milk_collections mc
      LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
      LEFT JOIN \`${schemaName}\`.bmcs b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.farmers f ON f.farmer_id = mc.farmer_id AND f.society_id = mc.society_id
      ORDER BY mc.collection_date DESC, mc.collection_time DESC
      LIMIT 10
    `);
    
    console.log('\n\nReport API Query Result (first 10):');
    console.log(JSON.stringify(reportData, null, 2));
    
    // Now check society aggregation with 30 day filter
    console.log('\n\n30-Day Society Aggregation:');
    const [societyAgg] = await sequelize.query(`
      SELECT 
        s.id,
        s.name,
        s.society_id,
        COUNT(mc.id) as collection_count,
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
      FROM \`${schemaName}\`.societies s
      LEFT JOIN \`${schemaName}\`.milk_collections mc 
        ON mc.society_id = s.id 
        AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY s.id, s.name, s.society_id
    `);
    
    console.log(JSON.stringify(societyAgg, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkActualCollections();
