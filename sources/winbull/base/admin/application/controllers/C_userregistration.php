<?php
class C_userregistration extends My_Controller
{
	var $form_entry = "userregistration_entry";
	var $menu_code	= 3;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("Userregistration_model");
		$this->load->model("general_model");
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
		$this->load->view('userregistration_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$this->load->model('userregistration_model');
		if ($type == 'add_new') {
			$record					=	$this->$model_name->empty_record();
			$serv 					=	$this->$model_name->get_serv_status(1);
			$_POST['fv']['type']	=	$type;
			$_POST['fv']['serv']	=   $serv;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'edit') {
			$record					=	$this->$model_name->get_entry_record($id);
			$serv 						=	$this->$model_name->get_serv_status(3);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
			$_POST['fv']['serv']			=   $serv;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			// print_r($_POST);exit;
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
	// Entry Form
	function open_activateentryform($model_name = "", $id = "", $db_error_msg = "")
	{
		$record					=	$this->$model_name->get_activateentry_record($id);
		$comm_status				=	$this->$model_name->load_commodity($id);
		$serv 					=	$this->$model_name->get_serv_status(2);
		$_POST['fv']				=   $record;
		$_POST['fv']['comm_status']	=   $comm_status;
		$_POST['fv']["db_error_msg"]  =   $db_error_msg;
		$_POST['fv']['serv']			=   $serv;
		$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		$this->load->view("userregistrationactivate_entry", $_POST['fv']);
	}


	function delete_multiple_customer($model_name = "", $status = "")
	{
		$customers = $this->input->post('users');
		if ($customers) {
			foreach ($customers as $customer) {
				$result = $this->$model_name->delete_record($customer);
				// Log each deletion
				if (isset($result['status']) && $result['status'] == 1) {
					log_admin_delete('Userregistration_model', $model_name, array('cus_id' => $customer), 'Bulk deleted trader');
				}
			}
		}
		redirect("/C_userregistration/open_listingform");
	}
	function activateMultipleCustomers()
	{
		$customers = json_decode($this->input->post('activateusers'));
		$this->load->model("userregistration_model");
		$activateusers = $this->userregistration_model->activate_MultipleCustomers($customers);
		if (sizeof($activateusers) > 0) {
			foreach ($activateusers as $key => $val) {
				$service = $val["service_id"];
				$emaildata = $this->userregistration_model->get_EmailContent($service, $val['cusid']);
				if (isset($emaildata['email_id']) && strlen($emaildata['email_id']) > 0) {
					$email_resp = email_notification_helper($emaildata['email_id'], $emaildata["email_subject"], $emaildata["email_content"]);
				}
				// Send SMS
				$smsdata["sms_url"] = $this->userregistration_model->get_SMSURL($service, $val['cusid']);
				if ($smsdata["sms_url"] != "") {
					$curl_resp = curl_helper($smsdata["sms_url"], $smsdata["sms_url"]);
				}
				// Log each activation
				log_admin_edit('Userregistration_model', 'Userregistration_model', array('cus_id' => $val['cusid']), array('cus_active' => 1), 'Bulk activated trader');
			}
			echo json_encode(array("success" => TRUE, "message" => "Requested customer(s) successfully activated"));
		} else {
			echo json_encode(array("success" => TRUE, "message" => "Requested customer(s) already activated"));
		}
	}
	function disableMultipleCustomers()
	{
		$customers = json_decode($this->input->post('disableusers'));
		$this->load->model("userregistration_model");

		// BZ-25: Check for pending deliveries before deactivation
		$blocked_traders = array();
		if (!empty($customers)) {
			foreach ($customers as $cus_id) {
				$pending = $this->db->query(
					"SELECT COUNT(*) as cnt FROM dt_booking
					 LEFT JOIN (SELECT cusdel_bookno, IFNULL(SUM(cusdel_deliveryqty),0) as deliveredqty
					            FROM dt_customerdelivery GROUP BY cusdel_bookno) del ON del.cusdel_bookno = book_no
					 WHERE book_cusid = ? AND book_status = 1
					   AND IFNULL(delete_status,0) = 0
					   AND (book_qty - IFNULL(del.deliveredqty,0)) > 0",
					array((int)$cus_id)
				)->row();
				if ($pending && $pending->cnt > 0) {
					$trader = $this->db->query("SELECT cus_name FROM dt_customer WHERE cus_id = ?", array((int)$cus_id))->row();
					$blocked_traders[] = $trader ? $trader->cus_name : 'ID:' . $cus_id;
				}
			}
		}
		if (!empty($blocked_traders)) {
			echo json_encode(array(
				"success" => FALSE,
				"message" => "Cannot deactivate trader(s) with pending deliveries: " . implode(', ', $blocked_traders)
			));
			return;
		}

		$disableusers = $this->userregistration_model->disable_MultipleCustomers($customers);
		if (sizeof($disableusers) > 0) {
			foreach ($disableusers as $val) {
				// Log each disabling
				log_admin_edit('Userregistration_model', 'Userregistration_model', array('cus_id' => $val), array('cus_active' => 0), 'Bulk disabled trader');
			}
			echo json_encode(array("success" => TRUE, "message" => "Requested customer(s) successfully disabled"));
		} else {
			echo json_encode(array("success" => TRUE, "message" => "Requested customer(s) already disabled"));
		}
	}
	function DB_Controller($model_name = "", $status = "", $id = "", $cus_type = "")	//Control DB Process and Validation Process.
	{
		$this->load->model('userregistration_model');
		$is_ajax = $this->input->is_ajax_request();
		$this->db->trans_begin();  // Begin Transaction

		$response = array('status' => 0, 'message' => 'Invalid request');

		if ($status == 'add_new') {
			// Server-side validation
			$this->load->library('form_validation');
			$this->form_validation->set_rules('fv[cus_name]', 'Name', 'required|min_length[3]|max_length[150]');
			$this->form_validation->set_rules('fv[cus_mobile]', 'Mobile', 'required|numeric|exact_length[10]');
			$this->form_validation->set_rules('fv[cus_email]', 'Email', 'required|valid_email');
			$this->form_validation->set_rules('fv[cus_login_name]', 'Login Name', 'required|min_length[4]|max_length[50]');
			if (!$this->form_validation->run()) {
				$errors = implode(' ', array_filter(array_map('strip_tags', explode('\n', validation_errors()))));
				if ($is_ajax) {
					echo json_encode(array('status' => 'error', 'message' => $errors ?: 'Validation failed.'));
					exit;
				}
				$this->session->set_flashdata('error', $errors);
				redirect("/C_userregistration/open_listingform");
				return;
			}

			// Server-side duplicate checks (guard against DB 1062 errors)
			$fv = $this->input->post('fv');
			$dup_checks = array(
				'cus_mobile'     => array('value' => isset($fv['cus_mobile']) ? trim($fv['cus_mobile']) : '', 'label' => 'Mobile Number'),
				'cus_email'      => array('value' => isset($fv['cus_email']) ? trim($fv['cus_email']) : '',   'label' => 'Email'),
				'cus_login_name' => array('value' => isset($fv['cus_login_name']) ? trim($fv['cus_login_name']) : '', 'label' => 'Login Name'),
				'cus_whatsapp'   => array('value' => isset($fv['cus_whatsapp']) ? trim($fv['cus_whatsapp']) : '',   'label' => 'WhatsApp Number'),
				'cus_panno'      => array('value' => isset($fv['cus_panno']) ? trim($fv['cus_panno']) : '',       'label' => 'PAN Number'),
				'cus_gstno'      => array('value' => isset($fv['cus_gstno']) ? trim($fv['cus_gstno']) : '',       'label' => 'GST Number'),
			);
			foreach ($dup_checks as $field => $info) {
				if (!empty($info['value'])) {
					$existing = $this->db->where($field, $info['value'])->count_all_results('dt_customer');
					if ($existing > 0) {
						$dup_msg = $info['label'] . ' "' . $info['value'] . '" already exists. Please use a different ' . $info['label'] . '.';
						if ($is_ajax) {
							echo json_encode(array('status' => 'error', 'message' => $dup_msg));
							exit;
						}
						$this->session->set_flashdata('error', $dup_msg);
						redirect("/C_userregistration/open_listingform");
						return;
					}
				}
			}

			$result = $this->$model_name->insert_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$response = array('status' => 1, 'message' => 'Trader registered successfully.', 'service_id' => 1);
			} else {
				$response = array('status' => 0, 'message' => isset($result['message']) ? $result['message'] : 'Failed to add trader.');
			}
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$response = array('status' => 1, 'message' => 'Trader details updated successfully.', 'service_id' => 3);
			} else {
				$response = array('status' => 0, 'message' => isset($result['message']) ? $result['message'] : 'Failed to update trader.');
			}
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$response = array('status' => 1, 'message' => 'Trader deleted successfully.');
			} else {
				$response = array('status' => 0, 'message' => isset($result['message']) ? $result['message'] : 'Failed to delete trader.');
			}
		} else if ($status == 'activate') {
			// BZ-25: Block deactivation if trader has pending deliveries
			if (isset($_POST['fv']['cus_active']) && $_POST['fv']['cus_active'] == 0) {
				$pending_check = $this->db->query(
					"SELECT COUNT(*) as cnt FROM dt_booking
					 LEFT JOIN (SELECT cusdel_bookno, IFNULL(SUM(cusdel_deliveryqty),0) as deliveredqty
					            FROM dt_customerdelivery GROUP BY cusdel_bookno) del ON del.cusdel_bookno = book_no
					 WHERE book_cusid = ? AND book_status = 1
					   AND IFNULL(delete_status,0) = 0
					   AND (book_qty - IFNULL(del.deliveredqty,0)) > 0",
					array((int)$id)
				)->row();
				if ($pending_check && $pending_check->cnt > 0) {
					$response = array('status' => 0, 'message' => 'Cannot deactivate: this trader has pending deliveries.');
					$this->db->trans_rollback();
					if ($is_ajax) {
						// AJAX: return JSON only — do NOT set flashdata (avoids double toast on listing page)
						echo json_encode(array("status" => "error", "message" => $response['message']));
						exit;
					}
					// Non-AJAX: set flash and redirect
					$this->session->set_flashdata('error', $response['message']);
					redirect("/C_userregistration/open_listingform");
					return;
				}
			}
			$result = $this->$model_name->update_activaterecord($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$msg = (isset($_POST['fv']['cus_active']) && $_POST['fv']['cus_active'] == 1) ? 'Account activated.' : 'Account deactivated.';
				$response = array('status' => 1, 'message' => $msg, 'service_id' => 2);
			} else {
				$response = array('status' => 0, 'message' => 'Failed to update activation details.');
			}
		}

