<?php
	require_once('HtmlExcel/HtmlExcel.php');
	
	$html  = $this->load->view('dealregisterexcel',$customers,true);
	
	$xls = new HtmlExcel();
	$xls->setCss($css);
	$xls->addSheet("html", $html);	
	$xls->headers();
	
	echo $xls->buildFile();
	
	exit(0);
?>