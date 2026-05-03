import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, ToastController, NavParams, AlertController, Toast, LoadingController, Events } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { HomePage } from '../home/home';
import { LiveratesProvider } from '../../providers/liverates/liverates';
import { Platform } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network';
// import { TradablecommoditylistPage } from '../tradablecommoditylist/tradablecommoditylist';
/**
 * Generated class for the BookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-booking',
	templateUrl: 'booking.html',
})
export class BookingPage {
	//public comid: string;
	comid: any = "";
	booktype: any = "";
	book_deviceid = "";
	book_no_bar = 0;
	book_qty = 0;
	book_totalcost = 0;

	private onResumeSubscription: Subscription;
	admin_text: any = "";

	baserates: any = [];
	oldbaserates: any = [];
	bidaskrates: any = {};
	oldbidaskrates: any = {};
	liverates: any = [];
	comname: any = ""
	booknos: any = "";
	marketstatus: number = 1;
	orderDetails: any = [];

	decimalvalid: any = 0;
	step: any = 0;

	isvalid: any = "";
	commodity: any = [];
	commodityarray: any = [];
	margindata: any = [];
	trade_enable: any = "";
	dispcommditydetails: any = [];
	displaycommodity: any = [];
	userid: any = "";
	userData: any = "";
	dispcmdty_length: any = "";
	minmax_valid: any = 0;
	book_type: any = "";
	cus_com_status_buy: any = 1;
	cus_com_status_sell: any = 1;
	curcomrate: any = 0;
	curcombuyrate: any = 0;
	curcomsellrate: any = 0;
	curcomsellretailrate: any = 0;
	errormsg: any = "";
	dispcommdit: any = "";
	com_sel_trade: any = 1;
	com_retail_trade: any = 0;
	com_buy_trade: any = 1;
	book_rate1: any = 0;
	Math: any;
	barselection: any;
	selling_rate: any = "";
	retail_rate: any = "";
	buying_rate: any = "";
	pet: any = "";
	loading1: any = "";
	loading2: any = "";
	commodityupdatetime: any = "";
	margin_required: any = 0;
	available_balance: any = 0;
	display_margin: any = 0;
	margin: any = 0;
	commodityarray_length: any = 0;
	market_off: any = "0";
	market_on: any = "0";
	sunday_holiday: any = "0";
	comgroupData: any = [];
	currentcommodity: any = [];
	dispweights: any = [];
	commodity_status: any = "";
	toast: Toast;
	weightck: boolean = true;
	Amountck: boolean = false;
	purtye = "AMOUNT";
	purtye1 = "WEIGHT";
	Amountvalue: any;
	bookgrm_rate: any;
	limit_enable: any = "0";
	clientlimit_enable: any = "0";
	usercomment: any = "";
	discount_amt: any = 0;
	discbuy_before: any;
	discbuy_after: any;
	high_sell_rate: any = "";
	high_buying_rate: any = "";
	discsell: any;
	discsell_before: any;
	discsell_after: any;
	discbuy: any;
	discsellretail: any;
	prem_selretail_premium = 0;
	buy_active: any = 0;
	sell_active: any = 0;
	sellretail_active: any = 0;
	prem_sel_premium = 0;
	prem_buy_premium = 0;
	deliverydays: any = "";
	low_buying_rate: any = "";
	buy_rate: any;
	sell_rate: any;
	discbuy_bf: any;
	discsell_af: any;
	constructor(public toastController: ToastController, public cdRef: ChangeDetectorRef, private commonservice: CommonServiceProvider, public navCtrl: NavController, public navParams: NavParams, public liverateservice: LiveratesProvider, private zone: NgZone, platform: Platform, private network: Network, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public events: Events) {
		this.pet = "market";
		this.Math = Math;
		this.comid = this.navParams.get('comid');
		this.booktype = this.navParams.get('reqtype');
		console.log("comid: " + this.comid + "\n" + "booktype: " + this.booktype);
		if (!this.weightck) {
			this.orderDetails.requestqty = 0;

		} else {
			this.orderDetails.requestqty = 1;
		}
		this.limit_enable = localStorage.getItem("MAHARAJlimit_enable");
		this.clientlimit_enable = localStorage.getItem("MAHARAJclientlimit_enable");
		/* alert(this.limit_enable) */
	}

	segmentChanged() {

		if (this.dispcommditydetails.bar_selection == 0) {
			if (!this.weightck) {
				this.orderDetails.requestqty = 0;

			} else {
				this.orderDetails.requestqty = 1;
			}


		} else if (this.dispcommditydetails.bar_selection == 1) {
			this.orderDetails.requestqty = this.dispweights[0].code;
			this.orderDetails.requestqty1 = this.dispweights[0].code;

		} else {
			console.log("ERROR(this.dispcommditydetails.bar_selection): " + this.dispcommditydetails.bar_selection);
		}
		this.isvalid = false;
	}

	ionViewWillEnter(): void {
		// this.updateCommodities();
		this.events.subscribe('marketstatus:changed', (marketstatus) => {
			this.marketstatus = marketstatus;
			if (this.marketstatus == 0) {
				this.liverates = [];
				let toastController = this.toastController;
				toastController.create({
					message: "Market Off",
					duration: 3000
				}).present();
				this.events.publish('tab:changed', "HomePage");
				this.navCtrl.setRoot(HomePage);
			}
		});
		this.events.subscribe('liverate:changed', (liverate) => {
			//console.log("liverate:changed");
			this.liverates = liverate;
			//console.log(JSON.stringify(this.liverates));	
			//console.log(this.comid +"\n"+ this.marketstatus);	
			if (this.comid != 0 && this.marketstatus == 1) {
				let selectedcomid = this.comid;
				let booktype = this.booktype;
				let curcomsellrate: any;
				let curcomsellretailrate: any;
				let curcombuyrate: any;
				let currentcommodity: any;
				let selling_rate: any;
				let retail_rate: any;
				let buying_rate: any;
				let curcomrate = 0;
				let buy_active: any = 0;
				let sell_active: any = 0;
				let sellretail_active: any;
				let prem_buy_premium: any;
				let prem_sel_premium: any;
				let prem_selretail_premium: any;


				this.liverates.forEach((rcval, rckey) => {
					if (rcval['com_id'] == selectedcomid) {
						curcomsellrate = rcval['selling_rate'];
						curcomsellretailrate = rcval['rselling_rate'];
						curcombuyrate = rcval['buying_rate'];
						selling_rate = rcval['selling_rate'];
						retail_rate = rcval['rselling_rate'];
						buying_rate = rcval['buying_rate'];
						buy_active = rcval['buy_active'];
						sell_active = rcval['sell_active'];
						sellretail_active = rcval['sellretail_active'];
						prem_buy_premium = rcval['prem_buy_premium'];
						prem_sel_premium = rcval['prem_sel_premium'];
						prem_selretail_premium = rcval['prem_selretail_premium'];

						if (booktype == 0) {
							curcomrate = selling_rate;
							//console.log(curcomrate);
						} else if (booktype == 2) {
							curcomrate = retail_rate;
							//console.log(curcomrate);
						} else {
							curcomrate = buying_rate;
							//console.log(curcomrate);
						}
						currentcommodity = rcval;
					}
				});
				// Guard: if selected commodity was not found in liverates, skip processing
				if (selling_rate == null || buying_rate == null) {
					return;
				}
				this.curcomsellrate = curcomsellrate;
				this.curcomsellretailrate = curcomsellretailrate;
				this.curcombuyrate = curcombuyrate;
				this.selling_rate = selling_rate;

				let x = selling_rate.toString();
				let afterPoint = '';
				if (x.indexOf('.') > 0)
					afterPoint = x.substring(x.indexOf('.'), x.length);
				x = Math.floor(x);
				x = x.toString();
				let lastThree = x.substring(x.length - 3);
				let otherNumbers = x.substring(0, x.length - 3);
				if (otherNumbers != '')
					lastThree = ',' + lastThree;
				selling_rate = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;

				this.sell_rate = selling_rate;
				this.retail_rate = retail_rate;
				this.buying_rate = buying_rate;

				let bx = buying_rate.toString();
				let bafterPoint = '';
				if (bx.indexOf('.') > 0)
					bafterPoint = bx.substring(bx.indexOf('.'), bx.length);
				bx = Math.floor(bx);
				bx = bx.toString();
				let blastThree = bx.substring(bx.length - 3);
				let botherNumbers = bx.substring(0, bx.length - 3);
				if (botherNumbers != '')
					blastThree = ',' + blastThree;
				buying_rate = botherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + blastThree + bafterPoint;

				this.buy_rate = buying_rate;
				this.buy_active = buy_active;
				this.sell_active = sell_active;
				this.sellretail_active = sellretail_active;
				this.prem_buy_premium = prem_buy_premium;
				this.prem_sel_premium = prem_sel_premium;
				//console.log("this.prem_sel_premium=====>"+this.prem_sel_premium)
				this.prem_selretail_premium = prem_selretail_premium;
				//this.curcomrate 	= curcomrate;
				//console.log(this.curcomrate);
				this.currentcommodity = currentcommodity;
				this.calculatetotal(this.booktype);
				//console.log("retailactive===========>"+this.dispcommditydetails.sellretail_active)
				if (booktype == 1) {
					//console.log(this.buy_active)
					//this.discbuy=this.buying_rate - this.prem_buy_premium;

					this.discbuy_before = parseFloat(this.buying_rate) - parseFloat(this.dispcommditydetails.prem_buy_premium);
					let discbuy_bf = this.discbuy_before;
					this.discbuy_bf = discbuy_bf.toLocaleString();
					if (this.low_buying_rate > this.discbuy_before) {
						this.discbuy_after = this.discbuy_before;
						localStorage.setItem('low_buying_rate', this.discbuy_before);
						this.discbuy = this.discbuy_before;
						this.low_buying_rate = this.discbuy_before;
					}
					else {
						if (this.low_buying_rate == '') {
							localStorage.setItem('low_buying_rate', this.discbuy_before);
							this.discbuy = this.discbuy_before;
							this.discbuy_after = this.discbuy_before;
							this.low_buying_rate = this.discbuy_before;
						}
						else {
							this.discbuy = this.low_buying_rate;
							this.discbuy_after = this.discbuy_before;
						}
					}

					//console.log("this.discbuy=====>"+this.discbuy)
					this.curcomrate = this.discbuy;
					this.discount_amt = this.dispcommditydetails.prem_buy_premium;
				} else if (booktype == 0) {
					//console.log(this.sell_active)
					//this.discsell=this.selling_rate - this.prem_sel_premium;
					this.discsell_before = parseFloat(this.selling_rate) - parseFloat(this.dispcommditydetails.prem_sel_premium);

					if (this.high_sell_rate < this.discsell_before) {
						localStorage.setItem('high_sell_rate', this.discsell_before);
						this.high_sell_rate = localStorage.getItem('high_sell_rate');
						this.discsell = localStorage.getItem('high_sell_rate');
						this.discsell_after = this.discsell_before;
						let discsell_af = this.discsell_after;
						this.discsell_af = discsell_af.toLocaleString();
					}
					else {
						//this.discsell=this.discsell_before;
						//this.discsell=localStorage.getItem('high_sell_rate');
						this.discsell = this.high_sell_rate;
						this.discsell_after = this.discsell_before;
						let discsell_af = this.discsell_after;
						this.discsell_af = discsell_af.toLocaleString();
					}

					/* console.log("this.selling_rate=====>"+this.selling_rate)
					console.log("this.prem_sel_premium=====>"+this.prem_sel_premium)
					console.log("this.discbuy=====>"+this.discsell) */
					this.curcomrate = this.discsell;
					this.discount_amt = this.dispcommditydetails.prem_sel_premium;
				} else if (booktype == 2) {
					//console.log(this.sellretail_active)
					this.discsellretail = this.retail_rate - this.prem_selretail_premium;
					this.curcomrate = this.discsellretail;
					this.discount_amt = this.dispcommditydetails.prem_selretail_premium;
				}
			} else {
				this.curcomsellrate = "-";
				this.curcomsellretailrate = "-";
			}

		});

	}
	amountchange() {
		this.weightck = false;
		this.Amountck = true;
		this.purtye = "AMOUNT";
		this.purtye1 = "WEIGHT";
	}
	weightchange() {
		this.Amountck = false;
		this.orderDetails.requestqty = 1;
		this.weightck = true;
		this.purtye1 = "AMOUNT";
		this.purtye = "WEIGHT";
	}
	presentToast() {
		this.liverates = '';
		this.events.unsubscribe('liverate:changed', this.liverates);
		/* 			console.log(2); */
		let toastController = this.toastController;
		try {
			this.toast.dismiss();
		} catch (e) { }
		this.toast = this.toastController.create({
			message: "Trade Closed",
			position: 'bottom',
			duration: 3000,
			cssClass: 'danger',
		});
		this.toast.present();

	}
	ionViewWillLeave(): void {
		this.events.unsubscribe('marketstatus:changed');
		this.events.unsubscribe('liverate:changed');
	}
	ionViewDidLoad() {

		// this.liverateservice.get_admintext().subscribe((res) => {
		// 	this.admin_text = res.admin_txt;
		// });

		this.liverateservice.getmarqueeupdatescallback().subscribe(data => {
			this.zone.run(() => {
				if (data != null) {
					this.admin_text = data;
				}
			});
		});
	}

	ionViewDidEnter() {
		this.marketstatus = parseInt(localStorage.getItem('MAHARAJ_MarketStatus'));
		if (this.liverates.length == 0) {
			this.liverates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates'));
			console.log("liverates.length: " + this.liverates);

			if (this.comid != 0 && this.marketstatus == 1) {
				let selectedcomid = this.comid;
				let booktype = this.booktype;
				let curcomsellrate: any;
				let curcomsellretailrate: any;
				let curcombuyrate: any;
				let currentcommodity: any;
				let selling_rate: any;
				let retail_rate: any;
				let buying_rate: any;
				let curcomrate = 0;
				let commodity_status: any = "";
				let prem_buy_premium: any;
				let prem_sel_premium: any;
				let prem_selretail_premium: any;
				let deliverydays: any;

				this.trade_enable = localStorage.getItem('MAHARAJ_trade_enable') == "1" ? 1 : 0;
				/* console.log(JSON.stringify(this.liverates)); */
				this.liverates.forEach(function (rcval, rckey) {
					if (rcval['com_id'] == selectedcomid) {
						curcomsellrate = rcval['selling_rate'];
						curcomsellretailrate = rcval['rselling_rate'];
						curcombuyrate = rcval['buying_rate'];
						selling_rate = rcval['selling_rate'];
						retail_rate = rcval['rselling_rate'];
						buying_rate = rcval['buying_rate'];
						prem_buy_premium = rcval['prem_buy_premium'];
						prem_sel_premium = rcval['prem_sel_premium'];
						deliverydays = rcval.deliverydays;
						console.log(prem_sel_premium);
						prem_selretail_premium = rcval['prem_selretail_premium'];
						if (booktype == 0) {
							curcomrate = selling_rate;
							commodity_status = rcval['sell_status'];
						} else if (booktype == 2) {
							curcomrate = retail_rate;
							commodity_status = rcval['sell_status'];
						} else {
							curcomrate = buying_rate;
							commodity_status = rcval['buy_status'];
						}
						console.log(booktype + " : " + curcomrate);
						currentcommodity = rcval;
					}
				});
				this.curcomsellrate = curcomsellrate;
				this.curcomsellretailrate = curcomsellretailrate;
				this.curcombuyrate = curcombuyrate;
				this.selling_rate = selling_rate;
				this.deliverydays = deliverydays;
				this.retail_rate = retail_rate;
				this.buying_rate = buying_rate;
				this.curcomrate = curcomrate;

				this.currentcommodity = currentcommodity;
				this.commodity_status = commodity_status;
				if (this.trade_enable == 0 || this.commodity_status == 0) {
					this.liverates = [];
					let toastController = this.toastController;
					toastController.create({
						message: "Trade Closed",
						duration: 3000
					}).present();
					this.events.publish('tab:changed', "HomePage");
					this.navCtrl.setRoot(HomePage);
				}

				setInterval(() => {
					if (booktype == 1) {
						//this.discbuy=this.buying_rate - this.prem_buy_premium; // comment by prabakar(02-Nov-23)
						this.discbuy_before = parseFloat(this.buying_rate) - parseFloat(this.dispcommditydetails.prem_buy_premium);
						if (this.high_buying_rate > this.discbuy_before) {
							localStorage.setItem('high_buying_rate', this.discbuy_before);
							this.high_buying_rate = localStorage.getItem('high_buying_rate');
							this.discbuy = localStorage.getItem('high_buying_rate');
							this.discbuy_after = this.discbuy_before;
						}
						else {
							this.high_buying_rate = this.discbuy_before;
							this.discbuy = localStorage.getItem('high_buying_rate');
							this.discbuy_after = this.discbuy_before;
						}

						/* console.log("this.discbuy=====>"+this.discbuy) */
						this.curcomrate = this.discbuy;
						this.discount_amt = this.dispcommditydetails.prem_buy_premium;
					} else if (booktype == 0) {
						//this.discsell=this.selling_rate - this.prem_sel_premium; // comment by prabakar(02-Nov-23)
						this.discsell_before = parseFloat(this.selling_rate) - parseFloat(this.dispcommditydetails.prem_sel_premium);
						if (this.high_sell_rate < this.discsell_before) {
							localStorage.setItem('high_sell_rate', this.discsell_before);
							this.high_sell_rate = localStorage.getItem('high_sell_rate');
							this.discsell = localStorage.getItem('high_sell_rate');
							this.discsell_after = this.discsell_before;
						}
						else {
							//this.discsell=this.discsell_before;
							this.discsell = localStorage.getItem('high_sell_rate');
							this.discsell_after = this.discsell_before;
						}

						this.curcomrate = this.discsell;
						this.discount_amt = this.dispcommditydetails.prem_sel_premium;
					} else if (booktype == 2) {
						/* console.log(this.sellretail_active) */
						this.discsellretail = this.retail_rate - this.prem_selretail_premium;
						this.curcomrate = this.discsellretail;
						this.discount_amt = this.dispcommditydetails.prem_selretail_premium;
					}
				}, 3000)



			} else {
				this.curcomsellrate = "-";
				this.curcomsellretailrate = "-";
			}
		} else {
			this.liverates = JSON.parse(localStorage.getItem('MAHARAJ_LivePrice'));
			console.log("liverates.length: " + this.liverates.length);
		}

		this.isvalid = false;
		this.trade_enable = localStorage.getItem('MAHARAJ_trade_enable');
		this.commodityarray = JSON.parse(localStorage.getItem('MAHARAJ_user_commodityData'));
		/* console.log("this.commodityarray================>"+JSON.stringify(this.commodityarray)); */
		this.margindata = JSON.parse(localStorage.getItem('MAHARAJ_margindata'));
		this.userData = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
		this.userid = this.userData.userid;

		/* console.log(this.comid); */
		this.getOrderDetails(this.comid);
	}

	gotoHomePage() {
		this.navCtrl.setRoot(HomePage);
	}

	updateCommodities() {
		console.log("updateCommodities()");
		this.commonservice.getCommodities(this.userid).then(result => {
			if (result.data.success) {
				localStorage.setItem('MAHARAJ_trade_enable', result.data.settings.trade_enable);
				localStorage.setItem('MAHARAJ_user_commodityData', JSON.stringify(result.data.comgroupData));
				localStorage.setItem('MAHARAJ_margindata', JSON.stringify(result.data.settings));
				localStorage.setItem('MAHARAJ_available_balance', result.data.available_balance);
				localStorage.setItem('MAHARAJ_display_margin', result.data.settings.display_margin);
				localStorage.setItem('MAHARAJ_market_on', result.data.settings.market_on);
				localStorage.setItem('MAHARAJ_market_off', result.data.settings.market_off);

				this.commodityarray = localStorage.getItem('MAHARAJ_user_commodityData');
				this.commodityarray_length = this.commodityarray.length;
				this.trade_enable = result.data.settings.trade_enable;
				this.available_balance = result.data.available_balance;
				this.display_margin = result.data.settings.display_margin;
				/* console.log("display_margin:" + this.display_margin + "\n" + "available_balance: " + this.available_balance); */
				this.market_on = result.data.settings.market_on;
				this.market_off = result.data.settings.market_off;
				this.displaycommodity = [];
				let dispcommditydetails = {};
				this.margindata = localStorage.getItem('MAHARAJ_margindata');
				/* console.log(this.margindata); */
				let dispweights = this.dispweights;
				this.comgroupData.forEach(function (value, key) {
					if (this.comid == value.comid) {
						if ((value.com_buy_trade == 1 && value.com_sel_trade == 1) || (value.cus_com_status_buy && value.cus_com_status_sell)) {
							dispcommditydetails = {
								'allowed_decimals': parseInt(value.allowed_decimals),
								'com_name': value.comname,
								'com_weight': Math.round(value.weight),
								'denomination': value.barqty,
								'bar_selection': value.bar_selection,
								'com_bar_no': value.com_bar_no,
								'com_bar_type': value.com_bar_type,
								'com_unit': value.com_unit,
								'goldhigh_tol': this.margindata.goldhigh_tol,
								'goldlow_tol': this.margindata.goldlow_tol,
								'silverhigh_tol': this.margindata.silverhigh_tol,
								'silverlow_tol': this.margindata.silverlow_tol,
								'margintype': parseFloat(value.com_margin_type),
								'comtype': value.comtype,
								'silvermargin': parseFloat(value.com_margin_value),
								'goldmargin': parseFloat(value.com_margin_value),
								'com_margin_type': value.com_margin_type,
								'com_margin_value': value.com_margin_value,
								'minmax': value.minmax,
								'com_buy_trade': value.com_buy_trade,
								'com_sel_trade': value.com_sel_trade,
								'cus_com_status_sell': value.cus_com_status_sell,
								'cus_com_status_buy': value.cus_com_status_buy,
								'cus_maxQty': value.cus_maxQty,
								'cus_minQty': value.cus_minQty,
								'has_minqty': value.has_minqty,
								'has_maxqty': value.has_maxqty,
								'maxallotedqty': value.maxallotedqty,
								'has_allot_qty': value.has_allot_qty,
								'min': value.min,
								'max': value.max,
								'weight': parseFloat(value.weight),
								'cus_com_amountpurch': value.cus_com_amountpurch,
								'buy_active': value.buy_active,
								'sell_active': value.sell_active,
								'sellretail_active': value.sellretail_active,
								'prem_buy_premium': parseFloat(value.prem_buy_premium),
								'prem_sel_premium': parseFloat(value.prem_sel_premium),
								'prem_selretail_premium': parseFloat(value.prem_selretail_premium),

							};

							for (let i = 1; i <= value.com_bar_no; i++) {
								dispweights.push({
									'code': (parseFloat(value.barqty) * i),
									'name': (parseFloat(value.barqty) * i)
								});
							}
							console.log("dispweights: " + this.dispweights);
						}
					}
				});

				this.dispweights = dispweights;
				this.orderDetails.requestqty = this.dispweights[0].code;
				this.orderDetails.requestqty1 = this.dispweights[0].code;

				/* console.log("this.orderDetails.requestqty1: " + this.orderDetails.requestqty1); */
				/* alert(this.orderDetails.requestqty1) */
				this.dispcommditydetails = dispcommditydetails;
				/* console.log(JSON.stringify(this.dispcommditydetails)); */
				this.calculatetotal(this.booktype);
			} else {
				console.log("result.data.success(getCommodities): " + result.data.success);
			}
		});
	}

	getOrderDetails(comid) {
		this.orderDetails.totalcost = 0;
		this.orderDetails.req_type = 0;
		this.orderDetails.requiredmargin = 0;
		this.isvalid = false;
		let margindata = this.margindata;
		let dispcommditydetails = {};
		let com_buy_trade = 0;
		let com_sel_trade = 0;
		let com_retail_trade = 0;
		let cus_com_status_sell = 0;
		let cus_com_status_buy = 0;
		this.available_balance = localStorage.getItem('MAHARAJ_available_balance');
		this.display_margin = JSON.parse(localStorage.getItem('MAHARAJ_margindata')).display_margin;
		let dispweights = this.dispweights;
		this.commodityarray.forEach(function (value, key) {
			if (value.comid == comid) {
				dispcommditydetails = {
					'allowed_decimals': parseInt(value.allowed_decimals),
					'com_name': value.comname,
					'com_weight': parseFloat(value.weight),
					'denomination': parseFloat(value.barqty),
					'bar_selection': value.bar_selection,
					'com_bar_no': value.com_bar_no,
					'com_bar_type': value.com_bar_type,
					'com_unit': value.com_unit,
					'goldhigh_tol': margindata.goldhigh_tol,
					'goldlow_tol': margindata.goldlow_tol,
					'silverhigh_tol': margindata.silverhigh_tol,
					'silverlow_tol': margindata.silverlow_tol,
					'margintype': parseFloat(value.com_margin_type),
					'comtype': value.comtype,
					'silvermargin': parseFloat(value.com_margin_value),
					'goldmargin': parseFloat(value.com_margin_value),
					'com_margin_type': value.com_margin_type,
					'com_margin_value': value.com_margin_value,
					'minmax': value.minmax,
					'com_buy_trade': value.com_buy_trade,
					'com_sel_trade': value.com_sel_trade,
					'com_retail_trade': value.com_retail_trade,
					'cus_com_status_sell': value.cus_com_status_sell,
					'cus_com_status_buy': value.cus_com_status_buy,
					'cus_maxQty': parseFloat(value.cus_maxQty),
					'cus_minQty': parseFloat(value.cus_minQty),
					'has_minqty': value.has_minqty,
					'has_maxqty': value.has_maxqty,
					'maxallotedqty': value.maxallotedqty,
					'has_allot_qty': value.has_allot_qty,
					'min': value.min,
					'max': value.max,
					'weight': parseFloat(value.weight),
					'cus_com_amountpurch': value.cus_com_amountpurch,
					'buy_active': value.buy_active,
					'sell_active': value.sell_active,
					'sellretail_active': value.sellretail_active,
					'prem_buy_premium': parseFloat(value.prem_buy_premium),
					'prem_sel_premium': parseFloat(value.prem_sel_premium),
					'prem_selretail_premium': parseFloat(value.prem_selretail_premium),

				};
				for (let i = 1; i <= parseInt(value.com_bar_no); i++) {
					dispweights.push({
						'code': (parseFloat(value.barqty) * i),
						'name': (parseFloat(value.barqty) * i)
					});
				}

				console.log("dispweights: " + JSON.stringify(dispweights));
				com_buy_trade = value.com_buy_trade;
				com_sel_trade = value.com_sel_trade;
				console.log("com_sel_trade1==================>" + com_sel_trade)
				com_retail_trade = value.com_retail_trade;
				cus_com_status_sell = value.cus_com_status_sell;
				cus_com_status_buy = value.cus_com_status_buy;
				cus_com_status_buy = value.cus_com_status_buy;
			}
		});

		this.dispcommditydetails = dispcommditydetails;
		console.log(dispweights);
		this.dispweights = dispweights;
		this.orderDetails.requestqty = this.dispweights[0] == null ? 0 : this.dispweights[0].code;
		this.orderDetails.requestqty1 = this.dispweights[0] == null ? 0 : this.dispweights[0].code;
		this.dispcmdty_length = this.dispcommditydetails.length;
		this.com_buy_trade = com_buy_trade;
		this.com_sel_trade = com_sel_trade;
		console.log("com_sel_trade1==================>" + com_sel_trade)
		this.com_retail_trade = com_retail_trade;
		this.cus_com_status_sell = cus_com_status_sell;
		this.cus_com_status_buy = cus_com_status_buy;
		if (this.dispcommditydetails.bar_selection == 0) {

		} else if (this.dispcommditydetails.bar_selection == 1) {
			this.minmax_valid = 1;
			this.isvalid = true;
			this.calculatetotal(this.booktype);
		} else {
			//console.log("ERROR(this.dispcommditydetails.bar_selection): "+this.dispcommditydetails.bar_selection);
		}
		//this.isvalid = false;
		//console.log("this.cus_com_status_sell: "+this.cus_com_status_sell);
	}

	calcAmount(type, ev) {
		console.log(this.orderDetails.ordervalue)
		if (ev._value > 0) {
			if (type == 0) {
				this.Amountvalue = ev._value;
				let qty_conversion = (this.dispcommditydetails.com_bar_type == 1 ? 1000 : 1)
				console.log(this.dispcommditydetails.com_bar_type)
				this.bookgrm_rate = parseFloat(this.curcomrate) / parseFloat(this.dispcommditydetails.com_weight);

				this.orderDetails.requestqty = parseFloat(((parseFloat(ev._value) / parseFloat(this.bookgrm_rate)) * this.dispcommditydetails.denomination / qty_conversion).toFixed(3));
			} else if (this.orderDetails.ordervalue > 0) {
				this.Amountvalue = ev._value;
				let qty_conversion = (this.dispcommditydetails.com_bar_type == 1 ? 1000 : 1)
				this.bookgrm_rate = parseFloat(this.orderDetails.ordervalue) / parseFloat(this.dispcommditydetails.com_weight);
				this.orderDetails.requestqty = parseFloat(((parseFloat(ev._value) / parseFloat(this.bookgrm_rate)) * this.dispcommditydetails.denomination / qty_conversion).toFixed(3));
			}
			console.log(ev._value)
		} else {
			this.orderDetails.requestqty = 0;
		}

	}
	calculatetotal(reqType) {
		/* 		if(this.dispcommditydetails.cus_com_amountpurch==0){
					this.weightck=true;
					this.orderDetails.requestqty=1;
				} */
		console.log(this.weightck)

		console.log(this.pet)
		if (this.pet != "Limitorders" && !this.weightck) {
			var value = { '_value': this.Amountvalue }
			console.log(this.orderDetails.ordervalue)
			this.calcAmount(reqType, value)
		} else if (this.pet == "Limitorders" && !this.weightck) {
			var value = { '_value': this.Amountvalue }
			console.log(this.orderDetails.ordervalue)
			this.calcAmount(1, value)
		}

		this.orderDetails.req_type = reqType;
		if (this.dispcommditydetails.bar_selection == "1") {//dropdown
			//console.log("requestqty: "+this.orderDetails.requestqty);

			this.orderDetails.requestqty = this.orderDetails.requestqty1;
			//console.log("NOTE: your qty has been converted to kg"+"\nrequestqty: "+this.orderDetails.requestqty);
		} else {
			if (!this.Amountck) {
				this.cdRef.detectChanges();
				var t = this.orderDetails.requestqty;
				let decimalvalue: any = this.dispcommditydetails.allowed_decimals + 1;
				/* console.log("decimalvalue=========>"+decimalvalue); */
				if (String(t).indexOf(".") !== -1) {
					this.orderDetails.requestqty = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), decimalvalue)) : t;
				}
				this.orderDetails.requestqty = this.orderDetails.requestqty;
			}
			//console.log("com_bar_type: "+this.dispcommditydetails.com_bar_type);
		}

		var temp_qty = this.orderDetails.requestqty;
		/* 	console.log(temp_qty); */
		var requestqty_no = temp_qty.toString().split('.');
		if (requestqty_no.length > 1) {
			if (requestqty_no[1].length <= this.dispcommditydetails.allowed_decimals) {
				/* 	console.log(requestqty_no[1].length + "==" + this.dispcommditydetails.allowed_decimals); */
				this.decimalvalid = true;
				/* 	console.log("Success"); */

				this.step = 1 / Math.pow(10, requestqty_no.length);
				/* console.log(this.step); */

			} else {
				/* 	console.log(requestqty_no[1].length + "==" + this.dispcommditydetails.allowed_decimals); */
				this.decimalvalid = false;
				/* 	console.log("Fail"); */
			}
		} else {
			/* console.log("requestqty_no is interger"); */
			this.decimalvalid = true;
		}

		let requestqty: any = "";
		let qty_conversion = (this.dispcommditydetails.com_bar_type == 1 ? 1 : 1000)
		//console.log("qty_conversion: "+qty_conversion);
		if (this.dispcommditydetails.bar_selection == 1) {//dropdown
			console.log(this.orderDetails.requestqty1 + "/" + this.dispcommditydetails.denomination);
			this.book_no_bar = this.orderDetails.requestqty1 / this.dispcommditydetails.denomination;
			requestqty = this.orderDetails.requestqty1 / this.book_no_bar;
		} else {
			this.book_no_bar = this.orderDetails.requestqty;
		}
		if (this.curcomrate > 0) {
			//	console.log("book_qty: "+this.book_no_bar +"*"+ this.dispcommditydetails.denomination +"/"+ qty_conversion);
			this.book_qty = this.book_no_bar * this.dispcommditydetails.denomination / qty_conversion;
			//console.log(this.curcomrate+"/"+this.dispcommditydetails.com_weight+"*"+this.book_qty+"*"+1000);
			if (this.weightck) {
				this.book_totalcost = (this.curcomrate / this.dispcommditydetails.com_weight) * this.book_qty * 1000;
			} else {
				this.book_totalcost = this.Amountvalue;
			}
			//console.log("book_qty: "+this.book_qty+"\nbook_totalcost: "+this.book_totalcost);
		} else {
			//	console.log("ERROR: curcomrate: "+this.curcomrate);
		}


		if (this.dispcommditydetails.bar_selection == 0) {
			if (this.dispcommditydetails.minmax != "") {
				if (this.dispcommditydetails.has_minqty == "1" && this.dispcommditydetails.has_maxqty != "1") {
					if ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) >= parseFloat(this.dispcommditydetails.cus_minQty)) {
						this.minmax_valid = 1;
						this.isvalid = true;
						/* console.log("min success"); */
					} else {
						this.minmax_valid = 0;
						this.isvalid = false;
						/* console.log("min failed"); */
					}
				} else if (this.dispcommditydetails.has_maxqty == "1" && this.dispcommditydetails.has_minqty != "1") {
					if (((this.orderDetails.requestqty * this.dispcommditydetails.denomination) <= parseFloat(this.dispcommditydetails.cus_maxQty))) {
						this.minmax_valid = 1;
						this.isvalid = true;
						/* console.log("max success"); */
					} else {
						this.minmax_valid = 0;
						this.isvalid = false;
						/* console.log("max failed"); */
					}
				} else if (this.dispcommditydetails.has_minqty == "1" && this.dispcommditydetails.has_maxqty == "1") {
					/* console.log((parseFloat(this.orderDetails.requestqty) * (this.dispcommditydetails.denomination) + ">=" + parseFloat(this.dispcommditydetails.cus_minQty)) + "&&" + ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) + "<=" + parseFloat(this.dispcommditydetails.cus_maxQty))) */

					if (this.dispcommditydetails.com_bar_type == 1) {
						if ((parseFloat(this.orderDetails.requestqty) * (this.dispcommditydetails.denomination) >= parseFloat(this.dispcommditydetails.cus_minQty)) && ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) <= parseFloat(this.dispcommditydetails.cus_maxQty))) {
							this.minmax_valid = 1;
							this.isvalid = true;
						} else {
							this.minmax_valid = 0;
							this.isvalid = false;
							//console.log(parseFloat(this.orderDetails.requestqty) +"*"+ (this.dispcommditydetails.denomination));
							//console.log("minmax failed");
						}
					} else {
						if ((parseFloat(this.orderDetails.requestqty) * (this.dispcommditydetails.denomination) >= (parseFloat(this.dispcommditydetails.cus_minQty) * 1000)) && ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) <= (parseFloat(this.dispcommditydetails.cus_maxQty) * 1000))) {
							this.minmax_valid = 1;
							this.isvalid = true;
						} else {
							this.minmax_valid = 0;
							this.isvalid = false;
						}
					}
				} else {
					/* console.log("no condtions satisfied"); */
				}
			} else {
				this.minmax_valid = 1;
				this.isvalid = true;
				/* 	console.log("no minmax validation"); */
			}
		} else {
			this.minmax_valid = 1;
			this.isvalid = true;
		}



		this.errormsg = "";
		let totalcost = 0;
		let marginreq = 0;

		if (this.book_totalcost > 0) {
			if (this.dispcommditydetails.margintype == 0) {
				if (this.dispcommditydetails.comtype == 1) {
					marginreq = (this.book_totalcost * (this.dispcommditydetails.silvermargin / 100));
					//console.log("marginreq: "+marginreq);
				} else {
					marginreq = (this.book_totalcost * (this.dispcommditydetails.goldmargin / 100));
					//	console.log("marginreq: "+marginreq);
				}
			} else if (this.dispcommditydetails.margintype == 1) {
				if (this.dispcommditydetails.comtype == 1) {
					marginreq = parseFloat(this.dispcommditydetails.silvermargin) * parseFloat(this.orderDetails.requestqty) * parseFloat(this.dispcommditydetails.denomination);
					//	console.log("marginreq: "+marginreq);
				} else {
					marginreq = parseFloat(this.dispcommditydetails.goldmargin) * parseFloat(this.orderDetails.requestqty) * parseFloat(this.dispcommditydetails.denomination);
					//	console.log("marginreq: "+marginreq);
				}
			}
		}

		this.orderDetails.book_totalcost = Math.round(this.book_totalcost);
		this.orderDetails.requiredmargin = (Math.round(marginreq)).toFixed(2);

		this.book_rate1 = this.orderDetails.req_type == 0 ? this.curcomrate : this.orderDetails.ordervalue;
		/* console.log("req_type: " + this.orderDetails.req_type);
 */
		if (this.pet == "Limitorders") {
			if (this.weightck) {
				this.book_totalcost = Math.round(((parseFloat(this.orderDetails.ordervalue) * parseFloat(this.orderDetails.requestqty) * 1000) / this.dispcommditydetails.com_weight) * parseFloat(this.dispcommditydetails.denomination));
			} else {
				this.book_totalcost = this.orderDetails.book_totalcost;
			}
			//console.log(this.orderDetails.ordervalue+"\n"+this.orderDetails.requestqty+"\n"+this.dispcommditydetails.denomination);
		} else {
			this.book_totalcost = this.orderDetails.book_totalcost;
			//console.log(this.orderDetails.book_totalcost);
		}

		if (this.dispcommditydetails.comtype == 1) {
			this.margin = this.dispcommditydetails.silvermargin;
			/* console.log("margin: " + this.dispcommditydetails.silvermargin); */
		} else {
			this.margin = this.dispcommditydetails.goldmargin;
			/* console.log("margin: " + this.dispcommditydetails.goldmargin); */
		}

		if (this.dispcommditydetails.com_margin_type == 0) {
			this.margin_required = (this.book_totalcost) * (parseFloat(this.dispcommditydetails.com_margin_value) / 100);
			/* console.log("margin_required: " + this.margin_required); */
		} else if (this.dispcommditydetails.com_margin_type == 1) {
			this.margin_required = parseFloat(this.dispcommditydetails.com_margin_value) * (parseFloat(this.orderDetails.requestqty) * parseFloat(this.dispcommditydetails.denomination));//(in kg)
			/* console.log("margin_required: " + this.margin_required); */
		} else {
			/* console.log("ERROR: " + this.dispcommditydetails.com_margin_type); */
		}

		//console.log("requiredmargin: "+this.orderDetails.requiredmargin);
		if (this.pet == "Limitorders") {
			let orderminvalue = 0;
			let ordermaxvalue = 0;
			//console.log("comtype: "+this.dispcommditydetails.comtype);
			if (this.dispcommditydetails.comtype == 1) {
				//console.log("curcomrate: "+this.curcomrate);
				if (this.dispcommditydetails.silverhigh_tol > 0) {
					ordermaxvalue = Math.round(parseFloat(this.curcomrate) + (parseFloat(this.curcomrate) * (this.dispcommditydetails.silverhigh_tol / 100)));
				}
				if (this.dispcommditydetails.silverlow_tol > 0) {
					orderminvalue = Math.round(parseFloat(this.curcomrate) - (parseFloat(this.curcomrate) * (this.dispcommditydetails.silverlow_tol / 100)));
				}
				if (this.dispcommditydetails.silverhigh_tol == 0) {
					ordermaxvalue = parseFloat(this.curcomrate);
				}
				if (this.dispcommditydetails.silverlow_tol == 0) {
					orderminvalue = parseFloat(this.curcomrate);
				}
			} else {
				if (this.dispcommditydetails.goldhigh_tol > 0) {
					ordermaxvalue = Math.round(parseFloat(this.curcomrate) + (parseFloat(this.curcomrate) * (this.dispcommditydetails.goldhigh_tol / 100)));
				}
				if (this.dispcommditydetails.goldlow_tol > 0) {
					orderminvalue = Math.round(parseFloat(this.curcomrate) - (parseFloat(this.curcomrate) * (this.dispcommditydetails.goldlow_tol / 100)));
				}
				if (this.dispcommditydetails.goldhigh_tol == 0) {
					ordermaxvalue = parseFloat(this.curcomrate);
				}
				if (this.dispcommditydetails.goldlow_tol == 0) {
					orderminvalue = parseFloat(this.curcomrate);
				}
			}
			//	console.log("ordervalue: "+this.orderDetails.ordervalue);
			if (this.orderDetails.ordervalue == 0 || this.orderDetails.ordervalue == '' || this.orderDetails.ordervalue == undefined) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				this.errormsg = "Please enter the order value";
				console.log("errormsg: " + this.errormsg);
			} else if ((parseFloat(this.orderDetails.ordervalue) > ordermaxvalue) || (parseFloat(this.orderDetails.ordervalue) < orderminvalue)) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				this.errormsg = "Order value must be in the range between " + orderminvalue + " and " + ordermaxvalue;
				console.log("errormsg: " + this.errormsg);
			} else if (this.orderDetails.requestqty == 0 || this.orderDetails.requestqty == '' || this.orderDetails.requestqty == undefined) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				this.errormsg = "Please enter the request quantity";
				console.log("errormsg: " + this.errormsg);
			} else if (parseFloat(this.orderDetails.requiredmargin) > parseFloat(this.dispcommditydetails.avail_margin)) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				this.errormsg = "You do not have sufficient margin";
				console.log("errormsg: " + this.errormsg);
			} else {
				console.log("else");
				/*this.isvalid = true;*/
			}
		} else {
			if (this.orderDetails.requestqty == 0 || this.orderDetails.requestqty == '' || this.orderDetails.requestqty == undefined) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				this.errormsg = "Please enter the request quantity";
			} else if (parseFloat(this.orderDetails.requiredmargin) > parseFloat(this.dispcommditydetails.avail_margin)) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				this.errormsg = "You do not have sufficient margin";
			}
		}
		console.log("requestqty: " + this.orderDetails.requestqty);
	}

	postrequest(reqType, booktype, form) {
		//alert(booktype);
		//alert(reqType);

		if (this.curcomrate <= 0) {
			const alert = this.alertCtrl.create({
				title: 'Booking Request',
				subTitle: 'Rates are not currently available. Please wait or check your connection.',
				buttons: ['OK']
			});
			alert.present();
			return;
		}

		this.loading2 = this.loadingCtrl.create({
			content: 'Please wait...'
		});
		this.loading2.present();
		if (this.orderDetails.requestqty > 0) {
			this.orderDetails.req_type = reqType;
			if (booktype == 0) {
				this.book_type = 0;
				console.log("com_sel_trade===============>" + this.com_sel_trade);
				console.log(this.curcomrate + "\t" + this.cus_com_status_sell);
				if (this.com_sel_trade == 1) {
					if (this.cus_com_status_sell == 1) {

						this.sendRequest();
					} else {
						const alert = this.alertCtrl.create({
							title: 'Booking Request',
							subTitle: 'Buy is currently disabled for you.Please try again later',
							buttons: ['OK']
						});
						alert.present();
						this.loading2.dismiss();
					}
				} else {
					const alert = this.alertCtrl.create({
						title: 'Booking Request',
						subTitle: 'Buy is currently disabled for this commodity.Please try again later',
						buttons: ['OK']
					});
					alert.present();
					this.loading2.dismiss();

				}
			}
			else if (booktype == 2) {
				this.book_type = 2;
				console.log(this.curcomrate + "\t" + this.cus_com_status_sell);
				if (this.com_retail_trade == 1) {
					if (this.cus_com_status_sell == 1) {
						this.sendRequest();
					} else {
						const alert = this.alertCtrl.create({
							title: 'Booking Request',
							subTitle: 'Buy is currently disabled for you.Please try again later',
							buttons: ['OK']
						});
						alert.present();
						this.loading2.dismiss();
					}
				} else {
					const alert = this.alertCtrl.create({
						title: 'Booking Request',
						subTitle: 'Buy is currently disabled for this commodity.Please try again later',
						buttons: ['OK']
					});
					alert.present();
					this.loading2.dismiss();
				}
			}
			else if (booktype == 1) {//buy
				this.book_type = 1;
				this.curcomrate = this.curcombuyrate;
				if (this.com_buy_trade == 1) {
					if (this.cus_com_status_buy == 1) {
						this.sendRequest();
					} else {
						const alert = this.alertCtrl.create({
							title: 'Booking Request',
							subTitle: 'Sell is currently disabled for you.Please try again later',
							buttons: ['OK']
						});
						alert.present();
						this.loading2.dismiss();
					}
				} else {
					const alert = this.alertCtrl.create({
						title: 'Booking Request',
						subTitle: 'Sell is currently disabled for this commodity. Please try again later',
						buttons: ['OK']
					});
					alert.present();
					this.loading2.dismiss();
				}
			} else {
				console.log("booktype: " + booktype);
			}
		} else {
			this.loading2.dismiss();
			const alert = this.alertCtrl.create({
				title: 'Booking Request',
				subTitle: 'Please enter the quantity',
				buttons: ['OK']
			});
			alert.present();
		}
	}

	sendRequest() {
		let DeviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
		// this.book_deviceid = DeviceData.pushToken ? DeviceData.pushToken : '00000000000000000';
		this.book_deviceid = '00000000000000000';
		let now = new Date();
		let time =
			now.getFullYear() + '-' +
			('0' + (now.getMonth() + 1)).slice(-2) + '-' +
			('0' + now.getDate()).slice(-2) + ' ' +
			('0' + now.getHours()).slice(-2) + ':' +
			('0' + now.getMinutes()).slice(-2) + ':' +
			('0' + now.getSeconds()).slice(-2);

		let customerrequestdetails = {
			'book_cusid': this.userid,
			'book_comid': this.comid,
			'book_qty': this.book_qty,
			'book_rate': this.orderDetails.req_type == 0 ? this.curcomrate : this.orderDetails.ordervalue,
			'discount_actual': this.discount_amt,
			'discount_amt': this.discount_amt,
			'book_type': this.book_type,//0->Buy, 1->Sell, 2->Retail Buy
			'book_comweight': this.dispcommditydetails.com_weight,
			'book_totalcost': this.book_totalcost,
			'book_no_bar': this.book_no_bar,
			'book_bar_type': this.dispcommditydetails.com_bar_type,
			'book_marginhold': this.orderDetails.requiredmargin,
			'margin': this.margin,
			'margin_type': this.dispcommditydetails.margintype,
			'margin_required': this.margin_required,
			'margintakenqty': this.orderDetails.requestqty * this.dispcommditydetails.denomination,
			'request_type': this.orderDetails.req_type,
			'book_deviceid': this.book_deviceid,
			'com_bar_type': this.dispcommditydetails.com_bar_type,
			'request_amt_wt': this.weightck ? 0 : 1,
			'book_usercomment': this.usercomment,
			'book_deliverydate': this.deliverydays,
			'time': time
		};
		this.commonservice.bookingRequest(customerrequestdetails).then(result => {
			this.isvalid = false;
			if (result.success) {
				console.log(JSON.stringify(result));
				this.sendnotification(result.data.book_no);
				const alert = this.alertCtrl.create({
					title: 'Thank you',
					subTitle: result.message,
					buttons: [
						{
							text: 'Ok',
							handler: data => {
								this.events.publish('tab:changed', "HomePage");
								this.navCtrl.setRoot(HomePage, {});
							}
						}
					],
					cssClass: 'booking-alert'
				});
				alert.present();
				setTimeout(() => {
					alert.dismiss();
					this.events.publish('tab:changed', "HomePage");
					this.navCtrl.setRoot(HomePage, {});
				},
					5000);
				this.loading2.dismiss();
				console.log("SUCCESS: " + result.message);
			} else {
				const alert = this.alertCtrl.create({
					title: 'Thank you',
					subTitle: result.message,
					buttons: [
						{
							text: 'Ok',
							handler: data => {
								this.events.publish('tab:changed', "HomePage");
								this.navCtrl.setRoot(HomePage, {});
							}
						}
					],
					cssClass: 'booking-alert'
				});
				alert.present();
				this.loading2.dismiss();
				console.log("ERROR: " + result.status);
			}
		});
	}

	sendnotification(returned_bookno) {
		this.commonservice.notifyBooking(JSON.stringify({ 'book_no': returned_bookno, 'book_deviceid': this.book_deviceid })).then(result => {

		});
	}

	validateInput(event: any) {
		let value = event.target.value;
		value = value.replace(/[^0-9]/g, '');
		if (value.length > 1 && value.startsWith('0')) {
			value = value.replace(/^0+/, '');
		}
		event.target.value = value;
		this.orderDetails.requestqty1 = value;
	}

}
