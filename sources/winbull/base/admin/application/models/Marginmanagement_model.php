<?php
class Marginmanagement_model extends CI_Model
{
	var $table_name = 'dt_marginmanagement';						//Initialize table Name

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}

	public function get_data($params = "", $page = "all")
	{
		$this->db->select("mar_id, cus_name, DATE_FORMAT(mar_date,'%d-%m-%Y %H:%i:%s') as mar_date, mar_amount, cus_company_name", FALSE);
		$this->db->from('dt_marginmanagement');
		$this->db->join('dt_customer', 'cus_id = mar_customer', 'left');
		$this->db->order_by('mar_id', 'DESC');
		$query = $this->db->get();
		return $query;
	}
	public function load_customer($record_id)
	{
		$record_id = ($record_id == NULL) ? -1 : $record_id;
		$strData = "<option value='-1' ";
		$strData .= $record_id == -1 ? "selected='selected'" : "";
		$strData .= ">- SELECT -</option>";
		$this->db->select('cus_id, cus_name, cus_company_name');
		$this->db->from('dt_customer');
		// BZ-36: Only show active customers in margin dropdown
		$this->db->where('cus_active', 1);
		$this->db->order_by('cus_company_name', 'ASC');
		$resultset = $this->db->get();
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->cus_id, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->cus_id) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->cus_name, ENT_QUOTES) . "-" . htmlspecialchars($row->cus_company_name, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}
	public function empty_record() 										//Fetch listing record
	{
		$_POST['fv']['mar_id']					=	NULL;
		$_POST['fv']['mar_customer']			=	NULL;
		$_POST['fv']['mar_date']				=	date('d-m-Y H:i:s');
		$_POST['fv']['mar_amount']				=	NULL;
		$_POST['fv']['mar_mode']				=	-1;
		$_POST['fv']['mar_naration']			=	NULL;
	}

	/*
	* Fetch record for entry when edit 
	*/
	public function get_entry_record($record_id) 										//Fetch entry record
	{
		$record_id = (int)$record_id;
		$records['cus_id']   				= $record_id;
		//Build contents query
		$this->db->select('*');
		$this->db->from('dt_marginmanagement');
		$this->db->where('mar_id', $record_id);
		$query = $this->db->get();
		foreach ($query->result() as $row) {
			$records['mar_id']   				= $row->mar_id;
			$records['mar_customer']   			= $row->mar_customer;
			$records['mar_date']		   		= $row->mar_date != NULL ? date('d-m-Y H:i:s', strtotime($row->mar_date)) : date('d-m-Y H:i:s');
			$records['mar_amount']   			= $row->mar_amount;
			$records['mar_mode']   				= $row->mar_mode;
			$records['mar_naration']   			= $row->mar_naration;
		}
		return $records;
	}

	public function delete_record($id)
	{
		$id = (int)$id;
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($id);

		$this->db->where('mar_id', $id);
		$delete_record = $this->db->delete($this->table_name);
		if ($delete_record) {
			$this->db->delete('dt_transaction', array('trans_code' => $id, 'trans_payment_type' => 0));

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
			log_admin_delete('28', 'Margin Management', $logged_data, 'Admin - Deleted margin record: ' . $old_record['mar_id']);
			return array('status' => 1);
		}
		return array('status' => 0, 'message' => 'Failed to delete margin record.');
	}

	/**
	 * Insert record
	 * @param add_new as new record, otherwise as update record
	 * @return boolean
	 */
	public function insert_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter

		$errors = "";
		if ($_POST['fv']['mar_amount'] != 0) {
			$cur_date  =  date('Y-m-d H:i:s');

			$_POST['fv']['mar_date'] = isset($_POST['fv']['mar_date'])  ? date('Y-m-d H:i:s', strtotime($_POST['fv']['mar_date'])) : $cur_date;
			$status = $this->db->insert($this->table_name, $_POST['fv']);
			$margin_id = $this->db->insert_id();
			if ($status == 1) {
				$trans_items['trans_cuscode'] 		= $_POST['fv']['mar_customer'];
				$trans_items['trans_date'] 			= $cur_date;
				$trans_items['trans_code'] 			= $margin_id;
				$trans_items['trans_payment_type'] 	= 0;
				$trans_items['trans_amount'] 		= $_POST['fv']['mar_amount'] < 0 ? $_POST['fv']['mar_amount'] * -1 : $_POST['fv']['mar_amount'];
				$trans_items['trans_actype'] 		= $_POST['fv']['mar_amount'] >= 0 ? 0 : 1;
				$trans_items['trans_comments'] 		= $_POST['fv']['mar_amount'] < 0 ? "Margin Payment(Deducted)" : "Margin Payment";
				$this->db->insert('dt_transaction', $trans_items);

				// Log the add operation
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
				log_admin_add('28', 'Margin Management', $logged_data, 'Admin - Added new margin record for customer: ' . $_POST['fv']['mar_customer']);
				return array('status' => 1, 'message' => 'Margin record added successfully.');
			}
		} else {
			return array('status' => 0, 'message' => 'Please enter a valid margin amount.');
		}
		return array('status' => 0, 'message' => 'Failed to add margin record.');
	}
	public function update_record($id)
	{
		$_POST['fv'] = $this->input->post('fv', true); // P-RAWINPUT fix: XSS filter
		// Get the record before updating for logging purposes
		$old_record = $this->get_entry_record($id);

		if ($_POST['fv']['mar_amount'] != 0) {
			$cur_date  =  date('Y-m-d H:i:s');

			$pre_record = $this->get_entry_record($id);

			$_POST['fv']['mar_id']	   = $id;
			$_POST['fv']['mar_date'] = isset($_POST['fv']['mar_date'])  ? date('Y-m-d H:i:s', strtotime($_POST['fv']['mar_date'])) : $cur_date;
			$this->db->update($this->table_name, $_POST['fv'], array('mar_id' => $id));

			if ($pre_record['mar_customer'] != $_POST['fv']['mar_customer'] || $pre_record['mar_amount'] != $_POST['fv']['mar_amount']) {
				$trans_items['trans_cuscode'] 		= $_POST['fv']['mar_customer'];
				$trans_items['trans_date'] 			= $cur_date;
				$trans_items['trans_code'] 			= $id;
				$trans_items['trans_payment_type'] 	= 0;
				$trans_items['trans_amount'] 		= $_POST['fv']['mar_amount'] < 0 ? $_POST['fv']['mar_amount'] * -1 : $_POST['fv']['mar_amount'];
				$trans_items['trans_actype'] 		= $_POST['fv']['mar_amount'] >= 0 ? 0 : 1;
				$trans_items['trans_comments'] 		= $_POST['fv']['mar_amount'] < 0 ? "Margin Payment(Deducted)" : "Margin Payment";
				$this->db->update('dt_transaction', $trans_items, array('trans_code' => $id, 'trans_payment_type' => 0));
			}

			// Create selective logging - only log changed values
			$changed_data = get_changed_fields($old_record, $_POST['fv']);

			// Separate old and new data for logging
			$old_values = array();
			$new_values = array();

			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}

			// Log the edit operation with old values in log_pre_data and new values in log_update_data
			if (!empty($changed_data)) {
				log_admin_edit('28', 'Margin Management', $old_values, $new_values, 'Admin - Updated margin record: ' . $id);
			}
			return array('status' => 1);
		} else {
			return array('status' => 0, 'message' => 'Please enter a valid margin amount.');
		}
	}
	function get_availablebalance($cus_id)
	{
		$cus_id = (int)$cus_id;
		$margin_amt = 0;
		$this->db->select("IFNULL(SUM( if(trans_actype = 1, -1, 1) * IFNULL(trans_amount,0) ),0) as Balance", FALSE);
		$this->db->from('dt_transaction');
		$this->db->where('trans_cuscode', $cus_id);
		$resultset = $this->db->get();
		foreach ($resultset->result() as $row) {
			$margin_amt  = $row->Balance;
		}
		return $margin_amt;
	}
}
