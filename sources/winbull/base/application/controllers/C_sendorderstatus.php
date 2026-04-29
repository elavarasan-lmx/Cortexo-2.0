<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description');
class C_sendorderstatus extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		$this->load->database();
		// Load common helper for logging functions
		$this->load->helper('common');
	}
	public function send_ratealertStatus()
	{
		$this->load->model("Booking_model");
		$execOrders = $_POST;
		$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
			"Attempt: " . (print_r($execOrders, true)) . PHP_EOL .
			"-------------------------" . PHP_EOL;
		file_put_contents('logs/ratealert_log', $log, FILE_APPEND);
		// Replace file_put_contents with log_admin_add
		log_admin_add('Rate Alert', 'Order Management', $execOrders, 'Rate alert status sent');
		foreach ($execOrders as $orders) {
			$id = $orders['BNo'];
			$this->Booking_model->update_ratealert($id);
		}
	}
	public function send_orderStatus()
	{

		/* 		$_POST = array((array)json_decode(file_get_contents('php://input')));
		$execOrders = $_POST;

		$tradeObj = new Trading();
 */
		$execOrders = $_POST;

		$tradeObj = new Trading();

		//adding in log (path : logs/limitupdates_log)
		$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
			"FN (send_orderStatus): " . (print_r($execOrders, true)) . PHP_EOL .
			"-------------------------" . PHP_EOL;
		file_put_contents('logs/limitupdates_log', $log, FILE_APPEND);

		// Replace file_put_contents with log_admin_add
		log_admin_add('Order Status', 'Order Management', $execOrders, 'Order status sent');

		$confirm_type = "";
		foreach ($execOrders as $orders) {
			$id = $orders['BNo'];
			$sms_id = 1;
			$cur_date = isset($orders['confirmedon']) ? $orders['confirmedon'] : date('Y-m-d H:i:s');

			$oDetail = $tradeObj->get_orderdetails($id)->result_array();
			$cus_name    		 = $oDetail[0]['cus_name'];
			$cus_id    		 	 = $oDetail[0]['book_cusid'];
			$com_type    		 = $oDetail[0]['com_type'];
			$com_name  			 = $oDetail[0]['com_name'];
			$company_name   	 = $oDetail[0]['admin_company_name'];
			$cus_company_name    = $oDetail[0]['cus_company_name'];
			$book_qty 			 = $oDetail[0]['book_bar_type'] == 0 ? ($oDetail[0]['book_qty'] * 1000) . " gms" : ($oDetail[0]['book_qty']) . " kg";
			$booked_qty          = $oDetail[0]['book_qty'];
			$book_rate 		 	 = $oDetail[0]['book_rate'];
			$book_type 		 	 = $oDetail[0]['book_type'];
			$book_deviceid 	     = $oDetail[0]['book_deviceid'];
			$cus_mobile	 	 	 = $oDetail[0]['cus_mobile'];
			$book_comweight	 	 = $oDetail[0]['book_comweight'];
			$com_margin_type	 = $oDetail[0]['com_margin_type'];
			$com_margin_value	 = $oDetail[0]['com_margin_value'];
			$has_margin      	 = $oDetail[0]['display_margin'];
			$margin_reverse_type = $oDetail[0]['margin_reverse_type'];
			$book_totalcost 	 = $oDetail[0]['book_totalcost'];
			$book_ishedge 		 = $oDetail[0]['book_ishedge'];
			$hedge_price	 	 = $oDetail[0]['price'];
			$mt5qty			 	 = $oDetail[0]['mt5qty'];
			$book_comid			 = $oDetail[0]['book_comid'];

			$stat       		 = $oDetail[0]['confirmation_for'];
			$confirm_type = $stat;
			$available_balance = $tradeObj->get_availablebalance($cus_id);

			$totalcost = round(($book_rate / $book_comweight) * ($booked_qty) * 1000, 2);

			$margin_validation = true;
			if ($has_margin == 1 && $stat == 1) {
				//Margin calculation
				$margin_hold = 0;
				if ($has_margin) {
					if ($com_margin_type == 0)
						$margin_hold = $totalcost * $com_margin_value / 100;
					else
						$margin_hold = $booked_qty * $com_margin_value;
				}

				if ($available_balance >= $margin_hold)
					$margin_validation = true;
				else
					$margin_validation = false;
			}
			if ($margin_validation) {
				$resultset = $this->db->query("SELECT com_name, com_rest_wt ,rcom_comtype
				from  dt_com_master 
				LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
				where com_id='" . $book_comid . "' 
				");
				$query_name = $this->db->query("SELECT admin_stockmanage FROM dt_generalsettings");
				$stock_manage 	= $query_name->row()->admin_stockmanage;
				if ($resultset->num_rows() > 0) {
					$goldwt_info = $resultset->row_array();
					$stock_manage = $goldwt_info['rcom_comtype']  == 1 ? $stock_manage : $stock_manage / 1000;
					$com_restwt	  = $goldwt_info['rcom_comtype']  == 1 ? $goldwt_info['com_rest_wt'] : $goldwt_info['com_rest_wt'] / 1000;
					if ($com_restwt < $stock_manage || $com_restwt == $stock_manage) {
						/* $is_cancelled = $tradeObj->limit_expire($id,5);
						if($is_cancelled)
						{
							$messageForCustomer = "Dear ".$cus_name.", Your booking(book no:".$id.") for ".$com_name." with qty ".($book_qty)." at Rs. ".($book_rate)." is CANCELLED DUE TO INSUFFICIENT Quantity.";
							//$messageForCustomer = $tradeObj->get_admin_SMS(9, $id);

							if($cus_mobile != '')
							{
								$resp = whatsapp_message_helper(trim($cus_mobile,'""'), $messageForCustomer);
								$sms_resp = sms_notification_helper($cus_mobile, $messageForCustomer);
							}

							//Update in Log
							$desc = "Limit order cancelled due to insufficient margin";
							$orders['bookQty'] = $book_qty;
							$tradeObj->updateLimitLog($orders, $desc);
						} */

						//Notification start
						// $senderid = $this->CI->config->item('sms_senderid');
						// $sms_url = $this->CI->config->item('sms_url');	
						// $senderid = Globals::$sms_senderid;
						// $sms_url = Globals::$sms_url;		
						// $nos = $this->get_admin_nos();	

						$nos = $tradeObj->get_admin_nos();

						$message = "Out of Stock Commodity From limit order
									Commodity Name: " . $goldwt_info['com_name'] . "
									Commodity Balance Weight: " . $goldwt_info['com_rest_wt'] . "
									Limit Order No:  " . $id . "
									Customer Name: " . $cus_name . "
									Time : " . date('d-m-Y H:i:s');
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
						if ($mobile != '') {
							$arr = array("@customer_mobile@" => trim($mobile), "@message@" => $message, "@senderid@" => $senderid);
							$user_sms_url = strtr($sms_url, $arr);
							$ch = curl_init();
							curl_setopt($ch, CURLOPT_URL, $user_sms_url);
							curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
							curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
							curl_setopt($ch, CURLOPT_POST, 1);
							curl_setopt($ch, CURLOPT_POSTFIELDS, $user_sms_url);
							$response = curl_exec($ch);
							curl_close($ch);
						}
						$str_arr = explode(",", $mobile);
						foreach ($str_arr as $mob => $cusmobile) {
							$resp = whatsapp_message_helper($cusmobile, $message);
						}
						//Notification
						$message = urldecode($message);
						$content = array(
							"en" => $message
						);
						$hashes_array = array();
						$fields = array(
							'app_id' => Globals::$app_id_admin,
							'included_segments' => array('All'),
							'data' => array(
								"nav" => "1"
							),
							'headings' => array("en" => Globals::$notification_title_admin),
							'subtitle' => array("en" => Globals::$notification_subtitle_admin),
							'contents' => array("en" => $message),
							'web_buttons' => $hashes_array
						);
						$fields = json_encode($fields);

						$ch = curl_init();
						curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
						curl_setopt($ch, CURLOPT_HTTPHEADER, array(
							'Content-Type: application/json; charset=utf-8',
							'Authorization: Basic ' . Globals::$onesingalapi_admin
						));
						curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
						curl_setopt($ch, CURLOPT_HEADER, FALSE);
						curl_setopt($ch, CURLOPT_POST, TRUE);
						curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
						curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

						$response = curl_exec($ch);
						curl_close($ch);
						//Notification

						//Notification End
					}
					//else{
					$is_updated = $tradeObj->update_bookingstatus($id, $stat, $cur_date);
					if ($is_updated) {
						if ($has_margin == 1 && $stat == 1) {
							$trans_items['trans_cuscode'] 		= $cus_id;
							$trans_items['trans_date'] 			= $cur_date;
							$trans_items['trans_code'] 			= $id;
							$trans_items['trans_payment_type'] 	= 1;
							$trans_items['trans_amount'] 		= $margin_hold;
							$trans_items['trans_actype'] 		= 1;
							$trans_items['trans_comments'] 		= "Margin deducted on limit confirmation";
							$trans_items['trans_comtype'] 		= $com_type;
							$trans_items['trans_margin_qty'] 	= $booked_qty;
							$trans_items['trans_book_code'] 	= $id;
							$trans_items['trans_book_type'] 	= $book_type;
							$this->db->insert('dt_transaction', $trans_items);
							unset($trans_items);

							// Margin Reverse

							//Check margin reverse type is 0. (Type 0 : Margin Reverse on booking & delivery). On booking, check the book type on any possible reversal. Eg: If sell 100 gms already booked and current booking is 50 gms buy, 50 gms (lesser qty) of margin is reversed for sell and buy.
							if ($margin_reverse_type == 0) {
								//select the booking with type(sell means select buy, buy means select sell and check for any possiblities of margin squareoff)
								$booktype_mr = $book_type == 0 ? 1 : 0;

								$margin_bal = 0;

								$qMarbal = $this->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = " . $com_type . " AND trans_book_type = " . $booktype_mr . " AND trans_cuscode = " . $cus_id . " GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC");

								if ($qMarbal->num_rows() > 0) {
									foreach ($qMarbal->result() as $qMarbalrow) {
										$margin_bal = $margin_bal + $qMarbalrow->balance_margin_qty;
										$rem_margin[] = array("book_no" => $qMarbalrow->book_no, "balance_margin_amount" => $qMarbalrow->balance_margin_amount, "balance_margin_qty" => $qMarbalrow->balance_margin_qty);
									}

									// *Insert in transaction table for current booking margin reversal*

									//check which is lesser qty(sell qty or buy qty) and choose it. Eg: if 500 gms of sell and 200 gms of buy then buy should be choosen.
									$margin_balqty = $booked_qty <= $margin_bal ? $booked_qty : $margin_bal;

									// calculate amount of that lesser qty(sell or buy).
									$margin_balamt = ($margin_hold / $booked_qty) * $margin_balqty;

									$trans_items['trans_cuscode'] 		= $cus_id;
									$trans_items['trans_date'] 			= $cur_date;
									$trans_items['trans_code'] 			= $id;
									$trans_items['trans_payment_type'] 	= 2;
									$trans_items['trans_amount'] 		= $margin_balamt;
									$trans_items['trans_actype'] 		= 0;
									$trans_items['trans_comments'] 		= "Margin reversal on limit confirmation";
									$trans_items['trans_comtype'] 		= $com_type;
									$trans_items['trans_margin_qty'] 	= $margin_balqty;
									$trans_items['trans_book_code'] 	= $id;
									$trans_items['trans_book_type'] 	= $book_type;
									$this->db->insert('dt_transaction', $trans_items);
									unset($trans_items);

									// *Insert in transaction table for previous booking margin reversal*

									foreach ($rem_margin as $rmar) {
										if ($margin_balqty > 0) {
											//calculations of margin qty and amount of each booking
											if ($rmar['balance_margin_qty'] > $margin_balqty) {
												$marginqty = $margin_balqty;
												$margin_balqty = $margin_balqty - $marginqty;
											} else {
												$marginqty = $rmar['balance_margin_qty'];
												$margin_balqty = $margin_balqty - $marginqty;
											}
											$marginamt = ($rmar['balance_margin_amount'] / $rmar['balance_margin_qty']) * $marginqty;

											$trans_items['trans_cuscode'] 		= $cus_id;
											$trans_items['trans_date'] 			= $cur_date;
											$trans_items['trans_code'] 			= $rmar["book_no"];
											$trans_items['trans_payment_type'] 	= 2;
											$trans_items['trans_amount'] 		= $marginamt;
											$trans_items['trans_actype'] 		= 0;
											$trans_items['trans_comments'] 		= "Margin reversal on limit confirmation";
											$trans_items['trans_comtype'] 		= $com_type;
											$trans_items['trans_margin_qty'] 	= $marginqty;
											$trans_items['trans_book_code'] 	= $rmar["book_no"];
											$trans_items['trans_book_type'] 	= $booktype_mr;
											$this->db->insert('dt_transaction', $trans_items);
											unset($trans_items);
										}
									}
								}
							}
						}
						if ($stat == 1 || $stat == 2) {
							if ($stat == 1)
								$service_id = "5";
							else if ($stat == 2)
								$service_id = "4";

							$data = $tradeObj->get_EmailContent($service_id, $id);
							if ($data != '') {
								if (strlen($data['email_id']) > 0) {
									$email_resp = email_notification_helper($data['email_id'], $data["email_subject"], $data['email_content']);
								}
							}
							$whatsapp_url = $tradeObj->get_whatsappURL($service_id, $id);
							if (isset($whatsapp_url['mobile'])) {

								if (strlen($whatsapp_url['mobile']) > 0) {
									$resp = whatsapp_message_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['message']);
								}
							}

							if ($stat == 1 || $stat == 2) {
								$nos = $tradeObj->get_admin_nos();
								//$message = "Dear Admin, New Limit Order - Executed. Order No:".$id.", Name : ".$cus_name."-".$cus_company_name.", Comm : ".$com_name.", Qty : ".$book_qty.", Rate : ".$book_rate;

								$autohedge = $book_ishedge == 0 ? "Pending" : "Done";
								$hedgeqty = $hedge_price != '' ? $mt5qty . " Grams " . $hedge_price : "";

								/* Hedge: ".$autohedge."
								".$hedgeqty." */

								$message = "Limit Order Executed. 

Client: " . $cus_name . "-" . $cus_company_name . "
Product: " . $com_name . "
Rate: " . $book_rate . "
Quantity: " . $book_qty . "
Trade no: " . $id . "
Total Cost: " . $book_totalcost . "


Time: Time : " . date('d-m-Y H:i:s');

								//$message = $tradeObj->get_admin_SMS(8, $id);

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
								if ($mobile != '') {
									$str_arr = explode(",", $mobile);
									foreach ($str_arr as $mob => $cusmobile) {
										$resp = whatsapp_message_helper($cusmobile, $message);
										$sms_resp = sms_notification_helper($cusmobile, $message);
									}

									/* $resp = whatsapp_message_helper(trim($mobile,'""'), $message);
									$sms_resp = sms_notification_helper($mobile, $message); */
								}
							}
							$sms_url = $tradeObj->get_SMSURL($service_id, $id);

							if ($sms_url != '') {
								$curl_resp = curl_helper($sms_url, $sms_url);
							}
						}

						//Update in Log
						$desc = "Limit order executed";
						$orders['bookQty'] = $book_qty;
						$tradeObj->executeLimitLog($orders, $desc);
					}
					//}
				}
			} else {
				$is_cancelled = $tradeObj->limit_expire($id, 5);
				if ($is_cancelled) {
					$messageForCustomer = "Dear " . $cus_name . ", Your booking(book no:" . $id . ") for " . $com_name . " with qty " . ($book_qty) . " at Rs. " . ($book_rate) . " is CANCELLED DUE TO INSUFFICIENT MARGIN.";
					//$messageForCustomer = $tradeObj->get_admin_SMS(9, $id);

					if ($cus_mobile != '') {
						$resp = whatsapp_message_helper(trim($cus_mobile, '""'), $messageForCustomer);
						$sms_resp = sms_notification_helper($cus_mobile, $messageForCustomer);
					}

					//Update in Log
					$desc = "Limit order cancelled due to insufficient margin";
					$orders['bookQty'] = $book_qty;
					$tradeObj->executeLimitLog($orders, $desc);
				}
			}
		}

		$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
		if ($url != '') {

			$return_array['limit'] = array('limitupdate' => 1, 'book_no' => "1");
			// Replace file_put_contents with log_admin_add
			log_admin_add('Limit Update', 'Order Management', $return_array, 'Limit update triggered');
			$log  = "Limitorder: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
				"returnarray: " . (print_r($return_array, true)) . PHP_EOL .
				"-------------------------" . PHP_EOL;
			file_put_contents('logs/limitupdates_log', $log, FILE_APPEND);
			$field_string = http_build_query($return_array);
			$curl_resp = curl_helper($url, $field_string);
		}

		$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
		if ($url != '' && $confirm_type != '') {
			$return_array['book'] = array('bookupdate' => 1, 'confirm_type' => $confirm_type);
			// Replace file_put_contents with log_admin_add
			log_admin_add('Book Update', 'Order Management', $return_array, 'Book update triggered');

			$field_string = http_build_query($return_array);
			$log  = "bookupdate: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
				"returnarray: " . (print_r($return_array, true)) . PHP_EOL .
				"-------------------------" . PHP_EOL;
			file_put_contents('logs/limitupdates_log', $log, FILE_APPEND);
			$curl_resp = curl_helper($url, $field_string);
		}

		// Log with user-friendly field names
		$this->load->helper('field_labels');
		$user_friendly_log_data = transform_booking_data_for_logging($return_array);
		log_admin_add('Order Status Update', 'Order Management', $user_friendly_log_data, 'Order status updated successfully');
	}
	function limit_expire()
	{
		$expireOrders = $_POST;
		//adding in log (path : logs/limitupdates_log)
		$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
			"FN (limit_expire): " . (print_r($expireOrders, true)) . PHP_EOL .
			"-------------------------" . PHP_EOL;
		file_put_contents('logs/limitupdates_log', $log, FILE_APPEND);
		// Replace file_put_contents with log_admin_add
		log_admin_add('Limit Expire', 'Order Management', $expireOrders, 'Limit expire function called');

		$tradeObj = new Trading();

		foreach ($expireOrders['book_numbers'] as $orders) {
			$id = $orders;
			$is_expired = $tradeObj->limit_expire($id, 4);
			if ($is_expired) {
				$oDetail = $tradeObj->get_orderdetails($id)->result_array();
				$book_deviceid 		= $oDetail[0]['book_deviceid'];
				$cus_name    		= $oDetail[0]['cus_name'];
				$com_name  			= $oDetail[0]['com_name'];
				$book_status 		= $oDetail[0]['book_status'];
				$book_qty 			= $oDetail[0]['book_bar_type'] == 0 ? ($oDetail[0]['book_qty'] * 1000) . " gms" : ($oDetail[0]['book_qty']) . " kg";
				$book_rate      	= $oDetail[0]['book_rate'] + 0;
				$cus_mobile 		= $oDetail[0]['cus_mobile'];
				$book_totalcost 	= $oDetail[0]['book_totalcost'];
				$sms_id = 1;
				//$messageForCustomer = "Dear ".$cus_name.", Your booking(book no:".$id.") for ".$com_name." with qty ".($book_qty)." at Rs. ".($book_rate)." is EXPIRED.";
				$messageForCustomer = "Limit Order Expired. 

Client: " . $cus_name . "
Product: " . $com_name . "
Rate: " . $book_rate . "
Quantity: " . $book_qty . "
Trade no: " . $id . "
Total Cost: " . $book_totalcost . "

Time: Time : " . date('d-m-Y H:i:s');
				//$messageForCustomer = $tradeObj->get_admin_SMS(10, $id);
				if ($cus_mobile != '') {
					$resp = whatsapp_message_helper(trim($cus_mobile, '""'), $messageForCustomer);
					$curl_resp = curl_helper($cus_mobile, $messageForCustomer);
				}
			}
		}

		$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
		if ($url != '') {
			$return_array['limit'] = array('limitupdate' => 1, 'book_no' => "1");
			$field_string = http_build_query($return_array);
			$curl_resp = curl_helper($url, $field_string);
		}

		//Update in Log
		$this->updateLimitExpireLog($expireOrders['book_numbers']);

		// Log with user-friendly field names
		$this->load->helper('field_labels');
		$user_friendly_log_data = transform_booking_data_for_logging($return_array);
		log_admin_add('Limit Expired', 'Order Management', $user_friendly_log_data, 'Limit order expired');
	}
	function update_tradeonoff()
	{
		$setting = $_POST;
		$tradeObj = new Trading();
		// Replace file_put_contents with log_admin_add for trade enable/disable
		if (isset($setting['trade_enable']) && ($setting['trade_enable'] == 0 || $setting['trade_enable'] == 1)) {

			$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
				"FN (update_tradeonoff): " . (print_r($setting, true)) . PHP_EOL .
				"-------------------------" . PHP_EOL;
			file_put_contents('logs/limitupdates_log', $log, FILE_APPEND);

			log_admin_add('Trade On/Off', 'System Settings', $setting, 'Trade on/off setting updated');

			$is_updated = $tradeObj->update_tradeonoff($setting['trade_enable']);

			//Notification for trade on/off Start
			$message = '';
			if ($setting['trade_enable'] == 1) {
				$message = 'Online Trade Starts';
			} else {
				$message = 'Online Trade Closed';
			}
			$content = array(
				"en" => $message
			);
			$hashes_array = array();
			$fields = array(
				'app_id' => isset(Globals::$app_id) ? Globals::$app_id : '',
				'included_segments' => array('All'),
				'data' => array(
					"nav" => "1"
				),
				'headings' => array("en" => Globals::$web_title),
				'subtitle' => array("en" => Globals::$web_title),
				'contents' => array("en" => $message),
				'web_buttons' => $hashes_array
			);
			$fields = json_encode($fields);

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, isset(Globals::$onesignalAPI) ? Globals::$onesignalAPI : '');
			curl_setopt($ch, CURLOPT_HTTPHEADER, array(
				'Content-Type: application/json; charset=utf-8',
				'Authorization: Basic ' . Globals::$onesignalauth
			));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
			curl_setopt($ch, CURLOPT_HEADER, FALSE);
			curl_setopt($ch, CURLOPT_POST, TRUE);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

			$response = curl_exec($ch);
			curl_close($ch);
			//Notification for trade on/off End

			$tradeObj->updateTradeOnOffLog($setting['trade_enable']);
		}
		// Replace file_put_contents with log_admin_add for market on/off
		if (isset($setting['market_onoff']) && ($setting['market_onoff'] == 0 || $setting['market_onoff'] == 1)) {

			$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
				"FN (update_marketonoff): " . (print_r($setting, true)) . PHP_EOL .
				"-------------------------" . PHP_EOL;
			file_put_contents('logs/limitupdates_log', $log, FILE_APPEND);

			log_admin_add('Market On/Off', 'System Settings', $setting, 'Market on/off setting updated');

			$is_updated = $tradeObj->update_marketonoff($setting['market_onoff']);
			$socketObj = new SocketUpdater();
			$resp = $socketObj->rpanel_update();
			$resp = $socketObj->commodity_update();
		}
	}
}
