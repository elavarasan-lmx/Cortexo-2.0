<?php 
$this->load->view("include/header");
$this->load->helper('common');

?>
<script language="javascript">
$(document).ready(function()
{
	$('body').on("keyup","#cus_mobile", function() {
		$("#cus_login_name").val($(this).val());
	});
	$('#alert_from').timepicker({
		template: false,
		showInputs: false,
		minuteStep: 1
	});
	$('#alert_to').timepicker({
		template: false,
		showInputs: false,
		minuteStep: 1
	});
});
function changeField() 
{
	arguments[0].style.display = "none";	
	document.getElementById('cus_login_password1').style.display = "block";
	document.getElementById('new_password').style.display = "table-row";
	document.getElementById('retype_password').style.display = "table-row";
	document.getElementById('cus_login_password1').focus();
}
function validate_image()
{
	if(arguments[0].files[0].size > 1048576)
	{
	  showToast('File size cannot be greater than 1 MB','danger');
	  arguments[0].value = "";
	}
	else
	{
		var fileName =arguments[0].value;
		var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
		ext = ext.toLowerCase();
		if(ext != "jpg" && ext != "png" && ext != "jpeg")
		{
			showToast("Upload JPG or PNG Images only",'danger');
			arguments[0].value = "";
		}
	}
}
function validate(e)
{
	e.preventDefault();
	if($("#cus_login_password").val() == $("#cus_login_con_password").val())
	{
		$("#ajax_loader").addClass("show");
		$("#iframeForm").submit();
	}
	else
	{
		showToast("Passwords not matching",'danger');
		$("#cus_login_password").val("");
		$("#cus_login_con_password").val("");
		$("#cus_login_password").focus();
	}
	return false;
}	
function validateAndFormatTime(event, input) {
    let char = event.key;

    // Allow only numbers and a single colon ":"
    if (!/[0-9:]/.test(char)) return false;
    if (char === ":" && (input.value.includes(":") || input.value.length < 1 || input.value.length > 2)) return false;
    if (input.value.length >= 5) return false; // Limit to HH:mm format

    // Delay format validation to allow input update
    setTimeout(() => {
        if (input.value.length >= 4 && !/^(?:[0-9]|[01][0-9]|2[0-3]):[0-5][0-9]$/.test(input.value)) {
            showToast("Invalid time format! Use H:mm or HH:mm (e.g., 9:00 or 23:30)",'danger');
            input.value = "";
        }
    }, 100);
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
.table {
margin-bottom:0px !important;
}
/* -------- LOADER OVERLAY -------- */
#ajax_loader {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(255, 255, 255, 0.7);
	z-index: 9999;
	display: none;
	justify-content: center;
	align-items: center;
	text-align: center;
	transition: opacity 0.2s ease-in-out;
}
#ajax_loader.show {
	display: flex !important;
	justify-content: center !important;
	opacity: 1;
}
#ajax_loader img {
	height: 100px;
	display: block;
	margin: 0 auto;
}
</style>
<!--<div>
    <ul class="breadcrumb">
		<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Clinets</a></li>
		<li> <a href="#">Client Entry</a></li>
    </ul>
