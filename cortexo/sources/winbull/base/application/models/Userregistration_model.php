<?php
class Userregistration_model extends CI_Model {
	var $table_name = 'dt_customer';						//Initialize table Name
	
	public function __construct() {
		parent::__construct();
		$this->load->helper('common');
		$this->load->helper('field_labels');
	}

	public function get_data($params = "" , $page = "all")
    {		    
	   	$query = $this->db->query("SELECT cus_id,cus_name,
			cus_company_name,
			cus_login_name,
			cus_login_password,
			IF(IFNULL(cus_status,0)=0,'Not Confirmed','Confirmed') AS cus_status,
			if(cus_active=1,'Active','Disabled') as cus_active			
			FROM dt_customer ORDER BY cus_id DESC");
			return $query;
    }
	public function set_data()
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
	}
	public function empty_record() 	//Fetch listing record
	{		
		$_POST['fv']['cus_id']					=	NULL;		
		$_POST['fv']['cus_name']				=	NULL;
		$_POST['fv']['cus_company_name']		=	NULL;
		$_POST['fv']['cus_address']				=	NULL;
		$_POST['fv']['cus_city']				=	NULL;
		$_POST['fv']['cus_state']				=	NULL;
		$_POST['fv']['cus_country']				=	NULL;
		$_POST['fv']['cus_pin_code']			=	NULL;
		$_POST['fv']['cus_phone1']				=	NULL;
		$_POST['fv']['cus_phone2']				=	NULL;
		$_POST['fv']['cus_mobile1']				=	NULL;
		$_POST['fv']['cus_mobile2']				=	NULL;
		$_POST['fv']['cus_fax']					=	NULL;
		$_POST['fv']['cus_email']				=	NULL;
		$_POST['fv']['cus_url']					=	NULL;
		$_POST['fv']['cus_login_name']			=	NULL;
		$_POST['fv']['cus_login_password']		=	NULL;
		$_POST['fv']['cus_ip']					=	NULL;
		$_POST['fv']['cus_sec_code']			=	NULL;
		$_POST['fv']['cus_is_ip_restricted']	=	FALSE;
		$_POST['fv']['cus_nletter_email']		=	FALSE;
		$_POST['fv']['cus_nletter_sms']			=	FALSE;
		$_POST['fv']['cus_status']				=	0;
		$_POST['fv']['cus_book_person']			=	NULL;
		$_POST['fv']['cus_delivery_person']		=	NULL;
		$_POST['fv']['cus_delivery_mobileno']	=	NULL;
		$_POST['fv']['cus_booking_mobileno']	=	NULL;
		$_POST['fv']['cus_tin_no']				=	NULL;
		$_POST['fv']['cus_centrix']				=	NULL;
		$_POST['fv']['db_error_msg']			=	"";
	}	
	//set commodity moq details
	public function load_commodity($record_id) 
	{
		$result_set=$this->db->query("select com_id, com_name, cus_com_smoq, cus_com_pmoq, cus_com_status from dt_com_master left join dt_cus_commodity on com_id=cus_com_id and cus_com_cus_id='".$record_id."' order by com_id");
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
		$this->db->select('*');
		$this->db->from($this->table_name);
		$this->db->where('cus_id', $record_id);
		$query = $this->db->get();
		$old_record = array();
		if ($query->num_rows() > 0) {
			$old_record = $query->row_array();
		}
		
		$delete_record =$this->db->query("DELETE FROM ".$this->table_name." WHERE cus_id='".$record_id."'");	
		
		// Log the delete operation
		if ($this->db->affected_rows() > 0) {
			$this->log_delete($old_record, 'Admin - Deleted user registration record ID: ' . $record_id);
		}
		
		return TRUE;
	}
   
