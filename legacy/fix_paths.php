<?php
require_once __DIR__ . '/../includes/config.php';
try {
    $db->exec("UPDATE products SET image_url = REPLACE(image_url, 'images/', 'img/')");
    echo "Successfully updated image paths in database.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
