const { Sequelize } = require('sequelize');
require('dotenv').config();

async function addSampleCollection() {
  try {
    console.log('📊 Adding sample milk collection for farmer...');

    // Create database connection
    const sequelize = new Sequelize({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'ali_ali2657',
      dialect: 'mysql',
      logging: console.log,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: true
        } : undefined
      }
    });

    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Add sample milk collection for farmer 60044
    const farmerId = '60044';
    const societyId = 3; // From the logs
    
    // Create a few sample collections
    const collections = [
      {
        farmer_id: farmerId,
        society_id: societyId,
        collection_date: '2026-01-09',
        collection_time: '07:30:00',
        shift_type: 'morning',
        channel: 'COW',
        quantity: 5.5,
        fat_percentage: 4.2,
        snf_percentage: 8.5,
        clr_value: 28.5,
        rate_per_liter: 42.50,
        total_amount: 233.75
      },
      {
        farmer_id: farmerId,
        society_id: societyId,
        collection_date: '2026-01-09',
        collection_time: '18:30:00',
        shift_type: 'evening',
        channel: 'COW',
        quantity: 6.0,
        fat_percentage: 4.5,
        snf_percentage: 8.7,
        clr_value: 29.0,
        rate_per_liter: 44.00,
        total_amount: 264.00
      },
      {
        farmer_id: farmerId,
        society_id: societyId,
        collection_date: '2026-01-08',
        collection_time: '07:30:00',
        shift_type: 'morning',
        channel: 'COW',
        quantity: 5.8,
        fat_percentage: 4.3,
        snf_percentage: 8.6,
        clr_value: 28.8,
        rate_per_liter: 43.00,
        total_amount: 249.40
      },
      {
        farmer_id: farmerId,
        society_id: societyId,
        collection_date: '2025-12-28',
        collection_time: '07:30:00',
        shift_type: 'morning',
        channel: 'COW',
        quantity: 5.2,
        fat_percentage: 4.0,
        snf_percentage: 8.4,
        clr_value: 28.0,
        rate_per_liter: 41.00,
        total_amount: 213.20
      }
    ];

    for (const collection of collections) {
      await sequelize.query(`
        INSERT INTO ali_ali2657.milk_collections (
          farmer_id, society_id, collection_date, collection_time, 
          shift_type, channel, quantity, fat_percentage, snf_percentage,
          clr_value, rate_per_liter, total_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          collection.farmer_id,
          collection.society_id,
          collection.collection_date,
          collection.collection_time,
          collection.shift_type,
          collection.channel,
          collection.quantity,
          collection.fat_percentage,
          collection.snf_percentage,
          collection.clr_value,
          collection.rate_per_liter,
          collection.total_amount
        ]
      });
      console.log(`✅ Added collection: ${collection.collection_date} ${collection.shift_type} - ${collection.quantity}L`);
    }

    console.log('✅ Sample collections added successfully!');
    await sequelize.close();

  } catch (error) {
    console.error('❌ Error adding sample collection:', error);
    process.exit(1);
  }
}

addSampleCollection();
