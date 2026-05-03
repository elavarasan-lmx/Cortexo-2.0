<?php
class Serv_group_model extends CI_Model {
		var $table_name = 'dt_serv_group_master';						//Initialize table Name

		public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	function load_schedule($record_id) {
		$result_set=$this->db->query("SELECT sgs_serv_group_id, sgs_days, sgs_starttime, sgs_endtime, sgs_repeat, sgs_duration
									  FROM dt_serv_group_schedule 
									  WHERE sgs_serv_group_id = ?", array($record_id));
		return $result_set;
	}
	
	public function get_data()
    {		    
		$query="SELECT serv_group_id,serv_group_name,CASE serv_group_email WHEN 0 THEN 'OFF' WHEN 1 THEN 'ON' END AS serv_group_email,CASE serv_group_sms WHEN 0 THEN 'OFF' WHEN 1 THEN 'ON' END AS serv_group_sms,
CASE serv_group_active WHEN 1 THEN 'Active'
WHEN 0 THEN 'Disabled' END AS serv_group_status FROM dt_serv_group_master";
		$result_set=$this->db->query($query);
		return $result_set;
    }
	
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['serv_group_id']		=	NULL;
		$_POST['fv']['serv_group_name']		=	NULL;
		$_POST['fv']['serv_group_email']	=	0;
		$_POST['fv']['serv_group_sms']		=	0;
		$_POST['fv']['serv_group_desc']		=	NULL;
		$_POST['fv']['serv_group_active']	=	1;
		$_POST['fv']['serv_group_header']	= 	NULL;
		$_POST['fv']['serv_group_footer']	=	NULL;
		$_POST['fv']['is_greetings']		=	0;
		$_POST['fv']['serv_group_date']		=	NULL;
		$_POST['fv']['db_error_msg']		=	"";
		
		$query="SELECT com.ctp_id,ctp_name FROM dt_commoditytype AS com WHERE com.ctp_show=1";
		$result_set=$this->db->query($query);
		$index=0;
		foreach ($result_set->result() as $row)
		{
			$com[$index]['serv_com_id'] 	= $row->ctp_id;
			$com[$index]['com_name'] 		= $row->ctp_name;
			$com[$index]['serv_sel_rate'] 	= 0;
			$com[$index]['serv_buy_rate'] 	= 0;
			$index++;
		}
		
		$_POST['fv']['serv_group_com']	=	$com;			
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['serv_group_id']   	= $record_id;
		//Build contents query
		
		$query="SELECT serv_group_id, serv_group_name, serv_group_email, serv_group_sms, serv_group_desc,
				serv_group_active, serv_group_header, serv_group_footer, is_greetings,serv_group_date 
				FROM dt_serv_group_master WHERE serv_group_id=?";
		
		//echo $query;
		
		$result_set=$this->db->query($query, array($record_id));
		foreach ($result_set->result() as $row)
		{
			$records['serv_group_id']   	= $row->serv_group_id;
			$records['serv_group_name']  	= $row->serv_group_name;
			$records['serv_group_email']  	= $row->serv_group_email;
			$records['serv_group_sms']  	= $row->serv_group_sms;
			$records['serv_group_desc'] 	= $row->serv_group_desc;			
			$records['serv_group_active']	= $row->serv_group_active;			
			$records['serv_group_header']	= $row->serv_group_header;
			$records['serv_group_footer']	= $row->serv_group_footer;
			$records['is_greetings']		= $row->is_greetings;
			$records['serv_group_date']   	= $row->serv_group_date != NULL ? date('d-m-Y',strtotime($row->serv_group_date)) : "";
			$records['db_error_msg']		= "";
		}		
		
		$query="SELECT com.ctp_id,ctp_name,
serv_grp.serv_sel_rate,serv_grp.serv_buy_rate FROM dt_commoditytype AS com
LEFT JOIN dt_serv_group_com AS serv_grp
 ON serv_grp.serv_com_id=com.ctp_id AND serv_grp.serv_group_id=? WHERE com.ctp_show=1";
 
		$result_set=$this->db->query($query, array($record_id));
		$index=0;
		foreach ($result_set->result() as $row)
		{
			$com[$index]['serv_com_id'] 		= $row->ctp_id;
			$com[$index]['com_name'] 			= $row->ctp_name;
			$com[$index]['serv_sel_rate']   	= $row->serv_sel_rate;
			$com[$index]['serv_buy_rate'] 		= $row->serv_buy_rate;			
			$index++;
		}
		
		$records['serv_group_com']=$com;
		return $records;
	}
	
	
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	public function delete_record($record_id)
	{
		// 1. Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);

		if (!$old_record) {
			return [
				"status"  => 0,
				"message" => "Service group not found"
			];
		}

		// 2. Delete Main Record
		$this->db->where('serv_group_id', $record_id);
		$delete_record = $this->db->delete('dt_serv_group_master');

		if ($this->db->affected_rows() <= 0) {
			return [
				"status"  => 0,
				"message" => "Failed to delete service group"
			];
		}

		// 3. Logging
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();

		// Create a mapped version of the data for logging
		$logged_data = array();
		foreach ($old_record as $field => $value) {
			if ($field == 'serv_group_com') continue;

			$label = $field_labels[$field] ?? $field;

			if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
				$logged_data[$label] = $value_labels[$field][$value];
			} else {
				$logged_data[$label] = $value;
			}
		}

