<?php
class Hedgemaster_model extends CI_Model {
	var $table_name = 'dt_hedgemaster';						//Initialize table Name

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['hm_id']			=	NULL;
		$_POST['fv']['hm_fromslots']	=	NULL;
		$_POST['fv']['hm_toslots']		=	NULL;
		$_POST['fv']['hm_commodity']	=	NULL;
		$_POST['fv']['hm_com_type']		=	NULL;
		$_POST['fv']['hm_hedgetype']	=	NULL;
		$_POST['fv']['hm_roundoff_enabled']	=	0;
		$_POST['fv']['hm_roundoff']		= 	NULL;
		$_POST['fv']['hm_hedgesymbol']	=	NULL;
		$_POST['fv']['hm_hedgestatus']	=	1;
		$_POST['fv']['hm_apiurl']		=	NULL;
		$_POST['fv']['db_error_msg']	=	"";
	}
	public function get_data($params = "" , $page = "all")
    {
		$query = $this->db->query("SELECT hm_id, hm_fromslots, hm_toslots, CASE WHEN hm_commodity = 0 THEN 'GOLD' WHEN hm_commodity = 1 THEN 'SILVER' ELSE 'Unknown' END AS hm_commodity, CASE WHEN hm_com_type = 0 THEN 'MEGA' WHEN hm_com_type = 1 THEN 'MINI' WHEN hm_com_type = 2 THEN 'MICRO' ELSE 'Unknown' END AS hm_com_type, CASE WHEN hm_hedgetype = 0 THEN 'Hedge' WHEN hm_hedgetype = 1 THEN 'Mothilal Oswal' ELSE 'Unknown' END AS hm_hedgetype, hm_hedgesymbol, CASE hm_roundoff_enabled WHEN 1 THEN 'Active' WHEN 0 THEN 'In Active' END AS hm_roundoff_enabled, hm_roundoff, CASE hm_hedgestatus WHEN 1 THEN 'Active' WHEN 0 THEN 'In Active' END as hm_hedgestatus, hm_apiurl FROM dt_hedgemaster ORDER BY hm_id DESC");
		return $query;
    }
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records['hm_id']   	= $record_id;
		//Build contents query
		$query="SELECT hm_id, hm_fromslots, hm_toslots, hm_commodity, hm_com_type, hm_hedgetype, hm_hedgesymbol, hm_roundoff_enabled, hm_roundoff, hm_hedgestatus, hm_apiurl FROM dt_hedgemaster WHERE hm_id=?";
		$result_set=$this->db->query($query, array($record_id));

		foreach ($result_set->result() as $row)
		{
			$records['hm_id']   			= $row->hm_id;
			$records['hm_fromslots']   		= $row->hm_fromslots;
			$records['hm_toslots']   		= $row->hm_toslots;
			$records['hm_commodity']   		= $row->hm_commodity;
			$records['hm_com_type']   		= $row->hm_com_type;
			$records['hm_hedgetype']   		= $row->hm_hedgetype;
			$records['hm_hedgesymbol']   	= $row->hm_hedgesymbol;
			$records['hm_roundoff_enabled'] = $row->hm_roundoff_enabled;
			$records['hm_roundoff']  		= $row->hm_roundoff;
			$records['hm_hedgestatus']		= $row->hm_hedgestatus;
			$records['hm_apiurl']			= $row->hm_apiurl;
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
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE hm_id=?", array($record_id));
		
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		// Create a mapped version of the data for logging with user-friendly field names and values
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
		
		// Log the delete operation
		log_admin_delete('4', 'Hedge Master', $logged_data, 'Admin - Deleted hedge master record: ' . $old_record['hm_id']);
		
		return TRUE;
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
    public function insert_record($id)
	{
		// Clean the data before insert
		$fv = $_POST['fv'];
		unset($fv['type']);
		unset($fv['userrights']);
		unset($fv['db_error_msg']);
		
		$insertStatus = $this->db->insert($this->table_name, $fv);
		$insert_id = $this->db->insert_id();

		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		// Create a mapped version of the data for logging with user-friendly field names and values
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
		
		// Log the add operation
		log_admin_add('4', 'Hedge Master', $logged_data, 'Admin - Added new hedge master record: ' . $insert_id);
		
		return array('status' => 1);
    }

	public function update_record($id)
	{
		//Get previous old records to compare and update in log table
		$oldRecord = $this->get_entry_record($id);
		
		$_POST['fv']['hm_id']	   = $id;
		$_POST['fv']['hm_hedgestatus']	   = (isset($_POST['fv']['hm_hedgestatus']) ? $_POST['fv']['hm_hedgestatus'] : 0);
		
		// Clean the data before update
		$fv = $_POST['fv'];
		unset($fv['type']);
		unset($fv['userrights']);
		unset($fv['db_error_msg']);
		unset($fv['code']);
		
		$updateStatus = $this->db->update($this->table_name, $fv, array('hm_id' => $id));
		
		// Create selective logging - only log changed values
		if ($this->db->affected_rows() > 0) {
			// Load the common helper to use get_changed_fields function
			$this->load->helper('common');
			$changed_data = get_changed_fields($oldRecord, $_POST['fv']);
			
			// The $changed_data array already has user-friendly field names as keys
			// Extract old and new values while preserving the field labels
			$old_values = array();
			$new_values = array();
			
			foreach ($changed_data as $field_label => $values) {
				$old_values[$field_label] = $values['old'];
				$new_values[$field_label] = $values['new'];
			}
			
			// Log the edit operation with old values in log_pre_data and new values in log_update_data
			if (!empty($changed_data)) {
				log_admin_edit('4', 'Hedge Master', $old_values, $new_values, 'Admin - Updated hedge master record: ' . $_POST['fv']['hm_id']);
			}
		}
		
		return array('status' => 1);
	}
}
?>