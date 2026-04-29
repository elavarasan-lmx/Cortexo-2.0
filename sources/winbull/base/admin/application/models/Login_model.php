<?php
//admin
class Login_model extends CI_Model
{

	function __construct()
	{
		// Call the Model constructor
		parent::__construct();
		$this->db->query("SET time_zone='+5:30'");
	}
	function get_ipaddress()
	{
		$admin_ip = -1;
		$result_set = $this->db->query("select admin_ip_restricted, admin_ip from dt_admin_user where admin_user_id='1'");
		foreach ($result_set->result() as $row) {
			if ($row->admin_ip_restricted) {
				$admin_ip = $row->admin_ip;
			} else {
				$admin_ip = 0;
			}
		}
		$result_set->free_result();
		return $admin_ip;
	}

	// public function check_user() 										//Fetch entry record
	// {				
	// 	//Build contents query
	// 	$resultset = $this->db->query("select * from dt_admin_user where admin_user_name='".$this->input->post('user_name')."' and admin_user_password='".$this->input->post('user_password')."'");
	// 	if($resultset->num_rows() == 1)
	// 	{
	// 		foreach ($resultset->result() as $row)
	// 		{
	// 			//checking for whether the user status is active
	// 			if($row->admin_status==1) {
	// 				//checking for whether the user is a life time membet
	// 				/*if($row->cus_is_life_time==1) {
	// 					// checking for where the user is already logged in or not
	// 					if($this->check_user_status()) {
	// 						return 2;
	// 					} else {
	// 						return 1;		
	// 					}
	// 				//checking for whether the user validation period is expired or not	
	// 				} else*/ if(date("Y-m-d") <= $row->admin_validity_date) {
	// 					// checking for where the user is already logged in or not
	// 					/* if($this->check_user_status()) {
	// 						return 2;
	// 					} else {
	// 						return 1;		
	// 					} */
	// 					return 1;	
	// 				} else {
	// 					return 3; // Validity expire
	// 				}	
	// 			}
	// 		}				
	// 	}
	// 	return 0;
	// }
	public function check_user() 										// Fetch entry record
	{

		$post_data = $this->input->post();

		$user_name = '';
		$user_password = '';

		foreach ($post_data as $key => $val) {
			if (strpos($key, 'user_name') === 0) {
				$user_name = $val;
			}
			if (strpos($key, 'user_password') === 0) {
				$user_password = $val;
			}
		}

		$this->db->where('admin_user_name', $user_name);
		// $this->db->where('admin_user_password', $user_password);
		$resultset = $this->db->get('dt_admin_user');

		if ($resultset->num_rows() == 1) {
			foreach ($resultset->result() as $row) {
				// Perform case-sensitive username check
				if (strcmp($row->admin_user_name, $user_name) !== 0) {
					continue;
				}

				// Perform case-sensitive password check
				if (strcmp($row->admin_user_password, $user_password) !== 0) {
					continue;
				}

				if ($row->admin_status == 1) {
					if (date("Y-m-d") <= $row->admin_validity_date) {
						return 1;
					} else {
						return 3;
					}
				}
			}
		}
		return 0;
	}

	// public function check_user() 										//Fetch entry record
	// {				
	// 	//Build contents query
	// 	$resultset = $this->db->query("select * from dt_admin_user where admin_user_name='".$this->input->post('user_name')."'");
	// 	if($resultset->num_rows() == 1)
	// 	{
	// 		$resultrow = $resultset->row();   
	// 		if(password_verify($this->input->post('user_password'), $resultrow->admin_user_password)){
	// 			foreach ($resultset->result() as $row)
	// 			{
	// 				if($row->admin_status==1) 
	// 				{
	// 					if(date("Y-m-d") <= $row->admin_validity_date) {
	// 						return 1;	
	// 					} else {
	// 						return 3;  
	// 					}	
	// 				}
	// 			}	
	// 		}else{
	// 			return 0;
	// 		}				
	// 	}
	// 	return 0;
	// }

