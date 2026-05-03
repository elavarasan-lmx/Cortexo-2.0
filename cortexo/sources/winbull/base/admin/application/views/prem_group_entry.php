<?php
$this->load->view('include/header.php');
$this->load->view('common/confirm_modal.php'); // BZ: Shared confirmation modal
$model_name = "prem_group_model";
?>
<script type="text/javascript">
	$(function() {
		$('.prem_expirydate').datetimepicker({
			dateFormat: 'dd:mm:yyyy',
			pickTime: false
		});
	});

	function enableTextField() {
		checkBox = arguments[0];
		type = arguments[1];
		if (type == 'sel') {
			textFieldName = 'prem_sel_premium' + arguments[2];
			textField = document.getElementById(textFieldName);
		} else {
			textFieldName = 'prem_buy_premium' + arguments[2];
			textField = document.getElementById(textFieldName);
		}
		textField.disabled = !checkBox.checked;
	}

	function selAll() {
		chbox = arguments[0];
		type = arguments[1];
		table = document.getElementById("com_table");
		if (type == 'sel') {
			active_cell = 2;
			premium_cell = 6;
		} else {
			active_cell = 3;
			premium_cell = 7;
		}
		rowCount = table.rows.length - 1;
		for (i = 2; i <= rowCount; i++) {
			chkBox = table.rows[i].cells[active_cell].childNodes[0];
			chkBox.checked = chbox.checked;
			textBox = table.rows[i].cells[premium_cell].childNodes[0];
			textBox.disabled = !chbox.checked;
		}
	}

	function validate(e) {
		e.preventDefault();
		const form = e.target || document.getElementById('iframeForm');

		// 1. Standard Validation
		if (!validateForm(e, form)) {
			return false;
		}

	let btn = $(form).find('button[type="submit"]');
		let formData = new FormData(form);

		btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Checking...');
		$("#ajax_loader").addClass("show");

		// ─── BZ: Limit Order Guard — pre-check before submit ───
		if (!$(form).data('limit_confirmed')) {
			let checkData = new FormData(form);
			var pgId = $('input[name="fv[prem_group_id]"]').val() || '';
			checkData.append('prem_group_id', pgId);

			$.ajax({
				url: "<?php echo $this->config->item('base_url'); ?>index.php/C_prem_group/check_prem_limits",
				type: "POST",
				data: checkData,
				processData: false,
				contentType: false,
				dataType: "json",
				success: function(resp) {
					if (resp.has_limits === true) {
						$("#ajax_loader").removeClass("show");
						btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
						showConfirmModal(
							'⚠️ Active Limit Orders Found',
							resp.message,
							function() {
								$(form).data('limit_confirmed', true);
								$('#iframeForm')[0].dispatchEvent(new Event('submit', {cancelable:true}));
							}
						);
					} else {
						$(form).data('limit_confirmed', true);
						$('#iframeForm')[0].dispatchEvent(new Event('submit', {cancelable:true}));
					}
				},
				error: function() {
					$(form).data('limit_confirmed', true);
					$('#iframeForm')[0].dispatchEvent(new Event('submit', {cancelable:true}));
				}
			});
			return false;
		}
		$(form).data('limit_confirmed', false);

		// 2. Custom Ajax Check for Duplicate Name
		let ChkNameExist = false;
		$.ajax({
			type: "POST",
			dataType: "json",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_prem_group/Chk_Name_Exist",
			data: {
				prem_group_name: $('#prem_group_name').val()
			},
			async: false,
			success: function(data) {
				if (data.status) {
					ChkNameExist = true;
					showToast('Premium Group Name already exists!', 'danger');
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text(btn.is(':contains("Update")') ? "Update" : "Save");
				}
			}
		});

		if (ChkNameExist) {
			return false;
		}

		// 3. Final Form Submission
		btn.html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
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
						window.location.href = "<?php echo $this->config->item('base_url'); ?>index.php/C_prem_group/open_listingform";
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

		return false;
	}
</script>

