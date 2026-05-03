<?php
class Bookingreport_model extends CI_Model {
		var $table_name = 'dt_booking';						//Initialize table Name

		public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	function get_data($params = "" , $page = "", $start, $from_date = "", $to_date = "")
    {
		$this->db->select("book_no, DATE_FORMAT(book_datetime, '%d-%m-%Y %H:%i:%s') as book_datetime, cus_name, com_name, book_rate, book_qty, if(book_type = 0,'SELL', 'BUY') as book_type, DATE_FORMAT(book_confirmedon, '%d-%m-%Y %H:%i:%s') as book_confirmedon, CASE book_status WHEN 0 THEN 'Request' WHEN 1 THEN 'Confirm' WHEN 2 THEN 'Hold' WHEN 3 THEN 'Reject' WHEN 4 THEN 'Delivered' END as book_status", FALSE);
		$this->db->from('dt_booking, dt_customer, dt_com_master');
		$this->db->where('book_cusid = cus_id', NULL, FALSE);
		$this->db->where('book_comid = com_id', NULL, FALSE);
		
		$from_date = $this->db->escape_str(date('Y-m-d', strtotime($from_date)));
		$to_date = $this->db->escape_str(date('Y-m-d', strtotime($to_date)));
		$this->db->where("DATE(book_datetime) BETWEEN '".$from_date."' AND '".$to_date."'", NULL, FALSE);
		
		if($this->input->post( "_search", true)) {
			$filters = json_decode($this->input->post( "filters", true), true);
			for($i=0;$i<count($filters['rules']);$i++) {
				$field = $this->db->escape_str($filters['rules'][$i]['field']);
				$data = $this->db->escape_str($filters['rules'][$i]['data']);
				
				switch ($filters['rules'][$i]['field']) {
					case 'book_datetime':	
						$this->db->where("DATE_FORMAT(book_datetime, '%d-%m-%Y %H:%i:%s') like '".$data."%'", NULL, FALSE);
						break;
					case 'book_confirmedon':	
						$this->db->where("DATE_FORMAT(book_confirmedon, '%d-%m-%Y %H:%i:%s') like '".$data."%'", NULL, FALSE);
						break;
					case 'book_type':
						$this->db->where("if(book_type=0, 'SELL', 'BUY') like '".$data."%'", NULL, FALSE);
						break;
					case 'book_status':						
						$this->db->where("CASE book_status WHEN 0 THEN 'Request' WHEN 1 THEN 'Confirm' WHEN 2 THEN 'Hold' WHEN 3 THEN 'Reject' WHEN 4 THEN 'Delivered' END like '".$data."%'", NULL, FALSE);
						break;	
					default:
						$this->db->like($field, $data);
				}				
			}
		}
		
		$this->db->order_by('book_no', 'DESC');
		
		if($page === "") {
			$start = (int)$start;
			$rows = (int)$this->input->post( "rows", TRUE );
			$this->db->limit($rows, $start);
		}			
	   	$query = $this->db->get();
		return $query;
    }		
	// delete booking
	function delete_record($update_ids) {	
		for($i=0;$i<count($update_ids); $i++) {
			$book_no = $this->db->escape_str($update_ids[$i]);
				
			// Get the record before deleting for logging purposes
			$this->db->select('book_no, book_cusid, book_comid, book_rate, book_qty, book_type');
			$this->db->from($this->table_name);
			$this->db->where('book_no', $book_no);
			$query = $this->db->get();
			$old_record = array();
			if ($query->num_rows() > 0) {
				$old_record = $query->row_array();
			}
			
			$this->db->where('book_no', $book_no);
			$this->db->delete('dt_booking');
			
			// Log the delete operation
			if ($this->db->affected_rows() > 0) {
				// Load field labels helper to map field names to user-friendly labels
				$this->load->helper('field_labels');
				$field_labels = get_field_labels();
				$value_labels = get_field_value_labels();
				
				// Create a mapped version of the data for logging
				$logged_data = array();
				foreach ($old_record as $field => $value) {
					// Use the field label if available, otherwise use the field name
					$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
					
					// Use value label if available, otherwise use the raw value
					if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
						$logged_data[$label] = $value_labels[$field][$value];
					} else {
						$logged_data[$label] = $value;
					}
				}
				
				log_admin_delete('15','Booking Report', $logged_data, 'Admin - Deleted booking report ID: ' . $book_no);
			}
		}
	}
	function get_transactiondate() {
		$resultset = $this->db->query("SELECT DATE_FORMAT(DATE_SUB(curdate(), INTERVAL trans_period DAY),'%d-%m-%Y') 
										as from_date, DATE_FORMAT(curdate(), '%d-%m-%Y') as to_date FROM dt_rpanel_settings");
		return $resultset;									
	}
}
?>