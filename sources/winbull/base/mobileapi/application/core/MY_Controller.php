<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class MY_Controller extends CI_Controller
{
	public function __construct()
    {
        parent::__construct();
		date_default_timezone_set('Asia/Kolkata');
		$this->load->model('login_model');
		if($this->login_model->get_booking() && $this->login_model->check_to_clear_session()==false) {			
				redirect("C_client_main/logout");
		}	
	}

}