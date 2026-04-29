<?php
class C_admin_user extends My_Controller {
	var $form_entry = "adminuser_entry";	
	public function __construct()
	{
		parent::__construct();
		$this->load->model("adminuser_model");			
	}	
	
	function index() {
		
	}
	
	function open_listingform($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$this->load->view('adminuser_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {			
		$this->load->model($model_name);				
		if ($type=='add_new')	
		{							
				$record					=	$this->$model_name->empty_record();
				$_POST['fv']['type']	=	$type;
				$this->load->view($this->form_entry,$_POST['fv']);
		}	
		else if($type=='edit')
		   {
		   	  $record					=	$this->$model_name->get_entry_record($id);
			  $code						=	$id;
			  $_POST['fv']				=	$record;
			  $_POST['fv']['type']		=	$type;
			  $_POST['fv']['code']		=	$code;
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
	function DB_Controller($model_name = "", $status = "", $id = "")	//Control DB Process and Validation Process.
	{
		$this->load->model($model_name);
		$is_ajax = $this->input->is_ajax_request();
		$this->db->trans_begin();  // Begin Transaction		
		//echo "aaaaa";
		
		$result = [];
		$message = "";

		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			$message = (isset($result['status']) && $result['status'] == 1) ? 'Record added successfully.' : ($result['message'] ?? 'Failed to add record.');
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			$message = (isset($result['status']) && $result['status'] == 1) ? 'Record updated successfully.' : ($result['message'] ?? 'Failed to update record.');
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			$message = (isset($result['status']) && $result['status'] == 1) ? 'Record deleted successfully!' : ($result['message'] ?? 'Failed to delete the record!');
		} else {
			$this->load->view($this->form_entry, $_POST['fv']);
			return; // Added return to stop execution if no status match
		}
		
		//Call insert function from loaded db model to insert record.				
		if ($this->db->trans_status() === TRUE && (!isset($result['status']) || $result['status'] == 1)) {
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			
			if ($is_ajax) {
				echo json_encode(["status" => "success", "message" => $message]);
				exit;
			}
			
			$this->session->set_flashdata('success', $message);
			redirect("/C_admin_user/open_listingform/");
		} else {
			//$db_error_msg = $this->db->_error_number();						
			$db_error = $this->db->error();
			$db_error_msg = isset($result['message']) ? $result['message'] : $this->general_model->get_errormessage($db_error['code']);
			if ($db_error['code'] != 0 && empty($db_error_msg)) {
				$db_error_msg = $db_error['message'];
			}
			//$db_error_msg = $this->general_model->get_errormessage($db_error['code']);			
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	//Rollback all transactions.
			
			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => $db_error_msg]);
				exit;
			}
			
			$_POST['fv']['type']	=	$status;				//Sending status to view as failure.				
			if ($status == "delete") {
				$this->session->set_flashdata('error', $db_error_msg);
				redirect("/C_admin_user/open_listingform/");
			} else {
				$_POST['fv']['admin_user_id'] =	NULL;
				$_POST['fv']['db_error_msg']  = $db_error_msg;
				$this->load->view($this->form_entry, $_POST['fv']);	//Load entry View to display errors.
			}
		}
	}
			
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */