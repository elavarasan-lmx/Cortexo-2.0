
<?php
class Adminuser_model extends CI_Model {
		var $table_name = 'dt_admin_user';	//Initialize table Name

	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	function get_data($params = "" , $page = "all")
    {		
		$this->db->select("admin_user_id, admin_user_name, DATE_FORMAT(admin_validity_date,'%d-%m-%Y') as admin_validity_date, if(admin_status=1, 'Active', 'Disabled') as admin_status", FALSE);
		$this->db->from('dt_admin_user');
		$this->db->order_by('admin_user_id', 'DESC');
	   	$query = $this->db->get();
		return $query;
    }
	
	public function load_correction_type($record_id)
	{		
		$strData="";		
		$strData="<option value='-1' ";
		$strData.=$record_id==-1 ? "selected='selected'" : "" ;
		$strData.=">- SELECT -</option>";		
		$this->db->select('distinct(corr_type) AS corr_type');
		$this->db->from('dt_cur_correction');
		$resultset = $this->db->get();
		foreach ($resultset->result() as $row)
		{
		   $strData.= "<option value='" . htmlspecialchars($row->corr_type, ENT_QUOTES) . "' ";
		   $strData.=($record_id==$row->corr_type) ? "selected='selected'" : "" ;
		   $strData.=">" . htmlspecialchars($row->corr_type, ENT_QUOTES) . "</option>";
		}
		$resultset->free_result(); 
		return $strData;				
	}
	
	function empty_record() 										//Fetch listing record
	{		
		/*$_POST['fv']['com_id']				=	NULL;
		$_POST['fv']['com_name']			=	NULL;
		$_POST['fv']['com_type']			=	0;
		$_POST['fv']['com_weight']			=	NULL;
		$_POST['fv']['com_other_charges']	=	NULL;
		$_POST['fv']['com_display_purity']	=	NULL;
		$_POST['fv']['com_correction_type']	=	0.0;
		$_POST['fv']['com_active']			=	TRUE;*/
		$_POST['fv']['db_error_msg']		=	"";				
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{		
		$record_id = (int)$record_id;
		$records['admin_user_id']  = $record_id;
		$this->db->select('admin_user_id, admin_user_name, admin_user_password, admin_ip, admin_ip_restricted, admin_is_sms, admin_sec_code, admin_activation_code, admin_validity_date, admin_status, admin_showalert, admin_alertdays, admin_alertmessage, disable_rpaneledit');
		$this->db->from('dt_admin_user');
		$this->db->where('admin_user_id', $record_id);
		$result_set = $this->db->get();			
		
		foreach ($result_set->result() as $row)
		{
			$records['admin_user_id']   	= $row->admin_user_id;
			$records['admin_user_name']   	= $row->admin_user_name;
			$records['admin_user_password'] = $row->admin_user_password;
			$records['admin_ip']			= $row->admin_ip;
			$records['admin_ip_restricted'] = ($row->admin_ip_restricted==1) ? TRUE : FALSE;
			$records['admin_is_sms'] 		= ($row->admin_is_sms==1) ? TRUE : FALSE;	
			$records['admin_sec_code']		= $row->admin_sec_code;
			$records['admin_validity_date']	= $row->admin_validity_date != NULL ? date('d-m-Y',strtotime($row->admin_validity_date)) : "";
			$records['admin_status'] 		= ($row->admin_status==1) ? TRUE : FALSE;
			$records['admin_showalert'] 	= ($row->admin_showalert==1) ? TRUE : FALSE;	
			$records['admin_alertdays']		= $row->admin_alertdays;
			$records['admin_alertmessage']	= $row->admin_alertmessage;
			$records['disable_rpaneledit']	= $row->disable_rpaneledit;
			$records['db_error_msg']		= "";		
		}		
		return $records;
	}
	
	
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	public function delete_record($record_id) 
	{
		$record_id = (int)$record_id;
		// Get the record before deleting for logging purposes
		$old_record = $this->get_entry_record($record_id);
		
		// Delete the record
		$this->delete_sub_record('dt_cus_commodity','cus_com_id',$record_id);
		$this->db->where('admin_user_id', $record_id);
		$delete_record = $this->db->delete($this->table_name);		
		
		// Log the delete operation
		if ($this->db->affected_rows() > 0) {
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
			
			log_admin_delete('10','Admin User', $logged_data, 'Admin - Deleted admin user: ' . $old_record['admin_user_name']);
		}
		
		return TRUE;
	}
	
	/*
	* To delete sub record 
	* @return
	*/
	public function delete_sub_record($table_name,$col_name,$record_id)
	{
		$record_id = $this->db->escape_str($record_id);
		$this->db->where($col_name, $record_id);
		$this->db->delete($table_name);
		return TRUE;
	}

	/**
	* Insert record
	* @param add_new as new record, otherwise as update record
	* @return boolean
	*/
    public function insert_record($id)
	{
			// User Name validation: required, min 3 characters, letters only
			if (empty($_POST['fv']['admin_user_name'])) {
				return array('status' => 0, 'message' => 'User Name is required.');
			}
			$userName = trim($_POST['fv']['admin_user_name']);
			if (strlen($userName) < 3) {
				return array('status' => 0, 'message' => 'User Name must be at least 3 characters.');
			}
			if (!preg_match('/^[a-zA-Z\s]+$/', $userName)) {
				return array('status' => 0, 'message' => 'User Name must contain only letters.');
			}

			// Duplicate username check (P-DUP)
			$this->db->where('admin_user_name', $userName);
			$existing = $this->db->get($this->table_name);
			if ($existing->num_rows() > 0) {
				return array('status' => 0, 'message' => 'User Name "' . $userName . '" already exists. Please choose a different name.');
			}

			// Password validation: required, min 6 characters, mixed case, special char
			if (empty($_POST['fv']['admin_user_password'])) {
				return array('status' => 0, 'message' => 'Password is required.');
			}
			$password = trim($_POST['fv']['admin_user_password']);
			if (strlen($password) < 6) {
				return array('status' => 0, 'message' => 'Password must be at least 6 characters.');
			}
			if (!preg_match('/[a-z]/', $password) || !preg_match('/[A-Z]/', $password)) {
				return array('status' => 0, 'message' => 'Password must contain both uppercase and lowercase letters.');
			}
			if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
				return array('status' => 0, 'message' => 'Password must contain at least one special character.');
			}

			// Security Code validation: required and min 3 characters
			if (empty($_POST['fv']['admin_sec_code'])) {
				return array('status' => 0, 'message' => 'Security Code is required.');
			}
			if (strlen($_POST['fv']['admin_sec_code']) < 3) {
				return array('status' => 0, 'message' => 'Security Code must be at least 3 characters.');
			}

			//print_r($_POST);
			$_POST['fv']['admin_validity_date']= $_POST['fv']['admin_validity_date']==""  ? NULL : date('Y-m-d',strtotime($_POST['fv']['admin_validity_date']));
			$_POST['fv']['admin_ip_restricted']= (isset($_POST['fv']['admin_ip_restricted']) ? 1 : 0);
			$_POST['fv']['admin_is_sms']	   = (isset($_POST['fv']['admin_is_sms']) ? 1 : 0);
			$_POST['fv']['admin_status']	   = (isset($_POST['fv']['admin_status']) ? 1 : 0);
			$_POST['fv']['admin_showalert']	   = (isset($_POST['fv']['admin_showalert']) ? 1 : 0);
			$_POST['fv']['disable_rpaneledit'] = (isset($_POST['fv']['disable_rpaneledit']) ? 1 : 0);
			
			// Insert the record
			$this->db->insert($this->table_name, $_POST['fv']);	
			
			// Get the inserted ID
			$insert_id = $this->db->insert_id();
			
			// Log the add operation
			if ($insert_id) {
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
				
				log_admin_add('10','Admin User', $logged_data, 'Admin - Added new admin user: ' . $_POST['fv']['admin_user_name']);
			return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }
	
	public function update_record($id)
	{
			// Get the record before updating for logging purposes
			$old_record = $this->get_entry_record($id);
		
		// Store original date format for accurate logging comparison
		$old_record_for_comparison = $old_record;
		if (isset($old_record_for_comparison['admin_validity_date']) && !empty($old_record_for_comparison['admin_validity_date'])) {
			// Convert the displayed date format back to Y-m-d for proper comparison
			$old_record_for_comparison['admin_validity_date'] = date('Y-m-d', strtotime($old_record_for_comparison['admin_validity_date']));
		}
			
			// User Name validation: required, min 3 characters, letters only
			if (empty($_POST['fv']['admin_user_name'])) {
				return array('status' => 0, 'message' => 'User Name is required.');
			}
			$userName = trim($_POST['fv']['admin_user_name']);
			if (strlen($userName) < 3) {
				return array('status' => 0, 'message' => 'User Name must be at least 3 characters.');
			}
			if (!preg_match('/^[a-zA-Z\s]+$/', $userName)) {
				return array('status' => 0, 'message' => 'User Name must contain only letters.');
			}

			// Duplicate username check (P-DUP) — exclude current record
			$this->db->where('admin_user_name', $userName);
			$this->db->where('admin_user_id !=', (int)$id);
			$existing = $this->db->get($this->table_name);
			if ($existing->num_rows() > 0) {
				return array('status' => 0, 'message' => 'User Name "' . $userName . '" already exists. Please choose a different name.');
			}

			// BZ-47: Password validation — optional on EDIT. If empty, keep existing password.
			$password = isset($_POST['fv']['admin_user_password']) ? trim($_POST['fv']['admin_user_password']) : '';
			if (empty($password) || $password === $old_record['admin_user_password']) {
				// Keep existing password — remove from POST so it doesn't overwrite
				$_POST['fv']['admin_user_password'] = $old_record['admin_user_password'];
			} else {
				// User provided a new password — validate strength
				if (strlen($password) < 6) {
					return array('status' => 0, 'message' => 'Password must be at least 6 characters.');
				}
				if (!preg_match('/[a-z]/', $password) || !preg_match('/[A-Z]/', $password)) {
					return array('status' => 0, 'message' => 'Password must contain both uppercase and lowercase letters.');
				}
				if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
					return array('status' => 0, 'message' => 'Password must contain at least one special character.');
				}
			}

			// Security Code validation: required and min 3 characters
			if (empty($_POST['fv']['admin_sec_code'])) {
				return array('status' => 0, 'message' => 'Security Code is required.');
			}
			if (strlen($_POST['fv']['admin_sec_code']) < 3) {
				return array('status' => 0, 'message' => 'Security Code must be at least 3 characters.');
			}

			//Update Data
			$_POST['fv']['admin_user_id']	   = $id;
			$_POST['fv']['admin_validity_date']= $_POST['fv']['admin_validity_date']==""  ? NULL : date('Y-m-d',strtotime($_POST['fv']['admin_validity_date']));
			$_POST['fv']['admin_ip_restricted']= (isset($_POST['fv']['admin_ip_restricted']) ? 1 : 0);
			$_POST['fv']['admin_is_sms']	   = (isset($_POST['fv']['admin_is_sms']) ? 1 : 0);
			$_POST['fv']['admin_status']	   = (isset($_POST['fv']['admin_status']) ? 1 : 0);
			$_POST['fv']['admin_showalert']	   = (isset($_POST['fv']['admin_showalert']) ? 1 : 0);
			$_POST['fv']['disable_rpaneledit'] = (isset($_POST['fv']['disable_rpaneledit']) ? 1 : 0);
			

			// Update the record
			$this->db->update($this->table_name, $_POST['fv'], array('admin_user_id' => $id));
			// print_r('10');exit;
			
			// Create selective logging - only log changed values
		$changed_data = get_changed_fields($old_record_for_comparison, $_POST['fv']);
			
			// Separate old and new data for logging
			$old_values = array();
			$new_values = array();
			
			foreach ($changed_data as $field => $values) {
				$old_values[$field] = $values['old'];
				$new_values[$field] = $values['new'];
			}
			
			// Get old user rights for comparison
			$old_userrights = $this->get_userrights($id);
			$old_userrights_data = array();
			foreach ($old_userrights->result() as $row) {
				$old_userrights_data[$row->menuid] = array(
					'view' => $row->uview,
					'add' => $row->uadd,
					'edit' => $row->uedit,
					'delete' => $row->udelete,
					'sms' => $row->usms,
					'email' => $row->uemail,
					'notification' => $row->unotification
				);
			}
			
			$this->db->where('id_user', $id);
			$this->db->delete('dt_userrights');
			$new_userrights_data = array();
			foreach($_POST['fuv']['userrights'] as $urkey => $urval){
				$userrights['id_menu'] 	= $urval['id_menu'];
				$userrights['id_user'] 	= $id;
				$userrights['view'] 	= (!isset($urval['view'])) ? 0 : $urval['view'];
				$userrights['add'] 		= (!isset($urval['add'])) ? 0 : $urval['add'];
				$userrights['edit'] 	= (!isset($urval['edit'])) ? 0 : $urval['edit'];
				$userrights['delete'] 	= (!isset($urval['delete'])) ? 0 : $urval['delete'];
				$userrights['sms'] 		= (!isset($urval['sms'])) ? 0 : $urval['sms'];
				$userrights['email'] 	= (!isset($urval['email'])) ? 0 : $urval['email'];
				$userrights['notification'] 	= (!isset($urval['notification'])) ? 0 : $urval['notification'];
				$this->db->insert("dt_userrights", $userrights);		
				
				// Store new user rights for logging
				$new_userrights_data[$urval['id_menu']] = array(
					'view' => $userrights['view'],
					'add' => $userrights['add'],
					'edit' => $userrights['edit'],
					'delete' => $userrights['delete'],
					'sms' => $userrights['sms'],
					'email' => $userrights['email'],
					'notification' => $userrights['notification']
				);
			}
			
			// Compare user rights and log changes
			list($userrights_log, $old_userrights_changes, $new_userrights_changes) = $this->compare_userrights($old_userrights_data, $new_userrights_data, $id);
			
			// Combine admin field changes with user rights changes
			$full_description = 'User Admin user : ' . $_POST['fv']['admin_user_name'];
			
			// Merge user rights changes with admin field changes for logging
			$all_old_values = array_merge($old_values, $old_userrights_changes);
			$all_new_values = array_merge($new_values, $new_userrights_changes);
			
			
			// Log the edit operation with old values in log_pre_data and new values in log_update_data
			if (!empty($changed_data) || !empty($userrights_log)) {
				log_admin_edit('10','Admin User', $all_old_values, $all_new_values, $full_description);
				return array('status' => 1);
			} else {
				return array('status' => 0);
			}
    }
	
