import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Events } from 'ionic-angular';
import { LiveratesProvider } from '../../providers/liverates/liverates';
import { Platform } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { HomePage } from '../home/home';

/**
 * Generated class for the UpdaterequestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-updaterequest',
	templateUrl: 'updaterequest.html',
})
export class UpdaterequestPage {
	commodity = [];
	//$ionicLoading.show();
	book_no_bar = 0;
	book_qty = 0;
	book_totalcost = 0;
	openorderlist = [];
	errormsg = "";
	commodityarray: any = [];
	commodityarray_length: any = 0;
	trade
	margindata: any = [];
	displaycommodity = [];
	orderDetails: any = [];
	curcomrate: any = 0;
	dispcommditydetails: any = [];
	/*dispcommditydetails.com_weight = "";
	dispcommditydetails.denomination = 0;	
	commodityarray = GeneralService.user_commodityData.comgroupData;
	console.log(JSON.stringify($scope.commodityarray));*/
	book_no: any = "";
	book_rate: any = "";
	book_rate1: any = "";
	book_type: any = 0;
	qty: any = 0;
	com_name: any = "";
	book_comid = "";
	comid: any = "";
	Math: any;
	isvalid: any = 0;
	minmax_valid: any = 0;
	comtype = "";
	curcombuyrate: any = ""
	curcomsellrate: any = "";
	curcomsellretailrate: any = 0;
	cus_com_status_sell: any = "";
	cus_com_status_buy: any = "";
	com_sel_trade: any = "";
	com_retail_trade: any = 0;
	com_buy_trade: any = "";
	trade_enable: any = "";
	available_balance: any = 0;
	display_margin: any = 0;
	market_off: any = "0";
	market_on: any = "0";
	sunday_holiday: any = "0";
	comgroupData: any = [];

	selling_rate: any = "";
	retail_rate: any = "";
	buying_rate: any = "";

	private onResumeSubscription: Subscription;
	baserates: any[] = [];
	oldbaserates: any[] = [];

	bidaskrates: any = {};
	oldbidaskrates: any = {};

	commodities: any = [];
	rpaneldifferences: any = [];
	rpanelsettings: any = {};
	rpaneldata: any = [];
	rpanelbankrates: any = [];
	rpanelcontract: any = [];
	rpanelcommodities: any = [];
	available_balance1: any;

	liverates: any = [];
	oldliverates: any = [];
	marketclosedmsg = "";
	marketstatus = 0;
	userid: any = "";
	loading1: any = "";
	loading2: any = "";
	userData: any = "";
	currentcommodity: any = [];
	dispweights: any = [];
	weightck: boolean = true;
	Amountck: boolean = false;
	purtye = "AMOUNT";
	purtye1 = "WEIGHT";
	Amountvalue: any;
	bookgrm_rate: any
	purchasetype: any = "0";
	usercomment: any = "";

	discsellretail: any;
	discsell_af: any;
	discbuy_bf: any;

	prem_sel_premium = 0;
	prem_buy_premium = 0;
	prem_selretail_premium = 0;
	prem_comsell_active: any = 0;
	prem_combuy_active: any = 0;

	discsell: any;
	discsell_before: any;
	discsell_after: any;
	discbuy: any;
	discbuy_before: any;
	discbuy_after: any;
	high_sell_rate: any = "";
	high_buying_rate: any = "";
	discount: any = 0;
	buy_rate: any;
	sell_rate: any;
	disp_new: any[] = [];

	constructor(private commonservice: CommonServiceProvider, public cdRef: ChangeDetectorRef, public navCtrl: NavController, public navParams: NavParams, public liverateservice: LiveratesProvider, private zone: NgZone, platform: Platform, private network: Network, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public events: Events) {
		//this.commodity  = this.navParams.get('commodity');
		this.book_no = this.navParams.get('data_book_no');
		this.book_rate = this.navParams.get('data_book_rate');
		this.purchasetype = this.navParams.get('book_request_amtwt')
		this.qty = this.navParams.get('data_qty');
		this.com_name = this.navParams.get('data_com_name');
		this.book_comid = this.navParams.get('data_book_comid');
		this.book_type = this.navParams.get('data_book_type');
		this.comid = this.book_comid;
		this.Amountvalue = this.navParams.get('book_totalcost')
		this.Math = Math;
		console.log(this.purchasetype);
		console.log("commodity: " + this.commodity + "\tbook_no: " + this.book_no + "\tbook_rate: " + this.book_rate + "\tqty: " + this.qty + "\tcom_name: " + this.com_name + "\tbook_comid: " + this.book_comid + "\tcomid: " + this.comid + "\tbook_type: " + this.book_type);

		this.commodityarray = JSON.parse(localStorage.getItem('MAHARAJ_user_commodityData'));
		this.margindata = JSON.parse(localStorage.getItem('MAHARAJ_margindata'));
		this.available_balance1 = JSON.parse(localStorage.getItem('MAHARAJ_available_balance'));
		console.log("available=======================>" + this.available_balance);
		let margindata = this.margindata;
		let book_comid = this.book_comid;
		//let calculatetotal = this.calculatetotal();
		let requestqty = this.orderDetails.requestqty;
		this.orderDetails.ordervalue = parseFloat(this.book_rate);
		let qty = this.qty;
		this.userData = JSON.parse(localStorage.getItem('MAHARAJ_userData'));
		this.userid = this.userData.userid;
		let dispcommditydetails: any = [];
		let com_buy_trade = 0;
		let com_sel_trade = 0;
		let com_retail_trade = 0;
		let cus_com_status_sell = 0;
		let cus_com_status_buy = 0;
		let prem_buy_premium: any;
		let prem_sel_premium: any;
		let prem_selretail_premium: any;

		//console.log("1");
		events.subscribe('marketstatus:changed', (marketstatus) => {
			this.marketstatus = marketstatus;
			//console.log(this.marketstatus);
		});
		events.subscribe('liverate:changed', (liverate) => {
			console.log("liverate:changed");
			this.liverates = liverate;
			//console.log(JSON.stringify(this.liverates));		
			//console.log(this.comid +"\t"+ this.marketstatus);
			if (this.comid != 0) {//&& this.marketstatus == 1
				let selectedcomid = this.comid;
				let booktype = this.book_type;
				let curcomsellrate: any;
				let curcomsellretailrate: any;
				let curcombuyrate: any;
				let currentcommodity: any;
				let selling_rate: any;
				let retail_rate: any;
				let buying_rate: any;
				let curcomrate = 0;

				this.liverates.forEach(function (rcval, rckey) {
					//console.log(rcval['com_id'] +"=="+ selectedcomid);
					if (rcval['com_id'] == selectedcomid) {
						curcomsellrate = rcval['selling_rate'];
						curcomsellretailrate = rcval['selling_rate'];
						curcombuyrate = rcval['buying_rate'];
						selling_rate = rcval['selling_rate'];
						retail_rate = rcval['selling_rate'];
						buying_rate = rcval['buying_rate'];
						if (booktype == 0) {
							curcomrate = selling_rate;
						} else if (booktype == 2) {
							curcomrate = retail_rate;
							//console.log(curcomrate);
						} else {
							curcomrate = buying_rate;
						}
						currentcommodity = rcval;
					}
				});
				this.curcomsellrate = curcomsellrate;
				this.curcomsellretailrate = curcomsellretailrate;
				this.curcombuyrate = curcombuyrate;
				this.selling_rate = selling_rate;
				this.retail_rate = retail_rate;
				this.buying_rate = buying_rate;
				this.curcomrate = curcomrate;
				if (booktype == 1) {
					this.discbuy_before = parseFloat(this.buying_rate) - parseFloat(this.dispcommditydetails.prem_buy_premium);

					this.discbuy = this.discbuy_before;
					this.discbuy_after = this.discbuy_before;
					let discbuy_bf = this.discbuy_before;
					this.discbuy_bf = discbuy_bf;
					// this.discbuy_bf = discbuy_bf.toLocaleString();

					//console.log("this.discbuy=====>"+this.discbuy)
					this.curcomrate = this.discbuy;
					this.discount = this.dispcommditydetails.prem_buy_premium;
				} else if (booktype == 0) {
					//console.log(this.sell_active)
					//this.discsell=this.selling_rate - this.prem_sel_premium;
					this.discsell_before = parseFloat(this.selling_rate) - parseFloat(this.dispcommditydetails.prem_sel_premium);

					this.discsell = this.discsell_before;
					this.discsell_after = this.discsell_before;
					let discsell_af = this.discsell_after;
					this.discsell_af = discsell_af;
					// this.discsell_af = discsell_af.toLocaleString();


					/* console.log("this.selling_rate=====>"+this.selling_rate)
					console.log("this.prem_sel_premium=====>"+this.prem_sel_premium)
					console.log("this.discbuy=====>"+this.discsell) */
					this.curcomrate = this.discsell;
					this.discount = this.dispcommditydetails.prem_sel_premium;
				} else if (booktype == 2) {
					//console.log(this.sellretail_active)
					this.discsellretail = this.retail_rate - this.prem_selretail_premium;
					this.curcomrate = this.discsellretail;
					this.discount = this.dispcommditydetails.prem_selretail_premium;
				}
				this.currentcommodity = currentcommodity;
				this.calculatetotal();
				//console.log(this.curcomsellrate+"\n"+this.curcombuyrate);
			} else {
				this.curcomsellrate = "-";
				this.curcomsellretailrate = "-";
				this.curcombuyrate = "-";
			}
		});
		let dispweights = this.dispweights;
		this.commodityarray.forEach(function (value, key) {
			//console.log(value.comid +"=="+ book_comid);
			if (value.comid == book_comid) {
				//console.log(JSON.stringify(value));
				dispcommditydetails = {
					'avail_margin': isNaN(parseFloat(margindata.Balance)) ? 0 : parseFloat(margindata.Balance),
					'com_weight': Math.round(value.weight),
					'bar_selection': value.bar_selection,
					'com_bar_no': value.com_bar_no,
					'com_bar_type': value.com_bar_type,
					'com_unit': value.com_unit,
					'denomination': parseFloat(value.barqty),
					'goldhigh_tol': margindata.goldhigh_tol,
					'goldlow_tol': margindata.goldlow_tol,
					'silverhigh_tol': margindata.silverhigh_tol,
					'silverlow_tol': margindata.silverlow_tol,
					'silvermargin': parseFloat(value.com_margin_type),
					'goldmargin': parseFloat(value.com_margin_type),
					'comtype': value.comtype,
					'margintype': parseFloat(value.com_margin_type),
					'minmax': value.minmax,
					'com_buy_trade': value.com_buy_trade,
					'com_sel_trade': value.com_sel_trade,
					'com_retail_trade': value.com_retail_trade,
					'cus_com_status_sell': value.cus_com_status_sell,
					'cus_com_status_buy': value.cus_com_status_buy,
					'cus_maxQty': value.cus_maxQty,
					'cus_minQty': value.cus_minQty,
					'has_minqty': value.has_minqty,
					'has_maxqty': value.has_maxqty,
					'maxallotedqty': value.maxallotedqty,
					'min': value.min,
					'max': value.max,
					'weight': parseFloat(value.weight),
					'allowed_decimals': parseInt(value.allowed_decimals),
					'cus_com_amountpurch': value.cus_com_amountpurch,
					'prem_buy_premium': parseFloat(value.prem_buy_premium),
					'prem_sel_premium': parseFloat(value.prem_sel_premium),
					'prem_selretail_premium': parseFloat(value.prem_selretail_premium),
					'cus_com_bar_no': parseFloat(value.cus_com_bar_no),
					'cus_bar_selection': parseFloat(value.cus_bar_selection),
					'cus_com_bar_type': parseFloat(value.cus_com_bar_type),
					'cus_com_bar_quantity': parseFloat(value.cus_com_bar_quantity),
				};
				console.log("dispweights: " + dispweights);
				console.log("ba===========>" + value.bar_selection);
				for (let i = 1; i <= value.com_bar_no; i++) {
					dispweights.push({
						'code': (parseFloat(value.barqty) * i),
						'name': (parseFloat(value.barqty) * i)
					});
				}
				console.log("dispweights: " + dispweights);
				//$ionicLoading.hide();
				requestqty = parseFloat(dispcommditydetails.comtype) ? parseFloat(qty) : parseFloat(qty) * 1000;
				com_buy_trade = value.com_buy_trade;
				com_sel_trade = value.com_sel_trade;
				com_retail_trade = value.com_retail_trade;
				cus_com_status_sell = value.cus_com_status_sell;
				cus_com_status_buy = value.cus_com_status_buy;


			}
		});
		this.dispweights = dispweights;
		this.orderDetails.requestqty = qty / dispcommditydetails.denomination;
		console.log("bar_selection: " + dispcommditydetails.bar_selection);
		/*if(dispcommditydetails.bar_selection == 1){
			this.orderDetails.requestqty1 = parseFloat(qty)*1000;
			console.log("requestqty1: "+this.orderDetails.requestqty1);
		}*/
		//this.orderDetails.requestqty = 	requestqty;
		this.orderDetails.requestqty1 = parseFloat(qty);
		console.log(this.orderDetails.requestqty1);
		this.com_buy_trade = com_buy_trade;
		this.com_sel_trade = com_sel_trade;
		this.com_retail_trade = com_retail_trade;
		this.cus_com_status_sell = cus_com_status_sell;
		this.cus_com_status_buy = cus_com_status_buy;
		//this.calculatetotal();
		this.dispcommditydetails = dispcommditydetails;
		console.log(this.dispcommditydetails);

		this.getCommodityList();


	}
	calcAmount(type, ev) {
		console.log("Amountvalue=====>", ev)
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


	updateCommodities() {
		console.log("updateCommodities()");
		this.commonservice.getCommodities(this.userid).then(result => {
			if (result.data.success) {
				localStorage.setItem('MAHARAJ_trade_enable', result.data.settings.trade_enable);
				localStorage.setItem('MAHARAJ_user_commodityData', JSON.stringify(result.data.comgroupData));
				localStorage.setItem('MAHARAJmargindata', JSON.stringify(result.data.settings));
				localStorage.setItem('MAHARAJ_available_balance', result.data.available_balance);
				localStorage.setItem('MAHARAJ_display_margin', result.data.settings.display_margin);
				localStorage.setItem('MAHARAJ_market_on', result.data.settings.market_on);
				localStorage.setItem('MAHARAJ_market_off', result.data.settings.market_off);

				this.commodityarray = localStorage.getItem('MAHARAJ_user_commodityData');
				this.commodityarray_length = this.commodityarray.length;
				this.trade_enable = result.data.settings.trade_enable;
				this.available_balance = result.data.available_balance;
				this.display_margin = result.data.settings.display_margin;
				console.log("display_margin:==================>" + this.display_margin + "\n" + "available_balance: " + this.available_balance);
				this.market_on = result.data.settings.market_on;
				this.market_off = result.data.settings.market_off;
				this.displaycommodity = [];
				let dispcommditydetails = {};
				this.margindata = localStorage.getItem('MAHARAJ_margindata');
				//let margindata = this.margindata;
				let dispweights = this.dispweights;
				this.comgroupData.forEach(function (value, key) {
					if (this.comid == value.comid) {
						if ((value.com_buy_trade == 1 && value.com_sel_trade == 1) || (value.cus_com_status_buy && value.cus_com_status_sell)) {
							dispcommditydetails = {
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
								'com_retail_trade': value.com_retail_trade,
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
								'allowed_decimals': parseInt(value.allowed_decimals),
								'cus_com_amountpurch': value.cus_com_amountpurch,
								'prem_buy_premium': parseFloat(value.prem_buy_premium),
								'prem_sel_premium': parseFloat(value.prem_sel_premium),
								'prem_selretail_premium': parseFloat(value.prem_selretail_premium),
								'cus_com_bar_no': parseFloat(value.cus_com_bar_no),
								'cus_bar_selection': parseFloat(value.cus_bar_selection),
								'cus_com_bar_type': parseFloat(value.cus_com_bar_type),
								'cus_com_bar_quantity': parseFloat(value.cus_com_bar_quantity),
							};
							console.log("dispweights: " + dispweights);
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
				this.dispcommditydetails = dispcommditydetails;
				this.calculatetotal();
			} else {
				console.log("result.data.success(getCommodities): " + result.data.success);
			}
		});
	}
	calculatetotal1() {
		if (this.purchasetype == 1) {
			var value = { '_value': parseFloat(this.Amountvalue) }
			console.log(this.orderDetails.ordervalue)
			this.calcAmount(1, value);
		}
	}

	calculatetotal() {
		console.log("calculatetotal()", this.Amountvalue);
		console.log("typeof==========>", (this.orderDetails.requestqty))
		this.orderDetails.req_type = 1;
		/* 		if(this.purchasetype==1){
					var value={'_value':parseFloat(this.Amountvalue)}
					console.log(this.orderDetails.ordervalue)
					this.calcAmount(1,value);
				} */

		if (this.dispcommditydetails.bar_selection == "1") {//dropdown
			console.log("requestqty: " + this.orderDetails.requestqty);
			this.orderDetails.requestqty = this.orderDetails.requestqty1 / 1000;
			console.log("NOTE: your qty has been converted to kg" + "\nrequestqty: " + this.orderDetails.requestqty);

		} else {
			if (!(this.cdRef as any).destroyed) {
				this.cdRef.detectChanges();
			}
			var t = String(this.orderDetails.requestqty);
			if (this.dispcommditydetails.allowed_decimals > 0) {
				let decimalvalue: any = this.dispcommditydetails.allowed_decimals + 1;
				if (t.indexOf(".") !== -1) {
					console.log("AD:", (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), decimalvalue)));
					this.orderDetails.requestqty = (t.indexOf(".") >= 0) ? (t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), decimalvalue)) : t;

				}
			} else {
				this.orderDetails.requestqty = (this.orderDetails.requestqty);
			}
		}
		let requestqty: any = "";
		let qty_conversion = (this.dispcommditydetails.com_bar_type == 1 ? 1 : 1000)

		if (this.dispcommditydetails.bar_selection == 1) {//dropdown
			console.log(this.orderDetails.requestqty1 + "/" + this.dispcommditydetails.denomination);
			this.book_no_bar = this.orderDetails.requestqty1 / this.dispcommditydetails.denomination;
			requestqty = this.orderDetails.requestqty1 / this.book_no_bar;
		} else {
			this.book_no_bar = this.orderDetails.requestqty;
		}
		console.log("book_qty: " + this.book_no_bar + "*" + this.dispcommditydetails.denomination + "/" + qty_conversion);
		this.book_qty = this.book_no_bar * this.dispcommditydetails.denomination / qty_conversion;
		console.log(this.curcomrate + "/" + this.dispcommditydetails.com_weight + "*" + this.book_qty + "*" + 1000);
		if (this.purchasetype == 0) {
			this.book_totalcost = (this.curcomrate / this.dispcommditydetails.com_weight) * this.book_qty * 1000;
		} else {
			this.book_totalcost = this.Amountvalue;
		}
		console.log("book_qty: " + this.book_qty + "\nbook_totalcost: " + this.book_totalcost);
		console.log(this.dispcommditydetails);

		if (this.dispcommditydetails.bar_selection == 0) {
			if (this.dispcommditydetails.minmax != "") {
				console.log(this.dispcommditydetails.has_minqty + "\t" + this.dispcommditydetails.has_maxqty);
				if (this.dispcommditydetails.has_minqty == "1" && this.dispcommditydetails.has_maxqty != "1") {
					if ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) >= parseFloat(this.dispcommditydetails.cus_minQty)) {	//&& (parseFloat(this.orderDetails.requestqty * this.dispcommditydetails.denomination).toFixed(3) <= parseFloat(this.dispcommditydetails.cus_maxQty))
						this.minmax_valid = 1;
						this.isvalid = true;
						console.log("min success");
					} else {
						this.minmax_valid = 0;
						this.isvalid = false;
						console.log("min failed");
						//console.log("min failed: "+(parseFloat(this.orderDetails.requestqty * this.dispcommditydetails.denomination).toFixed(3) ++);				
					}
				} else if (this.dispcommditydetails.has_maxqty == "1" && this.dispcommditydetails.has_minqty != "1") {
					if (((this.orderDetails.requestqty * this.dispcommditydetails.denomination) <= parseFloat(this.dispcommditydetails.cus_maxQty))) {
						this.minmax_valid = 1;
						this.isvalid = true;
						console.log("max success");
					} else {
						this.minmax_valid = 0;
						this.isvalid = false;
						console.log("max failed");
					}
				} else if (this.dispcommditydetails.has_minqty == "1" && this.dispcommditydetails.has_maxqty == "1") {
					/* if ((parseFloat(this.orderDetails.requestqty) * (this.dispcommditydetails.denomination) >= parseFloat(this.dispcommditydetails.cus_minQty) * 1000) && ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) <= parseFloat(this.dispcommditydetails.cus_maxQty) * 1000)) {
						this.minmax_valid = 1;
						this.isvalid = true;
						console.log("minmax success");
					} else {
						this.minmax_valid = 0;
						this.isvalid = false;
						console.log((parseFloat(this.orderDetails.requestqty) * (this.dispcommditydetails.denomination) + ">=" + parseFloat(this.dispcommditydetails.cus_minQty)) + "&&" + ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) + "<=" + parseFloat(this.dispcommditydetails.cus_maxQty)))
						console.log("minmax failed");
					} */
					if (this.dispcommditydetails.com_bar_type == 1) {
						if ((parseFloat(this.orderDetails.requestqty) * (this.dispcommditydetails.denomination) >= parseFloat(this.dispcommditydetails.cus_minQty)) && ((this.orderDetails.requestqty * this.dispcommditydetails.denomination) <= parseFloat(this.dispcommditydetails.cus_maxQty))) {
							this.minmax_valid = 1;
							this.isvalid = true;
						} else {
							this.minmax_valid = 0;
							this.isvalid = false;
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
					console.log("no condtions satisfied");
				}
			} else {
				this.minmax_valid = 1;
				this.isvalid = true;
				console.log("no minmax validation");
			}
		} else {
			this.minmax_valid = 1;
			this.isvalid = true;
		}

		if (this.book_type == 0) {
			this.curcomrate = this.curcomsellrate - this.dispcommditydetails.prem_sel_premium;
			console.log(this.curcomrate);
		} else if (this.book_type == 1) {
			this.curcomrate = this.curcombuyrate - this.dispcommditydetails.prem_buy_premium;
			console.log(this.curcomrate);
		} else {
			console.log("ERROR: " + this.cus_com_status_sell);
		}

		this.errormsg = "";
		let totalcost = 0;
		let marginreq = 0;
		console.log(this.curcomrate);
		if (this.orderDetails.req_type == 0) {
			console.log(this.curcomrate);
			if (this.purchasetype == 0) {
				this.book_totalcost = this.orderDetails.requestqty > 0 ? ((this.curcomrate / this.dispcommditydetails.com_weight) * ((this.orderDetails.requestqty) * (this.dispcommditydetails.denomination * 1000))) : 0;
			} else {
				this.book_totalcost = this.Amountvalue;
			}
			console.log("(rate/weight)*(requestqty*denomination*1000)");
			console.log("(" + this.curcomrate + "/" + this.dispcommditydetails.com_weight + ")*(" + this.orderDetails.requestqty + "*" + this.dispcommditydetails.denomination + "*" + 1000 + ")");
			console.log("book_totalcost: " + this.book_totalcost);
			console.log(this.curcomrate + "/" + this.dispcommditydetails.com_weight + "/" + this.orderDetails.requestqty + "/" + this.dispcommditydetails.denomination);
		} else if (this.orderDetails.req_type == 1) {
			if (this.purchasetype == 0) {
				this.book_totalcost = (this.orderDetails.requestqty > 0 && this.orderDetails.ordervalue > 0) ? ((this.orderDetails.ordervalue / this.dispcommditydetails.com_weight) * ((this.orderDetails.requestqty) * this.dispcommditydetails.denomination * 1000)) : 0;
				console.log("book_totalcost: " + this.book_totalcost);
			} else {
				this.book_totalcost = this.Amountvalue;
			}
		}
		if (this.book_totalcost > 0) {
			if (this.dispcommditydetails.margintype == 0) {
				if (this.dispcommditydetails.comtype == 1) {
					marginreq = (this.book_totalcost * (this.dispcommditydetails.silvermargin / 100));
					console.log("marginreq: " + marginreq);
				} else {
					marginreq = (this.book_totalcost * (this.dispcommditydetails.goldmargin / 100));
					console.log("marginreq: " + marginreq);
				}
			} else if (this.dispcommditydetails.margintype == 1) {
				if (this.dispcommditydetails.comtype == 1) {
					marginreq = parseFloat(this.dispcommditydetails.silvermargin) * parseFloat(this.orderDetails.requestqty) * parseFloat(this.dispcommditydetails.denomination);
					console.log("marginreq: " + marginreq);
				} else {
					marginreq = parseFloat(this.dispcommditydetails.goldmargin) * parseFloat(this.orderDetails.requestqty) * parseFloat(this.dispcommditydetails.denomination);
					console.log("marginreq: " + marginreq);
				}
			}
		}

		this.orderDetails.totalcost = Math.round(this.book_totalcost);
		this.orderDetails.requiredmargin = (Math.round(marginreq)).toFixed(2);
		console.log("requiredmargin: " + this.orderDetails.requiredmargin);
		console.log("req_type: " + this.orderDetails.req_type);
		if (this.orderDetails.req_type == 1) {
			let orderminvalue = 0;
			let ordermaxvalue = 0;
			// console.log("comtype: " + this.dispcommditydetails.comtype);
			if (this.dispcommditydetails.comtype == 1) {
				console.log("curcomrate: " + this.curcomrate);
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
			console.log("ordervalue: " + this.orderDetails.ordervalue);
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
			} else {
				console.log("else");
				/*this.isvalid = true;*/
			}
		} else {
			if (this.orderDetails.requestqty == 0 || this.orderDetails.requestqty == '' || this.orderDetails.requestqty == undefined) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				console.log("requestqty: " + this.orderDetails.requestqty);
				this.errormsg = "Please enter the request quantity";
			} else if (parseFloat(this.orderDetails.requiredmargin) > parseFloat(this.dispcommditydetails.avail_margin)) {
				this.isvalid = false;
				console.log("isvalid: " + this.isvalid);
				this.errormsg = "You do not have sufficient margin";
			}
		}
	}

	postrequest(reqType, booktype, form) {
		this.loading2 = this.loadingCtrl.create({
			content: 'Please wait...'
		});
		this.loading2.present();

		if (this.orderDetails.requestqty > 0) {
			this.orderDetails.req_type = reqType;
			if (booktype == 0) {
				//this.book_type = 0;
				console.log("this.book_type: " + this.book_type);
				console.log(this.curcomrate);
				if (this.com_sel_trade == 1) {
					if (this.cus_com_status_sell == 1) {
						this.sendRequest();
					} else {
						const alert = this.alertCtrl.create({
							title: 'Booking Request',
							subTitle: 'Buy is currently disabled for you.Please try again later',
							buttons: ['OK']
						});
					}
				} else {
					const alert = this.alertCtrl.create({
						title: 'Booking Request',
						subTitle: 'Buy is currently disabled for this commodity.Please try again later',
						buttons: ['OK']
					});
					alert.present();
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
				//this.book_type = 1;
				console.log("this.book_type: " + this.book_type);
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
			const alert = this.alertCtrl.create({
				title: 'Booking Request',
				subTitle: 'Please enter the quantity',
				buttons: ['OK']
			});
			alert.present();
		}
	}
	amountchange() {
		this.weightck = false;
		this.Amountck = true;
		this.purtye = "AMOUNT";
		this.purtye1 = "WEIGHT";
	}
	weightchange() {
		this.Amountck = false;
		this.weightck = true;
		this.purtye1 = "AMOUNT";
		this.purtye = "WEIGHT";
	}
	sendRequest() {
		this.book_rate1 = this.orderDetails.req_type == 0 ? this.curcomrate : this.orderDetails.ordervalue;
		console.log("req_type: " + this.orderDetails.req_type);
		//let book_totalcost = 0;
		/*if(this.orderDetails.req_type == 1) {
			//book_totalcost = Math.round(((parseFloat(this.orderDetails.ordervalue) * parseFloat(this.orderDetails.requestqty)*1000) / this.dispcommditydetails.com_weight)*parseFloat(this.dispcommditydetails.denomination));
			console.log(this.orderDetails.ordervalue+"\n"+this.orderDetails.requestqty+"\n"+this.dispcommditydetails.denomination);
		} else {
			//book_totalcost = this.orderDetails.totalcost;
			console.log(this.orderDetails.book_totalcost);
		}*/
		let margin = 0;
		if (this.dispcommditydetails.comtype == 1) {
			margin = this.dispcommditydetails.silvermargin;
			console.log("margin: " + this.dispcommditydetails.silvermargin);
		} else {
			margin = this.dispcommditydetails.goldmargin;
			console.log("margin: " + this.dispcommditydetails.goldmargin);
		}
		let WLDeviceData: any = [];
		WLDeviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
		let book_deviceid = WLDeviceData.pushToken;
		let customerrequestdetails = {
			'book_cusid': this.userid,
			'book_no': this.book_no,
			'book_comid': this.comid, //this.orderDetails.commodity,
			//'book_qty'			: this.orderDetails.requestqty * this.dispcommditydetails.denomination,
			'book_qty': this.book_qty,
			'book_rate': this.orderDetails.req_type == 0 ? this.curcomrate : this.orderDetails.ordervalue,
			'book_type': this.book_type,//0 
			'book_comweight': this.dispcommditydetails.com_weight,
			'book_totalcost': this.book_totalcost,
			//'book_no_bar'		: this.orderDetails.requestqty,
			'book_no_bar': this.book_no_bar,
			'book_bar_type': this.dispcommditydetails.com_bar_type,
			'book_marginhold': this.orderDetails.requiredmargin,
			'margin': margin,
			'margin_type': this.dispcommditydetails.margintype,
			'margintakenqty': this.orderDetails.requestqty * this.dispcommditydetails.denomination,
			'request_type': this.orderDetails.req_type,
			'book_deviceid': book_deviceid,
			'com_bar_type': this.dispcommditydetails.com_bar_type,
			'allowed_decimals': this.dispcommditydetails.allowed_decimals,
			'request_amt_wt': this.purchasetype,
		};
		/*'book_cusid'		: this.userid, 
		'book_comid'		: this.comid,
		//'book_qty'			: this.orderDetails.requestqty * this.dispcommditydetails.denomination, 
		'book_qty'			: this.book_qty, 
		'book_rate' 		: this.orderDetails.req_type == 0 ? this.curcomrate : this.orderDetails.ordervalue,
		'book_type' 		: this.book_type,//0 
		'book_comweight'	: this.dispcommditydetails.com_weight, 
		//'book_totalcost' 	: this.book_totalcost, 
		'book_totalcost' 	: this.book_totalcost, 
		//'book_no_bar'		: this.orderDetails.requestqty,
		'book_no_bar'		: this.book_no_bar,
		'book_bar_type'		: this.dispcommditydetails.com_bar_type,
		'book_marginhold'	: this.orderDetails.requiredmargin, 
		'margin' 			: this.margin, 
		'margin_type' 		: this.dispcommditydetails.margintype, 
		'margin_required'	: this.margin_required,
		'margintakenqty'	: this.orderDetails.requestqty * this.dispcommditydetails.denomination, 
		'request_type'		: this.orderDetails.req_type,
		'book_deviceid'	    : this.book_deviceid,
		'com_bar_type'		: this.dispcommditydetails.com_bar_type*/

		this.commonservice.updatebookRequest(customerrequestdetails).then(result => {
			this.isvalid = false;
			if (result.success) {
				//sendnotification(result.data.data.book_no);	
				const alert = this.alertCtrl.create({
					title: 'Customer request',
					subTitle: result.message,
					buttons: [
						{
							text: 'Ok',
							handler: data => {
								this.events.publish('tab:changed', "HomePage");
								this.navCtrl.setRoot(HomePage, {});
							}
						}
					]
				});
				alert.present();
				this.loading2.dismiss();
				console.log("SUCCESS: " + result.message);
			} else {
				const alert = this.alertCtrl.create({
					title: 'Customer request',
					subTitle: result.message,
					buttons: ['OK']
				});
				alert.present();
				this.loading2.dismiss();
				console.log("ERROR: " + result.status);
			}
		});
	}

	getCommodityList() {

	}


	ionViewDidLoad() {

	}

	ionViewDidEnter() {
		this.marketstatus = parseInt(localStorage.getItem('MAHARAJ_MarketStatus'));
		this.trade_enable = localStorage.getItem('MAHARAJ_trade_enable');
		if (this.liverates.length == 0) {
			console.log("if");
			this.liverates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates'));
			console.log("liverates.length: " + this.liverates.length);
			console.log(this.comid + "\t" + this.marketstatus);
			if (this.comid != 0) {//&& this.marketstatus == 1
				let selectedcomid = this.comid;
				let booktype = this.book_type;
				let curcomsellrate: any;
				let curcomsellretailrate: any;
				let curcombuyrate: any;
				let currentcommodity: any;
				let selling_rate: any;
				let retail_rate: any;
				let buying_rate: any;
				let curcomrate = 0;
				this.liverates.forEach(function (rcval, rckey) {
					console.log(rcval['com_id'] + "==" + selectedcomid);
					if (rcval['com_id'] == selectedcomid) {
						curcomsellrate = rcval['selling_rate'];
						curcomsellretailrate = rcval['selling_rate'];
						curcombuyrate = rcval['buying_rate'];
						selling_rate = rcval['selling_rate'];
						retail_rate = rcval['selling_rate'];
						buying_rate = rcval['buying_rate'];
						if (booktype == 0) {
							curcomrate = selling_rate;
						} else if (booktype == 2) {
							curcomrate = retail_rate;
						} else {
							curcomrate = buying_rate;
						}
						currentcommodity = rcval;
					}
				});
				this.curcomsellrate = curcomsellrate;
				this.curcomsellretailrate = curcomsellretailrate;
				this.curcombuyrate = curcombuyrate;
				this.selling_rate = selling_rate;
				this.retail_rate = retail_rate;
				this.buying_rate = buying_rate;
				this.curcomrate = curcomrate;
				if (booktype == 1) {
					this.discbuy_before = parseFloat(this.buying_rate) - parseFloat(this.dispcommditydetails.prem_buy_premium);

					this.discbuy = this.discbuy_before;
					this.discbuy_after = this.discbuy_before;
					let discbuy_bf = this.discbuy_before;
					this.discbuy_bf = discbuy_bf;
					// this.discbuy_bf = discbuy_bf.toLocaleString();


					//console.log("this.discbuy=====>"+this.discbuy)
					this.curcomrate = this.discbuy;
					this.discount = this.dispcommditydetails.prem_buy_premium;
				} else if (booktype == 0) {
					//console.log(this.sell_active)
					//this.discsell=this.selling_rate - this.prem_sel_premium;
					this.discsell_before = parseFloat(this.selling_rate) - parseFloat(this.dispcommditydetails.prem_sel_premium);

					this.discsell = this.discsell_before;
					this.discsell_after = this.discsell_before;
					let discsell_af = this.discsell_after;
					// this.discsell_af = discsell_af.toLocaleString();
					this.discsell_af = discsell_af;


					/* console.log("this.selling_rate=====>"+this.selling_rate)
					console.log("this.prem_sel_premium=====>"+this.prem_sel_premium)
					console.log("this.discbuy=====>"+this.discsell) */
					this.curcomrate = this.discsell;
					this.discount = this.dispcommditydetails.prem_sel_premium;
				} else if (booktype == 2) {
					//console.log(this.sellretail_active)
					this.discsellretail = this.retail_rate - this.prem_selretail_premium;
					this.curcomrate = this.discsellretail;
					this.discount = this.dispcommditydetails.prem_selretail_premium;
				}
				this.currentcommodity = currentcommodity;
			} else {
				this.curcomsellrate = "-";
				this.curcomsellretailrate = "-";
				this.curcombuyrate = "-";
			}
		} else {
			console.log("else");
			this.liverates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates'));
			console.log("liverates.length: " + this.liverates.length);
		}
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
