<?php
class Unfix_model extends CI_Model {
		var $table_name = 'unfix_model';						//Initialize table Name
    public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	public function get_data($id)
    {
		$query = $this->db->query("SELECT id_unfix,c.cus_name,rate, DATE_FORMAT(date, '%d-%m-%Y') as date, party_name , pure_weight,amount, unfix_close FROM dt_unfix un
		    left join dt_customer c on c.cus_id= un.party_name where unfix_close = 0 and c.cus_id = ".$id."
		 ORDER BY id_unfix DESC");
		 return $query->result_array();

		
    }
		public function empty_record() 										//Fetch listing record
		{
			$_POST['fv']['pure_weight']	=	0;
			$_POST['fv']['id_unfix']	=	NULL;
			$_POST['fv']['rate']		=	0.0;
			$_POST['fv']['amount']		=	NULL;
			$_POST['fv']['party_name']	=	NULL;
		}

	/*
	* Fetch record for entry when edit
	*/
	
	public function get_entry_record($record_id) 										//Fetch entry record
{
	// $records['com_id']   	= $record_id;
	//Build contents query
	$records['id_unfix']   	= $record_id;
	$query="SELECT id_unfix ,date, party_name AS  cus_id ,rate, pure_weight, amount from dt_unfix WHERE id_unfix=?";
	$result_set=$this->db->query($query, array($record_id));
	
	foreach ($result_set->result() as $row)
	{
		$records['id_unfix']   			= $row->id_unfix;
		$records['date']   			= $row->date;
		$records['cus_id']  	= $row->cus_id;
		$records['rate']   			= $row->rate;
		$records['amount']  	= $row->amount;
		$records['pure_weight']   		= $row->pure_weight;
	}
	return $records;

	//return $result_set->row_array();
}
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	public function delete_record($id)
	{
		// Get the record before deleting for logging purposes
		$oldRecord = $this->get_entry_record($id);
		
		$delete_record = $this->db->query("DELETE FROM dt_unfix WHERE id_unfix =".$id);
		
		// Log the delete operation
		if ($this->db->affected_rows() > 0) {
			// Log the delete operation
				// Load field labels helper to map field names to user-friendly labels
					$this->load->helper('field_labels');
					$field_labels = get_field_labels();
					$value_labels = get_field_value_labels();
					
					// Create a mapped version of the data for logging
					$logged_data = array();
					foreach ($delete_record as $field => $value) {
						// Use the field label if available, otherwise use the field name
						$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
						
						// Use value label if available, otherwise use the raw value
						if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
							$logged_data[$label] = $value_labels[$field][$value];
						} else {
							$logged_data[$label] = $value;
						}
					}
			log_admin_delete('42','Unfix Payment', $logged_data, 'Admin - Deleted unfix payment record: ' . $oldRecord['id_unfix']);
		}
		
		return $delete_record;
		
	}

	/*
	* To delete sub record
	* @return
	*/
	public function delete_sub_record($table_name,$col_name,$record_id)
	{
		$delete_record = $this->db->query("DELETE FROM ".$table_name." WHERE ".$col_name."=?", array($record_id));
		return TRUE;
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
 


	public function update_record($id,$post)
	{
		// Get the record before updating for logging purposes
		$oldRecord = $this->get_entry_record($id);

		 // return $sts;	
		//$this->updateLog($oldRecord, $post);
			
        $this->db->where('id_unfix', $id);
        $sts=$this->db->update("dt_unfix", $post);	
		
		// Create selective logging - only log changed values
		if ($this->db->affected_rows() > 0) {
			$changed_data = get_changed_fields($oldRecord, $post);
			
			// Separate old and new data for logging
			$old_values = array();
			$new_values = array();
			
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}
			
			// Log the edit operation with old values in log_pre_data and new values in log_update_data
			if (!empty($changed_data)) {
				log_admin_edit('42','Unfix Payment', $old_values, $new_values, 'Admin - Updated unfix payment record: ' . $id);
				return array('status' => 1);
				} else {
					return array('status' => 0);
				}
		}
		
        return $sts;	
	}

	function getcustomerall_data(){

		$customer_query = $this->db->query("SELECT  DISTINCT cus.cus_id,cus.cus_name,c.weight,c.amount,ROUND( c.amount / c.weight ,2) as rate FROM
		( SELECT sum(uf.amount)as amount, sum(uf.pure_weight) as weight,uf.party_name as custo_id from dt_unfix uf WHERE unfix_close = 0 GROUP by uf.party_name ) c
		left join dt_customer  cus on cus.cus_id=c.custo_id where cus.unfix=1;");
		
        return $customer_query->result_array();
    }

	function getcustomer_data($id){
		if($id==0){
			$customer_query = $this->db->query("SELECT  DISTINCT cus_id,cus_name, cus_mobile FROM dt_customer c where  c.unfix=1");

		}else{
			$customer_query = $this->db->query("SELECT  DISTINCT cus_id,cus_name, cus_mobile FROM dt_customer c where  c.unfix=1 and  c.cus_id= $id");

		}

		
        return $customer_query->result_array();
    }
    function save_entry_record($post){
		

        $insertStatus = $this->db->insert('dt_unfix', $post);
        return $insertStatus;
    }
	function get_customer_bookingdata($id){
		$customerbooking_query = $this->db->query("SELECT round(book_qty*1000,3) as book_qty,c.cus_name,book_no,book_datetime,book_rate,book_totalcost, book_narration,book_cusid, book_unfixclose FROM `dt_booking` dtb left join dt_customer c on c.cus_id=book_cusid where book_unfixclose = 0 and book_cusid=$id and dtb.unfix=1;");
		
        return $customerbooking_query->result_array();
	}
	function close_btn1($id){
		$query=$this->db->query("UPDATE `dt_unfix` SET `unfix_close` = '1' WHERE `dt_unfix`.`id_unfix` = '".$id."'; ");
		// return $query->result();
		if ($this->db->affected_rows() > 0){
			return TRUE;
		}else{
			return FALSE;
		}
	}
	function close_btn2($id){
		$query1=$this->db->query("UPDATE `dt_booking` SET `book_unfixclose` = '1' WHERE `dt_booking`.`book_no` = '".$id."'; ");
		// return $query->result();
		if ($this->db->affected_rows() > 0){
			return TRUE;
		}else{
			return FALSE;
		}
	}
	
	public function insert_record($id)
	{
		$admin_id 				 = $this->login_model->get_userid();
		$adminipaddress 	 	 = $_SERVER['SERVER_ADDR'];

		$insertStatus = $this->db->insert('dt_unfix', $_POST);
		$insert_id = $this->db->insert_id();
		
		// Log the add operation
		if ($insert_id) {
			// Load field labels helper to map field names to user-friendly labels
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();
			
			// Create a mapped version of the data for logging
			$logged_data = array();
			foreach ($_POST['fv'] as $field => $value) {
				// Use the field label if available, otherwise use the field name
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				
				// Use value label if available, otherwise use the raw value
				if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
					$logged_data[$label] = $value_labels[$field][$value];
				} else {
					$logged_data[$label] = $value;
				}
			}
			log_admin_add('42','Unfix Payment', $logged_data, 'Admin - Added new unfix payment record');
			return array('status' => 1);
		} else {
			return array('status' => 0);
		}
		
		$comId = array('id_unfix' => $insert_id);
		$updatedRecord = $comId + $_POST;
		$records = json_encode($updatedRecord);
		$admin_id 		= $this->login_model->get_userid();
		$adminipaddress = $_SERVER['SERVER_ADDR'];
		$log_shortdesc 	= "Record added in Unfix Payment. Id Unfix: ".$insert_id;
		$logtype = 13;
		$logdatetime = date('Y-m-d H:i:s');
		$logupdatedata = date('Y-m-d H:i:s');
		//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
    }
	function updateLog($oldRecord, $newRecord)
	{
		
		$updatedRecord = array();
		
		$record = $newRecord;
		
		if($oldRecord['date'] != $record['date'])
		{
			$updatedRecord['New']['date'] = $record['date'];
			$updatedRecord['Old']['date'] = $oldRecord['date'];
		}
		if($oldRecord['rate'] != $record['rate'])
		{
			$updatedRecord['New']['rate'] = $record['rate'];
			$updatedRecord['Old']['rate'] = $oldRecord['rate'];
		}
		if($oldRecord['pure_weight'] != $record['pure_weight'])
		{
			$updatedRecord['New']['pure_weight'] = $record['pure_weight'];
			$updatedRecord['Old']['pure_weight'] = $oldRecord['pure_weight'];
		}
		if($oldRecord['amount'] != $record['com_other_charges'])
		{
			$updatedRecord['New']['amount'] = $record['amount'];
			$updatedRecord['Old']['amount'] = $oldRecord['amount'];
		}
		
		if(count($updatedRecord) > 0)
		{
			$comId = array('id_unfix' => $oldRecord['id_unfix']);
			$updatedRecord = $comId + $updatedRecord;
			$records = json_encode($updatedRecord);
			$admin_id 		= $this->login_model->get_userid();
			$adminipaddress = $_SERVER['SERVER_ADDR'];
			$log_shortdesc 	= "Updated Unfix Payment. Id Unfix: ".$oldRecord['id_unfix'];
			$logtype = 13;
			$logdatetime = date('Y-m-d H:i:s');
			$logupdatedata = date('Y-m-d H:i:s');
			//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
		}
	} 
}
?>