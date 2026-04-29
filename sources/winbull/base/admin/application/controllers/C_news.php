<?php
class C_news extends My_Controller
{
	var $menu_code	= 36;
	var $form_entry = "news_entry";
	public function __construct()
	{
		parent::__construct();
		$this->load->helper('common');
	}

	function index() {}

	function open_listingform($db_error_msg = "")
	{
		$data["db_error_msg"] = $db_error_msg;
		$this->load->model('news_model');
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['view'] == 1) {
			$this->load->view('news_listing', $data);
		} else {
			$this->load->view('access_denied');
		}
	}

	// Entry Form
	function open_entryform($model_name = "", $type = "", $id = "")
	{
		$this->load->model('news_model');
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
			$code					=	$id;
			$_POST['fv']			=	$record;
			$_POST['fv']['type']	=	$type;
			$_POST['fv']['code']	=	$code;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach ($this->session->userdata("usermenurights") as $key => $val) {
				if ($val["menuid"] == $this->menu_code) {
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			$this->load->view($this->form_entry, $_POST['fv']);
		}
		// BUG-05 FIX: Removed dead 'delete' case — delete is handled via AJAX directly to DB_Controller
	}

	function DB_Controller($model_name = "", $status = "", $id = "")
	{
		$this->load->model($model_name);
		$is_ajax = $this->input->is_ajax_request();
		$this->db->trans_begin();

		$result = [];
		$message = "";

		if ($status == 'add_new') {
			$result = $this->$model_name->insert_record($id);
			$message = (isset($result['status']) && $result['status'] == 1) ? 'Record added successfully.' : ($result['message'] ?? 'Failed to add record.');
		} else if ($status == 'edit') {
			$result = $this->$model_name->update_record($id);
			$message = (isset($result['status']) && $result['status'] == 1) ? 'Record updated successfully.' : ($result['message'] ?? 'Failed to update record.');
		} else if ($status == 'delete') {
			$result = $this->$model_name->delete_record($id);
			$message = (isset($result['status']) && $result['status'] == 1) ? 'Record deleted successfully!' : ($result['message'] ?? 'Failed to delete the record!');
		}

		if ($this->db->trans_status() === TRUE && (!isset($result['status']) || $result['status'] == 1)) {
			$this->db->trans_commit();

			if ($status == "add_new") {
				// Send push notification to all registered devices
				$push_model = "usersms_settings_model";
				$this->load->model($push_model);
				$registerids = $this->usersms_settings_model->getnotificationids();
				$regIdChunk  = array_chunk($registerids, 1000);

				$appid       = Globals::$app_id;
				$authorize   = Globals::$onesignalauth;
				// BUG-06 FIX: Guard against empty API URL before firing curl
				$onesignalAPI = isset(Globals::$onesignalAPI) ? Globals::$onesignalAPI : '';

				if (!empty($onesignalAPI) && !empty($appid)) {
					foreach ($regIdChunk as $RegId) {
						$registrationIds = $RegId;
						$content = array(
							"en" => $_POST['fv']['newsshortdesc']
						);
						$fields = array(
							'app_id'             => $appid,
							'include_player_ids' => $registrationIds,
							'contents'           => $content,
							// BUG-07 FIX: Authorization header — removed extra quotes around key
							// Was: 'Authorization: Basic "' . $authorize . '"'  ← always 401
							'headings'           => array("en" => isset($_POST['fv']['newstitle']) ? $_POST['fv']['newstitle'] : "News updated"),
							'subtitle'           => array("en" => '')
						);
						$fields = json_encode($fields);

						$ch = curl_init();
						curl_setopt($ch, CURLOPT_URL, $onesignalAPI);
						curl_setopt($ch, CURLOPT_HTTPHEADER, array(
							'Content-Type: application/json; charset=utf-8',
							'Authorization: Basic ' . $authorize   // BUG-07 FIX: no quotes
						));
						curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
						curl_setopt($ch, CURLOPT_HEADER, FALSE);
						curl_setopt($ch, CURLOPT_POST, TRUE);
						curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
						curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
						$response = curl_exec($ch);
						curl_close($ch);
					}
				}
			}

			if ($is_ajax) {
				echo json_encode(["status" => "success", "message" => $message]);
				exit;
			}
			$this->session->set_flashdata('success', $message);
			redirect("/C_news/open_listingform/");
		} else {
			$db_error = $this->db->error();
			$db_error_msg = isset($result['message']) ? $result['message'] : $this->general_model->get_errormessage($db_error['code']);
			if (!empty($db_error['code']) && empty($db_error_msg)) {
				$db_error_msg = $db_error['message'];
			}

			$this->db->trans_rollback();

			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => $db_error_msg]);
				exit;
			}

			$_POST['fv']['type'] = $status;
			if ($status == "delete") {
				$this->session->set_flashdata('error', $db_error_msg);
				redirect("/C_news/open_listingform/");
			} else {
				if ($status == "add_new") {
					$_POST['fv']['news_id'] = NULL;
				}
				$_POST['fv']['db_error_msg'] = $db_error_msg;
				$this->load->view($this->form_entry, $_POST['fv']);
			}
		}
	}
}

/* End of file C_news.php */