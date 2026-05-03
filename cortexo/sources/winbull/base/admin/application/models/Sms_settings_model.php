<?php
class Sms_settings_model extends CI_Model {
		var $table_name = 'dt_sms_settings';						//Initialize table Name
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
		$query = $this->db->query("SELECT serv.serv_id,serv.serv_name,sms_content,sms_footer,sms_dlt_te_id FROM dt_serv_master AS serv
LEFT JOIN dt_sms_settings AS sms ON sms.service_id=serv.serv_id");
		return $query;
	}
	
	
	/*public function set_data()
	{
		$data['url']				=	$this->config->item('base_url')."index.php/C_main/grid_dataload/Bank_model";
		$data['model_name']			=	"Bank_model";
		$data['sortname']			=	"bnk_code";	
		$data['sortorder']			=	"desc";
		$data['id']					=	"bnk_code";
		$data['manipulate_once']	=	"No";
		$data['colNames']			=	"'Code','Bank Name','Branch','Acc No','Active','Actions'";
		$data['colModel']=array("{name:'bnk_code', index:'bnk_code', width:120, align:'center'},",
								"{name:'bnk_name', index:'bnk_name', width:200},",
								"{name:'bnk_branch', index:'bnk_branch', width:350},",
								"{name:'bnk_accno', index:'bnk_accno', width:150},",
								"{name:'bnk_status', index:'bnk_status', search:false, formatter:'checkbox', align:'center', width:40},",
								"{name:'Actions', index:'Actions', width:40, sortable:false, search:false, align:'center'}");
		
		return $data;
	}		*/	
	
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['news_id']				=	NULL;
		$_POST['fv']['news']			=	NULL;
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 						//Fetch entry record
	{	
		//Build contents query
		$query="select serv_id, serv_name, sms_content, sms_footer,sms_dlt_te_id 
				from dt_serv_master 
				left join dt_sms_settings on service_id = serv_id 
				where serv_id =".$record_id;
		$result_set=$this->db->query($query);			
		foreach ($result_set->result() as $row)
		{
			
			$records['service_id'] 	= $row->serv_id;
			$records['serv_name'] 	= $row->serv_name;			
			$records['sms_content']	= $row->sms_content;
			$records['sms_footer']	= $row->sms_footer;
			$records['sms_dlt_te_id']	= $row->sms_dlt_te_id;
		}		
		return $records;

	}
	
	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
    public function insert_record($id)
	{
			//print_r($_POST);
			$this->db->insert($this->table_name, $_POST['fv']);
			
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
				log_admin_add('40','SMS Settings', $logged_data, 'Admin - Added new SMS settings for service ID: ' . $_POST['fv']['service_id']);
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
			$_POST['fv']['service_id']	   = $id;
			$this->db->update($this->table_name, $_POST['fv'], array('service_id' => $id));
			
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
					log_admin_edit('40','SMS Settings', $old_values, $new_values, 'Admin - Updated SMS settings for service ID: ' . $id);
					return array('status' => 1);
				} else {
					return array('status' => 0);
				}
			}
    }
}
?>