const { Building } = require('../models');
module.exports = require('./crudFactory')(Building, { order: [['name', 'ASC']] });