<!--<div>
    <ul class="breadcrumb">
		<li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
           <a href="#">Discount Group</a>
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
							<!-- <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_prem_group/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> -->
						</h4>
						<?php
						$status				=	$type;
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm');

						/*
							$id					=	$_POST['fv']['serv_id']==NULL ? NULL : $_POST['fv']['serv_id'] ;
							*/
						$prem_group_id = $_POST['fv']['prem_group_id'];
						$prem_group_name = $_POST['fv']['prem_group_name'];
						$prem_group_active = $_POST['fv']['prem_group_active'];
						$prem_group_desc = $_POST['fv']['prem_group_desc'];
						$prem_group_com = $_POST['fv']['prem_group_com'];


						//Opening form
						echo form_open('C_prem_group/DB_Controller/prem_group_model/' . $status . '/' . $prem_group_id, array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm', 'novalidate' => 'novalidate', 'onsubmit' => 'validate(event)'));
						?>
						<form class="form-sample">
							<p class="card-description card-description1"> Premium Group</p>
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
										<label class="col-sm-4 col-form-label">Group Name *</label>
										<div class="col-sm-7">
											<div class="input-group date" id="datetimepicker1">
												<input type="hidden" id="prem_group_id" name="fv[prem_group_id]" value="<?php echo set_value('prem_group_id', $prem_group_id); ?>" />
												<input type="text" name="fv[prem_group_name]" id="prem_group_name" class="form-control" value="<?php echo set_value('prem_group_name', $prem_group_name); ?>" required maxlength="50" onkeydown="validateKeyPress(event, this,4)" minlength="3" />
												<span class="help-block">Enter the group name .</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Description</label>
										<div class="col-sm-7">
											<input type="text" name="fv[prem_group_desc]" id="prem_group_desc" class="form-control" value="<?php echo set_value('prem_group_desc', $prem_group_desc); ?>" placeholder="" maxlength="500" minlength="10" onkeydown="validateKeyPress(event, this,4)" />
											<span class="help-block">Enter the description details.</span>
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
												'fv[prem_group_active]',
												[
													1 => ['label' => 'Yes', 'id' => 'prem_group_active_yes'],
													0 => ['label' => 'No', 'id' => 'prem_group_active_no']
												],
												$prem_group_active,
												'To enable/disable group.'
											); ?>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Update to</label>
										<div class="col-sm-7 prem_selgroup">
											<select id="selectgroup" name="selectGroup[]" multiple="multiple" style="width: 100%;height: auto;">
												<?php echo $this->$model_name->load_premiumgroups($prem_group_id); ?>
											</select>
											<span class="help-block">Select groups to which ever update the same premium.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="table-responsive customergroup">
								<table id="prem_table" class="table table-hover1">
									<thead>
										<tr>
											<th style="text-align: center;">Commodity Name</th>
											<th style="text-align: center;">Buy Discount</th>
											<th style="text-align: center;">Sell Discount</th>
											<th style="text-align: center;">Buy Active</th>
											<th style="text-align: center;">Sell Active</th>
											<th style="text-align: center;display:none;">Expiry Date</th>
										</tr>
									</thead>
									<tbody>
										<?php
										foreach ($prem_group_com as $prem) {
											$sel_active = $prem['prem_comsell_active'] == 1 ? "checked=checked" : "";
											$buy_active = $prem['prem_combuy_active'] == 1 ? "checked=checked" : "";

											$enable_buy_premium = $prem['prem_combuy_active'] == 1 ? "" : "disabled=disabled";
											$enable_sel_premium = $prem['prem_comsell_active'] == 1 ? "" : "disabled=disabled";

											$table = "<tr>";
											$table .= "<input type=hidden name='fv[prem_group_com][" . $prem['prem_id'] . "][prem_id]' value='" . $prem['prem_id'] . "'/>";
											$table .= "<td>" . $prem['prem_name'] . "</td>";

											$table .= "<td ><input style='text-align:right' type=text class=form-control id=prem_buy_premium" . $prem['prem_id'] . " name='fv[prem_group_com][" . $prem['prem_id'] . "][prem_buy_premium]' " . $enable_buy_premium . " value='" . set_value('prem_group_name', $prem['prem_buy_premium']) . "' size='15' step='0.01' onkeydown='validateKeyPress(event, this, 2, 8, 2)'  /></td>";

											$table .= "<td ><input style='text-align:right' type=text class=form-control id=prem_sel_premium" . $prem['prem_id'] . " name='fv[prem_group_com][" . $prem['prem_id'] . "][prem_sel_premium]' " . $enable_sel_premium . "  value='" . set_value('prem_group_name', $prem['prem_sel_premium']) . "' size='15' step='0.01' onkeydown='validateKeyPress(event, this, 2, 8, 2)' /></td>";


											$table .= "<td style=display:none; text-align:center ><input type=text class=form-control id=limit_buy_premium" . $prem['prem_id'] . " name='fv[prem_group_com][" . $prem['prem_id'] . "][limit_buy_premium]' value='" . set_value('prem_group_name', $prem['limit_buy_premium']) . "' size='15'  /></td>";

											$table .= "<td style=display:none; text-align:center ><input type=text class=form-control id=limit_sel_premium" . $prem['prem_id'] . " name='fv[prem_group_com][" . $prem['prem_id'] . "][limit_sel_premium]' value='" . set_value('prem_group_name', $prem['limit_sel_premium']) . "' size='15' /></td>";

											$table .= "<td style=text-align:center ><input type=checkbox  id=prem_combuy_active name='fv[prem_group_com][" . $prem['prem_id'] . "][prem_combuy_active]' value=1 " . $buy_active . " onclick=enableTextField(this,'buy'," . $prem['prem_id'] . ") /></td>";
											$table .= "<td style=text-align:center><input type=checkbox id=prem_comsell_active name='fv[prem_group_com][" . $prem['prem_id'] . "][prem_comsell_active]' value=1 " . $sel_active . " onclick=enableTextField(this,'sel'," . $prem['prem_id'] . ") onchange=onclick=enableTextField(this,'sel'," . $prem['prem_id'] . ") /></td>";

											$table .= "<td align=center style=display:none;'><div class='input-group date prem_expirydate' ><input  data-date-format='DD-MM-YYYY' type='text' class='form-control' name='fv[prem_group_com][" . $prem['prem_id'] . "][prem_expirydate]' id=prem_expirydate" . $prem['prem_id'] . " size='20' value='" . set_value('prem_group_name', $prem['prem_expirydate']) . "' /><span class='input-group-addon'><span class='glyphicon glyphicon-calendar'></span></span></div></td>";
											$table .= "<td style='display:none'><input type=text size='15' /></td>";
											$table .= "</tr>";
											echo $table;
										}
										?>
									</tbody>
								</table>
							</div>
							<div class="row form-sample1">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
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