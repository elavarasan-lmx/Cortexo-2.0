<?php
$this->load->view('include/header.php');
$model_name = "customergroup_model";
$controller_name = "C_customergroup";
?>
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
                <a href="#">Trader Listing</a>
            </li>    
        </ul>
    </div>-->
<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
	
	// Delete function using showConfirmModal
	function deleteCustomerGroup(id) {
		showConfirmModal(
			'Delete Confirmation',
			'Are you sure you want to delete this customer group?',
			function() {
				window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
			}
		);
	}

	// Search field validation — runs when DataTables finishes drawing the search input
	$(document).ready(function() {
		// Hook into DataTable after it initializes
		$('#grid-data').on('init.dt', function() {
			var $searchInput = $(this).closest('.dataTables_wrapper').find('input[type="search"]');

			// Enforce maxlength (BZ-65: capped at 30 chars)
			$searchInput.attr('maxlength', 30);

			$searchInput.on('input keyup', function() {
				var val = $(this).val();

				// Trim to 30 chars (BZ-65 fix)
				if (val.length > 30) {
					$(this).val(val.substring(0, 30));
					showToast('Search is limited to 30 characters.', 'warning');
					return;
				}

				// Block input that contains ONLY special characters (no letter or digit at all)
				if (val.length > 0 && !/[a-zA-Z0-9]/.test(val)) {
					showToast('Search must contain at least one letter or number.', 'warning');
					$(this).val('');
					// Trigger empty search to reset table
					$('#grid-data').DataTable().search('').draw();
				}
			});
		});
	});
</script>
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-12 grid-margin stretch-card">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Customer Group List </h4>
						<p class="card-description"> </p>
						<div class="col-lg-12">
							<?php
							$customergroup = ($this->$model_name->get_data()->result_array());
							$editLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/';
							$deleteLink = $this->config->item('base_url') . 'index.php/' . $controller_name . '/DB_Controller/' . $model_name . '/delete/';
							?>
						</div>
						<div class="table-responsive">
							<table id="grid-data" class="table table-hover1 datatable">
								<thead>
									<tr>
										<th style="width:10%" data-column-id="com_name">ID</th>
										</th>
										<th style="width:35%;display: none;" data-column-id="com_type" >Entry Date</th>
										<th style="width:35%;display: none;" data-column-id="com_order_number" >Effective Date</th>
										<th style="width:20%" data-column-id="commands" data-formatter="commands" data-sortable="false">Action</th>
									</tr>
								</thead>
								<tbody>
									<?php
									foreach ($customergroup as $cust_group) {
										$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href=' . $this->config->item('base_url') . 'index.php/' . $controller_name . '/open_entryform/' . $model_name . '/edit/' . $cust_group['cgrp_id'] . '>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
										$deleteLink = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteCustomerGroup(' . $cust_group['cgrp_id'] . '); return false;" href="#">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
										echo '<tr>
												<td>' . $cust_group['cgrp_id'] . '</td>
												<td style="display: none;">' . $cust_group['cgrp_entrydate'] . '</td>
												<td style="display: none;">' . $cust_group['cgrp_effectivedate'] . '</td>
												<td>' . $editLink . '
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
</div>
<?php $this->load->view('include/footer.php'); ?>