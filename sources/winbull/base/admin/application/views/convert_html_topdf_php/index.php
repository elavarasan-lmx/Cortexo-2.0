<?php
/*RB*/

	//Include autoloader
	require_once 'dompdf/autoload.inc.php';
	
	//Reference the Dompdf namespace
	use Dompdf\Dompdf;
	
	//Load the file in model get function using value
	$html   = $this->load->view('print_Cl',$customer,true);
	//$html = $this->load->view('print_Cl',$customer,true);
	
	$domdpf = new Dompdf();
	$domdpf->loadHtml($html);
	$domdpf->setPaper('A4','landscape');
	$domdpf->render();
	
	//For view
	$domdpf->stream("CustomerList.pdf",array("Attachment" => false));
	exit(0);

/*RB*/	
?>
