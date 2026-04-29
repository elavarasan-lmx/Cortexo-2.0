<?php
class C_clients extends My_Controller {
	var $form_entry = "client_entry";	
	var $model_name = "Client_model";	
	var $menu_code	= 70;
	public function __construct()
	{
		parent::__construct();	
		$this->load->model("Client_model");
		$this->load->helper('common');
	}
	function index() {		
	
	}
	function open_listingform($cus_type = '', $db_error_msg="") {		
		$data["db_error_msg"] = $db_error_msg;
		$data["cus_type"] = $cus_type;
		$data["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
		foreach($this->session->userdata("usermenurights") as $key => $val){
			if($val["menuid"] == $this->menu_code){
				$data["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
			}
		}
		$this->load->view('clients_listing', $data);
	}
	// Entry Form
	function open_entryform($model_name="",$type="",$id="") {			
		$this->load->model($model_name);				
		if($type=='add_new')	
		{							
			$record					=	$this->$model_name->empty_record();
			//$serv 					=	$this->$model_name->get_serv_status(1);
			$_POST['fv']['type']	=	$type;
			//$_POST['fv']['serv']	=   $serv;
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
			 $record['contracts'] 		=	$this->$model_name->get_contracts();
			 $code						=	$id;
			 $_POST['fv']				=	$record;
			 $_POST['fv']['type']		=	$type;
			 //$_POST['fv']['code']		=	$code;
			 //$_POST['fv']['serv']			=   $serv;
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
			 //$_POST['fv']['code']		=	$code;
			 $_POST['fv']["userrights"] = array("view" => 0, "add" => 0, "edit" => 0, "delete" => 0, "sms" => 0, "email" => 0, "notification" => 0);
				foreach($this->session->userdata("usermenurights") as $key => $val){
					if($val["menuid"] == $this->menu_code){
						$_POST['fv']["userrights"] = array("view" => $val["view"], "add" => $val["add"], "edit" => $val["edit"], "delete" => $val["delete"], "sms" => $val["sms"], "email" => $val["email"], "notification" => $val["notification"]);
					}
				}
			 $this->load->view($this->form_entry,$_POST['fv']);
		}	  	
	}
	function fetch_clients_details(){
		$this->load->model("Client_model");
		$status = $this->Client_model->fetch_update_clients();
		if($status){
			echo json_encode(array("success" => true, "message" => "Clients created successfully"));
		}else{
			echo json_encode(array("success" => false, "message" => "Clients creation faild"));
		}
		
	}
	
	
	function delete_client($client_id)
	{
		$customers = $this->input->post('client_id');
		if($customers){
			$this->$model_name->delete_record($customer);
		}
		redirect("/C_clients/open_listingform");
	}
	
	function DB_Controller($model_name="",$status="",$id="")//Control DB Process and Validation Process.
	{
		$this->load->model($model_name);					
		$this->db->trans_begin();  // Begin Transaction
     	if($status=='add_new')
		{
			$result = $this->$model_name->insert_record($id);
		} else if($status=='edit') {
			$result = $this->$model_name->update_record($id);
		} else if($status=='delete') {
			$result = $this->$model_name->delete_record($id);
		} else {
			$this->load->view($this->form_entry,$_POST['fv']);	
			return;
		}

		//Commit or rollback based on DB transaction status
		if($this->db->trans_status() === TRUE)
		{	
			$this->db->trans_commit();	//Commit the transactions.
			// Now check the model result AFTER commit
			if (isset($result['status']) && $result['status'] == 1) {
				$msg = isset($result['message']) && $result['message'] != '' ? $result['message'] : 'Record saved successfully.';
				$this->session->set_flashdata('success', $msg);
			} else {
				$msg = isset($result['message']) && $result['message'] != '' ? $result['message'] : 'Operation failed. Please try again.';
				$this->session->set_flashdata('error', $msg);
			}
		}
		else
		{
			$this->db->trans_rollback();	//Rollback all transactions.
			$this->session->set_flashdata('error', "Database error occurred. Please try again.");
		}
		redirect("/C_clients/open_listingform");					
	}
		
	public function getcutomer($cus_type="")
	{	
		$this->load->model("client_model");
		$valll= $cus_type == 4 ? $this->client_model->get_data($cus_type) : $this->client_model->get_data($cus_type)->result_array();
		echo json_encode($valll);
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */