<?php
class C_adminlog extends My_Controller {
	var $menu_code	= 55;
	public function __construct()
	{
		parent::__construct();
		$this->load->model('adminlog_model');	
		error_reporting(-1);		
	}	
	function index() 
	{		
	
	}
	function openevent_listingform($db_error_msg="")
	{
		$data["db_error_msg"] = $db_error_msg;
		$this->load->view('adminlog_listing',$data);	
	}	
	function adminlog_dataload($model_name = "", $from_date = "", $to_date = "") 
	{
		$data 	= $this->$model_name->adminlog_dataload($from_date, $to_date)->result_array();
        echo json_encode ($data);	
    }
	
		
}
