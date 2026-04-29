<?php
class Appvideo_model extends CI_Model {
		var $table_name = 'dt_appvideos';						//Initialize table Name
	
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
		$query = $this->db->query("SELECT appvideo_id,video_name,if(video_type =0 ,'In active','Active') as video_type,video_descriptions,video_id FROM dt_appvideos ORDER BY appvideo_id DESC");
		return $query;
		
    }
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['appvideo_id']			=	NULL;
		$_POST['fv']['video_name']			=	NULL;
		$_POST['fv']['video_descriptions']	=	NULL;
		$_POST['fv']['video_id']			=	NULL;
		$_POST['fv']['video_type'] 			= 	TRUE;	
		$_POST['fv']['db_error_msg']		=	"";
	}
	/*
	* Fetch record for entry when edit 
	*/
	
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['appvideo_id']   	= $record_id;
		$query ="SELECT appvideo_id,video_name,video_descriptions,video_type,video_id FROM dt_appvideos WHERE appvideo_id=?";
		$result_set =$this->db->query($query, array($record_id));					
		
		foreach($result_set->result() as $row)
		{
			$records['appvideo_id']   			= $row->appvideo_id;
			$records['video_name']   			= $row->video_name;
			$records['video_descriptions']   	= $row->video_descriptions;
			$records['video_id'] 				= $row->video_id;	
			$records['video_type'] 				=  ($row->video_type==1) ? TRUE : FALSE;	
			$records['db_error_msg']			= "";		
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
		$this->db->query("DELETE FROM ".$this->table_name." WHERE appvideo_id=?", array($record_id));
		
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
			
			log_admin_delete('13','App Videos', $logged_data, 'Admin - Deleted app video: ' . $old_record['video_name']);
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
		$_POST['fv']['video_type']	   = (isset($_POST['fv']['video_type']) ? 1 : 0);
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
			
			log_admin_add('13','App Videos', $logged_data, 'Admin - Added new app video: ' . $_POST['fv']['video_name']);
			return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }
	public function update_record($id)
	{
		// Get the record before updating for logging purposes
		$old_record = $this->get_entry_record($id);
		
		$_POST['fv']['appvideo_id']	   = $id;
		//$_POST['fv']['gal_status']	   = (isset($_POST['fv']['gal_status']) ? 1 : 0);
		$this->db->update($this->table_name, $_POST['fv'], array('appvideo_id' => $id));
		
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
				log_admin_edit('13','App Videos', $old_values, $new_values, 'Admin - Updated app video: ' . $_POST['fv']['video_name']);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
		}
    }	
	public function inline_update($id)
	{
		// Get the old record data for logging
		$this->db->where('appvideo_id', $id);
		$old_query = $this->db->get($this->table_name);
		$old_data = $old_query->row_array();
		
		$fv['video_name'] = $_POST['video_name'];
	   // $fv['video_descriptions'] = $_POST['video_descriptions'];
		$resultset = $this->db->update($this->table_name, $fv, array('appvideo_id' => $id));
		
		if ($resultset) {
			// Get the new record data for logging
			$this->db->where('appvideo_id', $id);
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
			if (isset($_POST['video_name']) && isset($old_data['video_name']) && $_POST['video_name'] != $old_data['video_name']) {
				$old_values['video_name'] = $old_data['video_name'];
				$new_values['video_name'] = $_POST['video_name'];
				$field_label = isset($field_labels['video_name']) ? $field_labels['video_name'] : 'video_name';
				$changed_fields[] = $field_label;
			}
			
			// Create a description for the log
			if (!empty($changed_fields)) {
				$description = implode(', ', $changed_fields) . " in App Videos. Video Id: " . $id;
			} else {
				$description = "App video record. Video Id: " . $id;
			}
			
			// Log the edit operation using the AdminLog model if there are changes
			if (!empty($old_values) && !empty($new_values)) {
				log_admin_edit('App Videos', 'App Videos', $old_values, $new_values, $description);
			}
		}
	}
	public function getvideos() 										//Fetch entry record
	{	
		$video_name = "";
		$query ="SELECT * FROM dt_appvideos WHERE event_status = '1' ORDER BY appvideo_id DESC LIMIT 1";
		$result_set =$this->db->query($query);					
		
		foreach ($result_set->result() as $row)
		{
			$video_name   			= $row->video_name;
		}		
		return $video_name;
	}
}
?>