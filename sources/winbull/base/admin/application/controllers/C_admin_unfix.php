<?php
class C_admin_unfix extends My_Controller {
	var $form_entry = "unfix_entry";	
	var $menu_code	= 76;
	public function __construct()
	{
		parent::__construct();
		$this->load->model("Unfix_model");			
	}	
	
	
	
	function open_listingform($db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		$this->load->view('unfix_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="",$cus_id="") {			
		$this->load->model($model_name);				
		$record	=	$this->$model_name->empty_record();
		if ($type=='add_new')	
		{							
			$_POST['fv']['date']=date('d-m-Y');
			$_POST['fv']['type']	=	$type;
			$_POST['fv']['cus_id']	=	$id;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach($this->session->userdata("usermenurights") as $key => $val){
				if($val["menuid"] == $this->menu_code){
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			$this->load->view('unfix_entry',$_POST['fv']);
		}else if($type=='save')
        {
			$pay_date = date("Y-m-d", strtotime($_POST['date']));
			unset($_POST['date']);
			$_POST['date']=$pay_date;
            $record					=	$this->$model_name->save_entry_record($_POST);
        
			redirect('C_admin_unfix/cus_unfix_payment/'.$_POST['cus_id']);
		}	
		else if($type=='edit')
		{
          
			$record					=	$this->$model_name->get_entry_record($id);
			$code						=	$id;
			$_POST['fv']				=	$record;
			$_POST['fv']['type']		=	$type;
			$_POST['fv']['code']		=	$code;
			//   print_r($record);exit;

			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach($this->session->userdata("usermenurights") as $key => $val){
				if($val["menuid"] == $this->menu_code){
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}

			$this->load->view('unfix_entry',$_POST['fv']);
		}
		/* else if($type=='update')
		{
		$pay_date = date("Y-m-d", strtotime($_POST['date']));
		unset($_POST['key']);
		$_POST['date']=$pay_date;

		  $record					=	$this->$model_name->update_record($id,$_POST);
		  
			 redirect('C_admin_unfix/cus_unfix_payment/'.$_POST['party_name']);
		} */
		else if($type=='delete') 
		{		
			$record						=	$this->$model_name->delete_record($id);
			if($record) {
				$this->session->set_flashdata('success', 'Record deleted successfully!');
			} else {
				$this->session->set_flashdata('error', 'Failed to delete the record!');
			}

			$code						=	$id;
			$_POST['fv']				=   $record;
			$_POST['fv']['type']		=   $type;
			$_POST['fv']['code']		=	$code;
			$_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
			foreach($this->session->userdata("usermenurights") as $key => $val){
				if($val["menuid"] == $this->menu_code){
					$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
				}
			}
			redirect('C_admin_unfix/cus_unfix_payment/'.$cus_id);
		}	
	}
	function DB_Controller($model_name="",$status="",$id="")	//Control DB Process and Validation Process.
	{		
		// echo "aaaaa";exit;
		$this->load->model($model_name);					
		$this->db->trans_begin();  // Begin Transaction		
	
     	if($status=='add_new')
		{			
			// echo "aaaaa";exit;
			$result = $this->$model_name->insert_record($id);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record added successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to add record.');
			}	
		}
		else if($status=='edit') {
			// print_r("fefref");exit;
			$result = $this->$model_name->update_record($id,$_POST);
			if (isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record Updated successfully.');
			} else {
				$this->session->set_flashdata('error', 'Failed to update record.');
			}	
		}
		else if($status=='delete') {
			// echo "vvvv";	
				// print_r("fefref");exit;
			
			$result = $this->$model_name->delete_record($id);
			if(isset($result['status']) && $result['status'] == 1) {
				$this->session->set_flashdata('success', 'Record deleted successfully!');
			} else {
				$this->session->set_flashdata('error', 'Failed to delete the record!');
			}	
		}
		else 
		{
			
			$this->load->view('unfix_entry',$_POST['fv']);	
		}
						//Call insert function from loaded db model to insert record.				
		if($this->db->trans_status()===TRUE)
		{									 
			//This will execute when all transactions insert without error.
			//echo "hai";exit;
			$this->db->trans_commit();											//Commit the transactions.
			$data['error']="success";											//Sending status to view as success.
			redirect("/C_admin_unfix/open_listingcus_form/");		
		}
			
	}
	
	function open_listingform_unfix() {		
		
		$data["db_error_msg"] = $db_error_msg;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		$this->load->view('unfix_entry', $data);
	}

	function open_listingcus_form() {		
		
		$this->load->view('unfix_cuslisting');
	}
	function cus_unfix_payment($id){
		$data['id']=$id;
	   $this->load->view('unfix_listing', $data);

   }
   function close_btn1(){
		$id=$_POST['unfix_id'];
		$update=$this->Unfix_model->close_btn1($id);
		echo json_encode($update);
   }
   function close_btn2(){
		$id=$_POST['book_no']; 
		$update=$this->Unfix_model->close_btn2($id);
		echo json_encode($update);
   }
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */