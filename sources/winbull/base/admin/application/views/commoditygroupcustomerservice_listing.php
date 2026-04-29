<?php 
	$this->load->view('include/header.php');
	$model_name = 'CommodityGroupCustomerservice_model';
	$controller_name='C_commoditygroupcustomer';
?>
	<script type="text/javascript">
	function send_smstoclient() {
	$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/create_comgroupsmsurl",
		
		data: "group_id="+arguments[0].id+"&send_type=0",
		success: function(data) {
			client_sendsms(data);
		},
		error: function(request,error) {
			showToast(error,'danger');
		}
	});
	}
	function client_sendsms() {
	//alert(arguments[0]);
		if(arguments[0] == 3) 
			{
				showToast("Market Closed.You can't send SMS now",'danger');
				return;
			}	
		if(arguments[0] == 1) 
			{
				showToast("Please open the market to send SMS",'danger');
				return;
			}	
		if(arguments[0] == 0) 
		{
			showToast(" No active commodities for this group",'danger');
				return;
		}	
		$.ajax({						
			type: "POST",					   		
			url: arguments[0],
			complete: function(data) {
				showToast("SMS Sent Successfully",'success');			
			}
			/*error: function(request,error) {
				showToast(error, "warning");
			}*/
		});
		}
	function send_emailtoclient() {
	$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/send_groupemail",
		data: "group_id="+arguments[0].id+"&send_type=1",
		success: function(data) {
			//client_sendsms(data);
			showToast(data,'success');						
		},
		error: function(request,error) {
			showToast(error,'error');
		}
	});
	
	}
</script>
    <!--<div>
        <ul class="breadcrumb">
             <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">Send Rates</a>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i>Send Rates </h4>
							<p class="card-description"> </p>
							<div class="col-lg-12">
								<?php
                                  $cus_grp_sms=($this->$model_name->get_data()->result_array());
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
										
								?>
							</div>
							<div class="table-responsive">
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="10%">ID</th>
											<th width="30%">Commodity Group Name</th>
											<th width="15%">Email</th>
											<th width="15%">SMS</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody>
										<?php	
											 foreach ( $cus_grp_sms as $cus_grp ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/'.$cus_grp['com_group_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteLink= ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/'.$cus_grp['com_group_id'].'>Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												echo '<tr>
														<td>'.$cus_grp['com_group_id'].'</td>
														<td>'.$cus_grp['com_group_name'].'</td>
														<td><a class="btn btn-primary" href="javascript:;" onclick="send_emailtoclient(this);" id='.$cus_grp['com_group_id'].' name=emaillink[]>Send E-Mail</a></td>
														<td><a class="btn btn-primary" href="javascript:;" onclick="send_smstoclient(this);" id='.$cus_grp['com_group_id'].' name=smslink[]>Send SMS</a></td>
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