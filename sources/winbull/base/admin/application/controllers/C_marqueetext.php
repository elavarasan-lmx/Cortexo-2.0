<?php
class C_marqueetext extends My_Controller
{
	var $menu_code	= 35;
	var $form_entry = "marqueetext_entry";
	var $model_name = 'marqueetext_model';
	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}
	function index() {}
	function open_listingform($db_error_msg = "")
	{
		$data["db_error_msg"] = $db_error_msg;
		$model_name = 'marqueetext_model';
		$this->load->model('marqueetext_model');
		$data['marquees'] = $this->$model_name->get_data()->result_array();
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['view'] == 1) {
			$this->load->view('marqueetext_listing', $data);
		} else {
			$this->load->view('access_denied');
		}
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$this->load->model('marqueetext_model');
		if ($type == 'add_new') {
			$record					=	$this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'edit') {
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			$this->load->view($this->form_entry, $_POST['fv']);
		} else if ($type == 'delete') {

			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=   $record;
			$_POST['fv']['type']		=   $type;
			$_POST['fv']['code']		=	$code;

			$this->load->view($this->form_entry, $_POST['fv']);
		}
	}
	public function DB_Controller($model_name = '', $status = '', $id = '')
	{
		$this->load->model('marqueetext_model');
		$is_ajax = $this->input->is_ajax_request();
		$this->db->trans_begin();

		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			
			if (!empty($result['status']) && $result['status'] == 'already_active') {
				if ($is_ajax) {
					echo json_encode(["status" => "error", "toast" => ["type" => "error", "message" => "Another marquee is already active!"]]);
					exit;
				}
			}

			$message = (!empty($result['status']) && $result['status'] == 1) ? 'Marquee added successfully.' : 'Failed to add marquee.';
		} elseif ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			
			if (!empty($result['status']) && $result['status'] == 'already_active') {
				if ($is_ajax) {
					echo json_encode(["status" => "error", "toast" => ["type" => "error", "message" => "Another marquee is already active!"]]);
					exit;
				}
			}

			$message = (!empty($result['status']) && $result['status'] == 1) ? 'Marquee updated successfully.' : 'Failed to update marquee.';
		} elseif ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			$message = (!empty($result['status']) && $result['status'] == 1) ? 'Marquee deleted successfully.' : 'Failed to delete marquee.';
		} else {
			if ($is_ajax) {
				echo json_encode(["status" => "error", "toast" => ["type" => "error", "message" => "Invalid request."]]);
				exit;
			}
			return;
		}

		if ($this->db->trans_status() === TRUE) {
			$this->db->trans_commit();
			$this->session->set_flashdata("success", $message);

			if ($is_ajax) {
				echo json_encode(["status" => "success", "toast" => ["type" => "success", "message" => $message]]);
				exit;
			}
			redirect("/C_marqueetext/open_listingform");
		} else {
			$this->db->trans_rollback();
			$error_msg = $this->db->error()['message'];
			$this->session->set_flashdata("error", $error_msg);

			if ($is_ajax) {
				echo json_encode(["status" => "error", "toast" => ["type" => "error", "message" => $error_msg]]);
				exit;
			}
			redirect("/C_marqueetext/open_listingform");
		}
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */