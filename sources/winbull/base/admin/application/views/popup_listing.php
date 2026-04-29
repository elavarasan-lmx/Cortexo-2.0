<?php 
	$this->load->view('include/header.php'); 
	$model_name = "popup_model";
	$controller_name="c_popup";
	
?>
<script>
// Delete function using showConfirmModal
function deletePopup(id) {
	showConfirmModal(
		'Delete Confirmation',
		'Are you sure you want to delete this popup?',
		function() {
			window.location.href = '<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/delete/' + id;
		}
	);
}
</script>
    <!--<div>
        <ul class="breadcrumb">
             <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
            <li><a href="#">Settings</a></li>
			<li><a href="#">Popup</a></li>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Popup Settings
							<?php if($userrights["add"] == 1) { ?>
								<a href="<?php echo $this->config->item('base_url')."index.php/C_popup/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Add</a>
							<?php } ?>
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
                                  $popups=($this->$model_name->get_data()->result_array());
							      $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
								  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<th data-column-id="com_name" data-type="numeric">ID</th>
										<th data-column-id="com_type" >Popup Name </th>
										<th data-column-id="com_active" >Active</th>
										<th data-column-id="commands" data-formatter="commands" data-sortable="false">Action</th>
									</thead>
									<tbody class="commodity_listing">
										<?php 
											foreach (  $popups as $popup ) 
											{
												$editLink = ($userrights["edit"] == 1) ? '<a class="btn btn-success btn-sm" href='.$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/'.$popup['pop_id'].'>Edit <i class="typcn typcn-edit btn-icon-append"></i></a>' : "";
												$deleteLink= ($userrights["delete"] == 1) ? '<a class="btn btn-danger btn-sm" onclick="deletePopup('.$popup['pop_id'].')">Delete <i class="typcn typcn-delete-outline btn-icon-append"></i></a>' : "";
												$popupstauts = $popup['pop_active'] == 1 ? "Yes" : "No";
												echo '<tr>
													<td>'. $popup['pop_id'].'</td>
													<td>'. $popup['pop_name'].'</td>
													<td>'. $popupstauts.'</td>	
													<td>
														'.$editLink.'
														'.$deleteLink.'
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