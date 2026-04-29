<?php
class C_rpanelcommodity extends My_Controller
{
	var $form_entry = "rpanelcommodity_entry";
	var $menu_code	= 50;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("rpanelcommodity_model");
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
		$this->load->view('rpanelcommodity_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$model_name = 'rpanelcommodity_model'; // P-PERM fix: hardcode model name
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
	public function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$model_name = 'rpanelcommodity_model'; // P-PERM fix: hardcode model name
		$is_ajax = $this->input->is_ajax_request();

		$this->db->trans_begin();

		$rcom_disname    = $_POST['fv']['rcom_disname'];
		$rcom_orderno    = $_POST['fv']['rcom_orderno'];
		$old_rcom_name = $this->input->post('old_rcom_name');
		$old_rcomorder_no = $this->input->post('old_rcomorder_no');

		// ----------------------------------------------------
		// BZ-07: Server-side tax percentage validation (cap at 100%)
		// ----------------------------------------------------
		if ($status == 'add_new' || $status == 'edit') {
			$rcom_sell_tax = isset($_POST['fv']['rcom_sell_tax']) ? (float)$_POST['fv']['rcom_sell_tax'] : 0;
			$rcom_buy_tax  = isset($_POST['fv']['rcom_buy_tax'])  ? (float)$_POST['fv']['rcom_buy_tax']  : 0;
			$rcom_sell_tcs = isset($_POST['fv']['rcom_sell_tcs']) ? (float)$_POST['fv']['rcom_sell_tcs'] : 0;
			$rcom_buy_tcs  = isset($_POST['fv']['rcom_buy_tcs'])  ? (float)$_POST['fv']['rcom_buy_tcs']  : 0;

			if ($rcom_sell_tax < 0 || $rcom_sell_tax > 100) {
				echo json_encode(["status" => "error", "message" => "Sell Tax must be between 0 and 100%"]);
				return;
			}
			if ($rcom_buy_tax < 0 || $rcom_buy_tax > 100) {
				echo json_encode(["status" => "error", "message" => "Buy Tax must be between 0 and 100%"]);
				return;
			}
			if ($rcom_sell_tcs < 0 || $rcom_sell_tcs > 100) {
				echo json_encode(["status" => "error", "message" => "Sell TCS must be between 0 and 100%"]);
				return;
			}
			if ($rcom_buy_tcs < 0 || $rcom_buy_tcs > 100) {
				echo json_encode(["status" => "error", "message" => "Buy TCS must be between 0 and 100%"]);
				return;
			}
		}
		// ----------------------------------------------------
		// DUPLICATE CHECK
		// ----------------------------------------------------

		// Check duplicate Commodity Name
		if ($status == 'add_new' || ($status == 'edit' && $rcom_disname != $old_rcom_name)) {
			$this->db->where('rcom_disname', $rcom_disname);
			if ($status == 'edit') {
				$this->db->where('rcom_id !=', $id);
			}

			if ($this->db->get('dt_rpanelcommodities')->num_rows() > 0) {
				echo json_encode([
					"status" => "error",
					"message" => "Rpanel Commodity Name already exists"
				]);
				return;
			}
		}

		// Check duplicate Order Number
		if ($status == 'add_new' || ($status == 'edit' && $rcom_orderno != $old_rcomorder_no)) {
			$this->db->where('rcom_orderno', $rcom_orderno);
			if ($status == 'edit') {
				$this->db->where('rcom_id !=', $id);
			}

			if ($this->db->get('dt_rpanelcommodities')->num_rows() > 0) {
				echo json_encode([
					"status" => "error",
					"message" => "Sequence Number already exists"
				]);
				return;
			}
		}

		/* -----------------------------------------
       ACTION HANDLING + SINGLE-LINE MESSAGE
    ------------------------------------------ */

		if ($status == 'add_new') {

			$result  = $this->$model_name->insert_record($id);
			$message = ($result['status'] == 1) ? "R-Panel Commodity List saved successfully." : "Failed to add R-Panel Commodity List.";
		} elseif ($status == 'edit') {

			$result  = $this->$model_name->update_record($id);
			$message = ($result['status'] == 1) ? "R-Panel Commodity List updated successfully." : "Failed to update R-Panel Commodity List.";
		} elseif ($status == 'delete') {

			$result  = $this->$model_name->delete_record($id);
			$message = ($result['status'] == 1) ? "R-Panel Commodity List deleted successfully!" : "Failed to delete R-Panel Commodity List!";
		} else {
			// No DB action → return to form
			$this->load->view($this->form_entry, $_POST['fv']);
			return;
		}

		/* -----------------------------------------
       SUCCESS FLOW
    ------------------------------------------ */
		if ($this->db->trans_status() === TRUE) {

			$this->db->trans_commit();
			$this->session->set_flashdata("success", $message);

			if ($is_ajax) {
				echo json_encode([
					"status"  => "success",
					"redirect" => site_url('C_rpanelcommodity/open_listingform')
				]);
				exit;
			}

			redirect("/C_rpanelcommodity/open_listingform/");
			return;
		}

		/* -----------------------------------------
       FAILURE FLOW
    ------------------------------------------ */ else {

			$this->db->trans_rollback();

			$error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			$this->session->set_flashdata("error", $error_msg);

			if ($is_ajax) {
				echo json_encode([
					"status"  => "error",
					"message" => $error_msg
				]);
				exit;
			}

			// Build form data for reload
			$fv = $_POST['fv'];
			$fv['db_error_msg'] = $error_msg;
			$fv['type'] = $status;

			if ($status == "add_new") {
				$fv['rcom_id'] = NULL;
			}

			// delete → reload listing
			if ($status == "delete") {
				$this->open_listingform($error_msg);
			}
			// add/edit → reload form
			else {
				$this->load->view($this->form_entry, $fv);
			}
		}
	}

	function inline_update()
	{
		$model_name = 'commodity_model';
		echo $this->$model_name->inline_update();
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */