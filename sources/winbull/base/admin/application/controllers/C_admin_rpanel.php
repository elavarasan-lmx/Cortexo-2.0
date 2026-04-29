<?php
class C_admin_rpanel extends My_Controller
{
	var $gen_menu_code	= 31;
	var $rpgen_menu_code	= 32;
	var $entry_form = "adminrpanel_entry";
	var $general_entry_form = "admingeneral_entry";

	public function __construct()
	{
		parent::__construct();
		$this->load->model("adminrpanel_model");
		$this->load->helper('common');
	}
	function index() {}
	// Entry Form
	function open_entry_form($model_name = "adminrpanel_model", $type = "", $id = "")
	{
		$record		=	$this->adminrpanel_model->get_entry_record();
		$lite_trade = $this->db->select('lite_trade')->from('dt_generalsettings')->get()->row()->lite_trade ?? 0;
		$_POST['fv']	=	$record;
		$_POST['fv']['lite_trade'] = $lite_trade;
		$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->gen_menu_code) {
				$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($_POST['fv']["userrights"]['view'] == 1) {
			$this->load->view($this->entry_form, $_POST['fv']);
		} else {
			$this->load->view('access_denied');
		}
	}

	function general_entry_form()
	{
		$record		=	$this->adminrpanel_model->get_generalentry_record();
		$_POST['fv']	=	$record;
		$_POST['fv']['countries_mob1'] = $this->adminrpanel_model->getCountry($record['country_mob1'] ?? '');
		$_POST['fv']['countries_mob2'] = $this->adminrpanel_model->getCountry($record['country_mob2'] ?? '');
		$_POST['fv']['countries_mob3'] = $this->adminrpanel_model->getCountry($record['country_mob3'] ?? '');
		$_POST['fv']['countries_mob4'] = $this->adminrpanel_model->getCountry($record['country_mob4'] ?? '');
		$_POST['fv']['countries_mob5'] = $this->adminrpanel_model->getCountry($record['country_mob5'] ?? '');
		$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->rpgen_menu_code) {
				$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($_POST['fv']["userrights"]['view'] == 1) {
			$this->load->view($this->general_entry_form, $_POST['fv']);
		} else {
			$this->load->view('access_denied');
		}
	}

	public function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$model_name = 'adminrpanel_model'; // P-PERM fix: hardcode model name
		$this->load->model("General_model");
		$is_ajax = $this->input->is_ajax_request();
		$this->db->trans_begin();

		// BZ-46: Server-side guard — reject updates from users without edit permission
		$menu_code = ($id == 2) ? $this->rpgen_menu_code : $this->gen_menu_code;
		$has_edit = false;
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $menu_code && ($val["edit"] == 1 || $val["add"] == 1)) {
				$has_edit = true;
				break;
			}
		}
		if (!$has_edit) {
			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => "You do not have permission to edit these settings."]);
				exit;
			}
			$this->session->set_flashdata("error", "You do not have permission to edit these settings.");
			redirect($_SERVER['HTTP_REFERER']);
			return;
		}

		if ($id == 2)
			$result = $this->$model_name->update_general_record();
		else
			$result = $this->$model_name->update_record();

		if ($result['status'] == 1) {
			if ($id == 2)
				$message = "General Settings updated successfully!";
			else if ($id == 1)
				$message = "R Panel Settings updated successfully!";
			else
				$message = "Settings updated successfully!";
		} else {
			$message = "Failed to update settings.";
		}

		if ($this->db->trans_status() === TRUE) {
			$this->db->trans_commit();
			$this->session->set_flashdata("success", $message);

			if ($is_ajax) {
				echo json_encode(["status" => "success", "message" => $message]);
				exit;
			}
			redirect($_SERVER['HTTP_REFERER']);
		} else {
			$this->db->trans_rollback();
			$error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if ($error_msg == "0") $error_msg = $this->db->_error_message();
			$this->session->set_flashdata("error", $error_msg);

			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => $error_msg]);
				exit;
			}
			redirect($_SERVER['HTTP_REFERER']);
		}
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */