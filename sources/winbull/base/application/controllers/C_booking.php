<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
class C_booking extends CI_Controller
{
	var $cus_id = '';
	public function __construct()
	{
		parent::__construct();
		$this->load->database();
		$this->load->model("booking_model");
		$this->load->library('session');
	}
	function rates()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_commodity_data();
		$this->load->view("header", $data);
		$this->load->view("booking", $data);
		$this->load->view("footer");
	}
	function index()
	{
		if (!$this->session->userdata('username') || $this->session->userdata('username') == 'guest' || $this->session->userdata('username') == '') {
			$tradeObj = new Trading();
			$data = $tradeObj->get_commodity_data();
			$data['is_logged_in'] = FALSE;
			$this->load->view("header", $data);
			$this->load->view("booking", $data);
			$this->load->view("footer", $data);
		} else {
			redirect("C_booking/book");
		}
	}
	function Home()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_commodity_data();
		$this->load->view("header_home", $data);
		$this->load->view("home", $data);
		$this->load->view("footer");
	}
	public function getcommodities()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_commodity_data();
		echo json_encode($data);
	}
	// public function get_commodity_data(){
	// 	$tradeObj = new Trading();
	// 	$data['commodity'] = $tradeObj->display_commodity_data();
	// 	$data['contracts'] = $this->booking_model->get_rpanelcontracts();
	// 	echo json_encode($data);
	// }
	public function get_commodity_data()
	{
		$tradeObj = new Trading();
		if ($this->session->userdata('username') == 'guest' || $this->session->userdata('username') == '') {
			$data['commodity'] = $tradeObj->display_commodity_data();
		} else {
			$username = $this->session->userdata('username');
			$return_customer = $tradeObj->get_customerid($username);
			$data['commodity'] = $tradeObj->get_trading_data($return_customer['cus_id']);
		}
		$data['contracts'] = $this->booking_model->get_rpanelcontracts();
		echo json_encode($data);
	}
	public function get_rpanel_data()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_commodity_data();
		echo json_encode($data);
	}
	public function getmarqueetext()
	{
		$data = $this->booking_model->get_marqueetext();
		echo json_encode($data);
	}
	public function get_admintext()
	{
		$data = $this->booking_model->get_admin_text();
		echo json_encode($data);
	}
	public function getMarqueNews()
	{
		$data = $this->booking_model->get_MarqueNews();
		echo json_encode($data);
	}
	public function getadvertisements()
	{
		$this->load->model("booking_model");
		echo $this->booking_model->getadvertisements();
	}
	public function getmobileappevents()
	{
		$this->load->model("booking_model");
		echo $this->booking_model->getmobileappevents();
	}
	public function getmobileappvideos()
	{
		$this->load->model("booking_model");
		echo $this->booking_model->getmobileappvideos();
	}
	public function getgallery()
	{
		$this->load->model("booking_model");
		echo $this->booking_model->getgallery();
	}
	public function getgallerygold()
	{
		$this->load->model("booking_model");
		echo $this->booking_model->getgallerygold();
	}
	public function getgallerysilver()
	{
		$this->load->model("booking_model");
		echo $this->booking_model->getgallerysilver();
	}
	function book()
	{
		if ($this->session->userdata('username') == 'guest' || $this->session->userdata('username') == '') {
			$this->session->set_flashdata('errorMsg', "Oops! Session Expired. Please login and continue");
			redirect("C_client_main/index");
		} else {
			$tradeObj = new Trading();
			$username = $this->session->userdata('username');

			$data = $tradeObj->get_commodity_data();

			$data['customer_discount'] = $tradeObj->get_customerid($username);

			$return_customer = $tradeObj->get_customerid($username);
			$data = $tradeObj->get_tradecommodity_data($return_customer['cus_id']);
			// print_r($data);exit;
			$data['is_logged_in'] = TRUE;
			$this->load->view("bookheader", $data);
			$this->load->view("bookrates", $data);
			$this->load->view("bookfooter", $data);
		}
	}
	public function gettds()
	{
		$data = $this->booking_model->get_tdsvalue();
		echo json_encode($data);
	}

	public function historicaldata()
	{
		$url = Globals::$bcurl;
		$postData = json_encode(['client' => Globals::$bcclient]);

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			'Content-Type: application/json',
			'Content-Length: ' . strlen($postData)
		));
		$response = curl_exec($ch);
		if (curl_errno($ch)) {
			echo 'cURL Error: ' . curl_error($ch);
			curl_close($ch);
			return;
		}

		echo "Raw API Response: <pre>";
		print_r($response);
		echo "</pre>";

		$rows = explode("\n", $response);
		$this->load->model("booking_model");

		foreach ($rows as $row) {
			if (trim($row) == '') continue;

			preg_match_all('/"([^"]*)"|([^\s]+)/', $row, $matches);

			$record = array_map(function ($value1, $value2) {
				return $value1 !== "" ? $value1 : $value2;
			}, $matches[1], $matches[2]);

			if (count($record) < 10) {
				echo "Invalid record format: " . $row;
				continue;
			}

			if ($record[0] == 3 || $record[0] == 1  || $record[0] == 4) {
				$data = [
					'hd_category' => $record[0],
					'hd_code' => $record[1],
					'hd_comname' => $record[2],
					'hd_bid' => is_numeric($record[3]) ? $record[3] : null,
					'hd_ask' => is_numeric($record[4]) ? $record[4] : null,
					'hd_high' => is_numeric($record[5]) ? $record[5] : null,
					'hd_low' => is_numeric($record[6]) ? $record[6] : null,
					'hd_ltp' => is_numeric($record[7]) ? $record[7] : null,
					'hd_open' => is_numeric($record[8]) ? $record[8] : null,
					'hd_close' => is_numeric($record[9]) ? $record[9] : null,
					'hd_date' => date('Y-m-d H:i:s'),
				];

				$this->db->where('hd_code', $record[1]);
				$this->db->where('hd_comname', $record[2]);
				$this->db->where('DATE(hd_date)', date('Y-m-d H:i:s'));
				$existing_record = $this->db->get('dt_historicaldata')->row_array();

				if (!$existing_record) {
					$this->booking_model->historicaldata($data);
				} else {
					echo "Duplicate record found for hd_code: " . $record[1] . " and hd_comname: " . $record[2] . ". Skipping insertion.\n";
				}
			}
		}

		curl_close($ch);

		echo "Data stored successfully!";
	}
	public function calculate_daily_averages()
	{
		$this->load->model("booking_model");
		$this->booking_model->store_daily_averages();
	}
}



/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */
