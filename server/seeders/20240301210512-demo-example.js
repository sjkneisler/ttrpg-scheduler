'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Examples', [{
      foo: 'bar',
      bar: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, {
      foo: 'pizza',
      bar: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
    }])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Examples', null, {});
  }
};
