<?php
class Rpanel_settings_model extends CI_Model {
		var $table_name = 'dt_rpanel_settings';						//Initialize table Name

		public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	function set_data(){
		$query="SELECT h_colour,l_colour,confirm_time,trans_period ,isholiday,clientview FROM dt_rpanel_settings";
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
			$this->db->select('h_colour,l_colour,confirm_time,trans_period,isholiday,clientview');
			$this->db->from($this->table_name);
			$query = $this->db->get();
			$old_record = array();
			if ($query->num_rows() > 0) {
				$old_record = $query->row_array();
			}
			
			//Update Data
			$_POST['fv']['clientview']	   = (isset($_POST['fv']['clientview']) ? 1 : 0);
			$_POST['fv']['isholiday']	   = (isset($_POST['fv']['isholiday']) ? 1 : 0);
			$records=$_POST['fv'];
			$this->db->update($this->table_name, $records);
			
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
				
				// Log the edit operation with old values in log_pre_data and new values in log_update_data
				if (!empty($changed_data)) {
					log_admin_edit('2','RPanel Settings', $old_values, $new_values, 'Admin - Updated RPanel settings');
					return array('status' => 1);
				} else {
					return array('status' => 0);
				}
			}
    }	
}
?>