</div>-->
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry-->
							<!-- <a href="<?php echo $this->config->item('base_url') ?>index.php/C_clients/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>  -->
						</h4>
						<?php
						$cur_status				=	$type;
						$id					=	$_POST['fv']['id_client']==NULL ? NULL : $_POST['fv']['id_client'] ;
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm');
						//Opening form
						echo form_open_multipart('C_clients/DB_Controller/client_model/'.$cur_status.'/'.$id,$attributes); ?>
						<form class="form-sample">
							<p class="card-description card-description1">Client Details</p>
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
										<label class="col-sm-4 col-form-label">Client Name*</label>
										<div class="col-sm-7">
											<input type="text" name="fv[client]" id="client" tabindex="1" value="<?php echo set_value('client',$client); ?>" class="form-control" maxlength="30" required onkeydown="validateKeyPress(event, this,4)"/>
											<span class="help-block">Enter the client name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Clinet Code*</label>
										<div class="col-sm-7">
											<input type="text" name="fv[code]" tabindex="2" id="code" class="form-control" value="<?php echo set_value('code',$code); ?>" required maxlength="30" onkeydown="validateKeyPress(event, this,4)"/>
											<span class="help-block">Enter the  client code.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Clinet Name</label>
										<div class="col-sm-7">
											<input type="text" name="fv[name]" tabindex="7" id="name" value="<?php echo set_value('name',$name); ?>" class="form-control" placeholder="" maxlength="30" onkeydown="validateKeyPress(event, this,4)"/>
											<span class="help-block">Enter the client name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">One signal id</label>
										<div class="col-sm-7">
											<input type="text" name="fv[onesignalid]" tabindex="7" id="onesignalid" value="<?php echo set_value('onesignalid',$onesignalid); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,4)" maxlength="50"/>
											<span class="help-block">Enter the one signal id.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">One Signal API</label>
										<div class="col-sm-7">
											<input  type="text"  name="fv[onesignalapi]" id="onesignalapi" class="form-control "  placeholder=""  value="<?php echo set_value('onesignalapi',$onesignalapi); ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="300"/>
											<span class="help-block">Enter one signal api.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Firebase key</label>
										<div class="col-sm-7">
											<input  type="text" name="fv[firebaseserverkey]" id="firebaseserverkey"  placeholder=""  class="form-control " value="<?php echo set_value('firebaseserverkey',$firebaseserverkey); ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="50"/>
											<span class="help-block">Enter firebase key.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Sender Id</label>
										<div class="col-sm-7">
											<input  type="text"  name="fv[smssenderid]" id="smssenderid" class="form-control "  placeholder="" value="<?php echo set_value('smssenderid',$smssenderid); ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="30"/>
											<span class="help-block">Enter SMS sender id.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">  
									
								</div>
								
							</div>
							<p class="card-description card-description1 client_details">URL Settings</p>
							<div class="row form-sample1">
								<div class="col-md-9">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Baseurl*</label>
										<div class="col-sm-9" >
											<input type="text"  name="fv[baseurl]" id="baseurl" tabindex="3" class="form-control"  value="<?php echo set_value('baseurl',$baseurl); ?>" placeholder="" maxlength="100"/>
											<span class="help-block">Enter the base url.</span>	
										</div>
									</div>
								</div>
								<div class="col-md-3">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-9">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Order exe url*</label>
										<div class="col-sm-9" >
											<input type="text"  name="fv[orderexeurl]" tabindex="4" value="<?php echo set_value('orderexeurl',$orderexeurl); ?>"  id="orderexeurl" class="form-control" maxlength="100"/>
											<span class="help-block">Enter order execute report url.</span>	
										</div>
									</div>
								</div>
								<div class="col-md-3">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-9">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Limit Expiry URL*</label>
										<div class="col-sm-9" >
											<input  type="text"  name="fv[limitexpireurl]" id="limitexpireurl" class="form-control "  placeholder=""  value="<?php echo set_value('limitexpireurl',$limitexpireurl); ?>" maxlength="100"/>
											<span class="help-block">Enter limit expiry url.</span>	
										</div>
									</div>
								</div>
								<div class="col-md-3">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-9">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Trade On/Off URL*</label>
										<div class="col-sm-9" >
											<input  type="text" name="fv[tradeonoffurl]" id="tradeonoffurl"  placeholder=""  class="form-control"  value="<?php echo set_value('tradeonoffurl',$tradeonoffurl); ?>" maxlength="100"/>
											<span class="help-block">Enter trade on off url.</span>
										</div>
									</div>
								</div> 
								<div class="col-md-3">
								</div>
							</div>
							<p class="card-description card-description1 client_details">High / Low Alert Settings</p>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Required high/low alert*</label>
										<div class="col-sm-7" >
											<?php render_radio_group(
												'fv[requiredhighlowalert]',
												[
													1 => ['label' => 'Active', 'id' => 'requiredhighlowalert_yes'],
													0 => ['label' => 'Inactive', 'id' => 'requiredhighlowalert_no']
												],
												$requiredhighlowalert,
												'Required high/low alert notification option .'
											); ?>	
										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gold Up*</label>
										<div class="col-sm-7" >
											<input type="text" name="fv[higlowalertsettings_gold_up]" tabindex="9" id="higlowalertsettings_gold_up" value="<?php echo set_value('higlowalertsettings_gold_up',$higlowalertsettings_gold_up); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,1)"/>
											<span class="help-block">Enter the gold up value .</span>	
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gold Down</label>
										<div class="col-sm-7" >
											<input type="text" name="fv[higlowalertsettings_gold_down]" tabindex="10"  id="higlowalertsettings_gold_down" class="form-control" value="<?php echo set_value('higlowalertsettings_gold_down',$higlowalertsettings_gold_down); ?>" placeholder="" onkeydown="validateKeyPress(event, this,1)"/>
											<span class="help-block">Enter the gold down value.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Silver Up*</label>
										<div class="col-sm-7" >
											<input type="text" name="fv[higlowalertsettings_silver_up]" tabindex="9" id="higlowalertsettings_silver_up" value="<?php echo set_value('higlowalertsettings_silver_up',$higlowalertsettings_silver_up); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,1)"/>
											<span class="help-block">Enter the silver up value .</span>	
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Silver Down</label>
										<div class="col-sm-7" >
											<input type="text" name="fv[higlowalertsettings_silver_down]" tabindex="10"  id="higlowalertsettings_silver_down" class="form-control" value="<?php echo set_value('higlowalertsettings_silver_down',$higlowalertsettings_silver_down); ?>" placeholder="" onkeydown="validateKeyPress(event, this,1)"/>
											<span class="help-block">Enter the silver down value.</span>
										</div>
									</div>
								</div>
							</div>
							<p class="card-description card-description1 client_details">Contract Symbol Settings</p>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">MCX Gold*</label>
										<div class="col-sm-7" >
											<select name="fv[gold_contract]" tabindex="10"  id="gold_contract" class="form-control">
												<?php foreach($contracts as $cont) { ?>
													<option value="<?php echo $cont['contract_symbol'] ?>" <?php echo $cont['contract_symbol'] == $gold_contract ? "selected=selected" : ""; ?> ><?php echo $cont['contract_symbol'] ?></option>
												<?php } ?>
											</select>
											<span class="help-block">Select MCX gold contract symbol .</span>	
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">MCX Silver</label>
										<div class="col-sm-7" >
											<select name="fv[silver_contract]" tabindex="10"  id="silver_contract" class="form-control">
												<?php foreach($contracts as $cont) { ?>
													<option value="<?php echo $cont['contract_symbol'] ?>" <?php echo $cont['contract_symbol'] == $silver_contract ? "selected=selected" : ""; ?> ><?php echo $cont['contract_symbol'] ?></option>
												<?php } ?>
											</select>
											<span class="help-block">Select MCX silver contract symbol .</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Bank Gold*</label>
										<div class="col-sm-7" >
											<input type="text" name="fv[bank_gold_contract]" tabindex="9" id="bank_gold_contract" value="<?php echo set_value('bank_gold_contract',$bank_gold_contract); ?>" class="form-control" placeholder="" maxlength="30" onkeydown="validateKeyPress(event, this,4)" required/>
											<span class="help-block">Enter bank gold contract symbol .</span>	
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Bank Silver</label>
										<div class="col-sm-7" >
											<input type="text" name="fv[bank_silver_contract]" tabindex="10"  id="bank_silver_contract" class="form-control" value="<?php echo set_value('bank_silver_contract',$bank_silver_contract); ?>" placeholder="" maxlength="30" onkeydown="validateKeyPress(event, this,4)"/>
											<span class="help-block">Enter bank silver contract symbol.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Exchange*</label>
										<div class="col-sm-7" >
											<input type="text" name="fv[exchange_rate]" tabindex="9" id="exchange_rate" value="<?php echo set_value('exchange_rate',$exchange_rate); ?>" class="form-control" placeholder="" maxlength="30" onkeydown="validateKeyPress(event, this,4)" required/>
											<span class="help-block">Enter exchange rate symbol .</span>	
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Alert Type</label>
										<div class="col-sm-7" >
											<?php render_radio_group(
												'fv[alertfor]',
												[
													1 => ['label' => 'Bank', 'id' => 'alertfor_bank'],
													2 => ['label' => 'MCX', 'id' => 'alertfor_mcx']
												],
												$alertfor,
												'Select high / low alert type.'
											); ?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Begin*</label>
										<!-- <div class="col-sm-7" >
											<input type="text" name="fv[alert_from]" tabindex="9" id="alert_from" value="<?php echo set_value('alert_from',$alert_from); ?>" class="form-control" required placeholder="" onkeypress="return validateAndFormatTime(event, this)"/>
											<span class="help-block">Notification begin time (e.g., 9:00 or 23:30).</span>
										</div> -->
										<div class="col-sm-7 time timeAndDays">
											<div class="bootstrap-timepicker">
												<input id="alert_from" name="fv[alert_from]" type="text" class="input-small form-control" value="<?php echo set_value('alert_from',$alert_from); ?>"/>
												<span class="help-block">Notification begin time (e.g., 9:00 or 23:30).</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">  
										<label class="col-sm-4 col-form-label">End</label>
										<!-- <div class="col-sm-7" >
											<input type="text" name="fv[alert_to]" tabindex="10"  id="alert_to" class="form-control" value="<?php echo set_value('alert_to',$alert_to); ?>" placeholder=""/>
											<span class="help-block">Notification end time (e.g., 9:00 or 23:30).</span>
										</div> -->
										<div class="col-sm-7 time timeAndDays">
											<div class="bootstrap-timepicker">
												<input id="alert_to" name="fv[alert_to]" type="text" class="input-small form-control" value="<?php echo set_value('alert_to',$alert_to); ?>"/>
												<span class="help-block">Notification end time (e.g., 9:00 or 23:30).</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Required Rate Alert*</label>
										<div class="col-sm-7" >
											<?php render_radio_group(
												'fv[ratealert]',
												[
													1 => ['label' => 'Yes', 'id' => 'ratealert_yes'],
													0 => ['label' => 'No', 'id' => 'ratealert_no']
												],
												$ratealert,
												'Required rate alert option .'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">High/Low Rate display</label>
										<div class="col-sm-7" >
											<?php render_radio_group(
												'fv[highlow]',
												[
													1 => ['label' => 'Yes', 'id' => 'alertfor_yes'],
													0 => ['label' => 'No', 'id' => 'alertfor_no']
												],
												$highlow,
												'Required to show high/low rates.'
											); ?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Status*</label>
										<div class="col-sm-7" >
											<?php render_radio_group(
												'fv[status]',
												[
													1 => ['label' => 'Active', 'id' => 'status_yes'],
													0 => ['label' => 'Inactivate', 'id' => 'status_no']
												],
												$status,
												'Required rate alert option .'
											); ?>

										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1" style="margin-top:30px;">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<button type="submit" onclick="validate(event)" class="btn btn1 btn-success btn-md btn-md1">Save</button>
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

<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>
