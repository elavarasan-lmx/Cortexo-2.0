<?php
class MLogin_model extends CI_Model
{
	/*var $table_name = 'dt_marqueetext';	*/					//Initialize table Name

	public function __construct() {
		parent::__construct();
		$this->load->helper('common');
		$this->load->helper('field_labels');
	}

	/* function MLogin_model() {
		parent::Model();
	} */
	function get_booking()
	{
		$booking_flag = 0;
		$resultset = $this->db->query("select admin_booking from dt_admin_user where admin_user_id='1'");
		foreach ($resultset->result() as $row) {
			$booking_flag = $row->admin_booking;
		}
		$resultset->free_result();
		return $booking_flag;
	}
	public function check_mobileuser($username, $password, $imieno) 										//Fetch entry record
	{
		//Build contents query
		$data = array();
		$resultset = $this->db->query("select * from dt_customer where cus_login_name='" . $username . "' and cus_login_password='" . $password . "'");
		if ($resultset->num_rows == 1) {
			foreach ($resultset->result() as $row) {
				//checking for whether the user status is active
				if ($row->cus_active == 1) {

					//checking for whether the user is a life time membet
					if ($row->cus_is_life_time == 1) {
						// checking for where the user is already logged in or not
						if ($this->check_mobileuser_status($username, $imieno)) {
							$data = array(
								'usercode' => '',
								'operationresult' => 2,
								'message' => "Please teriminate previous logged in",
								'uuid'	=> ''
							);
							// Log failed login attempt
							$this->log_add(array('username' => $username, 'status' => 'Failed - Session exists (lifetime)'), 'User - Failed mobile login attempt for username: ' . $username . ' - Session exists (lifetime)');
						} else {
							$uuid	= uniqid();
							$data = array(
								'usercode' => $row->cus_id,
								'operationresult' => 1,
								'message' => "Logged in sucessfully",
								'uuid'	=> $uuid
							);

							$u_data = array(
								'cus_uuid' => $uuid,
								'cus_imiecode' => $imieno
							);
							$this->db->where('cus_login_name', $username);
							$this->db->update('dt_customer', $u_data);
							
							// Log successful login
							$this->log_add(array('username' => $username, 'status' => 'Success (lifetime)'), 'User - Successful mobile login for username: ' . $username . ' (lifetime account)');
						}
						//checking for whether the user validation period is expired or not	
					} else if (date("Y-m-d") <= $row->cus_valid_till) {
						// checking for where the user is already logged in or not
						if ($this->check_mobileuser_status($username, $imieno)) {
							$data = array(
								'usercode' => '',
								'operationresult' => 2,
								'message' => "Please teriminate previous logged in",
								'uuid'	=> ''
							);
							// Log failed login attempt
							$this->log_add(array('username' => $username, 'status' => 'Failed - Session exists (timed)'), 'User - Failed mobile login attempt for username: ' . $username . ' - Session exists (timed)');
						} else {
							$uuid	= uniqid();
							$data = array(
								'usercode' => $row->cus_id,
								'operationresult' => 1,
								'message' => "Logged in sucessfully",
								'uuid'	=> $uuid
							);

							$u_data = array(
								'cus_uuid' => $uuid,
								'cus_imiecode' => $imieno
							);
							$this->db->where('cus_login_name', $username);
							$this->db->update('dt_customer', $u_data);
							
							// Log successful login
							$this->log_add(array('username' => $username, 'status' => 'Success (timed)'), 'User - Successful mobile login for username: ' . $username . ' (timed account)');
						}
					}
				} else {
					// Log failed login attempt - inactive account
					$this->log_add(array('username' => $username, 'status' => 'Failed - Account inactive'), 'User - Failed mobile login attempt for username: ' . $username . ' - Account inactive');
				}
			}
		} else {
			$data = array(
				'usercode' => '',
				'operationresult' => 0,
				'message' => "Please Enter Valid User Name / Password",
				'uuid'	=> ''
			);
			// Log failed login attempt - invalid credentials
			$this->log_add(array('username' => $username, 'status' => 'Failed - Invalid credentials'), 'User - Failed mobile login attempt for username: ' . $username . ' - Invalid credentials');
		}
		return $data;
	}
	public function check_mobileuser_status($user_name, $imieno)
	{
		//echo "dfsfdfs     ".$this->input->post('user_name')."  ".$this->session->userdata('session_id');
		$resultset = $this->db->query("select * from dt_usersessions where user_data like '%" . $user_name . "%'");
		$query	= $this->db->query("SELECT ifnull(cus_imiecode,'') as cus_imiecode,ifnull(cus_uuid,'') as cus_uuid from dt_customer where cus_login_name = '" . $user_name . "'");

		if ($resultset->num_rows == 1 or ($query->row()->cus_imiecode != $imieno && $query->row()->cus_uuid != '')) {
			return true;
		}
		return false;
	}

	public function check_currentuser_mobilesession($username, $imiecode, $uuid)
	{
		$data = array();
		$query	= $this->db->query("SELECT * FROM dt_customer where cus_login_name = '" . $username . "' AND cus_imiecode = '" . $imiecode . "' AND cus_uuid='" . $uuid . "'");
		if ($query->num_rows() == 1) {
			$data  = array('operationresult' => 1, 'message' => "");
		} else {
			$data = array('operationresult' => 0, 'message' => "Some one logged in with your credentials in another device");
		}

		return $data;
	}
	public function logout_mobileuser($username, $imieno, $uuidno)
	{
		// Get the record before updating for logging purposes
		$this->db->select('cus_id, cus_uuid, cus_imiecode');
		$this->db->where(array('cus_login_name' => $username, 'cus_imiecode' => $imieno, 'cus_uuid' => $uuidno));
		$query = $this->db->get('dt_customer');
		$old_record = array();
		if ($query->num_rows() > 0) {
			$old_record = $query->row_array();
		}
		
		$query = $this->db->query("update dt_customer set cus_uuid='' where cus_login_name ='" . $username . "' AND cus_imiecode = '" . $imieno . "' AND cus_uuid='" . $uuidno . "'");
		
		// Log the edit operation
		if ($this->db->affected_rows() > 0) {
			$new_record = array('cus_uuid' => '');
			$this->log_edit($old_record, array_merge($old_record, $new_record), 'User - Logged out mobile user: ' . $username);
		}
		
		return $this->db->affected_rows();
	}
	public function terminate_existing_mobilesession($user_name, $sec_code, $imie_no)
	{
		$data = array();
		$resultset = $this->db->query("select * from dt_customer where cus_sec_code='" . $sec_code . "' and cus_login_name='" . $user_name . "'");
		if ($resultset->num_rows() == 1) {
			// Get the record before updating for logging purposes
			$old_record = $resultset->row_array();
			
			//echo $this->session->userdata('username');
			$query = $this->db->query("delete from dt_usersessions where user_data like '%" . $user_name . "%'");

			$uuid	= uniqid();
			$data = array(
				'usercode' => $resultset->row()->cus_id,
				'operationresult' => 1,
				'message' => "Logged in sucessfully",
				'uuid'	=> $uuid
			);
			$u_data = array(
				'cus_uuid' => $uuid,
				'cus_imiecode' => $imie_no
			);
			$this->db->where('cus_login_name', $user_name);
			if ($this->db->update('dt_customer', $u_data)) {
				// Log the edit operation
				$this->log_edit($old_record, array_merge($old_record, $u_data), 'User - Terminated existing mobile session for user: ' . $user_name);
			}
		} else {
			$data = array(
				'usercode' => '',
				'operationresult' => 0,
				'message' => "Please Enter Valid User Name / Code",
				'uuid'	=> ''
			);
		}
		return $data;
	}
	function check_lastupdate($lastupdate)
	{
		$returndata = 0;
		$resultset = $this->db->query("SELECT lastupdate FROM dt_generalsettings");
		if ($resultset->num_rows() > 0) {
			if ($resultset->row()->lastupdate == $lastupdate) {
				$returndata = 1;
			}
		}
		return $returndata;
	}
	function user_device_register($regid, $uuid, $type)
	{
		$response_data = array();
		$query = $this->db->query("SELECT * FROM dt_user_device WHERE device_token ='" . $regid . "'");
		//updateUserRegDetails
		$user_data = array();
		if ($query->num_rows() > 0) {
			$response_data['newuser'] = FALSE;
			$user_data = array("device_token" => $query->row()->device_token, "device_uuid" => $query->row()->device_uuid, "device_mobileno" => $query->row()->device_mobileno, "device_user_name" => $query->row()->device_user_name, "device_user_email" => $query->row()->device_user_email, "device_user_company" => $query->row()->device_user_company, "device_user_location" => $query->row()->device_user_location);
		} else {
			if ($this->db->insert('dt_user_device', array('device_token' => $regid, 'device_uuid' => $uuid, 'device_type' => $type))) {
				$response_data['newuser'] = TRUE;
			}
		}
		$resultset = $this->db->query("SELECT admin_booking, gold_tol, silver_tol, lastupdate,pop_active, ifnull(pop_image,'') as popimage FROM dt_generalsettings, dt_popup WHERE pop_active = 1 ORDER BY pop_id DESC LIMIT 1");

		$gold_high_tol = 0;
		$gold_low_tol = 0;
		$silver_high_tol = 0;
		$silver_low_tol = 0;
		if ($resultset->num_rows() > 0) {
			if (!empty(explode("#", $resultset->row()->gold_tol)) && sizeof(explode("#", $resultset->row()->gold_tol)) == 2) {
				$gold_high_tol 	= explode("#", $resultset->row()->gold_tol)[0];
				$gold_low_tol 	= explode("#", $resultset->row()->gold_tol)[1];
			}
			if (!empty(explode("#", $resultset->row()->silver_tol)) && sizeof(explode("#", $resultset->row()->silver_tol)) == 2) {
				$silver_high_tol 	= explode("#", $resultset->row()->silver_tol)[0];
				$silver_low_tol 	= explode("#", $resultset->row()->silver_tol)[1];
			}
			$showpopup = $resultset->row()->popimage == "" ? 0 : 1;

			if ($resultset->row()->pop_active == 1) {
				$popupimage = $resultset->row()->popimage == "" ? "#" : $this->config->item('base_url') . "admin/assets/img/popup/" . $resultset->row()->popimage;
			} else {
				$popupimage = $resultset->row()->popimage == "" ? "#" : "";
			}
			// print_r($popupimage);exit;  
			$response_data['userdetails'] = array('admin_booking' => $resultset->row()->admin_booking, 'updatetime' =>  $resultset->row()->lastupdate, 'showpopup' => $showpopup, 'popupimage' => $popupimage, 'goldhigh_tol' => $gold_high_tol, 'goldlow_tol' => $gold_low_tol, 'silverhigh_tol' => $silver_high_tol, 'silverlow_tol' => $silver_low_tol, 'device_mobileno' => $query->row()->device_mobileno, 'device_user_otp' => $query->row()->device_user_otp, 'device_user_verified' => $query->row()->device_user_verified, 'user_data' => $user_data);
		} else {
			$generaldataset = $this->db->query("SELECT admin_booking, gold_tol, silver_tol, lastupdate FROM dt_generalsettings");

			$response_data['userdetails'] = array('admin_booking' => 0, 'showpopup' => 0, 'popupimage' => '#', 'goldhigh_tol' => $gold_high_tol, 'goldlow_tol' => $gold_low_tol, 'silverhigh_tol' => $silver_high_tol, 'updatetime' =>  $generaldataset->row()->lastupdate, 'silverlow_tol' => $silver_low_tol, 'device_mobileno' => $query->row()->device_mobileno, 'device_user_otp' => $query->row()->device_user_otp, 'device_user_verified' => $query->row()->device_user_verified, 'user_data' => $user_data);
		}
		return $response_data;
	}
	function updateUserRegDetails($regdetails)
	{
		$query = $this->db->query("SELECT * FROM dt_user_device WHERE device_uuid='" . $regdetails['device_uuid'] . "'");
		if ($query->num_rows() > 0) {
			// Get the record before updating for logging purposes
			$old_record = $query->row_array();
			if ($this->db->update('dt_user_device', $regdetails, array('device_uuid' => $regdetails['device_uuid']))) {
				// Log the edit operation
				$this->log_edit($old_record, $regdetails, 'User - Updated user device registration details for device UUID: ' . $regdetails['device_uuid']);
				$data['status'] = 1;
				$data['error'] = 'Registration Successfull, Please update OTP';
			}
		} else {
			if ($this->db->insert('dt_user_device', $regdetails)) {
				// Log the add operation
				$this->log_add($regdetails, 'User - Added new user device registration for device UUID: ' . $regdetails['device_uuid']);
				$data['status'] = 1;
				$data['error'] = 'Registration Successfull, Please update OTP';
			} else {
				$data['status'] = 0;
				$data['error'] = mysqli_error();
			}
		}
		return $data;
	}
	function checkUserRegOTP($deviceuuid, $otp)
	{
		$data = array();
		$this->db->select('device_token, device_uuid, device_user_otp, device_mobileno, device_user_email');
		$this->db->where(array('device_uuid'  => $deviceuuid, 'device_user_otp' => $otp));
		$query = $this->db->get('dt_user_device');
		if ($query->num_rows() == 1) {
			// Get the record before updating for logging purposes
			$old_record = $query->row_array();
			$new_record = array('device_user_verified' => 1, 'verifiedon' => date('Y-m-d H:i:s'));
			if ($this->db->update('dt_user_device', $new_record, array('device_uuid' => $deviceuuid, 'device_user_otp' => $otp))) {
				// Log the edit operation
				$this->log_edit($old_record, array_merge($old_record, $new_record), 'User - Verified user OTP for device UUID: ' . $deviceuuid);
				$data = array('status' => 1, 'error' => mysqli_error(), 'mobile' => $query->row()->device_mobileno, 'email' => $query->row()->device_user_email);
			} else {
				$data = array('status' => 0, 'error' => mysqli_error());
			}
		} else {
			$data = array('status' => 0, 'error' => 'Please enter valid OTP');
		}
		return $data;
	}
	function getUserRegOTP($deviceUUId)
	{
		$data = array();
		$this->db->select('device_mobileno, device_user_otp, device_user_name, device_otp_count, device_user_email');
		$this->db->where(array('device_uuid'  => $deviceUUId));
		$query = $this->db->get('dt_user_device');
		if ($query->num_rows() == 1) {
			// Get the record before updating for logging purposes
			$old_record = $query->row_array();
			if ($query->row()->device_otp_count <= 5) {
				$new_otp_count = $query->row()->device_otp_count + 1;
				if ($this->db->update('dt_user_device', array('device_otp_count' => $new_otp_count))) {
					// Log the edit operation
					$this->log_edit($old_record, array_merge($old_record, array('device_otp_count' => $new_otp_count)), 'User - Updated OTP count for device UUID: ' . $deviceUUId);
					$data = array('status' => 1, 'error' => mysqli_error(), 'token' => $query->row()->device_user_otp, 'name' => $query->row()->device_user_name, 'mobile' => $query->row()->device_mobileno, 'email' => ($query->row()->device_user_email == "" || $query->row()->device_user_email == NULL) ? NULL : $query->row()->device_user_email);
				} else {
					$data = array('status' => 0, 'error' => 'You requested OTP more than 5 times');
				}
			} else {
				$data = array('status' => 0, 'error' => 'You requested OTP more than 5 times');
			}
		} else {
			$data = array('status' => 0, 'error' => 'Invalid device');
		}
		return $data;
	}
	function getContractMaster()
	{
		$resultset = $this->db->query("select contract_id, contract_symbol,userpage_displayname,round_off from dt_contractmaster");

		foreach ($resultset->result() as $row) {
			$data[] = array("contract_id" => $row->contract_id, "contract_symbol" => $row->contract_symbol, "userpage_displayname" => $row->userpage_displayname, "round_off" => $row->round_off);
		}
		$resultset->free_result();
		return $data;
	}

	function enquiry_mail_details()
	{
		$query = $this->db->query("SELECT admin_company_name,admin_mail_server,admin_mail_password,admin_mail FROM dt_generalsettings");
		// print_r($query->row_array());exit;
		return $query->row_array();
	}
	
	/**
	* Log add operation
	* @param array $data - Data being added
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_add($data = array(), $description = '')
	{
		$module_name = 'Mobile Login';
		$log_type = 'Mobile Login';
		
		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}
		
		return log_admin_add($log_type, $module_name, $data, $description);
	}
	
	/**
	* Log edit operation
	* @param array $old_data - Data before update
	* @param array $new_data - Data after update
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_edit($old_data = array(), $new_data = array(), $description = '')
	{
		$module_name = 'Mobile Login';
		$log_type = 'Mobile Login';
		
		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}
		
		// Get changed fields for more detailed logging
		$changed_data = get_changed_fields($old_data, $new_data);
		
		return log_admin_edit($log_type, $module_name, $old_data, $new_data, $description . ' - Changed fields: ' . json_encode($changed_data));
	}
	
	/**
	* Log delete operation
	* @param array $data - Data being deleted
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_delete($data = array(), $description = '')
	{
		$module_name = 'Mobile Login';
		$log_type = 'Mobile Login';
		
		if (empty($description)) {
			$description = 'Deleted record from ' . $module_name;
		}
		
		return log_admin_delete($log_type, $module_name, $data, $description);
	}
}
