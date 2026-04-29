<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
<title>RATE</title>
</head>
<body>
<p><?php echo $header; ?></p>
<?php if(! $greeting) { ?>
<p>Date & Time : <?php echo date('d/m/Y H:i:s'); ?></p>
<table width="100%" border="1" cellpadding="0" cellspacing="0" style="font-size:16px; font-weight:bold;">
  <tr>
    <th width="40%" align="center">Commodity</th>
	<th width="30%" align="center">Buying Rate</th>
    <th width="30%" align="center">Selling Rate</th>
  </tr>
  <?php foreach($mail_content as $com) 
	 echo "<tr>
		<td align='center'>".$com['name']."</td>
		<td align='center'>".$com['buy']."</td>		
		<td align='center'>".$com['sell']."</td>
	  </tr>";
	?>	
</table>




<?php echo $international; ?>

<?php } ?>
<p><?php echo $footer; ?></p>
</body>
</html>
