const express = require('express');
const router = express.Router();
const db = require('../models/Database');
const logger = require('../utils/logger');
const { validate, orderValidation } = require('../middleware/validator');

// Place new order
router.post('/', validate(orderValidation), async (req, res) => {
    const { name, email, phone, address, items, total, status = 'Pending' } = req.body;
    try {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
        const result = await db.run(
            "INSERT INTO orders (name, email, phone, address, items, total, status, order_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [name, email, phone, address, JSON.stringify(items), total, status, orderNumber]
        );
        
        logger.info(`New order created: ${orderNumber}`);
        res.json({ message: 'Order placed successfully', id: result.id, orderNumber });
    } catch (err) {
        logger.error(`Order error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all orders
router.get('/admin/list', async (req, res) => {
    try {
        const orders = await db.all("SELECT * FROM orders ORDER BY created_at DESC");
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update order status
router.patch('/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
        logger.info(`Order ${req.params.id} marked as ${status}`);
        res.json({ message: `Order updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
