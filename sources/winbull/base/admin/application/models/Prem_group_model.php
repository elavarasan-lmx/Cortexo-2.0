<?php
class Prem_group_model extends CI_Model {
		var $table_name = 'dt_prem_group_master';						//Initialize table Name

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
		$this->db->select("prem_group_id,prem_group_name,CASE prem_group_active WHEN 1 THEN 'Active' WHEN 0 THEN 'Disabled' END AS prem_group_status", FALSE);
		$this->db->from('dt_prem_group_master');
		$result_set = $this->db->get();
		return $result_set;
    }

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['prem_group_id']		=	NULL;
		$_POST['fv']['prem_group_name']		=	NULL;
		$_POST['fv']['prem_group_active']	=	1;
		$_POST['fv']['prem_group_desc']		=	NULL;
		$_POST['fv']['db_error_msg']		=	"";

		$this->db->select('com.com_id,com_name');
		$this->db->from('dt_com_master AS com');
		$this->db->join('dt_area', 'ar_sno = com_area', 'left');
		$this->db->where('com.com_active', 1);
		$result_set = $this->db->get();
		$index=0;
		foreach ($result_set->result() as $row)
		{
			$prem[$index]['prem_id'] 		= $row->com_id;
			$prem[$index]['prem_name'] 		= $row->com_name;
			$prem[$index]['prem_sel_premium']= 0.0;
			$prem[$index]['prem_selretail_premium']= 0.0;
			$prem[$index]['prem_buy_premium']= 0.0;
			$prem[$index]['limit_sel_premium']= 0.0;
			$prem[$index]['limit_buy_premium']= 0.0;
			$prem[$index]['prem_comsell_active']= 0;
			$prem[$index]['prem_comselretail_active']= 0;
			$prem[$index]['prem_combuy_active'] = 0;
			$prem[$index]['prem_expirydate'] = Date('d-m-Y');
			$index++;
		}
		$_POST['fv']['prem_group_com']	=	$prem;
	}

	/*
	* Fetch record for entry when edit
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$record_id = (int)$record_id;
		$records['prem_group_id']   	= $record_id;
		
		$this->db->select('prem_group_id,prem_group_name,prem_group_desc,prem_group_active');
		$this->db->from('dt_prem_group_master');
		$this->db->where('prem_group_id', $record_id);
		$result_set = $this->db->get();
		foreach ($result_set->result() as $row)
		{
			$records['prem_group_id']   	= $row->prem_group_id;
			$records['prem_group_name']  	= $row->prem_group_name;
			$records['prem_group_active']	= $row->prem_group_active;
			$records['prem_group_desc'] 	= $row->prem_group_desc;
			$records['db_error_msg']		= "";
		}

		$this->db->select("com.com_id, com_name,ifnull(prem_grp.prem_sel_premium,0) as prem_sel_premium, ifnull(prem_grp.prem_selretail_premium,0) as prem_selretail_premium, ifnull(prem_grp.prem_buy_premium,0) as prem_buy_premium, ifnull(prem_grp.limit_sel_premium,0) as limit_sel_premium, ifnull(prem_grp.limit_buy_premium,0) as limit_buy_premium,prem_comsell_active,prem_combuy_active,prem_comselretail_active, date_format(prem_grp.prem_expirydate,'%d-%m-%Y') as prem_expirydate", FALSE);
		$this->db->from('dt_com_master AS com');
		$this->db->join('dt_prem_group_com AS prem_grp', 'prem_grp.prem_id=com.com_id AND prem_group_id = '.intval($record_id), 'left');
		$this->db->where('com.com_active', 1);
		$result_set = $this->db->get();
		$index=0;
		foreach ($result_set->result() as $row)
		{
			$prem[$index]['prem_id'] 			= $row->com_id;
			$prem[$index]['prem_name'] 			= $row->com_name;
			$prem[$index]['prem_sel_premium']   = $row->prem_sel_premium;
			$prem[$index]['prem_selretail_premium']   = $row->prem_selretail_premium;
			$prem[$index]['prem_buy_premium'] 	= $row->prem_buy_premium;
			$prem[$index]['limit_sel_premium']  = $row->limit_sel_premium;
			$prem[$index]['limit_buy_premium'] 	= $row->limit_buy_premium;
			$prem[$index]['prem_comsell_active']= $row->prem_comsell_active;
			$prem[$index]['prem_combuy_active'] = $row->prem_combuy_active;
			$prem[$index]['prem_comselretail_active'] = $row->prem_comselretail_active;
			$prem[$index]['prem_expirydate'] 	= $row->prem_expirydate;
			$index++;
		}

		    $records['prem_group_com']=$prem;

	      	return $records;
	}


	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	public function delete_record($record_id)
	{
		// 1. Protection for Default Group
		if ($record_id == 1) {
			return [
				"status"  => 0,
				"message" => "Cannot delete the default premium group"
			];
		}

		// 2. Check if premium group is currently applied to any trader
		$check_query = $this->db->query("SELECT cgitems_cusid FROM dt_customergroupitems WHERE cgitems_comgroupid = ?", array($record_id));
		if ($check_query->num_rows() > 0) {
			return [
				"status"  => 0,
				"message" => "The active premium group cannot be deleted while traders are currently assigned to it."
			];
		}

		// 3. Get the record for logging
		$old_record = $this->get_entry_record($record_id);

		if (!$old_record) {
			return [
				"status"  => 0,
				"message" => "Group not found"
			];
		}

		// 4. Delete Sub Records
		$this->delete_sub_record("dt_prem_group_com", $record_id);

		// 5. Delete Main Record
		$this->db->where('prem_group_id', $record_id);
		$this->db->where('prem_group_id !=', 1); // Extra safety
		$delete_main = $this->db->delete($this->table_name);

		if ($this->db->affected_rows() <= 0) {
			return [
				"status"  => 0,
				"message" => "Failed to delete premium group"
			];
		}

		// 6. Logging
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();

		$logged_data = [];
		foreach ($old_record as $field => $value) {
			if ($field == 'prem_group_com') continue;

			$label = $field_labels[$field] ?? $field;

			if (isset($value_labels[$field][$value])) {
				$value = $value_labels[$field][$value];
			}

			$logged_data[$label] = $value;
		}

		log_admin_delete('6', 'Premium Group', $logged_data, 'Admin - Deleted premium group: ' . $old_record['prem_group_name']);

		return [
			"status"  => 1,
			"message" => "Premium Group deleted successfully"
		];
	}
	public function delete_sub_record($table_name,$record_id)
	{
		$record_id = (int)$record_id;
		$this->db->where('prem_group_id', $record_id);
		$this->db->where('prem_group_id !=', 1);
		$delete_record = $this->db->delete($table_name);
		return $delete_record ? 1 : 0;
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
	public function insert_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		$fv = $this->input->post('fv', true);

		$prem_group['prem_group_name']   = $fv['prem_group_name'];
		$prem_group['prem_group_desc']   = $fv['prem_group_desc'];
		$prem_group['prem_group_active'] = $fv['prem_group_active'];
		$prem_group['updatetime']       = time();

		$insertStatus = $this->db->insert('dt_prem_group_master', $prem_group);

		if (!$insertStatus) {
			return ["status" => 0, "message" => "Failed to insert premium group"];
		}

		$prem_group_id = $this->db->insert_id();
		$prem_group_com = $fv['prem_group_com'];

		foreach ($prem_group_com as $prem) {
			$prem['prem_group_id'] = $prem_group_id;
			$prem['prem_buy_premium'] = isset($prem['prem_buy_premium']) ? $prem['prem_buy_premium'] : 0;
			$prem['prem_sel_premium'] = isset($prem['prem_sel_premium']) ? $prem['prem_sel_premium'] : 0;
			$prem['prem_selretail_premium'] = isset($prem['prem_selretail_premium']) ? $prem['prem_selretail_premium'] : 0;
			$prem['limit_sel_premium'] = (!isset($prem['limit_sel_premium'])) ? 0 : $prem['limit_sel_premium'];
			$prem['limit_buy_premium'] = (!isset($prem['limit_buy_premium'])) ? 0 : $prem['limit_buy_premium'];
			$prem['prem_expirydate'] = date("Y-m-d", strtotime($prem['prem_expirydate']));
			$this->db->insert('dt_prem_group_com', $prem);
		}

		// Trigger Socket Update
		$socketObj = new SocketUpdater();
		$socketObj->commodity_update();

		// Logging
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();

		$logged_data = [];
		foreach ($fv as $field => $value) {
			if ($field == 'prem_group_com') continue;

			$label = $field_labels[$field] ?? $field;

			if (isset($value_labels[$field][$value])) {
				$value = $value_labels[$field][$value];
			}

			$logged_data[$label] = $value;
		}

		// Get commodity details for logging
		$commodity_details = $this->get_premium_commodity_details($fv);
		$combined_data = ['Premium Group Details' => $logged_data];
		if (!empty($commodity_details)) {
			$combined_data['Commodity Details'] = $commodity_details;
		}

		log_admin_add('6', 'Premium Group', $combined_data, 'Admin - Added new premium group: ' . $fv['prem_group_name']);

		return [
			"status"  => 1,
			"message" => "Premium Group added successfully"
		];
	}

	public function update_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		$old_record = $this->get_entry_record($id);
		$fv = $this->input->post('fv', true);

		$prem_group_id = $id;
		$prem_group['prem_group_name']   = $fv['prem_group_name'];
		$prem_group['prem_group_desc']   = $fv['prem_group_desc'];
		$prem_group['prem_group_active'] = $fv['prem_group_active'];
		$prem_group['updatetime']       = time();

		// Check if trying to inactivate the group while customers are assigned
		if ($prem_group['prem_group_active'] == 0 && $old_record['prem_group_active'] == 1) {
			$check_query = $this->db->query("SELECT COUNT(*) as count FROM dt_customergroupitems WHERE cgitems_comgroupid = ?", array($prem_group_id));
			$result = $check_query->row();
			
			if ($result->count > 0) {
				return [
					"status"  => 0,
					"message" => "Cannot inactivate this premium group while " . $result->count . " trader(s) are currently assigned to it."
				];
			}
		}

		$this->db->where('prem_group_id', $prem_group_id);
		$status = $this->db->update('dt_prem_group_master', $prem_group);

		// Synchronize with rpanel
		$this->db->update('dt_r_panel', array('userupdatetime' => $prem_group['updatetime']), array('id' => 1));

		// Re-map commodities
		$this->db->where('prem_group_id', $prem_group_id);
		$this->db->delete('dt_prem_group_com');

		$prem_group_com = $fv['prem_group_com'];
		$total_limits_cancelled = 0;

		foreach ($prem_group_com as $prem) {
			$prem['prem_group_id'] = $prem_group_id;
			$prem['prem_buy_premium'] = isset($prem['prem_buy_premium']) ? $prem['prem_buy_premium'] : 0;
			$prem['prem_sel_premium'] = isset($prem['prem_sel_premium']) ? $prem['prem_sel_premium'] : 0;
			$prem['prem_selretail_premium'] = isset($prem['prem_selretail_premium']) ? $prem['prem_selretail_premium'] : 0;
			$prem['limit_sel_premium'] = (!isset($prem['limit_sel_premium'])) ? 0 : $prem['limit_sel_premium'];
			$prem['limit_buy_premium'] = (!isset($prem['limit_buy_premium'])) ? 0 : $prem['limit_buy_premium'];
			$prem['prem_expirydate'] = date("Y-m-d", strtotime($prem['prem_expirydate']));
			$this->db->insert("dt_prem_group_com", $prem);

			// ─── BZ: Limit Order Guard — auto-cancel limits when sell/buy disabled ───
			if (isset($old_record['prem_group_com']) && is_array($old_record['prem_group_com'])) {
				foreach ($old_record['prem_group_com'] as $old_prem) {
					if ($old_prem['prem_id'] == $prem['prem_id']) {
						$new_sell = isset($prem['prem_comsell_active']) ? $prem['prem_comsell_active'] : 0;
						$new_buy  = isset($prem['prem_combuy_active']) ? $prem['prem_combuy_active'] : 0;

						// Sell disabled: cancel pending sell limit orders (book_type=0)
						if ($old_prem['prem_comsell_active'] == 1 && $new_sell == 0) {
							$this->load->model('Commodity_model');
							$cancelled = $this->Commodity_model->cancel_active_limit_orders($prem['prem_id'], 0);
							$total_limits_cancelled += $cancelled;
						}
						// Buy disabled: cancel pending buy limit orders (book_type=1)
						if ($old_prem['prem_combuy_active'] == 1 && $new_buy == 0) {
							$this->load->model('Commodity_model');
							$cancelled = $this->Commodity_model->cancel_active_limit_orders($prem['prem_id'], 1);
							$total_limits_cancelled += $cancelled;
						}
						break;
					}
				}
			}
		}

		// Update linked groups (bulk update feature)
		if ($this->input->post('selectGroup')) {
			foreach ($this->input->post('selectGroup') as $cgroup) {
				if ($cgroup != "-1" && $cgroup != $prem_group_id) {
					foreach ($prem_group_com as $prem) {
						$update_data = [
							'prem_buy_premium' => $prem['prem_buy_premium'],
							'prem_sel_premium' => $prem['prem_sel_premium'],
							'prem_selretail_premium' => $prem['prem_selretail_premium'],
							'limit_sel_premium' => $prem['limit_sel_premium'],
							'limit_buy_premium' => $prem['limit_buy_premium'],
							'prem_expirydate' => date("Y-m-d", strtotime($prem['prem_expirydate']))
						];
						$this->db->where(['prem_group_id' => $cgroup, 'prem_id' => $prem['prem_id']]);
						$this->db->update('dt_prem_group_com', $update_data);
					}
				}
			}
		}

		// Trigger Socket Update
		$socketObj = new SocketUpdater();
		$socketObj->commodity_update();

		// Selective logging
		$changed_data = get_changed_fields($old_record, $fv, array('prem_group_com'));
		$commodity_changes = $this->get_premium_commodity_changes($old_record, $fv);

		$previous_data = [];
		$updated_data = [];

		if (!empty($changed_data)) {
			foreach ($changed_data as $field => $values) {
				$previous_data[$field] = $values['old'];
				$updated_data[$field] = $values['new'];
			}
		}

		if (!empty($commodity_changes)) {
			$previous_data['Commodity Changes'] = $commodity_changes;
			$updated_data['Commodity Changes'] = $commodity_changes;
		}

		if (!empty($previous_data) || !empty($updated_data)) {
			log_admin_edit('6', 'Premium Group', $previous_data, $updated_data, 'Admin - Updated premium group: ' . $fv['prem_group_name']);
		}

		$msg = "Premium Group updated successfully";
		if ($total_limits_cancelled > 0) {
			$msg .= ". {$total_limits_cancelled} pending limit order(s) were auto-cancelled.";
		}

		return [
			"status"  => 1,
			"message" => $msg
		];
	}
	function load_premiumgroups($record_id)
	{
		$record_id = ($record_id==NULL) ? -1 : $record_id;
		$strData="<option value='-1' ";
		$strData.=$record_id==-1 ? "selected='selected'" : "" ;
		$strData.=">- SELECT -</option>";
		$this->db->select('prem_group_id, prem_group_name');
		$this->db->from('dt_prem_group_master');
		$this->db->where('prem_group_active', 1);
		$resultset = $this->db->get();
		foreach ($resultset->result() as $row)
		{
		   $strData.= "<option value='" . htmlspecialchars($row->prem_group_id, ENT_QUOTES) . "' ";
		   $strData.=($record_id==$row->prem_group_id) ? "selected='selected'" : "" ;
		   $strData.=">" . htmlspecialchars($row->prem_group_name, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	function send_premium_notification($id)
	{
		$return_data = array();
		$resultset=$this->db->query("SELECT com.com_id, com_name,
									ifnull(prem_sel_premium, 0) as prem_sel_premium,
									ifnull(prem_selretail_premium, 0) as prem_selretail_premium, 
									ifnull(prem_buy_premium, 0) as prem_buy_premium, 
									ifnull(limit_sel_premium,0) as limit_sel_premium, ifnull(limit_buy_premium,0) as limit_buy_premium 
									FROM dt_com_master AS com 
									LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1 
									LEFT JOIN dt_prem_group_master as pgm ON pgm.prem_group_id = ?
									LEFT JOIN dt_prem_group_com as pgc ON pgc.prem_group_id = pgm.prem_group_id AND prem_id = com.com_id 
									WHERE (com_sel_active = 1 OR com_buy_active = 1 OR com_selretail_active = 1) AND (prem_sel_premium != 0 OR prem_buy_premium !=0 OR prem_selretail_premium !=0) 
									ORDER BY com_order_number", array($id));
		if($resultset->num_rows() >0){
			$notification_message = "";
			foreach($resultset->result() as $row){
				$notification_message .= $row->com_name ." : " . "Sell Discount = Rs ".$row->prem_sel_premium.". Buy Discount = Rs ".$row->prem_selretail_premium.". \n";
			}
			$premium_group_customers = $this->db->query("SELECT cgitems_cusid FROM dt_customergroupitems WHERE cgitems_comgroupid=?", array($id)); // P-SQL fix
			if($premium_group_customers->num_rows() > 0){
				$customers = array();
				foreach($premium_group_customers->result() as $prmcus){
					$customers[] = $prmcus->cgitems_cusid;
				}
				$notification_ids = array();
				if(!empty($customers)){
					$cus_ids = join("','",$customers);   
					$notification_ids_query = $this->db->where_in('device_user_id', $customers)->get('dt_user_device'); // P-SQL fix: safe IN clause
					
					/* foreach($customers as $cus){
						$notification_ids_query = $this->db->query("SELECT device_token  FROM dt_customergroupitems WHERE device_user_id='".$cus."' AND device_token IS NOT NULL");
						if($notification_ids_query->num_rows() > 0){
						}
					} */
					if($notification_ids_query->num_rows() > 0){
						foreach($notification_ids_query->result() as $notids){
							//$notification_ids[] = $notids->device_token;
							array_push($notification_ids,$notids->device_token);
						}
						$this->create_pushnotification($notification_message, array_unique($notification_ids));
						$return_data = array("message" => "Notification sent successfully", "show" => 1);
					}else{
						$return_data = array("message" => "There is no active commodity to send notification", "show" => 0);
					}
				}else{
					$return_data = array("message" => "There is no active commodity to send notification", "show" => 0);
				}
			}
		}else{
			$return_data = array("message" => "There is no active commodity to send notification", "show" => 0);
		}
		return $return_data;
	}
	function create_pushnotification($message, $ids){
		$content = array(
				"en" => $message
				);
		$hashes_array = array();
		$fields = array(
			'app_id' => $this->config->item('app_id'),
			'include_player_ids' => $ids,
			'data' => array(
				"nav" => "1"
			),
			'headings' => array("en" => 'Today Offer For You!'),
			'subtitle' => array("en" => $this->config->item('notification_subtitle')),
			'contents' => array("en" => $message),
			'web_buttons' => $hashes_array
		);
		$fields = json_encode($fields);
			
			
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
												   'Authorization: Basic '.$this->config->item('onesingalapi')));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HEADER, FALSE);
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

		$response = curl_exec($ch);
		curl_close($ch);
	}

	function Chk_Name_Exist($data = "")
	{
		$data = $this->db->escape_str($data);
		$this->db->where('prem_group_name', $data);
		$resultset = $this->db->get('dt_prem_group_master');
		return ($resultset->num_rows() > 0) ? 1 : 0;
	}
	
	/**
	 * Log premium group commodity details when adding a new premium group
	 * @param array $new_record - The new premium group record data
	 * @return void
	 */
	function log_premium_commodity_add($new_record)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$commodity_details = array();
		if (isset($new_record['prem_group_com']) && is_array($new_record['prem_group_com'])) {
			foreach ($new_record['prem_group_com'] as $commodity) {
				$commodity_info = array();
				foreach ($commodity as $key => $val) {
					$label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
					if (isset($value_labels[$key]) && isset($value_labels[$key][$val])) {
						$commodity_info[$label] = $value_labels[$key][$val];
					} else {
						$commodity_info[$label] = $val;
					}
				}
				$commodity_details[] = $commodity_info;
			}
		}
		
		if (!empty($commodity_details)) {
			$logged_data = array(
				'Premium Group Name' => $new_record['prem_group_name'],
				'Commodity Details' => $commodity_details
			);
			
			log_admin_add('6','Premium Group - Commodities', $logged_data, 'Admin - Added commodity details to premium group: ' . $new_record['prem_group_name']);
		}
	}
	
	/**
	 * Log premium group commodity changes when updating a premium group
	 * @param array $oldRecord - The old premium group record data
	 * @param array $newRecord - The new premium group record data
	 * @return void
	 */
	function log_premium_commodity_changes($oldRecord, $newRecord)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$commodity_changes = array();
		
		// Compare commodity data
		if (isset($newRecord['prem_group_com']) && is_array($newRecord['prem_group_com'])) {
			foreach($newRecord['prem_group_com'] as $prem) {
				$has_record = 0;
				$commodity_change = array();
				
				// Check if old record has commodity data
				if (isset($oldRecord['prem_group_com']) && is_array($oldRecord['prem_group_com'])) {
					foreach($oldRecord['prem_group_com'] as $prem_old) {
						if($prem['prem_id'] == $prem_old['prem_id']) {
							$has_record = 1;
							
							// Check for changes in commodity fields
							$prem_buy_active = isset($prem['prem_combuy_active']) && $prem['prem_combuy_active'] == 1 ? 1 : 0;
							$prem_sel_active = isset($prem['prem_comsell_active']) && $prem['prem_comsell_active'] == 1 ? 1 : 0;
							$prem_buy_premium = isset($prem['prem_buy_premium']) ? $prem['prem_buy_premium'] : 0;
							$prem_sel_premium = isset($prem['prem_sel_premium']) ? $prem['prem_sel_premium'] : 0;
							$prem_selretail_premium = isset($prem['prem_selretail_premium']) ? $prem['prem_selretail_premium'] : 0;
							$limit_buy_premium = isset($prem['limit_buy_premium']) ? $prem['limit_buy_premium'] : 0;
							$limit_sel_premium = isset($prem['limit_sel_premium']) ? $prem['limit_sel_premium'] : 0;
							
							if($prem_buy_active != $prem_old['prem_combuy_active']) {
								$commodity_change['Buy Active'] = array(
									'old' => isset($value_labels['prem_combuy_active'][$prem_old['prem_combuy_active']]) ? $value_labels['prem_combuy_active'][$prem_old['prem_combuy_active']] : $prem_old['prem_combuy_active'],
									'new' => isset($value_labels['prem_combuy_active'][$prem_buy_active]) ? $value_labels['prem_combuy_active'][$prem_buy_active] : $prem_buy_active
								);
							}
							
							if($prem_sel_active != $prem_old['prem_comsell_active']) {
								$commodity_change['Sell Active'] = array(
									'old' => isset($value_labels['prem_comsell_active'][$prem_old['prem_comsell_active']]) ? $value_labels['prem_comsell_active'][$prem_old['prem_comsell_active']] : $prem_old['prem_comsell_active'],
									'new' => isset($value_labels['prem_comsell_active'][$prem_sel_active]) ? $value_labels['prem_comsell_active'][$prem_sel_active] : $prem_sel_active
								);
							}
							
							if($prem_buy_premium != $prem_old['prem_buy_premium']) {
								$commodity_change['Buy Discount'] = array(
									'old' => $prem_old['prem_buy_premium'],
									'new' => $prem_buy_premium
								);
							}
							
							if($prem_sel_premium != $prem_old['prem_sel_premium']) {
								$commodity_change['Sell Discount'] = array(
									'old' => $prem_old['prem_sel_premium'],
									'new' => $prem_sel_premium
								);
							}
							
							if($prem_selretail_premium != $prem_old['prem_selretail_premium']) {
								$commodity_change['Retail Sell Discount'] = array(
									'old' => $prem_old['prem_selretail_premium'],
									'new' => $prem_selretail_premium
								);
							}
							
							if($limit_buy_premium != $prem_old['limit_buy_premium']) {
								$commodity_change['Buy Discount Limit'] = array(
									'old' => $prem_old['limit_buy_premium'],
									'new' => $limit_buy_premium
								);
							}
							
							if($limit_sel_premium != $prem_old['limit_sel_premium']) {
								$commodity_change['Sell Discount Limit'] = array(
									'old' => $prem_old['limit_sel_premium'],
									'new' => $limit_sel_premium
								);
							}
							
							break;
						}
					}
				}
				
				// If it's a new commodity record
				if($has_record == 0) {
					$commodity_change['New Commodity'] = array();
					foreach ($prem as $key => $val) {
						$label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
						if (isset($value_labels[$key]) && isset($value_labels[$key][$val])) {
							$commodity_change['New Commodity'][$label] = $value_labels[$key][$val];
						} else {
							$commodity_change['New Commodity'][$label] = $val;
						}
					}
				}
				
				// Add commodity change to the list if there are changes
				if (!empty($commodity_change)) {
					// Get commodity name for better logging
					$commodity_name = 'Unknown Commodity';
					if (isset($prem['prem_name'])) {
						$commodity_name = $prem['prem_name'];
					} else if (isset($prem['prem_id'])) {
						// Try to get commodity name from database
						$prem_query = $this->db->query("SELECT com_name FROM dt_com_master WHERE com_id = ?", array((int)$prem['prem_id'])); // P-SQL fix
						if ($prem_query->num_rows() > 0) {
							$prem_row = $prem_query->row();
							$commodity_name = $prem_row->com_name;
						}
					}
					$commodity_changes[$commodity_name] = $commodity_change;
				}
			}
		}
		
		// Log commodity changes if any
		if (!empty($commodity_changes)) {
			$logged_data = array(
				'Premium Group Name' => $newRecord['prem_group_name'],
				'Commodity Changes' => $commodity_changes
			);
			
			log_admin_edit('6','Premium Group - Commodities', array(), $logged_data, 'Admin - Updated commodity details in premium group: ' . $newRecord['prem_group_name']);
		}
	}
	
	/**
	 * Get premium group commodity details when adding a new premium group
	 * @param array $new_record - The new premium group record data
	 * @return array - The commodity details
	 */
	function get_premium_commodity_details($new_record)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$commodity_details = array();
		if (isset($new_record['prem_group_com']) && is_array($new_record['prem_group_com'])) {
			foreach ($new_record['prem_group_com'] as $commodity) {
				$commodity_info = array();
				foreach ($commodity as $key => $val) {
					$label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
					if (isset($value_labels[$key]) && isset($value_labels[$key][$val])) {
						$commodity_info[$label] = $value_labels[$key][$val];
					} else {
						$commodity_info[$label] = $val;
					}
				}
				$commodity_details[] = $commodity_info;
			}
		}
		
		return $commodity_details;
	}
	
	/**
	 * Get premium group commodity changes when updating a premium group
	 * @param array $oldRecord - The old premium group record data
	 * @param array $newRecord - The new premium group record data
	 * @return array - The commodity changes
	 */
	function get_premium_commodity_changes($oldRecord, $newRecord)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$commodity_changes = array();
		
		// Compare commodity data
		if (isset($newRecord['prem_group_com']) && is_array($newRecord['prem_group_com'])) {
			foreach($newRecord['prem_group_com'] as $prem) {
				$has_record = 0;
				$commodity_change = array();
				
				// Check if old record has commodity data
				if (isset($oldRecord['prem_group_com']) && is_array($oldRecord['prem_group_com'])) {
					foreach($oldRecord['prem_group_com'] as $prem_old) {
						if($prem['prem_id'] == $prem_old['prem_id']) {
							$has_record = 1;
							
							// Check for changes in commodity fields
							$prem_buy_active = isset($prem['prem_combuy_active']) && $prem['prem_combuy_active'] == 1 ? 1 : 0;
							$prem_sel_active = isset($prem['prem_comsell_active']) && $prem['prem_comsell_active'] == 1 ? 1 : 0;
							$prem_buy_premium = isset($prem['prem_buy_premium']) ? $prem['prem_buy_premium'] : 0;
							$prem_sel_premium = isset($prem['prem_sel_premium']) ? $prem['prem_sel_premium'] : 0;
							$prem_selretail_premium = isset($prem['prem_selretail_premium']) ? $prem['prem_selretail_premium'] : 0;
							$limit_buy_premium = isset($prem['limit_buy_premium']) ? $prem['limit_buy_premium'] : 0;
							$limit_sel_premium = isset($prem['limit_sel_premium']) ? $prem['limit_sel_premium'] : 0;
							
							if($prem_buy_active != $prem_old['prem_combuy_active']) {
								$commodity_change['Buy Active'] = array(
									'old' => isset($value_labels['prem_combuy_active'][$prem_old['prem_combuy_active']]) ? $value_labels['prem_combuy_active'][$prem_old['prem_combuy_active']] : $prem_old['prem_combuy_active'],
									'new' => isset($value_labels['prem_combuy_active'][$prem_buy_active]) ? $value_labels['prem_combuy_active'][$prem_buy_active] : $prem_buy_active
								);
							}
							
							if($prem_sel_active != $prem_old['prem_comsell_active']) {
								$commodity_change['Sell Active'] = array(
									'old' => isset($value_labels['prem_comsell_active'][$prem_old['prem_comsell_active']]) ? $value_labels['prem_comsell_active'][$prem_old['prem_comsell_active']] : $prem_old['prem_comsell_active'],
									'new' => isset($value_labels['prem_comsell_active'][$prem_sel_active]) ? $value_labels['prem_comsell_active'][$prem_sel_active] : $prem_sel_active
								);
							}
							
							if($prem_buy_premium != $prem_old['prem_buy_premium']) {
								$commodity_change['Buy Discount'] = array(
									'old' => $prem_old['prem_buy_premium'],
									'new' => $prem_buy_premium
								);
							}
							
							if($prem_sel_premium != $prem_old['prem_sel_premium']) {
								$commodity_change['Sell Discount'] = array(
									'old' => $prem_old['prem_sel_premium'],
									'new' => $prem_sel_premium
								);
							}
							
							if($prem_selretail_premium != $prem_old['prem_selretail_premium']) {
								$commodity_change['Retail Sell Discount'] = array(
									'old' => $prem_old['prem_selretail_premium'],
									'new' => $prem_selretail_premium
								);
							}
							
							if($limit_buy_premium != $prem_old['limit_buy_premium']) {
								$commodity_change['Buy Discount Limit'] = array(
									'old' => $prem_old['limit_buy_premium'],
									'new' => $limit_buy_premium
								);
							}
							
							if($limit_sel_premium != $prem_old['limit_sel_premium']) {
								$commodity_change['Sell Discount Limit'] = array(
									'old' => $prem_old['limit_sel_premium'],
									'new' => $limit_sel_premium
								);
							}
							
							break;
						}
					}
				}
				
				// If it's a new commodity record
				if($has_record == 0) {
					$commodity_change['New Commodity'] = array();
					foreach ($prem as $key => $val) {
						$label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
						if (isset($value_labels[$key]) && isset($value_labels[$key][$val])) {
							$commodity_change['New Commodity'][$label] = $value_labels[$key][$val];
						} else {
							$commodity_change['New Commodity'][$label] = $val;
						}
					}
				}
				
				// Add commodity change to the list if there are changes
				if (!empty($commodity_change)) {
					// Get commodity name for better logging
					$commodity_name = 'Unknown Commodity';
					if (isset($prem['prem_name'])) {
						$commodity_name = $prem['prem_name'];
					} else if (isset($prem['prem_id'])) {
						// Try to get commodity name from database
						$prem_query = $this->db->query("SELECT com_name FROM dt_com_master WHERE com_id = ?", array((int)$prem['prem_id'])); // P-SQL fix
						if ($prem_query->num_rows() > 0) {
							$prem_row = $prem_query->row();
							$commodity_name = $prem_row->com_name;
						}
					}
					$commodity_changes[$commodity_name] = $commodity_change;
				}
			}
		}
		
		return $commodity_changes;
	}
	
}
?>