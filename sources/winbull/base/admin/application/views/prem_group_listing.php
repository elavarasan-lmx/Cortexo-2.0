<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
$model_name = 'prem_group_model';
$controller_name = 'c_prem_group';
?>
<script>
// Delete function using showConfirmModal
function deletePremiumGroup(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this premium group?',
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
					// BZ-11: Show blocked delete modal when group has linked traders/commodities
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
    <!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">Discount Group Listing</a>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Premium Group List
								<?php if($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url')."index.php/c_prem_group/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new add_new1" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
								<?php } ?>
							</h4>
							<p class="card-description"> </p>
							<div class="col-lg-12">
								<?php
                                  $prem_groups=($this->$model_name->get_data()->result_array());
								  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
								?>
							</div>
							<div class="table-responsive rpanl_table">
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="10%">ID</th>
											<th width="25%">Group</th>
											<th width="25%">Status</th>
											<th width="20%" style="display:none;">Notification</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody>
										<?php	
											 foreach ( $prem_groups as $prem_group ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/'.$prem_group['prem_group_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$notificationLink = ($userrights["notification"] == 1) ? '<a class="btn btn-primary btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/send_premium_notification/'.$model_name.'/'.$prem_group['prem_group_id'].'><i class="glyphicon glyphicon-list-alt icon-white"></i> Send Notification</a>' : "";
												$deleteLink= ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deletePremiumGroup('.$prem_group['prem_group_id'].')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												echo '<tr>
														<td>'.$prem_group['prem_group_id'].'</td>
														<td>'.$prem_group['prem_group_name'].'</td>
														<td>'.$prem_group['prem_group_status'].'</td>
														<td style="display:none;">'.$notificationLink.'</td>
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