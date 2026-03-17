const db = require('../models/Database');
const logger = require('../utils/logger');

class ProductController {
    // Get all products with pagination and filtering
    async getAll(req, res) {
        try {
            const {
                page = 1,
                limit = 12,
                category,
                search,
                featured,
                sort = 'created_at',
                order = 'DESC'
            } = req.query;

            const offset = (page - 1) * limit;
            let whereClause = 'WHERE p.is_active = 1';
            let params = [];
            let joinClause = 'LEFT JOIN categories c ON p.category_id = c.id';

            // Add filters
            if (category) {
                whereClause += ' AND p.category_id = ?';
                params.push(category);
            }

            if (search) {
                whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            if (featured === 'true') {
                whereClause += ' AND p.featured = 1';
            }

            // Validate sort field
            const allowedSorts = ['name', 'price', 'created_at', 'stock_quantity'];
            const sortField = allowedSorts.includes(sort) ? sort : 'created_at';
            const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            // Get total count
            const countQuery = `SELECT COUNT(*) as total FROM products p ${joinClause} ${whereClause}`;
            const { total } = await db.get(countQuery, params);

            // Get products
            const productsQuery = `
                SELECT
                    p.*,
                    c.name as category_name,
                    AVG(r.rating) as average_rating,
                    COUNT(r.id) as review_count
                FROM products p
                ${joinClause}
                LEFT JOIN reviews r ON p.id = r.product_id
                ${whereClause}
                GROUP BY p.id
                ORDER BY p.${sortField} ${sortOrder}
                LIMIT ? OFFSET ?
            `;

            params.push(parseInt(limit), offset);
            const products = await db.all(productsQuery, params);

            res.json({
                success: true,
                data: {
                    products,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });

        } catch (error) {
            logger.error(`Get products error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to get products'
            });
        }
    }

    // Get single product by ID
    async getById(req, res) {
        try {
            const { id } = req.params;

            const product = await db.get(`
                SELECT
                    p.*,
                    c.name as category_name,
                    AVG(r.rating) as average_rating,
                    COUNT(r.id) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id
                WHERE p.id = ? AND p.is_active = 1
                GROUP BY p.id
            `, [id]);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Get product reviews
            const reviews = await db.all(`
                SELECT
                    r.*,
                    u.username,
                    u.avatar_url
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.product_id = ?
                ORDER BY r.created_at DESC
                LIMIT 10
            `, [id]);

            res.json({
                success: true,
                data: {
                    product,
                    reviews
                }
            });

        } catch (error) {
            logger.error(`Get product error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to get product'
            });
        }
    }

    // Create new product (admin only)
    async create(req, res) {
        try {
            const {
                name,
                description,
                price,
                categoryId,
                stockQuantity,
                imageUrl,
                featured
            } = req.body;

            const result = await db.run(
                `INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, featured)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, description, price, categoryId, stockQuantity || 0, imageUrl, featured || false]
            );

            logger.info(`New product created: ${name} (ID: ${result.id})`);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: { productId: result.id }
            });

        } catch (error) {
            logger.error(`Create product error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to create product'
            });
        }
    }

    // Update product (admin only)
    async update(req, res) {
        try {
            const { id } = req.params;
            const {
                name,
                description,
                price,
                categoryId,
                stockQuantity,
                imageUrl,
                featured,
                isActive
            } = req.body;

            const result = await db.run(
                `UPDATE products SET
                 name = COALESCE(?, name),
                 description = COALESCE(?, description),
                 price = COALESCE(?, price),
                 category_id = COALESCE(?, category_id),
                 stock_quantity = COALESCE(?, stock_quantity),
                 image_url = COALESCE(?, image_url),
                 featured = COALESCE(?, featured),
                 is_active = COALESCE(?, is_active),
                 updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [name, description, price, categoryId, stockQuantity, imageUrl, featured, isActive, id]
            );

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            logger.info(`Product updated: ID ${id}`);

            res.json({
                success: true,
                message: 'Product updated successfully'
            });

        } catch (error) {
            logger.error(`Update product error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to update product'
            });
        }
    }

    // Delete product (admin only)
    async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await db.run(
                'UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );

            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            logger.info(`Product deactivated: ID ${id}`);

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });

        } catch (error) {
            logger.error(`Delete product error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to delete product'
            });
        }
    }

    // Get categories
    async getCategories(req, res) {
        try {
            const categories = await db.all(
                'SELECT * FROM categories WHERE is_active = 1 ORDER BY name'
            );

            res.json({
                success: true,
                data: { categories }
            });

        } catch (error) {
            logger.error(`Get categories error: ${error.message}`);
            res.status(500).json({
                success: false,
                message: 'Failed to get categories'
            });
        }
    }
}

module.exports = new ProductController();