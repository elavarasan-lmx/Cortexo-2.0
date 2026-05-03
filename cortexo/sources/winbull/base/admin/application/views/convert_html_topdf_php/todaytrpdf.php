<?php
		
	//Include autoloader
	require_once 'dompdf/autoload.inc.php';
	
	//Reference the Dompdf namespace
	use Dompdf\Dompdf;
	
	//$print['customers'] = $customers;
	//Load the file in model get function using value
	$html  = $this->load->view('todaytradepdf',$customers,true);
	//if(headers_sent()) { print $html; die; }
	
	$domdpf = new Dompdf();
	$domdpf->loadHtml($html);
	$domdpf->setPaper('A4','landscape');
	$domdpf->render();
	
	$domdpf->stream("cusdelivery.pdf",array("Attachment" => 0));
	exit(0); 
?>