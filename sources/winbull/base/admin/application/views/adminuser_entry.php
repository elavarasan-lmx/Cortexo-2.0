<?php $this->load->view('include/header.php');
$model_name = "adminuser_model";
?>
<style>
.footer{padding:0px 10px}
</style>
<script type="text/javascript">
 $(function () {
                // BZ-44: Block past dates in validity date picker
                $('#admin_validity_date').datetimepicker({
				pickTime: false,
				minDate: new Date()
				});

                // BZ-45: Show/hide alert fields based on payment alert checkbox
                function toggleAlertFields() {
                    var isChecked = $('#admin_showalert').is(':checked');
                    // Target the entire row containing Alert Days and Alert Message fields
                    $('#admin_alertdays').closest('.row.form-sample1').toggle(isChecked);
                }
                $('#admin_showalert').on('change', toggleAlertFields);
                toggleAlertFields(); // Run on page load
            });
function enableuserrights(eva){
	chbox=arguments[0];
	var row = $(eva).closest("tr");
	$(':checkbox', row).prop('checked', chbox.checked);
}
function selAll_menu(eva){
	chbox=arguments[0];
	var row = $(eva).closest("table");
	$(':checkbox', row).prop('checked', chbox.checked);
}
</script>
<script type="text/javascript">
	var SITE_URL = "<?php echo site_url(); ?>";

	$(document).ready(function() {
		$("#iframeForm").on("submit", function(e) {
			e.preventDefault();
			var form = this;

			// User Name validation: required, min 3 characters, letters only
			var userName = $('#admin_user_name').val().trim();
			if (userName === '') {
				showToast('User Name is required.', 'danger');
				$('#admin_user_name').focus();
				return false;
			}
			if (userName.length < 3) {
				showToast('User Name must be at least 3 characters.', 'danger');
				$('#admin_user_name').focus();
				return false;
			}
			if (!/^[a-zA-Z\s]+$/.test(userName)) {
				showToast('User Name must contain only letters.', 'danger');
				$('#admin_user_name').focus();
				return false;
			}

			// BZ-47: Password validation — required on ADD, optional on EDIT
			var password = $('#admin_user_password').val().trim();
			var isEditMode = ($('input[name="fv[admin_user_id]"]').length > 0 && $('input[name="fv[admin_user_id]"]').val() !== '');
			
			if (!isEditMode && password === '') {
				// Only require password on new user creation
				showToast('Password is required.', 'danger');
				$('#admin_user_password').focus();
				return false;
			}
			// If password is provided (on add or edit), validate strength
			if (password !== '') {
				if (password.length < 6) {
					showToast('Password must be at least 6 characters.', 'danger');
					$('#admin_user_password').focus();
					return false;
				}
				if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
					showToast('Password must contain both uppercase and lowercase letters.', 'danger');
					$('#admin_user_password').focus();
					return false;
				}
				if (!/[0-9]/.test(password)) {
					showToast('Password must contain at least one number.', 'danger');
					$('#admin_user_password').focus();
					return false;
				}
				if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
					showToast('Password must contain at least one special character.', 'danger');
					$('#admin_user_password').focus();
					return false;
				}
			}

			// Security Code validation: required and min 3 characters
			var secCode = $('#admin_sec_code').val().trim();
			if (secCode === '') {
				showToast('Security Code is required.', 'danger');
				$('#admin_sec_code').focus();
				return false;
			}
			if (secCode.length < 3) {
				showToast('Security Code must be at least 3 characters.', 'danger');
				$('#admin_sec_code').focus();
				return false;
			}

			// Alert Days validation: if Payment Alert is checked
			if ($('#admin_showalert').is(':checked')) {
				var alertDays = $('#admin_alertdays').val().trim();
				if (alertDays === '') {
					showToast('Alert Days is required when Payment Alert is enabled.', 'danger');
					$('#admin_alertdays').focus();
					return false;
				}
				if (!/^[0-9]+$/.test(alertDays) || parseInt(alertDays) < 1) {
					showToast('Alert Days must be a valid number greater than 0.', 'danger');
					$('#admin_alertdays').focus();
					return false;
				}

				var alertMessage = $('#admin_alertmessage').val().trim();
				if (alertMessage === '') {
					showToast('Alert Message is required when Payment Alert is enabled.', 'danger');
					$('#admin_alertmessage').focus();
					return false;
				}
				if (alertMessage.length < 5) {
					showToast('Alert Message must be at least 5 characters.', 'danger');
					$('#admin_alertmessage').focus();
					return false;
				}
			}

			// Standard validation
			if (typeof validateForm === 'function' && !validateForm(e, form)) {
				return false;
			}

			var btn = $(form).find('button[type="submit"]');
			var formData = new FormData(form);

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
							window.location.href = SITE_URL + "/C_admin_user/open_listingform";
						}, 1000);
					} else {
						btn.prop("disabled", false).text("Save");
						showToast(response.message || "Operation failed!", 'danger');
					}
				},
				error: function(xhr, status, error) {
					$("#ajax_loader").removeClass("show");
					btn.prop("disabled", false).text("Save");
					showToast("Server error: " + error, 'danger');
				}
			});
		});
	});
