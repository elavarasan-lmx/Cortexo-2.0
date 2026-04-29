<?php
	header('Access-Control-Allow-Origin: *');  
	header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
	header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
	require("../global_configs.php");
	$responsedata = array();

	$jsonPath = '../admin/application/config/page_content.json';
	$termsContent = '<div><p align="justify">  </p></div>';
	if (file_exists($jsonPath)) {
	    $pageContent = json_decode(file_get_contents($jsonPath), true);
	    if (isset($pageContent['terms']['content'])) {
	        $termsContent = $pageContent['terms']['content'];
	    }
	}

	$responsedata['terms'] = array("title" => "Terms & Condtions" , "content" => array("displaytext" => $termsContent));

	echo json_encode($responsedata);
?>