	/**
	* Compare old and new user rights to identify changes
	* @param array $old_rights - Old user rights data
	* @param array $new_rights - New user rights data
	* @param int $user_id - User ID
	* @return array - Array with [formatted_changes, old_values, new_values]
	*/
	public function compare_userrights($old_rights, $new_rights, $user_id)
	{
		$changes = array();
		$old_values = array();
		$new_values = array();
		
		// Load menu labels
		$menu_labels = array();
		$this->db->select('id_menu, label');
		$this->db->from('dt_menu');
		$menu_query = $this->db->get();
		foreach ($menu_query->result() as $row) {
			$menu_labels[$row->id_menu] = $row->label;
		}
		
		// Check for modified or new rights
		foreach ($new_rights as $menu_id => $new_right) {
			$menu_name = isset($menu_labels[$menu_id]) ? $menu_labels[$menu_id] : 'Menu ID: ' . $menu_id;
			
			if (isset($old_rights[$menu_id])) {
				// Menu existed before, check for changes
				$old_right = $old_rights[$menu_id];
				
				// Check each permission type
				$permission_types = array('view', 'add', 'edit', 'delete', 'sms', 'email', 'notification');
				foreach ($permission_types as $perm) {
					$old_value = isset($old_right[$perm]) ? $old_right[$perm] : 0;
					$new_value = isset($new_right[$perm]) ? $new_right[$perm] : 0;
					
					if ($old_value != $new_value) {
						$old_label = $old_value ? 'on' : 'off';
						$new_label = $new_value ? 'on' : 'off';
						
						// Store old and new values for logging
						$old_values[ $menu_name . '-' . $perm] = $old_label;
						$new_values[ $menu_name . '-' . $perm] = $new_label;
					}
				}
			} else {
				// New menu rights
				$permission_desc = array();
				$permissions_enabled = array();
				foreach ($new_right as $perm => $value) {
					if ($value) {
						$permission_desc[] = $perm;
						$permissions_enabled[] = $perm;
					}
				}
				if (!empty($permission_desc)) {
					
					// Store old and new values for logging (old is empty, new has permissions)
					$old_values[ $menu_name] = '';
					$new_values[ $menu_name] = implode(', ', $permissions_enabled);
				}
			}
		}
		
		// Check for removed rights
		foreach ($old_rights as $menu_id => $old_right) {
			if (!isset($new_rights[$menu_id])) {
				$menu_name = isset($menu_labels[$menu_id]) ? $menu_labels[$menu_id] : 'Menu ID: ' . $menu_id;
				
				// Store old and new values for logging (old has permissions, new is empty)
				$old_permissions = array();
				foreach ($old_right as $perm => $value) {
					if ($value) {
						$old_permissions[] = $perm;
					}
				}
				$old_values[ $menu_name] = implode(', ', $old_permissions);
				$new_values[ $menu_name] = '';
			}
		}
		
		return array($changes, $old_values, $new_values);
	}	
	public function get_userrights($id)
	{
		$id = (int)$id;
		$this->db->select("men.id_menu as menuid, men.label, if(men.isparent = 1, 'Yes', 'No') as isparent, if(men.issubmenu = 1, 'Yes', 'No') as issubmenu, ifnull(pmenu.label,'ROOT')as parent, ifnull(urts.view,0) as uview, ifnull(urts.add,0) as uadd , ifnull(urts.edit,0) as uedit, ifnull(urts.delete,0) as udelete, ifnull(sms,0) as usms, ifnull(email,0) as uemail, ifnull(notification,0) as unotification", FALSE);
		$this->db->from('dt_menu as men');
		$this->db->join('dt_menu as pmenu', 'pmenu.id_menu= men.parent', 'left');
		$this->db->join('dt_userrights as urts', 'urts.id_menu = men.id_menu AND urts.id_user = '.$id, 'left');
		$this->db->order_by('men.id_menu');
		$query = $this->db->get();
		return $query;
	}
}
?>