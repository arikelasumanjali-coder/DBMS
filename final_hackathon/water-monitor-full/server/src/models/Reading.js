const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Reading', {
  value: { type: DataTypes.DECIMAL(12, 3), allowNull: false, validate: { min: 0 } },
  readingDate: { type: DataTypes.DATEONLY, allowNull: false },
  notes: { type: DataTypes.STRING },
});
