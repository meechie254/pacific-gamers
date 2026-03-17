const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { validate, userSchemas } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', validate(userSchemas.register), authController.register);
router.post('/login', validate(userSchemas.login), authController.login);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', authController.getProfile);
router.put('/profile', validate(userSchemas.updateProfile), authController.updateProfile);
router.put('/change-password', authController.changePassword);

module.exports = router;