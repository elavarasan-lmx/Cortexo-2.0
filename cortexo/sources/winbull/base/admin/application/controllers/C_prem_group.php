<?php
class C_prem_group extends My_Controller
{
	var $form_entry = "prem_group_entry";
	var $menu_code	= 74;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("prem_group_model");
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
		$this->load->view('prem_group_listing', $data);
	}
	function send_premium_notification($model_name = "", $id = "")
	{
		$model_name = 'prem_group_model'; // P-PERM fix: hardcode model name
		$response = $this->$model_name->send_premium_notification($id);
		if ($response['show'] == 1) {
			$this->session->set_flashdata('message_notification', "Notification send successfully");
		}
		$this->open_listingform();
	}

	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$model_name = 'prem_group_model'; // P-PERM fix: hardcode model name
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
	function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$model_name = 'prem_group_model'; // P-PERM fix: hardcode model name
		$this->db->trans_begin();

		// Record labels for messages
		$label = 'Premium Group';

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

	/**
	 * BZ: Pre-check for pending limit orders when prem group sell/buy toggles change
	 */
	function check_prem_limits()
	{
		$prem_group_id = (int)$this->input->post('prem_group_id');
		$prem_group_com = $this->input->post('fv');
		if (!$prem_group_id || !isset($prem_group_com['prem_group_com'])) {
			echo json_encode(['has_limits' => false]);
			return;
		}

		$this->load->model('Commodity_model');
		$limit_count = 0;
		$affected = [];

		// Get old record
		$old = $this->prem_group_model->get_entry_record($prem_group_id);
		$old_com = isset($old['prem_group_com']) ? $old['prem_group_com'] : [];

		// ─── BZ: Group-level active check ───
		$new_group_active = isset($prem_group_com['prem_group_active']) ? (int)$prem_group_com['prem_group_active'] : 1;
		$old_group_active = isset($old['prem_group_active']) ? (int)$old['prem_group_active'] : 1;

		if ($old_group_active == 1 && $new_group_active == 0) {
			// Group is being deactivated — check ALL commodities in this group
			foreach ($old_com as $oc) {
				$com_id = isset($oc['prem_id']) ? $oc['prem_id'] : (isset($oc['com_id']) ? $oc['com_id'] : 0);
				$com_name = isset($oc['prem_name']) ? $oc['prem_name'] : (isset($oc['com_name']) ? $oc['com_name'] : 'COM#'.$com_id);
				if (!$com_id) continue;

				$r = $this->Commodity_model->has_active_limit_orders($com_id);
				if ($r['count'] > 0) {
					$limit_count += $r['count'];
					$affected[] = $com_name;
				}
			}
		} else {
			// ─── Individual commodity sell/buy toggle check ───
			foreach ($prem_group_com['prem_group_com'] as $com_id => $com_data) {
				$new_sell = isset($com_data['prem_comsell_active']) ? 1 : 0;
				$new_buy  = isset($com_data['prem_combuy_active']) ? 1 : 0;

				// Find old values
				$old_sell = 0; $old_buy = 0; $com_name = '';
				foreach ($old_com as $oc) {
					$oc_id = isset($oc['prem_id']) ? $oc['prem_id'] : (isset($oc['com_id']) ? $oc['com_id'] : 0);
					if ($oc_id == $com_id) {
						$old_sell = isset($oc['prem_comsell_active']) ? $oc['prem_comsell_active'] : 0;
						$old_buy  = isset($oc['prem_combuy_active']) ? $oc['prem_combuy_active'] : 0;
						$com_name = isset($oc['prem_name']) ? $oc['prem_name'] : (isset($oc['com_name']) ? $oc['com_name'] : 'COM#'.$com_id);
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