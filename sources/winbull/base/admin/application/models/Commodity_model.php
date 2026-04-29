<?php
class Commodity_model extends CI_Model
{
	var $table_name = 'dt_com_master';						//Initialize table Name

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	function get_generalsettings()
	{
		$this->db->select('admin_is_silver, admin_is_coin');
		$this->db->from('dt_generalsettings');
		$resultset = $this->db->get();
		
		$silver_flag = 0;
		$admin_is_coin = 0;
		if ($resultset->num_rows() > 0) {
			$silver_flag	= $resultset->row()->admin_is_silver;
			$admin_is_coin	= $resultset->row()->admin_is_coin;
		}
		return array('silver_flag' => $silver_flag, 'admin_is_coin' => $admin_is_coin);
	}
	public function get_data($params = "", $page = "all")
	{
		$this->db->select("com_id, com_name, rcom_disname , com_type, com_weight, com_display_purity, com_bar_quantity, com_order_number, CASE com_active WHEN 1 THEN 'Active' WHEN 0 THEN 'Disabled' END AS com_active, com_rest_wt, 0 as update_weight", FALSE);
		$this->db->from('dt_com_master');
		$this->db->join('dt_rpanelcommodities', 'rcom_id = com_type', 'left');
		$this->db->order_by('com_id', 'DESC');
		$query = $this->db->get();
		return $query;
	}

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['com_id']				=	NULL;
		$_POST['fv']['com_name']			=	NULL;
		$_POST['fv']['com_type']			=	0;
		$_POST['fv']['com_weight']			=	NULL;
		$_POST['fv']['com_other_charges']	=	0.0;
		$_POST['fv']['com_display_purity']	=	0;
		$_POST['fv']['com_correction_type']	=	0.0;
		$_POST['fv']['com_isregion']		=	0;
		$_POST['fv']['com_calpurity']		=	0;
		$_POST['fv']['com_tax']				=	0.0;
		$_POST['fv']['com_octroi']			=	0.0;
		$_POST['fv']['com_stamduty']		=	0.0;
		$_POST['fv']['com_active']			=	TRUE;
		$_POST['fv']['db_error_msg']		=	"";
		$_POST['fv']['com_order_number']	=	NULL;
		$_POST['fv']['com_area']			=	NULL;
		$_POST['fv']['com_is_coin']			= 	FALSE;
		$_POST['fv']['com_bar_quantity']    =   1;
		$_POST['fv']['com_margin_value']	=	0.0;
		$_POST['fv']['com_margin_type']		= 	0;
		$_POST['fv']['com_roundoff']		= 	0;
		$_POST['fv']['allowed_decimals']	= 	0;
		$_POST['fv']['com_bar_type']		= 	0;
		$_POST['fv']['bar_selection']		= 	FALSE;
		$_POST['fv']['com_bar_no']			= 	1;
	}

	/*
	* Fetch record for entry when edit
	*/
	public function load_area($record_id)
	{
		$record_id = ($record_id == NULL) ? -1 : $record_id;
		$strData = "<option value='-1' ";
		$strData .= $record_id == -1 ? "selected='selected'" : "";
		$strData .= ">- SELECT -</option>";
		$this->db->select('ar_sno, ar_name');
		$this->db->from('dt_area');
		$resultset = $this->db->get();
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->ar_sno, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->ar_sno) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->ar_name, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$record_id = (int)$record_id;
		$records['com_id']   	= $record_id;
		//Build contents query
		$this->db->select("com_id, com_name, com_type,com_rest_wt, com_weight, com_other_charges, com_display_purity, com_correction_type, com_isregion, com_calpurity, com_tax, com_octroi, com_stamduty, com_active, com_order_number, com_is_coin, com_roundoff, TRIM(com_bar_quantity)+0 AS com_bar_quantity, com_bar_type, com_margin_type, com_margin_value, allowed_decimals, bar_selection, com_bar_no", FALSE);
		$this->db->from('dt_com_master');
		$this->db->join('dt_rpanelcommodities', 'com_type = rcom_id', 'left');
		$this->db->where('com_id', $record_id);
		$result_set = $this->db->get();

		foreach ($result_set->result() as $row) {
			$records['com_id']   			= $row->com_id;
			$records['com_name']   			= $row->com_name;
			$records['com_type']   			= $row->com_type;
			$records['com_weight']   		= $row->com_weight;
			$records['com_other_charges']  	= $row->com_other_charges;
			$records['com_display_purity']	= $row->com_display_purity;
			$records['com_correction_type']	= $row->com_correction_type;
			$records['com_isregion']		= ($row->com_isregion == 1);
			$records['com_calpurity']		= $row->com_calpurity;
			$records['com_tax']				= $row->com_tax;
			$records['com_octroi']			= $row->com_octroi;
			$records['com_stamduty']		= $row->com_stamduty;
			$records['com_order_number']	= $row->com_order_number;
			$records['com_roundoff']		= $row->com_roundoff;
			$records['com_bar_quantity']	= $row->com_bar_quantity;
			$records['com_bar_type']		= $row->com_bar_type;
			$records['com_active'] 			= ($row->com_active == 1) ? TRUE : FALSE;
			$records['com_is_coin']			= ($row->com_is_coin == 1) ? TRUE : FALSE;
			$records['com_margin_type']   	= $row->com_margin_type;
			$records['com_margin_value']   	= $row->com_margin_value;
			$records['allowed_decimals']   	= $row->allowed_decimals;
			$records['bar_selection']   	= $row->bar_selection;
			$records['com_bar_no']   		= $row->com_bar_no;
			$records['com_rest_wt']   		= $row->com_rest_wt;
			$records['db_error_msg']		= "";
		}
		return $records;
	}


	public function delete_record($record_id)
	{
		try {
			// Get old record for logging before delete
			$old_record = $this->get_entry_record($record_id);

			if (!$old_record) {
				return ["status" => 0, "message" => "Record not found"];
			}

			// BZ-08: Check for active bookings before allowing delete
			$pending_count = $this->db
				->where('book_comid', (int)$record_id)
				->where_in('book_status', [0, 1, 2])
				->where('IFNULL(delete_status,0)', 0)
				->count_all_results('dt_booking');

			if ($pending_count > 0) {
				return [
					"status"  => 0,
					"blocked" => true,
					"message" => "Cannot delete '{$old_record['com_name']}' — it has {$pending_count} pending delivery booking(s). Please close all pending deliveries first."
				];
			}

			// Enhanced transaction handling
			$this->db->trans_start();

			// Delete sub records
			$this->delete_sub_record('dt_cus_commodity', 'cus_com_id', $record_id);

			// Delete main record
			$this->db->where('com_id', (int)$record_id);
			$this->db->delete($this->table_name);

			if ($this->db->affected_rows() <= 0) {
				$this->db->trans_rollback();
				return ["status" => 0, "message" => "Failed to delete commodity"];
			}

			// For Instant Update
			$this->db->where('com_id', (int)$record_id);
			$this->db->delete('dt_com_group_com');
			$this->updatecommoditygroup();

			$this->db->trans_complete();

			if ($this->db->trans_status() === FALSE) {
				return ["status" => 0, "message" => "Transaction failed during deletion"];
			}
		// --------------------------------------------------
		// LOGGING (Clean Logging)
		// --------------------------------------------------
		$this->load->helper('field_labels');
		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();

		$logged_data = [];

		foreach ($old_record as $field => $value) {

			// Field Label
			$label = $field_labels[$field] ?? $field;

			// Convert values to readable names if available
			if (isset($value_labels[$field][$value])) {
				$value = $value_labels[$field][$value];
			}

			$logged_data[$label] = $value;
		}

		log_admin_delete(
			'4',
			'Commodity',
			$logged_data,
			'Admin - Deleted commodity: ' . $old_record['com_name']
		);

			// SUCCESS RESPONSE (Used for TOASTR)
			return ["status" => 1, "message" => "Commodity deleted successfully"];

		} catch (Exception $e) {
			log_message('error', 'Delete record exception: ' . $e->getMessage());
			return ["status" => 0, "message" => "Delete failed: " . $e->getMessage()];
		}
	}


	/*
	* To delete sub record
	* @return
	*/
	public function delete_sub_record($table_name, $col_name, $record_id)
	{
		$record_id = $this->db->escape_str($record_id);
		$this->db->where($col_name, $record_id);
		$this->db->delete($table_name);
		return TRUE;
	}

	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return array
	 */

	public function insert_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		try {
			// Get Clean FV Data
			$fv = $this->input->post('fv', true);
			$add_status = $this->input->post('add_status');
			$enable_sell = $this->input->post('enable_commodity_sell');
			$enable_buy  = $this->input->post('enable_commodity_buy');

			// Force default values
			$fv['com_is_coin'] = isset($fv['com_is_coin']) ? $fv['com_is_coin'] : 0;

			// Enhanced transaction handling
			$this->db->trans_start();

			// Insert Commodity
			$insert = $this->db->insert($this->table_name, $fv);

			if (!$insert) {
				$this->db->trans_rollback();
				return ['status' => 0, 'message' => 'Failed to insert commodity'];
			}

			$insert_id = $this->db->insert_id();

		// ------------------------------------------
		// Insert default premium group record
		// ------------------------------------------
		$prem = [
			'prem_id'                => $insert_id,
			'prem_buy_premium'       => '0.00',
			'prem_sel_premium'       => '0.00',
			'limit_buy_premium'      => '0.00',
			'limit_sel_premium'      => '0.00',
			'prem_combuy_active'     => 1,
			'prem_comsell_active'    => 1,
			'prem_expirydate'        => date('Y-m-d'),
			'prem_group_id'          => 1,
			'prem_selretail_premium' => 0
		];

		$this->db->insert('dt_prem_group_com', $prem);

		// ------------------------------------------
		// Assign commodity to all customers (if enabled)
		// ------------------------------------------
		if ($add_status == 1) {

			$status_sell = ($enable_sell == 1) ? 1 : 0;
			$status_buy  = ($enable_buy  == 1) ? 1 : 0;

			$customers = $this->db->select('cus_id')
				->from('dt_customer')
				->where('cus_active', 1)
				->get()
				->result();

			foreach ($customers as $c) {

				$this->db->insert('dt_cus_commodity', [
					'cus_com_cus_id'      => $c->cus_id,
					'cus_com_id'          => $insert_id,
					'cus_com_smoq'        => 0,
					'cus_com_pmoq'        => 0,
					'cus_com_status_sell' => $status_sell,
					'cus_com_status_buy'  => $status_buy
				]);
			}
		}

			// Update group logic
			$this->updatecommoditygroup();

			$this->db->trans_complete();

			if ($this->db->trans_status() === FALSE) {
				return ['status' => 0, 'message' => 'Transaction failed during insertion'];
			}

		// ------------------------------------------
		// Logging (Clean version)
		// ------------------------------------------
		$this->load->helper('field_labels');

		$field_labels = get_field_labels();
		$value_labels = get_field_value_labels();

		$logged_data = [];

		foreach ($fv as $field => $value) {

			// Field label
			$label = $field_labels[$field] ?? $field;

			// Value label if exists
			if (isset($value_labels[$field][$value])) {
				$value = $value_labels[$field][$value];
			}

			$logged_data[$label] = $value;
		}

		log_admin_add(
			'4',
			'Commodity',
			$logged_data,
			'Admin - Added new commodity: ' . $fv['com_name']
		);

			// SUCCESS RESPONSE
			return ['status' => 1, 'id' => $insert_id, 'message' => 'Commodity added successfully'];

		} catch (Exception $e) {
			log_message('error', 'Insert record exception: ' . $e->getMessage());
			return ['status' => 0, 'message' => 'Insert failed: ' . $e->getMessage()];
		}
	}


	public function update_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		try {
			// Get previous record for logging comparison
			$oldRecord = $this->get_entry_record($id);
			if (!$oldRecord) {
				return ['status' => 0, 'message' => 'Record not found for update'];
			}

			// Always use filtered POST
			$fv = $this->input->post('fv', true);
			$add_status = $this->input->post('add_status');
			$enable_sell = $this->input->post('enable_commodity_sell');
			$enable_buy  = $this->input->post('enable_commodity_buy');

			// Ensure required fields exist
			$fv['com_id'] = (int)$id;
			$fv['com_is_coin'] = isset($fv['com_is_coin']) ? $fv['com_is_coin'] : 0;

			// ─── BZ: Limit Order Guard — cancel limits when deactivating commodity ───
			if (isset($fv['com_active']) && $fv['com_active'] == 0 && $oldRecord['com_active'] == 1) {
				$limit_check = $this->has_active_limit_orders($id);
				if ($limit_check['has_limits']) {
					$cancelled = $this->cancel_active_limit_orders($id);
					log_message('info', "Auto-cancelled {$cancelled} limit orders for commodity ID: {$id} on deactivation (edit form)");
				}
			}

			// Enhanced transaction handling
			$this->db->trans_start();

			// Update record
			$this->db->where('com_id', (int)$id);
			$this->db->update($this->table_name, $fv);

			if ($this->db->affected_rows() === FALSE) {
				$this->db->trans_rollback();
				return ['status' => 0, 'message' => 'Database update failed'];
			}

		// ---------------------------------------------------------
		// LOGGING — Only store changed values
		// ---------------------------------------------------------
		$changed_data = get_changed_fields($oldRecord, $fv);

		if (!empty($changed_data)) {

			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$mapped_old = [];
			$mapped_new = [];

			foreach ($changed_data as $field => $values) {
				$label = $field_labels[$field] ?? $field;

				$old_value = $values['old'];
				$new_value = $values['new'];

				// Replace numeric values with human labels if available
				if (isset($value_labels[$field])) {
					$old_value = $value_labels[$field][$old_value] ?? $old_value;
					$new_value = $value_labels[$field][$new_value] ?? $new_value;
				}

				$mapped_old[$label] = $old_value;
				$mapped_new[$label] = $new_value;
			}

			// Save log
			log_admin_edit(
				'4',
				'Commodity',
				$mapped_old,
				$mapped_new,
				'Admin - Updated commodity ID: ' . $id
			);
		}

		// ---------------------------------------------------------
		// UPDATE CUSTOMER-COMMODITY MAPPING
		// ---------------------------------------------------------

		if ($add_status == 1) {

			$cus_com_status_sell = ($enable_sell == 1) ? 1 : 0;
			$cus_com_status_buy  = ($enable_buy == 1) ? 1 : 0;

			// Fetch all active customers
			$customers = $this->db->select('cus_id')
				->from('dt_customer')
				->where('cus_active', 1)
				->get()
				->result();

			foreach ($customers as $c) {

				$exists = $this->db->select('cus_com_id')
					->from('dt_cus_commodity')
					->where(['cus_com_cus_id' => $c->cus_id, 'cus_com_id' => $id])
					->get()
					->num_rows();

				if ($exists) {

					// Update existing mapping
					$this->db->where(['cus_com_cus_id' => $c->cus_id, 'cus_com_id' => $id])
						->update('dt_cus_commodity', [
							'cus_com_status_sell' => $cus_com_status_sell,
							'cus_com_status_buy'  => $cus_com_status_buy
						]);
				} else {

					// Insert new mapping
					$this->db->insert('dt_cus_commodity', [
						'cus_com_cus_id'       => $c->cus_id,
						'cus_com_id'           => $id,
						'cus_com_smoq'         => 0,
						'cus_com_pmoq'         => 0,
						'cus_com_status_sell'  => $cus_com_status_sell,
						'cus_com_status_buy'   => $cus_com_status_buy
					]);
				}
			}
		}

		// For Instant Update
		if ($_POST['fv']['com_active'] == 0) {
			$this->db->where('com_id', $id);
			$this->db->delete('dt_com_group_com');
		}

			// Update commodity in commodity-group mapping
			$this->updatecommoditygroup();

			$this->db->trans_complete();

			if ($this->db->trans_status() === FALSE) {
				return ['status' => 0, 'message' => 'Transaction failed during update'];
			}

			return ['status' => 1, 'message' => 'Commodity updated successfully'];

		} catch (Exception $e) {
			log_message('error', 'Update record exception: ' . $e->getMessage());
			return ['status' => 0, 'message' => 'Update failed: ' . $e->getMessage()];
		}
	}


	/**
	 * Check if a commodity has pending limit orders
	 * @param int $com_id Commodity ID
	 * @param int|null $book_type Filter by type: 0=sell, 1=buy, null=all
	 * @return array ['count' => int, 'has_limits' => bool]
	 */
	public function has_active_limit_orders($com_id, $book_type = null)
	{
		$this->db->where('book_comid', (int)$com_id);
		$this->db->where('ordertype', 1);       // Limit order
		$this->db->where('orderstatus', 0);      // Pending
		$this->db->where('IFNULL(delete_status,0)', 0);
		if ($book_type !== null) {
			$this->db->where('book_type', (int)$book_type);
		}
		$count = $this->db->count_all_results('dt_booking');
		return ['count' => $count, 'has_limits' => $count > 0];
	}

	/**
	 * Cancel all pending limit orders for a commodity
	 * @param int $com_id Commodity ID
	 * @param int|null $book_type Filter by type: 0=sell, 1=buy, null=all
	 * @return int Number of cancelled orders
	 */
	public function cancel_active_limit_orders($com_id, $book_type = null)
	{
		$admin_id = $this->load->model('login_model') ? $this->login_model->get_userid() : 0;
		$adminip = isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '';

		$this->db->where('book_comid', (int)$com_id);
		$this->db->where('ordertype', 1);
		$this->db->where('orderstatus', 0);
		$this->db->where('IFNULL(delete_status,0)', 0);
		if ($book_type !== null) {
			$this->db->where('book_type', (int)$book_type);
		}
		$this->db->update('dt_booking', [
			'orderstatus'          => 3,
			'book_adminuser'       => $admin_id,
			'book_adminipaddress'  => $adminip
		]);

		$cancelled = $this->db->affected_rows();

		// Notify socket server to cancel rate alerts
		if ($cancelled > 0) {
			$cancel_url = trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
			$client = trim(isset(Globals::$client) ? Globals::$client : '');
			if ($cancel_url != '' && $client != '') {
				// Get all cancelled book_no values
				$this->db->select('book_no');
				$this->db->where('book_comid', (int)$com_id);
				$this->db->where('ordertype', 1);
				$this->db->where('orderstatus', 3);
				$this->db->where('book_adminuser', $admin_id);
				if ($book_type !== null) {
					$this->db->where('book_type', (int)$book_type);
				}
				$book_nos = array_column($this->db->get('dt_booking')->result_array(), 'book_no');
				if (!empty($book_nos)) {
					$requestdata = ['client' => $client, 'book_no' => $book_nos];
					curl_helper($cancel_url, http_build_query($requestdata));
				}
			}

			// Notify limit order page via socket
			$limit_url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
			if ($limit_url != '') {
				curl_helper($limit_url, http_build_query(['limit' => ['limitupdate' => 1, 'book_no' => '1']]));
			}
		}

		return $cancelled;
	}

	public function inline_update()
	{
		$postData = $this->input->post();

		if (!isset($postData['name']) || !isset($postData['value']) || !isset($postData['pk'])) {
			echo json_encode(['error' => 'Invalid request data']);
			return;
		}

		// Get old record data
		$this->db->where('com_id', $postData['pk']);
		$old_query = $this->db->get($this->table_name);
		$old_data = $old_query->row_array();

		$old_value = $old_data[$postData['name']] ?? null;
		$new_value = $postData['value'];

		// ⭐ DO NOT check duplicate if user entered the same value
		if ($old_value != $new_value && $postData['name'] == 'com_order_number') {
			// Duplicate check for com_order_number
			$this->db->where($postData['name'], $new_value);
			$this->db->where('com_id !=', $postData['pk']);
			$duplicate = $this->db->get($this->table_name)->num_rows();

			if ($duplicate > 0) {
				echo json_encode(['error' => 'Already Exists']);
				return;
			}
		} else if ($old_value != $new_value && $postData['name'] == 'com_name') {

			// Duplicate check Commodity Name
			$this->db->where($postData['name'], $new_value);
			$this->db->where('com_id !=', $postData['pk']);
			$duplicate = $this->db->get($this->table_name)->num_rows();

			if ($duplicate > 0) {
				echo json_encode(['error' => 'Commodity Name Alredy Exists']);
				return;
			}
		}

		// ─── BZ: Limit Order Guard — warn before deactivating commodity ───
		if ($postData['name'] == 'com_active' && $new_value == 0 && $old_value == 1) {
			$limit_check = $this->has_active_limit_orders($postData['pk']);
			if ($limit_check['has_limits']) {
				$force = isset($postData['force_cancel']) && $postData['force_cancel'] == 1;
				if (!$force) {
					// Return warning with limit count — frontend will show confirm dialog
					echo json_encode([
						'warning' => true,
						'limit_count' => $limit_check['count'],
						'message' => "Found {$limit_check['count']} active limit order(s). " . ($limit_check['count'] == 1 ? "This order will be cancelled. Do you want to cancel it and continue?" : "These orders will be cancelled. Do you want to cancel them and continue?")
					]);
					return;
				}
				// Admin confirmed — cancel all limits first
				$cancelled = $this->cancel_active_limit_orders($postData['pk']);
				log_message('info', "Auto-cancelled {$cancelled} limit orders for commodity ID: {$postData['pk']} on deactivation");
			}
		}

		// Prepare update data
		$data = array(
			$postData['name'] => $new_value
		);

		// Update record
		$this->db->where('com_id', $postData['pk']);
		if ($this->db->update($this->table_name, $data)) {

			// ─── Sync com_active to dt_com_group_com (mirrors update_record logic) ───
			// When commodity is deactivated via inline edit, remove it from the
			// commodity-group mapping so the socket update sends correct data
			// to web and mobile apps.
			if ($postData['name'] == 'com_active' && $new_value == 0) {
				$this->db->where('com_id', $postData['pk']);
				$this->db->delete('dt_com_group_com');
			}

			// Get new updated data
			$this->db->where('com_id', $postData['pk']);
			$new_query = $this->db->get($this->table_name);
			$new_data = $new_query->row_array();

			// Load helpers for logging
			$this->load->helper('field_labels');
			$this->load->helper('common');

			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();
			$field_label = $field_labels[$postData['name']] ?? $postData['name'];

			// Friendly values
			$old_value_friendly = $old_value;
			$new_value_friendly = $new_value;

			if (isset($value_labels[$postData['name']])) {
				$old_value_friendly = $value_labels[$postData['name']][$old_value] ?? $old_value;
				$new_value_friendly = $value_labels[$postData['name']][$new_value] ?? $new_value;
			}

			// Logging
			$description = $field_label . " updated in Commodity Master. Com ID: " . $postData['pk'];

			$old_values = [$field_label => $old_value_friendly];
			$new_values = [$field_label => $new_value_friendly];

			log_admin_edit('4', 'Commodity Master', $old_values, $new_values, $description);

			// Include cancelled count if limits were force-cancelled
			$response = ['success' => true];
			if (isset($postData['force_cancel']) && $postData['force_cancel'] == 1 && isset($cancelled)) {
				$response['cancelled'] = $cancelled;
			}
			echo json_encode($response);
		} else {
			echo json_encode(['error' => 'Update failed']);
		}

		$this->updatecommoditygroup();
	}


	function load_rpanelcommodity($record_id)
	{
		$record_id = ($record_id == NULL) ? -1 : $record_id;
		$this->db->select('rcom_id, rcom_disname');
		$this->db->from('dt_rpanelcommodities');
		$this->db->where('rcom_status', 1);
		$resultset = $this->db->get();
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->rcom_id, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->rcom_id) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->rcom_disname, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	function getrpanelcommodities()
	{
		$return_data = array();
		$this->db->select('rcom_id, rcom_disname');
		$this->db->from('dt_rpanelcommodities');
		$this->db->where('rcom_status', 1);
		$query = $this->db->get();
		if ($query->num_rows() > 0) {
			foreach ($query->result() as $row) {
				$return_data[] = array('value' => $row->rcom_id, 'text' => $row->rcom_disname);
			}
		}
		return json_encode($return_data);
	}
	function updatecommoditygroup()
	{
		$socketObj = new SocketUpdater();
		$resp = $socketObj->commodity_update();
	}

	// function updateLog($oldRecord, $newRecord)
	// {
	// 	$updatedRecord = array();
	// 	$record = $newRecord['fv'];

	// 	if ($oldRecord['com_name'] != $record['com_name']) {
	// 		$updatedRecord['New']['com_name'] = $record['com_name'];
	// 		$updatedRecord['Old']['com_name'] = $oldRecord['com_name'];
	// 	}
	// 	if ($oldRecord['com_isregion'] != $record['com_isregion']) {
	// 		$updatedRecord['New']['com_isregion'] = $record['com_isregion'];
	// 		$updatedRecord['Old']['com_isregion'] = $oldRecord['com_isregion'];
	// 	}
	// 	if ($oldRecord['com_type'] != $record['com_type']) {
	// 		$updatedRecord['New']['com_type'] = $record['com_type'];
	// 		$updatedRecord['Old']['com_type'] = $oldRecord['com_type'];
	// 	}
	// 	if ($oldRecord['com_weight'] != $record['com_weight']) {
	// 		$updatedRecord['New']['com_weight'] = $record['com_weight'];
	// 		$updatedRecord['Old']['com_weight'] = $oldRecord['com_weight'];
	// 	}
	// 	// if($oldRecord['com_other_charges'] != $record['com_other_charges'])
	// 	{
	// 		$updatedRecord['New']['com_other_charges'] = $record['com_other_charges'];
	// 		$updatedRecord['Old']['com_other_charges'] = $oldRecord['com_other_charges'];
	// 	}
	// 	if ($oldRecord['com_correction_type'] != $record['com_correction_type']) {
	// 		$updatedRecord['New']['com_correction_type'] = $record['com_correction_type'];
	// 		$updatedRecord['Old']['com_correction_type'] = $oldRecord['com_correction_type'];
	// 	}
	// 	if ($oldRecord['com_order_number'] != $record['com_order_number']) {
	// 		$updatedRecord['New']['com_order_number'] = $record['com_order_number'];
	// 		$updatedRecord['Old']['com_order_number'] = $oldRecord['com_order_number'];
	// 	}
	// 	if ($oldRecord['com_is_coin'] != $record['com_is_coin']) {
	// 		$updatedRecord['New']['com_is_coin'] = $record['com_is_coin'];
	// 		$updatedRecord['Old']['com_is_coin'] = $oldRecord['com_is_coin'];
	// 	}
	// 	if ($oldRecord['com_display_purity'] != $record['com_display_purity']) {
	// 		$updatedRecord['New']['com_display_purity'] = $record['com_display_purity'];
	// 		$updatedRecord['Old']['com_display_purity'] = $oldRecord['com_display_purity'];
	// 	}
	// 	if ($oldRecord['com_roundoff'] != $record['com_roundoff']) {
	// 		$updatedRecord['New']['com_roundoff'] = $record['com_roundoff'];
	// 		$updatedRecord['Old']['com_roundoff'] = $oldRecord['com_roundoff'];
	// 	}
	// 	if ($oldRecord['com_bar_quantity'] != $record['com_bar_quantity']) {
	// 		$updatedRecord['New']['com_bar_quantity'] = $record['com_bar_quantity'];
	// 		$updatedRecord['Old']['com_bar_quantity'] = $oldRecord['com_bar_quantity'];
	// 	}
	// 	if ($oldRecord['com_bar_type'] != $record['com_bar_type']) {
	// 		$updatedRecord['New']['com_bar_type'] = $record['com_bar_type'];
	// 		$updatedRecord['Old']['com_bar_type'] = $oldRecord['com_bar_type'];
	// 	}
	// 	if ($oldRecord['allowed_decimals'] != $record['allowed_decimals']) {
	// 		$updatedRecord['New']['allowed_decimals'] = $record['allowed_decimals'];
	// 		$updatedRecord['Old']['allowed_decimals'] = $oldRecord['allowed_decimals'];
	// 	}
	// 	if ($oldRecord['com_margin_type'] != $record['com_margin_type']) {
	// 		$updatedRecord['New']['com_margin_type'] = $record['com_margin_type'];
	// 		$updatedRecord['Old']['com_margin_type'] = $oldRecord['com_margin_type'];
	// 	}
	// 	if ($oldRecord['com_margin_value'] != $record['com_margin_value']) {
	// 		$updatedRecord['New']['com_margin_value'] = $record['com_margin_value'];
	// 		$updatedRecord['Old']['com_margin_value'] = $oldRecord['com_margin_value'];
	// 	}
	// 	if ($oldRecord['bar_selection'] != $record['bar_selection']) {
	// 		$updatedRecord['New']['bar_selection'] = $record['bar_selection'];
	// 		$updatedRecord['Old']['bar_selection'] = $oldRecord['bar_selection'];
	// 	}
	// 	// if($oldRecord['com_bar_no'] != $record['com_bar_no'])
	// 	{
	// 		$updatedRecord['New']['com_bar_no'] = $record['com_bar_no'];
	// 		$updatedRecord['Old']['com_bar_no'] = $oldRecord['com_bar_no'];
	// 	}
	// 	if ($oldRecord['com_active'] != $record['com_active']) {
	// 		$updatedRecord['New']['com_active'] = $record['com_active'];
	// 		$updatedRecord['Old']['com_active'] = $oldRecord['com_active'];
	// 	}

	// 	if (isset($newRecord['add_status']) && $newRecord['add_status'] == 1) {
	// 		$updatedRecord['New']['add_status'] = $newRecord['add_status'];
	// 		$updatedRecord['New']['enable_commodity_sell'] = $newRecord['enable_commodity_sell'];
	// 		$updatedRecord['New']['enable_commodity_buy'] = $newRecord['enable_commodity_buy'];
	// 	}

	// 	if (count($updatedRecord) > 0) {
	// 		$comId = array('com_id' => $oldRecord['com_id']);
	// 		$updatedRecord = $comId + $updatedRecord;
	// 		$records = json_encode($updatedRecord);
	// 		$admin_id 		= $this->login_model->get_userid();
	// 		$adminipaddress = $_SERVER['SERVER_ADDR'];
	// 		$log_shortdesc 	= "Updated Commodity Master. Com Id: " . $oldRecord['com_id'];
	// 		$logtype = 4;
	// 		$logdatetime = date('Y-m-d H:i:s');
	// 		$logupdatedata = date('Y-m-d H:i:s');
	// 		//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
	// 	}
	// }
	public function insertData($pk, $weight, $com_rest)
	{
		$pk = (int)$pk;
		$weight = floatval($weight);
		$total_weight = $weight;
		
		$this->db->where('com_id', $pk);
		$this->db->update('dt_com_master', array('com_rest_wt' => $total_weight));
		
		$data = array(
			'com_id' => $pk,
			'com_wtdatetime' => date('Y-m-d H:i:s'),
			'com_rest_weight' => $weight,
		);
		
		$this->db->insert('dt_com_weight', $data);
		return $this->db->affected_rows() > 0;
	}
	function get_commodity_name($id) {
		try {
			$this->db->select('com_name');
			$this->db->where('com_id', (int)$id);
			$result = $this->db->get($this->table_name);
			
			if ($result->num_rows() > 0) {
				return $result->row()->com_name;
			}
			return 'Unknown Commodity';
		} catch (Exception $e) {
			log_message('error', 'Get commodity name failed: ' . $e->getMessage());
			return 'Unknown Commodity';
		}
	}
	
	function get_comName($data = "")
	{
		try {
			$data = $this->db->escape_str($data);
			$this->db->where('com_name', $data);
			$resultset = $this->db->get('dt_com_master');
			return ($resultset->num_rows() > 0) ? 1 : 0;
		} catch (Exception $e) {
			log_message('error', 'Get com name check failed: ' . $e->getMessage());
			return 0;
		}
	}
	
	function get_orderNo($data = "")
	{
		try {
			$data = (int)$data;
			$this->db->where('com_order_number', $data);
			$resultset = $this->db->get('dt_com_master');
			return ($resultset->num_rows() > 0) ? 1 : 0;
		} catch (Exception $e) {
			log_message('error', 'Get order number check failed: ' . $e->getMessage());
			return 0;
		}
	}
}
