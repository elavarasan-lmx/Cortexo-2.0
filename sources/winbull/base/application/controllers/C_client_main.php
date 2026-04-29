<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
class C_client_main extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->model('login_model');
		//$this->load->library('session');	
	}
	function index($error_data = 1)
	{
		$this->load->library('session');
		if ($this->login_model->get_booking()) {

			$data["error_data"] = "";
			if ($error_data == 0) {
				$data["error_data"] = "Invalid user id or password";
			} else if ($error_data == 2) {
				$data["error_data"] = "Please terminate previous session";
			} else if ($error_data == 3) {
				$data["error_data"] = "Your previous session terminated";
			} else if ($error_data == 4) {
				$data["error_data"] = "Invalid code";
			} else if ($error_data == 5) {
				$data["error_data"] = "Account Expired.Please contact administrator";
			}
			$data["type"] = $error_data;
			$this->load->view("header");
			$this->load->view('login', $data);
			$this->load->view("footer");
			$this->login_model->delete_session();
		} else {
			if ($this->session->userdata('username') == "") {
				$data = array(
					'username' => 'guest',
					'is_logged_in' => true
				);
				$this->session->set_userdata($data);
				$this->session->set_userdata('login_success', 'Login successful');
			session_write_close(); // Ensure session is saved before redirect
				//$this->login_model->delete_session();
			}
			redirect("C_booking/index");
		}
	}
	public function login($error_data = 1)
	{
		$this->load->library('session');
		$data["error_data"] = "";
		if ($this->session->userdata('username') && $this->session->userdata('username') != 'guest') {
			redirect("C_booking/book");
		} else {
			$data["type"] = $error_data;
			$this->load->view('header');
			$this->load->view('login', $data);
			$this->load->view('footer');
		}
	}
	
	function logout()
	{
		$this->load->library('session');
		$cusid = $this->session->userdata('userid');
		$this->login_model->log_logout($cusid);
		$this->session->sess_destroy();
		redirect("C_client_main/index");
	}
	public function load_mainpage()
	{
		$this->load->library('session');
		$this->load->model('login_model');
		//echo "Status:".$this->login_model->check_user_status();
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$this->login_model->insert_current_login();
			$this->session->set_userdata('login_success', 'Login successful');
			session_write_close();
			redirect("C_booking/index");
		}
	}
	function load_terminatesession()
	{
		$this->load->library('session');
		$this->load->view("terminate_session");
	}
	
	function forgotpassword()
	{
		$this->load->library('session');
		$data = array();
		$this->session->set_flashdata('success', '');
		$this->session->set_flashdata('errorMsg', '');
		if ($this->input->server('REQUEST_METHOD') === 'POST') {
			if ($this->input->post('user_name') != '') {
				// print_r($this->input->post('user_name'));exit;
				$userid = $this->login_model->GetCustomerID();
				if ($userid != NULL) {
					$email_sent = false;
					$sms_sent = false;

					$this->load->model('userregistration_model');
					$sms_url = $this->userregistration_model->get_SMSURL(7, $userid);
					if ($sms_url != '') {
						//$curl_resp = curl_helper($sms_url, $sms_url);
						$sms_sent = true;
					}
					// $whatsapp_url = $this->userregistration_model->get_whatsappURL(7, $userid);
					// print_r($whatsapp_url);exit;
					// if(isset($whatsapp_url['mobile'])) {
					// 	if(strlen($whatsapp_url['mobile']) > 0)
					// 	{
					// 		$resp = whatsapp_message_helper(trim($whatsapp_url['mobile'],'""'), $whatsapp_url['message']);
					// 	}
					// }

					$data = $this->userregistration_model->get_EmailContent(7, $userid);
					// print_r($data);exit;
					if (strlen($data['email_id']) > 0) {
						$email_resp = email_notification_helper($data['email_id'], $data["email_subject"], $data["email_content"]);
						if ($email_resp)
							$email_sent = true;
						else
							$email_sent = false;
					}


					if ($email_sent == true && $sms_sent == true)
						$this->session->set_flashdata('success', 'Password has been sent to your Email and Mobile No');
					else if ($email_sent == true && $sms_sent == false)
						$this->session->set_flashdata('success', 'Password has been sent to your Email');
					else if ($email_sent == false && $sms_sent == true)
						$this->session->set_flashdata('success', 'Password has been sent to your  Mobile No');
					else
						$this->session->set_flashdata('errorMsg', 'Error occured. Please try again later.');

					redirect("C_client_main/forgotpassword");
				} else {
					$this->session->set_flashdata('errorMsg', 'Mobile No is incorrect');
					redirect("C_client_main/forgotpassword");
				}
			} else {
				$this->session->set_flashdata('errorMsg', 'Please enter your Mobile No');
				redirect("C_client_main/forgotpassword");
			}
		}

		$this->load->view('header');
		$this->load->view('forgotpassword');
		$this->load->view('footer');
	}
	function changepassword()
	{
		$this->load->library('session');
		$data = array();
		$data['msg'] = '';
		session_start();
		if ($this->input->server('REQUEST_METHOD') === 'POST') {
			if (trim($this->input->post('cus_login_name')) != '' && trim($this->input->post('cus_login_password')) != '' && trim($this->input->post('new_password')) != '' && trim($this->input->post('confirm_password')) != '') {
				if (trim($this->input->post('new_password')) == trim($this->input->post('confirm_password'))) {
					$change_pass = $this->login_model->changepassword();
					if ($change_pass['status']) {
						//$this->load->model('userregistration_model');
						//$data = $this->userregistration_model->get_EmailContent(8, $userid);
						if (strlen($change_pass['email']) > 0) {
							$email_subject = "Password has been changed successfully";
							$htmlMessage = '<div style="padding:20px;border:5px solid #216A00;">
										Hello ' . $change_pass['name'] . ',
										<br><br>Your password has been changed successfully.Your new login details are given below
										<br><br>
										<table cellspacing="5" cellpadding="5" border="0">
										  <tr>
											<td><strong>User Name:</strong></td>
											<td>' . trim($this->input->post('cus_login_name')) . '</td>
										  </tr>
										  <tr>
											<td><strong>Password: </strong></td>
											<td>' . trim($this->input->post('new_password')) . '</td>
										  </tr>
										</table>
										<p>Thanks<br>
										<br><br></p>
										</div>';
							$email_resp = email_notification_helper($change_pass['email'], $email_subject, $htmlMessage);
						}

						$this->session->set_flashdata('success_msg', 'Password changed successfully');
						redirect("C_client_main/changepassword");
					} else {
						$this->session->set_flashdata('err_msg', 'User name / password is incorrect');
						redirect("C_client_main/changepassword");
					}
				} else {
					$this->session->set_flashdata('err_msg', "passwords doesn't match");
					redirect("C_client_main/changepassword");
				}
			} else {
				$this->session->set_flashdata('err_msg', 'Please fill the required fields');
				redirect("C_client_main/changepassword");
			}
		}
		if ($this->session->userdata('username') == 'guest' || $this->session->userdata('username') == '') {
			$data['is_logged_in'] = FALSE;
		} else {
			$data['is_logged_in'] = TRUE;
		}
		$data["page_type"] = "changepassword";
		$this->load->view('header', $data);
		$this->load->view('booking', $data);
		$this->load->view('footer');
	}
	public function Aboutus()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view('aboutus');
		$this->load->view("footer");
	}
	public function Terms()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view('terms');
		$this->load->view("footer");
	}
	public function Disclaimer()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view('disclaimer');
		$this->load->view("footer");
	}
	public function Privacy()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view('privacy');
		$this->load->view("footer");
	}
	public function Bank()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("bank");
		$this->load->view("footer");
	}
	public function Contactus()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("contactus");
		$this->load->view("footer");
	}
	public function Gallery()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("gallery");
		$this->load->view("footer");
	}
	public function Gold()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("gold");
		$this->load->view("footer");
	}
	public function Silver()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("silver");
		$this->load->view("footer");
	}
	public function Home()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("home");
		$this->load->view("footer");
	}
	public function Product()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("product");
		$this->load->view("footer");
	}
	public function Enquiry()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("enquiry");
		$this->load->view("footer");
	}
	public function News()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("news");
		$this->load->view("footer");
	}
	public function Overview()
	{
		$this->load->library('session');
		$this->load->view("header");
		$this->load->view("overview");
		$this->load->view("footer");
	}
	public function Messages()
	{
		$this->load->library('session');
		$messages = array();
		$this->load->view("header");
		$this->load->model('booking_model');
		$messages['currentmessages'] = $this->booking_model->get_messages();
		$this->load->view("messages", $messages);
		$this->load->view("footer");
	}
	public function MobileMessages()
	{
		$this->load->library('session');
		$messages = array();
		$this->load->model('booking_model');
		echo $this->booking_model->get_mobilemessages();
		//$message_json = json_encode($this->booking_model->get_mobilemessages());
		//echo $message_json;
	}
	public function calendar()
	{
		$this->load->view("header");
		$this->load->view("calendar");
		$this->load->view("footer");
	}
	public function tcs_tds_calc()
	{
		$this->load->library('session');
		$this->load->database();
		$this->load->model('booking_model');
		$data['return_value'] = $this->booking_model->get_tdsvalue();
		$this->load->view("header");
		$this->load->view('tcs_tds', $data);
		$this->load->view("footer");
	}
		public function get_captcha()
	{
		// Native CI session is already active because 'session' is autoloaded
		error_reporting(0);
		ini_set('display_errors', 0);

		$width = 130;
		$height = 42;

		$image = @imagecreatetruecolor($width, $height);

		$bg_color = imagecolorallocate($image, 250, 250, 250);
		$text_color = imagecolorallocate($image, 139, 0, 0);
		$noise_color = imagecolorallocate($image, 200, 200, 200);

		imagefilledrectangle($image, 0, 0, $width, $height, $bg_color);

		$chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
		$code = '';
		for ($i = 0; $i < 6; $i++) {
			$code .= $chars[mt_rand(0, strlen($chars) - 1)];
		}

		// Save explicitly to CI's session
		$_SESSION['6_letters_code'] = strtolower($code);
		$this->session->set_userdata('6_letters_code', strtolower($code));

		for ($i = 0; $i < 6; $i++) {
			imageline($image, mt_rand(0, $width), mt_rand(0, $height), mt_rand(0, $width), mt_rand(0, $height), $noise_color);
		}

		for ($i = 0; $i < 50; $i++) {
			imagesetpixel($image, mt_rand(0, $width), mt_rand(0, $height), $noise_color);
		}

		$font_size = 5;
		$char_width = imagefontwidth($font_size);
		$char_height = imagefontheight($font_size);
		$total_width = $char_width * strlen($code);

		$x = ($width - $total_width) / 2;
		$y = ($height - $char_height) / 2;

		for ($i = 0; $i < strlen($code); $i++) {
			$y_offset = $y + mt_rand(-3, 3);
			imagestring($image, $font_size, $x + ($i * $char_width), $y_offset, $code[$i], $text_color);
		}

		ob_clean(); // Clear any preceding whitespace or CI buffer

		header('Content-Type: image/png');
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');

		imagepng($image);
		imagedestroy($image);
		exit; // Halt CI execution instantly to prevent appended trailing spaces
	}
	public function contactussubmitt()
	{

		$name = $_POST['name'];
		$emailid = $_POST['email'];
		$phone = $_POST['phone'];
		$comments = $_POST['comments'];
		if (trim($name) != "" && trim($emailid) != "" && trim($phone) != "" && trim($comments) !== "") {
			$emailcontent = '
						<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
						  <!-- Header -->
						  <div style="background:linear-gradient(135deg,#d4850a,#f5a623);padding:30px 24px;border-radius:12px 12px 0 0;text-align:center;">
							<h2 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">&#9993; New Contact Enquiry</h2>
							<p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Received on ' . date('d M Y, h:i A') . '</p>
						  </div>
						  <!-- Body Card -->
						  <div style="background:#ffffff;padding:28px 24px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">
							<p style="margin:0 0 20px;color:#555555;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f5a623;padding-bottom:8px;">Contact Details</p>
							<table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
							  <tr>
								<td style="padding:14px 16px;background:#fef9f0;border-bottom:1px solid #f0e6d3;width:35%;color:#b8760a;font-weight:600;font-size:14px;">Customer Name</td>
								<td style="padding:14px 16px;background:#fffdf8;border-bottom:1px solid #f0e6d3;color:#333333;font-size:14px;">' . $name . '</td>
							  </tr>
							  <tr>
								<td style="padding:14px 16px;background:#fef9f0;border-bottom:1px solid #f0e6d3;width:35%;color:#b8760a;font-weight:600;font-size:14px;">Email</td>
								<td style="padding:14px 16px;background:#fffdf8;border-bottom:1px solid #f0e6d3;color:#333333;font-size:14px;"><a href="mailto:' . $emailid . '" style="">' . $emailid . '</a></td>
							  </tr>
							  <tr>
								<td style="padding:14px 16px;background:#fef9f0;border-bottom:1px solid #f0e6d3;width:35%;color:#b8760a;font-weight:600;font-size:14px;">Phone / Subject</td>
								<td style="padding:14px 16px;background:#fffdf8;border-bottom:1px solid #f0e6d3;color:#333333;font-size:14px;">' . $phone . '</td>
							  </tr>
							  <tr>
								<td style="padding:14px 16px;background:#fef9f0;width:35%;color:#b8760a;font-weight:600;font-size:14px;vertical-align:top;">Comments</td>
								<td style="padding:14px 16px;background:#fffdf8;color:#333333;font-size:14px;line-height:1.6;">' . $comments . '</td>
							  </tr>
							</table>
						  </div>
						  <!-- Footer -->
						  <div style="background:#f8f4ef;padding:20px 24px;border-radius:0 0 12px 12px;border:1px solid #e0e0e0;border-top:none;text-align:center;">
							<p style="margin:0;color:#999999;font-size:12px;"></p>
						  </div>
						</div>';
			$e_return = email_notification_helper(Globals::$enqToId, "Online enquiry received through" . $_SERVER['SERVER_NAME'], $emailcontent, Globals::$enqCCId);
			if ($e_return == 1) {
				echo '<script type="text/javascript">alert("Thank you for contacting us.We will reply you shortly Products...");setTimeout(function() { window.location="' . (base_url()) . 'index.php/c_client_main/gallery"; } , 400);</script>';
			} else {
				redirect('C_booking');
			}
		} else {
			echo '<script type="text/javascript">alert("Error in submitting your enquiry.Please fill all the required fields and try again ...!");setTimeout(function() { window.location="' . (base_url()) . 'index.php/c_client_main/gallery"; } , 400);</script>';
		}
	}
	public function contactussubmit()
	{
		$this->load->library('session');
		
		$expected = $this->session->userdata('6_letters_code');

		if (isset($_POST['answer']) && strtolower(trim($_POST['answer'])) == $expected && !empty($expected)) {

			$name = $_POST['name'];
			$emailid = $_POST['email'];
			$phone = $_POST['phone'];
			$comments = $_POST['comments'];
			if (trim($name) != "" && trim($emailid) != "" && trim($phone) != "" && trim($comments) !== "") {
				$emailcontent = '
								<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
								  <!-- Header -->
								  <div style="background:linear-gradient(135deg,#d4850a,#f5a623);padding:30px 24px;border-radius:12px 12px 0 0;text-align:center;">
									<h2 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">&#9993; New Contact Enquiry</h2>
									<p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Received on ' . date('d M Y, h:i A') . '</p>
								  </div>
								  <!-- Body Card -->
								  <div style="background:#ffffff;padding:28px 24px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;">
									<p style="margin:0 0 20px;color:#555555;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #f5a623;padding-bottom:8px;">Contact Details</p>
									<table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
									  <tr>
										<td style="padding:14px 16px;background:#fef9f0;border-bottom:1px solid #f0e6d3;width:35%;color:#b8760a;font-weight:600;font-size:14px;">Customer Name</td>
										<td style="padding:14px 16px;background:#fffdf8;border-bottom:1px solid #f0e6d3;color:#333333;font-size:14px;">' . $name . '</td>
									  </tr>
									  <tr>
										<td style="padding:14px 16px;background:#fef9f0;border-bottom:1px solid #f0e6d3;width:35%;color:#b8760a;font-weight:600;font-size:14px;">Email</td>
										<td style="padding:14px 16px;background:#fffdf8;border-bottom:1px solid #f0e6d3;color:#333333;font-size:14px;"><a href="mailto:' . $emailid . '" style="">' . $emailid . '</a></td>
									  </tr>
									  <tr>
										<td style="padding:14px 16px;background:#fef9f0;border-bottom:1px solid #f0e6d3;width:35%;color:#b8760a;font-weight:600;font-size:14px;">Phone / Subject</td>
										<td style="padding:14px 16px;background:#fffdf8;border-bottom:1px solid #f0e6d3;color:#333333;font-size:14px;">' . $phone . '</td>
									  </tr>
									  <tr>
										<td style="padding:14px 16px;background:#fef9f0;width:35%;color:#b8760a;font-weight:600;font-size:14px;vertical-align:top;">Comments</td>
										<td style="padding:14px 16px;background:#fffdf8;color:#333333;font-size:14px;line-height:1.6;">' . $comments . '</td>
									  </tr>
									</table>
								  </div>
								  <!-- Footer -->
								  <div style="background:#f8f4ef;padding:20px 24px;border-radius:0 0 12px 12px;border:1px solid #e0e0e0;border-top:none;text-align:center;">
									<p style="margin:0;color:#999999;font-size:12px;"></p>
								  </div>
								</div>';
				$this->load->model("Email_model");
				$e_return = $this->Email_model->send_enquiry(Globals::$enqToId, Globals::$enqCCId, "[" . Globals::$web_title . "] Online enquiry received", $emailcontent);
				if ($e_return == 1) {
					echo '<script type="text/javascript">alert("Thank you for contacting us. We will reply shortly..."); window.location="' . (base_url()) . '";</script>';
				} else {
					echo '<script type="text/javascript">alert("Failed to send email. Please try again."); window.history.back();</script>';
				}
			} else {
				echo '<script type="text/javascript">alert("Error in submitting your enquiry. Please fill all the required fields and try again...!"); window.history.back();</script>';
			}
		} else {
			echo '<script type="text/javascript">alert("Invalid Captcha! Please match the security code and try again."); window.history.back();</script>';
		}
	}
	public function register()
	{
		$this->load->library('session');
		$this->session->set_flashdata('errorMsg', '');
		if ($this->session->userdata('username') && $this->session->userdata('username') != 'guest') {
			redirect("C_userregistration/edit_profile");
		} else {
			$this->load->view("header");
			$this->load->view("signup");
			$this->load->view("footer");
		}
	}
	public function get_entryeventdata($model = "")
	{
		$this->load->library('session');
		$this->load->model($model);
		$data = $this->$model->get_calendardata();

		//print_r($data);exit;
		echo json_encode($data);
	}
	public function getratealerttollarance()
	{
		$this->load->library('session');
		$this->load->model('booking_model');
		echo $this->booking_model->get_alerttollarance();
	}
	public function ratealertRequest()
	{
		$this->load->library('session');
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata);
		$alertarray = array('alert_device' => $request->uuid, 'alert_cusdeviceid' => isset($request->devicetoken) ? $request->devicetoken : time(), 'alert_datetime' => date('Y-m-d H:i:s'), 'alert_comid' => $request->comid, 'alert_rate' => $request->alertrate, 'alerttype' => $request->alerttype);
		$title   = "Rate Alert Update";
		$message = "Rate Alert Information";
		$this->create_pushnotification($title, $message);
		$this->load->model("booking_model");
		echo $this->booking_model->ratealertRequest($alertarray);
	}
	public function ratealertDelete()
	{
		$this->load->library('session');
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata);
		$this->load->model("booking_model");
		echo $this->booking_model->ratealertDeleteRequest($request->alertId, $request->alertType, $request->comId, $request->deviceId);
	}
	public function getratealertlist()
	{
		$this->load->library('session');
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata);
		$this->load->model("booking_model");
		echo $this->booking_model->getratealertlist($request->uuid);
	}
	public function ratealertTolerance()
	{
		$this->load->library('session');
		$this->load->model("booking_model");
		echo $this->booking_model->getratealertTolerance();
	}

	function create_pushnotification($title, $message)
	{
		$this->load->library('session');
		$model_name = "booking_model";
		$this->load->model($model_name);
		$registerids = array();
		$registerids = $this->booking_model->getadminnotificationids();
		$regIdChunk = array_chunk($registerids, 1000);
		foreach ($regIdChunk as $RegId) {
			$registrationIds = $RegId;
			$content = array(
				"en" => $message
			);

			$fields = array(
				'app_id' => isset(Globals::$app_id) ? Globals::$app_id : '',
				'include_player_ids' => $registrationIds,
				'contents' => $content,
				'headings' => array("en" => $title),
				'subtitle' => array("en" => '')
			);
			// $fields = json_encode($fields);

			$resp = push_notification_helper($fields);
		}
	}
	public function accountdelete()
	{
		echo "Account deleted successfully";
	}

	//Quotation Page start

	public function Quotation()
	{
		$this->load->library('session');
		$this->load->database();
		$this->load->model('booking_model');
		$cus_country = $this->input->post('cus_country') ?? $this->input->get('cus_country') ?? '91';
		$data['countries'] = $this->booking_model->getCountry($cus_country);
		$this->load->view("header");
		$this->load->view('quotation', $data);
		$this->load->view("footer");
	}

	public function quotation_confirm()
	{

		$requestdata = (array)json_decode(file_get_contents("php://input"));
		$data = array(
			'company_name' =>  $requestdata['company_name'] ?? $this->input->post('company'),
			'gst_no'       =>  $requestdata['gst_no'] ?? $this->input->post('gst'),
			'mobile_no'    =>  $requestdata['mobile_no'] ?? $this->input->post('mobile'),
			'country'    =>  $requestdata['country'] ?? $this->input->post('country')
		);

		$this->load->model('booking_model');
		$response = $this->booking_model->insert_quotation_record($data);

		// Return response as JSON (good for AJAX calls)
		echo json_encode($response);
	}

	function get_number_gst()
	{
		$requestdata = (array)json_decode(file_get_contents("php://input"));
		$mobile = $requestdata['mobile'] ?? $this->input->post('mobile');
		$gst    = $requestdata['gst'] ?? $this->input->post('gst');
		$this->load->model('booking_model');
		$status = $this->booking_model->get_number_gst($mobile, $gst);
		echo json_encode(['status' => $status]);
	}

	public function delivery_otp_verify()
	{
		$requestdata = (array)json_decode(file_get_contents("php://input"));
		$user_otp = $requestdata['otp'] ?? $this->input->post('otp');
		$session_otp = $this->session->userdata('OTP');

		// if ($user_otp != $session_otp) {
		// 	echo "1"; // OTP invalid
		// 	return;
		// }

		// echo "2"; // OTP verified
		if (!$user_otp) {
			echo json_encode(['success' => false, 'message' => 'OTP is required']);
			return;
		}
		if ($user_otp != $session_otp) {
			echo json_encode(['success' => false, 'message' => 'Invalid OTP']);
			return;
		}

		echo json_encode(['success' => true, 'message' => 'OTP Verified Successfully']);
	}
	function quotation_otp_send()
	{
		$requestdata = (array)json_decode(file_get_contents("php://input"));
		$mobile = $requestdata['mobile'] ?? $this->input->post('mobile');

		$this->load->model('booking_model');
		$service_id = "14";
		$data = $this->booking_model->get_Delivery_content($service_id, $mobile);
		$response = ['sms' => false];
		if (!empty($data) && !empty($data['sms_url'])) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $data['sms_url']);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			curl_setopt($ch, CURLOPT_TIMEOUT, 10);
			$curl_resp = curl_exec($ch);

			if ($curl_resp === false) {
				$response['sms'] = false;
				$response['sms_error'] = curl_error($ch);
			} else {
				$response['sms'] = true;
				$response['sms_response'] = $curl_resp;
			}
			curl_close($ch);
			// $curl_resp = curl_helper($data['sms_url'], $data['sms_url']);
			// $response['sms'] = true;
		}
		$final_status = ($response['sms']) ? 'success' : 'failed';
		echo json_encode(['status' => $final_status, 'details' => $response]);
	}

	//Quotation Page End

	public function getRate()
	{
		$response = [];

		/* --- Encrypted BseRate --- */
		$filePathEncrypted = base_url('api/bsekjprice.txt');
		$data = @file_get_contents($filePathEncrypted);

		if ($data !== false) {

			$encryptedData = base64_decode($data);

			$iv = substr($encryptedData, 0, 16);
			$encrypted = substr($encryptedData, 16);

			$encryptionKey = '12@^tyh8901tt56789012345$y89012';

			$decrypted = openssl_decrypt(
				$encrypted,
				'aes-256-cbc',
				$encryptionKey,
				OPENSSL_RAW_DATA,
				$iv
			);

			if ($decrypted !== false) {
				$decodedJson = json_decode($decrypted, true);
				$decodedJson['timestamp'] = date("d-m-Y h:i A", strtotime($decodedJson['timestamp']));
				$response['bseRate'] = $decodedJson;
			} else {
				$response['bseRate'] = ["status" => "error", "message" => "Failed to decrypt"];
			}
		} else {
			$response['bseRate'] = ["status" => "error", "message" => "Encrypted file not found"];
		}

		/* --- Mjdta Rate --- */
		$filePathPlain = base_url('api/rate.txt');
		$jsonString = @file_get_contents($filePathPlain);

		if ($jsonString !== false) {

			// Fetch mjdta_diff from DB
			$query = $this->db->select('mjdta_gold_diff,mjdta_silver_diff')
				->from('dt_generalsettings')
				->get();
			$row = $query->row();
			$mjdta_gold_diff = $row->mjdta_gold_diff;
			$mjdta_silver_diff = $row->mjdta_silver_diff;

			$oldData = json_decode($jsonString, true);

			$oldData['updatetime'] = date("d-m-Y h:i A", $oldData['updatetime']);
			$oldData['mjdta_gold_diff'] = $mjdta_gold_diff;
			$oldData['mjdta_silver_diff'] = $mjdta_silver_diff;
			$oldData['goldrate_22ct_UpdatedRate'] = $oldData['goldrate_22ct'] - $mjdta_gold_diff;

			$response['mjdtaRate'] = $oldData;
		} else {
			$response['mjdtaRate'] = ["status" => "error", "message" => "Rate file not found"];
		}

		echo json_encode($response, JSON_UNESCAPED_SLASHES);
	}

	// Instant Logout


    // function terminate_usersession()
	// {
	// 	$this->load->library('session');
	// 	if ($this->login_model->terminate_existingsession()) {
	// 		$userdata = $this->db->query("select * from dt_customer where cus_login_name='" . $this->input->post('user_name') . "' and cus_sec_code='" . $this->input->post('user_sec_code') . "'");
	// 		$this->load->library("session");
	// 		$data = array(
	// 			'username' => $this->input->post('user_name'),
	// 			'userid'   => $userdata->row()->cus_id,
	// 			'is_logged_in' => true
	// 		);
	// 		$this->session->set_userdata($data);
	// 		setcookie('terminate_user', '', time() - 3600, "/"); //deleting the terminate_session cookie

	// 		$timestamp = time();

	// 		$updatedata['silver_lgd_ltp'] = $timestamp;
	// 		$this->db->update('dt_rpanel',  $updatedata);

	// 		$xmlDoc = new DOMDocument("1.0");
	// 		header("Content-Type:text/plain");
	// 		$xmlDoc = simplexml_load_file("admin/rpanel_xml/ratexml.xml");
	// 		$xmlDoc->silver_lgd_ltp = $timestamp;
	// 		$xmlDoc->asXML("admin/rpanel_xml/ratexml.xml");

	// 		redirect("C_client_main/load_mainpage");
	// 	} else {
	// 		redirect("C_client_main/index/4");
	// 	}
	// }

    // public function login_validation()
	// {

	// 	$this->load->library('session');
	// 	clearstatcache();
	// 	$this->load->model('login_model');
	// 	$result = $this->login_model->check_user();

	// 	if ($result != 1) {
	// 		$this->session->set_flashdata('success', '');
	// 		if ($result == 0) {
	// 			$this->session->set_flashdata('errorMsg', 'Invalid username or passwords');
	// 		} else if ($result == 2) {
	// 			// print_r($result);exit;
	// 			$this->session->set_flashdata('errorMsg', 'Your account is inactivated kindly contact admin');
	// 		} else if ($result == 3) {
	// 			$this->session->set_flashdata('errorMsg', 'Account Expired. Please contact administrator');
	// 		} else if ($result == 4) {
	// 			$this->session->set_flashdata('errorMsg', 'Error occured. Please try again later.');
	// 		}
	// 		redirect("C_client_main/login");
	// 	} else if ($result == 1) {
	// 		$cusid = $this->login_model->GetCustomerID();
	// 		$data = array(
	// 			'username' => $this->input->post('user_name'),
	// 			'userid'   => $cusid,
	// 			'is_logged_in' => true
	// 		);
	// 		$this->session->set_userdata($data);
	// 		redirect("C_booking/book");
	// 	}
	// }

	public function login_validation()
	{
		
		$this->load->library('session');
		clearstatcache();
		$this->load->model('login_model');
		$result = $this->login_model->check_user();

		if($result != 1) 
		{
			if($result==0) {
				$this->session->set_flashdata('errorMsg', 'Invalid username or passwords');
			} else if($result==2) {
				$this->session->set_flashdata('errorMsg', 'Your Account is currently not active. Please try again later');
			} else if($result==3) {
				$this->session->set_flashdata('errorMsg', 'Account Expired. Please contact administrator');
			} else if($result==4) {
				$this->session->set_flashdata('errorMsg', 'Error occured. Please try again later.');
			}
			redirect("C_client_main/login");
		} 
		else if($result==1)
		{ 
			// $cusid = $this->login_model->GetCustomerID();
			// $data = array(
			// 	'username' => $this->input->post('user_name'),
			// 	'userid'   => $cusid,
			// 	'is_logged_in' => true
			// );
			// $this->session->set_userdata($data);
			// redirect("C_booking/book");
			
			if($this->login_model->terminate_existingsession()) {
				$userdata = $this->db->query("select * from dt_customer where cus_login_name='".$this->input->post('user_name')."' and cus_login_password='".$this->input->post('user_password')."'");
				$this->load->library("session");
				
				// Generate UUID for Web Session Instant Logout
				$web_uuid = uniqid('web', true);
				
				$data = array(
					'username' => $this->input->post('user_name'),
					'userid'   => $userdata->row()->cus_id,
					'client_uuid' => $web_uuid,
					'is_logged_in' => true
				);
				$this->session->set_userdata($data);
				setcookie('terminate_user','',time()-3600, "/"); //delelogin_successting the terminate_session cookie
				
				$timestamp = time();
				
				$updatedata['userupdatetime'] = $timestamp;
				$this->db->update('dt_r_panel',  $updatedata);  
				
				$terminateuser['terminateuser'] = array('id' => 1, 'userid' => $userdata->row()->cus_id, 'uuid' => $userdata->row()->cus_uuid);
		        $url = isset(Globals::$marqueeupdate) ? Globals::$marqueeupdate : '';

				if ($url != '') {
					$field_string = http_build_query($terminateuser);
					$curl_resp = curl_helper($url, $field_string);
				}
				
				$this->session->set_userdata('login_success', 'Login successful');
				session_write_close(); // Ensure session is saved before redirect
				redirect("C_booking/book");
			} else {		
				redirect("C_client_main/index/4");
			}
		}
	}
	function terminate_usersession() {
		$this->load->library('session');
		if($this->login_model->terminate_existingsession()) {
			$userdata = $this->db->query("select * from dt_customer where cus_login_name='".$this->input->post('user_name')."' and cus_sec_code='".$this->input->post('user_sec_code')."'");
			$this->load->library("session");
			
            // Generate UUID for Web Session Instant Logout
			$web_uuid = uniqid('web', true);
			
			$data = array(
				'username' => $this->input->post('user_name'),
				'userid'   => $userdata->row()->cus_id,
				'client_uuid' => $web_uuid,
				'is_logged_in' => true
			);
			$this->session->set_userdata($data);
			setcookie('terminate_user','',time()-3600, "/"); //deleting the terminate_session cookie
			
			$timestamp = time();
			
			$updatedata['silver_lgd_ltp'] = $timestamp;
			$this->db->update('dt_rpanel',  $updatedata);
			
			$xmlDoc = new DOMDocument("1.0");
		    header("Content-Type:text/plain");
			$xmlDoc = simplexml_load_file("admin/rpanel_xml/ratexml.xml");			
			$xmlDoc->silver_lgd_ltp = $timestamp;
			$xmlDoc->asXML("admin/rpanel_xml/ratexml.xml");
			
			redirect("C_client_main/load_mainpage");
		} else {		
			redirect("C_client_main/index/4");
		}
	}
}