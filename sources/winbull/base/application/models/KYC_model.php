<?php
class KYC_model extends CI_Model {
		var $table_name = 'dt_customer';						//Initialize table Name
		
	public function __construct() {
		parent::__construct();
		$this->load->helper('common');
		$this->load->helper('field_labels');
	}

	public function empty_record() 										//Fetch listing record
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
		$_POST['fv']['cus_tcstds']				=	0;
		$_POST['fv']['db_error_msg']			=	"";
	}
	
	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
    public function insert_record()
	{
		$_POST['fv']['cus_register_on']		=	date('Y-m-d H:i:s');
		$_POST['fv']['cus_regtype']       =        1;
		$_POST['fv']['cus_tincopy']	  		= 	 $_FILES['fv']['name']['cus_tincopy'];
		$_POST['fv']['cus_pancopy']	  		= 	 $_FILES['fv']['name']['cus_pancopy'];
		$_POST['fv']['cus_addrcopy']	  	= 	 $_FILES['fv']['name']['cus_addrcopy'];
		$_POST['fv']['cus_dealcopy']	  	= 	 $_FILES['fv']['name']['cus_dealcopy'];
		
		// Log the add operation
		$log_data = $_POST['fv'];
		
		//$insert_data['cus_regtype']	  		= 	 1;			
		$this->db->insert("dt_customer", $_POST['fv']);	
		$cus_id = $this->db->insert_id();
		//echo $this->db->last_query($cus_id);exit;
		
		$cgrpitems['cgitems_cgrpid']		=	1;
		$cgrpitems['cgitems_cusid']			=	$cus_id;
		$cgrpitems['cgitems_comgroupid']	=	4;
		$this->db->insert("dt_customergroupitems",$cgrpitems);
		
		// Log the add operation
		if ($cus_id > 0) {
			$this->log_add($log_data, 'Admin - Added new KYC record for customer ID: ' . $cus_id);
		}
		
		return $cus_id;		
    }
	
	/**
	* Log add operation
	* @param array $data - Data being added
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_add($data = array(), $description = '')
	{
		$module_name = 'KYC';
		$log_type = 'KYC';
		
		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}
		
		return log_admin_add($log_type, $module_name, $data, $description);
	}
}
?>