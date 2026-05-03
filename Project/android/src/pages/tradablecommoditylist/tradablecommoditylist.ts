import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, AlertController, Events, ToastController, Toast, NavParams, App } from 'ionic-angular';
import { LiveratesProvider } from '../../providers/liverates/liverates';
import { Platform } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { Network } from '@ionic-native/network';
import { BookingPage } from "../booking/booking";
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
/**
 * Generated class for the TradablecommoditylistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-tradablecommoditylist',
	templateUrl: 'tradablecommoditylist.html',
})
export class TradablecommoditylistPage {

	liverates: any = [];
	oldliverates: any = [];
	marketstatus: number = 1;
	toast: Toast;
	seg: any = "selling";
	pet: any = "";
	commodityarray: any = [];
	status: any;
	constructor(public toastController: ToastController, private event: Events, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public liverateservice: LiveratesProvider, private zone: NgZone, platform: Platform, private network: Network, private app: App, public events: Events) {
		/* 		events.subscribe( 'marketstatus:changed', ( marketstatus ) => {
					this.marketstatus = marketstatus;
					if(this.marketstatus == 0){
						this.liverates = [];	
						let toastController = this.toastController;
						toastController.create({
							message: "Market Off",
							duration:3000
						}).present();
						this.events.publish( 'tab:changed', "HomePage" );
						this.navCtrl.setRoot(HomePage);
					}
				});
				events.subscribe( 'liverate:changed', ( liverate ) => {
					this.oldliverates = this.liverates;
					this.liverates = liverate;	
				
				}); */
		this.pet = "selling";
		if (localStorage.getItem('MAHARAJ_trade_enable') == "0") {
			console.log(1)
			this.presentToast();
			this.events.publish('tab:changed', "HomePage");
			this.navCtrl.setRoot(HomePage);
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
					if (this.commodityarray.length > 0) {
						this.commodityarray.forEach(function (value, key2) {
							console.log(comid + "==" + value.comid);
							if (comid == value.comid) {
								if ((value.com_buy_trade == 1 && value.com_sel_trade == 1) || (value.cus_com_status_buy && value.cus_com_status_sell)) {

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
				this.event.publish('tab:changed', "LoginPage");
				this.navCtrl.setRoot(LoginPage, { 'comid': comid, 'reqtype': reqtype, 'page': "booking" });


			}
		} else {
			console.log(comid + "\t" + reqtype);
		}
	}
	ionViewDidEnter() {
		this.liverates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates'));
		//console.log(this.liverates);
		if (this.liverates.length == 0) {
			this.liverates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates'));
			this.oldliverates = this.liverates;
		} else {
			this.events.subscribe('liverate:changed', (liverate) => {
				console.log(liverate)
				this.oldliverates = this.liverates;
				this.liverates = liverate;
				if (localStorage.getItem('MAHARAJ_trade_enable') == "0") {
					this.presentToast();
					this.events.publish('tab:changed', "HomePage");
					this.navCtrl.setRoot(HomePage);
				}
			});
		}


		/* 		localStorage.getItem('SHIVSAHAIuserlogged');
				this.status=localStorage.getItem('SHIVSAHAIuser_status');
				console.log(this.status);
				if(this.status.user_status!==1){
					let alert = this.alertCtrl.create({
						title: 'Session Timeout',
						subTitle: 'Account Expired!!',
						buttons: ['Ok']
					  });
					  alert.present();
					  localStorage.setItem('SHIVSAHAIuserData',JSON.stringify({ 
						  'loginstatus'	: false, 
						  'username' 		: 'guest', 
						  'usergroup'		: 'Default' 
					  }));
					  this.event.publish( 'username:changed',{ 
						  'loginstatus'	: false, 
						  'username' 		: 'guest', 
						  'usergroup'		: 'Default' 
					  } );
					  this.event.publish( 'tab:changed', "LoginPage" );
					  localStorage.setItem('SHIVSAHAIuserlogged',"0");
					  this.navCtrl.setRoot(LoginPage);
				} */
	}
	ionViewWillEnter(): void {
		//this.liverates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates'));
		this.oldliverates = this.liverates;
		this.events.subscribe('liverate:changed', (liverate) => {
			this.oldliverates = this.liverates;
			this.liverates = liverate;
			if (localStorage.getItem('MAHARAJ_trade_enable') == "0") {
				this.presentToast();
				this.events.publish('tab:changed', "HomePage");
				this.navCtrl.setRoot(HomePage);
			}
		});
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
		//this.events.subscribe('marketstatus:changed');
		//this.events.subscribe('liverate:changed');

	}
	presentToast() {
		this.liverates = undefined;
		console.log(1);
		this.events.unsubscribe('liverate:changed', this.liverates);
		console.log(2);
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
	gotoHomePage() {
		this.events.publish('tab:changed', "HomePage");
		this.navCtrl.setRoot(HomePage);
	}
	segmentChanged(e) {
		this.seg = e.value;
	}
}
