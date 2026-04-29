<?php
	$xmlstring = wincache_ucache_get("ab_rate_xml");
	$xml = simplexml_load_string($xmlstring);
	$rate_json = json_encode($xml);
	echo  $_GET['callback']. '(' . $rate_json . ');';
	//echo $rate_json;
?>