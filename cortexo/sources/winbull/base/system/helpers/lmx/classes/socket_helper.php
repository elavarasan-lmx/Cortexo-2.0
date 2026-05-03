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
class SocketUpdater
{

	var $CI;

	function __construct()
	{
		$this->CI = get_instance();
	}

	function commodity_update()
	{
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
					com_display_purity , TRIM(com_bar_quantity)+0 AS com_bar_quantity, ifnull(com_margin_type, 0) as com_margin_type, com_margin_value , allowed_decimals, 
					com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type, 
					IFNULL(com_sel_active,0) AS com_sel_active, IFNULL(com_buy_active,0) AS com_buy_active,
				IFNULL(com_buy_trade,0) AS com_buy_trade, IFNULL(com_sel_trade,0) AS com_sel_trade, com_delverydays, 
					date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
					allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type, 
					tcs_tax, is_gst, is_tcs, rcom_sell_tax, rcom_buy_tax, rcom_sell_tcs, rcom_buy_tcs,
					prmgrp.prem_comsell_active as prem_comsell_active,
					prmgrp.prem_comselretail_active as prem_comselretail_active,
					prmgrp.prem_combuy_active as prem_combuy_active,  
					prmgrp.prem_sel_premium as prem_sel_premium,  
					prmgrp.prem_buy_premium as prem_buy_premium,  
					prmgrp.prem_selretail_premium as prem_selretail_premium,   
					prmgrp.prem_expirydate as prem_expirydate,round_off
					FROM dt_com_master AS com 
					LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1 
					LEFT JOIN dt_prem_group_master as prgc ON prgc.prem_default = 1 
					LEFT JOIN dt_prem_group_com as prmgrp ON prmgrp.prem_group_id = prgc.prem_group_id AND com.com_id = prmgrp.prem_id
					LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type 
					LEFT JOIN dt_contractmaster as mcxc ON mcxc.contract_id = rpc.rcom_mcxsymbol 
					LEFT JOIN dt_bankcontractmaster as bcm ON bcm.bcontract_id = rpc.rcom_banksymbol 
					LEFT JOIN dt_rpanelbank as rpb ON rpb.banksymbol = bcm.bcontract_id
					LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
					WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number";

		$resultset = $this->CI->db->query($str_query);
		$arr = array();
		$requst_array = array();
		foreach ($resultset->result_array() as $row) {
			$arr[] = $row;
		}
		$resultset->free_result();
		$requst_array["commodity"] = $arr;

		$contractquery = $this->CI->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach ($contractquery->result() as $contractrow) {
			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, 'userpage_status' => $contractrow->userpage_status, 'userpage_displayname' => $contractrow->userpage_displayname, "round_off" => $contractrow->round_off);
		}
		$contractquery->free_result();
		$requst_array["rpanel_contracts"] = $rpanel_display_contracts;
		$return_array["commodity"] = $requst_array;

		$url = isset(Globals::$commodityupdate) ? Globals::$commodityupdate : '';
		if ($url != '') {
			$field_string = http_build_query($return_array);
			$curl_resp = curl_helper($url, $field_string);
			return $curl_resp;
		} else {
			return false;
		}
	}

	function rpanel_update()
	{
		$returndata = array();
		$rpanelquery = $this->CI->db->query("SELECT id, rate_display, market_status, 
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime, 
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
		$rpaneldata = $rpanelquery->result_array();
		$rpanelquery->free_result();
		$returndata['rpaneldata'] = $rpaneldata[0];

		$rpanelbankquery = $this->CI->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff, 
											if(showdiff = 1, askdiff, 0) as askdiff,round_off
											FROM dt_bankcontractmaster 
											LEFT JOIN dt_rpanelbank ON banksymbol = bcontract_id 
											LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
											WHERE bcontract_status = 1");
		foreach ($rpanelbankquery->result() as $rpbankrow) {
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff, "tcs_tax" => $rpbankrow->tcs_tax, "round_off" => $rpbankrow->round_off);
		}
		$rpanelbankquery->free_result();
		$returndata['rpanelbank'] = $rpanel_display_bankrates;

		$rpanelcommodityquery = $this->CI->db->query("SELECT rcom_id as comid, rcom_disname as dispname, 
													contract_symbol mcxcontract, 
													rcom_comtype as comtype, ifnull(trade_type,0) as tradetype, 
													ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff, 
													ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate, rcom_sell_diff_type, 
													rcom_buy_diff_type, rcom_sell_callpurity, 
													rcom_buy_callpurity, 
													rcom_sell_tax, rcom_buy_tax, is_gst, is_tcs,
													rcom_sell_tcs, rcom_buy_tcs    
													FROM dt_rpanelcommodities 
													LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol 
													LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
													LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id 
													WHERE rcom_status = 1");
		foreach ($rpanelcommodityquery->result() as $commodityrow) {
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate, "rcom_sell_diff_type" => $commodityrow->rcom_sell_diff_type, "rcom_buy_diff_type" => $commodityrow->rcom_buy_diff_type, "rcom_sell_callpurity" => $commodityrow->rcom_sell_callpurity, "rcom_buy_callpurity" => $commodityrow->rcom_buy_callpurity, "rcom_sell_tax" => $commodityrow->rcom_sell_tax, "rcom_buy_tax" => $commodityrow->rcom_buy_tax, "is_gst" => $commodityrow->is_gst, "is_tcs" => $commodityrow->is_tcs, "rcom_sell_tcs" => $commodityrow->rcom_sell_tcs, "rcom_buy_tcs" => $commodityrow->rcom_buy_tcs);
		}
		$rpanelcommodityquery->free_result();
		$returndata['rpanel_commodities'] = $rpanel_display_commodities;
		$requestdata['rpanel'] = $returndata;
		$url = isset(Globals::$rpanelupdate) ? Globals::$rpanelupdate : '';
		if ($url != '') {
			$field_string = http_build_query($requestdata);
			$curl_resp = curl_helper($url, $field_string);
			return $curl_resp;
		} else {
			return false;
		}
	}
}
