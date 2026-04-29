<?php 
	$this->load->view('include/header.php'); 
	$model_name = "unfix_model";
	$controller_name="C_admin_unfix";
?>
<!----success and Error message---->
				<?php if($this->session->flashdata('success')) 
					{
				?>
						<div class="alert alert-success" style="text-align:center">
						<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
						<p><?php echo $this->session->flashdata('success'); ?></p>
						</div>     
				<?php 
					} 
					else if($this->session->flashdata('errorMsg')) 
					{ 
				?>	
						<div class="alert alert-danger" style="text-align:center">
						<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
						<p><?php echo $this->session->flashdata('errorMsg'); ?></p>
						</div>  
			    <?php 
				    } 
				?>
	<!----success and Error message---->
<!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">unfix</a>
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
					<div class="card">
						<div class="card-body">
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Unfix Ledger ( <i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )
								<a href="<?php echo $this->config->item('base_url')."index.php/C_admin_unfix/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document btn-icon-append"></i> Add</a> 
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php  
								 
									$unfixcus_data=$this->Unfix_model->getcustomerall_data();
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
									$deleteLink = $this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
								?>
								<table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
									<thead>
										<tr>
											<th width="15%">Party Name</th>
											<th width="15%">Pure Weight</th>
											<th width="15%">Amount</th>
											<th width="15%">Avg Rate</th>
											<th width="15%">View</th>
										</tr>
									</thead>
									<tbody>
										<?php foreach ($unfixcus_data as $row): ?>
											<tr>
												
												<td> <?php  echo $row['cus_name'] ?></td>
												<td> <?php  echo $row['weight'] ?></td>
												<td> <?php  echo formatNumber($row['amount']) ?></td>
												<td> <?php  echo formatNumber($row['rate'] )?></td>
												<td>
												<a class="btn btn-info" href="<?php echo $this->config->item('base_url'); ?>index.php/C_admin_unfix/cus_unfix_payment/<?php echo $row["cus_id"]; ?>">
														<i class="glyphicon glyphicon-plus-sign"></i> View
													</a>
												
												</td>
											</tr>
										<?php endforeach; ?>
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
	
		<!-- <div class="modal fade" id="delDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
         aria-hidden="true">

        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close clx" data-dismiss="modal">�</button>
                    <h3>Delete</h3>
                </div>
                <div class="modal-body">
                    <p>Are you sure! You want to delete the record(s)...</p>
                </div>
                <div class="modal-footer">
                    <a href="#" class="btn btn-danger" id="confirm_del" data-dismiss="modal">Confirm</a>
                    <a href="#" class="btn btn-primary clx" data-dismiss="modal">Cancel</a>
                </div>
            </div>
        </div> -->

		</div>

<a style="display:none" class="btn btn-primary noty"
data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
                        <i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
</a>
</div>




<?php 
function formatNumber($x) {
    if (isset($x) && $x !== null) {
        $x = strval($x);
        $afterPoint = '';

        if (strpos($x, '.') !== false) {
            $afterPoint = substr($x, strpos($x, '.'));
        }

        $x = floor($x);
        $x = strval($x);
        $lastThree = substr($x, -3);
        $otherNumbers = substr($x, 0, -3);

        if (!empty($otherNumbers)) {
            $lastThree = ',' . $lastThree;
        }

        $res = preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', $otherNumbers) . $lastThree . $afterPoint;

        return $res;
    } else {
        return $x;
    }
}


?>
<?php $this->load->view('include/footer.php'); ?>
<!-- <script type="text/javascript">

$(window).load(function() {
	get_data();
$("body").on('keyup','#grid-data_filter label :input',function( event ) {
	calc_total();
});
	
});
function save_chargeNarration(obj){
	var book_narration = $(obj).parent().parent().find(".book_narration").val();
	var book_no = $(obj).parent().parent().find(".BookNo").html();

		$.ajax({
			type: "POST",
			dataType: "json",					   
			url:"<//?php echo $this->config->item('base_url')?>index.php/C_customerDelivery/save_booknarration/1",
			data: "book_narration=" + book_narration + "&book_no=" + book_no,
			success: function(result) {
				if(result)
				{
					showToast("Updated successfully.", "warning");
					get_data();
				}
				else
				{
					showToast("Failed to update. Please try again.", "warning");
					get_data();
				}
			}
		});
}
function print_form(e)
{
	e.preventDefault();
	var flag = false;
	var data = document.getElementById('BookNos');
	data.innerHTML = "";
	$("#grid-data tbody").find("tr").each(function(index, value) {
	  if($(this).find(".hedgid").html())
	  {
		flag = true;
		data.innerHTML += "<input type='hidden' name='book_nos[]' value='"+$(this).find(".hedgid").html()+"' />";		
	  }
	  else
	  {
	  	flag = false;
	  }
	});
	var order_by = " ORDER BY ";
	$('#clickid').val(3);
	document.forms["printForm"].submit();
}
$('#clickexcel').on('click',function(e)
{
	e.preventDefault();
	var flag = false;
	var data = document.getElementById('BookNos');
	data.innerHTML = "";
	$("#grid-data tbody").find("tr").each(function(index, value) {
	  if($(this).find(".hedgid").html())
	  {
		flag = true;
		data.innerHTML += "<input type='hidden' name='book_nos[]' value='"+$(this).find(".hedgid").html()+"' />";		
	  }
	  else
	  {
	  	flag = false;
	  }
	});
	$('#clickid').val(2);
	document.forms["printForm"].submit();
	console.log(data);
	
});

