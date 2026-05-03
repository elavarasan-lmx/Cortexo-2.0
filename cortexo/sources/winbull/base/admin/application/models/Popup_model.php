<?php
class Popup_model extends CI_Model
{
	var $table_name = 'dt_popup';						//Initialize table Name

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}
	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->query('SELECT 
										pop_id, pop_name, pop_active
									FROM 
										dt_popup 
									ORDER BY 
											pop_id 
									DESC');

		return $query;
	}

	public function set_data()
	{
		$data['url']				=	$this->config->item('base_url') . "index.php/C_main/grid_dataload/Bank_model";
		$data['model_name']			=	"popup_model";
		$data['sortname']			=	"pop_id";
		$data['sortorder']			=	"desc";
		$data['id']					=	"pop_id";
		$data['manipulate_once']	=	"No";
		$data['colNames']			=	"'Code','Bank Name','Branch','Acc No','Active','Actions'";
		$data['colModel'] = array(
			"{name:'bnk_code', index:'bnk_code', width:120, align:'center'},",
			"{name:'bnk_name', index:'bnk_name', width:200},",
			"{name:'bnk_branch', index:'bnk_branch', width:350},",
			"{name:'bnk_accno', index:'bnk_accno', width:150},",
			"{name:'bnk_status', index:'bnk_status', search:false, formatter:'checkbox', align:'center', width:40},",
			"{name:'Actions', index:'Actions', width:40, sortable:false, search:false, align:'center'}"
		);

		return $data;
	}

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['pop_id']		= 	NULL;
		$_POST['fv']['pop_name']	=	NULL;
		$_POST['fv']['pop_image']	=	NULL;
		$_POST['fv']['pop_active']	=	TRUE;
		$_POST['fv']['db_error_msg'] =	"";
	}

	/*
	* Fetch record for entry when edit 
	*/
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records = array();
		$records['pop_id']   	= $record_id;
		//Build contents query
		$query = $this->db->query("SELECT pop_id,pop_name,pop_image, pop_active from  dt_popup where pop_id = '" . $record_id . "'");
		foreach ($query->result() as $row) {
			$records['pop_id']   	= $row->pop_id;
			$records['pop_name']   	= $row->pop_name;
			$records['pop_image']   = $row->pop_image;
			$records['pop_active'] 	= ($row->pop_active == 1) ? TRUE : FALSE;
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

		$delete_record = $this->db->query("DELETE FROM " . $this->table_name . " WHERE pop_id='" . $record_id . "'");

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
			log_admin_delete('33', 'Popup', $logged_data, 'Admin - Deleted popup: ' . $old_record['pop_name']);
		}

		return TRUE;
	}

	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return boolean
	 */
	public function insert_record()
	{
		$_POST['fv']['pop_image'] = $_FILES['pop_image']['name'];
		$this->db->insert($this->table_name, $_POST['fv']);
		
		if(!empty($_FILES['pop_image']['name'])) {
			move_uploaded_file($_FILES['pop_image']['tmp_name'], '../admin/assets/img/popup/' . $_FILES['pop_image']['name']);
		}
		
		if ($this->db->affected_rows() > 0) {
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();
			$logged_data = array();
			foreach ($_POST['fv'] as $field => $value) {
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
					$logged_data[$label] = $value_labels[$field][$value];
				} else {
					$logged_data[$label] = $value;
				}
			}
			log_admin_add('33', 'Popup', $logged_data, 'Admin - Added popup: ' . $_POST['fv']['pop_name']);
		}
		
		$this->db->update("dt_generalsettings", array('lastupdate' => time()));
		return array('status' => 1);
	}

	public function update_record($id)
	{
		$old_record = $this->get_entry_record($id);

		if(!empty($_FILES['pop_image']['name'])) {
			$allowed_image_extension = array("png", "jpg", "jpeg");
			$file_extension = pathinfo($_FILES['pop_image']['name'], PATHINFO_EXTENSION);
			if (! in_array($file_extension, $allowed_image_extension)) {

				return array('status' => 0, 'message' => 'Only PNG and JPEG images are allowed');
			}
			$_POST['fv']['pop_image'] = $_FILES['pop_image']['name'];
			move_uploaded_file($_FILES['pop_image']['tmp_name'], '../admin/assets/img/popup/' . $_FILES['pop_image']['name']);
		} else {
			unset($_POST['fv']['pop_image']);
		}

		$this->db->update($this->table_name, $_POST['fv'], array('pop_id' => $id));
		
		if ($this->db->affected_rows() > 0) {
			$changed_fields = $this->get_changed_fields($old_record, $_POST['fv']);
			if (!empty($changed_fields)) {
				log_admin_edit('33', 'Popup', $changed_fields, 'Admin - Updated popup: ' . $_POST['fv']['pop_name']);
			}
		}
		
		$this->db->update("dt_generalsettings", array('lastupdate' => time()));
		return array('status' => 1);
	}

	private function get_changed_fields($old_data, $new_data)
	{
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		$changes = array();
		foreach ($new_data as $field => $new_value) {
			if (isset($old_data[$field]) && $old_data[$field] != $new_value) {
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				$old_val = isset($value_labels[$field]) && isset($value_labels[$field][$old_data[$field]]) ? $value_labels[$field][$old_data[$field]] : $old_data[$field];
				$new_val = isset($value_labels[$field]) && isset($value_labels[$field][$new_value]) ? $value_labels[$field][$new_value] : $new_value;
				$changes[$label] = array('old' => $old_val, 'new' => $new_val);
			}
		}
		return $changes;
	}

	public function check_duplicate_name($pop_name, $pop_id = null)
	{
		$this->db->where('pop_name', $pop_name);
		if ($pop_id) {
			$this->db->where('pop_id !=', $pop_id);
		}
		$query = $this->db->get($this->table_name);
		return $query->num_rows() > 0;
	}

	public function check_active_popup($pop_id = null)
	{
		$this->db->where('pop_active', 1);
		if ($pop_id) {
			$this->db->where('pop_id !=', $pop_id);
		}
		$query = $this->db->get($this->table_name);
		return $query->num_rows() > 0;
	}
}
