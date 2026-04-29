<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>INVOICE</title>
</head>

<body>
<p align="center">INVOICE</p>
<table width="921" height="473" border="1" cellpadding="0" cellspacing="0">
  <tr>
    <td height="77">
		    &nbsp;<span style="font-size:22px">Logimax Bullion </span><br />
No.173, New Siddha Pudhur,<br />
Coimbatore.</td>
    <td width="313" align="center">
    Email    : info@logimaxindia.com<br />
    <br />
    Web  : www.logimaxindia.com	</td>
  </tr>
  
  <tr>
    <td height="144" rowspan="2" valign="top">TO,<br />&nbsp;&nbsp;&nbsp;
	<?php echo $cus_name; ?>
	<?php 
	if(strlen($cus_address)>0) echo ",<br />&nbsp;&nbsp;&nbsp;&nbsp;".$cus_address; else echo '';
	if(strlen($cus_city)>0) echo ",<br />&nbsp;&nbsp;&nbsp;&nbsp;".$cus_city; else echo '';
	if(strlen($cus_state)>0) echo ",<br />&nbsp;&nbsp;&nbsp;&nbsp;".$cus_state; else echo '';
	if(strlen($cus_country)>0) echo ",<br />&nbsp;&nbsp;&nbsp;&nbsp;".$cus_country; else echo '';
	if(strlen($cus_pin_code)>0) echo "&ndash;".$cus_pin_code; else '';
	if(strlen($cus_tin_no)>0) echo ",<br />&nbsp;&nbsp;&nbsp;&nbsp;Tin :".$cus_tin_no; else '';?>	</td>
    <td height="24" align="center" style="font-size:16px;">Details</td>
  </tr>
  <tr>
    <td height="59" >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Invoice No &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;<?php echo $invoiceno; ?><br />
      <br />
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
   Invoice Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;<?php echo date("F j, Y") ?></td>
  </tr>
  <tr>
    <td height="160" colspan="2" valign="top" style="border:hidden">
	<table id="commodity_display" border="1" cellpadding="0" cellspacing="0" style="border:hidden">
	<tr>
		<td width="113" align="center" style="font-weight:bold">
			S.NO		</td>
		<td width="398" align="center" style="font-weight:bold">
		DESCRIPTION OF GOODS		</td>
		<td width="150" align="center" style="font-weight:bold">
		RATE PER GRAM		</td>
		<td width="134" align="center" style="font-weight:bold">
		TOTAL WEIGHT<br />
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GM&nbsp;&nbsp;&nbsp;MG		</td >
		<td width="122" align="center" style="font-weight:bold">
		AMOUNT<br />
		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;P		</td>	
	<?php 
		$records = $this->load->customerdelivery_model->get_ratevalues($invoiceno); 
		if($records > 0)
		{
			$i = 0;
			$sub_total = 0;
			$total_cost = 0;
			
			for($i=0;$i<count($records);$i++)
				{
	 ?>
		<tr>
					 <td height="30" align="center"><?php echo ($i+1) ?></td>
					
					 <td>&nbsp;<?php echo $records[$i]['com_name'] ?> </td>
					
					 <td align="center"><?php echo number_format(round($records[$i]['rate_per_gram'],2),2,'.','') ?> </td>
					
					 <td align="right"><?php echo $records[$i]['total_weight'] ?> </td>
					
					 <td align="right"><?php echo number_format(round($records[$i]['cost_wo_vat'],2),2,'.','') ?> </td>
		</tr>
	<?php
	$sub_total = $sub_total+$records[$i]['cost_wo_vat'];
	$total_cost = $total_cost +$records[$i]['book_totalcost'];
				}
		}
	?>
	<tr>			
		<td colspan="3" rowspan="3">RS&nbsp;:&nbsp;<?php echo strtoupper($this->load->customerdelivery_model->no_to_words($total_cost)); ?> ONLY</td>
		<td height="30" align="right">SUB TOTAL</td>
		<td align="right"><?php echo number_format(round($sub_total,2),2,".","") ?></td>
	</tr>
	<tr>			
		<td height="30" align="right">VAT(1%)</td>
		<td align="right"><?php echo number_format(round(($total_cost/101),2),2,".","") ?></td>
	</tr>
	<tr>			
		<td height="30" align="right" style="font-size:16px"><b>NET AMOUNT</b></td>
		<td align="right" style="font-size:17px"><b><?php echo number_format(round($total_cost,2),2,".","") ?></b></td>
	</tr>
	<tr>
		<td height="97" colspan="2" valign="top">E. &amp; O.E<br />
		  RECEIVED DELIVERY OF THE ABOVE MATERIAL IN FULL AND GOOD CONDITION</td>
		<td valign="bottom" align="center">Receiver's Signature</td>
		<td colspan="2" align="center"><b>For: Logimax Bullion </b> <br />
		  <br /><br /><br />Authorized Signatory</td>
	</tr>
	</table>	</td>
  </tr>
</table>
</body>
</html>
