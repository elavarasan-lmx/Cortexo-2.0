<?php
class Logs_model extends CI_Model {
	var $table_name = 'dt_com_group_tracking';						//Initialize table Name
	var $second_name = 'dt_booking_tracking';						//Initialize table Name
	var $third_name = 'dt_rpanelcontract_tracking';						//Initialize table Name
	var $four_name = 'dt_r_panel_tracking';						//Initialize table Name

	public function commgroup_dataload($from_date = '', $to_date = '')
    {
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
	   	$query = $this->db->query('SELECT tracking_id, com_group_name, 
									DATE_FORMAT(changetime, "%d-%m-%Y %H:%i:%s") AS changetime, com_name,
									com_sel_premium,com_buy_premium, 
									IF(com_sel_active = 1, "Active", "Inactive") AS com_sel_active,
									IF(com_buy_active = 1, "Active", "Inactive") AS com_buy_active,
									com_delverydays, IF(com_premium_type = 0, "Auto", "Manual") AS com_premium_type, 
									IF(com_sel_trade = 1, "Active", "Inactive") AS com_sel_trade,
									IF(com_buy_trade = 1, "Active", "Inactive") AS com_buy_trade,
									com_selretail_active,
									com_selretail_premium,com_adminip,
									ifnull(admin_user_name,"-") AS admin_user_name
									FROM
										dt_com_group_tracking as trcom
									LEFT JOIN dt_com_master AS com_grp ON trcom.com_id = com_grp.com_id
									LEFT JOIN dt_com_group_master AS com_gm ON com_gm.com_group_id = trcom.com_group_id
									LEFT JOIN dt_admin_user ON com_adminuser = admin_user_id
									WHERE DATE(changetime) BETWEEN "'.$from_date.'" AND "'.$to_date.'"
									ORDER BY
										tracking_id
									DESC');
		return $query;
    }
	public function rpanelrate_dataload($from_date = '', $to_date = '')
    {
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
	   	$query = $this->db->query('SELECT tracking_id, rcom_disname, 
									DATE_FORMAT(changetime, "%d-%m-%Y %H:%i:%s") AS changetime, 
									IF(trade_type = 0, "Future", IF(trade_type = 1, "Bank", "Manual")) AS trade_type,
									sell_diff, buy_diff, sell_rate
									FROM
										dt_rpanelcontract_tracking as trrcom
									LEFT JOIN dt_rpanelcommodities AS rpcom ON rpcom.rcom_id = trrcom.rpanelcomid
									WHERE DATE(changetime) BETWEEN "'.$from_date.'" AND "'.$to_date.'"
									ORDER BY
										tracking_id
									DESC');
		return $query;
    }
	public function rpanelstatus_dataload($from_date = '', $to_date = '')
    {
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
	   	$query = $this->db->query('SELECT tracking_id,
									DATE_FORMAT(changetime, "%d-%m-%Y %H:%i:%s") AS changetime,
									IF(rate_display = 0, "OFF", "ON") AS rate_display,
									IF(market_status = 0, "OFF", "ON") AS market_status,
									market_message
									FROM
									dt_r_panel_tracking
									WHERE DATE(changetime) BETWEEN "'.$from_date.'" AND "'.$to_date.'"
									ORDER BY
										tracking_id
									DESC');
		return $query;
    }
	public function tradebook_dataload($from_date = '', $to_date = '')
    {
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		
	   	$query = $this->db->query('SELECT tracking_id, 
						DATE_FORMAT(changetime, "%d-%m-%Y %H:%i:%s") AS changetime,
						book_no, cus_name as customername,
						com_name as commodityname,
						CONCAT(if(book_type=0, "SELL", "BUY"), " - ",  if(ordertype = 0, "Booking", if(ordertype = 1, "Order", if(ordertype = 2, "Alert", "")))) as book_type,
						book_qty*1000 as book_qty, book_rate, book_comweight, book_totalcost,
						IF(book_confirmedon IS NULL or book_confirmedon = "", "-", book_confirmedon) AS book_confirmedon, 
						if(ordertype=0,"Book","Limit") as ordertype,
						if(book_status=0,"Request",if(book_status=1,"Confirm",
						if(book_status=2,"Hold","Reject"))) as book_status,orderstatus,
						ifnull(book_deviceid,"-") AS book_deviceid,
						ifnull(user_agent,"-") AS user_agent,
						ifnull(book_useripaddress,"-") AS book_useripaddress,
						ifnull(book_adminipaddress,"-") AS book_adminipaddress,
						ifnull(admin_user_name,"-") AS admin_user_name,
						if(book_by = 1, "App",if(book_by = 2, "Browser",  if(book_by = 3, "Admin",""))) AS book_by
						FROM dt_booking_tracking
						LEFT JOIN dt_customer ON cus_id = book_cusid
						LEFT JOIN dt_com_master ON book_comid = com_id
						LEFT JOIN dt_admin_user ON book_adminuser = admin_user_id
									WHERE DATE(changetime) BETWEEN "'.$from_date.'" AND "'.$to_date.'"
									ORDER BY
										tracking_id
									DESC');
						
		return $query;
    }
	function get_transactiondate() 
	{
		$resultset = $this->db->query("SELECT DATE_FORMAT(DATE_SUB(curdate(), INTERVAL trans_period DAY),'%d-%m-%Y') 
										as from_date, DATE_FORMAT(curdate(), '%d-%m-%Y') as to_date FROM dt_rpanel_settings");
		return $resultset;									
	}
}
?>
