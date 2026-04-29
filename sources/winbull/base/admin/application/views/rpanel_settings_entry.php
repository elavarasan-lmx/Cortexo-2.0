<?php $this->load->view('include/header.php'); ?>

<script type="text/javascript">
function set_colorproperties() {
	if(document.getElementById("h_colour_0").checked == true) {
		document.getElementById("l_colour_0").disabled = true;
	} else if(document.getElementById("l_colour_0").checked == true) {
		document.getElementById("h_colour_0").disabled = true;
	} else {
		document.getElementById("l_colour_0").disabled = false;
		document.getElementById("h_colour_0").disabled = false;
	}
	if(document.getElementById("h_colour_1").checked == true) {
		document.getElementById("l_colour_1").disabled = true;
	} else if(document.getElementById("l_colour_1").checked == true) {
		document.getElementById("h_colour_1").disabled = true;
	} else {
		document.getElementById("l_colour_1").disabled = false;
		document.getElementById("h_colour_1").disabled = false;
	}
	if(document.getElementById("h_colour_2").checked == true) {
		document.getElementById("l_colour_2").disabled = true;
	} else if(document.getElementById("l_colour_2").checked == true) {
		document.getElementById("h_colour_2").disabled = true;
	} else {
		document.getElementById("l_colour_2").disabled = false;
		document.getElementById("h_colour_2").disabled = false;
	}
}
</script>
<div>
    <ul class="breadcrumb">
        <li>
            <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
        </li>
        <li>
            <a href="#">Settings</a>
        </li>
		<li>
            <a href="#">House keeping</a>
        </li>
    </ul>
</div>

<div class="row">
    <div class="box col-md-12">
        <div class="box-inner">
            <div class="box-header well" data-original-title="">
          </div>
            <div class="box-content">
            
			
			
			    <!-- put your content here -->
				
			<div class="container-fluid">      
	<?php
