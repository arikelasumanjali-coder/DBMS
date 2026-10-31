const { asyncHandler } = require('../middleware/errorHandler');

// Generic CRUD controller reused by every resource.
module.exports = (Model, { include = [], order = [['id', 'DESC']], filters = [] } = {}) => {
  const findOr404 = async (id) => {
    const item = await Model.findByPk(id, { include });
    if (!item) throw Object.assign(new Error(`${Model.name} not found`), { status: 404 });
    return item;
  };
  return {
    list: asyncHandler(async (req, res) => {
      const where = {};
      filters.forEach((f) => { if (req.query[f]) where[f] = req.query[f]; });
      res.json(await Model.findAll({ where, include, order }));
    }),
    get: asyncHandler(async (req, res) => res.json(await findOr404(req.params.id))),
    create: asyncHandler(async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json(await findOr404(item.id));
    }),
    update: asyncHandler(async (req, res) => {
      const item = await findOr404(req.params.id);
      await item.update(req.body);
      res.json(await findOr404(item.id));
    }),
    remove: asyncHandler(async (req, res) => {
      await (await findOr404(req.params.id)).destroy();
      res.status(204).end();
    }),
  };
};
