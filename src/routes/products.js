const express = require('express');
const router = express.Router();
const db = require('../models/Database');

let productCache = null;
let cacheTimestamp = 0;
const CACHE_STALE_TIME = 2 * 60 * 1000; // 2 minutes

// Get all products (with optional filtering and caching)
router.get('/', async (req, res) => {
    const { search, category } = req.query;

    // Return cached data for basic 'all' request if not stale
    if (!search && (!category || category === 'all') && productCache && (Date.now() - cacheTimestamp < CACHE_STALE_TIME)) {
        return res.json(productCache);
    }

    let sql = "SELECT * FROM products WHERE is_deleted = 0";
    const params = [];

    if (search) {
        sql += " AND (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'all') {
        sql += " AND category = ?";
        params.push(category);
    }

    sql += " ORDER BY created_at DESC";

    try {
        const products = await db.all(sql, params);
        
        // Update cache for the 'all' request
        if (!search && (!category || category === 'all')) {
            productCache = products;
            cacheTimestamp = Date.now();
        }

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get ALL products including deleted (for undo functionality)
router.get('/all', async (req, res) => {
    try {
        const products = await db.all("SELECT * FROM products ORDER BY created_at DESC");
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get trending products
router.get('/trending', async (req, res) => {
    try {
        const rows = await db.all("SELECT * FROM products WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT 3");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Add product
router.post('/', async (req, res) => {
    const { name, price, description, image_url, category } = req.body;
    try {
        const result = await db.run(
            "INSERT INTO products (name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?)",
            [name, price, description, image_url, category]
        );
        res.json({ message: 'Product added successfully', id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update product
router.put('/:id', async (req, res) => {
    const { name, price, description, image_url, category, status } = req.body;
    try {
        await db.run(
            "UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, category = ?, status = ? WHERE id = ?",
            [name, price, description, image_url, category, status, req.params.id]
        );
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Soft delete product
router.delete('/:id', async (req, res) => {
    try {
        await db.run("UPDATE products SET is_deleted = 1 WHERE id = ?", [req.params.id]);
        
        // Auto-permanently delete after 30 seconds if not restored
        setTimeout(async () => {
            try {
                const product = await db.get("SELECT is_deleted FROM products WHERE id = ?", [req.params.id]);
                if (product && product.is_deleted === 1) {
                    await db.run("DELETE FROM products WHERE id = ?", [req.params.id]);
                }
            } catch (e) {
                console.error('Auto-delete error:', e);
            }
        }, 30000);

        res.json({ message: 'Product hidden successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Admin: Restore product
router.patch('/:id/restore', async (req, res) => {
    try {
        await db.run("UPDATE products SET is_deleted = 0 WHERE id = ?", [req.params.id]);
        res.json({ message: 'Product restored successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
