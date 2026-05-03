<?php
class Customerdelivery_model extends CI_Model
{
	var $table_name = 'dt_customerdelivery';						//Initialize table Name
	var $third_table_name = 'dt_customer_deliveryinvoice';
	var $fourth_table_name = 'dt_transaction';
	var $fifth_table_name = 'dt_booking';

	function get_data($from_date = '', $to_date = '', $comid = '', $comType = '', $bookType = '')
	{
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		$comid =   $comid == -1 ? '' : ('com_id = ' . intval($comid) . ' AND');
		$comType = $comType == -1 ? '' : ($comType == 0 ? ' AND rcom_comtype = 0 ' : ($comType == 1 ? ' AND rcom_comtype = 1 ' : ''));
		$bookType = $bookType == -1 ? '' : ($bookType == 0 ? ' AND book_type = 0 ' : ($bookType == 1 ? ' AND book_type = 1 ' : ''));
		$str_query = "SELECT book_no as bookno,db.unfix,cus_id,
						DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as bookdate,
						book_comid as comcode,rcom_comtype as com_type,
						if(book_type=0,'Sell','Buy') as book_type,book_rate,
						cus_name as customername,
						REPLACE(com_name,'`','') as commodityname,
						book_qty*1000 as bookqty,cus_id as cuscode,
						round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
						(book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty,
						0 as BalanceAmount, cusdel_bookno,
						cus_alise_name,
						ifnull(cus_city,'-') AS cus_city, remarks, cus_mobile, cus_company_name, 
						ordertype, ifnull(book_narration,'') as book_narration, dc.unfix as cus_fix,
						ifnull(book_usercomment,'') as book_usercomment,date_format(book_deliverydate,'%d-%m-%Y') as book_deliverydate From dt_booking db
						LEFT JOIN dt_customer dc ON  dc.cus_id = book_cusid
						LEFT JOIN dt_com_master ON book_comid = com_id
						LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
						LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty,
									ifnull(date_format(cusdel_date, '%d-%m-%Y %H:%i:%s'), '-') as deliverydate
									from dt_customerdelivery group by cusdel_bookno)
									as del_qty on del_qty.cusdel_bookno = book_no
						where " . $comid . " book_status = 1 " . $comType . " " . $bookType . "
						HAVING BalanceQty > 0
					   ORDER BY
					  	DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s')
					   DESC";
		$query = $this->db->query($str_query);
		return $query;
	}
	public function get_deliverydata($id)
	{
		$filters = json_decode($this->input->post("filters", true), true);

		$str_query = "select invoice_delcode,invoice_bookno,date_format(cusdel_date,'%d-%m-%Y %H:%i:%s') as deliverydate,
						cus_name from dt_customer_deliveryinvoice
						Left join dt_customerdelivery on cusdel_code = invoice_delcode
						left join dt_customer on cus_id = cusdel_cusname
						where invoice_bookno=" . $id;/*and  book_qty - get_CustomerBalanceQty(book_no) > 0*/
		//echo $str_query;exit;		
		$query = $this->db->query($str_query);
		return $query;
	}
	public function close_record()
	{
		$del_codes = array();
		foreach ($_POST['refno'] as $key => $value) {
			$id  		= 	$_POST['refno'][$key];
			$cuscode	= 	$_POST['intcode'][$key];
			$amount 	= 	($_POST['balance'][$key]) * ($_POST['amount'][$key] / $_POST['qty'][$key]);
			$qty 		= 	($_POST['balance'][$key] / 1000);
			$comcode 	= 	$_POST['commodityname'][$key];
			$cus_id 	= 	$_POST['cusdeal_deliveredto'][$key];
			//$delivered_to 	= 	$_POST['cusdeal_deliveredto'];

			$date = date('Y-m-d H:i:s');

			$chkERR_FLAG					= TRUE;
			$cusdel['cusdel_date']			= $date;
			$cusdel['cusdel_bookno']		= $id;
			$cusdel['cusdel_cusname']   	= $cuscode;
			$cusdel['cusdel_deliveryqty']	= $qty;
			$cusdel['cusdeal_deliveredto'] = $cus_id;

			$_status_del = $this->db->insert($this->table_name, $cusdel);
			$Delivery_code = $this->db->insert_id();

			$delivery_invoice['invoice_delcode']  		=	$Delivery_code;
			$delivery_invoice['invoice_bookno']   		=	$id;
			$delivery_invoice['invoice_cuscode']  		=	$cuscode;
			$delivery_invoice['invoice_deliveryqty'] 	= 	$qty;
			$delivery_invoice['invoice_amount']	    	=	$amount;
			$delivery_invoice['invoice_penality']		=	0;
			$delivery_invoice['invoice_totalamt']		=	$amount;
			$delivery_invoice['invoice_comid']	    	=	$comcode;
			//$delivery_invoice['invoice_no']	    	=	'';
			$this->db->insert($this->third_table_name, $delivery_invoice);

			array_push($del_codes, $Delivery_code);

			// Log the delivery operation
			$log_data = array(
				'Delivery Code' => $Delivery_code,
				'Booking No' => $id,
				'Customer Code' => $cuscode,
				'Delivery Qty' => $qty,
				'Amount' => $amount,
				'Commodity Code' => $comcode,
				'Delivered To' => $cus_id,
				'Date' => $date
			);
			
			// Load the common helper for logging
			$this->load->helper('common');
			log_admin_add(47, 'Customer Delivery', $log_data, 'Pending Delivery created');

			//Margin reverse		
			//Check margin already reversed while booking(buy,sell margin squareoff) and if not reversed then reverse on delivery here
			//Getting balance margin
			$qMarbal = $this->db->query("SELECT SUM(IF(trans_payment_type = 1, trans_margin_qty, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_margin_qty, 0)) AS balance_margin_qty, SUM(IF(trans_payment_type = 1, trans_amount, 0)) - SUM(IF(trans_payment_type = 2 OR trans_payment_type = 3, trans_amount, 0)) AS balance_margin_amount, trans_comtype, trans_book_type FROM dt_transaction WHERE trans_book_code = " . $id . " AND (trans_payment_type = 1 OR trans_payment_type = 2 OR trans_payment_type = 3) GROUP BY trans_book_code HAVING balance_margin_qty > 0 ");

			if ($qMarbal->num_rows() > 0) {
				foreach ($qMarbal->result() as $qMarbalrow) {
					$margin_balqty = $qMarbalrow->balance_margin_qty;
					$margin_balamt = $qMarbalrow->balance_margin_amount;

					//check which is lesser qty(delivery qty or balance margin qty) and choose accordingly.
					$marginqty = $qty <= $margin_balqty ? $qty : $margin_balqty;

					// calculate amount of that lesser qty(sell or buy).
					$marginamt = ($margin_balamt / $margin_balqty) * $marginqty;

					//Margin reversal by inserting into transaction table.
					$trans_items['trans_cuscode'] 		= $cuscode;
					$trans_items['trans_date'] 			= $date;
					$trans_items['trans_code'] 			= $Delivery_code;
					$trans_items['trans_payment_type'] 	= 3;
					$trans_items['trans_amount'] 		= $marginamt;
					$trans_items['trans_actype'] 		= 0;
					$trans_items['trans_comments'] 		= "Margin reversal on delivery";
					$trans_items['trans_comtype'] 		= $qMarbalrow->trans_comtype;
					$trans_items['trans_margin_qty'] 	= $marginqty;
					$trans_items['trans_book_code'] 	= $id;
					$trans_items['trans_book_type'] 	= $qMarbalrow->trans_book_type;
					$this->db->insert('dt_transaction', $trans_items);
					unset($trans_items);
				}
			}
		}

		return $del_codes;
	}

	function get_transactiondate()
	{
		$resultset = $this->db->query("SELECT DATE_FORMAT(DATE_SUB(curdate(), INTERVAL trans_period DAY),'%d-%m-%Y') 
										as from_date, DATE_FORMAT(curdate(), '%d-%m-%Y') as to_date FROM dt_rpanel_settings");
		return $resultset;
	}
	public function get_listing($type, $from_date = "", $to_date = "")
	{
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		if ($type == 0) {
			$where = "";
			$query_listing = "select cus_name,cusdel_bookno,
								invoice_delcode,
								date_format(cusdel_date,'%d-%m-%Y %H:%i:%s') as DeliveryDate,
								sum(invoice_deliveryqty) as qty,
								if(book_type=0,'Sell','Buy') as type,
								sum(invoice_amount) as amt,invoice_no,remarks
								FROM dt_customer_deliveryinvoice
								LEFT JOIN dt_customerdelivery ON cusdel_code =invoice_delcode
								LEFT JOIN dt_customer on cus_id = cusdel_cusname 
								LEFT JOIN dt_booking ON book_no = invoice_bookno
								WHERE 
								ifnull(delete_status,0) = 0 and 
					  			DATE(cusdel_date) BETWEEN '" . $from_date . "' AND '" . $to_date . "'" . $where . "
								group by invoice_delcode,cusdel_cusname
								ORDER BY invoice_delcode desc";
			//echo $query_listing;exit;
			$query = $this->db->query($query_listing);
			return $query;
		} else {
			$query_listing = "SELECT
								book_no as bookno,
								cus_name as Customer,
								date_format(book_datetime,'%d-%m-%Y %H:%i:%s') as BookedDate,
								book_qty - ifnull(book_hedgqty,0) as bookedQty,if(book_type=0,'Sell','Buy') as type,
								REPLACE(com_name,'`','') as Commodity,
								round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as TotalAmt,
								book_qty - ifnull(book_physicalqty,0) - ifnull(book_hedgqty,0) as BalanceQty,
								0 as BalanceAmount,remarks
								from dt_booking
								LEFT JOIN dt_customer on cus_id = book_cusid
								LEFT JOIN dt_com_master on com_id = book_comid
								where (book_qty-get_CustomerBalanceQty(book_no)) != 0 and book_status = 1
								and
								book_qty - ifnull(book_physicalqty,0) - ifnull(book_hedgqty,0) > 0
								ORDER BY book_no desc";
			$query = $this->db->query($query_listing);
			return $query;
		}
	}

	public function get_invoice_record($id)
	{
		$records = array();
		$resultset = $this->db->query("SELECT 
										   cus_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, invoice_delcode, invoice_no
									   FROM 
									   	  dt_customer_deliveryinvoice  
									   LEFT JOIN
									   	  dt_booking on invoice_bookno = book_no
									   LEFT JOIN	  
											dt_customer ON cus_id = invoice_cuscode 
										WHERE
										  invoice_delcode = '" . $id . "'");
		foreach ($resultset->result() as $row) {
			$records['cus_name'] 		= $row->cus_name;
			$records['cus_address'] 	= $row->cus_address;
			$records['cus_state'] 		= $row->cus_state;
			$records['cus_country'] 	= $row->cus_country;
			$records['cus_pin_code']	= $row->cus_pin_code;
			$records['cus_city'] 		= $row->cus_city;
			$records['invoice_delcode'] = $row->invoice_delcode;
			$records['invoiceno'] 		= $row->invoice_no;
		}
		return $records;
	}

	function get_ratevalues($invoice_id)
	{
		$records = array();
		$resultset = $this->db->query("SELECT REPLACE(com_name,'`','') as com_name,round((book_rate/book_comweight),2) as rate_per_gram,
									invoice_deliveryqty as total_weight,round((invoice_amount)-(invoice_amount/101),2) as cost_wo_vat,invoice_amount
									from dt_customer_deliveryinvoice
									LEFT JOIN dt_booking on book_no = invoice_bookno
									LEFT JOIN dt_com_master on book_comid = com_id
									where invoice_delcode='" . $invoice_id . "'");
		$i = 0;
		foreach ($resultset->result() as $row) {
			$records[$i]['com_name'] 	     = $row->com_name;
			$records[$i]['rate_per_gram']    = $row->rate_per_gram;
			$records[$i]['total_weight']     = $row->total_weight;
			$records[$i]['cost_wo_vat']      = $row->cost_wo_vat;
			$records[$i]['book_totalcost']   = $row->invoice_amount;
			$i++;
		}
		return $records;
	}

	function no_to_words($no = "")
	{
		$nos = explode('.', $no);
		$val1 = "";
		$val2 = "";
		$val = "";
		if (isset($nos[0])) {
			$val1 = $this->no_to_words1($nos[0]);
			$val = $val1 . " RUPEES";
		}
		if (isset($nos[1]) && $nos[1] != 0) {
			$val2 = $this->no_to_words1($nos[1]);
			if (isset($val2))
				$val = $val1 . " RUPEES AND" . " " . $val2 . " PAISA";
		}
		return $val;
	}
	function no_to_words1($nos1 = "")
	{
		$words = array('0' => '', '1' => 'One', '2' => 'Two', '3' => 'Three', '4' => 'Four', '5' => 'Five', '6' => 'Six', '7' => 'Seven', '8' => 'Eight', '9' => 'Nine', '10' => 'Ten', '11' => 'Eleven', '12' => 'Twelve', '13' => 'Thirteen', '14' => 'Fouteen', '15' => 'Fifteen', '16' => 'Sixteen', '17' => 'Seventeen', '18' => 'Eighteen', '19' => 'Nineteen', '20' => 'Twenty', '30' => 'Thirty', '40' => 'Fourty', '50' => 'Fifty', '60' => 'Sixty', '70' => 'Seventy', '80' => 'Eighty', '90' => 'Ninty', '100' => 'Hundred &', '1000' => 'Thousand', '100000' => 'Lakh', '10000000' => 'Crore');
		$nos[0] = $nos1;
		if ($nos[0] == 0)
			return '';
		else {
			$novalue = '';
			$highno = $nos[0];
			$remainno = 0;
			$value = 100;
			$value1 = 1000;
			$temp = '';

			while ($nos[0] >= 100) {
				if (($value <= $nos[0]) && ($nos[0]  < $value1)) {
					$novalue = $words["$value"];
					$highno = (int)($nos[0] / $value);
					$remainno = $nos[0] % $value;
					break;
				}
				$value = $value1;
				$value1 = $value * 100;
			}
			if (array_key_exists("$highno", $words)) {
				return $words["$highno"] . " " . $novalue . " " . $this->no_to_words1($remainno);
			} else {
				$unit = $highno % 10;
				$ten = (int)($highno / 10) * 10;
				return $words["$ten"] . " " . $words["$unit"] . " " . $novalue . " " . $this->no_to_words1($remainno);
			}
		}
	}
	function no_to_words2($nos2 = "")
	{
		if ($nos2 == 0)
			return '';
		$word = '';
		$words = array('0' => 'Zero', '1' => 'One', '2' => 'Two', '3' => 'Three', '4' => 'Four', '5' => 'Five', '6' => 'Six', '7' => 'Seven', '8' => 'Eight', '9' => 'Nine');
		$numbers = str_split($nos2);
		for ($i = 0; $i < count($numbers); $i++) {
			if (array_key_exists("$numbers[$i]", $words)) {
				$word = $word . " " . $words["$numbers[$i]"];
			}
		}
		return $word;
	}
	function get_SMSURL($service_id, $id)
	{
		//Declaration of variables
		$sms_url = "";
		$sms_status = 0;
		$sms_id = 1; //Send SMS
		$sms_content = "";
		$sms_footer = "";
		$customer_data = array();
		//Retriving SMS service for registration confirmation
		$resultset = $this->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
		foreach ($resultset->result() as $row) {
			$sms_status = $row->serv_sms;
		}
		$resultset->free_result();
		//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($sms_status == 1) {
			$resultset = $this->db->query("select invoice_delcode,invoice_bookno,cus_name,if(book_bar_type = 1, CONCAT(TRIM(invoice_deliveryqty)+0,' Kg'), CONCAT(TRIM(invoice_deliveryqty*1000)+0,' gms')) as invoice_deliveryqty,
												invoice_amount,invoice_penality,invoice_totalamt,REPLACE(com_name,'`','') as com_name,cusdel_date,cus_mobile,if(book_bar_type = 1, CONCAT(TRIM(book_qty)+0,' Kg'), CONCAT(TRIM(book_qty*1000)+0,' gms')) AS book_qty, book_rate, if(book_type=0,'Buy',if(book_type=1,'Sell','')) as book_type, book_datetime,book_totalcost 
												from dt_customer_deliveryinvoice
												left join dt_customerdelivery on invoice_delcode = cusdel_code
												LEFT JOIN dt_customer on invoice_cuscode = cus_id
												LEFT JOIN dt_com_master on com_id = invoice_comid
												LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
												LEFT JOIN dt_booking on invoice_bookno = book_no
												where invoice_delcode='" . $id . "'");
			foreach ($resultset->result() as $row) {
				$customer_data = $row;

				if (isset($customer_data->book_rate) && $customer_data->book_rate > 0) {
					$customer_data->book_rate = $this->moneyFormatIndia($customer_data->book_rate);
				}
				if (isset($customer_data->book_totalcost) && $customer_data->book_totalcost > 0) {
					$customer_data->book_totalcost = $this->moneyFormatIndia($customer_data->book_totalcost);
				}
				if (isset($customer_data->invoice_amount) && $customer_data->invoice_amount > 0) {
					$customer_data->invoice_amount = $this->moneyFormatIndia($customer_data->invoice_amount);
				}
				if (isset($customer_data->invoice_totalamt) && $customer_data->invoice_totalamt > 0) {
					$customer_data->invoice_totalamt = $this->moneyFormatIndia($customer_data->invoice_totalamt);
				}

				$sms_url = $this->general_model->get_SMSAppSettings($sms_id, $customer_data->cus_mobile);
				//Retriving message content
				$resultset = $this->db->query("SELECT sms_content, sms_footer from dt_sms_settings where service_id = '" . $service_id . "'");
				foreach ($resultset->result() as $row) {
					$sms_content = $row->sms_content;
					$sms_footer = $row->sms_footer;
				}
				$resultset->free_result();
				//Generating Message content
				$field_name = explode('@@', $sms_content);
				//echo count($field_name);		
				for ($i = 1; $i < count($field_name); $i += 2) {
					if (isset($customer_data->{$field_name[$i]})) {
						$sms_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $sms_content);
					}
				}
				$field_name_footer = explode('@@', $sms_footer);
				for ($i = 1; $i < count($field_name_footer); $i += 2) {
					if (isset($customer_data->{$field_name_footer[$i]})) {
						$sms_footer = str_replace("@@" . $field_name_footer[$i] . "@@", $customer_data->{$field_name_footer[$i]}, $sms_footer);
					}
				}
				$sms_content .= " " . $sms_footer;
				$sms_content = urlencode($sms_content);
				$sms_url = str_replace("@@message@@", $sms_content, $sms_url);
			}
		}
		return $sms_url;
	}

	function get_EmailContent($service_id, $id)
	{
		//Declaration of variables
		$email_content = "";
		$email_status = 0;
		$email_id = 1; //Send SMS		
		$email_signature = "";
		$customer_data = array();
		//Retriving EMail service for registration confirmation
		$resultset = $this->db->query("SELECT serv_email FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
		foreach ($resultset->result() as $row) {
			$email_status = $row->serv_email;
		}
		$resultset->free_result();
		//Checking EMail service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($email_status == 1) {
			$resultset = $this->db->query("select invoice_delcode,invoice_bookno,cus_name,CONCAT(TRIM(invoice_deliveryqty*1000)+0,' gms') as invoice_deliveryqty,
											invoice_amount,invoice_penality,invoice_totalamt,REPLACE(com_name,'`','') as com_name,cusdel_date,cus_email,if(book_bar_type = 1, CONCAT(TRIM(book_qty)+0,' Kg'), CONCAT(TRIM(book_qty*1000)+0,' gms')) as book_qty, book_rate, if(book_type=0,'Buy',if(book_type=1,'Sell','')) as book_type, book_datetime,book_totalcost, '" . $this->session->userdata('company_name') . "' as admin_company_name
											FROM dt_customer_deliveryinvoice
											LEFT JOIN dt_customerdelivery ON invoice_delcode = cusdel_code
											LEFT JOIN dt_customer ON invoice_cuscode = cus_id
											LEFT JOIN dt_com_master ON com_id = invoice_comid
											LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
											LEFT JOIN dt_booking ON invoice_bookno = book_no
											where invoice_delcode='" . $id . "'");

			foreach ($resultset->result() as $row) {
				$customer_data = $row;
				$return_data["email_id"] = 	$customer_data->cus_email;
				//Retriving message content
				$resultset = $this->db->query("SELECT email_content, email_signature from dt_email_settings where service_id = '" . $service_id . "'");
				foreach ($resultset->result() as $row) {
					$email_content = $row->email_content;
					$email_signature = $row->email_signature;
				}
				$resultset->free_result();
				//Generating Message content
				$field_name = explode('@@', $email_content);
				//echo count($field_name);
				for ($i = 1; $i < count($field_name); $i += 2) {
					if (isset($customer_data->{$field_name[$i]})) {
						$email_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $email_content);
					}
				}
				$field_name_sig = explode('@@', $email_signature);
				for ($i = 1; $i < count($field_name_sig); $i += 2) {
					if (isset($customer_data->{$field_name_sig[$i]})) {
						$email_signature = str_replace("@@" . $field_name_sig[$i] . "@@", $customer_data->{$field_name_sig[$i]}, $email_signature);
					}
				}
				$return_data["email_subject"] = $email_signature;
				$return_data["email_content"] = $email_content;
			}
		}
		//Returning generated EMail Content
		return isset($return_data) ? $return_data : '';
	}
	function get_customer($cus_id = "")
	{
		$cus_id = isset($cus_id) ? $cus_id : '-1';

		//Build contents query
		$query = $this->db->query("select cus_id , cus_name  from dt_customer order by cus_name");
		$strData = "<select  style='width: 95px;font-size:12px' name='cus_id' id='cus_id' onchange='get_cusledgerdata()' ><option value='-1'>SELECT</option>";
		foreach ($query->result_array() as $row) {
			if ($row['cus_id'] == $cus_id) {
				$str = "selected='selected'";
			} else {
				$str = "";
			}
			$strData .= "<option value='" . htmlspecialchars($row['cus_id'], ENT_QUOTES) . "' " . $str . " >" . htmlspecialchars($row['cus_name'], ENT_QUOTES) . "</option>";
		}
		$strData .= "</select>";
		$query->free_result();
		return $strData;
	}
	function get_customermarginreport()
	{
		// BZ-33: Added last transaction date column to margin report
		$str_query = $this->db->query("SELECT cus_name, cus_company_name, cus_mobile, IFNULL( mpaid.margin_paid, 0 ) AS margin_paid, IFNULL( trans.available_balance, 0 ) AS available_balance, IFNULL(DATE_FORMAT(trans.last_date, '%d-%m-%Y'), '-') AS last_trans_date
		FROM dt_customer
		LEFT JOIN (
		SELECT trans_cuscode, IFNULL( SUM( IF( trans_actype =1, -1, 1 ) * IFNULL( trans_amount, 0 ) ),0) AS available_balance, MAX(trans_date) AS last_date
		FROM dt_transaction
		GROUP BY trans_cuscode
		) AS trans ON cus_id = trans.trans_cuscode
		LEFT JOIN (
		SELECT trans_cuscode, IFNULL( SUM( IF( trans_actype =1, -1, 1 ) * IFNULL( trans_amount, 0 ) ),0) AS margin_paid
		FROM dt_transaction WHERE trans_payment_type = 0
		GROUP BY trans_cuscode
		) AS mpaid ON cus_id = mpaid.trans_cuscode
		ORDER BY cus_name
		");
		return $str_query;
	}
	function get_transactiondata($cus_id, $from_date = "", $to_date = "")
	{
		// BZ-34: Sanitize customer ID
		$cus_id = (int)$cus_id;
		if ($cus_id <= 0) {
			return array();
		}
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		$result_data = array();

		$closing_balance = 0;

		$str_query = "SELECT IF(trans_payment_type = 0, '-', trans_book_code) AS trans_book_code,  date_format(trans_date,'%d-%m-%Y %H:%i:%s') AS trans_date , if(trans_actype = 0, trans_amount,0) AS credit, if(trans_actype = 1, trans_amount,0) AS debit, trans_comments FROM dt_transaction WHERE trans_cuscode = ? AND DATE(trans_date) BETWEEN ? AND ? ORDER BY trans_date, trans_id ASC";

		$resultset = $this->db->query($str_query, array($cus_id, $from_date, $to_date));
		foreach ($resultset->result() as $row) {
			$credit = round($row->credit, 2);
			$debit = round($row->debit, 2);
			$closing_balance =  round($closing_balance + $credit - $debit, 2);

			$result_data[] = array('trans_book_code' => $row->trans_book_code, 'trans_date' => $row->trans_date, 'trans_desc' => $row->trans_comments, 'credit' => number_format($credit, 2, '.', ''), 'debit'  => number_format($debit, 2, '.', ''), 'closing_balance'  => number_format($closing_balance, 2, '.', ''));
		}
		return $result_data;
	}
	function get_customerdeliveryreport($from_date = "", $to_date = "", $comid = '-1', $comType = "-1", $bookType = "-1")
	{
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));
		$comid =   $comid == -1 || $comid == '' ? '' : (' AND dt_booking.book_comid = ' . intval($comid));

		$comType = $comType == -1 || $comType == '' ? '' : ($comType == 0 ? ' AND rcom_comtype != 1 ' : ($comType == 1 ? ' AND rcom_comtype = 1 ' : ''));

		$bookType = $bookType == -1 || $bookType == '' ? '' : ($bookType == 0 ? ' dt_booking.book_type = 0 AND ' : ($bookType == 1 ? '  dt_booking.book_type = 1 AND ' : ''));

		$str_query = "SELECT book_no as bookno, cusdeal_deliveredto,ifnull(dc.cus_mobile,'-') as deliverycus_mobile,book_comweight,ifnull(dc.cus_id,'-') as delivered_cusid,
		date_format(book_datetime,'%d-%m-%Y %H:%i:%s') as bookdate, ifnull(dc.cus_company_name,'-') as delivery_cus_company,
		book_comid as comcode, rcom_comtype as com_type, ifnull(dc.cus_name,'-') as deliverycustomer,
		if(book_type=0,'Sell','Buy') as book_type, book_rate, dt.
		cus_name as customername, REPLACE(com_name,'`','') as commodityname,
		if(ordertype = 0 ,book_status,orderstatus) as book_status, 
		book_qty as bookqty,dt.cus_id as cuscode, round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount, 
		book_qty - ifnull(book_physicalqty,0) as BalanceQty, 0 as BalanceAmount, ordertype,
		dt.cus_alise_name,ifnull(dt.cus_city,'-') AS cus_city, if(book_by = 1, 'App',if(book_by = 2, 'Browser', if(book_by = 3, 'Admin',''))) AS book_by,
		date_format(cusdel_date,'%d-%m-%Y %H:%i:%s') as cusdeliverydate, 
		cusdel_deliveryqty*1000 as deliveryqty ,dt.cus_mobile, dt.cus_company_name,cusdel_code
		FROM dt_customerdelivery 
		JOIN dt_booking ON book_no = cusdel_bookno 
		Left Join dt_customer dt on  dt.cus_id = book_cusid 
		Left Join dt_customer  dc on dc.cus_id = cusdeal_deliveredto 
		Left Join dt_com_master ON book_comid = com_id
		left join dt_rpanelcommodities on rcom_id = com_type					  
		WHERE " . $bookType . " ifnull(dt_booking.delete_status,0) = 0 " . $comType . " " . $comid . " AND  
		DATE(cusdel_date) BETWEEN '" . $from_date . "' AND '" . $to_date . "'
		ORDER BY cusdel_date DESC";
		$query = $this->db->query($str_query);
		return $query;
	}
	function get_tradingStatus($from_date = "", $to_date = "", $type = '', $status = '', $comid = '', $comType = '', $bookType = '', $cusid = '')
	{
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));

		$otype   =   $type == -1 ? '' : ($type == 0 ? 'ordertype = 0 AND' : 'ordertype = 1 AND');

		// Status filter: -1=All, 0=Confirmed, 1=Pending delivery, 2=Delivered, 3=Partial Delivered, 4=Cancelled
		$status = intval($status);
		if ($status == -1) {
			$book_status = '';
		} else if ($status == 0) {
			// Confirmed = book_status = 1
			$book_status = 'book_status = 1 AND';
		} else if ($status == 1) {
			// Pending delivery = confirmed but no delivery yet (balance == booked)
			$book_status = 'book_status = 1 AND ifnull(del_qty.deliveredqty,0) = 0 AND';
		} else if ($status == 2) {
			// Delivered = confirmed and fully delivered (balance <= 0)
			$book_status = 'book_status = 1 AND (book_qty - ifnull(del_qty.deliveredqty,0)) <= 0 AND';
		} else if ($status == 3) {
			// Partial Delivered = confirmed, some delivered but not all
			$book_status = 'book_status = 1 AND ifnull(del_qty.deliveredqty,0) > 0 AND (book_qty - ifnull(del_qty.deliveredqty,0)) > 0 AND';
		} else if ($status == 4) {
			// Cancelled = book_status != 1 (rejected/cancelled)
			$book_status = 'book_status != 1 AND';
		} else {
			$book_status = '';
		}

		$comid =   $comid == -1 ? '' : ('com_id = ' . intval($comid) . ' AND');

		$comType = $comType == -1 ? '' : ($comType == 0 ? ' AND rcom_comtype != 1 ' : ($comType == 1 ? ' AND rcom_comtype = 1 ' : ''));

		$bookType = $bookType == -1 ? '' : ($bookType == 0 ? ' book_type = 0 AND ' : ($bookType == 1 ? '  book_type = 1 AND ' : ''));

		$cusid =   $cusid != '' ? ($cusid == -1 ? '' : ('book_cusid = ' . intval($cusid) . ' AND')) : '';
		// print_r($cusid);exit;

