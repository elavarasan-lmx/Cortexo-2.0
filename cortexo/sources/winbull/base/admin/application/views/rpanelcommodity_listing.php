<?php
$this->load->view('include/header.php');
$model_name = "rpanelcommodity_model";
$controller_name = "C_rpanelcommodity";
?>
<script type="text/javascript">
	// Delete function using showConfirmModal
	function deleteRpanelCommodity(id) {
		showConfirmModal(
			'Delete Confirmation',
			'Are you sure you want to delete this R-Panel commodity?',
			function() {
				window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
			}
		);
	}
</script>

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
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> R-Panel Commodity List
							<?php if ($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url') . "index.php/C_rpanelcommodity/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
							<?php } ?>
						</h4>
						<p class="card-description"> </p>
						<div class="col-lg-12">
							<?php
							$rcommodities = ($this->$model_name->get_data()->result_array());
							$editLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/';
							$deleteLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
							?>
						</div>
						<div class="table-responsive rpanl_table">
							<table id="grid-data" class="table table-hover1 datatable">
								<thead>
									<tr>
										<th width="10%">ID</th>
										<th width="25%">Display Name</th>
										<th width="15%" style="display:none;">Bank Symbol</th>
										<th width="10%">Commodity</th>
										<th width="10%">Order No</th>
										<th width="10%">Status</th>
										<th width="20%" data-sortable="false">Actions</th>
									</tr>
								</thead>
								<tbody>
									<?php
									foreach ($rcommodities as $com) {
										$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $com['rcom_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
										$deleteLink = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteRpanelCommodity(' . $com['rcom_id'] . ')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
										echo '<tr>
													<td>' . $com['rcom_id'] . '</td>
													<td>' . $com['rcom_disname'] . '</td>
													<td style="display:none;">' . $com['bankcontract'] . '</td>
													<td>' . $com['com_type'] . '</td>
													<td>' . $com['rcom_orderno'] . '</td>
													<td>' . $com['rcom_status'] . '</td>
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