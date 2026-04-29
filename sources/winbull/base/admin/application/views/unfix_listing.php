<?php 
	$this->load->view('include/header.php'); 
	$model_name = "unfix_model";
	$controller_name="C_admin_unfix";
?>
<!----success and Error message---->
				<?php if($this->session->flashdata('success')) 
					{
				?>
						<div class="alert alert-success" style="text-align:center">
						<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
						<p><?php echo $this->session->flashdata('success'); ?></p>
						</div>     
				<?php 
					} 
					else if($this->session->flashdata('errorMsg')) 
					{ 
				?>	
						<div class="alert alert-danger" style="text-align:center">
						<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
						<p><?php echo $this->session->flashdata('errorMsg'); ?></p>
						</div>  
			    <?php 
				    } 
				?>
	<!----success and Error message---->
	
    <!--<div>
        <ul class="breadcrumb">
			<li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">unfix</a>
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
							<div style="font-weight:bold;">
							   <span>PENDING AMOUNT TO RATE CUT </span>   :
							   <span id="pendedAmtValue"></span>
							</div>
							<div style="font-weight:bold;"> 
							   <span>PURE ISSUED  </span>:
							   <span id="pendedingwtgValue"></span>
							</div>
							<div style="font-weight:bold;">
							   <span>AVG RATE  </span> :
							   <span id="average_rate"></span>
							</div>
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Unfix Payment  <a href="#" onclick="process_new_close();" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-document-add btn-icon-append"></i> Close</a> 
								<a href="<?php echo $this->config->item('base_url') ?>index.php/C_admin_unfix/open_listingcus_form" class="btn btn-round btn-default"><i
                            class="glyphicon glyphicon-backward"></i></a>
							<a href="<?php echo $this->config->item('base_url')."index.php/C_admin_unfix/open_entryform/".$model_name."/add_new/$id"; ?>" class="btn btn-primary btn-sm" role="button"><i
                            class="glyphicon glyphicon-plus-sign"></i></a>
							</h4>
							<p class="card-description"> </p>
							
							<div class="table-responsive">
								<?php   
						  
									$unfix_data=$this->Unfix_model->get_data($id);
									$editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
									$deleteLink = $this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';	
								?>
								<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable">
									<thead>
										<tr>
											<th width="8%" data-sortable="false"  style="text-align:center;"><input type="checkbox" class="check_all" /></th>
											<th width="8%">ID</th>
											<th width="15%">Partyname</th>
											<th width="25%">Date</th>
											<th width="10%">Weight</th>
											<th width="10%">Rate</th>
											<th width="10%">Amount</th>
											<th width="19%" data-sortable="false">Actions</th>
										</tr>
									</thead>
									<tbody>
									<?php 
									$pure_wt=0.00;
									$amt=0;
									foreach ($unfix_data as $row):
										$pure_wt+=$row['pure_weight'];
										$amt+=$row['amount'];
										
									?>
										<tr>
											<td style="text-align:center;" ><input class="chkbox" data-id="<?php echo $row['id_unfix']; ?>" type = "checkbox"></td>
											<td><?php echo $row['id_unfix']; ?></td>
											<td><?php echo $row['cus_name']; ?></td>
											<td><?php echo $row['date']; ?></td>
											<td><?php echo $row['pure_weight']; ?></td>
											<td><?php echo (!empty($row['rate'])) ? $row['rate'] : '0'; ?></td>
											<td><?php echo formatNumber($row['amount']); ?></td>
											<td>
												<a class="btn btn-info btn-sm" href="<?php echo $editLink. $row['id_unfix']; ?>">
													<i class="glyphicon glyphicon-edit icon-white"></i> Edit
												</a>
												<a class="btn btn-danger btn-confirm btn-sm" data-toggle="modal" data-target="#confirm-delete" href="<?php echo $deleteLink. $row['id_unfix'].'/'.$id; ?>">
													<i class="glyphicon glyphicon-trash icon-white"></i> Delete
												</a>
											</td>
										</tr>
									<?php endforeach; ?>
							</tbody>
							<tfoot>

								<tr>
								
								<th  style="text-align:right;" colspan="4">Total</th>
								<th><?php echo number_format((float)$pure_wt, 3, '.', '');?></th>
								<th></th>
								<th >&#8377;<?php echo formatNumber($amt) ?></th>
								<th></th>
						
								</tr>
							</tfoot>
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