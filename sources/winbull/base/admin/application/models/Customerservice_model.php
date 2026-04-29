<?php
class Customerservice_model extends CI_Model {
		var $table_name = 'dt_customerservicegroup';						//Initialize table Name
		var $conversion;

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
										serv_group_id, serv_group_name
									FROM 
										dt_serv_group_master 
									WHERE 
										is_greetings = 1
									ORDER BY 
										serv_group_id');
		return $query;
    }
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['serv_group_id']   	= $record_id;
		//Build contents query
		$this->db->select("serv_group_id,serv_group_name,serv_group_email,serv_group_sms,serv_group_desc,serv_group_active")->from("dt_serv_group_master")->where('serv_group_id', $record_id);
		$query = $this->db->get();				
		foreach ($query->result() as $row)
		{
			$records['serv_group_id']   	= $row->serv_group_id;
			$records['serv_group_name']  	= $row->serv_group_name;
			$records['serv_group_email']  	= $row->serv_group_email;
			$records['serv_group_sms']  	= $row->serv_group_sms;
			$records['serv_group_desc'] 	= $row->serv_group_desc;			
			$records['serv_group_active']	= $row->serv_group_active;
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
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE csg_sergroupid=?", array($record_id)); // P-SQL fix		
		
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
			log_admin_delete('24','Customer Service', $logged_data, 'Admin - Deleted customer service group ID: ' . $record_id);
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
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
			//print_r($_POST);
			$_POST['fv']['mrq_active']	   = (isset($_POST['fv']['mrq_active']) ? 1 : 0);
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
				log_admin_add('24','Customer Service', $logged_data, 'Admin - Added new customer service group ID: ' . $id);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }
	
	public function update_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
			// Get the record before updating for logging purposes
			$old_record = $this->get_entry_record($id);
			
			//Update Data
			$delete_record = $this->db->query("DELETE FROM dt_customerservicegroup WHERE csg_sergroupid=?", array($id)); // P-SQL fix
			foreach($_POST['fv']['csg_cusid'] as $key => $value)
			{
				$cgrpitems['csg_sergroupid']		=	$id;
				$cgrpitems['csg_cusid']			=	$_POST['fv']['csg_cusid'][$key];
				$this->db->insert("dt_customerservicegroup",$cgrpitems);			
			}
			
			// Create selective logging - only log changed values
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
				log_admin_edit('24','Customer Service', $old_values, $new_values, 'Admin - Updated customer service group ID: ' . $id);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }
	//Load customer group details
	public function load_customer($record_id) {
		$result_set=$this->db->query("select cus_id,cus_name,cus_company_name,csg_cusid, cus_mobile, cus_email
									from dt_customer
									left join dt_customerservicegroup on cus_id=csg_cusid and
									csg_sergroupid=?", array($record_id)); // P-SQL fix
		return $result_set;
	}
	/*
	get_emailid -> This method is used to get the email id of all the customer in a particular group id
	@Param $record_id -> record code of the customer service group
	@return string
	*/	
	function get_emailid($record_id) {
		$email_id = "";
		$result_set = $this->db->query("select group_concat(cus_email) as emailid
										from dt_customer,dt_customerservicegroup 
										where csg_cusid = cus_id and csg_sergroupid =?", array($record_id)); // P-SQL fix
		foreach($result_set->result() as $row) {
			$email_id = $row->emailid;
		}
		$result_set->free_result();	
		return $email_id;
	}
	function get_groupid($send_type) {
		$rs_groupid = $this->db->query("select tms_serv_group_id
										from dt_timeschedule
										where tms_sgsdays=(dayofweek(now())-1) and tms_time='17:00:00'"); //DATE_FORMAT(now(),'%H:%i:00')");
		$index_groupid = 0;								
		foreach($rs_groupid->result_array() as $row_groupid) {
			$group_id[$index_groupid] = $this->get_smsurl($row_groupid["tms_serv_group_id"], $send_type);		
			$index_groupid++;
		}
		$rs_groupid->free_result();
		//print_r($group_id);
		return json_encode($group_id);	
	}
	/*
	get_smsurl -> This method is used to get the details need to send a sms
	@Param $record_id -> record code of the customer service group 
	*/
	function get_smsurl($record_id, $send_type=0) {
		// Initalizing variables
		$sms_url = "";
		$company_name = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";		
		$sms_mobiles = "";	
		$sms_authkey = "";	
		$sms_message = "";
		$sms_header = "";
		$sms_footer = "";
		$sms_greeting = 0;
		$sms_returnurl = "";
		
		//Fetching SMS App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id=1");
		foreach($result_set->result() as $row) {
			$sms_url = $row->sas_url;			
		}
		//Fetching SMS App user name, password and sender id
		$result_set = $this->db->query("select admin_company_name,admin_sms_username, admin_sms_password, admin_sms_authkey , admin_sms_senderid from dt_generalsettings");
		if($result_set->num_rows() > 0) {
			$company_name = $result_set->row()->admin_company_name;
			$sms_username = $result_set->row()->admin_sms_username;
			$sms_password = $result_set->row()->admin_sms_password;
			$sms_authkey = $result_set->row()->admin_sms_authkey;
			$sms_senderid = $result_set->row()->admin_sms_senderid;			
		}
		$result_set->free_result();		
		//Fetching the mobile no's of all customers in the service group
		$result_set = $this->db->query("SELECT group_concat(cus_mobile) as mobile_no
										FROM dt_customer,dt_customerservicegroup 
										WHERE csg_cusid = cus_id and csg_sergroupid =?", array($record_id)); // P-SQL fix
		foreach($result_set->result() as $row) {
			$sms_mobiles = $row->mobile_no;
		}		
		$result_set->free_result();		
		//Fetching header, footer and greeting details						
		$result_set = $this->db->query("select serv_group_desc,serv_group_header, serv_group_footer, 
										is_greetings from dt_serv_group_master
										where serv_group_id=?", array($record_id)); // P-SQL fix
		foreach($result_set->result() as $row) {
			$email["subject"] = $sms_message = $row->serv_group_desc;
			$email["header"] = $sms_header = $row->serv_group_header;
			$email["footer"] = $sms_footer = $row->serv_group_footer;
			$email["greeting"] = $sms_greeting = $row->is_greetings;			
		}
		$result_set->free_result();		
		/*
			*************   START - Generating sms message   ****************
		*/
		//Header details is adding
		$sms_message = $sms_header." ".$sms_message." ".$sms_footer;
		
		/*
			*************  END - Generating sms message   ****************
		*/
		//Generating url
		$sms_returnurl = $sms_url; 
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@password@@", $sms_password, $sms_returnurl);
		
		$sms_returnurl = str_replace("@@authkey@@", $sms_authkey, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", $sms_mobiles, $sms_returnurl);	
		$sms_returnurl = str_replace("@@message@@", $sms_message, $sms_returnurl);	
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);	
		//$sms_returnurl = $sms_url."user=".$sms_username."&password=".$sms_password."&mobiles=".$sms_mobiles;
		//$sms_returnurl = $sms_returnurl."&message=".$sms_message."&sender=".$sms_senderid;
	
		if($send_type==0) {
			return $sms_returnurl;	
		} else {
			return $email;
		}	
	}
}
?>