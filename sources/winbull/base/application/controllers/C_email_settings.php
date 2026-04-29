<?php

class C_email_settings extends My_Controller {
	var $entry_form = "email_settings_entry";	
	
	public function __construct()
	{
		parent::__construct();			
	}	
	function index()
	{
		
	}
	function open_listingform() {
		$this->load->view('email_settings_listing');
	}

	// Entry Form
	function open_entry_form($model_name="email_settings_model",$type="",$id="") {			
		$this->load->model($model_name);				
		if($type=='edit'){
		  $record					=	$this->$model_name->get_entry_record($id);
		  $code						=	$id;
		  $_POST['fv']				=	$record;
		  $_POST['fv']['type']		=	$type;
		  $_POST['fv']['code']		=	$code;
		  
		  $this->load->view($this->entry_form,$_POST['fv']);
		}

	}
	
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{	
		
		//echo "I have been called...";
		$this->load->model($model_name);					
		$this->db->trans_begin();  // Begin Transaction		
		//print_r($_POST['fv']);
		
     	$this->$model_name->update_record($id);	
		
		//Call insert function from loaded db model to insert record.				
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error']="success";
			//redirect("/C_main/load_mainpage");	
			redirect("/C_email_settings/open_listingform/".$model_name."/");																										   																						//Sending status to view as success.
		}
		else
		{							
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	
											//Rollback all transactions.
			$data['error']			=	"failure";	
			$_POST['fv']['type']	=	$status;										//Sending status to view as failure.												
			$this->load->view($this->form_entry);	//Load entry View to display errors.
		}
	}			
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */