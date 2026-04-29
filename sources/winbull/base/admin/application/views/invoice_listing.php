<?php $this->load->view('include/header.php'); 
	$controller_name = "C_customerdelivery"; 
	$model_name = "customerdelivery_model";
?>
<script type="text/javascript"> 
 $(function () {
                $('#from_date').datetimepicker({
				pickTime: false
				});
				 $('#to_date').datetimepicker({
				 pickTime: false
				 });
            });
jQuery(document).ready(function(){	

<?php	
	$result_set = $this->$model_name->get_transactiondate();
	foreach($result_set->result() as $row) { 
?>
		document.getElementById('from_date').value = "<?php echo $row->from_date; ?>";
		document.getElementById('to_date').value = "<?php echo $row->to_date; ?>"
<?php	
	}
	$result_set->free_result();	
?>
});
</script>
    <div>
        <ul class="breadcrumb">
            <li>
                 <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>            
			</li>
            <li>
                <a href="#">Transaction</a>            
			</li>
			<li>
                <a href="#">Invoice</a>           
			</li>
        </ul>
</div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i>Invoice</h2>
              </div>	
				<div class="box-content">
              <input  style="margin-left:325px;" type="text" name="from_date" id="from_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" /> 
		     <input type="text" name="to_date" id="to_date" size="20" readonly="true" value=""  data-date-format="DD-MM-YYYY" /><a href="javascript:;"><img src="<?php echo $this->config->item('base_url')."assets/images/search_blue.jpg"; ?>" onclick="get_data();" /></a>
					<?php
					
					$invoice = $this->$model_name->get_listing(0, $row->from_date, $row->to_date)->result_array();	
					?>
						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
						<thead>
						<tr>
						   <th width="10%">Invoice No </th>
						   <th width="10%">Book No </th>
							<th width="20%">Customer Name </th>
							<th width="15%">Delivery Date</th>
							<th width="10%">Type</th>
							<th width="10%">Qty</th>
							<th width="15%">Amount</th>
							<th width="10%">Actions</th>
						</tr>
						</thead>
    					<tbody>
							<?php
							    foreach (  $invoice as $val ) 
								{
								  $inv = $this->config->item('base_url').'index.php/'.$controller_name.'/open_delivery_entryform/'.$model_name.'/invoice/';
										
										    echo '<tr>
														<td>'. $val['InvoiceNo'].'</td>
														<td>'. $val['cusdel_bookno'].'</td>
														<td>'. $val['cus_name'].'</td>
														<td>'. $val['DeliveryDate'].'</td>
														<td>'. $val['type'].'</td>
														<td>'. $val['qty'].'</td>
														<td>'. $val['amt'].'</td>
														<td><a target="blank" class="btn btn-info" href='.$inv.$val['InvoiceNo'].'>
																<i class="glyphicon glyphicon-edit icon-white"></i>
																Invoice
															</a>
													   </td>
													</tr>';
								}
							  ?>
								
							</tbody>
    </table>
					 <!-- page content end-->
              </div>
            </div>
        </div>
        <!--/span-->
    </div><!--/row-->
<?php $this->load->view('include/footer.php'); ?>
<script type="text/javascript">
function get_data(){
try {
			$('#grid-data > tbody').empty();
		$.ajax({						
			type: "POST",
			dataType: "json",					   
			 url:"<?php echo $this->config->item('base_url')."index.php/C_customerdelivery/grid_dataload_listing/0/".$model_name; ?>/" + document.getElementById('from_date').value+"/"+ document.getElementById('to_date').value,
			success: function(data)
			{
				var table_val='';
				
				$.each (data, function (i) {
				var inv = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/open_delivery_entryform/<?php echo $model_name; ?>/invoice/"+data[i]['InvoiceNo'];
				table_val += '<tr><td>'+data[i]['InvoiceNo']+'<td>'+data[i]['cusdel_bookno']+'<td>'+data[i]['cus_name']+'<td>'+data[i]['DeliveryDate']+'<td>'+data[i]['type']+'<td>'+data[i]['qty']+'<td>'+data[i]['amt']+'</td><td><a target="blank" class="btn btn-info" href='+inv+'><i class="glyphicon glyphicon-edit icon-white"></i>Invoice</a></td></tr>';
				});
				$('#grid-data > tbody').empty();
				if(table_val == '')
					table_val = '<tr><td colspan="8">No data available in table</td></tr>';
					
				$('#grid-data').append(table_val);
			},
			error: function(request,error) {
			}
		});
	}catch(ex)
	{
		//console.log(ex);
	}
	
	
}

</script>