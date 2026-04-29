<?php
class C_contract_master extends My_Controller
{
	var $form_entry = "contractmasterentry";
	var $menu_code	= 54;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("contractmodel");
		$this->load->helper('common');
	}
	function index() {}
	
	private function get_user_rights()
	{
		$rights = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				return array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		return $rights;
	}
	
	function openlist_form($cus_type = '', $db_error_msg = "")
	{
		$data["db_error_msg"] = $db_error_msg;
		$data["cus_type"] = $cus_type;
		$data["userrights"] = $this->get_user_rights();
		$this->load->view('contractmasterlisting', $data);
	}

	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$model_name = 'contractmodel'; // P-PERM fix: hardcode model name
		$this->load->model($model_name);
		$_POST['fv']['userrights'] = $this->get_user_rights();
		
		if ($type == 'add_new') {
			$this->$model_name->empty_record();
			$_POST['fv']['type'] = $type;
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'edit') {
			$id = $this->db->escape_str($id);
			$record = $this->$model_name->get_entry_record($id);
			$_POST['fv'] = $record;
			$_POST['fv']['type'] = $type;
			$_POST['fv']['code'] = $id;
			$_POST['fv']['userrights'] = $this->get_user_rights();
			$this->load->view($this->form_entry, $_POST['fv']);
		}
	}
	function get_rpanel_data()
	{
		$this->load->model('contractmodel');
		$data = $this->contractmodel->display_rpanel_data();
		echo json_encode($data);
	}
	function enable_rpanelrateon($status)
	{
		$this->load->model('contractmodel');
		$return = $this->contractmodel->enable_rateon($status);
		redirect("C_contract_master/openlist_form");
	}
	function enable_rpanelrateoff($status)
	{
		$return = $this->contractmodel->enable_rateoff($status);
		redirect("C_contract_master/openlist_form");
	}
	function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$model_name = 'contractmodel'; // P-PERM fix: hardcode model name
		$this->load->model($model_name);
		$id    = (int)$id;
		$is_ajax = $this->input->is_ajax_request();

		$this->db->trans_begin();

		try {
			if ($status == 'add_new') {
				$result = $this->$model_name->insert_record($id);
				if (isset($result['status']) && $result['status'] == 1) {
					$this->session->set_flashdata('success', 'Contract master added successfully.');
				} else {
					$this->session->set_flashdata('error', isset($result['message']) ? $result['message'] : 'Failed to add record.');
				}

			} else if ($status == 'edit') {
				$result = $this->$model_name->update_record($id);
				if (isset($result['status']) && $result['status'] == 1) {
					$this->session->set_flashdata('success', 'Contract master updated successfully.');
				} else {
					$this->session->set_flashdata('error', isset($result['message']) ? $result['message'] : 'Failed to update record.');
				}

			} else if ($status == 'delete') {
				$result = $this->$model_name->delete_record($id);

				// ⚠️ Check model result FIRST — before trans_status
				if (empty($result['status'])) {
					$this->db->trans_rollback();
					if ($is_ajax) {
						echo json_encode([
							"status"  => "error",
							"type"    => $result['type'] ?? "error",
							"message" => $result['message'] ?? "Failed to delete the record."
						]);
						return;
					}
					$this->session->set_flashdata('error', $result['message'] ?? 'Failed to delete the record!');
					redirect("/C_contract_master/openlist_form");
					return;
				}

			} else if ($status == 'inline_edit') {
				$id = $this->db->escape_str($this->input->post('id'));
				$this->$model_name->inline_update($id);
			}

			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();

				if ($is_ajax && $status == 'delete') {
					echo json_encode(["status" => "success", "message" => "Contract master deleted successfully!"]);
					return;
				}

				redirect("/C_contract_master/openlist_form");
			} else {
				$this->db->trans_rollback();
				$this->session->set_flashdata('error', 'Database transaction failed.');
				redirect("/C_contract_master/openlist_form");
			}
		} catch (Exception $e) {
			$this->db->trans_rollback();
			$error_msg = 'An error occurred: ' . $e->getMessage();
			if ($is_ajax) {
				echo json_encode(["status" => "error", "type" => "error", "message" => $error_msg]);
				return;
			}
			$this->session->set_flashdata('error', $error_msg);
			redirect("/C_contract_master/openlist_form");
		}
	}
	public function clear_flash()
	{
		$this->load->library('session');
		$this->session->unset_userdata('success');
		$this->session->unset_userdata('errorMsg');
	}
}
/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */