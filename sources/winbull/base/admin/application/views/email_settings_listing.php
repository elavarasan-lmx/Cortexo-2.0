<?php 
	$this->load->view('include/header.php'); 
	$model_name = "email_settings_model";
	$controller_name="C_email_settings";
?>
<script type="text/javascript">
   const BASE_URL = '<?php echo site_url(); ?>';
   
// Delete function using showConfirmModal
function deleteEmailSettings(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this email setting?',
		function() {
			window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
		}
	);
}
</script>
    <!--<div>
        <ul class="breadcrumb">
            <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
			<li> <a href="#">Settings</a></li>
			<li> <a href="#">E-mail settings List</a></li>
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
					<div class="card antigravity">
						<div class="card-body">
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Email Settings List </h4>
							<!-- Toast container -->
								<div class="position-fixed" style="top: 145px; right: 20px; z-index: 9999; max-width: 240px;">
								<?php if($this->session->flashdata('delete_success')): ?>
									<div class="toast align-items-center text-white bg-success border-0 show" role="alert">
									<div class="d-flex">
										<div class="toast-body">
										<?= $this->session->flashdata('delete_success'); ?>
										</div>
										<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
									</div>
									</div>
								<?php endif; ?>

								<?php if($this->session->flashdata('delete_error')): ?>
									<div class="toast align-items-center text-white bg-danger border-0 show" role="alert">
									<div class="d-flex">
										<div class="toast-body">
										<?= $this->session->flashdata('delete_error'); ?>
										</div>
										<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
									</div>
									</div>
								<?php endif; ?>
								</div>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
									$serv=($this-> $model_name->get_data()->result_array());
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entry_form/'.$model_name.'/edit/';
									$deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="20%">ID</th>
											<th width="60%">Service</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php
											foreach (  $serv as $email ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entry_form/'.$model_name.'/edit/'.$email['serv_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteLink= ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteEmailSettings('.$email['serv_id'].')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												echo '<tr>
													<td>'. $email['serv_id'].'</td>
													<td>'. $email['serv_name'].'</td>
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