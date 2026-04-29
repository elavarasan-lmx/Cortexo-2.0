<?php
class Usersms_settings_model extends CI_Model {
		var $table_name = 'dt_rpanel_settings';						//Initialize table Name

	

	function get_smsurl($mobile_no="",$msg=""){

		$sms_url = "";
		$sms_username = "";
		$sms_password = "";
		$sms_senderid = "";		
		$sms_mobiles = $mobile_no;		
		$sms_message = $msg;
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id=1");
		foreach($result_set->result() as $row) {
			$sms_url = $row->sas_url;			
		}
		$result_set = $this->db->query("select admin_sms_username, admin_sms_authkey, admin_sms_senderid from dt_generalsettings");
		if($result_set->num_rows() > 0) {
			$sms_username = $result_set->row()->admin_sms_username;
			$sms_authkey = $result_set->row()->admin_sms_authkey;
			$sms_senderid = $result_set->row()->admin_sms_senderid;			
		}
		$result_set->free_result();	
		
		$sms_returnurl = $sms_url; 
		$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
		$sms_returnurl = str_replace("@@authkey@@", $sms_authkey, $sms_returnurl);
		$sms_returnurl = str_replace("@@mobileno@@", $sms_mobiles, $sms_returnurl);	
		$sms_returnurl = str_replace("@@message@@", $sms_message, $sms_returnurl);	
		$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
		return $sms_returnurl;		

	}	
	
	function getnotificationids(){
		$notificationids = array();
		$notificationquery = $this->db->query("SELECT device_token FROM dt_user_device");
		if($notificationquery->num_rows() >0){
			foreach($notificationquery->result() as $row){
				array_push($notificationids,$row->device_token);
			}
		}
		return $notificationids;
	}

}
?>