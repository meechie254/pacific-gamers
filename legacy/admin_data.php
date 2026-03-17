<?php
session_start();
require_once '../includes/config.php';

$action = $_GET['action'] ?? '';

// Public Actions (No Auth Required)
if ($action === 'get_trending') {
    $stmt = $db->query("SELECT * FROM products ORDER BY created_at DESC LIMIT 3");
    jsonResponse($stmt->fetchAll());
}

if ($action === 'get_products_public') {
    $stmt = $db->query("SELECT * FROM products ORDER BY created_at DESC");
    jsonResponse($stmt->fetchAll());
}

// Protected Actions (Auth Required)
if (!isset($_SESSION['admin_auth']) || $_SESSION['admin_auth'] !== true) {
    jsonResponse(['error' => 'Unauthorized access'], 401);
}

try {
    if ($action === 'get_orders') {
        $stmt = $db->query("SELECT * FROM orders ORDER BY created_at DESC");
        jsonResponse($stmt->fetchAll());
    } 
    elseif ($action === 'get_messages') {
        $stmt = $db->query("SELECT * FROM messages ORDER BY created_at DESC");
        jsonResponse($stmt->fetchAll());
    } 
    elseif ($action === 'update_status') {
        $data = getJsonInput();
        $id = $data['id'] ?? 0;
        $status = $data['status'] ?? 'Paid';
        
        $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        jsonResponse(['message' => 'Status updated successfully']);
    }
    elseif ($action === 'get_products') {
        $stmt = $db->query("SELECT * FROM products ORDER BY created_at DESC");
        jsonResponse($stmt->fetchAll());
    }
    elseif ($action === 'add_product') {
        $data = getJsonInput();
        $stmt = $db->prepare("INSERT INTO products (name, price, description, image_url, category) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['price'], $data['description'], $data['image_url'], $data['category']]);
        jsonResponse(['message' => 'Product added successfully', 'id' => $db->lastInsertId()]);
    }
    elseif ($action === 'update_product') {
        $data = getJsonInput();
        $stmt = $db->prepare("UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, category = ?, status = ? WHERE id = ?");
        $stmt->execute([$data['name'], $data['price'], $data['description'], $data['image_url'], $data['category'], $data['status'], $data['id']]);
        jsonResponse(['message' => 'Product updated successfully']);
    }
    elseif ($action === 'delete_product') {
        $data = getJsonInput();
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$data['id']]);
        jsonResponse(['message' => 'Product deleted successfully']);
    }
    elseif ($action === 'get_bookings') {
        $stmt = $db->query("SELECT * FROM bookings ORDER BY created_at DESC");
        jsonResponse($stmt->fetchAll());
    }
    elseif ($action === 'get_analytics') {
        // Get daily revenue for the last 7 days
        $analytics = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $stmt = $db->prepare("SELECT SUM(REPLACE(REPLACE(total, 'KES ', ''), ',', '')) as daily_total 
                                 FROM orders 
                                 WHERE status = 'Paid' AND date(created_at) = ?");
            $stmt->execute([$date]);
            $res = $stmt->fetch();
            $analytics[] = [
                'day' => date('D', strtotime($date)),
                'revenue' => (float)($res['daily_total'] ?? 0)
            ];
        }
        jsonResponse($analytics);
    }
    else {
        jsonResponse(['error' => 'Invalid action'], 400);
    }
} catch (PDOException $e) {
    jsonResponse(['error' => $e->getMessage()], 500);
}
?>
