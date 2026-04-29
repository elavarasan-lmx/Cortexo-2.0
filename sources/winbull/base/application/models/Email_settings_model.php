<?php
class Email_settings_model extends CI_Model {
		var $table_name = 'dt_email_settings';						//Initialize table Name
		
	public function __construct() {
		parent::__construct();
		$this->load->helper('common');
		$this->load->helper('field_labels');
	}
	
	public function get_data($params = "" , $page = "all")
    {		    
		$query = $this->db->query("SELECT serv.serv_id,serv.serv_name,sms_content,sms_footer FROM dt_serv_master AS serv
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
	* Log edit operation
	* @param array $old_data - Data before update
	* @param array $new_data - Data after update
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_edit($old_data = array(), $new_data = array(), $description = '')
	{
		$module_name = 'Email Settings';
		$log_type = 'Email Settings';
		
		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}
		
		// Get changed fields for more detailed logging
		$changed_data = get_changed_fields($old_data, $new_data);
		
		return log_admin_edit($log_type, $module_name, $old_data, $new_data, $description . ' - Changed fields: ' . json_encode($changed_data));
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
		$this->db->update($this->table_name, $_POST['fv'], array('service_id' => $id));
		
		// Log the edit operation
		if ($this->db->affected_rows() > 0) {
			$new_record = $_POST['fv'];
			$this->log_edit($old_record, $new_record, 'Admin - Updated email settings ID: ' . $id);
		}
				
    }	
}
?>