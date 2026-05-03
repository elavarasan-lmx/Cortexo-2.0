$(document).ready(function() {
	document.addEventListener("visibilitychange", function() {
		if (document.hidden){
			console.log("Browser tab is hidden")
		} else {
			commodity_update();
		}
	});

	 socket.on(comm_update, function(data){
		   commodity_update();
		   clear_bookingterminal();
		   $('#order_rate').val("");
		   $("#avail_margin").html("");
		   get_tradingdatas();
	 });
	socket.on(rp_update, function(data){
		rpanel_update();
	});
	socket.on(mrq_update, function(data){
		$("#marquee").html("");
		$("#marquee").append("<marquee scrollamount='4' onmouseover='this.stop();' onmouseout='this.start();' >"+decodeURIComponent((data.updatedata.mrq_text+'').replace(/\+/g,'%20'))+"</marquee>");
	});
	socket.on(news_update, function(data){
		$("#newsevents").html("");
		$("#newsevents").append('<marquee direction="up" onmouseover="this.stop();" onmouseout="this.start();" scrollamount="2" align="middle" style="height: 151px; padding-left: 2px;">'+ data.updatedata.news +'</marquee>');
	});
	socket.on(trdstatusupdate, function(data){
		if(typeof data.updatedata !== 'undefined')
		{
			var tradingstatus = data.updatedata;
			$(tradingstatus).each(function (count_i,status) {
				if(status.client == client)
				{
					enable_trade = status.trade_enable;
					clear_bookingterminal();
					$('#order_rate').val("");
				    $("#avail_margin").html("");
				}
			});
		}
	});
 });

function commodity_update()
{
	$.ajax({
		url : SITE_BASE_URL+"index.php/C_booking/get_commodity_data",
		type : "GET",
		dataType : "json",
		data: "",
		async: false,
		success: function(data){
			console.log("commodityDetails",data.commodity);
			console.log("ContractDetails",data.contracts);
			rpanelcontract = data.contracts;
			if(data.commodity.commoditydetails.length > 0){
				$("#liveratetable tbody").empty();
				$("#liveratetable_coin tbody").empty();
				rpanelcommodities = data.commodity.rpanel_commodities;
			}
			$.each(data.commodity.commoditydetails,function(idx, commodity){
				if(commodity.com_is_coin != 1)
			   	{
					var tablerow = '<tr class="table1" id="liverates"><td class="com_name">' + commodity.com_name +'</td><td class="ratevalue2"></td><td class="ratevalue2"></td><td style="display:none;">' + commodity.deliverydays +'</td><td style="display:none;"><div class="com_id">'+ commodity.com_id + '</div><div class="com_type">'+ commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">'+ commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">'+ commodity.com_buy_premium + '</div><div class="com_premium_type">'+ commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">'+ commodity.com_delverydays + '</div><div class="com_isregion">'+ commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">'+ commodity.com_roundoff + '</div><div class="com_is_coin">'+ commodity.com_is_coin + '</div><div class="com_bar_quantity">'+ commodity.com_bar_quantity + '</div><div class="com_margin_type">'+ commodity.com_margin_type + '</div><div class="com_margin_value">'+ commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">'+ commodity.com_bar_type + '</div><div class="bar_selection">'+ commodity.bar_selection + '</div><div class="com_bar_no">'+ commodity.com_bar_no + '</div><div class="com_unit">'+ commodity.com_unit+ '</div><div class="statusbuy">0</div><div class="statussell">0</div></td></tr>';
					$("#liveratetable tbody").append(tablerow);
				}
				if(commodity.com_is_coin == 1)
				{
					var tablerow = '<tr class="table1"><td class="ratevalue1 com_name">' + commodity.com_name +'</td><td class="ratevalue2"></td><td class="ratevalue2"></td><td style="display:none;">' + commodity.deliverydays +'</td><td style="display:none;"><div class="com_id">'+ commodity.com_id + '</div><div class="com_type">'+ commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">'+ commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">'+ commodity.com_buy_premium + '</div><div class="com_premium_type">'+ commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">'+ commodity.com_delverydays + '</div><div class="com_isregion">'+ commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">'+ commodity.com_roundoff + '</div><div class="com_bar_quantity">'+ commodity.com_bar_quantity + '</div><div class="com_margin_type">'+ commodity.com_margin_type + '</div><div class="com_margin_value">'+ commodity.com_margin_value + '</div><div class="allowed_decimals">' + commodity.allowed_decimals + '</div><div class="com_bar_type">'+ commodity.com_bar_type + '</div><div class="bar_selection">'+ commodity.bar_selection + '</div><div class="com_bar_no">'+ commodity.com_bar_no + '</div><div class="com_unit">'+ commodity.com_unit+ '</div><div class="statusbuy">0</div><div class="statussell">0</div></td></tr>';
					$("#liveratetable_coin tbody").append(tablerow);
				}
			});
		},
		error: function(request,error){
			console.log(error);
		}
	});
}
function rpanel_update()
{
	$.ajax({
		url : SITE_BASE_URL+"index.php/C_booking/get_rpanel_data",
		type : "GET",
		dataType : "json",
		data: "",
		async: false,
		success: function(data){
			var $ = jQuery.noConflict();
			console.log("RpanelData",data);
			rpanelbankrates = data.rpanelbank;
			rpaneldata = data.rpaneldata;
			rpanelcommodities = data.rpanel_commodities;
			$(".market_closed").html(data.rpaneldata.market_status);
			$(".rate_display").html(data.rpaneldata.rate_display);

			if(data.rpaneldata.rate_display == 0){
				document.getElementById("onoffmessage").style.display = "block";
				document.getElementById("messagebox").style.display = "none";
				document.getElementById("divrate").style.display = "none";
			}else if(data.rpaneldata.rate_display == 1 && data.rpaneldata.market_status == 1){
				document.getElementById("onoffmessage").style.display = "none";
				document.getElementById("divrate").style.display = "none";
				document.getElementById("messagebox").style.display = "block";
				$("#messageboxtext").html(data.rpaneldata.message);
			}else if(data.rpaneldata.rate_display == 1 && data.rpaneldata.market_status !=1){
				document.getElementById("onoffmessage").style.display = "none";
				document.getElementById("messagebox").style.display = "none";
				document.getElementById("divrate").style.display = "block";
			}
		},
		error: function(request,error){
			console.log(error);
		}
	});
}

