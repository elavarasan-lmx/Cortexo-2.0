<?php
class C_ajax extends My_Controller
{
	var $req_menu_code	= 83;
	public function __construct()
	{
		parent::__construct();
	}
	function ajax_()
	{
		/* if($this->login_model->check_to_clear_session()==false) {
			echo "loggedout";
		} else {			
			echo "1";
		} */
		//echo $this->session->userdata('is_logged_in');
		echo "1";
	}
	function getPostVars()
	{
		$this->load->model("xmldata_model");
		$this->xmldata_model->insertData($this->input->post(NULL, true));
	}
	function update_status()
	{
		$this->load->model("userregistration_model");
		$this->db->trans_begin();
		$update_ids = $this->input->post('update_ids', true);
		$active_id = $this->input->post('active_id', true);
		$this->userregistration_model->update_customerActive($update_ids, $active_id);
		if ($this->db->trans_status() === TRUE) {
			$this->db->trans_commit();
			echo json_encode(['status' => 'success', 'message' => 'Status updated successfully']);
		} else {
			$this->db->trans_rollback();
			echo json_encode(['status' => 'error', 'message' => 'Failed to update status']);
		}
	}
	function create_smsurl()
	{
		$this->load->model("customerservice_model");
		$group_id = $this->input->post('group_id', true);
		$send_type = $this->input->post('send_type', true);
		$result = $this->customerservice_model->get_smsurl($group_id, $send_type);
		echo json_encode(['status' => 'success', 'data' => $result]);
	}
	function create_comgroupsmsurl()
	{
		$this->load->model("commoditygroupcustomerservice_model");
		$group_id = $this->input->post('group_id', true);
		$send_type = $this->input->post('send_type', true);
		echo $this->commoditygroupcustomerservice_model->get_comgrpsmsurl($group_id, $send_type);
	}
	/*
	@@Param $model_name -> model name which to be loaded
	@@Param $id 		-> id of the service group to which the email to be send	
	*/
	function send_email()
	{
		$this->load->model("customerservice_model");
		$group_id = $this->input->post('group_id', true);
		$send_type = $this->input->post('send_type', true);
		$email_id = $this->customerservice_model->get_emailid($group_id);
		$data = $this->customerservice_model->get_smsurl($group_id, $send_type);
		$email_resp = email_notification_helper($email_id, $data["subject"], $data['email_content']);
		if (!$email_resp) {
			echo "Mail sending failed";
		} else {
			echo "Mail send successfully";
		}
	}
	function send_groupemail()
	{
		$this->load->model("commoditygroupcustomerservice_model");
		$group_id = $this->input->post('group_id', true);
		$send_type = $this->input->post('send_type', true);
		$email_id = $this->commoditygroupcustomerservice_model->get_emailid($group_id);
		$data = $this->commoditygroupcustomerservice_model->get_comgrpsmsurl($group_id, $send_type);
		$email_resp = email_notification_helper($email_id, $data["subject"], $data['email_content']);
		if (!$email_resp) {
			echo "Mail sending failed";
		} else {
			echo "Mail send successfully";
		}
	}
	/*
	
	*/
	function update_deliverystatus()
	{
		$this->load->model("bookingdelivery_model");
		$update_ids = $this->input->post('update_ids', true);
		$this->db->trans_begin();  // Begin Transaction	
		$this->bookingdelivery_model->set_deliverystatus($update_ids);
		if ($this->db->trans_status() === TRUE) {
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error'] = "success";
			//Send E-Mail			
			$this->load->model("booking_model");
			for ($i = 0; $i < count($update_ids); $i++) {
				$data["service_id"] = "5";
				$data = $this->booking_model->get_EmailContent($data["service_id"], $update_ids[$i]);
				if (strlen($data['email_id']) > 0) {
					$email_resp = email_notification_helper($data['email_id'], $data["email_subject"], $data['email_content']);
				}
			}
		} else {
			$data['error'] = "Error";
		}
	}
	/*
	
	*/
	function c_deleterecord()
	{
		$this->load->model("bookingreport_model");
		$update_ids = $this->input->post('update_ids', true);
		$this->db->trans_begin();  // Begin Transaction	
		$this->bookingreport_model->delete_record($update_ids);
		if ($this->db->trans_status() === TRUE) {
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error'] = "success";
		} else {
			$data['error'] = "Error";
		}
	}
	function get_schedulegroup()
	{
		$this->load->model("customerservice_model");
		$send_type = $this->input->post('send_type', true);
		echo $this->customerservice_model->get_groupid($send_type);
	}
	function get_deliverysmsurl()
	{
		$this->load->model("booking_model");
		$book_no = $this->input->post('book_no', true);
		echo $this->booking_model->get_SMSURL(5, $book_no);
	}
	public function clear_flash()
	{
		$this->session->unset_userdata(['success', 'error', 'delete_success', 'delete_error']);
	}


	//Quotation Module Start
	function open_listingform()
	{
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach ($this->session->userdata("usermenurights") as $key => $val) {
			if ($val["menuid"] == $this->req_menu_code) {
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if ($data["userrights"]['view'] == 1) {
			$this->load->view('quotation_listing', $data);
		} else {
			$this->load->view('access_denied');
		}
	}

	function get_quotation_data()
	{
		$this->load->model("booking_model");
		$data 			= 	$this->booking_model->get_quotation_data()->result_array();
		echo json_encode($data);
	}

	function update_quotation()
	{
		$this->load->model("booking_model");
		$quotation_id = $this->input->post('quotation_id', true);
		$approved = $this->input->post('approved', true);
		$narration = $this->input->post('narration', true);
		$this->db->trans_begin();
		$this->booking_model->update_quotation_status($quotation_id, $approved, $narration);
		if ($this->db->trans_status() === TRUE) {
			$this->db->trans_commit();
			echo json_encode(array('status' => 'success', 'message' => 'Updated successfully'));
		} else {
			$this->db->trans_rollback();
			echo json_encode(array('status' => 'error', 'message' => 'Update failed'));
		}
	}
	//Quotation Module End
}
