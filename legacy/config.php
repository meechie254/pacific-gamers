<?php
/**
 * Core Configuration & Database Connection
 * This file initializes the SQLite database and creates the necessary tables.
 */

// Diagnostic Check: Ensure project is running via a web server
if (php_sapi_name() !== 'cli' && (!isset($_SERVER['SERVER_NAME']) || $_SERVER['SERVER_NAME'] === '')) {
    die("<h1>Environment Error</h1><p>This project requires a PHP server to run. Please use the <strong>START_SERVER.bat</strong> file or XAMPP.</p>");
}

try {
    // Replaced MySQL with SQLite for simpler 1-file portability if requested, 
    // but the system is designed to switch easily.
    $db = new PDO('sqlite:' . dirname(__DIR__) . '/data/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Create Orders Table
    $db->exec("CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        items TEXT NOT NULL,
        total TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Create Messages Table
    $db->exec("CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Create Products Table
    $db->exec("CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        category TEXT,
        status TEXT DEFAULT 'available',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Create Admins Table
    $db->exec("CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )");

    // Create Bookings Table
    $db->exec("CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        service TEXT NOT NULL,
        details TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Seed Default Admin if empty
    $adminCount = $db->query("SELECT COUNT(*) FROM admins")->fetchColumn();
    if ($adminCount == 0) {
        $password = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
        $stmt->execute(['admin', $password]);
    }

    // Seed Initial Products if empty
    $count = $db->query("SELECT COUNT(*) FROM products")->fetchColumn();
    if ($count == 0) {
        $initial_products = [
            ['FIFA 25', 59, 'Realistic football gameplay, updated teams, online tournaments.', 'img/fifa25.jpg', 'sports'],
            ['Resident Evil 4 Remake', 59, 'Survival horror remastered with stunning graphics and gameplay.', 'img/re4_remake.png', 'action'],
            ['Tekken 8', 69, 'The next generation of the legendary fighting game franchise.', 'img/tekken8.png', 'action'],
            ['Assassin\'s Creed Mirage', 49, 'Return to the roots of the series in 9th-century Baghdad.', 'img/ac_mirage.png', 'action']
        ];
        
        $stmt = $db->prepare("INSERT INTO products (name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?)");
        foreach ($initial_products as $p) {
            $stmt->execute($p);
        }
    }

} catch (PDOException $e) {
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]));
}

/**
 * Helper to get JSON input from request body
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

/**
 * Helper to respond with JSON
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>
