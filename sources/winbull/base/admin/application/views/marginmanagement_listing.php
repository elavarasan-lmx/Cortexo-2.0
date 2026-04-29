<?php 
	$this->load->view('include/header.php');
	$this->load->view('common/confirm_modal.php');
	$model_name = "marginmanagement_model";
	$controller_name="c_marginmanagement";
?>
<style>
.commodity_listing a{color:#fff !important}
</style>
<script>
// Delete function using showConfirmModal
function deleteMargin(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this margin record?',
		function() {
			$.ajax({
				url: '<?php echo $this->config->item('base_url'); ?>index.php/c_marginmanagement/DB_Controller/marginmanagement_model/delete/' + id,
				type: 'POST',
				dataType: 'json',
				headers: { 'X-Requested-With': 'XMLHttpRequest' },
				success: function(response) {
					if (response.status === 'success') {
						showToast(response.message, 'success');
						setTimeout(function() { window.location.reload(); }, 1000);
					} else {
						showToast(response.message || 'Delete failed.', 'danger');
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
            <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
			<li> <a href="#">Settings</a></li>
			<li> <a href="#">Customer Margin Listing</a></li>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Customer Margin Deposit List
									<?php if (isset($userrights['add']) && $userrights['add'] == 1): ?>
										<a href="<?php echo $this->config->item('base_url')."index.php/C_marginmanagement/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
									<?php endif; ?>
							</h4>
							<!-- Toast container -->
								
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
									$marginmanagement=$this->$model_name->get_data()->result_array();
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th>ID</th>
											<th>Name</th>
											<th>Company</th>
											<th>Date &amp; Time</th>
											<th>Margin Amount</th>
											<th>Type</th>
											<?php if (isset($userrights['edit']) && $userrights['edit'] == 1 || isset($userrights['delete']) && $userrights['delete'] == 1): ?>
												<th data-sortable="false">Action</th>
											<?php endif; ?>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php	
										 foreach ( $marginmanagement as $mar ) 
										{
											$editBtn   = (isset($userrights['edit'])   && $userrights['edit']   == 1)
												? '<a class="btn btn-info btn-sm btn-sm1" href='.$editLink.$mar['mar_id'].'><i class="glyphicon glyphicon-edit icon-white"></i> Edit</a> '
												: '';
											$deleteBtn = (isset($userrights['delete']) && $userrights['delete'] == 1)
												? '<a class="btn btn-danger btn-sm btn-sm1" onclick="deleteMargin('.$mar['mar_id'].'); return false;" href="#"><i class="glyphicon glyphicon-trash icon-white"></i> Delete</a>'
												: '';
											echo '<tr>
												<td>'.$mar['mar_id'].'</td>
												<td>'.$mar['cus_name'].'</td>
												<td>'.$mar['cus_company_name'].'</td>
												<td>'.$mar['mar_date'].'</td>
												<td>'.$mar['mar_amount'].'</td>
												<td>'.($mar['mar_amount'] > 0 ? "Credit" : "Debit").'</td>
												'.( ($editBtn || $deleteBtn) ? '<td>'.$editBtn.$deleteBtn.'</td>' : '').'
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