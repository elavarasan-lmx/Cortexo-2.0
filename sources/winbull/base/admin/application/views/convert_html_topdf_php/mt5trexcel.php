<?php
	require_once('HtmlExcel/HtmlExcel.php');

	$html  = $this->load->view('mt5hgexcel',$customers,true);
	
	$xls = new HtmlExcel();
	$xls->setCss($css);
	$xls->addSheet("html", $html);	
	$xls->headers_mt5();
	
	echo $xls->buildFile();
	
	exit(0);
?>