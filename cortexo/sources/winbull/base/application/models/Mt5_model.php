<?php
class Mt5_model extends CI_Model
{
	public function execute($orderData)
	{
		$lot = isset($orderData['lots']) ? $orderData['lots'] : null;
		$contact_symbol = isset($orderData['contact_symbol']) ? $orderData['contact_symbol'] : null;
		$book_no = isset($orderData['book_no']) ? $orderData['book_no'] : null;
		$metalType = isset($orderData['metalType']) ? (int)$orderData['metalType'] : null;
		$hedge_url = isset($orderData['hedge_url']) ? $orderData['hedge_url'] : null;

		if ($lot <= 0) {
			$this->logResponse("Hedge: invalid lot value: " . var_export($orderData, true));
			return false;
		} elseif ($hedge_url == '') {
			$this->logResponse("Hedge: empty hedge URL: " . var_export($orderData, true));
			return false;
		}

		if ($metalType === 0 && $lot > 0) {
			$url = $hedge_url;
		} else {
			$url = $hedge_url;
		}
		return $this->sendCurlRequest($url);
	}

	private function sendCurlRequest($url)
	{
		$curl = curl_init();
		curl_setopt_array($curl, [
			CURLOPT_URL => $url,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_ENCODING => '',
			CURLOPT_MAXREDIRS => 10,
			CURLOPT_TIMEOUT => 30,
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
			CURLOPT_CUSTOMREQUEST => 'GET',
		]);

		$response = curl_exec($curl);
		$curlErrNo = curl_errno($curl);
		$curlErr = curl_error($curl);
		curl_close($curl);

		if ($curlErrNo) {
			$this->logResponse("cURL error ({$curlErrNo}): {$curlErr}. URL: {$url}");
			return false;
		}

		// log full response
		$this->logResponse($response);

		$this->updateautoheadgedata($response);
	}

	private function logResponse($response)
	{
		$log = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
			"MT5 Response: " . print_r($response, true) . PHP_EOL .
			"-------------------------" . PHP_EOL;

		file_put_contents('logs/mt5hedge_log', $log, FILE_APPEND);
	}

