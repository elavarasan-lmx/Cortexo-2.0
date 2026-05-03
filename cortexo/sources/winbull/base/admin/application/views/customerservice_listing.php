<?php 
$this->load->view('include/header.php'); 
$controller_name = "C_customerservice"; 
	$model_name = "Customerservice_model";
?>

<script type="text/javascript">
function send_smstoclient() {
	$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/create_smsurl",
		data: "group_id="+arguments[0].id+"&send_type=0",
		success: function(data) {
			client_sendsms(data);
			showToast("Data added successfully",'success');						
		},
		error: function(request,error) {
			showToast("error",'danger');
		}
	});
}
function client_sendsms() {
	//alert(arguments[0]);
	$.ajax({						
		type: "POST",					   		
		url: arguments[0],
		complete: function(data) {
				showToast("SMS Sent Successfully",'success');			
			},
		error: function(request,error) {
			showToast('OOPS! something error','danger');
		},
	});
}
function send_emailtoclient() {
	$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/send_email",
		data: "group_id="+arguments[0].id+"&send_type=1",
		success: function(data) {
			//client_sendsms(data);
			showToast("Message send successfully",'success');						
		},
		error: function(request,error) {
			showToast("OOPS! something error",'danger');
		}
	});
}
</script>
    <!--<div>
        <ul class="breadcrumb">
            <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
			<li> <a href="#">Sms / Email</a></li>
			<li> <a href="#">News Letters</a></li>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> News Letters </h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
									$customerservice=($this-> $model_name-> get_data()->result_array());
								  
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
									$deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';	
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="20%">ID</th>
											<th width="20%">Service Group</th>
											<th width="20%">EMail</th>
											<th width="20%">SMS</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing commodity_listing1">
										<?php
											foreach (  $customerservice as $serv_group ) 
											{
											$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/'.$serv_group['serv_group_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
											$deleteLink= ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/'.$serv_group['serv_group_id'].'>Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
											echo '<tr>
												<td>'. $serv_group['serv_group_id'].'</td>
												<td>'. $serv_group['serv_group_name'].'</td>
												<td style=text-align:center;><a class="btn btn-primary" href="javascript:;" onclick="send_emailtoclient(this);" id='. $serv_group['serv_group_id'].' name=emaillink[]>Send E-Mail</a></td>
												<td style=text-align:center;><a class="btn btn-primary" href="javascript:;" onclick="send_smstoclient(this);" id='. $serv_group['serv_group_id'].' name=smslink[]>Send SMS</a></td>
												<td>
													'.$editLink.'
													'.$deleteLink.'
												</td>							
											</tr>';
											
											}
											
												
										  ?>
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