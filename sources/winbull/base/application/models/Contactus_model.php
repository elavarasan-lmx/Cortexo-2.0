<?php
class Contactus_model extends CI_Model {
		
	public function get_data($params = "" , $page = "all")
    {		    
	   	
    }
	
	public function set_data()
	{
		
	}			
	
	public function empty_record() 										//Fetch listing record
	{		
	
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   
	function clientEmail($id) {
	$id_val=0;
	$resultset = $this->db->query("select cus_email from dt_customer where cus_email='".$id."'");
	if ($resultset->num_rows() > 0)
	{
	return 1;
	}
	else
	{
	return 0;
	}
	}
	function clientMobileNo($mobile) {
	$resultset = $this->db->query("select cus_mobile1 from dt_customer where cus_mobile1='".$mobile."'");
	if ($resultset->num_rows() > 0)
	{
	return 1;
	}
	else
	{
	return 0;
	}
	}
}
?>