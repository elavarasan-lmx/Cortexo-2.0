<?php
$this->load->view('include/header.php');
$this->load->helper('common');
$this->load->view('common/confirm_modal.php'); // BZ: Shared confirmation modal
?>
<style>
	.footer {
		padding: 0px 10px
	}
</style>
<script type="text/javascript">
	function updateRowPremium(id) {
		var buyCheck = document.querySelector('input[name="fv[com_group_com][' + id + '][com_buy_active]"]');
		var sellCheck = document.querySelector('input[name="fv[com_group_com][' + id + '][com_sel_active]"]');

		var buyInput = document.getElementById('com_buy_premium' + id);
		var sellInput = document.getElementById('com_sel_premium' + id);

		if (buyInput && buyCheck) {
			buyInput.disabled = !buyCheck.checked;
		}
		if (sellInput && sellCheck) {
			sellInput.disabled = !sellCheck.checked;
		}
	}

	function enableTextField() {
		checkBox = arguments[0];
		type = arguments[1];
		var id = arguments[2];
		if (type == 'sel') {
			textFieldName = 'com_sel_premium' + id;
			textField = document.getElementById(textFieldName);
			if ($("#" + textFieldName).val() == "") {
				$("#" + textFieldName).val(0)
			}
		} else {
			textFieldName = 'com_buy_premium' + id;
			textField = document.getElementById(textFieldName);
			if ($("#" + textFieldName).val() == "") {
				$("#" + textFieldName).val(0)
			}
		}

		updateRowPremium(id);
	}

	function selAll() {

		chbox = arguments[0];
		type = arguments[1];
		table = document.getElementById("com_table");

		if (type == 'sel') {
			active_cell = 2;
			premium_cell = 5;
		} else {
			active_cell = 1;
			premium_cell = 4;
		}
		rowCount = table.rows.length - 1;
		for (i = 1; i <= rowCount; i++) {
			chkBox = table.rows[i].cells[active_cell].childNodes[0];
			chkBox.checked = chbox.checked;
			textBox = table.rows[i].cells[premium_cell].childNodes[0];
			textBox.disabled = !chbox.checked;
		}
	}

	function selAll_trade() {
		chbox = arguments[0];
		type = arguments[1];
		table = document.getElementById("com_table");
		if (type == 'sel') {
			active_cell = 7;
		} else {
			active_cell = 6;
		}
		rowCount = table.rows.length - 1;
		for (i = 1; i <= rowCount; i++) {
			chkBox = table.rows[i].cells[active_cell].childNodes[0];
			chkBox.checked = chbox.checked;
		}
	}
	const SITE_URL = "<?= site_url(); ?>";
	$(document).ready(function() {
		// Sync disabled state on active checkboxes
		$('input[type="checkbox"][name$="[com_buy_active]"]').each(function() {
			var name = $(this).attr('name');
			var match = name.match(/\[(\d+)\]\[com_buy_active\]/);
			if (match) {
				updateRowPremium(match[1]);
			}
		});

		// AJAX form submit
		$("#commodity_group_entry").on("submit", function(e) {
			e.preventDefault();
			let form = this;

			// 1. Standard Validation
			if (!validateForm(e, form)) {
				return false;
			}

			// ─── BZ: Limit Order Guard — pre-check before submit ───
			if (!$(form).data('limit_confirmed')) {
				let formData = new FormData(form);
				formData.append('com_group_id', $('input[name="fv[com_group_id]"]').val() || '');

				$.ajax({
					url: SITE_URL + "/C_com_group/check_com_limits",
					type: "POST",
					data: formData,
					processData: false,
					contentType: false,
					dataType: "json",
					success: function(resp) {
						if (resp.has_limits === true) {
							showConfirmModal(
								'⚠️ Active Limit Orders Found',
								resp.message,
								function() {
									$(form).data('limit_confirmed', true);
									$(form).trigger('submit');
								}
							);
						} else {
							$(form).data('limit_confirmed', true);
							$(form).trigger('submit');
						}
					},
					error: function() {
						$(form).data('limit_confirmed', true);
						$(form).trigger('submit');
					}
				});
				return false;
			}
			$(form).data('limit_confirmed', false);

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
							window.location.href = SITE_URL + "/C_com_group/open_listingform";
						}, 1000);
					} else {
						btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
						showToast(response.message || "Operation failed!", 'danger');
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
					showToast("Server error: " + error, 'danger');
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
						<h4 class="card-title"> </h4>
						<?php
						$status				=	$type;
						/*
								$id					=	$_POST['fv']['serv_id']==NULL ? NULL : $_POST['fv']['serv_id'] ;
								*/
						$com_group_id = $_POST['fv']['com_group_id'];
						$com_group_name = $_POST['fv']['com_group_name'];
						$com_group_active = $_POST['fv']['com_group_active'];
						$com_group_desc = $_POST['fv']['com_group_desc'];
						$com_group_com = $_POST['fv']['com_group_com'];


						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'commodity_group_entry', 'name' => 'commodity_group_entry', 'novalidate' => 'novalidate');

						//Opening form
						echo form_open('C_com_group/DB_Controller/com_group_model/' . $status . '/' . $com_group_id, $attributes);
						?>
						<form class="form-sample">
							<p class="card-description card-description1">Commodity Group</p>
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
										<label class="col-sm-4 col-form-label">Commodity Group Name* </label>
										<div class="col-sm-7">
											<input type="hidden" id="com_group_id" name="fv[com_group_id]" value="<?php echo set_value('com_group_id', $com_group_id); ?>" />
											<input type="text" name="fv[com_group_name]" id="com_group_name" class="form-control" value="<?php echo set_value('com_group_name', $com_group_name); ?>" required onkeydown="validateKeyPress(event, this,4)" maxlength="50" minlength="3" data-no-numbers-only />
											<span class="help-block">Enter the group name .</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Description</label>
										<div class="col-sm-7">
											<input type="text" name="fv[com_group_desc]" id="com_group_desc" class="form-control" value="<?php echo set_value('com_group_desc', $com_group_desc); ?>" placeholder="" onkeydown="validateKeyPress(event, this,4)" maxlength="500" minlength="10" data-no-numbers-only/>
											<span class="help-block">Enter the description details.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1" style="display: none;">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">

											<?php render_radio_group(
												'fv[com_group_active]',
												[
													1 => ['label' => 'Yes', 'id' => 'com_group_active_yes'],
													0 => ['label' => 'No', 'id' => 'com_group_active_no']
												],
												$com_group_active,
												'To enable/disable group.'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="table-responsive customergroup customergroup1">
								<table id="com_table" class="table table-hover1">
									<thead>
										<tr>
											<th width="15%" valign="center" style="text-align:center;">Commodity</th>
											<th width="8%">
												<div align="center"> Buying <br /><input type="checkbox" id="all_buy_active" name="all_buy_active" value="1" onClick="selAll(this,'buy');" /></div>
											</th>
											<th width="8%">
												<div align="center"> Selling <br /><input type="checkbox" id="all_sel_active" name="all_sel_active" value="1" onclick="selAll(this,'sel')" /></div>
											</th>
											<th width="20%" style="text-align:center;">Diff Type <br /><span style="float:left;margin-left:10%;">Manual</span><span style="float:right;margin-right:10%">Auto</span>
												<!-- <script language="javascript">
													function clearFields(obj, id) {
														$('#com_sel_premium' + id).val('0.00');
														$('#com_buy_premium' + id).val('0.00');
														updateRowPremium(id);
													}
												</script> -->
											</th>
											<th width="15%">Buy Premium</th>
											<th width="15%">Sell Premium</th>
											<?php if ($lite_trade == 1) { ?>
												<th width="8%">
													<div align="center"> Trade(Buy) <br /><input type="checkbox" id="all_buy_trade_active" value="1" onClick="selAll_trade(this,'buy');" /></div>
												</th>
												<th width="8%">
													<div align="center"> Trade(Sell) <br /><input type="checkbox" id="all_sell_trade_active" value="1" onclick="selAll_trade(this,'sel')" /></div>
												</th>
												<th width="12%">Delivery Days</th>
											<?php } ?>
											<th width="12%" style='display:none'>Commission</th>
										</tr>
									</thead>

									<tbody>
										<?php
										foreach ($com_group_com as $com) {
											$sel_active = $com['com_sel_active'] == 1 ? "checked=checked" : "";
											$buy_active = $com['com_buy_active'] == 1 ? "checked=checked" : "";

											// Removed unused $is_manual_premium check and decoupled enabled state
											$enable_buy_premium = ($com['com_buy_active'] == 1) ? "" : "disabled=disabled";
											$enable_sel_premium = ($com['com_sel_active'] == 1) ? "" : "disabled=disabled";

											$sel_trade = $com['com_sel_trade'] == 1 ? "checked=checked" : "";
											$buy_trade = $com['com_buy_trade'] == 1 ? "checked=checked" : "";

											$table = "<tr>";
											$table .= "<input type=hidden name='fv[com_group_com][" . $com['com_id'] . "][com_id]' value='" . $com['com_id'] . "'/>";
											$table .= "<td>" . $com['com_name'] . "</td>";
											$table .= "<td style=text-align:center ><input type=checkbox  id=com_buy_active name='fv[com_group_com][" . $com['com_id'] . "][com_buy_active]' value=1 " . $buy_active . " onclick=enableTextField(this,'buy'," . $com['com_id'] . ") /></td>";
											$table .= "<td style=text-align:center><input type=checkbox id=com_sel_active name='fv[com_group_com][" . $com['com_id'] . "][com_sel_active]' value=1 " . $sel_active . " onclick=enableTextField(this,'sel'," . $com['com_id'] . ") onchange=onclick=enableTextField(this,'sel'," . $com['com_id'] . ") /></td>";
											$table .= "<td style=text-align:center ><div style=margin-left:20%;margin-right:20%;>
												<span style=float:left;> 
													<input type=radio id=com_premium_type" . $com['com_id'] . " name='fv[com_group_com][" . $com['com_id'] . "][com_premium_type]' value='1' " . (($com['com_premium_type'] == 1) ? 'checked' : '') . " >
												</span>
												<span style=float:right;>
													<input type=radio id=com_premium_type" . $com['com_id'] . " name='fv[com_group_com][" . $com['com_id'] . "][com_premium_type]' value='0' " . (($com['com_premium_type'] == 0) ? 'checked' : '') . " >
												</span>
												</div></td>";

											$table .= "<td style=text-align:center ><input type=text class=form-control id=com_buy_premium" . $com['com_id'] . " name='fv[com_group_com][" . $com['com_id'] . "][com_buy_premium]' " . $enable_buy_premium . " value='" . $com['com_buy_premium'] . "' size='15' onkeydown='validateKeyPress(event, this, 3)'/></td>";
											$table .= "<td style=text-align:center ><input type=text class=form-control id=com_sel_premium" . $com['com_id'] . " name='fv[com_group_com][" . $com['com_id'] . "][com_sel_premium]' " . $enable_sel_premium . " value='" . $com['com_sel_premium'] . "' size='15' onkeydown='validateKeyPress(event, this, 3)'/></td>";
											if ($lite_trade == 1) {
												$table .= "<td style='text-align:center;' ><input type=checkbox  id=com_buy_trade name='fv[com_group_com][" . $com['com_id'] . "][com_buy_trade]' value=1 " . $buy_trade . "  /></td>";
												$table .= "<td style=text-align:center><input type=checkbox id=com_sel_trade name='fv[com_group_com][" . $com['com_id'] . "][com_sel_trade]' value=1 " . $sel_trade . "  /></td>";
												$table .= "<td align=center><input type=text id=com_delverydays" . $com['com_id'] . " name='fv[com_group_com][" . $com['com_id'] . "][com_delverydays]' value='" . $com['com_delverydays'] . "' size='15' min='0' onkeydown='validateKeyPress(event, this, 1)' maxlength='1'/></td>";
											}

											$table .= "<td style='display:none'><input type=text size='15' /></td>";
											$table .= "</tr>";
											echo $table;
										}
										?>
									</tbody>
								</table>
							</div>
							<div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
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