(function () {
	var $ = jQuery.noConflict();
    var callback = function() {
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
						 com_roundoff = parseFloat($(this).find('td:last div:eq(27)').html());
						
						 var selling_rate = 0;
						 var buying_rate  = 0;
						if(com_premium_type == 1){
							selling_rate = parseFloat(com_sel_premium).toFixed(2);
							buying_rate  = parseFloat(com_buy_premium).toFixed(2);
						}else{
						 /* Commodity Rate Calculation Start Here*/
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
										/*For Gold Bank Rate Calculation Start Here*/
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
									 /*For Gold Bank Rate Calculation End Here*/
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
						 /*Commodity Rate Calculation End Here*/
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
							$(this).find('td:eq(1)').css('background-color', '#FF0000');
						}else if(buying_rate < parseFloat($(this).find('td:eq(1)').html())){
							$(this).find('td:eq(1)').css('color', '#FFFFFF');
							$(this).find('td:eq(1)').css('background-color', '#0000FF');
						}else{
							$(this).find('td:eq(1)').css('color', '');
							$(this).find('td:eq(1)').css('background-color', '');
						}
						$(this).find('td:eq(1)').html(buying_rate);

						if(selling_rate > parseFloat($(this).find('td:eq(2)').html())){
							$(this).find('td:eq(2)').css('color', '#FFFFFF');
							$(this).find('td:eq(2)').css('background-color', '#FF0000');
						}else if(selling_rate < parseFloat($(this).find('td:eq(2)').html())){
							$(this).find('td:eq(2)').css('color', '#FFFFFF');
							$(this).find('td:eq(2)').css('background-color', '#0000FF');
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
							 /* Commodity Rate Calculation Start Here*/
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
											/*For Gold Bank Rate Calculation Start Here*/
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
										 /*For Gold Bank Rate Calculation End Here*/
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
							 /*Commodity Rate Calculation End Here*/
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
								$(this).find('td:eq(2)').css('background-color', '#2636F2');
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
								$(this).find('td:eq(1)').css('background-color', '#2636F2');
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
	})();
function updateIndicator() {
	var online = navigator.onLine;
	if(online){
		if(document.getElementById("connectionmsg").innerHTML != ""){
			$("#loader").css('display','block');
			location.reload();
		}
		document.getElementById("connectionmsg").innerHTML = "";
		document.getElementById("connectionmsg").style.display = "none";
	}else{
		document.getElementById("connectionmsg").innerHTML = "Please check your internet connection";
		document.getElementById("connectionmsg").style.display = "block";
	}
}
function get_MarqueNews()
			{
				var $ = jQuery.noConflict();
				$.ajax({						
					type: "POST",	
					dataType: "json",	   
					url: SITE_BASE_URL+"index.php/c_ajax/get_MarqueNews",
					success: function(data){
						$("#marquee").html("");
						$("#newsevents").html("");
						if(data.marque != undefined)
						{
							$("#marquee").append("<marquee scrollamount='4' onmouseover='this.stop();' onmouseout='this.start();' >"+decodeURIComponent((data.marque+'').replace(/\+/g,'%20'))+"</marquee>");
							$("#newsevents").html("");
						}
						if(data.news != undefined)
						{
							var news_events = data.news;
							$(".newsevents").append('<marquee direction="up" onmouseover="this.stop();" onmouseout="this.start();" scrollamount="2" align="middle" style="height: 151px; padding-left: 8px;width: 865px;margin-top: 9px;">'+news_events+'</marquee>');
						}
					},
					error: function(request,error) {
					console.log(error);
					}
				});
			}

var trade_status_id 	= [];
var trade_status_buy 	= [];
var trade_status_sell 	= [];
enable_trade = 0;
var orders = [];
var margin_balance = 0;
var page_onload = true;
var timer,timer_status,timer_flag=0;
var $ = jQuery.noConflict();
$(function() {
		clear_bookingterminal();
		get_tradingdatas();
		load_report(1);
        setInterval(function(){ updateIndicator(); }, 5000);
        get_MarqueNews();

	 	$('input[type=radio][name=request_type]').change(function() {
        if (this.value == 0) {
            $('.ordervalue').css('display','none');
			$('.limitno').css('display','none');
			document.getElementById("book_update").style.display = "none";
			document.getElementById("book_cancel").style.display = "none";
			document.getElementById("book_qty").focus();
			if($("#book_type").val() == 0)
				$("#buy_sell").html('BUY');
			else
				$("#buy_sell").html('SELL');
        }
        else if (this.value == 1) {
			document.getElementById("book_update").style.display = "none";
			document.getElementById("book_cancel").style.display = "none";
            $('.ordervalue').css('display','block');
			$('.limitno').css('display','none');
			$("#buy_sell").html('PLACE LIMIT');
			document.getElementById("order_bookno").value 		= "";
			$('#order_rate').val("");
			$('#limitno').val(-1);
			$('#order_rate').focus();
        }
		else if (this.value == 2) {
           load_pendingorders();
        }
    });

	$("body").on("click","#activate_terminal",function(){
		if(enable_trade == 1)
		{
			show_firstCommodity();
		}
		else
		{
			trade_disable();
		}
	});

	$(".refresh_report").click(function(){
		var report_call = $(".headings.headings-active").attr("onclick");
		eval(report_call);
	});

	$("#limitno").on('change',function() {
	document.getElementById("order_bookno").value 		= "";
	$('#order_rate').val("");
	$('#book_qty').val("");
		$(orders).each(function (index,value){
		
			if(parseInt(value.order_bookno) == parseInt($("#limitno").val()))
			{
				document.getElementById("order_bookno").value 		= parseFloat(value.order_bookno);
				$('#order_rate').val(parseFloat(value.order_taken_rate));
				$('#book_qty').val(parseFloat(value.order_taken_qty));
			}

		});
	});

	$("#book_comname").on('change',function(value)
	{  
		var book_comid = $(this).val();	
		change_commodity(book_comid);
	});

});		
function get_tradingdatas()
{
	trade_status_id 	= [];
	trade_status_buy 	= [];
	trade_status_sell 	= [];
	margin_balance = 0;
	$.ajax({
		type: "POST",
		dataType: "json",	   
		url: SITE_BASE_URL+"index.php/C_trade/get_tradingdatas",
		success: function(data)
		{
			//Trading Status
			$(data.tradeStatus.status).each(function (index,value) {
				trade_status_id.push(value.trade_status_id);	
				trade_status_buy.push(value.trade_status_buy);	
				trade_status_sell.push(value.trade_status_sell);
			});
			enable_trade = data.tradeStatus.trade_enable;
			margin_balance = data.available_balance;
		},
		error: function(request,error) 
		{
			console.log(error);
		}
	});
}
function load_pendingorders(idorder = "")
{
	$(".request-btn-value").css("pointer-events","none");
	$("#loader").css('display','block');
	var com_id = $("#book_comid").val();
	orders = [];
	$.ajax({
		type: "POST",	
		dataType: "json",	   
		url: SITE_BASE_URL+"index.php/C_trade/load_pendingorders",
		data: "com_id=" + com_id,
		success: function(data)
		{
			$(".request-btn-value").css("pointer-events","");
			$("#loader").css('display','none');
			$('#limitno').find('option:gt(0)').remove();
			if(data.orders.has_ordered == 1)
			{
				$.each(data.orders.order, function(index, value) {
					if($("#bar_selection").val() == 1)
						var booknobar = parseFloat(value.book_no_bar)*parseFloat(document.getElementById('book_barquantity').value);
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
			$(orders).each(function (index,value) {
				if(value.order_comid == com_id)
				{
					$('#limitno').append($('<option>', {
						value : value.order_bookno,
						text  : "No:"+value.order_bookno+", Qty:"+value.order_taken_qty+", Rate:"+value.order_taken_rate
					}));
				}
				document.getElementById("has_order").value = 1;
			});
			$('.ordervalue').css('display','block');
			$('.limitno').css('display','block');
			document.getElementById("order_bookno").value 		= "";
			$('#order_rate').val("");
			$('#book_qty').val("");
			$('#limitno').val(-1);
			$('#order_rate').focus();

			if(idorder != "")
			{
				$("#limitno").val(idorder);
				
				$(orders).each(function (index,value) 
				{
					if(parseInt(value.order_bookno) == parseInt($("#limitno").val()))
					{
						document.getElementById("order_bookno").value 		= parseFloat(value.order_bookno);
						$('#order_rate').val(parseFloat(value.order_taken_rate));
						$('#book_qty').val(parseFloat(value.order_taken_qty));
					}

				});
			}
		},
		error: function(request,error) 
		{
			console.log(error);
		}
	});
}
function show_firstCommodity()
{
	var has_sellcommodity = false;
	
	$.each($("#liveratetable tbody tr"),function(index,value)
	{
		if($(value).find('.statussell').html() == 1)
		{
			var obj_td = $(value).find('td:nth-child(3)').get(0);
			
			show_values(obj_td,1);
			has_sellcommodity = true;
			return false;
		}
	});
	if(!has_sellcommodity)
	{
		$.each($("#liveratetable tbody tr"),function(index,value){
		
			if($(value).find('.statusbuy').html() == 1)
			{
				var obj_td = $(value).find('td:nth-child(2)').get(0);
				show_values(obj_td,0);
				return false;
			}
		});	
	}
}
function change_commodity(book_comid)
{
	$.each($("#liveratetable tbody tr"),function(index,value){
		var com_id     	= $(value).find('.com_id').html();
		
		if(com_id == book_comid)
		{
			if(parseInt($("#book_type").val()) == 0)
			{
				var obj_td = $(value).find('td:nth-child(3)').get(0);
				show_values(obj_td,1);
			}
			else
			{
				var obj_td = $(value).find('td:nth-child(2)').get(0);
				show_values(obj_td,0);
			}	
			return false;
		}
	});
}
function call_reviewOrder()
{
    $("#update_ordertype").prop("checked", true);
	$('.ordervalue').css('display','block');
	$('.limitno').css('display','block');
	document.getElementById("order_bookno").value 		= "";
	$('#order_rate').val("");
	$('#book_qty').val("");
	$('#limitno').val(-1);
	$('#order_rate').focus();	 
}
function clear_bookingterminal()
{
	cleartime();
	$("#book_comname").html("");
	$("#required_qty").html('<input id="book_qty" name="book_qty"  type="number" class="form-control width-input" tabindex="2" />');
	$("#book_qty").val("");
	$("#order_rate").val("");
	$(".avail_margin").val(0.00);
	$("#rate_disp").html("Rate");
	$("#book_rate").val("");
	$("#book_rate").css("background","");
	$("#book_totalcost").html("");
	$('#limitno').find('option:gt(0)').remove();
	$(".comm-purchase").removeClass("atv_btn");
	$("#book").css("display","block");
	$("#book .buysellrates").css("background","#008000");
	$("#buy_sell").html("BUY/SELL");
	$(".maxmin").html("");
	$(".rateval").html("0.00");
	$(".rateval_update").html("0.00");
	$(".ordervalue").css("display","none");
	$('.limitno').css('display','none');
	document.getElementById("book_update").style.display = "none";
	document.getElementById("book_cancel").style.display = "none";
	$("#new_booktype").prop('checked', true);
	$(".buySell-info").css("display","block");
	$("#activate_terminal").css("display","inline");
	$('#book_qty').val("");
	$('.qty_type').html("");
	$('.displayLotSize').html("");
}

function customer_request() 
{
	document.getElementById("book").style.display = "none";
	$("#loader").css('display','block');

	if($('#new_booktype').is(':checked'))
	{
		var request_type = 0;
	}
	else if($('#new_ordertype').is(':checked'))
	{
		var request_type = 1;
	}
	else if($('#update_ordertype').is(':checked'))
	{
		var request_type = 2;
	}

	if($("#bar_selection").val() == 1)
	{
		var booked_qty = parseFloat($("#book_qty").val())/parseFloat(document.getElementById('book_barquantity').value);
	}
	else
	{
		var booked_qty = parseFloat($("#book_qty").val());
	}

	var book_cusid 		= document.getElementById("book_cusid").value;	
	var book_comid 		= document.getElementById("book_comid").value;
	var book_comtype 	= document.getElementById("book_comtype").value;
	var book_comname    = $("#book_comname option:selected").text();
	var book_type  		= document.getElementById("book_type").value; 
	var book_no_bar		= booked_qty;
	var margin 			= document.getElementById("margin").value;
	var margin_type 	= document.getElementById("margin_type").value;
	var book_commweight = parseFloat(document.getElementById('book_comweight').value);
	var com_bar_type  	= parseFloat(document.getElementById("com_bar_type").value);
	var qty_conversion  = (com_bar_type == 1 ? 1 : 1000);
	var book_qty   		= parseFloat(parseFloat(booked_qty)*parseFloat(document.getElementById('book_barquantity').value)/qty_conversion).toFixed(6);

	if(request_type == 1) {
		var book_rate  	   = parseFloat(document.getElementById("order_rate").value);
		
		var book_totalcost = parseFloat(Math.round((book_rate/book_commweight)  *  (book_qty * 1000)));
	}
	else {
		var book_rate  		= document.getElementById("book_rate").value;
		
		var book_totalcost  = parseFloat(Math.round((book_rate/book_commweight)  *  (book_qty * 1000)));
	}
	cleartime();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL+"index.php/C_trade/booking_request",
		data: "book_cusid=" + book_cusid + "&book_comid=" + book_comid + "&book_qty=" + book_qty + "&book_rate=" + book_rate + 
				"&book_type=" + book_type + "&book_comweight=" + book_commweight+ "&book_totalcost=" + book_totalcost+ "&book_no_bar=" + book_no_bar+ "&margin=" + margin+ "&margin_type=" + margin_type+ "&request_type="+request_type+"&com_bar_type="+com_bar_type,
		success: function(data) 
		{
			$("#loader").css('display','none');
			get_tradingdatas();
			if(typeof data.is_logged_out != 'undefined' && data.is_logged_out == true)
			{
				logout();
			}
			else
			{
				if(request_type == 0) {
					notifyBooking(data.book_no);
					load_report(1);
				}else{
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
function customer_request_update() 
{
	document.getElementById("book_update").style.display = "none";
	document.getElementById("book_cancel").style.display = "none";
	var com_weight 	 = parseFloat(document.getElementById('book_comweight').value);
	$('#request_modal').modal('hide');
	$("#loader").css('display','block');
	if($('#new_booktype').is(':checked'))
	{
		var request_type = 0;
	}
	else if($('#new_ordertype').is(':checked'))
	{
		var request_type = 1;
	}
	else if($('#update_ordertype').is(':checked'))
	{
		var request_type = 2;
	}

	if($("#bar_selection").val() == 1)
	{
		var booked_qty = parseFloat($("#book_qty").val())/parseFloat(document.getElementById('book_barquantity').value);
	}
	else
	{
		var booked_qty = parseFloat($("#book_qty").val());
	}

	var book_cusid 		= document.getElementById("book_cusid").value;	
	var book_comid 		= document.getElementById("book_comid").value;
	var book_rate  		= document.getElementById("order_rate").value;
	
	var book_no_bar		= booked_qty;
	var book_commweight = parseFloat(document.getElementById('book_comweight').value);
	var book_no			= document.getElementById("order_bookno").value;
	var book_type  		= document.getElementById("book_type").value;
	var com_bar_type  	= parseFloat(document.getElementById("com_bar_type").value);
	var qty_conversion  = (com_bar_type == 1 ? 1 : 1000);
	var book_qty   		= parseFloat(parseFloat(booked_qty)*parseFloat(document.getElementById('book_barquantity').value)/qty_conversion).toFixed(6);
	var book_totalcost = parseFloat(Math.round((book_rate/book_commweight)  *  (book_qty * 1000)));

	cleartime();

	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL+"index.php/C_trade/booking_request_update",
		data: "book_cusid=" + book_cusid + "&book_comid=" + book_comid + "&book_no=" + book_no + "&book_rate=" + book_rate+ "&book_totalcost=" + book_totalcost + "&book_qty=" + book_qty + "&book_no_bar=" + book_no_bar+"&request_type="+request_type+"&book_type=" + book_type,
		success: function(data) 
		{
			$("#loader").css('display','none');
			get_tradingdatas();
			if(typeof data.is_logged_out != 'undefined' && data.is_logged_out == true)
			{
				logout();
			}
			else
			{				
				$("#book_update").css('display','none');
				$("#book_cancel").css('display','none');
				if(data.status == 1) {
					$('#booking_status').html("Order No:" + book_no + " - Order has been updated...");
				}else {
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

	$("#loader").css('display','block');
	
	var book_cusid 		= document.getElementById("book_cusid").value;	
	var book_comid 		= document.getElementById("book_comid").value;
	var book_no			= document.getElementById("order_bookno").value;
	cleartime();
	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL+"index.php/C_trade/booking_request_cancel",
		data: "book_cusid=" + book_cusid + "&book_comid=" + book_comid + "&book_no=" + book_no,
		success: function(data) 
		{
			$("#loader").css('display','none');
			get_tradingdatas();
			if(typeof data.is_logged_out != 'undefined' && data.is_logged_out == true)
			{
				logout();
			}
			else
			{
				$("#book_update").css('display','none');
				$("#book_cancel").css('display','none');
				if(data.status == 1) {
					$('#booking_status').html("Order No:" + book_no + " - Your Order has been cancelled...");
					$('#status_modal').modal({
								backdrop: 'static',
								keyboard: false
							});

					clear_bookingterminal();
					$('#order_rate').val("");
					notifyBooking(data.book_no);
				}else {
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
function notifyBooking(book_no)
{
	$.ajax({
		type: "POST",
		dataType: "json",
		url: SITE_BASE_URL+"index.php/C_trade/notifyBooking",
		data: "book_no=" + book_no,
		success: function(data) 
		{
			
		}
	});
}
function calculateTotal(row,is_buy,is_sell){
	var comid 		  = document.getElementById("book_comtype").value;
	var com_weight 	  = parseFloat(document.getElementById('book_comweight').value);
	var order_rate    = parseFloat(document.getElementById("order_rate").value);
	var book_rate     = parseFloat(document.getElementById("book_rate").value);
	
	var book_bar_qty  = parseFloat(document.getElementById('book_barquantity').value);
	var bookingQty    = parseFloat($("#book_qty").val()) * book_bar_qty;
	var com_bar_type  = parseFloat($("#com_bar_type").val());
	var bar_selection = parseFloat($("#bar_selection").val());

	var hightol 		= 0;
	var lowtol 			= 0;
	var book_totalcost  = 0;
	
	if(bar_selection == 1)
	{
		var book_qty = parseFloat($("#book_qty").val())/book_bar_qty;
	}
	else
	{
		var book_qty = parseFloat($("#book_qty").val());
	}

	if($('#new_booktype').is(':checked'))
	{
		var request_type = 0;
	}
	else if($('#new_ordertype').is(':checked'))
	{
		var request_type = 1;
	}
	else if($('#update_ordertype').is(':checked'))
	{
		var request_type = 2;
	}
	if(request_type == 1 || request_type == 2)
	{
		if($("#book_comtype").val() == 0)
		{
			if($("#gold_high_tol").val() != 0)
			{
				hightol = Math.round(book_rate + (book_rate * parseFloat($("#gold_high_tol").val())/100));
			}
			else
			{
				hightol = book_rate;
			}
			if($("#gold_low_tol").val() != 0)
			{
				lowtol = Math.round(parseFloat(document.getElementById("book_rate").value) - (parseFloat(document.getElementById("book_rate").value)* parseFloat($("#gold_low_tol").val())/100));
			}
			else
			{
				lowtol = book_rate;
			}
		}
		else if($("#book_comtype").val() == 1)
		{
			if($("#silver_high_tol").val() != 0)	
			{
				hightol = Math.round(book_rate + (book_rate * parseFloat($("#silver_high_tol").val())/100)); 
			}
			else
			{
				hightol = book_rate;
			}			
			if($("#silver_low_tol").val() != 0) 
			{
				lowtol = Math.round(book_rate - (book_rate * parseFloat($("#silver_low_tol").val())/100));
			}
			else
			{
				lowtol = book_rate;
			}
		}
	}

	var number = parseFloat($("#book_qty").val()) > 0 ? $("#book_qty").val().toString() : "0";
	var allowed_decimals = $("#allowed_decimals").val();
	var arr_num = number.split('.');
	var after_decimal =  true;

	if(typeof arr_num[1] !== 'undefined' && !isNaN(arr_num[1]) && arr_num[1] != '')
	{
		if(arr_num[1].length > allowed_decimals)
		{
			after_decimal =  false;
		}
			
	}
	if(parseFloat(number) > 0 && after_decimal == true && ((request_type == 1 || request_type == 2) ? !isNaN(order_rate)  && order_rate > 0 : true) && (request_type == 2 ? document.getElementById("limitno").value != -1 : true)) 
    {
		var qty_conversion = com_bar_type == 1 ? 1000 : 1;

		if(request_type == 1 || request_type == 2) 
		{
			if(order_rate !="" && book_qty !="")
			{
				book_totalcost = parseFloat(Math.round((order_rate/com_weight)  *  (book_qty * book_bar_qty * qty_conversion)));
			}
		}
		else 
		{
			book_totalcost = parseFloat(Math.round((book_rate/com_weight)  *  (book_qty * book_bar_qty * qty_conversion)));
		}

		if(book_bar_qty == 1 || bar_selection == 1) 
		{
			var totalcost = isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2);
		}
		else
		{
			if(com_bar_type == 0){
				var totalqty = parseFloat((book_qty * book_bar_qty).toFixed(6));
				var qtyType = "gms";
			}
			else if(com_bar_type == 1){
				var totalqty = parseFloat((book_qty * book_bar_qty).toFixed(6));
				var qtyType = "Kg";
			}
			var totalcost = (isNaN(book_totalcost) ? 0.00 : book_totalcost.toFixed(2))+" <span class='totalqty'>("+totalqty+" "+(qtyType)+")</span>";
		}

		document.getElementById("book_totalcost").innerHTML = totalcost;

		if((request_type == 1 || request_type == 2) ? ((hightol != 0 ? order_rate <= hightol : true) && (lowtol != 0 ? order_rate >= lowtol : true)) : true)
		{
			if(request_type == 2 ? $('#has_order').val() == 1 && $("#limitno").val() != -1 : false) 
			{
				document.getElementById("book_update").style.display     = "block";
				document.getElementById("book").style.display 	    	 = "none";
			}
			else
			{
				document.getElementById("book_update").style.display = "none";
				document.getElementById("book").style.display 	     = "block";	
			}
		}
		else 
		{
			document.getElementById("book_update").style.display 	= "none";
			document.getElementById("book").style.display 	     	= "none";
		}
			
		if(request_type == 2 && $('#has_order').val() == 1 && $("#limitno").val() != -1) 
		{
			document.getElementById("book_cancel").style.display = "block";
		}
		else
		{
			document.getElementById("book_cancel").style.display = "none";
		}
	}
	else
	{
		if(!parseFloat(number) > 0 || !after_decimal)
		{
			document.getElementById("book_qty").value = ''; 
			document.getElementById("book_totalcost").innerHTML = "0";
			document.getElementById("book").style.display = "none";
			document.getElementById("book_update").style.display = "none";
			document.getElementById("book_cancel").style.display = "none";
		}
		if(request_type == 2 || request_type == 1) 
		{
			if(order_rate == '' || isNaN(order_rate) || order_rate < 0)
			{
				document.getElementById("book").style.display = "none";
				document.getElementById("book_update").style.display = "none";
				document.getElementById("book_cancel").style.display = "none";
				document.getElementById("order_rate").value = ''; 
				document.getElementById("book_totalcost").innerHTML = "0"; 
			}
		}
    }
}
function show_values() 
{
	var is_sell = 0;
	var is_buy = 0;
	$("#activate_terminal").css("display","none");
	
	if(parseInt(arguments[1]) == 0)
	{
		is_sell  = $($(arguments[0]).parent()).find('.statusbuy').html();
	}
	if(parseInt(arguments[1]) == 1)
	{
		is_buy = $($(arguments[0]).parent()).find('.statussell').html();	
	}
	$("#new_booktype").prop("checked", true);
	var type = arguments[2];
	var idorder = arguments[3];
	document.getElementById("book_update").style.display = "none";
	document.getElementById("book_cancel").style.display = "none";
	$('.ordervalue').css('display','none');
	$('.limitno').css('display','none');
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
	
	$.each($("#liveratetable > tbody tr"),function(index, value)
	{
		
	    var com_id     	= $(value).find('.com_id').html();
	    var com_name   	= $(value).find('.com_name').html();
	    var statussell 	= $(value).find('.statussell').html();
	    var statusbuy  	= $(value).find('.statusbuy').html();
		
	
	    if(statusbuy  == 1 && is_sell == 1)
		{
			
			if(document.getElementById("book_comid").value == com_id)
			var selected = 'selected = "selected"';
			
			$('#book_comname').append('<option value="'+com_id+'" '+selected+'>'+com_name+'</option>');
		}
		else if(statussell  == 1 && is_buy == 1)
		{
			
			if(document.getElementById("book_comid").value == com_id)
				var selected = 'selected = "selected"';
		
			$('#book_comname').append('<option value="'+com_id+'" '+selected+'>'+com_name+'</option>');
		}
	});
	$.each($("#liveratetable_coin > tbody tr"),function(index, value)
	{
		
	    var com_id     	= $(value).find('.com_id').html();
	    var com_name   	= $(value).find('.com_name').html();
	    var statussell 	= $(value).find('.statussell').html();
	    var statusbuy  	= $(value).find('.statusbuy').html();
		
		
		console.log(value);
		console.log(com_name);
		console.log(statussell);
		console.log(statusbuy);
	
	    if(statusbuy  == 1 && is_sell == 1)
		{
			
			if(document.getElementById("book_comid").value == com_id)
			var selected = 'selected = "selected"';
			
			$('#book_comname').append('<option value="'+com_id+'" '+selected+'>'+com_name+'</option>');
		}
		else if(statussell  == 1 && is_buy == 1)
		{
			
			if(document.getElementById("book_comid").value == com_id)
				var selected = 'selected = "selected"';
		
			$('#book_comname').append('<option value="'+com_id+'" '+selected+'>'+com_name+'</option>');
		}
	});
	document.getElementById("book_barquantity").value = $(parentRow).find('.com_bar_quantity').html();	
	document.getElementById("book_comtype").value = $(parentRow).find('.com_type').html();
	document.getElementById("margin_type").value  = $(parentRow).find('.com_margin_type').html();
	document.getElementById("margin").value  = $(parentRow).find('.com_margin_value').html();
	document.getElementById("allowed_decimals").value  = $(parentRow).find('.allowed_decimals').html();
	document.getElementById("com_bar_type").value  = $(parentRow).find('.com_bar_type').html();
	document.getElementById("bar_selection").value  = $(parentRow).find('.bar_selection').html();
	document.getElementById("com_bar_no").value  = $(parentRow).find('.com_bar_no').html();
	document.getElementById("book_comweight").value = $(parentRow).find('.com_weight').html();
	document.getElementById('order_disprate').innerHTML = "";
	document.getElementById('rate_disp').innerHTML = "";
	var book_comweight = document.getElementById("book_comweight").value;

	if($(parentRow).find('.com_unit').html() == 0)
	{
		document.getElementById('order_disprate').innerHTML = "Order Price(" +  parseFloat(book_comweight) +"Grm)";
		document.getElementById('rate_disp').innerHTML 		= "Rate(" +  parseFloat(book_comweight) +" Grm)";
	}
	else if($(parentRow).find('.com_unit').html() == 1)
	{
		document.getElementById('order_disprate').innerHTML = "Order At Price(" +  parseFloat(parseFloat(book_comweight)/1000) +" Kg)";
		document.getElementById('rate_disp').innerHTML = "Rate(" +  parseFloat(parseFloat(book_comweight)/1000) +" Kg)";
	}
	var qtyType = $("#com_bar_type").val() == 0 ? 'Gms' : 'Kg';

	if($("#bar_selection").val() == 1)
	{
		$("#required_qty").html('<select id="book_qty" name="book_qty" class="form-control width-input" tabindex="2"></select>');
		var bar_weight = parseFloat(document.getElementById("book_barquantity").value);
		var qty_no = $("#com_bar_no").val();
		for(i = 1; i <= qty_no; i++)
		{
			var total_qty = parseFloat(bar_weight)*parseFloat(i);
			$('#book_qty').append('<option value="'+total_qty+'">'+total_qty+'</option>');
		}
		$(".qty_type").html("("+qtyType+")");
		$('.displayLotSize').html("");
	}
	else
	{
		$("#required_qty").html('<input id="book_qty" name="book_qty"  type="number" class="form-control width-input" tabindex="2" />');
		$('#book_qty').val(1);
		if($("#book_barquantity").val() == 1)
		{
			$(".qty_type").html("("+qtyType+")");
			$(".displayLotSize").html("");
		}
		else
		{
			$(".displayLotSize").html("1 Qty = "+$("#book_barquantity").val()+" "+qtyType);
			$(".qty_type").html("");
		}
	}
	if(is_buy == 1)
	{
		document.getElementById("buy_sell").innerHTML = "BUY";
		$("#book_type").val(0);
		$("#book .buysellrates").css("background","#008000");
	}
	else if(is_sell == 1)
	{
		document.getElementById("buy_sell").innerHTML = "SELL";
		$("#book_type").val(1);
		$("#book .buysellrates").css("background","#FF0000");
	}
	else
	{
		document.getElementById("buy_sell").innerHTML = "";
	}

	document.getElementById("has_order").value 	= 0;
	document.getElementById("margin_type").value 	 	 = $(parentRow).find('.com_margin_type').html();
	document.getElementById("margin").value 	 	 	 = $(parentRow).find('.com_margin_value').html();
	$("#avail_margin").html(margin_balance);

	if(type == 2)
	{
		call_reviewOrder();
		load_pendingorders(idorder);
	}

	document.getElementById("book_qty").focus();

	timer_flag=0;

	$(".comm-purchase").addClass("atv_btn");

	callbook_rate(row,is_buy,is_sell);	
}
function callbook_rate(row,is_buy,is_sell) {
	if($('#new_booktype').is(':checked'))
	{
		var request_type = 0;
	}
	else if($('#new_ordertype').is(':checked'))
	{
		var request_type = 1;
	}
	else if($('#update_ordertype').is(':checked'))
	{
		var request_type = 2;
	}
	var tableid = document.getElementById("liveratetable");
	var currow = document.getElementById(row);
	if(is_buy == 1)
	{
		var current_rate_buy = $(currow).find('td:nth-child(3)').html();
		if(parseFloat(document.getElementById("book_rate").value) > parseFloat(current_rate_buy)) {
				$('#book_rate').css('color','#FFFFFF');
				$('#book_rate').css('background','#FF0000');
		} else if(parseFloat(document.getElementById("book_rate").value) < parseFloat(current_rate_buy)) {
							
				$('#book_rate').css('color','#FFFFFF');
				$('#book_rate').css('background','#008000');
		} else {
				$('#book_rate').css('color','#000');
				$('#book_rate').css('background','');
		}
		document.getElementById("book_rate").value =  current_rate_buy;
	}
	
	if(is_sell == 1)
	{
		var current_rate_sell = $(currow).find('td:nth-child(2) ').html();
		if(parseFloat(document.getElementById("book_rate").value) > parseFloat(current_rate_sell)) {
							$('#book_rate').css('color','#FFFFFF');
							$('#book_rate').css('background','#FF0000');
		} else if(parseFloat(document.getElementById("book_rate").value) < parseFloat(current_rate_sell)) {
							$('#book_rate').css('color','#FFFFFF');
							$('#book_rate').css('background','#FF0000');
		} else {
							$('#book_rate').css('color','#000');
							$('#book_rate').css('background','');
		}
		document.getElementById("book_rate").value = current_rate_sell;
		
	}

	if(request_type == 0)
	{
		if(is_buy == 1)
			$(".rateval").html(current_rate_buy);
		else if(is_sell == 1)
			$(".rateval").html(current_rate_sell);
		else
			$(".rateval").html(0.00);
	}
	if(request_type == 1)
	{
		if(is_buy == 1)
			$(".rateval").html($("#order_rate").val());
		else if(is_sell == 1)
			$(".rateval").html($("#order_rate").val());
		else
			$(".rateval").html(0.00);
	}

	if(request_type == 2)
	{
		$(".rateval_update").html($("#order_rate").val());
	}

	calculateTotal(row,is_buy,is_sell);
	if(timer_flag == 0 ) {
		timer = setTimeout("callbook_rate('"+row+"',"+is_buy+","+is_sell+")",600);
	}	
}
function cleartime() {
	clearTimeout(timer);
	clearTimeout(timer_status);
	timer_flag = 1;
}
function trade_disable()
{
	$('#booking_status').html("Currently trade has been disabled...Please try again later...");
	$('#status_modal').modal({
				backdrop: 'static',
				keyboard: false
			});
}
function edit_limit(book_comid,book_no,book_type)
{
	if(enable_trade == 1)
	{
		var rateid = '';
		var buysellstatus = "";
		$.each($("#liveratetable tbody tr"),function(j,rates)
		{
			var com_id  =$(rates).find('.com_id').html();
			if(com_id == book_comid)
			{
				if(book_type == 0)
				{
					rateid = $(rates).find('td:nth-child(3)').get(0);
					buysellstatus = 1;
				}
				else if(book_type == 1)
				{
					rateid = $(rates).find('td:nth-child(2)').get(0);
					buysellstatus = 0;
				}			
				return false;
			}
		});
		show_values(rateid,buysellstatus,2,book_no);
	}
	else
	{
		trade_disable();
	}
}
function load_report(report_type)
{
 	if(report_type == 1)
	{
		$('#reports').css({"opacity": "0.5", "pointer-events": "none"});
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_trade_history").addClass("headings-active");
		try {
		var table='';
		table +='<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date & Time</th><th>Commodity</th><th>Type</th><th>Qty</th><th>Rate</th><th>Del Qty</th><th>Pen Qty</th><th>Book by</th><th>Status</th></tr><thead><tbody>';
		$.ajax({
			type: "POST",
			dataType: "json",					   
			url: SITE_BASE_URL+"index.php/C_trade/get_booking_report/trade_model/0",
			success: function(data)
			{
				$('#reports').css({"opacity": "1", "pointer-events": "all"});
				
				var table_val='';
				$.each (data[0], function (i) {
					
				var status = data[0][i]['bookstatus'];
				status = (status == 6 ? '<span class="label label-success bg-darkgreen font-label">Delivered</span>' : (status == 2 ? '<span class="label label-primary font-label">Waiting for approval</span>' : (status == 3 ? '<span class="label label-danger font-label">Rejected</span>' : (status == 1 ? '<span class="label label-success font-label">Confirmed</span>' : (status == 4 ? '<span class="label label-danger font-label">Limit Cancelled</span>' : (status == 5 ? '<span class="label label-success bg-darkgreen font-label">Partial Del</span>' : (status == 0 ? '<span class="label label-info font-label">Pending</span>' : (status == 7 ? '<span class="label bg-darkred">Expired</span>' : (status == 8 ? '<span class="label bg-darkred">Cancelled, Insufficient margin</span>' : "")))))))));

				table_val += '<tr><td>'+data[0][i]['book_no']+'</td><td>'+data[0][i]['book_datetime']+'</td><td>'+data[0][i]['com_name']+'</td><td>'+data[0][i]['type']+'</td><td>'+data[0][i]['qty']+'</td><td>'+(IND_money_format(data[0][i]['book_rate']))+'</td><td>'+data[0][i]['delivered_qty']+'</td><td>'+data[0][i]['pending_qty']+'</td><td>'+data[0][i]['book_by']+'</td><td>'+status+'</td></tr>';
				});
				if(table_val == '')
				{
					table_val = '<tr><td colspan="10">No data available in table</td></tr>';
					row_length = false;
				}

				table += table_val;	
				table += '</tbody>';
				table += '<table>';
				$('#reports').empty().append(table);
			},
			error: function(request,error) {
			}
		});
	}catch(ex)
	{
		console.log(ex);
	}
  }
 else if (report_type == 2)
 {
		$('#reports').css({"opacity": "0.5", "pointer-events": "none"});
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_pending_deal").addClass("headings-active");
  	    try {
		var table='';
		table +='<table class="table table-bordered table-striped table-hover report_table"><thead><tr><th>Ref No.</th><th>Date & Time</th><th>Commodity</th><th> Type</th><th>Qty</th><th>Rate</th><th>Status</th><th>Edit</th></tr><thead><tbody>';
		$.ajax({						
			type: "POST",
			dataType: "json",					   
			url:SITE_BASE_URL+"index.php/C_trade/get_pending_order/trade_model/0",
			success: function(data)
			{
				$('#reports').css({"opacity": "1", "pointer-events": "all"});
				
				var table_val='';
				var ratetr = '';
				$.each(data[0], function (i)
				{
					status = '<span class="label label-info font-label">Pending</span>';

					table_val += '<tr ><td id="orderid">'+data[0][i]['book_no']+'</td><td>'+data[0][i]['book_datetime']+'</td><td >'+data[0][i]['com_name']+'</td><td>'+data[0][i]['type']+'</td><td>'+data[0][i]['qty']+'</td><td>'+(IND_money_format(data[0][i]['book_rate']))+'</td><td>'+status+'</td><td style="cursor:pointer;" onclick="edit_limit('+ data[0][i]['book_comid']+','+data[0][i]['book_no']+','+data[0][i]['book_type']+')" title="Click here to edit"><label style="cursor:pointer;" for="" >Edit</label></td></tr>';
				});
				if(table_val == '')
				{
					table_val = '<tr><td colspan="9">No data available in table</td></tr>';
					row_length = false;
				}
				
				table += table_val;	
				table += '</tbody>';
				table += '<table>';
				$('#reports').empty().append(table);
			
			
			},
			error: function(request,error) {
			}
		});
	}catch(ex)
	{
		console.log(ex);
	}
  }
  else if (report_type == 3)
  {
		$('#reports').css({"opacity": "0.5", "pointer-events": "none"});
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_transactions").addClass("headings-active");
  	    try {
		var table='';
		table +='<table class="table table-bordered table-striped table-hover report_table">';
		table +='<thead><tr><th>Date & Time</th><th>Transaction Type</th><th >Credit</th><th>Debit</th><th>Closing Balance</th></tr></thead><tbody>';
		$.ajax({						
			type: "POST",
			dataType: "json",					   
			url: SITE_BASE_URL+"index.php/C_trade/get_customertransactions/trade_model/",
			success: function(data)
			{
				$('#reports').css({"opacity": "1", "pointer-events": "all"});
				var last_five = parseInt(data.length) - 5;
				var table_val='';
				$.each(data, function (i,values) {
					if(parseInt(i) >= parseInt(last_five))
					{
						table_val += '<tr><td>'+values.TransactionDate+'</td><td>'+values.TransactionType+'</td><td>'+values.Credit+'</td><td>'+values.Debit+'</td><td>'+values.balance+'</td></tr>';
					}
				});
				if(table_val == '')
				{
					table_val = '<tr><td colspan="5">No data available in table</td></tr>';
					row_length = false;
				}
				table += table_val;	
				table += '</tbody>';
				table += '<table>';
				$('#reports').empty().append(table);
			},
			error: function(request,error) {
			} 
		});
	}catch(ex)
	{
		console.log(ex);
	}
  }
  else if (report_type == 5)
  {
		$('#reports').css({"opacity": "0.5", "pointer-events": "none"});
		$(".report-heading .headings").removeClass("headings-active");
		$(".report-heading #rep_tradable").addClass("headings-active");
  	    try {
		var table='';
		table +='<table class="table table-bordered table-striped table-hover report_table">';
		table +='<thead><tr><th >Commodity</th><th style="text-align:center">Min. Order Qty</th><th style="text-align:center">Max. Order Qty</th><th style="text-align:center">Max. Allot Qty</th></tr></thead><tbody>';
		$.ajax({						
			type: "POST",
			dataType: "json",					   
			  url: SITE_BASE_URL+"index.php/C_trade/get_clientlimit/trade_model",
			success: function(data)
			{
				$('#reports').css({"opacity": "1", "pointer-events": "all"});
				
				var table_val='';

				table_val += '<tr><td>Gold</td><td>'+data[0]['gold_min_qty']+'</td><td>'+data[0]['gold_max_qty']+'</td><td>'+data[0]['gold_allot_qty']+'</td></tr><tr><td>Silver</td><td>'+data[0]['silver_min_qty']+'</td><td>'+data[0]['silver_max_qty']+'</td><td>'+data[0]['silver_allot_qty']+'</td></tr>';

				if(table_val == '')
				{
					table_val = '<tr><td colspan="2">No data available in table</td></tr>';
					row_length = false;
				}

				table += table_val;	
				table += '</tbody></table>';
				$('#reports').empty().append(table);
			},
			error: function(request,error) {
			}
		});
	}catch(ex)
	{
		console.log(ex);
	}

  }
}
function logout()
{
	location.reload();
}
