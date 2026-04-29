<?php 
	$this->load->view("include/header"); 
	$controller_name = "C_bank";
	$model_name = "bank_model";
?>


<div>
    <ul class="breadcrumb">
        <li>
            <a href="#">Admin</a>        </li>
		<li>
            <a href="#">Master</a>        </li>
		<li>
            <a href="#">Bank Entry</a>        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">

               <div class="box-icon">
             
                    <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_bank/open_listingform" class="btn btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
            </div>
            <div class="box-content">
                <!-- put your content here -->
				 <div class="container-fluid"> 
				<?php
				$status				=	$type;
				$id					=	$_POST['fv']['bnk_code']==NULL ? NULL : $_POST['fv']['bnk_code'] ;
				$attributes 		=	array('class' => 'form-horizontal');
				//Opening form
				echo form_open($controller_name."/DB_Controller/".$model_name."/".$status."/".$id,$attributes); ?>				 
				
						<fieldset>
							<legend>Bank Master</legend>
							    <div class="row">
									<?php 
										if(isset($db_error_msg) && $db_error_msg != '')
										{
											echo '<div class="alert alert-danger">
													<a href="#" class="close" data-dismiss="alert">&times;</a>
													<strong>Warning!</strong> '.$db_error_msg.'
													</div>';
										}	
									
									?>
								</div>
								<div class="row">
								  <div class="form-group">
										<label class="control-label col-sm-2">Bank Name * </label>
										<div class="col-sm-3">
											<input type="text" class="form-control" id="bnk_name" name="fv[bnk_name]" maxlength="35" value="<?php echo set_value('bnk_name',$bnk_name); ?>" required placeholder="" onkeypress="validateKeyPress(event, this, 4)"/>
											<span class="help-block">Enter the bank name.</span>
										</div>
								      
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Branch Name </label>
									  <div class="col-sm-3">
											<input type="text" class="form-control" id="bnk_branch" name="fv[bnk_branch]" maxlength="35" value="<?php echo set_value('bnk_branch',$bnk_branch); ?>" placeholder="" onkeypress="validateKeyPress(event, this, 4)"/>
										  <span class="help-block">Enter  the branch name.</span>										</div>
									   
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Account Number *</label>
										<div class="col-sm-3">
											<input type="text" class="form-control" id="bnk_accno" name="fv[bnk_accno]" maxlength="35" value="<?php echo set_value('bnk_accno',$bnk_accno); ?>" required onkeypress="validateKeyPress(event, this, 1)"/>
											<span class="help-block">Enter the account number.</span>
										</div>
									   
									    <div class="col-sm-3"></div>
									</div>
								</div>
								<div class="row">
								  <div class="form-group">
										<label class="control-label col-sm-2">Active</label>
										<div class="col-sm-3">
										  <div class="btn-group" data-toggle="buttons">
										    <label class="btn btn-primary">
													<input type="radio" name="fv[bnk_status]" id="bnk_status_yes" value="1" <?php if($bnk_status==1) {?> checked="checked" <?php } ?>  >Yes
											</label>
											  <label class="btn btn-primary">
													<input type="radio" name="fv[bnk_status]" id="bnk_status_no" value="0" <?php if($bnk_status==0) {?> checked="checked" <?php } ?>  >No
													</label>
											   
										  </div>
											<span class="help-block">To enable/disable account.</span>
										</div>
								      <label class="control-label col-sm-2"></label>
									</div>
								</div>
								<div class="form-group">
            <div class="col-xs-offset-2 col-xs-10">
                <button type="submit" class="btn btn-success">Save</button>
            
                <button type="reset" class="btn btn-danger">Cancel</button>
				<p align="right">* Required fields </p>
            </div>
        </div>
							</fieldset>
					</form>

				</div>	
				<!-- Content End -->
            </div>
        </div>
    </div>
</div><!--/row-->


<?php $this->load->view("include/footer"); ?>
