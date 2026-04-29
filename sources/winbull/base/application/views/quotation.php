<?php
$model_name = "booking_model";
$controller_name = "C_client_main";
?>
<style>
	.quotation-box {
		background-color: #F6F1E3;
		padding: 30px;
		border-radius: 8px;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
		margin-top: 30px;
	}

	.form-group {
		background-color: #F6F1E3;
	}

	.quotation-box h3 {
		text-align: center;
		margin-bottom: 20px;
		font-weight: bold;
		color: #000000;
	}

	.form-group label {
		font-weight: 600;
	}

	.btn-submit {
		background-color: green;
		color: #fff;
		font-weight: bold;
	}

	.btn-cancel {
		background-color: #fff;
		border: 1px solid #666;
		font-weight: bold;
		margin-left: 10px;
	}

	.right-panel img {
		width: 100%;
		border-radius: 8px;
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
	}

	.content {
		display: flex;
		align-items: stretch;
		/* ensures equal height */
	}

	.content>.col-md-6,
	.content>.col-md-5 {
		display: flex;
		flex-direction: column;
	}

	/* .input,
	input {
		margin-bottom: unset;    
	} */

	.text-danger {
		/* margin-top: 15px !important; */
	}

	.country {
		padding-left: 0;
		padding-right: 0;
		height: 30px;
		margin-left: -10px;
	}

	@media only screen and (max-width:480px) {
		/* margin-bottom:20px; */
	}
</style>
<div class="container-fluid contact_background contant">
	<div class="banner">
		<img src="<?php echo $this->config->item('base_url'); ?>assets/images/cont_banner.jpg" width="100%" />
	</div>
	<div class="row">
		<div class="container" style="margin-bottom: 20px;">
			<!-- <div class="row content"> -->
				<div class="col-md-12 col-xs-12 aboutus_head">
					<div class="col-md-6 col-xs-12">
						<div class="quotation-box" style="background-color:#F6F1E3; padding:30px; border-radius:8px; box-shadow:0 3px 6px rgba(0,0,0,0.15);">
							<h3 style="text-align:center; font-weight:bold;">QUOTATION PAGE</h3>
							<?php
							$attributes 		=	array('class' => 'form-horizontal', 'id' => 'quotation-form', 'name' => 'iframeForm', 'autocomplete' => 'off');
							//Opening form
							echo form_open('', $attributes);
							//echo form_open('C_client_main/quotation_confirm', $attributes);
							?>
							<!-- <form> -->

							<div class="form-group row">
								<label for="company" class="col-md-4 col-xs-12 col-form-label">Company Name</label>
								<div class="col-md-8 col-xs-12">
									<input type="text" name="company" class="form-control" id="company" placeholder="Enter company name" maxlength="40">
									<small class="text-danger" id="companyError"></small>
								</div>
							</div>

							<div class="form-group row">
								<label for="gst" class="col-md-4 col-xs-12 col-form-label">GST No</label>
								<div class="col-md-8 col-xs-12">
									<input type="text" name="gst" class="form-control" id="gst" placeholder="Enter GST number" maxlength="15">
									<small class="text-danger" id="gstError"></small>
								</div>
							</div>

							<div class="form-group row">
								<label for="mobile" class="col-md-4 col-xs-12 col-form-label">Mobile No</label>
								<div class="col-md-8 col-xs-12">
									<div>
										<div class="col-md-3 col-xs-3" style="padding-right: 0;padding-left: 0;">
											<img id="country-flag" src="" alt="Flag" style='width: 46px; height: 30px;'>
										</div>
										<div class="col-md-3 col-xs-9 country" style="">
											<select id="country" name="cus_country" tabindex="" class="form-control" style="height:34px;padding-left: 0px;">
												<?php echo $countries; ?>
											</select>
										</div>
										<div class="col-md-6 col-xs-12" style="padding-right: 0;padding-left: 5px;">
											<input type="text" name="mobile" id="mobile" class="form-control" placeholder="Enter mobile number" />
										</div>
									</div>
									<!-- <input type="text" name="mobile" class="form-control" id="mobile" placeholder="Enter mobile number"> -->
									<small class="text-danger" id="mobileError"></small>
								</div>
							</div>

							<div style="text-align:center; padding-top:15px;background-color: #F6F1E3;">
								<button type="button" id="submitBtn" class="btn btn-success">Submit</button>
								<button type="reset" class="btn btn-default">Cancel</button>
							</div>

							<!-- </form> -->
						</div>
					</div>

					<div class="col-md-1"></div>

					<div class="col-md-5 col-xs-12 right-panel">
						<div class="headerslider" style="margin-top: 30px;">
							<div class="slider-wrapper theme-default">
								<div id="slider" class="nivoSliderheaderContainer">
									<img src="<?php echo $this->config->item('base_url'); ?>assets/images/new1.jpg" style="width: 100%;">
									<img src="<?php echo $this->config->item('base_url'); ?>assets/images/new2.jpg" style="width: 100%;">
									<img src="<?php echo $this->config->item('base_url'); ?>assets/images/new3.jpg" style="width: 100%;">
									<img src="<?php echo $this->config->item('base_url'); ?>assets/images/new4.jpg" style="width: 100%;">
									<img src="<?php echo $this->config->item('base_url'); ?>assets/images/new5.jpg" style="width: 100%;">
									<img src="<?php echo $this->config->item('base_url'); ?>assets/images/new6.jpg" style="width: 100%;">
								</div>
							</div>
						</div>
					</div>
				</div>
			<!-- </div> -->
		</div>
	</div>
	<!-- OTP Modal -->
	<div class="modal fade" id="otpModal" tabindex="-1" role="dialog" aria-labelledby="otpModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<form id="otpForm">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close clx" data-dismiss="modal">&times;</button>
						<h4 class="modal-title">OTP Verification</h4>
					</div>
					<div class="modal-body">
						<p>Please enter the OTP sent to your phone:</p>
						<input type="text" name="otp" id="otp" class="form-control" placeholder="Enter OTP" required>
						<div id="otpStatus" class="text-center" style="margin-top: 10px;"></div>
					</div>
					<div class="modal-footer">
						<button id="otp_confirm" class="btn btn-success">Verify & Submit</button>
						<button type="button" class="btn btn-secondary clx" data-dismiss="modal">Cancel</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>

<script type="text/javascript">
	$(window).load(function() {
		var $ = jQuery.noConflict();
		$('#slider').nivoSlider();
	});

	$(document).ready(function() {
		var $ = jQuery.noConflict();
		$("#company").on("input", function() {
			let company_val = $(this).val().replace(/[^A-Za-z\s]/g, "");
			$(this).val(company_val);
			// Validation check
			if (!/^[A-Za-z\s]+$/.test(company_val) && company_val.length > 0) {
				$("#companyError").text("Company name should contain only letters and spaces.");
			} else {
				$("#companyError").text("");
			}
		});

		$("#gst").on("input", function() {
			let gst_val = $(this).val().replace(/[^a-zA-Z0-9]/g, "");
			gst_val = gst_val.toUpperCase();
			$(this).val(gst_val);

			// GST Format validation (15 characters)
			let gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

			if (!gstRegex.test(gst_val) && gst_val.length > 0) {
				$("#gstError").text("Enter a valid GST number (15 characters).");
			} else {
				$("#gstError").text("");
			}
		});

		$("#mobile").on("input", function() {
			let mobile_val = $(this).val().replace(/\D/g, "");
			mobile_val = mobile_val.slice(0, 10);
			$(this).val(mobile_val);
			if (!/^[6-9]\d{9}$/.test(mobile_val) && mobile_val.length > 0) {
				$("#mobileError").text("Enter a valid 10-digit mobile number.");
			} else {
				$("#mobileError").text("");
			}
		});

		// $("#mobile").on("input", function() {
		// 	if (!/^[6-9]\d{9}$/.test($(this).val().trim())) {
		// 		$("#mobileError").text("Enter a valid 10-digit mobile number.");
		// 	} else {
		// 		$("#mobileError").text("");
		// 	}
		// });

		// AJAX submit
		$("#submitBtn").on("click", function() {
			var $ = jQuery.noConflict();
			if ($("#companyError").text() || $("#gstError").text() || $("#mobileError").text()) {
				alert("Please fix the errors before submitting.");
				return;
			}

			if ($("#company").val().trim() === "" || $("#mobile").val().trim() === "" || $("#gst").val().trim() === "" || $("#country").val().trim() === "") {
				alert("Please enter all required values.");
				return;
			}

			// $.ajax({
			// 	type: "POST",
			// 	dataType: "json",
			// 	url: "<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/delivery_confirm",
			// 	data: {
			// 		mobile: $("#mobile").val().trim()
			// 	},
			// 	success: function(data) {
			// 		// $('.GifLoader').hide();
			// 		if (data.status == 'success') {
			// 			$('#otpModal').modal('show');
			// 		}
			// 	}
			// });

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/get_number_gst",
				data: {
					mobile: document.getElementById('mobile').value,
					gst: document.getElementById('gst').value
				},
				async: false,
				success: function(data) {
					if (data.status.status === 'success') {
						delivery_confirm();
					} else {
						alert(data.status.message);
						// location.reload();
					}
				}
			});

		});
		$("#country").change(function() {
			var iso = $(this).find('option:selected').data('iso');
			var flagUrl = 'https://flagcdn.com/w320/' + iso.toLowerCase() + '.png';
			$("#country-flag").attr("src", flagUrl);
		});
		$("#country").trigger("change");
	});

	function save_form() {
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/quotation_confirm",
			data: {
				company: $("#company").val().trim(),
				gst: $("#gst").val().trim(),
				mobile: $("#mobile").val().trim(),
				country: $("#country").val().trim()
			},
			success: function(data) {
				if (data.status) {
					alert(data.message);
					location.reload();
				}
			},
			error: function() {
				alert("Something went wrong. Please try again.");
			}
		});
	}

	function delivery_confirm() {
		var $ = jQuery.noConflict();
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_client_main/quotation_otp_send",
			data: {
				mobile: $("#mobile").val().trim()
			},
			success: function(data) {
				// $('.GifLoader').hide();
				if (data.status == 'success') {
					$('#otpModal').modal('show');
				}
			}
		});
	}

	$(document).ready(function() {
		var $ = jQuery.noConflict();
		$('#otp_confirm').on('click', function(e) {
			e.preventDefault();

			const otp = $('#otp').val().trim();
			$('#otpStatus').html('Verifying...').css('color', '#333');

			$.ajax({
				url: "<?php echo base_url(); ?>index.php/<?php echo $controller_name; ?>/delivery_otp_verify",
				method: "POST",
				data: {
					otp: otp
				},
				success: function(response) {
					response = JSON.parse(response);
					// const result = response.trim();
					if (response.success === true) {
						$('#otpStatus').html('<span style="color:green;">OTP Verified!</span>');

						setTimeout(() => {
							save_form();
							$('#otpModal').modal('hide');
							$('#otpStatus').html('');
							$('#otp').val('');
						}, 1000);
					} else {
						$('#otpStatus').html('<span style="color:red;">Invalid OTP</span>');
					}
				},
				error: function() {
					$('#otpStatus').html('<span style="color:red;">Server error</span>');
				}
			});
		});
	});
</script>