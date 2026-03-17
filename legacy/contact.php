<?php
require_once '../includes/config.php';

// Only allow POST requests
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
$subject = $data['subject'] ?? 'General Inquiry';
$message = $data['message'] ?? '';

if (empty($name) || empty($email) || empty($message)) {
    jsonResponse(['error' => 'Name, Email, and Message are required'], 400);
}

try {
    $stmt = $db->prepare("INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $subject, $message]);
    
    jsonResponse([
        'message' => 'Message sent successfully!',
        'messageId' => $db->lastInsertId()
    ]);
} catch (PDOException $e) {
    jsonResponse(['error' => 'Failed to send message: ' . $e->getMessage()], 500);
}
?>
