<?php $this->load->view('include/header.php');
$model_name = "Customerdelivery_model";
$controller_name = "C_customerDelivery";
$this->load->view('include/confirm');
$this->load->view('common/confirm_modal');
?>
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
<link href="<?php echo $this->config->item('base_url'); ?>assets/toaster/toastr.css" rel="stylesheet">
<script src="<?php echo $this->config->item('base_url'); ?>assets/toaster/toastr.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-tooltip.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/bootstrap-popover.js"></script>
<link href="<?php echo $this->config->item('base_url'); ?>assets/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet" />
<script src="<?php echo $this->config->item('base_url'); ?>assets/bootstrap3-editable/js/bootstrap-editable.min.js"></script>
<style>
	#autocomp_list {
		position: absolute;
		box-shadow: 0 1px 6px #000000;
		background: #fafafa;
		z-index: 9999;
		margin-top: 5px;
		display: none;
		width: 100%;
		border-radius: 5px;
	}

	#autocomp_list .autocomp_data {
		border-bottom: 1px solid #ccc;
		padding: 10px;
		cursor: pointer;
	}

	#autocomp_list .autocomp_data:hover {
		background: #eee;
	}

	#autocomp_list .autocomp_close {
		border-bottom: 1px solid #ccc;
		padding: 3px 10px 3px 10px;
		cursor: pointer;
		float: right;
		color: #5995FF;
		font-size: 12px;
	}

	.searchSelected {
		background: #eee;
	}

	#ajax_loader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		display: none;
	}

	#ajax_loader img {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.edit_values {
		color: #007bff !important;
		cursor: pointer;
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


	.add_new {
		margin-top: 0px;
	}

	.excel,
	.Print {
		margin-right: 0px;
	}

	/* .btn-success {
		color: #fff;
		background-color: #21bf06;
		border-color: #21bf06;
	} */

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 15px;
	}

	.form-horizontal .form-group input,
	textarea.form-control {
		padding: 0px 5px !important;
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

	.form-horizontal .form-group input,
	textarea.form-control {
		padding: 0px 5px !important;
	}

	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 15px;
	}
</style>
<script type="text/javascript">
	function showFlashMessage(successMsg, errorMsg) {
		toastr.options = {
			"closeButton": false,
			"debug": false,
			"newestOnTop": true,
			"progressBar": true,
			"positionClass": "toast-top-right",
			"preventDuplicates": true,
			"showDuration": "300",
			"hideDuration": "500",
			"timeOut": "4000",
			"extendedTimeOut": "2000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		}

		;

		if (errorMsg) {
			showToast(errorMsg, "error");
		}

		if (successMsg) {
			showToast(successMsg, "success");
		}

		if (successMsg || errorMsg) {
			$.ajax({

				url: base_url + "index.php/C_main/clear_flash",
				method: "POST",
				success: function() {
						console.log("Flash data cleared");
					}

					,
				error: function() {
					console.warn("Failed to clear flash data");
				}
			});
		}
	}

	$("body").on("click", ".check_all", function() {
		if ($(".check_all").is(":checked")) {
			$(".chkbox").prop('checked', true);
		} else {
			$(".chkbox").prop('checked', false);
		}
	});

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

		$("#comType, #bookType").change(function() {
			get_data();
		});

		$("#refresh_page").click(function(event) {
			event.preventDefault();
			get_data();
		});

		// BZ-22: slideToggle handlers for More Details / Filter Details
		// Removed inline click handlers for #expand and #expand_filter.
		// These buttons are now handled globally by admin/assets/js/lmx.js.

		$('#clickpdf').on('click', function(e) {
			e.preventDefault();
			var flag = false;
			var data = document.getElementById('BookNos');
			data.innerHTML = "";

			$("#grid-data tbody").find("tr").each(function(index, value) {
				if ($(this).find(".BookNo").html()) {
					flag = true;
					data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".BookNo").html() + "' />";
				} else {
					flag = false;
				}
			});
			$('#clickid').val(1);
			document.forms["printForm"].submit();
			console.log(data);

		});

		$('#clickexcel').on('click', function(e) {
			e.preventDefault();
			var flag = false;
			var data = document.getElementById('BookNos');
			data.innerHTML = "";
			/* var table = $('#grid-data').DataTable();
			var data = table.rows().data();
			console.log($(this).find(".BookNo").html());
			 data.each(function (value, index) {
				flag = true;
				data.innerHTML += "<input type='hidden' name='book_nos[]' value='"+$(this).find(".BookNo").html()+"' />";		
			 }); */


			//var table = $('#example').DataTable();

			/* var data = oTable.rows().data();

			console.log( 'The table has ' + data.length + ' records' ); */

			$("#grid-data tbody").find("tr").each(function(index, value) {
				if ($(this).find(".BookNo").html()) {
					flag = true;
					data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".BookNo").html() + "' />";
				} else {
					flag = false;
				}
			});

			$('#clickid').val(2);
			document.forms["printForm"].submit();

			//console.log(data);

		});
	});

	jQuery(document).ready(function() {

		<?php
		$result_set = $this->$model_name->get_transactiondate();
		foreach ($result_set->result() as $row) {
		?> document.getElementById('from_date').value = "<?php echo $row->from_date; ?>";
			document.getElementById('to_date').value = "<?php echo $row->to_date; ?>"
		<?php
		}
		?>
		/* var $confirmDeliveryLink = $('a[data-target="#confirm-delivery"]');

		$confirmDeliveryLink.click(function() {

		    $("#grid-data tbody tr").each(function(i,values)
				{
					if($(values).find(".chkbox").is(":checked"))
					{
						if($(values).find(".cus_id").val() != 0 )
						{
							var customer_id=$(values).find(".cus_id").val();
							$("#deliverd_to").val(customer_id);
						}
						
						
					}
				});
		 


		  }); */
	});

	function confirmation(link_location, message) {
		$(".modal-body p").html(message);
		$("#myAlert").show();
		$(".submit").attr('href', link_location);
	}

	var customers = [];

	<?php foreach ($customer as $row) { ?>
		var cusArray = {
			"customerName": "<?php echo $row['cus_name'] ?>",
			"customerId": <?php echo $row['cus_id'] ?>,
			"mobileNo": "<?php echo $row['cus_mobile'] ?>",
			"companyName": "<?php echo $row['cus_company_name'] ?>"
		};
		customers.push(cusArray);
	<?php } ?>
	var groupname = [];


	$("body").on("keyup", "#searchname", function(e) {
		var row = $(this).closest('tr');
		var sch = $(this);

		if (e.keyCode == 40 || e.keyCode == 38) {
			var input = $('#username');
			var current_index = $('.searchSelected').index();
			var autocomp_list = $('#autocomp_list');
			var options = autocomp_list.find('.autocomp_data');
			var items_total = options.length;

			input.val(current_index);

			if (e.keyCode == 40) {
				if (current_index + 1 < items_total) {
					current_index++;
					change_selection(current_index);
				}
			} else if (e.keyCode == 38) {
				if (current_index > 0) {
					current_index--;
					change_selection(current_index);
				}
			}
		} else if (e.keyCode == 13) {
			var autocomplete_values = $(".autocomp_data");

			$(autocomplete_values).each(function(index, value) {
				if ($(value).hasClass("searchSelected")) {
					var searchSelectedId = $(value).attr("data-searchId");
					var searchSelectedName = $(value).html();
					$("#userid").val(searchSelectedId);
					$("#searchname").val(searchSelectedName);
					$("#cus_id").val(searchSelectedId);
					$('#autocomp_list').empty();
					$('#autocomp_list').css('display', 'none');
					flag_userChange = 1;
					$("#usergroup").val("Default");
					$("#book_cusid").val(searchSelectedId);
					$("#avail_margin").html(0.00);

					$(allMargins[0]).each(function(k, margins) {
						if (margins.cus_id == $("#userid").val()) {
							$("#avail_margin").html(margins.margin_amt);
							return false;
						}
					});
					return false;
				}
			});
		} else if (e.keyCode == 27) {
			$('#autocomp_list').empty();
			$('#autocomp_list').css('display', 'none');
		} else {
			var searchedArray = [];
			var returnArray = [];
			var searchValue = $.trim($(this).val()).toUpperCase();
			var matchedItems = 0;

			if (searchValue.length >= 2 && matchedItems <= 5) {
				$(customers).each(function(index, value) {
					var searchName = value.customerName;
					var matchName = $.trim(searchName).toUpperCase().indexOf(searchValue) == 0;

					if (matchName) {
						var returnArray = {
							"searchedName": value.customerName,
							"searchedmobileNo": value.mobileNo,
							"searchedId": value.customerId
						};
						searchedArray.push(returnArray);
						matchedItems++;
					} else {
						var searchmobileNo = value.mobileNo;
						var matchmobileNo = $.trim(searchmobileNo).toUpperCase().indexOf(searchValue) == 0;

						if (matchmobileNo) {
							var returnArray = {
								"searchedName": value.customerName,
								"searchedmobileNo": value.mobileNo,
								"searchedId": value.customerId
							};
							searchedArray.push(returnArray);
							matchedItems++;
						}
					}
				});
			}

			var myEl = row.find('#autocomp_list');
			var items = false;
			myEl.empty();

			if (searchedArray.length > 0) {
				$(searchedArray).each(function(index, value) {
					if (index == 0) var appendval = "<div class='autocomp_data searchSelected' data-searchId='" + value.searchedId + "' >" + value.searchedName + " - " + value.searchedmobileNo + "</div>";
					else var appendval = "<div class='autocomp_data' data-searchId='" + value.searchedId + "'>" + value.searchedName + " - " + value.searchedmobileNo + "</div>";

					myEl.append(appendval);
					// row.find('#autocomp_list').html(appendval);

					items = true;
				});
				myEl.slideDown("fast");
				//myEl.css('display','block');  
			} else {
				myEl.css('display', 'none');
			}
		}
	});

	$("body").on("mousedown", ".autocomp_data", function(e) {
		var searchSelectedId = $(this).attr("data-searchId");
		var searchSelectedName = $(this).html();
		var row = $(this).closest('tr');

		row.find(".select_box").val(searchSelectedId);
		row.find("#searchname").val(searchSelectedName);
		row.find('#autocomp_list').empty();
		row.find('#autocomp_list').css('display', 'none');
		flag_userChange = 1;
		row.find("#usergroup").val("Default");
		row.find("#book_cusid").val(searchSelectedId);
		row.find("#avail_margin").html("");

		row.find(allMargins[0]).each(function(k, margins) {
			if (margins.cus_id == $("#userid").val()) {
				row.find("#avail_margin").html(margins.margin_amt);
				return false;
			}
		});
	});

	function change_selection(current_index) {
		var autocomp_options = $('#autocomp_list').find('.autocomp_data');
		autocomp_options.removeClass('searchSelected');
		autocomp_options.eq(current_index).addClass('searchSelected');
		var search_term = autocomp_options.eq(current_index).html();
		$('#username').val(search_term);
	}
</script>
<?php
$attributes = array('class' => 'form-horizontal', 'id' => 'printForm', 'name' => 'printForm', 'autocomplete' => 'off', 'target' => '_blank');
echo form_open('C_customerDelivery/print_record/PD/' . $model_name, $attributes); ?>
<div id="BookNos"></div>
<input type="hidden" id="clickid" name="clickprocess" value="">
</form>
<?php
$attributes = array('class' => 'form-horizontal', 'id' => 'delivery_listing', 'name' => 'iframeForm', 'autocomplete' => 'off');
echo form_open('C_customerDelivery/close_record/' . $model_name . '/add_new', $attributes);
?>

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
						<div class="header-container">
							<h4 class="card-title mb-0">
								<i class="glyphicon glyphicon-th"></i> Pending Delivery
								(<i id="refresh_page" style="vertical-align: middle; margin-top: -2px; cursor: pointer" class="glyphicon glyphicon-refresh" title="Click here to refresh page"> </i>)
							</h4>
							<div class="d-flex align-items-center" style="gap: 10px; display: flex;">
								<span id="expand" class="morefilter-btn">More Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
								<span id="expand_filter" class="morefilter-btn">Filter Details <i style="color:blue;" class="fas fa-angle-double-down"></i></span>
								<a href="<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/pending_deliveryexcel/" . $model_name . "/pendeliveryexcel/"; ?>" class="btn btn-primary btn-sm" role="button" id="clickexcel"><i class="typcn typcn-document btn-icon-append"></i> Excel</a>
								<a onclick="print_form(event)" class="btn btn-primary btn-sm Print" href="#"><i class="typcn typcn-printer btn-icon-append"></i> Print</a>
								<?php if ($userrights["add"] == 1) { ?>
									<a onclick="process_new_close();" class="btn btn-success btn-sm deliver">
										<i class="typcn typcn-arrow-forward btn-icon-append"></i> Deliver
									</a>
								<?php } ?>
							</div>
						</div>
						<p class="card-description"> </p>
						<div class="row form-sample1" id="expand_details" style="margin-top:40px;display: none;">
							<div class="col-md-3 col-sm-6 col-xs-12">
								<div class="col-md-12">
									<span class="label-total">Sell gold D.Qty(gms) : </span> <span class="values-total" id="del_sellgoldqty">0</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Avg : </span> <span class="values-total" id="del_sellgoldavg">0.00</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Total : </span> <span class="values-total" id="del_sellgoldtotal">0.00</span>
								</div>
							</div>
							<div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
								<div class="col-md-12">
									<span class="label-total">Sell silver D.Qty(Kg) : </span> <span class="values-total" id="del_sellsilverqty">0</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Avg :</span> <span class="values-total" id="del_sellsilveravg">0.00</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Total :</span> <span class="values-total" id="del_sellsilvertotal">0.00</span>
								</div>
							</div>

							<div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px">
								<div class="col-md-12">
									<span class="label-total">Buy gold D.Qty(gms) : </span> <span class="values-total" id="del_buygoldqty">0</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Avg : </span><span class="values-total" id="del_buygoldavg">0.00</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Total : </span><span class="values-total" id="del_buygoldtotal">0.00</span>
								</div>
							</div>

							<div class="col-md-3 col-sm-6 col-xs-12" style="padding:0px;">
								<div class="col-md-12">
									<span class="label-total">Buy silver D.Qty(Kg) : </span> <span class="values-total" id="del_buysilverqty">0</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Avg : </span> <span class="values-total" id="del_buysilveravg">0.00</span>
								</div>
								<div class="col-md-12">
									<span class="label-total">Total : </span> <span class="values-total" id="del_buysilvertotal">0.00</span>
								</div>
							</div>
						</div>

						<div class="table-responsive box-content">
							<div class="filter-card" style="display: none;" id="expand_filter_details">
								<div class="row align-items-end">
									<div class="col-md-3">
										<label class="label-total">Commodity</label>
										<?php $comm = $this->$model_name->get_active_commodities(); ?>
										<select onchange="get_data()" id="comID" class="form-control">
											<option value="-1" selected="selected">All</option>
											<?php foreach ($comm as $val) { ?>
												<option value="<?php echo $val['com_id'] ?>"><?php echo $val['com_name'] ?></option>
											<?php } ?>
										</select>
									</div>
									<div class="col-md-3">
										<label class="label-total">Book Type</label>
										<select id="bookType" class="bookType form-control" onchange="get_data()">
											<option value="-1">All</option>
											<option value="0">Sell</option>
											<option value="1">Buy</option>
										</select>
									</div>
									<div class="col-md-3">
										<label class="label-total">Commodity Type</label>
										<select id="comType" class="comType form-control" onchange="get_data()">
											<option value="-1">All</option>
											<option value="0">GOLD</option>
											<option value="1">SILVER</option>
										</select>
									</div>
									<div class="col-md-3 text-right">
										<button type="button" class="btn btn-info btn-sm" onclick="get_data()"><i class="glyphicon glyphicon-search"></i> Search</button>
									</div>
								</div>
								<div style="display:none;">
									<input type="text" name="from_date" id="from_date" value="" />
									<input type="text" name="to_date" id="to_date" value="" />
								</div>
							</div>
							<table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable responsive">
								<thead>
									<tr>
										<th data-sortable="false"><input type="checkbox" class="check_all" /></th>
										<th>Book No </th>
										<th>Book Date </th>
										<th>Book Type </th>
										<th>Req Type </th>
										<th>Name</th>
										<th>Company</th>
										<th>Deliiver To</th>
										<th>Mobile No</th>
										<th>Commodity Name </th>
										<th>Qty(gms)</th>
										<th>Book Rate</th>
										<th>Amount</th>
										<th>Delivery Qty(gms) </th>
										<th>User Comment</th>
										<th>Narration</th>
										<th style="display:none">status</th>
										<th>Action</th>
										<th>Unfix</th>
									</tr>
								</thead>
							</table>
							<!-- AJAX LOADER OVERLAY -->
							<div id="ajax_loader"><img src="<?= base_url('assets/img/ajax_load.gif'); ?>" alt="Loading..."></div>
							<div id="hidden"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- partial -->
