<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');

/**
 * Example
 *
 * This is Customer interaction methods. In this we created customer registration,
 * login validation and customer profile details.
 *
 * @package		CodeIgniter
 * @subpackage	Rest Server
 * @category	Controller
 * @author		Vinoth Kumar
 * @reference link		http://philsturgeon.co.uk/code/
 */

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';

class C_mobileclienttrade extends REST_Controller
{
	function __construct()
	{
		header('Access-Control-Allow-Origin: *');
		header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
		header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
		$method = $_SERVER['REQUEST_METHOD'];
		if($method == "OPTIONS") {
			exit();
		}
		// Construct our parent class
		parent::__construct();
		ini_set('date.timezone', 'Asia/Calcutta');
		$this->response->format = 'json';

		$this->load->helper("lmx/classes/trading_helper.php");
		$this->load->helper("lmx/functions/notifications_helper.php");
	}
	
	// function gettradecommodities_get() {

	// 	$cus_id = $this->get('cusid');

	// 	if(is_numeric($cus_id) && $cus_id > 0) {

	// 		$tradeObj = new Trading();

	// 		$result  = $tradeObj->gettradecommodities($this->get('cusid'));
	// 		$message = $result['message'];

	// 		if($result['status'] == 1) {

	// 			$this->response(array(
	// 					'success' => true,
	// 					'message' => $message,
	// 					'data' => $result
	// 			), 200);
	// 		}
	// 		else {

	// 			$this->response(array(
	// 				'success' => false,
	// 				'message' => $message,
	// 				'data' => $result
	// 			), 200);

	// 		}
	// 	} else {

	// 		$message = "Required fields are missing. Please try again.";
	// 		$this->response(array(
	// 			'success' => false,
	// 			'message' => $message,
	// 			'data' => []
	// 		), 200);

	// 	}
	// }
	function gettradecommodities_get() {
		$this->load->model("M_mobiletrade");
		$result = $this->M_mobiletrade->gettradecommodities($this->get('cusid'));
		$this->response(array(
						'success' => true,
						'message' => $result['message'],
						'data' => $result
				), 200);
	}

