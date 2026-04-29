<?php
class Generalsettings_model extends CI_Model {
	
	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	function set_data(){
		$query="SELECT * FROM dt_generalsettings";
		$result_set=$this->db->query($query);
		return $result_set;
	}
	
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
		
	public function update_record()
	{
			// Get the record before updating for logging purposes
			$this->db->select('*');
			$this->db->from('dt_generalsettings');
			$query = $this->db->get();
			$old_records = array();
			if ($query->num_rows() > 0) {
				foreach ($query->result() as $row) {
					$old_records[$row->name] = $row->value;
				}
			}
			
			//Update Data
			//$_POST['fv']['clientview']	   = (isset($_POST['fv']['clientview']) ? 1 : 0);
//			$records=$_POST['fv'];
//			$this->db->update('dt_generalsettings', $records);	
			$this->db->query("UPDATE dt_generalsettings SET value=? WHERE name='tolerence'", array($this->input->post('fv[tolerence]', true)));
			//echo "UPDATE dt_generalsettings SET value='".$_POST['fv']['sms_message']."' WHERE name='sms_message'"; exit;
			$this->db->query("UPDATE dt_generalsettings SET value=? WHERE name='sms_message'", array($this->input->post('fv[sms_message]', true)));
			
			// Create selective logging - only log changed values
			$changed_data = get_changed_fields($old_records, $_POST['fv']);
			
			// Separate old and new data for logging
			$old_values = array();
			$new_values = array();
			
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}
			
			// Log the edit operation with old values in log_pre_data and new values in log_update_data
			if (!empty($changed_data)) {
				log_admin_edit('9','General Settings', $old_values, $new_values, 'Admin - Updated general settings');
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }	
}
?>