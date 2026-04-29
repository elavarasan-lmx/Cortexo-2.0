<?php 
	$this->load->view('include/header.php');
?>
<div>
    <ul class="breadcrumb">
        <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
                <a href="#">Masters</a>
		</li>
		<li>
                <a href="#">Category Entry</a>
        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">
				<div class="box-icon">
                    <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_categories/open_listingform" class="btn btn-round btn-default"><i class="glyphicon glyphicon-remove"></i></a>
                </div>
             
                    
             
            </div>
            <div class="box-content">
                <!-- put your content here -->
				 <div class="container-fluid">    
				 <?php
					$status				=	$type;
					$id					=	$_POST['fv']['cat_id']==NULL ? NULL : $_POST['fv']['cat_id'] ;
					$attributes 		=	array('class' => 'form-horizontal');
					//Opening form
					echo form_open_multipart('C_categories/DB_Controller/category_model/'.$status.'/'.$id,$attributes); 
				?>
				
						<fieldset>
							<legend>Category</legend>
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
										<label class="control-label col-sm-2">Category Name* </label>
										<div class="col-sm-3">
											<input type="text" class="form-control" name="fv[cat_name]" tabindex="1" id="cat_name" value="<?php echo set_value('cat_name',$cat_name); ?>" placeholder="Category Name" required maxlength="30" onkeypress="validateKeyPress(event, this, 4)"/>
											<span class="help-block">Name of the item to be displayed in category page</span>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Category Image *</label>
										
										<div class="col-sm-3">
											<input type="file"  class="form-control"  name="cat_image" id="cat_image"  />
											&nbsp;<?php echo $cat_image ?>
											<input type="hidden"  class="form-control"  name="cat_image" id="cat_image" value="<?php echo $cat_image ?>" />
											<span class="help-block">Display image on Category page</span>
										</div>
										</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Category Description *</label>
										<div class="col-sm-6">
											<textarea class="form-control" required="" name="fv[cat_desc]" id="cat_desc" cols="35" rows="5" tabindex="4"><?php echo $cat_desc; ?></textarea>
											
											<span class="help-block">This item will be categorized under this group</span>
										</div>
									</div>
								</div>
								
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Inner Page</label>
										<div class="col-sm-3">
										  <div class="btn-group" data-toggle="buttons">
										  
										  <label class="btn btn-primary">
													<input name="fv[cat_avail_product]" type="radio" id="cat_avail_product" value="0"  <?php if($cat_avail_product==0) {?> checked="checked" <?php } ?>>Yes
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="fv[cat_avail_product]" id="cat_avail_product"  value="1"  <?php if($cat_avail_product==1) {?> checked="checked" <?php } ?>>No </label>
											   
											</div>
											<span class="help-block">Is this category having inner page</span>
										</div>
									</div>
								</div>
								
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Active</label>
										<div class="col-sm-3">
										  <div class="btn-group" data-toggle="buttons">
										  
										  <label class="btn btn-primary">
													<input name="fv[cat_status]" type="radio" id="cat_active_yes" value="1"  <?php if($cat_status==1) {?> checked="checked" <?php } ?>>Yes
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="fv[cat_status]" id="cat_active_no"  value="0"  <?php if($cat_status==0) {?> checked="checked" <?php } ?>>No </label>
											   
											</div>
											<span class="help-block">Enable/disable this category</span>
										</div>
									</div>
								</div>
								
								<div class="form-group">
								<div class="panel panel-default">
								<div class="panel-body">
								<div class="col-xs-offset-2 col-xs-10">
									<button type="submit" class="btn btn-success"> <i class="glyphicon glyphicon-floppy-save icon-white"></i> Save</button>
								
									<button type="reset" class="btn btn-danger"><i class="glyphicon glyphicon-floppy-remove icon-white"></i> Cancel</button>
									
									</div></div>
								</div>
								<p align="right">* Required fields </p>
							</div>
							</fieldset>
					</form>

				</div>	
				<!-- Content End -->
            </div>
        </div>
    </div>
</div><!--/row-->


<?php  $this->load->view('include/footer.php'); ?>
