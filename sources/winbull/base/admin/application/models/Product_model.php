<?php
class Product_model extends CI_Model {
		var $table_name = 'dt_product';						//Initialize table Name

	
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
		$query = $this->db->query("SELECT pro_id, pro_name, cat_name, ctp_name, 
								  if(pro_status=1,'Active','Disabled')AS pro_status,pro_category, pro_comtype 
								  FROM ".$this->table_name." 
								  LEFT JOIN dt_category ON cat_id = pro_category 
								  LEFT JOIN dt_commoditytype ON ctp_id = pro_comtype 
								  ORDER BY pro_id DESC");
		return $query;
    }
	
	public function empty_record() 										//Fetch listing record
	{		
		$_POST['fv']['pro_id']				=	NULL;
		$_POST['fv']['pro_name']			= 	NULL;
		$_POST['fv']['pro_desc']			= 	NULL;
		$_POST['fv']['pro_image']			= 	NULL;
		$_POST['fv']['pro_status']			=	TRUE;
		$_POST['fv']['db_error_msg']		=	"";
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['com_id']   	= $record_id;
		//Build contents query
		$query="SELECT pro_id, pro_category, pro_comtype, pro_name, pro_desc, pro_image, pro_status FROM ".$this->table_name." WHERE pro_id=?";
		$result_set=$this->db->query($query, array($record_id));					
		
		foreach ($result_set->result() as $row)
		{
			$records['pro_id']   			= $row->pro_id;
			$records['pro_category']   		= $row->pro_category;
			$records['pro_comtype']   		= $row->pro_comtype;
			$records['pro_name']			= $row->pro_name;
			$records['pro_desc']			= $row->pro_desc;
			$records['pro_image']			= $row->pro_image;
			$records['pro_status'] 			= ($row->pro_status==1) ? TRUE : FALSE;
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
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE pro_id=?", array($record_id));		
		
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
			log_admin_delete('34','Product', $logged_data, 'Admin - Deleted product: ' . $old_record['pro_name']);
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
	
			$_POST['fv']['pro_image']	   = $_FILES['pro_image']['name'];
			$this->db->insert($this->table_name, $_POST['fv']);
			
			
			
			$file = $_FILES['pro_image'];
			$name1 = $file['name'];
			$tmppath = $file['tmp_name'];
			if($name1!=""){
				move_uploaded_file($tmppath, '../admin/assets/images/products/'.$name1);
			}
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
				log_admin_add('34','Product', $logged_data, 'Admin - Added new product: ' . $_POST['fv']['pro_name']);
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
			$_POST['fv']['pro_id']	   = $id;
			$_POST['fv']['pro_image']	   = strlen($_FILES['pro_image']['name'])>0 ? $_FILES['pro_image']['name'] : $_POST['pro_image'];
			$this->db->update($this->table_name, $_POST['fv'], array('pro_id' => $id));
			
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
					log_admin_edit('34','Product', $old_values, $new_values, 'Admin - Updated product: ' . $_POST['fv']['pro_name']);
				} else {
					return array('status' => 0);
				}
			}
			
			if(strlen($_FILES['pro_image']['name'])>0)	
			{
				$file = $_FILES['pro_image'];
				$name1 = $file['name'];
				$tmppath = $file['tmp_name'];
				if($name1!="")
					move_uploaded_file($tmppath, '../admin/assets/images/products/'.$name1);
			}
		return array('status' => 1);

    }
	public function inline_update()
	{
		// Get the old record data for logging
		$this->db->where('pro_id', $_POST['pk']);
		$old_query = $this->db->get($this->table_name);
		$old_data = $old_query->row_array();
		
		$data = array(
               $_POST['name'] => $_POST['value']
            );

		$this->db->where('pro_id', $_POST['pk']);
		if($this->db->update($this->table_name, $data)) {
			// Get the new record data for logging
			$this->db->where('pro_id', $_POST['pk']);
			$new_query = $this->db->get($this->table_name);
			$new_data = $new_query->row_array();
			
			// Load helpers for field labels and logging
			$this->load->helper('field_labels');
			$this->load->helper('common');
			
			// Get field labels
			$field_labels = get_field_labels();
			$field_label = isset($field_labels[$_POST['name']]) ? $field_labels[$_POST['name']] : $_POST['name'];
			
			// Create a description for the log
			$description = $field_label . " in Product. Product Id: " . $_POST['pk'];
			
			// Prepare data for logging
			$old_values = array($_POST['name'] => isset($old_data[$_POST['name']]) ? $old_data[$_POST['name']] : null);
			$new_values = array($_POST['name'] => $_POST['value']);
			
			// Log the edit operation using the AdminLog model
			log_admin_edit('Product', 'Product', $old_values, $new_values, $description);
			
			echo true;
		}
		else {
			$error = $this->db->error();
			echo isset($error['message']) ? $error['message'] : 'Database error';
		}
	}
	
	function get_ajax_categorylist() {
		$return_arr = array();
		$query = $this->db->query("SELECT cat_id,cat_name from dt_category WHERE cat_status = 1 ORDER BY cat_name ASC");
		foreach($query->result() as $row) {
			$return_arr[] = array('value' => $row->cat_id,'text' => $row->cat_name);
		}
		
		return json_encode($return_arr);
	}
	
	function get_ajax_comtypelist() {
		$return_arr = array();
		$query = $this->db->query("SELECT ctp_id,ctp_name from dt_commoditytype WHERE ctp_show = 1 ORDER BY ctp_name ASC");
		foreach($query->result() as $row) {
			$return_arr[] = array('value' => $row->ctp_id,'text' => $row->ctp_name);
		}
		
		return json_encode($return_arr);
	}
	
	function get_category($cat_id = "") {
		$strData="";		
		$strData="<option value='-1' ";
		$strData.=$cat_id==-1 ? "selected='selected'" : "" ;
		$strData.=">- SELECT -</option>";		
		$resultset= $this->db->query("SELECT cat_id,cat_name from dt_category WHERE cat_status = 1 ORDER BY cat_name ASC");
		foreach ($resultset->result() as $row)
		{
		   $strData.= "<option value='" . htmlspecialchars($row->cat_id, ENT_QUOTES) . "' ";
		   $strData.=($cat_id==$row->cat_id) ? "selected='selected'" : "" ;
		   $strData.=">" . htmlspecialchars($row->cat_name, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result(); 
		return $strData;
	}
	
	function get_comtype($com_id = "") {
		$strData="";		
		$strData="<option value='-1' ";
		$strData.= $com_id ==-1 ? "selected='selected'" : "" ;
		$strData.=">- SELECT -</option>";		
		$resultset = $this->db->query("SELECT ctp_id,ctp_name from dt_commoditytype WHERE ctp_show = 1 ORDER BY ctp_name ASC");
		foreach ($resultset->result() as $row)
		{
		   $strData.= "<option value='" . htmlspecialchars($row->ctp_id, ENT_QUOTES) . "' ";
		   $strData.=($com_id == $row->ctp_id) ? "selected='selected'" : "" ;
		   $strData.=">" . htmlspecialchars($row->ctp_name, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result(); 
		return $strData;
	}
	
}
?>