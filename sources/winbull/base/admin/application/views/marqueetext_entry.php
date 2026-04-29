<?php $this->load->view('include/header.php');
$this->load->helper('common');

?>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.0/tinymce.min.js"></script>
<script type="text/javascript">
	function blockSpecialChar(e) {
		var k;
		document.all ? k = e.keyCode : k = e.which;
		return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 44 && k <= 57));
	}
	// tinyMCE.init({
	// 		// General options
	// 		mode : "textareas",
	// 		theme : "advanced",
	// 	}); 
	tinymce.init({
		selector: "#mrq_text",
		setup: function(editor) {
			var max = 250;
			editor.on('KeyDown', function(e) {
				var len = tinymce.get('mrq_text').getContent({
					format: 'text'
				}).trim().length;
				if (len >= max && e.keyCode !== 8 && e.keyCode !== 46) {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}
			});
			editor.on('KeyUp Change', function(e) {
				var text = tinymce.get('mrq_text').getContent({
					format: 'text'
				}).trim();
				var len = text.length;
				if (len > max) {
					var truncated = text.substring(0, max);
					editor.setContent(truncated);
					len = max;
				}
				$('#char_count').text(len + " / " + max);
			});
		},
		init_instance_callback: function(editor) {
			var text = editor.getContent({
				format: 'text'
			}).trim();
			$('#char_count').text(text.length + " / 250");
		}
	});

	$(document).ready(function() {
		const SITE_URL = "<?= site_url(); ?>";


		$("#marquee").on("submit", function(e) {
			e.preventDefault();

			tinymce.triggerSave();

			var content = tinymce.get("mrq_text").getContent({
				format: "text"
			}).trim();
			if (content === "") {
				toastr.options.positionClass = "toast-top-right";
				showToast("Marquee text cannot be empty.", 'error'); // P-ALERT fix
				return false;
			}
			if (content.length > 250) {
				showToast("Marquee text cannot exceed 250 characters.", 'error'); // P-ALERT fix
				return false;
			}

			let form = $(this);
			let btn = form.find('button[type="submit"]');

			btn.prop("disabled", true).text("Saving...");
			$("#ajax_loader").addClass("show"); // show loader

			$.ajax({
				url: form.attr("action"),
				type: "POST",
				data: form.serialize(),
				dataType: "json",
				success: function(response) {
					$("#ajax_loader").removeClass("show"); // hide loader
					btn.prop("disabled", false).text("Save");

					if (response.status === "success") {
						btn.prop("disabled", true).text("Save");
						if (response.toast.type === "error") {
							showToast(response.toast.message || "Settings saved successfully!", 'success'); // P-ALERT fix
						}
						response.toast
						// setTimeout(function() {
						window.location.href = SITE_URL + "/C_marqueetext/open_listingform";
						// }, 1000);
					} else {
						showToast(response.toast.message || "Failed to save settings. Please try again.", 'error'); // P-ALERT fix
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show"); // hide loader
					btn.prop("disabled", false).text("Save");
					showToast("Server error: " + error, 'error'); // P-ALERT fix
				}
			});
		});
	});
</script>
<style>
	.footer {
		padding: 0px 10px
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
						<h4 class="card-title"><a href="<?php echo $this->config->item('base_url') ?>index.php/C_marqueetext/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['mrq_sno'] == NULL ? NULL : $_POST['fv']['mrq_sno'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'marquee');
						//Opening form
						echo form_open('C_marqueetext/DB_Controller/marqueetext_model/' . $status . '/' . $id, $attributes); ?>
						<form class="form-sample">
							<p class="card-description card-description1">Marquee Text</p>
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
										<label class="col-sm-4 col-form-label">Marquee Text *</label>
										<div class="col-sm-7">
											<textarea style="width:800px; height:400px" class="form-control" id="mrq_text" name="fv[mrq_text]" maxlength="250"><?php echo set_value('mrq_text', $mrq_text); ?></textarea>
											<div id="char_count" style="text-align: right; color: #888;">0 / 250</div>
											<span class="help-block">Enter the marquee text.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[mrq_active]',
												[
													1 => ['label' => 'Yes', 'id' => 'mrq_active_yes'],
													0 => ['label' => 'No', 'id' => 'mrq_active_no']
												],
												$mrq_active,
												'To enable/disable marquee text.'
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
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1 saveBtn">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1 saveBtn">Save</button>
									<?php } ?>
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">

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