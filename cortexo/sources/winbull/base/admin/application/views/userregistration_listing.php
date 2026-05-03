<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php'); // Shared confirmation modal
$model_name = "Userregistration_model";
$controller_name = "C_userregistration";
?>
<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>

	// BZ-103 FIX: AJAX-based delete with proper error handling for blocked deletes
	function deleteTrader(id) {
		showConfirmModal('Delete Trader', 'Are you sure you want to delete this trader?', function() {
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
						showToast(response.message || 'Failed to delete trader.', 'danger');
					}
				},
				error: function(xhr, status, error) {
					showToast('Delete failed: ' + error, 'danger');
				}
			});
		});
	}
</script>
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-12 grid-margin stretch-card">
				<div class="card antigravity">
					<div class="card-body">
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Trader List <!-- <?php echo $cus_label ?> --> <a href="<?php echo $this->config->item('base_url') . "index.php/C_userregistration/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> </h4>
						<p class="card-description"> </p>
						<div class="table-responsive">
							<?php
							$customers = $this->$model_name->get_data($cus_type)->result_array();
							//print_r($customers);exit;
							$editLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/';
							$deleteLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
							$tradingLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_activateentryform/' . $model_name . '/';
							?>
							<table id="grid-data" class="table table-hover1 datatable">
								<thead>
									<tr>
										<th>ID</th>
										<th>Trader Name</th>
										<th>Company Name</th>
										<th>Registered On</th>
										<th>UserName</th>
										<th>Mobile No</th>
										<th>Account</th>
										<th data-sortable="false">Action</th>
									</tr>
								</thead>
								<tbody>
									<?php
									foreach ($customers as $customer) {

										$cus_active = $customer["cus_active"] == 0 ? "<a class='btn btn-primary btn-sm' role='button' href=" . $tradingLink . $customer['cus_id'] . ">Active</a>" : "<a class='btn btn-danger btn-sm' role='button' href=" . $tradingLink . $customer['cus_id'] . ">Deactive</a>";


										echo '<tr>
													<td>' . $customer['cus_id'] . '</td>
													<td>' . $customer['cus_name'] . '</td>
													<td>' . $customer['cus_company_name'] . '</td>
													<td>' . $customer['cus_register_on'] . '</td>
													<td>' . $customer['cus_login_name'] . '</td>
													<td>' . $customer['cus_mobile'] . '</td>
													<td style="text-align:center;">' . $cus_active . '</td>
													<td>
														<a class="btn btn-success btn-sm"  href=' . $editLink . $customer['cus_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>
														  
														<a class="btn btn-danger btn-sm" onclick="deleteTrader(' . $customer['cus_id'] . ')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>
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