</div>
<script type="text/javascript">
	$(window).load(function() {
		setTimeout(get_data(), 1000);

		$('#grid-data_filter label :input').keyup(function(event) {
			calc_total();
		});
	});

	function print_form(e) {
		e.preventDefault();
		var flag = false;
		var data = document.getElementById('BookNos');
		data.innerHTML = "";

		$("#grid-data tbody").find("tr").each(function(index, value) {
			if ($(this).find(".BookNo").html()) {
				flag = true;
				data.innerHTML += "<input type='hidden' name='book_nos[]' value='" + $(this).find(".BookNo").html() + "' />";
			} else {
				flag = false;
			}
		});
		var order_by = " ORDER BY ";

		if (flag == true) {
			if (oTable.fnSettings().aaSorting[0][0] == 0) order_by = order_by + " book_datetime ";
			else if (oTable.fnSettings().aaSorting[0][0] == 1) order_by = order_by + " book_no ";
			else if (oTable.fnSettings().aaSorting[0][0] == 2) order_by = order_by + " book_datetime ";
			else if (oTable.fnSettings().aaSorting[0][0] == 3) order_by = order_by + " cus_name ";
			else if (oTable.fnSettings().aaSorting[0][0] == 4) order_by = order_by + " cus_company_name ";
			else if (oTable.fnSettings().aaSorting[0][0] == 5) order_by = order_by + " cus_city ";
			else if (oTable.fnSettings().aaSorting[0][0] == 6) order_by = order_by + " com_name ";
			else if (oTable.fnSettings().aaSorting[0][0] == 7) order_by = order_by + " book_qty ";
			else if (oTable.fnSettings().aaSorting[0][0] == 8) order_by = order_by + " book_rate ";
			else if (oTable.fnSettings().aaSorting[0][0] == 9) order_by = order_by + " round(((book_totalcost/book_qty) * (book_qty - ifnull(book_hedgqty,0))),2) ";
			else order_by = order_by + " book_no ";
			order_by = order_by + oTable.fnSettings().aaSorting[0][1];
			data.innerHTML += "<input type='hidden' name='order_by' value='" + order_by + "'/>";
			$('#clickid').val(3);
			document.forms["printForm"].submit();
		}

		console.log(oTable.fnSettings().aaSorting[0][0]);
	}

	function calc_total() {
		var del_sellgoldqty = 0;
		var del_sellsilverqty = 0;

		var del_buygoldqty = 0;
		var del_buysilverqty = 0;

		var del_sellgoldavg = 0;
		var del_sellsilveravg = 0;

		var del_buygoldavg = 0;
		var del_buysilveravg = 0;

		var del_sellgoldtotal = 0;
		var del_sellsilvertotal = 0;

		var del_buygoldtotal = 0;
		var del_buysilvertotal = 0;



		if (typeof oTable != 'undefined') {
			oTable.$('tr', {
				"filter": "applied"

			}).each(function(index, value) {

				var book_type = $(this).find('.book_type').html().toUpperCase();

				if (book_type == 'SELL') {
					if (parseFloat($(this).find('.com_type').html()) == 1) {
						del_sellsilverqty = parseFloat(del_sellsilverqty) + parseFloat($(this).find(".deliveryQty").val());
						del_sellsilvertotal = del_sellsilvertotal + ((parseFloat(remove_commas($(this).find(".amount").html())) / parseFloat($(this).find(".qty").html())) * parseFloat($(this).find(".deliveryQty").val()));
					} else {
						del_sellgoldqty = parseFloat(del_sellgoldqty) + parseFloat($(this).find(".deliveryQty").val());
						del_sellgoldtotal = del_sellgoldtotal + ((parseFloat(remove_commas($(this).find(".amount").html())) / parseFloat($(this).find(".qty").html())) * parseFloat($(this).find(".deliveryQty").val()));
					}
				} else {
					if (parseFloat($(this).find('.com_type').html()) == 1) {
						del_buysilverqty = parseFloat(del_buysilverqty) + parseFloat($(this).find(".deliveryQty").val());
						del_buysilvertotal = del_buysilvertotal + ((parseFloat(remove_commas($(this).find(".amount").html())) / parseFloat($(this).find(".qty").html())) * parseFloat($(this).find(".deliveryQty").val()));
					} else {
						del_buygoldqty = parseFloat(del_buygoldqty) + parseFloat($(this).find(".deliveryQty").val());
						del_buygoldtotal = del_buygoldtotal + ((parseFloat(remove_commas($(this).find(".amount").html())) / parseFloat($(this).find(".qty").html())) * parseFloat($(this).find(".deliveryQty").val()));
					}
				}
			});

			del_sellgoldavg = del_sellgoldqty > 0 ? del_sellgoldtotal / del_sellgoldqty : 0.00;
			del_sellsilveravg = del_sellsilverqty > 0 ? del_sellsilvertotal / del_sellsilverqty : 0.00;

			del_buygoldavg = del_buygoldqty > 0 ? del_buygoldtotal / del_buygoldqty : 0.00;
			del_buysilveravg = del_buysilverqty > 0 ? del_buysilvertotal / del_buysilverqty : 0.00;
		}

		del_sellgoldqty = isNaN(del_sellgoldqty) ? 0.00 : del_sellgoldqty.toFixed(3);
		del_sellgoldavg = isNaN(del_sellgoldavg) ? 0.00 : del_sellgoldavg.toFixed(2);
		del_sellgoldtotal = isNaN(del_sellgoldtotal) ? 0.00 : del_sellgoldtotal.toFixed(2);
		del_sellsilverqty = isNaN(del_sellsilverqty) ? 0.00 : (del_sellsilverqty / 1000).toFixed(3);
		del_sellsilveravg = isNaN(del_sellsilveravg) ? 0.00 : (del_sellsilveravg * 1000).toFixed(2);
		del_sellsilvertotal = isNaN(del_sellsilvertotal) ? 0.00 : (del_sellsilvertotal).toFixed(2);

		del_buygoldqty = isNaN(del_buygoldqty) ? 0.00 : del_buygoldqty.toFixed(3);
		del_buygoldavg = isNaN(del_buygoldavg) ? 0.00 : del_buygoldavg.toFixed(2);
		del_buygoldtotal = isNaN(del_buygoldtotal) ? 0.00 : del_buygoldtotal.toFixed(2);
		del_buysilverqty = isNaN(del_buysilverqty) ? 0.00 : (del_buysilverqty / 1000).toFixed(3);
		del_buysilveravg = isNaN(del_buysilveravg) ? 0.00 : (del_buysilveravg * 1000).toFixed(2);
		del_buysilvertotal = isNaN(del_buysilvertotal) ? 0.00 : (del_buysilvertotal).toFixed(2);

		$("#del_sellgoldqty").html(del_sellgoldqty);
		$("#del_sellgoldavg").html(IND_money_format(del_sellgoldavg));
		$("#del_sellgoldtotal").html(IND_money_format(del_sellgoldtotal));

		$("#del_sellsilverqty").html(del_sellsilverqty);
		$("#del_sellsilveravg").html(IND_money_format(del_sellsilveravg));
		$("#del_sellsilvertotal").html(IND_money_format(del_sellsilvertotal));

		$("#del_buygoldqty").html(del_buygoldqty);
		$("#del_buygoldavg").html(IND_money_format(del_buygoldavg));
		$("#del_buygoldtotal").html(IND_money_format(del_buygoldtotal));

		$("#del_buysilverqty").html(del_buysilverqty);
		$("#del_buysilveravg").html(IND_money_format(del_buysilveravg));
		$("#del_buysilvertotal").html(IND_money_format(del_buysilvertotal));
	}

	function process_new_close() {
		var validqty = true;
		var valid_company = true;
		var valid_deliverto = true; // BZ-22: track deliver-to validation
		var no_items = 0;
		var items = 0;
		var company = "";
		a = 0;

		$("#grid-data tbody tr").each(function(i, values) {

			if ($(values).find(".chkbox").is(":checked")) {
				no_items++;
				a++;
				if ($(values).find(".deliveryQty").val() <= 0 || parseFloat($(values).find(".deliveryQty").val()) > parseFloat($(values).find(".balQty").val())) {
					validqty = false;
					return false;
				}
				// BZ-22: Validate delivered-to name matches a valid customer
				var deliverToName = $.trim($(values).find("#searchname").val());
				if (deliverToName !== '') {
					var isValidCustomer = false;
					$(customers).each(function(idx, cust) {
						if (cust.customerName === deliverToName || (cust.customerName + ' - ' + cust.mobileNo) === deliverToName) {
							isValidCustomer = true;
							return false;
						}
					});
					if (!isValidCustomer) {
						valid_deliverto = false;
						return false;
					}
				}
			}

		});

		var pass_data = document.getElementById('hidden');
		pass_data.innerHTML = "";

		if (no_items > 0) {
			items = 0;

			$("#grid-data tbody tr").each(function(i, values) {
				if ($(values).find(".chkbox").is(":checked")) {
					if ($(values).find(".cus_id").val() != 0) {
						var customer_id = $(values).find(".select_box").val();
						$("#cus_idnew").val(customer_id);
					}

					pass_data.innerHTML += "<input type='hidden' name='company_name[]' value='" + $(values).find(".cus_company_name").html() + "' />";
					pass_data.innerHTML += "<input type='hidden' name='refno[]' value='" + $(values).find(".BookNo").html() + "' />";
					pass_data.innerHTML += "<input type='hidden' name='dateref[]' value='" + $(values).find(".bookdate").html() + "' />";
					pass_data.innerHTML += "<input type='hidden' name='commodityname[]' value='" + $(values).find(".comcode").html() + "' />";
					pass_data.innerHTML += "<input type='hidden' name='qty[]' value='" + $(values).find(".qty").html() + "' />";
					pass_data.innerHTML += "<input type='hidden' name='amount[]' value='" + parseFloat(remove_commas($(values).find(".amount").html())) + "' />";
					pass_data.innerHTML += "<input type='hidden' name='balance[]' value='" + $(values).find(".deliveryQty").val() + "' />";
					pass_data.innerHTML += "<input type='hidden' name='intcode[]' value='" + $(values).find(".cuscode").html() + "' />";
					pass_data.innerHTML += "<input type='hidden' name='cusdeal_deliveredto[]' value='" + $("#cus_idnew").val() + "' />";
					items++;
				}
			});
		}

		/* pass_data.innerHTML += "<input type='hidden' name='no_of_datas' value='"+items+"' />";
		var delivered_customer=$('#deliverd_to').find(":selected").val();
		if(delivered_customer!=0){
			pass_data.innerHTML += "<input type='hidden' name='cusdeal_deliveredto' value='"+delivered_customer+"' />";

		} */
		if (items > 0) {
			let message = "Do you want to deliver?";

			showConfirmModal("Customer Delivery", message, function() {
				$('#ajax_loader').show();

				// Create hidden iframe to handle form submission
				var iframe = $('<iframe name="delivery_iframe" style="display:none;"></iframe>');
				$('body').append(iframe);
				$('#delivery_listing').attr('target', 'delivery_iframe');

				iframe.on('load', function() {
					$('#ajax_loader').hide();
					showFlashMessage("Delivery successfully", null);
					get_data();
				});

				document.forms['iframeForm'].submit();
			});
		} else {
			if (!validqty) {
				showFlashMessage(null, "Please enter valid delivery qty!");
			} else if (!valid_deliverto) {
				// BZ-22: Show error when delivered-to name is invalid
				showFlashMessage(null, "Invalid 'Deliver To' name. Please select a valid customer.");
			} else if (no_items == 0) {
				showFlashMessage(null, "Please select the booking or invalid booking selection!");
			} else if (!valid_company) {
				showFlashMessage(null, "Please enter same company!");
			} else {
				showFlashMessage(null, "Submission failed");
			}

		}
	}

	let currentPopover = null;

	function showPopover(element, content) {
		if (currentPopover) currentPopover.popover('dispose');

		element.popover({
			content: content,
			html: true,
			placement: 'bottom',
			trigger: 'manual',
			sanitize: false
		}).popover('show');
		currentPopover = element;
	}

	function closePopover() {
		if (currentPopover) currentPopover.popover('dispose');
	}

	function initInlineEdit() {

		// Editable Text Field
		$(document).off('click', '.edit_values').on('click', '.edit_values', function(e) {
			e.stopPropagation();
			let element = $(this),
				id = element.data('pk'),
				field = element.data('name'),
				value = element.text().trim();

			showPopover(element, ` <input type="text" class="form-control edit-input" value="${value}" > <div class="mt-2 d-flex" > <button class="btn btn-sm btn-success save-btn" data-id="${id}" data-name="${field}" >OK</button> <button class="btn btn-sm btn-danger cancel-btn ms-2" >Cancel</button> </div> `);

			setTimeout(function() {
					$('.edit-input').on('keydown', function(event) {
						if (field === 'book_qty' || field === 'book_rate') {
							validateKeyPress(event, this, field === 'book_qty' ? 2 : 2);
						}
					});
				}

				, 100);
		});

		// Save Text Input
		$(document).off('click', '.save-btn').on('click', '.save-btn', function() {
			let newValue = $('.edit-input').val(),
				pk = $(this).data('id'),
				field = $(this).data('name');

			if (newValue === '') {
				showFlashMessage(null, 'This field is required');
				return;
			}

			updateData(pk, field, newValue);
		});

		// Close popover on clicking outside or cancel button
		$(document).off('click', '.cancel-btn').on('click', '.cancel-btn', closePopover);

		$(document).off('click.popover').on('click.popover', function(e) {
			if (!$(e.target).closest('.popover, .edit_values').length) closePopover();
		});
	}

	function updateData(pk, field, value) {
		$.post(base_url + "index.php/c_customerDelivery/todayinline_update", {
				pk: pk,
				name: field,
				value: value
			}

			,
			function(response) {
				if (response == 1 || response == "1") {
					let selector = `.edit_values[data-pk="${pk}"][data-name="${field}"]`;
					let displayValue = field === 'book_rate' ? parseFloat(value).toFixed(2) : parseFloat(value).toFixed(3);
					$(selector).html(displayValue);
					showFlashMessage("Updated successfully", null);
					closePopover();
					get_data(true);
				} else {
					showFlashMessage(null, "Update failed");
					closePopover();
				}

			}).fail(() => {
			showFlashMessage(null, "Updating failed");
			closePopover();
		});
	}

	function save_chargeNarration(obj) {
		var book_narration = $(obj).parent().parent().find(".book_narration").val();
		var book_no = $(obj).parent().parent().find(".BookNo").html();

		$('#ajax_loader').show();

		$.ajax({

			type: "POST",
			dataType: "json",
			url: "<?php echo $this->config->item('base_url') ?>index.php/C_customerDelivery/save_booknarration/1",
			data: "book_narration=" + book_narration + "&book_no=" + book_no,
			success: function(result) {
					if (result) {
						showFlashMessage("Narration saved successfully.", null);
						get_data();
					} else {
						showFlashMessage(null, "Failed to update. Please try again.");
						get_data();
					}

					$('#ajax_loader').hide();
				}

				,
			error: function() {
				$('#ajax_loader').hide();
			}
		});
	}

	function get_data(skipLoader) {
		try {
			var table = '';
			table += '<table id="grid-data" class="table">';
			table += '<thead><tr><th style="width: 20px;" data-sortable="false"  style="text-align:center;"><input type="checkbox" class="check_all" /></th><th  style="width: 35px;text-align:center;">Ref<br>No</th><th  style="text-align:center;width: 35px;">Book<br>Date</th><th style="width: 40px;text-align:center">Book<br>Type</th><th  style="width: 40px;text-align:center">Req<br>Type</th><th  style="text-align:center">Name</th><th  style="text-align:center">Company</th><th  style="text-align:center">Deliver To</th><th  style="text-align:center;">Mobile No</th><th  style="text-align:center">Commodity</th><th style="text-align:center">Qty(gms)</th><th  style="text-align:center">D.Qty(gms)</th><th style="text-align:center">B.Rate</th><th style="text-align:center;">Amount</th><th>User Comment</th><th >Narration</th><th style="display:none"  style="text-align:center">Commodity Type</th><th style="display:none"  style="text-align:center">Commodity Code</th><th style="display:none"  style="text-align:center">Customer Code</th><th style="text-align:center; display:none">Status</th><th data-sortable="false">Action</th><th data-sortable="false" style="display:none;">Unfix</th></tr></thead><tbody>';
			if (!skipLoader) $('#ajax_loader').show();

			$.ajax({

				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/grid_dataload/" . $model_name; ?>/" + document.getElementById('from_date').value + "/" + document.getElementById('to_date').value + "/" + document.getElementById('comID').value + "/" + document.getElementById('comType').value + "/" + document.getElementById('bookType').value,
				success: function(data) {
						var table_val = '';

						$.each(data, function(i) {
							if (data[i]['BalanceQty'] <= 0) {
								var disabled = 'disabled="disabled"';
								var status = '<span class="label label-success">Delivered</span>';
							} else {
								var disabled = '';
								var status = '<span class="label label-warning">Pending</span>';
							}

							var del_Link = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/del_delivery/" + data[i]['bookno'];

							var close_link = "<?php echo $this->config->item('base_url'); ?>index.php/<?php echo $controller_name; ?>/DB_Controller/<?php echo $model_name; ?>/close/" + data[i]['bookno'] + "/" + data[i]['cuscode'] + "/" + data[i]['BalanceAmount'] + "/" + data[i]['BalanceQty'] + "/" + data[i]['comcode'];

							if (data[i]['cusdel_bookno'] != data[i]['bookno']) {
								var action_link = '<a class="btn btn-success btn-sm" href=' + close_link + '><i class="typcn typcn-edit btn-icon-append"></i>Close</a>';
							} else {
								var action_link = '';
							}

							var oType = data[i]['ordertype'] == 0 ? "Book" : "Limit";
							var book_font = data[i]['ordertype'] == 0 ? "" : "style='color: blue;'";
							var save = '<a class="btn btn-sm btn-primary" data-toggle="modal" onClick="save_chargeNarration(this)" href="#"><i class="glyphicon glyphicon-plus icon-white"></i> Save</a>';

							if (data[i]['cus_fix'] == '1') {
								if (data[i]['unfix'] == '0') {
									var unfix = '<a class="btn btn-sm btn-primary" data-toggle="modal" onClick="unfix_fixNarration(this,1)" href="#">  Is Unfix ? </a>';

								} else {
									var unfix = '<a class="btn btn-sm btn-primary" data-toggle="modal" onClick="unfix_fixNarration(this,0)" href="#">  Fix</a>';

								}
							} else {
								var unfix = '<p class="text-center">-</p>'
							}

							var narration = '<textarea class="book_narration form-control">' + data[i].book_narration + '</textarea>';
							var bal = (data[i]['BalanceQty'] * 1000);
							var bookqtydataClass = bal >= (data[i]['bookqty']) ? ' edit_values book_qty qty' : ' book_qty qty';
							var bookqtydata = '<span href="#" class="' + bookqtydataClass + '"  data-name="book_qty" data-pk="' + parseFloat(data[i]['bookno']) + '" data-type="text" data-placement="right" data-title="Update Qty">' + parseFloat(data[i]['bookqty']) + '</span>';
							var bookamtdata = '<span href="#" class="edit_values book_price" data-name="book_rate" data-pk="' + parseFloat(data[i]['bookno']) + '" data-type="text" data-placement="right" data-title="Update rate">' + IND_money_format(parseFloat(data[i]['book_rate'])) + '</span>';

							var select = data[i]['book_type'] == 'Sell' ? '<input class="select_box" type="hidden" id="cus_idnew" value="' + data[i]['cuscode'] + '" /><span>-</span>' : '<input class="select_box" type="hidden" id="cus_idnew" /><input type="text" class="form-control form-control-sm" id="searchname" value="' + data[i]['customername'] + '">';
							const bgColor = data[i]['unfix'] === '1' ? (data[i]['unfix'] === '1' && data[i]['ordertype'] === '1' ? 'style="background-color:#FFCCCB;color:blue;"' : 'style="background-color:#FFCCCB;"') : (data[i]['ordertype'] === '1' ? 'style="color: blue;"' : '');
							// Split bookdate into date and time
							var bookdateParts = data[i]['bookdate'].split(' ');
							var formattedBookdate = bookdateParts.length === 2 ? bookdateParts[0] + '<br>' + bookdateParts[1] : data[i]['bookdate'];

							table_val += '<tr ' + bgColor + '><input type="hidden"  class="cus_id" value=' + data[i].cus_id + '><td><input class="chkbox" ' + disabled + ' type = "checkbox"></td><td  class="BookNo">' + data[i]['bookno'] + '</td><td class="bookdate">' + formattedBookdate + '</td><td class="book_type">' + data[i]['book_type'] + '</td><td>' + oType + '</td><td class="customername">' + data[i]['customername'] + '</td><td class="cus_company_name">' + data[i]['cus_company_name'] + '</td><td class="cus_idnew" style="min-width: 120px;">' + select + '<div class="col-md-12" style="padding: 0px"><div id="autocomp_list"></div></div></td><td class="cus_mobile">' + data[i]['cus_mobile'] + '</td><td class="commodityname">' + data[i]['commodityname'] + '</td><td>' + bookqtydata + '</td><td><input type="text" value="' + (parseFloat(data[i]['BalanceQty'] * 1000) + 0) + '" class="form-control form-control-sm deliveryQty" /><input type="hidden" value="' + (data[i]['BalanceQty'] * 1000) + '"  class="balQty" /></td><td>' + bookamtdata + '</td><td class="amount">' + IND_money_format(parseFloat(data[i]['bookamount'])) + '</td><td>' + data[i]['book_usercomment'] + '</td><td>' + narration + '</td><td  style="display:none" class="com_type">' + data[i]['com_type'] + '</td><td class="comcode" style="display:none">' + data[i]['comcode'] + '</td><td style="display:none" class="cuscode">' + data[i]['cuscode'] + '</td><td style="display:none">' + status + '</td><td>' + save + '</td><td style="display:none;">' + unfix + '</td></tr>';
							// table_val += '<tr '+bgColor+'><input type="hidden"  class="cus_id" value='+data[i].cus_id+'><td><input class="chkbox" '+disabled+' type = "checkbox"></td><td  class="BookNo">'+data[i]['bookno']+'</td><td class="bookdate">'+data[i]['bookdate']+'</td><td class="book_type">'+data[i]['book_type']+'</td><td>'+oType+'</td><td class="customername">'+data[i]['customername']+'</td><td class="cus_company_name">'+data[i]['cus_company_name']+'</td><td class="cus_mobile">'+data[i]['cus_mobile']+'</td><td class="commodityname">'+data[i]['commodityname']+'</td><td>' + bookqtydata + '</td><td class="qty">'+parseFloat(data[i]['bookqty'])+'</td><td><input type="text" value="'+(parseFloat(data[i]['BalanceQty']*1000)+0)+'" class="grid-text deliveryQty" /><input type="hidden" value="'+(data[i]['BalanceQty']*1000)+'"  class="balQty" /></td><td class="rate">'+IND_money_format(parseFloat(data[i]['book_rate']))+'</td><td class="amount">'+IND_money_format(parseFloat(data[i]['bookamount']))+'</td><td>'+data[i]['book_usercomment']+'</td><td>'+narration+'</td><td  style="display:none" class="com_type">'+data[i]['com_type']+'</td><td class="comcode" style="display:none">'+data[i]['comcode']+'</td><td style="display:none" class="cuscode">'+data[i]['cuscode']+'</td><td style="display:none">'+status+'</td><td>'+save+'</td><td>'+unfix+'</td></tr>';

						});
						$('#grid-data').remove();
						$('#grid-data_wrapper').remove();

						table += table_val;
						table += '</tbody>';
						table += '</table>';
						$('.box-content').append(table);

						oTable = $('#grid-data').dataTable({

							// "sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-12'i><'col-md-12 center-block'p>>",
							"sPaginationType": "bootstrap",
							// "iDisplayLength": "11",
							// "order": [[ 1, "desc" ]],
							// "oLanguage": {
							// 	"sLengthMenu": "_MENU_ records per page"
							// },
							// "columnDefs": [
							// 	{ "orderable": false, "targets": 0 }
							// ]
							bSort: true,
							bInfo: true,
							bDestroy: true,
							scrollX: '100%',
							lengthMenu: [
								[10, 25, 50, 100, 250, -1],
								[10, 25, 50, 100, 250, "All"]
							],
							// dom: 'lBfrtip',
							"order": [
								[1, "desc"]
							],
							// "buttons": [
							// 		{
							// 			extend: 'print',
							// 			footer: true,
							// 			title: 'Pending Delivery',  
							// 		},
							// 		{
							// 			extend: 'excel',
							// 			footer: true,
							// 			title: 'Pending Delivery',
							// 		}
							// 	],
							columnDefs: [{
									targets: [0, 2, 3, 4, 5, 6, 7, 8, 9, 14, 15, 16, 17],
									className: 'dt-left'
								}

								,
								{
									targets: [1, 10, 11, 12, 13],
									className: 'dt-right'
								}

								,
								{
									width: "100px",
									targets: [2, 5, 7, 9, 14, 15, 16, 17]
								}

							]
						});

						$("#grid-data thead th").attr("data-sortable", function(i, val) {
							if (val != 'false') {
								$("#grid-data thead th:nth-child(" + (i + 1) + ")").css('cursor', 'pointer');
							}
						});

						$('#grid-data_filter label :input').keyup(function(event) {
							calc_total();
						});

						// Initialize inline edit
						initInlineEdit();
						calc_total();
						if (!skipLoader) $('#ajax_loader').hide();
					}

					,
				error: function(request, error) {
					if (!skipLoader) $('#ajax_loader').hide();
				}
			});
		} catch (ex) {
			//console.log(ex);
		}


	}

	function unfix_fixNarration(obj, sts) {

		var book_no = $(obj).parent().parent().find(".BookNo").html();

		if (sts == 0) {
			var result = window.confirm("Are you sure you want to revert the Unfix booking?");
		} else {
			var result = window.confirm("Are you sure you want to Unfix booking?");
		}

		if (result) {
			$('#ajax_loader').show();

			$.ajax({

				type: "POST",
				dataType: "json",
				url: "<?php echo $this->config->item('base_url') . "index.php/C_customerDelivery/updatefix_unfix/" . $model_name; ?>",
				data: {
					"book_no": book_no,
					'sts': sts
				}

				,

				success: function(data) {
						if (data.statuscode == 0) {
							showToast('Unfix Reverted', "info");
							get_data();
						} else {
							get_data();
							showToast('Booked Unfix', "info");
						}

						$('#ajax_loader').hide();
					}

					,
				error: function(request, error) {
					$('#ajax_loader').hide();
				}
			});
		}


	}
</script>
<div class="modal fade" id="myDialog" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
	aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<!-- <div class="modal-header">
				<div class="col-md-12">
					<div class="row form-sample1"><button type="button" class="close clx" data-dismiss="modal">×</button>
						<h4>Customer Delivery</h4>
					</div>
				</div>
			</div> -->
			<?php
			$cus_data = $this->Customerdelivery_model->get_active_customers();
			?>
			<div class="modal-body">
				<div class="col-md-7" style="padding: 0px">
					<div>Do you want to Deliver?</div>
				</div>
			</div>
			<div class="modal-footer"><button type="button" onclick="document.forms['iframeForm'].submit();" class="btn btn-danger">Confirm</button><button class="btn btn-primary" data-bs-dismiss="modal">Cancel</button></div>
		</div>
	</div>
</div><?php $this->load->view('include/footer.php'); ?></form>