import { Component, NgZone, ApplicationRef, ChangeDetectorRef, } from "@angular/core";
import { ViewChild } from "@angular/core";
import { Network } from "@ionic-native/network";
import { NavController, ToastController, LoadingController, Events, ModalController, MenuController, AlertController, } from "ionic-angular";
import { Platform } from "ionic-angular";
import { Subscription } from "rxjs";
import { from } from "rxjs/observable/from";
import { Slides } from "ionic-angular";
import { BookingPage } from "../booking/booking";
import { LoginPage } from "../login/login";
// import { TradablecommoditylistPage } from "../../pages/tradablecommoditylist/tradablecommoditylist";
import { CommonServiceProvider } from "../../providers/common-service/common-service";
import { LiveratesProvider } from "../../providers/liverates/liverates";
// import { WhatsappPage } from "../whatsapp/whatsapp";
import { SocialsharePage } from '../socialshare/socialshare';
declare var rateFeed: any;

export interface IBidAskRate {
	desc: string;
	bid: string;
	ask: string;
	high: string;
	low: string;
	ltp: string;
}

@Component({
	selector: "page-home",
	templateUrl: "home.html",
})
export class HomePage {
	@ViewChild(Slides) slides: Slides;

	private onResumeSubscription: Subscription;
	baserates: { [id: string]: any } = [];
	oldbaserates: { [id: string]: any } = [];

	base_rates: any = [];
	old_base_rates: any = [];

	current_rates: any = [];
	old_current_rates: any = [];

	rates: Array<IBidAskRate> = [];

	bidaskrates: any = {};
	oldbidaskrates: any = {};

	commodities: any = [];
	rpaneldifferences: any = [];
	rpanelsettings: any = {};
	rpaneldata: any = [];
	rpanelbankrates: any = [];
	rpanelcontract: any = [];
	rpanelcommodities: any = [];

	liverates: any = [];
	oldliverates: any = [];
	marqueetext: any = "";
	booknos: any = "";
	marketclosedmsg: any = "";
	marketstatus: number = 1;
	mjdmarates: any = { 'goldrate_22ct': '-', 'silverrate_1gm': '-', 'display': 0 };
	cjarates: any = { 'goldrate_22ct': '-', 'silverrate_1gm': '-', 'display': 0 };
	commodityarray: any = [];
	trade_enable: any = 0;
	userlogged: any = 0;

	touchtocalldetails: any = [];
	touchtowhatsappdetails: any = [];
	public isShown: boolean = true;
	userid = "";
	advfiles: any = [];
	loader: any = false;

	oldData: any;
	updatetime: any;
	sliderimage: any = [];
	sliders: any = [];
	rateFeed: any;
	flashTimers: any = {}; // Timer map for flash colors (like web's flashCell)
	constructor(public toastController: ToastController, public menuCtrl: MenuController, public navCtrl: NavController, public liverateservice: LiveratesProvider, private zone: NgZone, platform: Platform, private network: Network, private event: Events, private commonservice: CommonServiceProvider, public alertCtrl: AlertController, private applicationRef: ApplicationRef, private changeRef: ChangeDetectorRef, public modalCtrl: ModalController,) {
		this.trade_enable = localStorage.getItem("MAHARAJ_trade_enable") == "1" ? 1 : 0;
		this.trade_enable = localStorage.getItem("MAHARAJ_trade_enable");
		this.userid = localStorage.getItem("MAHARAJ_userId");
		this.userlogged = localStorage.getItem("MAHARAJ_userlogged") == "1" ? 1 : 0;
		this.menuCtrl.enable(true, "myMenu");

		// Keep userlogged in sync when login/logout happens elsewhere
		this.event.subscribe('username:changed', (userdata) => {
			if (userdata && userdata.loginstatus !== undefined) {
				this.userlogged = userdata.loginstatus ? 1 : 0;
			}
		});
	}

	gotocusComListPg() {
		if (localStorage.getItem("MAHARAJ_userlogged") == "1") {
			if (localStorage.getItem("MAHARAJ_trade_enable") == "1") {
				this.event.publish("tab:changed", "TradablecommoditylistPage");
				// this.navCtrl.setRoot(TradablecommoditylistPage, {});
			} else {
				let toastController = this.toastController;
				toastController
					.create({
						message: "Trade Closed",
						duration: 3000,
					})
					.present();
			}
		} else {
			this.event.publish("tab:changed", "LoginPage");
			this.navCtrl.setRoot(LoginPage, {
				comid: 0,
				reqtype: 0,
				page: "bookinglisting",
			});
		}
	}
	gotoBookingPage1(comid, reqtype, currate) {
		if (comid != undefined && reqtype != undefined && currate != "-") {
			console.log(comid + "\t" + reqtype);
			let navCtrl = this.navCtrl;
			let toastController = this.toastController;
			if (localStorage.getItem('MAHARAJ_userlogged') == "1") {
				console.log("home: " + localStorage.getItem('MAHARAJ_trade_enable'));
				if (localStorage.getItem('MAHARAJ_trade_enable') == "1") {
					this.commodityarray = JSON.parse(localStorage.getItem('MAHARAJ_user_commodityData'));
					console.log(this.commodityarray, '121212');

					if (this.commodityarray.length > 0) {
						this.commodityarray.forEach(function (value, key2) {
							console.log(comid + "==" + value.comid);
							if (comid == value.comid) {
								// Check specific direction permission based on reqtype
								var canTrade = false;
								if (reqtype == '1') {
									// Buy click — need both commodity-level and customer-level buy permission
									canTrade = (value.com_buy_trade == 1 && value.cus_com_status_buy == 1);
								} else if (reqtype == '0') {
									// Sell click — need both commodity-level and customer-level sell permission
									canTrade = (value.com_sel_trade == 1 && value.cus_com_status_sell == 1);
								}
								if (canTrade) {
									navCtrl.setRoot(BookingPage, { 'comid': comid, 'reqtype': reqtype, 'page': "booking" });
								} else {
									console.log("Trade is disabled for this commodity");
									toastController.create({
										message: "Trade is disabled for this commodity",
										duration: 3000
									}).present();
								}
							}
						});
					} else {
						toastController.create({
							message: "No commodities is enabled for you",
							duration: 3000
						}).present();
						console.log("No commodities is enabled");
					}
				} else {
					console.log("Trade Closed");
					toastController.create({
						message: "Trade Closed",
						duration: 3000
					}).present();
				}
			} else {
				console.log("Please login to trade: " + localStorage.getItem('MAHARAJ_userlogged'));
				console.log(comid + "\t" + reqtype);
				this.navCtrl.setRoot(LoginPage, { 'comid': 0, 'reqtype': 0, 'page': "bookinglisting" });
				this.event.publish('tab:changed', "LoginPage");

			}
		} else {
			console.log(comid + "\t" + reqtype);
		}
	}

	updateCommodities() {
		console.log('updateCommodities called');

		if (localStorage.getItem('MAHARAJ_userlogged') == "1") {
			let userid = localStorage.getItem('MAHARAJ_userId');
			this.commonservice.getCommodities(userid).then(result => {
				if (result.data.success) {
					localStorage.setItem('MAHARAJ_trade_enable', result.data.settings.trade_enable);
					localStorage.setItem('MAHARAJ_user_commodityData', JSON.stringify(result.data.comgroupData));
					localStorage.setItem('MAHARAJ_margindata', JSON.stringify(result.data.settings));
					localStorage.setItem('MAHARAJ_available_balance', result.data.available_balance);
					localStorage.setItem('MAHARAJ_display_margin', result.data.settings.display_margin);
					localStorage.setItem('MAHARAJ_market_on', result.data.settings.market_on);
					localStorage.setItem('MAHARAJ_market_off', result.data.settings.market_off);
					localStorage.setItem('MAHARAJ_user_status', result.data.user_status);
					localStorage.setItem('MAHARAJ_Check_Live_Price', result.data.settings.booking_value_check_enabled);
					if (result.data.user_status != 1) {
						console.log(1);
						let alert = this.alertCtrl.create({
							title: 'Session Timeout',
							subTitle: 'Account Expired!!',
							buttons: ['Ok']
						});
						alert.present();
						localStorage.setItem('MAHARAJ_userData', JSON.stringify({
							'loginstatus': false,
							'username': 'guest',
							'usergroup': 'Default'
						}));
						this.event.publish('username:changed', {
							'loginstatus': false,
							'username': 'guest',
							'usergroup': 'Default'
						});
						this.event.publish('tab:changed', "LoginPage");
						localStorage.setItem('MAHARAJ_user_status', JSON.stringify({
							'user_status': 1,
						}));
						localStorage.setItem('MAHARAJ_userlogged', "0");
						this.navCtrl.setRoot(LoginPage);
					}

					localStorage.setItem('MAHARAJ_user_status', result.data.user_status);
					localStorage.setItem('MAHARAJclientlimit_enable', result.data.settings['clientlimit_enable']);
					this.event.publish("MAHARAJclientlimit_enable", result.data.settings['clientlimit_enable']);
					localStorage.setItem("MAHARAJlimit_enable", result.data.cus_settings.cuslimit_enable);
					this.event.publish("limit_enable:changed", result.data.settings.limit_enable);
				} else {
					console.log("result.data.success(getCommodities): " + result.data.success);
				}
			});
		}
	}

	slideChanged() {
		let currentIndex = this.advfiles.getActiveIndex();
		console.log("Current index is", currentIndex);
	}

	ionViewDidLoad() {
		// this.baserateInit();
		this.fetch_data();
		this.updateCommodities();

		this.liverateservice.getmarqueetext().subscribe((res) => {
			this.marqueetext = res.marquee;
			this.booknos = res.booknos;
		});

		let slidetype = [];
		this.commonservice.sliderimgs().then((data) => {
			console.log("Slider:" + JSON.stringify(data));
			this.sliders = data;
			this.sliders.map((res) => {
				if (res.type == 1) {
					slidetype.push(res);
				} else {
					//slidetype1.push(res);
				}
				this.sliderimage = slidetype;
				//this.sliderimage1 = slidetype1;
			});
			//this.banner=data;
			console.log("Slider:" + JSON.stringify(this.sliderimage));
		});

		this.commonservice.getphonenumbers().subscribe((res) => {
			this.touchtocalldetails = res["phone"];
			this.touchtowhatsappdetails = res["whatsapp"];
		});
		this.liverateservice.getcommodityupdatescallback().subscribe(data => {
			this.zone.run(() => {
				if (data != null) {
					if (data['commodity'] != undefined) {
						this.commodities = data['commodity'];
					} else {
						this.commodities = [];
					} //when update happened socket will update this in next time
					this.rpanelcontract = data['rpanel_contracts'];
					this.updateCommodities();
					// this.commonservice.getCommodities(this.userid).then((result) => {
					// 	console.log("result");
					// 	let temp = result.data.comgroupData;
					// 	if (temp.length > 0) {
					// 		localStorage.setItem('MAHARAJ_user_commodityData', JSON.stringify(result.data.comgroupData));
					// 	} else {
					// 		console.log(localStorage.getItem('MAHARAJ_user_commodityData'));
					// 		localStorage.setItem('MAHARAJ_user_commodityData', JSON.stringify(result.data.comgroupData));
					// 	}
					// 	// this.baserateInit();
					// 	this.fetch_data();

					// });
				}
			});
			this.updateCommodities();
		});
		this.liverateservice.getrpanelrateupdatescallback().subscribe((data) => {
			this.zone.run(() => {
				if (data != null) {
					this.rpanelbankrates = data['rpanelbank'];
					this.rpaneldata = data['rpaneldata'];
					this.rpanelcommodities = data['rpanel_commodities'];

				}
			});
			// this.baserateInit();
			this.updateCommodities();
			// this.fetch_data();
		});

		this.liverateservice.getmarqueeupdatescallback().subscribe(data => {
			this.zone.run(() => {
				if (data != null) {
					this.marqueetext = data;
				}
			});
		});

		this.liverateservice.getcommodityupdatetimecallback().subscribe(data => {
			console.log("Home Page", data);
			this.trade_enable = localStorage.getItem('MAHARAJ_trade_enable') == "1" ? 1 : 0;
			this.updateCommodities();
			// this.baserateInit();
			// this.fetch_data();

		});
	}

	fetch_data() {

		if (rateFeed === 3) {
			this.liverateservice.getRateUpdates().subscribe(data => {
				this.zone.run(() => {
					if (data != null) {
						this.baserateInit(data);
					}
				});
			});
		} else {
			this.liverateservice.getrfcallback((data) => {
				this.zone.run(() => {
					this.baserateInit(data);
				});
			});

			// For rateFeed=4 (native WebSocket): immediately render cached rates
			// so returning to the page shows data instantly without waiting for the next WS message
			if (rateFeed == 4) {
				const cached = this.liverateservice.getCachedState();
				if (cached) {
					console.log('fetch_data: rendering cached rate state immediately');
					this.zone.run(() => {
						this.baserateInit(cached);
					});
				}
			}
		}
	}

	// baserateInit(data) {
	// 	// this.liverateservice.getrfcallback((data) => {
	// 	let messagesDesktopp = data.split("\n");
	// 	let tmp_bidaskrates: any = [];
	// 	let curr_bidaskrates: any = [];
	// 	if (typeof this.oldData != "undefined") {
	// 	} else {
	// 		this.oldData = data.toString();
	// 	}
	// 	var messagesOldDesktop = this.oldData.split("\n");

	// 	for (var i = 0; i < messagesDesktopp.length; i++) {
	// 		var retDesktop = messagesDesktopp[i].split("\t");
	// 		var oldRetDesktop;
	// 		// oldRetDesktop = messagesOldDesktop[i].split("\t");
	// 		if (messagesOldDesktop[i] !== undefined) {
	// 			oldRetDesktop = messagesOldDesktop[i].split("\t");
	// 		}
	// 		if (typeof retDesktop[1] != "undefined") {
	// 			if (retDesktop[0] == 1 && retDesktop[2] != "SILVER($)") {
	// 				let bid_class = "ratenormal";
	// 				let ask_class = "ratenormal";
	// 				if (retDesktop[3] > oldRetDesktop[3]) {
	// 					bid_class = "ratehigh";
	// 				} else if (retDesktop[3] < oldRetDesktop[3]) {
	// 					bid_class = "ratelow";
	// 				}

	// 				if (retDesktop[4] > oldRetDesktop[4]) {
	// 					ask_class = "ratehigh";
	// 				} else if (retDesktop[4] < oldRetDesktop[4]) {
	// 					ask_class = "ratelow";
	// 				}
	// 				tmp_bidaskrates.push({
	// 					symbol: retDesktop[2],
	// 					bid: retDesktop[3],
	// 					ask: retDesktop[4],
	// 					high: retDesktop[5],
	// 					low: retDesktop[6],
	// 					askclass: ask_class,
	// 					bidclass: bid_class,
	// 				});
	// 			}
	// 			if (typeof retDesktop[2] != "undefined") {
	// 				if (retDesktop[0] == 2) {
	// 					let bid_class1 = "ratenormal";
	// 					let ask_class1 = "ratenormal";
	// 					if (retDesktop[3] > oldRetDesktop[3]) {
	// 						bid_class1 = "ratehigh";
	// 					} else if (retDesktop[3] < oldRetDesktop[3]) {
	// 						bid_class1 = "ratelow";
	// 					}

	// 					if (retDesktop[4] > oldRetDesktop[4]) {
	// 						ask_class1 = "ratehigh";
	// 					} else if (retDesktop[4] < oldRetDesktop[4]) {
	// 						ask_class1 = "ratelow";
	// 					}
	// 					curr_bidaskrates.push({
	// 						symbol: retDesktop[2],
	// 						bid: retDesktop[3],
	// 						ask: retDesktop[4],
	// 						high: retDesktop[5],
	// 						low: retDesktop[6],
	// 						askclass: ask_class1,
	// 						bidclass: bid_class1,
	// 					});
	// 				}
	// 			}
	// 			if (retDesktop[0] == 4) {
	// 				// this.updatetime = retDesktop[6].replace(/"/g, '');
	// 				if (retDesktop[3] == 0 || retDesktop[4] == 1) {
	// 					this.marketstatus = 0;
	// 					this.event.publish("marketstatus:changed", this.marketstatus);
	// 					if (retDesktop[4] == 1) {
	// 						this.marketclosedmsg = retDesktop[5];
	// 					} else {
	// 						this.marketclosedmsg =
	// 							"Please wait market will be open shortly.";
	// 					}
	// 				} else {
	// 					this.marketstatus = 1;
	// 					this.event.publish("marketstatus:changed", this.marketstatus);
	// 				}
	// 			}
	// 		}
	// 	}
	// 	if (typeof this.base_rates != "undefined") {
	// 	} else {
	// 		this.old_base_rates = this.base_rates;
	// 	}
	// 	this.old_base_rates = this.base_rates;
	// 	this.base_rates = tmp_bidaskrates;

	// 	if (typeof this.current_rates != "undefined") {
	// 	} else {
	// 		this.old_current_rates = this.current_rates;
	// 	}
	// 	this.old_current_rates = this.current_rates;
	// 	this.current_rates = curr_bidaskrates;
	// 	this.applicationRef.tick();

	// 	let currentliverates: any = [];
	// 	let allliverates: any = [];
	// 	if (this.current_rates !== null && this.base_rates !== null) {
	// 		if (this.current_rates.length != 0 || this.base_rates.length != 0) {
	// 			this.loader = false;
	// 		}
	// 	}
	// 	for (var i = 0; i < messagesDesktopp.length; i++) {
	// 		var liveretDesktop = messagesDesktopp[i].split("\t");
	// 		var liveoldRetDesktop;
	// 		if (messagesOldDesktop[i] !== undefined) {
	// 			liveoldRetDesktop = messagesOldDesktop[i].split("\t");
	// 		}

	// 		if (typeof liveretDesktop[1] != "undefined") {
	// 			if (liveretDesktop[0] == 3) {

	// 				this.commodities.forEach((value, key) => {
	// 					if (liveretDesktop[1] == value.com_id) {
	// 						let com_id = parseInt(value.com_id);
	// 						let com_name = value.com_name;
	// 						let com_type = parseInt(value.com_type);
	// 						let com_weight = parseFloat(value.com_weight);
	// 						let com_sel_active = parseInt(value.com_sel_active);
	// 						let com_buy_active = parseInt(value.com_buy_active);
	// 						let is_coin = parseInt(value.com_is_coin);
	// 						let deliverydays = value.deliverydays;

	// 						let prem_comsell_active = parseInt(value.prem_comsell_active);
	// 						let prem_combuy_active = parseInt(value.prem_combuy_active);

	// 						let displyname = value.displyname;
	// 						let com_roundoff = parseInt(value.com_roundoff);
	// 						let com_selretail_active = value.com_selretail_active;
	// 						let com_selretail_premium = parseInt(value.com_selretail_premium);
	// 						let rtgs_rate: any = 0;
	// 						let selling_rate: any = 0;
	// 						let buying_rate: any = 0;
	// 						let retail_rate: any = 0;
	// 						let buy_status = "0";
	// 						let sell_status = "0";
	// 						let retail_status = "0";
	// 						let user_buy_active: any = "0";
	// 						let user_sell_active: any = "0";
	// 						let user_sellretail_active: any = "0";
	// 						// let prem_buy_premium = parseInt(value.prem_buy_premium);
	// 						// let prem_sel_premium = parseInt(value.prem_sel_premium);
	// 						let prem_buy_premium = isNaN(parseInt(value.prem_buy_premium)) ? 0 : parseInt(value.prem_buy_premium);
	// 						let prem_sel_premium = isNaN(parseInt(value.prem_sel_premium)) ? 0 : parseInt(value.prem_sel_premium);
	// 						let prem_selretail_premium = parseInt(value.prem_selretail_premium);
	// 						selling_rate = liveretDesktop[4];
	// 						buying_rate = liveretDesktop[3];