		log_admin_delete('38', 'Service Group', $logged_data, 'Admin - Deleted service group: ' . $old_record['serv_group_name']);

		return [
			"status"  => 1,
			"message" => "Service group deleted successfully"
		];
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
	public function insert_record($id)
	{
		$fv = $this->input->post('fv', true);

		$serv_group['serv_group_name']   = $fv['serv_group_name'];
		$serv_group['serv_group_email']  = isset($fv['serv_group_email']) ? 1 : 0;
		$serv_group['serv_group_sms']    = isset($fv['serv_group_sms']) ? 1 : 0;
		$serv_group['serv_group_desc']   = $fv['serv_group_desc'];
		$serv_group['serv_group_active'] = $fv['serv_group_active'];
		$serv_group['serv_group_header'] = $fv['serv_group_header'];
		$serv_group['serv_group_footer'] = $fv['serv_group_footer'];
		$serv_group['is_greetings']      = isset($fv['is_greetings']) ? 1 : 0;
		$serv_group['serv_group_date']   = isset($fv['serv_group_date']) && $fv['serv_group_date'] != "" ? date('Y-m-d', strtotime($fv['serv_group_date'])) : NULL;

		$insertStatus = $this->db->insert('dt_serv_group_master', $serv_group);

		if (!$insertStatus) {
			return ["status" => 0, "message" => "Failed to insert service group"];
		}

		// Logging
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();

		$logged_data = [];
		foreach ($fv as $field => $value) {
			if ($field == 'serv_group_com') continue;

			$label = $field_labels[$field] ?? $field;

			if (isset($value_labels[$field][$value])) {
				$value = $value_labels[$field][$value];
			}

			$logged_data[$label] = $value;
		}

		log_admin_add('38', 'Service Group', $logged_data, 'Admin - Added new service group: ' . $fv['serv_group_name']);

		return [
			"status"  => 1,
			"message" => "Service group added successfully"
		];
	}
	
	public function update_record($id)
	{
		$old_record = $this->get_entry_record($id);
		$fv = $this->input->post('fv', true);

		$serv_group_id = $id;
		$serv_group['serv_group_name']   = $fv['serv_group_name'];
		$serv_group['serv_group_email']  = isset($fv['serv_group_email']) ? 1 : 0;
		$serv_group['serv_group_sms']    = isset($fv['serv_group_sms']) ? 1 : 0;
		$serv_group['serv_group_desc']   = $fv['serv_group_desc'];
		$serv_group['serv_group_active'] = isset($fv['serv_group_active']) ? 1 : 0;
		$serv_group['serv_group_header'] = $fv['serv_group_header'];
		$serv_group['serv_group_footer'] = $fv['serv_group_footer'];
		$serv_group['is_greetings']      = isset($fv['is_greetings']) ? 1 : 0;
		$serv_group['serv_group_date']   = isset($fv['serv_group_date']) && $fv['serv_group_date'] != "" ? date('Y-m-d', strtotime($fv['serv_group_date'])) : NULL;

		$this->db->where('serv_group_id', $serv_group_id);
		$this->db->update('dt_serv_group_master', $serv_group);

		// Selective logging
		$changed_data = get_changed_fields($old_record, $fv, array('serv_group_com'));

		$old_values = [];
		$new_values = [];

		foreach ($changed_data as $field => $values) {
			$old_values[$field] = $values['old'];
			$new_values[$field] = $values['new'];
		}

		if (!empty($changed_data)) {
			log_admin_edit('38', 'Service Group', $old_values, $new_values, 'Admin - Updated service group: ' . $fv['serv_group_name']);
		}

		return [
			"status"  => 1,
			"message" => "Service group updated successfully"
		];
	}
}
?>