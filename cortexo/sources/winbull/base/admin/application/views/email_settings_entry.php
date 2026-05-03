<?php $this->load->view('include/header.php'); ?>
<script type="text/javascript">
function insertValueQuery() {	
    var url_field = document.getElementById("email_content");
    var selected_field = document.getElementById("field_list").value;		
	//IE support
	if (document.selection) {		
		url_field.focus();
		sel = document.selection.createRange();
		sel.text = selected_field;
		document.sqlform.insert.focus();
	}
	//MOZILLA/NETSCAPE support
	else if (url_field.selectionStart || url_field.selectionStart == "0") {
		var startPos = url_field.selectionStart;
		var endPos = url_field.selectionEnd;
		var chaineSql = url_field.value;
		url_field.value = chaineSql.substring(0, startPos) + selected_field + chaineSql.substring(endPos, chaineSql.length);
	} else {
		url_field.value += selected_field;
	}
}	

document.addEventListener("input", (e) => {
    if (e.target.id === "email_signature") {
        e.target.value = e.target.value.slice(0, 100);
        document.getElementById("charCount").textContent = `${e.target.value.length} / 100`;
    }
});
</script>
<style>
.footer{padding:0px 10px}
.EnableDisableComm { display:none; }
.com-barQuantities { padding: 0px; }
.table { margin-bottom:0px !important; }
#ajax_loader {
	position: fixed;
	top: 0; left: 0;
	width: 100%; height: 100%;
	background: rgba(0, 0, 0, 0.5);
	z-index: 9999;
	display: none;
	justify-content: center;
	align-items: center;
}
#ajax_loader.show { display: flex; }
.typcn-spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>

