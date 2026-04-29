<?php 
	$this->load->view('include/header.php'); 
	$model_name = "gallery_model";
	$controller_name = "C_gallery";
?>
<!-- <script src="<?php echo $this->config->item('base_url'); ?>assets/js/General.js"></script> -->

<script>
// Delete function using showConfirmModal
function deleteGallery(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this gallery item?',
		function() {
			window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
		}
	);
}

<?php if ($this->session->flashdata('success') || $this->session->flashdata('error') || $this->session->flashdata('message_notification')): ?>
    showFlashMessage("<?= $this->session->flashdata('success') ?: $this->session->flashdata('message_notification'); ?>", "<?= $this->session->flashdata('error'); ?>");
<?php endif; ?>
</script>
	<div class="main-panel">
        <div class="content-wrapper">
			<div class="row">
				<div class="col-lg-12 grid-margin stretch-card">
					<div class="card">
						<div class="card-body">
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Gallery List
								<?php if($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url')."index.php/C_gallery/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
								<?php } ?>
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
									$gallery=($this-> $model_name-> get_data()->result_array());
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
									$deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="10%">ID</th>
											<th width="25%">Name</th>
											<th width="10%">Status</th>
											<th width="25%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php	
											 foreach ($gallery as $gallery ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/'.$gallery['gal_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteButton = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteGallery('.$gallery['gal_id'].')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : '';
												echo '<tr>
													<td>'.$gallery['gal_id'].'</td>
													<td>'.$gallery['gal_name'].'</td>
													<td>'.$gallery['gal_status'].'</td>
													<td>
														'.$editLink.'
														'.$deleteButton.'
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