<?php
$this->load->view('include/header.php');
$model_name = "contractsymbolmodel";
$controller_name = "C_contractsymbol";
if ($cus_type == 1) {
	$cus_label = "(Registered Traders)";
} else if ($cus_type == 2) {
	$cus_label = "(Active Traders)";
} else if ($cus_type == 3) {
	$cus_label = "(Inactive Traders)";
} else if ($cus_type == 4) {
	$cus_label = "(Logged In Traders)";
} else {
	$cus_label = "";
}

?>
<script>
	// Enhanced delete function with AJAX
	function deleteContractSymbol(id) {
		showConfirmModal(
			'Delete Confirmation',
			'Are you sure you want to delete this contract symbol?',
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


	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>
<link href='<?php echo $this->config->item('base_url'); ?>assets/css/jquery.noty.css' rel='stylesheet'>
<link href='<?php echo $this->config->item('base_url'); ?>assets/css/noty_theme_default.css' rel='stylesheet'>
<!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">ContractSymbol Listing</a>
            </li>
        </ul>
    </div>-->



<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-12 grid-margin stretch-card">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Contract Symbol List
							<a href="<?php echo $this->config->item('base_url') . "index.php/C_contractsymbol/open_entryform/" . $model_name . "/add_new/0"; ?>" class="btn btn-primary btn-sm add_new add_new1" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
						</h4>
						<p class="card-description"> </p>
						<div class="col-lg-12">
							<?php
							$customers = $this->$model_name->get_data()->result_array();
							//$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';

							?>
						</div>
						<div class="table-responsive rpanl_table">
							<table id="grid-data" class="table table-hover1 datatable">
								<thead>
									<tr>
										<th width="5%">ID</th>
										<th width="15%">Contract Symbol</th>
										<th width="15%">Contractsymbol Status</th>
										<th width="15%" data-sortable="false">Action</th>
									</tr>
								</thead>
								<tbody>
									<?php
									foreach ($customers as $customer) {
										if ($customer['status'] == 1) {
											$status = "Active";
										} else {

											$status = "InActive";
										}
										if ($customer['com_type'] == 1) {
											$comtype = "GOLD";
										} else {

											$comtype = "SILVER";
										}
										$deleteeLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
										$editLink = '<a class="btn btn-success btn-sm" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $customer['contract_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>';
										$deleteLink = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteContractSymbol(' . $customer['contract_id'] . ')" style="margin-left: 6px;">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";

										echo '<tr>
														<td>' . $customer['contract_id'] . '</td>
														<td>' . $customer['contract_symbol'] . '</td>
														<td>' . $status . '</td>
														
														<td style="">' . $editLink . $deleteLink . '</td>							
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