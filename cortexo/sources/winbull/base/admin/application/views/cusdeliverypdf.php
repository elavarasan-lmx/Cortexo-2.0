<?php 
	$model_name = "customerdelivery_model";
	$controller_name="C_customerDelivery";
	
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>Customer Delivery Report</title>
	</head>
	<p style="text-align: center">
		<div style="text-align: center">
			<span style="text-align:center; margin-left:-80px;">Customer Delivery Report</span>
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
				<label class="L-SilverBooked btn btn-primary">Date : </label>
					<span id="silver_del"><?php echo date('d-m-Y');?> </span> 
					<!--<input style="margin-top:50px; margin-left:100px" type="text"  name="currentdate" id="currentdate" data-date-format="DD-MM-YYYY"  readonly="true" onchange="get_data();" value="<?php echo date('d-m-Y');?>" style="border: none;"/>-->
				</div>	
			</div>
		</div>
		<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="width:900px;margin-left:50px; margin-top:-10px;">
			<thead>
				<tr>
						<th>Invoice No</th>
						<th>Delivered On</th>
						<th>Booked customer</th>
						<th>Mobile No</th>
						<th>Delivered Person</th>
						<th>Mobile No</th>
						<th>Del Qty</th>
						<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				<?php
					//print_r($customers);exit;
					foreach($customers as $customer) 
					{	
						echo'<tr>
									<td style="text-align:center;">'.$customer['invoice_no'].'</td>
									<td>'.$customer['cusdel_date'].'</td>
									<td>'.$customer['customername'].'</td>
									<td>'.$customer['bookcus_mobile'].'</td>
									<td>'.$customer['delcus_name'].'</td>
									<td>'.$customer['delcus_mobile'].'</td>
									<td style="text-align:right;">'.$customer['del_qty'].'</td>
									<td style="text-align:right;">'.round(($customer['del_amount'] + $customer['charges'])-$customer['discount'],2).'</td>
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