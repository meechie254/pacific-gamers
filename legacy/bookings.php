<?php
require_once '../includes/config.php';

// Only allow POST requests for submissions
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();

if (!$data) {
    jsonResponse(['error' => 'Invalid data provided'], 400);
}

// Extract and sanitize
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$service = $data['service'] ?? '';
$details = $data['details'] ?? '';

if (empty($name) || empty($email) || empty($service)) {
    jsonResponse(['error' => 'Name, Email, and Service are required'], 400);
}

try {
    $stmt = $db->prepare("INSERT INTO bookings (name, email, service, details) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $service, $details]);
    
    jsonResponse(['message' => 'Booking submitted successfully!', 'id' => $db->lastInsertId()]);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Failed to save booking: ' . $e->getMessage()], 500);
}
?>