/*	$status				=	$type;
	$id					=	$_POST['fv']['serv_id']==NULL ? NULL : $_POST['fv']['serv_id'] ;
	*/
	$attributes 		=	array('id' => 'iframeForm', 'name' => 'iframeForm');
	//Opening form
	echo form_open('C_rpanel_settings/DB_Controller/rpanel_settings_model/',$attributes); 
	//print_r($result_set);
	
	$result_set=$this->rpanel_settings_model->set_data();
	
	$h_colour		=0;
	$h_colour		=1;
	$confirm_time	=40;
	
	//print_r($result_set);
	foreach($result_set->result() as $row)
	{	
		$h_colour		=$row->h_colour;
		$l_colour		=$row->l_colour;
		$confirm_time	=$row->confirm_time;
		$trans_period	=$row->trans_period;
		$clientview		=$row->clientview;
		$isholiday		=$row->isholiday;
		$confirmation_for=$row->confirmation_for;
		$margin_type	 =$row->margin_type;
		
	}
	?>
						<fieldset>
							<legend>General settings </legend>
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
										<label class="control-label col-sm-2">High * </label>
									  <div class="col-sm-3">
											<div class="btn-group" data-toggle="buttons">
												<label class="btn btn-primary">
													<input type="radio" name="fv[h_colour]" value="0" id="h_colour_0" onchange="set_colorproperties();" <?php echo $h_colour==0?"checked=checked":""; ?> <?php echo $l_colour==0?"disabled=disabled":""; ?> />Red
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="fv[h_colour]" value="1" id="h_colour_1" onchange="set_colorproperties();" <?php echo $h_colour==1?"checked=checked":""; ?> <?php echo $l_colour==1?"disabled=disabled":""; ?>/>Green
												 </label>
											     <label class="btn btn-primary">
													<input type="radio" name="fv[h_colour]" value="2" id="h_colour_2" onchange="set_colorproperties();" <?php echo $h_colour==2?"checked=checked":""; ?> <?php echo $l_colour==2?"disabled=disabled":""; ?> />Blue
												 </label>
											</div>
										  <span class="help-block">Choose high value colour</span>										</div>
									  <label class="control-label col-sm-2"></label><div class="col-sm-3"></div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Low * </label>
									  <div class="col-sm-3">
											<div class="btn-group" data-toggle="buttons">
												<label class="btn btn-primary">
													 <input type="radio" name="fv[l_colour]" value="0" id="l_colour_0" onchange="set_colorproperties();" <?php echo $l_colour==0?"checked=checked":""; ?> <?php echo $h_colour==0?"disabled=disabled":""; ?>  />Red
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="fv[l_colour]" value="1" id="l_colour_1" onchange="set_colorproperties();" <?php echo $l_colour==1?"checked=checked":""; ?> <?php echo $h_colour==1?"disabled=disabled":""; ?>/>Green
													</label>
													<label class="btn btn-primary">
													<input type="radio" name="fv[l_colour]" value="2" id="l_colour_2" onchange="set_colorproperties();" <?php echo $l_colour==2?"checked=checked":""; ?> <?php echo $h_colour==2?"disabled=disabled":""; ?> />Blue
													</label>
											   
											</div>
										  <span class="help-block">Select low value colour.</span>										</div>
									  <label class="control-label col-sm-2"></label><div class="col-sm-3"></div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Client View  * </label>
										<div class="col-sm-3">
											<input type="checkbox" name="fv[clientview]" id="clientview" <?php if($clientview==1) {?> checked="checked" <?php } ?>/>  
											<span class="help-block">Client view.</span>	</div>
									    <label class="control-label col-sm-2"></label>
								  </div>
								</div>
								<div class="row">
									<div class="form-group">
									<label class="control-label col-sm-2"><b>Push Rate</b></label>
									  <div class="col-sm-3">
									   <input type="checkbox" name="fv[isholiday]" id="fv[isholiday]" <?php if($isholiday==1) {?> checked="checked" <?php } ?>/>
									    <span class="help-block">Push rate.</span>	</div>
									      <label class="control-label col-sm-2"></label>
								  </div></div>
								  <div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Auto * </label>
									  <div class="col-sm-3">
											<div class="btn-group" data-toggle="buttons">
												<label class="btn btn-primary">
													<input type="radio" name="fv[confirmation_for]" value="0" id="confirmation_cancel" <?php echo $confirmation_for==0?"checked=checked":""; ?> />Rejection
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="fv[confirmation_for]" value="1" id="confirmation_book" <?php echo $confirmation_for==1 ? "checked=checked":""; ?> /> Confirmation
													</label>
											</div>
										  <span class="help-block">To enable auto rejection or confirmation.</span>										</div>
									  <label class="control-label col-sm-2"></label><div class="col-sm-3"></div>
									</div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Duration * </label>
										<div class="col-sm-3">
											<input class="form-control" required type="number" id="confirm_time" name="fv[confirm_time]" value="<?php echo set_value('confirm_time',$confirm_time); ?>" /> (Seconds)
											<span class="help-block">Enter time duration.</span>	</div>
									    <label class="control-label col-sm-2"></label>
								  </div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Transaction Period * </label>
										<div class="col-sm-3">
											<input class="form-control" required type="number" id="trans_period" name="fv[trans_period]" value="<?php echo set_value('trans_period',$trans_period); ?>" /> (Days)
											<span class="help-block">Enter the transaction period.</span>	</div>
									    <label class="control-label col-sm-2"></label>
								  </div>
								</div>
								<div class="row">
									<div class="form-group">
										<label class="control-label col-sm-2">Margin in terms of * </label>
									  <div class="col-sm-3">
											<div class="btn-group" data-toggle="buttons">
												<label class="btn btn-primary">
													<input type="radio" name="fv[margin_type]" id="margin_type"  value="0" <?php if($margin_type == 0){?> checked="checked" <?php } ?>  />percentage
												</label>
												<label class="btn btn-primary">
													<input type="radio" name="fv[margin_type]" id="margin_type"  value="1" <?php if($margin_type == 1){?> checked="checked" <?php } ?>  /> value
													</label>
											</div>
										  <span class="help-block">Enable margin value type.</span>										</div>
									  <label class="control-label col-sm-2"></label><div class="col-sm-3"></div>
									</div>
								</div>
								<div class="form-group">
            <div class="col-xs-offset-2 col-xs-10" >
                <button type="submit" class="btn btn-success">Save</button>
            
                <button type="reset" class="btn btn-danger">Cancel</button>
				<p align="right">* Required fields </p>
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
