<?php
$tradeObj = new Trading();
$settings = $tradeObj->get_settings();
?>
<!-- Load jQuery FIRST -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/moment.js"></script>

<!-- Then load DataTables CSS and JS -->
<link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css" />
<script src="//cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js"></script>
<script type="text/javascript">
	$(function() {
		load_report(1);
		// $('#from_date').datetimepicker({
		// 	pickTime: false
		// });
		// $('#to_date').datetimepicker({
		// $('#to_date').datetimepicker({
		// 	pickTime: false
		// });
		$(".refresh_report").click(function() {
			var report_call = $(".headings.headings-active").attr("onclick");
			eval(report_call);
		});
	});

	function load_report(report_type) {
		$(".date_filter").css("display", "none");
		if (report_type == 1) {
			$('#pendingdelv').css("display", "none");
			$('#reports').css({
				"opacity": "0.5",
				"pointer-events": "none"
			});
			$(".report-heading .headings").removeClass("headings-active");
			$(".report-heading #rep_trade_history").addClass("headings-active");
			try {
				var table = '';
				table += '<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date & Time</th><th>Commodity</th><th>Type</th><th>Qty</th><th>Rate</th><th>Del Qty</th><th>Pen Qty</th><th>Pen Amt</th><th>Book by</th><th>Status</th></tr></thead><tbody>';
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "<?php echo $this->config->item('base_url') ?>index.php/C_trade/get_booking_report/trade_model/1",
					success: function(data) {
						$('#reports').css({
							"opacity": "1",
							"pointer-events": "all"
						});

						var table_val = '';
						if (data && data[0]) {
							$.each(data[0], function(i) {

								var status = data[0][i]['bookstatus'];
								status = (status == 6 ? '<span class="label label-success bg-darkgreen font-label">Delivered</span>' : (status == 2 ? '<span class="label label-primary font-label">Waiting for approval</span>' : (status == 3 ? '<span class="label label-danger font-label">Rejected</span>' : (status == 1 ? '<span class="label label-success font-label">Confirmed</span>' : (status == 4 ? '<span class="label label-danger font-label">Limit Cancelled</span>' : (status == 5 ? '<span class="label label-success bg-darkgreen font-label">Partial Del</span>' : (status == 0 ? '<span class="label label-info font-label">Pending</span>' : (status == 7 ? '<span class="label bg-darkred">Expired</span>' : (status == 8 ? '<span class="label bg-darkred">Cancelled, Insufficient margin</span>' : "")))))))));

								table_val += '<tr><td>' + data[0][i]['book_no'] + '</td><td>' + data[0][i]['book_datetime'] + '</td><td>' + data[0][i]['com_name'] + '</td><td>' + data[0][i]['type'] + '</td><td>' + data[0][i]['qty'] + '</td><td>' + (IND_money_format(data[0][i]['book_rate'])) + '</td><td>' + data[0][i]['delivered_qty'] + '</td><td>' + data[0][i]['pending_qty'] + '</td><td>' + (IND_money_format(data[0][i]['pending_amt'])) + '</td><td>' + data[0][i]['book_by'] + '</td><td>' + status + '</td></tr>';
							});
						}
						table += table_val;
						table += '</tbody>';
						table += '</table>';
						$('#reports').empty().append(table);
						$('.report_table').DataTable({
							"aaSorting": []
						});
					},
					error: function(request, error) {}
				});
			} catch (ex) {
				console.log(ex);
			}
		} else if (report_type == 2) {
			$('#pendingdelv').css("display", "none");
			$('#reports').css({
				"opacity": "0.5",
				"pointer-events": "none"
			});
			$(".report-heading .headings").removeClass("headings-active");
			$(".report-heading #rep_pending_deal").addClass("headings-active");
			try {
				var table = '';
				table += '<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date &amp; Time</th><th>Commodity</th><th>Type</th><th>Qty</th><th>Rate</th><th>Status</th></tr></thead><tbody>';
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "<?php echo $this->config->item('base_url'); ?>index.php/C_trade/get_pending_order/trade_model/1",
					success: function(data) {
						$('#reports').css({
							"opacity": "1",
							"pointer-events": "all"
						});

						var table_val = '';
						var ratetr = '';
						if (data && data[0]) {
							$.each(data[0], function(i) {
								var bookstatus = parseInt(data[0][i]['bookstatus']);
								var status = '';
								if (bookstatus == 0) {
									status = '<span class="label label-info font-label">Pending</span>';
								} else if (bookstatus == 1) {
									status = '<span class="label label-success font-label">Confirmed</span>';
								} else if (bookstatus == 3) {
									status = '<span class="label label-danger font-label">Rejected</span>';
								} else if (bookstatus == 4) {
									status = '<span class="label label-danger font-label">Limit Cancelled</span>';
								} else if (bookstatus == 7) {
									status = '<span class="label bg-darkred font-label">Expired</span>';
								} else if (bookstatus == 8) {
									status = '<span class="label bg-darkred font-label">Cancelled, Insufficient margin</span>';
								} else {
									status = '<span class="label label-info font-label">Pending</span>';
								}

								table_val += '<tr ><td id="orderid">' + data[0][i]['book_no'] + '</td><td>' + data[0][i]['book_datetime'] + '</td><td >' + data[0][i]['com_name'] + '</td><td>' + data[0][i]['type'] + '</td><td>' + data[0][i]['qty'] + '</td><td>' + (IND_money_format(data[0][i]['book_rate'])) + '</td><td>' + status + '</td></tr>';
							});
						}
						table += table_val;
						table += '</tbody>';
						table += '</table>';
						$('#reports').empty().append(table);
						$('.report_table').DataTable({
							"aaSorting": []
						});
					},
					error: function(request, error) {}
				});
			} catch (ex) {
				console.log(ex);
			}
		} else if (report_type == 3) {
			//$(".date_filter").css("display","block");
			$('#pendingdelv').css("display", "none");
			$('#reports').css({
				"opacity": "0.5",
				"pointer-events": "none"
			});
			$(".report-heading .headings").removeClass("headings-active");
			$(".report-heading #rep_transactions").addClass("headings-active");
			try {
				var table = '';
				table += '<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Date Time</th><th>Deal No</th><th>Reference</th><th class="align-2">Credit(Rs)</th><th class="align-2">Debit(Rs)</th><th class="align-2">Closing Balance(Rs)</th></tr></thead><tbody>';
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "<?php echo $this->config->item('base_url'); ?>index.php/C_trade/get_customertransactions",
					success: function(data) {
						$('#reports').css({
							"opacity": "1",
							"pointer-events": "all"
						});
						var table_val = '';
						if (data) {
							$.each(data, function(i, value) {
								table_val += '<tr ><td>' + value.trans_date + '</td><td>' + value.trans_book_code + '</td><td>' + value.trans_desc + '</td><td class="align-2">' + value.credit + '</td><td class="align-2">' + value.debit + '</td><td class="align-2">' + value.closing_balance + '</td></tr>';
							});
						}
						table += table_val;
						table += '</tbody>';
						table += '</table>';
						$('#reports').empty().append(table);
						$('.report_table').DataTable({
							"ordering": false
						});
					},
					error: function(request, error) {}
				});
			} catch (ex) {
				console.log(ex);
			}
		} else if (report_type == 5) {
			$('#pendingdelv').css("display", "none");
			$('#reports').css({
				"opacity": "0.5",
				"pointer-events": "none"
			});
			$(".report-heading .headings").removeClass("headings-active");
			$(".report-heading #rep_tradable").addClass("headings-active");
			try {
				var table = '';
				table += '<table class="table table-bordered table-striped table-hover report_table">';
				table += '<thead><tr><th >Commodity</th><th style="text-align:center">Min. Order Qty</th><th style="text-align:center">Max. Order Qty</th><th style="text-align:center">Max. Allot Qty</th></tr></thead><tbody>';
				$.ajax({
					type: "POST",
					dataType: "json",
					url: "<?php echo $this->config->item('base_url') . "index.php/C_trade/get_clientlimit/trade_model"; ?>",
					success: function(data) {
						$('#reports').css({
							"opacity": "1",
							"pointer-events": "all"
						});

						var table_val = '';

						if (data && data[0]) {
							table_val += '<tr><td>Gold</td><td>' + data[0]['gold_min_qty'] + '</td><td>' + data[0]['gold_max_qty'] + '</td><td>' + data[0]['gold_allot_qty'] + '</td></tr><tr><td>Silver</td><td>' + data[0]['silver_min_qty'] + '</td><td>' + data[0]['silver_max_qty'] + '</td><td>' + data[0]['silver_allot_qty'] + '</td></tr>';
						}

						if (table_val == '') {
							table_val = '<tr><td colspan="4">No data available in table</td></tr>';
							row_length = false;
						}

						table += table_val;
						table += '</tbody></table>';
						$('#reports').empty().append(table);
					},
					error: function(request, error) {}
				});
			} catch (ex) {
				console.log(ex);
			}

		} else if (report_type == 6) {
			$('#pendingdelv').css("display", "block");
			$('#reports').css({
				"opacity": "0.5",
				"pointer-events": "none"
			});
			$(".report-heading .headings").removeClass("headings-active");
			$(".report-heading #rep_pendingdev").addClass("headings-active");
			try {
				var table = '';
				table += '<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date & Time</th><th>Commodity</th><th>Type</th><th>Qty</th><th>Rate</th><th>Pen Qty</th><th>Pen Amt</th></tr></thead><tbody>';
				$.ajax({
					type: "POST",
					dataType: "json",
					url: SITE_BASE_URL + "index.php/C_trade/pendingdelv_report/trade_model",
					success: function(data) {
						$('#reports').css({
							"opacity": "1",
							"pointer-events": "all"
						});
						//console.log(data['bookingdata']);
						var table_val = '';
						if (data && data['bookingdata']) {
							$.each(data['bookingdata'], function(i) {
								console.log(data['bookingdata'][i]);
								table_val += '<tr><td>' + data['bookingdata'][i]['bookno'] + '</td><td>' + data['bookingdata'][i]['bookdate'] + '</td><td>' + data['bookingdata'][i]['commodityname'] + '</td><td>' + data['bookingdata'][i]['book_type'] + '</td><td>' + data['bookingdata'][i]['bookqty'] + '</td><td>' + IND_money_format(data['bookingdata'][i]['book_rate']) + '</td><td>' + data['bookingdata'][i]['BalanceQty'] + '</td><td>' + IND_money_format(data['bookingdata'][i]['pending_amt']) + '</td></tr>';
							});
						}
						table += table_val;
						table += '</tbody>';
						table += '</table>';
						$('#reports').empty().append(table);
						$('.report_table').DataTable({
							"aaSorting": []
						});
						console.log(data['bookiingtotal']);
						$("#qty_gold_buy").html(data['bookiingtotal']['qty_gold_buy']);
						$("#qty_gold_sell").html(data['bookiingtotal']['qty_gold_sell']);
						$("#qty_silver_buy").html(data['bookiingtotal']['qty_silver_buy']);
						$("#qty_silver_sell").html(data['bookiingtotal']['qty_silver_sell']);
						$("#amount_gold").html(data['bookiingtotal']['amount_gold']);
						$("#amount_silver").html(data['bookiingtotal']['amount_silver']);
						$("#amount_total").html(data['bookiingtotal']['amount_total']);

					},
					error: function(request, error) {}
				});
			} catch (ex) {
				console.log(ex);
			}
		}
	}
