const express = require('express');
const router = express.Router();
const db = require('../models/Database');
const { validate, contactValidation } = require('../middleware/validator');

// Submit contact message
router.post('/', validate(contactValidation), async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        const result = await db.run(
            "INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
            [name, email, subject, message]
        );
        res.json({ message: 'Message sent successfully', id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all messages
router.get('/admin/list', async (req, res) => {
    try {
        const messages = await db.all("SELECT * FROM messages ORDER BY created_at DESC");
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
