const express = require('express');
const router = express.Router();
const db = require('../models/Database');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await db.get("SELECT * FROM admins WHERE username = ?", [username]);
        if (admin && bcrypt.compareSync(password, admin.password)) {
            // In a real pro app, we'd use JWT here. Keeping session for now as per server.js logic.
            res.json({ success: true, user: username });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/check', (req, res) => {
    // For demo purposes and until session middleware is fully integrated, return true.
    res.json({ authenticated: true }); 
});

router.get('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
