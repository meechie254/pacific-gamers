const Joi = require('joi');

// User validation schemas
const userSchemas = {
    register: Joi.object({
        username: Joi.string().min(3).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        firstName: Joi.string().min(1).max(50),
        lastName: Joi.string().min(1).max(50),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/)
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    updateProfile: Joi.object({
        firstName: Joi.string().min(1).max(50),
        lastName: Joi.string().min(1).max(50),
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/),
        avatarUrl: Joi.string().uri()
    })
};

// Product validation schemas
const productSchemas = {
    create: Joi.object({
        name: Joi.string().min(1).max(200).required(),
        description: Joi.string().max(1000),
        price: Joi.number().positive().required(),
        categoryId: Joi.number().integer().positive(),
        stockQuantity: Joi.number().integer().min(0).default(0),
        imageUrl: Joi.string().uri(),
        featured: Joi.boolean().default(false)
    }),

    update: Joi.object({
        name: Joi.string().min(1).max(200),
        description: Joi.string().max(1000),
        price: Joi.number().positive(),
        categoryId: Joi.number().integer().positive(),
        stockQuantity: Joi.number().integer().min(0),
        imageUrl: Joi.string().uri(),
        featured: Joi.boolean(),
        isActive: Joi.boolean()
    })
};

// Order validation schemas
const orderSchemas = {
    create: Joi.object({
        items: Joi.array().items(
            Joi.object({
                productId: Joi.number().integer().positive().required(),
                quantity: Joi.number().integer().positive().required()
            })
        ).min(1).required(),
        shippingAddress: Joi.string().min(10).required(),
        billingAddress: Joi.string().min(10),
        paymentMethod: Joi.string().valid('card', 'paypal', 'bank_transfer'),
        notes: Joi.string().max(500)
    })
};

// Message validation schemas
const messageSchemas = {
    create: Joi.object({
        name: Joi.string().min(1).max(100).required(),
        email: Joi.string().email().required(),
        subject: Joi.string().min(1).max(200),
        message: Joi.string().min(10).max(2000).required(),
        messageType: Joi.string().valid('contact', 'support', 'feedback').default('contact'),
        priority: Joi.string().valid('low', 'normal', 'high').default('normal')
    })
};

// Review validation schemas
const reviewSchemas = {
    create: Joi.object({
        productId: Joi.number().integer().positive().required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        title: Joi.string().min(1).max(200),
        comment: Joi.string().min(1).max(1000)
    })
};

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        next();
    };
};

module.exports = {
    userSchemas,
    productSchemas,
    orderSchemas,
    messageSchemas,
    reviewSchemas,
    validate
};