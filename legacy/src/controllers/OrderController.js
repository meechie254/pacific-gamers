const db = require('../models/Database');
const logger = require('../utils/logger');

class OrderController {
    // Create new order
    async create(req, res) {
        const dbConnection = db.db; // Get raw database connection for transaction
        const userId = req.user ? req.user.id : null;

        try {
            const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

            // Validate items exist and are in stock
            for (const item of items) {
                const product = await db.get(
                    'SELECT id, name, price, stock_quantity FROM products WHERE id = ? AND is_active = 1',
                    [item.productId]
                );

                if (!product) {
                    return res.status(400).json({
                        success: false,
                        message: `Product ${item.productId} not found`
                    });
                }

                if (product.stock_quantity < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient stock for ${product.name}`
                    });
                }
            }

            // Calculate total
            let totalAmount = 0;
            const orderItems = [];

            for (const item of items) {
                const product = await db.get(
                    'SELECT price FROM products WHERE id = ?',
                    [item.productId]
                );

                const unitPrice = product.price;
                const totalPrice = unitPrice * item.quantity;
                totalAmount += totalPrice;

                orderItems.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice
                });
            }

            // Generate order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            // Begin transaction
            await new Promise((resolve, reject) => {
                dbConnection.run('BEGIN TRANSACTION', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            try {
                // Create order
                const orderResult = await db.run(
                    `INSERT INTO orders (user_id, order_number, total_amount, shipping_address, billing_address, payment_method, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, orderNumber, totalAmount, shippingAddress, billingAddress || shippingAddress, paymentMethod, notes]
                );

                const orderId = orderResult.id;

                // Create order items
                for (const item of orderItems) {
                    await db.run(
                        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                         VALUES (?, ?, ?, ?, ?)`,
                        [orderId, item.productId, item.quantity, item.unitPrice, item.totalPrice]
                    );

                    // Update product stock
                    await db.run(
                        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                        [item.quantity, item.productId]
                    );
                }

                // Commit transaction
                await new Promise((resolve, reject) => {
                    dbConnection.run('COMMIT', (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                logger.info(`New order created: ${orderNumber} (Total: $${totalAmount})`);

                res.status(201).json({
                    success: true,
                    message: 'Order created successfully',
                    data: {
                        orderId,
                        orderNumber,
                        totalAmount
                    }
                });

            } catch (error) {
                // Rollback transaction
                await new Promise((resolve) => {
                    dbConnection.run('ROLLBACK', () => resolve());
                });
                throw error;
            }

        } catch (error) {
            logger.error(`Create order error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to create order'
            });
        }
    }

    // Get user's orders
    async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            // Get orders count
            const { total } = await db.get(
                'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
                [userId]
            );

            // Get orders with items
            const orders = await db.all(`
                SELECT
                    o.*,
                    json_group_array(
                        json_object(
                            'productId', oi.product_id,
                            'quantity', oi.quantity,
                            'unitPrice', oi.unit_price,
                            'totalPrice', oi.total_price,
                            'productName', p.name,
                            'productImage', p.image_url
                        )
                    ) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE o.user_id = ?
                GROUP BY o.id
                ORDER BY o.created_at DESC
                LIMIT ? OFFSET ?
            `, [userId, parseInt(limit), offset]);

            // Parse items JSON
            orders.forEach(order => {
                order.items = JSON.parse(order.items);
            });

            res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            logger.error(`Get user orders error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to get orders'
            });
        }
    }

    // Get single order
    async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const order = await db.get(`
                SELECT
                    o.*,
                    json_group_array(
                        json_object(
                            'productId', oi.product_id,
                            'quantity', oi.quantity,
                            'unitPrice', oi.unit_price,
                            'totalPrice', oi.total_price,
                            'productName', p.name,
                            'productImage', p.image_url
                        )
                    ) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE o.id = ? AND o.user_id = ?
                GROUP BY o.id
            `, [id, userId]);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            order.items = JSON.parse(order.items);

            res.json({
                success: true,
                data: { order }
            });

        } catch (error) {
            logger.error(`Get order error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to get order'
            });
        }
    }

    // Get all orders (admin only)
    async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                search,
                sort = 'created_at',
                order = 'DESC'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = '';
            let params = [];

            // Add filters
            if (status) {
                whereClause += ' WHERE o.status = ?';
                params.push(status);
            }

            if (search) {
                whereClause += whereClause ? ' AND' : ' WHERE';
                whereClause += ' (o.order_number LIKE ? OR u.username LIKE ? OR u.email LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            // Validate sort field
            const allowedSorts = ['created_at', 'total_amount', 'status', 'order_number'];
            const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}`;
            const { total } = await db.get(countQuery, params);

            // Get orders
            const ordersQuery = `
                SELECT
                    o.*,
                    u.username,
                    u.email,
                    COUNT(oi.id) as item_count
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN order_items oi ON o.id = oi.order_id
                ${whereClause}
                GROUP BY o.id
                ORDER BY o.${sortField} ${sortOrder}
                LIMIT ? OFFSET ?
            `;

            params.push(parseInt(limit), offset);
            const orders = await db.all(ordersQuery, params);

            res.json({
                success: true,
                data: {
                    orders,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            logger.error(`Get all orders error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to get orders'
            });
        }
    }

    // Update order status (admin only)
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const result = await db.run(
                'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [status, id]
            );

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            logger.info(`Order ${id} status updated to: ${status}`);

            res.json({
                success: true,
                message: 'Order status updated successfully'
            });

        } catch (error) {
            logger.error(`Update order status error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to update order status'
            });
        }
    }
}

module.exports = new OrderController();