<?php
	//Include autoloader
	require_once 'dompdf/autoload.inc.php';
	
	//Reference the Dompdf namespace
	use Dompdf\Dompdf;
	
	$html  = $this->load->view('mobileuserprint',$customers,true);
	if(headers_sent()) { print $html; die; }
	
	$domdpf = new Dompdf();
	$domdpf->loadHtml($html);
	$domdpf->setPaper('A4','landscape');
	$domdpf->render();
	
	$domdpf->stream("MobileuserprintList.pdf",array("Attachment" => false));
	exit(0); 
?>