<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $dbPath = realpath(__DIR__ . '/../data/database.sqlite');
    echo "Attempting to connect to: $dbPath\n";
    
    if (!$dbPath) {
        die("Error: Database file not found in data/ directory.\n");
    }

    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connection successful!\n";

    $adminCount = $db->query("SELECT COUNT(*) FROM admins")->fetchColumn();
    echo "Found $adminCount admin(s).\n";

} catch (Exception $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}
?>