	function bookingRequest_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$data['book_by'] = 1;
		$this->db->trans_begin();
		$tradeObj = new Trading();
		$result  = $tradeObj->insert_record($data);
		if($this->db->trans_status()===TRUE)
		{
			$this->db->trans_commit();
			if($result['status'] == 1) 
			{
				if($data['request_type'] == 1)
				{
					$message = "Order has been received, you will be notified once the order executes...";

					$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
					if($url != '')
					{
						$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
						$field_string = http_build_query($return_array);
						curl_helper($url, $field_string);
					}
				}
				else
				{
					if($result['confirm_type'] == 1)
					{
						$message = "Your request has been confirmed with Qty ".$result['book_qty']." at Rs.".$result['book_rate'];
					}
					else if($result['confirm_type'] == 0)
					{
						$message = "Your request has been rejected. Please try again later";
					}
					else if($result['confirm_type'] == 2)
					{
						$message = "Your request has been accepted with Qty ".$result['book_qty']." at Rs.".$result['book_rate'].", APPROVAL PENDING";
					}

					$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
					if($url != '')
					{
						$return_array['book'] = array('bookupdate' => 1,'confirm_type' => $result['confirm_type']);
						$field_string = http_build_query($return_array);
						curl_helper($url, $field_string);
					}
				}
				// Log successful booking with user-friendly field names
				$this->load->helper('field_labels');
				$log_data = array_merge($result, $return_array);
				$user_friendly_log_data = transform_booking_data_for_logging($log_data);
				log_admin_add('Booking Success', 'Mobile Booking', $user_friendly_log_data, 'Mobile booking completed successfully');
				$this->response(array(
								'success' => true,
								'message' => $message,
								'data' => $result
						), 200);
			}
			else 
			{
				$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Request got failure. Please try again later";
				// Log failed booking with user-friendly field names
				$this->load->helper('field_labels');
				$user_friendly_log_data = transform_booking_data_for_logging($result);
				log_admin_add('Booking Failed', 'Mobile Booking', $user_friendly_log_data, 'Mobile booking failed');
				$this->response(array(
								'success' => false,
								'message' => $message,
								'data' => $result
						), 200);
			}
		} else {
			$this->db->trans_rollback();
			$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Request got failure. Please try again later";
			// Log failed booking with user-friendly field names
			$this->load->helper('field_labels');
			$user_friendly_log_data = transform_booking_data_for_logging($result);
			log_admin_add('Booking Failed', 'Mobile Booking', $user_friendly_log_data, 'Mobile booking failed');
			$this->response(array(
								'success' => false,
								'message' => $message,
								'data' => $result
						), 200);
		}
	}
	/* function bookingRequest_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->load->model("M_mobiletrade");
		$this->db->trans_begin();
		$result = $this->M_mobiletrade->insert_record($data);
		if($this->db->trans_status()===TRUE)
		{
			$this->db->trans_commit();
			if($result['status'] == 1) 
			{
				if($data['request_type'] == 1)
				{
					$message = "Order has been received, you will be notified once the order executes...";

					$url = trim(isset(Globals::$limitupdate) ? Globals::$limitupdate : '');
					if($url != '')
					{
						$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
						$field_string = http_build_query($return_array);
						$ch = curl_init();
						curl_setopt($ch,CURLOPT_URL,$url);
						curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
						curl_setopt($ch,CURLOPT_HEADER, false); 
						curl_setopt($ch, CURLOPT_POST, 1);
						curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
						$curlresult = curl_exec($ch);
						curl_close($ch);
					}
				}
				else
				{
					if($result['confirm_type'] == 1)
					{
						// $remainqty = $result['remallqty'];
						$message = "Your request has been confirmed with Qty ".$result['book_qty']." at Rs. ".$result['book_rate'];
					}
					else if($result['confirm_type'] == 0)
					{
						$message = "Your request has been rejected. Please try again later";
					}
					else if($result['confirm_type'] == 2)
					{
						$message = "Your request has been accepted with Qty ".$result['book_qty']." at Rs. ".$result['book_rate'].", APPROVAL PENDING";
					}

					$url = trim(isset(Globals::$bookupdate) ? Globals::$bookupdate : '');
					if($url != '')
					{
						$return_array['book'] = array('bookupdate' => 1,'confirm_type' => $result['confirm_type']);
						$field_string = http_build_query($return_array);
						$ch = curl_init();
						curl_setopt($ch,CURLOPT_URL,$url);
						curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
						curl_setopt($ch,CURLOPT_HEADER, false); 
						curl_setopt($ch, CURLOPT_POST, 1);
						curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
						$curlresult = curl_exec($ch);
						curl_close($ch);
					}
				}
				$this->response(array(
								'success' => true,
								'message' => $message,
								'data' => $result
						), 200);
			}
			else 
			{
				$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Request got failure. Please try again later";
				$this->response(array(
								'success' => false,
								'message' => $message,
								'data' => $result
						), 200);
			}

		} else {
			$this->db->trans_rollback();
			$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Request got failure. Please try again later";
			$this->response(array(
								'success' => false,
								'message' => $message,
								'data' => $result
						), 200);
		}

	} */
	function updatebookRequest_post(){
		$data = (array)json_decode(file_get_contents("php://input"));
		$data['book_by'] = 1;
		$this->db->trans_begin();
		$tradeObj = new Trading();
		$result  = $tradeObj->update_order($data);

		if($this->db->trans_status()===TRUE)
		{
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
				if($url != '')
				{
					$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
					$field_string = http_build_query($return_array);
					curl_helper($url, $field_string);
				}
				$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Limit updated successfully";
				$result = $tradeObj->updatelimitorderadmin($data['book_no']);
				$this->response(array(
						'success' => true,
						'message' =>  $message,
						'data' => $result
				), 200);

			} else {
				$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Update got failure. Please try again later";
				$this->response(array(
						'success' => false,
						'message' => $message,
						'data' => $result
				), 200);
			}		
		} else {
			$this->db->trans_rollback();
			$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Update got failure. Please try again later";
			$this->response(array(
					'success' => false,
					'message' => $message,
					'data' => $result
			), 200);
		}	
	}
	function notifyBooking_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$book_no =  $data['book_no'];

		if(is_numeric($book_no) && $book_no > 0)
		{
			$tradeObj = new Trading();
			$result  = $tradeObj->notifyBooking($book_no);
			if($result)
			{
				$message = "SMS and Email sent successfully.";
				$this->response(array(
						'success' => true,
						'message' => $message,
						'data' => []
				), 200);
			}
			else
			{
				$message = "Error occured. Please try again.";
				$this->response(array(
						'success' => false,
						'message' => $message,
						'data' => []
				), 200);
			}
		}
		else
		{
			$message = "Required fields are missing. Please try again.";
			$this->response(array(
					'success' => false,
					'message' => $message,
					'data' => []
			), 200);
		}
	}
	function trade_summery_get() {
		$cus_id = $this->get('cusid');
		if(is_numeric($cus_id) && $cus_id > 0) 
		{
			$tradeObj = new Trading();
			$result = $tradeObj->gettradesummery($cus_id);
			$message = 'Record reterived successfully';
			$this->response(array(
					'success' => true,
					'message' => $message,
					'data' => $result
			), 200);
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	function customerAllOpenorders_get() {
		$cus_id = $this->get('cusid');
		if(is_numeric($cus_id) && $cus_id > 0) 
		{
			$tradeObj = new Trading();
			$result = $tradeObj->getcustomerallopenorders($cus_id);
			$message = 'Record reterived successfully';
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	function customerOrderCancel_get() {
		$cus_id = $this->get('cusid');
		$orderid = $this->get('orderid');
		if(is_numeric($cus_id) && $cus_id > 0 && is_numeric($orderid) && $orderid > 0) 
		{
			$this->db->trans_begin();
			$tradeObj = new Trading();
			$result = $tradeObj->customerordercancel($cus_id, $orderid);
			if($result['status'] == 1)
			{
				$this->db->trans_commit();
				$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
				if($url != '')
				{
					$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
					$field_string = http_build_query($return_array);
					curl_helper($url, $field_string);
				}
				$result1 = $tradeObj->customerordercanceladmin($orderid);
				//$message = $result['message'];
				$message = 'Order Cancelled';
				$status = $result['status'];
				$this->response(array(
					'success' => true,
					'status'   => $status,
					'message' => $message
				), 200);
			}
			else
			{
				$this->db->trans_rollback();
				$message = $result['message'];
				$status = $result['status'];
				$this->response(array(
						'success' => false,
						'status'   => $status,
						'message' => $message
				), 200);
			}
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	function booking_report_get() {
		$cus_id 	= $this->get('cusid');
		$from 		= $this->get('from');
		$to 		= $this->get('to');
		$comtype	= $this->get('comtype');

		if(is_numeric($cus_id) && $cus_id > 0) 
		{
			$tradeObj = new Trading();
			$result = $tradeObj->getbookingreport($cus_id, $from, $to, $comtype);
			$message = "Records retrieved successfully.";
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	function order_report_get() {
		$cus_id 	= $this->get('cusid');
		$from 		= $this->get('from');
		$to 		= $this->get('to');
		$comtype	= $this->get('comtype');

		if(is_numeric($cus_id) && $cus_id > 0) 
		{
			$tradeObj = new Trading();
			$result = $tradeObj->getorderreport($cus_id, $from, $to, $comtype);
			$message = "Records retrieved successfully.";
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	function pendingdelv_report_get() {
		//$this->load->model("M_mobiletrade");
		$tradeObj = new Trading();
		$result = $tradeObj->getpendingdelvreport($this->get('cusid'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	function customer_transactions_get() {
		$cus_id 	= $this->get('cusid');

		if(is_numeric($cus_id) && $cus_id > 0) 
		{
			$tradeObj = new Trading();
			$result = $tradeObj->get_customertransactions($cus_id);
			$message = "Records retrieved successfully.";
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	function tradable_status_get() {
		$cus_id 	= $this->get('cusid');

		if(is_numeric($cus_id) && $cus_id > 0) 
		{
			$tradeObj = new Trading();
			$result = $tradeObj->gettradestaus($cus_id);
			$message = "Records retrieved successfully.";
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	function changePassword_post() {
		$clientdata = (array)json_decode(file_get_contents("php://input"));
		if($clientdata['userid'] != "" && $clientdata['oldpassword'] !="" && $clientdata['newpassword'] != "" && $clientdata['confirmpassword'] !="") {
			if($clientdata['newpassword'] == $clientdata['confirmpassword']) {
				$this->db->trans_begin();
				$tradeObj = new Trading();
				$result = $tradeObj->changePassword($clientdata);
				if($this->db->trans_status() === TRUE) {		
					if($result['status'] == 1) {
						$this->db->trans_commit();
						$message = 'Password changed successfully';
						$this->response(array(
									'success' => true,
									'message' => $message,
									'data' => []
							), 200);
					} else {
						$this->db->trans_rollback();
						$message = $result['error'];
						$this->response(array(
							'success' => false,
							'message' => $message,
							'data' => []
						), 200);
					}
				} else {
					$this->db->trans_rollback();
					$this->response(array(
									'success' => false,
									'message' => 'Can not update password now, Please try again',
									'data' => []
							), 200);
				}
			} else {
				$this->response(array(
								'success' => false,
								'message' => 'New password and Confirm password fields are mismatch',
								'data' => []
						), 200);
			}
		} else {
			$this->response(array(
								'success' => false,
								'message' => 'Please fill the all the fields',
								'data' => []
						), 200);
		}
	}
	function check_currentuser_session_post()
	{
		$clientdata = (array)json_decode(file_get_contents("php://input"));
		$cus_id 	= $this->get('cusid');

		if($clientdata['username'] != "" && $clientdata['imiecode'] != "" && $clientdata['uiidcode'] != "") 
		{
			$tradeObj = new Trading();
			$result = $tradeObj->check_currentuser_session($clientdata['username'],$clientdata['imiecode'],$clientdata['uiidcode']);
			$message = "Records retrieved successfully.";
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		}
		else 
		{
			$message = 'Required fields are missing. Please try again.';
			$this->response(array(
				'success' => false,
				'message' => $message,
				'data' => []
			), 200);
		}
	}
	
	function updateProfile_post() {
		$clientdata = (array)json_decode(file_get_contents("php://input"));
		$profiledata = array('cus_name' => $clientdata['name'], 'cus_company_name' => $clientdata['company'], 'cus_address' => $clientdata['address'], 'cus_email' => $clientdata['email']);

		$this->db->trans_begin();
		$tradeObj = new Trading();
		$result = $tradeObj->updateProfile($profiledata, $clientdata['userid']);
		if($this->db->trans_status()===TRUE) {
			$this->db->trans_commit();
			$message = 'Profile updated successfully';
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		} else {
			$this->db->trans_rollback();
			$message = 'Can not update profile now, Please try again';
			$this->response(array(
					'success' => false,
					'message' => $message,
					'data' => []
			), 200);
		}
	}
	function userdeviceregister_post() {
		$clientdata = (array)json_decode(file_get_contents("php://input"));
		$device_type = isset($clientdata['device_type']) ? $clientdata['device_type'] : 1;
		$this->db->trans_begin();
		$tradeObj = new Trading();
		$result = $tradeObj->user_device_register($clientdata['device_token'], $clientdata['device_uuid'], $device_type);
		if($this->db->trans_status()===TRUE) {
			$this->db->trans_commit();
			$message = 'Updated successfully';
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
		} else {
			$this->db->trans_rollback();
			$message = 'Can not update now, Please try again';
			$this->response(array(
					'success' => false,
					'message' => $message,
					'data' => []
			), 200);
		}
	}
	function MobileMessages_get() {
		$tradeObj = new Trading();
		$result = $tradeObj->get_mobilemessages();
		$message = 'Record retreived successfully.';
			$this->response(array(
				'success' => true,
				'message' => $message,
				'data' => $result
			), 200);
	}
	function getratealerttollarance_get() {
		if(!wincache_ucache_exists($this->config->item("alerttolerance"))){
			$tradeObj = new Trading();
			echo json_encode($tradeObj->get_alerttollarance());
		}else{
			echo json_encode(wincache_ucache_get($this->config->item("alerttolerance")));
		}
	}
	function ratealertlist_post(){
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata);
		$tradeObj = new Trading();
		$result = $tradeObj->getratealertlist($request->uuid);
		$this->response(array(
						'success' => true,
						'data' => $result
				), 200);
	}
	function advertisements_get(){
		$result = array();
		$tradeObj = new Trading();
		$result = $tradeObj->get_advertisements();
		$this->response(array(
						'success' => true,
						'data' => $result
				), 200);
	}
	function ratealertRequest_post(){
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata);
		$alertarray = array('alert_device' => $request->uuid,'alert_cusdeviceid' => isset($request->devicetoken) ? $request->devicetoken : time(), 'alert_datetime' => date('Y-m-d H:i:s'), 'alert_comid' => $request->comid, 'alert_rate' => $request->alertrate, 'alerttype' => $request->alerttype);
		$tradeObj = new Trading();
		$result = $tradeObj->ratealertRequest($alertarray);
		$this->response(array(
						'success' => true,
						'data' => $result
				), 200);
	}
	public function ratealertDelete_post(){
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata);
		$tradeObj = new Trading();
		$result = $tradeObj->ratealertDeleteRequest($request->alertId, $request->alertType, $request->comId, $request->deviceId);
		$this->response(array(
						'success' => true,
						'data' => $result
				), 200);
	}
	function ratehistory_report_get(){
		$tradeObj = new Trading();
		$result = $tradeObj->getratehistoryreport($this->get('from'), $this->get('to'));
		$message = 'Record retreived successfully.';
		$this->response(array(
						'success' => true,
						'message' => $message,
						'data' => $result
				), 200);
	}
	function dateratehistory_report_get(){
		$tradeObj = new Trading();
		$result = $tradeObj->getdateratehistoryreport($this->get('historydate'));
		$message = 'Record retreived successfully.';
		$this->response(array(
						'success' => true,
						'message' => $message,
						'data' => $result
				), 200);
	}
	function unfixreport_get() {
		//$this->load->model("M_mobiletrade");
		$tradeObj = new Trading();
		$result = $tradeObj->unfixreport($this->get('cusid'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
		function historical_report_get() {
		$this->load->model("M_mobiletrade");
		$result = $this->M_mobiletrade->gethistoricalreport($this->get('comid'), $this->get('from'), $this->get('to'));
		$this->response(array(
				'success' => true,
				'message' => 'Record reterived successfully',
				'data' => $result
		), 200);
	}
	
	public function chart_data_post(){
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata);
		$this->load->model("M_mobiletrade");
		
		switch($request->time_period) {
            case '30mins':
                $result = $this->M_mobiletrade->get_data_last_30_mins($request->hd_code);
                break;
			case '1hour':
				$result = $this->M_mobiletrade->get_data_last_1_hour($request->hd_code);
				break;
			case '12hour':
				$result = $this->M_mobiletrade->get_data_last_12_hour($request->hd_code);
				break;
            case '1day':
                $result = $this->M_mobiletrade->get_data_last_day($request->hd_code);
                break;
            case '7days':
                $result = $this->M_mobiletrade->get_data_last_7_days($request->hd_code);
                break;
            case '1year':
                $result = $this->M_mobiletrade->get_data_last_year($request->hd_code);
                break;
            case '5years':
                $result = $this->M_mobiletrade->get_data_last_5_years($request->hd_code);
                break;
            default:
                $result = [];
                break;
        }

		$this->response(array(
						'success' => true,
						'data' => $result
				), 200);
	}
}	
