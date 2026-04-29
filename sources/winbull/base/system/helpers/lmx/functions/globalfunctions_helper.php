<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Common functions used over the project
 *
 * @package		CodeIgniter
 * @subpackage	Helpers
 * @category	Helpers
 * @author		Logimax Team
 */

// ------------------------------------------------------------------------

if (! function_exists('smsapi_helper')) {
	/**
	 * Return SMS API from database
	 *
	 * @return	string
	 */
	function smsapi_helper()
	{
		$records = array();
		$CI = get_instance();

		$query = "SELECT sas_url FROM dt_smsappsettings LIMIT 1";
		$result_set = $CI->db->query($query);

		foreach ($result_set->result() as $row) {
			$records['sas_url']   			= $row->sas_url;
		}
		return $records;
	}
}

if (! function_exists('mail_htmlContent_helper')) {
	/**
	 * Return general HTML content for mail by passing email content message
	 *
	 * @param string
	 * @return	string
	 */
	function mail_htmlContent_helper($email_content)
	{
		$data = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title></title>
		</head>
		<body>
		<p>
		' . $email_content . '
		</p>
		</body>
		</html>';
		return $data;
	}
}

if (! function_exists('send_email_helper')) {
	/**
	 * Send email to given mail id
	 *
	 * @param string $email_to
	 * @param string $email_subject
	 * @param string $email_message
	 * @return bool
	 */
	function send_email_helper($email_to, $email_subject, $email_message, $email_cc = "")
	{

		$CI = get_instance();
		$company_name = "";
		$mail_server = "";
		$mail_password = "";

		$records = generalentry_helper();
		$company_name	= $records['admin_company_name'];
		$mail_server	= $records['admin_mail_server'];
		$mail_password	= $records['admin_mail_password'];

		$config = array(
			'protocol'  => 'smtp',
			'smtp_host' => 'ssl://smtp.googlemail.com',
			'smtp_port' => 465,
			'smtp_user' => $mail_server,
			'smtp_pass' => $mail_password,
			'mailtype'  => 'html',
			'charset'   => 'iso-8859-1'
		);
		$CI->load->library('email', $config);
		$CI->email->set_newline("\r\n");

		// Set to, from, message, etc.				
		$CI->email->from($mail_server, $company_name);
		$CI->email->to($email_to);
		if ($email_cc != "") {
			$CI->email->cc($email_cc);
		}
		$CI->email->subject($email_subject);
		$CI->email->message($email_message);
		return $CI->email->send();
	}
}

if (! function_exists('generalentry_helper')) {
	/**
	 * Return general entry record from database
	 *
	 * @return	string
	 */
	function generalentry_helper()
	{
		$CI = get_instance();
		$records = array();

		$query = "SELECT admin_company_name, admin_mail_server, admin_mail_password, admin_sms_username,
				admin_sms_password, admin_sms_senderid, admin_sms_authkey, admin_is_silver,admin_mail,
				admin_booking, admin_is_coin, admin_sendratexml, is_trade, margin_type, confirmation_for,confirmation_admin,confirm_time,trade_enable,ifnull(purchase_purity,-1) as purchase_purity,gold_tol,silver_tol,max_order,is_admin_mob1,is_admin_mob2,is_admin_mob3,is_admin_mob4,is_admin_mob5,admin_mob1,admin_mob2,admin_mob3,admin_mob4,admin_mob5,opening_date,gold_open_qty,gold_open_rate,silver_open_qty,silver_open_rate, limit_cancellation,IFNULL(limitcancel_time,'') AS limitcancel_time, has_gmaxqty, gold_max_qty, has_smaxqty, silver_max_qty, has_gminqty, gold_min_qty, has_sminqty, silver_min_qty, has_gallot_qty, gold_allot_qty, has_sallot_qty, silver_allot_qty, trade_on, IFNULL(trade_on_time,'') AS trade_on_time, trade_off, IFNULL(trade_off_time,'') AS trade_off_time, margin_reverse_type, display_margin, limitcancel_goldtol, limitcancel_silvertol,expire_history,days_expire,limit_enable,clientlimit_enable, gold_hedgecontract, silver_hedgecontract, is_hedge, gold_hedge_lot_qty, silver_hedge_lot_qty,admin_tcstdshint,admin_stockmanage,auto_refresh,is_hedge_silver,is_hedge_gold,gold_booking_adjusted_qty,silver_booking_adjusted_qty,country_mob1,country_mob2,country_mob3,country_mob4,country_mob5,lite_trade,mjdta_gold_diff,mjdta_silver_diff,market_on, IFNULL(market_on_time,'') AS market_on_time, market_off, IFNULL(market_off_time,'') AS market_off_time,time_diff,is_time_diff FROM dt_generalsettings";

		$result_set = $CI->db->query($query);

		foreach ($result_set->result() as $row) {
			$records['admin_company_name']   	= $row->admin_company_name;
			$records['admin_mail_server']   	= $row->admin_mail_server;
			$records['admin_mail_password']		= $row->admin_mail_password;
			$records['admin_sms_username']		= $row->admin_sms_username;
			$records['admin_sms_password']   	= $row->admin_sms_password;
			$records['admin_sms_senderid']   	= $row->admin_sms_senderid;
			$records['admin_sms_authkey']		= $row->admin_sms_authkey;
			$records['admin_is_silver']			= $row->admin_is_silver;
			$records['admin_booking']   		= $row->admin_booking;
			$records['admin_is_coin']			= $row->admin_is_coin;
			$records['admin_sendratexml']		= $row->admin_sendratexml;
			$records['margin_type']				= $row->margin_type;
			$records['confirm_time']			= $row->confirm_time;
			$records['confirmation_for']		= $row->confirmation_for;
			$records['confirmation_admin']		= $row->confirmation_admin;
			$records['is_trade']				= $row->is_trade;
			$records['trade_enable']			= $row->trade_enable;
			$records['gold_tol']				= $row->gold_tol;
			$records['silver_tol']				= $row->silver_tol;
			$records['purchase_purity']			= $row->purchase_purity;
			$records['is_admin_mob1']			= $row->is_admin_mob1;
			$records['is_admin_mob2']			= $row->is_admin_mob2;
			$records['is_admin_mob3']			= $row->is_admin_mob3;
			$records['is_admin_mob4']			= $row->is_admin_mob4;
			$records['is_admin_mob5']			= $row->is_admin_mob5;
			$records['admin_mob1']				= $row->admin_mob1;
			$records['admin_mob2']				= $row->admin_mob2;
			$records['admin_mob3']				= $row->admin_mob3;
			$records['admin_mob4']				= $row->admin_mob4;
			$records['admin_mob5']				= $row->admin_mob5;
			$records['admin_mail']				= $row->admin_mail;
			$records['max_order']				= $row->max_order;
			$records['opening_date']			= $row->opening_date != '' ? date('d-m-Y', strtotime($row->opening_date)) : '';
			$records['gold_open_qty']			= $row->gold_open_qty;
			$records['gold_open_rate']			= $row->gold_open_rate;
			$records['silver_open_qty']			= $row->silver_open_qty;
			$records['silver_open_rate']		= $row->silver_open_rate;
			$records['limit_cancellation']		= $row->limit_cancellation;
			$records['limitcancel_time']		= $row->limitcancel_time != '' ? date("g:i a", strtotime($row->limitcancel_time)) : "11:00 PM";
			$records['has_gmaxqty']   			= $row->has_gmaxqty;
			$records['gold_max_qty']   			= ($row->gold_max_qty * 1000) + 0;
			$records['has_smaxqty']   			= $row->has_smaxqty;
			$records['silver_max_qty']   		= ($row->silver_max_qty * 1000) + 0;
			$records['has_gminqty']   			= $row->has_gminqty;
			$records['gold_min_qty']   			= ($row->gold_min_qty * 1000) + 0;
			$records['has_sminqty']   			= $row->has_sminqty;
			$records['silver_min_qty']   		= ($row->silver_min_qty * 1000) + 0;
			$records['has_gallot_qty']   		= $row->has_gallot_qty;
			$records['gold_allot_qty']   		= ($row->gold_allot_qty * 1000) + 0;
			$records['has_sallot_qty']   		= $row->has_sallot_qty;
			$records['silver_allot_qty']   		= ($row->silver_allot_qty * 1000) + 0;
			$records['trade_on']				= $row->trade_on;
			$records['trade_on_time']			= $row->trade_on_time != '' ? date("g:i a", strtotime($row->trade_on_time)) : "10:00 AM";
			$records['trade_off']				= $row->trade_off;
			$records['trade_off_time']			= $row->trade_off_time != '' ? date("g:i a", strtotime($row->trade_off_time)) : "09:00 PM";
			$records['display_margin']			= $row->display_margin;
			$records['margin_reverse_type']		= $row->margin_reverse_type;
			$records['limitcancel_goldtol']		= $row->limitcancel_goldtol;
			$records['limitcancel_silvertol']	= $row->limitcancel_silvertol;
			$records['expire_history']			= $row->expire_history;
			$records['days_expire']				= $row->days_expire;
			$records['limit_enable']			= $row->limit_enable;
			$records['clientlimit_enable']		= $row->clientlimit_enable;
			$records['gold_hedgecontract']		= $row->gold_hedgecontract;
			$records['silver_hedgecontract']	= $row->silver_hedgecontract;
			$records['is_hedge']				= $row->is_hedge;
			$records['gold_hedge_lot_qty']		= $row->gold_hedge_lot_qty;
			$records['silver_hedge_lot_qty']	= $row->silver_hedge_lot_qty;
			$records['admin_tcstdshint']		= $row->admin_tcstdshint;
			$records['admin_stockmanage'] 		= $row->admin_stockmanage;
			$records['auto_refresh'] 		    = $row->auto_refresh;
			$records['is_hedge_gold']			= $row->is_hedge_gold;
			$records['is_hedge_silver']			= $row->is_hedge_silver;
			$records['gold_booking_adjusted_qty'] = $row->gold_booking_adjusted_qty;
			$records['silver_booking_adjusted_qty'] = $row->silver_booking_adjusted_qty;
			$records['country_mob1']			= $row->country_mob1;
			$records['country_mob2']			= $row->country_mob2;
			$records['country_mob3']			= $row->country_mob3;
			$records['country_mob4']			= $row->country_mob4;
			$records['country_mob5']			= $row->country_mob5;
			$records['lite_trade']			= $row->lite_trade;
			$records['mjdta_gold_diff'] 		= $row->mjdta_gold_diff;
			$records['mjdta_silver_diff'] 		= $row->mjdta_silver_diff;
			$records['market_on']				= $row->market_on;
			$records['market_on_time']			= $row->market_on_time != '' ? date("g:i a", strtotime($row->market_on_time)) : "10:00 AM";
			$records['market_off']				= $row->market_off;
			$records['market_off_time']			= $row->market_off_time != '' ? date("g:i a", strtotime($row->market_off_time)) : "09:00 PM";
			$records['time_diff']			    = $row->time_diff;
			$records['is_time_diff']			= $row->is_time_diff;
			$records['db_error_msg']			= "";
		}

		return $records;
	}

	if (! function_exists('get_adminUserId')) {
		/**
		 * Return general entry record from database
		 *
		 * @return	string
		 */
		function get_adminUserId()
		{
			$CI = get_instance();
			$username = $CI->session->userdata('username');
			$user_id = "";
			$resultset = $CI->db->query("select admin_user_id from dt_admin_user where admin_user_name='" . $username . "'");
			foreach ($resultset->result() as $row) {
				$user_id = $row->admin_user_id;
			}
			$resultset->free_result();
			return $user_id;
		}
	}
}
