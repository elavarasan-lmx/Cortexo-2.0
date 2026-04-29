<?php $this->load->view('include/header.php'); ?>
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
	const baseurl = '<?= base_url() ?>';

	const DashboardApp = {
		charts: {},

		init() {
			this.initDateDefaults();
			this.setupEventListeners();
			this.loadDashboardData();
			this.loadBookingTrends();
		},

		initDateDefaults() {
			const today = new Date();
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(today.getFullYear() - 1);
			$('#trend_from_date').val(oneYearAgo.toISOString().split('T')[0]);
			$('#trend_to_date').val(today.toISOString().split('T')[0]);
		},

		setupEventListeners() {
			$('.link-redirect').on('click', function() {
				window.location.href = $(this).data('url');
			});

			const self = this;
			$('#trend_from_date, #trend_to_date').on('change', function() {
				const fromDate = $('#trend_from_date').val();
				const toDate = $('#trend_to_date').val();
				if (fromDate && toDate) {
					if (fromDate > toDate) {
						showToast('From Date should not be greater than To Date', "warning");
						return;
					}
					self.loadBookingTrends();
				}
			});
		},

		async loadDashboardData() {
			try {
				const [graphData, bookingData, deliveryData] = await Promise.all([
					this.fetchData('C_main/get_graphdata'),
					this.fetchData('C_main/bookings_request'),
					this.fetchData('C_main/delivered_bookings')
				]);

				this.updateStats(graphData, bookingData, deliveryData);
				this.renderCharts(graphData);
			} catch (error) {
				console.error('Dashboard load error:', error);
				this.showError('Failed to load dashboard data');
			}
		},

		async fetchData(endpoint) {
			const response = await $.ajax({
				type: 'POST',
				dataType: 'json',
				url: `${baseurl}index.php/${endpoint}`
			});
			console.log(`${endpoint} response:`, response);
			return response.records || response;
		},

		updateStats(graphData, bookingData, deliveryData) {
			const stats = graphData.records || graphData;
			$('#registeredcus_list').text(stats.tot_cus || '0');
			$('#tol_del_list').text(bookingData.total_booking || '0');
			$('#pending_del_list').text(deliveryData.delivered_orders || '0');
		},

		renderCharts(data) {
			console.log('Rendering charts with data:', data);
			this.renderCustomerChart(data.records || data);
			this.renderBookingRequestChart(data.records || data);
			this.renderDeliveryChart(data.records || data);
		},

		async loadBookingTrends() {
			try {
				const fromDate = $('#trend_from_date').val();
				const toDate = $('#trend_to_date').val();
				const response = await $.ajax({
					type: 'POST',
					dataType: 'json',
					url: `${baseurl}index.php/C_main/get_booking_trends`,
					data: {
						from_date: fromDate,
						to_date: toDate
					}
				});
				this.renderBookingTrendChart(response);
			} catch (error) {
				console.error('Booking trends load error:', error);
			}
		},

		renderCustomerChart(data) {
			const active = parseFloat(data.active) || 0;
			const inactive = parseFloat(data.inactive) || 0;

			if (active + inactive === 0) {
				this.renderEmptyChart('#customer');
				return;
			}

			this.charts.customer = new ApexCharts(document.querySelector('#customer'), {
				series: [active, inactive],
				chart: {
					type: 'donut',
					width: 280
				},
				labels: ['Active', 'Inactive'],
				colors: ['#28a745', '#dc3545'],
				legend: {
					position: 'bottom'
				},
				dataLabels: {
					enabled: true
				}
			});
			this.charts.customer.render();
		},

		renderBookingRequestChart(data) {
			const bookReq = parseFloat(data.booking_request) || 0;
			const limitOrder = parseFloat(data.limit_order) || 0;
			const confirmBook = parseFloat(data.confirm_book) || 0;

			if (bookReq + limitOrder + confirmBook === 0) {
				this.renderEmptyChart('#booking_req');
				return;
			}

			this.charts.bookingReq = new ApexCharts(document.querySelector('#booking_req'), {
				series: [bookReq, limitOrder, confirmBook],
				chart: {
					type: 'donut',
					width: 280
				},
				labels: ['Request', 'Limit', 'Confirmed'],
				colors: ['#ff6700', '#118ab2', '#9fc490'],
				legend: {
					position: 'bottom'
				},
				dataLabels: {
					enabled: true
				}
			});
			this.charts.bookingReq.render();
		},

		renderDeliveryChart(data) {
			const pendingReq = parseFloat(data.pending_request) || 0;
			const pendingOrder = parseFloat(data.pending_order) || 0;
			const pendingDel = parseFloat(data.pending_delivery) || 0;

			if (pendingReq + pendingOrder + pendingDel === 0) {
				this.renderEmptyChart('#delivery');
				return;
			}

			this.charts.delivery = new ApexCharts(document.querySelector('#delivery'), {
				series: [pendingReq, pendingOrder, pendingDel],
				chart: {
					type: 'donut',
					width: 280
				},
				labels: ['Request', 'Orders', 'Delivery'],
				colors: ['#ff5c8a', '#780000', '#c1121f'],
				legend: {
					position: 'bottom'
				},
				dataLabels: {
					enabled: true
				}
			});
			this.charts.delivery.render();
		},

		renderBookingTrendChart(data) {
			const bookingData = (data.bookings || []).map(v => parseFloat(v) || 0);
			const categories = data.dates || [];

			// Destroy previous chart if exists
			if (this.charts.booking) {
				this.charts.booking.destroy();
			}

			// Show no data message if empty
			if (bookingData.length === 0) {
				$('#booking').html('<div class="text-center text-muted py-5"><i class="typcn typcn-info-large" style="font-size:2rem"></i><p>No data available for the selected date range</p></div>');
				return;
			}

			$('#booking').html('');
			this.charts.booking = new ApexCharts(document.querySelector('#booking'), {
				series: [{
					name: 'Bookings',
					data: bookingData
				}],
				chart: {
					type: 'area',
					height: 350,
					zoom: {
						enabled: false
					}
				},
				xaxis: {
					categories: categories,
					title: {
						text: 'Date'
					},
					labels: {
						rotate: -45,
						rotateAlways: categories.length > 30,
						style: {
							fontSize: '10px'
						}
					},
					ticksAmount: 15
				},
				yaxis: {
					title: {
						text: 'Number of Bookings'
					}
				},
				stroke: {
					curve: 'smooth',
					width: 2,
					colors: ['#844fc1']
				},
				fill: {
					type: 'gradient',
					gradient: {
						shadeIntensity: 1,
						opacityFrom: 0.7,
						opacityTo: 0.3
					}
				},
				colors: ['#844fc1']
			});
			this.charts.booking.render();
		},

		renderEmptyChart(selector) {
			new ApexCharts(document.querySelector(selector), {
				series: [1],
				chart: {
					type: 'pie',
					width: 280
				},
				labels: ['No Data'],
				colors: ['#e0e0e0'],
				dataLabels: {
					enabled: false
				},
				legend: {
					show: false
				}
			}).render();
		},

		showError(message) {
			showToast(message, "error");
		}
	};

	$(document).ready(() => DashboardApp.init());

	<?php if ($this->session->flashdata('success') || $this->session->flashdata('error')): ?>
		showFlashMessage("<?= $this->session->flashdata('success'); ?>", "<?= $this->session->flashdata('error'); ?>");
	<?php endif; ?>
</script>

<div class="main-panel">
	<div class="content-wrapper">
		<div class="row">
			<div class="col-lg-4 col-md-6 mb-4">
				<div class="card shadow-sm h-100">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<div>
								<p class="text-muted mb-1">Registered Customers</p>
								<h2 class="mb-0 font-weight-bold" id="registeredcus_list">
									<div class="spinner-border spinner-border-sm text-primary" role="status"></div>
								</h2>
							</div>
							<i class="typcn typcn-user icon-xl text-primary"></i>
						</div>
						<div id="customer"></div>
					</div>
					<div class="card-footer bg-light link-redirect" data-url="<?= base_url() ?>index.php/C_userregistration/open_listingform/1" style="cursor:pointer">
						<small class="text-primary">View Details <i class="typcn typcn-arrow-right"></i></small>
					</div>
				</div>
			</div>

			<div class="col-lg-4 col-md-6 mb-4">
				<div class="card shadow-sm h-100">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<div>
								<p class="text-muted mb-1">Total Booking Requests</p>
								<h2 class="mb-0 font-weight-bold" id="tol_del_list">
									<div class="spinner-border spinner-border-sm text-success" role="status"></div>
								</h2>
							</div>
							<i class="typcn typcn-calendar-outline icon-xl text-success"></i>
						</div>
						<div id="booking_req"></div>
					</div>
					<div class="card-footer bg-light link-redirect" data-url="<?= base_url() ?>index.php/C_customerDelivery/listing/3" style="cursor:pointer">
						<small class="text-success">View Details <i class="typcn typcn-arrow-right"></i></small>
					</div>
				</div>
			</div>

			<div class="col-lg-4 col-md-6 mb-4">
				<div class="card shadow-sm h-100">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center mb-3">
							<div>
								<p class="text-muted mb-1">Delivered Bookings</p>
								<h2 class="mb-0 font-weight-bold" id="pending_del_list">
									<div class="spinner-border spinner-border-sm text-danger" role="status"></div>
								</h2>
							</div>
							<i class="typcn typcn-document icon-xl text-danger"></i>
						</div>
						<div id="delivery"></div>
					</div>
					<div class="card-footer bg-light link-redirect" data-url="<?= base_url() ?>index.php/C_customerDelivery/listing/6" style="cursor:pointer">
						<small class="text-danger">View Details <i class="typcn typcn-arrow-right"></i></small>
					</div>
				</div>
			</div>
		</div>

		<div class="row">
			<div class="col-12">
				<div class="card shadow-sm">
					<div class="card-header bg-white">
						<div class="d-flex justify-content-between align-items-center flex-wrap">
							<h5 class="mb-0 text-uppercase">Booking Trends</h5>
							<div class="d-flex align-items-center" style="gap: 10px;">
								<label class="mb-0 small text-muted">From</label>
								<input type="date" id="trend_from_date" class="form-control form-control-sm" style="width: 150px;" />
								<label class="mb-0 small text-muted">To</label>
								<input type="date" id="trend_to_date" class="form-control form-control-sm" style="width: 150px;" />
							</div>
						</div>
					</div>
					<div class="card-body">
						<div id="booking"></div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<?php $this->load->view('include/footer.php'); ?>
</div>

<style>
	.card {
		transition: transform 0.2s;
	}

	.card:hover {
		transform: translateY(-5px);
	}

	.icon-xl {
		font-size: 3rem;
		opacity: 0.3;
	}

	.card-footer:hover {
		background-color: #f8f9fa !important;
	}

	.apexcharts-menu-icon {
		display: none !important;
	}
</style>