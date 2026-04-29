<?php
class C_hedgemaster extends My_Controller {
	var $hedge_code	= 82;
	var $form_entry = "hedgemaster_entry";
	public function __construct()
	{
		parent::__construct();	
		$this->load->model("Hedgemaster_model");	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	function open_listingform($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->hedge_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('hedgemaster_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {			
		$this->load->model('hedgemaster_model');				
		if ($type=='add_new')	
		{							
				$record					=	$this->$model_name->empty_record();
				$_POST['fv']['type']	=	$type;
				$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
				foreach($this->session->userdata("usermenurights") as $key => $val){
					if($val["menuid"] == $this->hedge_code){
						$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
					}
				}
				$this->load->view($this->form_entry,$_POST['fv']);
		}	
		else if($type=='edit')
		   {
		   	  $record					=	$this->$model_name->get_entry_record($id);
			  $code						=	$id;
			  $_POST['fv']				=	$record;
			  $_POST['fv']['type']		=	$type;
			  $_POST['fv']['code']		=	$code;
			  $_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
				foreach($this->session->userdata("usermenurights") as $key => $val){
					if($val["menuid"] == $this->hedge_code){
						$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
					}
				}
			
			  $this->load->view($this->form_entry,$_POST['fv']);
			}
		else if($type=='delete') 
			{				
			  $record					=	$this->$model_name->get_entry_record($id);
			  $code						=	$id;
			  $_POST['fv']				=   $record;
			  $_POST['fv']['type']		=   $type;
			  $_POST['fv']['code']		=	$code;
			  $_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
				foreach($this->session->userdata("usermenurights") as $key => $val){
					if($val["menuid"] == $this->hedge_code){
						$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
					}
				}
			  $this->load->view($this->form_entry,$_POST['fv']);
		}	  	
	}
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{		
		$this->load->model('hedgemaster_model');					
		$this->db->trans_begin();  // Begin Transaction		
		
     	if($status=='add_new')
		{			
			$this->$model_name->insert_record($id);	
			$success_msg = "Hedge master record added successfully.";
		}
		else if($status=='edit') {
			$this->$model_name->update_record($id);	
			$success_msg = "Hedge master record updated successfully.";
		}
		else if($status=='delete') {
			$this->$model_name->delete_record($id);	
			$success_msg = "Record deleted successfully.";
		}
		else 
		{
			$this->load->view($this->form_entry,$_POST['fv']);	
		}
		//Call insert function from loaded db model to insert record.				
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$this->session->set_flashdata('success', $success_msg);				//Sending status to view as success.
			redirect("/C_hedgemaster/open_listingform/");		
		}
		else
		{		
			$db_error_msg = $this->db->error()['message'];
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	//Rollback all transactions.
			$this->session->set_flashdata('error', $db_error_msg);
			$_POST['fv']['type']	=	$status;				//Sending status to view as failure.				
			if($status == "delete") {
				$this->open_listingform($db_error_msg);				
			} else {
				if($status == "add_new") {
					$_POST['fv']['hm_id']		=	NULL;		
				}	
				$_POST['fv']['db_error_msg']= $db_error_msg;
				$this->load->view($this->form_entry,$_POST['fv']);	//Load entry View to display errors.
			}	
		}						
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */