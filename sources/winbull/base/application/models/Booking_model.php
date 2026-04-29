<?php
class Booking_model extends CI_Model
{
	var $table_name = 'dt_booking';						//Initialize table Name
	var $rpsg_weight	= 0;
	var	$rpss_weight	= 0;
	var $tableName_new = "dt_generalsettings";


	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
		$this->load->helper('field_labels');
		$this->load->database();
		$this->load->model('Booking_model');
	}

	/**
	 * Log add operation
	 * @param array $data - Data being added
	 * @param string $description - Optional description
	 * @return boolean
	 */
	public function log_add($data = array(), $description = '')
	{
		$module_name = 'Booking';
		$log_type = 'Booking';

		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}

		return log_admin_add($log_type, $module_name, $data, $description);
	}

	/**
	 * Log edit operation
	 * @param array $old_data - Data before update
	 * @param array $new_data - Data after update
	 * @param string $description - Optional description
	 * @return boolean
	 */
	public function log_edit($old_data = array(), $new_data = array(), $description = '')
	{
		$module_name = 'Booking';
		$log_type = 'Booking';

		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}

		// Get changed fields for more detailed logging
		$changed_data = get_changed_fields($old_data, $new_data);

		return log_admin_edit($log_type, $module_name, $old_data, $new_data, $description . ' - Changed fields: ' . json_encode($changed_data));
	}

	/**
	 * Log delete operation
	 * @param array $data - Data being deleted
	 * @param string $description - Optional description
	 * @return boolean
	 */
	public function log_delete($data = array(), $description = '')
	{
		$module_name = 'Booking';
		$log_type = 'Booking';

		if (empty($description)) {
			$description = 'Deleted record from ' . $module_name;
		}

		return log_admin_delete($log_type, $module_name, $data, $description);
	}

	function get_marqueetext()
	{
		$return_data = array();
		$resultset = $this->db->query("SELECT mrq_text FROM dt_marqueetext WHERE mrq_active = 1 LIMIT 1");
		//print_r($resultset);exit;
		if ($resultset->num_rows() > 0) {
			$return_data['marquee'] = $resultset->row()->mrq_text;
		} else {
			$return_data['marquee'] = "";
		}
		$return_data['skip_btn'] = 1;
		$resultset->free_result();
		// $return_data['booknos'] = Globals::$bookno_for_mobile;
		return $return_data;
	}
	function get_admin_text()
	{
		$return_data = array();
		$resultset = $this->db->query("SELECT ai_text FROM dt_admininfo WHERE ai_active = 1 LIMIT 1");
		if ($resultset->num_rows() > 0) {
			$return_data['admin_txt'] = $resultset->row()->ai_text;
		} else {
			$return_data['admin_txt'] = "";
		}
		$resultset->free_result();
		return $return_data;
	}

	public function get_commodity_data()
	{
		$return_data = array();
		$commodityquery = $this->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
											rcom_disname as displyname, rcom_mcxsymbol as mcxsymbol, 
											rcom_banksymbol as banksymbol, rcom_comtype as com_type,
											com_tax, com_octroi, com_stamduty, com_roundoff, 
											com_weight, com_other_charges, rcom_id as rcomid,
											trade_type, sell_diff, buy_diff, sell_rate,
											com_correction_type, com_is_coin, com_order_number, 
											com_display_purity, com_margin_type, com_margin_value , 
											com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type, 
											com_sel_active, com_buy_active, com_delverydays, 
											date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
											allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type,
											TRIM(com_bar_quantity)+0 AS com_bar_quantity, com_unit,
											prmgrp.prem_comsell_active as prem_comsell_active,
											prmgrp.prem_comselretail_active as prem_comselretail_active,
											prmgrp.prem_combuy_active as prem_combuy_active,  
											prmgrp.prem_sel_premium as prem_sel_premium,  
											prmgrp.prem_buy_premium as prem_buy_premium,  
											prmgrp.prem_selretail_premium as prem_selretail_premium,
											date_format(prmgrp.prem_expirydate, '%Y-%m-%d') as prem_expirydate,com_istrade,com_is_special,com_img_location
											FROM dt_com_master AS com 
											LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1 
											LEFT JOIN dt_prem_group_master as prgc ON prgc.prem_default = 1 
											LEFT JOIN dt_prem_group_com as prmgrp ON prmgrp.prem_group_id = prgc.prem_group_id AND com.com_id = prmgrp.prem_id
											LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type 
											LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
											WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number");
		$commoditydetails = $commodityquery->result_array();
		// print_r($commoditydetails);exit;
		$commodityquery->free_result();
		$rpanelquery = $this->db->query("SELECT id, rate_display, market_status, 
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime, 
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
		$rpaneldata = $rpanelquery->result_array();
		$rpanelsetting = $this->db->query("SELECT * FROM dt_generalrpsettings");
		$rpanelsettings = array('rpsg_weight' => $rpanelsetting->row()->rpsg_weight, 'rpss_weight' => $rpanelsetting->row()->rpss_weight, 'rpsg_roundoff' => $rpanelsetting->row()->rpsg_roundoff, 'rpss_roundoff' => $rpanelsetting->row()->rpss_roundoff);
		$rpanelbankquery = $this->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff, 
											if(showdiff = 1, askdiff, 0) as askdiff
											FROM dt_bankcontractmaster 
											LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id 
											LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
											WHERE bcontract_status = 1");
		foreach ($rpanelbankquery->result() as $rpbankrow) {
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff, "bid_premium" => $rpbankrow->bid_premium, "exchange_ask" => $rpbankrow->exchange_ask, "exchange_bid" => $rpbankrow->exchange_bid, "ctype" => $rpbankrow->ctype);
		}
		$rpanelbankquery->free_result();
		$contractquery = $this->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach ($contractquery->result() as $contractrow) {
			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, "userpage_displayname" => $contractrow->userpage_displayname, "userpage_status" => $contractrow->userpage_status);
		}
		$contractquery->free_result();
		$rpanelcommodityquery = $this->db->query("SELECT rcom_id as comid, rcom_disname as dispname, 
													contract_symbol mcxcontract, 
													rcom_comtype as comtype, ifnull(trade_type,0) as tradetype, 
													ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff, 
													ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate   
													FROM dt_rpanelcommodities 
													LEFT JOIN dt_mcxcontractmaster ON contract_id = rcom_mcxsymbol 
													LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
													LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id 
													WHERE rcom_status = 1");
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate);
		}
		$rpanelcommodityquery->free_result();
		// 'url' => "http://50.28.99.198:8080"
		//$return_data = array('commoditydetails' => $commoditydetails, 'rpaneldata' => $rpaneldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelbank' => $rpanel_display_bankrates, 'rpanel_contracts' => $rpanel_display_contracts, 'rpanel_commodities' => $rpanel_display_commodities, "lsdetails" => array('url' => "http://103.138.189.206:8080", 'adapter' => "WLSTOCKLIST_REMOTE", 'provider' => "WLQUOTE_ADAPTER", 'username' => "lmxwinbullliteapp"));
		$return_data = array('commoditydetails' => $commoditydetails, 'rpaneldata' => $rpaneldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelbank' => $rpanel_display_bankrates, 'rpanel_contracts' => $rpanel_display_contracts, 'rpanel_commodities' => $rpanel_display_commodities, "lsdetails" => array('url' => "http://logimaxrates.in:8080", 'adapter' => "OSWLSTOCKLIST_REMOTE", 'provider' => "OSWLQUOTE_ADAPTER", 'username' => "lmxwinbullliteapp"));

		return $return_data;
	}
	public function get_tradecommodity_data($userid)
	{
		$return_data = array();
		$commodityquery = $this->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
			rcom_disname as displyname, rcom_mcxsymbol as mcxsymbol, 
			rcom_banksymbol as banksymbol, rcom_comtype as com_type,
			com_tax, com_octroi, com_stamduty, com_roundoff, 
			com_weight, com_other_charges, rcom_id as rcomid,
			trade_type, sell_diff, buy_diff, sell_rate,
			com_correction_type, com_is_coin, com_order_number, 
			com_display_purity, com_margin_type, com_margin_value , 
			com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type, 
			com_sel_active,
			com_buy_active, 
			com_delverydays,
			date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
			allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type,
			TRIM(com_bar_quantity)+0 AS com_bar_quantity, com_unit,
			pgc.prem_comsell_active as prem_comsell_active,
			pgc.prem_comselretail_active as prem_comselretail_active,
			pgc.prem_combuy_active as prem_combuy_active,
			pgc.prem_sel_premium as prem_sel_premium,
			pgc.prem_buy_premium as prem_buy_premium,
			pgc.prem_selretail_premium as prem_selretail_premium,
			date_format(pgc.prem_expirydate, '%Y-%m-%d') as prem_expirydate,com_istrade,com_is_special,com_img_location 
			FROM dt_customergroupitems cusgrp
			LEFT JOIN dt_com_group_com comgrp ON comgrp.com_group_id = 1 
			LEFT JOIN dt_cus_commodity cuscom ON cuscom.cus_com_cus_id = cusgrp.cgitems_cusid 
			AND cuscom.cus_com_id  = comgrp.com_id
			LEFT JOIN dt_com_master com ON com.com_id = comgrp.com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
			LEFT JOIN dt_prem_group_master as pgm ON  pgm.prem_group_id = cgitems_comgroupid 
			LEFT JOIN dt_prem_group_com as pgc ON pgc.prem_group_id = pgm.prem_group_id AND prem_id = cus_com_id
			WHERE cgitems_cusid = '" . $userid . "' AND ((com_sel_active = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1 AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");
		$commoditydetails = $commodityquery->result_array();
		$commodityquery->free_result();
		$rpanelquery = $this->db->query("SELECT id, rate_display, market_status, 
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime, 
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
		$rpaneldata = $rpanelquery->result_array();
		$rpanelsetting = $this->db->query("SELECT * FROM dt_generalrpsettings");
		$rpanelsettings = array('rpsg_weight' => $rpanelsetting->row()->rpsg_weight, 'rpss_weight' => $rpanelsetting->row()->rpss_weight, 'rpsg_roundoff' => $rpanelsetting->row()->rpsg_roundoff, 'rpss_roundoff' => $rpanelsetting->row()->rpss_roundoff);
		$rpanelbankquery = $this->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff, 
											if(showdiff = 1, askdiff, 0) as askdiff 
											FROM dt_bankcontractmaster 
											LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id 
											LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
											WHERE bcontract_status = 1");
		foreach ($rpanelbankquery->result() as $rpbankrow) {
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff);
		}
		$rpanelbankquery->free_result();
		$contractquery = $this->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach ($contractquery->result() as $contractrow) {
			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, 'userpage_status' => $contractrow->userpage_status, 'userpage_displayname' => $contractrow->userpage_displayname);
		}
		$contractquery->free_result();
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
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate);
		}
		$rpanelcommodityquery->free_result();
		$return_data = array('commoditydetails' => $commoditydetails, 'rpaneldata' => $rpaneldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelbank' => $rpanel_display_bankrates, 'rpanel_contracts' => $rpanel_display_contracts, 'rpanel_commodities' => $rpanel_display_commodities, "lsdetails" => array('url' => "http://logimaxrates.in:8080", 'adapter' => "WLSTOCKLIST_REMOTE", 'provider' => "WLQUOTE_ADAPTER", 'username' => "lmxwinbullliteapp"));

		return $return_data;
	}
	public function display_commodity_data()
	{
		$commoditydetails = array();
		$commodityquery = $this->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
											rcom_disname as displyname, rcom_mcxsymbol as mcxsymbol, 
											rcom_banksymbol as banksymbol, rcom_comtype as com_type,
											com_tax, com_octroi, com_stamduty, com_roundoff, 
											com_weight, com_other_charges, rcom_id as rcomid,
											trade_type, sell_diff, buy_diff, sell_rate,
											com_correction_type, com_is_coin, com_order_number, 
											com_display_purity, com_margin_type, com_margin_value , 
											com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type, 
											com_sel_active, com_buy_active, com_delverydays, 
											date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
											allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type,
											TRIM(com_bar_quantity)+0 AS com_bar_quantity, com_unit,
											prmgrp.prem_comsell_active as prem_comsell_active,
											prmgrp.prem_comselretail_active as prem_comselretail_active,
											prmgrp.prem_combuy_active as prem_combuy_active,  
											prmgrp.prem_sel_premium as prem_sel_premium,  
											prmgrp.prem_buy_premium as prem_buy_premium,  
											prmgrp.prem_selretail_premium as prem_selretail_premium,
											date_format(prmgrp.prem_expirydate, '%Y-%m-%d') as prem_expirydate,com_istrade,com_is_special,com_img_location
											FROM dt_com_master AS com 
											LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1
											LEFT JOIN dt_prem_group_master as prgc ON prgc.prem_default = 1 
											LEFT JOIN dt_prem_group_com as prmgrp ON prmgrp.prem_group_id = prgc.prem_group_id AND com.com_id = prmgrp.prem_id											
											LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type 
											LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
											WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number");
		$commoditydetails['commoditydetails'] = $commodityquery->result_array();
		$commodityquery->free_result();
		$rpanel_display_commodities = array();
		$rpanelcommodityquery = $this->db->query("SELECT rcom_id as comid, rcom_disname as dispname, 
													contract_symbol mcxcontract, 
													rcom_comtype as comtype, ifnull(trade_type,0) as tradetype, 
													ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff, 
													ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate   
													FROM dt_rpanelcommodities 
													LEFT JOIN dt_mcxcontractmaster ON contract_id = rcom_mcxsymbol 
													LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
													LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id 
													WHERE rcom_status = 1");
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate);
		}
		$commoditydetails['rpanel_commodities'] = $rpanel_display_commodities;
		$rpanelcommodityquery->free_result();
		return $commoditydetails;
	}
	public function display_tradecommodity_data($userid)
	{
		$commoditydetails = array();
		$commodityquery = $this->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
			rcom_disname as displyname, rcom_mcxsymbol as mcxsymbol, 
			rcom_banksymbol as banksymbol, rcom_comtype as com_type,
			com_tax, com_octroi, com_stamduty, com_roundoff, 
			com_weight, com_other_charges, rcom_id as rcomid,
			trade_type, sell_diff, buy_diff, sell_rate,
			com_correction_type, com_is_coin, com_order_number, 
			com_display_purity, com_margin_type, com_margin_value , 
			com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type, 
			com_sel_active,
			com_buy_active, 
			com_delverydays,
			date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
			allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type,
			TRIM(com_bar_quantity)+0 AS com_bar_quantity, com_unit,
			pgc.prem_comsell_active as prem_comsell_active,
			pgc.prem_comselretail_active as prem_comselretail_active,
			pgc.prem_combuy_active as prem_combuy_active,
			pgc.prem_sel_premium as prem_sel_premium,
			pgc.prem_buy_premium as prem_buy_premium,
			pgc.prem_selretail_premium as prem_selretail_premium,
			date_format(pgc.prem_expirydate, '%Y-%m-%d') as prem_expirydate
			FROM dt_customergroupitems cusgrp
			LEFT JOIN dt_com_group_com comgrp ON comgrp.com_group_id = 1 
			LEFT JOIN dt_cus_commodity cuscom ON cuscom.cus_com_cus_id = cusgrp.cgitems_cusid 
			AND cuscom.cus_com_id  = comgrp.com_id
			LEFT JOIN dt_com_master com ON com.com_id = comgrp.com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
			LEFT JOIN dt_prem_group_master as pgm ON  pgm.prem_group_id = cgitems_comgroupid 
			LEFT JOIN dt_prem_group_com as pgc ON pgc.prem_group_id = pgm.prem_group_id AND prem_id = cus_com_id
			WHERE cgitems_cusid = '" . $userid . "' AND ((com_sel_active = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1 AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");
		$commoditydetails['commoditydetails'] = $commodityquery->result_array();
		$commodityquery->free_result();
		$rpanel_display_commodities = array();
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
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate);
		}
		$commoditydetails['rpanel_commodities'] = $rpanel_display_commodities;
		$rpanelcommodityquery->free_result();
		return $commoditydetails;
	}

	function get_commoditystatus($cus_id)
	{
		$status = array();
		$resultset = $this->db->query("SELECT cus_com_id, IF(IFNULL(com_sel_trade,0) = 1 AND IF(IFNULL(cus_com_status_sell,-1) = 1 OR  IFNULL(cus_com_status_sell,-1) = -1, 1, 0) = 1, 1 ,0) AS  cus_com_status_sell,
			                                  IF(IFNULL(com_buy_trade,0) = 1 AND IF(IFNULL(cus_com_status_buy,-1) = 1 OR  IFNULL(cus_com_status_buy,-1) = -1, 1, 0) = 1, 1 ,0) AS cus_com_status_buy, cus_com_smoq, cus_com_pmoq,
											  if(com.com_type = 1, 1, 0) AS com_type
                                              FROM dt_cus_commodity AS ccd
                                              LEFT JOIN dt_customergroupitems AS cgi ON ccd.cus_com_cus_id = cgi.cgitems_cusid
                                              LEFT JOIN dt_com_group_master AS cgm ON cgi.cgitems_comgroupid = cgm.com_group_id
                                              LEFT JOIN dt_com_group_com AS cgc ON cgm.com_group_id = cgc.com_group_id AND cgc.com_id = ccd.cus_com_id
											  LEFT JOIN dt_com_master AS com ON ccd.cus_com_id = com.com_id
                                              WHERE cgm.com_group_active = 1 AND ccd.cus_com_cus_id =  '" . $cus_id . "' AND (cgc.com_sel_active = 1 OR cgc.com_buy_active = 1)");
		$i = 0;
		foreach ($resultset->result() as $row) {
			$records['status'][$i]['trade_status_id']	= $row->cus_com_id;
			$records['status'][$i]['com_type']			= $row->com_type;
			$records['status'][$i]['trade_status_buy']	= $row->cus_com_status_buy;
			$records['status'][$i]['trade_status_sell'] = $row->cus_com_status_sell;
			$records['status'][$i]['trade_min_qty'] 	= $row->cus_com_smoq;
			$records['status'][$i]['trade_max_qty'] 	= $row->cus_com_pmoq;
			$i++;
		}

		$premstatus = array();
		$resultset_prem = $this->db->query("SELECT prem_grp.prem_group_id,prem_sel_premium,
		prem_selretail_premium,prem_buy_premium,date_format(prem_expirydate, '%Y-%m-%d') as prem_expirydate, limit_sel_premium, 
		limit_buy_premium,prem_comsell_active,prem_comselretail_active,prem_combuy_active 
		FROM dt_prem_group_com AS prem_com
		LEFT JOIN dt_prem_group_master AS prem_grp ON prem_grp.prem_group_id = prem_com.prem_group_id
		LEFT JOIN dt_customergroupitems As cus_grp ON cus_grp.cgitems_comgroupid = prem_grp.prem_group_id
		WHERE cus_grp.cgitems_cusid = " . $cus_id);
		$i = 0;
		foreach ($resultset_prem->result() as $row) {
			$records['premstatus'][$i]['prem_group_id']		= $row->prem_group_id;
			$records['premstatus'][$i]['prem_sel_premium']	= $row->prem_sel_premium;
			$records['premstatus'][$i]['prem_selretail_premium']	= $row->prem_selretail_premium;
			$records['premstatus'][$i]['prem_buy_premium']	= $row->prem_buy_premium;
			$records['premstatus'][$i]['prem_expirydate']	= $row->prem_expirydate;
			$records['premstatus'][$i]['limit_sel_premium'] = $row->limit_sel_premium;
			$records['premstatus'][$i]['limit_buy_premium'] = $row->limit_buy_premium;
			$records['premstatus'][$i]['prem_comsell_active'] = $row->prem_comsell_active;
			$records['premstatus'][$i]['prem_comselretail_active'] = $row->prem_comselretail_active;
			$records['premstatus'][$i]['prem_combuy_active']  = $row->prem_combuy_active;
			$i++;
		}

		$general = $this->db->query("select grl.trade_enable, IF(cus.has_maxqty = 1 or grl.has_maxqty, 1, 0) AS has_maxqty, IF(cus.has_maxqty = 1, cus.gold_max_qty,(IF(grl.has_maxqty = 1, grl.gold_max_qty,0))) AS gold_max_qty, IF(cus.has_maxqty = 1, cus.silver_max_qty,(IF(grl.has_maxqty = 1, grl.silver_max_qty,0))) AS silver_max_qty, IF(cus.has_minqty = 1 or grl.has_minqty, 1, 0) AS has_minqty, IF(cus.has_minqty = 1, cus.gold_min_qty,(IF(grl.has_minqty = 1, grl.gold_min_qty,0))) AS gold_min_qty, IF(cus.has_minqty = 1, cus.silver_min_qty,(IF(grl.has_minqty = 1, grl.silver_min_qty,0))) AS silver_min_qty  from dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = " . $cus_id);
		foreach ($general->result() as $settings) {
			$records['trade_enable'] 	= $settings->trade_enable;
			$records['has_maxqty'] 		= $settings->has_maxqty;
			$records['gold_max_qty'] 	= $settings->gold_max_qty;
			$records['silver_max_qty'] 	= $settings->silver_max_qty;
			$records['has_minqty'] 		= $settings->has_minqty;
			$records['gold_min_qty'] 	= $settings->gold_min_qty;
			$records['silver_min_qty'] 	= $settings->silver_min_qty;
		}
		return $records;
	}

	/* function get_marqueetext() {
		$return_data = "";
		$resultset = $this->db->query("SELECT mrq_text FROM dt_marqueetext WHERE mrq_active = 1 LIMIT 1");
		foreach ($resultset->result() as $row) {
			$return_data = $row->mrq_text;
		}
		return $return_data;
	} */
	function get_image()
	{
		$query = $this->db->query("select pop_image from dt_popup where pop_active = 1 order by pop_id  desc limit 1");
		foreach ($query->result() as $row) {
			$pop_image = $row->pop_image;
			return $pop_image;
		}
	}
	function get_mobilemessages()
	{
		$resultdata = array();
		$message_query = $this->db->query("SELECT news_id, newstitle, newsshortdesc, news, date_format(updatetime, '%d-%m-%Y %h:%i:%s') as updatetime FROM dt_news WHERE status = 1 ORDER BY news_id DESC");

		if ($message_query->num_rows() > 0) {
			foreach ($message_query->result() as $row) {
				$resultdata[] = array('messageid' => $row->news_id, 'newsshortdesc' => $row->newsshortdesc, 'newstitle' => $row->newstitle, 'messages' => $row->news, 'lastupdate' => $row->updatetime);
			}
		}
		return json_encode($resultdata);
	}
	function get_MarqueNews()
	{
		$result = array();
		$resultset = $this->db->query("SELECT (SELECT mrq_text FROM dt_marqueetext WHERE mrq_active = 1 LIMIT 1) AS marque,(SELECT news FROM dt_news LIMIT 1) AS news");
		foreach ($resultset->result() as $row) {
			$result['marque']	 = $row->marque;
			$result['news']      = $row->news;
		}
		return $result;
	}
	function get_text()
	{
		$result = array();
		$resultset = $this->db->query("SELECT (SELECT ai_text FROM dt_admininfo WHERE ai_active = 1 LIMIT 1) AS txt");
		foreach ($resultset->result() as $row) {
			$result['txt']	 = $row->txt;
		}
		return $result;
	}

	public function get_rpanelcontracts()
	{
		$rpanel_display_contracts = array();

		$contractquery = $this->db->query("SELECT 
											* 
										FROM dt_contractmaster 
										where status = 1 
										ORDER BY displayorder");

		foreach ($contractquery->result() as $contractrow) {
			$rpanel_display_contracts[] = array(
				"contract_id" => $contractrow->contract_id,
				"contract_symbol" => $contractrow->contract_symbol,
				"displayname" => $contractrow->displayname,
				"biddiff" => $contractrow->biddiff,
				"askdiff" => $contractrow->askdiff,
				"showdiff" => $contractrow->showdiff,
				"ctype" => $contractrow->ctype,
				"displayorder" => $contractrow->displayorder,
				'userpage_status' => $contractrow->userpage_status,
				'userpage_displayname' => $contractrow->userpage_displayname
			);
		}

		$contractquery->free_result();
		return $rpanel_display_contracts;
	}

	public function getadvertisements()
	{
		$return_data = array();
		$query	= $this->db->query("SELECT adv_name,adv_location,adv_type,if(adv_url!='',adv_url,'#') as adv_url from dt_advertisements where adv_status=1 order by adv_sequence");
		$i = 0;
		foreach ($query->result() as $row) {
			$return_data[$i]['name'] = $row->adv_name;
			$return_data[$i]['location'] = $row->adv_location;
			$return_data[$i]['full_path'] = $this->config->item('base_url') . '' . substr($row->adv_location, 1);
			$return_data[$i]['type'] = $row->adv_type;
			$return_data[$i]['adv_url'] = $row->adv_url;
			++$i;
		}
		return json_encode($return_data);
	}
	function getmobileappevents()
	{

		$return_data = array();
		$query	= $this->db->query("SELECT event_name,event_description,event_status,event_date,event_time from dt_appevents where event_status=1 order by appeven_id");
		$i = 0;
		foreach ($query->result() as $row) {
			$return_data[$i]['eventname'] 	= $row->event_name;
			$return_data[$i]['description'] = $row->event_description;
			$return_data[$i]['status'] 		= $row->event_status;
			$return_data[$i]['event_date'] 		= $row->event_date;
			$return_data[$i]['event_time'] 		= $row->event_time;
			++$i;
		}
		return json_encode($return_data);
	}
	function getmobileappvideos()
	{
		$baseurl = 'https://www.youtube.com/embed/';
		$return_data = array();
		$query	= $this->db->query("SELECT video_name,video_descriptions,video_id FROM dt_appvideos where video_type = '1' order by appvideo_id");
		$i = 0;
		foreach ($query->result() as $row) {
			$return_data[$i]['videoname'] 	= $row->video_name;
			$return_data[$i]['description'] = $row->video_descriptions;
			$return_data[$i]['video_id'] 	= $baseurl . $row->video_id;

			++$i;
		}
		return json_encode($return_data);
	}
	public function get_calendardata()
	{
		$records = array();
		$query = $this->db->query("SELECT eve_id,eve_name,eve_timeam,eve_timepm,eve_date,eve_description from  dt_events  where eve_id");
		$i = 0;
		foreach ($query->result() as $row) {
			$records[$i]['eve_id']   				= $row->eve_id;
			$records[$i]['eve_name']   				= $row->eve_name;
			$records[$i]['eve_date']   				= $row->eve_date;
			$records[$i]['eve_timeam']   			= $row->eve_timeam;
			$records[$i]['eve_timepm']   			= $row->eve_timepm;
			$records[$i]['eve_description']   		= $row->eve_description;
			$i++;
		}
		return $records;
	}
	public function getgallery()
	{
		$return_data = array();
		$query	= $this->db->query("SELECT gal_id,gal_name,gal_location FROM dt_gallery where gal_status = '1'");
		$i = 0;
		foreach ($query->result() as $row) {
			$return_data[$i]['id'] 			= $row->gal_id;
			$return_data[$i]['name'] 		= $row->gal_name;
			$return_data[$i]['location'] 	= $row->gal_location;
			$return_data[$i]['full_path'] 	= $this->config->item('base_url') . '' . $row->gal_location;
			++$i;
		}
		return json_encode($return_data);
	}
	public function getgallerygold()
	{
		$return_data = array();
		$query	= $this->db->query("SELECT gal_id,gal_name,gal_location FROM dt_gallery where gal_type='0' AND gal_status = '1'");
		$i = 0;
		foreach ($query->result() as $row) {
			$return_data[$i]['id'] 			= $row->gal_id;
			$return_data[$i]['name'] 		= $row->gal_name;
			$return_data[$i]['location'] 	= $row->gal_location;
			$return_data[$i]['full_path'] 	= $this->config->item('base_url') . '' . $row->gal_location;
			++$i;
		}
		return json_encode($return_data);
	}
	public function getgallerysilver()
	{
		$return_data = array();
		$query	= $this->db->query("SELECT gal_id,gal_name,gal_location FROM dt_gallery where gal_type='1' AND  gal_status = '1'");
		$i = 0;
		foreach ($query->result() as $row) {
			$return_data[$i]['id'] 			= $row->gal_id;
			$return_data[$i]['name'] 		= $row->gal_name;
			$return_data[$i]['location'] 	= $row->gal_location;
			$return_data[$i]['full_path'] 	= $this->config->item('base_url') . '' . $row->gal_location;
			++$i;
		}
		return json_encode($return_data);
	}
	function user_device_register($regid, $uuid, $type)
	{
		$query = $this->db->query("SELECT * FROM dt_user_device WHERE device_token='" . $regid . "' AND device_uuid='" . $uuid . "'");
		if ($query->num_rows() > 0) {
			return TRUE;
		} else {
			$uuidquery = $this->db->query("SELECT * FROM dt_user_device WHERE device_uuid='" . $uuid . "'");
			//return "AFFROWS : " . $uuidquery->num_rows();
			if ($uuidquery->num_rows() > 0) {
				if ($this->db->update("dt_user_device", array("device_token" => $regid), array("device_uuid" => $uuid))) {
					return TRUE;
				} else {
					return TRUE;
				}
			} else {
				if ($this->db->insert('dt_user_device', array('device_token' => $regid, 'device_uuid' => $uuid, 'device_type' => $type))) {
					return TRUE;
				} else {
					return FALSE;
				}
			}
			//$this->db->delete('dt_device_token', array('device_token' => $regid)); 
		}
	}
	public function ratealertRequest($alertratedata)
	{
		$returndata = array();
		$alertquery = $this->db->query("SELECT alert_no,alert_device,alert_cusdeviceid,alert_comid FROM dt_ratealert WHERE alert_cusdeviceid='" . $alertratedata['alert_cusdeviceid'] . "' AND alert_comid='" . $alertratedata['alert_comid'] . "' AND alert_status=0");
		$create_ratealert_url    =  trim(isset(Globals::$createratealert) ? Globals::$createratealert : '');
		$update_ratealert_url    =  trim(isset(Globals::$updateratealert) ? Globals::$updateratealert : '');
		if ($alertquery->num_rows() > 0) {
			$this->db->update('dt_ratealert', array('alert_rate' => $alertratedata['alert_rate'], 'alerttype' => $alertratedata['alerttype']), array('alert_cusdeviceid' => $alertratedata['alert_cusdeviceid'], 'alert_comid' => $alertratedata['alert_comid'], 'alert_status' => 0));
			$requestdata = array(
				'client' 		=> isset(Globals::$client) ? Globals::$client : '',
				'book_cusid' 	=> $alertratedata['alert_cusdeviceid'],
				'book_comid' 	=> $alertratedata['alert_comid'],
				'book_type'  	=> $alertratedata['alerttype'],
				'book_rate'  	=> $alertratedata['alert_rate'],
				'book_qty'   	=> 1,
				'book_no'    	=> $alertquery->row()->alert_no,
				'alert_type' 	=> 1,  //0->limit order, 1->rate alert
				'device_id'  	=> $alertratedata['alert_device'],
				'mobile_no'	 	=> $alertratedata['alert_cusdeviceid']
			);
			$field_string = http_build_query($requestdata);
			$curl_resp = curl_helper($update_ratealert_url, $field_string);
			$returndata = array('success' => TRUE, 'message' => 'Rate alert has been updated successfully', 'status' => 1);
		} else {
			// if($this->db->insert("dt_ratealert",$alertratedata)){
			$sql = "INSERT INTO dt_ratealert (alert_device, alert_cusdeviceid, alert_datetime, alert_comid, alert_rate, alerttype) 
			VALUES ('" . $alertratedata['alert_device'] . "', '" . $alertratedata['alert_cusdeviceid'] . "', '" . $alertratedata['alert_datetime'] . "', '" . $alertratedata['alert_comid'] . "', '" . $alertratedata['alert_rate'] . "', '" . $alertratedata['alerttype'] . "')";
			if ($this->db->query($sql)) {
				$orderArray = array();
				$insert_id = $this->db->insert_id();
				$requestdata = array(
					'client' 		=> isset(Globals::$client) ? Globals::$client : '',
					'book_cusid' 	=> $alertratedata['alert_cusdeviceid'],
					'book_comid' 	=> $alertratedata['alert_comid'],
					'book_type'  	=> $alertratedata['alerttype'],
					'book_rate'  	=> $alertratedata['alert_rate'],
					'book_qty'   	=> 1,
					'book_no'    	=> $insert_id,
					'alert_type' 	=> 1,  //0->limit order, 1->rate alert
					'device_id'  	=> $alertratedata['alert_device'],
					'mobile_no'	 	=> $alertratedata['alert_cusdeviceid']
				);
				$field_string = http_build_query($requestdata);
				$curl_resp = curl_helper($create_ratealert_url, $field_string);
				$returndata = array('success' => TRUE, 'message' => 'Rate alert has been set successfully', 'status' => 1);
			} else {
				$returndata = array('success' => FALSE, 'message' => 'Rate alert request failed, Pleae try again ', 'status' => 1);
			}
		}
		return json_encode($returndata);
	}
	public function ratealertDeleteRequest($alertid, $alerttype, $comid, $deviceid)
	{
		$this->db->update('dt_ratealert', array('alert_status' => 2), array('alert_no' => $alertid));

		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		if ($cancel_ratealert_url != '' && $client != '') {
			$requestdata = array(
				'client'  => $client,
				'book_no' => array($alertid)
			);
			$field_string = http_build_query($requestdata);
			$curl_resp = curl_helper($cancel_ratealert_url, $field_string);
		}
		$returndata = array('success' => TRUE, 'message' => 'Rate alert has been deleted', 'status' => 1);
		return json_encode($returndata);
	}
	public function update_ratealert($alertid)
	{
		$this->db->update('dt_ratealert', array('alert_status' => 1, 'alert_exedatetime' => date('Y-m-d H:i:s')), array('alert_no' => $alertid));
	}
	public function getratealertlist($uuid)
	{
		$alert_data = array();
		$alertquery = $this->db->query("SELECT alert_no, date_format(alert_datetime, '%d-%m-%Y %h:%i:%s %p') as reqtime, 
										com_name as commodity, alert_rate, if(alert_status=0, 'Await','Executed') as alertstatus, alert_status, ifnull(date_format(alert_exedatetime, '%d-%m-%Y %h:%i:%s %p'), '-') as exctime, alert_comid  
										FROM dt_ratealert 
										LEFT JOIN dt_com_master ON com_id = alert_comid 
										WHERE alert_device = '" . $uuid . "' AND alert_status != 2 ORDER BY alert_no DESC 
										LIMIT 10");
		if ($alertquery->num_rows() > 0) {
			foreach ($alertquery->result() as $row) {
				$alert_data[] = array('reqno' => $row->alert_no, 'reqtime' => $row->reqtime, 'commodity' => $row->commodity, 'alert_rate' => $row->alert_rate, 'alertstatus' => $row->alertstatus, 'exctime' => $row->exctime, 'status' => $row->alert_status, 'comid' => $row->alert_comid);
			}
		}
		$returndata = array('success' => TRUE, 'alertdata' => $alert_data, 'status' => 1);
		return json_encode($returndata);
	}
	public function getadminnotificationids()
	{
		$notificationids = array();
		$notificationquery = $this->db->query("SELECT device_token FROM dt_user_device WHERE device_token IS NOT NULL AND device_token != '' AND device_type=4");
		if ($notificationquery->num_rows() > 0) {
			foreach ($notificationquery->result() as $row) {
				array_push($notificationids, $row->device_token);
			}
		}
		return $notificationids;
	}
	public function getratealertTolerance()
	{
		$returndata = array('gold_high_tol' => 0, 'gold_low_tol' => 0, 'silver_high_tol' => 0, 'silver_low_tol' => 0);
		$gold_high_tol = 0;
		$gold_low_tol = 0;
		$silver_high_tol = 0;
		$silver_low_tol = 0;
		$resultset = $this->db->query("SELECT gold_tol, silver_tol FROM dt_generalsettings");
		if ($resultset->num_rows() > 0) {
			if (!empty(explode("#", $resultset->row()->gold_tol)) && sizeof(explode("#", $resultset->row()->gold_tol)) == 2) {
				$gold_high_tol 	= explode("#", $resultset->row()->gold_tol)[0];
				$gold_low_tol 	= explode("#", $resultset->row()->gold_tol)[1];
			}
			if (!empty(explode("#", $resultset->row()->silver_tol)) && sizeof(explode("#", $resultset->row()->silver_tol)) == 2) {
				$silver_high_tol 	= explode("#", $resultset->row()->silver_tol)[0];
				$silver_low_tol 	= explode("#", $resultset->row()->silver_tol)[1];
			}
			$returndata = array('gold_high_tol' => $gold_high_tol, 'gold_low_tol' => $gold_low_tol, 'silver_high_tol' => $silver_high_tol, 'silver_low_tol' => $silver_low_tol);
		}
		return json_encode($returndata);
	}
	function get_tdsvalue()
	{
		$result = array();
		$resultset = $this->db->query("SELECT TRIM(tcs_value)+0 as tcs_value, TRIM(admin_igst)+0 as admin_igst, displaytds, admin_tcstdshint,tds_tcs_enable FROM dt_generalsettings");
		foreach($resultset->result() as $row) {
			$result['tds_value'] 	= $row->tcs_value; 
			$result['gst_value'] 	= $row->admin_igst; 
			$result['admin_igst'] = $row->admin_igst; 
			$result['displaytds'] 	= $row->displaytds;
			$result['tds_tcs_enable'] 	= $row->tds_tcs_enable;
			$result['tcstds_hint'] 	= str_replace("\\n","\n", $row->admin_tcstdshint);
		}
		return $result;
	}
	public function historicaldata($data)
	{
		$this->db->insert('dt_historicaldata', $data);
	}

	public function store_daily_averages()
	{
		$this->db->select('hd_code, hd_comname');
		$this->db->group_by('hd_code');
		$codes = $this->db->get('dt_historicaldata')->result_array();

		foreach ($codes as $code) {
			$hd_code = $code['hd_code'];
			$hd_comname = $code['hd_comname'];
			$startDate = date('Y-m-d 00:00:00', strtotime('-1 day'));
			$endDate = date('Y-m-d 23:59:59', strtotime('-1 day'));
			$this->db->select('
				AVG(hd_bid) as hda_bid,
				AVG(hd_ask) as hda_ask,
				AVG(hd_high) as hda_high,
				AVG(hd_low) as hda_low,
				AVG(hd_ltp) as hda_ltp,
				AVG(hd_open) as hda_open,
				AVG(hd_close) as hda_close,
				DATE(hd_date) as hda_date
			');
			$this->db->where('hd_code', $hd_code);
			$this->db->where('hd_date >=', $startDate);
			$this->db->where('hd_date <=', $endDate);
			$result = $this->db->get('dt_historicaldata')->row_array();

			if (!empty($result) && $result['hda_ask'] !== null) {
				$data = [
					'hda_code' => $hd_code,
					'hda_comname' => $hd_comname,
					'hda_bid' => $result['hda_bid'],
					'hda_ask' => $result['hda_ask'],
					'hda_high' => $result['hda_high'],
					'hda_low' => $result['hda_low'],
					'hda_ltp' => $result['hda_ltp'],
					'hda_open' => $result['hda_open'],
					'hda_close' => $result['hda_close'],
					'hda_date' => date('Y-m-d', strtotime('-1 day')),  // Use previous day as hda_date
				];
				$this->db->insert('dt_historical_avg', $data);
			} else {
				echo "No data found for hd_code: $hd_code on previous day.\n";
			}
		}

		echo "Daily averages stored successfully!";

		$this->db->truncate('dt_historicaldata');
		echo "Historical data truncated successfully!";
	}

	//Quotation Start 
	function getCountry($ct_phonecode)
	{
		$ct_phonecode = ($ct_phonecode == NULL) ? -1 : $ct_phonecode;
		// $strData = "<option value='-1' ";
		// $strData .= $ct_phonecode == -1 ? "selected='selected'" : "";
		// $strData .= ">- SELECT -</option>";  
		$strData = "";
		$resultset = $this->db->query("SELECT ct_id, ct_phonecode, ct_iso, ct_is_default, ct_mob_no_len, ct_min_mob_len, ct_max_mob_len, ct_nicename FROM dt_country ORDER BY ct_is_default DESC");
		foreach ($resultset->result() as $row) {
			$strData .= "<option data-iso='" . $row->ct_iso . "' value='" . '+' . $row->ct_phonecode . "' ";
			$strData .= ($ct_phonecode == $row->ct_phonecode) ? "selected='selected'" : "";
			$strData .= ">" . '+' . $row->ct_phonecode . ' ' . $row->ct_nicename . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	function get_number_gst($mobile, $gst)
	{
		// Check if mobile number already exists
		$this->db->where('mobile_no', $mobile);
		$query = $this->db->get('dt_quotation');
		if ($query->num_rows() > 0) {
			return array(
				'status'  => 'error',
				'message' => 'Mobile number already exists.'
			);
		}

		// Check if GST number already exists
		$this->db->where('gst_no', $gst);
		$query = $this->db->get('dt_quotation');
		if ($query->num_rows() > 0) {
			return array(
				'status'  => 'error',
				'message' => 'GST number already exists.'
			);
		}
		return array(
			'status'  => 'success',
			'message' => ''
		);
	}

	function get_Delivery_content($service_id, $mobile)
	{
		$sms_content      = "";
		$sms_footer       = "";
		$sms_dlt_te_id    = "";
		$return_data      = [];
		$OTP              = mt_rand(100001, 999999);
		$sms_id = 1; //Send SMS

		// Get email and SMS status for the service
		$query = $this->db->query("SELECT serv_email, serv_sms FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");

		if ($query->num_rows() > 0) {
			$row = $query->row();
			$email_status = $row->serv_email;
			$sms_status   = $row->serv_sms;
		}
		$query->free_result();

		$this->session->unset_userdata("OTP");
		$this->session->set_userdata('OTP', $OTP);

		if ($sms_status == 1) {
			//Retriving message content
			$resultset = $this->db->query("SELECT sms_content, sms_footer,sms_dlt_te_id from dt_sms_settings where service_id = '" . $service_id . "'");
			foreach ($resultset->result() as $row) {
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
				$sms_dlt_te_id = $row->sms_dlt_te_id;
			}
			$resultset->free_result();
			$sms_url = $this->booking_model->get_SMSAppSettings_dlt($sms_id, $mobile, $sms_dlt_te_id);
			//Generating Message content
			$field_name = explode('@@', $sms_content);
			//echo count($field_name);		
			$field_name = explode('@@', $sms_content);
			for ($i = 1; $i < count($field_name); $i += 2) {
				if ($field_name[$i] == 'otp') {
					$sms_content = str_replace("@@" . $field_name[$i] . "@@", $OTP, $sms_content);
				}
			}
			// $field_name_footer = explode('@@', $sms_footer);
			$sms_content .= " " . $sms_footer;
			$sms_content = urlencode($sms_content);
			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);
			// print_r($sms_url);exit;
			$return_data["sms_url"]      = $sms_url;
		}

		return !empty($return_data) ? $return_data : '';
	}

	function get_SMSAppSettings_dlt($sms_id, $mobile_no, $dlt_id = "")
	{
		$mobile_no = ltrim($mobile_no, '+');
		//Declaring variables
		$sms_returnurl = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";

		//Fetching SMS App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id='" . $sms_id . "'");
		foreach ($result_set->result() as $row) {
			$sms_returnurl = $row->sas_url;
		}
		$result_set->free_result();

		//Fetching SMS App user name, password and sender id
		$result_set = $this->db->query("select admin_sms_username, admin_sms_password, admin_sms_authkey, admin_sms_senderid from " . $this->tableName_new);
		if ($result_set->num_rows() > 0) {
			$sms_username	= $result_set->row()->admin_sms_username;
			$sms_password	= $result_set->row()->admin_sms_password;
			$sms_authkey	= $result_set->row()->admin_sms_authkey;
			$sms_senderid	= $result_set->row()->admin_sms_senderid;
		}
		$result_set->free_result();

		//Generating SMS Url with User Name, Password and Sender ID
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@password@@", $sms_password, $sms_returnurl);
		$sms_returnurl = str_replace("@@authkey@@", $sms_authkey, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", $mobile_no, $sms_returnurl);
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
		$sms_returnurl = str_replace("@@dlt_id@@", $dlt_id, $sms_returnurl);
		//returning gererated URL
		return 	$sms_returnurl;
	}

	public function insert_quotation_record($data)
	{
		// Check if mobile number already exists
		$this->db->where('mobile_no', $data['mobile_no']);
		$query = $this->db->get('dt_quotation');
		if ($query->num_rows() > 0) {
			return array(
				'status'  => 'error',
				'message' => 'Mobile number already exists.'
			);
		}

		// Check if GST number already exists
		$this->db->where('gst_no', $data['gst_no']);
		$query = $this->db->get('dt_quotation');
		if ($query->num_rows() > 0) {
			return array(
				'status'  => 'error',
				'message' => 'GST number already exists.'
			);
		}

		// Insert if no duplicate found
		if ($this->db->insert('dt_quotation', $data)) {
			return array(
				'status'  => 'success',
				'message' => 'Quotation saved successfully.'
			);
		} else {
			return array(
				'status'  => 'error',
				'message' => 'Failed to save quotation. Please try again.'
			);
		}
	}
	//Quotation End
}
