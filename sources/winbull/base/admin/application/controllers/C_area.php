<?php
class C_area extends My_Controller {
	var $form_entry = "area_entry";	
	public function __construct()
	{
		parent::__construct();	
		$this->load->model("area_model");	
	}	
	function index()
	{
		
	}
	function open_listingform($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$this->load->view('area_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {			
		$this->load->model('area_model');				
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
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{		
		$this->load->model('area_model');					
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
			redirect("/C_area/open_listingform/");																										   																						//Sending status to view as success.
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
					$_POST['fv']['mrq_sno']		=	NULL;		
				}	
				$_POST['fv']['db_error_msg']= $db_error_msg;
				$this->load->view($this->form_entry,$_POST['fv']);	//Load entry View to display errors.
			}	
		}						
	}			
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */