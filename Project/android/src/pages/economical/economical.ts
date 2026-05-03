import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, LoadingController, ToastController, Events, Platform } from 'ionic-angular';
import { CommonServiceProvider } from '../../providers/common-service/common-service';
import { LiveratesProvider } from '../../providers/liverates/liverates';
import { Network } from '@ionic-native/network';

@Component({
  selector: 'page-economical',
  templateUrl: 'economical.html',
})
export class EconomicCalenderPage {

  loader: boolean = true;

  constructor(public navCtrl: NavController, private network: Network, private commonservice: CommonServiceProvider, private zone: NgZone, private platform: Platform, public alertCtrl: AlertController, private loadingCtrl: LoadingController, public toastCtrl: ToastController, public events: Events, public liverateservice: LiveratesProvider) {
    // Simulate loading
    setTimeout(() => { this.zone.run(() => { this.loader = false; }); }, 2000);
  }

}
