<?php
	header('Access-Control-Allow-Origin: *');  
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
	
	require("../global_configs.php");
	
	$req_data = (array)json_decode(file_get_contents("php://input"));
	$platform_type 	= $req_data['platform_type'];
	$responsedata = array();
	
	if($platform_type == 1)
	{
		$responsedata['socialshare']= array("title" => "socialshare content" ,"subject" => "Greetings from ".Globals::$web_title, "message" => "Book Gold and Silver through online get instant delivery, Click here to download our app ","link" =>"","img" => "");
	}
	else
	{
		$responsedata['socialshare'] = array("title" => "socialshare content" ,"subject" => "Greetings from ".Globals::$web_title, "message" => "Book Gold and Silver through online get instant delivery Download our app","link" =>"","img" => "");  
	}
	echo json_encode($responsedata);
?>