	function updateautoheadgedata($response)
	{
		if (strpos($response, 'failed') == false) {
			$mt5response = json_decode($response, true);
			if (sizeof($mt5response) == 11) {
				$hedge_data = array(
					"dealid" 	=> $mt5response[1],
					"orderid" 	=> $mt5response[2],
					"volume"  	=> $mt5response[3],
					"price"  	=> $mt5response[4],
					"bid"		=> $mt5response[5],
					"ask"		=> $mt5response[6],
					"comment"	=> $mt5response[7],
					"request_id" => $mt5response[8],
					"symbol"	=>  $mt5response[10][3]
				);
				$this->CI->db->insert("dt_mt5_hedgedata", $hedge_data);

				$hedge_id_no = $this->CI->db->insert_id();

				// notify admins whatsapp
				$hedgestatus = "Dear Admin, Booking placed in MT5.";
				$whatsapp_content = $hedgestatus . "
									Book No: " . $hedge_id_no . "
									Hedge Qty: " . ($mt5response[3] * 10) . "
									Hedge Price: " . $mt5response[4] . "
									Time: " . date('d-m-Y H:i:s');
				$nos = $this->get_admin_nos();
				$mobile = '';
				if ($nos['is_admin_mob1'] == 1 && trim($nos['admin_mob1']) != '')
					$mobile = $mobile . trim($nos['admin_mob1']) . ",";
				if ($nos['is_admin_mob2'] == 1 && trim($nos['admin_mob2']) != '')
					$mobile = $mobile . trim($nos['admin_mob2']) . ",";
				if ($nos['is_admin_mob3'] == 1 && trim($nos['admin_mob3']) != '')
					$mobile = $mobile . trim($nos['admin_mob3']) . ",";
				if ($nos['is_admin_mob4'] == 1 && trim($nos['admin_mob4']) != '')
					$mobile = $mobile . trim($nos['admin_mob4']) . ",";
				if ($nos['is_admin_mob5'] == 1 && trim($nos['admin_mob5']) != '')
					$mobile = $mobile . trim($nos['admin_mob5']);

				if (substr(trim($mobile), -1) == ',') {
					$mobile =  substr($mobile, 0, -1);
				}

				$str_arr = explode(",", $mobile);

				foreach ($str_arr as $mob => $cusmobile) {
					//$resp = whatsapp_message_helper($cusmobile, $whatsapp_content);
				}
			} else {
				$this->CI->db->query("update dt_generalsettings set is_hedge=0");
				$mail_det = $this->enquiry_mail_details();
				$mail_server = $mail_det['admin_mail'];
				$email_id = $mail_server;
				$email_ccid = "";
				$email_subject = "Booking not placed in MT5 -" . Globals::$web_title;
				$email_content = "Dear Admin, Booking not placed in MT5. Now MT5 hedge is OFF";

				/* Sending admin, hedge status */
				$nos = $this->get_admin_nos();

				$mobile = '';
				if ($nos['is_admin_mob1'] == 1 && trim($nos['admin_mob1']) != '')
					$mobile = $mobile . trim($nos['admin_mob1']) . ",";
				if ($nos['is_admin_mob2'] == 1 && trim($nos['admin_mob2']) != '')
					$mobile = $mobile . trim($nos['admin_mob2']) . ",";
				if ($nos['is_admin_mob3'] == 1 && trim($nos['admin_mob3']) != '')
					$mobile = $mobile . trim($nos['admin_mob3']) . ",";
				if ($nos['is_admin_mob4'] == 1 && trim($nos['admin_mob4']) != '')
					$mobile = $mobile . trim($nos['admin_mob4']) . ",";
				if ($nos['is_admin_mob5'] == 1 && trim($nos['admin_mob5']) != '')
					$mobile = $mobile . trim($nos['admin_mob5']);

				if (substr(trim($mobile), -1) == ',') {
					$mobile =  substr($mobile, 0, -1);
				}

				$str_arr = explode(",", $mobile);

				foreach ($str_arr as $mob => $cusmobile) {
					$resp = whatsapp_message_helper($cusmobile, $email_content);
				}

				email_notification_helper($email_id, $email_subject, $email_content, $email_ccid);
				$logstatus = 0;
				$this->updateHedgeONOFFLog($logstatus);
			}
		}
	}
	/**
	 * Return mail server details
	 */
	function enquiry_mail_details()
	{
		$query = $this->CI->db->query("SELECT admin_company_name,admin_mail_server,admin_mail_password,admin_mail FROM dt_generalsettings");
		return $query->row_array();
	}
	/**
	 * Admin mobile numbers 
	 */
	function get_admin_nos()
	{
		$result = array();
		$resultset = $this->CI->db->query("SELECT is_admin_mob1,is_admin_mob2,is_admin_mob3,is_admin_mob4,is_admin_mob5,admin_mob1,admin_mob2,admin_mob3,admin_mob4,admin_mob5 FROM dt_generalsettings");
		foreach ($resultset->result() as $row) {
			$result['is_admin_mob1']	 = $row->is_admin_mob1;
			$result['is_admin_mob2']     = $row->is_admin_mob2;
			$result['is_admin_mob3']	 = $row->is_admin_mob3;
			$result['is_admin_mob4']     = $row->is_admin_mob4;
			$result['is_admin_mob5']	 = $row->is_admin_mob5;
			$result['admin_mob1']     	 = "91" . $row->admin_mob1;
			$result['admin_mob2']	 	 = "91" . $row->admin_mob2;
			$result['admin_mob3']     	 = "91" . $row->admin_mob3;
			$result['admin_mob4']	 	 = "91" . $row->admin_mob4;
			$result['admin_mob5']    	 = "91" . $row->admin_mob5;
		}
		return $result;
	}

	/**
	 * Insert a log entry when hedge toggles
	 */
	function updateHedgeONOFFLog($status)
	{
		$ipaddr = $_SERVER['SERVER_ADDR'];
		$log_shortdesc = ($status == 1) ? "MT5 Hedge Enabled(Auto)" : "MT5 Hedge Disabled(Auto)";
		$logtype = 12;
		$logdatetime = date('Y-m-d H:i:s');
		$logupdatedata = date('Y-m-d H:i:s');
		$this->CI->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('" . $logdatetime . "','" . $logtype . "','" . $logupdatedata . "','" . $log_shortdesc . "','','NULL','NULL','NULL','','" . $ipaddr . "')");
	}

	// public function autoHedge()
	// {
	// 	$receivedata = $this->input->post(); // assuming data comes via POST
	// 	$data = (object)$receivedata['data']; // assuming nested structure
	// 	$confirm_type = isset($receivedata['confirm_type']) ? $receivedata['confirm_type'] : 0;
	// 	$booked_qty = isset($receivedata['booked_qty']) ? $receivedata['booked_qty'] : 0;
	// 	$booking_rate = isset($receivedata['booking_rate']) ? $receivedata['booking_rate'] : 0;
	// 	$return_data = isset($receivedata['return_data']) ? $receivedata['return_data'] : [];

