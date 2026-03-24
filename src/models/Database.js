const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'database.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('CRITICAL: Error opening database:', err.message);
        process.exit(1);
    }

    console.log('Connected to the SQLite database at:', dbPath);

    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON');
        db.run('PRAGMA journal_mode = WAL');
        db.run('PRAGMA synchronous = NORMAL');
        db.run('PRAGMA busy_timeout = 5000');
    });

    initializeTables();
});

function initializeTables() {
    db.serialize(() => {
        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            shipping_address TEXT,
            items TEXT NOT NULL,
            total REAL NOT NULL,
            total_amount REAL,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            order_number TEXT UNIQUE
        )`);

        db.run('CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)');
        db.run('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');

        // Order Items Table
        db.run(`CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
        )`);

        db.run('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');

        // Messages Table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            message_type TEXT DEFAULT 'contact',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image_url TEXT,
            category TEXT,
            status TEXT DEFAULT 'available',
            is_deleted INTEGER DEFAULT 0,
            stock INTEGER DEFAULT 0 CHECK(stock >= 0),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');

        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Admins Table
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            tournament TEXT,
            date TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Subscriptions Table
        db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Optional migration tracking table for later feature-safe updates
        db.run(`CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed default admin if empty (using bcrypt hash for 'admin123')
        db.get("SELECT COUNT(*) as count FROM admins", (err, row) => {
            if (!err && row.count === 0) {
                const adminHash = '$2a$10$7p1zYF80iJ76I.L4O83u.O7t8pI79p8iJ76I.L4O83u.O7t8pI79p8'; // 'admin123'
                db.run("INSERT INTO admins (username, password) VALUES (?, ?)", ['pacificadmin', adminHash]);
                console.log('✅ Default admin account created: pacificadmin / admin123');
            }
        });
    });
}

const dbAsync = {
    get: (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    }),
    all: (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    }),
    run: (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, changes: this.changes });
        });
    }),
    beginTransaction: () => new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION', (err) => err ? reject(err) : resolve());
    }),
    commit: () => new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => err ? reject(err) : resolve());
    }),
    rollback: () => new Promise((resolve, reject) => {
        db.run('ROLLBACK', (err) => err ? reject(err) : resolve());
    }),
    close: () => new Promise((resolve, reject) => {
        db.close((err) => err ? reject(err) : resolve());
    }),
    rawDb: db,
};

module.exports = dbAsync;

