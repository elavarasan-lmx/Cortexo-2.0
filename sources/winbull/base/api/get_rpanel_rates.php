<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
    error_reporting(-1);

    $url = "http://www.navaratnamaaligai.com/lmxtrade/winbullliteapi/api/v1/broadcastsourcerates";

    $postData = json_encode(['bcsclient' => 'navratmnew','bcsusername' => 'navratmnew','bcspassword' => 'lmx-trade']);

    $ch = curl_init($url);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData); 
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    if ($response === false) {
        echo '{"status": "error", "message": "Failed to retrieve data from API"}';
        return;
    }

    $encodedData = base64_encode($response);

    echo json_encode(['status' => 'success', 'message' => 'Data retrieved successfully','data' => $encodedData]);
?>
