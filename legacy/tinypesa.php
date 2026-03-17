<?php
/**
 * Zenca Gamers - TinyPESA M-Pesa Integration
 * Simplified STK Push logic via TinyPESA.
 */

define('TINYPESA_API_KEY', 'default_key'); // User will replace this with their actual key from tinypesa.com

/**
 * Function to initiate STK Push via TinyPESA
 */
function initiateStkPush($phoneNumber, $amount, $accountReference) {
    // Format phone: 07XXXXXXXX or 01XXXXXXXX
    $phone = preg_replace('/^254/', '0', $phoneNumber);
    
    $url = 'https://tinypesa.com/api/v1/express/initialize';
    
    $postData = [
        'amount' => $amount,
        'msisdn' => $phone,
        'account_no' => $accountReference
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'ApiKey: ' . TINYPESA_API_KEY,
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    
    // Log for debugging
    file_put_contents('mpesa_init_log.txt', "[" . date('Y-m-d H:i:s') . "] TinyPESA Response: " . $response . PHP_EOL, FILE_APPEND);
    
    curl_close($ch);
    
    return json_decode($response, true);
}
?>
