<?php
$this->load->view('include/header.php');
$controller_name = "C_customerDelivery";
$model_name = "Customerdelivery_model";
?>
<style type="text/css">
	.table_data {
		text-align: center;
	}

	/* ===== VERTICAL SCROLLBAR ON RIGHT SIDE ===== */
	.table-responsive.box-content {
		max-height: 600px;
		overflow-y: auto;
		overflow-x: auto;
	}

	.table-responsive.box-content::-webkit-scrollbar {
		width: 14px;
		height: 12px;
	}

	.table-responsive.box-content {
		scrollbar-width: thin;
		scrollbar-color: #888 #f1f1f1;
	}
</style>

<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-tooltip.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-popover.js"></script>
<link href="<?php echo $this->config->item('base_url'); ?>assets/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet" />
<script src="<?php echo $this->config->item('base_url'); ?>assets/bootstrap3-editable/js/bootstrap-editable.min.js"></script>

<script src="<?php echo $this->config->item('base_url'); ?>assets/js/jquery-play-sound.js"></script>

<?php
$attributes = array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
echo form_open('C_customerDelivery/print_record/MT5/' . $model_name, $attributes);
?>

<input type="hidden" id="clickid" name="clickprocess" value="">
<!--<div>
        <ul class="breadcrumb">
            <li>
                <a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
            </li>
            <li>
                <a href="#">Transaction</a>
            </li>
			 <li>
                <a href="#">Customer Ledger</a>
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
					<div class="card-body">
						<h4 class="card-title"><i class="glyphicon glyphicon-th"></i> Unfix report ( <i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i> )
							<!-- <a href="#" class="btn btn-primary btn-sm add_new" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>  -->

							<!-- <a onclick="print_form(event)" class="btn btn-primary btn-sm add_new Print" href="#" ><i class="typcn typcn-printer btn-icon-append"></i> Print</a>  -->
						</h4>
						<p class="card-description"> </p>
						<div class="col-md-12">
							<?php if ($this->session->flashdata('success')) { ?>
								<div class="alert alert-success" style="text-align:center">
									<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
									<p><?php echo $this->session->flashdata('success'); ?></p>
								</div>
							<?php } else if ($this->session->flashdata('error')) { ?>
								<div class="alert alert-danger" style="text-align:center">
									<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
									<p><?php echo $this->session->flashdata('error'); ?></p>
								</div>
							<?php } ?>
						</div>
						<?php
						$attributes 		= 	array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
						echo form_open('C_customerDelivery/print_record/TT/' . $model_name, $attributes);  ?>
						<div id="BookNos"></div>
						<div class="box-content">
							<!-- <div>
										<input type="text" name="from_date" id="from_date" size="20" readonly="true" value="" data-date-format="DD-MM-YYYY" /> 
										<input type="text" name="to_date" id="to_date" size="20" readonly="true" value=""  data-date-format="DD-MM-YYYY" />&nbsp;<i style="cursor:pointer" onclick="get_data();" class="glyphicon glyphicon-search"></i>
									</div> -->

						</div>

					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- partial -->
</div>
<div class="modal fade" id="delDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">

	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<div class="col-md-12">
					<div class="row form-sample1">
						<button type="button" class="close clx" data-dismiss="modal">�</button>
						<h3>Delete</h3>
					</div>
				</div>
			</div>
			<div class="modal-body">
				<p>Are you sure! You want to delete the record(s)...</p>
			</div>
			<div class="modal-footer">
				<a href="#" class="btn btn-danger" id="confirm_del" data-dismiss="modal">Confirm</a>
				<a href="#" class="btn btn-primary clx" data-dismiss="modal">Cancel</a>
			</div>
		</div>
	</div>

</div>

<a style="display:none" class="btn btn-primary noty" data-noty-options="{&quot;text&quot;:&quot;New booking request received...&quot;,&quot;layout&quot;:&quot;bottomRight&quot;,&quot;type&quot;:&quot;success&quot;}">
	<i class="glyphicon glyphicon-bell icon-white"></i> Bottom Right (fade)
</a>
</div>
<script type="text/javascript">
	$(window).load(function() {
		get_data();
		$("body").on('keyup', '#grid-data_filter label :input', function(event) {
			calc_total();
		});

	});

	function print_form(e) {
		e.preventDefault();
		var flag = false;
		var data = document.getElementById('BookNos');
		data.innerHTML = "";
		$("#grid-data tbody").find("tr").each(function(index, value) {
			if ($(this).find(".hedgid").html()) {
				flag = true;
				data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".hedgid").html() + "' />";
			} else {
				flag = false;
			}
		});
		var order_by = " ORDER BY ";
		$('#clickid').val(3);
		document.forms["printForm"].submit();
	}
	$('#clickexcel').on('click', function(e) {
		e.preventDefault();
		var flag = false;
		var data = document.getElementById('BookNos');
		data.innerHTML = "";
		$("#grid-data tbody").find("tr").each(function(index, value) {
			if ($(this).find(".hedgid").html()) {
				flag = true;
				data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".hedgid").html() + "' />";
			} else {
				flag = false;
			}
		});
		$('#clickid').val(2);
		document.forms["printForm"].submit();

	});

	function get_data() {


		try {
			var table = '';
			var totalPaidWeight = 0;
			var totalPaidAmt = 0;
			var totalUnfixAmt = 0;
			var totalBookingWeight = 0;
			var balance = 0;
			var weight_differences = 0; //3star
			var amt_difference = 0;
			var bal_pure = 0;
			var purity_rates = 0;

			var totaldifference_data = 0;
			var totalweight_differ = 0;
			var totalgold_weight = 0;
			var difference_data = 0;
			table += '<table id="grid-data" class="table table-striped table-bordered bootstrap-datatable datatable responsive">';
			table += '<thead>';
			//table +='<thead><tr><th>Hedge ID </th><th>Deal ID </th><th>Order ID </th><th>QTY (Grms) </th><th>Price</th><th>Bid</th><th>Ask</th><th>Req ID</th><th>Symbol</th><th>Book No</th><th>Booked on</th><th>Comment</th><th style="display:none">Booked By</th><th style="display:none">Order For</th><th>Action</th></tr></thead><tbody>';

			//3star
			table += '<tr><th  style="width:4%"  >Customer ID </th><th style="text-align:left;width:4%;">Cus  Name</th><th style="width:5%;">Issued Weight(gm)</th><th style="width:5%;">RTGS Received Amount </th><th style="width:4%;">Unfix Close Amount</th><th style="width:5%;">Unfix Closed Weight</th><th  style="width:5%;">Pending Amount to Rate Cut</th><th style="width:5%;">Pending Pure to Rate Cut</th><th style="width:5%;">Final Avg</th><th style="width:5%;">Manual Avg Rate</th><th style="width:5%;">Pure to Rate Cut</th><th style="width:5%;">Balance Pure to Be Given</th></tr><tbody>';
			//3end

			$.ajax({
				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/unfix_booking_report/" . $model_name; ?>",

				success: function(data) {
					console.log(data)
					var table_val = '';
					$.each(data, function(i) {
						var weight = data[i]['weight'];
						console.log(weight)

						//Gold weight
						var gold_weight = parseFloat(weight);
						var gold_weight = gold_weight.toFixed(2);
						//Weight Difference
						var weight_differ = data[i]['weight_differ'];
						var weight_differ = parseFloat(weight_differ);
						var weight_differ = weight_differ.toFixed(2);

						var weight = parseFloat(data[i]['weight']).toFixed(2);
						var pureWeight = parseFloat(data[i]['pure_weight']);
						console.log("pureWeight", pureWeight);
						var totalAmountUnfix = parseFloat(data[i]['total_amount_unfix']);
						console.log("totalAmountUnfix", totalAmountUnfix);
						var totalAmountBooking = parseFloat(data[i]['total_amount_booking']);
						console.log("totalAmountBooking", totalAmountBooking);
						var weight_difference = parseFloat(data[i]['weight_differ']);
						var amt_differ = parseFloat(data[i]['difference']);
						//console.log(amt_differ);
						var linktocusunfix = '<a href="<?php echo $this->config->item('base_url'); ?>index.php/C_admin_unfix/cus_unfix_payment/' + data[i]['customer_id'] + '" target="_blank">' + data[i]['customer_name'] + '</a>';
						//3star
						//var final_avg = parseFloat(amt_differ / pureWeight).toFixed(2); 
						var final_avg = parseFloat(totalAmountUnfix / pureWeight).toFixed(2);


						var manual_avg = '<a href="#" class="edit_values avg_rate " data-name="avg_rate" data-pk="' + (data[i]['customer_id']) + '" data-type="text" data-placement="left" data-title="Update rate">' + parseFloat(data[i]["avg_rate"]).toFixed(2) + '</a>';

						var avg_rate = parseFloat(data[i]["avg_rate"]);
						console.log("avg_rate", avg_rate);
						difference_data = data[i]['total_amount_unfix'] - data[i]['total_amount_booking'];
						console.log("difference_data", difference_data);
						weight_differ = data[i]['pure_weight'] - gold_weight;

						var pure_rate_cut = Number((avg_rate !== 0) ? parseFloat(difference_data / avg_rate).toFixed(2) : '0.00');
						console.log("pure_rate_cut", pure_rate_cut);
						var pending_pure_to_rate_cut = pureWeight - gold_weight;
						//var balance_pure =  Number (parseFloat( pureWeight - weight_difference).toFixed(2));
						var balance_pure = Number(parseFloat(pure_rate_cut - pending_pure_to_rate_cut).toFixed(2));
						console.log("balance_pure", balance_pure);


						//3end

						totalPaidWeight += pureWeight;
						totalPaidAmt += totalAmountUnfix;
						totalUnfixAmt += totalAmountBooking;
						weight_differences += weight_difference;
						amt_difference += amt_differ;
						totalBookingWeight += parseFloat(weight);
						purity_rates += pure_rate_cut;
						bal_pure += balance_pure; //3star
						totaldifference_data += difference_data;
						totalweight_differ += weight_differ;
						totalgold_weight += gold_weight;
						//3star


						//table_val += '<tr><td  class="table_data">' + data[i]['customer_id'] + '</td><td>' + linktocusunfix + '</td><td style="text-align:right;">' + data[i]['pure_weight'] + '</td><td style="text-align:right;">' + data[i]['total_amount_unfix'] + '</td><td style="text-align:right;">' + IND_money_format(data[i]['total_amount_booking']) + '</td><td style="text-align:right;">' + gold_weight + '</td><td style="text-align:right;">' + IND_money_format(Math.abs(data[i]['difference'])) + '</td><td style="text-align:right;">' + weight_differ + '</td><td style="text-align:right;">' + final_avg + '</td><td style="text-align:right;" >' + manual_avg + '</td><td style="text-align:right;">' + pure_rate_cut + '</td><td style="text-align:right;">' + balance_pure + '</td></tr>';
						table_val += '<tr><td  class="table_data">' + data[i]['customer_id'] + '</td><td>' + linktocusunfix + '</td><td style="text-align:right;">' + data[i]['pure_weight'] + '</td><td style="text-align:right;">' + data[i]['total_amount_unfix'] + '</td><td style="text-align:right;">' + IND_money_format(data[i]['total_amount_booking']) + '</td><td style="text-align:right;">' + gold_weight + '</td><td style="text-align:right;">' + IND_money_format(Math.abs(difference_data)) + '</td><td style="text-align:right;">' + pending_pure_to_rate_cut + '</td><td style="text-align:right;">' + final_avg + '</td><td style="text-align:right;" >' + manual_avg + '</td><td style="text-align:right;">' + pure_rate_cut + '</td><td style="text-align:right;">' + balance_pure + '</td></tr>';
					});

					//3end	

					$('#grid-data').remove();
					$('#grid-data_wrapper').remove();
					var row_length = true;

					// Calculate the totals and format them
					var totalPaidWeightFormatted = totalPaidWeight.toFixed(2);
					var totalPaidAmtFormatted = totalPaidAmt.toFixed(2);
					var totalUnfixAmtFormatted = totalUnfixAmt.toFixed(2);
					var totalBookingWeightFormatted = totalBookingWeight.toFixed(2);
					var weight_different = weight_differences.toFixed(2);
					var purity_rate = parseFloat(purity_rates).toFixed(2);
					var bal_purity = parseFloat(bal_pure).toFixed(2); //3star
					var totalpaiddifference_data = parseFloat(totaldifference_data).toFixed(2);
					var totalpaidweight_differ = parseFloat(totalweight_differ).toFixed(2);
					var totalpaidgold_weight = parseFloat(totalgold_weight).toFixed(2);

					var tableFooter = '<tbody><tr style="background-color: #f3f3f3;">';
					tableFooter += '<td class="table_data" colspan="2"><strong>Total:</strong></td>';
					tableFooter += '<td style="text-align:right;" colspan="1"><strong>' + totalPaidWeightFormatted + '</strong></td>';
					tableFooter += '<td style="text-align:right;"  class="table_data" colspan="1"><strong>&#8377; ' + IND_money_format(totalPaidAmtFormatted) + '</strong></td>';
					tableFooter += '<td style="text-align:right;"  class="table_data" colspan="1"><strong>&#8377; ' + IND_money_format(totalUnfixAmtFormatted) + '</strong></td>';
					tableFooter += '<td style="text-align:right;"  class="table_data" colspan="1"><strong>' + totalpaidgold_weight + '</strong></td>';
					tableFooter += '<td  style="text-align:right;"  class="table_data" colspan="1"><strong>&#8377; ' + IND_money_format(totalpaiddifference_data) + '</strong></td>';
					tableFooter += '<td  style="text-align:right;"  class="table_data" colspan="1"><strong>' + totalpaidweight_differ + '</strong></td>'; // Adjust colspan as needed

					tableFooter += '<td ></td>';
					tableFooter += '<td ></td>';
					tableFooter += '<td  style="text-align:right;"  class="table_data" colspan="1"><strong>' + purity_rate + '</strong></td>';
					tableFooter += '<td  style="text-align:right;"  class="table_data" colspan="1"><strong>' + bal_purity + '</strong></td>';

					tableFooter += '</tr>';
					table += table_val;
					table += tableFooter;
					table += '</tbody>';
					table += '</table>';
					console.log(table);
					$('.box-content').append(table);



					// var footerRow = '<tr><td colspan="2">Total:</td><td class="table_data">' + totalWeight+ '</td><td class="table_data">' + totalAmount + '</td><td></td><td></td></tr>';
					// $('#grid-data tbody').append(footerRow);
					// oTable = $('#grid-data').dataTable();

					if (row_length) {
						oTable = $('#grid-data').dataTable({
							"searching": true,
							"sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
							"sPaginationType": "bootstrap",
							"iDisplayLength": "50",
							"scrollY": "500px",
							"scrollX": true,
							"scrollCollapse": true,
							"oLanguage": {
								"sLengthMenu": "_MENU_ records per page"
							},

						});

						$("#grid-data thead th").attr("data-sortable", function(i, val) {
							if (val != 'false') {
								$("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor', 'pointer');
							}
						});
						oTable.fnSort([
							[0, 'desc']
						]);
						// /oTable.fnDraw();

						oTable.$('.edit_values').editable({
							url: '<?php echo $this->config->item('base_url') ?>index.php/c_customerDelivery/avg_rate_update',
							validate: function(value) {
								if ($.trim(value) == '') {
									return 'This field is required';
								}
							},
							success: function(response, newValue) {
								if (response != 1) return response; //msg will be shown in editable form
							}
						});
					}


					$('.btn-confirm').click(function(e) {
						e.preventDefault();
						var link = $(this).attr('href');
						$('#myDialog').find('#confirm').attr('href', link);
						$('#myDialog').modal('show');
					});

					//for delete operation
					$('#myDialog #confirm').click(function() {
						$('#myDialog').modal('hide');
						$('body').removeClass('modal-open');
						$('.modal-backdrop').remove();
						window.location.href = $(this).attr('href');
						return false;
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
</script>
<?php $this->load->view('include/footer.php'); ?>