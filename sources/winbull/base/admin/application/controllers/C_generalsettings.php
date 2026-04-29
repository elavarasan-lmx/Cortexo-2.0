<?php
class C_generalsettings extends My_Controller {
	
	public function __construct()
	{
		parent::__construct();			
	}	
	function index()
	{
		
	}
	

	// Entry Form
	function open_entry_form() {			
		$this->load->model("generalsettings_model");
	  $this->load->view('generalsettings');

	}
	
	function DB_Controller()	//Control DB Process and Validation Process.
	{	
		
		$this->load->model("generalsettings_model");					
		$this->db->trans_begin();  // Begin Transaction		
		//echo "aaaaa";
		
		//print_r($_POST['fv']);
		
     	$this->generalsettings_model->update_record();	
		
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
		}	/**/					
	}		
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */