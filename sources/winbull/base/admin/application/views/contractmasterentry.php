<?php
$this->load->view("include/header");
$this->load->helper('common');
?>
<script type="text/javascript">
	$(document).ready(function() {

		$("#submitsave").on("click", function(e) {
			e.preventDefault();

			const form = document.getElementById("iframeForm");
			if (!form.reportValidity()) {
				return; // stop if required fields fail
			}
			$("#ajax_loader").addClass("show");
			$.ajax({
				url: "<?php echo $this->config->item('base_url'); ?>index.php/C_contract_master/get_rpanel_data",
				type: "GET",
				dataType: "json",
				data: "",
				async: false,
				success: function(data) {
					$("#ajax_loader").removeClass("show");
					//console.log(data);
					if (data[0]['rate_display'] == 1) {
						$('#rpanelrateoff').modal('show');
					} else if (data[0]['rate_display'] == 0) {
						//alert('babu');

						window.location = "<?php echo base_url() ?>index.php/C_contract_master/openlist_form/";
						$("form").submit();

					} else {
						$("form").submit();
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					showToast("Server error: " + error, 'error'); // P-ALERT fix
				}
			});
		});
		$("#rpaneloff").on("click", function(e) {
			e.preventDefault();
			window.location = "<?php echo base_url() ?>index.php/C_contract_master/enable_rpanelrateon/0";
			$("form").submit();
		});
		$("#rpanelon").on("click", function(e) {
			e.preventDefault();
			window.location = "<?php echo base_url() ?>index.php/C_contract_master/enable_rpanelrateon/1";
			$("form").submit();
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
<div class="modal fade" id="rpanelrateoff" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close clx" data-bs-dismiss="modal">×</button>
				<h3>R-Panel rate close alert!</h3>
			</div>
			<div class="modal-body">
				<!-- <p>You are about to close the R Panel rate.?</p> -->
				<p>Would you like to save the Contract Details with R-Panel rate On/Off?</p>
				<div><b>ON</b> -> R-Panel rate is on.</div>
				<div><b>OFF</b> -> R-panel rate is off.</div>
				<div><b>Cancel</b> -> Just to close this dialog box.</div>
			</div>

			<div class="modal-footer flex-column">
				<div class="d-flex justify-content-between w-100 mb-2">
					<a id="rpaneloff" href="<?php echo base_url() ?>index.php/C_contract_master/enable_rpanelrateon/1" class="btn btn-success w-50 me-1">ON</a>
					<a id="rpanelon" href="<?php echo base_url() ?>index.php/C_contract_master/enable_rpanelrateoff/0" class="btn btn-danger w-50 ms-1">OFF</a>
				</div>
				<button type="button" class="btn btn-primary w-100" data-bs-dismiss="modal">Cancel</button>
			</div>
		</div>
	</div>
</div>
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
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry-->
							<!-- <a href="<?php echo $this->config->item('base_url') ?>index.php/C_contract_master/openlist_form" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> -->
						</h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['contract_id'] == NULL ? NULL : $_POST['fv']['contract_id'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm');
						//Opening form
						echo form_open_multipart('C_contract_master/DB_Controller/contractmodel/' . $status . '/' . $id, $attributes);
						?>
						<form class="form-sample">
							<p class="card-description card-description1">Contract Master Details</p>
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
										<label class="col-sm-4 col-form-label">Contract Symbol*</label>
										<div class="col-sm-7">
											<select name="fv[contract_symbol]" id="contract_symbol" class="form-control" required>
									<option value="">-- Select Symbol --</option>
									<?php
									$model_name = "contractmodel";
									$customers = $this->$model_name->get_contractdata()->result_array();
									foreach ($customers as $customer) {
										$sel = ($customer['contract_symbol'] == $contract_symbol) ? 'selected="selected"' : '';
										echo "<option value='" . htmlspecialchars($customer['contract_symbol'], ENT_QUOTES) . "' {$sel}>" . htmlspecialchars($customer['contract_symbol'], ENT_QUOTES) . "</option>";
									}
									?>
								</select>
											<span class="help-block">Select Contract.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">R-Panel Display Name *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[displayname]" id="displayname" value="<?php echo set_value('displayname', $displayname); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,6)" required maxlength="20" />
											<span class="help-block">Enter the R-Panel display name.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Type*</label>
										<div class="col-sm-7">
											<select name="fv[ctype]" id="ctype" class="form-control">
												<option value="1" <?php echo $ctype == 1 ? "selected=selected" : ""; ?>>MCX</option>
												<option value="2" <?php echo $ctype == 2 ? "selected=selected" : ""; ?>>Bank</option>
												<option value="3" <?php echo $ctype == 3 ? "selected=selected" : ""; ?>>Others</option>
											</select>
											<span class="help-block">Select Type .</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">R-Panel Contract Display Order *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[displayorder]" id="displayorder" value="<?php echo set_value('displayorder', $displayorder); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,1)" maxlength="2" required />
											<span class="help-block">Enter the Display order.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Userpage Display name *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[userpage_displayname]" id="userpage_displayname" class="form-control" value="<?php echo set_value('userpage_displayname', $userpage_displayname); ?>" onkeydown="validateKeyPress(event, this,6)" maxlength="20" required />
											<span class="help-block">Enter User Page Displayname .</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">User page Display order *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[userpage_disp_order]" id="userpage_disp_order" value="<?php echo set_value('userpage_disp_order', $userpage_disp_order); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,1)" maxlength="2" required />
											<span class="help-block">Enter the Display order.</span>
										</div>
									</div>
								</div>

							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">R-Panel Contract Status*</label>
										<div class="col-sm-7">

											<?php render_radio_group(
												'fv[status]',
												[
													1 => ['label' => 'Yes', 'id' => 'status_yes'],
													0 => ['label' => 'No', 'id' => 'status_no']
												],
												$rpanel_status,
												'contract status can be enabled or disabled here'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Userpage Display Status*</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[userpage_status]',
												[
													1 => ['label' => 'Yes', 'id' => 'userpage_status_yes'],
													0 => ['label' => 'No', 'id' => 'userpage_status_no']
												],
												$userpage_status,
												'userpage display Status can be enabled or disabled here'
											); ?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">No of Decimals in User page *</label>
										<div class="col-sm-7">
											<input type="text" name="fv[round_off]" id="round_off" class="form-control" value="<?php echo set_value('round_off', $round_off); ?>" onkeydown="validateKeyPress(event, this,1)" maxlength="1" required />
											<span class="help-block">Decimals places after rate in user page.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">

									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Type*</label>
										<div class="col-sm-7">
											<select name="fv[com_type]" id="com_type" class="form-control" style="    width: 118px;">
												<option value="1" <?php echo $com_type == 1 ? "selected=selected" : ""; ?>>GOLD</option>
												<option value="2" <?php echo $com_type == 2 ? "selected=selected" : ""; ?>>SILVER</option>
											</select>
											<span class="help-block">Select Commodity Type .</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">ArbitraryChartStatus*</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[aribitchart_status]',
												[
													1 => ['label' => 'Yes', 'id' => 'aribitchart_status_yes'],
													0 => ['label' => 'No', 'id' => 'aribitchart_status_no']
												],
												$aribitchart_status,
												'ArbitraryChartStatus can be enabled or disabled here'
											); ?>
										</div>
									</div>
								</div>

							</div>

							<!-- <div class="row form-sample1" style="margin-top:30px;">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<button type="submit"  id="submitsave" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">
									
								</div>
							</div> -->

							<div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<input type="hidden" name="old_displayname" id="old_displayname" value="<?= $displayname ?>">
										<input type="hidden" name="old_userpage_displayname" id="old_userpage_displayname" value="<?= $userpage_displayname ?>">
										<input type="hidden" name="old_displayorder" id="old_displayorder" value="<?= $displayorder ?>">
										<input type="hidden" name="old_userpage_disp_order" id="old_userpage_disp_order" value="<?= $userpage_disp_order ?>">
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1" id="submitsave">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1" id="submitsave">Save</button>
									<?php } ?>
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