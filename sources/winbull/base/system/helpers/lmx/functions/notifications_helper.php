<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * SMS/Email/Whatsapp/Mobile Notification Helpers
 *
 * @package		CodeIgniter
 * @subpackage	Helpers
 * @category	Helpers
 * @author		Logimax Team
 */

// ------------------------------------------------------------------------

if ( ! function_exists('sms_notification_helper')) {
	/**
	 * Send SMS for the given no 
	 *
	 * @param 	string $mobile
	 * @param 	string $message
	 * @return	bool
	 */
	function sms_notification_helper($mobile, $message)
	{
		$smsApi  = smsapi_helper();
		$sms_url = trim($smsApi['sas_url']);
		$generalSettings = generalentry_helper();
		$auth_key 	= trim($generalSettings['admin_sms_authkey']);
		$sender_id 	= trim($generalSettings['admin_sms_senderid']);
		$mobile 	= trim($mobile);
		$message 	= trim($message);
		if($sms_url != '' && $auth_key != '' && $sender_id != "" && $mobile != "" && $message != "") {
			$arr = array("@@authkey@@" => $auth_key,"@@mobileno@@" => $mobile,"@@message@@" => $message,"@@sender_id@@" => $sender_id);
			$user_sms_url = strtr($sms_url,$arr);
			curl_helper($user_sms_url, $user_sms_url);
			$result = true;
		} else {
			if($sms_url == '' || $auth_key == '' || $sender_id == '' || $mobile == '' || $message == '')
				log_message("error", (__METHOD__).". Msg : Required fields are missing.");
			$result = false;
		}
		return $result;
	}
	function sms_notification_dlt_helper($mobile, $message, $dlt_id)
	{
		$smsApi  = smsapi_helper();
		$sms_url = trim($smsApi['sas_url']);
		$generalSettings = generalentry_helper();
		$auth_key 	= trim($generalSettings['admin_sms_authkey']);
		$sender_id 	= trim($generalSettings['admin_sms_senderid']);
		$mobile 	= trim($mobile);
		$message 	= trim($message);
		if($sms_url != '' && $auth_key != '' && $sender_id != "" && $mobile != "" && $message != "") {
			$arr = array("@@authkey@@" => $auth_key,"@@mobileno@@" => $mobile,"@@message@@" => $message,"@@sender_id@@" => $sender_id,"@@dlt_id@@" => $dlt_id);
			$user_sms_url = strtr($sms_url,$arr);
			curl_helper($user_sms_url, $user_sms_url);
			$result = true;
		} else {
			if($sms_url == '' || $auth_key == '' || $sender_id == '' || $mobile == '' || $message == '')
				log_message("error", (__METHOD__).". Msg : Required fields are missing.");
			$result = false;
		}
		return $result;
	}
}

if ( ! function_exists('email_notification_helper')) {
	/**
	 * Send Email for the given email 
	 *
	 * @param 	string $email
	 * @param 	string $subject
	 * @param 	string $message
	 * @return	bool
	 */
	function email_notification_helper($email_to, $subject, $message, $email_cc = "")
	{
		// Get a reference to the object
		$CI = get_instance();

		$email_to = trim($email_to);
		$subject = trim($subject);
		$message = trim($message);

		if($email_to != '' && $subject != '' && $message != "")  {
			$htmlMessage =  mail_htmlContent_helper($message);
			$e_return 	 =  send_email_helper($email_to, $subject, $htmlMessage, $email_cc);
			$result = $e_return;
		} else {
			if($email_to == '' || $subject == '' || $message == '')
			log_message("error", (__METHOD__).". Msg : Required fields are missing.");
			$result = false;
		}
		return $result;
	}
}

if ( ! function_exists('whatsapp_notification_helper')) {
	/**
	 * Send whatsapp message for the given whatsapp number
	 *
	 * @param 	array $whatsappdata
	 * @return	bool
	 */
	function whatsapp_notification_helper($whatsappdata) {
		// Get a reference to the object
		$CI = get_instance();

		$whatsappurl = Globals::$whatsappurl;
		if($whatsappurl != "") {
			$ch = curl_init();
			curl_setopt_array($ch, array(
			CURLOPT_URL => $whatsappurl,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => "",
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => "POST",
			CURLOPT_POSTFIELDS => json_encode($whatsappdata),
			CURLOPT_HTTPHEADER => array(
				"authorization: Basic cHJlY2lzZXRyYTpIaXJoTmwxMA==",
				"cache-control: no-cache",
				"content-type: application/json"
			),
			));

			$response = curl_exec($ch);
			if (curl_errno($ch)) {
				$error_msg = curl_error($ch);
				log_message("error", (__METHOD__).". Data: ".json_encode($whatsappdata)." Response: ".$response." Msg: ".$error_msg);
			}
			curl_close($ch);
			$result = true;
		} else {
			log_message("error", (__METHOD__).". Msg : Required fields are missing.");
			$result = false;
		}
		return $result;
	}
}

