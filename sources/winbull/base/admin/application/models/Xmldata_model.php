<?php
class Xmldata_model extends CI_Model {

	public function __construct()
	{
		parent::__construct();	
		$this->load->helper('common');
	}	
	function index()
	{
		
	}
	
	function load_xmldata() {
		echo readfile("rpanel_xml/rateXml.xml");
	}
	// function gold_conversion($con_value, $com_weight) {
	// 	$con_value = $con_value == '' ? 0 : $con_value;
	// 	return ($con_value * (10 / $com_weight));
	// }
	function gold_conversion($con_value, $com_weight) {
		$con_value = $con_value == '' ? 0 : $con_value;
		if ($com_weight == 0) {
			return 0;
		}
		return ($con_value * (10 / $com_weight));
	}

	function silver_conversion($con_value, $com_weight) {
		$con_value = $con_value == '' ? 0 : $con_value;
		if ($com_weight == 0) {
			return 0;
		}
		return ($con_value * (1000 / $com_weight));
	}
	

	// function silver_conversion($con_value, $com_weight) {
	// 	$con_value = $con_value == '' ? 0 : $con_value;
	// 	return ($con_value * (1000 / $com_weight));
	// }
	function getrpaneldata(){
		$returndata = array();
		$rpanelquery = $this->db->query("SELECT id, rate_display, market_status, 
										date_format(lastupdatetime, '%d-%m-%Y %h:%i:%s') as lastupdatetime, 
										ifnull(market_message,'') as message, updateon, userupdatetime, usercheckupdatetime FROM dt_r_panel, dt_generalsettings");
		$rpaneldata = $rpanelquery->result_array();
		$rpanelquery->free_result();
		$rpanelsetting = $this->db->query("SELECT * FROM dt_generalrpsettings");
		$rpanelsettings = array('rpsg_weight' => $rpanelsetting->row()->rpsg_weight, 'rpss_weight' => $rpanelsetting->row()->rpss_weight, 'rpsg_roundoff' => $rpanelsetting->row()->rpsg_roundoff, 'rpss_roundoff' => $rpanelsetting->row()->rpss_roundoff);
		$rpanelsetting->free_result();
		
		$rpanelbankquery = $this->db->query("SELECT *, if(showdiff = 1, biddiff, 0) as biddiff, 
											if(showdiff = 1, askdiff, 0) as askdiff 
											FROM dt_bankcontractmaster 
											LEFT JOIN (SELECT * FROM dt_rpanelbank GROUP BY banksymbol) AS rpb ON rpb.banksymbol = bcontract_id 
											LEFT JOIN dt_contractmaster ON contract_symbol = bcontract_rate
											WHERE bcontract_status = 1 ORDER BY b_orderno");
		foreach($rpanelbankquery->result() as $rpbankrow){
			$rpanel_display_bankrates[] = array("bcontract_id" => $rpbankrow->bcontract_id, "bcontract_symbol" => $rpbankrow->bcontract_symbol, "bcontract_rate" => $rpbankrow->bcontract_rate, "bconvert_value" => $rpbankrow->bconvert_value, "bconvert_value_type" => $rpbankrow->bconvert_value_type, "bextra_charges" => $rpbankrow->bextra_charges, "bextra_type" => $rpbankrow->bextra_type, "bbase_rate" => $rpbankrow->bbase_rate, "btax_type" => $rpbankrow->taxtype, "btax_value" => $rpbankrow->tax, "efp" => $rpbankrow->efp, "premium" => $rpbankrow->premium, "rupeepremium" => $rpbankrow->rupeepremium, "custom" => $rpbankrow->custom, "octroi" => $rpbankrow->octroi, "pure" => $rpbankrow->pure, "biddiff" => $rpbankrow->biddiff, "askdiff" => $rpbankrow->askdiff, "tcs_tax" => $rpbankrow->tcs_tax);
		}
		$rpanelbankquery->free_result();
		$contractquery = $this->db->query("SELECT * FROM dt_contractmaster where status = 1 ORDER BY displayorder");
		foreach($contractquery->result() as $contractrow){
			$rpanel_display_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol, "displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder, 'userpage_status' => $contractrow->userpage_status, 'userpage_displayname' => $contractrow->userpage_displayname);
		}
		$contractquery->free_result();
		$rpanelcommodityquery = $this->db->query("SELECT rcom_id as comid, rcom_disname as dispname, 
													contract_symbol mcxcontract, 
													rcom_comtype as comtype, ifnull(trade_type,0) as tradetype, 
													ifnull(sell_diff,0) as selldiff, ifnull(buy_diff,0) as buydiff, 
													ifnull(sell_rate,0) as sellrate, bcontract_id, bcontract_rate, rcom_sell_diff_type, 
													rcom_buy_diff_type, rcom_sell_callpurity, 
													rcom_buy_callpurity, 
													rcom_sell_tax, rcom_buy_tax, is_gst, is_tcs,
													rcom_sell_tcs, rcom_buy_tcs    
													FROM dt_rpanelcommodities 
													LEFT JOIN dt_contractmaster ON contract_id = rcom_mcxsymbol 
													LEFT JOIN dt_bankcontractmaster ON bcontract_id = rcom_banksymbol 
													LEFT JOIN dt_rpanelcontract ON rpanelid = 1 AND rpanelcomid = rcom_id 
													WHERE rcom_status = 1 ORDER BY rcom_orderno ASC");
		foreach($rpanelcommodityquery->result() as $commodityrow){
			$rpanel_display_commodities[] = array("comid" => $commodityrow->comid, "dispname" => $commodityrow->dispname, "mcxcontract" => $commodityrow->mcxcontract, "comtype" => $commodityrow->comtype, "tradetype" => $commodityrow->tradetype, "selldiff" => $commodityrow->selldiff, "buydiff" => $commodityrow->buydiff, "sellrate" => $commodityrow->sellrate, "bcontract_id" => $commodityrow->bcontract_id, "bcontract_rate" => $commodityrow->bcontract_rate, "rcom_sell_diff_type" => $commodityrow->rcom_sell_diff_type, "rcom_buy_diff_type" => $commodityrow->rcom_buy_diff_type, "rcom_sell_callpurity" => $commodityrow->rcom_sell_callpurity, "rcom_buy_callpurity" => $commodityrow->rcom_buy_callpurity, "rcom_sell_tax" => $commodityrow->rcom_sell_tax, "rcom_buy_tax" => $commodityrow->rcom_buy_tax, "is_gst" => $commodityrow->is_gst,"is_tcs" => $commodityrow->is_tcs, "rcom_sell_tcs" => $commodityrow->rcom_sell_tcs, "rcom_buy_tcs" => $commodityrow->rcom_buy_tcs);
		}
		$rpanelcommodityquery->free_result();
		$contractchartquery = $this->db->query("SELECT * FROM dt_contractmaster");
		foreach($contractchartquery->result() as $contractrow){
			$rpanel_display_chart_contracts[] = array("contract_id" => $contractrow->contract_id, "contract_symbol" => $contractrow->contract_symbol,"com_type"=>$contractrow->com_type ,"aribitchart_status"=>$contractrow->aribitchart_status,"displayname" => $contractrow->displayname, "biddiff" => $contractrow->biddiff, "askdiff" => $contractrow->askdiff, "showdiff" => $contractrow->showdiff, "ctype" => $contractrow->ctype, "displayorder" => $contractrow->displayorder,'status'=>$contractrow->status, 'userpage_status' => $contractrow->userpage_status, 'userpage_displayname' => $contractrow->userpage_displayname);
		}
		$contractchartquery->free_result();
		return array('rpaneldata' => $rpaneldata[0], 'rpanelsettings' => $rpanelsettings, 'rpanelbank' => $rpanel_display_bankrates, 'rpanel_display_contracts' => $rpanel_display_contracts,'rpanel_display_chart_contracts'=>$rpanel_display_chart_contracts,  'rpanel_display_commodities' => $rpanel_display_commodities);
		//return $returndata;
	}
	function insertData() {
		//Get previous old records to compare and update in log table
		$oldRecord = $this->getrpaneldata();
		/*echo "<pre>";
		print_r($_POST);
		print_r($oldRecord);
		echo "</pre>";
		exit;*/
		/* R-Panel data update start here */
		$spl_char = array("&ldquo;","&nbsp;","&rdquo;","&quot;","\"","\xE2\x80\x9C","\xE2\x80\x9D");
		$rpanel_update_data = array();
		$rpanel_update_data = array('rate_display' => $_POST['fv']['rate_display'], 'lastupdatetime' => date('Y-m-d H:i:s'), 'updateon' => time(), 'userupdatetime' => time(), 'usercheckupdatetime' => time(), 'market_message' => str_replace($spl_char,"",$_POST["fv"]["market_closed"]));
		if(isset($_POST['fv']['marketstatus'])){
			$rpanel_update_data['market_status'] = $_POST['fv']['marketstatus'];
			$rpanel_update_data['market_message'] = str_replace($spl_char,"",$_POST["fv"]["market_closed"]);
		}else{
			$rpanel_update_data['market_status'] = 0;
		}
		$insertStatus = $this->db->update('dt_r_panel', $rpanel_update_data, array('id' => 1));
		
		// Create selective logging - only log rate display or market status changes
		if ($this->db->affected_rows() > 0) {   //new
			// Check if rate_display changed
			$old_rate_display = isset($oldRecord['rpaneldata']['rate_display']) ? $oldRecord['rpaneldata']['rate_display'] : 0;
			$new_rate_display = isset($_POST['fv']['rate_display']) ? $_POST['fv']['rate_display'] : 0;
			
			// Check if market_status changed
			$old_market_status = isset($oldRecord['rpaneldata']['market_status']) ? $oldRecord['rpaneldata']['market_status'] : 0;
			$new_market_status = isset($_POST['fv']['marketstatus']) ? $_POST['fv']['marketstatus'] : 0;
			
			// Log rate display changes if any
			if ($old_rate_display != $new_rate_display) {
				$old_label = $old_rate_display ? 'on' : 'off';
				$new_label = $new_rate_display ? 'on' : 'off';
				
				// Create log description in the format you requested
				$log_description = ' RPanel settings';
				
				// Log only the rate display change
				$old_values = array('Rate Display' => $old_label);
				$new_values = array('Rate Display' => $new_label);
				
				log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
			}
			
			// Log market status changes if any
			if ($old_market_status != $new_market_status) {
				$old_label = $old_market_status ? 'on' : 'off';
				$new_label = $new_market_status ? 'on' : 'off';
				
				// Create log description in the format you requested
				$log_description = ' RPanel settings';
				
				// Log only the market status change
				$old_values = array('Market Status' => $old_label);
				$new_values = array('Market Status' => $new_label);
				
				log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
			}
		}
		
		/* R-Panel data update end here */
		/* R-panel bank data update start here*/
		foreach($_POST['fv']['bankrate'] as $bratkey => $brateval ){
			// Get the old bank rate data for comparison
			$old_bank_rate = null;
			foreach($oldRecord['rpanelbank'] as $bnk_old) {
				if($bnk_old['bcontract_id'] == $brateval['bankid']) {
					$old_bank_rate = $bnk_old;
					break;
				}
			}
			
			// Check for Pure changes
			if($old_bank_rate && isset($old_bank_rate['pure']) && isset($brateval['pure'])) {
				$old_pure = $old_bank_rate['pure'];
				$new_pure = $brateval['pure'];
				
				if($old_pure != $new_pure) {
					// Get bank contract symbol for better logging
					$bank_symbol = isset($old_bank_rate['bcontract_symbol']) ? $old_bank_rate['bcontract_symbol'] : 'Unknown Bank';
					
					// Convert 0/1 to yes/no for logging
					$old_label = $old_pure ? 'yes' : 'no';
					$new_label = $new_pure ? 'yes' : 'no';
					
					// Create log description in the format you requested
					$log_description = ' RPanel settings';
					
					// Log only the Pure change
					$old_values = array($bank_symbol . ' Pure' => $old_label);
					$new_values = array($bank_symbol . ' Pure' => $new_label);
					
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
			}
			
			// Check for other bank rate field changes
			if($old_bank_rate) {
				// Get bank contract symbol for better logging
				$bank_symbol = isset($old_bank_rate['bcontract_symbol']) ? $old_bank_rate['bcontract_symbol'] : 'Unknown Bank';
				
				// Check for Premium changes
				if(isset($old_bank_rate['premium']) && isset($brateval['premium']) && $old_bank_rate['premium'] != $brateval['premium']) {
					$log_description = ' RPanel settings';
					$old_values = array($bank_symbol . ' Premium' => $old_bank_rate['premium']);
					$new_values = array($bank_symbol . ' Premium' => $brateval['premium']);
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
				
				// Check for Conv changes
				if(isset($old_bank_rate['bconvert_value']) && isset($brateval['bconvert_value']) && $old_bank_rate['bconvert_value'] != $brateval['bconvert_value']) {
					$log_description = ' RPanel settings';
					$old_values = array($bank_symbol . ' Conv' => $old_bank_rate['bconvert_value']);
					$new_values = array($bank_symbol . ' Conv' => $brateval['bconvert_value']);
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
				
				// Check for INR Premium changes
				if(isset($old_bank_rate['rupeepremium']) && isset($brateval['rupeepremium']) && $old_bank_rate['rupeepremium'] != $brateval['rupeepremium']) {
					$log_description = ' RPanel settings';
					$old_values = array($bank_symbol . ' INR Premium' => $old_bank_rate['rupeepremium']);
					$new_values = array($bank_symbol . ' INR Premium' => $brateval['rupeepremium']);
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
				
				// Check for Custom changes
				if(isset($old_bank_rate['custom']) && isset($brateval['custom']) && $old_bank_rate['custom'] != $brateval['custom']) {
					$log_description = ' RPanel settings';
					$old_values = array($bank_symbol . ' Custom' => $old_bank_rate['custom']);
					$new_values = array($bank_symbol . ' Custom' => $brateval['custom']);
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
				
				// Check for TCS changes
				if(isset($old_bank_rate['tcs_tax']) && isset($brateval['tcs_tax']) && $old_bank_rate['tcs_tax'] != $brateval['tcs_tax']) {
					$log_description = ' RPanel settings';
					$old_values = array($bank_symbol . ' TCS' => $old_bank_rate['tcs_tax']);
					$new_values = array($bank_symbol . ' TCS' => $brateval['tcs_tax']);
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
				
				// Check for Tax changes
				if(isset($old_bank_rate['btax_value']) && isset($brateval['btax_value']) && $old_bank_rate['btax_value'] != $brateval['btax_value']) {
					$log_description = ' RPanel settings';
					$old_values = array($bank_symbol . ' Tax' => $old_bank_rate['btax_value']);
					$new_values = array($bank_symbol . ' Tax' => $brateval['btax_value']);
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
				
				// Check for Tax Type changes
				if(isset($old_bank_rate['btax_type']) && isset($brateval['btax_type']) && $old_bank_rate['btax_type'] != $brateval['btax_type']) {
					// Convert tax type values to labels
					$tax_type_labels = array(1 => 'Percentage', 2 => 'Value');
					$old_label = isset($tax_type_labels[$old_bank_rate['btax_type']]) ? $tax_type_labels[$old_bank_rate['btax_type']] : $old_bank_rate['btax_type'];
					$new_label = isset($tax_type_labels[$brateval['btax_type']]) ? $tax_type_labels[$brateval['btax_type']] : $brateval['btax_type'];
					
					$log_description = ' RPanel settings';
					$old_values = array($bank_symbol . ' Tax Type' => $old_label);
					$new_values = array($bank_symbol . ' Tax Type' => $new_label);
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
				
				// Check for 1gm rate changes (calculated field)
				// Note: 1gm rate is calculated and displayed but not directly stored in the database
				// We'll need to check for changes in the underlying values that affect 1gm rate
				
				// Check for 1Kg rate changes (calculated field)
				// Note: 1Kg rate is calculated and displayed but not directly stored in the database
				// We'll need to check for changes in the underlying values that affect 1Kg rate
			}
			
			$update_bankrates = array('efp' => 0, 'premium' => $brateval['premium'], 'rupeepremium' => $brateval['rupeepremium'], 'custom' => $brateval['custom'], 'octroi' => 0, 'tax' => $brateval['btax_value'], 'taxtype' => $brateval['btax_type'], 'pure' => $brateval['pure'], 'tcs_tax' => $brateval['tcs_tax']);
			$this->db->update('dt_rpanelbank', $update_bankrates, array('banksymbol' => $brateval['bankid']));
		}
		/* R-panel bank data update end here*/
		/*R-Panel commodity rates update start here*/
		$rpanelcontract = array();
		$rpanelsettings = json_decode($_POST['fv']['rpanelsettings'], true);
		
		// Check for trade type changes and log them
		foreach($_POST['fv']['contract'] as $rckey => $rcvalue){
			// Find the corresponding old commodity data
			$old_commodity = null;
			foreach($oldRecord['rpanel_display_commodities'] as $com_old) {
				if($com_old['comid'] == $rcvalue['comid']) {
					$old_commodity = $com_old;
					break;
				}
			}
			
			// If we found the old commodity data, check for trade type changes
			if($old_commodity && isset($old_commodity['tradetype']) && $old_commodity['tradetype'] != $rcvalue['trade_type']) {
				// Map trade type values to labels
				$trade_type_labels = array(0 => 'Future', 1 => 'Bank', 2 => 'Manual');
				$old_label = isset($trade_type_labels[$old_commodity['tradetype']]) ? $trade_type_labels[$old_commodity['tradetype']] : 'Unknown';
				$new_label = isset($trade_type_labels[$rcvalue['trade_type']]) ? $trade_type_labels[$rcvalue['trade_type']] : 'Unknown';
				
				// Get commodity name for better logging
				$commodity_name = isset($old_commodity['dispname']) ? $old_commodity['dispname'] : $rcvalue['comid'];
				
				// Create log description in the format you requested
				$log_description = ' RPanel settings';
				
				// Log only the trade type change
				$old_values = array($commodity_name . ' Trade Type' => $old_label);
				$new_values = array($commodity_name . ' Trade Type' => $new_label);
				
				log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
			}
			
			// Check for GST changes (only for Future trade type)
			if(isset($rcvalue['trade_type']) && $rcvalue['trade_type'] == 0) { // Future trade type
				$new_gst = isset($rcvalue['is_gst']) ? 1 : 0;
				$old_gst = isset($old_commodity['is_gst']) ? $old_commodity['is_gst'] : 0;
				
				if($old_gst != $new_gst) {
					// Get commodity name for better logging
					$commodity_name = isset($old_commodity['dispname']) ? $old_commodity['dispname'] : $rcvalue['comid'];
					
					$old_label = $old_gst ? 'on' : 'off';
					$new_label = $new_gst ? 'on' : 'off';
					
					// Create log description
					$log_description = ' RPanel settings';
					
					// Log only the GST change
					$old_values = array($commodity_name . ' GST' => $old_label);
					$new_values = array($commodity_name . ' GST' => $new_label);
					
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
			}
			
			// Check for TCS changes (only for Future trade type)
			if(isset($rcvalue['trade_type']) && $rcvalue['trade_type'] == 0) { // Future trade type
				$new_tcs = isset($rcvalue['is_tcs']) ? 1 : 0;
				$old_tcs = isset($old_commodity['is_tcs']) ? $old_commodity['is_tcs'] : 0;
				
				if($old_tcs != $new_tcs) {
					// Get commodity name for better logging
					$commodity_name = isset($old_commodity['dispname']) ? $old_commodity['dispname'] : $rcvalue['comid'];
					
					$old_label = $old_tcs ? 'on' : 'off';
					$new_label = $new_tcs ? 'on' : 'off';
					
					// Create log description
					$log_description = ' RPanel settings';
					
					// Log only the TCS change
					$old_values = array($commodity_name . ' TCS' => $old_label);
					$new_values = array($commodity_name . ' TCS' => $new_label);
					
					log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
				}
			}
		}
		
		// Enhanced logging for manual rate changes
		foreach($_POST['fv']['contract'] as $rckey => $rcvalue){
			// Check specifically for manual trade type (2)
			if(isset($rcvalue['trade_type']) && $rcvalue['trade_type'] == 2) {
				// Find the corresponding old commodity data
				$old_commodity = null;
				foreach($oldRecord['rpanel_display_commodities'] as $com_old) {
					if($com_old['comid'] == $rcvalue['comid']) {
						$old_commodity = $com_old;
						break;
					}
				}
				
				// Process contract rates for this commodity
				foreach($_POST['fv']['contractrates'] as $crkey => $crval){
					if($rckey == $crkey && $old_commodity){
						// Get commodity name for better logging
						$commodity_name = isset($old_commodity['dispname']) ? $old_commodity['dispname'] : (isset($rcvalue['comid']) ? $rcvalue['comid'] : 'Unknown Commodity');
						
						// Calculate converted values for comparison
						$selling_rate = $rcvalue['comtype'] == 0 ? $this->gold_conversion($crval['selling_rate'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($crval['selling_rate'], $rpanelsettings['rpss_weight']);
						$selling_rate = round($selling_rate, 2);
						
						$buying_diff = $rcvalue['comtype'] == 0 ? $this->gold_conversion($crval['buying_diff'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($crval['buying_diff'], $rpanelsettings['rpss_weight']);
						$buying_diff = round($buying_diff, 2);
						
						// Check for Sell Rate changes (Manual) - Log only sell rate changes
						if(isset($old_commodity['sellrate'])) {
							$old_selling_rate = $old_commodity['comtype'] == 0 ? $this->gold_conversion($old_commodity['sellrate'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($old_commodity['sellrate'], $rpanelsettings['rpss_weight']);
							$old_selling_rate = round($old_selling_rate, 2);
							
							// Use a more precise comparison to avoid false positives
							if(abs($old_selling_rate - $selling_rate) > 0.01) {
								// Create log description
								$log_description = 'Manual rate updated for ' . $commodity_name;
								
								// Log only the Sell Rate change
								$old_values = array($commodity_name . ' Manual Sell Rate' => $old_selling_rate);
								$new_values = array($commodity_name . ' Manual Sell Rate' => $selling_rate);
								
								log_admin_edit('46','RPanel Manual Rate', $old_values, $new_values, $log_description);
							}
						}
						
						// Check for Buy Diff changes (Manual) - Log only buy diff changes
						if(isset($old_commodity['buydiff'])) {
							$old_buying_diff = $old_commodity['comtype'] == 0 ? $this->gold_conversion($old_commodity['buydiff'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($old_commodity['buydiff'], $rpanelsettings['rpss_weight']);
							$old_buying_diff = round($old_buying_diff, 2);
							
							// Use a more precise comparison to avoid false positives
							if(abs($old_buying_diff - $buying_diff) > 0.01) {
								// Create log description
								$log_description = 'Manual rate updated for ' . $commodity_name;
								
								// Log only the Buy Diff change
								$old_values = array($commodity_name . ' Manual Buy Diff' => $old_buying_diff);
								$new_values = array($commodity_name . ' Manual Buy Diff' => $buying_diff);
								
								log_admin_edit('46','RPanel Manual Rate', $old_values, $new_values, $log_description);
							}
						}
						
						// Check for Buy Rate changes (Manual) - Log only buy rate changes
						// This will only log if the calculated buy rate changes due to sell rate or buy diff changes
						// but we don't want to log it separately if we already logged the individual field changes
						if(isset($old_commodity['sellrate']) && isset($old_commodity['buydiff'])) {
							$old_selling_rate = $old_commodity['comtype'] == 0 ? $this->gold_conversion($old_commodity['sellrate'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($old_commodity['sellrate'], $rpanelsettings['rpss_weight']);
							$old_selling_rate = round($old_selling_rate, 2);
							
							$old_buying_diff = $old_commodity['comtype'] == 0 ? $this->gold_conversion($old_commodity['buydiff'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($old_commodity['buydiff'], $rpanelsettings['rpss_weight']);
							$old_buying_diff = round($old_buying_diff, 2);
							
							$old_buying_rate = $old_selling_rate - $old_buying_diff;
							$old_buying_rate = round($old_buying_rate, 2);
							
							// Recalculate new buying rate to ensure precision
							$new_buying_rate = $selling_rate - $buying_diff;
							$new_buying_rate = round($new_buying_rate, 2);
							
							// Only log buy rate change if it's different from what would be expected
							// from the individual field changes already logged
							if(abs($old_buying_rate - $new_buying_rate) > 0.01) {
								// Check if we already logged individual changes
								$sell_rate_changed = (abs($old_selling_rate - $selling_rate) > 0.01);
								$buy_diff_changed = (abs($old_buying_diff - $buying_diff) > 0.01);
								
								// Only log buy rate if neither individual field was changed
								// (this would be an unexpected case)
								if(!$sell_rate_changed && !$buy_diff_changed) {
									// Create log description
									$log_description = 'Manual rate updated for ' . $commodity_name;
									
									// Log only the Buy Rate change
									$old_values = array($commodity_name . ' Manual Buy Rate' => $old_buying_rate);
									$new_values = array($commodity_name . ' Manual Buy Rate' => $new_buying_rate);
									
									log_admin_edit('46','RPanel Manual Rate', $old_values, $new_values, $log_description);
								}
							}
						}
					}
				}
			}
		}
		
		// Check for Sell Diff and Buy Diff changes
		foreach($_POST['fv']['contract'] as $rckey => $rcvalue){
			foreach($_POST['fv']['contractrates'] as $crkey => $crval){
				if($rckey == $crkey){
					// Find the corresponding old commodity data
					$old_commodity = null;
					foreach($oldRecord['rpanel_display_commodities'] as $com_old) {
						if($com_old['comid'] == $rcvalue['comid']) {
							$old_commodity = $com_old;
							break;
						}
					}
					
					// Calculate converted values for comparison
					$selling_diff = $rcvalue['comtype'] == 0 ? $this->gold_conversion($crval['selling_diff'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($crval['selling_diff'], $rpanelsettings['rpss_weight']);
					$selling_diff = round($selling_diff,2);
					
					$buying_diff = $rcvalue['comtype'] == 0 ? $this->gold_conversion($crval['buying_diff'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($crval['buying_diff'], $rpanelsettings['rpss_weight']);
					$buying_diff = round($buying_diff,2);
					
					// Check for Sell Diff changes
					if($old_commodity && isset($old_commodity['selldiff'])) {
						// Use a more precise comparison to avoid false positives
						if(abs($old_commodity['selldiff'] - $selling_diff) > 0.01) {
							// Get commodity name for better logging
							$commodity_name = isset($old_commodity['dispname']) ? $old_commodity['dispname'] : $rcvalue['comid'];
							
							// Create log description
							$log_description = ' RPanel settings';
							
							// Log only the Sell Diff change
							$old_values = array($commodity_name . ' Sell Diff' => $old_commodity['selldiff']);
							$new_values = array($commodity_name . ' Sell Diff' => $selling_diff);
							
							log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
						}
					}
					
					// Check for Buy Diff changes
					if($old_commodity && isset($old_commodity['buydiff'])) {
						// Use a more precise comparison to avoid false positives
						if(abs($old_commodity['buydiff'] - $buying_diff) > 0.01) {
							// Get commodity name for better logging
							$commodity_name = isset($old_commodity['dispname']) ? $old_commodity['dispname'] : $rcvalue['comid'];
							
							// Create log description
							$log_description = ' RPanel settings';
							
							// Log only the Buy Diff change
							$old_values = array($commodity_name . ' Buy Diff' => $old_commodity['buydiff']);
							$new_values = array($commodity_name . ' Buy Diff' => $buying_diff);
							
							log_admin_edit('46','RPanel Data', $old_values, $new_values, $log_description);
						}
					}
					
					$rpanelcontract[] = array('rpanelid' => 1, 'rpanelcomid' => $rcvalue['comid'], 'trade_type' => $rcvalue['trade_type'], 'sell_diff' => $selling_diff, 'buy_diff' => $buying_diff, 'sell_rate' => $rcvalue['comtype'] == 0 ? $this->gold_conversion($crval['selling_rate'], $rpanelsettings['rpsg_weight']) : $this->silver_conversion($crval['selling_rate'], $rpanelsettings['rpss_weight']), 'is_gst' => isset($rcvalue['is_gst']), 'is_tcs' => isset($rcvalue['is_tcs']));
				}
			}
		}
		
		if(sizeof($rpanelcontract) > 0) {
			$this->db->delete('dt_rpanelcontract', array('rpanelid' => 1));
			foreach($rpanelcontract as $rpcont){
				$insertStatus = $this->db->insert('dt_rpanelcontract', $rpcont);
			}
		}
		/*R-Panel commodity rates update end here*/
		//Socket Update
		$socketObj = new SocketUpdater();
		$resp = $socketObj->rpanel_update();
		$resp = $socketObj->commodity_update();
		return array('status' => 1);

		//Update in log table
		//$this->updateLog($oldRecord, $_POST);
	}

	function updateLog($oldRecord, $newRecord)
	{
		$updatedRecord = array();
		$record = $newRecord['fv'];
		$newContract = array_merge_recursive($record['contract'], $record['contractrates']);
		$rp_settings = json_decode($record['rpanelsettings']);

		$marketstatus_new = isset($record['marketstatus']) && $record['marketstatus'] == 1 ? "Off" : "On";
		$marketstatus_old = $oldRecord['rpaneldata']['market_status'] == 1 ? "Off" : "On";

		if($oldRecord['rpaneldata']['rate_display'] != $record['rate_display'])
		{
			$updatedRecord['New']['Rate Display'] = $record['rate_display'];
			$updatedRecord['Old']['Rate Display'] = $oldRecord['rpaneldata']['rate_display'];
		}
		if($marketstatus_old != $marketstatus_new)
		{
			$updatedRecord['New']['Market Status'] = $marketstatus_new;
			$updatedRecord['Old']['Market Status'] = $marketstatus_old;
		}
		if($oldRecord['rpaneldata']['message'] != $record['market_closed'])
		{
			$updatedRecord['New']['Close Msg'] = $record['market_closed'];
			$updatedRecord['Old']['Close Msg'] = $oldRecord['rpaneldata']['message'];
		}

		foreach($record['bankrate'] as $bnkKey => $bnk_new)
		{
			$has_bank = 0;
			foreach($oldRecord['rpanelbank'] as $bnk_old)
			{
				if($bnk_new['bankid'] == $bnk_old['bcontract_id'])
				{
					$has_bank = 1;
					$arrValNew = array();
					$arrValOld = array();
					if($bnk_new['bankcontrname'] != $bnk_old['bcontract_symbol'])
					{
						$arrValNew['Bank Contract Name'] = $bnk_new['bankcontrname'];
						$arrValOld['Bank Contract Name'] = $bnk_old['bcontract_symbol'];
					}
					if($bnk_new['converttype'] != $bnk_old['bconvert_value_type'])
					{
						$arrValNew['Convert Type'] = $bnk_new['converttype'];
						$arrValOld['Convert Type'] = $bnk_old['bconvert_value_type'];
					}
					if($bnk_new['extracharge'] != $bnk_old['bextra_charges'])
					{
						$arrValNew['Extra Charge'] = $bnk_new['extracharge'];
						$arrValOld['Extra Charge'] = $bnk_old['bextra_charges'];
					}
					if($bnk_new['chargetype'] != $bnk_old['bextra_type'])
					{
						$arrValNew['Charge Type'] = $bnk_new['chargetype'];
						$arrValOld['Charge Type'] = $bnk_old['bextra_type'];
					}
					if($bnk_new['premium'] != $bnk_old['premium'])
					{
						$arrValNew['Premium'] = $bnk_new['premium'];
						$arrValOld['Premium'] = $bnk_old['premium'];
					}
					if($bnk_new['bconvert_value'] != $bnk_old['bconvert_value'])
					{
						$arrValNew['Convert Value'] = $bnk_new['bconvert_value'];
						$arrValOld['Convert Value'] = $bnk_old['bconvert_value'];
					}
					if($bnk_new['rupeepremium'] != $bnk_old['rupeepremium'])
					{
						$arrValNew['Rupee Premium'] = $bnk_new['rupeepremium'];
						$arrValOld['Rupee Premium'] = $bnk_old['rupeepremium'];
					}
					if($bnk_new['custom'] != $bnk_old['custom'])
					{
						$arrValNew['Custom'] = $bnk_new['custom'];
						$arrValOld['Custom'] = $bnk_old['custom'];
					}
					if($bnk_new['btax_type'] != $bnk_old['btax_type'])
					{
						$arrValNew['Tax Type'] = $bnk_new['btax_type'];
						$arrValOld['Tax Type'] = $bnk_old['btax_type'];
					}
					if($bnk_new['btax_value'] != $bnk_old['btax_value'])
					{
						$arrValNew['Tax Value'] = $bnk_new['btax_value'];
						$arrValOld['Tax Value'] = $bnk_old['btax_value'];
					}
					if($bnk_new['pure'] != $bnk_old['pure'])
					{
						$arrValNew['Pure'] = $bnk_new['pure'];
						$arrValOld['Pure'] = $bnk_old['pure'];
					}

					if(count($arrValNew) > 0)
					{
						$updatedRecord['New']['Bank'][$bnkKey] = $arrValNew;
						$updatedRecord['Old']['Bank'][$bnkKey] = $arrValOld;
					}
				}
			}
			if($has_bank == 0)
			{
				$updatedRecord['New']['Bank'][$bnkKey] = $bnk_new;
			}
		}

		foreach($newContract as $conKey => $com_new)
		{
			$has_comm = 0;
			foreach($oldRecord['rpanel_display_commodities'] as $com_old)
			{
				if($com_new['comid'] == $com_old['comid'])
				{
					$has_comm = 1;
					$arrValNew = array();
					$arrValOld = array();

					$selling_diff = $com_new['comtype'] == 0 ? $this->gold_conversion($com_new['selling_diff'], $rp_settings->rpsg_weight) : $this->silver_conversion($com_new['selling_diff'], $rp_settings->rpss_weight);
					$selling_diff = round($selling_diff,2);

					$buying_diff = $com_new['comtype'] == 0 ? $this->gold_conversion($com_new['buying_diff'], $rp_settings->rpsg_weight) : $this->silver_conversion($com_new['buying_diff'], $rp_settings->rpss_weight);
					$buying_diff = round($buying_diff,2);

					$selling_rate = $com_new['comtype'] == 0 ? $this->gold_conversion($com_new['selling_rate'], $rp_settings->rpsg_weight) : $this->silver_conversion($com_new['selling_rate'], $rp_settings->rpss_weight);
					$selling_rate = round($selling_rate,2);

					if($com_new['trade_type'] != $com_old['tradetype'])
					{
						$arrValNew['Trade Type'] = $com_new['trade_type'];
						$arrValOld['Trade Type'] = $com_old['tradetype'];
					}
					if($com_new['mcxcontract'] != $com_old['mcxcontract'])
					{
						$arrValNew['Mcx Contract'] = $com_new['mcxcontract'];
						$arrValOld['Mcx Contract'] = $com_old['mcxcontract'];
					}
					if($com_new['comtype'] != $com_old['comtype'])
					{
						$arrValNew['Com Type'] = $com_new['comtype'];
						$arrValOld['Com Type'] = $com_old['comtype'];
					}
					if($com_new['bankcontract'] != $com_old['bcontract_rate'])
					{
						$arrValNew['Bank Contract'] = $com_new['bankcontract'];
						$arrValOld['Bank Contract'] = $com_old['bcontract_rate'];
					}
					if($com_new['bankcontrid'] != $com_old['bcontract_id'])
					{
						$arrValNew['Bank Contract Id'] = $com_new['bankcontrid'];
						$arrValOld['Bank Contract Id'] = $com_old['bcontract_id'];
					}
					if($selling_diff != $com_old['selldiff'])
					{
						$arrValNew['Sell Diff'] = $selling_diff;
						$arrValOld['Sell Diff'] = $com_old['selldiff'];
					}
					if($buying_diff != $com_old['buydiff'])
					{
						$arrValNew['Buy Diff'] = $buying_diff;
						$arrValOld['Buy Diff'] = $com_old['buydiff'];
					}
					if($selling_rate != $com_old['sellrate'] && ($com_new['trade_type'] == 2 || $com_old['tradetype'] == 2))
					{
						$arrValNew['Manual Rate'] = (string)$selling_rate;
						$arrValOld['Manual Rate'] = $com_old['sellrate'];
					}

					if(count($arrValNew) > 0)
					{
						$updatedRecord['New']['Commodity'][$conKey] = $arrValNew;
						$updatedRecord['Old']['Commodity'][$conKey] = $arrValOld;
					}
				}
			}
			if($has_comm == 0)
			{
				$updatedRecord['New']['Commodity'][$conKey] = $com_new;
			}
		}

		if(count($updatedRecord) > 0)
		{
			$records = json_encode($updatedRecord);
			$admin_id 		= $this->login_model->get_userid();
			$adminipaddress = $_SERVER['SERVER_ADDR'];
			$rateOn = isset($updatedRecord['New']['rate_display']) ? ($updatedRecord['New']['rate_display'] == 1 ? " Rate On" : " Rate Off") : "";
			$log_shortdesc 	= "Updated Rpanel.".$rateOn;
			$logtype = $rateOn == "" ? 2 : 3;
			$logdatetime = date('Y-m-d H:i:s');
			$logupdatedata = date('Y-m-d H:i:s');
			//$this->db->query("INSERT INTO dt_admin_log(`log_datetime`,`log_type`, `log_update_data`,`log_description`,`log_pre_data`,`log_book_deviceid`,`log_user_agent`,`log_book_adminipaddress`,`log_admin_id`,`log_admin_ip`) VALUES ('".$logdatetime."','".$logtype."','".$logupdatedata."','".$log_shortdesc."','".$records."','NULL','NULL','NULL','".$admin_id ."','".$adminipaddress."')");
		}
	}
	
	function get_rpsettings() {
		$resultset = $this->db->query("select * from dt_generalrpsettings");
		return $resultset;
	}
	function get_silver() {
		$resultset = $this->db->query("select admin_is_silver from dt_generalsettings");
		return $resultset;
	}
	function get_color() {
		$str_color = "";
		$resultset = $this->db->query("select h_colour, l_colour from dt_rpanel_settings");
		foreach($resultset->result() as $row) {
			$str_color=$row->h_colour."/SEPERATOR/".$row->l_colour;
		}
		$resultset->free_result();
		return $str_color;
	}
	function getroundoff(){
		$roundoffarr = array();
		$resultset = $this->db->query("select * from dt_com_master group by com_type");

		foreach($resultset->result() as $row) {
			$roundoffarr[$row->com_type]=$row->com_correction_type;
		}
		$resultset->free_result();

		return $roundoffarr;
	}
	function disable_rpaneledit_settings() {
		//echo "select disable_rpaneledit from dt_admin_user where admin_user_name='".$this->session->userdata('username')."'<br>";
		$resultset = $this->db->query("select disable_rpaneledit from dt_admin_user where admin_user_name=?", array($this->session->userdata('username')));
		//print_r($resultset);
		foreach($resultset->result_array() as $row) {
			$disable_rpaneledit = $row['disable_rpaneledit'];
		}
		return $disable_rpaneledit;
	}
}
?>