<?php
class Contractsymbolmodel extends CI_Model
{
	var $table_name = 'dt_contractsymbol';						//Initialize table Name

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->query("SELECT contract_id,contract_symbol,com_type,status FROM dt_contractsymbol WHERE status = 1 ORDER BY contract_id DESC");
		return $query;
	}
	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['contract_id']		=	NULL;
		$_POST['fv']['contract_symbol']	=	NULL;
		$_POST['fv']['com_type']	 	=	NULL;
		$_POST['fv']['status']			=	NULL;
	}
	/*
	* Fetch record for entry when edit 
	*/
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		try {
			$records['contract_id']	= (int)$record_id;
			//Build contents query with prepared statement

			$query = "SELECT contract_id,com_type,contract_symbol,status as contract_status FROM dt_contractsymbol WHERE contract_id = ?";
			$result_set = $this->db->query($query, [(int)$record_id]);

			foreach ($result_set->result() as $row) {
				$records['contract_id']   		= $row->contract_id;
				$records['contract_symbol']   	= $row->contract_symbol;
				$records['com_type']   			= $row->com_type;
				$records['contract_status']		= $row->contract_status;
				$records['db_error_msg']		= "";
			}
			return $records;
		} catch (Exception $e) {
			log_message('error', 'Get entry record failed: ' . $e->getMessage());
			return ['contract_id' => $record_id, 'db_error_msg' => 'Failed to load record'];
		}
	}
	/**
	 * Remove record with enhanced transaction handling and error management
	 * @param int $record_id
	 * @return array
	 */

	public function delete_record($record_id)
	{
		try {
			// Get old record for logging before delete
			$old_record = $this->get_entry_record($record_id);
			
			if (!$old_record || !isset($old_record['contract_id'])) {
				return ["status" => 0, "message" => "Record not found"];
			}

			// ─── BR-C001: Block delete if symbol is mapped to any Contract Master ───
			$mapped_count = $this->db
				->where('contract_symbol', $old_record['contract_symbol'])
				->count_all_results('dt_contractmaster');

			if ($mapped_count > 0) {
				return [
					"status"  => 0,
					"type"    => "blocked",
					"message" => "Cannot delete. Symbol '{$old_record['contract_symbol']}' is mapped to {$mapped_count} contract(s) in Contract Master. Please remove or reassign those contracts first."
				];
			}
			// ────────────────────────────────────────────────────────────────────────

			// Enhanced transaction handling
			$this->db->trans_start();

			// Delete main record with prepared statement
			$this->db->where('contract_id', (int)$record_id);
			$this->db->delete($this->table_name);

			if ($this->db->affected_rows() <= 0) {
				$this->db->trans_rollback();
				return ["status" => 0, "message" => "Failed to delete contract symbol"];
			}

			$this->db->trans_complete();

			if ($this->db->trans_status() === FALSE) {
				return ["status" => 0, "message" => "Transaction failed during deletion"];
			}

			// Logging
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$logged_data = [];
			foreach ($old_record as $field => $value) {
				$label = $field_labels[$field] ?? $field;
				if (isset($value_labels[$field][$value])) {
					$value = $value_labels[$field][$value];
				}
				$logged_data[$label] = $value;
			}

			log_admin_delete(
				'22',
				'Contract Symbol',
				$logged_data,
				'Admin - Deleted contract symbol: ' . $old_record['contract_symbol']
			);

			// SUCCESS RESPONSE
			return ["status" => 1, "message" => "Contract symbol deleted successfully"];

		} catch (Exception $e) {
			log_message('error', 'Delete contract symbol exception: ' . $e->getMessage());
			return ["status" => 0, "message" => "Delete failed: " . $e->getMessage()];
		}
	}


	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return boolean
	 */
	public function insert_record($id)
	{
		try {
			$data = $this->input->post('fv', true);
			$data['contract_id'] = $id;

			$this->db->trans_start();
			$this->db->insert($this->table_name, $data);
			$this->db->trans_complete();

			if ($this->db->trans_status() === FALSE) {
				return ['status' => 0, 'message' => 'Failed to insert contract symbol'];
			}

			// Enhanced logging
			if ($this->db->affected_rows() > 0) {
				$this->load->helper('field_labels');
				$field_labels = get_field_labels();
				$value_labels = get_field_value_labels();

				$logged_data = [];
				foreach ($data as $field => $value) {
					$label = $field_labels[$field] ?? $field;
					$logged_data[$label] = ($value_labels[$field][$value] ?? $value);
				}
				
				log_admin_add('22', 'Contract Symbol', $logged_data, 
					'Admin - Added new contract symbol: ' . $data['contract_symbol']);
				
				return ['status' => 1, 'message' => 'Contract symbol added successfully'];
			}
			
			return ['status' => 0, 'message' => 'No changes were made'];
			
		} catch (Exception $e) {
			log_message('error', 'Insert contract symbol failed: ' . $e->getMessage());
			return ['status' => 0, 'message' => 'Insert failed: ' . $e->getMessage()];
		}
	}

	public function update_record($id)
	{
		try {
			$old_record = $this->get_entry_record($id);
			if (!$old_record) {
				return ['status' => 0, 'message' => 'Record not found for update'];
			}

			$data = $this->input->post('fv', true);
			$data['contract_id'] = (int)$id;

			$this->db->trans_start();
			$this->db->where('contract_id', (int)$id)->update($this->table_name, $data);
			$this->db->trans_complete();

			if ($this->db->trans_status() === FALSE) {
				return ['status' => 0, 'message' => 'Database update failed'];
			}

			// If nothing changed
			if ($this->db->affected_rows() == 0) {
				return ['status' => 1, 'message' => 'No changes were made'];
			}

			// Affected rows > 0 → something modified
			$changed_data = get_changed_fields($old_record, $data);

			$old_values = [];
			$new_values = [];

			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}

			if (!empty($changed_data)) {
				log_admin_edit(
					'22',
					'Contract Symbol',
					$old_values,
					$new_values,
					'Admin - Updated contract symbol: ' . $data['contract_symbol']
				);

				return ['status' => 1, 'message' => 'Contract updated successfully'];
			}

			return ['status' => 0, 'message' => 'No fields changed'];
			
		} catch (Exception $e) {
			log_message('error', 'Update contract symbol failed: ' . $e->getMessage());
			return ['status' => 0, 'message' => 'Update failed: ' . $e->getMessage()];
		}
	}

	function get_contract_symbol_name($id) {
		try {
			$this->db->select('contract_symbol');
			$this->db->where('contract_id', (int)$id);
			$result = $this->db->get($this->table_name);
			
			if ($result->num_rows() > 0) {
				return $result->row()->contract_symbol;
			}
			return 'Unknown Contract Symbol';
		} catch (Exception $e) {
			log_message('error', 'Get contract symbol name failed: ' . $e->getMessage());
			return 'Unknown Contract Symbol';
		}
	}
	
	function Chk_Name_Exist($data = "")
	{
		try {
			$this->db->where('contract_symbol', $this->db->escape_str($data));
			$resultset = $this->db->get($this->table_name);
			return ($resultset->num_rows() > 0) ? 1 : 0;
		} catch (Exception $e) {
			log_message('error', 'Check name exist failed: ' . $e->getMessage());
			return 0;
		}
	}
}
