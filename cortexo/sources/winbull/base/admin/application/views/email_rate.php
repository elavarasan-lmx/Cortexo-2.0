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
    <td align="center">Commodity Type</td>
    <td align="center">Selling Rate</td>
    <td align="center">Buying Rate</td>
  </tr>
  <tr>
    <td align="center">Gold</td>
    <td align="center"><?php echo $gs_rate; ?></td>
    <td align="center"><?php echo $gb_rate; ?></td>
  </tr>
  <tr>
    <td align="center">Silver</td>
    <td align="center"><?php echo $ss_rate; ?></td>
    <td align="center"><?php echo $sb_rate; ?></td>
  </tr>
</table>
<?php } else { echo $subject;  } ?>
<p><?php echo $footer; ?></p>
</body>
</html>
