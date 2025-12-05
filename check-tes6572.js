const { Sequelize } = require('sequelize');
const config = require('./config/database');

const sequelize = new Sequelize(config.development);

async function checkTES6572Data() {
  try {
    // Find user with dbKey TES6572
    const [users] = await sequelize.query(`
      SELECT id, fullName, dbKey, email, role 
      FROM psr_v4_main.users 
      WHERE dbKey = 'TES6572'
    `);
    
    if (users.length === 0) {
      console.log('❌ No user found with dbKey TES6572');
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:');
    console.log('   Name:', user.fullName);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   DB Key:', user.dbKey);
    
    const cleanName = user.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanName}_${user.dbKey.toLowerCase()}`;
    console.log('   Schema:', schemaName);
    
    // Check if schema exists
    const [schemas] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = '${schemaName}'
    `);
    
    if (schemas.length === 0) {
      console.log('\n❌ Schema does not exist:', schemaName);
      return;
    }
    
    console.log('\n✅ Schema exists');
    
    // Count collections
    const [collectionCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM \`${schemaName}\`.milk_collections
    `);
    
    console.log('\n📊 Total collections:', collectionCount[0].count);
    
    if (collectionCount[0].count > 0) {
      // Get sample collections
      const [sampleCollections] = await sequelize.query(`
        SELECT 
          mc.id,
          mc.farmer_id,
          mc.society_id,
          s.name as society_name,
          mc.collection_date,
          mc.shift_type,
          mc.water_percentage,
          mc.fat_percentage,
          mc.snf_percentage,
          mc.quantity,
          mc.total_amount
        FROM \`${schemaName}\`.milk_collections mc
        LEFT JOIN \`${schemaName}\`.societies s ON mc.society_id = s.id
        ORDER BY mc.collection_date DESC, mc.collection_time DESC
        LIMIT 10
      `);
      
      console.log('\n📋 Sample Collections (latest 10):');
      sampleCollections.forEach((col, idx) => {
        console.log(`\n${idx + 1}. Collection ID: ${col.id}`);
        console.log(`   Society: ${col.society_name || 'N/A'} (ID: ${col.society_id})`);
        console.log(`   Farmer: ${col.farmer_id}`);
        console.log(`   Date: ${col.collection_date} (${col.shift_type})`);
        console.log(`   Quantity: ${col.quantity}L`);
        console.log(`   Fat: ${col.fat_percentage}% | SNF: ${col.snf_percentage}% | Water: ${col.water_percentage}%`);
        console.log(`   Amount: ₹${col.total_amount}`);
      });
      
      // Get society aggregation with water percentage
      const [societyStats] = await sequelize.query(`
        SELECT 
          s.id,
          s.name,
          s.society_id,
          COUNT(DISTINCT mc.id) as total_collections_30d,
          COALESCE(SUM(mc.quantity), 0) as total_quantity_30d,
          COALESCE(SUM(mc.total_amount), 0) as total_amount_30d,
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
          ) as weighted_water_30d,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.fat_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as weighted_fat_30d,
          COALESCE(
            CASE 
              WHEN SUM(mc.quantity) > 0 
              THEN ROUND(SUM(mc.snf_percentage * mc.quantity) / SUM(mc.quantity), 2)
              ELSE 0 
            END, 0
          ) as weighted_snf_30d
        FROM \`${schemaName}\`.societies s
        LEFT JOIN \`${schemaName}\`.milk_collections mc 
          ON mc.society_id = s.id 
          AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY s.id, s.name, s.society_id
        ORDER BY weighted_water_30d DESC
      `);
      
      console.log('\n\n🏆 Society Statistics (30-day):');
      societyStats.forEach((stat, idx) => {
        console.log(`\n${idx + 1}. ${stat.name} (${stat.society_id})`);
        console.log(`   Collections: ${stat.total_collections_30d}`);
        console.log(`   Total Quantity: ${stat.total_quantity_30d}L`);
        console.log(`   Total Amount: ₹${stat.total_amount_30d}`);
        console.log(`   Avg Fat: ${stat.weighted_fat_30d}%`);
        console.log(`   Avg SNF: ${stat.weighted_snf_30d}%`);
        console.log(`   Avg Water: ${stat.weighted_water_30d}%`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkTES6572Data();
