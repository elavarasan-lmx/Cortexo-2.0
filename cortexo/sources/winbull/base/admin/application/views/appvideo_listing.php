<?php 
	$this->load->view('include/header.php'); 
	$model_name = "appvideo_model";
	$controller_name = "C_appvideos";
?>
    <!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
			<li>
                <a href="#">Master</a>
            </li>
			<li>
                <a href="#">Videos Listing</a>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Videos List 
								<a href="<?php echo $this->config->item('base_url')."index.php/C_appvideos/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> 
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
									$videos = $this->$model_name->get_data()->result_array();
								
									$editLink   = $this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
									$deleteLink = $this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="10%">ID</th>
											<th width="25%">Event Name</th>
											<th width="10%">Event Status</th>
											<th width="15%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php	
						
											foreach ($videos as $video) 
											{
														 
												echo '<tr>
														<td>'.$video['appvideo_id'].'</td>
														<td>'.$video['video_name'].'</td>
														<td>'.$video['video_type'].'</td>
														<td>
															<a class="btn btn-success btn-sm" href='.$editLink.$video['appvideo_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>
															<a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href='.$deleteLink.$video['appvideo_id'].'>Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>
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