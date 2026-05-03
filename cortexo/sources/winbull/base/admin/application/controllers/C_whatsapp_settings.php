<?php
class C_whatsapp_settings extends My_Controller {
	var $entry_form = "whatsapp_settings_entry";	
	var $menu_code	= 81;
	public function __construct()
	{
		parent::__construct();
		$this->load->helper("common");
		$this->load->model("Whatsapp_settings_model");
	}	
	function index()
	{
		
	}
	
	function open_listingform() {
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('whatsapp_listing',$data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}

	// Entry Form
	function open_entry_form($model_name="",$type="",$id="") {	
		$this->load->model('whatsapp_settings_model');				
		if($type=='edit'){
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach($this->session->userdata("usermenurights") as $key => $val){
				if($val["menuid"] == $this->menu_code){
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
				
		  $this->load->view($this->entry_form,$_POST['fv']);
		}
			
	  	//$this->load->view($this->entry_form);

	}
	
	function DB_Controller($model_name="",$status="",$id="")
	{
		$this->load->model('whatsapp_settings_model');
		$is_ajax = $this->input->is_ajax_request();
		$this->db->trans_begin();
		
		if($status=='edit') {
			$result = $this->$model_name->update_record($id);
		}
		else if($status=='delete') {
			$result = $this->$model_name->delete_record($id);
		}
		
		if($this->db->trans_status()===TRUE)
		{
			$this->db->trans_commit();
			
			if($status=='edit') {
				$this->session->set_flashdata('success', 'Whatsapp settings updated successfully.');
			} else if($status=='delete') {
				$this->session->set_flashdata('success', 'Record deleted successfully.');
			}
			
			if ($is_ajax) {
				echo json_encode(["status" => "success", "message" => $this->session->flashdata('success'), "redirect" => site_url('C_whatsapp_settings/open_listingform')]);
				exit;
			}
			redirect("/C_whatsapp_settings/open_listingform/");
		}
		else
		{
			$this->db->trans_rollback();
			$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if($db_error_msg == "0") {
				$db_error_msg = $this->db->_error_message();
			}
			$this->session->set_flashdata('error', $db_error_msg);
			
			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => $db_error_msg]);
				exit;
			}
			$_POST['fv']['type'] = $status;
			$_POST['fv']['db_error_msg'] = $db_error_msg;
			$this->load->view($this->entry_form, $_POST['fv']);
		}
	}			
}
/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */