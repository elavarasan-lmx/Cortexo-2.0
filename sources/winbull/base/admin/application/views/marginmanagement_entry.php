<?php
$this->load->view('include/header.php');
$model_name = "marginmanagement_model";
?>
<style>
    /* AJAX Save Loader */
    #ajax_loader {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: none;
        justify-content: center;
        align-items: center;
    }
    #ajax_loader.show { display: flex; }
    .typcn-spin { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
</style>
<script type="text/javascript">
	$(function() {
		$('#datetimepicker1').datetimepicker({
			pickTime: false
		});

		$(document).on("change", "#mar_customer", function() {
			get_availablebalance();
		});

		get_availablebalance();
	});

	$(document).ready(function() {

		$("#marginForm").on("submit", function(e) {

			let hasError = false;
			let amount = parseFloat($("#mar_amount").val());

			// Customer
			if ($("#mar_customer").val() == "-1" || $("#mar_customer").val().trim() === "") {
				showToast("Please select a customer.", 'warning');
				$("#mar_customer").focus();
				hasError = true;
			}

			// Margin Amount
			else if ($("#mar_amount").val().trim() === "") {
				showToast("Please enter Margin Amount.", 'warning');
				$("#mar_amount").focus();
				hasError = true;
			} else if (isNaN(amount) || amount <= 0) {
				showToast("Margin Amount must be greater than zero.", 'warning');
				$("#mar_amount").focus();
				e.preventDefault();
				return false;
			}

			// Payment Type
			else if ($("#mar_mode").val() == "-1") {
				showToast("Please select Payment Type.", 'warning');
				$("#mar_mode").focus();
				hasError = true;
			}

			if (hasError) {
				e.preventDefault();
				return false;
			}

			// All valid — show loader
			var $btn = $('#btn_save');
			$btn.prop('disabled', true).html('<i class="typcn typcn-refresh typcn-spin"></i> Saving...');
			$('#ajax_loader').addClass('show');
		});

	});


	function get_availablebalance() {
		var cus_id = $("#mar_customer").val();
		if (cus_id !== '' && cus_id !== '-1') {
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url') ?>index.php/C_marginmanagement/get_availablebalance/" + cus_id,
				success: function(data) {
					$("#available_balance").val(data);
				},
				error: function(request, error) {
					console.log("Error retrieving balance");
				}
			});
		}
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
						<h4 class="card-title"><!--<i class="glyphicon glyphicon-th"></i> Trader Entry-->
							<!--<a href="<?php echo $this->config->item('base_url'); ?>index.php/C_marginmanagement/open_listingform" class="btn btn-primary btn-sm add_new" role="button"><i class="typcn typcn-delete btn-icon-append"></i> Close</a>-->
						</h4>
						<?php
						$status = $type;
						$id = isset($_POST['fv']['mar_id']) ? $_POST['fv']['mar_id'] : NULL;
						echo form_open('C_marginmanagement/DB_Controller/marginmanagement_model/' . $status . '/' . $id, ['class' => 'form-horizontal', 'id' => 'marginForm']);

						?>

						<p class="card-description card-description1">Margin Management</p>

						<?php if (!empty($db_error_msg)) : ?>
							<div class="alert alert-danger">
								<a href="#" class="close" data-dismiss="alert">&times;</a>
								<strong>Warning!</strong> <?= $db_error_msg ?>
							</div>
						<?php endif; ?>

						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Customer Name*</label>
									<div class="col-sm-7">
										<select name="fv[mar_customer]" id="mar_customer" tabindex="1" class="form-control" required>
											<?php echo $this->$model_name->load_customer($mar_customer); ?>
										</select>
										<span class="help-block">Select customer for margin</span>
									</div>
								</div>
							</div>
						</div>

						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Available Balance *</label>
									<div class="col-sm-7">
										<input type="text" id="available_balance" name="available_balance" readonly class="form-control" disabled />
										<span class="help-block">Current available balance</span>
									</div>
								</div>
							</div>
						</div>

						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Margin Amount*</label>
									<div class="col-sm-7">
										<input type="text" name="fv[mar_amount]" id="mar_amount"
											value="<?= set_value('mar_amount', $mar_amount); ?>"
											required class="form-control" onkeydown="validateKeyPress(event, this,2,10,2)" />
										<span class="help-block">Enter the Margin amount</span>
									</div>
								</div>
							</div>
						</div>

						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Payment Type*</label>
									<div class="col-sm-7">
										<select name="fv[mar_mode]" id="mar_mode" class="form-control" tabindex="4" required>
											<option value="-1" <?= $mar_mode == -1 ? "selected" : "" ?>>--Select--</option>
											<option value="0" <?= $mar_mode == 0 ? "selected" : "" ?>>Cash</option>
											<option value="1" <?= $mar_mode == 1 ? "selected" : "" ?>>Bank Deposit</option>
											<option value="2" <?= $mar_mode == 2 ? "selected" : "" ?>>Bank Transfer</option>
										</select>
										<span class="help-block">Select margin payment type (For reference only)</span>
									</div>
								</div>
							</div>
						</div>

						<div class="row form-sample1">
							<div class="col-md-6">
								<div class="form-group row">
									<label class="col-sm-4 col-form-label">Narration</label>
									<div class="col-sm-7">
										<textarea class="form-control" name="fv[mar_naration]" tabindex="5" id="mar_naration" maxlength="200" onkeydown="validateKeyPress(event, this,6)"><?= $mar_naration ?></textarea>
										<span class="help-block">Enter narration for payment</span>
									</div>
								</div>
							</div>
						</div>

						<div class="row form-sample1" style="margin-top:30px;">
							<div class="col-md-3"></div>
							<div class="col-md-6">
								<button type="submit" id="btn_save" class="btn btn1 btn-success btn-md btn-md1">
								<?= ($status == 'edit') ? 'Update' : 'Save'; ?>
							</button>
								<button type="button" class="btn btn1 btn-danger btn-md btn-md2" onclick="window.history.back()">Cancel</button>
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