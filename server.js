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
            scriptSrcAttr: ["'self'", "'unsafe-hashes'", 
                "'sha256-Rfy3lK993lVvYI8MhS8mPz9pXUpS0O7p4m9L0U0U0U0='", // updateStatus
                "'sha256-abcdef1234567890abcdef1234567890abcdef1='", // editProduct
                "'sha256-zyxwvut9876543210zyxwvut9876543210zyx1='", // deleteProduct
                "'unsafe-inline'" // Fallback for development
            ],
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
    windowMs: 1 * 60 * 1000, 
    max: 1000, // Boosted to 1000 to prevent Dashboard from locking out during heavy DB operations
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

    // Comprehensive Pacific Gamers Knowledge Base & Keyword Matching
    const kb = [
        {
            keywords: ['order', 'track', 'status', 'where', 'delay'],
            response: "To track your order: Log in to your Profile and check 'Order History'.\n\n• 'Pending': Admin is verifying your payment.\n• 'Paid': Your item is confirmed and processed!\n\nYou'll get a confirmation as soon as it's active."
        },
        {
            keywords: ['whatsapp', 'number', 'phone', 'contact', 'call', 'reach'],
            response: "You can reach Sam directly on WhatsApp: +254 701 668 561.\nClick here to chat instantly: https://wa.me/254701668561\nWe're always online for gamer support!"
        },
        {
            keywords: ['sam', 'owner', 'who is', 'creator', 'founder'],
            response: "Sam is the Visionary and Lead Gamer behind Pacific Gamers. He's dedicated to bringing the most elite 4K gaming titles and premium gear to Kenya! Message him directly on WhatsApp at +254 701 668 561."
        },
        {
            keywords: ['pay', 'mpesa', 'checkout', 'buy', 'purchase', 'how to'],
            response: "We exclusively use M-Pesa for fast, secure checkouts.\n1. Choose M-Pesa at Checkout.\n2. Enter your phone number.\n3. Our admin verifies your payment within 15 minutes.\n\nKES to USD conversion is automatic at the absolute best rates!"
        },
        {
            keywords: ['price', 'cost', 'how much', 'discount', 'cheap', 'offer'],
            response: "All prices are listed live in our Shop! We consistently offer the most competitive rates in Kenya. Become an Elite Member to save an extra 5% on every single purchase!"
        },
        {
            keywords: ['stock', 'available', 'missing', 'preorder', 'out of', 'have'],
            response: "Our website shows real-time stock availability. If a game is marked 'Out of Stock', you can Pre-Order it by messaging our admin via WhatsApp (+254 701 668 561) for a custom delivery!"
        },
        {
            keywords: ['when to order', 'business hours', 'open', 'close', 'time'],
            response: "Our digital systems are live 24/7! You can purchase digital codes at any time of day or night. For physical game deliveries, our logistics operate from 8:00 AM to 8:00 PM daily."
        },
        {
            keywords: ['after buy', 'what next', 'bought', 'happens'],
            response: "After your purchase:\n1. Your order status goes to 'Pending'.\n2. Admin verifies your M-Pesa payment.\n3. Your digital code is instantly sent to your email and becomes visible in your Profile dashboard!"
        },
        {
            keywords: ['fc 25', 'fifa', 'cod', 'black ops', 'gta', 'spiderman'],
            response: "🔥 Top Trending Titles like EA FC 25, Call of Duty: Black Ops 6, and GTA V are fully in stock! Grab the digital activation key or order a physical disk from the Shop right now."
        },
        {
            keywords: ['shipping', 'deliver', 'wait', 'how long', 'location', 'nairobi'],
            response: "🚚 Pacific Gamers Delivery Info:\n• Digital Codes: Instant to 30 mins.\n• Physical Games (Nairobi): 1-2 hours delivery.\n• Nationwide Shipping: Next day delivery via G4S!"
        },
        {
            keywords: ['refund', 'return', 'cancel', 'money back', 'fake', 'scam'],
            response: "Customer trust is our #1 priority. Pacific Gamers is 100% legitimate and owned by Sam. If a digital code is faulty or a physically delivered game has issues, we guarantee a swift replacement or full refund upon verification."
        },
        {
            keywords: ['hello', 'hi', 'hey', 'yo', 'greetings', 'sup', 'bot', 'morning', 'afternoon'],
            response: "Greetings, Gamer! I'm X-Bot, your elite Pacific Gamers AI Guide.\n\nI can assist you with:\n• Tracking your Order\n• M-Pesa Payment Support\n• Shipping Times\n• Getting Sam's WhatsApp\n\nHow can I level up your experience today?"
        },
        {
            keywords: ['thank', 'bye', 'great', 'awesome', 'good', 'nice', 'cool'],
            response: "Happy to help! May your ping be low and your frame rates high. Stay elite, and keep gaming with Pacific Gamers!"
        }
    ];

    // Find the best matching response
    for (const rule of kb) {
        if (rule.keywords.some(keyword => msg.includes(keyword))) {
            response = rule.response;
            break;
        }
    }

    if (!response) {
        response = "I'm still leveling up my knowledge! I can answer questions about:\n\n• Sam (Our Founder & his WhatsApp)\n• Stock, Pricing & Pre-orders\n• M-Pesa Payments & Checkout\n• Shipping Times (Physical & Digital)\n\nAlternatively, you can WhatsApp Sam directly at +254 701 668 561 for human support!";
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