	// 	// === START FIRST HEDGE CHECK ===
	// 	if ($data->is_hedge == 1 && $confirm_type == 1) {
	// 		if ($receivedata['book_by'] != 3 && $receivedata['book_by'] != 4) {

	// 			if ($data->com_type == 0) {
	// 				$orderwt = ($booked_qty * 1000);

	// 				if ($orderwt < 100) {
	// 					$contact_symbol = $data->gold_hedgecontract_mini;
	// 					$minorderwt = $data->gold_hedge_mini_lot_qty;
	// 					$lotwt = 100;
	// 				} else {
	// 					$contact_symbol = $data->gold_hedgecontract;
	// 					$minorderwt = $data->gold_hedge_lot_qty;
	// 					$lotwt = 1000;
	// 				}

	// 				$lots = floor($orderwt / ($lotwt / 10));
	// 				if (($orderwt % ($lotwt / 10)) >= $minorderwt) {
	// 					$lots += 1;
	// 				}
	// 				$totlot = $lots / 10;
	// 			}

	// 			if ($data->com_type == 0 && $totlot > 0) {
	// 				$this->sendCurlRequest("http://11111111111111111111111111111", $return_data);
	// 			} else {
	// 				$this->sendCurlRequest("", $return_data);
	// 			}
	// 		}
	// 	}
	// 	// === END FIRST HEDGE CHECK ===

	// 	// === START SECOND HEDGE CHECK ===
	// 	// if ($receivedata['book_by'] != 3 && $receivedata['book_by'] != 4) {

	// 	// 	if ($data->com_type == 0) {
	// 	// 		$contact_symbol = $data->gold_hedgecontract;
	// 	// 		$minorderwt = $data->gold_hedge_lot_qty;
	// 	// 		$orderwt = ($booked_qty * 1000);
	// 	// 		$lotwt = 100;
	// 	// 		$totlot = floor($orderwt / $lotwt);
	// 	// 		if (($orderwt % $lotwt) >= $minorderwt) {
	// 	// 			$totlot += 1;
	// 	// 		}
	// 	// 	} else {
	// 	// 		$contact_symbol = $data->silver_hedgecontract;
	// 	// 	}

	// 	// 	$totlot = $totlot / 10;

	// 	// 	if ($data->com_type == 0) {
	// 	// 		$this->handleGoldHedge($totlot, $contact_symbol, $booking_rate, $return_data);
	// 	// 	} else {
	// 	// 		$this->handleSilverHedge($totlot, $contact_symbol, $booking_rate, $return_data);
	// 	// 	}
	// 	// }
	// }

	// private function handleGoldHedge($totlot, $contact_symbol, $booking_rate, $return_data)
	// {
	// 	$maxRequestQty = 50;

	// 	while ($totlot > 0) {
	// 		$requestQty = min($totlot, $maxRequestQty);
	// 		$lot = number_format($requestQty, 2, '.', '');

	// 		$this->sendCurlRequest("http://rrrrrrrrrrrrrrrrrrrr", $return_data);
	// 		$totlot -= $requestQty;
	// 	}

	// 	$this->storeMT5SampleData($contact_symbol, $booking_rate, $totlot, $return_data);
	// }

	// private function handleSilverHedge($totlot, $contact_symbol, $booking_rate, $return_data)
	// {
	// 	$this->sendCurlRequest("http://xxxxxxxxxxxxxxxxxxxxxxxxxx", $return_data);
	// 	$this->storeMT5SampleData($contact_symbol, $booking_rate, $totlot, $return_data);
	// }

	// private function storeMT5SampleData($contact_symbol, $booking_rate, $totlot, $return_data)
	// {
	// 	$mt5responsedeal = mt_rand(100000, 999999);
	// 	$mt5responseorder = mt_rand(100000, 999999);
	// 	$mt5responserequst = mt_rand(100000, 999999);

	// 	$hedge_data = [
	// 		"dealid"     => $mt5responsedeal,
	// 		"orderid"    => $mt5responseorder,
	// 		"volume"     => $totlot,
	// 		"price"      => $booking_rate,
	// 		"bid"        => $booking_rate - 5,
	// 		"ask"        => $booking_rate,
	// 		"comment"    => '',
	// 		"request_id" => $mt5responserequst,
	// 		"symbol"     => $contact_symbol,
	// 		"cusbookid"  => $return_data["book_no"]
	// 	];

	// 	$this->db->insert("dt_mt5_hedgedata", $hedge_data);
	// 	$this->db->where('book_no', $return_data["book_no"]);
	// 	$this->db->update('dt_booking', ["book_ishedge" => 1]);
	// }

}
