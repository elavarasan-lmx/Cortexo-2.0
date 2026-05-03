var lastKnownState = {};

function flashCell($el, color) {
  if (!$el || $el.length === 0) return;
  clearTimeout($el.data('flashTimer'));
  $el.css({ 'color': '#FFFFFF', 'background-color': color });
  var timer = setTimeout(function () {
    $el.css({ 'color': '', 'background-color': '' });
  }, 1000);
  $el.data('flashTimer', timer);
}

function applyCachedRates() {
  var allData = Object.values(lastKnownState).join("\n");
  if (allData.length > 0) {
    OnSuccess(allData);
  }
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

  //socket.on("lmxtradeupdatecommodity:App\\Events\\LMXTRADECommodityUpdates", function(data){
  socket.on(comm_update, function (data) {
    commodity_update();
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
    var $ = jQuery.noConflict();
    $("#newsevents").html("");
    $("#newsevents").append('<marquee direction="up" onmouseover="this.stop();" onmouseout="this.start();" scrollamount="2" align="middle" style="height: 151px; padding-left: 2px;">' + data.updatedata.news + '</marquee>');
  });
});

// function commodity_update() {
//   var $ = jQuery.noConflict();
//   $.ajax({
//     url: SITE_BASE_URL + "index.php/C_booking/get_commodity_data",
//     type: "GET",
//     dataType: "json",
//     data: "",
//     async: false,
//     success: function (data) {
//       rpanelcontract = data.contracts;
//       if (data.commodity.commoditydetails.length > 0) {
//         $("#liveratetable tbody").empty();
//         $("#liveratetable_coin tbody").empty();
//       }
//       $.each(data.commodity.commoditydetails, function (idx, commodity) {
//         if (commodity.com_is_coin != 1) {
//           var tablerow = '<tr class="table1"><td class="ratevalue1">' + commodity.com_name + '</td><td class="ratevalue2"><span class="ratevalue_2" ></span></td><td class="ratevalue2"><span class="ratevalue_2"></span></td><td style="display:none;">' + commodity.deliverydays + '</td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div></td></tr>';
//           $("#liveratetable tbody").append(tablerow);
//         }
//         if (commodity.com_is_coin == 1) {
//           var tablerow = '<tr class="table1"><td class="ratevalue1">' + commodity.com_name + '</td><td ><span class="ratevalue2" ></span></td><td class="ratevalue_1"><span class="ratevalue2"></span></td><td style="display:none;">' + commodity.deliverydays + '</td><td style="display:none;"><div class="com_id">' + commodity.com_id + '</div><div class="com_type">' + commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">' + commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">' + commodity.com_buy_premium + '</div><div class="com_premium_type">' + commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">' + commodity.com_delverydays + '</div><div class="com_isregion">' + commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">' + commodity.com_roundoff + '</div></td></tr>';
//           $("#liveratetable_coin tbody").append(tablerow);
//         }
//       });
//     },
//     error: function (request, error) {
//       console.log(error);
//     }
//   });
// }

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

  ws = new WebSocket("ws://test.ganeshbullion.com/ws", [SOCKET_TOKEN]);

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

