<?php
class C_main extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		// Your own constructor code
	}

	function index($error_data = "")
	{
		$data["error_data"] = $error_data;
		$this->load->view('login', $data);
		$this->login_model->delete_session();
	}
	// grid coding
	public function grid_dataload($model_name = "")
	{ //$this->header_content(); 	
		$this->load->model($model_name);
		$req_param = array(
			"sort_by" 			=> 	$this->input->post("sidx", TRUE),
			"sort_direction" 	=> 	$this->input->post("sord", TRUE),
			"page" 				=> 	$this->input->post("page", TRUE),
			"num_rows" 			=> 	$this->input->post("rows", TRUE),
			"search" 			=> 	$this->input->post("_search", TRUE),
			"search_field" 		=> 	$this->input->post("searchField", TRUE),
			"search_operator" 	=> 	$this->input->post("searchOper", TRUE),
			"search_str" 		=> 	$this->input->post("searchString", TRUE)
		);

		$records 			= 	$this->$model_name->get_data($req_param, "", $start)->result_array();
		$data->rows 		= 	$records;
		echo json_encode($data);
		exit(0);
		$query->free_result();
	}

	public function login_validation()
	{
		if (!$this->input->post('user_name') && !$this->input->post('user_password')) {
			$this->session->set_flashdata('error', 'Please enter username and password');
			redirect('C_main/index');
		}
		if (!$this->input->post('user_name')) {
			$this->session->set_flashdata('error', 'Please enter username');
			redirect('C_main/index');
		}
		if (!$this->input->post('user_password')) {
			$this->session->set_flashdata('error', 'Please enter password');
			redirect('C_main/index');
		}

		$this->load->model('login_model');
		$result = $this->login_model->check_user();
		$post_data = $this->input->post();
		$user_name = '';
		$user_password = '';

		foreach ($post_data as $key => $val) {
			if (strpos($key, 'user_name') === 0) {
				$user_name = $val;
			}
			if (strpos($key, 'user_password') === 0) {
				$user_password = $val;
			}
		}
		if ($result == 0) { // invalid user
			$this->session->set_flashdata('error', 'Invalid username or password');
			redirect('C_main/index');
		} else if ($result == 1) { // if the user's credentials validated...
			$data = array(
				'username' => $user_name,
				'is_logged_in' => true
			);
			$this->session->set_userdata($data);
			$values = $this->login_model->get_values();
			$data = array(
				'company_name'   => $values['company_name'],
				'is_trade'       => $values['is_trade'],
				'display_margin' => $values['display_margin']
			);
			$this->session->set_userdata($data);
			/** remember password block **/
			/** edited by Samuel on 16.09.2014 **/
			if ($this->input->post('remember') == 1) {    // if user check the remember me checkbox   
				$expTime = time() + 60 * 60 * 24 * 100;
				setcookie('rem_admin', $user_name, $expTime, "/");
				setcookie('admin_us', $user_password, $expTime, "/");
			} else {   // if user not check the remember me checkbox
				$expTime = time() - 3600;
				setcookie('rem_admin', "", $expTime, "/");
				setcookie('admin_us', "", $expTime, "/");
			}
			//end of remember password block
			$this->session->set_flashdata('success', 'Login Successfully.');
			redirect("C_main/load_mainpage");
		} else if ($result == 2) {
			setcookie('terminate_admin', $user_name, time() + 3600, "/");
			redirect("C_main/load_terminatesession");
		} else if ($result == 3) {
			$this->session->set_flashdata('error', 'Your validity has been expire please contact us');
			redirect();
		}
	}
	function logout()
	{
		/* $data = array(
				'username' => "",
				'is_logged_in' => false
		);
		$this->session->unset_userdata($data);
		$this->login_model->delete_session(); */
		$this->session->sess_destroy();
		// $this->index("Your session terminated");
		$this->session->set_flashdata('error', 'Logout Successfully.');
		redirect();
		// $this->index();
		// $this->index("Logout Successfully.");
	}
	public function load_mainpage()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$this->load->view("index");
		}
	}

	public function get_datagraph()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->get_datagraph();
		}
		echo json_encode($data);
		exit;
	}

	public function load_data()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->get_dataDashboard();
		}
		echo json_encode($data);
		exit;
	}

	public function bookings_request()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->bookings_request();
		}
		echo json_encode($data);
		exit;
	}

	public function delivered_bookings()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->delivered_bookings();
		}
		echo json_encode($data);
		exit;
	}

	public function cus_data()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->cus_data();
		}
		echo json_encode($data);
		exit;
	}

	public function pending_request()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->pending_request();
		}
		echo json_encode($data);
		exit;
	}

	public function pendingorder_list()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->pendingorder_list();
		}
		echo json_encode($data);
		exit;
	}

	public function pending_delivery()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->pending_delivery();
		}
		echo json_encode($data);
		exit;
	}

	function load_terminatesession()
	{
		$this->load->view("terminate_session");
	}
	function terminate_usersession()
	{
		$this->load->model('login_model');
		if ($this->login_model->terminate_existingsession()) {
			$this->load->library("session");
			$data = array(
				'username' => $this->input->post('user_name'),
				'is_logged_in' => true
			);
			$this->session->set_userdata($data);
			$values = $this->login_model->get_values();
			$data = array(
				'company_name' => $values['company_name'],
				'is_trade'     => $values['is_trade']
			);
			$this->session->set_userdata($data);
			setcookie('terminate_admin', $this->input->post('user_name'), time() - 3600, "/");
			redirect("C_main/load_mainpage");
		} else {
			redirect("C_main/index/Invalid code");
		}
	}
	function enable_trade($status, $clear_pendingOrders)
	{
		$this->load->model('login_model');
		$return = $this->login_model->enable_trade($status, $clear_pendingOrders);
		redirect("C_main/load_mainpage");
	}
	public function get_graphdata()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$data['records'] = $this->login_model->get_graphdata();
		}
		echo json_encode($data);
		exit;
	}

	public function get_booking_trends()
	{
		$this->load->model('login_model');
		if ($this->login_model->check_to_clear_session() == false) {
			$this->logout();
		} else {
			$from_date = $this->input->post('from_date');
			$to_date = $this->input->post('to_date');

			if (empty($from_date)) {
				$from_date = date('Y-m-d', strtotime('-1 year'));
			}
			if (empty($to_date)) {
				$to_date = date('Y-m-d');
			}

			$data = $this->login_model->get_booking_trends($from_date, $to_date);
		}
		echo json_encode($data);
		exit;
	}

	public function clear_flash()
	{
		$this->load->library('session');
		$this->session->unset_userdata('success');
		$this->session->unset_userdata('error');
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */