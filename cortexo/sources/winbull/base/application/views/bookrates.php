<?php
$secret = "logiMax@916#socket";
$token = hash('sha256', $secret);
$tradeObj = new Trading();
$settings = $tradeObj->get_settings();
if ($this->session->userdata('username')) {
	$username = $this->session->userdata('username');
	$return_customer = $tradeObj->get_customerid($username);
	$cus_id = $return_customer['cus_id'];
	$cus_name = $return_customer['cus_name'];
	$cus_active = $return_customer['cus_active'];
	$groupname = $return_customer['groupname'];
	$cus_limitenable = $return_customer['cus_limitenable'];
	$customer_type = $return_customer['customer_type'];
} else {
	$cus_id = "";
	$cus_name = "";
	$cus_active = "";
	$groupname = "Default";
	$customer_type = "";
}
?>

<script type="text/javascript">
	var SITE_BASE_URL = "<?php echo $this->config->item('base_url') ?>"
	var client = "<?php echo Globals::$client; ?>";
	var socket_url = "<?php echo Globals::$socket_base_url; ?>";
	// var socket = io(socket_url);
	var socket = io(socket_url, {
		path: "/socket.io/",
		transports: ["websocket"], // 🔥 FORCE WEBSOCKET ONLY
		upgrade: false, // 🔥 DO NOT FALL BACK
		reconnection: true,
		reconnectionAttempts: Infinity, // keep retrying forever
		reconnectionDelay: 2000,
		timeout: 20000
	});

	// --- Socket.IO Heartbeat to prevent idle disconnection ---
	var _heartbeatTimer = null;

	function _startHeartbeat() {
		if (_heartbeatTimer) clearInterval(_heartbeatTimer);
		_heartbeatTimer = setInterval(function () {
			if (socket && socket.connected) {
				socket.emit('heartbeat', {
					timestamp: Date.now()
				});
			}
		}, 20000); // every 20 seconds
	}

	function _stopHeartbeat() {
		if (_heartbeatTimer) {
			clearInterval(_heartbeatTimer);
			_heartbeatTimer = null;
		}
	}
	socket.on('connect', function () {
		_startHeartbeat();
	});
	socket.on('disconnect', function () {
		_stopHeartbeat();
	});
	socket.io.on('reconnect', function () {
		_startHeartbeat();
	}); // v4+ manager event
	if (socket.connected) {
		_startHeartbeat();
	}
	// --- End Heartbeat ---
	var bcurl = "<?php echo Globals::$bcurl; ?>";
	var bcclient = "<?php echo Globals::$bcclient; ?>";

	var bcencdata = "<?php echo Globals::$bcencdata; ?>";
	var bcrateType = "<?php echo Globals::$bcrateType; ?>";
	// if (bcrateType == 2) {
	// 	var rate_socket = io(socket_url, {
	// 		path: "/ratesocket/socket.io"
	// 	});
	// }

	var SOCKET_TOKEN = "<?php echo $token; ?>";

	// if (bcrateType == 2) { 
	// var rate_socket = io(socket_url, {
	// 		path: "/ratesocket/socket.io/",
	// 		transports: ["websocket"],   // 🔥 NO POLLING  
	// 		auth: {
	// 			token: SOCKET_TOKEN
	// 		},
	// 		upgrade: false,
	// 		reconnection: true,
	// 		reconnectionAttempts: 5,
	// 		reconnectionDelay: 2000,
	// 		timeout: 20000
	// 	});
	// }

	var comm_update = "<?php echo Globals::$evt_commupdate; ?>"
	var rp_update = "<?php echo Globals::$evt_rpanelupdate; ?>"
	var mrq_update = "<?php echo Globals::$evt_marqueeupdate; ?>"
	var news_update = "<?php echo Globals::$evt_newsupdate; ?>"
	var trdstatusupdate = "<?php echo Globals::$evt_trdstatusupdate; ?>"

	var colsubNames = new Array("askdollar", "premium", "bconvert_value", "inr", "rupeepremium", "custom", "btax_type", "btax_value", "pure", "grmrate", "kgrate");
	var rpanelbankrates = <?php echo json_encode($rpanelbank); ?>;
	var rpaneldata = <?php echo json_encode($rpaneldata); ?>;
	var rpanelsetting = <?php echo json_encode($rpanelsettings); ?>;
	var rpanelcontract = <?php echo json_encode($rpanel_contracts); ?>;
	var rpanelcommodities = <?php echo json_encode($rpanel_commodities); ?>;

	<?php if (isset($pop_image)) { ?>
		jQuery(document).ready(function () {
			jQuery('.image-link').magnificPopup({
				type: 'image'
			});
			jQuery(".image-link").get(0).click();
		});
		// Handles the resize event
		jQuery(window)
			.off(".resizeImage")
			.on("resize.resizeImage", fnResizeImage);
	<?php } ?>
