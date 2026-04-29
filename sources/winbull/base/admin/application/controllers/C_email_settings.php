<?php

class C_email_settings extends My_Controller {
	var $entry_form = "email_settings_entry";	
	var $menu_code	= 38;
	public function __construct()
	{
		parent::__construct();	
        $this->load->model("email_settings_model");
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
		$this->load->view('email_settings_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}

	// Entry Form
	function open_entry_form($model_name="email_settings_model",$type="",$id="") {	
        
		$this->load->model('email_settings_model');
	
		if($type=='edit'){
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
			$this->load->view($this->entry_form,$_POST['fv']);
		}

	}

	function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$this->load->model('email_settings_model');
		$this->db->trans_begin();

		if ($status == 'add_new') {
			// Add new not supported — service records come from dt_serv_master
			echo json_encode(['status' => 'error', 'message' => 'Add new is not supported for Email Settings.']);
			return;

		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);

			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();
			} else {
				$this->db->trans_rollback();
				echo json_encode(['status' => 'error', 'message' => 'Database error. Please try again.']);
				return;
			}

			if (isset($result['status']) && $result['status'] == 1) {
				$msg = isset($result['message']) ? $result['message'] : 'Email settings saved successfully.';
				echo json_encode(['status' => 'success', 'message' => $msg]);
			} else {
				echo json_encode(['status' => 'error', 'message' => 'Failed to update. Please try again.']);
			}
			return;

		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);

			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();
			} else {
				$this->db->trans_rollback();
			}

			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Email settings deleted successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to delete the email settings.');
			}

			redirect("/C_email_settings/open_listingform/");
			return;
		}

		// Fallback
		$this->db->trans_rollback();
		$this->load->view($this->entry_form);
	}
}

/* End of file C_email_settings.php */