	public function check_user_status()
	{
		// FIX BUG-LOGIN-01: Parameterized LIKE — was concatenating raw POST input (SQL injection risk)
		$username = $this->db->escape_like_str($this->input->post('user_name', TRUE));
		$ip       = $this->session->userdata('ip_address');
		$resultset = $this->db->query(
			"SELECT * FROM ci_sessions WHERE data LIKE ? AND ip_address != ?",
			array('%' . $username . '%', $ip)
		);
		if ($resultset->num_rows() == 1) {
			return true;
		}
		return false;
	}
	function check_to_clear_session()
	{
		/* $resultset = $this->db->query("select * from ci_sessions where data like '%".$this->input->post('user_name')."%' and ip_address = '".$this->session->userdata('ip_address')."'");	
			if($resultset->num_rows() == 1) {				
				return true;
			} */
		if ($this->session->userdata('username'))
			return true;
		else
			return false;
	}
	function terminate_existingsession()
	{
		// FIX BUG-LOGIN-02: Query builder — was concatenating raw POST security_code + user_name (SQL injection risk)
		$this->db->where('admin_sec_code', $this->input->post('security_code', TRUE));
		$this->db->where('admin_user_name', $this->input->post('user_name', TRUE));
		$resultset = $this->db->get('dt_admin_user');
		if ($resultset->num_rows() == 1) {
			// FIX BUG-LOGIN-03: Parameterized DELETE LIKE — was concatenating raw POST user_name
			$username = $this->db->escape_like_str($this->input->post('user_name', TRUE));
			$this->db->query("DELETE FROM ci_sessions WHERE data LIKE ?", array('%' . $username . '%'));
			return true;
		}
		return false;
	}
	function delete_session()
	{
		$resultset = $this->db->query("delete from ci_sessions where data is NULL or data = ''");
		return true;
	}
	function get_userid()
	{
		$user_id = "";
		// FIX BUG-LOGIN-04: Query builder — was concatenating session username directly
		$this->db->select('admin_user_id');
		$this->db->where('admin_user_name', $this->session->userdata('username'));
		$resultset = $this->db->get('dt_admin_user');
		foreach ($resultset->result() as $row) {
			$user_id = $row->admin_user_id;
		}
		$resultset->free_result();
		return $user_id;
	}
	function get_branch($id)
	{
		$result_set = $this->db->query("SELECT branch_id, branch_name FROM dt_branch_group as brgrp
		LEFT JOIN dt_comp_branch as cmbr on brgrp.branch_id = cmbr.branch_code 
		WHERE brgrp.id_user= '" . $id . "' and brgrp.branch_active = 1");
		$states = $result_set->result_array();
		return $states;
	}
	function get_values()
	{
		$company_name = "";
		$resultset = $this->db->query("select admin_company_name, is_trade, display_margin from dt_generalsettings");
		foreach ($resultset->result() as $row) {
			$val['company_name'] = $row->admin_company_name;
			$val['is_trade'] = $row->is_trade;
			$val['display_margin'] = $row->display_margin;
		}
		$resultset->free_result();
		return $val;
	}

	function get_datagraph()
	{

		$resultset = $this->db->query("SELECT YEAR(book_datetime) AS year, MONTHNAME(book_datetime) AS month, MONTH(book_datetime) AS month_no, COUNT(*) AS bookings FROM dt_booking
					WHERE book_datetime
					between  DATE_FORMAT(NOW() ,'%Y-01-01') AND DATE_FORMAT(NOW() ,'%Y-12-31') AND ifnull(delete_status,0) = 0
					GROUP BY YEAR(book_datetime), MONTH(book_datetime)
					ORDER BY YEAR(book_datetime), MONTH(book_datetime)");

		$months = array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
		foreach ($months as $month) {
			$year = '';
			$isAdded  = false;
			foreach ($resultset->result() as $booked) {
				if ($booked->month_no == $month) {
					$isAdded = true;
					$year = $booked->year;
					$bookMonthWise[] = array("year" => $booked->year, "month" => $booked->month, "bookings" => $booked->bookings);
				}
			}

			if (!$isAdded) {
				if ($month == 1)
					$monthName = 'January';
				else if ($month == 2)
					$monthName = 'February';
				else if ($month == 3)
					$monthName = 'March';
				else if ($month == 4)
					$monthName = 'April';
				else if ($month == 5)
					$monthName = 'May';
				else if ($month == 6)
					$monthName = 'June';
				else if ($month == 7)
					$monthName = 'July';
				else if ($month == 8)
					$monthName = 'August';
				else if ($month == 9)
					$monthName = 'September';
				else if ($month == 10)
					$monthName = 'October';
				else if ($month == 11)
					$monthName = 'November';
				else if ($month == 12)
					$monthName = 'December';

				$bookMonthWise[] = array("year" => $year, "month" => $monthName, "bookings" => 0);
			}
		}

		$records['bookMonthWise'] = $bookMonthWise;
		$resultset->free_result();
		return $records;
	}

	function pendingorder_list()
	{
		$records['total_booking'] = 0;
		$records['pending_request'] = 0;
		$records['pending_delivery'] = 0;
		$records['unapproved_payment'] = 0.00;
		$records['reg_cust'] = 0;
		$records['enab_cust'] = 0;
		$records['dis_cust'] = 0;

		$userdata = array();
		$usernames = array();
		$logged_users = 0;
		$i = 0;

		$bookMonthWise = array();
		$resultset = $this->db->query("SELECT COUNT(*) AS pending_order FROM dt_booking WHERE book_status = 0 AND orderstatus = 0 AND ifnull(delete_status,0) = 0");
		foreach ($resultset->result() as $pendingorder) {
			$records['pending_order'] = $pendingorder->pending_order;
		}

		return $records;
	}

	function cus_data()
	{
		$records['total_booking'] = 0;
		$records['pending_request'] = 0;
		$records['pending_delivery'] = 0;
		$records['unapproved_payment'] = 0.00;
		$records['reg_cust'] = 0;
		$records['enab_cust'] = 0;
		$records['dis_cust'] = 0;

		$userdata = array();
		$usernames = array();
		$logged_users = 0;
		$i = 0;

		$bookMonthWise = array();

		$resultset = $this->db->query("select (select count(*) from dt_customer) as reg_cust, (select count(*) from dt_customer where cus_active = 1) as enab_cust , (select count(*) from dt_customer where IFNULL(cus_active,0) = 0) as dis_cust");
		foreach ($resultset->result() as $customer) {
			$records['reg_cust'] 	 = $customer->reg_cust;
			$records['enab_cust'] 	 = $customer->enab_cust;
			$records['dis_cust'] 	 = $customer->dis_cust;
		}
		$resultset->free_result();
		$resultset = $this->db->query("SELECT user_data FROM dt_usersessions where user_data != 'NULL'");
		foreach ($resultset->result() as $loggedin) {
			$userdata[$i]['loguser_data'] = @unserialize(@stripslashes($loggedin->user_data));
			if (isset($userdata[$i]['loguser_data']['is_logged_in']) && $userdata[$i]['loguser_data']['is_logged_in'] == 1) {
				if (!in_array(trim($userdata[$i]['loguser_data']['username']), $usernames)) {
					array_push($usernames, trim($userdata[$i]['loguser_data']['username']));
					$logged_users = $logged_users + 1;
				}
			}

			$i++;
		}
		$resultset->free_result();
		return $records;
	}

	function get_customers()
	{
		$userdata = array();
		$val = array();
		$sql = $this->db->query("SELECT user_data FROM dt_usersessions where user_data != 'NULL'");
		$i = 0;
		$logged_users = 0;
		$usernames = array();
		foreach ($sql->result() as $row) {
			$userdata[$i]['loguser_data'] = @unserialize(@stripslashes($row->user_data));

			if (isset($userdata[$i]['loguser_data']['is_logged_in']) && $userdata[$i]['loguser_data']['is_logged_in'] == 1) {
				if (!in_array(trim($userdata[$i]['loguser_data']['username']), $usernames)) {
					array_push($usernames, trim($userdata[$i]['loguser_data']['username']));
					$logged_users = $logged_users + 1;
				}
			}
			$i++;
		}
		$resultset = $this->db->query("select (select count(*) from dt_customer where cus_id != 1) as reg_cust, (select count(*) from dt_customer where cus_active = 1 and cus_id != 1) as enab_cust , (select count(*) from dt_customer where IFNULL(cus_active,0) = 0 and cus_id != 1) as dis_cust");
		foreach ($resultset->result() as $row) {
			$val['reg_cust'] = $row->reg_cust;
			$val['enab_cust'] = $row->enab_cust;
			$val['dis_cust'] = $row->dis_cust;
			$val['logged_users'] = $logged_users;
		}

		$resultset->free_result();
		$records[0] = $val;
		$records[1] = $userdata;

		return $records;
	}

	function get_dataDashboard()
	{
		$records['total_booking'] = 0;
		$records['pending_request'] = 0;
		$records['pending_delivery'] = 0;
		$records['unapproved_payment'] = 0.00;
		$records['reg_cust'] = 0;
		$records['enab_cust'] = 0;
		$records['dis_cust'] = 0;

		$userdata = array();
		$usernames = array();
		$logged_users = 0;
		$i = 0;
		$bookMonthWise = array();
		$resultset = $this->db->query("select (select count(*) from dt_customer) as reg_cust, (select count(*) from dt_customer where cus_active = 1) as enab_cust , (select count(*) from dt_customer where IFNULL(cus_active,0) = 0) as dis_cust");
		foreach ($resultset->result() as $customer) {
			$records['reg_cust'] 	 = $customer->reg_cust;
			$records['enab_cust'] 	 = $customer->enab_cust;
			$records['dis_cust'] 	 = $customer->dis_cust;
		}
		$resultset->free_result();

		$resultset = $this->db->query("SELECT user_data FROM dt_usersessions where user_data != 'NULL'");
		foreach ($resultset->result() as $loggedin) {
			$userdata[$i]['loguser_data'] = @unserialize(@stripslashes($loggedin->user_data));
			if (isset($userdata[$i]['loguser_data']['is_logged_in']) && $userdata[$i]['loguser_data']['is_logged_in'] == 1) {
				if (!in_array(trim($userdata[$i]['loguser_data']['username']), $usernames)) {
					array_push($usernames, trim($userdata[$i]['loguser_data']['username']));
					$logged_users = $logged_users + 1;
				}
			}
			$i++;
		}
		$resultset->free_result();
		return $records;
	}

	function bookings_request()
	{
		$records['total_booking'] = 0;
		$records['pending_request'] = 0;
		$records['pending_delivery'] = 0;
		$records['unapproved_payment'] = 0.00;
		$records['reg_cust'] = 0;
		$records['enab_cust'] = 0;
		$records['dis_cust'] = 0;

		$userdata = array();
		$usernames = array();
		$logged_users = 0;
		$i = 0;

		$records['logged_users'] 	 = $logged_users;

		$resultset = $this->db->query("SELECT COUNT(*) AS total_booking FROM dt_booking WHERE ifnull(delete_status,0) = 0");
		foreach ($resultset->result() as $totalBook) {
			$records['total_booking'] = $totalBook->total_booking;
		}
		$resultset->free_result();
		return $records;
	}

	function delivered_bookings()
	{
		$records['total_booking'] = 0;
		$records['pending_request'] = 0;
		$records['pending_delivery'] = 0;
		$records['unapproved_payment'] = 0.00;
		$records['reg_cust'] = 0;
		$records['enab_cust'] = 0;
		$records['dis_cust'] = 0;

		$userdata = array();
		$usernames = array();
		$logged_users = 0;
		$i = 0;

		$resultset = $this->db->query("SELECT COUNT(*) AS delivered_orders FROM dt_booking LEFT JOIN
					(SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty
					FROM dt_customerdelivery group by cusdel_bookno) as del_qty on del_qty.cusdel_bookno = book_no WHERE (book_qty - ifnull(del_qty.deliveredqty,0)) * 1000 = 0 AND ifnull(delete_status,0) = 0");
		foreach ($resultset->result() as $delivered) {
			$records['delivered_orders'] = $delivered->delivered_orders;
		}
		$resultset->free_result();

		return $records;
	}

	function pending_request()
	{
		$records['total_booking'] = 0;
		$records['pending_request'] = 0;
		$records['pending_delivery'] = 0;
		$records['unapproved_payment'] = 0.00;
		$records['reg_cust'] = 0;
		$records['enab_cust'] = 0;
		$records['dis_cust'] = 0;

		$userdata = array();
		$usernames = array();
		$logged_users = 0;
		$i = 0;
		$resultset = $this->db->query("SELECT com.com_name,ifnull(bk.com_qty_group,0) AS com_qty_group FROM dt_com_master AS com LEFT JOIN (SELECT SUM(book_qty) AS com_qty_group,book_comid FROM dt_booking WHERE ifnull(delete_status,0) = 0 GROUP BY book_comid) AS bk ON bk.book_comid = com.com_id WHERE com.com_active = 1");
		foreach ($resultset->result() as $comGroupBook) {
			$records['comGrp_book'][] = array("com_name" => $comGroupBook->com_name, "com_qty_group" => $comGroupBook->com_qty_group);
		}
		$resultset->free_result();

		$resultset = $this->db->query("SELECT COUNT(*) AS pending_request FROM dt_booking WHERE book_status = 2 AND ifnull(delete_status,0) = 0");
		foreach ($resultset->result() as $pendingReq) {
			$records['pending_request'] = $pendingReq->pending_request;
		}
		$resultset->free_result();
		return $records;
	}


	function pending_delivery()
	{
		$records['total_booking'] = 0;
		$records['pending_request'] = 0;
		$records['pending_delivery'] = 0;
		$records['unapproved_payment'] = 0.00;
		$records['reg_cust'] = 0;
		$records['enab_cust'] = 0;
		$records['dis_cust'] = 0;

		$userdata = array();
		$usernames = array();
		$logged_users = 0;
		$i = 0;

		$resultset = $this->db->query("SELECT COUNT(*) AS pending_delivery, (book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty
		FROM dt_booking
		LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty FROM dt_customerdelivery group by cusdel_bookno) as del_qty on del_qty.cusdel_bookno = book_no
		WHERE book_status = 1 AND (book_qty - ifnull(del_qty.deliveredqty,0)) > 0");
		foreach ($resultset->result() as $pending_del) {
			$records['pending_delivery'] = $pending_del->pending_delivery;
		}
		$resultset->free_result();
		return $records;
	}

	function get_marginsettings()
	{
		$display_margin = 0;
		$resultset = $this->db->query("select display_margin from dt_generalsettings");
		foreach ($resultset->result() as $row) {
			$display_margin = $row->display_margin;
		}
		$resultset->free_result();
		return $display_margin;
	}
	// 	function menu_generation($id_profile)
	// 	{
	// 		$sql = "SELECT men.id_menu as menuid, men.label, men.isparent as isparent, 	
	// 				men.issubmenu as issubmenu, parent, link, icon, target, 
	// 				urts.view, urts.add, urts.edit, urts.delete, urts.sms, urts.email, urts.notification, 
	// 				(SELECT count(m.id_menu) from dt_menu as m WHERE m.parent = men.id_menu) as submenus				
	// 				FROM dt_menu as men 
	// 				LEFT JOIN dt_userrights as urts ON urts.id_menu = men.id_menu 
	// 				WHERE id_user = ".$id_profile." AND men.active = 1 AND urts.view = 1 
	// 				ORDER BY men.id_menu, men.sort, men.parent";
	// 		$access = $this->db->query($sql)->result_array();
	// 		$this->session->set_userdata(array("usermenurights" => $access));
	// 		$menu='<ul class="nav main-menu">';
	// 		foreach($access as $key => $item)
	// 	    {
	// 	    	if($item['parent'] == 0)
	// 	    	{
	// 				  $target = $item['target'] == 1 ? "target='_blank'" : "";
	// 				  if( $item['submenus']==0)
	// 			       {
	// 						$menu.="<li class='nav-item'><a $target class='ajax-link nav-link' href='".site_url("/".$item['link'])."'>".($item['icon']!=NULL?'<i class="glyphicon '.$item['icon'].'"></i>':'')." <span class='menu-title'>".$item['label']."</span></a></li>";  
	// 						 unset($access[$key]); 

	// 				   }
	// 				   else
	// 				   {

	// 				   	  	$menu.="<li class='nav-item accordion'>
	// 					              <a class='nav-link' $target href='".site_url("/".$item['link'])."'>".($item['icon']!=NULL?'<i class="glyphicon '.$item['icon'].'"></i>':'')."
	// 					                <span class='menu-title'>".$item['label']."</span>
	// 					                 <i class='menu-arrow'></i>
	// 					              </a>";
	// 					  unset($access[$key]);         
	// 				   	  $menu.=$this->submenu($access,$item['menuid']);
	// 			    	  $menu.="</li>";
	// 				   }
	// 			}	
	// 		}
	// 		$menu.="</ul>";
	// 		return $menu;

	// 	}
	// 	//generate child menu
	//    function submenu($items, $parent)
	//    {
	//    	 $submenu="<ul class='nav flex-column sub-menu nav nav-pills nav-stacked'>";
	//    	      foreach($items as $key => $item)
	//     	  {
	//     	  	 if($item['parent'] == $parent)
	// 		       {
	// 					$target = $item['target'] == 1 ? "target='_blank'" : "";
	// 					if( $item['submenus']==0)
	// 					{
	// 						$submenu.="<li class='nav-item'><a class='nav-link' $target href='".site_url("/".$item['link'])."'>".($item['icon']!=NULL?'<i class="glyphicon '.$item['icon'].'"></i>':'')." <span>".$item['label']."<span></a></li>";  
	// 						unset($items[$key]); 
	// 					}
	// 					else
	// 					{

	// 				   	  	$submenu.="<li class='nav-item accordion'>
	// 					              <a class='nav-link' $target href='".site_url("/".$item['link'])."'>".($item['icon']!=NULL?'<i class="glyphicon '.$item['icon'].'"></i>':'')."
	// 					                <span>".$item['label']."</span>
	// 					                <i class='fa fa-angle-left pull-right'></i>
	// 					              </a>";
	// 					  unset($items[$key]);         
	// 				   	  $submenu.=$this->childmenu($items,$item['menuid']);
	// 			    	  $submenu.="</li>";
	// 				   }
	// 			   }
	//     	  }	
	//    	 $submenu.="</ul>";

	// 	  return $submenu;
	//    }


	function menu_generation($id_profile)
	{
		// FIX BUG-LOGIN-05: Cast to int — was concatenating $id_profile directly into query
		$id_profile = (int) $id_profile;
		$sql = "SELECT men.id_menu as menuid, men.label, men.isparent as isparent,
				men.issubmenu as issubmenu, parent, link, icon, target,
				urts.view, urts.add, urts.edit, urts.delete, urts.sms, urts.email, urts.notification,
				(SELECT count(m.id_menu) from dt_menu as m WHERE m.parent = men.id_menu) as submenus
				FROM dt_menu as men
				LEFT JOIN dt_userrights as urts ON urts.id_menu = men.id_menu
				WHERE id_user = ? AND men.active = 1 AND urts.view = 1
				ORDER BY men.id_menu, men.sort, men.parent";
		$access = $this->db->query($sql, array($id_profile))->result_array();
		$this->session->set_userdata(array("usermenurights" => $access));
		$menu = '<ul class="nav main-menu">';
		foreach ($access as $key => $item) {
			if ($item['parent'] == 0) {
				$target = $item['target'] == 1 ? "target='_blank'" : "";
				if ($item['submenus'] == 0) {
					$menu .= "<li class='nav-item'><a $target class='ajax-link nav-link' href='" . site_url("/" . $item['link']) . "'>" . ($item['icon'] != NULL ? '<i class="glyphicon ' . $item['icon'] . '"></i>' : '') . " <span class='menu-title'>" . $item['label'] . "</span></a></li>";
					unset($access[$key]);
				} else {

					$menu .= "<li class='nav-item accordion'>
					              <a class='nav-link' $target href='" . site_url("/" . $item['link']) . "'>" . ($item['icon'] != NULL ? '<i class="glyphicon ' . $item['icon'] . '"></i>' : '') . "
					                <span class='menu-title'>" . $item['label'] . "</span>
					                 <i class='menu-arrow'></i>
					              </a>";
					unset($access[$key]);
					$menu .= $this->submenu($access, $item['menuid']);
					$menu .= "</li>";
				}
			}
		}
		$menu .= "</ul>";
		return $menu;
	}
	//generate child menu
	function submenu($items, $parent)
	{
		$submenu = "<ul class='nav flex-column sub-menu nav nav-pills nav-stacked'>";
		foreach ($items as $key => $item) {
			if ($item['parent'] == $parent) {
				$target = $item['target'] == 1 ? "target='_blank'" : "";
				if ($item['submenus'] == 0) {
					$submenu .= "<li class='nav-item'><a class='nav-link' $target href='" . site_url("/" . $item['link']) . "'>" . ($item['icon'] != NULL ? '<i class="glyphicon ' . $item['icon'] . '"></i>' : '') . " <span>" . $item['label'] . "<span></a></li>";
					unset($items[$key]);
				} else {

					$submenu .= "<li class='nav-item accordion'>
					              <a class='nav-link' $target href='" . site_url("/" . $item['link']) . "'>" . ($item['icon'] != NULL ? '<i class="glyphicon ' . $item['icon'] . '"></i>' : '') . "
					                <span>" . $item['label'] . "</span>
					                <i class='menu-arrow'></i>
					              </a>";
					unset($items[$key]);
					$submenu .= $this->childmenu($items, $item['menuid']);
					$submenu .= "</li>";
				}
			}
		}
		$submenu .= "</ul>";

		return $submenu;
	}

	function childmenu($items, $parent)
	{
		$submenu = "<ul class='nav flex-column sub-menu nav nav-pills nav-stacked'>";
		foreach ($items as $key => $item) {
			$target = $item['target'] == 1 ? "" : "";
			if ($item['parent'] == $parent) {
				$submenu .= "<li class='nav-item'><a class='nav-link' $target href='" . site_url("/" . $item['link']) . "'>" . ($item['icon'] != NULL ? '<i class="glyphicon ' . $item['icon'] . '"></i>' : '') . " <span>" . $item['label'] . "<span></a></li>";
				unset($items[$key]);
			}
		}
		$submenu .= "</ul>";

		return $submenu;
	}
	function enable_trade($status, $clear_pendingorders)
	{
		$this->load->model("General_model");
		$records['trade_enable'] = $status;
		$settingsupdate    			=  trim(isset(Globals::$settingsupdate) ? Globals::$settingsupdate : '');
		$clearall_ratealert_url    	=  trim(isset(Globals::$clearallratealert) ? Globals::$clearallratealert : '');
		$client	 		   			=  trim(isset(Globals::$client) ? Globals::$client : '');
		if ($settingsupdate != '' && $client != '' && ($status == 0 && $clear_pendingorders == 1 ? $clearall_ratealert_url != '' : true)) {
			if ($this->db->update('dt_generalsettings', $records)) {
				$settings = $this->db->query("SELECT  trade_enable, limit_cancellation, limitcancel_time, trade_on, trade_on_time, trade_off, trade_off_time FROM 
				dt_generalsettings")->result();

				$trade_enable 		= $settings[0]->trade_enable;
				$limit_cancellation = $settings[0]->limit_cancellation;
				$limitcancel_time 	= $settings[0]->limitcancel_time;
				$trade_on 			= $settings[0]->trade_on;
				$trade_on_time 		= $settings[0]->trade_on_time;
				$trade_off 			= $settings[0]->trade_off;
				$trade_off_time 	= $settings[0]->trade_off_time;

				$limitcancel_time = $limit_cancellation == 1 && strlen($limitcancel_time) > 0  ? date("H:i:s", strtotime($limitcancel_time)) : NULL;

				$trade_on_time = $trade_on == 1 && strlen($trade_on_time) > 0  ? date("H:i:s", strtotime($trade_on_time)) : NULL;

				$trade_off_time = $trade_off == 1 && strlen($trade_off_time) > 0  ? date("H:i:s", strtotime($trade_off_time)) : NULL;

				$requestdata = array(
					'client'  		  => $client,
					'trade_enable'   => $trade_enable,
					'limit_expire'   =>  $limit_cancellation,
					'limit_expire_time' => $limitcancel_time,
					'trade_on' 	  => $trade_on,
					'trade_on_time'  => $trade_on_time,
					'trade_off'	  => $trade_off,
					'trade_off_time' => $trade_off_time
				);

				$field_string = http_build_query($requestdata);
				$curl_resp = curl_helper($settingsupdate, $field_string);

				//Notification for trade on/off
				$message = '';
				if ($trade_enable == 1) {
					$message = 'Online Trade Starts';
				} else {
					$message = 'Online Trade Closed';
				}
				// $message = urldecode($message);
				$content = array(
					"en" => $message
				);
				$hashes_array = array();
				$fields = array(
					'app_id' => isset(Globals::$app_id) ? Globals::$app_id : '',
					'included_segments' => array('All'),
					'data' => array(
						"nav" => "1"
					),
					'headings' => array("en" => isset(Globals::$notification_title) ? Globals::$notification_title : ''),
					'subtitle' => array("en" => isset(Globals::$notification_subtitle) ? Globals::$notification_subtitle : '',),
					'contents' => array("en" => $message),
					'web_buttons' => $hashes_array
				);

				//$fields = json_encode($fields);
				// print_r($fields);exit;

				push_notification_helper($fields);

				//Notification for trade on/off

				//clear pending orderstatus
				if ($clear_pendingorders == 1 && $status == 0) {
					$tradeObj = new Trading();
					$clearedstatus = $tradeObj->clear_order();
					if (!$clearedstatus) {
						echo "Error occured in cancelling order. Please contact administrator";
						exit;
					}
				}
				//Update in Log
				$this->updateTradeStatusLog($status, $clear_pendingorders);
				return true;
			} else {
				return false;
			}
		}
	}
	function get_tradingEnable()
	{
		$tradingStatus = 0;
		$resultset = $this->db->query("select trade_enable from dt_generalsettings");
		foreach ($resultset->result_array() as $rowStatus) {
			$tradingStatus = $rowStatus["trade_enable"];
		}
		return $tradingStatus;
	}
	function updateTradeStatusLog($status, $clear_pendingorders)
	{

		$updated_data = array(
			"status" => $status == 0 ? "Off" : "On",
			"Clear Pending Orders" => $clear_pendingorders
		);
		if ($status == 1) {
			$desc = "Trade enabled by admin";
		} else if ($status == 0 && $clear_pendingorders == 1) {
			$desc = "Trade disabled by admin.Pending orders cleared.";
		} else if ($status == 0 && $clear_pendingorders == 0) {
			$desc = "Trade disabled by admin.";
		}


		$records = "";
		$ipaddr = $_SERVER['SERVER_ADDR'];
		$log_shortdesc 	= $desc;
		$admin_id = $this->login_model->get_userid();
		$logtype = 7;
		$logdatetime = date('Y-m-d H:i:s');
		$logupdatedata = date('Y-m-d H:i:s'); // Load the common helper for logging
		$this->load->helper('common');
		log_admin_add(49, 'Trade Status', $updated_data, $desc);

		//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id."','".$ipaddr."')");
	}
	function get_booking_trends($from_date, $to_date)
	{
		$dates = [];
		$bookings = [];

		$resultset = $this->db->query("SELECT DATE(book_datetime) as book_date, COUNT(*) as bookings 
			FROM dt_booking 
			WHERE book_datetime BETWEEN '" . $this->db->escape_str($from_date) . " 00:00:00' AND '" . $this->db->escape_str($to_date) . " 23:59:59' 
			AND IFNULL(delete_status,0) = 0 
			GROUP BY DATE(book_datetime) 
			ORDER BY book_date");

		foreach ($resultset->result() as $row) {
			$dates[] = date('d-M-Y', strtotime($row->book_date));
			$bookings[] = (int) $row->bookings;
		}
		$resultset->free_result();

		return [
			'dates' => $dates,
			'bookings' => $bookings
		];
	}

	function get_graphdata()
	{
		// Booking Details
		$booking = $this->db->query("SELECT YEAR(book_datetime) AS year,MONTHNAME(book_datetime) AS month,MONTH(book_datetime) AS month_no,COUNT(*) AS bookings,
				(SELECT COUNT(*) FROM dt_booking WHERE orderstatus=0 and ordertype = 1) AS limit_order,
				(SELECT COUNT(*) FROM dt_booking WHERE book_status=1) AS confirm_book,
				(SELECT COUNT(*) FROM dt_booking WHERE (book_status=0 || book_status=2) AND (ordertype = 0 OR (ordertype = 1 AND orderstatus = 1)) AND ifnull(delete_status,0) = 0) AS booking_request,
				(SELECT COUNT(*) FROM dt_booking WHERE book_status = 2 AND ifnull(delete_status,0) = 0) as pending_request,
				(SELECT COUNT(*) FROM dt_booking WHERE book_status = 0 AND orderstatus = 0 AND ifnull(delete_status,0) = 0) as pending_order
			FROM dt_booking
			WHERE book_datetime BETWEEN DATE_FORMAT(NOW(), '%Y-01-01') AND DATE_FORMAT(NOW(), '%Y-12-31') 
			  AND IFNULL(delete_status, 0) = 0
			GROUP BY YEAR(book_datetime), MONTH(book_datetime)
			ORDER BY YEAR(book_datetime), MONTH(book_datetime)");

		// print_r($this->db->last_query());exit;


		//Pending Order Details
		$pending = $this->db->query("SELECT COUNT(*) AS pending_delivery, (book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty
			FROM dt_booking
			LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty FROM dt_customerdelivery group by cusdel_bookno) as del_qty on del_qty.cusdel_bookno = book_no
			WHERE book_status = 1 AND (book_qty - ifnull(del_qty.deliveredqty,0)) > 0");

		// Customer Details
		$customer = $this->db->query("SELECT YEAR(cus_register_on) AS year, 
				   MONTHNAME(cus_register_on) AS month, 
				   MONTH(cus_register_on) AS month_no, 
				   COUNT(*) AS customer,
				   (SELECT COUNT(*) FROM dt_customer) AS tot_cus,
				   (SELECT COUNT(*) FROM dt_customer WHERE cus_active = 1) AS active,
				   (SELECT COUNT(*) FROM dt_customer WHERE IFNULL(cus_active, 0) = 0) AS inactive
			FROM dt_customer
			WHERE cus_register_on BETWEEN DATE_FORMAT(NOW(), '%Y-01-01') AND DATE_FORMAT(NOW(), '%Y-12-31')
			GROUP BY YEAR(cus_register_on), MONTH(cus_register_on)
			ORDER BY YEAR(cus_register_on), MONTH(cus_register_on)");

		// Extract customer counts
		$records = [];

		foreach ($booking->result() as $booking_list) {
			$records['booking_request'] = $booking_list->booking_request;
			$records['limit_order'] = $booking_list->limit_order;
			$records['confirm_book'] = $booking_list->confirm_book;
			$records['pending_request'] = $booking_list->pending_request;
			$records['pending_order'] = $booking_list->pending_order;
		}
		foreach ($customer->result() as $customer_data) {
			$records['tot_cus'] = $customer_data->tot_cus;
			$records['active'] = $customer_data->active;
			$records['inactive'] = $customer_data->inactive;
		}

		foreach ($pending->result() as $pen) {
			$records['pending_delivery'] = $pen->pending_delivery;
		}
		$customer->free_result();  // Free up memory after use

		$months = [];
		$bookingsData = [];
		$customersData = [];

		$months = range(1, 12);

		foreach ($booking->result() as $booked) {
			$bookingsData[$booked->month_no] = $booked->bookings;
		}

		foreach ($customer->result() as $registered) {
			$customersData[$registered->month_no] = $registered->customer;
		}

		$bookingsValues = [];
		$customersValues = [];
		foreach ($months as $month) {
			$monthName = date('F', strtotime("2023-$month-01"));
			$months[] = $monthName;
			$bookingsValues[] = isset($bookingsData[$month]) ? $bookingsData[$month] : 0;
			$customersValues[] = isset($customersData[$month]) ? $customersData[$month] : 0;
		}

		return [
			'months' => $months,
			'bookings_values' => $bookingsValues,
			'customers_values' => $customersValues,
			'records' => $records
		];
	}
}