if ( ! function_exists('whatsapp_message_helper')) {
	/**
	 * Send whatsapp message for the given whatsapp number
	 *
	 * @param 	array $whatsappdata
	 * @return	bool
	 */
	function whatsapp_message_helper($phone, $message, $type=1) {
		// Get a reference to the object
		$CI = get_instance();

		$whatsappurl = Globals::$whatsappurl;
		if($type == 1){
			$whatsappurl = $whatsappurl."sendText?token=".Globals::$instanceid."&phone=91".$phone."&message=".urlencode($message);
		}
		if($whatsappurl != "") {
			$ch = curl_init();
			curl_setopt_array($ch, array(
			CURLOPT_URL => $whatsappurl,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => "",
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => "GET",
			CURLOPT_HTTPHEADER => array(
				"authorization: Basic cHJlY2lzZXRyYTpIaXJoTmwxMA==",
				"cache-control: no-cache",
				"content-type: application/json"
			),
			));

			$response = curl_exec($ch);
			if (curl_errno($ch)) {
				$error_msg = curl_error($ch);
				// log_message("error", (__METHOD__).". Data: ".json_encode($whatsappdata)." Response: ".$response." Msg: ".$error_msg);
			}
			curl_close($ch);
			$result = true;
		} else {
			log_message("error", (__METHOD__).". Msg : Required fields are missing.");
			$result = false;
		}
		return $result;
	}
}

if ( ! function_exists('push_notification_helper')) {
	/**
	 * Send mobile notification for the given ids
	 *
	 * @param 	array $registrationId
	 * @param   string $subject
	 * @param   string $message
	 * @return	void
	 */
	function push_notification_helper($fields) {

		$authorize = Globals::$onesignalauth;
		$onesignalAPI = isset(Globals::$onesignalAPI) ? Globals::$onesignalAPI : '';
		$fields = json_encode($fields);

		if($authorize != "" && $onesignalAPI != "" && $fields != "")
		{
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $onesignalAPI);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
													'Authorization: Basic '.$authorize));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
			curl_setopt($ch, CURLOPT_HEADER, FALSE);
			curl_setopt($ch, CURLOPT_POST, TRUE);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
			$response = curl_exec($ch);
			if (curl_errno($ch)) {
				$error_msg = curl_error($ch);
				log_message("error", (__METHOD__).". PostData: ".$fields." Response: ".$response." Msg: ".$error_msg);
			}
			curl_close($ch);

		} else {
			log_message("error", (__METHOD__).". Msg: Required fields are missing");
		}
	}
}

if ( ! function_exists('curl_helper')) {
	/**
	 * Call url through cURL 
	 *
	 * @param string $ch_url
	 * @param string $field_string
	 * @return string $response
	 */
	function curl_helper($ch_url, $field_string)
	{
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $ch_url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string);
		$response = curl_exec($ch);
		if (curl_errno($ch)) {
			$error_msg = curl_error($ch);
			log_message("error", (__METHOD__).". URL: ".$ch_url." FieldString: ".$field_string." Response: ".$response." Msg: ".$error_msg);
		}
		curl_close($ch);
		return $response;
	}
}

if ( ! function_exists('curlhttp_helper')) {
	/**
	 * Call url through cURL 
	 *
	 * @param string $ch_url
	 * @param string $field_string
	 * @return string $response
	 */
	function curlhttp_helper($ch_url, $field_string)
	{
		$curl = curl_init();
		curl_setopt_array($curl, array(
		CURLOPT_URL => $ch_url,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_ENCODING => "",
		CURLOPT_MAXREDIRS => 10,
		CURLOPT_TIMEOUT => 0,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		CURLOPT_CUSTOMREQUEST => "POST",
		CURLOPT_POSTFIELDS => $field_string,
		CURLOPT_HTTPHEADER => array(
			"Content-Type: application/json"
			),
		));
		$response = curl_exec($curl);
		if (curl_errno($curl)) {
			$error_msg = curl_error($curl);
			log_message("error", (__METHOD__).". URL: ".$ch_url." FieldString: ".$field_string." Response: ".$response." Msg: ".$error_msg);
		}
		curl_close($curl);
	}
}