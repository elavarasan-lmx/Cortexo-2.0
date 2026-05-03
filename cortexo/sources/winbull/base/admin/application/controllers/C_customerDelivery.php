<?php
class C_customerDelivery extends My_Controller
{
	var $form_entry = "customerdelivery_entry";
	var $menu_code	= 13;
	var $inv_menucode = 41;
	var $outs_menucode = 43;
	var $koff_menucode = 44;
	var $cd_menucode = 22;
	var $dvl_menucode = 47;
	var $smsr_menucode = 46;
	var $dis_menucode = 49;
	var $drg_menucode = 20;
	var $dr_menucode = 21;
	var $tt_menucode = 12;
	var $coverup_menucode = 72;
	var $mt5_menucode = 73;
	var $inactive_menucode = 84;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("Customerdelivery_model");
		$this->load->model('Booking_model');
		$this->load->helper('common');
		date_default_timezone_set('Asia/Kolkata');
	}
	function open_listingform()
	{
		$tradeObj = new Trading();
		$data['customer'] = $tradeObj->get_customers();
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}

		if ($data["userrights"]['view'] == 1) {
			$this->load->view('customerdelivery_listing', $data);
		} else {
			$this->load->view('access_denied');
		}
	}
	function open_customerbalancelisting()
	{
		$this->load->model('customerbalancedetails_model');
		$this->load->view('customerbalancedetails_report');
	}
	// grid coding
	function grid_dataload($model_name = "", $from_date = "", $to_date = "", $comID = "", $comType = "", $bookType = "")
	{
		$this->load->model($model_name);
		$data 			= 	$this->$model_name->get_data($from_date, $to_date, $comID, $comType, $bookType)->result_array();
		echo json_encode($data);
	}
	function deliverygrid_dataload($model_name = "", $id)
	{
		//$this->header_content();				
		$this->load->model($model_name);
		$req_param = array(
			"sort_by" 			=> 	$this->input->post("sidx", TRUE),
			"sort_direction" 	=> 	$this->input->post("sord", TRUE),
			"page" 				=> 	$this->input->post("page", TRUE),
			"num_rows" 			=> 	$this->input->post("rows", TRUE),
			"search" 			=> 	$this->input->post("_search", TRUE),
			"search_field" 		=> 	$this->input->post("searchField", TRUE),
			"search_operator" 	=> 	$this->input->post("searchOper", TRUE),
			"search_str" 		=> 	$this->input->post("searchString", TRUE)
		);
		$data = new stdClass;
		$data->page 		= 	$this->input->post("page", TRUE);
		$data->records 		= 	count($this->$model_name->get_deliverydata($id)->result_array());
		$data->total 		= 	ceil($data->records / $this->input->post("rows", TRUE));
		if ($data->records > 0) {
			$total_pages = ceil($data->records / $this->input->post("rows", TRUE));
		} else {
			$total_pages = 0;
		}
		if ($data->page > $total_pages) $data->page = $total_pages;
		$start = ($this->input->post("rows", TRUE) * $this->input->post("page", TRUE)) - $this->input->post("rows", TRUE);

		$records 			= 	$this->$model_name->get_deliverydata($id)->result_array();
		$data->rows 		= 	$records;
		echo json_encode($data);
		//$query->free_result();
		exit(0);
	}


	function open_delivery_entryform($model_name = "", $type = "", $id = "")
	{
		$this->load->model($model_name);
		$datas				=	$_POST;
		if ($type == 'add_new') {
			$record					=	$this->$model_name->empty_record($datas);
			$_POST['fv']['type']	=	$type;
			$this->load->view("customerdelivery_entry", $_POST['fv']);
		} else if ($type == 'edit') {
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
			$_POST['fv']['cusdel_code'] = 	$id;
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'delete') {
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=   $record;
			$_POST['fv']['type']		=   $type;
			$_POST['fv']['code']		=	$code;
			$_POST['fv']['cusdel_code'] = 	$id;
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'invoice') {
			$record	=	$this->$model_name->get_invoice_record($id);
			$this->load->view('invoice_customer', $record);
		}
	}
	function open_delivery_viewform($model_name = "", $type = "", $id = "")
	{
		$this->load->model($model_name);
		//$records = $this-> $model_name->set_data_view($id);
		$records['id'] = $id;
		$this->load->view('customerdeliveryEntry_listing', $records);
	}
	function open_entryform($model_name = "", $type = "", $id = "")
	{

		$this->load->model($model_name);
		if ($type == 'add_new') {
			$record					=	$this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'edit') {
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
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
	function close_record($model_name = '', $type = '')
	{
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['add'] == 1) {
			$this->db->trans_begin();  // Begin Transaction		
			$del_codes = $this->$model_name->close_record();

			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();
				$data['error'] = "success";
				if (count($del_codes) > 0) {
					foreach ($del_codes as $delivery_code) {
						$service_id = "6";
						$sms_url = $this->$model_name->get_SMSURL($service_id, $delivery_code);
						if ($sms_url != '') {
							$curl_resp = curl_helper($sms_url, $sms_url);
						}
						$whatsapp_url = $this->$model_name->get_whatsappURL($service_id, $delivery_code);
						if (isset($whatsapp_url['mobile']) && strlen($whatsapp_url['mobile']) > 0) {
							whatsapp_message_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['message']);
							
							// Meta WhatsApp Integration
							if (isset($whatsapp_url['template_id']) && $whatsapp_url['template_id'] != "") {
								$params = isset($whatsapp_url['params']) ? $whatsapp_url['params'] : array($whatsapp_url['message']);
								whatsappmeta_notification_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['template_id'], $params);
							}
						}
						$data = $this->$model_name->get_EmailContent($service_id, $delivery_code);
						if ($data != '') {
							if (strlen($data['email_id']) > 0) {
								$email_resp = email_notification_helper($data['email_id'], $data["email_subject"], $data['email_content']);
							}
						}
					}
				}
				redirect("/C_customerDelivery/open_listingform");
			} else {
				$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
				if ($db_error_msg == "0") {
					$db_error_msg = $this->db->_error_message();
				}
				//This will execute when any transactions will fail.
				$this->db->trans_rollback();	//Rollback all transactions.

				$this->open_listingform($db_error_msg);
			}
		} else {
			$this->load->view('access_denied');
		}
	}
	function print_record($type, $model_name = "")
	{
		$this->load->model($model_name);
		if ($type == 'DR') {
			$print_type = $this->input->post('clickprocess');
			if ($print_type == 1) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$data = $this->load->view('convert_html_topdf_php/dealregpdf', $print, true);
			} else if ($print_type == 2) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$print['header_info'] = array(
					'report_client' => $this->input->post('report_client'),
					'report_from_date' => $this->input->post('report_from_date'),
					'report_to_date' => $this->input->post('report_to_date'),
					'report_generated_on' => $this->input->post('report_generated_on')
				);
				$data = $this->load->view('convert_html_topdf_php/dealregexcel', $print, true);
			} else {
				$records = $this->$model_name->print_record($type);
				$data['records'] = $records;
				$data['header_info'] = array(
					'report_client' => $this->input->post('report_client'),
					'report_from_date' => $this->input->post('report_from_date'),
					'report_to_date' => $this->input->post('report_to_date'),
					'report_generated_on' => $this->input->post('report_generated_on')
				);
				$this->load->view('print_Dr', $data);
			}
		} else if ($type == 'PD') {
			$print_type = $this->input->post('clickprocess');
			if ($print_type == 1) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$data = $this->load->view('convert_html_topdf_php/pendelipdf', $print, true);
			} else if ($print_type == 2) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$data = $this->load->view('convert_html_topdf_php/pendeliexcel', $print, true);
			} else {
				$records = $this->$model_name->print_record($type);
				$data['records'] = $records;
				$this->load->view('print_Pd', $data);
			}
		} else if ($type == 'RT') {
			$print_type    = $this->input->post('clickprocess');
            
            // Capture Header Info
            $header_info = array(
                'report_client' => $this->input->post('report_client'),
                'report_from_date' => $this->input->post('report_from_date'),
                'report_to_date' => $this->input->post('report_to_date'),
                'report_generated_on' => $this->input->post('report_generated_on')
            );

			if ($print_type == 1) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
                $print['header_info'] = $header_info;
				$data = $this->load->view('convert_html_topdf_php/cusdlypdf', $print, true);
			} else if ($print_type == 2) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
                $print['header_info'] = $header_info;
				$data = $this->load->view('convert_html_topdf_php/cusdlyexcel', $print, true);
			} else {
				$records = $this->$model_name->print_record($type);
				$data['records'] = $records;
                $data['header_info'] = $header_info;
				$this->load->view('print_Rt', $data);
			}
		} else if ($type == 'TT') {
			$print_type    = $this->input->post('clickprocess');
			if ($print_type == 1) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$data = $this->load->view('convert_html_topdf_php/todaytrpdf', $print, true);
			} else if ($print_type == 2) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$data = $this->load->view('convert_html_topdf_php/todaytrexcel', $print, true);
			} else {
				$records = $this->$model_name->print_record($type);
				$data['records'] = $records;
				$this->load->view('print_Tt', $data);
			}
		} else if ($type == 'MT5') {
			$print_type    = $this->input->post('clickprocess');
			if ($print_type == 1) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$data = $this->load->view('convert_html_topdf_php/mt5trpdf', $print, true);
			} else if ($print_type == 2) {
				$print['customers'] = $this->$model_name->print_record($type, '', '', '');
				$data = $this->load->view('convert_html_topdf_php/mt5trexcel', $print, true);
			} else {
				$records = $this->$model_name->print_record($type);
				$data['records'] = $records;
				$this->load->view('print_mt5', $data);
			}
		}
	}
	function DB_Controller($model_name = "", $status = "", $id = "", $cuscode = "", $amount = "", $qty = "", $comcode = "")	//Control DB Process and Validation Process.
	{
		$this->load->model($model_name);
		$this->db->trans_begin();  // Begin Transaction
		$delivery_code = null; // Bug fix #3: initialize $delivery_code to prevent undefined variable
		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			// Bug fix #3: capture delivery_code returned by insert_record
			$delivery_code = isset($result['delivery_code']) ? $result['delivery_code'] : null;
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record added successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to add record.');
			}
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record updated successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to update record.');
			}
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record deleted successfully!');
			} else {
				$this->session->set_flashdata('error', 'Failed to delete the record!');
			}
		} else if ($status == 'close') {
			$delivery_code = $this->$model_name->close_record($id, $cuscode, $amount, $qty, $comcode);
		} else if ($status == 'del_delivery') {
			$delivery_code = $this->$model_name->hide_record($id);
		} else {
			$this->load->view($this->form_entry, $_POST['fv']);
		}
		if ($this->db->trans_status() === TRUE) {
			$this->db->trans_commit();
			$data['error'] = "success";
			if ($status == 'add_new' || $status == 'close') {
				$service_id = "7";
				// Bug fix #5: properly call email_notification_helper with returned email data
				$email_data = $this->$model_name->get_EmailContent($service_id, $delivery_code);
				if (!empty($email_data) && !empty($email_data['email_id'])) {
					email_notification_helper($email_data['email_id'], $email_data['email_subject'], $email_data['email_content']);
				}
				$whatsapp_url = $this->$model_name->get_whatsappURL($service_id, $delivery_code);
				if (isset($whatsapp_url['mobile']) && strlen($whatsapp_url['mobile']) > 0) {
					whatsapp_message_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['message']);
					// Meta WhatsApp Integration
					if (isset($whatsapp_url['template_id']) && $whatsapp_url['template_id'] != "") {
						$params = isset($whatsapp_url['params']) ? $whatsapp_url['params'] : array($whatsapp_url['message']);
						whatsappmeta_notification_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['template_id'], $params);
					}
				}
				$this->Customerdelivery_model->get_SMSURL($service_id, $delivery_code);
				redirect("/C_customerDelivery/open_listingform");
			}
			redirect("/C_customerDelivery/open_listingform");
		} else {
			$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if ($db_error_msg == "0") {
				$db_error_msg = $this->db->_error_message();
			}
			$this->db->trans_rollback();
			$data['error'] = "failure";
			$_POST['fv']['type'] = $status;
			if ($status == "delete") {
				$this->open_listingform($db_error_msg);
			} else {
				if ($status == "add_new") {
					$_POST['fv']['cuspay_code'] = NULL;
				}
				$_POST['fv']['db_error_msg'] = $db_error_msg;
				$this->load->view($this->form_entry, $_POST['fv']);
			}
		}
	}

	function listing($report_type = "")
	{
		$data['comm'] = $this->Customerdelivery_model->get_active_commodities();
		$data['customers'] = $this->Customerdelivery_model->get_active_customers();
		if ($report_type == 0) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->inv_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('invoice_listing', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 1) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->outs_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('outstanding_report', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 2) {
			// Bug fix #6: added access rights check
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->dr_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('customer_ledger');
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 3) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->drg_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('trading_status', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 4) {
			// Bug fix #6: added access rights check
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->drg_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('order_status');
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 5) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->tt_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('today_trade', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 6) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->dr_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('customerdelivery_report', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 7) {
			// Bug fix #6: added access rights check
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->cd_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('customermargin_report', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 8) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->outs_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('customers_oustanding', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 9) {
			// Bug fix #6: added access rights check
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->inv_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('invoice_list', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 10) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->coverup_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('coverupreport', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 11) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->mt5_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('mt5_hedge', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 12) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->mt5_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('deliveryreport', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else if ($report_type == 13) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->inactive_menucode) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			if ($data["userrights"]['view'] == 1) {
				$this->load->view('inactive_report', $data);
			} else {
				$this->load->view('access_denied');
			}
		}
	}
	function coverup_record($branch_id = "", $com_id = "", $from_date = "", $to_date = "")
	{
		$model_name = "Customerdelivery_model";
		$data = $this->$model_name->get_coverup_record($branch_id, $com_id, $from_date, $to_date);
		echo json_encode($data);
	}
	function customerdetailmargin_report($model_name = "", $cus_id = "")
	{
		$data['cusid'] 			= $cus_id;
		$this->load->view('customerdetailmargin_report', $data);
	}
	function unfix_booking_report($model_name = "")
	{


		$data	= 	$this->$model_name->unfix_booking_report()->result_array();
		echo json_encode($data);
		exit;
	}
	function grid_customerdetailmargin($model_name = "", $from_date = "", $to_date = "", $cus_id = "")
	{
		$data 			= 	$this->$model_name->get_customer_margin_data($from_date, $to_date, $cus_id)->result_array();
		echo json_encode($data);
	}
	function grid_dataload_listing($report_type = "", $model_name = "", $from_date = "", $to_date = "")
	{
		$data 			= 	$this->$model_name->get_listing($report_type, $from_date, $to_date)->result_array();
		echo json_encode($data);
	}
	function outstanding_report()
	{
		$this->load->view('invoice_listing');
	}
	function TransactionReport_dataload($model_name = "", $code = "", $from_date = "", $to_date = "")
	{
		$data = $this->$model_name->get_transactiondata($code, $from_date, $to_date);
		echo json_encode($data);
	}
	function todays_trade($model_name = "", $from_date = "", $to_date = "", $type = "", $status = "", $comID = "", $comType = "", $bookType = "")
	{
		$data	= 	$this->$model_name->get_tradingStatus($from_date, $to_date, $type, $status, $comID, $comType, $bookType)->result_array();
		echo json_encode($data);
	}
	function tradingStatus_dataload($model_name = "", $from_date = "", $to_date = "", $type = "", $status = "", $comID = "", $comType = "", $bookType = "", $cusid = "")
	{
		$data['trade'] = "";
		$data['opening'] = "";
		if ($type == -1 || $type == 0 || $type == 1) {
			$data['trade'] 	= 	$this->$model_name->get_tradingStatus($from_date, $to_date, $type, $status, $comID, $comType, $bookType, $cusid)->result_array();
		}
		if ($type == -1 || $type == 2) {
			$data['opening']	= 	$this->$model_name->get_openingBalanceQty($comID)->result_array();
		}
		echo json_encode($data);
	}
	function customerdelivery_dataload($model_name = "", $from_date = "", $to_date = "", $comID = "", $comType = "", $bookType = "")
	{
		$data 			= 	$this->$model_name->get_customerdeliveryreport($from_date, $to_date, $comID, $comType, $bookType)->result_array();
		echo json_encode($data);
	}
	function update_invoiceno()
	{
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->inv_menucode) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['edit'] == 1) {
			$model_name = "customerdelivery_model";
			echo $this->$model_name->update_invoiceno(trim($_POST['pk']), trim($_POST['value']), trim($_POST['name']));
		} else {
			echo "Access denied";
		}
	}

	function delete_booking($type, $model_name, $book_no)
	{
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->drg_menucode) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['delete'] == 1) {
			$tradeObj = new Trading();
			$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
			$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
			$oDetails = $tradeObj->get_orderdetails($book_no)->result_array();

			if (count($oDetails) > 0) {
				$is_pending_order = ($oDetails[0]['ordertype'] == 1 && $oDetails[0]['orderstatus'] == 0) ? 1 : 0;

				if ($is_pending_order == 1 ? $cancel_ratealert_url != '' && $client != '' : true) {
					$this->db->trans_begin();  // Begin Transaction		
					$this->$model_name->delete_booking($book_no);
					if ($this->db->trans_status() === TRUE) {
						//This will execute when all transactions insert without error.			
						$this->db->trans_commit();
						// BZ-30: Set success flashdata so the page shows a delete alert
						$this->session->set_flashdata('success', 'Record deleted successfully');
						if ($is_pending_order == 1) {
							$requestdata = array(
								'client'  => $client,
								'book_no' => array($book_no)
							);
							$field_string = http_build_query($requestdata);
							$curl_resp = curl_helper($cancel_ratealert_url, $field_string);

							$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
							if ($url != '') {
								$return_array['limit'] = array('limitupdate' => 1, 'book_no' => "1");
								$field_string = http_build_query($return_array);
								$curl_resp = curl_helper($url, $field_string);
							}
						}
					} else {
						$this->db->trans_rollback();	//Rollback all transactions.
						// BZ-30: Set error flashdata on transaction failure
						$this->session->set_flashdata('error', 'Failed to delete the record. Please try again.');
					}
				}
			} else {
				$this->session->set_flashdata('error', "No bookings found.Please try again.");
			}

			if ($type == 0)
				redirect("/C_customerDelivery/listing/5");
			else
				redirect("/C_customerDelivery/listing/3");
		} else {
			$this->load->view('access_denied');
		}
	}
	function revert_delivery($model_name, $book_no)
	{
		// Bug fix #7: added rights check before allowing delivery revert
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->drg_menucode) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['edit'] != 1) {
			$this->load->view('access_denied');
			return;
		}
		$this->db->trans_begin();
		$this->$model_name->revert_delivery((int)$book_no);
		if ($this->db->trans_status() === TRUE) {
			$this->db->trans_commit();
		} else {
			$this->db->trans_rollback();
		}
		redirect("/C_customerDelivery/listing/3");
	}
	function deal_transfer()
	{
		// Bug fix #8: validate required POST fields before processing
		$book_id  = $this->input->post('book_id',  TRUE);
		$cust_id  = $this->input->post('cust_id',  TRUE);
		$newcusid = $this->input->post('newcusid', TRUE);
		$narration = $this->input->post('narration', TRUE);

		if (empty($book_id) || !is_numeric($book_id) || empty($cust_id) || !is_numeric($cust_id) || empty($newcusid) || !is_numeric($newcusid)) {
			echo json_encode(array('success' => FALSE, 'message' => 'Invalid or missing required fields.'));
			return;
		}

		$this->db->trans_begin();
		$model_name = "Customerdelivery_model";
		$update_array = array(
			'book_transfer'      => 1,
			'book_transfer_from' => (int)$cust_id,
			'book_transfered_on' => date('Y-m-d H:i:s'),
			'book_naration'      => $narration,
			'book_cusid'         => (int)$newcusid
		);
		$response_data = $this->$model_name->deal_transfer((int)$book_id, $update_array);
		if ($this->db->trans_status() === TRUE) {
			$this->db->trans_commit();
			echo json_encode($response_data);
		} else {
			$this->db->trans_rollback();
			echo json_encode(array('success' => FALSE, 'message' => 'Please enter with valid details'));
		}
	}
	function delete_selectedRecords()
	{
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->drg_menucode) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['delete'] == 1) {
			$this->db->trans_begin();
			$model_name = "Customerdelivery_model";
			$this->$model_name->delete_selectedRecords();
			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();
				$this->session->set_flashdata('success', 'Selected records deleted successfully');
			} else {
				$this->db->trans_rollback();
				$this->session->set_flashdata('error', 'Failed to delete selected records. Please try again.');
			}
			redirect("/C_customerDelivery/listing/3");
		} else {
			$this->load->view('access_denied');
		}
	}
	function save_booknarration($type)
	{
		$model_name = "customerdelivery_model";
		$this->load->model($model_name);
		echo $this->$model_name->save_booknarration($type);
	}
	function save_manualhedge($type)
	{
		$model_name = "customerdelivery_model";
		$this->load->model($model_name);
		echo $this->$model_name->save_manualhedge($type);
	}
	function mt5_hedge($model_name = "", $from_date = "", $to_date = "")
	{
		$data	= 	$this->$model_name->get_mt5hedge($from_date, $to_date)->result_array();
		echo json_encode($data);
	}
	function delete_mt5hedge($type, $model_name, $hedgid)
	{
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->mt5_menucode) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['delete'] == 1) {
			// Bug fix #9: wrap in transaction
			$this->db->trans_begin();
			$this->$model_name->delete_mt5hedge((int)$hedgid);
			if ($this->db->trans_status() === TRUE) {
				$this->db->trans_commit();
			} else {
				$this->db->trans_rollback();
			}
			redirect("/C_customerDelivery/listing/11");
		} else {
			$this->load->view('access_denied');
		}
	}
	function todayinline_update()
	{
		// Log the operation
		$log_data = array('Action' => 'Today Inline Update');
		log_admin_add(0, 'Customer Delivery', $log_data, 'Today inline update operation performed');

		$tradeObj = new Trading();
		echo $tradeObj->todayinline_update();
	}
	function deliveryinline_update()
	{
		// Log the operation
		$log_data = array('Action' => 'Delivery Inline Update');
		log_admin_add(0, 'Customer Delivery', $log_data, 'Delivery inline update operation performed');

		$tradeObj = new Trading();
		echo $tradeObj->deliveryinline_update();
	}
	function updatefix_unfix()
	{

		$book_no = $_POST['book_no'];
		$sts = $_POST['sts'];

		// Log the operation
		$log_data = array('Action' => 'Update Fix/Unfix', 'Book No' => $book_no, 'Status' => $sts);
		log_admin_add(0, 'Customer Delivery', $log_data, 'Update fix/unfix operation performed for Book No: ' . $book_no);

		$model = 'Customerdelivery_model';
		$update_sts = $this->$model->updatefix_unfix($book_no, $sts);
		echo json_encode($update_sts);
		exit;
	}
	function avg_rate_update()
	{
		// Log the operation
		$log_data = array('Action' => 'Average Rate Update');
		log_admin_add(0, 'Customer Delivery', $log_data, 'Average rate update operation performed');

		$tradeObj = new Trading();
		echo $tradeObj->avg_rate_update();
	}

	// Inactive User
	function inactive_user($model_name = "", $from_date = "", $to_date = "")
	{
		// Bug fix #4: use CI query binding to prevent SQL injection from URL params
		$base_sql = "SELECT c.cus_id, c.cus_name, c.cus_mobile, c.cus_register_on, c.inactive_on
				FROM dt_customer c
				WHERE c.inactive_status = 1";

		if (!empty($from_date) && !empty($to_date)) {
			$from_date_formatted = date('Y-m-d', strtotime($from_date));
			$to_date_formatted   = date('Y-m-d', strtotime($to_date));
			$base_sql .= " AND c.inactive_on BETWEEN ? AND ?";
			$data = $this->db->query($base_sql . " ORDER BY c.inactive_on DESC", array($from_date_formatted, $to_date_formatted))->result_array();
		} else {
			$data = $this->db->query($base_sql . " ORDER BY c.inactive_on DESC")->result_array();
		}

		echo json_encode($data);
	}
	function auto_inactive_nonbooking()
	{
		$this->load->model('Customerdelivery_model');

		// Get Settings
		$settings = $this->db->query("SELECT * FROM dt_generalsettings")->row();
		if (!isset($settings->inactive_booking) || $settings->inactive_booking != 1) {
			echo "Auto Inactive Customer Disabled";
			return;
		}

		// Validate Days
		$days = $settings->inactive_booking_days;
		if ($days <= 0) {
			echo "Invalid Inactive Customer Days\n";
			return;
		}

		// Get customers who haven't made any bookings in the last X days
		$sql = "
		SELECT DISTINCT cus_id
		FROM dt_customer
		WHERE cus_id NOT IN (
		    SELECT DISTINCT book_cusid
		    FROM dt_booking
		    WHERE book_datetime >= DATE_SUB(NOW(), INTERVAL $days DAY)
		)
		AND cus_id != 0";

		// $sql = "
		// SELECT c.cusid
		// FROM dt_customer c
		// WHERE c.cusid != 0
		// AND NOT EXISTS (
		//     SELECT 1
		//     FROM dt_booking b
		//     WHERE b.book_cusid = c.cusid
		// AND b.book_datetime >= NOW() - INTERVAL $days DAY);";

		$customers = $this->db->query($sql)->result();
		if (empty($customers)) {
			echo "No inactive customers found";
			return;
		}

		// Update customers to inactive status
		$updated_count = 0;
		foreach ($customers as $customer) {
			$this->db->query("UPDATE dt_customer SET inactive_status = 1, inactive_on = CURDATE() WHERE cus_id = " . (int)$customer->cus_id);
			$updated_count++;
		}

		echo "Done. $updated_count inactive customers updated";
		exit;
	}
}
