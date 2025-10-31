'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;
    
    // Get all admin users to create machines table in their schemas
    const [admins] = await queryInterface.sequelize.query(`
      SELECT fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    // Create machines table for each admin's database schema
    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      
      console.log(`🏗️ Processing admin schema: ${schemaName}`);
      
      try {
        // First check if database exists, if not skip this admin
        const [databases] = await queryInterface.sequelize.query(`
          SHOW DATABASES LIKE '${schemaName}'
        `);
        
        if (!databases || databases.length === 0) {
          console.log(`⚠️ Database ${schemaName} does not exist, skipping...`);
          continue;
        }
        
        console.log(`✅ Database ${schemaName} exists, creating machines table...`);
        
        await queryInterface.createTable(`${schemaName}.machines`, {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        machine_id: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        machine_type: {
          type: DataTypes.STRING(100),
          allowNull: false
        },
        society_id: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        location: {
          type: DataTypes.STRING(255),
          allowNull: true
        },
        installation_date: {
          type: DataTypes.DATEONLY,
          allowNull: true
        },
        operator_name: {
          type: DataTypes.STRING(100),
          allowNull: true
        },
        contact_phone: {
          type: DataTypes.STRING(15),
          allowNull: true
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
          defaultValue: 'active',
          allowNull: false
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
        });

        // Create indexes for better performance
        await queryInterface.addIndex(`${schemaName}.machines`, ['machine_type']);
        await queryInterface.addIndex(`${schemaName}.machines`, ['society_id']);
        await queryInterface.addIndex(`${schemaName}.machines`, ['status']);
        await queryInterface.addIndex(`${schemaName}.machines`, ['created_at']);
        
        console.log(`✅ Machines table and indexes created successfully for ${schemaName}`);
        
      } catch (error) {
        console.log(`❌ Failed to create machines table for ${schemaName}:`, error.message);
      }
    }
  },

  down: async (queryInterface) => {
    // Get all admin users to drop machines table from their schemas
    const [admins] = await queryInterface.sequelize.query(`
      SELECT fullName, dbKey FROM users WHERE role = 'admin' AND dbKey IS NOT NULL
    `);

    for (const admin of admins) {
      const cleanAdminName = admin.fullName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const schemaName = `${cleanAdminName}_${admin.dbKey.toLowerCase()}`;
      await queryInterface.dropTable(`${schemaName}.machines`);
    }
  }
};