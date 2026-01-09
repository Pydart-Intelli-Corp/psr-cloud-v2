const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('psr_v4_main', 'tester', 'Tester@123', {
  host: 'psr-v4.mysql.database.azure.com',
  port: 3306,
  dialect: 'mysql',
  dialectOptions: {
    ssl: { rejectUnauthorized: true }
  },
  logging: false
});

async function checkFarmer() {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        f.id, 
        f.farmer_id, 
        f.full_name, 
        f.email, 
        f.society_id,
        s.society_name,
        s.society_identifier
      FROM \`ali_ali2657\`.farmers f
      LEFT JOIN \`ali_ali2657\`.societies s ON f.society_id = s.id
      WHERE f.email = 'tech.poornasree@gmail.com'
    `);

    console.log('Farmer Data:', JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkFarmer();
