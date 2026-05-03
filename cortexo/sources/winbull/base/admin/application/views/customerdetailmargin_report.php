<?php $this->load->view('include/header.php');
$model_name = "customerdelivery_model";
$controller_name = "C_customerDelivery";
?>
<style>
	.edit_values,
	.edit_value,
	.select_status,
	.select_comtype {
		color: #007bff !important;
	}

	.morefilter-btn {
		cursor: pointer;
		color: #001737;
		border: 1px solid #ced4da;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 13px;
		background: #fff;
		transition: all 0.2s;
		display: inline-block;
	}

	.morefilter-btn:hover {
		background: #f8f9fa;
		border-color: #adb5bd;
		text-decoration: none;
	}

	.label-total {
		font-weight: 600;
		color: #6c757d;
		font-size: 13px;
	}

	.values-total {
		font-weight: 700;
		color: #343a40;
		margin-left: 5px;
	}

	.filter-card {
		background: #f8f9fa;
		border: 1px solid #e9ecef;
		border-radius: 10px;
		padding: 15px;
		margin-bottom: 20px;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
</style>
<script type="text/javascript">
	$(function() {
		$('#from_date').datetimepicker({
			pickTime: false
		});
		$('#to_date').datetimepicker({
			pickTime: false
		});
		$(".disb_submit").click(function() {
			$(".disb_submit").attr('disabled', 'disabled');
		});
	});
	jQuery(document).ready(function() {

		<?php
		$result_set = $this->$model_name->get_transactiondate();
		foreach ($result_set->result() as $row) {
		?>
			document.getElementById('from_date').value = "<?php echo $row->from_date; ?>";
			document.getElementById('to_date').value = "<?php echo $row->to_date; ?>"
		<?php
		}
		?>
	});
	$(document).ready(function() {
		// The filter toggle is handled globally by admin/assets/js/lmx.js on id="expand_filter".
	});
</script>
<div>
	<ul class="breadcrumb">
		<li>
			<a href="index.php/C_main/load_mainpage">Admin</a>
		</li>
		<li>
			<a href="#">Reports</a>
		</li>
		<li>
			<a href="#">Customer Detail Margin Report</a>
		</li>
	</ul>
</div>

<div class="row">
	<div class="box col-md-12">
		<div class="box-inner">
			<div class="header-container">
				<h4 class="card-title mb-0"><i class="glyphicon glyphicon-th"></i> Customer Detail Margin</h4>
				<div class="d-flex align-items-center" style="gap: 10px; display: flex;">
					<span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
				</div>
			</div>
			<div class="box-content">
				<div class="filter-card" style="display: none;" id="expand_filter_details">
					<div class="row align-items-end">
						<div class="col-md-3">
							<label class="label-total">From Date</label>
							<input type="text" name="from_date" id="from_date" class="form-control" readonly="true" value="" data-date-format="DD-MM-YYYY" />
						</div>
						<div class="col-md-3">
							<label class="label-total">To Date</label>
							<input type="text" name="to_date" id="to_date" class="form-control" readonly="true" value="" data-date-format="DD-MM-YYYY" />
						</div>
						<div class="col-md-3">
							<label class="label-total">Customer</label>
							<?php $cus = $this->customerdelivery_model->get_active_customers(); ?>
							<select onchange="get_data()" id="cusID" class="form-control">
								<option value="-1"> - SELECT - </option>
								<?php foreach ($cus as $val) { ?>
									<option <?php echo $val['cus_id'] == $cusid ? 'selected="selected"' : ''; ?> value="<?php echo $val['cus_id'] ?>"><?php echo $val['customer'] ?></option>
								<?php } ?>
							</select>
						</div>
						<div class="col-md-3 text-right">
							<button type="button" class="btn btn-info btn-sm" onclick="get_data();"><i class="glyphicon glyphicon-search"></i> Search</button>
						</div>
					</div>
				</div>
				<div align="center">

				</div>
				<?php
				$margin = ($this->$model_name->get_customer_margin_data($row->from_date, $row->to_date, $cusid)->result_array());
				?>
				<table data-click-to-select="true" data-single-select="true" id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive ">
					<thead>
						<tr>
							<th width="20%">Name</th>
							<th width="10%">Ref No </th>
							<th width="15%">Trans Date </th>
							<th width="15%">Trans Type</th>
							<th width="10%">Margin Type</th>
							<th width="15%">Cr </th>
							<th width="15%">Dr </th>
						</tr>
					</thead>
					<tbody>
						<?php
						$margincredit = 0;
						$margindebit  = 0;
						foreach ($margin as $val) {
							$crval = ($val['margincredit'] == '-') ? 0 : $val['margincredit'];
							$drval = ($val['margindebit'] == '-') ? 0 : $val['margindebit'];
							$margincredit = $margincredit + $crval;
							$margindebit  = $margindebit + $drval;
							echo '<tr>
														<td>' . $val['customer'] . '</td>
														<td>' . $val['refcode'] . '</td>
														<td>' . $val['transdate'] . '</td>
														<td>' . $val['transtype'] . '</td>
														<td>' . $val['margintype'] . '</td>
														<td>' . $val['margincredit'] . '</td>
														<td>' . $val['margindebit'] . '</td>
												</tr>';
						}

						?>

					</tbody>
					<tfoot>
						<?php
						echo '<tr style="display:none;">
														<td></td>
														<td></td>
														<td>Total</td>
														<td></td>
														<td></td>
														<td>' . $margincredit . '</td>
														<td>' . $margindebit . '</td>
													</tr>';
						?>
					</tfoot>

				</table>
				<div id="hidden"></div>

				<!-- page content end-->
			</div>
		</div>
	</div>
	<!--/span-->
</div><!--/row-->
<script type="text/javascript">
	//calc_total();
	$(window).load(function() {
		setTimeout(get_data(), 1000);
	});

	function calc_total() {
		var totalQty = 0;
		var totalAmount = 0;
		var avg_rate = 0;
		var total_rate = 0;
		var i = 0;
		$("#grid-data tbody").find("tr").each(function(index, value) {
			i = parseInt(i) + 1;
			totalQty = parseFloat(totalQty) + parseFloat($(this).find(".qty").html());
			totalAmount = parseFloat(totalAmount) + parseFloat($(this).find(".amount").html());
			total_rate = parseFloat(total_rate) + parseFloat($(this).find(".rate").html());
		});

		avg_rate = parseFloat(parseFloat(totalAmount) / parseFloat(totalQty)) * 10;
		$("#total_qty").html(isNaN(totalQty) ? 0 : parseFloat(parseFloat(totalQty).toFixed(2)));
		$("#total_amt").html(isNaN(totalAmount) ? 0 : parseFloat(parseFloat(totalAmount).toFixed(2)));
		$("#avg_rate").html(isNaN(avg_rate) ? 0 : parseFloat(parseFloat(avg_rate).toFixed(2)));
	}

	function get_data() {
		try {
			var table = '';
			table += '<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">';
			table += '<thead><tr><th style="text-align:center">Name</th><th style="text-align:center">Ref.No</th><th style="text-align:center">Trans.Date</th><th style="text-align:center">Trans Type</th><th style="text-align:center">Margin Type</th><th style="text-align:center">Cr</th><th  style="text-align:center">Dr</th></tr></thead><tbody>';
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url') . "index.php/C_customerdelivery/grid_customerdetailmargin/" . $model_name; ?>/" + document.getElementById('from_date').value + "/" + document.getElementById('to_date').value + "/" + document.getElementById('cusID').value,
				success: function(data) {
					var table_val = '';
					$.each(data, function(i) {
						table_val += '<tr><td>' + data[i]['customer'] + '</td><td>' + data[i]['refcode'] + '</td><td>' + data[i]['transdate'] + '</td><td>' + data[i]['transtype'] + '</td><td>' + data[i]['margintype'] + '</td><td>' + data[i]['margincredit'] + '</td><td>' + data[i]['margindebit'] + '</td></tr>';
					});
					$('#grid-data').remove();
					$('#grid-data_wrapper').remove();


					table += table_val;
					table += '</tbody>';
					table_foot = '<tfoot style="display:none;"><tr><td></td><td></td><td>Total</td><td></td><td></td><td></td><td id="total_qty"></td></tr></tfoot>';
					table += table_foot;
					table += '</table>';
					$('.box-content').append(table);
					calc_total();

					oTable = $('#grid-data').dataTable({
						"sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
						"sPaginationType": "bootstrap",
						"iDisplayLength": "100",
						"oLanguage": {
							"sLengthMenu": "_MENU_ records per page"
						}
					});
					$("#grid-data thead th").attr("data-sortable", function(i, val) {
						if (val != 'false') {
							$("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor', 'pointer');
						}
					});
					$('#grid-data_filter label :input').keyup(function(event) {
						calc_total();
					});
					/*if(!isMobile.any())
						$(".datatable").floatThead();*/
				},
				error: function(request, error) {}
			});
		} catch (ex) {
			//console.log(ex);
		}
	}
</script>
<?php $this->load->view('include/footer.php'); ?>
</form>