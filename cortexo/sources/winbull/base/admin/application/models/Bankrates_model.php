<?php
class Bankrates_model extends CI_Model {
	public function sendSMS() {
		$rs_rpsettings = $this->db->query("SELECT * FROM  dt_bid_ask where sms_sent=0"); 	
		$rs_rpsettings_result = $rs_rpsettings->result_array();
		foreach($rs_rpsettings_result as $row2){
			//Send SMS
			
			//Update SMS Status
			$this->db->query("UPDATE dt_bid_ask set sms_sent=1 where id=?", array($row2['id'])); 	
		}
	}
	function gold_conversion($con_value, $com_weigh,$rpsg_weight) {
		return (float)(($con_value* $rpsg_weight) / 10);
	}
	function silver_conversion($con_value, $com_weight,$rpss_weight) {
		return (float)(($con_value * $rpss_weight) / 1000);
	}
	function manual_roundoff($round_value, $round_method, $type) {
	$convert_value = "";	
	$flag = false;
	//$round_method = $round_method; // P-FIX: removed useless self-assignment
	$roundoff_val = 0;
	$decimal_factory = sprintf("%.2f",((float)$round_value - (int)$round_value)); 
	if($round_method>0 && $decimal_factory>0){
		$modval = ($decimal_factory*100)%$round_method;
		$divval = (int)(($decimal_factory*100)/$round_method);		
		if($modval>0) {
			if($type=='bid') $roundoff_val=($divval)*$round_method;
			else $roundoff_val=($divval+1)*$round_method;
		}
		else { 
			return sprintf("%.2f",(float)($round_value));
		}
		return sprintf("%.2f",(float)(((int)($round_value) + ($roundoff_val/100))));
		
	}
	return sprintf("%.2f",(float)($round_value));
}
	public function getBankRates() {
		$query = $this->db->query("select rpsg_weight,rpss_weight,rpsg_roundoff,rpss_roundoff from dt_generalrpsettings");
			//while ($ans=mysql_fetch_array($query))	{
			foreach($query->result_array() as $ans){
				$rpsg_weight    = $ans['rpsg_weight'];
				$rpss_weight    = $ans['rpss_weight'];		
				$rpsg_roundoff  = $ans['rpsg_roundoff'];		
				$rpss_roundoff  = $ans['rpss_roundoff'];
			}$query->free_result();
			$filename = "../admin/rpanel_xml/rateXml.xml";
			$user_id ="guest";
			if($filename){
				$doc = new DOMDocument();
				$doc->load($filename);
				$trade_type = $doc->getElementsByTagName("trade_type")->item(0)->nodeValue;
					if($doc->getElementsByTagName("trade_type")->item(0)->nodeValue == 3) {
						$market_status = false;
						$market_closed = $doc->getElementsByTagName("market_closed")->item(0)->nodeValue;
					}else {
						$market_status = true;
						$gold_selling_diff=$doc->getElementsByTagName("gold_selling_diff")->item(0)->nodeValue;			
						$gold_selling_rate=$doc->getElementsByTagName("gold_selling_rate")->item(0)->nodeValue;
						$gold_buying_diff=$doc->getElementsByTagName("gold_buying_diff")->item(0)->nodeValue;
						$gold_buying_rate=$gold_selling_rate-$gold_buying_diff;
						$gold_update_time=$doc->getElementsByTagName("lgd_time")->item(0)->nodeValue;
						
						$silver_selling_diff=$doc->getElementsByTagName("silver_selling_diff")->item(0)->nodeValue;
						$silver_selling_rate=$doc->getElementsByTagName("silver_selling_rate")->item(0)->nodeValue;
						$silver_buying_diff=$doc->getElementsByTagName("silver_buying_diff")->item(0)->nodeValue;
						$silver_buying_rate=$silver_selling_rate-$silver_buying_diff;
						$silver_update_time=$doc->getElementsByTagName("silver_lgd_time")->item(0)->nodeValue;
						
						$gold_bid = $doc->getElementsByTagName("lgd_bid")->item(0)->nodeValue;
						$gold_ask = $doc->getElementsByTagName("lgd_ask")->item(0)->nodeValue;
						$gold_updatetime = $doc->getElementsByTagName("lgd_time")->item(0)->nodeValue;
						$ind_bid = $doc->getElementsByTagName("ind_bid")->item(0)->nodeValue;
						$ind_ask = $doc->getElementsByTagName("ind_ask")->item(0)->nodeValue;
						$lgd_high = $doc->getElementsByTagName("lgd_high")->item(0)->nodeValue;
						$lgd_low = $doc->getElementsByTagName("lgd_low")->item(0)->nodeValue;
						$ind_high = $doc->getElementsByTagName("ind_high")->item(0)->nodeValue;
						$ind_low = $doc->getElementsByTagName("ind_low")->item(0)->nodeValue;
						$silver_lgd_high = $doc->getElementsByTagName("silver_lgd_high")->item(0)->nodeValue;
						$silver_lgd_low = $doc->getElementsByTagName("silver_lgd_low")->item(0)->nodeValue;
						$silver_lgd_bid = $doc->getElementsByTagName("silver_lgd_bid")->item(0)->nodeValue;
						$silver_lgd_ask = $doc->getElementsByTagName("silver_lgd_ask")->item(0)->nodeValue;
						$mcx_time = $doc->getElementsByTagName("mcx_time")->item(0)->nodeValue;
						$manual_time = $doc->getElementsByTagName("manual_time")->item(0)->nodeValue;
						$silver_manual_time = $doc->getElementsByTagName("silver_lgd_time")->item(0)->nodeValue;
						$silver_trade_type = $doc->getElementsByTagName("silver_trade_type")->item(0)->nodeValue;
						$silver_mcx_time = $doc->getElementsByTagName("silver_mcx_time")->item(0)->nodeValue;
						$lgd_time = $doc->getElementsByTagName("lgd_time")->item(0)->nodeValue;
						$inr_bid = $doc->getElementsByTagName("ind_bid")->item(0)->nodeValue;
						$inr_ask = $doc->getElementsByTagName("ind_ask")->item(0)->nodeValue;
						$per_gm_mcx = $doc->getElementsByTagName("per_gm_mcx")->item(0)->nodeValue;
						$per_gm_mcx_bid = $doc->getElementsByTagName("per_gm_mcx_bid")->item(0)->nodeValue;
						$gch_per_gm_mcx_ask = $doc->getElementsByTagName("gch_per_gm_mcx_ask")->item(0)->nodeValue;
						$gch_gold_selling_diff = $doc->getElementsByTagName("gch_gold_selling_diff")->item(0)->nodeValue;
						$gch_per_gm_mcx_bid = $doc->getElementsByTagName("gch_per_gm_mcx_bid")->item(0)->nodeValue;
						$gch_gold_buying_diff = $doc->getElementsByTagName("gch_gold_buying_diff")->item(0)->nodeValue;
						$updatetime = $doc->getElementsByTagName("updatetime")->item(0)->nodeValue;
						$rate_display = $doc->getElementsByTagName("rate_display")->item(0)->nodeValue;
						$market_closed = $doc->getElementsByTagName("market_closed")->item(0)->nodeValue;
						
						$gch_trade_type = $doc->getElementsByTagName("gch_trade_type")->item(0)->nodeValue;
						$per_gm_bank = $doc->getElementsByTagName("per_gm_bank")->item(0)->nodeValue;
						$per_gm_bank_bid = $doc->getElementsByTagName("per_gm_bank_bid")->item(0)->nodeValue;
						$gch_gold_selling_rate = $doc->getElementsByTagName("gch_gold_selling_rate")->item(0)->nodeValue;
						
						$silver_per_gm_mcx = $doc->getElementsByTagName("silver_per_gm_mcx")->item(0)->nodeValue;
						$silver_per_gm_mcx_bid = $doc->getElementsByTagName("silver_per_gm_mcx_bid")->item(0)->nodeValue;
						$silver_per_gm_bank = $doc->getElementsByTagName("silver_per_gm_bank")->item(0)->nodeValue;
						$silver_per_gm_bank_bid = $doc->getElementsByTagName("silver_per_gm_bank_bid")->item(0)->nodeValue;
					}			
			}
			$silver_flag = 0;
			$resultsilver = $this->db->query("select admin_is_silver from dt_generalsettings");
			foreach($resultsilver->result() as $row){
				$silver_flag = $row->admin_is_silver;
			}
			$resultsilver->free_result();
			$str_query = $this->db->query("select com.com_id, com_name,
					com_display_purity,com_sel_premium as com_buy_premium, com_buy_premium as com_sel_premium,ifnull(com_premium_type,0) as com_premium_type,
					com_isregion,com_calpurity,com_tax,com_octroi,com_stamduty,
					com_sel_active as com_buy_active, com_buy_active as com_sel_active,com_delverydays,
					com_type, com_weight, com_other_charges, com_correction_type,
					cus_com_smoq, cus_com_pmoq, cus_com_status
					from dt_com_master as com
					left join dt_customergroupitems as cgi on cgitems_cusid=
					(select cus_id from dt_customer where cus_login_name='".
					$user_id."')
					left join dt_customergroup on cgrp_id=cgitems_cgrpid
					left join dt_com_group_com as cgc on cgc.com_group_id=cgitems_comgroupid
					and cgc.com_id=com.com_id
					left join dt_cus_commodity on cus_com_cus_id =
					(select cus_id from dt_customer where cus_login_name='".
					$user_id."')
					and cus_com_id=com.com_id
					where cgrp_effectivedate=(select max(cgrp_effectivedate) from
					dt_customergroup where cgrp_effectivedate <= date(now())) and com_active = 1 group by com_id order by com_order_number");
					//$result_set = $this->db->query($str_query);
					//var_dump($str_query);exit;
					$commodities_arr = array();
					$i = 0;
					//while($row = mysql_fetch_array($str_query)) {
					foreach ($str_query->result_array() as $row){
						$selling_rate = '';
						$buying_rate = '';
						// Skip silver commodities when silver display is OFF
						if($silver_flag == 0 && $row['com_type'] == 1) {
							continue;
						}
						if($row['com_sel_active']==1 || $row['com_buy_active']==1) {
			//checking whether the product is gold or silver and fetching the corresponding price
			if($row['com_type']==0){				
					$gold_10gmrate = $gold_selling_rate;
					//Calculating Purity, Tax, Octroi and stamp duty if commodity type is region
					if($row['com_isregion'] == 1) {
						//rate = Base rate / purity	
						if($row['com_calpurity'] == 0) { //if purity = 995
							$gold_10gmrate = $gold_10gmrate / 0.995;
						} else { //if purity = 999 OR 9999
							$gold_10gmrate = $gold_10gmrate / 1;
						}
						//rate1 = rate + (rate * tax/100) Tax calculation
						$gold_10gmrate+=($gold_10gmrate *  ($row['com_tax'] / 100));
						//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
						$gold_10gmrate+=($gold_10gmrate *  ($row['com_octroi'] / 100));
						//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
						$gold_10gmrate+=($gold_10gmrate *  ($row['com_stamduty'] / 100));						
					}

					$selling_con = $this->gold_conversion($gold_10gmrate, $row['com_weight'],$rpsg_weight);				
					$selling_rate = $selling_con * $row['com_weight'];
					$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');

					$buying_con = $this->gold_conversion($gold_buying_diff, $row['com_weight'],$rpsg_weight);
					$buying_rate = $this->manual_roundoff($selling_con, $row['com_correction_type'],'bid');
					$buying_rate = $buying_rate - $buying_con;
					$buying_rate = $buying_rate * $row['com_weight'];
					$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');		
					if($trade_type == 0)  {
						$gold_10gmrate = 0;
						$gold_10gmrate = $per_gm_mcx + $gold_selling_diff;
							if($row['com_isregion'] == 1) {
									if($row['com_calpurity'] == 0) { //if purity = 995
									$gold_10gmrate = $gold_10gmrate / 0.995;
								} else { //if purity = 999 OR 9999
									$gold_10gmrate = $gold_10gmrate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$gold_10gmrate+=($gold_10gmrate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$gold_10gmrate+=($gold_10gmrate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$gold_10gmrate+=($gold_10gmrate *  ($row['com_stamduty'] / 100));						
							}
							$selling_con = $this->gold_conversion($gold_10gmrate, $row['com_weight'],$rpsg_weight);			
							$selling_rate = $selling_con * $row['com_weight'];
							$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');
							
							$buying_rate = 0;
							$buying_rate = $per_gm_mcx_bid - $gold_buying_diff;
							if($row['com_isregion'] == 1) {
									if($row['com_calpurity'] == 0) { //if purity = 995
									$buying_rate = $buying_rate / 0.995;
								} else { //if purity = 999 OR 9999
									$buying_rate = $buying_rate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_stamduty'] / 100));						
							}
							$buying_rate = $this->gold_conversion($buying_rate, $row['com_weight'],$rpsg_weight);
							$buying_rate = $buying_rate * $row['com_weight'];
							$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');	
					}
					 else if($trade_type==1) {
					 	$gold_10gmrate =0;
						$gold_10gmrate = $per_gm_bank + $gold_selling_diff;
						if($row['com_isregion'] == 1) {
								if($row['com_calpurity'] == 0) { //if purity = 995
									$gold_10gmrate = $gold_10gmrate / 0.995;
								} else { //if purity = 999 OR 9999
									$gold_10gmrate = $gold_10gmrate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$gold_10gmrate+=($gold_10gmrate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$gold_10gmrate+=($gold_10gmrate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$gold_10gmrate+=($gold_10gmrate *  ($row['com_stamduty'] / 100));						
							}
							
							$selling_con  = $this->gold_conversion($gold_10gmrate, $row['com_weight'],$rpsg_weight);
							$selling_rate = $selling_con * $row['com_weight'];
							$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');		
							
							$buying_rate =0;
							$buying_rate = $per_gm_bank_bid - $gold_buying_diff;
							if($row['com_isregion'] == 1) {
									if($row['com_calpurity'] == 0) { //if purity = 995
									$buying_rate = $buying_rate / 0.995;
								} else { //if purity = 999 OR 9999
									$buying_rate = $buying_rate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_stamduty'] / 100));						
							}
							$buying_rate = $this->gold_conversion($buying_rate, $row['com_weight'],$rpsg_weight);
							$buying_rate = $buying_rate * $row['com_weight'];
							$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');		
					 }
					if($trade_type==0) {
						$update_time = $mcx_time;
					} else if($trade_type==1) {
						$update_time = $lgd_time;
					} else if($trade_type==2) {
						$update_time = $manual_time;
					}	
				} else if($row['com_type']==2){
					if($gch_trade_type == 0) {
						$selling_rate = 0;
						$selling_rate = $gch_per_gm_mcx_ask + $gch_gold_selling_diff;
							if($row['com_isregion'] == 1) {
								if($row['com_calpurity'] == 0) { //if purity = 995
									$selling_rate = $selling_rate / 0.995;
								} else { //if purity = 999 OR 9999
									$selling_rate = $selling_rate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_stamduty'] / 100));						
							}
							$selling_con  = $this->gold_conversion($selling_rate, $row['com_weight'],$rpsg_weight);
							$selling_rate = $selling_con * $row['com_weight'];
							$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');	
							
							$buying_rate = 0;
							$buying_rate = $gch_per_gm_mcx_bid - $gch_gold_buying_diff;	
							if($row['com_isregion'] == 1) {
									if($row['com_calpurity'] == 0) { //if purity = 995
									$buying_rate = $buying_rate / 0.995;
								} else { //if purity = 999 OR 9999
									$buying_rate = $buying_rate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_stamduty'] / 100));						
							}
							$buying_rate = $this->gold_conversion($buying_rate, $row['com_weight'],$rpsg_weight);
							$buying_rate = $buying_rate * $row['com_weight'];
							$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');	

					}
					else if($gch_trade_type == 1) {
						$selling_rate =0;
						$selling_rate = $per_gm_bank + $gch_gold_selling_diff;
						if($row['com_isregion'] == 1) {
								if($row['com_calpurity'] == 0) { //if purity = 995
									$selling_rate = $selling_rate / 0.995;
								} else { //if purity = 999 OR 9999
									$selling_rate = $selling_rate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_stamduty'] / 100));						
							}
							$selling_con  = $this->gold_conversion($selling_rate, $row['com_weight'],$rpsg_weight);
							$selling_rate = $selling_con * $row['com_weight'];
							$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');	
							
							$buying_rate =0;
							$buying_rate = $per_gm_bank_bid - $gch_gold_buying_diff;
							if($row['com_isregion'] == 1) {
									if($row['com_calpurity'] == 0) { //if purity = 995
									$buying_rate = $buying_rate / 0.995;
								} else { //if purity = 999 OR 9999
									$buying_rate = $buying_rate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_stamduty'] / 100));	
							}
							$buying_rate = $this->gold_conversion($buying_rate, $row['com_weight'],$rpsg_weight);
							$buying_rate = $buying_rate * $row['com_weight'];
							$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');	
					} else if($gch_trade_type == 2) {
							$selling_rate = $gch_gold_selling_rate;
							if($row['com_isregion'] == 1) {
								if($row['com_calpurity'] == 0) { //if purity = 995
									$selling_rate = $selling_rate / 0.995;
								} else { //if purity = 999 OR 9999
									$selling_rate = $selling_rate / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$selling_rate+=($selling_rate *  ($row['com_stamduty'] / 100));						
							}
							$selling_con  = $this->gold_conversion($selling_rate, $row['com_weight'],$rpsg_weight);
							$selling_rate = $selling_con; //* $row['com_weight'];
							$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');	
							
							$buying_con = $gch_gold_selling_rate - $gch_gold_buying_diff;
							if($row['com_isregion'] == 1) {
									if($row['com_calpurity'] == 0) { //if purity = 995
									$buying_rate = $buying_con / 0.995;
								} else { //if purity = 999 OR 9999
									$buying_rate = $buying_con / 1;
								}
								//rate1 = rate + (rate * tax/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_tax'] / 100));
								//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_octroi'] / 100));
								//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
								$buying_rate+=($buying_rate *  ($row['com_stamduty'] / 100));	
							}
							$buying_rate = $this->gold_conversion($buying_rate, $row['com_weight'],$rpsg_weight);
							$buying_rate = $buying_rate * $row['com_weight'];
							$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');	
					}
				} else {					
					$silver_10gmrate = $silver_selling_rate;
					//Calculating Purity, Tax, Octroi and stamp duty if commodity type is region
					if($row['com_isregion'] == 1) {
						//rate = Base rate / purity						
						if($row['com_calpurity'] == 0) { //if purity = 995
							$silver_10gmrate = $silver_10gmrate / 0.995;
						} else { //if purity = 999 OR 9999
							$silver_10gmrate = $silver_10gmrate / 1;
						}
						//rate1 = rate + (rate * tax/100) Tax calculation
						$silver_10gmrate+=($silver_10gmrate *  ($row['com_tax'] / 100));
						//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
						$silver_10gmrate+=($silver_10gmrate *  ($row['com_octroi'] / 100));
						//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
						$silver_10gmrate+=($silver_10gmrate *  ($row['com_stamduty'] / 100));						
					}
					$selling_con = $this->silver_conversion($silver_10gmrate, $row['com_weight'],$rpss_weight);
					$selling_rate = $selling_con * (float)($row['com_weight']);
					$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');
					$buying_con = $this->silver_conversion($silver_buying_diff, $row['com_weight'],$rpss_weight);
					$buying_rate = $this->manual_roundoff($selling_con, $row['com_correction_type'],'bid');
					$buying_rate = $buying_rate - $buying_con;
					// $buying_rate = $buying_rate; // P-FIX: removed useless self-assignment	
					$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');
					//selling_rate = parseFloat(data.silver_selling_rate) * parseFloat($row['com_weight']);
					//buying_rate = parseFloat(data.silver_buying_rate) * parseFloat($row['com_weight']);
					if($silver_trade_type == 0) {
						$selling_rate =0;
						$silver_10gmrate = $silver_per_gm_mcx + $silver_selling_diff;
						if($row['com_isregion'] == 1) {
						//rate = Base rate / purity						
						if($row['com_calpurity'] == 0) { //if purity = 995
							$silver_10gmrate = $silver_10gmrate / 0.995;
						} else { //if purity = 999 OR 9999
							$silver_10gmrate = $silver_10gmrate / 1;
						}
						//rate1 = rate + (rate * tax/100) Tax calculation
						$silver_10gmrate+=($silver_10gmrate *  ($row['com_tax'] / 100));
						//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
						$silver_10gmrate+=($silver_10gmrate *  ($row['com_octroi'] / 100));
						//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
						$silver_10gmrate+=($silver_10gmrate *  ($row['com_stamduty'] / 100));						
					}
					$selling_con = $this->silver_conversion($silver_10gmrate, $row['com_weight'],$rpss_weight);
					$selling_rate = $selling_con * $row['com_weight'];
					$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');
					$buying_rate =0;
					$buying_rate = $silver_per_gm_mcx_bid - $silver_buying_diff;
					if($row['com_isregion'] == 1) {
						//rate = Base rate / purity						
						if($row['com_calpurity'] == 0) { //if purity = 995
							$buying_rate = $buying_rate / 0.995;
						} else { //if purity = 999 OR 9999
							$buying_rate = $buying_rate / 1;
						}
						//rate1 = rate + (rate * tax/100) Tax calculation
						$buying_rate+=($buying_rate *  ($row['com_tax'] / 100));
						//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
						$buying_rate+=($buying_rate *  ($row['com_octroi'] / 100));
						//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
						$buying_rate+=($buying_rate *  ($row['com_stamduty'] / 100));						
					}
						$buying_rate = $this->silver_conversion($buying_rate, $row['com_weight'],$rpss_weight);
						$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');
					}else if($silver_trade_type == 1) {
						$selling_rate = 0;
						$selling_rate = $silver_per_gm_bank + $silver_selling_diff;
							if($row['com_isregion'] == 1) {
							//rate = Base rate / purity						
							if($row['com_calpurity'] == 0) { //if purity = 995
								$silver_10gmrate = $silver_10gmrate / 0.995;
							} else { //if purity = 999 OR 9999
								$silver_10gmrate = $silver_10gmrate / 1;
							}
							//rate1 = rate + (rate * tax/100) Tax calculation
							$silver_10gmrate+=($silver_10gmrate *  ($row['com_tax'] / 100));
							//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
							$silver_10gmrate+=($silver_10gmrate *  ($row['com_octroi'] / 100));
							//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
							$silver_10gmrate+=($silver_10gmrate *  ($row['com_stamduty'] / 100));						
						}
						$selling_con = $this->silver_conversion($silver_10gmrate, $row['com_weight'],$rpss_weight);
						$selling_rate = $selling_con * $row['com_weight'];
						$selling_rate = $this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask');
						$buying_rate =0;
						$buying_rate = $silver_per_gm_bank_bid - $silver_buying_diff;
						if($row['com_isregion'] == 1) {
							//rate = Base rate / purity						
							if($row['com_calpurity'] == 0) { //if purity = 995
								$buying_rate = $buying_rate / 0.995;
							} else { //if purity = 999 OR 9999
								$buying_rate = $buying_rate / 1;
							}
							//rate1 = rate + (rate * tax/100) Tax calculation
							$buying_rate+=($buying_rate *  ($row['com_tax'] / 100));
							//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
							$buying_rate+=($buying_rate *  ($row['com_octroi'] / 100));
							//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
							$buying_rate+=($buying_rate *  ($row['com_stamduty'] / 100));						
						}
						$buying_rate = $this->silver_conversion($buying_rate, $row['com_weight'],$rpss_weight);
						$buying_rate = $this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid');
					}
					
					if($silver_trade_type==0) {
						$update_time = $silver_mcx_time;
					} else if($silver_trade_type==1) {
						$update_time = $lgd_time;
					} else if($silver_trade_type==2) {
						$update_time = $silver_manual_time;
					}
				}
				
				$diff_type = $row['com_premium_type'];
				if($diff_type==1) {
					$selling_rate = number_format($row['com_sel_premium'],2,'.','');
					$buying_rate  = number_format($row['com_buy_premium'],2,'.','');
				}
				else {
						//Display selling rate
					//set selling price selling price = rate + premium + other charges
					$selling_rate = $selling_rate + $row['com_sel_premium'] + $row['com_other_charges'];	
					//$selling_rate = number_format(manual_roundoff($selling_rate, $row['com_correction_type'],'ask'),0,'.','');
					$selling_rate = number_format($this->manual_roundoff($selling_rate, $row['com_correction_type'],'ask'),2,'.','');
					//tableid.rows[i].cells[2].childNodes[3].innerHTML=manual_roundoff((rate + parseFloat(tableid.rows[i].cells[2].childNodes[1].value) + parseFloat(tableid.rows[i].cells[4].childNodes[2].value)), i);
				}
				
				//Display buying rate
				if($row['com_buy_active']==1) {
					//set buying price buying price = rate + premium
					$buying_rate = $buying_rate + $row['com_buy_premium'];
					//$buying_rate=number_format(manual_roundoff($buying_rate, $row['com_correction_type'],'bid'),0,'.','');
					$buying_rate=number_format($this->manual_roundoff($buying_rate, $row['com_correction_type'],'bid'),2,'.','');
					//tableid.rows[i].cells[3].childNodes[3].innerHTML=manual_roundoff((rate - parseFloat(tableid.rows[i].cells[3].childNodes[1].value), i);
				}/**/
				
				
			$commodities_arr['buying_rate'][$row['com_id']] = (int)$buying_rate;
			$commodities_arr['selling_rate'][$row['com_id']] = (int)$selling_rate;
			$bankratearr = $commodities_arr;
			$i++;
					}	
			
			}
			return $commodities_arr;
		
	}
	function clearBids(){
		$this->db->query("TRUNCATE dt_bid_ask");
	}
	function checkBids(){
		$curr_time = mktime(23,0,0,date("d"),date("m"),date("Y"));
		//echo date("d/m/Y H:i:s",time()).'>'.date("d/m/Y H:i:s",$curr_time).'------------'.time().'>'.$curr_time;exit;
		//if(time()>$curr_time) {
		if(date("H")>=23){
			$this->clearBids();
			exit;
		}
		$bankratesarr = $this->getBankRates();
		$condarr = array();
		
		//Bids
		if(isset($bankratesarr['selling_rate']) && is_array($bankratesarr['selling_rate'])) {
			foreach($bankratesarr['selling_rate'] as $id => $cond){
				$condstr[] = " (pid='$id' and rate='$cond') ";
				//$condstr[] = " ( pid='$id' and (rate>='$cond' and crate>=rate)) ";
			}
			$condresstr = implode('OR',$condstr);
			$qry = "UPDATE dt_bid_ask SET status=1,activateddate='".time()."' where type='bid' AND status!=1 AND ( $condresstr )";
			$resultset = $this->db->query($qry);
		}
		
		if(isset($bankratesarr['buying_rate']) && is_array($bankratesarr['buying_rate'])) {
			foreach($bankratesarr['buying_rate'] as $id => $cond){
				$condstr[] = " (pid='$id' and rate='$cond') ";
			}
			$condresstr = implode('OR',$condstr);
			$qry = "UPDATE dt_bid_ask SET status=1,activateddate='".time()."' where type='ask' AND status!=1 AND ( $condresstr )";
			$resultset = $this->db->query($qry);
			
			
		}
		//send SMS
		$sms_url = '';//http://control.msg91.com/sendhttp.php?user=@@user_name@@&password=@@password@@&mobiles=@@mobileno@@&message=@@message@@&sender=@@sender_id@@
		$result_set = $this->db->query("select sas_url from dt_smsappsettings where sas_id=1");
		foreach($result_set->result() as $row) {
			$sms_url = $row->sas_url;			
		}
		$result_set = $this->db->query("select admin_sms_username, admin_sms_password, admin_sms_senderid from dt_admin_user  where admin_user_id=1");
		foreach($result_set->result() as $row) {
			$sms_username = $row->admin_sms_username;
			$sms_password = $row->admin_sms_password;
			$sms_senderid = $row->admin_sms_senderid;			
		}
		$result_set->free_result();	
		$sms_name = '';
		$result_set_user = $this->db->query("select dt_bid_ask.*,dt_com_master.com_name from dt_bid_ask,dt_com_master where dt_bid_ask.pid = dt_com_master.com_id and sms_sent=0 and status=1");
		$curr_date = mktime(0,0,0,date("m"),date("d"),date("Y"));
		foreach($result_set_user->result() as $row_user) {
			$userid = $row_user->userid;
			$result_set = $this->db->query("select cus_name,cus_mobile1 as mobile_no,sms_unlimited,sms_limit
									from dt_customer
									where cus_id =?", array($userid));
			$send_sms = 0;
			foreach($result_set->result() as $row) {
				$sms_name = $row->cus_name;
				$sms_mobiles = $row->mobile_no;
				//print_r($row);
				//echo "<br>$row->sms_limit>0 || $row->sms_unlimited==1<br>";
				//if($row->sms_unlimited!=1) {
					if($row->sms_limit>0 || $row->sms_unlimited==1) {
						
						$result_set_smslimit = $this->db->query("select * from sms_logs where cus_id =? and datetime=?", array($userid, $curr_date));
						//echo 'sss-'.$result_set_smslimit->num_rows();
						if($result_set_smslimit->num_rows()==0) {
							$this->db->query("INSERT INTO sms_logs(cus_id,datetime,num_alerts) VALUES(?,?,1)", array($userid, $curr_date));
						}
						else {
							foreach($result_set_smslimit->result() as $row_sms_limit) {
								//echo "if(".$row_sms_limit->num_alerts."<".$row->sms_limit.") "; exit;
								if($row_sms_limit->num_alerts<$row->sms_limit || $row->sms_unlimited==1) {
									$this->db->query("UPDATE sms_logs set num_alerts=num_alerts+1 where cus_id=? and datetime=?", array($userid, $curr_date));
								}
								else $send_sms = 1;
								break;
							}
						}
					}
					else $send_sms = 1;
				}
			//}
			//echo "~~~~~send_sms - $send_sms------";
			if($send_sms == 1) continue;
			
			$result_set->free_result();	
			
			$sms_message = '';
			$smssettingsres = $this->db->query("SELECT value FROM dt_generalsettings WHERE name='sms_message'");
			foreach($smssettingsres->result() as $row) {
				$sms_message = $row->value;
			}
			$smssettingsres->free_result();	
			$sms_message = str_replace('##sms_name##',$sms_name,$sms_message);
			$sms_message = str_replace('##type##',(($row_user->type=="bid")?'Selling':'Buying'),$sms_message);
			$sms_message = str_replace('##com_name##',$row_user->com_name,$sms_message);
			$sms_message = str_replace('##rate##',$row_user->rate,$sms_message);
			
			$sms_returnurl = $sms_url; 
			
			$sms_returnurl = str_replace("@@user_name@@", $sms_username, $sms_returnurl);
			$sms_returnurl = str_replace("@@password@@", $sms_password, $sms_returnurl);
			$sms_returnurl = str_replace("@@mobileno@@", $sms_mobiles, $sms_returnurl);	
			$sms_returnurl = str_replace("@@message@@", urlencode($sms_message), $sms_returnurl);	
			$sms_returnurl = str_replace("@@sender_id@@", $sms_senderid, $sms_returnurl);
			//echo $sms_returnurl;exit; // P-DEBUG: removed active debug
			//fopen( $sms_returnurl, "r");
			
			$url = $sms_returnurl;
//"http://control.msg91.com/sendhttp.php?user=".$userName."&password=".$passWord."&mobiles=".$mobiles."&message=".urlencode($message)."&sender=".$senderId;
			//echo $url; exit; // P-DEBUG: removed active debug
		  $ch = curl_init ($url);
		  curl_setopt($ch, CURLOPT_HEADER, 0);
		  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		  curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
		  $rawdata = curl_exec($ch);
		  curl_close ($ch);
		  		  
		  $result_set_user = $this->db->query("update dt_bid_ask set sms_sent=1 where id=?", array($row_user->id));
		  //echo $rawdata;
			//exit;
			
		}
		//echo "10";exit; // P-DEBUG: removed active debug
	}
}
?>
