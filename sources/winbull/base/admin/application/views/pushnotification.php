<?php 
	$this->load->view('include/header.php');
?>
<script type="text/javascript">
function sendsms() {
	var title=document.getElementById('heading').value;
	var desc=document.getElementById('message').value;
	var desc_length=document.getElementById('message').value.length;
	if(desc != "" && title != "") {
		sendsmsText();
	}
	
	if(desc=="") {
		showToast("Message field is Empty",'danger');
	} else if(title == ""){
		showToast("Title field is Empty",'danger');
	}
}
function sendsmsText() {
	var description	= document.getElementById('message').value;
	var title	= document.getElementById('heading').value;
	//alert(mob_no+"   "+description);
		$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_customersms/create_pushnotification",
		data: "title="+title+"&message="+description,
		success: function(data) {console.log(JSON.parse(data));
			data = JSON.parse(data);
			if(data.success == 1) {
				showToast("Notification Send Successfully",'success');		
			}				
		},
		error: function(request,error) {
			showToast("OOPS! Something error",'danger');
		}
	});
}

function cleartext() {
document.getElementById('message').value="";
document.getElementById('heading').value="";
}
	</script>
<style>
.footer{padding:0px 10px}
</style>

<!--<div>
    <ul class="breadcrumb">
		<li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
                <a href="#">SMS/Email/Notification</a>
		</li>
		<li>
                <a href="#">Push Notification</a>
        </li>
    </ul>
</div>-->

<div class="col-12 grid-margin">
	<div class="card">
		<div class="card-body">
			
			<?php
			$attributes 		=	array('class' => 'form-horizontal');
			echo form_open_multipart('c_customersms/create_pushnotification/',$attributes); ?>	
			<form class="form-sample">
				<p class="card-description card-description2"> Notification</p>
				<?php 
					if(isset($db_error_msg) && $db_error_msg != '')
					{
						echo '<div class="alert alert-danger">
								<a href="#" class="close" data-dismiss="alert">&times;</a>
								<strong>Warning!</strong> '.$db_error_msg.'
								</div>';
					}

					if($this->session->flashdata('message_notification'))
					{
						echo '<div class="alert alert-success">
								<a href="#" class="close" data-dismiss="alert">&times;</a>
								<strong>Message! </strong> '.$this->session->flashdata("message_notification").'
								</div>';
					}
				
				?>
				<div class="row form-sample1">
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label">Title * </label>
							<div class="col-sm-7" >
								<input class="form-control" type="text" name="notification_heading" id="heading" value="" required onkeydown="validateKeyPress(event, this,4)" maxlength="50"/>
								<span class="help-block">Title of the notification</span>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						
					</div>
				</div>
				<div class="row form-sample1">
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label">Message *</label>
							<div class="col-sm-7" >
								<textarea class="form-control" required name="notification_message" id="message" cols="35" rows="5" tabindex="4" onkeydown="validateKeyPress(event, this,4)" maxlength="50"></textarea>
								<span class="help-block">Notification Message</span>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group row" style="display:none;">
							<label class="col-sm-4 col-form-label">Notification Image *</label>
							<div class="col-sm-7" >
								<input type="file" name="notification_image" id="notification_image"  />
								<span class="help-block">Choose the notification image.</span>
							</div>
						</div>
					</div>
				</div>
				<div class="row form-sample1">
					<div class="col-md-3"></div>
					<div class="col-md-6">
						<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
						<button type="reset" onclick="location.href='<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage'" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button>
					</div>
					<div class="col-md-6">
						
					</div>
				</div>
			</form>
		</div>
	</div>
</div>


<?php $this->load->view("include/footer"); ?>
