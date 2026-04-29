<?php 
	$this->load->view('include/header.php');
?>
<script type="text/javascript">
function sendsms() {
	var mobno=document.getElementById('serv_group_number').value;
	var mobno_length=document.getElementById('serv_group_number').value.length;
	var desc=document.getElementById('serv_group_desc').value;
	var desc_length=document.getElementById('serv_group_desc').value.length;
	if(mobno!="" && mobno_length < 110 && desc!="" && desc_length <= 160) {
	sendsmsText();
	}
	else if(mobno=="") {
	showToast("Mobile Number field is Empty",'danger');
	}
	else if(desc=="") {
	showToast("Description field is Empty",'danger');
	}
	else if(desc_length > 160 ) {
	showToast("Please Enter the description with in 160 character",'danger');
	}
}
function sendsmsText() {
	var mob_no		= document.getElementById('serv_group_number').value;
	var description	= document.getElementById('serv_group_desc').value;
	//alert(mob_no+"   "+description);
		$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_customersms/create_smsurl",
		data: "group_id="+mob_no+"&send_type="+description,
		success: function(data) {
			client_sendsms(data);
			document.getElementById('serv_group_number').value="";
			document.getElementById('serv_group_desc').value="";
			showToast("SMS Send Successfully",'success');						
		},
		error: function(request,error) {
			showToast("OOPS! something error",'danger');
		}
	});
}
function client_sendsms() {
	//alert(arguments[0]);
	$.ajax({						
		type: "POST",					   		
		url: arguments[0],
		success: function(data) {
			showToast("SMS Send Successfully",'danger');			
		},
		error: function(request,error) {
			showToast("OOPS,something error",'danger');
		}
	});
}
function cleartext() {
document.getElementById('serv_group_number').value="";
document.getElementById('serv_group_desc').value="";
}
	</script>

<!--<div>
    <ul class="breadcrumb">
		 <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
                <a href="#">SMS/Email</a>
		</li>
		<li>
                <a href="#">Quick SMS</a>
		</li>
    </ul>
</div>-->
<script>

	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
    showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<?php
						$attributes 		=	array('class' => 'form-horizontal');
						//echo form_open('c_customersms/DB_Controller/usersms_settings_model/',$attributes); ?>	
						<form class="form-sample">
							<p class="card-description card-description1 quick">Quick SMS</p>
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
										<label class="col-sm-4 col-form-label">Mobile Number  * </label>
										<div class="col-sm-7" >
											<div class="input-group date" id="datetimepicker1">
												<input class="form-control" type="text" name="fv[serv_group_number]" id="serv_group_number" value="" required minlength="10" maxlength="10" onkeydown="validateKeyPress(event, this,1)"/>
												<span class="help-block">Can send to 10 mobiles at a time, use comma(,) after each no</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
									  <label class="col-sm-4 col-form-label">Text *</label>
										<div class="col-sm-7">
											<textarea class="form-control" required name="fv[serv_group_desc]" id="serv_group_desc" cols="35" rows="5" tabindex="4" maxlength="10"></textarea>
											<span class="help-block">This text will be received, 160 characters allowed. </span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<?php if($userrights["edit"] == 1) { ?>
									<button onclick="sendsms();" type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<?php } else if($userrights["add"] == 1) { ?>
									<button onclick="sendsms();" type="submit" class="btn btn1 btn-success btn-md btn-md1">Send</button>
									<?php } ?>
									<button type="reset" onclick="location.href='<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage'" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button>
								</div>
								<div class="col-md-4">
									
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
