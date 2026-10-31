const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false, validate: { notEmpty: true } },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false }, // bcrypt hash, never plain text
  role: { type: DataTypes.ENUM('admin', 'user'), defaultValue: 'user' },
});
