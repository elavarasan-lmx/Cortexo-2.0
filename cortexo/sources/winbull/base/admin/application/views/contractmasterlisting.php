<?php
$this->load->view('include/header.php');
$model_name = "contractmodel";
$controller_name = "C_contract_master";
?>
<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>

	function deleteContractMaster(id) {
		showConfirmModal(
			'Delete Confirmation',
			'Are you sure you want to delete this contract master record?',
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
						} else if (response.type === 'blocked') {
						showDeleteBlockedModal(response.message);
						} else {
							showToast(response.message, 'error');
						}
					},
					error: function(xhr, status, error) {
						showToast('Delete failed: ' + error, 'error');
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

						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> ContractMaster List
							<?php if ($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url') . "index.php/C_contract_master/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
							<?php } ?>
						</h4>
						<p class="card-description"> </p>

						<div class="table-responsive">
							<?php
							$customers = $this->$model_name->get_data()->result_array();
							$editLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/';
							$deleteLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
							?>
							<table id="grid-data" class="table table-hover1 datatable">
								<thead>
									<tr>
										<th width="5%">ID</th>
										<th width="15%">Contract Symbol</th>
										<th width="15%">Rpanel Display Name</th>
										<th width="15%">User Page Contract Name</th>
										<th width="15%">User Page Status</th>
										<th width="15%">Rpanel Status</th>
										<th width="20%" data-sortable="false">Action</th>
									</tr>
								</thead>
								<tbody class="commodity_listing">
									<?php
									foreach ($customers as $customer) {
										$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $customer['contract_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
										$deleteButton = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteContractMaster(' . $customer['contract_id'] . ')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
										echo '<tr>
														<td>' . $customer['contract_id'] . '</td>
														<td>' . $customer['contract_symbol'] . '</td>
														<td>' . $customer['displayname'] . '</td>
														<td>' . $customer['userpage_displayname'] . '</td>
														<td>' . $customer['userpage_status'] . '</td>
														<td>' . $customer['status'] . '</td>
														<td style="text-align:center;">
															' . $editLink . '
															' . $deleteButton . '
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