</script>

<script
	src="<?php echo $this->config->item('base_url'); ?>assets/js/custom/bookrates.js?vs=<?php echo Globals::$web_version ?>"></script>

<?php if (isset($pop_image)) { ?>
	<a style="display:none" class="image-link"
		href="<?php echo $this->config->item('base_url'); ?>admin/assets/img/popup/<?php echo $pop_image ?>"
		data-simplbox="demo4"><img
			src="<?php echo $this->config->item('base_url'); ?>admin/assets/img/popup/<?php echo $pop_image ?>"
			alt="Image 07">Open popup</a>
<?php } ?>

<div class="container-fluid live-rates body_content">
	<div class="row">
		<div class="container">
			<div class="col-md-7 col-xs-12 col-sm-12">
				<div class="animate fade-up delay-2">
					<div class="rate-card" id="divrate"
						style="<?php echo ($rpaneldata['market_status'] == 1 || $rpaneldata['rate_display'] == 0) ? 'display:none;' : ''; ?>">
						<div class="table-responsivetop1 animate fade-up delay-2">
							<table class="table-v2 table_responstive1" id="liveratetable">
								<thead>
									<tr class="headertable2">
										<th class="ratevalue">COMMODITY</th>
										<th class="ratevalue">BUY</th>
										<th class="ratevalue">SELL</th>
										<label align="center" id="connectionmsg" class="connectionmsg"
											style="display: none; color: rgb(204, 0, 0); margin-top: 54px; font-size:32px; background-color:#000000; position:absolute; line-height:86px;"></label>
									</tr>

								</thead>
								<tbody class="commodity">
									<?php foreach ($commoditydetails as $com => $comrow) {
										if ($comrow['com_is_coin'] != 1) { ?>
											<tr class="table1" id="liverates">
												<td class="com_name"><?php echo $comrow['com_name']; ?></td>
												<td class="ratevalue3"></td>
												<td class="ratevalue3"></td>
												<td style="display:none;">
													<div class="com_id"><?php echo $comrow['com_id']; ?></div>
													<div class="com_type"><?php echo $comrow['com_type']; ?></div>
													<div class="com_weight"><?php echo $comrow['com_weight']; ?></div>
													<div class="com_other_charges"><?php echo $comrow['com_other_charges']; ?>
													</div>
													<div class="com_correction_type">
														<?php echo $comrow['com_correction_type']; ?></div>
													<div class="com_sel_premium"><?php echo $comrow['com_sel_premium']; ?></div>
													<div class="com_buy_premium"><?php echo $comrow['com_buy_premium']; ?></div>
													<div class="com_premium_type"><?php echo $comrow['com_premium_type']; ?>
													</div>
													<div class="com_sel_active"><?php echo $comrow['com_sel_active']; ?></div>
													<div class="com_buy_active"><?php echo $comrow['com_buy_active']; ?></div>
													<div class="com_delverydays"><?php echo $comrow['com_delverydays']; ?></div>
													<div class="com_isregion"><?php echo $comrow['com_isregion']; ?></div>
													<div class="com_calpurity"><?php echo $comrow['com_calpurity']; ?></div>
													<div class="com_tax"><?php echo $comrow['com_tax']; ?></div>
													<div class="com_octroi"><?php echo $comrow['com_octroi']; ?></div>
													<div class="com_stamduty"><?php echo $comrow['com_stamduty']; ?></div>
													<div class="deliverydays"><?php echo $comrow['deliverydays']; ?></div>
													<div class="displyname"><?php echo $comrow['displyname']; ?></div>
													<div class="mcxsymbol"><?php echo $comrow['mcxsymbol']; ?></div>
													<div class="banksymbol"><?php echo $comrow['banksymbol']; ?></div>
													<div class="rcomid"><?php echo $comrow['rcomid']; ?></div>
													<div class="trade_type"><?php echo $comrow['trade_type']; ?></div>
													<div class="sell_diff"><?php echo $comrow['sell_diff']; ?></div>
													<div class="buy_diff"><?php echo $comrow['buy_diff']; ?></div>
													<div class="sell_rate"><?php echo $comrow['sell_rate']; ?></div>
													<div class="com_display_purity"><?php echo $comrow['com_display_purity']; ?>
													</div>
													<div class="com_roundoff"><?php echo $comrow['com_roundoff']; ?></div>
													<div class="com_is_coin"><?php echo $comrow['com_is_coin']; ?></div>
													<div class="com_bar_quantity"><?php echo $comrow['com_bar_quantity']; ?>
													</div>
													<div class="com_margin_type"><?php echo $comrow['com_margin_type']; ?></div>
													<div class="com_margin_value"><?php echo $comrow['com_margin_value']; ?>
													</div>
													<div class="allowed_decimals"><?php echo $comrow['allowed_decimals']; ?>
													</div>
													<div class="com_bar_type"><?php echo $comrow['com_bar_type']; ?></div>
													<div class="bar_selection"><?php echo $comrow['bar_selection']; ?></div>
													<div class="com_bar_no"><?php echo $comrow['com_bar_no']; ?></div>
													<div class="com_unit"><?php echo $comrow['com_unit']; ?></div>
													<div class="statusbuy">0</div>
													<div class="statussell">0</div>
													<div class="is_gst"><?php echo $comrow['is_gst']; ?></div>
													<div class="is_tcs"><?php echo $comrow['is_tcs']; ?></div>
													<div class="rcom_sell_tax"><?php echo $comrow['rcom_sell_tax']; ?></div>
													<div class="rcom_buy_tax"><?php echo $comrow['rcom_buy_tax']; ?></div>
													<div class="rcom_sell_tcs"><?php echo $comrow['rcom_sell_tcs']; ?></div>
													<div class="rcom_buy_tcs"><?php echo $comrow['rcom_buy_tcs']; ?></div>
													<div class="prem_sel_premium"><?php echo $comrow['prem_sel_premium']; ?>
													</div>
													<div class="prem_buy_premium"><?php echo $comrow['prem_buy_premium']; ?>
													</div>
													<div class="prem_comsell_active">
														<?php echo $comrow['prem_comsell_active']; ?></div>
													<div class="prem_combuy_active"><?php echo $comrow['prem_combuy_active']; ?>
													</div>
													<div class="cus_com_amountpurch">
														<?php echo isset($comrow['cus_com_amountpurch']) ? $comrow['cus_com_amountpurch'] : 0; ?>
													</div>
													<div class="cus_com_sell">
														<?php echo isset($comrow['cus_com_sell']) ? $comrow['cus_com_sell'] : 1; ?>
													</div>
													<div class="cus_com_buy">
														<?php echo isset($comrow['cus_com_buy']) ? $comrow['cus_com_buy'] : 1; ?>
													</div>
												</td>
											</tr>
										<?php }
									} ?>
								</tbody>
							</table>
						</div>
						<div class="table_responsivetop2">
							<table class="table table_responsive1" id="liveratetable_coin" style="display:none">
								<thead>
									<tr class="headertable1">
										<th class="ratevalue" width="40%">COMMODITY</th>
										<th class="ratevalue11" width="30%">BUY</th>
										<th class="ratevalue12" width="30%">SELL</th>

									</tr>
								</thead>
								<tbody class="table_over">
									<?php foreach ($commoditydetails as $com => $comrow) {
										if ($comrow['com_is_coin'] == 1) { ?>
											<tr class="table1">
												<td class="ratevalue1 com_name"><?php echo $comrow['com_name']; ?></td>
												<td class="ratevalue2"></td>
												<td class="ratevalue2"></td>
												<td style="display:none;">
													<div class="com_id"><?php echo $comrow['com_id']; ?></div>
													<div class="com_type"><?php echo $comrow['com_type']; ?></div>
													<div class="com_weight"><?php echo $comrow['com_weight']; ?></div>
													<div class="com_other_charges"><?php echo $comrow['com_other_charges']; ?>
													</div>
													<div class="com_correction_type">
														<?php echo $comrow['com_correction_type']; ?></div>
													<div class="com_sel_premium"><?php echo $comrow['com_sel_premium']; ?></div>
													<div class="com_buy_premium"><?php echo $comrow['com_buy_premium']; ?></div>
													<div class="com_premium_type"><?php echo $comrow['com_premium_type']; ?>
													</div>
													<div class="com_sel_active"><?php echo $comrow['com_sel_active']; ?></div>
													<div class="com_buy_active"><?php echo $comrow['com_buy_active']; ?></div>
													<div class="com_delverydays"><?php echo $comrow['com_delverydays']; ?></div>
													<div class="com_isregion"><?php echo $comrow['com_isregion']; ?></div>
													<div class="com_calpurity"><?php echo $comrow['com_calpurity']; ?></div>
													<div class="com_tax"><?php echo $comrow['com_tax']; ?></div>
													<div class="com_octroi"><?php echo $comrow['com_octroi']; ?></div>
													<div class="com_stamduty"><?php echo $comrow['com_stamduty']; ?></div>
													<div class="deliverydays"><?php echo $comrow['deliverydays']; ?></div>
													<div class="displyname"><?php echo $comrow['displyname']; ?></div>
													<div class="mcxsymbol"><?php echo $comrow['mcxsymbol']; ?></div>
													<div class="banksymbol"><?php echo $comrow['banksymbol']; ?></div>
													<div class="rcomid"><?php echo $comrow['rcomid']; ?></div>
													<div class="trade_type"><?php echo $comrow['trade_type']; ?></div>
													<div class="sell_diff"><?php echo $comrow['sell_diff']; ?></div>
													<div class="buy_diff"><?php echo $comrow['buy_diff']; ?></div>
													<div class="sell_rate"><?php echo $comrow['sell_rate']; ?></div>
													<div class="com_display_purity"><?php echo $comrow['com_display_purity']; ?>
													</div>
													<div class="com_is_coin"><?php echo $comrow['com_is_coin']; ?></div>
													<div class="com_roundoff"><?php echo $comrow['com_roundoff']; ?></div>
													<div class="cus_com_amountpurch">
														<?php echo isset($comrow['cus_com_amountpurch']) ? $comrow['cus_com_amountpurch'] : 0; ?>
													</div>
													<div class="cus_com_sell">
														<?php echo isset($comrow['cus_com_sell']) ? $comrow['cus_com_sell'] : 1; ?>
													</div>
													<div class="cus_com_buy">
														<?php echo isset($comrow['cus_com_buy']) ? $comrow['cus_com_buy'] : 1; ?>
													</div>


												</td>
											</tr>
										<?php }
									} ?>
								</tbody>
							</table>
						</div>
					</div>

					<div style="display:none;">
						<table class="displaycontract" border="0" cellpadding="0" cellspacing="0" id="table1">
							<thead>
								<tr class="title">
									<td class="titleheading1">Symbol</td>
									<td>Bid</td>
									<td>Ask</td>
									<td>High</td>
									<td>Low</td>
								</tr>
							</thead>
							<tbody>
								<?php foreach ($rpanel_contracts as $key => $contract) {
									echo '<tr><td class="rateheading">' . $contract['displayname'] . '<input type="hidden" name="fv[rpcontract][' . $contract['contract_symbol'] . '][contract]" value="' . $contract['contract_id'] . '" /></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_bid" id="' . $contract['contract_symbol'] . '_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="bid">-</div></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_ask" id="' . $contract['contract_symbol'] . '_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="ask">-</div></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_high" id="' . $contract['contract_symbol'] . '_high" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="high">-</div></td><td><div class="txtlabel ' . $contract['contract_symbol'] . '_low" id="' . $contract['contract_symbol'] . '_low" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="low">-</div></td></tr>';
								} ?>
							</tbody>
						</table>
					</div>
				</div>

				<div class="messagebox" id="messagebox"
					style="<?php echo ($rpaneldata['market_status'] == 1 && $rpaneldata['rate_display'] != 2) ? '' : 'display:none;'; ?>"
					align="center">
					<table width="100%" border="0" height="170px" style="border-top:0px;">
						<tr height="100px">
							<td id="messageboxtext" align="center" style="padding: 143px;font-size: 13px;color: #000;">
								<?php echo trim(strip_tags($rpaneldata['message']), '"'); ?></td>
						</tr>
					</table>
				</div>
				<div id="onoffmessage" class="onoffmessage" align="center"
					style="<?php echo ($rpaneldata['market_status'] == 0 && $rpaneldata['rate_display'] == 0) ? '' : 'display:none;'; ?>">
					<table width="100%" border="0" height="250px">
						<tr height="50px">
							<td id="onoffmessagetext" align="center" style="padding: 143px;font-size: 13px;color:#000;">
								Please wait market will be open shortly.</td>
						</tr>
					</table>
				</div>
				<div class="lastupdate" style="display:none">
					<strong>LAST UPDATE TIME</strong>
					<span class="time" id="gold_updatetime" style="padding: 143px;font-size: 13px;color:#000;">-</span>
				</div>
				<div class="table-responsivetop3" style="display:none;">
					<table class="table table_responstive1">
						<thead>
							<tr class="headertable2">

								<th class="ratevalue">
									<h4 style="">DESCRIPTION</h4>
								</th>
								<th class="ratevalue11">
									<h4 style="">BID</h4>
								</th>
								<th class="ratevalue11">
									<h4 style="">ASK</h4>
								</th>
								<th class="ratevalue11">
									<h4 style="">HIGH </h4>
								</th>
								<th class="ratevalue13">
									<h4 style=""> LOW</h4>
								</th>

							</tr>
						</thead>
						<tbody class="table_over">
							<tr class="table1">
								<td style="">GOLD ($)</td>
								<td class="ratevalue1">
									<div id="gold_bid1" class="cardbuy" data-source="lightstreamer"
										data-grid="bidaskrates" data-item="SPOT-GOLD" data-field="bid">-</div>
								</td>
								<td class="ratevalue1">
									<div id="gold_ask1" class="cardsell" data-source="lightstreamer"
										data-grid="bidaskrates" data-item="SPOT-GOLD" data-field="ask">-</div>
								</td>
								<td class="ratevalue2"><span data-source="lightstreamer" data-grid="bidaskrates"
										data-item="SPOT-GOLD" data-field="high">-</span></td>
								<td class="ratevalue2"><span data-source="lightstreamer" data-grid="bidaskrates"
										data-item="SPOT-GOLD" data-field="low">-</span></td>

							</tr>
							<tr class="table2">

								<td style="">SILVER ($)</td>
								<td class="ratevalue1">
									<div id="silver_bid1" class="cardbuy" data-source="lightstreamer"
										data-grid="bidaskrates" data-item="SPOT-SILVER" data-field="bid">-</div>
								</td>
								<td class="ratevalue1">
									<div id="silver_ask1" class="cardsell" data-source="lightstreamer"
										data-grid="bidaskrates" data-item="SPOT-SILVER" data-field="ask">-</div>
								</td>
								<td class="ratevalue2"><span data-source="lightstreamer" data-grid="bidaskrates"
										data-item="SPOT-SILVER" data-field="high">-</span></td>
								<td class="ratevalue2"><span data-source="lightstreamer" data-grid="bidaskrates"
										data-item="SPOT-SILVER" data-field="low">-</span></td>

							</tr>
							<tr class="table1">
								<td style="">INR ($)</td>
								<td class="ratevalue1">
									<div id="inr_bid1" class="cardbuy" data-source="lightstreamer"
										data-grid="bidaskrates" data-item="SPOT-INR" data-field="bid">-</div>
								</td>
								<td class="ratevalue1">
									<div id="inr_ask1" class="cardsell" data-source="lightstreamer"
										data-grid="bidaskrates" data-item="SPOT-INR" data-field="ask">-</div>
								</td>
								<td class="ratevalue2"><span data-source="lightstreamer" data-grid="bidaskrates"
										data-item="SPOT-INR" data-field="high">-</span></td>
								<td class="ratevalue2"><span data-source="lightstreamer" data-grid="bidaskrates"
										data-item="SPOT-INR" data-field="low">-</span></td>

							</tr>
						</tbody>
					</table>
				</div>
				<div class="table-responsivetop1 animate fade-up delay-3">
					<div class="rate-card">
						<table class="table-v3" id="liveratetable2">
							<thead>
								<tr>
									<th>DESCRIPTION</th>
									<th>BID</th>
									<th>ASK</th>
									<th>HIGH</th>
									<th>LOW</th>
								</tr>
							</thead>
							<tbody class="commodity">
								<!-- Dynamics rows will be inserted/updated here by JS -->
							</tbody>
						</table>
					</div>
				</div>
				<div class="table-responsivetop1 animate fade-up delay-3">
					<div class="rate-card">
						<table class="table-v3">
							<thead>
								<tr>
									<th>DESCRIPTION</th>
									<th>BID</th>
									<th>ASK</th>
									<th>HIGH</th>
									<th>LOW</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td class="name-cell" style="">GOLD($)</td>
									<td class="ratevalue3">
										<div class="" id="gold_bid" data-source="lightstreamer" data-grid="bidaskrates"
											data-item="SPOT-GOLD" data-field="bid">-</div>
										<div class="ratevalue4 visible-xs ratevalue_2 gold_high high"
											data-source="lightstreamer" data-grid="bidaskrates" data-item="SPOT-GOLD"
											data-field="high">-</div>
									</td>
									<td class="ratevalue3">
										<div id="gold_ask" data-source="lightstreamer" data-grid="bidaskrates"
											data-item="SPOT-GOLD" data-field="ask">-</div>
										<div class="ratevalue4 visible-xs ratevalue_2 gold_low high"
											data-source="lightstreamer" data-grid="bidaskrates" data-item="SPOT-GOLD"
											data-field="low">-</div>
									</td>
									<td class="ratevalue4 hidden-xs">
										<div class="ratevalue_2 gold_high" data-source="lightstreamer"
											data-grid="bidaskrates" data-item="SPOT-GOLD" data-field="high">-</div>
									</td>
									<td class="ratevalue4 hidden-xs">
										<div class="ratevalue_2 gold_low" data-source="lightstreamer"
											data-grid="bidaskrates" data-item="SPOT-GOLD" data-field="low">-</div>
									</td>
								</tr>
								<tr>
									<td class="name-cell" style="">SILVER ($)</td>
									<td class="ratevalue3">
										<div id="silver_bid" data-source="lightstreamer" data-grid="bidaskrates"
											data-item="SPOT-SILVER" data-field="bid">-</div>
										<div class="ratevalue4 visible-xs ratevalue_2 silver_high high"
											data-source="lightstreamer" data-grid="bidaskrates" data-item="SPOT-SILVER"
											data-field="high">-</div>
									</td>
									<td class="ratevalue3">
										<div id="silver_ask" data-source="lightstreamer" data-grid="bidaskrates"
											data-item="SPOT-SILVER" data-field="ask">-</div>
										<div class="ratevalue4 visible-xs ratevalue_2 silver_low high"
											data-source="lightstreamer" data-grid="bidaskrates" data-item="SPOT-SILVER"
											data-field="low">-</div>
									</td>
									<td class="ratevalue4 hidden-xs">
										<div class="ratevalue_2 silver_high" data-source="lightstreamer"
											data-grid="bidaskrates" data-item="SPOT-SILVER" data-field="high">-</div>
									</td>
									<td class="ratevalue4 hidden-xs">
										<div class="ratevalue_2 silver_low" data-source="lightstreamer"
											data-grid="bidaskrates" data-item="SPOT-SILVER" data-field="low">-</div>
									</td>
								</tr>
								<tr>
									<td class="name-cell" style="">INR</td>
									<td class="ratevalue3">
										<div id="inr_bid" data-source="lightstreamer" data-grid="bidaskrates"
											data-item="SPOT-INR" data-field="bid">-</div>
										<div class="ratevalue4 visible-xs ratevalue_2 inr_high high"
											data-source="lightstreamer" data-grid="bidaskrates" data-item="SPOT-INR"
											data-field="high">-</span></div>
									</td>
									<td class="ratevalue3">
										<div id="inr_ask" data-source="lightstreamer" data-grid="bidaskrates"
											data-item="SPOT-INR" data-field="ask">-</div>
										<div class="ratevalue4 visible-xs ratevalue_2 inr_low high"
											data-source="lightstreamer" data-grid="bidaskrates" data-item="SPOT-INR"
											data-field="low">-</div>

									</td>
									<td class="ratevalue4 hidden-xs">
										<div class="ratevalue_2 inr_high" data-source="lightstreamer"
											data-grid="bidaskrates" data-item="SPOT-INR" data-field="high">-</div>
									</td>
									<td class="ratevalue4 hidden-xs">
										<div class="ratevalue_2 inr_low" data-source="lightstreamer"
											data-grid="bidaskrates" data-item="SPOT-INR" data-field="low">-</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="col-md-5 col-xs-12 col-sm-12 tradingtable animate fade-up delay-1">
				<div class="col-md-12 col-xs-12 col-sm-12 rate-card trade-section">
					<div class="col-md-12 col-xs-12 col-sm-12 requst_heading">
						<div class="margin-container col-md-12 col-xs-12 col-sm-12 headertable1">
							TRADING TERMINAL<span id="activate_terminal">(Refresh)</span>
						</div>
					</div>
					<div class="col-md-12 col-xs-12 col-sm-12 comm-purchase">
						<input type="hidden" name="book_cusid" id="book_cusid" value="<?php echo $cus_id ?>" />
						<input type="hidden" name="book_comid" id="book_comid" value="" />
						<input type="hidden" name="book_comweight" id="book_comweight" value="" />
						<input type="hidden" name="confirmation_for" id="confirmation_for" value="" />
						<input type="hidden" name="book_barquantity" id="book_barquantity" value="" />
						<input type="hidden" name="book_type" id="book_type" value="" />
						<input type="hidden" name="book_comtype" id="book_comtype" value="" />
						<input type="hidden" name="margin" id="margin" value="" />
						<input type="hidden" name="margin_type" id="margin_type" value="" />
						<input type="hidden" name="maxqty" id="maxqty" value="" />
						<input type="hidden" name="has_order" id="has_order" value="" />
						<input type="hidden" name="order_bookno" id="order_bookno" value="" />
						<input type="hidden" name="gold_high_tol" id="gold_high_tol"
							value="<?php echo isset($settings['gold_tol'][0]) ? $settings['gold_tol'][0] : 0 ?>" />
						<input type="hidden" name="gold_low_tol" id="gold_low_tol"
							value="<?php echo isset($settings['gold_tol'][1]) ? $settings['gold_tol'][1] : 0 ?>" />
						<input type="hidden" name="silver_high_tol" id="silver_high_tol"
							value="<?php echo isset($settings['silver_tol'][0]) ? $settings['silver_tol'][0] : 0 ?>" />
						<input type="hidden" name="silver_low_tol" id="silver_low_tol"
							value="<?php echo isset($settings['silver_tol'][1]) ? $settings['silver_tol'][1] : 0 ?>" />
						<input type="hidden" name="allowed_decimals" id="allowed_decimals" value="0" />
						<input type="hidden" name="com_bar_type" id="com_bar_type" value="" />
						<input type="hidden" name="bar_selection" id="bar_selection" value="" />
						<input type="hidden" name="com_bar_no" id="com_bar_no" value="" />
						<input type="hidden" name="premsel_premium" id="premsel_premium" value="" />
						<input type="hidden" name="prembuy_premium" id="prembuy_premium" value="" />
						<input type="hidden" name="premcomsell_active" id="premcomsell_active" value="" />
						<input type="hidden" name="premcombuy_active" id="premcombuy_active" value="" />
						<input type="hidden" name="cus_com_amountpurch" id="cus_com_amountpurch" value="" />
						<input type="hidden" name="discount_amt" id="discount_amt" value="" />
						<input type="hidden" name="deliverydate" id="deliverydate" value="" />
						<div class="col-md-12 col-xs-12 col-sm-12" style="padding: 0px;">
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows row" <?php if ($settings['limit_enable'] == 0 || $cus_limitenable == 0) { ?> style="display:none" <?php } ?>>
								<div class="col-md-2 col-sm-2 col-xs-12 request-btn-text">
									Type
								</div>
								<div class="col-md-10 col-sm-10 col-xs-12 request-btn-value type" style="padding:0px">
									<input checked type="radio" value="0" name="request_type" id="new_booktype" />
									<label for="new_booktype">Market</label>
									<input type="radio" value="1" name="request_type" id="new_ordertype" /> <label
										for="new_ordertype">Limit Order</label>
									<input type="radio" value="2" name="request_type" id="update_ordertype" /> <label
										for="update_ordertype">Modify Order</label>
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows row" style="margin-top: 10px">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Commodity
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value"
									style="padding-left: 0px; padding-right: 0px;">
									<select id="book_comname" class="form-control width-input">

									</select>
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows row" id="margin_content" <?php if ($settings['display_margin'] == 0) { ?> style="display:none" <?php } ?>>
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Available Margin
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value estimations" id="avail_margin">
								</div>
							</div>
							<div class="col-md-12 col-sm-12 col-xs-12 request-rows row">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text" id="rate_disp">
									Rate
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value"
									style="padding-left: 0px; padding-right: 0px;">
									<input class="form-control  width-input" name="book_rate" id="book_rate"
										type="number" readonly />
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows limitno row" style="display:none">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Order No
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value qty"
									style="padding-left: 0px;padding-right: 0px;">
									<select id="limitno" class="form-control  width-input">
										<option value="-1">-Select Order No-</option>
									</select>
								</div>
							</div>
							<div class="col-md-12 col-xs-12 request-rows ordervalue row" style="display:none">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text" id="order_disprate">
									Order Rate
								</div>
								<div class="col-md-7 col-sm-12 col-xs-12 request-value qty"
									style="padding-left: 0px;padding-right: 0px;">
									<input class="form-control  width-input" name="order_rate" id="order_rate"
										type="number" />
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows trade_amount_weight row"
								style="display:none;">
								<div class="col-md-6 col-sm-6 col-xs-12 request-btn-text">
									Trade based on
								</div>
								<div class="col-md-6 col-sm-6 col-xs-12 request-btn-value type" style="padding:0px">
									<input checked type="radio" value="0" name="deal_type" id="deal_typeweight" />
									<label for="deal_typeweight">Weight</label>

									<div class="amount_purchase">
										<input type="radio" value="1" name="deal_type" id="deal_typeamount" />
										<label for="deal_typeamount">Amount</label>
									</div>
								</div>
							</div>

							<div class="col-md-12 col-xs-12 col-sm-12 request-rows deal_totalamt row" id="deal_totalamt"
								style="display:none">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Total Amount
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value"
									style="padding-left: 0px;padding-right: 0px;" id="required_amount">
									<input id="book_totamt" name="book_totamt" type="number"
										class="form-control width-input" />
								</div>

							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows row">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Qty <label class="qty_type" style=""></label>
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value qty"
									style="padding-left: 0px;padding-right: 0px;" id="required_qty">
									<input id="book_qty" name="book_qty" type="number"
										class="form-control width-input" />
								</div>
								<div class="displayLotSize"></div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows delivery_date row">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Delivery Date
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value"
									style="padding-left: 0px;padding-right: 0px;">
									<div class="displaydate estimations"
										style="padding-left: 10px;font-weight:bold;font-size:18px"></div>
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows discountvalue row"
								style="display:none">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Discount
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value"
									style="padding-left: 0px;padding-right: 0px;">
									<div class="displaydiscount estimations" style="padding-left: 10px;"></div>
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows ordervalue row" style="display:none">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Rate
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value qty"
									style="padding-left: 0px;padding-right: 0px;">
									<input class="form-control  width-input" name="book_rate_wtdis" id="book_rate_wtdis"
										type="number" readonly />
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 maxmin"></div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows row" id="estimation_content">
								<div class="col-md-5 col-sm-6 col-xs-12 request-text">
									Estimation
								</div>
								<div class="col-md-7 col-sm-6 col-xs-12 request-value estimations" id="book_totalcost">
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows row">
								<div class="col-md-6 col-sm-12 col-xs-12 request-rows button-book button-center"
									id="book">
									<div class="buysellrates col-md-12 col-xs-12" onclick="customer_request();">
										<div class="col-md-12 col-xs-12 col-sm-12 rateval">0.00</div>
										<span id="buy_sell">BUY/SELL</span>
									</div>
								</div>
							</div>
							<div class="col-md-12 col-xs-12 col-sm-12 request-rows row booking-buttons">
								<div class="col-md-6 col-sm-12 col-xs-12 request-rows button-update" id="book_update"
									style="display:none">
									<div class="buysellrates col-md-12 col-xs-12" onclick="customer_request_update();">
										<div class="col-md-12 col-xs-12 col-sm-12 rateval_update">0.00</div>
										<span id="">Update Limit</span>
									</div>
								</div>
								<div class="col-md-6 col-sm-6 col-xs-12 button-cancel" id="book_cancel"
									style="display:none">
									<div class="buysellrates col-md-12 col-xs-12 col-sm-12 cancel_order"
										onclick="customer_request_delete();">
										Cancel Limit
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-12 col-sm-12 col-xs-12 reports-container animate fade-up delay-2">
				<div class="col-md-12 col-sm-12 col-xs-12 report-heading paddingzero row">
					<div class="col-md-2 col-sm-2 col-xs-12 headings headings-active" onclick="load_report(1)"
						id="rep_trade_history">
						Trade History
					</div>
					<div <?php if ($settings['limit_enable'] == 0) { ?> style="display:none" <?php } ?>
						class="col-md-2 col-sm-12 col-xs-12 headings" onclick="load_report(2)" id="rep_pending_deal">
						Limit Orders
					</div>
					<div class="col-md-2 col-sm-2 col-xs-12 headings" onclick="load_report(3)" id="rep_transactions"
						style="display:none">
						Transactions
					</div>
					<div class="col-md-2 col-sm-2 col-xs-12 headings" onclick="load_report(4)" id="rep_m2m"
						style="display:none">
						M2M
					</div>
					<div <?php if ($settings['clientlimit_enable'] == 0) { ?> style="display:none" <?php } ?>
						class="col-md-2 col-sm-12 col-xs-12  headings" onclick="load_report(5)" id="rep_tradable">
						Client Limit
					</div>
					<!-- <div class="col-md-2 col-sm-12 headings" onclick="load_report(5)" id="rep_tradable">
						Client Limit
					</div> -->
					<div class="col-md-2 col-sm-2 col-xs-12 refresh_report1">
						( <i class="fa fa-refresh refresh_report" title="Click here to refresh"></i> )
					</div>
				</div>
				<div class="col-md-12 col-xs-12 col-sm-12 paddingzero" id="reports">
					<table class="table table-bordered table-striped table-hover report_table">
						<thead>
							<tr>
								<th>Order No.</th>
								<th>Date&amp;Time</th>
								<th>Commodity</th>
								<th>Type</th>
								<th>Qty</th>
								<th>Price</th>
								<th>Del Qty</th>
								<th>Book by</th>
								<th>Status</th>
							</tr>
						</thead>
						<thead></thead>
						<tbody>
							<tr>
								<td colspan="9">No records found in table</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="col-md-5 col-xs-12 col-sm-12 paddingzero" style="text-align: center">
				</div>
			</div>
			<div id="status_modal" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-body">
							<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
									aria-hidden="true">&times;</span></button>
							<div align="center" style="color:#000000" id="booking_status"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script type="text/javascript">
	var baseurl = SITE_BASE_URL;
	var lsdata = <?php echo json_encode($lsdetails); ?>;
	jQuery(document).on('input', '#book_qty', function () {
		if (this.value.length > 20) this.value = this.value.slice(0, 20);
	});

	// Auto-clean market message: strip HTML tags & quotes whenever #messageboxtext is updated
	(function () {
		function cleanMarketMsg(html) {
			var t = document.createElement('div');
			t.innerHTML = html || '';
			return (t.textContent || t.innerText || '').replace(/["\u201C\u201D]/g, '').trim();
		}
		var el = document.getElementById('messageboxtext');
		if (el) {
			el.textContent = cleanMarketMsg(el.innerHTML);
			var obs = new MutationObserver(function () {
				obs.disconnect();
				var raw = el.innerHTML;
				var clean = cleanMarketMsg(raw);
				if (raw !== clean) el.textContent = clean;
				obs.observe(el, { childList: true, characterData: true, subtree: true });
			});
			obs.observe(el, { childList: true, characterData: true, subtree: true });
		}
	})();
</script>