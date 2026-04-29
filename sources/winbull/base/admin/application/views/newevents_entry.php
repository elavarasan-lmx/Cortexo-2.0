<?php $this->load->view('include/header.php');
 ?>

 <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
  <link rel="stylesheet" href="/resources/demos/style.css">
  <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
 <script type="text/javascript">
 $(function() {
//$( "#datepicker" ).datepicker();
$('#datepicker').datepicker({
minDate: 0,
dateFormat: 'yy-mm-dd'
});
});
</script>
<div>
    <ul class="breadcrumb">
         <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
        <li>
            <a href="#">Events</a>
        </li>
		
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">
                <div class="box-icon">
                    
                     <a href="<?php echo $this->config->item('base_url') ?>index.php/C_userevent/openevent_listingform" class="btn btn-round btn-default"><i
                            class="glyphicon glyphicon-remove"></i></a>
                </div>
            </div>
            <div class="box-content">
			<!-- put your content here -->
				
			<div class="container-fluid">
				<?php
						$status				=	$type;
						$id					=	$_POST['fv']['eve_id']==NULL ? NULL : $_POST['fv']['eve_id'] ;
						$attributes 		=	array('class' => 'form-horizontal');

						$eve_name=$_POST['fv']['eve_name'];
						
						//Opening form
						echo form_open_multipart('C_userevent/DB_Controller/userevent_model/'.$status.'/'.$id,$attributes); 
				?>
      
						<fieldset>
							<legend>Events</legend>
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
										<label class="control-label col-sm-2">Event Name * </label>
										<div class="col-sm-3">
											<input type="text" name="fv[eve_name]" id="eve_name" class="form-control" value="<?php echo set_value('eve_name',$eve_name); ?>" required />
											<span class="help-block">Enter the Event Name .</span>
										</div>
									    <label class="control-label col-sm-2">Event Date *</label>
										<div class="col-sm-3">
										<input type="text" id="datepicker" name="fv[eve_date]" class="form-control" value="<?php echo set_value('eve_date',$eve_date);?>" placeholder=""/>
											<!---<input type="text" name="fv[eve_date]" id="datetimepicker" class="form-control" value="<?php echo set_value('eve_date',$eve_date); ?>" placeholder=""/>-->
											<span class="help-block">Click the Event Date.</span>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Event Auspicious Time(AM) * </label>
										<div class="col-sm-3">
											<input type="text" name="fv[eve_timeam]" id="eve_timeam" class="form-control" value="<?php echo set_value('eve_timeam',$eve_timeam); ?>"  />
											<span class="help-block">Enter the Event Name .</span>
										</div>
									    <label class="control-label col-sm-2">Event Auspicious Time(PM) *</label>
										<div class="col-sm-3">
										<input type="text" id="eve_timepm" name="fv[eve_timepm]" class="form-control" value="<?php echo set_value('eve_timepm',$eve_timepm);?>" placeholder=""/>
											<!---<input type="text" name="fv[eve_date]" id="datetimepicker" class="form-control" value="<?php echo set_value('eve_timepm',$eve_timepm); ?>" placeholder=""/>-->
											<span class="help-block">Click the Event Date.</span>
										</div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Event Description* </label>
										<div class="col-sm-3">
											<input type="text" name="fv[eve_description]" id="eve_description" class="form-control" value="<?php echo set_value('eve_description',$eve_description); ?>" required />
											<span class="help-block">Enter the Event Description .</span>
										</div>
									</div>
								</div>
								<div class="form-group">
									<div class="col-xs-offset-2 col-xs-10">
										<button type="submit" class="btn btn-success">Save</button>
										<button type="reset" onclick="location.href = '<?php echo $this->config->item('base_url'); ?>index.php/C_userevent/openevent_listingform'" class="btn btn-danger">Cancel</button>
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