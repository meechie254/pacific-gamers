const { body, validationResult } = require('express-validator');

// Professional request validation middleware
const validate = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    };
};

module.exports = {
    validate,
    orderValidation: [
        body('email').isEmail().withMessage('Invalid email address'),
        body('name').notEmpty().withMessage('Name is required'),
        body('phone').isLength({ min: 10 }).withMessage('Phone number must be at least 10 digits')
    ],
    contactValidation: [
        body('email').isEmail().withMessage('Invalid email address'),
        body('name').notEmpty().withMessage('Name is required'),
        body('message').isLength({ min: 10 }).withMessage('Message must be at least 10 characters long')
    ]
};
