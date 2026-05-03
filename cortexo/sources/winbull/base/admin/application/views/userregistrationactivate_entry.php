<?php
$this->load->view("include/header");
$this->load->helper('common');
$this->load->view('common/confirm_modal.php'); // BZ: Shared confirmation modal
$controller_name = 	"C_userregistration";
$model_name		 = 	"Userregistration_model";
?>
<style type="text/css">
	#commodity_activity tr td,
	#commodity_activity tr th {
		text-align: center;
	}

	.form-check-label {
		margin-bottom: 16px;
	}
</style>
<script type="text/javascript">
	$(function() {
		$('#datetimepicker1').datetimepicker({
			pickTime: false,
			minDate: moment().startOf('day')
		});

		// Re-enforce validation on change or clear
		$('#cus_valid_till').on('blur change', function() {
			var isLifeTime = $('#cus_is_life_time').is(':checked');
			if (!isLifeTime) {
				var val = $(this).val();
				if (val.trim() === "") {
					// Let validateForm handle requiredness
				} else {
					var selectedDate = moment(val, "DD-MM-YYYY");
					var today = moment().startOf('day');
					if (selectedDate.isBefore(today)) {
						showToast("Valid till date cannot be in the past", "warning");
						$(this).val(today.format("DD-MM-YYYY")).trigger('change');
					}
				}
			}
		});
		$('#iframeForm').on('submit', function(e) {
			e.preventDefault();
			let form = this;

			// 1. Standard Validation
			if (!validateForm(e, form)) {
				return false;
			}

			// 2. Validate Gold Min/Max Qty
			const goldMinQtyEnabled = $('#has_gminqty').is(':checked');
			const goldMaxQtyEnabled = $('#has_gmaxqty').is(':checked');

			if (goldMinQtyEnabled && goldMaxQtyEnabled) {
				const goldMinQty = parseFloat($('#gold_min_qty').val()) || 0;
				const goldMaxQty = parseFloat($('#gold_max_qty').val()) || 0;

				if (goldMinQty < 1) {
					showToast('Gold Min Qty / Book must be at least 1', 'danger');
					$('#gold_min_qty').focus();
					return false;
				}

				if (goldMaxQty < 1) {
					showToast('Gold Max Qty / Book must be at least 1', 'danger');
					$('#gold_max_qty').focus();
					return false;
				}

				if (goldMinQty >= goldMaxQty) {
					showToast('Gold Min Qty / Book must be less than Gold Max Qty / Book', 'danger');
					$('#gold_min_qty').focus();
					return false;
				}
			}

			// 3. Validate Silver Min/Max Qty
			const silverMinQtyEnabled = $('#has_sminqty').is(':checked');
			const silverMaxQtyEnabled = $('#has_smaxqty').is(':checked');

			if (silverMinQtyEnabled && silverMaxQtyEnabled) {
				const silverMinQty = parseFloat($('#silver_min_qty').val()) || 0;
				const silverMaxQty = parseFloat($('#silver_max_qty').val()) || 0;

				if (silverMinQty < 1) {
					showToast('Silver Min Qty / Book must be at least 1', 'danger');
					$('#silver_min_qty').focus();
					return false;
				}

				if (silverMaxQty < 1) {
					showToast('Silver Max Qty / Book must be at least 1', 'danger');
					$('#silver_max_qty').focus();
					return false;
				}

				if (silverMinQty >= silverMaxQty) {
					showToast('Silver Min Qty / Book must be less than Silver Max Qty / Book', 'danger');
					$('#silver_min_qty').focus();
					return false;
				}
			}

			// 4. Validate Gold Max Alloted Qty vs Max Qty
			const goldAllotQtyEnabled = $('#has_gallot_qty').is(':checked');

			if (goldAllotQtyEnabled) {
				const goldAllotQty = parseFloat($('#gold_allot_qty').val()) || 0;

				if (goldAllotQty < 1) {
					showToast('Gold Max Alloted Qty must be at least 1', 'danger');
					$('#gold_allot_qty').focus();
					return false;
				}

				// Max Allot must be >= Max Qty/Book
				if (goldMaxQtyEnabled) {
					const goldMaxQtyVal = parseFloat($('#gold_max_qty').val()) || 0;
					if (goldAllotQty < goldMaxQtyVal) {
						showToast('Gold Max Alloted Qty must be greater than or equal to Gold Max Qty / Book', 'danger');
						$('#gold_allot_qty').focus();
						return false;
					}
				}
			}

			// 5. Validate Silver Max Alloted Qty vs Max Qty
			const silverAllotQtyEnabled = $('#has_sallot_qty').is(':checked');

			if (silverAllotQtyEnabled) {
				const silverAllotQty = parseFloat($('#silver_allot_qty').val()) || 0;

				if (silverAllotQty < 1) {
					showToast('Silver Max Alloted Qty must be at least 1', 'danger');
					$('#silver_allot_qty').focus();
					return false;
				}

				// Max Allot must be >= Max Qty/Book
				if (silverMaxQtyEnabled) {
					const silverMaxQtyVal = parseFloat($('#silver_max_qty').val()) || 0;
					if (silverAllotQty < silverMaxQtyVal) {
						showToast('Silver Max Alloted Qty must be greater than or equal to Silver Max Qty / Book', 'danger');
						$('#silver_allot_qty').focus();
						return false;
					}
				}
			}

			// ─── BZ: Limit Order Guard — pre-check before submit ───
			if (!$(form).data('limit_confirmed')) {
				let formData = new FormData(form);
				formData.append('cus_id', $('#cus_id').val());

				$.ajax({
					url: base_url + "index.php/C_userregistration/check_customer_limits",
					type: "POST",
					data: formData,
					processData: false,
					contentType: false,
					dataType: "json",
					success: function(response) {
						if (response.has_limits === true) {
							showConfirmModal(
								'⚠️ Active Limit Orders Found',
								response.message,
								function() {
									$(form).data('limit_confirmed', true);
									$(form).trigger('submit');
								}
							);
						} else {
							$(form).data('limit_confirmed', true);
							$(form).trigger('submit');
						}
					},
					error: function() {
						// If check fails, proceed anyway
						$(form).data('limit_confirmed', true);
						$(form).trigger('submit');
					}
				});
				return false;
			}
			// Reset flag for next submission
			$(form).data('limit_confirmed', false);

			let btn = $(form).find('button[type="submit"]');
			let formData = new FormData(form);

			btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
			$("#ajax_loader").addClass("show");

			$.ajax({
				url: $(form).attr("action"),
				type: "POST",
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				},
				data: formData,
				processData: false,
				contentType: false,
				dataType: "json",
				success: function(response) {
					$("#ajax_loader").removeClass("show");

					if (response.status === "success") {
						showToast(response.message, 'success');
						setTimeout(function() {
							window.location.href = response.redirect;
						}, 1000);
					} else {
						btn.prop("disabled", false).text("Update");
						showToast(response.message, 'danger');
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Update");
					showToast("Server error: " + error, 'danger');
				}
			});
		});
		$('input[type=checkbox][name="fv[has_gminqty]"], input[type=checkbox][name="fv[has_sminqty]"], input[type=checkbox][name="fv[has_gmaxqty]"], input[type=checkbox][name="fv[has_smaxqty]"], input[type=checkbox][name="fv[has_gallot_qty]"], input[type=checkbox][name="fv[has_sallot_qty]"] ').change(function() {
			change_qtystatus();
		});
		change_qtystatus();
		change_periodstatus();
	});

	function change_periodstatus() {
		if (document.getElementById('cus_is_life_time').checked == true) {
			document.getElementById('valid_till_container').style.display = 'none';
			document.getElementById('cus_valid_till').required = false;
		} else {
			document.getElementById('valid_till_container').style.display = 'block';
			document.getElementById('cus_valid_till').required = true;
		}
	}

	function check_All() {
		if (arguments[0].id == 'checkAll_buy') {
			$('.cus_com_status_buy').prop('checked', arguments[0].checked);
		} else if (arguments[0].id == 'checkAll_sell') {
			$('.cus_com_status_sell').prop('checked', arguments[0].checked);
		} else {
			$('.cus_com_amountpurch').prop('checked', arguments[0].checked);
		}
	}

	function check_numeric() {
		if (isNaN(arguments[0].value)) {
			arguments[0].value = '';
			showToast('Please Enter Only Numbers', 'danger');
		}
	}

	function change_qtystatus() {
		if ($("#has_gminqty").is(":checked")) {
			$("#gold_min_qty").prop("readonly", false);
		} else {
			$("#gold_min_qty").prop("readonly", true);
		}

		if ($("#has_sminqty").is(":checked")) {
			$("#silver_min_qty").prop("readonly", false);
		} else {
			$("#silver_min_qty").prop("readonly", true);
		}

		if ($("#has_gmaxqty").is(":checked")) {
			$("#gold_max_qty").prop("readonly", false);
		} else {
			$("#gold_max_qty").prop("readonly", true);
		}

		if ($("#has_smaxqty").is(":checked")) {
			$("#silver_max_qty").prop("readonly", false);
		} else {
			$("#silver_max_qty").prop("readonly", true);
		}

		if ($("#has_gallot_qty").is(":checked")) {
			$("#gold_allot_qty").prop("readonly", false);
		} else {
			$("#gold_allot_qty").prop("readonly", true);
		}

		if ($("#has_sallot_qty").is(":checked")) {
			$("#silver_allot_qty").prop("readonly", false);
		} else {
			$("#silver_allot_qty").prop("readonly", true);
		}
	}
