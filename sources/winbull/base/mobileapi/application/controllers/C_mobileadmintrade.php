<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
if (isset($_SERVER['HTTP_ORIGIN'])) {

    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        // may also be using PUT, PATCH, HEAD etc
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

/* header('Access-Control-Allow-Origin: *');  
header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description'); */
//header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past


/**
 * Example
 *
 * This is Customer interaction methods. In this we created customer registration,
 * login validation and customer profile details.
 *
 * @package		CodeIgniter
 * @subpackage	Rest Server
 * @category	Controller
 * @author		Vinoth Kumar
 * @reference link		http://philsturgeon.co.uk/code/
 */

// This can be removed if you use __autoload() in config.php OR use Modular Extensions
require APPPATH.'/libraries/REST_Controller.php';

class C_mobileadmintrade extends REST_Controller
{
	const ANDROIDVERSIONNAME 	= '1.0.0';
	const ANDROIDNEWVERSIONNAME = '1.0.0';
	const IOSVERSIONNAME 	= '1.0.0';
	const IOSNEWVERSIONNAME = '1.0.0';
	
	function __construct()
	{
		header('Access-Control-Allow-Origin: *');
		header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
		header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
		$method = $_SERVER['REQUEST_METHOD'];
		if($method == "OPTIONS") {
			exit();
		}
		// Construct our parent class
		parent::__construct();
		ini_set('date.timezone', 'Asia/Calcutta');
		$this->response->format = 'json';
		$this->load->model("M_mobileadmintrade");
	}
	
	function CheckAppVersion_post(){
		$versionname = $this->get('version');
		$data = (array)json_decode(file_get_contents("php://input"));
		if($data['platform'] == 1){ //Android
			if($data['version'] == self::ANDROIDVERSIONNAME || $data['version'] == self::ANDROIDNEWVERSIONNAME)
			{
				$data = array('success' => TRUE,
							  'message' => ""
							);
			}else{
				$data = array('success' => FALSE,
							  'message' => "Please update new version from play store"
							);
			}
		}else if($data['platform'] == 1){ //IOS
			if($data['version'] == self::IOSVERSIONNAME || $data['version'] == self::IOSNEWVERSIONNAME)
			{
				$data = array('success' => TRUE,
							  'message' => ""
							);
			}else{
				$data = array('success' => FALSE,
							  'message' => "Please update new version from play store"
							);
			}
		}
		echo json_encode($data);
	}
	
	//Login
	/**
	* Need to get user name and password and validate the credential and send response
	* param @username, @password
	* return user id, valid till, user type, branch, branch details
	*/
	public function login_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$username  = isset($data['username']) ? trim($data['username']) : '';
		$password  = isset($data['password']) ? trim($data['password']) : '';
		if($username != "" && $password != ""){
			$result = $this->M_mobileadmintrade->check_mobileuser($data);
			$this->response($result, 200);
		}else{
			$this->response(array('status' 	=> 0,
								  'message' => "Required fields are missing"
								), 200);
		}
	}
	public function dologin_get()
	{
		
		$username  = !empty($this->get('username')) ? trim($this->get('username')) : '';
		$password  = !empty($this->get('password')) ? trim($this->get('password')) : '';
		$data = array("username" => $this->get('username'), "password" => $this->get('password'));
		if($username != "" && $password != ""){
			
			$result = $this->M_mobileadmintrade->check_mobileuser($data);
			$this->response($result, 200);
		}else{
			$this->response(array('status' 	=> 0,
								  'message' => "Required fields are missing"
								), 200);
		}
		
	}
	function dashboarddetails_get(){
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getdashboarddetails();
		$this->response(array(
		'success' => true,
		'message' => 'Record reterived successfully',
		'data' => $result
		), 200);
	}
	function commodityGroupCommodityList_get() {
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getcommoditygroup($this->get('com_groupid'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
  	function updateCommodityGroupByComId_post(){
		$this->load->model("M_mobileadmintrade");
		$comgroupcomiddata = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		$com_buy_active 	= isset($comgroupcomiddata['com_buy_active']) ? $comgroupcomiddata['com_buy_active'] : 1;
		$com_sel_active 	= isset($comgroupcomiddata['com_sel_active']) ? $comgroupcomiddata['com_sel_active'] : 1;
		$com_buy_premium 	= isset($comgroupcomiddata['com_buy_premium']) ? $comgroupcomiddata['com_buy_premium'] : 1;
		$com_sel_premium 	= isset($comgroupcomiddata['com_sel_premium']) ? $comgroupcomiddata['com_sel_premium'] : 1;
		$com_buy_trade 		= isset($comgroupcomiddata['com_buy_trade']) ? $comgroupcomiddata['com_buy_trade'] : 1;
		$com_sel_trade 		= isset($comgroupcomiddata['com_sel_trade']) ? $comgroupcomiddata['com_sel_trade'] : 1;
		$com_delverydays	=(!isset($comgroupcomiddata['com_delverydays']) || strlen($comgroupcomiddata['com_delverydays']) ==0 ) ? 0 : $comgroupcomiddata['com_delverydays'];
				
				
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_comgroup_comid($comgroupcomiddata['com_group_id'], $comgroupcomiddata['com_id'], $com_buy_active, $com_sel_active, $com_buy_premium, $com_sel_premium, $com_buy_trade, $com_sel_trade, $com_delverydays);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	function updateLimitorder_post(){
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->db->trans_begin();
		$tradeObj = new Trading();
		$data['book_qty'] = ($data['book_qty']/1000);
		$result  = $tradeObj->update_order($data);

		if($this->db->trans_status()===TRUE)
		{
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
				if($url != '')
				{
					$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
					$field_string = http_build_query($return_array);
					curl_helper($url, $field_string);
				}
				$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Limit updated successfully";
				$result = $tradeObj->updatelimitorderadmin($data['book_no']);
				$this->response(array(
						'success' => true,
						'message' =>  $message,
						'data' => $result
				), 200);

			} else {
				$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Update got failure. Please try again later";
				$this->response(array(
						'success' => false,
						'message' => $message,
						'data' => $result
				), 200);
			}		
		} else {
			$this->db->trans_rollback();
			$message = isset($result['message']) && $result['message'] != '' ? $result['message'] : "Update got failure. Please try again later";
			$this->response(array(
					'success' => false,
					'message' => $message,
					'data' => $result
			), 200);
		}	
		
		/* $this->load->model("M_mobileadmintrade");
		$limitordergetdata = (array)json_decode(file_get_contents("php://input"));
		
				
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_limitorder($limitordergetdata['book_no'], $limitordergetdata['book_qty'],$limitordergetdata['book_rate'],$limitordergetdata['cus_id'],$limitordergetdata['com_name']);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		} */
	}
	function updateTodayorder_post(){
		$this->load->model("M_mobileadmintrade");
		$todayordergetdata = (array)json_decode(file_get_contents("php://input"));
				
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_todayorder($todayordergetdata['book_no'], $todayordergetdata['qty_gold'],$todayordergetdata['book_rate'],$todayordergetdata['book_narration']);
		
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	function confirmLimitorder_post(){
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->db->trans_begin();
		$tradeObj = new Trading();
		
		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		$margin_validation =  true;
		if($cancel_ratealert_url != '' && $client != '')
		{
			$cur_date = date("Y-m-d H:i:s");

			//$tradeObj = new Trading();
			//get order details
			$oDetail = $tradeObj->get_orderdetails($data['book_no'])->result_array();

			$cus_name    		 = $oDetail[0]['cus_name'];
			$cus_id    		 	 = $oDetail[0]['book_cusid'];
			$com_type    		 = $oDetail[0]['com_type'];
			$com_name  			 = $oDetail[0]['com_name'];
			$company_name   	 = $oDetail[0]['admin_company_name'];
			$cus_company_name    = $oDetail[0]['cus_company_name'];
			$book_qty 			 = $com_type == 0 ? ($oDetail[0]['book_qty']*1000)." gms" : ($oDetail[0]['book_qty'])." kg";
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
			$booknumber 		 = $oDetail[0]['book_no'];

			$stat       		 = 1;

			$available_balance = $tradeObj->get_availablebalance($cus_id);

			$totalcost = round(($book_rate / $book_comweight) * ($booked_qty) * 1000,2);

			if($has_margin == 1 && $stat == 1)
			{
				//Margin calculation
				$margin_hold = 0;
				if($has_margin)
				{
					if($com_margin_type == 0)
						$margin_hold = $totalcost*$com_margin_value/100;
					else
						$margin_hold = $booked_qty*$com_margin_value;
				}

				if($available_balance >= $margin_hold)
					$margin_validation = true;
				else
					$margin_validation = false;
			}
			if($margin_validation)
			{
				$is_updated = $this->db->query("UPDATE dt_booking set book_status = 1, orderstatus=1, order_liveprice='', orderplacedtime='".$cur_date."',  book_fixtype = 0, book_adminuser='', book_adminipaddress='' where book_no=".$data['book_no']." AND ordertype = 1 AND orderstatus = 0");

				
				if($this->db->affected_rows() > 0) 
				{
					$general_query = $this->db->query("SELECT grl.gold_hedgecontract, grl.silver_hedgecontract, grl.is_hedge, grl.gold_hedge_lot_qty,  grl.silver_hedge_lot_qty, grl.confirmation_for, grl.confirmation_admin FROM dt_generalsettings AS grl");
					$data_general = $general_query->row();
					//log_message("debug", var_dump($oDetail));
					//log_message("debug", var_dump($data_general));
					$log  = "User: ".$_SERVER['REMOTE_ADDR'].' - '.date("F j, Y, g:i:s a").PHP_EOL.
							"Data Mob admin: ".(print_r($data_general, true)).PHP_EOL.
							"-------------------------".PHP_EOL;
					file_put_contents('logs/mt5hedge_log', $log, FILE_APPEND);
					
					if($oDetail[0]['book_by'] == 3)
						$confirm_type = $data->confirmation_admin;
					else 
						$confirm_type = $data->confirmation_for;
					
					if($data_general->is_hedge == 1 && $confirm_type == 1)
					{/* 
						if($oDetail[0]['com_type'] == 0)
						{
							$contact_symbol = $data_general->gold_hedgecontract;
							//$contact_symbol = "EURUSD";
							$booked_qty		= $oDetail[0]['book_qty'];
							$minorderwt 	= $data_general->gold_hedge_lot_qty;
							$orderwt		= ($booked_qty * 1000);
							$lotwt 			= 100;
							$totlot = floor($orderwt / $lotwt);
							if(($orderwt % $lotwt) >= $minorderwt){
								$totlot = $totlot + 1;
							}
						}else{
							$contact_symbol = $data_general->silver_hedgecontract;
						}
							$curl = curl_init();
							//$lot = $totlot / 10;
							$lot = number_format($totlot,2, '.', '');

																	
							curl_setopt_array($curl, array(
							CURLOPT_URL => "",
							CURLOPT_RETURNTRANSFER => true,
							CURLOPT_ENCODING => '',
							CURLOPT_MAXREDIRS => 10,
							CURLOPT_TIMEOUT => 0,
							CURLOPT_FOLLOWLOCATION => true,
							CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
							CURLOPT_CUSTOMREQUEST => 'GET',
							));

							$response = curl_exec($curl);
							$log  = "User: ".$_SERVER['REMOTE_ADDR'].' - '.date("F j, Y, g:i:s a").PHP_EOL.
												"MT5 Response Mob admin: ".(print_r($response, true)).PHP_EOL.
												"-------------------------".PHP_EOL;
										file_put_contents('logs/mt5hedge_log', $log, FILE_APPEND);
							//var_dump($response);exit;

							if (strpos($response, 'failed') == false) {
								$mt5response = json_decode($response, true);
								if(sizeof($mt5response) == 11){
									$hedge_data = array(
										"dealid" 	=> $mt5response[1],
										"orderid" 	=> $mt5response[2],
										"volume"  	=> $mt5response[3],
										"price"  	=> $mt5response[4],
										"bid"		=> $mt5response[5],
										"ask"		=> $mt5response[6],
										"comment"	=> $mt5response[7],
										"request_id"=> $mt5response[8],
										"symbol"	=>  $mt5response[10][3],
										"cusbookid"	=>  $data['book_no']
									);
									$this->db->insert("dt_mt5_hedgedata", $hedge_data);

								}


								curl_close($curl);
							}

						curl_close($curl); */
					}
							
					$requestdata = array('client'  => $client,
										 'book_no' => array($data['book_no'])
										);
					$field_string = http_build_query($requestdata);
					$curl_resp = curl_helper($cancel_ratealert_url, $field_string);
					
					
					
					if($has_margin == 1 && $stat == 1)
					{
						$trans_items['trans_cuscode'] 		= $cus_id;
						$trans_items['trans_date'] 			= $cur_date;
						$trans_items['trans_code'] 			= $data['book_no'];
						$trans_items['trans_payment_type'] 	= 1;
						$trans_items['trans_amount'] 		= $margin_hold;
						$trans_items['trans_actype'] 		= 1;						
						$trans_items['trans_comments'] 		= "Margin deducted on limit confirmation";
						$trans_items['trans_comtype'] 		= $com_type;
						$trans_items['trans_margin_qty'] 	= $booked_qty;
						$trans_items['trans_book_code'] 	= $data['book_no'];
						$trans_items['trans_book_type'] 	= $book_type;
						$this->db->insert('dt_transaction', $trans_items);
						unset($trans_items);
						
						// Margin Reverse

						//Check margin reverse type is 0. (Type 0 : Margin Reverse on booking & delivery). On booking, check the book type on any possible reversal. Eg: If sell 100 gms already booked and current booking is 50 gms buy, 50 gms (lesser qty) of margin is reversed for sell and buy.
						if($margin_reverse_type == 0)
						{
							//select the booking with type(sell means select buy, buy means select sell and check for any possiblities of margin squareoff)
							$booktype_mr = $book_type == 0 ? 1 : 0;
							
							$margin_bal = 0;
							
							$qMarbal = $this->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = ".$com_type." AND trans_book_type = ".$booktype_mr." AND trans_cuscode = ".$cus_id." GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC");

							if($qMarbal->num_rows() > 0)
							{
								foreach ($qMarbal->result() as $qMarbalrow) 
								{
									$margin_bal = $margin_bal+$qMarbalrow->balance_margin_qty;
									$rem_margin[] = array("book_no" => $qMarbalrow->book_no, "balance_margin_amount" => $qMarbalrow->balance_margin_amount, "balance_margin_qty" => $qMarbalrow->balance_margin_qty);
								}

								// *Insert in transaction table for current booking margin reversal*

								//check which is lesser qty(sell qty or buy qty) and choose it. Eg: if 500 gms of sell and 200 gms of buy then buy should be choosen.
								$margin_balqty = $booked_qty <= $margin_bal ? $booked_qty : $margin_bal;
								
								// calculate amount of that lesser qty(sell or buy).
								$margin_balamt = ($margin_hold/$booked_qty)*$margin_balqty;
								
								$trans_items['trans_cuscode'] 		= $cus_id;
								$trans_items['trans_date'] 			= $cur_date;
								$trans_items['trans_code'] 			= $data['book_no'];
								$trans_items['trans_payment_type'] 	= 2;
								$trans_items['trans_amount'] 		= $margin_balamt;
								$trans_items['trans_actype'] 		= 0;						
								$trans_items['trans_comments'] 		= "Margin reversal on limit confirmation";
								$trans_items['trans_comtype'] 		= $com_type;
								$trans_items['trans_margin_qty'] 	= $margin_balqty;
								$trans_items['trans_book_code'] 	= $data['book_no'];
								$trans_items['trans_book_type'] 	= $book_type;
								$this->db->insert('dt_transaction', $trans_items);
								unset($trans_items);

								// *Insert in transaction table for previous booking margin reversal*

								foreach($rem_margin as $rmar)
								{
									if($margin_balqty > 0)
									{
										//calculations of margin qty and amount of each booking
										if($rmar['balance_margin_qty'] > $margin_balqty)
										{
											$marginqty = $margin_balqty;
											$margin_balqty = $margin_balqty - $marginqty;
										}
										else
										{
											$marginqty = $rmar['balance_margin_qty'];
											$margin_balqty = $margin_balqty - $marginqty;
										}
										$marginamt = ($rmar['balance_margin_amount']/$rmar['balance_margin_qty'])*$marginqty;

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
					if($stat == 1 || $stat == 2)
					{
						if($stat == 1)
							$service_id = "5";
						else if($stat == 2)
							$service_id = "4";

						$data = $tradeObj->get_EmailContent($service_id, $data['book_no']);
						if($data != '')
						{
							if(strlen($data['email_id']) > 0) 
							{
								$email_resp = email_notification_helper($data['email_id'], $data["email_subject"], $data['email_content']);
							}
						}
						$whatsapp_url = $tradeObj->get_whatsappURL($service_id, $data['book_no']);
						if(isset($whatsapp_url['mobile'])) {
							
							if(strlen($whatsapp_url['mobile']) > 0)
							{
								$resp = whatsapp_message_helper(trim($whatsapp_url['mobile'],'""'), $whatsapp_url['message']);
								
							}
						
						}
						
						if($stat == 1 || $stat == 2)
						{
							$nos = $tradeObj->get_admin_nos();
							//$message = "Dear Admin, New Limit Order - Executed. Order No:".$id.", Name : ".$cus_name."-".$cus_company_name.", Comm : ".$com_name.", Qty : ".$book_qty.", Rate : ".$book_rate;
							
							$autohedge = $book_ishedge == 0 ? "Pending" : "Done";
							$hedgeqty = $hedge_price != '' ? $mt5qty." Grams ".$hedge_price: "";
							
							
							/* Hedge: ".$autohedge."
							".$hedgeqty." */
				
							$message = "Limit Order Executed. 

Client: ".$cus_name."-".$cus_company_name."
Product: ".$com_name."
Rate: ".$book_rate."
Quantity: ".$book_qty."
Trade no: ".$booknumber."
Total Cost: ".$book_totalcost."


Time : ".date('d-m-Y H:i:s');

							//$message = $tradeObj->get_admin_SMS(8, $id);

							$mobile = '';
							if($nos['is_admin_mob1'] == 1 && trim($nos['admin_mob1']) != '')
								$mobile = $mobile.trim($nos['admin_mob1']).",";
							if($nos['is_admin_mob2'] == 1 && trim($nos['admin_mob2']) != '')
								$mobile = $mobile.trim($nos['admin_mob2']).",";
							if($nos['is_admin_mob3'] == 1 && trim($nos['admin_mob3']) != '')
								$mobile = $mobile.trim($nos['admin_mob3']).",";
							if($nos['is_admin_mob4'] == 1 && trim($nos['admin_mob4']) != '')
								$mobile = $mobile.trim($nos['admin_mob4']).",";
							if($nos['is_admin_mob5'] == 1 && trim($nos['admin_mob5']) != '')
								$mobile = $mobile.trim($nos['admin_mob5']);

							if(substr(trim($mobile), -1) == ',')
							{
								$mobile =  substr($mobile, 0, -1);
							}
							if($mobile != '')
							{
								$str_arr = explode (",", $mobile); 
		
								foreach($str_arr as $mob => $cusmobile) {
								  $resp = whatsapp_message_helper($cusmobile, $message);
								  $sms_resp = sms_notification_helper($cusmobile, $message);
								}
																
								/* $resp = whatsapp_message_helper(trim($mobile,'""'), $message);
								$sms_resp = sms_notification_helper($mobile, $message); */
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
								curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
																   'Authorization: Basic '.Globals::$onesingalapi_admin));
								curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
								curl_setopt($ch, CURLOPT_HEADER, FALSE);
								curl_setopt($ch, CURLOPT_POST, TRUE);
								curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
								curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

								$response = curl_exec($ch);
								curl_close($ch); 
							//Notification
						}
						$sms_url = $tradeObj->get_SMSURL($service_id, $data['book_no']);

						if($sms_url != '')
						{
							$curl_resp = curl_helper($sms_url, $sms_url);
						}
					}
					//Message End
					if($this->db->trans_status()===TRUE) {		
						$this->db->trans_commit();
						$message = "limit Order confirmation.";
						$this->response(array(
							'success' => true,
							'message' => $message,
							'data' => ''
						), 200);
					}else {
						$this->db->trans_rollback();
						$this->response(array(
										'success' => false,
										'message' => 'Error occured. please try again.'
								), 200);
					}
					//Update in Log
					//$tradeObj->updateLimitStatusLog($id,4);
				}
				else
				{
					$message = "Error occured on limit confirmation.Please try again.";
					$this->response(array(
						'success' => false,
						'message' => $message,
						'data' => ''
				), 200);
				}
			}
			//$tradeObj = new Trading();
			//$notyResp = $tradeObj->notifyBooking($id);

			$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
			if($url != '')
			{
				$return_array['book'] = array('bookupdate' => 1,'confirm_type' => 1);
				$field_string = http_build_query($return_array);
				$curl_resp = curl_helper($url, $field_string);
			}
		}
		
		if(!$margin_validation)
		{
			$message = "Available margin is less than required margin.";
			$this->response(array(
						'success' => false,
						'message' => $message,
						'data' => ''
				), 200);
		}
	}
	function cancelLimitorder_post(){
		$data = (array)json_decode(file_get_contents("php://input"));
		$this->db->trans_begin();
		$tradeObj = new Trading();
		
		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		if($cancel_ratealert_url != '' && $client != '')
		{
			$status = $this->db->update('dt_booking', array("orderstatus" => 3, "book_adminuser" =>'', "book_adminipaddress" =>''), array("book_no" => $data['book_no'], "orderstatus" => 0, "ordertype" => 1));
			
			if($this->db->affected_rows() > 0)
			{
				
				$tradeObj->notifyBooking($data['book_no']);

				$requestdata = array('client'  => $client,'book_no' => array($data['book_no']));
				$field_string = http_build_query($requestdata);
				curl_helper($cancel_ratealert_url, $field_string);

				$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
				if($url != '')
				{
					$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
					$field_string = http_build_query($return_array);
					curl_helper($url, $field_string);
				}
				if($this->db->trans_status()===TRUE) {		
					$this->db->trans_commit();
					$message = "limit Order Cancelled.";
					$this->response(array(
						'success' => true,
						'message' => $message,
						'data' => ''
					), 200);
				}else {
					$this->db->trans_rollback();
					$this->response(array(
									'success' => false,
									'message' => 'Error occured. please try again.'
							), 200);
				}
				//Update in Log
				//$tradeObj->updateLimitStatusLog($id,5);
			}
			else
			{
				
				$message = "Error occured in cancelling order. Please try again";
				$this->response(array(
						'success' => false,
						'message' => $message,
						'data' => ''
				), 200);
			}
		}
	}
	//Get menu rights details @param userId
	public function menurights_get()
	{
		//return menus and rights againist user id
	}
	
	public function rpanelContracts_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getrpanelcontracts();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function rpanelContractById_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getrpanelcontractsbyid($this->get('rpcont_id'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	function updateRpanelContractById_post(){
		$this->load->model("M_mobileadmintrade");
		$rpanelcomiddata = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_rpanel_comid($rpanelcomiddata);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	public function bankPremiumDetails_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getbankpremium();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	function updateBankPremium_post(){
		$this->load->model("M_mobileadmintrade");
		$bankcomiddata = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_bankprem_bnkid($bankcomiddata);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	public function activeRpanelContracts_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getrpanelcontractslist();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	function updateMarketStatus_post(){
		$this->load->model("M_mobileadmintrade");
		$marketsatus = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_market_status($marketsatus);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	function updateTradeStatus_post(){
		$this->load->model("M_mobileadmintrade");
		$tradesatus = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		$status 	= isset($tradesatus['status']) ? $tradesatus['status'] : 1;
		$clear_pendingorders 	= isset($tradesatus['clear_pendingorders']) ? $tradesatus['clear_pendingorders'] : 1;
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_trading_status($status, $clear_pendingorders);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	public function customerList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getcustomerslist();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	
	public function customertradedetailByID_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getcustomerlistbyid($this->get('cus_id'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result['customertradedetailsbyid']
				), 200);
	}
	function updateRateDisplay_post(){
		$this->load->model("M_mobileadmintrade");
		$marketsatus = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_market_onoff($marketsatus);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	function updateHedgestat_post(){
		$this->load->model("M_mobileadmintrade");
		$hedgesatus = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_hedge_onoff($hedgesatus);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	function updateDashboardTimings_post(){
		$this->load->model("M_mobileadmintrade");
		$satus = (array)json_decode(file_get_contents("php://input"));
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		
		$this->db->trans_begin();
		$result = $this->M_mobileadmintrade->update_limitcl_bktimegap($satus);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	public function companyBranchList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getcompbranchlist();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result['company_branch']
				), 200);
	}
	public function outstandingList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getoutstandinglist();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function dealRegisterList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getdealregisterlist($this->get('from'), $this->get('to'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function hedgeList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->gethedgelist($this->get('from'), $this->get('to'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function todaytradeList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->gettodaytradelist($this->get('from'), $this->get('to'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	function createNewBooking_post(){
		$this->load->model("M_mobileadmintrade");
		$phbook = (array)json_decode(file_get_contents("php://input"));
		
		$data = $phbook;
		$data['book_by'] = 4;
		$data['com_bar_type'] = 0;
		//$data['request_amt_wt'] = 0;

		$this->db->trans_begin();  // Begin Transaction		
		$tradeObj = new Trading();
		
		$result  = $tradeObj->insert_record($data);

		if($this->db->trans_status()===TRUE)
		{
			$this->db->trans_commit();
			$result['success'] = true;
			$result['data'] = $result;
			if($result['status'] == 1)
			{
				if($phbook['request_type'] == 0)
				{
					$url = isset(Globals::$bookupdate) ? Globals::$bookupdate : '';
					if($url != '')
					{
						$return_array['book'] = array('bookupdate' => 1,'confirm_type' => $result['confirm_type']);
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
			$result['success'] = false;
		}
		echo json_encode($result);
		/* $postdata = file_get_contents("php://input");
		$request = json_decode($postdata); */
		
		
		/* $this->db->trans_begin();
		$result = $this->M_mobileadmintrade->phonebookentryinsert($phbook);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$url = $this->config->item('bookupdate');
				if($url != '')
				{
					$return_array['book'] = array('bookupdate' => 1,'confirm_type' => $result['confirm_type']);
					$field_string = http_build_query($return_array);
					$ch = curl_init();
					curl_setopt($ch,CURLOPT_URL,$url);
					curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
					curl_setopt($ch,CURLOPT_HEADER, false); 
					curl_setopt($ch, CURLOPT_POST, 1);
					curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
					$curlresult = curl_exec($ch);
					curl_close($ch);
				}
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		} */
	}
	function notifyBooking_post()
	{
		$data = (array)json_decode(file_get_contents("php://input"));
		$book_no =  $data['book_no'];
		if(is_numeric($book_no) && $book_no > 0)
		{
			$tradeObj = new Trading();
			$result  = $tradeObj->notifyBooking($book_no);
			if($result)
			{
				$message = "SMS and Email sent successfully.";
				$this->response(array(
						'success' => true,
						'message' => $message,
						'data' => []
				), 200);
			}
			else
			{
				$message = "Error occured. Please try again.";
				$this->response(array(
						'success' => false,
						'message' => $message,
						'data' => []
				), 200);
			}
		}
		else
		{
			$message = "Required fields are missing. Please try again.";
			$this->response(array(
					'success' => false,
					'message' => $message,
					'data' => []
			), 200);
		}
	}
	public function cusoutstandingList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getcusoutstandinglist();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function limitorderList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getlimitorderListlist();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function cusoutstandingListByid_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getcusoutstandinglistbyid($this->get('book_cusid'));
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function phonebookList_get()
	{
		$this->load->model("M_mobileadmintrade");
		$result = $this->M_mobileadmintrade->getphonebooklist();
		$this->response(array(
						'success' => true,
						'message' => 'Record reterived successfully',
						'data' => $result
				), 200);
	}
	public function updatehedgelot_get()
	{
		
		$gold_hedge_lot_qty  = !empty($this->get('gold_hedge_lot_qty')) ? trim($this->get('gold_hedge_lot_qty')) : '';
		$silver_hedge_lot_qty  = !empty($this->get('silver_hedge_lot_qty')) ? trim($this->get('silver_hedge_lot_qty')) : '';
		$data = array("gold_hedge_lot_qty" => $this->get('gold_hedge_lot_qty'), "silver_hedge_lot_qty" => $this->get('silver_hedge_lot_qty'));
		
		$result = $this->M_mobileadmintrade->update_hedgelot($data);
		if($this->db->trans_status()===TRUE)
		{		
			$this->db->trans_commit();
			if($result['status'] == 1) {
				$this->response(array(
							'success' => true,
							'message' => 'Updated successfully'
					), 200);
			}
			else{
			$this->response(array(
						'success' => false,
						'message' => $result['message'],
						'data' => $result
				), 200);
			}
		}else {
			$this->db->trans_rollback();
			$this->response(array(
							'success' => false,
							'message' => 'Can not update now, Please try again'
					), 200);
		}
	}
	function deleteorder_get(){
		$data = (array)json_decode(file_get_contents("php://input"));
		
		$book_no = $this->get('bookdata');
		//echo $book_no;exit;
		$tradeObj = new Trading();
		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		$oDetails = $tradeObj->get_orderdetails($book_no)->result_array();
		
		if(count($oDetails) > 0)
		{
			$is_pending_order = ($oDetails[0]['ordertype'] == 1 && $oDetails[0]['orderstatus'] == 0) ? 1 : 0;

			if($is_pending_order == 1 ? $cancel_ratealert_url != '' && $client != '' : true)
			{
				$this->db->trans_begin();  // Begin Transaction		
				$this->M_mobileadmintrade->delete_booking($book_no);
				if($this->db->trans_status()===TRUE)
				{									 
					//This will execute when all transactions insert without error.			
					$this->db->trans_commit();	
					if($is_pending_order == 1)
					{
						$requestdata = array('client'  => $client,
											 'book_no' => array($book_no)
											);
						$field_string = http_build_query($requestdata);
						$curl_resp = curl_helper($cancel_ratealert_url, $field_string);

						$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
						if($url != '')
						{
							$return_array['limit'] = array('limitupdate' => 1,'book_no' => "1");
							$field_string = http_build_query($return_array);
							$curl_resp = curl_helper($url, $field_string);
						}
					}
					
					$this->response(array(
						'success' => true,
						'message' => 'Record Deleted.',
						'data' => ''
					), 200);
					
				}
				else
				{
					$this->db->trans_rollback();
					$this->response(array(
							'success' => false,
							'message' => 'No bookings found.Please try again.'
					), 200);
				}
			}
		}
		else
		{
			$this->response(array(
					'success' => false,
					'message' => 'No bookings found.Please try again.'
			), 200);
		}
	}
	function deletehedge_get(){
		$data = (array)json_decode(file_get_contents("php://input"));
		$hedgid = $this->get('hedgedata');
		$this->db->trans_begin();  // Begin Transaction		
		$this->M_mobileadmintrade->delete_hedging($hedgid);
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.			
			$this->db->trans_commit();	
			$this->response(array(
				'success' => true,
				'message' => 'Record Deleted.',
				'data' => ''
			), 200);
		}
		else
		{
			$this->db->trans_rollback();
			$this->response(array(
					'success' => false,
					'message' => 'No Data found.Please try again.'
			), 200);
		}		
	}
}	
