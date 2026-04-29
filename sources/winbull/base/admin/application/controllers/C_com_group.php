<?php
class C_com_group extends My_Controller
{
	var $form_entry = "com_group_entry";
	var $menu_code	= 6;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("com_group_model");
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
		$this->load->view('com_group_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$this->load->model($model_name);
		$lite_trade = $this->db->select('lite_trade')->from('dt_generalsettings')->get()->row()->lite_trade ?? 0;
		if ($type == 'add_new') {
			$record					=	$this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$_POST['fv']['lite_trade'] = $lite_trade;
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
			$_POST['fv']['lite_trade'] = $lite_trade;
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
		$this->load->model($model_name);
		$is_ajax = $this->input->is_ajax_request();

		$this->db->trans_begin();

		$result = [];
		$message = "";

		// Pick message by operation
		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			$message = ($result['status'] == 1) ? "Commodity Group saved successfully." : ($result['message'] ?? "Failed to add record.");
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			$message = ($result['status'] == 1) ? "Commodity Group updated successfully." : ($result['message'] ?? "Failed to update record.");
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			$message = ($result['status'] == 1) ? "Commodity Group deleted successfully!" : ($result['message'] ?? "Failed to delete the record!");
		}

		// If transaction is successful
		if ($this->db->trans_status() === TRUE && (!isset($result['status']) || $result['status'] == 1)) {
			$this->db->trans_commit();

			if ($is_ajax) {
				echo json_encode([
					"status"  => "success",
					"message" => $message
				]);
				exit;
			}

			$this->session->set_flashdata("success", $message);
			redirect("/C_com_group/open_listingform");
		} else {
			$this->db->trans_rollback();
			$error_msg = isset($result['message']) ? $result['message'] : $this->general_model->get_errormessage($this->db->_error_number());

			if ($is_ajax) {
				echo json_encode([
					"status"  => "error",
					"message" => $error_msg
				]);
				exit;
			}

			$this->session->set_flashdata("error", $error_msg);
			redirect("/C_com_group/open_listingform");
		}
	}

	/**
	 * BZ: Pre-check for pending limit orders when com group sell/buy toggles change
	 */
	function check_com_limits()
	{
		$com_group_id = (int)$this->input->post('com_group_id');
		$com_group_com = $this->input->post('fv');
		if (!$com_group_id || !isset($com_group_com['com_group_com'])) {
			echo json_encode(['has_limits' => false]);
			return;
		}

		$this->load->model('Commodity_model');
		$limit_count = 0;
		$affected = [];

		// Get old record
		$old = $this->com_group_model->get_entry_record($com_group_id);
		$old_com = isset($old['com_group_com']) ? $old['com_group_com'] : [];

		foreach ($com_group_com['com_group_com'] as $com_id => $com_data) {
			$new_sell = isset($com_data['com_sel_active']) ? 1 : 0;
			$new_buy  = isset($com_data['com_buy_active']) ? 1 : 0;

			// Find old values
			$old_sell = 0; $old_buy = 0; $com_name = '';
			foreach ($old_com as $oc) {
				if ($oc['com_id'] == $com_id) {
					$old_sell = isset($oc['com_sel_active']) ? $oc['com_sel_active'] : 0;
					$old_buy  = isset($oc['com_buy_active']) ? $oc['com_buy_active'] : 0;
					$com_name = isset($oc['com_name']) ? $oc['com_name'] : 'COM#'.$com_id;
					break;
				}
			}

			if ($old_sell == 1 && $new_sell == 0) {
				$r = $this->Commodity_model->has_active_limit_orders($com_id, 0);
				if ($r['count'] > 0) { $limit_count += $r['count']; $affected[] = $com_name; }
			}
			if ($old_buy == 1 && $new_buy == 0) {
				$r = $this->Commodity_model->has_active_limit_orders($com_id, 1);
				if ($r['count'] > 0) { $limit_count += $r['count']; $affected[] = $com_name; }
			}
		}

		if ($limit_count > 0) {
			echo json_encode([
				'has_limits' => true,
				'limit_count' => $limit_count,
				'message' => "Found {$limit_count} active limit order(s) for: " . implode(', ', array_unique($affected)) . ". " . ($limit_count == 1 ? "This order will be cancelled. Do you want to cancel it and continue?" : "These orders will be cancelled. Do you want to cancel them and continue?")
			]);
		} else {
			echo json_encode(['has_limits' => false]);
		}
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */