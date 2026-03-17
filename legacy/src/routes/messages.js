const express = require('express');
const router = express.Router();
const db = require('../models/Database');
const logger = require('../utils/logger');
const { validate, messageSchemas } = require('../middleware/validation');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Submit contact message (public)
router.post('/', validate(messageSchemas.create), async (req, res) => {
    try {
        const { name, email, subject, message, messageType, priority } = req.body;
        const userId = req.user ? req.user.id : null;

        const result = await db.run(
            `INSERT INTO messages (user_id, name, email, subject, message, message_type, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, email, subject, message, messageType, priority]
        );

        logger.info(`New message submitted from: ${email} (${messageType})`);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { messageId: result.id }
        });

    } catch (error) {
        logger.error(`Submit message error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to send message'
        });
    }
});

// Get all messages (admin only)
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (status) {
            whereClause += ' WHERE status = ?';
            params.push(status);
        }

        if (type) {
            whereClause += whereClause ? ' AND' : ' WHERE';
            whereClause += ' message_type = ?';
            params.push(type);
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM messages ${whereClause}`;
        const { total } = await db.get(countQuery, params);

        // Get messages
        const messagesQuery = `
            SELECT m.*, u.username
            FROM messages m
            LEFT JOIN users u ON m.user_id = u.id
            ${whereClause}
            ORDER BY m.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), offset);
        const messages = await db.all(messagesQuery, params);

        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        logger.error(`Get messages error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to get messages'
        });
    }
});

// Update message status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['unread', 'read', 'replied'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const result = await db.run(
            'UPDATE messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        logger.info(`Message ${id} status updated to: ${status}`);

        res.json({
            success: true,
            message: 'Message status updated successfully'
        });

    } catch (error) {
        logger.error(`Update message status error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to update message status'
        });
    }
});

module.exports = router;