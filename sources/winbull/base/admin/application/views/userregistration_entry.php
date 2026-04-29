<?php
$this->load->view("include/header");

?>
<style>
	.footer {
		padding: 0px 10px
	}
</style>
<script language="javascript">
	$(document).ready(function() {
		$('body').on("keyup", "#cus_mobile", function() {
			$("#cus_login_name").val($(this).val());
		});
	});

	document.addEventListener('DOMContentLoaded', function() {
		const password_input = document.getElementById('cus_login_password');
		const conf_password_input = document.getElementById('cus_login_con_password');
		const password_err = document.getElementById('password-error');
		const conf_password_err = document.getElementById('confirm-password-error');

		function validatePasswords() {
			const password = password_input.value;
			const confirmPassword = conf_password_input.value;
			let isValid = true;

			password_err.textContent = '';
			conf_password_err.textContent = '';

			const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

			if (password.length < 6) {
				password_err.textContent = 'Password must be at least 6 characters.';
				isValid = false;
			} else if (!complexityRegex.test(password)) {
				password_err.textContent = 'Password must contain at least one uppercase, one lowercase, one number, and one special character.';
				isValid = false;
			}

			if (confirmPassword !== '' && password !== confirmPassword) {
				conf_password_err.textContent = 'Passwords do not match.';
				isValid = false;
			}

			return isValid;
		}

		const mobile_input = document.getElementById('cus_mobile');
		const whats_app_input = document.getElementById('cus_whatsapp');
		const mobile_err = document.getElementById('mobile-error');
		const whats_mob_err = document.getElementById('whats_mobile-error');

		const cus_email_input = document.getElementById('cus_email');
		const cus_gstno_input = document.getElementById('cus_gstno');
		const cus_panno_input = document.getElementById('cus_panno');

		const gst_err = document.getElementById('gst-error');
		const pan_err = document.getElementById('pan-error');
		const email_err = document.getElementById('email-error');

		function validateMobile() {
			const mobile = mobile_input.value;
			const whats_app = whats_app_input.value;
			let isValid = true;

			mobile_err.textContent = '';
			whats_mob_err.textContent = '';

			if (mobile.length < 10) {
				mobile_err.textContent = 'Enter 10 digits numbers.';
				isValid = false;
			}
			if (whats_app.length < 10) {
				whats_mob_err.textContent = 'Enter 10 digits numbers.';
				isValid = false;
			}

			return isValid;
		}

		function validateGST() {
			const gst = cus_gstno_input.value.trim().toUpperCase();
			let isValid = true;
			gst_err.textContent = '';
			const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
			if (!gstRegex.test(gst)) {
				gst_err.textContent = 'Enter a valid 15-character GSTIN.';
				isValid = false;
			}
			return isValid;
		}


		function validatePAN() {
			const pan = cus_panno_input.value.trim().toUpperCase();
			let isValid = true;
			pan_err.textContent = '';
			// Regex for PAN format
			const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
			if (!panRegex.test(pan)) {
				pan_err.textContent = 'Enter a valid 10-character PAN (e.g., ABCDE1234F).';
				isValid = false;
			}
			return isValid;
		}

		function validateEmail() {
			const email = cus_email_input.value.trim();
			let isValid = true;
			email_err.textContent = '';
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			if (email.length > 0 && !emailRegex.test(email)) {
				email_err.textContent = 'Enter a valid email address (e.g., name@example.com).';
				isValid = false;
			}
			return isValid;
		}


		password_input.addEventListener('keyup', validatePasswords);
		conf_password_input.addEventListener('keyup', validatePasswords);
		mobile_input.addEventListener('keyup', validateMobile);
		whats_app_input.addEventListener('keyup', validateMobile);

		cus_email_input.addEventListener('keyup', validateEmail);
		cus_gstno_input.addEventListener('keyup', validateGST);
		cus_panno_input.addEventListener('keyup', validatePAN);
	});


	function changeField() {
		arguments[0].style.display = "none";
		document.getElementById('cus_login_password1').style.display = "block";
		document.getElementById('new_password').style.display = "table-row";
		document.getElementById('retype_password').style.display = "table-row";
		document.getElementById('cus_login_password1').focus();
	}

	function validateAddress(event, textarea) {
		const key = event.key;
		const allowedPattern = /^[a-zA-Z0-9\s,'\-\/#\.]$/;
		const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
		if (controlKeys.includes(key)) {
			return true;
		}
		if (!allowedPattern.test(key)) {
			event.preventDefault();
			// document.getElementById('addressError').style.display = 'block';
			return false;
		}
		// document.getElementById('addressError').style.display = 'none';
		// return true;
	}

	function validate_image() {
		if (arguments[0].files[0].size > 1048576) {
			showFlashMessage(null, 'File size cannot be greater than 1 MB');
			arguments[0].value = "";
		} else {
			var fileName = arguments[0].value;
			var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
			ext = ext.toLowerCase();
			if (ext != "jpg" && ext != "png" && ext != "jpeg") {
				showFlashMessage(null, 'Upload JPG or PNG Images only');
				arguments[0].value = "";
			}
		}
	}

	function validate(e) {
		const form = document.getElementById('iframeForm');

		// 1. Standard Validation (Required, MinLength, data-no-numbers-only, etc.)
		if (!validateForm(e, form)) {
			return false;
		}

		// 2. Email Format Validation (BZ-54)
		var emailStr = document.getElementById('cus_email').value.trim();
		var emailPattern = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
		if (emailStr.length > 0 && !emailPattern.test(emailStr)) {
			showToast('Enter a valid email address (e.g., name@example.com)', 'danger');
			$("#cus_email").focus();
			e.preventDefault();
			return false;
		}

		// 3. Additional Password Strength & Match Check
		var passwordStr = document.getElementById('cus_login_password').value;
		var confirmPasswordStr = document.getElementById('cus_login_con_password').value;

		if (passwordStr !== confirmPasswordStr) {
			showToast('Passwords do not match', 'danger');
			$("#cus_login_con_password").focus();
			e.preventDefault();
			return false;
		}

		var complexityPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
		if (!complexityPattern.test(passwordStr)) {
			showToast('Password must be at least 6 chars with uppercase, lowercase, number, and special character.', 'warning');
			$("#cus_login_password").focus();
			e.preventDefault();
			return false;
		}

		// 3. AJAX submission
		e.preventDefault();
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
					btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
					showToast(response.message, 'danger');
				}
			},
			error: function(xhr, status, error) {
				$("#ajax_loader").removeClass("show");
				btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
				showToast("Server error: " + error, 'danger');
			}
		});

		return false;
	}

	function toggleViewPassword(fieldId, element) {
		var x = document.getElementById(fieldId);
		var icon = element.querySelector("i");
		if (x.type === "password") {
			x.type = "text";
			if (icon) {
				icon.classList.remove("typcn-eye");
				icon.classList.add("typcn-eye-outline");
			}
		} else {
			x.type = "password";
			if (icon) {
				icon.classList.remove("typcn-eye-outline");
				icon.classList.add("typcn-eye");
			}
		}
	}
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
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry<a href="<?php echo $this->config->item('base_url') ?>index.php/C_userregistration/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>--> </h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['cus_id'] == NULL ? NULL : $_POST['fv']['cus_id'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm', 'novalidate' => 'novalidate');
						//Opening form
						echo form_open_multipart('C_userregistration/DB_Controller/userregistration_model/' . $status . '/' . $id, $attributes); ?>
						<form class="form-sample" autoComplete="off">
							<p class="card-description card-description1"> Trader Details</p>
							<?php
							if (isset($db_error_msg) && $db_error_msg != '') {
								echo '<div class="alert alert-danger">
											<a href="#" class="close" data-dismiss="alert">&times;</a>
											<strong>Warning!</strong> ' . $db_error_msg . '
										</div>';
							}
							?>
							<input type="hidden" name="fv[cus_regtype]" value="<?php echo $cus_regtype ?>" />
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Trader Name *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_name]" id="cus_name" value="<?php echo set_value('cus_name', $cus_name); ?>" class="form-control" required onkeydown="validateKeyPress(event, this,4)" maxlength="50" minlength="3" data-no-numbers-only />
											<span class="help-block">Enter the trader name .</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Alias Name</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_alise_name]" id="cus_alise_name" value="<?php echo set_value('cus_alise_name', $cus_alise_name); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,5)" maxlength="30" minlength="3" data-no-numbers-only />
											<span class="help-block">Enter the Customer alias name.</span>
										</div>
									</div>
								</div>
							</div>
							<?php if ($cus_regtype == 1) { ?>
								<div class="row form-sample1">
									<div class="col-md-6">
										<div class="form-group row">
											<label class="col-sm-4 col-form-label">Customer Name 2 </label>
											<div class="col-sm-7">
												<input type="text" name="fv[cus_name2]" id="cus_name2" class="form-control" value="<?php echo set_value('cus_name2', $cus_name2); ?>" onkeydown="validateKeyPress(event, this,4)" maxlength="50" minlength="3" data-no-numbers-only />
												<span class="help-block">Enter the customer name .</span>
											</div>
										</div>
									</div>
									<div class="col-md-6">
										<div class="form-group row">
											<label class="col-sm-4 col-form-label">Mobile No.</label>
											<div class="col-sm-7">
												<input type="number" name="fv[cus_mobile2]" id="cus_mobile2" placeholder="" class="form-control " value="<?php echo set_value('cus_mobile2', $cus_mobile2); ?>" onkeydown="validateKeyPress(event, this,1)" maxlength="10" minlength="10" />
												<span class="help-block">Enter the mobile no.</span>
											</div>
										</div>
									</div>
								</div>
							<?php } ?>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Company Name *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_company_name]" id="cus_company_name" class="form-control" value="<?php echo set_value('cus_company_name', $cus_company_name); ?>" placeholder="" onkeydown="validateKeyPress(event, this,4)" maxlength="50" minlength="3" required data-no-numbers-only />
											<span class="help-block">Enter the company name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Trader type *</label>
										<div class="col-sm-7">
											<select id="customer_type" name="fv[customer_type]" class="form-select" required>
												<option value="0" <?php if ($customer_type == 0) { ?> selected="selected" <?php } ?>>Both Customer & Supplier</option>
												<option value="1" <?php if ($customer_type == 1) { ?> selected="selected" <?php } ?>>Customer (Buyer)</option>
												<option value="2" <?php if ($customer_type == 2) { ?> selected="selected" <?php } ?>>Supplier (Seller)</option>
											</select>
											<span class="help-block">Choose trader type</span>
										</div>
									</div>
								</div>

							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Mobile No *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_mobile]" id="cus_mobile" class="form-control" placeholder="10 digit mobile no." oninput="this.value=this.value.replace(/[^0-9]/g,'');" value="<?php echo set_value('cus_mobile', $cus_mobile); ?>" required onkeydown="validateKeyPress(event, this,1)" maxlength="10" minlength="10" />
											<span id="mobile-error" class="text-danger help-block"></span>
											<span class="help-block">Enter mobile no</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">E-Mail Id *</label>
										<div class="col-sm-7">
											<!-- <input type="email"  name="fv[cus_email]" value="<?php echo set_value('cus_email', $cus_email); ?>"  id="cus_email" class="form-control" required maxlength="30"/> -->
											<input type="email" name="fv[cus_email]" value="<?php echo set_value('cus_email', $cus_email); ?>" id="cus_email" class="form-control" required maxlength="50" data-validate="email" oninput="this.value = this.value.replace(/[^a-zA-Z0-9@._\-+]/g, '').replace(/@(?=.*@)/g, '');" />
											<span id="email-error" class="text-danger help-block"></span>
											<span class="help-block">Enter the email id.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Whats App No *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_whatsapp]" id="cus_whatsapp" class="form-control" placeholder="10 digit whats app no." oninput="this.value=this.value.replace(/[^0-9]/g,'');" value="<?php echo isset($cus_whatsapp) ? set_value('cus_whatsapp', $cus_whatsapp) : ''; ?>" required onkeydown="validateKeyPress(event, this,1)" maxlength="10" minlength="10" />
											<span id="whats_mobile-error" class="text-danger help-block"></span>
											<span class="help-block">Enter Whats App no</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Business Type</label>
										<div class="col-sm-7">

											<?php render_radio_group(
												'fv[cus_tcstds]',
												[
													1 => ['label' => 'TCS', 'id' => 'cus_tcs'],
													0 => ['label' => 'TDS', 'id' => 'com_group_active']
												],
												$cus_tcstds,
												'Select Business is TCS or TDS.'
											); ?>
										</div>
									</div>
								</div>

							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Address</label>
										<div class="col-sm-7">
											<textarea name="fv[cus_address]" id="cus_address" class="form-control" maxlength="250" minlength="10" title="Address must be 10–200 characters long and can include letters, numbers, spaces, commas, dots, dashes, slashes, and #" onkeydown="validateAddress(event, this)"><?php echo set_value('cus_address', $cus_address); ?></textarea>
											<?php /*?><input type="text"  name="fv[cus_address]" id="cus_address" class="form-control" value="<?php echo set_value('cus_address',$cus_address); ?>" placeholder=""/><?php */ ?>
											<span class="help-block">Enter the address details.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">City</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_city]" id="cus_city" value="<?php echo set_value('cus_city', $cus_city); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,5)" maxlength="50" minlength="3" />
											<span class="help-block">Enter the city name.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">GST No *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_gstno]" id="cus_gstno" class="form-control " placeholder="e.g.: 22AAAAA0000A1Z5" maxlength="15" minlength="15" title="Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5)" value="<?php echo isset($cus_gstno) ? set_value('cus_gstno', $cus_gstno) : ''; ?>" oninput="this.value = this.value.toUpperCase().replace(/\s/g, '')" required />
											<span id="gst-error" class="text-danger help-block"></span>
											<span class="help-block">Enter the GST No (e.g.: 22AAAAA0000A1Z5).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Pan No *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_panno]" id="cus_panno" class="form-control " placeholder="e.g.: AAAAA1234A" value="<?php echo isset($cus_panno) ? set_value('cus_panno', $cus_panno) : ''; ?>" maxlength="10" minlength="10" oninput="this.value = this.value.toUpperCase().replace(/\s/g, '')" required />
											<span id="pan-error" class="text-danger help-block"></span>
											<span class="help-block">Enter the Pan No (e.g.: AAAAA1234A).</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Remarks</label>
										<div class="col-sm-7">
											<textarea name="fv[cus_remarks]" id="cus_remarks" placeholder="" class="form-control" onkeydown="validateKeyPress(event, this,4)" maxlength="100"><?php echo set_value('cus_remarks', $cus_remarks); ?></textarea>
											<span class="help-block">Customer extra details.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Reference</label>
										<div class="col-sm-3">
											<input type="checkbox" name="fv[cus_sms_status]" id="cus_sms_status" value="1" <?php if (isset($cus_sms_status) && $cus_sms_status == 1) { ?> checked="checked" <?php } ?> /><label for="send_sms"> Send SMS </label>
											<span class="help-block">Send SMS to the customer</span>
										</div>
										<div class="col-sm-3">
											<input type="checkbox" name="fv[cus_email_status]" id="cus_email_status" value="1" <?php if (isset($cus_email_status) && $cus_email_status == 1) { ?> checked="checked" <?php } ?> /><label for="send_email"> Send Email </label>
											<span class="help-block">Send Email to the customer</span>
										</div>
									</div>
								</div>
							</div>
							<?php if ($cus_regtype == 1) { ?>
								<div class="row form-sample1">
									<div class="col-md-6">
										<div class="form-group row">
											<label class="col-sm-4 col-form-label">Office No. 1</label>
											<div class="col-sm-7">
												<input type="text" name="fv[cus_phone1]" id="cus_phone1" class="form-control " placeholder="" value="<?php echo set_value('cus_phone1', $cus_phone1); ?>" />
												<span class="help-block">Enter the office No.</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Office No. 2</label>
										<div class="col-sm-7">
											<input type="text" name="fv[cus_phone2]" id="cus_phone2" placeholder="" class="form-control " value="<?php echo set_value('cus_phone2', $cus_phone2); ?>" />
											<span class="help-block">Enter the office No.</span>
										</div>
									</div>
								</div>
					</div>
					<div class="row form-sample1">
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label">Residence No.</label>
								<div class="col-sm-7">
									<input type="text" name="fv[cus_res_phone]" id="cus_res_phone" class="form-control " placeholder="" value="<?php echo set_value('cus_res_phone', $cus_res_phone); ?>" />
									<span class="help-block">Enter the residence No.</span>
								</div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label"></label>
								<div class="col-sm-7">

								</div>
							</div>
						</div>
					</div>
					<p class="card-description card-description1">Bank Details</p>
					<div class="row form-sample1">
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label">Name</label>
								<div class="col-sm-7">
									<input type="text" name="fv[cus_bnkname]" id="cus_bnkname" class="form-control " placeholder="" value="<?php echo set_value('cus_bnkname', $cus_bnkname); ?>" />
									<span class="help-block">Enter the bank name.</span>
								</div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label">Branch</label>
								<div class="col-sm-7">
									<input type="text" name="fv[cus_bnkbranch]" id="cus_bnkbranch" placeholder="" class="form-control" value="<?php echo set_value('cus_bnkbranch', $cus_bnkbranch); ?>" />
									<span class="help-block">Enter the bank branch.</span>
								</div>
							</div>
						</div>
					</div>
					<div class="row form-sample1">
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label">A/C No</label>
								<div class="col-sm-7">
									<input type="number" name="fv[cus_accno]" id="cus_accno" class="form-control " placeholder="" value="<?php echo set_value('cus_accno', $cus_accno); ?>" />
									<span class="help-block">Enter the A/C No.</span>
								</div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label">IFSC Code</label>
								<div class="col-sm-7">
									<input type="text" name="fv[cus_ifsc]" id="cus_ifsc" class="form-control " placeholder="" value="<?php echo set_value('cus_ifsc', $cus_ifsc); ?>" />
									<span class="help-block">Enter the IFSC No.</span>
								</div>
							</div>
						</div>
					</div>
					<div class="row form-sample1">
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label">Tin No</label>
								<div class="col-sm-7">
									<input type="text" name="fv[cus_tin_no]" id="cus_tin_no" class="form-control " placeholder="" value="<?php echo set_value('cus_tin_no', $cus_tin_no); ?>" required />
									<span class="help-block">Enter the Tin No.</span>
								</div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label"></label>
								<div class="col-sm-7">

								</div>
							</div>
						</div>
					</div>
					<div class="row form-sample1">
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label">Reference</label>
								<div class="col-sm-7">
									<input type="text" name="fv[cus_ifsc]" id="cus_ifsc" class="form-control " placeholder="" value="<?php echo set_value('cus_ifsc', $cus_ifsc); ?>" />
									<span class="help-block">Enter the IFSC No.</span>
								</div>
							</div>
						</div>
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-4 col-form-label"></label>
								<div class="col-sm-7">

								</div>
							</div>
						</div>
					</div>
				<?php } ?>
				<p class="card-description card-description2">Login and Security Details </p>
				<div class="row form-sample1">
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label">Login Name *</label>
							<div class="col-sm-7">
								<input type="text" name="fv[cus_login_name]" id="cus_login_name" value="<?php echo set_value('cus_login_name', $cus_login_name); ?>" class="form-control" placeholder="" readonly />
								<span class="help-block">Enter the login user name .</span>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label" style="display:none">Security Code </label>
							<div class="col-sm-7" style="display:none">
								<input type="text" name="fv[cus_sec_code]" id="cus_sec_code" class="form-control" value="<?php echo set_value('cus_sec_code', $cus_sec_code); ?>" placeholder="" />
								<span class="help-block">Enter the security code.</span>
							</div>
						</div>
					</div>
				</div>
				<div class="row form-sample1">
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label">Password *</label>
							<div class="col-sm-7" style="position:relative;">
								<input type="password" name="fv[cus_login_password]" id="cus_login_password" class="form-control" value="<?php echo set_value('cus_login_password', $cus_login_password); ?>" placeholder="" required maxlength="30" minlength="6" style="padding-right: 40px;" />
								<span style="position: absolute; right: 25px; top: 0; height: 100%; display: flex; align-items: unset; cursor: pointer;" onclick="toggleViewPassword('cus_login_password', this)">
									<i class="typcn typcn-eye" style="font-size: 20px;"></i>
								</span>
								<span id="password-error" class="text-danger help-block"></span>
								<span class="help-block">Enter the pasword.</span>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label" style="display:none"> </label>
							<div class="col-sm-7" style="display:none">

							</div>
						</div>
					</div>
				</div>
				<div class="row form-sample1">
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label">Retype Password *</label>
							<div class="col-sm-7" style="position:relative;">
								<input type="password" name="cus_login_con_password" id="cus_login_con_password" class="form-control" value="<?php echo set_value('cus_login_password', $cus_login_password); ?>" placeholder="" required minlength="6" maxlength="30" style="padding-right: 40px;" />
								<span style="position: absolute; right: 25px; top: 0; height: 100%; display: flex; align-items: unset; cursor: pointer;" onclick="toggleViewPassword('cus_login_con_password', this)">
									<i class="typcn typcn-eye" style="font-size: 20px;"></i>
								</span>
								<span id="confirm-password-error" class="text-danger help-block"></span>
								<span class="help-block">ReEnter the password.</span>
							</div>
						</div>
					</div>
					<div class="col-md-6">
						<div class="form-group row">
							<label class="col-sm-4 col-form-label" style="display:none"> </label>
							<div class="col-sm-7" style="display:none">

							</div>
						</div>
					</div>
				</div>
				<div class="row form-sample1">
					<div class="col-md-4"></div>
					<div class="col-md-4 page_footer">
						<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
							<input type="hidden" id="cus_id" value="<?php echo isset($cus_id) ? $cus_id : ''; ?>">
							<button type="submit" onclick="validate(event)" class="btn btn1 btn-success btn-md btn-md1">Update</button>
						<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
							<button type="submit" onclick="validate(event)" class="btn btn1 btn-success btn-md btn-md1">Save</button>
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