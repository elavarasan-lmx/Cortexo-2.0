<?php
	require_once('HtmlExcel/HtmlExcel.php');

	$data = array();
    // Use the $customers variable (which holds the records)
    $data['customers'] = isset($customers) ? $customers : array();
    $data['header_info'] = isset($header_info) ? $header_info : array();

	$html  = $this->load->view('cusdeliveryexcel', $data, true);
	
	$xls = new HtmlExcel();
	$xls->setCss($css);
	$xls->addSheet("html", $html);	
	$xls->headers();
	
	echo $xls->buildFile();
	
	exit(0);
?>