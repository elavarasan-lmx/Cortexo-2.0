<?php
class M_mobileclient extends CI_Model {
	
	function __construct() {
		parent::__construct();
		$this->load->helper('common');
		$this->load->helper('field_labels');
	}
	
	// Logging methods
	public function log_mobile_login_attempt($username, $status, $ip_address = '') {
		$module_name = 'Mobile User Login';
		$log_type = 'Authentication';
		
		$description = 'Mobile - Mobile login attempt for username: ' . $username . ' - Status: ' . $status;
		if (!empty($ip_address)) {
			$description .= ' - IP: ' . $ip_address;
		}
		
		$log_data = array(
			'username' => $username,
			'status' => $status,
			'ip_address' => $ip_address,
			'timestamp' => date('Y-m-d H:i:s')
		);
		
		return log_admin_add($log_type, $module_name, $log_data, $description);
	}
	
	public function log_mobile_logout($username, $ip_address = '') {
		$module_name = 'Mobile User Logout';
		$log_type = 'Authentication';
		
		$description = 'User - Mobile logout for username: ' . $username;
		if (!empty($ip_address)) {
			$description .= ' - IP: ' . $ip_address;
		}
		
		$log_data = array(
			'username' => $username,
			'ip_address' => $ip_address,
			'timestamp' => date('Y-m-d H:i:s')
		);
		
		return log_admin_add($log_type, $module_name, $log_data, $description);
	}
	