</script>
<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>
<!--<div>
    <ul class="breadcrumb">
		<li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
            <a href="#">Account Activation</a>
		</li>
    </ul>
</div>-->
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry<a href="<?php echo $this->config->item('base_url') ?>index.php/C_userregistration/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>--> </h4>
						<?php
						$status				=	'edit';
						$id					=	$cus_id == NULL ? NULL : $cus_id;
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm', 'novalidate' => 'novalidate');
						//$attributes 		=	array('id' => 'iframeForm', 'name' => 'iframeForm');


						//Opening form
						echo form_open($controller_name . '/DB_Controller/' . $model_name . '/activate/' . $id, $attributes);
						//$margin_type = $this->$model_name->get_margintype();

						//$disable_field = $this->$model_name->check_update_status($id) == 0 ? "" : "disabled='disabled'";
						?>
						<form class="form-sample">
							<p class="card-description card-description1"> Trader Account Activation</p>
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
										<label class="col-sm-4 col-form-label">Trader ID</label>
										<div class="col-sm-7">
											<input type="text" id="cus_id_display" class="form-control" value="<?php echo $cus_id  ?>" disabled />
											<input type="hidden" name="fv[cus_id]" id="cus_id" value="<?php echo set_value('cus_id', $cus_id); ?>" />
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Trader Name</label>
										<div class="col-sm-7">
											<input type="text" id="cus_name_display" class="form-control" value="<?php echo $cus_name  ?>" disabled />
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Life time validity </label>
										<div class="col-sm-7">
											<input type="checkbox" name="fv[cus_is_life_time]" id="cus_is_life_time" value="1" <?php if ($cus_is_life_time == 1) { ?> checked="checked" <?php } ?> onchange="change_periodstatus();" />
											<span class="help-block">Enables life time validity for this account</span>
										</div>
									</div>
								</div>
								<div class="col-md-6" id="valid_till_container">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Valid till</label>
										<div class="col-sm-7">
											<div class='input-group date' id='datetimepicker1'>
												<input data-date-format="DD-MM-YYYY" type="text" class="form-control" name="fv[cus_valid_till]" id="cus_valid_till" size="20" value="<?php echo set_value('cus_valid_till', $cus_valid_till); ?>" readonly required />
												<span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>

											</div>
											<span class="help-block">Account expires on this date</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">

											<?php render_radio_group(
												'fv[cus_active]',
												[
													1 => ['label' => 'Yes', 'id' => 'active_yes'],
													0 => ['label' => 'No', 'id' => 'active_no']
												],
												$cus_active,
												'To enable/disable trading account.'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Limit Enable</label>
										<div class="col-sm-7">

											<?php render_radio_group(
												'fv[cus_limitenable]',
												[
													1 => ['label' => 'Yes', 'id' => 'limit_enable'],
													0 => ['label' => 'No', 'id' => 'limit_disable']
												],
												$cus_limitenable,
												'Limit enable/disable.'
											); ?>

										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1" style="display:none;">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="control-label col-sm-4"></label>
										<span class="col-sm-7">
										</span>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="control-label col-sm-4" style="display:none">Opening Balance</label>
										<div class="col-sm-7" style="display:none">
											<input type="number" class="form-control" name="fv[opening_balance]" id="opening_balance" value="<?php echo set_value('opening_balance', $opening_balance); ?>" />
											<span class="help-block">Enter opening balance of trader.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gold Min Qty / Book </label>
										<div class="col-sm-7">
											<?php render_checkbox_input(
												'has_gminqty',
												'gold_min_qty',
												$has_gminqty ?? 0,
												$gold_min_qty ?? '',
												'Enter minimum qty per booking for gold commodities (in gms)'
											);
											?>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Silver Min Qty / Book</label>
										<div class="col-sm-7">
											<?php render_checkbox_input(
												'has_sminqty',
												'silver_min_qty',
												$has_sminqty ?? 0,
												$silver_min_qty ?? '',
												'Enter minimum qty per booking for silver commodities (in gms)'
											);
											?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gold Max Qty / Book </label>
										<div class="col-sm-7">
											<?php render_checkbox_input(
												'has_gmaxqty',
												'gold_max_qty',
												$has_gmaxqty ?? 0,
												$gold_max_qty ?? '',
												'Enter maximum qty per booking for gold commodities (in gms)'
											);
											?>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Silver Max Qty / Book</label>
										<div class="col-sm-7">
											<?php render_checkbox_input(
												'has_smaxqty',
												'silver_max_qty',
												$has_smaxqty ?? 0,
												$silver_max_qty ?? '',
												'Enter maximum qty per booking for silver commodities (in gms)'
											);
											?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gold Max Alloted Qty</label>
										<div class="col-sm-7">
											<?php render_checkbox_input(
												'has_gallot_qty',
												'gold_allot_qty',
												$has_gallot_qty ?? 0,
												$gold_allot_qty ?? '',
												'Enter maximum alloted qty for gold commodities (in gms)'
											);
											?>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Silver Max Alloted Qty</label>
										<div class="col-sm-7">
											<?php render_checkbox_input(
												'has_sallot_qty',
												'silver_allot_qty',
												$has_sallot_qty ?? 0,
												$silver_allot_qty ?? '',
												'Enter maximum alloted qty for silver commodities (in gms)'
											);
											?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label"></label>
										<div class="col-sm-7">
											<input type="checkbox" name="fv[cus_sms_status]" id="cus_sms_status" value="1" <?php if ($cus_sms_status == 1) { ?> checked="checked" <?php } ?> /><label for="send_sms"> Send SMS </label>
											<span class="help-block">Send SMS to the customer</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label"></label>
										<div class="col-sm-7">
											<input type="checkbox" name="fv[cus_email_status]" id="cus_email_status" value="1" <?php if ($cus_email_status == 1) { ?> checked="checked" <?php } ?> /><label for="send_email"> Send Email </label>
											<span class="help-block">Send Email to the customer</span>
										</div>
									</div>
								</div>
							</div>
							<div class="table-responsive rpanl_table commodity_values customergroup">
								<table id="commodity_activity" class="table table-hover1">
									<thead>
										<tr>
											<th>Commodity</th>
											<th style="display:none">Min. Order Qty(in kgs)</th>
											<th style="display:none">Max. Order Qty(in kgs)</th>
											<th><label class="control-label">
													<input type="checkbox" id="checkAll_buy" onchange="check_All(this);" /> Status(Buy)
												</label>
											</th>
											<th><label class="control-label">
													<input type="checkbox" id="checkAll_sell" onchange="check_All(this);" /> Status(Sell)
												</label>
											</th>
											<th style="display: none;"><label class="control-label">
													<input type="checkbox" id="checkAll_amountpur" onchange="check_All(this);" /> Amount Purchase
												</label>
											</th>
										</tr>
									</thead>
									<tbody>
										<?php
										$tabindex = 3;
										$i = 0;
										foreach ($comm_status as $commodity_row) {
										?>
											<tr>
												<td><input type="hidden" class="form-control" name="cdItems[com_id][]" tabIndex="<?php echo $tabindex++; ?>" value="<?php echo $commodity_row['com_id']; ?>" /><?php echo $commodity_row['com_name']; ?></td>
												<td style="display:none"><input type="number" class="form-control" name="cdItems[cus_com_smoq][]" maxlength="12" value="<?php echo $commodity_row['cus_com_smoq']; ?>" tabIndex="<?php echo $tabindex++; ?>" step="any" /></td>
												<td style="display:none"><input type="number" class="form-control" name="cdItems[cus_com_pmoq][]" maxlength="12" value="<?php echo $commodity_row['cus_com_pmoq']; ?>" tabIndex="<?php echo $tabindex++; ?>" step="any" /></td>
												<td><label class="form-check-label"><input type="checkbox" class="form-check-input cus_com_status_buy" name="cdItems[cus_com_status_buy][<?php echo $i ?>]" value="1" <?php if ($commodity_row['cus_com_status_buy'] == 1) { ?> checked="checked" <?php } ?> tabIndex="<?php echo $tabindex++; ?>" /></label></td>
												<td><label class="form-check-label"><input type="checkbox" class="form-check-input cus_com_status_sell" name="cdItems[cus_com_status_sell][<?php echo $i ?>]" value="1" <?php if ($commodity_row['cus_com_status_sell'] == 1) { ?> checked="checked" <?php } ?> tabIndex="<?php echo $tabindex++; ?>" /> </label></td>
												<td style="display: none;"><label class="form-check-label"><input type="checkbox" class="form-check-input cus_com_amountpurch" name="cdItems[cus_com_amountpurch][<?php echo $i ?>]" value="1" <?php if ($commodity_row['cus_com_amountpurch'] == 1) { ?> checked="checked" <?php } ?> tabIndex="<?php echo $tabindex++; ?>" /></label> </td>
											</tr>
										<?php
											$i++;
										} ?>
									</tbody>
								</table>
							</div>
							<div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
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
