<?php $this->load->view('include/header.php'); ?>

<script type="text/javascript">
	document.addEventListener('DOMContentLoaded', function() {
		function validatePasswords() {
			let newPass = $("#new_password").val();
			let confirmPass = $("#confirm_password").val();
			let isValid = true;

			// Min length & Complexity
			const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

			if (newPass.length < 6) {
				$("#min_length_msg").html("<span style='color:red;'>Minimum 6 characters required</span>");
				isValid = false;
			} else if (!complexityRegex.test(newPass)) {
				$("#min_length_msg").html("<span style='color:red;'>Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special char</span>");
				isValid = false;
			} else {
				$("#min_length_msg").html("");
			}

			// Match check
			if (newPass !== confirmPass) {
				$("#password_msg").html("<span style='color:red;'>Passwords do not match</span>");
				isValid = false;
			} else if (newPass !== "" && confirmPass !== "") {
				$("#password_msg").html("<span style='color:green;'>Passwords match</span>");
			} else {
				$("#password_msg").html("");
			}

			$("#saveBtn").prop("disabled", !isValid);
		}

		$("#new_password, #confirm_password").on("keyup", validatePasswords);


		$(document).on("click", ".toggle-pass", function() {
			let input = $($(this).data("target"));
			let icon = $(this).find("i");

			if (input.attr("type") === "password") {
				input.attr("type", "text");
				icon.removeClass("typcn-eye").addClass("typcn-eye-outline");
			} else {
				input.attr("type", "password");
				icon.removeClass("typcn-eye-outline").addClass("typcn-eye");
			}
		});

		$('#iframeForm').on('submit', function(e) {
			e.preventDefault();

			let oldPass = $.trim($("#previous_password").val());
			let newPass = $.trim($("#new_password").val());
			let confirmPass = $.trim($("#confirm_password").val());
			let secCode = $.trim($("#sec_code").val());

			// OLD PASSWORD
			if (oldPass === '') {
				showToast("Please enter Previous Password (not spaces, "error")");
				return false;
			}

			// NEW PASSWORD
			if (newPass === '') {
				showToast("New Password cannot be empty or only spaces", "error");
				return false;
			}

			const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
			if (newPass.length < 6) {
				showToast("Password must be at least 6 characters.", "error");
				return false;
			}
			if (!complexityRegex.test(newPass)) {
				showToast("Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special char", "error");
				return false;
			}

			// CONFIRM PASSWORD
			if (confirmPass === '') {
				showToast("Confirm Password cannot be empty or only spaces", "error");
				return false;
			}

			// SECURITY CODE
			if (secCode === '') {
				showToast("Please enter Security Code (not spaces, "error")");
				return false;
			}

			// MATCH CHECK
			if (newPass !== confirmPass) {
				showToast("New Password and Confirm Password must match", "error");
				return false;
			}

			let form = $(this);
			let btn = form.find('button[type="submit"]');
			let formData = new FormData(form[0]);

			btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
			$("#ajax_loader").addClass("show");

			$.ajax({
				url: form.attr("action"),
				type: "POST",
				data: formData,
				processData: false,
				contentType: false,
				dataType: "json",
				success: function(response) {
					$("#ajax_loader").removeClass("show");

					if (response.status === "success") {
						// showToast(response.message, "success");
						window.location = "<?php echo base_url() ?>index.php/C_main/load_mainpage/";
					} else {
						btn.prop("disabled", false).text("Save");
						showToast(response.message, "error");
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Save");
					showToast("Server error: " + error, "error");
				}
			});
		});
	});
</script>

<style>
	.input-group-text {
		cursor: pointer;
	}
</style>

<!-- AJAX LOADER -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
	<div class="content-wrapper">

		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">

					<?php
					$attributes = ['class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm'];
					echo form_open('C_change_psw/DB_Controller/change_psw_model/', $attributes);
					?>

					<div class="card-body">
						<h4 class="card-title">Password Settings</h4>

						<!-- OLD PASSWORD -->
						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Old Password *</label>
									<div class="col-sm-7">
										<div class="input-group">
											<input type="password" class="form-control" id="previous_password" name="fv[previous_password]" maxlength="50">
											<span class="input-group-text toggle-pass" data-target="#previous_password">
												<i class="typcn typcn-eye"></i>
											</span>
										</div>
										<span class="help-block">Enter the old password.</span>
									</div>
								</div>
							</div>
						</div>

						<!-- NEW PASSWORD -->
						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">New Password *</label>
									<div class="col-sm-7">
										<div class="input-group">
											<input type="password" class="form-control" id="new_password" name="fv[new_password]" maxlength="50">
											<span class="input-group-text toggle-pass" data-target="#new_password">
												<i class="typcn typcn-eye"></i>
											</span>
										</div>
										<span class="help-block">Enter the new password.</span>
										<div id="min_length_msg"></div>
									</div>
								</div>
							</div>
						</div>

						<!-- CONFIRM PASSWORD -->
						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Confirm Password *</label>
									<div class="col-sm-7">
										<div class="input-group">
											<input type="password" class="form-control" id="confirm_password" name="fv[confirm_password]" maxlength="50">
											<span class="input-group-text toggle-pass" data-target="#confirm_password">
												<i class="typcn typcn-eye"></i>
											</span>
										</div>
										<span class="help-block">Confirm the password.</span>
										<div id="password_msg"></div>
									</div>
								</div>
							</div>
						</div>

						<!-- SECURITY CODE -->
						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Security Code</label>
									<div class="col-sm-7">
										<input type="text" class="form-control" id="sec_code" name="fv[sec_code]" maxlength="10" onkeydown="validateKeyPress(event, this,1)">
										<span class="help-block">Enter the security code.</span>
									</div>
								</div>
							</div>
						</div>

						<!-- BUTTONS -->
						<div class="row form-sample1">
							<div class="col-md-3"></div>
							<div class="col-md-6">
								<button type="submit" id="saveBtn" class="btn btn1 btn-success btn-md">Save</button>
								<button type="reset" class="btn btn1 btn-danger btn-md">Cancel</button>
								<p align="right">* Required fields</p>
							</div>
						</div>

					</div>

					</form>

				</div>
			</div>
		</div>

	</div>
</div>

<?php $this->load->view("include/footer"); ?>