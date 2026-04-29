<?php
class C_phonebooking extends My_Controller
{
	var $menu_code = 10;
	public function __construct()
	{
		parent::__construct();
		$this->load->model('Phonebooking_model');
		// Load common helper for logging
		$this->load->helper('common');
		// Load field labels helper for user-friendly logging
		$this->load->helper('field_labels');
	}
	function index()
	{
		
		$tradeObj = new Trading();
		$data['customer'] = $tradeObj->get_customers();
		$data['comdata'] = $tradeObj->get_commodity_data();
		$data["userrights"] = ["view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0];
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = ["view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]];
			}
		}
		if ($data["userrights"]['view'] == 1) {
			$this->load->view('phone_booking', $data);
		} else {
			$this->load->view('access_denied');
		}
	}
	public function getcommodities()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_commodity_data();
		echo json_encode($data);
	}
	public function get_commodity_data()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->display_commodity_data();
		echo json_encode($data);
	}
	function booking_request()
	{
		$data["userrights"] = ["view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0];
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = ["view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]];
			}
		}
		if ($data["userrights"]['add'] == 1) {
			$data = $this->input->post(NULL, true);
			$data['book_by'] = 3;
			
			$this->db->trans_begin(); // Begin Transaction
			$tradeObj = new Trading();
			$return_array = array(); // BZ-14: Initialize to prevent undefined variable error
			$return_data = $tradeObj->insert_record($data);

			if ($this->db->trans_status() === true) {
				$this->db->trans_commit();
				$return_data['success'] = true;
				if ($return_data['status'] == 1) {
					if ($this->input->post('request_type') == 0) {
						$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
						if ($url != '') {
							$return_array['book'] = ['bookupdate' => 1, 'confirm_type' => $return_data['confirm_type']];
							$field_string = http_build_query($return_array);
							curl_helper($url, $field_string);
						}
					} else {
						$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
						if ($url != '') {
							$return_array['limit'] = ['limitupdate' => 1, 'book_no' => "1"];
							$field_string = http_build_query($return_array);
							curl_helper($url, $field_string);
						}
					}
				}
				// Log successful booking with user-friendly field names
				$log_data = array_merge($return_data, $return_array ?? array());
				$user_friendly_log_data = transform_booking_data_for_logging($log_data);
				log_admin_add('Booking Success', 'Phone Booking', $user_friendly_log_data, 'Phone booking completed successfully');
			} else {
				$this->db->trans_rollback();
				$return_data['success'] = false;
				// Log failed booking with user-friendly field names
				$user_friendly_log_data = transform_booking_data_for_logging($return_data);
				log_admin_add('Booking Failed', 'Phone Booking', $user_friendly_log_data, 'Phone booking failed');
			}
		} else {
			$return_data["message"] = "You are not authorized to do this operation.";
			$return_data['success'] = false;
			// Log unauthorized access attempt with user-friendly field names
			$user_friendly_log_data = transform_booking_data_for_logging($data);
			log_admin_add('Unauthorized Access', 'Phone Booking', $user_friendly_log_data, 'Unauthorized phone booking attempt');
		}
		echo json_encode($return_data);
	}
	function notifyBooking()
	{
		$book_no = $this->input->post('book_no', true);

		if (is_numeric($book_no) && $book_no > 0) {
			$tradeObj = new Trading();
			$result = $tradeObj->notifyBooking($book_no);
			echo json_encode(['success' => true, 'message' => 'Notification sent', 'data' => $result]);
		} else {
			echo json_encode(['success' => false, 'message' => 'Invalid booking number']);
		}
	}
	function get_tradingstatus()
	{
		$tradeObj = new Trading();
		$cus_id = $this->input->post('cus_id');
		$data = $tradeObj->get_custradedata($cus_id);
		// Ensure allMargins is present in the response for Available Margin display
		if (!isset($data['allMargins']) || empty($data['allMargins'])) {
			$marginQuery = $this->db->query("SELECT trans_cuscode as cus_id, IFNULL(SUM(if(trans_actype = 1, -1, 1) * IFNULL(trans_amount,0)),0) as margin_amt FROM dt_transaction GROUP BY trans_cuscode");
			$data['allMargins'] = $marginQuery->result_array();
		}
		echo json_encode($data);
	}
	function tradingStatus_dataload($model_name = "")
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_phonebookreport()->result_array();
		echo json_encode($data);
	}
	function get_tolerance()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_tolerance();
		echo json_encode($data);
	}
}
