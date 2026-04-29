<?php
$this->load->view('include/header.php');
$model_name = "booking_model";
$controller_name = "C_ajx";
?>
<script type="text/javascript">
	$(function() {
		$("#refresh_page").click(function(event) {
			event.preventDefault();
			get_data();
		});
	});
</script>
<?php

$model_name = "booking_model";
$controller_name = "C_booking";
?>
<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="box col-md-12 grid-margin stretch-card">
				<div class="card">
					<div class="card-body">
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Quotation Listing

						</h4>
						<p class="card-description"> </p>
						<div class="table-responsive box-content">
							<!-- page content end-->
						</div>
					</div>
				</div>
			</div>
			<!--/span-->
		</div><!--/row-->
	</div>
	<!-- partial -->
</div>
<script type="text/javascript">
	get_data();

	function get_data() {
		try {
			var table = '';
			table += '<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable">';
			table += '<thead><tr>' +
				'<th class="col-sno">SNO</th>' +
				'<th class="col-datetime">Date & Time</th>' +
				'<th class="col-company">Company Name</th>' +
				'<th class="col-country" style="white-space: pre-line;">Country Code</th>' +
				'<th class="col-mobile">Mobile No</th>' +
				'<th class="col-gst">GST No</th>' +
				'<th class="col-approved">Approved</th>' +
				'<th class="col-narration">Narration</th>' +
				'<th class="col-action">Action</th>' +
				'</tr></thead><tbody>';

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/get_quotation_data",
				success: function(data) {
					var table_val = '';

					$.each(data, function(i) {
						var Sno = i + 1;
						var quotation_id = data[i]['quotation_id'] || '';
						var approved = data[i]['approved'] || '0';
						var narration = data[i]['narration'] || '';

						table_val += '<tr>' +
							'<td style="text-align:center">' + Sno + '</td>' +
							'<td style="text-align:center;white-space: pre-line;">' + data[i]['created_at'] + '</td>' +
							'<td style="text-align:center">' + data[i]['company_name'] + '</td>' +
							'<td style="text-align:right; white-space:nowrap;">' + (data[i]['country'] || '') + '</td>' +
							'<td style="text-align:right; white-space:nowrap;">' + (data[i]['mobile_no'] || '') + '</td>' +
							'<td style="text-align:center; white-space:nowrap;">' + (data[i]['gst_no'] || '') + '</td>' +
							'<td style="text-align:center"><input type="checkbox" class="approved-checkbox" data-id="' + quotation_id + '" ' + (approved == '1' ? 'checked' : '') + '></td>' +
							'<td style="text-align:center;    padding: 5px !important;"><textarea class="form-control narration-text" data-id="' + quotation_id + '" rows="4">' + narration + '</textarea></td>' +
							'<td style="text-align:center"><button class="btn btn-primary btn-sm save-btn" data-id="' + quotation_id + '">Save</button></td>' +
							'</tr>';
					});
					$('#grid-data').remove();
					$('#grid-data_wrapper').remove();
					table += table_val;
					table += '</tbody>';
					table += '</table>';
					$('.box-content').append(table);

					oTable = $('#grid-data').DataTable({
						bSort: true,
						bInfo: true,
						destroy: true,
						autoWidth: false,

						dom: 'lBfrtip',
						order: [
							[0, "desc"]
						],
						buttons: [{
								extend: 'print',
								footer: true,
								title: 'Quotation List'
							},
							{
								extend: 'excel',
								footer: true,
								title: 'Quotation List'
							}
						],
						language: {
							lengthMenu: "_MENU_ records per page"
						},


					});

					// style cursor for sortable headers
					$("#grid-data thead th").attr("data-sortable", function(i, val) {
						if (val != 'false') {
							$("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor', 'pointer');
						}
					});

				},
				error: function(request, error) {
					console.log(error);
				}
			});
		} catch (ex) {
			console.log(ex);
		}
	}


	// Save button click handler
	$(document).on('click', '.save-btn', function() {
		console.log('Save button clicked');
		var quotation_id = $(this).data('id');
		var approved = $(this).closest('tr').find('.approved-checkbox').is(':checked') ? 1 : 0;
		var narration = $(this).closest('tr').find('.narration-text').val();

		$.ajax({
			type: "POST",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_ajax/update_quotation",
			data: {
				quotation_id: quotation_id,
				approved: approved,
				narration: narration
			},
			success: function(response) {
				toastr["success"]("Updated successfully");
			},
			error: function() {
				toastr["error"]("Update failed");
			}
		});
	});

	$(document).ready(function() {
		<?php if ($this->session->flashdata('mrgmessage')) { ?>
			toastr["error"]("<?php echo $this->session->flashdata('mrgmessage'); ?>");
		<?php } ?>
	});
</script>
<style>
	/* Country Code column width */
	#grid-data th:nth-child(4),
	#grid-data td:nth-child(4) {
		width: 80px;
		max-width: 80px;
	}

	/* Narration column */
	#grid-data td:nth-child(8) {
		width: 300px;
	}

	/* Narration textarea styling */
	.narration-text {
		width: 150px !important;
		/* padding: 2px !important;
		margin: 0 !important;
		resize: both;
		border: 1px solid #ccc;
		min-height: 40px;
		background: white; */
	}

	textarea.form-control {
		padding: 5px !important;
		min-height: 70px !important;
		height: 70px !important;
	}


	/* Action column */
	#grid-data th:nth-child(9),
	#grid-data td:nth-child(9) {
		width: 80px;
	}
</style>
<?php $this->load->view('include/footer.php'); ?>