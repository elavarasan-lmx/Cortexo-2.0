<?php
/*RB*/
	//Include autoloader
	require_once 'dompdf/autoload.inc.php';
	
	//Reference the Dompdf namespace
	use Dompdf\Dompdf;
	
	//Load the file in model get function using value
	$html  = $this->load->view('mobileuserpdf',$customers,true);
	if(headers_sent()) { print $html; die; }
	
	$domdpf = new Dompdf();
	$domdpf->loadHtml($html);
	$domdpf->setPaper('A4','landscape');
	$domdpf->render();

	//For view
	$domdpf->stream("mobileuserpdf.pdf",array("Attachment" => false));
	exit(0); 
	
/*RB*/	
?>	

