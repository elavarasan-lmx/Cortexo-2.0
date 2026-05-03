<?php
class Whatsapp_settings_model extends CI_Model {
		var $table_name = 'dt_whatsapp_settings';						//Initialize table Name

	public function get_data($params = "" , $page = "all")
	{
		$this->db->select('serv.serv_id, serv.serv_name, whatsapp_content, whatsapp_footer');
		$this->db->from('dt_serv_master AS serv');
		$this->db->join('dt_whatsapp_settings AS whatsapp', 'whatsapp.service_id = serv.serv_id', 'left');
		return $this->db->get();
	}
	
	
	function get_entry_record($record_id)
	{
		$this->db->select('serv_id, serv_name, whatsapp_content, whatsapp_footer');
		$this->db->from('dt_serv_master');
		$this->db->join('dt_whatsapp_settings', 'service_id = serv_id', 'left');
		$this->db->where('serv_id', (int)$record_id);
		$result_set = $this->db->get();
		
		$records = array();
		foreach ($result_set->result() as $row)
		{
			$records['service_id'] 		= $row->serv_id;
			$records['serv_name'] 		= $row->serv_name;			
			$records['whatsapp_content']	= $row->whatsapp_content;
			$records['whatsapp_footer']	= $row->whatsapp_footer;
		}		
		return $records;
	}
	
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	
	
	public function update_record($id)
	{
		$old_record = $this->get_entry_record($id);
		
		// [WA-R304 FIX] Mass assignment protection - whitelist allowed fields
		$allowed_fields = array('whatsapp_content', 'whatsapp_footer');
		$update_data = array();
		
		if (isset($_POST['fv']) && is_array($_POST['fv'])) {
			foreach ($allowed_fields as $field) {
				if (isset($_POST['fv'][$field])) {
					$update_data[$field] = $_POST['fv'][$field];
				}
			}
		}
		
		$update_data['service_id'] = (int)$id;
		$this->db->update($this->table_name, $update_data, array('service_id' => $id));
		
		if ($this->db->affected_rows() > 0) {
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();
			$changes = array();
			
			foreach ($_POST['fv'] as $field => $new_value) {
				if (isset($old_record[$field]) && $old_record[$field] != $new_value) {
					$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
					$old_val = isset($value_labels[$field]) && isset($value_labels[$field][$old_record[$field]]) ? $value_labels[$field][$old_record[$field]] : $old_record[$field];
					$new_val = isset($value_labels[$field]) && isset($value_labels[$field][$new_value]) ? $value_labels[$field][$new_value] : $new_value;
					$changes[$label] = array('old' => $old_val, 'new' => $new_val);
				}
			}
			
			if (!empty($changes)) {
				log_admin_edit('81', 'Whatsapp Settings', $changes, 'Admin - Updated whatsapp settings for service: ' . $old_record['serv_name']);
			}
		}
		return array('status' => 1);
    }	
	
	/**
	 * Delete record
	 * @param id
	 * @return array
	 */
	public function delete_record($id)
	{
		// [WA-R303 FIX] Delete from dt_whatsapp_settings ONLY (child table)
		// dt_serv_master is a shared master table used by SMS, Email, and consumer modules
		// — it must NOT be deleted from the WhatsApp settings module
		$this->db->where('service_id', (int)$id);
		$this->db->delete($this->table_name); // dt_whatsapp_settings

		if ($this->db->affected_rows() > 0) {
			return array('status' => 1);
		} else {
			return array('status' => 0);
		}
	}
}
?>