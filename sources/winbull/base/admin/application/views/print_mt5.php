<?php
	$controller_name ="C_customerDelivery"; 
	$model_name = "Customerdelivery_model";
    $companydetail=$this->$model_name->get_invoicevalue();
	
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title><?php  echo $companydetail['admin_company_name']; ?></title>
 <script src="<?php echo $this->config->item('base_url'); ?>assets/js/customize.js"></script>
 <script src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/jquery/jquery.min.js"></script>
<style type="text/css">

#grid-data tr,#grid-data td,#grid-data tr,#grid-data th{
border:1px solid #000;
border-collapse:collapse;
font-size:11px;
}
#grid-data tbody .values{
text-align:center;
}
@media print  
{
    #grid-data td, #grid-data th{
        page-break-inside: avoid;
    }
}
</style>
</head>
<body>
<div style="height:10px;" id="deal_register"><div style="text-align:center;display:inline; font-size:14px">From date</div>&nbsp;&nbsp;<div style="text-align:left; display:inline"><?php echo $_POST['from_date']; ?></div>&nbsp;&nbsp;&nbsp;&nbsp;<div style="text-align:center;display:inline; font-size:14px">To date</div>&nbsp;&nbsp;<div style="text-align:left; display:inline"><?php echo $_POST['to_date']; ?></div> </div>
<div>
	<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="border-collapse:collapse; margin-top:20px; width:100%">
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
				foreach ($records as $val) 
				{
					echo '<tr>
						<td>'. $val['hedgid'].'</td>
						<td>'. $val['cusbookid'].'</td>
						<td>'. $val['book_qty'].'</td>
						<td>'. $val['volume'].'</td>
						<td>'. $val['price'].'</td>
						<td>'. $val['symbol'].'</td>
						<td>'. $val['bid'].'</td>
						<td>'. $val['ask'].'</td>
						<td>'. $val['bookedon'].'</td>
						<td>'. $val['dealid'].'</td>
						<td>'. $val['orderid'].'</td>
						<td>'. $val['request_id'].'</td>
						<td>'. $val['comment'].'</td>
					</tr>';
				}
			?>
			</tbody>
			
	 </table>
	 </div>
	 </body>
</html>
<script type="text/javascript">
jQuery(document).ready(function(){	
	window.print();
});

</script>