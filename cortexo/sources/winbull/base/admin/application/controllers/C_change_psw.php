<?php
class C_change_psw extends My_Controller
{
	var $entry_form = "change_psw_entry";

	public function __construct()
	{
		parent::__construct();
	}

	public function index() {}

	// Load form
	public function open_entry_form($model_name = "change_psw_model")
	{
		$this->load->view($this->entry_form);
	}

	// AJAX handler for password update
	public function DB_Controller($model_name = "change_psw_model")
	{
		$this->load->model($model_name);

		// Read POST values
		$old      = $_POST['fv']['previous_password'];
		$new      = $_POST['fv']['new_password'];
		$confirm  = $_POST['fv']['confirm_password'];
		$sec      = $_POST['fv']['sec_code'];
		$username = $this->session->userdata('username');

		// 1. Min length
		if (strlen($new) < 6) {
			echo json_encode([
				'status'  => "error",
				'message' => "Password must be at least 6 characters long"
			]);
			return;
		}

		// 1b. Max length (BZ-98)
		if (strlen($new) > 50) {
			echo json_encode([
				'status'  => "error",
				'message' => "Password must not exceed 50 characters"
			]);
			return;
		}

		// 2. Match check
		if ($new !== $confirm) {
			echo json_encode([
				'status'  => "error",
				'message' => "New Password and Confirm Password do not match"
			]);
			return;
		}

		// 3. Verify old password
		if (!$this->change_psw_model->is_correct_password($username, $old)) {
			echo json_encode([
				'status'  => "error",
				'message' => "Old password is incorrect"
			]);
			return;
		}

		// 4. Update
		$update = $this->change_psw_model->update_record($username, $old, $new, $sec);

		if ($update['status'] === true) {
			$this->session->set_flashdata('success', 'Password updated successfully');

			echo json_encode([
				'status'  => "success",
				'message' => "Password updated successfully"
			]);
			return;
		} else {
			echo json_encode([
				'status'  => "error",
				'message' => $update['message']
			]);
			return;
		}
	}
}
