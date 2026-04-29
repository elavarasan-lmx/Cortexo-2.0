<?php
class C_popup extends My_Controller {
	var $menu_code	= 40;
	var $form_entry = "popup";	
	public function __construct()
	{
		parent::__construct();
		$this->load->model("popup_model");	
		$this->load->helper('common');  
	}	
	function index()
	{
		
	}
	function open_listingform($db_error_msg="") 
	{		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('popup_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {	
		
		$this->load->model('popup_model');				
		if ($type == 'add_new')	
		{
			$record					=	$this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach($this->session->userdata("usermenurights") as $key => $val){
				if($val["menuid"] == $this->menu_code){
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			
			$this->load->view($this->form_entry,$_POST['fv']);
		}	
		else if($type=='edit')
		   {
		   	  $record					=	$this->$model_name->get_entry_record($id);
			  $code						=	$id;
			  $_POST['fv']				=	$record;
			  $_POST['fv']['type']		=	$type;
			  $_POST['fv']['code']		=	$code;
			  $_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
				foreach($this->session->userdata("usermenurights") as $key => $val){
					if($val["menuid"] == $this->menu_code){
						$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
					}
				}
				
			  $this->load->view($this->form_entry,$_POST['fv']);
			}
		else if($type=='delete') 
			{
				
			  $record					=	$this->$model_name->get_entry_record($id);
			  $code						=	$id;
			  $_POST['fv']				=   $record;
			  $_POST['fv']['type']		=   $type;
			  $_POST['fv']['code']		=	$code;
			  $this->load->view($this->form_entry,$_POST['fv']);
		}	  	
	}
	function check_duplicate_name() {
		$pop_name = $this->input->post('pop_name');
		$pop_id = $this->input->post('pop_id');
		$result = $this->popup_model->check_duplicate_name($pop_name, $pop_id);
		echo json_encode(['exists' => $result]);
	}

	function check_active_popup() {
		$pop_id = $this->input->post('pop_id');
		$result = $this->popup_model->check_active_popup($pop_id);
		echo json_encode(['has_active' => $result]);
	}

	function DB_Controller($model_name="",$status="",$id="")
	{
		$this->load->model('popup_model');
		$is_ajax = $this->input->is_ajax_request();
		
		if($status=='add_new' || $status=='edit') {
			$pop_name = $this->input->post('fv')['pop_name'];
			$pop_active = $this->input->post('fv')['pop_active'];
			$check_id = ($status == 'add_new') ? null : $id;
			
			if($this->popup_model->check_duplicate_name($pop_name, $check_id)) {
				if ($is_ajax) {
					echo json_encode(["status" => "error", "message" => "Popup name already exists!"]);
					return;
				}
				$_POST['fv']['type'] = $status;
				$_POST['fv']['db_error_msg'] = 'Popup name already exists!';
				$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
				foreach($this->session->userdata("usermenurights") as $key => $val){
					if($val["menuid"] == $this->menu_code){
						$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
					}
				}
				$this->load->view($this->form_entry,$_POST['fv']);
				return;
			}
			
			if($pop_active == 1 && $this->popup_model->check_active_popup($check_id)) {
				if ($is_ajax) {
					echo json_encode(["status" => "error", "message" => "Another popup is already active. Please deactivate it first."]);
					return;
				}
				$_POST['fv']['type'] = $status;
				$_POST['fv']['db_error_msg'] = 'Another popup is already active. Please deactivate it first.';
				$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
				foreach($this->session->userdata("usermenurights") as $key => $val){
					if($val["menuid"] == $this->menu_code){
						$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
					}
				}
				$this->load->view($this->form_entry,$_POST['fv']);
				return;
			}
		}
		
		$this->db->trans_begin();

		if($status=='add_new') {
			$result = $this->$model_name->insert_record($id);
		} else if($status=='edit') {
			$result = $this->$model_name->update_record($id);
		} else if($status=='delete') {
			$result = $this->$model_name->delete_record($id);
		} else {
			$this->load->view($this->form_entry,$_POST['fv']);
			return;
		}

		if($this->db->trans_status()===TRUE) {
			$this->db->trans_commit();
			if($status=='add_new') {
				$this->session->set_flashdata('success', 'Popup added successfully.');
			} else if($status=='edit') {
				$this->session->set_flashdata('success', 'Popup updated successfully.');
			} else if($status=='delete') {
				$this->session->set_flashdata('success', 'Popup deleted successfully.');
			}
			if ($is_ajax) {
				echo json_encode(["status" => "success", "redirect" => site_url('C_popup/open_listingform')]);
				exit;
			}
			redirect("/C_popup/open_listingform/");
		} else {
			$this->db->trans_rollback();
			$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if($db_error_msg == "0") {
				$db_error_msg = $this->db->_error_message();
			}
			$this->session->set_flashdata('error', $db_error_msg);
			if($status == "delete") {
				redirect("/C_popup/open_listingform/");
			} else {
				if($status == "add_new") {
					$_POST['fv']['pop_id'] = NULL;
				}
				$_POST['fv']['type'] = $status;
				$_POST['fv']['db_error_msg'] = $db_error_msg;
				$this->load->view($this->form_entry,$_POST['fv']);
			}
		}
	}			
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */