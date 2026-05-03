<?php
	$ratearray = json_encode(file_get_contents('cjarate.txt'));
	if(isset($_GET['callback'])) {
		echo  $_GET['callback']. '(' . $ratearray . ');';
	}else{
		echo $ratearray;
	}	
?>