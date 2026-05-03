<?php
$this->load->view('include/header.php');
$model_name = "rpanelbank_model";
$controller_name = "C_rpanelbank";
?>

<script>
	function deleteRpanelBank(id) {
		showConfirmModal('Inactive Confirmation', 'Are you sure you want to inactive this R-Panel bank?', function() {
			window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
		});
	}
	function activateRpanelBank(id) {
		showConfirmModal('Activate Confirmation', 'Are you sure you want to activate this R-Panel bank?', function() {
			window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/activate/' + id;
		});
	}

	// BZ-04 FIX: Display flash message once inside document.ready and clear flashdata
	// to prevent bank name showing twice on status change
	<?php
		$flash_success = $this->session->flashdata('success');
		$flash_error = $this->session->flashdata('error');
	?>
	$(document).ready(function() {
		<?php if ($flash_success || $flash_error): ?>
		showFlashMessage("<?= addslashes($flash_success); ?>", "<?= addslashes($flash_error); ?>");
		// Clear flash data to prevent re-display on browser back/refresh
		$.post("<?= site_url('C_main/clear_flash'); ?>");
		<?php endif; ?>
	});
</script>

<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-12 grid-margin stretch-card">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> R-Panel Bank List
							<?php if ($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url') . "index.php/C_rpanelbank/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
							<?php } ?>
						</h4>
						<div class="table-responsive rpanl_table">
							<table id="grid-data" class="table table-hover1 datatable">
								<thead>
									<tr>
										<th>Seq</th>
										<th>Bank Symbol</th>
										<th>Bank Contract</th>
										<th>Convert Value</th>
										<th>Status</th>
										<th data-sortable="false">Actions</th>
									</tr>
								</thead>
								<tbody>
									<?php
									$rcommodities = $this->$model_name->get_data()->result_array();
									foreach ($rcommodities as $com) {
										$status = $com['bcontract_status'] == 1 ? 'Active' : 'Inactive';
										// $status = $com['bcontract_status'] == 1 ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Inactive</span>';
										$editBtn = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href="' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $com['bcontract_id'] . '"><i class="typcn typcn-edit"></i> Edit</a> ' : '';
										if ($userrights["delete"] == 1) {
											if ($com['bcontract_status'] == 1) {
												$deleteBtn = '<a class="btn btn-danger btn-sm" onclick="deleteRpanelBank(' . $com['bcontract_id'] . ')"><i class="typcn typcn-delete-outline"></i> InActive</a>';
											} else {
												$deleteBtn = '<a class="btn btn-success btn-sm" onclick="activateRpanelBank(' . $com['bcontract_id'] . ')"><i class="typcn typcn-tick"></i> Active</a>';
											}
										} else {
											$deleteBtn = '';
										}
										echo '<tr>
											<td>' . $com['b_orderno'] . '</td>
											<td>' . $com['bcontract_symbol'] . '</td>
											<td>' . $com['bcontract_rate'] . '</td>
											<td>' . $com['bconvert_value'] . '</td>
											<td>' . $status . '</td>
											<td>' . $editBtn . $deleteBtn . '</td>
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