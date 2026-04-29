<?php 
$this->load->view('include/header.php');
$this->load->helper('common');
 ?>
 <script type="text/javascript">
 function sendsms() {
	var title=document.getElementById('event_name').value;
	if(title != "") {
		sendsmsText();
	}
	
	if(title=="") {
		showToast("Name field is Empty",'danger');
	}
}
function sendsmsText() {
	var title	= document.getElementById('event_name').value;
	//alert(mob_no+"   "+description);
		$.ajax({						
		type: "POST",					   		
		url: "<?php echo $this->config->item('base_url'); ?>index.php/C_appevents/create_pushnotification",
		data: "title="+title,
		success: function(data) {console.log(JSON.parse(data));
			data = JSON.parse(data);
			if(data.success == 1) {
				showToast("Notification Send Successfully",'danger');		
			}				
		},
		error: function(request,error) {
			showToast(error,'danger');
		}
	});
}

function cleartext() {
document.getElementById('event_name').value="";
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
</style>
<!--<div>
    <ul class="breadcrumb">
		<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Settings</a></li>
		<li> <a href="#">Gallery Entry</a></li>
    </ul>
</div>-->
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry-->
							<!-- <a href="<?php echo $this->config->item('base_url') ?>index.php/C_appevents/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>  -->
						</h4>
						<?php
							$status				=	$type;
							$id					=	$_POST['fv']['appeven_id']==NULL ? NULL : $_POST['fv']['appeven_id'] ;
							$attributes 		=	array('class' => 'form-horizontal');
							//Opening form
							echo form_open_multipart('C_appevents/DB_Controller/Appevents_model/'.$status.'/'.$id,$attributes); 
						?>
						<form class="form-sample">
							<p class="card-description card-description1">App Events</p>
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
										<label class="col-sm-4 col-form-label">Event Name*</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[event_name]" tabindex="1" id="event_name"  value="<?php echo set_value('event_name',$event_name); ?>" required/>
											<span class="help-block">Enter  the Event name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Event Descriptions*</label>
										<div class="col-sm-7">
											<textarea style="" type="text" class="form-control" name="fv[event_description]" tabindex="1" id="event_description"  value="" required><?php echo set_value('event_description',$event_description); ?></textarea>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">

										<?php render_radio_group(
												'fv[event_status]',
												[
													1 => ['label' => 'Yes', 'id' => 'event_status'],
													0 => ['label' => 'No', 'id' => 'gal_statusoff']
												],
												$event_status,
												'To enable/disable Events.'
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
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<button type="reset" class="btn btn1 btn-danger  btn-md btn-md2" onclick="location.href = '<?php echo $this->config->item('base_url'); ?>index.php/C_appevents/open_listingform'">Cancel</button>
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
