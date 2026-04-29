<?php $this->load->view('include/header.php'); 
?>
<script type="text/javascript">
	
function insertValueQuery() {
    var url_field = document.getElementById("whatsapp_content");
    var selected_field = document.getElementById("field_list").value;	

	if (url_field.selectionStart || url_field.selectionStart == "0") {
		var startPos = url_field.selectionStart;
		var endPos = url_field.selectionEnd;
		var chaineSql = url_field.value;
		url_field.value = chaineSql.substring(0, startPos) + selected_field + chaineSql.substring(endPos, chaineSql.length);
	} else {
		url_field.value += selected_field;
	}
}

function submitForm(e) {
	e.preventDefault();
	let form = document.getElementById("iframeForm");
	let btn = $(form).find('button[type="submit"]');
	let formData = new FormData(form);

	btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
	$("#ajax_loader").addClass("show");

	$.ajax({
		url: form.getAttribute("action"),
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
</script>

<div id="ajax_loader">
	<img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading...">
</div>

<div class="main-panel">
    <div class="content-wrapper">
		<div class="row">
			<div class="col-12 grid-margin">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><a href="<?php echo $this->config->item('base_url') ?>index.php/C_whatsappmeta_settings/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a> </h4>
						<?php
							$status = $type;
							$id = $service_id;
							$attributes = array('class' => 'iframeForm', 'id' => 'iframeForm', 'name' => 'iframeForm');
							echo form_open('C_whatsappmeta_settings/DB_Controller/Whatsappmeta_settings_model/'.$status.'/'.$id, $attributes); 
						?>	
						<div class="form-sample">
							<p class="card-description"> Meta Whatsapp Settings</p>
							<div class="row">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Service </label>
										
										<div class="col-sm-7">
											<input type="hidden" id="service_id" name="fv[service_id]" value="<?php echo $id; ?>" />
                                            <?php echo $serv_name; ?>
											<span class="help-block">Service name.</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Template ID*</label>
										<div class="col-sm-7">
											<input class="form-control" type="text" name="fv[template_id]" value="<?php echo set_value('template_id', $template_id); ?>" required />
											<span class="help-block">Enter Template Id.</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Content*</label>
										<div class="col-sm-9">
											<textarea class="form-control" rows="10" name="fv[whatsapp_content]" id="whatsapp_content" required><?php echo set_value('whatsapp_content', $whatsapp_content);?></textarea>
											<span class="help-block">Enter or choose the Whatsapp content (10-2000 characters).</span>
										</div>
									</div>
								</div>
								<div class="col-md-1">
									<button type="button" onclick="insertValueQuery()" class="btn btn-primary mt-5"> << </button>
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
												<?php } else if ($service_id ==4 || $service_id == 5 || $service_id == 8 || $service_id == 9 || $service_id == 10) { ?>
												<option value="@@book_no@@">Booking No</option>
												<option value="@@book_cusid@@">Customer Name</option>
												<option value="@@book_datetime@@">Date & Time</option>
												<option value="@@book_comid@@">Commodity Name</option>
												<option value="@@book_type@@">Type</option>
												<option value="@@book_qty@@">Qty</option>
												<option value="@@book_rate@@">Rate</option>
												<option value="@@book_totalcost@@">Total Cost</option>
												<option value="@@book_confirmedon@@">Confirmed On</option>
												<option value="@@book_status@@">Status</option>			
												<option value="@@book_deliveredon@@">Deliveryed On</option>
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
										<span class="help-block">Select  the value.</span>
									</div>
								</div>
							</div>
							<div class="row">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-3 col-form-label">Footer</label>
										<div class="col-sm-7">
											<input class="form-control" type="text" name="fv[whatsapp_footer]" value="<?php echo set_value('whatsapp_footer', $whatsapp_footer); ?>" maxlength="50"/>
											<span class="help-block">Enter the footer text (5-50 characters).</span>
										</div>
									</div>
								</div>
							</div>
							<div class="row mt-3">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<button type="submit" onclick="submitForm(event)" class="btn btn1 btn-success btn-md btn-md1">Save</button>
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
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
