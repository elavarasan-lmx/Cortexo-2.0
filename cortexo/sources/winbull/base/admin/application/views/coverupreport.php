<?php $this->load->view('include/header.php');
$controller_name = "C_customerDelivery";
$model_name = "Customerdelivery_model";
?>
<link rel="stylesheet" href="<?php echo $this->config->item('base_url'); ?>assets/css/radiobuttons.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">

<script type="text/javascript">
	$(document).ready(function() {
		$("#pop_bankbook").click(function() {
			$('#myModal').modal('show');
		});
	});
	$(function() {
		$('#from_date').datetimepicker({
			pickTime: false
		});
		$('#to_date').datetimepicker({
			pickTime: false
		});
		$('#cov_date').datetimepicker({
			format: 'DD-MM-YYYY hh:mm A',
			pickTime: false
		});

		$("#refresh_page").click(function(event) {
			event.preventDefault();
			get_data();
		});
	});
	jQuery(document).ready(function() {

		<?php
		$result_set = $this->$model_name->get_transactiondate_coverup();
		foreach ($result_set->result() as $row) {

		?>
			document.getElementById('from_date').value = "<?php echo $row->from_date; ?>";
			document.getElementById('to_date').value = "<?php echo $row->to_date; ?>"
		<?php
		}
		$result_set->free_result();
		?>
	});

	function customer_request() {
		$("#loader").css('display', 'block');
		var cov_date = $("#cov_date").val();
		var cov_mcxbuyqty = document.getElementById("cov_mcxbuyqty").value;
		var cov_mcxsellqty = document.getElementById("cov_mcxsellqty").value;
		var cov_comtype = $("#cov_comtype").is(":checked") ? 0 : 1;

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_customerDelivery/converup_request",
			data: "cov_date=" + cov_date + "&cov_mcxbuyqty=" + cov_mcxbuyqty + "&cov_mcxsellqty=" + cov_mcxsellqty + "&cov_comtype=" + cov_comtype,
			success: function(data) {
				$("#loader").css('display', 'none');
				if (data.status == true) {
					toastr["success"](data.message);
					document.getElementById("cov_mcxbuyqty").value = "";
					document.getElementById("cov_mcxsellqty").value = "";
				} else {
					toastr["error"](data.message);
				}
				get_data();
			}
		});
	}
</script>
<script>
	$(window).load(function() {
		$('#clickpdf').on('click', function(e) {
			e.preventDefault();
			var data = document.getElementById('BookNos');
			data.innerHTML = "";
			data.innerHTML += "<input type='hidden' name='branch' value='" + document.getElementById('book_branch').value + "' />";
			data.innerHTML += "<input type='hidden' name='comtype' value='" + document.getElementById('com_type').value + "' />";
			data.innerHTML += "<input type='hidden' name='fromdate' value='" + document.getElementById('from_date').value + "' />";
			data.innerHTML += "<input type='hidden' name='todate' value='" + document.getElementById('to_date').value + "' />";
			$('#clickid').val(1);
			document.forms["printForm"].submit();
		});
		$('#clickexcel').on('click', function(e) {
			e.preventDefault();
			var data = document.getElementById('BookNos');
			data.innerHTML = "";
			data.innerHTML += "<input type='hidden' name='branch' value='" + document.getElementById('book_branch').value + "' />";
			data.innerHTML += "<input type='hidden' name='comtype' value='" + document.getElementById('com_type').value + "' />";
			data.innerHTML += "<input type='hidden' name='fromdate' value='" + document.getElementById('from_date').value + "' />";
			data.innerHTML += "<input type='hidden' name='todate' value='" + document.getElementById('to_date').value + "' />";
			$('#clickid').val(2);
			document.forms["printForm"].submit();
		});
	});
</script>
<style>
	/* Add space below Search and Show Entries */
	.dataTables_filter,
	.dataTables_length {
		margin-bottom: 10px !important;
	}

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

	.add_new {
		margin-top: 0px;
	}

	.excel,
	.Print {
		margin-right: 0px;
	}

	.Add {
		margin-top: 0px;
	}

	.btn-success {
		color: #fff;
		background-color: #21bf06;
		border-color: #21bf06;
	}
</style>
<!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Transaction</a>
            </li>
			 <li>
                <a href="#">Coverup</a>
            </li>
        </ul>
    </div>-->
<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>

<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-12 grid-margin stretch-card">
				<div class="card">
					<div class="header-container">
						<h4 class="card-title mb-0"><i class="glyphicon glyphicon-th"></i> Coverup</h4>
						<div class="d-flex align-items-center" style="gap: 10px; display: flex;">
							<span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
							<?php if ($userrights["add"] == 1) { ?>
								<label for="banklivePrice" id="pop_bankbook" class="btn btn-primary btn-sm mb-0" style="cursor: pointer;"><i class="typcn typcn-document-add btn-icon-append"></i> Add</label>
							<?php } ?>
							<a href="#" class="btn btn-danger btn-sm" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>
							<a id="clickpdf" class="btn btn-primary btn-sm" href="#"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
						</div>
					</div>
					<?php
					$attributes = array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
					echo form_open('C_customerDelivery/print_record/CR/' . $model_name, $attributes);
					?>
					<div id="BookNos"></div>
					<input type="hidden" id="clickid" name="clickprocess" value="">
					</form>
					<div class="box-content">
						<div class="filter-card" style="display: none;" id="expand_filter_details">
							<div class="row align-items-end">
								<div class="col-md-3">
									<label class="label-total">From Date</label>
									<input type="text" name="from_date" id="from_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" class="form-control mb-0" />
								</div>
								<div class="col-md-3">
									<label class="label-total">To Date</label>
									<input type="text" name="to_date" id="to_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" class="form-control mb-0" />
								</div>
								<div class="col-md-2">
									<label class="label-total">Commodity Type</label>
									<select name='com_type' id='com_type' class="form-control" onchange="get_data()">
										<option value="0">GOLD</option>
										<option value="1">SILVER</option>
									</select>
								</div>
								<div class="col-md-2">
									<label class="label-total">Branch</label>
									<select onchange="get_data();" name='book_branch' id='book_branch' tabindex="4" class="form-control">
										<option value='-1'>ALL</option>
										<?php
										foreach ($branches as $state) {
											$str = ($state['branch_id'] == $book_branch) ? "selected='selected'" : "";
											echo "<option value='" . $state['branch_id'] . "' " . $str . " >" . $state['branch_name'] . "</option>";
										}
										?>
									</select>
								</div>
								<div class="col-md-2 text-right">
									<button type="button" class="btn btn-info btn-sm" onclick="get_data();"><i class="glyphicon glyphicon-search"></i> Search</button>
								</div>
							</div>
						</div>
						<table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
							<thead>
								<tr>
									<th class="align-2">Date</th>
									<th class="align-2">Phy Open(Grams)</th>
									<th class="align-2">F& O Open(Grams)</th>
									<th class="align-2">Phy Buy(Grams)</th>
									<th class="align-2">F& O Buy(Grams)</th>
									<th class="align-2">Phy Sell(Grams)</th>
									<th class="align-2">F& O Sell(Grams)</th>
									<th class="align-2">Phy Closing(Grams)</th>
									<th class="align-2">F& O Closing(Grams)</th>
									<th class="align-2">P/L</th>
								</tr>
							</thead>
							<tbody>
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content" style="margin-top: 20vh;">
				<div class="modal-header">
					<div class="col-md-12">
						<div class="row form-sample1">
							<h4 class="modal-title col-sm-8" id="myModalLabel">F & O Entry</h4>
							<button type="button" class="close col-sm-4" data-dismiss="modal" aria-hidden="true">
								&times;</button>
						</div>
					</div>
				</div>
				<div class="modal-body">
					<div class="row">
						<div class="col-md-12">
							<!-- Tab panes -->
							<div class="tab-content" style="margin-top: 10px;">
								<form role="form" class="form-horizontal">
									<div class="form-group col-md-12">
										<div class="row form-sample1">
											<label for="Ounce" class="col-md-4 control-label">
												Date</label>
											<div class="col-md-6">
												<input type="text" name="fv[cov_date]" id="cov_date" size="20" readonly="true" value="" style="width:100%;border-radius: 4px;border: 1px solid #cccccc;" />
											</div>
											<div class="col-md-2">

											</div>
										</div>
									</div>
									<div class="form-group col-md-12">
										<div class="row form-sample1">
											<label for="Ounce" class="col-md-4 control-label">
												Buy Qty</label>
											<div class="col-md-6">
												<input type="text" class="form-control" id="cov_mcxbuyqty" placeholder="" name="cov_mcxbuyqty" />
											</div>
											<div class="col-md-2">

											</div>
										</div>
									</div>
									<div class="form-group col-md-12">
										<div class="row form-sample1">
											<label for="Ounce" class="col-md-4 control-label">
												Sell Qty</label>
											<div class="col-md-6">
												<input type="text" class="form-control" id="cov_mcxsellqty" placeholder="" name="cov_mcxsellqty" />
											</div>
											<div class="col-md-2">

											</div>
										</div>
									</div>
									<div class="form-group col-md-12">
										<div class="row form-sample1">
											<label for="Ounce" class="col-md-4 control-label">
												Type</label>
											<div class="col-md-6">
												<span class="col-md-6">
													<input checked type="radio" value="0" name="cov_comtype" id="cov_comtype" class="option-input radio" style="padding: 0px 0px;display: inline;" /> <label for="cov_comtype" style="position: relative;">Gold</label>
												</span>
												<span class="col-md-6">
													<input type="radio" value="1" name="cov_comtype" id="cov_comtypesilver" class="option-input radio" style="padding: 0px 0px;display: inline;" /> <label for="cov_comtypesilver" style="position: relative;">Silver</label>
												</span>
											</div>
											<div class="col-md-2">

											</div>
										</div>
									</div>

									<div class="row form-sample1">
										<div class="col-md-4">
										</div>
										<div class="col-md-3" onclick="customer_request();">
											<button type="button" class="btn btn-info btn-sm" data-dismiss="modal" aria-hidden="true" style="color: #fff;background-color: #21bf06;border-color: #21bf06;">
												Save</button>
										</div>
									</div>
								</form>

							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<!-- partial -->
</div>

<script type="text/javascript">
	$(document).ready(function() {
		<?php
		$result_set = $this->$model_name->get_transactiondate_coverup();
		foreach ($result_set->result() as $row) {
		?>
			document.getElementById('from_date').value = "<?php echo $row->from_date; ?>";
			document.getElementById('to_date').value = "<?php echo $row->to_date; ?>"
		<?php
		}
		$result_set->free_result();
		?>
		$('#from_date').datetimepicker({
			pickTime: false
		});
		$('#to_date').datetimepicker({
			pickTime: false
		});
		get_data();
	});
	var valueetest = [];
	var valueetest1 = [];

	function get_data() {
		try {
			var table = '';
			table += '<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">';
			table += '<thead>' +
				'<tr>' +
				'<th class="align-2">Date</th>' +
				'<th class="align-2">Phy Open (Grams)</th>' +
				'<th class="align-2">F& O Open (Grams)</th>' +
				'<th class="align-2">Phy Buy (Grams)</th>' +
				'<th class="align-2">Phy Buy Avg</th>' +
				'<th class="align-2">F& O Buy (Grams)</th>' +
				'<th class="align-2">Phy Sell (Grams)</th>' +
				'<th class="align-2">Phy Sell Avg</th>' +
				'<th class="align-2">F& O Sell (Grams)</th>' +
				'<th class="align-2">Phy Closing (Grams)</th>' +
				'<th class="align-2">F& O Closing (Grams)</th>' +
				'<th class="align-2">P/L</th>' +
				'</tr>' +
				'</thead>' +
				'<tbody>';
			$.ajax({
				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url') ?>index.php/C_customerDelivery/coverup_record/" + document.getElementById('book_branch').value + "/" + document.getElementById('com_type').value + "/" + document.getElementById('from_date').value + "/" + document.getElementById('to_date').value,
				success: function(data) {
					//console.log(data);
					var table_val = '';
					valueetest = data;
					//valueetest1   = data.result;

					var phygoldsellgty = 0;
					var phygoldbuygty = 0;
					var selltot = 0;
					var buytot = 0;
					var pltot = 0;
					var physellgoldprofit = 0;
					var phybuygoldprofit = 0;
					var physellgoldavg = 0;
					var phybuygoldavg = 0;
					var physellgoldqty = 0;
					var phybuygoldqty = 0;
					var physellgoldavgg = 0;
					var phybuygoldavgg = 0;
					var pltotal = 0;
					// Safe value helpers - prevent "null" and "NaN" display
					var sv = function(val, def) { return (val !== null && val !== undefined && val !== '') ? val : (def || '-'); };
					var sn = function(val) { var n = parseFloat(val); return isNaN(n) ? 0 : n; };

					$.each(data, function(i, value) {

						phygoldsellgty = sn(value['phy_goldsell']);

						phygoldbuygty = sn(value['phy_goldbuy']);


						selltot = sn(value['sell']);
						buytot = sn(value['buy']);

						physellgoldavg = phygoldsellgty > 0 ? selltot / phygoldsellgty : 0.00;
						phybuygoldavg = phygoldbuygty > 0 ? buytot / phygoldbuygty : 0.00;

						/* physellgoldqty = isNaN(phygoldsellgty) ? 0.00 : phygoldsellgty;
						physellgoldavgg = isNaN(physellgoldavg) ? 0.00 : physellgoldavg; */


						/* phybuygoldqty = isNaN(phygoldbuygty) ? 0.00 : phygoldbuygty.toFixed(2);
						phybuygoldavgg = isNaN(phybuygoldavg) ? 0.00 : phybuygoldavg.toFixed(2); */



						physellgoldprofit = phygoldsellgty * physellgoldavg;
						phybuygoldprofit = phygoldsellgty * phybuygoldavg;


						pltot = physellgoldprofit - phybuygoldprofit;

						pltotal = Math.round(pltot);

						physellgoldavgg = isNaN(physellgoldavg) ? 0.00 : physellgoldavg.toFixed(3);
						phybuygoldavgg = isNaN(phybuygoldavg) ? 0.00 : phybuygoldavg.toFixed(3);

						table_val += '<tr><td style="text-align: right;">' + sv(value['book_datetime']) + '</td>' +
							'<td style="text-align: right;">' + sv(value['phy_opening'], '0') + '</td>' +
							'<td style="text-align: right;">' + sv(value['mcx_opening'], '0') + '</td>' +
							'<td style="text-align: right;">' + phygoldbuygty + '</td>' +
							'<td style="text-align: right;">' + phybuygoldavgg + '</td>' +
							'<td style="text-align: right;">' + sv(value['mcx_goldbuy'], '0') + '</td>' +
							'<td style="text-align: right;">' + phygoldsellgty + '</td>' +
							'<td style="text-align: right;">' + physellgoldavgg + '</td>' +
							'<td style="text-align: right;">' + sv(value['mcx_goldsell'], '0') + '</td>' +
							'<td style="text-align: right;">' + sv(value['phyclosing'], '0') + '</td>' +
							'<td style="text-align: right;">' + sv(value['mcx_closing'], '0') + '</td>' +
							'<td style="text-align: right;">' + pltotal + '</td>' +
							'</tr>';
					});
					$('#grid-data').remove();
					$('#grid-data_wrapper').remove();

					table += table_val;
					table += '</tbody>';
					table += '</table>';
					//console.log(table)
					$('.box-content').append(table);

					oTable = $('#grid-data').DataTable({
						"sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
						"sPaginationType": "bootstrap",
						"iDisplayLength": "50",
						"order": [
							[0, "desc"]
						],
						"ordering": false,
						"searching": true,
						"oLanguage": {
							"sLengthMenu": "_MENU_ records per page"
						}
					});

					// Recalculate column widths on window resize/zoom
					$(window).off('resize.dtResize').on('resize.dtResize', function() {
						clearTimeout(window._dtResizeTimer);
						window._dtResizeTimer = setTimeout(function() {
							if (typeof oTable !== 'undefined' && oTable !== null) {
								oTable.columns.adjust();
							}
						}, 200);
					});
				}
			});
		} catch (ex) {
			console.log(ex);
		}
	}
</script>
<?php $this->load->view('include/footer.php'); ?>