<?php 
class Useronetimereg_model extends CI_Model
{
	var $table_name = 'dt_ratealert';//Initialize table Name
	
	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	public function get_data($params = "",$page = "all")
    {		
		$query = $this->db->query("SELECT tokenid,device_mobileno,device_user_name,device_user_email,device_user_company,device_user_verified,device_user_location,device_user_otp,date_format(`verifiedon`,'%d-%m-%Y %H:%i:%s') as verifiedon from dt_user_device where device_user_verified");
		
		return $query;
	}
	public function empty_record() 		//Fetch listing record
	{		
		$_POST['fv']['tokenid']   				= NULL;
		$_POST['fv']['device_mobileno']   		= NULL;
		$_POST['fv']['device_user_name']   		= NULL;
		$_POST['fv']['device_user_email']   	= NULL;
		$_POST['fv']['device_user_company']   	= NULL;
		$_POST['fv']['device_user_location']   	= NULL;
		$_POST['fv']['verifiedon']   	    	= NULL;
	}
	public function get_entry_record($id)
	{
		$records['tokenid']   				= $id;
		
		$query = $this->db->query("SELECT tokenid,device_mobileno,device_user_name,device_user_email,device_user_company,device_user_verified,device_user_location,device_user_otp,date_format(`verifiedon`,'%d-%m-%Y %H:%i:%s') as verifiedon from dt_user_device where device_user_verified and tokenid='".$id."'");
		//echo $query;
		
		foreach($query->result() as $row)
		{
			$records['tokenid']   				= $row->tokenid;
			$records['device_mobileno']   		= $row->device_mobileno;
			$records['device_user_name']   		= $row->device_user_name;
			$records['device_user_email']   	= $row->device_user_email;
			$records['device_user_company']   	= $row->device_user_company;
			$records['device_user_location']   	= $row->device_user_location;	
			$records['verifiedon']   			= $row->verifiedon;		
		}
		return $records;
	}
	public function get_activateentry_record($id) 								
	{
		$records['tokenid']   				= $id;	
		
		$query = $this->db->query("SELECT tokenid,device_mobileno,device_user_name,device_user_email,device_user_company,device_user_verified,device_user_location,device_user_otp,device_otp_count,date_format(`verifiedon`,'%d-%m-%Y') as verifiedon from dt_user_device where device_user_verified and tokenid='".$id."'");
		
		foreach($query->result() as $row)
		{
			$records['tokenid']   				= $id;
			$records['device_mobileno']   		= $row->device_mobileno;
			$records['device_user_name']   		= $row->device_user_name;
			$records['device_user_email']   	= $row->device_user_email;
			$records['device_user_company']   	= $row->device_user_company;
			$records['device_user_location']   	= $row->device_user_location;
			$records['verifiedon']   			= $row->verifiedon;
		}
		return $records;
	}
	public function insert_record($id)
    {
		$insert['tokenid']    				= $_POST['fv']['tokenid'];
		$insert['device_mobileno']   		= $_POST['fv']['device_mobileno'];
		$insert['device_user_name']   		= $_POST['fv']['device_user_name'];
		$insert['device_user_email']   		= $_POST['fv']['device_user_email'];
		$insert['device_user_company']   	= $_POST['fv']['device_user_company'];
		$insert['device_user_location']   	= $_POST['fv']['device_user_location'];		
		$insert['verifiedon']   			= $_POST['fv']['verifiedon'];	
		
		$this->db->insert('dt_ratealert',$insert);
		$alert_no = $this->db->insert_id();
		
		// Log the add operation
        // Log the add operation
		if ($this->db->affected_rows() > 0) {
			// Load field labels helper to map field names to user-friendly labels
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();
			
			// Create a mapped version of the data for logging
			$logged_data = array();
			foreach ($insert as $field => $value) {
				// Use the field label if available, otherwise use the field name
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				
				// Use value label if available, otherwise use the raw value
				if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
					$logged_data[$label] = $value_labels[$field][$value];
				} else {
					$logged_data[$label] = $value;
				}
			}
			log_admin_add('44','User One Time Registration', $logged_data, 'Admin - Added new user one time registration ID: ' . $alert_no);
			return array('status' => 1);
			} else {
				return array('status' => 0);
			}
	}
	/*public function update_record($id)
    {
		$update['tokenid']    			= $id;
		$update['device_mobileno']   	= $_POST['fv']['device_mobileno'];
		$update['device_user_name']   	= $_POST['fv']['device_user_name'];
		$update['device_user_email']   	= $_POST['fv']['device_user_email'];
		$update['device_user_company']  = $_POST['fv']['device_user_company'];
		$update['device_user_location'] = $_POST['fv']['device_user_location'];	
		$update['verifiedon']   		= $_POST['fv']['verifiedon'];	
		
		//$id=$this->db->insert_id();
		//$this->db->update('dt_events',$update);
		$this->db->update($this->table_name,$update, array('eve_id' => $id));
	} */
}

?>