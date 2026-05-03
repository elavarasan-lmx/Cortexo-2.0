<?php
	$controller_name ="C_customerDelivery"; 
	$model_name = "Customerdelivery_model";
    $companydetail=$this->$model_name->get_invoicevalue();

	// Extract header info
	$report_client = isset($header_info['report_client']) ? $header_info['report_client'] : $companydetail['admin_company_name'];
	$report_from = isset($header_info['report_from_date']) ? $header_info['report_from_date'] : '';
	$report_to = isset($header_info['report_to_date']) ? $header_info['report_to_date'] : '';
	$report_time = isset($header_info['report_generated_on']) ? $header_info['report_generated_on'] : date('d-m-Y H:i:s');
	$printed_by = $this->session->userdata('username') ? $this->session->userdata('username') : 'Admin';

	function moneyFormatIndia($num)
	{
		$nums = explode(".",$num);
		if(count($nums)>2){
		return "0";
		}else{
		if(count($nums)==1){
		$nums[1]="00";
		}
		$num = $nums[0];
		$explrestunits = "" ;
		if(strlen($num)>3){
		$lastthree = substr($num, strlen($num)-3, strlen($num));
		$restunits = substr($num, 0, strlen($num)-3); 
		$restunits = (strlen($restunits)%2 == 1)?"0".$restunits:$restunits; 
		$expunit = str_split($restunits, 2);
		for($i=0; $i<sizeof($expunit); $i++)
		{
		if($i==0)
		{
		$explrestunits .= (int)$expunit[$i].","; 
		}
		else
		{
		$explrestunits .= $expunit[$i].",";
		}
		}
		$thecash = $explrestunits.$lastthree;
		} else {
		$thecash = $num;
		}
		return $thecash.".".$nums[1]; 
		}
	}
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
.report-header {
	text-align: center;
	margin-bottom: 10px;
}
.report-header h2 {
	margin: 0;
	font-size: 16px;
}
.report-header h3 {
	margin: 2px 0;
	font-size: 13px;
	font-weight: normal;
}
.report-meta {
	display: flex;
	justify-content: space-between;
	font-size: 11px;
	margin-bottom: 5px;
	padding: 0 5px;
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
<!-- Report Header -->
<div class="report-header">
	<h2><?php echo htmlspecialchars($report_client); ?></h2>
	<h3>Deal Register</h3>
</div>
<div class="report-meta">
	<span><strong>From:</strong> <?php echo htmlspecialchars($report_from); ?></span>
	<span><strong>To:</strong> <?php echo htmlspecialchars($report_to); ?></span>
	<span><strong>Printed By:</strong> <?php echo htmlspecialchars($printed_by); ?></span>
	<span><strong>Generated:</strong> <?php echo htmlspecialchars($report_time); ?></span>
</div>
<div>
	<table id="grid-data" style="margin-top:5px; width:100%; border-collapse:collapse">
					<thead>
						<tr>
						    <th>Ref No</th>
                            <th>Req Type</th>
						    <th>Book Type</th> 
						    <th>Book Date </th>
						    <th>Name</th>
							<th>Company</th>
							<th>Mobile No</th>
							<th>commodity Name</th>
							<th>Qty(gms)</th>
							<th>Del.Qty(gms)</th>
							<th>Book Rate</th>
							<th>Amount</th>
                            <th>User Comment</th>
                            <th>Admin Comment</th>
							<th>Book.Status</th>
							<th>Del.Status</th>
						</tr>
						</thead>
    					<tbody>
							<?php
							    foreach($records as $val) 
								{	
									$qty= ($val['bookqty']*1000)+0;
									$bookqtyy = $qty;
									
									$delQty = isset($val['deliveryqty']) ? round(floatval($val['deliveryqty']) * 1000) : 0;
									
									$rate= $val['book_rate'] + 0;
									$bookratee = moneyFormatIndia($rate);
									
									$amount = $val['bookamount'] + 0 ;
								    $bookamountt = moneyFormatIndia($amount);
									
									$oType = $val['ordertype'] == 0 ? "Book":"Limit";
									$bookType = $val['book_type'];

									if($val['book_status'] > 0 || $val['ordertype'] == 0)
									{
										$status = ($val['book_status'] == 0 ? 'Pending':($val['book_status'] == 2 ? 'Hold':($val['book_status'] == 1 ? 'Confirmed':'Rejected')));									
									}
									else
									{
										$status = ($val['orderstatus'] == 0 ? 'Pending':($val['orderstatus'] == 2 ? 'Cancelled by user':($val['orderstatus'] == 1 ? 'Confirmed':($val['orderstatus'] == 3 ? 'Cancelled by admin' : ($val['orderstatus'] == 4 ? 'Expired' : ($val['orderstatus'] == 5 ? 'Cancelled, Insufficient margin' : ''))))));
									}

									if($val['book_status'] == 1)
									{
										if($val['bookqty'] == $val['BalanceQty']) 
										{
												 $delstatus = 'Pending';
										}
										else if($val['BalanceQty'] <= 0)
										{
												 $delstatus = 'Delivered';
										}
										else if($val['BalanceQty'] > 0)
										{
												$delstatus = 'Partially Delivered';
										}
									 }
									 else
									 {
											$delstatus = '-';
									 }
									 echo '<tr>
										<td class="BookNo value">'. $val['bookno'].'</td>
										<td class="value">'. $oType.'</td>
										<td class="BookNo value">'. $bookType.'</td>
										<td class="value">'. $val['bookdate'].'</td>
										<td class="value">'. $val['customername'].'</td>
										<td class="value">'. $val['cus_company_name'].'</td>
										<td class="value" style="text-align:center">'. $val['cus_mobile'].'</td>
										<td class="value">'. $val['commodityname'].'</td>
										<td class="qty" style="text-align:right">'.$bookqtyy.'</td>
										<td class="delqty" style="text-align:right">'.$delQty.'</td>
										<td class="rate" style="text-align:right" >'.$bookratee.'</td>
										<td class="amount value" style="text-align:right">'.$bookamountt.'</td>
										<td class="value">'.(!empty($val['book_usercomment']) ? $val['book_usercomment'] : '-').'</td>
										<td class="value">'.(!empty($val['book_narration']) ? $val['book_narration'] : '-').'</td>
										<td class="value">'.$status.'</td>
										<td class="value">'. $delstatus.'<span class="comType" style="display:none">'.$val['com_type'].'</span></td>	
									</tr>';
								}
							?>
						</tbody>
						<tfoot>
						<?php
								echo '<tr>
										<td class="values">Total</td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>		
										<td></td>
										<td></td>
										<td id="total_qty"style="text-align:right"></td>
										<td id="total_delqty"style="text-align:right"></td>
										<td id="avg_rate"style="text-align:right"></td>
										<td id="total_amt" style="text-align:right"></td>
										<td></td>
										<td></td>
										<td></td>
										<td></td>
									</tr>';
							?>
						</tfoot>
						</tbody>
 					 </table>	
				  </div>
				</body>
</html>
<script type="text/javascript">
jQuery(document).ready(function(){	
	window.print();
});
calc_total();
function calc_total()
{
	var totalQty = 0;
	var totalAmount = 0;
	var avg_rate = 0;
	var total_rate = 0;
	var totalDelQty = 0;
	var i = 0;
	var calc_rate = true;
	
	$("#grid-data tbody").find("tr").each(function(index, value) {
		i = parseInt(i) + 1; 
		totalQty = parseFloat(parseFloat(totalQty)+parseFloat($(this).find(".qty").html())).toFixed(6);
		totalDelQty = parseFloat(parseFloat(totalDelQty)+parseFloat($(this).find(".delqty").html() || 0)).toFixed(6);
		totalAmount = parseFloat(totalAmount)+parseFloat(remove_commas($(this).find(".amount").html()));
		total_rate = parseFloat(total_rate)+parseFloat(remove_commas($(this).find(".rate").html()));
		if(i == 1) {
			com_type = $(this).find(".comType").html();
		}
		else {
			if(parseInt(com_type) != parseInt($(this).find(".comType").html())) {
				calc_rate = false;
			}
		}
			
	});
	avg_rate = calc_rate == true ? parseFloat(total_rate)/i : "-";
	$("#total_qty").html(isNaN(totalQty) ? 0 : parseFloat(totalQty));
	$("#total_delqty").html(isNaN(totalDelQty) ? 0 : parseFloat(totalDelQty));
	$("#total_amt").html(isNaN(totalAmount) ? 0 : IND_money_format(parseFloat(totalAmount).toFixed(2)));
	$("#avg_rate").html(isNaN(avg_rate) ? "-" : IND_money_format(parseFloat(avg_rate).toFixed(2)));
}
</script>