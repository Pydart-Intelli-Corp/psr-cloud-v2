const { Sequelize } = require('sequelize');
const config = require('./config/database');

const sequelize = new Sequelize(config.development);

async function checkSocietyData() {
  try {
    // Get admin user
    const [admins] = await sequelize.query(`
      SELECT id, fullName, dbKey 
      FROM psr_v4_main.users 
      WHERE role = 'admin' 
      LIMIT 1
    `);
    
    if (admins.length === 0) {
      console.log('No admin users found');
      return;
    }
    
    const admin = admins[0];
    console.log('Admin found:', admin.fullName);
    
    const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
    
    console.log('Schema name:', schemaName);
    
    // Check if schema exists
    const [schemas] = await sequelize.query(`
      SELECT SCHEMA_NAME 
      FROM information_schema.SCHEMATA 
      WHERE SCHEMA_NAME = '${schemaName}'
    `);
    
    if (schemas.length === 0) {
      console.log('Schema does not exist');
      return;
    }
    
    console.log('\nFetching society data with 30-day statistics...\n');
    
    // Run the exact same query as the API
    const [societies] = await sequelize.query(`
      SELECT 
        s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, s.bmc_id, s.status,
        b.name as bmc_name, s.created_at, s.updated_at,
        COALESCE(COUNT(DISTINCT mc.id), 0) as total_collections_30d,
        COALESCE(SUM(mc.quantity), 0) as total_quantity_30d,
        COALESCE(SUM(mc.total_amount), 0) as total_amount_30d,
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
        ) as weighted_snf_30d,
        COALESCE(
          CASE 
            WHEN SUM(mc.quantity) > 0 
            THEN ROUND(SUM(mc.clr_value * mc.quantity) / SUM(mc.quantity), 2)
            ELSE 0 
          END, 0
        ) as weighted_clr_30d,
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
      FROM \`${schemaName}\`.\`societies\` s
      LEFT JOIN \`${schemaName}\`.\`bmcs\` b ON s.bmc_id = b.id
      LEFT JOIN \`${schemaName}\`.\`milk_collections\` mc 
        ON mc.society_id = s.id 
        AND mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY s.id, s.name, s.society_id, s.location, s.president_name, s.contact_phone, 
               s.bmc_id, s.status, b.name, s.created_at, s.updated_at
      ORDER BY s.created_at DESC
    `);
    
    console.log(`Found ${societies.length} societies\n`);
    
    societies.forEach((society, index) => {
      console.log(`${index + 1}. ${society.name} (${society.society_id})`);
      console.log(`   Collections: ${society.total_collections_30d}`);
      console.log(`   Quantity: ${society.total_quantity_30d} L`);
      console.log(`   Amount: ₹${society.total_amount_30d}`);
      console.log(`   Fat: ${society.weighted_fat_30d}%`);
      console.log(`   SNF: ${society.weighted_snf_30d}%`);
      console.log(`   CLR: ${society.weighted_clr_30d}`);
      console.log(`   Water: ${society.weighted_water_30d}%`);
      console.log('');
    });
    
    // Check raw milk collection data for water percentage
    console.log('\nChecking sample milk collections...\n');
    
    const [collections] = await sequelize.query(`
      SELECT 
        mc.id,
        mc.society_id,
        s.name as society_name,
        mc.water_percentage,
        mc.quantity,
        mc.collection_date
      FROM \`${schemaName}\`.\`milk_collections\` mc
      LEFT JOIN \`${schemaName}\`.\`societies\` s ON mc.society_id = s.id
      WHERE mc.collection_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY mc.collection_date DESC
      LIMIT 10
    `);
    
    console.log(`Found ${collections.length} collections in last 30 days\n`);
    
    collections.forEach((col, index) => {
      console.log(`${index + 1}. ${col.society_name} - ${col.collection_date}`);
      console.log(`   Water: ${col.water_percentage}%, Quantity: ${col.quantity}L`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkSocietyData();
