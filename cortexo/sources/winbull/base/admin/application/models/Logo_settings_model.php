<?php
class Logo_settings_model extends CI_Model {

	public function __construct()
	{
		parent::__construct();
	}

	/**
	 * Get current logo/favicon settings
	 */
	public function get_settings()
	{
		$this->db->select('website_logo, admin_logo, website_favicon, custom_logo_enabled');
		$query = $this->db->get('dt_generalsettings');
		if ($query->num_rows() > 0) {
			return $query->row_array();
		}
		return array(
			'website_logo' => NULL,
			'admin_logo' => NULL,
			'website_favicon' => NULL,
			'custom_logo_enabled' => 1
		);
	}

	/**
	 * Update a specific setting
	 */
	public function update_setting($column, $value)
	{
		$this->db->update('dt_generalsettings', array($column => $value));
		return $this->db->affected_rows() >= 0;
	}

	/**
	 * Get a single setting value
	 */
	public function get_setting($column)
	{
		$this->db->select($column);
		$query = $this->db->get('dt_generalsettings');
		if ($query->num_rows() > 0) {
			$row = $query->row();
			return $row->$column;
		}
		return NULL;
	}
}
?>
