<?php

/**
 * CodeIgniter
 *
 * An open source application development framework for PHP
 *
 * @package	CodeIgniter
 * @author	Logimax Team
 */
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * All trading related functions and properties
 *
 * @package	CodeIgniter
 */
class Trading
{

	var $CI;
	var $table_name     = 'dt_booking';
	var $sec_table_name = 'dt_customer';

	function __construct()
	{
		$this->CI = get_instance();
		$this->CI->db->query("SET time_zone='+5:30'");
		// Load the common helper for admin logging functions
		$this->CI->load->helper('common');
	}

	function get_customerid($username)
	{
		//Build contents query
		$return_data = array();
		$resultset = $this->CI->db->query("SELECT cus_id, cus_name,cus_active, replace(com_group_name,' ','_') as groupname, prem_group_name, cus_limitenable,customer_type  from dt_customer
								LEFT JOIN dt_customergroupitems ON cgitems_cusid = cus_id
								LEFT JOIN dt_com_group_master ON com_group_id = cgitems_comgroupid
								LEFT JOIN dt_prem_group_master ON prem_group_id = cgitems_comgroupid
								LEFT JOIN dt_booking ON book_cusid = cus_id
								where cus_login_name='" . $username . "'");

		foreach ($resultset->result() as $row) {
			$return_data['cus_id'] = $row->cus_id;
			$return_data['cus_name'] = $row->cus_name;
			$return_data['cus_active'] = $row->cus_active;
			$return_data['customer_type'] = $row->customer_type;
			// $return_data['book_liveordemo'] = $row->book_liveordemo;
			$return_data['cus_limitenable'] = $row->cus_limitenable;
			$return_data['groupname'] = $row->groupname;
			$return_data['prem_group_name'] = $row->prem_group_name;
		}
		return $return_data;
	}

	public function get_tradecommodity_data($userid)
	{
		$return_data = array();
		$commodityquery = $this->CI->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
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
			date_format(pgc.prem_expirydate, '%Y-%m-%d') as prem_expirydate,cuscom.cus_com_amountpurch,is_gst,is_tcs,rcom_sell_tax,rcom_buy_tax,rcom_sell_tcs,rcom_buy_tcs
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
		$rpanelquery = $this->CI->db->query("SELECT id, rate_display, market_status,
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime,
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
		$rpaneldata = $rpanelquery->result_array();
		$rpanelsetting = $this->CI->db->query("SELECT * FROM dt_generalrpsettings");
		$rpanelsettings = array('rpsg_weight' => $rpanelsetting->row()->rpsg_weight, 'rpss_weight' => $rpanelsetting->row()->rpss_weight, 'rpsg_roundoff' => $rpanelsetting->row()->rpsg_roundoff, 'rpss_roundoff' => $rpanelsetting->row()->rpss_roundoff);
		$rpanelbankquery = $this->CI->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff,
											if(showdiff = 1, askdiff, 0) as askdiff
											FROM dt_bankcontractmaster
											LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id
											LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
											WHERE bcontract_status = 1");
		foreach ($rpanelbankquery->result() as $rpbankrow) {
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff);
		}
		$rpanelbankquery->free_result();
		$contractquery = $this->CI->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach ($contractquery->result() as $contractrow) {
			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, 'userpage_status' => $contractrow->userpage_status, 'userpage_displayname' => $contractrow->userpage_displayname);
		}
		$contractquery->free_result();
		$rpanelcommodityquery = $this->CI->db->query("SELECT rcom_id as comid, rcom_disname as dispname,
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


	// function get_customerid($username) {
	// 	//Build contents query
	// 	$return_data = array();
	// 	$resultset = $this->CI->db->query("SELECT cus_id, cus_name,cus_active, replace(com_group_name,' ','_') as groupname, cus_limitenable from dt_customer
	// 							LEFT JOIN dt_customergroupitems ON cgitems_cusid = cus_id
	// 							LEFT JOIN dt_com_group_master ON com_group_id = cgitems_comgroupid
	// 							where cus_login_name='".$username."'");
	// 	foreach ($resultset->result() as $row) {
	// 		$return_data['cus_id'] = $row->cus_id;
	// 		$return_data['cus_name'] = $row->cus_name;
	// 		$return_data['cus_active'] = $row->cus_active;
	// 		$return_data['groupname'] = $row->groupname;
	// 		$return_data['cus_limitenable'] = $row->cus_limitenable;
	// 	}
	// 	return $return_data;
	// }

	public function get_data()
	{
		$query = $this->CI->db->query("SELECT
										book_no,DATE_FORMAT(book_datetime,'%d-%m-%Y %H:%i:%s') as book_datetime, book_rate, cus_id, cus_name, com_name, com_id,
										book_qty, CONCAT(if(book_type=0, 'SELL', 'BUY') , ' - ',  if(ordertype = 0, 'Booking', if(ordertype = 1, 'Order', if(ordertype = 2, 'Alert', '')))) as book_type,
										if(book_status=0,'Request',if(book_status=1,'Confirm',
										if(book_status=2,'Hold','Reject'))) as book_status,book_totalcost ,cus_alise_name,ifnull(cus_city,'-') AS cus_city,book_comid, cus_mobile, cus_company_name,
								ifnull(book_usercomment,'') as book_usercomment
									FROM
										dt_booking, dt_customer, dt_com_master
									WHERE
										book_cusid = cus_id	 AND book_comid = com_id
										AND (book_status=0 || book_status=2)
										AND (ordertype = 0 OR (ordertype = 1 AND orderstatus = 1))
										AND ifnull(delete_status,0) = 0
									ORDER BY
										book_no desc");
		return $query;
	}

	function get_prem_gpsettings($cus_no)
	{
		$records = array();
		$resultset = $this->CI->db->query("SELECT prem_group_limit FROM dt_customergroupitems
				LEFT JOIN dt_prem_group_master ON cgitems_comgroupid = prem_group_id
				WHERE cgitems_cusid ='" . $cus_no . "'");
		foreach ($resultset->result() as $row) {
			$records['prem_group_limit']       = $row->prem_group_limit;
		}
		$resultset->free_result();
		return $records;
	}

	public function get_commodity_data()
	{
		$return_data = array();
		$commodityquery = $this->CI->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
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
		 										date_format(prmgrp.prem_expirydate, '%Y-%m-%d') as prem_expirydate,
												IFNULL(com_sel_active,0) * IFNULL(prem_comsell_active,0) AS cus_com_sell,
			                                    IFNULL(com_buy_active,0) * IFNULL(prem_combuy_active,0) AS cus_com_buy,is_gst,is_tcs,rcom_sell_tax,rcom_buy_tax,rcom_sell_tcs,rcom_buy_tcs,0 as cus_com_amountpurch
		 										FROM dt_com_master AS com
		 										LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1
		 										LEFT JOIN dt_prem_group_master as prgc ON prgc.prem_default = 1
		 										LEFT JOIN dt_prem_group_com as prmgrp ON prmgrp.prem_group_id = prgc.prem_group_id AND com.com_id = prmgrp.prem_id
		 										LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type
		 										LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
		 										WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number");
		$commoditydetails = $commodityquery->result_array();
		$commodityquery->free_result();
		$rpanelquery = $this->CI->db->query("SELECT id, rate_display, market_status,
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime,
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
		$rpaneldata = $rpanelquery->result_array();
		$generalsetting = $this->CI->db->query("SELECT auto_refresh FROM dt_generalsettings");
		$generaldata = $generalsetting->result_array();
		$rpanelsetting = $this->get_rpsettings();
		$rpanelsettings = array('rpsg_weight' => $rpanelsetting->row()->rpsg_weight, 'rpss_weight' => $rpanelsetting->row()->rpss_weight, 'rpsg_roundoff' => $rpanelsetting->row()->rpsg_roundoff, 'rpss_roundoff' => $rpanelsetting->row()->rpss_roundoff);
		$rpanelbankquery = $this->CI->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff,
											if(showdiff = 1, askdiff, 0) as askdiff
											FROM dt_bankcontractmaster
											LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id
											LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
											WHERE bcontract_status = 1");
		foreach ($rpanelbankquery->result() as $rpbankrow) {
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff, "tcs_tax" => $rpbankrow->tcs_tax);
		}
		$rpanelbankquery->free_result();
		$contractquery = $this->CI->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach ($contractquery->result() as $contractrow) {
			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, 'userpage_status' => $contractrow->userpage_status, 'userpage_displayname' => $contractrow->userpage_displayname);
		}
		$contractquery->free_result();
		$rpanelcommodityquery = $this->CI->db->query("SELECT rcom_id as comid, rcom_disname as dispname,
													contract_symbol mcxcontract,
													rcom_comtype as comtype, ifnull(trade_type,0) as tradetype,
													ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff,
													ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate , rcom_sell_diff_type,
													rcom_buy_diff_type, rcom_sell_callpurity,
													rcom_buy_callpurity
													FROM dt_rpanelcommodities
													LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol
													LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol
													LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id
													WHERE rcom_status = 1");
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate, "rcom_sell_diff_type" => $commodityrow->rcom_sell_diff_type, "rcom_buy_diff_type" => $commodityrow->rcom_buy_diff_type, "rcom_sell_callpurity" => $commodityrow->rcom_sell_callpurity, "rcom_buy_callpurity" => $commodityrow->rcom_buy_callpurity);
		}
		$rpanelcommodityquery->free_result();
		$return_data = array('commoditydetails' => $commoditydetails, 'rpaneldata' => $rpaneldata[0], 'generaldata' => $generaldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelbank' => $rpanel_display_bankrates, 'rpanel_contracts' => $rpanel_display_contracts, 'rpanel_commodities' => $rpanel_display_commodities, "lsdetails" => array('url' => Globals::$lsrateurl, 'adapter' => Globals::$lsrateadapter, 'provider' => Globals::$lsrateprovider, 'username' => Globals::$lsrateusername));

		return $return_data;
	}

	// public function get_commodity_data()
	// {
	// 	$return_data = array();
	// 	$commodityquery = $this->CI->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
	// 										rcom_disname as displyname, rcom_mcxsymbol as mcxsymbol,
	// 										rcom_banksymbol as banksymbol, rcom_comtype as com_type,
	// 										com_tax, com_octroi, com_stamduty, com_roundoff,
	// 										com_weight, com_other_charges, rcom_id as rcomid,
	// 										trade_type, sell_diff, buy_diff, sell_rate,
	// 										com_correction_type, com_is_coin, com_order_number,
	// 										com_display_purity, com_margin_type, com_margin_value ,
	// 										com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type,
	// 										com_sel_active, com_buy_active, com_delverydays,
	// 										date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
	// 										allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type,
	// 										TRIM(com_bar_quantity)+0 AS com_bar_quantity, com_unit,
	// 										prmgrp.prem_comsell_active as prem_comsell_active,
	// 										prmgrp.prem_comselretail_active as prem_comselretail_active,
	// 										prmgrp.prem_combuy_active as prem_combuy_active,
	// 										prmgrp.prem_sel_premium as prem_sel_premium,
	// 										prmgrp.prem_buy_premium as prem_buy_premium,
	// 										prmgrp.prem_selretail_premium as prem_selretail_premium,
	// 										date_format(prmgrp.prem_expirydate, '%Y-%m-%d') as prem_expirydate
	// 										FROM dt_com_master AS com
	// 										LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1
	// 										LEFT JOIN dt_prem_group_master as prgc ON prgc.prem_default = 1
	// 										LEFT JOIN dt_prem_group_com as prmgrp ON prmgrp.prem_group_id = prgc.prem_group_id AND com.com_id = prmgrp.prem_id
	// 										LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type
	// 										LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
	// 										WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number");
	// 	$commoditydetails = $commodityquery->result_array();
	// 	$commodityquery->free_result();
	// 	$rpanelquery = $this->CI->db->query("SELECT id, rate_display, market_status,
	// 									date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime,
	// 									ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
	// 	$rpaneldata = $rpanelquery->result_array();
	// 	$rpanelsetting = $this->CI->db->query("SELECT * FROM dt_generalrpsettings");
	// 	$rpanelsettings = array('rpsg_weight' => $rpanelsetting->row()->rpsg_weight, 'rpss_weight' => $rpanelsetting->row()->rpss_weight, 'rpsg_roundoff' => $rpanelsetting->row()->rpsg_roundoff, 'rpss_roundoff' => $rpanelsetting->row()->rpss_roundoff);
	// 	$rpanelbankquery = $this->CI->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff,
	// 										if(showdiff = 1, askdiff, 0) as askdiff
	// 										FROM dt_bankcontractmaster
	// 										LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id
	// 										LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
	// 										WHERE bcontract_status = 1");
	// 	foreach($rpanelbankquery->result() as $rpbankrow){
	// 		$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff, "tcs_tax" => $rpbankrow->tcs_tax);

	// 		// $rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff,"bid_premium" => $rpbankrow->bid_premium, "exchange_ask" => $rpbankrow->exchange_ask, "exchange_bid" => $rpbankrow->exchange_bid, "ctype" => $rpbankrow->ctype);
	// 	}
	// 	$rpanelbankquery->free_result();
	// 	$contractquery = $this->CI->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
	// 	foreach($contractquery->result() as $contractrow){
	// 		$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, "userpage_displayname" => $contractrow->userpage_displayname, "userpage_status" => $contractrow->userpage_status);
	// 	}
	// 	$contractquery->free_result();
	// 	$rpanelcommodityquery = $this->CI->db->query("SELECT rcom_id as comid, rcom_disname as dispname,
	// 												contract_symbol mcxcontract,
	// 												rcom_comtype as comtype, ifnull(trade_type,0) as tradetype,
	// 												ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff,
	// 												ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate
	// 												FROM dt_rpanelcommodities
	// 												LEFT JOIN dt_mcxcontractmaster ON contract_id = rcom_mcxsymbol
	// 												LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol
	// 												LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id
	// 												WHERE rcom_status = 1");
	// 	foreach($rpanelcommodityquery->result() as $commodityrow){
	// 		$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate);
	// 	}
	// 	$rpanelcommodityquery->free_result();
	// 	// 'url' => "http://50.28.99.198:8080"
	// 	//$return_data = array('commoditydetails' => $commoditydetails, 'rpaneldata' => $rpaneldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelbank' => $rpanel_display_bankrates, 'rpanel_contracts' => $rpanel_display_contracts, 'rpanel_commodities' => $rpanel_display_commodities, "lsdetails" => array('url' => "http://103.138.189.206:8080", 'adapter' => "WLSTOCKLIST_REMOTE", 'provider' => "WLQUOTE_ADAPTER", 'username' => "lmxwinbullliteapp"));
	// 	$return_data = array('commoditydetails' => $commoditydetails, 'rpaneldata' => $rpaneldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelbank' => $rpanel_display_bankrates, 'rpanel_contracts' => $rpanel_display_contracts, 'rpanel_commodities' => $rpanel_display_commodities, "lsdetails" => array('url' => "http://logimaxrates.in:8080", 'adapter' => "OSWLSTOCKLIST_REMOTE", 'provider' => "OSWLQUOTE_ADAPTER", 'username' => "lmxwinbullliteapp"));

	// 	return $return_data;
	// }


	// public function display_commodity_data()
	// {
	// 	$commoditydetails = array();
	// 	$commodityquery = $this->CI->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
	// 										rcom_disname as displyname, rcom_mcxsymbol as mcxsymbol,
	// 										rcom_banksymbol as banksymbol, rcom_comtype as com_type,
	// 										com_tax, com_octroi, com_stamduty, com_roundoff,
	// 										com_weight, com_other_charges, rcom_id as rcomid,
	// 										trade_type, sell_diff, buy_diff, sell_rate,
	// 										com_correction_type, com_is_coin, com_order_number,
	// 										com_display_purity, com_margin_type, com_margin_value ,
	// 										com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type,
	// 										com_sel_active, com_buy_active, com_delverydays,
	// 										date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
	// 										allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type,
	// 										TRIM(com_bar_quantity)+0 AS com_bar_quantity, com_unit,
	// 										prmgrp.prem_comsell_active as prem_comsell_active,
	// 										prmgrp.prem_comselretail_active as prem_comselretail_active,
	// 										prmgrp.prem_combuy_active as prem_combuy_active,
	// 										prmgrp.prem_sel_premium as prem_sel_premium,
	// 										prmgrp.prem_buy_premium as prem_buy_premium,
	// 										prmgrp.prem_selretail_premium as prem_selretail_premium,
	// 										date_format(prmgrp.prem_expirydate, '%Y-%m-%d') as prem_expirydate
	// 										FROM dt_com_master AS com
	// 										LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1
	// 										LEFT JOIN dt_prem_group_master as prgc ON prgc.prem_default = 1
	// 										LEFT JOIN dt_prem_group_com as prmgrp ON prmgrp.prem_group_id = prgc.prem_group_id AND com.com_id = prmgrp.prem_id
	// 										LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type
	// 										LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
	// 										WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number");
	// 	$commoditydetails['commoditydetails'] = $commodityquery->result_array();
	// 	$commodityquery->free_result();
	// 	$rpanel_display_commodities = array();
	// 	$rpanelcommodityquery = $this->CI->db->query("SELECT rcom_id as comid, rcom_disname as dispname,
	// 												contract_symbol mcxcontract,
	// 												rcom_comtype as comtype, ifnull(trade_type,0) as tradetype,
	// 												ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff,
	// 												ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate
	// 												FROM dt_rpanelcommodities
	// 												LEFT JOIN dt_mcxcontractmaster ON contract_id = rcom_mcxsymbol
	// 												LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol
	// 												LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id
	// 												WHERE rcom_status = 1");
	// 	foreach($rpanelcommodityquery->result() as $commodityrow){
	// 		$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate);
	// 	}
	// 	$commoditydetails['rpanel_commodities'] = $rpanel_display_commodities;
	// 	$rpanelcommodityquery->free_result();
	// 	return $commoditydetails;
	// }

	public function display_commodity_data()
	{
		$commoditydetails = array();
		$commodityquery = $this->CI->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
		rcom_disname as displyname, rcom_mcxsymbol as mcxsymbol,
		rcom_banksymbol as banksymbol, rcom_comtype as com_type,
		IFNULL(com_tax, 0) as com_tax, IFNULL(com_octroi, 0) as com_octroi, IFNULL(com_stamduty, 0) as com_stamduty, com_roundoff,
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
		date_format(prmgrp.prem_expirydate, '%Y-%m-%d') as prem_expirydate,
		IFNULL(com_sel_active,0) * IFNULL(prem_comsell_active,0) AS cus_com_sell,
		IFNULL(com_buy_active,0) * IFNULL(prem_combuy_active,0) AS cus_com_buy,
		IFNULL(rcon.is_gst, 0) as is_gst, IFNULL(rcon.is_tcs, 0) as is_tcs,
		IFNULL(rpc.rcom_sell_tax, 0) as rcom_sell_tax, IFNULL(rpc.rcom_buy_tax, 0) as rcom_buy_tax,
		IFNULL(rpc.rcom_sell_tcs, 0) as rcom_sell_tcs, IFNULL(rpc.rcom_buy_tcs, 0) as rcom_buy_tcs,
		0 as cus_com_amountpurch
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
		$rpanelcommodityquery = $this->CI->db->query("SELECT rcom_id as comid, rcom_disname as dispname,
													contract_symbol mcxcontract,
													rcom_comtype as comtype, ifnull(trade_type,0) as tradetype,
													ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff,
													ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate, rcom_sell_diff_type,
													rcom_buy_diff_type, rcom_sell_callpurity,
													rcom_buy_callpurity
													FROM dt_rpanelcommodities
													LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol
													LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol
													LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id
													WHERE rcom_status = 1");
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate, "rcom_sell_diff_type" => $commodityrow->rcom_sell_diff_type, "rcom_buy_diff_type" => $commodityrow->rcom_buy_diff_type, "rcom_sell_callpurity" => $commodityrow->rcom_sell_callpurity, "rcom_buy_callpurity" => $commodityrow->rcom_buy_callpurity);
		}
		$commoditydetails['rpanel_commodities'] = $rpanel_display_commodities;
		$rpanelcommodityquery->free_result();
		return $commoditydetails;
	}
	function get_rpsettings()
	{
		$resultset = $this->CI->db->query("select * from dt_generalrpsettings");
		return $resultset;
	}
	function gettradecommodities($userid)
	{
		$resultset = $this->CI->db->query("select * from dt_customer where cus_id ='" . $userid . "'");
		if ($resultset->num_rows() == 1) {
			foreach ($resultset->result() as $row) {
				//checking for whether the user status is active
				if ($row->cus_active == 1) {
					//checking for whether the user is a life time membet
					if ($row->cus_is_life_time == 1 || date("Y-m-d") <= $row->cus_valid_till) {

						$client     =  empty($this->CI->config->item('client')) ? '' : trim($this->CI->config->item('client'));

						$available_balance = $this->get_availablebalance($userid);

						$settingQ = $this->CI->db->query("SELECT gold_tol, silver_tol, trade_enable, display_margin, has_pendinglimits, trade_on, trade_on_time, trade_off, trade_off_time,limit_enable,clientlimit_enable FROM dt_generalsettings");
						$setting_data = $settingQ->row();
						$gold_tol = explode("#", $setting_data->gold_tol);
						$silver_tol = explode("#", $setting_data->silver_tol);
						$market_on = $setting_data->trade_on == 1 &&  $setting_data->trade_on_time != "" ? "Market On : " . date("g:i A", strtotime($setting_data->trade_on_time)) : "";
						$market_off = $setting_data->trade_off == 1 &&  $setting_data->trade_off_time != "" ? "Market Off : " . date("g:i A", strtotime($setting_data->trade_off_time)) : "";

						$settings = array('goldhigh_tol' => isset($gold_tol[0]) ? $gold_tol[0] : 0, 'goldlow_tol' => isset($gold_tol[1]) ? $gold_tol[1] : 0, 'silverhigh_tol' => isset($silver_tol[0]) ? $silver_tol[0] : 0, 'silverlow_tol' => isset($silver_tol[1]) ? $silver_tol[1] : 0, 'trade_enable' => $setting_data->trade_enable, 'limit_enable' => $setting_data->limit_enable, 'clientlimit_enable' => $setting_data->clientlimit_enable, 'display_margin' => $setting_data->display_margin, 'has_pendinglimits' => $setting_data->has_pendinglimits, 'market_on' => $market_on, 'market_off' => $market_off);

						$cussettingQ = $this->CI->db->query("SELECT cus_limitenable FROM dt_customer WHERE cus_id = '" . $userid . "'");
						$cussetting_data = $cussettingQ->row();
						$cus_settings = array('cuslimit_enable' => $cussetting_data->cus_limitenable);

						$returndata     = array();
						$comgrouparray  = array();
						$margin_array   = array();
						$trade_enable = 0;
						$gold_min_qty = 0;
						$gold_max_qty = 0;
						$silver_min_qty = 0;
						$silver_max_qty = 0;
						$has_minqty = 0;
						$has_maxqty = 0;

						$comgroupquery  = $this->CI->db->query("SELECT comm.com_id as comid, comm.com_name as comname, rcom_comtype as comtype,
														   com_weight as weight,com_unit, com_bar_quantity as barqty, com_margin_type, com_margin_value,
														   IFNULL(cus_com_openqty,0) as cus_com_openqty, IFNULL(com_sel_trade,0) as  com_sel_trade, IFNULL(com_buy_trade, 0) as com_buy_trade,
														   IFNULL(cus_com_openqtytype,0) as cus_com_openqtytype,
														   IFNULL(cus_com_smoq,0) as cus_com_smoq,IFNULL(cus_com_pmoq,0) as cus_com_pmoq,
														   IFNULL(cus_com_status_sell,0) as cus_com_status_sell,
														   IFNULL(cus_com_status_buy,0) as cus_com_status_buy, cus_com_amountpurch, com_order_number, allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type
														   FROM dt_customergroupitems cusgrp
														   LEFT JOIN dt_com_group_com comgrp ON comgrp.com_group_id = cusgrp.cgitems_comgroupid
														   LEFT JOIN dt_cus_commodity cuscom ON cuscom.cus_com_cus_id = cusgrp.cgitems_cusid
														   AND cuscom.cus_com_id  = comgrp.com_id
														   LEFT JOIN dt_com_master comm ON comm.com_id = comgrp.com_id
														   LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
														   WHERE cgitems_cusid = '" . $userid . "' AND ((com_sel_active = 1 AND IFNULL(com_sel_trade,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1 AND IFNULL(com_buy_trade,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");

						if ($comgroupquery->num_rows() > 0) {
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
							from dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = '" . $userid . "'";

							$resultset = $this->CI->db->query($str_query);

							foreach ($resultset->result() as $limit) {
								$has_gmaxqty      = $limit->has_gmaxqty;
								$gold_max_qty      = $limit->gold_max_qty;
								$has_smaxqty     = $limit->has_smaxqty;
								$silver_max_qty = $limit->silver_max_qty;
								$has_gminqty     = $limit->has_gminqty;
								$gold_min_qty     = $limit->gold_min_qty;
								$has_sminqty     = $limit->has_sminqty;
								$silver_min_qty = $limit->silver_min_qty;
								$has_gallot_qty = $limit->has_gallot_qty;
								$gold_allot_qty = $limit->gold_allot_qty;
								$has_sallot_qty     = $limit->has_sallot_qty;
								$silver_allot_qty     = $limit->silver_allot_qty;
							}

							foreach ($comgroupquery->result() as $row) {
								$minmax = "";
								$min = "";
								$max = "";
								if ($row->comtype == 1) {
									$cus_minQty = $silver_min_qty;
									$cus_maxQty = $silver_max_qty;
									$has_minqty = $has_sminqty;
									$has_maxqty = $has_smaxqty;
									$maxallotedqty = (float)($silver_allot_qty) . " Kg";
									$has_allot_qty      = $has_sallot_qty;
									$min = $has_sminqty == 1 ? (float)($silver_min_qty) . " Kg" : "";
									$max = $has_smaxqty == 1 ? (float)($silver_max_qty) . " Kg" : "";
									$minmax     = $has_sminqty == 1 ? $minmax . (" Min: " . (float)($silver_min_qty) . " Kg") : $minmax;
									$minmax     = $has_smaxqty == 1 ? $minmax . (" Max: " . (float)($silver_max_qty) . " Kg") : $minmax;
								} else if ($row->comtype == 0) {
									$cus_minQty = $gold_min_qty;
									$cus_maxQty = $gold_max_qty;
									$has_minqty = $has_gminqty;
									$has_maxqty = $has_gmaxqty;
									$maxallotedqty = (float)($gold_allot_qty * 1000) . " Gm";
									$has_allot_qty = $has_gallot_qty;
									$min = $has_gminqty == 1 ? (float)($gold_min_qty * 1000) . " Gm" : "";
									$max = $has_gmaxqty == 1 ? (float)($gold_max_qty * 1000) . " Gm" : "";
									$minmax     = $has_gminqty == 1 ? $minmax . (" Min: " . (float)($gold_min_qty * 1000) . " Gm") : $minmax;
									$minmax     = $has_gmaxqty == 1 ? $minmax . (" Max: " . (float)($gold_max_qty * 1000) . " Gm") : $minmax;
								}
								if ($row->bar_selection == 1) {

									$combarno = $row->com_bar_no;
								} else {

									$combarno = 0;
								}
								$comgrouparray[] = array('comid' => $row->comid, 'comname' => $row->comname, 'comtype' => $row->comtype, 'cus_com_openqty' => $row->cus_com_openqty, 'com_buy_trade' => $row->com_buy_trade, 'com_sel_trade' => $row->com_sel_trade, 'cus_com_openqtytype' => $row->cus_com_openqtytype, 'has_minqty' => $has_minqty, 'cus_minQty' => $cus_minQty, 'has_maxqty' => $has_maxqty, 'cus_maxQty' => $cus_maxQty, 'cus_com_status_sell' => $row->cus_com_status_sell, 'cus_com_status_buy' => $row->cus_com_status_buy, 'cus_com_amountpurch' => $row->cus_com_amountpurch, 'weight' => $row->weight, 'com_unit' => $row->com_unit, 'barqty' => $row->barqty, 'com_margin_type' => $row->com_margin_type, 'com_margin_value' => $row->com_margin_value, 'minmax' => $minmax, 'min' => $min, 'max' => $max, 'has_allot_qty' => $has_allot_qty, 'maxallotedqty' => $maxallotedqty, 'allowed_decimals' => $row->allowed_decimals, 'bar_selection' => $row->bar_selection, 'com_bar_no' => $combarno, 'com_bar_type' => $row->com_bar_type);
							}

							$returndata = array('status' => 1, 'error' => $this->CI->db->error(), 'success' => true, 'message' => 'Reterived Successfully', 'settings' => $settings, 'cus_settings' => $cus_settings, 'comgroupData' => $comgrouparray, 'client' => $client, 'available_balance' => (float)$available_balance, 'user_status' => 1);
						} else {
							$returndata = array('status' => 0, 'error' => 'No data found', 'success' => true, 'message' => 'No data found', 'settings' => $settings, 'cus_settings' => $cus_settings, 'comgroupData' => $comgrouparray, 'client' => $client, 'available_balance' => (float)$available_balance, 'user_status' => 1);
						}
					} else {
						$returndata = array('status' => 0, 'error' => '', 'success' => true, 'message' => 'Account Expired.Please contact administrator.', 'settings' => '', 'cus_settings' => '', 'comgroupData' => '', 'client' => '', 'available_balance' => '', 'user_status' => 0);
					}
				} else {
					$returndata = array('status' => 0, 'error' => '', 'success' => true, 'message' => 'Your account not yet activated. Please try again later..', 'settings' => '', 'cus_settings' => '', 'comgroupData' => '', 'client' => '', 'available_balance' => '', 'user_status' => 0);
				}
			}
		} else {
			$returndata = array('status' => 0, 'error' => '', 'success' => true, 'message' => 'Account Expired', 'settings' => '', 'cus_settings' => '', 'comgroupData' => '', 'client' => '', 'available_balance' => '', 'user_status' => 0);
		}

		return $returndata;
	}
	public function get_entry_record($record_id) //Fetch entry record
	{
		//Build contents query
		$query = "SELECT book_no, book_cusid, book_comid, book_type, book_rate, book_comweight, book_datetime, book_totalcost, book_qty, book_no_bar, book_useripaddress FROM dt_booking WHERE book_no=" . $record_id;
		$result_set = $this->CI->db->query($query);

		foreach ($result_set->result() as $row) {
			$records['book_no']               = $row->book_no;
			$records['book_cusid']           = $row->book_cusid;
			$records['book_comid']           = $row->book_comid;
			$records['book_type']           = $row->book_type;
			$records['book_rate']              = $row->book_rate;
			$records['book_comweight']       = $row->book_comweight;
			$records['book_datetime']       = $row->book_datetime;
			$records['book_totalcost']       = $row->book_totalcost;
			$records['book_qty']               = $row->book_qty;
			$records['book_no_bar']            = $row->book_no_bar;
			$records['book_useripaddress']    = $row->book_useripaddress;
			$records['db_error_msg']        = "";
		}
		return $records;
	}
	public function update_order($receivedata)
	{
		//Get previous old records to compare and update in log table
		$oldRecord = $this->get_entry_record($receivedata['book_no']);

		$return_data["status"]        = 0;
		$tradable = 0;
		$update_ratealert_url    =  trim(Globals::$updateratealert ? Globals::$updateratealert : '');
		$rate_url                 =  trim(Globals::$getrates ? Globals::$getrates : '');
		$client                      =  trim(Globals::$client ? Globals::$client : '');
		if ($update_ratealert_url != '' && $rate_url != '' && $client != '') {
			$book_cusid = $receivedata['book_cusid'];
			$book_comid = $receivedata['book_comid'];
			$book_no     = $receivedata['book_no'];
			$book_qty     = $receivedata['book_qty'];
			$book_no_bar     = $receivedata['book_no_bar'];

			$previousBookedQty     = 0;
			$booked_rate         = 0;
			$book_type             = "";

			$resultset = $this->CI->db->query("SELECT book_qty, book_type, book_rate FROM dt_booking WHERE book_no = " . $book_no . "  AND ordertype = 1 AND orderstatus = 0");
			foreach ($resultset->result_array() as $row) {
				$previousBookedQty  =  $row['book_qty'];
				$book_type             =  $row['book_type'];
				$booked_rate        =  $row['book_rate'];
			}

			$receivedata['book_type'] = $book_type;
			$receivedata['request_type'] = 1;

			$data = json_decode($this->get_available_qty($receivedata));
			$book_rate         = $receivedata['book_rate'];
			$livePrice = 0;

			$rate_array = $this->get_ratearray($rate_url, $client);

			foreach ($rate_array as $ratevalues) {
				if ($ratevalues['com_id'] == $receivedata['book_comid']) {
					$tradable = isset($ratevalues['tradable']) ? 1 : 0;
					if ($book_type == 0) {
						$livePrice = $ratevalues['selling_rate'];
					} else if ($book_type == 1) {
						$livePrice = $ratevalues['buying_rate'];
					}
				}
			}
			if ($receivedata['request_amt_wt'] == 1) {
				$totalcost         =  $receivedata['book_totalcost'];
			} else {
				$totalcost         =  round(($book_rate / $data->com_weight) * $book_qty * 1000, 2);
			}


			$limitcancel_tol = $data->limitcancel_tol;

			if ($tradable == 1 && $previousBookedQty > 0 && $livePrice > 0 && $totalcost > 0) {
				if ($data->trade_enable == 1) {
					if ($limitcancel_tol > 0 ? ($book_type == 0 ? ($book_rate > $booked_rate ? true : ($booked_rate + $limitcancel_tol) < $livePrice) : ($book_rate < $booked_rate ? true : ($booked_rate - $limitcancel_tol) > $livePrice)) : true) {
						if (($data->has_minqty == 1 ? ($book_qty >= $data->min_qty) : true) && ($data->has_maxqty == 1 ? ($book_qty <= $data->max_qty) : true) && ($data->has_allot_qty == 1 ? ($data->total_open_qty - $previousBookedQty + $book_qty <= $data->max_allot_qty) : true)) {
							$update_data['book_datetime']         = date('Y-m-d H:i:s');
							$update_data['book_totalcost']         = $totalcost;
							$update_data['book_qty']             = $book_qty;
							$update_data['book_rate']             = $book_rate;
							$update_data['book_no_bar']            = $book_no_bar;
							$update_data['book_request_amtwt']    = $receivedata['request_amt_wt'];
							$update_data['book_usercomment']    = isset($receivedata['book_usercomment']) ? $receivedata['book_usercomment'] : NULL;
							$status = $this->CI->db->update('dt_booking', $update_data, array("book_no" => $book_no, "book_status" => 0));
							if ($status) {
								$requestdata = array(
									'client' => $client,
									'book_cusid' => $book_cusid,
									'book_comid' => $book_comid,
									'book_type'  => $book_type,
									'book_rate'  => $book_rate,
									'book_qty'   => $book_qty,
									'book_no'    => $book_no,
									'alert_type' => 0
								);

								$field_string = http_build_query($requestdata);
								curl_helper($update_ratealert_url, $field_string);
								//Update in Log
								$receivedata['log_totalcost'] = $totalcost;
								$this->updateLimitLog($oldRecord, $receivedata);
								$return_data["status"]        = 1;
								$return_data["message"]        = "Your limit has been updated";
							} else {
								$return_data["message"]        = "Update failed. Try again later";
							}
						} else if ($data->has_minqty == 1 ? ($book_qty < $data->min_qty) : false) {
							$return_data["message"]        = "Less than minimum order qty (" . $data->minqty_type . ")";
						} else if ($data->has_maxqty == 1 ? ($book_qty > $data->max_qty) : false) {
							$return_data["message"]        = "Greater than maximum order qty (" . $data->maxqty_type . ")";
						} else if ($data->has_maxqty == 1 ? ($data->total_open_qty - $previousBookedQty + $book_qty > $data->max_allot_qty) : false) {
							$return_data["message"]        = "You have reached max. qty for booking (" . $data->maxallotqty_type . ")";
						} else {
							$return_data["message"]        = "Error occured in booking.Please try again later.";
						}
					} else {
						$return_data["message"]        = "Order can not be cancelled or updated when Live price comes near to your Limit Order Price";
					}
				} else {
					$return_data["message"]        = "Currently trade has been disabled.Please try again later.";
				}
			} else {
				if ($tradable == 0)
					$return_data["message"]        = "Error occured.No rate update.Please try again.";
				else
					$return_data["message"]        = "Error occured in updating your order.Please try again later.";
			}
		} else {
			$return_data["message"]        = "Error occured.Please contact administrator.";
		}

		return $return_data;
	}
	public function get_ratearray($rate_url, $client)
	{
		$requestdata = array('client' => $client);
		$field_string = http_build_query($requestdata);
		$rate_json = curl_helper($rate_url, $field_string);
		$rate_array = json_decode($rate_json, true);
		return $rate_array;
	}
	public function insert_record($receivedata)
	{
		// print_r($receivedata);exit;
		/* $checkmetl_weight= $this->checkgold_weight($receivedata['book_comid'],$receivedata['book_qty'],$receivedata['book_comweight'],$receivedata['mobile']);
		if($checkmetl_weight){ */
		$livePrice = 0;
		$tradable = 0;
		$cur_date = date('Y-m-d H:i:s');
		$return_data["status"]    =  0;

		$create_ratealert_url    =  trim(Globals::$createratealert ? Globals::$createratealert : '');
		$rate_url                 =  trim(Globals::$getrates ? Globals::$getrates : '');
		$client                      =  trim(Globals::$client ? Globals::$client : '');
		if ($receivedata['request_type'] == 1 ? ($create_ratealert_url != '' && $rate_url != '' && $client != '') : $rate_url != '') {
			$rate_array = $this->get_ratearray($rate_url, $client);
			foreach ($rate_array as $ratevalues) {
				if ($ratevalues['com_id'] == $receivedata['book_comid']) {
					$tradable = isset($ratevalues['tradable']) ? 1 : 0;
					if ($receivedata['book_type'] == 0) {
						$livePrice = $ratevalues['selling_rate'] - $receivedata['discount_amt'];
					} else if ($receivedata['book_type'] == 1) {
						$livePrice = $ratevalues['buying_rate'] - $receivedata['discount_amt'];
					} else if ($receivedata['book_type'] == 2) {
						$livePrice = $ratevalues['retail_rate'] - $receivedata['discount_amt'];
					}
				}
			}

			// Booking Log
			$log = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
				"Received Data: " . print_r($receivedata, true) . PHP_EOL .
				"Rate Array: " . print_r($rate_array, true) . PHP_EOL .
				"-------------------------" . PHP_EOL;

			$logFile = $_SERVER['DOCUMENT_ROOT'] . "/logs/booking_log";

			file_put_contents($logFile, $log, FILE_APPEND);

			$data = json_decode($this->get_available_qty($receivedata));

			//$booking_rate 	=  $receivedata['request_type'] == 0 ? ($livePrice) : ($receivedata['book_rate']);
			if ($receivedata['book_by'] == 3)
				$booking_rate = $receivedata['book_rate'];
			else if ($receivedata['book_by'] == 4) {
				if ($receivedata['book_pricefrom'] == 2) {
					$booking_rate = $receivedata['book_rate'];
				} else {
					$booking_rate = $receivedata['request_type'] == 0 ? ($receivedata['book_type'] == 0 ? ($receivedata['book_rate'] >= $livePrice ? $receivedata['book_rate'] : $livePrice) : ($receivedata['book_rate'] <= $livePrice ? $receivedata['book_rate'] : $livePrice)) : $receivedata['book_rate'];
				}
			} else {
				$booking_rate = $receivedata['request_type'] == 0 ? ($receivedata['book_type'] == 0 ? ($receivedata['book_rate'] >= $livePrice ? $receivedata['book_rate'] : $livePrice) : ($receivedata['book_rate'] <= $livePrice ? $receivedata['book_rate'] : $livePrice)) : $receivedata['book_rate'];
			}

			// $booking_rate_wtdis = $receivedata['request_type'] == 0 ? ($receivedata['book_type'] == 0 ? ($livePrice + $receivedata['discount_amt']) : ($livePrice - $receivedata['discount_amt'])) : ($receivedata['book_rate']);

			$com_type         =  $data->com_type;
			$com_weight     =  $data->com_weight;
			$booked_qty     =  floatval($receivedata['book_qty']);
			$book_bar_type  =  $receivedata['com_bar_type'];
			if ($receivedata['request_amt_wt'] == 1) {
				$totalcost         =  floatval($receivedata['book_totalcost']);
			} else {
				$totalcost         =  round(((float) $booking_rate / (float) $com_weight) * $booked_qty * 1000, 2);
			}

			$has_margin = $data->display_margin == 1 && $receivedata['request_type'] == 0 && $data->confirmation_for == 1 ? true : false;

			//Margin calculation
			$margin_hold = 0;
			if ($has_margin) {
				if ($data->margin_type == 0)
					$margin_hold = floatval($totalcost) * floatval($data->margin) / 100;
				else
					$margin_hold = $booked_qty * floatval($data->margin);
			}
			if ($tradable == 1 && $totalcost > 0 && $booked_qty > 0) {
				if ($receivedata['book_by'] == 3)
					$confirm_type = $data->confirmation_admin;
				else
					$confirm_type = $data->confirmation_for;

				if ($data->cus_active == 0) {
					$return_data["message"]    = "Your account has been deactivated. Please contact the administrator.";
				} else if ($data->trade_enable == 1) {
					if (($data->has_minqty == 1 ? ($booked_qty >= $data->min_qty) : true) && ($data->has_maxqty == 1 ? ($booked_qty <= $data->max_qty) : true) && ($data->has_allot_qty == 1 ? ($data->total_open_qty + $booked_qty <= $data->max_allot_qty) : true) && ($receivedata['request_type'] == 1 ? ($data->pending_order + 1 <=  $data->max_order) : true) && ($has_margin ? $data->available_balance >= $margin_hold : true)) {

						$insert_data['book_cusid']            =     $receivedata['book_cusid'];
						$insert_data['book_datetime']        =    $cur_date;
						$insert_data['book_comid']            =     $receivedata['book_comid'];
						$insert_data['book_qty']            =     $booked_qty;
						$insert_data['book_bar_type']        =     $book_bar_type;
						$insert_data['book_rate']              =     $booking_rate;
						$insert_data['order_actualprice']     =     $booking_rate;
						$insert_data['book_liveprice']         =     $livePrice;
						$insert_data['book_type']              =     $receivedata['book_type'];
						$insert_data['book_totalcost']        =     $totalcost;
						$insert_data['book_comweight']        =     $com_weight;
						$insert_data['book_no_bar']            =     $receivedata['book_no_bar'];
						$insert_data['book_comtype']          =     $data->com_type;
						$insert_data['book_marginhold']        =     $margin_hold;
						$insert_data['book_margin']            =     $receivedata['margin'];
						$insert_data['book_margintype']        =     $receivedata['margin_type'];
						$insert_data['book_status']              =     0;
						$insert_data['book_marginstatus']     =     0;
						$insert_data['book_hedgqty']        =    0;
						$insert_data['book_physicalqty']    =     0;
						$insert_data['ordertype']            =     $receivedata['request_type'];
						$insert_data['book_deviceid']        =     isset($receivedata['book_deviceid']) ? $receivedata['book_deviceid'] : NULL;
						$insert_data['book_by']                =    $receivedata['book_by'];
						//$insert_data['book_premium']		=	$data->book_premium;
						$insert_data['user_agent']            =    isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : NULL;
						$insert_data['book_request_amtwt']    =     $receivedata['request_amt_wt'];
						$insert_data['book_usercomment']    =     isset($receivedata['book_usercomment']) ? $receivedata['book_usercomment'] : NULL;
						$insert_data['book_deliverydate']    =    date('Y-m-d', strtotime($receivedata['book_deliverydate']));

						if ($receivedata['request_type'] == 1) {
							//$insert_data['orderplacedtime'] = date('Y-m-d H:i:s');
							$insert_data['ordervalidity']    = 0;
							$insert_data['orderstatus']        = 0;
							$insert_data['book_status']          = 0;
						} else if ($receivedata['request_type'] == 0 && $data->confirmation_for == 1) {
							$insert_data['book_status']           = 1;
							$insert_data['book_fixtype']      = 0;
							$insert_data['book_marginqty']      = $booked_qty;
							$insert_data['book_confirmedon'] = $cur_date;
							$return_data["confirm_type"] = 1;
						} else if ($receivedata['request_type'] == 0 && $data->confirmation_for == 0) {
							$insert_data['book_status']           = 3;
							$insert_data['book_confirmedon'] = $cur_date;
							$return_data["confirm_type"] = 0;
						} else if ($receivedata['request_type'] == 0 && $data->confirmation_for == 2) {
							$insert_data['book_status']           = 2;
							$insert_data['book_confirmedon'] = $cur_date;
							$return_data["confirm_type"] = 2;
						}

						$insert_data['book_useripaddress']      = $_SERVER['SERVER_ADDR'];
						$insertStatus = $this->CI->db->insert("dt_booking", $insert_data);
						$return_data["book_no"] = $this->CI->db->insert_id();

						if ($insertStatus) {
							if (
								(($data->is_hedge_gold == 1 || $data->is_hedge_silver == 1)
									&& $confirm_type == 1)
								&& ($receivedata['book_by'] != 3 && $receivedata['book_by'] != 4)
							) {
								require_once(__DIR__ . '/dynamic_hedge_helper.php');

								$orderwt = isset($booked_qty) ? ($booked_qty * 1000) : 0;
								$metalType = (int)$data->com_type;
								$remaining_qty = $orderwt;

								$hedge_configs = get_all_hedge_configs($metalType);

								if (!empty($hedge_configs)) {
									foreach ($hedge_configs as $hedge_config) {
										if ($remaining_qty <= 0) break;

										if ($remaining_qty >= $hedge_config['hm_fromslots'] && $remaining_qty <= $hedge_config['hm_toslots']) {
											execute_hedge($hedge_config, $remaining_qty, $return_data["book_no"], $metalType);
											$remaining_qty = 0;
										} elseif ($remaining_qty > $hedge_config['hm_toslots']) {
											execute_hedge($hedge_config, $hedge_config['hm_toslots'], $return_data["book_no"], $metalType);
											$remaining_qty -= $hedge_config['hm_toslots'];
										}
									}
								}
							}
						}


						if ($insertStatus) {
							$return_data["status"]             =  1;
							$return_data['book_qty']         =     $book_bar_type == 1 ? ($booked_qty + 0) . " Kg" : (($booked_qty * 1000) + 0) . " Gms";
							$return_data['book_rate']         =     $booking_rate;
							$limit_rate = $receivedata['book_rate'] + $receivedata['discount_amt'];

							if ($receivedata['request_type'] == 1) {
								$requestdata = array(
									'client' => $client,
									'book_cusid' => $receivedata['book_cusid'],
									'book_comid' => $receivedata['book_comid'],
									'book_type'  => $receivedata['book_type'],
									'book_rate'  => ($limit_rate),
									'book_qty'   => $booked_qty,
									'book_no'    => $return_data["book_no"],
									'alert_type' => 0,  //0->limit order, 1->rate alert
									'device_id'  => '',
									'mobile_no'  => $data->cus_mobile
								);

								$field_string = http_build_query($requestdata);
								curl_helper($create_ratealert_url, $field_string);

								$order_type = "Pending Limit ";

								$message  = $order_type . $return_data['book_qty'] . " of " . $data->com_name . " at Rs." . $booking_rate . "  is  placed successfully.";
								$trans_message = "";
								if ($receivedata['book_type'] == 0) {
									$trans_message = "Limit Buy - " . $data->com_name;
								} else {
									$trans_message = "Limit Sell - " . $data->com_name;
								}
								$trans_items['trans_cuscode']         = $receivedata['book_cusid'];
								$trans_items['trans_date']             = $cur_date;
								$trans_items['trans_code']             = $return_data["book_no"];
								$trans_items['trans_payment_type']     = 4;
								$trans_items['trans_amount']         = $totalcost;
								$trans_items['trans_actype']         = $receivedata['book_type'] == 0 ? 1 : 0;
								$trans_items['trans_comments']         = $trans_message;
								$trans_items['trans_comtype']         = $data->com_type;
								$trans_items['trans_margin_qty']     = $booked_qty;
								$trans_items['trans_book_code']     = $return_data["book_no"];
								$trans_items['trans_book_type']     = $receivedata['book_type'];
								$trans_items['trans_margin_type']     = 0;
								$trans_items['trans_type']             = $receivedata['book_type'] == 0 ? 10 : 11;
								$this->CI->db->insert('dt_transaction', $trans_items);
								unset($trans_items);
								$return_data["message"]        = $message;
							} else {
								if ($receivedata['book_type'] == 0)
									$order_type = "Buying request ";
								else
									$order_type = "Selling request ";

								if ($confirm_type == 1) {
									$resultset = $this->CI->db->query("SELECT com_name,
										com_rest_wt, rcom_comtype
										from  dt_com_master
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										where com_id=" . $receivedata['book_comid']);

									if ($resultset->num_rows() > 0) {
										$goldwt_info         = $resultset->row_array();
										$bookedweight_rest     = $goldwt_info['rcom_comtype'] == 1 ? $booked_qty : $booked_qty * 1000;

										if ($goldwt_info['com_rest_wt']  > $bookedweight_rest) {
											$gold_wt             =    (float)$goldwt_info['com_rest_wt'];
											$bookedweight_rest     =    (float)$bookedweight_rest;
											$rest_weight         =    $gold_wt - $bookedweight_rest;
											$this->CI->db->query("update  dt_com_master set com_rest_wt=" . $rest_weight . " where com_id='" . $receivedata['book_comid'] . "'");
										}
									}
									$message  = "Request No:" . $return_data["book_no"] . " - Your " . $order_type . " for " . $return_data['book_qty'] . " of " . $data->com_name . " at Rs." . $booking_rate . " is confirmed";
									$trans_message = "";
									if ($receivedata['book_type'] == 0) {
										$trans_message = "Buy - " . $data->com_name;
									} else {
										$trans_message = "Sell - " . $data->com_name;
									}

									$trans_items['trans_cuscode']         = $receivedata['book_cusid'];
									$trans_items['trans_date']             = $cur_date;
									$trans_items['trans_code']             = $return_data["book_no"];
									$trans_items['trans_payment_type']     = 4;
									$trans_items['trans_amount']         = $totalcost;
									$trans_items['trans_actype']         = $receivedata['book_type'] == 0 ? 1 : 0;
									$trans_items['trans_comments']         = $trans_message;
									$trans_items['trans_comtype']         = $data->com_type;
									$trans_items['trans_margin_qty']     = $booked_qty;
									$trans_items['trans_book_code']     = $return_data["book_no"];
									$trans_items['trans_book_type']     = $receivedata['book_type'];
									$trans_items['trans_margin_type']     = 0;
									$trans_items['trans_type']             = $receivedata['book_type'] == 0 ? 8 : 9;
									$this->CI->db->insert('dt_transaction', $trans_items);
									unset($trans_items);
								} else if ($confirm_type == 0) {
									$message  = "Request No:" . $return_data["book_no"] . " - Your request is rejected. Please try again later.";
								} else if ($confirm_type == 2) {
									$message  = "Request No:" . $return_data["book_no"] . " - Your " . $order_type . " for " . $return_data['book_qty'] . " of " . $data->com_name . " at Rs." . $booking_rate . " is accepted, pending approval";
								}
								$return_data["message"]        = $message;
							}
							// Add Margin amount in transaction table
							if ($has_margin) {
								$trans_items['trans_cuscode']         = $receivedata['book_cusid'];
								$trans_items['trans_date']             = $cur_date;
								$trans_items['trans_code']             = $return_data["book_no"];
								$trans_items['trans_payment_type']     = 1;
								$trans_items['trans_amount']         = $margin_hold;
								$trans_items['trans_actype']         = 1;
								$trans_items['trans_comments']         = "Margin deducted on booking";
								$trans_items['trans_comtype']         = $com_type;
								$trans_items['trans_margin_qty']     = $booked_qty;
								$trans_items['trans_book_code']     = $return_data["book_no"];
								$trans_items['trans_book_type']     = $receivedata['book_type'];
								$this->CI->db->insert('dt_transaction', $trans_items);
								unset($trans_items);

								// Margin Reverse

								//Check margin reverse type is 0. (Type 0 : Margin Reverse on booking & delivery). On booking, check the book type on any possible reversal. Eg: If sell 100 gms already booked and current booking is 50 gms buy, 50 gms (lesser qty) of margin is reversed for sell and buy.
								if ($data->margin_reverse_type == 0) {
									//select the booking with type(sell means select buy, buy means select sell and check for any possiblities of margin squareoff)
									$booktype = ($receivedata['book_type'] == 0 || $receivedata['book_type'] == 2) ? 1 : 0;

									$margin_bal = 0;

									if ($receivedata['book_type'] == 1) {
										$qMarbal = $this->CI->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = " . $com_type . " AND (trans_book_type = 0 OR trans_book_type = 2) AND trans_cuscode = " . $receivedata['book_cusid'] . " GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC");
									} else {
										$qMarbal = $this->CI->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_book_code AS book_no FROM dt_transaction WHERE (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) AND trans_comtype = " . $com_type . " AND trans_book_type = " . $booktype . " AND trans_cuscode = " . $receivedata['book_cusid'] . " GROUP BY trans_book_code HAVING balance_margin_qty > 0 ORDER BY trans_date ASC");
									}

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

										$trans_items['trans_cuscode']         = $receivedata['book_cusid'];
										$trans_items['trans_date']             = $cur_date;
										$trans_items['trans_code']             = $return_data["book_no"];
										$trans_items['trans_payment_type']     = 2;
										$trans_items['trans_amount']         = $margin_balamt;
										$trans_items['trans_actype']         = 0;
										$trans_items['trans_comments']         = "Margin reversal on booking";
										$trans_items['trans_comtype']         = $com_type;
										$trans_items['trans_margin_qty']     = $margin_balqty;
										$trans_items['trans_book_code']     = $return_data["book_no"];
										$trans_items['trans_book_type']     = $receivedata['book_type'];
										$this->CI->db->insert('dt_transaction', $trans_items);
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

												$trans_items['trans_cuscode']         = $receivedata['book_cusid'];
												$trans_items['trans_date']             = $cur_date;
												$trans_items['trans_code']             = $rmar["book_no"];
												$trans_items['trans_payment_type']     = 2;
												$trans_items['trans_amount']         = $marginamt;
												$trans_items['trans_actype']         = 0;
												$trans_items['trans_comments']         = "Margin reversal on booking";
												$trans_items['trans_comtype']         = $com_type;
												$trans_items['trans_margin_qty']     = $marginqty;
												$trans_items['trans_book_code']     = $rmar["book_no"];
												$trans_items['trans_book_type']     = $booktype;
												$this->CI->db->insert('dt_transaction', $trans_items);
												unset($trans_items);
											}
										}
									}
								}
							}
							//Update In Log
							$insert_data['book_no'] = $return_data["book_no"];
							$this->insertBookingLog($insert_data);
						} else {
							$return_data["message"]        = "Error occured in booking. Please try again later.";
						}
					} else if ($has_margin ? $data->available_balance < $margin_hold : false) {
						$return_data["message"]        = "Available margin (Rs." . $data->available_balance . ") less than required margin (Rs." . $margin_hold . ")";
					} else if ($data->has_minqty == 1 ? ($booked_qty < $data->min_qty) : false) {
						$return_data["message"]        = "Less than minimum order qty (" . $data->minqty_type . ")";
					} else if ($data->has_maxqty == 1 ? ($booked_qty > $data->max_qty) : false) {
						$bk_qty = $book_bar_type == 1 ? ($booked_qty + 0) . " Kg" : (($booked_qty * 1000) + 0) . " Gms";
						$this->bookingalert_message($receivedata['book_cusid'], 3, $data->com_name, $bk_qty);
						$return_data["message"]        = "Greater than maximum order qty (" . $data->maxqty_type . ")";
					} else if ($data->has_allot_qty == 1 ? ($data->total_open_qty + $booked_qty > $data->max_allot_qty) : false) {
						$bk_qty = $book_bar_type == 1 ? ($booked_qty + 0) . " Kg" : (($booked_qty * 1000) + 0) . " Gms";
						$this->bookingalert_message($receivedata['book_cusid'], 1, $data->com_name, $bk_qty);
						$return_data["message"]        = "You have reached max. qty for booking (" . $data->maxallotqty_type . ")";
					} else if ($receivedata['request_type'] == 1 ? ($data->pending_order + 1) > $data->max_order : false) {
						$bk_qty = $book_bar_type == 1 ? ($booked_qty + 0) . " Kg" : (($booked_qty * 1000) + 0) . " Gms";
						$this->bookingalert_message($receivedata['book_cusid'], 2, $data->com_name, $bk_qty);
						$return_data["message"]        = "You have reached maximum no. of limits (" . $data->max_order . ")";
					} else {
						$return_data["message"]        = "Error occured in booking.Please try again later.";
					}
				} else {
					$return_data["message"]    = "Currently trade has been disabled. Please try again later.";
				}
			} else {
				if ($tradable == 0)
					$return_data["message"]    = "Booking failed. No rate updation. Please try again.";
				else if ($totalcost <= 0)
					$return_data["message"]    = "Booking failed. Rates are not currently available.";
				else
					$return_data["message"]    = "Booking failed. Please try again later.";
			}
		} else {
			$return_data["message"]        = "Error occured. Please contact administrator.";
		}

		/* }else{

		$return_data["message"]	= "Booking failed. Sorry, this item is currently out of stock";

	} */
		return $return_data;
	}

	// function updateautoheadgedata($response, $return_data)
	// {
	// 	if (strpos($response, 'failed') == false) {
	// 		$mt5response = json_decode($response, true);
	// 		if (sizeof($mt5response) == 11) {
	// 			$hedge_data = array(
	// 				"dealid" 	=> $mt5response[1],
	// 				"orderid" 	=> $mt5response[2],
	// 				"volume"  	=> $mt5response[3],
	// 				"price"  	=> $mt5response[4],
	// 				"bid"		=> $mt5response[5],
	// 				"ask"		=> $mt5response[6],
	// 				"comment"	=> $mt5response[7],
	// 				"request_id" => $mt5response[8],
	// 				"symbol"	=>  $mt5response[10][3],
	// 				"cusbookid"	=>  $return_data["book_no"]
	// 			);
	// 			$this->CI->db->insert("dt_mt5_hedgedata", $hedge_data);
	// 			$this->CI->db->where('book_no', $return_data["book_no"]);
	// 			$this->CI->db->update('dt_booking', array("book_ishedge" => 1));

	// 			/* Sending admin, hedge status */
	// 			$hedgestatus = "Dear Admin, Booking placed in MT5.";
	// 			$whatsapp_content = $hedgestatus . "
	// 		Book No: " . $return_data["book_no"] . "
	// 		Hedge Qty: " . ($mt5response[3] * 10) . "
	// 		Hedge Price: " . $mt5response[4] . "
	// 		Time: " . date('d-m-Y H:i:s');
	// 			$nos = $this->get_admin_nos();
	// 			$mobile = '';
	// 			if ($nos['is_admin_mob1'] == 1 && trim($nos['admin_mob1']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob1']) . ",";
	// 			if ($nos['is_admin_mob2'] == 1 && trim($nos['admin_mob2']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob2']) . ",";
	// 			if ($nos['is_admin_mob3'] == 1 && trim($nos['admin_mob3']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob3']) . ",";
	// 			if ($nos['is_admin_mob4'] == 1 && trim($nos['admin_mob4']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob4']) . ",";
	// 			if ($nos['is_admin_mob5'] == 1 && trim($nos['admin_mob5']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob5']);

	// 			if (substr(trim($mobile), -1) == ',') {
	// 				$mobile =  substr($mobile, 0, -1);
	// 			}

	// 			$str_arr = explode(",", $mobile);

	// 			foreach ($str_arr as $mob => $cusmobile) {
	// 				//$resp = whatsapp_message_helper($cusmobile, $whatsapp_content);
	// 			}
	// 		} else {
	// 			$this->CI->db->query("update dt_generalsettings set is_hedge=0");
	// 			$mail_det = $this->enquiry_mail_details();
	// 			$mail_server = $mail_det['admin_mail'];
	// 			$email_id = $mail_server;
	// 			//$email_ccid = "";
	// 			$email_subject = "Booking not placed in MT5 - " . Globals::$web_title;
	// 			$email_content = "Dear Admin, Booking not placed in MT5. Now MT5 hedge is OFF";

	// 			/* Sending admin, hedge status */
	// 			$nos = $this->get_admin_nos();

	// 			$mobile = '';
	// 			if ($nos['is_admin_mob1'] == 1 && trim($nos['admin_mob1']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob1']) . ",";
	// 			if ($nos['is_admin_mob2'] == 1 && trim($nos['admin_mob2']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob2']) . ",";
	// 			if ($nos['is_admin_mob3'] == 1 && trim($nos['admin_mob3']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob3']) . ",";
	// 			if ($nos['is_admin_mob4'] == 1 && trim($nos['admin_mob4']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob4']) . ",";
	// 			if ($nos['is_admin_mob5'] == 1 && trim($nos['admin_mob5']) != '')
	// 				$mobile = $mobile . trim($nos['admin_mob5']);

	// 			if (substr(trim($mobile), -1) == ',') {
	// 				$mobile =  substr($mobile, 0, -1);
	// 			}

	// 			$str_arr = explode(",", $mobile);

	// 			foreach ($str_arr as $mob => $cusmobile) {
	// 				$resp = whatsapp_message_helper($cusmobile, $email_content);
	// 			}

	// 			email_notification_helper($email_id, $email_subject, $email_content/* ,$email_ccid */);
	// 			$logstatus = 0;
	// 			$this->updateHedgeONOFFLog($logstatus);
	// 		}
	// 	}
	// }


	function bookingalert_message($cus_id, $alert_message, $commodity, $bookqty)
	{
		/* Sending admin, booking status */
		$nos = $this->get_admin_nos();

		$query_name = $this->CI->db->query("SELECT concat(cus_name,' - ', cus_mobile) as cus_name FROM dt_customer WHERE cus_id=" . $cus_id);
		$cus_name     = $query_name->row()->cus_name;

		if ($alert_message == 1)
			$alertmess = "Client Reached Max order qty";
		else if ($alert_message == 2)
			$alertmess = "Client Reached Max No of Limit";
		else if ($alert_message == 3)
			$alertmess = "Client try to book Greater than maximum order qty";

		$message = $alertmess . ".

Client: " . $cus_name . "
Product: " . $commodity . "
Quantity: " . $bookqty . "

Time: " . date('d-m-Y H:i:s');

		$senderid = $this->CI->config->item('sms_senderid');
		$url = $this->CI->config->item('sms_url');

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
			$user_sms_url = strtr($url, $arr);
			curl_helper($user_sms_url, $user_sms_url);
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
	}
	function get_available_qty($postdata)
	{
		$record['pending_order'] = 0;

		$resultset = $this->CI->db->query("SELECT com_margin_type as margin_type, com_margin_value as margin FROM dt_com_master WHERE com_id = " . $postdata['book_comid']);

		foreach ($resultset->result() as $row) {
			$record['margin']        = $row->margin;
			$record['margin_type'] = $row->margin_type;
		}

		$record['available_balance']  = $this->get_availablebalance($postdata['book_cusid']);

		$resultset = $this->CI->db->query("Select cus_com_smoq,cus_com_pmoq,
									  cus_com_status_sell, cus_com_status_buy,cus_com_amountpurch
									  From dt_cus_commodity
									  LEFT JOIN dt_customergroupitems ON cgitems_cusid = '" . $postdata['book_cusid'] . "'
									   where cus_com_cus_id='" . $postdata['book_cusid'] . "' and  cus_com_id = " . $postdata['book_comid']);

		foreach ($resultset->result() as $row) {
			$record['cus_com_pmoq']     = $row->cus_com_pmoq;
			$record['cus_com_smoq']        = $row->cus_com_smoq;
			$record['cus_com_status_buy'] = $row->cus_com_status_buy;
			$record['cus_com_status_sell'] = $row->cus_com_status_sell;
			$record['cus_com_amountpurch'] = $row->cus_com_amountpurch;
		}

		$has_gmaxqty        = 0;
		$gold_max_qty         = 0;
		$has_gminqty         = 0;
		$gold_min_qty       = 0;
		$has_smaxqty         = 0;
		$silver_max_qty     = 0;
		$has_sminqty         = 0;
		$silver_min_qty     = 0;
		$has_gallot_qty     = 0;
		$gold_allot_qty     = 0;
		$has_sallot_qty     = 0;
		$silver_allot_qty     = 0;
		$limitcancel_silvertol     = 0;
		$limitcancel_goldtol     = 0;

		$generaldata = $this->CI->db->query("SELECT
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
		IFNULL(max_order,0) AS max_order, grl.confirmation_for AS confirmation_for, grl.confirmation_admin AS confirmation_admin, grl.trade_enable, cus.cus_mobile, cus.cus_active, grl.margin_reverse_type, grl.display_margin, grl.limitcancel_silvertol,grl.limitcancel_goldtol,grl.gold_hedgecontract,grl.silver_hedgecontract,grl.is_hedge, grl.gold_hedge_lot_qty,  grl.silver_hedge_lot_qty, grl.admin_hedgeurl,grl.is_hedge_silver,grl.is_hedge_gold,grl.silver_booking_adjusted_qty,grl.gold_booking_adjusted_qty FROM dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = '" . $postdata['book_cusid'] . "'");
		// print_r($generaldata->result());exit;
		foreach ($generaldata->result() as $row) {
			$has_gmaxqty                     = $row->has_gmaxqty;
			$gold_max_qty                     = $row->gold_max_qty;
			$has_gminqty                     = $row->has_gminqty;
			$gold_min_qty                     = $row->gold_min_qty;
			$has_smaxqty                     = $row->has_smaxqty;
			$silver_max_qty                 = $row->silver_max_qty;
			$has_sminqty                     = $row->has_sminqty;
			$silver_min_qty                 = $row->silver_min_qty;
			$has_gallot_qty                 = $row->has_gallot_qty;
			$gold_allot_qty                 = $row->gold_allot_qty;
			$has_sallot_qty                 = $row->has_sallot_qty;
			$silver_allot_qty                 = $row->silver_allot_qty;
			$limitcancel_silvertol             = $row->limitcancel_silvertol;
			$limitcancel_goldtol             = $row->limitcancel_goldtol;
			$record['gold_hedgecontract']     = $row->gold_hedgecontract;
			$record['silver_hedgecontract']    = $row->silver_hedgecontract;
			$record['gold_hedge_lot_qty']    = $row->gold_hedge_lot_qty;
			$record['silver_hedge_lot_qty']    = $row->silver_hedge_lot_qty;
			$record['is_hedge']                = $row->is_hedge;
			$record['is_hedge_gold']        = $row->is_hedge_gold;
			$record['is_hedge_silver']        = $row->is_hedge_silver;
			$record['silver_booking_adjusted_qty']        = $row->silver_booking_adjusted_qty;
			$record['gold_booking_adjusted_qty']        = $row->gold_booking_adjusted_qty;
			$record['confirmation_admin']     = $row->confirmation_admin;
			$record['confirmation_for']       = $row->confirmation_for;
			$record['trade_enable']         = $row->trade_enable;
			$record['cus_active']           = $row->cus_active;
			$record['max_order']               = $row->max_order;
			$record['cus_mobile']           = $row->cus_mobile;
			$record['margin_reverse_type']  = $row->margin_reverse_type;
			$record['display_margin']          = $row->display_margin;
			$record['admin_hedgeurl']          = $row->admin_hedgeurl;
		}

		//getting maximum qty of commodity
		$qGetMax = $this->CI->db->query("SELECT
		IF(rcom_comtype = 0, " . $has_gmaxqty . ", " . $has_smaxqty . ") AS has_maxqty,
		IF(rcom_comtype = 0, " . $gold_max_qty . ", " . $silver_max_qty . ") AS max_qty,
		IF(rcom_comtype = 0, " . $has_gminqty . ", " . $has_sminqty . ") AS has_minqty,
		IF(rcom_comtype = 0, " . $gold_min_qty . ", " . $silver_min_qty . ") AS min_qty,
		IF(rcom_comtype = 0, " . $has_gallot_qty . ", " . $has_sallot_qty . ") AS has_allot_qty,
		IF(rcom_comtype = 0, " . $gold_allot_qty . ", " . $silver_allot_qty . ") AS max_allot_qty,
		IF(rcom_comtype = 0, " . $limitcancel_goldtol . ", " . $limitcancel_silvertol . ") AS limitcancel_tol,
		rcom_comtype AS com_type, com.com_bar_quantity, com.com_weight, com.com_name FROM dt_com_master AS com
		LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
		WHERE com_id = " . $postdata['book_comid']);
		// print_r($postdata['book_comid']);exit;
		foreach ($qGetMax->result() as $row) {
			$record['has_maxqty']       = $row->has_maxqty;
			$record['max_qty']          = $row->max_qty + 0;
			$record['has_minqty']       = $row->has_minqty;
			$record['min_qty']          = $row->min_qty + 0;
			$record['has_allot_qty']       = $row->has_allot_qty;
			$record['max_allot_qty']    = $row->max_allot_qty + 0;
			$record['maxqty_type']      = $row->com_type == 1 ? ($row->max_qty + 0) . " Kg" : (($row->max_qty * 1000) + 0) . " Gms";
			$record['minqty_type']      = $row->com_type == 1 ? ($row->min_qty + 0) . " Kg" : (($row->min_qty * 1000) + 0) . " Gms";
			$record['maxallotqty_type'] = $row->com_type == 1 ? ($row->max_allot_qty + 0) . " Kg" : (($row->max_allot_qty * 1000) + 0) . " Gms";
			$record['com_bar_qty']         = $row->com_bar_quantity;
			$record['com_type']           = $row->com_type;
			$record['com_weight']       = $row->com_weight;
			$record['com_name']           = $row->com_name;
			$record['limitcancel_tol']  = $row->limitcancel_tol;
		}
		// print_r($record);exit;
		//getting total open qty of commodity
		$qTotalQty = $this->CI->db->query("SELECT (SUM(book_qty)-ifnull(SUM(del_qty.deliveredqty),0)) AS total_open_qty
									   FROM dt_booking
									   LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty
									   FROM dt_customerdelivery GROUP BY cusdel_bookno) AS del_qty ON del_qty.cusdel_bookno = book_no
									   LEFT JOIN dt_com_master ON com_id = book_comid
									   LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
									   WHERE (IF(ordertype =0,(book_status =1 or book_status = 2),true))  AND  (ifnull(book_qty,0)-ifnull(del_qty.deliveredqty,0) != 0) AND
									   (IF(ordertype =1,(orderstatus =0 or book_status =1 or book_status = 2),true)) AND IFNULL(delete_status,0) = 0 AND book_cusid = '" . $postdata['book_cusid'] . "' AND (if(rcom_comtype = 1,1,0) = (SELECT if(rcom_comtype = 1,1,0) AS com_type FROM dt_com_master LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type WHERE com_id = '" . $postdata['book_comid'] . "')) AND book_type = " . $postdata['book_type']);
		foreach ($qTotalQty->result() as $row) {
			$record['total_open_qty']      = $row->total_open_qty;
		}
		//getting no of pending limits
		$qNoLimit = $this->CI->db->query("SELECT COUNT(book_no) AS pending_order FROM dt_booking WHERE ordertype = 1 AND orderstatus = 0 AND book_cusid = '" . $postdata['book_cusid'] . "'");
		foreach ($qNoLimit->result() as $row) {
			$record['pending_order']      = $row->pending_order;
		}

		return json_encode($record);
	}
	function getbookingreport($cus_id, $from_date = "", $to_date = "", $comType = "")
	{
		$returndata = array();

		$days_expire = "";
		$query = $this->CI->db->query("SELECT if(expire_history = 1, days_expire,'') AS days_expire FROM dt_generalsettings");
		$days_expire     = $query->row()->days_expire;

		$date_expire = $days_expire != "" ? ($days_expire > 0 ? ("IF(IFNULL(ordertype,0) = 1 AND (IFNULL(orderstatus,0) = 1 OR IFNULL(orderstatus,0) = 0), IF(IFNULL(orderstatus,0) = 0, 1 ,IF(IFNULL(orderplacedtime,'') != '' , IF(DATE_ADD(DATE(orderplacedtime), INTERVAL " . $days_expire . " DAY) >= CURDATE() , 1, 0), 1)), IF(DATE_ADD(DATE(book_datetime), INTERVAL " . $days_expire . " DAY) >= CURDATE() , 1, 0)) = 1 AND ") : " 0 AND ") : "";

		if ($from_date != "" && $to_date != "") {
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "AND DATE(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) BETWEEN '" . $from_date . "' AND '" . $to_date . "'";
		} else {
			$date = "";
		}

		$resultset = $this->CI->db->query("SELECT
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
										0 As show_details, book_usercomment,book_narration, del_qty.cus_name as del_cusname, del_qty.cus_company_name as del_cuscompany
										from dt_booking
										LEFT JOIN
										(SELECT cusdel_bookno, cus_name, cus_company_name, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty, ifnull(date_format(max(cusdel_date), '%d-%m-%Y %H:%i:%s'), '-') as deliverydate
										from dt_customerdelivery
										LEFT JOIN  dt_customer ON cusdeal_deliveredto = cus_id
										where cusdel_cusname = '" . $cus_id . "' group by cusdel_bookno)
										as del_qty on del_qty.cusdel_bookno = book_no
										LEFT JOIN dt_com_master ON com_id = book_comid
										LEFT JOIN dt_customer ON book_cusid = cus_id
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										WHERE " . $date_expire . " book_cusid = '" . $cus_id . "'
										" . $date . " order by IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime) DESC");

		$book_totalcost            =    0;
		$unpaid_qty                =    0;
		$unpaid_amount            =    0;
		$qty                    =    0;
		foreach ($resultset->result() as $row) {
			if ($row->type == 'Buy')
				$book_totalcost        +=    $row->book_totalcost;
			else
				$book_totalcost        -=    $row->book_totalcost;
			if ($row->type == 'Buy')
				$unpaid_qty            +=    $row->unpaid_qty;
			else
				$unpaid_qty            -=    $row->unpaid_qty;
			if ($row->type == 'Buy')
				$qty                +=    $row->qty;
			else
				$qty                -=    $row->qty;
		}
		$userData['book_totalcost'] = $book_totalcost;
		$userData['unpaid_qty']        = $unpaid_qty;
		$userData['unpaid_amount']  = $unpaid_amount;
		$userData['qty']            = $qty;
		if ($unpaid_qty > 0)
			$userData['book_no']            = " Totals(Buy):";
		else if ($unpaid_qty > 0)
			$userData['book_no']            = " Totals(Sell):";
		else
			$userData['book_no']            = " Totals:";

		$records    =    array();
		$records[0]    =    $resultset;
		$records[1]    =    $userData;
		$returndata = array('bookingdata' => $resultset->result_array(), 'bookiingtotal' => $userData);

		return $returndata;
	}
	function getorderreport($cus_id, $from_date = "", $to_date = "", $comType = "")
	{
		$returndata = array();

		if ($from_date != "" && $to_date != "") {
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "AND DATE(book_datetime) BETWEEN '" . $from_date . "' AND '" . $to_date . "'";
		} else {
			$date = "";
		}

		$com_type = $comType == -1 || $comType == '' ? '' : ($comType == 0 ? (' rcom_comtype = 0 AND ') : (' rcom_comtype = 1 AND '));

		$resultset = $this->CI->db->query("SELECT
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
										 from dt_customer_deliveryinvoice where invoice_cuscode = '" . $cus_id . "' group by invoice_bookno)
										as paid_qty on paid_qty.invoice_bookno = book_no
										LEFT JOIN dt_com_master ON com_id = book_comid
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										LEFT JOIN dt_customer ON book_cusid = cus_id
										WHERE book_cusid = '" . $cus_id . "' AND book_status = 0 and orderstatus = 0
										" . $date . " order by book_no desc");

		$book_totalcost            =    0;
		$unpaid_qty                =    0;
		$unpaid_amount            =    0;
		$qty                    =    0;
		foreach ($resultset->result() as $row) {
			if ($row->type == 'Buy')
				$book_totalcost        +=    $row->book_totalcost;
			else
				$book_totalcost        -=    $row->book_totalcost;
			if ($row->type == 'Buy')
				$unpaid_qty            +=    $row->unpaid_qty;
			else
				$unpaid_qty            -=    $row->unpaid_qty;
			if ($row->type == 'Buy')
				$qty                +=    $row->qty;
			else
				$qty                -=    $row->qty;
		}
		$userData['book_totalcost'] = $book_totalcost;
		$userData['unpaid_qty']        = $unpaid_qty;
		$userData['unpaid_amount']  = $unpaid_amount;
		$userData['qty']            = $qty;
		if ($unpaid_qty > 0)
			$userData['book_no']            = " Totals(Buy):";
		else if ($unpaid_qty > 0)
			$userData['book_no']            = " Totals(Sell):";
		else
			$userData['book_no']            = " Totals:";

		$records    =    array();
		$records[0]    =    $resultset;
		$records[1]    =    $userData;

		$returndata = array('bookingdata' => $resultset->result_array(), 'bookiingtotal' => $userData);

		return $returndata;
	}
	function getpendingdelvreport($cus_id)
	{
		$returndata = array();
		//book_ishedge != 1 AND
		$resultset = $this->CI->db->query("SELECT book_no as bookno,
						DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%y %H:%i:%s') as bookdate, book_comid as comcode,if(rcom_comtype= 1,1,0) as com_type,
						if(book_type=0,'Buy','Sell') as book_type,
						if(rcom_comtype = 1, book_qty, book_qty * 1000) as unpaid_qty,
						book_rate,
						cus_name as customername,
						REPLACE(com_name,'`','') as commodityname,
						if(rcom_comtype = 1,CONCAT(TRIM(book_qty)+0, ' (kgs)'), CONCAT(TRIM(book_qty*1000)+0, ' (gms)')) as bookqty,
						cus_id as cuscode,
						TRIM(round(((book_totalcost/book_qty) * (book_qty)),2))+0 as bookamount,
						if(rcom_comtype = 1,CONCAT(TRIM((book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0))))+0, ' (kgs)'), CONCAT(TRIM((book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000)+0, ' (gms)')) as BalanceQty,
						if(book_type=0,if(rcom_comtype = 0,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0'), '0') as BalanceQty_buygold,
						if(book_type=1,if(rcom_comtype = 0,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0'), '0') as BalanceQty_sellgold,
						if(rcom_comtype = 0,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0') as BalanceQty_gold,
						if(book_type=0,if(rcom_comtype = 1,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0'),'0') as BalanceQty_buysilver,
						if(book_type=1,if(rcom_comtype = 1,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0'),'0') as BalanceQty_sellsilver,
						if(rcom_comtype = 1,(book_qty - IFNULL(del_qty.deliveredqty,0) - if(is_unfix = 1, 0, IFNULL(knkoff.knkoff_qty,0)))*1000, '0') as BalanceQty_silver,
						TRIM((book_qty - if(is_unfix = 1, IFNULL(knkoff.knkoff_qty,0), 0))*1000)+0 AS knockedoff_qty,
						cusdel_bookno,
						cus_alise_name,
						ifnull(cus_city,'-') AS cus_city, remarks, cus_mobile, cus_state,
						cus_company_name, IFNULL(is_unfix,0) AS is_unfix,
						cus_phone,branch_name,if(bok.purity = 0 , '995', if(bok.purity = 1, '999', '9999')) as purity,dollar_fixedrate,inr_fixedrate, 0 As show_details,
						round((IFNULL(book_qty,0) - IFNULL(del_qty.deliveredqty,0))*(book_rate/book_comweight)*1000, 2) as pending_amt,
						if(book_type = 0,if(rcom_comtype = 0, if(IFNULL(del_qty.deliveredqty,0)>0, round((IFNULL(book_qty,0) - IFNULL(del_qty.deliveredqty,0))*(book_rate/book_comweight)*1000, 2), book_totalcost), '0'), '0') as pending_amt_gold,
						if(book_type = 0,if(rcom_comtype = 1, round((IFNULL(book_qty,0) - IFNULL(del_qty.deliveredqty,0))*(book_rate/book_comweight)*1000, 2), '0'),'0') as pending_amt_silver,TRIM(admin_tcs_value) +0 as admin_tcs_value,TRIM(admin_igst)+0 as admin_igst,TRIM(tcs_value)+0 as tcs_value, if(ordertype=0,'Book','Limit') as ordertype, book_usercomment,book_narration
						FROM dt_booking as bok
						LEFT JOIN dt_customer on cus_id = book_cusid
						LEFT JOIN dt_com_master ON book_comid = com_id
						LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
						LEFT JOIN dt_comp_branch ON branch_code = book_branch
						LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty,
									ifnull(date_format(cusdel_date, '%d-%m-%Y %H:%i:%s'), '-') as deliverydate
									FROM dt_customerdelivery
						WHERE cusdel_cusname = '" . $cus_id . "'
						GROUP BY cusdel_bookno) AS del_qty on del_qty.cusdel_bookno = book_no
						LEFT JOIN (SELECT SUM(IFNULL(knkoff_qty,0)) AS knkoff_qty, knkoff_bookno FROM dt_knockoff GROUP BY knkoff_bookno) AS knkoff ON knkoff.knkoff_bookno = book_no
						INNER JOIN dt_generalsettings
						WHERE cus_id ='" . $cus_id . "' AND book_status = 1 AND book_type = 0 AND book_rate > 0 AND
					  	ifnull(delete_status,0) = 0 AND (book_pricefrom = 0 or book_pricefrom =1 or if(book_pricefrom = 2, if(book_bnkfixrate != 0.00, TRUE,FALSE),''))
						HAVING BalanceQty > 0 AND knockedoff_qty > 0
					    ORDER BY
					    DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s')
					    DESC ");
		$unpaid_qty                =    0;
		$unpaid_amount            =    0;
		$qty_gold                =    0;
		$qty_silver                =    0;
		$balgold_amount            =    0;
		$balsilver_amount        =    0;
		$balgoldbuy_qty            =    0;
		$balgoldsell_qty        =    0;
		$balsilverbuy_qty        =    0;
		$balsilversell_qty        =    0;
		$qty_total                =    0;
		$admin_tcs_value        =    0;
		$admin_igst        =    0;
		$tcs_value        =    0;


		foreach ($resultset->result() as $row) {
			$qty_gold                +=    $row->BalanceQty_gold;
			$qty_silver                +=    $row->BalanceQty_silver;
			$balgold_amount            +=    $row->pending_amt_gold;
			$balsilver_amount            +=    $row->pending_amt_silver;
			$balgoldbuy_qty            +=    $row->BalanceQty_buygold;
			$balgoldsell_qty        +=    $row->BalanceQty_sellgold;
			$balsilverbuy_qty        +=    $row->BalanceQty_buysilver;
			$balsilversell_qty        +=    $row->BalanceQty_sellsilver;
			$admin_tcs_value        =    $row->admin_tcs_value;
			$admin_igst                =    $row->admin_igst;
			$tcs_value                =    $row->tcs_value;



			if ($row->book_type == 'Buy')
				$unpaid_qty            +=    $row->unpaid_qty;
			else
				$unpaid_qty            -=    $row->unpaid_qty;
		}
		/* $userData['unpaid_qty']		= round($unpaid_qty,2);
						$userData['unpaid_amount']  = $unpaid_amount; */
		setlocale(LC_MONETARY, 'en_IN');
		$userData['qty_gold']        = round($qty_gold, 2) . " Grms";
		$userData['qty_silver']        = round($qty_silver, 2) . " Grms";
		$userData['qty_gold_buy']    = number_format(round($balgoldbuy_qty, 2), 3, '.', '') . " Grms";
		$userData['qty_gold_sell']    = number_format(round($balgoldsell_qty, 2), 3, '.', '') . " Grms";
		$userData['qty_silver_buy']    = number_format(round($balsilverbuy_qty, 2), 3, '.', '') . " Grms";
		$userData['qty_silver_sell'] = number_format(round($balsilversell_qty, 2), 3, '.', '') . " Grms";
		$userData['amount_gold']        = "Rs " . number_format(round($balgold_amount, 2), 3, '.', '');
		$userData['amount_silver']    = "Rs " . number_format(round($balsilver_amount, 2), 3, '.', '');
		$userData['amount_total']    = "Rs " . number_format(round($balgold_amount - $balsilver_amount, 2), 3, '.', '');
		$userData['qty_total']        = round($qty_gold + $qty_silver, 2) . " Grms";
		if ($unpaid_qty > 0)
			$userData['book_no']            = " Totals(Buy):";
		else if ($unpaid_qty > 0)
			$userData['book_no']            = " Totals(Sell):";
		else
			$userData['book_no']            = " Totals:";
		$userData['admin_tcs_value'] =  $admin_tcs_value;
		$userData['admin_igst'] =  $admin_igst;
		$userData['tcs_value'] =  $tcs_value;



		$records    =    array();
		$records[0]    =    $resultset;
		$records[1]    =    $userData;
		$returndata = array('bookingdata' => $resultset->result_array(), 'bookiingtotal' => $userData);

		//$returndata = array('bookingdata' => $resultset->result_array());

		return $returndata;
	}
	function getcustomerallopenorders($cus_id, $from_date = "", $to_date = "", $comType = "", $type = "")
	{
		if ($from_date != "" && $to_date != "") {
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "AND DATE(book_datetime) BETWEEN '" . $from_date . "' AND '" . $to_date . "'";
		} else {
			$date = "";
		}

		$resultset = $this->CI->db->query("SELECT
								book_no,
								DATE_FORMAT(book_datetime, '%d-%m-%Y %H:%i:%s') as book_datetime,
								com_name,
								round(if(book_bar_type = 0 , (book_rate/book_comweight)*10, if(book_bar_type = 1 , (book_rate/book_comweight)*1000, (book_rate/book_comweight))),2) as ratepergram,
								if(book_bar_type = 1, CONCAT(TRIM(book_qty)+0,' Kg'), CONCAT(TRIM(book_qty * 1000)+0, ' Gm')) as qty,if(book_type=0,'Buy','Sell') as type,
								if(book_bar_type = 1, book_qty - ifnull(book_physicalqty,0) - ifnull(book_hedgqty,0), (book_qty - ifnull(book_physicalqty,0) - ifnull(book_hedgqty,0)) * 1000) as unpaid_qty,
								book_totalcost,
								round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as physicalqtyamount,
								0 as unpaid_amount,
								book_qty - ifnull(book_hedgqty,0) as physicalqty,
								orderstatus,
								book_status,
								CASE
									WHEN book_status = 1 THEN 'Confirmed'
									WHEN book_status = 0 AND orderstatus = 0 THEN 'Pending'
									WHEN orderstatus = 2 THEN 'Cancelled by user'
									WHEN orderstatus = 3 THEN 'Cancelled by admin'
									WHEN orderstatus = 4 THEN 'Expired'
									WHEN orderstatus = 5 THEN 'Cancelled, Insufficient margin'
									WHEN book_status = 3 THEN 'Rejected'
									ELSE 'Pending'
								END as status_text,
								CASE
									WHEN book_status = 1 THEN 1
									WHEN book_status = 0 AND orderstatus = 0 THEN 0
									WHEN orderstatus = 2 OR orderstatus = 3 THEN 4
									WHEN orderstatus = 4 THEN 7
									WHEN orderstatus = 5 THEN 8
									WHEN book_status = 3 THEN 3
									ELSE 0
								END as bookstatus,
								book_hedgqty as hedgqty,
								book_comid,
								TRIM(book_rate)+0 AS book_rate,
								book_comweight,
								book_no_bar,
								if(book_bar_type = 1,CONCAT(TRIM(book_qty)+0, ' (kgs)'), CONCAT(TRIM(book_qty*1000)+0, ' (gms)')) as qty,
								book_type,
								if(book_bar_type = 1,TRIM(book_qty)+0, TRIM(book_qty*1000)+0) AS book_qty,
								0 As show_details,book_request_amtwt, book_usercomment
								from dt_booking
								left join
								(select invoice_bookno,sum(invoice_deliveryqty) as delivered,sum(invoice_amount) as paid_amt
								 from dt_customer_deliveryinvoice where invoice_cuscode = '" . $cus_id . "' group by invoice_bookno)
								as paid_qty on paid_qty.invoice_bookno = book_no
								LEFT JOIN dt_com_master ON com_id = book_comid
								LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
								LEFT JOIN dt_customer ON book_cusid = cus_id
								WHERE book_cusid = '" . $cus_id . "' AND ordertype = 1 AND IFNULL(delete_status,0) = 0
								" . $date . " order by book_no desc");

		$records = array();
		$records[0] = $resultset->result_array();
		return $records;
	}
	function customerordercancel($cusid, $book_no)
	{
		$return_data = array();
		$cancel_ratealert_url    =  trim(Globals::$cancelratealert ? Globals::$cancelratealert : '');
		$rate_url                 =  trim(Globals::$getrates ? Globals::$getrates : '');
		$client                      =  trim(Globals::$client ? Globals::$client : '');
		if ($cancel_ratealert_url != '' && $rate_url != '' && $client != '') {
			$booked_rate = 0;
			$book_type   = "";
			$book_comid  = "";
			$book_cusid  = "";

			$resultset = $this->CI->db->query("SELECT book_qty, book_type, book_rate, book_comid, book_cusid FROM dt_booking WHERE book_no = " . $book_no . "  AND ordertype = 1 AND orderstatus = 0");
			foreach ($resultset->result_array() as $row) {
				$booked_rate        =  $row['book_rate'];
				$book_type             =  $row['book_type'];
				$book_comid         =  $row['book_comid'];
				$book_cusid         =  $row['book_cusid'];
			}

			$receivedata['book_cusid'] = $book_cusid;
			$receivedata['book_comid'] = $book_comid;
			$receivedata['book_type']  = $book_type;
			$receivedata['request_type']  = 1;

			$data = json_decode($this->get_available_qty($receivedata));

			$limitcancel_tol = $data->limitcancel_tol;

			$livePrice = 0;

			$rate_array = $this->get_ratearray($rate_url, $client);

			foreach ($rate_array as $ratevalues) {
				if ($ratevalues['com_id'] == $receivedata['book_comid']) {
					if ($book_type == 0) {
						$livePrice = $ratevalues['selling_rate'];
					} else if ($book_type == 1) {
						$livePrice = $ratevalues['buying_rate'];
					}
				}
			}
			if ($booked_rate > 0 && $livePrice > 0) {
				if ($limitcancel_tol > 0 ? ($book_type == 0 ? ($booked_rate + $limitcancel_tol < $livePrice) : ($booked_rate - $limitcancel_tol > $livePrice)) : true) {
					$status = $this->CI->db->update('dt_booking', array("orderstatus" => 2), array("book_no" => $book_no, "orderstatus" => 0, "ordertype" => 1));
					if ($status && $this->CI->db->affected_rows() > 0) {
						$requestdata = array(
							'client'  => $client,
							'book_no' => array($book_no)
						);

						$field_string = http_build_query($requestdata);
						curl_helper($cancel_ratealert_url, $field_string);
						$return_data = array('status' => 1, 'book_no' => $book_no, 'message' => 'Your order has been cancelled');

						//Update in Log
						$log_update['book_no']         = $book_no;
						$log_update['book_cusid']     = $book_cusid;
						$this->cancelLimitLog($log_update);
					} else {
						$return_data = array('status' => 0, 'book_no' => $book_no, 'message' => 'Order cancellation failed. Please try again later.');
					}
				} else {
					$return_data = array('status' => 0, 'message' => 'Order can not be cancelled or updated when Live price comes near to your Limit Order Price');
				}
			} else {
				$return_data = array('status' => 0, 'message' => 'Error occured.Please try again.');
			}
		} else {
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
		IF(cus.has_sallot_qty = 1, CONCAT(TRIM(cus.silver_allot_qty)+0, ' kg'), IF(grl.has_sallot_qty = 1, CONCAT(TRIM(grl.silver_allot_qty)+0, ' Kg'), '-')) AS silver_allot_qty FROM dt_customer AS cus, dt_generalsettings AS grl WHERE cus_id = '" . $cus_id . "'";

		$resultset = $this->CI->db->query($str_query);
		foreach ($resultset->result() as $row) {
			$returndata[] = array('comname' => "Gold", 'minimumqty' => $row->gold_min_qty, 'maxqty' => $row->gold_max_qty, 'allot_qty' => $row->gold_allot_qty);
			$returndata[] = array('comname' => "Silver", 'minimumqty' => $row->silver_min_qty, 'maxqty' => $row->silver_max_qty, 'allot_qty' => $row->silver_allot_qty);
		}
		return $returndata;
	}
	function changePassword($psdata)
	{
		$returndata = array();

		$this->CI->db->select('cus_id, cus_email, cus_name, cus_login_name');
		$this->CI->db->where(array('cus_id' => $psdata['userid'], 'cus_login_password' => $psdata['oldpassword']));
		$query = $this->CI->db->get($this->sec_table_name);
		if ($query->num_rows() == 1) {
			$this->CI->db->where('cus_id', $psdata['userid']);
			if ($this->CI->db->update($this->sec_table_name, array('cus_login_password' => $psdata['confirmpassword']))) {
				$returndata = array('status' => 1, 'error' => '', 'email' =>  $query->row()->cus_email, 'name' =>  $query->row()->cus_name, 'cus_login_name' => $query->row()->cus_login_name);
			} else {
				$returndata = array('status' => 0, 'error' => 'Password update failed, Please try again');
			}
		} else {
			$returndata = array('status' => 0, 'error' => 'Please enter the valid details');
		}
		return $returndata;
	}
	function check_currentuser_session($username, $imiecode, $uuid)
	{
		$data = array();
		$query    = $this->CI->db->query("SELECT * FROM dt_customer where cus_login_name = '" . $username . "' AND cus_imiecode = '" . $imiecode . "' AND cus_uuid='" . $uuid . "'");
		if ($query->num_rows() == 1) {
			$data  = array('operationresult' => 1, 'message' => "");
		} else {
			$data = array('operationresult' => 0, 'message' => "Some one logged in with your credentials in another device");
		}

		return $data;
	}

	function get_EmailContent($service_id, $book_no)
	{
		//Declaration of variables
		$email_content = "";
		$email_status = 0;
		$email_id = 1; //Send SMS
		$email_signature = "";
		$customer_data = array();
		//Retriving EMail service for registration confirmation
		$resultset = $this->CI->db->query("SELECT serv_email FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
		foreach ($resultset->result() as $row) {
			$email_status = $row->serv_email;
		}
		$resultset->free_result();
		//Checking EMail service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($email_status == 1) {
			$resultset = $this->CI->db->query("SELECT
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
										where book_no = '" . $book_no . "'");

			foreach ($resultset->result() as $row) {
				$customer_data = $row;
			}
			$return_data["email_id"] =     $customer_data->cus_email;
			//Retriving message content
			$resultset = $this->CI->db->query("SELECT email_content, email_signature from dt_email_settings where service_id = '" . $service_id . "'");
			foreach ($resultset->result() as $row) {
				$email_content = $row->email_content;
				$email_signature = $row->email_signature;
			}
			$resultset->free_result();
			//Generating Message content
			$field_name = explode('@@', $email_content);
			//echo count($field_name);
			for ($i = 1; $i < count($field_name); $i += 2) {
				if (isset($customer_data->{$field_name[$i]})) {
					$email_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $email_content);
				}
			}
			$field_name_sig = explode('@@', $email_signature);
			for ($i = 1; $i < count($field_name_sig); $i += 2) {
				if (isset($customer_data->{$field_name_sig[$i]})) {
					$email_signature = str_replace("@@" . $field_name_sig[$i] . "@@", $customer_data->{$field_name_sig[$i]}, $email_signature);
				}
			}
			$return_data["email_subject"] = $email_signature;
			$return_data["email_content"] = $email_content;
		}
		//Returning generated EMail Content
		return isset($return_data) ? $return_data : '';
	}

	function get_SMSURL($service_id, $book_no)
	{
		//Declaration of variables
		$sms_url = "";
		$sms_status = 0;
		$sms_authkey  = "";
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$customer_data = array();
		//Retriving SMS service for registration confirmation
		$resultset = $this->CI->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
		foreach ($resultset->result() as $row) {
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($sms_status == 1) {
			$resultset = $this->CI->db->query("SELECT
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
										bk.book_totalcost as book_totalcost,
										cus_mobile, (select admin_company_name from dt_generalsettings) as admin_company_name
										FROM dt_booking bk
										left join dt_customer on cus_id=bk.book_cusid
										left join dt_com_master on com_id=bk.book_comid
										left join dt_rpanelcommodities on rcom_id = com_type
										where book_no = '" . $book_no . "'");

			foreach ($resultset->result() as $row) {
				$customer_data = $row;
			}

			//Retriving message content
			$resultset = $this->CI->db->query("SELECT sms_content, sms_footer,sms_dlt_te_id from dt_sms_settings where service_id = '" . $service_id . "'");
			foreach ($resultset->result() as $row) {
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
				$sms_dlt_te_id = $row->sms_dlt_te_id;
			}
			$resultset->free_result();
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile, $sms_dlt_te_id);
			//Generating Message content
			$field_name = explode('@@', $sms_content);
			//echo count($field_name);
			for ($i = 1; $i < count($field_name); $i += 2) {
				if (isset($customer_data->{$field_name[$i]})) {
					$sms_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $sms_content);
				}
			}
			$field_name_footer = explode('@@', $sms_footer);
			for ($i = 1; $i < count($field_name_footer); $i += 2) {
				if (isset($customer_data->{$field_name_footer[$i]})) {
					$sms_footer = str_replace("@@" . $field_name_footer[$i] . "@@", $customer_data->{$field_name_footer[$i]}, $sms_footer);
				}
			}
			$sms_content .= " " . $sms_footer;
			$sms_content = urlencode($sms_content);

			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);
		}
		//Returning generated SMS URL
		return $sms_url;
	}
	function get_whatsappURL($service_id, $book_no)
	{
		//Declaration of variables
		$sms_url = "";
		$sms_status = 0;
		$sms_authkey  = "";
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$mobil_no = "";
		$customer_data = array();
		//Retriving SMS service for registration confirmation
		$resultset = $this->CI->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
		foreach ($resultset->result() as $row) {
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($sms_status == 1) {
			$resultset = $this->CI->db->query("SELECT
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
										bk.book_totalcost as book_totalcost,
										cus_mobile, (select admin_company_name from dt_generalsettings) as admin_company_name
										FROM dt_booking bk
										left join dt_customer on cus_id=bk.book_cusid
										left join dt_com_master on com_id=bk.book_comid
										left join dt_rpanelcommodities on rcom_id = com_type
										where book_no = '" . $book_no . "'");

			foreach ($resultset->result() as $row) {
				$customer_data = $row;
			}
			$dlt_id = 0;
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile, $dlt_id);
			$mobil_no = $customer_data->cus_mobile;
			//Retriving message content
			$resultset = $this->CI->db->query("SELECT sms_content, sms_footer from dt_sms_settings where service_id = '" . $service_id . "'");
			foreach ($resultset->result() as $row) {
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
			}
			$resultset->free_result();

			// Meta WhatsApp Settings
			$meta_template_id = "";
			$meta_params = array();
			$resultset_meta = $this->CI->db->query("SELECT template_id from dt_whatsappmeta_settings where service_id = '" . $service_id . "'");
			if ($resultset_meta->num_rows() > 0) {
				$meta_template_id = $resultset_meta->row()->template_id;
				$meta_params = array(
					$customer_data->book_cusid,
					$customer_data->book_comid,
					$customer_data->book_qty,
					$customer_data->book_rate,
					$customer_data->book_status
				);
			}

			//Generating Message content
			$field_name = explode('@@', $sms_content);
			//echo count($field_name);
			for ($i = 1; $i < count($field_name); $i += 2) {
				if (isset($customer_data->{$field_name[$i]})) {
					$sms_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $sms_content);
				}
			}
			$field_name_footer = explode('@@', $sms_footer);
			for ($i = 1; $i < count($field_name_footer); $i += 2) {
				if (isset($customer_data->{$field_name_footer[$i]})) {
					$sms_footer = str_replace("@@" . $field_name_footer[$i] . "@@", $customer_data->{$field_name_footer[$i]}, $sms_footer);
				}
			}
			$sms_content .= " " . $sms_footer;
		}
		//Returning generated SMS URL
		return array(
			'message' => $sms_content,
			'mobile' => $mobil_no,
			'template_id' => isset($meta_template_id) ? $meta_template_id : "",
			'params' => isset($meta_params) ? $meta_params : array()
		);
	}
	function get_admin_SMS($service_id, $book_no)
	{
		//Declaration of variables
		$sms_url = "";
		$sms_status = 0;
		$sms_authkey  = "";
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$customer_data = array();
		//Retriving SMS service for registration confirmation
		$resultset = $this->CI->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
		foreach ($resultset->result() as $row) {
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($sms_status == 1) {
			$resultset = $this->CI->db->query("SELECT
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
										bk.book_totalcost as book_totalcost,
										cus_mobile, (select admin_company_name from dt_generalsettings) as admin_company_name
										FROM dt_booking bk
										left join dt_customer on cus_id=bk.book_cusid
										left join dt_com_master on com_id=bk.book_comid
										left join dt_rpanelcommodities on rcom_id = com_type
										where book_no = '" . $book_no . "'");

			foreach ($resultset->result() as $row) {
				$customer_data = $row;
			}
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile, isset($sms_dlt_te_id) ? $sms_dlt_te_id : '');
			//Retriving message content
			$resultset = $this->CI->db->query("SELECT sms_content, sms_footer, sms_dlt_te_id from dt_sms_settings where service_id = '" . $service_id . "'");
			foreach ($resultset->result() as $row) {
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
				$sms_dlt_te_id = $row->sms_dlt_te_id;
			}
			$resultset->free_result();
			//Generating Message content
			$field_name = explode('@@', $sms_content);
			//echo count($field_name);
			for ($i = 1; $i < count($field_name); $i += 2) {
				if (isset($customer_data->{$field_name[$i]})) {
					$sms_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $sms_content);
				}
			}
			$field_name_footer = explode('@@', $sms_footer);
			for ($i = 1; $i < count($field_name_footer); $i += 2) {
				if (isset($customer_data->{$field_name_footer[$i]})) {
					$sms_footer = str_replace("@@" . $field_name_footer[$i] . "@@", $customer_data->{$field_name_footer[$i]}, $sms_footer);
				}
			}
			$sms_content .= " " . $sms_footer;
			$sms_content = urlencode($sms_content);

			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);
		}
		//Returning generated SMS URL
		return $sms_url;
	}
	function get_SMSAppSettings($sms_id, $mobile_no, $dlt_id = "")
	{
		//Declaring variables
		$sms_returnurl = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";

		//Fetching SMS App URL
		$result_set = $this->CI->db->query("select sas_url from dt_smsappsettings where sas_id='" . $sms_id . "'");
		foreach ($result_set->result() as $row) {
			$sms_returnurl = $row->sas_url;
		}
		$result_set->free_result();

		//Fetching SMS App user name, password and sender id
		$result_set = $this->CI->db->query("select admin_sms_username, admin_sms_password, admin_sms_authkey, admin_sms_senderid from dt_generalsettings");
		if ($result_set->num_rows() > 0) {
			$sms_username    = $result_set->row()->admin_sms_username;
			$sms_password    = $result_set->row()->admin_sms_password;
			$sms_authkey    = $result_set->row()->admin_sms_authkey;
			$sms_senderid    = $result_set->row()->admin_sms_senderid;
		}
		$result_set->free_result();

		//Generating SMS Url with User Name, Password and Sender ID
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@password@@", $sms_password, $sms_returnurl);
		$sms_returnurl = str_replace("@@authkey@@", $sms_authkey, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", "91" . $mobile_no, $sms_returnurl);
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
		$sms_returnurl = str_replace("@@dlt_id@@", $dlt_id, $sms_returnurl);

		//returning gererated URL
		return     $sms_returnurl;
	}
	function get_admin_nos()
	{
		$result = array();
		$resultset = $this->CI->db->query("SELECT is_admin_mob1,is_admin_mob2,is_admin_mob3,is_admin_mob4,is_admin_mob5,admin_mob1,admin_mob2,admin_mob3,admin_mob4,admin_mob5 FROM dt_generalsettings");
		foreach ($resultset->result() as $row) {
			$result['is_admin_mob1']     = $row->is_admin_mob1;
			$result['is_admin_mob2']     = $row->is_admin_mob2;
			$result['is_admin_mob3']     = $row->is_admin_mob3;
			$result['is_admin_mob4']     = $row->is_admin_mob4;
			$result['is_admin_mob5']     = $row->is_admin_mob5;
			$result['admin_mob1']          = "91" . $row->admin_mob1;
			$result['admin_mob2']          = "91" . $row->admin_mob2;
			$result['admin_mob3']          = "91" . $row->admin_mob3;
			$result['admin_mob4']          = "91" . $row->admin_mob4;
			$result['admin_mob5']         = "91" . $row->admin_mob5;
		}
		return $result;
	}
	function updateProfile($profileData, $userId)
	{
		$returndata = array();
		if ($this->CI->db->update('dt_customer', $profileData, array('cus_id' => $userId))) {
			$returndata = array('status' => 1, 'error' => 'Profile updated successfully');
		} else {
			$returndata = array('status' => 0, 'error' => 'Update faild');
		}
		return $returndata;
	}
	function user_device_register($regid, $uuid, $type)
	{
		$query = $this->CI->db->query("SELECT * FROM dt_user_device WHERE device_token='" . $regid . "' AND device_uuid='" . $uuid . "'");
		if ($query->num_rows() > 0) {
			return array('status' => 1, 'error' => 'Token updated successfully');
		} else {
			$uuidquery = $this->CI->db->query("SELECT * FROM dt_user_device WHERE device_uuid='" . $uuid . "'");
			//return "AFFROWS : " . $uuidquery->num_rows();
			if ($uuidquery->num_rows() > 0) {
				if ($this->CI->db->update("dt_user_device", array("device_token" => $regid), array("device_uuid" => $uuid))) {
					return array('status' => 1, 'error' => 'Token updated successfully');
				} else {
					return array('status' => 1, 'error' => 'Token updated successfully');
				}
			} else {
				if ($this->CI->db->insert('dt_user_device', array('device_token' => $regid, 'device_uuid' => $uuid, 'device_type' => $type))) {
					return array('status' => 1, 'error' => 'Token updated successfully');
				} else {
					return array('status' => 0, 'error' => 'Token updated faild');
				}
			}
		}
	}
	function get_orderdetails($book_no)
	{
		$resultset = $this->CI->db->query("SELECT cus_name, cus_email, cus_mobile, TRIM(book_qty)+0 AS book_qty, book_rate, book_totalcost, com_name, rcom_comtype AS com_type, date_format(book_datetime,'%d-%m-%Y  %h:%i:%s')  AS book_datetime, book_status, ordertype, book_comweight, book_cusid, cus_company_name, orderstatus, book_deviceid, com_margin_type, com_margin_value, admin_company_name, display_margin, margin_reverse_type, confirmation_for, book_type, book_bar_type,book_by,
		book_ishedge, ifnull(price,'') price, (sum(volume)*100) as mt5qty, book_no, book_comid
		FROM dt_booking
		LEFT JOIN dt_customer ON book_cusid = cus_id
		LEFT JOIN dt_com_master ON book_comid = com_id
		LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
		LEFT JOIN dt_mt5_hedgedata AS mt5 ON book_no = mt5.cusbookid
		INNER JOIN dt_generalsettings WHERE book_no = '" . $book_no . "' GROUP BY cusbookid");
		return $resultset;
	}
	function get_customertransactions($cus_id)
	{
		$result_data = array();

		$closing_balance = 0;

		$str_query = "SELECT IF(trans_payment_type = 0, '-', trans_book_code) AS trans_book_code, date_format(trans_date,'%d-%m-%Y %H:%i:%s') AS trans_date , if(trans_actype = 0, trans_amount,0) AS credit, if(trans_actype = 1, trans_amount,0) AS debit, trans_comments FROM dt_transaction WHERE trans_cuscode = '" . $cus_id . "' ORDER BY trans_date, trans_id ASC";
		$resultset = $this->CI->db->query($str_query);
		foreach ($resultset->result() as $row) {
			$credit = round($row->credit, 2);
			$debit = round($row->debit, 2);
			$closing_balance =  round($closing_balance + $credit - $debit, 2);

			$result_data[] = array('trans_book_code' => $row->trans_book_code, 'trans_date' => $row->trans_date, 'trans_desc' => $row->trans_comments, 'credit' => number_format($credit, 2, '.', ''), 'debit'  => number_format($debit, 2, '.', ''), 'closing_balance'  => number_format($closing_balance, 2, '.', ''));
		}
		return $result_data;
	}
	function get_mobilemessages()
	{
		$resultdata = array();
		$message_query = $this->CI->db->query("SELECT news_id, news, date_format(updatetime, '%d-%m-%Y %h:%i:%s') as updatetime FROM dt_news WHERE status = 1 AND isprimary = 0 ORDER BY news_id DESC");
		if ($message_query->num_rows() > 0) {
			foreach ($message_query->result() as $row) {
				$resultdata[] = array('messageid' => $row->news_id, 'messages' => urlencode($row->news), 'lastupdate' => $row->updatetime);
			}
		}
		return $resultdata;
	}
	function getratehistoryreport($from_date = "", $to_date = "")
	{
		$returndata = array();
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		$resultset = $this->CI->db->query("SELECT DATE_FORMAT(rate_date,'%d-%m-%Y') AS rate_date,
										round(avg(gold_rate),2) as gold_rate,round(avg(ifnull(gold_rate1,0)),2) as gold_rate1, round(avg(silver_rate),2) as silver_rate
										FROM dt_rate_history as rh where rate_date between '" . $from_date . "'
										and '" . $to_date . "' Group By rh.rate_date");
		$gold1_totalcost            =    0;
		$gold2_totalcost            =    0;
		$silver_totalcost            =    0;

		$gold1_avgcost            =    0;
		$gold2_avgcost            =    0;
		$silver_avgcost            =    0;

		foreach ($resultset->result() as $row) {
			$gold1_totalcost        +=    $row->gold_rate;
			$gold2_totalcost        +=    $row->gold_rate1;
			$silver_totalcost        +=    $row->silver_rate;
		}
		if ($resultset->num_rows() > 0) {
			$gold1_avgcost            =    number_format($gold1_totalcost / $resultset->num_rows(), 2, '.', '');
			$gold2_avgcost            =    number_format($gold2_totalcost / $resultset->num_rows(), 2, '.', '');
			$silver_avgcost            =    number_format($silver_totalcost / $resultset->num_rows(), 2, '.', '');
		}
		$userData['gold1_avg']         = $gold1_avgcost;
		$userData['gold2_avg']        = $gold2_avgcost;
		$userData['silver_avg']      = $silver_avgcost;

		$records    =    array();
		$records[0]    =    $resultset;
		$records[1]    =    $userData;

		$returndata = array('bookingdata' => $resultset->result_array(), 'bookingavg' => $userData);

		return $returndata;
	}
	function getdateratehistoryreport($history_date)
	{
		$returndata = array();
		$history_date = date('Y-m-d', strtotime($history_date));
		$resultset = $this->CI->db->query("SELECT rate_time,
						round(gold_rate,2) as gold_rate,round(ifnull(gold_rate1,0),2) as gold_rate1, round(silver_rate,2) as silver_rate
						FROM dt_rate_history as rh where rh.rate_date = '" . $history_date . "'");
		$returndata = array('historydata' => $resultset->result_array());
		return $returndata;
	}
	function get_availablebalance($cus_id)
	{
		$margin_amt = 0;
		$resultset = $this->CI->db->query("SELECT IFNULL(SUM( if(trans_actype = 1, -1, 1) * IFNULL(trans_amount,0) ),0) as Balance FROM dt_transaction WHERE trans_cuscode = '" . $cus_id . "'");
		foreach ($resultset->result() as $row) {
			$margin_amt  = $row->Balance;
		}
		return $margin_amt;
	}
	function insertBookingLog($record)
	{
		$updatedRecord['Book No']         = $record['book_no'];
		$updatedRecord['Cus Id']         = $record['book_cusid'];
		$updatedRecord['Com Id']         = $record['book_comid'];
		$updatedRecord['Qty(Kg)']         = (string)$record['book_qty'];
		$updatedRecord['Book Rate']     = $record['book_rate'];
		$updatedRecord['Total Cost']     = (string)$record['book_totalcost'];
		$updatedRecord['Book Type']     = $record['book_type'];
		$updatedRecord['Com Weight']     = $record['book_comweight'];
		$updatedRecord['No of Bars']     = $record['book_no_bar'];
		$updatedRecord['Status']         = $record['book_status'];
		$updatedRecord['Order Type']     = $record['ordertype'];
		$updatedRecord['Booked in']     = $record['book_by'];
		if ($record['book_marginhold'] > 0) {
			$updatedRecord['Margin']             = $record['book_marginhold'];
			$updatedRecord['Book Margin']         = $record['book_margin'];
			$updatedRecord['Margin Type']         = $record['book_margintype'];
			$updatedRecord['Margin Status']     = $record['book_marginstatus'];
			$updatedRecord['Margin Taken Qty']     = $record['book_margin_takenqty'];
			$updatedRecord['Margin Qty']         = (string)$record['book_marginqty'];
		}

		$bookId = array('Book No' => $record['book_no']);
		$updatedRecord = $bookId + $updatedRecord;
		$records = json_encode($updatedRecord);
		$ipaddr = $_SERVER['SERVER_ADDR'];

		// Add source information based on book_by value
		$source = '';
		if (isset($record['book_by'])) {
			switch ($record['book_by']) {
				case 0:
					$source = ' (Web)';
					break;
				case 1:
					$source = ' (App)';
					break;
				case 2:
					$source = ' (Browser)';
					break;
				case 3:
					$source = ' (Admin)';
					break;
				case 4:
					$source = ' (Admin App)';
					break;
				default:
					$source = ' (Unknown)';
					break;
			}
		}

		// Create user friendly log data
		$user_friendly_log_data = array(
			'Book No' => $record['book_no'],
			'Cus Id' => $record['book_cusid'],
			'Commodity Id' => $record['book_comid'],
			'Quantity' => $record['book_qty'],
			'Rate' => $record['book_rate'],
			'Total Cost' => $record['book_totalcost'],
			'Book Type' => $record['book_type'] == 0 ? 'Web' : ($record['book_type'] == 1 ? 'Mobile' : ($record['book_type'] == 2 ? 'Admin' : '')),
			'Order Type' => $record['ordertype'] == 0 ? 'Limit' : 'Market'
		);

		// Add log_admin_add based on book_type
		if (isset($record['book_type'])) {
			switch ($record['book_type']) {
				case 0: // Admin
					log_admin_add('Booking Success', 'Phone Booking', $user_friendly_log_data, 'Web-User Booking completed successfully');
					break;
				case 1: // User
					log_admin_add('Booking Success', 'Phone Booking', $user_friendly_log_data, 'Mobile-Phone booking completed successfully');
					break;
				case 2: // Mobile
					log_admin_add('Booking Success', 'Phone Booking', $user_friendly_log_data, 'Admin-Phone booking completed successfully');
					break;
			}
		}

		if ($record['ordertype'] == 0)
			$log_shortdesc     = $source . " - New booking. Book No: " . $record['book_no'];
		else
			$log_shortdesc     = $source . " - Limit Order. Order No: " . $record['book_no'];
		$user_id = $record['book_cusid'];
		$logtype = 0;
		$logdatetime = date('Y-m-d H:i:s');
		$logupdatedata = date('Y-m-d H:i:s');
		//$this->CI->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('" . $logdatetime . "','" . $logtype . "','" . $logupdatedata . "','" . $log_shortdesc . "','" . $records . "','NULL','NULL','NULL','','" . $ipaddr . "')");
	}

	function cancelLimitLog($record)
	{
		// Add source information based on book_by value
		$source = '';
		if (isset($record['book_by'])) {
			switch ($record['book_by']) {
				case 0:
					$source = ' (Web)';
					break;
				case 1:
					$source = ' (App)';
					break;
				case 2:
					$source = ' (Browser)';
					break;
				case 3:
					$source = ' (Admin)';
					break;
				case 4:
					$source = ' (Admin App)';
					break;
				default:
					$source = ' (Unknown)';
					break;
			}
		}

		// Prepare data for logging
		$log_data = array('Book No' => $record['book_no'], 'Customer ID' => $record['book_cusid']);

		// Use the standardized admin logging function for add operation
		$log_description = $source . " - Limit Order Cancelled. Order No: " . $record['book_no'];
		log_admin_add(0, 'Trading', $log_data, $log_description);
	}

	function get_commoditystatus($cus_id)
	{
		$status = array();
		// $resultset = $this->CI->db->query("SELECT cus_com_id, IF(IFNULL(com_sel_trade,0) = 1 AND IF(IFNULL(cus_com_status_sell,-1) = 1 OR  IFNULL(cus_com_status_sell,-1) = -1, 1, 0) = 1, 1 ,0) AS  cus_com_status_sell,
		// 	                                  IF(IFNULL(com_buy_trade,0) = 1 AND IF(IFNULL(cus_com_status_buy,-1) = 1 OR  IFNULL(cus_com_status_buy,-1) = -1, 1, 0) = 1, 1 ,0) AS cus_com_status_buy,
		// 									  cus_com_amountpurch,
		// 									  cus_com_smoq, cus_com_pmoq,
		// 									  if(com.com_type = 1, 1, 0) AS com_type
		//                                       FROM dt_cus_commodity AS ccd
		//                                       LEFT JOIN dt_customergroupitems AS cgi ON ccd.cus_com_cus_id = cgi.cgitems_cusid
		//                                       LEFT JOIN dt_com_group_master AS cgm ON cgi.cgitems_comgroupid = cgm.com_group_id
		//                                       LEFT JOIN dt_com_group_com AS cgc ON cgm.com_group_id = cgc.com_group_id AND cgc.com_id = ccd.cus_com_id
		// 									  LEFT JOIN dt_com_master AS com ON ccd.cus_com_id = com.com_id
		//                                       WHERE cgm.com_group_active = 1 AND ccd.cus_com_cus_id =  '".$cus_id."' AND (cgc.com_sel_active = 1 OR cgc.com_buy_active = 1)");
		$resultset = $this->CI->db->query("SELECT cus_com_id, IF(IFNULL(com_sel_trade,0) = 1 AND IFNULL(prem_comsell_active,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1, 1 ,0) AS  cus_com_status_sell,
					IF(IFNULL(com_buy_trade,0) = 1 AND IFNULL(prem_combuy_active,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1, 1, 0) AS cus_com_status_buy,
					cus_com_smoq, cus_com_pmoq,
					rcom_comtype AS com_type, com_weight, com_bar_quantity, com_margin_type, com_margin_value,cus_com_amountpurch
					FROM dt_customergroupitems cusgrp
					LEFT JOIN dt_com_group_com comgrp ON comgrp.com_group_id = 1
					LEFT JOIN dt_cus_commodity cuscom ON cuscom.cus_com_cus_id = cusgrp.cgitems_cusid
					AND cuscom.cus_com_id  = comgrp.com_id
					LEFT JOIN dt_com_master comm ON comm.com_id = comgrp.com_id
					LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
					LEFT JOIN dt_prem_group_master as pgm ON  pgm.prem_group_id = cgitems_comgroupid
					LEFT JOIN dt_prem_group_com as pgc ON pgc.prem_group_id = pgm.prem_group_id
					AND prem_id = cus_com_id
					WHERE cgitems_cusid = '" . $cus_id . "' AND ((com_sel_active = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1 AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");

		$i = 0;
		foreach ($resultset->result() as $row) {
			$records['status'][$i]['trade_status_id']    = $row->cus_com_id;
			$records['status'][$i]['com_type']            = $row->com_type;
			$records['status'][$i]['trade_status_buy']    = $row->cus_com_status_buy;
			$records['status'][$i]['trade_status_sell'] = $row->cus_com_status_sell;
			$records['status'][$i]['trade_amountpurch'] = $row->cus_com_amountpurch;
			$records['status'][$i]['trade_min_qty']     = $row->cus_com_smoq;
			$records['status'][$i]['trade_max_qty']     = $row->cus_com_pmoq;
			$i++;
		}

		$general = $this->CI->db->query("select cus.customer_type,grl.trade_enable, IF(cus.has_maxqty = 1 or grl.has_gmaxqty, 1, 0) AS has_maxqty, IF(cus.has_maxqty = 1, cus.gold_max_qty,(IF(grl.has_gmaxqty = 1, grl.gold_max_qty,0))) AS gold_max_qty, IF(cus.has_maxqty = 1, cus.silver_max_qty,(IF(grl.has_gmaxqty = 1, grl.silver_max_qty,0))) AS silver_max_qty, IF(cus.has_minqty = 1 or grl.has_gminqty, 1, 0) AS has_minqty, IF(cus.has_minqty = 1, cus.gold_min_qty,(IF(grl.has_gminqty = 1, grl.gold_min_qty,0))) AS gold_min_qty, IF(cus.has_minqty = 1, cus.silver_min_qty,(IF(grl.has_gminqty = 1, grl.silver_min_qty,0))) AS silver_min_qty  from dt_generalsettings AS grl, dt_customer AS cus WHERE cus_id = " . $cus_id);
		foreach ($general->result() as $settings) {
			$records['trade_enable']     = $settings->trade_enable;
			$records['has_maxqty']         = $settings->has_maxqty;
			$records['gold_max_qty']     = $settings->gold_max_qty;
			$records['silver_max_qty']     = $settings->silver_max_qty;
			$records['has_minqty']         = $settings->has_minqty;
			$records['gold_min_qty']     = $settings->gold_min_qty;
			$records['silver_min_qty']     = $settings->silver_min_qty;
			$records['customer_type']     = $settings->customer_type;
		}
		return $records;
	}

	function get_clientlimit($cus_id)
	{
		$str_query = "SELECT
		IF(cus.has_gminqty = 1, CONCAT(TRIM(cus.gold_min_qty*1000)+0, ' Gm'), IF(grl.has_gminqty = 1, CONCAT(TRIM(grl.gold_min_qty*1000)+0, ' Gm'), '-')) AS gold_min_qty,
		IF(cus.has_sminqty = 1, CONCAT(TRIM(cus.silver_min_qty)+0, ' kg'), IF(grl.has_sminqty = 1, CONCAT(TRIM(grl.silver_min_qty)+0, ' Kg'), '-')) AS silver_min_qty,
		IF(cus.has_gmaxqty = 1, CONCAT(TRIM(cus.gold_max_qty*1000)+0, ' Gm'), IF(grl.has_gmaxqty = 1, CONCAT(TRIM(grl.gold_max_qty*1000)+0, ' Gm'), '-')) AS gold_max_qty,
		IF(cus.has_smaxqty = 1, CONCAT(TRIM(cus.silver_max_qty)+0, ' kg'), IF(grl.has_smaxqty = 1, CONCAT(TRIM(grl.silver_max_qty)+0, ' Kg'), '-')) AS silver_max_qty,
		IF(cus.has_gallot_qty = 1, CONCAT(TRIM(cus.gold_allot_qty*1000)+0, ' Gm'), IF(grl.has_gallot_qty = 1, CONCAT(TRIM(grl.gold_allot_qty*1000)+0, ' Gm'), '-')) AS gold_allot_qty,
		IF(cus.has_sallot_qty = 1, CONCAT(TRIM(cus.silver_allot_qty)+0, ' kg'), IF(grl.has_sallot_qty = 1, CONCAT(TRIM(grl.silver_allot_qty)+0, ' Kg'), '-')) AS silver_allot_qty
		FROM dt_customer AS cus,
		dt_generalsettings AS grl
		WHERE cus_id = '" . $cus_id . "'";
		$resultset = $this->CI->db->query($str_query);
		return $resultset;
	}

	function load_pendingorders($cus_id)
	{
		$record['has_ordered'] = 0;

		$resultset = $this->CI->db->query("SELECT book_no, book_cusid, book_comid,
									   book_rate, book_no_bar,
									   book_comtype, book_qty, book_type,book_totalcost,
									   book_request_amtwt
									   FROM dt_booking
									   WHERE book_cusid = '" . $cus_id . "'  AND ordertype = 1 AND orderstatus = 0");
		$i = 0;
		foreach ($resultset->result_array() as $row) {
			$record['has_ordered'] = 1;
			$record['order'][$i]['order_bookno']     = $row['book_no'];
			$record['order'][$i]['order_qty']         = $row['book_qty'];
			$record['order'][$i]['book_comid']         = $row['book_comid'];
			$record['order'][$i]['order_rate']         = $row['book_rate'];
			$record['order'][$i]['book_no_bar']     = $row['book_no_bar'];
			$record['order'][$i]['order_comtype']     = $row['book_comtype'];
			$record['order'][$i]['book_type']         = $row['book_type'];
			$record['order'][$i]['order_totalcost'] = $row['book_totalcost'];
			$record['order'][$i]['order_request_amtwt'] = $row['book_request_amtwt'];
			$i++;
		}

		return $record;
	}

	function get_booking_report($cus_id, $from_date = "", $to_date = "", $comType = "", $type = "")
	{
		$days_expire = "";
		$query = $this->CI->db->query("SELECT if(expire_history = 1, days_expire,'') AS days_expire FROM dt_generalsettings");
		$days_expire     = $query->row()->days_expire;

		$date_expire = $days_expire != "" ? ($days_expire > 0 ? ("IF(IFNULL(ordertype,0) = 1 AND (IFNULL(orderstatus,0) = 1 OR IFNULL(orderstatus,0) = 0), IF(IFNULL(orderstatus,0) = 0, 1 ,IF(IFNULL(orderplacedtime,'') != '' , IF(DATE_ADD(DATE(orderplacedtime), INTERVAL " . $days_expire . " DAY) >= CURDATE() , 1, 0), 1)), IF(DATE_ADD(DATE(book_datetime), INTERVAL " . $days_expire . " DAY) >= CURDATE() , 1, 0)) = 1 AND ") : " 0 AND ") : "";

		if ($from_date != "" && $to_date != "") {
			$from_date = date('Y-m-d', strtotime($from_date));
			$to_date = date('Y-m-d', strtotime($to_date));
			$date = "AND DATE(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) BETWEEN '" . $from_date . "' AND '" . $to_date . "'";
		} else {
			$date = "";
		}

		$limit = $type == 0 ? ' LIMIT 5 ' : '';

		$resultset = $this->CI->db->query("SELECT
										book_no,
										DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as book_datetime,
										com_name,
										TRIM(book_rate)+0 AS book_rate,
										round(if(book_bar_type = 0 , (book_rate/book_comweight)*10, if(book_bar_type = 1 , (book_rate/book_comweight)*1000, (book_rate/book_comweight))),2) as ratepergram,
										if(book_bar_type = 1 , CONCAT(TRIM(book_qty)+0, ' Kg'), CONCAT(TRIM(book_qty * 1000)+0, ' Gm')) as qty, if(book_type=0,'Buy','Sell') as type,
										if(book_bar_type = 1, book_qty - ifnull(book_physicalqty,0) - ifnull(book_hedgqty,0), (book_qty - ifnull(book_physicalqty,0) - ifnull(book_hedgqty,0)) * 1000) as unpaid_qty,
										book_totalcost,
										round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as physicalqtyamount,
										0 as unpaid_amount,
										book_qty - ifnull(book_hedgqty,0) as physicalqty,
										if(if(book_bar_type = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 6, if(book_status = 2, 2, if(book_status = 3, 3, if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 1,if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 4, if(book_status = 0 and ifnull(orderstatus,0) = 0, 0, (if(book_qty - ifnull(deliveredqty,0) > 0 and ifnull(deliveredqty,0) > 0, 5 , if(ifnull(orderstatus,0) = 4, 7, if(ifnull(orderstatus,0) = 5, 8, '')))))))))) as bookstatus,
										if(book_bar_type = 1 , CONCAT(ifnull(TRIM(del_qty.deliveredqty)+0,0),' Kg'), CONCAT(TRIM(ifnull(del_qty.deliveredqty,0)*1000)+0,' Gm')) as delivered_qty,
										book_hedgqty as hedgqty, ifnull(del_qty.deliverydate,'-') as deliverydate, if(book_by = 3,'Admin', 'User') AS book_by,
										if(book_bar_type = 1 , CONCAT(TRIM(IFNULL(book_qty,0) - IFNULL(del_qty.deliveredqty,0))+0, ' Kg'), CONCAT(TRIM((IFNULL(book_qty,0) - IFNULL(del_qty.deliveredqty,0)) * 1000)+0, ' Gm')) as pending_qty,
										round((IFNULL(book_qty,0) - IFNULL(del_qty.deliveredqty,0))*(book_rate/book_comweight)*1000, 2) as pending_amt,
						if(ordertype=0,'Book','Limit') as ordertype
										from dt_booking
										LEFT JOIN
										(SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty, ifnull(date_format(max(cusdel_date), '%d-%m-%Y %h:%i:%s %p'), '-') as deliverydate
										from dt_customerdelivery where cusdel_cusname = '" . $cus_id . "' group by cusdel_bookno)
										as del_qty on del_qty.cusdel_bookno = book_no
										LEFT JOIN dt_com_master ON com_id = book_comid
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										LEFT JOIN dt_customer ON book_cusid = cus_id
										WHERE " . $date_expire . " book_cusid = '" . $cus_id . "'
										" . $date . " order by IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime) DESC " . $limit);

		$records    =    array();
		$records[0]    =    $resultset->result_array();

		return $records;
	}

	function get_tolerance()
	{
		$result = array();
		$resultset = $this->CI->db->query("SELECT gold_tol, silver_tol from dt_generalsettings");
		foreach ($resultset->result() as $row) {
			$result['gold_tol']     = explode("#", $row->gold_tol);
			$result['silver_tol']     = explode("#", $row->silver_tol);
		}
		return $result;
	}

	function get_phonebookreport()
	{
		$str_query = "SELECT book_cusid as bookcusid, book_no as bookno,
						date_format(book_datetime,'%d-%m-%Y %h:%i:%s %p') as bookdate,
						book_comid as comcode,rcom_comtype as com_type,
						if(book_type=0,'Sell','Buy') as book_type,book_rate,
						cus_name as customername,cus_mobile,
						REPLACE(com_name,'`','') as commodityname,
						if(ordertype = 0 ,book_status,orderstatus) as book_status,
						TRIM(book_qty*1000)+0 as bookqty,cus_id as cuscode,
						round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
						(book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty,
						ifnull(del_qty.cusdel_bookno,0) as del_bookno,
						round((book_totalcost / (book_qty * 1000)) * ((book_qty * 1000) - ifnull((del_qty.deliveredqty * 1000),0)),2) as BalanceAmount,
						ordertype,
						cus_alise_name,
						ifnull(book_usercomment,'') as book_usercomment,
						ifnull(cus_city,'-') AS cus_city,book_by,
						if(order_actualprice = 0, '-', order_actualprice) AS order_actualprice,if(order_liveprice = 0, '-', order_liveprice) AS order_liveprice,
						if(if(rcom_comtype = 1, book_qty - ifnull(deliveredqty,0), (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000) = 0, 'Delivered', if(book_status = 2, 'Waiting for approval', if(book_status = 3, 'Rejected', if(book_status = 1 AND ifnull(deliveredqty,0) = 0, 'Confirmed',if(ifnull(orderstatus,0) = 3 or ifnull(orderstatus,0) = 2, 'Limit Canceled', if(book_status = 0, 'In Process', 'Partial Del')))))) as status
						From dt_booking
						Left Join dt_customer on cus_id = book_cusid
						Left Join dt_com_master on com_id = book_comid
						Left Join dt_rpanelcommodities on rcom_id = com_type
						LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty,
									ifnull(date_format(cusdel_date, '%d-%m-%Y %h:%i:%s %p'), '-') as deliverydate
									from dt_customerdelivery group by cusdel_bookno)
									as del_qty on del_qty.cusdel_bookno = book_no
						WHERE IFNULL(delete_status,0) = 0 AND book_by = 3
					   ORDER BY
					  	book_datetime
					   DESC LIMIT 10";
		$query = $this->CI->db->query($str_query);
		return $query;
	}

	function get_custradedata($cus_id)
	{
		// $resultset = $this->CI->db->query("SELECT cus_com_id,cus_com_cus_id, IF(IFNULL(com_sel_trade,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1, 1 ,0) AS  cus_com_status_sell,
		// 	                                  IF(IFNULL(com_buy_trade,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1, 1, 0) AS cus_com_status_buy, cus_com_amountpurch, cus_com_smoq as buymoq,
		// 									  cus_com_pmoq as sellmoq, rcom_comtype as comtype, com_weight, com_bar_quantity, com_margin_type, com_margin_value
		//                                       FROM dt_cus_commodity AS ccd
		//                                       LEFT JOIN dt_customergroupitems AS cgi ON ccd.cus_com_cus_id = cgi.cgitems_cusid
		//                                       LEFT JOIN dt_com_group_master AS cgm ON cgi.cgitems_comgroupid = cgm.com_group_id
		// 									  LEFT JOIN dt_com_master as comm ON comm.com_id = ccd.cus_com_id
		// 									  LEFT JOIN dt_rpanelcommodities ON rcom_id = comm.com_type
		//                                       LEFT JOIN dt_com_group_com AS cgc ON cgm.com_group_id = cgc.com_group_id AND cgc.com_id = ccd.cus_com_id
		//                                       WHERE cgm.com_group_active = 1 AND (cgc.com_sel_active = 1 OR cgc.com_buy_active = 1)");
		// 									//   print_r($resultset);exit;


		$resultset = $this->CI->db->query("SELECT cus_com_id,com_name,cuscom.cus_com_cus_id, IF(IFNULL(com_sel_trade,0) = 1 AND IFNULL(prem_comsell_active,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1, 1 ,0) AS  cus_com_status_sell,
											IF(IFNULL(com_buy_trade,0) = 1 AND IFNULL(prem_combuy_active,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1, 1, 0) AS cus_com_status_buy,cuscom.cus_com_amountpurch,
											cus_com_smoq as buymoq, cus_com_pmoq as sellmoq,
											rcom_comtype as comtype, com_weight, com_bar_quantity, com_margin_type, com_margin_value,pgc.prem_buy_premium as prem_buy_premium,  pgc.prem_sel_premium as prem_sel_premium
											FROM dt_customergroupitems cusgrp
											LEFT JOIN dt_com_group_com comgrp ON comgrp.com_group_id = 1
											LEFT JOIN dt_cus_commodity cuscom ON cuscom.cus_com_cus_id = cusgrp.cgitems_cusid
											AND cuscom.cus_com_id  = comgrp.com_id
											LEFT JOIN dt_com_master comm ON comm.com_id = comgrp.com_id
											LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
											LEFT JOIN dt_prem_group_master as pgm ON  pgm.prem_group_id = cgitems_comgroupid
											LEFT JOIN dt_prem_group_com as pgc ON pgc.prem_group_id = pgm.prem_group_id
											AND prem_id = cus_com_id
											WHERE cgitems_cusid = '" . $cus_id . "' AND ((com_sel_active = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1 AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");
		foreach ($resultset->result() as $row) {
			$records['status'][] = array("cus_id" => $row->cus_com_cus_id, "trade_status_id" => $row->cus_com_id, "com_name" => $row->com_name, "trade_status_buy" => $row->cus_com_status_buy, "prem_buy_premium" => $row->prem_buy_premium, "prem_sel_premium" => $row->prem_sel_premium, "trade_status_sell" => $row->cus_com_status_sell, "trade_amountpurch" => $row->cus_com_amountpurch, "buymoq" => $row->buymoq, "sellmoq" => $row->sellmoq, "comtype" => $row->comtype, "com_weight" => $row->com_weight, "com_bar_quantity" => $row->com_bar_quantity, "com_margin_type" => $row->com_margin_type, "com_margin_value" => $row->com_margin_value);
		}

		$general = $this->CI->db->query("select trade_enable, limit_enable, clientlimit_enable from dt_generalsettings");
		foreach ($general->result() as $settings) {
			$records['trade_enable'] = $settings->trade_enable;
			$records['limit_enable'] = $settings->limit_enable;
			$records['clientlimit_enable'] = $settings->clientlimit_enable;
		}

		$customer_q = $this->CI->db->query("select cus_limitenable from dt_customer where cus_id = '" . $cus_id . "'");
		foreach ($customer_q->result() as $row) {
			$records['cus_limitenable'] = $row->cus_limitenable;
		}

		$resultset = $this->CI->db->query("SELECT trans_cuscode, IFNULL(SUM( if(trans_actype = 1, -1, 1) * IFNULL(trans_amount,0) ),0) as Balance FROM dt_transaction GROUP BY trans_cuscode");

		foreach ($resultset->result() as $row) {
			$records['allMargins'][] = array('cus_id' => $row->trans_cuscode, 'margin_amt' => $row->Balance);
		}

		$return_data = array();
		$commodityquery = $this->CI->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
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
			WHERE cgitems_cusid = '" . $cus_id . "' AND ((com_sel_active = 1 AND IFNULL(cus_com_status_sell,0) = 1) OR (com_buy_active =1 AND IFNULL(cus_com_status_buy,0) = 1)) ORDER BY com_order_number");
		$commoditydetails = $commodityquery->result_array();
		$commodityquery->free_result();
		$return_data = array('commoditydetails' => $commoditydetails, 'records' => $records);
		return $return_data;
	}
	function get_customers()
	{
		$query = $this->CI->db->query("select cus_id, cus_name, cus_login_name, replace(com_group_name,' ','_') as groupname,cus_company_name, cus_alise_name, cus_mobile from dt_customer
								LEFT JOIN dt_customergroupitems ON cgitems_cusid = cus_id
								LEFT JOIN dt_com_group_master ON com_group_id = cgitems_comgroupid WHERE cus_active = 1 and cus_login_name != 'guest' ORDER BY cus_id");

		return  $query->result_array();
	}

	public function get_data_order($comType = "", $bookType = "")
	{
		$comType = $comType == -1 ? '' : ($comType == 0 ? ' AND rcom_comtype = 0 ' : ($comType == 1 ? ' AND rcom_comtype = 1 ' : ''));

		$bookType = $bookType == -1 ? '' : ($bookType == 0 ? ' AND book_type = 0 ' : ($bookType == 1 ? '   AND book_type = 1 ' : ''));

		$query = $this->CI->db->query("SELECT
										book_no,DATE_FORMAT(book_datetime,'%d-%m-%Y %H:%i:%s') as book_datetime, book_rate, cus_id, cus_name, com_name, com_id,
										book_qty, if(book_type=0, 'Sell', 'Buy') as book_type,ifnull(book_usercomment,'') as book_usercomment,ifnull(book_liveprice,0) as book_liveprice,
										if(book_status=0,'Request',if(book_status=1,'Confirm',
										if(orderstatus=0,'Request',''))) as orderstatus,book_totalcost,cus_alise_name,ifnull(cus_city,'-') AS cus_city,book_comid, cus_mobile, cus_company_name, rcom_comtype AS com_type
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
										" . $comType . " " . $bookType . "
										AND ifnull(delete_status,0) = 0
									ORDER BY
										book_no desc");
		return $query;
	}

	public function clear_order()
	{
		$admin_id                  = get_adminUserId();
		$adminipaddress           = $_SERVER['SERVER_ADDR'];
		$clearall_ratealert_url    =  trim(isset(Globals::$clearallratealert) ? Globals::$clearallratealert : '');
		$client                        =  trim(isset(Globals::$client) ? Globals::$client : '');
		if ($clearall_ratealert_url != '' && $client != '') {
			$pending_orders = $this->CI->db->query("SELECT  book_no, book_rate, cus_name, com_name, book_qty, cus_mobile, book_bar_type FROM
									dt_booking
								LEFT JOIN
									dt_customer ON cus_id = book_cusid
								LEFT JOIN
									dt_com_master ON com_id = book_comid
								LEFT JOIN
									dt_rpanelcommodities ON rcom_id = com_type
								WHERE
									orderstatus=0 AND ordertype = 1");

			if ($this->CI->db->query("update dt_booking set orderstatus=3, book_adminuser='" . $admin_id . "', book_adminipaddress='" . $adminipaddress . "' where ordertype = 1 and orderstatus = 0")) {
				foreach ($pending_orders->result() as $orders) {
					$Qty = $orders->book_bar_type == 0 ? ($orders->book_qty * 1000) . " gms" : ($orders->book_qty) . " kg";

					$messageForCustomer = "Dear " . ($orders->cus_name) . ", your booking(book No:" . ($orders->book_no) . ") for " . $orders->com_name . " with qty " . $Qty . " at Rs. " . ($orders->book_rate) . " is CANCELLED.";
					$resp = whatsapp_message_helper($orders->cus_mobile, $messageForCustomer);
					$sms_api = $this->get_SMSAppSettings(1, $orders->cus_mobile);
					$arr = array("@@message@@" => $messageForCustomer);
					$sms_url = strtr($sms_api, $arr);

					if ($sms_url != '') {
						$curl_resp = curl_helper($sms_url, $sms_url);
					}
				}

				$requestdata = array('client'  => $client);
				$field_string = http_build_query($requestdata);
				$curl_resp = curl_helper($clearall_ratealert_url, $field_string);
				return true;
			} else
				return false;
		} else
			return false;
	}

	public function inline_update()
	{
		// print_r($_POST);exit;
		$pk     = $_POST['pk'];
		$value     = $_POST['value'];
		$fname     = $_POST['fname'];
		$admin_id                  = get_adminUserId();
		$adminipaddress           = $_SERVER['SERVER_ADDR'];
		$update_ratealert_url    =  trim(isset(Globals::$updateratealert) ? Globals::$updateratealert : '');
		$client                      =  trim(isset(Globals::$client) ? Globals::$client : '');
		$book_no = $pk;
		if ($update_ratealert_url != '' && $client != '') {
			//Get previous old records to compare and update in log table
			$oldRecord = $this->get_entry_record($book_no);

			$this->CI->db->where('book_no', $book_no);
			$resultset = $this->CI->db->query("select book_cusid, book_comid, book_type, book_qty, book_rate, book_comweight,book_no_bar,book_cusid from dt_booking where book_no = '" . $book_no . "' AND ordertype = 1 AND orderstatus = 0");
			if ($resultset->num_rows() > 0) {
				foreach ($resultset->result() as $row) {
					$book_qty         = $row->book_qty;
					$book_comweight = $row->book_comweight;
					$book_cusid      = $row->book_cusid;
					$book_comid      = $row->book_comid;
					$book_type       = $row->book_type;
					$book_rate         = $row->book_rate;
					$book_no_bar    = $row->book_no_bar;
					$book_cusid        = $row->book_cusid;
				}

				if ($fname == 'book_qty') {
					$book_totalcost = ($book_rate / $book_comweight)  *  ($value / 1000) * 1000;
					$data = array(
						$fname => $value / 1000,
						'book_totalcost' => $book_totalcost
					);
				} else {
					$book_totalcost = ($value / $book_comweight)  *  ($book_qty) * 1000;
					$data = array(
						$fname => $value,
						'book_totalcost' => $book_totalcost
					);
				}
				/* $book_totalcost = ($_POST['value']/$book_comweight)  *  ($book_qty) * 1000;

				$data = array(
					   $fname => $_POST['value']/1000,
					   'book_totalcost' => $book_totalcost
					); */
				//print_r($data);exit;
				if ($this->CI->db->update($this->table_name, $data)) {
					if ($fname == 'book_qty') {
						$requestdata = array(
							'client' => $client,
							'book_cusid' => $book_cusid,
							'book_comid' => $book_comid,
							'book_type'  => $book_type,
							'book_rate'  => $book_rate,
							'book_qty'   => $_POST['value'] / 1000,
							'book_no'    => $book_no
						);
					} else {
						$requestdata = array(
							'client' => $client,
							'book_cusid' => $book_cusid,
							'book_comid' => $book_comid,
							'book_type'  => $book_type,
							'book_rate'  => $_POST['value'],
							'book_qty'   => $book_qty,
							'book_no'    => $book_no
						);
					}
					/* $requestdata = array('client' => $client,
										 'book_cusid' => $book_cusid,
										 'book_comid' => $book_comid,
										 'book_type'  => $book_type,
										 'book_rate'  => $_POST['value'],
										 'book_qty'   => $book_qty,
										 'book_no'    => $book_no
										); */

					$field_string = http_build_query($requestdata);
					$curl_resp = curl_helper($update_ratealert_url, $field_string);

					$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
					if ($url != '') {
						$return_array['limit'] = array('limitupdate' => 1, 'book_no' => "1");
						$field_string = http_build_query($return_array);
						$curl_resp = curl_helper($url, $field_string);
					}
					//Update in Log
					if ($fname == 'book_qty') {
						$log['log_totalcost']     = $book_totalcost;
						$log['book_rate']          = $book_rate;
						$log['book_no']            = $book_no;
						$log['book_qty']        = $_POST['value'];
						$log['book_no_bar']        = $book_no_bar;
						$log['book_cusid']        = $book_no_bar;
					} else {
						$log['log_totalcost']     = $book_totalcost;
						$log['book_rate']          = $_POST['value'];
						$log['book_no']            = $book_no;
						$log['book_qty']        = $book_qty;
						$log['book_no_bar']        = $book_no_bar;
						$log['book_cusid']        = $book_no_bar;
					}
					/* $log['log_totalcost'] 	= $book_totalcost;
					$log['book_rate']  		= $_POST['value'];
					$log['book_no']    		= $book_no;
					$log['book_qty']    	= $_POST['value']; */
					$this->updateLimitLog($oldRecord, $log);

					echo true;
				} else {
					echo mysql_error();
				}
			} else {
				echo "No matching rows found";
			}
		} else {
			echo "Error occured. Please try again";
		}
	}

	public function todayinline_update()
	{
		$admin_id                  = get_adminUserId();
		$adminipaddress           = $_SERVER['SERVER_ADDR'];
		$fname                      = $_POST['name'];
		$book_no                 = $_POST['pk'];
		$clean_value             = str_replace(',', '', $_POST['value']);

		//Get previous old records to compare and update in log table
		$oldRecord = $this->get_entry_record($book_no);

		$this->CI->db->where('book_no', $book_no);
		$resultset = $this->CI->db->query("select book_cusid, book_comid, book_type, book_qty, book_rate, book_comweight,book_no_bar,book_cusid from dt_booking where book_no = '" . $book_no . "'");

		if ($resultset->num_rows() > 0) {
			foreach ($resultset->result() as $row) {
				$book_qty         = $row->book_qty;
				$book_comweight = $row->book_comweight;
				$book_cusid      = $row->book_cusid;
				$book_comid      = $row->book_comid;
				$book_type       = $row->book_type;
				$book_rate         = $row->book_rate;
				$book_no_bar    = $row->book_no_bar;
				$book_cusid        = $row->book_cusid;
			}

			if ($fname == 'book_qty') {
				$book_totalcost = ($book_rate / $book_comweight)  *  ($clean_value / 1000) * 1000;
				$data = array(
					$fname => $clean_value / 1000,
					'book_totalcost' => $book_totalcost
				);
			} else {
				$book_totalcost = ($clean_value / $book_comweight)  *  ($book_qty) * 1000;
				$data = array(
					$fname => $clean_value,
					'book_totalcost' => $book_totalcost
				);
			}
			/* $book_totalcost = ($_POST['value']/$book_comweight)  *  ($book_qty) * 1000;

			$data = array(
				   $_POST['name'] => $_POST['value']/1000,
				   'book_totalcost' => $book_totalcost
				); */
			// print_r($data);exit;
			if ($this->CI->db->update($this->table_name, $data)) {
				//Update in Log
				if ($fname == 'book_qty') {
					$log['log_totalcost']     = $book_totalcost;
					$log['book_rate']          = $book_rate;
					$log['book_no']            = $book_no;
					$log['book_qty']        = $clean_value;
					$log['book_no_bar']        = $book_no_bar;
					$log['book_cusid']        = $book_no_bar;
				} else {
					$log['log_totalcost']     = $book_totalcost;
					$log['book_rate']          = $clean_value;
					$log['book_no']            = $book_no;
					$log['book_qty']        = $book_qty;
					$log['book_no_bar']        = $book_no_bar;
					$log['book_cusid']        = $book_no_bar;
				}
				/* $log['log_totalcost'] 	= $book_totalcost;
				$log['book_rate']  		= $_POST['value'];
				$log['book_no']    		= $book_no;
				$log['book_qty']    	= $_POST['value']; */
				$this->updatetodaytradeLog($oldRecord, $log);

				echo true;
			} else {
				echo mysql_error();
			}
		} else {
			echo "No matching rows found";
		}
	}

	public function get_deliveryentry_record($record_id) //Fetch entry record
	{
		//Build contents query
		$query = "SELECT cusdel_code,cusdel_cusname, cusdel_deliveryqty FROM dt_customerdelivery WHERE cusdel_code=" . $record_id;
		$result_set = $this->CI->db->query($query);

		foreach ($result_set->result() as $row) {
			$records['cusdel_code']           = $row->cusdel_code;
			$records['cusdel_cusname']       = $row->cusdel_cusname;
			$records['cusdel_deliveryqty']  = $row->cusdel_deliveryqty;
			$records['db_error_msg']        = "";
		}
		return $records;
	}
	public function deliveryinline_update()
	{
		$admin_id                  = get_adminUserId();
		$adminipaddress           = $_SERVER['SERVER_ADDR'];
		$cusdel_no = $_POST['pk'];

		//Get previous old records to compare and update in log table
		$oldRecord = $this->get_deliveryentry_record($cusdel_no);

		$this->CI->db->where('cusdel_code', $cusdel_no);
		$resultset = $this->CI->db->query("select cusdel_code,cusdel_cusname, cusdel_deliveryqty, cusdel_date FROM dt_customerdelivery WHERE  cusdel_code = '" . $cusdel_no . "'");

		if ($resultset->num_rows() > 0) {
			foreach ($resultset->result() as $row) {
				$cusdel_deliveryqty = $row->cusdel_deliveryqty;
				$cusdel_code         = $row->cusdel_code;
				$cusdel_cusname      = $row->cusdel_cusname;
			}
			if ($cusdel_deliveryqty > ($_POST['value'] / 1000)) {
				$update_data['cusdel_deliveryqty']            = $_POST['value'] / 1000;
				if ($this->CI->db->update('dt_customerdelivery', $update_data)) {
					$this->CI->db->where('invoice_delcode', $cusdel_no);
					$resultset_inv = $this->CI->db->query("SELECT invoice_delcode, invoice_bookno, invoice_cuscode, invoice_deliveryqty, invoice_amount, invoice_totalamt FROM dt_customer_deliveryinvoice WHERE  invoice_delcode = '" . $cusdel_no . "'");

					if ($resultset_inv->num_rows() > 0) {
						foreach ($resultset_inv->result() as $row_inv) {
							$invoice_deliveryqty     = $row_inv->invoice_deliveryqty * 1000;
							$invoice_amount         = $row_inv->invoice_amount;
							$invoice_totalamt         = $row_inv->invoice_totalamt;
						}
						$pergram_rate = $invoice_amount / $invoice_deliveryqty;

						$update_invdata['invoice_amount']         = $pergram_rate * $_POST['value'];
						$update_invdata['invoice_totalamt']     = $pergram_rate * $_POST['value'];
						$update_invdata['invoice_deliveryqty'] = $_POST['value'] / 1000;
						if ($this->CI->db->update('dt_customer_deliveryinvoice', $update_invdata)) {
							$log['cusdel_deliveryqty']        = $_POST['value'];

							$this->updatedeliveryeditLog($oldRecord, $log);

							echo true;
						} else {
							echo mysql_error();
						}
					}
				}
			} else {
				echo "Invalid qty";
			}
		} else {
			echo "No matching rows found";
		}
	}

	function updateLimitStatusLog($book_no, $status)
	{
		if ($status == 1)
			$desc = "Booking confirmed by admin.";
		else if ($status == 2)
			$desc = "Booking put on hold by admin.";
		else if ($status == 3)
			$desc = "Booking rejected by admin.";
		else if ($status == 4)
			$desc = "Limit order confirmed by admin.";
		else if ($status == 5)
			$desc = "Limit order cancelled by admin.";

		// Prepare data for logging
		$log_data = array('Book No' => $book_no, 'Status' => $status);

		// Use the standardized admin logging function for add operation
		$log_description = $desc . " Book No: " . $book_no;
		log_admin_add(0, 'Trading', $log_data, $log_description);
	}



	function get_confirmstatus()
	{
		$confirmation_for = 1;
		$resultset = $this->CI->db->query("select confirmation_for from dt_generalsettings");
		foreach ($resultset->result() as $row) {
			$confirmation_for       = $row->confirmation_for;
		}
		$resultset->free_result();
		return $confirmation_for;
	}
	function update_bookingstatus($book_no, $status, $cur_date = "")
	{
		if ($cur_date == "")
			$cur_date = date('Y-m-d H:i:s');
		$book_status = $status == 1 || $status == 2 ? $status : ($status == 0 ? 3 : 0);
		$this->CI->db->query("UPDATE dt_booking SET book_status = '" . $book_status . "', book_confirmedon = '" . $cur_date . "',orderplacedtime = '" . $cur_date . "', orderstatus = 1 WHERE book_no = '" . $book_no . "' AND orderstatus = 0 AND ordertype = 1");
		if ($this->CI->db->affected_rows() > 0) {

			$resultset = $this->CI->db->query("SELECT com_name,com_rest_wt, rcom_comtype, book_qty, book_comid , com_id
				FROM dt_booking
				LEFT JOIN dt_com_master ON book_comid = com_id
				LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type where book_no=" . $book_no);

			if ($resultset->num_rows() > 0) {
				$goldwt_info         = $resultset->row_array();
				$bookedweight_rest     = $goldwt_info['rcom_comtype'] == 1 ? $goldwt_info['book_qty'] : $goldwt_info['book_qty'] * 1000;
				if ($goldwt_info['com_rest_wt']  > $bookedweight_rest) {
					$gold_wt             =    (float)$goldwt_info['com_rest_wt'];
					$bookedweight_rest     =    (float)$bookedweight_rest;
					$rest_weight         =    $gold_wt - $bookedweight_rest;
					$this->CI->db->query("update  dt_com_master set com_rest_wt=" . $rest_weight . " where com_id='" . $goldwt_info['com_id'] . "'");
				} else {

					//Notification start
					$senderid = $this->CI->config->item('sms_senderid');
					$sms_url = $this->CI->config->item('sms_url');
					$nos = $this->get_admin_nos();
					$message = "Outof Stock Commodity, Limit order confirm
Commodity Name: " . $goldwt_info['com_name'] . "
Commodity Balance Weight: " . $goldwt_info['com_rest_wt'] . "
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
					$str_arr = explode(",", $mobile);

					foreach ($str_arr as $mob => $cusmobile) {
						$resp = whatsapp_message_helper($cusmobile, $message);
					}
					//Notification End
				}
			}

			$oDetail = $this->get_orderdetails($book_no)->result_array();
			$general_query = $this->CI->db->query("SELECT grl.gold_hedgecontract, grl.silver_hedgecontract, grl.is_hedge, grl.gold_hedge_lot_qty,  grl.silver_hedge_lot_qty, grl.confirmation_for, grl.confirmation_admin FROM dt_generalsettings AS grl");
			$data = $general_query->row();
			log_message("debug", var_dump($oDetail));
			log_message("debug", var_dump($data));

			/* $log  = "User: ".$_SERVER['REMOTE_ADDR'].' - '.date("F j, Y, g:i:s a").PHP_EOL.
					"Data update: ".(print_r($data, true)).PHP_EOL.
					"-------------------------".PHP_EOL;
			file_put_contents('logs/mt5hedge_log', $log, FILE_APPEND); */

			if ($oDetail[0]['book_by'] == 3)
				$confirm_type = $data->confirmation_admin;
			else
				$confirm_type = $data->confirmation_for;


			if ($data->is_hedge == 1 && $confirm_type == 1) {
				if ($oDetail[0]['com_type'] == 0) {
					$contact_symbol = $data->gold_hedgecontract;
					//$contact_symbol = "EURUSD";
					$booked_qty        = $oDetail[0]['book_qty'];
					$minorderwt     = $data->gold_hedge_lot_qty;
					$orderwt        = ($booked_qty * 1000);
					$lotwt             = 100;
					$totlot = floor($orderwt / $lotwt);
					if (($orderwt % $lotwt) >= $minorderwt) {
						$totlot = $totlot + 1;
					}
				} else {
					$contact_symbol = $data->silver_hedgecontract;
				}
				if ($data->com_type == 0) {
					$totlot = $totlot / 10;
					$maxRequestQty = 50;

					// Check if the customer's request exceeds the maximum request quantity
					while ($totlot > 0) {
						// Determine the quantity to send in the current request
						$requestQty = min($totlot, $maxRequestQty);
						$lot = number_format($requestQty, 2, '.', '');
						$curl = curl_init();

						curl_setopt_array($curl, array(
							CURLOPT_URL => $data->admin_hedgeurl,
							CURLOPT_RETURNTRANSFER => true,
							CURLOPT_ENCODING => '',
							CURLOPT_MAXREDIRS => 10,
							CURLOPT_TIMEOUT => 30,
							CURLOPT_FOLLOWLOCATION => true,
							CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
							CURLOPT_CUSTOMREQUEST => 'GET',
						));

						// Update the remaining quantity
						$totlot -= $requestQty;

						$response = curl_exec($curl);
						curl_close($curl);
						$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
							"MT5 Response update: " . (print_r($response, true)) . PHP_EOL .
							"-------------------------" . PHP_EOL;
						file_put_contents('logs/mt5hedge_log', $log, FILE_APPEND);
						//$this->updateautoheadgedata($response, $return_data);



						/* $log  = "User: ".$_SERVER['REMOTE_ADDR'].' - '.date("F j, Y, g:i:s a").PHP_EOL.
										"FN (send_orderStatus): ".(print_r($response, true)).PHP_EOL.
										"-------------------------".PHP_EOL;
						file_put_contents('logs/limitupdates_log', $log, FILE_APPEND); */
						//var_dump($response);exit;

						if (strpos($response, 'failed') == false) {
							$mt5response = json_decode($response, true);
							if (sizeof($mt5response) == 11) {
								$hedge_data = array(
									"dealid"     => $mt5response[1],
									"orderid"     => $mt5response[2],
									"volume"      => $mt5response[3],
									"price"      => $mt5response[4],
									"bid"        => $mt5response[5],
									"ask"        => $mt5response[6],
									"comment"    => $mt5response[7],
									"request_id" => $mt5response[8],
									"symbol"    =>  $mt5response[10][3],
									"cusbookid"    =>  $book_no
								);
								$this->CI->db->insert("dt_mt5_hedgedata", $hedge_data);
								$this->CI->db->where('book_no', $book_no);
								$this->CI->db->update('dt_booking', array("book_ishedge" => 1));

								/* Sending admin, hedge status */
								$hedgestatus = "Dear Admin, Booking placed in MT5.";
								$whatsapp_content = $hedgestatus . "
Book No: " . $book_no . "
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

								/* foreach($str_arr as $mob => $cusmobile) {
								  $resp = whatsapp_message_helper($cusmobile, $whatsapp_content);
								} */
							} else {
								$this->CI->db->query("update dt_generalsettings set is_hedge=0");
								$mail_det = $this->enquiry_mail_details();
								$mail_server = $mail_det['admin_mail'];
								$email_id = $mail_server;
								$email_ccid = "";
								$email_subject = "Booking not placed in MT5";
								$email_content = "Dear Admin, Booking not placed in MT5. Now MT5 hedge is OFF";
								email_notification_helper($email_id, $email_subject, $email_content/* ,$email_ccid */);
								$logstatus = 0;
								$this->updateHedgeONOFFLog($logstatus);
							}
						}
					}
				} else {
					$curl = curl_init();
					//$lot = $totlot / 10;
					$lot = number_format($totlot, 2, '.', '');


					curl_setopt_array($curl, array(
						CURLOPT_URL => $data->admin_hedgeurl,
						CURLOPT_RETURNTRANSFER => true,
						CURLOPT_ENCODING => '',
						CURLOPT_MAXREDIRS => 10,
						CURLOPT_TIMEOUT => 30,
						CURLOPT_FOLLOWLOCATION => true,
						CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
						CURLOPT_CUSTOMREQUEST => 'GET',
					));

					$response = curl_exec($curl);
					$log  = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i:s a") . PHP_EOL .
						"MT5 Response update: " . (print_r($response, true)) . PHP_EOL .
						"-------------------------" . PHP_EOL;
					file_put_contents('logs/mt5hedge_log', $log, FILE_APPEND);
					/* $log  = "User: ".$_SERVER['REMOTE_ADDR'].' - '.date("F j, Y, g:i:s a").PHP_EOL.
										"FN (send_orderStatus): ".(print_r($response, true)).PHP_EOL.
										"-------------------------".PHP_EOL;
						file_put_contents('logs/limitupdates_log', $log, FILE_APPEND); */
					//var_dump($response);exit;

					if (strpos($response, 'failed') == false) {
						$mt5response = json_decode($response, true);
						if (sizeof($mt5response) == 11) {
							$hedge_data = array(
								"dealid"     => $mt5response[1],
								"orderid"     => $mt5response[2],
								"volume"      => $mt5response[3],
								"price"      => $mt5response[4],
								"bid"        => $mt5response[5],
								"ask"        => $mt5response[6],
								"comment"    => $mt5response[7],
								"request_id" => $mt5response[8],
								"symbol"    =>  $mt5response[10][3],
								"cusbookid"    =>  $book_no
							);
							$this->CI->db->insert("dt_mt5_hedgedata", $hedge_data);
							$this->CI->db->where('book_no', $book_no);
							$this->CI->db->update('dt_booking', array("book_ishedge" => 1));

							/* Sending admin, hedge status */
							$hedgestatus = "Dear Admin, Booking placed in MT5.";
							$whatsapp_content = $hedgestatus . "
	Book No: " . $book_no . "
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

							/* foreach($str_arr as $mob => $cusmobile) {
								  $resp = whatsapp_message_helper($cusmobile, $whatsapp_content);
								} */
						} else {
							$this->CI->db->query("update dt_generalsettings set is_hedge=0");
							$mail_det = $this->enquiry_mail_details();
							$mail_server = $mail_det['admin_mail'];
							$email_id = $mail_server;
							$email_ccid = "";
							$email_subject = "Booking not placed in MT5.";
							$email_content = "Dear Admin, Booking not placed in MT5. Now MT5 hedge is OFF";
							email_notification_helper($email_id, $email_subject, $email_content/* ,$email_ccid */);
							$logstatus = 0;
							$this->updateHedgeONOFFLog($logstatus);
						}


						curl_close($curl);
					}

					curl_close($curl);
				}
			}
			return true;
		} else {
			return false;
		}
	}
	function limit_expire($book_no, $orderstatus)
	{
		$cur_date = date('Y-m-d H:i:s');
		$this->CI->db->query("UPDATE dt_booking SET orderstatus = " . $orderstatus . " , orderplacedtime = '" . $cur_date . "' WHERE book_no = '" . $book_no . "' AND orderstatus = 0 AND ordertype = 1");
		if ($this->CI->db->affected_rows() > 0)
			return true;
		else
			return false;
	}
	function update_tradeonoff($status)
	{
		$updated = $this->CI->db->query("UPDATE dt_generalsettings SET trade_enable = " . $status);
		if ($updated)
			return true;
		else
			return false;
	}
	function get_client_transaction()
	{
		$resultset = $this->CI->db->query("SELECT cus_name, cus_email, cus_mobile, TRIM(book_qty)+0 AS book_qty, book_rate, book_totalcost, com_name, rcom_comtype AS com_type, date_format(book_datetime,'%d-%m-%Y  %h:%i:%s')  AS book_datetime, book_status, ordertype, book_comweight, book_cusid, cus_company_name, orderstatus, book_deviceid, com_margin_type, com_margin_value, book_type, book_bar_type FROM dt_booking LEFT JOIN dt_customer ON book_cusid = cus_id LEFT JOIN dt_com_master ON book_comid = com_id LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type WHERE date_format(book_datetime,'%Y-%m-%d') = curdate()");
		return $resultset->result_array();
	}

	function updateLimitLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();

		if ($oldRecord['book_rate'] != $newRecord['book_rate']) {
			$updatedRecord['New']['Book Rate'] = $newRecord['book_rate'];
			$updatedRecord['Old']['Book Rate'] = $oldRecord['book_rate'];
		}
		if ($oldRecord['book_totalcost'] != $newRecord['log_totalcost']) {
			$updatedRecord['New']['Total Cost'] = $newRecord['log_totalcost'];
			$updatedRecord['Old']['Total Cost'] = $oldRecord['book_totalcost'];
		}
		if ($oldRecord['book_qty'] != $newRecord['book_qty']) {
			$updatedRecord['New']['Qty(Kg)'] = $newRecord['book_qty'];
			$updatedRecord['Old']['Qty(Kg)'] = $oldRecord['book_qty'];
		}
		if ($oldRecord['book_no_bar'] != $newRecord['book_no_bar']) {
			$updatedRecord['New']['No of Bars'] = $newRecord['book_no_bar'];
			$updatedRecord['Old']['No of Bars'] = $oldRecord['book_no_bar'];
		}

		if (count($updatedRecord) > 0) {
			// Prepare data for logging
			$bookId = array('Book No' => $newRecord['book_no']);

			// Separate old and new data
			$oldData = array('Book No' => $newRecord['book_no']);
			$newData = array('Book No' => $newRecord['book_no']);

			if (isset($updatedRecord['Old']['Book Rate'])) {
				$oldData['Book Rate'] = $updatedRecord['Old']['Book Rate'];
				$newData['Book Rate'] = $updatedRecord['New']['Book Rate'];
			}
			if (isset($updatedRecord['Old']['Total Cost'])) {
				$oldData['Total Cost'] = $updatedRecord['Old']['Total Cost'];
				$newData['Total Cost'] = $updatedRecord['New']['Total Cost'];
			}
			if (isset($updatedRecord['Old']['Qty(Kg)'])) {
				$oldData['Qty(Kg)'] = $updatedRecord['Old']['Qty(Kg)'];
				$newData['Qty(Kg)'] = $updatedRecord['New']['Qty(Kg)'];
			}
			if (isset($updatedRecord['Old']['No of Bars'])) {
				$oldData['No of Bars'] = $updatedRecord['Old']['No of Bars'];
				$newData['No of Bars'] = $updatedRecord['New']['No of Bars'];
			}

			// Use the standardized admin logging function
			$log_description = "Updated Limit Order. Order No: " . $newRecord['book_no'];
			log_admin_edit(0, 'Trading', $oldData, $newData, $log_description);
		}
	}
	function executeLimitLog($newRecord, $desc)
	{
		// Prepare data for logging
		$log_data = array('Book No' => $newRecord['BNo']);

		// Merge with the new record data
		$log_data = array_merge($log_data, $newRecord);

		// Use the standardized admin logging function for add operation
		$log_description = $desc . ". Order No: " . $newRecord['BNo'];
		log_admin_add(0, 'Trading', $log_data, $log_description);
	}
	function updatetodaytradeLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();

		if ($oldRecord['book_rate'] != $newRecord['book_rate']) {
			$updatedRecord['New']['Book Rate'] = $newRecord['book_rate'];
			$updatedRecord['Old']['Book Rate'] = $oldRecord['book_rate'];
		}
		if ($oldRecord['book_totalcost'] != $newRecord['log_totalcost']) {
			$updatedRecord['New']['Total Cost'] = $newRecord['log_totalcost'];
			$updatedRecord['Old']['Total Cost'] = $oldRecord['book_totalcost'];
		}
		if ($oldRecord['book_qty'] != $newRecord['book_qty']) {
			$updatedRecord['New']['Qty(Kg)'] = $newRecord['book_qty'];
			$updatedRecord['Old']['Qty(Kg)'] = $oldRecord['book_qty'];
		}
		if ($oldRecord['book_no_bar'] != $newRecord['book_no_bar']) {
			$updatedRecord['New']['No of Bars'] = $newRecord['book_no_bar'];
			$updatedRecord['Old']['No of Bars'] = $oldRecord['book_no_bar'];
		}

		if (count($updatedRecord) > 0) {
			// Prepare data for logging
			$bookId = array('Book No' => $newRecord['book_no']);

			// Separate old and new data
			$oldData = array('Book No' => $newRecord['book_no']);
			$newData = array('Book No' => $newRecord['book_no']);

			if (isset($updatedRecord['Old']['Book Rate'])) {
				$oldData['Book Rate'] = $updatedRecord['Old']['Book Rate'];
				$newData['Book Rate'] = $updatedRecord['New']['Book Rate'];
			}
			if (isset($updatedRecord['Old']['Total Cost'])) {
				$oldData['Total Cost'] = $updatedRecord['Old']['Total Cost'];
				$newData['Total Cost'] = $updatedRecord['New']['Total Cost'];
			}
			if (isset($updatedRecord['Old']['Qty(Kg)'])) {
				$oldData['Qty(Kg)'] = $updatedRecord['Old']['Qty(Kg)'];
				$newData['Qty(Kg)'] = $updatedRecord['New']['Qty(Kg)'];
			}
			if (isset($updatedRecord['Old']['No of Bars'])) {
				$oldData['No of Bars'] = $updatedRecord['Old']['No of Bars'];
				$newData['No of Bars'] = $updatedRecord['New']['No of Bars'];
			}

			// Use the standardized admin logging function
			$log_description = "Updated Admin Today Trade Order. Order No: " . $newRecord['book_no'];
			log_admin_edit(0, 'Trading', $oldData, $newData, $log_description);
		}
	}

	function updatedeliveryeditLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();

		if ($oldRecord['cusdel_deliveryqty'] != $newRecord['cusdel_deliveryqty']) {
			$updatedRecord['New']['Deliverd Qty'] = $newRecord['cusdel_deliveryqty'];
			$updatedRecord['Old']['Deliverd Qty'] = $oldRecord['cusdel_deliveryqty'];
		}

		if (count($updatedRecord) > 0) {
			// Prepare data for logging
			$delivId = array('Delivered No' => $oldRecord['cusdel_code']);

			// Separate old and new data
			$oldData = array('Delivered No' => $oldRecord['cusdel_code']);
			$newData = array('Delivered No' => $oldRecord['cusdel_code']);

			if (isset($updatedRecord['Old']['Deliverd Qty'])) {
				$oldData['Deliverd Qty'] = $updatedRecord['Old']['Deliverd Qty'];
				$newData['Deliverd Qty'] = $updatedRecord['New']['Deliverd Qty'];
			}

			// Use the standardized admin logging function
			$log_description = "Updated Admin Edit Delivery entry. Order No: " . $oldRecord['cusdel_code'];
			log_admin_edit(0, 'Trading', $oldData, $newData, $log_description);
		}
	}

	function updateLimitExpireLog($record)
	{
		// Use the standardized admin logging function for add operation
		$log_description = "Limit expired(Auto)";
		log_admin_add(0, 'Trading', $record, $log_description);
	}

	function updateTradeOnOffLog($status)
	{
		// Prepare data for logging
		$log_data = array();

		// Use the standardized admin logging function for add operation
		if ($status == 1)
			$log_description = "Trade Enabled(Auto)";
		else
			$log_description = "Trade Disabled(Auto)";

		log_admin_add(7, 'Trading', $log_data, $log_description);
	}
	function updateHedgeONOFFLog($status)
	{
		// Prepare data for logging
		$log_data = array();

		// Use the standardized admin logging function for add operation
		if ($status == 1)
			$log_description = "MT5 Hedge Enabled(Auto)";
		else
			$log_description = "MT5 Hedge Disabled(Auto)";

		log_admin_add(12, 'Trading', $log_data, $log_description);
	}

	function get_settings()
	{
		$records = array();
		$resultset = $this->CI->db->query("select display_margin,has_pendinglimits,gold_tol,silver_tol, trade_enable, limit_enable, clientlimit_enable from dt_generalsettings");
		foreach ($resultset->result() as $row) {
			$records['display_margin']       = $row->display_margin;
			$records['pending_limits']       = $row->has_pendinglimits;
			$records['trade_enable']       = $row->trade_enable;
			$records['limit_enable']       = $row->limit_enable;
			$records['clientlimit_enable'] = $row->clientlimit_enable;
			$records['gold_tol']           = explode("#", $row->gold_tol);
			$records['silver_tol']          = explode("#", $row->silver_tol);
		}
		$resultset->free_result();
		//print_r($records);exit;
		return $records;
	}

	function notifyBooking($book_no)
	{
		if (is_numeric($book_no) && $book_no > 0) {
			$records = $this->get_orderdetails($book_no)->result_array();
			//print_r($records);exit;
			if ($records[0]['book_status'] == 1 || $records[0]['book_status'] == 2 || $records[0]['book_status'] == 3) {
				if ($records[0]['book_status'] == 1 || $records[0]['book_status'] == 3)
					$service_id = "5";
				else
					$service_id = "4";
				$whatsapp_url = $this->get_whatsappURL($service_id, $book_no);
				//print_r($whatsapp_url);exit;
				if (isset($whatsapp_url['mobile'])) {

					if (strlen($whatsapp_url['mobile']) > 0) {
						$resp = whatsapp_message_helper(trim($whatsapp_url['mobile'], '""'), $whatsapp_url['message']);
					}
				}
				$sms_url = $this->get_SMSURL($service_id, $book_no);

				if ($sms_url != '') {
					curl_helper($sms_url, $sms_url);
				}

				/* Sending admin, booking status */
				$nos = $this->get_admin_nos();


				$Qty = $records[0]['book_bar_type'] == 0 ? ($records[0]['book_qty'] * 1000) . " gms" : ($records[0]['book_qty']) . " kg";

				if ($records[0]['book_status'] == 1) {
					$bookstatus  = "Dear Admin, New Booking Received";
					$message_sms = $bookstatus . ". Book No : " . $book_no . ", Cus name : " . rtrim($records[0]['cus_name']) . ", Com name : " . rtrim($records[0]['com_name']) . ", Qty : " . (($records[0]['book_qty'] * 1000) + 0) . " gms, Rate: " . ($records[0]['book_rate'] + 0) . " Booked on :" . date('d-m-Y H:i:s') . " Regards, Daksh Gold LLP";
				} else {
					$bookstatus  = "Dear Admin, New Limit Order - Received";
					//Dear Admin, New Limit Order - Received. Order No:{#var#}, Name : {#var#}, Comm : {#var#}, Qty : {#var#}, Rate : {#var#} Confirmed on: {#var#} Regards, Daksh Gold LLP
					$message_sms = $bookstatus . ".  Order No:" . $book_no . ", Name : " . rtrim($records[0]['cus_name']) . ", Comm : " . rtrim($records[0]['com_name']) . ", Qty : " . (($records[0]['book_qty'] * 1000) + 0) . ", Rate : " . ($records[0]['book_rate'] + 0) . " Confirmed on: " . date('d-m-Y H:i:s') . " Regards, Daksh Gold LLP";
				}



				$autohedge = $records[0]['book_ishedge'] == 0 ? "Pending" : "Done";
				$hedgeqty = $records[0]['price'] != '' ? $records[0]['mt5qty'] . " Grams " . $records[0]['price'] : "";
				//$message = $bookstatus.". Book No : ".$book_no.", Cus name : ".$records[0]['cus_name']." - ".$records[0]['cus_company_name'].", Com name : ".$records[0]['com_name'].", Qty : ".$Qty.", Rate : ".($records[0]['book_rate']+0)." Booked on : ".date('d-m-Y H:i:s');

				/* Hedge: ".$autohedge."
				".$hedgeqty." */

				$message = $bookstatus . ".

Client: " . $records[0]['cus_name'] . "
Product: " . $records[0]['com_name'] . "
Rate: " . ($records[0]['book_rate'] + 0) . "
Quantity: " . $Qty . "
Trade no: " . $book_no . "
Total Cost: " . $records[0]['book_totalcost'] . "

Time: " . date('d-m-Y H:i:s');

				$result_set = $this->CI->db->query("select admin_sms_senderid, admin_sms_authkey from dt_generalsettings");
				if ($result_set->num_rows() > 0) {
					$sms_senderid    = $result_set->row()->admin_sms_senderid;
					$sms_authkey    = $result_set->row()->admin_sms_authkey;
				}
				$result_set1 = $this->CI->db->query("select sas_url from dt_smsappsettings");
				foreach ($result_set1->result() as $row) {
					$sms_returnurl = $row->sas_url;
				}

				$url         = $sms_returnurl;
				$senderid     = $sms_senderid;
				$authkey     = $sms_authkey;

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
					if ($records[0]['book_status'] != 0)
						$dlt_id = '';
					else
						$dlt_id = '';

					$message_sms = urlencode($message_sms);
					$arr = array("@@mobileno@@" => $mobile, "@@message@@" => $message_sms, "@@sender_id@@" => $senderid, "@@dlt_id@@" => $dlt_id, "@@authkey@@" => $authkey);

					//$arr = array("@customer_mobile@" => trim($mobile),"@message@" => $message,"@senderid@" => $senderid);
					if (isset($url) && isset($arr)) {
						$user_sms_url = strtr($url, $arr);
						curl_helper($user_sms_url, $user_sms_url);
					}
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
				$data = $this->get_EmailContent($service_id, $book_no);
				if ($data != '') {
					if (strlen($data['email_id']) > 0) {
						email_notification_helper($data['email_id'], $data["email_subject"], $data['email_content']);
					}
				}
			} else if ($records[0]['ordertype'] == 1 && ($records[0]['orderstatus'] == 2 || $records[0]['orderstatus'] == 3)) {
				$Qty = $records[0]['book_bar_type'] == 0 ? ($records[0]['book_qty'] * 1000) . " gms" : ($records[0]['book_qty']) . " kg";

				$messageForCustomer = "Dear " . ($records[0]['cus_name']) . ", your booking(book no:" . ($book_no) . ") for " . $records[0]['com_name'] . " with qty " . $Qty . " at Rs. " . ($records[0]['book_rate']) . " is CANCELLED.";

				$resp = whatsapp_message_helper($records[0]['cus_mobile'], $messageForCustomer);
				$sms_api = $this->get_SMSAppSettings(1, $records[0]['cus_mobile']);
				$arr = array("@@message@@" => $messageForCustomer);
				$sms_url = strtr($sms_api, $arr);

				if ($sms_url != '') {
					curl_helper($sms_url, $sms_url);
				}
			} else if ($records[0]['ordertype'] == 1 && ($records[0]['book_status'] == 0)) {
				$nos = $this->get_admin_nos();

				$message_sms = "Dear Admin, New Limit Order - Received. Order No:" . $book_no . ", Name : " . rtrim($records[0]['cus_name']) . ", Comm : " . rtrim($records[0]['com_name']) . ", Qty : " . (($records[0]['book_qty'] * 1000) + 0) . ", Rate : " . ($records[0]['book_rate'] + 0) . " Confirmed on: " . date('d-m-Y H:i:s') . " Regards, Daksh Gold LLP";

				$message = "Limit order received.

Client: " . $records[0]['cus_name'] . "
Product: " . $records[0]['com_name'] . "
Rate: " . ($records[0]['book_rate'] + 0) . "
Quantity: " . (($records[0]['book_qty'] * 1000) + 0) . "
Trade no: " . $book_no . "
Total Cost: " . $records[0]['book_totalcost'] . "

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

				$result_set = $this->CI->db->query("select admin_sms_senderid,admin_sms_authkey from dt_generalsettings");
				if ($result_set->num_rows() > 0) {
					$sms_senderid    = $result_set->row()->admin_sms_senderid;
					$sms_authkey    = $result_set->row()->admin_sms_authkey;
				}
				$result_set1 = $this->CI->db->query("select sas_url from dt_smsappsettings");
				foreach ($result_set1->result() as $row) {
					$sms_returnurl = $row->sas_url;
				}
				$senderid = $sms_senderid;
				$url = $sms_returnurl;
				$authkey     = $sms_authkey;

				if ($mobile != '') {
					$message_sms = urlencode($message_sms);
					$arr = array("@@mobileno@@" => $mobile, "@@message@@" => $message_sms, "@@sender_id@@" => $senderid, "@@dlt_id@@" => '', "@@authkey@@" => $authkey);
					$user_sms_url = strtr($url, $arr);
					curl_helper($user_sms_url, $user_sms_url);
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
				if (!empty($notificationids)) {
					$this->send_pushnotification($notificationids, "New Order Received", $message);
				}
			}

			return true;
		} else {
			return false;
		}
	}
	function unfixreport($cus_id)
	{
		$returndata = array();
		//Unfix details payment start
		$resultset = $this->CI->db->query("SELECT date_format(date, '%d-%m-%Y') as date, party_name, amount, pure_weight, rate FROM dt_unfix as uf where  unfix_close = 0 and party_name=" . $cus_id);
		$total_amount            =    0;
		$total_weight            =    0;
		$averagerate            =    0;
		foreach ($resultset->result() as $row) {
			$total_amount        +=    $row->amount;
			$total_weight        +=    $row->pure_weight;
			$averagerate        +=    intval($row->rate);
		}
		setlocale(LC_MONETARY, 'en_IN');
		$userData['total_amount']        = isset($total_amount) ? round($total_amount, 2) : 0;
		$userData['total_weight']        = isset($total_weight) ? round($total_weight, 3) : 0;
		$userData['averagerate']        = $userData['total_amount'] == 0 ? 0 : round($userData['total_amount'] / $userData['total_weight'], 2);
		$records    =    array();
		$records[0]    =    $resultset;
		$records[1]    =    $userData;
		//Unfix payment details end
		//Unfix booking details start
		$resultset_bk = $this->CI->db->query("SELECT book_no, round(book_qty*1000,3) as book_qty, date_format(book_datetime, '%d-%m-%Y %h:%i:%s') as  book_datetime, book_rate, book_totalcost FROM dt_booking where book_unfixclose = 0 and unfix= 1 and book_cusid = " . $cus_id);
		$book_qty            =    0;
		$book_totalcost        =    0;
		foreach ($resultset_bk->result() as $row) {
			$book_qty            +=    $row->book_qty;
			$book_totalcost        +=    $row->book_totalcost;
		}
		setlocale(LC_MONETARY, 'en_IN');
		$userData_bk['totalbook_qty']    = isset($book_qty) ? round($book_qty, 3) : 0;
		$userData_bk['total_cost']        = isset($book_totalcost) ? round($book_totalcost, 2) : 0;
		$userData_bk['averagerate']        = $userData_bk['totalbook_qty'] == 0 ? 0 : round($userData_bk['totalbook_qty'] / $userData_bk['total_cost'], 2);
		//Unfix booking details start
		$difftotalamt = round($userData['total_amount'] - $userData_bk['total_cost'], 2);
		$returndata = array('unfixpayment' => $resultset->result_array(), 'unfixpaymenttotal' => $userData, 'unfixbook' => $resultset_bk->result_array(), 'unfixbooktotal' => $userData_bk, "difftotalamt" => $difftotalamt);
		return $returndata;
	}
	function customerordercanceladmin($bookid)
	{
		$book_no = $bookid;
		$records = $this->get_orderdetails($book_no)->result_array();
		$result_set = $this->CI->db->query("select admin_sms_senderid,admin_sms_authkey from dt_generalsettings");
		if ($result_set->num_rows() > 0) {
			$sms_senderid    = $result_set->row()->admin_sms_senderid;
			$sms_authkey    = $result_set->row()->admin_sms_authkey;
		}
		$result_set1 = $this->CI->db->query("select sas_url from dt_smsappsettings");
		foreach ($result_set1->result() as $row) {
			$sms_returnurl = $row->sas_url;
		}
		$senderid = $sms_senderid;
		$sms_url = $sms_returnurl;
		$authkey     = $sms_authkey;
		$notificationids = array();
		$nos = $this->get_admin_nos();
		$message_sms = "Limit order cancel request. Booking No : " . $book_no . ", Customer : " . rtrim($records[0]['cus_name']) . ", Commodity: " . rtrim($records[0]['com_name']) . ", Qty : " . (($records[0]['book_qty'] * 1000) + 0) . " gms, Rate: " . ($records[0]['book_rate'] + 0) . " is cancelled on: " . date('d-m-Y H:i:s') . " Regards, Daksh Gold.";
		$message = "Limit order cancel request.

Client: " . $records[0]['cus_name'] . "
Product: " . $records[0]['com_name'] . "
Rate: " . ($records[0]['book_rate'] + 0) . "
Quantity: " . (($records[0]['book_qty'] * 1000) + 0) . "
Trade no: " . $book_no . "
Total Cost: " . $records[0]['book_totalcost'] . "

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
		if ($mobile != '' || $sms_url != '' || $senderid != '') {
			$message_sms = urlencode($message_sms);
			$arr = array("@@mobileno@@" => $mobile, "@@message@@" => $message_sms, "@@sender_id@@" => $senderid, "@@dlt_id@@" => '', "@@authkey@@" => $authkey);
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
		$str_arr = explode(",", $mobile);

		foreach ($str_arr as $mob => $cusmobile) {
			$resp = whatsapp_message_helper($cusmobile, $message);
		}
	}
	function updatelimitorderadmin($bookid)
	{
		$book_no = $bookid;
		$records = $this->get_orderdetails($book_no)->result_array();
		$result_set = $this->CI->db->query("select admin_sms_senderid, admin_sms_authkey from dt_generalsettings");
		if ($result_set->num_rows() > 0) {
			$sms_senderid    = $result_set->row()->admin_sms_senderid;
			$sms_authkey    = $result_set->row()->admin_sms_authkey;
		}
		$result_set1 = $this->CI->db->query("select sas_url from dt_smsappsettings");
		foreach ($result_set1->result() as $row) {
			$sms_returnurl = $row->sas_url;
		}
		$senderid = $sms_senderid;
		$sms_url = $sms_returnurl;
		$authkey     = $sms_authkey;
		$notificationids = array();
		$nos = $this->get_admin_nos();
		$message_sms = "Limit order update request. Book No : " . $book_no . ", Cus name : " . $records[0]['cus_name'] . " - " . $records[0]['cus_company_name'] . ", Com name : " . $records[0]['com_name'] . ", Qty : " . (($records[0]['book_qty'] * 1000) + 0) . " gms, Rate : " . ($records[0]['book_rate'] + 0) . " Update on : " . date('d-m-Y H:i:s');
		$message = "Limit Update request

Client: " . $records[0]['cus_name'] . "
Product: " . $records[0]['com_name'] . "
Rate: " . ($records[0]['book_rate'] + 0) . "
Quantity: " . (($records[0]['book_qty'] * 1000) + 0) . " gms
Trade no: " . $book_no . "
Total Cost: " . $records[0]['book_totalcost'] . "

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
		if ($mobile != '' || $sms_url != '' || $senderid != '') {
			$message_sms = urlencode($message_sms);
			$arr = array("@@mobileno@@" => $mobile, "@@message@@" => $message_sms, "@@sender_id@@" => $senderid, "@@dlt_id@@" => '', "@@authkey@@" => $authkey);
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
		$str_arr = explode(",", $mobile);

		foreach ($str_arr as $mob => $cusmobile) {
			$resp = whatsapp_message_helper($cusmobile, $message);
		}
	}

	function checkgold_weight($com_id, $book_qty, $book_comweight, $mobile)
	{

		$resultset = $this->CI->db->query("SELECT com_name, com_rest_wt ,rcom_comtype
			from  dt_com_master
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			where com_id='" . $com_id . "'
			");
		$query_name = $this->CI->db->query("SELECT admin_stockmanage FROM dt_generalsettings");
		$stock_manage     = $query_name->row()->admin_stockmanage;

		if ($resultset->num_rows() > 0) {
			$goldwt_info = $resultset->row_array();
			$stock_manage = $goldwt_info['rcom_comtype']  == 1 ? $stock_manage : $stock_manage / 1000;
			$com_restwt      = $goldwt_info['rcom_comtype']  == 1 ? $goldwt_info['com_rest_wt'] : $goldwt_info['com_rest_wt'] / 1000;
			//echo $stock_manage."  ".$com_restwt;exit;
			if ($com_restwt < $stock_manage || $com_restwt == $stock_manage) {
				//Notification start
				$senderid = $this->CI->config->item('sms_senderid');
				$sms_url = $this->CI->config->item('sms_url');
				$nos = $this->get_admin_nos();
				$message = "Outof Stock Commodity
Commodity Name: " . $goldwt_info['com_name'] . "
Commodity Balance Weight: " . $goldwt_info['com_rest_wt'] . "
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
				$str_arr = explode(",", $mobile);

				foreach ($str_arr as $mob => $cusmobile) {
					$resp = whatsapp_message_helper($cusmobile, $message);
				}
				//Notification End

				return False;
			} else {
				//echo "true";exit;
				if ($book_comweight != 0 && $book_comweight != null) {

					if ($goldwt_info['com_rest_wt']  > $book_comweight) {
						return TRUE;
					}
				}
			}
		}
	}
	public function avg_rate_update()
	{
		$cus_id = $_POST['pk'];
		$new_avg_rate = $_POST['value'];

		// if ($cus_id === null || $new_avg_rate === null) {
		//     return false;
		// }
		$data = array('avg_rate' => $new_avg_rate);
		$this->CI->db->where('cus_id', $cus_id);

		if ($this->CI->db->update('dt_customer', $data)) {
			// Log the inline update operation
			$log_data = array(
				'Customer ID' => $cus_id,
				'Field Updated' => 'avg_rate',
				'New Value' => $new_avg_rate
			);
			$log_description = "Average rate update performed. Customer ID: " . $cus_id . ", New Rate: " . $new_avg_rate;
			log_admin_edit(0, 'Trading', $log_data, $log_data, $log_description);

			// print_r($this->CI->db->last_query());exit;
			return true;
		} else {
			return false;
		}
	}

	function enquiry_mail_details()
	{
		$query = $this->CI->db->query("SELECT admin_company_name,admin_mail_server,admin_mail_password,admin_mail FROM dt_generalsettings");
		return $query->row_array();
	}

	function calculate_gold_lots($orderwt)
	{
		$MegaLots = 0;
		$MiniLots = 0;
		$MicroLots = 0;
		// Mega lot:
		if ($orderwt >= 100) {
			$MegaLots = floor($orderwt / 100);
			$orderwt -= $MegaLots * 100;
		}
		// Mini lot:
		if ($orderwt > 0) {
			$minorderwt = 6;
			$lots = floor($orderwt / 10);
			if (($orderwt % 10) >= $minorderwt) {
				$lots += 1;
			}
			$MiniLots = $lots;
		}
		//Micro lot:

		return [$MegaLots, $MiniLots, $MicroLots];
	}

	public function fetchHedgetype($hedge_info, $lots, $metalType)
	{
		$hedge_type = $hedge_info['hm_hedgetype'];
		$orderData = [
			'lots'        => $lots,
			'metalType'   => $metalType,
			'contact_symbol'   => $hedge_info['hm_symbol'],
			'hedge_url'   => $hedge_info['hm_apiurl'],
		];
		if ($hedge_type == 0) {
			$this->CI->load->model('Mt5_model');
			$response = $this->CI->Mt5_model->execute($orderData);
		} else {
			$this->CI->load->model('Motilal_model');
			$response = $this->CI->Motilal_model->execute($orderData);
		}
		return $response;
	}

	// Market Auto On/Off

	function update_marketonoff($status)
	{
		$updated = $this->CI->db->query("UPDATE dt_r_panel SET rate_display = " . $status);
		if ($updated)
			return true;
		else
			return false;
	}


	function get_all_hedge_configs($metalType)
	{
		$CI = &get_instance();

		$query = $CI->db->query("
        SELECT hm_id, hm_hedgetype, hm_hedgesymbol, hm_apiurl, hm_fromslots, hm_toslots, hm_com_type
        FROM dt_hedgemaster
        WHERE hm_commodity = ?
        AND hm_hedgestatus = 1
        ORDER BY hm_toslots DESC
    ", [$metalType]);

		return $query->result_array();
	}

	function execute_hedge($hedge_config, $qty_grams, $book_no, $metalType = 0)
	{
		$CI = &get_instance();

		$orderData = [
			'book_qty' => $qty_grams / 1000,
			'contact_symbol' => $hedge_config['hm_hedgesymbol'],
			'book_no' => $book_no,
			'metalType' => $metalType,
			'hedge_url' => $hedge_config['hm_apiurl'],
			'book_type' => 0
		];

		if ($hedge_config['hm_hedgetype'] == 0) {
			$CI->load->model('Mt5_model');
			return $CI->Mt5_model->execute($orderData);
		} else {
			$CI->load->model('Motilal_model');
			return $CI->Motilal_model->login_motilal_oswal($orderData);
		}
	}
	public function get_trading_data($userid)
	{
		$commoditydetails = array();
		$commodityquery = $this->CI->db->query("SELECT com.com_id, com_name, com_isregion, com_calpurity,
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
			date_format(pgc.prem_expirydate, '%Y-%m-%d') as prem_expirydate,
			IFNULL(com_sel_active,0) * IFNULL(prem_comsell_active,0) AS cus_com_sell,
			IFNULL(com_buy_active,0) * IFNULL(prem_combuy_active,0) AS cus_com_buy,
			cuscom.cus_com_amountpurch,is_gst,is_tcs,rcom_sell_tax,rcom_buy_tax,rcom_sell_tcs,rcom_buy_tcs
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
		$rpanelcommodityquery = $this->CI->db->query("SELECT rcom_id as comid, rcom_disname as dispname,
													contract_symbol mcxcontract,
													rcom_comtype as comtype, ifnull(trade_type,0) as tradetype,
													ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff,
													ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate, rcom_sell_diff_type,
													rcom_buy_diff_type, rcom_sell_callpurity,
													rcom_buy_callpurity
													FROM dt_rpanelcommodities
													LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol
													LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol
													LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id
													WHERE rcom_status = 1");
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate, "rcom_sell_diff_type" => $commodityrow->rcom_sell_diff_type, "rcom_buy_diff_type" => $commodityrow->rcom_buy_diff_type, "rcom_sell_callpurity" => $commodityrow->rcom_sell_callpurity, "rcom_buy_callpurity" => $commodityrow->rcom_buy_callpurity);
		}
		$commoditydetails['rpanel_commodities'] = $rpanel_display_commodities;
		$rpanelcommodityquery->free_result();
		return $commoditydetails;
	}
}