</script>
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>
<style>
	#ajax_loader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		display: none;
	}

	#ajax_loader.show {
		display: flex;
	}
</style>
<!--<div>
    <ul class="breadcrumb">
        <li><a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a></li>
        <li>
            <a href="#">Settings</a>
        </li>
		<li>
            <a href="#">Admin User Entry</a>
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
							<!-- <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_admin_user/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>  -->
						</h4>
						 <?php
							$status				=	$type;
							$id					=	$_POST['fv']['admin_user_id']==NULL ? NULL : $_POST['fv']['admin_user_id'] ;
							$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm', 'novalidate' => 'novalidate');
							//Opening form
						echo form_open('C_admin_user/DB_Controller/adminuser_model/'.$status.'/'.$id,$attributes); ?>
						<form class="form-sample">
							<p class="card-description card-description1">Admin User</p>
								<?php
									if(isset($db_error_msg) && $db_error_msg != '')
									{
										echo '<div class="alert alert-danger">
												<a href="#" class="close" data-dismiss="alert">&times;</a>
												<strong>Warning!</strong> '.$db_error_msg.'
												</div>';
									}
								?>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">User Name *</label>
										<div class="col-sm-7">
											<input type="text" class="form-control" name="fv[admin_user_name]"  tabindex="1" id="admin_user_name" value="<?php echo set_value('admin_user_name',$admin_user_name); ?>" maxlength="45" onkeydown="validateKeyPress(event, this,4)"/>
											<span class="help-block">Minimum 3 characters, letters only</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Password *</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="password" class="form-control" name="fv[admin_user_password]" id="admin_user_password" value="<?php echo set_value('admin_user_password',$admin_user_password); ?>" tabindex="2" maxlength="15"  placeholder=""/>
												<span class="help-block">Minimum 6 characters with uppercase, lowercase, number and special character</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1" style="display:none;">
								<div class="col-md-6">
									<div class="form-group row">
									  <label class="col-sm-4 col-form-label">Block IP</label>
										<div class="col-sm-7">
											<label>
												<input type="checkbox" name="fv[admin_ip_restricted]" id="admin_ip_restricted" value="1" <?php if($admin_ip_restricted==1) {?> checked="checked" <?php } ?> tabindex="15">
											</label>
											<span class="help-block">Blocks specified IP</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">IP Address</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="text" name="fv[admin_ip]" id="admin_ip" class="form-control" value="<?php echo set_value('admin_ip',$admin_ip); ?>" tabindex="13" maxlength="20" />
												<span class="help-block">This is IP address to be blocked</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Security Code *</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="password" class="form-control"name="fv[admin_sec_code]" id="admin_sec_code" value="<?php echo set_value('admin_sec_code',$admin_sec_code); ?>" tabindex="4" maxlength="10"  placeholder=""/>
												<span class="help-block">It helps for single user access (minimum 3 characters)</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Read only user</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<label>
													<input type="checkbox" name="fv[disable_rpaneledit]" id="disable_rpaneledit" value="1" <?php if($disable_rpaneledit==1) {?> checked="checked" <?php } ?> tabindex="15">
												</label>
												<span class="help-block">This user is allowed to view the R panel, not to edit</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<label>
													<input type="checkbox"  name="fv[admin_status]" id="admin_status" value="1" <?php if($admin_status==1) {?> checked="checked" <?php } ?> tabindex="19" />
												</label>
												<span class="help-block">Activates/deactivates this admin user account.</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Validate till</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<div class="input-group">
													<input readonly="true" type="text" class="form-control"  name="fv[admin_validity_date]" id="admin_validity_date" value="<?php echo set_value('admin_validity_date',$admin_validity_date); ?>" tabindex="17" maxlength="10" />
												</div>
												<span class="help-block">Select the date of validity.</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Payment Alert</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<label>
														<input type="checkbox" name="fv[admin_showalert]" id="admin_showalert" value="1" <?php if($admin_showalert==1) {?> checked="checked" <?php } ?> tabindex="9" />
												</label>
												<span class="help-block">Alerts the user for payment</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">SMS</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<label>
													  <input type="checkbox" name="fv[admin_is_sms]" id="admin_is_sms" value="1" <?php if($admin_is_sms==1) {?> checked="checked" <?php } ?> tabindex="15">
												  </label>
												<span class="help-block">Get SMS Alert </span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Alert before (In days)</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="text" class="form-control" name="fv[admin_alertdays]" id="admin_alertdays" value="<?php echo set_value('admin_alertdays',$admin_alertdays); ?>" tabindex="10" maxlength="3"  placeholder="" onkeydown="validateKeyPress(event, this,1)"/>
												<span class="help-block">Alerts from specified days before the account validy expired</span>
											</div>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Alert message</label>
										<div class="col-sm-7">
											<div class="form-group row">
												<input type="text" class="form-control" name="fv[admin_alertmessage]" id="admin_alertmessage"  value="<?php echo set_value('admin_alertmessage',$admin_alertmessage); ?>" tabindex="11" maxlength="100" onkeydown="validateKeyPress(event, this,4)"/>
												<span class="help-block">Message to be shown while admin user login</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1 admin_user_name">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<!-- <button type="reset" class="btn btn1 btn-danger  btn-md btn-md2">Cancel</button> -->
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">

								</div>
							</div>
							<div class="table-responsive customergroup customergroup1">
								<table  id="com_table" class="table table-hover1">
									<thead>
										<tr>
											<th width="20%" valign="center" style="text-align:center;">Menu</th>
											<th width="6%" style="text-align:center;">Is Parent</th>
											<th width="6%" style="text-align:center;">Is Sub Menu</th>
											<th width="20%" style="text-align:center;">Parent</th>
											<th width="6%">View</th>
											<th width="6%">Add</th>
											<th width="6%">Edit</th>
											<th width="6%">Delete</th>
											<th width="6%">SMS</th>
											<th width="6%">Email</th>
											<th width="6%">Notification</th>
											<th width="6%">All<br /><input type="checkbox" id="all_menu_active"  value="1" onClick="selAll_menu(this);" /></th>
										</tr>
									</thead>

									<tbody>
										<?php
											$adminuser_rights=($this->$model_name->get_userrights($id)->result_array());
												foreach($adminuser_rights as $key => $userrts){
													$view_active=$userrts['uview'] == 1 ?"checked=checked" : "";
													$add_active=$userrts['uadd'] == 1 ?"checked=checked" : "";
													$edit_active=$userrts['uedit'] == 1 ?"checked=checked" : "";
													$delete_active=$userrts['udelete'] == 1 ?"checked=checked" : "";
													$sms_active=$userrts['usms'] == 1 ?"checked=checked" : "";
													$email_active=$userrts['uemail'] == 1 ?"checked=checked" : "";
													$notification_active=$userrts['unotification']== 1 ?"checked=checked" : "";

													$table="<tr>";
													$table.="<td><input type=hidden name='fuv[userrights][".$key."][id_menu]' value='".$userrts['menuid']."'/>".$userrts['label']."</td>";
													$table.="<td style=text-align:center >".$userrts['isparent']."</td>";
													$table.="<td style=text-align:center>".$userrts['issubmenu']."</td>";
													$table.="<td style=text-align:center >".$userrts['parent']."</td>";

													$table.="<td style=text-align:center ><input type=checkbox name='fuv[userrights][".$key."][view]' value=1 ".$view_active." /></td>";
													$table.="<td style=text-align:center ><input type=checkbox name='fuv[userrights][".$key."][add]' value=1 ".$add_active." /></td>";
													$table.="<td style=text-align:center ><input type=checkbox name='fuv[userrights][".$key."][edit]' value=1 ".$edit_active." /></td>";
													$table.="<td style=text-align:center ><input type=checkbox name='fuv[userrights][".$key."][delete]' value=1 ".$delete_active." /></td>";
													$table.="<td style=text-align:center ><input type=checkbox name='fuv[userrights][".$key."][sms]' value=1 ".$sms_active." /></td>";
													$table.="<td style=text-align:center ><input type=checkbox name='fuv[userrights][".$key."][email]' value=1 ".$email_active." /></td>";
													$table.="<td style=text-align:center ><input type=checkbox name='fuv[userrights][".$key."][notification]' value=1 ".$notification_active." /></td>";
													$table.="<td style=text-align:center ><input type=checkbox onchange=onclick=enableuserrights(this) /></td>";

													echo $table;
												}
											?>
									</tbody>
								 </table>
							</div>

						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<?php $this->load->view("include/footer"); ?>
