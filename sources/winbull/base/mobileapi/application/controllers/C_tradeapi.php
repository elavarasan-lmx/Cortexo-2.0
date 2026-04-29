<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';

class C_tradeapi extends REST_Controller
{
	function __construct()
	{
		header('Access-Control-Allow-Origin: *');
		header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
		header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
		$method = $_SERVER['REQUEST_METHOD'];
		if($method == "OPTIONS") {
			exit();
		}
		// Construct our parent class
		parent::__construct();
		ini_set('date.timezone', 'Asia/Calcutta');
		$this->response->format = 'json';
		$this->load->model("M_tradeapi");
	}
	
	function gettodaytrade_get() {
		$this->load->model("M_tradeapi");
		$return_data = $this->M_tradeapi->gettodaytandinglist();
		echo json_encode($return_data); 
	}
	function gettodaytradebydate_get() {
		$this->load->model("M_tradeapi");
		$return_data = $this->M_tradeapi->gettodaytandinglistbydate($this->get('from'), $this->get('to'));
		
		echo json_encode($return_data); 
	}	
}	
