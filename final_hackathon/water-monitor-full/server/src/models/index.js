const sequelize = require('../config/database');
const Building = require('./Building');
const Meter = require('./Meter');
const Reading = require('./Reading');
const User = require('./User');

Building.hasMany(Meter, { foreignKey: { name: 'BuildingId', allowNull: false }, onDelete: 'CASCADE' });
Meter.belongsTo(Building, { foreignKey: 'BuildingId' });
Meter.hasMany(Reading, { foreignKey: { name: 'MeterId', allowNull: false }, onDelete: 'CASCADE' });
Reading.belongsTo(Meter, { foreignKey: 'MeterId' });

module.exports = { sequelize, Building, Meter, Reading, User };