	// 						let currentsell = "ratenormal";
	// 						let currentbuy = "ratenormal";

	// 						if (liveretDesktop[3] > liveoldRetDesktop[3]) {
	// 							currentbuy = "ratehigh";
	// 						} else if (liveretDesktop[3] < liveoldRetDesktop[3]) {
	// 							currentbuy = "ratelow";
	// 						}

	// 						if (liveretDesktop[4] > liveoldRetDesktop[4]) {
	// 							currentsell = "ratehigh";
	// 						} else if (liveretDesktop[4] < liveoldRetDesktop[4]) {
	// 							currentsell = "ratelow";
	// 						}

	// 						if (localStorage.getItem("MAHARAJ_userlogged") == "1") {
	// 							let commodity_array = JSON.parse(
	// 								localStorage.getItem("MAHARAJ_user_commodityData")
	// 							);
	// 							var buy_active: any = 0;
	// 							var sell_active: any = 0;
	// 							var sellretail_active: any = 0;
	// 							if (commodity_array.length > 0) {
	// 								commodity_array.forEach((value1, key1) => {
	// 									if (value1.comid == com_id) {
	// 										buy_active = value1.buy_active;
	// 										sell_active = value1.sell_active;
	// 										sellretail_active = value1.sellretail_active;
	// 										prem_buy_premium = value1.prem_buy_premium;
	// 										prem_selretail_premium = value1.prem_selretail_premium;
	// 										prem_sel_premium = value1.prem_sel_premium;
	// 										if (value1.cus_com_status_buy == 0 || value1.buy_active == 0) {
	// 											buying_rate = "-";
	// 										}
	// 										if (value1.cus_com_status_sell == 0 || value1.sell_active == 0) {
	// 											selling_rate = "-";
	// 										}
	// 										if (value1.com_buy_trade == 1 && value1.cus_com_status_buy == 1) {
	// 											buy_status = "1";
	// 										}
	// 										if (value1.com_sel_trade == 1 && value1.cus_com_status_sell == 1) {
	// 											sell_status = "1";
	// 										}
	// 										if (value1.com_retail_trade == 1 && value1.cus_com_status_sell == 1) {
	// 											retail_status = "1";
	// 										}
	// 										if (value1.buy_active == 1) {
	// 											user_buy_active = 1;
	// 										}
	// 										if (value1.sell_active == 1) {
	// 											user_sell_active = 1;
	// 										}
	// 										if (value1.sellretail_active == 1) {
	// 											user_sellretail_active = 1;
	// 										}
	// 									}
	// 								});
	// 							} else {
	// 								buy_status = "0";
	// 								sell_status = "0";
	// 							}
	// 						} else {
	// 							if (prem_comsell_active == 0) {
	// 								selling_rate = "-";
	// 							}
	// 							if (prem_combuy_active == 0) {
	// 								buying_rate = "-";
	// 							}
	// 						}

	// 						if (localStorage.getItem("MAHARAJ_userlogged") == "1") {
	// 							allliverates.push({
	// 								deliverydays: deliverydays,
	// 								prem_buy_premium: prem_buy_premium,
	// 								prem_sel_premium: prem_sel_premium,
	// 								trade_enable: this.trade_enable,
	// 								prem_selretail_premium: prem_selretail_premium,
	// 								buy_active: buy_active,
	// 								sell_active: sell_active,
	// 								sellretail_active: sellretail_active,
	// 								com_id: com_id,
	// 								com_name: com_name,
	// 								buying_rate: buying_rate,
	// 								selling_rate: selling_rate,
	// 								delivery: deliverydays,
	// 								com_type: com_type,
	// 								rselling_rate: retail_rate,
	// 								buy_status: buy_status,
	// 								sell_status: sell_status,
	// 								retail_status: retail_status,
	// 								trade: 1,
	// 								is_coin: is_coin,
	// 								user_sell_active: user_sell_active,
	// 								user_buy_active: user_buy_active,
	// 								prem_comsell_active: prem_comsell_active,
	// 								prem_combuy_active: prem_combuy_active,
	// 								currentbuy: currentbuy,
	// 								currentsell: currentsell,
	// 							});

	// 							if (user_sell_active == 1 || user_buy_active == 1) {
	// 								if (buying_rate != "-" || selling_rate != "-") {
	// 									currentliverates.push({
	// 										deliverydays: deliverydays,
	// 										prem_buy_premium: prem_buy_premium,
	// 										prem_sel_premium: prem_sel_premium,
	// 										trade_enable: this.trade_enable,
	// 										prem_selretail_premium: prem_selretail_premium,
	// 										buy_active: buy_active,
	// 										sell_active: sell_active,
	// 										sellretail_active: sellretail_active,
	// 										com_id: com_id,
	// 										com_name: com_name,
	// 										buying_rate: buying_rate,
	// 										selling_rate: selling_rate,
	// 										delivery: deliverydays,
	// 										com_type: com_type,
	// 										rselling_rate: retail_rate,
	// 										buy_status: buy_status,
	// 										sell_status: sell_status,
	// 										retail_status: retail_status,
	// 										currentbuy: currentbuy,
	// 										currentsell: currentsell,
	// 										is_coin: is_coin,
	// 									});
	// 								}
	// 							}

	// 						} else {
	// 							if (prem_comsell_active == 0) {
	// 								selling_rate = "-";
	// 							}
	// 							if (prem_combuy_active == 0) {
	// 								buying_rate = "-";
	// 							}
	// 							allliverates.push({
	// 								com_id: com_id,
	// 								deliverydays: deliverydays,
	// 								com_name: com_name,
	// 								buying_rate: buying_rate,
	// 								selling_rate: selling_rate,
	// 								delivery: deliverydays,
	// 								com_type: com_type,
	// 								rselling_rate: retail_rate,
	// 								buy_status: buy_status,
	// 								sell_status: sell_status,
	// 								retail_status: retail_status,
	// 								trade: 0,
	// 								is_coin: is_coin,
	// 								user_sell_active: user_sell_active,
	// 								user_buy_active: user_buy_active,
	// 								prem_comsell_active: prem_comsell_active,
	// 								prem_combuy_active: prem_combuy_active,
	// 								currentbuy: currentbuy,
	// 								currentsell: currentsell,
	// 							});

	// 							if (buying_rate != "-" || selling_rate != "-") {
	// 								currentliverates.push({
	// 									com_id: com_id,
	// 									deliverydays: deliverydays,
	// 									com_name: com_name,
	// 									buying_rate: buying_rate,
	// 									selling_rate: selling_rate,
	// 									delivery: deliverydays,
	// 									com_type: com_type,
	// 									rselling_rate: retail_rate,
	// 									buy_status: buy_status,
	// 									sell_status: sell_status,
	// 									retail_status: retail_status,
	// 									currentbuy: currentbuy,
	// 									currentsell: currentsell,
	// 									prem_sel_premium: prem_sel_premium,
	// 									prem_buy_premium: prem_buy_premium,
	// 									is_coin: is_coin,
	// 								});
	// 							}
	// 						}
	// 					}
	// 				});
	// 			}
	// 		}
	// 	}
	// 	if (typeof this.liverates != "undefined") {
	// 	} else {
	// 		this.oldliverates = this.liverates;
	// 	}
	// 	this.oldliverates = Object.create(this.liverates);
	// 	this.liverates = currentliverates;
	// 	this.applicationRef.tick();
	// 	//this.changeRef.detectChanges();

	// 	if (
	// 		this.oldliverates == "" ||
	// 		this.oldliverates == undefined ||
	// 		this.oldliverates == null ||
	// 		this.oldliverates.length != this.liverates.length
	// 	) {
	// 		this.oldliverates = this.liverates;
	// 	}
	// 	localStorage.setItem("MAHARAJ_Liverates", JSON.stringify(this.liverates));
	// 	localStorage.setItem("WLMAHARAJAllLivePrice", JSON.stringify(allliverates));
	// 	localStorage.setItem('MAHARAJ_MarketStatus', this.marketstatus.toLocaleString());
	// 	this.event.publish("liverate:changed", this.liverates);
	// 	// });
	// }
	baserateInit(data) {
		console.log(data, 'baserateInit');
		// Main method to initialize and update base rates, current rates,
		// live commodity rates, market status, and UI indicators

		// this.liverateservice.getrfcallback((data) => {

		let messagesDesktopp = data.split("\n");   // Incoming feed split by rows
		let tmp_bidaskrates: any = [];             // Temporary base rates
		let curr_bidaskrates: any = [];            // Temporary current rates

		// Store previous raw feed data for rate comparison
		if (typeof this.oldData != "undefined") {
		} else {
			//alert("1");
			this.oldData = data.toString();
		}

		var messagesOldDesktop = this.oldData.split("\n"); // Old feed snapshot

		/* ================= BASE RATES & CURRENT RATES ================= */

		for (var i = 0; i < messagesDesktopp.length; i++) {

			var retDesktop = messagesDesktopp[i].split("\t"); // Split feed columns
			//console.log(retDesktop)

			var oldRetDesktop = retDesktop; // Default to current to avoid undefined crash
			if (messagesOldDesktop[i] !== undefined) {
				oldRetDesktop = messagesOldDesktop[i].split("\t");
			}

			// Process only valid feed rows
			if (typeof retDesktop[1] != "undefined") {

				/* ---------- TYPE 1 : BASE RATES ---------- */
				if (retDesktop[0] == 1 && retDesktop[2]) {

					let bid_class = "ratenormal";
					let ask_class = "ratenormal";

					// Compare against currently displayed value (like web's flashCell)
					let prevBase = this.base_rates ? this.base_rates.find(b => b.symbol === retDesktop[2]) : null;
					if (prevBase) {
						let newBid = parseFloat(retDesktop[3]);
						let oldBid = parseFloat(prevBase.bid);
						if (!isNaN(newBid) && !isNaN(oldBid)) {
							if (newBid > oldBid) bid_class = "ratehigh";
							else if (newBid < oldBid) bid_class = "ratelow";
						}
						let newAsk = parseFloat(retDesktop[4]);
						let oldAsk = parseFloat(prevBase.ask);
						if (!isNaN(newAsk) && !isNaN(oldAsk)) {
							if (newAsk > oldAsk) ask_class = "ratehigh";
							else if (newAsk < oldAsk) ask_class = "ratelow";
						}
					}

					let rateObj = {
						symbol: retDesktop[2],
						bid: retDesktop[3],
						ask: retDesktop[4],
						high: retDesktop[5],
						low: retDesktop[6],
						askclass: ask_class,
						bidclass: bid_class,
					};

					// Flash timer: auto-clear color after 1 second (like web's flashCell)
					if (bid_class !== 'ratenormal') {
						let timerKey = 'base_bid_' + retDesktop[2];
						if (this.flashTimers[timerKey]) clearTimeout(this.flashTimers[timerKey]);
						this.flashTimers[timerKey] = setTimeout(() => {
							rateObj.bidclass = 'ratenormal';
							this.applicationRef.tick();
						}, 1000);
					}
					if (ask_class !== 'ratenormal') {
						let timerKey = 'base_ask_' + retDesktop[2];
						if (this.flashTimers[timerKey]) clearTimeout(this.flashTimers[timerKey]);
						this.flashTimers[timerKey] = setTimeout(() => {
							rateObj.askclass = 'ratenormal';
							this.applicationRef.tick();
						}, 1000);
					}

					tmp_bidaskrates.push(rateObj);
				}

				/* ---------- TYPE 2 : CURRENT RATES ---------- */
				if (typeof retDesktop[2] != "undefined") {
					if (retDesktop[0] == 2) {

						let bid_class1 = "ratenormal";
						let ask_class1 = "ratenormal";

						// Compare against currently displayed value
						let prevCurr = this.current_rates ? this.current_rates.find(c => c.symbol === retDesktop[2]) : null;
						if (prevCurr) {
							let newBid = parseFloat(retDesktop[3]);
							let oldBid = parseFloat(prevCurr.bid);
							if (!isNaN(newBid) && !isNaN(oldBid)) {
								if (newBid > oldBid) bid_class1 = "ratehigh";
								else if (newBid < oldBid) bid_class1 = "ratelow";
							}
							let newAsk = parseFloat(retDesktop[4]);
							let oldAsk = parseFloat(prevCurr.ask);
							if (!isNaN(newAsk) && !isNaN(oldAsk)) {
								if (newAsk > oldAsk) ask_class1 = "ratehigh";
								else if (newAsk < oldAsk) ask_class1 = "ratelow";
							}
						}

						let rateObj1 = {
							symbol: retDesktop[2],
							bid: retDesktop[3],
							ask: retDesktop[4],
							high: retDesktop[5],
							low: retDesktop[6],
							askclass: ask_class1,
							bidclass: bid_class1,
						};

						// Flash timer: auto-clear color after 1 second
						if (bid_class1 !== 'ratenormal') {
							let timerKey = 'curr_bid_' + retDesktop[2];
							if (this.flashTimers[timerKey]) clearTimeout(this.flashTimers[timerKey]);
							this.flashTimers[timerKey] = setTimeout(() => {
								rateObj1.bidclass = 'ratenormal';
								this.applicationRef.tick();
							}, 1000);
						}
						if (ask_class1 !== 'ratenormal') {
							let timerKey = 'curr_ask_' + retDesktop[2];
							if (this.flashTimers[timerKey]) clearTimeout(this.flashTimers[timerKey]);
							this.flashTimers[timerKey] = setTimeout(() => {
								rateObj1.askclass = 'ratenormal';
								this.applicationRef.tick();
							}, 1000);
						}

						curr_bidaskrates.push(rateObj1);
					}
				}

				/* ---------- TYPE 4 : MARKET STATUS ---------- */
				if (retDesktop[0] == 4) {

					// Market closed condition
					if (retDesktop[3] == 0 || retDesktop[4] == 1) {
						this.marketstatus = 0;
						this.event.publish("marketstatus:changed", this.marketstatus);

						if (retDesktop[4] == 1) {
							this.marketclosedmsg = retDesktop[5];
						} else {
							this.marketclosedmsg =
								"Please wait market will be open shortly.";
						}
					} else {
						// Market open
						this.marketstatus = 1;
						this.event.publish("marketstatus:changed", this.marketstatus);
					}
				}
			}
		}

		// Update base & current rates — only update 'old' when values actually changed
		// This keeps ratehigh/ratelow colors visible until the next real price change
		if (this.base_rates && this.base_rates.length > 0) {
			let baseChanged = false;
			for (let j = 0; j < tmp_bidaskrates.length; j++) {
				if (!this.base_rates[j] || tmp_bidaskrates[j].bid !== this.base_rates[j].bid || tmp_bidaskrates[j].ask !== this.base_rates[j].ask) {
					baseChanged = true;
					break;
				}
			}
			if (baseChanged) {
				this.old_base_rates = this.base_rates;
			}
		} else {
			this.old_base_rates = tmp_bidaskrates;
		}
		this.base_rates = tmp_bidaskrates;

		if (this.current_rates && this.current_rates.length > 0) {
			let currChanged = false;
			for (let j = 0; j < curr_bidaskrates.length; j++) {
				if (!this.current_rates[j] || curr_bidaskrates[j].bid !== this.current_rates[j].bid || curr_bidaskrates[j].ask !== this.current_rates[j].ask) {
					currChanged = true;
					break;
				}
			}
			if (currChanged) {
				this.old_current_rates = this.current_rates;
			}
		} else {
			this.old_current_rates = curr_bidaskrates;
		}
		this.current_rates = curr_bidaskrates;

		// Trigger UI refresh
		this.applicationRef.tick();

		/* ================= LIVE COMMODITY RATES ================= */

		let currentliverates: any = [];   // Rates displayed on UI
		let allliverates: any = [];       // Full rates stored in localStorage

		for (var i = 0; i < messagesDesktopp.length; i++) {

			var liveretDesktop = messagesDesktopp[i].split("\t");
			var liveoldRetDesktop = liveretDesktop; // Default to current to avoid undefined crash

			// Old live feed for comparison
			if (messagesOldDesktop[i] !== undefined) {
				liveoldRetDesktop = messagesOldDesktop[i].split("\t");
			}

			if (typeof liveretDesktop[1] != "undefined") {

				/* ---------- TYPE 3 : LIVE COMMODITY FEED ---------- */
				if (liveretDesktop[0] == 3) {
					console.log('[TYPE3] Feed com_id:', liveretDesktop[1], '| bid:', liveretDesktop[3], '| ask:', liveretDesktop[4], '| commodities count:', this.commodities ? this.commodities.length : 0);

					this.commodities.forEach((value, key) => {

						// Match feed commodity with configured commodity
						if (liveretDesktop[1] == value.com_id) {
							console.log('[TYPE3] MATCHED com_id:', value.com_id, '| com_name:', value.com_name, '| prem_combuy_active:', value.prem_combuy_active, '| prem_comsell_active:', value.prem_comsell_active, '| prem_buy_premium:', value.prem_buy_premium, '| prem_sel_premium:', value.prem_sel_premium, '| com_roundoff:', value.com_roundoff);

							// Commodity master data
							let com_id = parseInt(value.com_id);
							let com_name = value.com_name;
							let com_type = parseInt(value.com_type);
							let com_weight = parseFloat(value.com_weight);
							let com_sel_active = parseInt(value.com_sel_active);
							let com_buy_active = parseInt(value.com_buy_active);
							let deliverydays = value.deliverydays;

							// Premium enable flags
							let prem_comsell_active = parseInt(value.prem_comsell_active);
							let prem_combuy_active = parseInt(value.prem_combuy_active);

							let displyname = value.displyname;
							let com_roundoff = parseInt(value.com_roundoff);
							let com_selretail_active = value.com_selretail_active;
							let com_selretail_premium = parseInt(value.com_selretail_premium);

							// Rate variables
							let rtgs_rate: any = 0;
							let selling_rate: any = 0;
							let buying_rate: any = 0;
							let retail_rate: any = 0;

							// Trade status flags
							let buy_status = "0";
							let sell_status = "0";
							let retail_status = "0";

							// Premium values (default to 0 if NaN)
							let prem_buy_premium = parseFloat(value.prem_buy_premium) || 0;
							let prem_sel_premium = parseFloat(value.prem_sel_premium) || 0;
							let prem_selretail_premium = parseFloat(value.prem_selretail_premium) || 0;

							// Assign live prices — apply roundoff to preserve trailing zeros (e.g. 12.000, 76.90)
							let raw_buy = liveretDesktop[3];
							let raw_sell = liveretDesktop[4];
							// Guard com_roundoff against NaN (default to 0 = integer display)
							if (isNaN(com_roundoff) || com_roundoff < 0) com_roundoff = 0;

							buying_rate = (raw_buy !== '' && raw_buy != null && !isNaN(parseFloat(raw_buy)))
								? (parseFloat(raw_buy) - prem_buy_premium).toFixed(com_roundoff)
								: '-';
							selling_rate = (raw_sell !== '' && raw_sell != null && !isNaN(parseFloat(raw_sell)))
								? (parseFloat(raw_sell) - prem_sel_premium).toFixed(com_roundoff)
								: '-';
							console.log('[TYPE3] Computed rates for', com_name,
								'| raw_buy:', raw_buy, '- prem:', prem_buy_premium, '= buying_rate:', buying_rate,
								'| raw_sell:', raw_sell, '- prem:', prem_sel_premium, '= selling_rate:', selling_rate,
								'| userlogged:', localStorage.getItem('MAHARAJ_userlogged'));

							// Price movement classes — flashCell pattern (like web's booking.js)
							let currentsell = "ratenormal";
							let currentbuy = "ratenormal";

							let prevLiveCom = this.liverates ? this.liverates.find((l: any) => l.com_id === com_id) : null;
							if (prevLiveCom) {
								let newBuyV = parseFloat(buying_rate);
								let oldBuyV = parseFloat(prevLiveCom.buying_rate);
								if (!isNaN(newBuyV) && !isNaN(oldBuyV)) {
									if (newBuyV > oldBuyV) currentbuy = "ratehigh";
									else if (newBuyV < oldBuyV) currentbuy = "ratelow";
								}
								let newSellV = parseFloat(selling_rate);
								let oldSellV = parseFloat(prevLiveCom.selling_rate);
								if (!isNaN(newSellV) && !isNaN(oldSellV)) {
									if (newSellV > oldSellV) currentsell = "ratehigh";
									else if (newSellV < oldSellV) currentsell = "ratelow";
								}
							}
							/* ---------- LOGGED-IN USER PERMISSION LOGIC ---------- */
							if (localStorage.getItem("MAHARAJ_userlogged") == "1") {

								let commodity_array = JSON.parse(localStorage.getItem("MAHARAJ_user_commodityData"));

								var buy_active: any = 0;
								var sell_active: any = 0;
								var sellretail_active: any = 0;

								if (commodity_array.length > 0) {
									commodity_array.forEach((value1, key1) => {

										if (value1.comid == com_id) {

											buy_active = value1.buy_active;   //prem_combuy_active
											sell_active = value1.sell_active;  // prem_comsell_active
											sellretail_active = value1.sellretail_active;
											prem_buy_premium = value1.prem_buy_premium;
											prem_selretail_premium = value1.prem_selretail_premium;
											prem_sel_premium = value1.prem_sel_premium;

											if (value1.com_buy_trade == 1 && value1.cus_com_status_buy == 1) {
												buy_status = "1";
											}

											if (value1.com_sel_trade == 1 && value1.cus_com_status_sell == 1) {
												sell_status = "1";
											}

											if (value1.com_retail_trade == 1 && value1.cus_com_status_sell == 1) {
												retail_status = "1";
											}
										}
									});
								} else {
									buy_status = "0";
									sell_status = "0";
								}
							}

							/* ---------- PUSH DATA FOR LOGGED-IN USERS ---------- */
							if (localStorage.getItem("MAHARAJ_userlogged") == "1") {

								// Full live rate object
								allliverates.push({
									deliverydays: deliverydays,
									trade_enable: this.trade_enable,
									prem_selretail_premium: prem_selretail_premium,
									buy_active: buy_active,
									sell_active: sell_active,
									sellretail_active: sellretail_active,
									com_id: com_id,
									com_name: com_name,
									buying_rate: buying_rate,
									selling_rate: selling_rate,
									delivery: deliverydays,
									com_type: com_type,
									rselling_rate: retail_rate,
									buy_status: buy_status,
									sell_status: sell_status,
									retail_status: retail_status,
									trade: 1,
									prem_comsell_active: prem_comsell_active,
									prem_combuy_active: prem_combuy_active,
									currentbuy: currentbuy,
									currentsell: currentsell,
									prem_buy_premium: prem_buy_premium,
									prem_sel_premium: prem_sel_premium,
								});

								// Disable rates if premium not active
								console.log('[TYPE3] LOGGED-IN filter for', com_name, '| buy_active:', buy_active, '| sell_active:', sell_active);
								if (sell_active == 0) {
									selling_rate = "-";
									currentsell = "ratenormal";
								}
								if (buy_active == 0) {
									buying_rate = "-";
									currentbuy = "ratenormal";
								}

								// Push visible live rates
								console.log('[TYPE3] LOGGED-IN final for', com_name, '| buying_rate:', buying_rate, '| selling_rate:', selling_rate, '| will push:', (buying_rate != '-' || selling_rate != '-'));
								if (buying_rate != "-" || selling_rate != "-") {
									currentliverates.push({
										deliverydays: deliverydays,
										trade_enable: this.trade_enable,
										prem_selretail_premium: prem_selretail_premium,
										buy_active: buy_active,
										sell_active: sell_active,
										sellretail_active: sellretail_active,
										com_id: com_id,
										com_name: com_name,
										buying_rate: buying_rate,
										selling_rate: selling_rate,
										delivery: deliverydays,
										com_type: com_type,
										rselling_rate: retail_rate,
										buy_status: buy_status,
										sell_status: sell_status,
										retail_status: retail_status,
										currentbuy: currentbuy,
										currentsell: currentsell,
										prem_buy_premium: prem_buy_premium,
										prem_sel_premium: prem_sel_premium,
									});
								}
							}
							/* ---------- PUSH DATA FOR GUEST USERS ---------- */
							else {

								allliverates.push({
									com_id: com_id,
									deliverydays: deliverydays,
									com_name: com_name,
									buying_rate: buying_rate,
									selling_rate: selling_rate,
									delivery: deliverydays,
									com_type: com_type,
									rselling_rate: retail_rate,
									buy_status: buy_status,
									sell_status: sell_status,
									retail_status: retail_status,
									trade: 0,
									prem_comsell_active: prem_comsell_active,
									prem_combuy_active: prem_combuy_active,
									currentbuy: currentbuy,
									currentsell: currentsell,
									prem_buy_premium: prem_buy_premium,
									prem_sel_premium: prem_sel_premium,
								});

								// Disable rates if premium not active
								console.log('[TYPE3] GUEST filter for', com_name, '| prem_comsell_active:', prem_comsell_active, '| prem_combuy_active:', prem_combuy_active);
								if (prem_comsell_active == 0) {
									selling_rate = "-";
									currentsell = "ratenormal";
								}
								if (prem_combuy_active == 0) {
									buying_rate = "-";
									currentbuy = "ratenormal";
								}

								// Push visible rates for guest users
								console.log('[TYPE3] GUEST final for', com_name, '| buying_rate:', buying_rate, '| selling_rate:', selling_rate, '| will push:', (buying_rate != '-' || selling_rate != '-'));
								if (buying_rate != "-" || selling_rate != "-") {
									currentliverates.push({
										com_id: com_id,
										deliverydays: deliverydays,
										com_name: com_name,
										buying_rate: buying_rate,
										selling_rate: selling_rate,
										delivery: deliverydays,
										com_type: com_type,
										rselling_rate: retail_rate,
										buy_status: buy_status,
										sell_status: sell_status,
										retail_status: retail_status,
										currentbuy: currentbuy,
										currentsell: currentsell,
										prem_sel_premium: prem_sel_premium,
										prem_buy_premium: prem_buy_premium,
									});
								}
							}
						}
					});
				}
			}
		}

		console.log('[TYPE3] === SUMMARY === currentliverates:', currentliverates.length, '| allliverates:', allliverates.length, '| marketstatus:', this.marketstatus);

		// Preserve old live rates — only update when values actually changed
		if (this.liverates && this.liverates.length > 0 && currentliverates.length > 0) {
			let liveChanged = false;
			for (let j = 0; j < currentliverates.length; j++) {
				if (!this.liverates[j] || currentliverates[j].buying_rate !== this.liverates[j].buying_rate || currentliverates[j].selling_rate !== this.liverates[j].selling_rate) {
					liveChanged = true;
					break;
				}
			}
			if (liveChanged) {
				this.oldliverates = this.liverates;
			}
		} else {
			this.oldliverates = currentliverates;
		}
		this.liverates = currentliverates;

		// Persist live rate data
		localStorage.setItem(
			"MAHARAJ_Liverates",
			JSON.stringify(this.liverates)
		);

		localStorage.setItem(
			"WLMAHARAJLivePrice",
			JSON.stringify(allliverates)
		);

		// Notify app about live rate update
		this.event.publish("liverate:changed", this.liverates);

		// Update oldData for next tick comparison
		this.oldData = data.toString();

		// });
	}

