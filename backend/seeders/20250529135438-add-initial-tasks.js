"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     * name: 'John Doe',
     * isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "tasks",
      [
        // Nama tabel harus 'tasks' sesuai definisi model
        {
          description: "Learn Sequelize ORM",
          is_completed: false,
          order_index: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: "Build Todo List App",
          is_completed: false,
          order_index: 2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: "Write Backend API with Express",
          is_completed: true,
          order_index: 3,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          description: "Implement Frontend with React",
          is_completed: false,
          order_index: 4,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("tasks", null, {}); // Menghapus semua data dari tabel tasks
  },
};

// npx sequelize-cli db:seed:all
// npx sequelize-cli db:seed:undo:all
