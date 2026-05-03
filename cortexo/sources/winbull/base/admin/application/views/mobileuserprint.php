<?php 
	$model_name      = "useronetimereg_model";
	$controller_name = "C_user";
?>	
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
	   <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
	   <title>Mobile User List</title>
	</head>
	<p style="text-align: center">
		<div style="text-align: center">
			<span style="text-align:center; margin-left:-80px;">Mobile User List</span>
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
		@media print  
		{
			#grid-data td, #grid-data th
			{
				page-break-inside: avoid;
			}
		}
		table 
		{
			border-collapse: collapse;
		}
		table,th,td 
		{
			border: 1px solid black;
		}
	</style>	
	<body>
		<?php
			$customers =$this->$model_name->get_data()->result_array();	
		?>
		<title>Onetime Registration List</title>
		<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive"  style="width:800px;margin-left:50px; margin-top:10px;">
			<thead>
				<tr>
					<th width="15%">S.No</th>
					<th width="15%">Customer Name</th>
					<th width="15%">Company Name</th>
					<th width="15%">Email Id</th>
					<th width="30%">Mobile No</th>
					<th width="10%">User Location</th>
					<th width="15%">Verified Date</th>
				</tr>
			</thead>
			<tbody>
				<?php
					$i=1;							
					foreach($customers as $customer ) 
					{
						echo '<tr>
								<td style="font-style:center">'.$i.'</td>
								<td>'.$customer['device_user_name'].'</td>
								<td>'.$customer['device_user_company'].'</td>
								<td>'.$customer['device_user_email'].'</td>
								<td >'.$customer['device_mobileno'].'</td>
								<td >'.$customer['device_user_location'].'</td>
								<td>'.$customer['verifiedon'].'</td>
							</tr>';
							$i++;	
							
					}	
				?>
			</tbody>
		</table>
	</body>
</html>         
<script type="text/javascript">
window.print();
</script>