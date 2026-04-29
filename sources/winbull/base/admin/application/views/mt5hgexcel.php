<?php 
	$model_name = "customerdelivery_model";
	$controller_name="C_customerDelivery";
	
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>MT5 hedge Report</title>
	</head>
	<p style="text-align: center">
		<div style="text-align: center">
			<span style="text-align:center; margin-left:-80px;">MT5 hedge Report</span>
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
		<div class="col-md-12" style="margin-bottom: 10px; padding: 0px;margin-left:800px;">
			<div class="col-md-10" style="padding: 0px">
				<div class="currentdate">
				<label class=" btn btn-primary">From Date : </label>
					<span id="silver_del"><?php echo $_POST['from_date'];?> </span> 
				<label class=" btn btn-primary">To Date : </label>
					<span id="silver_del"><?php echo $_POST['to_date'];?> </span> 
					<!--<input style="margin-top:50px; margin-left:100px" type="text"  name="currentdate" id="currentdate" data-date-format="DD-MM-YYYY"  readonly="true" onchange="get_data();" value="<?php echo date('d-m-Y');?>" style="border: none;"/>-->
				</div>	
			</div>
		</div>
		<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="width:900px;margin-left:50px; margin-top:-10px;">
			<thead>
				<tr>
					<th>Hedge ID </th>
					<th>Book No</th>
					<th>Booked Qty(Grms)</th>
					<th>QTY (Grms) </th>
					<th>Price</th>
					<th>Symbol</th>
					<th>Bid</th>
					<th>Ask</th>
					<th>Booked on</th>
					<th>Deal ID </th>
					<th>Order ID </th>
					<th>Req ID</th>
					<th>Comment</th>
				</tr>
			</thead>
			<tbody>
				<?php
					foreach($customers as $customer) 
					{	
						//$oType = $customer['ordertype'] == 0 ? "Book":"Limit";
						echo'<tr>
							<td style="text-align:center;">'.$customer['hedgid'].'</td>
							<td style="text-align:center;">'.$customer['cusbookid'].'</td>
							<td style="text-align:center;">'.$customer['book_qty'].'</td>
							<td style="text-align:center;">'.$customer['volume'].'</td>
							<td style="text-align:center;">'.$customer['price'].'</td>
							<td style="text-align:center;">'.$customer['symbol'].'</td>
							<td style="text-align:center;">'.$customer['bid'].'</td>
							<td style="text-align:center;">'.$customer['ask'].'</td>
							<td style="text-align:center;">'.$customer['bookedon'].'</td>
							<td style="text-align:right;">'.$customer['dealid'].'</td>
							<td style="text-align:right;">'.$customer['orderid'].'</td>
							<td style="text-align:center;">'.$customer['request_id'].'</td>
							<td style="text-align:center;">'.$customer['comment'].'</td>
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