		$str_query = "SELECT book_cusid as bookcusid, book_no as bookno,db.unfix,
						DATE_FORMAT(IF(IFNULL(orderstatus,0) = 1, orderplacedtime, book_datetime), '%d-%m-%Y %H:%i:%s') as bookdate,
						book_comid as comcode,rcom_comtype as com_type,
						if(book_type=0,'Sell','Buy') as book_type,book_rate,
						cus_name as customername,
						REPLACE(com_name,'`','') as commodityname,
						book_qty as bookqty,cus_id as cuscode,
						round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
						(book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty, 
						ifnull(del_qty.cusdel_bookno,0) as del_bookno, 
						round((book_totalcost / (book_qty * 1000)) * ((book_qty * 1000) - ifnull((del_qty.deliveredqty * 1000),0)),2) as BalanceAmount,
						ordertype,
						orderstatus,
						book_status,
						cus_alise_name,
						ifnull(cus_city,'-') AS cus_city,if(book_by = 1, 'App',if(book_by = 2, 'Browser', if(book_by = 3, 'Admin','Admin App'))) AS book_by,
						if(order_actualprice = 0, '-', order_actualprice) AS order_actualprice,if(order_liveprice = 0, '-', order_liveprice) AS order_liveprice,remarks, book_liveprice, cus_mobile, cus_company_name,
						ifnull(book_narration,'') as book_narration, del_qty.deliveredqty as deliveredqty,book_by,ifnull(book_usercomment,'') as book_usercomment,date_format(book_deliverydate,'%d-%m-%Y') as book_deliverydate, book_ishedge, book_hedgemanual,dc.unfix as cus_fix
						From dt_booking db
						Left Join dt_customer as dc on cus_id = book_cusid
						Left join dt_com_master on com_id = book_comid 
						left join dt_rpanelcommodities on rcom_id = com_type
						LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty,
									ifnull(date_format(cusdel_date, '%d-%m-%Y %H:%i:%s'), '-') as deliverydate
									from dt_customerdelivery group by cusdel_bookno)
									as del_qty on del_qty.cusdel_bookno = book_no 
						WHERE IFNULL(delete_status, 0) = 0 " . $comType . " AND
              " . $otype . " " . $bookType . " " . $book_status . " " . $comid . " " . $cusid . " 
              DATE(IF(IFNULL(orderstatus, 0) = 1, orderplacedtime, book_datetime)) BETWEEN '" . $from_date . "' AND '" . $to_date . "'
        ORDER BY 
              IF(IFNULL(orderstatus, 0) = 1, orderplacedtime, book_datetime) DESC";
		//   print_r($str_query);exit;  
		$query = $this->db->query($str_query);
		return $query;
	}

	function update_invoiceno($invoice_code, $invoice_no)
	{
		if ($this->db->query("UPDATE dt_customer_deliveryinvoice set invoice_no = ? WHERE invoice_delcode = ?", array($invoice_no, $invoice_code)))
			echo true;
		else {
			$error = $this->db->error();
			echo isset($error['message']) ? $error['message'] : 'Database error';
		}
	}
	function get_active_commodities()
	{
		$records = array();
		$str_query = "SELECT com.com_id AS com_id, com.com_name AS com_name FROM dt_com_group_com AS comgrp
						LEFT JOIN dt_com_master AS com ON com.com_id = comgrp.com_id
						WHERE comgrp.com_sel_active = 1 OR comgrp.com_buy_active = 1";

		$query = $this->db->query($str_query);

		foreach ($query->result() as $row) {
			$records[] = array('com_id' => $row->com_id, 'com_name' => $row->com_name);
		}
		$query->free_result();
		return $records;
	}
	function get_active_customers()
	{
		$records = array();
		$str_query = "SELECT cus_id,cus_mobile as mobile_number,cus_name as customer FROM dt_customer WHERE cus_active = 1";
		$query = $this->db->query($str_query);

		foreach ($query->result() as $row) {
			$records[] = array('cus_id' => $row->cus_id, 'customer' => $row->customer, 'mobile_number' => $row->mobile_number);
		}
		$query->free_result();
		return $records;
	}
	function print_record($type)
	{
		// P-SQL fix: Whitelist allowed order_by values to prevent SQL injection
		$allowed_orders = array(
			'ORDER BY book_no ASC', 'ORDER BY book_no DESC',
			'ORDER BY book_datetime ASC', 'ORDER BY book_datetime DESC',
			'ORDER BY book_rate ASC', 'ORDER BY book_rate DESC',
			'ORDER BY cus_name ASC', 'ORDER BY cus_name DESC',
			'ORDER BY com_name ASC', 'ORDER BY com_name DESC',
			'ORDER BY cusdel_date ASC', 'ORDER BY cusdel_date DESC',
			'ORDER BY bookno ASC', 'ORDER BY bookno DESC',
			'ORDER BY hedgid DESC'
		);
		$order_by = isset($_POST['order_by']) && in_array(trim($_POST['order_by']), $allowed_orders)
			? trim($_POST['order_by'])
			: 'ORDER BY book_no DESC';

		if ($type == 'DR'  || $type == 'TT') {
			if (!empty($_POST['book_nos'])) {
				// P-SQL fix: sanitize book_nos with intval
				$safe_ids = array_map('intval', $_POST['book_nos']);
				$safe_ids = array_filter($safe_ids, function($v) { return $v > 0; });
				if (empty($safe_ids)) return array();
				$in_list = implode(',', $safe_ids);

				$str_query = "select book_no as bookno,date_format(book_datetime,'%d-%m-%Y %H:%i:%s') as bookdate,book_comid as comcode,rcom_comtype as com_type,if(book_type=0,'Sell','Buy') as book_type,book_rate,
				cus_name as customername,REPLACE(com_name,'`','') as commodityname,date_format(cusdel_date,'%d-%m-%Y %H:%i:%s') as cusdeliverydate,
				orderstatus, book_status,book_qty - ifnull(book_hedgqty,0) as bookqty,cus_id as cuscode,
				round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
				(book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty,0 as BalanceAmount,
				ordertype,cus_company_name,cus_mobile,ifnull(cus_city,'-') AS cus_city,if(book_by = 1, 'App',if(book_by = 2, 'Browser', if(book_by = 3, 'Admin',''))) AS book_by,cusdel_deliveryqty as deliveryqty,
				ifnull(book_usercomment,'') as book_usercomment, ifnull(book_narration,'') as book_narration From dt_booking
				Left Join dt_customer on cus_id = book_cusid
				Left join dt_com_master on com_id = book_comid
				left join dt_rpanelcommodities on rcom_id = com_type
				left join dt_customerdelivery on book_no = cusdel_bookno 
				LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty,
								ifnull(date_format(cusdel_date, '%d-%m-%Y %H:%i:%s'), '-') as deliverydate
								from dt_customerdelivery group by cusdel_bookno)
								as del_qty on del_qty.cusdel_bookno = book_no
				where book_no IN (" . $in_list . ") " . $order_by;
				$query = $this->db->query($str_query)->result_array();
				return $query;
			}
		} else if ($type == 'PD') {
			if (!empty($_POST['book_nos'])) {
				// P-SQL fix: sanitize book_nos with intval
				$safe_ids = array_map('intval', $_POST['book_nos']);
				$safe_ids = array_filter($safe_ids, function($v) { return $v > 0; });
				if (empty($safe_ids)) return array();
				$in_list = implode(',', $safe_ids);

				$str_query = "select book_no as bookno,
				date_format(book_datetime,'%d-%m-%Y %H:%i:%s') as bookdate,
				book_comid as comcode,rcom_comtype as com_type,
				if(book_type=0,'Sell','Buy') as book_type,book_rate,
				dt.cus_name as customername,
				REPLACE(com_name,'`','') as commodityname,
				book_qty as bookqty,dt.cus_id as cuscode,
				round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount,
				(book_qty - ifnull(del_qty.deliveredqty,0)) as BalanceQty,
				0 as BalanceAmount, del_qty.cusdel_bookno,
				dt.cus_company_name,dt.cus_mobile,
				ifnull(dt.cus_city,'-') AS cus_city,
				ordertype,
				ifnull(dc.cus_name,'-') as deliverto_name,
				ifnull(book_usercomment,'-') as book_usercomment,
				ifnull(book_narration,'-') as book_narration,
				if(book_by=1,'App',if(book_by=2,'Browser',if(book_by=3,'Admin',if(book_by=4,'Admin App','-')))) as book_by
				From dt_booking
				Left Join dt_customer dt on dt.cus_id = book_cusid
				Left join dt_com_master on com_id = book_comid
				left join dt_rpanelcommodities on rcom_id = com_type
				LEFT JOIN (SELECT cusdel_bookno, ifnull(sum(cusdel_deliveryqty),0) as deliveredqty,
								ifnull(date_format(cusdel_date, '%d-%m-%Y %H:%i:%s'), '-') as deliverydate
								from dt_customerdelivery group by cusdel_bookno)
								as del_qty on del_qty.cusdel_bookno = book_no
				LEFT JOIN dt_customerdelivery on book_no = dt_customerdelivery.cusdel_bookno
				Left Join dt_customer dc on dc.cus_id = dt_customerdelivery.cusdeal_deliveredto
				where book_no IN (" . $in_list . ") " . $order_by;
				$query = $this->db->query($str_query)->result_array();
				return $query;
			}
		} else if ($type == 'RT') {
			if (!empty($_POST['book_nos'])) {
				// P-SQL fix: sanitize book_nos with intval
				$safe_ids = array_map('intval', $_POST['book_nos']);
				$safe_ids = array_filter($safe_ids, function($v) { return $v > 0; });
				if (empty($safe_ids)) return array();
				$in_list = implode(',', $safe_ids);

				$str_query = "SELECT book_no as bookno, 
				  date_format(book_datetime,'%d-%m-%Y %H:%i:%s') as bookdate, 
				  book_comid as comcode, rcom_comtype as com_type, 
				  if(book_type=0,'Sell','Buy') as book_type, book_rate, 
				  dt.cus_name as customername, dt.cus_company_name, REPLACE(com_name,'`','') as commodityname,
				  ifnull(dc.cus_name,'-') as deliverycustomer, ifnull(dc.cus_company_name,'-') as delivery_cus_company,
				  if(ordertype = 0 ,book_status,orderstatus) as book_status, 
				  book_qty as bookqty,dt.cus_id as cuscode, round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) as bookamount, 
				  book_qty - ifnull(book_physicalqty,0) as BalanceQty, 0 as BalanceAmount, ordertype,
				  dt.cus_alise_name,ifnull(dt.cus_city,'-') AS cus_city, if(book_by = 1, 'App',if(book_by = 2, 'Browser', if(book_by = 3, 'Admin',''))) AS book_by,
				  date_format(cusdel_date,'%d-%m-%Y %H:%i:%s') as cusdeliverydate, 
				  cusdel_deliveryqty as deliveryqty ,dt.cus_mobile
				  FROM dt_customerdelivery 
				  LEFT JOIN dt_booking ON book_no = cusdel_bookno 
				  Left Join dt_customer dt on dt.cus_id = book_cusid 
				  Left Join dt_customer dc on dc.cus_id = cusdeal_deliveredto
				  Left Join dt_com_master ON book_comid = com_id
				  left join dt_rpanelcommodities on rcom_id = com_type
				  WHERE book_no IN (" . $in_list . ") " . $order_by;

				$query = $this->db->query($str_query)->result_array();
				return $query;
			}
		} else if ($type == 'MT5') {
			$from_date = date('Y-m-d', strtotime($this->input->post('from_date')));
			$to_date = date('Y-m-d', strtotime($this->input->post('to_date')));

			$str_query = "SELECT hedgid, dealid, orderid, (volume*1000) AS volume, price, bid, ask, comment, request_id, symbol, cusbookid, DATE_FORMAT(bookedon, '%d-%m-%Y %h:%i:%s %p') AS bookedon, bookedby, orderfor, mt5_disable, TRIM(book_qty*1000)+0 as book_qty FROM dt_mt5_hedgedata LEFT JOIN dt_booking ON cusbookid = book_no WHERE mt5_disable = 0 AND DATE(bookedon) BETWEEN ? AND ? ORDER BY hedgid DESC";

			$query = $this->db->query($str_query, array($from_date, $to_date))->result_array();
			return $query;
		}
	}
	function delete_booking($id)
	{
		$tradeObj = new Trading();
		$book_nos = array();
		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		if ($cancel_ratealert_url != '' && $client != '') {
			// Get the record before deleting for logging purposes
			$booking_record = $this->db->query("SELECT * FROM dt_booking WHERE book_no = ?", array($id))->row_array();
			
			$oDetails = $tradeObj->get_orderdetails($id)->result_array();

			$resultset = $this->db->query("SELECT com_name,
								com_rest_wt, rcom_comtype 
								from  dt_com_master 
								LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type 
								where com_id = ?", array($oDetails[0]['book_comid']));
			if ($resultset->num_rows() > 0) {
				$goldwt_info 		= $resultset->row_array();
				$bookedweight_rest 	= $goldwt_info['rcom_comtype'] == 1 ? $oDetails[0]['book_qty'] : $oDetails[0]['book_qty'] * 1000;
				$gold_wt 			=	(float)$goldwt_info['com_rest_wt'];
				$bookedweight_rest 	=	(float)$bookedweight_rest;
				$rest_weight 		=	$gold_wt + $bookedweight_rest;

				$this->db->query("update dt_com_master set com_rest_wt = ? where com_id = ?", array($rest_weight, $oDetails[0]['book_comid']));
			}


			$this->db->query("delete from " . $this->third_table_name . " where invoice_bookno = ?", array($id));
			$this->db->query("delete from " . $this->table_name . " where cusdel_bookno = ?", array($id));
			$this->db->query("delete from " . $this->fifth_table_name . " where book_no = ?", array($id));

			// Log the delete operation
			if ($this->db->affected_rows() > 0) {
				// Load field labels helper to map field names to user-friendly labels
				$this->load->helper('field_labels');
				$field_labels = get_field_labels();
				$value_labels = get_field_value_labels();
				
				// Load the common helper for logging
				$this->load->helper('common');
				
				// Create a mapped version of the data for logging
				$logged_data = array();
				if (!empty($booking_record)) {
					foreach ($booking_record as $field => $value) {
						// Use the field label if available, otherwise use the field name
						$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
						
						// Use value label if available, otherwise use the raw value
						if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
							$logged_data[$label] = $value_labels[$field][$value];
						} else {
							$logged_data[$label] = $value;
						}
					}
					
					// Log the delete operation using common helper
					log_admin_delete(47, 'Customer Delivery', $logged_data, 'Deleted Pending Delivery');
				}
			}

			if ($oDetails[0]['ordertype'] == 1 && $oDetails[0]['orderstatus'] == 0) {
				array_push($book_nos, $id);
			}

			if (count($book_nos) > 0) {
				$requestdata = array(
					'client'  => $client,
					'book_no' => $book_nos
				);
				$field_string = http_build_query($requestdata);
				$curl_resp = curl_helper($cancel_ratealert_url, $field_string);
				$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';

				if ($url != '') {
					$return_array['limit'] = array('limitupdate' => 1, 'book_no' => "1");
					$field_string = http_build_query($return_array);
					$curl_resp = curl_helper($url, $field_string);
				}
			}
		}
	}
	function revert_delivery($id)
	{
		$this->db->query("delete from " . $this->third_table_name . " where invoice_bookno = ?", array($id));
		$this->db->query("delete from " . $this->table_name . " where cusdel_bookno = ?", array($id));
		$this->db->query("update dt_booking set book_physicalqty=0 where book_no = ?", array($id));
	}
	function deal_transfer($book_id, $book_update_data)
	{
		$response_data = array();
		if ($book_id != NULL && is_array($book_update_data)) {
			if ($this->db->update("dt_booking", $book_update_data, array('book_no' => $book_id))) {

				$this->db->query("DELETE FROM dt_transaction WHERE trans_payment_type = 0 AND (trans_margin_type = 0 OR trans_margin_type = 5) AND trans_actype = 1 AND trans_code = ?", array('BK-' . $book_id));

				$response_data = array("success" => TRUE, "message" => "Deal Transfer Successfully");
			} else {
				$response_data = array("success" => FALSE, "message" => "Please try one more time, Faild to update");
			}
		} else {
			$response_data = array("success" => FALSE, "message" => "Please enter valid details");
		}
		return $response_data;
	}
	function get_openingBalanceQty($comid = "")
	{
		$comid =   $comid == -1 || $comid == "" ? '' : ('com_id = ' . intval($comid) . ' AND');

		$str_query = "SELECT cus_name, cus_alise_name, ifnull(cus_city,'-') AS cus_city, REPLACE(com_name,'`','') as commodityname, rcom_comtype as com_type, cus_open_qty, cus_open_rate, ROUND(IF(rcom_comtype = 0 , (cus_open_qty * (cus_open_rate * 1000)) , (cus_open_qty * cus_open_rate)),2) AS book_totalcost
						From dt_customer
						Left Join dt_cus_commodity on cus_id = cus_com_cus_id
						Left join dt_com_master on com_id = cus_com_id 
						Left join dt_rpanelcommodities on rcom_id = com_type 
						WHERE " . $comid . " cus_open_qty > 0 AND cus_open_rate > 0";

		$result = $this->db->query($str_query);
		return $result;
	}
	function delete_selectedRecords()
	{
		$tradeObj = new Trading();
		$book_nos = array();
		$cancel_ratealert_url    =  trim(isset(Globals::$cancelratealert) ? Globals::$cancelratealert : '');
		$client	 				 =  trim(isset(Globals::$client) ? Globals::$client : '');
		if ($cancel_ratealert_url != '' && $client != '') {
			foreach ($_POST['book_nos'] as $key => $value) {
				$oDetails = $tradeObj->get_orderdetails($_POST['book_nos'][$key])->result_array();

				if (count($oDetails) > 0) {
					// Get the record before deleting for logging purposes
					$safe_book_no = intval($_POST['book_nos'][$key]);
					$booking_record = $this->db->query("SELECT * FROM dt_booking WHERE book_no = ?", array($safe_book_no))->row_array();
					
					$this->db->query("delete from " . $this->third_table_name . " where invoice_bookno = ?", array($safe_book_no));
					$this->db->query("delete from " . $this->table_name . " where cusdel_bookno = ?", array($safe_book_no));
					$this->db->query("delete from " . $this->fifth_table_name . " where book_no = ?", array($safe_book_no));

					// Log the delete operation
					if ($this->db->affected_rows() > 0) {
						// Load field labels helper to map field names to user-friendly labels
						$this->load->helper('field_labels');
						$field_labels = get_field_labels();
						$value_labels = get_field_value_labels();
						
						// Create a mapped version of the data for logging
						$logged_data = array();
						if (!empty($booking_record)) {
							foreach ($booking_record as $field => $value) {
								// Use the field label if available, otherwise use the field name
								$label = isset($field_labels[$field]) ? $field_labels[$field] : $field;
								
								// Use value label if available, otherwise use the raw value
								if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
									$logged_data[$label] = $value_labels[$field][$value];
								} else {
									$logged_data[$label] = $value;
								}
							}
							
							// Log the delete operation using common helper
							log_admin_delete(48, 'Customer Delivery', $logged_data, 'Deleted Pending Delivery');
						}
					}

					if ($oDetails[0]['ordertype'] == 1 && $oDetails[0]['orderstatus'] == 0) {
						array_push($book_nos, $_POST['book_nos'][$key]);
					}
				}
			}

			if (count($book_nos) > 0) {
				$requestdata = array(
					'client'  => $client,
					'book_no' => $book_nos
				);
				$field_string = http_build_query($requestdata);
				$curl_resp = curl_helper($cancel_ratealert_url, $field_string);

				$url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
				if ($url != '') {
					$return_array['limit'] = array('limitupdate' => 1, 'book_no' => "1");
					$field_string = http_build_query($return_array);
					$curl_resp = curl_helper($url, $field_string);
				}
			}
		}
	}
	function get_invoicevalue() //printer comdetails dynamically
	{
		$records = array();
		$resultset = $this->db->query("SELECT admin_company_name,admin_mail_server,admin_mail_password, admin_sms_username, admin_sms_password, admin_sms_senderid, admin_sms_authkey,
	  admin_is_silver, admin_booking, admin_is_coin, admin_sendratexml, confirm_time, is_trade, confirmation_for,
	  confirmation_admin, margin_type, trade_enable, purchase_purity, gold_tol, silver_tol, gold_max_qty,
	  silver_max_qty, max_order, is_admin_mob1, admin_mob1, is_admin_mob2, admin_mob2, is_admin_mob3, admin_mob3,
	  is_admin_mob4, admin_mob4, is_admin_mob5,admin_mob5, opening_date,gold_open_qty,gold_open_rate, silver_open_qty,
	  silver_open_rate,display_margin FROM dt_generalsettings;");
		foreach ($resultset->result() as $row) {
			$records['admin_company_name'] 	= $row->admin_company_name;
			$records['admin_mail_server']   	= $row->admin_mail_server;
			$records['admin_mail_password']   = $row->admin_mail_password;
			$records['admin_sms_username']   	= $row->admin_sms_username;
			$records['admin_sms_password']   	= $row->admin_sms_password;
			$records['admin_sms_senderid']   	= $row->admin_sms_senderid;
			$records['admin_sms_authkey']   	= $row->admin_sms_authkey;
			$records['admin_is_silver']   	= $row->admin_is_silver;
			$records['admin_booking']   		= $row->admin_booking;
			$records['admin_is_coin']   		= $row->admin_is_coin;
			$records['admin_sendratexml']   	= $row->admin_sendratexml;
			$records['confirm_time']   		= $row->confirm_time;
			$records['is_trade']   			= $row->is_trade;
			$records['confirmation_for']   	= $row->confirmation_for;
			$records['confirmation_admin']   	= $row->confirmation_admin;
			$records['margin_type']   		= $row->margin_type;
			$records['trade_enable']   		= $row->trade_enable;
			$records['purchase_purity']   	= $row->purchase_purity;
			$records['gold_tol']   			= $row->gold_tol;
			$records['silver_tol']   			= $row->silver_tol;
			$records['gold_max_qty']   		= $row->gold_max_qty;
			$records['silver_max_qty']   		= $row->silver_max_qty;
			$records['max_order']   			= $row->max_order;
			$records['is_admin_mob1']   		= $row->is_admin_mob1;
			$records['admin_mob1']   			= $row->admin_mob1;
			$records['is_admin_mob2']   		= $row->is_admin_mob2;
			$records['admin_mob2']   			= $row->admin_mob2;
			$records['is_admin_mob3']   		= $row->is_admin_mob3;
			$records['admin_mob3']   			= $row->admin_mob3;
			$records['is_admin_mob4']   		= $row->is_admin_mob4;
			$records['admin_mob4']   			= $row->admin_mob4;
			$records['is_admin_mob5']   		= $row->is_admin_mob5;
			$records['admin_mob5']   			= $row->admin_mob5;
			$records['opening_date']   		= $row->opening_date;
			$records['gold_open_qty']   		= $row->gold_open_qty;
			$records['gold_open_rate']   		= $row->gold_open_rate;
			$records['silver_open_qty']   	= $row->silver_open_qty;
			$records['silver_open_rate']   	= $row->silver_open_rate;
			$records['display_margin']   		= $row->display_margin;
		}
		return $records;
	}
	function moneyFormatIndia($num)
	{
		$nums = explode(".", $num);
		if (count($nums) > 2) {
			return "0";
		} else {
			if (count($nums) == 1) {
				$nums[1] = "00";
			}
			$num = $nums[0];
			$explrestunits = "";
			if (strlen($num) > 3) {
				$lastthree = substr($num, strlen($num) - 3, strlen($num));
				$restunits = substr($num, 0, strlen($num) - 3);
				$restunits = (strlen($restunits) % 2 == 1) ? "0" . $restunits : $restunits;
				$expunit = str_split($restunits, 2);
				for ($i = 0; $i < sizeof($expunit); $i++) {
					if ($i == 0) {
						$explrestunits .= (int)$expunit[$i] . ",";
					} else {
						$explrestunits .= $expunit[$i] . ",";
					}
				}
				$thecash = $explrestunits . $lastthree;
			} else {
				$thecash = $num;
			}
			return $thecash . "." . $nums[1];
		}
	}
	function save_booknarration($type)
	{
		if ($type == 1)
			$update['book_narration'] 	= 	$_POST['book_narration'];
		else if ($type == 2)
			$update['charges_narration'] 	= 	$_POST['charges_narration'];
		
		// Get the booking number for logging
		$book_no = $_POST['book_no'];
		
		// Load the common helper for logging
		$this->load->helper('common');
		
		// Get the current record before updating for logging purposes
		$current_record = $this->db->get_where("dt_booking", array('book_no' => $book_no))->row_array();
		
		// Perform the update
		$status = $this->db->update("dt_booking", $update, array('book_no' => $book_no));
		if ($status && $this->db->affected_rows() > 0) {
			// Log successful update with both old and new values
			$old_data = array(
				'Book No' => $book_no,
				'Type' => $type,
				'Narration' => isset($current_record['book_narration']) ? $current_record['book_narration'] : (isset($current_record['charges_narration']) ? $current_record['charges_narration'] : '')
			);
			
			$new_data = array(
				'Book No' => $book_no,
				'Type' => $type,
				'Narration' => isset($update['book_narration']) ? $update['book_narration'] : (isset($update['charges_narration']) ? $update['charges_narration'] : '')
			);
			
			log_admin_edit(47, 'Customer Delivery', $old_data, $new_data, 'Book narration updated successfully for Book No: ' . $book_no);
			return true;
		} else {
			// Log failed update
			$old_data = array(
				'Book No' => $book_no,
				'Type' => $type,
				'Narration' => isset($current_record['book_narration']) ? $current_record['book_narration'] : (isset($current_record['charges_narration']) ? $current_record['charges_narration'] : '')
			);
			
			$new_data = array(
				'Book No' => $book_no,
				'Type' => $type,
				'Narration' => isset($update['book_narration']) ? $update['book_narration'] : (isset($update['charges_narration']) ? $update['charges_narration'] : '')
			);
			
			log_admin_edit(47, 'Customer Delivery', $old_data, $new_data, 'Failed to update book narration for Book No: ' . $book_no);
			return false;
		}
	}
	function save_manualhedge($type)
	{
		$status = $this->db->insert("dt_mt5_hedgedata", array('cusbookid' => $_POST['cusbookid'], 'dealid' => $_POST['dealid'], 'orderid' => $_POST['orderid'], 'volume' => $_POST['volume'] / 100, 'price' => $_POST['price']));
		//echo $this->db->last_query($status);exit;
		if ($status) {
			$this->db->where('book_no',  $_POST['cusbookid']);
			if ($this->db->update("dt_booking", array('book_hedgemanual' => '1'))) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
	function get_mt5hedge($from_date = "", $to_date = "")
	{
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));

		$str_query = "SELECT hedgid, dealid, orderid, (volume*100) AS volume, price, bid, ask, comment, request_id, symbol, cusbookid, DATE_FORMAT(bookedon, '%d-%m-%Y %h:%i:%s %p') AS bookedon, bookedby, orderfor, mt5_disable, ifnull(TRIM(book_qty*1000)+0,'-') as book_qty, book_rate, cus_name 
		FROM dt_mt5_hedgedata 
		LEFT JOIN dt_booking ON cusbookid = book_no 
		LEFT JOIN dt_customer ON cus_id = book_cusid
		WHERE mt5_disable = 0 AND DATE(bookedon) BETWEEN '" . $from_date . "' AND '" . $to_date . "' ORDER BY hedgid DESC";

		$query = $this->db->query($str_query);
		return $query;
	}
	function delete_mt5hedge($id)
	{
		$this->db->query("update dt_mt5_hedgedata set mt5_disable=1 where hedgid = ?", array($id));
	}
	function unfix_booking_report()
	{
		// $from_date = date('Y-m-d', strtotime($from_date));
		// $to_date = date('Y-m-d', strtotime($to_date));

		$str_query = "SELECT
		c.customer_id,c.pure_weight,
		c.customer_name,IFNULL(c.avg_rate,0) as avg_rate,
		c.total_amount_unfix,ifnull(b.weight,0) as weight,
		IFNULL(b.total_amount_booking,0) AS total_amount_booking ,
		(c.total_amount_unfix + b.total_amount_booking) AS total_amount_paid,
		IFNULL(c.pure_weight - b.weight,0) AS weight_differ,
		IFNULL(c.total_amount_unfix - b.total_amount_booking,0) AS difference
	FROM (
		SELECT
			c.party_name AS customer_id,
			dtc.cus_name AS customer_name,
			SUM(c.amount) AS total_amount_unfix,
			SUM(c.pure_weight) as pure_weight,
			dtc.avg_rate as avg_rate
		FROM
			dt_unfix c
		LEFT JOIN
			dt_customer dtc ON dtc.cus_id = c.party_name
		WHERE unfix_close = 0
		GROUP BY
			c.party_name, dtc.cus_name
	) c
	LEFT JOIN (
		SELECT
			b.book_cusid AS customer_id,
			SUM(round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2)) AS total_amount_booking,
			SUM(book_qty *1000) AS weight
			

		FROM
			dt_booking b  where book_status=1 and b.unfix = 1 and book_unfixclose = 0
		GROUP BY
			b.book_cusid
	) b
	ON
		c.customer_id = b.customer_id  ";
		$query = $this->db->query($str_query);
		// print_r($this->db->last_query()); exit;
		return $query;
	}
	function updatefix_unfix($book_no, $sts)
	{


		$status = array(
			'unfix' => $sts,
		);
		$this->db->where('book_no',  $book_no);
		if ($this->db->update("dt_booking", $status)) {
			$sts = array("status" => true, "statuscode" => $sts);
		}

		return $sts;
	}
	function get_transactiondate_coverup()
	{
		$resultset = $this->db->query("SELECT DATE_FORMAT(DATE_SUB(curdate(), INTERVAL 10 DAY),'%d-%m-%Y') 
										as from_date, DATE_FORMAT(curdate(), '%d-%m-%Y') as to_date FROM dt_rpanel_settings");
		return $resultset;
	}
	public function converup_record()
	{
		$return_data["status"] = false;
		$resultset1 = $this->db->query("select * from dt_coverupmcx where cov_date = ? AND cov_comtype = ?", array(date("Y-m-d", strtotime($this->input->post('cov_date', true))), $this->input->post('cov_comtype', true)));

		if ($resultset1->num_rows() > 0) {
			if ($_POST['cov_comtype'] != 1) {
				if ($_POST['cov_mcxbuyqty'] > 0) {
					$insert_data['cov_mcxbuyqty'] 	= $_POST['cov_mcxbuyqty'] / 1000;
				}
				if ($_POST['cov_mcxsellqty'] > 0) {
					$insert_data['cov_mcxsellqty'] 	= $_POST['cov_mcxsellqty'] / 1000;
				}
			} else {
				if ($_POST['cov_mcxbuyqty'] > 0) {
					$insert_data['cov_mcxbuyqty'] 	= $_POST['cov_mcxbuyqty'] / 1000;
				}
				if ($_POST['cov_mcxsellqty'] > 0) {
					$insert_data['cov_mcxsellqty'] 	= $_POST['cov_mcxsellqty'] / 1000;
				}
			}
			$return_data["status"] 	= true;
			$insertStatus = $this->db->update("dt_coverupmcx", $insert_data, array('cov_date' => date("Y-m-d", strtotime($_POST['cov_date'])), 'cov_comtype' => $_POST['cov_comtype']));
		} else {
			$insert_data['cov_date'] 		= date("Y-m-d", strtotime($_POST['cov_date']));
			if ($_POST['cov_comtype'] != 1) {
				$insert_data['cov_mcxbuyqty'] 	= $_POST['cov_mcxbuyqty'] / 1000;
				$insert_data['cov_mcxsellqty'] 	= $_POST['cov_mcxsellqty'] / 1000;
			} else {
				$insert_data['cov_mcxbuyqty'] 	= $_POST['cov_mcxbuyqty'];
				$insert_data['cov_mcxsellqty'] 	= $_POST['cov_mcxsellqty'];
			}
			$insert_data['cov_comtype'] 	= $_POST['cov_comtype'];
			$return_data["status"] 	= true;
			$insertStatus = $this->db->insert("dt_coverupmcx", $insert_data);
			// echo $this->db->last_query($insertStatus); // DEBUG REMOVED
			// exit; // DEBUG REMOVED
		}
		//echo $this->db->last_query($insertStatus);exit;
		if ($insertStatus == 1) {
			$return_data["message"]		= "F & O Record updated.";
		} else {
			$return_data["message"]		= "Error occured in booking. Please try again later.";
		}
		return $return_data;
	}
	function get_coverup_record($branch_id, $com_type, $from_date = "", $to_date = "")
	{
		$branch_id = $branch_id == '-1' ? '' : ('book_branch = ' . $branch_id . ' AND');
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));

		if ($from_date > $to_date) {
			$from_date = $to_date;
		}

		$str_query = "SELECT 
			IFNULL((sum(if(book_ishedge = 0, if(book_type = 1, (book_qty),0), 0)) - 
			sum(if(book_ishedge = 0, if(book_type = 0, (book_qty),0), 0)))*1000,0) as phy_closing,
			IFNULL((sum(if(book_ishedge = 1, if(book_type = 0, (book_qty),0), 0)) - 
			sum(if(book_ishedge = 1, if(book_type = 1, (book_qty),0), 0)))*1000,0) as mcx_closing
			FROM dt_booking
			LEFT JOIN dt_com_master ON book_comid = com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN dt_comp_branch ON branch_code = book_branch
			WHERE " . $branch_id . " if(rcom_comtype = 1, 1, 0) = " . $com_type . " AND book_rate>0
			AND book_status = 1 AND IFNULL(is_unfix,0) != 1 AND DATE(book_datetime) < '" . $from_date . "'";
		$result['closing'] = $this->db->query($str_query)->result_array();

		$str_querymcx = "SELECT 
			IFNULL((sum(cov_mcxbuyqty) - sum(cov_mcxsellqty))*1000,0) as mcx_closing
			FROM dt_coverupmcx
			WHERE " . $branch_id . "cov_comtype = " . $com_type . " AND DATE(cov_date) < '" . $from_date . "'";
		$result['closingmcx'] = $this->db->query($str_querymcx)->result_array();

		$str_query_detail = "SELECT date(book_datetime) as bookedon, date_format(book_datetime,'%d-%m-%Y') as book_datetime,
			sum(if(book_ishedge = 0, if(book_type = 0, (book_qty),0), 0))*1000 as phy_goldsell,
			sum(if(book_ishedge = 1, if(book_type = 1, (book_qty),0), 0))*1000 as mcx_goldsell,
			sum(if(book_ishedge = 0, if(book_type = 1, (book_qty),0), 0))*1000 as phy_goldbuy,
			sum(if(book_ishedge = 1, if(book_type = 0, (book_qty),0), 0))*1000 as mcx_goldbuy,
			sum(if(book_type = 0, round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2), 0)) as sell_old, 
			sum(if(book_type = 0, if(invoice_totalamt > 0, round(((((invoice_totalamt-invoice_tcsamt)/((grl.cgst+grl.sgst+100)/100))/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2), round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2)) , 0)) as sell, 
			sum(if(book_type = 1, round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2), 0)) as buy
			FROM dt_booking
			LEFT JOIN dt_com_master ON book_comid = com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN dt_comp_branch ON branch_code = book_branch
			LEFT JOIN dt_customer_deliveryinvoice ON invoice_bookno = book_no
			INNER JOIN dt_generalsettings AS grl 
			WHERE " . $branch_id . " if(rcom_comtype = 1, 1, 0) = " . $com_type . " AND book_rate>0 AND 
			book_status = 1 AND IFNULL(is_unfix,0) != 1 AND DATE(book_datetime) BETWEEN '" . $from_date . "' AND '" . $to_date . "' 
			GROUP BY date(book_datetime)";

		$str_query_mcx = "SELECT DATE(cov_date) as coveredon, date_format(cov_date,'%d-%m-%Y') as cov_date, 
			if(cov_comtype= 0, (cov_mcxbuyqty*1000), cov_mcxbuyqty*1000) as cov_mcxbuyqty,
			if(cov_comtype= 0, (cov_mcxsellqty*1000), cov_mcxsellqty*1000) as cov_mcxsellqty
			FROM dt_coverupmcx
			WHERE cov_comtype = " . $com_type . " AND 
			DATE(cov_date) BETWEEN '" . $from_date . "' AND '" . $to_date . "'";

		$query = $this->db->query($str_query_detail);
		$query_mcx = $this->db->query($str_query_mcx);
		$array1 = (array)$query_mcx->result();

		$final_date = new DateTime($to_date);
		$final_date->modify('+1 day');

		$period = new DatePeriod(
			new DateTime($from_date),
			new DateInterval('P1D'),
			new DateTime($final_date->format('Y-m-d'))
		);

		$response_data = array();
		$i = 0;
		foreach ($period as $key => $value) {
			$phy_opening 	= 0;
			$phyclosing 	= 0;
			$phy_goldsell 	= 0;
			$phy_goldbuy 	= 0;
			$mcx_opening	= 0;
			$mcx_closing	= 0;
			$mcx_goldsell	= 0;
			$mcx_goldbuy	= 0;
			$phy_exists 	= false;
			$mcx_exists 	= false;

			foreach ($query->result() as $phykey => $phyrow) {
				if ($phyrow->bookedon == $value->format('Y-m-d')) {
					$phy_exists = true;
					if ($i == 0) {
						$phy_opening 	= $result['closing'][0]['phy_closing'];
						$phyclosing 	= $phy_opening + ($phyrow->phy_goldbuy - $phyrow->phy_goldsell);
					} else {
						$phy_opening 	= $response_data[$i - 1]['phyclosing'];
						$phyclosing 	= $phy_opening + $phyrow->phy_goldbuy - $phyrow->phy_goldsell;
					}
					$phy_goldsell		= $phyrow->phy_goldsell;
					$phy_goldbuy		= $phyrow->phy_goldbuy;
					$sell               =  $phyrow->sell;
					$buy               =   $phyrow->buy;
				}
			}
			if (!$phy_exists) {
				if ($i == 0) {
					$phy_opening 	= $result['closing'][0]['phy_closing'];
					$phyclosing 	= $phy_opening;
				} else {
					$phy_opening 	= $response_data[$i - 1]['phyclosing'];
					$phyclosing 	= $phy_opening;
				}
			}
			foreach ($query_mcx->result() as $mcxkey => $mcxrow) {
				if ($mcxrow->coveredon == $value->format('Y-m-d')) {
					$mcx_exists = true;
					if ($i == 0) {
						$mcx_opening 	= $result['closingmcx'][0]['mcx_closing'];
						$mcx_closing 	= $mcx_opening + ($mcxrow->cov_mcxbuyqty - $mcxrow->cov_mcxsellqty);
					} else {
						$mcx_opening 	= $response_data[$i - 1]['mcx_closing'];
						$mcx_closing 	= $mcx_opening + $mcxrow->cov_mcxbuyqty - $mcxrow->cov_mcxsellqty;
					}
					$mcx_goldsell 		= $mcxrow->cov_mcxsellqty;
					$mcx_goldbuy 		= $mcxrow->cov_mcxbuyqty;
				}
			}
			if (!$mcx_exists) {
				if ($i == 0) {
					$mcx_opening 	= $result['closingmcx'][0]['mcx_closing'];
					$mcx_closing 	= $mcx_opening;
				} else {
					$mcx_opening 	= $response_data[$i - 1]['mcx_closing'];
					$mcx_closing 	= $mcx_opening;
				}
			}
			if ($phy_goldsell != 0 || $phy_goldbuy != 0 || $mcx_goldsell != 0 || $mcx_goldbuy != 0) {
				$response_data[$i] = array('book_datetime' => $value->format('d-m-Y'), 'phy_opening' => round($phy_opening, 3), 'phyclosing' => round($phyclosing, 3), 'phy_goldsell' => round($phy_goldsell, 3), 'phy_goldbuy' => round($phy_goldbuy, 3), 'mcx_opening' => round($mcx_opening, 3), 'mcx_closing' => round($mcx_closing, 3), 'mcx_goldsell' => round($mcx_goldsell, 3), 'mcx_goldbuy' => round($mcx_goldbuy, 3), 'sell' => $sell, 'buy' => $buy);
				++$i;
			}
			//echo $value->format('Y-m-d')."<br />";       
		}
		/* if($from_date == $to_date){
			$phy_opening 	= 0;
			$phyclosing 	= 0;
			$phy_goldsell 	= 0;
			$phy_goldbuy 	= 0;
			$mcx_opening	= 0;
			$mcx_closing	= 0;
			$mcx_goldsell	= 0;
			$mcx_goldbuy	= 0;
		
			if($query->num_rows() > 0){
				$phy_opening 	= $result['closing'][0]['phy_closing']; 
				$phyclosing 	= $phy_opening + ($query->row()->phy_goldbuy - $query->row()->phy_goldsell);
				$phy_goldsell	= $query->row()->phy_goldsell;
				$phy_goldbuy	= $query->row()->phy_goldbuy;
			}else{
				$phy_opening 	= $result['closing'][0]['phy_closing']; 
				$phyclosing 	= $phy_opening;
			}
			if($query_mcx->num_rows() > 0){
				$mcx_opening 	= $result['closingmcx'][0]['mcx_closing'];
				$mcx_closing 	= $mcx_opening + ($query_mcx->row()->cov_mcxbuyqty - $query_mcx->row()->cov_mcxsellqty);
				$mcx_goldsell 		= $query_mcx->row()->cov_mcxsellqty;
				$mcx_goldbuy 		= $query_mcx->row()->cov_mcxbuyqty;
			}else{
				$mcx_opening 	= $result['closingmcx'][0]['mcx_closing'];
				$mcx_closing 	= $mcx_opening;
			}
			if($phy_goldsell != 0 || $phy_goldbuy != 0 || $mcx_goldsell != 0 || $mcx_goldbuy != 0){
				$response_data[$i] = array('book_datetime' => date('d-m-Y', strtotime($from_date)), 'phy_opening' => $phy_opening, 'phyclosing' => $phyclosing, 'phy_goldsell' => $phy_goldsell, 'phy_goldbuy' => $phy_goldbuy, 'mcx_opening' => $mcx_opening, 'mcx_closing' => $mcx_closing, 'mcx_goldsell' => $mcx_goldsell, 'mcx_goldbuy' => $mcx_goldbuy);
				++$i;
			}
		} */
		return $response_data;
	}
	/*Babu*/
	function get_printcoverup_record($branch_id, $com_type, $from_date = "", $to_date = "")
	{
		$branch_id = $branch_id == '-1' ? '' : ('book_branch = ' . $branch_id . ' AND');
		$from_date = date('Y-m-d', strtotime($from_date));
		$to_date = date('Y-m-d', strtotime($to_date));

		if ($from_date > $to_date) {
			$from_date = $to_date;
		}

		$str_query = "SELECT 
			IFNULL((sum(if(book_ishedge = 0, if(book_type = 1, (book_qty),0), 0)) - 
			sum(if(book_ishedge = 0, if(book_type = 0, (book_qty),0), 0)))*1000,0) as phy_closing,
			IFNULL((sum(if(book_ishedge = 1, if(book_type = 0, (book_qty),0), 0)) - 
			sum(if(book_ishedge = 1, if(book_type = 1, (book_qty),0), 0)))*1000,0) as mcx_closing
			FROM dt_booking
			LEFT JOIN dt_com_master ON book_comid = com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN dt_comp_branch ON branch_code = book_branch
			WHERE " . $branch_id . " if(rcom_comtype = 1, 1, 0) = " . $com_type . " AND book_rate>0
			AND book_status = 1 AND IFNULL(is_unfix,0) != 1 AND DATE(book_datetime) < '" . $from_date . "'";
		$result['closing'] = $this->db->query($str_query)->result_array();

		$str_querymcx = "SELECT 
			IFNULL((sum(cov_mcxbuyqty) - sum(cov_mcxsellqty))*1000,0) as mcx_closing
			FROM dt_coverupmcx
			WHERE " . $branch_id . "cov_comtype = " . $com_type . " AND DATE(cov_date) < '" . $from_date . "'";
		$result['closingmcx'] = $this->db->query($str_querymcx)->result_array();

		$str_query_detail = "SELECT date(book_datetime) as bookedon, date_format(book_datetime,'%d-%m-%Y') as book_datetime,
			sum(if(book_ishedge = 0, if(book_type = 0, (book_qty),0), 0))*1000 as phy_goldsell,
			sum(if(book_ishedge = 1, if(book_type = 1, (book_qty),0), 0))*1000 as mcx_goldsell,
			sum(if(book_ishedge = 0, if(book_type = 1, (book_qty),0), 0))*1000 as phy_goldbuy,
			sum(if(book_ishedge = 1, if(book_type = 0, (book_qty),0), 0))*1000 as mcx_goldbuy,
			sum(if(book_type = 0, round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2), 0)) as sell, 
			sum(if(book_type = 1, round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2), 0)) as buy
			FROM dt_booking
			LEFT JOIN dt_com_master ON book_comid = com_id
			LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
			LEFT JOIN dt_comp_branch ON branch_code = book_branch
			WHERE " . $branch_id . " if(rcom_comtype = 1, 1, 0) = " . $com_type . " AND book_rate>0 AND 
			book_status = 1 AND IFNULL(is_unfix,0) != 1 AND DATE(book_datetime) BETWEEN '" . $from_date . "' AND '" . $to_date . "' 
			GROUP BY date(book_datetime)";

		$str_query_mcx = "SELECT DATE(cov_date) as coveredon, date_format(cov_date,'%d-%m-%Y') as cov_date, 
			if(cov_comtype= 0, (cov_mcxbuyqty*1000), cov_mcxbuyqty*1000) as cov_mcxbuyqty,
			if(cov_comtype= 0, (cov_mcxsellqty*1000), cov_mcxsellqty*1000) as cov_mcxsellqty
			FROM dt_coverupmcx
			WHERE cov_comtype = " . $com_type . " AND 
			DATE(cov_date) BETWEEN '" . $from_date . "' AND '" . $to_date . "'";

		$query = $this->db->query($str_query_detail);
		$query_mcx = $this->db->query($str_query_mcx);
		$array1 = (array)$query_mcx->result();

		$final_date = new DateTime($to_date);
		$final_date->modify('+1 day');

		$period = new DatePeriod(
			new DateTime($from_date),
			new DateInterval('P1D'),
			new DateTime($final_date->format('Y-m-d'))
		);

		$response_data = array();
		$i = 0;
		foreach ($period as $key => $value) {
			$phy_opening 	= 0;
			$phyclosing 	= 0;
			$phy_goldsell 	= 0;
			$phy_goldbuy 	= 0;
			$mcx_opening	= 0;
			$mcx_closing	= 0;
			$mcx_goldsell	= 0;
			$mcx_goldbuy	= 0;
			$phy_exists 	= false;
			$mcx_exists 	= false;

			foreach ($query->result() as $phykey => $phyrow) {
				if ($phyrow->bookedon == $value->format('Y-m-d')) {
					$phy_exists = true;
					if ($i == 0) {
						$phy_opening 	= $result['closing'][0]['phy_closing'];
						$phyclosing 	= $phy_opening + ($phyrow->phy_goldbuy - $phyrow->phy_goldsell);
					} else {
						$phy_opening 	= $response_data[$i - 1]['phyclosing'];
						$phyclosing 	= $phy_opening + $phyrow->phy_goldbuy - $phyrow->phy_goldsell;
					}
					$phy_goldsell		= $phyrow->phy_goldsell;
					$phy_goldbuy		= $phyrow->phy_goldbuy;
					$sell               =  $phyrow->sell;
					$buy               =   $phyrow->buy;
				}
			}
			if (!$phy_exists) {
				if ($i == 0) {
					$phy_opening 	= $result['closing'][0]['phy_closing'];
					$phyclosing 	= $phy_opening;
				} else {
					$phy_opening 	= $response_data[$i - 1]['phyclosing'];
					$phyclosing 	= $phy_opening;
				}
			}
			foreach ($query_mcx->result() as $mcxkey => $mcxrow) {
				if ($mcxrow->coveredon == $value->format('Y-m-d')) {
					$mcx_exists = true;
					if ($i == 0) {
						$mcx_opening 	= $result['closingmcx'][0]['mcx_closing'];
						$mcx_closing 	= $mcx_opening + ($mcxrow->cov_mcxbuyqty - $mcxrow->cov_mcxsellqty);
					} else {
						$mcx_opening 	= $response_data[$i - 1]['mcx_closing'];
						$mcx_closing 	= $mcx_opening + $mcxrow->cov_mcxbuyqty - $mcxrow->cov_mcxsellqty;
					}
					$mcx_goldsell 		= $mcxrow->cov_mcxsellqty;
					$mcx_goldbuy 		= $mcxrow->cov_mcxbuyqty;
				}
			}
			if (!$mcx_exists) {
				if ($i == 0) {
					$mcx_opening 	= $result['closingmcx'][0]['mcx_closing'];
					$mcx_closing 	= $mcx_opening;
				} else {
					$mcx_opening 	= $response_data[$i - 1]['mcx_closing'];
					$mcx_closing 	= $mcx_opening;
				}
			}
			if ($phy_goldsell != 0 || $phy_goldbuy != 0 || $mcx_goldsell != 0 || $mcx_goldbuy != 0) {
				$response_data[$i] = array('book_datetime' => $value->format('d-m-Y'), 'phy_opening' => round($phy_opening, 3), 'phyclosing' => round($phyclosing, 3), 'phy_goldsell' => round($phy_goldsell, 3), 'phy_goldbuy' => round($phy_goldbuy, 3), 'mcx_opening' => round($mcx_opening, 3), 'mcx_closing' => round($mcx_closing, 3), 'mcx_goldsell' => round($mcx_goldsell, 3), 'mcx_goldbuy' => round($mcx_goldbuy, 3), 'sell' => $sell, 'buy' => $buy, 'fromdate' => $from_date, 'todate' => $to_date);
				++$i;
			}
		}
		return $response_data;
	}
	function get_WhatsappURL($service_id, $id, $cus_id = null)
	{
		//Declaration of variables
		$whatsapp_url = "";
		$whatsapp_status = 0;
		$whatsapp_cus_status = 0;
		$whatsapp_id = 2; //Send Whatsapp
		$whatsapp_content = "";
		$whatsapp_footer = "";
		$customer_data = array();
		$invoiebefore = $this->config->item('invoicebeforetest');
		//Retriving Whatsapp service for registration confirmation
		$resultset = $this->db->query("SELECT serv_whatsapp FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
		foreach ($resultset->result() as $row) {
			$whatsapp_status = $row->serv_whatsapp;
		}
		$resultset->free_result();
		//Checking Whatsapp service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
		if ($whatsapp_status == 1) {
			// If cus_id is not provided, get it from delivery data
			if ($cus_id === null) {
				$cus_resultset = $this->db->query("SELECT delivered_person FROM dt_customerdelivery WHERE cusdel_code = '" . $id . "'");
				if ($cus_resultset->num_rows() > 0) {
					$cus_id = $cus_resultset->row()->delivered_person;
				}
				$cus_resultset->free_result();
			}
			
			//Retriving Whatsapp Customer for registration confirmation
			$resultset = $this->db->query("SELECT cus_whatsapp_status FROM dt_customer WHERE cus_id = '" . $cus_id . "'");
			foreach ($resultset->result() as $row) {
				$whatsapp_cus_status = $row->cus_whatsapp_status;
			}

			$resultset->free_result();
			if ($whatsapp_cus_status == 1) {
				$resultset = $this->db->query("select invoice_delcode,invoice_bookno,CONCAT('" . $invoiebefore . "', invoice_no) AS invoice_no,cus_name,if(rcom_comtype = 1 , CONCAT(TRIM(SUM(invoice_deliveryqty))+0, ' Kg'), CONCAT(TRIM(SUM(invoice_deliveryqty) * 1000)+0, ' Gm')) as invoice_deliveryqty,
												SUM(invoice_amount) AS invoice_amount,invoice_penality,SUM(invoice_totalamt) AS invoice_totalamt, date_format(cusdel_date,'%d-%m-%Y') AS cusdel_date, cus_mobile, if(book_type=0,'Sell','Buy') as book_type,'" . $this->session->userdata('company_name') . "' as admin_company_name, cus_email, GROUP_CONCAT(invoice_bookno) AS invoice_bookno, GROUP_CONCAT(book_datetime) AS book_datetime, if(rcom_comtype = 1 , CONCAT(TRIM(SUM(book_qty))+0, ' Kg'), CONCAT(TRIM(SUM(book_qty) * 1000)+0, ' Gm')) as book_qty, GROUP_CONCAT(book_rate) AS book_rate, SUM(book_totalcost) AS book_totalcost, IF(IFNULL(cusdel.purity,-1) = -1, GROUP_CONCAT(DISTINCT com_name), cusdel.invoice_disp_name) AS com_name
												from dt_customerdelivery AS cusdel
												left join dt_customer_deliveryinvoice on cusdel_code = delivery_code
												left join dt_customer on delivered_person = cus_id
												left join dt_com_master on com_id = invoice_comid
												LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
												left join dt_booking on invoice_bookno = book_no
												where cusdel_code = '" . $id . "'");
				foreach ($resultset->result() as $row) {
					$customer_data = $row;
				}
				$whatsapp_url = $this->general_model->get_WhatsAppSettings($whatsapp_id, $customer_data->cus_mobile);
				//Retriving message content
				$resultset = $this->db->query("SELECT whatsapp_content, whatsapp_footer from dt_whatsapp_settings where service_id = '" . $service_id . "'");
				foreach ($resultset->result() as $row) {
					$whatsapp_content = $row->whatsapp_content;
					$whatsapp_footer = $row->whatsapp_footer;
				}
				$resultset->free_result();

				// Meta WhatsApp Settings
				$meta_template_id = "";
				$meta_params = array();
				$resultset_meta = $this->db->query("SELECT template_id from dt_whatsappmeta_settings where service_id = '" . $service_id . "'");
				if ($resultset_meta->num_rows() > 0) {
					$meta_template_id = $resultset_meta->row()->template_id;
					$meta_params = array(
						$customer_data->cus_name,
						$customer_data->invoice_no,
						$customer_data->com_name,
						$customer_data->invoice_deliveryqty,
						$customer_data->invoice_totalamt
					);
				}

				//Generating Message content
				$field_name = explode('@@', $whatsapp_content);
				//echo count($field_name);		
				for ($i = 1; $i < count($field_name); $i += 2) {
					if (isset($customer_data->{$field_name[$i]})) {
						$whatsapp_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $whatsapp_content);
					}
				}
				$whatsapp_content .= " " . $whatsapp_footer;
				
				$mobil_no = $customer_data->cus_mobile;
			}
		}
		//Returning generated Whatsapp Data
		return array(
			'message' => $whatsapp_content, 
			'mobile' => isset($mobil_no) ? $mobil_no : "",
			'template_id' => isset($meta_template_id) ? $meta_template_id : "",
			'params' => isset($meta_params) ? $meta_params : array()
		);
	}
	function get_WhatsAppSettings($whatsapp_id, $mobile_no)
	{
		//Declaring variables
		$whatsapp_returnurl = "";
		$whatsapp_username = "";
		$whatsapp_password = "";
		$whatsapp_senderid = "";

		//Fetching Whatsapp App URL
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id='" . $whatsapp_id . "'");
		foreach ($result_set->result() as $row) {
			$whatsapp_returnurl = $row->sas_url;
		}
		$result_set->free_result();

		//Fetching Whatsapp App user name, password and sender id
		$result_set = $this->db->query("select admin_whatsapp_username, admin_whatsapp_password, admin_whatsapp_senderid,admin_whatsapp_authkey from dt_generalsettings");
		if ($result_set->num_rows() > 0) {
			$whatsapp_username	= $result_set->row()->admin_whatsapp_username;
			$whatsapp_password	= $result_set->row()->admin_whatsapp_password;
			$whatsapp_senderid	= $result_set->row()->admin_whatsapp_senderid;
			$whatsapp_authkey	= $result_set->row()->admin_whatsapp_authkey;
		}
		$result_set->free_result();

		//Generating Whatsapp Url with User Name, Password and Sender ID
		$whatsapp_returnurl = str_replace("@@user_name@@", $whatsapp_username, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@password@@", $whatsapp_password, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@mobileno@@", $mobile_no, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@sender_id@@", $whatsapp_senderid, $whatsapp_returnurl);
		$whatsapp_returnurl = str_replace("@@auth_key@@", $whatsapp_authkey, $whatsapp_returnurl);
		//returning gererated URL

		return 	$whatsapp_returnurl;
	}
	// function get_whatsappURL($service_id, $id)
	// {
	// 	//Declaration of variables
	// 	$sms_url = "";
	// 	$sms_status = 0;
	// 	$sms_id = 1; //Send SMS
	// 	$sms_content = "";
	// 	$sms_footer = "";
	// 	$mobil_no = "";
	// 	$customer_data = array();
	// 	//Retriving SMS service for registration confirmation
	// 	$resultset = $this->db->query("SELECT serv_sms FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
	// 	foreach ($resultset->result() as $row) {
	// 		$sms_status = $row->serv_sms;
	// 	}
	// 	$resultset->free_result();
	// 	//Checking SMS service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
	// 	if ($sms_status == 1) {
	// 		$resultset = $this->db->query("select invoice_delcode,invoice_bookno,cus_name,if(book_bar_type = 1, CONCAT(TRIM(invoice_deliveryqty)+0,' Kg'), CONCAT(TRIM(invoice_deliveryqty*1000)+0,' gms')) as invoice_deliveryqty,
	// 											invoice_amount,invoice_penality,invoice_totalamt,REPLACE(com_name,'`','') as com_name,cusdel_date,cus_mobile,if(book_bar_type = 1, CONCAT(TRIM(book_qty)+0,' Kg'), CONCAT(TRIM(book_qty*1000)+0,' gms')) AS book_qty, book_rate, if(book_type=0,'Buy',if(book_type=1,'Sell','')) as book_type, book_datetime,book_totalcost 
	// 											from dt_customer_deliveryinvoice
	// 											left join dt_customerdelivery on invoice_delcode = cusdel_code
	// 											LEFT JOIN dt_customer on invoice_cuscode = cus_id
	// 											LEFT JOIN dt_com_master on com_id = invoice_comid
	// 											LEFT JOIN dt_rpanelcommodities ON rcom_id = com_type
	// 											LEFT JOIN dt_booking on invoice_bookno = book_no
	// 											where invoice_delcode='" . $id . "'");
	// 		foreach ($resultset->result() as $row) {
	// 			$customer_data = $row;

	// 			if (isset($customer_data->book_rate) && $customer_data->book_rate > 0) {
	// 				$customer_data->book_rate = $this->moneyFormatIndia($customer_data->book_rate);
	// 			}
	// 			if (isset($customer_data->book_totalcost) && $customer_data->book_totalcost > 0) {
	// 				$customer_data->book_totalcost = $this->moneyFormatIndia($customer_data->book_totalcost);
	// 			}
	// 			if (isset($customer_data->invoice_amount) && $customer_data->invoice_amount > 0) {
	// 				$customer_data->invoice_amount = $this->moneyFormatIndia($customer_data->invoice_amount);
	// 			}
	// 			if (isset($customer_data->invoice_totalamt) && $customer_data->invoice_totalamt > 0) {
	// 				$customer_data->invoice_totalamt = $this->moneyFormatIndia($customer_data->invoice_totalamt);
	// 			}

	// 			$sms_url = $this->general_model->get_SMSAppSettings($sms_id, $customer_data->cus_mobile);
	// 			$mobil_no = $customer_data->cus_mobile;
	// 			//Retriving message content
	// 			$resultset = $this->db->query("SELECT sms_content, sms_footer from dt_sms_settings where service_id = '" . $service_id . "'");
	// 			foreach ($resultset->result() as $row) {
	// 				$sms_content = $row->sms_content;
	// 				$sms_footer = $row->sms_footer;
	// 			}
	// 			$resultset->free_result();
	// 			//Generating Message content
	// 			$field_name = explode('@@', $sms_content);
	// 			//echo count($field_name);		
	// 			for ($i = 1; $i < count($field_name); $i += 2) {
	// 				if (isset($customer_data->{$field_name[$i]})) {
	// 					$sms_content = str_replace("@@" . $field_name[$i] . "@@", $customer_data->{$field_name[$i]}, $sms_content);
	// 				}
	// 			}
	// 			$field_name_footer = explode('@@', $sms_footer);
	// 			for ($i = 1; $i < count($field_name_footer); $i += 2) {
	// 				if (isset($customer_data->{$field_name_footer[$i]})) {
	// 					$sms_footer = str_replace("@@" . $field_name_footer[$i] . "@@", $customer_data->{$field_name_footer[$i]}, $sms_footer);
	// 				}
	// 			}
	// 			$sms_content .= " " . $sms_footer;
	// 		}
	// 	}
	// 	return array('message' => $sms_content, 'mobile' => $mobil_no);
	// }
}
