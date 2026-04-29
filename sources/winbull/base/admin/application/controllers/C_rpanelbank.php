<?php
class C_rpanelbank extends My_Controller
{
	var $form_entry = "rpanelbank_entry";
	var $menu_code	= 51;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("rpanelbank_model");
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
		$this->load->view('rpanelbank_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$model_name = 'rpanelbank_model'; // P-PERM fix: hardcode model name (BZ-04/05)
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
	// function DB_Controller($model_name = "", $status = "", $id = "")
	// {
	// 	$this->load->model($model_name);
	// 	$this->db->trans_begin();  // Begin Transaction

	// 	$toast = ['type' => '', 'message' => ''];  // Toaster message container

	// 	if ($status == 'add_new') {

	// 		$result = $this->$model_name->insert_record($id);

	// 		if (isset($result['status']) && $result['status'] == 1) {
	// 			$toast = ['type' => 'success', 'message' => 'Record added successfully.'];
	// 		} else {
	// 			$toast = ['type' => 'error', 'message' => 'Failed to add record.'];
	// 		}
	// 	} elseif ($status == 'edit') {

	// 		$result = $this->$model_name->update_record($id);

	// 		if (isset($result['status']) && $result['status'] == 1) {
	// 			$toast = ['type' => 'success', 'message' => 'Record updated successfully.'];
	// 		} else {
	// 			$toast = ['type' => 'error', 'message' => 'Failed to update record.'];
	// 		}
	// 	} elseif ($status == 'delete') {

	// 		$result = $this->$model_name->delete_record($id);

	// 		if (isset($result['status']) && $result['status'] == 1) {
	// 			$toast = ['type' => 'success', 'message' => 'Record deleted successfully.'];
	// 		} else {
	// 			$toast = ['type' => 'error', 'message' => 'Failed to delete record.'];
	// 		}
	// 	} elseif ($status == 'inline_edit') {

	// 		$id = $_POST['id'];
	// 		$this->$model_name->inline_update($id);
	// 		return; // inline edit doesn’t need redirect or view load

	// 	} else {
	// 		// Default fallback - Load entry form
	// 		$this->load->view($this->form_entry, $_POST['fv']);
	// 		return;
	// 	}

	// 	// Transaction handling
	// 	if ($this->db->trans_status() === TRUE) {
	// 		$this->db->trans_commit();
	// 		$data['error'] = "success";
	// 		$data['toast'] = $toast; // pass toast info to view
	// 		// $this->load->view('rpanelbank_listing', $data); 
	// 		redirect("/C_rpanelbank/open_listingform/");
	// 	} else {
	// 		$db_error_msg = $this->db->error()['message'];
	// 		$this->db->trans_rollback();
	// 		$data['error'] = "failure";
	// 		$data['toast'] = ['type' => 'error', 'message' => $db_error_msg];
	// 		$_POST['fv']['db_error_msg'] = $db_error_msg;

	// 		if ($status == "delete") {
	// 			$this->open_listingform($db_error_msg);
	// 		} else {
	// 			if ($status == "add_new") {
	// 				$_POST['fv']['com_id'] = NULL;
	// 			}
	// 			$this->load->view($this->form_entry, $_POST['fv']);
	// 		}
	// 	}
	// }

	public function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$model_name = 'rpanelbank_model'; // P-PERM fix: hardcode model name (BZ-04/05)
		$this->load->model($model_name);
		$is_ajax = $this->input->is_ajax_request();

		$this->db->trans_begin();

		/* ----------------------------------------------------
       DUPLICATE CHECK (only for add/edit, not delete)
    ---------------------------------------------------- */
		if ($status == 'add_new' || $status == 'edit') {

			$bcontract_symbol = $_POST['fv']['bcontract_symbol'];
			$b_orderno        = $_POST['fv']['b_orderno'];

			$old_name  = $this->input->post('old_rbankcom_name');
			$old_order = $this->input->post('old_rbankorder_no');

			// Commodity name duplicate check
			if ($status == 'add_new' || $bcontract_symbol != $old_name) {

				$this->db->where('bcontract_symbol', $bcontract_symbol);
				if ($status == 'edit') {
					$this->db->where('bcontract_id !=', $id);
				}

				if ($this->db->get('dt_bankcontractmaster')->num_rows() > 0) {
					echo json_encode(["status" => "error", "message" => "R-Panel Bank Commodity Name already exists"]);
					return;
				}
			}

			// Order number duplicate check
			if ($status == 'add_new' || $b_orderno != $old_order) {

				$this->db->where('b_orderno', $b_orderno);
				if ($status == 'edit') {
					$this->db->where('bcontract_id !=', $id);
				}

				if ($this->db->get('dt_bankcontractmaster')->num_rows() > 0) {
					echo json_encode(["status" => "error", "message" => "Sequence Number already exists"]);
					return;
				}
			}
		}

		/* ----------------------------------------------------
       ACTION HANDLING 
    ---------------------------------------------------- */

		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			$message = "R-Panel Bank saved successfully.";
		} elseif ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			$message = "R-Panel Bank updated successfully.";
		} elseif ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			$message = "R-Panel Bank Inactivated successfully!";
		} elseif ($status == 'activate') {
			$result = $this->$model_name->activate_record($id);
			$message = "R-Panel Bank Activated successfully!";
		} else {
			$this->load->view($this->form_entry, $_POST['fv']);
			return;
		}

		/* ✅ Check model result FIRST — before trans_status */
		if (empty($result['status'])) {
			$this->db->trans_rollback();
			$error_msg = $result['message'] ?? "Operation failed. Please try again.";
			$this->session->set_flashdata("error", $error_msg);
			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => $error_msg]);
				exit;
			}
			$fv = $_POST['fv'];
			$fv['db_error_msg'] = $error_msg;
			$fv['type'] = $status;
			$this->load->view($this->form_entry, $fv);
			return;
		}

		/* SUCCESS */
		if ($this->db->trans_status() === TRUE) {

			$this->db->trans_commit();
			$this->session->set_flashdata("success", $message);

			if ($is_ajax) {
				echo json_encode(["status" => "success", "message" => $message]);
				exit;
			}

			redirect("/C_rpanelbank/open_listingform/");
			return;
		}

		/* FAILURE — DB transaction error */
		$this->db->trans_rollback();

		$error_msg = $this->general_model->get_errormessage($this->db->_error_number());
		$this->session->set_flashdata("error", $error_msg);

		if ($is_ajax) {
			echo json_encode(["status" => "error", "message" => $error_msg]);
			exit;
		}

		$fv = $_POST['fv'];
		$fv['db_error_msg'] = $error_msg;
		$fv['type'] = $status;

		if ($status == "add_new") {
			$fv['bcontract_id'] = NULL;
		}

		if ($status == "delete") {
			$this->open_listingform($error_msg);
		} else {
			$this->load->view($this->form_entry, $fv);
		}
	}


	public function Chk_Name_Exist()
	{
		$name = $this->input->post('bcontract_symbol');
		$id   = $this->input->post('bcontract_id');
		$type = $this->input->post('type');
		$status = $this->rpanelbank_model->check_name_exists($name, $type, $id);
		if ($status) {
			$response = [
				'status'  => true,
				'type'    => 'error',
				'message' => 'R-Panel Bank Commodity Name already exists!'
			];
		} else {
			$response = [
				'status'  => false,
				'type'    => 'success',
				'message' => 'Commodity name is available.'
			];
		}
		echo json_encode($response);
	}


	public function Chk_Seq_Exist()
	{
		$seq = $this->input->post('b_orderno');
		$id   = $this->input->post('bcontract_id');
		$type = $this->input->post('type');
		$status = $this->rpanelbank_model->check_seq_exists($seq, $type, $id);
		if ($status) {
			$response = [
				'status'  => true,
				'type'    => 'error',
				'message' => 'Sequence Number already exists!'
			];
		} else {
			$response = [
				'status'  => false,
				'type'    => 'success',
				'message' => 'Sequence number is available.'
			];
		}
		echo json_encode($response);
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */