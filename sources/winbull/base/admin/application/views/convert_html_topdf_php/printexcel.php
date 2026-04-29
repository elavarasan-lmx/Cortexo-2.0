<?php

require_once('HtmlExcel/HtmlExcel.php');

$html   = $this->load->view('print_Cl',$customer,true);

$xls = new HtmlExcel();
$xls->loadHtml($html);
$xls->setCss($css);
$xls->addSheet("Numbers", $numbers);
$xls->addSheet("Names", $names);
$xls->headers();
echo $xls->buildFile();	
	

?>