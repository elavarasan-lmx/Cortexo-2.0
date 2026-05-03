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
<div style="height:auto; margin-bottom: 20px;" id="deal_register">
    <div style="text-align:center; font-size:16px; font-weight: bold; margin-bottom: 10px;">
        <?php echo isset($header_info['report_client']) && !empty($header_info['report_client']) ? $header_info['report_client'] : $this->session->userdata('company_name'); ?>
    </div>
    <div style="text-align:center; font-size:14px; margin-bottom: 10px;">Customer Delivery Report</div>
    
    <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <div style="text-align:left;">
            <?php if(isset($header_info['report_from_date']) && !empty($header_info['report_from_date'])): ?>
                <strong>From:</strong> <?php echo $header_info['report_from_date']; ?> 
                <strong>To:</strong> <?php echo $header_info['report_to_date']; ?>
            <?php endif; ?>
        </div>
        <div style="text-align:right;">
            <strong>Generated on:</strong> <?php echo isset($header_info['report_generated_on']) ? $header_info['report_generated_on'] : date("d-m-Y H:i:s"); ?>
        </div>
    </div>
</div>
<div>
	<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive" style="border-collapse:collapse; margin-top:20px; width:100%">
						<thead>
						<tr>
							<th>B.No</th>
						    <th>Req Type</th>
						    <th>Book Type</th>
						    <th>B.Date </th>
						    <th>Book Cus</th>
						    <th>Book Company</th>
						    <th>Delivery Customer</th>
						    <th>Delivery Company</th>
							<th>Mobile No</th>
							<th>Com.Type</th>
							<th>Commodity </th>
							<th>B.Qty(gms) </th>
							<th>Book Rate </th>
							<th>Total </th>
							<th>Del.Qty(gms) </th>
							<th>Delivered On </th>
						</tr>
						</thead>
    					<tbody>
							<?php
							    foreach ($records as $val) 
								{
									$amount 		= $val['bookamount']+0 ;
									$bookamountt 	= moneyFormatIndia($amount);
									$rate			= $val['book_rate'] + 0;
									$bookratee 		= moneyFormatIndia($rate);
									$qty			= $val['bookqty']+0;
									$bookqtyy 		= ($qty*1000)+0;
									$bookType 		= $val['ordertype'] == 0 ? "Book":"Limit";
									$commType 		= $val['com_type'] == 1 ? "Silver":"Gold";
									$book_by  		= $val['book_by'] == 1 ? 'Admin' : 'Customer';
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
										<td>'. $bookType.'</td>
										<td>'. $val['book_type'].'</td>
										<td>'. $val['bookdate'].'</td>
										<td>'. $val['customername'].'</td>
										<td>'. (isset($val['cus_company_name']) ? $val['cus_company_name'] : '-').'</td>
										<td>'. (isset($val['deliverycustomer']) ? $val['deliverycustomer'] : '-').'</td>
										<td>'. (isset($val['delivery_cus_company']) ? $val['delivery_cus_company'] : '-').'</td>
										<td style="text-align:right">'. $val['cus_mobile'].'</td>
										<td>'. $commType.'</td>
										<td>'. $val['commodityname'].'</td>
										<td class="qty" style="text-align:right">'. $bookqtyy.'</td>
										<td class="rate" title="" style="text-align:right">'. $bookratee.'</td>
										<td class="amount" style="text-align:right">'. $bookamountt.'</td>
										<td class="delqty" style="text-align:right">'.(($val['deliveryqty']*1000)+0).'</td>
										<td>'. $val['cusdeliverydate'].'</td>
									</tr>';
								}
								?>
							</tbody>
							<tfoot style="display:none">
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
</script>