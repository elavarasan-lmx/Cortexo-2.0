<?php
	header('Access-Control-Allow-Origin: *');  
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
	error_reporting(-1);

	require("../global_configs.php");

	$db['default']['username'] = Globals::$username;
	$db['default']['password'] = Globals::$password;
    $db['default']['database'] = Globals::$database;
	$db['default']['hostname'] = Globals::$hostname;
	
	$connId = mysqli_connect($db['default']['hostname'],$db['default']['username'],$db['default']['password'],$db['default']['database']);
	$conndb = mysqli_select_db($connId,$db['default']['database']);
	
	if(!$conndb)
	{
		die('Connection Faild: ' . mysqli_error());
	}
	$placedOrders = array();
	$query = mysqli_query($connId,"SELECT contract_symbol,round_off FROM dt_contractmaster");
	
	if(!$query)
	{
		die('Invalid query: ' . mysqli_error());
	}	
	if(mysqli_num_rows($query) > 0) 
	{
		while($resultarray = mysqli_fetch_array($query)) 
		{
				$placedOrders['con_symbol'][] = array('contract_symbol' => $resultarray['contract_symbol'],'round_off' => $resultarray['round_off']); 	
		}
	}
	$connId->close();
	$lsdata = array('url'=>'http://72.52.178.11:8080','adapter'=> 'WLSTOCKLIST_REMOTE', 'provider'=>'WLQUOTE_ADAPTER', 'username'=>'lmxwinbullliteapp');

	 $bcurl = (Globals::$rateFeed == 0) ? Globals::$bcencdata 
        : ((Globals::$rateFeed == 1) ? Globals::$bcurl 
        : ((Globals::$rateFeed == 2) ? Globals::$txtdata 
        : ((Globals::$rateFeed == 3) ? Globals::$ratesocketurl 
        : ((Globals::$rateFeed == 4) ? Globals::$nativesocketurl 
        : Globals::$bcurl))));

	echo json_encode(array('socketurl' => Globals::$socket_base_url, 'rateurl' => Globals::$rateurl, 'symbol' =>$placedOrders['con_symbol'],'lsdata' => $lsdata, 'bcurl' => $bcurl, 'bcclient' => Globals::$bcclient, 'bcusername' => Globals::$bcusername, 'bcpassword' => Globals::$bcpassword, 'bcupdatetime' => Globals::$bcupdatetime, 'app_header_chk' => Globals::$app_header_chk,'rateFeed' => Globals::$rateFeed,'polling' => Globals::$polling,'websocket_type' => Globals::$websocket_type));
	
?>