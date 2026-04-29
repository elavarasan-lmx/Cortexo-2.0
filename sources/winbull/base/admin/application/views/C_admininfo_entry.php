<?php
$this->load->view('include/header.php');
$this->load->helper('common');

?>
<script type="text/javascript">
	function blockSpecialChar(e) {
		var k;
		document.all ? k = e.keyCode : k = e.which;
		return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 44 && k <= 57));
	}
</script>
<style>
	.footer {
		padding: 0px 10px
	}

	.EnableDisableComm {
		display: none;
	}

	.com-barQuantities {
		padding: 0px;
	}

	.table {
		margin-bottom: 0px !important;
	}
</style>
<!--<div>
    <ul class="breadcrumb">
		<li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li> <a href="#">Settings</a></li>
		<li> <a href="#">Text Entry</a></li>
    </ul>
</div>-->
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry-->
							<!-- <a href="<?php echo $this->config->item('base_url') ?>index.php/C_admininfo/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>  -->
						</h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['ai_sno'] == NULL ? NULL : $_POST['fv']['ai_sno'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm');
						//Opening form
						echo form_open('C_admininfo/DB_Controller/C_admininfo_model/' . $status . '/' . $id, $attributes); ?>
						<div class="form-sample">
							<p class="card-description card-description3">Admin Information</p>
							<?php
							if (isset($db_error_msg) && $db_error_msg != '') {
								echo '<div class="alert alert-danger">
											<a href="#" class="close" data-dismiss="alert">&times;</a>
											<strong>Warning!</strong> ' . $db_error_msg . '
											</div>';
							}

							?>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Text*</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[ai_text]" tabindex="1" id="ai_text" value="<?php echo set_value('ai_text', $ai_text); ?>" required maxlength="100" onkeydown="validateKeyPress(event, this,8)" minlength="5" data-no-numbers-only />
											<!-- onkeypress="return blockSpecialChar(event)" maxlength="100" onkeydown="validateKeyPress(event, this,5)" -->
											<span class="help-block">Enter the text.</span>
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
												'fv[ai_active]',
												[
													1 => ['label' => 'Yes', 'id' => 'ai_active_yes'],
													0 => ['label' => 'No', 'id' => 'ai_active_no']
												],
												$ai_active,
												'To enable/disable text.'
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
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } ?>
									<button type="reset" onclick="location.href = '<?php echo $this->config->item('base_url'); ?>index.php/C_admininfo/open_listingform'" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button>
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