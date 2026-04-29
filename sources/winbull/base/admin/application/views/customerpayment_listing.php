<?php 
	$this->load->view('include/header.php'); 
	$model_name = "customerpayment_model";
	$controller_name="c_customerpayment";
	require('include/confirm.php');
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
?>
});
</script>

<script type="text/javascript">
function confirmation(link_location, message) {
	$(".modal-body p").html(message);
	$("#myAlert").show();
	$(".submit").attr('href',link_location);
}
</script>
<script>

	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
    showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
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
                <a href="#">Payment Listing</a>
            </li>
        </ul>
    </div>

    <div class="row">
        <div class="box col-md-12">
            <div class="box-inner">
                <div class="box-header well" data-original-title="">
                    <h2><i class="glyphicon glyphicon-th"></i>Payment Listing</h2>
					  <div class="box-icon">
							<a href="<?php echo $this->config->item('base_url')."index.php/c_customerpayment/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm" role="button"><i
                            class="glyphicon glyphicon-plus-sign"></i></a>
					  </div>
                    
                </div>
			 <div class="form-group">
			 </div>
                <div class="box-content">
				 <input style="margin-left:325px;" type="text" name="from_date" id="from_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" /> 
				 <input type="text" name="to_date" id="to_date" size="20" readonly="true" value=""  data-date-format="DD-MM-YYYY" /><a href="javascript:;"><img src="<?php echo $this->config->item('base_url')."assets/images/search_blue.jpg"; ?>" onclick="get_data();" /></a>
                     <!-- page content start-->
						<?php
                                  $payment=($this-> $model_name-> get_data($row->from_date,$row->to_date)->result_array());		
						?>
					
						<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">
							<thead>
								<tr>
									<th width="10%">Payment Code</th>
									<th width="20%">Payment Date</th>
									<th width="20%">Customer Name</th>
									<th width="15%">Payment Type</th>
									<th width="15%">Amount</th>
									<th width="20%">Action</th>
								</tr>
							</thead>
							<tbody>
							<?php
							    foreach (  $payment as $val ) 
								{
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
										
										    echo '<tr>
														<td>'. $val['cuspay_code'].'</td>
														<td>'. $val['cuspay_date'].'</td>
														<td>'. $val['cus_name'].'</td>
														<td>'. $val['cuspay_paytype'].'</td>
														<td>'. $val['cuspay_amount'].'</td>
														<td><a class="btn btn-info" href='.$editLink.$val['cuspay_code'].'>
																<i class="glyphicon glyphicon-edit icon-white"></i>
																Edit
															</a>
															<a class="btn btn-danger btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$deleteLink.$val['cuspay_code'].'>
																<i class="glyphicon glyphicon-trash icon-white"></i>
																Delete
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
			 url:"<?php echo $this->config->item('base_url')."index.php/C_customerpayment/grid_dataload/".$model_name; ?>/" + document.getElementById('from_date').value+"/"+ document.getElementById('to_date').value,
			success: function(data)
			{
				var table_val='';
				
				$.each (data, function (i) {				  
				var Edit = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/open_entryform/<?php echo $model_name; ?>/edit/"+data[i]['cuspay_code'];
				var approv_msg = "Are you sure want to delete?";
				var approv_loc = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/"+data[i]['cuspay_code'];
				table_val += '<tr><td>'+data[i]['cuspay_code']+'</td><td>'+data[i]['cuspay_date']+'</td><td>'+data[i]['cus_name']+'</td><td>'+data[i]['cuspay_amount']+'</td><td>'+data[i]['cuspay_paytype']+'</td><td><a class="btn btn-info" href='+Edit+'><i class="glyphicon glyphicon-edit icon-white"></i>Edit</a><a class="btn btn-danger"  href="javascript:; confirmation(\''+approv_loc+'\',\''+approv_msg+'\');"><i class="glyphicon glyphicon-edit icon-white"></i>Delete</a></td></tr>';
				});
				$('#grid-data > tbody').empty();
				if(table_val == '')
					table_val = '<tr><td colspan="6">No data available in table</td></tr>';
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