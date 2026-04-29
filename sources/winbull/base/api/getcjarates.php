<?php
    header('Access-Control-Allow-Origin: *');  
    header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
	if(isset($_GET['version'])) {
		$ratearray = json_decode(file_get_contents('cjarate.txt'), true);
		$ratearray['display'] = 1;
		$ratearray['name'] = 'CJA';
		echo json_encode($ratearray);
	}else{
		$ratearray = json_encode(file_get_contents('cjarate.txt'));
		if(isset($_GET['callback'])) {
			echo  $_GET['callback']. '(' . $ratearray . ');';
		}else{
			echo $ratearray;
		}
	}
?>