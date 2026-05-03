<?php 
	$model_name = "customerdelivery_model";
	$controller_name="C_customerDelivery";
	
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>Pending Delivery</title>
	</head>
	<p style="text-align: center">
		<div style="text-align: center">
			<span style="font-size:12px; font-weight:bold;"><?php echo $this->session->userdata('company_name'); ?></span><br/>
			<span style="font-size:11px;">Pending Delivery &nbsp;|&nbsp; Printed On: <?php echo date('d-m-Y H:i:s'); ?></span>
		</div>
	</p>
	<style type="text/css">
		#grid-data tr,#grid-data td,#grid-data tr,#grid-data th
		{
			border:1px solid #000;
			border-collapse: separate;
			font-size:11px;
		}
		#grid-data tbody .values
		{
			text-align:center;
		}
		table 
		{
			border-collapse: collapse;
		}
		table, th, td 
		{
			border: 1px solid black;
		}
		@page {
				size: A4 landscape;
				margin: 8mm;
			}
			@media print  
		{
			#grid-data td, #grid-data th
			{
				page-break-inside: avoid;
				font-size: 9px;
			}
			body { font-size: 9px; }
		}
	</style>
	<body>
	
	<body>
	
		<?php
			$total_gold_sell   =0.00;	
			$total_gold_buy    =0.00;	
			$total_silver_sell =0.00;	
			$total_silver_buy  =0.00;	
			foreach ($customers as $customer) 
			{
				if($customer['book_type'] == 'Sell'){
					if($customer['com_type'] == 1)
					{
						$total_silver_sell = $total_silver_sell+ $customer['BalanceQty'];
					}
					else{
						$total_gold_sell	  = $total_gold_sell  + $customer['BalanceQty'];
					}
				}
				else{
					if($customer['com_type'] == 1)
					{
						$total_silver_buy = $total_silver_buy+ $customer['BalanceQty'];
					}
					else{
						$total_gold_buy	  = $total_gold_buy  + $customer['BalanceQty'];
					}
				}
			}
		?>
		<div class="col-md-12 total_booked" style="display: inline-block;margin-left:0px;">
			<div class="col-md-2"><label class="L-GoldBooked btn btn-primary" >D.Gold Sell(gms)</label> : <span id="gold_sell_del"></span> <?php echo round($total_gold_sell*1000,3);?></div>
			<div class="col-md-2"><label class="L-GoldBooked btn btn-primary" >D.Gold Buy(gms)</label> : <span id="gold_buy_del"></span> <?php echo round($total_gold_buy*1000,3);?></div>
			<div class="col-md-2"><label class="L-SilverBooked btn btn-primary">D.Silver Sell(gms)</label> : <span id="silver_sell_del"></span><?php echo round($total_silver_sell*1000,3);?>
			</div>
			<div class="col-md-2"><label class="L-SilverBooked btn btn-primary">D.Silver Buy(gms)</label> : <span id="silver_buy_del"></span><?php echo round($total_silver_buy*1000,3);?>
			</div>
		</div>
		<div class="col-md-12" style="margin-bottom:10px; padding:0px;display:inline-block;margin-left:-230px;">
			<div class="col-md-10" style="padding: 0px">
				<div class="currentdate">
				<label class="L-SilverBooked btn btn-primary">Date : </label>
					<span id="silver_del"><?php echo date('d-m-Y');?> </span> 
				</div>	
			</div>
		</div>
		<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="width:900px;margin-left:50px; margin-top:-20px;">
			<thead>
				<tr>
					<th width="10%">B.No</th>
					<th width="15%">Book Date</th>
					<th width="10%">Book Type</th>
					<th width="10%">Req Type</th>
					<th width="15%">Name</th>
					<th width="20%">Company</th>
					<th width="15%">Deliver To</th>
					<th width="10%">Mobile</th>
					<th width="15%">Commodity</th>
					<th width="10%">Qty(gms)</th>
					<th width="10%">D.Qty(gms)</th>
					<th width="10%">B.Rate</th>
					<th width="10%">Amount</th>
					<th width="15%">Reporter</th>
					<th width="20%">User Comment</th>
					<th width="20%">Narration</th>
				</tr>
			</thead>
			<tbody>
				<?php
					foreach($customers as $customer) 
					{
						$oType     = $customer['ordertype'] == 0 ? "Book" : "Limit";
						$deliverTo = !empty($customer['deliverto_name']) ? htmlspecialchars($customer['deliverto_name']) : '-';
						$userComment = !empty($customer['book_usercomment']) ? htmlspecialchars($customer['book_usercomment']) : '-';
						$narration   = !empty($customer['book_narration'])   ? htmlspecialchars($customer['book_narration'])   : '-';
						$bookedBy    = !empty($customer['book_by'])          ? $customer['book_by']                           : '-';
						$mobile      = !empty($customer['cus_mobile'])       ? $customer['cus_mobile']                        : '-';
						$company     = !empty($customer['cus_company_name']) ? htmlspecialchars($customer['cus_company_name']) : '-';
						$rate        = !empty($customer['book_rate'])        ? $customer['book_rate']                         : '-';
						$amount      = !empty($customer['bookamount'])       ? $customer['bookamount']                        : '-';
						echo '<tr>
							<td style="text-align:center;">'.$customer['bookno'].'</td>
							<td style="text-align:center;">'.$customer['bookdate'].'</td>
							<td style="text-align:center;">'.$customer['book_type'].'</td>
							<td style="text-align:center;">'.$oType.'</td>
							<td style="text-align:center;">'.htmlspecialchars($customer['customername']).'</td>
							<td style="text-align:center;">'.$company.'</td>
							<td style="text-align:center;">'.$deliverTo.'</td>
							<td style="text-align:center;">'.$mobile.'</td>
							<td style="text-align:center;">'.htmlspecialchars($customer['commodityname']).'</td>
							<td style="text-align:center;">'.round($customer['bookqty']*1000,3).'</td>
							<td style="text-align:center;">'.round($customer['BalanceQty']*1000,3).'</td>
							<td style="text-align:right;">'.$rate.'</td>
							<td style="text-align:right;">'.$amount.'</td>
							<td style="text-align:center;">'.$bookedBy.'</td>
							<td style="text-align:center;">'.$userComment.'</td>	
							<td style="text-align:center;">'.$narration.'</td>	
						</tr>';
					}				
				?>
			</tbody>
		</table>
	</body>
</html>         
<script type="text/javascript">
window.print();
</script>
