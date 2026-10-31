const { Router } = require('express');
module.exports = (c) => {
  const router = Router();
  router.route('/').get(c.list).post(c.create);
  router.route('/:id').get(c.get).put(c.update).delete(c.remove);
  return router;
};
