<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
$model_name = "serv_group_model";
$controller_name = "c_serv_group";
?>

    <!--<div>
        <ul class="breadcrumb">
            <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
			<li> <a href="#">Sms / Email</a></li>
			<li> <a href="#"> Templates </a></li>
        </ul>
    </div>-->
<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>

	function deleteServiceGroup(id) {
		showConfirmModal(
			'Delete Template',
			'Are you sure you want to delete this template?',
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Templates 
							<?php if($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url')."index.php/C_serv_group/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> 
							<?php } ?>
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="15%">ID</th>
											<th width="20%">Group</th>
											<th width="15%">EMail</th>
											<th width="15%">SMS</th>
											<th width="15%">Status</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php
											  $serv_groups=($this-> $model_name-> get_data()->result_array());								
											  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
											  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';

										?>

											foreach ($serv_groups as $serv_group) {
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $serv_group['serv_group_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteLink = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteServiceGroup(' . $serv_group['serv_group_id'] . ')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												echo '<tr>
														<td>'. $serv_group['serv_group_id'].'</td>
														<td>'. $serv_group['serv_group_name'].'</td>
														<td>'. $serv_group['serv_group_email'].'</td>
														<td>'. $serv_group['serv_group_sms'].'</td>
														<td>'. $serv_group['serv_group_status'].'</td>
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