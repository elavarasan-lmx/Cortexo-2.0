<?php
class change_psw_model extends CI_Model
{
	var $table_name = 'dt_admin_user';

	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}

	// Check that old password is correct
	public function is_correct_password($user_name, $password)
	{
		$sql = "SELECT admin_user_id 
                FROM dt_admin_user 
                WHERE admin_user_name = ? 
                  AND admin_user_password = ?";

		return ($this->db->query($sql, [$user_name, $password])->num_rows() > 0);
	}

	// Update password + log changes
	public function update_record($user_name, $old_password, $new_password, $sec_code)
	{
		$admin_data = [
			'admin_user_password' => $new_password,
			'admin_sec_code'      => $sec_code
		];

		// Fetch OLD record for comparison
		$sql = "SELECT * FROM dt_admin_user
                WHERE admin_user_name = ? AND admin_user_password = ?";
		$old = $this->db->query($sql, [$user_name, $old_password])->row_array();

		// Update password
		$this->db->where("admin_user_name", $user_name);
		$this->db->where("admin_user_password", $old_password);
		$this->db->update($this->table_name, $admin_data);

		// If updated
		if ($this->db->affected_rows() > 0) {

			// Detect changed fields
			$changed = get_changed_fields($old, $admin_data);

			if (!empty($changed)) {
				$old_vals = [];
				$new_vals = [];

				foreach ($changed as $field => $values) {
					$old_vals[$field] = $values['old'];
					$new_vals[$field] = $values['new'];
				}

				// Logging (do not remove)
				log_admin_edit(
					'18',
					'Change Password',
					$old_vals,
					$new_vals,
					'Admin updated password for: ' . $user_name
				);
			}

			return ['status' => true];
		}

		return [
			'status'  => false,
			'message' => "No changes were made"
		];
	}
}
