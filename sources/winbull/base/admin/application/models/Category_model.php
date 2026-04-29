<?php
class Category_model extends CI_Model {
		var $table_name = 'dt_category'; //Initialize table Name
	
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
		$query = $this->db->query("SELECT cat_id,cat_name,CASE cat_status WHEN 1 THEN 'Active' WHEN 0 THEN 'Disabled' END AS cat_status FROM ".$this->table_name." ORDER BY cat_id DESC");
		return $query;
    }
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['cat_id']				=	NULL;
		$_POST['fv']['cat_name']			=	NULL;
		$_POST['fv']['cat_desc']			=	NULL;
		$_POST['fv']['cat_image']			=	NULL;
		$_POST['fv']['cat_avail_product']   =   TRUE;
		$_POST['fv']['cat_status']			=	TRUE;
		$_POST['fv']['db_error_msg']		=	"";
	}
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['com_id']   	= $record_id;
		//Build contents query
		$query="SELECT cat_id, cat_name,cat_image, cat_desc, cat_avail_product, cat_status FROM ".$this->table_name." WHERE cat_id=?";
		$result_set = $this->db->query($query, array($record_id));					
		
		foreach ($result_set->result() as $row)
		{
			$records['cat_id']   			= $row->cat_id;
			$records['cat_name']   			= $row->cat_name;
			$records['cat_desc']   			= $row->cat_desc;
			$records['cat_image']   		= $row->cat_image;
			$records['cat_avail_product']	= ($row->cat_avail_product == 1) ? TRUE : FALSE;
			$records['cat_status'] 			= ($row->cat_status==1) ? TRUE : FALSE;
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
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE cat_id=?", array($record_id));		
		
		// Log the delete operation
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
					$logged_data[$label] = $value;
				}
			}
			
			log_admin_delete('17','Category', $logged_data, 'Admin - Deleted category: ' . $old_record['cat_name']);
		}
		
		return TRUE;
	}
	/*
	* To delete sub record 
	* @return
	*/
	public function delete_sub_record($table_name,$col_name,$record_id)
	{
		$delete_record = $this->db->query("DELETE FROM ".$table_name." WHERE ".$col_name."=?", array($record_id));		
		return TRUE;
	}
	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
    public function insert_record($id)
	{
		
			$_POST['fv']['cat_image']	   = $_FILES['cat_image']['name'];
			$resultset = $this->db->insert($this->table_name, $_POST['fv']);	
			
			
			
			$file = $_FILES['cat_image'];
			$name1 = $file['name'];
			$tmppath = $file['tmp_name'];
			if($name1!=""){
				move_uploaded_file($tmppath, '../admin/assets/images/category/'.$name1);
			}
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
			
			log_admin_add('17','Category', $logged_data, 'Admin - Added new category: ' . $_POST['fv']['cat_name']);
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
			$_POST['fv']['cat_id']	   = $id;
			$_POST['fv']['cat_image']	   = strlen($_FILES['cat_image']['name'])>0 ? $_FILES['cat_image']['name'] : $_POST['cat_image'];
			$this->db->update($this->table_name, $_POST['fv'], array('cat_id' => $id));
			
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
					log_admin_edit('17','Category', $old_values, $new_values, 'Admin - Updated category: ' . $_POST['fv']['cat_name']);
					return array('status' => 1);
				} else {
					return array('status' => 0);
				}
			}
			
			if(strlen($_FILES['cat_image']['name'])>0)	
			{
				$file = $_FILES['cat_image'];
				$name1 = $file['name'];
				$tmppath = $file['tmp_name'];
				if($name1!="")
					move_uploaded_file($tmppath, '../admin/assets/images/category/'.$name1);
			}
    }
	public function inline_update()
	{
		// Get the old record data for logging
		$this->db->where('cat_id', $_POST['pk']);
		$old_query = $this->db->get($this->table_name);
		$old_data = $old_query->row_array();
		
		$data = array(
               $_POST['name'] => $_POST['value']
            );

		$this->db->where('cat_id', $_POST['pk']);
		if($this->db->update($this->table_name, $data)) {
			// Get the new record data for logging
			$this->db->where('cat_id', $_POST['pk']);
			$new_query = $this->db->get($this->table_name);
			$new_data = $new_query->row_array();
			
			// Load helpers for field labels and logging
			$this->load->helper('field_labels');
			$this->load->helper('common');
			
			// Get field labels
			$field_labels = get_field_labels();
			$field_label = isset($field_labels[$_POST['name']]) ? $field_labels[$_POST['name']] : $_POST['name'];
			
			// Create a description for the log
			$description = $field_label . " in Category. Cat Id: " . $_POST['pk'];
			
			// Prepare data for logging
			$old_values = array($_POST['name'] => isset($old_data[$_POST['name']]) ? $old_data[$_POST['name']] : null);
			$new_values = array($_POST['name'] => $_POST['value']);
			
			// Log the edit operation using the AdminLog model
			log_admin_edit('17', 'Category', $old_values, $new_values, $description);
			
			echo true;
		}
		else {
			$error = $this->db->error();
			echo isset($error['message']) ? $error['message'] : 'Database error';
		}
	}
}
?>