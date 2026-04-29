<?php
class Adminrpanel_model extends CI_Model
{
	var $table_name = 'dt_generalrpsettings';						//Initialize table Name
	var $general_table_name = 'dt_generalsettings';

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	function get_entry_record() 										//Fetch entry record
	{
		$query = "SELECT rpsg_id,rpsg_weight, rpss_weight, rpsg_roundoff, rpss_roundoff, gold_allowdiff_sell, silver_allowdiff_sell, gold_allowdiff_buy, silver_allowdiff_buy FROM dt_generalrpsettings";
		$result_set = $this->db->query($query);
		foreach ($result_set->result() as $row) {
			$records['rpsg_id']   			= $row->rpsg_id;
			$records['rpsg_weight']   			= $row->rpsg_weight;
			$records['rpss_weight']   			= $row->rpss_weight;
			$records['rpsg_roundoff']			= $row->rpsg_roundoff;
			$records['rpss_roundoff']			= $row->rpss_roundoff;
			$records['gold_allowdiff_sell']		= $row->gold_allowdiff_sell;
			$records['silver_allowdiff_sell']	= $row->silver_allowdiff_sell;
			$records['gold_allowdiff_buy']		= $row->gold_allowdiff_buy;
			$records['silver_allowdiff_buy']	= $row->silver_allowdiff_buy;
			$records['db_error_msg']		= "";
		}
		return $records;
	}

	function get_generalentry_record()
	{
		$returndata = generalentry_helper();
		return $returndata;
	}

	function load_correction_type($record_id)
	{
		//$record_id==NULL ? -1 : $record_id;
		$strData = "";
		$strData = "<option value='-1' ";
		$strData .= $record_id == -1 ? "selected='selected'" : "";
		$strData .= ">- SELECT -</option>";
		$resultset = $this->db->query("SELECT distinct(corr_type) AS corr_type FROM dt_cur_correction");
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->corr_type, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->corr_type) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->corr_type, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	/**
	 * Remove record
	 * @param id
	 * @return boolean
	 */

	public function update_record()
	{
		// GET OLD RECORD (before update)
		$old_record = $this->get_entry_record();
		if (!$old_record) {
			return ['status' => 0, 'message' => "Record not found"];
		}

		// NEW VALUES FROM FORM
		$records = $this->input->post('fv');  // safer than $_POST

		// FIND FIELDS THAT CHANGED
		$changed_data = get_changed_fields($old_record, $records);

		// If nothing changed → do NOT run update or log
		if (empty($changed_data)) {
			return ['status' => 1, 'message' => "No changes detected"];
		}

		// EXTRACT OLD + NEW VALUES FOR LOGGING
		$old_values = [];
		$new_values = [];

		foreach ($changed_data as $field => $values) {
			$old_values[$field] = $values['old'];
			$new_values[$field] = $values['new'];
		}

		// UPDATE QUERY — Apply WHERE Condition
		$this->db->where('rpsg_id', $old_record['rpsg_id']);
		$this->db->update($this->table_name, $records);

		// LOG DETAILS — only when rows actually changed
		if ($this->db->affected_rows() > 0) {
			log_admin_edit(
				'8',
				'Admin Rpanel',
				$old_values,
				$new_values,
				'Admin - Updated Rpanel settings'
			);
		}

		// BZ-06 FIX: Always return success after update — affected_rows=0 is not an error
		// (happens when DB values match after type coercion, e.g. string "10" vs int 10)
		return ['status' => 1, 'message' => "Record updated"];
	}



