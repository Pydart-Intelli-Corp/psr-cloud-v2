'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const machineTypes = [
      'ECOD',
      'LSE-V3', 
      'LSES-V3',
      'ECOSV',
      'ECOV',
      'ECO-SVPWTBQ',
      'LSE-SVPWTBQ',
      'ECOD-G',
      'ECOD-W',
      'LSE-VPWTBQ',
      'LSE-SVPTGQ',
      'LSE-VPTGQ',
      'LSE-PWTBQ',
      'LSE-WTB',
      'LSE-SVG',
      'LSE-SV',
      'LG-SPTGQ',
      'LG-SPWTBQ',
      'LG-SDPWTBQ',
      'LSEWTB',
      'LG-LitePWTBQ',
      'LSE-DPWTBQ-12AH',
      'LG-SDPWTBQ-12AH',
      'DPST-G',
      'DPST-W',
      'LG-LitePTGQ',
      'LG-LitePTGQ-6AH',
      'LG-SDPTGQ',
      'LG-LitePWTBQ-6AH',
      'LG-SproPWTBQ-12AH',
      'LG-SDPTGQ-12AH',
      'LG-SproPTGQ-12AH',
      'LSE-SVPWTBQ-12AH'
    ];

    const machineData = machineTypes.map(type => ({
      machine_type: type,
      description: `Dairy equipment model ${type}`,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('machinetype', machineData, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('machinetype', null, {});
  }
};