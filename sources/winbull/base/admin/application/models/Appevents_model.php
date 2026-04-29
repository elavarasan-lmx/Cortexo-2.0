<?php
class Appevents_model extends CI_Model {
		var $table_name = 'dt_appevents';						//Initialize table Name
	
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
		$query = $this->db->query("SELECT appeven_id,event_name,if(event_status =0 ,'In active','Active') as event_status,event_description,event_date,event_time FROM dt_appevents ORDER BY appeven_id DESC");
		return $query;
		
    }
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['appeven_id']			=	NULL;
		$_POST['fv']['event_name']			=	NULL;
		$_POST['fv']['event_description']	=	NULL;
		$_POST['fv']['event_status']		=	TRUE;
		$_POST['fv']['event_date']			= date("Y-m-d"); 
		$_POST['fv']['event_time'] 			= date("H:i:s");
		$_POST['fv']['db_error_msg']		=	"";
	}
	/*
	* Fetch record for entry when edit 
	*/
	
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['appeven_id']   	= $record_id;
		$query ="SELECT appeven_id,event_name,event_status,event_description,event_date,event_time FROM dt_appevents WHERE appeven_id=?";
		$result_set =$this->db->query($query, array($record_id));					
		
		foreach($result_set->result() as $row)
		{
			$records['appeven_id']   			= $row->appeven_id;
			$records['event_name']   			= $row->event_name;
			$records['event_description']   	= $row->event_description;
			$records['event_time']   			= $row->event_time;
			$records['event_date']   			= $row->event_date;
			$records['event_status'] 			= ($row->event_status==1) ? TRUE : FALSE;	
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
		$this->db->query("DELETE FROM ".$this->table_name." WHERE appeven_id=?", array($record_id));
		
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
			
			log_admin_delete('12','App Events', $logged_data, 'Admin - Deleted app event: ' . $old_record['event_name']);
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
		$_POST['fv']['event_date']	   = date('m/d/Y h:i:s day');
		$_POST['fv']['event_time']	   = date('HH:MI:SS ');
		$_POST['fv']['event_status']	   = (isset($_POST['fv']['event_status']) ? 1 : 0);
	
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
			
			log_admin_add('12','App Events', $logged_data, 'Admin - Added new app event: ' . $_POST['fv']['event_name']);
			return array('status' => 1);
		} else {
			return array('status' => 0);
		}
    }
	public function update_record($id)
	{
		// Get the record before updating for logging purposes
		$old_record = $this->get_entry_record($id);
		
		/* $date = date('m/d/Y M');
		$timee = date('h:i:s D'); */
		$_POST['fv']['event_date']	   = date('m/d/Y M');
		$_POST['fv']['event_time']	   = date('D h:i:s a');
		$_POST['fv']['appeven_id']	   = $id;
		
		//print_r($_POST['fv']);exit;
		//$_POST['fv']['gal_status']	   = (isset($_POST['fv']['gal_status']) ? 1 : 0);
		$this->db->update($this->table_name, $_POST['fv'], array('appeven_id' => $id));
		
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
				log_admin_edit('12','App Events', $old_values, $new_values, 'Admin - Updated app event: ' . $_POST['fv']['event_name']);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
		}
    }	
	public function inline_update($id)
	{
		// Get the old record data for logging
		$this->db->where('appeven_id', $id);
		$old_query = $this->db->get($this->table_name);
		$old_data = $old_query->row_array();
		
		$fv['event_name'] = $_POST['event_name'];
	    $fv['event_status'] = $_POST['event_status'];
		$resultset = $this->db->update($this->table_name, $fv, array('appeven_id' => $id));
		
		if ($resultset) {
			// Get the new record data for logging
			$this->db->where('appeven_id', $id);
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
			if (isset($_POST['event_name']) && isset($old_data['event_name']) && $_POST['event_name'] != $old_data['event_name']) {
				$old_values['event_name'] = $old_data['event_name'];
				$new_values['event_name'] = $_POST['event_name'];
				$field_label = isset($field_labels['event_name']) ? $field_labels['event_name'] : 'event_name';
				$changed_fields[] = $field_label;
			}
			if (isset($_POST['event_status']) && isset($old_data['event_status']) && $_POST['event_status'] != $old_data['event_status']) {
				$old_values['event_status'] = $old_data['event_status'];
				$new_values['event_status'] = $_POST['event_status'];
				$field_label = isset($field_labels['event_status']) ? $field_labels['event_status'] : 'event_status';
				$changed_fields[] = $field_label;
			}
			
			// Create a description for the log
			if (!empty($changed_fields)) {
				$description = implode(', ', $changed_fields) . " in App Events. Event Id: " . $id;
			} else {
				$description = "App event record. Event Id: " . $id;
			}
			
			// Log the edit operation using the AdminLog model if there are changes
			if (!empty($old_values) && !empty($new_values)) {
				log_admin_edit('App Events', 'App Events', $old_values, $new_values, $description);
			}
		}
	}
	public function getevents() 										//Fetch entry record
	{	
		$event_name = "";
		$query ="SELECT * FROM dt_appevents WHERE event_status = '1' ORDER BY appeven_id DESC LIMIT 1";
		$result_set =$this->db->query($query);					
		
		foreach ($result_set->result() as $row)
		{
			$event_name   			= $row->event_name;
		}		
		return $event_name;
	}
}
?>