	ionViewDidEnter() {
		// Refresh commodity data on each page entry (re-navigation).
		// The initial load + fetch_data() is handled in ionViewDidLoad.
		this.liverateservice.getcommodities().subscribe((res) => {
			this.commodities = res.commoditydetails;
			this.rpanelbankrates = res.rpanelbank;
			this.rpaneldata = res.rpaneldata;
			this.rpanelsettings = res.rpanelsettings;
			this.rpanelcontract = res.rpanel_contracts;
			this.rpanelcommodities = res.rpanel_commodities;
			console.log('Commodities refreshed on enter. Count:', this.commodities ? this.commodities.length : 0);

			// Re-render cached rates now that commodities are loaded
			// This ensures Type 3 (commodity table) shows immediately
			if (rateFeed == 4) {
				const cached = this.liverateservice.getCachedState();
				if (cached) {
					this.zone.run(() => {
						this.baserateInit(cached);
					});
				}
			}
		});
		this.liverateservice.getmjdmarates().subscribe(res => {
			this.mjdmarates = res;
			console.log(this.mjdmarates);
		});
		this.liverateservice.getcjarates().subscribe(res => {
			this.cjarates = res;
			console.log(this.cjarates.display);
		});
	}

	openCallMenu() {
		let dtitle: any;
		let calldetails = '<ion-grid>';
		this.touchtocalldetails.forEach(function (value, key) {
			dtitle = value.title;
			value.content.forEach(function (cvalue, ckey) {
				calldetails += '<div class="row"><div class="col-10"><img src="./assets/imgs/pointer.svg"></div><div class="col-90" [innerHTML]="' + cvalue.displaytext + '  | safeHtml">' + cvalue.displaytext + '</div></div>';
			});
		});
		calldetails += '</ion-grid>';
		const alert = this.alertCtrl.create({
			title: dtitle,
			subTitle: calldetails,
			buttons: ['CLOSE']
		});
		alert.present();
	}

