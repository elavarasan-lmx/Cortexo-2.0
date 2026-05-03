<?php
class Area_model extends CI_Model {
		var $table_name = 'dt_area';						//Initialize table Name

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
	   	$query = $this->db->query('SELECT 
										ar_sno, ar_name, ar_active
									FROM 
										dt_area 
									ORDER BY 
										ar_sno 
									DESC');
		return $query;
    }
	
	public function set_data()
	{
		$data['url']				=	$this->config->item('base_url')."index.php/C_area/grid_dataload/Area_model";
		$data['model_name']			=	"Area_model";
		$data['sortname']			=	"ar_sno";	
		$data['sortorder']			=	"desc";
		$data['id']					=	"ar_sno";
		$data['manipulate_once']	=	"No";
		$data['colNames']			=	"'Code','Area Name','Active','Actions'";
		$data['colModel']=array("{name:'ar_sno', index:'ar_sno', width:120, align:'center'},",
								"{name:'ar_name', index:'ar_name', width:200},",
								"{name:'bnk_status', index:'bnk_status', search:false, formatter:'checkbox', align:'center', width:40},",
								"{name:'Actions', index:'Actions', width:40, sortable:false, search:false, align:'center'}");
		
		return $data;
	}			
	
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['ar_sno']		=	NULL;
		$_POST['fv']['ar_name']	=	NULL;
		$_POST['fv']['ar_active']	=	TRUE;
		$_POST['fv']['db_error_msg']=	"";				
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['ar_sno']   	= $record_id;
		//Build contents query
		$this->db->select("ar_sno,ar_name, ar_active")->from($this->table_name)->where('ar_sno', $record_id);
		$query = $this->db->get();				
		foreach ($query->result() as $row)
		{
			$records['ar_sno']   	= $row->ar_sno;
			$records['ar_name']   	= $row->ar_name;
			$records['ar_active'] 	= ($row->ar_active==1) ? TRUE : FALSE;	
			$records['db_error_msg']= "";				
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
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE ar_sno=?", array($record_id));		
		
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
			
			log_admin_delete('14','Area', $logged_data, 'Admin - Deleted area: ' . $old_record['ar_name']);
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
			//print_r($_POST);
			$updatetime	=	time();
			$_POST['fv']['ar_active']	   = (isset($_POST['fv']['ar_active']) ? 1 : 0);
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
				
				log_admin_add('14','Area', $logged_data, 'Admin - Added new area: ' . $_POST['fv']['ar_name']);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
			
           $this->db->query("update dt_com_group_master set updatetime =".$updatetime);				
    }

	public function update_record($id)
	{
			// Get the record before updating for logging purposes
			$old_record = $this->get_entry_record($id);
			
			//Update Data
			$updatetime	=	time();
			$_POST['fv']['ar_sno']	   = $id;
			$_POST['fv']['ar_active']	   = (isset($_POST['fv']['ar_active']) ? 1 : 0);
			$this->db->update($this->table_name, $_POST['fv'], array('ar_sno' => $id));
			
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
					log_admin_edit('14','Area', $old_values, $new_values, 'Admin - Updated area: ' . $_POST['fv']['ar_name']);
					return array('status' => 1);
				} else {
					return array('status' => 0);
				}
			}
			
			$this->db->query("update dt_com_group_master set updatetime =".$updatetime);
    }
		
}
?>