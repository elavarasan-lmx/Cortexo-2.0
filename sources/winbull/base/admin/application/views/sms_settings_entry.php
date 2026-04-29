<?php $this->load->view('include/header.php'); ?>
<script type="text/javascript">
	
function insertValueQuery() {
    var url_field = document.getElementById("sms_content");
    var selected_field = document.getElementById("field_list").value;	

	//IE support
	if (document.selection) {
		url_field.focus();
		sel = document.selection.createRange();
		sel.text = selected_field;
		document.sqlform.insert.focus();
	}
	//MOZILLA/NETSCAPE support
	else if (url_field.selectionStart || url_field.selectionStart == "0") {
		//alert(url_field.selectionStart);
		var startPos = url_field.selectionStart;
		var endPos = url_field.selectionEnd;
		var chaineSql = url_field.value;

		url_field.value = chaineSql.substring(0, startPos) + selected_field + chaineSql.substring(endPos, chaineSql.length);
	} else {
		url_field.value += selected_field;
	}
}

</script>
<style>
.footer{padding:0px 10px}
.EnableDisableComm {
	display:none;
}
.com-barQuantities {
	padding: 0px;
}
</style>

<!--<div>
    <ul class="breadcrumb">
        <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Settings</a></li>
		<li> <a href="#">SMS Settings Entry</a></li>
    </ul>
</div>-->
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title" data-original-title=""><a href="<?php echo $this->config->item('base_url') ?>index.php/C_sms_settings/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<?php
							$status			=	$type;
							$id				=	$_POST['fv']['service_id']==NULL ? NULL : $_POST['fv']['service_id'] ;	
							
							$attributes 	=	array('class' => 'iframeForm', 'id' => 'iframeForm', 'name' => 'iframeForm');
							//Opening form
							
							echo form_open('C_sms_settings/DB_Controller/sms_settings_model/'.$status.'/'.$id,$attributes); 
								
						?>	
						<form class="form-sample">
							<p class="card-description card-description1"> SMS Settings</p>
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
										<label class="col-sm-4 col-form-label">Service* </label>
										<div class="col-sm-7">
											<input type="hidden" id="service_id" name="fv[service_id]" value="<?php echo set_value('service_id',$id);?>" /><?php echo $serv_name;?>  
														<span class="help-block">Service name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">SMS Content*</label>
										<div class="col-sm-9">
											<textarea style="width: 100%;"  class="form-control" rows="10" name="fv[sms_content]" id="sms_content" required minlength="10" maxlength="1000"><?php echo set_value('sms_content',$sms_content);?></textarea>
											<span class="help-block">Enter or choose the SMS content.</span>
										</div>
									</div>
								</div>
								<div  class="col-md-1">
									<div  class="btn-group" data-toggle="buttons">
										<label onclick="insertValueQuery()" style="margin-top: 60px;" class="btn btn-primary">
											<a style="color:#0d6efd; text-decoration:none" href="" id="move_button" name="move_button" > << </a>
										</label>
									</div>
								</div>
								<div class="col-md-5">
									<div class="form-group row">
										<select style="height: 170px;" class="form-control" size="11" id="field_list" name="field_list">
											<?php if (($service_id >=1 && $service_id <= 3) || $service_id == 7 ) { ?>
												<option value="@@cus_id@@">Customer ID</option>
												<option value="@@cus_register_on@@">Register on</option>
												<option value="@@cus_name@@">Customer Name</option>
												<option value="@@cus_company_name@@">Company Name</option>
												<option value="@@cus_address@@">Address</option>
												<option value="@@cus_city@@">City</option>
												<option value="@@cus_mobile1@@">Mobile No1</option>
												<option value="@@cus_email@@">E-Mail</option>
												<option value="@@cus_login_name@@">Login Name</option>
												<option value="@@cus_login_password@@">Password</option>
												<option value="@@cus_sec_code@@">Security code</option>
												<option value="@@cus_confirmed_on@@">Confirm On</option>
												<option value="@@cus_approved_on@@">Approved On</option>
												<option value="@@cus_valid_till@@">Valid Till</option>
												<option value="@@cus_active@@">Active</option>
												<?php } else if ($service_id ==4 || $service_id == 5 || $service_id == 8 || $service_id == 9 || $service_id == 10) { ?>
												<option value="@@book_no@@">Booking No</option>
												<option value="@@book_cusid@@">Customer Name</option>
												<option value="@@book_datetime@@">Date & Time</option>
												<option value="@@book_comid@@">Commodity Name</option>
												<option value="@@book_type@@">Type</option>
												<option value="@@book_qty@@">Qty</option>
												<option value="@@book_rate@@">Rate</option>
												<option value="@@book_totalcost@@">Total Cost</option>
												<option value="@@book_confirmedon@@">Confirmed On</option>
												<option value="@@book_status@@">Status</option>			
												<option value="@@book_deliveredon@@">Deliveryed On</option>
												<?php } else if ($service_id == 6) { ?>
												<option value="@@invoice_delcode@@">Delivery Code</option>
												<option value="@@invoice_bookno@@">Booking No</option>
												<option value="@@cus_name@@">Customer Name</option>
												<option value="@@cusdel_date@@">Delivery Date</option>
												<option value="@@book_datetime@@">Book Date</option>
												<option value="@@invoice_deliveryqty@@">Delivery Qty</option>
												<option value="@@invoice_totalamt@@">Delivery Amt</option>
												<option value="@@book_type@@">Book Type</option>
												<option value="@@book_qty@@">Total Qty</option>
												<option value="@@book_rate@@">Rate</option>
												<option value="@@invoice_penality@@">Penalty</option>
												<option value="@@book_totalcost@@">Total Amt</option>
												<option value="@@com_name@@">Commodity Name</option>
												<?php } ?>
										</select>	
										<span class="help-block">Select  the value.</span>
									</div>
								</div>
							</div>
							
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Footer*</label>
										<div class="col-sm-7">
											<input style="" class="form-control"  type="text" id="sms_footer" name="fv[sms_footer]" value="<?php echo set_value('sms_footer',$sms_footer);?>" maxlength="50" minlength="3" required onkeydown="validateKeyPress(event, this,8)"/>
											<span class="help-block">Enter the footer text.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-2 col-form-label">DLT ID*</label>
										<div class="col-sm-8">
											<input style="" class="form-control"  type="text" id="sms_dlt_te_id" name="fv[sms_dlt_te_id]" value="<?php echo set_value('sms_dlt_te_id',$sms_dlt_te_id);?>" maxlength="19" minlength="19" required onkeydown="validateKeyPress(event, this,1)"/>
											<span class="help-block">Enter the footer text.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if($status == "edit") { ?>
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } else if($status == "add_new") { ?>
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } ?>
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