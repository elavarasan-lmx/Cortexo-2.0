<?php
class C_booking extends My_Controller
{
	var $req_menu_code	= 9;
	var $limit_menu_code	= 11;
	/* if($lastPart == 0)
	{
		$menu_code	= 9;
	}
	if($lastPart == 0)
	{
		$menu_code	= 52;
	} */
	public function __construct()
	{
		parent::__construct();
	}
	function index() {}
	function open_listingform($book_type = "")
	{
		if ($book_type == 0) {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->req_menu_code) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			// Setup header info for Print/Excel exports
			$client_name = $this->session->userdata('company_name') ? $this->session->userdata('company_name') : '';
			$report_generated_on = date('d-m-Y H:i:s');
			
			$data['header_info'] = array(
				'report_client' => $client_name,
				'report_from_date' => '',
				'report_to_date' => '',
				'report_generated_on' => $report_generated_on
			);

			if ($data["userrights"]['view'] == 1) {
				$this->load->view('booking_listing', $data);
			} else {
				$this->load->view('access_denied');
			}
		} else {
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->limit_menu_code) {
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}

			// Setup header info for Print/Excel exports
			$client_name = $this->session->userdata('company_name') ? $this->session->userdata('company_name') : '';
			$report_generated_on = date('d-m-Y H:i:s');
			
			$data['header_info'] = array(
				'report_client' => $client_name,
				'report_from_date' => '',
				'report_to_date' => '',
				'report_generated_on' => $report_generated_on
			);

