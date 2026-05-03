<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class MY_Controller extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		date_default_timezone_set('Asia/Kolkata');
		if($this->login_model->check_to_clear_session()==false) {
			redirect("C_main/logout");
		}
	}

}