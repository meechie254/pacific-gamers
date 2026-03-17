const db = require('./src/models/Database');
const logger = require('./src/utils/logger');

async function runMigrations() {
    try {
        logger.info('Starting database migrations...');

        // Migration 1: Add sample categories
        await db.run(`
            INSERT OR IGNORE INTO categories (id, name, description) VALUES
            (1, 'Gaming Consoles', 'PlayStation, Xbox, Nintendo consoles'),
            (2, 'Gaming Accessories', 'Controllers, headsets, keyboards'),
            (3, 'PC Gaming', 'Gaming PCs, components, peripherals'),
            (4, 'Mobile Gaming', 'Mobile games and accessories'),
            (5, 'Board Games', 'Traditional and modern board games'),
            (6, 'Collectibles', 'Gaming memorabilia and collectibles')
        `);

        // Migration 2: Add sample products
        await db.run(`
            INSERT OR IGNORE INTO products (name, description, price, category_id, stock_quantity, featured) VALUES
            ('PlayStation 5', 'Next-gen gaming console with 4K graphics', 499.99, 1, 50, 1),
            ('Xbox Series X', 'Microsoft latest gaming console', 499.99, 1, 45, 1),
            ('Nintendo Switch OLED', 'Hybrid gaming console', 349.99, 1, 60, 0),
            ('Gaming Headset Pro', 'High-quality wireless gaming headset', 129.99, 2, 100, 1),
            ('Mechanical Keyboard', 'RGB backlit mechanical gaming keyboard', 89.99, 2, 75, 0),
            ('Gaming Mouse', 'Precision gaming mouse with RGB lighting', 59.99, 2, 120, 0)
        `);

        // Migration 3: Create default admin user (only if no users exist)
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        if (userCount.count === 0) {
            const bcrypt = require('bcryptjs');
            const saltRounds = 12;
            const adminPassword = await bcrypt.hash('admin123', saltRounds);

            await db.run(
                `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                ['admin', 'admin@zencagamers.com', adminPassword, 'Admin', 'User', 'admin']
            );

            logger.info('Default admin user created: admin@zencagamers.com / admin123');
        }

        logger.info('Database migrations completed successfully');

    } catch (error) {
        logger.error(`Migration error: ${error.message}`);
        process.exit(1);
    }
}

// Run migrations if this script is executed directly
if (require.main === module) {
    runMigrations().then(() => {
        logger.info('Migration script completed');
        process.exit(0);
    });
}

module.exports = runMigrations;