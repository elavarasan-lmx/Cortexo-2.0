<?php
$this->load->view('include/header.php');
$model_name = "rpanelbank_model";
?>
<style>
	#ajax_loader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		display: none;
		justify-content: center;
		align-items: center;
	}

	#ajax_loader.show {
		display: flex;
	}

	.form-control:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
	}

	.form-sample1 {
		margin-bottom: 10px;
	}

	.form-group {
		margin-bottom: 10px;
	}

	.page_footer {
		margin-top: 20px;
		padding: 15px 0;
	}

	.form-text {
		font-size: 11px;
	}

	.typcn-spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}
</style>
<script>
	$(document).ready(function() {

		$("#rpanelbank_form").on("submit", function(e) {
			e.preventDefault();
			let form = $(this);

			// Sequence Number must be greater than 0
			let seqNo = parseInt($("#b_orderno").val(), 10);
			if (isNaN(seqNo) || seqNo <= 0) {
				showToast("Sequence Number must be greater than 0.", 'error');
				$("#b_orderno").focus();
				return false;
			}

			let btn = form.find('button[type="submit"]');
			let btnText = btn.text();
			btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
			$("#ajax_loader").addClass("show");

			$.ajax({
				url: form.attr("action"),
				type: "POST",
				data: form.serialize(),
				dataType: "json",
				success: function(response) {
					$("#ajax_loader").removeClass("show");
					if (response.status === "success") {
						showToast(response.message, 'success');
						setTimeout(function() {
							window.location.href = "<?= base_url('index.php/C_rpanelbank/open_listingform') ?>";
						}, 1000);
					} else {
						btn.prop("disabled", false).text(btnText);
						showToast(response.message || "Failed to save. Please try again.", 'error');
					}
				},
				error: function() {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text(btnText);
					showToast("Server error occurred. Please try again.", 'error');
				}
			});
		});
	});
</script>
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
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> R-Panel Bank Master</h4>
						<?php
						$status = $type;
						$id = $_POST['fv']['bcontract_id'] == NULL ? NULL : $_POST['fv']['bcontract_id'];
						$attributes = array('class' => 'form-horizontal form-sample', 'id' => 'rpanelbank_form', 'name' => 'rpanelbank_form');
						echo form_open('C_rpanelbank/DB_Controller/rpanelbank_model/' . $status . '/' . $id, $attributes);
						?>
						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Bank Symbol*</label>
									<div class="col-sm-7">
										<input type="text" class="form-control" name="fv[bcontract_symbol]" tabindex="1" id="bcontract_symbol" value="<?php echo set_value('bcontract_symbol', $bcontract_symbol); ?>" placeholder="Gold 9999, Gold 999" required maxlength="30" onkeydown="validateKeyPress(event, this,4)" />
										<small class="form-text text-muted">Display name in R-Panel</small>
									</div>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Bank Contract*</label>
									<div class="col-sm-7">
										<select name="fv[bcontract_rate]" id="bcontract_rate" tabindex="2" class="form-control" required>
											<?php echo $this->$model_name->load_bankcontract($bcontract_rate); ?>
										</select>
										<small class="form-text text-muted">Select bank contract</small>
									</div>
								</div>
							</div>
						</div>
						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Convert Value*</label>
									<div class="col-sm-7">
										<input type="text" class="form-control" name="fv[bconvert_value]" tabindex="3" id="bconvert_value" value="<?php echo set_value('bconvert_value', $bconvert_value); ?>" placeholder="32.15072" required onkeydown="validateKeyPress(event, this, 2, 10, 5)" maxlength="10" />
										<small class="form-text text-muted">Conversion value</small>
									</div>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Operator*</label>
									<div class="col-sm-7">
										<select name="fv[bconvert_value_type]" id="bconvert_value_type" tabindex="4" class="form-control" required>
											<option value="1" <?php echo $bconvert_value_type == 1 ? "selected" : ""; ?>>Add (+)</option>
											<option value="2" <?php echo $bconvert_value_type == 2 ? "selected" : ""; ?>>Subtract (-)</option>
											<option value="3" <?php echo $bconvert_value_type == 3 ? "selected" : ""; ?>>Multiply (*)</option>
											<option value="4" <?php echo $bconvert_value_type == 4 ? "selected" : ""; ?>>Divide (/)</option>
										</select>
										<small class="form-text text-muted">Operation with base value</small>
									</div>
								</div>
							</div>
						</div>

						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Extra Charges*</label>
									<div class="col-sm-7">
										<input type="text" class="form-control" name="fv[bextra_charges]" tabindex="5" id="bextra_charges" value="<?php echo set_value('bextra_charges', $bextra_charges); ?>" placeholder="0.00" required onkeydown="validateKeyPress(event, this, 2, 10, 5)" maxlength="10" />
										<small class="form-text text-muted">Additional charges</small>
									</div>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Extra Operator*</label>
									<div class="col-sm-7">
										<select name="fv[bextra_type]" id="bextra_type" tabindex="6" class="form-control" required>
											<option value="1" <?php echo $bextra_type == 1 ? "selected" : ""; ?>>Add (+)</option>
											<option value="2" <?php echo $bextra_type == 2 ? "selected" : ""; ?>>Subtract (-)</option>
											<option value="3" <?php echo $bextra_type == 3 ? "selected" : ""; ?>>Multiply (*)</option>
											<option value="4" <?php echo $bextra_type == 4 ? "selected" : ""; ?>>Divide (/)</option>
										</select>
										<small class="form-text text-muted">Operation with base value</small>
									</div>
								</div>
							</div>
						</div>

						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Sequence Number*</label>
									<div class="col-sm-7">
										<input type="number" class="form-control" name="fv[b_orderno]" tabindex="7" id="b_orderno" value="<?php echo set_value('b_orderno', $b_orderno); ?>" placeholder="1" required min="1" max="99" onkeydown="validateKeyPress(event, this,1)" maxlength="2" />
										<small class="form-text text-muted">Display order (1-99)</small>
									</div>
								</div>
							</div>
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Status*</label>
									<div class="col-sm-7">
										<?php render_radio_group(
											'fv[bcontract_status]',
											[
												1 => ['label' => 'Active', 'id' => 'status_active'],
												0 => ['label' => 'Inactive', 'id' => 'status_inactive']
											],
											$bcontract_status,
											''
										); ?>
										<small class="form-text text-muted">Enable/disable this bank</small>
									</div>
								</div>
							</div>
						</div>
						<div class="row form-sample1">
							<div class="col-md-4"></div>
							<div class="col-md-4 page_footer">
								<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
									<input type="hidden" name="old_rbankcom_name" value="<?= $bcontract_symbol ?>">
									<input type="hidden" name="old_rbankorder_no" value="<?= $b_orderno ?>">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
								<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
								<?php } ?>
								<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="window.location.href='<?php echo $this->config->item('base_url'); ?>index.php/C_rpanelbank/open_listingform'">Cancel</button>
							</div>
							<div class="col-md-4"></div>
						</div>
						<?php echo form_close(); ?>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<?php $this->load->view("include/footer"); ?>