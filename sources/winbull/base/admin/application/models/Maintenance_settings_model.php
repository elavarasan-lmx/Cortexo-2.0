<?php
class Maintenance_settings_model extends CI_Model {

	public function __construct()
	{
		parent::__construct();
	}

	public function get_settings()
	{
		$this->db->select('website_maintenance, android_maintenance, ios_maintenance, maintenance_message, website_logo, website_favicon, custom_logo_enabled');
		$query = $this->db->get('dt_generalsettings');
		if ($query->num_rows() > 0) {
			return $query->row_array();
		}
		return array(
			'website_maintenance' => 0,
			'android_maintenance' => 0,
			'ios_maintenance' => 0,
			'maintenance_message' => NULL
		);
	}

	public function update_setting($column, $value)
	{
		$allowed = array('website_maintenance', 'android_maintenance', 'ios_maintenance', 'maintenance_message');
		if (!in_array($column, $allowed)) {
			return false;
		}
		$this->db->update('dt_generalsettings', array($column => $value));
		return $this->db->affected_rows() >= 0;
	}
}
?>
