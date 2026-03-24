const express = require('express');
const router = express.Router();
const db = require('../models/Database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'pacific-gamers-secret-2026';

// Register User
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.run(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );
        res.json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Login (Admins and Users)
router.post('/login', async (req, res) => {
    const { username, password, type } = req.body; // type: 'admin' or 'user'
    const table = (type === 'admin') ? 'admins' : 'users';

    try {
        const user = await db.get(`SELECT * FROM ${table} WHERE username = ?`, [username]);
        
        if (!user) {
            return res.status(401).json({ error: `${type} not found` });
        }

        const isValid = bcrypt.compareSync(password, user.password);

        if (isValid) {
            const token = jwt.sign(
                { id: user.id, username: user.username, role: type || 'user' },
                SECRET_KEY,
                { expiresIn: '24h' }
            );
            res.json({ success: true, token, user: { username: user.username, role: type || 'user' } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Check Auth
router.get('/check', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.json({ authenticated: false });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.json({ authenticated: false });
        res.json({ authenticated: true, user: decoded });
    });
});

// Change Password (Admins)
router.post('/change-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    try {
        const user = await db.get("SELECT * FROM admins WHERE username = ?", [username]);
        if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }
        
        const newHashed = bcrypt.hashSync(newPassword, 10);
        await db.run("UPDATE admins SET password = ? WHERE id = ?", [newHashed, user.id]);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
