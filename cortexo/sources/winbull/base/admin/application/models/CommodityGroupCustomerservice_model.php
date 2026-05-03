<?php
class CommodityGroupCustomerservice_model extends CI_Model {
		var $table_name = 'dt_comgroupcustomerservice';						//Initialize table Name
		var $secondtable_name = 'dt_com_group_master';
		var $thirdtable_name = 'dt_com_group_com';
		var $fourthtable_name = 'dt_customer';
		var $conversion;
	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	public function get_data()
    {		    
	   	$query = $this->db->query('SELECT 
										com_group_id, CONCAT(UCASE(LEFT(com_group_name, 1)),SUBSTRING(com_group_name, 2)) as com_group_name
									FROM 
										dt_com_group_master 
									WHERE 
										com_group_active=1	
									ORDER BY 
										com_group_id');
		return $query;
    }
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$records['serv_group_id']   	= $record_id;
		//Build contents query
		$this->db->select("com_group_name,com_group_desc")->from($this->secondtable_name)->where('com_group_id', $record_id);
		$query = $this->db->get();				
		foreach ($query->result() as $row)
		{
			$records['ser_group_id']   	= $record_id;
			$records['serv_group_name']  	= $row->com_group_name;
			$records['serv_group_desc']  	= $row->com_group_desc;
			$records['db_error_msg']		= "";				
		}
		return $records;
	}
	public function load_commoditydetails($record_id)
	{
		$result_set = $this->db->query("SELECT com.com_name as comname,com_type,comgrpcom.com_id
									FROM dt_com_group_master as comgrp
									LEFT JOIN dt_com_group_com as comgrpcom ON comgrpcom.com_group_id = comgrp.com_group_id
									LEFT JOIN dt_com_master as com ON com.com_id = comgrpcom.com_id
									where comgrp.com_group_id='".$record_id."' AND (com_sel_active=1 OR com_buy_active=1)");
									
		return $result_set;							
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
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE cgc_servgroupid=?", array($record_id));		
		
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
			
			log_admin_delete('20','Commodity Group Customer Service', $logged_data, 'Admin - Deleted commodity group customer service: ' . $old_record['serv_group_name']);
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
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE cgc_servgroupid='".$id."'");
		foreach($_POST['fv']['cgc_cusid'] as $key => $value)
		{
			$cgrpitems['cgc_servgroupid']		=	$id;
			$cgrpitems['cgc_cusid']			=	$_POST['fv']['cgc_cusid'][$key];
			$this->db->insert($this->table_name,$cgrpitems);			
		}
		
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
		
		log_admin_add('20','Commodity Group Customer Service', $logged_data, 'Admin - Added new commodity group customer service: ' . $_POST['fv']['serv_group_name']);
		return array('status' => 1);
	}
	public function update_record($id)
	{
			// Get the record before updating for logging purposes
			$old_record = $this->get_entry_record($id);
			
			//Update Data
			$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE cgc_servgroupid='".$id."'");
			foreach($_POST['fv']['cgc_cusid'] as $key => $value)
			{
				$cgrpitems['cgc_servgroupid']		=	$id;
				$cgrpitems['cgc_cusid']			=	$_POST['fv']['cgc_cusid'][$key];
				$this->db->insert($this->table_name,$cgrpitems);			
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
				log_admin_edit('20','Commodity Group Customer Service', $old_values, $new_values, 'Admin - Updated commodity group customer service: ' . $old_record['serv_group_name']);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
				
    }
	//Load customer group details
	public function load_customer($record_id) {
		$result_set=$this->db->query("SELECT cus_id,cus_name,cus_company_name, cus_mobile, cus_email,comgrpser.cgc_cusid as cgc_cusid
									FROM dt_customergroupitems AS cusgrp
									LEFT JOIN dt_customer AS cus ON cus.cus_id = cusgrp.cgitems_cusid
									LEFT JOIN dt_comgroupcustomerservice as comgrpser ON comgrpser.cgc_cusid = cusgrp.cgitems_cusid
                  					and comgrpser.cgc_servgroupid = '".$record_id."'
									WHERE cgitems_comgroupid=? and cgitems_cgrpid=(SELECT max(cgitems_cgrpid) FROM dt_customergroupitems)", array($record_id));
		return $result_set;
	}
	/*
	get_emailid -> This method is used to get the email id of all the customer in a particular group id
	@Param $record_id -> record code of the customer service group
	@return string
	*/	
	function get_emailid($record_id) {
		$email_id = "";
		$result_set = $this->db->query("SELECT group_concat(cus_email) as emailid
										from dt_customer,dt_comgroupcustomerservice 
										where cgc_cusid = cus_id and cgc_servgroupid ='".$record_id."'");
		foreach($result_set->result() as $row) {
			$email_id = $row->emailid;
		}
		$result_set->free_result();	
		return $email_id;
	}
	
	/*
	get_smsurl -> This method is used to get the details need to send a sms
	@Param $record_id -> record code of the customer service group 
	*/
	function get_comgrpsmsurl($record_id, $send_type=0) {
		// Initalizing variables
		$sms_url = "";
		$company_name = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";		
		$sms_mobiles = "";		
		$sms_message = "";
		$sms_header = "";
		$sms_footer = "";
		$sms_greeting = 0;
		$sms_returnurl = "";
		$email_msg = array();
		//Fetching SMS App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id=1");
		foreach($result_set->result() as $row) {
			$sms_url = $row->sas_url;			
		}
		//Fetching SMS App user name, password and sender id
		$result_set = $this->db->query("select admin_company_name,admin_sms_username,admin_sms_authkey, admin_sms_password, admin_sms_senderid from dt_generalsettings");
		if($result_set->num_rows() >0) {
			$company_name = $result_set->row()->admin_company_name;
			$sms_username = $result_set->row()->admin_sms_username;
			$sms_password = $result_set->row()->admin_sms_password;
			$sms_senderid = $result_set->row()->admin_sms_senderid;
			$sms_authkey  = $result_set->row()->admin_sms_authkey;		
		}
		$result_set->free_result();
		//Fetching the mobile no's of all customers in the service group
		$result_set = $this->db->query("select group_concat(cus_mobile) as mobile_no
										from dt_customer,dt_comgroupcustomerservice 
										where cgc_cusid = cus_id and cgc_servgroupid ='".$record_id."'");
		foreach($result_set->result() as $row) {
			$sms_mobiles = $row->mobile_no;
		}		
		$result_set->free_result();		
		//Fetching header, footer and greeting details						
		$result_set = $this->db->query("select serv_group_desc,serv_group_header, 
										is_greetings,serv_group_footer from dt_serv_group_master
										where is_greetings =0");
		if($result_set->num_rows() > 0)
		{
				$email["subject"] = $result_set->row()->serv_group_desc;
				$email["header"] = $sms_header = $result_set->row()->serv_group_header;
				$email["greeting"] = $sms_greeting = 0; //$row->is_greetings;
				$email["footer"] = $sms_footer = $result_set->row()->serv_group_footer;
		}else {
				$email["subject"] = "Best Rate, Best Service";
				$email["header"] = $sms_header = "Welcome to ".$company_name;
				$email["footer"] = $sms_footer = "For Live Gold Rate ";
				$email["greeting"] = 0;
		}
		$result_set->free_result();		
		/*
			*************   START - Generating sms message   ****************
		*/
		//Header details is adding
		$sms_message = $sms_header."Market (SELL/BUY) Rates: ";		
		//If it is not a greeting message 0-> not a greeting message, 1-> greeting message		
		if($sms_greeting == 0) {
			//Fetching general rpanel settings such as gold & silver weight and round off factor
			
			$rate_xml_file = "";
			$str_generalquery = $this->db->query("SELECT admin_sendratexml FROM dt_generalsettings");
			if($str_generalquery->num_rows() >0) {
				$rate_xml_file = $str_generalquery->row()->admin_sendratexml;
			}
			
			if($rate_xml_file == "") return 4;
			$xmlstring = file_get_contents("../api/".$rate_xml_file.".xml");
			$xml = simplexml_load_string($xmlstring);
			$json = json_encode($xml);
			$array = json_decode($json,TRUE);
		
			$rate_display	=	$array['rate_display'];
			$trade_type		=	$array['Baserates']['trade_type'];
			
			if($trade_type == 3) return 3;
			if($rate_display == 1) return 1;
						
			//Fetching which commodity type and what rate should be send to client
			$query = $this->db->query("SELECT com.com_name as com_name,com.com_type as com_type,com.com_id as com_id
						FROM dt_com_group_com as comgrp
						LEFT JOIN dt_com_master AS com ON com.com_id = comgrp.com_id
						WHERE com_group_id = ? AND (com_sel_active = 1 OR com_buy_active=1)", array($record_id));						
			//Flag variable to check whether the gold rate is added for Gold and silver seperator (,)
			$gs_flag=0;			
			//Flag variable for Date & time concat the date & time with the generated message
			$flag = 0;		
			$j=1;					
			foreach ($query->result_array() as $row) {
				if(is_array($array['Commodities']['Commodity'])) {
					foreach($array['Commodities']['Commodity'] as $com) {
						
						if($row['com_id'] == $com['id'])
						{
							$email_msg[$j]['name'] = $com['name'];
							$sms_message = $sms_message." ".$com['name'].": ";
							$sms_message = $sms_message." ".$com['selling_rate']." ";
							$email_msg[$j]['sell'] = $com['selling_rate'];
							$sms_message = $sms_message." / ".$com['buying_rate']." ";
							$email_msg[$j]['buy'] = $com['buying_rate'];
							$j++;
							$flag = true;
						}
					}
				}	
			}
			
			$gold_bid		=	$array['Baserates']['gold_bid'];
			$gold_ask		=	$array['Baserates']['gold_ask'];
			$silver_lgd_bid	=	$array['Baserates']['silver_lgd_bid'];
			$silver_lgd_ask	=	$array['Baserates']['silver_lgd_ask'];
			$ind_bid		=	$array['Baserates']['inr_bid'];
			$ind_ask		=	$array['Baserates']['inr_ask'];
			
			$sms_message = $sms_message." International Bid/Ask:";
			$sms_message.= "Gold: ".$gold_bid ."/".$gold_ask;
			$sms_message.= " Silver: ".$silver_lgd_bid."/".$silver_lgd_ask;
			$sms_message.= " INR: ".$ind_bid."/".$ind_ask;
			
			$email["international"] = "International Rates Bid / Ask:<br>"."Gold: ".$gold_bid ."/".$gold_ask."<br>"." Silver: ".$silver_lgd_bid."/".$silver_lgd_ask."<br>"." INR: ".$ind_bid."/".$ind_ask;
			
			if(!$flag) return 0;
			//Checking the flag to add date & time to the message after gold & silver rate is added
			if($gs_flag == 1) {
				$sms_message = $sms_message." Date: ".date('d/m/Y H:i:s');
			}	
			$query->free_result();											
		}
			$email["mail_content"] = $email_msg;
			//Footer details is adding						
			$sms_message = $sms_message." ".$sms_footer;
			/*
				*************  END - Generating sms message   ****************
			*/
			//Generating url
			$sms_returnurl = $sms_url; 
			$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
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