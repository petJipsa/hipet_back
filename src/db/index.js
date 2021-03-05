import Sequelize from "sequelize";
import model from "./model"; //db 모델 require

import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.database,
  process.env.user,
  process.env.password,
  {
    host: process.env.host,
    dialect: "mariadb",
    dialectOptions: { timezone: "Etc/GMT+9" },
    define: {
      timestamps: false,
      charset: "utf8mb4",
      collate: "utf8_general_ci",
    },
  }
);

const models = model(Sequelize, sequelize);

module.exports = {
  Sequelize,
  sequelize,
  models,
};