<?php
class Client_model extends CI_Model {
		var $table_name = 'dt_clients';
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
		$this->db->select('id_client, client, ratealert, highlow, status, code, baseurl, orderexeurl, name, onesignalid, onesignalapi, firebaseserverkey, smssenderid, limitexpireurl, tradeonoffurl, higlowalertsettings_gold_up, higlowalertsettings_gold_down, higlowalertsettings_silver_up, higlowalertsettings_silver_down, gold_contract, silver_contract, alertfor, bank_gold_contract, bank_silver_contract, exchange_rate, alert_from, alert_to');
		$this->db->from('dt_clients');
		$this->db->order_by('id_client', 'DESC');
		$query = $this->db->get();
		
		if($query->num_rows() == 0){
			$this->fetch_update_clients();
			$this->db->select('id_client, client, ratealert, highlow, status, code, baseurl, orderexeurl, name, onesignalid, onesignalapi, firebaseserverkey, smssenderid, limitexpireurl, tradeonoffurl, higlowalertsettings_gold_up, higlowalertsettings_gold_down, higlowalertsettings_silver_up, higlowalertsettings_silver_down, gold_contract, silver_contract, alertfor, bank_gold_contract, bank_silver_contract, exchange_rate, alert_from, alert_to');
			$this->db->from('dt_clients');
			$this->db->order_by('id_client', 'DESC');
			$query = $this->db->get();
		}
		return $query;
    }
	
	public function empty_record() 										//Fetch listing record
	{
		//id_client, client, ratealert, highlow, status, code, baseurl, orderexeurl, name, onesignalid, onesignalapi, firebaseserverkey, smssenderid, limitexpireurl, tradeonoffurl, higlowalertsettings_gold_up, higlowalertsettings_gold_down, higlowalertsettings_silver_up, higlowalertsettings_silver_down, gold_contract, silver_contract, alertfor, bank_gold_contract, bank_silver_contract, exchange_rate, alert_from, alert_to
		$_POST['fv']['id_client']					=	NULL;		
		$_POST['fv']['client']						=	NULL;
		$_POST['fv']['ratealert']					=	0;
		$_POST['fv']['highlow']						=	0;
		$_POST['fv']['status']						=	1;
		$_POST['fv']['code']						=	NULL;
		$_POST['fv']['baseurl']						=	NULL;
		$_POST['fv']['orderexeurl']					=	NULL;
		$_POST['fv']['name']						=	NULL;
		$_POST['fv']['onesignalid']					=	NULL;
		$_POST['fv']['onesignalapi']				=	NULL;
		$_POST['fv']['firebaseserverkey']			=	NULL;
		$_POST['fv']['smssenderid']					=	NULL;
		$_POST['fv']['limitexpireurl']				=	NULL;
		$_POST['fv']['tradeonoffurl']				=	NULL;
		$_POST['fv']['higlowalertsettings_gold_up']	=	100;
		$_POST['fv']['higlowalertsettings_gold_down']	=	100;
		$_POST['fv']['higlowalertsettings_silver_up']	=	150;
		$_POST['fv']['higlowalertsettings_silver_down']	=	150;
		$_POST['fv']['gold_contract']				=	NULL;
		$_POST['fv']['silver_contract']				=	NULL;
		$_POST['fv']['alertfor']					=	2;
		$_POST['fv']['bank_gold_contract']			=	NULL;
		$_POST['fv']['bank_silver_contract']		=	NULL;
		$_POST['fv']['exchange_rate']				=	"SPOT-INR";
		$_POST['fv']['alert_from']					=	"9:00";
		$_POST['fv']['alert_to']					=	"21:00";
		$_POST['fv']['requiredhighlowalert']		=	0;
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id)
	{ //Fetch entry record
		$record_id = (int)$record_id;
		$records['alert_to']   				= $record_id;
		//Build contents query
		$this->db->select('id_client, client, ratealert, highlow, status, code, baseurl, orderexeurl, name, onesignalid, onesignalapi, firebaseserverkey, smssenderid, limitexpireurl, tradeonoffurl, higlowalertsettings_gold_up, higlowalertsettings_gold_down, higlowalertsettings_silver_up, higlowalertsettings_silver_down, gold_contract, silver_contract, alertfor, bank_gold_contract, bank_silver_contract, exchange_rate, alert_from, alert_to, requiredhighlowalert');
		$this->db->from('dt_clients');
		$this->db->where('id_client', $record_id);
		$query = $this->db->get();
		foreach ($query->result() as $row)
		{
			$records['id_client']   			= $row->id_client;
			$records['client']   				= $row->client;
			$records['ratealert']   			= $row->ratealert;
			$records['highlow']   				= $row->highlow;
			$records['status']   				= $row->status;
			$records['code']   					= $row->code;
			$records['baseurl']   				= $row->baseurl;
			$records['orderexeurl']   			= $row->orderexeurl;
			$records['name']  		 			= $row->name;
			$records['onesignalid']   			= $row->onesignalid;
			$records['onesignalapi']   			= $row->onesignalapi;
			$records['firebaseserverkey']  		= $row->firebaseserverkey;
			$records['smssenderid']   			= $row->smssenderid;
			$records['limitexpireurl']   		= $row->limitexpireurl;
			$records['tradeonoffurl']   		= $row->tradeonoffurl;
			$records['higlowalertsettings_gold_up']	= $row->higlowalertsettings_gold_up;
			$records['higlowalertsettings_gold_down']  = $row->higlowalertsettings_gold_down;
			$records['higlowalertsettings_silver_up']   			= $row->higlowalertsettings_silver_up;
			$records['higlowalertsettings_silver_down']   			= $row->higlowalertsettings_silver_down;
			$records['gold_contract']   		= $row->gold_contract;
			$records['silver_contract']			= $row->silver_contract;
			$records['alertfor']  				= $row->alertfor;
			$records['bank_gold_contract']   	= $row->bank_gold_contract;
			$records['bank_silver_contract']   	= $row->bank_silver_contract;
			$records['exchange_rate']   		= $row->exchange_rate;
			$records['alert_from']				= $row->alert_from;
			$records['alert_to']				= $row->alert_to;
			$records['requiredhighlowalert']	= $row->requiredhighlowalert;
			$records['db_error_msg']			= "";
		}
		return $records;
	}
	
	public function fetch_update_clients()
	{
		$field_string = json_encode(array("client" => strtoupper(isset(Globals::$client) ? Globals::$client : '')));
		$url = isset(Globals::$clientdetails) ? Globals::$clientdetails : '';
		if($url != ""){
			$curl_resp = curlhttp_helper($url, $field_string);
		}
		$status = 0;
		if(!empty($curl_resp)){
			$client = json_decode($curl_resp);
			if(!empty($client)){
				//foreach($clients as $ckey => $client){		
					//var_dump($client);exit;
					$insert_array['client'] 	= $client->client;
					$insert_array['ratealert']  = $client->ratealert;
					$insert_array['highlow']  	= $client->highlow;
					$insert_array['status']  	= $client->status;
					$insert_array['code']  		= $client->code;
					$insert_array['baseurl']  	= $client->baseurl;
					$insert_array['orderexeurl']= $client->orderexeurl;
					$insert_array['name']		= $client->name;
					$insert_array['onesignalid']= $client->onesignalid;
					$insert_array['onesignalapi']= $client->onesignalapi;
					$insert_array['firebaseserverkey']= $client->firebaseserverkey;
					$insert_array['smssenderid']= $client->smssenderid;
					$insert_array['limitexpireurl']= $client->limitexpireurl;
					$insert_array['tradeonoffurl']= $client->tradeonoffurl;
					$insert_array['higlowalertsettings_gold_up']= $client->higlowalertsettings->gold_up;
					$insert_array['higlowalertsettings_gold_down']= $client->higlowalertsettings->gold_down;
					$insert_array['higlowalertsettings_silver_up']= $client->higlowalertsettings->silver_up;
					$insert_array['higlowalertsettings_silver_down']= $client->higlowalertsettings->silver_down;
					$insert_array['gold_contract']= $client->gold_contract;
					$insert_array['silver_contract']= $client->silver_contract;
					$insert_array['alertfor']= $client->alertfor;
					$insert_array['bank_gold_contract']= $client->bank_gold_contract;
					$insert_array['bank_silver_contract']= $client->bank_silver_contract;
					$insert_array['exchange_rate']= $client->exchange_rate;
					$insert_array['alert_from']= $client->alert_from;
					$insert_array['alert_to']= $client->alert_to;
					$insert_array['requiredhighlowalert']= $client->requiredhighlowalert;
					//var_dump($insert_array);exit;
					$this->db->insert("dt_clients", $insert_array);
					unset($insert_array);
					$status = 1;
				//}
			}
		}
		return $status;
    }
	
	public function delete_record($record_id) 
	{  
		$record_id = (int)$record_id;
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);
		
		$this->db->where('id_client', $record_id);
		$this->db->delete($this->table_name);		
		
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
			
			log_admin_delete('19','Client', $logged_data, 'Admin - Deleted client: ' . $old_record['client']);
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
		
		if($this->db->insert($this->table_name, $_POST['fv'])){
			// Log the add operation
			$_POST['fv']['higlowalertsettings'] = array('gold_up' => $_POST['fv']['higlowalertsettings_gold_up'], 'gold_down' => $_POST['fv']['higlowalertsettings_gold_down'],'silver_up' => $_POST['fv']['higlowalertsettings_silver_up'],'silver_down' => $_POST['fv']['higlowalertsettings_silver_down']);
			$field_string = json_encode($_POST['fv']);
			//echo $field_string;exit;
			$url = isset(Globals::$createclient) ? Globals::$createclient : '';
			if($url != '')
			{
				$curl_resp = curlhttp_helper($url, $field_string);
			}else{
				return array("error" => false ,"message" => "Client details created successfully.");
			}
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
				
				log_admin_add('19','Client', $logged_data, 'Admin - Added new client: ' . $_POST['fv']['client']);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
		} else {
			return array('status' => 0);
		}
	
    }
	public function update_record($id)
	{
		// Get the record before updating for logging purposes
		$old_record = $this->get_entry_record($id);
		
		//Update Data
		$_POST['fv']['id_client']	= $id;	
		if($this->db->update($this->table_name, $_POST['fv'], array('id_client' => $id))){
			$_POST['fv']['higlowalertsettings'] = array(
				'gold_up'      => $_POST['fv']['higlowalertsettings_gold_up'],
				'gold_down'    => $_POST['fv']['higlowalertsettings_gold_down'],
				'silver_up'    => $_POST['fv']['higlowalertsettings_silver_up'],
				'silver_down'  => $_POST['fv']['higlowalertsettings_silver_down']
			);
			$field_string = json_encode($_POST['fv']);
			// Use the settings update endpoint (not createclient)
			$url = isset(Globals::$settingsupdate) ? Globals::$settingsupdate : '';
			if($url != '') {
				$curl_resp = curlhttp_helper($url, $field_string);
			}
			// Return success based on local DB — remote API sync is best-effort
			return array('status' => 1, 'message' => 'Client details updated successfully.');
		} else {
			return array('status' => 0, 'message' => 'Client details update failed.');
		}
    }
	
	
	function load_clients()
	{
		$strData="<option value='-1' selected='selected'";
		$strData.=">- SELECT -</option>";
		$this->db->select('code, client, baseurl');
		$this->db->from('dt_clients');
		$this->db->where('status', 1);
		$resultset = $this->db->get();
		foreach ($resultset->result() as $row)
		{
		   $strData.= "<option value='" . htmlspecialchars($row->code, ENT_QUOTES) . "' data-baseurl='" . htmlspecialchars($row->baseurl, ENT_QUOTES) . "' ";
		   //$strData.=($record_id==$row->code) ? "selected='selected'" : "" ;
		   $strData.=">" . htmlspecialchars($row->client, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}

	function get_contracts()
	{
		$this->db->select('contract_id, contract_symbol, com_type');
		$this->db->from('dt_contractmaster');
		$resultset = $this->db->get();
		return $resultset->result_array();
	}
}
?>