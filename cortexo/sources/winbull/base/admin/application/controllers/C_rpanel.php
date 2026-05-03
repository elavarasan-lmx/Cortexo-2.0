<?php

class C_rpanel extends My_Controller {

	public function __construct()
	{
		parent::__construct();
		$this->load->model('Xmldata_model');
	}
	
	function index()
	{
		$rpaneldata = $this->Xmldata_model->getrpaneldata();
		$rpaneldata['disable_rpaneledit'] = $this->Xmldata_model->disable_rpaneledit_settings();
		$this->load->view('r_panel', $rpaneldata);
		//$this->output->cache(60);

	}
	function DB_Controller()	//Control DB Process and Validation Process.
	{
		$this->load->model('Xmldata_model');

		// Block save if user is read-only
		$disable_rpaneledit = $this->Xmldata_model->disable_rpaneledit_settings();
		if ($disable_rpaneledit == 1) {
			$this->session->set_flashdata('error', 'You do not have permission to modify R-Panel data.');
			redirect('C_rpanel');
			return;
		}

		$this->db->trans_begin();  // Begin Transaction		
		//print_r($_POST['fv']);		
     	$this->Xmldata_model->insertData();	
		//Call insert function from loaded db model to insert record.				
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();									//Commit the transactions.
			$data['error']="success";
			redirect('C_rpanel');										//Sending status to view as success.
		}
		else
		{								
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	
			redirect('C_rpanel');										//Rollback all transactions.
		}					
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */