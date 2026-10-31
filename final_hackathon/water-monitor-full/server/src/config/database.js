require('dotenv').config();
const { Sequelize } = require('sequelize');

const dialect = process.env.DB_DIALECT || 'sqlite';
const sequelize = dialect === 'sqlite'
  ? new Sequelize({ dialect, storage: process.env.DB_STORAGE || './water.sqlite', logging: false })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
      dialect, host: process.env.DB_HOST, port: process.env.DB_PORT, logging: false,
      dialectOptions: process.env.DB_SSL === 'true'
        ? { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } }
        : {},
    });

module.exports = sequelize;
