<?php $this->load->view('include/header.php'); ?>
<script type="text/javascript">
function move_field(){
	sms_url=document.getElementById("sas_url");
	selected_field=document.getElementById("field_list").value;	
	sms_url.value=sms_url.value+selected_field;
	sms_url.focus();
}	
function insertValueQuery() {
    var url_field = document.getElementById("sas_url");
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
</style>
<!--<div>
    <ul class="breadcrumb">
        <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Settings</a></li>
		<li><a href="#">SMS API Settings Entry</a></li>
    </ul>
</div>-->
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry--><a href="<?php echo $this->config->item('base_url') ?>index.php/C_sms_api/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<?php
										$status			=	$type;
										$id				=	$_POST['fv']['sas_id']==NULL ? NULL : $_POST['fv']['sas_id'] ;
										$attributes 	=	array('class' => 'form-horizontal');
										//Opening form
										echo form_open('C_sms_api/DB_Controller/smsapi_model/'.$status.'/'.$id,$attributes); 
									?>
						<form class="form-sample">
							<p class="card-description card-description1">SMS API Settings</p>
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
										<label class="col-sm-4 col-form-label">Description*</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[sas_desc]" tabindex="1" id="sas_desc" value="<?php echo set_value('sas_desc',$sas_desc); ?>" placeholder="" onkeydown="validateKeyPress(event, this,12)" maxlength="50" minlength="3" required/>
											<span class="help-block">Enter the description.</span>		
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
									  
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">SMS URL *</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<textarea required style="width: 405px;"  class="form-control" rows="5"  name="fv[sas_url]" tabindex="2" id="sas_url"  maxlength="200"><?php echo set_value('sas_url',$sas_url);?></textarea>
												<span class="help-block">Enter or choose the sms url.</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-sm-1">
									<div class="btn-group" data-toggle="buttons">
										<label  onclick="insertValueQuery()" class="btn btn-primary">
											<a style="color:#0d6efd; text-decoration:none"  id="move_button" name="move_button" ><<</a>
										</label>  
										</div>
								</div>
								<div class="col-md-5">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label"></label>
										<div class="col-sm-7">
											<div class="form-group row">
												<select size="6" rows="5" id="field_list" class="form-control" style="height:137px" name="field_list">
													<option value="@@authkey@@">authkey</option>
													<option value="@@mobileno@@">Mobile No</option>
													<option value="@@message@@">Message</option>
													<option value="@@sender_id@@">Sender ID</option>
												</select>
											  <span class="help-block">Select  the sms url.</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1" style="margin-bottom: 20px;">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if($status == "edit" && $userrights["edit"] == 1) { ?>
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } else if($status == "add_new" && $userrights["add"] == 1) { ?>
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