	function get_booking() {
		$booking_flag = 0;			
		$resultset = $this->db->query("select admin_booking from dt_admin_user where admin_user_id='1'");
		foreach ($resultset->result() as $row) {
			$booking_flag = $row->admin_booking;
		}
		$resultset->free_result();
		return $booking_flag;
	}
	public function check_mobileuser($username, $password, $imieno, $token) 										//Fetch entry record
	{
		//Build contents query
		$data = array();
		$resultset = $this->db->query("select * from dt_customer where cus_login_name='".$username."' and cus_login_password='".$password."'");
		if($resultset->num_rows() == 1)
		{
			foreach ($resultset->result() as $row)
			{
				//checking for whether the user status is active
				if($row->cus_active==1) {
					//checking for whether the user is a life time membet
					if($row->cus_is_life_time==1) {
						$cus_group_query = $this->db->query("SELECT cus_id, cus_name,prem_group_name as prem_group from dt_customer 
								LEFT JOIN dt_customergroupitems as dtc ON cgitems_cusid = cus_id LEFT JOIN dt_prem_group_master ON prem_group_id = cgitems_comgroupid 
								where cgitems_cusid =".$row->cus_id);
						//$group_name = $cus_group_query->row()->groupname;
						$prem_group = $cus_group_query->row()->prem_group;

						$uuid	= uniqid();
						$data = array(
							'status' => 1,
							'usercode' => $row->cus_id,
							'operationresult' => 1,
							'message' => "Logged in sucessfully",
							'uuid'	=> $uuid,
							'prem_group' => $prem_group

						);
						
						$u_data = array(
									   'cus_uuid' => $uuid,
									   'cus_imiecode' => $imieno
									);
						$this->db->where('cus_login_name', $username);
						$this->db->update('dt_customer', $u_data);
						$this->db->update('dt_user_device', array('device_user_id' => $row->cus_id), array('device_token' => $token));
						
						// Log successful login
						$this->log_mobile_login_attempt($username, 'Success (lifetime)', $_SERVER['REMOTE_ADDR']);
					//checking for whether the user validation period is expired or not	
					} else if(date("Y-m-d") <= $row->cus_valid_till) {

						$cus_group_query = $this->db->query("SELECT cus_id, cus_name,prem_group_name as prem_group from dt_customer 
								LEFT JOIN dt_customergroupitems as dtc ON cgitems_cusid = cus_id LEFT JOIN dt_prem_group_master ON prem_group_id = cgitems_comgroupid 
								where cgitems_cusid =".$row->cus_id);
						//$group_name = $cus_group_query->row()->groupname;
						$prem_group = $cus_group_query->row()->prem_group;

						$uuid	= uniqid();
						$data = array(
							'status' => 1,
							'error' => '',
							'usercode' => $row->cus_id,
							'operationresult' => 1,
							'message' => "Logged in sucessfully",
							'uuid'	=> $uuid,
							'prem_group' => $prem_group

							
						);
						
						$u_data = array(
									   'cus_uuid' => $uuid,
									   'cus_imiecode' => $imieno
									);
						$this->db->where('cus_login_name', $username);
						$this->db->update('dt_customer', $u_data);
						$this->db->update('dt_user_device', array('device_user_id' => $row->cus_id), array('device_token' => $token));
						
						// Log successful login
						$this->log_mobile_login_attempt($username, 'Success (timed)', $_SERVER['REMOTE_ADDR']);

					}else{
						$data = array(
								'status' => 1,
								'error' => '',
								'usercode' => $row->cus_id,
								'operationresult' => 3,
								'message' => "Account Expired.Please contact administrator.",
								'uuid'	=> '',
								'prem_group' => ''

								
							);
						// Log failed login - account expired
						$this->log_mobile_login_attempt($username, 'Failed - Account expired', $_SERVER['REMOTE_ADDR']);
					}	
				}else {
					$data = array(
								'status' => 1,
								'error' => '',
								'usercode' => '',
								'operationresult' => 0,
								'message' => "Your account not yet activated. Please try again later.",
								'uuid'	=> '',
								'prem_group' => ''

								
							);
					// Log failed login - account inactive
					$this->log_mobile_login_attempt($username, 'Failed - Account inactive', $_SERVER['REMOTE_ADDR']);
				}
			}
		}else {
			$data = array(
						'status' => 1,
						'error' => '',
						'usercode' => '',
						'operationresult' => 0,
						'message' => "Please Enter Valid User Name / Password",
						'uuid'	=> '',
						'prem_group' => ''

						
					);
			// Log failed login - invalid credentials
			$this->log_mobile_login_attempt($username, 'Failed - Invalid credentials', $_SERVER['REMOTE_ADDR']);
		}

		return $data;
	}			
	public function check_mobileuser_status($user_name,$imieno) {
		$resultset = $this->db->query("select * from dt_usersessions where user_data like '%".$user_name."%'");
		$query	= $this->db->query("SELECT ifnull(cus_imiecode,'') as cus_imiecode,ifnull(cus_uuid,'') as cus_uuid from dt_customer where cus_login_name = '".$user_name."'");
			
			if($resultset->num_rows() == 1 or ($query->row()->cus_imiecode != $imieno && $query->row()->cus_uuid !='')) {				
				return true;
			}
			return false;
	}
	
	public function check_currentuser_mobilesession($username,$imiecode,$uuid)
	{
		$data = array();
		$query	= $this->db->query("SELECT * FROM dt_customer where cus_login_name = '".$username."' AND cus_imiecode = '".$imiecode."' AND cus_uuid='".$uuid."'");
		if($query->num_rows() == 1){
			$data  = array('operationresult' => 1,'message' => "");
		}else {
			$data = array('operationresult' => 0,'message' => "Some one logged in with your credentials in another device");
		}
		
		return $data;
	}
	public function logout_mobileuser($username,$imieno,$uuidno)
	{
		// Log the mobile logout
		$this->log_mobile_logout($username, $_SERVER['REMOTE_ADDR']);
		
		$result = array();
		$query = $this->db->query("update dt_customer set cus_uuid='' where cus_login_name ='".$username."'");
		//return $this->db->affected_rows();
		if($this->db->affected_rows() == 1) {
			$result = array('status' => 1, 'error' => '', 'success' => TRUE, 'message' => 'Logged out successfully');
		} else {
			$result = array('status' => 0, 'error' => '', 'success' => FALSE, 'message' => 'Can not log out now');
		}
		return $result;
		
	}
	public function terminate_existing_mobilesession($user_name,$sec_code,$imie_no)
	{
		$data = array();
		$resultset = $this->db->query("select * from dt_customer where cus_sec_code='".$sec_code."' and cus_login_name='".$user_name."'");
		if($resultset->num_rows() == 1) {
			//echo $this->session->userdata('username');
			$query = $this->db->query("delete from dt_usersessions where user_data like '%".$user_name."%'");
			
			 $cus_group_query = $this->db->query("SELECT  replace(com_group_name,' ','_') as groupname FROM
												dt_customergroupitems 
												LEFT JOIN dt_com_group_master ON com_group_id = cgitems_comgroupid 
												WHERE cgitems_cusid =".$resultset->row()->cus_id);
							$group_name = $cus_group_query->row()->groupname;
			
			$uuid	= uniqid();
			$data = array(
				'usercode' => $resultset->row()->cus_id,
				'operationresult' => 1,
				'message' => "Logged in sucessfully",
				'uuid'	=> $uuid,
				'group_name' => $group_name
			);
			$u_data = array(
						   'cus_uuid' => $uuid,
						   'cus_imiecode' => $imie_no
						);
			$this->db->where('cus_login_name', $user_name);
			$this->db->update('dt_customer', $u_data);
			
			// Log session termination and new login
			$this->log_mobile_login_attempt($user_name, 'Session Terminated and Re-logged', $_SERVER['REMOTE_ADDR']);
		}else {
			$data = array(
				'usercode' => '',
				'operationresult' => 0,
				'message' => "Please Enter Valid User Name / Code",
				'uuid'	=> '',
				'group_name' => ''
			);
			// Log failed termination attempt
			$this->log_mobile_login_attempt($user_name, 'Failed - Invalid termination code', $_SERVER['REMOTE_ADDR']);
		}
		return $data;
	}
	public function create_customer($fv)
    {
		$returndata = array();

		$fv['cus_register_on']      =    date('Y-m-d H:i:s');
		$fv['cus_regtype']			= 	 0;
		$fv['cus_valid_till']    	=    date('Y-m-d', strtotime('+1 Week'));
		$fv['cus_is_life_time']  	=    0;
		$fv['cus_active']        	=	 0;
		if($this->db->insert('dt_customer', $fv)) {
		   $cus_id                				 =        $this->db->insert_id();
		   $cgrpitems['cgitems_cgrpid']          =        1;
		   $cgrpitems['cgitems_cusid']           =        $cus_id;
		   $cgrpitems['cgitems_comgroupid']      =        1;
		   if($this->db->insert("dt_customergroupitems",$cgrpitems)) {
				$returndata = array('status' => 1, 'error' => '', 'success' => TRUE, 'message' => 'Successfully registered, kindly wait for Account Activation');
		   } else {
				$returndata = array('status' => 0, 'error' => mysql_error(), 'success' => FALSE, 'message' => 'User registration failed');
		   }
		} else {
			$returndata = array('status' => 0, 'error' => mysql_error(), 'success' => FALSE, 'message' => 'User registration failed');
		}

		return $returndata;
    }
	public function GetCustomerID($username) 
	{
		$resultset = $this->db->query("SELECT cus_id FROM dt_customer WHERE cus_login_name='".$username."'");
		if($resultset->num_rows() == 1){
			return $resultset->row()->cus_id;
		}else {
			return NULL;
		}
	}
	function get_whatsappURL($service_id, $cus_id) {
		//Declaration of variables
		$sms_url ="";
		$sms_status = 0;
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$mobil_no = "";
		$customer_data = array();
		//Retriving SMS service for registration confirmation
		$resultset = $this->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled

		if($sms_status == 1) {
			$resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active, (select admin_company_name from dt_generalsettings) as admin_company_name from dt_customer where cus_id = '".$cus_id."'");
			
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile);
			$mobil_no = $customer_data->cus_mobile;
			//Retriving message content
			$resultset = $this->db->query("SELECT sms_content, sms_footer from dt_sms_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
			}
			$resultset->free_result();

			//Generating Message content
			$field_name = explode('@@', $sms_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) {
				if(isset($customer_data->{$field_name[$i]})) { 
					$sms_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$sms_content);					
				}	
			}
			$field_name_footer = explode('@@', $sms_footer);	
			for($i=1; $i < count($field_name_footer); $i+=2) {
				if(isset($customer_data->{$field_name_footer[$i]})) { 
					$sms_footer = str_replace("@@".$field_name_footer[$i]."@@",$customer_data->{$field_name_footer[$i]},$sms_footer);					
				}	
			}
			$sms_content .= " ".$sms_footer;	
						
		}
		//Returning generated SMS URL
		return array('message' => $sms_content, 'mobile' => $mobil_no);
	}
	public function get_EmailContent($service_id, $cus_id) {
		//Declaration of variables
		$email_content ="";
		$email_status = 0;
		$email_id = 1; //Send SMS		
		$email_signature = "";
		$customer_data = array();
		//Retriving EMail service for registration confirmation
		$resultset = $this->db->query("SELECT serv_email FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$email_status = $row->serv_email;
		}
		$resultset->free_result();
		//Checking EMail service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled

		if($email_status == 1) {

			$resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active, (select admin_company_name from dt_generalsettings) as admin_company_name from dt_customer where cus_id = '".$cus_id."'");
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			$return_data["email_id"] = 	$customer_data->cus_email;		
			//Retriving message content
			$resultset = $this->db->query("SELECT email_content, email_signature from dt_email_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$email_content = $row->email_content;
				$email_signature = $row->email_signature;
			}
			$resultset->free_result();
			//Generating Message content
			$field_name = explode('@@', $email_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) {
				if(isset($customer_data->{$field_name[$i]})) { 
					$email_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$email_content);					
				}	
			}
			$field_name_sig = explode('@@', $email_signature);	
			for($i=1; $i < count($field_name_sig); $i+=2) {
				if(isset($customer_data->{$field_name_sig[$i]})) { 
					$email_signature = str_replace("@@".$field_name_sig[$i]."@@",$customer_data->{$field_name_sig[$i]},$email_signature);					
				}	
			}
			$return_data["email_subject"] = $email_signature;	
			$return_data["email_content"] = $email_content;
		}
		
		//Returning generated EMail Content
		return isset($return_data) ? $return_data : '';
	}
	
