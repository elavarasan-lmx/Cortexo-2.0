<?php
class Smsapi_model extends CI_Model {
		var $table_name = 'dt_smsappsettings';	//Initialize table Name

	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
		
	function get_data($params = "" , $page = "all")
    {		    		
	   	$query = $this->db->query("SELECT sas_id, sas_url, sas_desc FROM dt_smsappsettings ORDER BY sas_id DESC");
		return $query;
		
    }
	
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['sas_id']		=	NULL;
		$_POST['fv']['sas_url']		=	NULL;
		$_POST['fv']['sas_desc']	=	NULL;
		$_POST['fv']['db_error_msg']=	"";
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['sas_id']  = $record_id;
			
		$query="SELECT sas_id, sas_url, sas_desc FROM dt_smsappsettings WHERE sas_id=?";
		$result_set=$this->db->query($query, array($record_id));		
		foreach ($result_set->result() as $row)
		{
			$records['sas_id']   			= $row->sas_id;
			$records['sas_url']   			= $row->sas_url;
			$records['sas_desc']   			= $row->sas_desc;
			$records['db_error_msg']		= "";		
		}		
		return $records;
	}
	
	
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	public function delete_record($record_id) 
	{
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE sas_id=?", array($record_id));
		
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
			log_admin_delete('41','SMS API', $logged_data, 'Admin - Deleted SMS API ID: ' . $record_id);
		}
		
		return TRUE;
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
    public function insert_record($id)
	{
			$this->db->insert($this->table_name, $_POST['fv']);
			
			// Log the add operation
			if ($this->db->affected_rows() > 0) {
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
				log_admin_add('41','SMS API', $logged_data, 'Admin - Added new SMS API ID: ' . $this->db->insert_id());
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }
	
	public function update_record($id)
	{
			// Get the record before updating for logging purposes
			$old_record = $this->get_entry_record($id);
			
			//Update Data
			$_POST['fv']['sas_id']	   = $id;
			$edit=$this->db->update($this->table_name, $_POST['fv'], array('sas_id' => $id));
			
			// Create selective logging - only log changed values
			if ($edit) {
				$changed_data = get_changed_fields($old_record, $_POST['fv']);
				
				// Separate old and new data for logging
				$old_values = array();
				$new_values = array();
				
				foreach ($changed_data as $field => $values) {
					$old_values[$field] = $values['old'];
					$new_values[$field] = $values['new'];
				}
				
				// Log the edit operation with old values in log_pre_data and new values in log_update_data
				if (!empty($changed_data)) {
					log_admin_edit('41','SMS API', $old_values, $new_values, 'Admin - Updated SMS API ID: ' . $id);
					return array('status' => 1);
				} else {
					return array('status' => 0);
				}
			}
	}
	
	/*
	* Fetch record
	*/
	public function get_smsapi()
	{
		$returndata = smsapi_helper();
		return $returndata;
	}
}
?>