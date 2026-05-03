<?php
	header('Access-Control-Allow-Origin: *');  
	header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
	header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
	require("../global_configs.php");
	$responsedata = array();
	$responsedata['terms'] = array("title" => "Trade Terms & Condtions" , "content" => array("displaytext" => '<div><p align="justify"> Trade Timings 10.00 to 23.20 IST. </p><p align="justify"><span style="color:#612141;">&#9658;</span> Payment and Delivery terms are as in Practice.</p><p align="justify"><span style="color:#612141;">&#9658;</span> Delivery has to be taken T+2 days. If any delays in delivery penalty would be charged.</p><p align="justify"><span style="color:#612141;">&#9658;</span> All Limit Orders placed by customers which are not executed after market close will be expired by the end of the day.</p><p align="justify"><span style="color:#612141;">&#9658;</span> '.Globals::$web_title.' not responsible for any technical failure or malfunctioning of the software or delays of any kind.</p><p align="justify"><span style="color:#612141;">&#9658;</span> A valid mobile number And Email ID is needed for registering with '.Globals::$web_title.'</p><p align="justify"><span style="color:#612141;">&#9658;</span> CONTACT DIRECTLY to ACTIVATE THE ONLINE TRADING ACCOUNT.</p><p align="justify"><span style="color:#612141;">&#9658;</span> Clients will be notified via SMS and Email for account activation.</p><p align="justify"><span style="color:#612141;">&#9658;</span> '.Globals::$web_title.' can TERMINATE YOUR ACCOUNT AT ANY TIME WITH OR WITHOUT PRIOR NOTICE.</p></div>'));

	echo json_encode($responsedata);
	
?>