	function get_SMSURL($service_id, $cus_id) {
		//Declaration of variables
		$sms_url ="";
		$sms_status = 0;
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$customer_data = array();
		//Retriving SMS service for registration confirmation
		$resultset = $this->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled

		if($sms_status == 1) {
			$resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active, (select admin_company_name from dt_generalsettings) as admin_company_name from dt_customer where cus_id = '".$cus_id."'");
			
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			//Retriving message content
			$resultset = $this->db->query("SELECT sms_content, sms_footer,sms_dlt_te_id from dt_sms_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
				$sms_dlt_te_id = $row->sms_dlt_te_id;
			}
			$resultset->free_result();
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile, $sms_dlt_te_id);

			//Generating Message content
			$field_name = explode('@@', $sms_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) {
				if(isset($customer_data->{$field_name[$i]})) { 
					$sms_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$sms_content);					
				}	
			}
			$field_name_footer = explode('@@', $sms_footer);	
			for($i=1; $i < count($field_name_footer); $i+=2) {
				if(isset($customer_data->{$field_name_footer[$i]})) { 
					$sms_footer = str_replace("@@".$field_name_footer[$i]."@@",$customer_data->{$field_name_footer[$i]},$sms_footer);					
				}	
			}
			$sms_content .= " ".$sms_footer;	
			$sms_content = urlencode($sms_content);
			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);				
		}
		//Returning generated SMS URL
		return $sms_url;
	}
	function get_SMSAppSettings($sms_id, $mobile_no, $dlt_id="") {
		//Declaring variables
		$sms_returnurl = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";
		
		//Fetching SMS App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id='".$sms_id."'");
		foreach($result_set->result() as $row) {
			$sms_returnurl = $row->sas_url;			
		}
		$result_set->free_result();	
		
		//Fetching SMS App user name, password and sender id
		$result_set = $this->db->query("select admin_sms_username, admin_sms_authkey, admin_sms_senderid from dt_generalsettings");
		if($result_set->num_rows() > 0) {
			$sms_username	= $result_set->row()->admin_sms_username;
			$sms_authkey	= $result_set->row()->admin_sms_authkey;
			$sms_senderid	= $result_set->row()->admin_sms_senderid;			
		}
		$result_set->free_result();			
		
		//Generating SMS Url with User Name, Password and Sender ID
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@authkey@@", $sms_authkey, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", "91".$mobile_no, $sms_returnurl);
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
		$sms_returnurl = str_replace("@@dlt_id@@", $dlt_id, $sms_returnurl);

		//returning gererated URL
		return 	$sms_returnurl;
	}
	function get_MarqueNews(){
		$result = array();
		$resultset = $this->db->query("SELECT (SELECT mrq_text FROM dt_marqueetext WHERE mrq_active = 1 LIMIT 1) AS marque,(SELECT news FROM dt_news LIMIT 1) AS news");
		foreach ($resultset->result() as $row)
		{
			$result['marque']	 = $row->marque;
			$result['news']      = $row->news;
		}
		return $result;
	}
	function get_userviewbylogin(){
		$result = array();
		$resultset = $this->db->query("SELECT admin_booking FROM dt_generalsettings");
		if($resultset->num_rows() >0){
			$result = array('admin_booking' => $resultset->row()->admin_booking, 'success' => true);
		}
		$resultset->free_result();
		return $result;
	}
	function get_mobilenumberavailability($mobile){
		$result = array();
		$resultset = $this->db->query("SELECT cus_mobile FROM dt_customer WHERE cus_mobile ='".$mobile."'");
		 if($resultset->num_rows() == 0){
			$result = array('success' => TRUE);
		}else{
			$result = array('success' => FALSE);
		}
		$resultset->free_result();
		return $result;
	}
	function checkusername($username){
		$result = array();
		$query = $this->db->query("select cus_login_name from dt_customer where cus_login_name='".$username."'");
		if($query->num_rows() == 0)
		{
			$result = array('success' => TRUE);
		}else{
			$result = array('success' => FALSE);
		}
		$query->free_result();
		return $result;
	}
	function get_customerprofile($username)
	{
		$result = array();
		$resultset = $this->db->query("SELECT cus_company_name, cus_mobile, cus_address, cus_email, cus_name, cus_city FROM dt_customer WHERE cus_login_name = $username");
		foreach ($resultset->result() as $row)
		{
			$result['cus_company_name']	 = $row->cus_company_name;
			$result['cus_mobile']      	 = $row->cus_mobile;
			$result['cus_address']	 	 = $row->cus_address;
			$result['cus_email']      	 = $row->cus_email;
			$result['cus_name']	 		 = $row->cus_name;
			$result['cus_city']	 		 = $row->cus_city;
		}
		return $result;
	}
	function get_mobilemessages()
	{
		$resultdata = array();
		$message_query = $this->db->query("SELECT news_id, newstitle, newsshortdesc, news, date_format(updatetime, '%d-%m-%Y %h:%i:%s') as updatetime FROM dt_news WHERE status = 1 ORDER BY news_id DESC");
		if($message_query->num_rows() >0){
			foreach($message_query->result() as $row){
				$resultdata[] = array('messageid' => $row->news_id, 'newsshortdesc' => $row->newsshortdesc, 'newstitle' => $row->newstitle, 'messages' => urlencode($row->news), 'lastupdate' => $row->updatetime);
			}
		}
		return $resultdata;
	}
	function check_mobileno($mobile = "")
	{
		$resultset = $this->db->query("select * from dt_customer where cus_mobile='".$mobile."' OR cus_login_name='".$mobile."'");
		if ($resultset->num_rows() > 0)	{
			return 1;
		}
		else {
			return 0;
		}
	}
	function check_email($email = "")
	{
		$resultset = $this->db->query("select * from dt_customer where cus_email='".$email."'");
		if ($resultset->num_rows() > 0)	{
			return 1;
		}
		else {
			return 0;
		}
	}
}
?>
