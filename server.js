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
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://www.youtube.com", "https://s.ytimg.com"],
            frameSrc: ["'self'", "https://www.youtube.com"],
            imgSrc: ["'self'", "data:", "https:*", "http:*"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'"]
        }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting to prevent brute force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 200, // 200 requests per 15 mins
    message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: '*',
    credentials: true
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

// Professional Input Sanitization (Protect against XSS)
app.use((req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].replace(/<[^>]*>?/gm, '').trim();
            }
        }
    }
    next();
});

// Static files - robust path resolution
const publicPath = path.resolve(__dirname, 'public');
const uploadsPath = path.resolve(__dirname, 'uploads');

// Static files with Cache-Control headers
const staticOptions = {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
};

app.use(express.static(publicPath, staticOptions));
app.use('/uploads', express.static(uploadsPath, staticOptions));

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
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

        const orderResult = await db.run(
            `INSERT INTO orders (name, email, phone, address, shipping_address, items, total, total_amount, status, order_number)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
            [name || 'Guest', email || '', phone || '', address || '', address || '', JSON.stringify(items || []), total || 0, total || 0, orderNumber]
        );

        const orderItems = Array.isArray(items) ? items : JSON.parse(items || '[]');
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
                "SELECT SUM(total) as total FROM orders WHERE status = 'Paid' AND DATE(created_at) = ?",
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

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const msg = message.toLowerCase();
    let response = "";

    // Comprehensive Gamer Knowledge Base
    if (msg.includes('order') || msg.includes('track') || msg.includes('where')) {
        response = "To track: Log in to your Profile > 'Order History'.\n• 'Pending': Payment verification.\n• 'Paid': Your code or item is processed!\n\nCheck for email confirmation too!";
    } else if (msg.includes('pay') || msg.includes('mpesa') || msg.includes('price')) {
        response = "We use M-Pesa. Choose it at Checkout, enter your phone, and our admin verifies within 15 mins. KES to USD conversion is handled automatically at the best rates!";
    } else if (msg.includes('fc 25') || msg.includes('fifa') || msg.includes('cod') || msg.includes('black ops')) {
        response = "🔥 Top Trend: EA FC 25 and CoD: Black Ops 6 are in stock! You can buy the digital activation key or a physical disk in the Shop.";
    } else if (msg.includes('shipping') || msg.includes('deliver') || msg.includes('wait')) {
        response = "🚚 Delivery Info:\n• Digital Codes: Instant to 30 mins.\n• Physical Games: 1-2 hours within the city.\n• Nationwide Shipping: Next business day via G4S!";
    } else if (msg.includes('refund') || msg.includes('return') || msg.includes('wrong')) {
        response = "If you have a problem with a key or item, contact our Support on WhatsApp via the 'Contact' page immediately. We offer 24hr refunds on faulty keys!";
    } else if (msg.includes('repair') || msg.includes('fix') || msg.includes('broken')) {
        response = "Console problems? We offer professional PS4/PS5 cleaning and HDMI/Power port repairs. Book a 'Console Service' on our Booking page!";
    } else if (msg.includes('elite') || msg.includes('member') || msg.includes('benefit')) {
        response = "Elite Members get 5% cashback on all orders, early access to tournaments, and exclusive Discord roles. Join the grid by registering today!";
    } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('yo')) {
        response = "Greetings, Gamer! I'm X-Bot, your Pacific Gamers AI Guide.\n\nI can help with:\n• Order Status\n• M-Pesa Support\n• Shipping Times\n• Console Repairs\n\nWhat can I do for you?";
    } else if (msg.includes('thank') || msg.includes('bye') || msg.includes('great')) {
        response = "Happy to help! May your ping be low and your frame rates high. Stay elite!";
    } else {
        response = "I'm still leveling up! You can ask about:\n• Order Tracking\n• Shipping & Delivery\n• Console Repairs\n• Elite Membership\n\nOr click 'Contact' to chat with a human on WhatsApp.";
    }

    res.json({ reply: response });
});

app.get('/api/admin/top-sellers', async (req, res) => {
    try {
        const sql = `
            SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.total_price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            GROUP BY oi.product_id
            ORDER BY total_sold DESC
            LIMIT 5
        `;
        const topSellers = await db.all(sql);
        res.json(topSellers);
    } catch (error) {
        logger.error(`Top sellers error: ${error.message}`);
        res.json([]);
    }
});

// 404 handler
app.use((req, res) => {
    logger.warn(`404 - Not Found: ${req.method} ${req.path}`);
    
    // Force JSON for API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: `API endpoint not found: ${req.method} ${req.path}`,
            error: {
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Serve HTML if browser, otherwise JSON
    if (req.accepts('html')) {
        return res.status(404).sendFile(path.join(publicPath, '404.html'));
    }

    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    
    logger.error(`[${status}] ${req.method} ${req.path} - ${message}`);
    if (process.env.NODE_ENV !== 'production') logger.error(error.stack);

    res.status(status).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production' && status === 500 
                ? 'Something went wrong on our end. Please try again later.' 
                : message,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        }
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
    logger.info(`🚀 Pacific Gamers API Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Export for testing
module.exports = app;
