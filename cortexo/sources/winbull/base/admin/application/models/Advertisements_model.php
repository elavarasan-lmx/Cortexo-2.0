<?php
class Advertisements_model extends CI_Model
{
	var $table_name = 'dt_advertisements';						//Initialize table Name

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->query("SELECT adv_id,adv_name,if(adv_type = 0, 'Block-1',if(adv_type = 1,'Block-2','Block-3' )) as adv_type ,if(adv_status =0 ,'In active','Active') as adv_status, adv_sequence, adv_url
FROM dt_advertisements ORDER BY adv_id DESC");
		return $query;
	}
	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['adv_id']				=	NULL;
		$_POST['fv']['adv_name']			=	NULL;
		$_POST['fv']['adv_type']			=	0;
		$_POST['fv']['adv_location']		=	NULL;
		$_POST['fv']['adv_url']				=	NULL;
		$_POST['fv']['adv_status']			=	TRUE;
		$_POST['fv']['adv_img']				= 	NULL;
		$_POST['fv']['adv_sequence']		= 	NULL;
		$_POST['fv']['db_error_msg']		=	"";
	}

	/*
	* Fetch record for entry when edit 
	*/
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records['adv_id']   	= $record_id;
		$query = "SELECT adv_id, adv_name, adv_type,adv_location,adv_status,adv_sequence,adv_url FROM dt_advertisements WHERE adv_id=" . $record_id;
		$result_set = $this->db->query($query);

		$baseurl	=	$this->config->item('base_url');
		$search	=	"admin/";
		$replace	=	"";

		$pos = strrpos($baseurl, $search);

		if ($pos !== false) {
			$baseurl = substr_replace($baseurl, $replace, $pos, strlen($search));
		}

		foreach ($result_set->result() as $row) {
			$records['adv_id']   			= $row->adv_id;
			$records['adv_name']   			= $row->adv_name;
			$records['adv_type']   			= $row->adv_type;
			$records['adv_url']				= $row->adv_url;
			$records['adv_img']   			= $baseurl . $row->adv_location;
			$records['adv_status'] 			= ($row->adv_status == 1) ? TRUE : FALSE;
			$records['adv_sequence']		= $row->adv_sequence;
			$records['db_error_msg']		= "";
		}
		return $records;
	}


	/**
	 * Remove record
	 * @param id
	 * @return boolean
	 */
	// public function delete_record($record_id)
	// {
	// 	// Get the record before deleting for logging purposes
	// 	$old_record = $this->get_entry_record($record_id);

	// 	$delete_record = $this->db->query("DELETE FROM " . $this->table_name . " WHERE adv_id=" . $record_id);
	// 	//$this->db->update($this->table_name, array('adv_status'=> '0'), array('adv_id' => $record_id));

	// 	// Log the delete operation
	// 	if ($this->db->affected_rows() > 0) {
	// 		// Load field labels helper to map field names to user-friendly labels
	// 		$this->load->helper('field_labels');
	// 		$field_labels = get_field_labels();
	// 		$value_labels = get_field_value_labels();

	// 		// Create a mapped version of the data for logging
	// 		$logged_data = array();
	// 		foreach ($old_record as $field => $value) {
	// 			// Use the field label if available, otherwise use the field name
	// 			$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;

	// 			// Use value label if available, otherwise use the raw value
	// 			if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
	// 				$logged_data[$label] = $value_labels[$field][$value];
	// 			} else {
	// 				$logged_data[$label] = $value;
	// 			}
	// 		}

	// 		log_admin_delete('11','Advertisements', $logged_data, 'Admin - Deleted advertisement: ' . $old_record['adv_name']);
	// 	}

	// 	return TRUE;
	// }
	public function delete_record($record_id)
	{
		$old_record = $this->get_entry_record($record_id);

		$result = $this->db->query("DELETE FROM " . $this->table_name . " WHERE adv_id = ?",
			[$record_id]
		);
		// print_r($this->db->last_query());exit;

		// if (!$result) {
		// 	return ['status' => 0];
		// }

		// if ($this->db->affected_rows() == 0) {
		// 	return ['status' => 0];
		// }

		if ($this->db->affected_rows() > 0) {

			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$logged_data = [];

			foreach ($old_record as $field => $value) {

				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;

				$logged_data[$label] =
					(isset($value_labels[$field]) && isset($value_labels[$field][$value]))
					? $value_labels[$field][$value]
					: $value;
			}

			// Write delete log
			log_admin_delete(
				'11',
				'Advertisements',
				$logged_data,
				'Admin - Deleted advertisement: ' . $old_record['adv_name']
			);
			return ['status' => 1];
		}

		// Default fail
		return ['status' => 0];
	}


	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return boolean
	 */
	public function insert_record($id)
	{
		if ($_FILES) {
			$config['upload_path'] = '../admin/assets/img/advertisements/';
			$config['allowed_types'] = '*';
			$config['max_size'] = '0';
			$config['remove_spaces'] = true;
			$config['overwrite'] = false;
			$config['max_width']  = '0';
			$config['max_height']  = '0';
			$this->load->library('upload', $config);
			$this->upload->initialize($config);

			if (strlen($_FILES['adv_location']['name'])) {
				if (!$this->upload->do_upload('adv_location')) {
					echo $this->upload->display_errors();
					exit();
				}
				$image = $this->upload->data();

				if ($image['file_name']) {
					$_POST['fv']['adv_location'] = "/admin/assets/img/advertisements/" . $image['file_name'];
				}
			}
		}
		$_POST['fv']['adv_status']	   = (isset($_POST['fv']['adv_status']) ? 1 : 0);
		$resultset = $this->db->insert($this->table_name, $_POST['fv']);

		// Log the add operation
		if ($resultset) {
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

			log_admin_add('11', 'Advertisements', $logged_data, 'Admin - Added new advertisement: ' . $_POST['fv']['adv_name']);
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
		if ($_FILES) {
			// $config['upload_path'] = '../admin/assets/img/advertisements/';
			// $config['upload_path'] = dirname(__DIR__) . '/admin/assets/img/advertisements/';
			// $config['upload_path'] = __DIR__ . '/assets/img/advertisements/';
			$config['upload_path'] = FCPATH . 'assets/img/advertisements/';

			// print_r($config['upload_path']);exit;

			$config['allowed_types'] = 'gif|jpg|png';
			$config['max_size'] = '10000';
			$config['remove_spaces'] = true;
			$config['overwrite'] = false;
			$config['max_width']  = '0';
			$config['max_height']  = '0';
			$this->load->library('upload', $config);

			if (strlen($_FILES['adv_location']['name'])) {
				if (!$this->upload->do_upload('adv_location')) {
					echo $this->upload->display_errors();
					exit();
				}
				$image = $this->upload->data();

				if ($image['file_name']) {
					$_POST['fv']['adv_location'] = "/admin/assets/img/advertisements/" . $image['file_name'];
				}
			}
		}

		$_POST['fv']['adv_id']	   = $id;
		// $_POST['fv']['adv_status']	   = (isset($_POST['fv']['adv_status']) ? 1 : 0);
		$_POST['fv']['adv_status'] = !empty($_POST['fv']['adv_status']) ? 1 : 0;

		$resultset = $this->db->update($this->table_name, $_POST['fv'], array('adv_id' => $id));

		// Create selective logging - only log changed values
		if ($resultset) {
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
				log_admin_edit('11', 'Advertisements', $old_values, $new_values, 'Admin - Updated advertisement: ' . $_POST['fv']['adv_name']);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
		}

		$query = $this->db->query("SELECT concat('localhost:90/sgb',adv_location) as location,adv_type from dt_advertisements where adv_status=1 order by adv_sequence");

		$DOMObject = new DOMDocument("1.0");
		header("Content-Type: text/plain");
		$root_element = $DOMObject->createElement("advertisements");
		$DOMObject->appendChild($root_element);

		foreach ($query->result() as $row) {
			if ($row->adv_type == 0) {
				$root_item1 = $DOMObject->createElement("adv1");
				$root_element->appendChild($root_item1);
				$domAttribute  = $DOMObject->createAttribute('url');

				// Value for the created attribute
				$domAttribute->value = $row->location;
				$root_item1->appendChild($domAttribute);

				$root_item_text1 = $DOMObject->createTextNode("");
				$root_item1->appendChild($root_item_text1);
			} else {
				$root_item1 = $DOMObject->createElement("adv2");
				$root_element->appendChild($root_item1);
				$domAttribute  = $DOMObject->createAttribute('url');

				// Value for the created attribute
				$domAttribute->value = $row->location;
				$root_item1->appendChild($domAttribute);

				$root_item_text1 = $DOMObject->createTextNode("");
				$root_item1->appendChild($root_item_text1);
			}
		}
		$DOMObject->save('../admin/assets/img/advertisements/advertisements1.xml');
		$DOMObject->saveXML();
		return $resultset ? 1 : 0;
	}
	public function inline_update($id)
	{
		// Get the old record data for logging
		$this->db->where('adv_id', $id);
		$old_query = $this->db->get($this->table_name);
		$old_data = $old_query->row_array();

		$fv['adv_name'] = $_POST['adv_name'];
		$fv['adv_type'] = $_POST['adv_type'];
		$fv['adv_status'] = $_POST['adv_status'];
		$fv['adv_sequence'] = $_POST['adv_sequence'];
		$resultset = $this->db->update($this->table_name, $fv, array('adv_id' => $id));

		if ($resultset) {
			// Get the new record data for logging
			$this->db->where('adv_id', $id);
			$new_query = $this->db->get($this->table_name);
			$new_data = $new_query->row_array();

			// Load helpers for field labels and logging
			$this->load->helper('field_labels');
			$this->load->helper('common');

			// Get field labels
			$field_labels = get_field_labels();

			// Prepare data for logging
			$old_values = array();
			$new_values = array();
			$changed_fields = array();

			// Check which fields were updated
			if (isset($_POST['adv_name']) && isset($old_data['adv_name']) && $_POST['adv_name'] != $old_data['adv_name']) {
				$old_values['adv_name'] = $old_data['adv_name'];
				$new_values['adv_name'] = $_POST['adv_name'];
				$field_label = isset($field_labels['adv_name']) ? $field_labels['adv_name'] : 'adv_name';
				$changed_fields[] = $field_label;
			}
			if (isset($_POST['adv_type']) && isset($old_data['adv_type']) && $_POST['adv_type'] != $old_data['adv_type']) {
				$old_values['adv_type'] = $old_data['adv_type'];
				$new_values['adv_type'] = $_POST['adv_type'];
				$field_label = isset($field_labels['adv_type']) ? $field_labels['adv_type'] : 'adv_type';
				$changed_fields[] = $field_label;
			}
			if (isset($_POST['adv_status']) && isset($old_data['adv_status']) && $_POST['adv_status'] != $old_data['adv_status']) {
				$old_values['adv_status'] = $old_data['adv_status'];
				$new_values['adv_status'] = $_POST['adv_status'];
				$field_label = isset($field_labels['adv_status']) ? $field_labels['adv_status'] : 'adv_status';
				$changed_fields[] = $field_label;
			}
			if (isset($_POST['adv_sequence']) && isset($old_data['adv_sequence']) && $_POST['adv_sequence'] != $old_data['adv_sequence']) {
				$old_values['adv_sequence'] = $old_data['adv_sequence'];
				$new_values['adv_sequence'] = $_POST['adv_sequence'];
				$field_label = isset($field_labels['adv_sequence']) ? $field_labels['adv_sequence'] : 'adv_sequence';
				$changed_fields[] = $field_label;
			}

			// Create a description for the log
			if (!empty($changed_fields)) {
				$description = implode(', ', $changed_fields) . " in Advertisements. Adv Id: " . $id;
			} else {
				$description = "advertisement record. Adv Id: " . $id;
			}

			// Log the edit operation using the AdminLog model if there are changes
			if (!empty($old_values) && !empty($new_values)) {
				log_admin_edit('11', 'Advertisements', $old_values, $new_values, $description);
			}

			return 1;
		}
		return 0;
	}
	// public function get_sequence_number($seq_no = "")
	// {
	// 		$resultset = $this->db->query("select * from dt_advertisements where adv_sequence ='".$seq_no."'");
	// 		if ($resultset->num_rows() > 0)	{
	// 			return 1;
	// 		}
	// 		else {
	// 			return 0; 
	// 		}
	// }
	public function get_sequence_number($seq_no = "", $adv_id = null)
	{
		$this->db->from("dt_advertisements");
		$this->db->where("adv_sequence", $seq_no);

		if (!empty($adv_id)) {
			$this->db->where("adv_id !=", $adv_id); // ignore current record
		}

		$resultset = $this->db->get();

		if ($resultset->num_rows() > 0) {
			return 1; // sequence exists in another record
		} else {
			return 0; // sequence is unique
		}
	}
}
