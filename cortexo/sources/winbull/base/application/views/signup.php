<style type="text/css">
	#form-secondstep {
		display: none;
	}

	.signup-container .link-forgot {
		float: left;
	}

	.signup-container .link-signup {
		float: right;
	}

	.GifLoader {
		position: absolute;
		left: 45%;
		top: 45%;
		z-index: 999;
		display: none;
	}

	.profile-img {
		width: 96px;
		height: 96px;
		margin: 0 auto 10px;
		display: block;
		-moz-border-radius: 50%;
		-webkit-border-radius: 50%;
		border-radius: 50%;
	}

	element.style {}

	input[type=radio],
	input[type=checkbox] {
		margin: 2px 5px 0;
		margin-top: 1px \9;
		line-height: normal;
	}

	input[type=checkbox],
	input[type=radio] {
		-webkit-box-sizing: border-box;
		-moz-box-sizing: border-box;
		box-sizing: border-box;
		padding: 0;
	}

	input {
		width: auto;
		height: auto;
		float: none;
	}

	.hint {
		font-size: 12px;
		color: #555;
	}

	.password-container {
		position: relative;
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
	}

	.password-container input[type="password"],
	.password-container input[type="text"] {
		width: 100%;
		padding: 10px;
		padding-right: 40px;
		/* Add space for the icon */
		box-sizing: border-box;
	}

	.password-container .toggle-password {
		position: absolute;
		right: 10px;
		top: 10px;
		/* transform: translateY(-50%); */
		cursor: pointer;
	}
</style>
<script type="text/javascript">
	function restrictNumbers(event) {
		var charCode = event.which ? event.which : event.keyCode;
		if (charCode >= 48 && charCode <= 57) {
			event.preventDefault();
			return false;
		}
		return true;
	}

	function togglePassword() {
		const passwordField = document.getElementById('cus_login_password');
		const toggleIcon = document.getElementById('toggle-icon');
		if (passwordField.type === 'password') {
			passwordField.type = 'text';
			toggleIcon.classList.remove('fa-eye-slash');
			toggleIcon.classList.add('fa-eye');
		} else {
			passwordField.type = 'password';
			toggleIcon.classList.remove('fa-eye');
			toggleIcon.classList.add('fa-eye-slash');
		}
	}

	function togglePassword1() {
		const passwordField1 = document.getElementById('retype_password');
		const toggleIcon1 = document.getElementById('toggle-icon1');
		if (passwordField1.type === 'password') {
			passwordField1.type = 'text';
			toggleIcon1.classList.remove('fa-eye-slash');
			toggleIcon1.classList.add('fa-eye');
		} else {
			passwordField1.type = 'password';
			toggleIcon1.classList.remove('fa-eye');
			toggleIcon1.classList.add('fa-eye-slash');
		}
	}

	$(document).ready(function() {
		// $('.individualpan').css('display', 'block');
		// $('.companygst').css('display', 'none');
		var $ = jQuery.noConflict();
		$("#signup-form").submit(function(e) {
			if ($("#form-type").html() == 0) {
				e.preventDefault();
				generateotp();
			} else {
				$("#signup-form").submit();
			}
		});
		$("#generateOTP, .resendotp").on("click", function(e) {
			e.preventDefault();
			generateotp();
		});
		$(document).on("click", ".goback", function(e) {
			e.preventDefault();
			call_firststep();
		});
	});

	function call_firststep() {
		var $ = jQuery.noConflict();
		$(".center-block").css("display", "block");
		$("#form-type").html(0);
		$("#generateOTP").html('Register');
		$("#generateOTP").prop("disabled", false);
		$("#form-secondstep").css({
			"opacity": "1",
			"display": "none",
		}).hide().animate({
			opacity: 0
		});
		$("#form-firststep").css({
			"opacity": "0",
			"display": "block",
		}).show().animate({
			opacity: 1
		});
	}

	function call_secondstep() {
		var $ = jQuery.noConflict();
		$(".center-block").css("display", "none");
		$("#form-type").html(1);
		$("#form-firststep").css({
			"opacity": "1",
			"display": "none",
		}).hide().animate({
			opacity: 0
		})
		$("#form-secondstep").css({
			"opacity": "0",
			"display": "block",
		}).show().animate({
			opacity: 1
		});
	}

	function generateotp() {
		var $ = jQuery.noConflict();
		$(".errors").html();

		// Validation Function Helper
		function showError(msg, selector) {
			$(".errors").html('<div class="alert alert-danger" style="text-align:center"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><p>' + msg + '</p></div>');
			$('html, body').animate({
				scrollTop: $(selector).position().top
			}, 'slow');
			return false;
		}

		// Field Validations
		var cus_name = $("#cus_name").val().trim();
		if (cus_name === "" || !/^[a-zA-Z\s\.]+$/.test(cus_name)) return showError("Please enter a valid Name (Letters and spaces only).", "#cus_name");

		var cus_company_name = $("#cus_company_name").val().trim();
		if (cus_company_name === "" || !/^[a-zA-Z0-9\s\.\,\-\&]+$/.test(cus_company_name)) return showError("Please enter a valid Company Name", "#cus_company_name");

		var cus_address = $("#cus_address").val().trim();
		if (cus_address === "" || !/^[a-zA-Z0-9\s\.\,\-\/\#]+$/.test(cus_address)) return showError("Please enter a valid Company Address.", "#cus_address");

		var cus_email = $("#cus_email").val().trim();
		var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (cus_email === "") return showError("Please enter Email.", "#cus_email");
		if (!emailPattern.test(cus_email)) return showError("Please enter a valid Email.", "#cus_email");

		var cus_whatsapp = $("#cus_whatsapp").val().trim();
		if (cus_whatsapp === "" || !/^\d{10}$/.test(cus_whatsapp)) return showError("Please enter a valid 10-digit Whatsapp Number (Numbers only).", "#cus_whatsapp");

		var cus_gstno = $("#cus_gstno").val().trim();
		// GST Alphanumeric check
		if (cus_gstno === "" || !/^[A-Z0-9]{15}$/.test(cus_gstno.toUpperCase())) return showError("Please enter a valid 15-character GST No (Alphanumeric only).", "#cus_gstno");

		var cus_mobile = $("#cus_mobile").val().trim();
		if (cus_mobile === "" || !/^\d{10}$/.test(cus_mobile)) return showError("Please enter a valid 10-digit Mobile Number (Numbers only).", "#cus_mobile");

		// Password Validation
		var passwordStr = $("#cus_login_password").val();
		var confirmPass = $("#retype_password").val();
		var complexityPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

		if (passwordStr.length < 6) return showError("Password must be at least 6 characters.", "#cus_login_password");
		if (!complexityPattern.test(passwordStr)) return showError("Password must contain at least one uppercase, one lowercase, one number, and one special character.", "#cus_login_password");
		if (passwordStr !== confirmPass) return showError("Passwords do not match.", "#retype_password");

		if (!$("#terms").prop("checked")) {
			return showError("Please accept the Terms and Conditions.", "#terms");
		}

		$('html, body').animate({
			scrollTop: $('#cus_mobile').position().top
		}, 'slow');
		$(".GifLoader").css('display', 'block');
		$("#generateOTP").html('Please Wait...');
		$("#generateOTP").prop("disabled", true);
		var data = {
			'cus_name': $("#cus_name").val(),
			'cus_company_name': $("#cus_company_name").val(),
			'cus_address': $("#cus_address").val(),
			'cus_email': $("#cus_email").val(),
			'cus_mobile': $("#cus_mobile").val(),
			'cus_login_password': $("#cus_login_password").val(),
			'retype_password': $("#retype_password").val(),
			'terms': $("#terms").prop("checked") ? 1 : 0,
			// 'cus_tcstds': $("#cus_tcstds").val(),
			'cus_type': $("#cus_type").val(),
			'cus_gstno': $("#cus_gstno").val(),
			'cus_panno': $("#cus_panno").val(),
			'cus_whatsapp': $("#cus_whatsapp").val(),
		};
		$.ajax({
			url: "<?php echo $this->config->item('base_url') ?>index.php/c_userregistration/generateOTP",
			type: "POST",
			data: data,
			dataType: 'json',
			success: function(result) {

				$(".GifLoader").css('display', 'none');
				$(".errors").html('');
				if (result.status == 'S') {
					call_secondstep();
				} else {
					$("#form-type").html(0);
					$("#generateOTP").html('Register');
					$("#generateOTP").prop("disabled", false);
					$(".errors").html('<div class="alert alert-danger" style="text-align:center"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a><p>' + result.errors + '</p>');
				}
			},
			error: function(error) {
				$(".GifLoader").css('display', 'none');
				$("#generateOTP").html('Register');
				$("#generateOTP").prop("disabled", false);
				console.log(error);
			}
		});
	}

	// function customer_type() {
	// 	var cus_comapny = document.getElementById('cus_company');
	// 	var cus_individual = document.getElementById('cus_individual');
	// 	var $ = jQuery.noConflict();
	// 	if (cus_comapny.checked == true) {
	// 		$('.companygst').css('display', 'block');
	// 		$('.individualpan').css('display', 'none');
	// 	}
	// 	if (cus_individual.checked == true) {
	// 		$('.individualpan').css('display', 'block');
	// 		$('.companygst').css('display', 'none');
	// 	}
	// }
</script>
<div class="container-fluid contant">
	<div class="container" style="">
		<div class="row" id="register">
			<div class="top-div">
				<div class="panel panel-default">
					<div class="panel-heading">
						<strong>Register a new Account</strong>
					</div>
					<div class="panel-body">
						<div class="row">
							<div class="center-block">
								<img class="profile-img"
									src="https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120" alt="">
							</div>
						</div>
						<div class="row">
							<div class="col-sm-12 col-md-12 col-xs-12">
								<div class="GifLoader">
									<img src="<?php echo base_url() ?>assets/images/ajax_load.gif" />
								</div>
								<?php if ($this->session->flashdata('success') != '') { ?>
									<div class="alert alert-success" style="text-align:center">
										<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
										<p><?php echo $this->session->flashdata('success'); ?></p>
									</div>
								<?php } else if ($this->session->flashdata('errorMsg') != '') { ?>
									<div class="alert alert-danger" style="text-align:center">
										<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
										<p><?php echo $this->session->flashdata('errorMsg'); ?></p>
									</div>
								<?php } ?>

								<div class="GifLoader">
									<img src="<?php echo base_url() ?>assets/images/ajax_load.gif" />
								</div>
								<form id="signup-form" method="post" action="<?php echo base_url() ?>index.php/c_userregistration/DB_Controller/add_new">
									<div id="form-type" style="display:none">0</div>
									<div class="errors"></div>
									<div id="form-firststep">
										<!-- new -->
										<!-- <div class="form-group col-md-12 col-xs-12">
											<label class="col-md-5 col-xs-12">Customer Type </label>
											<div class="col-md-7 col-xs-12">
												<input checked type="radio" value="0" name="cus_type" onclick="customer_type()" id="cus_individual" /> <label for="cus_individual">Individual</label>
												<input type="radio" value="1" name="cus_type" onclick="customer_type()" id="cus_company" /> <label for="cus_company">Company</label>
											</div>
										</div> -->
										<!-- new -->
										<div class="form-group col-md-12 col-xs-12 col-sm-12">
											<label class="col-md-5 col-md-5 col-xs-12">Name *</label>
											<div class="col-md-7 col-md-7 col-xs-12">
												<input type="text" name="cus_name" id="cus_name" class="form-control" placeholder="Your full name" oninput="this.value = this.value.replace(/[^a-zA-Z\s.]/g, '')" minlength="3" maxlength="50">
											</div>
										</div>
										<div class="form-group col-md-12 col-xs-12 col-sm-12">
											<label class="col-md-5 col-sm-5 col-xs-12">Company Name *</label>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<input type="text" name="cus_company_name" id="cus_company_name" class="form-control" placeholder="Enter your company name" minlength="4" maxlength="50" oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s.,\-&]/g, '')">
											</div>
										</div>
										<div class="form-group col-md-12 col-sm-12 col-xs-12 form-group_sign1">
											<label class="col-md-5 col-sm-5 col-xs-12">Company Address *</label>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<input type="text" name="cus_address" id="cus_address" class="form-control" placeholder="Enter your company Address" minlength="4" maxlength="50" oninput="this.value = this.value.replace(/[^a-zA-Z0-9\s.,\-/#]/g, '')">
											</div>
										</div>
										<div class="form-group col-md-12 col-xs-12 col-sm-12">
											<label class="col-md-5 col-sm-5 col-xs-12">Email *</label>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<input type="text" name="cus_email" id="cus_email" class="form-control" placeholder="Valid email id" oninput="this.value = this.value.replace(/[^a-zA-Z0-9@._\-+]/g, '')" maxlength="50">
											</div>
										</div>
										<div class="form-group col-md-12 col-sm-12 col-xs-12 form-group_sign1">
											<label class="col-md-5 col-sm-5 col-xs-12">Whatsapp No*</label>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<input type="text" name="cus_whatsapp" id="cus_whatsapp" class="form-control" placeholder="Enter your Whatsapp number" minlength="10" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
											</div>
										</div>
										<div class="form-group companygst col-md-12 col-sm-12 col-xs-12">
											<label class="col-md-5 col-sm-5 col-xs-12">GST No *</label>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<input type="text" name="cus_gstno" id="cus_gstno" class="form-control" placeholder="Ener your GST no." oninput="this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '')" minlength="15" maxlength="15">
											</div>
										</div>
										<div class="form-group col-md-12 col-sm-12 col-xs-12 form-group_sign1">
											<label class="col-md-5 col-sm-5 col-xs-12">Mobile No *</label>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<input type="text" name="cus_mobile" id="cus_mobile" class="form-control" placeholder="10 digit mobile no." minlength="10" maxlength="10" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
											</div>
										</div>
										<!-- <div class="form-group individualpan col-md-12">
											<label class="col-md-5">PAN No *</label>
											<div class="col-md-7">
												<input type="text" name="cus_panno" id="cus_panno" class="form-control" placeholder="Enter your PAN no.">
											</div>
										</div> -->
										<!-- <div class="form-group col-md-12 col-xs-12">
											<label class="col-md-5 col-xs-12">Type </label>
											<div class="col-md-7 col-xs-12">
												<input checked type="radio" value="0" name="cus_tcstds" id="cus_tcs" /> <label for="cus_tcs">TCS</label>
												<input type="radio" value="1" name="cus_tcstds" id="cus_tds" /> <label for="cus_tds">TDS</label>
												<br><span class="hint">(HINT - Turn Over company less than 10 crore -TCS. Turn over company more than 10 crore - TDS.)</span>
											</div>
										</div> -->
										<div class="form-group col-md-12 col-xs-12 col-sm-12">
											<label class="col-md-5 col-sm-5 col-xs-12">Password *</label>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<div class="password-container">
													<input type="password" name="cus_login_password" id="cus_login_password" class="form-control" placeholder="Your password (Min 6 char)" minlength="6" maxlength="30">
													<span class="toggle-password" onclick="togglePassword()">
														<i id="toggle-icon" class="fa fa-eye-slash"></i>
													</span>
												</div>
											</div>
										</div>
										<div class="form-group col-md-12 col-xs-12 col-sm-12">
											<label class="col-md-5 col-sm-5 col-xs-12">Password (Re-enter again) *</label>
											<div class="col-md-7 col-sm-5 col-xs-12">
												<div class="password-container">
													<input type="password" name="retype_password" id="retype_password" class="form-control" placeholder="Retype the above password" minlength="6" maxlength="30">
													<span class="toggle-password" onclick="togglePassword1()">
														<i id="toggle-icon1" class="fa fa-eye-slash"></i>
													</span>
												</div>
											</div>
										</div>
										<div class="termsText col-md-12 col-sm-12 col-xs-12" style="padding-left: 20px">

											<input type="checkbox" class="checkbox" id="terms" name="terms" style="display: -webkit-inline-box;" />

											<label style="cursor:pointer" for="terms" id="termsConditions"> I accept the <a target="_blank" href="<?php echo base_url() ?>index.php/c_client_main/terms" style="color:blue !important;">Terms and conditions</a> of this site.</label>
										</div>
										<div class="col-md-12 col-sm-12 col-xs-12" style="text-align:center;margin-top: 20px">
											<button type="button" name="button" class="btn btn-warning" id="generateOTP">Register</button>
										</div>
									</div>
									<div id="form-secondstep">
										<div class="form-group col-md-12 col-sm-12 col-xs-12">
											<label class="col-md-5 col-sm-5 col-xs-12">Enter OTP sent to your Mobile No</label>
											<div class="col-md-3 col-sm-3 col-xs-12">
												<input type="text" name="otp" id="otp" class="form-control">
											</div>
											<div class="col-md-4 col-sm-4 col-xs-12 resendotp" style="color:#000 !important;">Resend OTP?</div>
										</div>
										<div class="col-md-12 col-sm-12 col-xs-12" style="text-align:center;margin-top: 20px">
											<div class="col-md-4 col-sm-4 col-xs-12 goback" style="color:#000 !important;">Go Back</div>
											<div class="col-md-4 col-sm-4 col-xs-12">
												<button type="submit" name="button" class="btn btn-warning" id="submit">Submit</button>
											</div>
											<div class="col-md-4 col-sm-4 col-xs-12"></div>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
					<div class="panel-footer ">
						<span style="text-align: left"> Already have an account? <a href="<?php echo base_url() ?>index.php/C_client_main/login" style="color:#000 !important;">Click here</a> </span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>