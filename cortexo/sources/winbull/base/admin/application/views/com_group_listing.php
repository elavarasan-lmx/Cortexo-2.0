<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
$model_name = 'com_group_model';
$controller_name = 'c_com_group';
?>

	<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
    showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
	
	// Delete function using showConfirmModal
	function deleteCommodityGroup(id) {
		showConfirmModal(
			'Delete Commodity Group',
			'Are you sure you want to delete this commodity group?',
			function() {
				$.ajax({
					url: '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id,
					type: 'POST',
					dataType: 'json',
					headers: {
						'X-Requested-With': 'XMLHttpRequest'
					},
					success: function(response) {
					if (response.status === 'success') {
						showToast(response.message, 'success');
						setTimeout(function() {
							window.location.reload();
						}, 1000);
					} else if (response.blocked) {
						// BZ-10: Show blocked delete modal when group has linked commodities
						showDeleteBlockedModal(response.message);
					} else {
						showToast(response.message, 'danger');
					}
				},
					error: function(xhr, status, error) {
						showToast('Delete failed: ' + error, 'danger');
					}
				});
			}
		);
	}
	</script>

	<div class="main-panel">
        <div class="content-wrapper">
			<div class="row">
				<div class="col-lg-12 grid-margin stretch-card">
					<div class="card">
						<div class="card-body">
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Commodity Group Listing 
								<?php if($userrights["add"] == 1) { ?>
									<a href="<?php echo $this->config->item('base_url')."index.php/C_com_group/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> 
								<?php } ?>
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
                                  $com_groups=($this->$model_name->get_data()->result_array());
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
									?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="10%">ID</th>
											<th width="35%">Group</th>
											<th width="35%" style="display: none;">Status</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php	
											 foreach ( $com_groups as $com_group ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/'.$com_group['com_group_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteLink= ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteCommodityGroup('.$com_group['com_group_id'].'); return false;" href="#">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												echo '<tr>
														<td>'.$com_group['com_group_id'].'</td>
														<td>'.$com_group['com_group_name'].'</td>
														<td style="display:none;">'.$com_group['com_group_status'].'</td>
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