		if ($this->db->trans_status() === TRUE && $response['status'] == 1) {
			$this->db->trans_commit();
			$this->session->set_flashdata('success', $response['message']);

			if ($is_ajax) {
				// BZ-100: Send JSON response FIRST, then trigger notifications
				// This prevents notification helpers from corrupting the AJAX response
				echo json_encode(array("status" => "success", "message" => $response['message'], "redirect" => site_url('C_userregistration/open_listingform')));

				// Trigger Notifications AFTER response (suppress any stray output)
				if (isset($response['service_id'])) {
					ob_start();
					$this->send_notifications($model_name, $response['service_id'], $id);
					ob_end_clean();
				}
				exit;
			}

			// Non-AJAX: trigger notifications before redirect
			if (isset($response['service_id'])) {
				$this->send_notifications($model_name, $response['service_id'], $id);
			}
			redirect("/C_userregistration/open_listingform");
		} else {
			$this->db->trans_rollback();
			$error_msg = isset($response['message']) ? $response['message'] : 'Error occurred. Please try again.';
			$this->session->set_flashdata('error', $error_msg);

			if ($is_ajax) {
				echo json_encode(array("status" => "error", "message" => $error_msg));
				exit;
			}

			if ($status == 'add_new' || $status == 'edit') {
				$this->load->view($this->form_entry, $_POST['fv']);
			} else {
				redirect("/C_userregistration/open_listingform");
			}
		}
	}

	private function send_notifications($model_name, $service_id, $cus_id) {
		// Send E-Mail
		$emaildata = $this->$model_name->get_EmailContent($service_id, $cus_id);
		if (isset($emaildata['email_id']) && strlen($emaildata['email_id']) > 0) {
			email_notification_helper($emaildata['email_id'], $emaildata["email_subject"], $emaildata["email_content"]);
		}

		// Send WhatsApp
		$whatsappdata = $this->$model_name->get_whatsappURL($service_id, $cus_id);
		if (isset($whatsappdata['mobile']) && strlen($whatsappdata['mobile']) > 0) {
			whatsapp_message_helper(trim($whatsappdata['mobile'], '""'), $whatsappdata['message']);

			// Meta WhatsApp Integration
			if (isset($whatsappdata['template_id']) && $whatsappdata['template_id'] != "") {
				$params = isset($whatsappdata['params']) ? $whatsappdata['params'] : array($whatsappdata['message']);
				whatsappmeta_notification_helper(trim($whatsappdata['mobile'], '""'), $whatsappdata['template_id'], $params);
			}
		}

		// Send SMS
		$sms_url = $this->$model_name->get_SMSURL($service_id, $cus_id);
		if ($sms_url != "") {
			curl_helper($sms_url, $sms_url);
		}
	}
	//Customer confirmation process
	public function customer_confirmation($id, $con_id)
	{
		$this->load->model("userregistration_model");
		$this->userregistration_model->customer_confirmation($id, $con_id);
	}
	public function validateUserName()
	{
		if (!empty($_POST['username'])) {
			$this->load->model("userregistration_model");
			echo $this->userregistration_model->validateUserName($_POST['username'], $_POST['cusid']);
		} else {
			echo "false";
		}
	}
	public function check_email()
	{
		if (!empty($_POST['email'])) {
			$this->load->model("userregistration_model");
			echo $this->userregistration_model->clientEmail($_POST['cusid'], $_POST["email"]);
		} else {
			echo "false";
		}
	}
	public function check_phoneno()
	{
		if (!empty($_POST['mobile'])) {
			$this->load->model("userregistration_model");
			echo $this->userregistration_model->clientMobileNo($_POST['cusid'], $_POST["mobile"]);
		} else {
			echo "false";
		}
	}
	public function getcutomer($cus_type = "")
	{
		$this->load->model("userregistration_model");
		$valll = $cus_type == 4 ? $this->userregistration_model->get_data($cus_type) : $this->userregistration_model->get_data($cus_type)->result_array();
		echo json_encode($valll);
	}

	function get_number()
	{
		$this->load->model("userregistration_model");
		$status = $this->userregistration_model->get_number($_POST['number'],$_POST['cus_id']);
		echo json_encode(['status' => $status]);
	}
	function get_whats_number()
	{
		$this->load->model("userregistration_model");
		$status = $this->userregistration_model->get_whats_number($_POST['cus_whatsapp'],$_POST['cus_id']);
		echo json_encode(['status' => $status]);
	}
	function get_pan()
	{
		$this->load->model("userregistration_model");
		$status = $this->userregistration_model->get_pan($_POST['cus_panno'],$_POST['cus_id']);
		echo json_encode(['status' => $status]);
	}
	function get_email()
	{
		$this->load->model("userregistration_model");
		$status = $this->userregistration_model->get_email($_POST['cus_email'],$_POST['cus_id']);
		echo json_encode(['status' => $status]);
	}
	function get_gst()
	{
		$this->load->model("userregistration_model");
		$status = $this->userregistration_model->get_gst($_POST['cus_gstno'],$_POST['cus_id']);
		echo json_encode(['status' => $status]);
	}

	/**
	 * BZ: Pre-check for pending limit orders before trader activation update
	 * Called via AJAX before form submit to warn admin
	 */
	function check_customer_limits()
	{
		$cus_id = (int)$this->input->post('cus_id');
		$fv = $this->input->post('fv');
		$cdItems = $this->input->post('cdItems');

		if (!$cus_id) {
			echo json_encode(['has_limits' => false]);
			return;
		}

		$this->load->model('Userregistration_model');
		$oldRecord = $this->Userregistration_model->get_activateentry_record($cus_id);
		$oldComm = $this->Userregistration_model->load_commodity($cus_id);
		$limit_count = 0;
		$affected_commodities = [];

		// Check 1: Account deactivation
		$new_active = isset($fv['cus_active']) ? $fv['cus_active'] : 1;
		if ($new_active == 0 && $oldRecord['cus_active'] == 1) {
			$count = $this->db->where('book_cusid', $cus_id)
				->where('ordertype', 1)->where('orderstatus', 0)
				->where('IFNULL(delete_status,0)', 0)
				->count_all_results('dt_booking');
			if ($count > 0) {
				echo json_encode([
					'has_limits' => true,
					'limit_count' => $count,
					'message' => "Found {$count} active limit order(s). " . ($count == 1 ? "This order will be cancelled. Do you want to cancel it and continue?" : "These orders will be cancelled. Do you want to cancel them and continue?")
				]);
				return;
			}
		}

		// Check 2: Limit disabled
		$new_limit = isset($fv['cus_limitenable']) ? $fv['cus_limitenable'] : 1;
		if ($new_limit == 0 && $oldRecord['cus_limitenable'] == 1) {
			$count = $this->db->where('book_cusid', $cus_id)
				->where('ordertype', 1)->where('orderstatus', 0)
				->where('IFNULL(delete_status,0)', 0)
				->count_all_results('dt_booking');
			if ($count > 0) {
				echo json_encode([
					'has_limits' => true,
					'limit_count' => $count,
					'message' => "Found {$count} active limit order(s). " . ($count == 1 ? "This order will be cancelled. Do you want to cancel it and continue?" : "These orders will be cancelled. Do you want to cancel them and continue?")
				]);
				return;
			}
		}

		// Check 3: Per-commodity sell/buy status changes
		if (isset($cdItems['com_id'])) {
			$i = 0;
			foreach ($cdItems['com_id'] as $key => $com_id) {
				$new_sell = isset($cdItems['cus_com_status_sell'][$i]) ? 1 : 0;
				$new_buy  = isset($cdItems['cus_com_status_buy'][$i]) ? 1 : 0;

				foreach ($oldComm as $old_com) {
					if ($old_com['com_id'] == $com_id) {
						$old_sell = isset($old_com['cus_com_status_sell']) ? $old_com['cus_com_status_sell'] : 0;
						$old_buy  = isset($old_com['cus_com_status_buy']) ? $old_com['cus_com_status_buy'] : 0;

						if ($old_sell == 1 && $new_sell == 0) {
							$cnt = $this->db->where('book_cusid', $cus_id)
								->where('book_comid', (int)$com_id)->where('book_type', 0)
								->where('ordertype', 1)->where('orderstatus', 0)
								->where('IFNULL(delete_status,0)', 0)
								->count_all_results('dt_booking');
							if ($cnt > 0) {
								$limit_count += $cnt;
								$affected_commodities[] = $old_com['com_name'];
							}
						}
						if ($old_buy == 1 && $new_buy == 0) {
							$cnt = $this->db->where('book_cusid', $cus_id)
								->where('book_comid', (int)$com_id)->where('book_type', 1)
								->where('ordertype', 1)->where('orderstatus', 0)
								->where('IFNULL(delete_status,0)', 0)
								->count_all_results('dt_booking');
							if ($cnt > 0) {
								$limit_count += $cnt;
								$affected_commodities[] = $old_com['com_name'];
							}
						}
						break;
					}
				}
				$i++;
			}
		}

		if ($limit_count > 0) {
			echo json_encode([
				'has_limits' => true,
				'limit_count' => $limit_count,
				'message' => "Found {$limit_count} active limit order(s) for: " . implode(', ', array_unique($affected_commodities)) . ". " . ($limit_count == 1 ? "This order will be cancelled. Do you want to cancel it and continue?" : "These orders will be cancelled. Do you want to cancel them and continue?")
			]);
		} else {
			echo json_encode(['has_limits' => false]);
		}
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */
