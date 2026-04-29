<?php
class C_user extends My_Controller {
	var $menu_code	= 55;
	public function __construct()
	{
		parent::__construct();
		$this->load->model('useronetimereg_model');	
		error_reporting(-1);		
	}	
	function index() 
	{		
	
	}
	function openevent_listingform($db_error_msg="")
	{			
		//$record=$this->load->model->get_data();
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		$this->load->view('useronetimereg_listing',$data);	
	}	
	function open_entryform($model_name="",$type="",$id="") 
	{		
		$this->load->model('user_model');		
		if($type=='add_new')	
		{						
			$record	= $this->$model_name->empty_record();
			$_POST['fv']['type']	=	$type;
			$this->load->view($this->form_entry,$_POST['fv']);
		}	
		else if($type=='edit')
		{	
		    $record						=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=   $record;	  
			$_POST['fv']['type']		=   $type;
			$_POST['fv']['code']		=	$code;
			  
			  $this->load->view($this->form_entry,$_POST['fv']);
		}
		else if($type=='delete') 
		{
			$record						=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=   $record;
			$_POST['fv']['type']		=   $type;
			$_POST['fv']['code']		=	$code;
			$this->load->view($this->form_entry,$_POST['fv']);
		}	  	
	}
	/*RB*/
	function DB_Controller($model_name="",$status="",$id="")	
	//Control DB Process and Validation Process.
	{		
		$this->load->model('user_model');					
		$this->db->trans_begin();  
		// Begin Transaction				
     	if($status=='add_new'){	
			$result = $this->$model_name->insert_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record added successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to add record.');
			}
		}else if($status=='edit'){
			$result = $this->$model_name->update_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record updated successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to update record.');
			}	
		}else if($status=='delete'){
			//print_r($id);
			$result = $this->$model_name->delete_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record deleted successfully!');
			} else {
				$this->session->set_flashdata('error', 'Failed to delete the record!');
			}
		}else if($status=='activate'){
			$this->$model_name->update_activaterecord($id);
		}else if($status=='update_status'){
			/* print_r($_POST['update_ids']); */
			$this->$model_name->update_activaterecord();
		}else{
			$this->load->view($this->form_entry,$_POST['fv']);	
		}
		//Call insert function from loaded db model to insert record.
		if($this->db->trans_status()===TRUE)
		{		
	        if(($status=='add_new') || $status=='edit') 
		    {
              	$this->db->trans_commit();		
				//Commit the transactions.
				
				$this->session->set_flashdata('success','Successfully saved Event');	
				//$this->session->set_flashdata('errorMsg','The Event Date is Already Added!');
				redirect("/C_userevent/openevent_listingform");	
			}
			else if($status =='delete')
			{	
				$this->db->trans_commit();
				//Commit the transactions.
				$this->session->set_flashdata('errorMsg','The  Event Deleted Successfully...!');
				redirect("/C_userevent/openevent_listingform");
				
			}
			else
			{	   
				$this->db->trans_commit();
				//Commit the transactions.
				$this->session->set_flashdata('errorMsg','The  Event Date is Already Added...!');
				redirect("/C_userevent/openevent_listingform");
			}
		}
		else 
		{	
				$this->db->trans_rollback();
				//Commit the transactions.
				$this->session->set_flashdata('errorMsg','The  Event Date is Already Added...!');
				redirect("/C_userevent/openevent_listingform");
		}	
	}
	/*RB*/
	// Entry Form
	/* function open_activateentryform($model_name="",$id="", $db_error_msg="") {			
		$this->load->model('user_model');				
		
		  $record					=	$this->$model_name->get_activateentry_record($id);
		  $_POST['fv']				=   $record;
		  $_POST['fv']["db_error_msg"] = $db_error_msg;
		  $this->load->view("userregistrationactivate_entry",$_POST['fv']);		
		  
	} */
	function mobileuser_listpdf($model_name="",$type="")
	{
		if($type == 'mobileuserpdf')
		{
			$this->load->model('useronetimereg_model');
			$customers = $this->$model_name->get_data()->result_array();
		
			//the load the domdpf file index.php
			$data = $this->load->view('convert_html_topdf_php/mobilepdf',$customers,true);
			redirect("/C_user/openevent_listingform/");	
		}	
	}
	function mobileuser_listprint($model_name="",$type="")
	{
		if($type == 'mobileuserprint')
		{
			$this->load->model('useronetimereg_model');
			$customers = $this->$model_name->get_data()->result_array();

			//the load the domdpf file index.php
			$data = $this->load->view('convert_html_topdf_php/mobileprint',$customers,true);
			redirect("/C_user/openevent_listingform/");	
		}		
	}		
}
