const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (req, res) => res.status(404).json({ error: 'Route not found' });

const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError')
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  if (err.name === 'SequelizeForeignKeyConstraintError')
    return res.status(400).json({ error: 'Invalid or missing related record' });
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
};

module.exports = { asyncHandler, notFound, errorHandler };
