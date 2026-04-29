<?php
class Userregistration_model extends CI_Model
{
    var $table_name = 'dt_customer';
    public function __construct()
    {
        parent::__construct();
        $this->load->helper('common');
    }
    function index() {}

    public function get_data($cus_type, $params = "", $page = "all")
    {
        if ($cus_type == 1 || $cus_type == '') {
            $where1 = "";
        } else if ($cus_type == 2) {
            $where1 = "WHERE cus_active = 1";
        } else if ($cus_type == 3) {
            $where1 = "WHERE cus_active = 0";
        } else if ($cus_type == 4) {
            $where1 = "";
            $sql = $this->db->query("SELECT user_data FROM dt_usersessions where user_data != 'NULL'");
            $i = 0;
            if ($sql->num_rows() > 0) {
                $where1 = " WHERE ";
                $flag = true;
                foreach ($sql->result() as $row) {
                    $userdata[$i] = @unserialize(@stripslashes($row->user_data));
                    if (isset($userdata[$i]['is_logged_in']) && $userdata[$i]['is_logged_in'] == 1) {
                        if ($flag) {
                            $where1 = $where1 . " (cus_login_name = '" . $userdata[$i]['username'] . "') ";
                            $flag = false;
                        } else {
                            $where1 = $where1 . " OR (cus_login_name = '" . $userdata[$i]['username'] . "') ";
                        }
                    }
                    $i++;
                }
            } else {
                $where1 = " WHERE true = false ";
            }
        } else {
            $where1 = "";
        }

        $query = $this->db->query("SELECT cus_id,cus_name,cus_company_name,
			cus_alise_name,
			cus_login_name,
			cus_login_password,
			cus_mobile,
			IF(IFNULL(cus_regtype,0)=0,'-','KYC') AS cus_type,
			DATE_FORMAT(cus_register_on, '%d-%m-%Y %H:%i:%s') AS cus_register_on,
			cus_active
			FROM dt_customer " . $where1 . "  ORDER BY cus_id DESC");
        return $query;
    }
    public function set_data()
    {
        $data['url']                =    $this->config->item('base_url') . "index.php/C_main/grid_dataload/Bank_model";
        $data['model_name']            =    "Bank_model";
        $data['sortname']            =    "bnk_code";
        $data['sortorder']            =    "desc";
        $data['id']                    =    "bnk_code";
        $data['manipulate_once']    =    "No";
        $data['colNames']            =    "'Code','Bank Name','Branch','Acc No','Active','Actions'";
        $data['colModel'] = array(
            "{name:'bnk_code', index:'bnk_code', width:120, align:'center'},",
            "{name:'bnk_name', index:'bnk_name', width:200},",
            "{name:'bnk_branch', index:'bnk_branch', width:350},",
            "{name:'bnk_accno', index:'bnk_accno', width:150},",
            "{name:'bnk_status', index:'bnk_status', search:false, formatter:'checkbox', align:'center', width:40},",
            "{name:'Actions', index:'Actions', width:40, sortable:false, search:false, align:'center'}"
        );

        return $data;
    }

    public function empty_record()                                         //Fetch listing record
    {
        $_POST['fv']['cus_id']                    =    NULL;
        $_POST['fv']['cus_name']                =    NULL;
        $_POST['fv']['cus_company_name']        =    NULL;
        $_POST['fv']['cus_alise_name']            =    NULL;
        $_POST['fv']['cus_address']                =    NULL;
        $_POST['fv']['cus_city']                =    NULL;
        $_POST['fv']['cus_remarks']                =    NULL;
        $_POST['fv']['cus_state']                =    NULL;
        $_POST['fv']['cus_country']                =    NULL;
        $_POST['fv']['cus_pin_code']            =    NULL;
        $_POST['fv']['cus_mobile']                =    NULL;
        $_POST['fv']['cus_email']                =    NULL;
        $_POST['fv']['cus_login_name']            =    NULL;
        $_POST['fv']['cus_login_password']        =    NULL;
        $_POST['fv']['cus_sec_code']            =    NULL;
        $_POST['fv']['customer_type']            =    0;
        $_POST['fv']['margin_amt']                =    0;
        $_POST['fv']['cus_status']                =    0;
        $_POST['fv']['db_error_msg']            =    "";
        $_POST['fv']['cus_regtype']                =    0;
        $_POST['fv']['cus_tcstds']                =    0;
    }

    /*
	* Fetch record for entry when edit
	*/
    public function get_entry_record($record_id)                                         //Fetch entry record
    {
        $records['cus_id']                   = $record_id;
        //Build contents query
        $query = $this->db->query("select cus_id,unfix, cus_name, cus_company_name,cus_alise_name,cus_address,cus_whatsapp, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_remarks, cus_login_name, cus_login_password, cus_sec_code,IFNULL(cus_regtype,0) as cus_regtype,customer_type,cus_panno,cus_gstno, cus_sms_status, cus_email_status,cus_tcstds from dt_customer where cus_id='" . $record_id . "'");
        foreach ($query->result() as $row) {
            $records['cus_id']                   = $row->cus_id;
            $records['unfix']                   = $row->unfix;
            $records['cus_name']                   = $row->cus_name;
            $records['cus_company_name']           = $row->cus_company_name;
            $records['cus_alise_name']           = $row->cus_alise_name;
            $records['cus_address']               = $row->cus_address;
            $records['cus_city']                   = $row->cus_city;
            $records['cus_remarks']                = $row->cus_remarks;
            $records['cus_state']               = $row->cus_state;
            $records['cus_country']               = $row->cus_country;
            $records['cus_pin_code']               = $row->cus_pin_code;
            $records['cus_mobile']               = $row->cus_mobile;
            $records['cus_email']                   = $row->cus_email;
            $records['cus_login_name']           = $row->cus_login_name;
            $records['cus_login_password']       = $row->cus_login_password;
            $records['cus_whatsapp']               = $row->cus_whatsapp;
            $records['cus_sec_code']               = $row->cus_sec_code;
            $records['cus_regtype']                = $row->cus_regtype;
            $records['customer_type']            = $row->customer_type;
            $records['cus_panno']                = $row->cus_panno;
            $records['cus_gstno']                = $row->cus_gstno;
            $records['cus_sms_status']           = ($row->cus_sms_status == 1) ? TRUE : FALSE;
            $records['cus_email_status']           = ($row->cus_email_status == 1) ? TRUE : FALSE;
            $records['cus_tcstds']               = ($row->cus_tcstds == 1) ? TRUE : FALSE;
            $records['db_error_msg']            = "";
        }
        return $records;
    }
    public function get_activateentry_record($record_id)                                         //Fetch entry record
    {
        $records['cus_id']                   = $record_id;
        //Build contents query
        $query = $this->db->query("select cus_id, cus_name, cus_valid_till, cus_is_life_time, cus_active, opening_balance, has_gmaxqty, gold_max_qty, has_smaxqty, silver_max_qty, has_gminqty, gold_min_qty, has_sminqty, silver_min_qty, has_gallot_qty, gold_allot_qty, has_sallot_qty, silver_allot_qty, cus_sms_status, cus_email_status,cus_limitenable from dt_customer where cus_id='" . $record_id . "'");
        foreach ($query->result() as $row) {
            $records['cus_id']                   = $row->cus_id;
            $records['cus_name']                   = $row->cus_name;
            $records['cus_active']               = $row->cus_active;
            $records['cus_valid_till']           = $row->cus_valid_till != NULL ? date('d-m-Y', strtotime($row->cus_valid_till)) : date('d-m-Y');
            $records['cus_is_life_time']           = ($row->cus_is_life_time == 1) ? TRUE : FALSE;
            $records['opening_balance']           = $row->opening_balance;
            $records['has_gmaxqty']               = $row->has_gmaxqty;
            $records['gold_max_qty']               = ($row->gold_max_qty * 1000) + 0;
            $records['has_smaxqty']               = $row->has_smaxqty;
            $records['silver_max_qty']           = ($row->silver_max_qty * 1000) + 0;
            $records['has_gminqty']               = $row->has_gminqty;
            $records['gold_min_qty']               = ($row->gold_min_qty * 1000) + 0;
            $records['has_sminqty']               = $row->has_sminqty;
            $records['silver_min_qty']           = ($row->silver_min_qty * 1000) + 0;
            $records['has_gallot_qty']           = $row->has_gallot_qty;
            $records['gold_allot_qty']           = ($row->gold_allot_qty * 1000) + 0;
            $records['has_sallot_qty']           = $row->has_sallot_qty;
            $records['silver_allot_qty']           = ($row->silver_allot_qty * 1000) + 0;
            $records['cus_sms_status']           = ($row->cus_sms_status == 1) ? TRUE : FALSE;
            $records['cus_email_status']           = ($row->cus_email_status == 1) ? TRUE : FALSE;
            $records['cus_limitenable']           = ($row->cus_limitenable == 1) ? TRUE : FALSE;
        }
        //print_r($records);
        return $records;
    }
    public function update_activaterecord($id)
    {
        //get previous record to compare and update in log
        $oldRecord  = $this->get_activateentry_record($id);
        $oldRecord['comm'] = $this->load_commodity($id);

        $_POST['fv']['cus_valid_till']         =     isset($_POST['fv']['cus_valid_till'])  ? date('Y-m-d', strtotime($_POST['fv']['cus_valid_till'])) : NULL;
        $_POST['fv']['cus_active']            =    (isset($_POST['fv']['cus_active']) && $_POST['fv']['cus_active'] == 1) ? 1 : 0;
        $_POST['fv']['cus_is_life_time']    =    (isset($_POST['fv']['cus_is_life_time']) ? 1 : 0);
        $_POST['fv']['cus_sms_status']    =    (isset($_POST['fv']['cus_sms_status']) ? 1 : 0);
        $_POST['fv']['cus_email_status']    =    (isset($_POST['fv']['cus_email_status']) ? 1 : 0);
        $_POST['fv']['opening_balance']        =    trim($_POST['fv']['opening_balance']) == "" || $_POST['fv']['opening_balance'] == NULL ? 0 : $_POST['fv']['opening_balance'];

        $_POST['fv']['has_gminqty']        =  isset($_POST['fv']['has_gminqty']) ? 1 : 0;
        $_POST['fv']['has_sminqty']        =  isset($_POST['fv']['has_sminqty']) ? 1 : 0;
        $_POST['fv']['has_gmaxqty']        =  isset($_POST['fv']['has_gmaxqty']) ? 1 : 0;
        $_POST['fv']['has_smaxqty']        =  isset($_POST['fv']['has_smaxqty']) ? 1 : 0;
        $_POST['fv']['has_gallot_qty']    =  isset($_POST['fv']['has_gallot_qty']) ? 1 : 0;
        $_POST['fv']['has_sallot_qty']    =  isset($_POST['fv']['has_sallot_qty']) ? 1 : 0;

        $_POST['fv']['gold_min_qty']    =  $_POST['fv']['has_gminqty'] == 1 ? $_POST['fv']['gold_min_qty'] / 1000 : 0;
        $_POST['fv']['silver_min_qty']    =  $_POST['fv']['has_sminqty'] == 1 ? $_POST['fv']['silver_min_qty'] / 1000 : 0;
        $_POST['fv']['gold_max_qty']    =  $_POST['fv']['has_gmaxqty'] == 1 ? $_POST['fv']['gold_max_qty'] / 1000 : 0;
        $_POST['fv']['silver_max_qty']    =  $_POST['fv']['has_smaxqty'] == 1 ? $_POST['fv']['silver_max_qty'] / 1000 : 0;
        $_POST['fv']['gold_allot_qty']    =  $_POST['fv']['has_gallot_qty'] == 1 ? $_POST['fv']['gold_allot_qty'] / 1000 : 0;
        $_POST['fv']['silver_allot_qty'] =  $_POST['fv']['has_sallot_qty'] == 1 ? $_POST['fv']['silver_allot_qty'] / 1000 : 0;
        $_POST['fv']['cus_limitenable'] = (!empty($_POST['fv']['cus_limitenable']) && $_POST['fv']['cus_limitenable'] == 1) ? 1 : 0;

        $update_customer = $this->db->update($this->table_name, $_POST['fv'], array('cus_id' => $id));

        // Log the activation record update
        if ($this->db->affected_rows() > 0) {
            // Load required helpers for logging
            $this->load->helper('field_labels');
            $this->load->helper('common');
            $field_labels = get_field_labels();
            $value_labels = get_field_value_labels();

            // Create selective logging - only log changed values
            $changed_data = get_changed_fields($oldRecord, $_POST['fv']);

            // Separate old and new data for logging
            $old_values = array();
            $new_values = array();

            foreach ($changed_data as $field => $values) {
                $old_values[$field] = $values['old'];
                $new_values[$field] = $values['new'];
            }

            // Log the edit operation with old values in log_pre_data and new values in log_update_data
            if (!empty($changed_data)) {
                log_admin_edit('45', 'User Registration - Activation', $old_values, $new_values, 'Admin - Updated activation record for Customer Id: ' .  $_POST['fv']['cus_id']);
            }
        }

        $delete_record = $this->db->query("DELETE FROM dt_cus_commodity WHERE cus_com_cus_id='" . $id . "'");
        $i = 0;
        $commodity_changes = array();
        $total_limits_cancelled = 0;

        // Get admin ID once upfront to avoid query builder contamination
        $this->load->model('login_model');
        $admin_id = $this->login_model->get_userid();
        $adminip = isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '';

        // ─── BZ: Limit Order Guard — cancel customer's limits when account deactivated or limit disabled ───
        if (($_POST['fv']['cus_active'] == 0 && $oldRecord['cus_active'] == 1) ||
            ($_POST['fv']['cus_limitenable'] == 0 && $oldRecord['cus_limitenable'] == 1)) {
            // Cancel ALL pending limit orders for this customer
            $this->db->where('book_cusid', (int)$id);
            $this->db->where('ordertype', 1);
            $this->db->where('orderstatus', 0);
            $this->db->where('IFNULL(delete_status,0)', 0);
            $this->db->update('dt_booking', [
                'orderstatus' => 3,
                'book_adminuser' => $admin_id,
                'book_adminipaddress' => $adminip
            ]);
            $total_limits_cancelled += $this->db->affected_rows();
        }

        if (isset($_POST['cdItems']['com_id'])) {
            foreach ($_POST['cdItems']['com_id'] as $key => $value) {
                $cdItems['cus_com_cus_id']        =    $id;
                $cdItems['cus_com_id']            =    $_POST['cdItems']['com_id'][$key];
                $cdItems['cus_com_smoq']        =    $_POST['cdItems']['cus_com_smoq'][$key] != "" ? $_POST['cdItems']['cus_com_smoq'][$key] : 0;
                $cdItems['cus_com_pmoq']        =    $_POST['cdItems']['cus_com_pmoq'][$key] != "" ? $_POST['cdItems']['cus_com_pmoq'][$key] : 0;
                $cdItems['cus_com_status_buy']    =    isset($_POST['cdItems']['cus_com_status_buy'][$i]) ? 1 : 0;
                $cdItems['cus_com_status_sell']    =    isset($_POST['cdItems']['cus_com_status_sell'][$i]) ? 1 : 0;
                $cdItems['cus_com_amountpurch']    =    isset($_POST['cdItems']['cus_com_amountpurch'][$i]) ? 1 : 0;
                $cdItems['cus_open_qty']        =    0;
                $cdItems['cus_open_rate']        =    0;
                $this->db->insert("dt_cus_commodity", $cdItems);

                // ─── BZ: Limit Order Guard — cancel customer's limits per commodity ───
                if (isset($oldRecord['comm']) && is_array($oldRecord['comm']) && $total_limits_cancelled == 0) {
                    foreach ($oldRecord['comm'] as $old_com) {
                        if ($old_com['com_id'] == $cdItems['cus_com_id']) {
                            $old_sell = isset($old_com['cus_com_status_sell']) ? $old_com['cus_com_status_sell'] : 0;
                            $old_buy  = isset($old_com['cus_com_status_buy']) ? $old_com['cus_com_status_buy'] : 0;

                            // Sell disabled for this customer+commodity
                            if ($old_sell == 1 && $cdItems['cus_com_status_sell'] == 0) {
                                $this->db->where('book_cusid', (int)$id);
                                $this->db->where('book_comid', (int)$cdItems['cus_com_id']);
                                $this->db->where('book_type', 0); // sell
                                $this->db->where('ordertype', 1);
                                $this->db->where('orderstatus', 0);
                                $this->db->where('IFNULL(delete_status,0)', 0);
                                $this->db->update('dt_booking', [
                                    'orderstatus' => 3,
                                    'book_adminuser' => $admin_id,
                                    'book_adminipaddress' => $adminip
                                ]);
                                $total_limits_cancelled += $this->db->affected_rows();
                            }
                            // Buy disabled for this customer+commodity
                            if ($old_buy == 1 && $cdItems['cus_com_status_buy'] == 0) {
                                $this->db->where('book_cusid', (int)$id);
                                $this->db->where('book_comid', (int)$cdItems['cus_com_id']);
                                $this->db->where('book_type', 1); // buy
                                $this->db->where('ordertype', 1);
                                $this->db->where('orderstatus', 0);
                                $this->db->where('IFNULL(delete_status,0)', 0);
                                $this->db->update('dt_booking', [
                                    'orderstatus' => 3,
                                    'book_adminuser' => $admin_id,
                                    'book_adminipaddress' => $adminip
                                ]);
                                $total_limits_cancelled += $this->db->affected_rows();
                            }
                            break;
                        }
                    }
                }

                // Track changes for logging
                $commodity_changes[] = array(
                    'com_id' => $_POST['cdItems']['com_id'][$key],
                    'cus_com_smoq' => $cdItems['cus_com_smoq'],
                    'cus_com_pmoq' => $cdItems['cus_com_pmoq'],
                    'cus_com_status_buy' => $cdItems['cus_com_status_buy'],
                    'cus_com_status_sell' => $cdItems['cus_com_status_sell'],
                    'cus_com_amountpurch' => $cdItems['cus_com_amountpurch']
                );

                unset($cdItems);
                $i++;
            }
        }

        // Notify socket if limits were cancelled
        if ($total_limits_cancelled > 0) {
            $limit_url = isset(Globals::$limitupdate) ? Globals::$limitupdate : '';
            if ($limit_url != '') {
                curl_helper($limit_url, http_build_query(['limit' => ['limitupdate' => 1, 'book_no' => '1']]));
            }
            log_message('info', "Auto-cancelled {$total_limits_cancelled} limit orders for customer ID: {$id} on trader activation update");
        }

        $_POST['fv']['cus_id']    = $id;
        $this->updatecommoditygroup();
        // Log commodity changes
        $this->log_commodity_changes($oldRecord, $commodity_changes, $id, $oldRecord['cus_name']);

        // Send updates to socket/external API
        // $this->send_socket_update();

        return array('status' => $update_customer ? 1 : 0);
    }

    private function send_socket_update()
    {
        $str_query = "SELECT '1' as comst, com.com_id, com_name,
		com_isregion, ifnull(com_calpurity,0) as com_calpurity,
		rcom_disname as displyname,contract_symbol as mcxcontract, bcontract_rate as bankcontract,
		rcom_mcxsymbol as mcxsymbol, rcom_banksymbol as banksymbol,
		bconvert_value, bconvert_value_type, bextra_charges, bextra_type, bbase_rate,
		premium, rupeepremium, custom, octroi, tax, taxtype, pure,
		rcom_sell_diff_type, rcom_buy_diff_type, rcom_sell_callpurity,
		rcom_buy_callpurity, rcom_comtype as com_type,
		ifnull(com_tax,0) as com_tax, ifnull(com_octroi,0) as com_octroi,  ifnull(com_stamduty,0) as com_stamduty, com_roundoff,
		com_weight, com_unit, com_other_charges, rcom_id as rcomid,
		trade_type, sell_diff, buy_diff, sell_rate,
		com_correction_type, com_is_coin, com_order_number,
		com_display_purity , TRIM(com_bar_quantity)+0 AS com_bar_quantity, ifnull(com_margin_type, 0) as com_margin_type, com_margin_value ,allowed_decimals,
		com_sel_premium, com_buy_premium, ifnull(com_premium_type,0) as com_premium_type,
		com_sel_active, com_buy_active, com_delverydays,
		date_format(date_add(current_date(), INTERVAL com_delverydays day), '%d-%m-%Y') as deliverydays,
		allowed_decimals, IFNULL(bar_selection,0) AS bar_selection, com_bar_no, com_bar_type
		FROM dt_com_master AS com
		LEFT JOIN dt_com_group_com as cgc ON cgc.com_id = com.com_id AND com_group_id = 1
		LEFT JOIN dt_rpanelcommodities as rpc ON rpc.rcom_id = com_type
		LEFT JOIN dt_contractmaster as mcxc ON mcxc.contract_id = rpc.rcom_mcxsymbol
		LEFT JOIN dt_bankcontractmaster as bcm ON bcm.bcontract_id = rpc.rcom_banksymbol
		LEFT JOIN dt_rpanelbank as rpb ON rpb.banksymbol = bcm.bcontract_id
		LEFT JOIN dt_rpanelcontract as rcon ON rcon.rpanelcomid = rcom_id
		WHERE com_sel_active = 1 OR com_buy_active = 1 ORDER BY com_order_number";

        $resultset = $this->db->query($str_query);
        $arr = array();
        $requst_array = array();
        foreach ($resultset->result_array() as $row) {
            $arr[] = $row;
        }
        $resultset->free_result();
        $requst_array["commodity"] = $arr;

        $contractquery = $this->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
        foreach ($contractquery->result() as $contractrow) {
            $rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, "userpage_displayname" => $contractrow->userpage_displayname, "userpage_status" => $contractrow->userpage_status);
        }
        $contractquery->free_result();
        $requst_array["rpanel_contracts"] = $rpanel_display_contracts;
        $return_array["commodity"] = $requst_array;

        $url = Globals::$commodityupdate;
        if ($url != '') {
            $field_string = http_build_query($return_array);
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $field_string);
            $result = curl_exec($ch);
        }
    }
    // updating customer activation by group
    public function update_customerActive($update_ids, $active_id)
    {
        //print_r($update_ids);
        for ($i = 0; $i < count($update_ids); $i++) {
            $query = $this->db->query("update dt_customer set cus_active='" . $active_id . "' where cus_id='" . $update_ids[$i] . "'");
        }
    }
    public function activate_MultipleCustomers($customers)
    {
        $responsedata = array();
        foreach ($customers as $key => $val) {
            $update_values = array('cus_valid_till' =>  date('Y-m-d', strtotime('+15 days')), 'cus_is_life_time' => 1, 'cus_active' => 1);
            $this->db->update($this->table_name, $update_values, array("cus_id" => $val->userid, "cus_active" => 0));
            $afftectedRows = $this->db->affected_rows();
            if ($afftectedRows == 1) {
                $responsedata[] = array('cusid' => $val->userid, 'service_id' => 2);
            }
        }
        return $responsedata;
    }
    public function disable_MultipleCustomers($customers)
    {
        $responsedata = array();
        foreach ($customers as $key => $val) {
            $update_values = array('cus_valid_till' =>  date('Y-m-d', strtotime('+15 days')), 'cus_is_life_time' => 0, 'cus_active' => 0);
            $this->db->update($this->table_name, $update_values, array("cus_id" => $val->userid, "cus_active" => 1));
            $afftectedRows = $this->db->affected_rows();
            if ($afftectedRows == 1) {
                $responsedata[] = array('cusid' => $val->userid, 'service_id' => 2);
            }
        }
        return $responsedata;
    }
    //set commodity moq details
    public function load_commodity($record_id)
    {
        $result_set = $this->db->query("select com_id, com_name, round((cus_com_smoq*1000)) as cus_com_smoq, round((cus_com_pmoq*1000)) as cus_com_pmoq, cus_com_status_buy,cus_com_status_sell,cus_com_amountpurch,cus_com_openqty,cus_com_openqtytype from dt_com_master left join dt_cus_commodity on com_id=cus_com_id and cus_com_cus_id='" . $record_id . "' where com_active=1 order by com_id")->result_array();
        return $result_set;
    }
    /**
     * Remove record
     * @param id
     * @return boolean
     */
    public function get_margintype()
    {
        $query_margintype = $this->db->query("select margin_type from dt_generalsettings");
        if ($query_margintype->num_rows() > 0) {
            $row_margintype   = $query_margintype->row();
            $value_margintype = $row_margintype->margin_type;

            if ($value_margintype == 0)
                $margin_type = '%/Kg';
            else
                $margin_type = 'Rs/Kg';
            return $margin_type;
        }
    }
    public function delete_record($record_id)
    {
        // Check if customer has any trades, fund transfers, or payments before deleting
        $check_trade = $this->db->query("SELECT book_no FROM dt_booking WHERE book_cusid = ?", array($record_id));
        // $check_ft = $this->db->query("SELECT * FROM dt_fundtransfer WHERE ft_intcode = ?", array($record_id));
        // $check_pay = $this->db->query("SELECT * FROM dt_customerpayment WHERE cuspay_cuscode = ?", array($record_id));

        if ($check_trade->num_rows() > 0) {
            return array('status' => 0, 'message' => 'Cannot delete trader.bookings records exist.');
        }

        // Get the record before deleting for logging purposes
        $old_record = $this->get_entry_record($record_id);

        $this->delete_sub_record($record_id);
        $delete_record = $this->db->query("DELETE FROM " . $this->table_name . " WHERE cus_id='" . $record_id . "'");

        // Log the delete operation
        if ($this->db->affected_rows() > 0) {
            $this->load->helper('field_labels');
            $field_labels = get_field_labels();
            $value_labels = get_field_value_labels();

            $logged_data = array();
            foreach ($old_record as $field => $value) {
                if ($field == 'db_error_msg') continue;
                $label = isset($field_labels[$field]) ? $field_labels[$field] : $field;

                if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
                    $logged_data[$label] = $value_labels[$field][$value];
                } else {
                    $logged_data[$label] = $value;
                }
            }
            log_admin_delete('45', 'User Registration', $logged_data, 'Admin - Deleted user: ' . $old_record['cus_name']);
            return array('status' => 1);
        }

        return array('status' => 0, 'message' => 'Failed to delete record.');
    }
    public function delete_sub_record($record_id)
    {
        $delete_record = $this->db->query("DELETE FROM dt_customergroupitems WHERE cgitems_cusid='" . $record_id . "'");
        $delete_record = $this->db->query("DELETE FROM dt_customerservicegroup WHERE csg_cusid='" . $record_id . "'");
        $delete_record = $this->db->query("DELETE FROM dt_cus_commodity WHERE cus_com_cus_id='" . $record_id . "'");
        return TRUE;
    }

    /**
     * Insert record
     * @param add_new as new record, otherwise as update record
     * @return boolean
     */
    public function insert_record($id)
    {
        $_POST['fv']['cus_register_on']         =    date('Y-m-d H:i:s');
        $_POST['fv']['cus_active']                =    0;
        $_POST['fv']['cus_tcstds']                =    (isset($_POST['fv']['cus_tcstds']) ? 1 : 0);

        $email_check = $this->db->get_where($this->table_name, array('cus_email' => $_POST['fv']['cus_email']));
        if ($email_check->num_rows() > 0) {
            return array('status' => 0, 'message' => 'Email already exists');
        }

        $response = $this->db->insert($this->table_name, $_POST['fv']);
        $new_id = $this->db->insert_id();

        if ($new_id) {
            $_POST['fv']['cus_id'] = $new_id;
            $cgrpitems['cgitems_cgrpid']        =    1;
            $cgrpitems['cgitems_cusid']            =    $new_id;
            $cgrpitems['cgitems_comgroupid']    =    1;
            $this->db->insert("dt_customergroupitems", $cgrpitems);

            // Log the add operation
            $this->load->helper('field_labels');
            $field_labels = get_field_labels();
            $value_labels = get_field_value_labels();

            $logged_data = array();
            foreach ($_POST['fv'] as $field => $value) {
                $label = isset($field_labels[$field]) ? $field_labels[$field] : $field;

                if (isset($value_labels[$field]) && isset($value_labels[$field][$value])) {
                    $logged_data[$label] = $value_labels[$field][$value];
                } else {
                    $logged_data[$label] = $value;
                }
            }
            log_admin_add('45', 'User Registration', $logged_data, 'Admin - Added new user: ' . $_POST['fv']['cus_name']);
            return array('status' => 1);
        }

        return array('status' => 0, 'message' => 'Failed to add record');
    }
    public function update_record($id)
    {
        //Get previous old records to compare and update in log table
        $oldRecord = $this->get_entry_record($id);
        //Update Data
        $_POST['fv']['cus_id']            = $id;
        $_POST['fv']['cus_tcstds']        =    (isset($_POST['fv']['cus_tcstds']) ? $_POST['fv']['cus_tcstds'] : 1);

        $update_customer = $this->db->update($this->table_name, $_POST['fv'], array('cus_id' => $id));

        // Create selective logging - only log changed values
        if ($this->db->affected_rows() >= 0) {
            $changed_data = get_changed_fields($oldRecord, $_POST['fv']);

            if (!empty($changed_data)) {
                $old_values = array();
                $new_values = array();

                foreach ($changed_data as $field => $values) {
                    $old_values[$field] = $values['old'];
                    $new_values[$field] = $values['new'];
                }

                log_admin_edit('45', 'User Registration', $old_values, $new_values, 'Admin - Updated user: ' . $_POST['fv']['cus_name']);
            }
            return array('status' => 1);
        }

        return array('status' => 0, 'message' => 'Failed to update record');
    }

    public function    customer_confirmation($record_id, $record_confirmation)
    {
        $message = "";
        //print_r("Enter");
        $result_set = $this->db->query("select datediff(now(),cus_register_on) as daysdiff,cus_status from dt_customer where cus_id='" . $record_id . "' and cus_confirmation_no='" . $record_confirmation . "'");
        if ($result_set->num_rows() > 0) {
            foreach ($result_set->result() as $row) {
                if ($row->cus_status > 0) {
                    $message = "You have already confirmed";
                } else {
                    if ($row->daysdiff > 7) {
                        $message = "Confirmation Date Expired";
                    } else {
                        $update_rs = $this->db->query("update dt_customer set cus_confirmed_on=now(),cus_status=1 where cus_id='" . $record_id . "' and cus_confirmation_no='" . $record_confirmation . "' and cus_status=0");
                        $message = "Thanks for your confirmation";
                    }
                }
            }
        } else {
            $message = "No such user";
        }
        echo $message;
    }
    function get_SMSURL($service_id, $cus_id)
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
            $resultset = $this->db->query("SELECT cus_sms_status FROM dt_customer WHERE cus_id = '" . $cus_id . "'");
            foreach ($resultset->result() as $row) {
                $sms_cus_status = $row->cus_sms_status;
            }
            $resultset->free_result();
            if ($sms_cus_status == 1) {
                $resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active,'" . $this->session->userdata('company_name') . "' as admin_company_name from dt_customer where cus_id = '" . $cus_id . "'");
                foreach ($resultset->result() as $row) {
                    $customer_data = $row;
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
                $sms_url = str_replace("@@message@@", $sms_content, $sms_url);
            }
        }
        //Returning generated SMS URL
        return $sms_url;
    }
    function get_EmailContent($service_id, $cus_id)
    {
        //Declaration of variables
        $email_content = "";
        $email_status = 0;
        $email_id = 1; //Send SMS
        $email_signature = "";
        $customer_data = array();
        $return_data = array();
        //Retriving EMail service for registration confirmation
        $resultset = $this->db->query("SELECT serv_email FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
        foreach ($resultset->result() as $row) {
            $email_status = $row->serv_email;
        }
        $resultset->free_result();

        //Checking EMail service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
        if ($email_status == 1) {
            //Retriving SMS Customer for registration confirmation
            $resultset = $this->db->query("SELECT cus_email_status FROM dt_customer WHERE cus_id = '" . $cus_id . "'");
            foreach ($resultset->result() as $row) {
                $email_cus_status = $row->cus_email_status;
            }
            $resultset->free_result();
            if ($email_cus_status == 1) {
                $resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_alise_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active,'" . $this->session->userdata('company_name') . "' as admin_company_name from dt_customer where cus_id = '" . $cus_id . "'");
                foreach ($resultset->result() as $row) {
                    $customer_data = $row;
                }
                $return_data["email_id"] =     $customer_data->cus_email;
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
        return $return_data;
    }

    function validateUserName($username, $userid)
    {

        if ($userid == NULL || $userid == "") {
            $sql = "SELECT cus_login_name FROM dt_customer WHERE cus_login_name = ?";
        } else {
            $sql = "SELECT cus_login_name FROM dt_customer WHERE cus_login_name = ? AND cus_id !=" . $userid;
        }
        $results = $this->db->query($sql, array($username));
        if ($results->num_rows() == 0) {
            return "true";  //good to register
        } else {
            return "false"; //already registered
        }
    }

    function clientEmail($userid, $email)
    {
        if ($userid == NULL || $userid == "") {
            $sql = "select cus_email from dt_customer where cus_email='" . $email . "'";
        } else {
            $sql = "select cus_email from dt_customer where cus_email='" . $email . "' AND cus_id !=" . $userid;
        }
        $resultset = $this->db->query($sql);
        if ($resultset->num_rows() == 0) {
            return "true";  //good to register
        } else {
            return "false"; //already registered
        }
    }
    function clientMobileNo($userid, $mobile)
    {
        if ($userid == NULL || $userid == "") {
            $sql = "select cus_mobile1 from dt_customer where cus_mobile1='" . $mobile . "'";
        } else {
            $sql = "select cus_mobile1 from dt_customer where cus_mobile1='" . $mobile . "' AND cus_id !=" . $userid;
        }
        $resultset = $this->db->query($sql);
        if ($resultset->num_rows() == 0) {
            return 'true';  //good to register
        } else {
            return 'false'; //already registered
        }
    }

    function get_customer($type = 0)
    {
        $customers = array();

        $where =  ($type == 1 ? "AND customer_type = 0 OR customer_type = 1" : ($type == 2 ? ("AND customer_type = 0 OR customer_type = 2") : ("AND customer_type = 0")));

        //echo $where;exit;
        $result_set = $this->db->query("select cus_id, cus_name, cus_alise_name FROM dt_customer WHERE cus_active = 1 " . $where);

        if ($result_set->num_rows() > 0) {
            foreach ($result_set->result() as $row) {
                $customers[] = array("cus_id" => $row->cus_id, "cus_name" => $row->cus_name, "cus_alise_name" => $row->cus_alise_name);
            }
        }

        return $customers;
    }
    function get_serv_status($service_id)
    {
        $status = array();
        $resultset = $this->db->query("SELECT serv_sms, serv_email FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
        foreach ($resultset->result() as $row) {
            $status['sms_status']   = $row->serv_sms;
            $status['email_status'] = $row->serv_email;
        }
        $resultset->free_result();
        return $status;
    }
    function check_update_status($cus_id)
    {
        $query_book = $this->db->query("select book_no from dt_booking where book_cusid =" . $cus_id);
        $query_ft = $this->db->query("select * from dt_fundtransfer where ft_intcode =" . $cus_id);
        $query_pay = $this->db->query("select * from dt_customerpayment where cuspay_cuscode =" . $cus_id);
        if ($query_book->num_rows() > 0 || $query_ft->num_rows() > 0 || $query_pay->num_rows() > 0) return 1;
        else return 0;
    }
    function updatecommoditygroup()
    {
        $socketObj = new SocketUpdater();
        $resp = $socketObj->commodity_update();
    }

    function updateLogForInsertRec($record)
    {
        $updatedRecord = array();
        $group = $record['groupItems'];

        $updatedRecord['Cus Id']         = $record['cus_id'];
        $updatedRecord['Cus Name']         = $record['cus_name'];
        $updatedRecord['Alias Name']     = $record['cus_alise_name'];
        $updatedRecord['Company Name']     = $record['cus_company_name'];
        $updatedRecord['Customer Type'] = $record['customer_type'];
        $updatedRecord['Mobile']         = $record['cus_mobile'];
        $updatedRecord['Email']         = $record['cus_email'];
        $updatedRecord['Address']         = $record['cus_address'];
        $updatedRecord['City']             = $record['cus_city'];
        $updatedRecord['Remarks']         = $record['cus_remarks'];
        $updatedRecord['Login']         = $record['cus_login_name'];
        $updatedRecord['Date']             = $record['cus_register_on'];
        $updatedRecord['Status']         = $record['cus_active'];
        $updatedRecord['Reg Type']         = $record['cus_regtype'];

        $updatedRecord['Group Id']         = $group['cgitems_cgrpid'];

        $cusId = array('Cus ID' => $record['cus_id']);
        $updatedRecord = $cusId + $updatedRecord;
        $records = json_encode($updatedRecord);
        $admin_id         = $this->login_model->get_userid();
        $adminipaddress = $_SERVER['SERVER_ADDR'];
        $log_shortdesc     = "New User Registration by Admin. Cus Id: " . $record['cus_id'];
        $logtype = 8;
        $logdatetime = date('Y-m-d H:i:s');
        $logupdatedata = date('Y-m-d H:i:s');
        //$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('" . $logdatetime . "','" . $logtype . "','" . $logupdatedata . "','" . $log_shortdesc . "','" . $records . "','NULL','NULL','NULL','" . $admin_id . "','" . $adminipaddress . "')");
    }

    function updateLogForUpdateRec($oldRecord, $newRecord)
    {
        $updatedRecord = array();

        if ($oldRecord['cus_id'] != $newRecord['cus_id']) {
            $updatedRecord['New']['Cus Id'] = $newRecord['cus_id'];
            $updatedRecord['Old']['Cus Id'] = $oldRecord['cus_id'];
        }
        if ($oldRecord['cus_name'] != $newRecord['cus_name']) {
            $updatedRecord['New']['Cus Name'] = $newRecord['cus_name'];
            $updatedRecord['Old']['Cus Name'] = $oldRecord['cus_name'];
        }
        if ($oldRecord['cus_alise_name'] != $newRecord['cus_alise_name']) {
            $updatedRecord['New']['Alias Name'] = $newRecord['cus_alise_name'];
            $updatedRecord['Old']['Alias Name'] = $oldRecord['cus_alise_name'];
        }
        if ($oldRecord['cus_company_name'] != $newRecord['cus_company_name']) {
            $updatedRecord['New']['Company Name'] = $newRecord['cus_company_name'];
            $updatedRecord['Old']['Company Name'] = $oldRecord['cus_company_name'];
        }
        if ($oldRecord['customer_type'] != $newRecord['customer_type']) {
            $updatedRecord['New']['Customer Type'] = $newRecord['customer_type'];
            $updatedRecord['Old']['Customer Type'] = $oldRecord['customer_type'];
        }
        if ($oldRecord['cus_mobile'] != $newRecord['cus_mobile']) {
            $updatedRecord['New']['Mobile'] = $newRecord['cus_mobile'];
            $updatedRecord['Old']['Mobile'] = $oldRecord['cus_mobile'];
        }
        if ($oldRecord['cus_email'] != $newRecord['cus_email']) {
            $updatedRecord['New']['Email'] = $newRecord['cus_email'];
            $updatedRecord['Old']['Email'] = $oldRecord['cus_email'];
        }
        if ($oldRecord['cus_address'] != $newRecord['cus_address']) {
            $updatedRecord['New']['Address'] = $newRecord['cus_address'];
            $updatedRecord['Old']['Address'] = $oldRecord['cus_address'];
        }
        if ($oldRecord['cus_city'] != $newRecord['cus_city']) {
            $updatedRecord['New']['City'] = $newRecord['cus_city'];
            $updatedRecord['Old']['City'] = $oldRecord['cus_city'];
        }
        if ($oldRecord['cus_remarks'] != $newRecord['cus_remarks']) {
            $updatedRecord['New']['Remarks'] = $newRecord['cus_remarks'];
            $updatedRecord['Old']['Remarks'] = $oldRecord['cus_remarks'];
        }
        if ($oldRecord['cus_login_name'] != $newRecord['cus_login_name']) {
            $updatedRecord['New']['Login'] = $newRecord['cus_login_name'];
            $updatedRecord['Old']['Login'] = $oldRecord['cus_login_name'];
        }
        if ($oldRecord['cus_regtype'] != $newRecord['cus_regtype']) {
            $updatedRecord['New']['Reg Type'] = $newRecord['cus_regtype'];
            $updatedRecord['Old']['Reg Type'] = $oldRecord['cus_regtype'];
        }
        if ($oldRecord['cus_login_password'] != $newRecord['cus_login_password']) {
            $updatedRecord['New']['Password'] = "";
            $updatedRecord['Old']['Password'] = "";
        }

        if (count($updatedRecord) > 0) {
            $cusId = array('Cus ID' => $newRecord['cus_id']);
            $updatedRecord = $cusId + $updatedRecord;
            $records = json_encode($updatedRecord);
            $ipaddr = $_SERVER['SERVER_ADDR'];
            $log_shortdesc     = "Updated Customer Master. Cus Id: " . $newRecord['cus_id'];
            $admin_id         = $this->login_model->get_userid();
            $logtype = 8;
            $logdatetime = date('Y-m-d H:i:s');
            $logupdatedata = date('Y-m-d H:i:s');
            //$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('" . $logdatetime . "','" . $logtype . "','" . $logupdatedata . "','" . $log_shortdesc . "','" . $records . "','NULL','NULL','NULL','" . $admin_id . "','" . $ipaddr . "')");
        }
    }

    function updateLogForActivateEntry($oldRecord, $newRecord)
    {
        $updatedRecord = array();
        $record = $newRecord['fv'];
        $cdItems = $newRecord['cdItems'];

        $date = $record['cus_valid_till'] != NULL ? date('d-m-Y', strtotime($record['cus_valid_till'])) : date('d-m-Y');
        if ($oldRecord['cus_valid_till'] != $date) {
            $updatedRecord['New']['Valid Till'] = $date;
            $updatedRecord['Old']['Valid Till'] = $oldRecord['cus_valid_till'];
        }
        if ($oldRecord['cus_active'] != $record['cus_active']) {
            $updatedRecord['New']['Status'] = $record['cus_active'];
            $updatedRecord['Old']['Status'] = $oldRecord['cus_active'];
        }
        if ($oldRecord['gold_min_qty'] != $record['gold_min_qty']) {
            $updatedRecord['New']['Gold Min Qty'] = $record['gold_min_qty'];
            $updatedRecord['Old']['Gold Min Qty'] = $oldRecord['gold_min_qty'];
        }
        if ($oldRecord['silver_min_qty'] != $record['silver_min_qty']) {
            $updatedRecord['New']['Silver Min Qty'] = $record['silver_min_qty'];
            $updatedRecord['Old']['Silver Min Qty'] = $oldRecord['silver_min_qty'];
        }
        if ($oldRecord['gold_max_qty'] != $record['gold_max_qty']) {
            $updatedRecord['New']['Gold Max Qty'] = $record['gold_max_qty'];
            $updatedRecord['Old']['Gold Max Qty'] = $oldRecord['gold_max_qty'];
        }
        if ($oldRecord['silver_max_qty'] != $record['silver_max_qty']) {
            $updatedRecord['New']['Silver Max Qty'] = $record['silver_max_qty'];
            $updatedRecord['Old']['Silver Max Qty'] = $oldRecord['silver_max_qty'];
        }
        if ($oldRecord['gold_allot_qty'] != $record['gold_allot_qty']) {
            $updatedRecord['New']['Gold Alloted Qty'] = $record['gold_allot_qty'];
            $updatedRecord['Old']['Gold Alloted Qty'] = $oldRecord['gold_allot_qty'];
        }
        if ($oldRecord['silver_allot_qty'] != $record['silver_allot_qty']) {
            $updatedRecord['New']['Silver Alloted Qty'] = $record['silver_allot_qty'];
            $updatedRecord['Old']['Silver Alloted Qty'] = $oldRecord['silver_allot_qty'];
        }
        if ($oldRecord['cus_is_life_time'] != $record['cus_is_life_time']) {
            $updatedRecord['New']['Is Life Time'] = $record['cus_is_life_time'];
            $updatedRecord['Old']['Is Life Time'] = $oldRecord['cus_is_life_time'];
        }
        if ($oldRecord['has_gminqty'] != $record['has_gminqty']) {
            $updatedRecord['New']['Has Gold Min Qty'] = $record['has_gminqty'];
            $updatedRecord['Old']['Has Gold Min Qty'] = $oldRecord['has_gminqty'];
        }
        if ($oldRecord['has_sminqty'] != $record['has_sminqty']) {
            $updatedRecord['New']['Has Silver Min Qty'] = $record['has_sminqty'];
            $updatedRecord['Old']['Has Silver Min Qty'] = $oldRecord['has_sminqty'];
        }
        if ($oldRecord['has_gmaxqty'] != $record['has_gmaxqty']) {
            $updatedRecord['New']['Has Gold Max Qty'] = $record['has_gmaxqty'];
            $updatedRecord['Old']['Has Gold Max Qty'] = $oldRecord['has_gmaxqty'];
        }
        if ($oldRecord['has_smaxqty'] != $record['has_smaxqty']) {
            $updatedRecord['New']['Has Silver Max Qty'] = $record['has_smaxqty'];
            $updatedRecord['Old']['Has Silver Max Qty'] = $oldRecord['has_smaxqty'];
        }
        if ($oldRecord['has_gallot_qty'] != $record['has_gallot_qty']) {
            $updatedRecord['New']['Has Gold Allot Qty'] = $record['has_gallot_qty'];
            $updatedRecord['Old']['Has Gold Allot Qty'] = $oldRecord['has_gallot_qty'];
        }
        if ($oldRecord['has_sallot_qty'] != $record['has_sallot_qty']) {
            $updatedRecord['New']['Has Silver Allot Qty'] = $record['has_sallot_qty'];
            $updatedRecord['Old']['Has Silver Allot Qty'] = $oldRecord['has_sallot_qty'];
        }

        foreach ($cdItems['com_id'] as $key => $com) {
            $has_record = 0;
            foreach ($oldRecord['comm'] as $com_old) {
                if ($cdItems['com_id'][$key] == $com_old['com_id']) {
                    $cus_com_smoq = isset($cdItems['cus_com_smoq'][$key]) && $cdItems['cus_com_smoq'][$key] != "" ? $cdItems['cus_com_smoq'][$key] : 0;
                    $cus_com_pmoq = isset($cdItems['cus_com_pmoq'][$key]) && $cdItems['cus_com_pmoq'][$key] != "" ? $cdItems['cus_com_pmoq'][$key] : 0;
                    $cus_com_status_sell = isset($cdItems['cus_com_status_sell'][$key]) && $cdItems['cus_com_status_sell'][$key] == 1 ? 1 : 0;
                    $cus_com_status_buy = isset($cdItems['cus_com_status_buy'][$key]) && $cdItems['cus_com_status_buy'][$key] == 1 ? 1 : 0;


                    $cus_com_smoq_old = isset($com_old['cus_com_smoq']) && $com_old['cus_com_smoq'] != "" ? $com_old['cus_com_smoq'] : 0;
                    $cus_com_pmoq_old = isset($com_old['cus_com_pmoq']) && $com_old['cus_com_pmoq'] != "" ? $com_old['cus_com_pmoq'] : 0;
                    $cus_com_status_sell_old = isset($com_old['cus_com_status_sell']) && $com_old['cus_com_status_sell'] == 1 ? 1 : 0;
                    $cus_com_status_buy_old = isset($com_old['cus_com_status_buy']) && $com_old['cus_com_status_buy'] == 1 ? 1 : 0;

                    $has_record = 1;
                    $arrValNew = array();
                    $arrValOld = array();
                    if ($cus_com_smoq != $cus_com_smoq_old) {
                        $arrValNew['cus_com_smoq'] = $cus_com_smoq;
                        $arrValOld['cus_com_smoq'] = $cus_com_smoq_old;
                    }
                    if ($cus_com_pmoq != $cus_com_pmoq_old) {
                        $arrValNew['cus_com_pmoq'] = $cus_com_pmoq;
                        $arrValOld['cus_com_pmoq'] = $cus_com_pmoq_old;
                    }
                    if ($cus_com_status_sell != $cus_com_status_sell_old) {
                        $arrValNew['cus_com_status_sell'] = $cus_com_status_sell;
                        $arrValOld['cus_com_status_sell'] = $cus_com_status_sell_old;
                    }
                    if ($cus_com_status_buy != $cus_com_status_buy_old) {
                        $arrValNew['cus_com_status_buy'] = $cus_com_status_buy;
                        $arrValOld['cus_com_status_buy'] = $cus_com_status_buy_old;
                    }

                    if (count($arrValNew) > 0) {
                        $updatedRecord['New']['Comm'][$cdItems['com_id'][$key]] = $arrValNew;
                        $updatedRecord['Old']['Comm'][$cdItems['com_id'][$key]] = $arrValOld;
                    }
                }
            }
            if ($has_record == 0) {
                $updatedRecord['New']['Comm'][$cdItems['com_id'][$key]] = $com;
            }
        }
        if (count($updatedRecord) > 0) {
            $cusId = array('Cus Id' => $record['cus_id']);
            $updatedRecord = $cusId + $updatedRecord;
            $records = json_encode($updatedRecord);

            $admin_id         = $this->login_model->get_userid();
            $adminipaddress = $_SERVER['SERVER_ADDR'];
            $log_shortdesc     = "User Activate Entry Updated. Cus Id:" . $record['cus_id'];
            $logtype = 8;
            $logdatetime = date('Y-m-d H:i:s');
            $logupdatedata = date('Y-m-d H:i:s');
            //$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('" . $logdatetime . "','" . $logtype . "','" . $logupdatedata . "','" . $log_shortdesc . "','" . $records . "','NULL','NULL','NULL','" . $admin_id . "','" . $adminipaddress . "')");
        }
    }
    function validateEmail($email)
    {
        if ($email != NULL || $email != "") {
            $sql = "select cus_email from dt_customer where cus_email='" . $email . "'";
        }
        $resultset = $this->db->query($sql);
        if ($resultset->num_rows() == 0) {
            return "true";  //good to register
        } else {
            return "false"; //already registered
        }
    }


    function get_number($mobile = "", $cus_id = null)
    {
        if ($cus_id) {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_mobile = '$mobile' AND cus_id != '$cus_id'");
        } else {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_mobile = '$mobile'");
        }

        if ($resultset->num_rows() > 0) {
            return 1;
        } else {
            return 0;
        }
    }


    function get_whats_number($mobile = "", $cus_id = null)
    {
        if ($cus_id) {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_whatsapp = '$mobile' AND cus_id != '$cus_id'");
        } else {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_whatsapp = '$mobile'");
        }

        if ($resultset->num_rows() > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    function get_email($email = "", $cus_id = null)
    {
        if ($cus_id) {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_email = '$email' AND cus_id != '$cus_id'");
        } else {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_email = '$email'");
        }

        if ($resultset->num_rows() > 0) {
            return 1;
        } else {
            return 0;
        }
    }


    function get_pan($pan_no = "", $cus_id = null)
    {
        if ($cus_id) {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_panno = '$pan_no' AND cus_id != '$cus_id'");
        } else {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE cus_panno = '$pan_no'");
        }

        if ($resultset->num_rows() > 0) {
            return 1;
        } else {
            return 0;
        }
    }

    function get_gst($get_gst = "", $cus_id = null)
    {
        if ($cus_id) {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE gst_no = '$get_gst' AND cus_id != '$cus_id'");
        } else {
            $resultset = $this->db->query("SELECT * FROM dt_customer WHERE gst_no = '$get_gst'");
        }

        if ($resultset->num_rows() > 0) {
            return 1;
        } else {
            return 0;
        }
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
            $whatsapp_username    = $result_set->row()->admin_whatsapp_username;
            $whatsapp_password    = $result_set->row()->admin_whatsapp_password;
            $whatsapp_senderid    = $result_set->row()->admin_whatsapp_senderid;
            $whatsapp_authkey    = $result_set->row()->admin_whatsapp_authkey;
        }
        $result_set->free_result();

        //Generating Whatsapp Url with User Name, Password and Sender ID
        $whatsapp_returnurl = str_replace("@@user_name@@", $whatsapp_username, $whatsapp_returnurl);
        $whatsapp_returnurl = str_replace("@@password@@", $whatsapp_password, $whatsapp_returnurl);
        $whatsapp_returnurl = str_replace("@@mobileno@@", $mobile_no, $whatsapp_returnurl);
        $whatsapp_returnurl = str_replace("@@sender_id@@", $whatsapp_senderid, $whatsapp_returnurl);
        $whatsapp_returnurl = str_replace("@@auth_key@@", $whatsapp_authkey, $whatsapp_returnurl);
        //returning gererated URL

        return     $whatsapp_returnurl;
    }

    // function get_whatsappURL($service_id, $cus_id)
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
    // 		$resultset = $this->db->query("SELECT cus_sms_status FROM dt_customer WHERE cus_id = '" . $cus_id . "'");
    // 		foreach ($resultset->result() as $row) {
    // 			$sms_cus_status = $row->cus_sms_status;
    // 		}
    // 		$resultset->free_result();
    // 		if ($sms_cus_status == 1) {
    // 			$resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active,'" . $this->session->userdata('company_name') . "' as admin_company_name from dt_customer where cus_id = '" . $cus_id . "'");
    // 			foreach ($resultset->result() as $row) {
    // 				$customer_data = $row;
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
    // 			$sms_url = str_replace("@@message@@", $sms_content, $sms_url);
    // 		}
    // 	}
    // 	//Returning generated SMS URL
    // 	return array('message' => $sms_content, 'mobile' => $mobil_no);
    // }
    function get_WhatsappURL($service_id, $cus_id)
    {
        //Declaration of variables
        $whatsapp_data = array();
        $whatsapp_status = 0;
        $whatsapp_cus_status = 0;
        $whatsapp_id = 2; //Send Whatsapp
        $whatsapp_content = "";
        $whatsapp_footer = "";
        $customer_data = array();
        //Retriving Whatsapp service for registration confirmation
        $resultset = $this->db->query("SELECT serv_whatsapp FROM dt_serv_master WHERE serv_id = '" . $service_id . "'");
        foreach ($resultset->result() as $row) {
            $whatsapp_status = $row->serv_whatsapp;
        }
        $resultset->free_result();
        //Checking Whatsapp service for registration confirmation is enabled. 0-> Disbaled, 1-> Enabled
        if ($whatsapp_status == 1) {
            //Retriving Whatsapp Customer for registration confirmation
            $resultset = $this->db->query("SELECT cus_sms_status FROM dt_customer WHERE cus_id = '" . $cus_id . "'");
            foreach ($resultset->result() as $row) {
                $whatsapp_cus_status = $row->cus_sms_status;
            }

            $resultset->free_result();
            if ($whatsapp_cus_status == 1) {
                $resultset = $this->db->query("SELECT cus_id, cus_register_on, cus_name, cus_company_name, cus_address, cus_city, cus_state, cus_country, cus_pin_code, cus_phone,concat(cus_countrycode,cus_mobile) as cus_mobile, cus_email, cus_login_name, cus_login_password, cus_sec_code, DATE_FORMAT(cus_approved_on, '%d-%m-%Y %h:%i:%s') as cus_approved_on, DATE_FORMAT(cus_valid_till, '%d-%m-%Y') as cus_valid_till, cus_is_life_time, if(cus_active = 1, 'Active', 'Disabled') as cus_active, (select admin_company_name from dt_generalsettings) as admin_company_name from dt_customer where cus_id = '" . $cus_id . "'");
                foreach ($resultset->result() as $row) {
                    $customer_data = $row;
                }

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
                    // Parameters for Registration
                    $meta_params = array(
                        $customer_data->cus_name,
                        $customer_data->cus_login_name,
                        $customer_data->cus_login_password,
                        $customer_data->admin_company_name
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

                // Return mobile and message separately for whatsapp_message_helper
                $whatsapp_data['mobile'] = $customer_data->cus_mobile;
                $whatsapp_data['message'] = $whatsapp_content;
                $whatsapp_data['template_id'] = $meta_template_id;
                $whatsapp_data['params'] = $meta_params;
            }
        }
        //Returning generated Whatsapp data
        return $whatsapp_data;
    }

    /**
     * Log commodity changes for user registration
     * @param array $oldRecord - Old record data
     * @param array $newCommodities - New commodity data
     * @param int $cus_id - Customer ID
     * @param string $cus_name - Customer name
     * @return void
     */

    function log_commodity_changes($oldRecord, $newCommodities, $cus_id, $cus_name)
    {
        // Load required helpers
        $this->load->helper('field_labels');
        $this->load->helper('common');
        $field_labels = get_field_labels();
        $value_labels = get_field_value_labels();

        // Get commodity names for better logging
        $commodity_names = array();
        $com_query = $this->db->query("SELECT com_id, com_name FROM dt_com_master");
        foreach ($com_query->result() as $com_row) {
            $commodity_names[$com_row->com_id] = $com_row->com_name;
        }

        // Track commodity changes
        $commodity_log_data = array();

        foreach ($newCommodities as $new_com) {
            $com_id = $new_com['com_id'];
            $com_name = isset($commodity_names[$com_id]) ? $commodity_names[$com_id] : 'Unknown Commodity';

            // Find old commodity data
            $old_com = null;
            if (isset($oldRecord['comm']) && is_array($oldRecord['comm'])) {
                foreach ($oldRecord['comm'] as $com) {
                    if ($com['com_id'] == $com_id) {
                        $old_com = $com;
                        break;
                    }
                }
            }

            // If this is a new commodity entry
            if ($old_com === null) {
                $commodity_log_data[$com_name] = array(
                    'cus_com_smoq' => array('old' => null, 'new' => $new_com['cus_com_smoq']),
                    'cus_com_pmoq' => array('old' => null, 'new' => $new_com['cus_com_pmoq']),
                    'cus_com_status_buy' => array('old' => null, 'new' => $new_com['cus_com_status_buy']),
                    'cus_com_status_sell' => array('old' => null, 'new' => $new_com['cus_com_status_sell']),
                    'cus_com_amountpurch' => array('old' => null, 'new' => $new_com['cus_com_amountpurch'])
                );
            } else {
                // Check for changes in existing commodity
                $changes = array();

                if ($old_com['cus_com_smoq'] != $new_com['cus_com_smoq']) {
                    $changes['cus_com_smoq'] = array(
                        'old' => $old_com['cus_com_smoq'],
                        'new' => $new_com['cus_com_smoq']
                    );
                }

                if ($old_com['cus_com_pmoq'] != $new_com['cus_com_pmoq']) {
                    $changes['cus_com_pmoq'] = array(
                        'old' => $old_com['cus_com_pmoq'],
                        'new' => $new_com['cus_com_pmoq']
                    );
                }

                if ($old_com['cus_com_status_buy'] != $new_com['cus_com_status_buy']) {
                    $changes['cus_com_status_buy'] = array(
                        'old' => isset($value_labels['cus_com_status_buy'][$old_com['cus_com_status_buy']]) ?
                            $value_labels['cus_com_status_buy'][$old_com['cus_com_status_buy']] : $old_com['cus_com_status_buy'],
                        'new' => isset($value_labels['cus_com_status_buy'][$new_com['cus_com_status_buy']]) ?
                            $value_labels['cus_com_status_buy'][$new_com['cus_com_status_buy']] : $new_com['cus_com_status_buy']
                    );
                }

                if ($old_com['cus_com_status_sell'] != $new_com['cus_com_status_sell']) {
                    $changes['cus_com_status_sell'] = array(
                        'old' => isset($value_labels['cus_com_status_sell'][$old_com['cus_com_status_sell']]) ?
                            $value_labels['cus_com_status_sell'][$old_com['cus_com_status_sell']] : $old_com['cus_com_status_sell'],
                        'new' => isset($value_labels['cus_com_status_sell'][$new_com['cus_com_status_sell']]) ?
                            $value_labels['cus_com_status_sell'][$new_com['cus_com_status_sell']] : $new_com['cus_com_status_sell']
                    );
                }

                if ($old_com['cus_com_amountpurch'] != $new_com['cus_com_amountpurch']) {
                    $changes['cus_com_amountpurch'] = array(
                        'old' => isset($value_labels['cus_com_amountpurch'][$old_com['cus_com_amountpurch']]) ?
                            $value_labels['cus_com_amountpurch'][$old_com['cus_com_amountpurch']] : $old_com['cus_com_amountpurch'],
                        'new' => isset($value_labels['cus_com_amountpurch'][$new_com['cus_com_amountpurch']]) ?
                            $value_labels['cus_com_amountpurch'][$new_com['cus_com_amountpurch']] : $new_com['cus_com_amountpurch']
                    );
                }

                if (!empty($changes)) {
                    $commodity_log_data[$com_name] = $changes;
                }
            }
        }

        // Log commodity changes if any
        if (!empty($commodity_log_data)) {
            $log_data = array(
                'Customer ID' => $cus_id,
                'Commodity Changes' => $commodity_log_data
            );

            log_admin_edit('45', 'User Registration - Commodities', array(), $log_data, 'Admin - Updated commodity settings for Customer Id: ' . $cus_id);
        }
    }
}
