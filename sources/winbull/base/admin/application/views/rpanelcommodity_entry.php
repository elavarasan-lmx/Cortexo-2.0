<?php
$this->load->view('include/header.php');
$model_name = "rpanelcommodity_model";
?>
<script type="text/javascript">
	function preventDotAndSpace(event) {
		var key = event.keyCode || event.which;
		if (key === 32 || key === 46) { // 32 is space, 46 is dot
			return false;
		}
		return true;
	}

	function removeDotsAndSpaces(event) {
		let clipboardData = (event.clipboardData || window.clipboardData).getData('text');
		if (clipboardData.includes('.') || clipboardData.includes(' ')) {
			event.preventDefault();
			clipboardData = clipboardData.replace(/[. ]/g, ''); // Remove all dots and spaces from the pasted text
			document.execCommand('insertText', false, clipboardData);
		}
	}

	const SITE_URL = "<?= site_url(); ?>";
	$(document).ready(function() {

		$("#ajax_loader").addClass("show");

		// Hide loader after AJAX completes
		$("#ajax_loader").removeClass("show");

		// AJAX form submit
		$("#RpanelCommodityEntryForm").on("submit", function(e) {
			e.preventDefault();

			let form = $(this);

			// Sell TCS % and Buy TCS % must not exceed 100, max 2 decimals
			let sellTcs = parseFloat($("#rcom_sell_tcs").val());
			let buyTcs = parseFloat($("#rcom_buy_tcs").val());
			if (!isNaN(sellTcs) && sellTcs > 100) {
				showToast("Sell TCS % cannot exceed 100.", 'error');
				$("#rcom_sell_tcs").focus();
				return false;
			}
			if (!isNaN(buyTcs) && buyTcs > 100) {
				showToast("Buy TCS % cannot exceed 100.", 'error');
				$("#rcom_buy_tcs").focus();
				return false;
			}

			// Sequence Number must be greater than 0
			let seqNo = parseInt($("#rcom_orderno").val(), 10);
			if (isNaN(seqNo) || seqNo <= 0) {
				showToast("Sequence Number must be greater than 0.", 'error');
				$("#rcom_orderno").focus();
				return false;
			}

			let btn = form.find('button[type="submit"]');
			btn.prop("disabled", true).text("Saving...");
			$("#ajax_loader").addClass("show");

			$.ajax({
				url: form.attr("action"),
				type: "POST",
				data: form.serialize(),
				dataType: "json",
				success: function(response) {

					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Save");

					if (response.status === "success") {
						window.location.href = SITE_URL + "/C_rpanelcommodity/open_listingform";
					} else {
						showToast(response.message || "Failed to save settings. Please try again.", 'danger');
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Save");
					showToast("Server error: " + error, 'danger');
				}
			});

		});

	});
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
</style>

<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title" data-original-title=""><!--<a href="<?php echo $this->config->item('base_url'); ?>index.php/C_rpanelcommodity/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>--> </h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['rcom_id'] == NULL ? NULL : $_POST['fv']['rcom_id'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'RpanelCommodityEntryForm', 'name' => 'RpanelCommodityEntryForm', 'method' => 'post', 'autocomplete' => 'off');
						//Opening form
						echo form_open('C_rpanelcommodity/DB_Controller/rpanelcommodity_model/' . $status . '/' . $id, $attributes);
						?>
						<form class="form-sample">
							<p class="card-description card-description1"> R-Panel Commodity Type</p>
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
										<label class="col-sm-4 col-form-label">Display Name (*) </label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[rcom_disname]" tabindex="1" id="rcom_disname" value="<?php echo set_value('rcom_disname', $rcom_disname); ?>" placeholder="Gold-1 , Gold-2" required maxlength="50" onkeydown="validateKeyPress(event, this, 7)" />
											<span class="help-block">Name of the item to be displayed in rpanel page</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Commodity Type</label>
										<div class="col-sm-7">

											<?php render_radio_group(
												'fv[rcom_comtype]',
												[
													0 => ['label' => 'Gold', 'id' => 'com_type_gold'],
													1 => ['label' => 'Silver', 'id' => 'com_active_no']
												],
												$rcom_comtype
											); ?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">MCX Symbol (*)</label>
										<div class="col-sm-7">
											<select name="fv[rcom_mcxsymbol]" id="rcom_mcxsymbol" tabindex="2" class="form-control">
												<?php echo $this->$model_name->load_mcxcontract($rcom_mcxsymbol); ?>
											</select>
											<span class="help-block">MCX contract name</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Bank Symbol (*)</label>
										<div class="col-sm-7">
											<select name="fv[rcom_banksymbol]" id="rcom_banksymbol" tabindex="2" class="form-control">
												<?php echo $this->$model_name->load_bankcontract($rcom_banksymbol); ?>
											</select>
											<span class="help-block">This item will be categorized under this group</span>
										</div>
									</div>
								</div>
							</div>


							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Sell Tax % (*)</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[rcom_sell_tax]" tabindex="6" id="rcom_sell_tax" value="<?php echo set_value('rcom_sell_tax', $rcom_sell_tax); ?>" placeholder="" required onkeydown="validateKeyPress(event, this, 2, 6, 2)" max="100" />
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Buy Tax % (*)</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[rcom_buy_tax]" tabindex="6" id="rcom_buy_tax" value="<?php echo set_value('rcom_buy_tax', $rcom_buy_tax); ?>" placeholder="" required onkeydown="validateKeyPress(event, this, 2, 6, 2)" max="100" />
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Sell TCS % (*)</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[rcom_sell_tcs]" tabindex="6" id="rcom_sell_tcs" value="<?php echo set_value('rcom_sell_tcs', $rcom_sell_tcs); ?>" placeholder="" step="0.01" required onkeydown="validateKeyPress(event, this, 2, 6, 2)" max="100" />
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Buy TCS % (*)</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[rcom_buy_tcs]" tabindex="6" id="rcom_buy_tcs" value="<?php echo set_value('rcom_buy_tcs', $rcom_buy_tcs); ?>" placeholder="" step="0.01" required onkeydown="validateKeyPress(event, this, 2, 6, 2)" max="100" />
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Sequence Number (*)</label>
										<div class="col-sm-7">
											<input type="number" class="form-control" name="fv[rcom_orderno]" tabindex="6" id="rcom_orderno" value="<?php echo set_value('rcom_orderno', $rcom_orderno); ?>" placeholder="1" required min="1" max="99" onkeydown="validateKeyPress(event, this,1)" maxlength="2" />
											<!-- <input type="text" class="form-control" name="fv[rcom_orderno]" tabindex="6" id="rcom_orderno" value="<?php echo set_value('rcom_orderno', $rcom_orderno); ?>" placeholder="" required onkeyup="validateInput(this)" onpaste="return false;" onkeydown="validateKeyPress(event, this)"/> -->
										</div>
									</div>
								</div>

								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[rcom_status]',
												[
													1 => ['label' => 'Yes', 'id' => 'com_active_yes'],
													0 => ['label' => 'No', 'id' => 'com_active_noo']
												],
												$rcom_status,
												'Enable/disable this commodity'
											); ?>
										</div>
									</div>
								</div>
								<!-- <div class="col-md-6" style="display:none;">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Contract Name *</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[rcom_contname]" tabindex="1" id="rcom_contname" value="<?php echo set_value('rcom_contname', $rcom_contname); ?>" placeholder="Gold, Silver"  maxlength="30" onkeypress="return RestrictSpace()" />
											<span class="help-block">Name of the contract to be displayed in user page</span>
										</div>
									</div>
								</div> -->
							</div>
							<div class="row form-sample1" style="display:none;">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Contract active</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[rcom_contdisplay]',
												[
													1 => ['label' => 'Yes', 'id' => 'com_contdisplay_yes'],
													0 => ['label' => 'No', 'id' => 'com_contdisplay_no']
												],
												$rcom_contdisplay,
												'Enable/disable this contract in user page'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6" style="display:none;">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Contract Name *</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[rcom_contname]" tabindex="1" id="rcom_contname" value="<?php echo set_value('rcom_contname', $rcom_contname); ?>" placeholder="Gold, Silver" maxlength="30" onkeypress="return RestrictSpace()" />
											<span class="help-block">Name of the contract to be displayed in user page</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<input type="hidden" name="old_rcom_name" id="old_rcom_name" value="<?= $rcom_disname ?>">
										<input type="hidden" name="old_rcomorder_no" id="old_rcomorder_no" value="<?= $rcom_orderno ?>">
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } ?>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
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