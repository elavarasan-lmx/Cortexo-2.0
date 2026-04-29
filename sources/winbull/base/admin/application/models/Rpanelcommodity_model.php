<?php
class Rpanelcommodity_model extends CI_Model
{
	var $table_name = 'dt_rpanelcommodities';
	public $primary_key = "rcom_id";				//Initialize table Name

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}
	public function get_data($params = "", $page = "all")
	{
		$query = $this->db->query("SELECT rcom_id, rcom_disname, 
								   CASE rcom_comtype WHEN 0 THEN 'GOLD' WHEN 1 THEN 'SILVER' END AS com_type, 
								   rcom_orderno, contract_symbol as mcxcontract, bcontract_symbol as bankcontract, 
								   CASE rcom_status WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' END AS rcom_status,rcom_contname,
								   CASE rcom_contdisplay WHEN 1 THEN 'Active' WHEN 0 THEN 'Inactive' END AS rcom_contdisplay 
								   FROM dt_rpanelcommodities 
								   LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol 
								   LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
								   ORDER BY rcom_id ASC");
		return $query;
	}

	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['rcom_id']				=	NULL;
		$_POST['fv']['rcom_disname']		=	NULL;
		$_POST['fv']['rcom_banksymbol']		=	NULL;
		$_POST['fv']['rcom_mcxsymbol']		=	NULL;
		$_POST['fv']['rcom_comtype']		=	NULL;
		$_POST['fv']['rcom_orderno']		=	NULL;
		$_POST['fv']['rcom_status']			=	TRUE;
		$_POST['fv']['rcom_contname']		=	NULL;
		$_POST['fv']['rcom_contdisplay']	=	TRUE;
		$_POST['fv']['rcom_sell_tax']		=	NULL;
		$_POST['fv']['rcom_buy_tax']		=	NULL;
		$_POST['fv']['rcom_sell_tcs']		=	NULL;
		$_POST['fv']['rcom_buy_tcs']		=	NULL;
		$_POST['fv']['db_error_msg']		=	"";
	}

	/*
	* Fetch record for entry when edit 
	*/
	public function load_mcxcontract($record_id)
	{
		// $record_id = ($record_id==NULL) ? -1 : $record_id;
		// $strData="<option value='-1' ";
		// $strData.=$record_id==-1 ? "selected='selected'" : "" ;
		// $strData.=">- SELECT -</option>";
		$strData = "";
		$resultset = $this->db->query("SELECT contract_id, contract_symbol from dt_contractmaster WHERE status = 1 AND ctype=1");
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->contract_id, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->contract_id) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->contract_symbol, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	public function load_bankcontract($record_id)
	{
		$record_id = ($record_id == NULL) ? -1 : $record_id;
		// $strData = "<option value='-1' ";
		// $strData .= $record_id == -1 ? "selected='selected'" : "";
		// $strData .= ">- SELECT -</option>";
		$strData = "";
		$resultset = $this->db->query("SELECT bcontract_id, bcontract_symbol from dt_bankcontractmaster WHERE bcontract_status = 1");
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->bcontract_id, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->bcontract_id) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->bcontract_symbol, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$records['com_id']   	= $record_id;
		//Build contents query
		$this->db->where('rcom_id', $record_id);
		$result_set = $this->db->get('dt_rpanelcommodities');
		
		if (!$result_set || $result_set->num_rows() == 0) {
			return false;
		}

		foreach ($result_set->result() as $row) {
			$records['rcom_id']   			= $row->rcom_id;
			$records['rcom_disname']   		= $row->rcom_disname;
			$records['rcom_comtype']   		= $row->rcom_comtype;
			$records['rcom_orderno']   		= $row->rcom_orderno;
			$records['rcom_banksymbol']		= $row->rcom_banksymbol;
			$records['rcom_mcxsymbol']		= $row->rcom_mcxsymbol;
			$records['rcom_status'] 		= ($row->rcom_status == 1) ? TRUE : FALSE;
			$records['rcom_contname']   	= $row->rcom_contname;
			$records['rcom_contdisplay'] 	= ($row->rcom_contdisplay == 1) ? TRUE : FALSE;
			$records['rcom_sell_tax']   	= $row->rcom_sell_tax;
			$records['rcom_buy_tax']   		= $row->rcom_buy_tax;
			$records['rcom_sell_tcs']   	= $row->rcom_sell_tcs;
			$records['rcom_buy_tcs']   		= $row->rcom_buy_tcs;
			$records['db_error_msg']		= "";
		}
		return $records;
	}
	/*===========================================================
      DELETE RECORD (with logging)
    ===========================================================*/
	public function delete_record($record_id)
	{
		// Fetch old record for logging
		$old_record = $this->get_entry_record($record_id);

		// Guard: if record doesn't exist
		if (!$old_record) {
			return ['status' => 0];
		}

		// Run delete query safely
		$this->db->where($this->primary_key, $record_id);
		$this->db->delete($this->table_name);

		if ($this->db->affected_rows() > 0) {

			// Logging
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			// Prepare formatted log data
			$logged_data = [];
			foreach ($old_record as $field => $value) {
				$label = $field_labels[$field] ?? $field;
				$logged_data[$label] =
					isset($value_labels[$field][$value])
					? $value_labels[$field][$value]
					: $value;
			}

			log_admin_delete(
				'37',
				'Rpanel Commodity',
				$logged_data,
				'Admin - Deleted Rpanel commodity: ' . $old_record['rcom_disname']
			);

			return ['status' => 1];
		}

		return ['status' => 0];
	}

	/*===========================================================
      DELETE SUB RECORD
    ===========================================================*/
	public function delete_sub_record($table_name, $col_name, $record_id)
	{
		$this->db->where($col_name, $record_id);
		$this->db->delete($table_name);
		return TRUE;
	}

	/*===========================================================
      INSERT RECORD (ADD)
    ===========================================================*/
	public function insert_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		$post = $_POST['fv'];

		$this->db->insert($this->table_name, $post);

		if ($this->db->affected_rows() > 0) {

			// Logging
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$logged_data = [];
			foreach ($post as $field => $value) {
				$label = $field_labels[$field] ?? $field;

				$logged_data[$label] =
					isset($value_labels[$field][$value])
					? $value_labels[$field][$value]
					: $value;
			}

			log_admin_add(
				'37',
				'Rpanel Commodity',
				$logged_data,
				'Admin - Added new Rpanel commodity: ' . $post['rcom_disname']
			);

			return ['status' => 1];
		}

		return ['status' => 0];
	}

	/*===========================================================
      UPDATE RECORD
    ===========================================================*/
	public function update_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		// Get existing data for comparison
		$old_record = $this->get_entry_record($id);

		if (!$old_record) {
			return ['status' => 0];
		}

		// Build update array from form fields
		$update_data = [];
		if (isset($_POST['fv'])) {
			foreach ($_POST['fv'] as $key => $value) {
				$update_data[$key] = $value;
			}
		}

		// Update main record
		$this->db->where($this->primary_key, $id);
		$this->db->update($this->table_name, $update_data);

		// Update supporting tables
		$this->db->update("dt_r_panel", ['updateon' => time()], ['id' => 1]);
		$this->db->update("dt_generalsettings", ['lastupdate' => time()]);

		// Prepare log ONLY if changes occurred
		$this->load->helper(['field_labels', 'common']);
		$changed_fields = get_changed_fields($old_record, $update_data);

		if (!empty($changed_fields)) {

			$old_values = [];
			$new_values = [];

			foreach ($changed_fields as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}

			// Perform logging
			log_admin_edit(
				'37',
				'Rpanel Commodity',
				$old_values,
				$new_values,
				'Admin - Updated Rpanel commodity: ' . ($update_data['rcom_disname'] ?? '')
			);
		}

		// IMPORTANT:
		// Even if NO FIELDS CHANGED → return success
		return ['status' => 1];
	}


	/*===========================================================
      INLINE UPDATE (X-editable or Inplace editing)
    ===========================================================*/
	public function inline_update()
	{
		$id     = $_POST['pk'];
		$field  = $_POST['name'];
		$value  = $_POST['value'];

		// Original record
		$old_record = $this->db
			->get_where($this->table_name, [$this->primary_key => $id])
			->row_array();

		$this->db->where($this->primary_key, $id);
		$this->db->update($this->table_name, [$field => $value]);

		if ($this->db->affected_rows() >= 0) {

			// New record after update
			$new_record = $this->db
				->get_where($this->table_name, [$this->primary_key => $id])
				->row_array();

			// Logging
			$this->load->helper(['field_labels', 'common']);

			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();

			$label = $field_labels[$field] ?? $field;

			$old_val = $old_record[$field] ?? null;
			$new_val = $new_record[$field] ?? null;

			if (isset($value_labels[$field])) {
				$old_val = $value_labels[$field][$old_val] ?? $old_val;
				$new_val = $value_labels[$field][$new_val] ?? $new_val;
			}

			$old_data = [$label => $old_val];
			$new_data = [$label => $new_val];

			$description = "Updated {$label} in RPanel Commodity. ID: {$id}";

			log_admin_edit('37', 'RPanel Commodity', $old_data, $new_data, $description);

			return TRUE;
		}

		return FALSE;
	}
}
