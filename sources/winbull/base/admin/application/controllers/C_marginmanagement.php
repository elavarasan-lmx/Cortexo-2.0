<?php
class C_marginmanagement extends My_Controller
{
	var $form_entry = "marginmanagement_entry";
	var $menu_code	= 56; // 'Customer Margin' in dt_menu (id_menu=56)
	public function __construct()
	{
		parent::__construct();
		$this->load->model("marginmanagement_model");
	}
	function index() {}
	function open_listingform($cus_type = '', $db_error_msg = "")
	{
		$data["db_error_msg"] = $db_error_msg;
		$data["cus_type"] = $cus_type;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['view'] == 1) {
			$this->load->view('marginmanagement_listing', $data);
		} else {
			$this->load->view('access_denied');
		}
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$model_name = 'marginmanagement_model'; // P-PERM fix: hardcode model name
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
		}
	}
	// Entry Form
	function open_activateentryform($model_name = "", $id = "", $db_error_msg = "")
	{
		$model_name = 'marginmanagement_model'; // P-PERM fix: hardcode model name
		$this->load->model($model_name);

		$record					=	$this->$model_name->get_activateentry_record($id);
		$_POST['fv']				=   $record;
		$_POST['fv']["db_error_msg"] = $db_error_msg;
		$this->load->view("marginmanagement_entry", $_POST['fv']);
	}
	function DB_Controller($model_name = "", $status = "", $id = "")	//Control DB Process and Validation Process.
	{
		// Rights check for write operations
		$userrights = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$userrights = $val;
			}
		}
		if (($status == 'add_new' && $userrights['add'] != 1) ||
			($status == 'edit' && $userrights['edit'] != 1) ||
			($status == 'delete' && $userrights['delete'] != 1)) {
			$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
			if ($isAjax) {
				echo json_encode(['status' => 'error', 'message' => 'Access denied. You do not have permission for this operation.']);
				return;
			}
			$this->session->set_flashdata('error', 'Access denied. You do not have permission for this operation.');
			redirect("/C_marginmanagement/open_listingform/");
			return;
		}

		$model_name = 'marginmanagement_model'; // P-PERM fix: hardcode model name
		$this->load->model($model_name);
		$this->db->trans_begin();  // Begin Transaction
		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Margin record added successfully.');
			} else {
				$this->session->set_flashdata('error', $result['message'] ?? 'Failed to add margin record.');
			}
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Margin record updated successfully.');
			} else {
				$this->session->set_flashdata('error', $result['message'] ?? 'Failed to update margin record.');
			}
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
			if ($isAjax) {
				$this->db->trans_commit();
				if (isset($result['status']) && $result['status'] == 1) {
					echo json_encode(['status' => 'success', 'message' => 'Margin record deleted successfully.']);
				} else {
					echo json_encode(['status' => 'error', 'message' => $result['message'] ?? 'Failed to delete the record.']);
				}
				return;
			}
			// Non-AJAX fallback
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Margin record deleted successfully.');
			} else {
				$this->session->set_flashdata('error', $result['message'] ?? 'Failed to delete the record.');
			}
		} else if ($status == 'activate') {
			$this->$model_name->update_activaterecord($id);
		} else if ($status == 'update_status') {
			$this->$model_name->update_activaterecord();
		} else {
			$this->load->view($this->form_entry, $_POST['fv']);
		}
		if ($this->db->trans_status() === TRUE) {
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error'] = "success";											//Sending status to view as success.
			redirect("/C_marginmanagement/open_listingform/");
		} else {
			//$db_error_msg = $this->db->_error_number();								
			$db_error = $this->db->error();
			$db_error_msg = $this->general_model->get_errormessage($db_error['code']);
			if (empty($db_error_msg) && !empty($db_error['message'])) {
				$db_error_msg = $db_error['message'];
			}
			//$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());			
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	//Rollback all transactions.
			$data['error']			=	"failure";
			$_POST['fv']['type']	=	$status;				//Sending status to view as failure.				
			if ($status == "delete") {
				$this->open_listingform($db_error_msg);
			} else {
				if ($status == "add_new") {
					$_POST['fv']['com_id']		=	NULL;
				}
				$_POST['fv']['db_error_msg'] = $db_error_msg;
				$this->load->view($this->form_entry, $_POST['fv']);	//Load entry View to display errors.
			}
		}
		//Call insert function from loaded db model to insert record.				
	}
	function get_availablebalance($cus_id = "")
	{
		$data = $this->marginmanagement_model->get_availablebalance($cus_id);
		echo json_encode($data);
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */