<?php
class Customergroup_model extends CI_Model
{
	var $table_name = 'dt_customergroup';						//Initialize table Name
    
	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}

	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->query("SELECT 
										cgrp_id, 
										DATE_FORMAT(cgrp_entrydate,'%d-%m-%Y') AS cgrp_entrydate, 
										DATE_FORMAT(cgrp_effectivedate,'%d-%m-%Y') AS cgrp_effectivedate
									FROM 
										dt_customergroup 
									ORDER BY 
										cgrp_id 
									DESC");
		return $query;
	}

	/*public function set_data()
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
	}		*/

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['cgrp_id']				=	NULL;
		$_POST['fv']['cgrp_entrydate']		=	date('d-m-Y');
		$_POST['fv']['cgrp_effectivedate']	=	date('d-m-Y');
		$_POST['fv']['db_error_msg']		=	"";
	}

	/*
	* Fetch record for entry when edit 
	*/
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records['cgrp_id']   	= $record_id;
		//Build contents query
		$this->db->select("cgrp_id, cgrp_entrydate, cgrp_effectivedate")->from($this->table_name)->where('cgrp_id', $record_id);
		$query = $this->db->get();
		foreach ($query->result() as $row) {
			$records['cgrp_id']   			= $row->cgrp_id;
			$records['cgrp_entrydate']   	= date('d-m-Y', strtotime($row->cgrp_entrydate));
			$records['cgrp_effectivedate'] 	= date('d-m-Y', strtotime($row->cgrp_effectivedate));
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
		
		$record_id = (int)$record_id;
		$delete_record = $this->db->where('cgrp_id', $record_id)
							 ->where('cgrp_id !=', 1)
							 ->delete($this->table_name);
		
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
			log_admin_delete('23','Customer Group', $logged_data, 'Admin - Deleted customer group ID: ' . $record_id);
			return array('status' => 1);
		}
		// cgrp_id=1 is protected — delete blocked by WHERE clause
		return array('status' => 0, 'message' => 'This group cannot be deleted (default group or not found).');
	}

	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return boolean
	 */
	public function insert_record($id)
	{
		$_POST['fv']['cgrp_entrydate']	  	 =	date('Y-m-d', strtotime($_POST['fv']['cgrp_entrydate']));
		// $_POST['fv']['cgrp_effectivedate']   =	date('Y-m-d', strtotime($_POST['fv']['cgrp_effectivedate']));
		$this->db->insert($this->table_name, $_POST['fv']);
		$insertid = $this->db->insert_id();
		
		// Log the add operation
		if ($insertid) {
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
			log_admin_add('23','Customer Group', $logged_data, 'Admin - Added new customer group ID: ' . $insertid);
			foreach ($_POST['cgrpitems']['cus_id'] as $key => $value) {
			$cgrpitems['cgitems_cgrpid']		=	$insertid;
			$cgrpitems['cgitems_cusid']			=	$_POST['cgrpitems']['cus_id'][$key];
			$cgrpitems['cgitems_comgroupid']	=	$_POST['cgrpitems']['cgitems_comgroupid'][$key];
			$this->db->insert("dt_customergroupitems", $cgrpitems);
			}
			return array('status' => 1);
		}
		
		
	}

	
	public function update_record($id, $type)
	{
		$old_record = $this->get_entry_record($id);
		// Get current customer group items for logging purposes
		$old_group_items = $this->load_customer($id)->result_array();
		

		
		//Update Data
		if ($type == 0) {
			// Get the record before updating for logging purposes
			
			$_POST['fv']['cgrp_id']	   = $id;
			$_POST['fv']['cgrp_entrydate']	  	 =	date('Y-m-d', strtotime($_POST['cgrp_entrydate']));
			// $_POST['fv']['cgrp_effectivedate']   =	date('Y-m-d', strtotime($_POST['fv']['cgrp_effectivedate']));			
			$this->db->update($this->table_name, $_POST['fv'], array('cgrp_id' => $id));
			
			// Create selective logging - only log changed values
			if ($this->db->affected_rows() > 0) {
				$changed_data = get_changed_fields($old_record, $_POST['fv']);
				
				// Separate old and new data for logging
				$old_values = array();
				$new_values = array();
				
				foreach ($changed_data as $field => $values) {
					$old_values[$field] = $values['old'];
					$new_values[$field] = $values['new'];
				}
				
				if (!empty($changed_data)) {
					log_admin_edit('23','Customer Group', $old_values, $new_values, 'Admin - Updated customer group ID: ' . $id);
				}
			}
			
			$id = (int)$id;
			$delete_record = $this->db->where('cgitems_cgrpid', $id)
									 ->delete('dt_customergroupitems');
			if ($delete_record)
				return json_encode(array("status" => "true", "message" => "record updated successfully"));
			else
				return json_encode(array("status" => "false", "message" => "record updation failed"));
		} else if ($type == 1) {
			// For type 1, we might not have fv data, so we need to get the current record
			if (!isset($_POST['fv'])) {
				$_POST['fv'] = $old_record;
			}
			
			// Get new customer group items for comparison, WITHOUT filtering out empty assignments
			// This is critical for proper change detection
			$new_group_items = array();
			if (isset($_POST['cusGroup'])) {
				foreach ($_POST['cusGroup'] as $key => $value) {
					// Include ALL items, even those with empty group assignments
					// This ensures proper change detection in the logging function
					$new_group_items[] = array(
						'cus_id' => $value['cus_id'],
						'cgitems_comgroupid' => isset($value['cgitems_comgroupid']) ? $value['cgitems_comgroupid'] : ''
					);
				}
			}
			

			
			// Log customer group item changes
			$this->log_customer_group_changes($id, $old_group_items, $new_group_items);
			
			$insert_data = '';
			if (isset($_POST['cusGroup'])) {
				foreach ($_POST['cusGroup'] as $key => $value) {
					// Only include items with actual group assignments for database insertion
					if (!empty($value['cgitems_comgroupid'])) {
						$insert_data = $insert_data . "(" . $id . "," . $value['cus_id'] . "," . $value['cgitems_comgroupid'] . "),";
					}
				}
				if (substr(trim($insert_data), -1) == ',')
					$insert_data = rtrim($insert_data, ',');
			}

			if ($insert_data != '') {
				// Create selective logging - only log changed values
				// if ($this->db->affected_rows() > 0) {
					$changed_data = get_changed_fields($old_record, $_POST['fv']);
					
					// Separate old and new data for logging
					$old_values = array();
					$new_values = array();
					
					foreach ($changed_data as $field => $values) {
						$old_values[$field] = $values['old'];
						$new_values[$field] = $values['new'];
					}
					
					// Log the edit operation with old values in log_pre_data and new values in log_update_data
					// if (!empty($changed_data)) {
					// 	log_admin_edit('23','Customer Group', $old_values, $new_values, 'Admin - Updated customer group ID: ' . $id);
					// }
				// }
				$insert_data = $this->db->escape_str($insert_data);
			if ($this->db->query("INSERT INTO dt_customergroupitems(cgitems_cgrpid, cgitems_cusid, cgitems_comgroupid) VALUES " . $insert_data))
					return json_encode(array("status" => "true", "message" => "record inserted successfully"));
				else
					return json_encode(array("status" => "false", "message" => "record insertion failed"));
			} else {
				// Even if no items to insert, we should still log that all items were removed
				$this->log_customer_group_changes($id, $old_group_items, array());
				return json_encode(array("status" => "true", "message" => "record updated successfully"));
			}

		}
	}
	//Load customer group details
	public function load_customer($record_id)
	{
		$cur_userid = $this->login_model->get_userid();
		$record_id = (int)$record_id;
		
		if ($cur_userid == 3) {
			$result_set = $this->db->select('cus_id, cus_name, cus_company_name, cgitems_comgroupid')
									 ->from('dt_customer')
									 ->join('dt_customergroupitems', 'cus_id = cgitems_cusid AND cgitems_cgrpid = ' . $record_id, 'left')
									 ->order_by('cus_id', 'ASC')
									 ->get();
		} else {
			$result_set = $this->db->select('cus_id, cus_name, cus_company_name, cgitems_comgroupid')
									 ->from('dt_customer')
									 ->join('dt_customergroupitems', 'cus_id = cgitems_cusid AND cgitems_cgrpid = ' . $record_id, 'left')
									 ->where('cus_id !=', 1)
									 ->order_by('cus_id', 'ASC')
									 ->get();
		}
		return $result_set;
	}
	//loading customer group in combobox details	
	public function load_customergroup($record_id)
	{

		$record_id = ($record_id == NULL) ? -1 : $record_id;

		$strData = "<option value='-1' ";
		$strData .= $record_id == -1 ? "selected='selected'" : "";
		$strData .= ">- SELECT -</option>";
		$resultset = $this->db->query("select prem_group_id,prem_group_name from dt_prem_group_master");
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->prem_group_id, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->prem_group_id) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->prem_group_name, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	public function get_maxgroupid()
	{
		$return_data = NULL;
		$resultset = $this->db->query("select max(cgrp_id) as cgrp_id from dt_customergroup");
		foreach ($resultset->result() as $row) {
			$return_data = $row->cgrp_id;
		}
		$resultset->free_result();
		return $return_data;
	}

	function updateLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();
		$record = $newRecord['fv'];
		$grpItems = $newRecord['cgrpitems'];

		$entry_date = $record['cgrp_entrydate'] != NULL ? date('d-m-Y', strtotime($record['cgrp_entrydate'])) : date('d-m-Y');
		if ($oldRecord['cgrp_entrydate'] != $entry_date) {
			$updatedRecord['New']['Entry Date'] = $entry_date;
			$updatedRecord['Old']['Entry Date'] = $oldRecord['cgrp_entrydate'];
		}
		$effective_date = $record['cgrp_effectivedate'] != NULL ? date('d-m-Y', strtotime($record['cgrp_effectivedate'])) : date('d-m-Y');
		if ($oldRecord['cgrp_effectivedate'] != $effective_date) {
			$updatedRecord['New']['Effective Date'] = $effective_date;
			$updatedRecord['Old']['Effective Date'] = $oldRecord['cgrp_effectivedate'];
		}

		foreach ($grpItems['cus_id'] as $key => $cusgrp) {
			$has_record = 0;
			foreach ($oldRecord['groupItems'] as $cusgrp_old) {
				if ($grpItems['cus_id'][$key] == $cusgrp_old['cus_id']) {
					$has_record = 1;
					$arrValNew = array();
					$arrValOld = array();

					if ($grpItems['cgitems_comgroupid'][$key] != $cusgrp_old['cgitems_comgroupid']) {
						$arrValNew['Cus Id'] = $grpItems['cus_id'][$key];
						$arrValOld['Cus Id'] = $cusgrp_old['cus_id'];

						$arrValNew['groupId'] = $grpItems['cgitems_comgroupid'][$key];
						$arrValOld['groupId'] = $cusgrp_old['cgitems_comgroupid'];
					}

					if (count($arrValNew) > 0) {
						$updatedRecord['New']['Group'] = $arrValNew;
						$updatedRecord['Old']['Group'] = $arrValOld;
					}
				}
			}
			if ($has_record == 0) {
				$updatedRecord['New']['Comm'][$grpItems['cgitems_comgroupid'][$key]] = $cusgrp;
			}
		}
		if (count($updatedRecord) > 0) {
			$records = json_encode($updatedRecord);

			$admin_id 		= $this->login_model->get_userid();
			$adminipaddress = $_SERVER['SERVER_ADDR'];
			$log_shortdesc 	= "Customer group updated.";
			$logtype = 9;
			$logdatetime = date('Y-m-d H:i:s');
			$logupdatedata = date('Y-m-d H:i:s');
			//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('" . $logdatetime . "','" . $logtype . "','" . $logupdatedata . "','" . $log_shortdesc . "','" . $records . "','NULL','NULL','NULL','" . $admin_id . "','" . $adminipaddress . "')");
		}
	}
	
	/**
	 * Log customer group item changes
	 * @param int $group_id - The customer group ID
	 * @param array $old_items - Old customer group items
	 * @param array $new_items - New customer group items
	 * @return void
	 */
	function log_customer_group_changes($group_id, $old_items, $new_items)
	{

		
		// Create maps for easier comparison
		// Old items contain full customer info
		$old_map = array();
		foreach ($old_items as $item) {
			// Include all items, even those with empty group assignments
			$old_map[$item['cus_id']] = $item;
		}
		
		// New items contain only customer ID and group ID
		$new_map = array();
		foreach ($new_items as $item) {
			// Include all items, even those with empty group assignments
			$new_map[$item['cus_id']] = $item;
		}
		

		
		// Track actual changes only
		$previous_data = array();
		$updated_data = array();
		
		// Process all customers to detect changes
		$all_customer_ids = array_unique(array_merge(
			array_keys($old_map),
			array_keys($new_map)
		));
		
		foreach ($all_customer_ids as $cus_id) {
			// Get old and new group IDs
			$old_item = isset($old_map[$cus_id]) ? $old_map[$cus_id] : null;
			$new_item = isset($new_map[$cus_id]) ? $new_map[$cus_id] : null;
			
			$old_group_id = $old_item ? (isset($old_item['cgitems_comgroupid']) ? $old_item['cgitems_comgroupid'] : null) : null;
			$new_group_id = $new_item ? (isset($new_item['cgitems_comgroupid']) ? $new_item['cgitems_comgroupid'] : null) : null;
			
			// Properly handle null/empty values
			$old_group_id = ($old_group_id === null || $old_group_id === '' || strtolower(strval($old_group_id)) === 'null') ? null : $old_group_id;
			$new_group_id = ($new_group_id === null || $new_group_id === '' || strtolower(strval($new_group_id)) === 'null') ? null : $new_group_id;
			

			
			// Check if group assignment changed
			if ($old_group_id != $new_group_id) {
				// Get customer name
				$customer_name = 'Unknown Customer';
				if ($old_item && isset($old_item['cus_name'])) {
					$customer_name = $old_item['cus_name'];
				} else if ($new_item) {
					// Try to get name from database if not in old item
					$customer_name = $this->get_customer_name($cus_id);
				}
				
				$old_group_name = $this->get_group_name($old_group_id);
				$new_group_name = $this->get_group_name($new_group_id);
				
				// Create previous and updated data entries
				$change_details = array(
					'Customer ID' => $cus_id,
					'Customer Name' => $customer_name,
					'Old Group Name' => $old_group_name,
					'New Group Name' => $new_group_name
				);
				
				$previous_data['Customer Changes'][] = array(
					'Customer ID' => $cus_id,
					'Customer Name' => $customer_name,
					'Group Name' => $old_group_name
				);
				
				$updated_data['Customer Changes'][] = array(
					'Customer ID' => $cus_id,
					'Customer Name' => $customer_name,
					'Group Name' => $new_group_name
				);
				

			}
		}
		
		// Only log if there are actual changes
		if (!empty($previous_data) || !empty($updated_data)) {
			// DEBUG: Log the final changes
			log_message('debug', 'Previous data to log: ' . json_encode($previous_data));
			log_message('debug', 'Updated data to log: ' . json_encode($updated_data));
			$description = 'Admin - Updated customer group - group ID: ' . $group_id;
			log_admin_edit('23', 'Customer Group', $previous_data, $updated_data, $description);
		} else {

		}
	}

	/**
	 * Get customer name by ID
	 * @param int $customer_id - The customer ID
	 * @return string - The customer name
	 */
	function get_customer_name($customer_id)
	{
		$query = $this->db->select('cus_name')->from('dt_customer')->where('cus_id', $customer_id)->get();
		if ($query->num_rows() > 0) {
			$row = $query->row();
			return $row->cus_name;
		}
		return 'Unknown Customer';
	}

	/**
	 * Get group name by ID
	 * @param int $group_id - The group ID
	 * @return string - The group name
	 */
	function get_group_name($group_id)
	{

		
		if (empty($group_id)) {
			return 'No Group';
		}
		
		$query = $this->db->select('prem_group_name')->from('dt_prem_group_master')->where('prem_group_id', $group_id)->get();
		if ($query->num_rows() > 0) {
			$row = $query->row();
			return $row->prem_group_name;
		}
		return 'Unknown Group';
	}
}