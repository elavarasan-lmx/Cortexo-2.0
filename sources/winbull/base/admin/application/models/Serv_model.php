<?php
class Serv_model extends CI_Model
{
	var $table_name = 'dt_serv_master';						//Initialize table Name
	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	function set_data()
	{
		$query = "SELECT serv_id,serv_name,serv_email,serv_sms,serv_whatsapp FROM dt_serv_master";
		$result_set = $this->db->query($query);
		return $result_set;
	}

	/**
	 * Remove record
	 * @param id
	 * @return boolean
	 */


	public function update_record()
	{
		// Get the records before updating for logging purposes
		$this->db->select('serv_id,serv_name,serv_email,serv_sms,serv_whatsapp');
		$this->db->from($this->table_name);
		$query = $this->db->get();
		$old_records = array();
		$service_names = array(); // To store service names for logging
		if ($query->num_rows() > 0) {
			foreach ($query->result() as $row) {
				$old_records[$row->serv_id] = array(
					'serv_id' => $row->serv_id,
					'serv_name' => $row->serv_name,
					'serv_email' => $row->serv_email,
					'serv_sms' => $row->serv_sms,
					'serv_whatsapp' => $row->serv_whatsapp
				);
				$service_names[$row->serv_id] = $row->serv_name;
			}
		}

		//Update Data
		$records = $_POST['fv'];

		// Track changes for detailed logging
		$detailed_changes = array();
		$all_old_values = array();
		$all_new_values = array();

		foreach ($records as $rs) {
			//echo $rs['serv_id']."<br>";
			$temp['serv_id'] = $rs['serv_id'];
			if (isset($rs['serv_email']))
				$temp['serv_email'] = $rs['serv_email'];
			else
				$temp['serv_email'] = 0;
			if (isset($rs['serv_sms']))
				$temp['serv_sms'] = $rs['serv_sms'];
			else
				$temp['serv_sms'] = 0;
			if (isset($rs['serv_whatsapp']))
				$temp['serv_whatsapp'] = $rs['serv_whatsapp'];
			else
				$temp['serv_whatsapp'] = 0;

			$this->db->update($this->table_name, $temp, array('serv_id' => $rs['serv_id']));

			// Check for changes and log them
			$service_id = $rs['serv_id'];
			if (isset($old_records[$service_id])) {
				$old_record = $old_records[$service_id];
				$service_name = isset($service_names[$service_id]) ? $service_names[$service_id] : 'Service ID: ' . $service_id;

				// Check each field for changes
				$fields_to_check = array('serv_email', 'serv_sms', 'serv_whatsapp');
				$field_labels = array('serv_email' => 'Email', 'serv_sms' => 'SMS', 'serv_whatsapp' => 'Whatsapp');

				foreach ($fields_to_check as $field) {
					$old_value = isset($old_record[$field]) ? $old_record[$field] : 0;
					$new_value = isset($temp[$field]) ? $temp[$field] : 0;

					if ($old_value != $new_value) {
						$old_label = $old_value ? 'on' : 'off';
						$new_label = $new_value ? 'on' : 'off';

						// Add to detailed changes for log description
						$detailed_changes[] = '{Modified rights ' . $service_name . '-' . $field_labels[$field] . ': ' . $old_label . ' }';

						// Add to old and new values for structured logging
						$all_old_values[$service_name . '-' . $field_labels[$field]] = $old_label;
						$all_new_values[$service_name . '-' . $field_labels[$field]] = $new_label;
					}
				}
			}
		}

		// Create log description with detailed changes
		$log_description = 'Service Master settings';

		// Log the edit operation with old values in log_pre_data and new values in log_update_data
		if (!empty($detailed_changes)) {
			log_admin_edit('39', 'Service Master', $all_old_values, $all_new_values, $log_description);
		}
		return array('status' => 1);
	}
}
