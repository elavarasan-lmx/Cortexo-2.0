<?php $this->load->view('include/header.php');
$model_name = "smsapi_model";
$controller_name="c_sms_api";
 ?>
<script>
// Delete function using showConfirmModal
function deleteSmsApi(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this SMS API setting?',
		function() {
			window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
		}
	);
}

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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> SMS API Settings List  <a href="<?php echo $this->config->item('base_url')."index.php/C_sms_api/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a> </h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
                                  $sms_api=($this-> $model_name-> get_data()->result_array());
							      $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';										
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="18">ID</th>
											<th width="77">Description</th>
											<th width="78">URL</th>
											<th width="99" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
									<?php
											foreach (  $sms_api as $smsapi ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/'.$smsapi['sas_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteButton = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteSmsApi('.$smsapi['sas_id'].')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												echo '<tr>
													<td>'. $smsapi['sas_id'].'</td>
													<td>'. $smsapi['sas_desc'].'</td>
													<td>'. $smsapi['sas_url'].'</td>
													<td>
														'.$editLink.'
														'.$deleteButton.'
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