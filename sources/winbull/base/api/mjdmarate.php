<?php
$data = str_replace('\\','',urldecode($_GET['data']));
if($data !='')	file_put_contents('rate.txt',$data);
?>