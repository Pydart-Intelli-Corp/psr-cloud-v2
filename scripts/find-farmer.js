const { Sequelize } = require('sequelize');
require('dotenv').config();

async function findFarmer() {
  const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'psr_v4_main',
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined
    }
  });

  const email = 'tech.poornasree@gmail.com';
  console.log('🔍 Searching for farmer:', email);

  const [schemas] = await sequelize.query(`
    SELECT DISTINCT TABLE_SCHEMA 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA LIKE '%_%' 
    AND TABLE_NAME = 'farmers' 
    ORDER BY TABLE_SCHEMA
  `);

  for (const schema of schemas) {
    const dbKey = schema.TABLE_SCHEMA;
    const [farmers] = await sequelize.query(`
      SELECT f.id, f.farmer_id, f.name, f.email, f.status, f.society_id, s.name as society_name 
      FROM \`${dbKey}\`.farmers f 
      LEFT JOIN \`${dbKey}\`.societies s ON f.society_id = s.id 
      WHERE LOWER(f.email) = LOWER(?)
      LIMIT 1
    `, { replacements: [email] });

    if (farmers.length > 0) {
      const farmer = farmers[0];
      console.log('✅ Found farmer in schema:', dbKey);
      console.log(JSON.stringify(farmer, null, 2));

      const [collections] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM \`${dbKey}\`.milk_collections 
        WHERE farmer_id = ?
      `, { replacements: [farmer.farmer_id] });

      console.log('📊 Collections count:', collections[0].count);
      break;
    }
  }

  await sequelize.close();
}

findFarmer().catch(console.error);
