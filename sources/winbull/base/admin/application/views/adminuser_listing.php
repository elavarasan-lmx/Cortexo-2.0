<?php $this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
$model_name = "adminuser_model";
$controller_name="C_admin_user";
 ?>
<style>
 .btn-success{padding-left:10px !important;padding-right:10px !important;}
</style> 
<script>
// Delete function using showConfirmModal
function deleteAdminUser(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this admin user?',
		function() {
			$.ajax({
				url: '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id,
				type: 'POST',
				dataType: 'json',
				headers: { 'X-Requested-With': 'XMLHttpRequest' },
				success: function(response) {
					if (response.status === 'success') {
						showToast(response.message, 'success');
						setTimeout(function() { window.location.reload(); }, 1000);
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Admin User List</h4>
							<p class="card-description"> </p>
								
							<div class="table-responsive">
								<?php
                                  $adminuser=($this-> $model_name-> get_data()->result_array());
							      $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';		
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="5%">ID</th>
											<th width="20%">User Name </th>
											<th width="20%">Valid Till</th>
											<th width="15%">Status</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php
											foreach (  $adminuser as $admin) 
											{
													
														echo '<tr>
																	<td>'. $admin['admin_user_id'].'</td>
																	<td>'. $admin['admin_user_name'].'</td>
																	<td>'. $admin['admin_validity_date'].'</td>
																	<td>'. $admin['admin_status'].'</td>
																	<td>
																		<a class="btn btn-success btn-sm" href='.$editLink.$admin['admin_user_id'].'>
																			<i class="typcn typcn-edit btn-icon-append"></i>
																			Edit
																		</a>
																		<a class="btn btn-danger btn-sm" href="#" onclick="deleteAdminUser('.$admin['admin_user_id'].'); return false;">
																			<i class="typcn typcn-delete-outline btn-icon-append"></i>
																			Delete
																		</a>
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