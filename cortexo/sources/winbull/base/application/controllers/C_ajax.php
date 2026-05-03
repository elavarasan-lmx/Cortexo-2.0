<?php
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
class C_ajax extends CI_Controller {
	public function __construct()
	{
		parent::__construct();
		$this->load->library("session");
		date_default_timezone_set('Asia/Kolkata');
	}			
	function c_get_rate() {
		if($this->login_model->get_booking() && $this->login_model->check_to_clear_session()==false) {			
			$return_data["logout"] = "loggedout";
			echo json_encode($return_data);
		} else {
			$this->load->model("booking_model");
			echo $this->booking_model->m_get_rate();
		}	
	}
	function booking_request() 
	{
		if(!$this->session->userdata('username'))
		{
			$return_data['success'] = false;
			$return_data["is_logged_out"] = true;
		}
		else
		{
			$this->db->trans_begin();
			$this->load->model("booking_model");
			$return_data = $this->booking_model->insert_record();				
			if($this->db->trans_status()===TRUE)
			{
				$this->db->trans_commit();
				if($return_data['status'])
					wincache_ucache_set($this->config->item('win_bookUpdateTime'), time());
				$return_data['success'] = true;
			}
			else
			{							
				$this->db->trans_rollback();	
				$return_data['success'] = false;
			}
		}
		echo json_encode($return_data); 
	}
	function booking_request_update() {
		if(!$this->session->userdata('username'))
		{
			$return_data['success'] = false;
			$return_data["is_logged_out"] = true;
			echo json_encode($return_data); 
		}
		else
		{
			$this->db->trans_begin(); 
			$this->load->model("booking_model");
			$this->booking_model->update_order();				
			if($this->db->trans_status()===TRUE)
			{
				$this->db->trans_commit();
				wincache_ucache_set($this->config->item('win_bookUpdateTime'), time());
				$data['error']	=	1;
			}
			else
			{
				$this->db->trans_rollback();
				$data['error']	=	0;
			}
		}
	}
	function booking_request_cancel() {
		if(!$this->session->userdata('username'))
		{
			$return_data['success'] = false;
			$return_data["is_logged_out"] = true;
			echo json_encode($return_data);
		}
		else
		{
			$this->db->trans_begin();  
			$this->load->model("booking_model");
			$this->booking_model->cancel_order();				
			if($this->db->trans_status()===TRUE)
			{									 
				$this->db->trans_commit();
				wincache_ucache_set($this->config->item('win_bookUpdateTime'), time());
				$data['error']="success";
			}
			else
			{							
				$this->db->trans_rollback();	
				$data['error']			=	"failure";
			}
		} 
	}
	/* sending sms/email/notification to user/admin on booking */
	function notifyBooking()
	{
		$book_no = $_POST['book_no'];
		$tradeObj = new Trading();
		$resp = $tradeObj->notifyBooking($book_no);
	}

	function getavailableqty() {
		if(!$this->session->userdata('username'))
		{
			$this->session->set_flashdata('errorMsg',"Oops! Session Expired. Please login and continue");
			$return_data["is_logged_out"] = true;
			echo json_encode($return_data);
		}
		else
		{
			$this->load->model("booking_model");
			echo $this->booking_model->get_available_qty();
		}
	}
	function check_session() {
		$this->load->model("login_model");
		if($this->login_model->check_to_clear_session()==false) {
			echo "loggedout";
		} else {			
			echo " ";
		}
	}

	function check_userpwd()
	{
		$this->load->model("Login_model");
		echo $this->Login_model->check_userpwd($_POST['username'],$_POST['password']);	
	}
	function get_tradingstatus()
	{
		$this->load->model("booking_model");
		echo json_encode($this->booking_model->get_commoditystatus($_POST['cust_id']));	
	}
	function get_tolerance()
	{
		$this->load->model("booking_model");
		echo json_encode($this->booking_model->get_tolerance());	
	}
	function get_tradingdatas()
	{
		$cus_id = $this->session->userdata('userid');
		$this->load->model("booking_model");
		$result['tradeStatus'] = $this->booking_model->get_commoditystatus($cus_id);
		$result['tolerance'] = $this->booking_model->get_tolerance();
		$result['tradeData'] = $this->booking_model->get_tradingdatas($cus_id);
		echo json_encode($result);
	}
	function load_pendingorders()
	{
		$cus_id = $this->session->userdata('userid');
		$com_id = isset($_POST['com_id']) ? $_POST['com_id'] : NULL;
		$this->load->model("booking_model");
		$result['orders'] = $this->booking_model->load_pendingorders($cus_id, $com_id);
		echo json_encode($result);
	}
	function get_MarqueNews()
	{
		$this->load->model("booking_model");
		echo json_encode($this->booking_model->get_MarqueNews());	
	}
	function get_text()
	{
		$this->load->model("booking_model");
		echo json_encode($this->booking_model->get_text());	
	}
	function get_News()
	{
		$this->load->model("booking_model");
		echo json_encode($this->booking_model->get_News());	
	}
	function customerCommodities()
	{
		$this->load->model("booking_model");		
		echo json_encode($this->booking_model->customerCommodities(trim($_POST['cust_id']), trim($_POST['com_ids'])));
	}
	function get_removedcommodities()
	{
		$return_value = array();
		$this->load->model("booking_model");
		$saved_comm = $this->booking_model->removed_commodities($_POST['cust_id']);
		$saved_comm = explode(',', $saved_comm);
		foreach($saved_comm as $comm)
		{
			if(trim($comm) != '')
			{
				$return_value[] = $comm;
			}
		}
		echo json_encode($return_value);
	}
	function add_remarks()
	{
		$this->load->model("booking_model");
		$return = $this->booking_model->add_remarks($_POST['book_no'],$_POST['remarks']);
		if($return)
			echo json_encode(array("status" => 1));
		else
			echo json_encode(array("status" => 0));
	}
}