	public function update_general_record()
	{
		
		$settingsupdate = trim(isset(Globals::$settingsupdate) ? Globals::$settingsupdate : '');
		$client = trim(isset(Globals::$client) ? Globals::$client : '');
		$admin_id = $this->login_model->get_userid();
		$adminipaddress = $_SERVER['SERVER_ADDR'];

		if ($settingsupdate === '' || $client === '') {
			return ['status' => 0, 'message' => 'Invalid request. Missing global parameters.'];
		}

		// Fetch current settings before update
		$old_record = $this->get_generalentry_record();

		// Use CI input class instead of raw $_POST (safer — applies XSS filtering)
		$fv = $this->input->post('fv');
		if (!$fv || !is_array($fv)) {
			return ['status' => 0, 'message' => 'No form data received.'];
		}

		// ──────────────────────────────────────────────────────────────
		// STEP 1: Build $records from form data and apply ALL transformations
		//         This is the data that will be SAVED to the database.
		// ──────────────────────────────────────────────────────────────
		$records = $fv;

		// Convert checkbox values to 1/0 safely
		// (unchecked checkboxes are NOT submitted, so missing key = 0)
		$bool_fields = [
			'has_gminqty',
			'has_sminqty',
			'has_gmaxqty',
			'has_smaxqty',
			'has_gallot_qty',
			'has_sallot_qty',
			'is_admin_mob1',
			'is_admin_mob2',
			'is_admin_mob3',
			'is_admin_mob4',
			'is_admin_mob5',
			'expire_history'
		];
		foreach ($bool_fields as $field) {
			$records[$field] = isset($records[$field]) ? 1 : 0;
		}

		// Convert quantities: grams → kg (÷1000) when enabled, 0 when disabled
		// Disabled inputs are NOT submitted, so use ?? 0 for safety
		$records['gold_min_qty']    = $records['has_gminqty']    ? (($records['gold_min_qty'] ?? 0) / 1000) : 0;
		$records['silver_min_qty']  = $records['has_sminqty']    ? (($records['silver_min_qty'] ?? 0) / 1000) : 0;
		$records['gold_max_qty']    = $records['has_gmaxqty']    ? (($records['gold_max_qty'] ?? 0) / 1000) : 0;
		$records['silver_max_qty']  = $records['has_smaxqty']    ? (($records['silver_max_qty'] ?? 0) / 1000) : 0;
		$records['gold_allot_qty']  = $records['has_gallot_qty'] ? (($records['gold_allot_qty'] ?? 0) / 1000) : 0;
		$records['silver_allot_qty']= $records['has_sallot_qty'] ? (($records['silver_allot_qty'] ?? 0) / 1000) : 0;

		// Validate: Max Qty must not exceed Max Allot when both are enabled
		if ($records['has_gmaxqty'] && $records['has_gallot_qty']) {
			if ($records['gold_max_qty'] > $records['gold_allot_qty']) {
				return ['status' => 0, 'message' => 'Gold Max Qty cannot exceed Gold Max Allotted Qty.'];
			}
		}
		if ($records['has_smaxqty'] && $records['has_sallot_qty']) {
			if ($records['silver_max_qty'] > $records['silver_allot_qty']) {
				return ['status' => 0, 'message' => 'Silver Max Qty cannot exceed Silver Max Allotted Qty.'];
			}
		}

		// Convert opening date for DB storage
		$records['opening_date'] = !empty($records['opening_date']) ? date('Y-m-d', strtotime($records['opening_date'])) : null;

		// Expiry settings
		$records['days_expire'] = $records['expire_history'] ? ($records['days_expire'] ?? 0) : 0;

		// Time fields — only save when corresponding auto radio = 1
		$records['limitcancel_time'] = (
			!empty($records['limitcancel_time']) && isset($records['limit_cancellation']) && $records['limit_cancellation'] == 1
		) ? date("H:i:s", strtotime($records['limitcancel_time'])) : NULL;

		$records['trade_on_time'] = (
			!empty($records['trade_on_time']) && isset($records['trade_on']) && $records['trade_on'] == 1
		) ? date("H:i:s", strtotime($records['trade_on_time'])) : NULL;

		$records['trade_off_time'] = (
			!empty($records['trade_off_time']) && isset($records['trade_off']) && $records['trade_off'] == 1
		) ? date("H:i:s", strtotime($records['trade_off_time'])) : NULL;

		$records['market_on_time'] = (
			!empty($records['market_on_time']) && isset($records['market_on']) && $records['market_on'] == 1
		) ? date("H:i:s", strtotime($records['market_on_time'])) : NULL;

		$records['market_off_time'] = (
			!empty($records['market_off_time']) && isset($records['market_off']) && $records['market_off'] == 1
		) ? date("H:i:s", strtotime($records['market_off_time'])) : NULL;

		// Build tolerance strings (these fields are outside fv[] in the form)
		$tol_gold_high  = $this->input->post('tol_gold_high');
		$tol_gold_low   = $this->input->post('tol_gold_low');
		$tol_silver_high = $this->input->post('tol_silver_high');
		$tol_silver_low  = $this->input->post('tol_silver_low');

		$gold_tol = (!empty($tol_gold_high) || !empty($tol_gold_low)) ? trim($tol_gold_high) . "#" . trim($tol_gold_low) : '';
		$silver_tol = (!empty($tol_silver_high) || !empty($tol_silver_low)) ? trim($tol_silver_high) . "#" . trim($tol_silver_low) : '';

		$records['gold_tol'] = $gold_tol;
		$records['silver_tol'] = $silver_tol;

		// ──────────────────────────────────────────────────────────────
		// STEP 2: Save transformed records to database
		// ──────────────────────────────────────────────────────────────
		if (!$this->db->update($this->general_table_name, $records)) {
			return ['status' => 0, 'message' => 'Database update failed.'];
		}

		// Update related session data
		$this->session->set_userdata([
			'is_trade' => $fv['is_trade'] ?? 0,
			'display_margin' => $fv['display_margin'] ?? 0
		]);

		// External sync (optional)
		$settings = $this->db->query("SELECT trade_enable FROM dt_generalsettings")->row();
		$requestdata = [
			'client' => $client,
			'trade_enable' => $settings->trade_enable ?? 0,
			'limit_expire' => $fv['limit_cancellation'] ?? 0,
			'limit_expire_time' => $fv['limitcancel_time'] ?? null,
			'trade_on' => $fv['trade_on'] ?? 0,
			'trade_on_time' => $fv['trade_on_time'] ?? null,
			'trade_off' => $fv['trade_off'] ?? 0,
			'trade_off_time' => $fv['trade_off_time'] ?? null,
			'market_on' => $fv['market_on'] ?? 0,
			'market_on_time' => $fv['market_on_time'] ?? null,
			'market_off' => $fv['market_off'] ?? 0,
			'market_off_time' => $fv['market_off_time'] ?? null
		];

		$field_string = http_build_query($requestdata);
		curl_helper($settingsupdate, $field_string);

		// ──────────────────────────────────────────────────────────────
		// STEP 3: Build transformed data for logging comparison
		//         (use same format as generalentry_helper for accurate diff)
		// ──────────────────────────────────────────────────────────────
		$transformed_new_data = $records;
		// Convert dates and times back to display format for comparison with old_record
		$transformed_new_data['opening_date'] = !empty($records['opening_date']) ? date('d-m-Y', strtotime($records['opening_date'])) : null;
		$transformed_new_data['limitcancel_time'] = !empty($records['limitcancel_time']) ? date("g:i a", strtotime($records['limitcancel_time'])) : null;
		$transformed_new_data['trade_on_time'] = !empty($records['trade_on_time']) ? date("g:i a", strtotime($records['trade_on_time'])) : null;
		$transformed_new_data['trade_off_time'] = !empty($records['trade_off_time']) ? date("g:i a", strtotime($records['trade_off_time'])) : null;
		$transformed_new_data['market_on_time'] = !empty($records['market_on_time']) ? date("g:i a", strtotime($records['market_on_time'])) : null;
		$transformed_new_data['market_off_time'] = !empty($records['market_off_time']) ? date("g:i a", strtotime($records['market_off_time'])) : null;
		$transformed_new_data['gold_tol'] = $gold_tol;
		$transformed_new_data['silver_tol'] = $silver_tol;

		// Compare for log - ONLY include fields that actually changed
		$changed_data = get_changed_fields($old_record, $transformed_new_data);

		if (!empty($changed_data)) {
			$old_values = [];
			$new_values = [];
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}

			log_admin_edit('9', 'General Settings', $old_values, $new_values, 'Admin - Updated general settings');
		}

		return ['status' => 1, 'message' => 'Settings updated successfully.'];
	}

	function getCountry($selected_country = '')
	{
		$strData = "";
		$resultset = $this->db->query("SELECT ct_id, ct_phonecode, ct_iso, ct_is_default, ct_mob_no_len, ct_min_mob_len, ct_max_mob_len, ct_nicename FROM dt_country ORDER BY ct_is_default DESC , ct_nicename ASC");

		$selected_country = ltrim(trim($selected_country), '+');

		foreach ($resultset->result() as $row) {
			$phonecode = trim($row->ct_phonecode);
			if ($phonecode === '') continue;

			if (!empty($selected_country) && $phonecode === $selected_country) {
				$selected = " selected='selected'";
			} elseif (empty($selected_country) && $row->ct_is_default == 1) {
				$selected = " selected='selected'";
			} else {
				$selected = "";
			}

			// Build option
			$strData .= "<option data-iso='" . htmlspecialchars($row->ct_iso) . "' value='+" . htmlspecialchars($phonecode) . "'" . $selected . ">" . '+' . htmlspecialchars($phonecode) . "</option>";
		}

		$resultset->free_result();
		return $strData;
	}
}
