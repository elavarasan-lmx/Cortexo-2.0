<?php
class C_userregistration extends CI_Controller
{
	var $form_entry = "Registration";
	var $captcha_flag = 0;
	public function __construct()
	{
		parent::__construct();
		// $this->load->library("session");
		date_default_timezone_set("Asia/Calcutta");
	}
	function index() {}
	function open_listingform($db_error_msg = "")
	{
		$data["db_error_msg"] = $db_error_msg;
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "", $error = "")
	{
		$this->load->library("session");
		if ($model_name == "userregistration_model") {
			$data['UID'] = uniqid();
			$this->session->set_userdata($data);
			$form_entry = "registration";
		} else if ($model_name == "contactus_model") {
			$form_entry = "contactus";
		}

		$this->load->model($model_name);
		if ($type == 'add_new') {
			$record					=	$this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$_POST['fv']['error']	= 	$error;
			$this->load->view("header");
			$this->load->view($form_entry, $_POST['fv']);
			$this->load->view("footer");
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
	// Entry Form
	function open_activateentryform($model_name = "", $id = "")
	{
		$this->load->library("session");
		$this->load->model($model_name);

		$record					=	$this->$model_name->get_activateentry_record($id);
		$_POST['fv']				=   $record;
		$this->load->view("Registration", $_POST['fv']);
	}
	function feedback($model_name = "")
	{
		$this->load->library("session");
		$this->load->model($model_name);
		$email_return = $this->send_clientfeedback();
		$this->load->view('user_commands');
	}
	function check_captcha()
	{
		session_start();
		// print_r($_SESSION);exit;    

		if ($_POST['captcha_answer'] != $_SESSION['6_letters_code']) {

			$captcha_flag = 0;
			//redirect("C_userregistration/open_entryform/Userregistration_model/add_new/0/Invalid Captcha");
		} else {
			$captcha_flag = 1;
		}
		echo $captcha_flag;
	}
	public function send_emailtoclient()
	{
		$this->load->library("session");
		$data["cus_id"] 				= $_POST['fv']['cus_id'];
		$data["cus_name"] 				= $_POST['fv']['cus_name'];

		$htmlMessage = "Your ID Is: " . $_POST['fv']['cus_id'] . "<br>Customer Name: " . $_POST['fv']['cus_name'] . "<br>Company Name: " . $_POST['fv']['cus_company_name'] . "<br>Mobile: " . $_POST['fv']['cus_mobile'] . "<br>E-Mail ID: " . $_POST['fv']['cus_email'];
		$e_subject = "Registration Confirmation From " . $_SERVER['SERVER_NAME'] . " - " . date('d-m-Y h:i:s A');
		$email_resp = email_notification_helper($_POST['fv']['cus_email'], $e_subject, $htmlMessage);
		return $email_resp;
	}


	//Customer confirmation process
	public function customer_confirmation($id, $con_id)
	{
		$this->load->model("Userregistration_model");
		$this->Userregistration_model->customer_confirmation($id, $con_id);
	}
	public function chech_email()
	{
		$this->load->model("Userregistration_model");
		echo $this->Userregistration_model->clientEmail($_POST["group_id"]);
	}
	public function chech_phoneno()
	{
		$this->load->model("Userregistration_model");
		echo $this->Userregistration_model->clientMobileNo($_POST["mob_id"]);
	}

	function checkuserunique()
	{
		$this->load->model("Userregistration_model");
		$this->Userregistration_model->checkuserunique($this->input->post('username'));
		exit;
	}

	function DB_Controller($status = "", $form_type = "")
	{
		$this->load->library("session");
		$model_name = "Userregistration_model";
		$this->load->model($model_name);

		if ($status == 'add_new') {
			$this->load->model("Userregistration_model");
			$this->session->set_flashdata('success', '');
			$this->session->set_flashdata('errorMsg', '');
			//print_r($_POST);exit;
			if ($status == 'add_new') {
				$data["service_id"] = "1";
			} else if ($status == 'edit') {
				$data["service_id"] = "3";
			} else if ($status == 'activate') {
				$data["service_id"] = "2";
			}

			$_POST['terms'] = isset($_POST['terms']) ? 1 : 0;
			$errors = $this->validate_registration($_POST);
			if ($this->session->userdata('OTP') != $this->input->post('otp')) {
				$errors = $errors . "Incorrect OTP</br>";
			}
			if ($errors == "") {
				$this->db->trans_begin();
				$this->$model_name->insert_record();

				if ($this->db->trans_status() === TRUE) {
					$this->db->trans_commit();

					$this->load->model("login_model");
					/*$cusid = $this->login_model->GetCustomer();
				   
				   $data = array(
						'username' => $this->input->post('cus_mobile'),
						'userid'   => $cusid,
						'is_logged_in' => true
				   );
				   $this->session->set_userdata($data);*/

					//E-mail processs
					// $this->load->model('Email_model');

					$this->session->set_flashdata('success', "You have been successfully registered.");
					redirect("c_client_main/login");
				} else {
					$this->db->trans_rollback();
					$this->session->set_flashdata('errorMsg', "Oops! Registration failed. Please try again later or contact administrator");
					redirect("c_client_main/register");
				}
			} else {
				$this->session->set_flashdata('errorMsg', $errors);
				redirect("c_client_main/register");
			}
		}
	}
	public function generateOTP()
	{
		$this->load->library("session");
		$errors = "";
		$this->load->model("Userregistration_model");
		$errors = $this->validate_registration($_POST);
		if ($errors == '') {
			$this->session->unset_userdata("OTP");
			$OTP = mt_rand(100001, 999999);
			$this->session->set_userdata('OTP', $OTP);
			$this->load->model('Email_model');
			$to_emailid  = $_POST['cus_email'];
			$htmlMessage = "<p>Dear " . $_POST['cus_name'] . ",<p>You are required to verify your email by entering the below One Time Password in registration form of " . $this->config->item('companyname') . ".</p><p>Your OTP is <b>" . $OTP . "</b><p></br></br><p>Regards,</p><p>" . $this->config->item('companyname') . "</p>";
			$e_subject = "Email OTP Verification From " . $this->config->item('companyname');
			$e_return = $this->Email_model->send_email($to_emailid, $e_subject, $htmlMessage);

			//    $dlt_id = 1107175161372024807;
			$service_id = "11";
			$resultset = $this->db->query("SELECT sms_content, sms_footer,sms_dlt_te_id from dt_sms_settings where service_id = '" . $service_id . "'");
			foreach ($resultset->result() as $row) {
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
				$dlt_id = $row->sms_dlt_te_id;
			}
			$resultset->free_result();
			$message = $OTP . " is your OTP for registration with " . $_SERVER['HTTP_HOST'] . ". Please use this code to verify your mobile number. Regards," . Globals::$web_title . ".";
			$message = urlencode($message);
			$resp = sms_notification_dlt_helper("91" . $_POST['cus_mobile'], $message, $dlt_id);

			//    $message = $OTP." is your OTP for registration with ".$_SERVER['HTTP_HOST'].". Please use this code to verify your mobile number.";
			//    $resp = sms_notification_helper($_POST['cus_mobile'], $message);
			//    $resp1 = whatsapp_message_helper($_POST['cus_mobile'], $message);
			/* if($_POST['cus_mobile'] !='')
			{
				$message = $OTP." is your OTP for registration with ".$this->config->item('companyname').". Please use this code to verify your mobile number.";
				$fields = json_encode(array('mobile' => $_POST['cus_mobile'], 'message' => $message));
				$ch = curl_init();
				curl_setopt($ch, CURLOPT_URL, $this->config->item('smsurl'));
				curl_setopt($ch, CURLOPT_HTTPHEADER, array(
					'Content-Type: application/json; charset=utf-8'));
				curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
				curl_setopt($ch, CURLOPT_HEADER, FALSE);
				curl_setopt($ch, CURLOPT_POST, TRUE);
				curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
				curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
				$response = curl_exec($ch);
				curl_close($ch);
				unset($ch);
			} */
			if ($e_return) {
				echo json_encode(array("status" => 'S', "errors" => ""));
			} else {
				echo json_encode(array("status" => 'F', "errors" => "Oops! unknown error occured while validating your email. Please try again"));
			}
			//    echo json_encode(array("status" => 'S', "errors" => ""));
		} else {
			echo json_encode(array("status" => 'F', "errors" => $errors));
		}
	}

	public function validate_registration($data)
	{
		$this->load->library("session");
		$this->load->model("Userregistration_model");
		$errors = '';

		if (trim($data['cus_name']) == '' || trim($data['cus_email']) == '' || trim($data['cus_company_name']) == '' || trim($data['cus_mobile']) == '' || trim($data['cus_login_password']) == '' || trim($data['retype_password']) == '' || trim($data['cus_address']) == '' || trim($data['cus_whatsapp']) == '' || trim($data['cus_gstno']) == '') {
			$errors = $errors . "Please fill the required fields.<br/>";
		} else {
			if (strlen($data['cus_company_name']) < 4) {
				$errors = $errors . "The Company name is too short. Minimum length is 4 characters.";
			}
			if (strlen($data['cus_address']) < 4) {
				$errors = $errors . "The Company Address is too short. Minimum length is 4 characters.";
			}
			if (!filter_var($data['cus_email'], FILTER_VALIDATE_EMAIL)) {
				$errors = $errors . "Not a valid email format.<br/>";
			} else {
				if ($this->Userregistration_model->check_email(trim($data['cus_email']))) {
					$errors = $errors . "Email Id already registered.Enter different email.<br/>";
				}
			}
			if (strlen($data['cus_mobile']) > 12 || strlen($data['cus_mobile']) < 10 || !preg_match('/^([0-9]*)$/', $data['cus_mobile'])) {
				$errors = $errors . "Mobile No is not valid.<br/>";
			} else {
				if ($this->Userregistration_model->check_mobileno(trim($data['cus_mobile']))) {
					$errors = $errors . "Mobile number already registered.Enter different number.<br/>";
				}
			}
			if ($this->validate_password($data['cus_login_password'])) {
				$errors = $errors . "Password must have minimum 6 characters.<br/>";
			}
			if ($data['cus_login_password'] != $data['retype_password']) {
				$errors = $errors . "Password and retype password should be same.<br/>";
			}
			if ($data['terms'] != 1) {
				$errors = $errors . "Please accept the terms and condtions.<br/>";
			}
			// if($data['cus_type'] == 1){
			if ($data['cus_gstno'] != '') {
				if (!preg_match("/^(0[1-9]|[1-2][0-9]|3[0-5])([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([a-zA-Z0-9]){1}([a-zA-Z]){1}([a-zA-Z0-9]){1}?$/", $data['cus_gstno'])) {
					$errors = $errors . "Invalid GST number.<br/>";
				}
			}
			// }
			// if($data['cus_type'] == 0){
			// 	if($data['cus_panno'] != '')
			// 	{
			// 		if (!preg_match("/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/", $data['cus_panno']))
			// 		{
			// 			$errors = $errors. "Invalid PAN number.<br/>";
			// 		}

			// 	}
			// }
		}

		return $errors;
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
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */