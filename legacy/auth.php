<?php
session_start();
require_once '../includes/config.php';

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $data = getJsonInput();
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $db->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password'])) {
        $_SESSION['admin_auth'] = true;
        $_SESSION['admin_user'] = $username;
        jsonResponse(['success' => true]);
    } else {
        jsonResponse(['error' => 'Invalid username or password'], 401);
    }
}

if ($action === 'logout') {
    session_destroy();
    jsonResponse(['success' => true]);
}

if ($action === 'check') {
    if (isset($_SESSION['admin_auth']) && $_SESSION['admin_auth'] === true) {
        jsonResponse(['authenticated' => true, 'user' => $_SESSION['admin_user']]);
    } else {
        jsonResponse(['authenticated' => false]);
    }
}
?>