<!-- AJAX LOADER OVERLAY -->
<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
    <div class="content-wrapper">
				<script>
					$(document).ready(function() {
						$("#iframeForm").on("submit", function(e) {
							e.preventDefault();

							var emailSubject = $('#email_signature').val().trim();
							var emailContent = $('#email_content').val().trim();

							if (emailSubject === '') {
								showToast('Subject is required!', "error");
								return false;
							} else if (emailSubject.length < 5) {
								showToast('Subject must be at least 5 characters long!', "error");
								return false;
							}

							if (emailContent === '') {
								showToast('Content is required!', "error");
								return false;
							} else if (emailContent.length < 10) {
								showToast('Content must be at least 10 characters long!', "error");
								return false;
							}

							var form = $(this);
							var btn = form.find('button[type="submit"]');
							var btnText = btn.text();
							btn.prop('disabled', true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
							$("#ajax_loader").addClass("show");

							$.ajax({
								url: form.attr('action'),
								type: 'POST',
								data: form.serialize(),
								dataType: 'json',
								success: function(response) {
									$("#ajax_loader").removeClass("show");
									if (response.status === 'success') {
										showToast(response.message, 'success');
										setTimeout(function() {
											window.location.href = '<?= base_url("index.php/C_email_settings/open_listingform") ?>';
										}, 1000);
									} else {
										btn.prop('disabled', false).text(btnText);
										showToast(response.message || 'Failed to save. Please try again.', 'error');
									}
								},
								error: function() {
									$("#ajax_loader").removeClass("show");
									btn.prop('disabled', false).text(btnText);
									showToast('Server error. Please try again.', 'error');
								}
							});
						});
					});
				</script>
				<div class="col-12 grid-margin">
					<div class="card antigravity">
						<div class="card-body">
							<h4 class="card-title"></h4>
							<?php
								$status		= $type;
								$id			= $_POST['fv']['service_id']==NULL ? NULL : $_POST['fv']['service_id'];
								$attributes = array('class' => 'iframeForm', 'id' => 'iframeForm', 'name' => 'iframeForm');
								echo form_open('C_email_settings/DB_Controller/email_settings_model/'.$status.'/'.$id, $attributes);
							?>	   
							<form class="form-sample">
								<p class="card-description card-description1">Email Settings</p>
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
											<label class="col-sm-3 col-form-label">Service*</label>
											<div class="col-sm-7">
												<input type="hidden" id="service_id" name="fv[service_id]" value="<?php echo set_value('service_id',$id);?>" /><?php echo $serv_name;?>  
												<span class="help-block">Service name.</span>	
											</div>
										</div>
									</div>
									<div class="col-md-6"></div>
								</div>
								<div class="row form-sample1">
									<div class="col-md-6">  
										<div class="form-group row">
											<label class="col-sm-3 col-form-label">Subject*</label>
											<div class="col-sm-7">
												<textarea style="width: 405px;" class="form-control" id="email_signature" cols="60" name="fv[email_signature]" maxlength="100" minlength="5" required onkeydown="validateKeyPress(event, this,8)"><?php echo set_value('email_signature',$email_signature); ?></textarea>
												<span class="help-block">Enter subject. (5-100 characters)</span>		
												<span id="charCount" style="display:none;">0 / 100</span>
											</div>
										</div>
									</div>
									<div class="col-md-6"></div>
								</div>
								<div class="row form-sample1">
									<div class="col-md-6">
										<div class="form-group row">
											<label class="col-sm-3 col-form-label">E-Mail Content*</label>
											<div class="col-sm-7">
												<textarea style="width: 350px;" class="form-control" rows="10" name="fv[email_content]" id="email_content" maxlength="3000" minlength="10" required><?php echo set_value('email_content',$email_content);?></textarea>
												<span class="help-block">Enter or choose the Email content. (10-3000 characters)</span>
											</div>
										</div>
									</div>
									<div class="col-md-1">
										<div class="btn-group" data-toggle="buttons">
											<label onclick="insertValueQuery()" style="margin-top: 60px;" class="btn btn-primary">
												<a style="color:#007bff; text-decoration:none" href="" id="move_button" name="move_button"> << </a>
											</label>
										</div>
									</div>
									<div class="col-md-5">
										<div class="form-group row">
											<select style="height: 170px;" class="form-control" size="11" id="field_list" name="field_list">
											<?php if (($service_id >=1 && $service_id <= 3) || $service_id == 7 ) { ?>
												<option value="@@cus_id@@">Customer ID</option>
												<option value="@@cus_register_on@@">Register on</option>
												<option value="@@cus_name@@">Customer Name</option>
												<option value="@@cus_company_name@@">Company Name</option>
												<option value="@@cus_address@@">Address</option>
												<option value="@@cus_city@@">City</option>
												<option value="@@cus_mobile1@@">Mobile No1</option>
												<option value="@@cus_email@@">E-Mail</option>
												<option value="@@cus_login_name@@">Login Name</option>
												<option value="@@cus_login_password@@">Password</option>
												<option value="@@cus_sec_code@@">Security code</option>
												<option value="@@cus_confirmed_on@@">Confirm On</option>
												<option value="@@cus_approved_on@@">Approved On</option>
												<option value="@@cus_valid_till@@">Valid Till</option>
												<option value="@@cus_active@@">Active</option>
											<?php } else if ($service_id ==4 || $service_id == 5) { ?>
												<option value="@@book_no@@">Booking No</option>
												<option value="@@book_cusid@@">Customer Name</option>
												<option value="@@book_datetime@@">Date &amp; Time</option>
												<option value="@@book_comid@@">Commodity Name</option>
												<option value="@@book_type@@">Type</option>
												<option value="@@book_qty@@">Qty</option>
												<option value="@@book_rate@@">Rate</option>
												<option value="@@book_confirmedon@@">Confirmed On</option>
												<option value="@@book_status@@">Status</option>			
												<option value="@@book_deliveredon@@">Delivered On</option>
											<?php } else if ($service_id == 6) { ?>
												<option value="@@invoice_delcode@@">Delivery Code</option>
												<option value="@@invoice_bookno@@">Booking No</option>
												<option value="@@cus_name@@">Customer Name</option>
												<option value="@@cusdel_date@@">Delivery Date</option>
												<option value="@@book_datetime@@">Book Date</option>
												<option value="@@invoice_deliveryqty@@">Delivery Qty</option>
												<option value="@@invoice_totalamt@@">Delivery Amt</option>
												<option value="@@book_type@@">Book Type</option>
												<option value="@@book_qty@@">Total Qty</option>
												<option value="@@book_rate@@">Rate</option>
												<option value="@@invoice_penality@@">Penalty</option>
												<option value="@@book_totalcost@@">Total Amt</option>
												<option value="@@com_name@@">Commodity Name</option>
											<?php } ?>
											</select>	
											<span class="help-block">Select the value.</span>
										</div>
									</div>
								</div>
								<div class="row form-sample1" style="margin-top:30px;">
									<div class="col-md-3"></div>
									<div class="col-md-6">
										<button type="submit" id="btn_save" class="btn btn1 btn-success btn-md btn-md1">Save</button>
										<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
									</div>
									<div class="col-md-6"></div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<?php $this->load->view("include/footer"); ?>
