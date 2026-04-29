<?php
header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
class C_trade extends CI_Controller {

	var $TRADE_MODEL = "trade_model";

	public function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model("trade_model");
		$this->load->library('session');
		$this->load->helper("lmx/classes/trading_helper.php");
		$this->load->helper("lmx/functions/notifications_helper.php");

		date_default_timezone_set('Asia/Kolkata');
	}

	function booking_request() 
	{
		$username = $this->session->userdata('username') && $this->session->userdata('username') != "" ? $this->session->userdata('username') : "";
		$tradeObj = new Trading();

		$cusData  = $tradeObj->get_customerid($username);
		$cus_active = isset($cusData['cus_active']) && $cusData['cus_active'] == 1 ? 1 : 0;

		if($username == "" || $cus_active == 0)
		{
			$return_data['success'] = false;
			$return_data["is_logged_out"] = true;
			$this->session->sess_destroy();
		}
		else
		{
			$data = $_POST;
			$data['mobile']=$username;
			$data['book_by'] = 0;

			$this->db->trans_begin();
			$return_data = $tradeObj->insert_record($data);				
			if($this->db->trans_status()===TRUE)
			{
				$this->db->trans_commit();
				$return_data['success'] = true;
				if($return_data['status'] == 1)
				{
					if($_POST['request_type'] == 0)
					{
						$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
						if($url != '')
						{
							$return_array['book'] = array('bookupdate' => 1,'confirm_type' => $return_data['confirm_type']);
							$field_string = http_build_query($return_array);
							curl_helper($url, $field_string);
						}
					}
					else
					{
						$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
						if($url != '')
						{
							$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
							$field_string = http_build_query($return_array);
							curl_helper($url, $field_string);
						}
					}
				}
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
		$username = $this->session->userdata('username') && $this->session->userdata('username') != "" ? $this->session->userdata('username') : "";
		$tradeObj = new Trading();

		$cusData  = $tradeObj->get_customerid($username);
		$cus_active = isset($cusData['cus_active']) && $cusData['cus_active'] == 1 ? 1 : 0;
		if($username == "" || $cus_active == 0)
		{
			$return_data['success'] = false;
			$return_data["is_logged_out"] = true;
			$this->session->sess_destroy();
		}
		else
		{
			$data = $_POST;
			$data['book_by'] = 2;

			$this->db->trans_begin(); 
			$return_data = $tradeObj->update_order($data);				
			if($this->db->trans_status()===TRUE)
			{
				$this->db->trans_commit();
				if($return_data['status'] == 1)
				{
					$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
					if($url != '')
					{
						$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
						$field_string = http_build_query($return_array);
						curl_helper($url, $field_string);
					}
					$result = $tradeObj->updatelimitorderadmin($data['book_no']);
				}
			}
			else
			{
				$this->db->trans_rollback();
			}
		}
		echo json_encode($return_data); 
	}
	function booking_request_cancel() {
		$username = $this->session->userdata('username') && $this->session->userdata('username') != "" ? $this->session->userdata('username') : "";
		$tradeObj = new Trading();

		$cusData  = $tradeObj->get_customerid($username);
		$cus_active = isset($cusData['cus_active']) && $cusData['cus_active'] == 1 ? 1 : 0;
		if($username == "" || $cus_active == 0)
		{
			$return_data['success'] = false;
			$return_data["is_logged_out"] = true;
			$this->session->sess_destroy();
			echo json_encode($return_data);
		}
		else
		{
			$cus_id = $cusData['cus_id'];
			$book_no = $_POST['book_no'];
			$this->db->trans_begin();  
			$return_data = $tradeObj->customerordercancel($cus_id, $book_no);
			if($return_data['status'] == 1)
			{
				$this->db->trans_commit();
				$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
				if($url != '')
				{
					$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
					$field_string = http_build_query($return_array);
					curl_helper($url, $field_string);
				}
			}
			else
			{
				$this->db->trans_rollback();
			}
			echo json_encode($return_data);
		}
	}
	/* sending sms/email/notification to user/admin on booking */
	function notifyBooking()
	{
		$book_no = $_POST['book_no'];

		if(is_numeric($book_no) && $book_no > 0)
		{
			$tradeObj = new Trading();
			$result  = $tradeObj->notifyBooking($book_no);
		}
	}
	function get_tradingdatas()
	{
		$result = array();
		$cus_id = $this->session->userdata('userid');
		if(is_numeric($cus_id) && $cus_id > 0)
		{
			$tradeObj = new Trading();
			$result['tradeStatus'] = $tradeObj->get_commoditystatus($cus_id);
			$result['available_balance'] = $tradeObj->get_availablebalance($cus_id);
		}
		echo json_encode($result);
	}
	function load_pendingorders()
	{
		$result = array();
		$cus_id = $this->session->userdata('userid');
		if(is_numeric($cus_id) && $cus_id > 0)
		{
			$tradeObj = new Trading();
			$result['orders'] = $tradeObj->load_pendingorders($cus_id);
		}
		echo json_encode($result);
	}
	function viewreport() {
		if($this->session->userdata('username') == 'guest' || $this->session->userdata('username') == '')
		{
		   redirect("C_client_main/logout");
		}
		else 
		{
			$this->load->view("bookheader");
			$this->load->view("reports");
			$this->load->view("bookfooter");
		}
	}
	public function get_booking_report($model_name="", $type="", $fromdate="", $todate="", $comType="")
    {
		$result = array();
		$cus_id = $this->session->userdata('userid');
		if(is_numeric($cus_id) && $cus_id > 0)
		{
			$tradeObj = new Trading();
			$result = $tradeObj->get_booking_report($cus_id, $fromdate, $todate, '-1', $type);
		}
    	echo json_encode ($result);
	}
	public function pendingdelv_report($model_name="", $type="", $fromdate="", $todate="", $comType="")
    {
		$result = array();
		$cus_id = $this->session->userdata('userid');
		if(is_numeric($cus_id) && $cus_id > 0)
		{
			$tradeObj = new Trading();
			$result = $tradeObj->getpendingdelvreport($cus_id);
		}
    	echo json_encode ($result);
	}
	public function get_pending_order($model_name="", $type="", $code="",$fromdate="",$todate="", $comType="")
    {
		$result = array();
		$cus_id = $this->session->userdata('userid');
		if(is_numeric($cus_id) && $cus_id > 0)
		{
			$tradeObj = new Trading();
			$result = $tradeObj->getcustomerallopenorders($cus_id, $fromdate, $todate, '-1', $type);	
    	}
    	echo json_encode ($result);
	}
	public function get_clientlimit($model_name="",$code="")
	{
		$result = array();
		$cus_id = $this->session->userdata('userid');
		if(is_numeric($cus_id) && $cus_id > 0)
		{
			$tradeObj = new Trading();
			$result = $tradeObj->get_clientlimit($cus_id)->result_array();
		}
    	echo json_encode ($result);
	}
	public function get_customertransactions()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_customertransactions();
    	echo json_encode ($data);
	}
	/*public function get_client_transaction()
	{
		$trade_model = $this->TRADE_MODEL;
		$data = $this->$trade_model->get_client_transaction();
    	echo json_encode ($data);
	}*/
	function unfixreport() {
        if($this->session->userdata('username') == 'guest' || $this->session->userdata('username') == '')
        {
           redirect("C_client_main/logout");
        }
        else 
        {
            $this->load->view("bookheader");
            $this->load->view("unfixreports");
            $this->load->view("bookfooter");
        }
    }
	function get_unfix_payment()
    {
		$result = array();
		$cus_id = $this->session->userdata('userid');
		$tradeObj = new Trading();
		$result = $tradeObj->unfixreport($cus_id);
		if($_POST['report_type']==1){
			echo  json_encode ($result['unfixpayment']);

		}else{
			echo json_encode ($result['unfixbook']);
		}
		//echo json_encode ($result);
	}
}