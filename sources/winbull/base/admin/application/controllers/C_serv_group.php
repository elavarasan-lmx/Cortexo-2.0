<?php
class C_serv_group extends My_Controller {
	var $form_entry = "serv_group_entry";
	var $menu_code	= 25;	
	public function __construct()
	{
		parent::__construct();
		$this->load->model("serv_group_model");
	}	
	function index()
	{
		
	}
	function open_listingform($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('serv_group_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {			
		$this->load->model('serv_group_model');				
		if ($type=='add_new')	
		{							
				$record					=	$this->$model_name->empty_record();
				$_POST['fv']['type']	=	$type;
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
	function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$this->load->model('serv_group_model');
		$this->db->trans_begin();

		// Record labels for messages
		$label = 'Service Group';

		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			$message = ($result['status'] == 1) ? $label . " added successfully." : ($result['message'] ?? "Failed to add record.");
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			$message = ($result['status'] == 1) ? $label . " updated successfully." : ($result['message'] ?? "Failed to update record.");
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			$message = ($result['status'] == 1) ? $label . " deleted successfully." : ($result['message'] ?? "Failed to delete record.");
		} else {
			echo json_encode(["status" => "error", "message" => "Invalid request"]);
			exit;
		}

		// Check transaction status
		if ($this->db->trans_status() === TRUE && (!isset($result['status']) || $result['status'] == 1)) {
			$this->db->trans_commit();
			$this->session->set_flashdata("success", $message);
			$response = ["status" => "success", "message" => $message];
		} else {
			$this->db->trans_rollback();
			$error_msg = $result['message'] ?? "Database error occurred.";
			$this->session->set_flashdata("error", $error_msg);
			$response = ["status" => "error", "message" => $error_msg];
		}

		echo json_encode($response);
		exit;
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */