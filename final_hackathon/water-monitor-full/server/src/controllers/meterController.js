const { Meter, Building } = require('../models');
module.exports = require('./crudFactory')(Meter, {
  include: [Building], filters: ['BuildingId', 'status'], order: [['meterNumber', 'ASC']],
});
