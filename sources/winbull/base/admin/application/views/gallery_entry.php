<?php
$this->load->view('include/header.php');
$this->load->helper('common');
?>

<!-- AJAX LOADER -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>


<script type="text/javascript">
	function checkDimensions(file) {
		var deferred = $.Deferred();
		var img = new Image();
		var _URL = window.URL || window.webkitURL;
		img.src = _URL.createObjectURL(file);
		img.onload = function() {
			var valid = false;
			var msg = "";
			
			if (this.width == 355 && this.height == 355) {
				valid = true;
			} else {
				msg = "Image must be 355 x 355 pixels.";
			}
			
			if (!valid) {
				showFlashMessage(null, msg);
			}
			deferred.resolve(valid);
		};
		img.onerror = function() {
			deferred.resolve(false);
		}
		return deferred.promise();
	}

	function previewAdvImage(event) {
		var input = event.target;
		var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
		if (!allowedExtensions.exec(input.value)) {
			showFlashMessage(null, 'Invalid file type. Only JPG and PNG are allowed.');
			input.value = '';
			document.getElementById('gal_img_preview').src = '';
			imageValid = false;
			return false;
		}

		if (input.files && input.files[0]) {
			var file = input.files[0];
			var fileSize = file.size / 1024 / 1024; // in MB
			if (fileSize > 2) {
				showFlashMessage(null, 'File size exceeds 2 MB.');
				input.value = '';
				document.getElementById('gal_img_preview').src = '';
				imageValid = false;
				return false;
			}
			
			// Check dimensions
			checkDimensions(file).then(function(isValid){
				if(!isValid) {
					input.value = '';
					document.getElementById('gal_img_preview').src = '';
					imageValid = false;
					return;
				}
				
				imageValid = true;
				// If valid, show preview
				var reader = new FileReader();
				reader.onload = function(e) {
					var imgPreview = document.getElementById('gal_img_preview');
					imgPreview.src = e.target.result;
					imgPreview.style.width = '300px'; 
					imgPreview.style.height = '300px';
				};
				reader.readAsDataURL(file);
			});
		}
	}

	var imageValid = true;

	// ... existing utility functions ...

	function sendsms() {
		var title = document.getElementById('gal_name').value;
		if (title != "") {
			sendsmsText();
		}

		if (title == "") {
			showToast("Name field is Empty", 'danger');
		}
	}

	function sendsmsText() {
		var title = document.getElementById('gal_name').value;
		$.ajax({
			type: "POST",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_gallery/create_pushnotification",
			data: "title=" + title,
			success: function(data) {
				console.log(JSON.parse(data));
				data = JSON.parse(data);
				if (data.success == 1) {
					showToast("Notification Send Successfully", 'success');
				}
			},
			error: function(request, error) {
				showToast("OOPS! something error", 'danger');
			}
		});
	}

	// ... 

	let originalGalName = "<?php echo isset($gal_name) ? $gal_name : ''; ?>";
	let galId = "<?php echo isset($gal_id) ? $gal_id : '0'; ?>";

	$(document).ready(function() {

		$("#ajax_loader").removeClass("show");

		$('#gal_name').on('blur', function() {
			var galName = $(this).val().trim();
			if(galName && galName !== originalGalName) {
				$.ajax({
					url: '<?php echo $this->config->item('base_url'); ?>index.php/C_gallery/check_duplicate_name',
					type: 'POST',
					data: {gal_name: galName, gal_id: galId},
					success: function(response) {
						var data = JSON.parse(response);
						if(data.exists) {
							showFlashMessage(null, 'Gallery name already exists!');
							$('#gal_name').val('');
						}
					}
				});
			}
		});

		$("#btn_submit").on("click", function(e) {
			e.preventDefault(); // Control submission manually

			let name = $.trim($("#gal_name").val());
			let type = $("#gal_type").val();
			let fileInput = document.getElementById('gal_location');
			let file = fileInput.value;
			let status = $("input[name='fv[gal_status]']:checked").val();
			let mode = "<?= $type ?>"; // add_new / edit

			if (!validateForm(e, document.getElementById('iframeForm'))) {
				return false;
			}

			if (name === "" || name.length < 3) {
				showFlashMessage(null, "Gallery Name must be at least 3 characters.");
				return false;
			}

			if (type === "") {
				showFlashMessage(null, "Please select Gallery Type");
				return false;
			}

			if (typeof status === "undefined") {
				showFlashMessage(null, "Please select Active status");
				return false;
			}

			// Require image in ADD MODE
			if (mode === "add_new" && file === "") {
				showFlashMessage(null, "Please upload a Gallery Image");
				return false;
			}

			// In edit mode, if file is selected, it must be valid
			if (file !== "") {
				if (!imageValid) {
					showFlashMessage(null, "Uploaded image is invalid.");
					return false;
				}
				// Async check again if needed, similar to advertisements logic
				// But since we set `imageValid` flag in preview, we can rely on it if user hasn't changed file
				// Wait, if user selected file then cleared it (invalid), `file` would be empty.
				// If `file` is NOT empty here, `imageValid` should be true.
				
				// Re-verify dimensions async before submit to be safe
				if (fileInput.files && fileInput.files[0]) {
					checkDimensions(fileInput.files[0]).then(function(isValid){
						if(isValid) {
							$("#iframeForm").submit();
						}
					});
					return false;
				}
			}

			// Proceed if edit mode and no new file, or add mode and file is valid
			$("#iframeForm").submit();
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

	.table {
		margin-bottom: 0px !important;
	}
</style>

<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry-->
							<!-- <a href="<?php echo $this->config->item('base_url') ?>index.php/C_gallery/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>  -->
						</h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['gal_id'] == NULL ? NULL : $_POST['fv']['gal_id'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm');
						//Opening form
						echo form_open_multipart('C_gallery/DB_Controller/gallery_model/' . $status . '/' . $id, $attributes); ?>
						<div class="form-sample">
							<p class="card-description card-description1 quick2">Gallery</p>
							<?php
							if (isset($db_error_msg) && $db_error_msg != '') {
								echo '<div class="alert alert-danger">
											<a href="#" class="close" data-dismiss="alert">&times;</a>
											<strong>Warning!</strong> ' . $db_error_msg . '
											</div>';
							}

							?>
							<!-- Gallery Name -->
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gallery Name *</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" id="gal_name" name="fv[gal_name]"
												value="<?= $gal_name ?>" maxlength="50" minlength="3" required onkeydown="validateKeyPress(event, this,4)" data-no-numbers-only>
										</div>
									</div>
								</div>
							</div>

							<!-- Gallery Type -->
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gallery Type *</label>
										<div class="col-sm-7">
											<select class="form-control" id="gal_type" name="fv[gal_type]">
												<option value="0" <?= $gal_type == 0 ? "selected" : "" ?>>GOLD BAR</option>
												<option value="1" <?= $gal_type == 1 ? "selected" : "" ?>>SILVER BAR</option>
											</select>
										</div>
									</div>
								</div>
							</div>

							<!-- File Upload -->
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Upload Image *</label>
										<div class="col-sm-7">
											<input type="file" class="form-control" id="gal_location" name="gal_location"
												accept="image/png,image/jpg,image/jpeg,image/gif"
												onchange="previewAdvImage(event)">
											<span class="help-block">Required Size: 355 × 355 (Max 2MB)</span>
										</div>
									</div>
								</div>
							</div>

							<!-- Preview -->
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Image</label>
										<div class="col-sm-7">
											<img src="<?php echo $gal_img; ?>" width="300px" height="300px" id="gal_img_preview" />
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>

							<!-- Status -->
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[gal_status]',
												[
													1 => ['label' => 'Yes', 'id' => 'gal_status'],
													0 => ['label' => 'No', 'id' => 'gal_statusoff']
												],
												$gal_status,
												'To enable/disable gallery image.'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>

							<!-- Buttons -->
							<div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<button type="button" class="btn btn1 btn-success btn-md btn-md1" id="btn_submit">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="button" class="btn btn1 btn-success btn-md btn-md1" id="btn_submit">Save</button>
									<?php } ?>
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-4">

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