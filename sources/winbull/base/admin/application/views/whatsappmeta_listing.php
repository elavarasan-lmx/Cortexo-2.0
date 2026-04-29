<?php 
	$this->load->view('include/header.php'); 
	$model_name = "Whatsappmeta_settings_model";
	$controller_name="C_whatsappmeta_settings";
?>
<script>
function deleteWhatsappSetting(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this Meta WhatsApp setting?',
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Meta Whatsapp Settings List </h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
                                  $serv=($this-> $model_name->get_data()->result_array());
								  ?>
								<table id="grid-data" class="table table-hover datatable">
									<thead>
										<tr>
											<th width="10%">ID</th>
											<th width="40%">Service</th>
											<th width="30%">Template ID</th>
											<th width="20%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody>
										<?php
											foreach (  $serv as $sms ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entry_form/'.$model_name.'/edit/'.$sms['serv_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteButton = ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deleteWhatsappSetting('.$sms['serv_id'].')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												echo '<tr>
													<td>'. $sms['serv_id'].'</td>
													<td>'. $sms['serv_name'].'</td>
													<td>'. $sms['template_id'].'</td>
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
    </div>
<?php $this->load->view('include/footer.php'); ?>
