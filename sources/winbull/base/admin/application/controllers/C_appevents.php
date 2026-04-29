<?php
class C_appevents extends My_Controller {
	var $form_entry = "appevents_entry";	
	public function __construct()
	{
		parent::__construct();
		$this->load->model("appevents_model");
	}	
	
	function index() {
		
	}
	
	function open_listingform($db_error_msg="") {
		
		$data["db_error_msg"] = $db_error_msg;
		$this->load->view('appevents_listing',$data);
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {			
		$model_name = 'appevents_model'; // P-PERM fix: hardcode model name				
		if ($type=='add_new')	
		{							
				$record					=	$this->$model_name->empty_record();
				$_POST['fv']['type']	=	$type;
				$this->load->view($this->form_entry,$_POST['fv']);
		}	
		else if($type=='edit')
		   {
		   	  $record					=	$this->$model_name->get_entry_record($id);
			  $code						=	$id;
			  $_POST['fv']				=	$record;
			  $_POST['fv']['type']		=	$type;
			  $_POST['fv']['code']		=	$code;
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
	function create_pushnotification(){
	}
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{		
		$model_name = 'appevents_model'; // P-PERM fix: hardcode model name					
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
		else if($status == 'inline_edit') {
			$id = $_POST['id'];
			$this->$model_name->inline_update($id);	
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
			$data['error']="success";											//Sending status to view as success.
			if($status=='add_new'){
				redirect("/C_appevents/create_pushnotification");
			}
			else{
				redirect("/C_appevents/open_listingform/");	
			}
				
			
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
				$_POST['fv']['adv_id'] =	NULL;		
				$_POST['fv']['db_error_msg']  = $db_error_msg;
				$this->load->view($this->form_entry,$_POST['fv']);	//Load entry View to display errors.
			}	
		}						
	}			
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */