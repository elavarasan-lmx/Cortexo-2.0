<?php 
	$this->load->view('include/header.php'); 
	$model_name = "Hedgemaster_model";
	$controller_name="C_hedgemaster";
?>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/jquery.noty.css' rel='stylesheet'>
    <link href='<?php echo $this->config->item('base_url'); ?>assets/css/noty_theme_default.css' rel='stylesheet'>
    <!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
			<li>
                <a href="#">Master</a>
            </li>
			<li>
                <a href="#">Client Listing</a>
            </li>
        </ul>
    </div>-->

	<script>
	// Delete function using showConfirmModal
	function deleteHedgeMaster(id) {
		showConfirmModal(
			'Delete Confirmation',
			'Are you sure you want to delete this Hedge Master record?',
			function() {
				window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
			}
		);
	}

	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
	</script>

	<div class="main-panel">
        <div class="content-wrapper">
			<div class="row">
				<div class="col-lg-12 grid-margin stretch-card">
					<div class="card antigravity">
						<div class="card-body">
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Hedge master 
								<a href="<?php echo $this->config->item('base_url')."index.php/C_hedgemaster/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> 
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
									$hmaster = $this->$model_name->get_data()->result_array();
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="5%">ID</th>
											<th width="10%">Metal</th>
											<th width="15%">Category</th>
											<th width="15%">Type</th>
											<th width="15%">Symbol</th>
											<th width="10%">Status</th>
											<th width="10%" data-sortable="false">API</th>
											<th width="20%" data-sortable="false">Action</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php	
											foreach ( $hmaster as $hm ) 
											{
												echo '<tr>
														<td>'.$hm['hm_id'].'</td>
														<td>'.$hm['hm_commodity'].'</td>
														<td>'.$hm['hm_com_type'].'</td>
														<td>'.$hm['hm_hedgetype'].'</td>
														<td>'.$hm['hm_hedgesymbol'].'</td>
														<td>'.$hm['hm_hedgestatus'].'</td>
														<td>'.$hm['hm_apiurl'].'</td>
														<td data-sortable="false">
															<a class="btn btn-success btn-sm"  href='.$editLink.$hm['hm_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>
															<a class="btn btn-danger btn-sm" onclick="deleteHedgeMaster('.$hm['hm_id'].')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>
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