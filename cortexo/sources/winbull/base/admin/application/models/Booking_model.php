<?php
class Booking_model extends CI_Model
{
	var $table_name  = 'dt_booking';
	var $table_name1 = 'dt_customer';			//Initialize table Name

	public function load_customer($record_id)
	{
		$record_id = ($record_id == NULL) ? -1 : $record_id;
		$strData = "<option value='-1' ";
		$strData .= $record_id == -1 ? "selected='selected'" : "";
		$strData .= ">- SELECT -</option>";
		$resultset = $this->db->query("SELECT cus_id, cus_name from dt_customer ORDER BY cus_name ASC");
		foreach ($resultset->result() as $row) {
			$strData .= "<option value='" . htmlspecialchars($row->cus_id, ENT_QUOTES) . "' ";
			$strData .= ($record_id == $row->cus_id) ? "selected='selected'" : "";
			$strData .= ">" . htmlspecialchars($row->cus_name, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result();
		return $strData;
	}

	public function get_quotation_data()
	{
		$query = $this->db->query("SELECT quotation_id, DATE_FORMAT(created_at, '%d-%m-%Y %H:%i:%s') AS created_at,company_name,gst_no,mobile_no,country,approved,narration from dt_quotation");
		return $query;
	}

	public function update_quotation_status($quotation_id, $approved, $narration)
	{
		// Capture old data before update
		$old_query = $this->db->query("SELECT quotation_id, approved, narration FROM dt_quotation WHERE quotation_id = ?", array($quotation_id));
		$old_data = $old_query->row_array();

		$data = array(
			'approved' => $approved,
			'narration' => $narration
		);
		$this->db->where('quotation_id', $quotation_id);
		$result = $this->db->update('dt_quotation', $data);

		if ($result && !empty($old_data)) {
			$status_label = $approved == 1 ? 'Approved' : ($approved == 2 ? 'Rejected' : 'Pending');
			log_admin_edit('48', 'Booking', $old_data, array_merge(['quotation_id' => $quotation_id], $data), 'Admin - Quotation ' . $status_label . ' ID: ' . $quotation_id);
		}

		return $result;
	}
}
