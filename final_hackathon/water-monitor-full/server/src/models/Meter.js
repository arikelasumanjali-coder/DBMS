const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Meter', {
  meterNumber: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { notEmpty: true } },
  location: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  unit: { type: DataTypes.STRING, defaultValue: 'm3' },
});
