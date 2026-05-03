<?php 
class Adminlog_model extends CI_Model
{
	var $table_name = 'dt_admin_log';//Initialize table Name
	
	public function get_data($params = "",$page = "all")
    {		
		$query = $this->db->query("SELECT log_id,DATE_FORMAT(log_datetime,'%d-%m-%Y %h:%i:%s') as log_datetime,log_type,log_description,log_pre_data,log_update_data,log_book_deviceid,	log_user_agent,log_book_useripaddress,log_book_adminipaddress,log_book_adminuser,log_admin_id,log_admin_ip from dt_admin_log");
		return $query;
	}
	public function adminlog_dataload($from_date = '', $to_date = '')
    {
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		
	   	$query = $this->db->query("SELECT log_id,
		DATE_FORMAT(log_datetime,'%d-%m-%Y %h:%i:%s') as log_datetime,log_type,
		log_description,log_pre_data,log_update_data,log_book_deviceid,	log_user_agent,
		log_book_useripaddress,log_book_adminipaddress,log_book_adminuser,log_admin_ip,
		log_admin_ip as admin_ip, log_admin_id, admin_user_name 
		FROM dt_admin_log
		LEFT JOIN dt_admin_user ON admin_user_id = log_admin_id
		WHERE DATE(log_datetime) BETWEEN '".$from_date."' AND '".$to_date."' ORDER BY log_id DESC");
		
		return $query;
    }
	
	/**
	* Log admin actions (add, edit, delete)
	* @param string $module_name - Name of the module
	* @param string $action - Action performed (add, edit, delete)
	* @param string $description - Description of the action
	* @param array $pre_data - Data before the action
	* @param array $update_data - Data after the action
	* @return boolean
	*/
	public function log_admin_action($log_type,$module_name, $action, $description = '', $pre_data = array(), $update_data = array())
	{
		// Get user information
		$user_id = $this->login_model->get_userid() ?$this->login_model->get_userid() : 0;
		$user_name = $this->session->userdata('username') ? $this->session->userdata('username') : 'Unknown';
		
		// Get IP information
		$admin_ip = $_SERVER['SERVER_ADDR'];
		$user_agent = $this->input->user_agent() ? $this->input->user_agent() : '';
		
		// Format data for logging
		$pre_data_str = !empty($pre_data) ? json_encode($pre_data) : '';
		$update_data_str = !empty($update_data) ? json_encode($update_data) : '';
		
		// Create log description if not provided
		if (empty($description)) {
			$description = ucfirst($action) . ' operation performed on ' . $module_name;
		}
		
		// Prepare log data
		$log_data = array(
			'log_datetime' => date('Y-m-d H:i:s'),
			'log_type' => $log_type, // Default type, can be customized per module
			'log_description' => $description,
			'log_pre_data' => $pre_data_str,
			'log_update_data' => $update_data_str,
			'log_book_deviceid' => '',
			'log_user_agent' => $user_agent,
			'log_book_useripaddress' => $admin_ip,
			'log_book_adminipaddress' => $admin_ip,
			'log_book_adminuser' => $user_name,
			'log_admin_id' => $user_id,
			'log_admin_ip' => $admin_ip
		);
		
		// Insert log record
		$this->db->insert($this->table_name, $log_data);
		return ($this->db->affected_rows() > 0) ? true : false;
	}
	
	/**
	* Log add operation
	* @param string $module_name - Name of the module
	* @param array $data - Data being added
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_add($log_type,$module_name, $data = array(), $description = '')
	{
		if (empty($description)) {
			$description = 'Added new record in ' . $module_name;
		}
		return $this->log_admin_action($log_type,$module_name, 'add', $description, array(), $data);
	}
	
	/**
	* Log edit operation
	* @param string $module_name - Name of the module
	* @param array $old_data - Data before update
	* @param array $new_data - Data after update
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_edit($log_type,$module_name, $old_data = array(), $new_data = array(), $description = '')
	{
		if (empty($description)) {
			$description = 'Updated record in ' . $module_name;
		}
		return $this->log_admin_action($log_type,$module_name, 'edit', $description, $old_data, $new_data);
	}
	
	/**
	* Log delete operation
	* @param string $module_name - Name of the module
	* @param array $data - Data being deleted
	* @param string $description - Optional description
	* @return boolean
	*/
	public function log_delete($log_type,$module_name, $data = array(), $description = '')
	{
		if (empty($description)) {
			$description = 'Deleted record from ' . $module_name;
		}
		return $this->log_admin_action($log_type,$module_name, 'delete', $description, $data, array());
	}
}
?>