function get_data(){
	//var from_date = "</?php echo date("Y-m-d"); ?>";
	//var to_date = "</?php echo date("Y-m-d"); ?>";
	
try {
		var table='';
		table +='<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">';
		//table +='<thead><tr><th>Hedge ID </th><th>Deal ID </th><th>Order ID </th><th>QTY (Grms) </th><th>Price</th><th>Bid</th><th>Ask</th><th>Req ID</th><th>Symbol</th><th>Book No</th><th>Booked on</th><th>Comment</th><th style="display:none">Booked By</th><th style="display:none">Order For</th><th>Action</th></tr></thead><tbody>';
		table +='<thead><tr><th>Hedge ID </th><th>Book No</th><th>Customer</th><th>Booked Qty(Grms)</th><th>Booked Rate</th><th>Hedge QTY(Grms)</th><th>Price</th><th>Symbol</th><th>Bid</th><th>Ask</th><th>Booked on</th><th>Deal ID </th><th>Req ID</th><th>Comment</th><th style="display:none">Booked By</th><th style="display:none">Order For</th><th>Action</th></tr></thead><tbody>';
		$.ajax({						
			type: "POST",
			dataType: "json",					   
			url:"<//?php echo $this->config->item('base_url')."index.php/C_customerDelivery/mt5_hedge/".$model_name; ?>/" + document.getElementById('from_date').value+"/"+ document.getElementById('to_date').value,
			success: function(data)
			{
				var table_val='';
				$.each (data, function (i) {	
				var del_link = "</?php echo $this->config->item('base_url'); ?>index.php/</?php echo $controller_name; ?>/delete_mt5hedge/0/</?php echo $model_name; ?>/"+data[i]['hedgid']+"/0";

				table_val += '<tr><td class="table_data">'+data[i]['hedgid']+'</td><td class="table_data">'+data[i]['cusbookid']+'</td><td class="table_data">'+data[i]['cus_name']+'</td><td class="table_data">'+data[i]['book_qty']+'</td><td class="table_data">'+data[i]['book_rate']+'</td><td class="table_data">'+data[i]['volume']+'</td><td class="table_data">'+data[i]['price']+'</td><td class="table_data">'+data[i]['symbol']+'</td><td class="table_data">'+data[i]['bid']+'</td><td class="table_data">'+data[i]['ask']+'</td><td class="">'+data[i]['bookedon']+'</td><td class="table_data">'+data[i]['dealid']+'</td><td class="table_data">'+data[i]['request_id']+'</td><td class="table_data">'+data[i]['comment']+'</td><td style="display:none" class="table_data">'+data[i]['bookedby']+'</td><td style="display:none" class="table_data">'+data[i]['orderfor']+'</td><td ><?php if($userrights["delete"] == 1) { ?><a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='+del_link+'><i class="glyphicon glyphicon-trash icon-white"></i> Delete</a><?php } ?></td></tr>';
				});

				$('#grid-data').remove();
				$('#grid-data_wrapper').remove();
				var row_length = true;
				if(table_val == '')
				{
					table_val = '<tr><td colspan="20">No data available in table</td></tr>';
					row_length = false;
				}
				
				table += table_val;	
				table += '</tbody>';
				table += '</table>';
				$('.box-content').append(table);

				//oTable = $('#grid-data').dataTable();

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

				
				$('.btn-confirm').click(function (e) {
					e.preventDefault();
					var link=$(this).attr('href');
					$('#myDialog').find('#confirm').attr('href',link);
					$('#myDialog').modal('show');
				});

				//for delete operation
				$('#myDialog #confirm').click(function(){
				   $('#myDialog').modal('hide');
				   $('body').removeClass('modal-open');
					$('.modal-backdrop').remove();
				   window.location.href = $(this).attr('href');
				   return false;
				});
			},
			error: function(request,error) {
				console.log(error);
			}
		});
	}catch(ex)
	{
		console.log(ex);
	}
}

</script>
<//?php $this->load->view('include/footer.php'); ?> -->
