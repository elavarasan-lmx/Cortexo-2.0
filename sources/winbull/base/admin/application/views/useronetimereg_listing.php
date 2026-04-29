<?php 
	$this->load->view('include/header.php'); 
	$model_name = "useronetimereg_model";
	$controller_name="c_user";	
?>
   
    <!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Master</a>
            </li>
			 <li>
                <a href="#">One Time User Registration  Details</a>
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
							<!-- <h4 class="card-title"><i class="glyphicon glyphicon-th"></i> One Time User Registration List
								<a href="<?php echo $this->config->item('base_url')."index.php/C_user/mobileuser_listprint/".$model_name."/mobileuserprint/"; ?>" class="btn btn-primary btn-sm add_new add_new1 Print" role="button"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
								<a href="<?php echo $this->config->item('base_url')."index.php/C_user/mobileuser_listpdf/".$model_name."/mobileuserpdf/"; ?>" class="btn btn-primary btn-sm add_new add_new2" role="button"><i class="fas fa-file-pdf btn-icon-append"></i> PDF</a>
							</h4> -->
							<h4 class="card-title">
								<i class="glyphicon glyphicon-th"></i> One Time User Registration List
								<?php if (!empty($data)) { ?>
									<a href="<?php echo $this->config->item('base_url')."index.php/C_user/mobileuser_listprint/".$model_name."/mobileuserprint/"; ?>" class="btn btn-primary btn-sm add_new add_new1 Print" role="button">
										<i class="typcn typcn-printer btn-icon-append"></i> Print
									</a>
									<a href="<?php echo $this->config->item('base_url')."index.php/C_user/mobileuser_listpdf/".$model_name."/mobileuserpdf/"; ?>" class="btn btn-primary btn-sm add_new add_new2" role="button">
										<i class="fas fa-file-pdf btn-icon-append"></i> PDF
									</a>
								<?php } ?>
							</h4>  
							<p class="card-description"> </p>
							<div class="col-lg-12">
								<?php
								   $userreg=($this-> $model_name-> get_data()->result_array());
									/* $editLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_entryform/'.$model_name.'/edit/';
									$deleteLink=$this->config->item('base_url').'index.php/'.$controller_name.'/DB_Controller/'.$model_name.'/delete/';	
									$tradingLink=$this->config->item('base_url').'index.php/'.$controller_name.'/open_activateentryform/'.$model_name.'/'; */
								?>
							</div>
							<div class="table-responsive rpanl_table">
								<table id="grid-data_length" class="table table-hover1 datatable">
									<thead>
										<tr>
											<th width="2%">S.NO</th>
											<th width="6%">User Name</th>
											<th width="6%">Company Name</th>
											<th width="5%">Email ID</th>
											<th width="5%">Mobile No</th>
											<th width="5%">User Location</th>	
											<th width="7%">Verified Date</th>	
											<th width="5%" data-sortable="false">Status</th>	
										</tr>
									</thead>
									<tbody>
										<?php
											$i=1;							
											foreach ($userreg as $user) 
											{
												/* $cus_active = $customer["cus_active"] == 0 ? "<a class='btn btn-primary btn-sm' role='button' href=".$tradingLink.$customer['cus_id'].">Activate</a>" : "<a class='btn btn-success btn-sm' role='button' href=".$tradingLink.$customer['cus_id'].">Deactivate</a>"; */
												if($user['device_user_verified'] <=1) 
												{
													$disabled = 'disabled="disabled"';
													$status = '<span class="label label-success">Verified</span>';
												}
												else
												{
													$disabled = '';
													$status = '<span class="label label-warning">Not-verified</span>';	
												}
												echo '<tr>
														<td>'.$i.'</td>
														<td>'.$user['device_user_name'].'</td>
														<td>'.$user['device_user_company'].'</td>
														<td>'.$user['device_user_email'].'</td>		
														<td>'.$user['device_mobileno'].'</td>					
														<td>'.$user['device_user_location'].'</td>
														<td>'.$user['verifiedon'].'</td>
														<td>'; 
															?>
															<?php if($user['device_user_verified'] == 0) 
																{ 
															?>
																  <?php echo $status; ?>
															<?php 
																} 
															else 
																{ 
															?>
																 <?php echo $status; ?>
															<?php 
																} 
															?>
															<?php echo 
														'</td>
													</tr>';
													$i++;
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