function commodity_update() {
  var $ = jQuery.noConflict();
  $.ajax({
    url: SITE_BASE_URL + "index.php/C_booking/get_commodity_data",
    type: "GET",
    dataType: "json",
    data: "",
    async: false,
    success: function (data) {
      // console.log(data, 'data');
      // console.log("commodityDetails", data.commodity.commoditydetails);
      // console.log("ContractDetails", data.contracts);
      rpanelcontract = data.contracts;
      if (data.commodity.commoditydetails.length > 0) {
        $("#liveratetable tbody").empty();
        $("#liveratetable_coin tbody").empty();
        rpanelcommodities = data.commodity.rpanel_commodities;
      }
      $.each(data.commodity.commoditydetails, function (idx, commodity) {
        // console.log(commodity, 'commodity');

        if (commodity.com_is_coin != 1 && (commodity.cus_com_sell == 1 || commodity.cus_com_buy == 1)) {
          var tablerow =
            '<tr class="table1" id="liverates">' +
            '<td class="com_name">' + commodity.com_name + '</td>' +
            '<td class="ratevalue2"><span class="ratevalue_2"></span></td>' +
            '<td class="ratevalue2"><span class="ratevalue_2"></span></td>' +
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
  var $ = jQuery.noConflict();
  $.ajax({
    url: SITE_BASE_URL + "index.php/C_booking/get_rpanel_data",
    type: "GET",
    dataType: "json",
    data: "",
    async: false,
    success: function (data) {

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
//   if (document.hidden) {
//     if (oInterval) {
//       clearInterval(oInterval);
//       oInterval = null;
//       //console.log("Paused refresh due to tab inactivity");
//     }
//     if (rate_socket) {
//       rate_socket.disconnect();
//     }
//   } else {
//     if (bcrateType == 2) {
//       rate_socket.connect();
//     } else {
//       fnStartClock();
//       // rate_socket.on("rateUpdate", (rate) => { OnSuccess(rate.rate); });
//     }
//     //console.log("Resumed refresh due to tab activation");
//   }
// });
// Optional: clean up on unload
// window.addEventListener('beforeunload', () => {
//   if (oInterval) {
//     clearInterval(oInterval);
//   }
//   if (rate_socket) {
//     rate_socket.disconnect();
//   }
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
//   //console.log("Onsuccess");
//   try {
//     var $ = jQuery.noConflict();
//     //console.log("Onsuccesstry");
//     var datetime = getCurrentDateTime();

//     var messagesDesktopp = "";
//     messagesDesktopp = data.split("\n");
//     //alert(messagesDesktopp.length);
//     if (typeof oldData == 'undefined') {
//       oldData = data.toString();
//     }
//     var messagesOldDesktop = oldData.split("\n");
//     for (var i = 0; i < messagesDesktopp.length; i++) {
//       var retDesktop = messagesDesktopp[i].split("\t");
//       var oldRetDesktop;
//       if (messagesOldDesktop[i] != undefined)
//         oldRetDesktop = messagesOldDesktop[i].split("\t");
//       if (typeof retDesktop[1] != 'undefined') {
//         if (retDesktop[0] == 3) {
//           $("#liveratetable").find('tbody > tr').each(function (i, el) {
//             var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
//               com_type = parseInt($(this).find('td:last div:eq(1)').html()),
//               com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
//               com_other_charges = parseInt($(this).find('td:last div:eq(4)').html()),
//               com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
//               com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
//               com_roundoff = parseFloat($(this).find('td:last div:eq(26)').html()),
//               prem_sel_premium = parseFloat($(this).find('td:last div:eq(44)').html()),
//               prem_buy_premium = parseFloat($(this).find('td:last div:eq(45)').html()),
//               prem_comsell_active = parseFloat($(this).find('td:last div:eq(46)').html()),
//               prem_combuy_active = parseFloat($(this).find('td:last div:eq(47)').html());
//             if (retDesktop[1] == com_id) {
//               // var selling_rate = retDesktop[4];
//               // var buying_rate = retDesktop[3];
//               // if (com_sel_active == 0) {
//               //   selling_rate = '-';
//               // }
//               // if (com_buy_active == 0) {
//               //   buying_rate = '-';
//               // }
//               if (retDesktop[4] != '-') {
//                 var selling_rate = (com_sel_active && prem_comsell_active) ? (parseFloat(retDesktop[4]) - parseFloat(prem_sel_premium)).toFixed(com_roundoff) /* + parseFloat(com_other_charges) */ : '-';
//               } else {
//                 var selling_rate = '-';
//               }
//               if (retDesktop[3] != '-') {
//                 var buying_rate = (com_buy_active && prem_combuy_active) ? (parseFloat(retDesktop[3]) - parseFloat(prem_buy_premium)).toFixed(com_roundoff) : '-';
//               } else {
//                 var buying_rate = '-';
//               }
//               if (buying_rate > parseFloat($(this).find('td:eq(1) span:eq(0)').html())) {
//                 $(this).find('td:eq(1) span:eq(0)').css('color', '#FFFFFF');
//                 $(this).find('td:eq(1) span:eq(0)').css('background-color', '#008000');
//               } else if (buying_rate < parseFloat($(this).find('td:eq(1) span:eq(0)').html())) {
//                 $(this).find('td:eq(1) span:eq(0)').css('color', '#FFFFFF');
//                 $(this).find('td:eq(1) span:eq(0)').css('background-color', '#FF0000');
//               } else {
//                 $(this).find('td:eq(1) span:eq(0)').css('color', '');
//                 $(this).find('td:eq(1) span:eq(0)').css('background-color', '');
//               }
//               $(this).find('td:eq(1) span:eq(0)').html(buying_rate);


//               if (selling_rate > parseFloat($(this).find('td:eq(2) span:eq(0)').html())) {
//                 $(this).find('td:eq(2) span:eq(0)').css('color', '#FFFFFF');
//                 $(this).find('td:eq(2) span:eq(0)').css('background-color', '#008000');
//               } else if (selling_rate < parseFloat($(this).find('td:eq(2) span:eq(0)').html())) {
//                 $(this).find('td:eq(2) span:eq(0)').css('color', '#FFFFFF');
//                 $(this).find('td:eq(2) span:eq(0)').css('background-color', '#FF0000');
//               } else {
//                 $(this).find('td:eq(2) span:eq(0)').css('color', '');
//                 $(this).find('td:eq(2) span:eq(0)').css('background', '');
//               }
//               $(this).find('td:eq(2) span:eq(0)').html(selling_rate);
//             }
//           });

//           $("#liveratetable_coin").find('tbody > tr').each(function (i, el) {
//             var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
//               com_type = parseInt($(this).find('td:last div:eq(1)').html()),
//               com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
//               com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
//               com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
//               prem_comsell_active = parseFloat($(this).find('td:last div:eq(42)').html()),
//               prem_combuy_active = parseFloat($(this).find('td:last div:eq(43)').html());
//             if (retDesktop[1] == com_id) {
//               var selling_rate = retDesktop[4];
//               var buying_rate = retDesktop[3];
//               if (com_sel_active == 0) {
//                 selling_rate = '-';
//               }
//               if (com_buy_active == 0) {
//                 buying_rate = '-';
//               }
//               if (buying_rate > parseFloat($(this).find('td:eq(1) span').html())) {
//                 $(this).find('td:eq(1) span').css('color', '#FFFFFF');
//                 $(this).find('td:eq(1) span').css('background-color', '#008000');
//               } else if (buying_rate < parseFloat($(this).find('td:eq(1) span').html())) {
//                 $(this).find('td:eq(1) span').css('color', '#FFFFFF');
//                 $(this).find('td:eq(1) span').css('background-color', '#FF0000');
//               } else {
//                 $(this).find('td:eq(1) span').css('color', '');
//                 $(this).find('td:eq(1) span').css('background-color', '');
//               }
//               $(this).find('td:eq(1) span').html(buying_rate);
//               if (selling_rate > parseFloat($(this).find('td:eq(2) span').html())) {
//                 $(this).find('td:eq(2) span').css('color', '#FFFFFF');
//                 $(this).find('td:eq(2) span').css('background-color', '#008000');
//               } else if (selling_rate < parseFloat($(this).find('td:eq(2) span').html())) {
//                 $(this).find('td:eq(2) span').css('color', '#FFFFFF');
//                 $(this).find('td:eq(2) span').css('background-color', '#FF0000');
//               } else {
//                 $(this).find('td:eq(2) span').css('color', '');
//                 $(this).find('td:eq(2) span').css('background', '');
//               }
//               $(this).find('td:eq(2) span').html(selling_rate);
//             }
//           });

//         }
//       }
//     }

//     $("#liveratetable2 tbody").empty();
//     for (var i = 0; i < messagesDesktopp.length; i++) {
//       var retDesktop = messagesDesktopp[i].split("\t");
//       var oldRetDesktop;
//       oldRetDesktop = messagesOldDesktop[i].split("\t");
//       //console.log(oldRetDesktop);
//       if (typeof retDesktop[1] != 'undefined' && (retDesktop[0] == 4 || retDesktop[0] == 1 || retDesktop[0] == 2)) {
//         if (retDesktop[0] == 4) {
//           if ((retDesktop[3] == 0 || retDesktop[4] == 1)) {
//             market_status = 0;
//             if (retDesktop[3] == 0) {
//               document.getElementById("onoffmessage").style.display = "block";
//               document.getElementById("messagebox").style.display = "none";
//               document.getElementById("divrate").style.display = "none";
//             } else if (retDesktop[4] == 1) {
//               document.getElementById("onoffmessage").style.display = "none";
//               document.getElementById("divrate").style.display = "none";
//               document.getElementById("messagebox").style.display = "block";
//               $("#messageboxtext").html(retDesktop[5]);
//             }
//           } else {
//             market_status = 1;
//             document.getElementById("onoffmessage").style.display = "none";
//             document.getElementById("messagebox").style.display = "none";
//             document.getElementById("divrate").style.display = "block";
//           }
//         }
//         /* if(market_status == 1){
//           if(retDesktop[0] == 3){

//           }
//         } */
//         if (retDesktop[0] == 1) {
//           if (retDesktop[1] == "SPOT-GOLD") {
//             if (retDesktop[3] > $("#gold_bid").html()) {
//               $("#gold_bid").css('color', '#FFFFFF');
//               $("#gold_bid").css('background-color', '#008000');
//             } else if (retDesktop[3] < $("#gold_bid").html()) {
//               $("#gold_bid").css('color', '#FFFFFF');
//               $("#gold_bid").css('background-color', '#FF0000');
//             } else {
//               $("#gold_bid").css('color', '');
//               $("#gold_bid").css('background-color', '');
//             }
//             $("#gold_bid").html(parseFloat(retDesktop[3]).toFixed(2));
//             if (retDesktop[4] > $("#gold_ask").html()) {
//               $("#gold_ask").css('color', '#FFFFFF');
//               $("#gold_ask").css('background-color', '#008000');
//             } else if (retDesktop[4] < $("#gold_ask").html()) {
//               $("#gold_ask").css('color', '#FFFFFF');
//               $("#gold_ask").css('background-color', '#FF0000');
//             } else {
//               $("#gold_ask").css('color', '');
//               $("#gold_ask").css('background-color', '');
//             }
//             $("#gold_ask").html(parseFloat(retDesktop[4]).toFixed(2));
//             if (retDesktop[5] > $(".gold_high").html()) {
//               $(".gold_high").css('color', '#FFFFFF');
//               $(".gold_high").css('background-color', '#008000');
//             } else if (retDesktop[5] < $(".gold_high").html()) {
//               $(".gold_high").css('color', '#FFFFFF');
//               $(".gold_high").css('background-color', '#FF0000');
//             } else {
//               $(".gold_high").css('color', '');
//               $(".gold_high").css('background-color', '');
//             }
//             $(".gold_high").html(parseFloat(retDesktop[5]).toFixed(2));
//             if (retDesktop[6] > $(".gold_low").html()) {
//               $(".gold_low").css('color', '#FFFFFF');
//               $(".gold_low").css('background-color', '#008000');
//             } else if (retDesktop[6] < $(".gold_low").html()) {
//               $(".gold_low").css('color', '#FFFFFF');
//               $(".gold_low").css('background-color', '#FF0000');
//             } else {
//               $(".gold_low").css('color', '');
//               $(".gold_low").css('background-color', '');
//             }
//             $(".gold_low").html(parseFloat(retDesktop[6]).toFixed(2));
//           } else if (retDesktop[1] == "SPOT-SILVER") {
//             if (retDesktop[3] > $("#silver_bid").html()) {
//               $("#silver_bid").css('color', '#FFFFFF');
//               $("#silver_bid").css('background-color', '#008000');
//             } else if (retDesktop[3] < $("#silver_bid").html()) {
//               $("#silver_bid").css('color', '#FFFFFF');
//               $("#silver_bid").css('background-color', '#FF0000');
//             } else {
//               $("#silver_bid").css('color', '');
//               $("#silver_bid").css('background-color', '');
//             }
//             $("#silver_bid").html(parseFloat(retDesktop[3]).toFixed(2));
//             if (retDesktop[4] > $("#silver_ask").html()) {
//               $("#silver_ask").css('color', '#FFFFFF');
//               $("#silver_ask").css('background-color', '#008000');
//             } else if (retDesktop[4] < $("#silver_ask").html()) {
//               $("#silver_ask").css('color', '#FFFFFF');
//               $("#silver_ask").css('background-color', '#FF0000');
//             } else {
//               $("#silver_ask").css('color', '');
//               $("#silver_ask").css('background-color', '');
//             }
//             $("#silver_ask").html(parseFloat(retDesktop[4]).toFixed(2));
//             if (retDesktop[5] > $(".silver_high").html()) {
//               $(".silver_high").css('color', '#FFFFFF');
//               $(".silver_high").css('background-color', '#008000');
//             } else if (retDesktop[5] < $(".silver_high").html()) {
//               $(".silver_high").css('color', '#FFFFFF');
//               $(".silver_high").css('background-color', '#FF0000');
//             } else {
//               $(".silver_high").css('color', '');
//               $(".silver_high").css('background-color', '');
//             }
//             $(".silver_high").html(parseFloat(retDesktop[5]).toFixed(2));
//             if (retDesktop[6] > $(".silver_low").html()) {
//               $(".silver_low").css('color', '#FFFFFF');
//               $(".silver_low").css('background-color', '#008000');
//             } else if (retDesktop[6] < $(".silver_low").html()) {
//               $(".silver_low").css('color', '#FFFFFF');
//               $(".silver_low").css('background-color', '#FF0000');
//             } else {
//               $(".silver_low").css('color', '');
//               $(".silver_low").css('background-color', '');
//             }
//             $(".silver_low").html(parseFloat(retDesktop[6]).toFixed(2));
//           } else if (retDesktop[1] == "SPOT-INR") {

//             if (retDesktop[3] > $("#inr_bid").html()) {
//               $("#inr_bid").css('color', '#FFFFFF');
//               $("#inr_bid").css('background-color', '#008000');
//             } else if (retDesktop[3] < $("#inr_bid").html()) {
//               $("#inr_bid").css('color', '#FFFFFF');
//               $("#inr_bid").css('background-color', '#FF0000');
//             } else {
//               $("#inr_bid").css('color', '');
//               $("#inr_bid").css('background-color', '');
//             }
//             $("#inr_bid").html(parseFloat(retDesktop[3]).toFixed(2));
//             if (retDesktop[4] > $("#inr_ask").html()) {
//               $("#inr_ask").css('color', '#FFFFFF');
//               $("#inr_ask").css('background-color', '#008000');
//             } else if (retDesktop[4] < $("#inr_ask").html()) {
//               $("#inr_ask").css('color', '#FFFFFF');
//               $("#inr_ask").css('background-color', '#FF0000');
//             } else {
//               $("#inr_ask").css('color', '');
//               $("#inr_ask").css('background-color', '');
//             }
//             $("#inr_ask").html(parseFloat(retDesktop[4]).toFixed(2));
//             if (retDesktop[5] > $(".inr_high").html()) {
//               $(".inr_high").css('color', '#FFFFFF');
//               $(".inr_high").css('background-color', '#008000');
//             } else if (retDesktop[5] < $(".inr_high").html()) {
//               $(".inr_high").css('color', '#FFFFFF');
//               $(".inr_high").css('background-color', '#FF0000');
//             } else {
//               $(".inr_high").css('color', '');
//               $(".inr_high").css('background-color', '');
//             }
//             $(".inr_high").html(parseFloat(retDesktop[5]).toFixed(2));
//             if (retDesktop[6] > $(".inr_low").html()) {
//               $(".inr_low").css('color', '#FFFFFF');
//               $(".inr_low").css('background-color', '#008000');
//             } else if (retDesktop[6] < $(".inr_low").html()) {
//               $(".inr_low").css('color', '#FFFFFF');
//               $(".inr_low").css('background-color', '#FF0000');
//             } else {
//               $(".inr_low").css('color', '');
//               $(".inr_low").css('background-color', '');
//             }
//             $(".inr_low").html(parseFloat(retDesktop[6]).toFixed(2));
//           }
//         }
//         if (retDesktop[0] == 2) {
//           var mcxbidid = "mcxbidnew-" + i;
//           var mcxaskid = "mcxasknew-" + i;
//           var mcxhighid = "mcxhighnew-" + i;
//           var mcxlowid = "mcxlownew-" + i;
//           var tablerow = '<tr class="table1"><td class="" id="mcxdesc">' + retDesktop[2] + '</td><td class="ratevalue2"><span class="highlow ratevalue_2" id="' + mcxbidid + '">' + retDesktop[3] + '</span><div class="visible-xs highlow"><span class="ratevalue_2 redround high" id="' + mcxhighid + '">' + retDesktop[5] + '</span></div></td><td class="ratevalue2"><span class="highlow ratevalue_2" id="' + mcxaskid + '">' + retDesktop[4] + '</span><div class="visible-xs highlow"><span class="ratevalue_2 redround high" id="' + mcxlowid + '">' + retDesktop[6] + '</span></div></td><td class="highlow hidden-xs"><span><span class="ratevalue_2 redround high" id="' + mcxhighid + '">' + retDesktop[5] + '</span></span></td><td class="highlow hidden-xs"><span ><span class="ratevalue_2 redround low" id="' + mcxlowid + '">' + retDesktop[6] + '</span></span></td></tr>';

//           /* var tablerow ='<th></th><th width="34%" class="ratevalue"><div id="mcxdesc">'+retDesktop[2]+'</div><div class="ratevalue_rate"><span class="bidvalue" id="'+mcxbidid+'">'+retDesktop[3]+'</span> | <span id="'+mcxaskid+'">'+retDesktop[4]+'</span><br><div class="highlowvalue">H: <span id="'+mcxhighid+'">'+retDesktop[5]+'</span> | L: <span id="'+mcxlowid+'">'+retDesktop[6]+'</span></div></div></th><th></th>'; */
//           $("#liveratetable2 tbody").append(tablerow);

//           if (oldRetDesktop[1] == retDesktop[1]) {
//             if (parseInt(oldRetDesktop[3]) > parseInt(retDesktop[3])) {
//               $("#" + mcxbidid).css('color', '#FFFFFF');
//               $("#" + mcxbidid).css('background-color', '#FF0000');
//             } else if (parseInt(oldRetDesktop[3]) < parseInt(retDesktop[3])) {
//               $("#" + mcxbidid).css('color', '#FFFFFF');
//               $("#" + mcxbidid).css('background-color', '#008000');
//             } else {
//               $("#" + mcxbidid).css('color', '');
//               $("#" + mcxbidid).css('background-color', '');
//             }
//             if (parseInt(oldRetDesktop[4]) > parseInt(retDesktop[4])) {
//               $("#" + mcxaskid).css('color', '#FFFFFF');
//               $("#" + mcxaskid).css('background-color', '#FF0000');
//             } else if (parseInt(oldRetDesktop[4]) < parseInt(retDesktop[4])) {
//               $("#" + mcxaskid).css('color', '#FFFFFF');
//               $("#" + mcxaskid).css('background-color', '#008000');
//             } else {
//               $("#" + mcxaskid).css('color', '');
//               $("#" + mcxaskid).css('background-color', '');
//             }
//             if (parseInt(oldRetDesktop[5]) > parseInt(retDesktop[5])) {
//               $("#" + mcxhighid).css('color', '#FFFFFF');
//               $("#" + mcxhighid).css('background-color', '#FF0000');
//             } else if (parseInt(oldRetDesktop[5]) < parseInt(retDesktop[5])) {
//               $("#" + mcxhighid).css('color', '#FFFFFF');
//               $("#" + mcxhighid).css('background-color', '#008000');
//             } else {
//               $("#" + mcxhighid).css('color', '');
//               $("#" + mcxhighid).css('background-color', '');
//             }
//             if (parseInt(oldRetDesktop[6]) > parseInt(retDesktop[6])) {
//               $("#" + mcxlowid).css('color', '#FFFFFF');
//               $("#" + mcxlowid).css('background-color', '#FF0000');
//             } else if (parseInt(oldRetDesktop[6]) < parseInt(retDesktop[6])) {
//               $("#" + mcxlowid).css('color', '#FFFFFF');
//               $("#" + mcxlowid).css('background-color', '#008000');
//             } else {
//               $("#" + mcxlowid).css('color', '');
//               $("#" + mcxlowid).css('background-color', '');
//             }
//           }
//         }
//       }
//     }

//     oldData = data.toString();

//   } catch (e) {
//   }
// }
// Last bid/ask cache for MCX color flash
var lastMCXBid = {};
var lastMCXAsk = {};

function OnSuccess(data, status) {
  try {
    var $ = jQuery.noConflict();
    var lines = data.split("\n");

    // NOTE: do NOT empty liveratetable2 here — MCX rows use stable IDs and update in-place

    for (var i = 0; i < lines.length; i++) {
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

            var $buySpan = $(this).find('td:eq(1) span:eq(0)');
            var prevBuy = parseFloat($buySpan.html());
            var buyF = parseFloat(buying_rate);
            if (!isNaN(buyF) && buyF > prevBuy) { flashCell($buySpan, '#008000'); }
            else if (!isNaN(buyF) && buyF < prevBuy) { flashCell($buySpan, '#FF0000'); }
            $buySpan.html(buying_rate);

            var $sellSpan = $(this).find('td:eq(2) span:eq(0)');
            var prevSell = parseFloat($sellSpan.html());
            var sellF = parseFloat(selling_rate);
            if (!isNaN(sellF) && sellF > prevSell) { flashCell($sellSpan, '#008000'); }
            else if (!isNaN(sellF) && sellF < prevSell) { flashCell($sellSpan, '#FF0000'); }
            $sellSpan.html(selling_rate);
          }
        });

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

            var $buySpan = $(this).find('td:eq(1) span');
            var prevBuy = parseFloat($buySpan.html());
            var buyF2 = parseFloat(buying_rate);
            if (!isNaN(buyF2) && buyF2 > prevBuy) { flashCell($buySpan, '#008000'); }
            else if (!isNaN(buyF2) && buyF2 < prevBuy) { flashCell($buySpan, '#FF0000'); }
            $buySpan.html(buying_rate);

            var $sellSpan = $(this).find('td:eq(2) span');
            var prevSell = parseFloat($sellSpan.html());
            var sellF2 = parseFloat(selling_rate);
            if (!isNaN(sellF2) && sellF2 > prevSell) { flashCell($sellSpan, '#008000'); }
            else if (!isNaN(sellF2) && sellF2 < prevSell) { flashCell($sellSpan, '#FF0000'); }
            $sellSpan.html(selling_rate);
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

        if ($("#" + mcxbidid).length === 0) {
          // First time — create the row
          var hi_init = high_val !== undefined ? high_val : '-';
          var lo_init = low_val !== undefined ? low_val : '-';
          var mobile_mcxhighid = "mobile-mcxhigh-" + symName;
          var mobile_mcxlowid = "mobile-mcxlow-" + symName;

          var tablerow = '<tr class="table1" data-sym="' + symName + '">' +
            '<td id="mcxdesc-' + symName + '" class="name-cell">' + symName + '</td>' +
            '<td class="ratevalue2"><span class="highlow ratevalue_2 val-text" id="' + mcxbidid + '">' + bid_val + '</span> <span class="visible-xs mobile-highlow" id="' + mobile_mcxhighid + '">H: ' + hi_init + '</span></td>' +
            '<td class="ratevalue2"><span class="highlow ratevalue_2 val-text" id="' + mcxaskid + '">' + ask_val + '</span> <span class="visible-xs mobile-highlow" id="' + mobile_mcxlowid + '">L: ' + lo_init + '</span></td>' +
            '<td class="highlow hidden-xs"><span class="ratevalue_2 redround high high-box" id="' + mcxhighid + '">' + hi_init + '</span></td>' +
            '<td class="highlow hidden-xs"><span class="ratevalue_2 redround low low-box"  id="' + mcxlowid + '">' + lo_init + '</span></td>' +
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

        } else if (sym1 == 'R') {
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

      // ---- TYPE 4: market status — 4|market_status|closed_status|message ----
      if (r[0] == 4) {
        if (r[1] == 0 || r[2] == 1) {
          if (r[1] == 0) {
            document.getElementById("onoffmessage").style.display = "block";
            document.getElementById("messagebox").style.display = "none";
            document.getElementById("divrate").style.display = "none";
          } else if (r[2] == 1) {
            document.getElementById("onoffmessage").style.display = "none";
            document.getElementById("divrate").style.display = "none";
            document.getElementById("messagebox").style.display = "block";
            $("#messageboxtext").html(r[3]);
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
    // rate_socket.on("rateUpdate", (rate) => { OnSuccess(rate.rate); });
    connectRateSocket();
  } else {
    fnStartClock();
  }
});

// (function () {
// 	var $ = jQuery.noConflict();
//     var callback = function() {
// 				if($('#gold_bid').html() == null || isNaN($('#gold_bid').html() || isNaN($('#s_mcx_bid').html()) || isNaN($('#g_mcx_bid').html()) || isNaN($('#mcx_bid').html()))) {
// 					return 0;
// 				}
// 				var market_closed = $(".market_closed").html();
// 				var rate_display = parseInt($(".rate_display").html());

// 				if(market_closed != 1 && rate_display !=0){
// 					$("#liveratetable").find('tbody > tr').each(function (i, el) {
// 						var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
// 						 com_type = parseInt($(this).find('td:last div:eq(1)').html()),
// 						 com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
// 						 com_other_charges = parseFloat($(this).find('td:last div:eq(3)').html()),
// 						 com_correction_type = parseFloat($(this).find('td:last div:eq(4)').html()),
// 						 com_sel_premium = parseFloat($(this).find('td:last div:eq(5)').html()),
// 						 com_buy_premium = parseFloat($(this).find('td:last div:eq(6)').html()),
// 						 com_premium_type = parseInt($(this).find('td:last div:eq(7)').html()),
// 						 com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
// 						 com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
// 						 com_delverydays = parseInt($(this).find('td:last div:eq(10)').html()),
// 						 com_isregion = parseInt($(this).find('td:last div:eq(11)').html()),
// 						 com_calpurity = parseFloat($(this).find('td:last div:eq(12)').html()),
// 						 com_tax = parseFloat($(this).find('td:last div:eq(13)').html()),
// 						 com_octroi = parseFloat($(this).find('td:last div:eq(14)').html()),
// 						 com_stamduty = parseFloat($(this).find('td:last div:eq(15)').html()),
// 						 deliverydays = parseFloat($(this).find('td:last div:eq(16)').html()),
// 						 displyname = parseFloat($(this).find('td:last div:eq(17)').html()),
// 						 mcxsymbol = parseFloat($(this).find('td:last div:eq(18)').html()),
// 						 banksymbol = parseFloat($(this).find('td:last div:eq(19)').html()),
// 						 rcomid = parseFloat($(this).find('td:last div:eq(20)').html()),
// 						 trade_type = parseFloat($(this).find('td:last div:eq(21)').html()),
// 						 sell_diff = parseFloat($(this).find('td:last div:eq(22)').html()),
// 						 buy_diff = parseFloat($(this).find('td:last div:eq(23)').html()),
// 						 sell_rate = parseFloat($(this).find('td:last div:eq(24)').html()),
// 						 com_display_purity = parseFloat($(this).find('td:last div:eq(25)').html()),
// 						 com_is_coin = parseFloat($(this).find('td:last div:eq(26)').html()),
// 						 com_roundoff = parseFloat($(this).find('td:last div:eq(27)').html());
// 						 var selling_rate = 0;
// 						 var buying_rate  = 0;
// 						if(com_is_coin != 1){
// 							if(com_premium_type == 1){
// 								selling_rate = parseFloat(com_sel_premium).toFixed(2);
// 								buying_rate  = parseFloat(com_buy_premium).toFixed(2);
// 							}else{
// 							 /* Commodity Rate Calculation Start Here*/
// 								$.each(rpanelcommodities, function(rckey, rcval) {
// 									if(rcomid == rcval.comid){
// 										if(rcval.tradetype == 0){
// 											var baseask = (parseFloat($("#"+rcval.mcxcontract+"_ask").html()) + parseFloat(rcval.selldiff)).toFixed(2);
// 											if(com_isregion == 1) {
// 												if(com_calpurity == 0) { //if purity = 995
// 													baseask = baseask / 0.995;
// 												} else { //if purity = 999 OR 9999
// 													baseask = baseask / 1;
// 												}
// 												//rate1 = rate + (rate * tax/100) Tax calculation
// 												baseask +=(baseask *  (com_tax / 100));
// 												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 												baseask +=(baseask *  (com_octroi / 100));
// 												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 												baseask +=(baseask *  (com_stamduty / 100));
// 											}
// 											else {
// 												if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 													var purity = 100;
// 												} else {
// 													var purity = com_display_purity;
// 												}
// 												baseask = baseask * (purity / 100);
// 											}
// 											var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight) : silver_conversion(baseask, com_weight);
// 											selling_rate = manual_roundoff(selling_con, com_correction_type, 'ask');
// 											buying_rate = (parseFloat($("#"+rcval.mcxcontract+"_bid").html()) - rcval.buydiff).toFixed(2);
// 											if(com_isregion == 1) {
// 												if(com_calpurity == 0) { //if purity = 995
// 													buying_rate = buying_rate / 0.995;
// 												} else { //if purity = 999 OR 9999
// 													buying_rate = buying_rate / 1;
// 												}
// 												//rate1 = rate + (rate * tax/100) Tax calculation
// 												buying_rate +=(buying_rate *  (com_tax / 100));
// 												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 												buying_rate +=(buying_rate *  (com_octroi / 100));
// 												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 												buying_rate +=(buying_rate *  (com_stamduty / 100));
// 											}
// 											else {
// 												if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 													var purity = 100;
// 												} else {
// 													var purity = com_display_purity;
// 												}
// 												buying_rate = buying_rate * (purity / 100);
// 											}
// 											buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
// 											buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
// 										}else if(rcval.tradetype == 1){
// 											/*For Gold Bank Rate Calculation Start Here*/
// 											var bank_kgrate = 0;
// 											$.each(rpanelbankrates, function(rbkey, rbval) {
// 												if(rcval.bcontract_id == rbval.bcontract_id){
// 													bank_kgrate = parseFloat((isNaN(parseFloat($("#"+rbval.bcontract_rate+"_ask").html())) ? 0 : parseFloat($("#"+rbval.bcontract_rate+"_ask").html()) + parseFloat(rbval.premium) + parseFloat(rbval.askdiff)) * ((isNaN($("#SPOT-INR_ask").html())) ? 0 : parseFloat($("#SPOT-INR_ask").html()) + parseFloat(rbval.rupeepremium))).toFixed(2);
// 													if(parseInt(rbval.bconvert_value_type) == 1)
// 														bank_kgrate =  parseFloat(bank_kgrate + parseFloat(rbval.bconvert_value)).toFixed(2);
// 													else if(parseInt(rbval.bconvert_value_type) == 2)
// 														bank_kgrate =  parseFloat(bank_kgrate - parseFloat(rbval.bconvert_value)).toFixed(2);
// 													else if(parseInt(rbval.bconvert_value_type) == 3)
// 														bank_kgrate =  parseFloat(bank_kgrate * parseFloat(rbval.bconvert_value)).toFixed(2);
// 													else if(parseInt(rbval.bconvert_value_type) == 4)
// 														bank_kgrate =  parseFloat(bank_kgrate / parseFloat(rbval.bconvert_value)).toFixed(2);
// 													if(parseFloat(rbval.bextra_charges) > 0){
// 														if(parseInt(rbval.bextra_type) == 1){
// 															bank_kgrate = parseFloat(bank_kgrate + parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}else if(parseInt(rbval.bextra_type) == 2){
// 															bank_kgrate = parseFloat(bank_kgrate - parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}else if(parseInt(rbval.bextra_type) == 3){
// 															bank_kgrate = parseFloat(bank_kgrate * parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}if(parseInt(rbval.bextra_type) == 4){
// 															bank_kgrate = parseFloat(bank_kgrate / parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}
// 													}

// 													bank_kgrate = parseFloat(bank_kgrate) + parseFloat(rbval.custom);
// 													if(parseFloat(rbval.btax_value) > 0){
// 														if(parseInt(rbval.btax_type) == 1){
// 															bank_kgrate = parseFloat((bank_kgrate * ((100 + parseFloat(rbval.btax_value)) / 100))).toFixed(2);
// 														}else if(parseInt(rbval.btax_type) == 2){
// 															bank_kgrate = parseFloat((bank_kgrate + parseFloat(rbval.btax_value))).toFixed(2);
// 														}
// 													}
// 													if(parseInt(rbval.pure) == 1){
// 														bank_kgrate = parseFloat(bank_kgrate / 0.995).toFixed(2);
// 													}
// 													var bankrate = parseInt(rcval.comtype) == 0 ? gold_spotrateconversion(bank_kgrate, 10) : bank_kgrate;
// 													var baseask = (parseFloat(bankrate) + parseFloat(rcval.selldiff)).toFixed(2);
// 													if(com_isregion == 1) {
// 														if(com_calpurity == 0) { //if purity = 995
// 															baseask = baseask / 0.995;
// 														} else { //if purity = 999 OR 9999
// 															baseask = baseask / 1;
// 														}
// 														//rate1 = rate + (rate * tax/100) Tax calculation
// 														baseask +=(baseask *  (com_tax / 100));
// 														//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 														baseask +=(baseask *  (com_octroi / 100));
// 														//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 														baseask +=(baseask *  (com_stamduty / 100));
// 													}
// 													else {
// 														if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 															var purity = 100;
// 														} else {
// 															var purity = com_display_purity;
// 														}
// 														baseask = baseask * (purity / 100);
// 													}
// 													var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight): silver_conversion(baseask, com_weight);
// 													selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

// 													buying_rate = (parseFloat(bankrate) - rcval.buydiff).toFixed(2);
// 													if(com_isregion == 1) {
// 														if(com_calpurity == 0) { //if purity = 995
// 															buying_rate = buying_rate / 0.995;
// 														} else { //if purity = 999 OR 9999
// 															buying_rate = buying_rate / 1;
// 														}
// 														//rate1 = rate + (rate * tax/100) Tax calculation
// 														buying_rate +=(buying_rate *  (com_tax / 100));
// 														//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 														buying_rate +=(buying_rate *  (com_octroi / 100));
// 														//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 														buying_rate +=(buying_rate *  (com_stamduty / 100));
// 													}
// 													else {
// 														if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 															var purity = 100;
// 														} else {
// 															var purity = com_display_purity;
// 														}
// 														buying_rate = buying_rate * (purity / 100);
// 													}
// 													buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
// 													buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
// 												}
// 											});	
// 										 /*For Gold Bank Rate Calculation End Here*/
// 										}else if(rcval.tradetype == 2){
// 											var sellrate = rcval.sellrate;
// 											//Calculating Purity, Tax, Octroi and stamp duty if commodity type is region
// 											if(com_isregion == 1) {
// 												//rate = Base rate / purity
// 												if(com_calpurity == 0) { //if purity = 995
// 													sellrate = sellrate / 0.995;
// 												} else { //if purity = 999 OR 9999
// 													sellrate = sellrate / 1;
// 												}
// 												//rate1 = rate + (rate * tax/100) Tax calculation
// 												sellrate +=(sellrate *  (com_tax / 100));
// 												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 												sellrate +=(sellrate *  (com_octroi / 100));
// 												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 												sellrate +=(sellrate *  (com_stamduty / 100));
// 											}
// 											var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(sellrate, com_weight) : silver_conversion(sellrate, com_weight);
// 											selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

// 											var buying_con = parseInt(rcval.comtype) == 0 ? gold_conversion(rcval.buydiff, com_weight) : silver_conversion(rcval.buydiff, com_weight);
// 											buying_rate = manual_roundoff(selling_con, com_correction_type,'bid');
// 											buying_rate = buying_rate - buying_con;
// 											buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
// 										}
// 									}
// 								});
// 							 /*Commodity Rate Calculation End Here*/
// 							}
// 							if(com_sel_active ==1) {
// 								//set selling price selling price = rate + premium + other charges
// 								if(com_premium_type == 1){
// 									selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
// 									selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
// 								}
// 								else{
// 								selling_rate = parseFloat(selling_rate) + parseFloat(com_sel_premium) + parseFloat(com_other_charges);
// 								selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
// 								selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
// 								}
// 							}else selling_rate = '-';
// 								//Display buying rate
// 							if(com_buy_active ==1) {
// 								//set buying price buying price = rate + premium
// 								if(com_premium_type == 1){
// 									buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
// 									buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
// 								}
// 								else{
// 								buying_rate = parseFloat(buying_rate) + parseFloat(com_buy_premium);
// 								buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
// 								buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
// 								}
// 							}
// 							else buying_rate ='-';
// 							if(buying_rate > parseFloat($(this).find('td:eq(1) span:eq(0)').html())){
// 								$(this).find('td:eq(1) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(1) span:eq(0)').css('background-color', '#008000');
// 							}else if(buying_rate < parseFloat($(this).find('td:eq(1) span:eq(0)').html())){
// 								$(this).find('td:eq(1) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(1) span:eq(0)').css('background-color', '#FF0000');
// 							}else{
// 								$(this).find('td:eq(1) span:eq(0)').css('color', '');
// 								$(this).find('td:eq(1) span:eq(0)').css('background-color', '');
// 							}
// 							$(this).find('td:eq(1)').html(buying_rate);


// 							if(selling_rate > parseFloat($(this).find('td:eq(2) span:eq(0)').html())){
// 								$(this).find('td:eq(2) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(2) span:eq(0)').css('background-color', '#008000');
// 							}else if(selling_rate < parseFloat($(this).find('td:eq(2) span:eq(0)').html())){
// 								$(this).find('td:eq(2) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(2) span:eq(0)').css('background-color', '#FF0000');
// 							}else{
// 								$(this).find('td:eq(2) span:eq(0)').css('color', '');
// 								$(this).find('td:eq(2) span:eq(0)').css('background', '');
// 							}
// 							$(this).find('td:eq(2) span:eq(0)').html(selling_rate);
// 						}
// 					});
// 					$("#liveratetable_coin").find('tbody > tr').each(function (i, el) {
// 						var com_id = parseInt($(this).find('td:last div:eq(0)').html()),
// 						 com_type = parseInt($(this).find('td:last div:eq(1)').html()),
// 						 com_weight = parseFloat($(this).find('td:last div:eq(2)').html()),
// 						 com_other_charges = parseFloat($(this).find('td:last div:eq(3)').html()),
// 						 com_correction_type = parseFloat($(this).find('td:last div:eq(4)').html()),
// 						 com_sel_premium = parseFloat($(this).find('td:last div:eq(5)').html()),
// 						 com_buy_premium = parseFloat($(this).find('td:last div:eq(6)').html()),
// 						 com_premium_type = parseInt($(this).find('td:last div:eq(7)').html()),
// 						 com_sel_active = parseInt($(this).find('td:last div:eq(8)').html()),
// 						 com_buy_active = parseInt($(this).find('td:last div:eq(9)').html()),
// 						 com_delverydays = parseInt($(this).find('td:last div:eq(10)').html()),
// 						 com_isregion = parseInt($(this).find('td:last div:eq(11)').html()),
// 						 com_calpurity = parseFloat($(this).find('td:last div:eq(12)').html()),
// 						 com_tax = parseFloat($(this).find('td:last div:eq(13)').html()),
// 						 com_octroi = parseFloat($(this).find('td:last div:eq(14)').html()),
// 						 com_stamduty = parseFloat($(this).find('td:last div:eq(15)').html()),
// 						 deliverydays = parseFloat($(this).find('td:last div:eq(16)').html()),
// 						 displyname = parseFloat($(this).find('td:last div:eq(17)').html()),
// 						 mcxsymbol = parseFloat($(this).find('td:last div:eq(18)').html()),
// 						 banksymbol = parseFloat($(this).find('td:last div:eq(19)').html()),
// 						 rcomid = parseFloat($(this).find('td:last div:eq(20)').html()),
// 						 trade_type = parseFloat($(this).find('td:last div:eq(21)').html()),
// 						 sell_diff = parseFloat($(this).find('td:last div:eq(22)').html()),
// 						 buy_diff = parseFloat($(this).find('td:last div:eq(23)').html()),
// 						 sell_rate = parseFloat($(this).find('td:last div:eq(24)').html()),
// 						 com_display_purity = parseFloat($(this).find('td:last div:eq(25)').html()),
// 						 com_is_coin = parseFloat($(this).find('td:last div:eq(26)').html()),
// 						 com_roundoff = parseFloat($(this).find('td:last div:eq(27)').html());
// 						 var selling_rate = 0;
// 						 var buying_rate  = 0;
// 						if(com_is_coin == 1){
// 							if(com_premium_type == 1){
// 								selling_rate = parseFloat(com_sel_premium).toFixed(2);
// 								buying_rate  = parseFloat(com_buy_premium).toFixed(2);
// 							}else{
// 							 /* Commodity Rate Calculation Start Here*/
// 								$.each(rpanelcommodities, function(rckey, rcval) {
// 									if(rcomid == rcval.comid){
// 										if(rcval.tradetype == 0){
// 											var baseask = (parseFloat($("#"+rcval.mcxcontract+"_ask").html()) + parseFloat(rcval.selldiff)).toFixed(2);
// 											if(com_isregion == 1) {
// 												if(com_calpurity == 0) { //if purity = 995
// 													baseask = baseask / 0.995;
// 												} else { //if purity = 999 OR 9999
// 													baseask = baseask / 1;
// 												}
// 												//rate1 = rate + (rate * tax/100) Tax calculation
// 												baseask +=(baseask *  (com_tax / 100));
// 												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 												baseask +=(baseask *  (com_octroi / 100));
// 												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 												baseask +=(baseask *  (com_stamduty / 100));
// 											}
// 											else {
// 												if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 													var purity = 100;
// 												} else {
// 													var purity = com_display_purity;
// 												}
// 												baseask = baseask * (purity / 100);
// 											}
// 											var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight) : silver_conversion(baseask, com_weight);
// 											selling_rate = manual_roundoff(selling_con, com_correction_type, 'ask');
// 											buying_rate = (parseFloat($("#"+rcval.mcxcontract+"_bid").html()) - rcval.buydiff).toFixed(2);
// 											if(com_isregion == 1) {
// 												if(com_calpurity == 0) { //if purity = 995
// 													buying_rate = buying_rate / 0.995;
// 												} else { //if purity = 999 OR 9999
// 													buying_rate = buying_rate / 1;
// 												}
// 												//rate1 = rate + (rate * tax/100) Tax calculation
// 												buying_rate +=(buying_rate *  (com_tax / 100));
// 												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 												buying_rate +=(buying_rate *  (com_octroi / 100));
// 												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 												buying_rate +=(buying_rate *  (com_stamduty / 100));
// 											}
// 											else {
// 												if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 													var purity = 100;
// 												} else {
// 													var purity = com_display_purity;
// 												}
// 												buying_rate = buying_rate * (purity / 100);
// 											}
// 											buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
// 											buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
// 										}else if(rcval.tradetype == 1){
// 											/*For Gold Bank Rate Calculation Start Here*/
// 											var bank_kgrate = 0;
// 											$.each(rpanelbankrates, function(rbkey, rbval) {
// 												if(rcval.bcontract_id == rbval.bcontract_id){
// 													bank_kgrate = parseFloat((isNaN(parseFloat($("#"+rbval.bcontract_rate+"_ask").html())) ? 0 : parseFloat($("#"+rbval.bcontract_rate+"_ask").html()) + parseFloat(rbval.premium) + parseFloat(rbval.askdiff)) * ((isNaN($("#SPOT-INR_ask").html())) ? 0 : parseFloat($("#SPOT-INR_ask").html()) + parseFloat(rbval.rupeepremium))).toFixed(2);
// 													if(parseInt(rbval.bconvert_value_type) == 1)
// 														bank_kgrate =  parseFloat(bank_kgrate + parseFloat(rbval.bconvert_value)).toFixed(2);
// 													else if(parseInt(rbval.bconvert_value_type) == 2)
// 														bank_kgrate =  parseFloat(bank_kgrate - parseFloat(rbval.bconvert_value)).toFixed(2);
// 													else if(parseInt(rbval.bconvert_value_type) == 3)
// 														bank_kgrate =  parseFloat(bank_kgrate * parseFloat(rbval.bconvert_value)).toFixed(2);
// 													else if(parseInt(rbval.bconvert_value_type) == 4)
// 														bank_kgrate =  parseFloat(bank_kgrate / parseFloat(rbval.bconvert_value)).toFixed(2);
// 													if(parseFloat(rbval.bextra_charges) > 0){
// 														if(parseInt(rbval.bextra_type) == 1){
// 															bank_kgrate = parseFloat(bank_kgrate + parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}else if(parseInt(rbval.bextra_type) == 2){
// 															bank_kgrate = parseFloat(bank_kgrate - parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}else if(parseInt(rbval.bextra_type) == 3){
// 															bank_kgrate = parseFloat(bank_kgrate * parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}if(parseInt(rbval.bextra_type) == 4){
// 															bank_kgrate = parseFloat(bank_kgrate / parseFloat(rbval.bextra_charges)).toFixed(2);
// 														}
// 													}

// 													bank_kgrate = parseFloat(bank_kgrate) + parseFloat(rbval.custom);
// 													if(parseFloat(rbval.btax_value) > 0){
// 														if(parseInt(rbval.btax_type) == 1){
// 															bank_kgrate = parseFloat((bank_kgrate * ((100 + parseFloat(rbval.btax_value)) / 100))).toFixed(2);
// 														}else if(parseInt(rbval.btax_type) == 2){
// 															bank_kgrate = parseFloat((bank_kgrate + parseFloat(rbval.btax_value))).toFixed(2);
// 														}
// 													}
// 													if(parseInt(rbval.pure) == 1){
// 														bank_kgrate = parseFloat(bank_kgrate / 0.995).toFixed(2);
// 													}
// 													var bankrate = parseInt(rcval.comtype) == 0 ? gold_spotrateconversion(bank_kgrate, 10) : bank_kgrate;
// 													var baseask = (parseFloat(bankrate) + parseFloat(rcval.selldiff)).toFixed(2);
// 													if(com_isregion == 1) {
// 														if(com_calpurity == 0) { //if purity = 995
// 															baseask = baseask / 0.995;
// 														} else { //if purity = 999 OR 9999
// 															baseask = baseask / 1;
// 														}
// 														//rate1 = rate + (rate * tax/100) Tax calculation
// 														baseask +=(baseask *  (com_tax / 100));
// 														//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 														baseask +=(baseask *  (com_octroi / 100));
// 														//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 														baseask +=(baseask *  (com_stamduty / 100));
// 													}
// 													else {
// 														if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 															var purity = 100;
// 														} else {
// 															var purity = com_display_purity;
// 														}
// 														baseask = baseask * (purity / 100);
// 													}
// 													var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(baseask, com_weight): silver_conversion(baseask, com_weight);
// 													selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

// 													buying_rate = (parseFloat(bankrate) - rcval.buydiff).toFixed(2);
// 													if(com_isregion == 1) {
// 														if(com_calpurity == 0) { //if purity = 995
// 															buying_rate = buying_rate / 0.995;
// 														} else { //if purity = 999 OR 9999
// 															buying_rate = buying_rate / 1;
// 														}
// 														//rate1 = rate + (rate * tax/100) Tax calculation
// 														buying_rate +=(buying_rate *  (com_tax / 100));
// 														//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 														buying_rate +=(buying_rate *  (com_octroi / 100));
// 														//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 														buying_rate +=(buying_rate *  (com_stamduty / 100));
// 													}
// 													else {
// 														if(com_display_purity == 0  || isNaN(com_display_purity)) {
// 															var purity = 100;
// 														} else {
// 															var purity = com_display_purity;
// 														}
// 														buying_rate = buying_rate * (purity / 100);
// 													}
// 													buying_rate = parseInt(rcval.comtype) == 0 ? gold_conversion(buying_rate, com_weight) : silver_conversion(buying_rate, com_weight);
// 													buying_rate = manual_roundoff(buying_rate, com_correction_type, 'bid');
// 												}
// 											});	
// 										 /*For Gold Bank Rate Calculation End Here*/
// 										}else if(rcval.tradetype == 2){
// 											var sellrate = rcval.sellrate;
// 											//Calculating Purity, Tax, Octroi and stamp duty if commodity type is region
// 											if(com_isregion == 1) {
// 												//rate = Base rate / purity
// 												if(com_calpurity == 0) { //if purity = 995
// 													sellrate = sellrate / 0.995;
// 												} else { //if purity = 999 OR 9999
// 													sellrate = sellrate / 1;
// 												}
// 												//rate1 = rate + (rate * tax/100) Tax calculation
// 												sellrate +=(sellrate *  (com_tax / 100));
// 												//rate12 = rate1 + (rate1 * octroi/100) Tax calculation
// 												sellrate +=(sellrate *  (com_octroi / 100));
// 												//rate13 = rate2 + (rate2 * stamp duty/100) Tax calculation
// 												sellrate +=(sellrate *  (com_stamduty / 100));
// 											}
// 											var selling_con = parseInt(rcval.comtype) == 0 ? gold_conversion(sellrate, com_weight) : silver_conversion(sellrate, com_weight);
// 											selling_rate = manual_roundoff(selling_con, com_correction_type,'ask');

// 											var buying_con = parseInt(rcval.comtype) == 0 ? gold_conversion(rcval.buydiff, com_weight) : silver_conversion(rcval.buydiff, com_weight);
// 											buying_rate = manual_roundoff(selling_con, com_correction_type,'bid');
// 											buying_rate = buying_rate - buying_con;
// 											buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
// 										}
// 									}
// 								});
// 							 /*Commodity Rate Calculation End Here*/
// 							}
// 							if(com_sel_active ==1) {
// 								//set selling price selling price = rate + premium + other charges
// 								if(com_premium_type == 1){
// 									selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
// 									selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
// 								}
// 								else{
// 								selling_rate = parseFloat(selling_rate) + parseFloat(com_sel_premium) + parseFloat(com_other_charges);
// 								selling_rate = manual_roundoff(selling_rate, com_correction_type,'ask');
// 								selling_rate = parseFloat(selling_rate).toFixed(com_roundoff);
// 								}
// 							}else selling_rate = '-';
// 								//Display buying rate
// 							if(com_buy_active ==1) {
// 								//set buying price buying price = rate + premium
// 								if(com_premium_type == 1){
// 									buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
// 									buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
// 								}
// 								else{
// 								buying_rate = parseFloat(buying_rate) + parseFloat(com_buy_premium);
// 								buying_rate = manual_roundoff(buying_rate, com_correction_type,'bid');
// 								buying_rate = parseFloat(buying_rate).toFixed(com_roundoff);
// 								}
// 							}
// 							else buying_rate ='-';

// 							if(buying_rate > parseFloat($(this).find('td:eq(1) span:eq(0)').html())){
// 								$(this).find('td:eq(1) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(1) span:eq(0)').css('background-color', '#008000');
// 							}else if(buying_rate < parseFloat($(this).find('td:eq(1) span:eq(0)').html())){
// 								$(this).find('td:eq(1) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(1) span:eq(0)').css('background-color', '#FF0000');
// 							}else{
// 								$(this).find('td:eq(1) span:eq(0)').css('color', '');
// 								$(this).find('td:eq(1) span:eq(0)').css('background-color', '');
// 							}
// 							$(this).find('td:eq(1)').html(buying_rate);


// 							if(selling_rate > parseFloat($(this).find('td:eq(2) span:eq(0)').html())){
// 								$(this).find('td:eq(2) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(2) span:eq(0)').css('background-color', '#008000');
// 							}else if(selling_rate < parseFloat($(this).find('td:eq(2) span:eq(0)').html())){
// 								$(this).find('td:eq(2) span:eq(0)').css('color', '#FFFFFF');
// 								$(this).find('td:eq(2) span:eq(0)').css('background-color', '#FF0000');
// 							}else{
// 								$(this).find('td:eq(2) span:eq(0)').css('color', '');
// 								$(this).find('td:eq(2) span:eq(0)').css('background', '');
// 							}
// 							$(this).find('td:eq(2) span:eq(0)').html(selling_rate);
// 						}
// 					});
// 				}
// 			};
// 	    callback();
// 	    window.setInterval(callback, 300);
// 	})();
var $ = jQuery.noConflict();
$(function () {
  //set_rate();
  setInterval(function () { updateIndicator(); }, 5000);
  get_MarqueNews();
});

function updateIndicator() {
  var online = navigator.onLine;
  if (online) {
    document.getElementById("connectionmsg").innerHTML = "";
    document.getElementById("connectionmsg").style.display = "none";
  } else {
    document.getElementById("connectionmsg").innerHTML = "Please check your internet connection";
    document.getElementById("connectionmsg").style.display = "block";
  }
}
var $ = jQuery.noConflict();
$(document).ready(function () {
  var $ = jQuery.noConflict();

  $.ajax(
    {
      url: SITE_BASE_URL + "index.php/C_booking/getadvertisements",
      type: "GET",
      dataType: "json",
      data: "",
      async: false,
      success: function (xmlDoc) {
        var adv1 = "<section class='slider'><div class='flexslider'><ul class='slides'>";
        var adv2 = "<ul class='slides'>";
        $.each(xmlDoc, function (key, value) {
          if (value.type == 0) {
            adv1 += '<li><img src="' + SITE_BASE_URL + value.location + '"  height="auto" style="width:100%";/></li>';
          } else if (value.type == 1) {
            adv2 += '<li><img src="' + SITE_BASE_URL + value.location + '" height="auto" style="width:100%"; /></li>';
          }
        });
        adv1 += "</ul></div></section>";
        adv2 += "</ul>";
        $('.adv1').html(adv1);
        $('#adv2').html(adv2);
      },
      error: function (request, error) {
        console.log(error);
      }
    });
  /* $('.adv1').flexslider({ 
    animation: "fade",
    pauseOnHover: true,
    controlNav: false,
    directionNav: false,
    slideshow: true
  }); */

  /* $('#adv2').flexslider({ 
    animation: "fade",
    pauseOnHover: true,
    controlNav: false,
    directionNav: false,
    slideshow: true
  });  */
});

$(function () {
  window.setInterval(function () { calcTime('5.51', '1.00', '-4.03', '9.00'); }, 1000);
});