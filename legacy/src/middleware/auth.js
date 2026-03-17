const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Authentication middleware
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                logger.warn(`JWT verification failed: ${err.message}`);
                return res.status(403).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        logger.error(`Authentication error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Optional authentication (for endpoints that work with or without auth)
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (!err) {
                    req.user = user;
                }
                next();
            });
        } else {
            next();
        }
    } catch (error) {
        next();
    }
};

module.exports = {
    authenticate,
    requireAdmin,
    optionalAuth
};