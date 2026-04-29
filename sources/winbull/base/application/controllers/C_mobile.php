<?php
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');

class C_Mobile extends CI_Controller {
	const VERSIONCODE 		= '1';
	public function __construct()
	{
		parent::__construct();
		$this->load->database();
		date_default_timezone_set('Asia/Kolkata');
		$this->load->model('MLogin_model');
	}	
	function GetBooking($versioncode,$versionname)
	{
		$data = array();
		if($versioncode == self::VERSIONCODE && $versionname == Globals::$VERSIONNAME)
		{
			$booking = $this->MLogin_model->get_booking();
			$data = array('operationresult' => $booking,
						  'message' => ""
						);
		}else {
			$data = array('operationresult' => 2,
						  'message' => "New Version updated, Please update your application from google play"
						);
		}	
		echo json_encode($data);
	}
	function CheckAppVersion($versionname) {
		$data = array('success' => FALSE,
						  'message' => "Please update new version from play store"
						);
		echo json_encode($data);
	}
	function viewsettingsdata(){
		$responsedata = array();
		$updateAvail = false;
		$requestdata = (array)json_decode(file_get_contents("php://input"));
		
		$user_data_response = $this->MLogin_model->user_device_register($requestdata['pushToken'], $requestdata['uuid'], $requestdata['platform']);
		
		if($user_data_response['newuser']){
			if($requestdata['platform'] == 1){
				$updateAvail = !($requestdata['app_version'] == Globals::$VERSIONNAME || $requestdata['app_version'] == Globals::$NEWVERSIONNAME || $requestdata['app_version'] == Globals::$CURRENTVERSIONNAME);
				$otrrequired = Globals::$ANDROID_OTR;
				$userdeleteoption = Globals::$ANDROID_USERDELETE;
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'],  'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => 0, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol'],'user_data' => $user_data_response['userdetails']['user_data']);
			}else{
				$updateAvail = !($requestdata['app_version'] == Globals::$IOSVERSIONNAME || $requestdata['app_version'] == Globals::$IOSNEWVERSIONNAME);
				$otrrequired = Globals::$IOS_OTR;
				$userdeleteoption = Globals::$IOS_USERDELETE;
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'], 'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => 0, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol'],'user_data' => $user_data_response['userdetails']['user_data']);
			}
		}else{
			if($requestdata['platform'] == 1){
				$updateAvail = !($requestdata['app_version'] == Globals::$VERSIONNAME || $requestdata['app_version'] == Globals::$NEWVERSIONNAME || $requestdata['app_version'] == Globals::$CURRENTVERSIONNAME);
				$otrrequired = Globals::$ANDROID_OTR;
				$userdeleteoption = Globals::$ANDROID_USERDELETE;
				if($user_data_response['userdetails']['device_user_verified'] == 1){
					$registerstatus = 2; // Registration and OTP verified
				}else if($user_data_response['userdetails']['device_mobileno'] != NULL && $user_data_response['userdetails']['device_mobileno'] != ""){
					$registerstatus = 0; // Registered but not yet OTP verified
				}else{
					$registerstatus = 0; // Not yet register
				}
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'], 'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => $registerstatus, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol'],'user_data' => $user_data_response['userdetails']['user_data']);
			}else{
				$updateAvail = !($requestdata['app_version'] == Globals::$IOSVERSIONNAME || $requestdata['app_version'] == Globals::$IOSNEWVERSIONNAME);
				$otrrequired = Globals::$IOS_OTR;
				$userdeleteoption = Globals::$IOS_USERDELETE;
				if($user_data_response['userdetails']['device_user_verified'] == 1){
					$registerstatus = 2; // Registration and OTP verified
				}else if($user_data_response['userdetails']['device_mobileno'] != NULL && $user_data_response['userdetails']['device_mobileno'] != ""){
					$registerstatus = 1; // Registered but not yet OTP verified
				}else{
					$registerstatus = 0; // Not yet register
				}
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'], 'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => $registerstatus, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol'],'user_data' => $user_data_response['userdetails']['user_data']);
			}
		}
		if($updateAvail){
			if($requestdata['platform'] == 1){
				$responsedata['resultdata']['message'] 	= "New version update available, Please take from Play store.";
			}
			else{
				$responsedata['resultdata']['message'] 	= "New version update available, Please take from app store.";
			}
			$responsedata['resultdata']['title'] 	= "New version";
		}
		$contract_master = $this->MLogin_model->getContractMaster();
		$responsedata['resultdata']['contract'] = $contract_master;
		$responsedata['resultdata']['appurl']	= $requestdata['platform'] == 1 ? Globals::$androidUrl : Globals::$iosUrl;
		$responsedata['resultdata']['url']		=  Globals::$lsrateurl;
		$responsedata['resultdata']['adapter']	=  Globals::$lsrateadapter;
		$responsedata['resultdata']['provider']	=  Globals::$lsrateprovider;
		$responsedata['resultdata']['username']	=  Globals::$lsrateusernameapp;
		echo json_encode($responsedata);
	}
	function registeruserdata()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$email = isset($data['emailid']) ? $data['emailid'] : NULL;
		$company = isset($data['company']) ? $data['company'] : NULL;
		$location = isset($data['city']) ? $data['city'] : NULL;
		
