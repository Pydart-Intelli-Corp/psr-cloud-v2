'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('farmers', 'machine_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'machines',
        key: 'id'
      },
      onUpdate: 'SET NULL',
      onDelete: 'SET NULL',
      comment: 'Reference to assigned machine'
    });

    // Add index for better performance
    await queryInterface.addIndex('farmers', ['machine_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('farmers', ['machine_id']);
    await queryInterface.removeColumn('farmers', 'machine_id');
  }
};
