<?php $this->load->view('include/header.php'); ?>
<!--<div>
    <ul class="breadcrumb">
       <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Master</a></li>
		<li><a href="#">Unfix</a></li>
    </ul>
</div>-->
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin unfixentry">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry--><a href="<?php echo $this->config->item('base_url') ?>index.php/C_sms_api/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<div class="well" data-original-title="">

						</div>
						<?php
							$status				=	$type;
							$id					=	$_POST['fv']['id_unfix'] == NULL ? NULL : $_POST['fv']['id_unfix'];
							$attributes 		=	array('class' => 'form-horizontal');
							if ($id > 0) {
								echo form_open('C_admin_unfix/DB_Controller/unfix_model/' . $status . '/' . $id, $attributes);
							} else {					
								echo form_open('C_admin_unfix/DB_Controller/unfix_model/add_new');
							}
						?>
						<form class="form-sample">
								<?php 
									if(isset($db_error_msg) && $db_error_msg != '')
									{
										echo '<div class="alert alert-danger">
												<a href="#" class="close" data-dismiss="alert">&times;</a>
												<strong>Warning!</strong> '.$db_error_msg.'
												</div>';
									}	
								?>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Date*</label>
										<div class="col-sm-7">
											<input type="date" class="form-control" name="date" tabindex="1" id="sas_desc" value="<?php echo set_value('date',$date); ?>" required/>	
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
									  
									</div>
								</div>
							</div>
							<?php
								$unfix_data=$this->unfix_model->getcustomer_data($cus_id);               
							?>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Party Name*</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<select class="form-control" name="party_name" id="select_option" required>
													<option value="">Please select a Party</option>

														<?php
													
														foreach ($unfix_data as $key=> $option) {

															?>
															<option  class="form-control"  selected value='<?php echo $option['cus_id'] ?>'><?php echo $option['cus_name']."-".$option['cus_mobile'] ?></option>
															<?php
														}
														?>
												</select>
												<span class="help-block">Enter the Party Name.</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
									  
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Rate* </label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="number"  step="any" class="form-control" name="rate" tabindex="1" value="<?php echo ($rate !== '') ? $rate : '0'; ?>"  />
												<span class="help-block">Enter the Rate.</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
									  
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Enter Amount* </label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="number"  step="any" class="form-control" name="amount" tabindex="1"  value="<?php echo set_value('amount',$amount); ?>" required/>
												<span class="help-block">Enter the amount.</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
									  
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Pure Weight* </label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="number"  step="any" class="form-control" name="pure_weight" tabindex="1" value="<?php echo set_value('pure_weight',$pure_weight); ?>" required/>
												<span class="help-block">Enter the Weight.</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
									  
									</div>
								</div>
							</div>
							<div class="row form-sample1" style="margin-bottom: 20px;">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<?php $this->load->view("include/footer"); ?>
