<?php
class Gallery_model extends CI_Model
{
	var $table_name = 'dt_gallery';						//Initialize table Name
	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}
	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->query("SELECT gal_id,gal_name,if(gal_status =0 ,'In active','Active') as gal_status FROM dt_gallery ORDER BY gal_id DESC");
		return $query;
	}
	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['gal_id']				=	NULL;
		$_POST['fv']['gal_name']			=	NULL;
		$_POST['fv']['gal_type']			=	NULL;
		$_POST['fv']['gal_location']		=	NULL;
		$_POST['fv']['gal_status']			=	TRUE;
		$_POST['fv']['gal_img']				= 	NULL;
		$_POST['fv']['db_error_msg']		=	"";
	}

	/*
	* Fetch record for entry when edit 
	*/
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records['gal_id']   	= $record_id;
		$query = "SELECT gal_id, gal_name,gal_type, gal_location,gal_status FROM dt_gallery WHERE gal_id=" . $record_id;
		$result_set = $this->db->query($query);

		$baseurl	=	$this->config->item('base_url');
		$search	=	"admin/";
		$replace	=	"";

		$pos = strrpos($baseurl, $search);

		if ($pos !== false) {
			$baseurl = substr_replace($baseurl, $replace, $pos, strlen($search));
		}
		$baseurl = rtrim($baseurl, '/');
		foreach ($result_set->result() as $row) {
			$records['gal_id']   			= $row->gal_id;
			$records['gal_name']   			= $row->gal_name;
			$records['gal_type']   			= $row->gal_type;
			$records['gal_img'] 			= $baseurl . '/' . ltrim($row->gal_location, '/');
			$records['gal_status'] 			= ($row->gal_status == 1) ? TRUE : FALSE;
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

		//$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE adv_id=".$record_id);		
		//$status = $this->db->update($this->table_name, array('gal_status'=> '0'), array('gal_id' => $record_id));
		$this->db->query("DELETE FROM " . $this->table_name . " WHERE gal_id=" . $record_id);

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
			log_admin_delete('26', 'Gallery', $logged_data, 'Admin - Deleted gallery item: ' . $old_record['gal_name']);
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

		if ($_FILES) {
			$config['upload_path'] = '../admin/assets/img/gallery/';

			$config['allowed_types'] = '*';
			$config['max_size'] = '10000';
			$config['remove_spaces'] = true;
			$config['overwrite'] = false;
			$config['max_width']  = '0';
			$config['max_height']  = '0';
			$this->load->library('upload', $config);
			$this->upload->initialize($config);

			if (strlen($_FILES['gal_location']['name'])) {
				if (!$this->upload->do_upload('gal_location')) {
					echo $this->upload->display_errors();
					exit();
				}
				$image = $this->upload->data();

				if ($image['file_name']) {
					$_POST['fv']['gal_location'] = "/admin/assets/img/gallery/" . $image['file_name'];
				}
			}
		}
		$_POST['fv']['gal_status']	   = (isset($_POST['fv']['gal_status']) ? 1 : 0);

		// Clean non-DB keys before insert
		$fv = $_POST['fv'];
		unset($fv['type']);
		unset($fv['userrights']);
		unset($fv['gal_img']);
		unset($fv['db_error_msg']);
		unset($fv['code']);

		$resultset = $this->db->insert($this->table_name, $fv);

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
			log_admin_add('26', 'Gallery', $logged_data, 'Admin - Added new gallery item: ' . $_POST['fv']['gal_name']);
			return array('status' => 1);
		} else {
			return array('status' => 0);
		}
	}


	public function update_record($id)
	{
		// Get the record before updating for logging purposes
		$old_record = $this->get_entry_record($id);

		// Check if files were submitted
		if (!empty($_FILES['gal_location']['name'])) {

			// Upload configuration
			$config['upload_path']      = '../admin/assets/img/gallery/';
			$config['allowed_types']    = 'gif|jpg|png';
			$config['max_size']         = 10000; // in KB
			$config['remove_spaces']    = true;
			$config['overwrite']        = false;
			$config['max_width']        = 0; // No limit
			$config['max_height']       = 0; // No limit

			$this->load->library('upload', $config);

			// Attempt file upload
			if (!$this->upload->do_upload('gal_location')) {
				echo $this->upload->display_errors(); // You may want to handle this more gracefully
				exit();
			}

			$image = $this->upload->data();

			if (!empty($image['file_name'])) {
				$_POST['fv']['gal_location'] = "/admin/assets/img/gallery/" . $image['file_name'];
			}
		}

		// Add ID to POST data
		$_POST['fv']['gal_id'] = $id;

		// Clean non-DB keys before update
		$fv = $_POST['fv'];
		unset($fv['type']);
		unset($fv['userrights']);
		unset($fv['gal_img']);
		unset($fv['db_error_msg']);
		unset($fv['code']);

		// Update record
		$resultset = $this->db->update($this->table_name, $fv, array('gal_id' => $id));

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
				log_admin_edit('26', 'Gallery', $old_values, $new_values, 'Admin - Updated gallery item: ' . $_POST['fv']['gal_name']);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
		}
	}

	public function inline_update($id)
	{
		// Get the old record data for logging
		$this->db->where('gal_id', $id);
		$old_query = $this->db->get($this->table_name);
		$old_data = $old_query->row_array();

		$fv['gal_name'] = $_POST['gal_name'];
		$fv['gal_status'] = $_POST['gal_status'];
		$resultset = $this->db->update($this->table_name, $fv, array('gal_id' => $id));

		if ($resultset) {
			// Get the new record data for logging
			$this->db->where('gal_id', $id);
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
			if (isset($_POST['gal_name']) && isset($old_data['gal_name']) && $_POST['gal_name'] != $old_data['gal_name']) {
				$old_values['gal_name'] = $old_data['gal_name'];
				$new_values['gal_name'] = $_POST['gal_name'];
				$field_label = isset($field_labels['gal_name']) ? $field_labels['gal_name'] : 'gal_name';
				$changed_fields[] = $field_label;
			}
			if (isset($_POST['gal_status']) && isset($old_data['gal_status']) && $_POST['gal_status'] != $old_data['gal_status']) {
				$old_values['gal_status'] = $old_data['gal_status'];
				$new_values['gal_status'] = $_POST['gal_status'];
				$field_label = isset($field_labels['gal_status']) ? $field_labels['gal_status'] : 'gal_status';
				$changed_fields[] = $field_label;
			}

			// Create a description for the log
			if (!empty($changed_fields)) {
				$description = implode(', ', $changed_fields) . " in Gallery. Gallery Id: " . $id;
			} else {
				$description = "Gallery record. Gallery Id: " . $id;
			}

			// Log the edit operation using the AdminLog model if there are changes
			if (!empty($old_values) && !empty($new_values)) {
				log_admin_edit('Gallery', 'Gallery', $old_values, $new_values, $description);
			}

			return 1;
		}
		return 0;
	}
	public function check_duplicate_name($gal_name, $gal_id = 0) {
		$this->db->where('gal_name', $gal_name);
		if($gal_id > 0) {
			$this->db->where('gal_id !=', $gal_id);
		}
		$query = $this->db->get($this->table_name);
		return $query->num_rows() > 0;
	}

	public function getgallery() 										//Fetch entry record
	{
		$gal_name = "";
		$query = "SELECT * FROM dt_gallery WHERE gal_status = '1' ORDER BY gal_id DESC LIMIT 1";
		$result_set = $this->db->query($query);

		foreach ($result_set->result() as $row) {
			$gal_name   			= $row->gal_name;
		}
		return $gal_name;
	}
}
