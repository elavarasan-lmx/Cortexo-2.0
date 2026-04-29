<?php $this->load->view("include/header"); 
$controller_name = 'C_denomination';
$model_name      = 'denomination_model';
?>

<div>
    <ul class="breadcrumb">
        <li>
            <a href="#">Admin</a>
        </li>
        <li>
            <a href="#">Master</a>        </li>
		<li>
            <a href="#">Denomination Entry</a>        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">

               <div class="box-icon">
             
                    <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_denomination/open_listingform" class="btn btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
          </div>
            <div class="box-content">
                <!-- put your content here -->
				 <div class="container-fluid">      
					<?php
							$status				=	$type;
							$id					=	$_POST['fv']['den_code']==NULL ? NULL : $_POST['fv']['den_code'] ;
							$attributes 		=	array('class' => 'form-horizontal');
							//Opening form
							echo form_open($controller_name."/DB_Controller/".$model_name."/".$status."/".$id,$attributes); 
					?>
						<fieldset>
							<legend>Denomination  Master</legend>
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
										<label class="control-label col-sm-2">Denomination  * </label>
										<div class="col-sm-3">
											<input type="number" class="form-control" id="den_name" name="fv[den_name]" maxlength="5" value="<?php echo set_value('den_name',$den_name); ?>" required/>
											<span class="help-block">Enter the denomination.</span>										</div>
								      
								  </div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Order No * </label>
									  <div class="col-sm-3">
											<input type="number" class="form-control" value="<?php echo set_value('den_orderno',$den_orderno); ?>" id="den_orderno" name="fv[den_orderno]" maxlength="2"  required/>
										  <span class="help-block">Enter  the order no.</span>										</div>
									   
									</div>
								</div>
								<div class="row">
								  <div class="form-group">
										<label class="control-label col-sm-2">Active</label>
									<div class="col-sm-3">
										  <div class="btn-group" data-toggle="buttons">
										    <label class="btn btn-primary">
													<input type="radio" name="fv[den_status]" value="1"  <?php if($den_status==1) {?> checked="checked" <?php }  ?> >Yes
											</label>
											  <label class="btn btn-primary">
													<input type="radio" name="fv[den_status]" value="0"  <?php if($den_status==0) {?> checked="checked" <?php }  ?> >No
													</label>
											   
										  </div>
										<span class="help-block">To enable/disable denomination.</span>									  </div>
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
