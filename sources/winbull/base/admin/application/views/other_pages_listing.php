<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php');
if(!isset($controller_name)) { $controller_name = "C_other_pages"; }
if(!isset($model_name)) { $model_name = "Other_pages_model"; }
$records = $this->Other_pages_model->get_data()->result_array();
?>

<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-12 grid-margin stretch-card">
				<div class="card">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<div>
							<h4 class="card-title">Page Content Management</h4>
							<p class="card-description">Edit page content and images only. Frontend design stays unchanged.</p>
						</div>
							<?php if($userrights["add"] == 1): ?>
								<a href="<?php echo $this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/add_new'; ?>" class="btn btn-primary btn-sm">
									<i class="typcn typcn-plus"></i> Add New Page
								</a>
							<?php endif; ?>
						</div>
						
						<script>
							<?php if($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
								showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
							<?php endif; ?>
						</script>

						<div class="table-responsive">
							<table class="table table-striped table-bordered">
								<thead>
									<tr>
										<th width="30%">Page Title</th>
										<th width="20%">Page Slug</th>
										<th width="10%">Status</th>								
										<th width="40%">Action</th>
									</tr>
								</thead>
								<tbody>
									<?php
									foreach ($records as $row) 
									{
										$status = "Active";	
										$slug = $row['page_slug'];
										
										// Determine local method name logic
										$method = ucfirst(str_replace('-', '', $slug));
										// Check overrides for standard pages
										if ($slug == 'about-us') $method = 'Aboutus';
										else if ($slug == 'home') $method = 'Home';
										else if ($slug == 'contact-us') $method = 'Contactus';
										
										$view_url = $this->config->item('base_url') . '../index.php/C_client_main/' . $method;

										$edit_url = $this->config->item('base_url').'index.php/'.$controller_name.'/open_simple_editor/'.$slug;
										if ($slug == 'contact-us') {
											$edit_url = $this->config->item('base_url').'index.php/'.$controller_name.'/open_content_editor/'.$slug;
										}

										$viewButton = '<a class="btn btn-info btn-sm" href="'.$view_url.'" target="_blank"><i class="typcn typcn-eye"></i> View</a> ';
										$editButton = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href="'.$edit_url.'"><i class="typcn typcn-edit"></i> Edit</a> ' : "";
										$deleteButton = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deletePage(\''.$slug.'\')"><i class="typcn typcn-delete-outline"></i> Delete</a>' : "";
										
										echo '<tr>
												<td>'. $row['page_title'].'</td>
												<td>'. $row['page_slug'].'</td>
												<td>'.$status.'</td>
												<td>
													'.$viewButton.'
													'.$editButton.'
													'.$deleteButton.'
												</td>							
										</tr>'; 
									}?>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
	var base_url = '<?php echo $this->config->item('base_url'); ?>';

	function deletePage(slug) {
		showConfirmModal(
			'Delete Confirmation',
			'Are you sure you want to remove this page from management? The physical file will remain on server but will be removed from this list.',
			function() {
				$.ajax({
					url: base_url + 'index.php/C_other_pages/delete_page_ajax/' + slug,
					type: 'POST',
					dataType: 'json',
					headers: { 'X-Requested-With': 'XMLHttpRequest' },
					success: function(response) {
						if (response.status === 'success') {
							showToast(response.message || 'Page removed successfully.', 'success');
							setTimeout(function() { window.location.reload(); }, 1200);
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

<?php $this->load->view('include/footer.php'); ?>
