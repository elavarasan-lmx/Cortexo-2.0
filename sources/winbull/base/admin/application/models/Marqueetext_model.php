<?php
class Marqueetext_model extends CI_Model
{
	var $table_name = 'dt_marqueetext';						//Initialize table Name
	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->query('SELECT mrq_sno, mrq_text, mrq_active FROM dt_marqueetext	ORDER BY mrq_sno DESC');
		return $query;
	}

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['mrq_sno']		=	NULL;
		$_POST['fv']['mrq_text']	=	NULL;
		$_POST['fv']['mrq_active']	=	TRUE;
		$_POST['fv']['db_error_msg'] =	"";
	}

	/*
	* Fetch record for entry when edit
	*/
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records['mrq_sno']   	= $record_id;
		//Build contents query
		$this->db->select("mrq_sno,mrq_text, mrq_active")->from($this->table_name)->where('mrq_sno', $record_id);
		$query = $this->db->get();
		foreach ($query->result() as $row) {
			$records['mrq_sno']   	= $row->mrq_sno;
			$records['mrq_text']   	= $row->mrq_text;
			$records['mrq_active'] 	= ($row->mrq_active == 1) ? TRUE : FALSE;
			$records['db_error_msg'] = "";
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

		$delete_record = $this->db->query("DELETE FROM " . $this->table_name . " WHERE mrq_sno='" . $record_id . "'");

		// Check if the delete was successful
		if ($this->db->affected_rows() > 0) {
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
					// For marquee text, strip HTML tags to avoid showing </p> in logs
					if ($field == 'mrq_text') {
						$logged_data[$label] = strip_tags($value);
					} else {
						$logged_data[$label] = $value;
					}
				}
			}

			// Log the delete operation with user-friendly field names
			log_admin_delete('29', 'Marquee Text', $logged_data, 'Admin - Deleted marquee text ID: ' . $record_id);
			return array('status' => 1);
		} else {
			return array('status' => 0);
		}
	}

	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return boolean
	 */
	public function insert_record($id)
	{
		$updatetime	=	time();
		$_POST['fv']['mrq_active']	   = (isset($_POST['fv']['mrq_active']) && $_POST['fv']['mrq_active'] == 1) ? 1 : 0;

		// Check if trying to activate and another is already active
		if ($_POST['fv']['mrq_active'] == 1) {
			$this->db->where('mrq_active', 1);
			if ($this->db->count_all_results($this->table_name) > 0) {
				return array('status' => 'already_active');
			}
		}

		$this->db->insert($this->table_name, $_POST['fv']);
		$marqueeId = $this->db->insert_id();

		// Check if the insert was successful
		if ($marqueeId) {
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
					// For marquee text, strip HTML tags to avoid showing </p> in logs
					if ($field == 'mrq_text') {
						$logged_data[$label] = strip_tags($value);
					} else {
						$logged_data[$label] = $value;
					}
				}
			}

			// Log the add operation with user-friendly field names
			log_admin_add('29', 'Marquee Text', $logged_data, 'Admin - Added new marquee text ID: ' . $marqueeId);
			$_POST['fv']['marqueeId'] = $marqueeId;
			$this->db->query("update dt_com_group_master set updatetime =" . $updatetime);
			return array('status' => 1, 'marqueeId' => $marqueeId);
		} else {
			return array('status' => 0);
		}
	}
	public function update_record($id)
	{
		$oldRecord  = $this->get_entry_record($id);
		$updatetime	=	time();
		$marquee = array();

		$_POST['fv']['mrq_active']	   	= (isset($_POST['fv']['mrq_active']) && $_POST['fv']['mrq_active'] == 1) ? 1 : 0;

		// Check if trying to activate and another is already active
		if ($_POST['fv']['mrq_active'] == 1) {
			$this->db->where('mrq_active', 1);
			$this->db->where('mrq_sno !=', $id);
			if ($this->db->count_all_results($this->table_name) > 0) {
				return array('status' => 'already_active');
			}
		}

		unset($_POST['fv']['mrq_sno']);
		$this->db->update($this->table_name, $_POST['fv'], array('mrq_sno' => $id));
		// print_r($this->db->last_query());exit;

		// Check if the update was successful
		if ($this->db->affected_rows() >= 0) {
			// Create selective logging - only log changed values
			if ($this->db->affected_rows() > 0) {
				$changed_data = get_changed_fields($oldRecord, $_POST['fv']);

				// Separate old and new data for logging
				$old_values = array();
				$new_values = array();

				foreach ($changed_data as $field => $values) {
					$old_values[$field] = $values['old'];
					$new_values[$field] = $values['new'];
				}

				// Log the edit operation with old values in log_pre_data and new values in log_update_data
				if (!empty($changed_data)) {
					log_admin_edit('29', 'Marquee Text', $old_values, $new_values, 'Admin - Updated marquee text ID: ' . $id);
				}
			}

			if ($_POST['fv']['mrq_active'] == 1) {
				$marquee['marqueetext'] = array('mrq_status' => 1, 'mrq_text' => $_POST['fv']['mrq_text'], 'mrq_sno' => $id, 'mrq_active' => $_POST['fv']['mrq_active']);
				$url = isset(Globals::$marqueeupdate) ? Globals::$marqueeupdate : '';
				if ($url != '') {
					$field_string = http_build_query($marquee);
					$curl_resp = curl_helper($url, $field_string);
				}
			}
			// Return success status
			return array('status' => 1);
		} else {
			// Return failure status
			return array('status' => 0);
		}
	}


	// updating customer activation by group
	public function update_marqueeStatus($update_ids, $active_id)
	{
		//print_r($update_ids);
		$query = $this->db->query("update dt_marqueetext set mrq_active='0'");
		for ($i = 0; $i < count($update_ids); $i++) {
			$query = $this->db->query("update dt_marqueetext set mrq_active='" . $active_id . "' where mrq_sno='" . $update_ids[$i] . "'");
		}
	}
}
