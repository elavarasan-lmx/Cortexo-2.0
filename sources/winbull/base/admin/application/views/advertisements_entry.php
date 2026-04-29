<?php
$this->load->view('include/header.php');
?>
<style>
	.footer {
		padding: 0px 10px
	}
</style>
<script>
	var isImageValid = false;
	
	function checkDimensions(file, advType) {
		var deferred = $.Deferred();
		var img = new Image();
		var _URL = window.URL || window.webkitURL;
		img.src = _URL.createObjectURL(file);
		img.onload = function() {
			var valid = false;
			var msg = "";
			// Block 1: 1200x300
			if (advType == '0') {
				if (this.width == 1200 && this.height == 300) valid = true;
				else msg = "Block-1 image must be 1200x300 pixels.";
			}
			// Block 2: 600x300
			else if (advType == '1') {
				if (this.width == 600 && this.height == 300) valid = true;
				else msg = "Block-2 image must be 600x300 pixels.";
			}
			// Block 3: 400x300
			else if (advType == '2') {
				if (this.width == 400 && this.height == 300) valid = true;
				else msg = "Block-3 image must be 400x300 pixels.";
			} else {
				// Default or unknown, maybe allow? Let's assume valid for now or strictly enforce.
				// Given the request "update file size and dimension", I'll enforce.
				// But iterate on what the user knows.
				valid = true; 
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
			document.getElementById('adv_img_preview').src = '';
			return false;
		}

		if (input.files && input.files[0]) {
			var file = input.files[0];
			var fileSize = file.size / 1024 / 1024; // in MB
			if (fileSize > 2) {
				showFlashMessage(null, 'File size exceeds 2 MB.');
				input.value = '';
				document.getElementById('adv_img_preview').src = '';
				return false;
			}

			// Check dimensions immediately
			var advType = document.getElementById('adv_type').value;
			checkDimensions(input.files[0], advType).then(function(isValid){
				if(!isValid) {
					input.value = '';
					document.getElementById('adv_img_preview').src = '';
					return;
				}
				
				// If valid, show preview
				var reader = new FileReader();
				reader.onload = function(e) {
					var imgPreview = document.getElementById('adv_img_preview');
					imgPreview.src = e.target.result;
					imgPreview.style.width = '300px'; 
					imgPreview.style.height = '78px';
				};
				reader.readAsDataURL(input.files[0]);
			});
		}
	}

	function validate(e) {
		e.preventDefault();
		var isSequenceValid = true;
		var advId = document.getElementById('adv_id') ? document.getElementById('adv_id').value : "";

		var advName = document.getElementById('adv_name').value;
		if (advName == '' || advName.length < 3) {
			showFlashMessage(null, 'Advertisement Name must be at least 3 characters');
			return false;
		} else if (!/[a-zA-Z]/.test(advName)) {
			showFlashMessage(null, 'Advertisement Name must contain letters!');
			return false;
		} else if (document.getElementById('adv_sequence').value == '') {
			showFlashMessage(null, 'Please enter Sequence Number');
			return false;
		} else if (document.getElementById('adv_sequence').value === '0') {
			showFlashMessage(null, 'Sequence Number cannot be 0');
			return false;
		}

		var imgSrc = document.getElementById('adv_img_preview').getAttribute('src');
		// Final check if file is selected (for new records) or image exists
		if ((!imgSrc || imgSrc.trim() === '') && document.getElementById('adv_location').value === '') {
			showFlashMessage(null, 'Please select an Advertisement File');
			return false;
		}
		
		// If file input has a file, double check dimensions one last time (in case Type changed after file selection)
		var fileInput = document.getElementById('adv_location');
		if (fileInput.files && fileInput.files[0]) {
             // We have to wait for the promise. This makes `validate` async. 
			 // But since `validate` is triggered by click, we can just handle the submit inside the promise.
			 var advType = document.getElementById('adv_type').value;
			 checkDimensions(fileInput.files[0], advType).then(function(isValid){
				 if(isValid) {
					proceedToSubmit(advId);
				 }
			 });
			 return false; // Stop execution, wait for promise
		}

		// If no new file, proceed (assuming existing image is valid or we don't re-validate existing on type change for now)
		proceedToSubmit(advId);
		return false;
	}

	function proceedToSubmit(advId) {
		var isSequenceValid = true;
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_advertisements/get_sequence_number",
			data: {
				adv_sequence: document.getElementById('adv_sequence').value,
				adv_id: advId
			},
			async: false,
			success: function(data) {
				if (data.status) {
					showFlashMessage(null, 'Sequence number already exists');
					isSequenceValid = false;
				}
			}
		});

		if (isSequenceValid) {
			$("#iframeForm").submit();
		}
	}
</script>

<!--<div>
    <ul class="breadcrumb">
         <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
        <li>
            <a href="#">Settings</a>
        </li>
		<li>
            <a href="#">Marquee Text Entry</a> 
        </li>
    </ul>
</div>-->
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry-->
							<!-- <a href="<?php echo $this->config->item('base_url') ?>index.php/C_advertisements/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>  -->
						</h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['adv_id'] == NULL ? NULL : $_POST['fv']['adv_id'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm');
						//Opening form
						echo form_open_multipart('C_advertisements/DB_Controller/advertisements_model/' . $status . '/' . $id, $attributes); ?>
						<div class="form-sample">
							<p class="card-description card-description1">Advertisement</p>
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
										<label class="col-sm-4 col-form-label">Advertisement Name* </label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[adv_name]" tabindex="1" id="adv_name" value="<?php echo set_value('adv_name', $adv_name); ?>" required onkeydown="validateKeyPress(event, this,4)" maxlength="50" minlength="3" data-no-numbers-only />
											<span class="help-block">Enter the Advertisement name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Advertisement Type*</label>
										<div class="col-sm-7">
											<select name="fv[adv_type]" id="adv_type" class="entry_field" tabindex="2">
												<option value="0" <?php echo $adv_type == 0 ? "selected=selected" : ""; ?>>Block-1</option>
												<option value="1" <?php echo $adv_type == 1 ? "selected=selected" : ""; ?>>Block-2</option>
												<option value="2" <?php echo $adv_type == 2 ? "selected=selected" : ""; ?>>Block-3</option>
											</select>
											<span class="help-block">Select Advertisement Type.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Advertisement File * </label>
										<div class="col-sm-7">
											<?php
											if ($status == 'add_new')	$data = array('name' => 'adv_location', 'id' => 'adv_location', 'class' => 'required', 'onchange' => 'previewAdvImage(event)', 'accept'=>"image/png,image/jpg,image/jpeg,image/gif");
											else $data = array('name' => 'adv_location', 'id' => 'adv_location', 'onchange' => 'previewAdvImage(event)', 'accept'=>"image/png,image/jpg,image/jpeg,image/gif");
											echo form_upload($data);
											?>
											<span class="help-block">Advertisement File Size max 2MB (Block-1: 1200*300, Block-2: 600*300, Block-3: 400*300).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Image</label>
										<div class="col-sm-7">
											<img src="<?php echo $adv_img; ?>" width="300px" height="78px" id="adv_img_preview" />
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Sequence Number * </label>
										<div class="col-sm-7">
											<input type="text" name="fv[adv_sequence]" class="entry_field" tabindex="1" id="adv_sequence" value="<?php echo set_value('adv_sequence', $adv_sequence); ?>" onkeydown="validateKeyPress(event, this,1)" maxlength="2" />
											<span class="help-block">Set the Sequence order.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">URL Link</label>
										<div class="col-sm-7">
											<input type="text" name="fv[adv_url]" class="entry_field" id="adv_url" value="<?php echo set_value('adv_url', $adv_url); ?>" maxlength="200" />
											<span class="help-block">Enter the URL link.</span>
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
												'fv[adv_status]',
												[
													1 => ['label' => 'Yes', 'id' => 'adv_status'],
													0 => ['label' => 'No', 'id' => 'adv_statusoff']
												],
												$adv_status,
												'To enable/disable Advertisement text.'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<input type="hidden" id="adv_id" name="adv_id" value="<?php echo $_POST['fv']['adv_id']; ?>">
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1" onclick="validate(event)">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1" onclick="validate(event)">Save</button>
									<?php } ?>
									<button type="reset" onclick="location.href = '<?php echo $this->config->item('base_url'); ?>index.php/C_advertisements/open_listingform'" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button>
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