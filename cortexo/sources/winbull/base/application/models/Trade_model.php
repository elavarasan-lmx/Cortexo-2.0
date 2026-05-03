<?php
class Trade_model extends CI_Model {

	function __construct()
	{
		// Call the Model constructor
		parent::__construct();
		$this->db->query("SET time_zone='+5:30'");
	}

	function get_transactiondate() 
	{
		$resultset = $this->db->query("SELECT DATE_FORMAT(DATE_SUB(curdate(), INTERVAL trans_period DAY),'%d-%m-%Y') 
										as from_date, DATE_FORMAT(curdate(), '%d-%m-%Y') as to_date FROM dt_rpanel_settings");
		return $resultset;									
	}

}
?>