<?php 
	$this->load->view('include/header.php'); 
	$model_name = 'comwise_goldwt_model';
	$controller_name='C_commodity_wisegold_weight';
?>
<style>
 .btn-success, .btn-danger{padding-left:10px !important;padding-right:10px !important;}
</style>
    <!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
			<li>
                <a href="#">Master</a>
            </li>
			<li>
                <a href="#">Commodity Wise  Listing</a>
            </li>
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
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Commodity Wise  weight
								<?php if($userrights["add"] == 1) { ?>
									<a href="<?php echo $this->config->item('base_url')."index.php/C_commodity_wisegold_weight/open_entryform/".$model_name."/add_new/0"; ?>" class="btn btn-primary btn-sm add_new" role="button"> <i class="typcn typcn-document-add btn-icon-append"></i> Add</a> 
								<?php } ?>
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php
								   /*  $com_groups=($this->$model_name->get_data());
									print_r($com_group);
										  $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
										  $deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/'; */
									$com_groups = ($this->$model_name->get_data());
															
								?>
								<table id="grid-data" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="25%">ID</th>
											 <th width="25%">Com Name</th>
											 <th width="25%">Rest Weight</th>
											 <th width="25%">date</th>
										</tr>
									</thead>
									<tbody class="commodity_listing">
										<?php
											$id = 0;
											foreach ($com_groups as $com_group) {
												echo '<tr>
																<td>' . ++$id . '</td>
																<td>' . $com_group['com_name'] . '</td>
																<td>' . $com_group['com_totalweight'] . '</td>
																<td>' . $com_group['com_wtdatetime'] . '</td>					
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