const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('Building', {
  name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
  address: { type: DataTypes.STRING },
  type: { type: DataTypes.ENUM('building', 'apartment', 'campus', 'facility'), defaultValue: 'building' },
});
