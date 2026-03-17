const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/Database');
const logger = require('../utils/logger');

class AuthController {
    // Register new user
    async register(req, res) {
        try {
            const { username, email, password, firstName, lastName, phone } = req.body;

            // Check if user already exists
            const existingUser = await db.get(
                'SELECT id FROM users WHERE email = ? OR username = ?',
                [email, username]
            );

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email or username already exists'
                });
            }

            // Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Create user
            const result = await db.run(
                `INSERT INTO users (username, email, password_hash, first_name, last_name, phone)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [username, email, passwordHash, firstName, lastName, phone]
            );

            // Generate JWT token
            const token = jwt.sign(
                { id: result.id, username, email, role: 'user' },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            logger.info(`New user registered: ${username} (${email})`);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: result.id,
                        username,
                        email,
                        firstName,
                        lastName,
                        phone,
                        role: 'user'
                    },
                    token
                }
            });

        } catch (error) {
            logger.error(`Registration error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Registration failed'
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await db.get(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            logger.info(`User logged in: ${user.username}`);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        phone: user.phone,
                        role: user.role,
                        avatarUrl: user.avatar_url
                    },
                    token
                }
            });

        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Login failed'
            });
        }
    }

    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = await db.get(
                'SELECT id, username, email, first_name, last_name, phone, avatar_url, role, created_at FROM users WHERE id = ?',
                [req.user.id]
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });

        } catch (error) {
            logger.error(`Get profile error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to get profile'
            });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const { firstName, lastName, phone, avatarUrl } = req.body;
            const userId = req.user.id;

            await db.run(
                `UPDATE users SET
                 first_name = COALESCE(?, first_name),
                 last_name = COALESCE(?, last_name),
                 phone = COALESCE(?, phone),
                 avatar_url = COALESCE(?, avatar_url),
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [firstName, lastName, phone, avatarUrl, userId]
            );

            // Get updated user
            const user = await db.get(
                'SELECT id, username, email, first_name, last_name, phone, avatar_url, role FROM users WHERE id = ?',
                [userId]
            );

            logger.info(`Profile updated for user: ${user.username}`);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user }
            });

        } catch (error) {
            logger.error(`Update profile error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            // Get current user
            const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [userId]);

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await db.run(
                'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newPasswordHash, userId]
            );

            logger.info(`Password changed for user ID: ${userId}`);

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            logger.error(`Change password error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to change password'
            });
        }
    }
}

module.exports = new AuthController();