	public function insert_record()
    {
		$insert['cus_register_on']       =   date('Y-m-d H:i:s');
		$insert['cus_name']            	 =  $_POST['cus_name'];
		$insert['cus_alise_name']        =  isset($_POST['cus_alise_name']) ? $_POST['cus_alise_name'] : NULL;
		$insert['cus_company_name']      =  $_POST['cus_company_name'];
		$insert['cus_email']             =  $_POST['cus_email'];
		$insert['cus_mobile']            =  $_POST['cus_mobile'];
		$insert['cus_login_name']    	 =  $_POST['cus_mobile'];
		$insert['cus_whatsapp']			 = 	$_POST['cus_mobile'];
		$insert['cus_gstno']        	 =  isset($_POST['cus_gstno']) ? $_POST['cus_gstno'] : NULL;
		$insert['cus_panno']        	 =  isset($_POST['cus_panno']) ? $_POST['cus_panno'] : NULL;
		$insert['cus_address']    		 =  isset($_POST['cus_address']) ? $_POST['cus_address'] : "";
		$insert['cus_login_password']    =  $_POST['cus_login_password'];
		// $insert['cus_tcstds']    		 =  $_POST['cus_tcstds'];
		$insert['cus_is_life_time']      =  1;
		$insert['cus_active']            =  0;
		
		// Log the add operation
		$log_data = $insert;
		
		$this->db->insert($this->table_name,$insert);
		$cus_id               			 =     $this->db->insert_id();                
	    $cgrpitems['cgitems_cgrpid']     =  1;
	    $cgrpitems['cgitems_cusid']      =  $cus_id;
	    $cgrpitems['cgitems_comgroupid'] =  1;
	    $this->db->insert("dt_customergroupitems",$cgrpitems);
		
		// Log the add operation
		if ($cus_id > 0) {
			$this->log_add($log_data, 'Admin - Added new user registration for customer ID: ' . $cus_id);
		}
	}

	public function	customer_confirmation($record_id, $record_confirmation) 
	{
		$message = "";
		$result_set = $this->db->query("select datediff(now(),cus_register_on) as daysdiff,cus_status from dt_customer where cus_id='".$record_id."' and cus_confirmation_no='".$record_confirmation."'");
		if ($result_set->num_rows() > 0) 
		{
			foreach ($result_set->result() as $row) 
			{
				if($row->cus_status > 0) 
				{
					$message = "You have already confirmed";
				} 
				else 
				{	
					if($row->daysdiff > 7) 
					{
						$message = "Confirmation Date Expired";
					} 
					else
					{
						// Get the record before updating for logging purposes
						$this->db->select('*');
						$this->db->from($this->table_name);
						$this->db->where('cus_id', $record_id);
						$query = $this->db->get();
						$old_record = array();
						if ($query->num_rows() > 0) {
							$old_record = $query->row_array();
						}
						
						$update_rs = $this->db->query("update dt_customer set cus_confirmed_on=now(),cus_status=1 where cus_id='".$record_id."' and cus_confirmation_no='".$record_confirmation."' and cus_status=0");
						
						// Log the edit operation
						if ($this->db->affected_rows() > 0) {
							$new_record = array('cus_confirmed_on' => date('Y-m-d H:i:s'), 'cus_status' => 1);
							$this->log_edit($old_record, array_merge($old_record, $new_record), 'Admin - Confirmed customer registration for customer ID: ' . $record_id);
						}
						
						$message = "Thanks for your confirmation";
					}
				} 		
			}
		} 
		else 
		{
			$message = "No such user";
		}	
		echo $message;			
	}
	
	function get_marqueetext() {
		$return_data = "";
		$resultset = $this->db->query("select mrq_text from dt_marqueetext where mrq_active=1");
		foreach ($resultset->result() as $row) {
			$return_data = $row->mrq_text;
		}
		return $return_data;
	}
	
	function get_companyname() {
		$company_name = "";
		$resultset = $this->db->query("select admin_company_name from dt_admin_user where admin_user_id=1");
		foreach ($resultset->result() as $row)
		{
			$company_name = $row->admin_company_name;
		}
		$resultset->free_result();
		return $company_name;		
	}
	function clientEmail($id) 
	{
		$id_val=0;
		$resultset = $this->db->query("select cus_email from dt_customer where cus_email='".$id."'");
		if ($resultset->num_rows() > 0)	{
			return 1;
		}
		else	{
			return 0;
		}
	}
	function clientMobileNo($mobile)
	{
		$resultset = $this->db->query("select cus_mobile from dt_customer where cus_mobile='".$mobile."'");
		if ($resultset->num_rows() > 0)	{
			return 1;
		}
		else	{
			return 0;
		}
	}
	function get_whatsappURL($service_id, $cus_id) {
		//Declaration of variables
		$sms_url ="";
		$sms_status = 0;
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$mobil_no = "";
		$customer_data = array();
		
		//Retriving SMS service for registration confirmation
		$resultset = $this->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();

		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if($sms_status == 1) {
			$resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active,'".$this->session->userdata('company_name')."' as admin_company_name from dt_customer where cus_id = '".$cus_id."'");
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile);
			$mobil_no = $customer_data->cus_mobile;
			//Retriving message content
			$resultset = $this->db->query("SELECT sms_content, sms_footer from dt_sms_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
			}
			$resultset->free_result();
			//Generating Message content
			$field_name = explode('@@', $sms_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) {
				if(isset($customer_data->{$field_name[$i]})) { 
					$sms_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$sms_content);					
				}	
			}
			$field_name_footer = explode('@@', $sms_footer);	
			for($i=1; $i < count($field_name_footer); $i+=2) {
				if(isset($customer_data->{$field_name_footer[$i]})) { 
					$sms_footer = str_replace("@@".$field_name_footer[$i]."@@",$customer_data->{$field_name_footer[$i]},$sms_footer);					
				}	
			}
			$sms_content .= " ".$sms_footer;	
			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);				
		}
		//Returning generated SMS URL
		return array('message' => $sms_content, 'mobile' => $mobil_no);
	}
	function get_SMSURL($service_id,$cus_id) {
		//Declaration of variables
		$sms_url ="";
		$sms_status = 0;
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$customer_data = array();
		
		//Retriving SMS service for registration confirmation
		$resultset = $this->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();

		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if($sms_status == 1) {
			$resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active,'".$this->session->userdata('company_name')."' as admin_company_name from dt_customer where cus_id = '".$cus_id."'");
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			//Retriving message content
			$resultset = $this->db->query("SELECT sms_content, sms_footer,sms_dlt_te_id from dt_sms_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$sms_content = $row->sms_content;
				$sms_footer = $row->sms_footer;
				$sms_dlt_te_id = $row->sms_dlt_te_id;
			}
			$resultset->free_result();
			$sms_url = $this->get_SMSAppSettings($sms_id, $customer_data->cus_mobile, $sms_dlt_te_id);
			//Generating Message content
			$field_name = explode('@@', $sms_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) {
				if(isset($customer_data->{$field_name[$i]})) { 
					$sms_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$sms_content);					
				}	
			}
			$field_name_footer = explode('@@', $sms_footer);	
			for($i=1; $i < count($field_name_footer); $i+=2) {
				if(isset($customer_data->{$field_name_footer[$i]})) { 
					$sms_footer = str_replace("@@".$field_name_footer[$i]."@@",$customer_data->{$field_name_footer[$i]},$sms_footer);					
				}	
			}
			$sms_content .= " ".$sms_footer;	
			$sms_content = urlencode($sms_content);
			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);				
		}
		// print_r($sms_url);exit;
		//Returning generated SMS URL
		return $sms_url;
	}
	function get_SMSAppSettings($sms_id, $mobile_no,$dlt_id="") {
		//Declaring variables
		$sms_returnurl = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";
		
		//Fetching SMS App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id='".$sms_id."'");
		foreach($result_set->result() as $row) {
			$sms_returnurl = $row->sas_url;			
		}
		$result_set->free_result();	
		
		//Fetching SMS App user name, password and sender id
		$result_set = $this->db->query("select admin_sms_username, admin_sms_authkey, admin_sms_senderid from dt_generalsettings");
		if($result_set->num_rows() > 0) {
			$sms_username	= $result_set->row()->admin_sms_username;
			$sms_authkey	= $result_set->row()->admin_sms_authkey;
			$sms_senderid	= $result_set->row()->admin_sms_senderid;			
		}
		$result_set->free_result();			
		
		//Generating SMS Url with User Name, Password and Sender ID
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@authkey@@", $sms_authkey, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", "91".$mobile_no, $sms_returnurl);
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
		$sms_returnurl = str_replace("@@dlt_id@@", $dlt_id, $sms_returnurl);
		//returning gererated URL
		return 	$sms_returnurl;
	}
	
	function get_EmailContent($service_id, $cus_id) {
		//Declaration of variables
		$email_content ="";
		$email_status = 0;
		$email_id = 1; //Send SMS		
		$email_signature = "";
		$customer_data = array();

		//Retriving EMail service for registration confirmation
		$resultset = $this->db->query("SELECT serv_email FROM dt_serv_master WHERE serv_id = '".$service_id."'");
		foreach($resultset->result() as $row){
			$email_status = $row->serv_email;
		}
		$resultset->free_result();

		//Checking EMail service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if($email_status == 1) {
			$resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_alise_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active,'".$this->session->userdata('company_name')."' as admin_company_name from dt_customer where cus_id = '".$cus_id."'");
			foreach($resultset->result() as $row){
				$customer_data = $row;
			}
			$return_data["email_id"] = 	$customer_data->cus_email;		
			//Retriving message content
			$resultset = $this->db->query("SELECT email_content, email_signature from dt_email_settings where service_id = '".$service_id."'");
			foreach($resultset->result() as $row){
				$email_content = $row->email_content;
				$email_signature = $row->email_signature;
			}
			$resultset->free_result();
			//Generating Message content
			$field_name = explode('@@', $email_content);	
			//echo count($field_name);		
			for($i=1; $i < count($field_name); $i+=2) {
				if(isset($customer_data->{$field_name[$i]})) { 
					$email_content = str_replace("@@".$field_name[$i]."@@",$customer_data->{$field_name[$i]},$email_content);					
				}	
			}
			$field_name_sig = explode('@@', $email_signature);	
			for($i=1; $i < count($field_name_sig); $i+=2) {
				if(isset($customer_data->{$field_name_sig[$i]})) { 
					$email_signature = str_replace("@@".$field_name_sig[$i]."@@",$customer_data->{$field_name_sig[$i]},$email_signature);					
				}	
			}
			$return_data["email_subject"] = $email_signature;	
			$return_data["email_content"] = $email_content;
		}
		//Returning generated EMail Content
		return $return_data;
	}
	function check_mobileno($mobile = "")
	{
		$resultset = $this->db->query("select * from dt_customer where cus_mobile='".$mobile."' OR cus_login_name='".$mobile."'");
		if ($resultset->num_rows() > 0)	{
			return 1;
		}
		else {
			return 0;
		}
	}
	function check_email($email = "")
	{
		$resultset = $this->db->query("select * from dt_customer where cus_email='".$email."'");
		if ($resultset->num_rows() > 0)	{
			return 1;
		}
		else {
			return 0;
		}
	}
	function check_alias_name($alias_name = "")
	{
		$resultset = $this->db->query("select * from dt_customer where cus_alise_name='".$alias_name."'");
		if ($resultset->num_rows() > 0)	{
			return 1;
		}
		else {
			return 0;
		}
	}
	
	/**
	* Log add operation
	* @param array $data - Data being added
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_add($data = array(), $description = '')
	{
		$module_name = 'User Registration';
		$log_type = 'User Registration';
		
		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}
		
		return log_admin_add($log_type, $module_name, $data, $description);
	}
	
	/**
	* Log edit operation
	* @param array $old_data - Data before update
	* @param array $new_data - Data after update
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_edit($old_data = array(), $new_data = array(), $description = '')
	{
		$module_name = 'User Registration';
		$log_type = 'User Registration';
		
		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}
		
		// Get changed fields for more detailed logging
		$changed_data = get_changed_fields($old_data, $new_data);
		
		return log_admin_edit($log_type, $module_name, $old_data, $new_data, $description . ' - Changed fields: ' . json_encode($changed_data));
	}
	
	/**
	* Log delete operation
	* @param array $data - Data being deleted
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_delete($data = array(), $description = '')
	{
		$module_name = 'User Registration';
		$log_type = 'User Registration';
		
		if (empty($description)) {
			$description = 'Deleted record from ' . $module_name;
		}
		
		return log_admin_delete($log_type, $module_name, $data, $description);
	}
}
?>