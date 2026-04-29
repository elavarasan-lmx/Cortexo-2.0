<?php
$this->load->view('include/header.php');
$model_name = "advertisements_model";
$controller_name = "C_advertisements";
?>
<script type="text/javascript">
	// Delete function using showConfirmModal
	function deleteAdvertisement(id) {
		showConfirmModal(
			'Delete Confirmation',
			'Are you sure you want to delete this Advertisement entry?',
			function() {
				window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
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
                <a href="#">Advertisements Listing</a>
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
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Advertisements List
							<?php if ($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url') . "index.php/C_advertisements/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
							<?php } ?>
						</h4>
						<p class="card-description"> </p>
						<div class="col-lg-12">
							<?php
							$advertisements = ($this->$model_name->get_data()->result_array());
							$editLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/';
							$deleteLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
							?>
						</div>
						<div class="table-responsive rpanl_table">
							<table id="grid-data" class="table table-hover1 datatable">
								<thead>
									<tr>
										<th width="10%">ID</th>
										<th width="25%">Name</th>
										<th width="15%">Type</th>
										<th width="15">Sequence No</th>
										<th width="10%">Status</th>
										<th width="25%" data-sortable="false">Actions</th>
									</tr>
								</thead>
								<tbody>
									<?php
									foreach ($advertisements as $advertisements) {
										$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $advertisements['adv_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
										// $deleteLink = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm btn-confirm" data-toggle="modal" data-target="#confirm-delete" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/' . $advertisements['adv_id'] . '>Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
										$deleteLink = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteAdvertisement(' . $advertisements['adv_id'] . ')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";

										echo '<tr>
													<td>' . $advertisements['adv_id'] . '</td>
													<td>' . $advertisements['adv_name'] . '</td>
													<td>' . $advertisements['adv_type'] . '</td>
													<td>' . $advertisements['adv_sequence'] . '</td>
													<td>' . $advertisements['adv_status'] . '</td>
													<td>
														' . $editLink . '
														' . $deleteLink . '
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