	// whatsapp() {
	// 	let mod = this.modalCtrl.create(WhatsappPage, { 'data': this.touchtowhatsappdetails });
	// 	mod.present();
	// }

	scrollStart(event) {
		//console.log(event);
		if (event.scrollTop == 0) {
			this.isShown = true;
		} else {
			this.isShown = false;
		}
	}
	gotoSocialshare() {
		this.event.publish('tab:changed', "SocialsharePage");
		this.navCtrl.setRoot(SocialsharePage);
	}
	ionViewWillEnter() {
		this.menuCtrl.enable(true);
		// Refresh login state each time the page is about to appear
		this.userlogged = localStorage.getItem("MAHARAJ_userlogged") == "1" ? 1 : 0;
	}

	logout() {
		let alert = this.alertCtrl.create({
			title: "Logout",
			subTitle: "Are you sure want to logout",
			enableBackdropDismiss: false,
			buttons: [
				{
					text: 'Cancel',
					handler: data => { }
				},
				{
					text: 'Ok',
					handler: data => {
						let userData = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
						let username = userData ? userData.username : '';
						let deviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
						let postData = {
							'username': username,
							'uuid': deviceData ? deviceData.uuid : '78976952552',
							'imieno': deviceData ? deviceData.uuid : '78976952552',
							'pushToken': deviceData ? deviceData.pushToken : '1563456123',
							'deviceType': deviceData ? deviceData.deviceType : '1'
						};

						this.commonservice.logout(JSON.stringify(postData)).then(result => {
							if (result) {
								localStorage.setItem('MAHARAJ_userData', JSON.stringify({
									'loginstatus': false,
									'username': 'guest',
									'usergroup': 'Default'
								}));
								this.event.publish('username:changed', {
									'loginstatus': false,
									'username': 'guest',
									'usergroup': 'Default'
								});
								this.event.publish('tab:changed', 'LoginPage');
								localStorage.setItem('MAHARAJ_userlogged', '0');
								this.userlogged = 0;

								let msg = result.data ? result.data.message : 'Logged out successfully';
								let logoutAlert = this.alertCtrl.create({
									title: 'Logout',
									subTitle: msg,
									buttons: [{
										text: 'Ok',
										handler: () => { }
									}]
								});
								logoutAlert.present();
								this.navCtrl.setRoot(LoginPage, {});
							}
						});
					}
				}
			]
		});
		alert.present();
	}

	openWhatsappMenu() {
		console.log("Whats app");
		let dtitle: any;
		let calldetails = '<ion-grid>';
		this.touchtowhatsappdetails.forEach(function (value, key) {
			dtitle = value.title;
			value.content.forEach(function (cvalue, ckey) {
				calldetails += '<div class="row"><div class="col-10"><img src="./assets/imgs/pointer.svg"/></div><div class="col-90" [innerHTML]="' + cvalue.displaytext + '  | safeHtml">' + cvalue.displaytext + '</div></div>';
			});
		});
		calldetails += '</ion-grid>';
		const alert = this.alertCtrl.create({
			title: dtitle,
			subTitle: calldetails,
			buttons: ['CLOSE']
		});
		alert.present();
	}
}
