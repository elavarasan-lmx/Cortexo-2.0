<?php
class M_mobileadmintrade extends CI_Model 
{

	var $table_name 	= 'dt_booking';
	var $sec_table_name = 'dt_customer';

	function __construct()
	{
		// Call the Model constructor
		parent::__construct();
		$this->db->query("SET time_zone='+5:30'");
		// Load helpers for logging
		$this->load->helper('common');
		$this->load->helper('field_labels');
	}
	
	// Logging methods
	public function log_admin_action($log_type, $module_name, $action, $description = '', $pre_data = array(), $update_data = array())
	{
		return log_admin_add($log_type, $module_name, $update_data, $description);
	}
	
	public function log_add($data = array(), $description = '')
	{
		$module_name = 'Mobile Admin Trade';
		$log_type = 'Mobile Admin Trade';
		
		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}
		
		return log_admin_add($log_type, $module_name, $data, $description);
	}
	
	public function log_edit($old_data = array(), $new_data = array(), $description = '')
	{
		$module_name = 'Mobile Admin Trade';
		$log_type = 'Mobile Admin Trade';
		
		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}
		
		return log_admin_edit($log_type, $module_name, $old_data, $new_data, $description);
	}
	
	public function log_delete($data = array(), $description = '')
	{
		$module_name = 'Mobile Admin Trade';
		$log_type = 'Mobile Admin Trade';
		
		if (empty($description)) {
			$description = 'Deleted record from ' . $module_name;
		}
		
		return log_admin_delete($log_type, $module_name, $data, $description);
	}
	
	function check_mobileuser($data)
	{
		$return_data = array();
		$resultset = $this->db->query("select * from dt_admin_user where admin_user_name='".$data['username']."' and admin_user_password='".$data['password']."'");
		if($resultset->num_rows() == 1)
		{
			if($resultset->row()->admin_status == 1) {
				if(date("Y-m-d") <= $resultset->row()->admin_validity_date) {
					$return_data = array(
								'status' => 1,
								'operationresult' => 1,
								'message' => "Logged in sucessfully.",
								'data' => array("userid" => $resultset->row()->admin_user_id, "username" => $resultset->row()->admin_user_name)
							);
				}else{
					$return_data = array(
								'status' => 1,
								'operationresult' => 2,
								'message' => "Your validity has been expire please contact us."
							);
				}
			}
		}else{
			$return_data = array(
								'status' => 1,
								'operationresult' => 3,
								'message' => "Invalid user credentials."
							);
		}
		return $return_data;
	}
	function getdashboarddetails(){
		$returndata = array("trade_settings" => array("ratedisplay" => 0, "tradestatus" => 0, "is_hedge" => 0, "gold_hedge_lot_qty" => 0, "silver_hedge_lot_qty" => 0, "limitcancelon" => "00:00", "booktimegab" => "00:00:00"), "sales" => array("gold" => 0, "noofgoldbooking" => 0, "silver" => 0, "noofsilverbooking" => 0), "delivery" => array("golddelivered" => 0, "silverdelivered" => 0, "goldpending" => 0, "silverpending" => 0), "quickfacts" => array("registeredcustomers" => 0, "activecustomers" => 0, "approvalpending" => 0));
		
		$resultset = $this->db->query("select trade_enable, limit_cancellation, limitcancel_time, trade_on, trade_on_time, trade_off, trade_off_time, has_timegap_onbook, time_gap, is_hedge, gold_hedge_lot_qty, silver_hedge_lot_qty from dt_generalsettings");
		
		if($resultset->num_rows() > 0){
			$returndata['trade_settings']['tradestatus'] = $resultset->row()->trade_enable;
			$returndata['trade_settings']['is_hedge'] = $resultset->row()->is_hedge;
			$returndata['trade_settings']['gold_hedge_lot_qty'] = $resultset->row()->gold_hedge_lot_qty;
			$returndata['trade_settings']['silver_hedge_lot_qty'] = $resultset->row()->silver_hedge_lot_qty;
			$returndata['trade_settings']['limitcancelon'] = $resultset->row()->limit_cancellation == 1 && strlen($resultset->row()->limitcancel_time) > 0  ? date("H:i:s", strtotime($resultset->row()->limitcancel_time)) : NULL;
			$returndata['trade_settings']['booktimegab'] = $resultset->row()->has_timegap_onbook == 1 && strlen($resultset->row()->time_gap) > 0  ? gmdate("H:i:s", ($resultset->row()->time_gap * 60)) : NULL;
		}
		$rpanelquery = $this->db->query("SELECT id, rate_display, market_status FROM dt_r_panel");
		if($rpanelquery->num_rows() > 0){
			$returndata['trade_settings']['ratedisplay'] = $rpanelquery->row()->rate_display;
		}
		$salesquery = $this->db->query("SELECT if(rcom_comtype= 1,1,0) as com_type, count(book_no) as noofbooking,
		sum(TRIM(book_qty*1000)+0 )as bookqty,
		sum(round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2)) as bookamount
		From dt_booking
		Left join dt_com_master on com_id = book_comid
		LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
		WHERE book_type=0 AND ifnull(delete_status,0) = 0
		AND DATE(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) = CURRENT_DATE()
		GROUP BY rcom_comtype");
		if($salesquery->num_rows() > 0){
			foreach($salesquery->result() as $row){
				if($row->com_type == 0){//Gold
					$returndata['sales']['gold'] = number_format($row->bookqty,2,'.','');
					$returndata['sales']['noofgoldbooking'] = $row->noofbooking;
				}else{
					$returndata['sales']['silver'] = number_format($row->bookqty,2,'.','');
					$returndata['sales']['noofsilverbooking'] = $row->noofbooking;
				}
			}
		}
		$deliveredquery = $this->db->query("SELECT
		count(distinct(cusdel_code)) as noofdelivery,
		if(rcom_comtype= 1,1,0) as com_type, IFNULL( SUM( cusdel_deliveryqty * 1000 ) , 0 ) AS deliveredqty
		FROM dt_customerdelivery
		LEFT JOIN dt_customer_deliveryinvoice ON cusdel_code = delivery_code
		LEFT JOIN dt_booking as book ON book.book_no = invoice_bookno
		Left join dt_com_master on com_id = book_comid
		LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
		WHERE DATE(cusdel_date) = CURRENT_DATE()
		GROUP BY rcom_comtype");
		if($deliveredquery->num_rows() > 0){
			foreach($deliveredquery->result() as $row){
				if($row->com_type == 0){//Gold
					$returndata['delivery']['golddelivered'] = number_format($row->deliveredqty,2,'.','');
				}else{
					$returndata['delivery']['silverdelivered'] = number_format($row->deliveredqty,2,'.','');
				}
			}
		}
		$pendingdelivery = $this->db->query("SELECT
		if(rcom_comtype= 1,1,0) as com_type,
		sum(TRIM((book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000)+0) as BalanceQty
		FROM dt_booking as bok
		LEFT JOIN dt_com_master ON book_comid = com_id
		LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
		LEFT JOIN (SELECT invoice_bookno, IFNULL( SUM( invoice_deliveryqty ) , 0 ) AS deliveredqty, IFNULL( DATE_FORMAT( cusdel_date, '%d-%m-%Y' ),'-') AS deliverydate
		FROM dt_customer_deliveryinvoice
		LEFT JOIN dt_customerdelivery ON cusdel_code = delivery_code
		GROUP BY invoice_bookno) AS del_qty on del_qty.invoice_bookno = book_no
		LEFT JOIN (SELECT SUM(IFNULL(knkoff_qty,0)) AS knkoff_qty, knkoff_bookno FROM dt_knockoff GROUP BY knkoff_bookno) AS knkoff ON knkoff.knkoff_bookno = book_no
		WHERE book_status = 1 AND book_type = 0 AND book_rate > 0 AND book_ishedge != 1 AND
		  ifnull(delete_status,0) = 0 AND (book_pricefrom = 0 or book_pricefrom =1 or book_pricefrom = 2) GROUP BY rcom_comtype
		HAVING BalanceQty > 0");
		if($pendingdelivery->num_rows() > 0){
			foreach($pendingdelivery->result() as $row){
				if($row->com_type == 0){//Gold
					$returndata['delivery']['goldpending'] = number_format($row->BalanceQty,2,'.','');
				}else{
					$returndata['delivery']['silverpending'] = number_format($row->BalanceQty,2,'.','');
				}
			}
		}
		$resultset = $this->db->query("select (select count(*) from dt_customer where cus_id != 1) as reg_cust, (select count(*) from dt_customer where cus_active = 1 and cus_id != 1) as enab_cust , (select count(*) from dt_customer where IFNULL(cus_active,0) = 0 and cus_id != 1) as dis_cust");
		if($resultset->num_rows() > 0){
			$returndata['quickfacts']['registeredcustomers'] = $resultset->row()->reg_cust;
			$returndata['quickfacts']['activecustomers'] = $resultset->row()->enab_cust;
			$returndata['quickfacts']['approvalpending'] = $resultset->row()->dis_cust;
		}
		return $returndata;
	}
	function gold_conversion($con_value, $com_weight) {
		$con_value = $con_value == '' ? 0 : $con_value;
		return ($con_value * (10 / $com_weight));
	}
	function silver_conversion($con_value, $com_weight) {
		$con_value = $con_value == '' ? 0 : $con_value;
		return ($con_value * (1000 / $com_weight));
	}
	function updatecommoditygroup(){

		$str_query = "SELECT '1' as comst, com.com_id, com_name, 
					com_isregion, ifnull(com_calpurity,0) as com_calpurity, 
					rcom_disname as displyname,contract_symbol as mcxcontract, bcontract_rate as bankcontract,
					rcom_mcxsymbol as mcxsymbol, rcom_banksymbol as banksymbol, 
					bconvert_value, bconvert_value_type, bextra_charges, bextra_type, bbase_rate, 
                    premium, rupeepremium, custom, octroi, tax, taxtype, pure, 
					rcom_sell_diff_type, rcom_buy_diff_type, rcom_sell_callpurity,
					rcom_buy_callpurity, rcom_comtype as com_type,
					ifnull(com_tax,0) as com_tax, ifnull(com_octroi,0) as com_octroi,  ifnull(com_stamduty,0) as com_stamduty, com_roundoff, 
					com_weight, com_unit, com_other_charges, rcom_id as rcomid,
					trade_type, sell_diff, buy_diff, sell_rate,
					com_correction_type, com_is_coin, com_order_number, 
					com_display_purity , TRIM(com_bar_quantity)+0 AS com_bar_quantity, ifnull(com_margin_type, 0) as com_margin_type, com_margin_value ,allowed_decimals, 
					com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type, 
					com_sel_active, com_buy_active, com_delverydays, 
					date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d/%m/%Y') as deliverydays,
					allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type FROM dt_com_master AS com 
					LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1 
					LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type 
					LEFT JOIN dt_contractmaster as mcxc ON mcxc.contract_id = rpc.rcom_mcxsymbol 
					LEFT JOIN dt_bankcontractmaster as bcm ON bcm.bcontract_id = rpc.rcom_banksymbol 
					LEFT JOIN dt_rpanelbank as rpb ON rpb.banksymbol = bcm.bcontract_id
					LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
					WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number";
					$resultset = $this->db->query($str_query);
					$arr = array();
		$requst_array = array();
		foreach($resultset->result_array() as $row)	{
			$arr[] = $row;
		}
		$resultset->free_result();
		$requst_array["commodity"] = $arr;
		$contractquery = $this->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach($contractquery->result() as $contractrow){

			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, 'userpage_status' => $contractrow->userpage_status, 'userpage_displayname' => $contractrow->userpage_displayname);

		}
		$contractquery->free_result();
		$requst_array["rpanel_contracts"] = $rpanel_display_contracts;
		$return_array["commodity"] = $requst_array;

		$url = isset(Globals::$commodityupdate) ? Globals::$commodityupdate : '';
		if($url != '')
		{
			$field_string = http_build_query($return_array);
			$ch = curl_init();
			curl_setopt($ch,CURLOPT_URL,$url);
			curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
			curl_setopt($ch,CURLOPT_HEADER, false); 
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
			$result = curl_exec($ch);
		}
	}
	function updaterpanel(){
		$returndata = array();
		$rpanelquery = $this->db->query("SELECT id, rate_display, market_status, 
			date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime, 
			ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
		$rpaneldata = $rpanelquery->result_array();
		$rpanelquery->free_result();
		$returndata['rpaneldata'] = $rpaneldata[0];
	
		$rpanelbankquery = $this->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff, 
			if(showdiff = 1, askdiff, 0) as askdiff 
			FROM dt_bankcontractmaster 
			LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id 
			LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
			WHERE bcontract_status = 1");
		foreach($rpanelbankquery->result() as $rpbankrow){
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff);
		}
		$rpanelbankquery->free_result();
		$returndata['rpanelbank'] = $rpanel_display_bankrates;
	
		$rpanelcommodityquery = $this->db->query("SELECT rcom_id as comid, rcom_disname as dispname, 
			contract_symbol mcxcontract, 
			rcom_comtype as comtype, ifnull(trade_type,0) as tradetype, 
			ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff, 
			ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate   
			FROM dt_rpanelcommodities 
			LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol 
			LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
			LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id 
			WHERE rcom_status = 1");
		foreach($rpanelcommodityquery->result() as $commodityrow){
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate);
		}
		$rpanelcommodityquery->free_result();
		$returndata['rpanel_commodities'] = $rpanel_display_commodities;
		$requestdata['rpanel'] = $returndata;
		$url = isset(Globals::$rpanelupdate) ? Globals::$rpanelupdate : '';
		if($url != '')
		{
			$field_string = http_build_query($requestdata);
			$ch = curl_init();
			curl_setopt($ch,CURLOPT_URL,$url);
			curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
			curl_setopt($ch,CURLOPT_HEADER, false); 
			curl_setopt($ch, CURLOPT_POST, 1);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
			$result = curl_exec($ch); 
		}
	}
	function get_userid() {
		$user_id = "";
		$resultset = $this->db->query("select admin_user_id from dt_admin_user where admin_user_name='".$this->session->userdata('username')."'");
		foreach($resultset->result() as $row) {
			$user_id = $row->admin_user_id;
		}
		$resultset->free_result();
		return $user_id;
	}
	function clear_order() 
	{
		//$admin_id 				 	= $this->get_userid();
		$admin_id 				 	= 1;
		$adminipaddress 	 	 	= isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : NULL;
		$clearall_ratealert_url    	=  trim(isset(Globals::$clearallratealert) ? Globals::$clearallratealert : '');
		$client	 		   			=  trim(isset(Globals::$client) ? Globals::$client : '');
		
		if($clearall_ratealert_url != '' && $client != '')
		{
			$pending_orders = $this->db->query("SELECT  book_no, book_rate, cus_name, com_name, book_qty, cus_mobile, book_bar_type FROM 
									dt_booking
								LEFT JOIN 
									dt_customer ON cus_id = book_cusid
								LEFT JOIN 
									dt_com_master ON com_id = book_comid
								LEFT JOIN 
									dt_rpanelcommodities ON rcom_id = com_type
								WHERE 
									orderstatus=0 AND ordertype = 1");
									
			if($this->db->query("update dt_booking set orderstatus=3, book_adminuser='".$admin_id."', book_adminipaddress='".$adminipaddress."' where ordertype = 1 and orderstatus = 0"))
			{
				foreach ($pending_orders->result() as $orders)
				{
					$Qty = $orders->book_bar_type == 0 ? ($orders->book_qty*1000)." gms" : ($orders->book_qty)." kg";

					$messageForCustomer = "Dear ".($orders->cus_name).", your booking(book No:".($orders->book_no).") for ".$orders->com_name." with qty ".$Qty." at Rs. ".($orders->book_rate)." is CANCELLED.";
					$sms_api = $this->get_SMSAppSettings(1, $orders->cus_mobile);
					$arr = array("@@message@@" => $messageForCustomer);
					$sms_url = strtr($sms_api,$arr);

					if($sms_url != '')
					{
						//$curl_resp = curl_helper($sms_url, $sms_url);
					}
				}
				
				$requestdata = array('client'  => $client);
				$field_string = http_build_query($requestdata);
				//$curl_resp = curl_helper($clearall_ratealert_url, $field_string);
				return true;
			}
			else
				return false;
		}
		else
			return false;
	}
	function get_SMSAppSettings($sms_id, $mobile_no) {
		//Declaring variables
		$sms_returnurl = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";
		
		//Fetching SMS App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id='".$sms_id."'");
		foreach($result_set->result() as $row) {
			$sms_returnurl = $row->sas_url;			
		}
		$result_set->free_result();	
		
		//Fetching SMS App user name, password and sender id
		$result_set = $this->db->query("select admin_sms_username, admin_sms_password, admin_sms_senderid from dt_generalsettings");
		if($result_set->num_rows() > 0) {
			$sms_username	= $result_set->row()->admin_sms_username;
			$sms_password	= $result_set->row()->admin_sms_password;
			$sms_senderid	= $result_set->row()->admin_sms_senderid;			
		}
		$result_set->free_result();

		//Generating SMS Url with User Name, Password and Sender ID
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@password@@", $sms_password, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", $mobile_no, $sms_returnurl);
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
		
		//returning gererated URL
		return 	$sms_returnurl;
	}
	function getcommoditygroup($comgroup_id) {
		$returndata = array();
		$resultset = $this->db->query("SELECT com.com_id, com_group_id, com_name, ifnull(com_grp.com_sel_active,0) as com_sel_active,
				ifnull(com_grp.com_buy_active,0) as com_buy_active,ifnull(com_grp.com_sel_trade,0) as com_sel_trade, ifnull(com_grp.com_buy_trade,0) as com_buy_trade,ifnull(com_grp.com_sel_premium,0) as com_sel_premium,
				ifnull(com_grp.com_buy_premium,0) as com_buy_premium,ifnull(com_grp.com_delverydays,0) as com_delverydays,
				ifnull(com_grp.com_premium_type,0) as com_premium_type
				FROM dt_com_master AS com
				LEFT JOIN dt_com_group_com AS com_grp ON com_grp.com_id=com.com_id AND com_group_id = ".$comgroup_id."
				WHERE com.com_active=1 ORDER BY com.com_order_number");

		$returndata = array('comgroup' => $resultset->result_array());
		return $returndata;
	}
	function update_comgroup_comid($com_group_id, $com_id,$com_buy_active,$com_sel_active,$com_buy_premium, $com_sel_premium, $com_buy_trade, $com_sel_trade, $com_delverydays){
		
		//$this->db->where('com_id', $com_id);
		$com_groupupdatetime = time();
		if($this->db->update('dt_com_group_com', array('com_buy_active' => $com_buy_active,'com_sel_active' => $com_sel_active,'com_buy_premium' => $com_buy_premium,'com_sel_premium' => $com_sel_premium,'com_buy_trade' => $com_buy_trade,'com_sel_trade' => $com_sel_trade,'com_delverydays' => $com_delverydays),array('com_id' => $com_id, 'com_group_id' => $com_group_id))){
			$this->db->update('dt_r_panel', array('userupdatetime' => $com_groupupdatetime),array('id' => 1));
			$this->updatecommoditygroup();
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		
		return $returndata;
    }
	function update_limitorder($book_no, $book_qty,$book_rate,$cus_id,$com_name){
		
		//$this->db->where('com_id', $com_id);
		$com_groupupdatetime = time();
		if($this->db->update('dt_com_group_com', array('com_buy_active' => $com_buy_active,'com_sel_active' => $com_sel_active,'com_buy_premium' => $com_buy_premium,'com_sel_premium' => $com_sel_premium,'com_buy_trade' => $com_buy_trade,'com_sel_trade' => $com_sel_trade,'com_delverydays' => $com_delverydays),array('com_id' => $com_id, 'com_group_id' => $com_group_id))){
			$this->db->update('dt_r_panel', array('userupdatetime' => $com_groupupdatetime),array('id' => 1));
			$this->updatecommoditygroup();
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		
		return $returndata;
    }
	public function get_entry_record($record_id) //Fetch entry record
	{
		//Build contents query
		$query="SELECT book_no, book_cusid, book_comid, book_type, book_rate, book_comweight, book_datetime, book_totalcost, book_qty, book_no_bar, book_useripaddress FROM dt_booking WHERE book_no=".$record_id;
		$result_set=$this->db->query($query);

		foreach ($result_set->result() as $row)
		{
			$records['book_no']   			= $row->book_no;
			$records['book_cusid']   		= $row->book_cusid;
			$records['book_comid']   		= $row->book_comid;
			$records['book_type']   		= $row->book_type;
			$records['book_rate']  			= $row->book_rate;
			$records['book_comweight']   	= $row->book_comweight;
			$records['book_datetime']   	= $row->book_datetime;
			$records['book_totalcost']   	= $row->book_totalcost;
			$records['book_qty']   			= $row->book_qty;
			$records['book_no_bar']			= $row->book_no_bar;
			$records['book_useripaddress']	= $row->book_useripaddress;
			$records['db_error_msg']		= "";
		}
		return $records;
	}
	function update_todayorder($book_no, $book_qty,$book_rate,$book_narration){
		$oldRecord = $this->get_entry_record($book_no);
		$book_totalcost = $book_rate * $book_qty;
		
		$book_qty = $book_qty /1000;
		$this->db->where('book_no', $book_no);
		
		if($this->db->update('dt_booking', array('book_qty' => $book_qty,'book_rate' => $book_rate,'book_totalcost' => $book_totalcost,'book_narration' => $book_narration))){
			
			$receivedata['book_no']  = $book_no;
			$receivedata['book_qty']  = $book_qty;
			$receivedata['book_rate'] = $book_rate;
			$receivedata['book_totalcost'] = $book_totalcost;
			$receivedata['book_narration'] = $book_narration;
			
			$this->updateLimitLog($oldRecord,$receivedata);
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		
		return $returndata;
    }
	function updateLimitLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();

		if($oldRecord['book_qty'] != $newRecord['book_qty'])
		{
			$updatedRecord['New']['Book Qty'] = $newRecord['book_qty'];
			$updatedRecord['Old']['Book Qty'] = $oldRecord['book_qty'];
		}
		if($oldRecord['book_rate'] != $newRecord['book_rate'])
		{
			$updatedRecord['New']['Book Rate'] = $newRecord['book_rate'];
			$updatedRecord['Old']['Book Rate'] = $oldRecord['book_rate'];
		}
		if($oldRecord['book_narration'] != $newRecord['book_narration'])
		{
			$updatedRecord['New']['Admin Comment'] = $newRecord['book_narration'];
			$updatedRecord['Old']['Admin Comment'] = $oldRecord['book_narration'];
		}

		if(count($updatedRecord) > 0)
		{
			$bookId = array('Book No' => $newRecord['book_no']);
			$updatedRecord = $bookId + $updatedRecord;
			$records = json_encode($updatedRecord);
			$ipaddr = $_SERVER['SERVER_ADDR'];
			$log_shortdesc 	= "Updated Today trade admin app. Order No: ".$newRecord['book_no'];
			$user_id 		= $oldRecord['book_cusid'];
			$logtype = 0;
			$logdatetime = date('Y-m-d H:i:s');
			$logupdatedata = date('Y-m-d H:i:s');
			//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','','".$ipaddr."')");
		}
	}
	function getrpanelcontracts() {
		$returndata = array();
		$rpanelquery = $this->db->query("SELECT id, rate_display, market_status, 
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime, 
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel, dt_generalsettings");
		$rpaneldata = $rpanelquery->result_array();
		$rpanelquery->free_result();
		$rpanelsetting = $this->db->query("SELECT * FROM dt_generalrpsettings");
		$rpanelsettings = array('rpsg_weight' => $rpanelsetting->row()->rpsg_weight, 'rpss_weight' => $rpanelsetting->row()->rpss_weight, 'rpsg_roundoff' => $rpanelsetting->row()->rpsg_roundoff, 'rpss_roundoff' => $rpanelsetting->row()->rpss_roundoff);
		$rpanelsetting->free_result();
		$resultset = $this->db->query("SELECT rcom_id as comid, rcom_disname as dispname, 
			contract_symbol mcxcontract, 
			rcom_comtype as comtype, ifnull(trade_type,0) as tradetype, 
			ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff, 
			ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate   
			FROM dt_rpanelcommodities 
			LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol 
			LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
			LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id 
			WHERE rcom_status = 1 ORDER BY rcom_orderno ASC");

		$returndata = array('rpaneldata' => $rpaneldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelcotnractdata' => $resultset->result_array());
		return $returndata;
	}
	function getrpanelcontractsbyid($rpanelcon_id) {
		$returndata = array();
		$resultset = $this->db->query("SELECT rcom_id as comid, rcom_disname as dispname, 
			contract_symbol mcxcontract, 
			rcom_comtype as comtype, ifnull(trade_type,0) as tradetype, 
			ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff, 
			ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate   
			FROM dt_rpanelcommodities 
			LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol 
			LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
			LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id WHERE rcom_id = ".$rpanelcon_id);

		$returndata = array('rpanelcotnractdatabyid' => $resultset->result_array());
		return $returndata;
	}
	
	function commoditydetails($comid, $comtype){
		$rpanelsetting = $this->db->query("SELECT * FROM dt_generalrpsettings");
		
		if($comtype == 0)
		{
			$rpsetsweight = $rpanelsetting->row()->rpsg_weight;
			
		}
		else{
			$rpsetsweight = $rpanelsetting->row()->rpss_weight;
		}
		return $rpsetsweight;
	}
	function update_rpanel_comid($rpanelcomiddata){
		$rpanleweight = $this->commoditydetails($rpanelcomiddata['comid'],$rpanelcomiddata['comtype']);
		$update_rpanelrates = array('rpanelid' => 1, 'rpanelcomid' => $rpanelcomiddata['comid'], 'trade_type' => $rpanelcomiddata['tradetype'], 'sell_diff' => $rpanelcomiddata['comtype'] == 0 ? $this->gold_conversion($rpanelcomiddata['selldiff'], $rpanleweight) : $this->silver_conversion($rpanelcomiddata['selldiff'], $rpanleweight), 'buy_diff' => $rpanelcomiddata['comtype'] == 0 ? $this->gold_conversion($rpanelcomiddata['buydiff'], $rpanleweight) : $this->silver_conversion($rpanelcomiddata['buydiff'], $rpanleweight), 'sell_rate' => $rpanelcomiddata['comtype'] == 0 ? $this->gold_conversion($rpanelcomiddata['sellrate'],  $rpanleweight) : $this->silver_conversion($rpanelcomiddata['sellrate'], $rpanleweight));
		$com_groupupdatetime = time();
		if($this->db->update('dt_rpanelcontract', $update_rpanelrates, array('rpanelid' => 1,'rpanelcomid' => $rpanelcomiddata['comid']))){
			$this->db->update('dt_r_panel', array('userupdatetime' => $com_groupupdatetime),array('id' => 1));
			
			$this->updaterpanel();
			$this->updatecommoditygroup();
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		return $returndata;
    }
	function getbankpremium() {
		$returndata = array();
		$rpanelbankquery = $this->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff, 
											if(showdiff = 1, askdiff, 0) as askdiff 
											FROM dt_bankcontractmaster 
											LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id 
											LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
											WHERE bcontract_status = 1");
		foreach($rpanelbankquery->result() as $rpbankrow){
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff, "tcs_tax" => $rpbankrow->tcs_tax);
		}

		$returndata = array('bankpremdata' => $rpanel_display_bankrates);
		return $returndata;
	}
	function update_bankprem_bnkid($bankcomiddata){
		foreach($bankcomiddata as $bratkey => $brateval ){
			foreach($brateval as $bratkey2 => $brateval2 ){
				$update_bankrates = array('efp' => 0, 'premium' => $brateval2->premium, 'rupeepremium' => $brateval2->rupeepremium, 'custom' => $brateval2->custom, 'octroi' => 0, 'tax' => $brateval2->btax_value, 'taxtype' => $brateval2->btax_type, 'pure' => $brateval2->pure);
				if($this->db->update('dt_rpanelbank', $update_bankrates, array('banksymbol' => $brateval2->bcontract_id))){
					$com_groupupdatetime = time();
					$this->db->update('dt_r_panel', array('userupdatetime' => $com_groupupdatetime),array('id' => 1));
					
					$this->updaterpanel();
					$this->updatecommoditygroup();
					$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
				} else {
					$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
				}
			}
		}
		return $returndata;
    }
	function getrpanelcontractslist() {
		$returndata = array();
		$contractquery = $this->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach($contractquery->result() as $contractrow){
			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder);
		}
		$contractquery->free_result();
		$returndata = array('display_contracts' => $rpanel_display_contracts);
		return $returndata;
	}
	function update_market_status($marketsatus){
		$spl_char = array("&ldquo;","&nbsp;","&rdquo;","&quot;","\"","\xE2\x80\x9C","\xE2\x80\x9D");
		$rpanel_update_data = array();
		$rpanel_update_data = array('rate_display' => $marketsatus['rate_display'], 'lastupdatetime' => date('Y-m-d H:i:s'), 'updateon' => time(), 'userupdatetime' => time(), 'usercheckupdatetime' => time(), 'market_message' => str_replace($spl_char,"",$marketsatus["market_closed"]));
		if(isset($marketsatus['marketstatus'])){
			$rpanel_update_data['market_status'] = $marketsatus['marketstatus'];
			$rpanel_update_data['market_message'] = str_replace($spl_char,"",$marketsatus["market_closed"]);
		}else{
			$rpanel_update_data['market_status'] = 0;
		}
		
		if($this->db->update('dt_r_panel', $rpanel_update_data, array('id' => 1))){
			$com_groupupdatetime = time();
			$this->db->update('dt_r_panel', array('userupdatetime' => $com_groupupdatetime),array('id' => 1));
			
			$this->updaterpanel();
			$this->updatecommoditygroup();
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		return $returndata;
    }
	function update_trading_status($status, $clear_pendingorders){
		$records['trade_enable'] 	= $status;
		$settingsupdate    			=  trim(isset(Globals::$settingsupdate) ? Globals::$settingsupdate : '');
		$clearall_ratealert_url    	=  trim(isset(Globals::$clearallratealert) ? Globals::$clearallratealert : '');
		$client	 		   			=  trim(isset(Globals::$client) ? Globals::$client : '');

		if($settingsupdate != '' && $client != '' && ($status == 0 && $clear_pendingorders == 1 ? $clearall_ratealert_url != '' : true))
		{
			if($this->db->update('dt_generalsettings', $records))
			{
				$settings = $this->db->query("SELECT  trade_enable, limit_cancellation, limitcancel_time, trade_on, trade_on_time, trade_off, trade_off_time FROM 	dt_generalsettings")->result();
				
				$trade_enable 		= $settings[0]->trade_enable;
				$limit_cancellation = $settings[0]->limit_cancellation;
				$limitcancel_time 	= $settings[0]->limitcancel_time;
				$trade_on 			= $settings[0]->trade_on;
				$trade_on_time 		= $settings[0]->trade_on_time;
				$trade_off 			= $settings[0]->trade_off;
				$trade_off_time 	= $settings[0]->trade_off_time;

				$limitcancel_time = $limit_cancellation == 1 && strlen($limitcancel_time) > 0  ? date("H:i:s", strtotime($limitcancel_time)) : NULL;

				$trade_on_time = $trade_on == 1 && strlen($trade_on_time) > 0  ? date("H:i:s", strtotime($trade_on_time)) : NULL;

				$trade_off_time = $trade_off == 1 && strlen($trade_off_time) > 0  ? date("H:i:s", strtotime($trade_off_time)) : NULL;

				$requestdata = array('client'  		  => $client,
									 'trade_enable'   => $trade_enable,
									 'limit_expire'   =>  $limit_cancellation,
									 'limit_expire_time' => $limitcancel_time, 
									 'trade_on' 	  => $trade_on, 
									 'trade_on_time'  => $trade_on_time, 
									 'trade_off'	  => $trade_off, 
									 'trade_off_time' => $trade_off_time
									 );
				
				$field_string = http_build_query($requestdata);
				$ch = curl_init();
				curl_setopt($ch,CURLOPT_URL,$settingsupdate);
				curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
				curl_setopt($ch,CURLOPT_HEADER, false); 
				curl_setopt($ch, CURLOPT_POST, 1);
				curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
				$result = curl_exec($ch);
				curl_close($ch);
				
				//Notification for trade on/off
				$message ='';
				if($trade_enable == 1){
					$message = 'Online Trade Starts';
				}
				else{
					$message = 'Online Trade Closed';
				}

				$content = array(
				"en" => $message
				);
				if(!empty(isset(Globals::$app_id) ? Globals::$app_id : '')){
					$hashes_array = array();
					$fields = array(
						'app_id' => isset(Globals::$app_id) ? Globals::$app_id : '',
						'included_segments' => array('All'),
						'data' => array(
							"nav" => "1"
						),
						'headings' => array("en" => isset(Globals::$notification_title) ? Globals::$notification_title : ''),
						'subtitle' => array("en" => isset(Globals::$notification_subtitle) ? Globals::$notification_subtitle : ''),
						'contents' => array("en" => $message),
						'web_buttons' => $hashes_array
					);
					$fields = json_encode($fields);

					$ch = curl_init();
					curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
					curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',

													   'Authorization: Basic '.isset(Globals::$onesignalAPI) ? Globals::$onesignalAPI : ''));
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
					curl_setopt($ch, CURLOPT_HEADER, FALSE);
					curl_setopt($ch, CURLOPT_POST, TRUE); 
					curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
					curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
					$response = curl_exec($ch);
					curl_close($ch);
					//Notification for trade on/off
				}

				//clear pending orderstatus
				if($clear_pendingorders == 1 && $status == 0)
				{
					$clearedstatus = $this->clear_order();
					if(!$clearedstatus)
					{
						$returndata = array('status' => 0, 'error' => 'Error occured in cancelling order. Please contact administrator');
						return $returndata;
						exit;
					}
				}
				$this->updaterpanel();
				$this->updatecommoditygroup();
				$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
			}
			else

			{
				$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
			}
		}
		return $returndata;
    }
	function getcustomerslist() {
		$query = $this->db->query("select cus_id, cus_name, cus_login_name, 
								replace(com_group_name,' ','_') as groupname,cus_company_name, 
								cus_alise_name, cus_mobile from dt_customer
								LEFT JOIN dt_customergroupitems ON cgitems_cusid = cus_id 
								LEFT JOIN dt_com_group_master ON com_group_id = cgitems_comgroupid WHERE cus_active = 1 and cus_login_name != 'guest' ORDER BY cus_id");
		return $returndata = $query->result_array();
		
	}
	function getcustomerlistbyid($cus_id) {
		/* $returndata = array();
		$resultset = $this->db->query("SELECT cus_com_id, 
			IF(IFNULL(com_sel_trade,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1, 1 ,0) AS  cus_com_status_sell,
			IF(IFNULL(com_buy_trade,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1, 1, 0) AS cus_com_status_buy, cus_com_smoq, cus_com_pmoq,
			rcom_comtype AS com_type, com_weight, com_bar_quantity, com_margin_type, com_margin_value
			FROM dt_cus_commodity AS ccd
			LEFT JOIN dt_customergroupitems AS cgi ON ccd.cus_com_cus_id = cgi.cgitems_cusid
			LEFT JOIN dt_com_group_master AS cgm ON cgi.cgitems_comgroupid = cgm.com_group_id
			LEFT JOIN dt_com_group_com AS cgc ON cgm.com_group_id = cgc.com_group_id AND cgc.com_id = ccd.cus_com_id
			LEFT JOIN dt_com_master AS com ON ccd.cus_com_id = com.com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			WHERE cgm.com_group_active = 1 AND ccd.cus_com_cus_id =  '".$cus_id."' AND (cgc.com_sel_active = 1 OR cgc.com_buy_active = 1)");
			$i = 0;
			foreach ($resultset->result() as $row)
			{
				$records[$i]['trade_status_id']	= $row->cus_com_id;
				$records[$i]['trade_status_buy']	= $row->cus_com_status_buy;
				$records[$i]['trade_status_sell'] = $row->cus_com_status_sell;
				$i++;
			}
		
		$returndata = array('customertradedetailsbyid' => $records);
		return $returndata; */
		$returndata = array();
		$resultset = $this->db->query("SELECT cus_com_id AS trade_status_id, 
			IF(IFNULL(com_sel_trade,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1, 1 ,0) AS  trade_status_sell,
			IF(IFNULL(com_buy_trade,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1, 1, 0) AS trade_status_buy
			FROM dt_cus_commodity AS ccd
			LEFT JOIN dt_customergroupitems AS cgi ON ccd.cus_com_cus_id = cgi.cgitems_cusid
			LEFT JOIN dt_com_group_master AS cgm ON cgi.cgitems_comgroupid = cgm.com_group_id
			LEFT JOIN dt_com_group_com AS cgc ON cgm.com_group_id = cgc.com_group_id AND cgc.com_id = ccd.cus_com_id
			LEFT JOIN dt_com_master AS com ON ccd.cus_com_id = com.com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			WHERE cgm.com_group_active = 1 AND ccd.cus_com_cus_id =  '".$cus_id."' AND (cgc.com_sel_active = 1 OR cgc.com_buy_active = 1) AND
			(cgc.com_sel_trade = 1 OR cgc.com_sel_trade = 1)");

		$returndata = array('customertradedetailsbyid' => $resultset->result_array());
		return $returndata;
	}
	function update_market_onoff($marketdisplay){
		$spl_char = array("&ldquo;","&nbsp;","&rdquo;","&quot;","\"","\xE2\x80\x9C","\xE2\x80\x9D");
		$rpanel_update_data = array();
		$rpanel_update_data = array('rate_display' => $marketdisplay['rate_display'], 'lastupdatetime' => date('Y-m-d H:i:s'), 'updateon' => time(), 'userupdatetime' => time(), 'usercheckupdatetime' => time());
		if($this->db->update('dt_r_panel', $rpanel_update_data, array('id' => 1))){
			$com_groupupdatetime = time();
			$this->db->update('dt_r_panel', array('userupdatetime' => $com_groupupdatetime),array('id' => 1));
			
			$this->updaterpanel();
			$this->updatecommoditygroup();
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		return $returndata;
    }
	function update_hedge_onoff($data){
		if($this->db->update('dt_generalsettings', array('is_hedge' =>  $data['hedgestatus']))){
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		return $returndata;
	}
	function update_limitcl_bktimegap($data){
		if($data['type'] == 'limit')
		{
			if($data['updatetime'] != '')
				$limittime = 1;
			else
				$limittime = 0;
			if($this->db->update('dt_generalsettings', array('limit_cancellation' => $limittime,'limitcancel_time' => $data['updatetime']))){
				$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
			} else {
				$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
			}
		}
		else{
			if($data['updatetime'] != '')
				$timegap = 1;
			else
				$timegap = 0;
			
			$timestamp = strtotime($data['updatetime']);
			$updatetime = date('i.s', $timestamp);
			if($this->db->update('dt_generalsettings', array('has_timegap_onbook' => $timegap,'time_gap' => $updatetime))){
				$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
			} else {
				$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
			}
		}
		return $returndata;
    }
	function getcompbranchlist() {
		$returndata = array();
		$branchquery = $this->db->query("SELECT * FROM dt_comp_branch where branch_active = 1 ORDER BY branch_code");
		foreach($branchquery->result() as $cbranchrow){
			$comp_branch[] = array("branch_code" => $cbranchrow->branch_code, "branch_name" => $cbranchrow->branch_name, "branch_address" => $cbranchrow->branch_address, "branch_state" => $cbranchrow->branch_state, "branch_country" => $cbranchrow->branch_country, "branch_contactno" => $cbranchrow->branch_contactno, "branch_pincode" => $cbranchrow->branch_pincode, "branch_gstno" => $cbranchrow->branch_gstno, "branch_hsncode" => $cbranchrow->branch_hsncode, "branch_city" => $cbranchrow->branch_city);
		}
		$branchquery->free_result();
		$returndata = array('company_branch' => $comp_branch);
		return $returndata;
	}
	function getoutstandinglist()
	{
		$returndata = array();
		$resultset = $this->db->query("SELECT book_no as bookno,
						DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%y %H:%i:%s') as bookdate, book_comid as comcode,if(rcom_comtype= 1,1,0) as com_type,
						if(book_type=0,'Sell','Buy') as book_type,
						if(rcom_comtype = 1, book_qty, book_qty * 1000) as unpaid_qty,
						book_rate,
						cus_name as customername,
						REPLACE(com_name,'`','') as commodityname,
						if(rcom_comtype = 1,CONCAT(TRIM(book_qty)+0, ' (kgs)'), CONCAT(TRIM(book_qty*1000)+0, ' (gms)')) as bookqty,
						cus_id as cuscode,
						TRIM(round(((book_totalcost/book_qty) * (book_qty)),2))+0 as bookamount,
						if(rcom_comtype = 1,CONCAT(TRIM((book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0))))+0, ' (kgs)'), CONCAT(TRIM((book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000)+0, ' (gms)')) as BalanceQty,
						if(rcom_comtype = 0,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0') as BalanceQty_gold,
						if(rcom_comtype = 1,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0') as BalanceQty_silver,
						TRIM((book_qty - if(is_unfix = 1, IFNULL(knkoff.knkoff_qty,0), 0))*1000)+0 AS knockedoff_qty,
						invoice_bookno AS cusdel_bookno,
						cus_alise_name,
						ifnull(cus_city,'-') AS cus_city, remarks, cus_mobile, cus_state, 
						cus_company_name, IFNULL(is_unfix,0) AS is_unfix,
						cus_phone,branch_name,if(bok.purity = 0 , '995', if(bok.purity = 1, '999', '9999')) as purity,dollar_fixedrate,inr_fixedrate, 0 As show_details
						FROM dt_booking as bok
						LEFT JOIN dt_customer on cus_id = book_cusid
						LEFT JOIN dt_com_master ON book_comid = com_id 
						LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
						LEFT JOIN dt_comp_branch ON branch_code = book_branch
						LEFT JOIN (SELECT invoice_bookno, IFNULL( SUM( invoice_deliveryqty ) , 0 ) AS deliveredqty, IFNULL( DATE_FORMAT( cusdel_date, '%d-%m-%Y' ),'-') AS deliverydate
						FROM dt_customer_deliveryinvoice
						LEFT JOIN dt_customerdelivery ON cusdel_code = delivery_code
						GROUP BY invoice_bookno) AS del_qty on del_qty.invoice_bookno = book_no
						LEFT JOIN (SELECT SUM(IFNULL(knkoff_qty,0)) AS knkoff_qty, knkoff_bookno FROM dt_knockoff GROUP BY knkoff_bookno) AS knkoff ON knkoff.knkoff_bookno = book_no
						WHERE book_status = 1 AND book_type = 0 AND book_rate > 0 AND book_ishedge != 1 AND
					  	ifnull(delete_status,0) = 0 AND (book_pricefrom = 0 or book_pricefrom =1 or book_pricefrom = 2) 
						HAVING BalanceQty > 0 AND knockedoff_qty > 0 
					    ORDER BY
					    DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s')
					    DESC ");
						$unpaid_qty				=	0;		
						$unpaid_amount			=	0;
						$qty_gold				=	0;
						$qty_silver				=	0;
						$qty_total				=	0;
						foreach ($resultset->result() as $row)
						{
							$qty_gold				+=	$row->BalanceQty_gold;	
							$qty_silver				+=	$row->BalanceQty_silver;
							
							if($row->book_type == 'Buy')			
								$unpaid_qty			+=	$row->unpaid_qty;	
							else
								$unpaid_qty			-=	$row->unpaid_qty;
						}
						/* $userData['unpaid_qty']		= round($unpaid_qty,2);
						$userData['unpaid_amount']  = $unpaid_amount; */
						$userData['qty_gold']		= round($qty_gold,2)." Grms";
						$userData['qty_silver']		= round($qty_silver,2)." Grms";
						$userData['qty_total']		= round($qty_gold+$qty_silver,2)." Grms";
						
						$records	=	array();
						$records[0]	=	$resultset;
						$records[1]	=	$userData;
		$returndata = array('pendingdealdata' => $resultset->result_array(), 'pendingdealtotal' => $userData);
		
		return $returndata;
	}
	function getdealregisterlist($from_date = "", $to_date = "")
	{
		$returndata = array();
		
		$days_expire = "";
		$query = $this->db->query("SELECT if(expire_history = 1, days_expire,'') AS days_expire FROM dt_generalsettings");
		$days_expire 	= $query->row()->days_expire;

		$date_expire = $days_expire != "" ? ($days_expire > 0 ? ("IF(IFNULL(ordertype,0) = 1 AND (IFNULL(orderstatus,0) = 1 OR IFNULL(orderstatus,0) = 0), IF(IFNULL(orderstatus,0) = 0, 1 ,IF(IFNULL(orderplacedtime,'') != '' , IF(DATE_ADD(DATE(orderplacedtime), INTERVAL ".$days_expire." DAY) >= CURDATE() , 1, 0), 1)), IF(DATE_ADD(DATE(book_datetime), INTERVAL ".$days_expire." DAY) >= CURDATE() , 1, 0)) = 1 AND ") : " 0 AND ") : "";
		if($from_date != "" && $to_date != "")
		{
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "DATE(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) BETWEEN '".$from_date."' AND '".$to_date."'";
		}
		else
		{
			$date = "";
		}
		
		$resultset = $this->db->query("SELECT book_no, 
				DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as book_datetime,com_name,cus_name as customername,
				if(rcom_comtype = 1,CONCAT(TRIM(book_qty)+0, ' (Kg)'), CONCAT(TRIM(book_qty*1000)+0, ' (Gm)')) as bookqty,(book_qty * 1000) as qty, if(book_type=1,'Buy','Sell') as type,
				if(rcom_comtype = 0, (book_qty*1000), '0') as qty_gold,
				if(rcom_comtype = 1, (book_qty*1000), '0') as qty_silver,
				TRIM(book_totalcost)+0 AS book_totalcost,
				if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 'Delivered', if(book_status = 2, 'Waiting for approval', if(book_status = 3, 'Rejected', if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 'Confirmed',if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 'Limit Cancelled', if(book_status = 0 and ifnull(orderstatus,0) = 0, 'Pending', (if(book_qty - ifnull(deliveredqty,0) > 0 and ifnull(deliveredqty,0) > 0, 'Partial Del' , if(ifnull(orderstatus,0) = 4, 'Expired', if(ifnull(orderstatus,0) = 5, 'Cancelled, Insufficient margin', '')))))))))) as status,
				if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 6, if(book_status = 2, 2, if(book_status = 3, 3, if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 1,if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 4, if(book_status = 0 and ifnull(orderstatus,0) = 0, 0, (if(book_qty - ifnull(deliveredqty,0) > 0 and ifnull(deliveredqty,0) > 0, 5 , if(ifnull(orderstatus,0) = 4, 7, if(ifnull(orderstatus,0) = 5, 8, '')))))))))) as bookstatus,
				if(book_qty - ifnull(deliveredqty,0) = 0, 'Delivered', if((ifnull(deliveredqty,0) - book_qty) > 0, if(book_qty = ifnull(deliveredqty,0), 'Pending', 'Partial Del'),'Pending')) as bookstatus_del,
				if(rcom_comtype = 1,CONCAT(TRIM(del_qty.deliveredqty)+0, ' (Kg)'), CONCAT(TRIM(del_qty.deliveredqty*1000)+0, ' (Gm)')) as delivered_qty,
				if(rcom_comtype = 1,CONCAT(TRIM((book_qty - ifnull(del_qty.deliveredqty,0)))+0,' Kg'), CONCAT(TRIM((book_qty - ifnull(del_qty.deliveredqty,0))*1000)+0, ' Gm')) AS pending_qty, 
				ifnull(del_qty.deliverydate,'-') as deliverydate, TRIM( book_rate)+0 AS book_rate, ordertype,if(ordertype = 0, 'Book','Limit') as order_type, if(book_by = 3,'Admin', if(book_by = 4,'Admin App','User')) AS book_by, rcom_comtype as comtype,
				0 As show_details
				from dt_booking
				LEFT JOIN
				(SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty, ifnull(date_format(max(cusdel_date), '%d-%m-%Y %H:%i:%s'), '-') as deliverydate 
				from dt_customerdelivery group by cusdel_bookno)
				as del_qty on del_qty.cusdel_bookno = book_no 										
				LEFT JOIN dt_com_master ON com_id = book_comid 
				LEFT JOIN dt_customer ON book_cusid = cus_id
				LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
				WHERE ".$date_expire." 
				".$date." order by IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime) DESC");

				$book_totalcost			=	0;
				$qty					=	0;
				$qty_gold				=	0;
				$qty_silver				=	0;
				foreach ($resultset->result() as $row)
				{
					if($row->type == 'Buy')			
						$book_totalcost		+=	$row->book_totalcost;	
					else
						$book_totalcost		-=	$row->book_totalcost;	
					
					if($row->type == 'Buy')			
						$qty				+=	$row->qty;	
					else
						$qty				-=	$row->qty;
						
					$qty_gold				+= 	$row->qty_gold;
					$qty_silver				+= 	$row->qty_silver;
				}
				$userData['book_totalcost'] = round($book_totalcost,2);
				//$userData['qty']			= $qty;
				$userData['qty_gold']		= round($qty_gold,3);
				$userData['qty_silver']		= round($qty_silver,3);
				$userData['qty_total']		= round($qty_gold+$qty_silver,3);
				
				$records	=	array();
				$records[0]	=	$resultset;
				$records[1]	=	$userData;
										
		$returndata = array('bookingdata' => $resultset->result_array(), 'bookingtotal' => $userData);
		
		return $returndata;
	}
	function gethedgelist($from_date = "", $to_date = "")
	{
		$returndata = array();
		
		if($from_date != "" && $to_date != "")
		{
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "AND DATE(bookedon) BETWEEN '".$from_date."' AND '".$to_date."'";
		}
		else
		{
			$date = "";
		}
		
		$resultset = $this->db->query("SELECT hedgid, dealid, orderid, (volume*100) AS volume, price, bid, ask, comment, request_id, symbol, cusbookid, DATE_FORMAT(bookedon, '%d-%m-%Y %h:%i:%s %p') AS bookedon, bookedby, orderfor, mt5_disable, ifnull(TRIM(book_qty*1000)+0,'-') as book_qty, book_rate, cus_name 
		FROM dt_mt5_hedgedata 
		LEFT JOIN dt_booking ON cusbookid = book_no 
		LEFT JOIN dt_customer ON cus_id = book_cusid
		WHERE mt5_disable = 0 ".$date." ORDER BY hedgid DESC");
										
		$returndata = array('hedgingdata' => $resultset->result_array());
		
		return $returndata;
	}
	function gettodaytradelist($from_date = "", $to_date = "")
	{
		$returndata = array();
		
		$days_expire = "";
		$query = $this->db->query("SELECT if(expire_history = 1, days_expire,'') AS days_expire FROM dt_generalsettings");
		$days_expire 	= $query->row()->days_expire;

		$date_expire = $days_expire != "" ? ($days_expire > 0 ? ("IF(IFNULL(ordertype,0) = 1 AND (IFNULL(orderstatus,0) = 1 OR IFNULL(orderstatus,0) = 0), IF(IFNULL(orderstatus,0) = 0, 1 ,IF(IFNULL(orderplacedtime,'') != '' , IF(DATE_ADD(DATE(orderplacedtime), INTERVAL ".$days_expire." DAY) >= CURDATE() , 1, 0), 1)), IF(DATE_ADD(DATE(book_datetime), INTERVAL ".$days_expire." DAY) >= CURDATE() , 1, 0)) = 1 AND ") : " 0 AND ") : "";
		if($from_date != "" && $to_date != "")
		{
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "DATE(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) BETWEEN '".$from_date."' AND '".$to_date."'";
		}
		else
		{
			$date = "";
		}
		
		$resultset = $this->db->query("SELECT book_no, 
				DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as book_datetime,com_name,cus_name as customername,
				if(rcom_comtype = 1,CONCAT(TRIM(book_qty)+0, ' (Kg)'), CONCAT(TRIM(book_qty*1000)+0, ' (Gm)')) as bookqty,(book_qty * 1000) as qty, if(book_type=1,'Buy','Sell') as type,
				if(rcom_comtype = 0, (book_qty*1000), '0') as qty_gold,
				if(rcom_comtype = 1, (book_qty*1000), '0') as qty_silver,
				TRIM(book_totalcost)+0 AS book_totalcost,
				if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 'Delivered', if(book_status = 2, 'Waiting for approval', if(book_status = 3, 'Rejected', if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 'Confirmed',if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 'Limit Cancelled', if(book_status = 0 and ifnull(orderstatus,0) = 0, 'Pending', (if(book_qty - ifnull(deliveredqty,0) > 0 and ifnull(deliveredqty,0) > 0, 'Partial Del' , if(ifnull(orderstatus,0) = 4, 'Expired', if(ifnull(orderstatus,0) = 5, 'Cancelled, Insufficient margin', '')))))))))) as status,
				if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 6, if(book_status = 2, 2, if(book_status = 3, 3, if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 1,if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 4, if(book_status = 0 and ifnull(orderstatus,0) = 0, 0, (if(book_qty - ifnull(deliveredqty,0) > 0 and ifnull(deliveredqty,0) > 0, 5 , if(ifnull(orderstatus,0) = 4, 7, if(ifnull(orderstatus,0) = 5, 8, '')))))))))) as bookstatus,
				if(rcom_comtype = 1,CONCAT(TRIM(del_qty.deliveredqty)+0, ' (Kg)'), CONCAT(TRIM(del_qty.deliveredqty*1000)+0, ' (Gm)')) as delivered_qty,
				if(rcom_comtype = 1,CONCAT(TRIM((book_qty - ifnull(del_qty.deliveredqty,0)))+0,' Kg'), CONCAT(TRIM((book_qty - ifnull(del_qty.deliveredqty,0))*1000)+0, ' Gm')) AS pending_qty, 
				ifnull(del_qty.deliverydate,'-') as deliverydate, TRIM( book_rate)+0 AS book_rate, ordertype,if(ordertype = 0, 'Book','Limit') as order_type, if(book_by = 1, 'App',if(book_by = 2, 'Browser', if(book_by = 3, 'Admin','Admin App'))) AS book_by, rcom_comtype as comtype,
				0 As show_details,book_usercomment,book_hedgemanual,book_narration,book_ishedge, volume*100 as volume, price as mt5hedgeprice
				from dt_booking
				LEFT JOIN
				(SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty, ifnull(date_format(max(cusdel_date), '%d-%m-%Y %H:%i:%s'), '-') as deliverydate 
				from dt_customerdelivery group by cusdel_bookno)
				as del_qty on del_qty.cusdel_bookno = book_no 										
				LEFT JOIN dt_com_master ON com_id = book_comid 
				LEFT join dt_mt5_hedgedata on book_no = cusbookid
				LEFT JOIN dt_customer ON book_cusid = cus_id
				LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
				WHERE ".$date_expire." book_status = 1 AND ifnull(delete_status,0) = 0 AND
				".$date." order by IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime) DESC");

				$book_totalcost			=	0;
				$qty					=	0;
				$qty_gold				=	0;
				$qty_silver				=	0;
				foreach ($resultset->result() as $row)
				{
					if($row->type == 'Buy')			
						$book_totalcost		+=	$row->book_totalcost;	
					else
						$book_totalcost		-=	$row->book_totalcost;	
					
					if($row->type == 'Buy')			
						$qty				+=	$row->qty;	
					else
						$qty				-=	$row->qty;
						
					$qty_gold				+= 	$row->qty_gold;
					$qty_silver				+= 	$row->qty_silver;
				}
				$userData['book_totalcost'] = round($book_totalcost,2);
				//$userData['qty']			= $qty;
				$userData['qty_gold']		= round($qty_gold,3);
				$userData['qty_silver']		= round($qty_silver,3);
				$userData['qty_total']		= round($qty_gold+$qty_silver,3);
				
				$records	=	array();
				$records[0]	=	$resultset;
				$records[1]	=	$userData;
										
		$returndata = array('bookingdata' => $resultset->result_array(), 'bookingtotal' => $userData);
		
		return $returndata;
	}
	function getcusoutstandinglist()
	{
		//$from_date = date('Y-m-d', strtotime($from_date));
		//$to_date = date('Y-m-d', strtotime($to_date));
		$records = array();
		 
		//$delbranch_id == -1 ? '' : ('branch_id = '.$branch_id.' AND');
		
		$query = "SELECT cus_name,book_cusid, cus_company_name, cus_mobile,
			if(book_type = 0, 'SELL', 'BUY') AS book_type,
			book_no as bookno,
			sum(IF(rcom_comtype != 1, (book_qty),0)) - sum(ifnull(del.gold_deliveredqty,0)) - sum(ifnull(knock.goldknockoffqty,0)) as gold_sell_qty,
			sum(IF(rcom_comtype = 1, (book_qty),0)) - sum(ifnull(del.silver_deliveredqty,0)) - sum(ifnull(knock.silverknockoffqty,0)) as silver_sell_qty,
			(IF(rcom_comtype != 1,sum(book_totalcost),0) - sum(ifnull(del.goldinvoice_amount,0))) as gold_totavg,
			(IF(rcom_comtype = 1,sum(book_totalcost),0) - sum(ifnull(del.silverinvoice_amount,0))) as silver_totavg,
			round(avg(IF(rcom_comtype != 1,book_rate,0)),2) as gold_sell_amt,
			round(avg(IF(rcom_comtype = 1,book_rate,0)),2) as silver_sell_amt, cus_phone
			FROM dt_booking as book
			LEFT JOIN dt_com_master on book_comid = com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN dt_customer ON cus_id = book_cusid
			LEFT JOIN (SELECT invoice_bookno as delivered_bookno,
			IF(rcom_comtype != 1,invoice_amount,0) as goldinvoice_amount,
			IF(rcom_comtype = 1,invoice_amount,0) as silverinvoice_amount,
			IF(rcom_comtype != 1, sum(invoice_deliveryqty), 0) as gold_deliveredqty,
			IF(rcom_comtype = 1, sum(invoice_deliveryqty), 0) as silver_deliveredqty,
			invoice_cuscode
			FROM dt_customer_deliveryinvoice as del_inv
			LEFT JOIN dt_booking ON invoice_bookno = book_no
			LEFT JOIN dt_com_master ON invoice_comid = com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
			Group by invoice_bookno) as del ON del.delivered_bookno = book.book_no
			LEFT JOIN (SELECT knkoff_bookno as knockoff_bookno,
			IF(rcom_comtype != 1, sum(knkoff_qty), 0) as goldknockoffqty,
			IF(rcom_comtype = 1, sum(knkoff_qty), 0) as silverknockoffqty,
			knkoff_cusid
			FROM dt_knockoff
			LEFT JOIN dt_booking ON knkoff_bookno = book_no
			LEFT JOIN dt_com_master ON book_comid = com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			Group by knkoff_bookno) as knock ON knock.knockoff_bookno = book.book_no
			WHERE ((IF(rcom_comtype != 1, (book_qty - ifnull(del.gold_deliveredqty,0) - ifnull(knock.goldknockoffqty,0)),0)) > 0  or
			(IF(rcom_comtype = 1, (book_qty - ifnull(del.silver_deliveredqty,0) - ifnull(knock.silverknockoffqty,0)),0)) > 0) and book_rate > 0 AND
			book_status = 1 AND book_type = 0 AND IFNULL(delete_status,0) = 0 AND IFNULL(is_unfix,0) != 1 AND book_ishedge != 1
			GROUP BY book_cusid,rcom_comtype";
		
		$resultset = $this->db->query($query);
		$result_sub = $resultset->result();
		foreach($result_sub as $key => $row)
		{
			$has_record = false;
			foreach($result_sub as $key1 => $row1)
			{
				if($row->book_cusid == $row1->book_cusid && $key1 != $key)
				{
					$has_record = true;
					$gold_sell_qty = $row->gold_sell_qty > 0 ? $row->gold_sell_qty : ($row1->gold_sell_qty > 0 ? $row1->gold_sell_qty : 0);
					$silver_sell_qty = $row->silver_sell_qty > 0 ? $row->silver_sell_qty : ($row1->silver_sell_qty > 0 ? $row1->silver_sell_qty : 0);
					/* $gold_sell_amt = $row->gold_sell_qty > 0 ? $row->gold_sell_amt : ($row1->gold_sell_qty > 0 ? $row1->gold_sell_amt : 0);
					$silver_sell_amt = $row->silver_sell_qty > 0 ? $row->silver_sell_amt : ($row1->silver_sell_qty > 0 ? $row1->silver_sell_amt : 0); */
					$gold_sell_amt = $row->gold_sell_qty > 0 ? ($row->gold_totavg/($gold_sell_qty*1000)) : ($row1->gold_sell_qty > 0 ? ($row1->gold_totavg/($gold_sell_qty*1000)) : 0);
					$silver_sell_amt = $row->silver_sell_qty > 0 ? ($row->silver_totavg/$silver_sell_qty) : ($row1->silver_sell_qty > 0 ? ($row1->silver_totavg/$silver_sell_qty) : 0);
					
					$gold_qty = ($gold_sell_qty*1000);
					$silver_qty = ($silver_sell_qty*1000);
					if($gold_qty > 0 || $silver_qty > 0)
					{
						$records[] =  array('cus_name' 		=> 	 $row->cus_name,
									'cus_company_name' 	=> 	 $row->cus_company_name, 
									'cus_mobile' 		=> 	 $row->cus_mobile,
									'cus_phone' 		=> 	 $row->cus_phone,
									'book_cusid' 		=> 	 $row->book_cusid, 
									'gold_qty' 			=> 	 round(($gold_qty),3)+0, 
									'gold_amt' 			=> 	 round($gold_sell_amt,2), 
									'silver_qty' 		=> 	 round(($silver_qty),3)+0, 
									'silver_amt' 		=> 	 round($silver_sell_amt,2));
					}
				}
				
			}
			if(!$has_record)
			{
				$gold_sell_qty = $row->gold_sell_qty > 0 ? $row->gold_sell_qty : 0;
				$silver_sell_qty = $row->silver_sell_qty > 0 ? $row->silver_sell_qty : 0;
				$gold_sell_amt = $row->gold_sell_qty > 0 ? $row->gold_sell_amt : 0;
				$silver_sell_amt = $row->silver_sell_qty > 0 ? $row->silver_sell_amt : 0;
				$gold_qty = ($gold_sell_qty*1000);
				$silver_qty = ($silver_sell_qty*1000);
				if($gold_qty > 0 || $silver_qty > 0)
				{
					$records[] =  array('cus_name' 		=> 	 $row->cus_name,
								'cus_company_name' 	=> 	 $row->cus_company_name, 
								'cus_mobile' 		=> 	 $row->cus_mobile,
								'cus_phone' 		=> 	 $row->cus_phone,
								'book_cusid' 		=> 	 $row->book_cusid, 
								'gold_qty' 			=> 	 round(($gold_qty),3)+0, 
								'gold_amt' 			=> 	 $gold_sell_amt, 
								'silver_qty' 		=> 	 round(($silver_qty),3)+0, 
								'silver_amt' 		=> 	 $silver_sell_amt);
				}
			}
		}
		
		$result = array_intersect_key($records, array_unique(array_column($records, 'book_cusid')));
		$result = array_values($result);
		$pendingdealtotal = array("qty_gold" => 0, "qty_silver" => 0, "qty_total" => 0, "total_amount" => 0);
		foreach($result as $okey => $outval){
			
			$pendingdealtotal['qty_gold'] += $outval['gold_qty'];
			
			$pendingdealtotal['qty_silver'] += $outval['silver_qty'];
			
			$pendingdealtotal['total_amount'] += (float)($outval['gold_amt'] +  $outval['silver_amt']);
			
		}
		$pendingdealtotal['qty_gold'] = number_format($pendingdealtotal['qty_gold'], 0);
		$pendingdealtotal['qty_silver'] = number_format($pendingdealtotal['qty_silver'], 0);
		return  array("outstandingdata" => $result, "outstandingtotal" => $pendingdealtotal);
		
	}
	function getlimitorderListlist()
	{
		
		$records = array();
		$resultset = $this->db->query("SELECT  
						book_cusid, book_no,DATE_FORMAT(book_datetime,'%d-%m-%Y %H:%i:%s') as book_datetime, book_rate, cus_id, cus_name, com_name, com_id, 
						if(rcom_comtype = 1,CONCAT(TRIM(book_qty)+0, ' (Kg)'), CONCAT(TRIM(book_qty*1000)+0, ' (Gm)')) as bookqty,
							TRIM(book_qty*1000)+0 as book_qty, book_type, if(book_type=0, 'Sell', 'Buy') as booktype, 
							if(book_status=0,'Request',if(book_status=1,'Confirm',
							if(orderstatus=0,'Request',''))) as orderstatus,book_totalcost,cus_alise_name,ifnull(cus_city,'-') AS cus_city,book_comid, cus_mobile, cus_company_name, rcom_comtype AS com_type,
							book_no_bar,book_request_amtwt as request_amt_wt, '2' as request_type
						FROM 
							dt_booking
						LEFT JOIN 
							dt_customer ON cus_id = book_cusid
						LEFT JOIN 
							dt_com_master ON com_id = book_comid
						LEFT JOIN 
							dt_rpanelcommodities ON rcom_id = com_type
						WHERE 
							orderstatus=0
							AND ordertype = 1
							AND ifnull(delete_status,0) = 0
						ORDER BY 
							book_no desc");
		
		$returndata = array('limitorderdata' => $resultset->result_array()); 
		return $returndata;
	}
	function getcusoutstandinglistbyid($cus_id){
		$cus_id =   $cus_id == -1 || $cus_id == "" ? '' : ('cus_id = '.$cus_id.' AND');
		$branch_id = -1;
			$bokbranch_id = $branch_id == -1 ? '' : ('book_branch = '.$branch_id.' AND');
			
			$delbranch_id = $branch_id == -1 ? '' : ('WHERE branch_id = '.$branch_id);
			
			$resultset = $this->db->query("SELECT book_no as bookno,
			DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %h:%i:%s %p') as bookdate,
			book_comid as comcode,if(rcom_comtype= 1,1,0) as com_type,
			if(book_type=0,'Sell','Buy') as book_type,book_rate,
			cus_name as customername,
			REPLACE(com_name,'`','') as commodityname,
			round((book_qty)*1000,0) as bookqty,cus_id as cuscode,
			round(((book_totalcost/book_qty) * (book_qty)),2) as bookamount,
			TRIM((book_qty - ifnull(del_qty.deliveredqty,0)- if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000) + 0 as BalanceQty,
			invoice_bookno AS cusdel_bookno,
			cus_alise_name,
			ifnull(cus_city,'-') AS cus_city, remarks, cus_mobile,book_usercomment,book_narration
			FROM dt_booking
			LEFT JOIN dt_customer on cus_id = book_cusid
			LEFT JOIN dt_com_master ON book_comid = com_id 
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN (SELECT invoice_bookno, IFNULL( SUM( invoice_deliveryqty ) , 0 ) AS deliveredqty, IFNULL( DATE_FORMAT( cusdel_date, '%d-%m-%Y' ),'-') AS deliverydate
			FROM dt_customer_deliveryinvoice
			LEFT JOIN dt_customerdelivery ON cusdel_code = delivery_code ".$delbranch_id." 
			GROUP BY invoice_bookno) AS del_qty on del_qty.invoice_bookno = book_no
			LEFT JOIN (SELECT SUM(IFNULL(knkoff_qty,0)) AS knkoff_qty, knkoff_bookno FROM dt_knockoff GROUP BY knkoff_bookno) AS knkoff ON knkoff.knkoff_bookno = book_no
			WHERE ".$cus_id." ".$bokbranch_id." book_status = 1 AND IFNULL(is_unfix,0) != 1 AND
			ifnull(delete_status,0) = 0 AND book_rate > 0 AND book_type = 0
			HAVING BalanceQty > 0
			ORDER BY book_no");
			$pendingdealtotal = array("qty_gold" => 0, "qty_silver" => 0, "qty_total" => 0, "total_amount" => 0);
			//$pendingdealtotal['qty_gold'] = array_sum(array_column($resultset->result_array(), 'gozhi')); 
			foreach($resultset->result_array() as $okey => $outval){
				if($outval['com_type'] == 0){
					$pendingdealtotal['qty_gold'] += $outval['BalanceQty'];
				}else if($outval['com_type'] == 1){
					$pendingdealtotal['qty_silver'] += $outval['BalanceQty'];
				}
				$pendingdealtotal['total_amount'] += (float)(($outval['bookamount'] /  $outval['bookqty']) *  $outval['BalanceQty']);
				//$pendingdealtotal['total_amount'] += (float)number_format(($outval['bookamount'] /  $outval['bookqty']) *  $outval['BalanceQty'], 2);
			}
			$returndata = array('pendingdealdata' => $resultset->result_array(), 'pendingdealtotal' => $pendingdealtotal);
			return $returndata;
			
	}
	public function get_comm_details($commodity){
		$resultset = $this->db->query("SELECT IF(com_isregion != 0, com_calpurity, 0) as com_calpurity FROM dt_com_master WHERE com_id =".$commodity);
		foreach($resultset->result() as $row) {
			$com_calpurity = $row->com_calpurity;
		}
		$resultset->free_result();
		return $com_calpurity;
	}
	public function get_customer_hedge($cus_id){
		$resultset = $this->db->query("SELECT cus_ishedge FROM `dt_customer` WHERE cus_id =".$cus_id);
		foreach($resultset->result() as $row) {
			$cus_ishedge = $row->cus_ishedge;
		}
		$resultset->free_result();
		return $cus_ishedge;
	}
	function phonebookentryinsert($phbook){
		$return_data["status"] = false;

		$livePrice = 0;
		if($phbook['book_pricefrom'] != 2){
			$booking_rate = $phbook['book_rate'];
			$unfixbooking_rate = $phbook['book_rate'];
		}
		else{
			if($phbook['book_ozfixtype'] == 0 && $phbook['book_inrfixtype'] == 0){
				$booking_rate = $phbook['book_rate'];
				$unfixbooking_rate = $phbook['book_rate'];
			}
			else{
				$booking_rate = '0.00';
				$unfixbooking_rate = $phbook['book_rate'];
			}
		}
		//$livePrice = "";

		if($phbook['book_no_bar'] > 0)
		{
			$cur_date = date('Y-m-d H:i:s');
			
			$book_datetime = $phbook['is_bookdate'] == 1 ? date("Y-m-d H:i:s", strtotime($phbook['book_datetime'])) : $cur_date;
			
			$value_datetime = $phbook['is_valuedate'] == 1 ? date("Y-m-d H:i:s", strtotime($phbook['value_datetime'])) : '';

			$data = json_decode($this->get_available_qty($phbook));
			//$com_weight = $data->com_weight;
			
			
			
			$com_weight = $phbook['book_comweight'];

			$booked_qty =  $phbook['book_qty']+0;
			if($phbook['book_pricefrom'] != 2){
				$totalcost = round(($booking_rate / $com_weight) * $booked_qty * 1000,2);
				$unfixtotalcost = "";
			}
			else{
				if($phbook['book_ozfixtype'] == 0 && $phbook['book_inrfixtype'] == 0){
					$totalcost = round(($booking_rate / $com_weight) * $booked_qty * 1000,2);
					$unfixtotalcost = round(($booking_rate / $com_weight) * $booked_qty * 1000,2);
				}
				else{
					$totalcost = '0.00';
					$unfixtotalcost = round(($unfixbooking_rate / $com_weight) * $booked_qty * 1000,2);
				}
			}
			/*$has_margin = $_POST['request_type'] == 0 && $data->margin > 0 && ($data->confirmation_for == 1 || $data->confirmation_for == 2) ? true : false;*/

			$has_margin = false;

			$margin_hold = 0;

			//if(($data->has_minqty == 1 ? ($booked_qty >= $data->min_qty) : true) && ($data->has_maxqty == 1 ? ($booked_qty <= $data->max_qty) : true) && ($phbook['request_type'] == 1 ? ($data->pending_order+1 <=  $data->max_order) : true))
			if($phbook['request_type'] == 1 ? ($data->pending_order+1 <=  $data->max_order) : true)
			{
				if($has_margin ? ($data->margin_amt  >= $margin_hold) : true)
				{
					if(empty($value_datetime)){  $value_datetime = NULL;    }
					$insert_data['book_cusid']	    = 	$phbook['book_cusid'];
					$insert_data['book_datetime']	=	$book_datetime;
					$insert_data['value_datetime']	=	$value_datetime;
					$insert_data['book_comid']	    = 	$phbook['book_comid'];
					$insert_data['book_qty']		= 	$booked_qty;
					$insert_data['book_rate']	  	= 	$booking_rate;
					$insert_data['book_type']	  	= 	$phbook['book_type'];
					$insert_data['book_totalcost']	= 	$totalcost;
					$insert_data['book_comweight']	= 	$com_weight;
					$insert_data['book_no_bar']	    = 	$phbook['book_no_bar'];
					$insert_data['book_marginhold']	= 	$margin_hold;
					$insert_data['book_margin']		= 	$phbook['margin'];
					$insert_data['book_margintype']	= 	$phbook['margin_type'];
					$insert_data['book_marginstatus'] 	= 	0;
					$insert_data['book_hedgqty']		=	0;
					$insert_data['book_physicalqty']	= 	0;
					$insert_data['book_by'] 			=  	4; // admin booking or user booking
					$insert_data['ordertype']			= 	$phbook['request_type'];
					$insert_data['book_liveprice']		= 	$livePrice;
					$insert_data['book_margin_takenqty']=	$phbook['margintakenqty'];
					$insert_data['is_unfix'] 			=	$phbook['is_unfix'];
					$insert_data['book_pricefrom'] 		=	$phbook['book_pricefrom'];
					$insert_data['entry_date'] 			=	$cur_date;
					$insert_data['book_buydiscount'] 	=	($phbook['book_buydiscount']==NULL) ? 0 : $phbook['book_buydiscount'];
					$insert_data['book_buyexcharge'] 	=	($phbook['book_buyexcharge']==NULL) ? 0 : $phbook['book_buyexcharge'];

					if($phbook['request_type'] == 1) {
						$insert_data['ordervalidity']	= 0;
						$insert_data['orderstatus']		= 0;
						$insert_data['book_status']	  	= 0;
					}
					else if($phbook['request_type'] == 0 && $data->confirmation_for == 1)
					{
						$insert_data['book_status']	  	 = 1;
						$insert_data['book_fixtype'] 	 = 0; 
						$insert_data['book_marginqty'] 	 = $booked_qty;
						$insert_data['book_confirmedon'] = $book_datetime;
						$return_data["confirm_type"] = 1;
					}
					else if ($phbook['request_type'] == 0 && $data->confirmation_for == 0)
					{
						$insert_data['book_status']	  	 = 3;
						$return_data["confirm_type"] 	 = 0;
					}
					else if($phbook['request_type'] == 0 && $data->confirmation_for == 2)
					{
						$insert_data['book_status']	  	 = 2;
						$insert_data['book_marginqty'] 	 = $booked_qty;
						$return_data["confirm_type"] 	 = 2;		
					}
					$insert_data['book_branchadmin'] 	= $this->get_userid();
					$insert_data['purity'] 				= $this->get_comm_details($phbook['book_comid']);
					$insert_data['book_branch'] 		= $phbook['book_branch'];
					$insert_data['book_bnkfixtype'] 	= empty($phbook['book_bnkfixtype']) ? 0 : $phbook['book_bnkfixtype'];
					$insert_data['book_ozvalue'] 		= empty($phbook['book_ozvalue']) ? 0 : $phbook['book_ozvalue'];
					//$insert_data['book_ozvalue'] 		= 0;
					$insert_data['book_ozfixtype'] 		= empty($phbook['book_ozfixtype']) ? 0 :$phbook['book_ozfixtype'];
					//$insert_data['book_ozfixtype'] 		= 0;
					if($phbook['book_ozfixtype'] == 0)
					{
						//$insert_data['dollar_fixedrate']= $phbook['book_ozvalue'];
						$insert_data['dollar_fixedrate']= 0;
					}
					else{
						//$insert_data['dollar_fixedrate']= '';
						$insert_data['dollar_fixedrate']= 0;
					}
					$insert_data['book_ozpremium'] 		= empty($phbook['book_ozpremium']) ? 0 : $phbook['book_ozpremium'];
					//$insert_data['book_ozpremium'] 		= 0;
					//$insert_data['book_bnkconv'] 		= $phbook['book_bnkconv'];
					$insert_data['book_bnkconv'] 		= 0;
					$insert_data['book_bnkinrval'] 		= empty($phbook['book_bnkinrval']) ? 0 : $phbook['book_bnkinrval'];
					//$insert_data['book_bnkinrval'] 		= 0;
					$insert_data['book_inrfixtype'] 	= empty($phbook['book_inrfixtype']) ? 0 : $phbook['book_inrfixtype'];
					//$insert_data['book_inrfixtype'] 	= 0;
					if($phbook['book_inrfixtype'] == 0)
					{
						//$insert_data['inr_fixedrate'] 	= $phbook['book_bnkinrval'];
						$insert_data['inr_fixedrate'] 	= 0;
					}
					else{
						//$insert_data['inr_fixedrate'] 	= '';
						$insert_data['inr_fixedrate'] 	= 0;
					}
					//$insert_data['book_bnktaxval'] 		= $phbook['book_bnktaxval'];
					$insert_data['book_bnktaxval'] 		= 0;
					//$insert_data['book_bnktaxtype'] 	= $phbook['book_bnktaxtype'];
					$insert_data['book_bnktaxtype'] 	= 0;
					$insert_data['book_bnkinrpre'] 		= empty($phbook['book_bnkinrpre']) ? 0 :$phbook['book_bnkinrpre'];
					//$insert_data['book_bnkinrpre'] 		= 0;
					$insert_data['book_bnkcustom'] 		= empty($phbook['book_bnkcustom']) ? 0 : $phbook['book_bnkcustom'];
					//$insert_data['book_bnkcustom'] 		= 0;
					//$insert_data['book_bnkpurity'] 		= $phbook['book_bnkpurity'];
					$insert_data['book_bnkpurity'] 		= 0;
					
					//$insert_data['book_bnkfixrate'] 	= $unfixbooking_rate;
					$insert_data['book_bnkfixrate'] 	= 0;
					//$insert_data['book_bnkfixtotrate'] 	= $unfixtotalcost;
					$insert_data['book_bnkfixtotrate'] 	= 0;
					
					$insert_data['book_ishedge'] 	= $this->get_customer_hedge($phbook['book_cusid']);
					$insertStatus = $this->db->insert("dt_booking", $insert_data);
					if($insertStatus == 1)
					{
						$return_data["book_no"] = $this->db->insert_id();
						$return_data["status"] 	= true;

						if($data->com_type == 0)
							$qty = ($booked_qty*1000)." Gms";
						else
							$qty = $booked_qty." Kg";

						if($phbook['book_type'] == 0)
							$order_type = "Buying request ";
						else
							$order_type = "Selling request ";
						
						if($data->confirmation_for == 1)
						{
							$message  = "Request No:" . $return_data["book_no"] . " - Your ".$order_type." for ".$qty." of ".$data->com_name." at Rs.".$booking_rate." is confirmed";
						}
						else if($data->confirmation_for == 0)
						{
							$message  = "Request No:" . $return_data["book_no"] . " - Your request is rejected. Please try again later.";
						}
						else if($data->confirmation_for == 2)
						{
							$message  = "Request No:" . $return_data["book_no"] . " - Your ".$order_type." for ".$qty." of ".$data->com_name." at Rs.".$booking_rate." is accepted, pending approval";
						}
						$return_data["message"]		= $message;
					}
					else
					{
						$return_data["message"]		= "Error occured in booking. Please try again later.";
					}

				}else {
					if($data->margin_amt  < $margin_hold){
						$return_data["message"]		= "Insufficient Margin";
					}else {
						$return_data["message"]		= "You reached maximum allocated qty";
					}
				}
			}
			/* else if($data->has_minqty == 1 ? ($booked_qty < $data->min_qty) : false)
			{
				$return_data["message"]		= "Less than minimum order qty (".$data->minqty_type.")";
			}
			else if($data->has_maxqty == 1 ? ($booked_qty > $data->max_qty) : false)
			{
				$return_data["message"]		= "You have reached max. qty for booking (".$data->maxqty_type.")";
			} */
			else if(($phbook['request_type'] == 1 ? ($data->pending_order+1) > $data->max_order : false))
			{
			
				$return_data["message"]		= "You have reached maximum no. of limits.";
			}
			else
			{
				$return_data["message"]		= "Error occured in booking.Please try again later.";
			}
		}
		else
		{
			$return_data["message"]		= "Booking failed. Please try again later.";
		}

		return $return_data;
	}
	function get_available_qty($phbook)
	{
		$reversedmargin_amt = 0;
		$reversedmargin_qty = 0; 
		$record['pending_order'] = 0;
		$resultset = $this->db->query("SELECT com_margin_type as margin_type, com_margin_value as margin,
									   ifnull(sum( if(`trans_actype` = 1, -1, 1) * ifnull(trans_amount,0) ),0) as Balance 
									   FROM dt_com_master, dt_transaction 
									   WHERE com_id = '".$phbook['book_comid']."' AND trans_payment_type = 0 AND trans_cuscode = '".$phbook['book_cusid']."'  AND trans_margin_type != 3");
		foreach($resultset->result() as $row)
		{
			$record['margin'] 	   = $row->margin;
			$record['margin_type'] = $row->margin_type;
			$record['margin_amt']  = $row->Balance;
		}

		$resultset = $this->db->query("Select ifnull(cus_com_openqty,0) as cus_com_openqty,
										ifnull(cus_com_openqtytype,0) as cus_com_openqtytype,cus_com_smoq,cus_com_pmoq,cus_com_status_sell,
										cus_com_status_buy
										From dt_cus_commodity 
										where cus_com_cus_id='".$phbook['book_cusid']."' and cus_com_id = '".$phbook['book_comid']."'");
		foreach($resultset->result() as $row)
		{
			$record['open_margin']      = $row->cus_com_openqty;
			$record['open_margintype']  = $row->cus_com_openqtytype;
			$record['cus_com_pmoq'] 	= $row->cus_com_pmoq;
			$record['cus_com_smoq']		= $row->cus_com_smoq;
			$record['cus_com_status_buy'] = $row->cus_com_status_buy;
			$record['cus_com_status_sell'] = $row->cus_com_status_sell;
		}

		$has_gmaxqty    	= 0;
		$gold_max_qty 		= 0;
		$has_gminqty 		= 0;
		$gold_min_qty   	= 0;
		$has_smaxqty 		= 0;
		$silver_max_qty 	= 0;
		$has_sminqty 		= 0;
		$silver_min_qty 	= 0;
		$has_gallot_qty 	= 0;
		$gold_allot_qty 	= 0;
		$has_sallot_qty 	= 0;
		$silver_allot_qty 	= 0;

		$generaldata = $this->db->query("SELECT 
		IF(cus.has_gmaxqty = 1 OR grl.has_gmaxqty = 1, 1,0) AS has_gmaxqty, 
		IF(cus.has_gmaxqty = 1 , cus.gold_max_qty, IF(grl.has_gmaxqty = 1 , grl.gold_max_qty, 0)) AS gold_max_qty,
		IF(cus.has_gminqty = 1 OR grl.has_gminqty = 1, 1,0) AS has_gminqty, 
		IF(cus.has_gminqty = 1 , cus.gold_min_qty, IF(grl.has_gminqty = 1 , grl.gold_min_qty, 0)) AS gold_min_qty,
		IF(cus.has_smaxqty = 1 OR grl.has_smaxqty = 1, 1,0) AS has_smaxqty, 
		IF(cus.has_smaxqty = 1 , cus.silver_max_qty, IF(grl.has_smaxqty = 1 , grl.silver_max_qty, 0)) AS silver_max_qty,
		IF(cus.has_sminqty = 1 OR grl.has_sminqty = 1, 1,0) AS has_sminqty, 
		IF(cus.has_sminqty = 1 , cus.silver_min_qty, IF(grl.has_sminqty = 1 , grl.silver_min_qty, 0)) AS silver_min_qty,
		IF(cus.has_gallot_qty = 1 OR grl.has_gallot_qty = 1, 1,0) AS has_gallot_qty, 
		IF(cus.has_gallot_qty = 1 , cus.gold_allot_qty, IF(grl.has_gallot_qty = 1 , grl.gold_allot_qty, 0)) AS gold_allot_qty,
		IF(cus.has_sallot_qty = 1 OR grl.has_sallot_qty = 1, 1,0) AS has_sallot_qty, 
		IF(cus.has_sallot_qty = 1 , cus.silver_allot_qty, IF(grl.has_sallot_qty = 1 , grl.silver_allot_qty, 0)) AS silver_allot_qty,
		IFNULL(max_order,0) AS max_order, grl.confirmation_for AS confirmation_for, grl.confirmation_admin AS confirmation_admin, grl.trade_enable, cus.cus_mobile, grl.margin_reverse_type, grl.display_margin FROM dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = '".$phbook['book_cusid']."'");

		foreach($generaldata->result() as $row)
		{
			$has_gmaxqty    		 		= $row->has_gmaxqty;
			$gold_max_qty 					= $row->gold_max_qty;
			$has_gminqty 					= $row->has_gminqty;
			$gold_min_qty    	 			= $row->gold_min_qty;
			$has_smaxqty 					= $row->has_smaxqty;
			$silver_max_qty 				= $row->silver_max_qty;
			$has_sminqty 					= $row->has_sminqty;
			$silver_min_qty 				= $row->silver_min_qty;
			$has_gallot_qty 				= $row->has_gallot_qty;
			$gold_allot_qty 				= $row->gold_allot_qty;
			$has_sallot_qty 				= $row->has_sallot_qty;
			$silver_allot_qty 				= $row->silver_allot_qty;
			$record['confirmation_admin'] 	= $row->confirmation_admin;
			$record['confirmation_for']   	= $row->confirmation_for;
			$record['trade_enable'] 		= $row->trade_enable;
			$record['max_order']   			= $row->max_order;
			$record['cus_mobile']   		= $row->cus_mobile;
			$record['margin_reverse_type']  = $row->margin_reverse_type;
			$record['display_margin']  		= $row->display_margin;
		}

		//getting maximum qty of commodity
		$qGetMax = $this->db->query("SELECT 
		IF(rcom_comtype = 0, ".$has_gmaxqty.", ".$has_smaxqty.") AS has_maxqty,
		IF(rcom_comtype = 0, ".$gold_max_qty.", ".$silver_max_qty.") AS max_qty,			
		IF(rcom_comtype = 0, ".$has_gminqty.", ".$has_sminqty.") AS has_minqty,
		IF(rcom_comtype = 0, ".$gold_min_qty.", ".$silver_min_qty.") AS min_qty,
		IF(rcom_comtype = 0, ".$has_gallot_qty.", ".$has_sallot_qty.") AS has_allot_qty,
		IF(rcom_comtype = 0, ".$gold_allot_qty.", ".$silver_allot_qty.") AS max_allot_qty, 
		rcom_comtype AS com_type, com.com_bar_quantity, com.com_weight, com.com_name FROM dt_com_master AS com
		LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
		WHERE com_id = '".$phbook['book_comid']."'");
		foreach($qGetMax->result() as $row)
		{
			$record['has_maxqty']   	= $row->has_maxqty;
			$record['max_qty']      	= $row->max_qty+0;
			$record['has_minqty']   	= $row->has_minqty;
			$record['min_qty']      	= $row->min_qty+0;
			$record['has_allot_qty']   	= $row->has_allot_qty;
			$record['max_allot_qty']    = $row->max_allot_qty+0;
			$record['maxqty_type']  	= $row->com_type == 1 ? ($row->max_qty+0)." Kg" : (($row->max_qty*1000)+0)." Gms";
			$record['minqty_type']  	= $row->com_type == 1 ? ($row->min_qty+0)." Kg" : (($row->min_qty*1000)+0)." Gms";
			$record['maxallotqty_type'] = $row->com_type == 1 ? ($row->max_allot_qty+0)." Kg" : (($row->max_allot_qty*1000)+0)." Gms";
			$record['com_bar_qty']	 	= $row->com_bar_quantity;
			$record['com_type']   		= $row->com_type;
			$record['com_weight']   	= $row->com_weight;
			$record['com_name']   		= $row->com_name;
		}
		//getting total open qty of commodity
		$qTotalQty = $this->db->query("SELECT (SUM(book_qty)-ifnull(SUM(del_qty.deliveredqty),0)) AS total_open_qty
								   FROM dt_booking 
								   LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty 
								   FROM dt_customerdelivery GROUP BY cusdel_bookno) AS del_qty ON del_qty.cusdel_bookno = book_no 
								   LEFT JOIN dt_com_master ON com_id = book_comid 
								   LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
								   WHERE (IF(ordertype =0,(book_status =1 or book_status = 2),true))  AND  (ifnull(book_qty,0)-ifnull(del_qty.deliveredqty,0) != 0) AND
								   (IF(ordertype =1,(orderstatus =0 or book_status =1 or book_status = 2),true)) AND IFNULL(delete_status,0) = 0 AND book_cusid = '".$phbook['book_cusid']."' AND (if(rcom_comtype = 1,1,0) = (SELECT if(rcom_comtype = 1,1,0) AS com_type FROM dt_com_master LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type WHERE com_id = '".$phbook['book_comid']."')) AND book_type = ".$phbook['book_type']);
		foreach($qTotalQty->result() as $row)
		{
			$record['total_open_qty']      = $row->total_open_qty;
		}
		//getting no of pending limits
		$qNoLimit = $this->db->query("SELECT COUNT(book_no) AS pending_order FROM dt_booking WHERE ordertype = 1 AND orderstatus = 0 AND book_cusid = '".$phbook['book_cusid']."'");
		foreach($qNoLimit->result() as $row)
		{
			$record['pending_order']      = $row->pending_order;
		}
		return json_encode($record);
	}
	function getphonebooklist() {
		$query = $this->db->query("SELECT book_cusid as bookcusid, book_no as bookno,
						date_format(book_datetime,'%d-%m-%Y %h:%i:%s %p') as bookdate,
						book_comid as comcode,if(rcom_comtype= 1,1,0) as com_type,
						if(book_type=0,'Sell','Buy') as book_type,book_rate,
						cus_name as customername,cus_mobile,
						REPLACE(com_name,'`','') as commodityname,
						if(ordertype = 0 ,book_status,orderstatus) as book_status,
						TRIM(book_qty*1000)+0 as bookqty,cus_id as cuscode,
						round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
						(book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty, 
						ifnull(del_qty.invoice_bookno,0) as del_bookno, 
						round((book_totalcost / (book_qty * 1000)) * ((book_qty * 1000) - ifnull((del_qty.deliveredqty * 1000),0)),2) as BalanceAmount,
						ordertype,
						cus_alise_name,
						ifnull(cus_city,'-') AS cus_city,book_by,
						if(order_actualprice = 0, '-', order_actualprice) AS order_actualprice,if(order_liveprice = 0, '-', order_liveprice) AS order_liveprice,
						if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 'Delivered', if(book_status = 2, 'Waiting for approval', if(book_status = 3, 'Rejected', if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 'Approved',if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 'Limit Canceled', if(book_status = 0, 'In Process', 'Partial Del')))))) as status,branch.branch_name as branch_name,book_type
						From dt_booking
						Left Join dt_customer on cus_id = book_cusid
						Left join dt_com_master on com_id = book_comid
						LEFT JOIN dt_comp_branch AS branch ON branch.branch_code = book_branch
						LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
						LEFT JOIN (SELECT invoice_bookno, IFNULL( SUM( invoice_deliveryqty ) , 0 ) AS deliveredqty, IFNULL( DATE_FORMAT( cusdel_date, '%d-%m-%Y %H:%i:%s' ),'-') AS deliverydate
						FROM dt_customer_deliveryinvoice
						LEFT JOIN dt_customerdelivery ON cusdel_code = delivery_code
						GROUP BY invoice_bookno) AS del_qty on del_qty.invoice_bookno = book_no
						WHERE book_status = 1 AND IFNULL(delete_status,0) = 0 AND DATE(book_datetime) = CURDATE() AND IFNULL(is_unfix,0) != 1
					    ORDER BY 
					  	book_confirmedon
					    DESC");
		return $returndata = $query->result_array();
		
	}
	function update_hedgelot($data){
		if($this->db->update('dt_generalsettings', array('gold_hedge_lot_qty' => $data['gold_hedge_lot_qty'],'silver_hedge_lot_qty' => $data['silver_hedge_lot_qty']))){
			$returndata = array('status' => 1, 'error' => 'Updated Successfully');	
		} else {
			$returndata = array('status' => 0, 'error' => 'Error occured, Please try again');	
		}
		return $returndata;
    }
	function delete_booking($id)
	{
		$tradeObj = new Trading();
		$book_nos = array();
		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		if($cancel_ratealert_url != '' && $client != '')
		{
			$oDetails = $tradeObj->get_orderdetails($id)->result_array();

			$this->db->query("delete from dt_customer_deliveryinvoice where invoice_bookno='".$id."'");
			$this->db->query("delete from dt_customerdelivery where cusdel_bookno='".$id."'");
			$this->db->query("delete from dt_booking where book_no='".$id."'");
			//echo "delete from dt_booking where book_no='".$id."'";exit;
			if($oDetails[0]['ordertype'] == 1 && $oDetails[0]['orderstatus'] == 0)
			{
				array_push($book_nos,$id);
			}

			if(count($book_nos) > 0)
			{
				$requestdata = array('client'  => $client,
								 'book_no' => $book_nos
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
		}
	}
	function delete_hedging($id)
	{
		$this->db->query("delete from dt_mt5_hedgedata where hedgid='".$id."'");
		
	}
}