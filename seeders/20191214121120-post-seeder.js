'use strict'
const faker = require('faker')
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      'Posts',
      Array.from({ length: 12 }).map((item, index) => ({
        id: index + 1,
        title: faker.lorem.words(),
        content: faker.lorem.paragraphs(),
        cover: 'https://fakeimg.pl/640x480/',
        userId: (index % 3) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Posts', null, {})
  }
}
