<?php
class C_commoditygroupcustomer extends My_Controller {
	var $menu_code	= 26;
	var $form_entry = "comgroupcustomerservice_entry";	
	public function __construct()
	{
		parent::__construct();
		$this->load->model('CommodityGroupCustomerservice_model');		
	}	
	function index() {
		
	}
	function open_listingform($db_error_msg="") {	
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('commoditygroupcustomerservice_listing', $data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {			
		$this->load->model($model_name);				
		if ($type=='add_new')	
		{							
			$record					=	$this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach($this->session->userdata("usermenurights") as $key => $val){
				if($val["menuid"] == $this->menu_code){
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
					if($val["menuid"] == $this->menu_code){
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
			  $this->load->view($this->form_entry,$_POST['fv']);
		}	  	
	}
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{		
		$this->load->model($model_name);					
		$this->db->trans_begin();  // Begin Transaction		
		//echo "aaaaa";
     	if($status=='add_new')
		{			
			$result = $this->$model_name->insert_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record added successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to add record.');
			}
		}
		else if($status=='edit') {
			$result = $this->$model_name->update_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record updated successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to update record.');
			}	
		}
		else if($status=='delete') {
			$result = $this->$model_name->delete_record($id);
			if(isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record deleted successfully!');
			} else {
				$this->session->set_flashdata('error', 'Failed to delete the record!');
			}	
		}
		else 
		{
			$this->load->view($form_entry,$_POST['fv']);	
		}
						//Call insert function from loaded db model to insert record.				
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error']="success";
			redirect("/C_commoditygroupcustomer/open_listingform/");																										   																						//Sending status to view as success.
		}
		else
		{		
			//$db_error_msg = $this->db->_error_number();								
			$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
			if($db_error_msg == "0") {
				$db_error_msg = $this->db->_error_message();
			}						
			//$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());			
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	//Rollback all transactions.
			$data['error']			=	"failure";	
			$_POST['fv']['type']	=	$status;				//Sending status to view as failure.				
			if($status == "delete") {
				$this->open_listingform($db_error_msg);				
			} else {
				if($status == "add_new") {
					$_POST['fv']['serv_group_id']	=	NULL;		
				}	
				$_POST['fv']['db_error_msg']= $db_error_msg;
				$this->load->view($this->form_entry,$_POST['fv']);	//Load entry View to display errors.
			}	
		}					
	}	
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */