<?php
defined('BASEPATH') OR exit('No direct script access allowed');

if (!function_exists('get_field_labels')) {
    /**
     * Get field labels mapping for user-friendly display
     * @return array - Array containing field name to label mappings
     */
    function get_field_labels() {
        return array(
            // Advertisement fields
            'adv_id' => 'Advertisement ID',
            'adv_name' => 'Advertisement Name',
            'adv_type' => 'Advertisement Type',
            'adv_status' => 'Advertisement Status',
            'adv_sequence' => 'Sequence',
            'adv_location' => 'Location',
            

            //Trader details

            'cus_regtype'=>'Register Type',
            'cus_name' => 'Trader Name',
            'cus_alise_name'=>'Alias Name',
            'cus_name2' =>'Customer Name 2',
            'cus_mobile2'=>'Mobile No',
            'cus_company_name'=> 'Company Name',
            'customer_type'=>'Trader type',
            'cus_mobile'=>'Mobile No',
            'cus_email'=>'E-Mail Id',
            'cus_whatsapp'=>'Whats App No',
            'cus_tcstds'=>'Business Type',
            'cus_address'=>'Address',
            'cus_city'=>'City',
            'cus_gstno'=>'GST No',
            'cus_panno'=>'Pan No',
            'cus_remarks'=>'Remarks',
            'cus_sms_status'=>'Send SMS to the customer',
            'cus_email_status'=>'Send Email to the customer',
            'cus_phone1'=>'Office No. 1',
            'cus_phone2'=>'Office No. 2',
            'cus_res_phone'=>'Residence No.',
            'cus_bnkname'=>'Bank Name',
            'cus_bnkbranch'=>'Branch',
            'cus_accno'=>'A/C No',
            'cus_ifsc'=>'IFSC Code',
            'cus_tin_no'=>'Tin No',
            'cus_ifsc'=>'Reference',
            'cus_login_name'=>'Login Name',
            'cus_sec_code'=>'Security Code',
            'cus_login_password'=>'Password',
            'cus_login_con_password'=>'Retype Password',



            //User Activation

            'cus_id'=>'Trader ID',
            'cus_is_life_time' =>'Life time validity',
            'cus_valid_till'=>'Valid till',
            'cus_active'=>'Activate',
            'cus_limitenable'=>'Limit Enable',
            'opening_balance'=>'Opening Balance',
            'gold_min_qty'=>'Gold Min Qty',
            'silver_min_qty'=>'Silver Min Qty',
            'gold_max_qty'=>'Gold Max Qty',
            'silver_max_qty'=>'Silver Max Qty',
            'gold_allot_qty'=>'Gold Max Alloted Qty',
            'silver_allot_qty'=>'Silver Max Alloted Qty',
            'cus_email_status'=>'Email to the customer',

            'has_gminqty'=>'Gold Min Qty Checkbox',
            'has_sminqty'=>'Silver Min Qty Checkox',
            'has_gmaxqty'=>'Gold Max Qty Checkox',
            'has_smaxqty'=>'Silver Max Qty Checkox',
            'has_gallot_qty'=>'Gold Max Alloted Qty Checkox',
            'has_sallot_qty'=>'Silver Max Alloted Qty Checkox',


            //Admin R Panel

            'rpsg_weight'=>'Gold Weight',
            'rpss_weight'=> 'Silver Weight',
            'rpsg_roundoff'=> 'Gold Round Off',
            'rpss_roundoff'=>'Silver Round Off',

            
            // Admin user fields
            'admin_user_id' => 'User ID',
            'admin_user_name' => 'Username',
            'admin_user_password' => 'Password',
            'admin_ip' => 'IP Address',
            'admin_ip_restricted' => 'IP Restricted',
            'admin_is_sms' => 'SMS Enabled',
            'admin_sec_code' => 'Security Code',
            'admin_validity_date' => 'Validity Date',
            'admin_status' => 'Status',
            'admin_showalert' => 'Show Alert',
            'admin_alertdays' => 'Alert Days',
            'admin_alertmessage' => 'Alert Message',
            'disable_rpaneledit' => 'Disable RPanel Edit',
            
            // Admin Information fields
            'ai_sno' => 'Admin Info ID',
            'ai_text' => 'Text',
            'ai_active' => 'Active',
            
            // Area fields
            'ar_sno' => 'Area Code',
            'ar_name' => 'Area Name',
            'ar_active' => 'Active',
            
            // Category fields
            'cat_id' => 'Category ID',
            'cat_name' => 'Category Name',
            'cat_desc' => 'Description',
            'cat_image' => 'Image',
            'cat_avail_product' => 'Available Product',
            'cat_status' => 'Status',
            
            // Client fields
            'id_client' => 'Client ID',
            'code' => 'Code',
            'client' => 'Client Name',
            'name' => 'Name',
            'onesignalid' => 'OneSignal ID',
            'onesignalapi' => 'OneSignal API',
            'firebaseserverkey' => 'Firebase Server Key',
            'smssenderid' => 'SMS Sender ID',
            'baseurl' => 'Base URL',
            'orderexeurl' => 'Order Execution URL',
            'limitexpireurl' => 'Limit Expire URL',
            'tradeonoffurl' => 'Trade On/Off URL',
            'requiredhighlowalert' => 'Require High/Low Alert',
            'higlowalertsettings_gold_up' => 'Gold Up Alert',
            'higlowalertsettings_gold_down' => 'Gold Down Alert',
            'higlowalertsettings_silver_up' => 'Silver Up Alert',
            'higlowalertsettings_silver_down' => 'Silver Down Alert',
            'gold_contract' => 'Gold Contract',
            'silver_contract' => 'Silver Contract',
            'bank_gold_contract' => 'Bank Gold Contract',
            'bank_silver_contract' => 'Bank Silver Contract',
            'exchange_rate' => 'Exchange Rate',
            'alertfor' => 'Alert For',
            'alert_from' => 'Alert From',
            'alert_to' => 'Alert To',
            'ratealert' => 'Rate Alert',
            'highlow' => 'High/Low',
            'status' => 'Status',
            
            // Commodity fields
            'com_id' => 'Commodity ID',
            'com_name' => 'Commodity Name',
            'com_type' => 'Type',
            'com_weight' => 'Weight',
            'com_other_charges' => 'Other Charges',
            'com_display_purity' => 'Display Purity',
            'com_correction_type' => 'Correction Type',
            'com_active' => 'Active',
            'com_sel_premium' => 'Selling Premium',
            'com_buy_premium' => 'Buying Premium',
            'com_tax' => 'Tax',
            'com_octroi' => 'Octroi',
            'com_stamduty' => 'Stamp Duty',
            'com_isregion' => 'Is Region',
            'com_calpurity' => 'Calculate Purity',
            'com_premium_type' => 'Premium Type',
            'com_order_number' => 'Order Number',
            'com_rest_wt' => 'Rest Weight',
            'com_wtdatetime' => 'Weight DateTime',
            'com_rest_weight' => 'Rest Weight',
            'add_status' => 'Add Status',
            'enable_commodity_sell' => 'Enable Sell',
            'enable_commodity_buy' => 'Enable Buy',
            'bar_selection' => 'Bar Selection',
            'com_bar_no' => 'Bar No',
            'com_bar_quantity' => 'Bar Quantity',
            'allowed_decimals' => 'Allowed Decimals',
            
            // Contract fields
            'contract_id' => 'Contract ID',
            'contract_symbol' => 'Symbol',
            'contract_name' => 'Name',
            'contract_type' => 'Type',
            'contract_base_rate' => 'Base Rate',
            'contract_status' => 'Status',
            'contract_mcx_code' => 'MCX Code',
            'contract_lot' => 'Lot',
            'contract_tick' => 'Tick',
            'contract_time' => 'Time',
            'contract_update_time' => 'Update Time',
            'contract_manual_rate' => 'Manual Rate',
            'contract_lgd_rate' => 'LGD Rate',
            'contract_mcx_rate' => 'MCX Rate',
            'contract_manual_time' => 'Manual Time',
            'contract_lgd_time' => 'LGD Time',
            'contract_mcx_time' => 'MCX Time',
            'contract_trade_type' => 'Trade Type',
            'contract_silver_rate' => 'Silver Rate',
            'contract_silver_bid_rate' => 'Silver Bid Rate',
            'contract_silver_time' => 'Silver Time',
            'contract_silver_trade_type' => 'Silver Trade Type',
            'contract_silver_manual_rate' => 'Silver Manual Rate',
            'contract_silver_lgd_rate' => 'Silver LGD Rate',
            'contract_silver_mcx_rate' => 'Silver MCX Rate',
            'contract_silver_manual_time' => 'Silver Manual Time',
            'contract_silver_lgd_time' => 'Silver LGD Time',
            'contract_silver_mcx_time' => 'Silver MCX Time',
            'contract_silver_lot' => 'Silver Lot',
            'contract_silver_tick' => 'Silver Tick',
            'contract_silver_mcx_code' => 'Silver MCX Code',
            'contract_silver_base_rate' => 'Silver Base Rate',
            'contract_active' => 'Active',
            'contract_com_group_id' => 'Commodity Group ID',
            'contract_com_id' => 'Commodity ID',
            'contract_com_name' => 'Commodity Name',
            'contract_com_type' => 'Commodity Type',
            'contract_com_weight' => 'Commodity Weight',
            'contract_com_other_charges' => 'Commodity Other Charges',
            'contract_com_display_purity' => 'Commodity Display Purity',
            'contract_com_correction_type' => 'Commodity Correction Type',
            'contract_com_active' => 'Commodity Active',
            'contract_com_sel_premium' => 'Commodity Selling Premium',
            'contract_com_buy_premium' => 'Commodity Buying Premium',
            'contract_com_tax' => 'Commodity Tax',
            'contract_com_octroi' => 'Commodity Octroi',
            'contract_com_stamduty' => 'Commodity Stamp Duty',
            'contract_com_isregion' => 'Commodity Is Region',
            'contract_com_calpurity' => 'Commodity Calculate Purity',
            'contract_com_premium_type' => 'Commodity Premium Type',
            'contract_com_order_number' => 'Commodity Order Number',
            'contract_com_rest_wt' => 'Commodity Rest Weight',
            'contract_com_wtdatetime' => 'Commodity Weight DateTime',
            'contract_com_rest_weight' => 'Commodity Rest Weight',
            'contract_add_status' => 'Contract Add Status',
            'contract_enable_commodity_sell' => 'Contract Enable Sell',
            'contract_enable_commodity_buy' => 'Contract Enable Buy',
            'status' => ' R panel Status',
            'userpage_disp_order' => 'Userpage Display Order',

            
            // General Settings fields
            'admin_company_name' => 'Company Name',
            'admin_mail_server' => 'Mail Server Name',
            'admin_mail_password' => 'Mail Server Password',
            'admin_sms_username' => 'SMS User Name',
            'admin_sms_password' => 'SMS Password',
            'admin_sms_authkey' => 'SMS Auth Key',
            'admin_sms_senderid' => 'SMS Sender Id',
            'admin_sendratexml' => 'XML Path',
            'gold_hedgecontract' => 'Gold Hedge Contract',
            'silver_hedgecontract' => 'Silver Hedge Contract',
            'gold_hedge_lot_qty' => 'Gold Hedge Min Lot',
            'silver_hedge_lot_qty' => 'Silver Hedge Min Lot',
            'is_hedge' => 'Enable Hedge',
            'admin_is_silver' => 'Display Silver Rate',
            'admin_is_coin' => 'Display Coin Rate',
            'is_trade' => 'Is Online buy/sell',
            'admin_booking' => 'Login Page',
            'confirmation_for' => 'Auto (Customer)',
            'confirmation_admin' => 'Auto (Admin)',
            'purchase_purity' => 'Purchase purity',
            'limit_cancellation' => 'Limit Cancellation',
            'trade_on_time' => 'Time',
            'trade_on' => 'Trade On',
            'trade_off' => 'Trade Off',
            'trade_off_time' => 'Trade Off Time',
            'display_margin' => 'Enable Margin',
            'margin_reverse_type' => 'Margin Squareoff',
            'expire_history' => 'Display trade history to users ',
            'auto_refresh' => 'Auto Refresh',
            'clientlimit_enable' => 'Display Client Limit',
            'admin_tcstdshint' => 'TCS/TDS Hint',
            'admin_stockmanage' => 'Stock Manage',
            'admin_mob1' => 'Mobile 1',
            'is_admin_mob1' => 'Mobile 1 Checkbox',
            'admin_mob2' => 'Mobile 2',
            'is_admin_mob2' => 'Mobile 2 CheckBox',
            'admin_mob3' => 'Mobile 3',
            'is_admin_mob3' => 'Mobile 3 CheckBox',
            'admin_mob4' => 'Mobile 4',
            'is_admin_mob4' => 'Mobile 4 CheckBox',
            'admin_mob5' => 'Mobile 5',
            'is_admin_mob5' => 'Mobile 5 CheckBox',
            'admin_mail' => 'Enquiry mail to',
            'opening_date' => 'Opening Date',
            'gold_open_qty' => 'Opening Qty(Gold in KG)',
            'gold_open_rate' => 'Opening Rate(Gold,1 Gram)',
            'silver_open_qty' => 'Opening Qty(Silver in KG)',
            'silver_open_rate' => 'Opening Rate(Silver,1 KG)',
            'tol_gold_high' => 'High(Gold)',
            'tol_gold_low' => 'Low(Gold)',
            'tol_silver_high' => 'High(Silver)',
            'tol_silver_low' => 'Low(Silver)',
            'limitcancel_goldtol' => 'Order cancellation limit(Gold in rs)',
            'limitcancel_silvertol' => 'Order cancellation limit(Silver in rs)',
            'gold_tol' => 'Gold Tolerance',
            'silver_tol' => 'Silver Tolerance',
            'tolerence' => 'Tolerance',
            'sms_message' => 'SMS Message',
            'clientview' => 'Client View',
            'lite_trade' => 'Is Trade',
            
            // Additional General Settings fields
            'confirmation_for' => 'Auto (Customer)',
            'confirmation_admin' => 'Auto (Admin)',
            'has_gminqty' => 'Gold Min Qty Checkbox',
            'has_sminqty' => 'Silver Min Qty Checkbox',
            'has_gmaxqty' => 'Gold Max Qty Checkbox',
            'has_smaxqty' => 'Silver Max Qty Checkbox',
            'has_gallot_qty' => 'Gold Max Alloted Qty Checkbox',
            'has_sallot_qty' => 'Silver Max Alloted Qty Checkbox',
            'max_order' => 'Max. allowed limits',
            'mjdta_gold_diff' => 'MJDTA Gold Difference',
            'mjdta_silver_diff' => 'MJDTA Silver Difference',
            'limit_cancellation' => 'Limit Cancellation',
            'limitcancel_time' => 'Limit Cancellation Time',
            'trade_on' => 'Trade On',
            'trade_on_time' => 'Trade On Time',
            'trade_off' => 'Trade Off',
            'trade_off_time' => 'Trade Off Time',
            'market_on' => 'Market On',
            'market_on_time' => 'Market On Time',
            'market_off' => 'Market Off',
            'market_off_time' => 'Market Off Time',
            'margin_reverse_type' => 'Margin Squareoff',
            'display_margin' => 'Enable Margin',
            'clientlimit_enable' => 'Display Client Limit',
            'days_expire' => 'Display trade history days',
            'auto_refresh' => 'Auto Refresh (minutes)',
            'admin_tcstdshint' => 'TCS/TDS Hint',
            'admin_stockmanage' => 'Stock Manage',
            'is_admin_mob1' => 'Mobile 1 Checkbox',
            'is_admin_mob2' => 'Mobile 2 Checkbox',
            'is_admin_mob3' => 'Mobile 3 Checkbox',
            'is_admin_mob4' => 'Mobile 4 Checkbox',
            'is_admin_mob5' => 'Mobile 5 Checkbox',
            'admin_mob1' => 'Mobile 1',
            'admin_mob2' => 'Mobile 2',
            'admin_mob3' => 'Mobile 3',
            'admin_mob4' => 'Mobile 4',
            'admin_mob5' => 'Mobile 5',
            'admin_mail' => 'Enquiry mail to',
            'opening_date' => 'Opening Date',
            'gold_open_qty' => 'Opening Qty(Gold in KG)',
            'gold_open_rate' => 'Opening Rate(Gold,1 Gram)',
            'silver_open_qty' => 'Opening Qty(Silver in KG)',
            'silver_open_rate' => 'Opening Rate(Silver,1 KG)',
            'tol_gold_high' => 'Tolerance High(Gold)',
            'tol_gold_low' => 'Tolerance Low(Gold)',
            'tol_silver_high' => 'Tolerance High(Silver)',
            'tol_silver_low' => 'Tolerance Low(Silver)',
            'limitcancel_goldtol' => 'Order cancellation limit(Gold in rs)',
            'limitcancel_silvertol' => 'Order cancellation limit(Silver in rs)',
            'gold_tol' => 'Gold Tolerance',
            'silver_tol' => 'Silver Tolerance',
            'is_hedge_gold' => 'Enable Gold Hedge',
            'is_hedge_silver' => 'Enable Silver Hedge',
            'gold_hedge_lot_qty' => 'Gold Hedge Min Lot',
            'silver_hedge_lot_qty' => 'Silver Hedge Min Lot',
            'gold_booking_adjusted_qty' => 'Gold Hedge Adjusted Qty',
            'silver_booking_adjusted_qty' => 'Silver Hedge Adjusted Qty',

            // Hedge Master fields
            'hm_id' => 'Hedge ID',
            'hm_fromslots' => 'From Slots',
            'hm_toslots' => 'To Slots',
            'hm_commodity' => 'Commodity',
            'hm_com_type' => 'Commodity Type',
            'hm_hedgetype' => 'Hedge Type',
            'hm_hedgesymbol' => 'Hedge Symbol',
            'hm_roundoff_enabled' => 'Round Off Enabled',
            'hm_roundoff' => 'Round Off',
            'hm_hedgestatus' => 'Hedge Status',
            'hm_apiurl' => 'API URL',
            
            // Marquee Text fields
            'mrq_sno' => 'Marquee ID',
            'mrq_text' => 'Marquee Text',
            'mrq_active' => 'Active',
            
            // Bank fields
            'bnk_code' => 'Bank Code',
            'bnk_name' => 'Bank Name',
            'bnk_branch' => 'Branch',
            'bnk_accno' => 'Account No',
            'bnk_status' => 'Status',
            
            // Gallery fields
            'gal_id' => 'Gallery ID',
            'gal_name' => 'Gallery Name',
            'gal_type' => 'Gallery Type',
            'gal_location' => 'Gallery File',
            'gal_status' => 'Gallery Status',
            
            // App Events fields
            'appeven_id' => 'Event ID',
            'event_name' => 'Event Name',
            'event_description' => 'Event Description',
            'event_status' => 'Event Status',
            
            // App Video fields
            'appvideo_id' => 'Video ID',
            'video_name' => 'Video Name',
            'video_descriptions' => 'Video Descriptions',
            'video_id' => 'Video Youtube ID',
            'video_type' => 'Video Type',
            
            // Commodity Group fields
            'com_group_id' => 'Commodity Group ID',
            'com_group_name' => 'Commodity Group Name',
            'com_group_desc' => 'Commodity Group Description',
            'com_group_active' => 'Commodity Group Active',
            'com_group_com' => 'Commodity Group Commodity',
            'com_buy_active' => 'Buying Active',
            'com_sel_active' => 'Selling Active',
            'com_premium_type' => 'Premium Type',
            'com_buy_premium' => 'Buy Premium',
            'com_sel_premium' => 'Sell Premium',
            'com_buy_trade' => 'Trade(Buy)',
            'com_sel_trade' => 'Trade(Sell)',
            'com_delverydays' => 'Delivery Days',
            
            // Contract Symbol fields
            'contract_symbol' => 'Contract Symbol',
            'contractsymbol_status' => 'Contract Symbol Status',
            
            // Customer Group fields
            'cgrp_id' => 'Customer Group ID',
            'cgrp_entrydate' => 'Entry Date',
            'cgrp_effectivedate' => 'Effective Date',
            
            // Denomination fields
            'den_code' => 'Denomination Code',
            'den_name' => 'Denomination',
            'den_orderno' => 'Order No',
            'den_status' => 'Denomination Status',
            
            // Email Settings fields
            'service_id' => 'Service ID',
            'serv_name' => 'Service Name',
            'email_signature' => 'Subject',
            'email_content' => 'E-Mail Content',
            
            // Fund Transfer fields
            'fd_id' => 'Fund Transfer ID',
            'ft_intcode' => 'Customer Name',
            'ft_date' => 'Date',
            'ft_from' => 'From A/c',
            'ft_to' => 'To A/c',
            'ft_balance_amt' => 'Balance',
            'ft_amount' => 'Amount',
            'ft_balance' => 'Balance',
            
            // Customer Service fields
            'serv_group_id' => 'Service Group ID',
            'serv_group_name' => 'Group Name',
            'serv_group_header' => 'Header',
            'serv_group_email' => 'Email',
            'serv_group_sms' => 'SMS',
            'serv_group_desc' => 'Description',
            'serv_group_active' => 'Active',
            'csg_cusid' => 'Customer',
            
            // R Panel Settings fields
            'h_colour' => 'High Colour',
            'l_colour' => 'Low Colour',
            'confirm_time' => 'Duration',
            'trans_period' => 'Transaction Period',
            'confirmation_for' => 'Auto',
            'margin_type' => 'Margin in terms of',

            //Margin Management

            'mar_customer'=>'Customer Name',
            'available_balance'=>'Available Balance',
            'mar_amount'=>'Margin Amount',
            'mar_mode'=>'Payment Type',
            'mar_naration'=>'Naration',

            //User SMS
            'serv_group_number'=>'Mobile Number',
            'serv_group_desc'=>'Text',


            
            // SMS API fields
            'sas_id' => 'SMS API ID',
            'sas_desc' => 'Description',
            'sas_url' => 'SMS URL',
            
            // Services fields
            'serv_id' => 'Service ID',
            'serv_email' => 'Email',
            'serv_sms' => 'SMS',
            'serv_whatsapp' => 'Whatsapp',
            
            // Popup Settings fields
            'pop_id' => 'Popup ID',
            'pop_name' => 'Popup Name',
            'pop_image' => 'Popup Image',
            'pop_active' => 'Active',
            
            // Mobile Events fields
            'eve_id' => 'Event ID',
            'eve_name' => 'Event Name',
            'eve_date' => 'Event Date',
            'eve_timeam' => 'Event Auspicious Time(AM)',
            'eve_timepm' => 'Event Auspicious Time(PM)',
            'eve_description' => 'Event Description',
            
            // Notification fields
            'notification_heading' => 'Title',
            'notification_message' => 'Message',
            'notification_image' => 'Notification Image',
            
            // R Panel Commodity fields
            'rcom_id' => 'R-Panel Commodity ID',
            'rcom_disname' => 'Display Name',
            'rcom_comtype' => 'Commodity Type',
            'rcom_mcxsymbol' => 'MCX Symbol',
            'rcom_banksymbol' => 'Bank Symbol',
            'rcom_sell_tax' => 'Sell Tax %',
            'rcom_buy_tax' => 'Buy Tax %',
            'rcom_sell_tcs' => 'Sell TCS %',
            'rcom_buy_tcs' => 'Buy TCS %',
            'rcom_orderno' => 'Sequence Number',
            'rcom_status' => 'Active',
            'rcom_contname' => 'Contract Name',
            'rcom_contdisplay' => 'Contract Active',
            
            // R Panel Bank fields
            'bcontract_id' => 'R-Panel Bank ID',
            'bcontract_symbol' => 'R-Panel Bank Commodity Name',
            'bcontract_rate' => 'Bank Contract',
            'bconvert_value' => 'Convert Value',
            'bconvert_value_type' => 'Convert Value Type',
            'bextra_charges' => 'Extra Charges',
            'bextra_type' => 'Extra Value Type',
            'b_orderno' => 'Sequence Number',
            'bcontract_status' => 'Active',
            
            // Premium Group fields
            'prem_group_id' => 'Premium Group ID',
            'prem_group_name' => 'Group Name',
            'prem_group_active' => 'Active',
            'prem_group_desc' => 'Description',
            'prem_group_com' => 'Premium Group Commodity',
            'prem_id' => 'Premium ID',
            'prem_name' => 'Commodity Name',
            'prem_comsell_active' => 'Sell Active',
            'prem_combuy_active' => 'Buy Active',
            'prem_buy_premium' => 'Buy Discount',
            'prem_sel_premium' => 'Sell Discount',
            'limit_buy_premium' => 'Buy Discount Limit',
            'limit_sel_premium' => 'Sell Discount Limit',
            'prem_expirydate' => 'Expiry Date',


            //Unifix

            'amount'=>'Amount',
            'pure_weight'=>'Pure Weight',
            'rate'=>'Rate',
            'date'=>'Date',


            
            // Commodity Group Weight fields
            'com_group_wt' => 'Commodity Group Weight',
            'com_totalweight' => 'Weight (gms)',
            
            // News fields
            'news_id' => 'News ID',
            'news_title' => 'Title',
            'news_description' => 'Description',
            'news_date' => 'Date',
            'news_status' => 'Status',
            'news_image' => 'Image',
            'news_link' => 'Link',
            'news_type' => 'Type',
            'news_sequence' => 'Sequence',
            
            // Customer commodity fields
            'cus_com_status_buy' => 'Commodity Buy Status',
            'cus_com_status_sell' => 'Commodity Sell Status',
            'cus_com_amountpurch' => 'Commodity Amount Purchase',
            'cus_com_smoq' => 'Commodity SMOQ',
            'cus_com_pmoq' => 'Commodity PMOQ',
            
            // Booking fields
            'book_no' => 'Booking Number',
            'book_cusid' => 'Customer ID',
            'book_datetime' => 'Booking Date & Time',
            'book_comid' => 'Commodity ID',
            'book_type' => 'Transaction Type',
            'book_comtype' => 'Commodity Type',
            'book_qty' => 'Quantity',
            'book_bar_type' => 'Bar Type',
            'book_no_bar' => 'Number of Bars',
            'book_rate' => 'Rate',
            'book_comweight' => 'Commodity Weight',
            'book_totalcost' => 'Total Cost',
            'book_marginhold' => 'Margin Hold',
            'book_margin_takenqty' => 'Margin Taken Quantity',
            'book_margin' => 'Margin',
            'book_margintype' => 'Margin Type',
            'book_confirmedon' => 'Confirmed On',
            'book_status' => 'Booking Status',
            'book_fixtype' => 'Fix Type',
            'book_marginqty' => 'Margin Quantity',
            'book_marginstatus' => 'Margin Status',
            'book_physicalqty' => 'Physical Quantity',
            'book_hedgqty' => 'Hedge Quantity',
            'orderplacedtime' => 'Order Placed Time',
            'ordervalidity' => 'Order Validity',
            'ordertype' => 'Order Type',
            'orderstatus' => 'Order Status',
            'delete_status' => 'Delete Status',
            'book_by' => 'Booked By',
            'book_transfer' => 'Transfer',
            'book_transfer_from' => 'Transfer From',
            'book_transfered_on' => 'Transfered On',
            'book_naration' => 'Narration',
            'order_liveprice' => 'Order Live Price',
            'order_actualprice' => 'Order Actual Price',
            'book_liveprice' => 'Live Price',
            'remarks' => 'Remarks',
            'book_deviceid' => 'Device ID',
            'user_agent' => 'User Agent',
            'book_useripaddress' => 'User IP Address',
            'book_adminipaddress' => 'Admin IP Address',
            'book_adminuser' => 'Admin User',
            'is_unfix' => 'Unfix Status',
            'email_sent' => 'Email Sent',
            'entry_date' => 'Entry Date',
            'purity' => 'Purity',
            'book_branch' => 'Branch',
            'book_branchadmin' => 'Branch Admin',
            'value_datetime' => 'Value Date Time',
            'valuedate_narration' => 'Value Date Narration',
            'book_bnkfixtype' => 'Bank Fix Type',
            'book_ozvalue' => 'Ounce Value',
            'book_ozfixtype' => 'Ounce Fix Type',
            'book_ozpremium' => 'Ounce Premium',
            'book_bnkconv' => 'Bank Conversion',
            'book_bnkinrval' => 'Bank INR Value',
            'book_inrfixtype' => 'INR Fix Type',
            'book_bnktaxval' => 'Bank Tax Value',
            'book_bnktaxtype' => 'Bank Tax Type',
            'book_bnkinrpre' => 'Bank INR Premium',
            'book_bnkcustom' => 'Bank Custom',
            'dollar_fixedrate' => 'Dollar Fixed Rate',
            'inr_fixedrate' => 'INR Fixed Rate',
            'book_pricefrom' => 'Price From',
            'book_bnkfixrate' => 'Bank Fix Rate',
            'book_bnkfixtotrate' => 'Bank Fix Total Rate',
            'book_bnkpurity' => 'Bank Purity',
            'book_buydiscount' => 'Buy Discount',
            'book_buyexcharge' => 'Buy Extra Charge',
            'book_ishedge' => 'Is Hedged',
            'book_premdiscount' => 'Premium Discount',
            'book_narration' => 'Narration',
            'book_request_amtwt' => 'Request Amount/Weight',
            'book_usercomment' => 'User Comment',
            'book_hedgemanual' => 'Manual Hedge',
            'unfix' => 'Unfix',
            'book_unfixclose' => 'Unfix Close',
            'book_deliverydate' => 'Book Delivery Date'
        );
    }
}

if (!function_exists('get_field_value_labels')) {
    /**
     * Get field value labels mapping for user-friendly display of values
     * @return array - Array containing field name to value label mappings
     */
    function get_field_value_labels() {
        return array(
            // Boolean fields that should show Yes/No
            'admin_status' => array(1 => 'Yes', 0 => 'No'),
            'admin_ip_restricted' => array(1 => 'Yes', 0 => 'No'),
            'admin_is_sms' => array(1 => 'Yes', 0 => 'No'),
            'admin_showalert' => array(1 => 'Yes', 0 => 'No'),
            'disable_rpaneledit' => array(1 => 'Yes', 0 => 'No'),
            'ar_active' => array(1 => 'Yes', 0 => 'No'),
            'cat_status' => array(1 => 'Yes', 0 => 'No'),
            'cat_avail_product' => array(1 => 'Yes', 0 => 'No'),
            'requiredhighlowalert' => array(1 => 'Yes', 0 => 'No'),
            'com_active' => array(1 => 'Yes', 0 => 'No'),
            'com_isregion' => array(1 => 'Yes', 0 => 'No'),
            'contract_active' => array(1 => 'Yes', 0 => 'No'),
            'contract_com_active' => array(1 => 'Yes', 0 => 'No'),
            'contract_enable_commodity_sell' => array(1 => 'Yes', 0 => 'No'),
            'contract_enable_commodity_buy' => array(1 => 'Yes', 0 => 'No'),
            'enable_commodity_sell' => array(1 => 'Yes', 0 => 'No'),
            'enable_commodity_buy' => array(1 => 'Yes', 0 => 'No'),
            'add_status' => array(1 => 'Yes', 0 => 'No'),
            'status' => array(1 => 'Active', 0 => 'Inactive'),
            'adv_status' => array(1 => 'Active', 0 => 'Inactive'),
            'clientview' => array(1 => 'Yes', 0 => 'No'),
            'bnk_status' => array(1 => 'Active', 0 => 'Inactive'),
            'gal_status' => array(1 => 'Active', 0 => 'Inactive'),
            'event_status' => array(1 => 'Active', 0 => 'Inactive'),
            'com_group_active' => array(1 => 'Yes', 0 => 'No'),
            'contractsymbol_status' => array(1 => 'Active', 0 => 'Inactive'),
            'den_status' => array(1 => 'Active', 0 => 'Inactive'),
            'serv_group_email' => array(1 => 'Yes', 0 => 'No'),
            'serv_group_sms' => array(1 => 'Yes', 0 => 'No'),
            'serv_group_active' => array(1 => 'Yes', 0 => 'No'),
            'video_type' => array(1 => 'Yes', 0 => 'No'),
            'mrq_active' => array(1 => 'Yes', 0 => 'No'),
            'ai_active' => array(1 => 'Yes', 0 => 'No'),
            'pop_active' => array(1 => 'Yes', 0 => 'No'),
            'rcom_status' => array(1 => 'Yes', 0 => 'No'),
            'rcom_contdisplay' => array(1 => 'Yes', 0 => 'No'),
            'bcontract_status' => array(1 => 'Yes', 0 => 'No'),
            'prem_group_active' => array(1 => 'Yes', 0 => 'No'),
            'prem_comsell_active' => array(1 => 'Yes', 0 => 'No'),
            'prem_combuy_active' => array(1 => 'Yes', 0 => 'No'),
            'bar_selection' => array(1 => 'Yes', 0 => 'No'),
            'cus_active'=>array(1 => 'Yes', 0 => 'No'),
            'cus_limitenable'=>array(1 => 'Yes', 0 => 'No'),
            'cus_tcstds'=>array(1 => 'Yes', 0 => 'No'),
            'margin_reverse_type'=>array(1 => 'Yes', 0 => 'No'),
            'display_margin'=>array(1 => 'Yes', 0 => 'No'),
            'clientlimit_enable'=>array(1 => 'Yes', 0 => 'No'),
            'com_sel_active' => array(1 => 'Yes', 0 => 'No'),
            'com_buy_active' => array(1 => 'Yes', 0 => 'No'),
            'com_sel_trade' => array(1 => 'Yes', 0 => 'No'),
            'com_buy_trade' => array(1 => 'Yes', 0 => 'No'),
            
            // Other fields with specific value mappings
            'admin_alertdays' => array(
                1 => '1 Day', 2 => '2 Days', 3 => '3 Days', 4 => '4 Days', 5 => '5 Days',
                6 => '6 Days', 7 => '7 Days', 14 => '14 Days', 30 => '30 Days'
            ),
            'com_type' => array(1 => 'Gold', 2 => 'Silver'),
            'contract_type' => array(1 => 'Gold', 2 => 'Silver'),
            'contract_trade_type' => array(0 => 'MCX', 1 => 'LGD', 2 => 'Manual'),
            'contract_silver_trade_type' => array(0 => 'MCX', 1 => 'LGD', 2 => 'Manual'),
            'news_type' => array(1 => 'News', 2 => 'Alert', 3 => 'Promotion'),
            'highlow' => array(1 => 'High', 0 => 'Low'),
            'gal_type' => array(0 => 'GOLD BAR', 1 => 'SILVER BAR'),
            'confirmation_for' => array(0 => 'Rejection', 1 => 'Confirmation', 2 => 'Hold'),
            'margin_type' => array(0 => 'Percentage', 1 => 'Value'),
            'h_colour' => array(0 => 'Red', 1 => 'Green', 2 => 'Blue'),
            'l_colour' => array(0 => 'Red', 1 => 'Green', 2 => 'Blue'),
            'rcom_comtype' => array(0 => 'Gold', 1 => 'Silver'),
            'bconvert_value_type' => array(1 => '+', 2 => '-', 3 => '*', 4 => '/'),
            'bextra_type' => array(1 => '+', 2 => '-', 3 => '*', 4 => '/'),
            'com_premium_type' => array(1 => 'Manual', 0 => 'Auto'),
            'mar_mode' => array(0 => 'Cash', 1 => 'Bank Deposit',2=>'Bank Transfer'),
            'customer_type' => array(0 => 'Both Customer & Supplier', 1 => 'Customer (Buyer)',2=>'Supplier (Seller)'),
            'purchase_purity' => array(-1 => 'Not Selected', 0 => '995', 1 => '999'),

            //For Check box
            'cus_sms_status' => array(0 => 'OFF', 1 => 'ON'),
            'cus_email_status' => array(0 => 'OFF', 1 => 'ON'),
            'cus_is_life_time' => array(0 => 'OFF', 1 => 'ON'),
            'has_gminqty'=>array(0 => 'OFF', 1 => 'ON'),
            'has_sminqty'=>array(0 => 'OFF', 1 => 'ON'),
            'has_gmaxqty'=>array(0 => 'OFF', 1 => 'ON'),
            'has_smaxqty'=>array(0 => 'OFF', 1 => 'ON'),
            'has_gallot_qty'=>array(0 => 'OFF', 1 => 'ON'),
            'has_sallot_qty'=>array(0 => 'OFF', 1 => 'ON'),
            'expire_history'=>array(0 => 'OFF', 1 => 'ON'),
            'is_admin_mob1'=>array(0 => 'OFF', 1 => 'ON'),
            'is_admin_mob2'=>array(0 => 'OFF', 1 => 'ON'),
            'is_admin_mob3'=>array(0 => 'OFF', 1 => 'ON'),
            'is_admin_mob4'=>array(0 => 'OFF', 1 => 'ON'),
            'is_admin_mob5'=>array(0 => 'OFF', 1 => 'ON'),
            'lite_trade'=>array(0 => 'OFF', 1 => 'ON'),
            
            // Radio button value mappings
            'confirmation_admin' => array(1 => 'Confirmation', 2 => 'Hold'),
            'limit_cancellation' => array(0 => 'Manual', 1 => 'Auto'),
            'trade_on' => array(0 => 'Manual', 1 => 'Auto'),
            'trade_off' => array(0 => 'Manual', 1 => 'Auto'),
            'market_on' => array(0 => 'Manual', 1 => 'Auto'),
            'market_off' => array(0 => 'Manual', 1 => 'Auto'),
            'display_margin' => array(1 => 'Yes', 0 => 'No'),
            'clientlimit_enable' => array(1 => 'Yes', 0 => 'No'),
            'is_hedge_gold' => array(1 => 'Yes', 0 => 'No'),
            'is_hedge_silver' => array(1 => 'Yes', 0 => 'No'),
            'margin_reverse_type' => array(0 => 'Yes', 1 => 'No'),
            'admin_booking' => array(1 => 'Yes', 0 => 'No'),
            'admin_is_silver' => array(1 => 'Yes', 0 => 'No'),
            'admin_is_coin' => array(1 => 'Yes', 0 => 'No'),
            
            // Customer commodity fields
            'cus_com_status_buy' => array(1 => 'Enabled', 0 => 'Disabled'),
            'cus_com_status_sell' => array(1 => 'Enabled', 0 => 'Disabled'),
            'cus_com_amountpurch' => array(1 => 'Enabled', 0 => 'Disabled'),
            
            // Booking value labels
            'book_type' => array(0 => 'Sell', 1 => 'Buy'),
            'book_status' => array(0 => 'Pending', 1 => 'Confirmed', 2 => 'Cancelled'),
            'book_by' => array(1 => 'App', 2 => 'Browser', 3 => 'Admin'),
            'book_bar_type' => array(0 => 'Standard Bar', 1 => 'Custom Bar'),
            'book_margintype' => array(0 => 'Regular', 1 => 'Special'),
            'book_fixtype' => array(0 => 'Fixed', 1 => 'Floating'),
            'book_ishedge' => array(0 => 'No', 1 => 'Yes'),
            'is_unfix' => array(0 => 'No', 1 => 'Yes'),
            'unfix' => array(0 => 'No', 1 => 'Yes')
        );
    }
}

