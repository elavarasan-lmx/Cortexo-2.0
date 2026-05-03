<?php 
	$model_name = "customerdelivery_model";
	$controller_name="C_customerDelivery";

	// Extract header info
	$report_client = isset($header_info['report_client']) ? $header_info['report_client'] : '';
	$report_from = isset($header_info['report_from_date']) ? $header_info['report_from_date'] : '';
	$report_to = isset($header_info['report_to_date']) ? $header_info['report_to_date'] : '';
	$report_time = isset($header_info['report_generated_on']) ? $header_info['report_generated_on'] : date('d-m-Y H:i:s');
	$printed_by = $this->session->userdata('username') ? $this->session->userdata('username') : 'Admin';
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
		<title>Deal Register </title>
	</head>
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
		.header-table td {
			border: none;
			font-size: 12px;
			padding: 2px 5px;
		}
		.header-table {
			border: none;
			margin-bottom: 10px;
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
		<!-- Report Header -->
		<table class="header-table" style="width:100%; border:none; margin-bottom:15px;">
			<tr>
				<td style="border:none; font-size:16px; font-weight:bold; text-align:center;" colspan="4">
					<?php echo htmlspecialchars($report_client); ?>
				</td>
			</tr>
			<tr>
				<td style="border:none; font-size:14px; font-weight:bold; text-align:center;" colspan="4">
					Deal Register Report
				</td>
			</tr>
			<tr>
				<td style="border:none;"><strong>From Date:</strong> <?php echo htmlspecialchars($report_from); ?></td>
				<td style="border:none;"><strong>To Date:</strong> <?php echo htmlspecialchars($report_to); ?></td>
				<td style="border:none;"><strong>Printed By:</strong> <?php echo htmlspecialchars($printed_by); ?></td>
				<td style="border:none;"><strong>Generated On:</strong> <?php echo htmlspecialchars($report_time); ?></td>
			</tr>
		</table>

		<?php 
			$gold_bookQty   =0.00;	
			$silver_bookQty =0.00;
			$gold_delQty    =0.00;
			$silver_delQty  =0.00;
			foreach($customers as $customer) 
			{
				if($customer['com_type'] == 1)
				{
					$silver_bookQty = $silver_bookQty + $customer['bookqty'];
					$silver_delQty  = $silver_delQty + (isset($customer['deliveryqty']) ? floatval($customer['deliveryqty']) : 0);
				}
				else
				{
					$gold_bookQty = $gold_bookQty + $customer['bookqty'];
					$gold_delQty  = $gold_delQty + (isset($customer['deliveryqty']) ? floatval($customer['deliveryqty']) : 0);
				}
			}
		?>
		<div class="col-md-12 total_booked">
			<div class="col-md-3"><label class="L-GoldBooked btn btn-primary" >Gold Booked(gms)</label> : <?php echo round($gold_bookQty*1000);?></div>
			<div class="col-md-3"><label class="L-GoldBooked btn btn-primary" >Gold Delivered(gms)</label> : <?php echo round($gold_delQty*1000);?></div>
			<div class="col-md-3"><label class="L-SilverBooked btn btn-primary" >Silver Booked(gms)</label> : <?php echo round($silver_bookQty*1000);?></div>
			<div class="col-md-3"><label class="L-SilverBooked btn btn-primary" >Silver Delivered(gms)</label> : <?php echo round($silver_delQty*1000);?></div>
		</div>

		<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="width:100%; margin-top:10px;">
			<thead>
				<tr>
					<th width="5%">B.No</th>
					<th width="8%">Req Type</th>
					<th width="5%">B.Type</th>
					<th width="12%">B.Date</th>
					<th width="12%">Cus Name</th>
					<th width="10%">Company</th>
					<th width="10%">Mobile</th>
					<th width="8%">Commodity</th>
					<th width="8%">B.Qty(gms)</th>
					<th width="8%">Del.Qty(gms)</th>
					<th width="8%">Rate</th>
					<th width="8%">Total</th>
					<th width="10%">User Comment</th>
					<th width="10%">Admin Comment</th>
					<th width="8%">B.Status</th>
				</tr>
			</thead>
			<tbody>
				<?php	
					foreach ($customers as $customer) 
					{
						$bstatus = $customer['book_status'] == 1 ? "Confirmed" : ($customer['book_status'] == 0 ? "Pending" : ($customer['book_status'] == 2 ? "Hold" : "Rejected"));
						$oType = $customer['ordertype'] == 0 ? "Book":"Limit";
						$delQty = isset($customer['deliveryqty']) ? round(floatval($customer['deliveryqty']) * 1000) : 0;
						echo '<tr>
							<td style="text-align:center;">'.$customer['bookno'].'</td>
							<td style="text-align:center;">'.$oType.'</td>
							<td style="text-align:center;">'.$customer['book_type'].'</td>
							<td style="text-align:center;">'.$customer['bookdate'].'</td>
							<td style="text-align:center;">'.$customer['customername'].'</td>
							<td style="text-align:center;">'.(!empty($customer['cus_company_name']) ? $customer['cus_company_name'] : '-').'</td>
							<td style="text-align:center;">'.$customer['cus_mobile'].'</td>
							<td style="text-align:center;">'.$customer['commodityname'].'</td>
							<td style="text-align:center;">'.round($customer['bookqty']*1000).'</td>
							<td style="text-align:center;">'.$delQty.'</td>
							<td style="text-align:right;">'.$customer['book_rate'].'</td>	
							<td style="text-align:right;">'.$customer['bookamount'].'</td>	
							<td style="text-align:center;">'.(!empty($customer['book_usercomment']) ? $customer['book_usercomment'] : '-').'</td>
							<td style="text-align:center;">'.(!empty($customer['book_narration']) ? $customer['book_narration'] : '-').'</td>
							<td style="text-align:center;">'.$bstatus.'</td>	
						</tr>';
					}				
				?>
			</tbody>
		</table>
	</body>
</html>