<?php if (! defined('BASEPATH')) exit('No direct script access allowed');
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
require APPPATH . '/libraries/REST_Controller.php';

class C_mobileclient extends REST_Controller
{
	const VERSIONCODE = '1';
	const VERSIONNAME = '1.2.9';
	const NEWVERSIONNAME = '1.2.9';
	function __construct()
	{
		header('Access-Control-Allow-Origin: *');
		header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
		header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
		$method = $_SERVER['REQUEST_METHOD'];
		if ($method == "OPTIONS") {
			exit();
		}
		// Construct our parent class
		parent::__construct();
		ini_set('date.timezone', 'Asia/Calcutta');
		$this->response->format = 'json';
	}
	function CheckAppVersion_get()
	{
		$versionname = $this->get('version');
		if ($versionname == self::VERSIONNAME || $versionname == self::NEWVERSIONNAME) {
			$data = array(
				'success' => TRUE,
				'message' => ""
			);
		} else {
			$data = array(
				'success' => FALSE,
				'message' => "Please update new version from play store"
			);
		}
		echo json_encode($data);
	}
	function user_login_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->load->model('M_mobileclient');
		$this->load->model('M_mobiletrade');
		$result = $this->M_mobileclient->check_mobileuser($data['username'], $data['password'], $data['imieno'], $data['pushToken']);
		if ($result['status'] == 1) {
			$trade_comm = "";

			$profile = $this->M_mobileclient->get_customerprofile($data['username']);
			if ($result['operationresult'] == 1) {
				$trade_comm = $this->M_mobiletrade->gettradecommodities($result['usercode']);
			}
			$this->response(array(
				'success' => true,
				'message' => $result['message'],
				'data' => $result,
				'profile' => $profile,
				'trade_comm' => $trade_comm
			), 200);
		} else {
			$this->response(NULL, 400);
		}
	}
	function terminate_usersession_post()
	{
		$trade_comm = "";
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->load->model('M_mobileclient');
		$this->load->model('M_mobiletrade');
		$result = $this->M_mobileclient->terminate_existing_mobilesession($data['username'], $data['code'], $data['imieno']);
		if ($result['operationresult'] == 1) {
			$timestamp = time();
			$updatedata['silver_lgd_ltp'] = $timestamp;
			$this->db->update('dt_rpanel',  $updatedata);

			ini_set('allow_url_fopen ', 'ON');
			$xmlDoc = new DOMDocument("1.0");
			header("Content-Type:text/plain");
			$xmlDoc = simplexml_load_file($_SERVER['DOCUMENT_ROOT'] . "/admin/rpanel_xml/rateXml.xml");
			$xmlDoc->silver_lgd_ltp = $timestamp;
			$xmlDoc->asXML($_SERVER['DOCUMENT_ROOT'] . "/admin/rpanel_xml/rateXml.xml");

			$profile = $this->M_mobileclient->get_customerprofile($data['username']);
			$trade_comm =  $this->M_mobiletrade->gettradecommodities($result['usercode']);

			$this->response(array(
				'success' => true,
				'message' => $result['message'],
				'data' => $result,
				'profile' => $profile,
				'trade_comm' => $trade_comm
			), 200);
		} else if ($result['operationresult'] == 0) {
			$this->response(array(
				'success' => true,
				'message' => $result['message'],
				'data' => $result,
				'trade_comm' => $trade_comm
			), 200);
		} else {
			$this->response(NULL, 400);
		}
	}
	function user_sessioncheck_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
	}
	function user_registration_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->load->model('M_mobileclient');
		$errors = $this->validate_registration($data);
		if ($errors == '') {
			$userdata = array('cus_name' => $data['name'], 'cus_mobile' => $data['mobile'], 'cus_whatsapp' => $data['mobile'], 'cus_company_name' => $data['company'], 'cus_login_name' => $data['mobile'], 'cus_login_password' => $data['password'], 'confirmpassword' => $data['confirmpassword'], 'cus_email' => $data['email'], 'cus_sec_code' => isset($data['seccode']) ? $data['seccode'] : NULL, 'cus_panno' => isset($data['Pan_no']) ? $data['Pan_no'] : NULL, 'cus_gstno' => isset($data['company_GST']) ? $data['company_GST'] : NULL/* ,'cus_tcstds' => isset($data['options']) ? $data['options'] : NULL */, 'cus_address' => $data['cus_address']);

			$OTP = mt_rand(1001, 9999);
			// $service_id = "11";
			// $resultset = $this->db->query("SELECT sms_content, sms_footer,sms_dlt_te_id from dt_sms_settings where service_id = '" . $service_id . "'");
			// foreach ($resultset->result() as $row) {
			// 	$sms_content = $row->sms_content;
			// 	$sms_footer = $row->sms_footer;
			// 	$dlt_id = $row->sms_dlt_te_id;
			// }
			// $resultset->free_result();
			// $messagesms = $OTP . " is your OTP for registration with " . $_SERVER['HTTP_HOST'] . ". Please use this code to verify your mobile number. Regards, " . Globals::$web_title . ".";
			// $messagesms = urlencode($messagesms);
			// $resp = sms_notification_dlt_helper("91" . $data['mobile'], $messagesms, $dlt_id);

			 $message = $OTP . " is your OTP for registration with " . $_SERVER['HTTP_HOST'] . ". Please use this code to verify your mobile number.";

			$resp = sms_notification_helper($data['mobile'], $message);
			$resp = whatsapp_message_helper($data['mobile'], $message);

			$to_emailid  = $data['email'];
			$htmlMessage = "<p>Dear " . $data['name'] . ",<p>You are required to verify your email by entering the below One Time Password in registration form.</p><p>Your OTP is <b>" . $OTP . "</b><p></br>";
			$e_subject = "Email verification from " . Globals::$web_title . ".";

			if (isset($to_emailid)) {
				if (strlen($to_emailid) > 0) {
					$email_resp = email_notification_helper($to_emailid, $e_subject, $htmlMessage);
				}
			}

			$this->response(array(
				'success'  => true,
				'message'  => 'OTP has been sent to your Mobile No/ Email Id',
				'newotp'   => $OTP,
				'userdata' => $userdata
			), 200);
		} else {
			$this->response(array(
				'success' => false,
				'message' => rtrim($errors, ','),
				'userdata' => ""
			), 200);
		}
	}
	function validate_registration($data)
	{
		$errors = '';
		$model_name = 'M_mobileclient';
		$this->load->model("M_mobileclient");
		if (trim($data['name']) == '' || trim($data['email']) == '' || trim($data['company']) == '' || trim($data['mobile']) == '' || trim($data['password']) == '' || trim($data['confirmpassword']) == '') {
			$errors = $errors . "Please fill the required fields,";
		} else {
			if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
				$errors = $errors . " Not a valid email format,";
			} else {
				if ($this->$model_name->check_email(trim($data['email']))) {
					$errors = $errors . " Email Id already registered.Enter different email,";
				}
			}
			if (strlen($data['mobile']) > 20 || !preg_match('/^([0-9]*)$/', $data['mobile'])) {
				$errors = $errors . " Mobile No is not valid,";
			} else {
				if ($this->$model_name->check_mobileno($data['mobile'])) {
					$errors = $errors . " Mobile number already registered.Enter different number,";
				}
			}
			if ($this->validate_password($data['password'])) {
				$errors = $errors . " Password must have minimum 6 characters,";
			}
			if ($data['password'] != $data['confirmpassword']) {
				$errors = $errors . " Password and confirm password should be same,";
			}
			if ($data['company_GST'] != '') {
				if (!preg_match("/^([0-9]){2}([A-Za-z]){5}([0-9]){4}([A-Za-z]){1}([0-9A-Za-z]{3})?$/", $data['company_GST'])) {
					$errors = $errors . " Invalid GST number,";
				}
			}
			if ($data['Pan_no'] != '') {
				if (!preg_match("/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/", $data['Pan_no'])) {
					$errors = $errors . "Invalid PAN number.";
				}
			}
		}

		return trim($errors);
	}
	function validate_password($password)
	{
		//$r1='/[A-Z]/';  //Uppercase
		//$r2='/[a-z]/';  //lowercase
		//$r3='/[!@#$%^&*()\-_=+{};:,<.>]/';  // whatever you mean by 'special char'
		// $r4='/[0-9]/';  //numbers

		// if(!preg_match($r1,$password)) return true;

		// if(!preg_match($r2,$password)) return true;

		//if(preg_match_all($r3,$password, $o)<2) return false;

		// if(!preg_match($r4,$password)) return true;

		if (strlen($password) < 6) return true;

		return false;
	}
	function resendotp_get()
	{
		$mobile = $this->get('mobile');
		$email = $this->get('email');
		if ($mobile != "") {
			$OTP = mt_rand(1001, 9999);
			$service_id = "11";
			$resultset = $this->db->query("SELECT sms_content, sms_footer,sms_dlt_te_id from dt_sms_settings where service_id = '" . $service_id . "'");
			foreach ($resultset->result() as $row) {
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
				$dlt_id = $row->sms_dlt_te_id;
			}
			$resultset->free_result();
			$messagesms = $OTP . " is your OTP for registration with " . $_SERVER['HTTP_HOST'] . ". Please use this code to verify your mobile number. Regards, " . Globals::$web_title . ".";
			$messagesms = urlencode($messagesms);
			$mobile = preg_replace('/\D/', '', $mobile);
			$resp = sms_notification_dlt_helper("91" . $mobile, $messagesms, $dlt_id);


			$message = $OTP . " is your OTP for registration with " . $_SERVER['HTTP_HOST'] . ". Please use this code to verify your mobile number.";
			$resp = sms_notification_helper(trim($mobile, '""'), $message);
			$resp = whatsapp_message_helper(trim($mobile, '""'), $message);
			$to_emailid  = $email;
			$htmlMessage = "<p>Dear " . $data['name'] . ",<p>You are required to verify your email by entering the below One Time Password in registration form.</p><p>Your OTP is <b>" . $OTP . "</b><p></br>";
			$e_subject = "Email verification from " . Globals::$web_title . ".";

			if (isset($to_emailid)) {
				if (strlen($to_emailid) > 0) {
					$email_resp = email_notification_helper($to_emailid, $e_subject, $htmlMessage);
				}
			}

			$this->response(array(
				'success' => true,
				'message' => 'OTP has been sent to your Mobile No/ Email Id',
				'newotp' => $OTP
			), 200);
		} else {
			$this->response(array(
				'success' => false,
				'message' => 'Please try again'
			), 200);
		}
	}
	function user_registration_withotp_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));

		$userreg_data = (array)json_decode($data['userdata']);
		$this->load->model('M_mobileclient');
		$validate_data = array('name' => $userreg_data['cus_name'], 'mobile' => $userreg_data['cus_mobile'], 'company' => $userreg_data['cus_company_name'], 'password' => $userreg_data['cus_login_password'], 'confirmpassword' => $userreg_data['confirmpassword'], 'email' => $userreg_data['cus_email'], 'company_GST' => isset($userreg_data['cus_gstno']) ? $userreg_data['cus_gstno'] : NULL, 'Pan_no' => isset($userreg_data['cus_panno']) ? $userreg_data['cus_panno'] : NULL);
		// print_r($userreg_data);exit;
		$errors = $this->validate_registration($validate_data);


		if ($errors == '') {
			if ($data['receivedotp'] == $data['verifyotp']) {
				$this->load->model('M_mobileclient');
				$userdata = array('cus_name' => $userreg_data['cus_name'], 'cus_mobile' => $userreg_data['cus_mobile'], 'cus_whatsapp' => $userreg_data['cus_mobile'], 'cus_company_name' => $userreg_data['cus_company_name'], 'cus_login_name' => $userreg_data['cus_login_name'], 'cus_login_password' => $userreg_data['cus_login_password'], 'cus_email' => $userreg_data['cus_email'], 'cus_sec_code' => isset($userreg_data['cus_sec_code']) ? $userreg_data['cus_sec_code'] : NULL, 'cus_panno' => isset($userreg_data['cus_panno']) ? $userreg_data['cus_panno'] : NULL, 'cus_gstno' => isset($userreg_data['cus_gstno']) ? $userreg_data['cus_gstno'] : NULL/* ,'cus_tcstds' => isset($userreg_data['cus_tcstds']) ? $userreg_data['cus_tcstds'] : NULL */);

				$this->db->trans_begin();

				// print_r($userdata);exit;

				$result = $this->M_mobileclient->create_customer($userdata);
				if ($this->db->trans_status() === TRUE) {
					$this->db->trans_commit();
					if ($result['status'] == 1) {
						$this->response(array(
							'success' => true,
							'message' => $result['message'],
						), 200);
					} else {
						$this->response(array(
							'success' => false,
							'message' => $result['message'],
						), 200);
					}
				} else {
					$this->db->trans_rollback();
					$this->response(array(
						'success' => false,
						'message' => "Please try again",
					), 200);
				}
			} else {
				$this->db->trans_rollback();
				$this->response(array(
					'success' => false,
					'message' => "OTP mismatch, Please enter a valid otp",
				), 200);
			}
		} else {
			$this->response(array(
				'success' => false,
				'message' => rtrim($errors, ',')
			), 200);
		}
	}
	function forgotPassword_post()
	{
		$userdata = (array)json_decode(file_get_contents("php://input"));
		if ($userdata['username'] != '') {
			$this->load->model('M_mobileclient');
			$userid = $this->M_mobileclient->GetCustomerID($userdata['username']);
			if ($userid != NULL) {
				$sms_url = $this->M_mobileclient->get_SMSURL(7, $userid);
				if ($sms_url != '') {
					// print_r($sms_url);exit;
					$curl_resp = curl_helper($sms_url, $sms_url);
				}

				// if ($sms_url != '') {
				// 	//$curl_resp = curl_helper($sms_url, $sms_url);
				// }

				$whatsapp_url = $this->M_mobileclient->get_whatsappURL(7, $userid);
				if (isset($whatsapp_url['mobile'])) {

					if (strlen($whatsapp_url['mobile']) > 0) {
						$resp = whatsapp_message_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['message']);
					}
				}

				$data = $this->M_mobileclient->get_EmailContent(7, $userid);

				if (isset($data['email_id'])) {

					if (strlen($data['email_id']) > 0) {
						$email_resp = email_notification_helper($data['email_id'], $data["email_subject"], $data['email_content']);
					}
				}

				$this->response(array(
					'success' => true,
					'message' => 'Your password will be sent to your Whatsapp mobile number / Email ID'
				), 200);
			} else {
				$this->response(array(
					'success' => false,
					'message' => 'Please enter valid Mobile No'
				), 200);
			}
		} else {
			$this->response(array(
				'success' => false,
				'message' => 'Please enter Mobile No'
			), 200);
		}
	}
	function changePassword_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
	}
	function logout_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->load->model('M_mobileclient');
		$result = $this->M_mobileclient->logout_mobileuser($data['username'], $data['imieno'], $data['uuid']);
		if ($result['status'] == 1) {
			$this->response(array(
				'success' => true,
				'message' => $result['message'],
				'data' => $result
			), 200);
		} else if ($result['status'] == 0) {
			$this->response(array(
				'success' => true,
				'message' => $result['message'],
				'data' => $result
			), 200);
		} else {
			$this->response(NULL, 400);
		}
	}
	function MarqueNews_get()
	{
		$this->load->model('M_mobileclient');
		$result = $this->M_mobileclient->get_MarqueNews();
		$this->response(array(
			'success' => true,
			'data' => $result
		), 200);
	}
	function userviewbylogin_get()
	{
		$this->load->model('M_mobileclient');
		$result = $this->M_mobileclient->get_userviewbylogin();
		$this->response(array(
			'success' => true,
			'data' => $result
		), 200);
	}
	function mobilenumbervalidation_get()
	{
		$this->load->model('M_mobileclient');
		$result = $this->M_mobileclient->get_mobilenumberavailability($this->get('mobile'));
		//$this->response($result, 200);
		$this->response(array(
			'success' => true,
			'data' => $result
		), 200);
	}
	function checkusername_get()
	{
		$this->load->model('M_mobileclient');
		$result = $this->M_mobileclient->checkusername($this->get('username'));
		$this->response(array(
			'success' => true,
			'data' => $result
		), 200);
	}
	function userdata_get()
	{
		$this->response(array(
			'success' => true,
			'message' => 'Logged in successful.'
		), 200);
	}
	function mobilemessages_get()
	{
		$messages = array();
		$this->load->model('M_mobileclient');
		$result = $this->M_mobileclient->get_mobilemessages();
		$this->response(array(
			'success' => true,
			'data' => $result
		), 200);
	}
}
