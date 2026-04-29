<?php
class M_mobiletrade extends CI_Model {

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
		$module_name = 'Mobile Trade';
		$log_type = 'Mobile Trade';
		
		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}
		
		return log_admin_add($log_type, $module_name, $data, $description);
	}
	
	public function log_edit($old_data = array(), $new_data = array(), $description = '')
	{
		$module_name = 'Mobile Trade';
		$log_type = 'Mobile Trade';
		
		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}
		
		return log_admin_edit($log_type, $module_name, $old_data, $new_data, $description);
	}
	
	public function log_delete($data = array(), $description = '')
	{
		$module_name = 'Mobile Trade';
		$log_type = 'Mobile Trade';
		
		if (empty($description)) {
			$description = 'Deleted record from ' . $module_name;
		}
		
		return log_admin_delete($log_type, $module_name, $data, $description);
	}
	
	function gettradecommodities($userid) 
	{
		 $client	 =  trim(isset(Globals::$client) ? Globals::$client : '');

		$available_balance = $this->get_availablebalance($userid);

		$settingQ = $this->db->query("SELECT gold_tol, silver_tol, trade_enable, display_margin, has_pendinglimits, trade_on, trade_on_time, trade_off, trade_off_time,limit_enable,clientlimit_enable FROM dt_generalsettings");
		$setting_data = $settingQ->row();
		$gold_tol = explode("#",$setting_data->gold_tol);
		$silver_tol = explode("#",$setting_data->silver_tol);
		$market_on = $setting_data->trade_on == 1 &&  $setting_data->trade_on_time != "" ? "Market On : ".date("g:i A", strtotime($setting_data->trade_on_time)) : "";
		$market_off = $setting_data->trade_off == 1 &&  $setting_data->trade_off_time != "" ? "Market Off : ".date("g:i A", strtotime($setting_data->trade_off_time)) : "";

		$settings = array('goldhigh_tol' => isset($gold_tol[0]) ? $gold_tol[0] : 0 ,'goldlow_tol' => isset($gold_tol[1]) ? $gold_tol[1] : 0, 'silverhigh_tol' => isset($silver_tol[0]) ? $silver_tol[1] : 0, 'silverlow_tol' => isset($silver_tol[1]) ? $silver_tol[1] : 0, 'trade_enable' => $setting_data->trade_enable, 'display_margin' => $setting_data->display_margin, 'has_pendinglimits' => $setting_data->has_pendinglimits, 'market_on' => $market_on, 'market_off' => $market_off,'limit_enable' => $setting_data->limit_enable,'clientlimit_enable' => $setting_data->clientlimit_enable);
		$cussettingQ = $this->db->query("SELECT cus_limitenable FROM dt_customer WHERE cus_id = '" . $userid . "'");
		$cussetting_data = $cussettingQ->row();
		$cus_settings = array('cuslimit_enable' => $cussetting_data->cus_limitenable);
		
		$returndata 	= array();
		$comgrouparray  = array();
		$margin_array   = array();
		$trade_enable = 0;
		$gold_min_qty = 0;
		$gold_max_qty = 0;
		$silver_min_qty = 0;
		$silver_max_qty = 0;
		$has_minqty = 0;
		$has_maxqty = 0;

		$comgroupquery  = $this->db->query("SELECT comm.com_id as comid, 
										comm.com_name as comname, rcom_comtype as comtype, 
										com_weight as weight,com_unit, com_bar_quantity as barqty, com_margin_type, com_margin_value, 
										IFNULL(cus_com_openqty,0) as cus_com_openqty, IFNULL(com_sel_trade,0) as  com_sel_trade, IFNULL(com_buy_trade, 0) as com_buy_trade, 
										IFNULL(cus_com_openqtytype,0) as cus_com_openqtytype, 
										IFNULL(cus_com_smoq,0) as cus_com_smoq,IFNULL(cus_com_pmoq,0) as cus_com_pmoq, 
										IFNULL(cus_com_status_sell,0) as cus_com_status_sell, 
										IFNULL(cus_com_status_buy,0) as cus_com_status_buy, com_order_number, allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type,
										ifnull(prem_sel_premium, 0) as prem_sel_premium, ifnull(prem_buy_premium, 0) as prem_buy_premium, 
										ifnull(limit_sel_premium,0) as limit_sel_premium, ifnull(limit_buy_premium,0) as limit_buy_premium,
										prem_combuy_active, prem_comsell_active 
										FROM dt_customergroupitems cusgrp 
										LEFT JOIN dt_com_group_com comgrp ON comgrp.com_group_id = 1 
										LEFT JOIN dt_cus_commodity cuscom ON cuscom.cus_com_cus_id = cusgrp.cgitems_cusid 
										AND cuscom.cus_com_id  = comgrp.com_id 
										LEFT JOIN dt_com_master comm ON comm.com_id = comgrp.com_id 
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
										LEFT JOIN dt_prem_group_master as pgm ON  pgm.prem_group_id = cgitems_comgroupid 
										LEFT JOIN dt_prem_group_com as pgc ON pgc.prem_group_id = pgm.prem_group_id AND prem_id = cus_com_id 
										WHERE cgitems_cusid = '".$userid."' AND ((com_sel_active = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1  AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");

		if($comgroupquery->num_rows() >0) {
			//getting maximum qty of commodity
			$str_query = "select grl.trade_enable,
			IF(cus.has_gmaxqty = 1 or grl.has_gmaxqty, 1, 0) AS has_gmaxqty, 
			IF(cus.has_gmaxqty = 1, cus.gold_max_qty,(IF(grl.has_gmaxqty = 1, grl.gold_max_qty,0))) AS gold_max_qty,
			IF(cus.has_smaxqty = 1 or grl.has_smaxqty, 1, 0) AS has_smaxqty,
			IF(cus.has_smaxqty = 1, cus.silver_max_qty,(IF(grl.has_smaxqty = 1, grl.silver_max_qty,0))) AS silver_max_qty,
			IF(cus.has_gminqty = 1 or grl.has_gminqty, 1, 0) AS has_gminqty,
			IF(cus.has_gminqty = 1, cus.gold_min_qty,(IF(grl.has_gminqty = 1, grl.gold_min_qty,0))) AS gold_min_qty,
			IF(cus.has_sminqty = 1 or grl.has_sminqty, 1, 0) AS has_sminqty,
			IF(cus.has_sminqty = 1, cus.silver_min_qty,(IF(grl.has_sminqty = 1, grl.silver_min_qty,0))) AS silver_min_qty,
			IF(cus.has_gallot_qty = 1 or grl.has_gallot_qty, 1, 0) AS has_gallot_qty,
			IF(cus.has_gallot_qty = 1, cus.gold_allot_qty,(IF(grl.has_gallot_qty = 1, grl.gold_allot_qty,0))) AS gold_allot_qty,
			IF(cus.has_sallot_qty = 1 or grl.has_sallot_qty, 1, 0) AS has_sallot_qty,
			IF(cus.has_sallot_qty = 1, cus.silver_allot_qty,(IF(grl.has_sallot_qty = 1, grl.silver_allot_qty,0))) AS silver_allot_qty
			from dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = '".$userid."'";

			$resultset = $this->db->query($str_query);

			foreach($resultset->result() as $limit) {
				$has_gmaxqty  	= $limit->has_gmaxqty;
				$gold_max_qty  	= $limit->gold_max_qty;
				$has_smaxqty 	= $limit->has_smaxqty;
				$silver_max_qty = $limit->silver_max_qty;
				$has_gminqty 	= $limit->has_gminqty;
				$gold_min_qty 	= $limit->gold_min_qty;
				$has_sminqty 	= $limit->has_sminqty;
				$silver_min_qty = $limit->silver_min_qty;
				$has_gallot_qty = $limit->has_gallot_qty;
				$gold_allot_qty = $limit->gold_allot_qty;
				$has_sallot_qty 	= $limit->has_sallot_qty;
				$silver_allot_qty 	= $limit->silver_allot_qty;
			}

			foreach($comgroupquery->result() as $row) {
				$minmax = "";
				$min = "";
				$max = "";
				if($row->comtype == 1)
				{
					$cus_minQty = $silver_min_qty;
					$cus_maxQty = $silver_max_qty;
					$has_minqty = $has_sminqty;
					$has_maxqty = $has_smaxqty;
					$maxallotedqty = (float)($silver_allot_qty)." Kg";
					$has_allot_qty 	 = $has_sallot_qty;
					$min = $has_sminqty == 1 ? (float)($silver_min_qty)." Kg" : "";
					$max = $has_smaxqty == 1 ? (float)($silver_max_qty)." Kg" : "";
					$minmax 	= $has_sminqty == 1 ? $minmax.(" Min: ".(float)($silver_min_qty)." Kg") : $minmax;
					$minmax 	= $has_smaxqty == 1 ? $minmax.(" Max: ".(float)($silver_max_qty)." Kg") : $minmax;
				}
				else if($row->comtype == 0)
				{
					$cus_minQty = $gold_min_qty;
					$cus_maxQty = $gold_max_qty;
					$has_minqty = $has_gminqty;
					$has_maxqty = $has_gmaxqty;
					$maxallotedqty = (float)($gold_allot_qty*1000)." Gm";
					$has_allot_qty = $has_gallot_qty;
					$min = $has_gminqty == 1 ? (float)($gold_min_qty*1000)." Gm" : "";
					$max = $has_gmaxqty == 1 ? (float)($gold_max_qty*1000)." Gm" : "";
					$minmax 	= $has_gminqty == 1 ? $minmax.(" Min: ".(float)($gold_min_qty*1000)." Gm") : $minmax;
					$minmax 	= $has_gmaxqty == 1 ? $minmax.(" Max: ".(float)($gold_max_qty*1000)." Gm") : $minmax;
				}

				$comgrouparray[] = array('comid' => $row->comid, 'comname' => $row->comname, 'comtype' => $row->comtype, 'cus_com_openqty' => $row->cus_com_openqty, 'com_buy_trade' => $row->com_buy_trade, 'com_sel_trade' => $row->com_sel_trade, 'cus_com_openqtytype' => $row->cus_com_openqtytype, 'has_minqty' => $has_minqty, 'cus_minQty' => $cus_minQty, 'has_maxqty' => $has_maxqty, 'cus_maxQty' => $cus_maxQty, 'cus_com_status_sell' => $row->cus_com_status_sell, 'cus_com_status_buy' => $row->cus_com_status_buy, 'weight' => $row->weight, 'com_unit' => $row->com_unit, 'barqty' => $row->barqty, 'com_margin_type' => $row->com_margin_type, 'com_margin_value' => $row->com_margin_value, 'minmax' => $minmax,'min' => $min,'max' => $max, 'has_allot_qty' => $has_allot_qty, 'maxallotedqty' => $maxallotedqty, 'allowed_decimals' => $row->allowed_decimals, 'bar_selection' => $row->bar_selection, 'com_bar_no' => $row->com_bar_no, 'com_bar_type' => $row->com_bar_type, 'prem_sel_premium' => $row->prem_sel_premium, 'prem_buy_premium' => $row->prem_buy_premium, 'limit_sel_premium' => $row->limit_sel_premium, 'limit_buy_premium' => $row->limit_buy_premium, 'buy_active' => $row->prem_combuy_active, 'sell_active' => $row->prem_comsell_active);
			}

			$returndata = array('status' => 1, 'error' => $this->db->error(), 'success' => true, 'message' => 'Reterived Successfully', 'settings' => $settings,'cus_settings' => $cus_settings ,'comgroupData' => $comgrouparray,'client' => $client,'available_balance' => (float)$available_balance,'user_status' => 1);

		} else {
			$returndata = array('status' => 0, 'error' => 'No data found', 'success' => true, 'message' => 'No data found', 'settings' => $settings, 'cus_settings' => $cus_settings,'comgroupData' => $comgrouparray,'client' => $client,'available_balance' => (float)$available_balance,'user_status' => 1);
		}
		return $returndata; 
		
		
		// $resultset = $this->db->query("select * from dt_customer where cus_id ='".$userid."'");
		// if($resultset->num_rows() == 1)
		// {
		// 	foreach ($resultset->result() as $row)
		// 	{
		// 		//checking for whether the user status is active
		// 		if($row->cus_active==1) {
		// 			//checking for whether the user is a life time membet
		// 			if($row->cus_is_life_time==1 || date("Y-m-d") <= $row->cus_valid_till) {
						
						
		// 				$client	 =  trim(isset(Globals::$client) ? Globals::$client : '');

		// 				$available_balance = $this->get_availablebalance($userid);

		// 				$settingQ = $this->db->query("SELECT gold_tol, silver_tol, trade_enable, display_margin, has_pendinglimits, trade_on, trade_on_time, trade_off, trade_off_time FROM dt_generalsettings");
		// 				$setting_data = $settingQ->row();
		// 				$gold_tol = explode("#",$setting_data->gold_tol);
		// 				$silver_tol = explode("#",$setting_data->silver_tol);
		// 				$market_on = $setting_data->trade_on == 1 &&  $setting_data->trade_on_time != "" ? "Market On : ".date("g:i A", strtotime($setting_data->trade_on_time)) : "";
		// 				$market_off = $setting_data->trade_off == 1 &&  $setting_data->trade_off_time != "" ? "Market Off : ".date("g:i A", strtotime($setting_data->trade_off_time)) : "";

		// 				$settings = array('goldhigh_tol' => isset($gold_tol[0]) ? $gold_tol[0] : 0 ,'goldlow_tol' => isset($gold_tol[1]) ? $gold_tol[1] : 0, 'silverhigh_tol' => isset($silver_tol[0]) ? $silver_tol[0] : 0, 'silverlow_tol' => isset($silver_tol[1]) ? $silver_tol[1] : 0, 'trade_enable' => $setting_data->trade_enable, 'display_margin' => $setting_data->display_margin, 'has_pendinglimits' => $setting_data->has_pendinglimits, 'market_on' => $market_on, 'market_off' => $market_off);

		// 				$returndata 	= array();
		// 				$comgrouparray  = array();
		// 				$margin_array   = array();
		// 				$trade_enable = 0;
		// 				$gold_min_qty = 0;
		// 				$gold_max_qty = 0;
		// 				$silver_min_qty = 0;
		// 				$silver_max_qty = 0;
		// 				$has_minqty = 0;
		// 				$has_maxqty = 0;

		// 				$comgroupquery  = $this->db->query("SELECT comm.com_id as comid, comm.com_name as comname, rcom_comtype as comtype, 
		// 												   com_weight as weight,com_unit, com_bar_quantity as barqty, com_margin_type, com_margin_value,
		// 												   IFNULL(cus_com_openqty,0) as cus_com_openqty, IFNULL(com_sel_trade,0) as  com_sel_trade, IFNULL(com_buy_trade, 0) as com_buy_trade, 
		// 												   IFNULL(cus_com_openqtytype,0) as cus_com_openqtytype, 
		// 												   IFNULL(cus_com_smoq,0) as cus_com_smoq,IFNULL(cus_com_pmoq,0) as cus_com_pmoq, 
		// 												   IFNULL(cus_com_status_sell,0) as cus_com_status_sell, 
		// 												   IFNULL(cus_com_status_buy,0) as cus_com_status_buy, com_order_number, allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type
		// 												   FROM dt_customergroupitems cusgrp 
		// 												   LEFT JOIN dt_com_group_com comgrp ON comgrp.com_group_id = cusgrp.cgitems_comgroupid 
		// 												   LEFT JOIN dt_cus_commodity cuscom ON cuscom.cus_com_cus_id = cusgrp.cgitems_cusid 
		// 												   AND cuscom.cus_com_id  = comgrp.com_id 
		// 												   LEFT JOIN dt_com_master comm ON comm.com_id = comgrp.com_id
		// 												   LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
		// 												   WHERE cgitems_cusid = '".$userid."' AND ((com_sel_active = 1 AND IFNULL(com_sel_trade,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1 AND IFNULL(com_buy_trade,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");

		// 				if($comgroupquery->num_rows() >0) {
		// 					//getting maximum qty of commodity
		// 					$str_query = "select grl.trade_enable,
		// 					IF(cus.has_gmaxqty = 1 or grl.has_gmaxqty, 1, 0) AS has_gmaxqty, 
		// 					IF(cus.has_gmaxqty = 1, cus.gold_max_qty,(IF(grl.has_gmaxqty = 1, grl.gold_max_qty,0))) AS gold_max_qty,
		// 					IF(cus.has_smaxqty = 1 or grl.has_smaxqty, 1, 0) AS has_smaxqty,
		// 					IF(cus.has_smaxqty = 1, cus.silver_max_qty,(IF(grl.has_smaxqty = 1, grl.silver_max_qty,0))) AS silver_max_qty,
		// 					IF(cus.has_gminqty = 1 or grl.has_gminqty, 1, 0) AS has_gminqty,
		// 					IF(cus.has_gminqty = 1, cus.gold_min_qty,(IF(grl.has_gminqty = 1, grl.gold_min_qty,0))) AS gold_min_qty,
		// 					IF(cus.has_sminqty = 1 or grl.has_sminqty, 1, 0) AS has_sminqty,
		// 					IF(cus.has_sminqty = 1, cus.silver_min_qty,(IF(grl.has_sminqty = 1, grl.silver_min_qty,0))) AS silver_min_qty,
		// 					IF(cus.has_gallot_qty = 1 or grl.has_gallot_qty, 1, 0) AS has_gallot_qty,
		// 					IF(cus.has_gallot_qty = 1, cus.gold_allot_qty,(IF(grl.has_gallot_qty = 1, grl.gold_allot_qty,0))) AS gold_allot_qty,
		// 					IF(cus.has_sallot_qty = 1 or grl.has_sallot_qty, 1, 0) AS has_sallot_qty,
		// 					IF(cus.has_sallot_qty = 1, cus.silver_allot_qty,(IF(grl.has_sallot_qty = 1, grl.silver_allot_qty,0))) AS silver_allot_qty
		// 					from dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = '".$userid."'";

		// 					$resultset = $this->db->query($str_query);

		// 					foreach($resultset->result() as $limit) {
		// 						$has_gmaxqty  	= $limit->has_gmaxqty;
		// 						$gold_max_qty  	= $limit->gold_max_qty;
		// 						$has_smaxqty 	= $limit->has_smaxqty;
		// 						$silver_max_qty = $limit->silver_max_qty;
		// 						$has_gminqty 	= $limit->has_gminqty;
		// 						$gold_min_qty 	= $limit->gold_min_qty;
		// 						$has_sminqty 	= $limit->has_sminqty;
		// 						$silver_min_qty = $limit->silver_min_qty;
		// 						$has_gallot_qty = $limit->has_gallot_qty;
		// 						$gold_allot_qty = $limit->gold_allot_qty;
		// 						$has_sallot_qty 	= $limit->has_sallot_qty;
		// 						$silver_allot_qty 	= $limit->silver_allot_qty;
		// 					}

		// 					foreach($comgroupquery->result() as $row) {
		// 						$minmax = "";
		// 						$min = "";
		// 						$max = "";
		// 						if($row->comtype == 1)
		// 						{
		// 							$cus_minQty = $silver_min_qty;
		// 							$cus_maxQty = $silver_max_qty;
		// 							$has_minqty = $has_sminqty;
		// 							$has_maxqty = $has_smaxqty;
		// 							$maxallotedqty = (float)($silver_allot_qty)." Kg";
		// 							$has_allot_qty 	 = $has_sallot_qty;
		// 							$min = $has_sminqty == 1 ? (float)($silver_min_qty)." Kg" : "";
		// 							$max = $has_smaxqty == 1 ? (float)($silver_max_qty)." Kg" : "";
		// 							$minmax 	= $has_sminqty == 1 ? $minmax.(" Min: ".(float)($silver_min_qty)." Kg") : $minmax;
		// 							$minmax 	= $has_smaxqty == 1 ? $minmax.(" Max: ".(float)($silver_max_qty)." Kg") : $minmax;
		// 						}
		// 						else if($row->comtype == 0)
		// 						{
		// 							$cus_minQty = $gold_min_qty;
		// 							$cus_maxQty = $gold_max_qty;
		// 							$has_minqty = $has_gminqty;
		// 							$has_maxqty = $has_gmaxqty;
		// 							$maxallotedqty = (float)($gold_allot_qty*1000)." Gm";
		// 							$has_allot_qty = $has_gallot_qty;
		// 							$min = $has_gminqty == 1 ? (float)($gold_min_qty*1000)." Gm" : "";
		// 							$max = $has_gmaxqty == 1 ? (float)($gold_max_qty*1000)." Gm" : "";
		// 							$minmax 	= $has_gminqty == 1 ? $minmax.(" Min: ".(float)($gold_min_qty*1000)." Gm") : $minmax;
		// 							$minmax 	= $has_gmaxqty == 1 ? $minmax.(" Max: ".(float)($gold_max_qty*1000)." Gm") : $minmax;
		// 						}
		// 						if($row->bar_selection == 1){
									
		// 							$combarno = $row->com_bar_no;
		// 						}
		// 						else
		// 						{
									
		// 							$combarno = 0;
		// 						}
		// 						$comgrouparray[] = array('comid' => $row->comid, 'comname' => $row->comname, 'comtype' => $row->comtype, 'cus_com_openqty' => $row->cus_com_openqty, 'com_buy_trade' => $row->com_buy_trade, 'com_sel_trade' => $row->com_sel_trade, 'cus_com_openqtytype' => $row->cus_com_openqtytype, 'has_minqty' => $has_minqty, 'cus_minQty' => $cus_minQty, 'has_maxqty' => $has_maxqty, 'cus_maxQty' => $cus_maxQty, 'cus_com_status_sell' => $row->cus_com_status_sell, 'cus_com_status_buy' => $row->cus_com_status_buy, 'weight' => $row->weight, 'com_unit' => $row->com_unit, 'barqty' => $row->barqty, 'com_margin_type' => $row->com_margin_type, 'com_margin_value' => $row->com_margin_value, 'minmax' => $minmax,'min' => $min,'max' => $max, 'has_allot_qty' => $has_allot_qty, 'maxallotedqty' => $maxallotedqty, 'allowed_decimals' => $row->allowed_decimals, 'bar_selection' => $row->bar_selection, 'com_bar_no' => $combarno, 'com_bar_type' => $row->com_bar_type);
		// 					}

		// 					$returndata = array('status' => 1, 'error' => $this->db->error(), 'success' => true, 'message' => 'Reterived Successfully', 'settings' => $settings, 'comgroupData' => $comgrouparray,'client' => $client,'available_balance' => (float)$available_balance, 'user_status' => 1);

		// 				} else {
		// 					$returndata = array('status' => 0, 'error' => 'No data found', 'success' => true, 'message' => 'No data found', 'settings' => $settings, 'comgroupData' => $comgrouparray,'client' => $client,'available_balance' => (float)$available_balance, 'user_status' => 1);
		// 				}
		// 			}else{
		// 				$returndata = array('status' => 0, 'error' => '', 'success' => true, 'message' => 'Account Expired.Please contact administrator.', 'settings' => '', 'comgroupData' => '','client' => '','available_balance' => '', 'user_status' => 0);
		// 			}	
		// 		}else {
		// 			$returndata = array('status' => 0, 'error' => '', 'success' => true, 'message' => 'Your account not yet activated. Please try again later..', 'settings' => '', 'comgroupData' => '','client' => '','available_balance' => '', 'user_status' => 0);
		// 		}
		// 	}
		// }else {
		// 	$returndata = array('status' => 0, 'error' => '', 'success' => true, 'message' => 'Account Expired', 'settings' => '', 'comgroupData' => '','client' => '','available_balance' => '', 'user_status' => 0);
		// }
		
		// return $returndata;
	}
	public function get_entry_record($record_id) //Fetch entry record
	{
		//Build contents query
		$query="SELECT book_no, book_datetime, book_totalcost, book_qty, book_rate, book_no_bar, book_useripaddress FROM dt_booking WHERE book_no=".$record_id;
		$result_set=$this->db->query($query);

		foreach ($result_set->result() as $row)
		{
			$records['book_no']   			= $row->book_no;
			$records['book_datetime']   	= $row->book_datetime;
			$records['book_totalcost']   	= $row->book_totalcost;
			$records['book_qty']   			= $row->book_qty;
			$records['book_rate']  			= $row->book_rate;
			$records['book_no_bar']			= $row->book_no_bar;
			$records['book_useripaddress']	= $row->book_useripaddress;
			$records['db_error_msg']		= "";
		}
		return $records;
	}
	public function update_order($receivedata)
	{
		//Get previous old records to compare and update in log table
		$oldRecord = $this->get_entry_record($receivedata['book_no']);

		$return_data["status"]		= 0;
		$tradable = 0;
		$update_ratealert_url    =  trim(isset(Globals::$updateratealert) ? Globals::$updateratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		$rate_url                =  trim(isset(Globals::$getrates) ? Globals::$getrates : '');

		if($update_ratealert_url != '' && $rate_url != '' && $client != '')
		{
			$book_cusid = $receivedata['book_cusid'];
			$book_comid = $receivedata['book_comid'];
			$book_no 	= $receivedata['book_no'];
			$book_qty 	= $receivedata['book_qty'];
			$book_no_bar 	= $receivedata['book_no_bar'];

			$previousBookedQty 	= 0;	
			$booked_rate 		= 0;
			$book_type 			= "";

			$resultset = $this->db->query("SELECT book_qty, book_type, book_rate FROM dt_booking WHERE book_no = ".$book_no."  AND ordertype = 1 AND orderstatus = 0");
			foreach($resultset->result_array() as $row)
			{
				$previousBookedQty  =  $row['book_qty'];
				$book_type 			=  $row['book_type'];
				$booked_rate        =  $row['book_rate'];
			}

			$receivedata['book_type'] = $book_type;
			$receivedata['request_type'] = 1;

			$data = json_decode($this->get_available_qty($receivedata));
			$book_rate 		= $receivedata['book_rate'] ;
			$livePrice = 0;

			$rate_array = $this->get_ratearray($rate_url, $client);

			foreach($rate_array as $ratevalues)
			{
				if($ratevalues['com_id'] == $receivedata['book_comid'])
				{
					$tradable = isset($ratevalues['tradable']) ? 1 : 0;
					if($book_type == 0)
					{
						$livePrice = $ratevalues['selling_rate'];
					}
					else if($book_type == 1)
					{
						$livePrice = $ratevalues['buying_rate'];
					}
				}
			}

			$totalcost 		=  round(($book_rate / $data->com_weight) * $book_qty * 1000,2);
			
			$limitcancel_tol = $data->limitcancel_tol;

			if($tradable == 1 && $previousBookedQty > 0 && $livePrice > 0 && $totalcost > 0)
			{
				if($data->trade_enable == 1)
				{
					if($limitcancel_tol > 0 ? ($book_type == 0 ? ($book_rate > $booked_rate ? true : ($booked_rate+$limitcancel_tol) < $livePrice) : ($book_rate < $booked_rate ? true : ($booked_rate-$limitcancel_tol) > $livePrice)) : true)
					{
						if(($data->has_minqty == 1 ? ($book_qty >= $data->min_qty) : true) && ($data->has_maxqty == 1 ? ($book_qty <= $data->max_qty) : true) && ($data->has_allot_qty == 1 ? ($data->total_open_qty-$previousBookedQty+$book_qty <= $data->max_allot_qty) : true))
						{
							$update_data['book_datetime'] 		= date('Y-m-d H:i:s');
							$update_data['book_totalcost'] 		= $totalcost;
							$update_data['book_qty'] 			= $book_qty;
							$update_data['book_rate'] 			= $book_rate;
							$update_data['book_no_bar']	    	= $book_no_bar;
							$status = $this->db->update('dt_booking', $update_data, array("book_no" => $book_no,"book_status" => 0));
							if($status) {
								$requestdata = array('client' => $client,
														 'book_cusid' => $book_cusid,
														 'book_comid' => $book_comid, 
														 'book_type'  => $book_type,
														 'book_rate'  => $book_rate,
														 'book_qty'   => $book_qty,
														 'book_no'    => $book_no,
														 'alert_type' => 0
													);

								$field_string = http_build_query($requestdata);
								$ch = curl_init();
								curl_setopt($ch,CURLOPT_URL,$update_ratealert_url);
								curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
								curl_setopt($ch,CURLOPT_HEADER, false); 
								curl_setopt($ch, CURLOPT_POST, 1);
								curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
								$result = curl_exec($ch);
								curl_close($ch);
								//Update in Log
								$receivedata['log_totalcost'] = $totalcost;
								$this->updateLimitLog($oldRecord,$receivedata);
								$return_data["status"]		= 1;
								$return_data["message"]		= "Your limit has been updated";
							}else {
								$return_data["message"]		= "Update failed. Try again later";
							  }
						}
						else if($data->has_minqty == 1 ? ($book_qty < $data->min_qty) : false)
						{
							$return_data["message"]		= "Less than minimum order qty (".$data->minqty_type.")";
						}
						else if($data->has_maxqty == 1 ? ($book_qty > $data->max_qty) : false)
						{
							$return_data["message"]		= "Greater than maximum order qty (".$data->maxqty_type.")";
						}
						else if($data->has_maxqty == 1 ? ($data->total_open_qty-$previousBookedQty+$book_qty > $data->max_allot_qty) : false)
						{
							$return_data["message"]		= "You have reached max. qty for booking (".$data->maxallotqty_type.")";
						}
						else
						{
							$return_data["message"]		= "Error occured in booking.Please try again later.";
						}
					}
					else
					{
						$return_data["message"]		= "Order can not be cancelled or updated when Live price comes near to your Limit Order Price";
					}
				}
				else
				{
					$return_data["message"]		= "Currently trade has been disabled.Please try again later.";
				}
			}
			else
			{
				if($tradable == 0)
					$return_data["message"]		= "Error occured.No rate update.Please try again.";
				else
					$return_data["message"]		= "Error occured in updating your order.Please try again later.";
			}
		}
		else
		{
			$return_data["message"]		= "Error occured.Please contact administrator.";
		}
		
		return $return_data;
	}
	public function get_ratearray($rate_url, $client)
	{
		$requestdata = array('client' => $client);
		$field_string = http_build_query($requestdata);
		$ch = curl_init();
		curl_setopt($ch,CURLOPT_URL,$rate_url);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
		curl_setopt($ch,CURLOPT_HEADER, false); 
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
		$rate_json = curl_exec($ch);
		curl_close($ch);
		$rate_array = json_decode($rate_json, true);
		return $rate_array;
	}
	public function insert_record($receivedata)
	{
		$livePrice = 0;
		$tradable = 0;
		$cur_date = date('Y-m-d H:i:s');
		$return_data["status"]	=  0;

		$create_ratealert_url    =  trim(isset(Globals::$createratealert) ? Globals::$createratealert : '');
		$rate_url				 =  trim(isset(Globals::$getrates) ? Globals::$getrates : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		if($receivedata['request_type'] == 1 ? ($create_ratealert_url != '' && $rate_url != '' && $client != '') : $rate_url != '')
		{
			$rate_array = $this->get_ratearray($rate_url, $client);

			foreach($rate_array as $ratevalues)
			{
				if($ratevalues['com_id'] == $receivedata['book_comid'])
				{
					$tradable = isset($ratevalues['tradable']) ? 1 : 0;
					if($receivedata['book_type'] == 0)
					{
						$livePrice = $ratevalues['selling_rate']-$receivedata['discount'];
					}
					else if($receivedata['book_type'] == 1)
					{
						$livePrice = $ratevalues['buying_rate']-$receivedata['discount'];
					}
					else if($receivedata['book_type'] == 2)
					{
						$livePrice = $ratevalues['retail_rate']-$receivedata['discount'];
					}
				}
			}
			
			$data = json_decode($this->get_available_qty($receivedata));

			//$booking_rate 	=  $receivedata['request_type'] == 0 ? ($livePrice) : ($receivedata['book_rate']);
			$booking_rate = $receivedata['request_type'] == 0 ? ($receivedata['book_type'] == 0 ? ($receivedata['book_rate'] >= $livePrice ? $receivedata['book_rate'] : $livePrice) : ($receivedata['book_rate'] <= $livePrice ? $receivedata['book_rate'] : $livePrice)) : $receivedata['book_rate'];
			$com_type 		=  $data->com_type;
			$com_weight 	=  $data->com_weight;
			$booked_qty 	=  $receivedata['book_qty'];
			$book_bar_type  =  $receivedata['book_bar_type'];
			$totalcost 		=  round(($booking_rate / $com_weight) * $booked_qty * 1000,2);
			
			$has_margin = $data->display_margin == 1 && $receivedata['request_type'] == 0 && $data->confirmation_for == 1 ? true : false;

			//Margin calculation
			$margin_hold = 0;
			if($has_margin)
			{
				if($data->margin_type == 0)
					$margin_hold = $totalcost*$data->margin/100;
				else
					$margin_hold = $booked_qty*$data->margin;
			}

			if($tradable == 1 && $totalcost > 0 && $booked_qty > 0)
			{
				if($data->trade_enable == 1)
				{
					if(($data->has_minqty == 1 ? ($booked_qty >= $data->min_qty) : true) && ($data->has_maxqty == 1 ? ($booked_qty <= $data->max_qty) : true) && ($data->has_allot_qty == 1 ? ($data->total_open_qty+$booked_qty <= $data->max_allot_qty) : true) && ($receivedata['request_type'] == 1 ? ($data->pending_order+1 <=  $data->max_order) : true) && ($has_margin ? $data->available_balance >= $margin_hold : true))
					{
						$insert_data['book_cusid']	    = 	$receivedata['book_cusid'];
						$insert_data['book_datetime']	=	$cur_date;
						$insert_data['book_comid']	    = 	$receivedata['book_comid'];
						$insert_data['book_qty']		= 	$booked_qty;
						$insert_data['book_bar_type']	= 	$book_bar_type;
						$insert_data['book_rate']	  	= 	$booking_rate;
						$insert_data['order_actualprice'] 	= 	$booking_rate;
						$insert_data['book_liveprice'] 	= 	$livePrice;
						$insert_data['book_type']	  	= 	$receivedata['book_type'];
						$insert_data['book_deliverydate'] = date('Y-m-d', strtotime($receivedata['book_deliverydate']));
						$insert_data['book_totalcost']	= 	$totalcost;
						$insert_data['book_comweight']		= 	$com_weight;
						$insert_data['book_no_bar']	    	= 	$receivedata['book_no_bar'];
						$insert_data['book_comtype']	  	= 	$data->com_type;
						$insert_data['book_marginhold']		= 	$margin_hold;
						$insert_data['book_margin']			= 	$receivedata['margin'];
						$insert_data['book_margintype']		= 	$receivedata['margin_type'];
						$insert_data['book_status']	  		= 	0;
						$insert_data['book_marginstatus'] 	= 	0;
						$insert_data['book_hedgqty']		=	0;
						$insert_data['book_physicalqty']	= 	0;
						$insert_data['ordertype']			= 	$receivedata['request_type'];
						$insert_data['book_deviceid']		= 	isset($receivedata['book_deviceid']) ? $receivedata['book_deviceid'] : NULL;
						$insert_data['book_by']				=	1;
						$insert_data['book_usercomment']	= 	$receivedata['book_usercomment'];
						//$insert_data['book_premium']		=	$data->book_premium;
						$insert_data['user_agent']			=	isset($_SERVER ['HTTP_USER_AGENT']) ? $_SERVER ['HTTP_USER_AGENT'] : NULL;

						if($receivedata['request_type'] == 1) {
							//$insert_data['orderplacedtime'] = date('Y-m-d H:i:s');
							$insert_data['ordervalidity']	= 0;
							$insert_data['orderstatus']		= 0;
							$insert_data['book_status']	  	= 0;
						}
						else if($receivedata['request_type'] == 0 && $data->confirmation_for == 1)
						{
							$insert_data['book_status']	  	 = 1;
							$insert_data['book_fixtype'] 	 = 0; 
							$insert_data['book_marginqty'] 	 = $booked_qty;
							$insert_data['book_confirmedon'] = $cur_date;
							$return_data["confirm_type"] = 1;
						}
						else if ($receivedata['request_type'] == 0 && $data->confirmation_for == 0)
						{
							$insert_data['book_status']	  	 = 3;
							$insert_data['book_confirmedon'] = $cur_date;
							$return_data["confirm_type"] = 0;
						}
						else if($receivedata['request_type'] == 0 && $data->confirmation_for == 2)
						{
							$insert_data['book_status']	  	 = 2;
							$insert_data['book_confirmedon'] = $cur_date;
							$return_data["confirm_type"] = 2;		
						}

						$insert_data['book_margin_takenqty'] =	$receivedata['margintakenqty'];
						$insertStatus = $this->db->insert("dt_booking", $insert_data);
						if($insertStatus)
						{
							$return_data["status"]			 =  1;
							$return_data["book_no"] 		 = 	$this->db->insert_id();
							$return_data['book_qty']		 = 	$book_bar_type == 1 ? ($booked_qty+0)." Kg" : (($booked_qty*1000) + 0)." Gms";
							$return_data['book_rate']		 = 	$booking_rate;

							if($receivedata['request_type'] == 1) 
							{
								$requestdata = array('client' => $client,
														 'book_cusid' => $receivedata['book_cusid'],
														 'book_comid' => $receivedata['book_comid'], 
														 'book_type'  => $receivedata['book_type'],
														 'book_rate'  => ($booking_rate),
														 'book_qty'   => $booked_qty,
														 'book_no'    => $return_data["book_no"],
														 'alert_type' => 0,  //0->limit order, 1->rate alert
														 'device_id'  => '',
														 'mobile_no'  => $data->cus_mobile);

									$field_string = http_build_query($requestdata);
									$ch = curl_init();
									curl_setopt($ch,CURLOPT_URL,$create_ratealert_url);
									curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
									curl_setopt($ch,CURLOPT_HEADER, false); 
									curl_setopt($ch, CURLOPT_POST, 1);
									curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
									$result = curl_exec($ch);
									curl_close($ch);
							}
							
							// Add Margin amount in transaction table
							if($has_margin)
							{
								$trans_items['trans_cuscode'] 		= $receivedata['book_cusid'];
								$trans_items['trans_date'] 			= $cur_date;
								$trans_items['trans_code'] 			= $return_data["book_no"];
								$trans_items['trans_payment_type'] 	= 1;
								$trans_items['trans_amount'] 		= $margin_hold;
								$trans_items['trans_actype'] 		= 1;						
								$trans_items['trans_comments'] 		= "Margin deducted on booking";
								$trans_items['trans_comtype'] 		= $com_type;
								$trans_items['trans_margin_qty'] 	= $booked_qty;
								$trans_items['trans_book_code'] 	= $return_data["book_no"];
								$trans_items['trans_book_type'] 	= $receivedata['book_type'];
								$this->db->insert('dt_transaction', $trans_items);
								unset($trans_items);

								// Margin Reverse

								//Check margin reverse type is 0. (Type 0 : Margin Reverse on booking & delivery). On booking, check the book type on any possible reversal. Eg: If sell 100 gms already booked and current booking is 50 gms buy, 50 gms (lesser qty) of margin is reversed for sell and buy.
								if($data->margin_reverse_type == 0)
								{
									//select the booking with type(sell means select buy, buy means select sell and check for any possiblities of margin squareoff)
									$booktype = ($receivedata['book_type'] == 0 || $receivedata['book_type'] == 2) ? 1 : 0;
									
									$margin_bal = 0;
									
									if($receivedata['book_type'] == 1){
										$qMarbal = $this->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = ".$com_type." AND (trans_book_type = 0 OR trans_book_type = 2) AND trans_cuscode = ".$receivedata['book_cusid']." GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC");
									}else{
										$qMarbal = $this->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = ".$com_type." AND trans_book_type = ".$booktype." AND trans_cuscode = ".$receivedata['book_cusid']." GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC");
									}

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
										
										$trans_items['trans_cuscode'] 		= $receivedata['book_cusid'];
										$trans_items['trans_date'] 			= $cur_date;
										$trans_items['trans_code'] 			= $return_data["book_no"];
										$trans_items['trans_payment_type'] 	= 2;
										$trans_items['trans_amount'] 		= $margin_balamt;
										$trans_items['trans_actype'] 		= 0;						
										$trans_items['trans_comments'] 		= "Margin reversal on booking";
										$trans_items['trans_comtype'] 		= $com_type;
										$trans_items['trans_margin_qty'] 	= $margin_balqty;
										$trans_items['trans_book_code'] 	= $return_data["book_no"];
										$trans_items['trans_book_type'] 	= $receivedata['book_type'];
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

												$trans_items['trans_cuscode'] 		= $receivedata['book_cusid'];
												$trans_items['trans_date'] 			= $cur_date;
												$trans_items['trans_code'] 			= $rmar["book_no"];
												$trans_items['trans_payment_type'] 	= 2;
												$trans_items['trans_amount'] 		= $marginamt;
												$trans_items['trans_actype'] 		= 0;
												$trans_items['trans_comments'] 		= "Margin reversal on booking";
												$trans_items['trans_comtype'] 		= $com_type;
												$trans_items['trans_margin_qty'] 	= $marginqty;
												$trans_items['trans_book_code'] 	= $rmar["book_no"];
												$trans_items['trans_book_type'] 	= $booktype;
												$this->db->insert('dt_transaction', $trans_items);
												unset($trans_items);
											}
										}
									}
								}
							}
							//Update In Log
							$insert_data['book_no'] = $return_data["book_no"];
							$this->insertBookingLog($insert_data);
						}
						else
						{
							$return_data["message"]		= "Error occured in booking. Please try again later.";
						}
					}
					else if($has_margin ? $data->available_balance < $margin_hold : false)
					{
						$return_data["message"]		= "Available margin (Rs.".$data->available_balance.") less than required margin (Rs.".$margin_hold.")";
					}
					else if($data->has_minqty == 1 ? ($booked_qty < $data->min_qty) : false)
					{
						$return_data["message"]		= "Less than minimum order qty (".$data->minqty_type.")";
					}
					else if($data->has_maxqty == 1 ? ($booked_qty > $data->max_qty) : false)
					{
						$return_data["message"]		= "Greater than maximum order qty (".$data->maxqty_type.")";
					}
					else if($data->has_allot_qty == 1 ? ($data->total_open_qty+$booked_qty > $data->max_allot_qty) : false)
					{
						$return_data["message"]		= "You have reached max. qty for booking (".$data->maxallotqty_type.")";
					}
					else if($receivedata['request_type'] == 1 ? ($data->pending_order+1) > $data->max_order : false)
					{
						$return_data["message"]		= "You have reached maximum no. of limits (".$data->max_order.")";
					}
					else
					{
						$return_data["message"]		= "Error occured in booking.Please try again later.";
					}
				}
				else
				{
					$return_data["message"]	= "Currently trade has been disabled. Please try again later.";
				}
			}
			else
			{
				if($tradable == 0)
					$return_data["message"]	= "Booking failed. No rate updation. Please try again.";
				else
					$return_data["message"]	= "Booking failed. Please try again later.";
			}
		}
		else
		{
			$return_data["message"]		= "Error occured. Please contact administrator.";
		}
		return $return_data;
    }
	function get_available_qty($postdata)
	{
		$record['pending_order'] = 0;
		
		$resultset = $this->db->query("SELECT com_margin_type as margin_type, com_margin_value as margin FROM dt_com_master WHERE com_id = '".$postdata['book_comid']."'");
		foreach($resultset->result() as $row)
		{
			$record['margin'] 	   = $row->margin;
			$record['margin_type'] = $row->margin_type;
		}

		$record['available_balance']  = $this->get_availablebalance($postdata['book_cusid']);

		$resultset = $this->db->query("Select cus_com_smoq,cus_com_pmoq,
									  cus_com_status_sell, cus_com_status_buy
									  From dt_cus_commodity 
									  LEFT JOIN dt_customergroupitems ON cgitems_cusid = '".$postdata['book_cusid']."' 
									   where cus_com_cus_id='".$postdata['book_cusid']."' and  cus_com_id = '".$postdata['book_comid']."'");
		foreach($resultset->result() as $row)
		{
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
		$limitcancel_silvertol 	= 0;
		$limitcancel_goldtol 	= 0;

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
		IFNULL(max_order,0) AS max_order, grl.confirmation_for AS confirmation_for, grl.confirmation_admin AS confirmation_admin, grl.trade_enable, cus.cus_mobile, grl.margin_reverse_type, grl.display_margin, grl.limitcancel_silvertol,grl.limitcancel_goldtol FROM dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = '".$postdata['book_cusid']."'");

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
			$limitcancel_silvertol 			= $row->limitcancel_silvertol;
			$limitcancel_goldtol 			= $row->limitcancel_goldtol;
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
		IF(rcom_comtype = 0, ".$limitcancel_goldtol.", ".$limitcancel_silvertol.") AS limitcancel_tol, 
		rcom_comtype AS com_type, com.com_bar_quantity, com.com_weight, com.com_name FROM dt_com_master AS com
		LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
		WHERE com_id = '".$postdata['book_comid']."'");
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
			$record['limitcancel_tol']  = $row->limitcancel_tol;
		}
		//getting total open qty of commodity
		$qTotalQty = $this->db->query("SELECT (SUM(book_qty)-ifnull(SUM(del_qty.deliveredqty),0)) AS total_open_qty
									   FROM dt_booking 
									   LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty 
									   FROM dt_customerdelivery GROUP BY cusdel_bookno) AS del_qty ON del_qty.cusdel_bookno = book_no 
									   LEFT JOIN dt_com_master ON com_id = book_comid 
									   LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
									   WHERE (IF(ordertype =0,(book_status =1 or book_status = 2),true))  AND  (ifnull(book_qty,0)-ifnull(del_qty.deliveredqty,0) != 0) AND
									   (IF(ordertype =1,(orderstatus =0 or book_status =1 or book_status = 2),true)) AND IFNULL(delete_status,0) = 0 AND book_cusid = '".$postdata['book_cusid']."' AND (if(rcom_comtype = 1,1,0) = (SELECT if(rcom_comtype = 1,1,0) AS com_type FROM dt_com_master LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type WHERE com_id = '".$postdata['book_comid']."')) AND book_type = ".$postdata['book_type']);
		foreach($qTotalQty->result() as $row)
		{
			$record['total_open_qty']      = $row->total_open_qty;
		}
		//getting no of pending limits
		$qNoLimit = $this->db->query("SELECT COUNT(book_no) AS pending_order FROM dt_booking WHERE ordertype = 1 AND orderstatus = 0 AND book_cusid = '".$postdata['book_cusid']."'");
		foreach($qNoLimit->result() as $row)
		{
			$record['pending_order']      = $row->pending_order;
		}

		return json_encode($record);
	}
	function getbookingreport($cus_id, $from_date = "", $to_date = "", $comType = "") 
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
			$date = "AND DATE(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) BETWEEN '".$from_date."' AND '".$to_date."'";
		}
		else
		{
			$date = "";
		}

		$resultset = $this->db->query("SELECT
										book_no, 
										DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as book_datetime,
										com_name,
										if(rcom_comtype = 1,CONCAT(TRIM(book_qty)+0, ' (Kg)'), CONCAT(TRIM(book_qty*1000)+0, ' (Gm)')) as bookqty,(book_qty * 1000) as qty, if(book_type=1,'Sell','Buy') as type,
										if(rcom_comtype = 1, book_qty, book_qty * 1000) as unpaid_qty,
										TRIM(book_totalcost)+0 AS book_totalcost,
										if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 'Delivered', if(book_status = 2, 'Waiting for approval', if(book_status = 3, 'Rejected', if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 'Confirmed',if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 'Limit Cancelled', if(book_status = 0 and ifnull(orderstatus,0) = 0, 'Pending', (if(book_qty - ifnull(deliveredqty,0) > 0 and ifnull(deliveredqty,0) > 0, 'Partial Del' , if(ifnull(orderstatus,0) = 4, 'Expired', if(ifnull(orderstatus,0) = 5, 'Cancelled, Insufficient margin', '')))))))))) as status,
										if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 6, if(book_status = 2, 2, if(book_status = 3, 3, if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 1,if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 4, if(book_status = 0 and ifnull(orderstatus,0) = 0, 0, (if(book_qty - ifnull(deliveredqty,0) > 0 and ifnull(deliveredqty,0) > 0, 5 , if(ifnull(orderstatus,0) = 4, 7, if(ifnull(orderstatus,0) = 5, 8, '')))))))))) as bookstatus,
										if(rcom_comtype = 1,CONCAT(TRIM(del_qty.deliveredqty)+0, ' (Kg)'), CONCAT(TRIM(del_qty.deliveredqty*1000)+0, ' (Gm)')) as delivered_qty,
										if(rcom_comtype = 1,CONCAT(TRIM((book_qty - ifnull(del_qty.deliveredqty,0)))+0,' Kg'), CONCAT(TRIM((book_qty - ifnull(del_qty.deliveredqty,0))*1000)+0, ' Gm')) AS pending_qty, 
										ifnull(del_qty.deliverydate,'-') as deliverydate, TRIM( book_rate)+0 AS book_rate, ordertype, if(book_by = 3,'Admin', 'User') AS book_by, rcom_comtype as comtype,
										0 As show_details
										from dt_booking
										LEFT JOIN
										(SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty, ifnull(date_format(max(cusdel_date), '%d-%m-%Y %H:%i:%s'), '-') as deliverydate 
										from dt_customerdelivery where cusdel_cusname = '".$cus_id."' group by cusdel_bookno)
										as del_qty on del_qty.cusdel_bookno = book_no 										
										LEFT JOIN dt_com_master ON com_id = book_comid 
										LEFT JOIN dt_customer ON book_cusid = cus_id
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										WHERE ".$date_expire." book_cusid = '".$cus_id."' 
										".$date." order by IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime) DESC");

										$book_totalcost			=	0;
										$unpaid_qty				=	0;		
										$unpaid_amount			=	0;
										$qty					=	0;
										foreach ($resultset->result() as $row)
										{
											if($row->type == 'Buy')			
												$book_totalcost		+=	$row->book_totalcost;	
											else
												$book_totalcost		-=	$row->book_totalcost;	
											if($row->type == 'Buy')			
												$unpaid_qty			+=	$row->unpaid_qty;	
											else
												$unpaid_qty			-=	$row->unpaid_qty;	
											if($row->type == 'Buy')			
												$qty				+=	$row->qty;	
											else
												$qty				-=	$row->qty;
										}
										$userData['book_totalcost'] = $book_totalcost;
										$userData['unpaid_qty']		= $unpaid_qty;
										$userData['unpaid_amount']  = $unpaid_amount;
										$userData['qty']			= $qty;
										if($unpaid_qty > 0)
											$userData['book_no']			= " Totals(Buy):";
										else if($unpaid_qty > 0)
											$userData['book_no']			= " Totals(Sell):";
										else
											$userData['book_no']			= " Totals:";

										$records	=	array();
										$records[0]	=	$resultset;
										$records[1]	=	$userData;
		$returndata = array('bookingdata' => $resultset->result_array(), 'bookiingtotal' => $userData);

		return $returndata;
	}
	function getorderreport($cus_id, $from_date = "", $to_date = "", $comType = "") 
	{
		$returndata = array();

		if($from_date != "" && $to_date != "")
		{
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "AND DATE(book_datetime) BETWEEN '".$from_date."' AND '".$to_date."'";
		}
		else
		{
			$date = "";
		}
		
		$com_type = $comType == -1 || $comType == '' ? '' : ($comType == 0 ? (' rcom_comtype = 0 AND ') : (' rcom_comtype = 1 AND '));

		$resultset = $this->db->query("SELECT
										book_no, 
										DATE_FORMAT(book_datetime, '%d-%m-%Y %H:%i:%s') as book_datetime,
										com_name, 
										TRIM(round(if(rcom_comtype = 0 , (book_rate/book_comweight)*1, if(rcom_comtype = 1 , (book_rate/book_comweight)*1000, (book_rate/book_comweight))),2))+0 as ratepergram, 
										if(rcom_comtype = 1,CONCAT(TRIM(book_qty)+0, ' (kgs)'), CONCAT(TRIM(book_qty*1000)+0, ' (gms)')) as bookqty, (book_qty * 1000) as qty, if(book_type=1,'Sell','Buy') as type,
										if(rcom_comtype = 1, book_qty, book_qty * 1000) as unpaid_qty,
										TRIM(book_totalcost)+0 AS book_totalcost,
										round(((book_totalcost/book_qty) * (book_qty)),2) as physicalqtyamount,
										book_qty as physicalqty,
										'Pending' as status,
										0 as bookstatus,
										book_comid,
										TRIM(book_rate)+0 AS book_rate
										from dt_booking
										left join
										(select invoice_bookno,sum(invoice_deliveryqty) as delivered,sum(invoice_amount) as paid_amt
										 from dt_customer_deliveryinvoice where invoice_cuscode = '".$cus_id."' group by invoice_bookno)
										as paid_qty on paid_qty.invoice_bookno = book_no
										LEFT JOIN dt_com_master ON com_id = book_comid
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										LEFT JOIN dt_customer ON book_cusid = cus_id
										WHERE book_cusid = '".$cus_id."' AND book_status = 0 and orderstatus = 0
										".$date." order by book_no desc");

										$book_totalcost			=	0;	
										$unpaid_qty				=	0;		
										$unpaid_amount			=	0;
										$qty					=	0;
										foreach ($resultset->result() as $row)
										{		
													if($row->type == 'Buy')			
														$book_totalcost		+=	$row->book_totalcost;	
													else
														$book_totalcost		-=	$row->book_totalcost;	
													if($row->type == 'Buy')			
														$unpaid_qty			+=	$row->unpaid_qty;	
													else
														$unpaid_qty			-=	$row->unpaid_qty;
													if($row->type == 'Buy')			
														$qty				+=	$row->qty;	
													else
														$qty				-=	$row->qty;
										}		
										$userData['book_totalcost'] = $book_totalcost;
										$userData['unpaid_qty']		= $unpaid_qty;
										$userData['unpaid_amount']  = $unpaid_amount;
										$userData['qty']			= $qty;
										if($unpaid_qty > 0)
											$userData['book_no']			= " Totals(Buy):";
										else if($unpaid_qty > 0)
											$userData['book_no']			= " Totals(Sell):";
										else
											$userData['book_no']			= " Totals:";
											
										$records	=	array();
										$records[0]	=	$resultset;
										$records[1]	=	$userData;
		
		$returndata = array('bookingdata' => $resultset->result_array(), 'bookiingtotal' => $userData);
		
		return $returndata;
	}
	function getcustomerallopenorders($cus_id) {
		$returndata = array();
		$resultset = $this->db->query("SELECT book_no, date_format(book_datetime,'%d-%m-%Y %H:%i:%s') as book_datetime, 
										com_name, TRIM(book_rate)+0 AS book_rate, book_comweight,  book_no_bar, 
										round((book_rate/book_comweight),2) as ratepergram, book_status as bookstatus,  
										if(book_bar_type = 1,CONCAT(TRIM(book_qty)+0, ' (kgs)'), CONCAT(TRIM(book_qty*1000)+0, ' (gms)')) as qty, book_comid, book_type,
										if(book_type=1,'Sell','Buy') as type, if(book_bar_type = 1,TRIM(book_qty)+0, TRIM(book_qty*1000)+0) AS book_qty, 0 As show_details 
										FROM dt_booking
										LEFT JOIN dt_com_master ON com_id = book_comid
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										LEFT JOIN dt_customer ON book_cusid = cus_id
										WHERE book_cusid = '".$cus_id."'
										AND ordertype = 1 AND orderstatus = 0 order by book_no desc");

		$returndata = array('bookingdata' => $resultset->result_array(), 'message' => 'Success');
		return $returndata;
	}
	function customerordercancel($cusid, $book_no) {
		$return_data = array();
		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$rate_url                =  trim(isset(Globals::$getrates) ? Globals::$getrates : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		if($cancel_ratealert_url != '' && $rate_url != '' && $client != '')
		{
			$booked_rate = 0;
			$book_type   = "";
			$book_comid  = "";
			$book_cusid  = "";

			$resultset = $this->db->query("SELECT book_qty, book_type, book_rate, book_comid, book_cusid FROM dt_booking WHERE book_no = ".$book_no."  AND ordertype = 1 AND orderstatus = 0");
			foreach($resultset->result_array() as $row)
			{
				$booked_rate        =  $row['book_rate'];
				$book_type 			=  $row['book_type'];
				$book_comid 		=  $row['book_comid'];
				$book_cusid 		=  $row['book_cusid'];
			}

			$receivedata['book_cusid'] = $book_cusid;
			$receivedata['book_comid'] = $book_comid;
			$receivedata['book_type']  = $book_type;
			$receivedata['request_type']  = 1;
	
			$data = json_decode($this->get_available_qty($receivedata));

			$limitcancel_tol = $data->limitcancel_tol;

			$livePrice = 0;

			$rate_array = $this->get_ratearray($rate_url, $client);

			foreach($rate_array as $ratevalues)
			{
				if($ratevalues['com_id'] == $receivedata['book_comid'])
				{
					if($book_type == 0)
					{
						$livePrice = $ratevalues['selling_rate'];
					}
					else if($book_type == 1)
					{
						$livePrice = $ratevalues['buying_rate'];
					}
				}
			}
			if($booked_rate > 0 && $livePrice > 0)
			{
				if($limitcancel_tol > 0 ? ($book_type == 0 ? ($booked_rate+$limitcancel_tol < $livePrice) : ($booked_rate-$limitcancel_tol > $livePrice)) : true)
				{
					$status = $this->db->update('dt_booking', array("orderstatus" => 2), array("book_no" => $book_no, "orderstatus" => 0, "ordertype" => 1));
					if($status && $this->db->affected_rows() > 0) {
						$requestdata = array('client'  => $client,
											 'book_no' => array($book_no)
											);

						$field_string = http_build_query($requestdata);
						$ch = curl_init();
						curl_setopt($ch,CURLOPT_URL,$cancel_ratealert_url);
						curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
						curl_setopt($ch,CURLOPT_HEADER, false); 
						curl_setopt($ch, CURLOPT_POST, 1);
						curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string); 
						$result = curl_exec($ch);
						curl_close($ch);
						$return_data = array('status' => 1, 'book_no' => $book_no, 'message' => 'Your order has been cancelled');

						//Update in Log
						$log_update['book_no'] 		= $book_no;
						$log_update['book_cusid'] 	= $book_cusid;
						$this->cancelLimitLog($log_update);
					}else {
						$return_data = array('status' => 0, 'book_no' => $book_no, 'message' => 'Order cancellation failed. Please try again later.');
					}
				}
				else
				{
					$return_data = array('status' => 0, 'message' => 'Order can not be cancelled or updated when Live price comes near to your Limit Order Price');
				}
			}
			else
			{
				$return_data = array('status' => 0, 'message' => 'Error occured.Please try again.');
			}
		}
		else
		{
			$return_data = array('status' => 0, 'book_no' => $book_no, 'message' => 'Error occured.Please contact administrator.');
		}
		return $return_data;
	} 
	function gettradestaus($cus_id)
	{
		$returndata = array();

		$str_query = "SELECT IF(cus.has_gminqty = 1, CONCAT(TRIM(cus.gold_min_qty*1000)+0, ' Gm'), IF(grl.has_gminqty = 1, CONCAT(TRIM(grl.gold_min_qty*1000)+0, ' Gm'), '-')) AS gold_min_qty, IF(cus.has_sminqty = 1, CONCAT(TRIM(cus.silver_min_qty)+0, ' kg'), IF(grl.has_sminqty = 1, CONCAT(TRIM(grl.silver_min_qty)+0, ' Kg'), '-')) AS silver_min_qty,
		IF(cus.has_gmaxqty = 1, CONCAT(TRIM(cus.gold_max_qty*1000)+0, ' Gm'), IF(grl.has_gmaxqty = 1, CONCAT(TRIM(grl.gold_max_qty*1000)+0, ' Gm'), '-')) AS gold_max_qty, IF(cus.has_smaxqty = 1, CONCAT(TRIM(cus.silver_max_qty)+0, ' kg'), IF(grl.has_smaxqty = 1, CONCAT(TRIM(grl.silver_max_qty)+0, ' Kg'), '-')) AS silver_max_qty, 
		IF(cus.has_gallot_qty = 1, CONCAT(TRIM(cus.gold_allot_qty*1000)+0, ' Gm'), IF(grl.has_gallot_qty = 1, CONCAT(TRIM(grl.gold_allot_qty*1000)+0, ' Gm'), '-')) AS gold_allot_qty,
		IF(cus.has_sallot_qty = 1, CONCAT(TRIM(cus.silver_allot_qty)+0, ' kg'), IF(grl.has_sallot_qty = 1, CONCAT(TRIM(grl.silver_allot_qty)+0, ' Kg'), '-')) AS silver_allot_qty FROM dt_customer AS cus, dt_generalsettings AS grl WHERE cus_id = '".$cus_id."'";

		$resultset = $this->db->query($str_query);
		foreach($resultset->result() as $row) {
			$returndata[] = array('comname' => "Gold", 'minimumqty' => $row->gold_min_qty, 'maxqty' => $row->gold_max_qty, 'allot_qty' => $row->gold_allot_qty);
			$returndata[] = array('comname' => "Silver", 'minimumqty' => $row->silver_min_qty, 'maxqty' => $row->silver_max_qty, 'allot_qty' => $row->silver_allot_qty);
		}
		return $returndata;
	}
	function changePassword($psdata) {
		$returndata = array();
		
		$this->db->select('cus_id, cus_email, cus_name, cus_login_name');
		$this->db->where(array('cus_id' => $psdata['userid'], 'cus_login_password' => $psdata['oldpassword']));
		$query = $this->db->get($this->sec_table_name);
		if($query->num_rows() == 1)
		{
			$this->db->where('cus_id', $psdata['userid']);
			if($this->db->update($this->sec_table_name, array('cus_login_password' => $psdata['confirmpassword']))){
				$returndata = array('status' => 1, 'error' => '', 'email' =>  $query->row()->cus_email, 'name' =>  $query->row()->cus_name, 'cus_login_name' => $query->row()->cus_login_name);	
			} else {
				$returndata = array('status' => 0, 'error' => 'Password update failed, Please try again');	
			}
		} else {
			$returndata = array('status' => 0, 'error' => 'Please enter the valid details');
		}
		return $returndata;
	}
	function check_currentuser_session($username,$imiecode,$uuid) {
		$data = array();
		$query	= $this->db->query("SELECT * FROM dt_customer where cus_login_name = '".$username."' AND cus_imiecode = '".$imiecode."' AND cus_uuid='".$uuid."'");
		if($query->num_rows() == 1){
			$data  = array('operationresult' => 1,'message' => "");
		}else {
			$data = array('operationresult' => 0,'message' => "Some one logged in with your credentials in another device");
		}
		
		return $data;
	}

    function get_EmailContent($service_id, $book_no) {
		//Declaration of variables
		$email_content ="";
		$email_status = 0;
		$email_id = 1; //Send SMS		
		$email_signature = "";
		$customer_data = array();
		//Retriving EMail service for registration confirmation
		$resultset = $this->db->query("SELECT serv_email FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$email_status = $row->serv_email;
		}
		$resultset->free_result();
		//Checking EMail service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if($email_status == 1) {
			$resultset = $this->db->query("SELECT
										bk.book_no,cus_name as book_cusid,
										DATE_FORMAT(bk.book_datetime,'%d-%m-%Y %h:%i:%s %p') as book_datetime,
										REPLACE(com_name,'`','')  as book_comid,if(book_type=1,'Sell','Buy') as book_type,
										if(book_bar_type = 1, CONCAT(TRIM(book_qty)+0,' Kg'), CONCAT(TRIM(book_qty*1000)+0,' gms')) AS book_qty, bk.book_rate,
										DATE_FORMAT(bk.book_confirmedon,'%d-%m-%Y %h:%i:%s %p') as book_confirmedon,
										if(bk.book_status=0,'Request',
										if(bk.book_status=1,'Confirmed',
										if(bk.book_status=2,'Progress',
										if(bk.book_status=3,'Rejected',
										if(bk.book_status=4,'Delivered',
										''))))) as book_status,
										bk.book_no_bar,
										bk.book_comweight,
										bk.book_totalcost,
										cus_email, (select admin_company_name from dt_generalsettings) as admin_company_name
										FROM dt_booking bk
										left join dt_customer on cus_id=bk.book_cusid
										left join dt_com_master on com_id=bk.book_comid
										left join dt_rpanelcommodities on com_type = rcom_id
										where book_no = '".$book_no."'");
										
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			$return_data["email_id"] = 	$customer_data->cus_email;		
			//Retriving message content
			$resultset = $this->db->query("SELECT email_content, email_signature from dt_email_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$email_content = $row->email_content;
				$email_signature = $row->email_signature;
			}
			$resultset->free_result();
			//Generating Message content
			$field_name = explode('@@', $email_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) {
				if(isset($customer_data->{$field_name[$i]})) { 
					$email_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$email_content);					
				}	
			}
			$field_name_sig = explode('@@', $email_signature);	
			for($i=1; $i < count($field_name_sig); $i+=2) {
				if(isset($customer_data->{$field_name_sig[$i]})) { 
					$email_signature = str_replace("@@".$field_name_sig[$i]."@@",$customer_data->{$field_name_sig[$i]},$email_signature);					
				}	
			}
			$return_data["email_subject"] = $email_signature;	
			$return_data["email_content"] = $email_content;
		}
		//Returning generated EMail Content
		return isset($return_data)?$return_data:'';
	}

    function get_SMSURL($service_id, $book_no) {
		//Declaration of variables
		$sms_url ="";
		$sms_status = 0;
		$sms_authkey  ="";
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$customer_data = array();
		//Retriving SMS service for registration confirmation
		$resultset = $this->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if($sms_status == 1) 
		{
			$resultset=$this->db->query("SELECT
										bk.book_no,cus_name as book_cusid,
										DATE_FORMAT(bk.book_datetime,'%d-%m-%Y %h:%i:%s %p') as book_datetime,
										REPLACE(com_name,'`','')  as book_comid,if(book_type=1,'Sell','Buy') as book_type,
										if(book_bar_type = 1, CONCAT(TRIM(book_qty)+0,' Kg'), CONCAT(TRIM(book_qty*1000)+0,' gms')) AS book_qty, bk.book_rate,
										DATE_FORMAT(bk.book_confirmedon,'%d-%m-%Y %h:%i:%s %p') as book_confirmedon,
										if(bk.book_status=0,'Request',
										if(bk.book_status=1,'Confirmed',
										if(bk.book_status=2,'Hold',
										if(bk.book_status=3,'Rejected',
										if(bk.book_status=4,'Delivered',
										''))))) as book_status,
										bk.book_no_bar,
										bk.book_comweight,
										bk.book_totalcost,
										cus_mobile, (select admin_company_name from dt_generalsettings) as admin_company_name
										FROM dt_booking bk
										left join dt_customer on cus_id=bk.book_cusid
										left join dt_com_master on com_id=bk.book_comid
										left join dt_rpanelcommodities on rcom_id = com_type
										where book_no = '".$book_no."'");
			
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile);
			//Retriving message content
			$resultset = $this->db->query("SELECT sms_content, sms_footer from dt_sms_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
			}
			$resultset->free_result();
			//Generating Message content
			$field_name = explode('@@', $sms_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) 
			{
				if(isset($customer_data->{$field_name[$i]})) 
				{ 
					$sms_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$sms_content);					
				}	
			}
			$field_name_footer = explode('@@', $sms_footer);	
					for($i=1; $i < count($field_name_footer); $i+=2) {
						if(isset($customer_data->{$field_name_footer[$i]})) { 
							$sms_footer = str_replace("@@".$field_name_footer[$i]."@@",$customer_data->{$field_name_footer[$i]},$sms_footer);					
						}	
					}
			$sms_content .= " ".$sms_footer;
			$sms_content = urlencode($sms_content);

			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);				
		}
		//Returning generated SMS URL
		return $sms_url;
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
		$result_set = $this->db->query("select admin_sms_username, admin_sms_authkey, admin_sms_senderid from dt_generalsettings");
		if($result_set->num_rows() > 0) {
			$sms_username	= $result_set->row()->admin_sms_username;
			$sms_authkey	= $result_set->row()->admin_sms_authkey;
			$sms_senderid	= $result_set->row()->admin_sms_senderid;			
		}
		$result_set->free_result();			
		
		//Generating SMS Url with User Name, Password and Sender ID
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@authkey@@", $sms_authkey, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", $mobile_no, $sms_returnurl);
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
		
		//returning gererated URL
		return 	$sms_returnurl;
	}
	function get_admin_nos()
	{
		$result = array();
		$resultset = $this->db->query("SELECT is_admin_mob1,is_admin_mob2,is_admin_mob3,is_admin_mob4,is_admin_mob5,admin_mob1,admin_mob2,admin_mob3,admin_mob4,admin_mob5 FROM dt_generalsettings");
		foreach ($resultset->result() as $row)
		{
			$result['is_admin_mob1']	 = $row->is_admin_mob1;
			$result['is_admin_mob2']     = $row->is_admin_mob2;
			$result['is_admin_mob3']	 = $row->is_admin_mob3;
			$result['is_admin_mob4']     = $row->is_admin_mob4;
			$result['is_admin_mob5']	 = $row->is_admin_mob5;
			$result['admin_mob1']     	 = $row->admin_mob1;
			$result['admin_mob2']	 	 = $row->admin_mob2;
			$result['admin_mob3']     	 = $row->admin_mob3;
			$result['admin_mob4']	 	 = $row->admin_mob4;
			$result['admin_mob5']    	 = $row->admin_mob5;
		}
		return $result;									
	}
	function updateProfile($profileData, $userId){
		$returndata = array();
		if($this->db->update('dt_customer', $profileData, array('cus_id' => $userId))){
			$returndata = array('status' => 1, 'error' => 'Profile updated successfully');
		}else{
			$returndata = array('status' => 0, 'error' => 'Update faild');
		}
		return $returndata;
	}
	function user_device_register($regid, $uuid, $type){
		$query = $this->db->query("SELECT * FROM dt_user_device WHERE device_token='".$regid."' AND device_uuid='".$uuid."'");
		if($query->num_rows()> 0){
			return array('status' => 1, 'error' => 'Token updated successfully');
		}else {
			$uuidquery = $this->db->query("SELECT * FROM dt_user_device WHERE device_uuid='".$uuid."'");
			//return "AFFROWS : " . $uuidquery->num_rows();
			if($uuidquery->num_rows() >0){
				if($this->db->update("dt_user_device", array("device_token" => $regid), array("device_uuid" => $uuid))){
					return array('status' => 1, 'error' => 'Token updated successfully');
				}else{
					return array('status' => 1, 'error' => 'Token updated successfully');
				}
			}else{
				if($this->db->insert('dt_user_device', array('device_token' => $regid, 'device_uuid' => $uuid, 'device_type' => $type))){
					return array('status' => 1, 'error' => 'Token updated successfully');
				}else {
					return array('status' => 0, 'error' => 'Token updated faild');
				}
			}
		}
	}
	function get_orderdetails($book_no) 
	{
		$resultset = $this->db->query("SELECT cus_name, cus_email, cus_mobile, TRIM(book_qty)+0 AS book_qty, book_rate, book_totalcost, com_name, rcom_comtype AS com_type, date_format(book_datetime,'%d-%m-%Y  %h:%i:%s')  AS book_datetime, book_status, ordertype, book_comweight, book_cusid, cus_company_name, orderstatus, book_deviceid, com_margin_type, com_margin_value, admin_company_name, display_margin, margin_reverse_type, confirmation_for, book_type, book_bar_type FROM dt_booking LEFT JOIN dt_customer ON book_cusid = cus_id LEFT JOIN dt_com_master ON book_comid = com_id LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type INNER JOIN dt_generalsettings WHERE book_no = '".$book_no."'");
		return $resultset;
	}
	function get_customertransactions($cus_id)
	{
		$result_data = array();

		$closing_balance = 0;

		$str_query = "SELECT IF(trans_payment_type = 0, '-', trans_book_code) AS trans_book_code, date_format(trans_date,'%d-%m-%Y %H:%i:%s') AS trans_date , if(trans_actype = 0, trans_amount,0) AS credit, if(trans_actype = 1, trans_amount,0) AS debit, trans_comments FROM dt_transaction WHERE trans_cuscode = '".$cus_id."' ORDER BY trans_date, trans_id ASC";
		$resultset = $this->db->query($str_query);
		foreach ($resultset->result() as $row)
		{
			$credit = round($row->credit,2);
			$debit = round($row->debit,2);
			$closing_balance =  round($closing_balance + $credit - $debit,2);
			
			$result_data[] = array('trans_book_code' => $row->trans_book_code, 'trans_date' => $row->trans_date, 'trans_desc' => $row->trans_comments, 'credit' => number_format($credit,2, '.', ''), 'debit'  => number_format($debit,2, '.', ''), 'closing_balance'  => number_format($closing_balance,2, '.', ''));	
		}
		return $result_data;
	}
	function get_mobilemessages(){
		$resultdata = array();
		$message_query = $this->db->query("SELECT news_id, news, date_format(updatetime, '%d-%m-%Y %h:%i:%s') as updatetime FROM dt_news WHERE status = 1 AND isprimary = 0 ORDER BY news_id DESC");
		if($message_query->num_rows() >0){
			foreach($message_query->result() as $row){
				$resultdata[] = array('messageid' => $row->news_id, 'messages' => urlencode($row->news), 'lastupdate' => $row->updatetime);
			}
		}
		return $resultdata;
	}
	function getratehistoryreport($from_date = "", $to_date = ""){
		$returndata = array();
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		$resultset = $this->db->query("SELECT DATE_FORMAT(rate_date,'%d-%m-%Y') AS rate_date,
										round(avg(gold_rate),2) as gold_rate,round(avg(ifnull(gold_rate1,0)),2) as gold_rate1, round(avg(silver_rate),2) as silver_rate
										FROM dt_rate_history as rh where rate_date between '".$from_date."' 
										and '".$to_date."' Group By rh.rate_date");
		$gold1_totalcost			=	0;	
		$gold2_totalcost			=	0;		
		$silver_totalcost			=	0;
		
		$gold1_avgcost			=	0;	
		$gold2_avgcost			=	0;		
		$silver_avgcost			=	0;

		foreach ($resultset->result() as $row)
		{					
			$gold1_totalcost		+=	$row->gold_rate;	
			$gold2_totalcost		+=	$row->gold_rate1;
			$silver_totalcost		+=	$row->silver_rate;
		}
		if($resultset->num_rows() >0){
			$gold1_avgcost			=	number_format($gold1_totalcost / $resultset->num_rows(),2,'.','');	
			$gold2_avgcost			=	number_format($gold2_totalcost / $resultset->num_rows(),2,'.','');		
			$silver_avgcost			=	number_format($silver_totalcost / $resultset->num_rows(),2,'.','');
		}
		$userData['gold1_avg'] 		= $gold1_avgcost;
		$userData['gold2_avg']		= $gold2_avgcost;
		$userData['silver_avg']  	= $silver_avgcost;
		
		$records	=	array();
		$records[0]	=	$resultset;
		$records[1]	=	$userData;
	
		$returndata = array('bookingdata' => $resultset->result_array(), 'bookingavg' => $userData);
		
		return $returndata;
	}
	function getdateratehistoryreport($history_date){
		$returndata = array();
		$history_date = date('Y-m-d', strtotime($history_date));
		$resultset = $this->db->query("SELECT rate_time,
						round(gold_rate,2) as gold_rate,round(ifnull(gold_rate1,0),2) as gold_rate1, round(silver_rate,2) as silver_rate
						FROM dt_rate_history as rh where rh.rate_date = '". $history_date ."'");
		$returndata = array('historydata' => $resultset->result_array());
		return $returndata;
	}
	function get_availablebalance($cus_id)
	{
		$margin_amt = 0;
		$resultset = $this->db->query("SELECT IFNULL(SUM( if(trans_actype = 1, -1, 1) * IFNULL(trans_amount,0) ),0) as Balance FROM dt_transaction WHERE trans_cuscode = '".$cus_id."'");
		foreach($resultset->result() as $row)
		{
			$margin_amt  = $row->Balance;
		}
		return $margin_amt;
	}
	function insertBookingLog($record)
	{
		$updatedRecord['Book No'] 		= $record['book_no'];
		$updatedRecord['Cus Id'] 		= $record['book_cusid'];
		$updatedRecord['Com Id'] 		= $record['book_comid'];
		$updatedRecord['Qty(Kg)'] 		= (string)$record['book_qty'];
		$updatedRecord['Book Rate'] 	= $record['book_rate'];
		$updatedRecord['Total Cost'] 	= (string)$record['book_totalcost'];
		$updatedRecord['Book Type'] 	= $record['book_type'];
		$updatedRecord['Com Weight'] 	= $record['book_comweight'];
		$updatedRecord['No of Bars'] 	= $record['book_no_bar'];
		$updatedRecord['Status'] 		= $record['book_status'];
		$updatedRecord['Order Type'] 	= $record['ordertype'];
		$updatedRecord['Booked in'] 	= "Browser";
		if($record['book_marginhold'] > 0)
		{
			$updatedRecord['Margin'] 			= $record['book_marginhold'];
			$updatedRecord['Book Margin'] 		= $record['book_margin'];
			$updatedRecord['Margin Type'] 		= $record['book_margintype'];
			$updatedRecord['Margin Status'] 	= $record['book_marginstatus'];
			$updatedRecord['Margin Taken Qty'] 	= $record['book_margin_takenqty'];
			$updatedRecord['Margin Qty'] 		= (string)$record['book_marginqty'];
		}

		$bookId = array('Book No' => $record['book_no']);
		$updatedRecord = $bookId + $updatedRecord;
		if($record['ordertype'] == 0)
			$log_shortdesc 	= "New booking. Book No: ".$record['book_no'];
		else  
			$log_shortdesc 	= "New Limit Order. Order No: ".$record['book_no'];
		
		// Use common logging helper
		$this->log_add($updatedRecord, $log_shortdesc);
	}
	function updateLimitLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();

		if($oldRecord['book_rate'] != $newRecord['book_rate'])
		{
			$updatedRecord['New']['Book Rate'] = $newRecord['book_rate'];
			$updatedRecord['Old']['Book Rate'] = $oldRecord['book_rate'];
		}
		if($oldRecord['book_totalcost'] != $newRecord['log_totalcost'])
		{
			$updatedRecord['New']['Total Cost'] = $newRecord['log_totalcost'];
			$updatedRecord['Old']['Total Cost'] = $oldRecord['book_totalcost'];
		}
		if($oldRecord['book_qty'] != $newRecord['book_qty'])
		{
			$updatedRecord['New']['Qty(Kg)'] = $newRecord['book_qty'];
			$updatedRecord['Old']['Qty(Kg)'] = $oldRecord['book_qty'];
		}
		if($oldRecord['book_no_bar'] != $newRecord['book_no_bar'])
		{
			$updatedRecord['New']['No of Bars'] = $newRecord['book_no_bar'];
			$updatedRecord['Old']['No of Bars'] = $oldRecord['book_no_bar'];
		}

		if(count($updatedRecord) > 0)
		{
			$bookId = array('Book No' => $newRecord['book_no']);
			$updatedRecord = $bookId + $updatedRecord;
			$log_shortdesc 	= "Updated Limit Order. Order No: ".$newRecord['book_no'];
			
			// Use common logging helper
			$this->log_edit($updatedRecord['Old'], $updatedRecord['New'], $log_shortdesc);
		}
	}
	
	function cancelLimitLog($record)
	{
		$log_shortdesc 	= "Limit Order Cancelled. Order No: ".$record['book_no'];
		
		// Use common logging helper
		$cancelData = array('Book No' => $record['book_no'], 'Customer ID' => $record['book_cusid']);
		$this->log_delete($cancelData, $log_shortdesc);
	}
	
	function gethistoricalreport($comid, $from_date = "", $to_date = "") 
	{
		$returndata = array();
		$resultset = $this->db->query("SELECT hda_id,hda_code,hda_comname,hda_bid,hda_ask,hda_high,hda_low,hda_ltp,hda_open,hda_close,DATE_FORMAT(hda_date, '%d-%m-%Y') AS hda_date
										FROM dt_historical_avg
										WHERE hda_code = '".$comid."' and hda_date >= '".$from_date."' and hda_date <= '".$to_date."'
										order by dt_historical_avg.hda_date desc");  

		$returndata = array('historicaldata' => $resultset->result_array(), 'message' => 'Success');
		return $returndata;
	}
	
	public function get_data_last_30_mins($hd_code) {
        $this->db->select('*');
        $this->db->from('dt_historicaldata');
        $this->db->where('hd_date >=', date('Y-m-d H:i:s', strtotime('-30 minutes')));
        $this->db->where('hd_code', $hd_code); // Filter by hd_code
        return $this->db->get()->result_array();
    }
	public function get_data_last_1_hour($hd_code) {
        $this->db->select('*');
        $this->db->from('dt_historicaldata');
        $this->db->where('hd_date >=', date('Y-m-d H:i:s', strtotime('-1 hours')));
        $this->db->where('hd_code', $hd_code); // Filter by hd_code
        return $this->db->get()->result_array();
    }
	public function get_data_last_12_hour($hd_code) {
        $this->db->select('*');
        $this->db->from('dt_historicaldata');
        $this->db->where('hd_date >=', date('Y-m-d H:i:s', strtotime('-12 hours')));
        $this->db->where('hd_code', $hd_code); // Filter by hd_code
        return $this->db->get()->result_array();  
    }
    public function get_data_last_day($hd_code) {
        $this->db->select('*');
        $this->db->from('dt_historicaldata');
        $this->db->where('hd_date >=', date('Y-m-d H:i:s', strtotime('-1 day')));
        $this->db->where('hd_code', $hd_code);
        return $this->db->get()->result_array();
    }
    public function get_data_last_7_days($hd_code) {
        $this->db->select('*');
        $this->db->from('dt_historicaldata');
        $this->db->where('hd_date >=', date('Y-m-d', strtotime('-7 days')));
        $this->db->where('hd_code', $hd_code);
        return $this->db->get()->result_array();
    }
   public function get_data_last_year($hd_code) {
        $this->db->select('*');
        $this->db->from('dt_historicaldata');
        $this->db->where('hd_date >=', date('Y-m-d', strtotime('-1 year')));
        $this->db->where('hd_code', $hd_code);
        return $this->db->get()->result_array();
    }
    public function get_data_last_5_years($hd_code) {
        $this->db->select('*');
        $this->db->from('dt_historicaldata');
        $this->db->where('hd_date >=', date('Y-m-d', strtotime('-5 years')));
        $this->db->where('hd_code', $hd_code);
        return $this->db->get()->result_array();
    }
}