<?php 
	$model_name = "customerdelivery_model";
	$controller_name="C_customerDelivery";
	
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>Today Trade Report</title>
	</head>
	<p style="text-align: center">
		<div style="text-align: center">
			<span style="text-align:center; margin-left:-80px;">Today Trade Report</span>
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
		@media print  
		{
			#grid-data td, #grid-data th
			{
				page-break-inside: avoid;
			}
		}
	</style>
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
						$total_silver_sell = $total_silver_sell+ ($customer['bookqty']);
					}
					else{
						$total_gold_sell	  = $total_gold_sell  + ($customer['bookqty']);
					}
				}
				else{
					if($customer['com_type'] == 1)
					{
						$total_silver_buy = $total_silver_buy+ ($customer['bookqty']);
					}
					else{
						$total_gold_buy	  = $total_gold_buy  + ($customer['bookqty']);
					}
				}
			}
		?>
		<div class="col-md-12 total_booked" style="display: inline-block;margin-left:0px;">
			<div class="col-md-2"><label class="L-GoldBooked btn btn-primary" >Gold Sell(gms)</label> : <span id="gold_sell_del"></span> <?php echo round($total_gold_sell*1000,3);?></div>
			<div class="col-md-2"><label class="L-GoldBooked btn btn-primary" >Gold Buy(gms)</label> : <span id="gold_buy_del"></span> <?php echo round($total_gold_buy*1000,3);?></div>
			<div class="col-md-2"><label class="L-SilverBooked btn btn-primary">Silver Sell(gms)</label> : <span id="silver_sell_del"></span><?php echo round($total_silver_sell*1000,3);?>
			</div>
			<div class="col-md-2"><label class="L-SilverBooked btn btn-primary">Silver Buy(gms)</label> : <span id="silver_buy_del"></span><?php echo round($total_silver_buy*1000,3);?>
			</div>
		</div>
		<div class="col-md-12" style="margin-bottom: 10px; padding: 0px;margin-left:800px;">
			<div class="col-md-10" style="padding: 0px">
				<div class="currentdate">
				<label class="L-SilverBooked btn btn-primary">Date : </label>
					<span id="silver_del"><?php echo date('d-m-Y');?> </span> 
					<!--<input style="margin-top:50px; margin-left:100px" type="text"  name="currentdate" id="currentdate" data-date-format="DD-MM-YYYY"  readonly="true" onchange="get_data();" value="<?php echo date('d-m-Y');?>" style="border: none;"/>-->
				</div>	
			</div>
		</div>
		<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="width:900px;margin-left:50px; margin-top:-10px;">
			<thead>
				<tr>
					<th>Book No</th>
					<th>Req Type</th>
					<th>Book Date</th>
					<th>Book Type</th>
					<th>Name</th>
					<th>Mobile No</th>
					<th>Comp Name</th>
					<th>Commodity Name</th>
					<th>Qty(Grms)</th>
					<th>Book Rate</th>
					<th>Amount</th>
					<th>Book By</th>
				</tr>
			</thead>
			<tbody>
				<?php
					foreach($customers as $customer) 
					{	
						$oType = $customer['ordertype'] == 0 ? "Book":"Limit";
						echo'<tr>
							<td style="text-align:center;">'.$customer['bookno'].'</td>
							<td style="text-align:center;">'.$oType.'</td>
							<td style="text-align:center;">'.$customer['bookdate'].'</td>
							<td style="text-align:center;">'.$customer['book_type'].'</td>
							<td style="text-align:center;">'.$customer['customername'].'</td>
							<td style="text-align:center;">'.$customer['cus_mobile'].'</td>
							<td style="text-align:center;">'.$customer['cus_company_name'].'</td>
							<td style="text-align:center;">'.$customer['commodityname'].'</td>
							<td style="text-align:center;">'.round($customer['bookqty']*1000).'</td>
							<td style="text-align:right;">'.$customer['book_rate'].'</td>
							<td style="text-align:right;">'.$customer['bookamount'].'</td>
							<td style="text-align:center;">'.$customer['book_by'].'</td>
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