<?php
	$controller_name ="C_customerDelivery"; 
	$model_name = "Customerdelivery_model";
    $companydetail=$this->$model_name->get_invoicevalue();
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
@media print  
{
    #grid-data td, #grid-data th{
        page-break-inside: avoid;
    }
}
</style>
</head>
<body>
<div style="height:10px;" id="deal_register"><div style="text-align:center;display:inline; font-size:14px"><?php echo $companydetail['admin_company_name']; ?> - Today's Trade</div>&nbsp;&nbsp;<div style="text-align:left; display:inline">As on <?php echo date("d-m-Y"); ?></div> </div>
<div>
	<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="border-collapse:collapse; margin-top:20px; width:100%">
						<thead>
						<tr>
						    <th>Ref No</th>
							<th>B.Type </th>
						    <th>B.Date </th>
						    <th>Name</th>
							<th>Company</th>
							<th>Mobile No</th>
							<th>Com.Type </th>
							<th>Commodity </th>
							<th>Buy/Sell</th>
							<th>B.Qty(gms) </th>
							<th>Book Rate </th>
							<th>Total </th>
							<th>Book by</th>
							<th>Comment</th>
						</tr>
						</thead>
    					<tbody>
							<?php
								foreach ($records as $val) 
								{
									$amount 		= 	moneyFormatIndia($val['bookamount']+0);
									$bookamountt 	= 	$amount;
									$rate			= 	moneyFormatIndia($val['book_rate']+0);
									$bookratee 		= 	$rate;

									$bookType = $val['ordertype'] == 0 ? "Book":"Limit";
									$commType = $val['com_type'] == 1 ? "Silver":"Gold";
									if($val['ordertype'] == 0)
									{
										$status = ($val['book_status'] == 0 ? '<span class="label label-warning">Pending</span>':($val['book_status'] == 2 ? '<span class="label label-info">Hold</span>':($val['book_status'] == 1 ? '<span class="label label-success">Confirmed</span>':'<span class="label label-danger">Rejected</span>')));	
									}
									else
									{
										$status = ($val['book_status'] == 0 ? '<span class="label label-warning">Pending</span>':($val['book_status'] == 2 ? '<span class="label label-danger">Cancelled by user</span>':($val['book_status'] == 1 ? '<span class="label label-success">Confirmed</span>':'<span style="background-color:#8A0300" class="label">Cancelled by admin</span>')));	
									}
									if($val['book_status'] == 1)
									{
										if($val['bookqty'] == $val['BalanceQty']) 
										{
											 $delstatus = '<span class="label label-info">Pending</span>';
										}
										else if($val['BalanceQty'] <= 0)
										{
											 $delstatus = '<span class="label" style="background-color:#2D5A17">Delivered</span>';
										}
										else if($val['BalanceQty'] > 0)
										{
											$delstatus = '<span class="label" style="background-color:#00BB27">Partially Delivered</span>';
										}
									}
									else
									{
										$delstatus = '-';
									}
									echo '<tr>
												<td class="BookNo">'. $val['bookno'].'</td>
												<td>'. $bookType .'</td>
												<td>'. $val['bookdate'].'</td>
												<td>'. $val['customername'].'</td>
												<td>'. (isset($val['cus_company_name']) ? $val['cus_company_name'] : '-') .'</td>
												<td style="text-align:center">'. $val['cus_mobile'].'</td>
												<td>'. $commType.'</td>
												<td>'. $val['commodityname'].'</td>
												<td>'. (isset($val['book_type']) ? $val['book_type'] : '-') .'</td>
												<td class="qty" style="text-align:right">'.(($val['bookqty']*1000)+0).'</td>
												<td class="rate" title="" style="text-align:right">'.$bookratee.'</td>
												<td class="amount" style="text-align:right">'.$bookamountt.'</td>
												<td>'.$val['book_by'].'<span class="comType" style="display:none">'.$val['com_type'].'</span></td>
												<td>'. (isset($val['book_usercomment']) && $val['book_usercomment'] != '' ? $val['book_usercomment'] : '-') .'</td>
										</tr>';
									}
								  ?>
							</tbody>
							<tfoot>
								<?php
									 echo '<tr>
												<td>Total</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td id="total_qty" style="text-align:right"></td>
												<td id="avg_rate" style="text-align:right"></td>	
												<td id="total_amt" style="text-align:right"></td>
												<td></td>
												<td></td>			
											</tr>';
								?>
						 </tfoot>
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
	var i = 0;
	var calc_rate = true;
	
	$("#grid-data tbody").find("tr").each(function(index, value) {
		i = parseInt(i) + 1; 
		totalQty = parseFloat(parseFloat(totalQty)+parseFloat($(this).find(".qty").html())).toFixed(6);
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
	//avg_rate = parseFloat(parseFloat(totalAmount)/parseFloat(totalQty)) * 10;
	$("#total_qty").html(isNaN(totalQty) ? 0 : parseFloat(totalQty));
	$("#total_amt").html(isNaN(totalAmount) ? 0 : IND_money_format(parseFloat(totalAmount).toFixed(2)));
	$("#avg_rate").html(isNaN(avg_rate) ? "-" : IND_money_format(parseFloat(avg_rate).toFixed(2)));
}
</script>