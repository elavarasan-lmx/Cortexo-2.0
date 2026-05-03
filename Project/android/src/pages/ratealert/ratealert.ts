import { Component, ViewChild, NgZone } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams, ToastController, LoadingController, Nav, Events } from 'ionic-angular';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { LiveratesProvider } from '../../providers/liverates/liverates';
import { Subscription } from 'rxjs';
import { Platform } from 'ionic-angular';
import { Network } from '@ionic-native/network';
import { HomePage } from '../home/home';

/**
 * Generated class for the RatealertPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-ratealert',
	templateUrl: 'ratealert.html',
})

export class RatealertPage {
	private onResumeSubscription: Subscription;
	liverates: any = [];
	currentcommodity: any = [];
	marketstatus: number = 1;
	requestedalerts: any = [];
	ratealerttollerence: any = [];
	isvalid: any = 0;
	mintolarance: any;
	maxtolarance: any;
	alertraterange: any = "";
	errormsg: any = "";
	curdiff_value: any = "";
	curcomsellrate: any = "";
	curcomsellrate1: any = "";
	old_curcomsellrate: any = "";
	displaycommodity: any = [];
	selected_comid: number = 0;
	ghtolerance: any = 0;
	shtolerance: any = 0;
	gltolerance: any = 0;
	sltolerance: any = 0;
	alertrate: any = 0;
	MAHARAJ_deviceData: any = [];
	requestedalerts_len = 0;
	loading1;
	maxlength: any;

	constructor(public navCtrl: NavController, private network: Network, private commonservice: CommonServiceProvider, private zone: NgZone, platform: Platform, public alertCtrl: AlertController, private loadingCtrl: LoadingController, public toastCtrl: ToastController, public events: Events, public liverateservice: LiveratesProvider) {
		this.MAHARAJ_deviceData = JSON.parse(localStorage.getItem('MAHARAJ_deviceData'));
		this.ghtolerance = parseFloat(localStorage.getItem('MAHARAJ_ghtolerance'));
		this.shtolerance = parseFloat(localStorage.getItem('MAHARAJ_shtolerance'));
		this.gltolerance = parseFloat(localStorage.getItem('MAHARAJ_gltolerance'));
		this.sltolerance = parseFloat(localStorage.getItem('MAHARAJ_sltolerance'));
		console.log(this.gltolerance + "\t" + this.ghtolerance + "\n" + this.sltolerance + "\t" + this.shtolerance);
	}
	ionViewWillEnter(): void {
		this.events.subscribe('marketstatus:changed', (marketstatus) => {
			this.marketstatus = marketstatus;
			if (this.marketstatus == 0) {
				this.liverates = [];
				let toastController = this.toastCtrl;
				toastController.create({
					message: "Market Off",
					duration: 3000
				}).present();
				this.events.publish('tab:changed', "HomePage");
				this.navCtrl.setRoot(HomePage);
			}
		});
		this.events.subscribe('liverate:changed', (liverate) => {
			// Filter out commodities with sell rate disabled
			this.liverates = (liverate || []).filter(c => c.selling_rate != '-' && c.selling_rate != '' && c.selling_rate != 0);
			if (this.selected_comid != 0 && this.marketstatus == 1) {
				let selectedcomid = this.selected_comid;
				let currentrate: any;
				let currentcommodity: any;
				this.liverates.forEach(function (rcval, rckey) {
					if (rcval['com_id'] == selectedcomid) {
						currentrate = rcval['selling_rate'];
						currentcommodity = rcval;
					}
				});
				this.curcomsellrate = currentrate;
				this.currentcommodity = currentcommodity;
				this.calculatetotal();
			} else {
				this.curcomsellrate = "-";
			}
		});
	}
	ionViewWillLeave(): void {
		this.events.unsubscribe('marketstatus:changed');
		this.events.unsubscribe('liverate:changed');
	}
	ionViewDidEnter() {
		this.selected_comid = 0;
		this.alertraterange = "";
		if (this.liverates.length == 0) {
			let allRates = JSON.parse(localStorage.getItem('MAHARAJ_Liverates')) || [];
			// Filter out commodities with sell rate disabled
			this.liverates = allRates.filter(c => c.selling_rate != '-' && c.selling_rate != '' && c.selling_rate != 0);
		}
		this.commonservice.getratealertlist(this.MAHARAJ_deviceData.uuid).then(result => {
			this.requestedalerts = result.alertdata;
			this.requestedalerts_len = this.requestedalerts.length;
		});
		this.commonservice.getratealerttolerance().subscribe(result => {
			this.ghtolerance = result["gold_high_tol"];
			this.shtolerance = result["silver_high_tol"];
			this.gltolerance = result["gold_low_tol"];
			this.sltolerance = result["silver_low_tol"];

		});
	}

	getAlertDetails(commodity_details) {
		if (this.selected_comid != 0 && this.marketstatus == 1) {
			let selectedcomid = this.selected_comid;
			let currentrate: any;
			this.liverates.forEach(function (rcval, rckey) {
				if (rcval['com_id'] == selectedcomid) {
					currentrate = rcval['selling_rate'];
				}
			});
			this.curcomsellrate = currentrate;
			this.calculatetotal();
		} else {
			this.curcomsellrate = "-";
		}
	}

	updateRate(ev) {
		if (this.selected_comid != 0) {
			this.calculatetotal();
		}
	}

	calculatetotal() {
		this.isvalid = 0;
		this.maxlength = this.curcomsellrate.length;
		if (this.currentcommodity.com_type == 0) {
			if (this.ghtolerance > 0) {
				this.maxtolarance = parseInt((parseFloat(this.curcomsellrate.replace(/,/g, '')) + (parseFloat(this.curcomsellrate.replace(/,/g, '')) * (parseFloat(this.ghtolerance) / 100))).toFixed(2));
				this.curdiff_value = parseInt((this.curcomsellrate.replace(/,/g, '') * (this.ghtolerance / 100)).toFixed(2));
				console.log("maxtolarance: " + this.maxtolarance);
			} else {
				this.maxtolarance = this.curcomsellrate;
				this.curdiff_value = 0;
				console.log("maxtolarance: " + this.maxtolarance);
			}

			if (this.gltolerance > 0) {
				this.mintolarance = parseInt((parseFloat(this.curcomsellrate.replace(/,/g, '')) - (parseFloat(this.curcomsellrate.replace(/,/g, '')) * (parseFloat(this.gltolerance) / 100))).toFixed(2));
				this.curdiff_value = parseInt((this.curcomsellrate.replace(/,/g, '') * (this.gltolerance / 100)).toFixed(2));
				console.log("mintolarance: " + this.mintolarance);
			} else {
				this.mintolarance = this.curcomsellrate;
				this.curdiff_value = 0;
				console.log("mintolarance: " + this.mintolarance);
			}
		} else {
			if (this.shtolerance > 0) {
				this.maxtolarance = parseInt((parseFloat(this.curcomsellrate.replace(/,/g, '')) + (parseFloat(this.curcomsellrate.replace(/,/g, '')) * (parseFloat(this.shtolerance) / 100))).toFixed(2));
				this.curdiff_value = parseFloat((this.curcomsellrate.replace(/,/g, '') * (this.shtolerance / 100)).toFixed(2));
				console.log("maxtolarance: " + this.maxtolarance);
			} else {
				this.maxtolarance = this.curcomsellrate;
				this.curdiff_value = 0;
				console.log("maxtolarance: " + this.maxtolarance);
			}

			if (this.sltolerance > 0) {
				this.mintolarance = parseInt((parseFloat(this.curcomsellrate.replace(/,/g, '')) - (parseFloat(this.curcomsellrate.replace(/,/g, '')) * (parseFloat(this.sltolerance) / 100))).toFixed(2));
				this.curdiff_value = parseFloat((this.curcomsellrate.replace(/,/g, '') * (this.sltolerance / 100)).toFixed(2));
				console.log("mintolarance: " + this.mintolarance);
			} else {
				this.mintolarance = this.curcomsellrate;
				this.curdiff_value = 0;
				console.log("mintolarance: " + this.mintolarance);
			}
		}
		//this.alertraterange = this.mintolarance + " to " + parseInt(parseFloat(this.curcomsellrate.replace(/,/g, '')) + this.curdiff_value);
		this.alertraterange = this.mintolarance + " to " + this.maxtolarance;
		console.log((parseFloat(this.curcomsellrate.replace(/,/g, '')) + parseFloat(this.curdiff_value)));
		if ((this.alertrate >= this.mintolarance) && (this.alertrate <= (parseFloat(this.curcomsellrate.replace(/,/g, '')) + parseFloat(this.curdiff_value)))) {
			this.isvalid = 1;
			this.errormsg = "";
		} else {
			this.isvalid = 0;
			this.errormsg = "Enter alert rate with in " + this.alertraterange;
		}
	}

	postrequest = function () {
		let loading = this.loadingCtrl.create({
			content: 'Please wait...'
		});
		loading.present();

		var alerttype = 0;
		if (this.alertrate > this.curcomsellrate.replace(/,/g, '')) {
			alerttype = 1;
		}

		var customerrequestdetails = {
			'comid': this.selected_comid,
			'alertrate': this.alertrate,
			'devicetoken': this.MAHARAJ_deviceData.pushToken,
			'alerttype': alerttype,
			'uuid': this.MAHARAJ_deviceData.uuid
		};

		this.commonservice.ratealertRequest(customerrequestdetails).then(result => {
			if (result.success) {
				if (result.status == 1) {
					let alert = this.alertCtrl.create({
						title: 'Customer request',
						subTitle: result.message,
						enableBackdropDismiss: false,
						buttons: [
							{
								text: 'Ok',
								handler: data => {
									this.curcomsellrate = "";
									this.alertrate = "";
									this.selected_comid = "";
								}
							}
						]
					});
					alert.present();
					loading.dismiss();
					this.events.publish('tab:changed', "HomePage");
					this.navCtrl.setRoot(HomePage);
					this.errormsg = "";
					this.isvalid = 0;
					this.ionViewDidEnter();
				}
			} else {
				let alert = this.alertCtrl.create({
					title: 'Customer request',
					subTitle: result.message,
					enableBackdropDismiss: false,
					buttons: [
						{
							text: 'Ok',
							handler: data => {
								this.curcomsellrate = "";
								this.alertrate = "";
								this.selected_comid = "";
							}
						}
					]
				});
				alert.present();
				loading.dismiss();
			}
		});
	}

	deletealert(alertdetails) {
		if (alertdetails.status == 0) {
			let alert = this.alertCtrl.create({
				title: 'Rate Alert',
				subTitle: 'Are you sure you want to cancel this alert?',
				enableBackdropDismiss: false,
				buttons: [
					{
						text: 'Ok',
						handler: data => {
							this.delete_rate_alert(alertdetails);
						}
					},
					{
						text: 'cancel',
						handler: data => {

						}
					}
				]
			});
			alert.present();
		} else {
			this.delete_rate_alert(alertdetails);
		}
		console.log(alertdetails);
	}

	delete_rate_alert(alertdetails) {
		let loading = this.loadingCtrl.create({
			content: 'Deleting...'
		});
		loading.present();

		let data = {
			'alertId': alertdetails.reqno,
			'alertType': alertdetails.status,
			'comId': alertdetails.comid,
			'deviceId': this.MAHARAJ_deviceData.pushToken
		};
		this.commonservice.ratealertDelete(data).then(result => {
			if (result.status == 1) {
				if (result.success == true) {
					this.requestedalerts.splice(this.requestedalerts.indexOf(alertdetails), 1);
					loading.dismiss();
					this.navCtrl.setRoot(HomePage, {});
					const toast = this.toastCtrl.create({
						message: result.message,
						duration: 3000
					});
					toast.present();
					console.log(result.message);
				} else {
					this.requestedalerts.splice(this.requestedalerts.indexOf(alertdetails), 1);
					loading.dismiss();
					const toast = this.toastCtrl.create({
						message: result.message,
						duration: 3000
					});
					toast.present();
					console.log(result.message);
				}
			}
		});
	}
}
