<?php
class Ratealertreport_model extends CI_Model {
		var $table_name = 'dt_cus_ratealert';						//Initialize table Name

	
	function get_data($params = "" , $page = "", $start, $from_date = "", $to_date = "")
    {
		if($this->input->post( "_search", true)) {
			$filters = json_decode($this->input->post( "filters", true), true);
			$where = "";
			for($i=0;$i<count($filters['rules']);$i++) {
				switch ($filters['rules'][$i]['field']) {
					case 'book_datetime':	
						$where.=" AND DATE_FORMAT(book_datetime, '%d-%m-%Y %H:%i:%s') like '".$filters['rules'][$i]['data']."%' ";			
						break;
					case 'book_confirmedon':	
						$where.=" AND DATE_FORMAT(book_confirmedon, '%d-%m-%Y %H:%i:%s') like '".$filters['rules'][$i]['data']."%' ";			
						break;
					case 'book_type':
						$where.=" AND if(book_type=0, 'SELL', 'BUY') like '".$filters['rules'][$i]['data']."%' ";					
						break;
					case 'book_status':						
						$where.=" AND CASE book_status WHEN 0 THEN 'Request' WHEN 1 THEN 'Confirm' 
						WHEN 2 THEN 'Hold' WHEN 3 THEN 'Reject' WHEN 4 THEN 'Delivered' END 
						like '".$filters['rules'][$i]['data']."%' ";					
						break;	
					default:
						$where.=" AND ".$filters['rules'][$i]['field']." like '".$filters['rules'][$i]['data']."%' ";		
				}				
			}
		}
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		$str_query = "SELECT rate_id,cus_name as Customer,if(rate_type=0,'bid','ask') as AlertType,com_name as Commodity,rate_rate1 as Rate1,rate_rate2 as Rate2,
						date_format(from_unixtime(rate_fixdate),'%d-%m-%Y %h:%i:%s %p') as Fixeddate,
						if(rate_activateddate is null,'',date_format(from_unixtime(rate_activateddate),'%d-%m-%Y %h:%i:%s %p')) as Activated,
						if(rate_status=1,'Sent','Not Send') as smsstatus
						FROM dt_cus_ratealert
						LEFT JOIN dt_customer on cus_id = rate_cusid
						LEFT JOIN dt_com_master on com_id = rate_comid
					WHERE 
						date(from_unixtime(rate_fixdate)) BETWEEN '".$from_date."' AND '".$to_date."'".$where." 
					ORDER BY 
						rate_id
					DESC";
					//echo $str_query;exit;
		if($page === "") {
			
			$str_query = $str_query." LIMIT ".$start.", ".$this->input->post( "rows", TRUE );
		}			
	   	$query = $this->db->query($str_query);
		return $query;
    }		
	
	public function get_transactiondate() {
		$resultset = $this->db->query("SELECT DATE_FORMAT(DATE_SUB(curdate(), INTERVAL trans_period DAY),'%d-%m-%Y') 
										as from_date, DATE_FORMAT(curdate(), '%d-%m-%Y') as to_date FROM dt_rpanel_settings");
		return $resultset;									
	}
}
?>