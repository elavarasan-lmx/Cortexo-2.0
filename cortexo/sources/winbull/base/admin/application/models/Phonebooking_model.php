<?php
class Phonebooking_model extends CI_Model
{
	function get_customers()
	{
		$query = $this->db->query("select cus_id, cus_name, cus_login_name, replace(com_group_name,' ','_') as groupname,cus_company_name, cus_alise_name, cus_mobile from dt_customer
								LEFT JOIN dt_customergroupitems ON cgitems_cusid = cus_id 
								LEFT JOIN dt_com_group_master ON com_group_id = cgitems_comgroupid WHERE cus_active = 1 and cus_login_name != 'guest' ORDER BY cus_id");

		return $query->result_array();
	}

	public function get_commodityarray()
	{
		$filename = $this->config->item("base_url") . "admin/rpanel_xml/Default.txt";
		$content = file_get_contents($filename);
		return json_decode($content, true);
	}

	function get_transactiondate()
	{
		$resultset = $this->db->query("SELECT DATE_FORMAT(DATE_SUB(curdate(), INTERVAL trans_period DAY),'%d-%m-%Y') as from_date, DATE_FORMAT(curdate(), '%d-%m-%Y') as to_date FROM dt_rpanel_settings");
		return $resultset;
	}
	function get_margin($cus_id)
	{
		$margin = [];
		$resultset = $this->db->query("SELECT margin_gold, margin_silver, if(margin_type = 0, '%', 'rs') as margin_type from dt_customer,dt_generalsettings where cus_id = ?", array($cus_id));
		foreach ($resultset->result() as $row) {
			$margin['margin_gold'] = $row->margin_gold;
			$margin['margin_silver'] = $row->margin_silver;
			$margin['margin_type'] = $row->margin_type;
		}
		return $margin;
	}
	function get_commoditystatus()
	{
		$resultset = $this->db->query("SELECT cus_com_id,cus_com_cus_id, IF(IFNULL(com_sel_trade,0) = 1 AND IFNULL(cus_com_status_sell,0) = 1, 1 ,0) AS  cus_com_status_sell,
			                                  IF(IFNULL(com_buy_trade,0) = 1 AND IFNULL(cus_com_status_buy,0) = 1, 1, 0) AS cus_com_status_buy, cus_com_smoq as buymoq,
											  cus_com_pmoq as sellmoq, rcom_comtype as comtype, com_weight, com_bar_quantity, com_margin_type, com_margin_value
                                              FROM dt_cus_commodity AS ccd
                                              LEFT JOIN dt_customergroupitems AS cgi ON ccd.cus_com_cus_id = cgi.cgitems_cusid
                                              LEFT JOIN dt_com_group_master AS cgm ON cgi.cgitems_comgroupid = cgm.com_group_id
											  LEFT JOIN dt_com_master as comm ON comm.com_id = ccd.cus_com_id
											  LEFT JOIN dt_rpanelcommodities ON rcom_id = comm.com_type
                                              LEFT JOIN dt_com_group_com AS cgc ON cgm.com_group_id = cgc.com_group_id AND cgc.com_id = ccd.cus_com_id
                                              WHERE cgm.com_group_active = 1 AND (cgc.com_sel_active = 1 OR cgc.com_buy_active = 1)");
											
												foreach ($resultset->result() as $row) {
													$records['status'][] = [
														"cus_id" => $row->cus_com_cus_id,
														"trade_status_id" => $row->cus_com_id,
														"trade_status_buy" => $row->cus_com_status_buy,
														"trade_status_sell" => $row->cus_com_status_sell,
														"buymoq" => $row->buymoq,
														"sellmoq" => $row->sellmoq,
														"comtype" => $row->comtype,
														"com_weight" => $row->com_weight,
														"com_bar_quantity" => $row->com_bar_quantity,
														"com_margin_type" => $row->com_margin_type,
														"com_margin_value" => $row->com_margin_value,
													];
												}

		$general = $this->db->query("select trade_enable from dt_generalsettings");
		foreach ($general->result() as $settings) {
			$records['trade_enable'] = $settings->trade_enable;
		}

		$resultset = $this->db->query("SELECT trans_cuscode, IFNULL(SUM( if(trans_actype = 1, -1, 1) * IFNULL(trans_amount,0) ),0) as Balance FROM dt_transaction GROUP BY trans_cuscode");

		foreach ($resultset->result() as $row) {
			$records['allMargins'][] = ['cus_id' => $row->trans_cuscode, 'margin_amt' => $row->Balance];
		}

		return $records;
	}
	function get_WhatsappURL($service_id, $book_no)
	{
		//Declaration of variables
		$whatsapp_url = "";
		$whatsapp_status = 0;
		$whatsapp_authkey = "";
		$whatsapp_id = 2; //Send SMS
		$whatsapp_content = "";
		$whatsapp_footer = "";
		$customer_data = [];
		//Retriving SMS service for registration confirmation
		$resultset = $this->db->query("SELECT serv_whatsapp FROM dt_serv_master WHERE serv_id = ?", array($service_id));
		foreach ($resultset->result() as $row) {
			$whatsapp_status = $row->serv_whatsapp;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($whatsapp_status == 1) {
			$resultset = $this->db->query(
										"SELECT	bk.book_no,cus_name as book_cusid,
										DATE_FORMAT(bk.book_datetime,'%d-%m-%Y %h:%i:%s %p') as book_datetime,
										REPLACE(com_name,'`','')  as book_comid,if(book_type=0,'Sell',if(book_type=1,'Buy','')) as book_type,
										if(rcom_comtype = 1 , CONCAT(TRIM(book_qty)+0, ' Kg'), CONCAT(TRIM(book_qty * 1000)+0, ' gms')) AS book_qty, bk.book_rate,
										DATE_FORMAT(bk.book_confirmedon,'%d-%m-%Y %h:%i:%s %p') as book_confirmedon,
										if(bk.book_status=0,'Request',
										if(bk.book_status=1,'Confirmed',
										if(bk.book_status=2,'Hold',
										if(bk.book_status=3,'Rejected',
										if(bk.book_status=4,'Delivered',
										''))))) as book_status,
										bk.book_no_bar,
										bk.book_comweight,
										bk.book_totalcost,
										concat(cus_countrycode,cus_mobile) as cus_mobile, (select admin_company_name from dt_generalsettings) as admin_company_name
										FROM dt_booking bk
										left join dt_customer on cus_id=bk.book_cusid
										left join dt_com_master on com_id=bk.book_comid
										LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
										where book_no = ?", array($book_no));

			foreach ($resultset->result() as $row) {
				$customer_data = $row;
			}
			$whatsapp_url = $this->get_WhatsAppSettings($whatsapp_id, $customer_data->cus_mobile);
			
			// Legacy WhatsApp Settings
			$resultset = $this->db->query("SELECT whatsapp_content, whatsapp_footer from dt_whatsapp_settings where service_id = ?", array($service_id));
			foreach ($resultset->result() as $row) {
				$whatsapp_content = $row->whatsapp_content;
				$whatsapp_footer = $row->whatsapp_footer;
			}
			$resultset->free_result();

			// Meta WhatsApp Settings
			$meta_template_id = "";
			$meta_params = array();
			$resultset_meta = $this->db->query("SELECT template_id from dt_whatsappmeta_settings where service_id = ?", array($service_id));
			if ($resultset_meta->num_rows() > 0) {
				$meta_template_id = $resultset_meta->row()->template_id;
				// Define parameters based on service_id or hardcoded for now as per user preference
				// Example: $client_name, $booking_for, $qty, $price, $deliver_quantity
				$meta_params = array(
					$customer_data->book_cusid, 
					$customer_data->book_comid, 
					$customer_data->book_qty, 
					$customer_data->book_rate,
					$customer_data->book_status // Mapping example logic
				);
			}

			//Generating Message content
			$field_name = explode('@@', $whatsapp_content);
			for ($i = 1; $i < count($field_name); $i += 2) {
				if (isset($customer_data->{$field_name[$i]})) {
					$whatsapp_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $whatsapp_content);
				}
			}
			$field_name_footer = explode('@@', $whatsapp_footer);
			for ($i = 1; $i < count($field_name_footer); $i += 2) {
				if (isset($customer_data->{$field_name_footer[$i]})) {
					$whatsapp_footer = str_replace("@@" . $field_name_footer[$i] . "@@", $customer_data->{$field_name_footer[$i]}, $whatsapp_footer);
				}
			}
			$whatsapp_content .= " " . $whatsapp_footer;
			$whatsapp_message = $whatsapp_content; // Store unencoded version for internal use if needed
			$whatsapp_content = urlencode($whatsapp_content);

			$whatsapp_url = str_replace("@@message@@", $whatsapp_content, $whatsapp_url);
			
			return array(
				'mobile' => $customer_data->cus_mobile,
				'message' => $whatsapp_message,
				'template_id' => $meta_template_id,
				'params' => $meta_params
			);
		}
		return array();
	}
	function get_WhatsAppSettings($whatsapp_id, $mobile_no)
	{
		//Declaring variables
		$whatsapp_returnurl = "";
		$whatsapp_username = "";
		$whatsapp_password = "";
		$whatsapp_senderid = "";

		//Fetching Whatsapp App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id = ?", array($whatsapp_id));
		foreach ($result_set->result() as $row) {
			$whatsapp_returnurl = $row->sas_url;
		}
		$result_set->free_result();

		//Fetching Whatsapp App user name, password and sender id
		$result_set = $this->db->query("select admin_whatsapp_username, admin_whatsapp_password, admin_whatsapp_senderid,admin_whatsapp_authkey from dt_generalsettings");
		if ($result_set->num_rows() > 0) {
			$whatsapp_username = $result_set->row()->admin_whatsapp_username;
			$whatsapp_password = $result_set->row()->admin_whatsapp_password;
			$whatsapp_senderid = $result_set->row()->admin_whatsapp_senderid;
			$whatsapp_authkey = $result_set->row()->admin_whatsapp_authkey;
		}
		$result_set->free_result();

		//Generating Whatsapp Url with User Name, Password and Sender ID
		$whatsapp_returnurl = str_replace("@@user_name@@", $whatsapp_username, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@password@@", $whatsapp_password, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@mobileno@@", $mobile_no, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@sender_id@@", $whatsapp_senderid, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@auth_key@@", $whatsapp_authkey, $whatsapp_returnurl);
		//returning gererated URL
		return $whatsapp_returnurl;
	}
}
