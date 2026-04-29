<?php 
	$this->load->view('include/header.php'); 
	$model_name = "Client_model";
	$controller_name="C_clients";
	if($cus_type == 1)
	{
		$cus_label = "(Registered Traders)";
	}
	else if($cus_type == 2)
	{
		$cus_label = "(Active Traders)";
	}
	else if($cus_type == 3)
	{
		$cus_label = "(Inactive Traders)";
	}
	else if($cus_type == 4)
	{
		$cus_label = "(Logged In Traders)";
	}
	else
	{
		$cus_label = "";
	}
?>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/jquery.noty.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/noty_theme_default.css' rel='stylesheet'>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Client List <?php echo $cus_label ?> 
								<a style="display:none"; href="<?php echo $this->config->item('base_url')."index.php/C_clients/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> 
							</h4>
							<p class="card-description"> </p>
							<div class="table-responsive">
								<?php
									$clients = $this->$model_name->get_data()->result_array();
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
									//$deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';	
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="5%">ID</th>
											<th width="15%">Name</th>
											<th width="15%">Code</th>
											<th width="15%">URL</th>
											<th width="15%">Contract(G/S)</th>
											<th width="10%" data-sortable="false">Gold(H/L)</th>
											<th width="10%" data-sortable="false">Silver(H/L)</th>
											<th width="15%" data-sortable="false">Action</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php	
											foreach ( $clients as $client ) 
											{
												echo '<tr>
														<td>'.$client['id_client'].'</td>
														<td>'.$client['client'].'</td>
														<td>'.$client['code'].'</td>
														<td>'.$client['baseurl'].'</td>
														<td>'.$client['gold_contract'].' / '.$client['silver_contract'].'</td>
														<td>'.$client['higlowalertsettings_gold_up'].' / '.$client['higlowalertsettings_gold_down'].'</td>
														<td>'.$client['higlowalertsettings_silver_up'].' / '.$client['higlowalertsettings_silver_down'].'</td>
														<td>
															<a class="btn btn-success btn-sm"  href='.$editLink.$client['id_client'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>
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