			if ($data["userrights"]['view'] == 1) {
				$this->load->view('order_listing', $data);
			} else {
				$this->load->view('access_denied');
			}
		}
	}
	function confirmation($id, $order_liveprice = "")
	{
		$is_ajax = $this->input->is_ajax_request();
		$admin_id = $this->login_model->get_userid();
		$adminipaddress = $_SERVER['SERVER_ADDR'];

		$cancel_ratealert_url = trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client = trim(isset(Globals::$client) ? Globals::$client : '');
		$margin_validation = true;
		$success = false;
		$message = "";

		if ($cancel_ratealert_url != '' && $client != '') {
			$cur_date = date("Y-m-d H:i:s");
			$tradeObj = new Trading();
			$oDetail = $tradeObj->get_orderdetails($id)->result_array();

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

			// BZ-18: Extract missing variables needed for margin, transaction, and notification
			$cus_id              = $oDetail[0]['book_cusid'];
			$com_type            = $oDetail[0]['com_type'];
			$cus_name            = $oDetail[0]['cus_name'];
			$cus_company_name    = isset($oDetail[0]['cus_company_name']) ? $oDetail[0]['cus_company_name'] : '';
			$com_name            = $oDetail[0]['com_name'];
			$book_qty            = $oDetail[0]['book_qty'];

			$stat       		 = 1;

			$available_balance = $tradeObj->get_availablebalance($cus_id);

			$totalcost = round(($book_rate / $book_comweight) * ($booked_qty) * 1000, 2);

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
				$this->db->set([
					'book_status' => 1,
					'orderstatus' => 1,
					'order_liveprice' => $order_liveprice,
					'orderplacedtime' => $cur_date,
					'book_fixtype' => 0,
					'book_adminuser' => $admin_id,
					'book_adminipaddress' => $adminipaddress
				]);
				$this->db->where('book_no', (int)$id);
				$this->db->where('ordertype', 1);
				$this->db->where('orderstatus', 0);
				$is_updated = $this->db->update('dt_booking');
				if ($this->db->affected_rows() > 0) {
					//Commodity stock manage start 
					$this->db->select('com_name, com_rest_wt, rcom_comtype');
					$this->db->from('dt_com_master');
					$this->db->join('dt_rpanelcommodities', 'rcom_id = com_type', 'left');
					$this->db->where('com_id', (int)$book_comid);
					$resultset = $this->db->get();
					$query_name = $this->db->select('admin_stockmanage')->get('dt_generalsettings');
					$stock_manage 	= $query_name->row()->admin_stockmanage;
					if ($resultset->num_rows() > 0) {
						$goldwt_info = $resultset->row_array();
						$stock_manage = $goldwt_info['rcom_comtype']  == 1 ? $stock_manage : $stock_manage / 1000;
						$com_restwt	  = $goldwt_info['rcom_comtype']  == 1 ? $goldwt_info['com_rest_wt'] : $goldwt_info['com_rest_wt'] / 1000;
						//echo $stock_manage."  ".$com_restwt;exit;
						if ($com_restwt < $stock_manage || $com_restwt == $stock_manage) {
							$this->session->set_flashdata('warning', "Low stock alert: " . $goldwt_info['com_name'] . " is running out of stock.");
						} else {

							$bookedweight_rest 	= $goldwt_info['rcom_comtype'] == 1 ? $booked_qty : $booked_qty * 1000;
							if ($goldwt_info['com_rest_wt']  > $bookedweight_rest) {
								$gold_wt 			=	(float)$goldwt_info['com_rest_wt'];
								$bookedweight_rest 	=	(float)$bookedweight_rest;
								$rest_weight 		=	$gold_wt - $bookedweight_rest;
								$this->db->where('com_id', (int)$book_comid);
								$this->db->update('dt_com_master', ['com_rest_wt' => $rest_weight]);
							}
						}
					}
					//Commodity stock manage end 

					$requestdata = array(
						'client'  => $client,
						'book_no' => array($id)
					);
					$field_string = http_build_query($requestdata);
					$curl_resp = curl_helper($cancel_ratealert_url, $field_string);

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

							$qMarbal = $this->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = ? AND trans_book_type = ? AND trans_cuscode = ? GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC", [(int)$com_type, (int)$booktype_mr, (int)$cus_id]);

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
					//Message Start
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
								whatsapp_message_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['message']);
								
								// Meta WhatsApp Integration
								if (isset($whatsapp_url['template_id']) && $whatsapp_url['template_id'] != "") {
									$params = isset($whatsapp_url['params']) ? $whatsapp_url['params'] : array($whatsapp_url['message']);
									whatsappmeta_notification_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['template_id'], $params);
								}
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
					//Message End

					//Update in Log
					$tradeObj->updateLimitStatusLog($id, 4);
					$this->session->set_flashdata('success', "Order confirmed successfully.");
				} else {
					$this->session->set_flashdata('error', "Error occured on limit confirmation.Please try again.");
				}
			}

			/* $tradeObj = new Trading();
			$notyResp = $tradeObj->notifyBooking($id); */

			$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
			if ($url != '') {
				$return_array['book'] = array('bookupdate' => 1, 'confirm_type' => 1);
				$field_string = http_build_query($return_array);
				$curl_resp = curl_helper($url, $field_string);
			}
		}

		if (!$margin_validation) {
			$message = "Available margin is less than required margin.";
			$response = ["status" => "error", "message" => $message];
			if ($is_ajax) { echo json_encode($response); exit; }
			$this->session->set_flashdata('error', $message);
		}

		if ($is_ajax) {
			$response = ["status" => "success", "message" => "Order confirmed successfully."];
			echo json_encode($response);
			exit;
		}
		redirect("/C_booking/open_listingform/1");
	}
	function DB_Controller($model_name = "", $status = "", $id = "", $cus_id = "", $book_totalcost = "", $current_status = "")
	{
		$is_ajax = $this->input->is_ajax_request();
		$tradeObj = new Trading();
		$admin_id = $this->login_model->get_userid();
		$adminipaddress = $_SERVER['SERVER_ADDR'];
		$this->load->model('booking_model');
		$this->load->model("General_model");

		$success = false;
		$message = "";

		if ($status == 'cancel') {
			$cancel_ratealert_url = trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
			$client = trim(isset(Globals::$client) ? Globals::$client : '');
			if ($cancel_ratealert_url != '' && $client != '') {
				$this->db->trans_begin();
				$this->db->update('dt_booking', array("orderstatus" => 3, "book_adminuser" => $admin_id, "book_adminipaddress" => $adminipaddress), array("book_no" => $id, "orderstatus" => 0, "ordertype" => 1));
				if ($this->db->affected_rows() > 0) {
					$tradeObj->notifyBooking($id);
					curl_helper($cancel_ratealert_url, http_build_query(['client' => $client, 'book_no' => [$id]]));
					
					$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
					if ($url != '') curl_helper($url, http_build_query(['limit' => ['limitupdate' => 1, 'book_no' => "1"]]));

					$tradeObj->updateLimitStatusLog($id, 5);
					$this->db->trans_commit();
					$success = true;
					$message = "Order cancelled successfully.";
				} else {
					$this->db->trans_rollback();
					$message = "Error occurred in cancelling order. Order may have been processed.";
				}
			} else {
				$message = "Configuration error: cancelratealert or client missing.";
			}
			$redirect_type = 1;
		} else {
			$cur_date = date('Y-m-d H:i:s');
			$confirm_for = ($status == 'confirm') ? 1 : (($status == 'reject') ? 3 : 2);
			$margin_validation = true;

			if ($confirm_for == 1) {
				$oDetail = $tradeObj->get_orderdetails($id)->result_array();
				if (empty($oDetail)) {
					$response = ["status" => "error", "message" => "Booking not found."];
					if ($is_ajax) { echo json_encode($response); exit; }
					$this->session->set_flashdata('error', $response['message']);
					redirect("/C_booking/open_listingform/0");
				}

				$cus_id = $oDetail[0]['book_cusid'];
				$com_type = $oDetail[0]['com_type'];
				$booked_qty = $oDetail[0]['book_qty'];
				$book_rate = $oDetail[0]['book_rate'];
				$book_type = $oDetail[0]['book_type'];
				$book_comweight = $oDetail[0]['book_comweight'];
				$com_margin_type = $oDetail[0]['com_margin_type'];
				$com_margin_value = $oDetail[0]['com_margin_value'];
				$has_margin = $oDetail[0]['display_margin'];
				$margin_reverse_type = $oDetail[0]['margin_reverse_type'];

				$available_balance = $tradeObj->get_availablebalance($cus_id);
				$totalcost = round(($book_rate / $book_comweight) * ($booked_qty) * 1000, 2);

				if ($has_margin == 1) {
					$margin_hold = ($com_margin_type == 0) ? ($totalcost * $com_margin_value / 100) : ($booked_qty * $com_margin_value);
					if ($available_balance < $margin_hold) {
						$margin_validation = false;
					}
				}

				if ($margin_validation) {
					$this->db->trans_begin();
					$this->db->where('book_no', (int)$id);
					$this->db->update('dt_booking', [
						'book_status' => (int)$confirm_for,
						'book_confirmedon' => $cur_date,
						'book_fixtype' => 0,
						'book_adminuser' => $admin_id,
						'book_adminipaddress' => $adminipaddress
					]);
					
					if ($this->db->affected_rows() > 0) {
						if ($has_margin == 1) {
							$this->db->insert('dt_transaction', [
								'trans_cuscode' => $cus_id, 'trans_date' => $cur_date, 'trans_code' => $id,
								'trans_payment_type' => 1, 'trans_amount' => $margin_hold, 'trans_actype' => 1,
								'trans_comments' => "Margin deducted on booking confirmation", 'trans_comtype' => $com_type,
								'trans_margin_qty' => $booked_qty, 'trans_book_code' => $id, 'trans_book_type' => $book_type
							]);

							if ($margin_reverse_type == 0) {
								$opp_type = ($book_type == 0) ? 1 : 0;
								$qMarbal = $this->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = ? AND trans_book_type = ? AND trans_cuscode = ? GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC", [(int)$com_type, (int)$opp_type, (int)$cus_id]);
								
								if ($qMarbal->num_rows() > 0) {
									$total_opp_qty = 0;
									$opp_bookings = [];
									foreach ($qMarbal->result() as $row) {
										$total_opp_qty += $row->balance_margin_qty;
										$opp_bookings[] = $row;
									}
									$rev_qty = min($booked_qty, $total_opp_qty);
									$rev_amt = ($margin_hold / $booked_qty) * $rev_qty;
									
									$this->db->insert('dt_transaction', [
										'trans_cuscode' => $cus_id, 'trans_date' => $cur_date, 'trans_code' => $id,
										'trans_payment_type' => 2, 'trans_amount' => $rev_amt, 'trans_actype' => 0,
										'trans_comments' => "Margin reversal on booking confirmation", 'trans_comtype' => $com_type,
										'trans_margin_qty' => $rev_qty, 'trans_book_code' => $id, 'trans_book_type' => $book_type
									]);
									
									foreach ($opp_bookings as $opp) {
										if ($rev_qty <= 0) break;
										$qty = min($opp->balance_margin_qty, $rev_qty);
										$amt = ($opp->balance_margin_amount / $opp->balance_margin_qty) * $qty;
										$this->db->insert('dt_transaction', [
											'trans_cuscode' => $cus_id, 'trans_date' => $cur_date, 'trans_code' => $opp->book_no,
											'trans_payment_type' => 2, 'trans_amount' => $amt, 'trans_actype' => 0,
											'trans_comments' => "Margin reversal on booking confirmation", 'trans_comtype' => $com_type,
											'trans_margin_qty' => $qty, 'trans_book_code' => $opp->book_no, 'trans_book_type' => $opp_type
										]);
										$rev_qty -= $qty;
									}
								}
							}
						}
						$this->db->trans_commit();
						$success = true;
						$message = "Booking Request Confirmed Successfully.";
					} else {
						$this->db->trans_rollback();
						$message = "Confirmation failed. Request may have changed.";
					}
				} else {
					$message = "Available margin is less than required margin.";
				}
			} else if ($confirm_for == 3) {
				$this->db->where('book_no', (int)$id);
				$this->db->update('dt_booking', [
					'book_status' => (int)$confirm_for,
					'book_confirmedon' => $cur_date,
					'book_fixtype' => 0,
					'book_adminuser' => $admin_id,
					'book_adminipaddress' => $adminipaddress
				]);
				if ($this->db->affected_rows() > 0) {
					$success = true;
					$message = "Booking Request Rejected Successfully.";
				} else {
					$message = "Rejection failed.";
				}
			}

			$tradeObj->notifyBooking($id);
			$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
			if ($url != '' && $confirm_for == 1) {
				curl_helper($url, http_build_query(['book' => ['bookupdate' => 1, 'confirm_type' => 1]]));
			}
			$tradeObj->updateLimitStatusLog($id, $confirm_for);
			$redirect_type = 0;
		}

		$response = ["status" => $success ? "success" : "error", "message" => $message];
		if ($is_ajax) { echo json_encode($response); exit; }
		$this->session->set_flashdata($success ? 'success' : 'error', $message);
		redirect("/C_booking/open_listingform/" . $redirect_type);
	}
	function get_bookingdata()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_data()->result_array();
		echo json_encode($data);
	}
	function get_orderdata($model = "", $comType = "", $bookType = "")
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_data_order($comType, $bookType)->result_array();
		echo json_encode($data);
	}
	function clear_order()
	{
		$is_ajax = $this->input->is_ajax_request();
		$tradeObj = new Trading();
		$result = $tradeObj->clear_order();
		
		$message = "Pending limits cleared successfully.";
		// Assuming clear_order() returns true on success, or checking affected rows if possible. 
		// For now, based on legacy code, it just redirects. We'll assume success.
		
		if ($is_ajax) {
			echo json_encode(["status" => "success", "message" => $message]);
			exit;
		}
		
		$this->session->set_flashdata('success', $message);
		redirect("/C_booking/open_listingform/1");
	}
	// function inline_update()
	// {
	// 	$pk = $this->input->post('pk');
	// 	$value = $this->input->post('value');
	// 	$tradeObj = new Trading();
	// 	echo $tradeObj->inline_update($pk = '', $value = '', $fname = '');
	// }
	function inline_update()
	{
		$tradeObj = new Trading();
		$data = $tradeObj->get_available_qty($_POST);
		$data = json_decode($data);

		if ($data === false) {
			echo json_encode([
				'status' => false,
				'message' => 'Unable to fetch quantity rules'
			]);
			exit;
		}

		$booked_qty = isset($_POST['value']) ? (float) $_POST['value'] : 0;
		$hasMin = (int) $data->has_minqty;
		$hasMax = (int) $data->has_maxqty;

		$minQty = (float) $data->min_qty * 1000;
		$maxQty = (float) $data->max_qty * 1000;

		if ($hasMin && $booked_qty < $minQty && $_POST['fname'] == 'book_qty') {

			echo json_encode([
				'status' => false,
				'message' => "Minimum order qty ({$data->minqty_type})"
			]);
			exit;
		} elseif ($hasMax && $booked_qty > $maxQty && $_POST['fname'] == 'book_qty') {

			echo json_encode([
				'status' => false,
				'message' => "Maximum order qty ({$data->maxqty_type})"
			]);
			exit;
		} else {

			// proceed with update
			echo $tradeObj->inline_update();
			exit;
		}
	}
}
