<?php $this->load->view('include/header.php');
$model_name = "Adminrpanel_model";
?>
<style>
	.footer {
		padding: 0px 10px
	}
</style>

<script>
	const SITE_URL = "<?= site_url(); ?>";
	$(document).ready(function() {
		$("#ajax_loader").addClass("show");

		// Hide loader after AJAX completes
		$("#ajax_loader").removeClass("show");

		// AJAX form submit
		$("#rpanel_entry_form").on("submit", function(e) {
			e.preventDefault();

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

					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Save");

					if (response.status === "success") {
						window.location.href = SITE_URL + "/C_main/load_mainpage";
					} else {
						showToast(response.message || "Operation failed!", "danger");
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Save");
					showToast("Server error: " + error, "danger");
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
						<?php
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'rpanel_entry_form', 'name' => 'rpanel_entry_form', 'novalidate' => 'true', 'onsubmit' => 'return validateForm(event, this)');
						//Opening form
						echo form_open('C_admin_rpanel/DB_Controller/adminrpanel_model/edit/1', $attributes);
						?>
						<form class="form-sample">
							<!-- <p class="card-description card-description1">RPanel Settings</p> -->
							<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> RPanel Settings </h4>
							<?php $is_readonly = ($userrights["edit"] != 1 && $userrights["add"] != 1); ?>
							<fieldset <?php if ($is_readonly) echo 'disabled'; ?>>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gold Weight*</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" id="rpsg_weight" name="fv[rpsg_weight]" tabindex="1" value="<?php echo set_value('rpsg_weight', $rpsg_weight); ?>" placeholder="" onkeydown="validateKeyPress(event, this,2,10,3)" required min="0.001" /><!-- BZ-06: Fixed keypress params to allow 6 integer digits + 3dp -->
											<span class="help-block">Enter the gold weight (Grams).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Silver Weight*</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" id="rpss_weight" name="fv[rpss_weight]" tabindex="2" value="<?php echo set_value('rpss_weight', $rpss_weight); ?>" placeholder="" onkeydown="validateKeyPress(event, this,2,10,3)" required min="0.001" /><!-- BZ-06: Fixed keypress params to allow 6 integer digits + 3dp -->
											<span class="help-block">Enter the silver weight (Grams).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Gold Round Off*</label>
										<div class="col-sm-7">
											<select class="form-control" name="fv[rpsg_roundoff]" id="rpsg_roundoff">
												<option value="0.00" <?php echo $rpsg_roundoff == 0.00 ? "selected=selected" : ""; ?>>0 Ps</option>
												<option value="0.05" <?php echo $rpsg_roundoff == 0.05 ? "selected=selected" : ""; ?>>5 Ps</option>
												<option value="0.25" <?php echo $rpsg_roundoff == 0.25 ? "selected=selected" : ""; ?>>25 Ps</option>
												<option value="0.5" <?php echo $rpsg_roundoff == 0.5 ? "selected=selected" : ""; ?>>50 Ps</option>
												<option value="0.75" <?php echo $rpsg_roundoff == 0.75 ? "selected=selected" : ""; ?>>75 Ps</option>
												<option value="1" <?php echo $rpsg_roundoff == 1 ? "selected=selected" : ""; ?>>1 Rs</option>
												<option value="5" <?php echo $rpsg_roundoff == 5 ? "selected=selected" : ""; ?>>5 Rs</option>
												<option value="10" <?php echo $rpsg_roundoff == 10 ? "selected=selected" : ""; ?>>10 Rs</option>
												<option value="25" <?php echo $rpsg_roundoff == 25 ? "selected=selected" : ""; ?>>25 Rs</option>
												<option value="50" <?php echo $rpsg_roundoff == 50 ? "selected=selected" : ""; ?>>50 Rs</option>
												<option value="75" <?php echo $rpsg_roundoff == 75 ? "selected=selected" : ""; ?>>75 Rs</option>
												<option value="100" <?php echo $rpsg_roundoff == 100 ? "selected=selected" : ""; ?>>100 Rs</option>
											</select>
											<span class="help-block">Choose the Gold round off (Paise).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Silver Round Off*</label>
										<div class="col-sm-7">
											<select class="form-control" name="fv[rpss_roundoff]" id="rpss_roundoff">
												<option value="0.00" <?php echo $rpss_roundoff == 0.00 ? "selected=selected" : ""; ?>>0 Ps</option>
												<option value="0.05" <?php echo $rpss_roundoff == 0.05 ? "selected=selected" : ""; ?>>5 Ps</option>
												<option value="0.25" <?php echo $rpss_roundoff == 0.25 ? "selected=selected" : ""; ?>>25 Ps</option>
												<option value="0.5" <?php echo $rpss_roundoff == 0.5 ? "selected=selected" : ""; ?>>50 Ps</option>
												<option value="0.75" <?php echo $rpss_roundoff == 0.75 ? "selected=selected" : ""; ?>>75 Ps</option>
												<option value="1" <?php echo $rpss_roundoff == 1 ? "selected=selected" : ""; ?>>1 Rs</option>
												<option value="5" <?php echo $rpss_roundoff == 5 ? "selected=selected" : ""; ?>>5 Rs</option>
												<option value="10" <?php echo $rpss_roundoff == 10 ? "selected=selected" : ""; ?>>10 Rs</option>
												<option value="25" <?php echo $rpss_roundoff == 25 ? "selected=selected" : ""; ?>>25 Rs</option>
												<option value="50" <?php echo $rpss_roundoff == 50 ? "selected=selected" : ""; ?>>50 Rs</option>
												<option value="75" <?php echo $rpss_roundoff == 75 ? "selected=selected" : ""; ?>>75 Rs</option>
												<option value="100" <?php echo $rpss_roundoff == 100 ? "selected=selected" : ""; ?>>100 Rs</option>
											</select>
											<span class="help-block">Choose the round off (Paise).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							</fieldset><!-- BZ-46: End disabled fieldset -->
							<div class="row form-sample1">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if ($userrights["edit"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } else if ($userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<?php } ?>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
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