<?php
$this->load->view("include/header");
$this->load->helper('common');
?>
<style>
	.footer {
		padding: 0px 10px
	}
</style>

<!--<div>
    <ul class="breadcrumb">
		<li>
            <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
            <a href="#">ContractSymbol Entry</a>
    </ul>
</div>-->
<script>
	function validate(e) {
		e.preventDefault();

		if (!validateForm(e, document.getElementById('iframeForm'))) {
			return false;
		}

		let form = $("#iframeForm");
		let btn = form.find('button[type="submit"]');
		let originalText = btn.text();
		let formData = new FormData(form[0]);

		// Show loading state
		btn.prop("disabled", true).html('<i class="typcn typcn-refresh typcn-spin"></i> Processing...');
		$("#ajax_loader").addClass("show");

		$.ajax({
			url: form.attr("action"),
			type: "POST",
			data: formData,
			processData: false,
			contentType: false,
			dataType: "json",
			headers: {
				'X-Requested-With': 'XMLHttpRequest'
			},
			success: function(response) {
				$("#ajax_loader").removeClass("show");
				
				if (response.status === "success") {
					showToast(response.message, 'success');
					setTimeout(function() {
						window.location.href = "<?= site_url('C_contractsymbol/open_listingform') ?>";
					}, 1500);
				} else {
					btn.prop("disabled", false).text(originalText);
					showToast(response.message, 'error');
					
					// Highlight specific field if provided
					if (response.field) {
						$('#' + response.field).addClass('is-invalid').focus();
					}
				}
			},
			error: function(xhr, status, error) {
				$("#ajax_loader").removeClass("show");
				btn.prop("disabled", false).text(originalText);
				showToast("Server error: " + error, 'error');
			}
		});

		return false;
	}
	
	// Enhanced validation function
	function validateForm(event, form) {
		let isValid = true;
		$('.is-invalid').removeClass('is-invalid');
		
		// Contract symbol validation
		let contractSymbol = $('#contract_symbol').val().trim();
		if (contractSymbol.length < 3) {
			$('#contract_symbol').addClass('is-invalid');
			showToast('Contract symbol must be at least 3 characters', 'error');
			isValid = false;
		}
		
		if (contractSymbol.length > 30) {
			$('#contract_symbol').addClass('is-invalid');
			showToast('Contract symbol cannot exceed 30 characters', 'error');
			isValid = false;
		}
		
		// Type validation
		let comType = $('#com_type').val();
		if (!comType || !['1', '2'].includes(comType)) {
			$('#com_type').addClass('is-invalid');
			showToast('Please select a valid commodity type', 'error');
			isValid = false;
		}
		
		return isValid;
	}
	
	$(document).ready(function() {
		// Real-time validation feedback
		$('#contract_symbol').on('blur', function() {
			let val = $(this).val().trim();
			if (val.length > 0 && val.length < 3) {
				$(this).addClass('is-invalid');
				showToast('Contract symbol must be at least 3 characters', 'warning');
			} else if (val.length > 30) {
				$(this).addClass('is-invalid');
				showToast('Contract symbol cannot exceed 30 characters', 'warning');
			} else {
				$(this).removeClass('is-invalid');
			}
		});
		
		// Duplicate check on blur
		$('#contract_symbol').on('blur', function() {
			let symbol = $(this).val().trim();
			let currentId = $('#contract_id').val();
			
			if (symbol.length >= 3) {
				$.post('<?= site_url("C_contractsymbol/check_duplicate") ?>', {
					contract_symbol: symbol,
					id: currentId
				}, function(response) {
					if (response.exists) {
						$('#contract_symbol').addClass('is-invalid');
						showToast(response.message, 'error');
					}
				});
			}
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
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry<a href="<?php echo $this->config->item('base_url') ?>index.php/C_contractsymbol/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>--> </h4>
						<?php
						$status				=	$type;
						$id					=	$_POST['fv']['contract_id'] == NULL ? NULL : $_POST['fv']['contract_id'];
						$attributes 		=	array('class' => 'form-horizontal', 'id' => 'iframeForm', 'name' => 'iframeForm');
						//Opening form
						echo form_open_multipart('C_contractsymbol/DB_Controller/contractsymbolmodel/' . $status . '/' . $id, $attributes);
						?>
						<div class="form-sample">
							<p class="card-description card-description1">Contract Symbol Details</p>
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
											<input type="text" required name="fv[contract_symbol]" id="contract_symbol" value="<?php echo htmlspecialchars(set_value('contract_symbol', $contract_symbol), ENT_QUOTES, 'UTF-8'); ?>" class="form-control" placeholder="" onkeydown="validateKeyPress(event, this,4)" maxlength="30" minlength="3" data-no-numbers-only />
											<span class="help-block">Enter the contract symbol from Rate XML(**Delimiter for space is -**).</span>
										</div>
									</div>
								</div>
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Active</label>
										<div class="col-sm-7">
											<?php render_radio_group(
												'fv[status]',
												[
													1 => ['label' => 'Yes', 'id' => 'com_active_yes'],
													0 => ['label' => 'No', 'id' => 'com_active_noo']
												],
												$contract_status,
												'contract Symbol status can be enabled or disabled here'
											); ?>
										</div>
									</div>
								</div>
							</div>
							<div class="row form-sample1">
								<div class="col-md-6">
									<div class="form-group row">
										<label class="col-sm-4 col-form-label">Type*</label>
										<div class="col-sm-7">
											<select name="fv[com_type]" id="com_type" class="form-control">
												<option value="1" <?php echo $com_type == 1 ? "selected=selected" : ""; ?>>GOLD</option>
												<option value="2" <?php echo $com_type == 2 ? "selected=selected" : ""; ?>>SILVER</option>
											</select>
											<span class="help-block">Select Commodity Type .</span>
										</div>
									</div>
								</div>
								<div class="col-md-6"></div>
							</div>
							<!-- <div class="row form-sample1">
								<div class="col-md-4"></div>
								<div class="col-md-4 page_footer">
									<button type="submit" class="btn btn1 btn-success btn-md btn-md1">Update</button>
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
								</div>
								<div class="col-md-6">
									
								</div>
							</div> -->
							<div class="row form-sample1">
								<div class="col-md-3"></div>
								<div class="col-md-6">
									<?php if ($status == "edit" && $userrights["edit"] == 1) { ?>
										<input type="hidden" name="old_contract_symbol" id="old_contract_symbol" value="<?= $contract_symbol ?>">
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1" onclick="validate(event)">Update</button>
									<?php } else if ($status == "add_new" && $userrights["add"] == 1) { ?>
										<button type="submit" class="btn btn1 btn-success btn-md btn-md1" onclick="validate(event)">Save</button>
									<?php } ?>
									<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="history.back();">Cancel</button>
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