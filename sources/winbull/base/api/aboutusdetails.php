<?php
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
require("../global_configs.php");
$responsedata = array();

$jsonPath = '../admin/application/config/page_content.json';
$aboutContent = '<p>No content available.</p>';
if (file_exists($jsonPath)) {
    $pageContent = json_decode(file_get_contents($jsonPath), true);
    if (isset($pageContent['about-us']['content'])) {
        $aboutContent = $pageContent['about-us']['content'];
    }
}

$responsedata['aboutus'][] = array("title" => "About Us" ,"logo" => "http://localhost/JMJ%20Bullion/assets/images/logo.png","content" => $aboutContent);
echo json_encode($responsedata);
?>