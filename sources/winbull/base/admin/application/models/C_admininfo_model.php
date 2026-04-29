<?php
class C_admininfo_model extends CI_Model {
		var $table_name = 'dt_admininfo';

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
	   	$query = $this->db->query('SELECT ai_sno , ai_text , ai_active FROM dt_admininfo ORDER BY ai_sno DESC');
		return $query;
    }
	public function empty_record() 										
	{
		$_POST['fv']['ai_sno']		=	NULL;
		$_POST['fv']['ai_text']	=	NULL;
		$_POST['fv']['ai_active']	=	TRUE;
		$_POST['fv']['db_error_msg']=	"";
	}

  public function get_entry_record($record_id) 	
	{
		$records['ai_sno']   	= $record_id;
		$this->db->select("ai_sno,ai_text, ai_active")->from($this->table_name)->where('ai_sno', $record_id);
		$query = $this->db->get();
		foreach ($query->result() as $row)
		{
			$records['ai_sno']   	= $row->ai_sno;
			$records['ai_text']   	= $row->ai_text;
			$records['ai_active'] 	= ($row->ai_active == 1) ? TRUE : FALSE;
			$records['db_error_msg']= "";
		}
		return $records;
	}

	public function delete_record($record_id)
	{
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);
		
		$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE ai_sno=?", array($record_id));
		
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
			
			log_admin_delete('16','Admin Info', $logged_data, 'Admin - Deleted admin info ID: ' . $record_id);
		}
		
		return array('status' => 1);
	}
  public function insert_record($id)
	{
		$_POST['fv']['ai_active']	   = $_POST['fv']['ai_active'] == 1 ? 1 : 0;

		$query=$this->db->insert($this->table_name, $_POST['fv']);
		$txtid = $this->db->insert_id();
		$_POST['fv']['txtid'] = $txtid;
		//$this->updateLogForInsertRec($_POST['fv']);

			// Log the add operation
			if ($query) {
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
				
				log_admin_add('16','Admin Info', $logged_data, 'Admin - Added new admin info ID: ' . $txtid);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
		    }

	public function update_record($id)
	{
		$oldRecord  = $this->get_entry_record($id);
		// $ai_text = array();
		$_POST['fv']['ai_sno']			= $id;
		$_POST['fv']['ai_active']	   	= $_POST['fv']['ai_active'];
		if($this->db->update($this->table_name, $_POST['fv'], array('ai_sno' => $id)))
		{
			if($_POST['fv']['ai_active'] == 1){
				$ai_text['text'] = array('mrq_status' => 1, 'ai_text' => $_POST['fv']['ai_text'], 'ai_sno' => $_POST['fv']['ai_sno'], 'ai_active' => $_POST['fv']['ai_active']);
				// print_r($ai_text);exit;
				$url = isset(Globals::$textupdate) ? Globals::$textupdate : '';
				if($url != '')
				{
					$field_string = http_build_query($ai_text);
					$curl_resp = curl_helper($url, $field_string);
				}
			}
			//$this->updateLogForUpdateRec($oldRecord,$_POST['fv']);
			
			return array('status' => 1);
		}
		else
		{
			return array('status' => 0);
		}
    }
	function updateLogForInsertRec($record)
	{
		// print_r($record);exit;
		$updatedRecord = array();
		$updatedRecord['Text'] 		= $record['ai_text'];
		$updatedRecord['Text Active'] 	= $record['ai_active'];

		$records = json_encode($updatedRecord);
		$admin_id 		= $this->login_model->get_userid();
		$adminipaddress = $_SERVER['SERVER_ADDR'];
		$log_shortdesc 	= "New Text Added. Text Id: ".$record['txtid'];
		$logtype = 14;
		$logdatetime = date('Y-m-d H:i:s');
		$logupdatedata = date('Y-m-d H:i:s');
		//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
	}
	function updateLogForUpdateRec($oldRecord, $newRecord)
	{
		$updatedRecord = array();
		if($oldRecord['ai_text'] != $newRecord['ai_text'])
		{
			$updatedRecord['New']['Text'] = $newRecord['ai_text'];
			$updatedRecord['Old']['Text'] = $oldRecord['ai_text'];
		}
		$status_old = isset($oldRecord['ai_active']) && $oldRecord['ai_active'] == 1 ? 1 : 0;
		$status_new = isset($newRecord['ai_active']) && $newRecord['ai_active'] == 1 ? 1 : 0;
		if($status_old != $status_new)
		{
			$updatedRecord['New']['Status'] = $status_new;
			$updatedRecord['Old']['Status'] = $status_old;
		}

		if(count($updatedRecord) > 0)
		{
			$records = json_encode($updatedRecord);
			$admin_id 		= $this->login_model->get_userid();
			$adminipaddress = $_SERVER['SERVER_ADDR'];
			$log_shortdesc 	= "Updated Text. Text Id: ".$newRecord['ai_sno'];
			$logtype = 14;
			$logdatetime = date('Y-m-d H:i:s');
			$logupdatedata = date('Y-m-d H:i:s');
			//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
		}
	}

}
?>