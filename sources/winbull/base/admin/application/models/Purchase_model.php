<?php
class Purchase_model extends Model {
		var $table_name = 'dt_purchase';		//Initialize table Name

	function Purchase_model() {
		parent::Model();
	}
	
	public function get_data($com_type = -1,$type = -1,$search_type = -1,$from_date = "",$to_date = "")
    {
		$where = "";

		if($com_type != -1)
		{
			$where = $where.' WHERE commodity_type = '.$com_type;
		}

		if($type != -1)
		{
			if($where == "")
			{
				$where = $where." WHERE ";
			}
			else
			{
				$where = $where." AND ";
			}

			$where = $where.' type = '.$type;
		}

		if($search_type != -1 && $search_type != 1)
		{
			if($where == "")
			{
				$where = $where." WHERE ";
			}
			else
			{
				$where = $where." AND ";
			}

			if($search_type == 2)
			{
				$where = $where." DATE(purchase_date) = CURDATE() ";
			}
			else
			{
				$from_date = date('Y-m-d', strtotime($from_date));
				$to_date = date('Y-m-d', strtotime($to_date));

				$where = $where." DATE(purchase_date) BETWEEN '".$from_date."' AND  '".$to_date."' ";
			}
		}

	   	$query = $this->db->query("SELECT
										purchase_id, purchase_date,if(commodity_type != 1, 'Gold','Silver') as commodity_type, weight, if(type = 0 ,'Hedging','Physical') as type, purity, rate, IF(cus_name = '' OR cus_name IS NULL,'-', cus_name) AS cus_name  
									FROM 
										dt_purchase
									LEFT JOIN 
										dt_customer ON cus_id = supplier
										".$where."
									ORDER BY
										purchase_id 
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
		$_POST['fv']['purchase_id']		=	NULL;
		$_POST['fv']['purchase_date']	=	date("d-m-Y h:i:s A");
		$_POST['fv']['weight']			=	NULL;
		$_POST['fv']['mcx_physical']	=	1;
		$_POST['fv']['purity']			=	$records['purity'] == -1 ? '' : ($records['purity'] == 0 ? '995' : ($records['purity'] == -1 ? '' : '999'));
		$_POST['fv']['rate']	=	NULL;	
		return $_POST['fv'];
	}
	
	/*
	* Fetch record for entry when edit 
	*/
   	public function get_entry_record($record_id) 										//Fetch entry record
	{
		//Build contents query			
		$query =$this->db->query("SELECT 
										purchase_id,DATE_FORMAT(purchase_date,'%d-%m-%Y %h:%i %p') as purchase_date, weight, type, purity, rate, commodity_type,supplier
									FROM 
										dt_purchase
								   where purchase_id='".$record_id."'");
		foreach ($query->result() as $row)
		{
			$records['purchase_id']   		= $row->purchase_id;
			$records['purchase_date']   	= $row->purchase_date;;
			$records['weight']  			= ($row->weight*1000);
			$records['mcx_physical']   		= $row->type;
			$records['rate'] 		= $row->rate;	
			$records['purity'] 				= $row->purity;	
			$records['commodity_type'] 		= $row->commodity_type;
			$records['supplier'] 			= $row->supplier;			
		}
		
		//Return all
		return $records;
	}
	public function load_qty()
	{
		$records['gold_qty']  =  0;
		$records['silver_qty']  =  0;
		$records['avg_rate_gold']  =  "-";
		$records['avg_rate_silver']  =  "-";

		$total_gold_sell 	= 0;
		$total_silver_sell 	= 0;
		$avg_gold_sell = 0;
		$avg_silver_sell = 0;
		
		$total_gold_purchase 	= 0;
		$total_silver_purchase 	= 0;
		$avg_gold_purchase 		= 0;
		$avg_silver_purchase 	= 0;
		
		$gold_open_qty  		= 0;
		$gold_open_rate  		= 0;
		$silver_open_qty  		= 0;
		$silver_open_rate  		= 0;
		
		$total_gold_hedge = 0;
		$total_silver_hedge = 0;
		$hedgeSales_gold_rate = 0;
		$hedgeSales_silver_rate = 0;
		
		$q1 =$this->db->query("SELECT 
			SUM(IF(com_type != 1, IF(book_qty IS NULL, 0, book_qty), 0)) AS total_gold_sell, 
			AVG(CASE WHEN com_type != 1 THEN IF(book_rate IS NULL, 0, book_rate/book_comweight) END) AS avg_gold_sell, 
			SUM(IF(com_type = 1, IF(book_qty IS NULL, 0, book_qty), 0)) AS total_silver_sell, 
			AVG(CASE WHEN com_type = 1 THEN IF(book_rate IS NULL, 0, book_rate/book_comweight) END) AS avg_silver_sell 
			from dt_booking left join dt_com_master on book_comid = com_id 
			WHERE book_status = 1 AND book_type = 0 AND IFNULL(delete_status,0) = 0");
		foreach ($q1->result() as $row1)
		{
			$total_gold_sell  		= $row1->total_gold_sell;
			$total_silver_sell  	= $row1->total_silver_sell;
			$avg_gold_sell  		= $row1->avg_gold_sell;
			$avg_silver_sell  		= $row1->avg_silver_sell;			
		}
		
		$q2 =$this->db->query("SELECT 
				SUM(IF(commodity_type != 1, IF(weight IS NULL, 0, weight), 0)) AS total_gold_purchase, 
				AVG(CASE WHEN commodity_type != 1 AND type = 1 THEN IF(rate IS NULL, 0, rate) END) AS avg_gold_purchase, 
				SUM(IF(commodity_type = 1, IF(weight IS NULL, 0, weight), 0)) AS total_silver_purchase, 
				AVG(CASE WHEN commodity_type = 1 AND type = 1 THEN IF(rate IS NULL, 0, rate) END) AS avg_silver_purchase 
				from dt_purchase");
		foreach ($q2->result() as $row2)
		{
			$total_gold_purchase  		= $row2->total_gold_purchase;
			$total_silver_purchase  	= $row2->total_silver_purchase;
			$avg_gold_purchase  		= $row2->avg_gold_purchase;
			$avg_silver_purchase  		= $row2->avg_silver_purchase;			
		}

		$q5 =$this->db->query("SELECT 
				SUM(IF(commodity_type != 1, IF(weight IS NULL, 0, weight), 0)) AS total_gold_hedge, 
				SUM(IF(commodity_type = 1, IF(weight IS NULL, 0, weight), 0)) AS total_silver_hedge
				from dt_hedging");
		foreach ($q5->result() as $row5)
		{
			$total_gold_hedge  		= $row5->total_gold_hedge;
			$total_silver_hedge  	= $row5->total_silver_hedge;		
		}
		
		$q6 =$this->db->query("SELECT 
				AVG(CASE WHEN commodity_type != 1 AND type = 0 THEN IF(avg_rate IS NULL, 0, avg_rate) END) AS hedgeSales_gold_rate, 
				AVG(CASE WHEN commodity_type = 1 AND type = 0 THEN IF(avg_rate IS NULL, 0, avg_rate) END) AS hedgeSales_silver_rate
				from dt_purchase");
		foreach ($q6->result() as $row6)
		{
			/*$hedgeSales_gold_rate  		= $row6->hedgeSales_gold_rate;
			$hedgeSales_silver_rate  	= $row6->hedgeSales_silver_rate;*/
			$hedgeSales_gold_rate  		= 0;
			$hedgeSales_silver_rate  	= 0;
		}
		
		$q3 =$this->db->query("SELECT IF(gold_open_qty IS NULL OR gold_open_qty = '' OR gold_open_rate IS NULL OR gold_open_rate = '', 0,  gold_open_qty) AS gold_open_qty, IF(gold_open_qty IS NULL OR gold_open_qty = '' OR gold_open_rate IS NULL OR gold_open_rate = '', 0,  gold_open_rate) AS gold_open_rate, IF(silver_open_qty IS NULL OR silver_open_qty = '' OR silver_open_rate IS NULL OR silver_open_rate = '', 0,  silver_open_qty) AS silver_open_qty, IF(silver_open_qty IS NULL OR silver_open_qty = '' OR silver_open_rate IS NULL OR silver_open_rate = '', 0,  silver_open_rate) AS silver_open_rate  FROM dt_generalsettings");
		foreach ($q3->result() as $row3)
		{
			$gold_open_qty  		= $row3->gold_open_qty;
			$gold_open_rate  		= $row3->gold_open_rate;
			$silver_open_qty  		= $row3->silver_open_qty;
			$silver_open_rate  		= $row3->silver_open_rate/1000;			
		}
		$records['gold_qty'] 	= ($gold_open_qty+$total_gold_sell-$total_gold_purchase+$total_gold_hedge)*1000;
		$records['silver_qty']  = $silver_open_qty+$total_silver_sell-$total_silver_purchase+$total_silver_hedge;

		if($records['gold_qty'] > 0)
		{
			$total = 0;
			$nos = 0;
			if($gold_open_qty > 0)
			{
				$total 	= $total + $gold_open_rate;
				$nos 	= $nos+1;
			}
			if($total_gold_sell > 0)
			{
				$total 	= $total + $avg_gold_sell;
				$nos 	= $nos+1;
			}
			/*if($total_gold_hedge > 0)
			{
				$total 	= $total + $hedgeSales_gold_rate;
				$nos 	= $nos+1;
			}*/
			if($total > 0 && $nos > 0)
			{
				$records['avg_rate_gold']  = ROUND($total/$nos,2);
			}
		}
		else if($records['gold_qty'] < 0)
		{
			if($gold_open_qty < 0 && $total_gold_purchase > 0)
				$records['avg_rate_gold']  = ROUND(($avg_gold_purchase+$silver_open_rate)/2,2);
			else if($gold_open_qty >= 0 && $total_gold_purchase > 0)
				$records['avg_rate_gold']  = ROUND($avg_gold_purchase,2);
			else if($gold_open_qty < 0 && $total_gold_sell <= 0)
				$records['avg_rate_gold']  = ROUND($gold_open_rate,2);
		}
		if($records['silver_qty'] > 0)
		{
			$total = 0;
			$nos = 0;
			if($silver_open_qty > 0)
			{
				$total 	= $total + $silver_open_rate;
				$nos 	= $nos+1;
			}
			if($total_silver_sell > 0)
			{
				$total 	= $total + $avg_silver_sell;
				$nos 	= $nos+1;
			}
			/*if($total_silver_hedge > 0)
			{
				$total 	= $total + $hedgeSales_silver_rate;
				$nos 	= $nos+1;
			}*/
			if($total > 0 && $nos > 0)
			{
				$records['avg_rate_silver']  = ROUND(($total/$nos)*1000,2);
			}		
		}
		else if($records['silver_qty'] < 0)
		{
			if($silver_open_qty < 0 && $total_silver_purchase > 0)
				$records['avg_rate_silver']  = ROUND((($avg_silver_purchase+$silver_open_rate)/2)*1000,2);
			else if($silver_open_qty >= 0 && $total_silver_purchase > 0)
				$records['avg_rate_silver']  = ROUND($avg_silver_purchase*1000,2);
			else if($silver_open_qty < 0 && $total_silver_purchase <= 0)
				$records['avg_rate_silver']  = ROUND($silver_open_rate*1000,2);
		}
		$cg_physical 	= 0;
		$cg_mcx 		= 0;
		$cs_physical 	= 0;
		$cs_mcx 		= 0;
		$gg_physical 	= 0;
		$gs_physical 	= 0;
		$hg_mcx			= 0;
		$hs_mcx			= 0;
		
		$cg_physical_avg 	= 0;
		$cg_mcx_avg			= 0;
		$cs_physical_avg 	= 0;
		$cs_mcx_avg 		= 0;
		$gg_physical_avg 	= 0;
		$gs_physical_avg 	= 0;
		$hg_mcx_avg			= 0;
		$hs_mcx_avg			= 0;

		$records['pending_phyGold_qty'] 	= 0;
		$records['pending_mcxGold_qty'] 	= 0;
		$records['pending_phySilver_qty'] 	= 0;
		$records['pending_mcxSilver_qty'] 	= 0;

		$records['pending_phyGold_avg'] 	= 0;
		$records['pending_mcxGold_avg'] 	= 0;
		$records['pending_phySilver_avg'] 	= 0;
		$records['pending_mcxSilver_avg'] 	= 0;

		$q4 =$this->db->query("SELECT 
			SUM(IF(type=1 AND commodity_type = 0 , (IF(weight IS NULL, 0, weight)) ,0)) AS gold_physical, 
			AVG(case when type=1 AND commodity_type = 0 then (IF(rate IS NULL, 0, rate)) end) AS gold_physical_avg, 
			SUM(IF(type=0 AND commodity_type = 0 , (IF(weight IS NULL, 0, weight)) ,0)) AS gold_mcx, 
			AVG(case when type=0 AND commodity_type = 0 then (IF(rate IS NULL, 0, rate)) end) AS gold_mcx_avg, SUM(IF(type=1 AND commodity_type = 1 , (IF(weight IS NULL, 0, weight)) ,0)) AS silver_physical, 
			AVG(case when type=1 AND commodity_type = 1 then (IF(rate IS NULL, 0, rate)) end) AS silver_physical_avg, 
			SUM(IF(type=0 AND commodity_type = 1 , (IF(weight IS NULL, 0, weight)) ,0)) AS silver_mcx, 
			AVG(case when type=0 AND commodity_type = 1 then (IF(rate IS NULL, 0, rate)) end) AS silver_mcx_avg
			FROM dt_purchase");
		foreach ($q4->result() as $row4)
		{
			$cg_physical  		= $row4->gold_physical;
			$cg_physical_avg	= $row4->gold_physical_avg;
			$cg_mcx  			= $row4->gold_mcx;
			$cg_mcx_avg 		= $row4->gold_mcx_avg;
			$cs_physical 		= $row4->silver_physical;
			$cs_physical_avg 	= $row4->silver_physical_avg;
			$cs_mcx 			= $row4->silver_mcx;
			$cs_mcx_avg 		= $row4->silver_mcx_avg;			
		}
		
		$q3 =$this->db->query("SELECT SUM(IF(commodity_type = 0 , (IF(weight IS NULL, 0, weight)) ,0)) AS gold_physical, SUM(IF(commodity_type = 1 , (IF(weight IS NULL, 0, weight)) ,0)) AS silver_physical FROM dt_grn");
		foreach ($q3->result() as $row3)
		{
			$gg_physical  	= $row3->gold_physical;
			$gs_physical  	= $row3->silver_physical;		
		}
		$q4 =$this->db->query("SELECT 
				SUM(IF(commodity_type = 0 , (IF(weight IS NULL, 0, weight)) ,0)) AS gold_mcx, 
				AVG(case when commodity_type = 0 then (IF(rate IS NULL, 0, rate)) end) AS gold_mcx_avg, 
				SUM(IF(commodity_type = 1 , (IF(weight IS NULL, 0, weight)) ,0)) AS silver_mcx, 
				AVG(case when commodity_type = 1 then (IF(rate IS NULL, 0, rate)) end) AS silver_mcx_avg 
				FROM dt_hedging");
		foreach ($q4->result() as $row4)
		{
			$hg_mcx  		= $row4->gold_mcx;
			$hg_mcx_avg 	= $row4->gold_mcx_avg;
			$hs_mcx  		= $row4->silver_mcx;
			$hs_mcx_avg  	= $row4->silver_mcx_avg;			
		}

		$records['pending_phyGold_qty'] 	= ($cg_physical-$gg_physical)*1000;
		$records['pending_mcxGold_qty'] 	= ($cg_mcx-$hg_mcx)*1000;
		$records['pending_phySilver_qty'] 	= ($cs_physical-$gs_physical);
		$records['pending_mcxSilver_qty'] 	= ($cs_mcx-$hs_mcx);
		
		if($records['pending_phyGold_qty'] > 0)
		{
			$records['pending_phyGold_avg'] = ROUND($cg_physical_avg,2);
		}
		else
		{
			$records['pending_phyGold_avg'] = "";	
		}
		
		if($records['pending_mcxGold_qty'] > 0)
		{
			$records['pending_mcxGold_avg'] = ROUND($cg_mcx_avg,2);
		}
		else
		{
			$records['pending_mcxGold_avg'] = ROUND($hg_mcx_avg,2);			
		}
		
		
		if($records['pending_phySilver_qty'] > 0)
		{
			$records['pending_phySilver_avg'] = ROUND($cs_physical_avg*1000,2);
		}
		else
		{
			$records['pending_phySilver_avg'] = "";		
		}

		if($records['pending_mcxSilver_qty'] > 0)
		{
			$records['pending_mcxSilver_avg'] = ROUND($cs_mcx_avg*1000,2);
		}
		else
		{
			$records['pending_mcxSilver_avg'] = ROUND($hs_mcx_avg*1000,2);			
		}

		return $records;
	}
	
	public function get_coverupReport($type = 0)
	{	
		$full_array = array();
		$return_array = array();
		$qty_hedge = array();
		$open_qty = 0;
		$open_rate = 0;

		if($type == 0)
		{
			$sales_qty = array();
			$purchase_qty = array();
			 
			$hedgeQ =$this->db->query("SELECT DATE(hedge_date) AS hedge_date,
				SUM(IF(weight IS NULL, 0, weight)) AS total_gold_hedge
				from dt_hedging WHERE commodity_type != 1 GROUP BY DATE(hedge_date)");
				
			foreach ($hedgeQ->result() as $hedge)
			{
				$qty_hedge[] = array("hedge_date" => date('d-m-Y',strtotime($hedge->hedge_date)), "hedge_qty" => $hedge->total_gold_hedge*1000);
			}

			$query1 =$this->db->query("SELECT table_a.book_date_sell AS book_date_sell, IFNULL(table_a.sell_qty,0) AS sell_qty, table_a.avg_sell_rate AS avg_sell_rate  FROM 

			(SELECT DATE(book_datetime) AS book_date_sell, SUM(IF(book_qty IS NULL, 0, book_qty)) AS sell_qty, ROUND(AVG(book_rate/book_comweight),2) AS avg_sell_rate  from dt_booking left join dt_com_master on book_comid = com_id where com_type != 1 AND book_status = 1 AND book_type = 0 AND IFNULL(delete_status,0) = 0 GROUP BY DATE(book_datetime) ORDER BY DATE(book_datetime)) AS table_a 

			 ORDER BY book_date_sell");
			
			foreach ($query1->result() as $row1)
			{
				$hedge_index = 0;
				$salesQty = $row1->sell_qty*1000;
				$salesDate = date('d-m-Y',strtotime($row1->book_date_sell));
				foreach($qty_hedge as $qh)
				{
					if($salesDate == $qh['hedge_date'])
					{
						$salesQty = $salesQty+$qh['hedge_qty'];
						unset($qty_hedge[$hedge_index]);
						$qty_hedge = array_values($qty_hedge);
						break;
					}
					$hedge_index++;
				}

				$sales_qty[]  = array("sales_date" => $salesDate, "sales_qty" => $salesQty, "sell_avg" => $row1->avg_sell_rate);
			}
			foreach($qty_hedge as $qh1)
			{
				$sales_qty[]  = array("sales_date" => $qh1['hedge_date'], "sales_qty" => $qh1['hedge_qty'], "sell_avg" => 0);
			}

			$query2 =$this->db->query("SELECT SUM(IF(weight IS NULL, 0, weight)) AS purchase_qty, DATE(purchase_date) AS purchase_date, ROUND(AVG(rate),2) AS purchase_avg from dt_purchase where commodity_type != 1  GROUP BY DATE(purchase_date) ORDER BY DATE(purchase_date)");

			foreach ($query2->result() as $row2)
			{
				$purchase_qty[]  = array("purchase_date" => date('d-m-Y',strtotime($row2->purchase_date)), "purchase_qty" => ($row2->purchase_qty*1000), "purchase_avg" => $row2->purchase_avg);				
			}

			$query3 =$this->db->query("SELECT IF(gold_open_qty > 0 || gold_open_qty < 0, gold_open_qty, 0) AS gold_open_qty, IF(gold_open_rate IS NULL, 0, gold_open_rate) AS gold_open_rate FROM dt_generalsettings");
			
			foreach ($query3->result() as $row3)
			{
				$open_qty = $row3->gold_open_qty;
				$open_rate = $row3->gold_open_rate;
			}

			if(sizeof($sales_qty) > 0 || sizeof($purchase_qty) > 0 || $open_qty != 0)
			{
				 $sales_index = 0;
				 foreach($sales_qty as $sales)
				 {
					$isPurchase = false;
					$salesDate = $sales['sales_date'];
					$salesQty = $sales['sales_qty'];
					$salesAvg = $sales['sell_avg'];

					$pur_index = 0;
					foreach($purchase_qty as $purchase)
					{
						$purchaseDate = $purchase['purchase_date'];
						$purchaseQty =  $purchase['purchase_qty'];
						$purchase_avg = $purchase['purchase_avg'];
						if($salesDate == $purchaseDate)
						{
							$isPurchase = true;
							$full_array[] = array("date" => $salesDate, 'salesQty' => $salesQty,'sell_avg' => $salesAvg, 'purchaseQty'=>$purchaseQty, 'purchase_avg'=>$purchase_avg, 'comm'=>"Gold");
							unset($purchase_qty[$pur_index]);
							$purchase_qty = array_values($purchase_qty);
							break;
						}
						$pur_index++;
					}
					if(!$isPurchase)
					{
						$full_array[] = array("date" => $salesDate, 'salesQty' => $salesQty,'sell_avg' => $salesAvg,'purchaseQty'=> 0.00,'purchase_avg'=> 0.00,'comm'=>"Gold");
					}
					unset($sales_qty[$sales_index]);
					$sales_index++;
				 }
				 foreach($purchase_qty as $purchase1)
				 {
					 $purchaseDate = $purchase1['purchase_date'];
					 $purchaseQty  = $purchase1['purchase_qty'];
					 $purchase_avg = $purchase1['purchase_avg'];
					 $isPurchase = true;
					 $full_array[] = array("date" => $purchaseDate, 'salesQty' => 0.00,'sell_avg' => 0.00,'purchaseQty'=>$purchaseQty,'purchase_avg'=>$purchase_avg,'comm'=>"Gold");
				 }
				 
				usort($full_array, array($this,'compare_dates'));
	
				$opening_qty = 0;
				$closing_qty = 0;
				$opening_avg = 0;
				$closing_avg = 0;
				
				if($open_qty != 0)
				{
					$opening_qty = 0;
					$opening_avg = 0;
					$salesQty = $open_qty*1000;
					$sell_avg = $open_rate;
					$purchaseQty = 0;
					$purchase_avg = 0;
					$closing_qty = 	$salesQty;
					$closing_avg = 	$sell_avg;

					$return_array[] = array("date" => "(Opening)", 'opening_qty' => $opening_qty,'opening_avg' => $opening_avg,'salesQty' => $salesQty,'sell_avg' => $sell_avg,'purchaseQty'=> $purchaseQty,'purchase_avg'=> $purchase_avg,'closing_qty'=> $closing_qty,'closing_avg'=> $closing_avg,'comm'=>"Gold");
				}

				foreach($full_array as $all)
				{
					$opening_qty = $closing_qty;
					$closing_qty = $opening_qty + $all['salesQty'] - $all['purchaseQty'];
					$searchDate = date('Y-m-d',strtotime($all['date']));
					
					$opening_avg = $closing_avg;
					
					if($closing_qty > 0)
					{
						$q1 =$this->db->query("SELECT SUM(IF(book_qty IS NULL, 0, book_qty)) AS book_qty, AVG(book_rate/book_comweight) AS gold_1gram_rate FROM dt_booking left join dt_com_master on book_comid = com_id where com_type != 1 AND book_status = 1 AND book_type = 0 AND IFNULL(delete_status,0) = 0 AND DATE(book_datetime) <= '".$searchDate."' HAVING book_qty > 0");

						$rate_total = 0;
						$no_bookings = 0;
						foreach($q1->result() as $r1)
						{
							$rate_total = $rate_total + $r1->gold_1gram_rate;
							$no_bookings = $no_bookings + 1;
						}
						if($open_qty > 0)
						{
							$rate_total = $rate_total + $open_rate;
							$no_bookings = $no_bookings + 1;
						}
						if($rate_total > 0 && $no_bookings > 0)
						{
							$closing_avg = round($rate_total/$no_bookings,2);
						}
					}
					else if($closing_qty < 0)
					{
						$q1 =$this->db->query("SELECT SUM(IF(weight IS NULL, 0, weight)) AS weight, AVG(rate) AS gold_1gram_rate FROM dt_purchase where commodity_type != 1 AND DATE(purchase_date) <= '".$searchDate."' HAVING weight > 0");
						
						$rate_total = 0;
						$no_bookings = 0;
						foreach($q1->result() as $r1)
						{
							$rate_total = $rate_total + $r1->gold_1gram_rate;
							$no_bookings = $no_bookings + 1;
						}
						if($open_qty < 0)
						{
							$rate_total = $rate_total + $open_rate;
							$no_bookings = $no_bookings + 1;
						}
						if($rate_total > 0 && $no_bookings > 0)
						{
							$closing_avg = round($rate_total/$no_bookings,2);
						}
					}

					$return_array[] = array("date" => date('Y-m-d',strtotime($all['date'])), 'opening_qty' => $opening_qty,'opening_avg' => $opening_avg,'salesQty' => $all['salesQty'],'sell_avg' => $all['sell_avg'],'purchaseQty'=> $all['purchaseQty'],'purchase_avg'=> $all['purchase_avg'],'closing_qty'=> $closing_qty,'closing_avg'=> $closing_avg,'comm'=>"Gold");
				}
			}
		}
		else if($type == 1)
		{
			$sales_qty = array();
			$purchase_qty = array();
			 
			$hedgeQ =$this->db->query("SELECT DATE(hedge_date) AS hedge_date, 
				SUM(IF(commodity_type = 1, IF(weight IS NULL, 0, weight), 0)) AS total_silver_hedge
				from dt_hedging WHERE commodity_type = 1 GROUP BY DATE(hedge_date)");
				
			foreach ($hedgeQ->result() as $hedge)
			{
				$qty_hedge[] = array("hedge_date" => date('d-m-Y',strtotime($hedge->hedge_date)), "hedge_qty" =>$hedge->total_silver_hedge*1000);
			}

			$query1 =$this->db->query("SELECT table_a.book_date_sell AS book_date_sell, IFNULL(table_a.sell_qty,0) AS sell_qty, table_a.avg_sell_rate AS avg_sell_rate FROM 

			(SELECT DATE(book_datetime) AS book_date_sell, SUM(IF(book_qty IS NULL, 0, book_qty)) AS sell_qty, ROUND(AVG(book_rate/book_comweight),2) AS avg_sell_rate  FROM dt_booking left join dt_com_master on book_comid = com_id where com_type = 1 AND book_status = 1 AND book_type = 0 AND IFNULL(delete_status,0) = 0 GROUP BY DATE(book_datetime) ORDER BY DATE(book_datetime)) AS table_a

			UNION
			 
			SELECT table_a.book_date_sell AS book_date_sell, IFNULL(table_a.sell_qty,0) AS sell_qty, table_a.avg_sell_rate AS avg_sell_rate FROM
			  
			(SELECT DATE(book_datetime) AS book_date_sell, SUM(IF(book_qty IS NULL, 0, book_qty)) AS sell_qty, ROUND(AVG(book_rate/book_comweight),2) AS avg_sell_rate  from dt_booking left join dt_com_master on book_comid = com_id where com_type = 1 AND book_status = 1 AND book_type = 0 AND IFNULL(delete_status,0) = 0 GROUP BY DATE(book_datetime) ORDER BY DATE(book_datetime)) AS table_a

			ORDER BY book_date_sell");
			
			foreach ($query1->result() as $row1)
			{
				$hedge_index = 0;
				$salesQty = $row1->sell_qty*1000;
				$salesDate = date('d-m-Y',strtotime($row1->book_date_sell));
				foreach($qty_hedge as $qh)
				{
					if($salesDate == $qh['hedge_date'])
					{
						$salesQty = $salesQty+$qh['hedge_qty'];
						unset($qty_hedge[$hedge_index]);
						$qty_hedge = array_values($qty_hedge);
						break;
					}
					$hedge_index++;
				}

				$sales_qty[]  = array("sales_date" => $salesDate, "sales_qty" => $salesQty, "sell_avg" => $row1->avg_sell_rate);
			}
			foreach($qty_hedge as $qh1)
			{
				$sales_qty[]  = array("sales_date" => $qh1['hedge_date'], "sales_qty" => $qh1['hedge_qty'], "sell_avg" => 0);
			}

			$query2 =$this->db->query("SELECT SUM(IF(weight IS NULL, 0, weight)) AS purchase_qty, DATE(purchase_date) AS purchase_date, ROUND(AVG(rate),2) AS purchase_avg from dt_purchase where commodity_type = 1  GROUP BY DATE(purchase_date) ORDER BY DATE(purchase_date)");
			 
			foreach ($query2->result() as $row2)
			{
				$purchase_qty[]  = array("purchase_date" => date('d-m-Y',strtotime($row2->purchase_date)), "purchase_qty" => ($row2->purchase_qty*1000), "purchase_avg" => $row2->purchase_avg);				
			}
			 
			$query3 =$this->db->query("SELECT IF(silver_open_qty > 0 || silver_open_qty < 0, silver_open_qty, 0) AS silver_open_qty, IF(silver_open_rate IS NULL, 0, silver_open_rate) AS silver_open_rate FROM dt_generalsettings");

			foreach ($query3->result() as $row3)
			{
				$open_qty = $row3->silver_open_qty;
				$open_rate = $row3->silver_open_rate;
			}

			if(sizeof($sales_qty) > 0 || sizeof($purchase_qty) > 0 || $open_qty != 0)
			{
				$sales_index = 0;
				foreach($sales_qty as $sales)
				{
					$isPurchase = false;
					$salesDate = $sales['sales_date'];
					$salesQty = $sales['sales_qty'];
					$salesAvg = $sales['sell_avg'];
					$pur_index = 0;

					foreach($purchase_qty as $purchase)
					{
						 $purchaseDate = $purchase['purchase_date'];
						 $purchaseQty = $purchase['purchase_qty'];
						 $purchase_avg = $purchase['purchase_avg'];
						 if($salesDate == $purchaseDate)
						 {
							 $isPurchase = true;
							 $full_array[] = array("date" => $salesDate, 'salesQty' => $salesQty/1000,'sell_avg' => $salesAvg*1000, 'purchaseQty'=>$purchaseQty/1000, 'purchase_avg'=>$purchase_avg*1000, 'comm'=>"Silver");
							 unset($purchase_qty[$pur_index]);
							 $purchase_qty = array_values($purchase_qty);
							 break;
						 }
						$pur_index++;
					}
					if(!$isPurchase)
					{
						  $full_array[] = array("date" => $salesDate, 'salesQty' => $salesQty/1000,'sell_avg' => $salesAvg*1000,'purchaseQty'=> 0.00,'purchase_avg'=> 0.00,'comm'=>"Silver");
					}
					unset($sales_qty[$sales_index]);
					$sales_index++;
				}

				foreach($purchase_qty as $purchase1)
				{
					 $purchaseDate = $purchase1['purchase_date'];
					 $purchaseQty = $purchase1['purchase_qty'];
					 $purchase_avg = $purchase1['purchase_avg'];
					 $isPurchase = true;
					 $full_array[] = array("date" => $purchaseDate, 'salesQty' => 0.00, 'sell_avg' => 0.00, 'purchaseQty'=>$purchaseQty/1000, 'purchase_avg'=>$purchase_avg*1000, 'comm'=>"Silver");
				}
				
				
				usort($full_array, array($this,'compare_dates'));

				$opening_qty = 0;
				$closing_qty = 0;
				$opening_avg = 0;
				$closing_avg = 0;
				
				if($open_qty != 0)
				{
					$opening_qty = 0;
					$opening_avg = 0;
					$salesQty = $open_qty;
					$sell_avg = $open_rate;
					$purchaseQty = 0;
					$purchase_avg = 0;
					$closing_qty = 	$salesQty;
					$closing_avg = 	$sell_avg;
					
					$return_array[] = array("date" => "(Opening)", 'opening_qty' => $opening_qty,'opening_avg' => $opening_avg,'salesQty' => $salesQty,'sell_avg' => $sell_avg,'purchaseQty'=> $purchaseQty,'purchase_avg'=> $purchase_avg,'closing_qty'=> $closing_qty,'closing_avg'=> $closing_avg,'comm'=>"Silver");
				}
				
				foreach($full_array as $all)
				{
					$opening_qty = $closing_qty;
					$closing_qty = $opening_qty + $all['salesQty'] - $all['purchaseQty'];
					$searchDate = date('Y-m-d',strtotime($all['date']));
					
					$opening_avg = $closing_avg;
					
					if($closing_qty > 0)
					{
						$q1 =$this->db->query("SELECT SUM(IF(book_qty IS NULL, 0, book_qty)) AS book_qty, AVG(book_rate/book_comweight)*1000 AS silver_rate FROM dt_booking left join dt_com_master on book_comid = com_id where com_type = 1 AND book_status = 1 AND book_type = 0 AND IFNULL(delete_status,0) = 0 AND DATE(book_datetime) <= '".$searchDate."' HAVING book_qty > 0");

						$rate_total = 0;
						$no_bookings = 0;
						foreach($q1->result() as $r1)
						{
							$rate_total 	= $rate_total + $r1->silver_rate;
							$no_bookings 	= $no_bookings + 1;
						}

						if($open_qty > 0)
						{
							$rate_total = $rate_total + $open_rate;
							$no_bookings = $no_bookings + 1;
						}

						if($rate_total > 0 && $no_bookings > 0)
						{
							$closing_avg = round(($rate_total)/$no_bookings,2);
						}

					}
					else if($closing_qty < 0)
					{
						$q1 =$this->db->query("SELECT SUM(IF(weight IS NULL, 0, weight)) AS weight, AVG(rate)*1000 AS silver_rate FROM dt_purchase where commodity_type = 1 AND DATE(purchase_date) <= '".$searchDate."'  HAVING weight > 0");

						$rate_total = 0;
						$no_bookings = 0;
						foreach($q1->result() as $r1)
						{
							$rate_total = $rate_total + $r1->silver_rate;
							$no_bookings = $no_bookings + 1;
						}
						if($open_qty < 0)
						{
							$rate_total = $rate_total + $open_rate;
							$no_bookings = $no_bookings + 1;
						}
						if($rate_total > 0 && $no_bookings > 0)
						{
							$closing_avg = round(($rate_total)/$no_bookings,2);
						}
					}

					$return_array[] = array("date" => date('Y-m-d',strtotime($all['date'])), 'opening_qty' => $opening_qty,'opening_avg' => $opening_avg,'salesQty' => $all['salesQty'],'sell_avg' => $all['sell_avg'],'purchaseQty'=> $all['purchaseQty'],'purchase_avg'=> $all['purchase_avg'],'closing_qty'=> $closing_qty,'closing_avg'=> $closing_avg,'comm'=>"Silver");
				}
			 }
		}

		return $return_array;
	}
	function compare_dates($a, $b)
	{
		$t1 = strtotime($a['date']);
		$t2 = strtotime($b['date']);
		return ($t1 >$t2) ? 1:-1; //changing 1 and -1 position will make it descending
	} 
	/**
	* Remove record
	* @param id
	* @return boolean
	*/
	public function delete_record($record_id) 
	{
		// Capture old data before delete
		$old_query = $this->db->query("SELECT * FROM dt_purchase WHERE purchase_id = ?", array($record_id));
		$old_data = $old_query->row_array();

		if($this->db->query("DELETE FROM dt_purchase WHERE purchase_id=?", array($record_id))) {
			if (!empty($old_data)) {
				log_admin_delete('27', 'Purchase', $old_data, 'Admin - Deleted purchase record ID: ' . $record_id);
			}
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
		$_POST['fv']['purchase_date'] = isset($_POST['fv']['purchase_date']) ? date('Y-m-d H:i:s',strtotime($_POST['fv']['purchase_date'])):date('Y-m-d H:i:s');
		
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
		
		if($_POST['fv']['type'] == 0)
		{
			if($_POST['fv']['commodity_type'] == 1)
			{
				$_POST['fv']['avg_rate'] = $_POST['fv']['avg_rate']/1000;
			}
			else
			{
				$_POST['fv']['avg_rate'] = $_POST['fv']['avg_rate'];
			}
		}
		else
		{
			$_POST['fv']['avg_rate'] = 0;
		}
		
		if($this->db->insert($this->table_name, $_POST['fv'])) {
			$insert_id = $this->db->insert_id();
			log_admin_add('27', 'Purchase', array_merge(['purchase_id' => $insert_id], $_POST['fv']), 'Admin - Added new purchase record ID: ' . $insert_id);
			return TRUE;
		}
		else
			return FALSE;						
    }
	public function update_record($id)
	{
		// Capture old data before update
		$old_query = $this->db->query("SELECT * FROM dt_purchase WHERE purchase_id = ?", array($id));
		$old_data = $old_query->row_array();

		//Update Data
		$_POST['fv']['purchase_date'] = date('Y-m-d H:i:s',strtotime($_POST['fv']['purchase_date']));
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
		if($this->db->update($this->table_name, $_POST['fv'], array('purchase_id' => $id))) {
			if (!empty($old_data)) {
				log_admin_edit('27', 'Purchase', $old_data, array_merge(['purchase_id' => $id], $_POST['fv']), 'Admin - Updated purchase record ID: ' . $id);
			}
			return TRUE;
		}
		else
			return FALSE;
    }
	public function close_hedging()
	{
		$_POST['fv']['hedge_date'] = date('Y-m-d H:i:s');
		if($_POST['fv']['commodity_type'] == 1)
		{
			$_POST['fv']['weight'] 	= $_POST['fv']['weight'];
			$_POST['fv']['rate'] 	= $_POST['fv']['rate'] /1000;
		}
		else
		{
			$_POST['fv']['weight'] = $_POST['fv']['weight'] /1000;
			$_POST['fv']['rate']   = $_POST['fv']['rate'];
		}
		if($this->db->insert("dt_hedging", $_POST['fv'])) {
			$insert_id = $this->db->insert_id();
			log_admin_add('27', 'Purchase - Hedging', array_merge(['hedging_id' => $insert_id], $_POST['fv']), 'Admin - Closed hedging, new record ID: ' . $insert_id);
			return TRUE;
		}
		else
			return FALSE;
	}
	public function get_hedging_data($com_type = -1)
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
										hedging_id, DATE_FORMAT(hedge_date,'%d-%m-%Y %h:%i %p') as hedge_date,if(commodity_type != 1, 'Gold','Silver') as commodity_type, weight, rate  
									FROM 
										dt_hedging
										".$where."
									ORDER BY
										hedging_id 
									DESC");
		return $query;
    }
	public function delete_hedging_data($record_id)
	{
		// Capture old data before delete
		$old_query = $this->db->query("SELECT * FROM dt_hedging WHERE hedging_id = ?", array($record_id));
		$old_data = $old_query->row_array();

		if($this->db->query("DELETE FROM dt_hedging WHERE hedging_id=?", array($record_id))) {
			if (!empty($old_data)) {
				log_admin_delete('27', 'Purchase - Hedging', $old_data, 'Admin - Deleted hedging record ID: ' . $record_id);
			}
			return TRUE;
		}
		else
			return FALSE;
	}
	
}
?>