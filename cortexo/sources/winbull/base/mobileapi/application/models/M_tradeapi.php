<?php
class M_tradeapi extends CI_Model {

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
		$module_name = 'Trade API';
		$log_type = 'Trade API';
		
		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}
		
		return log_admin_add($log_type, $module_name, $data, $description);
	}
	
	public function log_edit($old_data = array(), $new_data = array(), $description = '')
	{
		$module_name = 'Trade API';
		$log_type = 'Trade API';
		
		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}
		
		return log_admin_edit($log_type, $module_name, $old_data, $new_data, $description);
	}
	
	public function log_delete($data = array(), $description = '')
	{
		$module_name = 'Trade API';
		$log_type = 'Trade API';
		
		if (empty($description)) {
			$description = 'Deleted record from ' . $module_name;
		}
		
		return log_admin_delete($log_type, $module_name, $data, $description);
	}
	
	function gettodaytandinglist()
	{
		$from_date = date('Y-m-d');
		$to_date = date('Y-m-d');
		$resultset = array();
		$resultset = $this->db->query("SELECT book_no as dealno,
						DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as bookdate,
						if(book_type=0,'Sell','Buy') as book_type,
						cus_name as customername,
						REPLACE(com_name,'`','') as commodityname,
						(book_qty*1000) as bookqty, book_rate,
						round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
						cus_mobile
						From dt_booking
						Left Join dt_customer on cus_id = book_cusid
						Left join dt_com_master on com_id = book_comid 
						WHERE ifnull(delete_status,0) = 0 AND  
						DATE(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) BETWEEN '".$from_date."' AND '".$to_date."'
					    ORDER BY
					  	dealno
					    ASC");
					
		foreach ($resultset->result() as $row) {
			$return_data[] = array(
			'dealno'	=>	$row->dealno,
			'bookdate'	=>	$row->bookdate,
			'book_type'	=>	$row->book_type,
			'customername'	=>	$row->customername,
			'commodityname'	=>	$row->commodityname,
			'bookqty'	=>	$row->bookqty,
			'book_rate'	=>	$row->book_rate,
			'bookamount'	=>	$row->bookamount
			);			
		}			
		return $return_data;
	}
	function gettodaytandinglistbydate($from_date = "", $to_date = "")
	{
		$from_date = date('Y-m-d H:i:s', strtotime($from_date));
		$to_date = date('Y-m-d H:i:s', strtotime($to_date));
		$resultset = array();
		$resultset = $this->db->query("SELECT book_no as dealno,
						DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as bookdate,
						if(book_type=0,'Sell','Buy') as book_type,
						cus_name as customername,
						REPLACE(com_name,'`','') as commodityname,
						(book_qty*1000) as bookqty, book_rate,
						round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
						cus_mobile
						From dt_booking
						Left Join dt_customer on cus_id = book_cusid
						Left join dt_com_master on com_id = book_comid 
						WHERE book_status = 1 AND ifnull(delete_status,0) = 0 AND  
						(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime)) BETWEEN '".$from_date."' AND '".$to_date."'
					    ORDER BY
					  	dealno
					    ASC");
						
		foreach ($resultset->result() as $row) {
			$return_data[] = array(
			'dealno'	=>	$row->dealno,
			'bookdate'	=>	$row->bookdate,
			'book_type'	=>	$row->book_type,
			'customername'	=>	$row->customername,
			'commodityname'	=>	$row->commodityname,
			'bookqty'	=>	$row->bookqty,
			'book_rate'	=>	$row->book_rate,
			'bookamount'	=>	$row->bookamount
			);			
		}
		if(!isset($return_data)){
			$return_data = 'Records not found';
		}
		return $return_data;
	}
}