		$otptoken  = $this->getotptoken();
		$userarray = array('device_uuid' => $data['uuid'], 'device_type' => $data['deviceType'], 'device_mobileno' => $data['mobile'], 'device_user_name' => $data['name'], 'device_user_company' => $company, 'device_user_email' => $email, 'device_user_location' => $location, 'device_user_otp' => $otptoken, 'device_token' => $data['pushToken']);
		
		$regdetails  = $this->MLogin_model->updateUserRegDetails($userarray);
		if($regdetails['status'] == 1)
		{
			$message = "Dear ".$data['name'].", Your one time registration OTP is: ".$otptoken;

			$resp = sms_notification_helper($data['mobile'], $message);

			echo json_encode(array(
					'success' => true,
					'otp'     => $otptoken,
					'message' => 'Your details updated successfully!, Please update received otp'
			), 200); // 200 being the HTTP response code
		}
		else
		{
			echo json_encode(array(
					'success' => false,
					'message' => $updateregid['error']
			), 200);
		}
	}
	public function verifyuserregotp() {
		$data = (array)json_decode(file_get_contents("php://input"));
		$regdetails  = $this->MLogin_model->checkUserRegOTP($data['deviceid'], $data['receivedotp']);
		if($regdetails['status'] == 1) {
			echo json_encode(array(
						'success' => true,
						'message' => 'Your account has been verified'
				), 200);
		}else {
			echo json_encode(array(
						'success' => false,
						'message' => $regdetails['error']
				), 200);
		}
		
	}
	public function resendotp() {
		$data = (array)json_decode(file_get_contents("php://input"));
		$resendotp  = $this->MLogin_model->getUserRegOTP($data['deviceid']);
		if($resendotp['status'] == 1) {
			$message = "Dear ".$resendotp['name'].", Your one time registration OTP is: ".$resendotp['token'];
			$resp = sms_notification_helper($resendotp['mobile'], $message);			
			echo json_encode(array(
						'success' => true,
						'otp'     => $resendotp['token'],
						'message' => 'OTP sent to your mobile, Please check and update!'
				), 200);
		}else {
			echo json_encode(array(
					'success' => false,
					'message' => $resendotp['error']
			), 200);
		}		
	}
	function Login_validation($username="",$password="", $imieno="")
	{
		$result = $this->MLogin_model->check_mobileuser($username,$password,$imieno);
		echo json_encode($result);
	}
	function terminate_usersession($username="", $code="", $imiecode="") {
		$result = $this->MLogin_model->terminate_existing_mobilesession($username,$code,$imiecode);
		if($result['operationresult'] == 1) {
			$timestamp = time();
			
			$updatedata['silver_lgd_ltp'] = $timestamp;
			$this->db->update('dt_rpanel',  $updatedata);
			
			$xmlDoc = new DOMDocument("1.0");
		    header("Content-Type:text/plain");
			$xmlDoc = simplexml_load_file("admin/rpanel_xml/vbrateXml.xml");			
			$xmlDoc->silver_lgd_ltp = $timestamp;
			$xmlDoc->asXML("admin/rpanel_xml/vbrateXml.xml");
		}
		echo json_encode($result);
	}	
	function check_currentuser_session($username="", $imiecode="", $uiidcode="")
	{
		$result = $this->MLogin_model->check_currentuser_mobilesession($username,$imiecode,$uiidcode);
		echo json_encode($result);
	}
	function logout($username="",$imie="",$uuid="")
	{
		$result = $this->MLogin_model->logout_mobileuser($username,$imie,$uuid);
		echo $result;
	}
	function getotptoken( $length = 5 )
	{
		//$alphabet = "ABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
		$alphabet = "0123456789";
		$pass     = array(); //remember to declare $pass as an array
		$alphaLength = strlen($alphabet) - 1; //put the length - 1 in cache
		for($i = 0; $i < $length; $i++)
		{
			$n = rand(0, $alphaLength);
			$pass[] = $alphabet[$n];
		}
		return implode($pass); //turn the array into a string
	}
	function checksettingsdata(){
		$responsedata = array();
		$updateAvail = false;
		$requestdata = (array)json_decode(file_get_contents("php://input"));
		$update_response = $this->MLogin_model->check_lastupdate($requestdata['updatetime']);
		if($update_response == 0){
			if($requestdata['platform'] == 1){
				$updateAvail = !($requestdata['app_version'] == Globals::$VERSIONNAME || $requestdata['app_version'] == Globals::$NEWVERSIONNAME || $requestdata['app_version'] == Globals::$CURRENTVERSIONNAME);
			}else{
				$updateAvail = !($requestdata['app_version'] == Globals::$IOSVERSIONNAME || $requestdata['app_version'] == Globals::$IOSNEWVERSIONNAME);	
			}
			$responsedata = $this->mobilechecksettings($requestdata);
			/* if($updateAvail){
				$responsedata = $this->mobilechecksettings($requestdata);
			}else{
				$responsedata['resultdata']['update']	= 0;
			} */
		}else{
			if($requestdata['platform'] == 1){
				$updateAvail = !($requestdata['app_version'] == Globals::$VERSIONNAME || $requestdata['app_version'] == Globals::$NEWVERSIONNAME || $requestdata['app_version'] == Globals::$CURRENTVERSIONNAME);
			}else{
				$updateAvail = !($requestdata['app_version'] == Globals::$IOSVERSIONNAME || $requestdata['app_version'] == Globals::$IOSNEWVERSIONNAME);	
			}
			$responsedata = $this->mobilechecksettings($requestdata);
			/* if($updateAvail){
				$responsedata = $this->mobilechecksettings($requestdata);
			}else{
				$responsedata['resultdata']['update']	= 0;
			} */
		}
		echo json_encode($responsedata);
	}
	function mobilechecksettings($requestdata){
		$updateAvail = false;
		$user_data_response = $this->MLogin_model->user_device_register($requestdata['pushToken'], $requestdata['uuid'], $requestdata['platform']);
		if($user_data_response['newuser']){
			if($requestdata['platform'] == 1){
				$updateAvail = !($requestdata['app_version'] == Globals::$VERSIONNAME || $requestdata['app_version'] == Globals::$NEWVERSIONNAME || $requestdata['app_version'] == Globals::$CURRENTVERSIONNAME);
				$otrrequired = Globals::$ANDROID_OTR;
				$userdeleteoption = Globals::$ANDROID_USERDELETE;
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'],  'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => 0, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol']);
			}else{
				$updateAvail = !($requestdata['app_version'] == Globals::$IOSVERSIONNAME || $requestdata['app_version'] == Globals::$IOSNEWVERSIONNAME);
				$otrrequired = Globals::$IOS_OTR;
				$userdeleteoption = Globals::$IOS_USERDELETE;
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'], 'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => 0, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol']);
			}
		}else{
			if($requestdata['platform'] == 1){
				$updateAvail = !($requestdata['app_version'] == Globals::$VERSIONNAME || $requestdata['app_version'] == Globals::$NEWVERSIONNAME || $requestdata['app_version'] == Globals::$CURRENTVERSIONNAME);
				$otrrequired = Globals::$ANDROID_OTR;
				$userdeleteoption = Globals::$ANDROID_USERDELETE;
				if($user_data_response['userdetails']['device_user_verified'] == 1){
					$registerstatus = 2; // Registration and OTP verified
				}else if($user_data_response['userdetails']['device_mobileno'] != NULL && $user_data_response['userdetails']['device_mobileno'] != ""){
					$registerstatus = 1; // Registered but not yet OTP verified
				}else{
					$registerstatus = 0; // Not yet register
				}
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'], 'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => $registerstatus, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol']);
			}else{
				$updateAvail = !($requestdata['app_version'] == Globals::$IOSVERSIONNAME || $requestdata['app_version'] == Globals::$IOSNEWVERSIONNAME);
				$otrrequired = Globals::$IOS_OTR;
				$userdeleteoption = Globals::$IOS_USERDELETE;
				if($user_data_response['userdetails']['device_user_verified'] == 1){
					$registerstatus = 2; // Registration and OTP verified
				}else if($user_data_response['userdetails']['device_mobileno'] != NULL && $user_data_response['userdetails']['device_mobileno'] != ""){
					$registerstatus = 1; // Registered but not yet OTP verified
				}else{
					$registerstatus = 0; // Not yet register
				}
				$responsedata['resultdata'] = array('updateAvail' => $updateAvail, 'updatetime' => $user_data_response['userdetails']['updatetime'], 'otrrequired' => $otrrequired, 'userdeleteoption' => $userdeleteoption, 'registerstatus' => $registerstatus, 'loginview' => $user_data_response['userdetails']['admin_booking'], 'showpopup' => $user_data_response['userdetails']['showpopup'], 'popupimage' => $user_data_response['userdetails']['popupimage'], 'goldhigh_tol' => $user_data_response['userdetails']['goldhigh_tol'], 'goldlow_tol' => $user_data_response['userdetails']['goldlow_tol'], 'silverhigh_tol' => $user_data_response['userdetails']['silverhigh_tol'], 'silverlow_tol' => $user_data_response['userdetails']['silverlow_tol']);
			}
		}
		if($updateAvail){
			if($requestdata['platform'] == 1){
				$responsedata['resultdata']['message'] 	= "New version update available, Please take from Play store.";
			}
			else{
				$responsedata['resultdata']['message'] 	= "New version update available, Please take from app store.";
			}
			$responsedata['resultdata']['title'] 	= "New version";
		}
		$contract_master = $this->MLogin_model->getContractMaster();
		$responsedata['resultdata']['contract'] = $contract_master;
		$responsedata['resultdata']['appurl'] 	= $requestdata['platform'] == 1 ? Globals::$androidUrl : Globals::$iosUrl;
		$responsedata['resultdata']['url']		=  Globals::$lsrateurl;
		$responsedata['resultdata']['adapter']	=  Globals::$lsrateadapter;
		$responsedata['resultdata']['provider']	=  Globals::$lsrateprovider;
		$responsedata['resultdata']['username']	=  Globals::$lsrateusernameapp;
		$responsedata['resultdata']['update']	= 1;
		return $responsedata;
	}

	public function enquiry_mail(){

		$requestdata = (array)json_decode(file_get_contents("php://input"));
		$Cust_name 	  = $requestdata['name'];
		$Cust_email   = $requestdata['emailid'];
		$Cust_add  	  = $requestdata['address'];
		$Cust_phone   = "";
		$Cust_mobile  = $requestdata['mobile'];
		$Cust_enq     = $requestdata['message'];
		if(trim($Cust_name) != "" && trim($Cust_mobile) != "" && trim($Cust_enq) !== ""){
		$msg =
		'<div style="width:670px;margin:5px;padding:20px;border:5px solid #FCBB4D">
		<table width="670" >
			<tr>
				<td style="padding:12px">
					<div>
					<h3>MAIL ENQUIRY</h3>
					 <b style="padding:1px 7px;">Details of the person:</b> 
					 <br>
					 <br>
					<div style="padding-left:40px">
					<table>
					<tr>
					<th style="background: #fde480;font-size: 0.9em;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;border:1px solid #f3c510;width:20%;text-align:left;padding:1px 7px;">Customer Name:</th>
					<td style="padding:1px 7px;">'.$Cust_name.'</td>
					</tr>
					<tr>			
					<th style="background: #fde480;font-size: 0.9em;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;border:1px solid #f3c510;width:20%;text-align:left;padding:1px 7px;">Customer Address:</th>
					<td style="padding:1px 7px;">'.$Cust_add.'</td>
					</tr>
					
					<tr>			
					<th style="background: #fde480;font-size: 0.9em;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;border:1px solid #f3c510;width:20%;text-align:left;padding:1px 7px;">Mobile No:</th>
					<td style="padding:1px 7px;">'.$Cust_mobile .'</td>
					</tr>
					<tr>
					<th style="background: #fde480;font-size: 0.9em;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;border:1px solid #f3c510;width:20%;text-align:left;padding:1px 7px;">Email:</th>
					<td style="padding:1px 7px;">'.$Cust_email.'</td>
					</tr>
					<tr>	
					<th style="background: #fde480;font-size: 0.9em;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;border:1px solid #f3c510;width:20%;text-align:left;padding:1px 7px;">Comments:</th>
					<td style="padding:1px 7px;">'.$Cust_enq.'</td>
					</tr>
					</table>
					</div>
					</div>
				</td>
			</tr>
		</table>
		</div>';

		$mail_det = $this->MLogin_model->enquiry_mail_details();
		// print_r($mail_det);exit;
			
		$subject    = "Enquiry from MobileApp!- ".$_SERVER['SERVER_NAME'];
		$mail_server = $mail_det['admin_mail_server'];
		$mail_password = $mail_det['admin_mail_password'];
		$email_to=$mail_det['admin_mail'];
		$company_name=$mail_det['admin_company_name'];
		// $mail_server = 'yuvaraj@vikashinfosolutions.com';
		// $mail_password = 'Lmx@2020';
		// $email_to= 'prabakaran@logimaxindia.com';
		// $company_name='Ganapathy Bullion';
				
				$config = Array(
					  'protocol'  => 'smtp',
					  'smtp_host' => 'ssl://smtp.googlemail.com',
					  'smtp_port' => 465,
					  'smtp_user' => $mail_server,
					  'smtp_pass' => $mail_password,
					  'mailtype'  => 'html', 
					  'charset'   => 'iso-8859-1'
					);
					$this->load->library('email', $config);
					$this->email->set_newline("\r\n");	    
					$this->email->from($mail_server, $company_name);
					$this->email->to($email_to); 			
					$this->email->subject($subject);
					$this->email->message($msg);
					if($this->email->send()) 
		{
			$msg_status="Thanks! Your message has been submitted successfully...";
			echo json_encode(array('status' => 1, 'success' => TRUE, 'message' => $msg_status));
		}
		else
		{
			$msg_status="Error in submitting your enquiry.Please try again later...!";
			echo json_encode(array('status' => 0, 'success' => FALSE, 'message' => $msg_status));
		}
		}else{
			$msg_status="Error in submitting your enquiry.Please fill all the required fields and try again ...!";
			echo json_encode(array('status' => 0, 'success' => FALSE, 'message' => $msg_status));
		}
	}
}


/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */
?>