<?php 
class Userevent_model extends CI_Model {
		var $table_name = 'dt_events';						//Initialize table Name
        public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	public function get_data($params = "" , $page = "all")
    {		
		$query = $this->db->query("SELECT eve_id,eve_name,eve_date,eve_timeam,eve_timepm,eve_description from dt_events");
		return $query;
	}
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['eve_id']						=	NULL;		
		$_POST['fv']['eve_name']					=	NULL;		
		$_POST['fv']['eve_timeam']					=	NULL;		
		$_POST['fv']['eve_timepm']					=	NULL;		
		$_POST['fv']['eve_date']					=	Null;
		$_POST['fv']['eve_description']				=	NULL;
		
	}
	public function get_entry_record($id)
	{
		
		$records['eve_id']   				= $id;
		$query = $this->db->query("SELECT eve_id,eve_name,eve_date,eve_timeam,eve_timepm,eve_description from dt_events where eve_id=?", array($id));
		foreach ($query->result() as $row)
		{
			$records['eve_id']   				= $row->eve_id;
			$records['eve_name']   				= $row->eve_name;
			$records['eve_date']   				= $row->eve_date;
			$records['eve_timeam']   				= $row->eve_timeam;
			$records['eve_timepm']   				= $row->eve_timepm;
			$records['eve_description']   		= $row->eve_description;	
		}
		return $records;
	}
	public function get_activateentry_record($id) 										//Fetch entry record
	{
		$records['eve_id']   				= $id;
		//Build contents query
		$query = $this->db->query("SELECT eve_id,eve_name,eve_date,eve_timeam,eve_timepm,eve_description from dt_events where eve_id=?", array($id));
		foreach ($query->result() as $row)
		{
			$records['eve_id']   				= $id;
			$records['eve_name']   				= $row->eve_name;
			$records['eve_date']   				= $row->eve_date;
			$records['eve_timeam']   			= $row->eve_timeam;
			$records['eve_timepm']   			= $row->eve_timepm;
			$records['eve_description']   		= $row->eve_description;
			
		}
		//print_r($records);
		return $records;
	}
	 public function insert_record($id)
	{
		//$records['eve_id']   = $id;
		//$insert['eve_id']     =  $_POST['fv']['eve_id'];
		$insert['eve_name']  = $_POST['fv']['eve_name'];
		$insert['eve_date']  =  $_POST['fv']['eve_date'];
		$insert['eve_timeam']  =  $_POST['fv']['eve_timeam'];
		$insert['eve_timepm']  =  $_POST['fv']['eve_timepm'];
		$insert['eve_description'] =$_POST['fv']['eve_description'];
		
		/* print_r($insert);		 */
		$eve_id=$this->db->insert_id();
		$status = $this->db->insert('dt_events',$insert);
		
		// Log the add operation
		if ($status) {
			// Load field labels helper to map field names to user-friendly labels
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();
			
			// Create a mapped version of the data for logging
			$logged_data = array();
			foreach ($insert as $field => $value) {
				// Use the field label if available, otherwise use the field name
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				
				// Use value label if available, otherwise use the raw value
				if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
					$logged_data[$label] = $value_labels[$field][$value];
				} else {
					$logged_data[$label] = $value;
				}
			}
			log_admin_add('43','User Event', $logged_data, 'Admin - Added new user event ID: ' . $eve_id);
			return array('status' => 1);
		} else {
			return array('status' => 0);
		}
		
		//echo $this->db->last_query($status);exit;
	}
	public function update_record($id)
	{
		// Get the record before updating for logging purposes
		$this->db->select('eve_id,eve_name,eve_date,eve_timeam,eve_timepm,eve_description');
		$this->db->from($this->table_name);
		$this->db->where('eve_id', $id);
		$query = $this->db->get();
		$old_record = array();
		if ($query->num_rows() > 0) {
			$old_record = $query->row_array();
		}
		
		$update['eve_id']      		= $id;
		$update['eve_name']  		= $_POST['fv']['eve_name'];
		$update['eve_date']			= $_POST['fv']['eve_date'];
		$update['eve_timeam']		= $_POST['fv']['eve_timeam'];
		$update['eve_timepm']		= $_POST['fv']['eve_timepm'];
		$update['eve_description'] 	=$_POST['fv']['eve_description'];

		//$id=$this->db->insert_id();
		//$this->db->update('dt_events',$update);
		$this->db->update($this->table_name,$update, array('eve_id' => $id));
		
		// Create selective logging - only log changed values
		$changed_data = get_changed_fields($old_record, $update);
		
		// Separate old and new data for logging
		$old_values = array();
		$new_values = array();
		
		foreach ($changed_data as $field => $values) {
			$old_values[$field] = $values['old'];
			$new_values[$field] = $values['new'];
		}
		
		// Log the edit operation with old values in log_pre_data and new values in log_update_data
		if (!empty($changed_data)) {
			log_admin_edit('43','User Event', $old_values, $new_values, 'Admin - Updated user event ID: ' . $id);
			return array('status' => 1);
			} else {
				return array('status' => 0);
			}
	}
	public function delete_record($record_id) 
	{
		// Get the record before deleting for logging purposes
		$this->db->select('eve_id,eve_name,eve_date,eve_timeam,eve_timepm,eve_description');
		$this->db->from($this->table_name);
		$this->db->where('eve_id', $record_id);
		$query = $this->db->get();
		$old_record = array();
		if ($query->num_rows() > 0) {
			$old_record = $query->row_array();
		}
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE eve_id=?", array($record_id));
		
		// Log the delete operation
		if ($this->db->affected_rows() > 0) {
			// Log the delete operation
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
			log_admin_delete('43','User Event', $logged_data, 'Admin - Deleted user event ID: ' . $record_id);
		}
		
		return TRUE;
	}
	
	
}

?>