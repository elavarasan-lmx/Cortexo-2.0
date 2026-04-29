<?php $this->load->view("include/header"); ?>

<style>
.footer{padding:0px 10px}
.table {margin-bottom:0px !important;}
</style>
<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry--><a href="<?php echo $this->config->item('base_url') ?>index.php/C_hedgemaster/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<script>
							function validate(e) {
								if (!validateForm(e, document.getElementById('iframeForm'))) {
									return false;
								}
								return true;
							}
						</script>

						<?php
						$cur_status				=	$type;
						$id					=	$_POST['fv']['hm_id']==NULL ? NULL : $_POST['fv']['hm_id'] ;
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm', 'onsubmit' => 'return validate(event)');
						//Opening form
						echo form_open_multipart('C_hedgemaster/DB_Controller/hedgemaster_model/'.$cur_status.'/'.$id,$attributes); ?>
						<div class="form-sample">
							<p class="card-description card-description1">Hedge Details</p>
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
										<label class="col-sm-4 col-form-label">From quantity *</label>
										<div class="col-sm-7">
											<input  type="text" name="fv[hm_fromslots]" id="hm_fromslots" class="form-control "  placeholder=""  value="<?php echo set_value('hm_fromslots',$hm_fromslots); ?>" maxlength="10" minlength="1" required onkeydown="validateKeyPress(event, this, 1)" />
											<span class="help-block">Enter from quantity (Max 10 chars).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">To quantity *</label>
										<div class="col-sm-7">
											<input  type="text" name="fv[hm_toslots]" id="hm_toslots" class="form-control "  placeholder=""  value="<?php echo set_value('hm_toslots',$hm_toslots); ?>" maxlength="10" minlength="1" required onkeydown="validateKeyPress(event, this, 1)" />
											<span class="help-block">Enter to quantity (Max 10 chars).</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Metal Name</label>
										<div class="col-sm-7">
											<select name="fv[hm_commodity]" id="hm_commodity"  class="form-control" >
												<option value="0" <?php echo $hm_commodity==0?"selected=selected":""; ?> >GOLD</option>
												<option value="1" <?php echo $hm_commodity==1?"selected=selected":""; ?> >SILVER</option>
											</select>
											<span class="help-block">Select metal name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Category*</label>
										<div class="col-sm-7">
											<select name="fv[hm_com_type]" id="hm_com_type"  class="form-control" >
												<option value="0" <?php echo $hm_com_type==0?"selected=selected":""; ?> >MEGA</option>
												<option value="1" <?php echo $hm_com_type==1?"selected=selected":""; ?> >MINI</option>
												<option value="2" <?php echo $hm_com_type==2?"selected=selected":""; ?> >MICRO</option>
											</select>
											<span class="help-block">Select category.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Hedge Type</label>
										<div class="col-sm-7">
											<select name="fv[hm_hedgetype]" id="hm_hedgetype"  class="form-control" >
												<option value="0" <?php echo $hm_hedgetype==0?"selected=selected":""; ?> >Hedge</option>
												<option value="1" <?php echo $hm_hedgetype==1?"selected=selected":""; ?> >Mothilal Oswal</option>
											</select>
											<span class="help-block">Select hedge type.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Hedge symbol*</label>
										<div class="col-sm-7">
											<input  type="text"  name="fv[hm_hedgesymbol]" id="hm_hedgesymbol" class="form-control "  placeholder=""  value="<?php echo set_value('hm_hedgesymbol',$hm_hedgesymbol); ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="50" minlength="2" required data-no-spaces />
											<span class="help-block">Enter hedge symbol (2-50 chars).</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Is hedge roundoff</label>
										<div class="col-sm-7">
											<select name="fv[hm_roundoff_enabled]" id="hm_roundoff_enabled"  class="form-control" >
												<option value="1" <?php echo $hm_roundoff_enabled==1?"selected=selected":""; ?> >Active</option>
												<option value="0" <?php echo $hm_roundoff_enabled==0?"selected=selected":""; ?> >In active</option>
											</select>
											<span class="help-block">Select roundoff enabled or not.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">  
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Hedge roundoff*</label>
										<div class="col-sm-7">
											<input  type="text"  name="fv[hm_roundoff]" id="hm_roundoff" class="form-control "  placeholder=""  value="<?php echo set_value('hm_roundoff',$hm_roundoff); ?>" onkeydown="validateKeyPress(event, this,1)" maxlength="5" minlength="1" required />
											<span class="help-block">Enter hedge roundoff (Max 50 chars).</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">API Call</label>
										<div class="col-sm-7">
											<input  type="text" name="fv[hm_apiurl]" id="hm_apiurl"  placeholder="https://api.example.com"  class="form-control " value="<?php echo set_value('hm_apiurl',$hm_apiurl); ?>" maxlength="255" onkeydown="validateKeyPress(event, this, 10)" data-no-spaces data-is-url />
											<span class="help-block">Enter hedge API call link.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Hedge enable</label>
										<!-- <div class="col-sm-7">
											<div class="btn-group" data-toggle="buttons">
												<label class="btn btn-primary business">
													<input type="radio" name="fv[hm_hedgeonoff]" id="hm_hedgeonoff_yes" value="1" <?php if($hm_hedgeonoff==1) {?> checked="checked" <?php } ?> >Yes
												</label>
												<label class="btn btn-primary business">
													<input type="radio" name="fv[hm_hedgeonoff]" id="hm_hedgeonoff_no" value="0" <?php if($hm_hedgeonoff==0) {?> checked="checked" <?php } ?>>No
												</label>
											</div>
											<span class="help-block">Hedge enable/disable.</span>
										</div> -->
										<div class="col-sm-7">
											<?php render_radio_group(
													'fv[hm_hedgestatus]',
													[
														1 => ['label' => 'Yes', 'id' => 'hm_hedgestatus'],
														0 => ['label' => 'No', 'id' => 'hm_hedgestatus']
													],
													$hm_hedgestatus,
													'Hedge enable/disable.'
												); ?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1" style="margin-top:30px;">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if ($cur_status == "edit" && $userrights["edit"] == 1) { ?>
										<button type="submit" onclick="validate(event)" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<?php } else if ($cur_status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" onclick="validate(event)" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } ?>
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">
									
								</div>
							</div>
						</div>
						<?php echo form_close(); ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<?php $this->load->view("include/footer"); ?>
