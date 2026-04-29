<?php
class Email_settings_model extends CI_Model {
		var $table_name = 'dt_email_settings';
		var $table_name1 = 'dt_serv_master';							//Initialize table Name

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
		$query = $this->db->query("SELECT serv.serv_id,serv.serv_name,sms_content,sms_footer 
		FROM dt_serv_master AS serv
		LEFT JOIN dt_sms_settings AS sms ON sms.service_id=serv.serv_id");
		return $query;
	}
	
	
	function get_entry_record($record_id) {
		$query="select serv_id, serv_name, email_content, email_signature 
				from dt_serv_master 
				left join dt_email_settings on service_id = serv_id 
				where serv_id =".$record_id;
		$result_set=$this->db->query($query);
		foreach ($result_set->result() as $row)
		{
			
			$records['service_id'] 		= $row->serv_id;
			$records['serv_name'] 		= $row->serv_name;			
			$records['email_content']	= $row->email_content;
			$records['email_signature']	= $row->email_signature;
		}		
		return $records;
	}
	
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	
	
	public function update_record($id)
	{
		// Get the record before updating for logging purposes
		$old_record = $this->get_entry_record($id);
		
		$_POST['fv']['service_id']	   = $id;
		$Update_record = $this->db->update($this->table_name, $_POST['fv'], array('service_id' => $id));	
		
		// Create selective logging - only log changed values
		if ($this->db->affected_rows() > 0) {
			$changed_data = get_changed_fields($old_record, $_POST['fv']);
			
			// Separate old and new data for logging
			$old_values = array();
			$new_values = array();
			
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}
			
			if (!empty($changed_data)) {
				log_admin_edit('25','Email Settings', $old_values, $new_values, 'Admin - Updated email settings for service ID: ' . $id);
			}
			return array('status' => 1);

		} else {
			// BUG-04 FIX: affected_rows == 0 means nothing changed — treat as success, not failure
			return array('status' => 1, 'message' => 'No changes detected.');
		}
			
    }	
	public function delete_record($record_id)
	{
		// BY DESIGN: Deletes from both dt_email_settings AND dt_serv_master.
		// These modules are tightly coupled — deleting a service removes all its email config too.

		// Get record for logging before delete
		$old_record = $this->get_entry_record($record_id);

		// Step 1: Delete email config (child table)
		$this->db->where('service_id', $record_id);
		$this->db->delete($this->table_name); // dt_email_settings

		// Step 2: Delete service master record (parent) — intentional cascade
		$this->db->query("DELETE FROM " . $this->table_name1 . " WHERE serv_id = " . (int)$record_id);

		if ($this->db->affected_rows() > 0) {

			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$logged_data = array();
			foreach ($old_record as $field => $value) {
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				$logged_data[$label] = isset($value_labels[$field][$value]) ? $value_labels[$field][$value] : $value;
			}

			log_admin_delete('25', 'Service Master', $logged_data, 'Admin - Deleted service + email config for ID: ' . $record_id);
			return array('status' => 1);
		}

		return array('status' => 0);
	}
}
?>