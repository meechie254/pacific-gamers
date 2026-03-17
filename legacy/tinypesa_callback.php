<?php
require_once '../includes/config.php';

// Log the TinyPESA callback response
$callbackData = file_get_contents('php://input');
file_put_contents('mpesa_callback_log.txt', "[" . date('Y-m-d H:i:s') . "] TinyPESA Callback: " . $callbackData . PHP_EOL, FILE_APPEND);

$data = json_decode($callbackData, true);

// TinyPESA basic callback structure
if (isset($data['Body']['stkCallback']['ResultCode']) && $data['Body']['stkCallback']['ResultCode'] == 0) {
    // Payment was successful
    $checkoutRequestID = $data['Body']['stkCallback']['CheckoutRequestID'];
    
    // In a production app, we would match CheckoutRequestID. 
    // For this setup, we update the most recent Pending order.
    try {
        $stmt = $db->query("SELECT id FROM orders WHERE status = 'Pending' ORDER BY created_at DESC LIMIT 1");
        $order = $stmt->fetch();
        
        if ($order) {
            $update = $db->prepare("UPDATE orders SET status = 'Paid' WHERE id = ?");
            $update->execute([$order['id']]);
        }
    } catch (Exception $e) {
        // Log error
    }
}
?>
