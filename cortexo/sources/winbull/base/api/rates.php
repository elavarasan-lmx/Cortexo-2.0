<?php
$xmlstring = file_get_contents("ratejm.xml");
//$xmlstring = file_get_contents("http://www.jmbullion.com/api/rate_full.php");
$xml = simplexml_load_string($xmlstring);
$rate_json = json_encode($xml);
//$rate_json .= json_encode(file_get_contents('rate.txt'));
echo  $_GET['callback']. '(' . $rate_json .');';
?>