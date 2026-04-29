<?php 
	$model_name = "customerdelivery_model";
	$controller_name="C_customerDelivery";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>Deal Register </title>
	</head>
	<p style="text-align: center">
		<div style="text-align: center">
			<span style="text-align:center; margin-left:-80px;">Deal Register </span>
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
			$gold_bookQty   =0.00;	
			$silver_bookQty =0.00;			
			foreach($customers as $customer) 
			{
				if($customer['com_type'] == 1)
				{
					$silver_bookQty = $silver_bookQty + $customer['bookqty'];
				}
				else
				{
					$gold_bookQty = $gold_bookQty + $customer['bookqty'];
				}
			}
		?>
		<div class="col-md-12 total_booked" style="margin-bottom: -150px; padding: 0px;display: inline-block;margin-left:65px;">
			<div class="col-md-2"><label class="L-GoldBooked btn btn-primary" >Gold(gms)</label>   : <span id="gold_booked"></span><?php echo $gold_bookQty;?></div>
			<div class="col-md-2"><label class="L-SilverBooked btn btn-primary" >Silver(gms)</label> : <span id="silver_booked"></span><?php echo $silver_bookQty;?></div>
		</div>
		<div class="col-md-12" style="margin-bottom: 10px; padding: 0px;margin-left:-235px;display: inline-block;">
			<div class="col-md-10" style="padding: 0px">
				<div class="currentdate">
				<label class="L-SilverBooked btn btn-primary">Date : </label>
					<span id="silver_del"><?php echo date('d-m-Y');?> </span> 
					<!--<input style="margin-top:50px; margin-left:100px" type="text"  name="currentdate" id="currentdate" data-date-format="DD-MM-YYYY"  readonly="true" onchange="get_data();" value="<?php echo date('d-m-Y');?>" style="border: none;"/>-->
				</div>	
			</div>
		</div>
		<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="width:900px;margin-left:50px; margin-top:-20px;">
			<thead>
				<tr>
					<th width="15%">B.No</th>
					<th width="15%">Req Type</th>
					<th width="15%">B.Type</th>
					<th width="15%">B.Date</th>
					<th width="30%">Cus Name</th>
					<th width="10%">Company</th>
					<!-- BZ-27: Added missing Mobile column -->
					<th width="15%">Mobile</th>
					<th width="15%">Gold(gms)</th>
					<th width="15%">Silver(gms)</th>
					<th width="15%">Rate</th>
					<th width="15%">Total</th>
					<!-- BZ-27: Added missing User Comment and Admin Comment columns -->
					<th width="20%">User Comment</th>
					<th width="20%">Admin Comment</th>
					<th width="15%">B.Status</th>
				</tr>
			</thead>
			<tbody>
				<?php	
					foreach ($customers as $customer) 
					{
						$bstatus = $customer['book_status'] == 1 ? "confirmed" : "";
						$oType = $customer['ordertype'] == 0 ? "Book":"Limit";
						
						$gold_bookQty = 0;
						$silver_bookQty = 0;

						if($customer['com_type'] == 1)
						{
							$silver_bookQty = $customer['bookqty'];
						}
						else
						{
							$gold_bookQty = $customer['bookqty'];
						}
				
						echo '<tr>
								<td style="text-align:center;">'.$customer['bookno'].'</td>
								<td style="text-align:center;">'.$oType.'</td>
								<td>'.$customer['book_type'].'</td>
								<td>'.$customer['bookdate'].'</td>
								<td>'.$customer['customername'].'</td>
								<td>'.$customer['cus_company_name'].'</td>
								<td>'.(!empty($customer['cus_mobile']) ? $customer['cus_mobile'] : '-').'</td>
								<td style="text-align:right;">'.$gold_bookQty.'</td>
								<td style="text-align:right;">'.$silver_bookQty.'</td>
								<td style="text-align:right;">'.$customer['book_rate'].'</td>	
								<td style="text-align:right;">'.$customer['bookamount'].'</td>	
								<td>'.(!empty($customer['book_usercomment']) ? $customer['book_usercomment'] : '-').'</td>
								<td>'.(!empty($customer['book_narration']) ? $customer['book_narration'] : '-').'</td>
								<td >'.$bstatus.'</td>	
							</tr>';
					}				
				?>
			</tbody>
		</table>
	</body>
</html>