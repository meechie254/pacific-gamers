const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const { validate, productSchemas } = require('../middleware/validation');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, productController.getAll);
router.get('/categories', productController.getCategories);
router.get('/:id', optionalAuth, productController.getById);

// Admin routes
router.use(authenticate);
router.use(requireAdmin);

router.post('/', validate(productSchemas.create), productController.create);
router.put('/:id', validate(productSchemas.update), productController.update);
router.delete('/:id', productController.delete);

module.exports = router;