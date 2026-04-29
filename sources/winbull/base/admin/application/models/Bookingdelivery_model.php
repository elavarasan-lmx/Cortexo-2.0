<?php
class Bookingdelivery_model extends CI_Model {
		var $table_name = 'dt_booking';						//Initialize table Name

	
	function get_data($params = "" , $page = "", $start, $from_date = "", $to_date = "")
    {		   
		$this->db->select("book_no, DATE_FORMAT(book_datetime, '%d-%m-%Y %H:%i:%s') as book_datetime, cus_name, com_name, book_rate, book_qty, if(book_type = 0,'SELL', 'BUY') as book_type, DATE_FORMAT(book_confirmedon, '%d-%m-%Y %H:%i:%s') as book_confirmedon", FALSE);
		$this->db->from('dt_booking, dt_customer, dt_com_master');
		$this->db->where('book_cusid = cus_id', NULL, FALSE);
		$this->db->where('book_comid = com_id', NULL, FALSE);
		$this->db->where('book_status', 1);
		
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
	// updating delivery Status
	function set_deliverystatus($update_ids) {	
		$cur_date = date('Y-m-d H:i:s');
		for($i=0;$i<count($update_ids); $i++) {
			$book_no = $this->db->escape_str($update_ids[$i]);
			
			// Capture old status before update
			$old_query = $this->db->query("SELECT book_no, book_status, book_deliveredon FROM dt_booking WHERE book_no = ?", array($book_no));
			$old_data = $old_query->row_array();

			$data = array(
				'book_status' => 4,
				'book_deliveredon' => $cur_date
			);
			$this->db->where('book_no', $book_no);
			$this->db->update('dt_booking', $data);

			if (!empty($old_data)) {
				log_admin_edit('47', 'Booking Delivery', $old_data, array_merge(['book_no' => $book_no], $data), 'Admin - Delivery status updated for Book No: ' . $book_no);
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