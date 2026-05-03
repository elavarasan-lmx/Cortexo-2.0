<?php $this->load->view('include/header.php'); ?>
<script type="text/javascript" src="<?php echo $this->config->item('base_url'); ?>assets/tiny_mce/tiny_mce.js"></script>
<script type="text/javascript">
tinyMCE.init({
		mode : "textareas",
		theme : "advanced"
		//theme : "simple"
	});
	
	</script>
<div>
    <ul class="breadcrumb">
        <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
                <a href="#">Catelog</a>
		</li>
		<li>
                <a href="#">Product Entry</a>
        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">
				<div class="box-icon">
                    <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_product/open_listingform" class="btn btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
             
                    
             
            </div>
            <div class="box-content">
                <!-- put your content here -->
				 <div class="container-fluid">    
				 <?php
					$status				=	$type;
					$id					=	$_POST['fv']['pro_id']==NULL ? NULL : $_POST['fv']['pro_id'] ;
					$attributes 		=	array('class' => 'form-horizontal');
					//Opening form
					echo form_open_multipart('C_product/DB_Controller/product_model/'.$status.'/'.$id,$attributes); 
				?>
				
						<fieldset>
							<legend>Products</legend>
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
										<label class="control-label col-sm-2">Product Name* </label>
										<div class="col-sm-3">
											<input type="text" class="form-control" name="fv[pro_name]" tabindex="1" id="pro_name" value="<?php echo set_value('pro_name',$pro_name); ?>" placeholder="gold, silver" required maxlength="30"/>
											<span class="help-block">Name of the product displayed in product page</span>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Category Type *</label>
										<div class="col-sm-3">
										<select name="fv[pro_category]" id="com_type" tabindex="2" class="form-control" >
											<?php echo $this->product_model->get_category($pro_category); ?>
										</select>	
											<span class="help-block">This item will be categorized under this category</span>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Commodity Type * </label>
										<div class="col-sm-3">
											<select name="fv[pro_comtype]" id="com_type" tabindex="2" class="form-control" >
												<?php echo $this->product_model->get_comtype($pro_comtype); ?>
											</select>
											<span class="help-block">This item will be categorized under this commodity type</span>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Product Description</label>
										<div class="col-sm-9">
											<textarea style="width:100%; height:100%;" "class="form-control" id="news" name="fv[pro_desc]" ><?php echo set_value('pro_desc',$pro_desc);?></textarea>
											<span class="help-block">Description about this product</span>
										</div>
									</div>
								</div>
								<div class="row">
								 
									<div class="form-group">
										<label class="control-label col-sm-2">Product Image *</label>
										
										<div class="col-sm-3">
											<input type="file" name="pro_image" id="pro_image"  />
											&nbsp;<?php echo $pro_image ?>
											<input type="hidden" name="pro_image" id="pro_image" value="<?php echo $pro_image ?>" />
											<span class="help-block">Display image on product page</span>
										</div>
										</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Active</label>
										<div class="col-sm-3">
										  <div class="btn-group" data-toggle="buttons">
										  
										  <label class="btn btn-primary">
													<input name="fv[pro_status]" type="radio" id="pro_active_yes" value="1"  <?php if($pro_status==1) {?> checked="checked" <?php } ?>>Yes
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="fv[pro_status]" id="pro_active_no"  value="0"  <?php if($pro_status==0) {?> checked="checked" <?php } ?>>No </label>
											   
											</div>
											<span class="help-block">Enable/disable this product</span>
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
