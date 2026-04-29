<?php
class Com_group_model extends CI_Model {
		var $table_name = 'dt_com_group_master';						//Initialize table Name

	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
		$this->load->helper('field_labels');
	}	
	function index()
	{
		
	}

	public function get_data($params = "" , $page = "all")
    {
		$query="SELECT com_group_id,com_group_name,CASE com_group_active WHEN 1 THEN 'Active' WHEN 0 THEN 'Disabled' END AS com_group_status FROM dt_com_group_master";
		$result_set=$this->db->query($query);
		return $result_set;
    }

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['com_group_id']		=	NULL;
		$_POST['fv']['com_group_name']		=	NULL;
		$_POST['fv']['com_group_active']	=	1;
		$_POST['fv']['com_group_desc']		=	NULL;
		$_POST['fv']['db_error_msg']		=	"";

		$query = "SELECT com.com_id,com_name,ar_name
				FROM dt_com_master AS com
				LEFT JOIN dt_area ON ar_sno = com_area
				WHERE com.com_active=1";
		$result_set = $this->db->query($query);
		$index=0;
		foreach ($result_set->result() as $row)
		{
			$com[$index]['com_id'] 			= $row->com_id;
			$com[$index]['com_name'] 		= $row->com_name;
			$com[$index]['com_area']		= $row->ar_name;
			$com[$index]['com_sel_active'] 	= 0;
			$com[$index]['com_buy_active'] 	= 0;
			$com[$index]['com_sel_trade'] 	= 0;
			$com[$index]['com_buy_trade'] 	= 0;
			$com[$index]['com_sel_premium'] = 0.0;
			$com[$index]['com_buy_premium'] = 0.0;
			$com[$index]['com_delverydays'] = 0.0;
			$com[$index]['com_premium_type']= 0;
			$index++;
		}
		$_POST['fv']['com_group_com']	=	$com;
	}

	/*
	* Fetch record for entry when edit
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records['com_group_id']   	= $record_id;
		//Build contents query

		/*
		$this->db->select("mrq_sno,mrq_text, mrq_active")->from($this->table_name)->where('mrq_sno', $record_id);
		$query = $this->db->get();
		*/
		$query="SELECT com_group_id,com_group_name,com_group_desc,com_group_active FROM dt_com_group_master WHERE com_group_id=?";

		//echo $query;

		$result_set=$this->db->query($query, array($record_id));
		foreach ($result_set->result() as $row)
		{
			$records['com_group_id']   	= $row->com_group_id;
			$records['com_group_name']  = $row->com_group_name;
			$records['com_group_active']= $row->com_group_active;
			$records['com_group_desc'] 	= $row->com_group_desc;
			$records['db_error_msg']	= "";
		}

		$query="SELECT com.com_id, com_name, ar.ar_name as com_area, ifnull(com_grp.com_sel_active,0) as com_sel_active,
				ifnull(com_grp.com_buy_active,0) as com_buy_active,ifnull(com_grp.com_sel_trade,0) as com_sel_trade, ifnull(com_grp.com_buy_trade,0) as com_buy_trade,ifnull(com_grp.com_sel_premium,0) as com_sel_premium,
				ifnull(com_grp.com_buy_premium,0) as com_buy_premium,ifnull(com_grp.com_delverydays,0) as com_delverydays,
				ifnull(com_grp.com_premium_type,0) as com_premium_type
				FROM dt_com_master AS com
				LEFT JOIN dt_com_group_com AS com_grp ON com_grp.com_id=com.com_id AND com_group_id = ?
				left join dt_area as ar on com.com_area = ar.ar_sno
				WHERE com.com_active=1 ORDER BY com_order_number";
				//echo $query;exit;
		$result_set=$this->db->query($query, array($record_id));
		$index=0;
		foreach ($result_set->result() as $row)
		{
			$com[$index]['com_id'] 				= $row->com_id;
			$com[$index]['com_name'] 			= $row->com_name;
			$com[$index]['com_area']			= $row->com_area;
			$com[$index]['com_sel_active']   	= $row->com_sel_active;
			$com[$index]['com_buy_active'] 		= $row->com_buy_active;
			$com[$index]['com_sel_trade']   	= $row->com_sel_trade;
			$com[$index]['com_buy_trade'] 		= $row->com_buy_trade;
			$com[$index]['com_sel_premium']   	= $row->com_sel_premium;
			$com[$index]['com_buy_premium'] 	= $row->com_buy_premium;
			$com[$index]['com_delverydays'] 	= $row->com_delverydays;
			$com[$index]['com_premium_type']	= $row->com_premium_type;
			$index++;
		}

		    $records['com_group_com']=$com;

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
				"message" => "Cannot delete the default commodity group"
			];
		}

		// 2. Get the record for logging
		$old_record = $this->get_entry_record($record_id);

		if (!$old_record) {
			return [
				"status"  => 0,
				"message" => "Group not found"
			];
		}

		// 3. Delete Sub Records
		$this->delete_sub_record("dt_customergroupitems", $record_id);
		$this->db->where('com_group_id', $record_id);
		$this->db->where('com_group_id !=', 1); // Extra safety
		$delete_main = $this->db->delete($this->table_name);

		if ($this->db->affected_rows() <= 0) {
			return [
				"status"  => 0,
				"message" => "Failed to delete commodity group"
			];
		}

		// 4. Logging
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();

		$logged_data = [];
		foreach ($old_record as $field => $value) {
			if ($field == 'com_group_com') continue;

			$label = $field_labels[$field] ?? $field;

			if (isset($value_labels[$field][$value])) {
				$value = $value_labels[$field][$value];
			}

			$logged_data[$label] = $value;
		}

		log_admin_delete('1', 'Commodity Group', $logged_data, 'Admin - Deleted commodity group: ' . $old_record['com_group_name']);

		// Log nested commodities
		if (isset($old_record['com_group_com']) && is_array($old_record['com_group_com'])) {
			$this->log_commodity_delete($old_record);
		}

		return [
			"status"  => 1,
			"message" => "Commodity Group deleted successfully"
		];
	}
	
	function log_commodity_delete($old_record)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$commodity_details = array();
		if (isset($old_record['com_group_com']) && is_array($old_record['com_group_com'])) {
			foreach ($old_record['com_group_com'] as $commodity) {
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
				'Commodity Group Name' => $old_record['com_group_name'],
				'Commodity Details' => $commodity_details
			);
			
			log_admin_delete('1','Commodity Group - Commodities', $logged_data, 'Admin - Deleted commodity details from group: ' . $old_record['com_group_name']);
		}
	}
	public function delete_sub_record($table_name,$record_id)
	{
		$delete_record = $this->db->query("DELETE FROM ".$table_name." WHERE cgitems_comgroupid=? and cgitems_comgroupid<>4", array($record_id));
		return TRUE;
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
	public function insert_record($id)
	{
		$fv = $this->input->post('fv', true);

		$com_group['com_group_name']   = $fv['com_group_name'];
		$com_group['com_group_desc']   = $fv['com_group_desc'];
		$com_group['com_group_active'] = $fv['com_group_active'];
		$com_group['updatetime']       = time();

		$insertStatus = $this->db->insert('dt_com_group_master', $com_group);

		if (!$insertStatus) {
			return ["status" => 0, "message" => "Failed to insert commodity group"];
		}

		$com_group_id = $this->db->insert_id();
		$com_group_com = $fv['com_group_com'];

		foreach ($com_group_com as $com) {
			$com['com_group_id'] = $com_group_id;

			$com['com_sel_trade'] = isset($com['com_sel_trade']) ? 1 : 0;
			$com['com_buy_trade'] = isset($com['com_buy_trade']) ? 1 : 0;

			if (isset($com['com_sel_active'])) {
				$com['com_sel_active'] = 1;
				$com['com_sel_premium'] = ($com['com_sel_premium'] == NULL) ? 0 : $com['com_sel_premium'];
			} else {
				$com['com_sel_active'] = 0;
				$com['com_delverydays'] = 0;
			}

			if (isset($com['com_buy_active'])) {
				$com['com_buy_active'] = 1;
				$com['com_buy_premium'] = ($com['com_buy_premium'] == NULL) ? 0 : $com['com_buy_premium'];
			} else {
				$com['com_buy_active'] = 0;
				$com['com_delverydays'] = 0;
			}

			$com['com_buy_premium'] = isset($com['com_buy_premium']) ? $com['com_buy_premium'] : 0;
			$com['com_sel_premium'] = isset($com['com_sel_premium']) ? $com['com_sel_premium'] : 0;

			$this->db->insert('dt_com_group_com', $com);
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
			if ($field == 'com_group_com') continue;

			$label = $field_labels[$field] ?? $field;

			if (isset($value_labels[$field][$value])) {
				$value = $value_labels[$field][$value];
			}

			$logged_data[$label] = $value;
		}

		log_admin_add('1', 'Commodity Group', $logged_data, 'Admin - Added new commodity group: ' . $fv['com_group_name']);

		// Log commodity details separately
		if (isset($fv['com_group_com']) && is_array($fv['com_group_com'])) {
			$this->log_commodity_add($fv);
		}

		return [
			"status"  => 1,
			"message" => "Commodity Group added successfully"
		];
	}
	
	function log_commodity_add($new_record)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$commodity_details = array();
		if (isset($new_record['com_group_com']) && is_array($new_record['com_group_com'])) {
			foreach ($new_record['com_group_com'] as $commodity) {
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
				'Commodity Group Name' => $new_record['com_group_name'],
				'Commodity Details' => $commodity_details
			);
			
			log_admin_add('1','Commodity Group - Commodities', $logged_data, 'Admin - Added commodity details to group: ' . $new_record['com_group_name']);
		}
	}

	public function update_record($id)
	{
		$old_record = $this->get_entry_record($id);
		$fv = $this->input->post('fv', true);

		$com_group_id = $id;
		$com_group['com_group_name']   = $fv['com_group_name'];
		$com_group['com_group_desc']   = $fv['com_group_desc'];
		$com_group['com_group_active'] = $fv['com_group_active'];
		$com_group['updatetime']       = time();

		$this->db->where('com_group_id', $com_group_id);
		$status = $this->db->update('dt_com_group_master', $com_group);

		// Synchronize with rpanel
		$this->db->update('dt_r_panel', array('userupdatetime' => $com_group['updatetime']), array('id' => 1));

		// Re-map commodities
		$this->db->where('com_group_id', $com_group_id);
		$this->db->delete('dt_com_group_com');

		$com_group_com = $fv['com_group_com'];
		$total_limits_cancelled = 0;

		foreach ($com_group_com as $com) {
			$com['com_group_id'] = $com_group_id;
			$com['com_buy_premium'] = isset($com['com_buy_premium']) ? $com['com_buy_premium'] : 0;
			$com['com_sel_premium'] = isset($com['com_sel_premium']) ? $com['com_sel_premium'] : 0;
			$com['com_buy_trade']   = isset($com['com_buy_trade']) ? $com['com_buy_trade'] : 0;
			$com['com_sel_trade']   = isset($com['com_sel_trade']) ? $com['com_sel_trade'] : 0;
			$com['com_delverydays'] = isset($com['com_delverydays']) ? $com['com_delverydays'] : 0;
			$this->db->insert('dt_com_group_com', $com);

			// ─── BZ: Limit Order Guard — auto-cancel limits when sell/buy disabled ───
			if (isset($old_record['com_group_com']) && is_array($old_record['com_group_com'])) {
				foreach ($old_record['com_group_com'] as $old_com) {
					if ($old_com['com_id'] == $com['com_id']) {
						$new_sell = isset($com['com_sel_active']) ? $com['com_sel_active'] : 0;
						$new_buy  = isset($com['com_buy_active']) ? $com['com_buy_active'] : 0;

						// Sell disabled: cancel pending sell limit orders (book_type=0)
						if ($old_com['com_sel_active'] == 1 && $new_sell == 0) {
							$this->load->model('Commodity_model');
							$cancelled = $this->Commodity_model->cancel_active_limit_orders($com['com_id'], 0);
							$total_limits_cancelled += $cancelled;
						}
						// Buy disabled: cancel pending buy limit orders (book_type=1)
						if ($old_com['com_buy_active'] == 1 && $new_buy == 0) {
							$this->load->model('Commodity_model');
							$cancelled = $this->Commodity_model->cancel_active_limit_orders($com['com_id'], 1);
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
				if ($cgroup != "-1" && $cgroup != $com_group_id) {
					foreach ($com_group_com as $com) {
						$update_data = [
							'com_buy_premium' => $com['com_buy_premium'],
							'com_sel_premium' => $com['com_sel_premium'],
							'com_buy_trade'   => $com['com_buy_trade'],
							'com_sel_trade'   => $com['com_sel_trade'],
							'com_delverydays' => $com['com_delverydays']
						];
						$this->db->where(['com_group_id' => $cgroup, 'com_id' => $com['com_id']]);
						$this->db->update('dt_com_group_com', $update_data);
					}
				}
			}
		}

		// Trigger Socket Update
		$socketObj = new SocketUpdater();
		$socketObj->commodity_update();

		// Selective logging
		$changed_data = get_changed_fields($old_record, $fv, array('com_group_com'));
		$commodity_changes = $this->get_commodity_changes($old_record, $fv);

		$previous_data = [];
		$updated_data = [];

		if (!empty($changed_data)) {
			foreach ($changed_data as $field => $values) {
				$previous_data[$field] = $values['old'];
				$updated_data[$field] = $values['new'];
			}
		}

		if (!empty($commodity_changes['previous_data']) || !empty($commodity_changes['updated_data'])) {
			if (!empty($commodity_changes['previous_data'])) {
				$previous_data['Commodity Changes'] = $commodity_changes['previous_data']['Commodity Changes'];
			}
			if (!empty($commodity_changes['updated_data'])) {
				$updated_data['Commodity Changes'] = $commodity_changes['updated_data']['Commodity Changes'];
			}
		}

		if (!empty($previous_data) || !empty($updated_data)) {
			log_admin_edit('5', 'Commodity Group', $previous_data, $updated_data, 'Admin - Updated commodity group: ' . $fv['com_group_name']);
		}

		$msg = "Commodity Group updated successfully";
		if ($total_limits_cancelled > 0) {
			$msg .= ". {$total_limits_cancelled} pending limit order(s) were auto-cancelled.";
		}

		return [
			"status"  => 1,
			"message" => $msg
		];
	}

	/**
	 * Get commodity changes when updating a commodity group
	 * @param array $oldRecord - The old commodity group record data
	 * @param array $newRecord - The new commodity group record data
	 * @return array - The commodity changes with separate previous and updated data
	 */
	function get_commodity_changes($oldRecord, $newRecord)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$previous_data = array();
		$updated_data = array();
		
		// Add commodity group ID and name to both previous and updated data
		if (isset($newRecord['com_group_id'])) {
			$previous_data['Commodity Group ID'] = $newRecord['com_group_id'];
			$updated_data['Commodity Group ID'] = $newRecord['com_group_id'];
		}
		
		if (isset($newRecord['com_group_name'])) {
			$previous_data['Commodity Group Name'] = $newRecord['com_group_name'];
			$updated_data['Commodity Group Name'] = $newRecord['com_group_name'];
		} else if (isset($oldRecord['com_group_name'])) {
			$previous_data['Commodity Group Name'] = $oldRecord['com_group_name'];
			$updated_data['Commodity Group Name'] = $oldRecord['com_group_name'];
		}
		
		// Compare commodity data
		if (isset($newRecord['com_group_com']) && is_array($newRecord['com_group_com'])) {
			foreach($newRecord['com_group_com'] as $com) {
				$has_record = 0;
				
				// Check if old record has commodity data in the expected format
				if (isset($oldRecord['com_group_com']) && is_array($oldRecord['com_group_com'])) {
					// Check if it's indexed by commodity ID (old format) or sequential (new format)
					$keys = array_keys($oldRecord['com_group_com']);
					if (is_numeric($keys[0]) && isset($oldRecord['com_group_com'][$keys[0]]['com_id'])) {
						// New format - sequential array
						foreach($oldRecord['com_group_com'] as $com_old) {
							if($com['com_id'] == $com_old['com_id']) {
								$has_record = 1;
								
								// Check for changes in commodity fields
								$com_buy_active = isset($com['com_buy_active']) && $com['com_buy_active'] == 1 ? 1 : 0;
								$com_sel_active = isset($com['com_sel_active']) && $com['com_sel_active'] == 1 ? 1 : 0;
								$com_buy_premium = isset($com['com_buy_premium']) ? $com['com_buy_premium'] : 0;
								$com_sel_premium = isset($com['com_sel_premium']) ? $com['com_sel_premium'] : 0;
								$com_buy_trade = isset($com['com_buy_trade']) ? $com['com_buy_trade'] : 0;
								$com_sel_trade = isset($com['com_sel_trade']) ? $com['com_sel_trade'] : 0;
								$com_delverydays = isset($com['com_delverydays']) ? $com['com_delverydays'] : 0;
								
								// Get commodity name for better logging
								$commodity_name = 'Unknown Commodity';
								if (isset($com['com_name'])) {
									$commodity_name = $com['com_name'];
								} else if (isset($com['com_id'])) {
									// Try to get commodity name from database
									$com_query = $this->db->query("SELECT com_name FROM dt_com_master WHERE com_id = " . $com['com_id']);
									if ($com_query->num_rows() > 0) {
										$com_row = $com_query->row();
										$commodity_name = $com_row->com_name;
									}
								}
								
								if($com_buy_active != $com_old['com_buy_active']) {
									$previous_data['Commodity Changes'][$commodity_name]['Buy Active'] = isset($value_labels['com_buy_active'][$com_old['com_buy_active']]) ? $value_labels['com_buy_active'][$com_old['com_buy_active']] : $com_old['com_buy_active'];
									$updated_data['Commodity Changes'][$commodity_name]['Buy Active'] = isset($value_labels['com_buy_active'][$com_buy_active]) ? $value_labels['com_buy_active'][$com_buy_active] : $com_buy_active;
								}
								
								if($com_sel_active != $com_old['com_sel_active']) {
									$previous_data['Commodity Changes'][$commodity_name]['Sell Active'] = isset($value_labels['com_sel_active'][$com_old['com_sel_active']]) ? $value_labels['com_sel_active'][$com_old['com_sel_active']] : $com_old['com_sel_active'];
									$updated_data['Commodity Changes'][$commodity_name]['Sell Active'] = isset($value_labels['com_sel_active'][$com_sel_active]) ? $value_labels['com_sel_active'][$com_sel_active] : $com_sel_active;
								}
								
								if($com_buy_premium != $com_old['com_buy_premium']) {
									$previous_data['Commodity Changes'][$commodity_name]['Buy Premium'] = $com_old['com_buy_premium'];
									$updated_data['Commodity Changes'][$commodity_name]['Buy Premium'] = $com_buy_premium;
								}
								
								if($com_sel_premium != $com_old['com_sel_premium']) {
									$previous_data['Commodity Changes'][$commodity_name]['Sell Premium'] = $com_old['com_sel_premium'];
									$updated_data['Commodity Changes'][$commodity_name]['Sell Premium'] = $com_sel_premium;
								}
								
								if($com_buy_trade != $com_old['com_buy_trade']) {
									$previous_data['Commodity Changes'][$commodity_name]['Buy Trade'] = isset($value_labels['com_buy_trade'][$com_old['com_buy_trade']]) ? $value_labels['com_buy_trade'][$com_old['com_buy_trade']] : $com_old['com_buy_trade'];
									$updated_data['Commodity Changes'][$commodity_name]['Buy Trade'] = isset($value_labels['com_buy_trade'][$com_buy_trade]) ? $value_labels['com_buy_trade'][$com_buy_trade] : $com_buy_trade;
								}
								
								if($com_sel_trade != $com_old['com_sel_trade']) {
									$previous_data['Commodity Changes'][$commodity_name]['Sell Trade'] = isset($value_labels['com_sel_trade'][$com_old['com_sel_trade']]) ? $value_labels['com_sel_trade'][$com_old['com_sel_trade']] : $com_old['com_sel_trade'];
									$updated_data['Commodity Changes'][$commodity_name]['Sell Trade'] = isset($value_labels['com_sel_trade'][$com_sel_trade]) ? $value_labels['com_sel_trade'][$com_sel_trade] : $com_sel_trade;
								}
								
								if($com_delverydays != $com_old['com_delverydays']) {
									$previous_data['Commodity Changes'][$commodity_name]['Delivery Days'] = $com_old['com_delverydays'];
									$updated_data['Commodity Changes'][$commodity_name]['Delivery Days'] = $com_delverydays;
								}
								
								break;
							}
						}
					} else {
						// Old format - indexed by commodity ID
						foreach($oldRecord['com_group_com'] as $com_id => $com_old) {
							if($com['com_id'] == $com_id) {
								$has_record = 1;
								
								// Check for changes in commodity fields
								$com_buy_active = isset($com['com_buy_active']) && $com['com_buy_active'] == 1 ? 1 : 0;
								$com_sel_active = isset($com['com_sel_active']) && $com['com_sel_active'] == 1 ? 1 : 0;
								$com_buy_premium = isset($com['com_buy_premium']) ? $com['com_buy_premium'] : 0;
								$com_sel_premium = isset($com['com_sel_premium']) ? $com['com_sel_premium'] : 0;
								$com_buy_trade = isset($com['com_buy_trade']) ? $com['com_buy_trade'] : 0;
								$com_sel_trade = isset($com['com_sel_trade']) ? $com['com_sel_trade'] : 0;
								$com_delverydays = isset($com['com_delverydays']) ? $com['com_delverydays'] : 0;
								
								// Get commodity name for better logging
								$commodity_name = 'Unknown Commodity';
								if (isset($com['com_name'])) {
									$commodity_name = $com['com_name'];
								} else if (isset($com['com_id'])) {
									// Try to get commodity name from database
									$com_query = $this->db->query("SELECT com_name FROM dt_com_master WHERE com_id = " . $com['com_id']);
									if ($com_query->num_rows() > 0) {
										$com_row = $com_query->row();
										$commodity_name = $com_row->com_name;
									}
								}
								
								if($com_buy_active != $com_old['com_buy_active']) {
									$previous_data['Commodity Changes'][$commodity_name]['Buy Active'] = isset($value_labels['com_buy_active'][$com_old['com_buy_active']]) ? $value_labels['com_buy_active'][$com_old['com_buy_active']] : $com_old['com_buy_active'];
									$updated_data['Commodity Changes'][$commodity_name]['Buy Active'] = isset($value_labels['com_buy_active'][$com_buy_active]) ? $value_labels['com_buy_active'][$com_buy_active] : $com_buy_active;
								}
								
								if($com_sel_active != $com_old['com_sel_active']) {
									$previous_data['Commodity Changes'][$commodity_name]['Sell Active'] = isset($value_labels['com_sel_active'][$com_old['com_sel_active']]) ? $value_labels['com_sel_active'][$com_old['com_sel_active']] : $com_old['com_sel_active'];
									$updated_data['Commodity Changes'][$commodity_name]['Sell Active'] = isset($value_labels['com_sel_active'][$com_sel_active]) ? $value_labels['com_sel_active'][$com_sel_active] : $com_sel_active;
								}
								
								if($com_buy_premium != $com_old['com_buy_premium']) {
									$previous_data['Commodity Changes'][$commodity_name]['Buy Premium'] = $com_old['com_buy_premium'];
									$updated_data['Commodity Changes'][$commodity_name]['Buy Premium'] = $com_buy_premium;
								}
								
								if($com_sel_premium != $com_old['com_sel_premium']) {
									$previous_data['Commodity Changes'][$commodity_name]['Sell Premium'] = $com_old['com_sel_premium'];
									$updated_data['Commodity Changes'][$commodity_name]['Sell Premium'] = $com_sel_premium;
								}
								
								if($com_buy_trade != $com_old['com_buy_trade']) {
									$previous_data['Commodity Changes'][$commodity_name]['Buy Trade'] = isset($value_labels['com_buy_trade'][$com_old['com_buy_trade']]) ? $value_labels['com_buy_trade'][$com_old['com_buy_trade']] : $com_old['com_buy_trade'];
									$updated_data['Commodity Changes'][$commodity_name]['Buy Trade'] = isset($value_labels['com_buy_trade'][$com_buy_trade]) ? $value_labels['com_buy_trade'][$com_buy_trade] : $com_buy_trade;
								}
								
								if($com_sel_trade != $com_old['com_sel_trade']) {
									$previous_data['Commodity Changes'][$commodity_name]['Sell Trade'] = isset($value_labels['com_sel_trade'][$com_old['com_sel_trade']]) ? $value_labels['com_sel_trade'][$com_old['com_sel_trade']] : $com_old['com_sel_trade'];
									$updated_data['Commodity Changes'][$commodity_name]['Sell Trade'] = isset($value_labels['com_sel_trade'][$com_sel_trade]) ? $value_labels['com_sel_trade'][$com_sel_trade] : $com_sel_trade;
								}
								
								if($com_delverydays != $com_old['com_delverydays']) {
									$previous_data['Commodity Changes'][$commodity_name]['Delivery Days'] = $com_old['com_delverydays'];
									$updated_data['Commodity Changes'][$commodity_name]['Delivery Days'] = $com_delverydays;
								}
								
								break;
							}
						}
					}
				}
				
				// If it's a new commodity record
				if($has_record == 0) {
					// Get commodity name for better logging
					$commodity_name = 'Unknown Commodity';
					if (isset($com['com_name'])) {
						$commodity_name = $com['com_name'];
					} else if (isset($com['com_id'])) {
						// Try to get commodity name from database
						$com_query = $this->db->query("SELECT com_name FROM dt_com_master WHERE com_id = " . $com['com_id']);
						if ($com_query->num_rows() > 0) {
							$com_row = $com_query->row();
							$commodity_name = $com_row->com_name;
						}
					}
					
					// Add new commodity to updated data only
					foreach ($com as $key => $val) {
						// Skip com_group_id as it's already added
						if ($key == 'com_group_id') {
							continue;
						}
						
						$label = isset($field_labels[$key]) ? $field_labels[$key] : $key;
						if (isset($value_labels[$key]) && isset($value_labels[$key][$val])) {
							$updated_data['Commodity Changes'][$commodity_name]['New Commodity'][$label] = $value_labels[$key][$val];
						} else {
							$updated_data['Commodity Changes'][$commodity_name]['New Commodity'][$label] = $val;
						}
					}
				}
			}
		}
		
		return array('previous_data' => $previous_data, 'updated_data' => $updated_data);
	}
	
	function log_commodity_changes($oldRecord, $newRecord)
	{
		// Load field labels helper to map field names to user-friendly labels
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();
		
		$commodity_changes = array();
		
		// Compare commodity data
		if (isset($newRecord['com_group_com']) && is_array($newRecord['com_group_com'])) {
			foreach($newRecord['com_group_com'] as $com) {
				$has_record = 0;
				$commodity_change = array();
				
				// Check if old record has commodity data in the expected format
				$old_commodities = array();
				if (isset($oldRecord['com_group_com']) && is_array($oldRecord['com_group_com'])) {
					// Check if it's indexed by commodity ID (old format) or sequential (new format)
					$keys = array_keys($oldRecord['com_group_com']);
					if (is_numeric($keys[0]) && isset($oldRecord['com_group_com'][$keys[0]]['com_id'])) {
						// New format - sequential array
						foreach($oldRecord['com_group_com'] as $com_old) {
							if($com['com_id'] == $com_old['com_id']) {
								$has_record = 1;
								
								// Check for changes in commodity fields
								$com_buy_active = isset($com['com_buy_active']) && $com['com_buy_active'] == 1 ? 1 : 0;
								$com_sel_active = isset($com['com_sel_active']) && $com['com_sel_active'] == 1 ? 1 : 0;
								$com_buy_premium = isset($com['com_buy_premium']) ? $com['com_buy_premium'] : 0;
								$com_sel_premium = isset($com['com_sel_premium']) ? $com['com_sel_premium'] : 0;
								$com_buy_trade = isset($com['com_buy_trade']) ? $com['com_buy_trade'] : 0;
								$com_sel_trade = isset($com['com_sel_trade']) ? $com['com_sel_trade'] : 0;
								$has_record = 1;
								$arrValNew = array();
								$arrValOld = array();
								if($com_buy_active != $com_old['com_buy_active'])
								{
									$arrValNew['Buy Active'] = $com_buy_active;
									$arrValOld['Buy Active'] = $com_old['com_buy_active'];
								}
								if($com_sel_active != $com_old['com_sel_active'])
								{
									$arrValNew['Sell Active'] = $com_sel_active;
									$arrValOld['Sell Active'] = $com_old['com_sel_active'];
								}
								/* if($com['com_premium_type'] != $com_old['com_premium_type'])
								{
									$arrValNew['Premium Type'] = $com['com_premium_type'];
									$arrValOld['Premium Type'] = $com_old['com_premium_type'];
								} */
								if($com_buy_premium != $com_old['com_buy_premium'])
								{
									$arrValNew['Buy Premium'] = $com_buy_premium;
									$arrValOld['Buy Premium'] = $com_old['com_buy_premium'];
								}
								if($com_sel_premium != $com_old['com_sel_premium'])
								{
									$arrValNew['Sell Premium'] = $com_sel_premium;
									$arrValOld['Sell Premium'] = $com_old['com_sel_premium'];
								}
								if($com_buy_trade != $com_old['com_buy_trade'])
								{
									$arrValNew['Buy Trade'] = $com_buy_trade;
									$arrValOld['Buy Trade'] = $com_old['com_buy_trade'];
								}
								if($com_sel_trade != $com_old['com_sel_trade'])
								{
									$arrValNew['Sell Trade'] = $com_sel_trade;
									$arrValOld['Sell Trade'] = $com_old['com_sel_trade'];
								}
								if($com['com_delverydays'] != $com_old['com_delverydays'])
								{
									$arrValNew['Delivery Days'] = $com['com_delverydays'];
									$arrValOld['Delivery Days'] = $com_old['com_delverydays'];
								}
								if(count($arrValNew) > 0)
								{
									$updatedRecord['New']['GroupItems'][$com['com_id']] = $arrValNew;
									$updatedRecord['Old']['GroupItems'][$com['com_id']] = $arrValOld;
								}
							}
						}
					} else {
						// Old format - indexed by commodity ID
						foreach($oldRecord['com_group_com'] as $com_id => $com_old) {
							if($com['com_id'] == $com_id) {
								$has_record = 1;
								
								// Check for changes in commodity fields
								$com_buy_active = isset($com['com_buy_active']) && $com['com_buy_active'] == 1 ? 1 : 0;
								$com_sel_active = isset($com['com_sel_active']) && $com['com_sel_active'] == 1 ? 1 : 0;
								$com_buy_premium = isset($com['com_buy_premium']) ? $com['com_buy_premium'] : 0;
								$com_sel_premium = isset($com['com_sel_premium']) ? $com['com_sel_premium'] : 0;
								$com_buy_trade = isset($com['com_buy_trade']) ? $com['com_buy_trade'] : 0;
								$com_sel_trade = isset($com['com_sel_trade']) ? $com['com_sel_trade'] : 0;
								$com_delverydays = isset($com['com_delverydays']) ? $com['com_delverydays'] : 0;
								
								if($com_buy_active != $com_old['com_buy_active']) {
									$commodity_change['Buy Active'] = array(
										'old' => isset($value_labels['com_buy_active'][$com_old['com_buy_active']]) ? $value_labels['com_buy_active'][$com_old['com_buy_active']] : $com_old['com_buy_active'],
										'new' => isset($value_labels['com_buy_active'][$com_buy_active]) ? $value_labels['com_buy_active'][$com_buy_active] : $com_buy_active
									);
								}
								
								if($com_sel_active != $com_old['com_sel_active']) {
									$commodity_change['Sell Active'] = array(
										'old' => isset($value_labels['com_sel_active'][$com_old['com_sel_active']]) ? $value_labels['com_sel_active'][$com_old['com_sel_active']] : $com_old['com_sel_active'],
										'new' => isset($value_labels['com_sel_active'][$com_sel_active]) ? $value_labels['com_sel_active'][$com_sel_active] : $com_sel_active
									);
								}
								
								if($com_buy_premium != $com_old['com_buy_premium']) {
									$commodity_change['Buy Premium'] = array(
										'old' => $com_old['com_buy_premium'],
										'new' => $com_buy_premium
									);
								}
								
								if($com_sel_premium != $com_old['com_sel_premium']) {
									$commodity_change['Sell Premium'] = array(
										'old' => $com_old['com_sel_premium'],
										'new' => $com_sel_premium
									);
								}
								
								if($com_buy_trade != $com_old['com_buy_trade']) {
									$commodity_change['Buy Trade'] = array(
										'old' => isset($value_labels['com_buy_trade'][$com_old['com_buy_trade']]) ? $value_labels['com_buy_trade'][$com_old['com_buy_trade']] : $com_old['com_buy_trade'],
										'new' => isset($value_labels['com_buy_trade'][$com_buy_trade]) ? $value_labels['com_buy_trade'][$com_buy_trade] : $com_buy_trade
									);
								}
								
								if($com_sel_trade != $com_old['com_sel_trade']) {
									$commodity_change['Sell Trade'] = array(
										'old' => isset($value_labels['com_sel_trade'][$com_old['com_sel_trade']]) ? $value_labels['com_sel_trade'][$com_old['com_sel_trade']] : $com_old['com_sel_trade'],
										'new' => isset($value_labels['com_sel_trade'][$com_sel_trade]) ? $value_labels['com_sel_trade'][$com_sel_trade] : $com_sel_trade
									);
								}
								
								if($com_delverydays != $com_old['com_delverydays']) {
									$commodity_change['Delivery Days'] = array(
										'old' => $com_old['com_delverydays'],
										'new' => $com_delverydays
									);
								}
								
								break;
							}
						}
					}
				}
				
				// If it's a new commodity record
				if($has_record == 0) {
					$commodity_change['New Commodity'] = array();
					foreach ($com as $key => $val) {
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
					if (isset($com['com_name'])) {
						$commodity_name = $com['com_name'];
					} else if (isset($com['com_id'])) {
						// Try to get commodity name from database
						$com_query = $this->db->query("SELECT com_name FROM dt_com_master WHERE com_id = " . $com['com_id']);
						if ($com_query->num_rows() > 0) {
							$com_row = $com_query->row();
							$commodity_name = $com_row->com_name;
						}
					}
					$commodity_changes[$commodity_name] = $commodity_change;
				}
			}
		}
		
		// Log commodity changes if any
		if (!empty($commodity_changes)) {
			$logged_data = array(
				'Commodity Group Name' => $newRecord['com_group_name'],
				'Commodity Changes' => $commodity_changes
			);
			
			log_admin_edit('1','Commodity Group - Commodities', array(), $logged_data, 'Admin - Updated commodity details in group: ' . $newRecord['com_group_name']);
		}
	}

	function updateLog($oldRecord, $record)
	{
		$updatedRecord = array();
		$newRecord = $record['fv'];
		if($oldRecord['com_group_name'] != $newRecord['com_group_name'])
		{
			$updatedRecord['New']['Group Name'] = $newRecord['com_group_name'];
			$updatedRecord['Old']['Group Name'] = $oldRecord['com_group_name'];
		}
		if($oldRecord['com_group_desc'] != $newRecord['com_group_desc'])
		{
			$updatedRecord['New']['Desc'] = $newRecord['com_group_desc'];
			$updatedRecord['Old']['Desc'] = $oldRecord['com_group_desc'];
		}
		if($oldRecord['com_group_active'] != $newRecord['com_group_active'])
		{
			$updatedRecord['New']['Status'] = $newRecord['com_group_active'];
			$updatedRecord['Old']['Status'] = $oldRecord['com_group_active'];
		}

		foreach($newRecord['com_group_com'] as $com)
		{
			$has_record = 0;
			foreach($oldRecord['com_group_com'] as $com_old)
			{
				if($com['com_id'] == $com_old['com_id'])
				{
					$com_buy_active = isset($com['com_buy_active']) && $com['com_buy_active'] == 1 ? 1 : 0;
					$com_sel_active = isset($com['com_sel_active']) && $com['com_sel_active'] == 1 ? 1 : 0;
					$com_buy_premium = isset($com['com_buy_premium']) ? $com['com_buy_premium'] : 0;
					$com_sel_premium = isset($com['com_sel_premium']) ? $com['com_sel_premium'] : 0;
					$com_buy_trade = isset($com['com_buy_trade']) ? $com['com_buy_trade'] : 0;
					$com_sel_trade = isset($com['com_sel_trade']) ? $com['com_sel_trade'] : 0;
					$has_record = 1;
					$arrValNew = array();
					$arrValOld = array();
					if($com_buy_active != $com_old['com_buy_active'])
					{
						$arrValNew['Buy Active'] = $com_buy_active;
						$arrValOld['Buy Active'] = $com_old['com_buy_active'];
					}
					if($com_sel_active != $com_old['com_sel_active'])
					{
						$arrValNew['Sell Active'] = $com_sel_active;
						$arrValOld['Sell Active'] = $com_old['com_sel_active'];
					}
					/* if($com['com_premium_type'] != $com_old['com_premium_type'])
					{
						$arrValNew['Premium Type'] = $com['com_premium_type'];
						$arrValOld['Premium Type'] = $com_old['com_premium_type'];
					} */
					if($com_buy_premium != $com_old['com_buy_premium'])
					{
						$arrValNew['Buy Premium'] = $com_buy_premium;
						$arrValOld['Buy Premium'] = $com_old['com_buy_premium'];
					}
					if($com_sel_premium != $com_old['com_sel_premium'])
					{
						$arrValNew['Sell Premium'] = $com_sel_premium;
						$arrValOld['Sell Premium'] = $com_old['com_sel_premium'];
					}
					if($com_buy_trade != $com_old['com_buy_trade'])
					{
						$arrValNew['Buy Trade'] = $com_buy_trade;
						$arrValOld['Buy Trade'] = $com_old['com_buy_trade'];
					}
					if($com_sel_trade != $com_old['com_sel_trade'])
					{
						$arrValNew['Sell Trade'] = $com_sel_trade;
						$arrValOld['Sell Trade'] = $com_old['com_sel_trade'];
					}
					if($com['com_delverydays'] != $com_old['com_delverydays'])
					{
						$arrValNew['Delivery Days'] = $com['com_delverydays'];
						$arrValOld['Delivery Days'] = $com_old['com_delverydays'];
					}
					if(count($arrValNew) > 0)
					{
						$updatedRecord['New']['GroupItems'][$com['com_id']] = $arrValNew;
						$updatedRecord['Old']['GroupItems'][$com['com_id']] = $arrValOld;
					}
				}
			}
			if($has_record == 0)
			{
				$updatedRecord['New']['GroupItems'][$com['com_id']] = $com;
			}
		}
		if(count($updatedRecord) > 0)
		{
			$comGroupId = array('com_group_id' => $newRecord['com_group_id']);
			$updatedRecord = $comGroupId + $updatedRecord;
			$records = json_encode($updatedRecord);

			$admin_id 		= $this->login_model->get_userid();
			$adminipaddress = $_SERVER['SERVER_ADDR'];
			$log_shortdesc 	= "Updated Commodity Group. Name:".$newRecord['com_group_name'];
			$logtype = 1;
			$logdatetime = date('Y-m-d H:i:s');
			$logupdatedata = date('Y-m-d H:i:s');
			//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
		}
	}
}
?>