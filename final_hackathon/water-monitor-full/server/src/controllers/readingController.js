const { Reading, Meter, Building } = require('../models');
module.exports = require('./crudFactory')(Reading, {
  include: [{ model: Meter, include: [Building] }], filters: ['MeterId'],
  order: [['readingDate', 'DESC'], ['id', 'DESC']],
});
