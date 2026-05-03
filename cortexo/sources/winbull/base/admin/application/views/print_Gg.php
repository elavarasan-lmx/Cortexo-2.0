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
 <script src="<?php echo $this->config->item('base_url'); ?>assets/bower_components/jquery/jquery.min.js"></script>
<style type="text/css">
	#grid-data tr,#grid-data td,#grid-data tr,#grid-data th
	{
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
<div style="height:10px;" id="deal_register"><div style="text-align:center;display:inline; font-size:14px">Customer Margin Report</div>&nbsp;&nbsp;<div style="text-align:left; display:inline">As on <?php echo date("d-m-Y"); ?></div> </div>
	<div>
		<table id="grid-data" border="1" style="border-collapse:collapse; margin-top:20px; width:100%">
			<thead>
					<tr>
						<th>Customername</th>
						<th>Alise Name</th>
						<th>City</th>
						<th>Physical Margin</th>
						<th>Credit Margin</th>
						<th>Total Margin</th>
					</tr>
			</thead>
			<tbody>
				<?php
					   foreach($records as $val) 
					   {
							if($val['BalanceQty'] <=0 ) 
							{
								$disabled = 'disabled="disabled"';
								$status = '<span class="label label-success">Delivered</span>';
							}
							else
							{
								$disabled = '';
								$status = '<span class="label label-warning">Pending</span>';	
							}
							echo '<tr>
										<td  class="BookNo values">'. $val[''].'</td>
										<td class="values">'. $val[''].'</td>
										<td class="values">'. $val[''].'</td>
										<td class="values">'. $val[''].'</td>
										<td class="values">'. $val[''].'</td>
										<td class="values">'. $val[''].'</td>';?>
										
							<?php echo '</tr>';
						}					
			    ?>							
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
						<td></td>			
						<td></td>			
						<td></td>				
					</tr>';
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
calc_total();
function calc_total() 
{
	var totalQty = 0;
	var totalAmount = 0;
	var avg_rate = 0;
	var total_rate = 0;
	var i = 0;
	$("#grid-data tbody").find("tr").not(':last').each(function(index, value){
		 i = parseInt(i) + 1; 
		totalQty = parseFloat(totalQty)+parseFloat($(this).find(".qty").html());
		totalAmount = parseFloat(totalAmount)+parseFloat($(this).find(".amount").html());
		total_rate = parseFloat(total_rate)+parseFloat($(this).find(".rate").html());
	});
	avg_rate = parseFloat(parseFloat(totalAmount)/parseFloat(totalQty)) * 10;
	$("#total_qty").html(isNaN(totalQty) ? 0 : parseFloat(parseFloat(totalQty).toFixed(2)));
	$("#total_amt").html(isNaN(totalAmount) ? 0 : parseFloat(parseFloat(totalAmount).toFixed(2)));
	$("#avg_rate").html(isNaN(avg_rate) ? 0 : parseFloat(parseFloat(avg_rate).toFixed(2)));
}
</script>						