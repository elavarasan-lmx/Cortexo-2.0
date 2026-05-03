<?php
class C_kyc extends CI_Controller {
	//var $form_entry = "Registration";	
	
	public function __construct()
	{
		parent::__construct();
		//$this->load->library('session');	
	}
	function index() {
		$this->load->library('session');
		$this->load->view('header');
		$this->load->view('kyc');
		$this->load->view('footer');		
	}
	
	function DB_Controller()	//Control DB Process and Validation Process.
	{	
	
		/*$this->load->helper(array('form', 'url'));

		$this->load->library('form_validation');
		$this->form_validation->set_error_delimiters('<div class="alert alert-error"><button class="close" data-dismiss="alert">�</button>', '</div>');
		$this->form_validation->set_rules('fv[cus_company_name]', 'Company Name', 'required');
		$this->form_validation->set_rules('fv[cus_address]', 'Address', 'required');
		$this->form_validation->set_rules('fv[cus_name1]', 'Proprietor / Partners Name', 'required');
		$this->form_validation->set_rules('fv[cus_mobile1]', 'Proprietor / Partners Phone', 'required');	
		$this->form_validation->set_rules('fv[cus_phone1]', 'Office Phone', 'required');
		$this->form_validation->set_rules('fv[cus_email]', 'Email', 'required|valid_email');
		$this->form_validation->set_rules('fv[cus_bnkname]', 'Bank Name', 'required');
		$this->form_validation->set_rules('fv[cus_branch]', 'Bank Branch', 'required');
		$this->form_validation->set_rules('fv[cus_accno]', 'Bank No', 'required');
		$this->form_validation->set_rules('fv[ifsccode]', 'Bank IFSC', 'required');
		$this->form_validation->set_rules('fv[cus_tin_no]', 'Tin No', 'required');
		$this->form_validation->set_rules('fv[cus_panno]', 'Pan No', 'required');*/
		
		/*$this->form_validation->set_rules('fv[addr_proof]', 'Address Proof scan copy', 'required');
		$this->form_validation->set_rules('fv[panno_copy]', 'Pan no scan copy', 'required');
		$this->form_validation->set_rules('fv[tinno_copy]', 'Tin no scan copy', 'required');
		$this->form_validation->set_rules('fv[deed_copy]', 'Partnership Deed Copy', 'required');
		
		if ($this->form_validation->run() == FALSE)
		{
			$this->load->view('kyc');
		}
		else
		{*/
		session_start();
		if(strtolower($_POST['answer']) == $_SESSION['6_letters_code'])
        {
			$this->load->library('session');	
			$model_name="KYC_model";
			$this->load->model($model_name);					
			$this->db->trans_begin();  // Begin Transaction		
			
			$cus_id = $this->$model_name->insert_record();
			
			//Call insert function from loaded db model to insert record.				
			if($this->db->trans_status()===TRUE)
			{									 
				$this->db->trans_commit();					
				if($_FILES['fv']['name']['cus_tincopy']!="")
					move_uploaded_file($_FILES['fv']['tmp_name']['cus_tincopy'], 'assets/kyc/tinno/'.$cus_id."-".$_FILES['fv']['name']['cus_tincopy']);
				if($_FILES['fv']['name']['cus_pancopy']!="")
					move_uploaded_file($_FILES['fv']['tmp_name']['cus_pancopy'], 'assets/kyc/panno/'.$cus_id."-".$_FILES['fv']['name']['cus_pancopy']);
				if($_FILES['fv']['name']['cus_addrcopy']!="")
					move_uploaded_file($_FILES['fv']['tmp_name']['cus_addrcopy'], 'assets/kyc/addrproof/'.$cus_id."-".$_FILES['fv']['name']['cus_addrcopy']);
				if($_FILES['fv']['name']['cus_dealcopy']!="")
					move_uploaded_file($_FILES['fv']['tmp_name']['cus_dealcopy'], 'assets/kyc/dealcopy/'.$cus_id."-".$_FILES['fv']['name']['cus_dealcopy']);									 
			$tin_no = strlen($_FILES['fv']['name']['cus_tincopy'])>0?($this->config->item('base_url').'assets/kyc/tinno/'.$cus_id."-".$_FILES['fv']['name']['cus_tincopy']):"";
			$pan_no = strlen($_FILES['fv']['name']['cus_pancopy'])>0?($this->config->item('base_url').'assets/kyc/panno/'.$cus_id."-".$_FILES['fv']['name']['cus_pancopy']):"";
			$addr_proof = strlen($_FILES['fv']['name']['cus_addrcopy'])>0?($this->config->item('base_url').'assets/kyc/addrproof/'.$cus_id."-".$_FILES['fv']['name']['cus_addrcopy']):"";
			$deal_copy = strlen($_FILES['fv']['name']['cus_dealcopy'])>0?($this->config->item('base_url').'assets/kyc/dealcopy/'.$cus_id."-".$_FILES['fv']['name']['cus_dealcopy']):"";
			
			
			$email_message =
							'<div style="width:750px;margin:5px;padding:20px;border:5px solid #FCBB4D">
							 <table width="750" style="outline:#000000">
								<tr>
									<td style="padding:12px">
										<div>
										<h3>New registration has been submitted:</h3>
										Registration Details:
										<div style="padding-left:40px">
										<table>
										<tr>
										<td>Company Name</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_company_name'].'</td>
										</tr>
										<tr>			
										<td>Address</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_address'].'</td>
										</tr>
										<tr>
										<td>Proporietor / Partners Name 1</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_name'].'</td>
										</tr>
										<tr>			
										<td>Proporietor / Partners Mobile 1</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_mobile'].'</td>
										</tr>
										<tr>
										<td>Proporietor / Partners Name 2</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_name2'].'</td>
										</tr>
										<tr>
										<td>Proporietor / Partners Mobile 2</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_mobile2'].'</td>
										</tr>
										<tr>
										<td>Office No 1</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_phone1'].'</td>
										</tr>
										<tr>
										<td>Office No 2</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_phone2'].'</td>
										</tr>
										<tr>
										<td>Residence No</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_res_phone'].'</td>
										</tr>
										<tr>
										<td>E-Mail</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_email'].'</td>
										</tr>
										<tr>
										<td>Bank Name</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_bnkname'].'</td>
										</tr>
										<tr>
										<td>Bank Branch</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_bnkbranch'].'</td>
										</tr>
										<tr>
										<td>Bank A/C No</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_accno'].'</td>
										</tr>										
										<tr>
										<td>Bank IFSC Code</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_ifsc'].'</td>
										</tr>
										<tr>
										<td>GSTin No</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_tin_no'].'</td>
										</tr>
										<tr>
										<td>Pan No</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_panno'].'</td>
										</tr>
										<tr>
										<td>Reference</td><td>:&nbsp;&nbsp;'.$_POST['fv']['cus_ref'].'</td>
										</tr>
										<tr>
										<td>GSTin no copy</td><td>:&nbsp;&nbsp;'.$tin_no.'</td>
										</tr>
										<tr>
										<td>Pan no copy</td><td>:&nbsp;&nbsp;'.$pan_no.'</td>
										</tr>
										<tr>
										<td>Address proof copy</td><td>:&nbsp;&nbsp;'.$addr_proof.'</td>
										</tr>
										<tr>
										<td>Partnership deed copy</td><td>:&nbsp;&nbsp;'.$deal_copy.'</td>
										</tr>
										
										</table>
										</div>
										<br>
										Regards,<br>
										'.(Globals::$web_title).'
										</div>
									</td>
								</tr>
							</table>
							</div>';
				$email_subject = "KYC Registration from ".$_SERVER['SERVER_NAME'];
				$company_name = "";
			
			$email_resp = email_notification_helper($_POST['fv']['cus_email'], $email_subject, $email_message);
			$this->load->view('senduser_ID',$cus_id);
			}
			else
			{		
				//$db_error_msg = $this->db->_error_number();								
				$db_error_msg = $this->general_model->get_errormessage($this->db->_error_number());
				if($db_error_msg == "0") {
					$db_error_msg = $this->db->_error_message();
				}					
				//This will execute when any transactions will fail.
				$this->db->trans_rollback();	//Rollback all transactions.
				$data['error']			=	"failure";	
				
				$this->load->view('kyc',$data);	//Load entry View to display errors.
				$this->session->set_flashdata('err_msg', 'Error - Creation Failed');
			}
		} else {
				$this->session->set_flashdata('err_msg', 'Invalid Captcha');
				redirect('C_kyc');
	}						
	}
}

/* End of file welcome.php */
/* Location: ./system/application/controllers/welcome.php */