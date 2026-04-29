<?php
class C_customersms extends My_Controller {
	var $menu_code	= 24;
	var $entry_form = "singleusersms";
	var $notification_entry_form = "pushnotification";	
	public function __construct()
	{
		parent::__construct();			
	}	
	function index() {
		
	}
	// Entry Form
	function open_entry_form($model_name="usersms_settings_model",$type="",$id="") {			
		$model_name = 'usersms_settings_model'; // P-PERM fix: hardcode model name
		$this->load->model($model_name);				
		$data['db_error_msg'] ="";
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view($this->entry_form,$data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	function open_notification_entry_form() {			
		$fv['db_error_msg'] ="";
		$this->load->view($this->notification_entry_form,$fv);
	}
	function create_pushnotification() {
		$notification_message = $this->input->post('notification_message', true);
		$content = array(
				"en" => $notification_message
				);
		$hashes_array = array();
		$fields = array(
			'app_id' => isset(Globals::$app_id) ? Globals::$app_id : '',
			'included_segments' => array('All'),
			'data' => array(
				"nav" => "1"
			),
			'headings' => array("en" => isset(Globals::$notification_title) ? Globals::$notification_title : ''),
			'subtitle' => array("en" => isset(Globals::$notification_subtitle) ? Globals::$notification_subtitle : ''),
			'contents' => array("en" => $notification_message),
			'web_buttons' => $hashes_array
		);
		//$fields = json_encode($fields); 
		push_notification_helper($fields);

		$this->session->set_flashdata('message_notification', "Notification sent successfully");
		redirect("C_customersms/open_notification_entry_form");
	}
	
	function create_smsurl()//Control DB Process and Validation Process.
	{
		$this->load->model("usersms_settings_model");	
		$group_id = $this->input->post('group_id', true);
		$send_type = $this->input->post('send_type', true);
		echo $this->usersms_settings_model->get_smsurl($group_id, $send_type);	
	}					
	
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */