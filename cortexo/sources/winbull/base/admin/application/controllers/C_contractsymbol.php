<?php
class C_contractsymbol extends My_Controller
{
	var $form_entry = "contractsymbolentry";
	var $menu_code	= 68;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("contractsymbolmodel");
		$this->load->helper('common');
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
		$this->load->view('contractsymbollisting', $data);
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
		}
	}
	/*************  *************/
	/**
	 * Control DB Process and Validation Process.
	 *
	 * This function is used to control the database process and validation process.
	 * It will commit the transactions if all insert without error.
	 *
	 * @param string $model_name Name of the model to be loaded.
	 * @param string $status Status of the operation (add_new, edit, delete, inline_edit).
	 * @param string $id ID of the record to be processed.
	 */
	/*******    *******/
	public function DB_Controller($model_name = "", $status = "", $id = "")
	{
		try {
			$this->load->model($model_name);
			
			// Enhanced input validation - ONLY for add_new and edit operations
			if ($status == 'add_new' || $status == 'edit') {
				$validation_errors = $this->validateContractSymbolInput($_POST['fv']);
				if (!empty($validation_errors)) {
					echo json_encode([
						"status" => "error",
						"message" => implode(', ', $validation_errors),
						"errors" => $validation_errors
					]);
					return;
				}
			}
			
			$is_ajax = $this->input->is_ajax_request();
			$this->db->trans_begin();

			// Only process form data for add_new and edit operations
			if ($status == 'add_new' || $status == 'edit') {
				$contract_symbol = $this->security->xss_clean(trim($_POST['fv']['contract_symbol']));
				$oldcontract_symbol = $this->input->post('old_contract_symbol');

				/* ----------------------------------------------------
				   ENHANCED DUPLICATE CHECK WITH BETTER ERROR MESSAGES
				---------------------------------------------------- */

				if ($status == 'add_new' || ($status == 'edit' && $contract_symbol != $oldcontract_symbol)) {
					$this->db->where('contract_symbol', $this->db->escape_str($contract_symbol));
					if ($status == 'edit') {
						$this->db->where('contract_id !=', (int)$id);
					}

					if ($this->db->get('dt_contractsymbol')->num_rows() > 0) {
						echo json_encode([
							"status" => "error",
							"message" => "Contract symbol '{$contract_symbol}' already exists. Please choose a different symbol.",
							"field" => "contract_symbol"
						]);
						return;
					}
				}
			}

			/* ----------------------------------------------------
			   ENHANCED ACTION HANDLING WITH DETAILED MESSAGES
			---------------------------------------------------- */

			if ($status == 'add_new') {
				$result = $this->$model_name->insert_record($id);
				$message = $result['status']
					? "Contract symbol '{$contract_symbol}' has been added successfully!"
					: ($result['message'] ?? "Failed to add contract symbol. Please try again.");
			} elseif ($status == 'edit') {
				$result = $this->$model_name->update_record($id);
				$message = $result['status']
					? "Contract symbol '{$contract_symbol}' has been updated successfully!"
					: ($result['message'] ?? "Failed to update contract symbol. Please try again.");
			} elseif ($status == 'delete') {
				$symbol_name = $this->$model_name->get_contract_symbol_name($id);
				$result = $this->$model_name->delete_record($id);

				// If model blocked or failed — return immediately without committing
				if (empty($result['status'])) {
					$this->db->trans_rollback();
					if ($is_ajax) {
						echo json_encode([
							"status"  => "error",
							"type"    => $result['type'] ?? "error",
							"message" => $result['message'] ?? "Failed to delete contract symbol. It may be in use."
						]);
						return;
					}
					$this->session->set_flashdata("error", $result['message'] ?? "Delete failed.");
					$this->open_listingform($result['message'] ?? "Delete failed.");
					return;
				}

				$message = "Contract symbol '{$symbol_name}' has been deleted successfully!";
			} else {
				echo json_encode(["status" => "error", "message" => "Invalid operation requested"]);
				return;
			}

			/* ----------------------------------------------------
			   ENHANCED TRANSACTION HANDLING
			---------------------------------------------------- */

			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();
				$this->session->set_flashdata("success", $message);

				if ($is_ajax) {
					echo json_encode(["status" => "success", "message" => $message]);
					return;
				}

				redirect("/C_contractsymbol/open_listingform/");
				return;
			}

			/* ----------------------------------------------------
			   ENHANCED FAILURE HANDLING
			---------------------------------------------------- */

			$this->db->trans_rollback();
			$db_error = $this->db->error();
			$error_msg = $db_error['message'] ?? 'Database operation failed';
			$this->session->set_flashdata("error", $error_msg);

			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => $error_msg]);
				return;
			}

			// Safe access to $_POST['fv'] for non-AJAX responses
			$fv = $_POST['fv'] ?? [];
			$fv['db_error_msg'] = $error_msg;
			$fv['type'] = $status;

			if ($status == "add_new") {
				$fv['contract_id'] = NULL;
			}

			if ($status == "delete") {
				$this->open_listingform($error_msg);
			} else {
				$this->load->view($this->form_entry, $fv);
			}
			
		} catch (Exception $e) {
			$this->db->trans_rollback();
			log_message('error', 'Contract symbol operation failed: ' . $e->getMessage());
			
			$error_message = "An unexpected error occurred. Please try again.";
			$is_ajax = $this->input->is_ajax_request();
			if ($is_ajax) {
				echo json_encode([
					"status" => "error", 
					"message" => $error_message,
					"debug" => ENVIRONMENT === 'development' ? $e->getMessage() : null
				]);
			} else {
				$this->session->set_flashdata("error", $error_message);
				$this->open_listingform($error_message);
			}
		}
	}
	
	// Enhanced validation methods
	private function validateContractSymbolInput($data) {
		$errors = [];
		
		// Contract symbol validation
		if (empty($data['contract_symbol']) || strlen(trim($data['contract_symbol'])) < 3) {
			$errors[] = 'Contract symbol must be at least 3 characters long';
		}
		
		if (strlen($data['contract_symbol']) > 30) {
			$errors[] = 'Contract symbol cannot exceed 30 characters';
		}
		
		// Type validation
		if (!isset($data['com_type']) || !in_array($data['com_type'], [1, 2])) {
			$errors[] = 'Invalid commodity type selected';
		}
		
		// Status validation
		if (!isset($data['status']) || !in_array($data['status'], [0, 1])) {
			$errors[] = 'Invalid status selected';
		}
		
		return $errors;
	}
	
	function check_duplicate() {
		try {
			$contract_symbol = $this->input->post('contract_symbol');
			$id = $this->input->post('id');
			
			if (!$contract_symbol) {
				echo json_encode(['exists' => false]);
				return;
			}
			
			$this->db->where('contract_symbol', $this->db->escape_str($contract_symbol));
			if ($id) {
				$this->db->where('contract_id !=', (int)$id);
			}
			
			$exists = $this->db->get('dt_contractsymbol')->num_rows() > 0;
			
			$message = $exists ? "Contract symbol '{$contract_symbol}' already exists" : '';
			
			echo json_encode([
				'exists' => $exists,
				'message' => $message
			]);
			
		} catch (Exception $e) {
			log_message('error', 'Duplicate check failed: ' . $e->getMessage());
			echo json_encode(['exists' => false, 'error' => 'Check failed']);
		}
	}
}
/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */