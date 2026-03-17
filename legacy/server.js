require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import custom modules
const db = require('./src/models/Database');
const logger = require('./src/utils/logger');

// Import routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const messageRoutes = require('./src/routes/messages');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yourdomain.com'] // Add your production domains
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, '/')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

// Legacy routes for backward compatibility
app.post('/api/orders', async (req, res) => {
    // This maintains backward compatibility with existing frontend
    const { name, email, phone, address, items, total } = req.body;

    try {
        // Create a guest order (no user account required)
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const orderResult = await db.run(
            `INSERT INTO orders (order_number, total_amount, shipping_address, status)
             VALUES (?, ?, ?, 'pending')`,
            [orderNumber, total, address]
        );

        // Parse items and create order items
        const orderItems = JSON.parse(items);
        for (const item of orderItems) {
            await db.run(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                 VALUES (?, ?, ?, ?, ?)`,
                [orderResult.id, item.id, item.quantity, item.price, item.price * item.quantity]
            );
        }

        logger.info(`Legacy order created: ${orderNumber}`);

        res.json({
            message: 'Order placed successfully!',
            orderId: orderResult.id,
            orderNumber
        });

    } catch (error) {
        logger.error(`Legacy order error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/contact', async (req, res) => {
    // This maintains backward compatibility with existing contact form
    const { name, email, subject, message } = req.body;

    try {
        const result = await db.run(
            `INSERT INTO messages (name, email, subject, message, message_type)
             VALUES (?, ?, ?, ?, 'contact')`,
            [name, email, subject, message]
        );

        res.json({
            message: 'Message sent successfully!',
            messageId: result.id
        });

    } catch (error) {
        logger.error(`Legacy contact error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Admin routes for backward compatibility
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await db.all("SELECT * FROM orders ORDER BY created_at DESC");
        res.json(orders);
    } catch (error) {
        logger.error(`Legacy admin orders error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/messages', async (req, res) => {
    try {
        const messages = await db.all("SELECT * FROM messages ORDER BY created_at DESC");
        res.json(messages);
    } catch (error) {
        logger.error(`Legacy admin messages error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    logger.error(`Unhandled error: ${error.message}`);
    logger.error(error.stack);

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong!'
            : error.message
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    db.close();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Zenca Gamers API Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Export for testing
module.exports = app;
