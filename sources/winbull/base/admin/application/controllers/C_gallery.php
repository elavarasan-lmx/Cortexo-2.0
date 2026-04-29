<?php
class C_gallery extends My_Controller
{
	var $form_entry = "gallery_entry";
	var $menu_code	= 3;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("gallery_model");
		$this->load->helper('common');
	}

	function index() {}

	function open_listingform($cus_type = '', $db_error_msg = "")
	{
		$data["db_error_msg"] = $db_error_msg;
		$data["cus_type"] = $cus_type;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		$this->load->view('gallery_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$this->load->model('gallery_model');
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
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}

			$this->load->view($this->form_entry, $_POST['fv']);
		}
	}
	function check_duplicate_name() {
		$gal_name = $this->input->post('gal_name');
		$gal_id = $this->input->post('gal_id');
		$result = $this->gallery_model->check_duplicate_name($gal_name, $gal_id);
		echo json_encode(['exists' => $result]);
	}

	function create_pushnotification()
	{
		$user_model_name = "usersms_settings_model";
		$this->load->model($user_model_name);
		$registerids = array();
		$registerids = $this->usersms_settings_model->getnotificationids();
		$model_name = "Gallery_model";
		$this->load->model('gallery_model');
		$gal_name = $this->$model_name->getgallery();
		$regIdChunk = array_chunk($registerids, 1000);
		$bigimagepath = "";

		foreach ($regIdChunk as $RegId) {
			$registrationIds = $RegId;
			$content = array(
				"en" => $gal_name
			);

			$fields = array(
				'app_id' => "",
				'include_player_ids' => $registrationIds,
				'contents' => $content,
				'headings' => array("en" => 'New product updated in gallery.'),
				'subtitle' => array("en" => Globals::$notification_subtitle),
				'android_accent_color' => "FBB929",
			);
			$fields = json_encode($fields);
			push_notification_helper($fields);
		}

		// $this->session->set_flashdata('message_notification', "Notification send successfully");
		redirect("C_gallery/open_listingform");
	}
	function DB_Controller($model_name = "", $status = "", $id = "")	//Control DB Process and Validation Process.
	{
		$this->load->model('gallery_model');
		$this->db->trans_begin();  // Begin Transaction		
		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
		} else if ($status == 'inline_edit') {
			$id = $_POST['id'];
			$result = $this->$model_name->inline_update($id);
		} else {
			$this->load->view($this->form_entry, $_POST['fv']);
			return;
		}
		//Call insert function from loaded db model to insert record.				
		if ($this->db->trans_status() === TRUE) {
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			if ($status == 'add_new') {
				$this->session->set_flashdata('success', 'Record added successfully.');
				redirect("/C_gallery/create_pushnotification");
			} else if ($status == 'edit') {
				$this->session->set_flashdata('success', 'Record updated successfully.');
				redirect("/C_gallery/open_listingform/");
			} else if ($status == 'delete') {
				$this->session->set_flashdata('success', 'Record deleted successfully.');
				redirect("/C_gallery/open_listingform/");
			} else if ($status == 'inline_edit') {
				$this->session->set_flashdata('success', 'Record updated successfully.');
				redirect("/C_gallery/open_listingform/");
			}
		} else {
			$this->db->trans_rollback();	//Rollback all transactions.
			$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if ($db_error_msg == "0") {
				$db_error_msg = $this->db->_error_message();
			}
			$this->session->set_flashdata('error', $db_error_msg);
			if ($status == "delete") {
				redirect("/C_gallery/open_listingform/");
			} else {
				$_POST['fv']['type'] = $status;
				$_POST['fv']['db_error_msg'] = $db_error_msg;
				$this->load->view($this->form_entry, $_POST['fv']);
			}
		}
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */
