const router = require('express').Router();
const crud = require('./crudRoutes');
const { summary } = require('../controllers/consumptionController');
const { authenticate, authorize } = require('../middleware/auth');

// Any logged-in user can read/create/update. Only admins can delete.
const guard = [authenticate, (req, res, next) => (req.method === 'DELETE' ? authorize('admin')(req, res, next) : next())];

router.use('/auth', require('./authRoutes')); // public: register + login

router.use('/buildings', guard, crud(require('../controllers/buildingController')));
router.use('/meters', guard, crud(require('../controllers/meterController')));
router.use('/readings', guard, crud(require('../controllers/readingController')));
router.get('/consumption', authenticate, summary);

module.exports = router;
