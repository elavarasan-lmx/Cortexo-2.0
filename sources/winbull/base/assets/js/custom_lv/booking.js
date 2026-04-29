$(document).ready(function() {
	document.addEventListener("visibilitychange", function() {
		if (document.hidden){
			console.log("Browser tab is hidden")
		} else {
			commodity_update();
		}
	});
	
	//socket.on("lmxtradeupdatecommodity:App\\Events\\LMXTRADECommodityUpdates", function(data){
	socket.on(comm_update, function(data){
		   commodity_update();
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
 });

function commodity_update()
{
	var $ = jQuery.noConflict();
	$.ajax({
		url : SITE_BASE_URL+"index.php/C_booking/get_commodity_data",
		type : "GET",
		dataType : "json",
		data: "",
		async: false,
		success: function(data){
			rpanelcontract = data.contracts;
			if(data.commodity.commoditydetails.length > 0){
				$("#liveratetable tbody").empty();
				$("#liveratetable_coin tbody").empty();
			}
			$.each(data.commodity.commoditydetails,function(idx, commodity){
				if(commodity.com_is_coin != 1)
				{
					var tablerow = '<tr class="liverate-body"><td class="ratevaluerightborder">' + commodity.com_name +'</td><td class="ratevalue2"></td><td class="ratevalue2"></td><td class="ratevalue11">' + commodity.deliverydays +'</td><td style="display:none;"><div class="com_id">'+ commodity.com_id + '</div><div class="com_type">'+ commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">'+ commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">'+ commodity.com_buy_premium + '</div><div class="com_premium_type">'+ commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">'+ commodity.com_delverydays + '</div><div class="com_isregion">'+ commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">'+ commodity.com_roundoff + '</div></td></tr>';
					$("#liveratetable tbody").append(tablerow);
				}
				if(commodity.com_is_coin == 1)
				{
					var tablerow = '<tr class="table1"><td class="ratevalue1">' + commodity.com_name +'</td><td ><span class="ratevalue2" ></span></td><td class="ratevalue_1"><span class="ratevalue2"></span></td><td style="display:none;">' + commodity.deliverydays +'</td><td style="display:none;"><div class="com_id">'+ commodity.com_id + '</div><div class="com_type">'+ commodity.com_type + '</div><div class="com_weight">' + commodity.com_weight + '</div><div class="com_other_charges">'+ commodity.com_other_charges + '</div><div class="com_correction_type">' + commodity.com_correction_type + '</div><div class="com_sel_premium">' + commodity.com_sel_premium + '</div><div class="com_buy_premium">'+ commodity.com_buy_premium + '</div><div class="com_premium_type">'+ commodity.com_premium_type + '</div><div class="com_sel_active">' + commodity.com_sel_active + '</div><div class="com_buy_active">' + commodity.com_buy_active + '</div><div class="com_delverydays">'+ commodity.com_delverydays + '</div><div class="com_isregion">'+ commodity.com_isregion + '</div><div class="com_calpurity">' + commodity.com_calpurity + '</div><div class="com_tax">' + commodity.com_tax + '</div><div class="com_octroi">' + commodity.com_octroi + '</div><div class="com_stamduty">' + commodity.com_stamduty + '</div><div class="deliverydays">' + commodity.deliverydays + '</div><div class="displyname">' + commodity.displyname + '</div><div class="mcxsymbol">' + commodity.mcxsymbol + '</div><div class="banksymbol">' + commodity.banksymbol + '</div><div class="rcomid">' + commodity.rcomid + '</div><div class="trade_type">' + commodity.trade_type + '</div><div class="sell_diff">' + commodity.sell_diff + '</div><div class="buy_diff">' + commodity.buy_diff + '</div><div class="sell_rate">' + commodity.sell_rate + '</div><div class="com_display_purity">' + commodity.com_display_purity + '</div><div class="com_is_coin">' + commodity.com_is_coin + '</div><div class="com_roundoff">'+ commodity.com_roundoff + '</div></td></tr>';
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
	var $ = jQuery.noConflict();
	$.ajax({
		url : SITE_BASE_URL+"index.php/C_booking/get_rpanel_data",
		type : "GET",
		dataType : "json",
		data: "",
		async: false,
		success: function(data){
			
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
				if($('#gold_bid').html() == null || isNaN($('#gold_bid').html() || isNaN($('#s_mcx_bid').html()) || isNaN($('#g_mcx_bid').html()) || isNaN($('#mcx_bid').html()))) {
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
						if(com_is_coin != 1){
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
						}
					});
				}
			};
	    callback();
	    window.setInterval(callback, 300);
	})();
var $ = jQuery.noConflict();
$(function() {
	//set_rate();
	setInterval(function(){ updateIndicator(); }, 5000);
	get_MarqueNews();
});

function updateIndicator() {
	var online = navigator.onLine;
	if(online){
		document.getElementById("connectionmsg").innerHTML = "";
		document.getElementById("connectionmsg").style.display = "none";
	}else{
		document.getElementById("connectionmsg").innerHTML = "Please check your internet connection";
		document.getElementById("connectionmsg").style.display = "block";
	}
}
var $ = jQuery.noConflict();
$(document).ready(function()
{
		$.ajax(
		{
			url : SITE_BASE_URL+"index.php/C_booking/getadvertisements",
			type : "GET",
			dataType : "json",
			data: "",
			async: false,
			success: function(xmlDoc)
			{
				var adv1 = "<section class='slider'><div class='flexslider'><ul class='slides'>";
				var adv2 = "<ul class='slides'>";
				$.each(xmlDoc,function(key,value){
					if(value.type == 0){
						adv1 += '<li><img src="'+SITE_BASE_URL+value.location+'"  height="auto" style="width:100%";/></li>';
					}else if(value.type == 1){
						adv2 += '<li><img src="'+SITE_BASE_URL+value.location+'" height="auto" style="width:100%"; /></li>';
					}
				});
				adv1 += "</ul></div></section>";
				adv2 += "</ul>";
				$('.adv1').html(adv1);
				$('#adv2').html(adv2);		
			},
			error: function(request,error)
			{
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

$(function() {
	window.setInterval(function() { calcTime('5.51','1.00','-4.03','9.00'); },1000);
});