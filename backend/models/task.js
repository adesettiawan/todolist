"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      // define association here
    }
  }
  Task.init(
    {
      description: {
        type: DataTypes.STRING,
        allowNull: false, // Deskripsi tidak boleh kosong
      },
      is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Defaultnya adalah false (belum selesai)
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false, // order_index tidak boleh kosong
      },
    },
    {
      sequelize,
      modelName: "Task",
      tableName: "tasks", // Pastikan nama tabel adalah 'tasks'
      underscored: true, // Menggunakan snake_case untuk nama kolom di DB (e.g., created_at)
    }
  );
  return Task;
};
