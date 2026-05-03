<?php
class ratehistory_model extends Model {
		var $table_name = 'dt_rate_history';						//Initialize table Name
		public function __construct()
			{
				parent::__construct();	
				$this->load->helper('common');
			}	
			function index()
			{
				
			}
	
	
	function ratehistory_model() {
		parent::Model();
	}
	
	
	public function get_data($params = "" , $page = "all")
    {		    
		
	   	$query = $this->db->query("SELECT rate_id,DATE_FORMAT(rate_date,'%d-%m-%Y') AS rate_date,rate_time,gold_rate,silver_rate,gold_rate1 FROM dt_rate_history ORDER BY rate_id DESC");
		return $query;
		
    }
//	
//	public function load_correction_type($record_id)
//	{		
//		//$record_id==NULL ? -1 : $record_id;
//		$strData="";		
//		$strData="<option value='-1' ";
//		$strData.=$record_id==-1 ? "selected='selected'" : "" ;
//		$strData.=">- SELECT -</option>";		
//		$resultset=$this->db->query("SELECT distinct(corr_type) AS corr_type FROM dt_cur_correction");
//		foreach ($resultset->result() as $row)
//		{
//		   $strData.= "<option value='".$row->corr_type."' ";
//		   $strData.=($record_id==$row->corr_type) ? "selected='selected'" : "" ;
//		   $strData.=">".$row->corr_type."</option>";
//		}
//		$resultset->free_result(); 
//		return $strData;				
//	}
//	
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
		$_POST['fv']['rate_id']				=	NULL;
		$_POST['fv']['rate_date']			=	NULL;
		$_POST['fv']['rate_time']			=	NULL;
		$_POST['fv']['gold_rate']			=	NULL;
		$_POST['fv']['gold_rate1']			=	NULL;
		$_POST['fv']['silver_rate']     	=	NULL;
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['rate_id']   	= $record_id;
		$query="SELECT rate_id, rate_date, rate_time, gold_rate, silver_rate, gold_rate1 FROM dt_rate_history WHERE rate_id=?";
		$result_set=$this->db->query($query, array($record_id));			
		foreach ($result_set->result() as $row)
		{
			$records['rate_id']   			= $row->rate_id;
			$records['rate_date']   		= date('Y-m-d',strtotime($row->rate_date));
			$records['rate_time']   		= date('h:i:s',strtotime($row->rate_time));
			$records['gold_rate']   		= $row->gold_rate;
			$records['silver_rate']		  	= $row->silver_rate;
			$records['gold_rate1']		  	= $row->gold_rate1;
			$records['db_error_msg']		= "";
		}		
		return $records;
	}
	public function delete_record($record_id) 
	{
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE rate_id=?", array($record_id));
		
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
			log_admin_delete('35','Rate History', $logged_data, 'Admin - Deleted rate history ID: ' . $record_id);
		}
		
		return TRUE;
	}
    public function insert_record($id)
	{
			//print_r($_POST);
		//	$_POST['fv']['com_active']	   = (isset($_POST['fv']['com_active']) ? 1 : 0);
		//	if(strlen($_POST['fv']['com_other_charges']==0))
		//	$_POST['fv']['com_other_charges']=0;
		
			$_POST['fv']['rate_date']	  	 =	date('Y-m-d',strtotime($_POST['fv']['rate_date']));
			$_POST['fv']['rate_time']		 =  date('h:i:s a',strtotime($_POST['fv']['rate_time']));
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
				log_admin_add('35','Rate History', $logged_data, 'Admin - Added new rate history ID: ' . $this->db->insert_id());
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
			$_POST['fv']['rate_id']	   = $id;
		//	$_POST['fv']['com_active']	   = (isset($_POST['fv']['com_active']) ? 1 : 0);
		$_POST['fv']['rate_date']	  	 =	date('Y-m-d',strtotime($_POST['fv']['rate_date']));
		$_POST['fv']['rate_time']		 =  date('h:i:s a',strtotime($_POST['fv']['rate_time']));
			$this->db->update($this->table_name, $_POST['fv'], array('rate_id' => $id));
			
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
					log_admin_edit('35','Rate History', $old_values, $new_values, 'Admin - Updated rate history ID: ' . $id);
					return array('status' => 1);
				} else {
					return array('status' => 0);
				}
			}
    }	
}
?>