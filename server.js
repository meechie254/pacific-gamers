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
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" }
// }));

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

// app.use(limiter);

// CORS configuration
const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Request logging middleware with status code
app.use((req, res, next) => {
    res.on('finish', () => {
        logger.http(`${req.method} ${req.path} ${res.statusCode} - ${req.ip} - Ref: ${req.get('referer') || 'Direct'}`);
    });
    next();
});

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - robust path resolution
const imgPath = path.resolve(__dirname, 'img');
const uploadsPath = path.resolve(__dirname, 'uploads');
const publicPath = path.resolve(__dirname);

// Static files with Cache-Control headers
const staticOptions = {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache'); // Don't cache HTML to ensure instant updates
        }
    }
};

app.use('/img', express.static(imgPath, staticOptions));
app.use('/uploads', express.static(uploadsPath, staticOptions));
app.use(express.static(publicPath, staticOptions));

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

app.post('/api/bookings', async (req, res) => {
    const { name, email, phone, tournament, date, message } = req.body;
    try {
        await db.run(
            "INSERT INTO bookings (name, email, phone, tournament, date, message) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, phone, tournament, date, message]
        );
        res.json({ success: true, message: 'Booking received successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    try {
        await db.run("INSERT INTO subscriptions (email) VALUES (?)", [email]);
        res.json({ success: true, message: 'Thank you for subscribing!' });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.json({ success: true, message: 'You are already subscribed!' });
        }
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/subscriptions', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM subscriptions ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/bookings', async (req, res) => {
    try {
        const bookings = await db.all("SELECT * FROM bookings ORDER BY created_at DESC LIMIT 50");
        res.json(bookings);
    } catch (error) {
        logger.error(`Legacy admin bookings error: ${error.message}`);
        res.json([]); // Return empty array instead of error for UI stability
    }
});

app.get('/api/admin/analytics', async (req, res) => {
    try {
        // Generate last 7 days of revenue data
        const analytics = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const row = await db.get(
                "SELECT SUM(CAST(REPLACE(REPLACE(total, 'KES ', ''), ',', '') AS REAL)) as total FROM orders WHERE status = 'Paid' AND DATE(created_at) = ?",
                [dateStr]
            );
            
            analytics.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: row.total || 0
            });
        }
        res.json(analytics);
    } catch (error) {
        logger.error(`Analytics error: ${error.message}`);
        res.json([
            { day: 'Mon', revenue: 0 }, { day: 'Tue', revenue: 0 }, { day: 'Wed', revenue: 0 },
            { day: 'Thu', revenue: 0 }, { day: 'Fri', revenue: 0 }, { day: 'Sat', revenue: 0 }, { day: 'Sun', revenue: 0 }
        ]);
    }
});

// 404 handler
app.use((req, res) => {
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
