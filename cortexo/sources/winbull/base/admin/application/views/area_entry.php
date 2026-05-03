<?php $this->load->view('include/header.php');
 ?>
<div>
    <ul class="breadcrumb">
         <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
        <li>
            <a href="#">Settings</a>
        </li>
		<li>
            <a href="#">Area Entry</a>
        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">
                <div class="box-icon">
                     <a href="<?php echo $this->config->item('base_url') ?>index.php/C_area/open_listingform" class="btn btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
          </div>
            <div class="box-content">
            
			
			
			    <!-- put your content here -->
				
			<div class="container-fluid">
				<?php
	$status				=	$type;
	$id					=	$_POST['fv']['ar_sno']==NULL ? NULL : $_POST['fv']['ar_sno'] ;
	$attributes 		=	array('class' => 'form-horizontal');
	//Opening form
	echo form_open('C_area/DB_Controller/area_model/'.$status.'/'.$id, array('class' => 'form-horizontal', 'id' => 'areaForm', 'onsubmit' => 'return validateForm(event, this)', 'novalidate' => 'novalidate')); ?>
      
						<fieldset>
							<legend>Area Text </legend>
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
										<label class="control-label col-sm-2">Area Name * </label>
										<div class="col-sm-3">
											<input type="text" class="form-control" name="fv[ar_name]" tabindex="1" id="ar_name"  
                                                value="<?php echo set_value('ar_name',$ar_name); ?>" 
                                                required 
                                                minlength="3" 
                                                maxlength="50" 
                                                onkeypress="validateKeyPress(event, this, 4)" 
                                            />
											<span class="help-block">Enter the Area Name (Min 3, Max 50 chars).</span>										</div>
									    <label class="control-label col-sm-2"></label>
								  </div>
								</div>
								
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Active</label>
									  <div class="col-sm-3">
											<div class="btn-group" data-toggle="buttons">
												<label class="btn btn-primary">
													<input type="radio" tabindex="2" name="fv[ar_active]" id="ar_active" value="1" <?php if($ar_active==1) {?> checked="checked" <?php } ?>/>Yes
												</label>
												<label class="btn btn-primary">
													<input type="radio" tabindex="2" name="fv[ar_active]" id="ar_inactive" value="0" <?php if($ar_active==0) {?> checked="checked" <?php } ?>/>No
													</label>
											   
											</div>
										  <span class="help-block">To enable/disable Area name.</span>										</div>
									
									</div>
								</div>
								<div class="form-group">
            <div class="col-xs-offset-2 col-xs-10">
                <button type="submit" class="btn btn-success">Save</button>
            
                <button type="reset" onclick="location.href = '<?php echo $this->config->item('base_url'); ?>index.php/C_marqueetext/open_listingform'" class="btn btn-danger">Cancel</button>
				  <p align="right">* Required field </p>
            </div>
        </div>
					  </fieldset>
					</form>

			  </div>	
			
			
			
				
				<!-- contect end -->
            
			
			
			</div>
        </div>
    </div>
</div><!--/row-->


<?php $this->load->view('include/footer.php'); ?>
