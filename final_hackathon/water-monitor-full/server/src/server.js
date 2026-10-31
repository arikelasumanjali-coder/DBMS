require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
(async () => {
  await sequelize.sync();
  await require('./seed')();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}/api`));
})();
