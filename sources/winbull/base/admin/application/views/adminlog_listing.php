<?php
$this->load->view('include/header.php');
$model_name = "adminlog_model";
$controller_name = "C_adminlog";
?>
<style>
	.details-control {
		cursor: pointer;
		/* transition: all 0.3s; */
		color: #667eea;
		font-size: 16px;
	}

	.details-control:hover {
		background: #f0f0f0;
		color: #764ba2;
	}

	.filter-panel {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 15px 20px;
		border-radius: 10px;
		margin-bottom: 20px;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
	}

	.filter-row {
		display: flex;
		align-items: flex-end;
		gap: 10px;
		flex-wrap: nowrap;
	}

	.date-input-wrapper {
		position: relative;
	}

	.date-input-wrapper label {
		color: white;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 4px;
		display: block;
	}

	.date-input-wrapper input {
		padding: 8px 10px 8px 30px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		font-size: 12px;
		background: rgba(255, 255, 255, 0.95);
		width: 130px;
		/* transition: all 0.3s; */
		font-weight: 500;
	}

	.date-input-wrapper input:focus {
		border-color: white;
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
		outline: none;
		background: white;
	}

	.date-input-wrapper::before {
		content: '\1F4C5';
		position: absolute;
		left: 10px;
		bottom: 9px;
		font-size: 14px;
		color: #667eea;
		pointer-events: none;
	}

	.filter-select-wrapper {
		flex: 1;
		min-width: 180px;
		max-width: 220px;
		position: relative;
	}

	.filter-select-wrapper label {
		color: white;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 4px;
		display: block;
	}

	.quick-dates {
		display: flex;
		gap: 6px;
		align-items: center;
	}

	.quick-dates .btn {
		padding: 8px 12px;
		font-size: 11px;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 5px;
		/* transition: all 0.3s; */
		height: 36px;
	}

	.quick-dates .btn:hover {
		background: rgba(255, 255, 255, 0.3);
		/* transform: translateY(-1px); */
	}

	.search-btn {
		padding: 8px 24px !important;
		background: white !important;
		color: #667eea !important;
		border: none !important;
		border-radius: 6px !important;
		font-weight: 600 !important;
		font-size: 13px !important;
		box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15) !important;
		/* transition: all 0.3s !important; */
		height: 36px;
	}

	.search-btn:hover {
		/* transform: translateY(-1px) !important; */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
	}

	.log-type-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		white-space: nowrap;
	}

	.badge-trading {
		background: #28a745;
		color: white;
	}

	.badge-settings {
		background: #17a2b8;
		color: white;
	}

	.badge-user {
		background: #ffc107;
		color: #333;
	}

	.badge-content {
		background: #6f42c1;
		color: white;
	}

	.badge-default {
		background: #6c757d;
		color: white;
	}

	#grid-data {
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	#grid-data thead {
		/* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
	}

	#grid-data thead th {
		/* color: white !important; */
		font-weight: 600 !important;
		text-transform: uppercase;
		font-size: 11px !important;
		letter-spacing: 0.5px;
		/* padding: 12px 8px !important; */
		border: none !important;
		background: transparent !important;
		text-align: center !important;
	}

	#grid-data thead th:first-child,
	#grid-data tbody td:first-child {
		width: 40px !important;
		text-align: center !important;
	}

	/* #grid-data tbody tr {
		transition: all 0.2s;
		border-bottom: 1px solid #e9ecef;
	} */

	#grid-data tbody tr:hover {
		background: #f8f9fa !important;
		/* transform: scale(1.01); */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	#grid-data tbody td {
		padding: 10px 8px !important;
		font-size: 15px;
		color: #495057;
	}

	.dataTables_wrapper .dataTables_length,
	.dataTables_wrapper .dataTables_filter {
		margin-bottom: 15px;
	}

	.dataTables_wrapper .dataTables_length label,
	.dataTables_wrapper .dataTables_filter label {
		color: #495057;
		font-weight: 500;
		font-size: 13px;
	}

	.dataTables_wrapper .dataTables_length select {
		border: 2px solid #e9ecef;
		border-radius: 6px;
		padding: 4px 8px;
		margin: 0 5px;
	}

	.dataTables_wrapper .dataTables_filter input {
		border: 2px solid #e9ecef;
		border-radius: 6px;
		padding: 6px 12px;
		/* transition: all 0.3s; */
	}

	.dataTables_wrapper .dataTables_filter input:focus {
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
		outline: none;
	}

	.dataTables_wrapper .dataTables_paginate {
		margin-top: 20px;
	}

	.dataTables_wrapper .dataTables_paginate .paginate_button {
		border-radius: 8px !important;
		margin: 0 4px;
		padding: 8px 14px !important;
		/* transition: all 0.3s; */
		font-weight: 500 !important;
		border: 2px solid #e9ecef !important;
		background: white !important;
		color: #495057 !important;
	}

	.dataTables_wrapper .dataTables_paginate .paginate_button.current {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
		border-color: #667eea !important;
		color: white !important;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}

	.dataTables_wrapper .dataTables_paginate .paginate_button:hover:not(.disabled):not(.current) {
		background: #f8f9fa !important;
		border-color: #667eea !important;
		color: #667eea !important;
		/* transform: translateY(-2px); */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.dataTables_wrapper .dataTables_paginate .paginate_button.disabled {
		color: #ccc !important;
		border-color: #e9ecef !important;
		cursor: not-allowed !important;
	}

	.dataTables_wrapper .dataTables_paginate .paginate_button.previous,
	.dataTables_wrapper .dataTables_paginate .paginate_button.next {
		font-weight: 600 !important;
		padding: 8px 16px !important;
	}

	.dataTables_wrapper .dataTables_info {
		font-size: 13px;
		color: #495057;
		font-weight: 500;
		line-height: 36px;
	}

	.dataTables_wrapper .row:last-child {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
		display: none;
		align-items: center;
		justify-content: center;
		z-index: 9999;
	}

	.loading-spinner {
		background: white;
		padding: 30px 50px;
		border-radius: 12px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		text-align: center;
	}

	.loading-spinner i {
		color: #667eea;
	}

	.loading-spinner p {
		color: #495057;
		font-weight: 500;
		font-size: 14px;
	}

	.filter-select {
		padding: 7px 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		font-size: 12px;
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
		/* transition: all 0.3s; */
		height: 36px;
		font-weight: 500;
	}

	.filter-select:focus {
		border-color: white;
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
		outline: none;
		background: white;
	}

	.divider {
		width: 1px;
		height: 36px;
		background: rgba(255, 255, 255, 0.3);
		margin: 0 5px;
	}

	.action-buttons {
		display: inline-flex;
		gap: 8px;
	}
</style>
<script type="text/javascript">
	$(window).load(function() {
		document.getElementById('from_date').value = "<?php echo date("d-m-Y"); ?>";
		document.getElementById('to_date').value = "<?php echo date("d-m-Y"); ?>";
		get_data();
	});

	$(function() {
		$('#from_date').datetimepicker({
			format: 'DD-MM-YYYY',
			pickTime: false
		});
		$('#to_date').datetimepicker({
			format: 'DD-MM-YYYY',
			pickTime: false
		});

		$("#refresh_page").click(function(event) {
			event.preventDefault();
			get_data();
		});

		$('.quick-date-btn').click(function() {
			const days = $(this).data('days');
			const today = new Date();
			const fromDate = new Date();
			fromDate.setDate(today.getDate() - days);
			$('#from_date').val(formatDate(fromDate));
			$('#to_date').val(formatDate(today));
			get_data();
		});

		$('#log_type_filter').change(function() {
			get_data();
		});
		$('body').on('click', '#grid-data tbody td.details-control', function() {

			var log_listdisc = $(this).parent().find('.log_listdisc').html();

			if ($(this).parent().find('.icon_class').hasClass("glyphicon-plus")) {
				$(this).parent().find('.icon_class').addClass('glyphicon-minus').removeClass('glyphicon-plus');
				var dataval = valueetest;

				var table_val = '';

				table_val += `
				<tr class="knockoff_details" id="log_disc-${log_listdisc}">
					<td colspan="10">
						<table class="table table-striped table-bordered table-sm text-center align-middle">
							<thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
								<tr>
									<th style="width: 5%; text-align: center; color: black !important; font-weight: 600;">S.No</th>
									<th style="width: 45%; text-align: center; color: black !important; font-weight: 600;">Previous Data</th>
									<th style="width: 45%; text-align: center; color: black !important; font-weight: 600;">Updated Data</th>
								</tr>
							</thead>
							<tbody>
				`;

				$.each(dataval, function(i, value_detail) {
					if (value_detail['log_id'] == log_listdisc) {
						table_val += `
							<tr>
								<td style="text-align: center; vertical-align: middle; color: #495057;">${value_detail['log_id']}</td>
								<td style="text-align: left; vertical-align: top; line-height: 22px; word-break: break-word; color: #000; background: #fff3cd;">${value_detail['log_pre_data']}</td>
								<td style="text-align: left; vertical-align: top; line-height: 22px; word-break: break-word; color: #000; background: #d4edda;">${value_detail['log_update_data']}</td>
							</tr>
						`;
					}
				});

				table_val += `
							</tbody>
						</table>
					</td>
				</tr>
				`;

				$(this).parent().after(table_val);
			} else if ($(this).parent().find('.icon_class').hasClass("glyphicon-minus")) {
				$(this).parent().find('.icon_class').addClass('glyphicon-plus').removeClass('glyphicon-minus');
				$(this).parent().parent().find('#log_disc-' + log_listdisc).remove();
			}
		});
	});
	var valueetest = [];

	function formatDate(date) {
		const d = date.getDate().toString().padStart(2, '0');
		const m = (date.getMonth() + 1).toString().padStart(2, '0');
		const y = date.getFullYear();
		return d + '-' + m + '-' + y;
	}

	function getLogTypeBadge(type, label) {
		const badges = {
			0: 'trading',
			7: 'trading',
			9: 'settings',
			25: 'settings',
			40: 'settings',
			41: 'settings',
			10: 'user',
			18: 'user',
			19: 'user',
			45: 'user',
			11: 'content',
			12: 'content',
			13: 'content',
			26: 'content',
			31: 'content',
			33: 'content'
		};
		const badgeClass = badges[type] || 'default';
		return `<span class="log-type-badge badge-${badgeClass}">${label}</span>`;
	}

	function get_data() {
		$('.loading-overlay').css('display', 'flex');
		var table = '';
		table += '<table id="grid-data" class="table bootstrap-datatable datatable reponsive" width="100%">';
		table += '<thead><tr><th data-sortable="false" style="width:40px;">#</th><th style="text-align:center; width:60px;">S.NO</th><th style="width:130px;">DateTime</th><th style="width:100px;">User</th><th style="width:100px;">IP</th><th style="width:130px;">Type</th><th style="text-align: left !important; min-width:300px;">Description</th></tr></thead><tbody>';

		const fromDate = document.getElementById('from_date').value;
		const toDate = document.getElementById('to_date').value;
		const logTypeFilter = document.getElementById('log_type_filter').value;

		$.ajax({
			type: "POST",
			dataType: "json",
			url: "<?php echo $this->config->item('base_url'); ?>index.php/C_adminlog/adminlog_dataload/<?php echo $model_name; ?>/" + fromDate + "/" + toDate,
			data: {
				log_type: logTypeFilter
			}, // ✅ send filter as POST parameter
			success: function(data) {
				console.log(data);
				var table_val = '';
				valueetest = data;

				$.each(data, function(i, item) {
					if (logTypeFilter !== '' && item.log_type != logTypeFilter) return; // ✅ client-side filter fallback

					const logTypeMap = {
						0: "Trading",
						1: "Commodity Group",
						2: "Rpanel update",
						3: "Rpanel status",
						4: "Commodity Master",
						5: "Premium group",
						6: "Contract Master",
						7: "Trade On/Off",
						8: "Admin Rpanel",
						9: "General Settings",
						10: "Admin User",
						11: "Advertisements",
						12: "App Events",
						13: "App Videos",
						14: "Area",
						15: "Booking Report",
						16: "Admin Info",
						17: "Category",
						18: "Change Password",
						19: "Client",
						20: "Commodity Group Customer Service",
						21: "Commodity Wise Gold Weight",
						22: "Contract Symbol",
						23: "Customer Group",
						24: "Customer Service",
						25: "Email Settings",
						26: "Gallery",
						27: "GRN",
						28: "Margin Management",
						29: "Marquee Text",
						30: "Item Category",
						31: "News",
						32: "Old Gold",
						33: "Popup",
						34: "Product",
						35: "Rate History",
						36: "Rpanel Bank",
						37: "Rpanel Commodity",
						38: "Service Group",
						39: "Service Master",
						40: "SMS Settings",
						41: "SMS API",
						42: "Unfix Payment",
						43: "User Event",
						44: "User One Time Registration",
						45: "User Registration",
						46: "RPanel Data",
						47: "Pending Delivery",
						48: "Deal Register",
						49: "Trade ON/OFF",
						50: "Email Settings",
					};

					const {
						log_id,
						log_datetime,
						admin_ip,
						admin_user_name,
						log_book_adminuser,
						log_type,
						log_description
					} = item;
					const status = logTypeMap[log_type] || "Unknown";
					const logAdminIp = (admin_ip && admin_ip !== 'NULL') ? admin_ip : '-';
					//const logAdminId = admin_user_name || log_book_adminuser || '-';
					const logAdminId =
						(admin_user_name && admin_user_name !== 'Unknown')
							? admin_user_name
							: (log_book_adminuser && log_book_adminuser !== 'Unknown')
							? log_book_adminuser
							: '-';
					const statusBadge = getLogTypeBadge(log_type, status);

					table_val += `
          <tr>
              <td class="details-control align-2"><i class="glyphicon glyphicon-plus icon_class"></i></td>
              <td class="log_listdisc">${log_id}</td>
              <td>${log_datetime}</td>
              <td>${logAdminId}</td>
              <td>${logAdminIp}</td>
              <td>${statusBadge}</td>
              <td style="text-align:left !important;">${log_description}</td>
          </tr>`;
				});

				$('#grid-data').remove();
				$('#grid-data_wrapper').remove();
				var row_length = true;
				if (table_val == '') {
					table_val = '<tr><td colspan="23">No data available in table</td></tr>';
					row_length = false;
				}

				table += table_val + '</tbody></table>';
				$('.box-content').append(table);

				if (row_length) {
					oTable = $('#grid-data').dataTable({
						"sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>",
						"sPaginationType": "bootstrap",
						"iDisplayLength": 50,
						"scrollY": "500px",
						"scrollX": true,
						"scrollCollapse": true,
						"oLanguage": {
							"sLengthMenu": "_MENU_ records per page"
						}
					});
					oTable.fnSort([
						[1, 'desc']
					]);
					oTable.fnDraw();
				}
				$('.loading-overlay').hide();
			},
			error: function(request, error) {
				$('.loading-overlay').hide();
				showToast('Error loading data. Please try again.', 'error'); // P-ALERT fix
			}
		});
	}
</script>
<style>
	th,
	td {
		text-align: center !important;
		vertical-align: middle !important;
	}

	.table-responsive {
		background: white;
		/* padding: 20px; */
		border-radius: 10px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}
</style>
<!--<div>
        <ul class="breadcrumb">
            <li>
				<a href="<?php echo $this->config->item('base_url'); ?>index.php/C_main/load_mainpage">Admin</a>
@ -186,116 +232,57 @@ $controller_name = "C_adminlog";
        </ul>
    </div>-->

<script>
	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>

<div class="loading-overlay">
	<div class="loading-spinner">
		<i class="glyphicon glyphicon-refresh" style="font-size: 24px; animation: spin 1s linear infinite;"></i>
		<p style="margin: 10px 0 0 0;">Loading...</p>
	</div>
</div>
<style>
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>

<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-12 grid-margin stretch-card">
				<div class="card admin_log">
					<div class="card-body">
						<h4 class="card-title" style="color: #495057; font-weight: 600; font-size: 20px; margin-bottom: 20px;">
							<i class="glyphicon glyphicon-th" style="color: #667eea;"></i> Admin Log List
							<i id="refresh_page" style="vertical-align: middle; margin-left: 8px; cursor: pointer; color: #667eea; font-size: 18px;" class="glyphicon glyphicon-refresh" title="Click here to refresh page"></i>
						</h4>

						<div class="filter-panel">
							<div class="filter-row">
								<div class="date-input-wrapper">
									<label>From Date</label>
									<input type="text" name="from_date" id="from_date" readonly="true" value="" data-date-format="DD-MM-YYYY" />
								</div>
								<div class="date-input-wrapper">
									<label>To Date</label>
									<input type="text" name="to_date" id="to_date" readonly="true" value="" data-date-format="DD-MM-YYYY" />
								</div>
								<div class="filter-select-wrapper">
									<label>Filter by Type</label>
									<select id="log_type_filter" class="filter-select">
										<option value="">All Types</option>
										<option value="0">Trading</option>
										<option value="1">Commodity Group</option>
										<option value="2">Rpanel update</option>
										<option value="3">Rpanel status</option>
										<option value="4">Commodity Master</option>
										<option value="5">Premium group</option>
										<option value="6">Contract Master</option>
										<option value="7">Trade On/Off</option>
										<option value="8">Admin Rpanel</option>
										<option value="9">General Settings</option>
										<option value="10">Admin User</option>
										<option value="11">Advertisements</option>
										<option value="12">App Events</option>
										<option value="13">App Videos</option>
										<option value="14">Area</option>
										<option value="15">Booking Report</option>
										<option value="16">Admin Info</option>
										<option value="17">Category</option>
										<option value="18">Change Password</option>
										<option value="19">Client</option>
										<option value="20">Commodity Group Customer Service</option>
										<option value="21">Commodity Wise Gold Weight</option>
										<option value="22">Contract Symbol</option>
										<option value="23">Customer Group</option>
										<option value="24">Customer Service</option>
										<option value="25">Email Settings</option>
										<option value="26">Gallery</option>
										<option value="27">GRN</option>
										<option value="28">Margin Management</option>
										<option value="29">Marquee Text</option>
										<option value="30">Item Category</option>
										<option value="31">News</option>
										<option value="32">Old Gold</option>
										<option value="33">Popup</option>
										<option value="34">Product</option>
										<option value="35">Rate History</option>
										<option value="36">Rpanel Bank</option>
										<option value="37">Rpanel Commodity</option>
										<option value="38">Service Group</option>
										<option value="39">Service Master</option>
										<option value="40">SMS Settings</option>
										<option value="41">SMS API</option>
										<option value="42">Unfix Payment</option>
										<option value="43">User Event</option>
										<option value="44">User One Time Registration</option>
										<option value="45">User Registration</option>
										<option value="46">RPanel Data</option>
									</select>
								</div>
								<button class="btn search-btn" onclick="get_data();">
									<i class="glyphicon glyphicon-search"></i> Search
								</button>
								<div class="divider"></div>
								<div class="quick-dates">
									<button class="btn quick-date-btn" data-days="0">Today</button>
									<button class="btn quick-date-btn" data-days="1">Yesterday</button>
									<button class="btn quick-date-btn" data-days="30">Month</button>
								</div>
							</div>
						</div>

						<div class="table-responsive box-content">

							<?php
							$userreg = ($this->$model_name->get_data()->result_array());
							// print_r($userreg);exit;
							?>
							<table id="grid-data" class="table table-hover1 table-striped table-bordered bootstrap-datatable datatable reponsive">
								<thead>
									<tr>
										<th>#</th>
										<th>S.NO</th>
										<th>DateTime</th>
										<th>User</th>
										<th>IP</th>
										<th>Type</th>
										<th style="text-align: left !important;">Description</th>
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
	</div>
	<!-- partial -->
</div>
<?php $this->load->view('include/footer.php'); ?>