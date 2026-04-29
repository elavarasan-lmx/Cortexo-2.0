<?php
class C_advertisements extends My_Controller
{
	var $menu_code	= 37;
	var $form_entry = "advertisements_entry";
	public function __construct()
	{
		parent::__construct();
		$this->load->model("advertisements_model");
		$this->load->helper('common');
	}

	function index() {}

	function open_listingform($db_error_msg = "")
	{
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['view'] == 1) {
			$this->load->view('advertisements_listing', $data);
		} else {
			$this->load->view('access_denied');
		}
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$this->load->model($model_name);
		if ($type == 'add_new') {
			$record					=	$this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'edit') {
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'delete') {
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=   $record;
			$_POST['fv']['type']		=   $type;
			$_POST['fv']['code']		=	$code;
			$this->load->view($this->form_entry, $_POST['fv']);
		}
	}
	function DB_Controller($model_name = "", $status = "", $id = "")	//Control DB Process and Validation Process.
	{
		$this->load->model($model_name);
		$this->db->trans_begin();  // Begin Transaction		
		//echo "aaaaa";
		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			if ($result) {
				$this->session->set_flashdata('success', 'Advertisement added successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to add record.');
			}
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			if ($result) {
				$this->session->set_flashdata('success', 'Advertisement updated successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to update record.');
			}
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			if ($result) {
				$this->session->set_flashdata('success', 'Advertisement deleted successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to delete record.');
			}
		} else if ($status == 'inline_edit') {
			$id = $_POST['id'];
			$result = $this->$model_name->inline_update($id);
			if ($result) {
				$this->session->set_flashdata('success', 'Record updated successfully (inline).');
			} else {
				$this->session->set_flashdata('error', 'Failed to update record (inline).');
			}
		} else {
			$this->load->view($this->form_entry, $_POST['fv']);
		}
		//Call insert function from loaded db model to insert record.				
		if ($this->db->trans_status() === TRUE) {
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error'] = "success";											//Sending status to view as success.
			redirect("/C_advertisements/open_listingform/");
		} else {
			//$db_error_msg = $this->db->_error_number();								
			$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if ($db_error_msg == "0") {
				$db_error_msg = $this->db->_error_message();
			}
			//$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());			
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	//Rollback all transactions.
			$data['error']			=	"failure";
			$_POST['fv']['type']	=	$status;				//Sending status to view as failure.				
			if ($status == "delete") {
				$this->open_listingform($db_error_msg);
			} else {
				$_POST['fv']['adv_id'] =	NULL;
				$_POST['fv']['db_error_msg']  = $db_error_msg;
				$this->load->view($this->form_entry, $_POST['fv']);	//Load entry View to display errors.
			}
		}
	}
	function get_sequence_number()
	{
		$this->load->model("advertisements_model");

		$seq_no = $this->input->post('adv_sequence');
		$adv_id = $this->input->post('adv_id');

		$status = $this->advertisements_model->get_sequence_number($seq_no, $adv_id);
		echo json_encode(['status' => $status]);
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */