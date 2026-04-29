<?php
class C_serv_master extends My_Controller {
	var $menu_code	= 34;
	var $entry_form = "serv_entry";	
	
	public function __construct()
	{
		parent::__construct();			
	}	
	function index()
	{
		
	}
	

	// Entry Form
	function open_entry_form($model_name="serv_model",$type="",$id="") {			
		$this->load->model('serv_model');				
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view($this->entry_form, $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	
	function DB_Controller($model_name="",$status="",$id="")
	{
		$this->load->model('serv_model');
		$is_ajax = $this->input->is_ajax_request();
		$this->db->trans_begin();
		
		$result = $this->$model_name->update_record();
		
		if($this->db->trans_status()===TRUE)
		{
			$this->db->trans_commit();
			$this->session->set_flashdata('success', 'Service settings updated successfully.');
			
			if ($is_ajax) {
				echo json_encode(["status" => "success", "message" => "Service settings updated successfully.", "redirect" => site_url('C_main/load_mainpage')]);
				exit;
			}
			redirect("/C_main/load_mainpage");
		}
		else
		{
			$this->db->trans_rollback();
			$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if($db_error_msg == "0") {
				$db_error_msg = $this->db->_error_message();
			}
			$this->session->set_flashdata('error', $db_error_msg);
			
			if ($is_ajax) {
				echo json_encode(["status" => "error", "message" => $db_error_msg]);
				exit;
			}
			$this->load->view($this->entry_form);
		}
	}			
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */