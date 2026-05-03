 <?php
	class Login_model extends CI_Model
	{

		function __construct()
		{
			// Call the Model constructor
			parent::__construct();

			// Load helpers for logging
			$this->load->helper('common');
			$this->load->helper('field_labels');
		}

		// Logging methods for authentication events
		public function log_login_attempt($username, $status, $ip_address = '', $user_agent = '')
		{

			$log_type = 'User Login';
			$module_name = 'User Authentication';

			$data = array(
				'username' => $username,
				'status' => $status,
				'ip_address' => $ip_address,
				'user_agent' => $user_agent,
				'timestamp' => date('Y-m-d H:i:s')
			);

			$description = 'User - Login attempt for user: ' . $username . ' - Status: ' . $status;

			return log_admin_add($log_type, $module_name, $data, $description);
		}

		public function log_logout($username, $ip_address = '')
		{
			$log_type = 'User Logout';
			$module_name = 'User Authentication';

			$data = array(
				'username' => $username,
				'ip_address' => $ip_address,
				'timestamp' => date('Y-m-d H:i:s')
			);

			$description = 'User - User logged out: ' . $username;

			return log_admin_add($log_type, $module_name, $data, $description);
		}

		public function log_user_logout($user_id)
		{
			$log_type = 'User Session Termination';
			$module_name = 'User Authentication';

			$data = array(
				'user_id' => $user_id,
				'timestamp' => date('Y-m-d H:i:s')
			);

			$description = 'User - User session terminated for user ID: ' . $user_id;

			return log_admin_add($log_type, $module_name, $data, $description);
		}

		public function log_mobile_login_attempt($username, $status, $device_info = '')
		{
			$log_type = 'Mobile User Login';
			$module_name = 'Mobile Authentication';

			$data = array(
				'username' => $username,
				'status' => $status,
				'device_info' => $device_info,
				'timestamp' => date('Y-m-d H:i:s')
			);

			$description = 'User - Mobile login attempt for user: ' . $username . ' - Status: ' . $status;

			return log_admin_add($log_type, $module_name, $data, $description);
		}

		public function log_mobile_logout($username, $device_info = '')
		{
			$log_type = 'Mobile User Logout';
			$module_name = 'Mobile Authentication';

			$data = array(
				'username' => $username,
				'device_info' => $device_info,
				'timestamp' => date('Y-m-d H:i:s')
			);

			$description = 'User - Mobile user logged out: ' . $username;

			return log_admin_add($log_type, $module_name, $data, $description);
		}



		public function check_user() 										//Fetch entry record
		{

			//Build contents query
			$resultset = $this->db->query("select * from dt_customer where cus_login_name='" . $this->input->post('user_name') . "' and cus_login_password='" . $this->input->post('user_password') . "'");
			if ($resultset->num_rows() == 1) {
				foreach ($resultset->result() as $row) {

					//checking for whether the user status is active
					if ($row->cus_active == 1) {
						//checking for whether the user is a life time member
						if ($row->cus_is_life_time == 1) {
							// Log successful login
							$this->log_login_attempt($this->input->post('user_name'), 'Success (Lifetime Member)', $this->input->ip_address(), $this->input->user_agent());
							return 1;
						}
						//checking for whether the user validation period is expired or not	
						else if (date("Y-m-d") <= $row->cus_valid_till) {
							// Log successful login
							$this->log_login_attempt($this->input->post('user_name'), 'Success (Valid Subscription)', $this->input->ip_address(), $this->input->user_agent());
							return 1;
						} else {

							// Log expired account login attempt
							$this->log_login_attempt($this->input->post('user_name'), 'Failed (Account Expired)', $this->input->ip_address(), $this->input->user_agent());
							return 3;
						}
					} else {
						// Log inactive account login attempt
						$this->log_login_attempt($this->input->post('user_name'), 'Failed (Account Inactive)', $this->input->ip_address(), $this->input->user_agent());
						return 2;
					}
				}
			}

			// Log failed login attempt
			$this->log_login_attempt($this->input->post('user_name'), 'Failed (Invalid Credentials)', $this->input->ip_address(), $this->input->user_agent());
			return 0;
		}
		public function check_user_status()
		{
			$resultset = $this->db->query("select * from dt_usersessions where user_data like '%" . $this->input->post('user_name') . "%' and session_id != '" . $this->session->userdata('session_id') . "'");
			$query	= $this->db->query("SELECT count(*) as totaluser from dt_customer where cus_login_name = '" . $this->input->post('user_name') . "' AND (cus_uuid='' OR cus_uuid is null)");
			if ($resultset->num_rows == 1 || $query->row()->totaluser == 0) {
				return true;
			}
			return false;
		}
		function check_to_clear_session($status = 0)
		{
			if ($status == 1) {
				$resultset = $this->db->query("select * from dt_usersessions where user_data like '%" . $this->session->userdata('user_name') . "%' and session_id = '" . $this->session->userdata('session_id') . "' and user_data IS NOT NULL");
			} else {
				$resultset = $this->db->query("select * from dt_usersessions where user_data like '%" . $this->session->userdata('user_name') . "%' and session_id = '" . $this->session->userdata('session_id') . "'");
			}

			if ($resultset->num_rows == 1) {
				return true;
			}
			return false;
		}
		
		function delete_session()
		{
			$resultset = $this->db->query("delete from dt_usersessions where user_data is NULL or user_data = ''");
			return true;
		}

		function get_news_events()
		{
			$resultset = $this->db->query("select * from dt_news");
			return $resultset;
		}

		function insert_current_login()
		{
			date_default_timezone_set('Asia/Kolkata');
			$resultset = $this->db->query("select prev_date_time, prev_ip_address, prev_username from dt_prev_login where prev_username='" . $this->session->userdata('username') . "'");

			foreach ($resultset->result() as $row) {
				$this->session->set_userdata('prev_date_time', $row->prev_date_time);
				$this->session->set_userdata('prev_ip_address', $row->prev_ip_address);
				$this->session->set_userdata('prev_username', $row->prev_username);
			}

			$resultset->free_result();

			$this->db->query("DELETE FROM dt_prev_login where prev_username='" . $this->session->userdata('username') . "'");

			$insert_data['prev_ip_address']	    = 	$this->session->userdata('ip_address');
			$insert_data['prev_username']		=	$this->session->userdata('username');
			$insert_data['prev_date_time']	    = 	date('Y-m-d H:i:s');

			$this->db->insert("dt_prev_login", $insert_data);
		}

		function get_booking()
		{
			$booking_flag = 0;
			$resultset = $this->db->query("SELECT admin_booking FROM dt_generalsettings");
			if ($resultset->num_rows() > 0) {
				$booking_flag = $resultset->row()->admin_booking;
			}
			$resultset->free_result();
			return $booking_flag;
		}
		function GetCustomerID()
		{
			// print_r($this->input->post('user_name'));exit;   
			$resultset = $this->db->query("select cus_id from dt_customer where cus_login_name='" . $this->input->post('user_name') . "'");
			if ($resultset->num_rows() == 1) {
				return $resultset->row()->cus_id;
			} else {
				return NULL;
			}
		}
		function GetCustomer()
		{
			$resultset = $this->db->query("select cus_id from dt_customer where cus_login_name='" . $this->input->post('cus_email') . "'");
			if ($resultset->num_rows == 1) {
				return $resultset->row()->cus_id;
			} else {
				return NULL;
			}
		}
		public function check_mobileuser($username, $password) 										//Fetch entry record
		{
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
								// Log failed mobile login attempt
								$this->log_mobile_login_attempt($username, 'Failed (Already Logged In)', 'IMEI: ' . $imieno);
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

								// Log successful mobile login
								$this->log_mobile_login_attempt($username, 'Success (Lifetime Member)', 'IMEI: ' . $imieno . ', UUID: ' . $uuid);
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
								// Log failed mobile login attempt
								$this->log_mobile_login_attempt($username, 'Failed (Already Logged In)', 'IMEI: ' . $imieno);
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

								// Log successful mobile login
								$this->log_mobile_login_attempt($username, 'Success (Valid Subscription)', 'IMEI: ' . $imieno . ', UUID: ' . $uuid);
							}
						}
					}
				}
			} else {
				$data = array(
					'usercode' => '',
					'operationresult' => 0,
					'message' => "Please Enter Valid User Name / Password",
					'uuid'	=> ''
				);

				// Log failed mobile login attempt
				$this->log_mobile_login_attempt($username, 'Failed (Invalid Credentials)', '');
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

		// Instant Logout 

		// function terminate_existingsession()
		// {

		// 	$user_name = $this->input->post('user_name');

		// 	$resultset = $this->db->query("select * from dt_customer where cus_sec_code='" . $this->input->post('user_sec_code') . "' and cus_login_name='" . $user_name . "'");
		// 	if ($resultset->num_rows == 1) {
		// 		$resultset = $this->db->query("delete from dt_usersessions where user_data like '%" . $this->input->post('user_name') . "%'");
		// 		$query = $this->db->query("update dt_customer set cus_uuid='' where cus_login_name ='" . $this->input->post('user_name') . "'");
		// 		// Log session termination
		// 		$this->log_user_logout($this->input->post('user_name'));
		// 		return true;
		// 	}
		// 	return false;
		// }

	    function terminate_existingsession() {
	
			$user_name = $this->input->post('user_name');
			$user_password = $this->input->post('user_password');
		
			$resultset = $this->db->query("select * from dt_customer where cus_login_password='".$user_password."' and cus_login_name='".$user_name."'");
			// $resultset = $this->db->query("select * from dt_customer where cus_sec_code='" . $this->input->post('user_sec_code') . "' and cus_login_name='" . $user_name . "'");

			if($resultset->num_rows() == 1) {
				
				// 1. Check for Active App Session in dt_customer
				$app_uuid_active = false;
				$app_query = $this->db->query("select cus_uuid from dt_customer where cus_login_name='".$user_name."'");
				if ($app_query->num_rows() > 0 && !empty($app_query->row()->cus_uuid)) {
					$app_uuid_active = true;
				}
				
				// 2. Get all active sessions from ci_usersessions
				$query = $this->db->query("select * from ci_usersessions where data like '%".$user_name."%'");
				$sessions = $query->result_array();
								
				// 3. Sync Check
				$app_session_found_in_db = false;
				foreach ($sessions as $sess) {
					$data_blob = isset($sess['data']) ? $sess['data'] : (isset($sess['user_data']) ? $sess['user_data'] : '');
					if (strpos($data_blob, 'is_app') !== false) {
						$app_session_found_in_db = true;
						break;
					}
				}
				
				// Sort by timestamp descending
				usort($sessions, function($a, $b) {
					$t_a = isset($a['timestamp']) ? $a['timestamp'] : (isset($a['time']) ? $a['time'] : (isset($a['last_activity']) ? $a['last_activity'] : 0));
					$t_b = isset($b['timestamp']) ? $b['timestamp'] : (isset($b['time']) ? $b['time'] : (isset($b['last_activity']) ? $b['last_activity'] : 0));
					return $t_b - $t_a;
				});

				// Force check for ALL sessions (Debugging mode)
				// if (count($sessions) >= 1) { 
										
					$sessions_to_delete = $sessions; // Delete ALL previous sessions
					
					foreach ($sessions_to_delete as $sess) {
						$id = isset($sess['id']) ? $sess['id'] : '';
								
						// Case B: Real DB Session
						$id_col = isset($sess['id']) ? 'id' : (isset($sess['session_id']) ? 'session_id' : '');
						
						$data_blob = isset($sess['data']) ? $sess['data'] : (isset($sess['user_data']) ? $sess['user_data'] : '');
						
						// Attempt to extract client_uuid from ANY session (App or Web) to trigger socket logout
						$s_data = @unserialize($data_blob);
						$uuid_to_kill = '';
						
						if ($s_data && isset($s_data['client_uuid'])) {
							$uuid_to_kill = $s_data['client_uuid'];
						} else {
							// CI3 Custom Session Regex
							if (preg_match('/client_uuid\|s:\d+:"([^"]+)"/', $data_blob, $matches)) {
								$uuid_to_kill = $matches[1];
							}
						}
						
						if (!empty($uuid_to_kill)) {
							$this->trigger_socket_termination($resultset->row()->cus_id, $uuid_to_kill);
						}

						// Check if this is an App Session row (marked by 'is_app')
						if (strpos($data_blob, 'is_app') !== false) {
							$this->db->query("update dt_customer set cus_uuid='' where cus_login_name ='".$user_name."'");
						}

						if ($id_col) {
							$this->db->query("delete from ci_usersessions where ".$id_col." = '".$sess[$id_col]."'");
						}
					}
				// } else {
				//    file_put_contents(FCPATH.'logs/socket_debug.txt', "Limit Not Reached (Count < 1).\n", FILE_APPEND);
				// }
				return true;
			}
			return false;
		}

	function trigger_socket_termination($userid, $uuid) {
		$terminateuser['marqueetext'] = array('id' => 1, 'userid' => $userid, 'uuid' => $uuid);
		$url = isset(Globals::$marqueeupdate) ? Globals::$marqueeupdate : '';
		// $terminateuser['terminateuser'] = array('id' => 1, 'userid' => $userid, 'uuid' => $uuid);
		// $url = isset(Globals::$terminateuser) ? Globals::$terminateuser : '';
		if ($url != '') {
			$field_string = http_build_query($terminateuser);
			$curl_resp = curl_helper($url, $field_string);
		}
	}
	}
	?>