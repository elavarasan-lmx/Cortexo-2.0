var lastKnownState = {};

function flashCell($el, color) {
	if (!$el || $el.length === 0) return;
	clearTimeout($el.data('flashTimer'));
	var el = $el[0];
	el.style.setProperty('color', '#FFFFFF', 'important');
	el.style.setProperty('background-color', color, 'important');
	var timer = setTimeout(function () {
		el.style.removeProperty('color');
		el.style.removeProperty('background-color');
	}, 1000);
	$el.data('flashTimer', timer);
}

function applyCachedRates() {
	var allData = Object.values(lastKnownState).join("\n");
	if (allData.length > 0) {
		OnSuccess(allData);
	}
}
let ws;
let reconnectTimer = null;

function connectRateSocket() {
	// Guard: Don't connect if already connecting or open
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
		return;
	}

	// Clear any existing reconnect timer to avoid double-triggers
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}

	ws = new WebSocket("ws://www.maharajgoldsmith.com/ws", [SOCKET_TOKEN]);

	ws.onopen = () => {
		console.log("✅ WebSocket Connected");
	};

	ws.onmessage = (event) => {
		let data = event.data;
		if (typeof OnSuccess === "function") {
			OnSuccess(data);
		}
	};

	ws.onclose = () => {
		ws = null;
		// Only reconnect if the tab is still visible
		if (!document.hidden) {
			console.log("⚠️ WebSocket closed. Reconnecting in 2s...");
			reconnectTimer = setTimeout(connectRateSocket, 2000);
		} else {
			console.log("💤 Tab hidden, stopping auto-reconnect.");
		}
	};

	ws.onerror = (err) => {
		console.error("❌ WebSocket Error:", err);
		ws.close();
	};
}

$(document).ready(function () {

	document.addEventListener("visibilitychange", function () {
		if (document.hidden) {
			console.log("Browser tab is hidden - disconnecting WebSocket");
			if (ws) {
				ws.close();
			}
		} else {
			console.log("Browser tab is visible - reconnecting WebSocket");
			commodity_update();
			connectRateSocket();
		}
	});

	document.addEventListener("visibilitychange", function () {
		if (document.hidden) {
			console.log("Browser tab is hidden")
		} else {
			//commodity_update();
		}
	});

	socket.on(comm_update, function (data) {
		var $ = jQuery.noConflict();

		commodity_update();
		clear_bookingterminal();
		$('#order_rate').val("");
		$("#avail_margin").html("");
		get_tradingdatas();
	});
	socket.on(rp_update, function (data) {
		rpanel_update();
	});
	socket.on(mrq_update, function (data) {
		var $ = jQuery.noConflict();
		$("#marquee").html("");
		var marqueText = data.updatedata.mrq_text + '';
		try {
			marqueText = decodeURIComponent(marqueText.replace(/\+/g, '%20'));
		} catch (e) {
			marqueText = marqueText.replace(/\+/g, ' ');
		}
		$("#marquee").append("<marquee scrollamount='4' onmouseover='this.stop();' onmouseout='this.start();' >" + marqueText + "</marquee>");
	});
	socket.on(news_update, function (data) {
		$("#newsevents").html("");
		$("#newsevents").append('<marquee direction="up" onmouseover="this.stop();" onmouseout="this.start();" scrollamount="2" align="middle" style="height: 151px; padding-left: 2px;">' + data.updatedata.news + '</marquee>');
	});
	socket.on(trdstatusupdate, function (data) {
		if (typeof data.updatedata !== 'undefined') {
			var tradingstatus = data.updatedata;
			var $ = jQuery.noConflict();
			$(tradingstatus).each(function (count_i, status) {
				if (status.client == client) {
					enable_trade = status.trade_enable;
					clear_bookingterminal();
					$('#order_rate').val("");
					$("#avail_margin").html("");
				}
			});
		}
	});
});

// function commodity_update() {
// 	var $ = jQuery.noConflict();

// 	$.ajax({
// 		url: SITE_BASE_URL + "index.php/C_booking/get_commodity_data",
// 		type: "GET",
// 		dataType: "json",
// 		data: "",
// 		async: false,
// 		success: function (data) {
// 			console.log("commodityDetails", data.commodity);
// 			console.log("ContractDetails", data.contracts);
// 			rpanelcontract = data.contracts;
// 			if (data.commodity.commoditydetails.length > 0) {
// 				$("#liveratetable tbody").empty();
// 				$("#liveratetable_coin tbody").empty();
// 				rpanelcommodities = data.commodity.rpanel_commodities;
// 			}
// 			$.each(data.commodity.commoditydetails, function (idx, commodity) {
// 				if (commodity.com_is_coin != 1) {
// 					var com_classname = (commodity.com_type == 0) ? 'tabw4 gold com_name' : 'tabw4 silver com_name';
// 					var tablerow = '<tr class="mainprogold tab1" id="liverates"><td class="' + com_classname + '">' + commodity.com_name + '</td><td class="tabw5 rate"></td><td class="tabw5 rate"></td><td class="ratevalue11" style="display:none;">' + commodity.deliverydays + '</td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_bar_quantity">' + commodity.com_bar_quantity + '</div><div class="com_margin_type">' + commodity.com_margin_type + '</div><div class="com_margin_value">' + commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">' + commodity.com_bar_type + '</div><div class="bar_selection">' + commodity.bar_selection + '</div><div class="com_bar_no">' + commodity.com_bar_no + '</div><div class="com_unit">' + commodity.com_unit + '</div><div class="statusbuy">0</div><div class="statussell">0</div><div class="is_gst">' + commodity.is_gst + '</div><div class="is_tcs">' + commodity.is_tcs + '</div><div class="rcom_sell_tax">' + commodity.rcom_sell_tax + '</div><div class="rcom_buy_tax">' + commodity.rcom_buy_tax + '</div><div class="rcom_sell_tcs">' + commodity.rcom_sell_tcs + '</div><div class="rcom_buy_tcs">' + commodity.rcom_buy_tcs + '</div></td></tr>';
// 					$("#liveratetable tbody").append(tablerow);
// 				}
// 				if (commodity.com_is_coin == 1) {
// 					var tablerow = '<tr class="table1"><td class="ratevalue1 com_name">' + commodity.com_name + '</td><td class="ratevalue2"></td><td class="ratevalue2"></td><td style="display:none;">' + commodity.deliverydays + '</td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div><div class="com_bar_quantity">' + commodity.com_bar_quantity + '</div><div class="com_margin_type">' + commodity.com_margin_type + '</div><div class="com_margin_value">' + commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">' + commodity.com_bar_type + '</div><div class="bar_selection">' + commodity.bar_selection + '</div><div class="com_bar_no">' + commodity.com_bar_no + '</div><div class="com_unit">' + commodity.com_unit + '</div><div class="statusbuy">0</div><div class="statussell">0</div><div class="is_gst">' + commodity.is_gst + '</div><div class="is_tcs">' + commodity.is_tcs + '</div><div class="rcom_sell_tax">' + commodity.rcom_sell_tax + '</div><div class="rcom_buy_tax">' + commodity.rcom_buy_tax + '</div><div class="rcom_sell_tcs">' + commodity.rcom_sell_tcs + '</div><div class="rcom_buy_tcs">' + commodity.rcom_buy_tcs + '</div></td></tr>';
// 					$("#liveratetable_coin tbody").append(tablerow);
// 				}
// 			});
// 		},
// 		error: function (request, error) {
// 			console.log(error);
// 		}
// 	});
// }
function commodity_update() {
	var $ = jQuery.noConflict();
	$.ajax({
		url: SITE_BASE_URL + "index.php/C_booking/get_commodity_data",
		type: "GET",
		dataType: "json",
		data: "",
		async: false,
		success: function (data) {
			console.log(data, 'data');
			console.log("commodityDetails", data.commodity.commoditydetails);
			console.log("ContractDetails", data.contracts);
			rpanelcontract = data.contracts;
			if (data.commodity.commoditydetails.length > 0) {
				$("#liveratetable tbody").empty();
				$("#liveratetable_coin tbody").empty();
				rpanelcommodities = data.commodity.rpanel_commodities;
			}
			$.each(data.commodity.commoditydetails, function (idx, commodity) {
				console.log(commodity, 'commodity');

				if (commodity.com_is_coin != 1 && (commodity.cus_com_sell == 1 || commodity.cus_com_buy == 1)) {
					var tablerow =
						'<tr class="table1" id="liverates">' +
						'<td class="com_name">' + commodity.com_name + '</td>' +
						'<td class="ratevalue3"></td>' +
						'<td class="ratevalue3"></td>' +
						'<td class="ratevalue10" style="display:none">' + commodity.deliverydays + '</td>' +

						'<td style="display:none;">' +
						'<div class="com_id">' + commodity.com_id + '</div>' +
						'<div class="com_type">' + commodity.com_type + '</div>' +
						'<div class="com_weight">' + commodity.com_weight + '</div>' +
						'<div class="com_other_charges">' + commodity.com_other_charges + '</div>' +
						'<div class="com_correction_type">' + commodity.com_correction_type + '</div>' +
						'<div class="com_sel_premium">' + commodity.com_sel_premium + '</div>' +
						'<div class="com_buy_premium">' + commodity.com_buy_premium + '</div>' +
						'<div class="com_premium_type">' + commodity.com_premium_type + '</div>' +
						'<div class="com_sel_active">' + commodity.com_sel_active + '</div>' +
						'<div class="com_buy_active">' + commodity.com_buy_active + '</div>' +
						'<div class="com_delverydays">' + commodity.com_delverydays + '</div>' +
						'<div class="com_isregion">' + commodity.com_isregion + '</div>' +
						'<div class="com_calpurity">' + commodity.com_calpurity + '</div>' +
						'<div class="com_tax">' + commodity.com_tax + '</div>' +
						'<div class="com_octroi">' + commodity.com_octroi + '</div>' +
						'<div class="com_stamduty">' + commodity.com_stamduty + '</div>' +
						'<div class="deliverydays">' + commodity.deliverydays + '</div>' +
						'<div class="displyname">' + commodity.displyname + '</div>' +
						'<div class="mcxsymbol">' + commodity.mcxsymbol + '</div>' +
						'<div class="banksymbol">' + commodity.banksymbol + '</div>' +
						'<div class="rcomid">' + commodity.rcomid + '</div>' +
						'<div class="trade_type">' + commodity.trade_type + '</div>' +
						'<div class="sell_diff">' + commodity.sell_diff + '</div>' +
						'<div class="buy_diff">' + commodity.buy_diff + '</div>' +
						'<div class="sell_rate">' + commodity.sell_rate + '</div>' +
						'<div class="com_display_purity">' + commodity.com_display_purity + '</div>' +
						'<div class="com_roundoff">' + commodity.com_roundoff + '</div>' +
						'<div class="com_is_coin">' + commodity.com_is_coin + '</div>' +
						'<div class="com_bar_quantity">' + commodity.com_bar_quantity + '</div>' +
						'<div class="com_margin_type">' + commodity.com_margin_type + '</div>' +
						'<div class="com_margin_value">' + commodity.com_margin_value + '</div>' +
						'<div class="allowed_decimals">' + commodity.allowed_decimals + '</div>' +
						'<div class="com_bar_type">' + commodity.com_bar_type + '</div>' +
						'<div class="bar_selection">' + commodity.bar_selection + '</div>' +
						'<div class="com_bar_no">' + commodity.com_bar_no + '</div>' +
						'<div class="com_unit">' + commodity.com_unit + '</div>' +
						'<div class="statusbuy">0</div>' +
						'<div class="statussell">0</div>' +
						'<div class="is_gst">' + commodity.is_gst + '</div>' +
						'<div class="is_tcs">' + commodity.is_tcs + '</div>' +
						'<div class="rcom_sell_tax">' + commodity.rcom_sell_tax + '</div>' +
						'<div class="rcom_buy_tax">' + commodity.rcom_buy_tax + '</div>' +
						'<div class="rcom_sell_tcs">' + commodity.rcom_sell_tcs + '</div>' +
						'<div class="rcom_buy_tcs">' + commodity.rcom_buy_tcs + '</div>' +
						'<div class="prem_sel_premium">' + commodity.prem_sel_premium + '</div>' +
						'<div class="prem_buy_premium">' + commodity.prem_buy_premium + '</div>' +
						'<div class="prem_comsell_active">' + commodity.prem_comsell_active + '</div>' +
						'<div class="prem_combuy_active">' + commodity.prem_combuy_active + '</div>' +
						'<div class="cus_com_amountpurch">' + commodity.cus_com_amountpurch + '</div>' +
						'</td>' +
						'</tr>';

					$("#liveratetable tbody").append(tablerow);
				}
				if (commodity.com_is_coin == 1 && (commodity.cus_com_sell == 1 || commodity.cus_com_buy == 1)) {
					var tablerow = '<tr class="table1"><td class="ratevalue1 com_name">' + commodity.com_name + '</td><td class="ratevalue2" style="display:none;"></td><td class="ratevalue2"></td><td style="display:none;">' + commodity.deliverydays + '</td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div><div class="com_bar_quantity">' + commodity.com_bar_quantity + '</div><div class="com_margin_type">' + commodity.com_margin_type + '</div><div class="com_margin_value">' + commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">' + commodity.com_bar_type + '</div><div class="bar_selection">' + commodity.bar_selection + '</div><div class="com_bar_no">' + commodity.com_bar_no + '</div><div class="com_unit">' + commodity.com_unit + '</div><div class="statusbuy">0</div><div class="statussell">0</div><div class="is_gst">' + commodity.is_gst + '</div><div class="is_tcs">' + commodity.is_tcs + '</div><div class="rcom_sell_tax">' + commodity.rcom_sell_tax + '</div><div class="rcom_buy_tax">' + commodity.rcom_buy_tax + '</div><div class="rcom_sell_tcs">' + commodity.rcom_sell_tcs + '</div><div class="rcom_buy_tcs">' + commodity.rcom_buy_tcs + '</div><div class="prem_sel_premium">' + commodity.prem_sel_premium + '</div><div class="prem_buy_premium">' + commodity.prem_buy_premium + '</div><div class="prem_comsell_active">' + commodity.prem_comsell_active + '</div><div class="prem_combuy_active">' + commodity.prem_combuy_active + '</div></td></tr>';
					$("#liveratetable_coin tbody").append(tablerow);
				}
			});
			applyCachedRates();
		},
		error: function (request, error) {
			console.log(error);
		}
	});
}
function rpanel_update() {
	jQuery.ajax({
		url: SITE_BASE_URL + "index.php/C_booking/get_rpanel_data",
		type: "GET",
		dataType: "json",
		data: "",
		async: false,
		success: function (data) {
			var $ = jQuery.noConflict();
			console.log("RpanelData", data);
			rpanelbankrates = data.rpanelbank;
			rpaneldata = data.rpaneldata;
			rpanelcommodities = data.rpanel_commodities;
			$(".market_closed").html(data.rpaneldata.market_status);
			$(".rate_display").html(data.rpaneldata.rate_display);

			if (data.rpaneldata.rate_display == 0) {
				document.getElementById("onoffmessage").style.display = "block";
				document.getElementById("messagebox").style.display = "none";
				document.getElementById("divrate").style.display = "none";
			} else if (data.rpaneldata.rate_display == 1 && data.rpaneldata.market_status == 1) {
				document.getElementById("onoffmessage").style.display = "none";
				document.getElementById("divrate").style.display = "none";
				document.getElementById("messagebox").style.display = "block";
				$("#messageboxtext").html(data.rpaneldata.message);
			} else if (data.rpaneldata.rate_display == 1 && data.rpaneldata.market_status != 1) {
				document.getElementById("onoffmessage").style.display = "none";
				document.getElementById("messagebox").style.display = "none";
				document.getElementById("divrate").style.display = "block";
			}
		},
		error: function (request, error) {
			console.log(error);
		}
	});
}
let oInterval = null;
function fnStartClock() {
	try {
		refreshData();
		if (oInterval) {
			clearInterval(oInterval);
		}
		oInterval = setInterval(refreshData, 1200);
	}
	catch (e) {
		console.error("fnStartClock error:", e);
	}
}
// Pause/resume based on tab visibility
// document.addEventListener('visibilitychange', function () {
// 	if (document.hidden) {
// 		if (oInterval) {
// 			clearInterval(oInterval);
// 			oInterval = null;
// 			//console.log("Paused refresh due to tab inactivity");
// 		}
// 		if (rate_socket) {
// 			rate_socket.disconnect();
// 		}
// 	} else {
// 		if (bcrateType == 2) {
// 			rate_socket.connect();
// 		} else {
// 			fnStartClock();
// 			// rate_socket.on("rateUpdate", (rate) => { OnSuccess(rate.rate); });
// 		}
// 		//console.log("Resumed refresh due to tab activation");
// 	}
// });
// Optional: clean up on unload
// window.addEventListener('beforeunload', () => {
// 	if (oInterval) {
// 		clearInterval(oInterval);
// 	}
// 	if (rate_socket) {
// 		rate_socket.disconnect();
// 	}
// });
function refreshData() {
	if (bcrateType == 0) {
		CallWebServiceFromJquery();
	} else if (bcrateType == 1) {
		CallWebServiceFromJquery_encryption();
	}

}
function CallWebServiceFromJquery() {
	try {
		jQuery.ajax({
			type: "POST",
			url: bcurl,
			dataType: "text",
			headers: { "Content-Type": "application/json" },
			data: JSON.stringify({ "client": bcclient }),
			crossDomain: true,
			processData: false,
			success: OnSuccess,
			error: OnError,
			cache: false
		});
	}
	catch (e) {
	}

}


function CallWebServiceFromJquery_encryption() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", bcencdata, true);
	xhr.responseType = "blob"; // receive binary data

	xhr.onload = function () {
		if (xhr.status === 200) {
			const reader = new FileReader();
			reader.onload = function () {
				const text = reader.result;
				OnSuccess(text);
			};
			reader.readAsText(xhr.response);
		} else {
			console.error("Failed:", xhr.status);
		}
	};

	xhr.onerror = function () {
		console.error("XHR error");
	};

	xhr.send();
}
function OnError(request, status, error) {
	//alert("Webservice Error: " + request.statusText + " " + error);
}

function getCurrentDateTime() {

	var currentdate = new Date();
	var datetime = currentdate.getDate() + "-"
		+ (currentdate.getMonth() + 1) + "-"
		+ currentdate.getFullYear() + " @ "
		+ currentdate.getHours() + ":";

	if (currentdate.getMinutes() < 10) {
		datetime = datetime + "0" + currentdate.getMinutes() + ":";
	}
	else {
		datetime = datetime + currentdate.getMinutes() + ":";
	}

	if (currentdate.getSeconds() < 10) {
		datetime = datetime + "0" + currentdate.getSeconds();
	}
	else {
		datetime = datetime + currentdate.getSeconds();
	}


	return datetime;
}
// function OnSuccess(data, status) {
// 	//console.log("Onsuccess");
// 	try {
// 		var $ = jQuery.noConflict();
// 		//console.log("Onsuccesstry");
// 		var datetime = getCurrentDateTime();

// 		var messagesDesktopp = "";
// 		messagesDesktopp = data.split("\n");
// 		//alert(messagesDesktopp.length);
// 		if (typeof oldData == 'undefined') {
// 			oldData = data.toString();
// 		}
// 		var messagesOldDesktop = oldData.split("\n");
// 		for (var i = 0; i < messagesDesktopp.length; i++) {
// 			var retDesktop = messagesDesktopp[i].split("\t");
// 			var oldRetDesktop;
// 			if (messagesOldDesktop[i] != undefined)
// 				oldRetDesktop = messagesOldDesktop[i].split("\t");
// 			if (typeof retDesktop[1] != 'undefined') {
// 				if (retDesktop[0] == 3) {
// 					$("#liveratetable").find('tbody > tr').each(function (i, el) {
// 						var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
// 							com_type = parseInt($(this).find('td:last div:eq(1)').html()),
// 							com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
// 							com_other_charges = parseInt($(this).find('td:last div:eq(4)').html()),
// 							com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
// 							com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
// 							com_roundoff = parseFloat($(this).find('td:last div:eq(26)').html()),
// 							prem_sel_premium = parseFloat($(this).find('td:last div:eq(44)').html()),
// 							prem_buy_premium = parseFloat($(this).find('td:last div:eq(45)').html()),
// 							prem_comsell_active = parseFloat($(this).find('td:last div:eq(46)').html()),
// 							prem_combuy_active = parseFloat($(this).find('td:last div:eq(47)').html());
// 						if (retDesktop[1] == com_id) {
// 							// if (retDesktop[4] != '-') {
// 							// 	var selling_rate = parseFloat(parseFloat(retDesktop[4]).toFixed(2) - parseFloat(prem_sel_premium).toFixed(2)).toFixed(com_roundoff);
// 							// } else {
// 							// 	selling_rate = '-';
// 							// }
// 							// if (retDesktop[3] != '-') {
// 							// 	var buying_rate = parseFloat(parseFloat(retDesktop[3]).toFixed(2) - parseFloat(prem_buy_premium).toFixed(2)).toFixed(com_roundoff);
// 							// } else {
// 							// 	buying_rate = '-';
// 							// }

// 							// if (com_sel_active == 0) {
// 							// 	selling_rate = '-';
// 							// }
// 							// if (com_buy_active == 0) {
// 							// 	buying_rate = '-';
// 							// }
// 							if (retDesktop[4] != '-') {
// 								var selling_rate = (com_sel_active && prem_comsell_active) ? (parseFloat(retDesktop[4]) - parseFloat(prem_sel_premium)).toFixed(com_roundoff) /* + parseFloat(com_other_charges) */ : '-';
// 							} else {
// 								var selling_rate = '-';
// 							}
// 							if (retDesktop[3] != '-') {
// 								var buying_rate = (com_buy_active && prem_combuy_active) ? (parseFloat(retDesktop[3]) - parseFloat(prem_buy_premium)).toFixed(com_roundoff) : '-';
// 							} else {
// 								var buying_rate = '-';
// 							}

// 							if (buying_rate > parseFloat($(this).find('td:eq(1)').html())) {
// 								$(this).find('td:eq(1)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(1)').css('background-color', '#008000');
// 							} else if (buying_rate < parseFloat($(this).find('td:eq(1)').html())) {
// 								$(this).find('td:eq(1)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(1)').css('background-color', '#FF0000');
// 							} else {
// 								$(this).find('td:eq(1)').css('color', '');
// 								$(this).find('td:eq(1)').css('background-color', '');
// 							}
// 							$(this).find('td:eq(1)').html(buying_rate);


// 							if (selling_rate > parseFloat($(this).find('td:eq(2)').html())) {
// 								$(this).find('td:eq(2)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(2)').css('background-color', '#008000');
// 							} else if (selling_rate < parseFloat($(this).find('td:eq(2)').html())) {
// 								$(this).find('td:eq(2)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(2)').css('background-color', '#FF0000');
// 							} else {
// 								$(this).find('td:eq(2)').css('color', '');
// 								$(this).find('td:eq(2)').css('background', '');
// 							}
// 							$(this).find('td:eq(2)').html(selling_rate);

// 							if (typeof trade_status_id !== 'undefined') {
// 								$(trade_status_id).each(function (j, value) {
// 									var styleSell = "";
// 									var onclickSell = "";
// 									var styleBuy = "";
// 									var onclickBuy = "";
// 									var statusbuy = 0;
// 									var statussell = 0;
// 									var buyClass = "";
// 									var sellClass = "";
// 									var removeSellClass = "";
// 									var removeBuyClass = "";

// 									if (parseInt($(el).find(".com_id").html()) == parseInt(trade_status_id[j])) {
// 										if (enable_trade == 1) {
// 											if (((customer_type == 0 || customer_type == 2) && trade_status_sell[j] == 1 && !isNaN(selling_rate))) {
// 												onclickSell = "show_values(this,1)";
// 												sellClass = "sellEnabled";
// 												removeSellClass = "sellDisabled";
// 											}
// 											else {
// 												onclickSell = "";
// 												sellClass = "sellDisabled";
// 												removeSellClass = "sellEnabled";
// 											}
// 											if (((customer_type == 0 || customer_type == 1) && trade_status_buy[j] == 1 && !isNaN(buying_rate))) {
// 												onclickBuy = "show_values(this,0)";
// 												buyClass = "buyEnabled";
// 												removeBuyClass = "buyDisabled";
// 											}
// 											else {
// 												onclickBuy = "";
// 												buyClass = "buyDisabled";
// 												removeBuyClass = "buyEnabled";
// 											}
// 											if (trade_status_sell[j] == 1 && !isNaN(selling_rate))
// 												statussell = 1;
// 											else
// 												statussell = 0;

// 											if (trade_status_buy[j] == 1 && !isNaN(buying_rate))
// 												statusbuy = 1;
// 											else
// 												statusbuy = 0;

// 										} else {
// 											onclickBuy = "trade_disable()";
// 											buyClass = "buyDisabled";
// 											onclickSell = "trade_disable()";
// 											sellClass = "sellDisabled";
// 											removeSellClass = "sellEnabled";
// 											removeBuyClass = "buyEnabled";
// 										}

// 										$(el).attr('id', $(el).find(".com_id").html());
// 										$(el).find('td:nth-child(3)').attr('onClick', onclickSell);
// 										$(el).find('td:nth-child(3)').removeClass(removeSellClass).addClass(sellClass);
// 										$(el).find('td:nth-child(2)').attr('onClick', onclickBuy);
// 										$(el).find('td:nth-child(2)').removeClass(removeBuyClass).addClass(buyClass);
// 										$(el).find(".statusbuy").html(statusbuy);
// 										$(el).find(".statussell").html(statussell);
// 										return false;
// 									}
// 								});
// 							}
// 						}
// 					});

// 				}
// 			}
// 		}

// 		$("#liveratetable2 tbody").empty();
// 		for (var i = 0; i < messagesDesktopp.length; i++) {
// 			var retDesktop = messagesDesktopp[i].split("\t");
// 			var oldRetDesktop;
// 			if (messagesOldDesktop[i] != undefined)
// 				oldRetDesktop = messagesOldDesktop[i].split("\t");
// 			//console.log(oldRetDesktop);
// 			if (typeof retDesktop[1] != 'undefined' && (retDesktop[0] == 4 || retDesktop[0] == 1 || retDesktop[0] == 2)) {
// 				if (retDesktop[0] == 4) {
// 					if ((retDesktop[3] == 0 || retDesktop[4] == 1)) {
// 						market_status = 0;
// 						if (retDesktop[3] == 0) {
// 							document.getElementById("onoffmessage").style.display = "block";
// 							document.getElementById("messagebox").style.display = "none";
// 							document.getElementById("divrate").style.display = "none";
// 						} else if (retDesktop[4] == 1) {
// 							document.getElementById("onoffmessage").style.display = "none";
// 							document.getElementById("divrate").style.display = "none";
// 							document.getElementById("messagebox").style.display = "block";
// 							$("#messageboxtext").html(retDesktop[5]);
// 						}
// 					} else {
// 						market_status = 1;
// 						document.getElementById("onoffmessage").style.display = "none";
// 						document.getElementById("messagebox").style.display = "none";
// 						document.getElementById("divrate").style.display = "block";
// 					}
// 				}
// 				/* if(market_status == 1){
// 					if(retDesktop[0] == 3){

// 					}
// 				} */
// 				if (retDesktop[0] == 1) {
// 					if (retDesktop[1] == "SPOT-GOLD") {
// 						if (retDesktop[3] > $("#gold_bid").html()) {
// 							$("#gold_bid").css('color', '#FFFFFF');
// 							$("#gold_bid").css('background-color', '#008000');
// 						} else if (retDesktop[3] < $("#gold_bid").html()) {
// 							$("#gold_bid").css('color', '#FFFFFF');
// 							$("#gold_bid").css('background-color', '#FF0000');
// 						} else {
// 							$("#gold_bid").css('color', '');
// 							$("#gold_bid").css('background-color', '');
// 						}
// 						$("#gold_bid").html(parseFloat(retDesktop[3]).toFixed(2));
// 						if (retDesktop[4] > $("#gold_ask").html()) {
// 							$("#gold_ask").css('color', '#FFFFFF');
// 							$("#gold_ask").css('background-color', '#008000');
// 						} else if (retDesktop[4] < $("#gold_ask").html()) {
// 							$("#gold_ask").css('color', '#FFFFFF');
// 							$("#gold_ask").css('background-color', '#FF0000');
// 						} else {
// 							$("#gold_ask").css('color', '');
// 							$("#gold_ask").css('background-color', '');
// 						}
// 						$("#gold_ask").html(parseFloat(retDesktop[4]).toFixed(2));
// 						if (retDesktop[5] > $(".gold_high").html()) {
// 							$(".gold_high").css('color', '#FFFFFF');
// 							$(".gold_high").css('background-color', '#008000');
// 						} else if (retDesktop[5] < $(".gold_high").html()) {
// 							$(".gold_high").css('color', '#FFFFFF');
// 							$(".gold_high").css('background-color', '#FF0000');
// 						} else {
// 							$(".gold_high").css('color', '');
// 							$(".gold_high").css('background-color', '');
// 						}
// 						$(".gold_high").html(parseFloat(retDesktop[5]).toFixed(2));
// 						if (retDesktop[6] > $(".gold_low").html()) {
// 							$(".gold_low").css('color', '#FFFFFF');
// 							$(".gold_low").css('background-color', '#008000');
// 						} else if (retDesktop[6] < $(".gold_low").html()) {
// 							$(".gold_low").css('color', '#FFFFFF');
// 							$(".gold_low").css('background-color', '#FF0000');
// 						} else {
// 							$(".gold_low").css('color', '');
// 							$(".gold_low").css('background-color', '');
// 						}
// 						$(".gold_low").html(parseFloat(retDesktop[6]).toFixed(2));
// 					} else if (retDesktop[1] == "SPOT-SILVER") {
// 						if (retDesktop[3] > $("#silver_bid").html()) {
// 							$("#silver_bid").css('color', '#FFFFFF');
// 							$("#silver_bid").css('background-color', '#008000');
// 						} else if (retDesktop[3] < $("#silver_bid").html()) {
// 							$("#silver_bid").css('color', '#FFFFFF');
// 							$("#silver_bid").css('background-color', '#FF0000');
// 						} else {
// 							$("#silver_bid").css('color', '');
// 							$("#silver_bid").css('background-color', '');
// 						}
// 						$("#silver_bid").html(parseFloat(retDesktop[3]).toFixed(2));
// 						if (retDesktop[4] > $("#silver_ask").html()) {
// 							$("#silver_ask").css('color', '#FFFFFF');
// 							$("#silver_ask").css('background-color', '#008000');
// 						} else if (retDesktop[4] < $("#silver_ask").html()) {
// 							$("#silver_ask").css('color', '#FFFFFF');
// 							$("#silver_ask").css('background-color', '#FF0000');
// 						} else {
// 							$("#silver_ask").css('color', '');
// 							$("#silver_ask").css('background-color', '');
// 						}
// 						$("#silver_ask").html(parseFloat(retDesktop[4]).toFixed(2));
// 						if (retDesktop[5] > $(".silver_high").html()) {
// 							$(".silver_high").css('color', '#FFFFFF');
// 							$(".silver_high").css('background-color', '#008000');
// 						} else if (retDesktop[5] < $(".silver_high").html()) {
// 							$(".silver_high").css('color', '#FFFFFF');
// 							$(".silver_high").css('background-color', '#FF0000');
// 						} else {
// 							$(".silver_high").css('color', '');
// 							$(".silver_high").css('background-color', '');
// 						}
// 						$(".silver_high").html(parseFloat(retDesktop[5]).toFixed(2));
// 						if (retDesktop[6] > $(".silver_low").html()) {
// 							$(".silver_low").css('color', '#FFFFFF');
// 							$(".silver_low").css('background-color', '#008000');
// 						} else if (retDesktop[6] < $(".silver_low").html()) {
// 							$(".silver_low").css('color', '#FFFFFF');
// 							$(".silver_low").css('background-color', '#FF0000');
// 						} else {
// 							$(".silver_low").css('color', '');
// 							$(".silver_low").css('background-color', '');
// 						}
// 						$(".silver_low").html(parseFloat(retDesktop[6]).toFixed(2));
// 					} else if (retDesktop[1] == "SPOT-INR") {

// 						if (retDesktop[3] > $("#inr_bid").html()) {
// 							$("#inr_bid").css('color', '#FFFFFF');
// 							$("#inr_bid").css('background-color', '#008000');
// 						} else if (retDesktop[3] < $("#inr_bid").html()) {
// 							$("#inr_bid").css('color', '#FFFFFF');
// 							$("#inr_bid").css('background-color', '#FF0000');
// 						} else {
// 							$("#inr_bid").css('color', '');
// 							$("#inr_bid").css('background-color', '');
// 						}
// 						$("#inr_bid").html(parseFloat(retDesktop[3]).toFixed(2));
// 						if (retDesktop[4] > $("#inr_ask").html()) {
// 							$("#inr_ask").css('color', '#FFFFFF');
// 							$("#inr_ask").css('background-color', '#008000');
// 						} else if (retDesktop[4] < $("#inr_ask").html()) {
// 							$("#inr_ask").css('color', '#FFFFFF');
// 							$("#inr_ask").css('background-color', '#FF0000');
// 						} else {
// 							$("#inr_ask").css('color', '');
// 							$("#inr_ask").css('background-color', '');
// 						}
// 						$("#inr_ask").html(parseFloat(retDesktop[4]).toFixed(2));
// 						if (retDesktop[5] > $(".inr_high").html()) {
// 							$(".inr_high").css('color', '#FFFFFF');
// 							$(".inr_high").css('background-color', '#008000');
// 						} else if (retDesktop[5] < $(".inr_high").html()) {
// 							$(".inr_high").css('color', '#FFFFFF');
// 							$(".inr_high").css('background-color', '#FF0000');
// 						} else {
// 							$(".inr_high").css('color', '');
// 							$(".inr_high").css('background-color', '');
// 						}
// 						$(".inr_high").html(parseFloat(retDesktop[5]).toFixed(2));
// 						if (retDesktop[6] > $(".inr_low").html()) {
// 							$(".inr_low").css('color', '#FFFFFF');
// 							$(".inr_low").css('background-color', '#008000');
// 						} else if (retDesktop[6] < $(".inr_low").html()) {
// 							$(".inr_low").css('color', '#FFFFFF');
// 							$(".inr_low").css('background-color', '#FF0000');
// 						} else {
// 							$(".inr_low").css('color', '');
// 							$(".inr_low").css('background-color', '');
// 						}
// 						$(".inr_low").html(parseFloat(retDesktop[6]).toFixed(2));
// 					}
// 				}
// 				if (retDesktop[0] == 2) {
// 					var mcxbidid = "mcxbidnew-" + i;
// 					var mcxaskid = "mcxasknew-" + i;
// 					var mcxhighid = "mcxhighnew-" + i;
// 					var mcxlowid = "mcxlownew-" + i;
// 					// var tablerow ='<tr class="table2 mcx_rate"><td class="tabw4 gold" id="mcxdesc">'+retDesktop[2]+'</td><td class="tabw5 rate"><div class="txtlabel ratevalue2" id="'+mcxbidid+'">'+retDesktop[3]+'</div></td><td class="tabw5 rate"><div class="txtlabel ratevalue2" id="'+mcxaskid+'">'+retDesktop[4]+'</div></td><td class="tabw6 rate1 highlow"><div><span class="ratevalue2 redround high" id="'+mcxhighid+'">'+retDesktop[5]+'</span></div></td><td class="tabw6 rate1 highlow"><div ><span class="ratevalue2 redround low" id="'+mcxlowid+'">'+retDesktop[6]+'</span></div></td></tr>';
// 					var tablerow = '<tr class="table1"><td class="" id="mcxdesc">' + retDesktop[2] + '</td><td class="ratevalue2"><span class="highlow ratevalue_2" id="' + mcxbidid + '">' + retDesktop[3] + '</span><div class="visible-xs highlow"><span class="ratevalue_2 redround high" id="' + mcxhighid + '">' + retDesktop[5] + '</span></div></td><td class="ratevalue2"><span class="highlow ratevalue_2" id="' + mcxaskid + '">' + retDesktop[4] + '</span><div class="visible-xs highlow"><span class="ratevalue_2 redround high" id="' + mcxlowid + '">' + retDesktop[6] + '</span></div></td><td class="highlow hidden-xs"><span><span class="ratevalue_2 redround high" id="' + mcxhighid + '">' + retDesktop[5] + '</span></span></td><td class="highlow hidden-xs"><span ><span class="ratevalue_2 redround low" id="' + mcxlowid + '">' + retDesktop[6] + '</span></span></td></tr>';

// 					$("#liveratetable2 tbody").append(tablerow);

// 					if (oldRetDesktop[1] == retDesktop[1]) {
// 						if (parseInt(oldRetDesktop[3]) > parseInt(retDesktop[3])) {
// 							$("#" + mcxbidid).css('color', '#FFFFFF');
// 							$("#" + mcxbidid).css('background-color', '#FF0000');
// 						} else if (parseInt(oldRetDesktop[3]) < parseInt(retDesktop[3])) {
// 							$("#" + mcxbidid).css('color', '#FFFFFF');
// 							$("#" + mcxbidid).css('background-color', '#008000');
// 						} else {
// 							$("#" + mcxbidid).css('color', '');
// 							$("#" + mcxbidid).css('background-color', '');
// 						}
// 						if (parseInt(oldRetDesktop[4]) > parseInt(retDesktop[4])) {
// 							$("#" + mcxaskid).css('color', '#FFFFFF');
// 							$("#" + mcxaskid).css('background-color', '#FF0000');
// 						} else if (parseInt(oldRetDesktop[4]) < parseInt(retDesktop[4])) {
// 							$("#" + mcxaskid).css('color', '#FFFFFF');
// 							$("#" + mcxaskid).css('background-color', '#008000');
// 						} else {
// 							$("#" + mcxaskid).css('color', '');
// 							$("#" + mcxaskid).css('background-color', '');
// 						}
// 						if (parseInt(oldRetDesktop[5]) > parseInt(retDesktop[5])) {
// 							$("#" + mcxhighid).css('color', '#FFFFFF');
// 							$("#" + mcxhighid).css('background-color', '#FF0000');
// 						} else if (parseInt(oldRetDesktop[5]) < parseInt(retDesktop[5])) {
// 							$("#" + mcxhighid).css('color', '#FFFFFF');
// 							$("#" + mcxhighid).css('background-color', '#008000');
// 						} else {
// 							$("#" + mcxhighid).css('color', '');
// 							$("#" + mcxhighid).css('background-color', '');
// 						}
// 						if (parseInt(oldRetDesktop[6]) > parseInt(retDesktop[6])) {
// 							$("#" + mcxlowid).css('color', '#FFFFFF');
// 							$("#" + mcxlowid).css('background-color', '#FF0000');
// 						} else if (parseInt(oldRetDesktop[6]) < parseInt(retDesktop[6])) {
// 							$("#" + mcxlowid).css('color', '#FFFFFF');
// 							$("#" + mcxlowid).css('background-color', '#008000');
// 						} else {
// 							$("#" + mcxlowid).css('color', '');
// 							$("#" + mcxlowid).css('background-color', '');
// 						}
// 					}
// 				}
// 			}
// 		}

// 		oldData = data.toString();

// 	} catch (e) {
// 	}
// }

var lastMCXBid = {};
var lastMCXAsk = {};

function OnSuccess(data, status) {
	try {
		var $ = jQuery.noConflict();
		var lines = data.split("\n");

		// NOTE: do NOT empty liveratetable2 here — MCX rows use stable IDs and update in-place

		for (var i = 0; i < lines.length; i++) {
			// Handle "R" reset signal — server sends this when rows are added/removed
			if (lines[i].trim() === "R") {
				lastKnownState = {};
				$("#liveratetable2 tbody").empty();
				lastMCXBid = {};
				lastMCXAsk = {};
				continue;
			}

			var r = lines[i].split("|");
			if (r[1] === undefined) continue;

			lastKnownState[r[0] + '|' + r[1]] = lines[i];

			// ---- TYPE 3: commodity buy/sell — 3|id|buy|sell ----
			if (r[0] == 3) {
				var com_id_r = r[1];
				var buy_r = r[2] || '';
				var sell_r = r[3] || '';

				$("#liveratetable").find('tbody > tr').each(function () {
					var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
						com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
						com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
						com_roundoff = parseFloat($(this).find('td:last div:eq(26)').html()),
						prem_sel_premium = parseFloat($(this).find('td:last div:eq(44)').html()),
						prem_buy_premium = parseFloat($(this).find('td:last div:eq(45)').html()),
						prem_comsell_active = parseFloat($(this).find('td:last div:eq(46)').html()),
						prem_combuy_active = parseFloat($(this).find('td:last div:eq(47)').html());

					if (com_id_r == com_id) {
						var selling_rate = (sell_r !== '' && com_sel_active && prem_comsell_active) ?
							(parseFloat(sell_r) - parseFloat(prem_sel_premium)).toFixed(com_roundoff) : '-';
						var buying_rate = (buy_r !== '' && com_buy_active && prem_combuy_active) ?
							(parseFloat(buy_r) - parseFloat(prem_buy_premium)).toFixed(com_roundoff) : '-';

						var $buyCell = $(this).find('td:eq(1)');
						var $buyDiv = $buyCell.find('.val-text');
						if ($buyDiv.length === 0) { $buyCell.html('<div class="val-text"></div>'); $buyDiv = $buyCell.find('.val-text'); }
						var prevBuy = parseFloat($buyDiv.text());
						var buyF = parseFloat(buying_rate);
						if (!isNaN(buyF) && buyF > prevBuy) { flashCell($buyDiv, '#008000'); }
						else if (!isNaN(buyF) && buyF < prevBuy) { flashCell($buyDiv, '#FF0000'); }
						$buyDiv.text(buying_rate);

						var $sellCell = $(this).find('td:eq(2)');
						var $sellDiv = $sellCell.find('.val-text');
						if ($sellDiv.length === 0) { $sellCell.html('<div class="val-text"></div>'); $sellDiv = $sellCell.find('.val-text'); }
						var prevSell = parseFloat($sellDiv.text());
						var sellF = parseFloat(selling_rate);
						if (!isNaN(sellF) && sellF > prevSell) { flashCell($sellDiv, '#008000'); }
						else if (!isNaN(sellF) && sellF < prevSell) { flashCell($sellDiv, '#FF0000'); }
						$sellDiv.text(selling_rate);
					}
				});

				// After updating rates, refresh trade status (onclick handlers and buttons)
				if (typeof update_row_trade_status === 'function' && trade_status_id && trade_status_id.length > 0) {
					update_row_trade_status();
				}

				// Coin table
				$("#liveratetable_coin").find('tbody > tr').each(function () {
					var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
						com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
						com_buy_active = parseInt($(this).find('td:last div:eq(9)').html());
					if (com_id_r == com_id) {
						var selling_rate = sell_r !== '' ? sell_r : '-';
						var buying_rate = buy_r !== '' ? buy_r : '-';
						if (com_sel_active == 0) selling_rate = '-';
						if (com_buy_active == 0) buying_rate = '-';

						var $buyCell = $(this).find('td:eq(1)');
						var $buyDiv = $buyCell.find('.val-text');
						if ($buyDiv.length === 0) { $buyCell.html('<div class="val-text"></div>'); $buyDiv = $buyCell.find('.val-text'); }
						var prevBuy = parseFloat($buyDiv.text());
						var buyF2 = parseFloat(buying_rate);
						if (!isNaN(buyF2) && buyF2 > prevBuy) { flashCell($buyDiv, '#008000'); }
						else if (!isNaN(buyF2) && buyF2 < prevBuy) { flashCell($buyDiv, '#FF0000'); }
						$buyDiv.text(buying_rate);

						var $sellCell = $(this).find('td:eq(2)');
						var $sellDiv = $sellCell.find('.val-text');
						if ($sellDiv.length === 0) { $sellCell.html('<div class="val-text"></div>'); $sellDiv = $sellCell.find('.val-text'); }
						var prevSell = parseFloat($sellDiv.text());
						var sellF2 = parseFloat(selling_rate);
						if (!isNaN(sellF2) && sellF2 > prevSell) { flashCell($sellDiv, '#008000'); }
						else if (!isNaN(sellF2) && sellF2 < prevSell) { flashCell($sellDiv, '#FF0000'); }
						$sellDiv.text(selling_rate);
					}
				});
			}

			// ---- TYPE 2: MCX rates — 2|name|bid|ask[|high|low] ----
			if (r[0] == 2) {
				var symName = r[1];
				var mcxbidid = "mcxbid-" + symName;
				var mcxaskid = "mcxask-" + symName;
				var mcxhighid = "mcxhigh-" + symName;
				var mcxlowid = "mcxlow-" + symName;

				// r[2]=bid, r[3]=ask, r[4]=high, r[5]=low
				var bid_val = r[2] || '';
				var ask_val = r[3] || '';
				var high_val = r[4] || undefined;
				var low_val = r[5] || undefined;

				var mobile_mcxhighid = "mobile-mcxhigh-" + symName;
				var mobile_mcxlowid = "mobile-mcxlow-" + symName;

				if ($("#" + mcxbidid).length === 0) {
					// First time — create the row
					var hi_init = high_val !== undefined ? high_val : '-';
					var lo_init = low_val !== undefined ? low_val : '-';
					var tablerow = '<tr class="table1" data-sym="' + symName + '">' +
						'<td id="mcxdesc-' + symName + '" class="name-cell">' + symName + '</td>' +
						'<td class="ratevalue3"><div class="val-text" id="' + mcxbidid + '">' + bid_val + '</div> <span class="visible-xs mobile-highlow" id="' + mobile_mcxhighid + '">H: ' + hi_init + '</span></td>' +
						'<td class="ratevalue3"><div class="val-text" id="' + mcxaskid + '">' + ask_val + '</div> <span class="visible-xs mobile-highlow" id="' + mobile_mcxlowid + '">L: ' + lo_init + '</span></td>' +
						'<td class="ratevalue4 hidden-xs"><div class="" id="' + mcxhighid + '">' + hi_init + '</div></td>' +
						'<td class="ratevalue4 hidden-xs"><div class="" id="' + mcxlowid + '">' + lo_init + '</div></td>' +
						'</tr>';
					$("#liveratetable2 tbody").append(tablerow);
					lastMCXBid[symName] = parseInt(bid_val);
					lastMCXAsk[symName] = parseInt(ask_val);
				} else {
					// Update existing row
					$("#mcxdesc-" + symName).html(symName);

					var $bidSpan = $("#" + mcxbidid);
					var prevBid = lastMCXBid[symName] !== undefined ? lastMCXBid[symName] : parseInt($bidSpan.html());
					var newBid = parseInt(bid_val);
					if (!isNaN(newBid) && newBid > prevBid) { flashCell($bidSpan, '#008000'); }
					else if (!isNaN(newBid) && newBid < prevBid) { flashCell($bidSpan, '#FF0000'); }
					$bidSpan.html(bid_val);
					lastMCXBid[symName] = newBid;

					var $askSpan = $("#" + mcxaskid);
					var prevAsk = lastMCXAsk[symName] !== undefined ? lastMCXAsk[symName] : parseInt($askSpan.html());
					var newAsk = parseInt(ask_val);
					if (!isNaN(newAsk) && newAsk > prevAsk) { flashCell($askSpan, '#008000'); }
					else if (!isNaN(newAsk) && newAsk < prevAsk) { flashCell($askSpan, '#FF0000'); }
					$askSpan.html(ask_val);
					lastMCXAsk[symName] = newAsk;

					// high/low only when server sends them (r[4], r[5])
					if (high_val !== undefined) {
						$("#" + mcxhighid).html(high_val);
						$("#mobile-mcxhigh-" + symName).html("H: " + high_val);
					}
					if (low_val !== undefined) {
						$("#" + mcxlowid).html(low_val);
						$("#mobile-mcxlow-" + symName).html("L: " + low_val);
					}
				}
			}

			// ---- TYPE 1: Spot rates — 1|id|bid|ask[|high|low] ----
			// id is short code: G=SPOT-GOLD, S=SPOT-SILVER, R=SPOT-INR
			if (r[0] == 1) {
				var sym1 = r[1];
				var bid1 = parseFloat(r[2]).toFixed(2);
				var ask1 = parseFloat(r[3]).toFixed(2);
				var hi1 = r[4] !== undefined ? parseFloat(r[4]).toFixed(2) : null;
				var lo1 = r[5] !== undefined ? parseFloat(r[5]).toFixed(2) : null;

				if (sym1 == 'G') {
					var $goldBid = $("#gold_bid");
					var prevBid = parseFloat($goldBid.html());
					if (bid1 > prevBid) { flashCell($goldBid, '#008000'); }
					else if (bid1 < prevBid) { flashCell($goldBid, '#FF0000'); }
					$goldBid.html(bid1);

					var $goldAsk = $("#gold_ask");
					var prevAsk = parseFloat($goldAsk.html());
					if (ask1 > prevAsk) { flashCell($goldAsk, '#008000'); }
					else if (ask1 < prevAsk) { flashCell($goldAsk, '#FF0000'); }
					$goldAsk.html(ask1);

					if (hi1 !== null) { $(".gold_high").html(hi1); $(".gold_high_mobile").html('H: ' + hi1); }
					if (lo1 !== null) { $(".gold_low").html(lo1); $(".gold_low_mobile").html('L: ' + lo1); }

				} else if (sym1 == 'S') {
					var $silvBid = $("#silver_bid");
					var prevBidS = parseFloat($silvBid.html());
					if (bid1 > prevBidS) { flashCell($silvBid, '#008000'); }
					else if (bid1 < prevBidS) { flashCell($silvBid, '#FF0000'); }
					$silvBid.html(bid1);

					var $silvAsk = $("#silver_ask");
					var prevAskS = parseFloat($silvAsk.html());
					if (ask1 > prevAskS) { flashCell($silvAsk, '#008000'); }
					else if (ask1 < prevAskS) { flashCell($silvAsk, '#FF0000'); }
					$silvAsk.html(ask1);

					if (hi1 !== null) { $(".silver_high").html(hi1); $(".silver_high_mobile").html('H: ' + hi1); }
					if (lo1 !== null) { $(".silver_low").html(lo1); $(".silver_low_mobile").html('L: ' + lo1); }

				} else if (sym1 == 'I') {
					var $inrBid = $("#inr_bid");
					var prevBidR = parseFloat($inrBid.html());
					if (bid1 > prevBidR) { flashCell($inrBid, '#008000'); }
					else if (bid1 < prevBidR) { flashCell($inrBid, '#FF0000'); }
					$inrBid.html(bid1);

					var $inrAsk = $("#inr_ask");
					var prevAskR = parseFloat($inrAsk.html());
					if (ask1 > prevAskR) { flashCell($inrAsk, '#008000'); }
					else if (ask1 < prevAskR) { flashCell($inrAsk, '#FF0000'); }
					$inrAsk.html(ask1);

					if (hi1 !== null) { $(".inr_high").html(hi1); $(".inr_high_mobile").html('H: ' + hi1); }
					if (lo1 !== null) { $(".inr_low").html(lo1); $(".inr_low_mobile").html('L: ' + lo1); }
				}
			}

			// ---- TYPE 4: market status — 4|id|rate_display|market_closed|message ----
			// r[0]=4, r[1]=id, r[2]=rate_display, r[3]=market_closed, r[4]=message
			if (r[0] == 4) {
				if (r[2] == 0 || r[3] == 1) {
					if (r[2] == 0) {
						document.getElementById("onoffmessage").style.display = "block";
						document.getElementById("messagebox").style.display = "none";
						document.getElementById("divrate").style.display = "none";
					} else if (r[3] == 1) {
						document.getElementById("onoffmessage").style.display = "none";
						document.getElementById("divrate").style.display = "none";
						document.getElementById("messagebox").style.display = "block";
						$("#messageboxtext").html(r[4] || '');
					}
				} else {
					document.getElementById("onoffmessage").style.display = "none";
					document.getElementById("messagebox").style.display = "none";
					document.getElementById("divrate").style.display = "block";
				}
			}
		}
	} catch (e) {
		console.log(e);
	}
}
$(document).ready(function () {

	if (bcrateType == 2) {
		// Each call wrapped independently so one failure doesn't block the rest
		try { rpanel_update(); } catch (e) {
			console.error("rpanel_update failed:", e);
			// Fallback: force-show divrate if rpanel_update crashes
			var dr = document.getElementById("divrate");
			if (dr) dr.style.display = "block";
			var om = document.getElementById("onoffmessage");
			if (om) om.style.display = "none";
			var mb = document.getElementById("messagebox");
			if (mb) mb.style.display = "none";
		}
		try { commodity_update(); } catch (e) { console.error("commodity_update failed:", e); }
		try { connectRateSocket(); } catch (e) { console.error("connectRateSocket failed:", e); }
		// rate_socket.on("rateUpdate", (rate) => { OnSuccess(rate.rate); });
	} else {
		fnStartClock();
	}
});
/* (function () {
	var callback = function() {
		var $ = jQuery.noConflict();
				if($('#gold_bid').html() == null || isNaN($('#gold_bid').html())) {
					return 0;
				}
				var market_closed = $(".market_closed").html();
				var rate_display = parseInt($(".rate_display").html());

				if(market_closed != 1 && rate_display !=0){
					$("#liveratetable").find('tbody > tr').each(function (i, el) {
						var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
						 com_type = parseInt($(this).find('td:last div:eq(1)').html()),
						 com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
						 com_other_charges = parseFloat($(this).find('td:last div:eq(3)').html()),
						 com_correction_type = parseFloat($(this).find('td:last div:eq(4)').html()),
						 com_sel_premium = parseFloat($(this).find('td:last div:eq(5)').html()),
						 com_buy_premium = parseFloat($(this).find('td:last div:eq(6)').html()),
						 com_premium_type = parseInt($(this).find('td:last div:eq(7)').html()),
						 com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
						 com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
						 com_delverydays = parseInt($(this).find('td:last div:eq(10)').html()),
						 com_isregion = parseInt($(this).find('td:last div:eq(11)').html()),
						 com_calpurity = parseFloat($(this).find('td:last div:eq(12)').html()),
						 com_tax = parseFloat($(this).find('td:last div:eq(13)').html()),
						 com_octroi = parseFloat($(this).find('td:last div:eq(14)').html()),
						 com_stamduty = parseFloat($(this).find('td:last div:eq(15)').html()),
						 deliverydays = parseFloat($(this).find('td:last div:eq(16)').html()),
						 displyname = parseFloat($(this).find('td:last div:eq(17)').html()),
						 mcxsymbol = parseFloat($(this).find('td:last div:eq(18)').html()),
						 banksymbol = parseFloat($(this).find('td:last div:eq(19)').html()),
						 rcomid = parseFloat($(this).find('td:last div:eq(20)').html()),
						 trade_type = parseFloat($(this).find('td:last div:eq(21)').html()),
						 sell_diff = parseFloat($(this).find('td:last div:eq(22)').html()),
						 buy_diff = parseFloat($(this).find('td:last div:eq(23)').html()),
						 sell_rate = parseFloat($(this).find('td:last div:eq(24)').html()),
						 com_display_purity = parseFloat($(this).find('td:last div:eq(25)').html()),
						 com_is_coin = parseFloat($(this).find('td:last div:eq(26)').html()),
						 com_roundoff = parseFloat($(this).find('td:last div:eq(27)').html()),
						 is_gst = parseFloat($(this).find('td:last div:eq(39)').html()),
						 is_tcs = parseFloat($(this).find('td:last div:eq(40)').html()),
						 rcom_sell_tax = parseFloat($(this).find('td:last div:eq(41)').html()),
						 rcom_buy_tax = parseFloat($(this).find('td:last div:eq(42)').html()),
						 rcom_sell_tcs = parseFloat($(this).find('td:last div:eq(43)').html()),
						 rcom_buy_tcs = parseFloat($(this).find('td:last div:eq(44)').html());

						 var selling_rate = 0;
						 var buying_rate  = 0;
						if(com_premium_type == 1){
							selling_rate = parseFloat(com_sel_premium).toFixed(2);
							buying_rate  = parseFloat(com_buy_premium).toFixed(2);
						}else{
						 // Commodity Rate Calculation Start Here
							$.each(rpanelcommodities, function(rckey, rcval) {
								if(rcomid == rcval.comid){
									if(rcval.tradetype == 0){
										//var baseask = (parseFloat($("#"+rcval.mcxcontract+"_ask").html()) + parseFloat(rcval.selldiff)).toFixed(2);
										if(rcval.rcom_sell_callpurity == 1){
											if(rcval.rcom_sell_diff_type == 0){
												var baseask = parseFloat((parseFloat($("#"+rcval.mcxcontract+"_ask").html()) + parseFloat(rcval.selldiff)) / 0.995).toFixed(2);
											}
											else{
												var baseask = parseFloat((parseFloat($("#"+rcval.mcxcontract+"_ask").html()) - parseFloat(rcval.selldiff)) / 0.995).toFixed(2);
											}
										}
										else{
											if(rcval.rcom_sell_diff_type == 0){
												var baseask = parseFloat(parseFloat($("#"+rcval.mcxcontract+"_ask").html()) + parseFloat(rcval.selldiff)).toFixed(2);
											}
											else{
												var baseask = parseFloat(parseFloat($("#"+rcval.mcxcontract+"_ask").html()) - parseFloat(rcval.selldiff)).toFixed(2);
											}
										}
										if(is_gst == 1){
											baseask = (parseFloat(baseask) * parseFloat(parseFloat(100 + parseFloat(rcom_sell_tax)) / 100));
										}
										if(is_tcs == 1){
											baseask = (parseFloat(baseask) * parseFloat(parseFloat(100 + parseFloat(rcom_sell_tcs)) / 100));
										}
										if(com_isregion == 1) {
											if(com_calpurity == 0) { //if purity = 995
												baseask = baseask / 0.995;
											} else { //if purity = 999 OR 9999
												baseask = baseask / 1;
											}
											//rate1 = rate + (rate * tax/100) Tax calculation
											baseask +=(baseask *  (com_tax / 100));
											//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
											baseask +=(baseask *  (com_octroi / 100));
											//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
											baseask +=(baseask *  (com_stamduty / 100));
										}
										else {
											if(com_display_purity == 0  || isNaN(com_display_purity)) {
												var purity = 100;
											} else {
												var purity = com_display_purity;
											}
											baseask = baseask * (purity / 100);
										}
										var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight) : silver_conversion(baseask, com_weight);
										selling_rate = manual_roundoff(selling_con, com_correction_type, 'ask');
										//buying_rate = (parseFloat($("#"+rcval.mcxcontract+"_bid").html()) - rcval.buydiff).toFixed(2);
										if(rcval.rcom_buy_callpurity == 1){
											if(rcval.rcom_buy_diff_type == 0){
												buying_rate = parseFloat((parseFloat($("#"+rcval.mcxcontract+"_bid").html()) + parseFloat(rcval.buydiff)) / 0.995).toFixed(2);
											}
											else{
												buying_rate = parseFloat((parseFloat($("#"+rcval.mcxcontract+"_bid").html()) - parseFloat(rcval.buydiff)) / 0.995).toFixed(2);
											}
										}
										else{
											if(rcval.rcom_buy_diff_type == 0){
												buying_rate = parseFloat(parseFloat($("#"+rcval.mcxcontract+"_bid").html()) + parseFloat(rcval.buydiff)).toFixed(2);
											}
											else{
												buying_rate = parseFloat(parseFloat($("#"+rcval.mcxcontract+"_bid").html()) - parseFloat(rcval.buydiff)).toFixed(2);
											}
										}
										if(is_gst == 1){
											buying_rate = (parseFloat(buying_rate) * parseFloat(parseFloat(100 + parseFloat(rcom_buy_tax)) / 100));
										}
										if(is_tcs == 1){
											buying_rate = (parseFloat(buying_rate) * parseFloat(parseFloat(100 + parseFloat(rcom_buy_tcs)) / 100));
										}
										if(com_isregion == 1) {
											if(com_calpurity == 0) { //if purity = 995
												buying_rate = buying_rate / 0.995;
											} else { //if purity = 999 OR 9999
												buying_rate = buying_rate / 1;
											}
											//rate1 = rate + (rate * tax/100) Tax calculation
											buying_rate +=(buying_rate *  (com_tax / 100));
											//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
											buying_rate +=(buying_rate *  (com_octroi / 100));
											//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
											buying_rate +=(buying_rate *  (com_stamduty / 100));
										}
										else {
											if(com_display_purity == 0  || isNaN(com_display_purity)) {
												var purity = 100;
											} else {
												var purity = com_display_purity;
											}
											buying_rate = buying_rate * (purity / 100);
										}
										buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
										buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
									}else if(rcval.tradetype == 1){
										//For Gold Bank Rate Calculation Start Here
										var bank_kgrate = 0;
										$.each(rpanelbankrates, function(rbkey, rbval) {
											if(rcval.bcontract_id == rbval.bcontract_id){
												bank_kgrate = parseFloat((isNaN(parseFloat($("#"+rbval.bcontract_rate+"_ask").html())) ? 0 : parseFloat($("#"+rbval.bcontract_rate+"_ask").html()) + parseFloat(rbval.premium) + parseFloat(rbval.askdiff)) * ((isNaN($("#SPOT-INR_ask").html())) ? 0 : parseFloat($("#SPOT-INR_ask").html()) + parseFloat(rbval.rupeepremium))).toFixed(2);
												if(parseInt(rbval.bconvert_value_type) == 1)
													bank_kgrate =  parseFloat(bank_kgrate + parseFloat(rbval.bconvert_value)).toFixed(2);
												else if(parseInt(rbval.bconvert_value_type) == 2)
													bank_kgrate =  parseFloat(bank_kgrate - parseFloat(rbval.bconvert_value)).toFixed(2);
												else if(parseInt(rbval.bconvert_value_type) == 3)
													bank_kgrate =  parseFloat(bank_kgrate * parseFloat(rbval.bconvert_value)).toFixed(2);
												else if(parseInt(rbval.bconvert_value_type) == 4)
													bank_kgrate =  parseFloat(bank_kgrate / parseFloat(rbval.bconvert_value)).toFixed(2);
												if(parseFloat(rbval.bextra_charges) > 0){
													if(parseInt(rbval.bextra_type) == 1){
														bank_kgrate = parseFloat(bank_kgrate + parseFloat(rbval.bextra_charges)).toFixed(2);
													}else if(parseInt(rbval.bextra_type) == 2){
														bank_kgrate = parseFloat(bank_kgrate - parseFloat(rbval.bextra_charges)).toFixed(2);
													}else if(parseInt(rbval.bextra_type) == 3){
														bank_kgrate = parseFloat(bank_kgrate * parseFloat(rbval.bextra_charges)).toFixed(2);
													}if(parseInt(rbval.bextra_type) == 4){
														bank_kgrate = parseFloat(bank_kgrate / parseFloat(rbval.bextra_charges)).toFixed(2);
													}
												}

												bank_kgrate = parseFloat(bank_kgrate) + parseFloat(rbval.custom);
												if(parseFloat(rbval.btax_value) > 0){
													if(parseInt(rbval.btax_type) == 1){
														bank_kgrate = parseFloat((bank_kgrate * ((100 + parseFloat(rbval.btax_value)) / 100))).toFixed(2);
													}else if(parseInt(rbval.btax_type) == 2){
														bank_kgrate = parseFloat((bank_kgrate + parseFloat(rbval.btax_value))).toFixed(2);
													}
												}
												if(parseFloat(rbval.tcs_tax) > 0){
													bank_kgrate = parseFloat((bank_kgrate * ((100 + parseFloat(rbval.tcs_tax)) / 100))).toFixed(2);
												}
												if(parseInt(rbval.pure) == 1){
													bank_kgrate = parseFloat(bank_kgrate / 0.995).toFixed(2);
												}
												var bankrate = parseInt(rcval.comtype) == 0 ? gold_spotrateconversion(bank_kgrate, 10) : bank_kgrate;
												var baseask = (parseFloat(bankrate) + parseFloat(rcval.selldiff)).toFixed(2);
												if(com_isregion == 1) {
													if(com_calpurity == 0) { //if purity = 995
														baseask = baseask / 0.995;
													} else { //if purity = 999 OR 9999
														baseask = baseask / 1;
													}
													//rate1 = rate + (rate * tax/100) Tax calculation
													baseask +=(baseask *  (com_tax / 100));
													//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
													baseask +=(baseask *  (com_octroi / 100));
													//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
													baseask +=(baseask *  (com_stamduty / 100));
												}
												else {
													if(com_display_purity == 0  || isNaN(com_display_purity)) {
														var purity = 100;
													} else {
														var purity = com_display_purity;
													}
													baseask = baseask * (purity / 100);
												}
												var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight): silver_conversion(baseask, com_weight);
												selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

												buying_rate = (parseFloat(bankrate) - rcval.buydiff).toFixed(2);
												if(com_isregion == 1) {
													if(com_calpurity == 0) { //if purity = 995
														buying_rate = buying_rate / 0.995;
													} else { //if purity = 999 OR 9999
														buying_rate = buying_rate / 1;
													}
													//rate1 = rate + (rate * tax/100) Tax calculation
													buying_rate +=(buying_rate *  (com_tax / 100));
													//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
													buying_rate +=(buying_rate *  (com_octroi / 100));
													//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
													buying_rate +=(buying_rate *  (com_stamduty / 100));
												}
												else {
													if(com_display_purity == 0  || isNaN(com_display_purity)) {
														var purity = 100;
													} else {
														var purity = com_display_purity;
													}
													buying_rate = buying_rate * (purity / 100);
												}
												buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
												buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
											}
										});
									 //For Gold Bank Rate Calculation End Here
									}else if(rcval.tradetype == 2){
										var sellrate = rcval.sellrate;
										//Calculating Purity, Tax, Octroi and stamp duty if commodity type is region
										if(com_isregion == 1) {
											//rate = Base rate / purity
											if(com_calpurity == 0) { //if purity = 995
												sellrate = sellrate / 0.995;
											} else { //if purity = 999 OR 9999
												sellrate = sellrate / 1;
											}
											//rate1 = rate + (rate * tax/100) Tax calculation
											sellrate +=(sellrate *  (com_tax / 100));
											//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
											sellrate +=(sellrate *  (com_octroi / 100));
											//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
											sellrate +=(sellrate *  (com_stamduty / 100));
										}
										var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(sellrate, com_weight) : silver_conversion(sellrate, com_weight);
										selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

										var buying_con = parseInt(rcval.comtype) == 0 ? gold_conversion(rcval.buydiff, com_weight) : silver_conversion(rcval.buydiff, com_weight);
										buying_rate = manual_roundoff(selling_con, com_correction_type,'bid');
										buying_rate = parseInt(buying_rate - buying_con);
										buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
											}
										}
								});
						 //Commodity Rate Calculation End Here
						}
						if(com_sel_active ==1) {
							//set selling price selling price = rate + premium + other charges
							if(com_premium_type == 1){
								selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
								selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
							}
							else{
							selling_rate = parseFloat(selling_rate) + parseFloat(com_sel_premium) + parseFloat(com_other_charges);
							selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
							selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
							}
						}else selling_rate = '-';
							//Display buying rate
						if(com_buy_active ==1) {
							//set buying price buying price = rate + premium
							if(com_premium_type == 1){
								buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
								buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
							}
							else{
							buying_rate = parseFloat(buying_rate) + parseFloat(com_buy_premium);
							buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
							buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
							}
						}
						else buying_rate ='-';
						if(buying_rate > parseFloat($(this).find('td:eq(1)').html())){
							$(this).find('td:eq(1)').css('color', '#FFFFFF');
							$(this).find('td:eq(1)').css('background-color', '#008000');
						}else if(buying_rate < parseFloat($(this).find('td:eq(1)').html())){
							$(this).find('td:eq(1)').css('color', '#FFFFFF');
							$(this).find('td:eq(1)').css('background-color', '#FF0000');
						}else{
							$(this).find('td:eq(1)').css('color', '');
							$(this).find('td:eq(1)').css('background-color', '');
						}
						$(this).find('td:eq(1)').html(buying_rate);

						if(selling_rate > parseFloat($(this).find('td:eq(2)').html())){
							$(this).find('td:eq(2)').css('color', '#FFFFFF');
							$(this).find('td:eq(2)').css('background-color', '#008000');
						}else if(selling_rate < parseFloat($(this).find('td:eq(2)').html())){
							$(this).find('td:eq(2)').css('color', '#FFFFFF');
							$(this).find('td:eq(2)').css('background-color', '#FF0000');
						}else{
							$(this).find('td:eq(2)').css('color', '');
							$(this).find('td:eq(2)').css('background', '');
						}
						$(this).find('td:eq(2)').html(selling_rate);

						if(typeof trade_status_id !== 'undefined')
						{
							$(trade_status_id).each(function (j,value)
							{
								var styleSell="";
								var onclickSell="";
								var styleBuy="";
								var onclickBuy="";
								var statusbuy 	= 0;
								var statussell = 0;
								var buyClass = "";
								var sellClass = "";
								var removeSellClass = "";
								var removeBuyClass = "";

								if(parseInt($(el).find(".com_id").html()) == parseInt(trade_status_id[j]))
								{
									if(enable_trade == 1)
									{
										if((trade_status_sell[j] == 1 && !isNaN(selling_rate)))
										{
											onclickSell = "show_values(this,1)";
											sellClass = "sellEnabled";
											removeSellClass = "sellDisabled";
										}
										else
										{
											onclickSell = "";
											sellClass = "sellDisabled";
											removeSellClass = "sellEnabled";
										}
										if((trade_status_buy[j] == 1 && !isNaN(buying_rate)))
										{
											onclickBuy = "show_values(this,0)";
											buyClass = "buyEnabled";
											removeBuyClass = "buyDisabled";
										}
										else
										{
											onclickBuy = "";
											buyClass = "buyDisabled";
											removeBuyClass = "buyEnabled";
										}
										if(trade_status_sell[j] == 1 && !isNaN(selling_rate))
											statussell = 1;
										else
											statussell = 0;

										if(trade_status_buy[j] == 1 && !isNaN(buying_rate))
											statusbuy = 1;
										else
											 statusbuy = 0;

									} else {
										onclickBuy  = "trade_disable()";
										buyClass    = "buyDisabled";
										onclickSell = "trade_disable()";
										sellClass = "sellDisabled";
										removeSellClass = "sellEnabled";
										removeBuyClass = "buyEnabled";
									}

									$(el).attr('id',$(el).find(".com_id").html());
									$(el).find('td:nth-child(3)').attr('onClick',onclickSell);
									$(el).find('td:nth-child(3)').removeClass(removeSellClass).addClass(sellClass);
									$(el).find('td:nth-child(2)').attr('onClick',onclickBuy);
									$(el).find('td:nth-child(2)').removeClass(removeBuyClass).addClass(buyClass);
									$(el).find(".statusbuy").html(statusbuy);
									$(el).find(".statussell").html(statussell);
									return false;
								}
							});
						}
					});
					$("#liveratetable_coin").find('tbody > tr').each(function (i, el) {
						var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
						 com_type = parseInt($(this).find('td:last div:eq(1)').html()),
						 com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
						 com_other_charges = parseFloat($(this).find('td:last div:eq(3)').html()),
						 com_correction_type = parseFloat($(this).find('td:last div:eq(4)').html()),
						 com_sel_premium = parseFloat($(this).find('td:last div:eq(5)').html()),
						 com_buy_premium = parseFloat($(this).find('td:last div:eq(6)').html()),
						 com_premium_type = parseInt($(this).find('td:last div:eq(7)').html()),
						 com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
						 com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
						 com_delverydays = parseInt($(this).find('td:last div:eq(10)').html()),
						 com_isregion = parseInt($(this).find('td:last div:eq(11)').html()),
						 com_calpurity = parseFloat($(this).find('td:last div:eq(12)').html()),
						 com_tax = parseFloat($(this).find('td:last div:eq(13)').html()),
						 com_octroi = parseFloat($(this).find('td:last div:eq(14)').html()),
						 com_stamduty = parseFloat($(this).find('td:last div:eq(15)').html()),
						 deliverydays = parseFloat($(this).find('td:last div:eq(16)').html()),
						 displyname = parseFloat($(this).find('td:last div:eq(17)').html()),
						 mcxsymbol = parseFloat($(this).find('td:last div:eq(18)').html()),
						 banksymbol = parseFloat($(this).find('td:last div:eq(19)').html()),
						 rcomid = parseFloat($(this).find('td:last div:eq(20)').html()),
						 trade_type = parseFloat($(this).find('td:last div:eq(21)').html()),
						 sell_diff = parseFloat($(this).find('td:last div:eq(22)').html()),
						 buy_diff = parseFloat($(this).find('td:last div:eq(23)').html()),
						 sell_rate = parseFloat($(this).find('td:last div:eq(24)').html()),
						 com_display_purity = parseFloat($(this).find('td:last div:eq(25)').html()),
						 com_is_coin = parseFloat($(this).find('td:last div:eq(26)').html()),
						 com_roundoff = parseFloat($(this).find('td:last div:eq(27)').html());

						 var selling_rate = 0;
						 var buying_rate  = 0;
						if(com_is_coin == 1){
							if(com_premium_type == 1){
								selling_rate = parseFloat(com_sel_premium).toFixed(2);
								buying_rate  = parseFloat(com_buy_premium).toFixed(2);
							}else{
							 // Commodity Rate Calculation Start Here
								$.each(rpanelcommodities, function(rckey, rcval) {
									if(rcomid == rcval.comid){
										if(rcval.tradetype == 0){
											var baseask = (parseFloat($("#"+rcval.mcxcontract+"_ask").html()) + parseFloat(rcval.selldiff)).toFixed(2);
											if(com_isregion == 1) {
												if(com_calpurity == 0) { //if purity = 995
													baseask = baseask / 0.995;
												} else { //if purity = 999 OR 9999
													baseask = baseask / 1;
												}
												//rate1 = rate + (rate * tax/100) Tax calculation
												baseask +=(baseask *  (com_tax / 100));
												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
												baseask +=(baseask *  (com_octroi / 100));
												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
												baseask +=(baseask *  (com_stamduty / 100));
											}
											else {
												if(com_display_purity == 0  || isNaN(com_display_purity)) {
													var purity = 100;
												} else {
													var purity = com_display_purity;
												}
												baseask = baseask * (purity / 100);
											}
											var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight) : silver_conversion(baseask, com_weight);
											selling_rate = manual_roundoff(selling_con, com_correction_type, 'ask');
											buying_rate = (parseFloat($("#"+rcval.mcxcontract+"_bid").html()) - rcval.buydiff).toFixed(2);
											if(com_isregion == 1) {
												if(com_calpurity == 0) { //if purity = 995
													buying_rate = buying_rate / 0.995;
												} else { //if purity = 999 OR 9999
													buying_rate = buying_rate / 1;
												}
												//rate1 = rate + (rate * tax/100) Tax calculation
												buying_rate +=(buying_rate *  (com_tax / 100));
												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
												buying_rate +=(buying_rate *  (com_octroi / 100));
												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
												buying_rate +=(buying_rate *  (com_stamduty / 100));
											}
											else {
												if(com_display_purity == 0  || isNaN(com_display_purity)) {
													var purity = 100;
												} else {
													var purity = com_display_purity;
												}
												buying_rate = buying_rate * (purity / 100);
											}
											buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
											buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
										}else if(rcval.tradetype == 1){
											//For Gold Bank Rate Calculation Start Here
											var bank_kgrate = 0;
											$.each(rpanelbankrates, function(rbkey, rbval) {
												if(rcval.bcontract_id == rbval.bcontract_id){
													bank_kgrate = parseFloat((isNaN(parseFloat($("#"+rbval.bcontract_rate+"_ask").html())) ? 0 : parseFloat($("#"+rbval.bcontract_rate+"_ask").html()) + parseFloat(rbval.premium) + parseFloat(rbval.askdiff)) * ((isNaN($("#SPOT-INR_ask").html())) ? 0 : parseFloat($("#SPOT-INR_ask").html()) + parseFloat(rbval.rupeepremium))).toFixed(2);
													if(parseInt(rbval.bconvert_value_type) == 1)
														bank_kgrate =  parseFloat(bank_kgrate + parseFloat(rbval.bconvert_value)).toFixed(2);
													else if(parseInt(rbval.bconvert_value_type) == 2)
														bank_kgrate =  parseFloat(bank_kgrate - parseFloat(rbval.bconvert_value)).toFixed(2);
													else if(parseInt(rbval.bconvert_value_type) == 3)
														bank_kgrate =  parseFloat(bank_kgrate * parseFloat(rbval.bconvert_value)).toFixed(2);
													else if(parseInt(rbval.bconvert_value_type) == 4)
														bank_kgrate =  parseFloat(bank_kgrate / parseFloat(rbval.bconvert_value)).toFixed(2);
													if(parseFloat(rbval.bextra_charges) > 0){
														if(parseInt(rbval.bextra_type) == 1){
															bank_kgrate = parseFloat(bank_kgrate + parseFloat(rbval.bextra_charges)).toFixed(2);
														}else if(parseInt(rbval.bextra_type) == 2){
															bank_kgrate = parseFloat(bank_kgrate - parseFloat(rbval.bextra_charges)).toFixed(2);
														}else if(parseInt(rbval.bextra_type) == 3){
															bank_kgrate = parseFloat(bank_kgrate * parseFloat(rbval.bextra_charges)).toFixed(2);
														}if(parseInt(rbval.bextra_type) == 4){
															bank_kgrate = parseFloat(bank_kgrate / parseFloat(rbval.bextra_charges)).toFixed(2);
														}
													}

													bank_kgrate = parseFloat(bank_kgrate) + parseFloat(rbval.custom);
													if(parseFloat(rbval.btax_value) > 0){
														if(parseInt(rbval.btax_type) == 1){
															bank_kgrate = parseFloat((bank_kgrate * ((100 + parseFloat(rbval.btax_value)) / 100))).toFixed(2);
														}else if(parseInt(rbval.btax_type) == 2){
															bank_kgrate = parseFloat((bank_kgrate + parseFloat(rbval.btax_value))).toFixed(2);
														}
													}
													if(parseInt(rbval.pure) == 1){
														bank_kgrate = parseFloat(bank_kgrate / 0.995).toFixed(2);
													}
													var bankrate = parseInt(rcval.comtype) == 0 ? gold_spotrateconversion(bank_kgrate, 10) : bank_kgrate;
													var baseask = (parseFloat(bankrate) + parseFloat(rcval.selldiff)).toFixed(2);
													if(com_isregion == 1) {
														if(com_calpurity == 0) { //if purity = 995
															baseask = baseask / 0.995;
														} else { //if purity = 999 OR 9999
															baseask = baseask / 1;
														}
														//rate1 = rate + (rate * tax/100) Tax calculation
														baseask +=(baseask *  (com_tax / 100));
														//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
														baseask +=(baseask *  (com_octroi / 100));
														//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
														baseask +=(baseask *  (com_stamduty / 100));
													}
													else {
														if(com_display_purity == 0  || isNaN(com_display_purity)) {
															var purity = 100;
														} else {
															var purity = com_display_purity;
														}
														baseask = baseask * (purity / 100);
													}
													var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight): silver_conversion(baseask, com_weight);
													selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

													buying_rate = (parseFloat(bankrate) - rcval.buydiff).toFixed(2);
													if(com_isregion == 1) {
														if(com_calpurity == 0) { //if purity = 995
															buying_rate = buying_rate / 0.995;
														} else { //if purity = 999 OR 9999
															buying_rate = buying_rate / 1;
														}
														//rate1 = rate + (rate * tax/100) Tax calculation
														buying_rate +=(buying_rate *  (com_tax / 100));
														//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
														buying_rate +=(buying_rate *  (com_octroi / 100));
														//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
														buying_rate +=(buying_rate *  (com_stamduty / 100));
													}
													else {
														if(com_display_purity == 0  || isNaN(com_display_purity)) {
															var purity = 100;
														} else {
															var purity = com_display_purity;
														}
														buying_rate = buying_rate * (purity / 100);
													}
													buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
													buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
												}
											});
										 //For Gold Bank Rate Calculation End Here
										}else if(rcval.tradetype == 2){
											var sellrate = rcval.sellrate;
											//Calculating Purity, Tax, Octroi and stamp duty if commodity type is region
											if(com_isregion == 1) {
												//rate = Base rate / purity
												if(com_calpurity == 0) { //if purity = 995
													sellrate = sellrate / 0.995;
												} else { //if purity = 999 OR 9999
													sellrate = sellrate / 1;
												}
												//rate1 = rate + (rate * tax/100) Tax calculation
												sellrate +=(sellrate *  (com_tax / 100));
												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
												sellrate +=(sellrate *  (com_octroi / 100));
												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
												sellrate +=(sellrate *  (com_stamduty / 100));
											}
											var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(sellrate, com_weight) : silver_conversion(sellrate, com_weight);
											selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

											var buying_con = parseInt(rcval.comtype) == 0 ? gold_conversion(rcval.buydiff, com_weight) : silver_conversion(rcval.buydiff, com_weight);
											buying_rate = manual_roundoff(selling_con, com_correction_type,'bid');
											buying_rate = buying_rate - buying_con;
											buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
										}
									}
								});
							 //Commodity Rate Calculation End Here
							}
							if(com_sel_active ==1) {
								//set selling price selling price = rate + premium + other charges
								if(com_premium_type == 1){
									selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
									selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
								}
								else{
								selling_rate = parseFloat(selling_rate) + parseFloat(com_sel_premium) + parseFloat(com_other_charges);
								selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
								selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
								}
							}else selling_rate = '-';
								//Display buying rate
							if(com_buy_active ==1) {
								//set buying price buying price = rate + premium
								if(com_premium_type == 1){
									buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
									buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
								}
								else{
								buying_rate = parseFloat(buying_rate) + parseFloat(com_buy_premium);
								buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
								buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
								}
							}
							else buying_rate ='-';
							if(selling_rate > parseFloat($(this).find('td:eq(2)').html())){
								$(this).find('td:eq(2)').css('color', '#FFFFFF');
								$(this).find('td:eq(2)').css('background-color', '#008000');
							}else if(selling_rate < parseFloat($(this).find('td:eq(2)').html())){
								$(this).find('td:eq(2)').css('color', '#FFFFFF');
								$(this).find('td:eq(2)').css('background-color', '#FF0000');
							}else{
								$(this).find('td:eq(2)').css('color', '');
								$(this).find('td:eq(2)').css('background-color', '');
							}
							$(this).find('td:eq(2)').html(selling_rate);

							if( buying_rate  > parseFloat($(this).find('td:eq(1)').html())){
								$(this).find('td:eq(1)').css('color', '#FFFFFF');
								$(this).find('td:eq(1)').css('background-color', '#008000');
							}else if(buying_rate < parseFloat($(this).find('td:eq(1)').html())){
								$(this).find('td:eq(1)').css('color', '#FFFFFF');
								$(this).find('td:eq(1)').css('background-color', '#FF0000');
							}else{
								$(this).find('td:eq(1)').css('color', '');
								$(this).find('td:eq(1)').css('background', '');
							}
							$(this).find('td:eq(1)').html(buying_rate);


							if(typeof trade_status_id !== 'undefined')
							{
									$(trade_status_id).each(function (j,value)
									{
										var styleSell="";
										var onclickSell="";
										var styleBuy="";
										var onclickBuy="";
										var statusbuy 	= 0;
										var statussell = 0;
										var buyClass = "";
										var sellClass = "";
										var removeSellClass = "";
										var removeBuyClass = "";

										if(parseInt($(el).find(".com_id").html()) == parseInt(trade_status_id[j]))
										{

											if(enable_trade == 1)
											{

												if((trade_status_sell[j] == 1 && !isNaN(selling_rate)))
												{
													onclickSell = "show_values(this,1)";
													sellClass = "sellEnabled";
													removeSellClass = "sellDisabled";
												}
												else
												{
													onclickSell = "";
													sellClass = "sellDisabled";
													removeSellClass = "sellEnabled";
												}
												if((trade_status_buy[j] == 1 && !isNaN(buying_rate)))
												{
													onclickBuy = "show_values(this,0)";
													buyClass = "buyEnabled";
													removeBuyClass = "buyDisabled";
												}
												else
												{
													onclickBuy = "";
													buyClass = "buyDisabled";
													removeBuyClass = "buyEnabled";
												}
												if(trade_status_sell[j] == 1 && !isNaN(selling_rate))
													statussell = 1;
												else
													statussell = 0;

												if(trade_status_buy[j] == 1 && !isNaN(buying_rate))
													statusbuy = 1;
												else
													 statusbuy = 0;

											} else {
												onclickBuy  = "trade_disable()";
												buyClass    = "buyDisabled";
												onclickSell = "trade_disable()";
												sellClass = "sellDisabled";
												removeSellClass = "sellEnabled";
												removeBuyClass = "buyEnabled";
											}

											$(el).attr('id',$(el).find(".com_id").html());
											$(el).find('td:nth-child(3)').attr('onClick',onclickSell);
											$(el).find('td:nth-child(3)').removeClass(removeSellClass).addClass(sellClass);
											$(el).find('td:nth-child(2)').attr('onClick',onclickBuy);
											$(el).find('td:nth-child(2)').removeClass(removeBuyClass).addClass(buyClass);
											$(el).find(".statusbuy").html(statusbuy);
											$(el).find(".statussell").html(statussell);
											return false;
										}
									});
								}
						}
					});
				}
				if(typeof trade_status_id !== 'undefined')
				{
					if(page_onload)
					{
						page_onload = false;
						show_firstCommodity();
					}
				}
			};
		callback();
		window.setInterval(callback, 300);
	})(); */
function updateIndicator() {
	var online = navigator.onLine;
	if (online) {
		if (document.getElementById("connectionmsg").innerHTML != "") {
			$("#loader").css('display', 'block');
			location.reload();
		}
		document.getElementById("connectionmsg").innerHTML = "";
		document.getElementById("connectionmsg").style.display = "none";
	} else {
		document.getElementById("connectionmsg").innerHTML = "Please check your internet connection";
		document.getElementById("connectionmsg").style.display = "block";
	}
}
function get_MarqueNews() {
	var $ = jQuery.noConflict();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL + "index.php/c_ajax/get_MarqueNews",
		success: function (data) {
			var $ = jQuery.noConflict();
			$("#marquee").html("");
			$(".newsevents").html("");
			if (data.marque != undefined) {
				var marqueText = data.marque + '';
				try {
					marqueText = decodeURIComponent(marqueText.replace(/\+/g, '%20'));
				} catch (e) {
					marqueText = marqueText.replace(/\+/g, ' ');
				}
				$("#marquee").append("<marquee scrollamount='4' onmouseover='this.stop();' onmouseout='this.start();' >" + marqueText + "</marquee>");
			}
			if (data.news != undefined) {
				var news_events = data.news;
				$(".newsevents").html(news_events);
			}
		},
		error: function (request, error) {
			console.log(error);
		}
	});
}

var trade_status_id = [];
var trade_status_buy = [];
var trade_status_sell = [];
var trade_amountpurch = [];
enable_trade = 0;
var orders = [];
var margin_balance = 0;
var page_onload = true;
var timer, timer_status, timer_flag = 0;
var $ = jQuery.noConflict();

$(function () {
	clear_bookingterminal();
	get_tradingdatas(function () {
		// After trading data is loaded, show first available commodity
		if (page_onload) {
			page_onload = false;
			show_firstCommodity();
		}
	});
	load_report(1);
	setInterval(function () { updateIndicator(); }, 5000);
	get_MarqueNews();
	var $ = jQuery.noConflict();

	$('input[type=radio][name=request_type]').change(function () {
		if (this.value == 0) {
			$('.ordervalue').css('display', 'none');
			$('.limitno').css('display', 'none');
			document.getElementById("book_update").style.display = "none";
			document.getElementById("book_cancel").style.display = "none";
			document.getElementById("book_qty").focus();
			if ($("#book_type").val() == 0)
				$("#buy_sell").html('BUY');
			else
				$("#buy_sell").html('SELL');
		}
		else if (this.value == 1) {
			document.getElementById("book_update").style.display = "none";
			document.getElementById("book_cancel").style.display = "none";
			$('.ordervalue').css('display', 'block');
			$('.limitno').css('display', 'none');
			$("#buy_sell").html('PLACE LIMIT');
			document.getElementById("order_bookno").value = "";
			$('#order_rate').val("");
			$('#limitno').val(-1);
			$('#order_rate').focus();
		}
		else if (this.value == 2) {
			load_pendingorders();
		}
	});

	$("body").on("click", "#activate_terminal", function () {
		if (enable_trade == 1) {
			show_firstCommodity();
		}
		else {
			trade_disable();
		}
	});

	$(".refresh_report").click(function () {
		var report_call = $(".headings.headings-active").attr("onclick");
		eval(report_call);
	});

	$("#limitno").on('change', function () {
		document.getElementById("order_bookno").value = "";
		$('#order_rate').val("");
		$('#book_qty').val("");
		$(orders).each(function (index, value) {

			if (parseInt(value.order_bookno) == parseInt($("#limitno").val())) {
				document.getElementById("order_bookno").value = parseFloat(value.order_bookno);
				$('#order_rate').val(parseFloat(value.order_taken_rate));
				$('#book_qty').val(parseFloat(value.order_taken_qty));
			}

		});
	});

	$("#book_comname").on('change', function (value) {
		var book_comid = $(this).val();
		change_commodity(book_comid);
	});

});
function get_tradingdatas(onComplete) {
	trade_status_id = [];
	trade_status_buy = [];
	trade_status_sell = [];
	margin_balance = 0;
	var $ = jQuery.noConflict();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL + "index.php/C_trade/get_tradingdatas",
		success: function (data) {
			//Trading Status
			$(data.tradeStatus.status).each(function (index, value) {
				trade_status_id.push(value.trade_status_id);
				trade_status_buy.push(value.trade_status_buy);
				trade_status_sell.push(value.trade_status_sell);
			});
			enable_trade = data.tradeStatus.trade_enable;
			margin_balance = data.available_balance;
			customer_type = data.tradeStatus.customer_type;
			// Sync status to table rows after data is ready
			update_row_trade_status();
			if (typeof onComplete === 'function') onComplete();
		},
		error: function (request, error) {
			console.log(error);
		}
	});
}

function update_row_trade_status() {
	var $ = jQuery.noConflict();

	$('#liveratetable tbody tr, #liveratetable_coin tbody tr').each(function (i, el) {
		var com_id = parseInt($(el).find('.com_id').text().trim(), 10);
		if (isNaN(com_id)) return;
		var statusbuy = 0;
		var statussell = 0;
		var onclickBuy = '';
		var onclickSell = '';
		var buyClass = 'buyDisabled';
		var sellClass = 'sellDisabled';

		$(trade_status_id).each(function (j, val) {
			if (parseInt(val, 10) === com_id) {
				if (enable_trade == 1) {
					var rawSellRate = $(el).find('td:eq(2)').text().trim();
					var rawBuyRate = $(el).find('td:eq(1)').text().trim();
					var cur_sell_rate = parseFloat(rawSellRate);
					var cur_buy_rate = parseFloat(rawBuyRate);

					if (trade_status_sell[j] == 1 && rawSellRate !== '' && rawSellRate !== '-' && !isNaN(cur_sell_rate)) {
						statussell = 1;
						onclickSell = 'show_values(this,1)';
						sellClass = 'sellEnabled';
					} else {
						onclickSell = '';
					}

					if (trade_status_buy[j] == 1 && rawBuyRate !== '' && rawBuyRate !== '-' && !isNaN(cur_buy_rate)) {
						statusbuy = 1;
						onclickBuy = 'show_values(this,0)';
						buyClass = 'buyEnabled';
					} else {
						onclickBuy = '';
					}
				} else {
					onclickBuy = 'trade_disable()';
					onclickSell = 'trade_disable()';
				}
				return false; // break
			}
		});

		$(el).attr('id', com_id);
		$(el).find('.statusbuy').html(statusbuy);
		$(el).find('.statussell').html(statussell);
		$(el).find('td:eq(1)').attr('onclick', onclickBuy).removeClass('buyDisabled buyEnabled').addClass(buyClass);
		$(el).find('td:eq(2)').attr('onclick', onclickSell).removeClass('sellDisabled sellEnabled').addClass(sellClass);
	});
}
function load_pendingorders(idorder = "") {
	var $ = jQuery.noConflict();
	$(".request-btn-value").css("pointer-events", "none");
	$("#loader").css('display', 'block');
	var com_id = $("#book_comid").val();
	orders = [];
	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL + "index.php/C_trade/load_pendingorders",
		data: "com_id=" + com_id,
		success: function (data) {
			$(".request-btn-value").css("pointer-events", "");
			$("#loader").css('display', 'none');
			$('#limitno').find('option:gt(0)').remove();
			if (data.orders.has_ordered == 1) {
				$.each(data.orders.order, function (index, value) {
					if ($("#bar_selection").val() == 1)
						var booknobar = parseFloat(value.book_no_bar) * parseFloat(document.getElementById('book_barquantity').value);
					else
						var booknobar = parseFloat(value.book_no_bar);

					var orderData = {
						order_taken_qty: parseFloat(booknobar),
						order_taken_rate: parseFloat(value.order_rate),
						order_bookno: parseFloat(value.order_bookno),
						order_qty: parseFloat(value.order_qty),
						order_comid: parseFloat(value.book_comid)
					}
					orders.push(orderData);
				});
			}
			$('#limitno').find('option:gt(0)').remove();
			$(orders).each(function (index, value) {
				if (value.order_comid == com_id) {
					$('#limitno').append($('<option>', {
						value: value.order_bookno,
						text: "No:" + value.order_bookno + ", Qty:" + value.order_taken_qty + ", Rate:" + value.order_taken_rate
					}));
				}
				document.getElementById("has_order").value = 1;
			});
			$('.ordervalue').css('display', 'block');
			$('.limitno').css('display', 'block');
			document.getElementById("order_bookno").value = "";
			$('#order_rate').val("");
			$('#book_qty').val("");
			$('#limitno').val(-1);
			$('#order_rate').focus();

			if (idorder != "") {
				$("#limitno").val(idorder);

				$(orders).each(function (index, value) {
					if (parseInt(value.order_bookno) == parseInt($("#limitno").val())) {
						document.getElementById("order_bookno").value = parseFloat(value.order_bookno);
						$('#order_rate').val(parseFloat(value.order_taken_rate));
						$('#book_qty').val(parseFloat(value.order_taken_qty));
					}

				});
			}
		},
		error: function (request, error) {
			console.log(error);
		}
	});
}
function show_firstCommodity() {
	var $ = jQuery.noConflict();
	var has_sellcommodity = false;
	$.each($("#liveratetable tbody tr"), function (index, value) {
		if ($(value).find('.statussell').html() == 1) {
			var obj_td = $(value).find('td:nth-child(3)').get(0);

			show_values(obj_td, 1);
			has_sellcommodity = true;
			return false;
		}
	});
	if (!has_sellcommodity) {
		$.each($("#liveratetable tbody tr"), function (index, value) {

			if ($(value).find('.statusbuy').html() == 1) {
				var obj_td = $(value).find('td:nth-child(2)').get(0);
				show_values(obj_td, 0);
				return false;
			}
		});
	}
}
function change_commodity(book_comid) {
	$.each($("#liveratetable tbody tr"), function (index, value) {
		var com_id = $(value).find('.com_id').html();

		if (com_id == book_comid) {
			if (parseInt($("#book_type").val()) == 0) {
				var obj_td = $(value).find('td:nth-child(3)').get(0);
				show_values(obj_td, 1);
			}
			else {
				var obj_td = $(value).find('td:nth-child(2)').get(0);
				show_values(obj_td, 0);
			}
			return false;
		}
	});
}
function call_reviewOrder() {
	$("#update_ordertype").prop("checked", true);
	$('.ordervalue').css('display', 'block');
	$('.limitno').css('display', 'block');
	document.getElementById("order_bookno").value = "";
	$('#order_rate').val("");
	$('#book_qty').val("");
	$('#limitno').val(-1);
	$('#order_rate').focus();
}
function clear_bookingterminal() {
	var $ = jQuery.noConflict();

	cleartime();
	$("#book_comname").html("");
	$("#required_qty").html('<input id="book_qty" name="book_qty"  type="number" class="form-control width-input" tabindex="2" />');
	$("#book_qty").val("");
	$("#order_rate").val("");
	$(".avail_margin").val(0.00);
	$("#rate_disp").html("Rate");
	$("#book_rate").val("");
	$("#book_rate").css("background", "");
	$("#book_totalcost").html("");
	$('#limitno').find('option:gt(0)').remove();
	$(".comm-purchase").removeClass("atv_btn");
	$("#book").css("display", "block");
	$("#book .buysellrates").css("background", "#008000");
	$("#buy_sell").html("BUY/SELL");
	$(".maxmin").html("");
	$(".rateval").html("0.00");
	$(".rateval_update").html("0.00");
	$(".ordervalue").css("display", "none");
	$('.limitno').css('display', 'none');
	document.getElementById("book_update").style.display = "none";
	document.getElementById("book_cancel").style.display = "none";
	$("#new_booktype").prop('checked', true);
	$(".buySell-info").css("display", "block");
	$("#activate_terminal").css("display", "inline");
	$('#book_qty').val("");
	$('.qty_type').html("");
	$('.displayLotSize').html("");
}

function customer_request() {
	var $ = jQuery.noConflict();
	document.getElementById("book").style.display = "none";
	$("#loader").css('display', 'block');

	if ($('#new_booktype').is(':checked')) {
		var request_type = 0;
	}
	else if ($('#new_ordertype').is(':checked')) {
		var request_type = 1;
	}
	else if ($('#update_ordertype').is(':checked')) {
		var request_type = 2;
	}
	if ($('#deal_typeweight').is(':checked')) {
		var request_amt_wt = 0;
	}
	else if ($('#deal_typeamount').is(':checked')) {
		var request_amt_wt = 1;
	}
	if (request_amt_wt == 1) {
		var booked_qty = parseFloat($("#book_qty").val());
	}
	else {
		if ($("#bar_selection").val() == 1) {
			var booked_qty = parseFloat($("#book_qty").val()) / parseFloat(document.getElementById('book_barquantity').value);
		}
		else {
			var booked_qty = parseFloat($("#book_qty").val());
		}
	}


	var book_cusid = document.getElementById("book_cusid").value;
	var book_comid = document.getElementById("book_comid").value;
	var book_comtype = document.getElementById("book_comtype").value;
	var book_comname = $("#book_comname option:selected").text();
	var book_type = document.getElementById("book_type").value;
	var book_no_bar = booked_qty;
	var margin = document.getElementById("margin").value;
	var margin_type = document.getElementById("margin_type").value;
	var book_commweight = parseFloat(document.getElementById('book_comweight').value);
	var com_bar_type = parseFloat(document.getElementById("com_bar_type").value);
	var qty_conversion = (com_bar_type == 1 ? 1 : 1000);
	var com_weight = parseFloat(document.getElementById('book_comweight').value);
	var discount_amt = document.getElementById("discount_amt").value;
	var discount_actual = document.getElementById("discount_amt").value;
	var deliverydays = document.getElementById("deliverydate").value;

	//var book_qty   		= parseFloat(parseFloat(booked_qty)*parseFloat(document.getElementById('book_barquantity').value)/qty_conversion).toFixed(6);


	if (request_amt_wt == 1) {
		if (request_type == 1) {
			var book_rate = parseFloat(document.getElementById("order_rate").value);
		}
		else {
			var book_rate = document.getElementById("book_rate").value;
		}

		var book_totalcost = document.getElementById("book_totamt").value;

		var bookgrm_rate = parseFloat(book_rate) / parseFloat(com_weight);
		var book_qty = parseFloat((parseFloat(book_totalcost) / parseFloat(bookgrm_rate)) * (document.getElementById('book_barquantity').value) / qty_conversion).toFixed(6);

	}
	else {
		var book_qty = parseFloat(parseFloat(booked_qty) * parseFloat(document.getElementById('book_barquantity').value) / qty_conversion).toFixed(6);
		if (request_type == 1) {
			var book_rate = parseFloat(document.getElementById("order_rate").value);

			var book_totalcost = parseFloat(Math.round((book_rate / book_commweight) * (book_qty * 1000)));

			discount_amt = parseFloat(Math.round((discount_amt / book_commweight) * (book_qty * 1000)));
		}
		else {
			var book_rate = document.getElementById("book_rate").value;

			var book_totalcost = parseFloat(Math.round((book_rate / book_commweight) * (book_qty * 1000)));

			discount_amt = parseFloat(Math.round((discount_amt / book_commweight) * (book_qty * 1000)));
		}
	}


	cleartime();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL + "index.php/C_trade/booking_request",
		data: "book_cusid=" + book_cusid + "&book_comid=" + book_comid + "&book_qty=" + book_qty + "&book_rate=" + book_rate + "&book_deliverydate=" + deliverydays +
			"&book_type=" + book_type + "&book_comweight=" + book_commweight + "&book_totalcost=" + book_totalcost + "&book_no_bar=" + book_no_bar + "&margin=" + margin + "&margin_type=" + margin_type + "&request_type=" + request_type + "&com_bar_type=" + com_bar_type + "&request_amt_wt=" + request_amt_wt + "&discount_amt=" + discount_amt + "&discount_actual=" + discount_actual,
		success: function (data) {
			$("#loader").css('display', 'none');
			get_tradingdatas();
			if (typeof data.is_logged_out != 'undefined' && data.is_logged_out == true) {
				logout();
			}
			else {
				if (request_type == 0 || request_type == 1) {
					notifyBooking(data.book_no);
					load_report(1);
				} else {
					load_report(2);
				}
				$('#booking_status').html(data.message);
				$('#status_modal').modal({
					backdrop: 'static',
					keyboard: false
				});
				$('#order_rate').val("");
				$("#avail_margin").html("");
				clear_bookingterminal();
			}
		}
	});
}
function customer_request_update() {
	var $ = jQuery.noConflict();
	document.getElementById("book_update").style.display = "none";
	document.getElementById("book_cancel").style.display = "none";
	var com_weight = parseFloat(document.getElementById('book_comweight').value);
	$('#request_modal').modal('hide');
	$("#loader").css('display', 'block');
	if ($('#new_booktype').is(':checked')) {
		var request_type = 0;
	}
	else if ($('#new_ordertype').is(':checked')) {
		var request_type = 1;
	}
	else if ($('#update_ordertype').is(':checked')) {
		var request_type = 2;
	}
	if ($('#deal_typeweight').is(':checked')) {
		var request_amt_wt = 0;
	}
	else if ($('#deal_typeamount').is(':checked')) {
		var request_amt_wt = 1;
	}
	if (request_amt_wt == 1) {
		var booked_qty = parseFloat($("#book_qty").val());
	}
	else {
		if ($("#bar_selection").val() == 1) {
			var booked_qty = parseFloat($("#book_qty").val()) / parseFloat(document.getElementById('book_barquantity').value);
		}
		else {
			var booked_qty = parseFloat($("#book_qty").val());
		}
	}

	var book_cusid = document.getElementById("book_cusid").value;
	var book_comid = document.getElementById("book_comid").value;
	var book_rate = document.getElementById("order_rate").value;

	var book_no_bar = booked_qty;
	var book_commweight = parseFloat(document.getElementById('book_comweight').value);
	var book_no = document.getElementById("order_bookno").value;
	var book_type = document.getElementById("book_type").value;
	var com_bar_type = parseFloat(document.getElementById("com_bar_type").value);
	var qty_conversion = (com_bar_type == 1 ? 1 : 1000);

	var discount_amt = document.getElementById("discount_amt").value;
	var book_totalcost = parseFloat(Math.round((discount_amt / book_commweight) * (book_qty * 1000)));

	if (request_amt_wt == 1) {
		var book_totalcost = document.getElementById("book_totamt").value;

		var bookgrm_rate = parseFloat(book_rate) / parseFloat(com_weight);
		var book_qty = parseFloat((parseFloat(book_totalcost) / parseFloat(bookgrm_rate)) * (document.getElementById('book_barquantity').value) / qty_conversion).toFixed(6);

	}
	else {
		var book_qty = parseFloat(parseFloat(booked_qty) * parseFloat(document.getElementById('book_barquantity').value) / qty_conversion).toFixed(6);
		var book_totalcost = parseFloat(Math.round((book_rate / book_commweight) * (book_qty * 1000)));
	}
	cleartime();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL + "index.php/C_trade/booking_request_update",
		data: "book_cusid=" + book_cusid + "&book_comid=" + book_comid + "&book_no=" + book_no + "&book_rate=" + book_rate + "&book_totalcost=" + book_totalcost + "&book_qty=" + book_qty + "&book_no_bar=" + book_no_bar + "&request_type=" + request_type + "&book_type=" + book_type + "&request_amt_wt=" + request_amt_wt + "&discount_amt=" + discount_amt,
		success: function (data) {
			$("#loader").css('display', 'none');
			get_tradingdatas();
			if (typeof data.is_logged_out != 'undefined' && data.is_logged_out == true) {
				logout();
			}
			else {
				$("#book_update").css('display', 'none');
				$("#book_cancel").css('display', 'none');
				if (data.status == 1) {
					$('#booking_status').html("Order No:" + book_no + " - Order has been updated...");
				} else {
					$('#booking_status').html(data.message);
				}
				$('#status_modal').modal({
					backdrop: 'static',
					keyboard: false
				});
				clear_bookingterminal();
				$('#order_rate').val("");
				$("#avail_margin").html("");
				load_report(2);
			}
		}
	});
}
function customer_request_delete() {

	document.getElementById("book_update").style.display = "none";
	document.getElementById("book_cancel").style.display = "none";

	var $ = jQuery.noConflict();

	$("#loader").css('display', 'block');

	var book_cusid = document.getElementById("book_cusid").value;
	var book_comid = document.getElementById("book_comid").value;
	var book_no = document.getElementById("order_bookno").value;
	cleartime();
	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL + "index.php/C_trade/booking_request_cancel",
		data: "book_cusid=" + book_cusid + "&book_comid=" + book_comid + "&book_no=" + book_no,
		success: function (data) {
			$("#loader").css('display', 'none');
			get_tradingdatas();
			if (typeof data.is_logged_out != 'undefined' && data.is_logged_out == true) {
				logout();
			}
			else {
				$("#book_update").css('display', 'none');
				$("#book_cancel").css('display', 'none');
				if (data.status == 1) {
					$('#booking_status').html("Order No:" + book_no + " - Your Order has been cancelled...");
					$('#status_modal').modal({
						backdrop: 'static',
						keyboard: false
					});

					clear_bookingterminal();
					$('#order_rate').val("");
					notifyBooking(data.book_no);
				} else {
					$('#booking_status').html(data.message);
					$('#status_modal').modal({
						backdrop: 'static',
						keyboard: false
					});

					clear_bookingterminal();
					$('#order_rate').val("");
				}
				$("#avail_margin").html("");
				load_report(2);
			}
		}
	});

}
function notifyBooking(book_no) {
	var $ = jQuery.noConflict();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL + "index.php/C_trade/notifyBooking",
		data: "book_no=" + book_no,
		success: function (data) {

		}
	});
}
function calculateTotal(row, is_buy, is_sell) {
	$ = jQuery.noConflict();
	var comid = document.getElementById("book_comtype").value;
	var com_weight = parseFloat(document.getElementById('book_comweight').value);
	// var order_rate    = parseFloat(document.getElementById("order_rate").value);
	// var book_rate     = parseFloat(document.getElementById("book_rate").value);
	var order_rate_live = parseFloat(document.getElementById("order_rate").value);
	var book_rate_live = parseFloat(document.getElementById("book_rate").value);


	var book_bar_qty = parseFloat(document.getElementById('book_barquantity').value);
	var bookingQty = parseFloat($("#book_qty").val()) * book_bar_qty;
	var com_bar_type = parseFloat($("#com_bar_type").val());
	var bar_selection = parseFloat($("#bar_selection").val());
	var deal_typeamount = parseFloat($("#deal_typeamount").val());
	var deal_typeweight = parseFloat($("#deal_typeweight").val());

	var discount_amt = parseFloat(document.getElementById('discount_amt').value);
	var book_rate = parseFloat(book_rate_live);
	var book_rate_wtdis = parseFloat(book_rate_live) + parseFloat(discount_amt);
	var order_rate = parseFloat(order_rate_live);

	if ($('#deal_typeamount').is(':checked')) {
		var request_amt_wt = 0;
	}
	else if ($('#deal_typeweight').is(':checked')) {
		var request_amt_wt = 1;
	}
	var hightol = 0;
	var lowtol = 0;
	var book_totalcost = 0;

	if (request_amt_wt == 1) {

		if (bar_selection == 1) {
			var book_qty = parseFloat($("#book_qty").val()) / book_bar_qty;
		}
		else {
			var book_qty = parseFloat($("#book_qty").val());
		}
	}


	if ($('#new_booktype').is(':checked')) {
		var request_type = 0;
	}
	else if ($('#new_ordertype').is(':checked')) {
		var request_type = 1;
	}
	else if ($('#update_ordertype').is(':checked')) {
		var request_type = 2;
	}

	if (request_type == 1 || request_type == 2) {
		if ($("#book_comtype").val() == 0) {
			if ($("#gold_high_tol").val() != 0) {
				hightol = Math.round(book_rate + (book_rate * parseFloat($("#gold_high_tol").val()) / 100));
			}
			else {
				hightol = book_rate;
			}
			if ($("#gold_low_tol").val() != 0) {
				lowtol = Math.round(parseFloat(document.getElementById("book_rate").value) - (parseFloat(document.getElementById("book_rate").value) * parseFloat($("#gold_low_tol").val()) / 100));
			}
			else {
				lowtol = book_rate;
			}
		}
		else if ($("#book_comtype").val() == 1) {
			if ($("#silver_high_tol").val() != 0) {
				hightol = Math.round(book_rate + (book_rate * parseFloat($("#silver_high_tol").val()) / 100));
			}
			else {
				hightol = book_rate;
			}
			if ($("#silver_low_tol").val() != 0) {
				lowtol = Math.round(book_rate - (book_rate * parseFloat($("#silver_low_tol").val()) / 100));
			}
			else {
				lowtol = book_rate;
			}
		}
	}
	if (request_amt_wt == 1) {
		$('.deal_totalamt').css('display', 'none');
		var number = parseFloat($("#book_qty").val()) > 0 ? $("#book_qty").val().toString() : "0";
		var allowed_decimals = $("#allowed_decimals").val();
		var arr_num = number.split('.');
		var after_decimal = true;

		if (typeof arr_num[1] !== 'undefined' && !isNaN(arr_num[1]) && arr_num[1] != '') {
			if (arr_num[1].length > allowed_decimals) {
				after_decimal = false;
			}

		}
		if (parseFloat(number) > 0 && after_decimal == true && ((request_type == 1 || request_type == 2) ? !isNaN(order_rate) && order_rate > 0 : true) && (request_type == 2 ? document.getElementById("limitno").value != -1 : true)) {
			var qty_conversion = com_bar_type == 1 ? 1000 : 1;

			if (request_type == 1 || request_type == 2) {
				if (order_rate != "" && book_qty != "") {
					book_totalcost = parseFloat(Math.round((order_rate / com_weight) * (book_qty * book_bar_qty * qty_conversion)));
				}
			}
			else {
				book_totalcost = parseFloat(Math.round((book_rate / com_weight) * (book_qty * book_bar_qty * qty_conversion)));
			}

			if (book_bar_qty == 1 || bar_selection == 1) {
				var totalcost = isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2);
			}
			else {
				if (com_bar_type == 0) {
					var totalqty = parseFloat((book_qty * book_bar_qty).toFixed(6));
					var qtyType = "gms";
				}
				else if (com_bar_type == 1) {
					var totalqty = parseFloat((book_qty * book_bar_qty).toFixed(6));
					var qtyType = "Kg";
				}
				var totalcost = (isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2)) + " <span class='totalqty'>(" + totalqty + " " + (qtyType) + ")</span>";
			}

			document.getElementById("book_totalcost").innerHTML = totalcost;

			if ((request_type == 1 || request_type == 2) ? ((hightol != 0 ? order_rate <= hightol : true) && (lowtol != 0 ? order_rate >= lowtol : true)) : true) {
				if (request_type == 2 ? $('#has_order').val() == 1 && $("#limitno").val() != -1 : false) {
					document.getElementById("book_update").style.display = "block";
					document.getElementById("book").style.display = "none";
				}
				else {
					document.getElementById("book_update").style.display = "none";
					document.getElementById("book").style.display = "block";
				}
			}
			else {
				document.getElementById("book_update").style.display = "none";
				document.getElementById("book").style.display = "none";
			}

			if (request_type == 2 && $('#has_order').val() == 1 && $("#limitno").val() != -1) {
				document.getElementById("book_cancel").style.display = "block";
			}
			else {
				document.getElementById("book_cancel").style.display = "none";
			}
		}
		else {
			if (!parseFloat(number) > 0 || !after_decimal) {
				document.getElementById("book_qty").value = '';
				document.getElementById("book_totalcost").innerHTML = "0";
				document.getElementById("book").style.display = "none";
				document.getElementById("book_update").style.display = "none";
				document.getElementById("book_cancel").style.display = "none";
			}
			if (request_type == 2 || request_type == 1) {
				if (order_rate == '' || isNaN(order_rate) || order_rate < 0) {
					document.getElementById("book").style.display = "none";
					document.getElementById("book_update").style.display = "none";
					document.getElementById("book_cancel").style.display = "none";
					document.getElementById("order_rate").value = '';
					document.getElementById("book_totalcost").innerHTML = "0";
				}
			}
		}
	}
	else {
		$('.deal_totalamt').css('display', 'block');
		var book_totamt = parseFloat($("#book_totamt").val());
		var book_totamt = isNaN(book_totamt) ? 0 : book_totamt;
		if (((request_type == 1 || request_type == 2) ? !isNaN(order_rate) && order_rate > 0 : true) && (request_type == 2 ? document.getElementById("limitno").value != -1 : true)) {
			var qty_conversion = com_bar_type == 1 ? 1000 : 1;

			if (request_type == 1 || request_type == 2) {
				if (order_rate != "" && book_totamt != "") {
					//book_totalcost = parseFloat(Math.round((order_rate/com_weight)  *  (book_qty * book_bar_qty * qty_conversion)));
					var bookgrm_rate = parseFloat(order_rate) / parseFloat(com_weight);
					var totalqty = document.getElementById("book_qty").value = parseFloat((parseFloat(book_totamt) / parseFloat(bookgrm_rate)) * book_bar_qty / qty_conversion).toFixed(3);
					book_totalcost = book_totamt;
				}
			}
			else {
				console.log("order_rate: " + order_rate + " com_weight: " + com_weight + " book_bar_qty: " + book_bar_qty + " qty_conversion: " + qty_conversion);
				var bookgrm_rate = parseFloat(book_rate) / parseFloat(com_weight);

				var totalqty = document.getElementById("book_qty").value = parseFloat((parseFloat(book_totamt) / parseFloat(bookgrm_rate)) * book_bar_qty / qty_conversion).toFixed(3);
				book_totalcost = book_totamt;
			}

			if (book_bar_qty == 1 || bar_selection == 1) {
				var totalcost = isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2);
			}
			else {
				if (com_bar_type == 0) {
					//var totalqty = parseFloat((book_qty * book_bar_qty).toFixed(6));
					var qtyType = "gms";
				}
				else if (com_bar_type == 1) {
					//var totalqty = parseFloat((book_qty * book_bar_qty).toFixed(6));
					var qtyType = "Kg";
				}
				var totalcost = (isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2)) + " <span class='totalqty'>(" + totalqty + " " + (qtyType) + ")</span>";
			}

			document.getElementById("book_totalcost").innerHTML = totalcost;

			if ((request_type == 1 || request_type == 2) ? ((hightol != 0 ? order_rate <= hightol : true) && (lowtol != 0 ? order_rate >= lowtol : true)) : true) {
				if (request_type == 2 ? $('#has_order').val() == 1 && $("#limitno").val() != -1 : false) {
					document.getElementById("book_update").style.display = "block";
					document.getElementById("book").style.display = "none";
				}
				else {
					document.getElementById("book_update").style.display = "none";
					document.getElementById("book").style.display = "block";
				}
			}
			else {
				document.getElementById("book_update").style.display = "none";
				document.getElementById("book").style.display = "none";
			}

			if (request_type == 2 && $('#has_order').val() == 1 && $("#limitno").val() != -1) {
				document.getElementById("book_cancel").style.display = "block";
			}
			else {
				document.getElementById("book_cancel").style.display = "none";
			}
		}
		else {
			if (!parseFloat(number) > 0) {
				document.getElementById("book_qty").value = '';
				document.getElementById("book_totalcost").innerHTML = "0";
				document.getElementById("book").style.display = "none";
				document.getElementById("book_update").style.display = "none";
				document.getElementById("book_cancel").style.display = "none";
			}
			if (request_type == 2 || request_type == 1) {
				if (order_rate == '' || isNaN(order_rate) || order_rate < 0) {
					document.getElementById("book").style.display = "none";
					document.getElementById("book_update").style.display = "none";
					document.getElementById("book_cancel").style.display = "none";
					document.getElementById("order_rate").value = '';
					document.getElementById("book_totalcost").innerHTML = "0";
				}
			}
		}

	}
}
function show_values() {
	console.log("show_values called!", arguments);
	var is_sell = 0;
	var is_buy = 0;
	var $ = jQuery.noConflict();

	$("#activate_terminal").css("display", "none");

	if (parseInt(arguments[1]) == 0) {
		is_sell = $($(arguments[0]).parent()).find('.statusbuy').html();
	}
	if (parseInt(arguments[1]) == 1) {
		is_buy = $($(arguments[0]).parent()).find('.statussell').html();
	}
	$("#new_booktype").prop("checked", true);
	var type = arguments[2];
	var idorder = arguments[3];
	document.getElementById("book_update").style.display = "none";
	document.getElementById("book_cancel").style.display = "none";
	$('.ordervalue').css('display', 'none');
	$('.limitno').css('display', 'none');
	$("#order_rate").val("");
	cleartime();
	document.getElementById("booking_status").innerHTML = '';
	document.getElementById("book_rate").value = '';
	var tableid = document.getElementById("liveratetable");
	var book_cusid = document.getElementById('book_cusid').value;
	var row = arguments[0].parentNode.id;
	var parentRow = arguments[0].parentNode;
	document.getElementById("book_qty").value = "";
	document.getElementById("book_totalcost").innerHTML = "0.00";
	document.getElementById("book").style.display = "none";
	document.getElementById("book_comid").value = $(parentRow).attr('id');
	$('#book_comname').find('option').remove();

	$.each($("#liveratetable > tbody tr"), function (index, value) {

		var com_id = $(value).find('.com_id').html();
		var com_name = $(value).find('.com_name').html();
		var statussell = $(value).find('.statussell').html();
		var statusbuy = $(value).find('.statusbuy').html();

		if (statusbuy == 1 && is_sell == 1) {

			var selected = '';
			if (document.getElementById("book_comid").value == com_id)
				selected = 'selected = "selected"';

			$('#book_comname').append('<option value="' + com_id + '" ' + selected + '>' + com_name + '</option>');
		}
		else if (statussell == 1 && is_buy == 1) {

			var selected = '';
			if (document.getElementById("book_comid").value == com_id)
				selected = 'selected = "selected"';

			$('#book_comname').append('<option value="' + com_id + '" ' + selected + '>' + com_name + '</option>');
		}
	});
	$.each($("#liveratetable_coin > tbody tr"), function (index, value) {

		var com_id = $(value).find('.com_id').html();
		var com_name = $(value).find('.com_name').html();
		var statussell = $(value).find('.statussell').html();
		var statusbuy = $(value).find('.statusbuy').html();


		console.log(value);
		console.log(com_name);
		console.log(statussell);
		console.log(statusbuy);

		if (statusbuy == 1 && is_sell == 1) {

			if (document.getElementById("book_comid").value == com_id)
				var selected = 'selected = "selected"';

			$('#book_comname').append('<option value="' + com_id + '" ' + selected + '>' + com_name + '</option>');
		}
		else if (statussell == 1 && is_buy == 1) {

			if (document.getElementById("book_comid").value == com_id)
				var selected = 'selected = "selected"';

			$('#book_comname').append('<option value="' + com_id + '" ' + selected + '>' + com_name + '</option>');
		}
	});
	document.getElementById("book_barquantity").value = $(parentRow).find('.com_bar_quantity').html();
	document.getElementById("book_comtype").value = $(parentRow).find('.com_type').html();
	document.getElementById("margin_type").value = $(parentRow).find('.com_margin_type').html();
	document.getElementById("margin").value = $(parentRow).find('.com_margin_value').html();
	document.getElementById("allowed_decimals").value = $(parentRow).find('.allowed_decimals').html();
	document.getElementById("com_bar_type").value = $(parentRow).find('.com_bar_type').html();
	document.getElementById("bar_selection").value = $(parentRow).find('.bar_selection').html();
	document.getElementById("com_bar_no").value = $(parentRow).find('.com_bar_no').html();
	document.getElementById("book_comweight").value = $(parentRow).find('.com_weight').html();
	document.getElementById('order_disprate').innerHTML = "";
	document.getElementById('rate_disp').innerHTML = "";
	document.getElementById("premsel_premium").value = $(parentRow).find('.prem_sel_premium').html();
	document.getElementById("prembuy_premium").value = $(parentRow).find('.prem_buy_premium').html();
	document.getElementById("premcomsell_active").value = $(parentRow).find('.prem_comsell_active').html();
	document.getElementById("premcombuy_active").value = $(parentRow).find('.prem_combuy_active').html();
	document.getElementById("cus_com_amountpurch").value = $(parentRow).find('.cus_com_amountpurch').html();
	document.getElementById("deliverydate").value = $(parentRow).find('.deliverydays').html();
	var book_comweight = document.getElementById("book_comweight").value;

	if ($(parentRow).find('.com_unit').html() == 0) {
		document.getElementById('order_disprate').innerHTML = "Order Price(" + parseFloat(book_comweight) + "Grm)";
		document.getElementById('rate_disp').innerHTML = "Rate(" + parseFloat(book_comweight) + " Grm)";
	}
	else if ($(parentRow).find('.com_unit').html() == 1) {
		document.getElementById('order_disprate').innerHTML = "Order At Price(" + parseFloat(parseFloat(book_comweight) / 1000) + " Kg)";
		document.getElementById('rate_disp').innerHTML = "Rate(" + parseFloat(parseFloat(book_comweight) / 1000) + " Kg)";
	}
	var qtyType = $("#com_bar_type").val() == 0 ? 'Gms' : 'Kg';


	// Customer Commodity Purchase Amount Enabled/Disabled Logic Start

	var cus_com_amountpurch = parseFloat(document.getElementById("cus_com_amountpurch").value);

	if (cus_com_amountpurch === 0) {
		$('.amount_purchase').css('display', 'none');
		$('.trade_amount_weight').css('display', 'none');
	} else if (cus_com_amountpurch === 1) {
		$('.amount_purchase').css('display', 'block');
		$('.trade_amount_weight').css('display', 'block');
	}

	// Customer Commodity Purchase Amount Enabled/Disabled Logic End

	if ($('#deal_typeweight').is(':checked')) {
		var request_amt_wt = 0;
	}
	else if ($('#deal_typeamount').is(':checked')) {
		var request_amt_wt = 1;
	}
	if ($("#bar_selection").val() == 1) {
		$("#required_qty").html('<select id="book_qty" name="book_qty" class="form-control width-input" tabindex="2"></select>');
		var bar_weight = parseFloat(document.getElementById("book_barquantity").value);
		var qty_no = $("#com_bar_no").val();
		for (i = 1; i <= qty_no; i++) {
			var total_qty = parseFloat(bar_weight) * parseFloat(i);
			$('#book_qty').append('<option value="' + total_qty + '">' + total_qty + '</option>');
		}
		$(".qty_type").html("(" + qtyType + ")");
		$('.displayLotSize').html("");
	}
	else {
		$("#required_qty").html('<input id="book_qty" name="book_qty"  type="number" class="form-control width-input" tabindex="2" />');
		$('#book_qty').val(1);
		if ($("#book_barquantity").val() == 1) {
			$(".qty_type").html("(" + qtyType + ")");
			$(".displayLotSize").html("");
		}
		else {
			$(".displayLotSize").html("1 Qty = " + $("#book_barquantity").val() + " " + qtyType);
			$(".qty_type").html("");
		}
	}
	if (is_buy == 1) {
		document.getElementById("buy_sell").innerHTML = "BUY";
		$("#book_type").val(0);
		$("#book .buysellrates").css("background", "#008000");
		$(".displaydiscount").html($("#premsel_premium").val());
		$(".displaydate").html($("#deliverydate").val());
		document.getElementById("discount_amt").value = $("#premsel_premium").val();
	}
	else if (is_sell == 1) {
		document.getElementById("buy_sell").innerHTML = "SELL";
		$("#book_type").val(1);
		$("#book .buysellrates").css("background", "#FF0000");
		$(".displaydiscount").html($("#prembuy_premium").val());
		$(".displaydate").html($("#deliverydate").val());
		document.getElementById("discount_amt").value = $("#prembuy_premium").val();
	}
	else {
		document.getElementById("buy_sell").innerHTML = "";
	}

	document.getElementById("has_order").value = 0;
	document.getElementById("margin_type").value = $(parentRow).find('.com_margin_type').html();
	document.getElementById("margin").value = $(parentRow).find('.com_margin_value').html();
	$("#avail_margin").html(margin_balance);

	if (type == 2) {
		call_reviewOrder();
		load_pendingorders(idorder);
	}

	document.getElementById("book_qty").focus();

	timer_flag = 0;

	$(".comm-purchase").addClass("atv_btn");

	callbook_rate(row, is_buy, is_sell);
}
function callbook_rate(row, is_buy, is_sell) {
	var $ = jQuery.noConflict();

	if ($('#new_booktype').is(':checked')) {
		var request_type = 0;
	}
	else if ($('#new_ordertype').is(':checked')) {
		var request_type = 1;
	}
	else if ($('#update_ordertype').is(':checked')) {
		var request_type = 2;
	}
	var tableid = document.getElementById("liveratetable");
	var discount_amt = document.getElementById("discount_amt").value;
	var currow = document.getElementById(row);
	if (is_buy == 1) {
		var current_rate_buy = $(currow).find('td:nth-child(3)').text().trim();
		if (parseFloat(document.getElementById("book_rate").value) > parseFloat(current_rate_buy)) {
			$('#book_rate').css('color', '#FFFFFF');
			$('#book_rate').css('background', '#FF0000');
		} else if (parseFloat(document.getElementById("book_rate").value) < parseFloat(current_rate_buy)) {

			$('#book_rate').css('color', '#FFFFFF');
			$('#book_rate').css('background', '#008000');
		} else {
			$('#book_rate').css('color', '#000');
			$('#book_rate').css('background', '');
		}
		document.getElementById("book_rate").value = current_rate_buy;
		document.getElementById("book_rate_wtdis").value = parseFloat(current_rate_buy) + parseFloat(discount_amt);
	}


	if (is_sell == 1) {
		var current_rate_sell = $(currow).find('td:nth-child(2)').text().trim();
		if (parseFloat(document.getElementById("book_rate").value) > parseFloat(current_rate_sell)) {
			$('#book_rate').css('color', '#FFFFFF');
			$('#book_rate').css('background', '#FF0000');
		} else if (parseFloat(document.getElementById("book_rate").value) < parseFloat(current_rate_sell)) {
			$('#book_rate').css('color', '#FFFFFF');
			$('#book_rate').css('background', '#FF0000');
		} else {
			$('#book_rate').css('color', '#000');
			$('#book_rate').css('background', '');
		}
		document.getElementById("book_rate").value = current_rate_sell;
		document.getElementById("book_rate_wtdis").value = parseFloat(current_rate_sell) + parseFloat(discount_amt);

	}

	if (request_type == 0) {
		if (is_buy == 1)
			$(".rateval").html(current_rate_buy);
		else if (is_sell == 1)
			$(".rateval").html(current_rate_sell);
		else
			$(".rateval").html(0.00);
	}
	if (request_type == 1) {
		if (is_buy == 1)
			$(".rateval").html($("#order_rate").val());
		else if (is_sell == 1)
			$(".rateval").html($("#order_rate").val());
		else
			$(".rateval").html(0.00);
	}

	if (request_type == 2) {
		$(".rateval_update").html($("#order_rate").val());
	}

	calculateTotal(row, is_buy, is_sell);
	if (timer_flag == 0) {
		timer = setTimeout("callbook_rate('" + row + "'," + is_buy + "," + is_sell + ")", 600);
	}
}
function cleartime() {
	clearTimeout(timer);
	clearTimeout(timer_status);
	timer_flag = 1;
}
function trade_disable() {
	$('#booking_status').html("Currently trade has been disabled...Please try again later...");
	$('#status_modal').modal({
		backdrop: 'static',
		keyboard: false
	});
}
function edit_limit(book_comid, book_no, book_type) {
	if (enable_trade == 1) {
		var rateid = '';
		var buysellstatus = "";
		$.each($("#liveratetable tbody tr"), function (j, rates) {
			var com_id = $(rates).find('.com_id').html();
			if (com_id == book_comid) {
				if (book_type == 0) {
					rateid = $(rates).find('td:nth-child(3)').get(0);
					buysellstatus = 1;
				}
				else if (book_type == 1) {
					rateid = $(rates).find('td:nth-child(2)').get(0);
					buysellstatus = 0;
				}
				return false;
			}
		});
		show_values(rateid, buysellstatus, 2, book_no);
	}
	else {
		trade_disable();
	}
}
function load_report(report_type) {
	if (report_type == 1) {
		var $ = jQuery.noConflict();

		$('#pendingdelv').css("display", "none");
		$('#reports').css({ "opacity": "0.5", "pointer-events": "none" });
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_trade_history").addClass("headings-active");
		try {
			var table = '';
			table += '<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date & Time</th><th>Commodity</th><th>Type</th><th>Qty</th><th>Rate</th><th>Del Qty</th><th>Pen Qty</th><th>Pen Amt</th><th>Book by</th><th>Status</th></tr><thead><tbody>';
			$.ajax({
				type: "POST",
				dataType: "json",
				url: SITE_BASE_URL + "index.php/C_trade/get_booking_report/trade_model/0",
				success: function (data) {
					$('#reports').css({ "opacity": "1", "pointer-events": "all" });

					var table_val = '';
					$.each(data[0], function (i) {

						var status = data[0][i]['bookstatus'];
						status = (status == 6 ? '<span class="label label-success bg-darkgreen font-label">Delivered</span>' : (status == 2 ? '<span class="label label-primary font-label">Waiting for approval</span>' : (status == 3 ? '<span class="label label-danger font-label">Rejected</span>' : (status == 1 ? '<span class="label label-success font-label">Confirmed</span>' : (status == 4 ? '<span class="label label-danger font-label">Limit Cancelled</span>' : (status == 5 ? '<span class="label label-success bg-darkgreen font-label">Partial Del</span>' : (status == 0 ? '<span class="label label-info font-label">Pending</span>' : (status == 7 ? '<span class="label bg-darkred">Expired</span>' : (status == 8 ? '<span class="label bg-darkred">Cancelled, Insufficient margin</span>' : "")))))))));

						table_val += '<tr><td>' + data[0][i]['book_no'] + '</td><td>' + data[0][i]['book_datetime'] + '</td><td>' + data[0][i]['com_name'] + '</td><td>' + data[0][i]['type'] + '</td><td>' + data[0][i]['qty'] + '</td><td>' + (IND_money_format(data[0][i]['book_rate'])) + '</td><td>' + data[0][i]['delivered_qty'] + '</td><td>' + data[0][i]['pending_qty'] + '</td><td>' + (IND_money_format(data[0][i]['pending_amt'])) + '</td><td>' + data[0][i]['book_by'] + '</td><td>' + status + '</td></tr>';
					});
					if (table_val == '') {
						table_val = '<tr><td colspan="11">No data available in table</td></tr>';
						row_length = false;
					}

					table += table_val;
					table += '</tbody>';
					table += '<table>';
					$('#reports').empty().append(table);
				},
				error: function (request, error) {
				}
			});
		} catch (ex) {
			console.log(ex);
		}
	}
	else if (report_type == 2) {
		var $ = jQuery.noConflict();
		$('#pendingdelv').css("display", "none");
		$('#reports').css({ "opacity": "0.5", "pointer-events": "none" });
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_pending_deal").addClass("headings-active");
		try {
			var table = '';
			table += '<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date & Time</th><th>Commodity</th><th> Type</th><th>Qty</th><th>Rate</th><th>Status</th><th>Edit</th></tr><thead><tbody>';
			$.ajax({
				type: "POST",
				dataType: "json",
				url: SITE_BASE_URL + "index.php/C_trade/get_pending_order/trade_model/0",
				success: function (data) {
					$('#reports').css({ "opacity": "1", "pointer-events": "all" });

					var table_val = '';
					var ratetr = '';
					$.each(data['bookingdata'], function (i) {
						status = '<span class="label label-info font-label">Pending</span>';

						table_val += '<tr ><td id="orderid">' + data['bookingdata'][i]['book_no'] + '</td><td>' + data['bookingdata'][i]['book_datetime'] + '</td><td >' + data['bookingdata'][i]['com_name'] + '</td><td>' + data['bookingdata'][i]['type'] + '</td><td>' + data['bookingdata'][i]['qty'] + '</td><td>' + (IND_money_format(data['bookingdata'][i]['book_rate'])) + '</td><td>' + status + '</td><td style="cursor:pointer;" onclick="edit_limit(' + data['bookingdata'][i]['book_comid'] + ',' + data['bookingdata'][i]['book_no'] + ',' + data['bookingdata'][i]['book_type'] + ')" title="Click here to edit"><label style="cursor:pointer;" for="" >Edit</label></td></tr>';
					});
					if (table_val == '') {
						table_val = '<tr><td colspan="9">No data available in table</td></tr>';
						row_length = false;
					}

					table += table_val;
					table += '</tbody>';
					table += '<table>';
					$('#reports').empty().append(table);


				},
				error: function (request, error) {
				}
			});
		} catch (ex) {
			console.log(ex);
		}
	}
	else if (report_type == 3) {
		$('#pendingdelv').css("display", "none");
		$('#reports').css({ "opacity": "0.5", "pointer-events": "none" });
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_transactions").addClass("headings-active");
		try {
			var table = '';
			table += '<table class="table table-bordered table-striped table-hover report_table">';
			table += '<thead><tr><th>Date & Time</th><th>Transaction Type</th><th >Credit</th><th>Debit</th><th>Closing Balance</th></tr></thead><tbody>';
			$.ajax({
				type: "POST",
				dataType: "json",
				url: SITE_BASE_URL + "index.php/C_trade/get_customertransactions/trade_model/",
				success: function (data) {
					$('#reports').css({ "opacity": "1", "pointer-events": "all" });
					var last_five = parseInt(data.length) - 5;
					var table_val = '';
					$.each(data, function (i, values) {
						if (parseInt(i) >= parseInt(last_five)) {
							table_val += '<tr><td>' + values.TransactionDate + '</td><td>' + values.TransactionType + '</td><td>' + values.Credit + '</td><td>' + values.Debit + '</td><td>' + values.balance + '</td></tr>';
						}
					});
					if (table_val == '') {
						table_val = '<tr><td colspan="5">No data available in table</td></tr>';
						row_length = false;
					}
					table += table_val;
					table += '</tbody>';
					table += '<table>';
					$('#reports').empty().append(table);
				},
				error: function (request, error) {
				}
			});
		} catch (ex) {
			console.log(ex);
		}
	}
	else if (report_type == 5) {
		var $ = jQuery.noConflict();
		$('#pendingdelv').css("display", "none");
		$('#reports').css({ "opacity": "0.5", "pointer-events": "none" });
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_tradable").addClass("headings-active");
		try {
			var table = '';
			table += '<table class="table table-bordered table-striped table-hover report_table">';
			table += '<thead><tr><th >Commodity</th><th style="text-align:center">Min. Order Qty</th><th style="text-align:center">Max. Order Qty</th><th style="text-align:center">Max. Allot Qty</th></tr></thead><tbody>';
			$.ajax({
				type: "POST",
				dataType: "json",
				url: SITE_BASE_URL + "index.php/C_trade/get_clientlimit/trade_model",
				success: function (data) {
					$('#reports').css({ "opacity": "1", "pointer-events": "all" });

					var table_val = '';

					table_val += '<tr><td>Gold</td><td>' + data[0]['gold_min_qty'] + '</td><td>' + data[0]['gold_max_qty'] + '</td><td>' + data[0]['gold_allot_qty'] + '</td></tr><tr><td>Silver</td><td>' + data[0]['silver_min_qty'] + '</td><td>' + data[0]['silver_max_qty'] + '</td><td>' + data[0]['silver_allot_qty'] + '</td></tr>';

					if (table_val == '') {
						table_val = '<tr><td colspan="2">No data available in table</td></tr>';
						row_length = false;
					}

					table += table_val;
					table += '</tbody></table>';
					$('#reports').empty().append(table);
				},
				error: function (request, error) {
				}
			});
		} catch (ex) {
			console.log(ex);
		}

	}
	else if (report_type == 6) {
		$('#pendingdelv').css("display", "block");
		$('#reports').css({ "opacity": "0.5", "pointer-events": "none" });
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_pendingdev").addClass("headings-active");
		try {
			var table = '';
			table += '<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date & Time</th><th>Commodity</th><th>Type</th><th>Qty</th><th>Rate</th><th>Pen Qty</th><th>Pen Amt</th></tr><thead><tbody>';
			$.ajax({
				type: "POST",
				dataType: "json",
				url: SITE_BASE_URL + "index.php/C_trade/pendingdelv_report/trade_model",
				success: function (data) {
					$('#reports').css({ "opacity": "1", "pointer-events": "all" });
					console.log(data['bookingdata']);
					var table_val = '';
					$.each(data['bookingdata'], function (i) {
						console.log(data['bookingdata'][i]);
						table_val += '<tr><td>' + data['bookingdata'][i]['bookno'] + '</td><td>' + data['bookingdata'][i]['bookdate'] + '</td><td>' + data['bookingdata'][i]['commodityname'] + '</td><td>' + data['bookingdata'][i]['book_type'] + '</td><td>' + data['bookingdata'][i]['bookqty'] + '</td><td>' + IND_money_format(data['bookingdata'][i]['book_rate']) + '</td><td>' + data['bookingdata'][i]['BalanceQty'] + '</td><td>' + IND_money_format(data['bookingdata'][i]['pending_amt']) + '</td></tr>';
					});
					if (table_val == '') {
						table_val = '<tr><td colspan="10">No data available in table</td></tr>';
						row_length = false;
					}

					table += table_val;
					table += '</tbody>';
					table += '<table>';
					$('#reports').empty().append(table);
					$("#qty_gold_buy").html(data['bookiingtotal']['qty_gold_buy']);
					$("#qty_gold_sell").html(data['bookiingtotal']['qty_gold_sell']);
					$("#qty_silver_buy").html(data['bookiingtotal']['qty_silver_buy']);
					$("#qty_silver_sell").html(data['bookiingtotal']['qty_silver_sell']);
					$("#amount_gold").html(data['bookiingtotal']['amount_gold']);
					$("#amount_silver").html(data['bookiingtotal']['amount_silver']);
					$("#amount_total").html(data['bookiingtotal']['amount_total']);
				},
				error: function (request, error) {
				}
			});
		} catch (ex) {
			console.log(ex);
		}
	}
}
function logout() {
	location.reload();
}
