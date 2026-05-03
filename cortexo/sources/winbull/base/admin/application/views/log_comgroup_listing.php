<?php 
	$this->load->view('include/header.php'); 
	$model_name = "logs_model";
	$controller_name="C_admin_log";
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
<style>
th, td {
  text-align: center !important;
  vertical-align: middle !important;
}
</style>
    <!--<div>
        <ul class="breadcrumb">
           <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Settings</a></li>
			 <li>
                <a href="#">Commodity Group Logs</a>
			</li>
        </ul>
    </div>-->
	<script>

	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
    showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>

	<div class="main-panel">
        <div class="content-wrapper">
			<div class="row">
				<div class="col-lg-12 grid-margin stretch-card">
					<div class="card admin_log">
						<div class="card-body">
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Commodity Group List</h4>
							<p class="card-description"> </p>
							<div class="row form-sample1" style="margin-top:40px;">
								<div class="col-md-6 col-sm-6 col-xs-12" style="padding:0px">
									<input type="text" name="from_date" id="from_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" /> 
									<input type="text" name="to_date" id="to_date" size="20" readonly="true" value=""  data-date-format="DD-MM-YYYY" />&nbsp;<i style="cursor:pointer" onclick="get_data();" class="glyphicon glyphicon-search"></i>
								</div>
							</div>
							<div class="table-responsive">
								
								<table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
									<thead>
										<tr>
											<th style="text-align:center">ID</th>
											<th>Group id</th>
											<th>Date</th>
											<th>Commodity</th>
											<th>Sell Premium</th>
											<th>Buy Premium</th>
											<th>Sell Active</th>
											<th>Buy Active</th>
											<th>Type</th>
											<th>Trade Sell</th>
											<th>Trade Buy</th>
										</tr>
									</thead>
									<tbody>
									
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
        </div>
        <!-- partial -->
    </div>
<?php $this->load->view('include/footer.php'); ?>
<script type="text/javascript">
$(window).load(function()
{
    get_data();
});
function get_data(){
try {
		var table='';
		table +='<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">';
		table +='<thead><tr><th style="text-align:center">ID</th><th>Group id</th><th>Date</th><th>Commodity</th><th>Sell Premium</th><th>Buy Premium</th><th>Sell Active</th><th>Buy Active</th><th>Type</th><th>Trade Sell</th><th>Trade Buy</th><th>Admin IP</th><th>Admin User</th></tr></thead><tbody>';
		$.ajax({						
			type: "POST",
			dataType: "json",					   
			url:"<?php echo $this->config->item('base_url')."index.php/C_admin_log/commgroup_dataload/".$model_name; ?>/"+ document.getElementById('from_date').value+"/"+ document.getElementById('to_date').value,
			success: function(data)
			{
				var table_val='';
				$.each (data, function (i) {
				table_val += '<tr><td>'+data[i]['tracking_id']+'</td><td>'+data[i]['com_group_name']+'</td><td>'+data[i]['changetime']+'</td><td>'+data[i]['com_name']+'</td><td>'+data[i]['com_sel_premium']+'</td><td>'+data[i]['com_buy_premium']+'</td><td>'+data[i]['com_sel_active']+'</td><td>'+data[i]['com_buy_active']+'</td><td>'+data[i]['com_premium_type']+'</td><td>'+data[i]['com_sel_trade']+'</td><td>'+data[i]['com_buy_trade']+'</td><td>'+data[i]['com_adminip']+'</td><td>'+data[i]['admin_user_name']+'</td></tr>';
				});
				$('#grid-data').remove();
				$('#grid-data_wrapper').remove();

				table += table_val;	
				table += '</tbody>';
				table += '</table>';
				$('.box-content').append(table);
				if(row_length)
				{
					oTable = $('#grid-data').dataTable({
						"sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
						"sPaginationType": "bootstrap",
						"iDisplayLength": "50",
						"scrollY":        "500px",
						"scrollX":        true,
						"scrollCollapse": true,
						"oLanguage": {
							"sLengthMenu": "_MENU_ records per page"
						}
					});
					$( "#grid-data thead th" ).attr( "data-sortable", function( i, val ) {
						if(val != 'false')
						{
							$("#grid-data thead th:nth-child("+(i+1)+")").css('cursor','pointer');
						}
					});
					oTable.fnSort( [ [0,'desc']] );
					oTable.fnDraw();
				}
			},
			error: function(request,error) {
			}
		});
	}catch(ex)
	{
		console.log(ex);
	}
	
	
}
</script>