<?php
class C_commodity_master extends My_Controller
{
	var $form_entry = "commodity_entry";
	var $menu_code	= 5;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("commodity_model");
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
		$this->load->view('commodity_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$model_name = 'commodity_model'; // P-PERM fix: hardcode model name
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
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			$this->load->view($this->form_entry, $_POST['fv']);
		}
	}
	// function DB_Controller($model_name = "", $status = "", $id = "")	//Control DB Process and Validation Process.
	// {
	// 	$this->load->model($model_name);
	// 	$this->db->trans_begin();  // Begin Transaction		
	// 	//echo "aaaaa";
	// 	if ($status == 'add_new') {
	// 		$result = $this->$model_name->insert_record($id);
	// 		if (isset($result['status']) && $result['status'] == 1) {
	// 			$this->session->set_flashdata('success', 'Record added successfully.');
	// 		} else {
	// 			$this->session->set_flashdata('error', 'Failed to add record.');
	// 		}
	// 	} else if ($status == 'edit') {
	// 		$result = $this->$model_name->update_record($id);
	// 		if (isset($result['status']) && $result['status'] == 1) {
	// 			$this->session->set_flashdata('success', 'Record updated successfully.');
	// 		} else {
	// 			$this->session->set_flashdata('error', 'Failed to update record.');
	// 		}
	// 	} else if ($status == 'delete') {
	// 		$result = $this->$model_name->delete_record($id);
	// 		if (isset($result['status']) && $result['status'] == 1) {
	// 			$this->session->set_flashdata('success', 'Record deleted successfully!');
	// 		} else {
	// 			$this->session->set_flashdata('error', 'Failed to delete the record!');
	// 		}
	// 	} else if ($status == 'inline_edit') {
	// 		$id = $_POST['id'];
	// 		$this->$model_name->inline_update($id);
	// 	} else {

	// 		$this->load->view($this->form_entry, $_POST['fv']);
	// 	}
	// 	//Call insert function from loaded db model to insert record.				
	// 	if ($this->db->trans_status() === TRUE) {
	// 		//This will execute when all transactions insert without error.
	// 		$this->db->trans_commit();											//Commit the transactions.
	// 		$data['error'] = "success";											//Sending status to view as success.
	// 		redirect("/C_commodity_master/open_listingform/");
	// 	} else {
	// 		//$db_error_msg = $this->db->_error_number();								
	// 		/* $db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
	// 		if($db_error_msg == "0") {
	// 			$db_error_msg = $this->db->_error_message();
	// 		} */
	// 		//$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());	
	// 		$db_error_msg = $this->db->error()['message'];
	// 		//This will execute when any transactions will fail.
	// 		$this->db->trans_rollback();	//Rollback all transactions.
	// 		$data['error']			=	"failure";
	// 		$_POST['fv']['type']	=	$status;				//Sending status to view as failure.				
	// 		if ($status == "delete") {
	// 			$this->open_listingform($db_error_msg);
	// 		} else {
	// 			if ($status == "add_new") {
	// 				$_POST['fv']['com_id']		=	NULL;
	// 			}
	// 			$_POST['fv']['db_error_msg'] = $db_error_msg;
	// 			$this->load->view($this->form_entry, $_POST['fv']);	//Load entry View to display errors.
	// 		}
	// 	}
	// }
	function DB_Controller($model_name = "", $status = "", $id = "")
	{
		try {
		$model_name = 'commodity_model'; // P-PERM fix: hardcode model name
			$this->load->model($model_name);

			// Enhanced input validation - ONLY for add_new and edit operations
			if ($status == 'add_new' || $status == 'edit') {
				$validation_errors = $this->validateCommodityInput($_POST['fv'], $status);
				if (!empty($validation_errors)) {
					echo json_encode([
						"status" => "error",
						"message" => implode(', ', $validation_errors),
						"errors" => $validation_errors
					]);
					return;
				}
			}

			$this->db->trans_begin();

			// Only process form data for add_new and edit operations
			if ($status == 'add_new' || $status == 'edit') {
				$comName    = $this->security->xss_clean(trim($_POST['fv']['com_name']));
				$orderNo    = (int)$_POST['fv']['com_order_number'];
				$oldComName = $this->input->post('old_com_name');
				$oldOrderNo = (int)$this->input->post('old_order_no');

				// ----------------------------------------------------
				// ENHANCED DUPLICATE CHECK WITH BETTER ERROR MESSAGES
				// ----------------------------------------------------

				// Check duplicate Commodity Name
				if ($status == 'add_new' || ($status == 'edit' && $comName != $oldComName)) {
					$this->db->where('com_name', $this->db->escape_str($comName));
					if ($status == 'edit') {
						$this->db->where('com_id !=', (int)$id);
					}

					if ($this->db->get('dt_com_master')->num_rows() > 0) {
						echo json_encode([
							"status" => "error",
							"message" => "A commodity with the name '{$comName}' already exists. Please choose a different name.",
							"field" => "com_name"
						]);
						return;
					}
				}

				// Check duplicate Order Number
				if ($status == 'add_new' || ($status == 'edit' && $orderNo != $oldOrderNo)) {
					$this->db->where('com_order_number', $orderNo);
					if ($status == 'edit') {
						$this->db->where('com_id !=', (int)$id);
					}

					if ($this->db->get('dt_com_master')->num_rows() > 0) {
						echo json_encode([
							"status" => "error",
							"message" => "Sequence number {$orderNo} is already in use. Please choose a different number.",
							"field" => "com_order_number"
						]);
						return;
					}
				}
			}

			// ----------------------------------------------------
			// MAIN OPERATIONS WITH ENHANCED ERROR HANDLING
			// ----------------------------------------------------

			if ($status == 'add_new') {
				$result = $this->$model_name->insert_record($id);

				if ($result['status'] == 1) {
					$this->session->set_flashdata("success", "Commodity '{$comName}' added successfully");
					$response = [
						"status" => "success",
						"message" => "Commodity '{$comName}' has been added successfully!",
						"data" => ["id" => $result['id'] ?? null]
					];
				} else {
					$response = [
						"status" => "error",
						"message" => $result['message'] ?? "Failed to add commodity. Please check your input and try again."
					];
				}
			} elseif ($status == 'edit') {
				$result = $this->$model_name->update_record($id);

				if ($result['status'] == 1) {
					$this->session->set_flashdata("success", "Commodity '{$comName}' updated successfully");
					$response = [
						"status" => "success",
						"message" => "Commodity '{$comName}' has been updated successfully!",
						"data" => ["id" => $id]
					];
				} else {
					$response = [
						"status" => "error",
						"message" => $result['message'] ?? "Failed to update commodity. Please check your input and try again."
					];
				}
			} elseif ($status == 'delete') {
				$commodity_name = $this->$model_name->get_commodity_name($id);
				$result = $this->$model_name->delete_record($id);

				if ($result['status'] == 1) {
					$this->session->set_flashdata("success", "Commodity '{$commodity_name}' deleted successfully");
					$response = [
						"status" => "success",
						"message" => "Commodity '{$commodity_name}' has been deleted successfully!"
					];
				} else {
					$response = [
						"status" => "error",
						"message" => $result['message'] ?? "Failed to delete commodity. It may be in use by other records."
					];
				}
			} else {
				echo json_encode([
					"status" => "error",
					"message" => "Invalid operation requested"
				]);
				return;
			}

			// ----------------------------------------------------
			// ENHANCED TRANSACTION HANDLING
			// ----------------------------------------------------

			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();
				$this->logCommodityOperation($status, $_POST['fv'] ?? [], $response);
			} else {
				$this->db->trans_rollback();
				$db_error = $this->db->error();
				$response = [
					"status" => "error",
					"message" => "Database transaction failed. Please try again.",
					"debug" => ENVIRONMENT === 'development' ? $db_error['message'] : null
				];
				log_message('error', 'Commodity DB transaction failed: ' . $db_error['message']);
			}

			header('Content-Type: application/json');
			echo json_encode($response, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
			return;

		} catch (Exception $e) {
			$this->db->trans_rollback();
			log_message('error', 'Commodity operation exception: ' . $e->getMessage());
			
			header('Content-Type: application/json');
			echo json_encode([
				"status" => "error",
				"message" => "An unexpected error occurred. Please try again.",
				"debug" => ENVIRONMENT === 'development' ? $e->getMessage() : null
			]);
			return;
		}
	}

	function getrpanelcommodities()
	{
		$model_name = 'commodity_model';
		echo $this->$model_name->getrpanelcommodities();
	}
	function inline_update()
	{
		$model_name = 'commodity_model';
		echo $this->$model_name->inline_update();
	}
	public function update_weight()
	{
		$com_id = $this->input->post('com_id');
		$com_rest_weight = $this->input->post('com_rest_weight');
		$com_rest = $this->input->post('com_weight');
		// print_r($com_id);exit;
		if ($com_id !== null) {
			$inserted = $this->commodity_model->insertData($com_id, $com_rest_weight, $com_rest);
			echo $inserted ? '1' : '0';
		} else {
			echo '0';
		}
	}
	// Enhanced validation methods
	private function validateCommodityInput($data, $operation = 'add_new') {
		$errors = [];
		
		// Commodity name validation
		if (empty($data['com_name']) || strlen(trim($data['com_name'])) < 4) {
			$errors[] = 'Commodity name must be at least 4 characters long';
		}
		
		if (strlen($data['com_name']) > 50) {
			$errors[] = 'Commodity name cannot exceed 50 characters';
		}
		
		// Weight validation
		if (!isset($data['com_weight']) || !is_numeric($data['com_weight']) || $data['com_weight'] <= 0) {
			$errors[] = 'Weight must be a positive number';
		}
		
		// Order number validation
		if (!isset($data['com_order_number']) || !is_numeric($data['com_order_number']) || $data['com_order_number'] <= 0 || $data['com_order_number'] > 99) {
			$errors[] = 'Sequence number must be between 1 and 99';
		}
		
		// Purity validation
		if (isset($data['com_display_purity']) && $data['com_display_purity'] !== '') {
			if (!is_numeric($data['com_display_purity']) || $data['com_display_purity'] < 0 || $data['com_display_purity'] > 100) {
				$errors[] = 'Display purity must be between 0 and 100';
			}
		}
		
		// Other charges validation
		if (isset($data['com_other_charges']) && !is_numeric($data['com_other_charges'])) {
			$errors[] = 'Other charges must be a valid number';
		}
		
		return $errors;
	}
	
	private function logCommodityOperation($operation, $data, $result) {
		try {
			$status = $result['status'] === 'success' ? 'SUCCESS' : 'FAILED';
			$message = $result['message'] ?? '';
			$record_id = $data['com_id'] ?? 'N/A';
			log_message('info', "Commodity {$operation} [{$status}] - Record ID: {$record_id} - {$message}");
		} catch (Exception $e) {
			log_message('error', 'Failed to log commodity operation: ' . $e->getMessage());
		}
	}
	
	function check_duplicate() {
		try {
			$field = $this->input->post('field');
			$value = $this->input->post('value');
			$id = $this->input->post('id');
			
			if (!$field || !$value) {
				echo json_encode(['exists' => false]);
				return;
			}
			
			$this->db->where($field, $this->db->escape_str($value));
			if ($id) {
				$this->db->where('com_id !=', (int)$id);
			}
			
			$exists = $this->db->get('dt_com_master')->num_rows() > 0;
			
			$message = '';
			if ($exists) {
				if ($field === 'com_name') {
					$message = "Commodity name '{$value}' already exists";
				} elseif ($field === 'com_order_number') {
					$message = "Sequence number '{$value}' is already in use";
				}
			}
			
			echo json_encode([
				'exists' => $exists,
				'message' => $message
			]);
			
		} catch (Exception $e) {
			log_message('error', 'Duplicate check failed: ' . $e->getMessage());
			echo json_encode(['exists' => false, 'error' => 'Check failed']);
		}
	}
	
	function get_comName()
	{
		$status = $this->commodity_model->get_comName($this->input->post('com_name'));
		echo json_encode(['status' => $status]);
	}
	
	function get_orderNo()
	{
		$status = $this->commodity_model->get_orderNo($this->input->post('com_order_number'));
		echo json_encode(['status' => $status]);
	}

	/**
	 * BZ: Pre-check for pending limit orders when commodity active status changes
	 */
	function check_commodity_limits()
	{
		$com_id = (int)$this->input->post('com_id');
		$new_active = $this->input->post('com_active');
		if (!$com_id || $new_active == 1) {
			echo json_encode(['has_limits' => false]);
			return;
		}
		$this->load->model('Commodity_model');
		$result = $this->Commodity_model->has_active_limit_orders($com_id);
		if ($result['count'] > 0) {
			$com_name = $this->Commodity_model->get_commodity_name($com_id);
			echo json_encode([
				'has_limits' => true,
				'limit_count' => $result['count'],
				'message' => "Found {$result['count']} active limit order(s) for: {$com_name}. " . ($result['count'] == 1 ? "This order will be cancelled. Do you want to cancel it and continue?" : "These orders will be cancelled. Do you want to cancel them and continue?")
			]);
		} else {
			echo json_encode(['has_limits' => false]);
		}
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */