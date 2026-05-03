<?php
class Contractmodel extends CI_Model
{
	var $table_name = 'dt_contractmaster';						//Initialize table Name

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->select('contract_id, aribitchart_status, com_type, contract_symbol, displayname, userpage_displayname')
			->select("IF(userpage_status = 0, 'Inactive', 'Active') as userpage_status")
			->select("IF(status = 0, 'Inactive', 'Active') as status")
			->from('dt_contractmaster')
			->order_by('contract_id', 'DESC')
			->get();
		return $query;
	}
	public function get_contractdata($params = "", $page = "all")
	{
		//print_r("babu");exit;
		$query = $this->db->query("SELECT * FROM dt_contractsymbol where status = 1");
		return $query;
	}
	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['contract_id']		=	NULL;
		$_POST['fv']['contract_symbol']	=	NULL;
		$_POST['fv']['displayname']		=	NULL;
		$_POST['fv']['ctype']			=	NULL;
		$_POST['fv']['com_type']			=	NULL;
		$_POST['fv']['displayorder']	=	NULL;
		$_POST['fv']['userpage_status']	=	NULL;
		$_POST['fv']['aribitchart_status']	=	NULL;
		$_POST['fv']['status']			=	NULL;
		$_POST['fv']['userpage_displayname'] =	NULL;
		$_POST['fv']['userpage_disp_order']	 =	NULL;
		$_POST['fv']['round_off'] 		=	NULL;
	}
	/*
	* Fetch record for entry when edit 
	*/
	public function get_entry_record($record_id)
	{
		$record_id = (int)$record_id;
		$query = $this->db->select('contract_id, aribitchart_status, com_type, contract_symbol, displayname, ctype, displayorder, status as rpanel_status, userpage_status, userpage_displayname, userpage_disp_order, round_off')
			->from($this->table_name)
			->where('contract_id', $record_id)
			->get();

		if ($query->num_rows() > 0) {
			$row = $query->row();
			return array(
				'contract_id' => $row->contract_id,
				'contract_symbol' => $row->contract_symbol,
				'displayname' => $row->displayname,
				'ctype' => $row->ctype,
				'com_type' => $row->com_type,
				'displayorder' => $row->displayorder,
				'userpage_status' => $row->userpage_status,
				'aribitchart_status' => $row->aribitchart_status,
				'userpage_displayname' => $row->userpage_displayname,
				'userpage_disp_order' => $row->userpage_disp_order,
				'round_off' => $row->round_off,
				'rpanel_status' => $row->rpanel_status,
				'db_error_msg' => ""
			);
		}
		return array();
	}
	public function enable_rateon($status)
	{
		$spl_char = array("&ldquo;", "&nbsp;", "&rdquo;", "&quot;", "\"", "\xE2\x80\x9C", "\xE2\x80\x9D");
		$_POST['fv']['rate_display'] = $status;
		$_POST['fv']['market_closed'] = 0;
		$rpanel_update_data = array();
		$rpanel_update_data = array('rate_display' => $_POST['fv']['rate_display'], 'lastupdatetime' => date('Y-m-d H:i:s'), 'updateon' => time(), 'userupdatetime' => time(), 'usercheckupdatetime' => time(), 'market_message' => str_replace($spl_char, "", $_POST["fv"]["market_closed"]));

		$this->db->update('dt_r_panel', $rpanel_update_data, array('id' => 1));
		$this->rpanelupdate();
	}
	public function enable_rateoff($status)
	{


		$spl_char = array("&ldquo;", "&nbsp;", "&rdquo;", "&quot;", "\"", "\xE2\x80\x9C", "\xE2\x80\x9D");
		$_POST['fv']['rate_display'] = $status;
		$_POST['fv']['market_closed'] = 0;
		$rpanel_update_data = array();
		$rpanel_update_data = array('rate_display' => $_POST['fv']['rate_display'], 'lastupdatetime' => date('Y-m-d H:i:s'), 'updateon' => time(), 'userupdatetime' => time(), 'usercheckupdatetime' => time(), 'market_message' => str_replace($spl_char, "", $_POST["fv"]["market_closed"]));

		$this->db->update('dt_r_panel', $rpanel_update_data, array('id' => 1));
		$this->rpanelupdate();
	}
	public function display_rpanel_data()
	{
		$rpanelquery = $this->db->query("SELECT id, rate_display, market_status, 
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime, 
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel");
		return $rpanelquery->result_array();
	}
	/**
	 * Remove record
	 * @param id
	 * @return boolean
	 */
	/* public function delete_record($record_id) 
	{
		//$delete_record = $this->db->query("DELETE FROM ".$this->table_name." WHERE adv_id=".$record_id);		
		//$status = $this->db->update($this->table_name, array('gal_status'=> '0'), array('gal_id' => $record_id));
		$this->db->query("DELETE FROM ".$this->table_name." WHERE gal_id=".$record_id);
		return TRUE;
	} */

	public function delete_record($record_id)
	{
		$record_id = (int)$record_id;
		$old_record = $this->get_entry_record($record_id);
		
		if (empty($old_record)) {
			return array('status' => 0, 'message' => 'Record not found.');
		}

		$result = $this->db->select('userpage_status, status')
			->from($this->table_name)
			->where('contract_id', $record_id)
			->get();

		if ($result->num_rows() > 0) {
			$row = $result->row();
			
			// Check which status is preventing deletion
			$errors = array();
			if ($row->userpage_status != 0) {
				$errors[] = 'User Page Status is Active';
			}
			if ($row->status != 0) {
				$errors[] = 'R-Panel Status is Active';
			}
			
			if (empty($errors)) {
				// Both statuses are inactive, proceed with deletion
				$deleted = $this->db->where('contract_id', $record_id)->delete($this->table_name);
				
				if ($deleted) {
					$this->load->helper('field_labels');
					$field_labels = get_field_labels();
					$value_labels = get_field_value_labels();

					$logged_data = array();
					foreach ($old_record as $field => $value) {
						$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
						if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
							$logged_data[$label] = $value_labels[$field][$value];
						} else {
							$logged_data[$label] = $value;
						}
					}
					log_admin_delete('6', 'Contract', $logged_data, 'Admin - Deleted contract: ' . $old_record['contract_symbol']);

					return array('status' => 1);
				} else {
					return array('status' => 0, 'message' => 'Failed to delete record from database.');
				}
			} else {
				// Return specific error message
				$error_msg = 'Cannot delete! Please set to Inactive: ' . implode(' and ', $errors);
				return array('status' => 0, 'type' => 'blocked', 'message' => $error_msg);
			}
		}
		return array('status' => 0, 'message' => 'Record not found.');
	}


	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return boolean
	 */
	public function insert_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		// Validate contract_symbol uniqueness
		$exists = $this->db->where('contract_symbol', $_POST['fv']['contract_symbol'])
			->get($this->table_name);
		if ($exists->num_rows() > 0) {
			return array('status' => 0, 'message' => 'Contract symbol already exists.');
		}

		$_POST['fv']['contract_id'] = $id;
		$contract_update = $this->db->insert($this->table_name, $_POST['fv']);
		$settings_update = $this->db->update("dt_generalsettings", array('lastupdate' => time()));
		
		if ($contract_update == 1 && $settings_update == 1 && $_POST['fv']['aribitchart_status'] == 1) {
			$this->clientUpdate($_POST['fv']);
		}
		
		if ($contract_update == 1) {
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$logged_data = array();
			foreach ($_POST['fv'] as $field => $value) {
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
					$logged_data[$label] = $value_labels[$field][$value];
				} else {
					$logged_data[$label] = $value;
				}
			}
			log_admin_add('6', 'Contract', $logged_data, 'Admin - Added new contract: ' . $_POST['fv']['contract_symbol']);
			return array('status' => 1);
		}
		return array('status' => 0, 'message' => 'Failed to insert record.');
	}

	public function update_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		$id = (int)$id;
		$oldRecord = $this->get_entry_record($id);
		
		if (empty($oldRecord)) {
			return array('status' => 0, 'message' => 'Record not found.');
		}

		// Check contract_symbol uniqueness (excluding current record)
		$exists = $this->db->where('contract_symbol', $_POST['fv']['contract_symbol'])
			->where('contract_id !=', $id)
			->get($this->table_name);
		if ($exists->num_rows() > 0) {
			return array('status' => 0, 'message' => 'Contract symbol already exists.');
		}

		$data = $this->input->post('fv');
		$data['contract_id'] = $id;

		$contract_update = $this->db->where('contract_id', $id)
			->update($this->table_name, $data);

		if ($this->db->affected_rows() > 0) {
			$changed_data = get_changed_fields($oldRecord, $_POST['fv']);

			$old_values = array();
			$new_values = array();

			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}

			if (!empty($changed_data)) {
				log_admin_edit('6', 'Contract', $old_values, $new_values, 'Admin - Updated contract: ' . $_POST['fv']['contract_symbol']);
			}
		}
		
		$settings_update = $this->db->update("dt_generalsettings", array('lastupdate' => time()));
		
		if ($contract_update == 1 && $settings_update == 1 && $_POST['fv']['aribitchart_status'] == 1) {
			$this->clientUpdate($_POST['fv']);
		}
		
		if ($contract_update == 1) {
			return array('status' => 1);
		}
		return array('status' => 0, 'message' => 'No changes detected.');
	}
	function rpanelupdate()
	{
		//Socket Update
		$socketObj = new SocketUpdater();
		$resp = $socketObj->rpanel_update();
		$resp = $socketObj->commodity_update();
	}
	function updateLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();
		$record = $newRecord['fv'];

		if ($oldRecord['contract_symbol'] != $record['contract_symbol']) {
			$updatedRecord['New']['contract_symbol'] = $record['contract_symbol'];
			$updatedRecord['Old']['contract_symbol'] = $oldRecord['contract_symbol'];
		}
		if ($oldRecord['displayname'] != $record['displayname']) {
			$updatedRecord['New']['displayname'] = $record['displayname'];
			$updatedRecord['Old']['displayname'] = $oldRecord['displayname'];
		}
		if ($oldRecord['ctype'] != $record['ctype']) {
			$updatedRecord['New']['ctype'] = $record['ctype'];
			$updatedRecord['Old']['ctype'] = $oldRecord['ctype'];
		}
		if ($oldRecord['displayorder'] != $record['displayorder']) {
			$updatedRecord['New']['displayorder'] = $record['displayorder'];
			$updatedRecord['Old']['displayorder'] = $oldRecord['displayorder'];
		}
		if ($oldRecord['userpage_displayname'] != $record['userpage_displayname']) {
			$updatedRecord['New']['userpage_displayname'] = $record['userpage_displayname'];
			$updatedRecord['Old']['userpage_displayname'] = $oldRecord['userpage_displayname'];
		}
		if ($oldRecord['userpage_disp_order'] != $record['userpage_disp_order']) {
			$updatedRecord['New']['userpage_disp_order'] = $record['userpage_disp_order'];
			$updatedRecord['Old']['userpage_disp_order'] = $oldRecord['userpage_disp_order'];
		}
		if ($oldRecord['status'] != $record['status']) {
			$updatedRecord['New']['status'] = $record['status'];
			$updatedRecord['Old']['status'] = $oldRecord['status'];
		}
		if ($oldRecord['userpage_status'] != $record['userpage_status']) {
			$updatedRecord['New']['userpage_status'] = $record['userpage_status'];
			$updatedRecord['Old']['userpage_status'] = $oldRecord['userpage_status'];
		}
		if ($oldRecord['round_off'] != $record['round_off']) {
			$updatedRecord['New']['round_off'] = $record['round_off'];
			$updatedRecord['Old']['round_off'] = $oldRecord['round_off'];
		}
		if ($oldRecord['aribitchart_status'] != $record['aribitchart_status']) {
			$updatedRecord['New']['aribitchart_status'] = $record['aribitchart_status'];
			$updatedRecord['Old']['aribitchart_status'] = $oldRecord['aribitchart_status'];
		}
		if ($oldRecord['com_type'] != $record['com_type']) {
			$updatedRecord['New']['com_type'] = $record['com_type'];
			$updatedRecord['Old']['com_type'] = $oldRecord['com_type'];
		}

		if (count($updatedRecord) > 0) {
			$ContractSymbol = array('contract_symbol' => $record['contract_symbol']);
			$updatedRecord = $ContractSymbol + $updatedRecord;
			$records = json_encode($updatedRecord);
			$admin_id 		= $this->login_model->get_userid();
			$adminipaddress = $_SERVER['SERVER_ADDR'];
			$log_shortdesc 	= "Updated Contract Master. Symbol: " . $record['contract_symbol'];
			$logtype = 6;
			$logdatetime = date('Y-m-d H:i:s');
			$logupdatedata = date('Y-m-d H:i:s');
			//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
		}
	}

	function clientUpdate($record)
	{
		$client = $this->get_client();
		if (count($client) == 1) {
			$client = $client[0];
			if ($record['com_type'] == 1) {
				$ClientTableUpdate = array(
					"gold_contract" => $record['contract_symbol']
				);
			} else if ($record['com_type'] == 2) {
				$ClientTableUpdate = array(
					"silver_contract" => $record['contract_symbol']
				);
			}
			$CTableStatus = $this->db->update("dt_clients", $ClientTableUpdate);
			if ($CTableStatus == 1) {
				$postData = array(
					"client" => $client['client'],
					"code" => $client['code'],
					"name" => $client['name'],
					"onesignalid" => $client['onesignalid'],
					"onesignalapi" => $client['onesignalapi'],
					"firebaseserverkey" => $client['firebaseserverkey'],
					"smssenderid" => $client['smssenderid'],
					"baseurl" => $client['baseurl'],
					"orderexeurl" => $client['orderexeurl'],
					"limitexpireurl" => $client['limitexpireurl'],
					"tradeonoffurl" => $client['tradeonoffurl'],
					"requiredhighlowalert" => $client['requiredhighlowalert'],
					"higlowalertsettings_gold_up" => $client['higlowalertsettings_gold_up'],
					"higlowalertsettings_gold_down" => $client['higlowalertsettings_gold_down'],
					"higlowalertsettings_silver_up" => $client['higlowalertsettings_silver_up'],
					"higlowalertsettings_silver_down" =>  $client['higlowalertsettings_silver_down'],
					"gold_contract" => $record['com_type'] == 1 ? $record['contract_symbol'] : $client['gold_contract'],
					"silver_contract" => $record['com_type'] == 2 ? $record['contract_symbol'] : $client['silver_contract'],
					"bank_gold_contract" => $client['bank_gold_contract'],
					"bank_silver_contract" => $client['bank_silver_contract'],
					"exchange_rate" => $client['exchange_rate'],
					"alertfor" => $client['alertfor'],
					"alert_from" => $client['alert_from'],
					"alert_to" => $client['alert_to'],
					"ratealert" => $client['ratealert'],
					"highlow" => $client['highlow'],
					"status" => $client['status'],
					"id_client" => $client['id_client'],
					"higlowalertsettings" => array(
						"gold_up" => $client['higlowalertsettings_gold_up'],
						"gold_down" => $client['higlowalertsettings_gold_down'],
						"silver_up" => $client['higlowalertsettings_silver_up'],
						"silver_down" => $client['higlowalertsettings_silver_down'],
					),
				);

				$field_string = json_encode($postData);
				//echo $field_string;exit;
				$url = isset(Globals::$createclient) ? Globals::$createclient : '';
				if ($url != '') {
					$curl_resp = curlhttp_helper($url, $field_string);
				}
			}
		}
	}

	function get_client()
	{
		$resultset = $this->db->query("SELECT 
										* 
									FROM dt_clients");
		$result = $resultset->result_array();
		return $result;
	}
}
