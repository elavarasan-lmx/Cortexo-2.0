<?php
class Grn_model extends Model {
		var $table_name = 'dt_grn';		//Initialize table Name
    
	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	function Grn_model() {
		parent::Model();
	}
	
	public function get_data($com_type = -1)
    {
		if($com_type == -1)
		{
			$where = "";
		}
		else
		{
			$where = 'WHERE commodity_type = '.$com_type;
		}

	   	$query = $this->db->query("SELECT 
										grn_id, DATE_FORMAT(grn_date,'%d-%m-%Y %h:%i %p') AS grn_date,if(commodity_type != 1, 'Gold','Silver') as commodity_type, weight, rate, IF(cus_name = '' OR cus_name IS NULL,'-', cus_name) AS cus_name, bill_no  
									FROM 
										dt_grn
									LEFT JOIN 
										dt_customer ON cus_id = supplier
										".$where."
									ORDER BY
										grn_id 
									DESC");
		return $query;
    }
	
	public function empty_record() 										//Fetch listing record
	{
		$query =$this->db->query("SELECT 
										purchase_purity
									FROM 
										dt_generalsettings");
		foreach ($query->result() as $row)
		{
			$records['purity'] 	= $row->purchase_purity;				
		}
		$_POST['fv']['commodity_type']	=	0;		
		$_POST['fv']['grn_id']			=	NULL;
		$_POST['fv']['bill_no']			=	NULL;
		$_POST['fv']['grn_date']		=	date("d-m-Y h:i:s A");
		$_POST['fv']['purity']			=	$records['purity'] == -1 ? '' : ($records['purity'] == 0 ? '995' : ($records['purity'] == -1 ? '' : '999'));
		$_POST['fv']['weight']			=	NULL;
		$_POST['fv']['rate']			=	NULL;	
		return $_POST['fv'];
	}

	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{
		//Build contents query			
		$query =$this->db->query("SELECT 
										grn_id,DATE_FORMAT(grn_date,'%d-%m-%Y %h:%i %p') as grn_date, weight, purity, rate, commodity_type,supplier,bill_no
									FROM 
										dt_grn
								   where grn_id='".$record_id."'");
		foreach ($query->result() as $row)
		{
			$records['grn_id']   			= $row->grn_id;
			$records['grn_date']   			= $row->grn_date;;
			$records['weight']  			= ($row->weight*1000);
			$records['rate'] 				= $row->rate;	
			$records['purity'] 				= $row->purity;	
			$records['commodity_type'] 		= $row->commodity_type;
			$records['supplier'] 			= $row->supplier;
			$records['bill_no'] 			= $row->bill_no;			
		}
		//Return all
		return $records;
	}

	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	public function delete_record($record_id) 
	{
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);
		
		if($this->db->query("DELETE FROM dt_grn WHERE grn_id=?", array($record_id))) {
			// Log the delete operation
			// Load field labels helper to map field names to user-friendly labels
				$this->load->helper('field_labels');
				$field_labels = get_field_labels();
				$value_labels = get_field_value_labels();
				
				// Create a mapped version of the data for logging
				$logged_data = array();
				foreach ($old_record as $field => $value) {
					// Use the field label if available, otherwise use the field name
					$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
					
					// Use value label if available, otherwise use the raw value
					if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
						$logged_data[$label] = $value_labels[$field][$value];
					} else {
						$logged_data[$label] = $value;
					}
				}
			log_admin_delete('27','GRN', $logged_data, 'Admin - Deleted GRN record: ' . $old_record['grn_id']);
			return TRUE;
		}
		else
			return FALSE;
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
    public function insert_record($id)
	{
		$_POST['fv']['grn_date'] = isset($_POST['fv']['grn_date']) ? date('Y-m-d H:i:s',strtotime($_POST['fv']['grn_date'])):date('Y-m-d H:i:s');
		if($_POST['fv']['commodity_type'] == 1)
		{
			$_POST['fv']['weight'] = $_POST['fv']['weight'];
			$_POST['fv']['rate'] = $_POST['fv']['rate'] /1000;
		}
		else
		{
			$_POST['fv']['weight'] = $_POST['fv']['weight'] /1000;
			$_POST['fv']['rate'] = $_POST['fv']['rate'];
		}

		if($this->db->insert($this->table_name, $_POST['fv'])) {
			// Log the add operation

			// Load field labels helper to map field names to user-friendly labels
			$this->load->helper('field_labels');
			$field_labels = get_field_labels();
			$value_labels = get_field_value_labels();
			
			// Create a mapped version of the data for logging
			$logged_data = array();
			foreach ($_POST['fv'] as $field => $value) {
				// Use the field label if available, otherwise use the field name
				$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
				
				// Use value label if available, otherwise use the raw value
				if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
					$logged_data[$label] = $value_labels[$field][$value];
				} else {
					$logged_data[$label] = $value;
				}
			}
			
			log_admin_add('27','GRN',$logged_data, 'Admin - Added new GRN record');
			return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }
	public function update_record($id)
	{
		// Get the record before updating for logging purposes
		$old_record = $this->get_entry_record($id);
		
		//Update Data
		$_POST['fv']['grn_date'] = date('Y-m-d H:i:s',strtotime($_POST['fv']['grn_date']));
		if($_POST['fv']['commodity_type'] == 1)
		{
			$_POST['fv']['weight'] = $_POST['fv']['weight'];
			$_POST['fv']['rate'] = $_POST['fv']['rate'] /1000;
		}
		else
		{
			$_POST['fv']['weight'] = $_POST['fv']['weight'] /1000;
			$_POST['fv']['rate'] = $_POST['fv']['rate'];
		}
		if($this->db->update($this->table_name, $_POST['fv'], array('grn_id' => $id))) {
			// Create selective logging - only log changed values
			$changed_data = get_changed_fields($old_record, $_POST['fv']);
			
			// Separate old and new data for logging
			$old_values = array();
			$new_values = array();
			
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}
			
			// Log the edit operation with old values in log_pre_data and new values in log_update_data
			if (!empty($changed_data)) {
				log_admin_edit('27','GRN', $old_values, $new_values, 'Admin - Updated GRN record: ' . $id);
				return array('status' => 1);
				} else {
					return array('status' => 0);
				}
		}
		else
			return array('status' => 0);
				
    }
	function getpurchase_customer($com_type = 0)
	{
		$customers = array();

		$result_set = $this->db->query("select cus_id, cus_name, cus_alise_name FROM dt_customer WHERE cus_active = 1 AND (customer_type = 0 OR customer_type = 2)");

		if ($result_set->num_rows() > 0) 
		{
			foreach ($result_set->result() as $row) 
			{
				$gold_qty  	= 0;
				$silver_qty = 0;
				$avg_rate_gold = 0;
				$avg_rate_silver = 0;
				
				$gold_coverup  	 =  0; 
				$silver_coverup  =  0;
				
				$gold_grn = 0;
				$silver_grn = 0;
				$q1 =$this->db->query("SELECT 
				SUM(IF(commodity_type != 1 AND type = 1 , IF(weight IS NULL, 0, weight), 0)) AS total_gold_purchase, 
				AVG(CASE WHEN commodity_type != 1 AND type = 1 THEN IF(rate IS NULL, 0, rate) END) AS avg_gold_purchase, 
				SUM(IF(commodity_type = 1 AND type = 1 , IF(weight IS NULL, 0, weight), 0)) AS total_silver_purchase, 
				AVG(CASE WHEN commodity_type = 1 AND type = 1 THEN IF(rate IS NULL, 0, rate) END) AS avg_silver_purchase 
				from dt_purchase WHERE supplier = ".$row->cus_id);
				foreach ($q1->result() as $row1)
				{
					$gold_coverup  			= $row1->total_gold_purchase;
					$silver_coverup  		= $row1->total_silver_purchase;
					$avg_rate_gold  		= ROUND($row1->avg_gold_purchase,2);
					$avg_rate_silver  		= ROUND($row1->avg_silver_purchase,2);			
				}
				
				$q2 =$this->db->query("SELECT SUM(IF(commodity_type = 0 , (IF(weight IS NULL, 0, weight)) ,0)) AS gold_physical, SUM(IF(commodity_type = 1 , (IF(weight IS NULL, 0, weight)) ,0)) AS silver_physical FROM dt_grn WHERE supplier = ".$row->cus_id);
				foreach ($q2->result() as $row2)
				{
					$gold_grn  		= $row2->gold_physical;
					$silver_grn  	= $row2->silver_physical;		
				}

				$gold_qty  	=  ($gold_coverup   - $gold_grn)*1000;
				$silver_qty  = ($silver_coverup - $silver_grn)*1000;

				if($com_type == 0 ? $gold_qty > 0 : ($com_type == 1 ? $silver_qty > 0 : false))
				{
					$customers[] = array("cus_id" => $row->cus_id, "cus_name" => $row->cus_name, "cus_alise_name" => $row->cus_alise_name, "gold_qty" => $gold_qty, "avg_rate_gold" => $avg_rate_gold, "silver_qty" => $silver_qty, "avg_rate_silver" => $avg_rate_silver);
				}
			}
		}
		
		return $customers;
	}
}
?>