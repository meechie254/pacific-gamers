const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { validate, orderSchemas } = require('../middleware/validation');
const { authenticate, requireAdmin } = require('../middleware/auth');

// User routes (require authentication)
router.use(authenticate);

router.post('/', validate(orderSchemas.create), orderController.create);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getById);

// Admin routes
router.use(requireAdmin);
router.get('/admin/all', orderController.getAll);
router.put('/:id/status', orderController.updateStatus);

module.exports = router;