</script>
<!-- Main -->
<div id="main">
	<!-- Portfolio -->
	<section class="allReports allReports1 contant">
		<div class="container " style="">
			<section>
				<div class="col-md-12 col-sm-12 col-xs-12 contant1" style="">
					<div>
						<div class="col-md-12 col-sm-12 col-xs-12 tab-content" style="padding:0px">
							<div class="col-md-12 col-sm-12 col-xs-12 reports-container reports-container1">
								<div class="col-md-12 col-sm-12 col-xs-12 report-heading paddingzero row reportss">
									<div class="col-md-2 col-sm-12 col-xs-12 headings headings-active" onclick="load_report(1)" id="rep_trade_history">
										Trade History
									</div>
									<div class="col-md-2 col-sm-12 col-xs-12 headings" onclick="load_report(2)" id="rep_pending_deal">
										Limit Orders
									</div>
									<div <?php if ($settings['display_margin'] == 0) { ?> style="display:none" <?php } ?> class="col-md-2 col-xs-12 col-sm-12 headings" onclick="load_report(3)" id="rep_transactions">
										Transactions
									</div>
									<div <?php if ($settings['clientlimit_enable'] == 0) { ?> style="display:none" <?php } ?> class="col-md-2 col-sm-12 col-xs-12 headings" onclick="load_report(5)" id="rep_tradable">
										Client Limit
									</div>
									<div class="col-md-2 col-sm-12 col-xs-12 headings" onclick="load_report(6)" id="rep_pendingdev">
										Pending Delivery
									</div>
									<div class="col-md-2 col-sm-12 col-xs-12 refresh_report1">
										( <i class="fa fa-refresh refresh_report" title="Click here to refresh"></i> )
									</div>
								</div>

							</div>
							<div id="pendingdelv" style="display:none;">
								<div class="col-md-12 col-sm-12 col-xs-12 " style="color: #000 ;">
									<div class="col-md-3 col-sm-3 col-xs-12">
										D. Pend Gold Qty : <span style="font-weight: bold;" id="qty_gold_buy"></span>
									</div>
									<div class="col-md-3 col-sm-3 col-xs-12">
										D. Pend Gold Amount : <span style="font-weight: bold;" id="amount_gold"></span>
									</div>
									<div class="col-md-3 col-sm-3 col-xs-12">
										D. Pend Silver Qty : <span style="font-weight: bold;" id="qty_silver_buy"></span>
									</div>
									<div class="col-md-3 col-sm-3 col-xs-12">
										D. Pend Silver Amount : <span style="font-weight: bold;" id="amount_silver"></span>
									</div>
								</div>
							</div>
							<div class="col-md-12 col-sm-12 col-xs-12 date_filter" style="display:none">
								<div class="col-md-3 col-sm-12 col-xs-12">
								</div>
								<div class="col-md-3 col-sm-12 col-xs-12">
									<div class="col-md-4 col-sm-4 col-xs-12 label">
										From :
									</div>
									<div class="col-md-8 col-sm-8 col-xs-12">
										<input type="text" class="form-control" id="from_date" readonly>
									</div>
								</div>
								<div class="col-md-3 col-sm-3 col-xs-12">
									<div class="col-md-4 col-sm-4 col-xs-12 label">
										To :
									</div>
									<div class="col-md-8 col-sm-8 col-xs-12">
										<input type="text" class="form-control" id="to_date" readonly>
									</div>
								</div>
								<div class="col-md-3 col-sm-3 col-xs-12">
								</div>
							</div>

							<div id="reports" class="reports1">
								<table class="table table-bordered table-striped table-hover report_table">
									<thead>
										<tr>
											<th>Order No.</th>
											<th>Date&amp;Time</th>
											<th>Commodity</th>
											<th>Type</th>
											<th>Qty</th>
											<th>Del Qty</th>
											<th>Pen Qty</th>
											<th>Price</th>
											<th>Status</th>
										</tr>
									</thead>
									<tbody>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</section>

		</div>
	</section><br><br><br><br><br><br><br>
</div>
