<?php
class C_rpanel_settings extends My_Controller {
	var $entry_form = "rpanel_settings_entry";	
	
	public function __construct()
	{
		parent::__construct();			
	}	
	function index()
	{
		
	}
	

	// Entry Form
	function open_entry_form($model_name="rpanel_settings_model",$type="",$id="") {			
		$this->load->model('rpanel_settings_model');				

	  $this->load->view($this->entry_form);

	}
	
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{	
		
		$this->load->model('rpanel_settings_model');					
		$this->db->trans_begin();  // Begin Transaction		
		//echo "aaaaa";
		
		//print_r($_POST['fv']);
		
     	$this->$model_name->update_record();	
		
		//Call insert function from loaded db model to insert record.				
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error']="success";
			redirect("/C_main/load_mainpage");	
			//redirect("/C_rpanel_settings/open_entry_form/".$model_name."/");																										   			//Sending status to view as success.
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