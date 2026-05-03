<?php
class C_admin_log extends My_Controller {
	var $comm_menu_code	= 61;
	var $repanelrate_menu_code	= 62;
	var $repanelstat_menu_code	= 63;
	var $booktrade_menu_code	= 64;
	public function __construct()
	{
		parent::__construct();	
		$this->load->model("logs_model");	
	}	
	function index()
	{
		
	}
	function open_commodity_list($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->comm_menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('log_comgroup_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	function open_rpanelupdate_list($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->repanelrate_menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('log_rpanelupdate_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	function open_rpenalstatus_list($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->repanelstat_menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('log_rpanelstatus_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	function open_tradebook_list($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->booktrade_menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('log_tradebook_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	
	function commgroup_dataload($model_name = "", $from_date = "", $to_date = "") {
        $model_name = 'logs_model'; // P-PERM fix: hardcode model name
        $data 			= 	$this->$model_name->commgroup_dataload($from_date, $to_date)->result_array();
        echo json_encode ($data);	
    }
	function rpanelrate_dataload($model_name = "", $from_date = "", $to_date = "") {
        $model_name = 'logs_model'; // P-PERM fix: hardcode model name
        $data 			= 	$this->$model_name->rpanelrate_dataload($from_date, $to_date)->result_array();
        echo json_encode ($data);	
    }
	function rpanelstatus_dataload($model_name = "", $from_date = "", $to_date = "") {
        $model_name = 'logs_model'; // P-PERM fix: hardcode model name
        $data 			= 	$this->$model_name->rpanelstatus_dataload($from_date, $to_date)->result_array();
        echo json_encode ($data);	
    }
	function tradebook_dataload($model_name = "", $from_date = "", $to_date = "") {
        $model_name = 'logs_model'; // P-PERM fix: hardcode model name
        $data 			= 	$this->$model_name->tradebook_dataload($from_date, $to_date)->result_array();
        echo json_encode ($data);	
    }
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */