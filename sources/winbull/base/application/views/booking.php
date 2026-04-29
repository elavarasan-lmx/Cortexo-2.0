<?php
$secret = "logiMax@916#socket";
$token = hash('sha256', $secret);
?>
<script type="text/javascript">
	var SITE_BASE_URL = "<?php echo $this->config->item('base_url') ?>"
	var client = "<?php echo Globals::$bcclient; ?>";
	var bcurl = "<?php echo Globals::$bcurl; ?>";
	var socket_url = "<?php echo Globals::$socket_base_url; ?>";
	// var socket = io(socket_url);
	var socket = io(socket_url, {
		path: "/socket.io/",
		transports: ["websocket"],
		upgrade: false,
		reconnection: true,
		reconnectionAttempts: Infinity,
		reconnectionDelay: 2000,
		timeout: 20000
	});

	// ── Heartbeat: keep the Socket.IO connection alive ──
	setInterval(function () {
		if (socket && socket.connected) {
			socket.emit("heartbeat", {
				ts: Date.now()
			});
		}
	}, 20000);
	var bcencdata = "<?php echo Globals::$bcencdata; ?>";
	var bcrateType = "<?php echo Globals::$bcrateType; ?>";

	// if (bcrateType == 2) {
	// 	var rate_socket = io(socket_url, {
	// 		path: "/ratesocket/socket.io"
	// 	});
	// }

	// 	var SOCKET_TOKEN = "<?php echo $token; ?>";

	// 	if (bcrateType == 2) { 
	// 	var rate_socket = io(socket_url, {
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

	var SOCKET_TOKEN = "<?php echo $token; ?>";

	// if (bcrateType == 2) {
	// 	connectRateSocket();
	// }

	var bcurl = "<?php echo Globals::$bcurl; ?>";
	var bcclient = "<?php echo Globals::$bcclient; ?>";

	var comm_update = "<?php echo Globals::$evt_commupdate; ?>";
	var rp_update = "<?php echo Globals::$evt_rpanelupdate; ?>";
	var mrq_update = "<?php echo Globals::$evt_marqueeupdate; ?>";
	var news_update = "<?php echo Globals::$evt_newsupdate; ?>";
	var trdstatusupdate = "<?php echo Globals::$evt_trdstatusupdate; ?>";

	var colsubNames = new Array("askdollar", "premium", "bconvert_value", "inr", "rupeepremium", "custom", "btax_type", "btax_value", "pure", "grmrate", "kgrate");
	var rpanelbankrates = <?php echo json_encode($rpanelbank); ?>;
	var rpaneldata = <?php echo json_encode($rpaneldata); ?>;
	var rpanelsetting = <?php echo json_encode($rpanelsettings); ?>;
	var rpanelcontract = <?php echo json_encode($rpanel_contracts); ?>;
	var rpanelcommodities = <?php echo json_encode($rpanel_commodities); ?>;
	<?php $pop_image = $this->booking_model->get_image(); ?>
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

	function manual_roundoff(round_value, round_method, type) {
		if (round_method == 0) {
			return round_value;
		} else {
			var convert_value = 0;
			if (type == 'ask') {
				convert_value = Math.ceil(round_value / round_method) * round_method;
			} else {
				convert_value = Math.floor(round_value / round_method) * round_method;
			}
			return parseFloat(convert_value).toFixed(2);
		}
	}
</script>

<script
	src="<?php echo $this->config->item('base_url'); ?>assets/js/custom/booking.js?vs=<?php echo Globals::$web_version ?>"></script>

<?php if (isset($pop_image)) { ?>
	<a style="display:none" class="image-link"
		href="<?php echo $this->config->item('base_url'); ?>admin/assets/img/popup/<?php echo $pop_image ?>"
		data-simplbox="demo4"><img
			src="<?php echo $this->config->item('base_url'); ?>admin/assets/img/popup/<?php echo $pop_image ?>"
			alt="Image 07">Open popup</a>
<?php } ?>

<input type="hidden" name="updatetime" id="updatetime" value="" />
<input type="hidden" name="userupdatetime" id="userupdatetime" value="" />

<div class="container-fluid live-rates body_content">
	<div class="row g-3">
		<div class="col-md-5 col-xs-12 divrate animate fade-up delay-2">
			<div class="rate-card" id="divrate"
				style="<?php echo ($rpaneldata['market_status'] == 1 || $rpaneldata['rate_display'] == 0) ? 'display:none;' : ''; ?>">
				<div class="table-responsivetop1 animate fade-up delay-2">
					<table class="table-v2 table_responstive1" id="liveratetable">
						<thead>
							<tr class="headertable2">
								<th class="ratevalue">COMMODITY</th>
								<th class="ratevalue">BUYING RATE</th>
								<th class="ratevalue">SELLING RATE</th>
								<label align="center" id="connectionmsg" class="connectionmsg"
									style="display: none; color: rgb(204, 0, 0); margin-top: 54px; font-size:32px; background-color:#000000; position:absolute; line-height:86px;">We
									sense something went wrong, price are not live.</label>
							</tr>
						</thead>
						<tbody class="commodity">
							<?php foreach ($commoditydetails as $com => $comrow) {
								if ($comrow['com_is_coin'] != 1) { ?>
									<tr class="table1">
										<td class="com_name"><?php echo $comrow['com_name']; ?></td>
										<td class="ratevalue3"></td>
										<td class="ratevalue3"></td>
										<td style="display:none;">
											<div class="com_id"><?php echo $comrow['com_id']; ?></div>
											<div class="com_type"><?php echo $comrow['com_type']; ?></div>
											<div class="com_weight"><?php echo $comrow['com_weight']; ?></div>
											<div class="com_other_charges"><?php echo $comrow['com_other_charges']; ?></div>
											<div class="com_correction_type"><?php echo $comrow['com_correction_type']; ?></div>
											<div class="com_sel_premium"><?php echo $comrow['com_sel_premium']; ?></div>
											<div class="com_buy_premium"><?php echo $comrow['com_buy_premium']; ?></div>
											<div class="com_premium_type"><?php echo $comrow['com_premium_type']; ?></div>
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
											<div class="com_display_purity"><?php echo $comrow['com_display_purity']; ?></div>
											<div class="com_roundoff"><?php echo $comrow['com_roundoff']; ?></div>
											<div class="com_is_coin"><?php echo $comrow['com_is_coin']; ?></div>
											<div class="com_bar_quantity"><?php echo $comrow['com_bar_quantity']; ?></div>
											<div class="com_margin_type"><?php echo $comrow['com_margin_type']; ?></div>
											<div class="com_margin_value"><?php echo $comrow['com_margin_value']; ?></div>
											<div class="allowed_decimals"><?php echo $comrow['allowed_decimals']; ?></div>
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
											<div class="prem_sel_premium"><?php echo $comrow['prem_sel_premium']; ?></div>
											<div class="prem_buy_premium"><?php echo $comrow['prem_buy_premium']; ?></div>
											<div class="prem_comsell_active"><?php echo $comrow['prem_comsell_active']; ?></div>
											<div class="prem_combuy_active"><?php echo $comrow['prem_combuy_active']; ?></div>
											<div class="cus_com_amountpurch"><?php echo $comrow['cus_com_amountpurch']; ?></div>
										</td>
									</tr>
								<?php }
							} ?>
						</tbody>
					</table>
				</div>
				<div class="table_responsivetop2">
					<table class="table-v3 table_responsive1" id="liveratetable_coin" style="display:none">
						<thead>
							<tr class="headertable1">
								<th class="ratevalue" width="30%">COMMODITY</th>
								<th class="ratevalue11 " width="35%">BUY</th>
								<th class="ratevalue12" width="35%">SELL</th>
							</tr>
						</thead>
						<tbody class="table_over">
							<?php foreach ($commoditydetails as $com => $comrow) {
								if ($comrow['com_is_coin'] == 1) { ?>
									<tr class="table1">

										<td class="ratevalue1"><?php echo $comrow['com_name']; ?></td>
										<td><span class="ratevalue22"></span></td>
										<td class="ratevalue_1"><span class="ratevalue_2"></span></td>
										<td style="display:none;">
											<div class="com_id"><?php echo $comrow['com_id']; ?></div>
											<div class="com_type"><?php echo $comrow['com_type']; ?></div>
											<div class="com_weight"><?php echo $comrow['com_weight']; ?></div>
											<div class="com_other_charges"><?php echo $comrow['com_other_charges']; ?>
											</div>
											<div class="com_correction_type">
												<?php echo $comrow['com_correction_type']; ?>
											</div>
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
										</td>
									</tr>
								<?php }
							} ?>
						</tbody>
					</table>
				</div>
			</div>
			<div class="messagebox" id="messagebox"
				style="<?php echo ($rpaneldata['market_status'] == 1 && $rpaneldata['rate_display'] != 1) ? '' : 'display:none;'; ?>"
				align="center">
				<table width="100%" border="0" height="170px" style="border-top:0px;">
					<tr height="100px">
						<td id="messageboxtext" align="center" style="color:#000000;">
							<?php echo trim(strip_tags($rpaneldata['message']), '"'); ?>
						</td>
					</tr>
				</table>
			</div>
			<div id="onoffmessage" class="onoffmessage" align="center"
				style="<?php echo ($rpaneldata['rate_display'] == 0) ? '' : 'display:none;'; ?>">
				<table width="100%" border="0" height="250px">
					<tr height="50px">
						<td id="onoffmessagetext" align="center" style="color:#000000;"> Please wait market will
							be open shortly.</td>
					</tr>
				</table>
			</div>
			<div style="display:none;">
				<div class="market_closed"><?php echo $rpaneldata['market_status']; ?></div>
				<div class="rate_display"><?php echo $rpaneldata['rate_display']; ?></div>
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

			<table class="table rateTable" style="display:none;">
				<thead>
					<tr class="headertable3">
						<th class="ratevalue3">DESCRIPTION</th>
						<th class="ratevalue4">BID</th>
						<th class="ratevalue4">ASK</th>
						<th class="ratevalue9">HIGH/LOW</th>
					</tr>
				</thead>
				<tbody>
					<tr class="table1">
						<td class="ratevaluerightborder" style="">GOLD</td>
						<td class="ratevalue2">
							<div id="mcx_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="GOLD-C"
								data-field="bid">-</div>
						</td>
						<td class="ratevalue2">
							<div id="mcx_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="GOLD-C"
								data-field="ask">-</div>
						</td>
						<td class="ratevalue10"><span id="g_mcx_high" data-source="lightstreamer"
								data-grid="bidaskrates" data-item="GOLD-C" data-field="high">-</span> | <span
								id="g_mcx_low" data-source="lightstreamer" data-grid="bidaskrates" data-item="GOLD-C"
								data-field="low">-</span></td>
					</tr>
					<tr class="table2">
						<td class="ratevaluerightborder" style="">GOLD M</td>
						<td class="ratevalue2">
							<div id="g_mcx_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="MGOLD-C"
								data-field="bid">-</div>
						</td>
						<td class="ratevalue2">
							<div id="g_mcx_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="MGOLD-C"
								data-field="ask">-</div>
						</td>
						<td class="ratevalue10"><span id="g_mcx_high" data-source="lightstreamer"
								data-grid="bidaskrates" data-item="MGOLD-C" data-field="high">-</span> | <span
								id="g_mcx_low" data-source="lightstreamer" data-grid="bidaskrates" data-item="MGOLD-C"
								data-field="low">-</span></td>
					</tr>
					<tr class="table1">
						<td class="ratevaluerightborder" style="">SILVER</td>
						<td class="ratevalue2">
							<div id="s_mcx_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="SILVER-C"
								data-field="bid">-</div>
						</td>
						<td class="ratevalue2">
							<div id="s_mcx_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="SILVER-C"
								data-field="ask">-</div>
						</td>
						<td class="ratevalue10"><span id="s_mcx_high" data-source="lightstreamer"
								data-grid="bidaskrates" data-item="SILVER-C" data-field="high">-</span> | <span
								id="s_mcx_low" data-source="lightstreamer" data-grid="bidaskrates" data-item="SILVER-C"
								data-field="low"></span></td>
					</tr>
				</tbody>
			</table>

			<div class="table_responsivetop3" style="display:none;">
				<table class="table table_responsive3">
					<thead>
						<tr class="headertable1">
							<th class="ratevalue" width="24%">DESCRIPTION</th>
							<th class="ratevalue" width="19%">Bid</th>
							<th class="ratevalue" width="19%">Ask</th>
							<th class="ratevalue" width="19%">High</th>
							<th class="ratevalue" width="19%">Low</th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ($rpanel_contracts as $key => $contract) {
							if ($contract['userpage_status'] == 1) {
								echo '<tr class="table1"><td width="166px" class="ratevalue1">' . $contract['userpage_displayname'] . '</td><td width="116px" class="ratevalue2"><div class="txtlabel ' . $contract['contract_symbol'] . '_bid" id="' . $contract['contract_symbol'] . '_bid" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="bid">-</div></td><td width="116px" class="ratevalue2"><div class="txtlabel ' . $contract['contract_symbol'] . '_ask" id="' . $contract['contract_symbol'] . '_ask" data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="ask">-</div></td><td width="116px" class="ratevalue2"><div data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="high">-</div></td><td width="116px" class="ratevalue2"><div data-source="lightstreamer" data-grid="bidaskrates" data-item="' . $contract['contract_symbol'] . '" data-field="low">-</div></td></tr>';
							}
						} ?>
					</tbody>
				</table>
			</div>
		</div>

		<div class="col-md-7 col-xs-12 animate fade-up delay-4">
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
	</div>
	<div class="row animate fade-up delay-4">
		<div class="col-md-8 col-xs-12 animate fade-up delay-5 divrate" id="divrate">
			<div class="rate-card">
				<table class="table-v3 table-v4">
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
								<div class="ratevalue4 visible-xs ratevalue_2 gold_low high" data-source="lightstreamer"
									data-grid="bidaskrates" data-item="SPOT-GOLD" data-field="low">-</div>
							</td>
							<td class="ratevalue4 hidden-xs">
								<div class="ratevalue_2 gold_high" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-GOLD" data-field="high">-</div>
							</td>
							<td class="ratevalue4 hidden-xs">
								<div class="ratevalue_2 gold_low" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-GOLD" data-field="low">-</div>
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
								<div class="ratevalue_2 silver_high" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-SILVER" data-field="high">-</div>
							</td>
							<td class="ratevalue4 hidden-xs">
								<div class="ratevalue_2 silver_low" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-SILVER" data-field="low">-</div>
							</td>
						</tr>
						<tr>
							<td class="name-cell" style="">INR</td>
							<td class="ratevalue3">
								<div id="inr_bid" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-INR" data-field="bid">-</div>
								<div class="ratevalue4 visible-xs ratevalue_2 inr_high high" data-source="lightstreamer"
									data-grid="bidaskrates" data-item="SPOT-INR" data-field="high">-</span></div>
							</td>
							<td class="ratevalue3">
								<div id="inr_ask" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-INR" data-field="ask">-</div>
								<div class="ratevalue4 visible-xs ratevalue_2 inr_low high" data-source="lightstreamer"
									data-grid="bidaskrates" data-item="SPOT-INR" data-field="low">-</div>

							</td>
							<td class="ratevalue4 hidden-xs">
								<div class="ratevalue_2 inr_high" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-INR" data-field="high">-</div>
							</td>
							<td class="ratevalue4 hidden-xs">
								<div class="ratevalue_2 inr_low" data-source="lightstreamer" data-grid="bidaskrates"
									data-item="SPOT-INR" data-field="low">-</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div class="col-md-4 col-xs-12 animate fade-up delay-6">
			<div class="booking-info-wrapper">
				<div class="booking-info-box">
					<div class="info-item info-item1">
						<h5><i class="fa fa-phone"></i> BOOKING DESK</h5>
						<p><a href="tel:+919500555555">+91 9500555555</a></p>
					</div>
					<div class="info-item info-item1">
						<h5><i class="fa fa-truck"></i> DELIVERY DESK</h5>
						<p><a href="tel:+919790007777">+91 9790007777</a></p>
					</div>
					<div class="info-item">
						<h5>DOWNLOAD APP</h5>
						<div style="display: flex; gap: 10px; margin-top: 10px;">
							<a href="#"><i class="fa fa-android fa-2x"></i></a>
							<a href="#"><i class="fa fa-apple fa-2x"></i></a>
						</div>
					</div>
				</div>
				<!-- IMAGE -->
				<div class="gold-bars-img-container">
					<img src="<?php echo $this->config->item('base_url'); ?>assets/images/gold-bars.jpg"
						class="gold-bars-img" alt="Gold Bars">
				</div>
			</div>
		</div>
	</div>
</div>
<script type="text/javascript">
	var baseurl = SITE_BASE_URL;
	var lsdata = <?php echo json_encode($lsdetails); ?>;

	// Auto-clean market message: strip HTML tags & quotes whenever #messageboxtext is updated
	(function () {
		function cleanMarketMsg(html) {
			var t = document.createElement('div');
			t.innerHTML = html || '';
			return (t.textContent || t.innerText || '').replace(/["\u201C\u201D]/g, '').trim();
		}
		var el = document.getElementById('messageboxtext');
		if (el) {
			// Clean on initial load
			el.textContent = cleanMarketMsg(el.innerHTML);
			// Watch for future changes (from AJAX/socket)
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
<!-- <script src="<?php echo $this->config->item('base_url'); ?>assets/js/require.min.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/lightstreamer.js"></script>
<script src="<?php echo $this->config->item('base_url'); ?>assets/js/liverate.js" type="text/javascript"></script> -->