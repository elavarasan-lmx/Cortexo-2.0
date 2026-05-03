<?php
class C_sms_settings extends My_Controller {
	var $entry_form = "sms_settings_entry";	
	var $menu_code	= 39;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("sms_settings_model");
	}	
	function index()
	{
		
	}
	
	function open_listingform() {
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		if($data["userrights"]['view'] == 1)
		{
			$this->load->view('sms_listing',$data);
		}
		else
		{
			$this->load->view('access_denied');
		}
	}

	// Entry Form
	function open_entry_form($model_name="",$type="",$id="") {	
		$this->load->model('sms_settings_model');				
		if($type=='edit'){
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
			$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach($this->session->userdata("usermenurights") as $key => $val){
				if($val["menuid"] == $this->menu_code){
					$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
				
		  $this->load->view($this->entry_form,$_POST['fv']);
		}
			
	  	//$this->load->view($this->entry_form);

	}
	
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{	
		
		$this->load->model('sms_settings_model');					
		$this->db->trans_begin();  // Begin Transaction		
		//print_r($_POST['fv']);
		
		if($status=='edit') {
			$result = $this->$model_name->update_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record updated successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to update record.');
			}	
		}
		//$this->$model_name->update_record();	
		//Call insert function from loaded db model to insert record.				
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.
			$this->db->trans_commit();											//Commit the transactions.
			$data['error']="success";
			redirect("/C_sms_settings/open_listingform/".$model_name."/");																										   																						//Sending status to view as success.
		}
		else
		{							
			//This will execute when any transactions will fail.
			$this->db->trans_rollback();	
											//Rollback all transactions.
			$data['error']			=	"failure";	
			$_POST['fv']['type']	=	$status;										//Sending status to view as failure.												
			$this->load->view($this->entry_form);	//Load entry View to display errors.
		}
	}			
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */