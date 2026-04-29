<?php $this->load->view('include/header.php');

?>
<script language="javascript">
	function validate_form() {
		var popName = $('#pop_name').val().trim();
		var fileInput = document.getElementById('pop_image');
		var isEdit = "<?php echo $type; ?>" === "edit";

		if (!validateForm(null, document.getElementById('iframeForm'))) {
			return false;
		}

		if (!popName) {
			showToast('Popup Name is required!', 'danger');
			return false;
		}

		if (!isEdit && fileInput.files.length === 0) {
			showToast('Popup Image is required!', 'danger');
			return false;
		}

		if (fileInput.files.length > 0) {
			var file_size = fileInput.files[0].size;
			if (file_size > 524288) {
				showToast('File too large. File must be less than 500 kilobytes.', 'danger');
				return false;
			}
		}

		return true;
	}

	function submitForm(e) {
		e.preventDefault();
		if (!validate_form()) {
			return false;
		}

		let form = $("#iframeForm");
		let btn = form.find('button[type="submit"]');
		let formData = new FormData(form[0]);

		btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
		$("#ajax_loader").addClass("show");

		$.ajax({
			url: form.attr("action"),
			type: "POST",
			headers: {'X-Requested-With': 'XMLHttpRequest'},
			data: formData,
			processData: false,
			contentType: false,
			dataType: "json",
			success: function(response) {
				$("#ajax_loader").removeClass("show");
				if (response.status === "success") {
					window.location.href = response.redirect;
				} else {
					btn.prop("disabled", false).text("Save");
					showToast(response.message, 'danger');
				}
			},
			error: function(xhr, status, error) {
				$("#ajax_loader").removeClass("show");
				btn.prop("disabled", false).text("Save");
				showToast("Server error: " + error, 'danger');
			}
		});
		return false;
	}

	function previewImage(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$('#imagePreview').html('<img src="' + e.target.result + '" style="max-width:200px;max-height:200px;margin-top:10px;">');
			}
			reader.readAsDataURL(input.files[0]);
		}
	}

	$(document).ready(function() {
		$('#pop_image').change(function() {
			previewImage(this);
			$('#existingImage').hide();
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

<!-- AJAX LOADER -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="col-12 grid-margin">
	<div class="card">
		<div class="card-body">
			<h4 class="card-title">
			</h4>
			<?php
			$status				=	$type;
			$id					=	$_POST['fv']['pop_id'] == NULL ? NULL : $_POST['fv']['pop_id'];
			$attributes 		=	array('class' => 'form-horizontal', 'autocomplete' => 'off', 'id' => 'iframeForm', 'name' => 'iframeForm');
			echo form_open_multipart('C_popup/DB_Controller/popup_model/' . $status . '/' . $id, $attributes); ?>
			<fieldset>
				<div class="form-sample">
					<p class="card-description card-description1">Popup Setting</p>
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
								<label class="col-sm-3 col-form-label">Popup Name*</label>
								<div class="col-sm-8">
									<input type="text" class="form-control" name="fv[pop_name]" tabindex="1" id="pop_name" value="<?php echo set_value('pop_name', $pop_name); ?>" placeholder="" required minlength="3" maxlength="50" onkeydown="validateKeyPress(event, this,4)" data-no-numbers-only />
									<span class="help-block">Enter the popup name.</span>
								</div>
							</div>
						</div>
						<div class="col-md-6">

						</div>
					</div>
					<div class="row form-sample1">
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-3 col-form-label">Popup Image* </label>
								<div class="col-sm-8">
									<input type="file" class="form-control" name="pop_image" id="pop_image" accept="image/png,image/jpg,image/jpeg,image/gif" />
									<?php if (!empty($pop_image)) { ?>
										<div id="existingImage" style="margin-top:10px;"><img src="<?php echo $this->config->item('base_url') . 'assets/img/popup/' . $pop_image; ?>" style="max-width:200px;max-height:200px;" /></div>
									<?php } ?>
									<div id="imagePreview"></div>
									<input type="hidden" name="old_pop_image" value="<?php echo $pop_image ?>" />
									<span class="help-block">Choose the popup image.</span>
								</div>
							</div>
						</div>
						<div class="col-md-6">

						</div>
					</div>
					<div class="row form-sample1">
						<div class="col-md-6">
							<div class="form-group row">
								<label class="col-sm-3 col-form-label">Active</label>
								<div class="col-sm-8">
									<?php render_radio_group(
										'fv[pop_active]',
										[
											1 => ['label' => 'Yes', 'id' => 'pop_active'],
											0 => ['label' => 'No', 'id' => 'pop_inactive']
										],
										$pop_active,
										'To enable/disable marquee text.'
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
								<button type="submit" onclick="submitForm(event)" class="btn btn1 btn-success btn-md btn-md1">Save</button>
							<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
								<button type="submit" onclick="submitForm(event)" class="btn btn1 btn-success btn-md btn-md1">Save</button>
							<?php } ?>
							<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
						</div>
						<div class="col-md-6">

						</div>
					</div>
				</div>
				<?php echo form_close(); ?>
			</fieldset>
		</div>
	</div>
</div>


<?php $this->load->view("include/footer"); ?>