/**
 * Transform technical field names to user-friendly labels in an array
 * @param array $data - The data array to transform
 * @return array - Transformed array with user-friendly keys
 */
if (!function_exists('transform_booking_data_for_logging')) {
    function transform_booking_data_for_logging($data) {
        // Define user-friendly labels for booking-related fields
        $booking_labels = array(
            'status' => 'Booking Status',
            'confirm_type' => 'Confirmation Type',
            'book_no' => 'Booking Number',
            'book_qty' => 'Booking Quantity',
            'book_rate' => 'Booking Rate',
            'message' => 'System Message',
            'success' => 'Operation Success',
            'limitupdate' => 'Limit Update Triggered',
            'book_no' => 'Booking Number',
            'bookupdate' => 'Booking Update Triggered',
            'confirm_type' => 'Confirmation Type'
        );
        
        // Get existing field labels
        $field_labels = get_field_labels();
        
        // Merge booking labels with existing field labels
        $all_labels = array_merge($field_labels, $booking_labels);
        
        // Transform the data array
        $transformed_data = array();
        foreach ($data as $key => $value) {
            // Use the label if it exists, otherwise keep the original key
            $label = isset($all_labels[$key]) ? $all_labels[$key] : $key;
            
            // If the value is an array, recursively transform it
            if (is_array($value)) {
                $transformed_data[$label] = transform_booking_data_for_logging($value);
            } else {
                $transformed_data[$label] = $value;
            }
        }
        
        return $transformed_data;
    }
}
