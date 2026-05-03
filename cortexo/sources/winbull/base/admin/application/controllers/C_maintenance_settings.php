<?php
class C_maintenance_settings extends My_Controller {
	var $menu_code = 86;
	var $form_entry = "maintenance_settings_entry";

	public function __construct()
	{
		parent::__construct();
		$this->load->model("Maintenance_settings_model");
	}

	function index()
	{
	}

	function open_entry_form() {
		$data = array();
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$data['settings'] = $this->Maintenance_settings_model->get_settings();
			$this->load->view($this->form_entry, $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}

	function toggle_website_maintenance() {
		$status = (int)$this->input->post('status');
		$this->Maintenance_settings_model->update_setting('website_maintenance', $status);
		echo json_encode(array('status' => 'success', 'message' => 'Website maintenance mode ' . ($status ? 'enabled' : 'disabled')));
	}

	function toggle_android_maintenance() {
		$status = (int)$this->input->post('status');
		$this->Maintenance_settings_model->update_setting('android_maintenance', $status);
		echo json_encode(array('status' => 'success', 'message' => 'Android app maintenance mode ' . ($status ? 'enabled' : 'disabled')));
	}

	function toggle_ios_maintenance() {
		$status = (int)$this->input->post('status');
		$this->Maintenance_settings_model->update_setting('ios_maintenance', $status);
		echo json_encode(array('status' => 'success', 'message' => 'iOS app maintenance mode ' . ($status ? 'enabled' : 'disabled')));
	}

	function save_message() {
		$message = $this->input->post('maintenance_message');
		$message = trim($message);
		if (empty($message)) {
			$message = NULL;
		}
		$this->Maintenance_settings_model->update_setting('maintenance_message', $message);
		$this->session->set_flashdata('success', 'Maintenance message updated successfully.');
		redirect('C_maintenance_settings/open_entry_form');
	}
}
