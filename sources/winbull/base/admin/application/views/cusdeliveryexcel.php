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
		<div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 18px; font-weight: bold;"><?php echo isset($header_info['report_client']) && !empty($header_info['report_client']) ? $header_info['report_client'] : $this->session->userdata('company_name'); ?></div>
			<div style="font-size: 16px; margin: 5px 0;">Customer Delivery Report</div>
            <div style="font-size: 14px;">
                <?php if(isset($header_info['report_from_date']) && !empty($header_info['report_from_date'])): ?>
                    From: <?php echo $header_info['report_from_date']; ?> To: <?php echo $header_info['report_to_date']; ?>
                <?php endif; ?>
                <br>
                Generated on: <?php echo isset($header_info['report_generated_on']) ? $header_info['report_generated_on'] : date("d-m-Y H:i:s"); ?>
            </div>
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
					<th>B.No</th>
					<th>Req Type</th>
					<th>Book Type</th>
					<th>B.Date</th>
					<th>Book Cus</th>
					<th>Book Company</th>
					<th>Delivery Customer</th>
					<th>Delivery Company</th>
					<th>Mobile No</th>
					<th>Com.Type</th>
					<th>Commodity</th>
					<th>B.Qty(gms)</th>
					<th>Book Rate</th>
					<th>Total</th>
					<th>Del.Qty(gms)</th>
					<th>Delivered On</th>
				</tr>
			</thead>
			<tbody>
				<?php
					foreach($customers as $customer) 
					{	
					$oType = $customer['ordertype'] == 0 ? "Book":"Limit";
					$commType = $customer['com_type'] == 1 ? "Silver":"Gold";
					echo'<tr>
						<td style="text-align:center;">'.$customer['bookno'].'</td>
						<td style="text-align:center;">'.$oType.'</td>
						<td style="text-align:center;">'.$customer['book_type'].'</td>
						<td style="text-align:center;">'.$customer['bookdate'].'</td>
						<td style="text-align:center;">'.$customer['customername'].'</td>
						<td style="text-align:center;">'.(isset($customer['cus_company_name']) ? $customer['cus_company_name'] : '-').'</td>
						<td style="text-align:center;">'.(isset($customer['deliverycustomer']) ? $customer['deliverycustomer'] : '-').'</td>
						<td style="text-align:center;">'.(isset($customer['delivery_cus_company']) ? $customer['delivery_cus_company'] : '-').'</td>
						<td style="text-align:center;">'.$customer['cus_mobile'].'</td>
						<td style="text-align:center;">'.$commType.'</td>
						<td style="text-align:center;">'.$customer['commodityname'].'</td>
						<td style="text-align:right;">'.round($customer['bookqty']*1000).'</td>
						<td style="text-align:right;">'.$customer['book_rate'].'</td>
						<td style="text-align:right;">'.$customer['bookamount'].'</td>
						<td style="text-align:right;">'.round($customer['deliveryqty']*1000).'</td>
						<td style="text-align:center;">'.$customer['cusdeliverydate'].'</td>
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